import { describe, expect, it } from "vitest";

import { toGalleryItem } from "@/lib/db/queries/gallery";
import type { GalleryItemRow } from "@/lib/db/schema";

describe("toGalleryItem", () => {
  it("maps Hermes provenance JSON when present and keeps old rows compatible", () => {
    const row: GalleryItemRow = {
      id: "gallery-1",
      title: "Hermes Prompt",
      previewImagePath: "",
      prompt: "adult editorial portrait",
      sizePreset: "1-1-1024",
      qualityPreset: "high",
      tagsJson: "[]",
      notes: "",
      combinationSnapshotJson: "null",
      hermesProvenanceJson: JSON.stringify({
        rawPrompt: "soft portrait",
        enhancedPrompt: "adult editorial portrait",
        negativePrompt: "underage, explicit nudity",
        preset: "時尚 editorial",
        outputStyle: "mixed technical prompt",
        userInstruction: "自然皮膚質感",
        model: "mimo-v2.5-pro",
        rewriteNotes: ["分層改寫。"],
        riskNotes: ["成年得體。"],
        qualityNotes: ["補強光影。"],
        createdAt: "2026-06-12T14:30:00.000Z",
      }),
      createdAt: "2026-06-12T14:30:00.000Z",
      updatedAt: "2026-06-12T14:30:00.000Z",
    };

    expect(toGalleryItem(row).hermesProvenance?.preset).toBe("時尚 editorial");
    expect(toGalleryItem({ ...row, hermesProvenanceJson: "{}" }).hermesProvenance).toBeNull();
  });
});
