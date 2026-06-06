#!/usr/bin/env tsx

import { parseAtomPreviewArgs } from "../src/lib/gemini/atom-preview-generator";
import { validateAtomPreviews } from "../src/lib/gemini/atom-preview-validation";

async function main() {
  const options = parseAtomPreviewArgs(process.argv.slice(2));
  const result = await validateAtomPreviews(options);

  console.log(`Checked: ${result.checked.length}`);
  console.log(`Manifest: ${result.manifestPath}`);

  if (result.errors.length > 0) {
    for (const error of result.errors) {
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
