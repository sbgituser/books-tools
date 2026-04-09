#!/usr/bin/env tsx
/**
 * add-manga-100-batch6.ts
 * 漫画100作品をタイトル検索でGoogle Books APIから取得して
 * books.index.json に追加するスクリプト (batch 6)
 */

import * as fs from "fs";
import * as path from "path";

// scripts/.env を手動ロード
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
if (!API_KEY) {
  console.error("GOOGLE_BOOKS_API_KEY が設定されていません");
  process.exit(1);
}

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
  type: "manga";
  classification: ManualClassification;
}

function buildClassification(l2Label: string, l3Label: string): ManualClassification {
  let l2Id: string;
  if (l2Label === "少年漫画") l2Id = "shonen";
  else if (l2Label === "少女漫画") l2Id = "shojo";
  else if (l2Label === "青年漫画") l2Id = "seinen";
  else l2Id = "general";

  let finalL2 = l2Id;
  let l3Id: string;

  if (l3Label === "スポーツ") { finalL2 = "shonen"; l3Id = "sports"; }
  else if (l3Label === "ラブコメ") { finalL2 = "shojo"; l3Id = "romcom"; }
  else if (l3Label === "恋愛") { finalL2 = "shojo"; l3Id = "romance"; }
  else if (l3Label === "ファンタジー") { l3Id = "fantasy"; }
  else if (l3Label === "ダークファンタジー") { l3Id = "dark_fantasy"; }
  else if (l3Label === "SF") { l3Id = "sf"; }
  else if (l3Label === "バトル") { l3Id = "battle"; }
  else if (l3Label === "ギャグ" || l3Label === "コメディ") { l3Id = "comedy"; }
  else if (l3Label === "日常") { l3Id = "daily_life"; }
  else if (l3Label === "ミステリー" || l3Label === "サスペンス") { l3Id = "mystery"; }
  else if (l3Label === "ホラー") { l3Id = "horror"; }
  else if (l3Label === "歴史") { l3Id = "history"; }
  else if (l3Label === "料理" || l3Label === "グルメ") { l3Id = "gourmet"; }
  else if (l3Label === "音楽") { l3Id = "music"; }
  else if (l3Label === "医療") { l3Id = "medical"; }
  else if (l3Label === "学園") { l3Id = "school"; }
  else if (l3Label === "青春") { l3Id = "youth"; }
  else { l3Id = "other"; }

  return { l1Id: "manga", l2Id: finalL2, l3Id };
}

