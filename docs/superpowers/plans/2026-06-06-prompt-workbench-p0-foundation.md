# P0 Plan: Prompt Workbench Foundation

## Objective

Build the runnable foundation for the Prompt 視覺化素材工作台 so the app has a stable Next.js + shadcn/ui shell, local persistence, core data contracts, basic素材 CRUD, current combination state, and Prompt compiler.

This phase should produce a working app skeleton with real local database persistence. It does not need to complete Mimo parsing, Gallery advanced reuse, or generated seed images.

## Source Of Truth

Primary product source:

- `prd.md`

Detailed original product specification:

- `prompt_atom_workbench_spec.md`

Use `prd.md` for current product and technical decisions. Use `prompt_atom_workbench_spec.md` when implementation needs finer behavior details, wording, category meanings, full page flow, or acceptance nuance not repeated in this P0 plan.

This P0 plan is the execution source for foundation work only. Later phases must not reinterpret P0 scope.

## Verified Baseline

Current repository baseline as of 2026-06-06:

1. Repo path: `/Users/ken/Application/PromptG`
2. Existing product docs:
   - `prompt_atom_workbench_spec.md`
   - `prd.md`
3. No Next.js app has been scaffolded yet.
4. No package manager lockfile exists yet.
5. No app source directory, database schema, or shadcn setup exists yet.

Do not treat unverified assumptions about installed Node version, package manager, or shadcn configuration as facts. Verify them before implementation.

## Scope

P0 includes:

1. Initialize a Next.js App Router project in this repository.
2. Add TypeScript, Tailwind CSS, shadcn/ui, and required base dependencies.
3. Add the high-density workbench layout.
4. Create core constants for categories, category selection modes, compile order, size presets, quality presets, and Mimo models.
5. Configure SQLite database at `data/app.db`.
6. Configure uploads directory at `data/uploads/`.
7. Add Drizzle schema for `prompt_atoms`, `gallery_items`, and `app_settings`.
8. Add server-side data access helpers.
9. Implement basic素材 CRUD API.
10. Implement image upload API with file type and size validation.
11. Implement current combination store.
12. Implement Prompt compiler logic and tests.
13. Implement the first usable main workbench screen:
    - top title
    - size selector
    - quality selector
    - 16 category slots
    - Prompt compiler area
    - basic copy/reset actions
14. Add enough UI wiring to manually create atoms and select them into slots, even if the later big image selector is not complete yet.

## Non-Goals

P0 must not implement:

1. 小米 Mimo API calls.
2. Prompt parsing workflow.
3. Generated seed images.
4. Complete Gallery workflows.
5. Production packaging or deployment.
6. User authentication.
7. Cloud sync.
8. Payment, public library, sharing, or social features.
9. AI image generation inside the product.

## Required Technical Decisions

1. Use Next.js App Router with TypeScript.
2. Use shadcn/ui for UI primitives.
3. Use Tailwind CSS.
4. Use Drizzle ORM.
5. Use SQLite at `data/app.db`.
6. Use `data/uploads/` for all uploaded and generated seed images.
7. Use Zustand for client-side current combination state.
8. Use Zod for request and model validation.
9. Keep API keys out of source files and docs.
10. All user-visible product UI must be Traditional Chinese. Internal code, docs, and technical identifiers may be English. Prompt body text may remain English when it represents reusable image Prompt content.

## Suggested File Map

Exact paths may adapt to the generated Next.js structure, but the implementation should preserve these boundaries:

1. `src/app/page.tsx` - main workbench route.
2. `src/app/api/atoms/route.ts` - atoms list/create.
3. `src/app/api/atoms/[id]/route.ts` - atoms update/delete.
4. `src/app/api/uploads/route.ts` - local image upload.
5. `src/components/workbench/` - workbench UI components.
6. `src/components/atoms/` - atom card/forms/selectable atom UI.
7. `src/lib/constants.ts` - categories, presets, compile order.
8. `src/lib/db/schema.ts` - Drizzle schema.
9. `src/lib/db/client.ts` - SQLite client.
10. `src/lib/db/queries/atoms.ts` - atom data access.
11. `src/lib/prompt/compiler.ts` - compile current combination into Prompt.
12. `src/lib/validation/atoms.ts` - Zod schemas.
13. `src/stores/current-combination.ts` - Zustand store.
14. `data/app.db` - local SQLite database, generated at runtime.
15. `data/uploads/` - uploaded or generated images.

## Data Contracts

### Category Constants

The app must define the 16 fixed categories from `prd.md` and use these constants everywhere. Avoid duplicating category strings across components.

### Selection Modes

Single-select categories:

1. 人設
2. 表情
3. 姿態
4. 上裝
5. 下裝
6. 鞋履
7. 場景
8. 寫真風格
9. 光影
10. 鏡頭質感
11. 景別
12. 妝容

Multi-select categories:

1. 畫面影響
2. 版式設計
3. 配飾
4. 道具

