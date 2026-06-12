import { afterEach, describe, expect, it, vi } from "vitest";

import { enhancePromptWithMimo, buildHermesSystemPrompt } from "@/lib/hermes/enhancer";

const originalApiKey = process.env.XIAOMI_MIMO_API_KEY;
const originalBaseUrl = process.env.XIAOMI_MIMO_BASE_URL;
const originalModel = process.env.XIAOMI_MIMO_MODEL;

afterEach(() => {
  vi.unstubAllGlobals();

  if (originalApiKey) {
    process.env.XIAOMI_MIMO_API_KEY = originalApiKey;
  } else {
    delete process.env.XIAOMI_MIMO_API_KEY;
  }

  if (originalBaseUrl) {
    process.env.XIAOMI_MIMO_BASE_URL = originalBaseUrl;
  } else {
    delete process.env.XIAOMI_MIMO_BASE_URL;
  }

  if (originalModel) {
    process.env.XIAOMI_MIMO_MODEL = originalModel;
  } else {
    delete process.env.XIAOMI_MIMO_MODEL;
  }
});

const request = {
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
    光影: [
      {
        category: "光影",
        title: "窗邊柔光",
        prompt: "soft window light",
        negativePrompt: "",
        priority: "medium",
      },
    ],
  },
  rawCompiledPrompt: "soft editorial portrait of an adult woman, soft window light",
  rawNegativePrompt: "plastic skin",
  sizePreset: "1-1-1024",
  qualityPreset: "high",
  model: "mimo-v2.5-pro",
};

const validHermesOutput = {
  positivePrompt:
    "adult woman in a coherent editorial portrait, soft window light, natural anatomy, refined wardrobe texture, balanced square composition",
  negativePrompt: "underage, explicit nudity, plastic skin, distorted hands, low quality",
  rewriteNotes: ["將素材整理成主體、光影、構圖與品質層次。"],
  riskNotes: ["保持成年、得體、非明確成人內容。"],
  qualityNotes: ["補強自然手部、皮膚材質與畫面平衡。"],
  riskLevel: "low",
};

describe("buildHermesSystemPrompt", () => {
  it("describes a whole-intent prompt writer instead of a keyword replacer or image generator", () => {
    const systemPrompt = buildHermesSystemPrompt();

    expect(systemPrompt).toContain("whole-intent");
    expect(systemPrompt).toContain("layered prompt assembly");
    expect(systemPrompt).toContain("不要呼叫或描述任何圖片生成 API");
    expect(systemPrompt).toContain("成年、得體、非低俗");
  });
});

describe("enhancePromptWithMimo", () => {
  it("returns a readable local configuration error when the API key is missing", async () => {
    delete process.env.XIAOMI_MIMO_API_KEY;

    const result = await enhancePromptWithMimo(request);

    expect(result).toEqual({
      ok: false,
      status: 400,
      error: "缺少 XIAOMI_MIMO_API_KEY，請在 .env.local 設定後再使用 Hermes 增強 Prompt。",
    });
  });

  it("parses schema-valid Hermes JSON from a fenced Mimo response", async () => {
    process.env.XIAOMI_MIMO_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: `\`\`\`json\n${JSON.stringify(validHermesOutput)}\n\`\`\``,
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await enhancePromptWithMimo(request);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.positivePrompt).toContain("coherent editorial portrait");
    expect(result.data.negativePrompt).toContain("underage");
    expect(result.model).toBe("mimo-v2.5-pro");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      response_format?: { type?: string };
      messages: Array<{ role: string; content: string }>;
    };
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[1].content).toContain("rawCompiledPrompt");
  });

  it("makes at most one repair attempt when Mimo returns invalid Hermes JSON", async () => {
    process.env.XIAOMI_MIMO_API_KEY = "test-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          choices: [{ message: { content: '{"positivePrompt":"missing fields"}' } }],
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          choices: [{ message: { content: JSON.stringify(validHermesOutput) } }],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await enhancePromptWithMimo(request);

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const repairBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)) as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(repairBody.messages[1].content).toContain("上一輪輸出不是合法 Hermes JSON");
  });

  it("returns a clear error when the repair attempt is still invalid", async () => {
    process.env.XIAOMI_MIMO_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      Response.json({
        choices: [{ message: { content: '{"positivePrompt":"missing fields"}' } }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await enhancePromptWithMimo(request);

    expect(result).toEqual({
      ok: false,
      status: 502,
      error: "Mimo 回傳內容無法通過 Hermes Prompt 格式驗證，請調整素材或稍後重試。",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
