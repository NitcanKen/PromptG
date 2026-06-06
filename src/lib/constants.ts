export type CategorySelectionMode = "single" | "multi";

export const PROMPT_PRIORITIES = [
  "core",
  "strong",
  "medium",
  "weak",
  "reference",
] as const;

export type PromptPriority = (typeof PROMPT_PRIORITIES)[number];

export const DEFAULT_PROMPT_PRIORITY: PromptPriority = "medium";

export const PROMPT_PRIORITY_LABELS: Record<PromptPriority, string> = {
  core: "核心",
  strong: "強",
  medium: "中",
  weak: "弱",
  reference: "參考",
};

export const PROMPT_PRIORITY_DESCRIPTIONS: Record<PromptPriority, string> = {
  core: "保留為主要控制條件",
  strong: "明顯影響結果",
  medium: "一般素材強度",
  weak: "輕量輔助條件",
  reference: "只作為參考氛圍",
};

export const LOCK_POLICIES = [
  "normal",
  "can_override",
  "cannot_override",
] as const;

export type LockPolicy = (typeof LOCK_POLICIES)[number];

export const DEFAULT_LOCK_POLICY: LockPolicy = "normal";

export const LOCK_POLICY_LABELS: Record<LockPolicy, string> = {
  normal: "一般",
  can_override: "可覆蓋",
  cannot_override: "不可覆蓋",
};

export const LOCK_POLICY_DESCRIPTIONS: Record<LockPolicy, string> = {
  normal: "不指定覆蓋規則",
  can_override: "後續素材可覆蓋此條件",
  cannot_override: "此素材條件應被保留",
};

