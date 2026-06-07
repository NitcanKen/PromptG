import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { atomInputSchema, type AtomInput } from "@/lib/validation/atoms";
import { CATEGORIES } from "@/lib/constants";
import { EXPANDED_ATOMS } from "@/lib/seed/expanded-atoms";
import {
  isFullV2Category,
  isMainScopeCategory,
} from "@/lib/seed/expanded-atom-targets";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";
import { buildAtomPreviewPrompt } from "@/lib/gemini/atom-preview-prompt-compiler";

export { buildAtomPreviewPrompt } from "@/lib/gemini/atom-preview-prompt-compiler";

export const ATOM_PREVIEW_MODEL = "gpt-image-2";
export const DEFAULT_ATOM_PREVIEW_BASE_URL = "https://token.mmh1.top";
export const DEFAULT_ATOM_PREVIEW_OUTPUT_DIR = path.join(
  process.cwd(),
  "data",
  "uploads",
  "atom-previews",
);
export const DEFAULT_ATOM_PREVIEW_CONCURRENCY = 4;
export const DEFAULT_ATOM_PREVIEW_RPM = 72;
export const DEFAULT_ATOM_PREVIEW_MAX_RETRIES = 3;
export const DEFAULT_ATOM_PREVIEW_REQUEST_TIMEOUT_MS = 120_000;
const execFileAsync = promisify(execFile);

type AtomPreviewMimeType = "image/png" | "image/jpeg" | "image/webp";
type AtomPreviewScope = "main" | "v2";
type AtomPreviewTarget = AtomInput & { id: string };

export type AtomPreviewGenerateRequest = {
  model: string;
  prompt: string;
  atom: AtomPreviewTarget;
};

export type AtomPreviewGenerateResult = {
  bytes: Uint8Array;
  mimeType: AtomPreviewMimeType;
  providerText?: string;
};

export type AtomPreviewClient = {
  generate: (request: AtomPreviewGenerateRequest) => Promise<AtomPreviewGenerateResult>;
};

export type AtomPreviewCliOptions = {
  dryRun?: boolean;
  scope?: AtomPreviewScope;
  category?: string;
  ids?: string[];
  samplePerCategory?: number;
  limit?: number;
  force?: boolean;
  outputDir?: string;
  concurrency?: number;
  rpm?: number;
  maxRetries?: number;
  requestTimeoutMs?: number;
  runId?: string;
};

export type RunAtomPreviewGenerationOptions = AtomPreviewCliOptions & {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  client?: AtomPreviewClient;
  sleep?: (ms: number) => Promise<void>;
};

type ManifestAtomEntry = {
  atomId: string;
  category: string;
  title: string;
  status: "generated" | "skipped_existing" | "failed";
  attempts: number;
  sourcePromptHash: string;
  previewPromptHash: string;
  previewPrompt: string;
  provider: string;
  model: string;
  previewImagePath: string;
  filePath: string;
  fileSize: number;
  generatedAt?: string;
  qaStatus: "pending_review" | "approved" | "regenerate" | "compiler-fix-required" | "do-not-generate";
  qaNotes: string;
  mimeType?: AtomPreviewMimeType;
  providerText?: string;
  error?: string;
  updatedAt: string;
};

type AtomPreviewManifest = {
  version: 1;
  model: string;
  updatedAt: string;
  atoms: Record<string, ManifestAtomEntry>;
};

type PlannedAtomPreview = {
  atomId: string;
  category: string;
  title: string;
  outputPath: string;
  previewImagePath: string;
  prompt: string;
};

type RunResult = {
  planned: PlannedAtomPreview[];
  generated: string[];
  skipped: string[];
  failed: Array<{ atomId: string; error: string }>;
  manifestPath: string;
  logPath: string;
};

type RetryableError = Error & {
  status?: number;
};

function assertPositiveInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${label} 必須是正整數`);
  }
}

function parsePositiveInteger(raw: string, label: string) {
  const value = Number(raw);
  assertPositiveInteger(value, label);
  return value;
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

function splitIds(raw: string) {
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function parseAtomPreviewArgs(argv: string[]): AtomPreviewCliOptions {
  const options: AtomPreviewCliOptions = {
    dryRun: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = (label: string) => {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`缺少 ${label} 參數值`);
      }
      index += 1;
      return value;
    };

    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--all-main") {
      options.scope = "main";
    } else if (arg === "--all-v2") {
      options.scope = "v2";
    } else if (arg === "--category") {
      options.category = readValue("--category");
    } else if (arg.startsWith("--category=")) {
      options.category = arg.slice("--category=".length);
    } else if (arg === "--ids") {
      options.ids = splitIds(readValue("--ids"));
    } else if (arg.startsWith("--ids=")) {
      options.ids = splitIds(arg.slice("--ids=".length));
    } else if (arg === "--sample-per-category") {
      const next = argv[index + 1];
      if (next && !next.startsWith("--")) {
        options.samplePerCategory = parsePositiveInteger(next, "--sample-per-category");
        index += 1;
      } else {
        options.samplePerCategory = 1;
      }
    } else if (arg.startsWith("--sample-per-category=")) {
      options.samplePerCategory = parsePositiveInteger(
        arg.slice("--sample-per-category=".length),
        "--sample-per-category",
      );
    } else if (arg === "--limit") {
      options.limit = parsePositiveInteger(readValue("--limit"), "--limit");
    } else if (arg.startsWith("--limit=")) {
      options.limit = parsePositiveInteger(arg.slice("--limit=".length), "--limit");
    } else if (arg === "--concurrency") {
      options.concurrency = parsePositiveInteger(readValue("--concurrency"), "--concurrency");
    } else if (arg.startsWith("--concurrency=")) {
      options.concurrency = parsePositiveInteger(arg.slice("--concurrency=".length), "--concurrency");
    } else if (arg === "--rpm") {
      options.rpm = parsePositiveInteger(readValue("--rpm"), "--rpm");
    } else if (arg.startsWith("--rpm=")) {
      options.rpm = parsePositiveInteger(arg.slice("--rpm=".length), "--rpm");
    } else if (arg === "--request-timeout-ms") {
      options.requestTimeoutMs = parsePositiveInteger(readValue("--request-timeout-ms"), "--request-timeout-ms");
    } else if (arg.startsWith("--request-timeout-ms=")) {
      options.requestTimeoutMs = parsePositiveInteger(
        arg.slice("--request-timeout-ms=".length),
        "--request-timeout-ms",
      );
    } else if (arg === "--output-dir") {
      options.outputDir = readValue("--output-dir");
    } else if (arg.startsWith("--output-dir=")) {
      options.outputDir = arg.slice("--output-dir=".length);
    } else {
      throw new Error(`不支援的參數：${arg}`);
    }
  }

  return options;
}

export function selectAtomPreviewTargets(
  options: Pick<AtomPreviewCliOptions, "scope" | "category" | "ids" | "samplePerCategory" | "limit">,
) {
  const ids = new Set(options.ids ?? []);
  let atoms = getApprovedPreviewAtoms();

  if (options.scope === "main") {
    atoms = atoms.filter((atom) => isMainScopeCategory(atom.category));
  } else if (options.scope === "v2") {
    atoms = atoms.filter((atom) => isFullV2Category(atom.category));
  }

  if (options.category) {
    atoms = atoms.filter((atom) => atom.category === options.category);
  }

  if (ids.size > 0) {
    atoms = atoms.filter((atom) => ids.has(atom.id));
  }

  if (options.samplePerCategory) {
    atoms = selectSamplesPerCategory(atoms, options.samplePerCategory);
  }

  if (options.limit) {
    atoms = atoms.slice(0, options.limit);
  }

  return atoms;
}

function getApprovedPreviewAtoms(): AtomPreviewTarget[] {
  return [
    ...new Map(
      [...SEED_ATOMS, ...EXPANDED_ATOMS].map((atom) => [atom.id, normalizeAtomPreviewTarget(atom)]),
    ).values(),
  ];
}

function normalizeAtomPreviewTarget(atom: { id: string } & Partial<AtomInput>) {
  const { id, ...input } = atom;
  return {
    id,
    ...atomInputSchema.parse(input),
  };
}

function selectSamplesPerCategory(atoms: AtomPreviewTarget[], perCategory: number) {
  assertPositiveInteger(perCategory, "--sample-per-category");
  const selected: AtomPreviewTarget[] = [];

  for (const category of CATEGORIES) {
    let count = 0;
    for (const atom of atoms) {
      if (atom.category !== category) {
        continue;
      }
      selected.push(atom);
      count += 1;
      if (count >= perCategory) {
        break;
      }
    }
  }

  return selected;
}

function shortHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function getSourcePromptHash(atom: AtomPreviewTarget) {
  return shortHash(
    JSON.stringify({
      category: atom.category,
      title: atom.title,
      subtitle: atom.subtitle,
      prompt: atom.prompt,
      negativePrompt: atom.negativePrompt,
    }),
  );
}

function getPreviewPaths(outputDir: string, atomId: string, previewPromptHash: string) {
  return {
    outputPath: path.join(outputDir, atomId, `${previewPromptHash}.png`),
    previewImagePath: `/api/uploads/atom-previews/${atomId}/${previewPromptHash}.png`,
  };
}

function buildManifestEntry(
  atom: AtomPreviewTarget,
  params: {
    status: ManifestAtomEntry["status"];
    attempts: number;
    previewPrompt: string;
    model: string;
    previewImagePath: string;
    filePath: string;
    fileSize: number;
    updatedAt: string;
    generatedAt?: string;
    qaStatus?: ManifestAtomEntry["qaStatus"];
    qaNotes?: string;
    mimeType?: AtomPreviewMimeType;
    providerText?: string;
    error?: string;
  },
): ManifestAtomEntry {
  return {
    atomId: atom.id,
    category: atom.category,
    title: atom.title,
    status: params.status,
    attempts: params.attempts,
    sourcePromptHash: getSourcePromptHash(atom),
    previewPromptHash: shortHash(params.previewPrompt),
    previewPrompt: params.previewPrompt,
    provider: "GPT-Image-2",
    model: params.model,
    previewImagePath: params.previewImagePath,
    filePath: params.filePath,
    fileSize: params.fileSize,
    generatedAt: params.generatedAt,
    qaStatus: params.qaStatus ?? "pending_review",
    qaNotes: params.qaNotes ?? "",
    mimeType: params.mimeType,
    providerText: params.providerText,
    error: params.error,
    updatedAt: params.updatedAt,
  };
}

function createEmptyManifest(): AtomPreviewManifest {
  return {
    version: 1,
    model: ATOM_PREVIEW_MODEL,
    updatedAt: new Date().toISOString(),
    atoms: {},
  };
}

async function readManifest(manifestPath: string): Promise<AtomPreviewManifest> {
  const text = await fs.readFile(manifestPath, "utf8").catch(() => "");
  if (!text) {
    return createEmptyManifest();
  }

  try {
    const parsed = JSON.parse(text) as AtomPreviewManifest;
    return {
      ...createEmptyManifest(),
      ...parsed,
      atoms: parsed.atoms ?? {},
    };
  } catch {
    return createEmptyManifest();
  }
}

async function writeManifest(manifestPath: string, manifest: AtomPreviewManifest) {
  manifest.updatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function appendLog(logPath: string, event: Record<string, unknown>) {
  await fs.appendFile(logPath, `${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n`);
}

async function fileExists(filePath: string) {
  return fs
    .stat(filePath)
    .then((stat) => stat.isFile())
    .catch(() => false);
}

async function fileSize(filePath: string) {
  return fs
    .stat(filePath)
    .then((stat) => stat.size)
    .catch(() => 0);
}

async function writePreviewImage(
  outputPath: string,
  result: AtomPreviewGenerateResult,
): Promise<AtomPreviewMimeType> {
  if (result.mimeType === "image/png") {
    await fs.writeFile(outputPath, result.bytes);
    return "image/png" satisfies AtomPreviewMimeType;
  }

  const extension = result.mimeType === "image/webp" ? "webp" : "jpg";
  const sourcePath = `${outputPath}.provider.${extension}`;
  await fs.writeFile(sourcePath, result.bytes);

  try {
    await execFileAsync("sips", ["-s", "format", "png", sourcePath, "--out", outputPath]);
  } finally {
    await fs.rm(sourcePath, { force: true });
  }

  return "image/png" satisfies AtomPreviewMimeType;
}

async function getAtomPreviewApiKey(options: RunAtomPreviewGenerationOptions) {
  await loadAtomPreviewEnvFromLocalFile();
  const key =
    options.apiKey ??
    process.env.ATOM_PREVIEW_API_KEY ??
    process.env.GPT_IMAGE_API_KEY ??
    process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("缺少圖片生成 API key，請設定 ATOM_PREVIEW_API_KEY。");
  }
  return key;
}

function parseEnvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!match) {
    return null;
  }

  const [, key, rawValue] = match;
  const value = rawValue.replace(/^['"]|['"]$/g, "");
  return { key, value };
}

export async function loadAtomPreviewEnvFromLocalFile(envPath = path.join(process.cwd(), ".env.local")) {
  if (process.env.ATOM_PREVIEW_API_KEY && process.env.ATOM_PREVIEW_BASE_URL) {
    return;
  }

  const text = await fs.readFile(envPath, "utf8").catch(() => "");
  if (!text) {
    return;
  }

  for (const line of text.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (
      !parsed ||
      ![
        "ATOM_PREVIEW_API_KEY",
        "ATOM_PREVIEW_BASE_URL",
        "ATOM_PREVIEW_MODEL",
        "GPT_IMAGE_API_KEY",
        "GPT_IMAGE_BASE_URL",
        "GPT_IMAGE_MODEL",
      ].includes(parsed.key)
    ) {
      continue;
    }

    process.env[parsed.key] = parsed.value;
  }
}

function normalizePreviewGenerationError(error: unknown): RetryableError {
  if (error instanceof Error) {
    return error as RetryableError;
  }
  return new Error(String(error));
}

function isRetryable(error: RetryableError) {
  return !error.status || [429, 500, 502, 503].includes(error.status);
}

async function generateWithRetries(
  client: AtomPreviewClient,
  request: AtomPreviewGenerateRequest,
  options: Required<Pick<RunAtomPreviewGenerationOptions, "maxRetries" | "sleep">>,
) {
  let lastError: RetryableError | null = null;

  for (let attempt = 1; attempt <= options.maxRetries; attempt += 1) {
    try {
      const result = await client.generate(request);
      return { result, attempts: attempt };
    } catch (error) {
      lastError = normalizePreviewGenerationError(error);
      if (attempt >= options.maxRetries || !isRetryable(lastError)) {
        break;
      }
      await options.sleep(Math.min(30_000, 1000 * 2 ** (attempt - 1)));
    }
  }

  throw lastError ?? new Error("圖片生成失敗");
}

function createRateLimiter(rpm: number, sleep: (ms: number) => Promise<void>) {
  const intervalMs = Math.ceil(60_000 / rpm);
  let nextAt = 0;

  return async () => {
    const now = Date.now();
    const waitMs = Math.max(0, nextAt - now);
    nextAt = Math.max(now, nextAt) + intervalMs;
    if (waitMs > 0) {
      await sleep(waitMs);
    }
  };
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      await worker(item);
    }
  });

  await Promise.all(workers);
}

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  output?: Array<{
    result?: string;
    b64_json?: string;
    url?: string;
  }>;
};

function normalizeOpenAIImageBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

async function extractOpenAICompatibleImage(
  response: OpenAIImageResponse,
  timeoutMs = DEFAULT_ATOM_PREVIEW_REQUEST_TIMEOUT_MS,
): Promise<AtomPreviewGenerateResult> {
  const dataImage = response.data?.find((item) => item.b64_json || item.url);
  const outputImage = response.output?.find((item) => item.b64_json || item.result || item.url);
  const base64 = dataImage?.b64_json ?? outputImage?.b64_json ?? outputImage?.result;
  const url = dataImage?.url ?? outputImage?.url;

  if (base64) {
    return {
      bytes: Buffer.from(base64, "base64"),
      mimeType: "image/png" satisfies AtomPreviewMimeType,
    };
  }

  if (url) {
    const timeout = createTimeoutSignal(timeoutMs);
    const imageResponse = await fetch(url, { signal: timeout.signal }).finally(timeout.clear);
    if (!imageResponse.ok) {
      const error = new Error(`圖片下載失敗，HTTP ${imageResponse.status}`) as RetryableError;
      error.status = imageResponse.status;
      throw error;
    }

    const contentType = imageResponse.headers.get("Content-Type") ?? "image/png";
    return {
      bytes: Buffer.from(await imageResponse.arrayBuffer()),
      mimeType: contentType.includes("webp")
        ? ("image/webp" as const)
        : contentType.includes("jpeg") || contentType.includes("jpg")
          ? ("image/jpeg" as const)
          : ("image/png" as const),
    };
  }

  throw new Error("圖片生成回應沒有包含圖片資料");
}

export function createOpenAICompatibleImageClient(
  apiKey: string,
  baseUrl: string,
  requestTimeoutMs = DEFAULT_ATOM_PREVIEW_REQUEST_TIMEOUT_MS,
): AtomPreviewClient {
  return {
    async generate(request) {
      const timeout = createTimeoutSignal(requestTimeoutMs);
      const response = await fetch(`${normalizeOpenAIImageBaseUrl(baseUrl)}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: timeout.signal,
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json",
        }),
      }).finally(timeout.clear);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const error = new Error(
          `圖片生成請求失敗，HTTP ${response.status}${text ? `: ${text.slice(0, 240)}` : ""}`,
        ) as RetryableError;
        error.status = response.status;
        throw error;
      }

      return extractOpenAICompatibleImage((await response.json()) as OpenAIImageResponse, requestTimeoutMs);
    },
  };
}

