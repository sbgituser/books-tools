#!/usr/bin/env tsx
/**
 * enrich-blog-stubs.ts
 *
 * books.index.json 内の "gb-blog-" プレフィックス付きスタブエントリを
 * Google Books API で補完するスクリプト。
 *
 * 処理フロー:
 *   1. 既存スタブを収集（gb-blog- prefix のもの）
 *   2. sourceIds.googleBooksId があるもの → 直接ボリュームIDで取得
 *   3. ないもの → タイトル+著者で検索
 *   4. 取得できたデータで entries を上書き（id はそのまま保持）
 *   5. ブログ記事の h3 見出しで未登録の本を検出・追加
 *   6. books.index.json を更新
 *
 * 使い方:
 *   npx tsx scripts/enrich-blog-stubs.ts [--dry-run] [--force]
 *
 *   --dry-run  ファイルを書き換えずにプレビュー
 *   --force    publisher等が既にある stubs も再取得
 */

import fs from "node:fs";
import path from "node:path";

// ── 型 ────────────────────────────────────────────────────────────

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
    amazonAsin?: string;
  };
  relatedBookIds?: string[];
  updatedAt: string;
};

type GBVolumeInfo = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  language?: string;
  pageCount?: number;
  categories?: string[];
  industryIdentifiers?: { type: string; identifier: string }[];
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
};

type GBItem = { id: string; volumeInfo: GBVolumeInfo };

// ── 定数 ──────────────────────────────────────────────────────────

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content", "blog");
const BOOK_INDEX_PATH = path.join(ROOT, "src", "data", "books.index.json");
const DELAY_MS = 300;

// ── ユーティリティ ────────────────────────────────────────────────

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function estimateReadingHours(pageCount: number, language = "ja"): number {
  const pagesPerHour = language === "ja" ? 40 : 50;
  return Math.round((pageCount / pagesPerHour) * 10) / 10;
}

