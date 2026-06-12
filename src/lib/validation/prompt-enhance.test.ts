import { describe, expect, it } from "vitest";

import {
  enhancePromptRequestSchema,
  hermesPromptOutputSchema,
} from "@/lib/validation/prompt-enhance";

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
