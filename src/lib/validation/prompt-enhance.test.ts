import { describe, expect, it } from "vitest";

import {
  enhancePromptRequestSchema,
  hermesEnhancementPresetSchema,
  hermesOutputStyleSchema,
  hermesPromptOutputSchema,
} from "@/lib/validation/prompt-enhance";
import {
  HERMES_ENHANCEMENT_PRESETS,
  HERMES_OUTPUT_STYLES,
} from "@/lib/hermes/options";

describe("enhancePromptRequestSchema", () => {
  it("accepts selected atoms, raw prompt text, size, quality, and model", () => {
    const request = enhancePromptRequestSchema.parse({
      selectedAtoms: {
        人設: [
          {
            category: "人設",
            title: "柔和人像",
            prompt: "soft editorial portrait of an adult woman",
            negativePrompt: "plastic skin",
            priority: "core",
          },
        ],
      },
      rawCompiledPrompt: "soft editorial portrait of an adult woman, 尺寸：1:1｜1024×1024｜方圖",
      rawNegativePrompt: "plastic skin",
      sizePreset: "1-1-1024",
      qualityPreset: "high",
      model: "mimo-v2.5-pro",
    });

    expect(request.selectedAtoms["人設"]?.[0].title).toBe("柔和人像");
    expect(request.rawCompiledPrompt).toContain("adult woman");
    expect(request.rawNegativePrompt).toBe("plastic skin");
  });

  it("accepts P1 preset, output style, and bounded user instruction controls", () => {
    const request = enhancePromptRequestSchema.parse({
      selectedAtoms: {},
      rawCompiledPrompt: "adult character portrait, soft daylight",
      preset: "fashion-editorial",
      outputStyle: "english",
      userInstruction: "更像高級雜誌封面，但保留自然皮膚質感。",
    });

    expect(request.preset).toBe("fashion-editorial");
    expect(request.outputStyle).toBe("english");
    expect(request.userInstruction).toBe("更像高級雜誌封面，但保留自然皮膚質感。");
  });

  it("exposes the required Hermes preset and output style choices", () => {
    expect(HERMES_ENHANCEMENT_PRESETS.map((preset) => preset.label)).toEqual([
      "克制高級",
      "時尚 editorial",
      "角色美術感",
      "寫實社群自拍",
    ]);
    expect(HERMES_OUTPUT_STYLES.map((style) => style.label)).toEqual([
      "中文 final prompt",
      "English final prompt",
      "mixed technical prompt",
    ]);

    for (const preset of HERMES_ENHANCEMENT_PRESETS) {
      expect(hermesEnhancementPresetSchema.parse(preset.id)).toBe(preset.id);
    }

    for (const style of HERMES_OUTPUT_STYLES) {
      expect(hermesOutputStyleSchema.parse(style.id)).toBe(style.id);
    }
  });
});

describe("hermesPromptOutputSchema", () => {
  it("requires layered prompt text, notes, and a bounded risk level", () => {
    const output = hermesPromptOutputSchema.parse({
      positivePrompt:
        "adult subject, coherent editorial portrait, natural anatomy, layered wardrobe, controlled light",
      negativePrompt: "underage, explicit nudity, distorted hands",
      rewriteNotes: ["整合主體、服裝、鏡頭與光影，移除原子拼接感。"],
      riskNotes: ["維持成年、得體、非低俗邊界。"],
      qualityNotes: ["補強構圖、材質與手部品質控制。"],
      riskLevel: "low",
    });

    expect(output.riskLevel).toBe("low");
    expect(output.rewriteNotes).toHaveLength(1);
  });
});
