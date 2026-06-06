import { NextResponse } from "next/server";

import {
  createGalleryItem,
  listGalleryItems,
} from "@/lib/db/queries/gallery";
import { galleryInputSchema, gallerySearchSchema } from "@/lib/validation/gallery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = gallerySearchSchema.safeParse({
    q: searchParams.get("q") || undefined,
    tag: searchParams.get("tag") || undefined,
    sort: searchParams.get("sort") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Gallery 查詢條件不合法" }, { status: 400 });
  }

  const items = await listGalleryItems(parsed.data);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = galleryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Gallery 內容不合法", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const item = await createGalleryItem(parsed.data);
  return NextResponse.json({ item }, { status: 201 });
}
