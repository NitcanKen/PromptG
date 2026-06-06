import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { appSettings, promptAtoms } from "@/lib/db/schema";
import { DEFAULT_LOCK_POLICY, DEFAULT_PROMPT_PRIORITY } from "@/lib/constants";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

const seedSettingKey = "seed_atoms_bootstrapped_v2";

export async function ensureSeedAtoms() {
  const db = getDb();
  const bootstrapped = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, seedSettingKey))
    .get();

  const now = new Date().toISOString();

  for (const seed of SEED_ATOMS) {
    const existing = await db
      .select({ id: promptAtoms.id })
      .from(promptAtoms)
      .where(eq(promptAtoms.id, seed.id))
      .get();

    if (existing) {
      continue;
    }

    await db.insert(promptAtoms).values({
      id: seed.id,
      category: seed.category,
      title: seed.title,
      subtitle: seed.subtitle,
      previewImagePath: seed.previewImagePath,
      prompt: seed.prompt,
      negativePrompt: seed.negativePrompt,
      priority: seed.priority ?? DEFAULT_PROMPT_PRIORITY,
      lockPolicy: seed.lockPolicy ?? DEFAULT_LOCK_POLICY,
      tagsJson: JSON.stringify(seed.tags),
      notes: seed.notes,
      createdAt: now,
      updatedAt: now,
    });
  }

  const valueJson = JSON.stringify({
    insertedAt: now,
    count: SEED_ATOMS.length,
  });

  if (bootstrapped) {
    await db
      .update(appSettings)
      .set({
        valueJson,
        updatedAt: now,
      })
      .where(eq(appSettings.key, seedSettingKey));
    return;
  }

  await db.insert(appSettings).values({
    key: seedSettingKey,
    valueJson,
    updatedAt: now,
  });
}
