#!/usr/bin/env tsx
/**
 * add-manga-top10.ts
 * TOP10漫画リストをGoogle Books APIで検索し、books.index.jsonに追加するスクリプト
 */

import * as fs from "fs";
import * as path from "path";

// scripts/.env を手動ロード
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
  l5TagIds?: string[];
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
  author: string;
  classification: ManualClassification;
  /** 除外ワード（タイトル内にあればスキップ） */
  excludeWords?: string[];
}

const MANGA_LIST: MangaTarget[] = [
  // ─── バトル・アクション ───────────────────────────────────────────────────
  {
    title: "ドラゴンボール", author: "鳥山明",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "battle", l4TagIds: ["readable"], l5TagIds: ["battle-core"] },
    excludeWords: ["超", "外伝", "SD"],
  },

  // ─── ミステリー・サスペンス ───────────────────────────────────────────────
  {
    title: "名探偵コナン", author: "青山剛昌",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "battle", l4TagIds: ["readable"] },
    excludeWords: ["SPECIAL", "映画", "ゲーム", "セレクション", "怪盗キッド", "無料お試し"],
  },
  {
    title: "金田一少年の事件簿", author: "天樹征丸",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "social", l4TagIds: ["readable"] },
    excludeWords: ["外伝", "R", "File"],
  },
  {
    title: "ミュージアム", author: "巴亮介",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "social", l4TagIds: ["readable"] },
  },
  {
    title: "僕だけがいない街", author: "三部けい",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "social", l4TagIds: ["readable"] },
  },
  {
    title: "サマータイムレンダ", author: "田中靖規",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "battle", l4TagIds: ["readable"] },
  },
  {
    title: "インベスターZ", author: "三田紀房",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "social", l4TagIds: ["readable"] },
  },

  // ─── スポーツ ────────────────────────────────────────────────────────────
  {
    title: "MAJOR", author: "満田拓也",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "sports", l4TagIds: ["readable"] },
    excludeWords: ["2nd", "メジャーセカンド"],
  },
  {
    title: "アイシールド21", author: "稲垣理一郎",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "sports", l4TagIds: ["readable"] },
  },
  {
    title: "ダイヤのA", author: "寺嶋裕二",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "sports", l4TagIds: ["readable"] },
    excludeWords: ["act2", "ACT2"],
  },
  {
    title: "弱虫ペダル", author: "渡辺航",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "sports", l4TagIds: ["readable"] },
    excludeWords: ["SPARE BIKE", "外伝"],
  },
  {
    title: "ベイビーステップ", author: "勝木光",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "sports", l4TagIds: ["readable"] },
  },
  {
    title: "黒子のバスケ", author: "藤巻忠俊",
    classification: { l1Id: "manga", l2Id: "shonen", l3Id: "sports", l4TagIds: ["readable"] },
    excludeWords: ["EXTRA GAME", "カラー"],
  },
  {
    title: "GIANT KILLING", author: "ツジトモ",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "social", l4TagIds: ["readable"] },
  },

  // ─── SF・ファンタジー ────────────────────────────────────────────────────
  {
    title: "宝石の国", author: "市川春子",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "drama", l4TagIds: ["readable"] },
  },
  {
    title: "風の谷のナウシカ", author: "宮崎駿",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "social", l4TagIds: ["readable"] },
  },
  {
    title: "トライガン", author: "内藤泰弘",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "social", l4TagIds: ["readable"] },
    excludeWords: ["MAXIMUM"],
  },

  // ─── 泣ける・ヒューマンドラマ ─────────────────────────────────────────────
  {
    title: "聲の形", author: "大今良時",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "drama", l4TagIds: ["readable"] },
  },
  {
    title: "おやすみプンプン", author: "浅野いにお",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "drama", l4TagIds: ["readable"] },
  },
  {
    title: "BLUE GIANT", author: "石塚真一",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "drama", l4TagIds: ["readable"] },
    excludeWords: ["SUPREME", "EXPLORER"],
  },
  {
    title: "東京ヒゴロ", author: "松本大洋",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "drama", l4TagIds: ["readable"] },
  },
  {
    title: "よつばと！", author: "あずまきよひこ",
    classification: { l1Id: "manga", l2Id: "general", l3Id: "daily", l4TagIds: ["readable"] },
  },
  {
    title: "Sunny", author: "松本大洋",
    classification: { l1Id: "manga", l2Id: "seinen", l3Id: "drama", l4TagIds: ["readable"] },
  },
];

