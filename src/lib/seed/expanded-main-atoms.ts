import type { Category, LockPolicy, PromptPriority } from "@/lib/constants";
import type { ExpandedAtom, ExpandedAtomSource } from "@/lib/seed/expanded-atoms";

type Axis = {
  slug: string;
  zh: string;
  en: string;
  tag: string;
};

type SeriesDefinition = {
  source: ExpandedAtomSource;
  category: Category;
  slugPrefix: string;
  count: number;
  bases: Axis[];
  variants: Axis[];
  priority?: PromptPriority;
  lockPolicy?: LockPolicy;
  title: (base: Axis, variant: Axis) => string;
  subtitle: (base: Axis, variant: Axis) => string;
  prompt: (base: Axis, variant: Axis) => string;
  negativePrompt: (base: Axis, variant: Axis) => string;
  notes: (base: Axis, variant: Axis) => string;
};

const everydayVariants: Axis[] = [
  { slug: "natural", zh: "自然", en: "natural everyday", tag: "自然" },
  { slug: "editorial", zh: "編輯", en: "refined editorial", tag: "編輯感" },
  { slug: "fresh", zh: "清爽", en: "fresh clean", tag: "清爽" },
  { slug: "quiet", zh: "清冷", en: "quiet cool-toned", tag: "清冷" },
];

const softVariants: Axis[] = [
  { slug: "soft", zh: "柔和", en: "soft and gentle", tag: "柔和" },
  { slug: "clear", zh: "乾淨", en: "clean and defined", tag: "乾淨" },
  { slug: "light", zh: "輕盈", en: "light airy", tag: "輕盈" },
  { slug: "warm", zh: "溫暖", en: "warm approachable", tag: "溫暖" },
];

const styleVariants: Axis[] = [
  { slug: "minimal", zh: "極簡", en: "minimal refined", tag: "極簡" },
  { slug: "casual", zh: "日常", en: "casual everyday", tag: "日常" },
  { slug: "urban", zh: "都市", en: "urban contemporary", tag: "都市" },
  { slug: "romantic", zh: "浪漫", en: "soft romantic", tag: "浪漫" },
];

const visualVariants: Axis[] = [
  { slug: "subtle", zh: "低調", en: "subtle controlled", tag: "低調" },
  { slug: "clear", zh: "清晰", en: "clear readable", tag: "清晰" },
  { slug: "textured", zh: "有質感", en: "textured tactile", tag: "質感" },
  { slug: "dynamic", zh: "有動態", en: "dynamic lively", tag: "動態" },
];

function padIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function axisDetail(axis: Axis, noun: string) {
  const readableSlug = axis.slug.replace(/-/g, " ");
  return `${noun} keeps ${axis.en} visually dominant, with readable ${readableSlug} contours and concrete category detail`;
}

function variantDetail(variant: Axis) {
  const details: Record<string, string> = {
    natural: "unposed edges, mild asymmetry, ordinary-life restraint",
    editorial: "precise silhouette, intentional styling, magazine-ready polish",
    fresh: "clear edges, light visual weight, uncluttered readable form",
    quiet: "muted contrast, reserved attitude, cool restrained presence",
    soft: "rounded transitions, low tension, gentle readable contours",
    clear: "defined boundaries, crisp shape language, easy visual recognition",
    light: "airy spacing, reduced heaviness, delicate secondary details",
    warm: "approachable color temperature, softened contrast, welcoming presence",
    minimal: "simple lines, reduced ornament, clean negative space",
    casual: "wearable everyday handling, relaxed fit, practical proportions",
    urban: "contemporary street-ready finish, sharper edges, city styling cues",
    romantic: "softer drape, graceful accents, gentle decorative rhythm",
    subtle: "low-intensity application, restrained visibility, no harsh dominance",
    textured: "tactile surface cues, small material irregularities, visible depth",
    dynamic: "directional movement, lively rhythm, controlled visual energy",
  };

  return details[variant.slug] ?? `${variant.en} treatment with visible category-specific difference`;
}

function buildSeriesPrompt(base: Axis, variant: Axis, noun: string, tail: string) {
  return `${base.en}, ${axisDetail(base, noun)}, ${variant.en} treatment, ${variantDetail(variant)}, ${tail}`;
}

function zhTitle(base: Axis, variant: Axis) {
  return base.zh.startsWith(variant.zh) ? base.zh : `${variant.zh}${base.zh}`;
}

function createSeries(definition: SeriesDefinition): ExpandedAtom[] {
  const atoms: ExpandedAtom[] = [];

  for (const base of definition.bases) {
    for (const variant of definition.variants) {
      if (atoms.length >= definition.count) {
        return atoms;
      }

      atoms.push({
        id: `library-${definition.slugPrefix}-${padIndex(atoms.length)}`,
        source: definition.source,
        category: definition.category,
        title: definition.title(base, variant),
        subtitle: definition.subtitle(base, variant),
        previewImagePath: "",
        prompt: definition.prompt(base, variant),
        negativePrompt: definition.negativePrompt(base, variant),
        priority: definition.priority ?? "medium",
        lockPolicy: definition.lockPolicy ?? "normal",
        tags: [base.tag, variant.tag, definition.category],
        notes: definition.notes(base, variant),
      });
    }
  }

  if (atoms.length === definition.count) {
    return atoms;
  }

  throw new Error(`${definition.category} 素材數不足，無法產生 ${definition.count} 筆`);
}

