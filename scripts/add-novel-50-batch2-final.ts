#!/usr/bin/env tsx
/**
 * add-novel-50-batch2-final.ts
 * batch2最終補充（残り8作品+予備）
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
const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface ManualClassification { l1Id: string; l2Id: string; l3Id: string; l4TagIds?: string[]; }
interface BookEntry {
  id: string; title: string; subtitle?: string; authors: string[];
  publisher?: string; publishedDate?: string; isbn13?: string; language: string;
  pageCount?: number; categories: string[]; keywords: string[]; searchableText: string;
  thumbnailUrl?: string; sourceIds: { googleBooksId?: string }; updatedAt: string;
  manualClassification: ManualClassification;
}
interface WorkTarget { title: string; type: "novel"; classification: ManualClassification; }

function bc(l2: string, l3: string): ManualClassification {
  const l2Map: Record<string, string> = {
    "ライトノベル": "light_novel", "文芸": "literary", "ミステリー": "mystery",
    "SF": "sf", "ファンタジー": "fantasy", "ホラー": "horror",
    "歴史・時代": "historical", "海外文学": "foreign", "エッセイ": "literary",
    "ノンフィクション": "literary",
  };
  const l3Map: Record<string, string> = {
    "異世界": "isekai", "バトル": "battle", "恋愛": "romance", "日常": "daily_life",
    "本格": "honkaku", "社会派": "social", "警察": "social", "ハードSF": "hard_sf",
    "クラシック": "classic", "青春": "youth", "時代": "jidai", "ファンタジー": "fantasy",
    "サスペンス": "social", "怪談": "other", "エッセイ": "other", "サイバーパンク": "cyberpunk",
  };
  return { l1Id: "novel", l2Id: l2Map[l2] ?? "general", l3Id: l3Map[l3] ?? "other" };
}

const WORK_LIST: WorkTarget[] = [
  // ミステリー
  { title: "白い巨塔 山崎豊子", type: "novel", classification: bc("ミステリー", "社会派") },
  { title: "沈まぬ太陽 山崎豊子", type: "novel", classification: bc("ミステリー", "社会派") },
  { title: "ジョーカー・ゲーム 柳広司", type: "novel", classification: bc("ミステリー", "本格") },
  // 文芸
  { title: "女のいない男たち 村上春樹", type: "novel", classification: bc("文芸", "クラシック") },
  { title: "夜と霧 フランクル", type: "novel", classification: bc("海外文学", "クラシック") },
  { title: "車輪の下 ヘッセ", type: "novel", classification: bc("海外文学", "クラシック") },
  // ライトノベル
  { title: "魔王学院の不適合者", type: "novel", classification: bc("ライトノベル", "異世界") },
  { title: "ナイツ＆マジック", type: "novel", classification: bc("ライトノベル", "異世界") },
  { title: "異世界居酒屋のぶ", type: "novel", classification: bc("ライトノベル", "日常") },
  // SF
  { title: "天体の回転について 小林泰三", type: "novel", classification: bc("SF", "ハードSF") },
  // ファンタジー
  { title: "守り人シリーズ 蒼路の旅人", type: "novel", classification: bc("ファンタジー", "ファンタジー") },
  // ノンフィクション
  { title: "夜と霧 ヴィクトール・フランクル", type: "novel", classification: bc("ノンフィクション", "エッセイ") },
];

async function fetchByTitle(title: string, retries = 3): Promise<any | null> {
  const searchTitle = title.replace(/\s+[^\s]+$/g, "").trim();
  const query = `intitle:${searchTitle}`;
  const keyParam = API_KEY ? `&key=${API_KEY}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20${keyParam}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429 || res.status === 503) {
      const waitTime = Math.min(3000 * Math.pow(2, attempt), 30000);
      console.log(`    [${res.status}] 待機 ${waitTime / 1000}秒`);
      await new Promise((r) => setTimeout(r, waitTime));
      continue;
    }
    if (!res.ok) { console.log(`    [HTTP ${res.status}]`); return null; }
    const data = (await res.json()) as any;
    if (!data.items) {
      if (searchTitle !== title.split(/\s/)[0]) {
        const shortTitle = title.split(/\s/)[0];
        const url2 = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`intitle:${shortTitle}`)}&langRestrict=ja&maxResults=20${keyParam}`;
        await new Promise((r) => setTimeout(r, 400));
        const res2 = await fetch(url2);
        if (res2.ok) { const d2 = (await res2.json()) as any; if (d2.items) return selectBest(d2.items, shortTitle); }
      }
      return null;
    }
    return selectBest(data.items, searchTitle);
  }
  return null;
}

function selectBest(items: any[], searchTitle: string): any | null {
  const nt = searchTitle.replace(/[\s　]*[（(【「].*/g, "").replace(/\s+/g, "").trim();
  const cands = items.filter((item: any) => {
    const t = (item.volumeInfo?.title ?? "").replace(/\s+/g, "");
    return t.includes(nt) || nt.includes(t);
  });
  if (!cands.length) return null;
  cands.sort((a: any, b: any) => {
    const sa = scoreItem(a, nt), sb = scoreItem(b, nt);
    return sb - sa;
  });
  return cands[0];
}

