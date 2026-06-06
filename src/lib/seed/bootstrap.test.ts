import { afterEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";

import { ensureSeedAtoms } from "@/lib/seed/bootstrap";
import { appSettings, promptAtoms } from "@/lib/db/schema";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";
import * as schema from "@/lib/db/schema";

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

afterEach(() => {
  globalThis.__promptgDb?.sqlite.close();
  globalThis.__promptgDb = undefined;
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
