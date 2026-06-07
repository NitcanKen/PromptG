import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const rankerListId = 1002225;
const rankerItemsUrl =
  `https://api.ranker.com/lists/${rankerListId}/items?` +
  new URLSearchParams({
    limit: "273",
    offset: "0",
    useDefaultNodeLinks: "false",
    include:
      "votes,wikiText,rankings,serviceProviders,openListItemContributors,taggedLists",
    propertyFetchType: "SHOWN_ON_LIST_ONLY",
  }).toString();

const docsPath = path.join(process.cwd(), "docs", "anime_char.md");
const outputPath = path.join(process.cwd(), "src", "lib", "seed", "anime-character-atoms.ts");
const previewRoot = path.join(process.cwd(), "data", "uploads", "atom-previews");
const previewRoutePrefix = "/api/uploads/atom-previews";

type AnimeCharacter = {
  rank: number;
  name: string;
  series: string;
};

type RankerItem = {
  rank?: number;
  name?: string;
  image?: {
    url?: string;
    imgixUrl?: string;
  };
  node?: {
    nodeProperty?: {
      propertyValue?: string;
    };
  };
};

function normalizeName(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function atomId(rank: number) {
  return `library-anime-character-${String(rank).padStart(3, "0")}`;
}

function sourceHash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function imageUrlForDownload(url: string) {
  const parsed = new URL(url);
  parsed.searchParams.set("fit", "crop");
  parsed.searchParams.set("fm", "jpg");
  parsed.searchParams.set("q", "85");
  parsed.searchParams.set("dpr", "1");
  parsed.searchParams.set("w", "600");
  parsed.searchParams.set("h", "600");
  return parsed.toString();
}

function parseAnimeCharacterDoc(text: string) {
  return text
    .split(/\n+/)
    .map((line) => {
      const match = line.match(/^(\d+)\.\s+(.+?)\s+—\s+(.+)$/);
      if (!match) {
        throw new Error(`Cannot parse anime character line: ${line}`);
      }

      return {
        rank: Number(match[1]),
        name: match[2].trim(),
        series: match[3].trim(),
      };
    })
    .filter((character) => character.name && character.series);
}

async function fetchRankerItems() {
  const response = await fetch(rankerItemsUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Ranker API failed: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as { listItems?: RankerItem[] };
  if (!Array.isArray(body.listItems)) {
    throw new Error("Ranker API response does not include listItems");
  }

  return body.listItems;
}

function matchRankerItem(character: AnimeCharacter, rankerItems: RankerItem[]) {
  const byName = new Map(
    rankerItems
      .filter((item) => item.name)
      .map((item) => [normalizeName(item.name ?? ""), item] as const),
  );
  const nameMatch = byName.get(normalizeName(character.name));

  if (nameMatch) {
    return nameMatch;
  }

  const rankMatch = rankerItems.find((item) => item.rank === character.rank);
  if (!rankMatch) {
    throw new Error(`Cannot match Ranker item for #${character.rank} ${character.name}`);
  }

  return rankMatch;
}

function atomSource(character: AnimeCharacter, previewImagePath: string) {
  return `  {
    id: "${atomId(character.rank)}",
    source: "anime-character-atoms",
    category: "人設",
    title: ${JSON.stringify(character.name)},
    subtitle: ${JSON.stringify(`動漫角色 / ${character.series}`)},
    previewImagePath: ${JSON.stringify(previewImagePath)},
    prompt: ${JSON.stringify(`${character.name}, anime character from ${character.series}`)},
    negativePrompt: "wrong character, unrelated anime character, low quality screenshot, distorted face",
    priority: "reference",
    lockPolicy: "normal",
    tags: ["人設", "動漫角色"],
    notes: ${JSON.stringify(`依 docs/anime_char.md 第 ${character.rank} 位新增；預覽圖來源為 Ranker 對應角色圖。`)},
  }`;
}

async function downloadImage(url: string, filePath: string) {
  const existing = await fs.stat(filePath).catch(() => null);
  if (existing?.isFile() && existing.size > 0) {
    return "skipped";
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: "https://www.ranker.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} ${response.statusText} ${url}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Unexpected image content-type ${contentType} for ${url}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new Error(`Downloaded empty image: ${url}`);
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, bytes);
  return "downloaded";
}

async function main() {
  const characters = parseAnimeCharacterDoc(await fs.readFile(docsPath, "utf8"));
  const rankerItems = await fetchRankerItems();

  if (characters.length !== 273) {
    throw new Error(`Expected 273 anime characters, got ${characters.length}`);
  }

  if (rankerItems.length < characters.length) {
    throw new Error(`Expected at least ${characters.length} Ranker items, got ${rankerItems.length}`);
  }

  let downloaded = 0;
  let skipped = 0;
  const missingImages: string[] = [];
  const atomEntries: string[] = [];

  for (const character of characters) {
    const rankerItem = matchRankerItem(character, rankerItems);
    const rawImageUrl = rankerItem.image?.imgixUrl ?? rankerItem.image?.url;

    if (!rawImageUrl) {
      missingImages.push(`#${character.rank} ${character.name}`);
      atomEntries.push(atomSource(character, ""));
      continue;
    }

    const imageUrl = imageUrlForDownload(rawImageUrl);
    const filename = `${sourceHash(imageUrl)}.jpg`;
    const id = atomId(character.rank);
    const filePath = path.join(previewRoot, id, filename);
    const previewImagePath = `${previewRoutePrefix}/${id}/${filename}`;
    const result = await downloadImage(imageUrl, filePath);

    downloaded += result === "downloaded" ? 1 : 0;
    skipped += result === "skipped" ? 1 : 0;
    atomEntries.push(atomSource(character, previewImagePath));
  }

  const source = `import type { ExpandedAtom } from "@/lib/seed/expanded-atoms";

export const EXPANDED_ANIME_CHARACTER_ATOMS = [
${atomEntries.join(",\n")}
] satisfies ExpandedAtom[];
`;

  await fs.writeFile(outputPath, source);

  console.log(
    JSON.stringify(
      {
        characters: characters.length,
        rankerItems: rankerItems.length,
        downloaded,
        skipped,
        missingImages,
        outputPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
