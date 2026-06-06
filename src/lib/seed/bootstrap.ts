import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { appSettings, promptAtoms } from "@/lib/db/schema";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

const seedSettingKey = "seed_atoms_bootstrapped_v1";

export async function ensureSeedAtoms() {
  const db = getDb();
  const bootstrapped = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, seedSettingKey))
    .get();

  if (bootstrapped) {
    return;
  }

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
      tagsJson: JSON.stringify(seed.tags),
      notes: seed.notes,
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.insert(appSettings).values({
    key: seedSettingKey,
    valueJson: JSON.stringify({
      insertedAt: now,
      count: SEED_ATOMS.length,
    }),
    updatedAt: now,
  });
}
