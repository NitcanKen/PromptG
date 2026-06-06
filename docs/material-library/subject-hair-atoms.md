# Subject Hair Atoms

Updated: 2026-06-06 20:22 HKT

Category: `髮型`

Target: 40 final text atoms. The first row preserves the existing seed atom. The remaining 39 rows are new candidates for later review and import.

Image policy for this shard:

1. Every hair atom should receive one generated local preview image during Gemini production integration.
2. Existing seed atom may keep its current preview path until the generated atom-preview replacement is ready.
3. New atoms use empty `previewImagePath` in this authoring shard, then receive `/api/uploads/atom-previews/<atom-id>.png` after generation.
4. Image generation, manifest/resume, storage, route serving, and app import are governed by `docs/superpowers/plans/2026-06-06-gemini-image-batch-generation-production-integration.md`.

P4A integration status:

1. These 40 rows are mirrored into `src/lib/seed/expanded-atoms.ts` as app-owned structured data.
2. `ensureExpandedAtoms()` is the app bootstrap/backfill entrypoint for this shard.
3. P4B adds the dry-run Gemini preview generator and `/api/uploads/atom-previews/[filename]` route.
4. P4C generated 40 local preview PNGs for this shard under `data/uploads/atom-previews/` and validates them through the production manifest.
5. App-owned bootstrap imports the generated preview manifest without overwriting existing user-owned atoms or destructive seed data.

