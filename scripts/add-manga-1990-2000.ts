#!/usr/bin/env tsx
/**
 * add-manga-1990-2000.ts
 * 1990〜2000年に発売・連載された漫画作品をbooks.index.jsonに追加する
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
  { title: "るろうに剣心",               isbn: "9784088721545", ...cls("shonen", "battle") },
  { title: "幽☆遊☆白書",               isbn: "9784088712000", ...cls("shonen", "battle"), searchKey: "幽遊白書" },
  { title: "遊☆戯☆王",                 isbn: "9784088726274", ...cls("shonen", "battle"), searchKey: "遊戯王" },
  { title: "封神演義",                   isbn: "9784088724195", ...cls("shonen", "battle") },
  { title: "ARMS",                       isbn: "9784091233776", ...cls("shonen", "battle") },
  { title: "シティーハンター",           isbn: "9784088514536", ...cls("shonen", "battle") },

  // ─── 少年漫画・ラブコメ ──────────────────────────────────────────
  { title: "I\"s",                       isbn: "9784088725635", ...cls("shonen", "romcom"), searchKey: "アイズ" },
  { title: "電影少女",                   isbn: "9784088714530", ...cls("shonen", "romcom") },

  // ─── 少年漫画・アドベンチャー ───────────────────────────────────
  { title: "SAND LAND",                  isbn: "9784088732329", ...cls("shonen", "adventure"), searchKey: "SAND LAND" },
  { title: "金田一少年の事件簿",         isbn: "9784061783133", ...cls("shonen", "battle"), searchKey: "金田一少年の事件簿" },

  // ─── 青年漫画・ドラマ/スポーツ ──────────────────────────────────
  { title: "YAWARA!",                    isbn: "9784063283839", ...cls("seinen", "drama"), searchKey: "YAWARA" },

  // ─── 一般・コメディ/日常 ────────────────────────────────────────
  { title: "まじかるタルるートくん",     isbn: "9784088717876", ...cls("general", "gag"), searchKey: "まじかるタルるート" },
  { title: "クレヨンしんちゃん",         isbn: "9784575950076", ...cls("general", "gag"), searchKey: "クレヨンしんちゃん" },
  { title: "ちびまる子ちゃん",           isbn: "9784088640174", ...cls("general", "daily") },
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
  const normalizedKey = searchKey.replace(/[\s　]*[（(【「〜～].*/g, "").trim();
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
