/**
 * fill-manga-volumes.ts
 *
 * 漫画作品の巻情報をGoogle Books APIから補完する。
 *
 * 対象: data/normalized/works.json の type===manga かつ volumeCount===1 の作品
 * 方法: Google Books APIでタイトル+著者検索し、見つかった巻をbooks.index.jsonに追加
 *
 * 入力:
 *   data/normalized/works.json        (対象作品一覧)
 *   src/data/books.index.json          (既存書籍データ)
 *   data/fill-volumes-progress.json    (処理済みworkId一覧, 存在しなければ空)
 *
 * 出力:
 *   src/data/books.index.json          (新巻エントリを追加)
 *   data/volume-count-patches.json     (実際の巻数を上書き)
 *   data/fill-volumes-progress.json    (処理済みworkIdを保存)
 *
 * 実行後:
 *   npm run collect:works && npm run build
 *
 * 環境変数:
 *   GOOGLE_BOOKS_API_KEY  ... あれば使用（日次制限を緩和）
 *
 * レート制限:
 *   1リクエスト/秒、累計900リクエストで安全停止
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { join } from "path";
import type { Work } from "../src/types/work";

// ── 設定 ──────────────────────────────────────────────────────────

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY ?? "";
const MAX_REQUESTS = 900;
const RATE_LIMIT_MS = 1100; // 1.1 sec/req

const BOOKS_INDEX_PATH = join(process.cwd(), "src/data/books.index.json");
const WORKS_PATH = join(process.cwd(), "data/normalized/works.json");
const PATCHES_PATH = join(process.cwd(), "data/volume-count-patches.json");
const PROGRESS_PATH = join(process.cwd(), "data/fill-volumes-progress.json");

// ── ユーティリティ ────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface GBVolumeInfo {
  title: string;
  authors?: string[];
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  industryIdentifiers?: { type: string; identifier: string }[];
}

interface GBItem {
  id: string;
  volumeInfo: GBVolumeInfo;
}

async function gbSearch(query: string, startIndex = 0): Promise<GBItem[]> {
  const base = "https://www.googleapis.com/books/v1/volumes";
  const params = new URLSearchParams({
    q: query,
    maxResults: "40",
    langRestrict: "ja",
    startIndex: String(startIndex),
    ...(API_KEY ? { key: API_KEY } : {}),
  });
  const url = `${base}?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GB API error ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { totalItems?: number; items?: GBItem[] };
  return json.items ?? [];
}

// タイトルから巻番号を抽出
const VOLUME_PATTERNS: { pattern: RegExp; group: number }[] = [
  { pattern: /^(.+?)[\s　]+(\d+)巻$/, group: 2 },
  { pattern: /^(.+?)（([０-９\d]+)）$/, group: 2 },
  { pattern: /^(.+?)\((\d+)\)$/, group: 2 },
  { pattern: /^(.+?)[\s　]+(\d{1,3})$/, group: 2 },
  { pattern: /^(.+?)[\s　]+第(\d+)巻$/, group: 2 },
  { pattern: /^(.+?)[\s　]+[Vv]ol\.?(\d+)$/i, group: 2 },
];

function toHalfWidth(s: string) {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

function extractVolumeNo(title: string): number | null {
  for (const { pattern } of VOLUME_PATTERNS) {
    const m = title.match(pattern);
    if (m) {
      const n = parseInt(toHalfWidth(m[2]), 10);
      if (!isNaN(n) && n >= 1 && n <= 500) return n;
    }
  }
  return null;
}

function extractBaseTitle(title: string): string {
  for (const { pattern } of VOLUME_PATTERNS) {
    const m = title.match(pattern);
    if (m) return m[1].trim();
  }
  return title;
}

// タイトル正規化（ゆるい比較用）
function looseTitleNorm(s: string) {
  return s
    .toLowerCase()
    .replace(/[\uFF01-\uFF60\uFFE0-\uFFE6]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    )
    .replace(/[\s　・!！?？【】「」『』〈〉《》（()）\-‐－～〜]/g, "")
    .replace(/[ぁ-ん]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) + 0x60)
    ); // ひらがな → カタカナ
}

// ── BookEntry 型 ──────────────────────────────────────────────────
interface BookEntry {
  id: string;
  title: string;
  authors: string[];
  categories?: string[];
  keywords?: string[];
  searchableText?: string;
  updatedAt?: string;
  publisher?: string;
  publishedDate?: string;
  isbn10?: string;
  isbn13?: string;
  language?: string;
  pageCount?: number;
  estimatedReadingHours?: number;
  sourceIds?: { googleBooksId?: string };
  thumbnailUrl?: string;
  manualClassification?: {
    l1Id: string;
    l2Id?: string;
    l3Id?: string;
    l4TagIds?: string[];
    l5TagIds?: string[];
  };
  [key: string]: unknown;
}

// ── メイン ────────────────────────────────────────────────────────

async function main() {
  // 1. ファイル読み込み
  if (!existsSync(WORKS_PATH)) {
    console.error("data/normalized/works.json が見つかりません。先に npm run normalize:works を実行してください。");
    process.exit(1);
  }
  const works = JSON.parse(readFileSync(WORKS_PATH, "utf-8")) as Work[];
  const books = JSON.parse(readFileSync(BOOKS_INDEX_PATH, "utf-8")) as BookEntry[];
  const patches: Record<string, number> = existsSync(PATCHES_PATH)
    ? JSON.parse(readFileSync(PATCHES_PATH, "utf-8"))
    : {};
  const progress: Set<string> = new Set(
    existsSync(PROGRESS_PATH)
      ? JSON.parse(readFileSync(PROGRESS_PATH, "utf-8"))
      : []
  );

  // 2. books.index.json のバックアップ
  const bakPath = BOOKS_INDEX_PATH + ".bak-" + new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  if (!existsSync(bakPath)) {
    copyFileSync(BOOKS_INDEX_PATH, bakPath);
    console.log(`バックアップ作成: ${bakPath}`);
  }

  // 3. 既存ISBNとgoogleBooksIdのセット（重複チェック用）
  const existingIsbn13 = new Set(books.map((b) => b.isbn13).filter(Boolean));
  const existingGbId = new Set(books.map((b) => b.sourceIds?.googleBooksId).filter(Boolean));

  // 4. 対象漫画: volumeCount===1 かつ未処理
  const targets = works
    .filter((w) => w.type === "manga" && (w.volumeCount ?? 1) === 1 && !progress.has(w.workId))
    .sort((a, b) => a.title.localeCompare(b.title));

  console.log(`\n対象漫画（volumeCount=1、未処理）: ${targets.length} 作品`);
  if (!API_KEY) {
    console.log("⚠ GOOGLE_BOOKS_API_KEY なし: 無料枠で実行（日次1,000リクエスト制限）");
  }

  // 統計
  let requestCount = 0;
  let addedTotal = 0;
  let patchedTotal = 0;
  let skippedAlreadyDone = 0;
  const examples: { workId: string; title: string; before: number; after: number }[] = [];

  // 5. 各作品を処理
  for (let i = 0; i < targets.length; i++) {
    if (requestCount >= MAX_REQUESTS) {
      console.log(`\n⚠ API制限に接近（${requestCount}リクエスト）。処理を安全停止します。`);
      console.log(`残り未処理: ${targets.length - i} 件`);
      break;
    }

    const work = targets[i];

    // 進捗表示（50件ごと）
    if (i > 0 && i % 50 === 0) {
      console.log(`  ... ${i}/${targets.length} 処理済み, API ${requestCount}回, 追加 ${addedTotal}件`);
    }

    // 既存エントリから manualClassification を取得
    const existingEntry = books.find((b) => {
      const volId = work.volumeIds?.[0] ?? "";
      const isbn = volId.split("__").slice(-1)[0];
      return b.isbn13 === isbn || b.id === isbn;
    });
    if (!existingEntry?.manualClassification) {
      progress.add(work.workId);
      skippedAlreadyDone++;
      continue;
    }

    const classification = existingEntry.manualClassification;

    // Google Books 検索
    const query = `intitle:${work.title} inauthor:${work.authors[0] ?? ""}`;
    let gbItems: GBItem[] = [];
    try {
      await sleep(RATE_LIMIT_MS);
      gbItems = await gbSearch(query);
      requestCount++;
    } catch (e) {
      const msg = String(e);
      if (msg.includes("429") || msg.includes("Quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        console.log(`\n⚠ API quota 到達 (${requestCount}req)。停止します。`);
        console.log(`残り未処理: ${targets.length - i} 件`);
        break;
      }
      console.error(`  [${work.title}] API エラー: ${msg.slice(0, 80)}`);
      progress.add(work.workId);
      continue;
    }

    // 巻番号ありのアイテムに絞る
    const baseNorm = looseTitleNorm(work.title);
    let addedForWork = 0;
    let maxVolumeNo = 0;

    for (const item of gbItems) {
      const vi = item.volumeInfo;
      if (vi.language && vi.language !== "ja") continue;

      // タイトルのベース部分が一致するか確認
      const itemBase = looseTitleNorm(extractBaseTitle(vi.title));
      if (!itemBase.includes(baseNorm) && !baseNorm.includes(itemBase)) continue;

      const volumeNo = extractVolumeNo(vi.title);
      if (volumeNo === null) continue;

      if (volumeNo > maxVolumeNo) maxVolumeNo = volumeNo;

      // ISBN / GB IDで重複チェック
      const isbn13 = vi.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier;
      const gbId = item.id;

      if (isbn13 && existingIsbn13.has(isbn13)) continue;
      if (!isbn13 && existingGbId.has(gbId)) continue;

      // 新規エントリを追加
      const newId = isbn13 ?? `gb-${gbId}`;
      const thumbnail =
        vi.imageLinks?.thumbnail?.replace("http://", "https://") ?? undefined;

      const newEntry: BookEntry = {
        id: newId,
        title: vi.title,
        authors: vi.authors ?? work.authors,
        categories: ["漫画"],
        keywords: ["漫画"],
        searchableText: [vi.title, ...(vi.authors ?? work.authors)].join(" "),
        updatedAt: new Date().toISOString(),
        language: "ja",
        manualClassification: classification,
        ...(isbn13 ? { isbn13 } : {}),
        ...(vi.publishedDate ? { publishedDate: vi.publishedDate } : {}),
        ...(vi.publisher ? { publisher: vi.publisher } : {}),
        ...(vi.pageCount ? { pageCount: vi.pageCount } : {}),
        ...(thumbnail ? { thumbnailUrl: thumbnail } : {}),
        sourceIds: { googleBooksId: gbId },
      };

      books.push(newEntry);
      if (isbn13) existingIsbn13.add(isbn13);
      existingGbId.add(gbId);
      addedForWork++;
      addedTotal++;
    }

    // patches に最大巻数を記録（1より大きい場合のみ）
    if (maxVolumeNo > 1) {
      const currentPatch = patches[work.workId] ?? 0;
      if (maxVolumeNo > currentPatch) {
        patches[work.workId] = maxVolumeNo;
        patchedTotal++;
      }
      if (addedForWork > 0 && examples.length < 5) {
        examples.push({ workId: work.workId, title: work.title, before: 1, after: maxVolumeNo });
      }
    }

    progress.add(work.workId);
  }

  // 6. 保存
  writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2));
  writeFileSync(PATCHES_PATH, JSON.stringify(patches, null, 2));
  writeFileSync(PROGRESS_PATH, JSON.stringify([...progress], null, 2));

  // 7. 結果サマリー
  console.log("\n=== 完了 ===");
  console.log(`APIリクエスト総数: ${requestCount}`);
  console.log(`新規追加エントリ数: ${addedTotal}`);
  console.log(`volume-count-patches 更新数: ${patchedTotal}`);
  console.log(`処理済みworkId累計: ${progress.size}`);
  if (examples.length > 0) {
    console.log("\n補完成功例（Before/After）:");
    for (const ex of examples) {
      console.log(`  ${ex.title}: ${ex.before}巻 → ${ex.after}巻`);
    }
  }
  console.log("\n次: npm run collect:works && npm run build");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
