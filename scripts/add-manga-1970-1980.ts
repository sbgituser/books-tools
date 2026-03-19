#!/usr/bin/env tsx
/**
 * add-manga-1970-1980.ts
 * 1970〜1980年に発売・連載された漫画作品をbooks.index.jsonに追加する
 * ※ 1970年代の漫画はGoogle Books APIでISBN未登録のものが多く、
 *    文庫版・完全版・復刻版などのISBNを使用している
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

const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface ManualClassification {
  l1Id: string;
  l2Id: string;
  l3Id: string;
  l4TagIds?: string[];
}

interface BookEntry {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  language: string;
  pageCount?: number;
  categories: string[];
  keywords: string[];
  searchableText: string;
  thumbnailUrl?: string;
  sourceIds: { googleBooksId?: string };
  updatedAt: string;
  manualClassification: ManualClassification;
}

interface MangaTarget {
  title: string;
  isbn: string;
  l2Id: string;
  l3Id: string;
  searchKey?: string;
}

const cls = (l2: string, l3: string): Pick<MangaTarget, "l2Id" | "l3Id"> => ({ l2Id: l2, l3Id: l3 });

const MANGA_LIST: MangaTarget[] = [
  // ─── 少年漫画・バトル/アクション ────────────────────────────────
  { title: "デビルマン",     isbn: "9784778033156", ...cls("shonen", "battle") },   // ダークホース版 2018
  { title: "マジンガーZ",    isbn: "9784062606493", ...cls("shonen", "battle"), searchKey: "マジンガーZ" }, // オリジナル版 1999

  // ─── 少年漫画・スポーツ ──────────────────────────────────────────
  { title: "あしたのジョー", isbn: "9784834282016", ...cls("shonen", "sports"), searchKey: "あしたのジョー" }, // 講談社漫画文庫
  { title: "ドカベン",       isbn: "9784253170413", ...cls("shonen", "sports") },   // 秋田文庫

  // ─── 少年漫画・日常 ──────────────────────────────────────────────
  { title: "釣りキチ三平",   isbn: "9784061735811", ...cls("shonen", "daily"), searchKey: "釣りキチ三平" }, // 講談社文庫 1981

  // ─── 青年漫画・ドラマ ────────────────────────────────────────────
  { title: "火の鳥",         isbn: "9784061732025", ...cls("seinen", "drama") },    // 講談社版 黎明編 1978
  { title: "ブラック・ジャック", isbn: "9784253031608", ...cls("seinen", "drama"), searchKey: "ブラック・ジャック" }, // 少年チャンピオンコミックス 2019
  { title: "ルパン三世",     isbn: "9784120018213", ...cls("seinen", "drama"), searchKey: "ルパン三世" }, // 中公文庫 1989

  // ─── 一般・コメディ ──────────────────────────────────────────────
  { title: "天才バカボン",   isbn: "9784884752934", ...cls("general", "gag"), searchKey: "天才バカボン" }, // 双葉社 1994
  { title: "ドラえもん",     isbn: "9784091793331", ...cls("general", "daily") },   // 小学館 2020

  // ─── 少女漫画・ドラマ ────────────────────────────────────────────
  { title: "ベルサイユのばら", isbn: "9784088551333", ...cls("shojo", "drama"), searchKey: "ベルサイユのばら" }, // 完全版 2005
];

/** ISBN でGoogle Books APIを検索し、タイトルが一致するものを返す */
async function fetchByIsbn(isbn: string, searchKey: string): Promise<any | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  if (!data.items || data.items.length === 0) return null;
  const item = data.items[0];
  const returnedTitle: string = item.volumeInfo?.title ?? "";
  const normalizedKey = searchKey.replace(/[\s　]*[（(【「〜～!！☆★].*/g, "").trim();
  if (!returnedTitle.includes(normalizedKey) && !normalizedKey.includes(returnedTitle)) {
    return null;
  }
  return item;
}

