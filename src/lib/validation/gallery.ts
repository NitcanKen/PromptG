import { z } from "zod";

import {
  combinationSnapshotSchema,
  qualityPresetSchema,
  sizePresetSchema,
} from "@/lib/validation/shared";

const galleryBaseShape = {
  title: z.string().trim().min(1, "請輸入 Gallery 標題").max(100, "Gallery 標題過長"),
  previewImagePath: z.string().trim().max(500),
  prompt: z.string().trim().min(1, "請輸入完整 Prompt"),
  sizePreset: sizePresetSchema,
  qualityPreset: qualityPresetSchema,
  tags: z.array(z.string().trim().min(1).max(24)).max(12),
  notes: z.string().trim().max(4000),
  combinationSnapshot: combinationSnapshotSchema.nullish(),
};

export const galleryInputSchema = z.object({
  ...galleryBaseShape,
  previewImagePath: galleryBaseShape.previewImagePath.default(""),
  tags: galleryBaseShape.tags.default([]),
  notes: galleryBaseShape.notes.default(""),
});

export const galleryUpdateSchema = z.object(galleryBaseShape).partial().refine(
  (value) => Object.keys(value).length > 0,
  "請至少提供一個更新欄位",
);

export const gallerySearchSchema = z.object({
  q: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  sort: z.enum(["created-desc", "updated-desc", "title-asc"]).default("created-desc"),
});

export type GalleryInput = z.infer<typeof galleryInputSchema>;
export type GalleryUpdate = z.infer<typeof galleryUpdateSchema>;
export type GallerySearch = z.infer<typeof gallerySearchSchema>;
