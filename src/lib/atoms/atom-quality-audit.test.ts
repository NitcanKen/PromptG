import { describe, expect, it } from "vitest";

import { auditAtoms } from "@/lib/atoms/atom-quality-audit";
import { EXPANDED_ATOMS } from "@/lib/seed/expanded-atoms";
import { SEED_ATOMS } from "@/lib/seed/seed-atoms";

function uniqueAtoms() {
  return [...new Map([...SEED_ATOMS, ...EXPANDED_ATOMS].map((atom) => [atom.id, atom])).values()];
}

describe("atom quality audit", () => {
  it("audits the full approved atom inventory", () => {
    const atoms = uniqueAtoms();
    const audit = auditAtoms(atoms);

    expect(atoms).toHaveLength(785);
    expect(audit.summary.total).toBe(785);
  });

  it("rejects forbidden boilerplate, duplicate prompts, vague prompts, skeleton repetition, and category mismatch", () => {
    const audit = auditAtoms(uniqueAtoms());

    expect(audit.summary.byFlag["forbidden-boilerplate"]).toBe(0);
    expect(audit.summary.byFlag["exact-duplicate-prompt"]).toBe(0);
    expect(audit.summary.byFlag["near-duplicate-prompt"]).toBe(0);
    expect(audit.summary.byFlag["repeated-skeleton"]).toBe(0);
    expect(audit.summary.byFlag["vague-prompt"]).toBe(0);
    expect(audit.summary.byFlag["category-alignment-risk"]).toBe(0);
    expect(audit.summary.byFlag["metadata-risk"]).toBe(0);
  });
});
