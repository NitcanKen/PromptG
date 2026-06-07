# Preview Prompt P1 QA Report

Date: 2026-06-07 HKT

## Summary

P1 completed the first controlled preview-image sample run after confirming the P0 preview prompt compiler tests passed.

The first attempt with `ATOM_PREVIEW_MODEL=GPT-Image-2` failed because the provider returned HTTP 503 `model_not_found`. Per user direction, the sample run was retried with `ATOM_PREVIEW_MODEL=gpt-image-2`, which succeeded. The local `.env.local` model id was updated to `gpt-image-2` so future runs use the working provider model id.

| Metric | Count |
| --- | ---: |
| Planned sample prompts | 67 |
| Final sample image files | 67 |
| Generated during final sample run | 66 |
| Skipped existing from one-image probe | 1 |
| Failed final sample requests | 0 |
| Full-library generation performed | 0 |

P1 stayed within the 36-72 sample limit and did not run the 785-image full library.

## Provider / Model

| Field | Value |
| --- | --- |
| Provider path | PromptG `ATOM_PREVIEW_*` OpenAI-compatible image client |
| Base URL | `https://token.mmh1.top` |
| Working model id | `gpt-image-2` |
| Manifest | `data/uploads/atom-previews/manifest.json` |
| Successful run log | `data/uploads/atom-previews/logs/2026-06-07T12-58-28-389Z.jsonl` |

No API key is recorded in this report, manifest, or log.

## P0 Gate

P0 gate was checked before generation:

```bash
npm test -- src/lib/gemini/atom-preview-prompt-compiler.test.ts src/lib/gemini/atom-preview-generator.test.ts
```

Observed result: 2 test files passed, 20 tests passed.

All samples used `buildAtomPreviewPrompt()` from the P0 preview prompt compiler. The manifest records `previewPrompt`, `sourcePromptHash`, and `previewPromptHash` for each sample.

## Manifest / Storage

The final manifest has 67 entries and all required P1 fields are present:

```json
{
  "entries": 67,
  "status": {
    "skipped_existing": 1,
    "generated": 66
  },
  "qa": {
    "approved": 67
  },
  "model": {
    "gpt-image-2": 67
  },
  "missingRequired": []
}
```

Images are stored in hash-addressed paths:

```text
data/uploads/atom-previews/<atomId>/<previewPromptHash>.png
```

The app also has a nested serving route:

```text
/api/uploads/atom-previews/<atomId>/<previewPromptHash>.png
```

## QA Status Counts

| QA status | Count | Reason |
| --- | ---: | --- |
| approved | 67 | Passed P1 visual QA rubric. |
| regenerate | 0 | No sample needed regeneration in this pass. |
| compiler-fix-required | 0 | No category produced two semantic mismatches. |
| do-not-generate | 0 | Negative Atom generated as an educational avoid-type diagram, not a normal beauty preview. |

Pass rate: 100%.

## Category Results

| Category | Attempted | Images | approved | regenerate | compiler-fix-required | do-not-generate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 人設 | 2 | 2 | 2 | 0 | 0 | 0 |
| 臉部特徵 | 2 | 2 | 2 | 0 | 0 | 0 |
| 髮型 | 2 | 2 | 2 | 0 | 0 | 0 |
| 表情 | 2 | 2 | 2 | 0 | 0 | 0 |
| 視線 | 2 | 2 | 2 | 0 | 0 | 0 |
| 姿態 | 2 | 2 | 2 | 0 | 0 | 0 |
| 手部動作 | 2 | 2 | 2 | 0 | 0 | 0 |
| 身體構圖 | 2 | 2 | 2 | 0 | 0 | 0 |
| 主體數量 / 人物關係 | 2 | 2 | 2 | 0 | 0 | 0 |
| 上裝 | 2 | 2 | 2 | 0 | 0 | 0 |
| 下裝 | 2 | 2 | 2 | 0 | 0 | 0 |
| 鞋履 | 2 | 2 | 2 | 0 | 0 | 0 |
| 配飾 | 2 | 2 | 2 | 0 | 0 | 0 |
| 道具 | 2 | 2 | 2 | 0 | 0 | 0 |
| 妝容 | 2 | 2 | 2 | 0 | 0 | 0 |
| 場景 | 2 | 2 | 2 | 0 | 0 | 0 |
| 場景細節 | 2 | 2 | 2 | 0 | 0 | 0 |
| 互動行為 | 2 | 2 | 2 | 0 | 0 | 0 |
| 時間 / 季節 / 天氣 | 2 | 2 | 2 | 0 | 0 | 0 |
| 光影 | 2 | 2 | 2 | 0 | 0 | 0 |
| 色彩系統 | 2 | 2 | 2 | 0 | 0 | 0 |
| 寫真風格 | 2 | 2 | 2 | 0 | 0 | 0 |
| 鏡頭角度 | 2 | 2 | 2 | 0 | 0 | 0 |
| 鏡頭質感 | 2 | 2 | 2 | 0 | 0 | 0 |
| 景別 | 2 | 2 | 2 | 0 | 0 | 0 |
| 構圖規則 | 2 | 2 | 2 | 0 | 0 | 0 |
| 材質 | 1 | 1 | 1 | 0 | 0 | 0 |
| 畫面影響 | 2 | 2 | 2 | 0 | 0 | 0 |
| 版式設計 | 2 | 2 | 2 | 0 | 0 | 0 |
| 文本元素 | 2 | 2 | 2 | 0 | 0 | 0 |
| 平台媒介 | 2 | 2 | 2 | 0 | 0 | 0 |
| 真實性 / 缺陷控制 | 1 | 1 | 1 | 0 | 0 | 0 |
| 後期處理 | 2 | 2 | 2 | 0 | 0 | 0 |
| Negative Atom | 1 | 1 | 1 | 0 | 0 | 0 |
| 尺寸 | 1 | 1 | 1 | 0 | 0 | 0 |
| 質量 | 1 | 1 | 1 | 0 | 0 | 0 |

