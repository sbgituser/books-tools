#!/usr/bin/env tsx
/**
 * fill-thumbnails.ts
 *
 * サムネイルが欠損しているエントリに対して複数ソースから補完するスクリプト。
 *
 * 処理対象:
 *   1. src/data/books.index.json  (マスターソース / search-index 経由で検索画面に影響)
 *   2. data/normalized/works.json (作品詳細ページ用)
 *   3. data/normalized/volumes.json (巻レベル画像)
 *
 * 実行後に以下を再生成すること:
 *   npm run generate:works   → public/data/works/*.json を更新
 *   npm run split:index      → public/data/books-{l1id}.json を更新
 *   tsx scripts/build-search-index.ts → public/data/search-index.json を更新
 *
 * 取得優先順位:
 *   1. Google Books 直接URL (HEAD検証) ← googleBooksId がある場合
 *   2. OpenBD API              ← isbn13 がある場合
 *   3. Google Books ISBN 検索  ← isbn13 がある場合
 */

import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";

// ── 設定 ────────────────────────────────────────────────────────────

const ROOT = process.cwd();
const BOOKS_INDEX_PATH = join(ROOT, "src", "data", "books.index.json");
const WORKS_PATH = join(ROOT, "data", "normalized", "works.json");
const VOLUMES_PATH = join(ROOT, "data", "normalized", "volumes.json");

const DELAY_MS = 200;
const PROGRESS_INTERVAL = 50;

// ── 型定義 ───────────────────────────────────────────────────────────

interface BookIndex {
  id: string;
  title: string;
  authors: string[];
  isbn13?: string;
  thumbnailUrl?: string;
  sourceIds?: { googleBooksId?: string };
  [key: string]: unknown;
}

interface Work {
  workId: string;
  coverImageUrl: string | null;
  [key: string]: unknown;
}

interface Volume {
  volumeId: string;
  workId: string;
  isbn13?: string;
  googleBooksId?: string;
  coverImageUrl: string | null;
  [key: string]: unknown;
}

// ── ユーティリティ ────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildGoogleBooksUrl(googleBooksId: string): string {
  return `https://books.google.com/books/content?id=${googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
}

async function isValidThumbnail(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const contentLength = parseInt(res.headers.get("content-length") ?? "0");
    // 1KB 未満は 1x1 ダミー画像と判断
    return contentLength > 1024;
  } catch {
    return false;
  }
}

async function fetchFromOpenBD(isbn13: string): Promise<string | null> {
  try {
    const url = `https://api.openbd.jp/v1/get?isbn=${isbn13}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json() as (null | { summary?: { cover?: string } })[];
    const cover = data?.[0]?.summary?.cover;
    return cover && cover.length > 0 ? cover : null;
  } catch {
    return null;
  }
}

async function fetchFromGoogleBooksISBN(isbn13: string): Promise<string | null> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}&maxResults=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json() as {
      items?: { volumeInfo?: { imageLinks?: { thumbnail?: string } } }[];
    };
    const thumb = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    return thumb ?? null;
  } catch {
    return null;
  }
}

async function resolveThumbnail(
  googleBooksId: string | undefined,
  isbn13: string | undefined
): Promise<{ url: string | null; source: string }> {
  // 1. Google Books 直接URL (HEAD 検証)
  if (googleBooksId) {
    const url = buildGoogleBooksUrl(googleBooksId);
    const valid = await isValidThumbnail(url);
    if (valid) return { url, source: "google-books-direct" };
  }

  // 2. OpenBD
  if (isbn13) {
    await sleep(DELAY_MS);
    const url = await fetchFromOpenBD(isbn13);
    if (url) return { url, source: "openbd" };
  }

  // 3. Google Books ISBN 検索
  if (isbn13) {
    await sleep(DELAY_MS);
    const url = await fetchFromGoogleBooksISBN(isbn13);
    if (url) return { url, source: "google-books-isbn" };
  }

  return { url: null, source: "none" };
}

// ── メイン処理 ────────────────────────────────────────────────────────

