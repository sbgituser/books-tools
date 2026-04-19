#!/usr/bin/env tsx
/**
 * add-novel-50-batch2-supplement.ts
 * batch2で未発見・スキップされた分の補充（21作品+α）
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

interface ManualClassification {
  l1Id: string;
  l2Id: string;
  l3Id: string;
  l4TagIds?: string[];
}

interface BookEntry {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  language: string;
  pageCount?: number;
  categories: string[];
  keywords: string[];
  searchableText: string;
  thumbnailUrl?: string;
  sourceIds: { googleBooksId?: string };
  updatedAt: string;
  manualClassification: ManualClassification;
}

interface WorkTarget {
  title: string;
  type: "novel";
  classification: ManualClassification;
}

function buildClassification(l2Label: string, l3Label: string): ManualClassification {
  let l2Id: string;
  if (l2Label === "ライトノベル") l2Id = "light_novel";
  else if (l2Label === "文芸") l2Id = "literary";
  else if (l2Label === "ミステリー") l2Id = "mystery";
  else if (l2Label === "SF") l2Id = "sf";
  else if (l2Label === "ファンタジー") l2Id = "fantasy";
  else if (l2Label === "ホラー") l2Id = "horror";
  else if (l2Label === "歴史・時代") l2Id = "historical";
  else if (l2Label === "海外文学") l2Id = "foreign";
  else if (l2Label === "エッセイ") l2Id = "literary";
  else if (l2Label === "ノンフィクション") l2Id = "literary";
  else l2Id = "general";

  let l3Id: string;
  if (l3Label === "異世界") l3Id = "isekai";
  else if (l3Label === "バトル") l3Id = "battle";
  else if (l3Label === "恋愛") l3Id = "romance";
  else if (l3Label === "日常") l3Id = "daily_life";
  else if (l3Label === "本格") l3Id = "honkaku";
  else if (l3Label === "社会派") l3Id = "social";
  else if (l3Label === "警察") l3Id = "social";
  else if (l3Label === "ハードボイルド") l3Id = "hardboiled";
  else if (l3Label === "サイバーパンク") l3Id = "cyberpunk";
  else if (l3Label === "ハードSF") l3Id = "hard_sf";
  else if (l3Label === "クラシック") l3Id = "classic";
  else if (l3Label === "青春") l3Id = "youth";
  else if (l3Label === "時代") l3Id = "jidai";
  else if (l3Label === "ファンタジー") l3Id = "fantasy";
  else if (l3Label === "サスペンス") l3Id = "social";
  else if (l3Label === "怪談") l3Id = "other";
  else if (l3Label === "エッセイ") l3Id = "other";
  else { l3Id = "other"; }

  return { l1Id: "novel", l2Id, l3Id };
}

const WORK_LIST: WorkTarget[] = [
  // ── ミステリー補充 4作品 ──
  { title: "彼女がその名を知らない鳥たち 沼田まほかる", type: "novel", classification: buildClassification("ミステリー", "サスペンス") },
  { title: "ノースライト 横山秀夫", type: "novel", classification: buildClassification("ミステリー", "社会派") },
  { title: "ルパンの娘 横関大", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "虚ろな十字架 東野圭吾", type: "novel", classification: buildClassification("ミステリー", "社会派") },

  // ── 文芸補充 4作品 ──
  { title: "日の名残り カズオ・イシグロ", type: "novel", classification: buildClassification("海外文学", "クラシック") },
  { title: "わたしを離さないで カズオ・イシグロ", type: "novel", classification: buildClassification("海外文学", "クラシック") },
  { title: "密やかな結晶 小川洋子", type: "novel", classification: buildClassification("文芸", "クラシック") },
  { title: "鳩の撃退法 佐藤正午", type: "novel", classification: buildClassification("文芸", "クラシック") },

  // ── ライトノベル補充 5作品 ──
  { title: "最果てのパラディン", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "聖女の魔力は万能です", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "月が導く異世界道中", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "異世界はスマートフォンとともに。", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "デート・ア・ライブ", type: "novel", classification: buildClassification("ライトノベル", "バトル") },

  // ── SF補充 3作品 ──
  { title: "幼年期の終り クラーク", type: "novel", classification: buildClassification("SF", "クラシック") },
  { title: "星界の紋章 森岡浩之", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "Know 野崎まど", type: "novel", classification: buildClassification("SF", "ハードSF") },

  // ── ファンタジー補充 3作品 ──
  { title: "彩雲国物語", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "まおゆう魔王勇者", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "十二国記 風の万里 黎明の空", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },

  // ── 歴史補充 2作品 ──
  { title: "宮本武蔵 吉川英治", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "太閤記 吉川英治", type: "novel", classification: buildClassification("歴史・時代", "時代") },

  // ── ホラー補充 1作品 ──
  { title: "ZOO 乙一", type: "novel", classification: buildClassification("ホラー", "怪談") },

  // ── ノンフィクション補充 1作品 ──
  { title: "21Lessons ユヴァル・ノア・ハラリ", type: "novel", classification: buildClassification("ノンフィクション", "エッセイ") },
];

async function fetchByTitle(title: string, retries = 3): Promise<any | null> {
  const searchTitle = title.replace(/\s+[^\s]+$/g, "").trim();
  const query = `intitle:${searchTitle} 小説`;
  const keyParam = API_KEY ? `&key=${API_KEY}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20${keyParam}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429 || res.status === 503) {
      const waitTime = Math.min(3000 * Math.pow(2, attempt), 30000);
      console.log(`    [${res.status}] 待機 ${waitTime / 1000}秒 (${attempt + 1}/${retries + 1})`);
      await new Promise((r) => setTimeout(r, waitTime));
      continue;
    }
    if (!res.ok) {
      console.log(`    [Google Books] HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as any;
    if (!data.items) {
      if (searchTitle !== title.split(/\s/)[0]) {
        const shortTitle = title.split(/\s/)[0];
        const url2 = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`intitle:${shortTitle}`)}&langRestrict=ja&maxResults=20${keyParam}`;
        await new Promise((r) => setTimeout(r, 400));
        const res2 = await fetch(url2);
        if (res2.ok) {
          const data2 = (await res2.json()) as any;
          if (data2.items) return selectBest(data2.items, shortTitle);
        }
      }
      return null;
    }
    return selectBest(data.items, searchTitle);
  }
  return null;
}

function selectBest(items: any[], searchTitle: string): any | null {
  const normalizedTitle = searchTitle.replace(/[\s　]*[（(【「].*/g, "").replace(/\s+/g, "").trim();
  const candidates = items.filter((item: any) => {
    const t: string = (item.volumeInfo?.title ?? "").replace(/\s+/g, "");
    return t.includes(normalizedTitle) || normalizedTitle.includes(t);
  });
  if (candidates.length === 0) return null;
  function scoreItem(item: any): number {
    const t: string = item.volumeInfo?.title ?? "";
    let score = 0;
    if (t.replace(/\s+/g, "") === normalizedTitle) score += 10;
    if (/[（(][１1][）)]/.test(t)) score += 8;
    if (/[　\s][１1]$/.test(t)) score += 7;
    if (/第?[１1]巻/.test(t)) score += 7;
    const hasIsbn = item.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13");
    if (hasIsbn) score += 3;
    score -= t.length * 0.1;
    return score;
  }
  candidates.sort((a: any, b: any) => scoreItem(b) - scoreItem(a));
  return candidates[0];
}

