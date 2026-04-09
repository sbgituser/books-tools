#!/usr/bin/env tsx
/**
 * add-manga-100-batch6.ts
 * 漫画100作品をタイトル検索でGoogle Books APIから取得して
 * books.index.json に追加するスクリプト
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
// API キーが日次クォータ超過の場合はキーなしで実行
const USE_API_KEY = false; // クォータ枯渇時はfalseに設定

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
  // ═══ 少年漫画（バトル・冒険）: 20作品 ═══
  { title: "D.Gray-man", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "スプリガン", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "血界戦線", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "GetBackers -奪還屋-", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "ロザリオとバンパイア", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "地獄先生ぬ〜べ〜", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "忍空", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "史上最強の弟子ケンイチ", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "出会って5秒でバトル", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "文豪ストレイドッグス", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "ホーリーランド", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "クローズ", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "WORST", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "デッドマウント・デスプレイ", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "バイオレンスジャック", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "エンジェルハート", type: "manga", classification: buildClassification("青年漫画", "バトル") },
  { title: "キャッツアイ", type: "manga", classification: buildClassification("少年漫画", "バトル") },
  { title: "よふかしのうた", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "レベルE", type: "manga", classification: buildClassification("少年漫画", "SF") },
  { title: "双亡亭壊すべし", type: "manga", classification: buildClassification("少年漫画", "バトル") },

  // ═══ 少年漫画（スポーツ）: 10作品 ═══
  { title: "ウインドブレイカー", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "メジャーセカンド", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "もういっぽん!", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "灼熱カバディ", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "さよなら私のクラマー", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "ホイッスル!", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "オーバードライブ", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "ファンタジスタ", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "フットボールネーション", type: "manga", classification: buildClassification("青年漫画", "スポーツ") },
  { title: "ハリガネサービス", type: "manga", classification: buildClassification("少年漫画", "スポーツ") },

  // ═══ 少女漫画・恋愛: 15作品 ═══
  { title: "ヒロイン失格", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "僕等がいた", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "ホットギミック", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "きょうは会社休みます。", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "コーヒー&バニラ", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "ハニーレモンソーダ", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "PとJK", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "ときめきトゥナイト", type: "manga", classification: buildClassification("少女漫画", "ファンタジー") },
  { title: "ぼくの地球を守って", type: "manga", classification: buildClassification("少女漫画", "SF") },
  { title: "神風怪盗ジャンヌ", type: "manga", classification: buildClassification("少女漫画", "ファンタジー") },
  { title: "わたしの幸せな結婚", type: "manga", classification: buildClassification("少女漫画", "恋愛") },
  { title: "私がモテてどうすんだ", type: "manga", classification: buildClassification("少女漫画", "ラブコメ") },
  { title: "覆面系ノイズ", type: "manga", classification: buildClassification("少女漫画", "音楽") },
  { title: "恋は雨上がりのように", type: "manga", classification: buildClassification("青年漫画", "恋愛") },
  { title: "ふしぎ遊戯", type: "manga", classification: buildClassification("少女漫画", "ファンタジー") },

  // ═══ 青年漫画（サスペンス・ドラマ）: 15作品 ═══
  { title: "サンクチュアリ", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "健康で文化的な最低限度の生活", type: "manga", classification: buildClassification("青年漫画", "日常") },
  { title: "善悪の屑", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "正直不動産", type: "manga", classification: buildClassification("青年漫画", "日常") },
  { title: "青のフラッグ", type: "manga", classification: buildClassification("青年漫画", "青春") },
  { title: "ザ・ワールド・イズ・マイン", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "最強伝説黒沢", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "BEASTARS", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "憂国のモリアーティ", type: "manga", classification: buildClassification("少年漫画", "ミステリー") },
  { title: "夏目アラタの結婚", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "来世は他人がいい", type: "manga", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "仁 JIN", type: "manga", classification: buildClassification("青年漫画", "歴史") },
  { title: "波よ聞いてくれ", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "ドクターK", type: "manga", classification: buildClassification("少年漫画", "医療") },
  { title: "アグネス仮面", type: "manga", classification: buildClassification("青年漫画", "コメディ") },

  // ═══ ファンタジー・異世界: 10作品 ═══
  { title: "転生したら剣でした", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "とんでもスキルで異世界放浪メシ", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "勇者が死んだ!", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "異世界食堂", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "ソマリと森の神様", type: "manga", classification: buildClassification("青年漫画", "ファンタジー") },
  { title: "アリスと蔵六", type: "manga", classification: buildClassification("青年漫画", "ファンタジー") },
  { title: "ランドリオール", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "東京ミュウミュウ", type: "manga", classification: buildClassification("少女漫画", "ファンタジー") },
  { title: "ARIA", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "ロトの紋章", type: "manga", classification: buildClassification("少年漫画", "ファンタジー") },

  // ═══ 日常・コメディ: 10作品 ═══
  { title: "しろくまカフェ", type: "manga", classification: buildClassification("少女漫画", "日常") },
  { title: "極主夫道", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "古見さんはコミュ症です", type: "manga", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "僕の心のヤバいやつ", type: "manga", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "ハイスコアガール", type: "manga", classification: buildClassification("青年漫画", "ラブコメ") },
  { title: "ReLIFE", type: "manga", classification: buildClassification("青年漫画", "青春") },
  { title: "パリピ孔明", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "百姓貴族", type: "manga", classification: buildClassification("青年漫画", "コメディ") },
  { title: "トニカクカワイイ", type: "manga", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "先輩がうざい後輩の話", type: "manga", classification: buildClassification("青年漫画", "ラブコメ") },

  // ═══ SF・ミステリー: 10作品 ═══
  { title: "PSYCHO-PASS", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "STEINS;GATE", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "虚構推理", type: "manga", classification: buildClassification("少年漫画", "ミステリー") },
  { title: "すべてがFになる", type: "manga", classification: buildClassification("青年漫画", "ミステリー") },
  { title: "EDEN", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "ORIGIN", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "機動戦士ガンダム THE ORIGIN", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "度胸星", type: "manga", classification: buildClassification("青年漫画", "SF") },
  { title: "逆転裁判", type: "manga", classification: buildClassification("少年漫画", "ミステリー") },
  { title: "金田一37歳の事件簿", type: "manga", classification: buildClassification("青年漫画", "ミステリー") },

  // ═══ ホラー・グルメ・歴史など: 10作品 ═══
  { title: "ジンメン", type: "manga", classification: buildClassification("少年漫画", "ホラー") },
  { title: "将太の寿司", type: "manga", classification: buildClassification("少年漫画", "グルメ") },
  { title: "あさきゆめみし", type: "manga", classification: buildClassification("少女漫画", "歴史") },
  { title: "どろろ", type: "manga", classification: buildClassification("少年漫画", "ダークファンタジー") },
  { title: "ジャガーン", type: "manga", classification: buildClassification("青年漫画", "ホラー") },
  { title: "累", type: "manga", classification: buildClassification("青年漫画", "ホラー") },
  { title: "味いちもんめ", type: "manga", classification: buildClassification("青年漫画", "グルメ") },
  { title: "忘却のサチコ", type: "manga", classification: buildClassification("青年漫画", "グルメ") },
  { title: "衛宮さんちの今日のごはん", type: "manga", classification: buildClassification("少年漫画", "グルメ") },
  { title: "ダンピアのおいしい冒険", type: "manga", classification: buildClassification("青年漫画", "歴史") },
];

/** タイトルでGoogle Books APIを検索（リトライ付き） */
async function fetchByTitle(title: string): Promise<any | null> {
  const query = `intitle:${title} 漫画`;
  const keyParam = USE_API_KEY && API_KEY ? `&key=${API_KEY}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20${keyParam}`;

  let lastStatus = 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      const wait = 2000 * Math.pow(2, attempt); // 4s, 8s, 16s, 32s
      console.log(`    ⏳  リトライ ${attempt}/4 (${wait / 1000}s 待機)...`);
      await new Promise((r) => setTimeout(r, wait));
    }
    const res = await fetch(url);
    if (res.status === 429) {
      lastStatus = 429;
      continue;
    }
    if (!res.ok) {
      console.log(`    [Google Books] HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as any;
    if (!data.items) return null;

    // 成功 — 以降のフィルタ処理へ
    return filterCandidates(data, title);
  }
  console.log(`    [Google Books] HTTP ${lastStatus} (リトライ上限)`);
  return null;
}

function filterCandidates(data: any, title: string): any | null {

  // タイトルの主要部分を抽出
  const normalizedTitle = title.replace(/[\s　]*[（(【「].*/g, "").replace(/\s+/g, "").trim();

  const candidates = data.items.filter((item: any) => {
    const t: string = (item.volumeInfo?.title ?? "").replace(/\s+/g, "");
    return t.includes(normalizedTitle) || normalizedTitle.includes(t);
  });

  if (candidates.length === 0) return null;

  // スコアリング
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
  return candidates[0] ?? null;
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
    const item = await fetchByTitle(target.title);

    if (!item) {
      console.log(`    ⚠  見つかりません: ${target.title}`);
      notFound++;
      continue;
    }

    const entry = buildEntry(item, target.title, target.classification);

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
    console.log(`    ✅  追加: ${entry.title} (${entry.id}) [${target.classification.l2Id}/${target.classification.l3Id}]`);
    added++;

    // レート制限対策 (1500ms)
    await new Promise((r) => setTimeout(r, 1500));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`✅  完了: 追加/更新 ${added}件 / スキップ ${skipped}件 / 未発見 ${notFound}件`);
  console.log(`📚  合計: ${books.length}件`);
}

main().catch(console.error);
