# Prompt Atom System v2 Expansion Development Plan

Updated: 2026-06-06 20:22 HKT

## 1. Objective

Upgrade Prompt 視覺化素材工作台 from the current 16-category prompt structure into a more atomic, reusable, mixable Prompt Atom System v2.

The goal is not just to add more category names. The new system must make prompt atoms more controllable across subject count, body composition, camera angle, composition, mood, time/weather, palette, material, hair, face features, gestures, eye direction, interaction, realism, imperfection, post-processing, typography, platform format, negative atoms, and priority.

The product UI must remain Traditional Chinese. Internal code and docs may use English.

## 2. Current Verified Status

Verified in `/Users/ken/Application/PromptG` on 2026-06-06:

1. `git status --short -uall` is clean.
2. `npm run lint` passed.
3. `npm test` passed: 8 test files, 20 tests.
4. `npm run build` passed on Next.js 16.2.7.
5. `data/app.db` exists.
6. `data/uploads/seed/` contains 16 seed images.
7. Existing production readiness report: `docs/superpowers/reports/2026-06-06-prompt-workbench-p2-production-readiness.md`.
8. Current category system is implemented in `src/lib/constants.ts`.
9. Category validation is derived from `CATEGORIES` through `src/lib/validation/shared.ts`.
10. The SQLite schema stores `prompt_atoms.category` as plain text, so adding categories does not require a destructive DB migration.
11. The Mimo parser hardcodes the current 16 categories in `src/lib/mimo/parser.ts`.
12. The main UI maps `CATEGORIES` directly in `src/components/workbench/prompt-workbench.tsx`.

## 3. Why This Needs A v2 Design

The existing 16 categories are a first-layer image prompt structure:

1. 人設
2. 表情
3. 姿態
4. 上裝
5. 下裝
6. 鞋履
7. 場景
8. 寫真風格
9. 光影
10. 畫面影響
11. 版式設計
12. 配飾
13. 道具
14. 鏡頭質感
15. 景別
16. 妝容

This works for a general portrait/image prompt, but it mixes multiple concerns:

1. 人設 currently contains face, hair, role, and identity.
2. 姿態 currently contains body pose, hand gesture, eye direction, and interaction.
3. 景別 controls camera distance but not body framing.
4. 鏡頭質感 controls device/rendering feel but not camera angle.
5. 版式設計 mixes composition, typography, and decoration.
6. 畫面影響 mixes realism, defect, texture, and post-processing.
7. Negative Prompt is stored on atoms but not treated as a first-class reusable atom type.
8. Conflicting atoms have no priority/weight contract.

Atom System v2 should make these layers explicit while preserving the current app's local-first simplicity.

## 4. Target Category Taxonomy

Target visible categories:

1. 人設
2. 臉部特徵
3. 髮型
4. 表情
5. 視線
6. 姿態
7. 手部動作
8. 身體構圖
9. 主體數量 / 人物關係
10. 上裝
11. 下裝
12. 鞋履
13. 配飾
14. 道具
15. 妝容
16. 場景
17. 場景細節
18. 互動行為
19. 時間 / 季節 / 天氣
20. 光影
21. 色彩系統
22. 寫真風格
23. 鏡頭角度
24. 鏡頭質感
25. 景別
26. 構圖規則
27. 材質
28. 畫面影響
29. 版式設計
30. 文本元素
31. 平台媒介
32. 真實性 / 缺陷控制
33. 後期處理
34. Negative Atom
35. 尺寸
36. 質量

## 5. Category Semantics

### 5.1 Identity And Face Layer

1. 人設: role, identity, archetype, age feel, base character.
2. 臉部特徵: face shape, eyes, facial impression, nose bridge, strong/light facial type.
3. 髮型: bangs, twin tails, bob, wet hair, princess cut, dyed hair, curled ends.
4. 表情: smile, coldness, crying, playful emotion, mouth shape.
5. 視線: looking at camera, looking away, looking down at phone, mirror eye contact.

