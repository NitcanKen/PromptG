import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const promptAtoms = sqliteTable("prompt_atoms", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  previewImagePath: text("preview_image_path").notNull().default(""),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt").notNull().default(""),
  priority: text("priority").notNull().default("medium"),
  lockPolicy: text("lock_policy").notNull().default("normal"),
  tagsJson: text("tags_json").notNull().default("[]"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const galleryItems = sqliteTable("gallery_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  previewImagePath: text("preview_image_path").notNull().default(""),
  prompt: text("prompt").notNull(),
  sizePreset: text("size_preset").notNull(),
  qualityPreset: text("quality_preset").notNull(),
  tagsJson: text("tags_json").notNull().default("[]"),
  notes: text("notes").notNull().default(""),
  combinationSnapshotJson: text("combination_snapshot_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type PromptAtomRow = typeof promptAtoms.$inferSelect;
export type NewPromptAtomRow = typeof promptAtoms.$inferInsert;
export type GalleryItemRow = typeof galleryItems.$inferSelect;
export type NewGalleryItemRow = typeof galleryItems.$inferInsert;
export type AppSettingRow = typeof appSettings.$inferSelect;
