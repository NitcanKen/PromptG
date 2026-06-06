import { describe, expect, it } from "vitest";

import { atomInputSchema } from "@/lib/validation/atoms";
import { EXPANDED_ATOMS, EXPANDED_HAIR_ATOMS } from "@/lib/seed/expanded-atoms";

function hasCjk(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

describe("expanded atoms", () => {
  it("contains exactly 40 structured hair atoms", () => {
    expect(EXPANDED_HAIR_ATOMS).toHaveLength(40);
    expect(EXPANDED_ATOMS.filter((atom) => atom.category === "髮型")).toHaveLength(40);
  });

  it("keeps stable IDs unique and preserves the existing hair seed ID", () => {
    const ids = EXPANDED_HAIR_ATOMS.map((atom) => atom.id);

    expect(new Set(ids).size).toBe(40);
    expect(ids).toContain("seed-hair-airy-bangs");
  });

  it("keeps every expanded hair atom in the hair category and valid atom schema", () => {
    for (const atom of EXPANDED_HAIR_ATOMS) {
      expect(atom.category).toBe("髮型");
      expect(atomInputSchema.safeParse(atom).success).toBe(true);
    }
  });

  it("keeps visible expanded hair metadata in Traditional Chinese", () => {
    expect(
      EXPANDED_HAIR_ATOMS.every(
        (atom) =>
          hasCjk(atom.title) &&
          hasCjk(atom.subtitle) &&
          atom.tags.every(hasCjk) &&
          hasCjk(atom.notes),
      ),
    ).toBe(true);
  });
});
