#!/usr/bin/env tsx
/**
 * add-battle-manga.ts
 * バトル漫画30作品を books.index.json に追加する
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
  // ─── 少年誌バトル（メジャー） ───────────────────────────────────────
  { title: "僕のヒーローアカデミア",        searchTitle: "僕のヒーローアカデミア",    author: "堀越耕平",     l2Id: "shonen", expectedFragment: "ヒーロー" },
  { title: "ワンパンマン",                  searchTitle: "ワンパンマン",              author: "村田雄介",     l2Id: "shonen", expectedFragment: "ワンパンマン" },
  { title: "FAIRY TAIL",                   searchTitle: "FAIRY TAIL",               author: "真島ヒロ",     l2Id: "shonen", expectedFragment: "FAIRY" },
  { title: "ジョジョの奇妙な冒険",           searchTitle: "ジョジョの奇妙な冒険",      author: "荒木飛呂彦",   l2Id: "shonen", expectedFragment: "ジョジョ" },
  { title: "ドラゴンクエスト ダイの大冒険",  searchTitle: "ダイの大冒険",             author: "三条陸",       l2Id: "shonen", expectedFragment: "ダイ" },
  { title: "金色のガッシュ!!",              searchTitle: "金色のガッシュ",            author: "雷句誠",       l2Id: "shonen", expectedFragment: "ガッシュ" },
  { title: "マギ",                          searchTitle: "マギ",                     author: "大高忍",       l2Id: "shonen", expectedFragment: "マギ" },
  { title: "七つの大罪",                    searchTitle: "七つの大罪",               author: "鈴木央",       l2Id: "shonen", expectedFragment: "七つの大罪" },
  { title: "犬夜叉",                        searchTitle: "犬夜叉",                   author: "高橋留美子",   l2Id: "shonen", expectedFragment: "犬夜叉" },

  // ─── 少年誌バトル（中堅・クラシック） ─────────────────────────────────
  { title: "うしおととら",                  searchTitle: "うしおととら",              author: "藤田和日郎",   l2Id: "shonen", expectedFragment: "うしお" },
  { title: "からくりサーカス",               searchTitle: "からくりサーカス",          author: "藤田和日郎",   l2Id: "shonen", expectedFragment: "からくり" },
  { title: "烈火の炎",                      searchTitle: "烈火の炎",                 author: "安西信行",     l2Id: "shonen", expectedFragment: "烈火" },
  { title: "BLACK CAT",                    searchTitle: "BLACK CAT",               author: "矢吹健太朗",   l2Id: "shonen", expectedFragment: "CAT" },
  { title: "魔法先生ネギま！",               searchTitle: "魔法先生ネギま",            author: "赤松健",       l2Id: "shonen", expectedFragment: "ネギま" },
  { title: "風魔の小次郎",                  searchTitle: "風魔の小次郎",              author: "車田正美",     l2Id: "shonen", expectedFragment: "風魔" },
  { title: "覚悟のススメ",                  searchTitle: "覚悟のススメ",              author: "山口貴由",     l2Id: "shonen", expectedFragment: "覚悟" },

  // ─── 少年誌バトル（isekai・現代） ──────────────────────────────────
  { title: "転生したらスライムだった件",     searchTitle: "転生したらスライムだった件",  author: "川上泰樹",     l2Id: "shonen", expectedFragment: "スライム" },
  { title: "盾の勇者の成り上がり",           searchTitle: "盾の勇者の成り上がり",      author: "木緒なち",     l2Id: "shonen", expectedFragment: "盾の勇者" },

  // ─── 青年誌バトル ──────────────────────────────────────────────────
  { title: "ベルセルク",                    searchTitle: "ベルセルク",               author: "三浦建太郎",   l2Id: "seinen", expectedFragment: "ベルセルク" },
  { title: "東京喰種トーキョーグール",        searchTitle: "東京喰種",                 author: "石田スイ",     l2Id: "seinen", expectedFragment: "喰種" },
  { title: "寄生獣",                        searchTitle: "寄生獣",                   author: "岩明均",       l2Id: "seinen", expectedFragment: "寄生獣" },
  { title: "GANTZ",                         searchTitle: "GANTZ",                   author: "奥浩哉",       l2Id: "seinen", expectedFragment: "GANTZ" },
  { title: "ヴィンランド・サガ",             searchTitle: "ヴィンランド サガ",         author: "幸村誠",       l2Id: "seinen", expectedFragment: "ヴィンランド" },
  { title: "亜人",                          searchTitle: "亜人",                     author: "桜井画門",     l2Id: "seinen", expectedFragment: "亜人" },
  { title: "無限の住人",                    searchTitle: "無限の住人",               author: "沙村広明",     l2Id: "seinen", expectedFragment: "無限" },
  { title: "HELLSING",                     searchTitle: "HELLSING",                author: "平野耕太",     l2Id: "seinen", expectedFragment: "HELLSING" },
  { title: "テラフォーマーズ",               searchTitle: "テラフォーマーズ",          author: "橘賢一",       l2Id: "seinen", expectedFragment: "テラフォーマーズ" },
  { title: "彼岸島",                        searchTitle: "彼岸島",                   author: "松本光司",     l2Id: "seinen", expectedFragment: "彼岸島" },
  { title: "将国のアルタイル",               searchTitle: "将国のアルタイル",          author: "カトウコトノ", l2Id: "seinen", expectedFragment: "アルタイル" },
  { title: "NEEDLESS",                      searchTitle: "NEEDLESS",                author: "今井神",       l2Id: "shonen", expectedFragment: "NEEDLESS" },
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
