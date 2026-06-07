# Atom Prompt Quality Audit Plan

Updated: 2026-06-07 HKT

## 1. Objective

Audit and correct the full PromptG atom prompt library so every atom prompt is high quality, category-aligned, non-template-like, sufficiently specific, and usable as source material for later preview image generation and prompt compilation.

This is a text-quality and source-data pass. It must not generate preview images.

The final deliverable is:

1. corrected canonical atom source files;
2. synced material-library markdown shards;
3. automated quality checks where practical;
4. a written audit report plus summary.

## 2. Verified Baseline

Verified locally on 2026-06-07 with:

```bash
npx tsx -e "(async()=>{ const { SEED_ATOMS } = await import('./src/lib/seed/seed-atoms.ts'); const { EXPANDED_ATOMS, EXPANDED_HAIR_ATOMS, EXPANDED_PERSONA_ADDON_ATOMS } = await import('./src/lib/seed/expanded-atoms.ts'); const map = new Map([...SEED_ATOMS,...EXPANDED_ATOMS].map(a=>[a.id,a])); const byCat = {}; for (const a of map.values()) byCat[a.category]=(byCat[a.category]||0)+1; console.log(JSON.stringify({seed:SEED_ATOMS.length, expanded:EXPANDED_ATOMS.length, hair:EXPANDED_HAIR_ATOMS.length, personaAddons:EXPANDED_PERSONA_ADDON_ATOMS.length, unique:map.size, categories:Object.keys(byCat).length, byCat}, null, 2)); })();"
```

Current verified counts:

| Source / Scope | Count |
| --- | ---: |
| `SEED_ATOMS` | 36 |
| `EXPANDED_ATOMS` | 750 |
| `EXPANDED_HAIR_ATOMS` | 40 |
| `EXPANDED_PERSONA_ADDON_ATOMS` | 50 |
| Unique atoms after `SEED_ATOMS + EXPANDED_ATOMS` by stable ID | 785 |
| Categories represented | 36 |

Current verified category counts:

| Category | Count |
| --- | ---: |
| 人設 | 80 |
| 臉部特徵 | 30 |
| 髮型 | 40 |
| 表情 | 30 |
| 視線 | 20 |
| 主體數量 / 人物關係 | 10 |
| 姿態 | 30 |
| 手部動作 | 30 |
| 身體構圖 | 30 |
| 互動行為 | 30 |
| 上裝 | 40 |
| 下裝 | 40 |
| 鞋履 | 40 |
| 配飾 | 40 |
| 道具 | 40 |
| 妝容 | 40 |
| 場景 | 20 |
| 場景細節 | 20 |
| 時間 / 季節 / 天氣 | 20 |
| 光影 | 20 |
| 色彩系統 | 20 |
| 寫真風格 | 20 |
| 鏡頭角度 | 10 |
| 鏡頭質感 | 10 |
| 景別 | 10 |
| 構圖規則 | 10 |
| 畫面影響 | 10 |
| 版式設計 | 10 |
| 文本元素 | 10 |
| 平台媒介 | 10 |
| 後期處理 | 10 |
| 材質 | 1 |
| 真實性 / 缺陷控制 | 1 |
| Negative Atom | 1 |
| 尺寸 | 1 |
| 質量 | 1 |

Current source layout:

1. `src/lib/seed/seed-atoms.ts`: original seed atoms.
2. `src/lib/seed/expanded-atoms.ts`: hair atoms plus export aggregation.
3. `src/lib/seed/expanded-main-atoms.ts`: generated main-scope atom series and curated persona entries.
4. `src/lib/seed/expanded-persona-addons.ts`: 50 additional persona atoms.
5. `docs/material-library/*.md`: exported markdown shards generated from source.

Known current quality risks from source inspection:

1. Many generated series in `src/lib/seed/expanded-main-atoms.ts` use reusable templates such as `${variant.en} ${base.en}, ...`.
2. Some categories may still contain generic words like `natural everyday`, `realistic capture style`, `coherent photographic genre`, or other repeated suffixes.
3. Persona add-ons were recently corrected away from `20-year-old cute Japanese young woman`, but this must be guarded by tests and audit output.
4. `材質`, `真實性 / 缺陷控制`, `Negative Atom`, `尺寸`, and `質量` currently have only one atom each; this audit checks their prompt quality but does not expand their counts unless explicitly approved.
5. The working tree is already dirty from previous atom/image-pipeline changes. Do not revert unrelated changes.

## 3. Scope

In scope:

1. Audit all 785 unique atoms.
2. Review `prompt`, `negativePrompt`, `title`, `subtitle`, `category`, `tags`, and `notes` for alignment.
3. Rewrite any atom that is low-quality, too template-like, highly repetitive, vague, unrelated, or insufficiently specific.
4. Preserve stable IDs unless an ID is demonstrably wrong or duplicated.
5. Keep visible UI metadata in Traditional Chinese.
6. Keep prompt fragments in English where useful for image models.
7. Sync markdown shards after source edits with `npm run export:material-shards`.
8. Produce a report and summary.