## Sample List

- 人設: `seed-persona-soft-cinematic`, `library-persona-01`
- 臉部特徵: `seed-face-droopy-eyes`, `library-face-01`
- 髮型: `seed-hair-airy-bangs`, `library-hair-curtain-bangs`
- 表情: `seed-expression-playful-smile`, `library-expression-01`
- 視線: `seed-eye-direct-camera`, `library-gaze-01`
- 姿態: `seed-pose-mirror-selfie`, `library-pose-01`
- 手部動作: `seed-hand-cheek`, `library-hand-01`
- 身體構圖: `seed-body-bust-framing`, `library-body-framing-01`
- 主體數量 / 人物關係: `seed-subject-solo`, `library-relationship-01`
- 上裝: `seed-top-cropped-knit-cardigan`, `library-top-01`
- 下裝: `seed-bottom-pleated-mini-skirt`, `library-bottom-01`
- 鞋履: `seed-shoes-platform-sneakers`, `library-shoes-01`
- 配飾: `seed-accessory-silver-hoops`, `library-accessory-01`
- 道具: `seed-prop-phone-in-hand`, `library-prop-01`
- 妝容: `seed-makeup-soft-idol`, `library-makeup-01`
- 場景: `seed-scene-cozy-bedroom`, `library-scene-01`
- 場景細節: `seed-scene-detail-bedside-lamp`, `library-scene-detail-01`
- 互動行為: `seed-interaction-mirror-selfie`, `library-interaction-01`
- 時間 / 季節 / 天氣: `seed-time-rainy-night`, `library-time-weather-01`
- 光影: `seed-light-warm-window`, `library-lighting-01`
- 色彩系統: `seed-color-cool-blue-night`, `library-palette-01`
- 寫真風格: `seed-style-sns-snapshot`, `library-photo-style-01`
- 鏡頭角度: `seed-camera-selfie-arm-length`, `library-camera-angle-01`
- 鏡頭質感: `seed-lens-phone-flash`, `library-lens-texture-01`
- 景別: `seed-framing-half-body`, `library-shot-size-01`
- 構圖規則: `seed-composition-centered`, `library-composition-01`
- 材質: `seed-material-lace`
- 畫面影響: `seed-effect-subtle-film-grain`, `library-image-effect-01`
- 版式設計: `seed-layout-scrapbook-stickers`, `library-layout-01`
- 文本元素: `seed-text-japanese-small-type`, `library-text-element-01`
- 平台媒介: `seed-platform-xiaohongshu-cover`, `library-platform-01`
- 真實性 / 缺陷控制: `seed-realism-natural-skin`
- 後期處理: `seed-post-low-res-compression`, `library-postprocess-01`
- Negative Atom: `seed-negative-bad-hands`
- 尺寸: `seed-size-vertical-story`
- 質量: `seed-quality-high`

## QA Rubric Application

| Rubric item | Result |
| --- | --- |
| Concept match | Pass. Each sample visibly communicates its selected atom concept at preview-card scale. |
| Category focus | Pass. Non-person categories focus on their control surface: garment, prop, scene, camera, layout, text, platform, post-processing, negative-control, size, or quality. |
| Visual quality | Pass. Samples are polished enough for first-round preview QA. |
| Thumbnail readability | Pass. The contact-sheet review showed all samples remain identifiable at small size. |
| Non-drift | Pass. The sample set did not collapse into one generic portrait pattern; environment, object, layout, camera, and control categories used different framing. |
| Safety / cleanliness | Pass. No brand logos, celebrity likenesses, watermarks, or unsafe content were identified in the sampled previews. |

## Failure Examples

No final sample image was marked `regenerate`, `compiler-fix-required`, or `do-not-generate`.

The only operational failure observed was the initial provider model id issue:

```text
ATOM_PREVIEW_MODEL=GPT-Image-2 -> HTTP 503 model_not_found
ATOM_PREVIEW_MODEL=gpt-image-2 -> successful generation
```

## Impact Assessment

Compiler change needed: no.

Atom source change needed: no.

Provider/config change needed: yes, completed locally by switching `ATOM_PREVIEW_MODEL` to `gpt-image-2`.

Proceed to next 100 images: yes, but only as a separately approved next phase. P1 itself remains limited to the 67-image controlled sample set.

## Verification

Completed for generated previews:

```bash
npm run validate:atom-previews -- --sample-per-category=2
```

Observed result:

```text
Checked: 67
Atom preview validation passed.
```
