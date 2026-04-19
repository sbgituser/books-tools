#!/usr/bin/env tsx
/**
 * add-batch-200-part3.ts
 * 追加バッチ: さらに不足分を追加（レート制限対策でウェイト増加）
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

interface ManualClassification { l1Id: string; l2Id: string; l3Id: string; l4TagIds?: string[]; }
interface BookEntry {
  id: string; title: string; subtitle?: string; authors: string[];
  publisher?: string; publishedDate?: string; isbn13?: string; language: string;
  pageCount?: number; categories: string[]; keywords: string[]; searchableText: string;
  thumbnailUrl?: string; sourceIds: { googleBooksId?: string }; updatedAt: string;
  manualClassification: ManualClassification;
}
interface WorkTarget { title: string; type: "manga" | "novel"; classification: ManualClassification; }

function mc(l1: string, l2: string, l3: string): ManualClassification {
  return { l1Id: l1, l2Id: l2, l3Id: l3 };
}

const WORK_LIST: WorkTarget[] = [
  // ═══ 漫画 追加 ═══
  // 前回失敗したもの + 新規
  { title: "結界師", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "サイボーグ009", type: "manga", classification: mc("manga", "shonen", "sf") },
  { title: "魁!!男塾", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "ソウルイーター", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "おおきく振りかぶって", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "ゆらぎ荘の幽奈さん", type: "manga", classification: mc("manga", "shonen", "romcom") },
  { title: "かぐや様は告らせたい", type: "manga", classification: mc("manga", "seinen", "romcom") },
  { title: "古見さんはコミュ症です", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "銃夢", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "orange 高野苺", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "学園アリス", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "いぬやしき", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "監獄学園", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "孤独のグルメ", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "深夜食堂", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "クッキングパパ", type: "manga", classification: mc("manga", "seinen", "gourmet") },
  { title: "チ。―地球の運動について―", type: "manga", classification: mc("manga", "seinen", "history") },
  { title: "フルムーンをさがして", type: "manga", classification: mc("manga", "shojo", "fantasy") },

  // 新規漫画追加
  { title: "CITY HUNTER", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "北斗の拳 世紀末", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "こちら葛飾区亀有公園前派出所", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "範馬刃牙", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "天才バカボン", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "鉄腕アトム", type: "manga", classification: mc("manga", "shonen", "sf") },
  { title: "火の鳥", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "ブラック・ジャック", type: "manga", classification: mc("manga", "shonen", "medical") },
  { title: "クレヨンしんちゃん", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "コナン漫画", type: "manga", classification: mc("manga", "shonen", "mystery") },
  { title: "鋼の錬金術師", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "交響詩篇エウレカセブン 漫画", type: "manga", classification: mc("manga", "shonen", "sf") },
  { title: "赤ずきんチャチャ", type: "manga", classification: mc("manga", "shojo", "comedy") },
  { title: "ママレード・ボーイ", type: "manga", classification: mc("manga", "shojo", "romance") },
  { title: "セーラームーン 漫画", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "少女革命ウテナ", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "ローゼンメイデン", type: "manga", classification: mc("manga", "shonen", "fantasy") },
  { title: "魔法騎士レイアース", type: "manga", classification: mc("manga", "shojo", "fantasy") },
  { title: "XXXHOLiC", type: "manga", classification: mc("manga", "seinen", "fantasy") },
  { title: "ツバサ―RESERVoir CHRoNiCLE―", type: "manga", classification: mc("manga", "shonen", "fantasy") },
  { title: "ちょびっツ", type: "manga", classification: mc("manga", "seinen", "romance") },
  { title: "頭文字D 新装版", type: "manga", classification: mc("manga", "seinen", "sports") },
  { title: "湾岸ミッドナイト", type: "manga", classification: mc("manga", "seinen", "sports") },
  { title: "BLACK LAGOON", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "ヘルシング", type: "manga", classification: mc("manga", "seinen", "battle") },
  { title: "トライガン", type: "manga", classification: mc("manga", "shonen", "sf") },
  { title: "ぼくらの", type: "manga", classification: mc("manga", "seinen", "sf") },
  { title: "うさぎドロップ", type: "manga", classification: mc("manga", "seinen", "daily_life") },
  { title: "3月のライオン 新装版", type: "manga", classification: mc("manga", "seinen", "youth") },
  { title: "ちいかわ", type: "manga", classification: mc("manga", "seinen", "comedy") },
  { title: "SPY×FAMILY 公式", type: "manga", classification: mc("manga", "shonen", "comedy") },
  { title: "フリーレン", type: "manga", classification: mc("manga", "shonen", "fantasy") },
  { title: "ダンダダン", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "呪術廻戦 新装版", type: "manga", classification: mc("manga", "shonen", "battle") },
  { title: "カイジ", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "アカギ", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "賭博破戒録カイジ", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "天 天和通りの快男児", type: "manga", classification: mc("manga", "seinen", "mystery") },
  { title: "はたらく細胞", type: "manga", classification: mc("manga", "shonen", "medical") },
  { title: "ドラゴンヘッド", type: "manga", classification: mc("manga", "seinen", "horror") },
  { title: "彼方のアストラ 新装版", type: "manga", classification: mc("manga", "shonen", "sf") },
  { title: "地獄先生ぬ～べ～", type: "manga", classification: mc("manga", "shonen", "horror") },
  { title: "犬夜叉 新装版", type: "manga", classification: mc("manga", "shonen", "fantasy") },
  { title: "H2", type: "manga", classification: mc("manga", "shonen", "sports") },
  { title: "ラフ あだち充", type: "manga", classification: mc("manga", "shonen", "sports") },

  // ═══ 小説 追加 ═══
  // 前回失敗したもの + 新規
  { title: "白銀ジャック", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "マスカレード・ナイト", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "さまよう刃", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "クスノキの番人", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "蹴りたい背中 綿矢りさ", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "風が強く吹いている 三浦しをん", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "有頂天家族 森見登美彦", type: "novel", classification: mc("novel", "literary", "fantasy") },
  { title: "やはり俺の青春ラブコメはまちがっている", type: "novel", classification: mc("novel", "light_novel", "daily_life") },
  { title: "三日間の幸福 三秋縋", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "夏への扉 ハインライン", type: "novel", classification: mc("novel", "sf", "classic") },
  { title: "幼年期の終り クラーク", type: "novel", classification: mc("novel", "sf", "hard_sf") },
  { title: "日本沈没 小松左京", type: "novel", classification: mc("novel", "sf", "hard_sf") },
  { title: "月は無慈悲な夜の女王 ハインライン", type: "novel", classification: mc("novel", "sf", "hard_sf") },
  { title: "エンダーのゲーム カード", type: "novel", classification: mc("novel", "sf", "classic") },
  { title: "たったひとつの冴えたやりかた ティプトリー", type: "novel", classification: mc("novel", "sf", "classic") },
  { title: "こころ 夏目漱石 小説", type: "novel", classification: mc("novel", "literary", "classic") },
  { title: "告白 湊かなえ 小説", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "半落ち 横山秀夫", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "インシテミル 米澤穂信", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "薔薇の名前 ウンベルト・エーコ", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "長いお別れ レイモンド・チャンドラー", type: "novel", classification: mc("novel", "mystery", "hardboiled") },

  // 新規小説
  { title: "同志少女よ、敵を撃て", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "変な家 雨穴", type: "novel", classification: mc("novel", "mystery", "honkaku") },
  { title: "近畿地方のある場所について 背筋", type: "novel", classification: mc("novel", "horror", "other") },
  { title: "成瀬は天下を取りにいく", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "阪急電車 有川浩", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "旅猫リポート 有川浩", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "空飛ぶ広報室 有川浩", type: "novel", classification: mc("novel", "literary", "romance") },
  { title: "食堂かたつむり", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "かもめ食堂 群ようこ", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "鴨川ホルモー 万城目学", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "天地明察 冲方丁", type: "novel", classification: mc("novel", "historical", "jidai") },
  { title: "のぼうの城 和田竜", type: "novel", classification: mc("novel", "historical", "jidai") },
  { title: "村上海賊の娘 和田竜", type: "novel", classification: mc("novel", "historical", "jidai") },
  { title: "天と地と 海音寺潮五郎", type: "novel", classification: mc("novel", "historical", "jidai") },
  { title: "利休にたずねよ 山本兼一", type: "novel", classification: mc("novel", "historical", "jidai") },
  { title: "新世界より 貴志祐介", type: "novel", classification: mc("novel", "sf", "other") },
  { title: "悪の教典 貴志祐介", type: "novel", classification: mc("novel", "horror", "other") },
  { title: "黒い家 貴志祐介", type: "novel", classification: mc("novel", "horror", "other") },
  { title: "ジェノサイド 高野和明", type: "novel", classification: mc("novel", "sf", "other") },
  { title: "カラフル 森絵都", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "バッテリー あさのあつこ", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "西の魔女が死んだ 梨木香歩", type: "novel", classification: mc("novel", "literary", "youth") },
  { title: "博士の愛した数式 小川洋子", type: "novel", classification: mc("novel", "literary", "daily_life") },
  { title: "ツバキ文具店 小川糸", type: "novel", classification: mc("novel", "literary", "daily_life") },
  { title: "星の王子さま サン=テグジュペリ", type: "novel", classification: mc("novel", "foreign", "classic") },
  { title: "ブレイブ・ストーリー 宮部みゆき", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
  { title: "クロスファイア 宮部みゆき", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "龍は眠る 宮部みゆき", type: "novel", classification: mc("novel", "mystery", "social") },
  { title: "神様のカルテ 夏川草介", type: "novel", classification: mc("novel", "literary", "daily_life") },
  { title: "下町ロケット 池井戸潤", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "陸王 池井戸潤", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "ハゲタカ 真山仁", type: "novel", classification: mc("novel", "literary", "other") },
  { title: "鹿の王 上橋菜穂子", type: "novel", classification: mc("novel", "fantasy", "fantasy") },
];

async function fetchByTitle(title: string, type: "manga" | "novel"): Promise<any | null> {
  const typeKeyword = type === "manga" ? "漫画" : "小説";
  const query = `intitle:${title} ${typeKeyword}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 503 || res.status === 429) {
      // Retry once after wait
      console.log(`    [Retry] HTTP ${res.status}, waiting 3s...`);
      await new Promise(r => setTimeout(r, 3000));
      const res2 = await fetch(url);
      if (!res2.ok) { console.log(`    [Google Books] HTTP ${res2.status} (retry)`); return null; }
      const data2 = (await res2.json()) as any;
      if (!data2.items) return null;
      return findBestMatch(data2.items, title);
    }
    console.log(`    [Google Books] HTTP ${res.status}`);
    return null;
  }
  const data = (await res.json()) as any;
  if (!data.items) return null;
  return findBestMatch(data.items, title);
}

function findBestMatch(items: any[], title: string): any | null {
  const normalizedTitle = title
    .replace(/\s+[^\s]*$/g, "")
    .replace(/[\s　]*[（(【「].*/g, "")
    .replace(/\s+/g, "")
    .trim();

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
    const hasIsbn = item.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13");
    if (hasIsbn) score += 3;
    score -= t.length * 0.1;
    return score;
  }

  candidates.sort((a: any, b: any) => scoreItem(b) - scoreItem(a));
  return candidates[0];
}

