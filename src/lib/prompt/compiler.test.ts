import { describe, expect, it } from "vitest";

import { SIZE_PRESETS, QUALITY_PRESETS } from "@/lib/constants";
import { compilePrompt } from "@/lib/prompt/compiler";
import type { SelectedAtom } from "@/stores/current-combination";

const atom = (
  id: string,
  category: SelectedAtom["category"],
  prompt: string,
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
});

describe("compilePrompt", () => {
  it("orders selected atoms by the PRD compile order and appends size and quality", () => {
    const selectedAtoms = {
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
    ).toBe(
      [
        "soft elf girl",
        "medium close-up",
        "white cropped hoodie",
        "silver rings",
        "thin glasses",
        "soft rim light",
        "尺寸：1:1｜1024×1024｜方圖",
        "質量：高",
      ].join(", "),
    );
  });
});
