#!/usr/bin/env tsx

import {
  parseAtomPreviewArgs,
  runAtomPreviewGeneration,
} from "../src/lib/gemini/atom-preview-generator";

async function main() {
  const options = parseAtomPreviewArgs(process.argv.slice(2));
  const result = await runAtomPreviewGeneration(options);

  if (options.dryRun) {
    console.log(`Dry-run planned ${result.planned.length} atom preview(s).`);
    for (const item of result.planned) {
      console.log(`[dry-run] ${item.atomId} -> ${item.previewImagePath}`);
      console.log(item.prompt);
      console.log("---");
    }
    return;
  }

  console.log(
    [
      `Generated: ${result.generated.length}`,
      `Skipped: ${result.skipped.length}`,
      `Failed: ${result.failed.length}`,
      `Manifest: ${result.manifestPath}`,
      `Log: ${result.logPath}`,
    ].join("\n"),
  );

  if (result.failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
