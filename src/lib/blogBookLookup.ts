import fs from "node:fs";
import path from "node:path";

type IndexedBook = {
  id: string;
  title: string;
  authors?: string[];
  thumbnailUrl?: string;
};

type BookLookupCache = {
  byNormalizedTitle: Map<string, IndexedBook[]>;
};

const BOOK_INDEX_PATH = path.join(process.cwd(), "src", "data", "books.index.json");

let cache: BookLookupCache | null = null;

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function extractHeadingParts(headingText: string): { title: string; author: string | null } {
  const cleaned = headingText
    .replace(/\s+#+\s*$/, "")
    .replace(/^\s*\d+\s*位\s*/u, "")
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
  if (cache) return cache;

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

  cache = { byNormalizedTitle };
  return cache;
}

export function findBookByHeadingText(headingText: string): IndexedBook | null {
  const { byNormalizedTitle } = getCache();
  const { title, author } = extractHeadingParts(headingText);
  if (!title) return null;

  const titleKey = normalizeText(title);
  if (!titleKey) return null;

  const matches = byNormalizedTitle.get(titleKey) ?? [];
  if (matches.length === 0) return null;

  if (!author) return matches[0] ?? null;

  const authorKey = normalizeText(author);
  const authorMatched = matches.find((book) =>
    (book.authors ?? []).some((name) => normalizeText(name).includes(authorKey) || authorKey.includes(normalizeText(name)))
  );

  return authorMatched ?? matches[0] ?? null;
}

