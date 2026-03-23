#!/usr/bin/env tsx
/**
 * add-horror-manga.ts
 * ホラー漫画30作品を books.index.json に追加する
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
  // ─── 少年誌ホラー ──────────────────────────────────────────────────
  { title: "地獄先生ぬ～べ～",         searchTitle: "地獄先生ぬ べ",       author: "岡野剛",       l2Id: "shonen", expectedFragment: "ぬ" },
  { title: "漂流教室",                 searchTitle: "漂流教室",             author: "楳図かずお",   l2Id: "shonen", expectedFragment: "漂流教室" },
  { title: "恐怖新聞",                 searchTitle: "恐怖新聞",             author: "つのだじろう", l2Id: "shonen", expectedFragment: "恐怖新聞" },
  { title: "うしろの百太郎",           searchTitle: "うしろの百太郎",        author: "つのだじろう", l2Id: "shonen", expectedFragment: "百太郎" },
  { title: "エコエコアザラク",          searchTitle: "エコエコアザラク",      author: "古賀新一",     l2Id: "shonen", expectedFragment: "エコエコ" },
  { title: "怪物王女",                 searchTitle: "怪物王女",             author: "光永康則",     l2Id: "shonen", expectedFragment: "怪物王女" },
  { title: "屍鬼",                     searchTitle: "屍鬼",                 author: "藤崎竜",       l2Id: "shonen", expectedFragment: "屍鬼" },
  { title: "デビルマン",               searchTitle: "デビルマン",           author: "永井豪",       l2Id: "shonen", expectedFragment: "デビルマン" },
  { title: "ゲゲゲの鬼太郎",           searchTitle: "ゲゲゲの鬼太郎",        author: "水木しげる",   l2Id: "shonen", expectedFragment: "鬼太郎" },
  { title: "惡の華",                   searchTitle: "惡の華",               author: "押見修造",     l2Id: "shonen", expectedFragment: "華" },
  { title: "魔法少女サイト",           searchTitle: "魔法少女サイト",        author: "佐藤健太郎",   l2Id: "shonen", expectedFragment: "サイト" },

  // ─── 青年誌ホラー ──────────────────────────────────────────────────
  { title: "うずまき",                 searchTitle: "うずまき",             author: "伊藤潤二",     l2Id: "seinen", expectedFragment: "うずまき" },
  { title: "富江",                     searchTitle: "富江",                 author: "伊藤潤二",     l2Id: "seinen", expectedFragment: "富江" },
  { title: "地獄星レミナ",             searchTitle: "地獄星レミナ",          author: "伊藤潤二",     l2Id: "seinen", expectedFragment: "レミナ" },
  { title: "血の轍",                   searchTitle: "血の轍",               author: "押見修造",     l2Id: "seinen", expectedFragment: "血の轍" },
  { title: "ドロヘドロ",               searchTitle: "ドロヘドロ",           author: "林田球",       l2Id: "seinen", expectedFragment: "ドロヘドロ" },
  { title: "ハピネス",                 searchTitle: "ハピネス",             author: "押見修造",     l2Id: "seinen", expectedFragment: "ハピネス" },
  { title: "ホムンクルス",             searchTitle: "ホムンクルス",          author: "山本英夫",     l2Id: "seinen", expectedFragment: "ホムンクルス" },
  { title: "わたしは真悟",             searchTitle: "わたしは真悟",          author: "楳図かずお",   l2Id: "seinen", expectedFragment: "真悟" },
  { title: "ハイスクール・オブ・ザ・デッド", searchTitle: "ハイスクール オブ ザ デッド", author: "佐藤ショウジ", l2Id: "seinen", expectedFragment: "デッド" },
  { title: "ゾンビ100〜ゾンビになるまでにしたい100のこと〜", searchTitle: "ゾンビ100", author: "麻生羽呂", l2Id: "seinen", expectedFragment: "ゾンビ100" },
  { title: "不安の種",                 searchTitle: "不安の種",             author: "中山昌亮",     l2Id: "seinen", expectedFragment: "不安の種" },
  { title: "アウター・ゾーン",          searchTitle: "アウター・ゾーン",      author: "光原伸",       l2Id: "seinen", expectedFragment: "アウター" },
  { title: "七夕の国",                 searchTitle: "七夕の国",             author: "岩明均",       l2Id: "seinen", expectedFragment: "七夕" },
  { title: "ミスミソウ",               searchTitle: "ミスミソウ",           author: "押見修造",     l2Id: "seinen", expectedFragment: "ミスミソウ" },
  { title: "なるたる",                 searchTitle: "なるたる",             author: "鬼頭莫宏",     l2Id: "seinen", expectedFragment: "なるたる" },
  { title: "ぼくらの",                 searchTitle: "ぼくらの",             author: "鬼頭莫宏",     l2Id: "seinen", expectedFragment: "ぼくらの" },

  // ─── 少女誌ホラー ──────────────────────────────────────────────────
  { title: "ポーの一族",               searchTitle: "ポーの一族",           author: "萩尾望都",     l2Id: "shojo",  expectedFragment: "ポーの一族" },
  { title: "鬼子母神",                 searchTitle: "鬼子母神",             author: "山岸凉子",     l2Id: "shojo",  expectedFragment: "鬼子母神" },
  { title: "闇の末裔",                 searchTitle: "闇の末裔",             author: "松下容子",     l2Id: "shojo",  expectedFragment: "闇の末裔" },
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
  const existingTitles = new Set(index.map(b =>
    (b.title as string | undefined)?.replace(/\s*(モノクロ版|カラー版)?\s*[\d（）()１-９]+.*$/, "").trim()
  ));

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
      manualClassification: { l1Id: "manga", l2Id: target.l2Id, l3Id: "horror" },
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