async function main() {
  console.log("=== fill-thumbnails.ts ===");
  console.log("サムネイル欠損データの補完を開始します\n");

  // ── ファイル読み込み ─────────────────────────────────────────────
  const booksIndex: BookIndex[] = JSON.parse(readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  const works: Work[] = JSON.parse(readFileSync(WORKS_PATH, "utf-8"));
  const volumes: Volume[] = JSON.parse(readFileSync(VOLUMES_PATH, "utf-8"));

  console.log(`books.index.json: ${booksIndex.length} 冊`);
  console.log(`works.json:       ${works.length} 作品`);
  console.log(`volumes.json:     ${volumes.length} 巻`);

  // ── バックアップ ─────────────────────────────────────────────────
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  copyFileSync(BOOKS_INDEX_PATH, `${BOOKS_INDEX_PATH}.bak-${ts}`);
  copyFileSync(WORKS_PATH, `${WORKS_PATH}.bak-${ts}`);
  copyFileSync(VOLUMES_PATH, `${VOLUMES_PATH}.bak-${ts}`);
  console.log(`\nバックアップ作成: *.bak-${ts}\n`);

  // ── ISBN → ボリューム・ワーク マップ構築 ─────────────────────────
  const isbnToVolume = new Map<string, Volume>();
  for (const v of volumes) {
    if (v.isbn13) isbnToVolume.set(v.isbn13, v);
  }
  const workIdToWork = new Map<string, Work>();
  for (const w of works) {
    workIdToWork.set(w.workId, w);
  }

  // ── Phase 1: books.index.json 処理 ───────────────────────────────
  const nullBooks = booksIndex.filter((b) => !b.thumbnailUrl);
  console.log(`[Phase 1] books.index.json — null thumbnailUrl: ${nullBooks.length} 件`);

  let gbDirect = 0, openbd = 0, gbIsbn = 0, failed = 0, skipped = 0;

  for (let i = 0; i < booksIndex.length; i++) {
    const book = booksIndex[i];
    if (book.thumbnailUrl) {
      skipped++;
      continue;
    }

    const googleBooksId = book.sourceIds?.googleBooksId;
    const isbn13 = book.isbn13 || book.id.match(/^\d{13}$/) ? (book.isbn13 || book.id) : undefined;

    const { url, source } = await resolveThumbnail(googleBooksId, isbn13);
    await sleep(DELAY_MS);

    if (url) {
      book.thumbnailUrl = url;
      if (source === "google-books-direct") gbDirect++;
      else if (source === "openbd") openbd++;
      else if (source === "google-books-isbn") gbIsbn++;

      // volumes.json も同時更新 (isbn13 で照合)
      if (isbn13) {
        const vol = isbnToVolume.get(isbn13);
        if (vol && !vol.coverImageUrl) {
          vol.coverImageUrl = url;
          // works.json も更新 (workId で照合)
          const work = workIdToWork.get(vol.workId);
          if (work && !work.coverImageUrl) {
            work.coverImageUrl = url;
          }
        }
      }
    } else {
      failed++;
    }

    const processed = i - skipped + 1;
    if (processed % PROGRESS_INTERVAL === 0) {
      console.log(
        `  [進捗] ${processed}/${nullBooks.length} 件処理 — ` +
        `GB直接: ${gbDirect} / OpenBD: ${openbd} / GB-ISBN: ${gbIsbn} / 失敗: ${failed}`
      );
    }
  }

  // ── works.json の null 残数確認・補完 ───────────────────────────
  // googleBooksId が volumes ではなく直接参照できる場合の補完
  let worksFixed = works.filter((w) => w.coverImageUrl !== null).length;
  let worksFailed = 0;
  for (const work of works) {
    if (work.coverImageUrl) continue;
    // volumeIds から最初のvolume を探す
    const volIds = (work as { volumeIds?: string[] }).volumeIds ?? [];
    for (const volId of volIds) {
      const vol = volumes.find((v) => v.volumeId === volId);
      if (vol?.coverImageUrl) {
        work.coverImageUrl = vol.coverImageUrl;
        worksFixed++;
        break;
      }
    }
    if (!work.coverImageUrl) worksFailed++;
  }

  // ── ファイル書き込み ─────────────────────────────────────────────
  console.log("\nファイルを更新中...");
  writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(booksIndex));
  writeFileSync(WORKS_PATH, JSON.stringify(works));
  writeFileSync(VOLUMES_PATH, JSON.stringify(volumes));
  console.log("  ✓ books.index.json");
  console.log("  ✓ works.json");
  console.log("  ✓ volumes.json");

  // ── サマリー ──────────────────────────────────────────────────────
  const totalFilled = gbDirect + openbd + gbIsbn;
  const remainingNull = booksIndex.filter((b) => !b.thumbnailUrl).length;
  const worksNullRemaining = works.filter((w) => !w.coverImageUrl).length;

  console.log("\n=== 結果サマリー ===");
  console.log(`books.index.json:`);
  console.log(`  補完前 null:      ${nullBooks.length} 件`);
  console.log(`  Google Books 直接: ${gbDirect} 件`);
  console.log(`  OpenBD API:        ${openbd} 件`);
  console.log(`  Google Books ISBN: ${gbIsbn} 件`);
  console.log(`  補完合計:          ${totalFilled} 件`);
  console.log(`  スキップ(既存):    ${skipped} 件`);
  console.log(`  補完できず:        ${failed} 件`);
  console.log(`  補完後 null:       ${remainingNull} 件`);
  console.log(`\nworks.json:`);
  console.log(`  coverImageUrl あり: ${worksFixed} 件`);
  console.log(`  coverImageUrl なし: ${worksNullRemaining} 件`);
  console.log("\n次のステップ:");
  console.log("  npm run generate:works");
  console.log("  npm run split:index");
  console.log("  npx tsx scripts/build-search-index.ts");
}

main().catch((err) => {
  console.error("エラー:", err);
  process.exit(1);
});
