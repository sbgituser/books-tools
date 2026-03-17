#!/usr/bin/env tsx
/**
 * fix-manga-batch2b.ts
 * fix-manga-batch2.ts 後の残問題を修正するスクリプト
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

const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface ManualClassification {
  l1Id: string; l2Id: string; l3Id: string; l4TagIds?: string[];
}

// ─── 削除対象 ─────────────────────────────────────────────────────────────────
const REMOVE_IDS = new Set([
  "9781974728466",  // "Blue Box, Vol. 1" (英語版 - アオのハコとして既に登録済み)
]);

// ─── 再取得対象 ───────────────────────────────────────────────────────────────
interface FetchTarget {
  title: string;
  queries: string[];  // 試すクエリのリスト（順に試す）
  classification: ManualClassification;
  excludeWords?: string[];
  mustInclude?: string;  // このワードをタイトルに含む必要がある
}

const CLS = (l2: string, l3: string): ManualClassification => ({
  l1Id: "manga", l2Id: l2, l3Id: l3, l4TagIds: ["readable"],
});

const FETCH_TARGETS: FetchTarget[] = [
  {
    title: "RIOT",
    queries: [
      "RIOT 漫画 少年 1巻",
      "RIOT 漫画 青年 1巻",
      "RIOT コミック 1",
    ],
    classification: CLS("seinen", "drama"),
    excludeWords: ["DRACU", "ライオット"],
    mustInclude: "RIOT",
  },
  {
    title: "サンダー3",
    queries: [
      "サンダー3 1",
      "THUNDER 3 漫画",
      "サンダースリー 1",
    ],
    classification: CLS("seinen", "social"),
    mustInclude: "サンダー",
  },
  {
    title: "ガールミーツロック!",
    queries: [
      "ガールミーツロック 1",
      "Girl meets Rock 漫画",
      "ガールミーツ ロック 漫画",
    ],
    classification: CLS("shonen", "adventure"),
    mustInclude: "ガール",
  },
];

async function searchVol1(target: FetchTarget): Promise<any | null> {
  for (const query of target.queries) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const data = await res.json() as any;
    if (!data.items) continue;

    const mustInclude = target.mustInclude ?? target.title;

    const candidates = data.items.filter((item: any) => {
      const t: string = item.volumeInfo?.title ?? "";
      if (!t.includes(mustInclude)) return false;
      if (target.excludeWords?.some(w => t.includes(w))) return false;
      return true;
    });
    if (candidates.length === 0) {
      console.log(`    クエリ無効: "${query}"`);
      continue;
    }

    function scoreItem(item: any): number {
      const t: string = item.volumeInfo?.title ?? "";
      let score = 0;
      if (t === target.title) score += 10;
      if (/[（(][１1][）)]/.test(t)) score += 8;
      if (/[　\s][１1]$/.test(t)) score += 7;
      if (/第?[１1]巻/.test(t)) score += 7;
      if (/[１1]巻$/.test(t)) score += 6;
      const hasIsbn = item.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13");
      if (hasIsbn) score += 3;
      score -= t.length * 0.1;
      return score;
    }

    candidates.sort((a: any, b: any) => scoreItem(b) - scoreItem(a));
    const best = candidates[0];
    console.log(`    クエリ成功: "${query}" → ${best.volumeInfo?.title}`);
    return best;
  }
  return null;
}

function buildEntry(item: any, classification: ManualClassification): any {
  const info = item.volumeInfo;
  const isbn13: string | undefined = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
  const id = isbn13 ?? `gb-${item.id}`;
  const title: string = info.title ?? "";
  const subtitle: string | undefined = info.subtitle;
  const authors: string[] = info.authors ?? [];
  const publisher: string | undefined = info.publisher;
  const publishedDate: string | undefined = info.publishedDate;
  const pageCount: number | undefined = info.pageCount;
  const thumbnailUrl: string | undefined =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ??
    info.imageLinks?.smallThumbnail?.replace("http://", "https://");
  const keywords = ["漫画", "コミック"];
  const searchableText = [title, subtitle, ...authors, publisher ?? "", ...keywords].filter(Boolean).join(" ");
  return {
    id, title, ...(subtitle ? { subtitle } : {}), authors,
    ...(publisher ? { publisher } : {}), ...(publishedDate ? { publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}), language: info.language ?? "ja",
    ...(pageCount ? { pageCount } : {}), categories: ["漫画"], keywords, searchableText,
    ...(thumbnailUrl ? { thumbnailUrl } : {}), sourceIds: { googleBooksId: item.id },
    updatedAt: new Date().toISOString(), manualClassification: classification,
  };
}

async function main() {
  const books: any[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));

  // 1. 削除
  const before = books.length;
  const filtered = books.filter(b => !REMOVE_IDS.has(b.id));
  console.log(`削除: ${before - filtered.length}冊`);

  // 2. 再取得
  const existingIds = new Set(filtered.map((b: any) => b.id));
  let added = 0;
  let notFound = 0;

  for (const target of FETCH_TARGETS) {
    console.log(`\n🔍 再取得: ${target.title}`);
    const item = await searchVol1(target);
    if (!item) {
      console.warn(`  ⚠ 見つかりません: ${target.title}`);
      notFound++;
      continue;
    }
    const entry = buildEntry(item, target.classification);
    const foundTitle: string = item.volumeInfo?.title ?? "";
    if (existingIds.has(entry.id)) {
      console.log(`  ⏭ スキップ（既存）: ${foundTitle} (${entry.id})`);
      continue;
    }
    filtered.push(entry);
    existingIds.add(entry.id);
    console.log(`  ✓ 追加: ${foundTitle} (${entry.id})`);
    added++;
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  console.log(`\n完了: 削除${before - filtered.length}冊 / 追加${added}冊 / 未発見${notFound}冊`);
  console.log("次のステップ: npm run split:index");
}

main().catch(console.error);
