#!/usr/bin/env tsx

import fs from "node:fs/promises";
import path from "node:path";

import type { ExpandedAtomSource } from "@/lib/seed/expanded-atoms";
import { EXPANDED_ATOMS } from "@/lib/seed/expanded-atoms";

const shardFiles: Partial<Record<ExpandedAtomSource, { path: string; title: string }>> = {
  "subject-atoms": {
    path: "docs/material-library/subject-atoms.md",
    title: "Subject Atoms",
  },
  "body-atoms": {
    path: "docs/material-library/body-atoms.md",
    title: "Body Atoms",
  },
  "styling-atoms-part-1": {
    path: "docs/material-library/styling-atoms-part-1.md",
    title: "Styling Atoms Part 1",
  },
  "styling-atoms-part-2": {
    path: "docs/material-library/styling-atoms-part-2.md",
    title: "Styling Atoms Part 2",
  },
  "scene-atoms": {
    path: "docs/material-library/scene-atoms.md",
    title: "Scene Atoms",
  },
  "camera-atoms": {
    path: "docs/material-library/camera-atoms.md",
    title: "Camera Atoms",
  },
  "media-atoms": {
    path: "docs/material-library/media-atoms.md",
    title: "Media Atoms",
  },
};

function escapeCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function makeTable(source: ExpandedAtomSource) {
  const atoms = EXPANDED_ATOMS.filter((atom) => atom.source === source);
  const rows = atoms.map((atom, index) =>
    [
      String(index + 1),
      atom.id,
      atom.category,
      atom.title,
      atom.subtitle,
      atom.previewImagePath,
      atom.prompt,
      atom.negativePrompt,
      atom.priority,
      atom.lockPolicy,
      atom.tags.join(", "),
      atom.notes,
    ]
      .map(escapeCell)
      .join(" | "),
  );

  return [
    "| # | id | category | title | subtitle | previewImagePath | prompt | negativePrompt | priority | lockPolicy | tags | notes |",
    "| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((row) => `| ${row} |`),
  ].join("\n");
}

async function main() {
  for (const [source, file] of Object.entries(shardFiles) as Array<
    [ExpandedAtomSource, { path: string; title: string }]
  >) {
    const atoms = EXPANDED_ATOMS.filter((atom) => atom.source === source);
    const categories = [...new Set(atoms.map((atom) => atom.category))];
    const markdown = [
      `# ${file.title}`,
      "",
      "Updated: 2026-06-07 HKT",
      "",
      "Source: generated from `src/lib/seed/expanded-atoms.ts`.",
      "",
      `Categories: ${categories.map((category) => `\`${category}\``).join(", ")}`,
      "",
      `Atom count: ${atoms.length}`,
      "",
      "P4D status: approved main-scope text shard; preview images are generated later through the Gemini production integration manifest.",
      "",
      makeTable(source),
      "",
    ].join("\n");

    await fs.mkdir(path.dirname(file.path), { recursive: true });
    await fs.writeFile(file.path, markdown);
    console.log(`${file.path}: ${atoms.length}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