/** タイトルでGoogle Books APIを検索し、最適なvol.1を返す */
async function fetchByTitle(title: string, searchKey: string): Promise<any | null> {
  const query = `intitle:${searchKey} 漫画`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  if (!data.items) return null;

  const candidates = data.items.filter((item: any) => {
    const t: string = item.volumeInfo?.title ?? "";
    return t.includes(searchKey);
  });

  if (candidates.length === 0) return null;

  function scoreItem(item: any): number {
    const t: string = item.volumeInfo?.title ?? "";
    let score = 0;
    if (t === title) score += 10;
    if (/[（(][１1][）)]/.test(t)) score += 8;
    if (/[　\s][１1]$/.test(t)) score += 7;
    if (/第?[１1]巻/.test(t)) score += 7;
    const hasIsbn = item.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13");
    if (hasIsbn) score += 3;
    score -= t.length * 0.1;
    return score;
  }

  candidates.sort((a: any, b: any) => scoreItem(b) - scoreItem(a));
  return candidates[0];
}

function buildEntry(item: any, usedIsbn: string, displayTitle: string, classification: ManualClassification): BookEntry {
  const info = item.volumeInfo;
  const isbn13Found: string | undefined = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
  const isbn13 = isbn13Found ?? usedIsbn;
  const id = isbn13;
  const bookTitle: string = info.title ?? displayTitle;
  const subtitle: string | undefined = info.subtitle;
  const authors: string[] = info.authors ?? [];
  const publisher: string | undefined = info.publisher;
  const publishedDate: string | undefined = info.publishedDate;
  const pageCount: number | undefined = info.pageCount;
  const thumbnailUrl: string | undefined =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ??
    info.imageLinks?.smallThumbnail?.replace("http://", "https://");

  const keywords = ["漫画", "コミック"];
  const searchableText = [bookTitle, subtitle, ...authors, publisher ?? "", ...keywords]
    .filter(Boolean).join(" ");

  return {
    id,
    title: bookTitle,
    ...(subtitle ? { subtitle } : {}),
    authors,
    ...(publisher ? { publisher } : {}),
    ...(publishedDate ? { publishedDate } : {}),
    isbn13,
    language: info.language ?? "ja",
    ...(pageCount ? { pageCount } : {}),
    categories: ["漫画"],
    keywords,
    searchableText,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    sourceIds: { googleBooksId: item.id },
    updatedAt: new Date().toISOString(),
    manualClassification: classification,
  };
}

async function main() {
  const books: BookEntry[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  const existingIds = new Set(books.map((b) => b.id));
  const existingIsbns = new Set(books.map((b) => b.isbn13).filter(Boolean));

  let added = 0;
  let skipped = 0;
  let notFound = 0;

  const seenIsbns = new Set<string>();
  const dedupedList = MANGA_LIST.filter((t) => {
    if (seenIsbns.has(t.isbn)) return false;
    seenIsbns.add(t.isbn);
    return true;
  });

  for (const target of dedupedList) {
    const searchKey = target.searchKey ?? target.title;

    if (existingIsbns.has(target.isbn)) {
      console.log(`⏭  スキップ（ISBN既存）: ${target.title}`);
      skipped++;
      continue;
    }

    console.log(`🔍 検索: ${target.title} (${target.isbn})`);
    let item = await fetchByIsbn(target.isbn, searchKey);
    let usedIsbn = target.isbn;

    if (!item) {
      console.log(`  → ISBN不一致、タイトル検索にフォールバック: ${searchKey}`);
      item = await fetchByTitle(target.title, searchKey);
      if (!item) {
        console.warn(`  ⚠ 見つかりません: ${target.title}`);
        notFound++;
        continue;
      }
      const gbIsbn = item.volumeInfo?.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
      usedIsbn = gbIsbn ?? target.isbn;
    }

    const foundTitle: string = item.volumeInfo?.title ?? target.title;
    const id = usedIsbn;

    if (existingIds.has(id)) {
      console.log(`  ⏭ スキップ（ID重複）: ${foundTitle} (${id})`);
      skipped++;
      continue;
    }

    const classification: ManualClassification = {
      l1Id: "manga",
      l2Id: target.l2Id,
      l3Id: target.l3Id,
      l4TagIds: ["readable"],
    };

    const entry = buildEntry(item, usedIsbn, target.title, classification);
    books.push(entry);
    existingIds.add(id);
    existingIsbns.add(usedIsbn);
    console.log(`  ✓ 追加: ${entry.title} (${id}) [${target.l2Id}/${target.l3Id}]`);
    added++;

    await new Promise((r) => setTimeout(r, 250));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n完了: 追加 ${added}冊 / スキップ ${skipped}冊 / 未発見 ${notFound}冊`);
  console.log("次のステップ: npm run collect:works && npm run build");
}

main().catch(console.error);
