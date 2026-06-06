import { describe, expect, it } from "vitest";

import {
  getUploadExtension,
  validateUploadFileMetadata,
} from "@/lib/validation/uploads";

describe("upload validation", () => {
  it("accepts supported image files and returns the normalized extension", () => {
    expect(getUploadExtension("image/png")).toBe("png");
    expect(validateUploadFileMetadata({ type: "image/webp", size: 1024 })).toEqual({
      ok: true,
      extension: "webp",
    });
  });

  it("rejects non-image files", () => {
    expect(validateUploadFileMetadata({ type: "text/plain", size: 100 })).toEqual({
      ok: false,
      error: "只支援 JPG、PNG、WebP 或 GIF 圖片",
    });
  });

  it("rejects files larger than 5MB", () => {
    expect(
      validateUploadFileMetadata({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 }),
    ).toEqual({
      ok: false,
      error: "圖片大小不可超過 5MB",
    });
  });
});