const WORK_LIST: WorkTarget[] = [
  // ═══ 少年漫画 - バトル・冒険 (20作品) ═══
  { title: "ブラックキャット", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "ウィンドブレイカー", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "クローズ", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "WORST", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "惑星のさみだれ", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "スプリガン", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "3×3EYES", type: "manga", classification: buildClassification("少年漫画", "ダークファンタジー") },
  { title: "忍空", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "冒険王ビィト", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "ラディアン", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "テンカイチ", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "戦隊大失格", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "SAMURAI DEEPER KYO", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "バスタード!!", type: "manga", classification: buildClassification("少年漫画", "ダークファンタジー") },
  { title: "GS美神極楽大作戦!!", type: "manga", classification: buildClassification("少年漫画", "コメディ") },
  { title: "エンジェルハート", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "絶対可憐チルドレン", type: "manga", classification: buildClassification("少年漫画", "SF") },
  { title: "ヘルク", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "サンケンロック", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "GetBackers 奪還屋", type: "manga", classification: buildClassification("少年漫画", "バトル") },

  // ═══ 少年漫画 - スポーツ (13作品) ═══
  { title: "DAYS", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "ALL OUT!!", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "もういっぽん!", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "MIX", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "シュート!", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "帯をギュッとね!", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "柔道部物語", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "六三四の剣", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "クロス・ゲーム", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "H2", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "ANGEL VOICE", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "ウマ娘シンデレラグレイ", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "ワンダンス", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },

  // ═══ 少女漫画・恋愛 (15作品) ═══
  { title: "イタズラなKiss", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "天は赤い河のほとり", type: "manga", classification: buildClassification("少女漫画", "ファンタジー") },
  { title: "こどものおもちゃ", type: "manga", classification: buildClassification("少女漫画", "コメディ") },
  { title: "天使なんかじゃない", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "有閑倶楽部", type: "manga", classification: buildClassification("少女漫画", "コメディ") },
  { title: "ホットギミック", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "砂時計", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "僕の初恋をキミに捧ぐ", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "溺れるナイフ", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "ピーチガール", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "虹色デイズ", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "正反対な君と僕", type: "manga", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "ヤンキー君と白杖ガール", type: "manga", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "僕の心のヤバイやつ", type: "manga", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "九龍ジェネリックロマンス", type: "manga", classification: buildClassification("青年漫画", "恋愛") },

  // ═══ 青年漫画 - サスペンス・ドラマ (15作品) ═══
  { title: "ブラックラグーン", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "軍鶏", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "シグルイ", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "チ。―地球の運動について―", type: "manga", classification: buildClassification("青年漫画", "歴史") },
  { title: "自殺島", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "なれの果ての僕ら", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "ジャンケットバンク", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "おかえりアリス", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "女の園の星", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "喧嘩商売", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "ナニワ金融道", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "ミナミの帝王", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "ナンバMG5", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "高校鉄拳伝タフ", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "マチネとソワレ", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },

  // ═══ ファンタジー・異世界 (10作品) ═══
  { title: "株式会社マジルミエ", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "魔法少女にあこがれて", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "甲賀忍法帖 バジリスク", type: "manga", classification: buildClassification("青年漫画", "ダークファンタジー") },
  { title: "嘆きの亡霊は引退したい", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "天幕のジャードゥーガル", type: "manga", classification: buildClassification("青年漫画", "ファンタジー") },
  { title: "ハクメイとミコチ", type: "manga", classification: buildClassification("青年漫画", "ファンタジー") },
  { title: "Thisコミュニケーション", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "ARIA", type: "manga", classification: buildClassification("青年漫画", "ファンタジー") },
  { title: "100人の彼女", type: "manga", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "ワンルームエンジェル", type: "manga", classification: buildClassification("青年漫画", "恋愛") },

  // ═══ 日常・コメディ (10作品) ═══
  { title: "ひらやすみ", type: "manga", classification: buildClassification("青年漫画", "日常") },
  { title: "税金で買った本", type: "manga", classification: buildClassification("青年漫画", "日常") },
  { title: "スーパーの裏でヤニ吸うふたり", type: "manga", classification: buildClassification("青年漫画", "日常") },
  { title: "スナックバス江", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "1日外出録ハンチョウ", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "中間管理録トネガワ", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "放課後ていぼう日誌", type: "manga", classification: buildClassification("青年漫画", "日常") },
  { title: "ヨコハマ買い出し紀行", type: "manga", classification: buildClassification("青年漫画", "日常") },
  { title: "久保さんは僕を許さない", type: "manga", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "しあわせは食べて寝て待て", type: "manga", classification: buildClassification("青年漫画", "日常") },

  // ═══ SF・ミステリー (10作品) ═══
  { title: "未来日記", type: "manga", classification: buildClassification("少年漫画", "SF") },
  { title: "刻刻", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "ブラック・ジャック", type: "manga", classification: buildClassification("青年漫画", "医療") },
  { title: "MOONLIGHT MILE", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "怪獣自衛隊", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "ジパング", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "沈黙の艦隊", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "空母いぶき", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "ラストカルテ", type: "manga", classification: buildClassification("少年漫画", "医療") },
  { title: "レベルE", type: "manga", classification: buildClassification("少年漫画", "SF") },

  // ═══ ホラー・グルメ・歴史 (7作品) ═══
  { title: "鉄鍋のジャン", type: "manga", classification: buildClassification("少年漫画", "料理") },
  { title: "ラーメン才遊記", type: "manga", classification: buildClassification("青年漫画", "グルメ") },
  { title: "アサギロ", type: "manga", classification: buildClassification("青年漫画", "歴史") },
  { title: "アポカリプスの砦", type: "manga", classification: buildClassification("少年漫画", "ホラー") },
  { title: "2.5次元の誘惑", type: "manga", classification: buildClassification("少年漫画", "学園") },
  { title: "刷ったもんだ!", type: "manga", classification: buildClassification("青年漫画", "日常") },
  { title: "ゴッドハンド輝", type: "manga", classification: buildClassification("少年漫画", "医療") },
];

let apiQuotaExhausted = false;
let consecutiveFailures = 0;

/** タイトルでGoogle Books APIを検索 (リトライ付き) */
async function fetchByTitle(title: string): Promise<{ item: any; fromApi: boolean } | null> {
  if (apiQuotaExhausted) return null;

  const query = `intitle:${title} 漫画`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;

  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      const wait = Math.min(2000 * Math.pow(2, attempt), 15000);
      console.log(`    ⏳ リトライ ${attempt}/2 (${wait}ms待機)...`);
      await new Promise((r) => setTimeout(r, wait));
    }
    const res = await fetch(url);
    lastStatus = res.status;
    if (res.ok) {
      consecutiveFailures = 0;
      const data = (await res.json()) as any;
      const result = processResults(data, title);
      return result ? { item: result, fromApi: true } : null;
    }
    if (res.status !== 429 && res.status !== 503) break;
  }

  consecutiveFailures++;
  if (consecutiveFailures >= 3 && lastStatus === 429) {
    console.log(`    ⚠ API日次クォータ超過 - フォールバックモードに切替`);
    apiQuotaExhausted = true;
  }
  return null;
}

