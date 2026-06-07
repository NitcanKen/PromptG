import { describe, expect, it } from "vitest";

import { getVisibleTags, TAG_COLLAPSED_LIMIT } from "@/lib/atoms/tag-display";

describe("tag display helpers", () => {
  it("shows all tags when the list fits the collapsed limit", () => {
    const tags = Array.from({ length: TAG_COLLAPSED_LIMIT }, (_, index) => `tag-${index}`);

    expect(getVisibleTags(tags, false)).toEqual({
      visibleTags: tags,
      hiddenCount: 0,
      canToggle: false,
    });
  });

  it("collapses long tag lists until expanded", () => {
    const tags = Array.from({ length: TAG_COLLAPSED_LIMIT + 4 }, (_, index) => `tag-${index}`);

    expect(getVisibleTags(tags, false)).toEqual({
      visibleTags: tags.slice(0, TAG_COLLAPSED_LIMIT),
      hiddenCount: 4,
      canToggle: true,
    });
    expect(getVisibleTags(tags, true)).toEqual({
      visibleTags: tags,
      hiddenCount: 0,
      canToggle: true,
    });
  });
});