function scoreItem(item: any, nt: string): number {
  const t = item.volumeInfo?.title ?? "";
  let s = 0;
  if (t.replace(/\s+/g, "") === nt) s += 10;
  if (/[（(][１1][）)]/.test(t)) s += 8;
  if (item.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13")) s += 3;
  s -= t.length * 0.1;
  return s;
}

function buildEntry(item: any, title: string, classification: ManualClassification): BookEntry {
  const info = item.volumeInfo;
  const isbn13 = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
  const id = isbn13 ?? item.id;
  const bookTitle = info.title ?? title;
  const subtitle = info.subtitle;
  const authors = info.authors ?? [];
  const publisher = info.publisher;
  const publishedDate = info.publishedDate;
  const pageCount = info.pageCount;
  const thumbnailUrl = info.imageLinks?.thumbnail?.replace("http://", "https://") ?? info.imageLinks?.smallThumbnail?.replace("http://", "https://");
  const keywords = ["小説"];
  const searchableText = [bookTitle, subtitle, ...authors, publisher ?? "", ...keywords].filter(Boolean).join(" ");
  return {
    id, title: bookTitle, ...(subtitle ? { subtitle } : {}), authors,
    ...(publisher ? { publisher } : {}), ...(publishedDate ? { publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}), language: info.language ?? "ja",
    ...(pageCount ? { pageCount } : {}), categories: ["小説"], keywords, searchableText,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    sourceIds: { googleBooksId: item.id }, updatedAt: new Date().toISOString(),
    manualClassification: classification,
  };
}

async function main() {
  const books: BookEntry[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  const existingIds = new Set(books.map((b) => b.id));
  const existingTitles = new Set(
    books.filter((b) => b.manualClassification?.l1Id)
      .map((b) => b.title.replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase())
  );
  let added = 0, skipped = 0, notFound = 0;
  const genreStats: Record<string, number> = {};

  console.log(`\n📋  最終補充: ${WORK_LIST.length}作品`);
  console.log("──────────────────────────────────────────────────");

  for (let i = 0; i < WORK_LIST.length; i++) {
    const target = WORK_LIST[i];
    const titleOnly = target.title.replace(/\s+[^\s]+$/g, "").replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();
    let isDuplicate = false;
    for (const existing of existingTitles) {
      if (titleOnly.length >= 3 && existing.length >= 3) {
        if (existing.includes(titleOnly) || titleOnly.includes(existing)) {
          console.log(`[${i + 1}/${WORK_LIST.length}] ⏭  スキップ: ${target.title}`);
          skipped++; isDuplicate = true; break;
        }
      }
    }
    if (isDuplicate) continue;

    console.log(`[${i + 1}/${WORK_LIST.length}] 🔍  検索: ${target.title}`);
    const item = await fetchByTitle(target.title);
    if (!item) { console.log(`    ⚠  未発見: ${target.title}`); notFound++; await new Promise((r) => setTimeout(r, 400)); continue; }

    const entry = buildEntry(item, target.title, target.classification);
    if (existingIds.has(entry.id)) {
      const existing = books.find((b) => b.id === entry.id);
      if (existing && !existing.manualClassification?.l1Id) {
        existing.manualClassification = target.classification;
        console.log(`    ✏  分類追加: ${existing.title}`); added++;
        genreStats[target.classification.l2Id] = (genreStats[target.classification.l2Id] ?? 0) + 1;
      } else { console.log(`    ⏭  ID重複: ${entry.title}`); skipped++; }
    } else {
      books.push(entry); existingIds.add(entry.id); existingTitles.add(titleOnly);
      console.log(`    ✅  追加: ${entry.title} (${entry.id}) [${target.classification.l2Id}]`);
      added++; genreStats[target.classification.l2Id] = (genreStats[target.classification.l2Id] ?? 0) + 1;
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`✅  完了: 追加 ${added} / スキップ ${skipped} / 未発見 ${notFound}`);
  console.log(`📚  合計: ${books.length}件`);
  for (const [g, c] of Object.entries(genreStats)) console.log(`    ${g}: ${c}`);
}

main().catch(console.error);
