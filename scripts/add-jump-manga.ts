#!/usr/bin/env tsx
/**
 * add-jump-manga.ts
 * 週刊少年ジャンプの漫画を books.index.json に追加する
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
if (!API_KEY) { console.error("GOOGLE_BOOKS_API_KEY が設定されていません"); process.exit(1); }

const INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

const TARGETS: Array<{
  title: string;
  searchTitle: string;
  author: string;
  l3Id: string;
  expectedFragment: string;
}> = [
  // ─── 1970〜80年代 ───────────────────────────────────────────────────
  { title: "ドラゴンボール",                   searchTitle: "ドラゴンボール",          author: "鳥山明",         l3Id: "battle",    expectedFragment: "ドラゴンボール" },
  { title: "こちら葛飾区亀有公園前派出所",      searchTitle: "こちら葛飾区亀有公園前派出所", author: "秋本治",      l3Id: "comedy",    expectedFragment: "亀有" },
  { title: "リングにかけろ",                    searchTitle: "リングにかけろ",          author: "車田正美",       l3Id: "sports",    expectedFragment: "リング" },
  { title: "魁!!男塾",                         searchTitle: "魁男塾",                 author: "宮下あきら",     l3Id: "battle",    expectedFragment: "男塾" },

  // ─── 1990年代 ───────────────────────────────────────────────────────
  { title: "幽☆遊☆白書",                      searchTitle: "幽遊白書",               author: "冨樫義博",       l3Id: "battle",    expectedFragment: "幽" },
  { title: "ろくでなしBLUES",                   searchTitle: "ろくでなしBLUES",        author: "森田まさのり",   l3Id: "drama",     expectedFragment: "ろくでなし" },

  // ─── 2000年代 ───────────────────────────────────────────────────────
  { title: "デスノート",                        searchTitle: "デスノート",             author: "大場つぐみ",     l3Id: "mystery",   expectedFragment: "デスノート" },
  { title: "D.Gray-man",                       searchTitle: "D.Gray-man",            author: "星野桂",         l3Id: "battle",    expectedFragment: "Gray" },
  { title: "To LOVEる",                        searchTitle: "To LOVEる",             author: "矢吹健太朗",     l3Id: "romcom",    expectedFragment: "LOVEる" },
  { title: "魔人探偵脳噛ネウロ",                searchTitle: "魔人探偵脳噛ネウロ",      author: "松井優征",       l3Id: "mystery",   expectedFragment: "ネウロ" },
  { title: "PSYREN",                           searchTitle: "PSYREN",                author: "岩代俊明",       l3Id: "sf",        expectedFragment: "PSYREN" },

  // ─── 2010年代 ───────────────────────────────────────────────────────
  { title: "ぬらりひょんの孫",                  searchTitle: "ぬらりひょんの孫",        author: "椎橋寛",         l3Id: "battle",    expectedFragment: "ぬらりひょん" },
  { title: "アクタージュ",                      searchTitle: "アクタージュ",            author: "宇佐崎しろ",     l3Id: "drama",     expectedFragment: "アクタージュ" },
  { title: "僕たちは勉強ができない",             searchTitle: "僕たちは勉強ができない",   author: "筒井大志",       l3Id: "romcom",    expectedFragment: "勉強" },
  { title: "火ノ丸相撲",                        searchTitle: "火ノ丸相撲",             author: "川田",           l3Id: "sports",    expectedFragment: "火ノ丸" },
  { title: "BORUTO",                           searchTitle: "BORUTO NARUTO",         author: "池本幹雄",       l3Id: "battle",    expectedFragment: "BORUTO" },

  // ─── 2020年代 ───────────────────────────────────────────────────────
  { title: "鵺の陰陽師",                        searchTitle: "鵺の陰陽師",             author: "川江康太",       l3Id: "battle",    expectedFragment: "陰陽師" },
  { title: "一ノ瀬家の大罪",                    searchTitle: "一ノ瀬家の大罪",          author: "タイザン5",      l3Id: "drama",     expectedFragment: "一ノ瀬" },
  { title: "アオのハコ",                        searchTitle: "アオのハコ",             author: "三浦糀",         l3Id: "romcom",    expectedFragment: "アオのハコ" },
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

async function searchByQuery(query: string): Promise<GBVolume[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=5&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json() as { items?: GBVolume[] };
  return data.items ?? [];
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function thumbnailUrl(gbId: string): string {
  return `https://books.google.com/books/content?id=${gbId}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`;
}

async function main() {
  const index: Record<string, unknown>[] = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const existingIds = new Set(index.map(b => b.id as string));
  const existingGbIds = new Set(
    index.map(b => (b.sourceIds as { googleBooksId?: string } | undefined)?.googleBooksId).filter(Boolean)
  );
  const existingTitles = new Set(index.map(b => (b.title as string | undefined)?.replace(/\s*\d+$/, "").trim()));

  let added = 0;

  for (const target of TARGETS) {
    // タイトルで既存チェック (巻番号を除いた形で比較)
    if (existingTitles.has(target.title)) {
      console.log(`SKIP (title exists): ${target.title}`);
      continue;
    }

    console.log(`Searching: ${target.title}`);
    const query = `intitle:${target.searchTitle} inauthor:${target.author}`;
    const vols = await searchByQuery(query);
    await delay(500);

    if (!vols.length) {
      console.warn(`  NOT FOUND: ${target.title}`);
      continue;
    }

    // expectedFragment を含む最初の結果を使用
    const vol = vols.find(v => v.volumeInfo.title?.includes(target.expectedFragment));
    if (!vol) {
      console.warn(`  MISMATCH (no fragment "${target.expectedFragment}" in: ${vols.map(v => v.volumeInfo.title).join(", ")})`);
      continue;
    }

    const gbId = vol.id;
    if (existingGbIds.has(gbId)) {
      console.log(`  SKIP (gbId exists): ${vol.volumeInfo.title}`);
      continue;
    }

    const vi = vol.volumeInfo;
    const isbn13 = vi.industryIdentifiers?.find(x => x.type === "ISBN_13")?.identifier;
    const isbn10 = vi.industryIdentifiers?.find(x => x.type === "ISBN_10")?.identifier;
    const finalId = isbn13 ?? `gb-${gbId}`;

    if (existingIds.has(finalId)) {
      console.log(`  SKIP (id exists): ${finalId}`);
      continue;
    }

    const authors = vi.authors ?? [target.author];
    const cats = ["Comics & Graphic Novels"];

    const entry: Record<string, unknown> = {
      id: finalId,
      title: target.title, // 巻番号なしのシリーズ名で統一
      authors,
      categories: cats,
      keywords: cats,
      searchableText: [target.title, ...authors, vi.publisher].filter(Boolean).join(" "),
      updatedAt: new Date().toISOString(),
      language: vi.language ?? "ja",
      thumbnailUrl: thumbnailUrl(gbId),
      sourceIds: { googleBooksId: gbId },
      manualClassification: { l1Id: "manga", l2Id: "shonen", l3Id: target.l3Id },
    };

    if (vi.publisher) entry.publisher = vi.publisher;
    if (vi.publishedDate) entry.publishedDate = vi.publishedDate;
    if (vi.subtitle) entry.subtitle = vi.subtitle;
    if (isbn10) entry.isbn10 = isbn10;
    if (isbn13) entry.isbn13 = isbn13;
    if (vi.pageCount) entry.pageCount = vi.pageCount;

    index.push(entry);
    existingIds.add(finalId);
    existingGbIds.add(gbId);
    existingTitles.add(target.title);
    added++;
    console.log(`  ADDED: ${target.title} [${finalId}] (GB: ${gbId})`);
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\n✓ books.index.json updated (+${added} entries, total: ${index.length})`);
}

main().catch(console.error);
