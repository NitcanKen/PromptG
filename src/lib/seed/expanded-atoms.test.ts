import { describe, expect, it } from "vitest";

import { atomInputSchema } from "@/lib/validation/atoms";
import {
  MAIN_SCOPE_CATEGORY_TARGETS,
  getMissingCategoryTargets,
} from "@/lib/seed/expanded-atom-targets";
import {
  EXPANDED_ANIME_CHARACTER_ATOMS,
  EXPANDED_ATOMS,
  EXPANDED_HAIR_ATOMS,
  EXPANDED_PERSONA_ADDON_ATOMS,
} from "@/lib/seed/expanded-atoms";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

function hasCjk(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

function countByCategory(atoms: Array<{ category: string }>) {
  return atoms.reduce<Record<string, number>>((counts, atom) => {
    counts[atom.category] = (counts[atom.category] ?? 0) + 1;
    return counts;
  }, {});
}

describe("expanded atoms", () => {
  it("contains exactly 40 structured hair atoms", () => {
    expect(EXPANDED_HAIR_ATOMS).toHaveLength(40);
    expect(EXPANDED_ATOMS.filter((atom) => atom.category === "髮型")).toHaveLength(40);
  });

  it("keeps stable IDs unique and preserves the existing hair seed ID", () => {
    const ids = EXPANDED_HAIR_ATOMS.map((atom) => atom.id);

    expect(new Set(ids).size).toBe(40);
    expect(ids).toContain("seed-hair-airy-bangs");
  });

  it("keeps every expanded hair atom in the hair category and valid atom schema", () => {
    for (const atom of EXPANDED_HAIR_ATOMS) {
      expect(atom.category).toBe("髮型");
      expect(atomInputSchema.safeParse(atom).success).toBe(true);
    }
  });

  it("keeps visible expanded hair metadata in Traditional Chinese", () => {
    expect(
      EXPANDED_HAIR_ATOMS.every(
        (atom) =>
          hasCjk(atom.title) &&
          hasCjk(atom.subtitle) &&
          atom.tags.every(hasCjk) &&
          hasCjk(atom.notes),
      ),
    ).toBe(true);
  });

  it("adds 50 adult original persona expansion atoms in the persona category", () => {
    expect(EXPANDED_PERSONA_ADDON_ATOMS).toHaveLength(50);
    expect(
      EXPANDED_PERSONA_ADDON_ATOMS.every(
        (atom) =>
          atom.category === "人設" &&
          atom.id.startsWith("library-persona-addon-") &&
          /adult|mature|non-teen/.test(atom.prompt) &&
          atom.prompt.includes("East Asian") &&
          atom.negativePrompt.includes("underage") &&
          atomInputSchema.safeParse(atom).success,
      ),
    ).toBe(true);
  });

  it("adds every documented anime character as a persona atom with a local preview path", () => {
    expect(EXPANDED_ANIME_CHARACTER_ATOMS).toHaveLength(273);
    expect(EXPANDED_ANIME_CHARACTER_ATOMS.filter((atom) => atom.previewImagePath)).toHaveLength(
      272,
    );
    expect(
      EXPANDED_ANIME_CHARACTER_ATOMS.every(
        (atom, index) =>
          atom.id === `library-anime-character-${String(index + 1).padStart(3, "0")}` &&
          atom.source === "anime-character-atoms" &&
          atom.category === "人設" &&
          atom.subtitle.startsWith("動漫角色 / ") &&
          atom.prompt.includes(atom.title) &&
          (atom.previewImagePath === "" ||
            (atom.previewImagePath.startsWith(`/api/uploads/atom-previews/${atom.id}/`) &&
              atom.previewImagePath.endsWith(".jpg"))) &&
          atomInputSchema.safeParse(atom).success,
      ),
    ).toBe(true);
  });

  it("does not ship weak templated persona atoms", () => {
    const weakPersonaTitle =
      /^(自然|編輯|清爽|清冷)(通勤|鄰家|模特|旅行|創作者|學生|地下偶像|咖啡店店員)人物$/;
    const personaAtoms = EXPANDED_ATOMS.filter((atom) => atom.category === "人設");

    expect(personaAtoms.some((atom) => weakPersonaTitle.test(atom.title))).toBe(false);
    expect(personaAtoms.some((atom) => atom.prompt.includes("reusable character archetype"))).toBe(false);
    expect(
      personaAtoms.some((atom) => atom.prompt.includes("20-year-old cute Japanese young woman")),
    ).toBe(false);
    expect(personaAtoms.some((atom) => atom.notes.includes("20 歲日本可愛少女"))).toBe(false);
  });

  it("keeps every expanded atom schema-valid with unique stable IDs", () => {
    const ids = EXPANDED_ATOMS.map((atom) => atom.id);

    expect(new Set(ids).size).toBe(EXPANDED_ATOMS.length);
    for (const atom of EXPANDED_ATOMS) {
      expect(atomInputSchema.safeParse(atom).success).toBe(true);
    }
  });

  it("keeps all expanded atom visible metadata in Traditional Chinese", () => {
    expect(
      EXPANDED_ATOMS.every(
        (atom) =>
          (hasCjk(atom.title) || atom.source === "anime-character-atoms") &&
          hasCjk(atom.subtitle) &&
          atom.tags.every(hasCjk) &&
          hasCjk(atom.notes),
      ),
    ).toBe(true);
  });

  it("reaches the approved main scope target counts with seed and expanded atoms by stable ID", () => {
    const atomsById = new Map([...SEED_ATOMS, ...EXPANDED_ATOMS].map((atom) => [atom.id, atom]));
    const mainScopeAtoms = [...atomsById.values()].filter(
      (atom) => atom.category in MAIN_SCOPE_CATEGORY_TARGETS,
    );
    const missing = getMissingCategoryTargets(
      countByCategory(mainScopeAtoms),
      MAIN_SCOPE_CATEGORY_TARGETS,
    );

    expect(mainScopeAtoms.length).toBeGreaterThanOrEqual(780);
    expect(missing).toEqual(
      Object.fromEntries(Object.keys(MAIN_SCOPE_CATEGORY_TARGETS).map((category) => [category, 0])),
    );
  });
});
