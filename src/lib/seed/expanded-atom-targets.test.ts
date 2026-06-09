import { describe, expect, it } from "vitest";

import {
  FULL_V2_CATEGORY_TARGETS,
  MAIN_SCOPE_CATEGORY_TARGETS,
  getCategoryTargetTotal,
  getMissingCategoryTargets,
  isMainScopeCategory,
} from "@/lib/seed/expanded-atom-targets";

describe("expanded atom target contracts", () => {
  it("keeps the approved main scope plus anime character minimum at 32 categories and 1053 atoms", () => {
    expect(Object.keys(MAIN_SCOPE_CATEGORY_TARGETS)).toHaveLength(32);
    expect(getCategoryTargetTotal(MAIN_SCOPE_CATEGORY_TARGETS)).toBe(1053);
    expect(MAIN_SCOPE_CATEGORY_TARGETS["人設"]).toBe(80);
    expect(MAIN_SCOPE_CATEGORY_TARGETS["動漫角色"]).toBe(273);
    expect(MAIN_SCOPE_CATEGORY_TARGETS["髮型"]).toBe(40);
    expect(MAIN_SCOPE_CATEGORY_TARGETS["材質"]).toBeUndefined();
  });

  it("keeps the full v2 completion scope plus anime characters at 37 categories and 1163 final atoms", () => {
    expect(Object.keys(FULL_V2_CATEGORY_TARGETS)).toHaveLength(37);
    expect(getCategoryTargetTotal(FULL_V2_CATEGORY_TARGETS)).toBe(1163);
    expect(FULL_V2_CATEGORY_TARGETS["Negative Atom"]).toBe(30);
    expect(FULL_V2_CATEGORY_TARGETS["尺寸"]).toBe(10);
  });

  it("identifies main scope categories without mixing the v2 add-on categories", () => {
    expect(isMainScopeCategory("髮型")).toBe(true);
    expect(isMainScopeCategory("動漫角色")).toBe(true);
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