### Compile Order

Prompt compiler must use this order:

1. 人設
2. 表情
3. 姿態
4. 景別
5. 上裝
6. 下裝
7. 鞋履
8. 妝容
9. 配飾
10. 道具
11. 場景
12. 光影
13. 寫真風格
14. 鏡頭質感
15. 畫面影響
16. 版式設計
17. 尺寸
18. 質量

### Mimo Models

Even though P0 does not call Mimo, it must define the selectable model constants for later UI:

1. `mimo-v2.5-pro`
2. `mimo-v2.5`
3. `mimo-v2-pro`
4. `mimo-v2-omni`

Default: `mimo-v2.5-pro`.

## UI Requirements

P0 UI should feel like a usable workbench, not a marketing page.

Required:

1. All user-visible UI copy must be Traditional Chinese.
2. First screen shows current combination and Prompt compiler.
3. Use shadcn components for Select, ToggleGroup, Card, Textarea, Button, Badge, Dialog, AlertDialog, DropdownMenu, Empty, Skeleton or Spinner, and sonner where applicable.
4. Use lucide icons if the generated shadcn config uses lucide.
5. Category slots must have stable dimensions and not shift when empty vs selected.
6. Prompt compiler textarea must support auto and custom mode.
7. Copy action must use clipboard API and show toast.
8. Reset action must clear current combination and Prompt state.
9. Empty atom preview must clearly show `尚無預覽圖`.

## P0 Tasks

1. Inspect local Node/package-manager availability.
2. Scaffold Next.js App Router with TypeScript in-place without deleting existing docs.
3. Initialize shadcn/ui.
4. Add required shadcn components.
5. Add Drizzle + SQLite dependencies.
6. Add `.gitignore` entries for:
   - `.env.local`
   - `data/app.db`
   - SQLite journal/wal/shm files
   - optionally generated cache files
7. Keep `data/uploads/` trackable through a `.gitkeep` if needed, but do not commit user-uploaded binaries unless they are explicit seed assets in P1.
8. Implement schema and migration/bootstrap flow.
9. Implement atom validation schemas.
10. Implement atom API routes.
11. Implement upload API with:
    - allowed image MIME types
    - max file size
    - generated safe filename
    - relative path response
12. Implement current combination Zustand store.
13. Implement Prompt compiler and unit tests.
14. Implement main workbench layout.
15. Implement simple atom create/edit dialog.
16. Implement basic atom list or selector sufficient to select atoms into slots.
17. Verify single vs multi category selection behavior in state.
18. Run lint/build/test commands that exist or add minimal test tooling if absent.
19. Update this plan status checklist.

## Acceptance Checks

P0 is complete only when:

1. App starts locally with a documented command.
2. `data/app.db` is created or usable by the app.
3. `data/uploads/` exists.
4. A Prompt atom can be created, edited, deleted, and listed.
5. An uploaded image can be saved under `data/uploads/` and displayed by the app.
6. The main workbench displays all 16 category slots.
7. Single-select categories replace previous same-category selection.
8. Multi-select categories retain multiple selections.
9. Prompt compiler outputs text in the required order.
10. Auto/custom mode behavior is implemented.
11. Copy Prompt shows a success toast.
12. Reset clears current combination.
13. API key strings are not committed.
14. User-visible UI text is Traditional Chinese.
15. Fresh verification commands pass, or failures are documented with exact errors.

## Verification Commands

Use the actual package manager detected during setup. Expected commands:

```bash
npm run lint
npm run build
npm test
```

If a command does not exist, either add the missing script when appropriate or document why it is not part of P0.

Also run a secret scan check:

```bash
rg -n "tp-sh|XIAOMI_MIMO_API_KEY=.*[A-Za-z0-9]{12,}" .
```

This command must not reveal a real API key.

## Risks

1. shadcn component APIs may differ based on generated base config. Use `npx shadcn@latest info` and docs before composing complex components.
2. Next.js API routes may not serve local uploads by default. Implement a deliberate serving path or static route for `data/uploads/`.
3. SQLite setup can differ between local dev and deployment. P0 only targets local-first development.
4. Current combination should remain UI state; do not prematurely persist it to DB unless needed for Gallery snapshots.

## Blocker Rules

If the same scaffold, package installation, SQLite binding, or shadcn setup error repeats 3 times, stop and write a blocker report with:

1. command attempted
2. exact error summary
3. files changed
4. suspected cause
5. safest next option

Do not keep rewriting unrelated code to work around tooling failures.

## Status Checklist

- [x] Project scaffold verified
- [x] shadcn initialized
- [x] Database schema implemented
- [x] Atom CRUD implemented
- [x] Upload API implemented
- [x] Workbench layout implemented
- [x] Current combination store implemented
- [x] Prompt compiler implemented
- [x] Verification run
- [x] This plan updated with final status

## P0 Implementation Status

Updated: 2026-06-06

Implemented:

