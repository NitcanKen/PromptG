import { z } from "zod";

import { DEFAULT_MIMO_MODEL, MIMO_MODELS } from "@/lib/constants";
import { categorySchema } from "@/lib/validation/shared";

export const mimoModelSchema = z.enum(MIMO_MODELS);

export const parsedAtomDraftSchema = z.object({
  category: categorySchema,
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().min(1).max(120),
  prompt: z.string().trim().min(1).max(4000),
  negativePrompt: z.string().trim().max(4000).default(""),
  tags: z.array(z.string().trim().min(1).max(24)).max(8).default([]),
  notes: z.string().trim().max(4000).default(""),
});

export const parsedPromptOutputSchema = z.object({
  items: z.array(parsedAtomDraftSchema).min(1).max(32),
});

export const parsePromptRequestSchema = z.object({
  prompt: z.string().trim().min(1, "請貼上要拆解的 Prompt").max(20000),
  model: mimoModelSchema.default(DEFAULT_MIMO_MODEL),
});

export type ParsedAtomDraft = z.infer<typeof parsedAtomDraftSchema>;
export type ParsedPromptOutput = z.infer<typeof parsedPromptOutputSchema>;
export type ParsePromptRequest = z.infer<typeof parsePromptRequestSchema>;
