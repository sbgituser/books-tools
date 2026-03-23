#!/usr/bin/env tsx
/**
 * add-battle-manga2.ts
 * バトル漫画追加分（17作品）
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
  l2Id: string;
  expectedFragment: string;
}> = [
  // ─── 青年誌バトル ──────────────────────────────────────────────────
  { title: "CLAYMORE",          searchTitle: "CLAYMORE",              author: "八木教広",   l2Id: "seinen", expectedFragment: "CLAYMORE" },
  { title: "ダーウィンズゲーム", searchTitle: "ダーウィンズゲーム",     author: "矢樹純",     l2Id: "seinen", expectedFragment: "ダーウィン" },
  { title: "神さまの言うとおり", searchTitle: "神さまの言うとおり",     author: "藤村緋二",   l2Id: "seinen", expectedFragment: "神さま" },
  { title: "刃牙道",             searchTitle: "刃牙道",                author: "板垣恵介",   l2Id: "seinen", expectedFragment: "刃牙" },
  { title: "修羅の門",           searchTitle: "修羅の門",              author: "川原正敏",   l2Id: "seinen", expectedFragment: "修羅" },
  { title: "コブラ",             searchTitle: "コブラ",                author: "寺沢武一",   l2Id: "seinen", expectedFragment: "コブラ" },
  { title: "ドリフターズ",        searchTitle: "ドリフターズ",          author: "平野耕太",   l2Id: "seinen", expectedFragment: "ドリフター" },
  { title: "天上天下",           searchTitle: "天上天下",              author: "Oh!great",  l2Id: "seinen", expectedFragment: "天上天下" },
  { title: "超人ロック",          searchTitle: "超人ロック",            author: "聖悠紀",     l2Id: "seinen", expectedFragment: "ロック" },
  { title: "戦国妖狐",           searchTitle: "戦国妖狐",              author: "水上悟志",   l2Id: "seinen", expectedFragment: "戦国妖狐" },

  // ─── 少年誌バトル ──────────────────────────────────────────────────
  { title: "アカメが斬る！",      searchTitle: "アカメが斬る",          author: "テタ",       l2Id: "shonen", expectedFragment: "アカメ" },
  { title: "タイガーマスク",      searchTitle: "タイガーマスク",        author: "梶原一騎",   l2Id: "shonen", expectedFragment: "タイガー" },
  { title: "うえきの法則",        searchTitle: "うえきの法則",          author: "福地翼",     l2Id: "shonen", expectedFragment: "うえき" },
  { title: "テガミバチ",          searchTitle: "テガミバチ",            author: "浅田弘幸",   l2Id: "shonen", expectedFragment: "テガミ" },
  { title: "ゾンビパウダー",      searchTitle: "ゾンビパウダー",        author: "久保帯人",   l2Id: "shonen", expectedFragment: "ゾンビパウダー" },
  { title: "ムヒョとロージーの魔法律相談事務所", searchTitle: "ムヒョとロージー", author: "西義之", l2Id: "shonen", expectedFragment: "ムヒョ" },

  // ─── isekai・ファンタジーバトル ────────────────────────────────────
  { title: "Re:ゼロから始める異世界生活",  searchTitle: "リゼロ Re:ゼロ",  author: "大塚真一郎", l2Id: "seinen", expectedFragment: "ゼロ" },
];

interface GBVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: { type: string; identifier: string }[];
    language?: string;
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
  const existingTitles = new Set(index.map(b => (b.title as string | undefined)?.replace(/\s*(モノクロ版|カラー版)?\s*[\d（）()１-９]+.*$/, "").trim()));

  let added = 0;
  const notFound: string[] = [];

  for (const target of TARGETS) {
    if (existingTitles.has(target.title)) {
      console.log(`SKIP (exists): ${target.title}`);
      continue;
    }

    console.log(`Searching: ${target.title}`);

    let vols = await searchByQuery(`intitle:${target.searchTitle} inauthor:${target.author}`);
    await delay(400);

    if (!vols.find(v => v.volumeInfo.title?.includes(target.expectedFragment))) {
      vols = await searchByQuery(`intitle:${target.searchTitle}`);
      await delay(400);
    }

    const vol = vols.find(v => v.volumeInfo.title?.includes(target.expectedFragment));
    if (!vol) {
      console.warn(`  NOT FOUND: ${target.title} [${vols.map(v => v.volumeInfo.title).join(", ") || "none"}]`);
      notFound.push(target.title);
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

    const entry: Record<string, unknown> = {
      id: finalId,
      title: target.title,
      authors: vi.authors ?? [target.author],
      categories: ["Comics & Graphic Novels"],
      keywords: ["Comics & Graphic Novels"],
      searchableText: [target.title, ...(vi.authors ?? [target.author]), vi.publisher].filter(Boolean).join(" "),
      updatedAt: new Date().toISOString(),
      language: vi.language ?? "ja",
      thumbnailUrl: thumbnailUrl(gbId),
      sourceIds: { googleBooksId: gbId },
      manualClassification: { l1Id: "manga", l2Id: target.l2Id, l3Id: "battle" },
    };

    if (vi.publisher) entry.publisher = vi.publisher;
    if (vi.publishedDate) entry.publishedDate = vi.publishedDate;
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
  if (notFound.length) {
    console.log(`\n未登録 (${notFound.length}件): ${notFound.join(", ")}`);
  }
}

main().catch(console.error);
