/**
 * build-search-index.ts
 *
 * public/data/books-{l1id}.json から検索用インデックスを生成し
 * public/data/search-index.json に書き出す。
 *
 * ※ build-split-index.ts の後に実行すること（prebuild順序依存）
 */

import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { CATEGORY_TREE } from "../src/lib/categories";

// ── 型定義 ───────────────────────────────────────────────────────

interface SplitBook {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  keywords: string[];
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  sourceIds?: { googleBooksId?: string };
}

export interface SearchEntry {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;   // YYYY-MM 形式
  isbn13?: string;
  googleBooksId?: string;
  thumbnailUrl?: string;
  pageCount?: number;
  estimatedReadingHours?: number;
  keywords: string[];
  l1Id: string;
}

// ── メイン処理 ────────────────────────────────────────────────────

const dataDir = join(process.cwd(), "public", "data");
const allEntries: SearchEntry[] = [];

for (const l1 of CATEGORY_TREE) {
  const filePath = join(dataDir, `books-${l1.id}.json`);
  let books: SplitBook[];
  try {
    books = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    continue;
  }

  for (const b of books) {
    if (!b.title || !b.authors?.length) continue;

    const entry: SearchEntry = {
      id: b.id,
      title: b.title,
      authors: b.authors,
      keywords: b.keywords.slice(0, 10),
      l1Id: l1.id,
    };

    if (b.publisher) entry.publisher = b.publisher;
    if (b.publishedDate) entry.publishedDate = b.publishedDate.slice(0, 7);
    if (b.isbn13) entry.isbn13 = b.isbn13;
    if (b.sourceIds?.googleBooksId) entry.googleBooksId = b.sourceIds.googleBooksId;
    if (b.thumbnailUrl) entry.thumbnailUrl = b.thumbnailUrl;
    if (b.pageCount) entry.pageCount = b.pageCount;
    if (b.estimatedReadingHours) {
      entry.estimatedReadingHours = parseFloat(b.estimatedReadingHours.toFixed(1));
    }

    allEntries.push(entry);
  }
}

writeFileSync(
  join(dataDir, "search-index.json"),
  JSON.stringify(allEntries),
);

console.log(`✓ search-index.json  (${allEntries.length}冊)`);
console.log("Done.");
