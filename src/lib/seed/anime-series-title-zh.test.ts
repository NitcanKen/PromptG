import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { ANIME_SERIES_TITLE_ZH } from "@/lib/seed/anime-series-title-zh";

function documentedSeries() {
  return [
    ...new Set(
      fs
        .readFileSync(path.join(process.cwd(), "docs", "anime_char.md"), "utf8")
        .trim()
        .split(/\n+/)
        .map((line) => line.match(/^\d+\.\s+.+?\s+—\s+(.+)$/)?.[1])
        .filter((series): series is string => Boolean(series)),
    ),
  ];
}

describe("anime series Traditional Chinese titles", () => {
  it("covers every series referenced by docs/anime_char.md", () => {
    const missing = documentedSeries().filter((series) => !ANIME_SERIES_TITLE_ZH[series]);

    expect(missing).toEqual([]);
  });

  it("uses Chinese display names for common anime source tags", () => {
    expect(ANIME_SERIES_TITLE_ZH["Spy x Family"]).toBe("間諜家家酒");
    expect(ANIME_SERIES_TITLE_ZH["Rascal Does Not Dream of Bunny Girl Senpai"]).toBe(
      "青春豬頭少年不會夢到兔女郎學姊",
    );
    expect(ANIME_SERIES_TITLE_ZH["Demon Slayer: Kimetsu no Yaiba"]).toBe("鬼滅之刃");
  });
});

