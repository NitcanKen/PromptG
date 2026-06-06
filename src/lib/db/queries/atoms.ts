import { and, desc, eq, like, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getDb } from "@/lib/db/client";
import { promptAtoms, type PromptAtomRow } from "@/lib/db/schema";
import { ensureSeedAtoms } from "@/lib/seed/bootstrap";
import type { AtomInput, AtomUpdate } from "@/lib/validation/atoms";

export type PromptAtom = {
  id: string;
  category: PromptAtomRow["category"];
  title: string;
  subtitle: string;
  previewImagePath: string;
  prompt: string;
  negativePrompt: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

function parseTags(tagsJson: string) {
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed.filter((tag) => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export function toPromptAtom(row: PromptAtomRow): PromptAtom {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    subtitle: row.subtitle,
    previewImagePath: row.previewImagePath,
    prompt: row.prompt,
    negativePrompt: row.negativePrompt,
    tags: parseTags(row.tagsJson),
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listAtoms(filters: { category?: string; q?: string } = {}) {
  await ensureSeedAtoms();

  const db = getDb();
  const q = filters.q?.trim();
  const query = q ? `%${q}%` : undefined;
  const where = and(
    filters.category ? eq(promptAtoms.category, filters.category) : undefined,
    query
      ? or(
          like(promptAtoms.title, query),
          like(promptAtoms.subtitle, query),
          like(promptAtoms.prompt, query),
          like(promptAtoms.tagsJson, query),
          like(promptAtoms.notes, query),
        )
      : undefined,
  );

  const rows = await db
    .select()
    .from(promptAtoms)
    .where(where)
    .orderBy(desc(promptAtoms.updatedAt));

  return rows.map(toPromptAtom);
}

export async function createAtom(input: AtomInput) {
  const db = getDb();
  const now = new Date().toISOString();
  const row = {
    id: randomUUID(),
    category: input.category,
    title: input.title,
    subtitle: input.subtitle,
    previewImagePath: input.previewImagePath,
    prompt: input.prompt,
    negativePrompt: input.negativePrompt,
    tagsJson: JSON.stringify(input.tags),
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(promptAtoms).values(row);
  return toPromptAtom(row);
}

export async function updateAtom(id: string, input: AtomUpdate) {
  const db = getDb();
  const existing = await db.select().from(promptAtoms).where(eq(promptAtoms.id, id)).get();

  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    ...("category" in input ? { category: input.category } : {}),
    ...("title" in input ? { title: input.title } : {}),
    ...("subtitle" in input ? { subtitle: input.subtitle } : {}),
    ...("previewImagePath" in input ? { previewImagePath: input.previewImagePath } : {}),
    ...("prompt" in input ? { prompt: input.prompt } : {}),
    ...("negativePrompt" in input ? { negativePrompt: input.negativePrompt } : {}),
    ...("tags" in input ? { tagsJson: JSON.stringify(input.tags) } : {}),
    ...("notes" in input ? { notes: input.notes } : {}),
    updatedAt: new Date().toISOString(),
  };

  await db.update(promptAtoms).set(updated).where(eq(promptAtoms.id, id));
  return toPromptAtom(updated);
}

export async function deleteAtom(id: string) {
  const db = getDb();
  const result = await db.delete(promptAtoms).where(eq(promptAtoms.id, id));
  return result.changes > 0;
}
