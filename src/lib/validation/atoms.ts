import { z } from "zod";

import { categorySchema } from "@/lib/validation/shared";

const atomBaseSchema = z.object({
  category: categorySchema,
  title: z.string().trim().min(1, "請輸入素材標題").max(80, "素材標題過長"),
  subtitle: z.string().trim().max(120, "副標題過長"),
  previewImagePath: z.string().trim().max(500),
  prompt: z.string().trim().min(1, "請輸入 Prompt 正文"),
  negativePrompt: z.string().trim().max(4000),
  tags: z.array(z.string().trim().min(1).max(24)).max(12),
  notes: z.string().trim().max(4000),
});

export const atomInputSchema = atomBaseSchema.extend({
  subtitle: atomBaseSchema.shape.subtitle.default(""),
  previewImagePath: atomBaseSchema.shape.previewImagePath.default(""),
  negativePrompt: atomBaseSchema.shape.negativePrompt.default(""),
  tags: atomBaseSchema.shape.tags.default([]),
  notes: atomBaseSchema.shape.notes.default(""),
});

export const atomUpdateSchema = atomBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "請至少提供一個更新欄位",
);

export const atomSearchSchema = z.object({
  category: categorySchema.optional(),
  q: z.string().trim().optional(),
});

export type AtomInput = z.infer<typeof atomInputSchema>;
export type AtomUpdate = z.infer<typeof atomUpdateSchema>;
