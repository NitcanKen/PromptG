import { describe, expect, it } from "vitest";

import { SIZE_PRESETS, QUALITY_PRESETS } from "@/lib/constants";
import { compilePrompt } from "@/lib/prompt/compiler";
import type { SelectedAtom } from "@/stores/current-combination";

const atom = (
  id: string,
  category: SelectedAtom["category"],
  prompt: string,
  patch: Partial<SelectedAtom> = {},
): SelectedAtom => ({
  id,
  category,
  title: id,
  subtitle: "",
  previewImagePath: "",
  prompt,
  negativePrompt: "",
  tags: [],
  notes: "",
  priority: "medium",
  lockPolicy: "normal",
  ...patch,
});

describe("compilePrompt", () => {
  it("orders selected atoms by the PRD compile order and appends size and quality", () => {
    const selectedAtoms = {
      "主體數量 / 人物關係": [
        atom("subject-count", "主體數量 / 人物關係", "solo portrait"),
      ],
      "上裝": [atom("top", "上裝", "white cropped hoodie")],
      "人設": [atom("persona", "人設", "soft elf girl")],
      "景別": [atom("shot", "景別", "medium close-up")],
      "配飾": [
        atom("ring", "配飾", "silver rings"),
        atom("glasses", "配飾", "thin glasses"),
      ],
      "光影": [atom("light", "光影", "soft rim light")],
    };

    expect(
      compilePrompt({
        selectedAtoms,
        sizePreset: SIZE_PRESETS[1].id,
        qualityPreset: QUALITY_PRESETS[1].id,
      }),
    ).toEqual({
      positivePrompt: [
        "solo portrait",
        "soft elf girl",
        "medium close-up",
        "white cropped hoodie",
        "silver rings",
        "thin glasses",
        "soft rim light",
        "尺寸：1:1｜1024×1024｜方圖",
        "質量：高",
      ].join(", "),
      negativePrompt: "",
      combinedPrompt: [
        "solo portrait",
        "soft elf girl",
        "medium close-up",
        "white cropped hoodie",
        "silver rings",
        "thin glasses",
        "soft rim light",
        "尺寸：1:1｜1024×1024｜方圖",
        "質量：高",
      ].join(", "),
    });
  });

  it("moves Negative Atom prompts and atom-level negative prompts into negative output", () => {
    expect(
      compilePrompt({
        selectedAtoms: {
          人設: [
            atom("persona", "人設", "soft elf girl", {
              negativePrompt: "plastic skin",
            }),
          ],
          "Negative Atom": [
            atom("bad-hands", "Negative Atom", "extra fingers, broken hands"),
          ],
        },
        sizePreset: "auto",
        qualityPreset: "auto",
      }),
    ).toEqual({
      positivePrompt: "soft elf girl, 尺寸：自動, 質量：自動",
      negativePrompt: "plastic skin, extra fingers, broken hands",
      combinedPrompt:
        "soft elf girl, 尺寸：自動, 質量：自動\n\nNegative Prompt: plastic skin, extra fingers, broken hands",
    });
  });

  it("uses priority as a stable grouping basis inside each category", () => {
    const result = compilePrompt({
      selectedAtoms: {
        配飾: [
          atom("weak", "配飾", "small charm", { priority: "weak" }),
          atom("core", "配飾", "signature silver earrings", { priority: "core" }),
          atom("strong", "配飾", "thin glasses", { priority: "strong" }),
        ],
      },
      sizePreset: "auto",
      qualityPreset: "auto",
    });

    expect(result.positivePrompt).toBe(
      "signature silver earrings, thin glasses, small charm, 尺寸：自動, 質量：自動",
    );
  });
});
