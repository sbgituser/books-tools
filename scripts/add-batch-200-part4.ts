#!/usr/bin/env tsx
/**
 * add-batch-200-part4.ts - 最終追加バッチ
 * 漫画あと48作品・小説あと30作品が必要
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

interface ManualClassification { l1Id: string; l2Id: string; l3Id: string; }
interface BookEntry {
  id: string; title: string; subtitle?: string; authors: string[];
  publisher?: string; publishedDate?: string; isbn13?: string; language: string;
  pageCount?: number; categories: string[]; keywords: string[]; searchableText: string;
  thumbnailUrl?: string; sourceIds: { googleBooksId?: string }; updatedAt: string;
  manualClassification: ManualClassification;
}
interface WorkTarget { title: string; type: "manga" | "novel"; classification: ManualClassification; }

function mc(l1: string, l2: string, l3: string): ManualClassification { return { l1Id: l1, l2Id: l2, l3Id: l3 }; }

const WORK_LIST: WorkTarget[] = [
  // ═══ 漫画 追加（目標+48以上） ═══
  { title: "まじっく快斗", type: "manga", classification: mc("manga", "shonen", "mystery") },
  { title: "YAIBA", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "銀牙 流れ星 銀", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "蒼き伝説シュート!", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "MAJOR 2nd", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "BE BLUES!", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "GIANT KILLING", type: "manga", classification: mc("manga", "seinen", "sports") },
  { title: "スラムダンク あれから10日後", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "ワールドトリガー 新装版", type: "manga", classification: mc("manga", "shonen", "sf") },
  { title: "プロミス・シンデレラ", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "ヤンキー君とメガネちゃん", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "山田くんと7人の魔女", type: "manga", classification: mc("manga", "shonen", "romance") },
  { title: "東京喰種トーキョーグール", type: "manga", classification: mc("manga", "seinen", "dark_fantasy") },
  { title: "東京喰種:re", type: "manga", classification: mc("manga", "seinen", "dark_fantasy") },
  { title: "デスノート 新装版", type: "manga", classification: mc("manga", "shonen", "mystery") },
  { title: "テラフォーマーズ 新装", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "魔法使いの嫁", type: "manga", classification: mc("manga", "seinen", "fantasy") },
  { title: "とんがり帽子のアトリエ", type: "manga", classification: mc("manga", "seinen", "fantasy") },
  { title: "メイドインアビス", type: "manga", classification: mc("manga", "seinen", "fantasy") },
  { title: "宝石の国", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "プラネテス", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "ヨルムンガンド", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "BTOOOM!", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "デストロ246", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "ブルーロック 新装版", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "コウノドリ", type: "manga", classification: mc("manga", "seinen", "medical") },
  { title: "ブラックジャックによろしく", type: "manga", classification: mc("manga", "seinen", "medical") },
  { title: "医龍", type: "manga", classification: mc("manga", "seinen", "medical") },
  { title: "JIN-仁-", type: "manga", classification: mc("manga", "seinen", "medical") },
  { title: "テセウスの船", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "ミステリと言う勿れ", type: "manga", classification: mc("manga", "shojo", "mystery") },
  { title: "パーフェクトワールド", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "薬屋のひとりごと 新装", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "マイホームヒーロー", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "もやしもん", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "ヒナまつり", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "坂本ですが?", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "男子高校生の日常 漫画", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "日常 漫画", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "月刊少女野崎くん", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "魔入りました!入間くん", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "あたしンち", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "サザエさん 漫画", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "かくしごと 漫画", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "スケットダンス", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "べるぜバブ", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "こちら椿産婦人科", type: "manga", classification: mc("manga", "seinen", "medical") },
  { title: "ゴッドハンド輝", type: "manga", classification: mc("manga", "shonen", "medical") },
  { title: "イキガミ", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "LIAR GAME 漫画 新装版", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "嘘喰い 漫画 新装版", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "エリアの騎士", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "ホイッスル!", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "DEAR BOYS", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "スラムダンク 新装再編版", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "ミスター味っ子", type: "manga", classification: mc("manga", "shonen", "gourmet") },
  { title: "中華一番!", type: "manga", classification: mc("manga", "shonen", "gourmet") },
  { title: "食キング", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "ワカコ酒 新装版", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "山と食欲と私 新装版", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "バンビ～ノ!", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "シドニアの騎士", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "テルマエ・ロマエ", type: "manga", classification: mc("manga", "seinen", "comedy") },

  // ═══ 小説 追加（目標+30以上） ═══
  { title: "夜の底は柔らかな幻 恩田陸", type: "novel", classification: mc("novel", "literary", "fantasy") },
  { title: "チョコレートコスモス 恩田陸", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "蛇行する月 桜木紫乃", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "対岸の彼女 角田光代", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "八日目の蝉 角田光代", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "紙の月 角田光代", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "孤狼の血 柚月裕子", type: "novel", classification: mc("novel", "mystery", "hardboiled") },
  { title: "ストロベリーナイト 誉田哲也", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "64 横山秀夫 上", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "クライマーズ・ハイ 横山秀夫", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "第三の時効 横山秀夫", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "動機 横山秀夫", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "テロリストのパラソル 藤原伊織", type: "novel", classification: mc("novel", "mystery", "hardboiled") },
  { title: "犬はどこだ 米澤穂信", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "ボトルネック 米澤穂信", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "儚い羊たちの祝宴 米澤穂信", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "さよなら妖精 米澤穂信", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "リカーシブル 米澤穂信", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "春期限定いちごタルト事件 米澤穂信", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "スロウハイツの神様 辻村深月", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "名前探しの放課後 辻村深月", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "冷たい校舎の時は止まる 辻村深月", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "噓つきアーニャの真っ赤な真実 米原万里", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "ひとり暮らし 谷川俊太郎", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "ぼくのメジャースプーン 辻村深月", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "家族シアター 辻村深月", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "琥珀の夏 辻村深月", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "傲慢と善良 辻村深月", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "ファーストラヴ 島本理生", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "あの花が咲く丘で、君とまた出会えたら", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "余命10年 小坂流加", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "そして、バトンは渡された 瀬尾まいこ", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "ミッドナイト・バス 伊吹有喜", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "赤い指 東野圭吾", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "プラチナデータ 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "白鳥とコウモリ 東野圭吾", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "疾風ロンド 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "ナミヤ雑貨店の奇蹟 東野圭吾 新装", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "十二国記 風の海 迷宮の岸", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
  { title: "精霊の守り人 上橋菜穂子", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
  { title: "獣の奏者 上橋菜穂子", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
];

async function fetchByTitle(title: string, type: "manga" | "novel"): Promise<any | null> {
  const typeKeyword = type === "manga" ? "漫画" : "小説";
  const query = `intitle:${title} ${typeKeyword}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      console.log(`    [Retry ${attempt}] waiting 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
    const res = await fetch(url);
    if (!res.ok) {
      if (attempt === 0 && (res.status === 503 || res.status === 429)) continue;
      console.log(`    [Google Books] HTTP ${res.status}`); return null;
    }
    const data = (await res.json()) as any;
    if (!data.items) return null;

    const normalizedTitle = title.replace(/\s+[^\s]*$/g, "").replace(/[\s　]*[（(【「].*/g, "").replace(/\s+/g, "").trim();
    const candidates = data.items.filter((item: any) => {
      const t: string = (item.volumeInfo?.title ?? "").replace(/\s+/g, "");
      return t.includes(normalizedTitle) || normalizedTitle.includes(t);
    });
    if (candidates.length === 0) return null;
    candidates.sort((a: any, b: any) => {
      const score = (item: any) => {
        const t: string = item.volumeInfo?.title ?? "";
        let s = 0;
        if (t.replace(/\s+/g, "") === normalizedTitle) s += 10;
        if (/[（(][１1][）)]/.test(t)) s += 8;
        if (/[　\s][１1]$/.test(t)) s += 7;
        if (item.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13")) s += 3;
        return s - t.length * 0.1;
      };
      return score(b) - score(a);
    });
    return candidates[0];
  }
  return null;
}