Out of scope:

1. Generating preview images.
2. Reintroducing deleted seed preview images.
3. Changing the category taxonomy unless a prompt cannot be fixed without moving category.
4. Expanding the five one-count control/completion categories beyond current count.
5. Changing the GPT-Image-2 API integration except where required by prompt-quality tests.
6. Large UI refactors.

## 4. Quality Rubric

Every atom must pass these criteria.

### 4.1 Category Alignment

The prompt must describe the category's intended control surface:

1. `人設`: role, identity, social/aesthetic archetype, presence. It must not primarily describe hair, outfit, pose, camera, or scene.
2. `臉部特徵`: facial structure or facial impression, not expression or gaze.
3. `髮型`: hair shape, length, cut, texture, color, or styling.
4. `表情`: mouth/eyes/face emotion, not gaze direction.
5. `視線`: eye direction and attention target, not emotion.
6. `主體數量 / 人物關係`: subject count and relationship staging.
7. `姿態`: whole-body pose.
8. `手部動作`: local hand gesture with anatomically clear wording.
9. `身體構圖`: body crop/visibility/emphasis, not camera distance alone.
10. `互動行為`: action with object, environment, or other subjects.
11. `上裝`, `下裝`, `鞋履`: concrete wearable item and silhouette/material.
12. `配飾`, `道具`: one reusable object or accessory, not a whole scene.
13. `妝容`: makeup finish, color, intensity, face-styling effect.
14. `場景`: main location.
15. `場景細節`: additive detail that supports but does not replace main scene.
16. `時間 / 季節 / 天氣`: temporal/weather/seasonal condition.
17. `光影`: light source, contrast, shadow, direction.
18. `色彩系統`: global palette and color logic.
19. `寫真風格`: visual/photo genre or rendering style.
20. `鏡頭角度`: camera position and spatial angle.
21. `鏡頭質感`: lens/device/capture artifacts.
22. `景別`: camera distance or subject scale.
23. `構圖規則`: frame structure and visual weight.
24. `畫面影響`: surface-level visual effect.
25. `版式設計`: graphic arrangement and hierarchy.
26. `文本元素`: text treatment intent; avoid random unreadable text unless the atom is about corrupted text.
27. `平台媒介`: output medium/platform artifact.
28. `後期處理`: final image treatment.
29. `材質`: tactile/surface material.
30. `真實性 / 缺陷控制`: realism, imperfection, or anti-AI control.
31. `Negative Atom`: undesired elements only.
32. `尺寸`: aspect ratio or output size.
33. `質量`: quality/output fidelity.

### 4.2 Specificity

A high-quality atom prompt must:

1. name the visible object, role, effect, or relation directly;
2. include at least two concrete visual constraints when the category allows;
3. avoid only mood words such as `natural`, `beautiful`, `clean`, `soft`, `refined` without concrete subject matter;
4. be composable and not overtake unrelated categories.

### 4.3 Anti-Template Rules

Flag and fix any prompt that:

1. shares a repeated suffix with many atoms in the same category without adding enough unique content;
2. differs from another atom only by one adjective such as `natural`, `fresh`, `quiet`, or `refined`;
3. contains boilerplate such as `reusable character archetype`, `20-year-old cute Japanese young woman`, or similarly generic age/nationality filler;
4. uses broad placeholders like `believable everyday interaction` without naming the actual action clearly;
5. uses category-generic phrases such as `coherent photographic genre` when the title demands a specific style.

Template reuse is acceptable only when the repeated part enforces category grammar and the unique part still clearly distinguishes the atom.

### 4.4 Difference / Duplication Standard

For each category:

1. No two prompts should be near-paraphrases with the same visible output.
2. Each atom should introduce a meaningfully distinct control.
3. Similar atoms are allowed only when their visible distinction is obvious, e.g. `高馬尾` vs `低馬尾`, `平視` vs `微俯視`.
4. If two prompts are too close, merge the weaker idea into a stronger rewrite while preserving both IDs if count targets require both.

### 4.5 Prompt-to-Preview Readiness

Each prompt must be usable by the preview generation compiler without causing mismatch:

1. Do not rely on product-internal words such as `PromptG`, `atom`, or `library card`.
2. Avoid prompt fragments that force live-action stock photography when the preview policy is ACG/2.5D.
3. For non-character categories, make the actual target object/scene/effect explicit enough that preview generation can focus on it.

## 5. Required Implementation Tasks

### Task 1: Build Audit Inventory

- [ ] Create a script or test helper that loads `SEED_ATOMS` + `EXPANDED_ATOMS`, deduplicates by `id`, and exports a reviewable JSON/Markdown inventory.
- [ ] Include per-atom fields: `id`, `category`, `title`, `subtitle`, `prompt`, `negativePrompt`, `tags`, `notes`, source file, and quality flags.
- [ ] Confirm the inventory count is exactly 785 unless source changed.

