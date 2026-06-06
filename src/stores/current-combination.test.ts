import { describe, expect, it } from "vitest";

import { createCurrentCombinationStore } from "@/stores/current-combination";

const baseAtom = {
  title: "測試素材",
  subtitle: "測試副標",
  previewImagePath: "",
  prompt: "test prompt",
  negativePrompt: "",
  priority: "medium" as const,
  lockPolicy: "normal" as const,
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

    store.getState().selectAtom({ ...baseAtom, id: "hand", category: "手部動作" });
    store.getState().selectAtom({ ...baseAtom, id: "prop", category: "手部動作" });

    expect(store.getState().selectedAtoms["手部動作"]?.map((item) => item.id)).toEqual([
      "hand",
      "prop",
    ]);
  });

  it("replaces existing atoms in new v2 single-select categories", () => {
    const store = createCurrentCombinationStore();

    store.getState().selectAtom({ ...baseAtom, id: "first", category: "髮型" });
    store.getState().selectAtom({ ...baseAtom, id: "second", category: "髮型" });

    expect(store.getState().selectedAtoms["髮型"]?.map((item) => item.id)).toEqual([
      "second",
    ]);
  });

  it("removes one atom from a multi-select category without clearing the rest", () => {
    const store = createCurrentCombinationStore();

    store.getState().selectAtom({ ...baseAtom, id: "ring", category: "配飾" });
    store.getState().selectAtom({ ...baseAtom, id: "bag", category: "配飾" });
    store.getState().removeAtom("配飾", "ring");

    expect(store.getState().selectedAtoms["配飾"]?.map((item) => item.id)).toEqual([
      "bag",
    ]);
  });

  it("restores a gallery snapshot into the current combination", () => {
    const store = createCurrentCombinationStore();

    store.getState().selectAtom({ ...baseAtom, id: "old", category: "人設" });
    store.getState().setCompilerMode("custom");
    store.getState().setCustomPrompt("old custom prompt");

    store.getState().applySnapshot({
      selectedAtoms: {
        人設: [{ ...baseAtom, id: "restored", category: "人設" }],
      },
      sizePreset: "2-3-1536",
      qualityPreset: "high",
    });

    expect(store.getState().selectedAtoms["人設"]?.map((item) => item.id)).toEqual([
      "restored",
    ]);
    expect(store.getState().sizePreset).toBe("2-3-1536");
    expect(store.getState().qualityPreset).toBe("high");
    expect(store.getState().compilerMode).toBe("auto");
    expect(store.getState().customPrompt).toBe("");
  });

  it("normalizes legacy gallery snapshots without priority metadata", () => {
    const store = createCurrentCombinationStore();

    store.getState().applySnapshot({
      selectedAtoms: {
        人設: [
          {
            id: "legacy",
            category: "人設",
            title: "舊素材",
            subtitle: "",
            previewImagePath: "",
            prompt: "legacy prompt",
            negativePrompt: "",
            tags: [],
            notes: "",
          },
        ],
      },
      sizePreset: "auto",
      qualityPreset: "auto",
    });

    expect(store.getState().selectedAtoms["人設"]?.[0]).toMatchObject({
      priority: "medium",
      lockPolicy: "normal",
    });
  });

  it("loads a gallery item without snapshot into custom Prompt mode", () => {
    const store = createCurrentCombinationStore();

    store.getState().selectAtom({ ...baseAtom, id: "kept", category: "人設" });
    store.getState().applyGalleryItem({
      prompt: "saved standalone prompt",
      combinationSnapshot: null,
    });

    expect(store.getState().selectedAtoms["人設"]?.map((item) => item.id)).toEqual([
      "kept",
    ]);
    expect(store.getState().compilerMode).toBe("custom");
    expect(store.getState().customPrompt).toBe("saved standalone prompt");
  });
});
