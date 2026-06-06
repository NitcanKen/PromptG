# Gemini Image Batch Generation Production Integration Plan

Updated: 2026-06-06 21:05 HKT

## 1. Objective

Make the expanded Prompt Atom library production-ready inside the PromptG app by generating and wiring one preview image per atom with Google Gemini API Nano Banana 2.

This is no longer a detached image experiment. It must integrate with:

1. `docs/superpowers/plans/2026-06-06-prompt-atom-material-library-expansion.md`
2. `docs/material-library/subject-hair-atoms.md`
3. the app's local image storage under `data/uploads/`
4. the atom records consumed by the app
5. the preview image routes used by the UI

Final target:

1. Every approved prompt atom has a stable local preview image.
2. Every generated preview image is stored locally and served by the app.
3. The app can bootstrap/import expanded atoms with their generated `previewImagePath`.
4. Generation can resume safely without regenerating completed images.
5. The final app passes lint, tests, build, data integrity checks, and browser QA.

## 2. Source Documents

This plan is the production image integration layer for the material library work.

Single source-of-truth stack:

1. Material target and category counts:
   `docs/superpowers/plans/2026-06-06-prompt-atom-material-library-expansion.md`
2. First approved material shard:
   `docs/material-library/subject-hair-atoms.md`
3. Production image integration:
   `docs/superpowers/plans/2026-06-06-gemini-image-batch-generation-production-integration.md`

These documents must move together. If atom counts, shard structure, image storage paths, or provider behavior change, update this plan and the material expansion plan in the same work.

## 3. Verified Baseline

Verified in `/Users/ken/Application/PromptG` on 2026-06-06:

1. `package.json` uses Next.js `16.2.7`, React `19.2.4`, Vitest, Drizzle, and SQLite.
2. Current app data lives in `data/app.db`.
3. Current uploaded images live in `data/uploads/`.
4. Current seed images live in `data/uploads/seed/`.
5. `src/app/api/uploads/[filename]/route.ts` serves only flat UUID-like uploaded files.
6. `src/app/api/uploads/seed/[filename]/route.ts` serves seed files from `data/uploads/seed/`.
7. Existing `ensureSeedAtoms()` inserts missing seed atoms by stable ID but skips existing atoms.
8. `docs/material-library/subject-hair-atoms.md` currently has exactly 40 `髮型` atom rows.
9. `docs/superpowers/plans/2026-06-06-prompt-atom-material-library-expansion.md` currently targets:
   - 730 final atoms across the main 31 categories.
   - 840 final atoms across the full 36-category v2 library.

Official Gemini docs verified on 2026-06-06:

1. Nano Banana 2 is `gemini-3.1-flash-image`.
2. Gemini image generation supports Python and JavaScript SDK flows through `generate_content` / `generateContent`.
3. Generated image data is returned as inline image data.
4. Response modalities can be configured for image output.
5. Gemini generated images include SynthID watermarking.
6. SDK clients can read `GEMINI_API_KEY` or `GOOGLE_API_KEY` from environment variables.

Official docs:

1. `https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-tw#python`
2. `https://ai.google.dev/gemini-api/docs/api-key?hl=zh-tw`

## 4. Security And Secret Handling

The Gemini API key must never be committed to the repository.

Rules:

1. Use `GEMINI_API_KEY` or `GOOGLE_API_KEY`.
2. `.env.local` may contain the key locally but must not be committed.
3. `.env.example` should document the variable names only.
4. Scripts must fail fast with a Traditional Chinese error if no key is configured.
5. Logs must never print the key or request headers.
6. Because an API key was pasted into chat, rotate or restrict that key before production batch generation if possible.
7. Restrict the key to Generative Language API in Google Cloud / AI Studio when feasible.

## 5. Provider And Rate Limit Policy

Provider:

1. Model: `gemini-3.1-flash-image`
2. Product name: Nano Banana 2 / Gemini 3.1 Flash Image
3. Use case: offline/batch preview image generation for local PromptG atom cards

User-provided limits:

1. RPM: 100
2. TPM: 200K
3. RPD: 1K

Operational limits for this project:

1. Target at most 60-80 requests per minute, not the full 100 RPM.
2. Use concurrency 4-6 by default.
3. Use exponential backoff for `429`, `500`, `502`, `503`, and network failures.
4. Stop after 3 consecutive failures for the same atom and record it in the manifest.
5. Stop the whole run before 950 requests in one day to leave room for retries and manual checks.
6. Write a resumable manifest after every atom attempt.

