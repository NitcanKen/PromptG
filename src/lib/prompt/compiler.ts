import {
  COMPILE_ORDER,
  DEFAULT_PROMPT_PRIORITY,
  QUALITY_PRESETS,
  SIZE_PRESETS,
  type Category,
  type PromptPriority,
  type QualityPresetId,
  type SizePresetId,
} from "@/lib/constants";

const priorityRank: Record<PromptPriority, number> = {
  core: 0,
  strong: 1,
  medium: 2,
  weak: 3,
  reference: 4,
};

export type PromptCompilerInput = {
  selectedAtoms: Partial<
    Record<
      Category,
      Array<{
        prompt: string;
        negativePrompt?: string;
        priority?: PromptPriority;
      }>
    >
  >;
  sizePreset: SizePresetId;
  qualityPreset: QualityPresetId;
};

export type CompiledPrompt = {
  positivePrompt: string;
  negativePrompt: string;
  combinedPrompt: string;
};

function priorityOf(atom: { priority?: PromptPriority }) {
  return priorityRank[atom.priority ?? DEFAULT_PROMPT_PRIORITY];
}

function promptText(value: string | undefined) {
  return value?.trim() ?? "";
}

function sortByPriority<T extends { priority?: PromptPriority }>(atoms: T[]) {
  return [...atoms].sort((a, b) => priorityOf(a) - priorityOf(b));
}

export function compilePrompt({
  selectedAtoms,
  sizePreset,
  qualityPreset,
}: PromptCompilerInput): CompiledPrompt {
  const promptParts = COMPILE_ORDER.flatMap((category) =>
    sortByPriority(selectedAtoms[category] ?? [])
      .map((atom) => atom.prompt.trim())
      .filter(Boolean),
  );

  const negativeParts = COMPILE_ORDER.flatMap((category) =>
    sortByPriority(selectedAtoms[category] ?? [])
      .map((atom) => promptText(atom.negativePrompt))
      .filter(Boolean),
  );

  negativeParts.push(
    ...sortByPriority(selectedAtoms["Negative Atom"] ?? [])
      .map((atom) => promptText(atom.prompt))
      .filter(Boolean),
  );

  const size = SIZE_PRESETS.find((preset) => preset.id === sizePreset);
  const quality = QUALITY_PRESETS.find((preset) => preset.id === qualityPreset);

  if (size) {
    promptParts.push(size.promptText);
  }

  if (quality) {
    promptParts.push(quality.promptText);
  }

  const positivePrompt = promptParts.join(", ");
  const negativePrompt = negativeParts.join(", ");

  return {
    positivePrompt,
    negativePrompt,
    combinedPrompt: negativePrompt
      ? `${positivePrompt}\n\nNegative Prompt: ${negativePrompt}`
      : positivePrompt,
  };
}
