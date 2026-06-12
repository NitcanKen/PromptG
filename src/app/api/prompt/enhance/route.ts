import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { enhancePromptWithMimo } from "@/lib/hermes/enhancer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const result = await enhancePromptWithMimo(body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ...result.data,
      model: result.model,
      durationMs: result.durationMs,
      tokenUsage: result.tokenUsage,
      cost: result.cost,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Hermes 增強請求不合法", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Hermes 增強失敗：${error.message}`
            : "Hermes 增強失敗，請稍後再試",
      },
      { status: 502 },
    );
  }
}
