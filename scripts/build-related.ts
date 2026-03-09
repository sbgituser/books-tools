#!/usr/bin/env tsx
/**
 * books.index.json の relatedBookIds を事前計算するバッチスクリプト
 *
 * 使い方:
 *   npx tsx scripts/build-related.ts [options]
 *
 * Options:
 *   --input=<path>      入力ファイルパス (デフォルト: src/data/books.index.json)
 *   --output=<path>     出力ファイルパス (デフォルト: 入力と同じパス = 上書き)
 *   --top-n=<number>    1冊あたりの関連書籍数 (デフォルト: 10)
 *   --min-score=<num>   この値未満の類似度スコアを除外 (デフォルト: 0.1)
 *   --dry-run           ファイルを書き換えずに結果をプレビュー
 *   --verbose           各書籍の計算結果を詳細表示
 *
 * 例:
 *   npx tsx scripts/build-related.ts --dry-run
 *   npx tsx scripts/build-related.ts --top-n=8 --min-score=0.2
 *   npx tsx scripts/build-related.ts --input=src/data/books.index.json --output=dist/books.index.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ════════════════════════════════════════════════════════════════
// 型定義（books.index.json スキーマ）
// ════════════════════════════════════════════════════════════════

type BookIndex = {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn10?: string;
  isbn13?: string;
  language?: string;
  categories: string[];
  subjects?: string[];
  keywords: string[];
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  searchableText: string;
  sourceIds?: {
    googleBooksId?: string;
    openLibraryId?: string;
    ndlId?: string;
  };
  relatedBookIds?: string[];
  updatedAt: string;
};

// ════════════════════════════════════════════════════════════════
// 類似度の重み（定数化 — 調整はここだけ）
// ════════════════════════════════════════════════════════════════

const WEIGHTS = {
  /** カテゴリの Jaccard 類似度に掛ける重み */
  category:  4.0,
  /** サブジェクトの Jaccard 類似度に掛ける重み */
  subject:   3.0,
  /** キーワードの Jaccard 類似度に掛ける重み */
  keyword:   2.0,
  /** 共通著者 1 人あたりの加算スコア */
  author:    3.0,
  /** 同一出版社ボーナス */
  publisher: 0.5,
  /** 同一言語ボーナス */
  language:  0.2,
} as const;

// ════════════════════════════════════════════════════════════════
// CLI 引数パース
// ════════════════════════════════════════════════════════════════

interface Options {
  input:    string;
  output:   string;
  topN:     number;
  minScore: number;
  dryRun:   boolean;
  verbose:  boolean;
}

function parseArgs(): Options {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, '..');

  const defaults: Options = {
    input:    path.join(projectRoot, 'src', 'data', 'books.index.json'),
    output:   '',   // resolved after input
    topN:     10,
    minScore: 0.1,
    dryRun:   false,
    verbose:  false,
  };

  const opts = { ...defaults };

  for (const arg of process.argv.slice(2)) {
    if (arg === '--dry-run')  { opts.dryRun  = true; continue; }
    if (arg === '--verbose')  { opts.verbose = true; continue; }
    if (arg === '--help')     { printHelp(); process.exit(0); }

    const [k, v] = arg.split('=');
    if (!v) continue;
    if (k === '--input')     opts.input    = path.resolve(process.cwd(), v);
    if (k === '--output')    opts.output   = path.resolve(process.cwd(), v);
    if (k === '--top-n')     opts.topN     = Math.max(1, parseInt(v, 10));
    if (k === '--min-score') opts.minScore = parseFloat(v);
  }

  if (!opts.output) opts.output = opts.input;

  return opts;
}

function printHelp() {
  console.log(`
使い方: npx tsx scripts/build-related.ts [options]

  --input=<path>      入力ファイルパス (デフォルト: src/data/books.index.json)
  --output=<path>     出力ファイルパス (デフォルト: 入力ファイルを上書き)
  --top-n=<number>    1冊あたりの関連書籍数 (デフォルト: 10)
  --min-score=<num>   除外する最低スコア閾値 (デフォルト: 0.1)
  --dry-run           ファイルを書き換えずプレビューのみ
  --verbose           各書籍の詳細スコアを表示
  --help              このヘルプを表示

例:
  npx tsx scripts/build-related.ts --dry-run
  npx tsx scripts/build-related.ts --top-n=8 --min-score=0.2
  npx tsx scripts/build-related.ts --output=dist/books.index.json
`);
}

// ════════════════════════════════════════════════════════════════
// 類似度計算ユーティリティ
// ════════════════════════════════════════════════════════════════

/** 文字列配列を正規化（小文字・トリム）した Set を返す */
function toNormalizedSet(arr: string[]): Set<string> {
  return new Set(arr.map(s => s.trim().toLowerCase()).filter(Boolean));
}

