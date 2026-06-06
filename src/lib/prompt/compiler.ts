import {
  COMPILE_ORDER,
  QUALITY_PRESETS,
  SIZE_PRESETS,
  type Category,
  type QualityPresetId,
  type SizePresetId,
} from "@/lib/constants";

export type PromptCompilerInput = {
  selectedAtoms: Partial<
    Record<
      Category,
      Array<{
        prompt: string;
      }>
    >
  >;
  sizePreset: SizePresetId;
  qualityPreset: QualityPresetId;
};

export function compilePrompt({
  selectedAtoms,
  sizePreset,
  qualityPreset,
}: PromptCompilerInput) {
  const promptParts = COMPILE_ORDER.flatMap((category) =>
    (selectedAtoms[category] ?? [])
      .map((atom) => atom.prompt.trim())
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

  return promptParts.join(", ");
}
