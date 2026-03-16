/**
 * fix-manga-vol1-patch2.ts
 *
 * fix-manga-vol1-patch.ts で間違ったGBIDが設定されたエントリを手動で修正する。
 *
 * 実行: npx tsx scripts/fix-manga-vol1-patch2.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const INDEX_PATH = join(process.cwd(), "src/data/books.index.json");

interface BookEntry {
  id: string;
  title: string;
  sourceIds?: { googleBooksId?: string };
  isbn13?: string;
  thumbnailUrl?: string;
  [key: string]: unknown;
}

function gbThumb(id: string): string {
  return `https://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
}

// 確認済みの修正データ
// null を指定した場合は該当フィールドを削除
const CORRECTIONS: Array<{
  id: string;
  gbId: string | null; // nullの場合はgoogleBooksIdを削除
  isbn13?: string | null; // nullの場合はisbn13を削除
  reason: string;
}> = [
  // ── 明らかに間違ったGBIDを正しいvol.1に修正 ───────────────────────────
  {
    id: "blog-進撃の巨人-諫山創",
    gbId: "nMjEBQAAQBAJ", // 進撃の巨人（１）by 諫山創
    reason: "壁外調査最終報告書(ガイドブック) → 進撃の巨人（１）",
  },
  {
    id: "blog-monster-浦沢直樹",
    gbId: "ZdNeEAAAQBAJ", // MONSTER 完全版 デジタルVer.（１）by 浦沢直樹
    reason: "Chop-monster 1(別作品) → MONSTER 完全版（１）",
  },
  {
    id: "gb-blog-七つの大罪",
    gbId: "eFhuEAAAQBAJ", // 七つの大罪　超合本版（１）by 鈴木央
    reason: "七つの大罪キングのまんが道(スピンオフ) → 超合本版（１）(正規1巻相当)",
  },
  {
    id: "gb-blog-fairytail",
    gbId: "u7IpDwAAQBAJ", // FAIRY TAIL 超合本版（１）by 真島ヒロ
    isbn13: null, // スペイン語版ISBNを削除
    reason: "外国語版Fairy Tail 1 → 超合本版（１）(正規1巻相当)",
  },
  {
    id: "gb-blog-ブルーロック",
    gbId: "5Ft2DwAAQBAJ", // ブルーロック（１）by 金城宗幸,ノ村優介
    isbn13: null, // バイリンガル版ISBNを削除
    reason: "バイリンガル版 → ブルーロック（１）",
  },
  {
    id: "gb-blog-hunterhunter",
    gbId: "ze_JCwAAQBAJ", // HUNTER×HUNTER モノクロ版 1 by 冨樫義博
    reason: "「ハンター×ハンター」愛読団(ファンブック) → モノクロ版 1",
  },
  {
    id: "gb-blog-なるたる",
    gbId: "iqDBBQAAQBAJ", // なるたる（１）by 鬼頭莫宏
    reason: "マンガサンプル集 → なるたる（１）",
  },
  {
    id: "gb-blog-見える子ちゃん",
    gbId: "1a6SDwAAQBAJ", // 見える子ちゃん　１ by 泉朝樹
    isbn13: null, // 台湾版ISBNを削除
    reason: "中国語版 → 見える子ちゃん　１",
  },
  {
    id: "blog-タッチ-あだち充",
    gbId: "fvpiDwAAQBAJ", // タッチ 完全復刻版（１）by あだち充
    isbn13: null, // ポスターコレクション版ISBNを削除
    reason: "ポスターコレクション 1 → 完全復刻版（１）",
  },
  {
    id: "gb-blog-メダリスト",
    gbId: "cdH8DwAAQBAJ", // メダリスト（１）by つるまいかだ (manga)
    reason: "小説　メダリスト１(ノベライズ) → メダリスト（１）(漫画)",
  },
  {
    id: "gb-blog-days",
    gbId: "3D4gEAAAQBAJ", // SAKAMOTO DAYS 1 by 鈴木祐斗
    isbn13: null, // 外国語版ISBNを削除
    reason: "外国語版 → SAKAMOTO DAYS 1",
  },

  // ── GB APIで正しいvol.1が見つからないためGBID/サムネイルをクリア ──────
  {
    id: "blog-宇宙兄弟-小山宙哉",
    gbId: null, // 宇宙兄弟メシ vol.1(料理本)のIDを削除
    reason: "宇宙兄弟メシ vol.1(料理本) → GBIDクリア(正しい1巻がAPIで見つからない)",
  },
  {
    id: "gb-blog-3月のライオン",
    gbId: null, // 3月のライオンダイアリーのIDを削除
    isbn13: null,
    reason: "3月のライオンダイアリー(手帳) → GBIDクリア(正しい1巻がAPIで見つからない)",
  },
  {
    id: "gb-blog-アオアシ",
    gbId: null, // アオアシブラザーフット(スピンオフ)のIDを削除
    isbn13: null,
    reason: "アオアシブラザーフット(スピンオフ) → GBIDクリア(正しい1巻がAPIで見つからない)",
  },
];

function main() {
  const books: BookEntry[] = JSON.parse(readFileSync(INDEX_PATH, "utf-8"));
  let updatedCount = 0;
  let notFoundCount = 0;

  for (const fix of CORRECTIONS) {
    const idx = books.findIndex((b) => b.id === fix.id);
    if (idx === -1) {
      console.log(`⚠ NOT FOUND: ${fix.id}`);
      notFoundCount++;
      continue;
    }

    const book = books[idx];

    if (fix.gbId === null) {
      // GBIDとサムネイルをクリア
      if (book.sourceIds) {
        delete book.sourceIds.googleBooksId;
        if (Object.keys(book.sourceIds).length === 0) {
          delete book.sourceIds;
        }
      }
      delete book.thumbnailUrl;
    } else {
      // GBIDとサムネイルを更新
      if (!book.sourceIds) book.sourceIds = {};
      book.sourceIds.googleBooksId = fix.gbId;
      book.thumbnailUrl = gbThumb(fix.gbId);
    }

    // isbn13の修正
    if (fix.isbn13 === null) {
      delete book.isbn13;
    }

    books[idx] = book;
    console.log(`✓ ${fix.id}: ${fix.reason}`);
    updatedCount++;
  }

  writeFileSync(INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n✅ 完了: 更新${updatedCount}件, 未発見${notFoundCount}件`);
}

main();
