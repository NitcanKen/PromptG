import { afterEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, sql } from "drizzle-orm";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { ensureExpandedAtoms, ensureSeedAtoms } from "@/lib/seed/bootstrap";
import { appSettings, promptAtoms } from "@/lib/db/schema";
import { EXPANDED_ATOMS } from "@/lib/seed/expanded-atoms";
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
  it("inserts missing expanded atoms without duplicating existing seeds", async () => {
    const { db } = installInMemoryDb();

    await ensureSeedAtoms();
    await ensureExpandedAtoms();

    const rows = await db.select({ id: promptAtoms.id }).from(promptAtoms).all();
    const ids = new Set(rows.map((row) => row.id));

    const expectedUniqueIds = new Set([...SEED_ATOMS, ...EXPANDED_ATOMS].map((atom) => atom.id));

    expect(rows).toHaveLength(expectedUniqueIds.size);
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

  it("replaces old weak templated app-owned persona metadata without touching arbitrary user edits", async () => {
    const { db } = installInMemoryDb();
    const outputDir = await makeTempDir();

    const now = "2026-06-06T00:00:00.000Z";
    await db.insert(promptAtoms).values({
      id: "library-persona-01",
      category: "人設",
      title: "自然通勤人物",
      subtitle: "自然通勤方向的人物氣質基底",
      previewImagePath: "/api/uploads/atom-previews/library-persona-01/0123456789abcdef.png",
      prompt: "natural everyday urban commuter persona, reusable character archetype, adult non-celebrity subject",
      negativePrompt: "celebrity likeness, fixed hairstyle, specific brand identity, full outfit overreach",
      priority: "medium",
      lockPolicy: "normal",
      tagsJson: JSON.stringify(["通勤", "自然", "人設"]),
      notes: "用於建立自然通勤的人設基底，不包含髮型、服裝或姿態。",
      createdAt: now,
      updatedAt: now,
    });

    await ensureExpandedAtoms({ generatedManifestPath: path.join(outputDir, "missing-manifest.json") });

    const row = await db
      .select()
      .from(promptAtoms)
      .where(eq(promptAtoms.id, "library-persona-01"))
      .get();

    expect(row?.title).toBe("星際戰術指揮官");
    expect(row?.prompt).not.toContain("reusable character archetype");
    expect(row?.previewImagePath).toBe("/api/uploads/atom-previews/library-persona-01/0123456789abcdef.png");
  });

  it("backfills generated preview paths only through the explicit expanded contract", async () => {
    const { db } = installInMemoryDb();

    await ensureSeedAtoms();
    await ensureExpandedAtoms();
    await ensureExpandedAtoms({
      previewPathsByAtomId: {
        "library-hair-curtain-bangs": "/api/uploads/atom-previews/library-hair-curtain-bangs/0123456789abcdef.png",
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

    expect(row?.previewImagePath).toBe("/api/uploads/atom-previews/library-hair-curtain-bangs/0123456789abcdef.png");
  });

  it("loads generated preview paths from a production manifest for app bootstrap", async () => {
    const { db } = installInMemoryDb();
    const outputDir = await makeTempDir();
    const manifestPath = path.join(outputDir, "manifest.json");
    const imagePath = path.join(outputDir, "library-hair-curtain-bangs", "0123456789abcdef.png");

    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, Buffer.from("generated image"));
    await fs.writeFile(
      manifestPath,
      JSON.stringify({
        version: 1,
        model: "GPT-Image-2",
        updatedAt: "2026-06-06T00:00:00.000Z",
        atoms: {
          "library-hair-curtain-bangs": {
            atomId: "library-hair-curtain-bangs",
            status: "generated",
            previewImagePath: "/api/uploads/atom-previews/library-hair-curtain-bangs/0123456789abcdef.png",
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

    expect(row?.previewImagePath).toBe("/api/uploads/atom-previews/library-hair-curtain-bangs/0123456789abcdef.png");
  });

  it("backfills generated preview paths for app-owned seed atoms without changing seed text fields", async () => {
    const { db } = installInMemoryDb();
    const outputDir = await makeTempDir();
    const manifestPath = path.join(outputDir, "manifest.json");
    const imagePath = path.join(outputDir, "seed-persona-soft-cinematic", "0123456789abcdef.png");

    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, Buffer.from("generated seed image"));
    await fs.writeFile(
      manifestPath,
      JSON.stringify({
        version: 1,
        model: "GPT-Image-2",
        updatedAt: "2026-06-07T00:00:00.000Z",
        atoms: {
          "seed-persona-soft-cinematic": {
            atomId: "seed-persona-soft-cinematic",
            status: "generated",
            previewImagePath: "/api/uploads/atom-previews/seed-persona-soft-cinematic/0123456789abcdef.png",
            filePath: imagePath,
            fileSize: 20,
          },
        },
      }),
    );

    await ensureSeedAtoms();
    await ensureExpandedAtoms({ generatedManifestPath: manifestPath });

    const row = await db
      .select({
        title: promptAtoms.title,
        prompt: promptAtoms.prompt,
        previewImagePath: promptAtoms.previewImagePath,
      })
      .from(promptAtoms)
      .where(eq(promptAtoms.id, "seed-persona-soft-cinematic"))
      .get();

    expect(row?.title).toBe("柔和電影感少女");
    expect(row?.prompt).toBe(
      "adult original ACG soft cinematic heroine persona, natural facial presence, gentle editorial portrait base, non-celebrity character identity",
    );
    expect(row?.previewImagePath).toBe(
      "/api/uploads/atom-previews/seed-persona-soft-cinematic/0123456789abcdef.png",
    );
  });
});
