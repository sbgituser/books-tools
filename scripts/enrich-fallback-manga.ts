#!/usr/bin/env tsx
/**
 * enrich-fallback-manga.ts
 *
 * フォールバックモードで追加された漫画エントリに対して
 * Google Books APIでメタデータを補完する。
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
const DELAY_MS = 400;
const CUTOFF = "2026-04-09T00:00:00.000Z";

interface BookEntry {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  isbn10?: string;
  language: string;
  pageCount?: number;
  categories: string[];
  keywords: string[];
  searchableText: string;
  thumbnailUrl?: string;
  sourceIds: { googleBooksId?: string };
  updatedAt: string;
  estimatedReadingHours?: number;
  manualClassification?: { l1Id?: string; l2Id?: string; l3Id?: string; l4TagIds?: string[] };
  [key: string]: unknown;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** タイトル + "漫画" で Google Books API を検索し、最良候補を返す */
async function searchGoogleBooks(title: string): Promise<any | null> {
  const query = `intitle:${title} 漫画`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      const wait = Math.min(2000 * Math.pow(2, attempt), 15000);
      console.log(`    リトライ ${attempt}/2 (${wait}ms待機)...`);
      await sleep(wait);
    }

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as any;
        return pickBestCandidate(data, title);
      }
      if (res.status === 429 || res.status === 503) continue;
      // その他のエラーは即終了
      console.log(`    HTTP ${res.status}`);
      return null;
    } catch (err) {
      console.log(`    ネットワークエラー: ${err}`);
      return null;
    }
  }

  console.log(`    3回リトライ失敗`);
  return null;
}

