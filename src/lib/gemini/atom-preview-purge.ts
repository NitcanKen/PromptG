import { like, or } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";

import { getDb } from "@/lib/db/client";
import { promptAtoms } from "@/lib/db/schema";

const appOwnedPreviewPrefix = "/api/uploads/atom-previews/";
const removedSeedPreviewPrefix = "/api/uploads/seed/";

export type PurgeAtomPreviewsOptions = {
  rootDir?: string;
};

export type PurgeAtomPreviewsResult = {
  removedPreviewDir: boolean;
  removedNextImageCache: boolean;
  clearedDbRows: number;
};

async function removeDirIfExists(dir: string) {
  const existed = await fs
    .stat(dir)
    .then((stat) => stat.isDirectory())
    .catch(() => false);

  await fs.rm(dir, { recursive: true, force: true });
  return existed;
}

export async function purgeAtomPreviews(
  options: PurgeAtomPreviewsOptions = {},
): Promise<PurgeAtomPreviewsResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const previewDir = path.join(rootDir, "data", "uploads", "atom-previews");
  const nextImageCacheDir = path.join(rootDir, ".next", "cache", "images");
  const now = new Date().toISOString();

  const removedPreviewDir = await removeDirIfExists(previewDir);
  const removedNextImageCache = await removeDirIfExists(nextImageCacheDir);

  const result = await getDb()
    .update(promptAtoms)
    .set({
      previewImagePath: "",
      updatedAt: now,
    })
    .where(
      or(
        like(promptAtoms.previewImagePath, `${appOwnedPreviewPrefix}%`),
        like(promptAtoms.previewImagePath, `${removedSeedPreviewPrefix}%`),
      ),
    );

  return {
    removedPreviewDir,
    removedNextImageCache,
    clearedDbRows: result.changes,
  };
}
