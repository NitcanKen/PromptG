"use client";

import { create } from "zustand";
import type { StateCreator } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

import {
  CATEGORY_SELECTION_MODE,
  DEFAULT_QUALITY_PRESET,
  DEFAULT_SIZE_PRESET,
  type Category,
  type QualityPresetId,
  type SizePresetId,
} from "@/lib/constants";

export type CompilerMode = "auto" | "custom";

export type SelectedAtom = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  previewImagePath: string;
  prompt: string;
  negativePrompt: string;
  tags: string[];
  notes: string;
};

export type CurrentCombinationState = {
  selectedAtoms: Partial<Record<Category, SelectedAtom[]>>;
  sizePreset: SizePresetId;
  qualityPreset: QualityPresetId;
  compilerMode: CompilerMode;
  customPrompt: string;
  selectAtom: (atom: SelectedAtom) => void;
  removeAtom: (category: Category, atomId?: string) => void;
  clearCategory: (category: Category) => void;
  setSizePreset: (sizePreset: SizePresetId) => void;
  setQualityPreset: (qualityPreset: QualityPresetId) => void;
  setCompilerMode: (compilerMode: CompilerMode) => void;
  setCustomPrompt: (customPrompt: string) => void;
  reset: () => void;
};

const initialState = {
  selectedAtoms: {},
  sizePreset: DEFAULT_SIZE_PRESET,
  qualityPreset: DEFAULT_QUALITY_PRESET,
  compilerMode: "auto" as CompilerMode,
  customPrompt: "",
};

const currentCombinationStateCreator: StateCreator<CurrentCombinationState> = (set) => ({
  ...initialState,
  selectAtom: (atom) =>
    set((state) => {
      const mode = CATEGORY_SELECTION_MODE[atom.category];
      const current = state.selectedAtoms[atom.category] ?? [];
      const nextForCategory =
        mode === "single"
          ? [atom]
          : current.some((item) => item.id === atom.id)
            ? current
            : [...current, atom];

      return {
        selectedAtoms: {
          ...state.selectedAtoms,
          [atom.category]: nextForCategory,
        },
      };
    }),
  removeAtom: (category, atomId) =>
    set((state) => {
      const current = state.selectedAtoms[category] ?? [];
      const nextForCategory = atomId
        ? current.filter((item) => item.id !== atomId)
        : [];

      return {
        selectedAtoms: {
          ...state.selectedAtoms,
          [category]: nextForCategory,
        },
      };
    }),
  clearCategory: (category) =>
    set((state) => ({
      selectedAtoms: {
        ...state.selectedAtoms,
        [category]: [],
      },
    })),
  setSizePreset: (sizePreset) => set({ sizePreset }),
  setQualityPreset: (qualityPreset) => set({ qualityPreset }),
  setCompilerMode: (compilerMode) => set({ compilerMode }),
  setCustomPrompt: (customPrompt) => set({ customPrompt }),
  reset: () => set(initialState),
});

export function createCurrentCombinationStore(): StoreApi<CurrentCombinationState> {
  return createStore<CurrentCombinationState>(currentCombinationStateCreator);
}

export const useCurrentCombinationStore = create<CurrentCombinationState>()(
  currentCombinationStateCreator,
);
