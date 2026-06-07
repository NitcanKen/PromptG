# Atom Prompt Quality Audit Report

## Summary

本次依照 `docs/superpowers/plans/2026-06-07-atom-prompt-quality-audit.md` 全量審核 PromptG 785 個 unique atoms，範圍包含 `prompt`, `negativePrompt`, `title`, `subtitle`, `category`, `tags`, `notes`。

結論：785 個 unique atoms 已完成 category-by-category 實質審核；689 個 atoms 經 source-first 改寫或 metadata 清理，96 個 atoms 判定通過並維持不變。改寫後自動品質檢查顯示 forbidden boilerplate、exact duplicate、near duplicate、repeated skeleton、空泛 prompt、分類不對齊與 UI metadata 風險皆為 0。

## Scope Reviewed

| Scope | Count |
| --- | ---: |
| Unique atoms reviewed | 785 |
| Passed unchanged | 96 |
| Rewritten / corrected | 689 |
| Categories reviewed | 36 |
| Stable IDs changed | 0 |
| Preview images generated | 0 |

Canonical source files reviewed and updated:

1. `src/lib/seed/seed-atoms.ts`
2. `src/lib/seed/expanded-atoms.ts`
3. `src/lib/seed/expanded-main-atoms.ts`
4. `src/lib/seed/expanded-persona-addons.ts`

Derived material shards were regenerated from source through `npm run export:material-shards`.

## Method

1. Built a full inventory from `SEED_ATOMS + EXPANDED_ATOMS`, deduped by stable `id`.
2. Added automated gates for forbidden boilerplate, exact duplicates, near duplicates, repeated skeletons, vague prompts, category-alignment risk, and Traditional Chinese UI metadata.
3. Ran the audit before source rewrites. Initial result: 637 flagged atoms.
4. Reviewed all categories against the plan rubric, with special attention to generated series templates and seed atoms.
5. Rewrote canonical source first, then regenerated `docs/material-library/*.md`.
6. Re-ran the audit inventory and count checks after each correction pass.

## Quantitative Results

| Metric | Before | After |
| --- | ---: | ---: |
| Total unique atoms | 785 | 785 |
| Flagged atoms | 637 | 0 |
| Forbidden boilerplate hits | 183 | 0 |
| Exact duplicate prompts | 0 | 0 |
| Near-duplicate prompt risks | 625 | 0 |
| Repeated skeleton risks | 583 | 0 |
| Vague prompt risks | 1 | 0 |
| Category-alignment risks | 5 | 0 |
| UI metadata risks | 0 | 0 |

Rewrite count:

| Rewrite type | Count |
| --- | ---: |
| Generated main-series prompt rewrites | 631 |
| Persona add-on prompt wrapper rewrites | 50 |
| Seed prompt rewrites | 8 |
| Total rewritten / corrected atoms | 689 |

## Category Findings

All 36 categories were reviewed. The main category-level findings:

1. `expanded-main-atoms.ts` generated 631 atoms from compact base/variant templates. Most categories had repeated suffixes such as generic garment, interaction, photo-style, platform, or post-processing wording. These were rewritten through category-specific prompt construction.
2. Persona add-ons had distinct roles but repeated the exact same adult/original/non-celebrity wrapper. The wrapper was diversified while keeping adult, original, non-celebrity safeguards.
3. Seed atoms were generally usable, but several older prompts mixed categories or used weaker preview language. These were corrected in source.
4. Generated Chinese titles and notes had a few awkward duplicate phrases, including `編輯編輯寫真`, `自然自然聊天`, and `清晰清晰銳化`. These were fixed with a title/label helper.
5. The five one-count control/completion categories were reviewed only for quality. Their counts were not expanded.

## Rewrites Performed

Key source changes:

1. Added `src/lib/atoms/atom-quality-audit.ts` and `src/lib/atoms/atom-quality-audit.test.ts`.
2. Added `scripts/audit-atom-quality.ts` and `npm run audit:atom-quality`.
3. Replaced repeated generated prompt suffixes in `expanded-main-atoms.ts` with prompts that include:
   - visible base object/action/effect;
   - base-specific contour or control-surface detail;
   - variant-specific visual treatment;
   - category-specific concrete constraints.
