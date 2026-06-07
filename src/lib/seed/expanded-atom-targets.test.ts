import { describe, expect, it } from "vitest";

import {
  FULL_V2_CATEGORY_TARGETS,
  MAIN_SCOPE_CATEGORY_TARGETS,
  getCategoryTargetTotal,
  getMissingCategoryTargets,
  isMainScopeCategory,
} from "@/lib/seed/expanded-atom-targets";

describe("expanded atom target contracts", () => {
  it("keeps the approved main scope plus persona add-on at 31 categories and 780 final atoms", () => {
    expect(Object.keys(MAIN_SCOPE_CATEGORY_TARGETS)).toHaveLength(31);
    expect(getCategoryTargetTotal(MAIN_SCOPE_CATEGORY_TARGETS)).toBe(780);
    expect(MAIN_SCOPE_CATEGORY_TARGETS["人設"]).toBe(80);
    expect(MAIN_SCOPE_CATEGORY_TARGETS["髮型"]).toBe(40);
    expect(MAIN_SCOPE_CATEGORY_TARGETS["材質"]).toBeUndefined();
  });

  it("keeps the full v2 completion scope plus persona add-on at 36 categories and 890 final atoms", () => {
    expect(Object.keys(FULL_V2_CATEGORY_TARGETS)).toHaveLength(36);
    expect(getCategoryTargetTotal(FULL_V2_CATEGORY_TARGETS)).toBe(890);
    expect(FULL_V2_CATEGORY_TARGETS["Negative Atom"]).toBe(30);
    expect(FULL_V2_CATEGORY_TARGETS["尺寸"]).toBe(10);
  });

  it("identifies main scope categories without mixing the v2 add-on categories", () => {
    expect(isMainScopeCategory("髮型")).toBe(true);
    expect(isMainScopeCategory("版式設計")).toBe(true);
    expect(isMainScopeCategory("材質")).toBe(false);
    expect(isMainScopeCategory("Negative Atom")).toBe(false);
  });

  it("reports missing category counts against a current category map", () => {
    expect(
      getMissingCategoryTargets(
        {
          髮型: 40,
          人設: 12,
        },
        MAIN_SCOPE_CATEGORY_TARGETS,
      ),
    ).toMatchObject({
      人設: 68,
      髮型: 0,
      表情: 30,
    });
  });
});
