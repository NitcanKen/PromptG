# Preview Prompt Compiler Design Draft

Updated: 2026-06-07 HKT

## 1. Purpose

This document defines the design draft for converting PromptG atom data into image-preview generation prompts.

It is not implementation code. It does not generate images.

The goal is to make every preview image:

1. clearly match the selected atom;
2. keep the atom's category as the visual focus;
3. avoid generic pretty-character drift;
4. support small card thumbnails in the app;
5. use the same quality bar before any full batch generation.

## 2. Current Input Baseline

Current verified atom source after the prompt quality audit:

1. Total unique atoms: 785.
2. Categories: 36.
3. Source files:
   - `src/lib/seed/seed-atoms.ts`
   - `src/lib/seed/expanded-atoms.ts`
   - `src/lib/seed/expanded-main-atoms.ts`
   - `src/lib/seed/expanded-persona-addons.ts`
4. Audit report:
   - `docs/reports/2026-06-07-atom-prompt-quality-audit-report.md`
5. Prompt quality status:
   - 785 atoms reviewed.
   - 689 atoms rewritten or corrected.
   - quality audit flags reduced to 0.

This preview design assumes the atom prompt text is now usable as semantic source material, but still should not be copied blindly into provider prompts without category-specific framing.

## 3. Core Design Decision

Atom prompt and preview prompt are different products.

An atom prompt is a reusable fragment for final prompt composition.

A preview prompt is a single-image instruction for visually demonstrating one atom in a card grid.

Therefore, the compiler must transform:

```text
atom metadata + atom prompt + negative prompt + category
```

into:

```text
single visual concept preview instruction
```

The preview prompt must not assume the image model understands product-internal words such as:

1. `PromptG`
2. `atom`
3. `library card`
4. `素材卡`

## 4. Global Preview Style

Use this global visual policy unless a specific atom requires otherwise:

```text
2.5D semi-realistic ACG illustration, live-action-feeling anime character photography when characters are present, premium key visual quality, clean silhouette, strong thumbnail readability, polished lighting, no brand logos, no copyrighted characters, no celebrity likeness, no watermark, no random text.
```

Notes:

1. Do not force every category into a portrait.
2. If the category is not character-focused, the object, scene, layout, camera rule, or effect must be the main subject.
3. If the atom describes a non-human subject, object-only material, typography, platform artifact, or negative constraint, do not invent a full character portrait unless useful for scale.
4. For text-related atoms, readable text is only allowed when the atom explicitly requires readable text. Otherwise use placeholder marks or abstract text blocks.

## 5. Generic Compiler Shape

Every generated preview prompt should follow this conceptual structure:

```text
Create one square 1:1 image that demonstrates one visual concept.

Concept title: <atom.title>
Concept category: <atom.category>
Concept meaning: <atom.prompt>
Negative guidance: <atom.negativePrompt if useful>

Visual policy:
<global preview style>

Category framing:
<category-specific template>

Composition requirement:
The concept must be recognizable at small thumbnail size. The image should contain no unrelated concepts and no generic filler that competes with the selected concept.
```

The final implementation may format this more compactly, but these fields must remain logically present.

## 6. Category Compiler Templates

### 6.1 人設

Preview target: character design portrait.

The preview must show role, identity, archetype, and presence. It should not over-focus on hairstyle, pose, outfit brand, or scene unless those are essential to the role.

Template intent:

```text
Create a character design portrait for an adult original ACG character. The role identity must be clear from silhouette, expression, costume direction, and aura. The concept title must be readable from the image without relying on text.
```

Failure modes:

1. generic attractive portrait;
2. commuter/person-on-street drift;
3. role not visible;
4. too much background, not enough character identity.

### 6.2 臉部特徵

Preview target: face study.

The preview must show facial structure or facial impression, not expression or gaze.

Template intent:

```text
Create a close-up ACG face study focused on the named facial feature. Keep hair, clothing, background, pose, and lighting simple so the face feature is the main subject.
```

Failure modes:

1. expression replaces facial feature;
2. hairstyle dominates;
3. face looks generic.

