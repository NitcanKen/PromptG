import { CATEGORIES, type Category } from "@/lib/constants";
import type { AtomInput } from "@/lib/validation/atoms";

export type AtomPreviewPromptInput = Pick<
  AtomInput,
  "category" | "title" | "subtitle" | "prompt" | "negativePrompt"
> & {
  id?: string;
};

type CategoryPreviewTemplate = {
  target: string;
  instruction: string;
  avoid: string;
};

export const GLOBAL_PREVIEW_STYLE =
  "2.5D semi-realistic ACG illustration, live-action-feeling anime character photography when characters are present, premium key visual quality, clean silhouette, strong thumbnail readability, polished lighting. When a person appears, use an adult original ACG character. No celebrity likeness, no brand logos, no copyrighted characters, no watermark, no random text.";

export const CATEGORY_PREVIEW_TEMPLATES = {
  人設: {
    target: "character design portrait",
    instruction:
      "Create a character design portrait for a clearly adult original ACG character. Role identity must be clear from distinctive silhouette, expression, costume direction, and aura. Do not make the subject look underage. Do not over-focus on hair, pose, outfit brand, or background unless they define the role.",
    avoid: "Avoid generic attractive portrait drift, street-passenger neutrality, unclear role identity, and backgrounds that overpower the character.",
  },
  臉部特徵: {
    target: "face study",
    instruction:
      "Create a close-up ACG face study focused on the named facial feature. Keep hair, clothing, background, pose, and lighting simple so facial structure or facial impression is the main subject.",
    avoid: "Avoid replacing the facial feature with expression, gaze, hairstyle, or generic face beauty.",
  },
  髮型: {
    target: "hair design portrait",
    instruction:
      "Create a close portrait or upper-body hair design image. Hair silhouette, hairline, side locks, length, texture, and color must be clearly visible. Outfit and background are secondary.",
    avoid: "Avoid cropped hair, face-dominant framing, and hairstyles that are hard to distinguish from nearby variants.",
  },
  表情: {
    target: "expression sheet crop",
    instruction:
      "Create a face-and-shoulders expression study. Mouth, eyes, cheeks, brow tension, and emotional signal must make the named expression the only emotional focus.",
    avoid: "Avoid subtle unreadable emotion, a different emotion, or overacting that breaks the semi-realistic style.",
  },
  視線: {
    target: "gaze direction study",
    instruction:
      "Create a portrait focused on eye direction and attention target. The gaze vector must be clear, with restrained expression so it does not override the gaze concept.",
    avoid: "Avoid ambiguous eye direction, expression replacing gaze, or camera angle that hides the eyes.",
  },
  "主體數量 / 人物關係": {
    target: "subject-count and relationship staging",
    instruction:
      "Create a simple staged composition where the number of subjects and their relationship are obvious. Use clean spacing, clear hierarchy, and readable interaction distance.",
    avoid: "Avoid wrong subject count, unclear relationship, and background crowds that confuse the count.",
  },
  姿態: {
    target: "whole-body pose study",
    instruction:
      "Create a full-body or three-quarter pose study where the named body posture is dominant. Clothing and background should support limb readability and body balance.",
    avoid: "Avoid cropped bodies, hidden limbs, and pose concepts reduced to hand gesture only.",
  },
  手部動作: {
    target: "hand gesture study",
    instruction:
      "Create a close or medium crop focused on the hand gesture. Fingers, palm orientation, object contact, and relation to the face or body must be natural and readable.",
    avoid: "Avoid malformed hands, hidden gesture details, and unrelated props stealing focus.",
  },
  身體構圖: {
    target: "body crop and visibility example",
    instruction:
      "Create a composition sample focused on body visibility and crop boundaries. The body region named by the concept must be clearly included and framed.",
    avoid: "Avoid confusing body crop with camera distance, wrong crop boundaries, and unstable framing.",
  },
  互動行為: {
    target: "action and cause-effect",
    instruction:
      "Create an action image where the subject actively interacts with the named object, person, or environment. Action must be visible through contact, body direction, and object placement.",
    avoid: "Avoid static posing, unused objects, or action cues that cannot be read at thumbnail size.",
  },
  上裝: {
    target: "upper garment design",
    instruction:
      "Create a fashion design preview focused on the upper garment. Neckline, sleeves, fit, fabric edge, closure, and silhouette must be visible. The face should not steal focus.",
    avoid: "Avoid portrait dominance, cropped clothing, and unclear garment material.",
  },
  下裝: {
    target: "lower garment design",
    instruction:
      "Create a fashion design preview focused on the lower garment. Waistline, length, leg shape, folds, fabric weight, and silhouette must be visible.",
    avoid: "Avoid cropped lower body, confusing the garment with a dress or coat, and unreadable fabric shape.",
  },
  鞋履: {
    target: "footwear design",
    instruction:
      "Create a footwear-focused preview. Shoes must be large enough to inspect, with sole shape, toe box, material, color, and styling context visible.",
    avoid: "Avoid tiny shoes, cropped feet, brand-like marks, and full-character framing that hides footwear detail.",
  },
  配飾: {
    target: "accessory detail",
    instruction:
      "Create an accessory-focused preview where the named accessory is close, visible, and integrated with a simple character styling context. Avoid brand markings.",
    avoid: "Avoid full portrait dominance, multiple competing accessories, and accessories too small to inspect.",
  },
  道具: {
    target: "prop object and usage",
    instruction:
      "Create a prop-focused preview where the object is visible and naturally held, placed, or used. The prop must be the main subject; a character is optional for scale and interaction.",
    avoid: "Avoid missing props, tiny props, and unrelated objects replacing the selected prop.",
  },
  妝容: {
    target: "makeup finish",
    instruction:
      "Create a close beauty portrait focused on makeup finish, color placement, eye detail, lip finish, skin texture, and intensity. Hair and accessories are secondary.",
    avoid: "Avoid face-feature focus replacing makeup, makeup too subtle to see, or unrelated overdone glam.",
  },
  場景: {
    target: "main location concept",
    instruction:
      "Create an environment concept image where the named location is the main subject. People are optional and small. Architecture, layout, props, lighting, and spatial identity must identify the location.",
    avoid: "Avoid character portrait dominance, generic backgrounds, and locations that cannot be identified.",
  },
  場景細節: {
    target: "additive environment detail",
    instruction:
      "Create an environment-detail preview focused on the named background or foreground detail. The detail must be visible enough to read while the wider scene stays simple.",
    avoid: "Avoid tiny details, turning the detail into a whole unrelated scene, and clutter hiding the target.",
  },
  "時間 / 季節 / 天氣": {
    target: "temporal or weather atmosphere",
    instruction:
      "Create an atmospheric environment image where the named time, season, or weather condition is obvious through sky, light, ground condition, clothing cues, and air quality.",
    avoid: "Avoid invisible weather, contradicted season cues, and character focus overriding the atmosphere.",
  },
  光影: {
    target: "lighting setup",
    instruction:
      "Create a lighting study where the named light source, direction, contrast, highlight, and shadow pattern are the main visual subject.",
    avoid: "Avoid generic pretty lighting, unclear direction, and lighting that contradicts the concept.",
  },
  色彩系統: {
    target: "palette board as image",
    instruction:
      "Create a coherent visual image dominated by the named color palette. Palette should affect lighting, background, clothing or object accents, and overall grade.",
    avoid: "Avoid weak palette presence, random extra colors, and object identity overtaking the color system.",
  },
  寫真風格: {
    target: "image genre sample",
    instruction:
      "Create a genre-style sample that demonstrates the named visual style through composition, subject treatment, lighting, background handling, texture, and finishing language.",
    avoid: "Avoid generic portrait collapse, style cues that contradict ACG or 2.5D policy, and missing genre signals.",
  },
  鏡頭角度: {
    target: "camera angle example",
    instruction:
      "Create a composition sample where the camera position and angle are unmistakable. Use simple subject or scene content so perspective is the main subject.",
    avoid: "Avoid subtle angle changes, pose dominance, and impossible perspective.",
  },
  鏡頭質感: {
    target: "lens, device, or capture texture",
    instruction:
      "Create an image sample focused on capture texture: lens feel, device character, flash behavior, grain, blur, compression, or sensor-like artifacts named by the concept.",
    avoid: "Avoid invisible effect, overdone artifacts, and confusion with final post-processing.",
  },
  景別: {
    target: "camera distance and subject scale",
    instruction:
      "Create a shot-size sample where subject scale and camera distance clearly match the named framing. Use clean crop boundaries.",
    avoid: "Avoid wrong camera distance, crop contradicting the title, and confusion with body crop categories.",
  },
  構圖規則: {
    target: "frame structure",
    instruction:
      "Create a composition-rule sample where visual weight, subject placement, negative space, leading shapes, or frame-within-frame logic clearly demonstrates the named rule.",
    avoid: "Avoid invisible composition rules, accidental centering when the rule says otherwise, and distracting clutter.",
  },
  材質: {
    target: "tactile material surface",
    instruction:
      "Create a material-focused preview where surface texture, reflectivity, softness, transparency, weave, grain, or tactile quality is close and readable. Use a simple object or garment if scale is needed.",
    avoid: "Avoid distant material, object identity overtaking surface quality, and noisy texture that reduces readability.",
  },
  畫面影響: {
    target: "visual surface effect",
    instruction:
      "Create an image-effect preview where the named visual overlay or surface effect is visible across the image while the base subject stays simple.",
    avoid: "Avoid invisible effects, effects that destroy readability, and confusion with lens texture or post-processing.",
  },
  版式設計: {
    target: "layout hierarchy",
    instruction:
      "Create a graphic layout preview showing arrangement, spacing, hierarchy, framing, and decorative structure. Use placeholder visual blocks when text is not the main concept.",
    avoid: "Avoid random unreadable text, busy layout, and missing hierarchy.",
  },
  文本元素: {
    target: "typography-element or text object",
    instruction:
      "Create a typography-element preview focused on the named text treatment. If readable text is required, keep it short and intentional. If not required, use abstract placeholder marks.",
    avoid: "Avoid gibberish text, random logos, and text dominating unrelated categories.",
  },
  平台媒介: {
    target: "platform-format or media artifact",
    instruction:
      "Create a platform-format preview that resembles the named media output through aspect logic, UI-like framing, crop, density, visual rhythm, and presentation style. Do not use real platform logos.",
    avoid: "Avoid real logos, unclear platform cues, and generic poster output.",
  },
  "真實性 / 缺陷控制": {
    target: "realism or imperfection demonstration",
    instruction:
      "Create a controlled realism or imperfection preview where the named anti-polish detail is visible but not ugly: natural skin, mild asymmetry, lived-in detail, sensor imperfection, or non-studio quality.",
    avoid: "Avoid making the image low quality, making the defect too subtle, or contradicting polished ACG rendering.",
  },
  後期處理: {
    target: "final processing treatment",
    instruction:
      "Create a post-processing preview where the final grade, border, compression, grain, vignette, leak, sharpening, softness, or platform treatment is the main subject.",
    avoid: "Avoid invisible treatment, effects that destroy the image, and confusion with lens texture.",
  },
  "Negative Atom": {
    target: "controlled avoidance diagram",
    instruction:
      "Create a clean instructional preview that communicates an avoided failure mode without making it appealing. Use simple abstract or diagram-like framing, not a polished character portrait.",
    avoid: "Avoid generating the unwanted defect as a desirable style or confusing users by making the excluded content look selectable as a positive visual style.",
  },
  尺寸: {
    target: "aspect-ratio frame guide",
    instruction:
      "Create a clean aspect-ratio frame preview showing the named crop shape and safe composition boundaries. Use simple abstract content, frame outlines, and safe-area cues.",
    avoid: "Avoid character portrait framing, exact-ratio claims the model cannot guarantee, and making the ratio guide look like a content style.",
  },
  質量: {
    target: "quality/fidelity example",
    instruction:
      "Create a clean quality/fidelity preview that demonstrates sharp but natural detail, controlled edges, and polished finish without adding a new subject concept.",
    avoid: "Avoid turning quality control into a generic beautiful image or an unrelated style sample.",
  },
} as const satisfies Record<Category, CategoryPreviewTemplate>;