### 5.2 Body And Relationship Layer

1. 姿態: overall body pose, sitting, standing, walking, turning.
2. 手部動作: hand on cheek, finger near lips, holding collar, heart gesture.
3. 身體構圖: headshot, bust, half body, seven-tenths body, full body, back view, side body.
4. 主體數量 / 人物關係: solo, duo, couple, best friends, idol group, foreground/background people.
5. 互動行為: mirror selfie, lying on bed using phone, drinking coffee by window, standing outside convenience store.

### 5.3 Styling And Object Layer

1. 上裝
2. 下裝
3. 鞋履
4. 配飾
5. 道具
6. 妝容
7. 材質: lace, chiffon, knit, leather, metal, silk, wet reflection, glass, paper collage.

### 5.4 World And Atmosphere Layer

1. 場景
2. 場景細節
3. 時間 / 季節 / 天氣
4. 光影
5. 色彩系統
6. 寫真風格

### 5.5 Camera And Frame Layer

1. 鏡頭角度: eye-level, slight high angle, slight low angle, mirror reflection angle, selfie arm-length angle.
2. 鏡頭質感: smartphone snapshot, amateur flash, film camera, DSLR, low-resolution social platform feel.
3. 景別: camera distance such as close-up, medium shot, full shot.
4. 構圖規則: center composition, rule of thirds, diagonal composition, foreground occlusion, frame-within-frame.

### 5.6 Media And Output Layer

1. 畫面影響: overlay effects and visual surface impacts.
2. 版式設計: layout and decorative design system.
3. 文本元素: no text, Japanese small text, handwritten text, magazine cover text, timestamp, chat bubbles.
4. 平台媒介: Instagram story, 小紅書封面, TikTok screenshot feel, Polaroid, magazine cover, livestream screenshot.
5. 後期處理: film grain, Polaroid border, low-res compression, vignette, light leak, soft focus.

### 5.7 Control Layer

1. 真實性 / 缺陷控制: combines realism and imperfection control, including real phone snapshot, natural skin texture, background clutter, slight blur, overexposure, hair flyaways.
2. Negative Atom: reusable negative prompt atoms.
3. 尺寸: existing size presets.
4. 質量: existing quality presets.

## 6. Selection Mode Policy

The current system supports single and multi category selection. v2 should keep this model, but define it more carefully.

### 6.1 Recommended Single-Select Categories

These categories normally define one dominant layer:

1. 主體數量 / 人物關係
2. 人設
3. 臉部特徵
4. 髮型
5. 表情
6. 視線
7. 姿態
8. 身體構圖
9. 上裝
10. 下裝
11. 鞋履
12. 妝容
13. 場景
14. 時間 / 季節 / 天氣
15. 光影
16. 色彩系統
17. 寫真風格
18. 鏡頭角度
19. 鏡頭質感
20. 景別
21. 構圖規則
22. 平台媒介
23. 尺寸
24. 質量

### 6.2 Recommended Multi-Select Categories

These categories are usually additive:

1. 手部動作
2. 配飾
3. 道具
4. 場景細節
5. 互動行為
6. 材質
7. 畫面影響
8. 版式設計
9. 文本元素
10. 真實性 / 缺陷控制
11. 後期處理
12. Negative Atom

### 6.3 Product Note

The UI should continue to show single/multi behavior clearly. If a category is multi-select, the card should not look like it is replacing prior selections.

## 7. Compile Order v2

The compiler should produce a deterministic prompt order. Recommended v2 order:

1. 主體數量 / 人物關係
2. 人設
3. 臉部特徵
4. 髮型
5. 表情
6. 視線
7. 姿態
8. 手部動作
9. 身體構圖
10. 景別
11. 鏡頭角度
12. 構圖規則
13. 上裝
14. 下裝
15. 鞋履
16. 妝容
17. 配飾
18. 道具
19. 互動行為
20. 場景
21. 場景細節
22. 時間 / 季節 / 天氣
23. 光影
24. 色彩系統
25. 寫真風格
26. 鏡頭質感
27. 材質
28. 真實性 / 缺陷控制
29. 畫面影響
30. 後期處理
31. 版式設計
32. 文本元素
33. 平台媒介
34. 尺寸
35. 質量

