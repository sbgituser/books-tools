#!/usr/bin/env tsx
/**
 * add-manga-batch.ts
 * ISBNリストからGoogle Books APIで書籍情報を取得してbooks.index.jsonに追加するスクリプト
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

interface MangaTarget {
  title: string;
  isbn: string;
  classification: ManualClassification;
}

// カテゴリマッピング
function buildClassification(l2Label: string, l3Label: string): ManualClassification {
  // L2マッピング
  let l2Id: string;
  if (l2Label === "少年漫画") l2Id = "shonen";
  else if (l2Label === "少女漫画") l2Id = "shojo";
  else if (l2Label === "青年漫画") l2Id = "seinen";
  else l2Id = "general";

  // L3マッピング（カテゴリツリーに合わせて最適なL2/L3を決定）
  let finalL2 = l2Id;
  let l3Id: string;

  if (l3Label === "スポーツ") {
    // スポーツはshonen/sportsのみ
    finalL2 = "shonen";
    l3Id = "sports";
  } else if (l3Label === "ラブコメ") {
    // ラブコメはshojo/romcom
    finalL2 = "shojo";
    l3Id = "romcom";
  } else if (l3Label === "恋愛" || l3Label === "青春" || l3Label === "SF" && l2Id === "shojo" || l3Label === "ファンタジー" && l2Id === "shojo") {
    finalL2 = "shojo";
    l3Id = "romance";
  } else if (l3Label === "コメディ" || l3Label === "ギャグ") {
    finalL2 = "general";
    l3Id = "gag";
  } else if (l2Id === "shonen") {
    if (l3Label === "バトル" || l3Label === "ホラー" || l3Label === "ヤンキー" || l3Label === "学園" || l3Label === "医療") {
      l3Id = "battle";
    } else if (l3Label === "ファンタジー") {
      l3Id = "adventure";
    } else {
      l3Id = "battle";
    }
  } else if (l2Id === "seinen") {
    if (l3Label === "ドラマ" || l3Label === "ダークファンタジー" || l3Label === "ファンタジー") {
      l3Id = "drama";
    } else if (l3Label === "SF" || l3Label === "歴史" || l3Label === "社会派" || l3Label === "経済" ||
               l3Label === "医療" || l3Label === "サスペンス" || l3Label === "バイオレンス" || l3Label === "将棋") {
      l3Id = "social";
    } else {
      l3Id = "social";
    }
  } else {
    l3Id = "daily";
  }

  return {
    l1Id: "manga",
    l2Id: finalL2,
    l3Id,
    l4TagIds: ["readable"],
  };
}

const MANGA_LIST: MangaTarget[] = [
  { title: "ワールドトリガー", isbn: "9784088800291", classification: buildClassification("少年漫画", "バトル") },
  { title: "ブラッククローバー", isbn: "9784088803353", classification: buildClassification("少年漫画", "バトル") },
  { title: "炎炎ノ消防隊", isbn: "9784063955672", classification: buildClassification("少年漫画", "バトル") },
  { title: "終わりのセラフ", isbn: "9784088800918", classification: buildClassification("少年漫画", "バトル") },
  { title: "トリコ", isbn: "9784088705572", classification: buildClassification("少年漫画", "バトル") },
  { title: "青の祓魔師", isbn: "9784088700867", classification: buildClassification("少年漫画", "バトル") },
  { title: "ダークギャザリング", isbn: "9784088811938", classification: buildClassification("少年漫画", "ホラー") },
  { title: "地獄楽", isbn: "9784088810771", classification: buildClassification("少年漫画", "バトル") },
  { title: "怪獣8号", isbn: "9784088826116", classification: buildClassification("少年漫画", "バトル") },
  { title: "サカモトデイズ", isbn: "9784088826574", classification: buildClassification("少年漫画", "バトル") },
  { title: "GANTZ", isbn: "9784088760533", classification: buildClassification("青年漫画", "SF") },
  { title: "ベルセルク", isbn: "9784592135653", classification: buildClassification("青年漫画", "ダークファンタジー") },
  { title: "ヴィンランド・サガ", isbn: "9784063726487", classification: buildClassification("青年漫画", "歴史") },
  { title: "プラネテス", isbn: "9784063345688", classification: buildClassification("青年漫画", "SF") },
  { title: "イノサン", isbn: "9784088792916", classification: buildClassification("青年漫画", "歴史") },
  { title: "キングダムハーツ", isbn: "9784757505239", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "ゴールデンカムイ", isbn: "9784088901929", classification: buildClassification("青年漫画", "冒険") },
  { title: "ドロヘドロ", isbn: "9784091882611", classification: buildClassification("青年漫画", "ダークファンタジー") },
  { title: "シドニアの騎士", isbn: "9784063870012", classification: buildClassification("青年漫画", "SF") },
  { title: "BLAME!（新装版）", isbn: "9784063145127", classification: buildClassification("青年漫画", "SF") },
  { title: "ホムンクルス", isbn: "9784091873114", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "殺し屋1", isbn: "9784091855318", classification: buildClassification("青年漫画", "バイオレンス") },
  { title: "闇金ウシジマくん", isbn: "9784091824871", classification: buildClassification("青年漫画", "社会派") },
  { title: "インベスターZ", isbn: "9784063883395", classification: buildClassification("青年漫画", "経済") },
  { title: "チ。―地球の運動について―", isbn: "9784098607181", classification: buildClassification("青年漫画", "歴史") },
  { title: "九条の大罪", isbn: "9784098612222", classification: buildClassification("青年漫画", "社会派") },
  { title: "マイホームヒーロー", isbn: "9784065102494", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "リボーンの棋士", isbn: "9784098601974", classification: buildClassification("青年漫画", "将棋") },
  { title: "アオアシ", isbn: "9784091877136", classification: buildClassification("青年漫画", "スポーツ") },
  { title: "ドラフトキング", isbn: "9784088913625", classification: buildClassification("青年漫画", "スポーツ") },
  { title: "東京卍リベンジャーズ", isbn: "9784063959380", classification: buildClassification("少年漫画", "ヤンキー") },
  { title: "GTO", isbn: "9784063110682", classification: buildClassification("少年漫画", "学園") },
  { title: "今日から俺は!!", isbn: "9784091231013", classification: buildClassification("少年漫画", "ヤンキー") },
  { title: "クローバー", isbn: "9784088700188", classification: buildClassification("少年漫画", "ヤンキー") },
  { title: "ROOKIES", isbn: "9784088716110", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "キャプテン", isbn: "9784088521929", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "タッチ", isbn: "9784091401010", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "H2", isbn: "9784091237213", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "ラフ", isbn: "9784091234618", classification: buildClassification("少年漫画", "スポーツ") },
  { title: "みゆき", isbn: "9784091232010", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "花より男子", isbn: "9784088484101", classification: buildClassification("少女漫画", "恋愛") },
  { title: "NANA", isbn: "9784088485788", classification: buildClassification("少女漫画", "恋愛") },
  { title: "君に届け", isbn: "9784088462239", classification: buildClassification("少女漫画", "恋愛") },
  { title: "アオハライド", isbn: "9784088451400", classification: buildClassification("少女漫画", "恋愛") },
  { title: "ストロボ・エッジ", isbn: "9784088461928", classification: buildClassification("少女漫画", "恋愛") },
  { title: "ちはやふる", isbn: "9784063193395", classification: buildClassification("少女漫画", "スポーツ") },
  { title: "俺物語!!", isbn: "9784088464783", classification: buildClassification("少女漫画", "恋愛") },
  { title: "ハチミツとクローバー", isbn: "9784088652012", classification: buildClassification("少女漫画", "青春") },
  { title: "orange", isbn: "9784575841861", classification: buildClassification("少女漫画", "恋愛") },
  { title: "暁のヨナ", isbn: "9784592192854", classification: buildClassification("少女漫画", "ファンタジー") },
  { title: "赤髪の白雪姫", isbn: "9784592191963", classification: buildClassification("少女漫画", "ファンタジー") },
  { title: "フルーツバスケット", isbn: "9784592171613", classification: buildClassification("少女漫画", "ファンタジー") },
  { title: "カードキャプターさくら", isbn: "9784063340676", classification: buildClassification("少女漫画", "ファンタジー") },
  { title: "桜蘭高校ホスト部", isbn: "9784592181018", classification: buildClassification("少女漫画", "コメディ") },
  { title: "となりの怪物くん", isbn: "9784063843382", classification: buildClassification("少女漫画", "恋愛") },
  { title: "山田くんと7人の魔女", isbn: "9784063847762", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "ニセコイ", isbn: "9784088706630", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "五等分の花嫁", isbn: "9784065102494", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "ぼくたちは勉強ができない", isbn: "9784088810375", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "ゆらぎ荘の幽奈さん", isbn: "9784088810603", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "かぐや様は告らせたい", isbn: "9784088904326", classification: buildClassification("青年漫画", "ラブコメ") },
  { title: "それでも歩は寄せてくる", isbn: "9784065128791", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "からかい上手の高木さん", isbn: "9784091274959", classification: buildClassification("少年漫画", "ラブコメ") },
  { title: "古見さんは、コミュ症です。", isbn: "9784091273761", classification: buildClassification("少年漫画", "コメディ") },
  { title: "月刊少女野崎くん", isbn: "9784757534444", classification: buildClassification("少年漫画", "コメディ") },
  { title: "ヒナまつり", isbn: "9784041203980", classification: buildClassification("青年漫画", "コメディ") },
  { title: "坂本ですが？", isbn: "9784040662726", classification: buildClassification("青年漫画", "コメディ") },
  { title: "男子高校生の日常", isbn: "9784757531856", classification: buildClassification("少年漫画", "コメディ") },
  { title: "銀の匙 Silver Spoon", isbn: "9784091231808", classification: buildClassification("少年漫画", "青春") },
  { title: "もやしもん", isbn: "9784063521068", classification: buildClassification("青年漫画", "学園") },
  { title: "はたらく細胞", isbn: "9784063765608", classification: buildClassification("少年漫画", "医療") },
  { title: "ブラックジャックによろしく", isbn: "9784063287667", classification: buildClassification("青年漫画", "医療") },
  { title: "コウノドリ", isbn: "9784063881353", classification: buildClassification("青年漫画", "医療") },
  { title: "Dr.コトー診療所", isbn: "9784091512310", classification: buildClassification("青年漫画", "医療") },
  { title: "JIN-仁-", isbn: "9784088762650", classification: buildClassification("青年漫画", "医療") },
  { title: "テセウスの船", isbn: "9784063906575", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "僕たちがやりました", isbn: "9784063827092", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "デビルズライン", isbn: "9784063885634", classification: buildClassification("青年漫画", "ダークファンタジー") },
  { title: "亜人", isbn: "9784063871927", classification: buildClassification("青年漫画", "サスペンス") },
  { title: "寄生獣リバーシ", isbn: "9784065123772", classification: buildClassification("青年漫画", "SF") },
  { title: "魔法使いの嫁", isbn: "9784800004656", classification: buildClassification("青年漫画", "ファンタジー") },
  { title: "とんがり帽子のアトリエ", isbn: "9784065100339", classification: buildClassification("青年漫画", "ファンタジー") },
  { title: "ダンジョンに出会いを求めるのは間違っているだろうか", isbn: "9784757544016", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "オーバーロード", isbn: "9784047308535", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "転生したらスライムだった件", isbn: "9784063906339", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "無職転生", isbn: "9784040658927", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "Re:ゼロから始める異世界生活", isbn: "9784040676938", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "この素晴らしい世界に祝福を!", isbn: "9784041024127", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "盾の勇者の成り上がり", isbn: "9784040677263", classification: buildClassification("少年漫画", "ファンタジー") },
  { title: "本好きの下剋上", isbn: "9784866990015", classification: buildClassification("少年漫画", "ファンタジー") },
];

/** ISBN でGoogle Books APIを検索し、タイトルが一致するものを返す */
async function fetchByIsbn(isbn: string, expectedTitle: string): Promise<any | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  if (!data.items || data.items.length === 0) return null;
  const item = data.items[0];
  const returnedTitle: string = item.volumeInfo?.title ?? "";
  // タイトル検証: 期待タイトルの主要部分（括弧前）が返されたタイトルに含まれているか
  const normalizedExpected = expectedTitle.replace(/[\s　]*[（(【「].*/g, "").trim();
  if (!returnedTitle.includes(normalizedExpected) && !normalizedExpected.includes(returnedTitle)) {
    return null; // タイトル不一致 → ISBNが間違い
  }
  return item;
}

