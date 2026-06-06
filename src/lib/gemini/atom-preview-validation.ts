import fs from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_ATOM_PREVIEW_OUTPUT_DIR,
  selectAtomPreviewTargets,
  type AtomPreviewCliOptions,
} from "@/lib/gemini/atom-preview-generator";

type Manifest = {
  atoms?: Record<
    string,
    {
      status?: string;
      previewImagePath?: string;
      filePath?: string;
      fileSize?: number;
    }
  >;
};

type CheckedPreview = {
  atomId: string;
  filePath: string;
  previewImagePath: string;
  fileSize: number;
  width: number;
  height: number;
};

type ValidationResult = {
  ok: boolean;
  checked: CheckedPreview[];
  errors: string[];
  manifestPath: string;
};

function readPngDimensions(data: Buffer) {
  const signature = "89504e470d0a1a0a";
  if (data.subarray(0, 8).toString("hex") !== signature) {
    throw new Error("不是可辨識的 PNG 圖片");
  }

  const chunkType = data.subarray(12, 16).toString("ascii");
  if (chunkType !== "IHDR") {
    throw new Error("PNG 缺少 IHDR 區塊");
  }

  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  };
}

async function readManifest(manifestPath: string) {
  const text = await fs.readFile(manifestPath, "utf8").catch(() => "");
  if (!text) {
    return { atoms: {} } satisfies Manifest;
  }

  try {
    return JSON.parse(text) as Manifest;
  } catch {
    return { atoms: {} } satisfies Manifest;
  }
}

export async function validateAtomPreviews(
  options: Pick<AtomPreviewCliOptions, "category" | "ids" | "limit" | "outputDir"> = {},
): Promise<ValidationResult> {
  const outputDir = options.outputDir ?? DEFAULT_ATOM_PREVIEW_OUTPUT_DIR;
  const manifestPath = path.join(outputDir, "manifest.json");
  const manifest = await readManifest(manifestPath);
  const targets = selectAtomPreviewTargets(options);
  const errors: string[] = [];
  const checked: CheckedPreview[] = [];

  for (const atom of targets) {
    const filePath = path.join(outputDir, `${atom.id}.png`);
    const previewImagePath = `/api/uploads/atom-previews/${atom.id}.png`;
    const data = await fs.readFile(filePath).catch(() => null);

    if (!data) {
      errors.push(`${atom.id}.png 不存在`);
    } else if (data.byteLength === 0) {
      errors.push(`${atom.id}.png 是空檔案`);
    } else {
      try {
        const dimensions = readPngDimensions(data);
        if (dimensions.width < 1 || dimensions.height < 1) {
          errors.push(`${atom.id}.png 圖片尺寸不合法`);
        } else {
          checked.push({
            atomId: atom.id,
            filePath,
            previewImagePath,
            fileSize: data.byteLength,
            ...dimensions,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${atom.id}.png 無法 decode：${message}`);
      }
    }

    const entry = manifest.atoms?.[atom.id];
    if (!entry) {
      errors.push(`manifest 缺少 ${atom.id}`);
      continue;
    }

    if (entry.status !== "generated" && entry.status !== "skipped_existing") {
      errors.push(`manifest ${atom.id} 狀態不是 generated/skipped_existing`);
    }

    if (entry.previewImagePath !== previewImagePath) {
      errors.push(`manifest ${atom.id} previewImagePath 不一致`);
    }
  }

  return {
    ok: errors.length === 0,
    checked,
    errors,
    manifestPath,
  };
}