const curatedPersonaSpecs: Array<{
  title: string;
  subtitle: string;
  prompt: string;
  negativePrompt: string;
  tags: string[];
  notes: string;
}> = [
  {
    title: "星際戰術指揮官",
    subtitle: "冷靜掌控艦隊戰局的科幻軍官型角色",
    prompt:
      "adult East Asian ACG starship tactical commander persona, crisp command presence, sharp strategic gaze, structured sci-fi officer aura, distinctive leadership silhouette",
    negativePrompt: "ordinary office worker, casual commuter, generic street portrait, celebrity likeness, military logo",
    tags: ["人設", "科幻", "指揮官", "戰術", "英氣"],
    notes: "用於需要明確權威感與科幻軍官辨識度的人設，不含具體髮型或服裝品牌。",
  },
  {
    title: "地下偶像王牌",
    subtitle: "小型舞台中心位、帶強烈表演野心的偶像角色",
    prompt:
      "adult East Asian ACG underground idol ace persona, stage-center charisma, sparkling performance aura, ambitious expressive presence, recognizable idol trainee-to-star energy",
    negativePrompt: "ordinary passerby, bland commuter, generic schoolgirl, underage, real idol likeness",
    tags: ["人設", "偶像", "舞台", "王牌", "表演"],
    notes: "比一般偶像練習生更有中心位氣場，適合角色卡與舞台感素材。",
  },
  {
    title: "魔導鐵匠",
    subtitle: "將鍛造技術與魔法紋路結合的工匠型角色",
    prompt:
      "adult East Asian ACG magical blacksmith persona, arcane forge expertise, strong artisan presence, glowing rune-craft aura, practical fantasy worker identity",
    negativePrompt: "generic fantasy girl, ordinary cafe worker, clean office look, brand logo",
    tags: ["人設", "魔法", "鐵匠", "工匠", "幻想"],
    notes: "適合需要工匠、魔法、力量感結合的人設。",
  },
  {
    title: "深海通訊員",
    subtitle: "在海底基地維持訊號連線的孤獨技術角色",
    prompt:
      "adult East Asian ACG deep-sea communications officer persona, quiet pressure-resistant focus, blue underwater base aura, technical loneliness, signal-monitoring role identity",
    negativePrompt: "ordinary student, generic office portrait, beach tourist, random aquarium visitor",
    tags: ["人設", "深海", "通訊", "技術", "孤獨感"],
    notes: "用於海底、科研、孤獨技術職能，不等同普通研究員。",
  },
  {
    title: "妖怪契約師",
    subtitle: "與異界存在訂立契約的現代靈異角色",
    prompt:
      "adult East Asian ACG yokai contract mediator persona, modern occult presence, calm dangerous negotiation aura, spiritual paper charm atmosphere, distinctive supernatural identity",
    negativePrompt: "generic shrine tourist, ordinary commuter, childish witch costume, copyrighted monster",
    tags: ["人設", "妖怪", "契約", "靈異", "現代"],
    notes: "適合都市怪談與靈異題材，角色辨識度應高於普通巫女。",
  },
  {
    title: "霓虹賽車手",
    subtitle: "夜間城市街頭疾駛的高壓競速角色",
    prompt:
      "adult East Asian ACG neon street racer persona, high-speed urban confidence, fearless night-race aura, sleek competitive identity, sharp adrenaline presence",
    negativePrompt: "ordinary cyclist, generic street portrait, brand car logo, reckless unsafe realism",
    tags: ["人設", "賽車", "霓虹", "街頭", "速度感"],
    notes: "用於速度、競技、夜間都市感人設，不要和普通通勤混淆。",
  },
  {
    title: "王城密探",
    subtitle: "穿梭於宮廷陰影中的情報與偽裝角色",
    prompt:
      "adult East Asian ACG royal court spy persona, elegant concealed danger, palace intrigue aura, controlled secretive expression, refined disguise-based identity",
    negativePrompt: "modern office worker, generic noblewoman, celebrity likeness, obvious assassin cliché",
    tags: ["人設", "宮廷", "密探", "情報", "危險感"],
    notes: "適合古典權謀與情報任務，不只是優雅貴族。",
  },
  {
    title: "機甲整備士",
    subtitle: "在大型機體旁工作的專業維修與戰場後勤角色",
    prompt:
      "adult East Asian ACG mecha maintenance engineer persona, practical hangar expertise, oil-and-metal workshop aura, focused mechanical confidence, battlefield support identity",
    negativePrompt: "spaceship engineer clone, ordinary factory worker, brand logo, generic lab coat",
    tags: ["人設", "機甲", "整備", "工程", "後勤"],
    notes: "比一般工程師更偏機甲、戰場後勤與維修辨識度。",
  },
  {
    title: "夢境駭客",
    subtitle: "入侵夢境系統並修改記憶片段的超現實角色",
    prompt:
      "adult East Asian ACG dream hacker persona, surreal cyber-psychic presence, lucid dream intrusion aura, fragmented memory manipulation identity, cool uncanny charisma",
    negativePrompt: "ordinary programmer, generic cyberpunk girl, sleepwear-only concept, brand logo",
    tags: ["人設", "夢境", "駭客", "超現實", "賽博"],
    notes: "適合夢境、記憶、賽博精神世界題材。",
  },
  {
    title: "月下刀術師",
    subtitle: "以克制身法與冷月氣場呈現的武技角色",
    prompt:
      "adult East Asian ACG moonlit sword practitioner persona, restrained martial elegance, quiet blade discipline, cold lunar aura, distinctive warrior silhouette",
    negativePrompt: "generic samurai copy, copyrighted character, ordinary street portrait, excessive gore",
    tags: ["人設", "刀術", "月光", "武技", "冷感"],
    notes: "用於武技與冷月氛圍，避免變成普通古風少女。",
  },
  {
    title: "靈能法醫",
    subtitle: "以通靈能力讀取案件殘留訊息的懸疑角色",
    prompt:
      "adult East Asian ACG psychic forensic investigator persona, clinical mystery aura, calm supernatural evidence reading, precise investigative identity, eerie professional presence",
    negativePrompt: "ordinary doctor, generic detective, horror gore, celebrity likeness",
    tags: ["人設", "法醫", "靈能", "懸疑", "調查"],
    notes: "比偵探更偏法醫與超自然證據解讀。",
  },
  {
    title: "異能拍賣官",
    subtitle: "掌控高危收藏品交易的優雅危險角色",
    prompt:
      "adult East Asian ACG supernatural auction master persona, elegant transactional danger, rare artifact authority, theatrical composed charisma, luxury black-market identity",
    negativePrompt: "ordinary shop clerk, generic antique owner, brand logo, plain business portrait",
    tags: ["人設", "拍賣", "異能", "高級感", "黑市"],
    notes: "適合神秘高級與收藏品黑市設定。",
  },
  {
    title: "邊境郵差",
    subtitle: "在荒原與小城之間傳遞信件的旅人角色",
    prompt:
      "adult East Asian ACG frontier courier persona, weather-worn travel aura, quiet responsibility, long-road messenger identity, nostalgic adventure presence",
    negativePrompt: "urban commuter, generic traveler, delivery brand uniform, ordinary passerby",
    tags: ["人設", "郵差", "邊境", "旅行", "責任感"],
    notes: "不是普通旅行人物，重點是邊境、信件與長路任務感。",
  },
  {
    title: "古籍修復師",
    subtitle: "修補禁書與舊文獻的安靜知識型角色",
    prompt:
      "adult East Asian ACG forbidden manuscript restorer persona, delicate archival expertise, quiet scholarly mystery, paper-and-ink ritual aura, rare book preservation identity",
    negativePrompt: "ordinary librarian, generic student, random bookstore owner, brand logo",
    tags: ["人設", "古籍", "修復", "知識", "神秘"],
    notes: "比圖書管理員更專注於修復、禁書與紙張工藝。",
  },
  {
    title: "異星植物獵人",
    subtitle: "在未知星球採集危險植物標本的探索角色",
    prompt:
      "adult East Asian ACG alien botanist hunter persona, adventurous exoplanet fieldwork aura, hazardous plant specimen expertise, quiet survival curiosity, sci-fi explorer identity",
    negativePrompt: "ordinary gardener, generic botanist, beach traveler, brand logo",
    tags: ["人設", "異星", "植物", "探索", "科幻"],
    notes: "比普通植物學家更有異星採集與危險探索感。",
  },
  {
    title: "黑塔占卜師",
    subtitle: "居於高塔中解讀災厄預兆的黑暗幻想角色",
    prompt:
      "adult East Asian ACG black tower oracle persona, ominous prophecy aura, elegant dark fantasy presence, distant all-seeing gaze, symbolic divination identity",
    negativePrompt: "ordinary fortune teller, generic witch, childish costume, copyrighted fantasy IP",
    tags: ["人設", "占卜", "黑塔", "預言", "暗黑"],
    notes: "適合黑暗幻想與預言角色，不是普通都市占星師。",
  },
  {
    title: "神經潛航員",
    subtitle: "進入他人意識深處執行任務的科幻角色",
    prompt:
      "adult East Asian ACG neural diver persona, consciousness exploration aura, calm psychological mission focus, sci-fi mind-interface identity, surreal clinical presence",
    negativePrompt: "ordinary therapist, generic hacker, sleepwear concept, brand logo",
    tags: ["人設", "神經", "潛航", "意識", "科幻"],
    notes: "用於心理、意識、科幻介面題材，與夢境駭客可區分。",
  },
  {
    title: "雨巷藥販",
    subtitle: "在潮濕舊城中販售秘藥的神秘角色",
    prompt:
      "adult East Asian ACG rainy alley medicine vendor persona, damp old-city mystery, quiet persuasive gaze, herbal secret-trade identity, noir folklore atmosphere",
    negativePrompt: "ordinary pharmacist, generic shop worker, modern drug branding, unsafe real medicine ad",
    tags: ["人設", "秘藥", "雨巷", "民俗", "神秘"],
    notes: "帶民俗與 noir 交易感，不是普通藥劑師。",
  },
  {
    title: "幻獸訓練師",
    subtitle: "與幻想生物建立默契的冒險型角色",
    prompt:
      "adult East Asian ACG mythical beast trainer persona, gentle commanding bond, fantasy companion aura, field-ready adventure identity, expressive creature-handler presence",
    negativePrompt: "copyrighted monster trainer, ordinary pet owner, childish costume, brand logo",
    tags: ["人設", "幻獸", "訓練師", "冒險", "幻想"],
    notes: "可搭配道具或場景，但人設本身先建立訓練師身份。",
  },
  {
    title: "銀河歌姬",
    subtitle: "以歌聲跨越星港舞台的宇宙偶像角色",
    prompt:
      "adult East Asian ACG galactic diva persona, cosmic stage charisma, luminous performance identity, elegant futuristic singing aura, starport concert presence",
    negativePrompt: "ordinary idol trainee, real singer likeness, generic microphone portrait, brand logo",
    tags: ["人設", "歌姬", "宇宙", "舞台", "偶像"],
    notes: "比地下偶像更偏宇宙舞台與歌姬辨識度。",
  },
  {
    title: "結界巡守者",
    subtitle: "維護城市邊界結界的沉默守護角色",
    prompt:
      "adult East Asian ACG boundary ward patrol persona, silent guardian aura, urban spiritual defense identity, calm barrier-maintenance focus, modern exorcist presence",
    negativePrompt: "ordinary security guard, generic shrine maiden, police uniform, brand logo",
    tags: ["人設", "結界", "守護", "除靈", "都市"],
    notes: "適合都市靈異防衛，不等於一般保鏢。",
  },
  {
    title: "塔羅決鬥者",
    subtitle: "以卡牌象徵與戰鬥儀式構成的華麗角色",
    prompt:
      "adult East Asian ACG tarot duelist persona, symbolic card-battle aura, theatrical confident presence, mystical strategy identity, ornate but readable character silhouette",
    negativePrompt: "ordinary card player, casino theme, copyrighted card game character, brand logo",
    tags: ["人設", "塔羅", "決鬥", "儀式", "華麗"],
    notes: "用於卡牌、象徵、戰鬥儀式角色。",
  },
  {
    title: "雲端庭師",
    subtitle: "照料漂浮花園與氣象植物的幻想角色",
    prompt:
      "adult East Asian ACG sky garden caretaker persona, floating botanical fantasy aura, gentle weather-plant expertise, airy serene identity, soft elevated-world presence",
    negativePrompt: "ordinary gardener, cafe worker, generic fantasy girl, brand logo",
    tags: ["人設", "庭師", "天空", "植物", "幻想"],
    notes: "比普通花店角色更偏天空花園與幻想世界職能。",
  },
  {
    title: "廢墟歌者",
    subtitle: "在末世遺跡中用歌聲維持希望的角色",
    prompt:
      "adult East Asian ACG ruin singer persona, post-apocalyptic fragile hope, quiet vocal presence, dust-lit survivor charisma, melancholic performance identity",
    negativePrompt: "ordinary street singer, generic idol, excessive disaster gore, brand logo",
    tags: ["人設", "廢墟", "歌者", "末世", "希望感"],
    notes: "適合末世與音樂情緒，不等同地下樂隊主唱。",
  },
  {
    title: "白狐使者",
    subtitle: "帶有神使氣質與狡黠感的和風幻想角色",
    prompt:
      "adult East Asian ACG white fox envoy persona, elegant trickster-divine aura, refined Japanese folklore presence, calm sly gaze, spiritual messenger identity",
    negativePrompt: "childlike fox costume, copyrighted kemonomimi character, ordinary shrine tourist, mascot look",
    tags: ["人設", "白狐", "神使", "和風", "民俗"],
    notes: "可有民俗暗示，但不要變成幼態獸耳角色。",
  },
  {
    title: "都市煉金術士",
    subtitle: "在現代城市中以化學與符號術式工作的人物",
    prompt:
      "adult East Asian ACG urban alchemist persona, modern occult chemistry aura, precise symbolic craft identity, quiet experimental confidence, city-magic hybrid presence",
    negativePrompt: "ordinary chemist, generic witch, lab coat only, brand logo",
    tags: ["人設", "煉金", "都市", "化學", "魔法"],
    notes: "適合現代魔法與實驗氣質，不是普通研究員。",
  },
  {
    title: "影劇替身演員",
    subtitle: "在片場執行高難度動作的專業角色",
    prompt:
      "adult East Asian ACG stunt performer persona, disciplined action-set energy, professional risk control, cinematic movement identity, confident physical presence",
    negativePrompt: "ordinary actor portrait, generic model, unsafe injury depiction, brand logo",
    tags: ["人設", "替身", "動作", "片場", "專業"],
    notes: "用於動作與片場職能，不只是演員或模特。",
  },
  {
    title: "海霧燈塔守",
    subtitle: "守望海霧與失蹤船隻傳聞的孤獨角色",
    prompt:
      "adult East Asian ACG sea-fog lighthouse keeper persona, solitary coastal vigilance, mysterious maritime aura, quiet warning-light identity, weathered romantic presence",
    negativePrompt: "ordinary traveler, harbor tourist, generic sailor, brand logo",
    tags: ["人設", "燈塔", "海霧", "孤獨", "海港"],
    notes: "比海港旅人更偏守望、海霧與燈塔職責。",
  },
  {
    title: "時間檔案員",
    subtitle: "管理錯位時間線與封存記錄的科幻角色",
    prompt:
      "adult East Asian ACG time archive custodian persona, temporal record authority, calm paradox-management aura, elegant archive-tech identity, quiet reality-bending presence",
    negativePrompt: "ordinary office archivist, generic librarian, clock costume cliché, brand logo",
    tags: ["人設", "時間", "檔案", "科幻", "管理者"],
    notes: "適合時間線、資料、秩序管理題材。",
  },
];

