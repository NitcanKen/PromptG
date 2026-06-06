import { z } from "zod";

import {
  CATEGORIES,
  QUALITY_PRESETS,
  SIZE_PRESETS,
  type Category,
} from "@/lib/constants";

export const categorySchema = z.enum(CATEGORIES);
export const sizePresetSchema = z.enum(SIZE_PRESETS.map((preset) => preset.id));
export const qualityPresetSchema = z.enum(QUALITY_PRESETS.map((preset) => preset.id));

export const selectedAtomSchema = z.object({
  id: z.string().min(1),
  category: categorySchema,
  title: z.string().min(1),
  subtitle: z.string().default(""),
  previewImagePath: z.string().default(""),
  prompt: z.string().min(1),
  negativePrompt: z.string().default(""),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(""),
});

export const combinationSnapshotSchema = z.object({
  selectedAtoms: z
    .partialRecord(categorySchema, z.array(selectedAtomSchema))
    .default({} as Partial<Record<Category, z.infer<typeof selectedAtomSchema>[]>>),
  sizePreset: sizePresetSchema,
  qualityPreset: qualityPresetSchema,
});

export type CombinationSnapshotInput = z.infer<typeof combinationSnapshotSchema>;
