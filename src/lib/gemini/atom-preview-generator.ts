import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { ExpandedAtom } from "@/lib/seed/expanded-atoms";
import { EXPANDED_ATOMS } from "@/lib/seed/expanded-atoms";

export const ATOM_PREVIEW_MODEL = "gemini-3.1-flash-image";
export const DEFAULT_ATOM_PREVIEW_OUTPUT_DIR = path.join(
  process.cwd(),
  "data",
  "uploads",
  "atom-previews",
);
export const DEFAULT_ATOM_PREVIEW_CONCURRENCY = 4;
export const DEFAULT_ATOM_PREVIEW_RPM = 72;
export const DEFAULT_ATOM_PREVIEW_MAX_RETRIES = 3;
const execFileAsync = promisify(execFile);

type AtomPreviewMimeType = "image/png" | "image/jpeg" | "image/webp";

export type AtomPreviewGenerateRequest = {
  model: string;
  prompt: string;
  atom: ExpandedAtom;
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
  category?: string;
  ids?: string[];
  limit?: number;
  force?: boolean;
  outputDir?: string;
  concurrency?: number;
  rpm?: number;
  maxRetries?: number;
  runId?: string;
};

export type RunAtomPreviewGenerationOptions = AtomPreviewCliOptions & {
  apiKey?: string;
  client?: AtomPreviewClient;
  sleep?: (ms: number) => Promise<void>;
};

type ManifestAtomEntry = {
  atomId: string;
  category: string;
  title: string;
  status: "generated" | "skipped_existing" | "failed";
  attempts: number;
  previewImagePath: string;
  filePath: string;
  fileSize: number;
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
    } else if (arg === "--category") {
      options.category = readValue("--category");
    } else if (arg.startsWith("--category=")) {
      options.category = arg.slice("--category=".length);
    } else if (arg === "--ids") {
      options.ids = splitIds(readValue("--ids"));
    } else if (arg.startsWith("--ids=")) {
      options.ids = splitIds(arg.slice("--ids=".length));
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

export function selectAtomPreviewTargets(options: Pick<AtomPreviewCliOptions, "category" | "ids" | "limit">) {
  const ids = new Set(options.ids ?? []);
  let atoms = EXPANDED_ATOMS;

  if (options.category) {
    atoms = atoms.filter((atom) => atom.category === options.category);
  }

  if (ids.size > 0) {
    atoms = atoms.filter((atom) => ids.has(atom.id));
  }

  if (options.limit) {
    atoms = atoms.slice(0, options.limit);
  }

  return atoms;
}

export function buildAtomPreviewPrompt(atom: ExpandedAtom) {
  const visualVariation = getVisualVariation(atom.id);
  const categoryAddition =
    atom.category === "髮型"
      ? "\nCategory-specific instruction: close portrait or upper-body crop focused on hair shape. Keep outfit and background neutral."
      : "";

  return `Create a square 1:1 reference image for a PromptG prompt atom library card.
The image should clearly visualize this single atom concept:
Category: ${atom.category}
Title: ${atom.title}
Description: ${atom.subtitle}
Prompt fragment: ${atom.prompt}

Use an Eastern aesthetic by default: contemporary East Asian photography, natural styling, refined everyday visual taste.
If the atom explicitly describes Western, European, American, non-Eastern, or non-human content, follow the atom instead.
Keep the image focused on this atom only. Do not overbuild a full scene unless the category is a scene, platform, layout, or post-processing category.
Use a generic adult subject when a person is needed.
No celebrity likeness, no brand logo, no copyrighted character, no extra text, no watermark-like text.
Avoid reusing the same face, pose, outfit, or background across the whole atom preview library.
For this atom, use this controlled variation: ${visualVariation}.
Clean composition, visually readable at small card size.${categoryAddition}`;
}

function getVisualVariation(atomId: string) {
  const variations = [
    "soft window-lit studio wall, calm neutral styling",
    "minimal city street portrait crop, subdued background",
    "clean cafe window corner, shallow depth of field",
    "simple outdoor greenery blur, natural daylight",
    "plain editorial backdrop, cool refined styling",
    "warm indoor hallway light, understated wardrobe",
    "bright lifestyle portrait crop, uncluttered background",
    "low-saturation film portrait feel, quiet urban texture",
  ];
  const checksum = Array.from(atomId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return variations[checksum % variations.length];
}

function getPreviewPaths(outputDir: string, atomId: string) {
  return {
    outputPath: path.join(outputDir, `${atomId}.png`),
    previewImagePath: `/api/uploads/atom-previews/${atomId}.png`,
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

async function getGeminiApiKey(options: RunAtomPreviewGenerationOptions) {
  await loadGeminiApiKeyFromLocalEnv();
  const key = options.apiKey ?? process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error("缺少 Gemini API key，請設定 GEMINI_API_KEY 或 GOOGLE_API_KEY。");
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

export async function loadGeminiApiKeyFromLocalEnv(envPath = path.join(process.cwd(), ".env.local")) {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    return;
  }

  const text = await fs.readFile(envPath, "utf8").catch(() => "");
  if (!text) {
    return;
  }

  for (const line of text.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed || (parsed.key !== "GEMINI_API_KEY" && parsed.key !== "GOOGLE_API_KEY")) {
      continue;
    }

    process.env[parsed.key] = parsed.value;
  }
}

function normalizeGeminiError(error: unknown): RetryableError {
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
      lastError = normalizeGeminiError(error);
      if (attempt >= options.maxRetries || !isRetryable(lastError)) {
        break;
      }
      await options.sleep(Math.min(30_000, 1000 * 2 ** (attempt - 1)));
    }
  }

  throw lastError ?? new Error("Gemini 生成失敗");
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

function extractInlineImage(response: GeminiRestResponse): AtomPreviewGenerateResult {
  const parts = response.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
  const providerText = parts
    .map((part) => part.text)
    .filter((text): text is string => Boolean(text))
    .join("\n");
  const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  const inlineData = imagePart?.inlineData
    ? {
        data: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
      }
    : {
        data: imagePart?.inline_data?.data,
        mimeType: imagePart?.inline_data?.mime_type,
      };

  if (!inlineData?.data) {
    throw new Error("Gemini 回應沒有包含圖片資料");
  }

  return {
    bytes: Buffer.from(inlineData.data, "base64"),
    mimeType: (inlineData.mimeType ?? "image/png") as AtomPreviewMimeType,
    providerText,
  };
}

type GeminiRestResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          data?: string;
          mimeType?: string;
        };
        inline_data?: {
          data?: string;
          mime_type?: string;
        };
      }>;
    };
  }>;
};

