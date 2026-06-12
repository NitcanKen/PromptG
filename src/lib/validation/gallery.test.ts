import { describe, expect, it } from "vitest";

import { galleryInputSchema, galleryUpdateSchema } from "@/lib/validation/gallery";

const atom = {
  id: "atom-1",
  category: "人設",
  title: "柔和人像",
  subtitle: "電影感人設",
  previewImagePath: "/api/uploads/seed/soft-portrait.png",
  prompt: "soft cinematic portrait base",
  negativePrompt: "",
  tags: ["電影感"],
  notes: "適合作為人設基底",
};

describe("gallery validation", () => {
  it("accepts a gallery item with a restorable combination snapshot", () => {
    const parsed = galleryInputSchema.parse({
      title: "暖光人像組合",
      previewImagePath: "",
      prompt: "soft cinematic portrait base, warm window light",
      sizePreset: "2-3-1536",
      qualityPreset: "high",
      tags: ["暖光", "人像"],
      notes: "常用組合",
      combinationSnapshot: {
        selectedAtoms: {
          人設: [atom],
        },
        sizePreset: "2-3-1536",
        qualityPreset: "high",
      },
    });

    expect(parsed.combinationSnapshot?.selectedAtoms["人設"]?.[0]?.title).toBe(
      "柔和人像",
    );
    expect(parsed.combinationSnapshot?.selectedAtoms["人設"]?.[0]?.priority).toBe(
      "medium",
    );
    expect(parsed.combinationSnapshot?.selectedAtoms["人設"]?.[0]?.lockPolicy).toBe(
      "normal",
    );
  });

  it("accepts Hermes prompt provenance without image-generation artifacts", () => {
    const parsed = galleryInputSchema.parse({
      title: "Hermes 增強 Prompt",
      prompt: "adult editorial portrait, controlled light, refined styling",
      sizePreset: "1-1-1024",
      qualityPreset: "high",
      hermesProvenance: {
        rawPrompt: "soft portrait, white blouse, window light",
        enhancedPrompt: "adult editorial portrait, controlled light, refined styling",
        negativePrompt: "underage, explicit nudity, distorted hands",
        preset: "時尚 editorial",
        outputStyle: "mixed technical prompt",
        userInstruction: "保留自然皮膚質感。",
        model: "mimo-v2.5-pro",
        rewriteNotes: ["重組主體、造型、光影與鏡頭層次。"],
        riskNotes: ["保持成年、得體、非低俗。"],
        qualityNotes: ["補強自然手部與構圖平衡。"],
        createdAt: "2026-06-12T14:30:00.000Z",
      },
    });

    expect(parsed.hermesProvenance?.enhancedPrompt).toContain("adult editorial portrait");
    expect(parsed.hermesProvenance?.model).toBe("mimo-v2.5-pro");
  });

  it("keeps update payloads partial", () => {
    expect(galleryUpdateSchema.parse({ title: "新標題" })).toEqual({
      title: "新標題",
    });
  });
});
