export const TAG_COLLAPSED_LIMIT = 12;

export function getVisibleTags(tags: string[], expanded: boolean) {
  const canToggle = tags.length > TAG_COLLAPSED_LIMIT;
  const visibleTags = canToggle && !expanded ? tags.slice(0, TAG_COLLAPSED_LIMIT) : tags;

  return {
    visibleTags,
    hiddenCount: tags.length - visibleTags.length,
    canToggle,
  };
}
