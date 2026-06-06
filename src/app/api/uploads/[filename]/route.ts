import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "data", "uploads");
const mimeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

type RouteContext = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;

  if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/i.test(filename)) {
    return NextResponse.json({ error: "圖片路徑不合法" }, { status: 400 });
  }

  const diskPath = path.join(uploadDir, filename);
  const data = await fs.readFile(diskPath).catch(() => null);

  if (!data) {
    return NextResponse.json({ error: "找不到圖片" }, { status: 404 });
  }

  const extension = path.extname(filename).toLowerCase();

  return new NextResponse(data, {
    headers: {
      "Content-Type": mimeByExtension[extension] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
