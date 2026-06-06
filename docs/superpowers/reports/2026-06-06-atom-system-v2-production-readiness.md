# Atom System v2 Production Readiness Report

Updated: 2026-06-06 18:42 HKT

## Status

Atom System v2 is production ready for the scoped local-first PromptG workbench after P3D seed expansion, Mimo parser v2 hardening, bootstrap QA, and desktop/mobile UI QA.

This report does not claim public sharing, cloud sync, login, payment, runtime image generation, or live Mimo API verification in P3D.

## Completed Scope

1. Category metadata remains the single source of truth for all 36 v2 categories.
2. `CATEGORIES`, selection modes, compile order, grouped UI helpers, parser allowed categories, and validation are derived from shared constants.
3. Mimo parser system prompt now instructs fine-grained atom splitting and explicitly prevents mixing hair, face features, expression, eye direction, pose, and hand gestures back into broad `人設` / `姿態` atoms.
4. Parser instructions include `Negative Atom` and the explicit-only rule for `尺寸` / `質量`.
5. Parser tests cover missing-key graceful behavior, metadata-derived system prompt, and mocked Mimo output containing v2 categories plus `Negative Atom`.
6. Seed atoms expanded from 16 to 36 total atoms, covering every v2 category exactly through the shared taxonomy.
7. New seed metadata is Traditional Chinese; prompt bodies remain directly usable Prompt fragments.
8. Seed preview paths all point to existing local files under `data/uploads/seed/`.
9. Seed bootstrap now backfills missing seed IDs even when the old `seed_atoms_bootstrapped_v1` marker exists, and remains idempotent.
10. Existing 16-category seed atoms remain present and category-label compatible.
11. Legacy Gallery snapshots without priority metadata continue to normalize to `medium` / `normal`.

## Verification

Commands and checks run in `/Users/ken/Application/PromptG`:

1. `npm test` passed: 10 test files, 37 tests.
2. `npm run lint` passed.
3. `npm run build` passed on Next.js 16.2.7.
4. Runtime seed bootstrap smoke:
   - before API bootstrap: 16 seed rows / 16 distinct IDs.
   - after two `/api/atoms` calls: 36 seed rows / 36 distinct IDs / 36 categories / no duplicate IDs.
   - `app_settings` contains both the legacy `seed_atoms_bootstrapped_v1` marker and the new `seed_atoms_bootstrapped_v2` marker.
5. Browser QA against `http://localhost:3000`:
   - desktop 1280px: page identity correct, no framework overlay, grouped category UI visible, v2 categories visible, selector search works.
   - desktop interaction: selected `空氣瀏海` seed atom; current combination and compiler Prompt / Negative Prompt updated.
   - atom form: grouped category picker plus `Prompt 強度` and `覆蓋策略` controls visible.
   - mobile 390x844: no horizontal overflow on main workbench or big selector; grouped category navigation, search, and v2 categories remain usable.
6. Secret scan found no real API key. Known matches are command text in docs / README and the package-lock false positive for `queue-microtask-1`.

## Screenshot Evidence

P3D Browser QA screenshots were saved outside the repo:

1. `/tmp/promptg-p3d-selector.png`
2. `/tmp/promptg-p3d-after-select.png`
3. `/tmp/promptg-p3d-atom-form.png`
4. `/tmp/promptg-p3d-mobile-top.png`
5. `/tmp/promptg-p3d-mobile-selector.png`

## Residual Risks

1. P3D did not run a live external Mimo API parse. Parser behavior is verified through missing-key handling, mocked fetch output, schema validation, and system prompt assertions.
2. No new GPT Image 2 previews were generated in P3D. New seed atoms reuse existing visually compatible local seed previews; product runtime still has no image generation integration.
3. Browser console emitted a Next Image LCP warning for an above-the-fold seed image in the selector. This is a performance suggestion, not a runtime error or functional QA failure.
4. Production readiness remains local-first. No deployment, multi-user, cloud sync, sharing, auth, payment, or public moderation readiness is claimed.
