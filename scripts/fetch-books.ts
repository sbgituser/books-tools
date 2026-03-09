#!/usr/bin/env tsx
/**
 * books.source.json に記載した ISBN から書誌情報を取得し、
 * books.index.json を生成・更新するバッチスクリプト
 *
 * 利用API（すべて無料・商用利用可）:
 *   1. Google Books API   https://developers.google.com/books
 *      - APIキー任意（未設定: 1,000 req/日、設定済: 10,000 req/日）
 *      - 利用規約: 非商用・商用いずれも可。Google へのアトリビューション推奨。
 *      - データ: © Google / 出版社
 *
 *   2. OpenBD             https://openbd.jp/
 *      - APIキー不要
 *      - ライセンス: CC0（パブリックドメイン）
 *      - データ: 出版社が登録した日本語書籍の書誌情報
 *
 * 使い方:
 *   npx tsx scripts/fetch-books.ts [options]
 *
 * Options:
 *   --source=<path>    入力ファイル (デフォルト: src/data/books.source.json)
 *   --output=<path>    出力ファイル (デフォルト: src/data/books.index.json)
 *   --delay=<ms>       リクエスト間隔ms (デフォルト: 500)
 *   --force            既存エントリも再取得して上書き
 *   --dry-run          ファイルを書き換えずプレビュー
 *   --verbose          詳細ログ
 *   --isbn=<isbn13>    1冊だけ取得してプレビュー（テスト用）
 *
 * 環境変数 (scripts/.env または環境変数として設定):
 *   GOOGLE_BOOKS_API_KEY   Google Books APIキー（任意）
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ════════════════════════════════════════════════════════════════
// 型定義
// ════════════════════════════════════════════════════════════════

/** books.source.json の各エントリ */
type SourceEntry = {
  isbn13?:       string;
  isbn10?:       string;
  amazonAsin?:   string;   // 参照用（APIに使わない）
  query?:        string;   // ISBNがない場合のタイトル検索クエリ
  extraKeywords?: string[]; // 手動追加キーワード
  note?:         string;   // メモ（無視）
};

/** books.index.json の各エントリ（出力スキーマ） */
type BookIndex = {
  id:                   string;
  title:                string;
  subtitle?:            string;
  authors:              string[];
  publisher?:           string;
  publishedDate?:       string;
  isbn10?:              string;
  isbn13?:              string;
  language?:            string;
  categories:           string[];
  subjects?:            string[];
  keywords:             string[];
  pageCount?:           number;
  estimatedReadingHours?: number;
  thumbnailUrl?:        string;
  searchableText:       string;
  sourceIds?: {
    googleBooksId?:  string;
    openLibraryId?:  string;
    amazonAsin?:     string;
  };
  relatedBookIds?:      string[];
  updatedAt:            string;
};

// ════════════════════════════════════════════════════════════════
// NDC（日本十進分類法）コード → カテゴリ名マッピング
// ════════════════════════════════════════════════════════════════

