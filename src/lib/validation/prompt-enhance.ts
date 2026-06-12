import { z } from "zod";

import {
  DEFAULT_MIMO_MODEL,
  DEFAULT_PROMPT_PRIORITY,
  DEFAULT_QUALITY_PRESET,
  DEFAULT_SIZE_PRESET,
  MIMO_MODELS,
} from "@/lib/constants";
import {
  categorySchema,
  promptPrioritySchema,
  qualityPresetSchema,
  sizePresetSchema,
} from "@/lib/validation/shared";

export const hermesSelectedAtomSchema = z.object({
  category: categorySchema,
  title: z.string().trim().min(1).max(120),
  prompt: z.string().trim().min(1).max(4000),
  negativePrompt: z.string().trim().max(4000).default(""),
  priority: promptPrioritySchema.default(DEFAULT_PROMPT_PRIORITY),
  notes: z.string().trim().max(4000).default(""),
});

export const enhancePromptRequestSchema = z.object({
  selectedAtoms: z.partialRecord(categorySchema, z.array(hermesSelectedAtomSchema)).default({}),
  rawCompiledPrompt: z.string().trim().min(1, "請先選擇素材或輸入自定義 Prompt").max(30000),
  rawNegativePrompt: z.string().trim().max(20000).default(""),
  sizePreset: sizePresetSchema.default(DEFAULT_SIZE_PRESET),
  qualityPreset: qualityPresetSchema.default(DEFAULT_QUALITY_PRESET),
  model: z.enum(MIMO_MODELS).default(DEFAULT_MIMO_MODEL),
});

export const hermesRiskLevelSchema = z.enum(["low", "medium", "high"]);

export const hermesPromptOutputSchema = z.object({
  positivePrompt: z.string().trim().min(1).max(30000),
  negativePrompt: z.string().trim().max(20000).default(""),
  rewriteNotes: z.array(z.string().trim().min(1).max(800)).min(1).max(12),
  riskNotes: z.array(z.string().trim().min(1).max(800)).min(1).max(12),
  qualityNotes: z.array(z.string().trim().min(1).max(800)).min(1).max(12),
  riskLevel: hermesRiskLevelSchema,
});

export type EnhancePromptRequest = z.infer<typeof enhancePromptRequestSchema>;
export type HermesPromptOutput = z.infer<typeof hermesPromptOutputSchema>;
export type HermesRiskLevel = z.infer<typeof hermesRiskLevelSchema>;
