#!/usr/bin/env tsx

import { purgeAtomPreviews } from "@/lib/gemini/atom-preview-purge";

async function main() {
  const result = await purgeAtomPreviews();

  console.log(
    [
      `Removed preview dir: ${result.removedPreviewDir}`,
      `Removed Next image cache: ${result.removedNextImageCache}`,
      `Cleared DB preview paths: ${result.clearedDbRows}`,
    ].join("\n"),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
