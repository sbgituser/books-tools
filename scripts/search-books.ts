#!/usr/bin/env tsx
/**
 * categories.config.json で定義したカテゴリを Google Books API で検索し、
 * ISBN-13 を自動収集して books.source.json に追記するバッチスクリプト
 *
 * 使い方:
 *   npx tsx scripts/search-books.ts [options]
 *
 * Options:
 *   --config=<path>     カテゴリ設定ファイル (デフォルト: scripts/categories.config.json)
 *   --output=<path>     books.source.json のパス (デフォルト: src/data/books.source.json)
 *   --delay=<ms>        リクエスト間隔ms (デフォルト: 500)
 *   --category=<label>  指定カテゴリのみ処理（複数回指定可）
 *   --replace           既存 source.json を置き換え（デフォルトは既存ISBNを保持して追記）
 *   --dry-run           ファイル書き込みなし（プレビューのみ）
 *   --verbose           詳細ログ
 *
 * 環境変数 (scripts/.env):
 *   GOOGLE_BOOKS_API_KEY   Google Books APIキー（任意・未設定でも動作）
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ════════════════════════════════════════════════════════════════
// 型定義
// ════════════════════════════════════════════════════════════════

interface CategoryConfig {
  label:             string;
  queries:           string[];
  langRestrict?:     string;   // 言語フィルタ（例: "ja"）デフォルト: "ja"
  maxResults?:       number;   // 1クエリあたりの最大取得件数 (1–40) デフォルト: 10
  orderBy?:          'relevance' | 'newest';
  deduplicateVolumes?: boolean; // true: 同シリーズの 2巻以降を除外（漫画・小説向け）
}

interface SourceEntry {
  isbn13:       string;
  note?:        string;
  _category?:   string;   // どのカテゴリから収集したか（参照用）
}

interface GBVolume {
  id: string;
  volumeInfo: {
    title?:      string;
    authors?:    string[];
    publishedDate?: string;
    language?:   string;
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

interface GBSearchResponse {
  totalItems?: number;
  items?:      GBVolume[];
}

// ════════════════════════════════════════════════════════════════
// 環境変数ロード
// ════════════════════════════════════════════════════════════════

function loadEnv(): { googleApiKey: string | null } {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const m = line.match(/^(\w+)\s*=\s*(.+)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  }
  const key = process.env['GOOGLE_BOOKS_API_KEY'] ?? null;
  return { googleApiKey: key?.startsWith('your_') ? null : key ?? null };
}

// ════════════════════════════════════════════════════════════════
// CLI 引数パース
// ════════════════════════════════════════════════════════════════

interface Options {
  config:     string;
  output:     string;
  delay:      number;
  categories: string[];   // 空 = 全カテゴリ
  replace:    boolean;
  dryRun:     boolean;
  verbose:    boolean;
  noKey:      boolean;    // APIキーを使わず匿名アクセス
}

function parseArgs(): Options {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(__dirname, '..');

  const opts: Options = {
    config:     path.join(__dirname, 'categories.config.json'),
    output:     path.join(root, 'src', 'data', 'books.source.json'),
    delay:      500,
    categories: [],
    replace:    false,
    dryRun:     false,
    verbose:    false,
    noKey:      false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg === '--replace')  { opts.replace = true; continue; }
    if (arg === '--dry-run')  { opts.dryRun  = true; continue; }
    if (arg === '--verbose')  { opts.verbose = true; continue; }
    if (arg === '--no-key')   { opts.noKey   = true; continue; }
    if (arg === '--help')     { printHelp(); process.exit(0); }
    const [k, v] = arg.split('=');
    if (!v) continue;
    if (k === '--config')   opts.config     = path.resolve(process.cwd(), v);
    if (k === '--output')   opts.output     = path.resolve(process.cwd(), v);
    if (k === '--delay')    opts.delay      = parseInt(v, 10);
    if (k === '--category') opts.categories.push(v);
  }
  return opts;
}

function printHelp() {
  console.log(`
使い方: npx tsx scripts/search-books.ts [options]

  --config=<path>     categories.config.json のパス
  --output=<path>     books.source.json の出力パス
  --delay=<ms>        リクエスト間隔（デフォルト: 500ms）
  --category=<label>  指定カテゴリのみ処理（複数指定可）
  --replace           既存 source.json を置き換え（デフォルトは追記）
  --dry-run           ファイル書き込みなし（プレビューのみ）
  --verbose           詳細ログ
  --help              このヘルプ

環境変数 (scripts/.env):
  GOOGLE_BOOKS_API_KEY   Google Books APIキー（任意・未設定でも動作）
`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ════════════════════════════════════════════════════════════════
// 巻数重複排除（漫画・小説用）
// ════════════════════════════════════════════════════════════════

/**
 * タイトルからシリーズ基本タイトルと巻番号を抽出する。
 * 「鬼滅の刃（1）」→ { base: "鬼滅の刃", volume: 1 }
 * 「ONE PIECE 1巻」→ { base: "ONE PIECE", volume: 1 }
 * 「進撃の巨人 Vol.2」→ { base: "進撃の巨人", volume: 2 }
 */
