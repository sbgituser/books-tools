#!/usr/bin/env tsx
/**
 * fetch-thumbnails-by-title.ts
 *
 * thumbnailUrl が未設定の books.index.json エントリに対して
 * タイトル + 著者でGoogle Books APIを検索し書影を補完する。
 * （ISBN検索で取得できなかった分の補完用）
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 設定 ─────────────────────────────────────────────────────────
const ENV_PATH = path.join(__dirname, ".env");
if (fs.existsSync(ENV_PATH)) {
  for (const line of fs.readFileSync(ENV_PATH, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

let apiKey = process.env.GOOGLE_BOOKS_API_KEY ?? "";
const DELAY_MS = 500;
const INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

type BookEntry = {
  id: string;
  title: string;
  authors?: string[];
  isbn13?: string;
  thumbnailUrl?: string;
  manualClassification?: { l1Id?: string };
  [key: string]: unknown;
};

// ── メイン ────────────────────────────────────────────────────────
const index: BookEntry[] = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));

// 対象: thumbnailUrl なし（全カテゴリ対象）
const targets = index.filter((b) => !b.thumbnailUrl);

console.log(`対象エントリ: ${targets.length} 件`);

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * タイトル + 著者で Google Books を検索してサムネイルURLを返す。
 * 複数ヒットした場合、最も一致度が高そうな最初の候補を使う。
 */
async function fetchThumbnailByTitle(
  title: string,
  authors: string[]
): Promise<string | null> {
  const authorStr = authors[0] ?? "";
  // クエリ: タイトル + 著者（著者が英語名の場合は除く）
  const queryParts = [title];
  if (authorStr && !/^[A-Za-z\s\.\-]+$/.test(authorStr)) {
    queryParts.push(authorStr);
  } else if (authorStr) {
    queryParts.push(`inauthor:${authorStr}`);
  }
  const q = encodeURIComponent(queryParts.join(" "));
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5&langRestrict=ja` +
    (apiKey ? `&key=${apiKey}` : "");

  try {
    const res = await fetch(url);
    if (res.status === 429) {
      if (apiKey) {
        console.log("  ⚠ APIキーのクォータ超過 → 匿名アクセスに切り替え");
        apiKey = "";
        await sleep(2000);
        return fetchThumbnailByTitle(title, authors);
      }
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json() as {
      items?: Array<{
        id?: string;
        volumeInfo?: {
          title?: string;
          imageLinks?: { thumbnail?: string; smallThumbnail?: string };
        };
      }>;
    };
    if (!data.items?.length) return null;

    // タイトルが最もよく一致するものを選ぶ
    const normalizeQ = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    const targetNorm = normalizeQ(title);

    let bestThumb: string | null = null;
    let bestId: string | null = null;
    for (const item of data.items) {
      const itemTitle = item.volumeInfo?.title ?? "";
      const thumb =
        item.volumeInfo?.imageLinks?.thumbnail ??
        item.volumeInfo?.imageLinks?.smallThumbnail;

      const titleMatch =
        normalizeQ(itemTitle) === targetNorm ||
        normalizeQ(itemTitle).includes(targetNorm) ||
        targetNorm.includes(normalizeQ(itemTitle));

      if (thumb) {
        if (titleMatch) {
          bestThumb = thumb;
          break;
        }
        if (!bestThumb) bestThumb = thumb;
      } else if (titleMatch && item.id && !bestId) {
        // imageLinks がないが一致する場合、IDから直接URL構築
        bestId = item.id;
      }
    }

    if (bestThumb) {
      return bestThumb.replace(/^http:/, "https:").replace(/&imgtk=[^&]+/, "");
    }
    if (bestId) {
      return `https://books.google.com/books/content?id=${bestId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < targets.length; i++) {
    const entry = targets[i];
    if (i > 0 && i % 50 === 0) {
      console.log(`  ${i}/${targets.length} 処理済み (更新: ${updated})`);
    }

    const thumb = await fetchThumbnailByTitle(
      entry.title,
      entry.authors ?? []
    );

    if (thumb) {
      entry.thumbnailUrl = thumb;
      updated++;
    } else {
      notFound++;
    }

    await sleep(DELAY_MS);
  }

  // 書き戻し
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

  console.log(`\n完了: ${updated} 件更新, ${notFound} 件未取得`);
  console.log("→ src/data/books.index.json を更新しました");
}

main().catch(console.error);