export function createGeminiRestClient(apiKey: string): AtomPreviewClient {
  return {
    async generate(request) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${request.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: request.prompt }],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const error = new Error(`Gemini 生成請求失敗，HTTP ${response.status}`) as RetryableError;
        error.status = response.status;
        throw error;
      }

      return extractInlineImage((await response.json()) as GeminiRestResponse);
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
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const targets = selectAtomPreviewTargets(options);
  const planned = targets.map((atom) => {
    const paths = getPreviewPaths(outputDir, atom.id);
    return {
      atomId: atom.id,
      category: atom.category,
      title: atom.title,
      outputPath: paths.outputPath,
      previewImagePath: paths.previewImagePath,
      prompt: buildAtomPreviewPrompt(atom),
    };
  });

  assertPositiveInteger(concurrency, "--concurrency");
  assertPositiveInteger(rpm, "--rpm");
  assertPositiveInteger(maxRetries, "--max-retries");

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
  const client = options.client ?? createGeminiRestClient(await getGeminiApiKey(options));
  const waitForRateLimit = createRateLimiter(rpm, sleep);
  const generated: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ atomId: string; error: string }> = [];

  await runWithConcurrency(targets, concurrency, async (atom) => {
    const prompt = buildAtomPreviewPrompt(atom);
    const { outputPath, previewImagePath } = getPreviewPaths(outputDir, atom.id);
    const now = new Date().toISOString();

    if (!options.force && (await fileExists(outputPath))) {
      const size = await fileSize(outputPath);
      manifest.atoms[atom.id] = {
        atomId: atom.id,
        category: atom.category,
        title: atom.title,
        status: "skipped_existing",
        attempts: 0,
        previewImagePath,
        filePath: outputPath,
        fileSize: size,
        mimeType: "image/png",
        updatedAt: now,
      };
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
          model: ATOM_PREVIEW_MODEL,
          prompt,
          atom,
        },
        { maxRetries, sleep },
      );
      const writtenMimeType = await writePreviewImage(outputPath, result);
      const size = await fileSize(outputPath);

      manifest.atoms[atom.id] = {
        atomId: atom.id,
        category: atom.category,
        title: atom.title,
        status: "generated",
        attempts,
        previewImagePath,
        filePath: outputPath,
        fileSize: size,
        mimeType: writtenMimeType,
        providerText: result.providerText,
        updatedAt: new Date().toISOString(),
      };
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
      manifest.atoms[atom.id] = {
        atomId: atom.id,
        category: atom.category,
        title: atom.title,
        status: "failed",
        attempts: maxRetries,
        previewImagePath,
        filePath: outputPath,
        fileSize: 0,
        error: message,
        updatedAt: new Date().toISOString(),
      };
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