/** タイトルでGoogle Books APIを検索し、最適なvol.1を返す */
async function fetchByTitle(title: string): Promise<any | null> {
  const query = `intitle:${title} 漫画`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  if (!data.items) return null;

  const normalizedTitle = title.replace(/[\s　]*[（(【「].*/g, "").trim();

  const candidates = data.items.filter((item: any) => {
    const t: string = item.volumeInfo?.title ?? "";
    return t.includes(normalizedTitle);
  });

  if (candidates.length === 0) return null;

  function scoreItem(item: any): number {
    const t: string = item.volumeInfo?.title ?? "";
    let score = 0;
    if (t === title) score += 10;
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

function buildEntry(item: any, isbn13: string, title: string, classification: ManualClassification): BookEntry {
  const info = item.volumeInfo;
  const id = isbn13;
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
    .filter(Boolean).join(" ");

  return {
    id,
    title: bookTitle,
    ...(subtitle ? { subtitle } : {}),
    authors,
    ...(publisher ? { publisher } : {}),
    ...(publishedDate ? { publishedDate } : {}),
    isbn13,
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
  const existingIsbns = new Set(books.map((b) => b.isbn13).filter(Boolean));

  let added = 0;
  let skipped = 0;
  let notFound = 0;

  for (const target of MANGA_LIST) {
    // ISBNで既存チェック
    if (existingIsbns.has(target.isbn)) {
      console.log(`⏭  スキップ（ISBN既存）: ${target.title} (${target.isbn})`);
      skipped++;
      continue;
    }

    console.log(`🔍 検索: ${target.title} (${target.isbn})`);
    let item = await fetchByIsbn(target.isbn, target.title);
    let usedIsbn = target.isbn;

    if (!item) {
      // ISBNが不正 → タイトル検索にフォールバック
      console.log(`  → ISBN不一致、タイトル検索にフォールバック: ${target.title}`);
      item = await fetchByTitle(target.title);
      if (!item) {
        console.warn(`  ⚠ 見つかりません: ${target.title}`);
        notFound++;
        continue;
      }
      // Google BooksのISBN13を使用
      const gbIsbn = item.volumeInfo?.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
      usedIsbn = gbIsbn ?? target.isbn;
    }

    const foundTitle: string = item.volumeInfo?.title ?? target.title;
    const id = usedIsbn;

    if (existingIds.has(id)) {
      console.log(`  ⏭ スキップ（ID重複）: ${foundTitle} (${id})`);
      skipped++;
      continue;
    }

    const entry = buildEntry(item, usedIsbn, target.title, target.classification);
    books.push(entry);
    existingIds.add(id);
    existingIsbns.add(usedIsbn);
    console.log(`  ✓ 追加: ${entry.title} (${id}) [${target.classification.l2Id}/${target.classification.l3Id}]`);
    added++;

    await new Promise((r) => setTimeout(r, 200));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n完了: 追加 ${added}冊 / スキップ ${skipped}冊 / 未発見 ${notFound}冊`);
  console.log("次のステップ: npm run split:index");
}

main().catch(console.error);
