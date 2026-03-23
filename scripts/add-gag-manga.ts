#!/usr/bin/env tsx
/**
 * add-gag-manga.ts
 * ギャグ・コメディ漫画30作品を books.index.json に追加する
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
  // ─── 少年誌ギャグ ──────────────────────────────────────────────────
  { title: "ケロロ軍曹",                      searchTitle: "ケロロ軍曹",              author: "吉崎観音",       l2Id: "shonen", expectedFragment: "ケロロ" },
  { title: "ギャグマンガ日和",                 searchTitle: "ギャグマンガ日和",         author: "増田こうすけ",   l2Id: "shonen", expectedFragment: "ギャグマンガ" },
  { title: "磯部磯兵衛物語〜浮世はつらいよ〜", searchTitle: "磯部磯兵衛物語",           author: "仲間りょう",     l2Id: "shonen", expectedFragment: "磯兵衛" },
  { title: "世紀末リーダー伝たけし！",          searchTitle: "世紀末リーダー伝たけし",   author: "高橋陽一",       l2Id: "shonen", expectedFragment: "たけし" },
  { title: "エンジェル伝説",                   searchTitle: "エンジェル伝説",           author: "八木教広",       l2Id: "shonen", expectedFragment: "エンジェル伝説" },
  { title: "とっても！ラッキーマン",            searchTitle: "とっても ラッキーマン",     author: "ガモウひろし",   l2Id: "shonen", expectedFragment: "ラッキーマン" },
  { title: "浦安鉄筋家族",                     searchTitle: "浦安鉄筋家族",            author: "浜岡賢次",       l2Id: "shonen", expectedFragment: "浦安" },
  { title: "幕張",                             searchTitle: "幕張",                   author: "木多康昭",       l2Id: "shonen", expectedFragment: "幕張" },
  { title: "侵略！イカ娘",                     searchTitle: "侵略 イカ娘",             author: "安部真弘",       l2Id: "shonen", expectedFragment: "イカ娘" },
  { title: "スクールランブル",                  searchTitle: "スクールランブル",         author: "小林尽",         l2Id: "shonen", expectedFragment: "スクールランブル" },
  { title: "さよなら絶望先生",                  searchTitle: "さよなら絶望先生",         author: "久米田康治",     l2Id: "shonen", expectedFragment: "絶望先生" },
  { title: "じょしらく",                        searchTitle: "じょしらく",              author: "久米田康治",     l2Id: "shonen", expectedFragment: "じょしらく" },
  { title: "アホガール",                        searchTitle: "アホガール",              author: "ひろゆき",       l2Id: "shonen", expectedFragment: "アホガール" },
  { title: "魁!!クロマティ高校",                searchTitle: "クロマティ高校",          author: "野中英次",       l2Id: "shonen", expectedFragment: "クロマティ" },
  { title: "おそ松くん",                        searchTitle: "おそ松くん",              author: "赤塚不二夫",     l2Id: "shonen", expectedFragment: "おそ松" },

  // ─── 青年誌ギャグ ──────────────────────────────────────────────────
  { title: "クレヨンしんちゃん",                searchTitle: "クレヨンしんちゃん",       author: "臼井儀人",       l2Id: "seinen", expectedFragment: "しんちゃん" },
  { title: "ポプテピピック",                    searchTitle: "ポプテピピック",           author: "大川ぶくぶ",     l2Id: "seinen", expectedFragment: "ポプテ" },
  { title: "稲中卓球部",                        searchTitle: "稲中卓球部",              author: "古谷実",         l2Id: "seinen", expectedFragment: "稲中" },
  { title: "笑ゥせぇるすまん",                  searchTitle: "笑ゥせぇるすまん",         author: "藤子不二雄",     l2Id: "seinen", expectedFragment: "せぇるすまん" },
  { title: "究極超人あ～る",                    searchTitle: "究極超人あ る",           author: "ゆうきまさみ",   l2Id: "seinen", expectedFragment: "あ" },
  { title: "じゃりン子チエ",                    searchTitle: "じゃりン子チエ",           author: "はるき悦巳",     l2Id: "seinen", expectedFragment: "チエ" },
  { title: "WORKING!!",                        searchTitle: "WORKING",                 author: "高津カリノ",     l2Id: "seinen", expectedFragment: "WORKING" },
  { title: "かくしごと",                        searchTitle: "かくしごと",              author: "久米田康治",     l2Id: "seinen", expectedFragment: "かくしごと" },
  { title: "干物妹！うまるちゃん",              searchTitle: "うまるちゃん",             author: "サンカクヘッド", l2Id: "seinen", expectedFragment: "うまる" },
  { title: "ばらかもん",                        searchTitle: "ばらかもん",              author: "ヨシノサツキ",   l2Id: "seinen", expectedFragment: "ばらかもん" },
  { title: "のんのんびより",                    searchTitle: "のんのんびより",           author: "あっと",         l2Id: "seinen", expectedFragment: "のんのん" },

  // ─── 少女誌・その他ギャグ ──────────────────────────────────────────
  { title: "パタリロ！",                        searchTitle: "パタリロ",                author: "魔夜峰央",       l2Id: "shojo",  expectedFragment: "パタリロ" },
  { title: "ゆるゆり",                          searchTitle: "ゆるゆり",                author: "なもり",         l2Id: "seinen", expectedFragment: "ゆるゆり" },
  { title: "恋愛ラボ",                          searchTitle: "恋愛ラボ",                author: "宮原るり",       l2Id: "seinen", expectedFragment: "恋愛ラボ" },
  { title: "こみっくがーるず",                  searchTitle: "こみっくがーるず",         author: "まいた菜穂",     l2Id: "seinen", expectedFragment: "こみっく" },
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
  const existingTitles = new Set(index.map(b => (b.title as string | undefined)?.replace(/\s*[\d（）()１-９]+.*$/, "").trim()));

  let added = 0;
  const notFound: string[] = [];

  for (const target of TARGETS) {
    if (existingTitles.has(target.title)) {
      console.log(`SKIP (title exists): ${target.title}`);
      continue;
    }

    console.log(`Searching: ${target.title}`);

    // まず intitle + inauthor で検索
    let vols = await searchByQuery(`intitle:${target.searchTitle} inauthor:${target.author}`);
    await delay(400);

    // 見つからなければ inauthor なしで再検索
    if (!vols.length || !vols.find(v => v.volumeInfo.title?.includes(target.expectedFragment))) {
      vols = await searchByQuery(`intitle:${target.searchTitle}`);
      await delay(400);
    }

    if (!vols.length) {
      console.warn(`  NOT FOUND: ${target.title}`);
      notFound.push(target.title);
      continue;
    }

    const vol = vols.find(v => v.volumeInfo.title?.includes(target.expectedFragment));
    if (!vol) {
      console.warn(`  MISMATCH: "${target.expectedFragment}" not in [${vols.map(v => v.volumeInfo.title).join(", ")}]`);
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

    const authors = vi.authors ?? [target.author];
    const entry: Record<string, unknown> = {
      id: finalId,
      title: target.title,
      authors,
      categories: ["Comics & Graphic Novels"],
      keywords: ["Comics & Graphic Novels"],
      searchableText: [target.title, ...authors, vi.publisher].filter(Boolean).join(" "),
      updatedAt: new Date().toISOString(),
      language: vi.language ?? "ja",
      thumbnailUrl: thumbnailUrl(gbId),
      sourceIds: { googleBooksId: gbId },
      manualClassification: { l1Id: "manga", l2Id: target.l2Id, l3Id: "gag" },
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
  if (notFound.length) {
    console.log(`\n未登録 (${notFound.length}件):`);
    notFound.forEach(t => console.log(`  - ${t}`));
  }
}

main().catch(console.error);