/**
 * Jaccard 類似度: |A ∩ B| / |A ∪ B|
 * 両方空の場合は 0 を返す（意味のない一致を防ぐ）
 */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = toNormalizedSet(a);
  const setB = toNormalizedSet(b);
  if (setA.size === 0 && setB.size === 0) return 0;

  let intersection = 0;
  for (const x of setA) {
    if (setB.has(x)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * 書籍ペアの類似度スコアを計算する
 *
 * スコア構成:
 *   categories × WEIGHTS.category  (Jaccard)
 *   subjects   × WEIGHTS.subject   (Jaccard)
 *   keywords   × WEIGHTS.keyword   (Jaccard)
 *   共通著者数 × WEIGHTS.author    (加算)
 *   同一出版社 × WEIGHTS.publisher (ボーナス)
 *   同一言語   × WEIGHTS.language  (ボーナス)
 */
function computeSimilarity(a: BookIndex, b: BookIndex): number {
  let score = 0;

  // カテゴリ
  score += jaccard(a.categories, b.categories) * WEIGHTS.category;

  // サブジェクト
  score += jaccard(a.subjects ?? [], b.subjects ?? []) * WEIGHTS.subject;

  // キーワード
  score += jaccard(a.keywords, b.keywords) * WEIGHTS.keyword;

  // 著者（共通著者 1 人ごとに加算）
  const authA = toNormalizedSet(a.authors);
  const authB = toNormalizedSet(b.authors);
  for (const auth of authA) {
    if (authB.has(auth)) score += WEIGHTS.author;
  }

  // 出版社
  if (
    a.publisher && b.publisher &&
    a.publisher.trim().toLowerCase() === b.publisher.trim().toLowerCase()
  ) {
    score += WEIGHTS.publisher;
  }

  // 言語
  if (a.language && b.language && a.language === b.language) {
    score += WEIGHTS.language;
  }

  return score;
}

// ════════════════════════════════════════════════════════════════
// バッチメイン処理
// ════════════════════════════════════════════════════════════════

async function main() {
  const opts = parseArgs();

  // ── ファイル読み込み ───────────────────────────────────────
  if (!fs.existsSync(opts.input)) {
    console.error(`[ERROR] 入力ファイルが見つかりません: ${opts.input}`);
    process.exit(1);
  }

  console.log(`📖  入力: ${opts.input}`);

  let books: BookIndex[];
  try {
    const raw = fs.readFileSync(opts.input, 'utf-8');
    books = JSON.parse(raw) as BookIndex[];
  } catch (e) {
    console.error(`[ERROR] JSON のパースに失敗しました: ${(e as Error).message}`);
    process.exit(1);
  }

  if (!Array.isArray(books) || books.length === 0) {
    console.error('[ERROR] books.index.json が空または配列ではありません。');
    process.exit(1);
  }

  const n = books.length;
  console.log(`📚  ${n} 件の書籍を読み込みました`);
  console.log(`⚙️   top-n=${opts.topN}, min-score=${opts.minScore}${opts.dryRun ? ', dry-run=ON' : ''}`);
  console.log('');

  // ── 類似度計算（O(n²)）────────────────────────────────────
  const now = new Date().toISOString();
  let updatedCount = 0;

  console.log(`🔍  類似度を計算中 (${n} × ${n - 1} = ${n * (n - 1)} ペア)...`);
  const startMs = Date.now();

  for (let i = 0; i < n; i++) {
    const a = books[i];

    type Scored = { id: string; score: number };
    const scores: Scored[] = [];

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const b = books[j];
      const score = computeSimilarity(a, b);
      if (score >= opts.minScore) {
        scores.push({ id: b.id, score });
      }
    }

    // スコア降順ソート → top-N 選択
    scores.sort((x, y) => y.score - x.score);
    const topIds = scores.slice(0, opts.topN).map(s => s.id);

    const changed =
      JSON.stringify(a.relatedBookIds ?? []) !== JSON.stringify(topIds);

    if (changed) {
      books[i].relatedBookIds = topIds;
      books[i].updatedAt      = now;
      updatedCount++;
    }

    if (opts.verbose) {
      console.log(`  [${i + 1}/${n}] "${a.title}"`);
      scores.slice(0, opts.topN).forEach(s => {
        const title = books.find(b => b.id === s.id)?.title ?? s.id;
        console.log(`         ↳ score=${s.score.toFixed(3)}  ${title}`);
      });
    } else if ((i + 1) % Math.max(1, Math.floor(n / 10)) === 0 || i === n - 1) {
      const pct = Math.round((i + 1) / n * 100);
      process.stdout.write(`\r  進捗: ${i + 1}/${n} (${pct}%)`);
    }
  }

  const elapsedMs = Date.now() - startMs;
  process.stdout.write('\n');
  console.log(`✅  計算完了 (${elapsedMs}ms) — ${updatedCount}/${n} 件を更新`);

  // ── dry-run プレビュー ─────────────────────────────────────
  if (opts.dryRun) {
    console.log('');
    console.log('── dry-run プレビュー（先頭3件）──────────────────────');
    books.slice(0, 3).forEach(b => {
      console.log(`\n  "${b.title}"`);
      if (!b.relatedBookIds?.length) {
        console.log('    (関連書籍なし)');
        return;
      }
      b.relatedBookIds.forEach((rid, idx) => {
        const related = books.find(x => x.id === rid);
        console.log(`    ${idx + 1}. ${related?.title ?? rid}`);
      });
    });
    console.log('');
    console.log('💡  --dry-run 中: ファイルは書き換えられていません。');
    return;
  }

  // ── ファイル書き込み ───────────────────────────────────────
  const outputDir = path.dirname(opts.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    fs.writeFileSync(opts.output, JSON.stringify(books, null, 2), 'utf-8');
    console.log(`💾  書き込み完了: ${opts.output}`);
  } catch (e) {
    console.error(`[ERROR] ファイルの書き込みに失敗しました: ${(e as Error).message}`);
    process.exit(1);
  }

  console.log('🎉  完了');
}

main().catch((e: unknown) => {
  console.error('[FATAL]', e);
  process.exit(1);
});