function pickBestCandidate(data: any, title: string): any | null {
  if (!data.items) return null;

  const normalizedTitle = title
    .replace(/[\s　]*[（(【「].*/g, "")
    .replace(/\s+/g, "")
    .trim();

  const candidates = data.items.filter((item: any) => {
    const t: string = (item.volumeInfo?.title ?? "").replace(/\s+/g, "");
    return t.includes(normalizedTitle) || normalizedTitle.includes(t);
  });

  if (candidates.length === 0) return null;

  function scoreItem(item: any): number {
    const t: string = item.volumeInfo?.title ?? "";
    let score = 0;
    if (t.replace(/\s+/g, "") === normalizedTitle) score += 10;
    if (/[（(][１1][）)]/.test(t)) score += 8;
    if (/[　\s][１1]$/.test(t)) score += 7;
    if (/第?[１1]巻/.test(t)) score += 7;
    const hasIsbn = item.volumeInfo?.industryIdentifiers?.some(
      (i: any) => i.type === "ISBN_13"
    );
    if (hasIsbn) score += 3;
    score -= t.length * 0.1;
    return score;
  }

  candidates.sort((a: any, b: any) => scoreItem(b) - scoreItem(a));
  return candidates[0];
}

/** API結果からエントリのメタデータを更新 */
function enrichEntry(entry: BookEntry, item: any): string[] {
  const info = item.volumeInfo;
  const enriched: string[] = [];

  // isbn13
  const isbn13 = info.industryIdentifiers?.find(
    (i: any) => i.type === "ISBN_13"
  )?.identifier;
  if (isbn13 && !entry.isbn13) {
    entry.isbn13 = isbn13;
    enriched.push("isbn13");
  }

  // isbn10
  const isbn10 = info.industryIdentifiers?.find(
    (i: any) => i.type === "ISBN_10"
  )?.identifier;
  if (isbn10 && !entry.isbn10) {
    entry.isbn10 = isbn10;
    enriched.push("isbn10");
  }

  // authors
  if (info.authors?.length && (!entry.authors || entry.authors.length === 0)) {
    entry.authors = info.authors;
    enriched.push("authors");
  }

  // publisher
  if (info.publisher && !entry.publisher) {
    entry.publisher = info.publisher;
    enriched.push("publisher");
  }

  // publishedDate
  if (info.publishedDate && !entry.publishedDate) {
    entry.publishedDate = info.publishedDate;
    enriched.push("publishedDate");
  }

  // pageCount
  if (info.pageCount && !entry.pageCount) {
    entry.pageCount = info.pageCount;
    enriched.push("pageCount");
  }

  // thumbnailUrl
  const thumb =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ??
    info.imageLinks?.smallThumbnail?.replace("http://", "https://");
  if (thumb && !entry.thumbnailUrl) {
    entry.thumbnailUrl = thumb;
    enriched.push("thumbnailUrl");
  }

  // sourceIds.googleBooksId
  if (item.id && !entry.sourceIds?.googleBooksId) {
    entry.sourceIds = { ...entry.sourceIds, googleBooksId: item.id };
    enriched.push("googleBooksId");
  }

  // IDをISBN13に更新（フォールバックIDからの移行）
  if (isbn13 && entry.id.startsWith("manga-batch6-")) {
    entry.id = isbn13;
    enriched.push("id");
  }

  // searchableText を再構築
  if (enriched.length > 0) {
    entry.searchableText = [
      entry.title,
      entry.subtitle,
      ...(entry.authors ?? []),
      entry.publisher ?? "",
      ...(entry.keywords ?? []),
    ]
      .filter(Boolean)
      .join(" ");
    entry.updatedAt = new Date().toISOString();
  }

  return enriched;
}

async function main() {
  const books: BookEntry[] = JSON.parse(
    fs.readFileSync(BOOKS_INDEX_PATH, "utf-8")
  );

  // 対象エントリ抽出
  const targets = books.filter((b) => {
    if (b.manualClassification?.l1Id !== "manga") return false;
    const noThumbnail = !b.thumbnailUrl || b.thumbnailUrl === "";
    const noAuthors =
      !b.authors ||
      b.authors.length === 0 ||
      (b.authors.length === 1 && b.authors[0] === "不明");
    const noIsbn = !b.isbn13;
    const recentUpdate = b.updatedAt >= CUTOFF;
    return noThumbnail && noAuthors && noIsbn && recentUpdate;
  });

  console.log(`\n=== フォールバック漫画メタデータ補完 ===`);
  console.log(`対象エントリ: ${targets.length} 件\n`);

  if (targets.length === 0) {
    console.log("対象エントリなし。終了します。");
    return;
  }

  let enrichedCount = 0;
  let failedCount = 0;
  const fieldStats: Record<string, number> = {};
  const failedTitles: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    const entry = targets[i];
    console.log(
      `[${i + 1}/${targets.length}] 検索: ${entry.title} (${entry.id})`
    );

    const item = await searchGoogleBooks(entry.title);

    if (item) {
      const fields = enrichEntry(entry, item);
      if (fields.length > 0) {
        enrichedCount++;
        for (const f of fields) {
          fieldStats[f] = (fieldStats[f] ?? 0) + 1;
        }
        console.log(`    補完: ${fields.join(", ")}`);
      } else {
        failedCount++;
        failedTitles.push(entry.title);
        console.log(`    該当データなし（結果はあるがメタデータ不十分）`);
      }
    } else {
      failedCount++;
      failedTitles.push(entry.title);
      console.log(`    スキップ（API結果なし）`);
    }

    await sleep(DELAY_MS);
  }

  // 保存
  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");

  console.log(`\n=== 結果サマリ ===`);
  console.log(`補完成功: ${enrichedCount} 件`);
  console.log(`補完失敗: ${failedCount} 件`);
  console.log(`\n項目別補完数:`);
  for (const [field, count] of Object.entries(fieldStats).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${field}: ${count}`);
  }

  if (failedTitles.length > 0) {
    console.log(`\n未補完タイトル:`);
    for (const t of failedTitles) {
      console.log(`  - ${t}`);
    }
  }

  console.log(`\n books.index.json を更新しました`);
}

main().catch(console.error);