/** Google Books APIで検索し、最適なvol.1を返す */
async function findVolume1(target: MangaTarget): Promise<any | null> {
  const query = `intitle:${target.title} inauthor:${target.author}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  if (!data.items) return null;

  // フィルタリング: タイトルに対象タイトルが含まれること
  const candidates = data.items.filter((item: any) => {
    const t: string = item.volumeInfo?.title ?? "";
    if (!t.includes(target.title)) return false;
    // 除外ワードチェック
    if (target.excludeWords?.some((w) => t.includes(w))) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // スコアリング: vol.1を優先
  function scoreItem(item: any): number {
    const t: string = item.volumeInfo?.title ?? "";
    let score = 0;

    // タイトルが完全一致（巻数なし）なら高スコア
    if (t === target.title) score += 10;

    // （１）or (1) を含む
    if (/[（(][１1][）)]/.test(t)) score += 8;
    // 末尾が 1 / １
    if (/[　\s][１1]$/.test(t)) score += 7;
    // 「1巻」「第1巻」
    if (/第?[１1]巻/.test(t)) score += 7;

    // ISBN-13 を持つ
    const hasIsbn = item.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13");
    if (hasIsbn) score += 3;

    // タイトルが短いほど本編らしい
    score -= t.length * 0.1;

    return score;
  }

  candidates.sort((a: any, b: any) => scoreItem(b) - scoreItem(a));
  return candidates[0];
}

function extractIsbn13(item: any): string | undefined {
  return item.volumeInfo?.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
}

function buildEntry(item: any, classification: ManualClassification): BookEntry {
  const info = item.volumeInfo;
  const isbn13 = extractIsbn13(item);
  const id = isbn13 ?? `gb-${item.id}`;
  const title: string = info.title ?? "";
  const subtitle: string | undefined = info.subtitle;
  const authors: string[] = info.authors ?? [];
  const publisher: string | undefined = info.publisher;
  const publishedDate: string | undefined = info.publishedDate;
  const pageCount: number | undefined = info.pageCount;
  const thumbnailUrl: string | undefined =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ??
    info.imageLinks?.smallThumbnail?.replace("http://", "https://");

  const keywords = ["漫画", "コミック"];
  const searchableText = [title, subtitle, ...authors, publisher ?? "", ...keywords]
    .filter(Boolean).join(" ");

  return {
    id,
    title,
    ...(subtitle ? { subtitle } : {}),
    authors,
    ...(publisher ? { publisher } : {}),
    ...(publishedDate ? { publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}),
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

  /** 既存タイトルチェック用（正規化済みタイトル → Book） */
  const normalizeTitle = (t: string) => t.replace(/\s*[（(].*/, "").trim().toLowerCase();
  const existingNorm = new Map(books.map((b) => [normalizeTitle(b.title), b]));

  let added = 0;
  let skipped = 0;

  for (const target of MANGA_LIST) {
    const normTarget = normalizeTitle(target.title).toLowerCase();

    // 既存チェック（正規化タイトルの包含関係）
    const existEntry = [...existingNorm.entries()].find(([norm]) => {
      if (!norm || norm.length < 3) return false;
      return norm.includes(normTarget) || normTarget.includes(norm);
    });
    if (existEntry) {
      console.log(`⏭  スキップ（既存）: ${target.title} → "${existEntry[1].title}"`);
      skipped++;
      continue;
    }

    console.log(`🔍 検索: ${target.title} / ${target.author}`);
    const item = await findVolume1(target);

    if (!item) {
      console.warn(`  ⚠ 見つかりません: ${target.title}`);
      continue;
    }

    const isbn13 = extractIsbn13(item);
    const id = isbn13 ?? `gb-${item.id}`;
    const foundTitle: string = item.volumeInfo?.title ?? "";

    if (existingIds.has(id)) {
      console.log(`  ⏭ スキップ（ID重複）: ${foundTitle} (${id})`);
      skipped++;
      continue;
    }

    const entry = buildEntry(item, target.classification);
    books.push(entry);
    existingIds.add(id);
    existingNorm.set(normalizeTitle(entry.title), entry);
    console.log(`  ✓ 追加: ${entry.title} (${id})`);
    added++;

    await new Promise((r) => setTimeout(r, 300));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n完了: 追加 ${added}冊 / スキップ ${skipped}冊`);
  console.log("次のステップ: npm run split:index");
}

main().catch(console.error);
