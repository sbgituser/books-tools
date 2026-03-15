/**
 * searchEngine.ts
 *
 * クライアントサイド全文検索エンジン
 *
 * スコアリング優先順位:
 *   1. ISBN完全一致 (200)
 *   2. タイトル完全一致 (100)
 *   3. 著者完全一致 (80)
 *   4. タイトル前方一致 (50)
 *   5. タイトル部分一致 (30)
 *   6. 著者部分一致 (20)
 *   7. キーワード完全一致 (15)
 *   8. 出版社部分一致 (8)
 *   9. キーワード部分一致 (5)
 */

export interface SearchEntry {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  googleBooksId?: string;
  thumbnailUrl?: string;
  pageCount?: number;
  estimatedReadingHours?: number;
  keywords: string[];
  l1Id: string;
}

// ── スコアリング定数（定数化で調整しやすく）────────────────────
export const SCORE_WEIGHTS = {
  ISBN_EXACT:         200,
  TITLE_EXACT:        100,
  AUTHOR_EXACT:        80,
  TITLE_PREFIX:        50,
  TITLE_CONTAINS:      30,
  AUTHOR_CONTAINS:     20,
  KEYWORD_EXACT:       15,
  PUBLISHER_CONTAINS:   8,
  KEYWORD_CONTAINS:     5,
} as const;

// ── 表記ゆれ辞書 ─────────────────────────────────────────────────
// key と values を双方向に展開して検索精度を上げる
const ALIAS_PAIRS: [string, string][] = [
  ["ハリポタ",                 "ハリー・ポッター"],
  ["プロジェクトヘイルメアリー", "プロジェクト・ヘイル・メアリー"],
  ["ドラゴンボール",           "dragon ball"],
  ["ワンピース",               "one piece"],
  ["鬼滅",                    "鬼滅の刃"],
  ["進撃",                    "進撃の巨人"],
  ["転スラ",                   "転生したらスライムだった件"],
  ["ふしぎの海のナディア",      "ナディア"],
];

// ── テキスト正規化 ────────────────────────────────────────────────

/** 全角英数字 → 半角 */
function toHalfWidth(text: string): string {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
  );
}

/** カタカナ → ひらがな */
function kataToHira(text: string): string {
  return text.replace(/[\u30a1-\u30f6]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

/**
 * 検索用テキスト正規化
 * - 大小文字統一・全角半角統一・カタカナ→ひらがな
 * - スペース・記号・中点を除去（スペース有無の差異吸収）
 */
export function normalizeForSearch(text: string): string {
  return kataToHira(
    toHalfWidth(text.toLowerCase()),
  ).replace(/[\s\u3000・、。！？「」『』【】（）【】\-\/\\]/g, "");
}

/** ISBNのハイフン・スペースを除去 */
function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[-\s]/g, "");
}

// ── クエリ展開（表記ゆれ）────────────────────────────────────────

function expandQuery(query: string): string[] {
  const normalized = normalizeForSearch(query);
  const variants = new Set<string>([normalized]);

  for (const [a, b] of ALIAS_PAIRS) {
    const aN = normalizeForSearch(a);
    const bN = normalizeForSearch(b);
    if (normalized === aN || normalized === bN) {
      variants.add(aN);
      variants.add(bN);
    }
  }

  return [...variants].filter(Boolean);
}

// ── エントリスコア計算 ────────────────────────────────────────────

