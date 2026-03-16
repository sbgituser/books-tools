/**
 * import-classifications.ts
 *
 * scripts/classifications.csv を読み込み、変更のあった行を
 * src/data/books.index.json の manualClassification フィールドに反映する。
 *
 * 動作仕様:
 *  - "manual" 列が "true" の行のみ処理する
 *  - "manual" 列が空の行は manualClassification を削除する（自動分類に戻す）
 *  - 変更のあった書籍数を報告する
 *
 * 実行: npx tsx scripts/import-classifications.ts
 * 入力: scripts/classifications.csv
 * 更新: src/data/books.index.json
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface ManualClassification {
  l1Id?: string;
  l2Id?: string;
  l3Id?: string;
  l4TagIds?: string[];
  l5TagIds?: string[];
}

interface SourceBookIndex {
  id: string;
  title: string;
  authors: string[];
  manualClassification?: ManualClassification;
  [key: string]: unknown;
}

// CSV パーサー（ダブルクォート対応）
function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current);
    rows.push(fields);
  }
  return rows;
}

const csvPath = join(process.cwd(), "scripts", "classifications.csv");
const indexPath = join(process.cwd(), "src/data/books.index.json");

const csvContent = readFileSync(csvPath, "utf-8");
const csvRows = parseCsv(csvContent);

// ヘッダー行を確認
const header = csvRows[0];
const idIdx     = header.indexOf("id");
const l1Idx     = header.indexOf("l1Id");
const l2Idx     = header.indexOf("l2Id");
const l3Idx     = header.indexOf("l3Id");
const l4Idx     = header.indexOf("l4TagIds");
const l5Idx     = header.indexOf("l5TagIds");
const manualIdx = header.indexOf("manual");

if (idIdx < 0 || l1Idx < 0 || manualIdx < 0) {
  console.error("❌ CSVのヘッダーが不正です。export-classifications.ts で再出力してください。");
  process.exit(1);
}

// CSV から手動設定マップを作成
const manualMap = new Map<string, ManualClassification | null>();

for (let i = 1; i < csvRows.length; i++) {
  const row = csvRows[i];
  if (!row[idIdx]) continue;

  const isManual = row[manualIdx]?.toLowerCase() === "true";
  const bookId = row[idIdx];

  if (isManual) {
    const l4Raw = row[l4Idx] ?? "";
    const l5Raw = row[l5Idx] ?? "";
    const manual: ManualClassification = {
      l1Id: row[l1Idx] || undefined,
      l2Id: row[l2Idx] || undefined,
      l3Id: row[l3Idx] || undefined,
      l4TagIds: l4Raw ? l4Raw.split(";").filter(Boolean) : [],
      l5TagIds: l5Raw ? l5Raw.split(";").filter(Boolean) : [],
    };
    manualMap.set(bookId, manual);
  } else {
    // manual が空 → 手動設定を削除（自動分類に戻す）
    manualMap.set(bookId, null);
  }
}

// books.index.json を更新
const books = JSON.parse(readFileSync(indexPath, "utf-8")) as SourceBookIndex[];

let added = 0;
let updated = 0;
let removed = 0;

for (const book of books) {
  if (!manualMap.has(book.id)) continue;

  const newManual = manualMap.get(book.id)!;
  const hadManual = Boolean(book.manualClassification);

  if (newManual === null) {
    if (hadManual) {
      delete book.manualClassification;
      removed++;
    }
  } else {
    if (!hadManual) {
      book.manualClassification = newManual;
      added++;
    } else {
      book.manualClassification = newManual;
      updated++;
    }
  }
}

writeFileSync(indexPath, JSON.stringify(books, null, 2), "utf-8");

console.log(`✓ 手動設定を更新しました`);
console.log(`  追加: ${added}冊 / 更新: ${updated}冊 / 削除: ${removed}冊`);
console.log(`  合計手動設定: ${books.filter(b => b.manualClassification).length}冊`);
console.log(``);
console.log(`次のステップ: npm run split:index でインデックスを再ビルドしてください。`);
