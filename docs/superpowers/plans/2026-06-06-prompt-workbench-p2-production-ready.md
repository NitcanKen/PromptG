# P2 Plan: Prompt Workbench Production Ready Hardening

## Objective

Turn the functionally complete Prompt 視覺化素材工作台 into a production-ready local-first app: reliable, secure with secrets, visually polished, tested across critical workflows, and safe to use daily without data loss.

P2 is not for adding broad new product features. It is for hardening, verification, edge cases, accessibility, visual QA, and final documentation.

## Source Of Truth

Primary product source:

- `prd.md`

Detailed original product specification:

- `prompt_atom_workbench_spec.md`

Use `prd.md` for current product and technical decisions. Use `prompt_atom_workbench_spec.md` to verify full original behavior, detailed UX requirements, category definitions, non-goals, and final product judgment standards during hardening.

Required prerequisites:

- `docs/superpowers/plans/2026-06-06-prompt-workbench-p0-foundation.md`
- `docs/superpowers/plans/2026-06-06-prompt-workbench-p1-full-functionality.md`

P2 must work from verified P0/P1 status, not assumptions.

## Verified Baseline

Before starting P2, verify and record:

1. P0 status checklist.
2. P1 status checklist.
3. Current `npm run build` status.
4. Current `npm run lint` status.
5. Current test status.
6. Current local app URL.
7. Existing seed atom count.
8. Existing seed image count.
9. Whether Mimo API key is configured locally.

Do not claim production ready until fresh verification has been run in this phase.

## Scope

P2 includes:

1. End-to-end workflow verification.
2. Error handling hardening.
3. Secret safety verification.
4. Database persistence checks.
5. Upload path and image display hardening.
6. Empty, loading, error, and success states.
7. Accessibility checks for dialogs, forms, keyboard navigation, and destructive actions.
8. Responsive UI QA for desktop and mobile widths.
9. Visual polish for high-density shadcn workbench UI.
10. Test coverage for core pure logic and critical API validation.
11. Browser verification with screenshots where possible.
12. Documentation for setup, environment variables, local data, and backup.
13. Final status update across P0/P1/P2 plan docs.

## Non-Goals

P2 must not introduce:

1. Cloud sync.
2. Authentication.
3. Public sharing.
4. Payment.
5. AI image generation inside the app product surface.
6. New Prompt categories beyond the fixed 16.
7. Major framework migration.
8. Broad visual redesign that breaks P1 workflows.

## Production Ready Definition

The app is production ready for personal local use when:

1. It can be installed and run from a clean checkout using documented steps.
2. It does not expose or commit API keys.
3. It persists atoms, Gallery items, settings, and local images across restarts.
4. It handles missing Mimo key gracefully.
5. It handles Mimo errors gracefully.
6. It handles invalid uploaded files safely.
7. It prevents accidental destructive actions through confirmation.
8. It has working seed data and generated seed images.
9. It passes build/lint/test, or any remaining failure is explicitly accepted and documented as non-blocking.
10. Its primary UI workflows are manually verified in browser.
11. All user-visible product text is Traditional Chinese.

## Critical Workflows To Verify

### Workflow A: Atom Creation And Selection

1. Create an atom with image.
2. Confirm image appears in selector.
3. Select it into a single-select category.
4. Select another atom in same category and confirm replacement.
5. Select multiple atoms in a multi-select category.
6. Remove selected atom from current combination.
7. Confirm Prompt compiler updates.

### Workflow B: Prompt Compiler

1. Select atoms across multiple categories.
2. Confirm compile order matches PRD.
3. Switch to custom mode.
4. Edit Prompt manually.
5. Change selected atom and confirm custom text is not overwritten.
6. Switch back to auto mode and confirm regenerated Prompt.
7. Copy Prompt and confirm toast.
8. Reset and confirm empty state.

### Workflow C: Gallery

1. Save current Prompt to Gallery with preview image.
2. Search Gallery by title.
3. Filter by tag.
4. Sort by latest created and title.
5. Open detail Dialog.
6. Copy Prompt.
7. Edit Gallery item.
8. Apply Gallery item with snapshot to current combination.
9. Delete Gallery item with confirmation.

### Workflow D: Mimo Prompt Parsing

1. Open paste Prompt import.
2. Select each Mimo model at least once if API access allows.
3. Submit a realistic image Prompt.
4. Confirm parsed items appear as editable drafts.
5. Edit category/title/prompt/tags.
6. Remove an unwanted draft.
7. Save one draft.
8. Batch save selected drafts.
9. Confirm saved atoms appear in selector.
10. Confirm no parsed atom is saved before explicit user action.

### Workflow E: Missing Or Invalid Mimo Configuration

1. Temporarily unset API key.
2. Submit parse request.
3. Confirm readable error.
4. Confirm source Prompt remains in the input.
5. Restore API key.

### Workflow F: Seed Data

1. Start with empty DB if safe.
2. Run seed/bootstrap.
3. Confirm at least 16 seed atoms.
4. Confirm at least 16 seed image files under `data/uploads/seed/`.
5. Confirm seed insertion is idempotent.
6. Confirm seed cards show real generated images, not blank placeholders.

