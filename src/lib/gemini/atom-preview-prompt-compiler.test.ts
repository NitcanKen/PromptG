import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/constants";
import {
  EXPANDED_ANIME_CHARACTER_ATOMS,
  EXPANDED_ATOMS,
} from "@/lib/seed/expanded-atoms";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";
import {
  CATEGORY_PREVIEW_TEMPLATES,
  buildAtomPreviewPrompt,
} from "@/lib/gemini/atom-preview-prompt-compiler";

const allAtoms = [
  ...new Map([...SEED_ATOMS, ...EXPANDED_ATOMS].map((atom) => [atom.id, atom])).values(),
];

function promptFor(id: string) {
  const atom = allAtoms.find((candidate) => candidate.id === id);
  if (!atom) {
    throw new Error(`Missing test atom: ${id}`);
  }
  return buildAtomPreviewPrompt(atom);
}

describe("atom preview prompt compiler", () => {
  it("compiles every approved atom into a provider-ready preview prompt", () => {
    const prompts = allAtoms.map((atom) => buildAtomPreviewPrompt(atom));

    expect(allAtoms).toHaveLength(785 + EXPANDED_ANIME_CHARACTER_ATOMS.length);
    expect(new Set(allAtoms.map((atom) => atom.category))).toHaveLength(36);
    expect(prompts.every((prompt) => prompt.includes("Create one square 1:1 image"))).toBe(true);
    expect(prompts.every((prompt) => prompt.includes("Category framing:"))).toBe(true);
  });

  it("has an explicit template for every v2 category", () => {
    expect(Object.keys(CATEGORY_PREVIEW_TEMPLATES).sort()).toEqual([...CATEGORIES].sort());
  });

  it("does not leak product-internal terms or banned global style wording", () => {
    const forbidden = [/PromptG/i, /\batom\b/i, /library card/i, /素材卡/i, /東方審美/];

    for (const atom of allAtoms) {
      const prompt = buildAtomPreviewPrompt(atom);
      for (const pattern of forbidden) {
        expect(prompt, `${atom.id} leaked ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("requires female subjects and rejects male drift whenever a person appears", () => {
    for (const atom of allAtoms) {
      const prompt = buildAtomPreviewPrompt(atom);

      expect(prompt, `${atom.id} is missing the adult female subject policy`).toContain(
        "every visible person must be a clearly adult female original ACG character",
      );
      expect(prompt, `${atom.id} is missing the male-subject guard`).toContain(
        "No male or masculine-presenting subjects",
      );
    }
  });

  it("uses category framing instead of forcing non-person concepts into portraits", () => {
    expect(promptFor("library-top-01")).toContain("upper garment");
    expect(promptFor("library-prop-01")).toContain("prop-focused");
    expect(promptFor("library-scene-01")).toContain("environment concept");
    expect(promptFor("library-camera-angle-01")).toContain("camera position");
    expect(promptFor("library-layout-01")).toContain("graphic layout");
    expect(promptFor("library-text-element-01")).toContain("typography-element");
    expect(promptFor("library-platform-01")).toContain("platform-format");
    expect(promptFor("library-postprocess-01")).toContain("post-processing");
  });

  it("applies special non-beauty handling for Negative, size, and quality controls", () => {
    expect(promptFor("seed-negative-bad-hands")).toContain("avoided failure mode");
    expect(promptFor("seed-negative-bad-hands")).toContain("not a polished character portrait");
    expect(promptFor("seed-size-vertical-story")).toContain("aspect-ratio frame preview");
    expect(promptFor("seed-size-vertical-story")).toContain("simple abstract content");
    expect(promptFor("seed-quality-high")).toContain("quality/fidelity preview");
    expect(promptFor("seed-quality-high")).toContain("without adding a new subject concept");
  });
});
