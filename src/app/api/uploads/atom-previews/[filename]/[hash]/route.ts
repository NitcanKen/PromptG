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
    hash: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename: atomId, hash } = await context.params;

  if (!/^[a-z0-9-]+$/.test(atomId) || !/^[a-f0-9]{16,64}\.(jpg|jpeg|png|webp)$/.test(hash)) {
    return NextResponse.json({ error: "圖片路徑不合法" }, { status: 400 });
  }

  const diskPath = path.join(atomPreviewDir, atomId, hash);
  const data = await fs.readFile(diskPath).catch(() => null);

  if (!data) {
    return NextResponse.json({ error: "找不到圖片" }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": mimeByExtension[path.extname(hash).toLowerCase()] ?? "image/png",
      "Cache-Control": "no-store",
    },
  });
}