function extractVolumeInfo(title: string): { base: string; volume: number } {
  const patterns = [
    /[\s　]*[（(](\d+)[）)]\s*$/, // （1） or (1)
    /[\s　]+第?(\d+)\s*[巻冊]\s*$/, // 第1巻 / 1巻 / 1冊
    /[\s　]+[Vv][Oo][Ll]\.?\s*(\d+)\s*$/,  // vol.1 / Vol 1
    /[\s　]+(\d+)\s*$/, // 末尾のスペース+数字
  ];
  for (const pat of patterns) {
    const m = title.match(pat);
    if (m) {
      return {
        base: title.slice(0, title.length - m[0].length).trim(),
        volume: parseInt(m[1], 10),
      };
    }
  }
  return { base: title, volume: 0 }; // 巻番号なし = 単行本扱い（優先して保持）
}

/** 同一シリーズが複数ある場合、最小巻番号のみ残す */
function deduplicateVolumes(books: SearchedBook[]): SearchedBook[] {
  const best = new Map<string, { book: SearchedBook; volume: number }>();
  for (const book of books) {
    const { base, volume } = extractVolumeInfo(book.title);
    const existing = best.get(base);
    if (!existing || volume < existing.volume) {
      best.set(base, { book, volume });
    }
  }
  return [...best.values()].map(v => v.book);
}

// ════════════════════════════════════════════════════════════════
// Google Books API 検索
// ════════════════════════════════════════════════════════════════

/** Google Books API が 429 を返した場合のグローバルフラグ */
let rateLimited = false;

interface SearchedBook {
  isbn13: string;
  title:  string;
}