const DISPLAY_CATEGORY_LABELS: Partial<Record<Category, string>> = {
  "Negative Atom": "Negative constraint",
};

const INTERNAL_TERM_REPLACEMENTS: Array<[RegExp, string]> = [
  [/PromptG/gi, "the source concept"],
  [/library card/gi, "preview tile"],
  [/素材卡/g, "preview tile"],
  [/\batom\b/gi, "concept"],
];

function cleanText(value: string | undefined) {
  const source = value?.trim() ?? "";
  const sanitized = INTERNAL_TERM_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    source,
  );
  return sanitized.replace(/\s+/g, " ").trim();
}

function displayCategory(category: Category) {
  return DISPLAY_CATEGORY_LABELS[category] ?? category;
}

export function buildAtomPreviewPrompt(input: AtomPreviewPromptInput) {
  const template = CATEGORY_PREVIEW_TEMPLATES[input.category];
  const title = cleanText(input.title);
  const subtitle = cleanText(input.subtitle);
  const meaning = cleanText(input.prompt);
  const negative = cleanText(input.negativePrompt);

  return [
    "Create one square 1:1 image that demonstrates one visual concept.",
    "",
    `Concept title: ${title}`,
    `Concept category: ${displayCategory(input.category)}`,
    subtitle ? `Concept subtitle: ${subtitle}` : "",
    `Concept meaning: ${meaning}`,
    negative ? `Negative guidance: ${negative}` : "",
    "",
    "Visual policy:",
    GLOBAL_PREVIEW_STYLE,
    "",
    "Category framing:",
    `Preview target: ${template.target}.`,
    template.instruction,
    `Failure guard: ${template.avoid}`,
    "",
    "Composition requirement:",
    "The concept must be recognizable at small thumbnail size. The image should contain no unrelated concepts and no generic filler that competes with the selected concept.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function assertCategoryPreviewTemplateCoverage() {
  const missing = CATEGORIES.filter((category) => !CATEGORY_PREVIEW_TEMPLATES[category]);
  if (missing.length > 0) {
    throw new Error(`Missing preview prompt template(s): ${missing.join(", ")}`);
  }
}
