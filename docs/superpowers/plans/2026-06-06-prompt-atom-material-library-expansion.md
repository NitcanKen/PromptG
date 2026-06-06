# Prompt Atom Material Library Expansion Plan

Updated: 2026-06-06 20:10 HKT

## 1. Objective

Expand the Prompt Atom Workbench material library from a structurally complete but thin seed set into a dense, reusable text-first prompt atom library.

This phase starts from text content, then feeds the approved atoms into the production image integration plan:

1. Text atoms are authored and reviewed first.
2. Approved atoms are later generated into one local preview image per atom.
3. Approved atoms and generated previews are imported into the app through app-owned bootstrap/import code.
4. Every new atom should be ready for later image generation and app import after review.
5. UI-facing text must be Traditional Chinese.
6. Prompt body text may remain English because most image models respond more consistently to English visual terms.

The end state should make the app useful as a real private prompt workbench, not just a taxonomy demo.

Production image integration is defined in:

`docs/superpowers/plans/2026-06-06-gemini-image-batch-generation-production-integration.md`

## 2. Current Baseline

Verified current state on 2026-06-06:

1. `data/app.db` contains 36 `prompt_atoms`.
2. The library has 36 v2 categories.
3. Each category currently has exactly 1 atom.
4. `data/uploads/seed/` contains 16 seed images.
5. The current seed library is structurally complete but not deep enough for daily mixing.
6. `gallery_items` contains 2 browser verification records and should not be counted as reusable material library content.

This means the next content task is not category design. The next task is systematic atom writing.

## 3. Scope Decision

The user-specified target now covers 31 categories after adding the previously omitted `髮型` category:

1. 主體: 人設, 臉部特徵, 髮型, 表情, 視線, 主體數量 / 人物關係
2. 身體: 姿態, 手部動作, 身體構圖, 互動行為
3. 造型: 上裝, 下裝, 鞋履, 配飾, 道具, 妝容
4. 場景: 場景, 場景細節, 時間 / 季節 / 天氣, 光影, 色彩系統, 寫真風格
5. 鏡頭: 鏡頭角度, 鏡頭質感, 景別, 構圖規則
6. 媒介: 畫面影響, 版式設計, 文本元素, 平台媒介, 後期處理

The v2 taxonomy has 5 additional categories that are not listed in the user target:

1. 材質
2. 真實性 / 缺陷控制
3. Negative Atom
4. 尺寸
5. 質量

Recommended handling:

1. Treat the 31 user-specified categories as the main expansion scope.
2. Treat the 5 missing v2 categories as a required completion add-on before calling the library fully rounded.
3. Do not mix the missing categories into other categories. For example, do not hide hair atoms inside `人設`, material atoms inside `上裝`, or negative controls inside `畫面影響`.

## 4. Target Counts

### 4.1 Main Target From User Scope