`Negative Atom` should not be appended to the positive prompt. It should compile into a separate negative prompt output layer.

## 8. Negative Atom Design

Current atoms already have `negativePrompt`, but this is per-atom metadata. v2 adds `Negative Atom` as a first-class reusable category.

Recommended behavior:

1. Positive categories compile into the main Prompt.
2. Each selected positive atom can contribute its own `negativePrompt`.
3. Selected `Negative Atom` entries contribute their `prompt` text to a global negative prompt output.
4. The compiler should expose:
   - `positivePrompt`
   - `negativePrompt`
   - optionally `combinedPrompt` for legacy copy behavior.
5. Copy UI should eventually support:
   - 複製 Prompt
   - 複製 Negative Prompt
   - 複製完整 Prompt

This should be a phased change because the current compiler returns only a single string.

## 9. Priority / Weight Design

The user's proposed `Prompt 強度 / Weight / Priority` is important, but it should not be a normal visible category in the same way as `髮型` or `場景`.

Recommended model:

1. Add atom-level metadata:
   - `priority`: `core` | `strong` | `medium` | `weak` | `reference`
   - `lockPolicy`: `normal` | `can_override` | `cannot_override`
2. Keep a default priority for all atoms, such as `medium`.
3. Use priority for future conflict warnings and compile grouping.
4. Do not force model-specific syntax like `(prompt:1.2)` in v2 unless a target image model syntax is explicitly selected later.

Recommended UI:

1. Add a compact `Prompt 強度` selector inside atom create/edit form.
2. Do not create a separate category called `Prompt 強度`; that would create awkward atoms like "強控制" that do not carry prompt content.

## 10. Data Model Impact

Current DB schema:

1. `prompt_atoms.category` is `text`.
2. No SQL enum blocks new category values.
3. Existing `combinationSnapshotJson` stores category-keyed selected atoms.

This means v2 can avoid destructive migration for category expansion.

Recommended schema additions:

1. `prompt_atoms.priority` text, default `medium`.
2. `prompt_atoms.lock_policy` text, default `normal`.
3. Optional future field: `prompt_atoms.atom_type` text, default `positive`.

Recommended compatibility:

1. Existing atoms keep their current category values.
2. Existing Gallery snapshots still parse.
3. If a category is removed or renamed later, app should display it as legacy rather than dropping it.
4. Do not delete existing seed/user atoms during upgrade.

## 11. Constants And Validation Changes

Files to update:

1. `src/lib/constants.ts`
2. `src/lib/validation/shared.ts`
3. `src/lib/validation/atoms.ts`
4. `src/lib/validation/prompt-parse.ts`
5. `src/lib/prompt/compiler.ts`
6. `src/stores/current-combination.ts`
7. `src/lib/mimo/parser.ts`
8. `src/lib/seed/seed-atoms.ts`
9. `src/components/workbench/prompt-workbench.tsx`

Implementation guidance:

1. Replace flat category-only arrays with richer category definitions:
   - `id`
   - `label`
   - `group`
   - `selectionMode`
   - `compileOrder`
   - `description`
   - `examples`
2. Keep stable labels in Traditional Chinese.
3. If using IDs, use stable ASCII ids for code and DB compatibility, but preserve labels in UI.
4. If not introducing IDs yet, at least centralize category metadata in one object and derive arrays from it.
5. The Mimo parser prompt must derive allowed categories from shared constants rather than hardcoding a category string list.

## 12. UI Changes

With 36 categories, the current flat category grid will become too dense.

Recommended UI:

1. Add category groups/tabs:
   - 主體
   - 身體
   - 造型
   - 場景
   - 鏡頭
   - 媒介
   - 控制
2. The big image selector should show:
   - group filter
   - category list within group
   - search across all categories
