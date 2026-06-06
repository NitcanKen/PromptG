import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getDb } from "@/lib/db/client";
import { galleryItems, type GalleryItemRow } from "@/lib/db/schema";
import type { GalleryInput, GallerySearch, GalleryUpdate } from "@/lib/validation/gallery";
import type { CombinationSnapshotInput } from "@/lib/validation/shared";

export type GalleryItem = {
  id: string;
  title: string;
  previewImagePath: string;
  prompt: string;
  sizePreset: string;
  qualityPreset: string;
  tags: string[];
  notes: string;
  combinationSnapshot: CombinationSnapshotInput | null;
  createdAt: string;
  updatedAt: string;
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toGalleryItem(row: GalleryItemRow): GalleryItem {
  const snapshot = parseJson<CombinationSnapshotInput | null>(
    row.combinationSnapshotJson,
    null,
  );

  return {
    id: row.id,
    title: row.title,
    previewImagePath: row.previewImagePath,
    prompt: row.prompt,
    sizePreset: row.sizePreset,
    qualityPreset: row.qualityPreset,
    tags: parseJson<string[]>(row.tagsJson, []).filter((tag) => typeof tag === "string"),
    notes: row.notes,
    combinationSnapshot:
      snapshot && Object.keys(snapshot.selectedAtoms ?? {}).length > 0 ? snapshot : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listGalleryItems(filters: GallerySearch) {
  const db = getDb();
  const q = filters.q?.trim();
  const tag = filters.tag?.trim();
  const query = q ? `%${q}%` : undefined;
  const tagQuery = tag ? `%"${tag}"%` : undefined;
  const where = and(
    query
      ? or(
          like(galleryItems.title, query),
          like(galleryItems.prompt, query),
          like(galleryItems.tagsJson, query),
          like(galleryItems.notes, query),
        )
      : undefined,
    tagQuery ? like(galleryItems.tagsJson, tagQuery) : undefined,
  );

  const order =
    filters.sort === "title-asc"
      ? asc(galleryItems.title)
      : filters.sort === "updated-desc"
        ? desc(galleryItems.updatedAt)
        : desc(galleryItems.createdAt);

  const rows = await db
    .select()
    .from(galleryItems)
    .where(where)
    .orderBy(order);

  return rows.map(toGalleryItem);
}

export async function createGalleryItem(input: GalleryInput) {
  const now = new Date().toISOString();
  const row = {
    id: randomUUID(),
    title: input.title,
    previewImagePath: input.previewImagePath,
    prompt: input.prompt,
    sizePreset: input.sizePreset,
    qualityPreset: input.qualityPreset,
    tagsJson: JSON.stringify(input.tags),
    notes: input.notes,
    combinationSnapshotJson: JSON.stringify(input.combinationSnapshot ?? null),
    createdAt: now,
    updatedAt: now,
  };

  await getDb().insert(galleryItems).values(row);
  return toGalleryItem(row);
}

export async function updateGalleryItem(id: string, input: GalleryUpdate) {
  const db = getDb();
  const existing = await db.select().from(galleryItems).where(eq(galleryItems.id, id)).get();

  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    ...("title" in input ? { title: input.title } : {}),
    ...("previewImagePath" in input ? { previewImagePath: input.previewImagePath } : {}),
    ...("prompt" in input ? { prompt: input.prompt } : {}),
    ...("sizePreset" in input ? { sizePreset: input.sizePreset } : {}),
    ...("qualityPreset" in input ? { qualityPreset: input.qualityPreset } : {}),
    ...("tags" in input ? { tagsJson: JSON.stringify(input.tags) } : {}),
    ...("notes" in input ? { notes: input.notes } : {}),
    ...("combinationSnapshot" in input
      ? { combinationSnapshotJson: JSON.stringify(input.combinationSnapshot ?? null) }
      : {}),
    updatedAt: new Date().toISOString(),
  };

  await db.update(galleryItems).set(updated).where(eq(galleryItems.id, id));
  return toGalleryItem(updated);
}

export async function deleteGalleryItem(id: string) {
  const result = await getDb().delete(galleryItems).where(eq(galleryItems.id, id));
  return result.changes > 0;
}
