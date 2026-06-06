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
import { EXPANDED_HAIR_ATOMS } from "@/lib/seed/expanded-atoms";

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "promptg-atom-preview-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  vi.restoreAllMocks();
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
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

  it("builds the production prompt wrapper with the hair-specific instruction", () => {
    const prompt = buildAtomPreviewPrompt(EXPANDED_HAIR_ATOMS[1]);

    expect(prompt).toContain("Create a square 1:1 reference image");
    expect(prompt).toContain("Use an Eastern aesthetic by default");
    expect(prompt).toContain("generic adult subject");
    expect(prompt).toContain("No celebrity likeness");
    expect(prompt).toContain("No celebrity likeness, no brand logo, no copyrighted character");
    expect(prompt).toContain("close portrait or upper-body crop focused on hair shape");
    expect(prompt).toContain(EXPANDED_HAIR_ATOMS[1].prompt);
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