3. Current combination area should not show 36 equal cards in a giant flat grid by default.
4. Recommended current combination layout:
   - show selected groups as collapsible sections
   - show empty important categories as compact add slots
   - allow "顯示全部分類" when needed
5. Atom create/edit form should show category group + category selector, not one very long dropdown.

All product-facing text must remain Traditional Chinese.

## 13. Mimo Parser Changes

The parser currently tells Mimo that category must be one of the 16 old categories.

v2 parser requirements:

1. Allowed category list must come from category metadata.
2. System prompt should explain the category groups and examples.
3. Output schema remains draft atom JSON.
4. Parsed `title`, `subtitle`, `tags`, and `notes` must be Traditional Chinese.
5. `prompt` may remain English.
6. Parser should be encouraged to output more atomic, smaller items instead of broad combined atoms.
7. Parser should use `Negative Atom` for reusable negative constraints.
8. Parser should not output `尺寸` or `質量` atoms unless the source prompt explicitly contains image size or quality controls.

Recommended parser instruction:

> 請優先拆成細顆粒 atoms。不要把髮型、臉部特徵、表情、視線、姿態、手部動作混在同一個「人設」或「姿態」裡。

## 14. Seed Data Changes

Existing seed data has 16 atoms, one per old category.

v2 needs seed coverage that teaches the new taxonomy.

Recommended minimum:

1. Keep the existing 16 seed atoms.
2. Add at least 20 new seed atoms for newly introduced categories.
3. Use existing preview images only when visually appropriate.
4. For categories that need visual distinction, generate new preview images with Codex built-in image2 / GPT Image 2 during implementation.
5. Seed metadata must be Traditional Chinese.
6. Prompt bodies may remain English.

High-value new seed atoms:

1. 單人
2. 雙人
3. 空氣瀏海
4. 下垂眼
5. 直視鏡頭
6. 手托腮
7. 半身
8. 自拍臂距視角
9. 中心構圖
10. 深夜私密感
11. 雨夜
12. 冷藍夜色
13. 蕾絲
14. 生活流瞬間
15. 輕微失焦
16. Instagram story 塗鴉
17. 日文小字
18. 小紅書封面
19. 不要 AI 塑膠皮膚
20. 不要錯誤手指

## 15. Migration Strategy

Recommended safe approach:

### Phase A: Category Metadata Refactor

1. Introduce category metadata definitions.
2. Derive old 16 categories from the new structure while preserving behavior.
3. Update tests.
4. No UI expansion yet.

Status on 2026-06-06 17:41 HKT: complete for P3A.

Implemented:

1. `src/lib/constants.ts` now uses `CATEGORY_METADATA` as the source of truth for the existing 16 categories.
2. Metadata includes `id`, `label`, `group`, `selectionMode`, `compileOrder`, `description`, and `examples`.
3. `CATEGORIES`, `SINGLE_SELECT_CATEGORIES`, `MULTI_SELECT_CATEGORIES`, `CATEGORY_SELECTION_MODE`, and `COMPILE_ORDER` are derived from metadata.
4. Mimo parser allowed categories and category guidance are derived from shared constants / metadata instead of a handwritten 16-category list.
5. Workbench default category now uses `DEFAULT_CATEGORY`; visible UI still shows the same Traditional Chinese 16-category experience.
6. No DB schema change; `prompt_atoms.category` remains text.
7. No new categories, Negative Atom, Priority, UI grouping, seed expansion, or runtime image generation were introduced.

Verification:

```bash
npm run lint
npm test
npm run build
rg -n "tp-sh|XIAOMI_MIMO_API_KEY=.*[A-Za-z0-9]{12,}|sk-[A-Za-z0-9]" . --glob '!node_modules/**' --glob '!.next/**'
```

Results:

1. `npm run lint` passed.
2. `npm test` passed: 9 test files, 24 tests.
3. `npm run build` passed on Next.js 16.2.7.
4. Secret scan found no real API key; matches were existing command text in docs / README and the existing `queue-microtask-1` false positive in `package-lock.json`.