The 840-image full v2 target should fit under the daily request limit if most images succeed on first attempt. Still, the generator must support resume because retries and provider throttling are expected.

## 6. Visual Style Policy

Default image style:

1. Eastern aesthetic by default.
2. Adult, non-celebrity, non-branded, non-IP generic subjects.
3. Clean but natural photographic reference image.
4. Soft contemporary East Asian styling, unless the atom explicitly describes Western, European, American, non-Eastern, or non-human content.
5. No visible brand logos.
6. No text unless the atom category is explicitly `文本元素`, `版式設計`, or `平台媒介`.
7. No celebrity likeness.
8. No sexualized minor-coded subject.
9. Avoid turning every image into the same person, outfit, pose, or bedroom selfie.

Base prompt wrapper:

```text
Create a square 1:1 reference image for a PromptG prompt atom library card.
The image should clearly visualize this single atom concept:
Category: <category>
Title: <title>
Description: <subtitle>
Prompt fragment: <prompt>

Use an Eastern aesthetic by default: contemporary East Asian photography, natural styling, refined everyday visual taste.
If the atom explicitly describes Western, European, American, non-Eastern, or non-human content, follow the atom instead.
Keep the image focused on this atom only. Do not overbuild a full scene unless the category is a scene, platform, layout, or post-processing category.
Use a generic adult subject when a person is needed.
No celebrity likeness, no brand logo, no copyrighted character, no extra text, no watermark-like text.
Clean composition, visually readable at small card size.
```

Category-specific prompt additions:

1. `髮型`: close portrait or upper-body crop focused on hair shape. Keep outfit and background neutral.
2. `上裝`, `下裝`, `鞋履`: fashion catalog or lifestyle crop focused on the garment item.
3. `配飾`, `道具`: object or partial-person composition focused on the accessory/prop.
4. `場景`, `場景細節`: location/detail-first frame; use a person only if useful for scale.
5. `光影`, `色彩系統`, `寫真風格`: visual-treatment-first frame.
6. `鏡頭角度`, `鏡頭質感`, `景別`, `構圖規則`: camera/framing demonstration.
7. `Negative Atom`: generate a clean "avoidance reference" cautiously or use a neutral symbolic visual; never intentionally create grotesque failed anatomy if it degrades the asset library.
8. `尺寸`, `質量`: use abstract but useful output reference cards only if these categories remain in the image target.

## 7. Storage And Serving Design

Recommended local storage:

```text
data/uploads/atom-previews/<atom-id>.png
data/uploads/atom-previews/manifest.json
data/uploads/atom-previews/logs/<run-id>.jsonl
```

Recommended app route:

```text
/api/uploads/atom-previews/[filename]
```

Route rules:

1. Serve only `jpg`, `jpeg`, `png`, and `webp`.
2. Accept filenames matching stable atom IDs: `[a-z0-9-]+.(png|jpg|jpeg|webp)`.
3. Read only from `data/uploads/atom-previews/`.
4. Prevent path traversal.
5. Set immutable cache headers for generated immutable files.

Atom preview path:

```text
/api/uploads/atom-previews/<atom-id>.png
```

Do not store generated images in `data/uploads/seed/`. Existing seed images should remain as historical seed assets. Expanded/generated previews need their own namespace.

## 8. Data Integration Design

The app needs a canonical expanded atom data source after text approval.

Recommended source files:

1. `src/lib/seed/seed-atoms.ts`: keep current 36 seed atoms.
2. `src/lib/seed/expanded-atoms.ts`: approved expanded atoms from markdown shards.
3. `src/lib/seed/expanded-atom-images.ts`: optional generated image manifest mapping atom ID to preview path, or generate this from manifest during import.

Bootstrap behavior:

1. Add an idempotent `ensureExpandedAtoms()` flow.
2. Insert missing expanded atoms by stable ID.
3. Do not delete user-created atoms.
4. Do not overwrite user-edited atom prompt/title/tags by default.
5. For app-owned expanded atoms, allow preview-image backfill when:
   - the atom ID exists,
   - the generated image file exists,
   - the current `previewImagePath` is empty or points to an older generated path.
6. Record bootstrap state in `app_settings`, for example `expanded_atoms_bootstrapped_v1`.

This avoids the current seed bootstrap limitation where existing rows are skipped and preview paths cannot be backfilled.