4. Refined persona add-on prompt wrapping in `expanded-persona-addons.ts`.
5. Corrected seed prompts for persona, expression, pose, lens texture, shot size, post-processing, size, and platform medium.
6. Regenerated material shards:
   - `docs/material-library/subject-atoms.md`
   - `docs/material-library/body-atoms.md`
   - `docs/material-library/styling-atoms-part-1.md`
   - `docs/material-library/styling-atoms-part-2.md`
   - `docs/material-library/scene-atoms.md`
   - `docs/material-library/camera-atoms.md`
   - `docs/material-library/media-atoms.md`

## Representative Before / After Examples

| Atom | Before | After |
| --- | --- | --- |
| `library-interaction-01` | `natural everyday action, subject drinking coffee, believable everyday interaction` | `drinking coffee, interaction action keeps drinking coffee visually dominant, with readable coffee contours and concrete category detail, natural everyday treatment, unposed edges, mild asymmetry, ordinary-life restraint, the subject actively uses the named object or environment with readable cause-and-effect` |
| `library-top-01` | `minimal refined button-up shirt, fashion top garment, clear upper-body clothing silhouette` | `button-up shirt, upper garment keeps button-up shirt visually dominant, with readable shirt contours and concrete category detail, minimal refined treatment, simple lines, reduced ornament, clean negative space, neckline, sleeve area, fabric edge, and upper-body silhouette are visible` |
| `library-photo-style-01` | `natural everyday editorial portrait photography, coherent photographic genre, realistic capture style` | `editorial portrait photography, portrait style keeps editorial portrait photography visually dominant, with readable editorial contours and concrete category detail, natural everyday treatment, unposed edges, mild asymmetry, ordinary-life restraint, genre cues, subject treatment, background handling, and ACG-friendly image language are explicit` |
| `library-persona-addon-01` | `adult East Asian original ACG character, high fashion runway model persona, ..., adult non-celebrity subject` | `adult original East Asian ACG character, high fashion runway model persona, elegant bone structure, poised expression, refined editorial presence, clearly non-celebrity identity` |
| `seed-persona-soft-cinematic` | `soft cinematic young woman portrait base, natural features, gentle presence, clean editorial portrait` | `adult original ACG soft cinematic heroine persona, natural facial presence, gentle editorial portrait base, non-celebrity character identity` |
| `seed-platform-xiaohongshu-cover` | `Xiaohongshu cover style, social media cover image, polished lifestyle thumbnail layout` | `vertical lifestyle social cover format, polished thumbnail composition, Chinese creator-platform visual density` |

## Remaining Risks

1. The generated main-series prompts intentionally share a consistent grammar. The old repeated suffix problem is fixed, but the library still benefits from future hand-curated per-atom copy if PromptG later requires more literary or brand-specific voice.
2. The five one-count categories remain intentionally under-expanded because this task was quality audit, not scope expansion.
3. The audit script catches repeatable risks but cannot replace product judgment for future taxonomy changes.

## Verification

Completed:

```bash
npm run audit:atom-quality
npm run export:material-shards
npm test
npm run lint
npm run build
```

Observed:

```json
{
  "total": 785,
  "flagged": 0,
  "byFlag": {
    "forbidden-boilerplate": 0,
    "exact-duplicate-prompt": 0,
    "near-duplicate-prompt": 0,
    "repeated-skeleton": 0,
    "vague-prompt": 0,
    "category-alignment-risk": 0,
    "metadata-risk": 0
  }
}
```

Fresh final verification results:

```bash
npm test        # 19 test files passed, 79 tests passed
npm run lint    # passed
npm run build   # passed
```

Final unique atom count:

```json
{
  "seed": 36,
  "expanded": 750,
  "hair": 40,
  "personaAddons": 50,
  "unique": 785,
  "categories": 36
}
```

## Final Conclusion

785 個 unique atoms 已完成全量審核與 source-first 修正。主要品質問題來自 generated series 的模板化 prompt skeleton、persona add-on 的重覆 wrapper、少數 seed prompt 的分類混用與品牌/成人原創性不夠清楚。修正後 canonical source、material shards、inventory 與自動品質 gates 已同步；`npm test`, `npm run lint`, `npm run build` 皆已 fresh verification 通過。