### 6.3 髮型

Preview target: hair design portrait.

The preview must make the hair shape, cut, length, texture, or color immediately visible.

Template intent:

```text
Create a close portrait or upper-body hair design image. Hair silhouette, hairline, side locks, length, texture, and color must be clearly visible. Outfit and background are secondary.
```

Failure modes:

1. hair is cropped;
2. face dominates;
3. hairstyle is not distinguishable from nearby hair atoms.

### 6.4 表情

Preview target: expression sheet crop.

The preview must focus on mouth, eyes, cheeks, brow tension, and emotional signal.

Template intent:

```text
Create a face-and-shoulders expression study. The named expression must be the only emotional focus. Keep gaze and pose neutral unless the expression requires them.
```

Failure modes:

1. expression too subtle to read;
2. expression becomes a different emotion;
3. overacting breaks semi-realistic style.

### 6.5 視線

Preview target: gaze direction study.

The preview must show where the eyes are directed.

Template intent:

```text
Create a portrait focused on eye direction and attention target. The gaze vector must be clear. Expression should stay restrained so it does not override the gaze concept.
```

Failure modes:

1. eyes point ambiguously;
2. expression replaces gaze;
3. camera angle makes gaze unreadable.

### 6.6 主體數量 / 人物關係

Preview target: subject-count and relationship staging.

The preview must show count and relationship, not detailed pose or fashion.

Template intent:

```text
Create a simple staged composition where the number of subjects and their relationship are obvious. Use clean spacing, clear hierarchy, and readable interaction distance.
```

Failure modes:

1. wrong number of people;
2. relation is unclear;
3. background crowd confuses count.

### 6.7 姿態

Preview target: whole-body pose study.

The preview must show body balance and posture.

Template intent:

```text
Create a full-body or three-quarter pose study where the named body posture is dominant. Clothing and background should support limb readability.
```

Failure modes:

1. body cropped;
2. limbs hidden;
3. pose becomes hand gesture only.

### 6.8 手部動作

Preview target: hand gesture study.

The preview must show natural fingers and the named hand action.

Template intent:

```text
Create a close or medium crop focused on the hand gesture. Fingers, palm orientation, object contact, and relation to the face/body must be anatomically readable.
```

Failure modes:

1. malformed hands;
2. gesture hidden;
3. unrelated prop steals focus.

### 6.9 身體構圖

Preview target: body crop and visibility example.

The preview must show which body region is visible or emphasized.

Template intent:

```text
Create a composition sample focused on body visibility and crop boundaries. The body region named by the concept must be clearly included and framed.
```

Failure modes:

1. confused with camera distance only;
2. wrong crop;
3. unstable framing.

### 6.10 互動行為

Preview target: action and cause-effect.

The preview must show the subject doing the named activity.

Template intent:

```text
Create an action image where the subject actively interacts with the named object, person, or environment. The action must be visible through contact, body direction, and object placement.
```

Failure modes:

1. object present but not used;
2. pose is static;
3. action unclear.

### 6.11 上裝

Preview target: upper garment design.

Template intent:

```text
Create a fashion design preview focused on the upper garment. Neckline, sleeves, fit, fabric edge, closure, and silhouette must be visible. The face should not steal focus.
```

Failure modes:

1. portrait focus overwhelms clothing;
2. garment cropped;
3. material unclear.

### 6.12 下裝

Preview target: lower garment design.

Template intent:

```text
Create a fashion design preview focused on the lower garment. Waistline, length, leg shape, folds, fabric weight, and silhouette must be visible.
```

Failure modes:

1. lower body cropped;
2. garment confused with dress/coat;
3. fabric shape not readable.

### 6.13 鞋履

Preview target: footwear design.

Template intent:

```text
Create a footwear-focused preview. Shoes must be large enough to inspect, with sole shape, toe box, material, color, and styling context visible.
```

Failure modes:

1. shoes too small;
2. feet cropped;
3. brand-like logos.

### 6.14 配飾

Preview target: accessory detail.

Template intent:

```text
Create an accessory-focused preview where the named accessory is close, visible, and integrated with a simple character styling context. Avoid brand markings.
```

