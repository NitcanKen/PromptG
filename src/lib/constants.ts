export const CATEGORIES = [
  "人設",
  "表情",
  "姿態",
  "上裝",
  "下裝",
  "鞋履",
  "場景",
  "寫真風格",
  "光影",
  "畫面影響",
  "版式設計",
  "配飾",
  "道具",
  "鏡頭質感",
  "景別",
  "妝容",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SINGLE_SELECT_CATEGORIES = [
  "人設",
  "表情",
  "姿態",
  "上裝",
  "下裝",
  "鞋履",
  "場景",
  "寫真風格",
  "光影",
  "鏡頭質感",
  "景別",
  "妝容",
] as const satisfies readonly Category[];

export const MULTI_SELECT_CATEGORIES = [
  "畫面影響",
  "版式設計",
  "配飾",
  "道具",
] as const satisfies readonly Category[];

export const CATEGORY_SELECTION_MODE: Record<Category, "single" | "multi"> =
  Object.fromEntries([
    ...SINGLE_SELECT_CATEGORIES.map((category) => [category, "single"]),
    ...MULTI_SELECT_CATEGORIES.map((category) => [category, "multi"]),
  ]) as Record<Category, "single" | "multi">;

export const COMPILE_ORDER = [
  "人設",
  "表情",
  "姿態",
  "景別",
  "上裝",
  "下裝",
  "鞋履",
  "妝容",
  "配飾",
  "道具",
  "場景",
  "光影",
  "寫真風格",
  "鏡頭質感",
  "畫面影響",
  "版式設計",
] as const satisfies readonly Category[];

export const SIZE_PRESETS = [
  { id: "auto", label: "自動｜由使用場景決定尺寸", promptText: "尺寸：自動" },
  { id: "1-1-1024", label: "1:1｜1024×1024｜方圖", promptText: "尺寸：1:1｜1024×1024｜方圖" },
  { id: "3-2-1536", label: "3:2｜1536×1024｜橫圖", promptText: "尺寸：3:2｜1536×1024｜橫圖" },
  { id: "2-3-1536", label: "2:3｜1024×1536｜竪圖", promptText: "尺寸：2:3｜1024×1536｜竪圖" },
  { id: "1-1-2048", label: "1:1｜2048×2048｜2K 方圖", promptText: "尺寸：1:1｜2048×2048｜2K 方圖" },
  { id: "3-2-2016", label: "3:2｜2016×1344｜2K 橫圖", promptText: "尺寸：3:2｜2016×1344｜2K 橫圖" },
  { id: "2-3-2016", label: "2:3｜1344×2016｜2K 竪圖", promptText: "尺寸：2:3｜1344×2016｜2K 竪圖" },
  { id: "16-9-2048", label: "16:9｜2048×1152｜2K 橫圖", promptText: "尺寸：16:9｜2048×1152｜2K 橫圖" },
  { id: "9-16-2048", label: "9:16｜1152×2048｜2K 手機竪圖", promptText: "尺寸：9:16｜1152×2048｜2K 手機竪圖" },
  { id: "1-1-2880", label: "1:1｜2880×2880｜4K 方圖", promptText: "尺寸：1:1｜2880×2880｜4K 方圖" },
  { id: "3-2-3456", label: "3:2｜3456×2304｜4K 橫圖", promptText: "尺寸：3:2｜3456×2304｜4K 橫圖" },
  { id: "2-3-3456", label: "2:3｜2304×3456｜4K 竪圖", promptText: "尺寸：2:3｜2304×3456｜4K 竪圖" },
  { id: "16-9-3840", label: "16:9｜3840×2160｜4K 橫圖", promptText: "尺寸：16:9｜3840×2160｜4K 橫圖" },
  { id: "9-16-3840", label: "9:16｜2160×3840｜4K 手機竪圖", promptText: "尺寸：9:16｜2160×3840｜4K 手機竪圖" },
] as const;

export type SizePresetId = (typeof SIZE_PRESETS)[number]["id"];

export const QUALITY_PRESETS = [
  { id: "auto", label: "自動", promptText: "質量：自動" },
  { id: "high", label: "高", promptText: "質量：高" },
  { id: "medium", label: "中", promptText: "質量：中" },
  { id: "low", label: "低", promptText: "質量：低" },
] as const;

export type QualityPresetId = (typeof QUALITY_PRESETS)[number]["id"];

export const MIMO_MODELS = [
  "mimo-v2.5-pro",
  "mimo-v2.5",
  "mimo-v2-pro",
  "mimo-v2-omni",
] as const;

export type MimoModel = (typeof MIMO_MODELS)[number];

export const DEFAULT_MIMO_MODEL: MimoModel = "mimo-v2.5-pro";
export const DEFAULT_SIZE_PRESET: SizePresetId = "auto";
export const DEFAULT_QUALITY_PRESET: QualityPresetId = "auto";
