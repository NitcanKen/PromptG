import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  ATOM_PREVIEW_MODEL,
  buildAtomPreviewPrompt,
  parseAtomPreviewArgs,
  runAtomPreviewGeneration,
  selectAtomPreviewTargets,
} from "@/lib/gemini/atom-preview-generator";
import { getCategoryTargetTotal, MAIN_SCOPE_CATEGORY_TARGETS } from "@/lib/seed/expanded-atom-targets";
import { EXPANDED_HAIR_ATOMS } from "@/lib/seed/expanded-atoms";

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "promptg-atom-preview-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  vi.restoreAllMocks();
  delete process.env.ATOM_PREVIEW_API_KEY;
  delete process.env.ATOM_PREVIEW_BASE_URL;
  delete process.env.ATOM_PREVIEW_MODEL;
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("atom preview generator", () => {
  it("selects hair atoms by category, ids, and limit", () => {
    const targets = selectAtomPreviewTargets({
      category: "髮型",
      ids: ["library-hair-curtain-bangs", "library-hair-no-bangs"],
      limit: 1,
    });

    expect(targets).toHaveLength(1);
    expect(targets[0]?.id).toBe("library-hair-curtain-bangs");
  });

  it("builds a provider-agnostic preview prompt with the hair-specific instruction", () => {
    const prompt = buildAtomPreviewPrompt(EXPANDED_HAIR_ATOMS[1]);

    expect(prompt).toContain("Create one square 1:1 image that previews a single visual concept");
    expect(prompt).toContain("Title: 八字瀏海");
    expect(prompt).toContain("Meaning to preserve: curtain bangs");
    expect(prompt).toContain("2.5D semi-realistic anime key visual");
    expect(prompt).toContain("Eastern ACG aesthetic");
    expect(prompt).toContain("adult original ACG character");
    expect(prompt).toContain("No celebrity likeness");
    expect(prompt).toContain("hair design portrait");
    expect(prompt).not.toContain("contemporary East Asian photography");
    expect(prompt).not.toContain("PromptG");
    expect(prompt).not.toContain("atom");
    expect(prompt).not.toContain("library card");
  });

  it("builds persona add-on preview prompts as distinctive adult ACG character references", () => {
    const target = selectAtomPreviewTargets({ ids: ["library-persona-addon-01"] })[0];
    const prompt = buildAtomPreviewPrompt(target);

    expect(prompt).toContain("character design portrait");
    expect(prompt).toContain("distinctive silhouette");
    expect(prompt).toContain("clearly adult original ACG character");
    expect(prompt).toContain("Do not make the subject look underage");
  });

  it("treats scene prompts as environment concepts instead of forcing generic portraits", () => {
    const target = selectAtomPreviewTargets({ ids: ["library-scene-01"] })[0];
    const prompt = buildAtomPreviewPrompt(target);

    expect(prompt).toContain("environment concept image");
    expect(prompt).toContain("the location must be the main subject");
    expect(prompt).toContain("People are optional");
    expect(prompt).not.toContain("PromptG");
    expect(prompt).not.toContain("atom");
  });

  it("parses dry-run CLI scope without requiring an API key", () => {
    expect(
      parseAtomPreviewArgs(["--dry-run", "--category", "髮型", "--ids", "library-hair-curtain-bangs", "--limit", "1"]),
    ).toMatchObject({
      dryRun: true,
      category: "髮型",
      ids: ["library-hair-curtain-bangs"],
      limit: 1,
      force: false,
    });
  });

  it("parses full-library preview scopes for P4D batch runs", () => {
    expect(parseAtomPreviewArgs(["--dry-run", "--all-main"])).toMatchObject({
      dryRun: true,
      scope: "main",
    });
    expect(parseAtomPreviewArgs(["--dry-run", "--all-v2"])).toMatchObject({
      dryRun: true,
      scope: "v2",
    });
  });

  it("selects all approved main-scope preview targets including existing seed atoms", () => {
    const targets = selectAtomPreviewTargets({ scope: "main" });
    const ids = targets.map((atom) => atom.id);

    expect(targets).toHaveLength(getCategoryTargetTotal(MAIN_SCOPE_CATEGORY_TARGETS));
    expect(new Set(ids).size).toBe(targets.length);
    expect(ids).toContain("seed-persona-soft-cinematic");
    expect(ids).toContain("seed-hair-airy-bangs");
    expect(ids).toContain("library-hair-curtain-bangs");
  });

  it("normalizes preview targets with atom defaults before prompt generation", () => {
    const seedTarget = selectAtomPreviewTargets({ ids: ["seed-persona-soft-cinematic"] })[0];

    expect(seedTarget).toMatchObject({
      id: "seed-persona-soft-cinematic",
      priority: "medium",
      lockPolicy: "normal",
    });
  });

  it("does not call the provider or write a manifest during dry-run", async () => {
    const outputDir = await makeTempDir();
    const generate = vi.fn().mockRejectedValue(new Error("dry-run should not call provider"));

    const result = await runAtomPreviewGeneration({
      dryRun: true,
      category: "髮型",
      limit: 2,
      outputDir,
      client: { generate },
    });

    expect(generate).not.toHaveBeenCalled();
    expect(result.planned).toHaveLength(2);
    await expect(fs.stat(path.join(outputDir, "manifest.json"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("skips existing preview files unless force is enabled", async () => {
    const outputDir = await makeTempDir();
    const existingPath = path.join(outputDir, "library-hair-curtain-bangs.png");
    await fs.writeFile(existingPath, Buffer.from("existing"));
    const generate = vi.fn();

    const result = await runAtomPreviewGeneration({
      category: "髮型",
      ids: ["library-hair-curtain-bangs"],
      outputDir,
      client: { generate },
    });

    expect(generate).not.toHaveBeenCalled();
    expect(result.skipped).toEqual(["library-hair-curtain-bangs"]);

    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, "manifest.json"), "utf8"));
    expect(manifest.model).toBe(ATOM_PREVIEW_MODEL);
    expect(manifest.atoms["library-hair-curtain-bangs"].status).toBe("skipped_existing");
  });

  it("writes generated images, manifest entries, and JSONL logs without storing secrets", async () => {
    const outputDir = await makeTempDir();
    const generate = vi.fn().mockResolvedValue({
      bytes: Buffer.from("generated"),
      mimeType: "image/png",
      providerText: "ok",
    });

    const result = await runAtomPreviewGeneration({
      category: "髮型",
      ids: ["library-hair-curtain-bangs"],
      outputDir,
      apiKey: "SECRET_SHOULD_NOT_BE_WRITTEN",
      client: { generate },
      runId: "test-run",
    });

    expect(result.generated).toEqual(["library-hair-curtain-bangs"]);
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: ATOM_PREVIEW_MODEL,
        prompt: expect.stringContaining("八字瀏海"),
      }),
    );

    const image = await fs.readFile(path.join(outputDir, "library-hair-curtain-bangs.png"), "utf8");
    const manifestText = await fs.readFile(path.join(outputDir, "manifest.json"), "utf8");
    const logText = await fs.readFile(path.join(outputDir, "logs", "test-run.jsonl"), "utf8");

    expect(image).toBe("generated");
    expect(manifestText).toContain("library-hair-curtain-bangs");
    expect(logText).toContain("generated");
    expect(`${manifestText}\n${logText}`).not.toContain("SECRET_SHOULD_NOT_BE_WRITTEN");
  });

  it("retries retryable provider failures before recording success", async () => {
    const outputDir = await makeTempDir();
    const retryableError = new Error("rate limited") as Error & { status: number };
    retryableError.status = 429;
    const generate = vi
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValueOnce({
        bytes: Buffer.from("generated-after-retry"),
        mimeType: "image/png",
      });
    const sleep = vi.fn().mockResolvedValue(undefined);

    await runAtomPreviewGeneration({
      category: "髮型",
      ids: ["library-hair-curtain-bangs"],
      outputDir,
      client: { generate },
      maxRetries: 2,
      sleep,
    });

    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, "manifest.json"), "utf8"));

    expect(generate).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(manifest.atoms["library-hair-curtain-bangs"].status).toBe("generated");
    expect(manifest.atoms["library-hair-curtain-bangs"].attempts).toBe(2);
  });
});
