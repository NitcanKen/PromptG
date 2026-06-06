import { NextResponse } from "next/server";

import { deleteAtom, updateAtom } from "@/lib/db/queries/atoms";
import { atomUpdateSchema } from "@/lib/validation/atoms";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = atomUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "素材內容不合法", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const atom = await updateAtom(id, parsed.data);

  if (!atom) {
    return NextResponse.json({ error: "找不到素材" }, { status: 404 });
  }

  return NextResponse.json({ atom });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteAtom(id);

  if (!deleted) {
    return NextResponse.json({ error: "找不到素材" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
