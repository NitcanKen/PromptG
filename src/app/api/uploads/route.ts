import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "data", "uploads");
const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);
const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "請選擇圖片檔案" }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "只支援 JPG、PNG、WebP 或 GIF 圖片" }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "圖片大小不可超過 5MB" }, { status: 400 });
  }

  await fs.mkdir(uploadDir, { recursive: true });
  const extension = allowedMimeTypes.get(file.type);
  const filename = `${randomUUID()}.${extension}`;
  const diskPath = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(diskPath, bytes);

  return NextResponse.json({
    path: `/api/uploads/${filename}`,
    filename,
  });
}