const NDC_MAP: Record<string, string> = {
  '0':   '総記',
  '00':  '総記',
  '01':  '図書館・図書館学',
  '02':  '図書・書誌学',
  '07':  '刊行物・ジャーナリズム',
  '1':   '哲学・心理学',
  '10':  '哲学',
  '11':  '形而上学',
  '12':  '東洋思想',
  '13':  '西洋哲学',
  '14':  '心理学',
  '15':  '倫理学・道徳',
  '16':  '宗教',
  '18':  '仏教',
  '19':  'キリスト教',
  '2':   '歴史・地理',
  '20':  '歴史',
  '21':  '日本史',
  '22':  'アジア史',
  '23':  'ヨーロッパ史',
  '29':  '地理・地誌',
  '3':   '社会科学',
  '30':  '社会科学',
  '31':  '政治',
  '32':  '法律',
  '33':  'ビジネス・経済',
  '336': 'ビジネス・経営',
  '34':  '財政・金融',
  '35':  '統計',
  '36':  '社会学・福祉',
  '37':  '教育',
  '38':  '民族学・文化人類学',
  '39':  '国防・軍事',
  '4':   '自然科学',
  '40':  '科学',
  '41':  '数学',
  '42':  '物理学',
  '43':  '化学',
  '44':  '天文学・宇宙科学',
  '45':  '地球科学・地学',
  '46':  '生物学',
  '47':  '植物学',
  '48':  '動物学',
  '49':  '医学・薬学',
  '5':   '技術・工学',
  '50':  '技術',
  '51':  '建設工学・土木工学',
  '52':  '建築学',
  '53':  '機械工学',
  '54':  'コンピュータ・IT',
  '547': 'コンピュータ・IT',
  '548': 'コンピュータ・IT',
  '55':  '電気工学・電子工学',
  '56':  '鉱山工学・冶金工学',
  '57':  '化学工業',
  '58':  '製造業',
  '59':  '家政学・生活科学',
  '6':   '産業',
  '60':  '産業',
  '61':  '農業',
  '62':  '園芸',
  '63':  '蚕糸業',
  '64':  '畜産業・獣医学',
  '65':  '林業',
  '66':  '水産業',
  '67':  '商業',
  '68':  '交通・通信',
  '69':  '貿易',
  '7':   '芸術・美術',
  '70':  '芸術',
  '71':  '彫刻・オブジェ',
  '72':  '絵画',
  '73':  '版画',
  '74':  '写真',
  '75':  '工芸',
  '76':  '音楽',
  '77':  '映画・映像・演劇',
  '78':  'スポーツ・体育',
  '79':  '諸芸・娯楽',
  '8':   '言語・語学',
  '80':  '語学',
  '81':  '日本語',
  '83':  '英語',
  '9':   '文学・小説',
  '90':  '文学',
  '91':  '日本文学',
  '92':  '中国文学',
  '93':  '英米文学',
  '94':  'ドイツ文学',
  '95':  'フランス文学',
  '99':  '外国文学',
};

function ndcToCategory(code: string): string | null {
  // 長いコードから順にマッチ
  for (let len = Math.min(code.length, 3); len >= 1; len--) {
    const key = code.slice(0, len);
    if (NDC_MAP[key]) return NDC_MAP[key];
  }
  return null;
}

// ════════════════════════════════════════════════════════════════
// Google Books API カテゴリ → 日本語変換
// ════════════════════════════════════════════════════════════════

const GB_CATEGORY_MAP: Record<string, string> = {
  'Business & Economics':         'ビジネス・経済',
  'Self-Help':                    '自己啓発',
  'Psychology':                   '心理学',
  'Science':                      '科学・技術',
  'Technology & Engineering':     'コンピュータ・IT',
  'Computers':                    'コンピュータ・IT',
  'Mathematics':                  '数学',
  'History':                      '歴史',
  'Philosophy':                   '哲学',
  'Political Science':            '政治',
  'Social Science':               '社会科学',
  'Law':                          '法律',
  'Medical':                      '医学・健康',
  'Health & Fitness':             '健康',
  'Sports & Recreation':          'スポーツ',
  'Art':                          '芸術',
  'Music':                        '音楽',
  'Fiction':                      '小説・フィクション',
  'Literary Fiction':             '純文学',
  'Literary Collections':         '文学',
  'Language Arts & Disciplines':  '語学',
  'Education':                    '教育',
  'Religion':                     '宗教',
  'Nature':                       '自然',
  'Travel':                       '旅行',
  'Cooking':                      '料理',
  'Design':                       'デザイン',
  'Architecture':                 '建築',
  'Biography & Autobiography':    '伝記・自叙伝',
};

function gbCategoryToJa(cat: string): string {
  for (const [en, ja] of Object.entries(GB_CATEGORY_MAP)) {
    if (cat.toLowerCase().includes(en.toLowerCase())) return ja;
  }
  return cat; // 変換できなければそのまま返す
}

// ════════════════════════════════════════════════════════════════
// 環境変数ロード（scripts/.env）
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
  source:     string;
  output:     string;
  delay:      number;
  force:      boolean;
  dryRun:     boolean;
  verbose:    boolean;
  singleIsbn: string | null;
  noGoogle:   boolean;   // Google Books をスキップし OpenBD のみ使用
}

