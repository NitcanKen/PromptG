import type { Category } from "@/lib/constants";

export type AtomTargetCounts = Partial<Record<Category, number>>;

export const MAIN_SCOPE_CATEGORY_TARGETS = {
  人設: 80,
  臉部特徵: 30,
  髮型: 40,
  表情: 30,
  視線: 20,
  "主體數量 / 人物關係": 10,
  姿態: 30,
  手部動作: 30,
  身體構圖: 30,
  互動行為: 30,
  上裝: 40,
  下裝: 40,
  鞋履: 40,
  配飾: 40,
  道具: 40,
  妝容: 40,
  場景: 20,
  場景細節: 20,
  "時間 / 季節 / 天氣": 20,
  光影: 20,
  色彩系統: 20,
  寫真風格: 20,
  鏡頭角度: 10,
  鏡頭質感: 10,
  景別: 10,
  構圖規則: 10,
  畫面影響: 10,
  版式設計: 10,
  文本元素: 10,
  平台媒介: 10,
  後期處理: 10,
} as const satisfies AtomTargetCounts;

export const FULL_V2_CATEGORY_TARGETS = {
  ...MAIN_SCOPE_CATEGORY_TARGETS,
  材質: 30,
  "真實性 / 缺陷控制": 30,
  "Negative Atom": 30,
  尺寸: 10,
  質量: 10,
} as const satisfies AtomTargetCounts;

export const MAIN_SCOPE_CATEGORIES = Object.keys(
  MAIN_SCOPE_CATEGORY_TARGETS,
) as Array<keyof typeof MAIN_SCOPE_CATEGORY_TARGETS>;

export const FULL_V2_CATEGORIES = Object.keys(
  FULL_V2_CATEGORY_TARGETS,
) as Array<keyof typeof FULL_V2_CATEGORY_TARGETS>;

export function getCategoryTargetTotal(targets: AtomTargetCounts) {
  return Object.values(targets).reduce((total, count) => total + (count ?? 0), 0);
}

export function isMainScopeCategory(category: Category) {
  return Object.prototype.hasOwnProperty.call(MAIN_SCOPE_CATEGORY_TARGETS, category);
}

export function isFullV2Category(category: Category) {
  return Object.prototype.hasOwnProperty.call(FULL_V2_CATEGORY_TARGETS, category);
}

export function getMissingCategoryTargets(
  actualCounts: AtomTargetCounts,
  targetCounts: AtomTargetCounts,
) {
  return Object.fromEntries(
    Object.entries(targetCounts).map(([category, target]) => [
      category,
      Math.max(0, (target ?? 0) - (actualCounts[category as Category] ?? 0)),
    ]),
  ) as AtomTargetCounts;
}