### Phase B: Expand To v2 Categories

1. Add all v2 categories.
2. Update selection modes.
3. Update compile order.
4. Update Mimo parser allowed categories.
5. Update current combination UI for grouped categories.
6. Update tests.

Status on 2026-06-06 17:59 HKT: complete for P3B.

Implemented:

1. `src/lib/constants.ts` now exposes all 36 v2 target categories in metadata.
2. Selection modes match the v2 policy: 24 single-select categories and 12 multi-select categories.
3. `COMPILE_ORDER` follows the v2 positive prompt order and excludes `Negative Atom` from the positive prompt for P3B.
4. Category metadata now includes grouped UI helpers: `CATEGORY_GROUPS`, `CATEGORY_METADATA_BY_LABEL`, and `CATEGORIES_BY_GROUP`.
5. Mimo parser category instructions include all v2 categories from shared metadata, plus P3B rules for `Negative Atom` and explicit-only `尺寸` / `質量` output.
6. Workbench current-combination UI is grouped by `主體`, `身體`, `造型`, `場景`, `鏡頭`, `媒介`, and `控制`, with compact slots and a `顯示全部分類` / `只顯示已選分類` toggle.
7. Big selector now uses grouped category navigation and search can scan across all categories.
8. Atom create/edit and parsed-draft edit flows use a group + category picker instead of a 36-item dropdown.
9. Existing 16-category atoms and Gallery snapshots remain category-label compatible because `prompt_atoms.category` and snapshot keys remain text labels.
10. No Priority / Weight schema, full Negative Prompt split output, public sharing, cloud sync, login, payment, or product image generation was introduced.

Verification:

```bash
npm run lint
npm test
npm run build
node API create/edit/delete smoke test for new v2 categories
npx/Playwright browser verification against http://localhost:3000
```

Results:

1. `npm run lint` passed.
2. `npm test` passed: 9 test files, 28 tests.
3. `npm run build` passed on Next.js 16.2.7.
4. API smoke test created a temporary `髮型` atom, patched it to `臉部特徵`, deleted it, and confirmed zero temporary leftovers.
5. Browser verification captured desktop, grouped-all-categories, big-selector, atom-form, and mobile screenshots under `/tmp/promptg-p3b-*.png`.
6. Browser checks confirmed 7 grouped selector sections, grouped category picker with 7 group buttons, new category visibility including `臉部特徵`, `髮型`, `Negative Atom`, `尺寸`, and `質量`, and no mobile horizontal overflow.

### Phase C: Negative Prompt And Priority

1. Add compiler output structure.
2. Add Negative Atom behavior.
3. Add atom priority metadata.
4. Add UI controls for priority.
5. Update Gallery snapshot compatibility.

Status on 2026-06-06 18:18 HKT: complete for P3C.

Implemented:

1. `prompt_atoms` now has additive `priority` and `lock_policy` text columns with safe defaults.
2. SQLite bootstrap migrates existing `data/app.db` in place with `ALTER TABLE` only when the columns are missing.
3. Supported priority values are `core`, `strong`, `medium`, `weak`, and `reference`; default is `medium`.
4. Supported lock policies are `normal`, `can_override`, and `cannot_override`; default is `normal`.
5. Validation, atom API create/update, DB query mapping, seed bootstrap, selected atom snapshots, and store restore all carry the new metadata.
6. Legacy Gallery snapshots without priority metadata are normalized to `medium` / `normal`.
7. Compiler now returns `positivePrompt`, `negativePrompt`, and `combinedPrompt`.
8. `Negative Atom` prompt text compiles into global negative output and does not enter positive prompt.
9. Positive atoms' per-atom `negativePrompt` values merge into negative output.
10. Priority is used as a stable compiler grouping basis inside each category; no model-specific syntax such as `(prompt:1.2)` was introduced.
11. Workbench atom create/edit and parsed-draft edit forms expose Traditional Chinese `Prompt 強度` and `覆蓋策略` controls.
12. Copy UI now supports `複製 Prompt`, `複製 Negative Prompt`, and `複製完整 Prompt`.
13. Existing single Prompt workflow remains available through the positive Prompt textarea and copy button.

