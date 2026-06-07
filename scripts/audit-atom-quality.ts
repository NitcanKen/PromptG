#!/usr/bin/env tsx

import fs from "node:fs/promises";
import path from "node:path";

import { auditAtoms } from "@/lib/atoms/atom-quality-audit";
import { EXPANDED_ATOMS } from "@/lib/seed/expanded-atoms";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

const inventoryJsonPath = "docs/reports/2026-06-07-atom-prompt-quality-inventory.json";
const inventoryMarkdownPath = "docs/reports/2026-06-07-atom-prompt-quality-inventory.md";

function escapeCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

async function main() {
  const atoms = [...new Map([...SEED_ATOMS, ...EXPANDED_ATOMS].map((atom) => [atom.id, atom])).values()];
  const audit = auditAtoms(atoms);

  await fs.mkdir(path.dirname(inventoryJsonPath), { recursive: true });
  await fs.writeFile(inventoryJsonPath, `${JSON.stringify(audit, null, 2)}\n`);

  const markdown = [
    "# Atom Prompt Quality Inventory",
    "",
    "Updated: 2026-06-07 HKT",
    "",
    `Total unique atoms: ${audit.summary.total}`,
    `Flagged atoms: ${audit.summary.flagged}`,
    "",
    "## Flag Summary",
    "",
    "| Flag | Count |",
    "| --- | ---: |",
    ...Object.entries(audit.summary.byFlag).map(([flag, count]) => `| ${flag} | ${count} |`),
    "",
    "## Inventory",
    "",
    "| id | source | category | title | subtitle | prompt | negativePrompt | tags | notes | flags |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...audit.records.map((record) =>
      [
        record.id,
        record.source,
        record.category,
        record.title,
        record.subtitle,
        record.prompt,
        record.negativePrompt,
        record.tags.join(", "),
        record.notes,
        record.flags.join(", "),
      ]
        .map(escapeCell)
        .join(" | "),
    ).map((row) => `| ${row} |`),
    "",
  ].join("\n");

  await fs.writeFile(inventoryMarkdownPath, markdown);

  console.log(JSON.stringify(audit.summary, null, 2));
  if (audit.flaggedRecords.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
