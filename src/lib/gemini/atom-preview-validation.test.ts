import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { validateAtomPreviews } from "@/lib/gemini/atom-preview-validation";

const oneByOnePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/luzt1wAAAABJRU5ErkJggg==",
  "base64",
);
const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "promptg-preview-validation-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("atom preview validation", () => {
  it("validates existing PNG previews and matching manifest entries", async () => {
    const outputDir = await makeTempDir();
    const atomId = "library-hair-curtain-bangs";
    const filePath = path.join(outputDir, `${atomId}.png`);
    await fs.writeFile(filePath, oneByOnePng);
    await fs.writeFile(
      path.join(outputDir, "manifest.json"),
      JSON.stringify({
        version: 1,
        model: "GPT-Image-2",
        updatedAt: "2026-06-06T00:00:00.000Z",
        atoms: {
          [atomId]: {
            atomId,
            status: "generated",
            previewImagePath: `/api/uploads/atom-previews/${atomId}.png`,
            filePath,
            fileSize: oneByOnePng.byteLength,
          },
        },
      }),
    );

    const result = await validateAtomPreviews({
      outputDir,
      ids: [atomId],
    });

    expect(result.ok).toBe(true);
    expect(result.checked).toHaveLength(1);
    expect(result.checked[0]).toMatchObject({
      atomId,
      width: 1,
      height: 1,
      previewImagePath: `/api/uploads/atom-previews/${atomId}.png`,
    });
    expect(result.errors).toEqual([]);
  });

  it("reports missing files and manifest mismatches", async () => {
    const outputDir = await makeTempDir();
    await fs.writeFile(
      path.join(outputDir, "manifest.json"),
      JSON.stringify({
        version: 1,
        model: "GPT-Image-2",
        updatedAt: "2026-06-06T00:00:00.000Z",
        atoms: {},
      }),
    );

    const result = await validateAtomPreviews({
      outputDir,
      ids: ["library-hair-curtain-bangs"],
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("library-hair-curtain-bangs.png 不存在"),
        expect.stringContaining("manifest 缺少 library-hair-curtain-bangs"),
      ]),
    );
  });
});
