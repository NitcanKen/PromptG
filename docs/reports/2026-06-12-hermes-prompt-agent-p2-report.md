# Hermes Prompt Agent P2 Report

## Summary

P2 hardens Hermes from a prompt rewrite feature into a repeatably testable, observable, and saveable prompt-only workflow. Hermes remains text-only: it does not generate images, call image-generation APIs, download images, or change the atom preview generation flow.

## Benchmark Cases

The deterministic benchmark fixtures live in `src/lib/hermes/benchmark.ts`.

| Case | Coverage |
| --- | --- |
| `original-persona-styling-scene-camera` | 原創人設 + 造型 + 場景 + 鏡頭 |
| `anime-character-outfit-scene-medium` | 動漫角色 + 服裝/場景/媒介 |
| `private-scene-tasteful-rewrite` | 私密場景但得體 rewrite |
| `risky-swimwear-low-angle-turnback` | 泳裝/貼身/回眸/低機位 risky atom 組合 |
| `non-human-or-weak-human-subject` | 非人物或弱人物組合 |

## Regression Protection

`evaluateHermesOutputRegression()` flags:

- `raw_atom_paste`: output is effectively the deterministic atom paste.
- `image_generation_request`: output asks to generate/render an image or names image providers.
- `lowbrow_adultized_framing`: risky cases are rewritten into erotic/explicit framing.
- `missing_layered_quality_signals`: output lacks composition, lighting, texture, anatomy, styling, environment, silhouette, framing, or equivalent quality signals.

The regression tests cover both healthy output and each failure mode.

## Gallery Provenance

Gallery now supports `hermesProvenance` stored as `hermes_provenance_json`. A Hermes Gallery save preserves:

- raw prompt
- enhanced prompt
- negative prompt
- preset
- language/output style
- user instruction
- model
- rewrite/risk/quality notes
- timestamp
- duration
- provider token usage when available
- `cost: null` when no safe cost source is available

Old Gallery rows remain compatible because missing or empty provenance maps to `null`.

## Request Observability

Hermes API responses now include:

- `model`
- `durationMs`
- `tokenUsage` when Mimo returns `usage`
- `cost: null`

The Workbench shows loading/success/error state, model, duration, and token/cost. If token or cost is not safely available, it displays `未提供 token/cost` rather than inventing values.

## Model Selector Strategy

P2 reuses the existing Mimo model selector. The selected model drives both prompt parsing and Hermes enhancement, and the Workbench displays the active Hermes model in the Hermes panel.

## Verification

Fresh verification passed on 2026-06-12:

- `npm test`：26 files, 115 tests passed
- `npm run lint`：passed
- `npm run build`：passed, including `/api/prompt/enhance`

P0/P1 baseline targeted verification also passed before P2 work:

- `npm test -- src/lib/validation/prompt-enhance.test.ts src/lib/hermes/enhancer.test.ts src/lib/prompt/compiler.test.ts`

## Known Limits

- Tests mock Mimo responses; they do not require a live Mimo API key.
- Mimo token usage is displayed only when the provider returns `usage`.
- Cost is intentionally `null` because no reliable pricing source is available in the response.
- Regression evaluation is deterministic and conservative; it catches major prompt-quality regressions but is not a substitute for human creative review.
