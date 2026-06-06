import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { appSettings } from "@/lib/db/schema";

export async function getSetting<T>(key: string): Promise<T | null> {
  const row = await getDb().select().from(appSettings).where(eq(appSettings.key, key)).get();

  if (!row) {
    return null;
  }

  try {
    return JSON.parse(row.valueJson) as T;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: unknown) {
  const now = new Date().toISOString();

  await getDb()
    .insert(appSettings)
    .values({
      key,
      valueJson: JSON.stringify(value),
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        valueJson: JSON.stringify(value),
        updatedAt: now,
      },
    });
}