1. Next.js App Router + TypeScript + Tailwind CSS project initialized in place without deleting existing product docs.
2. shadcn/ui initialized with Base UI / nova config; P0 UI uses Select, ToggleGroup, Card, Textarea, Button, Badge, Dialog, AlertDialog, DropdownMenu, Empty, Skeleton, Spinner, and sonner.
3. Core constants implemented in `src/lib/constants.ts`:
   - 16 fixed categories
   - single-select and multi-select category modes
   - PRD compile order
   - size presets
   - quality presets
   - Mimo model list and default model
4. Drizzle + SQLite implemented with database fixed at `data/app.db`.
5. Local upload path fixed at `data/uploads/`; `.gitkeep` preserves the directory.
6. Drizzle schema implemented for `prompt_atoms`, `gallery_items`, and `app_settings`.
7. Basic atom data access implemented in `src/lib/db/queries/atoms.ts`.
8. Atom CRUD API implemented:
   - `GET /api/atoms`
   - `POST /api/atoms`
   - `PATCH /api/atoms/[id]`
   - `DELETE /api/atoms/[id]`
9. Image upload API implemented:
   - `POST /api/uploads`
   - `GET /api/uploads/[filename]` for local preview display
   - allowed MIME types: JPG, PNG, WebP, GIF
   - max file size: 5MB
10. Zod validation implemented for create, update, and atom search requests.
11. Zustand current combination store implemented with single-select replacement and multi-select accumulation.
12. Prompt compiler implemented and covered by tests for PRD order plus size/quality output.
13. Main page implemented as a usable workbench, not a landing page:
   - Traditional Chinese UI
   - 16 category slots
   - size selector
   - quality selector
   - Prompt compiler
   - auto/custom mode
   - copy and reset
   - atom create/edit dialog
   - atom list/selector sufficient for P0 selection
14. `.gitignore` covers `.env.local`, local DB files, SQLite WAL/SHM/journal, and uploaded binaries while retaining `data/uploads/.gitkeep`.

Deferred by P0 scope:

1. Mimo API calls.
2. Prompt parsing.
3. Complete Gallery workflows.
4. Generated seed images.
5. Deployment, login, cloud sync, public library, and image generation.

## Actual Verification Results

Environment:

1. Node: `v24.16.0`
2. npm: `11.13.0`
3. Local app command: `npm run dev -- --port 3000`
4. Local app URL verified: `http://localhost:3000`

Fresh command results:

1. `npm run lint` passed.
2. `npm test` passed: 3 test files, 4 tests.
3. `npm run build` passed.
4. Secret scan command was run. Matches were only self-referential command text in README/plan docs; no real API key was revealed.

Functional checks performed:

1. `POST /api/uploads` saved a PNG under `data/uploads/` and returned `/api/uploads/<uuid>.png`.
2. `POST /api/atoms` created a Prompt atom with uploaded preview path.
3. `PATCH /api/atoms/[id]` updated the atom without wiping omitted fields; this was regression-tested after an initial bug was found.
4. `GET /api/atoms?category=人設&q=更新` listed the updated atom.
5. `DELETE /api/atoms/[id]` deleted the verification atom.
6. Browser verification confirmed the main workbench renders all 16 category slots.
7. Browser verification confirmed the uploaded image was displayed via `/api/uploads/...`.
8. Browser verification confirmed selecting an atom updates the 人設 slot and auto Prompt output.
9. Browser verification confirmed custom mode is not overwritten by subsequent atom selection.
10. Browser verification confirmed copy writes the current Prompt to clipboard.
11. Browser verification confirmed reset clears the current combination and returns to default size/quality Prompt.
12. Mobile viewport check at 390x844 confirmed no horizontal overflow after fixing the category toggle row.

## P1 Prerequisite Re-Verification

Updated: 2026-06-06

Before P1 implementation, P0 was re-verified in the current repository state:

1. `npm test` passed: 3 test files, 4 tests at the P1 start baseline.
2. `npm run lint` passed.
3. `npm run build` passed with Next.js 16.2.7.
4. P0 database path remained `data/app.db`.
5. P0 upload path remained `data/uploads/`.
6. No P0 blocker required architecture rework for P1.

## P2 Re-Verification

Updated: 2026-06-06 17:14 HKT

P0 foundation was re-verified during P2 hardening:

1. `data/app.db` exists and persisted atom/Gallery records across dev server restart.
2. `data/uploads/` served a newly uploaded PNG across dev server restart.
3. `data/uploads/seed/` served seed PNG files successfully.
4. Atom create/list/delete API paths were used for temporary P2 workflow records and cleanup.
5. Upload API accepted an image upload and rejected a `text/plain` file with a Traditional Chinese error.
6. Browser/CDP confirmed all 16 category slots render and the app has no horizontal overflow at 1440x900, 1280x800, and 390x844.
7. Next.js 16 local dev origin behavior was hardened with `allowedDevOrigins: ["127.0.0.1"]`.
