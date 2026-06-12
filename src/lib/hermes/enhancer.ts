import { CATEGORY_METADATA, QUALITY_PRESETS, SIZE_PRESETS } from "@/lib/constants";
import {
  enhancePromptRequestSchema,
  hermesPromptOutputSchema,
  type EnhancePromptRequest,
  type HermesPromptOutput,
} from "@/lib/validation/prompt-enhance";

const defaultBaseUrl = "https://token-plan-sgp.xiaomimimo.com/v1";

type MimoCompletionBody = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

export type EnhancePromptResult =
  | {
      ok: true;
      status: 200;
      data: HermesPromptOutput;
      model: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

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

export function buildHermesSystemPrompt() {
  const categoryGuidance = CATEGORY_METADATA.map(
    (category) =>
      `- ${category.label}: ${category.description} (${category.examples.join("、")})`,
  ).join("\n");

  return [
    "你是 Hermes Prompt Agent，只負責把 PromptG 的 selected atoms 改寫成 final prompt text。",
    "你不生成圖片、不產圖、不要呼叫或描述任何圖片生成 API，也不要提及 GPT-Image-2、Gemini image、Nano Banana 或其他生圖供應商。",
    "你的任務是 whole-intent prompt writing，不是敏感詞替換器，也不是逐字翻譯器。",
    "採用 layered prompt assembly：先理解整體意圖，再重組主體、人設、臉部、髮型、姿態、手部、服裝、道具、場景、光影、色彩、鏡頭、構圖、媒介、材質、品質與負面限制。",
    "輸出的 positivePrompt 應該像一段可直接使用的高品質 final prompt，避免保留原子拼接痕跡、分類標題或重複語句。",
    "保留使用者明確選擇的角色與風格，但全局保持成年、得體、非低俗，不寫未成年性化、明確成人內容、露骨色情或剝削性描述。",
    "動漫角色不需要額外保守策略；只套用同一個全局成年與得體邊界。",
    "negativePrompt 應整合原本的 rawNegativePrompt、atom negativePrompt 與品質/安全排除項，不要把正向創作意圖塞進 negativePrompt。",
    "所有 notes 必須使用繁體中文，簡短指出改寫策略、風險邊界與品質補強。",
    "只輸出 JSON，不要 Markdown，不要額外說明。",
    "JSON schema:",
    '{"positivePrompt":"string","negativePrompt":"string","rewriteNotes":["繁體中文"],"riskNotes":["繁體中文"],"qualityNotes":["繁體中文"],"riskLevel":"low|medium|high"}',
    "PromptG category guidance:",
    categoryGuidance,
  ].join("\n");
}

function summarizePreset<T extends { id: string; label: string; promptText: string }>(
  presets: readonly T[],
  id: string,
) {
  const preset = presets.find((item) => item.id === id);
  return preset ? `${preset.id}｜${preset.label}｜${preset.promptText}` : id;
}

function buildHermesUserPrompt(request: EnhancePromptRequest, repairText?: string) {
  const payload = {
    selectedAtoms: request.selectedAtoms,
    rawCompiledPrompt: request.rawCompiledPrompt,
    rawNegativePrompt: request.rawNegativePrompt,
    sizePreset: summarizePreset(SIZE_PRESETS, request.sizePreset),
    qualityPreset: summarizePreset(QUALITY_PRESETS, request.qualityPreset),
  };

  if (repairText) {
    return [
      "上一輪輸出不是合法 Hermes JSON 或不符合 schema。請修復為指定 JSON 格式，只輸出 JSON。",
      "原始輸入:",
      JSON.stringify(payload, null, 2),
      "上一輪輸出:",
      repairText,
    ].join("\n\n");
  }

  return [
    "請把以下 PromptG selected atoms 與 raw compiled prompt 改寫成高品質 final prompt text。",
    "必須保留整體意圖，處理衝突、去重、分層組裝，並輸出 schema-valid JSON。",
    JSON.stringify(payload, null, 2),
  ].join("\n\n");
}

async function requestMimo({
  apiKey,
  baseUrl,
  model,
  request,
  repairText,
}: {
  apiKey: string;
  baseUrl: string;
  model: string;
  request: EnhancePromptRequest;
  repairText?: string;
}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildHermesSystemPrompt() },
        { role: "user", content: buildHermesUserPrompt(request, repairText) },
      ],
      temperature: repairText ? 0.1 : 0.35,
      response_format: { type: "json_object" },
    }),
  });

  const body = (await response.json().catch(() => null)) as MimoCompletionBody | null;

  if (!response.ok) {
    throw new Error(body?.error?.message || `Mimo API 回應失敗 (${response.status})`);
  }

  const content = body?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Mimo 沒有回傳可解析內容");
  }

  return content;
}

function parseHermesJson(content: string): HermesPromptOutput {
  const json = JSON.parse(extractJson(content)) as unknown;
  return hermesPromptOutputSchema.parse(json);
}

export async function enhancePromptWithMimo(input: unknown): Promise<EnhancePromptResult> {
  const request = enhancePromptRequestSchema.parse(input);
  const apiKey = process.env.XIAOMI_MIMO_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      error: "缺少 XIAOMI_MIMO_API_KEY，請在 .env.local 設定後再使用 Hermes 增強 Prompt。",
    };
  }

  const baseUrl = process.env.XIAOMI_MIMO_BASE_URL || defaultBaseUrl;
  const model = request.model || process.env.XIAOMI_MIMO_MODEL || "mimo-v2.5-pro";
  const first = await requestMimo({ apiKey, baseUrl, model, request });

  try {
    return { ok: true, status: 200, data: parseHermesJson(first), model };
  } catch {
    const repaired = await requestMimo({ apiKey, baseUrl, model, request, repairText: first });

    try {
      return { ok: true, status: 200, data: parseHermesJson(repaired), model };
    } catch {
      return {
        ok: false,
        status: 502,
        error: "Mimo 回傳內容無法通過 Hermes Prompt 格式驗證，請調整素材或稍後重試。",
      };
    }
  }
}
