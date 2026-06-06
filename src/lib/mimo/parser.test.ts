import { afterEach, describe, expect, it } from "vitest";

import { parsePromptWithMimo } from "@/lib/mimo/parser";

const originalApiKey = process.env.XIAOMI_MIMO_API_KEY;

afterEach(() => {
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
});
