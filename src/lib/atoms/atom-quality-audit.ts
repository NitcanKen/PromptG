import type { Category } from "@/lib/constants";
import type { AtomInput } from "@/lib/validation/atoms";

export type AuditedAtom = Omit<AtomInput, "priority" | "lockPolicy"> &
  Partial<Pick<AtomInput, "priority" | "lockPolicy">> & {
    id: string;
    source?: string;
  };

export type AtomQualityFlag =
  | "forbidden-boilerplate"
  | "exact-duplicate-prompt"
  | "near-duplicate-prompt"
  | "repeated-skeleton"
  | "vague-prompt"
  | "category-alignment-risk"
  | "metadata-risk";

export type AtomAuditRecord = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  prompt: string;
  negativePrompt: string;
  tags: string[];
  notes: string;
  source: string;
  flags: AtomQualityFlag[];
  flagDetails: string[];
};

const forbiddenBoilerplate = [
  "reusable character archetype",
  "20-year-old cute Japanese young woman",
  "20 歲日本可愛少女",
  "believable everyday interaction",
  "coherent photographic genre",
  "realistic capture style",
  "fashion top garment",
  "footwear-focused detail",
  "visible accessory detail",
  "platform-aware visual artifact",
  "post-processing treatment",
];

const vagueOnlyTerms = new Set([
  "natural",
  "beautiful",
  "clean",
  "soft",
  "refined",
  "quiet",
  "fresh",
  "gentle",
  "subtle",
  "controlled",
  "realistic",
  "coherent",
  "everyday",
  "elegant",
  "warm",
]);