function parseArgs(): Options {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(__dirname, '..');

  const opts: Options = {
    source:     path.join(root, 'src', 'data', 'books.source.json'),
    output:     path.join(root, 'src', 'data', 'books.index.json'),
    delay:      500,
    force:      false,
    dryRun:     false,
    verbose:    false,
    singleIsbn: null,
    noGoogle:   false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg === '--force')     { opts.force    = true; continue; }
    if (arg === '--dry-run')   { opts.dryRun   = true; continue; }
    if (arg === '--verbose')   { opts.verbose  = true; continue; }
    if (arg === '--no-google') { opts.noGoogle = true; continue; }
    if (arg === '--help')      { printHelp(); process.exit(0); }
    const [k, v] = arg.split('=');
    if (!v) continue;
    if (k === '--source') opts.source     = path.resolve(process.cwd(), v);
    if (k === '--output') opts.output     = path.resolve(process.cwd(), v);
    if (k === '--delay')  opts.delay      = parseInt(v, 10);
    if (k === '--isbn')   opts.singleIsbn = v;
  }
  return opts;
}

function printHelp() {
  console.log(`
使い方: npx tsx scripts/fetch-books.ts [options]

  --source=<path>    books.source.json のパス
  --output=<path>    books.index.json の出力パス
  --delay=<ms>       リクエスト間隔（デフォルト: 500ms）
  --force            既存エントリも再取得して上書き
  --dry-run          ファイル書き込みなし（プレビューのみ）
  --verbose          詳細ログ
  --no-google        Google Books をスキップし OpenBD のみ使用（レート制限回避）
  --isbn=<isbn13>    1冊だけ取得してプレビュー（テスト用）
  --help             このヘルプ

環境変数 (scripts/.env):
  GOOGLE_BOOKS_API_KEY   Google Books APIキー（任意・未設定でも動作）
`);
}

// ════════════════════════════════════════════════════════════════
// ユーティリティ
// ════════════════════════════════════════════════════════════════

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 重複を除去して結合 */
function dedupe(arr: string[]): string[] {
  return [...new Set(arr.filter(Boolean))];
}

/**
 * OpenBD の著者名を正規化する
 *   "梶並,千春"    → "梶並千春"  （日本語姓名: カンマを削除）
 *   "McKeown,Greg" → "Greg McKeown"  （欧文姓名: 順序を逆転してスペース区切り）
 *   "梶並千春,1963-" → "梶並千春"  （生年付き: 生年を除去）
 */
function normalizeAuthorName(name: string): string {
  // 生年表記を除去 (例: ",1963-" や ", 1963-2020")
  const withoutYear = name.replace(/,\s*\d{4}[-–]?\d*$/, '').trim();

  if (!withoutYear.includes(',')) return withoutYear;

  const [family, given] = withoutYear.split(',').map(s => s.trim());
  if (!given) return family;

  // 日本語（CJK文字を含む）かどうかで判定
  const hasJapanese = /[\u3000-\u9fff\uff00-\uffef]/.test(family + given);
  if (hasJapanese) {
    // 日本語: 姓名をそのまま結合（スペースなし）
    return `${family}${given}`;
  } else {
    // 欧文: "Given Family" の順で返す
    return `${given} ${family}`;
  }
}

/** 読書時間の目安計算（日本語: 400文字/分、英語: 250ワード/分） */
function estimateReadingHours(pageCount: number, language = 'ja'): number {
  const pagesPerHour = language === 'ja' ? 40 : 50;
  return Math.round((pageCount / pagesPerHour) * 10) / 10;
}

/** 書誌情報から searchableText を生成 */
function buildSearchableText(book: Partial<BookIndex>): string {
  return [
    book.title,
    book.subtitle,
    ...(book.authors ?? []),
    book.publisher,
    ...(book.categories ?? []),
    ...(book.subjects ?? []),
    ...(book.keywords ?? []),
  ].filter(Boolean).join(' ');
}

/** ISBN-13 から ID を生成 */
function makeId(isbn13?: string, googleBooksId?: string): string {
  if (isbn13) return isbn13;
  if (googleBooksId) return `gb-${googleBooksId}`;
  return `book-${Date.now()}`;
}

// ════════════════════════════════════════════════════════════════
// Google Books API
// ════════════════════════════════════════════════════════════════

interface GBVolumeInfo {
  title?:       string;
  subtitle?:    string;
  authors?:     string[];
  publisher?:   string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
  pageCount?:   number;
  categories?:  string[];
  imageLinks?:  { thumbnail?: string; smallThumbnail?: string };
  language?:    string;
}