Verification:

```bash
npm run lint
npm test
npm run build
node/API DB migration and atom create/update/delete smoke test
npx/Playwright browser verification against http://localhost:3000
```

Results:

1. `npm run lint` passed.
2. `npm test` passed: 9 test files, 32 tests.
3. `npm run build` passed on Next.js 16.2.7.
4. Runtime DB smoke confirmed existing `prompt_atoms` initially lacked `priority` / `lock_policy`, bootstrap added both columns, API create accepted explicit `core` / `cannot_override`, default create returned `medium` / `normal`, patch updated to `weak` / `can_override`, and temporary atoms were deleted with zero leftovers.
5. Browser verification captured compiler and atom-form screenshots under `/tmp/promptg-p3c-*.png`.
6. Browser checks confirmed all three copy buttons, the Negative Prompt output textarea, `Prompt 強度`, `覆蓋策略`, defaults, and no mobile horizontal overflow.

### Phase D: Seed Expansion And QA

1. Add new seed atoms.
2. Generate new preview images where needed.
3. Verify seed bootstrap idempotency.
4. Run build/lint/test.
5. Browser-check category navigation and compile output.

Status on 2026-06-06 18:42 HKT: complete for P3D.

Implemented:

1. `src/lib/seed/seed-atoms.ts` now contains 36 seed atoms covering all 36 v2 categories.
2. Existing 16 seed atoms were kept; 20 new v2 seed atoms were added for the newly introduced categories.
3. New seed metadata is Traditional Chinese, while Prompt fragments remain directly usable Prompt text.
4. New seed atoms reuse existing local seed preview images where visually compatible; no product runtime image generation was introduced.
5. `src/lib/seed/bootstrap.ts` now backfills missing seed IDs even when the old v1 bootstrap marker exists, and records a v2 marker after successful bootstrap.
6. Bootstrap remains idempotent because each seed ID is checked before insertion.
7. Mimo parser tests now cover mocked v2 output including `髮型` and `Negative Atom`.
8. Parser system prompt tests assert metadata-derived category instructions, fine-grained splitting, Negative Atom usage, and explicit-only `尺寸` / `質量` rules.
9. Seed tests now assert 36 total seeds, full v2 category coverage, existing local preview files, and Traditional Chinese visible metadata.
10. A production readiness report was added at `docs/superpowers/reports/2026-06-06-atom-system-v2-production-readiness.md`.

Verification:

```bash
npm run lint
npm test
npm run build
rg -n "tp-sh|XIAOMI_MIMO_API_KEY=.*[A-Za-z0-9]{12,}|sk-[A-Za-z0-9]" . --glob '!node_modules/**' --glob '!.next/**'
node / curl runtime seed bootstrap smoke against http://localhost:3000/api/atoms
Browser QA against http://localhost:3000 at desktop and 390x844 mobile viewport
```

Results:

1. `npm run lint` passed.
2. `npm test` passed: 10 test files, 37 tests.
3. `npm run build` passed on Next.js 16.2.7.
4. Runtime DB smoke confirmed seed rows increased from 16 to 36 after API bootstrap, distinct IDs remained 36, category coverage reached 36, and duplicate seed IDs were zero.
5. Browser QA confirmed grouped category UI, selector search, seed selection, compiler Prompt / Negative Prompt update, atom form priority/lock controls, and no desktop/mobile horizontal overflow.
6. Secret scan found no real API key; matches were command text in docs / README and the package-lock false positive for `queue-microtask-1`.

## 16. Acceptance Criteria

This upgrade is complete when:

