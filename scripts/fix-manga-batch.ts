#!/usr/bin/env tsx
/**
 * fix-manga-batch.ts
 * 誤追加・誤分類された漫画エントリを修正するスクリプト
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

const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface ManualClassification {
  l1Id: string; l2Id: string; l3Id: string; l4TagIds?: string[];
}

// ─── 削除対象ID ────────────────────────────────────────────────
const REMOVE_IDS = new Set([
  "9784088700188",  // "ブラッククローバー 1" (クローバーとして誤登録)
  "9784065372562",  // "マイホームヒーロー(26)" (26巻)
  "9784063623543",  // "山田くんと7人の魔女 28 特装版" (28巻)
  "9784098610174",  // "闇金ウシジマくん最終章 1" (最終章)
  "9784040657622",  // "剣鬼恋歌 Re:ゼロ..." (スピンオフ)
  "9784041152218",  // "オーバーロード新世界編 1" (続編)
  "9784757582682",  // "無職転生~エリスは本気で牙を砥ぐ~(1)" (スピンオフ)
]);

// ─── 分類修正 ──────────────────────────────────────────────────
const FIX_CLASSIFICATIONS: Record<string, ManualClassification> = {
  "9784091231808": { l1Id: "manga", l2Id: "shonen", l3Id: "battle", l4TagIds: ["readable"] }, // 銀の匙 → shonen
};

// ─── 再取得対象 ────────────────────────────────────────────────
interface FetchTarget {
  title: string;
  searchQuery: string;
  classification: ManualClassification;
  excludeWords?: string[];
}

const CLS = (l2: string, l3: string): ManualClassification => ({
  l1Id: "manga", l2Id: l2, l3Id: l3, l4TagIds: ["readable"],
});

const FETCH_TARGETS: FetchTarget[] = [
  {
    title: "マイホームヒーロー",
    searchQuery: "マイホームヒーロー 1巻",
    classification: CLS("seinen", "social"),
    excludeWords: ["26", "特装"],
  },
  {
    title: "山田くんと7人の魔女",
    searchQuery: "山田くんと7人の魔女 1",
    classification: CLS("shojo", "romcom"),
    excludeWords: ["28", "特装", "外伝"],
  },
  {
    title: "闇金ウシジマくん",
    searchQuery: "闇金ウシジマくん 1",
    classification: CLS("seinen", "social"),
    excludeWords: ["最終章", "外伝"],
  },
  {
    title: "Re:ゼロから始める異世界生活",
    searchQuery: "Re:ゼロから始める異世界生活 1",
    classification: CLS("shonen", "adventure"),
    excludeWords: ["剣鬼", "真銘", "サンクマリア", "短編"],
  },
  {
    title: "オーバーロード",
    searchQuery: "オーバーロード 1",
    classification: CLS("shonen", "adventure"),
    excludeWords: ["新世界", "外伝", "特装"],
  },
  {
    title: "無職転生",
    searchQuery: "無職転生 1",
    classification: CLS("shonen", "adventure"),
    excludeWords: ["エリス", "スペシャル", "外伝"],
  },
  {
    title: "クローバー",
    searchQuery: "クローバー 漫画 ヤンキー",
    classification: CLS("shonen", "battle"),
    excludeWords: ["ブラック", "BLACK"],
  },
];

async function searchVol1(target: FetchTarget): Promise<any | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(target.searchQuery)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  if (!data.items) return null;

  // 除外ワードフィルタ
  const candidates = data.items.filter((item: any) => {
    const t: string = item.volumeInfo?.title ?? "";
    if (!t.includes(target.title)) return false;
    if (target.excludeWords?.some(w => t.includes(w))) return false;
    return true;
  });
  if (candidates.length === 0) return null;

  function scoreItem(item: any): number {
    const t: string = item.volumeInfo?.title ?? "";
    let score = 0;
    if (t === target.title) score += 10;
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

function buildEntry(item: any, classification: ManualClassification): any {
  const info = item.volumeInfo;
  const isbn13: string | undefined = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
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
  const searchableText = [title, subtitle, ...authors, publisher ?? "", ...keywords].filter(Boolean).join(" ");
  return {
    id, title, ...(subtitle ? { subtitle } : {}), authors,
    ...(publisher ? { publisher } : {}), ...(publishedDate ? { publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}), language: info.language ?? "ja",
    ...(pageCount ? { pageCount } : {}), categories: ["漫画"], keywords, searchableText,
    ...(thumbnailUrl ? { thumbnailUrl } : {}), sourceIds: { googleBooksId: item.id },
    updatedAt: new Date().toISOString(), manualClassification: classification,
  };
}

async function main() {
  const books: any[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));

  // 1. 削除
  const before = books.length;
  const filtered = books.filter(b => !REMOVE_IDS.has(b.id));
  console.log(`削除: ${before - filtered.length}冊`);

  // 2. 分類修正
  let fixCount = 0;
  for (const b of filtered) {
    if (FIX_CLASSIFICATIONS[b.id]) {
      b.manualClassification = FIX_CLASSIFICATIONS[b.id];
      console.log(`分類修正: ${b.title} (${b.id}) → ${JSON.stringify(FIX_CLASSIFICATIONS[b.id])}`);
      fixCount++;
    }
  }
  console.log(`分類修正: ${fixCount}冊`);

  // 3. 再取得
  const existingIds = new Set(filtered.map((b: any) => b.id));
  let added = 0;
  let notFound = 0;

  for (const target of FETCH_TARGETS) {
    console.log(`\n🔍 再取得: ${target.title}`);
    const item = await searchVol1(target);
    if (!item) {
      console.warn(`  ⚠ 見つかりません: ${target.title}`);
      notFound++;
      continue;
    }
    const entry = buildEntry(item, target.classification);
    const foundTitle: string = item.volumeInfo?.title ?? "";
    if (existingIds.has(entry.id)) {
      console.log(`  ⏭ スキップ（既存）: ${foundTitle} (${entry.id})`);
      continue;
    }
    filtered.push(entry);
    existingIds.add(entry.id);
    console.log(`  ✓ 追加: ${foundTitle} (${entry.id})`);
    added++;
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  console.log(`\n完了: 追加${added}冊 / 未発見${notFound}冊`);
  console.log("次のステップ: npm run split:index");
}

main().catch(console.error);