Failure modes:

1. accessory too small;
2. full portrait dominates;
3. multiple accessories confuse target.

### 6.15 道具

Preview target: prop object and usage.

Template intent:

```text
Create a prop-focused preview where the object is visible and naturally held, placed, or used. The prop must be the main subject; character is optional for scale and interaction.
```

Failure modes:

1. prop missing;
2. prop too small;
3. unrelated object replaces prop.

### 6.16 妝容

Preview target: makeup finish.

Template intent:

```text
Create a close beauty portrait focused on makeup finish, color placement, eye detail, lip finish, skin texture, and intensity. Hair and accessories are secondary.
```

Failure modes:

1. face feature replaces makeup;
2. makeup too subtle;
3. overdone glam unrelated to concept.

### 6.17 場景

Preview target: main location concept.

Template intent:

```text
Create an environment concept image where the named location is the main subject. People are optional and small. Architecture, layout, props, lighting, and spatial identity must identify the location.
```

Failure modes:

1. character portrait dominates;
2. generic background;
3. location not identifiable.

### 6.18 場景細節

Preview target: additive environment detail.

Template intent:

```text
Create an environment-detail preview focused on the named background or foreground detail. The detail must be visible enough to read, while the wider scene stays simple.
```

Failure modes:

1. detail too tiny;
2. detail becomes whole scene;
3. clutter hides target.

### 6.19 時間 / 季節 / 天氣

Preview target: temporal/weather atmosphere.

Template intent:

```text
Create an atmospheric environment image where the named time, season, or weather condition is obvious through sky, light, ground condition, clothing cues, and air quality.
```

Failure modes:

1. weather not visible;
2. season contradicted by clothing/scene;
3. character overrides atmosphere.

### 6.20 光影

Preview target: lighting setup.

Template intent:

```text
Create a lighting study where the named light source, direction, contrast, highlight, and shadow pattern are the main visual subject.
```

Failure modes:

1. generic pretty lighting;
2. direction unclear;
3. lighting contradicts atom.

### 6.21 色彩系統

Preview target: palette board as image.

Template intent:

```text
Create a coherent visual image dominated by the named color palette. Palette should affect lighting, background, clothing/object accents, and overall grade.
```

Failure modes:

1. palette too weak;
2. random colors introduced;
3. object identity overtakes color system.

### 6.22 寫真風格

Preview target: image genre sample.

Template intent:

```text
Create a genre-style sample that demonstrates the named visual style through composition, subject treatment, lighting, background handling, texture, and finishing language.
```

Failure modes:

1. style becomes generic portrait;
2. style contradicts ACG/2.5D policy;
3. no genre cues.

### 6.23 鏡頭角度

Preview target: camera angle example.

Template intent:

```text
Create a composition sample where the camera position and angle are unmistakable. Use simple subject/scene content so perspective is the main subject.
```

Failure modes:

1. angle too subtle;
2. pose dominates;
3. perspective impossible.

### 6.24 鏡頭質感

Preview target: lens/device/capture texture.

Template intent:

```text
Create an image sample focused on capture texture: lens feel, device character, flash behavior, grain, blur, compression, or sensor-like artifacts named by the concept.
```

Failure modes:

1. effect invisible;
2. overdone artifact;
3. confused with post-processing category.

### 6.25 景別

Preview target: camera distance and subject scale.

Template intent:

```text
Create a shot-size sample where subject scale and camera distance clearly match the named framing. Use clean crop boundaries.
```

Failure modes:

1. wrong distance;
2. crop contradicts title;
3. body composition category is confused with shot size.

### 6.26 構圖規則

Preview target: frame structure.

Template intent:

```text
Create a composition-rule sample where visual weight, subject placement, negative space, leading shapes, or frame-within-frame logic clearly demonstrates the named rule.
```

Failure modes:

1. rule not visible;
2. subject too centered when rule says otherwise;
3. too much clutter.

### 6.27 材質

Preview target: tactile material surface.

Template intent:

