import { NextResponse } from "next/server";

import { DEFAULT_MIMO_MODEL } from "@/lib/constants";
import { getSetting, setSetting } from "@/lib/db/queries/settings";
import { mimoModelSchema } from "@/lib/validation/prompt-parse";

const settingKey = "mimo_model";

export async function GET() {
  const model = await getSetting<string>(settingKey);
  const parsed = mimoModelSchema.safeParse(model);

  return NextResponse.json({
    model: parsed.success ? parsed.data : DEFAULT_MIMO_MODEL,
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as { model?: unknown } | null;
  const parsed = mimoModelSchema.safeParse(body?.model);

  if (!parsed.success) {
    return NextResponse.json({ error: "Mimo 模型不合法" }, { status: 400 });
  }

  await setSetting(settingKey, parsed.data);
  return NextResponse.json({ model: parsed.data });
}
