#!/usr/bin/env tsx
/**
 * add-batch-200-part2.ts
 * 追加バッチ: 既存作品と重複しない漫画・小説を追加
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
  type: "manga" | "novel";
  classification: ManualClassification;
}

function mc(l1: string, l2: string, l3: string): ManualClassification {
  return { l1Id: l1, l2Id: l2, l3Id: l3 };
}

// ========== 漫画追加リスト (既存と重複しない作品) ==========
// 目標: +90作品
const WORK_LIST: WorkTarget[] = [
  // 少年漫画 - バトル
  { title: "ダイの大冒険", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "烈火の炎", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "うしおととら", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "ぬらりひょんの孫", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "マギ", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "ブラッククローバー", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "武装錬金", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "結界師", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "サイボーグ009", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "聖闘士星矢", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "男塾", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "RAVE", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "トリコ", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "ソウルイーター", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "D.Gray-man", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "双星の陰陽師", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "マッシュル", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "アンデッドアンラック", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "サカモトデイズ", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "夜桜さんちの大作戦", type: "manga", classification: mc("manga", "shonen", "battle") },

  // 少年漫画 - スポーツ
  { title: "黒子のバスケ", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "ROOKIES", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "おおきく振りかぶって", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "アイシールド21", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "クロスゲーム", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "火ノ丸相撲", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "DAYS", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "あひるの空", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "BE BLUES!～青になれ～", type: "manga", classification: mc("manga", "shonen", "sports") },

  // 少年漫画 - ラブコメ
  { title: "いちご100%", type: "manga", classification: mc("manga", "shojo", "romcom") },
  { title: "ぼくたちは勉強ができない", type: "manga", classification: mc("manga", "shojo", "romcom") },
  { title: "ゆらぎ荘の幽奈さん", type: "manga", classification: mc("manga", "shojo", "romcom") },
  { title: "かぐや様は告らせたい", type: "manga", classification: mc("manga", "seinen", "romcom") },
  { title: "からかい上手の高木さん", type: "manga", classification: mc("manga", "shonen", "romcom") },
  { title: "それでも歩は寄せてくる", type: "manga", classification: mc("manga", "shonen", "romcom") },
  { title: "古見さんはコミュ症です", type: "manga", classification: mc("manga", "shonen", "comedy") },

  // 少年漫画 - SF・ファンタジー
  { title: "Dr.スランプ", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "銃夢", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "テラフォーマーズ", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "約束のネバーランド", type: "manga", classification: mc("manga", "shonen", "mystery") },
  { title: "地獄楽", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "サマータイムレンダ", type: "manga", classification: mc("manga", "shonen", "mystery") },
  { title: "ワンパンマン", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "モブサイコ100", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "彼方のアストラ", type: "manga", classification: mc("manga", "shonen", "sf") },

  // 少女漫画
  { title: "アオハライド", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "ストロボ・エッジ", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "俺物語!!", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "orange", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "赤髪の白雪姫", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "桜蘭高校ホスト部", type: "manga", classification: mc("manga", "shojo", "comedy") },
  { title: "となりの怪物くん", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "会長はメイド様!", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "神様はじめました", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "フルムーンをさがして", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "学園アリス", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "彩雲国物語 漫画", type: "manga", classification: mc("manga", "shojo", "fantasy") },

  // 青年漫画
  { title: "ゴルゴ13", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "闇金ウシジマくん", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "ゴールデンカムイ", type: "manga", classification: mc("manga", "seinen", "history") },
  { title: "ドロヘドロ", type: "manga", classification: mc("manga", "seinen", "dark_fantasy") },
  { title: "デッドデッドデーモンズデデデデデストラクション", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "ヒストリエ", type: "manga", classification: mc("manga", "seinen", "history") },
  { title: "ホムンクルス", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "バガボンド", type: "manga", classification: mc("manga", "seinen", "history") },
  { title: "ギャングース", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "ハコヅメ", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "亜人", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "チ。地球の運動について", type: "manga", classification: mc("manga", "seinen", "history") },
  { title: "ブルーピリオド", type: "manga", classification: mc("manga", "seinen", "youth") },
  { title: "リアル", type: "manga", classification: mc("manga", "seinen", "sports") },
  { title: "バクマン。", type: "manga", classification: mc("manga", "shonen", "youth") },
  { title: "ピンポン", type: "manga", classification: mc("manga", "seinen", "sports") },
  { title: "GANTZ", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "いぬやしき", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "監獄学園", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "ゴールデンゴールド", type: "manga", classification: mc("manga", "seinen", "horror") },
  { title: "漂流教室", type: "manga", classification: mc("manga", "shonen", "horror") },
  { title: "彼岸島", type: "manga", classification: mc("manga", "seinen", "horror") },
  { title: "ハンターキラー", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "ジャイアントキリング", type: "manga", classification: mc("manga", "seinen", "sports") },

  // 青年漫画 - グルメ・日常
  { title: "孤独のグルメ", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "ラーメン大好き小泉さん", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "甘々と稲妻", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "深夜食堂", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "クッキングパパ", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "信長のシェフ", type: "manga", classification: mc("manga", "seinen", "gourmet") },

  // ═══ 小説 追加リスト (既存と重複しない作品) ==========
  // 目標: +74作品
  // ミステリー
  { title: "配達あかずきん", type: "novel", classification: mc("novel", "mystery", "daily_life") },
  { title: "オリエント急行の殺人", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "嘘をもうひとつだけ 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "名探偵の掟 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "仮面山荘殺人事件 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "放課後 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "新参者 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "白銀ジャック 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "ガリレオの苦悩 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "麒麟の翼 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "魔力の胎動 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "禁断の魔術 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "透明な螺旋 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "クスノキの番人", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "真夏の方程式 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "夢幻花 東野圭吾", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "パラレルワールド・ラブストーリー 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "使命と魂のリミット 東野圭吾", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "危険なビーナス 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "マスカレード・ナイト 東野圭吾", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "カッコウの卵は誰のもの 東野圭吾", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "虚ろな十字架 東野圭吾", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "人魚の眠る家 東野圭吾", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "片想い 東野圭吾", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "さまよう刃 東野圭吾", type: "novel", classification: mc("novel", "mystery", "social") },

  // 文芸 - 現代作家
  { title: "かがみの孤城 辻村深月", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "ツナグ 辻村深月", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "推し、燃ゆ", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "むらさきのスカートの女", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "正欲 朝井リョウ", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "桐島、部活やめるってよ 朝井リョウ", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "蜜蜂と遠雷 恩田陸", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "六番目の小夜子", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "夜のピクニック 恩田陸", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "流浪の月", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "汝、星のごとく", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "52ヘルツのクジラたち", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "羊と鋼の森", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "蹴りたい背中", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "センセイの鞄", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "風が強く吹いている", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "舟を編む", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "夜は短し歩けよ乙女", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "四畳半神話大系", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "有頂天家族", type: "novel", classification: mc("novel", "literary", "fantasy") },
  { title: "ペンギン・ハイウェイ", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "図書館戦争 有川浩", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "植物図鑑 有川浩", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "レインツリーの国", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "三日間の幸福", type: "novel", classification: mc("novel", "literary", "youth") },

  // ライトノベル
  { title: "やはり俺の青春ラブコメはまちがっている", type: "novel", classification: mc("novel", "light_novel", "daily_life") },
  { title: "とらドラ!", type: "novel", classification: mc("novel", "light_novel", "romance") },
  { title: "青春ブタ野郎はバニーガール先輩の夢を見ない", type: "novel", classification: mc("novel", "light_novel", "daily_life") },
  { title: "デュラララ!!", type: "novel", classification: mc("novel", "light_novel", "battle") },
  { title: "バッカーノ!", type: "novel", classification: mc("novel", "light_novel", "battle") },
  { title: "千歳くんはラムネ瓶のなか", type: "novel", classification: mc("novel", "light_novel", "daily_life") },
  { title: "86 エイティシックス", type: "novel", classification: mc("novel", "light_novel", "battle") },
  { title: "ようこそ実力至上主義の教室へ", type: "novel", classification: mc("novel", "light_novel", "daily_life") },
  { title: "ノーゲーム・ノーライフ", type: "novel", classification: mc("novel", "light_novel", "isekai") },
  { title: "キノの旅", type: "novel", classification: mc("novel", "light_novel", "fantasy") },
  { title: "フルメタル・パニック!", type: "novel", classification: mc("novel", "light_novel", "battle") },
  { title: "スレイヤーズ!", type: "novel", classification: mc("novel", "light_novel", "fantasy") },
  { title: "銀河英雄伝説", type: "novel", classification: mc("novel", "light_novel", "battle") },
  { title: "ブギーポップは笑わない", type: "novel", classification: mc("novel", "light_novel", "battle") },
  { title: "アクセル・ワールド", type: "novel", classification: mc("novel", "light_novel", "battle") },
  { title: "僕は友達が少ない", type: "novel", classification: mc("novel", "light_novel", "daily_life") },
  { title: "冴えない彼女の育てかた", type: "novel", classification: mc("novel", "light_novel", "romance") },
  { title: "りゅうおうのおしごと!", type: "novel", classification: mc("novel", "light_novel", "daily_life") },
  { title: "本好きの下剋上", type: "novel", classification: mc("novel", "light_novel", "isekai") },
  { title: "ゴブリンスレイヤー", type: "novel", classification: mc("novel", "light_novel", "fantasy") },

  // ホラー
  { title: "リング 鈴木光司", type: "novel", classification: mc("novel", "horror", "other") },
  { title: "残穢 小野不由美", type: "novel", classification: mc("novel", "horror", "other") },
  { title: "姑獲鳥の夏 京極夏彦", type: "novel", classification: mc("novel", "horror", "other") },
  { title: "営繕かるかや怪異譚", type: "novel", classification: mc("novel", "horror", "other") },
];

async function fetchByTitle(title: string, type: "manga" | "novel"): Promise<any | null> {
  const typeKeyword = type === "manga" ? "漫画" : "小説";
  const query = `intitle:${title} ${typeKeyword}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`    [Google Books] HTTP ${res.status}`);
    return null;
  }
  const data = (await res.json()) as any;
  if (!data.items) return null;

  const normalizedTitle = title
    .replace(/[\s　]+[^\s　]*$/g, "")  // 著者名部分を除去
    .replace(/[\s　]*[（(【「].*/g, "")
    .replace(/\s+/g, "")
    .trim();

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
  type: "manga" | "novel",
  classification: ManualClassification
): BookEntry {
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

  const keywords = type === "manga" ? ["漫画", "コミック"] : ["小説"];
  const searchableText = [bookTitle, subtitle, ...authors, publisher ?? "", ...keywords]
    .filter(Boolean).join(" ");

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
    categories: type === "manga" ? ["漫画"] : ["小説"],
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

  const mangaCount = WORK_LIST.filter((w) => w.type === "manga").length;
  const novelCount = WORK_LIST.filter((w) => w.type === "novel").length;
  console.log(`\n📋  対象: 漫画 ${mangaCount} / 小説 ${novelCount} / 合計 ${WORK_LIST.length}`);
  console.log("──────────────────────────────────────────────────");

  for (let i = 0; i < WORK_LIST.length; i++) {
    const target = WORK_LIST[i];
    const normalizedSearch = target.title
      .replace(/\s+[^\s]+$/g, "")  // 著者名部分を除去
      .replace(/\s+/g, "")
      .replace(/[（(].*/g, "")
      .toLowerCase();

    if (existingTitles.has(normalizedSearch)) {
      console.log(`[${i + 1}/${WORK_LIST.length}] ⏭  スキップ（既存）: ${target.title}`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${WORK_LIST.length}] 🔍  検索: ${target.title} (${target.type})`);
    const item = await fetchByTitle(target.title, target.type);

    if (!item) {
      console.log(`    ⚠  見つかりません: ${target.title}`);
      notFound++;
      continue;
    }

    const entry = buildEntry(item, target.title, target.type, target.classification);

    if (existingIds.has(entry.id)) {
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

    await new Promise((r) => setTimeout(r, 500));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`✅  完了: 追加/更新 ${added}件 / スキップ ${skipped}件 / 未発見 ${notFound}件`);
  console.log(`📚  合計: ${books.length}件`);
}

main().catch(console.error);
