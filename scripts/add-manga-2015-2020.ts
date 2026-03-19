#!/usr/bin/env tsx
/**
 * add-manga-2015-2020.ts
 * 2015〜2020年に発売・連載された漫画作品をbooks.index.jsonに追加する
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
  { title: "食戟のソーマ",                 isbn: "9784088704555", ...cls("shonen", "battle") },
  { title: "彼方のアストラ",               isbn: "9784088811291", ...cls("shonen", "adventure") },
  { title: "平穏世代の韋駄天達",           isbn: "9784088817484", ...cls("shonen", "battle") },
  { title: "東京喰種:re",                  isbn: "9784088801995", ...cls("seinen", "drama"), searchKey: "東京喰種" },
  { title: "カラダ探し",                   isbn: "9784065170595", ...cls("shonen", "battle") },
  { title: "ノラガミ",                     isbn: "9784063709544", ...cls("shonen", "battle") },
  { title: "幼稚園WARS",                   isbn: "9784091279286", ...cls("shonen", "battle") },

  // ─── 少年漫画・スポーツ ──────────────────────────────────────────
  { title: "ランウェイで笑って",           isbn: "9784065077498", ...cls("shonen", "sports") },
  { title: "ボールルームへようこそ",       isbn: "9784063720440", ...cls("shonen", "sports") },

  // ─── 少年漫画・ラブコメ/恋愛 ────────────────────────────────────
  { title: "ドメスティックな彼女",         isbn: "9784063899238", ...cls("shonen", "romance"), searchKey: "ドメスティックな彼女" },
  { title: "ヲタクに恋は難しい",           isbn: "9784758011648", ...cls("general", "romcom"), searchKey: "ヲタクに恋は難しい" },

  // ─── 青年漫画・ドラマ/社会派 ────────────────────────────────────
  { title: "ブルーピリオド",               isbn: "9784065128145", ...cls("seinen", "drama") },
  { title: "少女終末旅行",                 isbn: "9784107717153", ...cls("seinen", "drama") },
  { title: "ダーリン・イン・ザ・フランキス", isbn: "9784088823126", ...cls("seinen", "drama"), searchKey: "ダーリン" },
  { title: "ペリリュー ―楽園のゲルニカ―", isbn: "9784253210293", ...cls("seinen", "drama"), searchKey: "ペリリュー" },
  { title: "ラグナクリムゾン",             isbn: "9784757562509", ...cls("seinen", "drama") },

  // ─── 青年漫画・歴史/社会 ────────────────────────────────────────
  { title: "乙嫁語り",                     isbn: "9784756713797", ...cls("seinen", "social") },

  // ─── 日常/コメディ ───────────────────────────────────────────────
  { title: "ゆるキャン△",                 isbn: "9784575419801", ...cls("general", "daily") },
  { title: "まちカドまぞく",               isbn: "9784757550254", ...cls("general", "gag") },

  // ─── 少女漫画・ファンタジー ──────────────────────────────────────
  { title: "夏目友人帳",                   isbn: "9784592184621", ...cls("shojo", "fantasy") },

  // ─── 少女漫画・スポーツ ──────────────────────────────────────────
  { title: "絢爛たるグランドセーヌ",       isbn: "9784091397669", ...cls("shojo", "sports"), searchKey: "グランドセーヌ" },

  // ─── 少女漫画・恋愛 ──────────────────────────────────────────────
  { title: "ライアー×ライアー",           isbn: "9784065162651", ...cls("shojo", "romance"), searchKey: "ライアー×ライアー" },
  { title: "花野井くんと恋の病",           isbn: "9784065210802", ...cls("shojo", "romance") },
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