| Group | Category | Final Target Count | Existing Count | New Text Atoms Needed |
| --- | --- | ---: | ---: | ---: |
| 主體 | 人設 | 30 | 1 | 29 |
| 主體 | 臉部特徵 | 30 | 1 | 29 |
| 主體 | 髮型 | 40 | 1 | 39 |
| 主體 | 表情 | 30 | 1 | 29 |
| 主體 | 視線 | 20 | 1 | 19 |
| 主體 | 主體數量 / 人物關係 | 10 | 1 | 9 |
| 身體 | 姿態 | 30 | 1 | 29 |
| 身體 | 手部動作 | 30 | 1 | 29 |
| 身體 | 身體構圖 | 30 | 1 | 29 |
| 身體 | 互動行為 | 30 | 1 | 29 |
| 造型 | 上裝 | 40 | 1 | 39 |
| 造型 | 下裝 | 40 | 1 | 39 |
| 造型 | 鞋履 | 40 | 1 | 39 |
| 造型 | 配飾 | 40 | 1 | 39 |
| 造型 | 道具 | 40 | 1 | 39 |
| 造型 | 妝容 | 40 | 1 | 39 |
| 場景 | 場景 | 20 | 1 | 19 |
| 場景 | 場景細節 | 20 | 1 | 19 |
| 場景 | 時間 / 季節 / 天氣 | 20 | 1 | 19 |
| 場景 | 光影 | 20 | 1 | 19 |
| 場景 | 色彩系統 | 20 | 1 | 19 |
| 場景 | 寫真風格 | 20 | 1 | 19 |
| 鏡頭 | 鏡頭角度 | 10 | 1 | 9 |
| 鏡頭 | 鏡頭質感 | 10 | 1 | 9 |
| 鏡頭 | 景別 | 10 | 1 | 9 |
| 鏡頭 | 構圖規則 | 10 | 1 | 9 |
| 媒介 | 畫面影響 | 10 | 1 | 9 |
| 媒介 | 版式設計 | 10 | 1 | 9 |
| 媒介 | 文本元素 | 10 | 1 | 9 |
| 媒介 | 平台媒介 | 10 | 1 | 9 |
| 媒介 | 後期處理 | 10 | 1 | 9 |

Main target total:

1. Final atoms in these 31 categories: 730
2. Existing atoms in these 31 categories: 31
3. New text atoms needed: 699

### 4.2 Completion Add-On For Full v2 Coverage

These categories should be handled after the main target or in a separate review pass.

| Group | Category | Recommended Final Count | Existing Count | New Text Atoms Needed |
| --- | --- | ---: | ---: | ---: |
| 造型 | 材質 | 30 | 1 | 29 |
| 控制 | 真實性 / 缺陷控制 | 30 | 1 | 29 |
| 控制 | Negative Atom | 30 | 1 | 29 |
| 控制 | 尺寸 | 10 | 1 | 9 |
| 控制 | 質量 | 10 | 1 | 9 |

Full v2 completion total if accepted:

1. Final atoms across all 36 categories: 840
2. Existing atoms across all 36 categories: 36
3. New text atoms needed: 804

## 5. Atom Content Schema

Every text atom should be written in this shape before later conversion to code or DB import:

```ts
{
  id: "library-<category-slug>-<short-slug>",
  category: "<Traditional Chinese category label>",
  title: "<Traditional Chinese card title>",
  subtitle: "<Traditional Chinese one-line effect summary>",
  previewImagePath: "",
  prompt: "<English prompt fragment>",
  negativePrompt: "<English negative fragment, optional but preferred>",
  priority: "medium",
  lockPolicy: "normal",
  tags: ["<Traditional Chinese tag>", "<Traditional Chinese tag>", "<Traditional Chinese tag>"],
  notes: "<Traditional Chinese usage note>"
}
```

Rules:

1. `title` should be short enough for a card title.
2. `subtitle` should explain the visible effect, not repeat the title.
3. `prompt` should be composable and avoid complete-scene overreach unless the category is a scene or platform category.
4. `negativePrompt` should block the most common failure mode of that atom.
5. `tags` should support browsing and filtering, not SEO.
6. `notes` should explain when to use the atom or what not to combine it with.
7. `previewImagePath` stays empty until the image phase.
8. Avoid celebrity names, living-person likeness, brand logos, copyrighted characters, and sexualized minor-coded wording.

## 6. Writing Rules By Category

### 6.1 主體

`人設` should define role, identity, archetype, personality, and base presence. It should not include hair, face, expression, outfit, pose, or camera.

Examples of useful subranges:

1. 日常少女
2. 清冷模特感
3. 地下偶像感
4. 旅行隨拍人物
5. 都市通勤人物
6. 甜酷網紅感
7. 鄰家自然感
8. 編輯部時尚人物

`臉部特徵` should describe facial structure or facial impression. It should not describe expression or gaze.

`表情` can use emoji in the title. Recommended pattern:

1. Title: `🙂 自然淺笑`
2. Subtitle: `嘴角微微上揚的放鬆表情`
3. Prompt: `soft natural smile, relaxed mouth corners, calm friendly expression`

`視線` should control eye direction and attention target. It should not duplicate expression.

`主體數量 / 人物關係` must control count and relationship. It should avoid detailed pose unless the relationship requires it.

### 6.2 身體

`姿態` controls whole-body pose.

`手部動作` controls local hand gestures and is multi-select. Keep prompts anatomically clear.

`身體構圖` controls which body parts are visible and emphasized. It is not the same as camera distance.

`互動行為` controls what the subject is doing with another person, an object, or the environment.

### 6.3 造型

`上裝`, `下裝`, and `鞋履` should be concrete and visually inspectable.

`配飾` and `道具` are multi-select. Each atom should describe one reusable object or accessory, not a full outfit.

`妝容` should describe makeup style, finish, color, and intensity. It should not alter the underlying face category.

### 6.4 場景

`場景` should define the main location.

`場景細節` should be additive background or foreground details. It should not replace the main scene.

`時間 / 季節 / 天氣` should control temporal and environmental conditions.

`光影` should control light source, shadow, contrast, and direction.

`色彩系統` should control global palette.

`寫真風格` should define the photographic genre or visual style.

### 6.5 鏡頭

`鏡頭角度` controls camera position.

`鏡頭質感` controls device, lens, sensor, flash, grain, and capture feel.

`景別` controls camera distance.

`構圖規則` controls frame structure.

These four categories must stay separate because they affect different layers of the final prompt.

### 6.6 媒介

`畫面影響` controls overlay-like visual surface effects.

`版式設計` controls layout or graphic arrangement.

`文本元素` controls text presence and typography.

`平台媒介` controls what kind of media artifact the image resembles.

`後期處理` controls post-processing style.

## 7. Batch Plan

Do not generate 660-794 atoms in one prompt or one file edit. Split the work into reviewable shards.

Recommended shard structure:

1. `docs/material-library/subject-atoms.md`
2. `docs/material-library/body-atoms.md`
3. `docs/material-library/styling-atoms-part-1.md`
4. `docs/material-library/styling-atoms-part-2.md`
5. `docs/material-library/scene-atoms.md`
6. `docs/material-library/camera-atoms.md`
7. `docs/material-library/media-atoms.md`
8. `docs/material-library/control-atoms.md`

Recommended generation order:

1. 主體 layer first, because it defines the base persona and reusable subject logic.
2. 身體 layer second, because it makes images active instead of static portraits.
3. 造型 layer third, because it has the highest volume and most visual variation.
4. 場景 layer fourth, because it determines story and atmosphere.
5. 鏡頭 layer fifth, because it changes realism and framing.
6. 媒介 layer sixth, because it changes output artifact type.
7. Completion add-on last, especially Negative Atom and realism controls.

## 8. Duplication And Quality Rules

An atom should be rejected or rewritten if:

1. It is only a synonym of an existing atom.
2. It secretly combines more than one category.
3. It depends on a specific celebrity, brand, anime character, or copyrighted IP.
4. It is too vague to affect generation.
5. It is too broad and acts like a full prompt instead of an atom.
6. Its `negativePrompt` contradicts the positive prompt.
7. Its Traditional Chinese title/subtitle/notes are not readable in the UI.
8. It pushes the library into one narrow aesthetic, such as only cute idol portraits, only bedroom selfies, or only dark cyberpunk scenes.

The library should deliberately cover multiple reusable directions:

1. 日常手機感
2. 編輯寫真感
3. 旅行隨拍
4. 城市街拍
5. 室內生活感
6. 清冷氛圍
7. 明亮元氣
8. 雨夜與霓虹
9. 低飽和膠片
10. 社群平台內容

## 9. Import Strategy After Text Approval

After text review, convert the approved markdown atoms into one structured source file or JSON file before touching SQLite.

