import { describe, expect, it } from "vitest";

import { atomInputSchema, atomUpdateSchema } from "@/lib/validation/atoms";

describe("atomInputSchema", () => {
  it("applies safe defaults for optional atom fields", () => {
    expect(
      atomInputSchema.parse({
        category: "人設",
        title: "柔和人像",
        prompt: "soft portrait base",
      }),
    ).toEqual({
      category: "人設",
      title: "柔和人像",
      subtitle: "",
      previewImagePath: "",
      prompt: "soft portrait base",
      negativePrompt: "",
      tags: [],
      notes: "",
    });
  });

  it("rejects unknown categories and excessive tags", () => {
    expect(() =>
      atomInputSchema.parse({
        category: "錯誤分類",
        title: "測試",
        prompt: "test prompt",
        tags: Array.from({ length: 13 }, (_, index) => `標籤${index}`),
      }),
    ).toThrow();
  });
});

describe("atomUpdateSchema", () => {
  it("does not inject create defaults into partial updates", () => {
    expect(atomUpdateSchema.parse({ title: "更新標題" })).toEqual({
      title: "更新標題",
    });
  });
});
