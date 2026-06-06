import { NextResponse } from "next/server";

import { createAtom, listAtoms } from "@/lib/db/queries/atoms";
import { atomInputSchema, atomSearchSchema } from "@/lib/validation/atoms";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = atomSearchSchema.safeParse({
    category: searchParams.get("category") || undefined,
    q: searchParams.get("q") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "查詢條件不合法" }, { status: 400 });
  }

  const atoms = await listAtoms(parsed.data);
  return NextResponse.json({ atoms });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = atomInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "素材內容不合法", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const atom = await createAtom(parsed.data);
  return NextResponse.json({ atom }, { status: 201 });
}