Recommended path:

1. Write atom shards as markdown tables or TypeScript-like arrays.
2. Run duplicate and schema checks.
3. Convert approved atoms into `src/lib/seed/expanded-atoms.ts` or a JSON fixture.
4. Add bootstrap behavior that inserts missing atoms by stable `id` without deleting user-created atoms.
5. Keep existing 36 seed atoms unchanged unless a specific correction is required.
6. Use empty preview image paths until image assets are produced.

Do not directly hand-edit `data/app.db` as the source of truth. SQLite should be an output of the app/bootstrap path, not the canonical content authoring surface.

P4 status:

1. `docs/material-library/subject-hair-atoms.md` is converted into `src/lib/seed/expanded-atoms.ts` for the first `髮型` 40 slice.
2. The structured source preserves stable IDs, Traditional Chinese UI fields, English prompt fragments, priority, lock policy, tags, and notes.
3. `ensureExpandedAtoms()` inserts missing app-owned expanded atoms by stable ID and does not delete or overwrite existing seed/user-created atoms.
4. Generated preview image backfill now reads the production manifest and uses generated `/api/uploads/atom-previews/<atom-id>.png` paths when importing expanded atoms.
5. P4C generated and validated the first production `髮型` 40 preview slice, then verified DB/app availability through the app-owned bootstrap path.
6. `data/app.db` remains an output of app/bootstrap code and was not manually edited as the canonical source.

Remaining P4 work:

1. P4B: complete for Gemini batch generator proof-of-concept, dry-run, scoped generation, REST provider contract, manifest/resume basics, atom-preview serving route, and secret-safe logging.
2. P4C: complete for generated hair 40 images, manifest-backed preview backfill, DB/app import, route validation, and desktop/mobile browser QA with loaded previews.
3. P4D: remaining work is to expand approved shards toward the 730 main / 840 full v2 targets and run category-by-category production validation.

## 10. Production Image Integration

Image handling is no longer an undefined future task. The production image path is Gemini API Nano Banana 2 batch generation, integrated into the app.

Production image rules:

1. Generate one local preview image per approved atom.
2. Use Google Gemini API model `gemini-3.1-flash-image`.
3. Store generated images under `data/uploads/atom-previews/`.
4. Serve generated images through an app route such as `/api/uploads/atom-previews/[filename]`.
5. Use an Eastern aesthetic by default, unless the atom explicitly describes Western, European, American, non-Eastern, or non-human content.
6. Do not expose the Gemini API key to the browser or commit it to the repo.
7. Use resumable batch generation with rate limits, retries, and a manifest.
8. Import generated preview paths into app-owned atom records through idempotent app code, not by manually editing SQLite.

Detailed implementation, verification, and production readiness rules are defined in:

`docs/superpowers/plans/2026-06-06-gemini-image-batch-generation-production-integration.md`

## 11. Acceptance Criteria For This Expansion Phase

The text expansion phase is ready for implementation when:

1. The target counts are approved.
2. The omitted v2 categories are either accepted as completion add-on or explicitly postponed.
3. Each shard has complete atom entries with title, subtitle, prompt, negativePrompt, tags, notes, priority, and lockPolicy.
4. No shard contains placeholders such as `TBD`, `TODO`, or filler atoms.
5. Atoms are category-pure and composable.
6. Existing 36 atoms are preserved.
7. The Gemini production integration plan can turn the approved atoms into local preview images and DB records without manual cleanup.

## 12. Recommended Next Decision

Before generating the actual atoms, decide whether the target should be:

1. Main scope only: 730 final atoms across the 31 user-specified categories.
2. Full v2 library: 840 final atoms across all 36 categories.

Recommendation: use the full v2 library target, but split it into main scope first and completion add-on second. This keeps momentum while avoiding a permanent hole in `材質`, `真實性 / 缺陷控制`, `Negative Atom`, `尺寸`, and `質量`.
