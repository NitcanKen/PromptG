import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { parsePromptWithMimo } from "@/lib/mimo/parser";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const result = await parsePromptWithMimo(body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      items: result.data.items,
      model: result.model,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Prompt 拆解請求不合法", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Mimo 拆解失敗：${error.message}`
            : "Mimo 拆解失敗，請稍後再試",
      },
      { status: 502 },
    );
  }
}