async function searchGoogleBooks(
  query:        string,
  maxResults:   number,
  langRestrict: string,
  orderBy:      string,
  apiKey:       string | null,
  verbose:      boolean,
): Promise<SearchedBook[]> {
  if (rateLimited) return [];

  const params = new URLSearchParams({
    q:          query,
    maxResults: String(Math.min(maxResults, 40)),
    langRestrict,
    orderBy,
    ...(apiKey ? { key: apiKey } : {}),
  });
  const url = `https://www.googleapis.com/books/v1/volumes?${params}`;

  if (verbose) console.log(`    GET ${url.replace(/key=[^&]+/, 'key=***')}`);

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal:  AbortSignal.timeout(10_000),
    });

    if (res.status === 429) {
      rateLimited = true;
      console.warn('  ⚠️  レート制限（429）— 実行を停止します。時間をおいて再試行してください。');
      return [];
    }
    if (!res.ok) {
      console.warn(`  ⚠️  HTTP ${res.status}: ${url.replace(/key=[^&]+/, 'key=***')}`);
      return [];
    }

    const data = await res.json() as GBSearchResponse;
    if (verbose) console.log(`    → totalItems: ${data.totalItems ?? 0}, items: ${data.items?.length ?? 0}`);

    const found: SearchedBook[] = [];
    for (const item of data.items ?? []) {
      const isbn13 = item.volumeInfo.industryIdentifiers
        ?.find(x => x.type === 'ISBN_13')?.identifier;
      if (!isbn13) continue;
      found.push({ isbn13, title: item.volumeInfo.title ?? isbn13 });
    }
    return found;

  } catch (e) {
    console.warn(`  ⚠️  エラー: ${(e as Error).message}`);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
// メイン処理
// ════════════════════════════════════════════════════════════════

async function main() {
  const opts = parseArgs();
  const env  = loadEnv();

  // ── 設定ファイル読み込み ───────────────────────────────────────
  if (!fs.existsSync(opts.config)) {
    console.error(`[ERROR] 設定ファイルが見つかりません: ${opts.config}`);
    process.exit(1);
  }
  let configs: CategoryConfig[] = JSON.parse(fs.readFileSync(opts.config, 'utf-8'));

  // --category フィルタ
  if (opts.categories.length > 0) {
    configs = configs.filter(c => opts.categories.includes(c.label));
    if (configs.length === 0) {
      console.error(`[ERROR] 指定カテゴリが設定ファイルに存在しません: ${opts.categories.join(', ')}`);
      process.exit(1);
    }
  }

  // ── 既存 books.source.json 読み込み ──────────────────────────
  let existing: SourceEntry[] = [];
  if (!opts.replace && fs.existsSync(opts.output)) {
    existing = JSON.parse(fs.readFileSync(opts.output, 'utf-8'));
    console.log(`📋  既存 books.source.json: ${existing.length} 件`);
  }

  const existingIsbn13s = new Set(existing.map(e => e.isbn13));

  // ── APIキー確認 ───────────────────────────────────────────────
  if (opts.noKey) {
    console.log('🔑  Google Books APIキー: --no-key により無効化（匿名アクセス・1,000 req/日）');
    env.googleApiKey = null;
  } else if (env.googleApiKey) {
    console.log('🔑  Google Books APIキー: 設定済み（10,000 req/日）');
  } else {
    console.log('🔑  Google Books APIキー: 未設定（匿名アクセス・1,000 req/日）');
  }
  console.log(`⏱   リクエスト間隔: ${opts.delay}ms`);
  if (opts.replace) console.log('🔄  --replace: 既存データを置き換えます');
  if (opts.dryRun)  console.log('👁   --dry-run: ファイルは書き込まれません');
  console.log('');

  // ── カテゴリごとに検索 ────────────────────────────────────────
  const newEntries: SourceEntry[] = [];
  let totalNew = 0;

  for (const config of configs) {
    const langRestrict = config.langRestrict ?? 'ja';
    const maxResults   = config.maxResults   ?? 10;
    const orderBy      = config.orderBy      ?? 'relevance';

    console.log(`📂  カテゴリ: ${config.label} (${config.queries.length} クエリ)`);

    const categoryFound: SearchedBook[] = [];
    const seenInCategory = new Set<string>();

    for (const query of config.queries) {
      if (rateLimited) break;

      console.log(`  🔍  "${query}"`);
      const books = await searchGoogleBooks(
        query, maxResults, langRestrict, orderBy, env.googleApiKey, opts.verbose
      );

      let addedThisQuery = 0;
      for (const book of books) {
        if (seenInCategory.has(book.isbn13)) continue;
        seenInCategory.add(book.isbn13);
        categoryFound.push(book);

        if (!existingIsbn13s.has(book.isbn13)) {
          addedThisQuery++;
        }
        if (opts.verbose) {
          const status = existingIsbn13s.has(book.isbn13) ? '既存' : '新規';
          console.log(`    ${status === '新規' ? '✅' : '⏭ '} [${status}] ${book.isbn13}  ${book.title}`);
        }
      }
      console.log(`    → ${books.length} 件取得 / ${addedThisQuery} 件新規`);

      if (config.queries.indexOf(query) < config.queries.length - 1) {
        await sleep(opts.delay);
      }
    }

    // 巻数重複排除（漫画・小説カテゴリ）
    const deduped = config.deduplicateVolumes
      ? deduplicateVolumes(categoryFound)
      : categoryFound;
    const removedByDedup = categoryFound.length - deduped.length;
    if (removedByDedup > 0) {
      console.log(`  ✂️  巻数重複排除: ${removedByDedup} 件を除外（2巻以降）`);
    }

    // カテゴリ内で新規のものだけ追加
    for (const book of deduped) {
      if (!existingIsbn13s.has(book.isbn13)) {
        existingIsbn13s.add(book.isbn13); // 他カテゴリとの重複防止
        newEntries.push({ isbn13: book.isbn13, note: book.title, _category: config.label });
        totalNew++;
      }
    }

    console.log(`  → カテゴリ合計: ${categoryFound.length} 件 / ${newEntries.filter(e => e._category === config.label).length} 件新規追加`);
    console.log('');

    if (rateLimited) break;
    if (configs.indexOf(config) < configs.length - 1) await sleep(opts.delay);
  }

  // ── 結果サマリー ─────────────────────────────────────────────
  console.log('─'.repeat(50));
  const merged = opts.replace ? newEntries : [...existing, ...newEntries];
  console.log(`新規追加: ${totalNew} 件  合計: ${merged.length} 件`);

  // ── dry-run プレビュー ────────────────────────────────────────
  if (opts.dryRun) {
    console.log('');
    console.log('── dry-run プレビュー（新規追加分・先頭10件）──');
    newEntries.slice(0, 10).forEach(e => {
      console.log(`  ${e.isbn13}  [${e._category}]  ${e.note}`);
    });
    if (newEntries.length > 10) {
      console.log(`  ... 他 ${newEntries.length - 10} 件`);
    }
    console.log('');
    console.log('💡 --dry-run 中: ファイルは書き換えられていません');
    return;
  }

  if (totalNew === 0) {
    console.log('ℹ️  新規ISBNはありませんでした。books.source.json は変更されません。');
    return;
  }

  // ── 書き込み（_category フィールドは出力しない） ──────────────
  const output = merged.map(({ _category: _c, ...rest }) => rest);
  const dir = path.dirname(opts.output);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(opts.output, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`💾  書き込み完了: ${opts.output}`);
  console.log('');
  console.log('✅  次のステップ:');
  console.log('    npm run fetch:books   # 書籍詳細情報を取得して books.index.json を生成');
}

main().catch((e: unknown) => {
  console.error('[FATAL]', e);
  process.exit(1);
});
