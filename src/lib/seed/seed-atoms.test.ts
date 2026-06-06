import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { CATEGORIES } from "@/lib/constants";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

function hasCjk(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

describe("seed atoms", () => {
  it("includes at least 36 local seed atoms covering every v2 category", () => {
    expect(SEED_ATOMS.length).toBeGreaterThanOrEqual(36);
    expect(new Set(SEED_ATOMS.map((atom) => atom.category))).toEqual(new Set(CATEGORIES));
    expect(SEED_ATOMS.every((atom) => atom.previewImagePath.startsWith("/api/uploads/seed/"))).toBe(true);
  });

  it("only references preview files that exist in the local seed upload directory", () => {
    for (const atom of SEED_ATOMS) {
      const fileName = atom.previewImagePath.replace("/api/uploads/seed/", "");
      expect(fs.existsSync(path.join(process.cwd(), "data/uploads/seed", fileName))).toBe(true);
    }
  });

  it("keeps visible seed metadata in Traditional Chinese", () => {
    expect(
      SEED_ATOMS.every(
        (atom) =>
          hasCjk(atom.title) &&
          hasCjk(atom.subtitle) &&
          atom.tags.every(hasCjk) &&
          hasCjk(atom.notes),
      ),
    ).toBe(true);
  });
});