function scoreEntry(
  entry: SearchEntry,
  queryVariants: string[],
  isbnQuery: string,
): number {
  let score = 0;

  // ISBN完全一致
  if (isbnQuery.length >= 10 && entry.isbn13) {
    if (normalizeIsbn(entry.isbn13) === isbnQuery) {
      score += SCORE_WEIGHTS.ISBN_EXACT;
    }
  }

  const titleN      = normalizeForSearch(entry.title);
  const authorsN    = entry.authors.map(normalizeForSearch);
  const keywordsN   = entry.keywords.map(normalizeForSearch);
  const publisherN  = entry.publisher ? normalizeForSearch(entry.publisher) : "";

  for (const q of queryVariants) {
    if (!q) continue;

    // タイトル（最高スコアを採用）
    if (titleN === q) {
      score = Math.max(score, SCORE_WEIGHTS.TITLE_EXACT);
    } else if (titleN.startsWith(q)) {
      score = Math.max(score, SCORE_WEIGHTS.TITLE_PREFIX);
    } else if (titleN.includes(q)) {
      score = Math.max(score, SCORE_WEIGHTS.TITLE_CONTAINS);
    }

    // 著者
    let authorMatched = false;
    for (const authorN of authorsN) {
      if (authorN === q) {
        score += SCORE_WEIGHTS.AUTHOR_EXACT;
        authorMatched = true;
        break;
      }
    }
    if (!authorMatched) {
      for (const authorN of authorsN) {
        if (authorN.includes(q)) {
          score += SCORE_WEIGHTS.AUTHOR_CONTAINS;
          break;
        }
      }
    }

    // キーワード
    let kwExact = false;
    let kwContains = false;
    for (const kw of keywordsN) {
      if (kw === q) { kwExact = true; break; }
      if (kw.includes(q)) kwContains = true;
    }
    if (kwExact) score += SCORE_WEIGHTS.KEYWORD_EXACT;
    else if (kwContains) score += SCORE_WEIGHTS.KEYWORD_CONTAINS;

    // 出版社
    if (publisherN && publisherN.includes(q)) {
      score += SCORE_WEIGHTS.PUBLISHER_CONTAINS;
    }
  }

  return score;
}

// ── 検索オプション ────────────────────────────────────────────────

export type SortOrder =
  | "score"
  | "newest"
  | "oldest"
  | "pageCount_asc"
  | "pageCount_desc"
  | "readingHours_asc"
  | "readingHours_desc";

export interface SearchOptions {
  l1Id?: string;
  yearFrom?: number;
  yearTo?: number;
  minPageCount?: number;
  maxPageCount?: number;
  minReadingHours?: number;
  maxReadingHours?: number;
  author?: string;
  publisher?: string;
  sortBy?: SortOrder;
  limit?: number;
}

export interface SearchResult {
  entry: SearchEntry;
  score: number;
}

// ── メイン検索関数 ────────────────────────────────────────────────

export function searchBooks(
  entries: SearchEntry[],
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const queryVariants = expandQuery(q);
  const isbnQuery = normalizeIsbn(q.replace(/[^\d]/g, ""));

  const authorFilter    = options.author    ? normalizeForSearch(options.author)    : "";
  const publisherFilter = options.publisher ? normalizeForSearch(options.publisher) : "";

  const results: SearchResult[] = [];

  for (const entry of entries) {
    // フィルタ
    if (options.l1Id && entry.l1Id !== options.l1Id) continue;

    if (authorFilter) {
      const match = entry.authors.some(a => normalizeForSearch(a).includes(authorFilter));
      if (!match) continue;
    }

    if (publisherFilter) {
      if (!normalizeForSearch(entry.publisher ?? "").includes(publisherFilter)) continue;
    }

    if (options.yearFrom || options.yearTo) {
      const year = entry.publishedDate ? parseInt(entry.publishedDate.slice(0, 4)) : 0;
      if (options.yearFrom && year < options.yearFrom) continue;
      if (options.yearTo   && year > options.yearTo)   continue;
    }

    if (options.minPageCount && (entry.pageCount ?? 0) < options.minPageCount) continue;
    if (options.maxPageCount && entry.pageCount && entry.pageCount > options.maxPageCount) continue;

    if (options.minReadingHours && (entry.estimatedReadingHours ?? 0) < options.minReadingHours) continue;
    if (options.maxReadingHours && entry.estimatedReadingHours && entry.estimatedReadingHours > options.maxReadingHours) continue;

    const score = scoreEntry(entry, queryVariants, isbnQuery);
    if (score > 0) results.push({ entry, score });
  }

  // ソート
  const sortBy = options.sortBy ?? "score";
  results.sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.score - a.score || a.entry.title.localeCompare(b.entry.title, "ja");
      case "newest":
        return (b.entry.publishedDate ?? "").localeCompare(a.entry.publishedDate ?? "");
      case "oldest":
        return (a.entry.publishedDate ?? "").localeCompare(b.entry.publishedDate ?? "");
      case "pageCount_asc":
        return (a.entry.pageCount ?? 9999) - (b.entry.pageCount ?? 9999);
      case "pageCount_desc":
        return (b.entry.pageCount ?? 0) - (a.entry.pageCount ?? 0);
      case "readingHours_asc":
        return (a.entry.estimatedReadingHours ?? 99) - (b.entry.estimatedReadingHours ?? 99);
      case "readingHours_desc":
        return (b.entry.estimatedReadingHours ?? 0) - (a.entry.estimatedReadingHours ?? 0);
    }
  });

  return results.slice(0, options.limit ?? 200);
}

