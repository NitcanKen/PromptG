#!/usr/bin/env tsx

import { parseAtomPreviewArgs } from "../src/lib/gemini/atom-preview-generator";
import { validateAtomPreviews } from "../src/lib/gemini/atom-preview-validation";

async function main() {
  const rawArgs = process.argv.slice(2);
  const existingOnly = rawArgs.includes("--existing-only");
  const options = parseAtomPreviewArgs(rawArgs.filter((arg) => arg !== "--existing-only"));
  const scopedResult = await validateAtomPreviews({ ...options, existingOnly });

  console.log(`Checked: ${scopedResult.checked.length}`);
  console.log(`Manifest: ${scopedResult.manifestPath}`);

  if (scopedResult.errors.length > 0) {
    for (const error of scopedResult.errors) {
      console.error(error);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Atom preview validation passed.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