| # | id | title | subtitle | previewImagePath | prompt | negativePrompt | priority | lockPolicy | tags | notes |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | seed-hair-airy-bangs | 空氣瀏海 | 輕盈柔軟的瀏海與髮絲 | /api/uploads/seed/soft-cinematic-young-woman-portrait-base.png | airy bangs, soft layered hair, light wispy fringe, natural hair strands | helmet hair, stiff hair, unnatural hairline | medium | normal | 瀏海, 髮型, 柔軟 | 既有 seed。適合柔和日常人像，避免和厚重齊瀏海同時使用。 |
| 2 | library-hair-curtain-bangs | 八字瀏海 | 自然分開並修飾臉側的瀏海 |  | curtain bangs, parted face-framing fringe, soft layers around the cheeks | heavy blunt bangs, stiff fringe, uneven hairline | medium | normal | 瀏海, 修飾臉型, 自然 | 適合成熟自然的人像，比空氣瀏海更有臉側輪廓。 |
| 3 | library-hair-side-swept-bangs | 側分瀏海 | 偏向一側的柔順瀏海線條 |  | side-swept bangs, soft diagonal fringe, natural side part hair flow | flat forehead line, messy uneven bangs, helmet hair | medium | normal | 瀏海, 側分, 柔順 | 可用於輕成熟或編輯感人物，不改變整體髮長。 |
| 4 | library-hair-blunt-bangs | 厚重齊瀏海 | 明確齊平的前額瀏海 |  | blunt straight bangs, clean even fringe line, polished front hair shape | sparse bangs, uneven fringe, broken hairline | medium | normal | 齊瀏海, 乾淨, 強輪廓 | 控制力強，容易改變臉部印象，建議單獨使用。 |
| 5 | library-hair-no-bangs | 露額中分 | 乾淨露出額頭的中分髮型 |  | no bangs, clean center part, forehead visible, smooth face-framing hair | random fringe, messy bangs, hidden forehead | medium | normal | 露額, 中分, 乾淨 | 適合清冷或成熟感人設，可避免模型自動加瀏海。 |
| 6 | library-hair-high-ponytail | 高馬尾 | 俐落向上束起的馬尾 |  | high ponytail, lifted tied hair, clean sporty silhouette, loose natural strands | low ponytail, messy hair knot, duplicated ponytail | medium | normal | 馬尾, 俐落, 活力 | 適合元氣、運動感或街拍姿態。 |
| 7 | library-hair-low-ponytail | 低馬尾 | 靠近頸後的柔和束髮 |  | low ponytail, relaxed tied hair at the nape, soft loose strands | high ponytail, stiff tied hair, tangled ponytail | medium | normal | 馬尾, 低束髮, 溫柔 | 適合室內、通勤、安靜氛圍。 |
| 8 | library-hair-loose-side-ponytail | 側邊低馬尾 | 偏向一側垂落的低馬尾 |  | loose side ponytail, hair gathered over one shoulder, relaxed asymmetrical silhouette | centered ponytail, stiff hair, duplicated hair mass | medium | normal | 馬尾, 側邊, 慵懶 | 能增加輕微動態與不對稱感。 |
| 9 | library-hair-twin-tails | 雙馬尾 | 兩側對稱束起的年輕感髮型 |  | twin tails, symmetrical tied hair on both sides, playful youthful hairstyle | single ponytail, uneven twin tails, childish exaggeration | medium | normal | 雙馬尾, 可愛, 對稱 | 適合活潑社群感，避免和成熟人設衝突。 |
| 10 | library-hair-low-twin-tails | 低雙馬尾 | 位置較低的柔和雙束髮 |  | low twin tails, softly tied hair near the shoulders, gentle symmetrical hairstyle | high pigtails, messy knots, uneven hair length | medium | normal | 雙馬尾, 低束髮, 柔和 | 比普通雙馬尾更安靜，適合日常或復古感。 |
| 11 | library-hair-half-up | 半扎髮 | 上半部束起、下半部自然垂落 |  | half-up hairstyle, upper hair gently tied back, lower hair falling naturally | full ponytail, messy hair clip, stiff half-up shape | medium | normal | 半扎, 溫柔, 層次 | 可搭配臉部特徵與妝容，不搶服裝主體。 |
| 12 | library-hair-messy-bun | 慵懶丸子頭 | 鬆散自然的高位丸子頭 |  | messy bun, relaxed top knot, soft loose flyaway strands, casual tied hair | perfect hard bun, tangled hair, broken hair anatomy | medium | normal | 丸子頭, 慵懶, 隨性 | 適合居家、咖啡店、隨手拍氛圍。 |
| 13 | library-hair-low-bun | 低盤髮 | 頸後收束的乾淨低盤髮 |  | low bun, neat hair gathered at the nape, elegant soft updo | high bun, messy knot, loose collapsed bun | medium | normal | 盤髮, 優雅, 低束 | 適合編輯感、正式造型或溫柔室內光。 |
| 14 | library-hair-space-buns | 雙丸子頭 | 兩側對稱的小丸子輪廓 |  | space buns, two small buns on both sides, playful symmetrical updo | one bun only, uneven buns, excessive cartoon styling | medium | normal | 丸子頭, 雙髻, 玩味 | 適合 Y2K、貼紙版式或年輕街拍。 |
| 15 | library-hair-long-straight-black | 黑長直 | 乾淨垂順的深色長直髮 |  | long straight black hair, smooth glossy strands, clean vertical hair silhouette | frizzy hair, uneven extensions, unnatural black shine | strong | normal | 長髮, 黑髮, 直髮 | 控制力強，會明顯改變角色印象。 |
| 16 | library-hair-long-loose-waves | 長髮大波浪 | 柔軟自然的大弧度捲髮 |  | long loose waves, soft flowing curls, natural volume, relaxed hair movement | tight ringlets, messy tangles, stiff curls | medium | normal | 長髮, 波浪, 柔軟 | 適合旅行、街拍、溫柔人像。 |
| 17 | library-hair-beach-waves | 海風波浪髮 | 帶有自然凌亂感的波浪髮 |  | beach waves, tousled wavy hair, natural windswept texture, effortless volume | wet tangled hair, over-styled curls, stiff waves | medium | normal | 波浪, 隨性, 旅行 | 適合戶外、夏日、海邊或旅行素材。 |
| 18 | library-hair-soft-curls | 髮尾微卷 | 髮尾帶有低調捲度 |  | softly curled hair ends, subtle inward curls, gentle polished hair tips | tight curls, uneven curled ends, burned hair texture | medium | normal | 微卷, 髮尾, 低調 | 是安全泛用的變體，不會過度改變人物。 |
| 19 | library-hair-straight-lob | 及肩直髮 | 落在肩線附近的直髮長度 |  | straight lob haircut, shoulder-length smooth hair, clean minimal silhouette | very long hair, pixie cut, uneven haircut | medium | normal | 及肩, 直髮, 清爽 | 適合通勤、清冷、簡潔人像。 |
| 20 | library-hair-wavy-lob | 及肩微捲 | 及肩長度加上自然捲度 |  | wavy lob haircut, shoulder-length soft waves, natural airy volume | long curls, flat straight hair, messy frizz | medium | normal | 及肩, 微捲, 自然 | 比直髮更有生活感與柔和度。 |
| 21 | library-hair-short-bob | 短髮波波頭 | 乾淨圓潤的短髮輪廓 |  | short bob haircut, rounded clean hair shape, chin-length polished silhouette | long hair, uneven bob, helmet-like hair | medium | normal | 短髮, 波波頭, 乾淨 | 適合甜美、復古或清爽人設。 |
| 22 | library-hair-blunt-bob | 一刀切短髮 | 髮尾齊平的銳利短髮 |  | blunt bob haircut, sharp even hair ends, sleek geometric silhouette | feathered layers, messy ends, uneven cut | strong | normal | 短髮, 一刀切, 銳利 | 輪廓感強，適合清冷或時尚編輯風。 |
| 23 | library-hair-pixie-cut | 精靈短髮 | 露出耳側與頸線的俐落短髮 |  | pixie cut, very short layered hair, clean ears and neck silhouette | long hair, bulky sides, uneven cropped hair | medium | normal | 短髮, 俐落, 中性 | 適合乾淨、有個性的角色基底。 |
| 24 | library-hair-wolf-cut | 狼尾層次髮 | 上短下長的強層次髮型 |  | wolf cut hairstyle, shaggy layered hair, longer nape layers, edgy silhouette | flat one-length hair, messy broken layers, mullet exaggeration | medium | normal | 狼尾, 層次, 甜酷 | 適合街拍、甜酷、地下偶像感。 |
| 25 | library-hair-hush-cut | 韓系層次髮 | 柔順自然的空氣感層次 |  | hush cut hairstyle, soft Korean-inspired layers, airy face-framing movement | harsh choppy layers, stiff hair, heavy blunt cut | medium | normal | 層次, 韓系, 柔順 | 泛用度高，可搭配多數人設與場景。 |
| 26 | library-hair-hime-cut | 姬髮式 | 臉側齊切與長髮形成對比 |  | hime cut, straight side locks cut at cheek length, long smooth back hair | uneven side locks, messy layered hair, random bangs | strong | normal | 姬髮式, 長髮, 輪廓 | 非常有辨識度，適合需要強角色記憶點時使用。 |
| 27 | library-hair-princess-cut | 公主切長髮 | 整齊臉側髮束與柔順長髮 |  | princess cut long hair, neat face-side sections, polished long hair silhouette | messy side hair, broken hairline, uneven cut | medium | normal | 公主切, 長髮, 整齊 | 比姬髮式更柔和，適合甜美或清冷人像。 |
| 28 | library-hair-single-side-braid | 側邊麻花辮 | 垂在一側肩前的編髮 |  | single side braid, loose braid resting over one shoulder, soft woven hair texture | two braids, tangled braid, stiff rope-like hair | medium | normal | 編髮, 側邊, 溫柔 | 適合田園、旅行、窗邊或咖啡店場景。 |
| 29 | library-hair-double-braids | 雙麻花辮 | 兩側垂落的對稱編髮 |  | double braids, two neat braided pigtails, symmetrical woven hair | single braid, uneven braids, childish exaggeration | medium | normal | 編髮, 對稱, 復古 | 適合復古、學院、清新日常風。 |
| 30 | library-hair-crown-braid | 低調編髮髮冠 | 頭側環繞的細緻編髮 |  | subtle crown braid, braided hair detail around the head, delicate romantic texture | oversized braid crown, messy tangled braid, costume wig | medium | normal | 編髮, 髮冠, 浪漫 | 適合花園、婚禮感、柔和光影，但不要和過多配飾疊太滿。 |
| 31 | library-hair-wet-hair | 濕髮感 | 帶有水氣與貼合感的髮絲 |  | wet hair look, damp glossy strands, slightly clinging hair texture | greasy hair, dirty hair, plastic shine | medium | normal | 濕髮, 光澤, 張力 | 適合雨夜、浴室鏡前或高張力寫真。 |
| 32 | library-hair-bedhead | 剛睡醒亂髮 | 自然凌亂但合理的睡醒髮流 |  | bedhead hair, natural messy strands, soft unstyled morning texture | dirty hair, severe tangles, broken hair shape | medium | normal | 亂髮, 居家, 自然 | 適合生活流瞬間與非棚拍感。 |
| 33 | library-hair-windswept | 被風吹亂的髮絲 | 風造成的自然髮流與飛絲 |  | windswept hair, natural flyaway strands, hair moving with gentle wind | extreme storm hair, tangled mess, frozen hair strands | medium | normal | 風感, 飛絲, 動態 | 適合戶外、街拍、旅行，不應同時搭配過於整齊的髮型。 |
| 34 | library-hair-face-framing-strands | 臉側碎髮 | 臉頰附近自然垂落的小髮束 |  | loose face-framing strands, soft hair pieces near the cheeks, natural flyaways | stiff side locks, messy tangled strands, blocked face | medium | normal | 碎髮, 臉側, 自然 | 可強化真實感，和多數髮型相容。 |
| 35 | library-hair-pastel-pink-brown | 粉棕髮色 | 柔和不誇張的粉棕色調 |  | soft pink-brown hair color, muted rosy brown tone, natural dyed hair finish | neon pink hair, patchy dye, oversaturated color | medium | normal | 染髮, 粉棕, 柔和 | 適合日系、社群感、溫柔人像。 |
| 36 | library-hair-ash-brown | 亞麻灰棕髮 | 低飽和冷調棕色髮色 |  | ash brown hair color, muted cool brown tone, soft low-saturation dye | orange hair, oversaturated brown, uneven dye patches | medium | normal | 染髮, 灰棕, 低飽和 | 適合清冷、膠片與城市街拍。 |
| 37 | library-hair-silver-gray | 銀灰髮色 | 帶未來感的冷銀灰髮 |  | silver gray hair color, cool metallic ash tone, smooth dyed hair texture | white wig, patchy gray dye, plastic shine | medium | normal | 染髮, 銀灰, 未來感 | 風格感強，適合未來感、街頭或編輯寫真。 |
| 38 | library-hair-highlight-streaks | 挑染髮束 | 局部可見的對比色挑染 |  | subtle highlight streaks, selective dyed hair strands, visible color accents | full rainbow hair, messy dye patches, harsh stripes | medium | normal | 挑染, 髮色, 亮點 | 用來增加小範圍角色記憶點，不取代整體髮型。 |
| 39 | library-hair-ombre-gradient | 漸層髮色 | 從髮根到髮尾自然過渡的染髮 |  | ombre gradient hair color, natural transition from darker roots to lighter ends | harsh color block, patchy gradient, unnatural dye line | medium | normal | 漸層, 染髮, 髮尾 | 適合 Y2K、社群封面或時尚感人像。 |
| 40 | library-hair-slicked-back | 後梳濕亮髮 | 額頭露出、髮絲向後貼順 |  | slicked-back hair, forehead exposed, glossy controlled hair swept backward | messy bangs, dry frizzy hair, random loose fringe | strong | normal | 後梳, 露額, 張力 | 控制力強，適合成熟、冷感或高對比光影。 |
