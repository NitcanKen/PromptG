import { describe, expect, it } from "vitest";

import { createCurrentCombinationStore } from "@/stores/current-combination";

const baseAtom = {
  title: "測試素材",
  subtitle: "測試副標",
  previewImagePath: "",
  prompt: "test prompt",
  negativePrompt: "",
  tags: [],
  notes: "",
};

describe("current combination store", () => {
  it("replaces existing atoms in single-select categories", () => {
    const store = createCurrentCombinationStore();

    store.getState().selectAtom({ ...baseAtom, id: "first", category: "人設" });
    store.getState().selectAtom({ ...baseAtom, id: "second", category: "人設" });

    expect(store.getState().selectedAtoms["人設"]?.map((item) => item.id)).toEqual([
      "second",
    ]);
  });

  it("keeps multiple atoms in multi-select categories", () => {
    const store = createCurrentCombinationStore();

    store.getState().selectAtom({ ...baseAtom, id: "ring", category: "配飾" });
    store.getState().selectAtom({ ...baseAtom, id: "bag", category: "配飾" });

    expect(store.getState().selectedAtoms["配飾"]?.map((item) => item.id)).toEqual([
      "ring",
      "bag",
    ]);
  });
});
