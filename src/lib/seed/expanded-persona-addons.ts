import type { ExpandedAtom } from "@/lib/seed/expanded-atoms";

const personaAddonNegativePrompt =
  "underage, childlike appearance, teen-coded subject, celebrity likeness, brand logo, fixed hairstyle, revealing outfit, explicit content";

type PersonaAddonSpec = {
  title: string;
  subtitle: string;
  prompt: string;
  tags: string[];
};

const adultSubjectPhrases = [
  "adult original East Asian ACG character",
  "mature original East Asian ACG heroine",
  "adult East Asian anime-inspired original character",
  "non-teen East Asian ACG character design",
] as const;

const originalityPhrases = [
  "clearly non-celebrity identity",
  "original fictional subject, no real-person likeness",
  "adult non-celebrity character presence",
  "distinct original character silhouette",
] as const;

function refinePersonaAddonPrompt(prompt: string, index: number) {
  return prompt
    .replace("adult East Asian original ACG character", adultSubjectPhrases[index % adultSubjectPhrases.length])
    .replace("adult non-celebrity subject", originalityPhrases[index % originalityPhrases.length]);
}

const personaAddonSpecs: PersonaAddonSpec[] = [
  {
    title: "高定時裝模特",
    subtitle: "冷靜疏離並帶高級時裝週氣場的人物基底",
    prompt: "adult East Asian original ACG character, high fashion runway model persona, elegant bone structure, poised expression, refined editorial presence, adult non-celebrity subject",
    tags: ["人設", "時裝", "模特", "高級感", "編輯感"],
  },
  {
    title: "柔和精靈少女",
    subtitle: "柔軟夢幻並帶森林精靈氣質的成年幻想人物",
    prompt: "adult East Asian original ACG character, soft adult elven fantasy persona, ethereal gentle aura, delicate fantasy beauty, calm magical presence, adult non-celebrity subject",
    tags: ["人設", "精靈", "夢幻", "柔和", "幻想"],
  },
  {
    title: "偶像練習生",
    subtitle: "清爽有舞台潛力並帶努力感的新人偶像氣質",
    prompt: "adult East Asian original ACG character, idol trainee persona, fresh stage-ready energy, youthful but adult performer aura, clean expressive presence, adult non-celebrity subject",
    tags: ["人設", "偶像感", "練習生", "清爽", "舞台"],
  },
  {
    title: "賽博信使",
    subtitle: "在未來都市中穿梭的冷感情報傳遞者",
    prompt: "adult East Asian original ACG character, cyber courier persona, sleek futuristic street presence, agile urban messenger energy, neon-era survival attitude, adult non-celebrity subject",
    tags: ["人設", "賽博", "信使", "未來", "街頭"],
  },
  {
    title: "復古咖啡店員",
    subtitle: "溫柔安靜並帶昭和或歐式復古咖啡館氣質",
    prompt: "adult East Asian original ACG character, vintage cafe worker persona, warm nostalgic charm, calm service presence, softly romantic everyday aura, adult non-celebrity subject",
    tags: ["人設", "咖啡店", "復古", "溫柔", "日常"],
  },
  {
    title: "音樂製作人",
    subtitle: "獨立專注並帶深夜創作感的音樂人基底",
    prompt: "adult East Asian original ACG character, independent music producer persona, focused creative intensity, late-night studio energy, quiet artistic confidence, adult non-celebrity subject",
    tags: ["人設", "音樂", "創作", "製作人", "藝術感"],
  },
  {
    title: "哥特圖書管理員",
    subtitle: "神秘安靜並帶古典哥特美學的知性人物",
    prompt: "adult East Asian original ACG character, gothic librarian persona, mysterious intellectual aura, elegant dark academic presence, quiet controlled expression, adult non-celebrity subject",
    tags: ["人設", "哥特", "圖書館", "知性", "黑暗學院"],
  },
  {
    title: "沉靜修女",
    subtitle: "克制虔誠並帶莊嚴與溫柔並存的宗教氣質",
    prompt: "adult East Asian original ACG character, serene nun-inspired persona, solemn graceful presence, quiet devotion, gentle restrained expression, adult non-celebrity subject",
    tags: ["人設", "修女", "莊嚴", "克制", "聖潔"],
  },
  {
    title: "純白聖女",
    subtitle: "神聖慈悲並帶治癒與象徵性的幻想聖女氣質",
    prompt: "adult East Asian original ACG character, holy saintess persona, pure luminous presence, compassionate gaze, symbolic sacred beauty, adult non-celebrity subject",
    tags: ["人設", "聖女", "聖潔", "治癒", "幻想"],
  },
  {
    title: "暗黑聖女",
    subtitle: "聖潔外表下帶危險感與宿命感的反差人物",
    prompt: "adult East Asian original ACG character, dark saintess persona, sacred yet ominous aura, calm tragic beauty, elegant forbidden presence, adult non-celebrity subject",
    tags: ["人設", "聖女", "暗黑", "反差", "宿命感"],
  },
  {
    title: "未來財團大小姐",
    subtitle: "精英冷靜並帶資本與權力感的未來系人物",
    prompt: "adult East Asian original ACG character, futuristic heiress persona, polished corporate elegance, calm authority, expensive controlled presence, adult non-celebrity subject",
    tags: ["人設", "財團", "大小姐", "未來", "高級感"],
  },
  {
    title: "地下樂隊主唱",
    subtitle: "叛逆情緒濃烈並帶小型 livehouse 舞台感",
    prompt: "adult East Asian original ACG character, underground band vocalist persona, raw emotional charisma, rebellious performance energy, indie livehouse presence, adult non-celebrity subject",
    tags: ["人設", "音樂", "樂隊", "主唱", "叛逆"],
  },
  {
    title: "美術館策展人",
    subtitle: "知性冷靜並帶審美權威感的藝術從業者",
    prompt: "adult East Asian original ACG character, art gallery curator persona, refined intellectual taste, composed visual authority, quiet contemporary elegance, adult non-celebrity subject",
    tags: ["人設", "藝術", "策展", "知性", "高級感"],
  },
  {
    title: "都市占星師",
    subtitle: "神秘溫柔並帶現代靈性與夜色感的人物",
    prompt: "adult East Asian original ACG character, urban astrologer persona, mystical modern presence, gentle intuitive gaze, soft celestial aura, adult non-celebrity subject",
    tags: ["人設", "占星", "神秘", "都市", "靈性"],
  },
  {
    title: "賞金獵人",
    subtitle: "冷酷獨立並帶危險任務感的行動型人物",
    prompt: "adult East Asian original ACG character, bounty hunter persona, sharp survival instincts, calm dangerous presence, independent action-driven aura, adult non-celebrity subject",
    tags: ["人設", "賞金獵人", "行動", "冷酷", "危險感"],
  },
  {
    title: "太空船工程師",
    subtitle: "理性專注並帶科幻技術職人感",
    prompt: "adult East Asian original ACG character, spaceship engineer persona, practical sci-fi technician energy, focused problem-solving presence, calm mechanical intelligence, adult non-celebrity subject",
    tags: ["人設", "科幻", "工程師", "太空", "技術感"],
  },
  {
    title: "月面研究員",
    subtitle: "孤獨安靜並帶月球基地科研氣質",
    prompt: "adult East Asian original ACG character, lunar researcher persona, quiet scientific focus, isolated space-colony aura, calm analytical expression, adult non-celebrity subject",
    tags: ["人設", "科幻", "研究員", "月球", "孤獨感"],
  },
  {
    title: "古董店主人",
    subtitle: "溫和神秘並像知道很多故事的復古人物",
    prompt: "adult East Asian original ACG character, antique shop owner persona, nostalgic mysterious charm, gentle knowing expression, quietly story-rich presence, adult non-celebrity subject",
    tags: ["人設", "古董", "復古", "神秘", "店主"],
  },
  {
    title: "雨夜偵探",
    subtitle: "冷靜疲憊並帶 noir 電影感的調查者",
    prompt: "adult East Asian original ACG character, rainy night detective persona, noir cinematic presence, tired sharp gaze, quiet investigative intensity, adult non-celebrity subject",
    tags: ["人設", "偵探", "黑色電影", "雨夜", "冷感"],
  },
  {
    title: "魔法學院優等生",
    subtitle: "聰明克制並帶學院幻想與精英感",
    prompt: "adult East Asian original ACG character, magic academy honor student persona, disciplined fantasy scholar aura, intelligent composed expression, refined magical presence, adult non-celebrity subject",
    tags: ["人設", "魔法", "學院", "優等生", "幻想"],
  },
  {
    title: "落魄貴族少女",
    subtitle: "高貴但帶破碎感並有失落家族背景氛圍",
    prompt: "adult East Asian original ACG character, fallen noblewoman persona, elegant fragile dignity, melancholic aristocratic aura, quiet tragic beauty, adult non-celebrity subject",
    tags: ["人設", "貴族", "破碎感", "復古", "憂鬱"],
  },
  {
    title: "機械義體舞者",
    subtitle: "柔美身體語言與機械未來感結合的人物",
    prompt: "adult East Asian original ACG character, cybernetic dancer persona, graceful movement intelligence, elegant biomechanical presence, futuristic performance aura, adult non-celebrity subject",
    tags: ["人設", "義體", "舞者", "賽博", "未來"],
  },
  {
    title: "蒸汽朋克發明家",
    subtitle: "好奇偏執並帶復古機械與冒險氣質",
    prompt: "adult East Asian original ACG character, steampunk inventor persona, curious mechanical genius aura, eccentric elegant energy, brass-era adventurous presence, adult non-celebrity subject",
    tags: ["人設", "蒸汽朋克", "發明家", "復古", "機械"],
  },
  {
    title: "海港旅人",
    subtitle: "自由遠行並帶海風與舊港口故事感",
    prompt: "adult East Asian original ACG character, harbor traveler persona, free-spirited coastal aura, weathered romantic presence, quiet journey-worn charm, adult non-celebrity subject",
    tags: ["人設", "旅行", "海港", "自由", "浪漫"],
  },
  {
    title: "異國情報員",
    subtitle: "優雅危險並帶間諜片氣質的神秘人物",
    prompt: "adult East Asian original ACG character, international intelligence agent persona, elegant secretive presence, composed danger, cinematic spy-like charisma, adult non-celebrity subject",
    tags: ["人設", "情報員", "間諜", "優雅", "危險感"],
  },
  {
    title: "夢境導遊",
    subtitle: "溫柔奇幻並像引導人穿越夢境的人物",
    prompt: "adult East Asian original ACG character, dream guide persona, surreal gentle presence, soft otherworldly gaze, whimsical liminal aura, adult non-celebrity subject",
    tags: ["人設", "夢境", "奇幻", "溫柔", "超現實"],
  },
  {
    title: "冷面女騎士",
    subtitle: "正直克制並帶戰場榮耀與守護感",
    prompt: "adult East Asian original ACG character, stoic female knight persona, disciplined heroic presence, calm protective aura, noble battlefield dignity, adult non-celebrity subject",
    tags: ["人設", "騎士", "守護", "冷面", "英氣"],
  },
  {
    title: "流浪魔女",
    subtitle: "自由神秘並帶旅途中魔法使用者氣質",
    prompt: "adult East Asian original ACG character, wandering witch persona, mysterious free-spirited magic aura, quiet self-reliant charm, fantasy traveler presence, adult non-celebrity subject",
    tags: ["人設", "魔女", "流浪", "幻想", "神秘"],
  },
  {
    title: "花店占卜師",
    subtitle: "柔和自然並混合花藝與占卜感的人物",
    prompt: "adult East Asian original ACG character, flower shop fortune teller persona, soft botanical mysticism, gentle intuitive presence, romantic everyday magic aura, adult non-celebrity subject",
    tags: ["人設", "花店", "占卜", "溫柔", "自然"],
  },
  {
    title: "廢土機車手",
    subtitle: "野性倔強並帶末世道路求生感",
    prompt: "adult East Asian original ACG character, wasteland biker persona, rugged survival charisma, rebellious road-warrior energy, dust-worn fearless presence, adult non-celebrity subject",
    tags: ["人設", "廢土", "機車", "野性", "末世"],
  },
  {
    title: "電子神社巫女",
    subtitle: "傳統巫女與未來數位神社結合的人物",
    prompt: "adult East Asian original ACG character, digital shrine maiden persona, sacred tradition fused with futuristic technology, calm ritual presence, cyber-spiritual aura, adult non-celebrity subject",
    tags: ["人設", "巫女", "賽博", "神社", "靈性"],
  },
  {
    title: "冷感實驗體",
    subtitle: "安靜疏離並帶研究所逃離感的科幻人物",
    prompt: "adult East Asian original ACG character, cold experimental subject persona, detached mysterious gaze, laboratory-born sci-fi aura, quiet uncanny presence, adult non-celebrity subject",
    tags: ["人設", "實驗體", "科幻", "冷感", "神秘"],
  },
  {
    title: "虛擬偶像中之人",
    subtitle: "現實中低調並在創作中發光的網絡表演者",
    prompt: "adult East Asian original ACG character, virtual idol performer persona, quiet off-stage personality, expressive digital-era charisma, online creative presence, adult non-celebrity subject",
    tags: ["人設", "虛擬偶像", "網絡", "表演", "反差"],
  },
  {
    title: "霓虹便利店夜班員",
    subtitle: "疲憊真實並帶深夜都市生活感的人物",
    prompt: "adult East Asian original ACG character, neon convenience store night-shift worker persona, tired everyday realism, quiet urban loneliness, late-night cinematic presence, adult non-celebrity subject",
    tags: ["人設", "便利店", "夜班", "都市", "真實感"],
  },
  {
    title: "宮廷藥劑師",
    subtitle: "聰慧安靜並帶古典宮廷與草藥知識感",
    prompt: "adult East Asian original ACG character, court apothecary persona, intelligent herbalist aura, composed palace-era presence, quiet medicinal expertise, adult non-celebrity subject",
    tags: ["人設", "宮廷", "藥劑師", "古典", "知性"],
  },
  {
    title: "水族館飼育員",
    subtitle: "溫柔專注並帶藍色水光與照護感的人物",
    prompt: "adult East Asian original ACG character, aquarium caretaker persona, gentle marine-life guardian aura, calm nurturing presence, soft blue-world sensitivity, adult non-celebrity subject",
    tags: ["人設", "水族館", "飼育員", "溫柔", "藍色"],
  },
  {
    title: "雪國旅館女將",
    subtitle: "端莊溫暖並帶雪夜旅館招待氣質",
    prompt: "adult East Asian original ACG character, snow-country inn hostess persona, graceful warm hospitality, traditional quiet elegance, winter lodging charm, adult non-celebrity subject",
    tags: ["人設", "旅館", "雪國", "端莊", "溫暖"],
  },
  {
    title: "都市芭蕾舞者",
    subtitle: "優雅克制並帶訓練痕跡與都市孤獨感",
    prompt: "adult East Asian original ACG character, urban ballet dancer persona, disciplined graceful posture, quiet physical elegance, modern city solitude, adult non-celebrity subject",
    tags: ["人設", "芭蕾", "舞者", "都市", "優雅"],
  },
  {
    title: "黑市醫生",
    subtitle: "冷靜專業並帶危險地下世界感",
    prompt: "adult East Asian original ACG character, underground black-market doctor persona, calm clinical precision, morally ambiguous presence, shadowy urban expertise, adult non-celebrity subject",
    tags: ["人設", "醫生", "黑市", "冷靜", "地下"],
  },
  {
    title: "甜品工房師傅",
    subtitle: "溫柔細膩並帶手作甜點與治癒感",
    prompt: "adult East Asian original ACG character, artisan pastry maker persona, delicate handmade charm, warm focused presence, soft comforting sweetness, adult non-celebrity subject",
    tags: ["人設", "甜品", "手作", "溫柔", "治癒"],
  },
  {
    title: "暗夜電台主持",
    subtitle: "低調聲音感強並像陪伴失眠者的夜間人物",
    prompt: "adult East Asian original ACG character, late-night radio host persona, intimate voice-driven presence, calm melancholic charm, nocturnal urban warmth, adult non-celebrity subject",
    tags: ["人設", "電台", "夜晚", "都市", "陪伴感"],
  },
  {
    title: "沙漠遺跡考古學家",
    subtitle: "堅韌知性並帶冒險與古文明探索感",
    prompt: "adult East Asian original ACG character, desert ruins archaeologist persona, adventurous scholarly aura, sun-worn resilience, ancient-civilization curiosity, adult non-celebrity subject",
    tags: ["人設", "考古", "沙漠", "冒險", "知性"],
  },
  {
    title: "和風香道師",
    subtitle: "安靜細膩並帶香氣儀式與古典審美",
    prompt: "adult East Asian original ACG character, traditional incense master persona, refined sensory elegance, quiet ritual presence, graceful cultural sophistication, adult non-celebrity subject",
    tags: ["人設", "香道", "和風", "儀式", "古典"],
  },
  {
    title: "潮流造型師",
    subtitle: "敏銳自信並帶時尚後台與街頭審美",
    prompt: "adult East Asian original ACG character, fashion stylist persona, sharp trend awareness, confident backstage energy, contemporary street-editorial taste, adult non-celebrity subject",
    tags: ["人設", "造型師", "潮流", "時尚", "編輯感"],
  },
  {
    title: "私人保鏢",
    subtitle: "冷靜警覺並帶守護與行動專業感",
    prompt: "adult East Asian original ACG character, private bodyguard persona, alert protective presence, composed physical confidence, professional security aura, adult non-celebrity subject",
    tags: ["人設", "保鏢", "守護", "行動", "冷靜"],
  },
  {
    title: "神秘拍賣師",
    subtitle: "優雅狡黠並帶高級黑市或古董拍賣氛圍",
    prompt: "adult East Asian original ACG character, mysterious auctioneer persona, elegant persuasive charisma, secretive luxury-market aura, composed theatrical presence, adult non-celebrity subject",
    tags: ["人設", "拍賣師", "神秘", "高級感", "狡黠"],
  },
  {
    title: "海底王國公主",
    subtitle: "優雅異域並帶海洋幻想與王族感",
    prompt: "adult East Asian original ACG character, undersea kingdom princess persona, aquatic fantasy elegance, regal gentle presence, oceanic otherworldly beauty, adult non-celebrity subject",
    tags: ["人設", "公主", "海洋", "幻想", "王族"],
  },
  {
    title: "末日植物學家",
    subtitle: "冷靜堅韌並在廢墟中研究生命復甦",
    prompt: "adult East Asian original ACG character, post-apocalyptic botanist persona, resilient life-science aura, quiet hope amid ruins, practical gentle intelligence, adult non-celebrity subject",
    tags: ["人設", "植物學家", "末日", "廢墟", "希望感"],
  },
  {
    title: "天文台觀測員",
    subtitle: "安靜孤獨並帶星空夜班與理性浪漫感",
    prompt: "adult East Asian original ACG character, observatory night watcher persona, quiet astronomical focus, solitary stargazing presence, rational romantic aura, adult non-celebrity subject",
    tags: ["人設", "天文台", "星空", "夜晚", "孤獨感"],
  },
  {
    title: "白塔聖騎士",
    subtitle: "聖潔英氣並帶神殿守護者與幻想戰士感",
    prompt: "adult East Asian original ACG character, white tower paladin persona, sacred heroic presence, disciplined protective aura, luminous fantasy knight dignity, adult non-celebrity subject",
    tags: ["人設", "聖騎士", "守護", "聖潔", "英氣"],
  },
];

export const EXPANDED_PERSONA_ADDON_ATOMS: ExpandedAtom[] = personaAddonSpecs.map(
  (spec, index) => ({
    id: `library-persona-addon-${String(index + 1).padStart(2, "0")}`,
    source: "subject-atoms",
    category: "人設",
    title: spec.title,
    subtitle: spec.subtitle,
    previewImagePath: "",
    prompt: refinePersonaAddonPrompt(spec.prompt, index),
    negativePrompt: personaAddonNegativePrompt,
    priority: "medium",
    lockPolicy: "normal",
    tags: spec.tags,
    notes: `人設擴充素材；預覽圖需呈現成人原創 ACG 角色，並保留「${spec.title}」氣質。`,
  }),
);