export const CATEGORY_GROUPS = [
  "主體",
  "身體",
  "造型",
  "場景",
  "鏡頭",
  "媒介",
  "控制",
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export const CATEGORY_METADATA = [
  {
    id: "persona",
    label: "人設",
    group: "主體",
    selectionMode: "single",
    compileOrder: 10,
    description: "角色身份、人物氣質與基礎人像設定。",
    examples: ["柔和電影感少女", "自然日常人像", "清爽編輯感人物"],
  },
  {
    id: "face-features",
    label: "臉部特徵",
    group: "主體",
    selectionMode: "single",
    compileOrder: 30,
    description: "臉型、五官印象、眼型與臉部辨識細節。",
    examples: ["下垂眼", "柔和臉型", "清晰鼻樑"],
  },
  {
    id: "hair",
    label: "髮型",
    group: "主體",
    selectionMode: "single",
    compileOrder: 40,
    description: "瀏海、長短髮、染髮、捲度與髮絲狀態。",
    examples: ["空氣瀏海", "公主切", "微捲髮尾"],
  },
  {
    id: "expression",
    label: "表情",
    group: "主體",
    selectionMode: "single",
    compileOrder: 50,
    description: "臉部情緒、嘴角狀態與人物表情方向。",
    examples: ["俏皮自信微笑", "冷淡凝視", "自然淺笑"],
  },
  {
    id: "eye-direction",
    label: "視線",
    group: "主體",
    selectionMode: "single",
    compileOrder: 60,
    description: "眼神方向、看鏡頭與不看鏡頭的互動焦點。",
    examples: ["直視鏡頭", "看向窗外", "低頭看手機"],
  },
  {
    id: "pose",
    label: "姿態",
    group: "身體",
    selectionMode: "single",
    compileOrder: 70,
    description: "整體身體動作、站坐姿與肢體姿勢基底。",
    examples: ["鏡前自拍姿態", "放鬆站姿", "回身看鏡頭"],
  },
  {
    id: "hand-gesture",
    label: "手部動作",
    group: "身體",
    selectionMode: "multi",
    compileOrder: 80,
    description: "手勢、手部位置與可疊加的局部動作。",
    examples: ["手托腮", "手指靠近嘴唇", "整理衣領"],
  },
  {
    id: "body-framing",
    label: "身體構圖",
    group: "身體",
    selectionMode: "single",
    compileOrder: 90,
    description: "身體露出比例、背面側面與人物構圖裁切。",
    examples: ["半身", "七分身", "背影構圖"],
  },
  {
    id: "subject-relationship",
    label: "主體數量 / 人物關係",
    group: "主體",
    selectionMode: "single",
    compileOrder: 1,
    description: "主體數量、人物關係與前後景人物配置。",
    examples: ["單人", "雙人閨蜜", "情侶合照"],
  },
  {
    id: "top",
    label: "上裝",
    group: "造型",
    selectionMode: "single",
    compileOrder: 130,
    description: "上半身服裝、外套、襯衫與上衣輪廓。",
    examples: ["短版針織開衫", "白色襯衫", "寬鬆帽 Tee"],
  },
  {
    id: "bottom",
    label: "下裝",
    group: "造型",
    selectionMode: "single",
    compileOrder: 140,
    description: "裙裝、褲裝與下半身穿搭設定。",
    examples: ["百褶短裙", "高腰牛仔褲", "垂墜長裙"],
  },
  {
    id: "shoes",
    label: "鞋履",
    group: "造型",
    selectionMode: "single",
    compileOrder: 150,
    description: "鞋款、鞋底輪廓與足部造型。",
    examples: ["厚底休閒球鞋", "短靴", "Mary Jane 鞋"],
  },
  {
    id: "accessory",
    label: "配飾",
    group: "造型",
    selectionMode: "multi",
    compileOrder: 170,
    description: "耳環、項鍊、眼鏡、包款等可疊加造型細節。",
    examples: ["銀色圈形耳環", "細框眼鏡", "小型肩背包"],
  },
  {
    id: "prop",
    label: "道具",
    group: "造型",
    selectionMode: "multi",
    compileOrder: 180,
    description: "人物手邊或畫面中的可互動物件。",
    examples: ["手持手機", "咖啡杯", "透明雨傘"],
  },
  {
    id: "makeup",
    label: "妝容",
    group: "造型",
    selectionMode: "single",
    compileOrder: 160,
    description: "底妝、眼妝、唇色與整體化妝風格。",
    examples: ["柔和偶像妝", "清透裸妝", "亮片眼影"],
  },
  {
    id: "scene",
    label: "場景",
    group: "場景",
    selectionMode: "single",
    compileOrder: 200,
    description: "主要拍攝地點、室內外空間與背景基底。",
    examples: ["溫馨臥室角落", "便利店外夜景", "咖啡店窗邊"],
  },
  {
    id: "scene-detail",
    label: "場景細節",
    group: "場景",
    selectionMode: "multi",
    compileOrder: 210,
    description: "背景中的局部物件、生活痕跡與空間細節。",
    examples: ["床邊小夜燈", "窗台植物", "背景雜誌堆"],
  },
  {
    id: "interaction",
    label: "互動行為",
    group: "身體",
    selectionMode: "multi",
    compileOrder: 190,
    description: "人物與環境、道具或其他人物的可疊加行為。",
    examples: ["鏡前自拍", "喝咖啡", "便利店外等待"],
  },
  {
    id: "time-weather",
    label: "時間 / 季節 / 天氣",
    group: "場景",
    selectionMode: "single",
    compileOrder: 220,
    description: "時間、季節、天氣與場景時態條件。",
    examples: ["雨夜", "夏日午後", "深夜街角"],
  },
  {
    id: "lighting",
    label: "光影",
    group: "場景",
    selectionMode: "single",
    compileOrder: 230,
    description: "主光源、陰影、色溫與整體照明氛圍。",
    examples: ["暖色窗邊光", "柔和逆光", "夜間直接閃光"],
  },
  {
    id: "color-system",
    label: "色彩系統",
    group: "場景",
    selectionMode: "single",
    compileOrder: 240,
    description: "主色調、配色關係與整體色彩氛圍。",
    examples: ["冷藍夜色", "低飽和奶油色", "粉色甜美調"],
  },
  {
    id: "photo-style",
    label: "寫真風格",
    group: "場景",
    selectionMode: "single",
    compileOrder: 250,
    description: "整體攝影風格、影像類型與視覺語氣。",
    examples: ["社群手機快照", "日系寫真", "雜誌編輯風"],
  },
  {
    id: "camera-angle",
    label: "鏡頭角度",
    group: "鏡頭",
    selectionMode: "single",
    compileOrder: 110,
    description: "高低角度、自拍臂距、鏡面反射等拍攝角度。",
    examples: ["自拍臂距視角", "微高角度", "平視鏡頭"],
  },
  {
    id: "lens-texture",
    label: "鏡頭質感",
    group: "鏡頭",
    selectionMode: "single",
    compileOrder: 260,
    description: "拍攝設備、鏡頭材質與成像質感。",
    examples: ["業餘手機閃光", "低解析社群感", "底片相機顆粒"],
  },
  {
    id: "shot-size",
    label: "景別",
    group: "鏡頭",
    selectionMode: "single",
    compileOrder: 100,
    description: "人物在畫面中的遠近、裁切與取景比例。",
    examples: ["半身景別", "近景人像", "全身穿搭"],
  },
  {
    id: "composition-rule",
    label: "構圖規則",
    group: "鏡頭",
    selectionMode: "single",
    compileOrder: 120,
    description: "中心、三分法、斜線、前景遮擋與框中框等構圖。",
    examples: ["中心構圖", "三分法", "前景遮擋"],
  },
  {
    id: "material",
    label: "材質",
    group: "造型",
    selectionMode: "multi",
    compileOrder: 270,
    description: "布料、金屬、玻璃、紙張與畫面材質觸感。",
    examples: ["蕾絲", "針織", "濕潤玻璃反光"],
  },
  {
    id: "visual-effect",
    label: "畫面影響",
    group: "媒介",
    selectionMode: "multi",
    compileOrder: 290,
    description: "可疊加的畫面表面效果、覆蓋質感與影像瑕疵。",
    examples: ["細緻底片顆粒", "輕微失焦", "柔霧覆蓋"],
  },
  {
    id: "layout-design",
    label: "版式設計",
    group: "媒介",
    selectionMode: "multi",
    compileOrder: 310,
    description: "拼貼、邊框、社群封面與平面設計版式。",
    examples: ["手帳貼紙版式", "雜誌封面排版", "留白文字區"],
  },
  {
    id: "text-element",
    label: "文本元素",
    group: "媒介",
    selectionMode: "multi",
    compileOrder: 320,
    description: "畫面中的文字、時間戳、手寫字與社群貼文字。",
    examples: ["日文小字", "手寫註記", "聊天泡泡"],
  },
  {
    id: "platform-medium",
    label: "平台媒介",
    group: "媒介",
    selectionMode: "single",
    compileOrder: 330,
    description: "成品平台、媒介格式與社群內容外觀。",
    examples: ["Instagram story", "小紅書封面", "Polaroid"],
  },
  {
    id: "realism-imperfection",
    label: "真實性 / 缺陷控制",
    group: "控制",
    selectionMode: "multi",
    compileOrder: 280,
    description: "真實感、自然瑕疵、生活雜訊與非塑膠感控制。",
    examples: ["自然皮膚紋理", "背景生活雜物", "不要 AI 塑膠皮膚"],
  },
  {
    id: "post-processing",
    label: "後期處理",
    group: "媒介",
    selectionMode: "multi",
    compileOrder: 300,
    description: "後製效果、邊框、漏光、壓縮與柔焦處理。",
    examples: ["Polaroid 邊框", "低解析壓縮", "暗角"],
  },
  {
    id: "negative-atom",
    label: "Negative Atom",
    group: "控制",
    selectionMode: "multi",
    compileOrder: 340,
    description: "可重用的負面約束素材，P3B 暫不加入正向 Prompt。",
    examples: ["不要錯誤手指", "不要浮水印", "不要 AI 塑膠皮膚"],
  },
  {
    id: "size",
    label: "尺寸",
    group: "控制",
    selectionMode: "single",
    compileOrder: 350,
    description: "影像比例與尺寸控制素材。",
    examples: ["1:1 方圖", "9:16 手機竪圖", "16:9 橫圖"],
  },
  {
    id: "quality",
    label: "質量",
    group: "控制",
    selectionMode: "single",
    compileOrder: 360,
    description: "輸出品質、清晰度與生成品質控制素材。",
    examples: ["高質量", "中等質量", "自動質量"],
  },
] as const;

export type CategoryMetadata = (typeof CATEGORY_METADATA)[number];
export type Category = CategoryMetadata["label"];

export const CATEGORIES = CATEGORY_METADATA.map((category) => category.label) as unknown as
  readonly [Category, ...Category[]];

export const DEFAULT_CATEGORY = CATEGORIES[0];

export const CATEGORY_METADATA_BY_LABEL = Object.fromEntries(
  CATEGORY_METADATA.map((category) => [category.label, category]),
) as Record<Category, CategoryMetadata>;

export const CATEGORIES_BY_GROUP = CATEGORY_GROUPS.reduce(
  (groups, group) => ({
    ...groups,
    [group]: CATEGORY_METADATA.filter((category) => category.group === group).map(
      (category) => category.label,
    ),
  }),
  {} as Record<CategoryGroup, readonly Category[]>,
);

export const SINGLE_SELECT_CATEGORIES = CATEGORY_METADATA.filter(
  (category) => category.selectionMode === "single",
).map((category) => category.label) as readonly Category[];

export const MULTI_SELECT_CATEGORIES = CATEGORY_METADATA.filter(
  (category) => category.selectionMode === "multi",
).map((category) => category.label) as readonly Category[];

export const CATEGORY_SELECTION_MODE = Object.fromEntries(
  CATEGORY_METADATA.map((category) => [category.label, category.selectionMode]),
) as Record<Category, CategorySelectionMode>;

export const COMPILE_ORDER = [...CATEGORY_METADATA]
  .filter((category) => category.label !== "Negative Atom")
  .sort((a, b) => a.compileOrder - b.compileOrder)
  .map((category) => category.label) as readonly Category[];

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