## 9. Batch Generator Design

Recommended implementation language:

1. Prefer Node/TypeScript because the app is already a Next.js/TypeScript project.
2. Use the official `@google/genai` package if it supports the required API shape in this project environment.
3. Python is acceptable only if the repository adds a clear local script dependency path and docs, but avoid adding a second runtime unless Node SDK is blocked.

Recommended script paths:

```text
scripts/gemini-generate-atom-previews.ts
scripts/validate-atom-previews.ts
```

Generator responsibilities:

1. Load approved atoms from structured source or parsed markdown shards.
2. Select target scope:
   - `--category 髮型`
   - `--ids <id1,id2>`
   - `--all-main`
   - `--all-v2`
3. Skip atoms with existing output image unless `--force`.
4. Build provider prompt using the shared style policy.
5. Call `gemini-3.1-flash-image`.
6. Save the first valid image part to `data/uploads/atom-previews/<atom-id>.png`.
7. Record status, attempts, provider text, errors, created path, file size, and timestamp in `manifest.json` and JSONL logs.
8. Keep request logs free of secrets.
9. Support `--dry-run` to print planned prompts and counts without calling the API.
10. Support `--limit` for small proof-of-concept runs.

Validation script responsibilities:

1. Confirm every target atom has a matching local image file.
2. Confirm every image is non-empty and decodable.
3. Confirm every `previewImagePath` points to a route that should serve the local file.
4. Confirm manifest status matches filesystem state.
5. Confirm no generated image file exceeds the app's accepted upload size expectation unless serving route allows it.

## 10. Implementation Phases

### Phase A: Planning And Contracts

1. Approve this plan.
2. Update material expansion plan to reference Gemini production image integration.
3. Update `subject-hair-atoms.md` image policy so each hair atom is expected to receive a generated preview.
4. Decide whether first production target is `髮型 40` or the full 730/840 library.

### Phase B: Data Source Integration

1. Convert `docs/material-library/subject-hair-atoms.md` into structured app-owned atom data.
2. Add tests that assert 40 hair atoms exist in the structured source.
3. Preserve current seed atom IDs and existing user data.
4. Ensure structured data keeps Traditional Chinese UI fields.

### Phase C: Gemini Batch Generator

1. Add Gemini SDK dependency or a contained REST client.
2. Implement dry-run mode.
3. Implement rate-limited generation.
4. Implement resume manifest.
5. Implement failure tracking and backoff.
6. Verify with a tiny run, such as 1-3 hair atoms.

### Phase D: App Image Serving And Bootstrap

1. Add `/api/uploads/atom-previews/[filename]`.
2. Add tests for valid and invalid preview filenames.
3. Add `ensureExpandedAtoms()` or equivalent app-owned expanded atom bootstrap.
4. Backfill generated `previewImagePath` into app-owned expanded atom rows.
5. Confirm no destructive DB behavior.

### Phase E: Hair 40 Production Slice

1. Generate all 40 `髮型` preview images.
2. Validate all 40 files.
3. Import/bootstrap all 40 hair atoms into `data/app.db`.
4. Confirm the app shows 40 hair atoms with loaded previews.
5. Run lint, tests, build, and browser QA.

### Phase F: Full Library Scale-Up

1. Expand remaining text shards according to the material expansion plan.
2. Generate previews for the approved atoms in batches.
3. Keep each batch under operational rate limits.
4. Validate each category before proceeding to the next.
5. Finish with full production readiness verification.

## 11. Verification Commands

Required before claiming completion:

```bash
npm run lint
npm test
npm run build
```

Recommended data checks:

```bash
sqlite3 data/app.db "select category, count(*) from prompt_atoms group by category order by category;"
find data/uploads/atom-previews -type f -name '*.png' | wc -l
```

Recommended route checks:

```bash
curl -I http://localhost:3000/api/uploads/atom-previews/library-hair-curtain-bangs.png
curl -I http://localhost:3000/api/uploads/atom-previews/../../../bad.png
```

Recommended generator checks:

```bash
npm run generate:atom-previews -- --dry-run --category 髮型 --limit 3
npm run validate:atom-previews -- --category 髮型
```

Script names may differ after implementation, but equivalent checks must exist and be documented.

Browser QA:

1. Start the app.
2. Open the workbench.
3. Filter/select `髮型`.
4. Confirm 40 hair atoms are visible.
5. Confirm all visible preview images load with nonzero natural dimensions.
6. Select multiple relevant atoms across categories and confirm compiled prompt still works.
7. Check desktop and mobile widths for no broken image layout.

