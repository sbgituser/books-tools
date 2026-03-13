#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
    amazonAsin?: string;
  };
  relatedBookIds?: string[];
  updatedAt: string;
};

type GBVolumeInfo = {
  title?: string;
  authors?: string[];
  industryIdentifiers?: { type: string; identifier: string }[];
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
};

type GBItem = { id: string; volumeInfo?: GBVolumeInfo };

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, "src", "data", "books.index.json");
const REPORT_PATH = path.join(ROOT, "reports", "missing-image-sources-unresolved.tsv");

function loadGoogleApiKey(): string | null {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^(\w+)\s*=\s*(.+)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  }
  const key = process.env.GOOGLE_BOOKS_API_KEY ?? null;
  if (!key || key.startsWith("your_")) return null;
  return key;
}

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function needsImageSource(book: BookIndex): boolean {
  const hasThumb = Boolean(book.thumbnailUrl?.trim());
  const hasIsbn13 = Boolean(book.isbn13?.trim());
  const hasGbId = Boolean(book.sourceIds?.googleBooksId?.trim());
  return !hasThumb && !hasIsbn13 && !hasGbId;
}

function parseIsbn(info: GBVolumeInfo | undefined): { isbn13?: string; isbn10?: string } {
  const ids = info?.industryIdentifiers ?? [];
  const isbn13 = ids.find((x) => x.type === "ISBN_13")?.identifier;
  const isbn10 = ids.find((x) => x.type === "ISBN_10")?.identifier;
  return {
    ...(isbn13 ? { isbn13 } : {}),
    ...(isbn10 ? { isbn10 } : {}),
  };
}

async function fetchByQuery(query: string, apiKey: string | null): Promise<GBItem[]> {
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

function chooseBest(candidates: GBItem[], title: string, author: string | null): GBItem | null {
  if (!candidates.length) return null;
  const targetTitle = normalize(title);
  const targetAuthor = normalize(author ?? "");

  let best: { item: GBItem; score: number } | null = null;
  for (const item of candidates) {
    const info = item.volumeInfo ?? {};
    const titleN = normalize(info.title ?? "");
    const authorsN = (info.authors ?? []).map((a) => normalize(a));
    let score = 0;

    if (titleN === targetTitle) score += 100;
    else if (titleN.includes(targetTitle) || targetTitle.includes(titleN)) score += 60;

    if (targetAuthor) {
      if (authorsN.some((a) => a.includes(targetAuthor) || targetAuthor.includes(a))) score += 35;
    }

    const hasImage = Boolean(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail);
    const hasIsbn = Boolean(parseIsbn(info).isbn13);
    if (hasImage) score += 10;
    if (hasIsbn) score += 10;

    if (!best || score > best.score) best = { item, score };
  }

  if (!best) return null;
  return best.score >= 60 ? best.item : null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const apiKey = loadGoogleApiKey();
  const delayMs = 250;
  const now = new Date().toISOString();

  const books = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")) as BookIndex[];
  const targets = books.filter(needsImageSource);
  console.log(`targets=${targets.length}`);

  let updated = 0;
  const unresolved: Array<{ id: string; title: string }> = [];

  for (const book of targets) {
    const author = (book.authors ?? []).find((a) => a && a !== "著者不明") ?? null;
    const queries = [
      author ? `${book.title} ${author}` : book.title,
      author ? `intitle:${book.title} inauthor:${author}` : `intitle:${book.title}`,
    ];

    let hit: GBItem | null = null;
    for (const q of queries) {
      const candidates = await fetchByQuery(q, apiKey);
      hit = chooseBest(candidates, book.title, author);
      if (hit) break;
      await sleep(delayMs);
    }

    if (!hit) {
      unresolved.push({ id: book.id, title: book.title });
      console.log(`unresolved: ${book.id} | ${book.title}`);
      continue;
    }

    const info = hit.volumeInfo ?? {};
    const parsed = parseIsbn(info);
    const thumb = info.imageLinks?.thumbnail?.replace(/^http:/, "https:")
      ?? info.imageLinks?.smallThumbnail?.replace(/^http:/, "https:");

    let changed = false;
    if (thumb && !book.thumbnailUrl) {
      book.thumbnailUrl = thumb;
      changed = true;
    }
    if (parsed.isbn13 && !book.isbn13) {
      book.isbn13 = parsed.isbn13;
      changed = true;
    }
    if (parsed.isbn10 && !book.isbn10) {
      book.isbn10 = parsed.isbn10;
      changed = true;
    }
    if (!book.sourceIds?.googleBooksId) {
      book.sourceIds = { ...(book.sourceIds ?? {}), googleBooksId: hit.id };
      changed = true;
    }

    if (changed) {
      book.updatedAt = now;
      updated++;
      console.log(`updated: ${book.id} -> gb:${hit.id}${thumb ? " [thumb]" : ""}${parsed.isbn13 ? " [isbn13]" : ""}`);
    } else {
      unresolved.push({ id: book.id, title: book.title });
      console.log(`unresolved(no-change): ${book.id} | ${book.title}`);
    }

    await sleep(delayMs);
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(books, null, 2) + "\n", "utf-8");

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const tsv = ["id\ttitle", ...unresolved.map((x) => `${x.id}\t${x.title.replace(/\t/g, " ")}`)].join("\n");
  fs.writeFileSync(REPORT_PATH, tsv + "\n", "utf-8");

  console.log(`updated_count=${updated}`);
  console.log(`unresolved_count=${unresolved.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

