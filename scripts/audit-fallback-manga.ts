#!/usr/bin/env tsx
/**
 * audit-fallback-manga.ts
 *
 * フォールバックモードで追加された漫画エントリを検出し、
 * 対象エントリ数・ID・タイトル一覧をCSV形式で出力する。
 */

import * as fs from "fs";
import * as path from "path";

const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface BookEntry {
  id: string;
  title: string;
  authors: string[];
  isbn13?: string;
  thumbnailUrl?: string;
  publisher?: string;
  updatedAt: string;
  sourceIds: { googleBooksId?: string };
  manualClassification?: { l1Id?: string; l2Id?: string; l3Id?: string };
  [key: string]: unknown;
}

const books: BookEntry[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));

const CUTOFF = "2026-04-09T00:00:00.000Z";

const targets = books.filter((b) => {
  if (b.manualClassification?.l1Id !== "manga") return false;

  const noThumbnail = !b.thumbnailUrl || b.thumbnailUrl === "";
  const noAuthors =
    !b.authors ||
    b.authors.length === 0 ||
    (b.authors.length === 1 && b.authors[0] === "不明");
  const noIsbn = !b.isbn13;
  const recentUpdate = b.updatedAt >= CUTOFF;

  // フォールバックエントリは複数の条件を同時に満たす
  return noThumbnail && noAuthors && noIsbn && recentUpdate;
});

console.log(`\n=== フォールバック漫画エントリ監査 ===`);
console.log(`検索条件: manga + thumbnailなし + authorsなし + isbn13なし + updatedAt >= 2026-04-09`);
console.log(`対象エントリ数: ${targets.length} 件\n`);

if (targets.length > 0) {
  console.log(`id,title,authors,thumbnailUrl,isbn13,googleBooksId`);
  for (const t of targets) {
    const authors = (t.authors ?? []).join(";") || "(なし)";
    const thumb = t.thumbnailUrl || "(なし)";
    const isbn = t.isbn13 || "(なし)";
    const gid = t.sourceIds?.googleBooksId || "(なし)";
    console.log(`${t.id},${t.title},${authors},${thumb},${isbn},${gid}`);
  }
}

console.log(`\n=== 監査完了 ===`);