## 12. Non-Goals

1. Do not add runtime image generation to the user-facing app UI.
2. Do not expose the Gemini API key to the browser.
3. Do not use web-scraped or stock images.
4. Do not replace existing user-created atoms.
5. Do not generate celebrity, copyrighted-character, brand-logo, or explicit minor-coded imagery.
6. Do not manually edit SQLite as the canonical content source.

## 13. Risks And Mitigations

1. Provider returns text but no image.
   - Record failed status, retry with backoff, then mark blocker for that atom after 3 attempts.

2. Provider rate-limits generation.
   - Lower concurrency, resume later, keep manifest current.

3. Images become visually repetitive.
   - Use category-specific wrappers and vary neutral scene/background by category.

4. Eastern aesthetic over-applies to non-Eastern atoms.
   - The wrapper explicitly lets atom content override default aesthetics.

5. Existing routes cannot serve nested preview paths.
   - Add a dedicated `atom-previews` route.

6. Existing bootstrap skips existing rows and cannot backfill images.
   - Add expanded atom bootstrap with app-owned preview backfill rules.

7. Daily request limit is exhausted before full 840 target.
   - Stop before configured daily cap and resume the next day.

## 14. Current Status Checklist

- [x] Current app baseline inspected.
- [x] Gemini image generation docs inspected.
- [x] Material expansion plan exists.
- [x] `髮型` 40-atom shard exists.
- [x] This Gemini production integration plan approved as the P4 source of truth.
- [x] Material expansion plan updated to reference Gemini production image integration.
- [x] Hair shard image policy updated for generated previews.
- [x] P4A structured `髮型` source added at `src/lib/seed/expanded-atoms.ts`.
- [x] P4A tests added for 40 hair atoms, stable IDs, `髮型` category, validation, and Traditional Chinese visible metadata.
- [x] P4A app-owned expanded atom bootstrap/backfill contract added through `ensureExpandedAtoms()`.
- [x] P4A app integration path added by running expanded bootstrap from atom listing after seed bootstrap.
- [x] P4B generator proof-of-concept implemented at `scripts/gemini-generate-atom-previews.ts`.
- [x] P4B generator supports `--dry-run`, `--category`, `--ids`, `--limit`, `--force`, explicit output directory, concurrency, and RPM options.
- [x] P4B prompt wrapper implemented with default Eastern aesthetic, generic adult subject, no celebrity, no brand, no IP, and hair-specific framing.
- [x] P4B REST Gemini client contract implemented for `gemini-3.1-flash-image`, with `GEMINI_API_KEY` / `GOOGLE_API_KEY` lookup and `.env.local` support.
- [x] P4B dry-run verified without provider call or manifest write.
- [x] P4B manifest, JSONL log, skip-existing, retry/backoff, and secret-safe logging behavior covered by tests.
- [x] P4B preview serving route implemented at `/api/uploads/atom-previews/[filename]`.
- [x] P4B route validation tests cover valid files, missing files, path traversal, and unsupported filenames.
- [x] P4C generated preview manifest/import wired into the expanded atom backfill path.
- [x] P4C generated 40 local `髮型` preview PNGs under `data/uploads/atom-previews/` and validated manifest/files.
- [x] P4C app verified with generated previews at desktop and 390px mobile viewport.
- [ ] Full 730/840 image target completed and verified.

## 15. Approval Gate

After this document is reviewed and approved, generate `/goal` prompts in phases:

1. P4A: Contract and source-doc integration. Status: complete in code/docs for `髮型` 40 structured data and app-owned bootstrap contract; no Gemini image generation performed.
2. P4B: Gemini generator proof-of-concept. Status: complete for dry-run, scoped generation options, REST provider contract, manifest/resume basics, rate limit, retry/backoff, no-secret logging, and atom-preview route; no real Gemini image generation performed.
3. P4C: App preview route and hair 40 production image slice. Status: complete on 2026-06-06 for generated file validation, manifest-backed preview backfill, all 40 hair preview generation, app bootstrap import, and browser QA with loaded previews.
4. P4D: Full material library scale-up. Remaining: approved shards for the rest of the 730 main / 840 full v2 targets, batch generation, category validation, and final production readiness.

Do not generate final `/goal` prompts before this source-of-truth document is approved.