/** Google Books API が 429 を返した場合のグローバルフラグ（同一実行内でスキップ） */
let googleBooksRateLimited = false;

async function fetchGoogleBooks(
  query: string,
  apiKey: string | null,
  verbose: boolean,
): Promise<{ volumeId: string; info: GBVolumeInfo } | null> {
  if (googleBooksRateLimited) return null;

  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1${keyParam}`;

  if (verbose) console.log(`    [Google Books] GET ${url.replace(/key=[^&]+/, 'key=***')}`);

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal:  AbortSignal.timeout(10_000),
    });
    if (res.status === 429) {
      googleBooksRateLimited = true;
      console.warn('    [Google Books] ⚠️  レート制限（429）— 今回の実行では Google Books をスキップします');
      console.warn('    → Google Cloud Console で無料 APIキーを取得し scripts/.env に設定すると解消します');
      console.warn('    → https://console.cloud.google.com/ → Books API → 認証情報 → APIキー');
      return null;
    }
    if (!res.ok) {
      console.warn(`    [Google Books] HTTP ${res.status}`);
      return null;
    }
    const data = await res.json() as { items?: { id: string; volumeInfo: GBVolumeInfo }[] };
    if (!data.items?.length) {
      if (verbose) console.log('    [Google Books] 結果なし');
      return null;
    }
    return { volumeId: data.items[0].id, info: data.items[0].volumeInfo };
  } catch (e) {
    console.warn(`    [Google Books] エラー: ${(e as Error).message}`);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════
// OpenBD API（日本語書籍・CC0ライセンス）
// ════════════════════════════════════════════════════════════════

interface OpenBDSummary {
  isbn?:      string;
  title?:     string;
  publisher?: string;
  pubdate?:   string;
  cover?:     string;
  author?:    string;
  volume?:    string;
  series?:    string;
}

interface OpenBDOnix {
  DescriptiveDetail?: {
    TitleDetail?: {
      TitleElement?: {
        TitleText?: { content?: string };
        Subtitle?:  { content?: string };
      };
    };
    Contributor?: {
      ContributorRole: string[];
      PersonName?: { content?: string };
    }[];
    Subject?: {
      SubjectSchemeIdentifier: string;
      SubjectCode?: string;
      SubjectHeadingText?: string;
    }[];
  };
  CollateralDetail?: {
    TextContent?: {
      TextType: string; // "03" = description
      Text?: string;
    }[];
  };
}

interface OpenBDEntry {
  summary?: OpenBDSummary;
  onix?:    OpenBDOnix;
}

async function fetchOpenBD(
  isbn13: string,
  verbose: boolean,
): Promise<OpenBDEntry | null> {
  const url = `https://api.openbd.jp/v1/get?isbn=${isbn13}&pretty=false`;
  if (verbose) console.log(`    [OpenBD] GET ${url}`);

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal:  AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn(`    [OpenBD] HTTP ${res.status}`);
      return null;
    }
    const data = await res.json() as (OpenBDEntry | null)[];
    if (!data[0]) {
      if (verbose) console.log('    [OpenBD] データなし（未登録ISBN）');
      return null;
    }
    return data[0];
  } catch (e) {
    console.warn(`    [OpenBD] エラー: ${(e as Error).message}`);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════
// データ正規化（Google Books + OpenBD → BookIndex）
// ════════════════════════════════════════════════════════════════

function normalizeBook(
  entry:    SourceEntry,
  gb:       { volumeId: string; info: GBVolumeInfo } | null,
  obd:      OpenBDEntry | null,
  existing: BookIndex | null,
): BookIndex {
  const now = new Date().toISOString();

  // ── ISBN ─────────────────────────────────────────────────────
  const isbn13 = entry.isbn13
    ?? gb?.info.industryIdentifiers?.find(x => x.type === 'ISBN_13')?.identifier
    ?? existing?.isbn13;
  const isbn10 = entry.isbn10
    ?? gb?.info.industryIdentifiers?.find(x => x.type === 'ISBN_10')?.identifier
    ?? existing?.isbn10;

  const id = makeId(isbn13, gb?.volumeId);

  // ── タイトル ──────────────────────────────────────────────────
  const gbTitle  = gb?.info.title  ?? '';
  const obdTitle = obd?.summary?.title ?? '';
  const title    = obdTitle || gbTitle || existing?.title || '（タイトル不明）';

  const gbSubtitle  = gb?.info.subtitle ?? '';
  const obdSubtitle = obd?.onix?.DescriptiveDetail?.TitleDetail?.TitleElement?.Subtitle?.content ?? '';
  const subtitle    = obdSubtitle || gbSubtitle || existing?.subtitle;

  // ── 著者 ─────────────────────────────────────────────────────
  const gbAuthors = gb?.info.authors ?? [];
  // ContributorRole が空配列のケースも含める（OpenBD は未設定のことがある）
  const AUTHOR_ROLES = new Set(['A01', 'A02', 'A03', 'B01', 'E07']);
  const obdAuthors = (obd?.onix?.DescriptiveDetail?.Contributor ?? [])
    .filter(c => c.ContributorRole.length === 0 || c.ContributorRole.some(r => AUTHOR_ROLES.has(r)))
    .map(c => c.PersonName?.content ?? '')
    .filter(Boolean)
    .map(normalizeAuthorName);
  // summary.author はフォールバック用（複数著者が1文字列に混在するため最終手段）
  const obdAuthorFallback: string[] = [];

  const authors = dedupe([
    ...(obdAuthors.length ? obdAuthors : obdAuthorFallback),
    ...gbAuthors,
    ...(existing?.authors ?? []),
  ]).slice(0, 5); // 最大5名

  // ── 出版社・出版日 ────────────────────────────────────────────
  const publisher = obd?.summary?.publisher
    ?? gb?.info.publisher
    ?? existing?.publisher;

  const obdDate = obd?.summary?.pubdate
    ? obd.summary.pubdate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
    : null;
  const publishedDate = obdDate ?? gb?.info.publishedDate ?? existing?.publishedDate;

  // ── 言語 ─────────────────────────────────────────────────────
  const language = gb?.info.language ?? existing?.language ?? 'ja';

  // ── カテゴリ・サブジェクト ────────────────────────────────────
  // OpenBD の NDC コードをカテゴリに変換
  const ndcSubjects = (obd?.onix?.DescriptiveDetail?.Subject ?? [])
    .filter(s => s.SubjectSchemeIdentifier === '78' || s.SubjectSchemeIdentifier === '20')
    .map(s => s.SubjectCode ? ndcToCategory(s.SubjectCode) : (s.SubjectHeadingText ?? null))
    .filter((x): x is string => x !== null);

  // OpenBD の見出し語（SubjectSchemeIdentifier === '20' はキーワード）
  const obdKeywordSubjects = (obd?.onix?.DescriptiveDetail?.Subject ?? [])
    .filter(s => s.SubjectSchemeIdentifier === '20')
    .map(s => s.SubjectHeadingText ?? '')
    .filter(Boolean);

  // Google Books のカテゴリを日本語化
  const gbCategoriesJa = (gb?.info.categories ?? []).map(gbCategoryToJa);

  // categories: 大分類（重複排除）
  const categories = dedupe([
    ...ndcSubjects.slice(0, 2),
    ...gbCategoriesJa,
    ...(existing?.categories ?? []),
  ]).slice(0, 4);

  // subjects: より詳細なトピック
  const subjects = dedupe([
    ...obdKeywordSubjects,
    ...(existing?.subjects ?? []),
  ]).slice(0, 6);

  // ── キーワード ────────────────────────────────────────────────
  const keywords = dedupe([
    ...categories,
    ...subjects,
    ...(entry.extraKeywords ?? []),
    ...(existing?.keywords ?? []),
  ]).slice(0, 15);

  // ── ページ数・読書時間 ────────────────────────────────────────
  const pageCount = gb?.info.pageCount ?? existing?.pageCount;
  const estimatedReadingHours = pageCount
    ? estimateReadingHours(pageCount, language)
    : existing?.estimatedReadingHours;

  // ── サムネイル ────────────────────────────────────────────────
  const gbThumb = gb?.info.imageLinks?.thumbnail?.replace(/^http:/, 'https:');
  const obdCover = obd?.summary?.cover ?? null;
  const thumbnailUrl = obdCover ?? gbThumb ?? existing?.thumbnailUrl;

  // ── searchableText ────────────────────────────────────────────
  const partial: Partial<BookIndex> = {
    title, subtitle, authors, publisher, categories, subjects, keywords,
  };
  const searchableText = buildSearchableText(partial);

  // ── 組み立て ─────────────────────────────────────────────────
  const book: BookIndex = {
    id,
    title,
    authors,
    categories,
    keywords,
    searchableText,
    updatedAt: now,
  };

  if (subtitle)             book.subtitle             = subtitle;
  if (publisher)            book.publisher            = publisher;
  if (publishedDate)        book.publishedDate        = publishedDate;
  if (isbn10)               book.isbn10               = isbn10;
  if (isbn13)               book.isbn13               = isbn13;
  if (language)             book.language             = language;
  if (subjects.length)      book.subjects             = subjects;
  if (pageCount)            book.pageCount            = pageCount;
  if (estimatedReadingHours) book.estimatedReadingHours = estimatedReadingHours;
  if (thumbnailUrl)         book.thumbnailUrl         = thumbnailUrl;

  // sourceIds
  const sourceIds: NonNullable<BookIndex['sourceIds']> = {};
  if (gb?.volumeId)       sourceIds.googleBooksId = gb.volumeId;
  if (entry.amazonAsin)   sourceIds.amazonAsin    = entry.amazonAsin;
  if (Object.keys(sourceIds).length) book.sourceIds = sourceIds;

  // 既存の relatedBookIds は保持（fetch-books では上書きしない）
  if (existing?.relatedBookIds?.length) {
    book.relatedBookIds = existing.relatedBookIds;
  }

  return book;
}

// ════════════════════════════════════════════════════════════════
// 1冊分の取得処理
// ════════════════════════════════════════════════════════════════

async function fetchOne(
  entry:    SourceEntry,
  existing: BookIndex | null,
  apiKey:   string | null,
  verbose:  boolean,
  noGoogle: boolean,
): Promise<BookIndex | null> {
  // ISBN も query も未指定の場合はスキップ
  if (!entry.isbn13 && !entry.query) {
    console.warn('    [SKIP] isbn13 も query も未指定のエントリをスキップ');
    return null;
  }

  // Google Books クエリを構築
  const gbQuery = entry.isbn13 ? `isbn:${entry.isbn13}` : (entry.query ?? '');

  // 並列取得（Google Books + OpenBD）
  const [gb, obd] = await Promise.all([
    (!noGoogle && gbQuery) ? fetchGoogleBooks(gbQuery, apiKey, verbose) : Promise.resolve(null),
    entry.isbn13 ? fetchOpenBD(entry.isbn13, verbose) : Promise.resolve(null),
  ]);

  if (!gb && !obd) {
    console.warn('    [WARN] どのAPIからもデータを取得できませんでした');
    return null;
  }

  return normalizeBook(entry, gb, obd, existing);
}

// ════════════════════════════════════════════════════════════════
// メイン処理
// ════════════════════════════════════════════════════════════════

async function main() {
  const opts   = parseArgs();
  const env    = loadEnv();

  // ── 単一ISBN テストモード ─────────────────────────────────────
  if (opts.singleIsbn) {
    console.log(`🔍  単一ISBN テストモード: ${opts.singleIsbn}`);
    const entry: SourceEntry = { isbn13: opts.singleIsbn };
    const book = await fetchOne(entry, null, env.googleApiKey, true, opts.noGoogle);
    console.log(JSON.stringify(book, null, 2));
    return;
  }

  // ── source 読み込み ───────────────────────────────────────────
  if (!fs.existsSync(opts.source)) {
    console.error(`[ERROR] source ファイルが見つかりません: ${opts.source}`);
    process.exit(1);
  }
  const sources: SourceEntry[] = JSON.parse(fs.readFileSync(opts.source, 'utf-8'));
  console.log(`📋  ${sources.length} 件のソースエントリを読み込みました: ${opts.source}`);

  // ── 既存 books.index.json 読み込み ───────────────────────────
  let existingBooks: BookIndex[] = [];
  if (fs.existsSync(opts.output)) {
    existingBooks = JSON.parse(fs.readFileSync(opts.output, 'utf-8'));
    console.log(`📚  既存 books.index.json: ${existingBooks.length} 件`);
  }

  // 既存データをIDと ISBN13 でインデックス化
  const existingById  = new Map(existingBooks.map(b => [b.id,     b]));
  const existingByIsbn = new Map(existingBooks.flatMap(b => b.isbn13 ? [[b.isbn13, b] as [string, BookIndex]] : []));

  // ── Google Books APIキー確認 ──────────────────────────────────
  if (env.googleApiKey) {
    console.log('🔑  Google Books APIキー: 設定済み（10,000 req/日）');
  } else {
    console.log('🔑  Google Books APIキー: 未設定（匿名アクセス・1,000 req/日）');
    console.log('    → scripts/.env に GOOGLE_BOOKS_API_KEY を設定するとレート制限が緩和されます');
  }
  console.log(`⏱   リクエスト間隔: ${opts.delay}ms`);
  if (opts.force)  console.log('⚡  --force: 既存エントリも再取得します');
  if (opts.dryRun) console.log('👁   --dry-run: ファイルは書き込まれません');
  console.log('');

  // ── 各エントリを処理 ─────────────────────────────────────────
  const results: BookIndex[] = [];
  let fetchedCount  = 0;
  let skippedCount  = 0;
  let failedCount   = 0;

  for (let i = 0; i < sources.length; i++) {
    const entry   = sources[i];
    const label   = entry.note ?? entry.isbn13 ?? entry.query ?? `エントリ${i + 1}`;
    const prefix  = `[${i + 1}/${sources.length}]`;

    // 既存エントリのチェック（--force なければスキップ）
    const tentativeId = entry.isbn13 ?? '';
    const existing = existingByIsbn.get(tentativeId)
      ?? existingById.get(tentativeId)
      ?? null;

    if (existing && !opts.force) {
      console.log(`${prefix} ⏭  スキップ（既存）: ${label}`);
      results.push(existing);
      skippedCount++;
      continue;
    }

    console.log(`${prefix} 🌐  取得中: ${label}`);

    const book = await fetchOne(entry, existing, env.googleApiKey, opts.verbose, opts.noGoogle);

    if (book) {
      results.push(book);
      fetchedCount++;
      console.log(`     ✅  "${book.title}" (id: ${book.id})`);
    } else {
      // 取得失敗 → 既存があれば保持
      if (existing) {
        results.push(existing);
        console.log(`     ⚠️  取得失敗、既存データを保持`);
      } else {
        failedCount++;
        console.log(`     ❌  取得失敗、スキップ`);
      }
    }

    // APIレート制限対策（最後以外は待機）
    if (i < sources.length - 1) await sleep(opts.delay);
  }

  // ── ソースに含まれない既存エントリを保持 ─────────────────────
  const resultIds = new Set(results.map(b => b.id));
  const sourceIsbn13s = new Set(sources.map(s => s.isbn13).filter(Boolean));
  for (const b of existingBooks) {
    if (!resultIds.has(b.id) && (!b.isbn13 || !sourceIsbn13s.has(b.isbn13))) {
      results.push(b);
    }
  }

  // ── 結果サマリー ─────────────────────────────────────────────
  console.log('');
  console.log('─'.repeat(50));
  console.log(`取得: ${fetchedCount}件  スキップ: ${skippedCount}件  失敗: ${failedCount}件`);
  console.log(`出力件数: ${results.length}件`);

  // ── dry-run プレビュー ────────────────────────────────────────
  if (opts.dryRun) {
    console.log('');
    console.log('── dry-run プレビュー（先頭3件）──');
    results.slice(0, 3).forEach(b => {
      console.log(`\n  "${b.title}"`);
      console.log(`    id:         ${b.id}`);
      console.log(`    authors:    ${b.authors.join(', ')}`);
      console.log(`    categories: ${b.categories.join(', ')}`);
      console.log(`    keywords:   ${b.keywords.join(', ')}`);
      console.log(`    thumbnail:  ${b.thumbnailUrl ?? '(なし)'}`);
    });
    console.log('');
    console.log('💡 --dry-run 中: ファイルは書き換えられていません');
    return;
  }

  // ── 書き込み ─────────────────────────────────────────────────
  const dir = path.dirname(opts.output);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(opts.output, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`💾  書き込み完了: ${opts.output}`);
  console.log('');
  console.log('✅  次のステップ:');
  console.log('    npm run build:related   # relatedBookIds を計算して埋め込む');
}

main().catch((e: unknown) => {
  console.error('[FATAL]', e);
  process.exit(1);
});