function processResults(data: any, title: string): any | null {
  if (!data.items) return null;

  const normalizedTitle = title.replace(/[\s　]*[（(【「].*/g, "").replace(/\s+/g, "").trim();

  const candidates = data.items.filter((item: any) => {
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

function buildEntry(
  item: any,
  title: string,
  classification: ManualClassification
): BookEntry {
  const info = item.volumeInfo;
  const isbn13 =
    info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
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

  const keywords = ["漫画", "コミック"];
  const searchableText = [bookTitle, subtitle, ...authors, publisher ?? "", ...keywords]
    .filter(Boolean)
    .join(" ");

  return {
    id,
    title: bookTitle,
    ...(subtitle ? { subtitle } : {}),
    authors,
    ...(publisher ? { publisher } : {}),
    ...(publishedDate ? { publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}),
    language: info.language ?? "ja",
    ...(pageCount ? { pageCount } : {}),
    categories: ["漫画"],
    keywords,
    searchableText,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    sourceIds: { googleBooksId: item.id },
    updatedAt: new Date().toISOString(),
    manualClassification: classification,
  };
}

/** API不使用時のフォールバックエントリ作成 */
function buildFallbackEntry(
  title: string,
  classification: ManualClassification
): BookEntry {
  const id = `manga-batch6-${title.replace(/[^a-zA-Z0-9\u3000-\u9FFF]/g, "").substring(0, 30)}`;
  const keywords = ["漫画", "コミック"];
  const searchableText = [title, ...keywords].join(" ");

  return {
    id,
    title,
    authors: [],
    language: "ja",
    categories: ["漫画"],
    keywords,
    searchableText,
    sourceIds: {},
    updatedAt: new Date().toISOString(),
    manualClassification: classification,
  };
}

async function main() {
  const books: BookEntry[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  const existingIds = new Set(books.map((b) => b.id));
  const existingTitles = new Set(
    books
      .filter((b) => b.manualClassification?.l1Id)
      .map((b) => b.title.replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase())
  );

  let added = 0;
  let skipped = 0;
  let notFound = 0;

  console.log(`\n📋  対象: 漫画 ${WORK_LIST.length}作品`);
  console.log("──────────────────────────────────────────────────");

  for (let i = 0; i < WORK_LIST.length; i++) {
    const target = WORK_LIST[i];
    const normalizedSearch = target.title.replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();

    // タイトルで既存チェック
    if (existingTitles.has(normalizedSearch)) {
      console.log(`[${i + 1}/${WORK_LIST.length}] ⏭  スキップ（既存）: ${target.title}`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${WORK_LIST.length}] 🔍  検索: ${target.title}`);
    const result = await fetchByTitle(target.title);

    let entry: BookEntry;
    if (result) {
      entry = buildEntry(result.item, target.title, target.classification);
    } else {
      // API不使用時はフォールバックエントリを作成
      entry = buildFallbackEntry(target.title, target.classification);
      console.log(`    📝  フォールバック: ${target.title}`);
    }

    if (existingIds.has(entry.id)) {
      // IDは既存だが分類がなければ追加
      const existing = books.find((b) => b.id === entry.id);
      if (existing && !existing.manualClassification?.l1Id) {
        existing.manualClassification = target.classification;
        console.log(`    ✏  分類追加: ${existing.title} (${entry.id})`);
        added++;
      } else {
        console.log(`    ⏭  スキップ（ID重複）: ${entry.title} (${entry.id})`);
        skipped++;
      }
      continue;
    }

    books.push(entry);
    existingIds.add(entry.id);
    existingTitles.add(normalizedSearch);
    const src = result ? "API" : "fallback";
    console.log(`    ✅  追加: ${entry.title} (${entry.id}) [${target.classification.l2Id}/${target.classification.l3Id}] (${src})`);
    added++;

    // レート制限対策 (400ms間隔)
    if (!apiQuotaExhausted) await new Promise((r) => setTimeout(r, 400));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`✅  完了: 追加/更新 ${added}件 / スキップ ${skipped}件 / 未発見 ${notFound}件`);
  console.log(`📚  合計: ${books.length}件`);
}

main().catch(console.error);
