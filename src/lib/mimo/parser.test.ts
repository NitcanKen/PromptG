import { afterEach, describe, expect, it, vi } from "vitest";

import { parsePromptWithMimo } from "@/lib/mimo/parser";
import { buildMimoParserSystemPrompt } from "@/lib/mimo/parser";
import { CATEGORIES, CATEGORY_METADATA } from "@/lib/constants";

const originalApiKey = process.env.XIAOMI_MIMO_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();

  if (originalApiKey) {
    process.env.XIAOMI_MIMO_API_KEY = originalApiKey;
  } else {
    delete process.env.XIAOMI_MIMO_API_KEY;
  }
});

describe("parsePromptWithMimo", () => {
  it("returns a readable local configuration error when the API key is missing", async () => {
    delete process.env.XIAOMI_MIMO_API_KEY;

    const result = await parsePromptWithMimo({
      prompt: "soft portrait, warm window light",
      model: "mimo-v2.5-pro",
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      error: "缺少 XIAOMI_MIMO_API_KEY，請在 .env.local 設定後再拆解 Prompt。",
    });
  });

  it("parses v2 categories returned by Mimo including Negative Atom", async () => {
    process.env.XIAOMI_MIMO_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                items: [
                  {
                    category: "髮型",
                    title: "空氣瀏海",
                    subtitle: "輕盈柔軟的瀏海輪廓",
                    prompt: "airy bangs, soft hair silhouette",
                    negativePrompt: "helmet hair",
                    tags: ["髮型"],
                    notes: "由 hair prompt 拆出",
                  },
                  {
                    category: "Negative Atom",
                    title: "不要錯誤手指",
                    subtitle: "排除手部結構錯誤",
                    prompt: "extra fingers, malformed hands, fused fingers",
                    negativePrompt: "",
                    tags: ["負面"],
                    notes: "由 negative prompt 拆出",
                  },
                ],
              }),
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await parsePromptWithMimo({
      prompt: "portrait with airy bangs --no extra fingers",
      model: "mimo-v2.5-pro",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.items.map((item) => item.category)).toEqual(["髮型", "Negative Atom"]);
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(requestBody.messages[0].content).toContain(
      `category 必須是以下之一：${CATEGORIES.join("、")}`,
    );
  });

  it("builds parser category instructions from shared category metadata", () => {
    const systemPrompt = buildMimoParserSystemPrompt();

    expect(systemPrompt).toContain(`category 必須是以下之一：${CATEGORIES.join("、")}`);

    for (const category of CATEGORY_METADATA) {
      expect(systemPrompt).toContain(category.label);
      expect(systemPrompt).toContain(category.description);
      expect(systemPrompt).toContain(category.examples[0]);
    }

    expect(systemPrompt).toContain("可重用的負面約束請使用 Negative Atom");
    expect(systemPrompt).toContain("否則不要輸出「尺寸」或「質量」素材");
    expect(systemPrompt).toContain("不要把髮型、臉部特徵、表情、視線、姿態、手部動作混在同一個");
    expect(systemPrompt).toContain("除非原始 Prompt 明確包含尺寸、比例、解析度或品質控制");
  });
});