const categoryKeywords: Partial<Record<Category, RegExp>> = {
  人設: /\b(persona|identity|role|presence|aura|character|commander|idol|engineer|artist|worker|keeper|oracle|detective|guardian|model|curator|witch|knight)\b/i,
  動漫角色: /\b(anime character|anime|character|from)\b/i,
  臉部特徵: /\b(face|facial|cheek|nose|eye shape|eyebrow|lip|jaw|skin|pores|bone structure)\b/i,
  髮型: /\b(hair|hairstyle|bangs|fringe|ponytail|bun|buns|bob|braid|waves|curls|part|strands|updo)\b/i,
  表情: /\b(expression|smile|laugh|mouth|emotion|grin|calm|shy|confident|surprised)\b/i,
  視線: /\b(gaze|looking|eye direction|attention|pupils|eye contact)\b/i,
  "主體數量 / 人物關係": /\b(solo|one main person|two|couple|friends|foreground|secondary|relationship|subject count)\b/i,
  姿態: /\b(pose|standing|seated|leaning|walking|crouching|stretching|posture|body balance)\b/i,
  手部動作: /\b(hand|fingers|gesture|grip|holding|touching|adjusting|peace sign)\b/i,
  身體構圖: /\b(body framing|head and shoulders|torso|waist|knees|full body|crop|visible framing|body visibility)\b/i,
  互動行為: /\b(drinking|shopping|reading|taking|walking|waiting|dancing|conversation|interaction|action|using)\b/i,
  上裝: /\b(shirt|T-shirt|knit|cardigan|blazer|hoodie|camisole|jacket|blouse|vest|top|upper-body)\b/i,
  下裝: /\b(jeans|pants|skirt|shorts|slacks|jogger|lower-body|waistline|hem|pleats)\b/i,
  鞋履: /\b(shoes|sneakers|loafers|boots|sandals|flats|heels|platform|canvas|mules|sole|footwear)\b/i,
  配飾: /\b(earrings|necklace|glasses|hair clip|scarf|watch|bag|rings|hat|belt|accessory)\b/i,
  道具: /\b(phone|cup|book|umbrella|camera|bouquet|headphones|ticket|snack|tote|prop|object)\b/i,
  妝容: /\b(makeup|base makeup|eyeliner|blush|lip|eyeshadow|skin finish|cosmetics)\b/i,
  場景: /\b(cafe|street|station|bookstore|park|rooftop|convenience|location|interior|background|environment)\b/i,
  場景細節: /\b(windowsill|magazines|curtains|lamp|raindrops|sign glow|tableware|background detail|detail)\b/i,
  "時間 / 季節 / 天氣": /\b(morning|afternoon|night|rain|spring|summer|winter|weather|season|atmosphere)\b/i,
  光影: /\b(light|lighting|backlight|flash|neon|overcast|sunset|lamp|shadow|highlights)\b/i,
  色彩系統: /\b(palette|color|colour|grading|tone|cyan|gray|pastel|contrast|saturation|green|blue|violet)\b/i,
  寫真風格: /\b(photography|snapshot|street photography|film photography|lifestyle|catalog|cinematic|portrait style)\b/i,
  鏡頭角度: /\b(camera angle|eye-level|high camera|low camera|perspective|viewpoint)\b/i,
  鏡頭質感: /\b(camera look|lens|smartphone|compact|film camera|capture|imperfections|flash)\b/i,
  景別: /\b(close-up|medium shot|wide shot|half-body shot|shot|camera distance|subject scale)\b/i,
  構圖規則: /\b(composition|centered|rule-of-thirds|negative space|frame structure|visual weight)\b/i,
  畫面影響: /\b(grain|flare|motion blur|overlay|surface effect|visual effect)\b/i,
  版式設計: /\b(layout|collage|poster|scrapbook|arrangement|hierarchy)\b/i,
  文本元素: /\b(text|typography|caption|date|handwritten|letters|type)\b/i,
  平台媒介: /\b(story|feed post|cover image|format|vertical|social|thumbnail|medium)\b/i,
  後期處理: /\b(retouching|color grading|sharpening|post-processing|compression|finish|grade)\b/i,
  材質: /\b(fabric|material|texture|lace|textile|surface)\b/i,
  "真實性 / 缺陷控制": /\b(realistic|imperfection|pores|not plastic|skin texture|human skin)\b/i,
  "Negative Atom": /\b(extra|malformed|fused|broken|distorted|bad|wrong|low quality)\b/i,
  尺寸: /\b(aspect ratio|9:16|vertical|horizontal|crop|mobile image)\b/i,
  質量: /\b(quality|clean details|sharp|rendering|fidelity|output)\b/i,
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactSkeleton(text: string) {
  return normalize(text)
    .replace(/\b(natural everyday|refined editorial|fresh clean|quiet cool toned)\b/g, "<variant>")
    .replace(/\b(soft and gentle|clean and defined|light airy|warm approachable)\b/g, "<variant>")
    .replace(/\b(minimal refined|casual everyday|urban contemporary|soft romantic)\b/g, "<variant>")
    .replace(/\b(subtle controlled|clear readable|textured tactile|dynamic lively)\b/g, "<variant>")
    .replace(/\b\d+\b/g, "<number>");
}

function promptSuffix(text: string) {
  return text
    .split(",")
    .slice(1)
    .join(",")
    .trim()
    .toLowerCase();
}

function hasCjk(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

function isAnimeCharacterRecord(record: AtomAuditRecord) {
  return record.source === "anime-character-atoms";
}

function wordTokens(text: string) {
  return normalize(text)
    .split(" ")
    .filter(Boolean);
}

function distinctConcreteTokenCount(text: string) {
  return new Set(wordTokens(text).filter((token) => !vagueOnlyTerms.has(token))).size;
}

export function auditAtoms(atoms: AuditedAtom[]) {
  const records: AtomAuditRecord[] = atoms.map((atom) => ({
    id: atom.id,
    category: atom.category,
    title: atom.title,
    subtitle: atom.subtitle,
    prompt: atom.prompt,
    negativePrompt: atom.negativePrompt,
    tags: atom.tags,
    notes: atom.notes,
    source: atom.source ?? "seed-atoms",
    flags: [],
    flagDetails: [],
  }));

  const byPrompt = new Map<string, AtomAuditRecord[]>();
  const byNearPrompt = new Map<string, AtomAuditRecord[]>();
  const byCategorySkeleton = new Map<string, AtomAuditRecord[]>();
  const byCategorySuffix = new Map<string, AtomAuditRecord[]>();

  for (const record of records) {
    const normalizedPrompt = normalize(record.prompt);
    const nearPrompt = compactSkeleton(record.prompt);
    const skeleton = `${record.category}:${compactSkeleton(record.prompt.replace(/^[^,]+,?\s*/, ""))}`;
    const suffix = `${record.category}:${promptSuffix(record.prompt)}`;

    byPrompt.set(normalizedPrompt, [...(byPrompt.get(normalizedPrompt) ?? []), record]);
    byNearPrompt.set(nearPrompt, [...(byNearPrompt.get(nearPrompt) ?? []), record]);
    byCategorySkeleton.set(skeleton, [...(byCategorySkeleton.get(skeleton) ?? []), record]);
    if (promptSuffix(record.prompt).length > 20) {
      byCategorySuffix.set(suffix, [...(byCategorySuffix.get(suffix) ?? []), record]);
    }

    const haystack = `${record.prompt}\n${record.negativePrompt}\n${record.notes}`;
    const forbiddenHit = forbiddenBoilerplate.find((term) => haystack.includes(term));
    if (forbiddenHit) {
      record.flags.push("forbidden-boilerplate");
      record.flagDetails.push(`Forbidden boilerplate: ${forbiddenHit}`);
    }

    if (
      !isAnimeCharacterRecord(record) &&
      (record.prompt.length < 42 || distinctConcreteTokenCount(record.prompt) < 5)
    ) {
      record.flags.push("vague-prompt");
      record.flagDetails.push("Prompt is too short or mostly generic modifiers.");
    }

    const categoryPattern = categoryKeywords[record.category];
    if (categoryPattern && !categoryPattern.test(record.prompt)) {
      record.flags.push("category-alignment-risk");
      record.flagDetails.push("Prompt lacks expected category-specific language.");
    }

    if (
      !isAnimeCharacterRecord(record) &&
      (!hasCjk(record.title) ||
        !hasCjk(record.subtitle) ||
        !record.tags.every(hasCjk) ||
        !hasCjk(record.notes))
    ) {
      record.flags.push("metadata-risk");
      record.flagDetails.push("UI-facing metadata should remain Traditional Chinese.");
    }
  }

  for (const duplicates of byPrompt.values()) {
    if (duplicates.length > 1) {
      for (const record of duplicates) {
        record.flags.push("exact-duplicate-prompt");
        record.flagDetails.push(`Exact duplicate prompt with: ${duplicates.map((item) => item.id).join(", ")}`);
      }
    }
  }

  for (const duplicates of byNearPrompt.values()) {
    if (duplicates.length > 1) {
      for (const record of duplicates) {
        record.flags.push("near-duplicate-prompt");
        record.flagDetails.push(`Near duplicate prompt with: ${duplicates.map((item) => item.id).join(", ")}`);
      }
    }
  }

  for (const duplicateGroup of [...byCategorySkeleton.values(), ...byCategorySuffix.values()]) {
    const duplicates = duplicateGroup.filter((record) => !isAnimeCharacterRecord(record));
    if (duplicates.length >= 8) {
      for (const record of duplicates) {
        record.flags.push("repeated-skeleton");
        record.flagDetails.push(`Repeated prompt skeleton across ${duplicates.length} atoms in ${record.category}.`);
      }
    }
  }

  for (const record of records) {
    record.flags = [...new Set(record.flags)];
    record.flagDetails = [...new Set(record.flagDetails)];
  }

  const flaggedRecords = records.filter((record) => record.flags.length > 0);

  return {
    records,
    flaggedRecords,
    summary: {
      total: records.length,
      flagged: flaggedRecords.length,
      byFlag: flaggedRecords.reduce<Record<AtomQualityFlag, number>>(
        (counts, record) => {
          for (const flag of record.flags) {
            counts[flag] += 1;
          }
          return counts;
        },
        {
          "forbidden-boilerplate": 0,
          "exact-duplicate-prompt": 0,
          "near-duplicate-prompt": 0,
          "repeated-skeleton": 0,
          "vague-prompt": 0,
          "category-alignment-risk": 0,
          "metadata-risk": 0,
        },
      ),
    },
  };
}