// ── サジェスト ────────────────────────────────────────────────────

export interface Suggestion {
  type: "title" | "author" | "isbn" | "category";
  label: string;
  value: string;
}

export function getSuggestions(
  entries: SearchEntry[],
  query: string,
  categoryTree: { id: string; label: string }[],
  limit = 8,
): Suggestion[] {
  const q = query.trim();
  if (q.length < 1) return [];

  const qN = normalizeForSearch(q);
  const suggestions: Suggestion[] = [];
  const seen = new Set<string>();

  // ISBN候補
  const isbnOnly = q.replace(/[-\s]/g, "");
  if (/^\d{10,13}$/.test(isbnOnly)) {
    const found = entries.find(e => e.isbn13 && normalizeIsbn(e.isbn13) === isbnOnly);
    if (found) {
      suggestions.push({ type: "isbn", label: `${found.title}（ISBN）`, value: isbnOnly });
      seen.add("isbn:" + isbnOnly);
    }
  }

  // タイトル候補（前方一致優先）
  const titleMatches: { label: string; prefixed: boolean }[] = [];
  for (const entry of entries) {
    const titleN = normalizeForSearch(entry.title);
    if (!titleN.includes(qN)) continue;
    const key = "t:" + entry.title;
    if (seen.has(key)) continue;
    seen.add(key);
    titleMatches.push({ label: entry.title, prefixed: titleN.startsWith(qN) });
  }
  titleMatches.sort((a, b) => {
    if (a.prefixed !== b.prefixed) return a.prefixed ? -1 : 1;
    return a.label.localeCompare(b.label, "ja");
  });
  for (const m of titleMatches.slice(0, 4)) {
    suggestions.push({ type: "title", label: m.label, value: m.label });
    if (suggestions.length >= limit) return suggestions;
  }

  // 著者候補
  const authorSeen = new Set<string>();
  for (const entry of entries) {
    for (const author of entry.authors) {
      if (authorSeen.has(author)) continue;
      if (!normalizeForSearch(author).includes(qN)) continue;
      authorSeen.add(author);
      suggestions.push({ type: "author", label: `${author}（著者）`, value: author });
      if (suggestions.length >= limit) return suggestions;
    }
  }

  // カテゴリ候補
  for (const cat of categoryTree) {
    if (!normalizeForSearch(cat.label).includes(qN)) continue;
    suggestions.push({ type: "category", label: `${cat.label}（カテゴリ）`, value: cat.label });
    if (suggestions.length >= limit) return suggestions;
  }

  return suggestions;
}

// ── インデックスローダー（モジュールレベルキャッシュ）─────────────

let _cache: SearchEntry[] | null = null;
let _loading: Promise<SearchEntry[]> | null = null;

export async function loadSearchIndex(): Promise<SearchEntry[]> {
  if (_cache) return _cache;
  if (!_loading) {
    _loading = fetch("/data/search-index.json")
      .then(r => {
        if (!r.ok) throw new Error(`search-index fetch failed: ${r.status}`);
        return r.json() as Promise<SearchEntry[]>;
      })
      .then(data => {
        _cache = data;
        return data;
      })
      .catch(err => {
        _loading = null;
        throw err;
      });
  }
  return _loading;
}
