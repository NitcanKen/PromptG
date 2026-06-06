import {
  parsePromptRequestSchema,
  parsedPromptOutputSchema,
  type ParsedPromptOutput,
} from "@/lib/validation/prompt-parse";

const defaultBaseUrl = "https://token-plan-sgp.xiaomimimo.com/v1";

function extractJson(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match?.[1]) {
    return match[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

async function requestMimo({
  apiKey,
  baseUrl,
  model,
  prompt,
  repairText,
}: {
  apiKey: string;
  baseUrl: string;
  model: string;
  prompt: string;
  repairText?: string;
}) {
  const system = [
    "你是 Prompt 素材拆解助手。",
    "只輸出 JSON，不要 Markdown。",
    "把完整圖片 Prompt 拆成可重用素材草稿。",
    "category 必須是以下之一：人設、表情、姿態、上裝、下裝、鞋履、場景、寫真風格、光影、畫面影響、版式設計、配飾、道具、鏡頭質感、景別、妝容。",
    "title、subtitle、tags、notes 使用繁體中文；prompt 可保留英文。",
  ].join("\n");

  const user = repairText
    ? [
        "上一輪輸出不是合法 JSON 或不符合 schema。請修復為指定 JSON 格式，只輸出 JSON。",
        "原始 Prompt:",
        prompt,
        "上一輪輸出:",
        repairText,
      ].join("\n\n")
    : [
        "請把以下完整圖片 Prompt 拆成素材草稿，輸出格式：",
        '{"items":[{"category":"人設","title":"短標題","subtitle":"一句效果說明","prompt":"可直接拼接進完整 Prompt 的片段","negativePrompt":"","tags":["標籤一","標籤二"],"notes":"拆解依據或使用建議"}]}',
        "每個 tags 最多 8 個，不要自動保存。",
        "完整 Prompt:",
        prompt,
      ].join("\n\n");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  const body = (await response.json().catch(() => null)) as
    | {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      }
    | null;

  if (!response.ok) {
    throw new Error(body?.error?.message || `Mimo API 回應失敗 (${response.status})`);
  }

  const content = body?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Mimo 沒有回傳可解析內容");
  }

  return content;
}

function parseMimoJson(content: string): ParsedPromptOutput {
  const json = JSON.parse(extractJson(content)) as unknown;
  return parsedPromptOutputSchema.parse(json);
}

export async function parsePromptWithMimo(input: unknown) {
  const request = parsePromptRequestSchema.parse(input);
  const apiKey = process.env.XIAOMI_MIMO_API_KEY;

  if (!apiKey) {
    return {
      ok: false as const,
      status: 400,
      error: "缺少 XIAOMI_MIMO_API_KEY，請在 .env.local 設定後再拆解 Prompt。",
    };
  }

  const baseUrl = process.env.XIAOMI_MIMO_BASE_URL || defaultBaseUrl;
  const model = request.model || process.env.XIAOMI_MIMO_MODEL || "mimo-v2.5-pro";
  const first = await requestMimo({
    apiKey,
    baseUrl,
    model,
    prompt: request.prompt,
  });

  try {
    return { ok: true as const, status: 200, data: parseMimoJson(first), model };
  } catch {
    const repaired = await requestMimo({
      apiKey,
      baseUrl,
      model,
      prompt: request.prompt,
      repairText: first,
    });

    try {
      return { ok: true as const, status: 200, data: parseMimoJson(repaired), model };
    } catch {
      return {
        ok: false as const,
        status: 502,
        error: "Mimo 回傳內容無法通過素材格式驗證，請調整 Prompt 後重試。",
      };
    }
  }
}