## Security And Secret Requirements

1. `.env.local` must be ignored by Git.
2. Real Mimo API key must not appear in source files, docs, test snapshots, terminal output committed to files, or frontend bundles.
3. Client components must not import server-only Mimo code.
4. API route must validate requested model against allowed model constants.
5. Upload API must reject non-image files.
6. Upload API must enforce max file size.
7. Delete APIs must validate IDs and handle missing records gracefully.

Secret scan command:

```bash
rg -n "tp-sh|XIAOMI_MIMO_API_KEY=.*[A-Za-z0-9]{12,}|sk-[A-Za-z0-9]" .
```

This must not reveal real secrets.

## UI And Accessibility QA

Check:

1. All user-visible UI copy is Traditional Chinese.
2. Dialogs have accessible titles.
3. Destructive delete flows use confirmation dialogs.
4. Inputs have labels or accessible names.
5. Keyboard focus is not trapped incorrectly.
6. Buttons with icons have understandable labels or tooltips.
7. Text does not overlap at desktop or mobile widths.
8. Category slots have stable dimensions.
9. Card selected state is visible without relying only on color.
10. Empty states are informative.
11. Loading states are not blank screens.

Target viewport checks:

1. Desktop: 1440 x 900
2. Small laptop: 1280 x 800
3. Mobile: 390 x 844

## Testing Requirements

At minimum, add or verify tests for:

1. Prompt compiler order.
2. Single-select replacement.
3. Multi-select accumulation/removal.
4. Atom validation schema.
5. Gallery snapshot fallback behavior.
6. Mimo parser output schema validation.
7. Upload validation utility if factored.

If Playwright is added, cover at least:

1. main workbench renders
2. atom creation
3. Prompt copy/reset
4. Gallery save/open

Do not add brittle full-app tests for every visual detail if they slow the project significantly.

## Documentation Requirements

Create or update:

1. `README.md`
2. `.env.example`
3. optional `docs/local-data.md`

README must include:

1. project purpose
2. install command
3. dev command
4. build command
5. test command
6. env vars
7. local data paths:
   - `data/app.db`
   - `data/uploads/`
8. backup note for local data
9. note that the app does not generate images
10. note that seed images were generated assets for preview only

`.env.example` must include placeholders only:

```bash
XIAOMI_MIMO_API_KEY=
XIAOMI_MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1
XIAOMI_MIMO_MODEL=mimo-v2.5-pro
```

## P2 Tasks

1. Verify P0 and P1 status from plan docs and actual app.
2. Run fresh build/lint/test.
3. Fix blocking build/lint/test failures.
4. Add or complete core tests.
5. Verify all critical workflows A-F.
6. Harden Mimo error handling.
7. Harden upload validation and file serving.
8. Verify DB persistence across server restart.
9. Verify seed idempotency.
10. Run secret scan.
11. Perform browser responsive QA.
12. Fix visible overlap, broken layout, missing labels, or inaccessible dialogs.
13. Add setup and data documentation.
14. Update P0/P1/P2 status checklists.
15. Produce final production readiness report.

## Acceptance Checks

P2 is complete only when:

1. `npm run build` passes.
2. `npm run lint` passes or any lint blocker is documented with exact cause and accepted scope.
3. Tests pass.
4. Secret scan shows no real keys.
5. Critical workflows A-F are verified.
6. Seed images and seed atoms are verified.
7. Mimo missing-key error is verified.
8. UI checked at desktop and mobile viewport.
9. A UI copy audit confirms product-facing text is Traditional Chinese.
10. README and `.env.example` exist and are accurate.
11. All three plan docs have updated status.
12. Final report states what is complete, what was verified, and any residual risk.

## Verification Commands

Use the package manager established by the repo.

Expected:

```bash
npm run lint
npm run build
npm test
```

Secret scan:

```bash
rg -n "tp-sh|XIAOMI_MIMO_API_KEY=.*[A-Za-z0-9]{12,}|sk-[A-Za-z0-9]" .
```

Seed check:

```bash
find data/uploads/seed -type f | wc -l
```

Database file check:

```bash
ls -lh data/app.db
```

## Blocker Rules

If the same build, test, browser, Mimo, upload, or data persistence blocker repeats 3 times, stop and write a blocker report with:

1. exact failing step
2. exact command or workflow
3. error summary
4. screenshots or logs when useful and safe
5. files already changed
6. remaining risk
7. next recommended action

Do not claim production ready with unresolved critical workflow failures.

## Status Checklist

- [ ] P0 actual status verified
- [ ] P1 actual status verified
- [ ] Build passes
- [ ] Lint passes or accepted blocker documented
- [ ] Tests pass
- [ ] Secret scan passes
- [ ] Critical workflows A-F verified
- [ ] Responsive UI verified
- [ ] Traditional Chinese UI copy verified
- [ ] Accessibility basics verified
- [ ] README complete
- [ ] `.env.example` complete
- [ ] Final production readiness report written