function buildEntry(item: any, title: string, type: "manga" | "novel", classification: ManualClassification): BookEntry {
  const info = item.volumeInfo;
  const isbn13 = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
  const id = isbn13 ?? item.id;
  const bookTitle: string = info.title ?? title;
  const keywords = type === "manga" ? ["漫画", "コミック"] : ["小説"];
  return {
    id, title: bookTitle, ...(info.subtitle ? { subtitle: info.subtitle } : {}),
    authors: info.authors ?? [],
    ...(info.publisher ? { publisher: info.publisher } : {}),
    ...(info.publishedDate ? { publishedDate: info.publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}), language: info.language ?? "ja",
    ...(info.pageCount ? { pageCount: info.pageCount } : {}),
    categories: type === "manga" ? ["漫画"] : ["小説"], keywords,
    searchableText: [bookTitle, info.subtitle, ...(info.authors ?? []), info.publisher ?? "", ...keywords].filter(Boolean).join(" "),
    ...(info.imageLinks?.thumbnail ? { thumbnailUrl: info.imageLinks.thumbnail.replace("http://", "https://") } : {}),
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
  console.log(`📋  ${WORK_LIST.length} targets`);

  for (let i = 0; i < WORK_LIST.length; i++) {
    const target = WORK_LIST[i];
    const ns = target.title.replace(/\s+[^\s]+$/g, "").replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();

    if (existingTitles.has(ns)) { skipped++; continue; }

    console.log(`[${i + 1}] 🔍 ${target.title}`);
    const item = await fetchByTitle(target.title, target.type);
    if (!item) { console.log(`    ⚠ miss`); notFound++; continue; }

    const entry = buildEntry(item, target.title, target.type, target.classification);
    if (existingIds.has(entry.id)) {
      const existing = books.find((b) => b.id === entry.id);
      if (existing && !existing.manualClassification?.l1Id) {
        existing.manualClassification = target.classification;
        console.log(`    ✏ classified: ${existing.title}`); added++;
      } else { skipped++; }
      continue;
    }

    books.push(entry);
    existingIds.add(entry.id);
    existingTitles.add(ns);
    console.log(`    ✅ ${entry.title}`); added++;
    await new Promise((r) => setTimeout(r, 1200));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n✅ +${added} / skip ${skipped} / miss ${notFound} / total ${books.length}`);
}

main().catch(console.error);
