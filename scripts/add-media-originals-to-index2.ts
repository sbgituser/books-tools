#!/usr/bin/env tsx
/**
 * add-media-originals-to-index2.ts
 * ISBNまたは確認済みgbIdで書籍情報を取得してbooks.index.jsonに追加する。
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

// ISBN13 or intitle/inauthor search
const TARGETS: Array<{
  title: string;
  isbn13?: string;
  searchQuery?: string;
  expectedTitleFragment: string;
}> = [
  // 小説
  { title: "探偵ガリレオ",          isbn13: "9784167110017", expectedTitleFragment: "探偵ガリレオ" },
  { title: "オレたちバブル入行組",    isbn13: "9784163236001", expectedTitleFragment: "バブル入行" },
  { title: "下町ロケット",           isbn13: "9784167743024", expectedTitleFragment: "下町ロケット" },
  { title: "陸王",                  isbn13: "9784087716467", expectedTitleFragment: "陸王" },
  { title: "君の名は。",             isbn13: "9784811325026", expectedTitleFragment: "君の名は" },
  { title: "言の葉の庭",             isbn13: "9784811325033", expectedTitleFragment: "言の葉の庭" },
  { title: "天気の子",               isbn13: "9784047352209", expectedTitleFragment: "天気の子" },
  { title: "すずめの戸締まり",        isbn13: "9784041140727", expectedTitleFragment: "すずめ" },
  { title: "永遠の0",                isbn13: "9784569665566", expectedTitleFragment: "永遠の0" },
  { title: "億男",                   isbn13: "9784165070103", expectedTitleFragment: "億男" },
  { title: "女のいない男たち",        isbn13: "9784163900766", expectedTitleFragment: "女のいない男たち" },
  { title: "罪の声",                 isbn13: "9784163904337", expectedTitleFragment: "罪の声" },
  { title: "七王国の玉座",            isbn13: "9784152093332", expectedTitleFragment: "七王国" },
  { title: "ジョーカー・ゲーム",      isbn13: "9784167839963", expectedTitleFragment: "ジョーカー" },
  // 漫画
  { title: "のだめカンタービレ 1",    isbn13: "9784063345421", expectedTitleFragment: "のだめ" },
  { title: "ドラゴン桜 1",           isbn13: "9784063283419", expectedTitleFragment: "ドラゴン桜" },
  { title: "今際の国のアリス 1",      isbn13: "9784091854100", expectedTitleFragment: "今際の国のアリス" },
  { title: "テルマエ・ロマエ 1",      isbn13: "9784047155954", expectedTitleFragment: "テルマエ" },
  { title: "東京喰種トーキョーグール 1", isbn13: "9784088704753", expectedTitleFragment: "東京喰種" },
  { title: "海街diary 1",            isbn13: "9784091883292", expectedTitleFragment: "海街diary" },
  { title: "逃げるは恥だが役に立つ 1", isbn13: "9784063731408", expectedTitleFragment: "逃げるは恥" },
  { title: "ミステリと言う勿れ 1",    isbn13: "9784091840738", expectedTitleFragment: "ミステリ" },
  { title: "翔んで埼玉",             isbn13: "9784592144748", expectedTitleFragment: "翔んで埼玉" },
  { title: "映像研には手を出すな！ 1", isbn13: "9784091888259", expectedTitleFragment: "映像研" },
];

interface GBVol {
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

async function fetchByIsbn(isbn13: string): Promise<GBVol | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as { items?: GBVol[] };
  return data.items?.[0] ?? null;
}

async function searchByQuery(query: string): Promise<GBVol | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=3&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as { items?: GBVol[] };
  return data.items?.[0] ?? null;
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function thumbUrl(gbId: string) {
  return `https://books.google.com/books/content?id=${gbId}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`;
}

async function main() {
  const index: Record<string, unknown>[] = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const existingIds = new Set(index.map(b => b.id as string));
  const existingGbIds = new Set(
    index.map(b => (b.sourceIds as {googleBooksId?: string} | undefined)?.googleBooksId).filter(Boolean)
  );

  let added = 0;

  for (const target of TARGETS) {
    // Check if already present by ISBN
    if (target.isbn13 && existingIds.has(target.isbn13)) {
      console.log(`SKIP (isbn exists): ${target.title}`);
      continue;
    }

    let vol: GBVol | null = null;

    if (target.isbn13) {
      console.log(`Fetching ISBN ${target.isbn13}: ${target.title}`);
      vol = await fetchByIsbn(target.isbn13);
      await delay(400);
    } else if (target.searchQuery) {
      console.log(`Searching: ${target.searchQuery}`);
      vol = await searchByQuery(target.searchQuery);
      await delay(400);
    }

    if (!vol) {
      console.warn(`  NOT FOUND: ${target.title}`);
      continue;
    }

    const vi = vol.volumeInfo;
    const returnedTitle = vi.title ?? "";

    // Verify result matches expected
    if (!returnedTitle.includes(target.expectedTitleFragment)) {
      console.warn(`  MISMATCH: expected "${target.expectedTitleFragment}" in "${returnedTitle}"`);
      continue;
    }

    const gbId = vol.id;
    if (existingGbIds.has(gbId)) {
      console.log(`  SKIP (gbId exists): ${returnedTitle}`);
      continue;
    }

    const isbn13 = vi.industryIdentifiers?.find(x => x.type === "ISBN_13")?.identifier;
    const isbn10 = vi.industryIdentifiers?.find(x => x.type === "ISBN_10")?.identifier;
    const finalId = isbn13 ?? `gb-${gbId}`;

    if (existingIds.has(finalId)) {
      console.log(`  SKIP (final id exists): ${finalId}`);
      continue;
    }

    const cats = vi.categories ?? ["漫画・コミック"];
    const authors = vi.authors ?? [];

    const entry: Record<string, unknown> = {
      id: finalId,
      title: returnedTitle,
      authors,
      categories: cats,
      keywords: [...cats],
      searchableText: [returnedTitle, vi.subtitle, ...authors, vi.publisher, ...cats].filter(Boolean).join(" "),
      updatedAt: new Date().toISOString(),
      publisher: vi.publisher,
      publishedDate: vi.publishedDate,
      language: vi.language ?? "ja",
      thumbnailUrl: thumbUrl(gbId),
      sourceIds: { googleBooksId: gbId },
    };
    if (vi.subtitle) entry.subtitle = vi.subtitle;
    if (isbn10) entry.isbn10 = isbn10;
    if (isbn13) entry.isbn13 = isbn13;
    if (vi.pageCount) entry.pageCount = vi.pageCount;

    index.push(entry);
    existingIds.add(finalId);
    existingGbIds.add(gbId);
    added++;
    console.log(`  ADDED: ${returnedTitle} [${finalId}]`);
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\n✓ books.index.json updated (+${added} entries, total: ${index.length})`);
}

main().catch(console.error);
