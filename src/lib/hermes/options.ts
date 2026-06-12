export const HERMES_ENHANCEMENT_PRESETS = [
  {
    id: "restrained-premium",
    label: "克制高級",
    description: "低調、成熟、精準控制質感，避免過度堆疊形容詞。",
    promptGuidance:
      "Rewrite with restrained premium taste: refined details, calm confidence, natural texture, fewer but stronger visual cues, no cheap glamour.",
  },
  {
    id: "fashion-editorial",
    label: "時尚 editorial",
    description: "偏雜誌大片、造型與構圖意識更強，保留高級時裝語氣。",
    promptGuidance:
      "Rewrite with fashion editorial structure: styling hierarchy, deliberate pose, lens-aware composition, wardrobe texture, magazine-grade lighting.",
  },
  {
    id: "character-art",
    label: "角色美術感",
    description: "強化角色設定、輪廓辨識與美術設計感，不做額外保守化。",
    promptGuidance:
      "Rewrite as character art direction: clear character identity, readable silhouette, cohesive costume and prop design, expressive but tasteful presence.",
  },
  {
    id: "realistic-social-selfie",
    label: "寫實社群自拍",
    description: "偏手機、社群、自然生活感，保留真實瑕疵與非棚拍語氣。",
    promptGuidance:
      "Rewrite as realistic social selfie: casual phone-camera presence, natural imperfections, lived-in environment, believable framing and lighting.",
  },
] as const;

export type HermesEnhancementPresetId =
  (typeof HERMES_ENHANCEMENT_PRESETS)[number]["id"];

export const DEFAULT_HERMES_ENHANCEMENT_PRESET: HermesEnhancementPresetId =
  "restrained-premium";

export const HERMES_OUTPUT_STYLES = [
  {
    id: "zh",
    label: "中文 final prompt",
    description: "final prompt 使用中文描述，技術詞保留常見英文也可。",
    promptGuidance:
      "Write positivePrompt and negativePrompt primarily in Traditional Chinese; keep widely used technical tokens in English only when useful.",
  },
  {
    id: "english",
    label: "English final prompt",
    description: "final prompt 使用英文，notes 仍維持繁體中文。",
    promptGuidance:
      "Write positivePrompt and negativePrompt in polished English prompt language; keep notes in Traditional Chinese.",
  },
  {
    id: "mixed-technical",
    label: "mixed technical prompt",
    description: "中文意圖加英文技術詞，適合可讀與模型控制兼顧。",
    promptGuidance:
      "Write positivePrompt and negativePrompt as mixed technical prompt: human-readable Chinese intent with concise English control tokens where they improve model steering.",
  },
] as const;

export type HermesOutputStyleId = (typeof HERMES_OUTPUT_STYLES)[number]["id"];

export const DEFAULT_HERMES_OUTPUT_STYLE: HermesOutputStyleId = "mixed-technical";

export function getHermesEnhancementPreset(id: HermesEnhancementPresetId) {
  return HERMES_ENHANCEMENT_PRESETS.find((preset) => preset.id === id) ?? HERMES_ENHANCEMENT_PRESETS[0];
}

export function getHermesOutputStyle(id: HermesOutputStyleId) {
  return HERMES_OUTPUT_STYLES.find((style) => style.id === id) ?? HERMES_OUTPUT_STYLES[0];
}
