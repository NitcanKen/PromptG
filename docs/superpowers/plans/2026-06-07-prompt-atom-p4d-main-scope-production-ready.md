# Prompt Atom P4D Main Scope Production Ready Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand PromptG to a production-ready main material library: 31 categories / 730 app-usable atoms, each with a local preview path and integrity coverage.

**Architecture:** Keep canonical content in app-owned structured source and mirrored markdown shards; SQLite remains bootstrap output. Reuse the existing Gemini preview generator and atom-preview route, adding scope contracts so batch runs can target main 31-category or full v2 scopes safely.

**Tech Stack:** Next.js 16.2.7 App Router, TypeScript, Vitest, Drizzle/SQLite, local filesystem previews, Gemini `gemini-3.1-flash-image` offline batch generation.

---

## Scope Decision

P4D executes the approved main scope first:

1. Main scope: 31 categories / 730 final atoms.
2. App total after main scope can be 735 because the 5 full-v2 add-on categories keep their existing seed atom until full-v2 completion.
3. Full v2: 36 categories / 840 final atoms remains the next completion add-on unless explicitly pulled into this run.

## Files

Create or modify these files:

1. `src/lib/seed/expanded-atom-targets.ts`: target count contracts for main/full scopes.
2. `src/lib/seed/expanded-atom-targets.test.ts`: count and category-scope tests.
3. `src/lib/seed/expanded-atoms.ts`: canonical app-owned approved expanded atoms.
4. `src/lib/seed/expanded-atoms.test.ts`: source integrity tests for count, IDs, validation, category purity, Traditional Chinese visible metadata, and main-scope completeness.
5. `src/lib/gemini/atom-preview-generator.ts`: `--all-main` / `--all-v2` batch targeting.
6. `src/lib/gemini/atom-preview-generator.test.ts`: CLI scope parsing and target selection tests.
7. `src/lib/gemini/atom-preview-validation.ts`: main/full validation scope support through the existing parsed options.
8. `scripts/gemini-generate-atom-previews.ts`: unchanged entrypoint using expanded options.
9. `scripts/validate-atom-previews.ts`: unchanged entrypoint using expanded options.
10. `docs/material-library/subject-atoms.md`
11. `docs/material-library/body-atoms.md`
12. `docs/material-library/styling-atoms-part-1.md`
13. `docs/material-library/styling-atoms-part-2.md`
14. `docs/material-library/scene-atoms.md`
15. `docs/material-library/camera-atoms.md`
16. `docs/material-library/media-atoms.md`
17. `docs/material-library/control-atoms.md` only when full-v2 add-on starts.
18. `docs/superpowers/plans/2026-06-06-prompt-atom-material-library-expansion.md`: P4D status checklist.
19. `docs/superpowers/plans/2026-06-06-gemini-image-batch-generation-production-integration.md`: P4D status checklist.
20. `docs/superpowers/plans/2026-06-06-prompt-atom-system-v2-expansion.md`: P4D status checklist.

## Task 1: Target Scope Contract

- [x] **Step 1: Write failing target tests**

Run:

```bash
npm test -- src/lib/seed/expanded-atom-targets.test.ts src/lib/gemini/atom-preview-generator.test.ts
```

Expected red state:

```text
Cannot find package '@/lib/seed/expanded-atom-targets'
不支援的參數：--all-main
```

- [x] **Step 2: Implement target contracts and CLI scope parsing**

Add `MAIN_SCOPE_CATEGORY_TARGETS`, `FULL_V2_CATEGORY_TARGETS`, `isMainScopeCategory()`, `isFullV2Category()`, and support `--all-main` / `--all-v2` in `parseAtomPreviewArgs()`.

- [x] **Step 3: Verify target tests pass**

Run:

```bash
npm test -- src/lib/seed/expanded-atom-targets.test.ts src/lib/gemini/atom-preview-generator.test.ts
```

Expected green state:

```text
Test Files  2 passed
Tests  12 passed
```

## Task 2: Main Scope Text Shards

- [x] **Step 1: Write source completeness tests**

Add tests to `src/lib/seed/expanded-atoms.test.ts`:

```ts
import {
  MAIN_SCOPE_CATEGORY_TARGETS,
  getMissingCategoryTargets,
} from "@/lib/seed/expanded-atom-targets";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

function countByCategory(atoms: Array<{ category: string; id: string }>) {
  return atoms.reduce<Record<string, number>>((counts, atom) => {
    counts[atom.category] = (counts[atom.category] ?? 0) + 1;
    return counts;
  }, {});
}

it("reaches the main scope target counts when seed and expanded atoms are combined by stable ID", () => {
  const byId = new Map([...SEED_ATOMS, ...EXPANDED_ATOMS].map((atom) => [atom.id, atom]));
  const mainAtoms = [...byId.values()].filter((atom) => atom.category in MAIN_SCOPE_CATEGORY_TARGETS);
  const counts = countByCategory(mainAtoms);

  expect(getMissingCategoryTargets(counts, MAIN_SCOPE_CATEGORY_TARGETS)).toEqual(
    Object.fromEntries(Object.keys(MAIN_SCOPE_CATEGORY_TARGETS).map((category) => [category, 0])),
  );
  expect(mainAtoms).toHaveLength(730);
});
```

