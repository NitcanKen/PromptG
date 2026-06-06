import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { validateUploadFileMetadata } from "@/lib/validation/uploads";

const uploadDir = path.join(process.cwd(), "data", "uploads");

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "請選擇圖片檔案" }, { status: 400 });
  }

  const validation = validateUploadFileMetadata({ type: file.type, size: file.size });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${randomUUID()}.${validation.extension}`;
  const diskPath = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(diskPath, bytes);

  return NextResponse.json({
    path: `/api/uploads/${filename}`,
    filename,
  });
}
