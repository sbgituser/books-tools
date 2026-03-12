#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

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

type MissingHeading = {
  file: string;
  line: number;
  title: string;
  author: string | null;
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

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content", "blog");
const BOOK_INDEX_PATH = path.join(ROOT, "src", "data", "books.index.json");

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

function getDefaultCategory(file: string): string {
  if (file.includes("manga")) return "漫画";
  if (file.includes("invest")) return "投資・お金";
  return "小説・文学";
}

function splitAuthors(author: string | null): string[] {
  if (!author) return [];
  return author
    .split(/[・／/,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
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

async function fetchGoogleBooksCandidates(query: string, apiKey: string | null): Promise<GBItem[]> {
  const keyParam = apiKey ? `&key=${apiKey}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5${keyParam}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: GBItem[] };
  return data.items ?? [];
}

function chooseBestCandidate(candidates: GBItem[], targetTitle: string, targetAuthor: string | null): GBItem | null {
  if (!candidates.length) return null;
  const targetTitleN = normalizeText(targetTitle);
  const targetAuthorN = normalizeText(targetAuthor ?? "");

  let best: { item: GBItem; score: number } | null = null;
  for (const item of candidates) {
    const info = item.volumeInfo ?? {};
    const titleN = normalizeText(info.title ?? "");
    const authors = info.authors ?? [];
    const authorNList = authors.map((a) => normalizeText(a)).filter(Boolean);
    let score = 0;

    if (titleN === targetTitleN) score += 100;
    else if (titleN.includes(targetTitleN) || targetTitleN.includes(titleN)) score += 60;

    if (targetAuthorN) {
      if (authorNList.some((a) => a.includes(targetAuthorN) || targetAuthorN.includes(a))) score += 40;
    }

    if (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail) score += 5;

    if (!best || score > best.score) best = { item, score };
  }

  if (!best) return null;
  if (best.score >= 60) return best.item;
  return null;
}

function findMissingHeadings(indexBooks: BookIndex[]): MissingHeading[] {
  const byNormalizedTitle = new Map<string, BookIndex[]>();
  for (const book of indexBooks) {
    const key = normalizeText(book.title ?? "");
    if (!key) continue;
    const list = byNormalizedTitle.get(key) ?? [];
    list.push(book);
    byNormalizedTitle.set(key, list);
  }

  const missing: MissingHeading[] = [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const lines = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8").split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^###\s+(\d+\s*位\s+.+)$/);
      if (!m) continue;
      const { title, author } = extractHeadingParts(m[1]);
      const titleKey = normalizeText(title);
      const matches = byNormalizedTitle.get(titleKey) ?? [];
      if (!matches.length) {
        missing.push({ file, line: i + 1, title, author });
        continue;
      }
      if (!author) continue;
      const authorKey = normalizeText(author);
      const authorMatched = matches.some((book) =>
        (book.authors ?? []).some((name) => {
          const n = normalizeText(name);
          return n.includes(authorKey) || authorKey.includes(n);
        }),
      );
      if (!authorMatched) {
        missing.push({ file, line: i + 1, title, author });
      }
    }
  }

  const uniq = new Map<string, MissingHeading>();
  for (const m of missing) {
    const key = `${m.title}|${m.author ?? ""}`;
    if (!uniq.has(key)) uniq.set(key, m);
  }
  return [...uniq.values()];
}

async function main() {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY ?? null;
  const books = JSON.parse(fs.readFileSync(BOOK_INDEX_PATH, "utf-8")) as BookIndex[];
  const missing = findMissingHeadings(books);

  console.log(`missing headings: ${missing.length}`);
  if (missing.length === 0) return;

  const now = new Date().toISOString();
  const newBooks: BookIndex[] = [];

  for (const m of missing) {
    const queries = [
      m.author ? `${m.title} ${m.author}` : m.title,
      m.author ? `intitle:${m.title} inauthor:${m.author}` : `intitle:${m.title}`,
    ];

    let selected: GBItem | null = null;
    for (const q of queries) {
      const candidates = await fetchGoogleBooksCandidates(q, apiKey);
      selected = chooseBestCandidate(candidates, m.title, m.author);
      if (selected) break;
    }

    const info = selected?.volumeInfo;
    const isbn13 = info?.industryIdentifiers?.find((x) => x.type === "ISBN_13")?.identifier;
    const isbn10 = info?.industryIdentifiers?.find((x) => x.type === "ISBN_10")?.identifier;
    const id = isbn13 ?? `gb-${selected?.id ?? `blog-${normalizeText(m.title).slice(0, 16)}`}`;

    // 既存IDとの衝突回避
    if (books.some((b) => b.id === id) || newBooks.some((b) => b.id === id)) {
      continue;
    }

    const defaultCategory = getDefaultCategory(m.file);
    const authors = (info?.authors?.length ? info.authors : splitAuthors(m.author)).slice(0, 5);
    const safeAuthors = authors.length ? authors : ["著者不明"];
    const categories = [defaultCategory];
    const keywords = [defaultCategory, "ブログ掲載書籍"];
    const language = info?.language ?? "ja";
    const pageCount = info?.pageCount;
    const thumbnailUrl =
      info?.imageLinks?.thumbnail?.replace(/^http:/, "https:") ??
      info?.imageLinks?.smallThumbnail?.replace(/^http:/, "https:") ??
      undefined;

    const book: BookIndex = {
      id,
      title: info?.title ?? m.title,
      authors: safeAuthors,
      categories,
      keywords,
      searchableText: "",
      updatedAt: now,
    };

    if (info?.subtitle) book.subtitle = info.subtitle;
    if (info?.publisher) book.publisher = info.publisher;
    if (info?.publishedDate) book.publishedDate = info.publishedDate;
    if (isbn10) book.isbn10 = isbn10;
    if (isbn13) book.isbn13 = isbn13;
    if (language) book.language = language;
    if (pageCount) {
      book.pageCount = pageCount;
      book.estimatedReadingHours = estimateReadingHours(pageCount, language);
    }
    if (thumbnailUrl) book.thumbnailUrl = thumbnailUrl;
    if (selected?.id) book.sourceIds = { googleBooksId: selected.id };

    book.searchableText = buildSearchableText(book);
    newBooks.push(book);

    console.log(`+ ${m.title} => ${book.title} (${book.id})${thumbnailUrl ? " [thumb]" : " [no-thumb]"}`);
  }

  if (!newBooks.length) {
    console.log("no new books to add");
    return;
  }

  const merged = [...newBooks, ...books];
  fs.writeFileSync(BOOK_INDEX_PATH, JSON.stringify(merged, null, 2) + "\n", "utf-8");
  console.log(`added: ${newBooks.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

