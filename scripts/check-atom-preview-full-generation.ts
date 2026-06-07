#!/usr/bin/env tsx

import fs from "node:fs";
import path from "node:path";

import {
  DEFAULT_ATOM_PREVIEW_OUTPUT_DIR,
  selectAtomPreviewTargets,
} from "../src/lib/gemini/atom-preview-generator";

type ManifestEntry = {
  atomId: string;
  status?: string;
  filePath?: string;
  qaStatus?: string;
  error?: string;
};

type Manifest = {
  atoms?: Record<string, ManifestEntry>;
};

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function fileExists(filePath: string | undefined) {
  if (!filePath || !fs.existsSync(filePath)) {
    return false;
  }

  return fs.statSync(filePath).isFile() && fs.statSync(filePath).size > 0;
}

function main() {
  const outputDir = DEFAULT_ATOM_PREVIEW_OUTPUT_DIR;
  const manifest = readJson<Manifest>(path.join(outputDir, "manifest.json")) ?? { atoms: {} };
  const status = readJson<Record<string, unknown>>(path.join(outputDir, "full-generation-status.json"));
  const totalTargets = selectAtomPreviewTargets({}).length;
  const entries = Object.values(manifest.atoms ?? {});
  const generated = entries.filter((entry) => entry.status === "generated" && fileExists(entry.filePath));
  const skipped = entries.filter((entry) => entry.status === "skipped_existing" && fileExists(entry.filePath));
  const failed = entries.filter((entry) => entry.status === "failed");
  const missingCount = Math.max(0, totalTargets - generated.length - skipped.length - failed.length);
  const state =
    status?.state === "error" || status?.state === "stopped_by_user"
      ? status.state
      : missingCount === 0
        ? "completed"
        : "running";

  console.log(
    JSON.stringify(
      {
        state,
        totalTargets,
        generated: generated.length,
        skippedExisting: skipped.length,
        failed: failed.length,
        missing: missingCount,
        manifestEntries: entries.length,
        lastRunnerState: status?.state ?? null,
        lastRunnerUpdatedAt: status?.updatedAt ?? null,
        failedAtoms: failed.map((entry) => ({
          atomId: entry.atomId,
          error: entry.error,
        })),
      },
      null,
      2,
    ),
  );
}

main();
