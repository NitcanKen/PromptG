import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/lib/constants";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

function hasCjk(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

describe("seed atoms", () => {
  it("includes at least 36 local seed atoms covering every v2 category", () => {
    expect(SEED_ATOMS.length).toBeGreaterThanOrEqual(36);
    expect(new Set(SEED_ATOMS.map((atom) => atom.category))).toEqual(new Set(CATEGORIES));
    expect(SEED_ATOMS.every((atom) => atom.previewImagePath === "")).toBe(true);
  });

  it("does not reference removed local seed preview files", () => {
    expect(SEED_ATOMS.some((atom) => atom.previewImagePath.startsWith("/api/uploads/seed/"))).toBe(
      false,
    );
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
