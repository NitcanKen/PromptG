#!/usr/bin/env tsx

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_ATOM_PREVIEW_OUTPUT_DIR,
  buildAtomPreviewPrompt,
  parseAtomPreviewArgs,
  runAtomPreviewGeneration,
  selectAtomPreviewTargets,
  type AtomPreviewCliOptions,
} from "../src/lib/gemini/atom-preview-generator";

type ManifestEntry = {
  atomId: string;
  status?: string;
  filePath?: string;
  previewPromptHash?: string;
};

type Manifest = {
  atoms?: Record<string, ManifestEntry>;
};

type RunnerOptions = AtomPreviewCliOptions & {
  batchSize: number;
};

function shortHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function parseRunnerArgs(argv: string[]): RunnerOptions {
  const generatorArgs: string[] = [];
  let batchSize = 50;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--batch-size") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("缺少 --batch-size 參數值");
      }
      batchSize = Number(value);
      index += 1;
    } else if (arg.startsWith("--batch-size=")) {
      batchSize = Number(arg.slice("--batch-size=".length));
    } else {
      generatorArgs.push(arg);
    }
  }

  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new Error("--batch-size 必須是正整數");
  }

  return {
    ...parseAtomPreviewArgs(generatorArgs),
    batchSize,
  };
}

async function readManifest(manifestPath: string): Promise<Manifest> {
  const text = await fs.readFile(manifestPath, "utf8").catch(() => "");
  if (!text) {
    return { atoms: {} };
  }

  try {
    return JSON.parse(text) as Manifest;
  } catch {
    return { atoms: {} };
  }
}

async function fileExists(filePath: string | undefined) {
  if (!filePath) {
    return false;
  }

  return fs
    .stat(filePath)
    .then((stat) => stat.isFile() && stat.size > 0)
    .catch(() => false);
}

async function summarize(outputDir: string, totalTargets: number) {
  const manifest = await readManifest(path.join(outputDir, "manifest.json"));
  const entries = Object.values(manifest.atoms ?? {});
  const status = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.status ?? "unknown"] = (acc[entry.status ?? "unknown"] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalTargets,
    manifestEntries: entries.length,
    generated: status.generated ?? 0,
    skippedExisting: status.skipped_existing ?? 0,
    failed: status.failed ?? 0,
    unattempted: Math.max(0, totalTargets - entries.length),
  };
}

async function writeStatus(
  outputDir: string,
  status: Record<string, unknown>,
) {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "full-generation-status.json"),
    `${JSON.stringify({ ...status, updatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
}

async function getPendingIds(options: RunnerOptions, outputDir: string) {
  const manifest = await readManifest(path.join(outputDir, "manifest.json"));
  const targets = selectAtomPreviewTargets(options);
  const pending: string[] = [];

  for (const atom of targets) {
    const entry = manifest.atoms?.[atom.id];
    const expectedPromptHash = shortHash(buildAtomPreviewPrompt(atom));

    if (
      entry?.status === "generated" &&
      entry.previewPromptHash === expectedPromptHash &&
      (await fileExists(entry.filePath))
    ) {
      continue;
    }

    if (entry?.status === "failed" && entry.previewPromptHash === expectedPromptHash) {
      continue;
    }

    pending.push(atom.id);
  }

  return {
    pending,
    totalTargets: targets.length,
  };
}

async function main() {
  const options = parseRunnerArgs(process.argv.slice(2));
  const outputDir = options.outputDir ?? DEFAULT_ATOM_PREVIEW_OUTPUT_DIR;
  const startedAt = new Date().toISOString();
  let batchIndex = 0;

  await writeStatus(outputDir, {
    state: "running",
    startedAt,
    batchSize: options.batchSize,
  });

  while (true) {
    const { pending, totalTargets } = await getPendingIds(options, outputDir);
    const summary = await summarize(outputDir, totalTargets);

    await writeStatus(outputDir, {
      state: pending.length === 0 ? "completed" : "running",
      startedAt,
      batchSize: options.batchSize,
      ...summary,
      pending: pending.length,
    });

    if (pending.length === 0) {
      console.log(JSON.stringify({ event: "completed", ...summary }));
      return;
    }

    batchIndex += 1;
    const ids = pending.slice(0, options.batchSize);
    console.log(
      JSON.stringify({
        event: "batch_start",
        batchIndex,
        ids: ids.length,
        remainingBeforeBatch: pending.length,
      }),
    );

    const result = await runAtomPreviewGeneration({
      ...options,
      ids,
      dryRun: false,
      runId: `full-${startedAt.replace(/[:.]/g, "-")}-batch-${String(batchIndex).padStart(3, "0")}`,
    });

    console.log(
      JSON.stringify({
        event: "batch_complete",
        batchIndex,
        generated: result.generated.length,
        skipped: result.skipped.length,
        failed: result.failed.length,
        failedAtoms: result.failed.map((item) => item.atomId),
        logPath: result.logPath,
      }),
    );
  }
}

main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  await writeStatus(DEFAULT_ATOM_PREVIEW_OUTPUT_DIR, {
    state: "error",
    error: message,
  });
  console.error(message);
  process.exitCode = 1;
});
