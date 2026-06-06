import { describe, expect, it } from "vitest";

import {
  parsePromptRequestSchema,
  parsedPromptOutputSchema,
} from "@/lib/validation/prompt-parse";

describe("prompt parse validation", () => {
  it("defaults to the pro Mimo model", () => {
    expect(
      parsePromptRequestSchema.parse({
        prompt: "soft portrait, warm window light",
      }).model,
    ).toBe("mimo-v2.5-pro");
  });

  it("accepts editable parsed atom drafts", () => {
    const parsed = parsedPromptOutputSchema.parse({
      items: [
        {
          category: "光影",
          title: "暖窗光",
          subtitle: "柔和窗邊自然光",
          prompt: "warm soft window light",
          negativePrompt: "",
          tags: ["暖光", "自然光"],
          notes: "由 warm window light 拆出",
        },
      ],
    });

    expect(parsed.items[0].category).toBe("光影");
  });

  it("accepts v2 parser categories including Negative Atom but still rejects unknown labels", () => {
    const parsed = parsedPromptOutputSchema.parse({
      items: [
        {
          category: "髮型",
          title: "空氣瀏海",
          subtitle: "輕盈柔軟的瀏海輪廓",
          prompt: "airy bangs, soft hair silhouette",
          tags: ["髮型"],
        },
        {
          category: "Negative Atom",
          title: "不要錯誤手指",
          subtitle: "排除手部結構錯誤",
          prompt: "extra fingers, malformed hands, fused fingers",
          tags: ["負面"],
        },
      ],
    });

    expect(parsed.items.map((item) => item.category)).toEqual(["髮型", "Negative Atom"]);
  });

  it("rejects unknown categories and overlong tags", () => {
    expect(() =>
      parsedPromptOutputSchema.parse({
        items: [
          {
            category: "錯誤分類",
            title: "測試",
            subtitle: "測試",
            prompt: "test",
            negativePrompt: "",
            tags: Array.from({ length: 9 }, (_, index) => `標籤${index}`),
            notes: "",
          },
        ],
      }),
    ).toThrow();
  });
});