function buildEntry(item: any, title: string, classification: ManualClassification): BookEntry {
  const info = item.volumeInfo;
  const isbn13 = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
  const id = isbn13 ?? item.id;
  const bookTitle: string = info.title ?? title;
  const subtitle: string | undefined = info.subtitle;
  const authors: string[] = info.authors ?? [];
  const publisher: string | undefined = info.publisher;
  const publishedDate: string | undefined = info.publishedDate;
  const pageCount: number | undefined = info.pageCount;
  const thumbnailUrl: string | undefined =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ??
    info.imageLinks?.smallThumbnail?.replace("http://", "https://");
  const keywords = ["小説"];
  const searchableText = [bookTitle, subtitle, ...authors, publisher ?? "", ...keywords].filter(Boolean).join(" ");
  return {
    id, title: bookTitle,
    ...(subtitle ? { subtitle } : {}),
    authors,
    ...(publisher ? { publisher } : {}),
    ...(publishedDate ? { publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}),
    language: info.language ?? "ja",
    ...(pageCount ? { pageCount } : {}),
    categories: ["小説"], keywords, searchableText,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    sourceIds: { googleBooksId: item.id },
    updatedAt: new Date().toISOString(),
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

  console.log(`\n📋  補充: ${WORK_LIST.length}作品`);
  console.log("──────────────────────────────────────────────────");

  for (let i = 0; i < WORK_LIST.length; i++) {
    const target = WORK_LIST[i];
    const titleOnly = target.title.replace(/\s+[^\s]+$/g, "").replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();

    let isDuplicate = false;
    for (const existing of existingTitles) {
      if (titleOnly.length >= 3 && existing.length >= 3) {
        if (existing.includes(titleOnly) || titleOnly.includes(existing)) {
          console.log(`[${i + 1}/${WORK_LIST.length}] ⏭  スキップ（既存）: ${target.title}`);
          skipped++;
          isDuplicate = true;
          break;
        }
      }
    }
    if (isDuplicate) continue;

    console.log(`[${i + 1}/${WORK_LIST.length}] 🔍  検索: ${target.title}`);
    const item = await fetchByTitle(target.title);

    if (!item) {
      console.log(`    ⚠  見つかりません: ${target.title}`);
      notFound++;
      await new Promise((r) => setTimeout(r, 400));
      continue;
    }

    const entry = buildEntry(item, target.title, target.classification);

    if (existingIds.has(entry.id)) {
      const existing = books.find((b) => b.id === entry.id);
      if (existing && !existing.manualClassification?.l1Id) {
        existing.manualClassification = target.classification;
        console.log(`    ✏  分類追加: ${existing.title} (${entry.id})`);
        added++;
        const l2 = target.classification.l2Id;
        genreStats[l2] = (genreStats[l2] ?? 0) + 1;
      } else {
        console.log(`    ⏭  スキップ（ID重複）: ${entry.title} (${entry.id})`);
        skipped++;
      }
    } else {
      books.push(entry);
      existingIds.add(entry.id);
      existingTitles.add(titleOnly);
      console.log(`    ✅  追加: ${entry.title} (${entry.id}) [${target.classification.l2Id}/${target.classification.l3Id}]`);
      added++;
      const l2 = target.classification.l2Id;
      genreStats[l2] = (genreStats[l2] ?? 0) + 1;
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`✅  完了: 追加 ${added}件 / スキップ ${skipped}件 / 未発見 ${notFound}件`);
  console.log(`📚  合計: ${books.length}件`);
  console.log(`\n📊  ジャンル別:`);
  for (const [g, c] of Object.entries(genreStats).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${g}: ${c}件`);
  }
}

main().catch(console.error);
