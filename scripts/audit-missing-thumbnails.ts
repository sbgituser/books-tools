#!/usr/bin/env tsx
/**
 * audit-missing-thumbnails.ts
 * thumbnailUrl が未設定の作品一覧を出力する監査スクリプト。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

type BookEntry = {
  id: string;
  title: string;
  authors?: string[];
  isbn13?: string;
  thumbnailUrl?: string;
  manualClassification?: { l1Id?: string };
};

const index: BookEntry[] = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));

const missing = index.filter((b) => !b.thumbnailUrl);
const withIsbn = missing.filter((b) => b.isbn13);
const withoutIsbn = missing.filter((b) => !b.isbn13);

// l1Id 別集計
const l1Counts = new Map<string, number>();
for (const b of missing) {
  const l1 = b.manualClassification?.l1Id ?? "(未分類)";
  l1Counts.set(l1, (l1Counts.get(l1) ?? 0) + 1);
}

console.log("=== thumbnailUrl 未設定作品レポート ===\n");
console.log(`全作品数: ${index.length}`);
console.log(`thumbnailUrl 未設定: ${missing.length} 件`);
console.log(`  ISBN13 あり: ${withIsbn.length} 件`);
console.log(`  ISBN13 なし: ${withoutIsbn.length} 件`);
console.log("\n--- l1Id 別内訳 ---");
for (const [l1, count] of [...l1Counts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${l1}: ${count} 件`);
}

console.log("\n--- 作品一覧 (CSV) ---");
console.log("title,authors,isbn13,l1Id");
for (const b of missing) {
  const title = b.title.replace(/,/g, "，");
  const authors = (b.authors ?? []).join("; ").replace(/,/g, "，");
  const isbn = b.isbn13 ?? "";
  const l1 = b.manualClassification?.l1Id ?? "";
  console.log(`${title},${authors},${isbn},${l1}`);
}
