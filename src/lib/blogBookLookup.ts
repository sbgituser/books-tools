import fs from "node:fs";
import path from "node:path";

type IndexedBook = {
  id: string;
  title: string;
  authors?: string[];
  thumbnailUrl?: string;
  isbn13?: string;
  sourceIds?: {
    googleBooksId?: string;
  };
};

type BookLookupCache = {
  byNormalizedTitle: Map<string, IndexedBook[]>;
  allBooks: IndexedBook[];
};

const BOOK_INDEX_PATH = path.join(process.cwd(), "src", "data", "books.index.json");

let cache: BookLookupCache | null = null;
let cacheMtimeMs = -1;

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function normalizeAuthorToken(value: string): string {
  const n = normalizeText(value);
  if (n === "原作") return "";
  return n;
}

function splitAuthorTokens(author: string): string[] {
  return author
    .split(/[・／/,，&＆]/)
    .map((v) => normalizeAuthorToken(v))
    .filter(Boolean);
}

function extractHeadingParts(headingText: string): { title: string; author: string | null } {
  const cleaned = headingText
    .replace(/\s+#+\s*$/, "")
    .replace(/^\s*(?:第\s*)?\d+\s*位\s*/u, "")
    .replace(/^\s*\d+\s*[\.．]\s*/u, "")
    .trim();

  const fullWidth = cleaned.match(/^(.*?)[（(]([^）)]+)[）)]\s*$/u);
  if (fullWidth) {
    return {
      title: fullWidth[1].trim(),
      author: fullWidth[2].trim(),
    };
  }

  return { title: cleaned, author: null };
}

function getCache(): BookLookupCache {
  const stat = fs.statSync(BOOK_INDEX_PATH);
  if (cache && cacheMtimeMs === stat.mtimeMs) return cache;

  const raw = fs.readFileSync(BOOK_INDEX_PATH, "utf-8");
  const books = JSON.parse(raw) as IndexedBook[];

  const byNormalizedTitle = new Map<string, IndexedBook[]>();
  for (const book of books) {
    const key = normalizeText(book.title ?? "");
    if (!key) continue;
    const list = byNormalizedTitle.get(key) ?? [];
    list.push(book);
    byNormalizedTitle.set(key, list);
  }

  cache = { byNormalizedTitle, allBooks: books };
  cacheMtimeMs = stat.mtimeMs;
  return cache;
}

function hasImageCandidate(book: IndexedBook): boolean {
  return Boolean(book.thumbnailUrl || book.isbn13 || book.sourceIds?.googleBooksId);
}

function fallbackFindBySimilarTitle(
  allBooks: IndexedBook[],
  title: string,
  author: string | null,
): IndexedBook | null {
  const titleKey = normalizeText(title);
  if (!titleKey) return null;

  const authorTokens = author ? splitAuthorTokens(author) : [];

  let best: { book: IndexedBook; score: number } | null = null;

  for (const book of allBooks) {
    const bTitleKey = normalizeText(book.title ?? "");
    if (!bTitleKey) continue;

    let score = 0;
    if (bTitleKey === titleKey) score += 100;
    else if (bTitleKey.includes(titleKey) || titleKey.includes(bTitleKey)) score += 70;
    else continue;

    if (authorTokens.length > 0) {
      const bookAuthorTokens = (book.authors ?? []).flatMap(splitAuthorTokens);
      const matchedCount = authorTokens.filter((token) =>
        bookAuthorTokens.some((a) => a.includes(token) || token.includes(a)),
      ).length;
      score += matchedCount * 20;
      if (matchedCount === 0) score -= 10;
    }

    if (hasImageCandidate(book)) score += 5;

    if (!best || score > best.score) best = { book, score };
  }

  return best?.book ?? null;
}

export function findBookByHeadingText(headingText: string): IndexedBook | null {
  const { byNormalizedTitle, allBooks } = getCache();
  const { title, author } = extractHeadingParts(headingText);
  if (!title) return null;

  const titleKey = normalizeText(title);
  if (!titleKey) return null;

  const matches = byNormalizedTitle.get(titleKey) ?? [];
  if (matches.length === 0) {
    return fallbackFindBySimilarTitle(allBooks, title, author);
  }

  if (!author) return matches[0] ?? null;

  const authorTokens = splitAuthorTokens(author);
  const authorMatched = matches.find((book) => {
    const bookAuthorTokens = (book.authors ?? []).flatMap(splitAuthorTokens);
    if (!authorTokens.length || !bookAuthorTokens.length) return false;
    return authorTokens.every((token) =>
      bookAuthorTokens.some((a) => a.includes(token) || token.includes(a)),
    );
  });

  return authorMatched ?? matches[0] ?? fallbackFindBySimilarTitle(allBooks, title, author);
}

export function resolveBlogBookThumbnail(book: IndexedBook): string | null {
  const candidates = [
    book.isbn13
      ? `https://books.google.com/books/content?vid=ISBN${book.isbn13}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : undefined,
    book.sourceIds?.googleBooksId
      ? `https://books.google.com/books/content?id=${book.sourceIds.googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : undefined,
    book.thumbnailUrl,
    book.isbn13
      ? `https://covers.openlibrary.org/b/isbn/${book.isbn13}-M.jpg?default=false`
      : undefined,
  ].filter((v): v is string => Boolean(v));

  return candidates[0] ?? null;
}