function createCuratedPersonaAtoms(): ExpandedAtom[] {
  return curatedPersonaSpecs.map((spec, index) => ({
    id: `library-persona-${padIndex(index)}`,
    source: "subject-atoms",
    category: "人設",
    title: spec.title,
    subtitle: spec.subtitle,
    previewImagePath: "",
    prompt: spec.prompt,
    negativePrompt: spec.negativePrompt,
    priority: "medium",
    lockPolicy: "normal",
    tags: spec.tags,
    notes: spec.notes,
  }));
}

const seriesDefinitions: SeriesDefinition[] = [
  {
    source: "subject-atoms",
    category: "臉部特徵",
    slugPrefix: "face",
    count: 29,
    bases: [
      { slug: "oval", zh: "柔和鵝蛋臉", en: "soft oval face shape", tag: "臉型" },
      { slug: "cheek", zh: "自然臉頰", en: "natural soft cheeks", tag: "臉頰" },
      { slug: "nose", zh: "清晰鼻樑", en: "clean defined nose bridge", tag: "鼻樑" },
      { slug: "eyes", zh: "明亮眼型", en: "clear bright eye shape", tag: "眼型" },
      { slug: "brows", zh: "自然眉型", en: "natural balanced eyebrows", tag: "眉型" },
      { slug: "lips", zh: "柔和唇形", en: "soft natural lip shape", tag: "唇形" },
      { slug: "jaw", zh: "乾淨下顎線", en: "clean gentle jawline", tag: "下顎線" },
      { slug: "skin", zh: "自然肌理", en: "realistic natural skin texture", tag: "肌理" },
    ],
    variants: softVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `強化${base.zh}但不改變表情`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "facial feature", "facial structure stays separate from expression, makeup, and gaze direction"),
    negativePrompt: () => "exaggerated facial structure, distorted face, heavy expression, doll-like plastic skin",
    notes: (base, variant) => `適合微調${base.zh}的${variant.zh}程度，不應混入表情或妝容。`,
  },
  {
    source: "subject-atoms",
    category: "表情",
    slugPrefix: "expression",
    count: 29,
    bases: [
      { slug: "smile", zh: "淺笑", en: "soft slight smile", tag: "微笑" },
      { slug: "laugh", zh: "輕笑", en: "gentle small laugh", tag: "笑容" },
      { slug: "calm", zh: "平靜", en: "calm relaxed expression", tag: "平靜" },
      { slug: "cool", zh: "冷淡", en: "cool detached expression", tag: "冷感" },
      { slug: "curious", zh: "好奇", en: "curious attentive expression", tag: "好奇" },
      { slug: "shy", zh: "害羞", en: "shy reserved expression", tag: "害羞" },
      { slug: "confident", zh: "自信", en: "confident composed expression", tag: "自信" },
      { slug: "surprised", zh: "微驚訝", en: "subtle surprised expression", tag: "驚訝" },
    ],
    variants: softVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `嘴角與眼神呈現${base.zh}情緒`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "facial expression", "mouth shape, eyelid tension, and cheek movement define the emotion without changing gaze direction"),
    negativePrompt: () => "exaggerated grin, distorted mouth, asymmetrical expression, forced emotion",
    notes: (base, variant) => `用於控制${variant.zh}${base.zh}，不包含視線方向。`,
  },
  {
    source: "subject-atoms",
    category: "視線",
    slugPrefix: "gaze",
    count: 19,
    bases: [
      { slug: "camera", zh: "看鏡頭", en: "looking directly at camera", tag: "看鏡頭" },
      { slug: "side", zh: "看向側邊", en: "looking to the side", tag: "側視" },
      { slug: "down", zh: "低頭視線", en: "looking downward", tag: "低頭" },
      { slug: "up", zh: "抬眼視線", en: "eyes looking slightly upward", tag: "抬眼" },
      { slug: "phone", zh: "看手機", en: "looking at a phone", tag: "手機" },
      { slug: "window", zh: "看窗外", en: "looking out the window", tag: "窗外" },
      { slug: "away", zh: "避開鏡頭", en: "gaze averted from camera", tag: "不看鏡頭" },
    ],
    variants: softVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `控制人物眼神焦點為${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "gaze direction", "pupil direction, eyelid orientation, and attention target are explicit without changing the emotion"),
    negativePrompt: () => "cross-eyed gaze, unfocused pupils, mismatched eye direction, random stare",
    notes: (base, variant) => `適合指定${base.zh}的${variant.zh}視線，不改變表情。`,
  },
  {
    source: "subject-atoms",
    category: "主體數量 / 人物關係",
    slugPrefix: "relationship",
    count: 9,
    bases: [
      { slug: "duo-friends", zh: "雙人好友", en: "two close friends", tag: "雙人" },
      { slug: "couple", zh: "雙人情侶", en: "adult couple portrait", tag: "情侶" },
      { slug: "foreground", zh: "前後景人物", en: "one foreground subject with a secondary background person", tag: "前後景" },
    ],
    variants: softVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `控制畫面中的${base.zh}關係`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "subject relationship", "subject count, spacing, and foreground-background relationship are explicit"),
    negativePrompt: () => "unexpected crowd, duplicated person, extra subjects, unclear relationship",
    notes: (base, variant) => `用於固定${variant.zh}${base.zh}，避免模型自行增減人物。`,
    priority: "strong",
  },
  {
    source: "body-atoms",
    category: "姿態",
    slugPrefix: "pose",
    count: 29,
    bases: [
      { slug: "standing", zh: "放鬆站姿", en: "relaxed standing pose", tag: "站姿" },
      { slug: "sitting", zh: "自然坐姿", en: "natural seated pose", tag: "坐姿" },
      { slug: "turn-back", zh: "回身姿態", en: "turning back over shoulder pose", tag: "回身" },
      { slug: "lean-wall", zh: "靠牆姿態", en: "leaning casually against a wall", tag: "靠牆" },
      { slug: "walk", zh: "行走姿態", en: "walking pose with natural stride", tag: "行走" },
      { slug: "crouch", zh: "低身蹲姿", en: "low crouching pose", tag: "蹲姿" },
      { slug: "stretch", zh: "伸展姿態", en: "gentle stretching pose", tag: "伸展" },
      { slug: "mirror", zh: "鏡前姿態", en: "mirror-facing pose", tag: "鏡前" },
    ],
    variants: visualVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `全身動作以${base.zh}為主`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "whole-body pose", "weight placement, torso angle, and limb balance define the posture"),
    negativePrompt: () => "awkward anatomy, broken joints, stiff mannequin pose, extra limbs",
    notes: (base, variant) => `用於指定${variant.zh}${base.zh}，不包含手部細節。`,
  },
  {
    source: "body-atoms",
    category: "手部動作",
    slugPrefix: "hand",
    count: 29,
    bases: [
      { slug: "hair", zh: "整理頭髮", en: "hand gently adjusting hair", tag: "頭髮" },
      { slug: "collar", zh: "整理衣領", en: "hand adjusting collar", tag: "衣領" },
      { slug: "cheek", zh: "輕碰臉頰", en: "fingers lightly touching cheek", tag: "臉頰" },
      { slug: "bag", zh: "扶著包帶", en: "hand holding bag strap", tag: "包帶" },
      { slug: "cup", zh: "拿著杯子", en: "hand holding a cup", tag: "杯子" },
      { slug: "peace", zh: "自然比耶", en: "natural peace sign gesture", tag: "手勢" },
      { slug: "pocket", zh: "手放口袋", en: "hand resting in pocket", tag: "口袋" },
      { slug: "phone", zh: "滑手機", en: "hand using a phone", tag: "手機" },
    ],
    variants: softVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `局部手勢呈現${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "hand gesture", "finger spacing, wrist angle, and contact point are anatomically clear"),
    negativePrompt: () => "extra fingers, fused fingers, malformed hands, impossible grip",
    notes: (base, variant) => `可疊加使用，適合補充${variant.zh}${base.zh}的局部動作。`,
  },
  {
    source: "body-atoms",
    category: "身體構圖",
    slugPrefix: "body-framing",
    count: 29,
    bases: [
      { slug: "head-shoulder", zh: "頭肩構圖", en: "head and shoulders body framing", tag: "頭肩" },
      { slug: "bust", zh: "胸像構圖", en: "bust framing with upper torso", tag: "胸像" },
      { slug: "waist", zh: "腰上構圖", en: "waist-up body framing", tag: "腰上" },
      { slug: "knees", zh: "膝上構圖", en: "knees-up body framing", tag: "膝上" },
      { slug: "full-body", zh: "全身構圖", en: "full body visible framing", tag: "全身" },
      { slug: "back", zh: "背面構圖", en: "back view body framing", tag: "背面" },
      { slug: "side", zh: "側身構圖", en: "side profile body framing", tag: "側身" },
      { slug: "detail", zh: "局部身體構圖", en: "cropped body detail framing", tag: "局部" },
    ],
    variants: visualVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `身體可見範圍以${base.zh}為主`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "body-framing crop", "visible body range, crop boundary, and silhouette priority are unambiguous"),
    negativePrompt: () => "cut-off face, missing limbs, awkward crop, hidden body structure",
    notes: (base, variant) => `控制${variant.zh}${base.zh}，和鏡頭景別分開管理。`,
  },
  {
    source: "body-atoms",
    category: "互動行為",
    slugPrefix: "interaction",
    count: 29,
    bases: [
      { slug: "coffee", zh: "喝咖啡", en: "drinking coffee", tag: "咖啡" },
      { slug: "shopping", zh: "逛街", en: "casual shopping walk", tag: "逛街" },
      { slug: "reading", zh: "翻書閱讀", en: "reading or flipping through a book", tag: "閱讀" },
      { slug: "photo", zh: "拍照紀錄", en: "taking a casual photo", tag: "拍照" },
      { slug: "umbrella", zh: "撐傘行走", en: "walking with an umbrella", tag: "雨傘" },
      { slug: "waiting", zh: "等待中", en: "waiting casually", tag: "等待" },
      { slug: "dancing", zh: "輕微舞動", en: "subtle dancing movement", tag: "舞動" },
      { slug: "chatting", zh: "自然聊天", en: "casual conversation interaction", tag: "聊天" },
    ],
    variants: everydayVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `人物正在進行${base.zh}行為`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "interaction action", "the subject actively uses the named object or environment with readable cause-and-effect"),
    negativePrompt: () => "unclear action, impossible object interaction, stiff staged behavior, extra people",
    notes: (base, variant) => `用於讓畫面從靜態人像變成${zhTitle(base, variant)}。`,
  },
  {
    source: "styling-atoms-part-1",
    category: "上裝",
    slugPrefix: "top",
    count: 39,
    bases: [
      { slug: "shirt", zh: "襯衫", en: "button-up shirt", tag: "襯衫" },
      { slug: "tee", zh: "素色 T 恤", en: "plain T-shirt", tag: "T恤" },
      { slug: "knit", zh: "針織上衣", en: "knit top", tag: "針織" },
      { slug: "cardigan", zh: "開衫", en: "cardigan", tag: "開衫" },
      { slug: "blazer", zh: "西裝外套", en: "tailored blazer", tag: "外套" },
      { slug: "hoodie", zh: "連帽上衣", en: "hoodie", tag: "連帽" },
      { slug: "camisole", zh: "細肩帶上衣", en: "camisole top", tag: "細肩帶" },
      { slug: "jacket", zh: "短版夾克", en: "cropped jacket", tag: "夾克" },
      { slug: "blouse", zh: "雪紡罩衫", en: "soft blouse", tag: "罩衫" },
      { slug: "vest", zh: "背心", en: "layered vest", tag: "背心" },
    ],
    variants: styleVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `上半身穿搭以${base.zh}為主`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "upper garment", "neckline, sleeve area, fabric edge, and upper-body silhouette are visible"),
    negativePrompt: () => "brand logo, unreadable text print, messy garment construction, wrong clothing category",
    notes: (base, variant) => `適合建立${variant.zh}${base.zh}的上裝方向，不包含下裝。`,
  },
  {
    source: "styling-atoms-part-1",
    category: "下裝",
    slugPrefix: "bottom",
    count: 39,
    bases: [
      { slug: "jeans", zh: "牛仔褲", en: "denim jeans", tag: "牛仔" },
      { slug: "wide-pants", zh: "寬褲", en: "wide-leg pants", tag: "寬褲" },
      { slug: "pleated-skirt", zh: "百褶裙", en: "pleated skirt", tag: "百褶" },
      { slug: "long-skirt", zh: "長裙", en: "long flowing skirt", tag: "長裙" },
      { slug: "shorts", zh: "短褲", en: "tailored shorts", tag: "短褲" },
      { slug: "cargo", zh: "工裝褲", en: "cargo pants", tag: "工裝" },
      { slug: "slacks", zh: "西裝褲", en: "tailored slacks", tag: "西裝褲" },
      { slug: "mini-skirt", zh: "短裙", en: "mini skirt", tag: "短裙" },
      { slug: "knit-skirt", zh: "針織裙", en: "knit skirt", tag: "針織" },
      { slug: "joggers", zh: "休閒束口褲", en: "casual jogger pants", tag: "休閒" },
    ],
    variants: styleVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `下半身穿搭以${base.zh}為主`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "lower garment", "waistline, hem shape, fabric fall, and leg coverage are visible"),
    negativePrompt: () => "brand logo, wrong garment category, broken fabric folds, unrealistic waistline",
    notes: (base, variant) => `用於控制${variant.zh}${base.zh}，不包含鞋履或上裝。`,
  },
  {
    source: "styling-atoms-part-1",
    category: "鞋履",
    slugPrefix: "shoes",
    count: 39,
    bases: [
      { slug: "sneakers", zh: "休閒球鞋", en: "casual sneakers", tag: "球鞋" },
      { slug: "loafers", zh: "樂福鞋", en: "loafers", tag: "樂福鞋" },
      { slug: "mary-jane", zh: "瑪莉珍鞋", en: "Mary Jane shoes", tag: "瑪莉珍" },
      { slug: "boots", zh: "短靴", en: "ankle boots", tag: "短靴" },
      { slug: "sandals", zh: "涼鞋", en: "clean strap sandals", tag: "涼鞋" },
      { slug: "flats", zh: "平底鞋", en: "minimal flat shoes", tag: "平底" },
      { slug: "heels", zh: "低跟鞋", en: "low heels", tag: "低跟" },
      { slug: "platform", zh: "厚底鞋", en: "platform shoes", tag: "厚底" },
      { slug: "canvas", zh: "帆布鞋", en: "canvas shoes", tag: "帆布" },
      { slug: "mules", zh: "穆勒鞋", en: "mules", tag: "穆勒鞋" },
    ],
    variants: styleVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `足部造型以${base.zh}為主`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "shoe design", "toe shape, sole thickness, ankle opening, and foot placement are readable"),
    negativePrompt: () => "brand logo, dirty shoes, malformed feet, wrong footwear type",
    notes: (base, variant) => `用於指定${variant.zh}${base.zh}，適合全身或鞋履特寫。`,
  },
  {
    source: "styling-atoms-part-2",
    category: "配飾",
    slugPrefix: "accessory",
    count: 39,
    bases: [
      { slug: "earrings", zh: "耳環", en: "earrings", tag: "耳環" },
      { slug: "necklace", zh: "項鍊", en: "necklace", tag: "項鍊" },
      { slug: "glasses", zh: "眼鏡", en: "glasses", tag: "眼鏡" },
      { slug: "hairpin", zh: "髮夾", en: "hair clip", tag: "髮夾" },
      { slug: "scarf", zh: "絲巾", en: "scarf accessory", tag: "絲巾" },
      { slug: "watch", zh: "手錶", en: "wristwatch", tag: "手錶" },
      { slug: "bag", zh: "小包", en: "small bag", tag: "包款" },
      { slug: "ring", zh: "戒指", en: "rings", tag: "戒指" },
      { slug: "cap", zh: "帽子", en: "cap or hat", tag: "帽子" },
      { slug: "belt", zh: "腰帶", en: "belt accessory", tag: "腰帶" },
    ],
    variants: visualVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `可疊加的${base.zh}造型細節`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "accessory", "scale, attachment point, material shine, and placement on the body are clear"),
    negativePrompt: () => "brand logo, oversized distraction, cluttered accessories, unreadable text",
    notes: (base, variant) => `多選素材，可用${variant.zh}${base.zh}補強造型細節。`,
  },
  {
    source: "styling-atoms-part-2",
    category: "道具",
    slugPrefix: "prop",
    count: 39,
    bases: [
      { slug: "phone", zh: "手機", en: "modern smartphone without visible brand", tag: "手機" },
      { slug: "cup", zh: "咖啡杯", en: "coffee cup", tag: "咖啡" },
      { slug: "book", zh: "書本", en: "book or magazine", tag: "書本" },
      { slug: "umbrella", zh: "透明雨傘", en: "clear umbrella", tag: "雨傘" },
      { slug: "camera", zh: "小相機", en: "compact camera", tag: "相機" },
      { slug: "flowers", zh: "小花束", en: "small bouquet", tag: "花束" },
      { slug: "headphones", zh: "耳機", en: "headphones", tag: "耳機" },
      { slug: "ticket", zh: "票卡", en: "small ticket or card", tag: "票卡" },
      { slug: "snack", zh: "零食包", en: "small snack package without brand", tag: "零食" },
      { slug: "tote", zh: "帆布袋", en: "canvas tote bag", tag: "帆布袋" },
    ],
    variants: visualVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `畫面中可互動的${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "prop object", "object scale, grip or nearby placement, and interaction affordance are clear"),
    negativePrompt: () => "brand logo, unreadable text, impossible grip, object fused with hands",
    notes: (base, variant) => `多選素材，適合加入${variant.zh}${base.zh}作為生活道具。`,
  },
  {
    source: "styling-atoms-part-2",
    category: "妝容",
    slugPrefix: "makeup",
    count: 39,
    bases: [
      { slug: "bare", zh: "裸妝", en: "natural bare makeup", tag: "裸妝" },
      { slug: "glow", zh: "水光底妝", en: "dewy glowing base makeup", tag: "水光" },
      { slug: "matte", zh: "霧面底妝", en: "soft matte base makeup", tag: "霧面" },
      { slug: "eyeliner", zh: "細眼線", en: "thin eyeliner", tag: "眼線" },
      { slug: "blush", zh: "腮紅", en: "soft blush", tag: "腮紅" },
      { slug: "lip", zh: "自然唇色", en: "natural lip color", tag: "唇色" },
      { slug: "glitter", zh: "亮片眼影", en: "subtle glitter eyeshadow", tag: "眼影" },
      { slug: "idol", zh: "偶像妝", en: "soft idol-inspired makeup", tag: "偶像妝" },
      { slug: "cool", zh: "冷調妝", en: "cool-toned makeup", tag: "冷調" },
      { slug: "retro", zh: "復古妝", en: "subtle retro makeup", tag: "復古" },
    ],
    variants: softVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `妝面重點為${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "makeup finish", "application area, color intensity, skin finish, and facial styling effect are readable"),
    negativePrompt: () => "smeared makeup, overdone cosmetics, distorted facial texture, clown-like makeup",
    notes: (base, variant) => `用於控制${variant.zh}${base.zh}，不改變五官結構。`,
  },
  {
    source: "scene-atoms",
    category: "場景",
    slugPrefix: "scene",
    count: 19,
    bases: [
      { slug: "cafe", zh: "咖啡店", en: "small cafe interior", tag: "咖啡店" },
      { slug: "street", zh: "城市街角", en: "urban street corner", tag: "街角" },
      { slug: "station", zh: "車站月台", en: "train station platform", tag: "車站" },
      { slug: "bookstore", zh: "獨立書店", en: "independent bookstore", tag: "書店" },
      { slug: "park", zh: "公園步道", en: "park walking path", tag: "公園" },
      { slug: "rooftop", zh: "天台", en: "quiet rooftop location", tag: "天台" },
      { slug: "convenience", zh: "便利店外", en: "outside a convenience store", tag: "便利店" },
    ],
    variants: everydayVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `主要拍攝地點為${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "main location", "spatial boundary, background depth, and environmental objects establish the place"),
    negativePrompt: () => "brand signage, copyrighted posters, cluttered unreadable text, impossible architecture",
    notes: (base, variant) => `用於指定${variant.zh}${base.zh}作為主場景。`,
  },
  {
    source: "scene-atoms",
    category: "場景細節",
    slugPrefix: "scene-detail",
    count: 19,
    bases: [
      { slug: "plants", zh: "窗台植物", en: "plants on the windowsill", tag: "植物" },
      { slug: "magazines", zh: "雜誌堆", en: "stack of magazines", tag: "雜誌" },
      { slug: "curtain", zh: "柔軟窗簾", en: "soft curtains", tag: "窗簾" },
      { slug: "lamp", zh: "暖色小燈", en: "small warm lamp", tag: "小燈" },
      { slug: "rain-window", zh: "雨滴窗面", en: "raindrops on glass", tag: "雨滴" },
      { slug: "sign", zh: "模糊招牌光", en: "blurred sign glow without readable text", tag: "招牌光" },
      { slug: "tableware", zh: "桌面餐具", en: "simple tableware detail", tag: "桌面" },
    ],
    variants: visualVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `背景中加入${base.zh}細節`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "background detail", "detail remains secondary, spatially anchored, and useful for scene depth"),
    negativePrompt: () => "distracting clutter, readable brand text, messy background, object crowding",
    notes: (base, variant) => `多選素材，可用${variant.zh}${base.zh}增加場景層次。`,
  },
  {
    source: "scene-atoms",
    category: "時間 / 季節 / 天氣",
    slugPrefix: "time-weather",
    count: 19,
    bases: [
      { slug: "morning", zh: "清晨", en: "early morning atmosphere", tag: "清晨" },
      { slug: "afternoon", zh: "午後", en: "soft afternoon atmosphere", tag: "午後" },
      { slug: "night", zh: "夜晚", en: "nighttime atmosphere", tag: "夜晚" },
      { slug: "rain", zh: "小雨", en: "light rain weather", tag: "雨天" },
      { slug: "spring", zh: "春日", en: "spring season", tag: "春天" },
      { slug: "summer", zh: "夏日", en: "summer day", tag: "夏天" },
      { slug: "winter", zh: "冬日", en: "winter day", tag: "冬天" },
    ],
    variants: softVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `時間與環境氛圍為${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "time-weather condition", "air quality, surface cues, and seasonal light support the temporal setting"),
    negativePrompt: () => "contradictory weather, harsh disaster scene, unrealistic season mix, unsafe environment",
    notes: (base, variant) => `用於控制${variant.zh}${base.zh}，不取代主場景。`,
  },
  {
    source: "scene-atoms",
    category: "光影",
    slugPrefix: "lighting",
    count: 19,
    bases: [
      { slug: "window", zh: "窗邊光", en: "window light", tag: "窗光" },
      { slug: "backlight", zh: "逆光", en: "soft backlight", tag: "逆光" },
      { slug: "flash", zh: "直閃光", en: "direct flash lighting", tag: "閃光" },
      { slug: "neon", zh: "霓虹光", en: "neon light", tag: "霓虹" },
      { slug: "overcast", zh: "陰天柔光", en: "overcast soft light", tag: "陰天" },
      { slug: "sunset", zh: "夕陽光", en: "sunset golden light", tag: "夕陽" },
      { slug: "lamp", zh: "室內燈光", en: "warm indoor lamp light", tag: "室內光" },
    ],
    variants: visualVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `光源方向與質感以${base.zh}為主`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "lighting setup", "source direction, highlight shape, shadow softness, and contrast level are readable"),
    negativePrompt: () => "overexposure, muddy shadows, conflicting light sources, blown-out face",
    notes: (base, variant) => `用於建立${variant.zh}${base.zh}，會明顯改變畫面氛圍。`,
  },
  {
    source: "scene-atoms",
    category: "色彩系統",
    slugPrefix: "palette",
    count: 19,
    bases: [
      { slug: "cream", zh: "奶油色", en: "cream neutral palette", tag: "奶油色" },
      { slug: "cool", zh: "冷灰色", en: "cool gray palette", tag: "冷灰" },
      { slug: "pastel", zh: "粉彩色", en: "soft pastel palette", tag: "粉彩" },
      { slug: "high-contrast", zh: "高對比色", en: "high contrast palette", tag: "高對比" },
      { slug: "film", zh: "低飽和底片色", en: "low-saturation film palette", tag: "低飽和" },
      { slug: "fresh-green", zh: "清新綠色", en: "fresh green accent palette", tag: "綠色" },
      { slug: "night", zh: "夜色藍紫", en: "night blue violet palette", tag: "夜色" },
    ],
    variants: softVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `整體色彩控制為${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "color palette", "dominant hue, accent color, saturation range, and tonal relationship are explicit"),
    negativePrompt: () => "random colors, oversaturated palette, muddy color cast, conflicting color scheme",
    notes: (base, variant) => `用於指定${variant.zh}${base.zh}，會影響全局色調。`,
  },
  {
    source: "scene-atoms",
    category: "寫真風格",
    slugPrefix: "photo-style",
    count: 19,
    bases: [
      { slug: "editorial", zh: "編輯寫真", en: "editorial portrait photography", tag: "編輯" },
      { slug: "snapshot", zh: "手機隨拍", en: "smartphone snapshot photography", tag: "手機" },
      { slug: "street", zh: "城市街拍", en: "urban street photography", tag: "街拍" },
      { slug: "film", zh: "底片寫真", en: "analog film photography", tag: "底片" },
      { slug: "lifestyle", zh: "生活寫真", en: "lifestyle photography", tag: "生活" },
      { slug: "catalog", zh: "穿搭型錄", en: "fashion catalog photography", tag: "型錄" },
      { slug: "cinematic", zh: "電影感寫真", en: "cinematic portrait photography", tag: "電影感" },
    ],
    variants: everydayVariants,
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `照片類型接近${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "portrait style", "genre cues, subject treatment, background handling, and ACG-friendly image language are explicit"),
    negativePrompt: () => "AI illustration look, inconsistent medium, excessive retouching, brand campaign text",
    notes: (base, variant) => `用於切換${zhTitle(base, variant)}，不改變具體場景內容。`,
  },
  {
    source: "camera-atoms",
    category: "鏡頭角度",
    slugPrefix: "camera-angle",
    count: 9,
    bases: [
      { slug: "eye", zh: "平視角度", en: "eye-level camera angle", tag: "平視" },
      { slug: "high", zh: "微俯角", en: "slightly high camera angle", tag: "俯角" },
      { slug: "low", zh: "微仰角", en: "slightly low camera angle", tag: "仰角" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `鏡頭位置採用${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "camera angle", "viewpoint height, lens axis, and perspective relationship to the subject are clear"),
    negativePrompt: () => "extreme distortion, impossible perspective, accidental tilt, cropped subject",
    notes: (base, variant) => `用於控制${variant.zh}${base.zh}，和景別分開使用。`,
  },
  {
    source: "camera-atoms",
    category: "鏡頭質感",
    slugPrefix: "lens-texture",
    count: 9,
    bases: [
      { slug: "phone", zh: "手機鏡頭", en: "smartphone camera look", tag: "手機" },
      { slug: "compact", zh: "小相機", en: "compact digital camera look", tag: "小相機" },
      { slug: "film", zh: "底片鏡頭", en: "film camera lens look", tag: "底片" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `影像捕捉質感為${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "camera lens texture", "sensor feel, edge rendering, focus falloff, and capture artifacts are visible"),
    negativePrompt: () => "overprocessed HDR, unrealistic lens blur, noisy broken image, watermark",
    notes: (base, variant) => `用於指定${variant.zh}${base.zh}，不等同於寫真風格。`,
  },
  {
    source: "camera-atoms",
    category: "景別",
    slugPrefix: "shot-size",
    count: 9,
    bases: [
      { slug: "close", zh: "近景", en: "close-up shot", tag: "近景" },
      { slug: "medium", zh: "中景", en: "medium shot", tag: "中景" },
      { slug: "wide", zh: "遠景", en: "wide shot", tag: "遠景" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `鏡頭距離以${base.zh}為主`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "shot size", "camera distance, subject scale, crop boundary, and surrounding space are explicit"),
    negativePrompt: () => "unexpected crop, wrong shot size, hidden subject, excessive empty space",
    notes: (base, variant) => `用於控制${variant.zh}${base.zh}，和身體構圖互補。`,
  },
  {
    source: "camera-atoms",
    category: "構圖規則",
    slugPrefix: "composition",
    count: 9,
    bases: [
      { slug: "center", zh: "中心構圖", en: "centered composition", tag: "中心" },
      { slug: "thirds", zh: "三分構圖", en: "rule-of-thirds composition", tag: "三分法" },
      { slug: "negative-space", zh: "留白構圖", en: "negative space composition", tag: "留白" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `畫面結構以${base.zh}為主`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "composition rule", "subject placement, negative space, edge balance, and visual weight follow the rule"),
    negativePrompt: () => "accidental framing, cluttered composition, subject cut off, chaotic layout",
    notes: (base, variant) => `用於建立${variant.zh}${base.zh}，不指定具體鏡頭距離。`,
  },
  {
    source: "media-atoms",
    category: "畫面影響",
    slugPrefix: "image-effect",
    count: 9,
    bases: [
      { slug: "grain", zh: "顆粒", en: "fine film grain", tag: "顆粒" },
      { slug: "flare", zh: "光暈", en: "subtle lens flare", tag: "光暈" },
      { slug: "motion", zh: "動態模糊", en: "gentle motion blur", tag: "動態模糊" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `畫面表面加入${base.zh}效果`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "image effect", "surface layer, opacity, edge behavior, and artifact intensity stay controlled"),
    negativePrompt: () => "heavy artifacts, unreadable image, dirty scratches, destructive filter",
    notes: (base, variant) => `多選素材，可疊加${variant.zh}${base.zh}作為畫面效果。`,
  },
  {
    source: "media-atoms",
    category: "版式設計",
    slugPrefix: "layout",
    count: 9,
    bases: [
      { slug: "collage", zh: "拼貼版式", en: "collage layout", tag: "拼貼" },
      { slug: "poster", zh: "海報版式", en: "poster-like layout", tag: "海報" },
      { slug: "scrapbook", zh: "手帳版式", en: "scrapbook layout", tag: "手帳" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `畫面排列採用${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "layout design", "image blocks, decorative elements, spacing, and hierarchy are intentionally arranged"),
    negativePrompt: () => "messy layout, unreadable clutter, brand logo, random text blocks",
    notes: (base, variant) => `用於輸出${variant.zh}${base.zh}，適合社群封面或設計稿。`,
  },
  {
    source: "media-atoms",
    category: "文本元素",
    slugPrefix: "text-element",
    count: 9,
    bases: [
      { slug: "caption", zh: "短標題", en: "short clean title text element", tag: "標題" },
      { slug: "date", zh: "日期字樣", en: "small date text element", tag: "日期" },
      { slug: "handwritten", zh: "手寫字", en: "handwritten-style small text", tag: "手寫" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `畫面中加入${base.zh}作為文字元素`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "text element", "letter scale, typography placement, spacing, and readability are controlled"),
    negativePrompt: () => "garbled letters, excessive text, brand slogan, copyrighted logo text",
    notes: (base, variant) => `只在需要文字時使用${variant.zh}${base.zh}，避免干擾純照片。`,
  },
  {
    source: "media-atoms",
    category: "平台媒介",
    slugPrefix: "platform",
    count: 9,
    bases: [
      { slug: "story", zh: "限時動態", en: "vertical social story format", tag: "限動" },
      { slug: "feed", zh: "社群貼文", en: "social media feed post", tag: "貼文" },
      { slug: "cover", zh: "封面圖", en: "cover image format", tag: "封面" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `輸出媒介接近${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "platform medium format", "aspect behavior, content density, thumbnail readability, and social-format framing are clear"),
    negativePrompt: () => "app UI screenshot, real platform logo, notification overlays, copyrighted interface",
    notes: (base, variant) => `用於讓畫面接近${variant.zh}${base.zh}，不加入真實平台 logo。`,
  },
  {
    source: "media-atoms",
    category: "後期處理",
    slugPrefix: "postprocess",
    count: 9,
    bases: [
      { slug: "soft-retouch", zh: "柔和修圖", en: "soft natural retouching", tag: "修圖" },
      { slug: "film-grade", zh: "底片調色", en: "film-inspired color grading", tag: "調色" },
      { slug: "crisp", zh: "清晰銳化", en: "subtle crisp sharpening", tag: "銳化" },
    ],
    variants: visualVariants.slice(0, 3),
    title: (base, variant) => zhTitle(base, variant),
    subtitle: (base) => `後期質感採用${base.zh}`,
    prompt: (base, variant) =>
      buildSeriesPrompt(base, variant, "post-processing finish", "retouching strength, edge detail, tonal curve, and final image texture are controlled"),
    negativePrompt: () => "over-retouched skin, crunchy sharpening, muddy grade, artificial filter artifacts",
    notes: (base, variant) => `用於指定${zhTitle(base, variant)}，不改變內容本身。`,
  },
];

export const EXPANDED_MAIN_ATOMS = [
  ...createCuratedPersonaAtoms(),
  ...seriesDefinitions.flatMap(createSeries),
];
