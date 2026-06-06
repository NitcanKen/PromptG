import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const atomPreviewDir = path.join(process.cwd(), "data", "uploads", "atom-previews");
const mimeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type RouteContext = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;

  if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(filename)) {
    return NextResponse.json({ error: "圖片路徑不合法" }, { status: 400 });
  }

  const diskPath = path.join(atomPreviewDir, filename);
  const data = await fs.readFile(diskPath).catch(() => null);

  if (!data) {
    return NextResponse.json({ error: "找不到圖片" }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": mimeByExtension[path.extname(filename).toLowerCase()] ?? "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
