#!/usr/bin/env tsx
/**
 * fix-blog-book-ids.ts
 *
 * Fixes non-ASCII IDs in src/data/books.index.json:
 *  - Prefers isbn13 as the new ID
 *  - Falls back to gb-{googleBooksId}
 *  - Skips with warning if no source is available
 *  - Skips with warning on ID collision
 *  - Extracts googleBooksId from thumbnailUrl when missing
 *  - Special fix: gb-blog-本陣殺人事件 title → "本陣殺人事件"
 *
 * Outputs:
 *  - Updated src/data/books.index.json
 *  - data/book-id-redirects.json  (oldId → newId mapping)
 */

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
  [key: string]: unknown;
};

const ROOT = process.cwd();
const BOOK_INDEX_PATH = path.join(ROOT, "src", "data", "books.index.json");
const REDIRECTS_PATH = path.join(ROOT, "data", "book-id-redirects.json");

function hasNonAscii(str: string): boolean {
  return /[^\x00-\x7F]/.test(str);
}

/** Extract Google Books ID from a thumbnailUrl like ?id=XXXX& */
function extractGoogleBooksIdFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  const m = url.match(/[?&]id=([A-Za-z0-9_\-]+)/);
  return m ? m[1] : null;
}

function main() {
  const books: BookIndex[] = JSON.parse(fs.readFileSync(BOOK_INDEX_PATH, "utf-8"));

  // Build a set of all current IDs for collision detection (will be updated as we go)
  const existingIds = new Set(books.map((b) => b.id));

  const redirects: Record<string, string> = {};
  let renamed = 0;
  let skippedNoSource = 0;
  let skippedCollision = 0;
  let specialFixes = 0;

  for (const book of books) {
    // --- Special title fix ---
    if (book.id === "gb-blog-本陣殺人事件" && book.title === "横溝正史自選集") {
      book.title = "本陣殺人事件";
      // Rebuild searchableText
      book.searchableText = [
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
      specialFixes++;
      console.log(`[special-fix] title: "横溝正史自選集" → "本陣殺人事件" (id: ${book.id})`);
      // The ID itself is non-ASCII and will be handled below in the rename logic
    }

    if (!hasNonAscii(book.id)) continue;

    const oldId = book.id;

    // Step a: if thumbnailUrl has id= but sourceIds.googleBooksId is missing, extract it
    if (!book.sourceIds?.googleBooksId) {
      const extracted = extractGoogleBooksIdFromUrl(book.thumbnailUrl);
      if (extracted) {
        if (!book.sourceIds) book.sourceIds = {};
        book.sourceIds.googleBooksId = extracted;
        console.log(`[extract-gbid] ${oldId} → googleBooksId: ${extracted}`);
      }
    }

    // Step b: determine new ID
    let newId: string | null = null;

    if (book.isbn13) {
      newId = book.isbn13;
    } else if (book.sourceIds?.googleBooksId) {
      newId = `gb-${book.sourceIds.googleBooksId}`;
    }

    if (!newId) {
      console.warn(`[skip:no-source] ${oldId} — no isbn13 and no googleBooksId, keeping old ID`);
      skippedNoSource++;
      continue;
    }

    // Step c: collision check
    if (newId !== oldId && existingIds.has(newId)) {
      console.warn(`[skip:collision] ${oldId} → ${newId} — collision with existing ID, keeping old ID`);
      skippedCollision++;
      continue;
    }

    if (newId === oldId) {
      // Already the correct ID (shouldn't happen since we only process non-ASCII, but be safe)
      continue;
    }

    // Step d/e: record mapping and update entry
    redirects[oldId] = newId;
    existingIds.delete(oldId);
    existingIds.add(newId);
    book.id = newId;
    renamed++;
    console.log(`[rename] ${oldId} → ${newId}`);
  }

  // Write updated books.index.json
  fs.writeFileSync(BOOK_INDEX_PATH, JSON.stringify(books, null, 2) + "\n", "utf-8");
  console.log(`\nWrote: ${BOOK_INDEX_PATH}`);

  // Write redirects
  fs.writeFileSync(REDIRECTS_PATH, JSON.stringify(redirects, null, 2) + "\n", "utf-8");
  console.log(`Wrote: ${REDIRECTS_PATH}`);

  console.log(`\n=== Summary ===`);
  console.log(`  Renamed:          ${renamed}`);
  console.log(`  Skipped (no src): ${skippedNoSource}`);
  console.log(`  Skipped (collis): ${skippedCollision}`);
  console.log(`  Special fixes:    ${specialFixes}`);
  console.log(`  Redirect entries: ${Object.keys(redirects).length}`);
}

main();
