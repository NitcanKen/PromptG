# Hermes Prompt Agent Plan

## Scope

Hermes is a text-only prompt rewrite layer for PromptG. It converts the current selected Prompt Atoms plus the deterministic raw compiled prompt into a higher-quality final prompt text.

Hermes must not generate images, call image-generation APIs, download images, or modify the atom preview generation flow. The deterministic atom compiler remains available as the fallback/raw composition mode.

## Status Checklist

### P0 Prompt-Only Agent

- [x] `POST /api/prompt/enhance` exists and calls Xiaomi Mimo through the OpenAI-compatible `/chat/completions` endpoint.
- [x] Hermes output schema includes `positivePrompt`, `negativePrompt`, `rewriteNotes`, `riskNotes`, `qualityNotes`, and `riskLevel`.
- [x] Missing `XIAOMI_MIMO_API_KEY` returns a clear Traditional Chinese error.
- [x] Invalid Mimo JSON uses JSON extraction, schema validation, and at most one repair attempt.
- [x] Workbench exposes a manual Hermes trigger inside the Prompt compiler.
- [x] Deterministic raw compiler and custom prompt mode remain available.
- [x] P0 baseline targeted verification passed on 2026-06-12: `npm test -- src/lib/validation/prompt-enhance.test.ts src/lib/hermes/enhancer.test.ts src/lib/prompt/compiler.test.ts`.

### P1 Controllable Quality Controls

- [x] Added Hermes enhancement presets: `克制高級`, `時尚 editorial`, `角色美術感`, `寫實社群自拍`.
- [x] Added final prompt language/output styles: `中文 final prompt`, `English final prompt`, `mixed technical prompt`.
- [x] Added per-run user instruction field as a low-priority preference that cannot override global boundaries or direct image generation.
- [x] Mimo request payload includes preset, output style, and user instruction as layered prompt assembly controls.
- [x] Workbench shows current preset, language mode, user instruction, enhanced prompt, negative prompt, and rewrite/risk/quality notes.
- [x] Workbench includes a readable before/after comparison between raw compiled prompt and Hermes enhanced prompt.
- [x] Tests cover preset schema, language/style schema, user instruction payload, Mimo request payload, success parsing, invalid JSON repair/failure, missing key, and no image API calls.
- [x] Full fresh verification passed on 2026-06-12: `npm test` (24 files, 106 tests).
- [x] Full fresh verification passed on 2026-06-12: `npm run lint`.
- [x] Full fresh verification passed on 2026-06-12: `npm run build`.

### P2 Evaluation And Production Hardening

- [x] Fresh P0/P1 baseline targeted verification passed before P2 implementation.
- [x] Added Hermes benchmark fixtures covering common atom combinations, anime character combinations, private-but-tasteful rewrites, risky swimwear/low-angle/turnback combinations, and non-human or weak-human subjects.
- [x] Added deterministic regression tests for raw atom paste, image-generation requests, lowbrow adultized framing, and missing layered quality signals.
- [x] Added Gallery Hermes provenance persistence for raw prompt, enhanced prompt, negative prompt, preset, output style, user instruction, model, rewrite/risk/quality notes, timestamp, duration, token usage, and cost null.
- [x] Added Hermes request observability: loading/success/error state, model, duration, provider token usage when available, and `未提供 token/cost` fallback.
- [x] Model selector strategy: reuse the existing Mimo model selector for Hermes API requests and UI display.
- [x] Added P2 report: `docs/reports/2026-06-12-hermes-prompt-agent-p2-report.md`.
- [x] Full fresh verification passed on 2026-06-12: `npm test` (26 files, 115 tests).
- [x] Full fresh verification passed on 2026-06-12: `npm run lint`.
- [x] Full fresh verification passed on 2026-06-12: `npm run build`.

## Implementation Notes

- Server route: `src/app/api/prompt/enhance/route.ts`
- Hermes Mimo wrapper: `src/lib/hermes/enhancer.ts`
- Hermes options: `src/lib/hermes/options.ts`
- Hermes benchmark/regression evaluator: `src/lib/hermes/benchmark.ts`
- Hermes validation: `src/lib/validation/prompt-enhance.ts`
- Gallery provenance validation: `src/lib/validation/gallery.ts`
- Workbench UI: `src/components/workbench/prompt-workbench.tsx`
