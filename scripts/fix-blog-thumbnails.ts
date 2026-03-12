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

type HeadingTarget = {
  file: string;
  line: number;
  raw: string;
  title: string;
  author: string | null;
  category: string;
};

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

function splitAuthors(author: string | null): string[] {
  if (!author) return [];
  return author
    .split(/[・／/,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
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

function getDefaultCategory(file: string): string {
  if (file.includes("manga")) return "漫画";
  if (file.includes("invest")) return "投資・お金";
  if (file.includes("business")) return "ビジネス";
  return "小説・文学";
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

function hasImageCandidate(book: BookIndex): boolean {
  return Boolean(book.thumbnailUrl || book.isbn13 || book.sourceIds?.googleBooksId);
}

function collectHeadingTargets(): HeadingTarget[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const out: HeadingTarget[] = [];
  for (const file of files) {
    const txt = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const lines = txt.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^#{3,4}\s+(.+)$/);
      if (!m) continue;
      const raw = m[1].trim();
      if (!/[（(].+[）)]/.test(raw)) continue;
      const { title, author } = extractHeadingParts(raw);
      if (!title) continue;
      out.push({
        file,
        line: i + 1,
        raw,
        title,
        author,
        category: getDefaultCategory(file),
      });
    }
  }
  return out;
}

function buildTitleMap(books: BookIndex[]): Map<string, BookIndex[]> {
  const map = new Map<string, BookIndex[]>();
  for (const b of books) {
    const key = normalizeText(b.title ?? "");
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(b);
    map.set(key, list);
  }
  return map;
}

function chooseMatch(titleMap: Map<string, BookIndex[]>, title: string, author: string | null): BookIndex | null {
  const titleKey = normalizeText(title);
  const matches = titleMap.get(titleKey) ?? [];
  if (!matches.length) return null;
  if (!author) return matches[0] ?? null;

  const authorKey = normalizeText(author);
  const found = matches.find((book) =>
    (book.authors ?? []).some((name) => {
      const n = normalizeText(name);
      return n.includes(authorKey) || authorKey.includes(n);
    }),
  );
  return found ?? matches[0] ?? null;
}

async function fetchGoogleBooksCandidates(query: string, apiKey: string | null): Promise<GBItem[]> {
  const keyParam = apiKey ? `&key=${apiKey}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10${keyParam}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
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
    const authorNList = (info.authors ?? []).map((a) => normalizeText(a)).filter(Boolean);
    let score = 0;

    if (titleN === targetTitleN) score += 100;
    else if (titleN.includes(targetTitleN) || targetTitleN.includes(titleN)) score += 70;

    if (targetAuthorN) {
      if (authorNList.some((a) => a.includes(targetAuthorN) || targetAuthorN.includes(a))) score += 50;
    }

    if (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail) score += 10;
    if (info.industryIdentifiers?.some((x) => x.type === "ISBN_13")) score += 5;

    if (!best || score > best.score) best = { item, score };
  }

  if (!best) return null;
  return best.score >= 70 ? best.item : null;
}

function normalizeThumbnail(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:/, "https:");
}

async function main() {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY ?? null;
  const books = JSON.parse(fs.readFileSync(BOOK_INDEX_PATH, "utf-8")) as BookIndex[];
  const titleMap = buildTitleMap(books);
  const targets = collectHeadingTargets();

  const uniqueTargetMap = new Map<string, HeadingTarget>();
  for (const t of targets) {
    const key = `${normalizeText(t.title)}|${normalizeText(t.author ?? "")}`;
    if (!uniqueTargetMap.has(key)) uniqueTargetMap.set(key, t);
  }
  const uniqueTargets = [...uniqueTargetMap.values()];

  let unmatched = 0;
  let noImage = 0;
  const needFix: { target: HeadingTarget; existing: BookIndex | null }[] = [];

  for (const t of uniqueTargets) {
    const matched = chooseMatch(titleMap, t.title, t.author);
    if (!matched) {
      unmatched += 1;
      needFix.push({ target: t, existing: null });
      continue;
    }
    if (!hasImageCandidate(matched)) {
      noImage += 1;
      needFix.push({ target: t, existing: matched });
    }
  }

  console.log(`targets=${uniqueTargets.length}`);
  console.log(`unmatched=${unmatched}`);
  console.log(`noImageCandidate=${noImage}`);
  console.log(`needFix=${needFix.length}`);

  if (!needFix.length) return;

  const now = new Date().toISOString();
  const existingIdSet = new Set(books.map((b) => b.id));
  let added = 0;
  let updated = 0;
  let unresolved = 0;

  for (const item of needFix) {
    const { target, existing } = item;
    const queries = [
      target.author ? `${target.title} ${target.author}` : target.title,
      target.author ? `intitle:${target.title} inauthor:${target.author}` : `intitle:${target.title}`,
      target.title,
    ];

    let selected: GBItem | null = null;
    for (const q of queries) {
      const candidates = await fetchGoogleBooksCandidates(q, apiKey);
      selected = chooseBestCandidate(candidates, target.title, target.author);
      if (selected) break;
    }

    if (!selected) {
      unresolved += 1;
      console.log(`UNRESOLVED: ${target.title} (${target.author ?? ""})`);
      continue;
    }

    const info = selected.volumeInfo ?? {};
    const isbn13 = info.industryIdentifiers?.find((x) => x.type === "ISBN_13")?.identifier;
    const isbn10 = info.industryIdentifiers?.find((x) => x.type === "ISBN_10")?.identifier;
    const thumbnail =
      normalizeThumbnail(info.imageLinks?.thumbnail) ?? normalizeThumbnail(info.imageLinks?.smallThumbnail);
    const safeAuthors = (info.authors?.length ? info.authors : splitAuthors(target.author)).slice(0, 5);

    if (existing) {
      if (!existing.thumbnailUrl && thumbnail) existing.thumbnailUrl = thumbnail;
      if (!existing.isbn13 && isbn13) existing.isbn13 = isbn13;
      if (!existing.isbn10 && isbn10) existing.isbn10 = isbn10;
      if (!existing.sourceIds?.googleBooksId && selected.id) {
        existing.sourceIds = { ...(existing.sourceIds ?? {}), googleBooksId: selected.id };
      }
      if ((!existing.authors || existing.authors.length === 0) && safeAuthors.length > 0) {
        existing.authors = safeAuthors;
      }
      if (!existing.publishedDate && info.publishedDate) existing.publishedDate = info.publishedDate;
      if (!existing.publisher && info.publisher) existing.publisher = info.publisher;
      if (!existing.language && info.language) existing.language = info.language;
      if (!existing.pageCount && info.pageCount) {
        existing.pageCount = info.pageCount;
        existing.estimatedReadingHours = estimateReadingHours(info.pageCount, info.language ?? "ja");
      }
      existing.updatedAt = now;
      existing.searchableText = buildSearchableText(existing);
      updated += 1;
      console.log(`UPDATED: ${existing.title} (${existing.id})`);
      continue;
    }

    const baseId = isbn13 ?? `gb-blog-${normalizeText(target.title).slice(0, 24)}`;
    let id = baseId;
    let i = 1;
    while (existingIdSet.has(id)) {
      id = `${baseId}-${i++}`;
    }
    existingIdSet.add(id);

    const newBook: BookIndex = {
      id,
      title: info.title ?? target.title,
      subtitle: info.subtitle,
      authors: safeAuthors.length ? safeAuthors : ["著者不明"],
      publisher: info.publisher,
      publishedDate: info.publishedDate,
      isbn10,
      isbn13,
      language: info.language ?? "ja",
      categories: [target.category],
      keywords: [target.category, "ブログ掲載書籍"],
      pageCount: info.pageCount,
      estimatedReadingHours: info.pageCount ? estimateReadingHours(info.pageCount, info.language ?? "ja") : undefined,
      thumbnailUrl: thumbnail,
      searchableText: "",
      sourceIds: selected.id ? { googleBooksId: selected.id } : undefined,
      updatedAt: now,
    };
    newBook.searchableText = buildSearchableText(newBook);
    books.unshift(newBook);
    added += 1;
    console.log(`ADDED: ${newBook.title} (${newBook.id})`);
  }

  fs.writeFileSync(BOOK_INDEX_PATH, JSON.stringify(books, null, 2) + "\n", "utf-8");
  console.log(`done: added=${added}, updated=${updated}, unresolved=${unresolved}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