1. App exposes the v2 category taxonomy in Traditional Chinese.
2. Existing atoms and Gallery snapshots remain usable.
3. New atoms can be created in every v2 category.
4. Single-select and multi-select behavior matches policy.
5. Compiler uses v2 compile order.
6. Negative Atom compiles into a separate negative prompt output.
7. Atom priority exists and is editable.
8. Mimo parser outputs v2 categories and validates them.
9. Seed atoms cover the new taxonomy with at least 36 total useful atoms.
10. `npm run lint` passes.
11. `npm test` passes.
12. `npm run build` passes.
13. No real API key appears in source, docs, tests, frontend bundle, or git.
14. UI remains usable with 36 categories at desktop and mobile widths.

## 17. Recommended Verification Commands

```bash
npm run lint
npm test
npm run build
rg -n "tp-sh|XIAOMI_MIMO_API_KEY=.*[A-Za-z0-9]{12,}|sk-[A-Za-z0-9]" . --glob '!node_modules/**' --glob '!.next/**'
find data/uploads/seed -type f | wc -l
```

## 18. Risks

1. A flat 36-category UI may become visually noisy. Use grouping.
2. Changing category strings can break old Gallery snapshots. Preserve compatibility.
3. Negative Atom changes the compiler contract. Phase it carefully.
4. Priority can become vague if not tied to compiler behavior. Start with metadata and UI, then add conflict warnings later.
5. Mimo parser may overproduce too many atoms. Add clear prompt rules and cap output count.
6. Seed image generation can become time-consuming. Reuse existing previews when they genuinely match.

## 19. Non-Goals

This upgrade does not add:

1. Public sharing.
2. Cloud sync.
3. Multi-user accounts.
4. Payment or credits.
5. Runtime image generation inside the app.
6. Model-specific prompt weighting syntax.
7. A new image model selection feature.

## 20. Suggested Next Goals

After reviewing this document, split implementation into separate goals:

1. P3A: Category metadata refactor with no visible taxonomy expansion.
2. P3B: v2 category expansion and grouped UI.
3. P3C: Negative Atom and priority compiler upgrade.
4. P3D: Seed expansion, Mimo parser upgrade, and production QA.

## 21. P4 Material Library Follow-Up Status

Status on 2026-06-07: P4A-P4D are complete through the main 31-category / 730-atom production scope.

1. P4A added structured app-owned expanded hair atoms in `src/lib/seed/expanded-atoms.ts`.
2. P4B added the Gemini batch preview generator, manifest/resume contract, secret-safe env lookup, and `/api/uploads/atom-previews/[filename]`.
3. P4C generated 40 local hair preview PNGs, validated the manifest/files, wired manifest-backed preview paths into `ensureExpandedAtoms()`, and verified DB/app/browser availability.
4. P4D started on 2026-06-07 with target-count contracts for main 31/730 and full v2 36/840 plus generator dry-run scopes.
5. P4D main-scope text/source is complete for 31 categories / 730 unique main atoms, mirrored into shard docs and app-owned structured data.
6. P4D generated and validated 730 local main-scope preview PNGs: manifest `data/uploads/atom-previews/manifest.json`, 690 `generated`, 40 `skipped_existing`, 0 failed.
7. P4D app-owned bootstrap/import was verified through `listAtoms()`: DB total 735, main-scope total 730, duplicate IDs 0, missing preview files 0, seed text changes 0.
8. P4D desktop/mobile browser QA passed: category overview counts loaded, visible previews decoded at 1024x1024, Negative Atom stayed separate from the positive Prompt, and 390x844 mobile had no horizontal overflow.
9. 2026-06-07 persona add-on expanded `人設` from 30 to 80 with 50 new `library-persona-addon-*` atoms and Gemini previews for a 20-year-old cute Japanese adult non-celebrity visual direction.
10. Persona add-on validation checked 780 main previews; DB total is 785, `人設` is 80, and browser QA verified selector sidebar `人設80` plus visible 1024x1024 new previews.
11. Remaining work: optional full v2 add-on for `材質`, `真實性 / 缺陷控制`, `Negative Atom`, `尺寸`, and `質量`; with persona add-on included, full v2 completion target is 36/890.