function buildSearchableText(book: Partial<BookIndex>): string {
  return [
    book.title,
    book.subtitle,
    ...(book.authors ?? []),
    book.publisher,
    ...(book.categories ?? []),
    ...(book.subjects ?? []),
    ...(book.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Google Books API ───────────────────────────────────────────────

async function fetchByVolumeId(volumeId: string, apiKey: string | null): Promise<GBItem | null> {
  const keyParam = apiKey ? `?key=${apiKey}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(volumeId)}${keyParam}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const item = (await res.json()) as GBItem;
    return item;
  } catch {
    return null;
  }
}

async function searchGoogleBooks(query: string, apiKey: string | null): Promise<GBItem[]> {
  const keyParam = apiKey ? `&key=${apiKey}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5${keyParam}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: GBItem[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

function chooseBestCandidate(
  candidates: GBItem[],
  targetTitle: string,
  targetAuthors: string[],
): GBItem | null {
  if (!candidates.length) return null;
  const targetTitleN = normalizeText(targetTitle);
  const targetAuthorTokens = targetAuthors.flatMap((a) =>
    a.split(/[・／/,，]/).map(normalizeText).filter(Boolean),
  );

  let best: { item: GBItem; score: number } | null = null;
  for (const item of candidates) {
    const info = item.volumeInfo ?? {};
    const titleN = normalizeText(info.title ?? "");
    const authorNList = (info.authors ?? []).map(normalizeText);
    let score = 0;

    if (titleN === targetTitleN) score += 100;
    else if (titleN.includes(targetTitleN) || targetTitleN.includes(titleN)) score += 60;

    if (targetAuthorTokens.length > 0) {
      const matched = targetAuthorTokens.filter((token) =>
        authorNList.some((a) => a.includes(token) || token.includes(a)),
      ).length;
      score += matched * 30;
    }

    if (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail) score += 5;
    if (info.pageCount) score += 3;
    if (info.publisher) score += 2;

    if (!best || score > best.score) best = { item, score };
  }

  if (!best) return null;
  if (best.score >= 60) return best.item;
  return null;
}

// ── スタブ エンリッチ ──────────────────────────────────────────────

function applyVolumeData(stub: BookIndex, item: GBItem, now: string): BookIndex {
  const info = item.volumeInfo ?? {};
  const isbn13 = info.industryIdentifiers?.find((x) => x.type === "ISBN_13")?.identifier;
  const isbn10 = info.industryIdentifiers?.find((x) => x.type === "ISBN_10")?.identifier;
  const thumbnailUrl =
    info.imageLinks?.thumbnail?.replace(/^http:/, "https:") ??
    info.imageLinks?.smallThumbnail?.replace(/^http:/, "https:") ??
    stub.thumbnailUrl;

  const updated: BookIndex = {
    ...stub,
    updatedAt: now,
  };

  if (info.title) updated.title = info.title;
  if (info.subtitle) updated.subtitle = info.subtitle;
  if (info.authors?.length) updated.authors = info.authors.slice(0, 5);
  if (info.publisher) updated.publisher = info.publisher;
  if (info.publishedDate) updated.publishedDate = info.publishedDate;
  if (isbn10) updated.isbn10 = isbn10;
  if (isbn13) updated.isbn13 = isbn13;
  if (info.language) updated.language = info.language;
  if (info.pageCount) {
    updated.pageCount = info.pageCount;
    updated.estimatedReadingHours = estimateReadingHours(info.pageCount, info.language ?? "ja");
  }
  if (thumbnailUrl) updated.thumbnailUrl = thumbnailUrl;
  updated.sourceIds = { ...(stub.sourceIds ?? {}), googleBooksId: item.id };
  updated.searchableText = buildSearchableText(updated);

  return updated;
}

// ── 未登録見出し検出 ───────────────────────────────────────────────

function extractHeadingParts(headingText: string): { title: string; author: string | null } {
  const cleaned = headingText
    .replace(/\s+#+\s*$/, "")
    .replace(/^\s*(?:第\s*)?\d+\s*位\s*/u, "")
    .replace(/^\s*\d+\s*[\.．]\s*/u, "")
    .trim();

  const fullWidth = cleaned.match(/^(.*?)[（(]([^）)]+)[）)]\s*$/u);
  if (fullWidth) {
    return { title: fullWidth[1].trim(), author: fullWidth[2].trim() };
  }
  return { title: cleaned, author: null };
}

function looksLikeBookHeading(headingText: string): boolean {
  // N位 prefix → ranking heading = likely book
  if (/^\s*(?:第\s*)?\d+\s*位/.test(headingText)) return true;
  // Has (author) in parens → likely book
  if (/[（(][^）)\d]{2,}[）)]/.test(headingText)) return true;
  return false;
}

function getDefaultCategory(file: string): string {
  if (file.toLowerCase().includes("manga")) return "漫画";
  if (file.includes("invest") || file.includes("money")) return "投資・お金";
  return "小説・文学";
}

type MissingEntry = {
  title: string;
  author: string | null;
  file: string;
};

function findMissingHeadings(books: BookIndex[]): MissingEntry[] {
  const byNormTitle = new Map<string, BookIndex[]>();
  for (const b of books) {
    const k = normalizeText(b.title ?? "");
    if (!k) continue;
    const list = byNormTitle.get(k) ?? [];
    list.push(b);
    byNormTitle.set(k, list);
  }

  const missing: MissingEntry[] = [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  for (const file of files) {
    const lines = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8").split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^###\s+(.+)$/);
      if (!m) continue;
      if (!looksLikeBookHeading(m[1])) continue;
      const { title, author } = extractHeadingParts(m[1]);
      if (!title || title.length < 2) continue;
      const k = normalizeText(title);

      // Check exact match
      const matches = byNormTitle.get(k) ?? [];
      if (matches.length > 0) continue;

      // Check partial match (same as fallbackFindBySimilarTitle)
      const hasPartial = [...byNormTitle.entries()].some(([bk]) => {
        return (bk.includes(k) || k.includes(bk)) && bk.length >= 2 && k.length >= 2;
      });
      if (hasPartial) continue;

      missing.push({ title, author, file });
    }
  }

  // Deduplicate by title+author
  const uniq = new Map<string, MissingEntry>();
  for (const m of missing) {
    const key = `${normalizeText(m.title)}|${normalizeText(m.author ?? "")}`;
    if (!uniq.has(key)) uniq.set(key, m);
  }
  return [...uniq.values()];
}

// ── メイン ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY ?? null;

  const books: BookIndex[] = JSON.parse(fs.readFileSync(BOOK_INDEX_PATH, "utf-8"));
  const bookMap = new Map<string, BookIndex>(books.map((b) => [b.id, b]));

  // ── Phase 1: スタブのエンリッチ ─────────────────────────────────
  const stubs = books.filter((b) => b.id.startsWith("gb-blog-"));
  console.log(`\n[Phase 1] Stubs to enrich: ${stubs.length}`);

  let enriched = 0;
  let skipped = 0;
  let failed = 0;
  const now = new Date().toISOString();

  for (const stub of stubs) {
    // force=false の場合、すでに publisher + isbn13 + pageCount がある場合はスキップ
    if (!force && stub.publisher && stub.isbn13 && stub.pageCount) {
      skipped++;
      continue;
    }

    let item: GBItem | null = null;

    // A) 既存 googleBooksId で直接取得
    const gbId = stub.sourceIds?.googleBooksId;
    if (gbId) {
      item = await fetchByVolumeId(gbId, apiKey);
      await sleep(DELAY_MS);
    }

    // B) タイトル+著者で検索
    if (!item) {
      const queries = [
        stub.authors[0]
          ? `intitle:${stub.title} inauthor:${stub.authors[0]}`
          : `intitle:${stub.title}`,
        `${stub.title}${stub.authors[0] ? " " + stub.authors[0] : ""}`,
      ];
      for (const q of queries) {
        const candidates = await searchGoogleBooks(q, apiKey);
        await sleep(DELAY_MS);
        item = chooseBestCandidate(candidates, stub.title, stub.authors);
        if (item) break;
      }
    }

    if (!item) {
      console.log(`  ✗ [no match] ${stub.title}`);
      failed++;
      continue;
    }

    const updated = applyVolumeData(stub, item, now);
    const gained = [
      !stub.publisher && updated.publisher ? "publisher" : null,
      !stub.isbn13 && updated.isbn13 ? "isbn13" : null,
      !stub.pageCount && updated.pageCount ? "pageCount" : null,
      !stub.thumbnailUrl && updated.thumbnailUrl ? "thumb" : null,
    ].filter(Boolean);

    console.log(`  ✓ ${stub.title} [${gained.join(", ") || "re-fetched"}]`);
    bookMap.set(stub.id, updated);
    enriched++;
  }

  console.log(`\n  enriched: ${enriched}, skipped: ${skipped}, failed: ${failed}`);

  // ── Phase 2: 未登録見出しの追加 ──────────────────────────────────
  const currentBooks = [...bookMap.values()];
  const missing = findMissingHeadings(currentBooks);
  console.log(`\n[Phase 2] Unregistered book headings: ${missing.length}`);

  let added = 0;

  for (const m of missing) {
    const queries = [
      m.author
        ? `intitle:${m.title} inauthor:${m.author}`
        : `intitle:${m.title}`,
      `${m.title}${m.author ? " " + m.author : ""}`,
    ];

    let item: GBItem | null = null;
    for (const q of queries) {
      const candidates = await searchGoogleBooks(q, apiKey);
      await sleep(DELAY_MS);
      item = chooseBestCandidate(candidates, m.title, m.author ? [m.author] : []);
      if (item) break;
    }

    const info = item?.volumeInfo;
    const isbn13 = info?.industryIdentifiers?.find((x) => x.type === "ISBN_13")?.identifier;
    const isbn10 = info?.industryIdentifiers?.find((x) => x.type === "ISBN_10")?.identifier;
    const stubId = `gb-blog-${normalizeText(m.title).slice(0, 20)}`;

    // ID衝突チェック
    if (bookMap.has(stubId)) {
      console.log(`  ~ [id-conflict] ${m.title} => ${stubId}`);
      continue;
    }

    const defaultCategory = getDefaultCategory(m.file);
    const authors = info?.authors?.length
      ? info.authors.slice(0, 5)
      : m.author ? [m.author] : ["著者不明"];

    const thumbnailUrl =
      info?.imageLinks?.thumbnail?.replace(/^http:/, "https:") ??
      info?.imageLinks?.smallThumbnail?.replace(/^http:/, "https:") ??
      undefined;

    const newBook: BookIndex = {
      id: stubId,
      title: info?.title ?? m.title,
      authors,
      categories: [defaultCategory],
      keywords: [defaultCategory, "ブログ掲載書籍"],
      searchableText: "",
      updatedAt: now,
      language: info?.language ?? "ja",
    };

    if (info?.subtitle) newBook.subtitle = info.subtitle;
    if (info?.publisher) newBook.publisher = info.publisher;
    if (info?.publishedDate) newBook.publishedDate = info.publishedDate;
    if (isbn10) newBook.isbn10 = isbn10;
    if (isbn13) newBook.isbn13 = isbn13;
    if (info?.pageCount) {
      newBook.pageCount = info.pageCount;
      newBook.estimatedReadingHours = estimateReadingHours(info.pageCount, info.language ?? "ja");
    }
    if (thumbnailUrl) newBook.thumbnailUrl = thumbnailUrl;
    if (item?.id) newBook.sourceIds = { googleBooksId: item.id };
    newBook.searchableText = buildSearchableText(newBook);

    console.log(`  + ${m.title} => ${newBook.title} (${stubId})${thumbnailUrl ? " [thumb]" : " [no-thumb]"}`);
    bookMap.set(stubId, newBook);
    added++;
  }

  console.log(`\n  added: ${added}`);

  // ── 書き込み ─────────────────────────────────────────────────────
  if (dryRun) {
    console.log("\n[dry-run] No files written.");
    return;
  }

  if (enriched + added === 0) {
    console.log("\nNo changes. books.index.json not updated.");
    return;
  }

  // 元の順序を維持して更新（新規追加は先頭に）
  const idOrder = new Map(books.map((b, i) => [b.id, i]));
  const merged = [...bookMap.values()].sort((a, b) => {
    const ai = idOrder.get(a.id) ?? -1;
    const bi = idOrder.get(b.id) ?? -1;
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return -1;
    if (bi === -1) return 1;
    return ai - bi;
  });

  fs.writeFileSync(BOOK_INDEX_PATH, JSON.stringify(merged, null, 2) + "\n", "utf-8");
  console.log(`\n✓ books.index.json updated (${merged.length} entries, +${added} new, ~${enriched} enriched)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
