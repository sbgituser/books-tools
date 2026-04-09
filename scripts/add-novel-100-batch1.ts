#!/usr/bin/env tsx
/**
 * add-novel-100-batch1.ts
 * 小説100作品をタイトル検索でGoogle Books APIから取得して
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

// 匿名アクセス（APIキーなし）で実行 - キー付きクォータが枯渇した場合のフォールバック
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
  else if (l3Label === "法廷") l3Id = "social";
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
  // ═══ ミステリー・サスペンス 20作品 ═══
  { title: "真夏の方程式", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "禁断の魔術", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "透明な螺旋", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "少女 湊かなえ", type: "novel", classification: buildClassification("ミステリー", "サスペンス") },
  { title: "ブロードキャスト 湊かなえ", type: "novel", classification: buildClassification("ミステリー", "サスペンス") },
  { title: "名もなき毒", type: "novel", classification: buildClassification("ミステリー", "社会派") },
  { title: "ペテロの葬列", type: "novel", classification: buildClassification("ミステリー", "社会派") },
  { title: "折れた竜骨", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "カササギ殺人事件", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "その裁きは死 アンソニー・ホロヴィッツ", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "傲慢と善良 辻村深月", type: "novel", classification: buildClassification("ミステリー", "サスペンス") },
  { title: "噓つきジェンガ 辻村深月", type: "novel", classification: buildClassification("ミステリー", "サスペンス") },
  { title: "罪の声 塩田武士", type: "novel", classification: buildClassification("ミステリー", "社会派") },
  { title: "テスカトリポカ 佐藤究", type: "novel", classification: buildClassification("ミステリー", "社会派") },
  { title: "爆弾 呉勝浩", type: "novel", classification: buildClassification("ミステリー", "社会派") },
  { title: "六人の嘘つきな大学生 浅倉秋成", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "可燃物 米澤穂信", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "ジェリーフィッシュは凍らない", type: "novel", classification: buildClassification("ミステリー", "本格") },
  { title: "殺人鬼フジコの衝動", type: "novel", classification: buildClassification("ミステリー", "サスペンス") },
  { title: "ユージニア 恩田陸", type: "novel", classification: buildClassification("ミステリー", "本格") },

  // ═══ 文芸・純文学 15作品 ═══
  { title: "騎士団長殺し 村上春樹", type: "novel", classification: buildClassification("文芸", "クラシック") },
  { title: "街とその不確かな壁", type: "novel", classification: buildClassification("文芸", "クラシック") },
  { title: "夏物語 川上未映子", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "献灯使 多和田葉子", type: "novel", classification: buildClassification("文芸", "クラシック") },
  { title: "地球にちりばめられて", type: "novel", classification: buildClassification("文芸", "クラシック") },
  { title: "成瀬は信じた道をいく", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "黄色い家 川上未映子", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "百年の孤独", type: "novel", classification: buildClassification("海外文学", "クラシック") },
  { title: "教団X 中村文則", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "R帝国 中村文則", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "サラバ! 西加奈子", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "i 西加奈子", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "ライオンのおやつ 小川糸", type: "novel", classification: buildClassification("文芸", "日常") },
  { title: "光のとこにいてね 一穂ミチ", type: "novel", classification: buildClassification("文芸", "恋愛") },
  { title: "木挽町のあだ討ち", type: "novel", classification: buildClassification("文芸", "クラシック") },

  // ═══ ライトノベル 15作品 ═══
  { title: "陰の実力者になりたくて!", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "痛いのは嫌なので防御力に極振りしたいと思います。", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "異世界食堂 犬塚惇平", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "デスマーチからはじまる異世界狂想曲", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "望まぬ不死の冒険者", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "真の仲間じゃないと勇者のパーティーを追い出された", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "ひげを剃る。そして女子高生を拾う。", type: "novel", classification: buildClassification("ライトノベル", "日常") },
  { title: "わたしの幸せな結婚", type: "novel", classification: buildClassification("ライトノベル", "恋愛") },
  { title: "継母の連れ子が元カノだった", type: "novel", classification: buildClassification("ライトノベル", "日常") },
  { title: "ようこそ実力至上主義の教室へ 衣笠彰梧", type: "novel", classification: buildClassification("ライトノベル", "バトル") },
  { title: "俺だけレベルアップな件", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "異世界のんびり農家", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "八男って、それはないでしょう!", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "即死チートが最強すぎて", type: "novel", classification: buildClassification("ライトノベル", "異世界") },
  { title: "Unnamed Memory", type: "novel", classification: buildClassification("ライトノベル", "ファンタジー") },

  // ═══ SF 10作品 ═══
  { title: "屍者の帝国", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "自生の夢 飛浩隆", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "天冥の標", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "横浜駅SF", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "万物理論 グレッグ・イーガン", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "タイタンの妖女", type: "novel", classification: buildClassification("SF", "クラシック") },
  { title: "老人と宇宙 ジョン・スコルジー", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "順列都市 グレッグ・イーガン", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "新世界より 貴志祐介", type: "novel", classification: buildClassification("SF", "ハードSF") },
  { title: "All You Need Is Kill", type: "novel", classification: buildClassification("SF", "ハードSF") },

  // ═══ ファンタジー 10作品 ═══
  { title: "十二国記 白銀の墟 玄の月", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "闇の守り人", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "夢の守り人", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "天と地の守り人", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "はてしない物語", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "ハウルの動く城 ダイアナ・ウィン・ジョーンズ", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "後宮の烏 白川紺子", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "かがみの孤城 辻村深月", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "図書館の大魔術師", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },
  { title: "アルケミスト パウロ・コエーリョ", type: "novel", classification: buildClassification("ファンタジー", "ファンタジー") },

  // ═══ 歴史・時代小説 10作品 ═══
  { title: "関ヶ原 司馬遼太郎", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "翔ぶが如く 司馬遼太郎", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "梟の城 司馬遼太郎", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "剣客商売 池波正太郎", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "仕掛人・藤枝梅安", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "蜩ノ記 葉室麟", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "銀漢の賦 葉室麟", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "利休にたずねよ 山本兼一", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "光圀伝 冲方丁", type: "novel", classification: buildClassification("歴史・時代", "時代") },
  { title: "黒牢城 米澤穂信", type: "novel", classification: buildClassification("歴史・時代", "時代") },

  // ═══ ホラー・怪奇 10作品 ═══
  { title: "残穢 小野不由美", type: "novel", classification: buildClassification("ホラー", "怪談") },
  { title: "鬼談百景 小野不由美", type: "novel", classification: buildClassification("ホラー", "怪談") },
  { title: "天使の囀り 貴志祐介", type: "novel", classification: buildClassification("ホラー", "サスペンス") },
  { title: "らせん 鈴木光司", type: "novel", classification: buildClassification("ホラー", "怪談") },
  { title: "ループ 鈴木光司", type: "novel", classification: buildClassification("ホラー", "怪談") },
  { title: "近畿地方のある場所について 背筋", type: "novel", classification: buildClassification("ホラー", "怪談") },
  { title: "変な家 雨穴", type: "novel", classification: buildClassification("ホラー", "怪談") },
  { title: "夜市 恒川光太郎", type: "novel", classification: buildClassification("ホラー", "怪談") },
  { title: "変な絵 雨穴", type: "novel", classification: buildClassification("ホラー", "怪談") },
  { title: "ずうのめ人形 澤村伊智", type: "novel", classification: buildClassification("ホラー", "怪談") },

  // ═══ エッセイ・ノンフィクション・その他 10作品 ═══
  { title: "ファクトフルネス", type: "novel", classification: buildClassification("ノンフィクション", "エッセイ") },
  { title: "嫌われる勇気", type: "novel", classification: buildClassification("ノンフィクション", "エッセイ") },
  { title: "サピエンス全史", type: "novel", classification: buildClassification("ノンフィクション", "エッセイ") },
  { title: "火車 宮部みゆき", type: "novel", classification: buildClassification("ミステリー", "社会派") },
  { title: "正欲 朝井リョウ", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "ツナグ 辻村深月", type: "novel", classification: buildClassification("文芸", "日常") },
  { title: "星の子 今村夏子", type: "novel", classification: buildClassification("文芸", "日常") },
  { title: "護られなかった者たちへ 中山七里", type: "novel", classification: buildClassification("ミステリー", "社会派") },
  { title: "線は、僕を描く 砥上裕將", type: "novel", classification: buildClassification("文芸", "青春") },
  { title: "朝が来る 辻村深月", type: "novel", classification: buildClassification("文芸", "日常") },
];

/** タイトルでGoogle Books APIを検索（リトライ付き） */
async function fetchByTitle(title: string, retries = 3): Promise<any | null> {
  // タイトルから著者名を除去して検索
  const searchTitle = title.replace(/\s+[^\s]+$/g, "").trim();
  const query = `intitle:${searchTitle} 小説`;
  // APIキーがレート制限にかかっている場合は匿名アクセスにフォールバック
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const waitTime = Math.min(2000 * Math.pow(2, attempt), 30000);
      console.log(`    [429] レート制限 - ${waitTime / 1000}秒待機 (${attempt + 1}/${retries + 1})`);
      await new Promise((r) => setTimeout(r, waitTime));
      continue;
    }
    if (!res.ok) {
      console.log(`    [Google Books] HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as any;
    if (!data.items) {
      // 著者名なしで再検索
      if (searchTitle !== title.split(/\s/)[0]) {
        const shortTitle = title.split(/\s/)[0];
        const url2 = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`intitle:${shortTitle} 小説`)}&langRestrict=ja&maxResults=20`;
        await new Promise((r) => setTimeout(r, 1000));
        const res2 = await fetch(url2);
        if (res2.ok) {
          const data2 = (await res2.json()) as any;
          if (data2.items) {
            return selectBest(data2.items, shortTitle);
          }
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

  const keywords = ["小説"];
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
    categories: ["小説"],
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

  console.log(`\n📋  対象: 小説 ${WORK_LIST.length}作品`);
  console.log("──────────────────────────────────────────────────");

  for (let i = 0; i < WORK_LIST.length; i++) {
    const target = WORK_LIST[i];
    // 著者名を除いたタイトル部分で既存チェック
    const titleOnly = target.title.replace(/\s+[^\s]+$/g, "").replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();

    // タイトルで既存チェック（部分一致）
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
      // レート制限対策
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }

    const entry = buildEntry(item, target.title, target.classification);

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
    } else {
      books.push(entry);
      existingIds.add(entry.id);
      existingTitles.add(titleOnly);
      console.log(`    ✅  追加: ${entry.title} (${entry.id}) [${target.classification.l2Id}/${target.classification.l3Id}]`);
      added++;
    }

    // レート制限対策 (1.5秒)
    await new Promise((r) => setTimeout(r, 1500));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`✅  完了: 追加/更新 ${added}件 / スキップ ${skipped}件 / 未発見 ${notFound}件`);
  console.log(`📚  合計: ${books.length}件`);
}

main().catch(console.error);
