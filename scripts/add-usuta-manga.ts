#!/usr/bin/env tsx
/**
 * add-usuta-manga.ts
 * うすた京介の作品を books.index.json に追加する
 */

import * as fs from "fs";
import * as path from "path";

{
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  }
}

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
if (!API_KEY) { console.error("GOOGLE_BOOKS_API_KEY が設定されていません"); process.exit(1); }

const INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

const TARGETS = [
  { title: "セクシーコマンドー外伝 すごいよ!!マサルさん", searchQ: "マサルさん うすた", fragment: "マサルさん", l2Id: "shonen" },
  { title: "ピューと吹く！ジャガー",                     searchQ: "ピューと吹く ジャガー うすた",  fragment: "ジャガー",  l2Id: "shonen" },
];

interface GBVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: { type: string; identifier: string }[];
    language?: string;
  };
}

async function search(q: string): Promise<GBVolume[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&langRestrict=ja&maxResults=5&key=${API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const d = await r.json() as { items?: GBVolume[] };
  return d.items ?? [];
}

function thumb(gbId: string) {
  return `https://books.google.com/books/content?id=${gbId}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`;
}

async function main() {
  const index: Record<string, unknown>[] = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const existingTitles = new Set(index.map(b => (b.title as string | undefined)?.replace(/\s*(モノクロ版|カラー版)?\s*[\d（）()１-９]+.*$/, "").trim()));
  const existingGbIds = new Set(index.map(b => (b.sourceIds as { googleBooksId?: string } | undefined)?.googleBooksId).filter(Boolean));
  const existingIds = new Set(index.map(b => b.id as string));

  let added = 0;

  for (const t of TARGETS) {
    if (existingTitles.has(t.title)) { console.log(`SKIP (exists): ${t.title}`); continue; }

    console.log(`Searching: ${t.title}`);
    const vols = await search(t.searchQ);
    await new Promise(r => setTimeout(r, 500));

    const vol = vols.find(v => v.volumeInfo.title?.includes(t.fragment));
    if (!vol) {
      console.warn(`  NOT FOUND: ${t.title} (results: ${vols.map(v => v.volumeInfo.title).join(", ") || "none"})`);
      continue;
    }

    const vi = vol.volumeInfo;
    const isbn13 = vi.industryIdentifiers?.find(x => x.type === "ISBN_13")?.identifier;
    const isbn10 = vi.industryIdentifiers?.find(x => x.type === "ISBN_10")?.identifier;
    const finalId = isbn13 ?? `gb-${vol.id}`;

    if (existingIds.has(finalId) || existingGbIds.has(vol.id)) {
      console.log(`  SKIP (id exists): ${finalId}`);
      continue;
    }

    const entry: Record<string, unknown> = {
      id: finalId,
      title: t.title,
      authors: vi.authors ?? ["うすた京介"],
      categories: ["Comics & Graphic Novels"],
      keywords: ["Comics & Graphic Novels"],
      searchableText: [t.title, ...(vi.authors ?? ["うすた京介"]), vi.publisher].filter(Boolean).join(" "),
      updatedAt: new Date().toISOString(),
      language: vi.language ?? "ja",
      thumbnailUrl: thumb(vol.id),
      sourceIds: { googleBooksId: vol.id },
      manualClassification: { l1Id: "manga", l2Id: t.l2Id, l3Id: "gag" },
    };

    if (vi.publisher) entry.publisher = vi.publisher;
    if (vi.publishedDate) entry.publishedDate = vi.publishedDate;
    if (isbn10) entry.isbn10 = isbn10;
    if (isbn13) entry.isbn13 = isbn13;
    if (vi.pageCount) entry.pageCount = vi.pageCount;

    index.push(entry);
    existingIds.add(finalId);
    existingGbIds.add(vol.id);
    existingTitles.add(t.title);
    added++;
    console.log(`  ADDED: ${t.title} [${finalId}] (GB: ${vol.id})`);
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\n✓ books.index.json updated (+${added} entries, total: ${index.length})`);
}

main().catch(console.error);
