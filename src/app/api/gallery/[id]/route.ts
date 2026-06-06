import { NextResponse } from "next/server";

import {
  deleteGalleryItem,
  updateGalleryItem,
} from "@/lib/db/queries/gallery";
import { galleryUpdateSchema } from "@/lib/validation/gallery";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = galleryUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Gallery 內容不合法", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const item = await updateGalleryItem(id, parsed.data);

  if (!item) {
    return NextResponse.json({ error: "找不到 Gallery 項目" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteGalleryItem(id);

  if (!deleted) {
    return NextResponse.json({ error: "找不到 Gallery 項目" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
