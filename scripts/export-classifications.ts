/**
 * export-classifications.ts
 *
 * 書籍の現在の分類情報をCSVファイルに出力する。
 * 手動修正後、import-classifications.ts で取り込む。
 *
 * 出力フィールド: id, title, isbn, authors, l1Id, l2Id, l3Id, l4TagIds, l5TagIds
 *
 * 実行: npx tsx scripts/export-classifications.ts
 * 出力: scripts/classifications.csv
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { resolveBookClassification } from "../src/lib/categoryClassifier";

interface SourceBookIndex {
  id: string;
  title: string;
  authors: string[];
  isbn13?: string;
  isbn10?: string;
  isbn?: string;
  categories: string[];
  subjects?: string[];
  keywords: string[];
  searchableText: string;
  manualClassification?: ManualClassification;
}

interface ManualClassification {
  l1Id?: string;
  l2Id?: string;
  l3Id?: string;
  l4TagIds?: string[];
  l5TagIds?: string[];
}

const rawData = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/books.index.json"), "utf-8"),
) as SourceBookIndex[];

// CSV エスケープ
function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const header = ["id", "title", "isbn", "authors", "l1Id", "l2Id", "l3Id", "l4TagIds", "l5TagIds", "manual"];
const rows: string[][] = [];

for (const book of rawData) {
  if (!book.title) continue;

  const classified = resolveBookClassification(book);
  const manual = book.manualClassification;

  // 手動設定がある場合は手動値を優先して表示
  const l1 = manual?.l1Id ?? classified.l1Id;
  const l2 = manual?.l2Id ?? classified.l2Id ?? "";
  const l3 = manual?.l3Id ?? classified.l3Id ?? "";
  const l4 = manual?.l4TagIds ?? classified.l4TagIds;
  const l5 = manual?.l5TagIds ?? classified.l5TagIds;
  const isbn = book.isbn13 ?? book.isbn10 ?? "";

  rows.push([
    book.id,
    book.title,
    isbn,
    book.authors.join(";"),
    l1,
    l2,
    l3,
    l4.join(";"),
    l5.join(";"),
    manual ? "true" : "",
  ]);
}

const csvContent =
  header.join(",") +
  "\n" +
  rows.map(row => row.map(csvEscape).join(",")).join("\n") +
  "\n";

const outPath = join(process.cwd(), "scripts", "classifications.csv");
writeFileSync(outPath, csvContent, "utf-8");

console.log(`✓ ${rows.length}冊を出力: scripts/classifications.csv`);
console.log(`  手動設定済み: ${rows.filter(r => r[9] === "true").length}冊`);