export async function runAtomPreviewGeneration(
  options: RunAtomPreviewGenerationOptions = {},
): Promise<RunResult> {
  const outputDir = options.outputDir ?? DEFAULT_ATOM_PREVIEW_OUTPUT_DIR;
  const manifestPath = path.join(outputDir, "manifest.json");
  const runId = options.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
  const logPath = path.join(outputDir, "logs", `${runId}.jsonl`);
  const concurrency = options.concurrency ?? DEFAULT_ATOM_PREVIEW_CONCURRENCY;
  const rpm = options.rpm ?? DEFAULT_ATOM_PREVIEW_RPM;
  const maxRetries = options.maxRetries ?? DEFAULT_ATOM_PREVIEW_MAX_RETRIES;
  const requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_ATOM_PREVIEW_REQUEST_TIMEOUT_MS;
  await loadAtomPreviewEnvFromLocalFile();
  const model = options.model ?? process.env.ATOM_PREVIEW_MODEL ?? process.env.GPT_IMAGE_MODEL ?? ATOM_PREVIEW_MODEL;
  const baseUrl =
    options.baseUrl ??
    process.env.ATOM_PREVIEW_BASE_URL ??
    process.env.GPT_IMAGE_BASE_URL ??
    DEFAULT_ATOM_PREVIEW_BASE_URL;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const targets = selectAtomPreviewTargets(options);
  const planned = targets.map((atom) => {
    const prompt = buildAtomPreviewPrompt(atom);
    const paths = getPreviewPaths(outputDir, atom.id, shortHash(prompt));
    return {
      atomId: atom.id,
      category: atom.category,
      title: atom.title,
      outputPath: paths.outputPath,
      previewImagePath: paths.previewImagePath,
      prompt,
    };
  });

  assertPositiveInteger(concurrency, "--concurrency");
  assertPositiveInteger(rpm, "--rpm");
  assertPositiveInteger(maxRetries, "--max-retries");
  assertPositiveInteger(requestTimeoutMs, "--request-timeout-ms");

  if (options.dryRun) {
    return {
      planned,
      generated: [],
      skipped: [],
      failed: [],
      manifestPath,
      logPath,
    };
  }

  await fs.mkdir(path.join(outputDir, "logs"), { recursive: true });
  const manifest = await readManifest(manifestPath);
  manifest.model = model;
  const client =
    options.client ?? createOpenAICompatibleImageClient(await getAtomPreviewApiKey(options), baseUrl, requestTimeoutMs);
  const waitForRateLimit = createRateLimiter(rpm, sleep);
  const generated: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ atomId: string; error: string }> = [];

  await runWithConcurrency(targets, concurrency, async (atom) => {
    const prompt = buildAtomPreviewPrompt(atom);
    const { outputPath, previewImagePath } = getPreviewPaths(outputDir, atom.id, shortHash(prompt));
    const now = new Date().toISOString();

    if (!options.force && (await fileExists(outputPath))) {
      const size = await fileSize(outputPath);
      const previousGeneratedAt = manifest.atoms[atom.id]?.generatedAt;
      manifest.atoms[atom.id] = buildManifestEntry(atom, {
        status: "skipped_existing",
        attempts: 0,
        previewPrompt: prompt,
        model,
        previewImagePath,
        filePath: outputPath,
        fileSize: size,
        generatedAt: previousGeneratedAt ?? now,
        mimeType: "image/png",
        updatedAt: now,
      });
      skipped.push(atom.id);
      await writeManifest(manifestPath, manifest);
      await appendLog(logPath, {
        atomId: atom.id,
        status: "skipped_existing",
        fileSize: size,
      });
      return;
    }

    try {
      await waitForRateLimit();
      const { result, attempts } = await generateWithRetries(
        client,
        {
          model,
          prompt,
          atom,
        },
        { maxRetries, sleep },
      );
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      const writtenMimeType = await writePreviewImage(outputPath, result);
      const size = await fileSize(outputPath);
      const generatedAt = new Date().toISOString();

      manifest.atoms[atom.id] = buildManifestEntry(atom, {
        status: "generated",
        attempts,
        previewPrompt: prompt,
        model,
        previewImagePath,
        filePath: outputPath,
        fileSize: size,
        generatedAt,
        mimeType: writtenMimeType,
        providerText: result.providerText,
        updatedAt: generatedAt,
      });
      generated.push(atom.id);
      await writeManifest(manifestPath, manifest);
      await appendLog(logPath, {
        atomId: atom.id,
        status: "generated",
        attempts,
        fileSize: size,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      manifest.atoms[atom.id] = buildManifestEntry(atom, {
        status: "failed",
        attempts: maxRetries,
        previewPrompt: prompt,
        model,
        previewImagePath,
        filePath: outputPath,
        fileSize: 0,
        error: message,
        qaStatus: "regenerate",
        qaNotes: "Provider request failed before an image was generated; retry only after provider availability is fixed.",
        updatedAt: new Date().toISOString(),
      });
      failed.push({ atomId: atom.id, error: message });
      await writeManifest(manifestPath, manifest);
      await appendLog(logPath, {
        atomId: atom.id,
        status: "failed",
        error: message,
      });
    }
  });

  return {
    planned,
    generated,
    skipped,
    failed,
    manifestPath,
    logPath,
  };
}