function buildEntry(item: any, title: string, type: "manga" | "novel", classification: ManualClassification): BookEntry {
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
  const searchableText = [bookTitle, subtitle, ...authors, publisher ?? "", ...keywords].filter(Boolean).join(" ");
  return {
    id, title: bookTitle, ...(subtitle ? { subtitle } : {}), authors,
    ...(publisher ? { publisher } : {}), ...(publishedDate ? { publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}), language: info.language ?? "ja",
    ...(pageCount ? { pageCount } : {}), categories: type === "manga" ? ["漫画"] : ["小説"],
    keywords, searchableText, ...(thumbnailUrl ? { thumbnailUrl } : {}),
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
  const mangaCount = WORK_LIST.filter((w) => w.type === "manga").length;
  const novelCount = WORK_LIST.filter((w) => w.type === "novel").length;
  console.log(`\n📋  対象: 漫画 ${mangaCount} / 小説 ${novelCount} / 合計 ${WORK_LIST.length}`);

  for (let i = 0; i < WORK_LIST.length; i++) {
    const target = WORK_LIST[i];
    const normalizedSearch = target.title.replace(/\s+[^\s]+$/g, "").replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();

    if (existingTitles.has(normalizedSearch)) {
      console.log(`[${i + 1}/${WORK_LIST.length}] ⏭  skip: ${target.title}`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${WORK_LIST.length}] 🔍  ${target.title} (${target.type})`);
    const item = await fetchByTitle(target.title, target.type);

    if (!item) {
      console.log(`    ⚠  not found`);
      notFound++;
      continue;
    }

    const entry = buildEntry(item, target.title, target.type, target.classification);

    if (existingIds.has(entry.id)) {
      const existing = books.find((b) => b.id === entry.id);
      if (existing && !existing.manualClassification?.l1Id) {
        existing.manualClassification = target.classification;
        console.log(`    ✏  classified: ${existing.title}`);
        added++;
      } else {
        console.log(`    ⏭  dup: ${entry.title}`);
        skipped++;
      }
      continue;
    }

    books.push(entry);
    existingIds.add(entry.id);
    existingTitles.add(normalizedSearch);
    console.log(`    ✅  ${entry.title} (${entry.id})`);
    added++;

    await new Promise((r) => setTimeout(r, 1000));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n✅  done: +${added} / skip ${skipped} / miss ${notFound} / total ${books.length}`);
}

main().catch(console.error);
