#!/usr/bin/env tsx
/**
 * add-manga-batch2.ts
 * 第2バッチ漫画リストをbooks.index.jsonに追加するスクリプト
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
  /** ISBN検証用キー（省略時はtitleを正規化して使用） */
  searchKey?: string;
}

const cls = (l2: string, l3: string): Pick<MangaTarget, "l2Id" | "l3Id"> => ({ l2Id: l2, l3Id: l3 });

const MANGA_LIST: MangaTarget[] = [
  // ─── 少年漫画・バトル ────────────────────────────────────────
  { title: "ダンダダン",             isbn: "9784088825997", ...cls("shonen", "battle") },
  { title: "葬送のフリーレン",       isbn: "9784098501809", ...cls("shonen", "adventure") },
  { title: "薬屋のひとりごと",       isbn: "9784757550314", ...cls("shonen", "adventure") },
  { title: "逃げ上手の若君",         isbn: "9784088822828", ...cls("shonen", "battle") },
  { title: "あかね噺",               isbn: "9784088830533", ...cls("shonen", "battle") },
  { title: "カグラバチ",             isbn: "9784088840181", ...cls("shonen", "battle") },
  { title: "アイスヘッドギル",       isbn: "9784088838751", ...cls("shonen", "battle") },
  { title: "アンデッドアンラック",   isbn: "9784088820008", ...cls("shonen", "battle") },
  { title: "PPPPPP",                 isbn: "9784088832049", ...cls("shonen", "battle") },
  { title: "夜桜四重奏",             isbn: "9784063635826", ...cls("shonen", "battle") },
  { title: "怪物事変",               isbn: "9784088812157", ...cls("shonen", "battle") },
  { title: "ガチアクタ",             isbn: "9784065275303", ...cls("shonen", "battle") },
  { title: "魔都精兵のスレイブ",     isbn: "9784088818777", ...cls("shonen", "battle") },

  // ─── 少年漫画・ファンタジー・アドベンチャー ─────────────────
  { title: "シャングリラ・フロンティア", isbn: "9784065212325", ...cls("shonen", "adventure") },
  { title: "不滅のあなたへ",         isbn: "9784063955672", ...cls("shonen", "adventure") },
  { title: "魔入りました！入間くん", isbn: "9784253224617", ...cls("shonen", "adventure") },
  { title: "弱キャラ友崎くん",       isbn: "9784757556026", ...cls("shonen", "adventure") },
  { title: "少女Null",               isbn: "9784088838263", ...cls("shonen", "adventure") },
  { title: "テンマクキネマ",         isbn: "9784088835354", ...cls("shonen", "adventure") },
  { title: "ガールミーツロック!",    isbn: "9784088839215", ...cls("shonen", "adventure") },
  { title: "ふつうの軽音部",         isbn: "9784088837303", ...cls("shonen", "adventure") },

  // ─── 少年漫画・スポーツ ──────────────────────────────────────
  { title: "ダイヤモンドの功罪",     isbn: "9784088836238", ...cls("shonen", "sports") },
  { title: "ブルーボックス",         isbn: "9784088826260", ...cls("shonen", "sports") },
  { title: "アオのハコ",             isbn: "9784088826017", ...cls("shonen", "sports") },
  { title: "ドリトライ",             isbn: "9784088834302", ...cls("shonen", "sports") },
  { title: "ツーオンアイス",         isbn: "9784088839864", ...cls("shonen", "sports") },
  { title: "レッドブルー",           isbn: "9784098503278", ...cls("shonen", "sports") },

  // ─── 少年漫画・コメディ・日常 ───────────────────────────────
  { title: "ウィッチウォッチ",       isbn: "9784088824594", ...cls("general", "gag") },
  { title: "僕とロボコ",             isbn: "9784088822200", ...cls("general", "gag") },
  { title: "クジマ歌えば家ほろろ",   isbn: "9784098505241", ...cls("general", "gag") },
  { title: "夜桜さんちの大作戦",     isbn: "9784088810047", ...cls("general", "gag") },
  { title: "マッシュル",             isbn: "9784088810764", ...cls("general", "gag") },
  { title: "高校生家族",             isbn: "9784088822668", ...cls("general", "gag") },
  { title: "ロボコ",                 isbn: "9784088836009", ...cls("general", "gag"), searchKey: "ロボコ" },
  { title: "ルリドラゴン",           isbn: "9784088832858", ...cls("general", "daily") },
  { title: "舞妓さんちのまかないさん", isbn: "9784091892498", ...cls("general", "daily") },

  // ─── 少年漫画・ラブコメ ──────────────────────────────────────
  { title: "あやかしトライアングル", isbn: "9784088823443", ...cls("shojo", "romcom") },

  // ─── 青年漫画・SF・サスペンス・社会派 ───────────────────────
  { title: "サンダー3",              isbn: "9784065285319", ...cls("seinen", "social") },
  { title: "天国大魔境",             isbn: "9784065105860", ...cls("seinen", "social") },
  { title: "地雷グリコ",             isbn: "9784065318703", ...cls("seinen", "social") },
  { title: "平和の国の島崎へ",       isbn: "9784065287023", ...cls("seinen", "social") },
  { title: "光が死んだ夏",           isbn: "9784047365798", ...cls("seinen", "social") },
  { title: "トリリオンゲーム",       isbn: "9784098600403", ...cls("seinen", "social") },
  { title: "アンダーニンジャ",       isbn: "9784065113575", ...cls("seinen", "social") },
  { title: "ザ・ファブル",           isbn: "9784065290740", ...cls("seinen", "social"), searchKey: "ファブル" },
  { title: "忍者と極道",             isbn: "9784065174279", ...cls("seinen", "social") },
  { title: "ケンガンオメガ",         isbn: "9784098500758", ...cls("seinen", "social") },
  { title: "終末のハーレム",         isbn: "9784088812461", ...cls("seinen", "social") },
  { title: "無限の住人",             isbn: "9784065279974", ...cls("seinen", "social"), searchKey: "無限の住人" },
  { title: "望郷太郎",               isbn: "9784065149390", ...cls("seinen", "social") },
  { title: "ヒストリエ",             isbn: "9784063287643", ...cls("seinen", "social") },
  { title: "大ダーク",               isbn: "9784098605682", ...cls("seinen", "social") },
  { title: "スーパーボールガールズ", isbn: "9784098614318", ...cls("seinen", "social") },
  { title: "サラリーマン金太郎",     isbn: "9784088912543", ...cls("seinen", "social"), searchKey: "金太郎" },
  { title: "バトルスタディーズ",     isbn: "9784063886082", ...cls("seinen", "social") },
  { title: "リエゾン",               isbn: "9784065224144", ...cls("seinen", "social") },
  { title: "サイコの世界",           isbn: "9784065298470", ...cls("seinen", "social") },
  { title: "ミハルの戦場",           isbn: "9784098509034", ...cls("seinen", "social") },

  // ─── 青年漫画・ドラマ・ファンタジー・日常 ───────────────────
  { title: "九井諒子",               isbn: "9784047344496", ...cls("seinen", "drama"), searchKey: "九井諒子" },
  { title: "スキップとローファー",   isbn: "9784065112493", ...cls("seinen", "drama") },
  { title: "君と宇宙を歩くために",   isbn: "9784065294137", ...cls("seinen", "drama") },
  { title: "魔女と傭兵",             isbn: "9784049151964", ...cls("seinen", "drama") },
  { title: "終末のワルキューレ",     isbn: "9784867209772", ...cls("seinen", "drama") },
  { title: "異世界失格",             isbn: "9784098603534", ...cls("seinen", "drama") },
  { title: "焼いてるふたり",         isbn: "9784065206140", ...cls("seinen", "drama") },
  { title: "妻、小学生になる。",     isbn: "9784575855585", ...cls("seinen", "drama"), searchKey: "妻、小学生" },
  { title: "おとなりに銀河",         isbn: "9784065226834", ...cls("seinen", "drama") },
  { title: "メダリスト",             isbn: "9784065212790", ...cls("seinen", "drama") },
  { title: "ぼっち・ざ・ろっく!",   isbn: "9784832271639", ...cls("seinen", "drama") },
  { title: "RIOT",                   isbn: "9784098608591", ...cls("seinen", "drama") },
  { title: "図書館の大魔術師",       isbn: "9784065116729", ...cls("seinen", "drama") },

  // ─── 青年漫画・コメディ ──────────────────────────────────────
  { title: "サチ録",                 isbn: "9784065295462", ...cls("general", "gag") },
  { title: "異世界おじさん",         isbn: "9784040724783", ...cls("general", "gag") },
  { title: "異世界ありがとう",       isbn: "9784098506644", ...cls("general", "gag") },

  // ─── 少女漫画・恋愛 ──────────────────────────────────────────
  { title: "ゆびさきと恋々",                 isbn: "9784065181796", ...cls("shojo", "romance") },
  { title: "山田くんとLv999の恋をする",      isbn: "9784040640625", ...cls("shojo", "romance") },
  { title: "顔だけじゃ好きになりません",     isbn: "9784592220052", ...cls("shojo", "romance") },
  { title: "恋せよまやかし天使ども",         isbn: "9784065312398", ...cls("shojo", "romance") },
  { title: "氷属性男子とクールな同僚女子",   isbn: "9784757563147", ...cls("shojo", "romance") },
  { title: "お姉ちゃんの翠くん",             isbn: "9784088445683", ...cls("shojo", "romance") },
  { title: "運命の人に出会う話",             isbn: "9784065265205", ...cls("shojo", "romance") },
  { title: "どうせ、恋してしまうんだ。",     isbn: "9784065268213", ...cls("shojo", "romance") },
  { title: "初×婚",                         isbn: "9784088443184", ...cls("shojo", "romance") },
  { title: "消えた初恋",                     isbn: "9784088443436", ...cls("shojo", "romance") },
  { title: "墜落JKと廃人教師",               isbn: "9784592223176", ...cls("shojo", "romance") },
  { title: "恋と弾丸",                       isbn: "9784098706112", ...cls("shojo", "romance") },
  { title: "プロミス・シンデレラ",           isbn: "9784098702688", ...cls("shojo", "romance") },
  { title: "ホタルの嫁入り",                 isbn: "9784098721245", ...cls("shojo", "romance") },
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

  // MANGA_LIST内の重複ISBNを除去
  const seenIsbns = new Set<string>();
  const dedupedList = MANGA_LIST.filter((t) => {
    if (seenIsbns.has(t.isbn)) return false;
    seenIsbns.add(t.isbn);
    return true;
  });

  for (const target of dedupedList) {
    const searchKey = target.searchKey ?? target.title;

    if (existingIsbns.has(target.isbn)) {
      console.log(`⏭  スキップ（ISBN既存）: ${target.title} (${target.isbn})`);
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

    await new Promise((r) => setTimeout(r, 200));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n完了: 追加 ${added}冊 / スキップ ${skipped}冊 / 未発見 ${notFound}冊`);
  console.log("次のステップ: npm run split:index");
}

main().catch(console.error);
