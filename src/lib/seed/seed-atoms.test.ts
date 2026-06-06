import { describe, expect, it } from "vitest";

import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

function hasCjk(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

describe("seed atoms", () => {
  it("includes at least 16 local seed atoms across at least 10 categories", () => {
    expect(SEED_ATOMS.length).toBeGreaterThanOrEqual(16);
    expect(new Set(SEED_ATOMS.map((atom) => atom.category)).size).toBeGreaterThanOrEqual(10);
    expect(SEED_ATOMS.every((atom) => atom.previewImagePath.startsWith("/api/uploads/seed/"))).toBe(true);
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
