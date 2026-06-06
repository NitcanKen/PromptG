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
      tags_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

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
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

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
