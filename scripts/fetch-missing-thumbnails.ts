#!/usr/bin/env tsx
/**
 * fetch-missing-thumbnails.ts
 * thumbnailUrl が未設定の books.index.json エントリに対して
 * Google Books API で書影を補完するスクリプト。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 設定 ─────────────────────────────────────────────────────────
const ENV_PATH = path.join(__dirname, ".env");
if (fs.existsSync(ENV_PATH)) {
  for (const line of fs.readFileSync(ENV_PATH, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY ?? "";
const DELAY_MS = 400;
const INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

type BookEntry = {
  id: string;
  isbn13?: string;
  thumbnailUrl?: string;
  manualClassification?: { l1Id?: string };
  [key: string]: unknown;
};

// ── メイン ────────────────────────────────────────────────────────
const index: BookEntry[] = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));

// 対象: manga/novel で thumbnailUrl なし、isbn13 あり
const targets = index.filter(
  (b) =>
    !b.thumbnailUrl &&
    b.isbn13 &&
    (b.manualClassification?.l1Id === "manga" ||
      b.manualClassification?.l1Id === "novel")
);

console.log(`対象エントリ: ${targets.length} 件`);

let updated = 0;
let notFound = 0;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchThumbnail(isbn13: string): Promise<string | null> {
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}` +
    (API_KEY ? `&key=${API_KEY}` : "");
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as { items?: { volumeInfo?: { imageLinks?: { thumbnail?: string } } }[] };
    const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    if (!thumb) return null;
    // httpsに統一、imgtk パラメータは除去（期限切れリスク回避）
    return thumb.replace(/^http:/, "https:").replace(/&imgtk=[^&]+/, "");
  } catch {
    return null;
  }
}

// isbn13 単位で処理（同じ ISBN の複数エントリはまとめて更新）
const isbnMap = new Map<string, BookEntry[]>();
for (const entry of targets) {
  const isbn = entry.isbn13!;
  if (!isbnMap.has(isbn)) isbnMap.set(isbn, []);
  isbnMap.get(isbn)!.push(entry);
}

console.log(`ユニーク ISBN: ${isbnMap.size} 件`);

async function main() {
  let processed = 0;
  for (const [isbn, entries] of isbnMap.entries()) {
    processed++;
    if (processed % 50 === 0) {
      console.log(`  ${processed}/${isbnMap.size} 処理済み (更新: ${updated})`);
    }

    const thumb = await fetchThumbnail(isbn);
    if (thumb) {
      for (const entry of entries) {
        entry.thumbnailUrl = thumb;
      }
      updated += entries.length;
    } else {
      notFound++;
    }

    await sleep(DELAY_MS);
  }

  // 書き戻し
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

  console.log(`\n完了: ${updated} 件更新, ${notFound} 件未取得`);
  console.log("→ src/data/books.index.json を更新しました");
}

main().catch(console.error);