```text
Create a material-focused preview where surface texture, reflectivity, softness, transparency, weave, grain, or tactile quality is close and readable. Use a simple object or garment if scale is needed.
```

Failure modes:

1. material not close enough;
2. object identity overtakes material;
3. texture becomes noisy.

### 6.28 畫面影響

Preview target: visual surface effect.

Template intent:

```text
Create an image-effect preview where the named visual overlay or surface effect is visible across the image while the base subject stays simple.
```

Failure modes:

1. effect invisible;
2. effect destroys readability;
3. confused with lens texture or post-processing.

### 6.29 版式設計

Preview target: layout hierarchy.

Template intent:

```text
Create a graphic layout preview showing arrangement, spacing, hierarchy, framing, and decorative structure. Use placeholder visual blocks when text is not the main concept.
```

Failure modes:

1. random unreadable text;
2. layout too busy;
3. no hierarchy.

### 6.30 文本元素

Preview target: typography/text object.

Template intent:

```text
Create a typography-element preview focused on the named text treatment. If readable text is required, keep it short and intentional. If not required, use abstract placeholder marks.
```

Failure modes:

1. gibberish text;
2. text dominates unrelated categories;
3. random logos.

### 6.31 平台媒介

Preview target: platform/media artifact.

Template intent:

```text
Create a platform-format preview that resembles the named media output through aspect logic, UI-like framing, crop, density, visual rhythm, and presentation style. Do not use real platform logos.
```

Failure modes:

1. real logo appears;
2. platform cue unclear;
3. looks like generic poster.

### 6.32 真實性 / 缺陷控制

Preview target: realism/imperfection demonstration.

Template intent:

```text
Create a controlled realism or imperfection preview where the named anti-polish detail is visible but not ugly: natural skin, mild asymmetry, lived-in detail, sensor imperfection, or non-studio quality.
```

Failure modes:

1. image becomes low quality;
2. defect too subtle;
3. defect contradicts polished ACG rendering.

### 6.33 後期處理

Preview target: final processing treatment.

Template intent:

```text
Create a post-processing preview where the final grade, border, compression, grain, vignette, leak, sharpening, softness, or platform treatment is the main subject.
```

Failure modes:

1. treatment invisible;
2. effect destroys image;
3. confused with lens texture.

### 6.34 Negative Atom

Preview target: generally no normal beauty preview.

Recommendation:

Negative atoms should not be generated as standard attractive previews by default. They represent exclusions, not desired content.

Preferred options:

1. no preview image, show a neutral icon/card state;
2. create a controlled "avoid this issue" educational diagram only if UI needs it;
3. never create a desirable image of the negative artifact.

Template intent if generation is required:

```text
Create a clean instructional preview that communicates an avoided failure mode without making it appealing. Use simple abstract or diagram-like framing, not a polished character portrait.
```

Failure modes:

1. generating the exact unwanted defect as attractive content;
2. confusing users by making negative content look selectable as a positive visual style.

### 6.35 尺寸

Preview target: aspect-ratio frame guide.

Recommendation:

Generate only if UI needs visual ratio examples. Otherwise a native UI ratio icon may be better than an AI image.

Template intent:

```text
Create a clean aspect-ratio frame preview showing the named crop shape and safe composition boundaries. Use simple abstract content.
```

Failure modes:

1. model ignores exact ratio;
2. ratio guide looks like content style rather than size control.

### 6.36 質量

Preview target: quality/fidelity example.

Recommendation:

Generate only if UI needs visual quality examples. Otherwise a native quality icon/state may be clearer.

Template intent:

```text
Create a clean quality/fidelity preview that demonstrates sharp but natural detail, controlled edges, and polished finish without adding a new subject concept.
```

Failure modes:

1. quality atom becomes generic beautiful image;
2. users mistake it for a style atom.

## 7. Sampling Plan Before Full Batch

Do not run all 785 previews first.

Recommended first sample set: 72 images.

Sampling:

1. 2 atoms per category for 36 categories.
2. For one-count categories, sample the only atom once and use the extra slot on high-risk categories.
3. High-risk categories for extra sampling:
   - 人設
   - 互動行為
   - 上裝
   - 場景
   - 寫真風格
   - 文本元素
   - Negative Atom

