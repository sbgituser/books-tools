#!/usr/bin/env tsx
/**
 * add-batch-200-part5.ts - 最終追加バッチ（漫画+28、小説+16 を目指す）
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
if (!API_KEY) { console.error("GOOGLE_BOOKS_API_KEY missing"); process.exit(1); }
const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface MC { l1Id: string; l2Id: string; l3Id: string; }
interface BookEntry {
  id: string; title: string; subtitle?: string; authors: string[];
  publisher?: string; publishedDate?: string; isbn13?: string; language: string;
  pageCount?: number; categories: string[]; keywords: string[]; searchableText: string;
  thumbnailUrl?: string; sourceIds: { googleBooksId?: string }; updatedAt: string;
  manualClassification: MC;
}
interface WT { title: string; type: "manga" | "novel"; classification: MC; }
function mc(l1: string, l2: string, l3: string): MC { return { l1Id: l1, l2Id: l2, l3Id: l3 }; }

const WORK_LIST: WT[] = [
  // 漫画 新規追加
  { title: "ドラゴンクエスト ダイの大冒険 新装彩録版", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "ジャングルの王者ターちゃん", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "まことちゃん", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "おぼっちゃまくん", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "ギャグマンガ日和", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "ハレのちグゥ", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "瀬戸の花嫁 漫画", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "覚悟のススメ", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "真島ヒロ FAIRY TAIL 100 YEARS QUEST", type: "manga", classification: mc("manga", "shonen", "fantasy") },
  { title: "鬼灯の冷徹", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "バキ", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "グラップラー刃牙", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "刃牙道", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "バキ道", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "喧嘩稼業", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "ケンガンアシュラ", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "バジリスク 甲賀忍法帖", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "彼岸島 最後の47日間", type: "manga", classification: mc("manga", "seinen", "horror") },
  { title: "アイアムアヒーロー", type: "manga", classification: mc("manga", "seinen", "horror") },
  { title: "食糧人類", type: "manga", classification: mc("manga", "seinen", "horror") },
  { title: "約束のネバーランド 新装版", type: "manga", classification: mc("manga", "shonen", "mystery") },
  { title: "DEATH NOTE 新装版 カラー", type: "manga", classification: mc("manga", "shonen", "mystery") },
  { title: "プラチナエンド", type: "manga", classification: mc("manga", "shonen", "fantasy") },
  { title: "バクマン。 新装版", type: "manga", classification: mc("manga", "shonen", "youth") },
  { title: "ぬ～べ～NEO", type: "manga", classification: mc("manga", "shonen", "horror") },
  { title: "夜叉", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "烈火の炎 新装版", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "幽遊白書 新装版", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "マテリアル・パズル", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "みどりのマキバオー", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "天上天下", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "TOUGH タフ", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "拳闘暗黒伝セスタス", type: "manga", classification: mc("manga", "seinen", "sports") },
  { title: "ヴァンパイア騎士", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "極黒のブリュンヒルデ", type: "manga", classification: mc("manga", "shonen", "sf") },
  { title: "エルフェンリート", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "CLAYMORE", type: "manga", classification: mc("manga", "shonen", "dark_fantasy") },
  { title: "Dグレイマン 新装版", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "HUNTER×HUNTER 新装版", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "ヤングブラック・ジャック", type: "manga", classification: mc("manga", "seinen", "medical") },
  { title: "フラジャイル", type: "manga", classification: mc("manga", "seinen", "medical") },
  { title: "ラジエーションハウス", type: "manga", classification: mc("manga", "seinen", "medical") },
  { title: "ダイヤのA act2", type: "manga", classification: mc("manga", "shonen", "sports") },

  // 小説 新規追加
  { title: "すべてがFになる 森博嗣", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "冷たい密室と博士たち 森博嗣", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "笑わない数学者 森博嗣", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "詩的私的ジャック 森博嗣", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "封印再度 森博嗣", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "幻惑の死と使途 森博嗣", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "月光ゲーム 有栖川有栖", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "孤島パズル 有栖川有栖", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "双頭の悪魔 有栖川有栖", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "女王国の城 有栖川有栖", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "マレー鉄道の謎 有栖川有栖", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "ロシア紅茶の謎 有栖川有栖", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "犬神家の一族 横溝正史", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "八つ墓村 横溝正史", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "獄門島 横溝正史", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "本陣殺人事件 横溝正史", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "悪魔の手毬唄 横溝正史", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "緋色の研究 シャーロック・ホームズ", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "さよならドビュッシー 中山七里", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "贖罪の奏鳴曲 中山七里", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "テミスの剣 中山七里", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "占星術殺人事件 島田荘司", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "斜め屋敷の犯罪 島田荘司", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "異邦の騎士 島田荘司", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "三毛猫ホームズの推理 赤川次郎", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "セーラー服と機関銃 赤川次郎", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "家庭教師ヒットマン小説", type: "novel", classification: mc("novel", "light_novel", "battle") },
  { title: "アルスラーン戦記 新装版", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
  { title: "ナルニア国物語 銀のいす", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
  { title: "ハリー・ポッターと秘密の部屋", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
  { title: "ハリー・ポッターとアズカバンの囚人", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
  { title: "ハリー・ポッターと炎のゴブレット", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
];

async function fetchByTitle(title: string, type: "manga" | "novel"): Promise<any | null> {
  const typeKeyword = type === "manga" ? "漫画" : "小説";
  const query = `intitle:${title} ${typeKeyword}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 5000));
    try {
      const res = await fetch(url);
      if (!res.ok) { if (res.status === 503 || res.status === 429) continue; return null; }
      const data = (await res.json()) as any;
      if (!data.items) return null;
      const nt = title.replace(/\s+[^\s]*$/g, "").replace(/[\s　]*[（(【「].*/g, "").replace(/\s+/g, "").trim();
      const cands = data.items.filter((i: any) => { const t = (i.volumeInfo?.title ?? "").replace(/\s+/g, ""); return t.includes(nt) || nt.includes(t); });
      if (!cands.length) return null;
      cands.sort((a: any, b: any) => {
        const sc = (x: any) => { const t = x.volumeInfo?.title ?? ""; let s = 0; if (t.replace(/\s+/g, "") === nt) s += 10; if (/[（(][１1][）)]/.test(t)) s += 8; if (x.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13")) s += 3; return s - t.length * 0.1; };
        return sc(b) - sc(a);
      });
      return cands[0];
    } catch { continue; }
  }
  return null;
}

