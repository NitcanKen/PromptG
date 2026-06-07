import { eq } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";

import { getDb } from "@/lib/db/client";
import { appSettings, promptAtoms } from "@/lib/db/schema";
import { DEFAULT_LOCK_POLICY, DEFAULT_PROMPT_PRIORITY } from "@/lib/constants";
import {
  EXPANDED_ATOMS,
  GENERATED_ATOM_PREVIEW_ROUTE_PREFIX,
} from "@/lib/seed/expanded-atoms";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

const seedSettingKey = "seed_atoms_bootstrapped_v2";
const expandedSettingKey = "expanded_atoms_bootstrapped_v1";
const defaultGeneratedManifestPath = path.join(
  process.cwd(),
  "data",
  "uploads",
  "atom-previews",
  "manifest.json",
);
const seedPreviewRoutePrefix = "/api/uploads/seed/";
const weakPersonaTitlePattern =
  /^(自然|編輯|清爽|清冷)(通勤|鄰家|模特|旅行|創作者|學生|地下偶像|咖啡店店員)人物$/;

type EnsureExpandedAtomsOptions = {
  previewPathsByAtomId?: Record<string, string>;
  previewPathExists?: (previewImagePath: string) => boolean;
  generatedManifestPath?: string;
};

function isGeneratedAtomPreviewPath(atomId: string, previewImagePath: string) {
  const escapedId = atomId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${GENERATED_ATOM_PREVIEW_ROUTE_PREFIX}${escapedId}(?:\\.(png|jpe?g|webp)|/[a-f0-9]{16,64}\\.(png|jpe?g|webp))$`,
    "i",
  ).test(previewImagePath);
}

type GeneratedManifest = {
  atoms?: Record<
    string,
    {
      status?: string;
      previewImagePath?: string;
      filePath?: string;
    }
  >;
};

async function pathExists(filePath: string) {
  return fs
    .stat(filePath)
    .then((stat) => stat.isFile())
    .catch(() => false);
}

async function loadGeneratedPreviewPathsFromManifest(manifestPath: string) {
  const text = await fs.readFile(manifestPath, "utf8").catch(() => "");
  if (!text) {
    return {};
  }

  let parsed: GeneratedManifest;
  try {
    parsed = JSON.parse(text) as GeneratedManifest;
  } catch {
    return {};
  }
  const previewPathsByAtomId: Record<string, string> = {};

  for (const [atomId, entry] of Object.entries(parsed.atoms ?? {})) {
    if (entry.status !== "generated" && entry.status !== "skipped_existing") {
      continue;
    }

    if (
      entry.previewImagePath &&
      entry.filePath &&
      isGeneratedAtomPreviewPath(atomId, entry.previewImagePath) &&
      (await pathExists(entry.filePath))
    ) {
      previewPathsByAtomId[atomId] = entry.previewImagePath;
    }
  }

  return previewPathsByAtomId;
}

function getGeneratedPreviewPath(
  atomId: string,
  previewPathsByAtomId: Record<string, string>,
  options: EnsureExpandedAtomsOptions,
) {
  const previewImagePath = previewPathsByAtomId[atomId];
  const previewPathExists = options.previewPathExists ?? (() => true);

  if (!previewImagePath || !isGeneratedAtomPreviewPath(atomId, previewImagePath)) {
    return "";
  }

  return previewPathExists(previewImagePath) ? previewImagePath : "";
}

function canBackfillGeneratedPreview(
  atomId: string,
  currentPreviewImagePath: string,
  generatedPreviewPath: string,
) {
  return (
    generatedPreviewPath &&
    generatedPreviewPath !== currentPreviewImagePath &&
    (currentPreviewImagePath === "" ||
      currentPreviewImagePath.startsWith(seedPreviewRoutePrefix) ||
      isGeneratedAtomPreviewPath(atomId, currentPreviewImagePath))
  );
}

function isOldWeakTemplatedPersona(row: {
  id: string;
  category: string;
  title: string;
  prompt: string;
}) {
  return (
    row.id.startsWith("library-persona-") &&
    row.category === "人設" &&
    (weakPersonaTitlePattern.test(row.title) ||
      row.prompt.includes("reusable character archetype"))
  );
}

function isOldPersonaAddonBoilerplate(row: {
  id: string;
  category: string;
  prompt: string;
  notes: string;
}) {
  return (
    row.id.startsWith("library-persona-addon-") &&
    row.category === "人設" &&
    (row.prompt.includes("20-year-old cute Japanese young woman") ||
      row.notes.includes("20 歲日本可愛少女"))
  );
}

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

export async function ensureExpandedAtoms(options: EnsureExpandedAtomsOptions = {}) {
  const db = getDb();
  const bootstrapped = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, expandedSettingKey))
    .get();

  const now = new Date().toISOString();
  let inserted = 0;
  let previewBackfilled = 0;
  let metadataBackfilled = 0;
  const previewPathsByAtomId = {
    ...(await loadGeneratedPreviewPathsFromManifest(
      options.generatedManifestPath ?? defaultGeneratedManifestPath,
    )),
    ...(options.previewPathsByAtomId ?? {}),
  };

  for (const seed of SEED_ATOMS) {
    const generatedPreviewPath = getGeneratedPreviewPath(seed.id, previewPathsByAtomId, options);
    if (!generatedPreviewPath) {
      continue;
    }

    const existing = await db
      .select({
        id: promptAtoms.id,
        previewImagePath: promptAtoms.previewImagePath,
      })
      .from(promptAtoms)
      .where(eq(promptAtoms.id, seed.id))
      .get();

    if (
      existing &&
      canBackfillGeneratedPreview(seed.id, existing.previewImagePath, generatedPreviewPath)
    ) {
      await db
        .update(promptAtoms)
        .set({
          previewImagePath: generatedPreviewPath,
          updatedAt: now,
        })
        .where(eq(promptAtoms.id, seed.id));
      previewBackfilled += 1;
    }
  }

  for (const atom of EXPANDED_ATOMS) {
    const generatedPreviewPath = getGeneratedPreviewPath(atom.id, previewPathsByAtomId, options);
    const existing = await db
      .select()
      .from(promptAtoms)
      .where(eq(promptAtoms.id, atom.id))
      .get();

    if (!existing) {
      await db.insert(promptAtoms).values({
        id: atom.id,
        category: atom.category,
        title: atom.title,
        subtitle: atom.subtitle,
        previewImagePath: generatedPreviewPath || atom.previewImagePath,
        prompt: atom.prompt,
        negativePrompt: atom.negativePrompt,
        priority: atom.priority ?? DEFAULT_PROMPT_PRIORITY,
        lockPolicy: atom.lockPolicy ?? DEFAULT_LOCK_POLICY,
        tagsJson: JSON.stringify(atom.tags),
        notes: atom.notes,
        createdAt: now,
        updatedAt: now,
      });
      inserted += 1;
      continue;
    }

    if (isOldWeakTemplatedPersona(existing) || isOldPersonaAddonBoilerplate(existing)) {
      await db
        .update(promptAtoms)
        .set({
          category: atom.category,
          title: atom.title,
          subtitle: atom.subtitle,
          previewImagePath: canBackfillGeneratedPreview(
            existing.id,
            existing.previewImagePath,
            generatedPreviewPath,
          )
            ? generatedPreviewPath
            : existing.previewImagePath,
          prompt: atom.prompt,
          negativePrompt: atom.negativePrompt,
          priority: atom.priority ?? DEFAULT_PROMPT_PRIORITY,
          lockPolicy: atom.lockPolicy ?? DEFAULT_LOCK_POLICY,
          tagsJson: JSON.stringify(atom.tags),
          notes: atom.notes,
          updatedAt: now,
        })
        .where(eq(promptAtoms.id, atom.id));
      metadataBackfilled += 1;
      if (
        canBackfillGeneratedPreview(existing.id, existing.previewImagePath, generatedPreviewPath)
      ) {
        previewBackfilled += 1;
      }
      continue;
    }

    if (canBackfillGeneratedPreview(existing.id, existing.previewImagePath, generatedPreviewPath)) {
      await db
        .update(promptAtoms)
        .set({
          previewImagePath: generatedPreviewPath,
          updatedAt: now,
        })
        .where(eq(promptAtoms.id, atom.id));
      previewBackfilled += 1;
    }
  }

  const valueJson = JSON.stringify({
    insertedAt: now,
    sourceCount: EXPANDED_ATOMS.length,
    inserted,
    previewBackfilled,
    metadataBackfilled,
  });

  if (bootstrapped) {
    await db
      .update(appSettings)
      .set({
        valueJson,
        updatedAt: now,
      })
      .where(eq(appSettings.key, expandedSettingKey));
    return;
  }

  await db.insert(appSettings).values({
    key: expandedSettingKey,
    valueJson,
    updatedAt: now,
  });
}
