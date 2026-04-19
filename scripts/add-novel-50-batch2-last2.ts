#!/usr/bin/env tsx
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
const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface ManualClassification { l1Id: string; l2Id: string; l3Id: string; l4TagIds?: string[]; }
interface BookEntry {
  id: string; title: string; subtitle?: string; authors: string[];
  publisher?: string; publishedDate?: string; isbn13?: string; language: string;
  pageCount?: number; categories: string[]; keywords: string[]; searchableText: string;
  thumbnailUrl?: string; sourceIds: { googleBooksId?: string }; updatedAt: string;
  manualClassification: ManualClassification;
}

const WORK_LIST = [
  { title: "異邦人 カミュ", classification: { l1Id: "novel", l2Id: "foreign", l3Id: "classic" } },
  { title: "老人と海 ヘミングウェイ", classification: { l1Id: "novel", l2Id: "foreign", l3Id: "classic" } },
  { title: "錆喰いビスコ", classification: { l1Id: "novel", l2Id: "light_novel", l3Id: "isekai" } },
  { title: "華竜の宮 上田早夕里", classification: { l1Id: "novel", l2Id: "sf", l3Id: "hard_sf" } },
];

async function fetchByTitle(title: string): Promise<any | null> {
  const searchTitle = title.replace(/\s+[^\s]+$/g, "").trim();
  const keyParam = API_KEY ? `&key=${API_KEY}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`intitle:${searchTitle}`)}&langRestrict=ja&maxResults=20${keyParam}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as any;
  if (!data.items) {
    const shortTitle = title.split(/\s/)[0];
    if (shortTitle !== searchTitle) {
      await new Promise((r) => setTimeout(r, 400));
      const url2 = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`intitle:${shortTitle}`)}&langRestrict=ja&maxResults=20${keyParam}`;
      const res2 = await fetch(url2);
      if (res2.ok) { const d2 = (await res2.json()) as any; if (d2.items) return selectBest(d2.items, shortTitle); }
    }
    return null;
  }
  return selectBest(data.items, searchTitle);
}

function selectBest(items: any[], st: string): any | null {
  const nt = st.replace(/[\s　]*[（(【「].*/g, "").replace(/\s+/g, "").trim();
  const c = items.filter((i: any) => { const t = (i.volumeInfo?.title ?? "").replace(/\s+/g, ""); return t.includes(nt) || nt.includes(t); });
  if (!c.length) return null;
  c.sort((a: any, b: any) => {
    const score = (x: any) => { const t = x.volumeInfo?.title ?? ""; let s = 0; if (t.replace(/\s+/g, "") === nt) s += 10; if (x.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13")) s += 3; s -= t.length * 0.1; return s; };
    return score(b) - score(a);
  });
  return c[0];
}

async function main() {
  const books: BookEntry[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  const existingIds = new Set(books.map((b) => b.id));
  const existingTitles = new Set(books.filter((b) => b.manualClassification?.l1Id).map((b) => b.title.replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase()));
  let added = 0;

  for (const target of WORK_LIST) {
    if (added >= 2) break;
    const titleOnly = target.title.replace(/\s+[^\s]+$/g, "").replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();
    let dup = false;
    for (const ex of existingTitles) { if (titleOnly.length >= 3 && ex.length >= 3 && (ex.includes(titleOnly) || titleOnly.includes(ex))) { console.log(`⏭ ${target.title}`); dup = true; break; } }
    if (dup) continue;

    console.log(`🔍 ${target.title}`);
    const item = await fetchByTitle(target.title);
    if (!item) { console.log(`  ⚠ 未発見`); await new Promise((r) => setTimeout(r, 400)); continue; }

    const info = item.volumeInfo;
    const isbn13 = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
    const id = isbn13 ?? item.id;
    if (existingIds.has(id)) { console.log(`  ⏭ ID重複`); continue; }

    const entry: BookEntry = {
      id, title: info.title ?? target.title, authors: info.authors ?? [],
      ...(info.publisher ? { publisher: info.publisher } : {}),
      ...(info.publishedDate ? { publishedDate: info.publishedDate } : {}),
      ...(isbn13 ? { isbn13 } : {}),
      language: info.language ?? "ja",
      ...(info.pageCount ? { pageCount: info.pageCount } : {}),
      categories: ["小説"], keywords: ["小説"],
      searchableText: [info.title, ...info.authors ?? []].filter(Boolean).join(" ") + " 小説",
      ...(info.imageLinks?.thumbnail ? { thumbnailUrl: info.imageLinks.thumbnail.replace("http://", "https://") } : {}),
      sourceIds: { googleBooksId: item.id },
      updatedAt: new Date().toISOString(),
      manualClassification: target.classification as ManualClassification,
    };
    books.push(entry);
    existingIds.add(id);
    existingTitles.add(titleOnly);
    console.log(`  ✅ ${entry.title} (${id}) [${target.classification.l2Id}]`);
    added++;
    await new Promise((r) => setTimeout(r, 400));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n追加: ${added}件 / 合計: ${books.length}件`);
}

main().catch(console.error);
