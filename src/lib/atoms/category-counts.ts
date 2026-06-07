import { CATEGORIES, type Category } from "@/lib/constants";

export type CategoryAtomCounts = Record<Category, number>;

export function countAtomsByCategory(atoms: Array<{ category: Category }>) {
  const initialCounts = Object.fromEntries(
    CATEGORIES.map((category) => [category, 0]),
  ) as CategoryAtomCounts;

  return atoms.reduce<CategoryAtomCounts>((counts, atom) => {
    counts[atom.category] = (counts[atom.category] ?? 0) + 1;
    return counts;
  }, initialCounts);
}

export function countAtomsForCategories(
  counts: CategoryAtomCounts,
  categories: readonly Category[],
) {
  return categories.reduce((total, category) => total + (counts[category] ?? 0), 0);
}