Run:

```bash
npm test -- src/lib/seed/expanded-atoms.test.ts
```

Expected red state: non-hair main categories report missing atoms.

- [x] **Step 2: Author markdown shards**

Create main-scope shard docs using the existing table schema:

```text
| # | id | title | subtitle | previewImagePath | prompt | negativePrompt | priority | lockPolicy | tags | notes |
```

Shard counts:

```text
subject-atoms.md: 人設 30, 臉部特徵 30, 表情 30, 視線 20, 主體數量 / 人物關係 10; reference subject-hair-atoms.md for 髮型 40
body-atoms.md: 姿態 30, 手部動作 30, 身體構圖 30, 互動行為 30
styling-atoms-part-1.md: 上裝 40, 下裝 40, 鞋履 40
styling-atoms-part-2.md: 配飾 40, 道具 40, 妝容 40
scene-atoms.md: 場景 20, 場景細節 20, 時間 / 季節 / 天氣 20, 光影 20, 色彩系統 20, 寫真風格 20
camera-atoms.md: 鏡頭角度 10, 鏡頭質感 10, 景別 10, 構圖規則 10
media-atoms.md: 畫面影響 10, 版式設計 10, 文本元素 10, 平台媒介 10, 後期處理 10
```

- [x] **Step 3: Convert approved shards to structured source**

Update `src/lib/seed/expanded-atoms.ts` so `EXPANDED_ATOMS` includes all main-scope approved atoms. Preserve existing IDs and add seed IDs for main categories only when needed to generate/backfill a main-scope atom-preview file.

- [x] **Step 4: Verify source completeness**

Run:

```bash
npm test -- src/lib/seed/expanded-atoms.test.ts
```

Expected green state: source schema passes and seed+expanded unique main atoms total 730.

Verified on 2026-06-07, but later rejected by user-visible aesthetic QA because the old generator wrapper produced bland live-action portraits instead of the required ACG/2.5D character-card previews:

```text
npm test -- src/lib/seed/expanded-atoms.test.ts src/lib/seed/expanded-atom-targets.test.ts src/lib/gemini/atom-preview-generator.test.ts
Test Files  3 passed
Tests  19 passed
```

## Task 3: Preview Generation And Manifest

- [x] **Step 1: Dry-run main target**

Run:

```bash
npm run generate:atom-previews -- --dry-run --all-main --limit 5
```

Expected: prints 5 planned atom previews, no manifest write, no provider call.

Verified on 2026-06-07:

```text
npm run generate:atom-previews -- --dry-run --all-main --limit 5
Dry-run planned 5 atom preview(s).
```

- [x] **Step 2: Generate resumable main previews**

Run with local env key only:

```bash
npm run generate:atom-previews -- --all-main --concurrency 4 --rpm 72
```

Expected: existing 40 hair previews are skipped, missing main-scope previews are generated, manifest records per-atom status.

Verified on 2026-06-07:

```text
npm run generate:atom-previews -- --all-main --concurrency 4 --rpm 72
Generated: 690
Skipped: 40
Failed: 0
Manifest: /Users/ken/Application/PromptG/data/uploads/atom-previews/manifest.json
```

- [x] **Step 3: Validate previews**

Run:

```bash
npm run validate:atom-previews -- --all-main
```

Expected green state: 730 checked target previews exist, are non-empty, decode as PNG, and manifest statuses are generated/skipped_existing.

Verified on 2026-06-07:

```text
npm run validate:atom-previews -- --all-main
Checked: 730
Manifest: /Users/ken/Application/PromptG/data/uploads/atom-previews/manifest.json
Atom preview validation passed.

Correction required before production-ready can be claimed:

1. Regenerate main-scope previews with `--force` after the global Gemini wrapper is changed to `2.5D 半寫實動漫角色卡 / 寫實系 ACG 人設肖像 / 真人感二次元角色攝影`.
2. Replace weak templated atom content, not only the images.
3. Re-run validation and browser QA after regeneration.

data/uploads/atom-previews/*.png: 730
manifest statuses: generated 690, skipped_existing 40
```

## Task 4: Bootstrap, DB, And UI QA

- [x] **Step 1: Trigger app-owned bootstrap through app code**

Run an app query that calls seed and expanded bootstrap indirectly:

```bash
npx tsx -e "import { listAtoms } from './src/lib/db/queries/atoms'; const atoms = await listAtoms(); console.log(atoms.length)"
```

Expected: DB receives missing expanded atoms through app-owned code, not manual SQLite editing.

Verified on 2026-06-07:

```text
npx tsx -e "import { listAtoms } from './src/lib/db/queries/atoms'; ..."
{
  "total": 735,
  "atomPreview": 730,
  "seedPreview": 5,
  "hair": 40,
  "mainPersona": 30,
  "addOnMaterial": 1
}
```

- [x] **Step 2: Run DB integrity checks**

Run:

