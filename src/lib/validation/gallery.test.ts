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

  it("keeps update payloads partial", () => {
    expect(galleryUpdateSchema.parse({ title: "新標題" })).toEqual({
      title: "新標題",
    });
  });
});
