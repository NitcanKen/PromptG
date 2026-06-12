import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";

import * as schema from "@/lib/db/schema";

const dataDir = path.join(process.cwd(), "data");
const databasePath = path.join(dataDir, "app.db");

declare global {
  var __promptgDb:
    | {
        sqlite: Database.Database;
        db: ReturnType<typeof drizzle<typeof schema>>;
      }
    | undefined;
}

function bootstrap(sqlite: Database.Database) {
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  db.run(sql`
    CREATE TABLE IF NOT EXISTS prompt_atoms (
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

  const promptAtomColumns = sqlite
    .prepare("PRAGMA table_info(prompt_atoms)")
    .all() as Array<{ name: string }>;
  const promptAtomColumnNames = new Set(promptAtomColumns.map((column) => column.name));

  if (!promptAtomColumnNames.has("priority")) {
    sqlite.exec("ALTER TABLE prompt_atoms ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'");
  }

  if (!promptAtomColumnNames.has("lock_policy")) {
    sqlite.exec("ALTER TABLE prompt_atoms ADD COLUMN lock_policy TEXT NOT NULL DEFAULT 'normal'");
  }

  db.run(sql`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      preview_image_path TEXT NOT NULL DEFAULT '',
      prompt TEXT NOT NULL,
      size_preset TEXT NOT NULL,
      quality_preset TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      combination_snapshot_json TEXT NOT NULL DEFAULT '{}',
      hermes_provenance_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  const galleryColumns = sqlite
    .prepare("PRAGMA table_info(gallery_items)")
    .all() as Array<{ name: string }>;
  const galleryColumnNames = new Set(galleryColumns.map((column) => column.name));

  if (!galleryColumnNames.has("hermes_provenance_json")) {
    sqlite.exec("ALTER TABLE gallery_items ADD COLUMN hermes_provenance_json TEXT NOT NULL DEFAULT '{}'");
  }

  db.run(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  return db;
}

export function getDb() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (!globalThis.__promptgDb) {
    const sqlite = new Database(databasePath);
    globalThis.__promptgDb = {
      sqlite,
      db: bootstrap(sqlite),
    };
  }

  return globalThis.__promptgDb.db;
}

export { databasePath };