Sample acceptance threshold:

1. at least 85% pass without regeneration;
2. no category has 2 consecutive semantic mismatch failures;
3. all high-risk categories have at least one approved preview.

If any category fails repeatedly, stop that category and revise its compiler template before generating more.

## 8. QA Rubric

Each generated preview gets one of four statuses:

1. `approved`
2. `regenerate`
3. `compiler-fix-required`
4. `do-not-generate`

Judge with these criteria:

| Criterion | Pass Standard |
| --- | --- |
| Concept match | The atom title/category is visually identifiable without reading long text. |
| Category focus | The image focuses on the category's control surface. |
| Visual quality | 2.5D/ACG/semi-realistic quality is polished and not cheap. |
| Thumbnail readability | The image remains readable in a card grid. |
| Non-drift | The result does not collapse into a generic pretty portrait. |
| Safety/cleanliness | No logos, celebrity likeness, random text, malformed bodies, or unwanted artifacts. |

## 9. Manifest / Storage Design

Recommended storage shape:

```text
data/uploads/atom-previews/<atomId>/<promptHash>.png
```

Manifest should track:

1. `atomId`
2. `category`
3. `title`
4. `sourcePromptHash`
5. `previewPromptHash`
6. `previewPrompt`
7. `provider`
8. `model`
9. `filePath`
10. `previewImagePath`
11. `generatedAt`
12. `qaStatus`
13. `qaNotes`

Reason:

1. avoids browser cache confusion after prompt edits;
2. makes stale previews detectable;
3. supports rejected image debugging;
4. allows future regeneration only when source prompt or compiler changes.

## 10. Batch Generation Gates

Full generation may start only after:

1. this design is approved;
2. the compiler implementation has a dry-run output for all categories;
3. 36-72 sampled previews pass manual QA;
4. storage/manifest behavior is verified;
5. no old preview path cache remains in DB or UI.

Recommended rollout:

1. Design approval.
2. Implement compiler dry-run only.
3. Review dry-run preview prompts for 36 categories.
4. Generate 72-image sample.
5. Manual QA.
6. Generate 100-image batch.
7. Verify UI cards.
8. Generate remaining previews.
9. Final manifest/report.

## 11. Open Questions

1. Should `Negative Atom`, `尺寸`, and `質量` use AI-generated previews or native UI icons?
2. Should rejected images be retained locally for debug or deleted immediately after QA?
3. Should QA status be stored only in manifest, or also surfaced in the app UI later?

## 12. Current Status

- [x] Current atom count verified: 785.
- [x] Prompt quality audit report found and reviewed.
- [x] Design draft created.
- [x] P0 dry-run compiler scope approved by implementation request on 2026-06-07.
- [x] Compiler implementation complete: 785 approved atoms can compile into provider-ready preview prompts without calling an image provider.
- [x] All 36 categories have explicit category-specific preview templates.
- [x] Dry-run prompt review tooling available for specified IDs and per-category samples.
- [x] P0 tests added for internal term filtering, 36-template coverage, Negative Atom / size / quality handling, dry-run provider isolation, and banned global wording.
- [x] Fresh verification complete on 2026-06-07 HKT: `npm test`, `npm run lint`, `npm run build`.
- [x] CLI dry-run smoke test complete: `npm run generate:atom-previews -- --dry-run --sample-per-category` planned 36 preview prompt samples and did not generate images.
- [x] P1 sample generation started on 2026-06-07 HKT with 67 controlled sample prompts and no full-library generation.
- [x] P1 provider model id corrected from `GPT-Image-2` to `gpt-image-2` after the uppercase id returned HTTP 503 `model_not_found`.
- [x] P1 image generation complete: 67 sample images exist, no full-library generation was performed.
- [x] P1 QA complete: 67 approved, 0 regenerate, 0 compiler-fix-required, 0 do-not-generate.
- [x] P1 QA report written: `docs/reports/2026-06-07-preview-prompt-p1-qa-report.md`.
