import { describe, expect, it } from "vitest";

import {
  countAtomsByCategory,
  countAtomsForCategories,
} from "@/lib/atoms/category-counts";

describe("category atom counts", () => {
  it("counts available library atoms by category independent of selected atoms", () => {
    const counts = countAtomsByCategory([
      { category: "人設" },
      { category: "人設" },
      { category: "髮型" },
    ]);

    expect(counts["人設"]).toBe(2);
    expect(counts["髮型"]).toBe(1);
    expect(counts["表情"]).toBe(0);
    expect(countAtomsForCategories(counts, ["人設", "髮型", "表情"])).toBe(3);
  });
});
