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
};

type GBItem = {
  id: string;
  volumeInfo?: GBVolumeInfo;
};

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, "src", "data", "books.index.json");
const REPORT_PATH = path.join(ROOT, "reports", "unknown-author-unresolved.tsv");

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

function isUnknownAuthors(authors: string[] | undefined): boolean {
  if (!authors || !Array.isArray(authors) || authors.length === 0) return true;
  return authors.every((a) => !String(a).trim() || String(a).trim() === "著者不明");
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

async function fetchByVolumeId(volumeId: string, apiKey: string | null): Promise<GBItem | null> {
  const keyParam = apiKey ? `?key=${apiKey}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(volumeId)}${keyParam}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;
  return (await res.json()) as GBItem;
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

function chooseBestByTitle(items: GBItem[], title: string): GBItem | null {
  if (!items.length) return null;
  const t = normalize(title);
  let best: { item: GBItem; score: number } | null = null;
  for (const item of items) {
    const cand = normalize(item.volumeInfo?.title ?? "");
    let score = 0;
    if (cand === t) score += 100;
    else if (cand.includes(t) || t.includes(cand)) score += 60;
    if ((item.volumeInfo?.authors?.length ?? 0) > 0) score += 10;
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
  const delay = 200;
  const now = new Date().toISOString();

  const books = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")) as BookIndex[];
  const targets = books.filter((b) => isUnknownAuthors(b.authors));

  console.log(`targets=${targets.length}`);

  let updated = 0;
  const unresolved: Array<{ id: string; title: string }> = [];

  for (const book of targets) {
    let hit: GBItem | null = null;

    const existingGbId = book.sourceIds?.googleBooksId ?? null;
    if (existingGbId) {
      hit = await fetchByVolumeId(existingGbId, apiKey);
    }

    if (!hit && book.id.startsWith("gb-") && !book.id.startsWith("gb-blog-")) {
      hit = await fetchByVolumeId(book.id.replace(/^gb-/, ""), apiKey);
    }

    if (!hit && book.isbn13 && /^97[89]\d{10}$/.test(book.isbn13)) {
      const items = await fetchByQuery(`isbn:${book.isbn13}`, apiKey);
      hit = items[0] ?? null;
    }

    if (!hit) {
      const items = await fetchByQuery(`intitle:${book.title}`, apiKey);
      hit = chooseBestByTitle(items, book.title);
    }

    const newAuthors = hit?.volumeInfo?.authors?.map((a) => a.trim()).filter(Boolean) ?? [];

    if (newAuthors.length > 0) {
      book.authors = newAuthors.slice(0, 5);
      book.updatedAt = now;
      book.searchableText = buildSearchableText(book);
      book.sourceIds = {
        ...(book.sourceIds ?? {}),
        ...(hit?.id ? { googleBooksId: hit.id } : {}),
      };
      updated++;
      console.log(`updated: ${book.id} -> ${book.authors.join(" / ")}`);
    } else {
      unresolved.push({ id: book.id, title: book.title });
      console.log(`unresolved: ${book.id} | ${book.title}`);
    }

    await sleep(delay);
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

