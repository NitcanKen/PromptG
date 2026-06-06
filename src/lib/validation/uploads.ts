const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const maxFileSize = 5 * 1024 * 1024;

export function getUploadExtension(mimeType: string) {
  return allowedMimeTypes.get(mimeType);
}

export function validateUploadFileMetadata({
  type,
  size,
}: {
  type: string;
  size: number;
}):
  | { ok: true; extension: string }
  | { ok: false; error: string } {
  const extension = getUploadExtension(type);

  if (!extension) {
    return { ok: false, error: "只支援 JPG、PNG、WebP 或 GIF 圖片" };
  }

  if (size > maxFileSize) {
    return { ok: false, error: "圖片大小不可超過 5MB" };
  }

  return { ok: true, extension };
}
