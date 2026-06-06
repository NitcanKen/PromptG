import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  CATEGORY_METADATA,
  CATEGORY_SELECTION_MODE,
  COMPILE_ORDER,
  MULTI_SELECT_CATEGORIES,
  SINGLE_SELECT_CATEGORIES,
} from "@/lib/constants";

const v2Categories = [
  "人設",
  "臉部特徵",
  "髮型",
  "表情",
  "視線",
  "姿態",
  "手部動作",
  "身體構圖",
  "主體數量 / 人物關係",
  "上裝",
  "下裝",
  "鞋履",
  "配飾",
  "道具",
  "妝容",
  "場景",
  "場景細節",
  "互動行為",
  "時間 / 季節 / 天氣",
  "光影",
  "色彩系統",
  "寫真風格",
  "鏡頭角度",
  "鏡頭質感",
  "景別",
  "構圖規則",
  "材質",
  "畫面影響",
  "版式設計",
  "文本元素",
  "平台媒介",
  "真實性 / 缺陷控制",
  "後期處理",
  "Negative Atom",
  "尺寸",
  "質量",
] as const;

describe("category constants", () => {
  it("exposes the v2 36-category taxonomy through metadata", () => {
    expect(CATEGORIES).toEqual(v2Categories);
    expect(CATEGORY_METADATA).toHaveLength(v2Categories.length);
    expect(CATEGORY_METADATA.map((category) => category.label)).toEqual(CATEGORIES);

    for (const category of CATEGORY_METADATA) {
      expect(category.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(category.group).toMatch(/[\u4e00-\u9fff]/);
      expect(category.description).toMatch(/[\u4e00-\u9fff]/);
      expect(category.examples.length).toBeGreaterThan(0);
      expect(category.selectionMode).toMatch(/^(single|multi)$/);
      expect(category.compileOrder).toBeGreaterThan(0);
    }
  });

  it("derives selection mode exports from metadata", () => {
    expect(SINGLE_SELECT_CATEGORIES).toEqual(
      CATEGORY_METADATA.filter((category) => category.selectionMode === "single").map(
        (category) => category.label,
      ),
    );
    expect(MULTI_SELECT_CATEGORIES).toEqual(
      CATEGORY_METADATA.filter((category) => category.selectionMode === "multi").map(
        (category) => category.label,
      ),
    );

    expect(CATEGORY_SELECTION_MODE).toEqual(
      Object.fromEntries(
        CATEGORY_METADATA.map((category) => [category.label, category.selectionMode]),
      ),
    );
  });

  it("derives compile order from metadata", () => {
    expect(COMPILE_ORDER).toEqual(
      [...CATEGORY_METADATA]
        .filter((category) => category.label !== "Negative Atom")
        .sort((a, b) => a.compileOrder - b.compileOrder)
        .map((category) => category.label),
    );
    expect(COMPILE_ORDER).not.toContain("Negative Atom");
    expect(COMPILE_ORDER.slice(0, 3)).toEqual([
      "主體數量 / 人物關係",
      "人設",
      "臉部特徵",
    ]);
    expect(COMPILE_ORDER.slice(-2)).toEqual(["尺寸", "質量"]);
  });

  it("matches the v2 selection mode policy", () => {
    expect(new Set(SINGLE_SELECT_CATEGORIES)).toEqual(new Set([
      "主體數量 / 人物關係",
      "人設",
      "臉部特徵",
      "髮型",
      "表情",
      "視線",
      "姿態",
      "身體構圖",
      "上裝",
      "下裝",
      "鞋履",
      "妝容",
      "場景",
      "時間 / 季節 / 天氣",
      "光影",
      "色彩系統",
      "寫真風格",
      "鏡頭角度",
      "鏡頭質感",
      "景別",
      "構圖規則",
      "平台媒介",
      "尺寸",
      "質量",
    ]));
    expect(new Set(MULTI_SELECT_CATEGORIES)).toEqual(new Set([
      "手部動作",
      "配飾",
      "道具",
      "場景細節",
      "互動行為",
      "材質",
      "畫面影響",
      "版式設計",
      "文本元素",
      "真實性 / 缺陷控制",
      "後期處理",
      "Negative Atom",
    ]));
  });

  it("groups categories for scan-friendly UI", () => {
    expect(new Set(CATEGORY_METADATA.map((category) => category.group))).toEqual(
      new Set(["主體", "身體", "造型", "場景", "鏡頭", "媒介", "控制"]),
    );
  });
});