```bash
sqlite3 data/app.db "select category, count(*) from prompt_atoms group by category order by category;"
sqlite3 data/app.db "select count(*) from prompt_atoms;"
sqlite3 data/app.db "select id, count(*) from prompt_atoms group by id having count(*) > 1;"
```

Expected: main-scope categories match target counts, total app rows are 735 for main scope, and duplicate query returns no rows.

Verified on 2026-06-07:

```text
total: 735
mainTotal: 730
mismatches: []
duplicateIds: []
missingPreviewFilesCount: 0
seedTextChanges: []
expanded_atoms_bootstrapped_v1: sourceCount 700, inserted 660, previewBackfilled 31
```

- [x] **Step 3: Browser QA**

Start dev server:

```bash
npm run dev
```

Browser checks:

1. Desktop: category overview shows main-scope category counts.
2. Desktop: open several high-volume categories and confirm preview images decode with nonzero natural dimensions.
3. Desktop: select atoms across positive categories and Negative Atom remains separate in the compiler.
4. Mobile 390px: category overview and big selector have no horizontal overflow.
5. Mobile 390px: visible preview images decode with nonzero natural dimensions.

Verified on 2026-06-07 against `http://localhost:3000`:

1. Desktop overview loaded 735 app atoms and main counts including `人設 30`, `髮型 40`, `上裝 40`, `場景 20`.
2. Desktop selector opened `髮型`, `上裝`, and `場景`; visible preview images decoded with 1024x1024 natural dimensions.
3. Desktop compiler separation: positive Prompt contained `cozy bedroom corner`; positive Prompt did not contain `extra fingers`; Negative Prompt contained scene negative and Negative Atom fragments.
4. Mobile 390x844 overview had `scrollWidth: 390`, no overflowers, and main counts visible.
5. Mobile 390x844 selector had `scrollWidth: 390`, no overflowers; after scrolling to cards, visible `髮型` preview decoded at 1024x1024.

## Task 5: Final Gates And Docs

- [x] **Step 1: Run full verification**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: all pass fresh after final edits.

Verified on 2026-06-07 after final edits:

```text
npm run lint
exit 0

npm test
Test Files  15 passed (15)
Tests  68 passed (68)

npm run build
Compiled successfully
Finished TypeScript
Generated static pages (9/9)
exit 0
```

- [x] **Step 2: Update source docs**

Update:

1. `docs/superpowers/plans/2026-06-06-prompt-atom-material-library-expansion.md`
2. `docs/superpowers/plans/2026-06-06-gemini-image-batch-generation-production-integration.md`
3. `docs/superpowers/plans/2026-06-06-prompt-atom-system-v2-expansion.md`

Record:

1. Main-scope count evidence.
2. Manifest path and status counts.
3. DB count evidence.
4. Browser QA evidence.
5. Remaining full-v2 add-on status if not executed.

- [x] **Step 3: Completion audit**

Do not mark P4D complete unless the audit proves:

1. Main-scope unique app atoms total 730.
2. Each main-scope approved atom has a local preview file and valid route path.
3. Bootstrap/import is app-owned and idempotent.
4. No user-created atoms or existing seed atom content was deleted.
5. Lint, tests, build, validation, DB checks, and browser QA are fresh pass.

Completion audit on 2026-06-07:

1. Main-scope unique app atoms total 730; app DB total is 735 because 5 full-v2 add-on seed atoms remain outside main scope.
2. Each main-scope atom has `/api/uploads/atom-previews/<atom-id>.png`; manifest validation checked 730 and `data/uploads/atom-previews/*.png` count is 730.
3. Bootstrap/import is app-owned through `listAtoms()` -> `ensureSeedAtoms()` -> `ensureExpandedAtoms()` and is idempotent by stable ID.
4. Existing seed text fields were unchanged; no duplicate IDs; no missing preview files.
5. `npm run lint`, `npm test`, `npm run build`, `npm run validate:atom-previews -- --all-main`, DB checks, and browser QA passed fresh.

## 2026-06-07 Persona Add-On Extension

User-requested add-on after P4D completion:

1. `人設` target expanded from 30 to 80 by adding 50 app-owned persona atoms from the pasted brief.
2. Current main scope is now 31 categories / 780 atoms; app DB total is 785 because the 5 full-v2 add-on seed atoms remain outside main scope.
3. New IDs are `library-persona-addon-01` through `library-persona-addon-50`.
4. Each new persona prompt includes `20-year-old cute Japanese young woman` and adult/non-celebrity constraints; negative prompts exclude underage or childlike appearance.
5. Gemini generated 50 new local previews on 2026-06-07 with 0 failures; manifest `data/uploads/atom-previews/manifest.json` now has 780 entries.
6. `npm run validate:atom-previews -- --all-main` checked 780 and passed; `data/uploads/atom-previews/*.png` count is 780.
7. App-owned bootstrap through `listAtoms()` verified DB total 785, `人設` 80, new persona add-on preview paths 50, duplicate IDs 0, missing preview files 0, seed text changes 0.
8. Browser QA verified overview `目前素材庫共 785 個素材。`, `人設 80`, selector sidebar `人設80`, new cards such as `高定時裝模特`, and visible previews decoded at 1024x1024.