### Task 2: Add Automated Quality Gates

- [ ] Add tests or scripts for forbidden boilerplate.
- [ ] Add tests or scripts for repeated prompt skeletons by category.
- [ ] Add tests or scripts for empty/vague prompts and prompt/title/category mismatch patterns.
- [ ] Add tests or scripts for exact duplicate prompts and near-duplicate normalized prompts.
- [ ] Add tests or scripts that ensure markdown shards are generated from source, not hand-drifted.

Automation does not replace human review; it catches obvious and repeatable failures.

### Task 3: Manual / Agentic Full Review

- [ ] Review all 785 atoms category by category.
- [ ] For each atom, decide: `pass`, `rewrite`, `merge-risk`, or `category-risk`.
- [ ] Rewrite every atom that fails the rubric.
- [ ] Keep changes source-first in TypeScript files.
- [ ] Do not only edit markdown shards.

### Task 4: Rewrite Source Files

Primary files:

1. `src/lib/seed/seed-atoms.ts`
2. `src/lib/seed/expanded-atoms.ts`
3. `src/lib/seed/expanded-main-atoms.ts`
4. `src/lib/seed/expanded-persona-addons.ts`

Expected high-risk area:

1. `src/lib/seed/expanded-main-atoms.ts`, especially generated series that use `Axis` and `seriesDefinitions`.
2. `src/lib/seed/expanded-persona-addons.ts`, because many entries share a repeated opening structure.
3. Seed atoms if they still include old realistic-photo bias or weak generic descriptions.

### Task 5: Sync Derived Markdown

- [ ] Run `npm run export:material-shards`.
- [ ] Confirm updated docs in `docs/material-library/*.md` match canonical source.
- [ ] Do not hand-edit generated markdown except to fix the exporter itself.

### Task 6: Produce Audit Report

Create:

`docs/reports/2026-06-07-atom-prompt-quality-audit-report.md`

The report must include:

1. total atoms reviewed;
2. total atoms passed unchanged;
3. total atoms rewritten;
4. total duplicate/near-duplicate risks found and fixed;
5. total category-alignment risks found and fixed;
6. representative before/after examples;
7. remaining known risks, if any;
8. summary in Traditional Chinese.

The report must be concrete. Do not write a vague "improved quality" report.

## 6. Acceptance Criteria

This work is complete only when all criteria are met:

1. All 785 unique atoms are audited.
2. Any prompt judged low-quality, template-like, highly repetitive, vague, unrelated, or insufficiently specific is rewritten.
3. Stable atom IDs are preserved unless explicitly documented.
4. Material markdown shards are regenerated from source.
5. The audit report exists at `docs/reports/2026-06-07-atom-prompt-quality-audit-report.md`.
6. The report includes both detailed findings and a concise summary.
7. The following commands pass:

```bash
npm test
npm run lint
npm run build
```

8. A fresh count command confirms the atom inventory count after edits.
9. No preview image generation is run as part of this work.

## 7. Verification Commands

Required:

```bash
npm test
npm run lint
npm run build
npm run export:material-shards
```

Recommended additional verification:

```bash
npm run generate:atom-previews -- --dry-run --all-main --limit 20
```

The dry-run is allowed because it does not call the image provider or create images. It should be used to inspect whether preview prompts are semantically aligned after source prompt rewrites.

## 8. Report Format

The final report should use this structure:

```md
# Atom Prompt Quality Audit Report

## Summary

## Scope Reviewed

## Method

## Quantitative Results

## Category Findings

## Rewrites Performed

## Representative Before / After Examples

## Remaining Risks

## Verification

## Final Conclusion
```

## 9. Constraints

1. Do not leak or print API keys.
2. Do not restore deleted preview images.
3. Do not generate new preview images.
4. Do not change unrelated UI behavior.
5. Do not revert user or other-agent changes.
6. Do not claim completion from partial sampling.
7. Do not expand category counts unless the user explicitly approves expansion.
8. Do not leave generated docs out of sync with source.
9. Do not leave the final report detached from actual source changes.

## 10. Blocker Rules

Stop and produce a blocker report if any of these occur:

1. The canonical source count cannot be reconciled with 785 unique atoms after three attempts.
2. A category requires taxonomy changes rather than prompt rewrites.
3. Automated duplicate detection produces too many false positives to complete safely without user scope decisions.
4. Tests/build fail for reasons unrelated to this work and cannot be isolated.

The blocker report must include attempted commands, observed output, affected files, and the smallest set of user decisions needed.

## 11. Current Status

- [x] User approved creating this source-of-truth document.
- [x] Verified current unique atom count: 785.
- [x] Verified current categories represented: 36.
- [x] Identified canonical source files.
- [x] User approved this source-of-truth document.
- [x] `/goal` generated from this document.
- [x] Audit inventory created.
- [x] Automated quality gates added.
- [x] Full review completed.
- [x] Source rewrites completed.
- [x] Markdown shards regenerated.
- [x] Final report created.
- [x] Verification commands passed.