function buildEntry(item: any, type: "manga" | "novel", classification: MC): BookEntry {
  const info = item.volumeInfo;
  const isbn13 = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
  const id = isbn13 ?? item.id;
  const keywords = type === "manga" ? ["漫画", "コミック"] : ["小説"];
  return {
    id, title: info.title ?? "", ...(info.subtitle ? { subtitle: info.subtitle } : {}),
    authors: info.authors ?? [], ...(info.publisher ? { publisher: info.publisher } : {}),
    ...(info.publishedDate ? { publishedDate: info.publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}), language: info.language ?? "ja",
    ...(info.pageCount ? { pageCount: info.pageCount } : {}),
    categories: type === "manga" ? ["漫画"] : ["小説"], keywords,
    searchableText: [info.title, info.subtitle, ...(info.authors ?? []), info.publisher ?? "", ...keywords].filter(Boolean).join(" "),
    ...(info.imageLinks?.thumbnail ? { thumbnailUrl: info.imageLinks.thumbnail.replace("http://", "https://") } : {}),
    sourceIds: { googleBooksId: item.id }, updatedAt: new Date().toISOString(), manualClassification: classification,
  };
}

async function main() {
  const books: BookEntry[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  const existingIds = new Set(books.map(b => b.id));
  const existingTitles = new Set(books.filter(b => b.manualClassification?.l1Id).map(b => b.title.replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase()));
  let added = 0, skipped = 0, notFound = 0;
  console.log(`📋 ${WORK_LIST.length} targets`);
  for (let i = 0; i < WORK_LIST.length; i++) {
    const t = WORK_LIST[i];
    const ns = t.title.replace(/\s+[^\s]+$/g, "").replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();
    if (existingTitles.has(ns)) { skipped++; continue; }
    console.log(`[${i+1}] 🔍 ${t.title}`);
    const item = await fetchByTitle(t.title, t.type);
    if (!item) { console.log(`    ⚠ miss`); notFound++; continue; }
    const entry = buildEntry(item, t.type, t.classification);
    if (existingIds.has(entry.id)) {
      const ex = books.find(b => b.id === entry.id);
      if (ex && !ex.manualClassification?.l1Id) { ex.manualClassification = t.classification; added++; } else { skipped++; }
      continue;
    }
    books.push(entry); existingIds.add(entry.id); existingTitles.add(ns);
    console.log(`    ✅ ${entry.title}`); added++;
    await new Promise(r => setTimeout(r, 1500));
  }
  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n✅ +${added} / skip ${skipped} / miss ${notFound} / total ${books.length}`);
}
main().catch(console.error);
