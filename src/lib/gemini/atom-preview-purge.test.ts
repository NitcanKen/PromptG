import { afterEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { purgeAtomPreviews } from "@/lib/gemini/atom-preview-purge";
import { promptAtoms } from "@/lib/db/schema";
import * as schema from "@/lib/db/schema";

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "promptg-preview-purge-"));
  tempDirs.push(dir);
  return dir;
}

function installInMemoryDb() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  db.run(sql`
    CREATE TABLE prompt_atoms (
      id TEXT PRIMARY KEY NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      preview_image_path TEXT NOT NULL DEFAULT '',
      prompt TEXT NOT NULL,
      negative_prompt TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'medium',
      lock_policy TEXT NOT NULL DEFAULT 'normal',
      tags_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  globalThis.__promptgDb = { sqlite, db };

  return { db };
}

afterEach(async () => {
  globalThis.__promptgDb?.sqlite.close();
  globalThis.__promptgDb = undefined;
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("purgeAtomPreviews", () => {
  it("removes generated preview files, manifest logs, image cache, and app-owned DB preview paths", async () => {
    const { db } = installInMemoryDb();
    const rootDir = await makeTempDir();
    const previewDir = path.join(rootDir, "data", "uploads", "atom-previews");
    const cacheDir = path.join(rootDir, ".next", "cache", "images");
    const now = "2026-06-07T00:00:00.000Z";

    await fs.mkdir(path.join(previewDir, "logs"), { recursive: true });
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(path.join(previewDir, "library-persona-01.png"), "old-image");
    await fs.writeFile(path.join(previewDir, "manifest.json"), "{}");
    await fs.writeFile(path.join(previewDir, "logs", "old.jsonl"), "{}\n");
    await fs.writeFile(path.join(cacheDir, "cached-preview"), "old-cache");

    await db.insert(promptAtoms).values([
      {
        id: "library-persona-01",
        category: "人設",
        title: "old",
        subtitle: "",
        previewImagePath: "/api/uploads/atom-previews/library-persona-01.png",
        prompt: "old prompt",
        negativePrompt: "",
        priority: "medium",
        lockPolicy: "normal",
        tagsJson: "[]",
        notes: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-custom",
        category: "人設",
        title: "custom",
        subtitle: "",
        previewImagePath: "/api/uploads/custom.png",
        prompt: "custom prompt",
        negativePrompt: "",
        priority: "medium",
        lockPolicy: "normal",
        tagsJson: "[]",
        notes: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "seed-persona",
        category: "人設",
        title: "seed",
        subtitle: "",
        previewImagePath: "/api/uploads/seed/old-seed.png",
        prompt: "seed prompt",
        negativePrompt: "",
        priority: "medium",
        lockPolicy: "normal",
        tagsJson: "[]",
        notes: "",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await purgeAtomPreviews({ rootDir });

    await expect(fs.stat(previewDir)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(fs.stat(cacheDir)).rejects.toMatchObject({ code: "ENOENT" });
    expect(result.clearedDbRows).toBe(2);
    expect(result.removedPreviewDir).toBe(true);
    expect(result.removedNextImageCache).toBe(true);

    const rows = await db
      .select({
        id: promptAtoms.id,
        previewImagePath: promptAtoms.previewImagePath,
      })
      .from(promptAtoms)
      .all();

    expect(rows.toSorted((a, b) => a.id.localeCompare(b.id))).toEqual([
      { id: "library-persona-01", previewImagePath: "" },
      { id: "seed-persona", previewImagePath: "" },
      { id: "user-custom", previewImagePath: "/api/uploads/custom.png" },
    ]);
  });
});
