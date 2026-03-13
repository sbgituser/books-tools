/**
 * build-split-index.ts
 *
 * books.index.json を L1カテゴリ別に分割し、public/data/ に書き出す。
 *
 * 出力ファイル:
 *   public/data/meta.json          … L1/パス別の冊数・サムネ（カテゴリ画面で使用）
 *   public/data/book-l1.json       … bookId → l1Id マップ（類似本クロスL1検索用）
 *   public/data/books-{l1id}.json  … L1別の BookIndex 配列（書籍一覧画面で遅延ロード）
 */

import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { CATEGORY_TREE } from "../src/lib/categories";
import { resolveBookClassification } from "../src/lib/categoryClassifier";

// ── 型定義 ───────────────────────────────────────────────────────

interface SourceBookIndex {
  id: string;
  title: string;
  authors: string[];
  subtitle?: string;
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  categories: string[];
  subjects?: string[];
  keywords: string[];
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  searchableText: string;
  relatedBookIds?: string[];
  sourceIds?: {
    googleBooksId?: string;
  };
}

interface SplitBookIndex {
  id: string;
  title: string;
  authors: string[];
  subtitle?: string;
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  subjects?: string[];
  keywords: string[];
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  relatedBookIds?: string[];
  sourceIds?: {
    googleBooksId?: string;
  };
  pathIds: string[];
  l1Id: string;
  l2Id?: string;
  l3Id?: string;
  l4TagIds: string[];
  l5TagIds: string[];
  confidence: {
    l1: number;
    l2: number;
    l3: number;
  };
  reasons: string[];
}

// ── パス別インデックス構築 ────────────────────────────────────────

function buildPathIndexes(
  books: SplitBookIndex[],
  pathPrefix: string,
  pathCounts: Record<string, number>,
  pathThumbs: Record<string, string[]>,
): void {
  const thumbSets: Record<string, Set<string>> = {};

  for (const b of books) {
    const ids = b.pathIds;
    if (ids.length === 0) continue;

    for (let i = 0; i < ids.length; i++) {
      const p = `${pathPrefix}:${ids.slice(0, i + 1).join(":")}`;
      pathCounts[p] = (pathCounts[p] ?? 0) + 1;
      if (!thumbSets[p]) thumbSets[p] = new Set<string>();
      if (b.thumbnailUrl && thumbSets[p].size < 3) thumbSets[p].add(b.thumbnailUrl);
    }
  }

  for (const p of Object.keys(thumbSets)) {
    pathThumbs[p] = Array.from(thumbSets[p]);
  }
}

// ── メイン処理 ────────────────────────────────────────────────────

const rawData = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/books.index.json"), "utf-8"),
) as SourceBookIndex[];

const outDir = join(process.cwd(), "public", "data");
mkdirSync(outDir, { recursive: true });

// L1別に書籍を振り分け
const l1Groups = new Map<string, SplitBookIndex[]>(); // l1Id → books
const bookL1: Record<string, string> = {};

let skipped = 0;
for (const raw of rawData) {
  if (!raw.title) continue;

  const classified = resolveBookClassification(raw);
  const l1 = CATEGORY_TREE.find(c => c.id === classified.l1Id);
  if (!l1) { skipped++; continue; }

  const splitBook: SplitBookIndex = {
    id: raw.id,
    title: raw.title,
    authors: raw.authors,
    keywords: raw.keywords,
    pathIds: classified.pathIds,
    l1Id: classified.l1Id,
    l2Id: classified.l2Id,
    l3Id: classified.l3Id,
    l4TagIds: classified.l4TagIds,
    l5TagIds: classified.l5TagIds,
    confidence: classified.confidence,
    reasons: classified.reasons,
  };

  if (raw.subtitle) splitBook.subtitle = raw.subtitle;
  if (raw.publisher) splitBook.publisher = raw.publisher;
  if (raw.publishedDate) splitBook.publishedDate = raw.publishedDate;
  if (raw.isbn13) splitBook.isbn13 = raw.isbn13;
  if (raw.subjects?.length) splitBook.subjects = raw.subjects;
  if (raw.pageCount) splitBook.pageCount = raw.pageCount;
  if (raw.estimatedReadingHours) splitBook.estimatedReadingHours = raw.estimatedReadingHours;
  if (raw.thumbnailUrl) splitBook.thumbnailUrl = raw.thumbnailUrl;
  if (raw.relatedBookIds?.length) splitBook.relatedBookIds = raw.relatedBookIds;
  if (raw.sourceIds?.googleBooksId) {
    splitBook.sourceIds = { googleBooksId: raw.sourceIds.googleBooksId };
  }

  if (!l1Groups.has(l1.id)) l1Groups.set(l1.id, []);
  l1Groups.get(l1.id)!.push(splitBook);
  bookL1[raw.id] = l1.id;
}

// パス別冊数・サムネ（meta.json 用）
const l1Counts: Record<string, number> = {};
const pathCounts: Record<string, number> = {};
const pathThumbs: Record<string, string[]> = {};

for (const l1 of CATEGORY_TREE) {
  const books = l1Groups.get(l1.id) ?? [];
  if (books.length === 0) continue;

  l1Counts[l1.id] = books.length;

  buildPathIndexes(books, l1.id, pathCounts, pathThumbs);

  // L1別 JSON
  writeFileSync(
    join(outDir, `books-${l1.id}.json`),
    JSON.stringify(books),
  );
  console.log(`✓ books-${l1.id}.json  (${books.length}冊)`);
}

// meta.json
writeFileSync(
  join(outDir, "meta.json"),
  JSON.stringify({ l1Counts, pathCounts, pathThumbs }),
);
console.log("✓ meta.json");

// book-l1.json
writeFileSync(
  join(outDir, "book-l1.json"),
  JSON.stringify(bookL1),
);
console.log(`✓ book-l1.json  (${Object.keys(bookL1).length}冊)`);
if (skipped > 0) console.log(`  ※ ${skipped}冊は分類不能のためスキップ`);

console.log("\nDone. Output → public/data/");
