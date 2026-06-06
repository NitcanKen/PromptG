import { afterEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, sql } from "drizzle-orm";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { ensureExpandedAtoms, ensureSeedAtoms } from "@/lib/seed/bootstrap";
import { appSettings, promptAtoms } from "@/lib/db/schema";
import { EXPANDED_HAIR_ATOMS } from "@/lib/seed/expanded-atoms";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";
import * as schema from "@/lib/db/schema";

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "promptg-expanded-bootstrap-"));
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

  db.run(sql`
    CREATE TABLE app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  globalThis.__promptgDb = { sqlite, db };

  return { sqlite, db };
}

afterEach(async () => {
  globalThis.__promptgDb?.sqlite.close();
  globalThis.__promptgDb = undefined;
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("ensureSeedAtoms", () => {
  it("backfills v2 seeds even when the v1 bootstrap marker already exists", async () => {
    const { db } = installInMemoryDb();

    await db.insert(appSettings).values({
      key: "seed_atoms_bootstrapped_v1",
      valueJson: JSON.stringify({ count: 16 }),
      updatedAt: "2026-06-06T00:00:00.000Z",
    });

    await ensureSeedAtoms();

    const rows = await db.select({ id: promptAtoms.id }).from(promptAtoms).all();
    expect(rows).toHaveLength(SEED_ATOMS.length);
  });

  it("does not duplicate seed atoms when bootstrap runs more than once", async () => {
    const { db } = installInMemoryDb();

    await ensureSeedAtoms();
    await ensureSeedAtoms();

    const rows = await db.select({ id: promptAtoms.id }).from(promptAtoms).all();
    expect(rows).toHaveLength(SEED_ATOMS.length);
    expect(new Set(rows.map((row) => row.id)).size).toBe(SEED_ATOMS.length);
  });
});

describe("ensureExpandedAtoms", () => {
  it("inserts missing expanded hair atoms without duplicating existing seeds", async () => {
    const { db } = installInMemoryDb();

    await ensureSeedAtoms();
    await ensureExpandedAtoms();

    const rows = await db.select({ id: promptAtoms.id }).from(promptAtoms).all();
    const ids = new Set(rows.map((row) => row.id));

    expect(rows).toHaveLength(SEED_ATOMS.length + EXPANDED_HAIR_ATOMS.length - 1);
    expect(ids.size).toBe(rows.length);
    expect(ids.has("seed-hair-airy-bangs")).toBe(true);
  });

  it("does not overwrite existing seed or user-edited expanded atom fields", async () => {
    const { db } = installInMemoryDb();

    const now = "2026-06-06T00:00:00.000Z";
    await db.insert(promptAtoms).values({
      id: "library-hair-curtain-bangs",
      category: "髮型",
      title: "使用者改過的八字瀏海",
      subtitle: "使用者自己的副標題",
      previewImagePath: "",
      prompt: "user edited prompt",
      negativePrompt: "user edited negative",
      priority: "core",
      lockPolicy: "cannot_override",
      tagsJson: JSON.stringify(["使用者標籤"]),
      notes: "使用者備註",
      createdAt: now,
      updatedAt: now,
    });

    await ensureSeedAtoms();
    await ensureExpandedAtoms();

    const row = await db
      .select()
      .from(promptAtoms)
      .where(eq(promptAtoms.id, "library-hair-curtain-bangs"))
      .get();

    expect(row?.title).toBe("使用者改過的八字瀏海");
    expect(row?.prompt).toBe("user edited prompt");
    expect(row?.priority).toBe("core");
    expect(row?.lockPolicy).toBe("cannot_override");
  });

  it("backfills generated preview paths only through the explicit expanded contract", async () => {
    const { db } = installInMemoryDb();

    await ensureSeedAtoms();
    await ensureExpandedAtoms();
    await ensureExpandedAtoms({
      previewPathsByAtomId: {
        "library-hair-curtain-bangs": "/api/uploads/atom-previews/library-hair-curtain-bangs.png",
      },
      previewPathExists: () => true,
    });

    const row = await db
      .select({
        previewImagePath: promptAtoms.previewImagePath,
      })
      .from(promptAtoms)
      .where(eq(promptAtoms.id, "library-hair-curtain-bangs"))
      .get();

    expect(row?.previewImagePath).toBe("/api/uploads/atom-previews/library-hair-curtain-bangs.png");
  });

  it("loads generated preview paths from a production manifest for app bootstrap", async () => {
    const { db } = installInMemoryDb();
    const outputDir = await makeTempDir();
    const manifestPath = path.join(outputDir, "manifest.json");
    const imagePath = path.join(outputDir, "library-hair-curtain-bangs.png");

    await fs.writeFile(imagePath, Buffer.from("generated image"));
    await fs.writeFile(
      manifestPath,
      JSON.stringify({
        version: 1,
        model: "gemini-3.1-flash-image",
        updatedAt: "2026-06-06T00:00:00.000Z",
        atoms: {
          "library-hair-curtain-bangs": {
            atomId: "library-hair-curtain-bangs",
            status: "generated",
            previewImagePath: "/api/uploads/atom-previews/library-hair-curtain-bangs.png",
            filePath: imagePath,
            fileSize: 15,
          },
        },
      }),
    );

    await ensureSeedAtoms();
    await ensureExpandedAtoms({ generatedManifestPath: manifestPath });

    const row = await db
      .select({
        previewImagePath: promptAtoms.previewImagePath,
      })
      .from(promptAtoms)
      .where(eq(promptAtoms.id, "library-hair-curtain-bangs"))
      .get();

    expect(row?.previewImagePath).toBe("/api/uploads/atom-previews/library-hair-curtain-bangs.png");
  });
});
