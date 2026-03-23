#!/usr/bin/env tsx
/**
 * add-media-originals-to-index.ts
 *
 * 映像から原作を探す ツール用の未登録作品を
 * Google Books API で取得して src/data/books.index.json に追加する。
 */

import * as fs from "fs";
import * as path from "path";

{
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  }
}

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
if (!API_KEY) {
  console.error("GOOGLE_BOOKS_API_KEY が設定されていません");
  process.exit(1);
}

const INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

// Google Books IDs from previous fetch run
const NEW_WORKS: Array<{ gbId: string; query: string; manualType?: string }> = [
  { gbId: "dz3cDAAAQBAJ", query: "探偵ガリレオ 東野圭吾" },
  { gbId: "ITHyAAAAMAAJ", query: "オレたちバブル入行組 池井戸潤" },
  { gbId: "tA1jDwAAQBAJ", query: "下町ロケット 池井戸潤" },
  { gbId: "dLNADwAAQBAJ", query: "陸王 池井戸潤" },
  { gbId: "aYP2vwEACAAJ", query: "君の名は。 新海誠" },
  { gbId: "mi8hwAEACAAJ", query: "言の葉の庭 新海誠" },
  { gbId: "j4gcyQEACAAJ", query: "天気の子 新海誠" },
  { gbId: "1QgN0AEACAAJ", query: "すずめの戸締まり 新海誠" },
  { gbId: "dRjNDwAAQBAJ", query: "永遠の0 百田尚樹" },
  { gbId: "0265DAAAQBAJ", query: "億男 川村元気" },
  { gbId: "Dw7NDwAAQBAJ", query: "ドライブ・マイ・カー 村上春樹 女のいない男たち" },
  { gbId: "Ld0IDgAAQBAJ", query: "罪の声 塩田武士" },
  { gbId: "7kawDwAAQBAJ", query: "七王国の玉座 ジョージ・R・R・マーティン" },
  { gbId: "6C9CDQAAQBAJ", query: "のだめカンタービレ 二ノ宮知子" },
  { gbId: "7aExEAAAQBAJ", query: "ドラゴン桜 三田紀房" },
  { gbId: "rabzCgAAQBAJ", query: "今際の国のアリス 麻生羽呂" },
  { gbId: "sApZ0AEACAAJ", query: "テルマエ・ロマエ ヤマザキマリ" },
  { gbId: "3ilRDwAAQBAJ", query: "東京喰種トーキョーグール 石田スイ" },
  { gbId: "p4lZCwAAQBAJ", query: "海街diary 吉田秋生" },
  { gbId: "TLinDwAAQBAJ", query: "逃げるは恥だが役に立つ 海野つなみ" },
  { gbId: "-ZS7EQAAQBAJ", query: "ミステリと言う勿れ 田村由美" },
  { gbId: "dwfzwQEACAAJ", query: "翔んで埼玉 魔夜峰央" },
  { gbId: "o7HeDwAAQBAJ", query: "映像研には手を出すな！ 大童澄瞳" },
  { gbId: "bLxlDwAAQBAJ", query: "ジョーカー・ゲーム 柳広司" },
];

interface GBVolume {
  id: string;
  volumeInfo: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string };
    language?: string;
    categories?: string[];
  };
}

async function fetchByGbId(gbId: string): Promise<GBVolume | null> {
  const url = `https://www.googleapis.com/books/v1/volumes/${gbId}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as GBVolume;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function thumbnailUrl(gbId: string): string {
  return `https://books.google.com/books/content?id=${gbId}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`;
}

async function main() {
  const index: Record<string, unknown>[] = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const existingIds = new Set(index.map((b) => b.id as string));
  const existingGbIds = new Set(
    index
      .map((b) => (b.sourceIds as { googleBooksId?: string } | undefined)?.googleBooksId)
      .filter(Boolean)
  );

  let addedCount = 0;

  for (const work of NEW_WORKS) {
    const entryId = `gb-${work.gbId}`;
    if (existingIds.has(entryId) || existingGbIds.has(work.gbId)) {
      console.log(`SKIP (exists): ${work.query}`);
      continue;
    }

    console.log(`Fetching: ${work.query} (${work.gbId})`);
    const vol = await fetchByGbId(work.gbId);
    await delay(400);

    if (!vol) {
      console.warn(`  NOT FOUND`);
      continue;
    }

    const vi = vol.volumeInfo;
    const isbn13 = vi.industryIdentifiers?.find((x) => x.type === "ISBN_13")?.identifier;
    const isbn10 = vi.industryIdentifiers?.find((x) => x.type === "ISBN_10")?.identifier;

    // Use ISBN13 as id if available, otherwise gb-<id>
    const finalId = isbn13 ?? entryId;

    if (existingIds.has(finalId)) {
      console.log(`  SKIP (isbn exists): ${finalId}`);
      continue;
    }

    const categories = vi.categories ?? ["小説・文学"];
    const authors = vi.authors ?? [];

    const entry: Record<string, unknown> = {
      id: finalId,
      title: vi.title ?? work.query.split(" ")[0],
      authors,
      categories,
      keywords: [...categories],
      searchableText: [
        vi.title,
        vi.subtitle,
        ...authors,
        vi.publisher,
        ...categories,
      ]
        .filter(Boolean)
        .join(" "),
      updatedAt: new Date().toISOString(),
      publisher: vi.publisher,
      publishedDate: vi.publishedDate,
      language: vi.language ?? "ja",
      thumbnailUrl: thumbnailUrl(work.gbId),
      sourceIds: { googleBooksId: work.gbId },
    };

    if (vi.subtitle) entry.subtitle = vi.subtitle;
    if (isbn10) entry.isbn10 = isbn10;
    if (isbn13) entry.isbn13 = isbn13;
    if (vi.pageCount) entry.pageCount = vi.pageCount;

    index.push(entry);
    existingIds.add(finalId);
    existingGbIds.add(work.gbId);
    addedCount++;
    console.log(`  ADDED: ${vi.title} [${finalId}]`);
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\n✓ books.index.json updated (+${addedCount} entries, total: ${index.length})`);
}

main().catch(console.error);
