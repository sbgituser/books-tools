#!/usr/bin/env tsx
/**
 * fix-manga-volumes.ts
 *
 * volumeCount が 1 になっている漫画作品の正しい巻数を補完する。
 *
 * 処理フロー:
 *   1. data/normalized/works.json から対象作品（manga + volumeCount=1 + discoveryTags あり）を取得
 *   2. Google Books API でシリーズの最大巻数を検索
 *   3. 既知作品のハードコードマッピングをフォールバックとして使用
 *   4. 結果を data/volume-count-patches.json に保存
 *
 * 実行後:
 *   tsx scripts/normalize-works.ts でパッチが適用される
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const WORKS_PATH = join(process.cwd(), "data", "normalized", "works.json");
const PATCHES_PATH = join(process.cwd(), "data", "volume-count-patches.json");
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY ?? "";
const SLEEP_MS = 400;
const MAX_RESULTS = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GBVolumeInfo {
  title?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
}
interface GBItem {
  id: string;
  volumeInfo: GBVolumeInfo;
}

// ── 既知作品の巻数マッピング ─────────────────────────────────────────
// Google Books API が取得できない場合のフォールバック（2026年3月時点）
const KNOWN_VOLUME_COUNTS: Record<string, number> = {
  "manga__進撃の巨人__諫山創": 34,
  "manga__鬼滅の刃__吾峠呼世晴": 23,
  "manga__death_note__大場つぐみ": 13,
  "manga__monster__浦沢直樹": 18,
  "manga__one_piece__尾田栄一郎": 109,
  "manga__hunter_hunter__冨樫義博": 37,
  "manga__naruto_ナルト__岸本斉史": 72,
  "manga__ハイキュー__古舘春一": 45,
  "manga__僕のヒーローアカデミア__堀越耕平": 42,
  "manga__20世紀少年__浦沢直樹": 22,
  "manga__ベルセルク__三浦建太郎": 42,
  "manga__ヴィンランドサガ__幸村誠": 29,
  "manga__ゴールデンカムイ__野田サトル": 31,
  "manga__花より男子__神尾葉子": 36,
  "manga__nana_ナナ__矢沢あい": 21,
  "manga__君に届け__軽穂椎名": 30,
  "manga__デビルズライン__花田陵": 14,
  "manga__転生したらスライムだった件__伏瀬": 25,
  "manga__ヒストリエ__岩明均": 12,
  "manga__サラリーマン金太郎__本宮ひろ志": 20,
  "manga__聖_おにいさん__中村光": 21,
  "manga__あそびあそばせ__涼川りん": 13,
  "manga__日常__あらゐけいいち": 10,
  "manga__女子高生の無駄づかい__ビーノ": 10,
  "manga__呪術廻戦__芥見下": 27,
  "manga__ダイヤのa_エース__寺嶋裕二": 47,
  "manga__ジョジョの奇妙な冒険_第9部_ザジョジョランズ__荒木飛呂彦": 7,
  "manga__光が死んだ夏__額賀澪": 6,
  "manga__gantz_カラー版_ゆびわ星人編_小島多恵編__奥浩哉": 3,
};

// タイトルから巻番号を抽出するパターン
const VOLUME_PATTERNS = [
  /^(.+?)[\s　]+(\d+)巻$/,
  /^(.+?)（([０-９\d]+)）$/,
  /^(.+?)\((\d+)\)$/,
  /^(.+?)[\s　]+(\d+)$/,
  /^(.+?)[\s　]+第(\d+)巻$/,
  /^(.+?)[\s　]+[Vv]ol\.?(\d+)$/i,
];

function toHalfWidth(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

function extractVolumeNo(title: string): number | null {
  for (const pat of VOLUME_PATTERNS) {
    const m = title.match(pat);
    if (m) {
      const n = parseInt(toHalfWidth(m[2]), 10);
      if (!isNaN(n) && n > 0 && n < 500) return n;
    }
  }
  return null;
}

function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

async function searchGB(query: string): Promise<GBItem[]> {
  const keyParam = API_KEY ? `&key=${API_KEY}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${MAX_RESULTS}&langRestrict=ja${keyParam}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  GB API error: ${res.status} for query: ${query}`);
      return [];
    }
    const data = (await res.json()) as { items?: GBItem[] };
    return data.items ?? [];
  } catch (e) {
    console.warn(`  GB API fetch error: ${e}`);
    return [];
  }
}

/**
 * シリーズタイトルで Google Books を検索し、最大巻番号を返す。
 * 見つからない場合は null を返す。
 */
async function findMaxVolumeFromGB(
  title: string,
  workId: string
): Promise<number | null> {
  const seriesKey = normalize(title);

  // 悪いパターン（ファンブック、外伝など）を除外
  const badPats = [
    /ファンブック/,
    /ガイドブック/,
    /公式ガイド/,
    /読本/,
    /外伝/,
    /スピンオフ/,
    /解読/,
    /考察/,
    /総集編/,
    /完全版\s*\d/,
    /短編集/,
    /英語/,
    /秘密/,
  ];

  const queries = [
    `intitle:"${title}" subject:comics`,
    `"${title}" 漫画 巻`,
  ];

  let maxVol = 0;

  for (const q of queries) {
    const items = await searchGB(q);
    await sleep(SLEEP_MS);

    for (const item of items) {
      const t = item.volumeInfo?.title ?? "";
      if (!normalize(t).includes(seriesKey)) continue;
      if (badPats.some((p) => p.test(t))) continue;

      const volNo = extractVolumeNo(t);
      if (volNo !== null && volNo > maxVol) {
        maxVol = volNo;
      }
    }

    if (maxVol > 0) break; // 1つ目のクエリで見つかれば十分
  }

  return maxVol > 1 ? maxVol : null;
}

// ── メイン処理 ──────────────────────────────────────────────────────

interface Work {
  workId: string;
  type: string;
  title: string;
  volumeCount: number;
  discoveryTags: string[];
}

async function main(): Promise<void> {
  const works: Work[] = JSON.parse(readFileSync(WORKS_PATH, "utf-8"));

  // 対象: manga + volumeCount=1 + discoveryTags あり（実際のマンガシリーズ）
  const targets = works.filter(
    (w) => w.type === "manga" && w.volumeCount === 1 && w.discoveryTags.length > 0
  );

  console.log(`対象作品数: ${targets.length}`);

  // 既存パッチを読み込む（上書き更新をサポート）
  const existingPatches: Record<string, number> = existsSync(PATCHES_PATH)
    ? JSON.parse(readFileSync(PATCHES_PATH, "utf-8"))
    : {};

  const patches: Record<string, number> = { ...existingPatches };

  let hardcodedCount = 0;
  let apiCount = 0;
  let notFoundCount = 0;
  const notFoundWorks: string[] = [];

  for (const work of targets) {
    const { workId, title } = work;

    // 既にパッチがある場合はスキップ
    if (patches[workId]) {
      console.log(`  [skip] ${title} → 既存パッチ: ${patches[workId]}`);
      continue;
    }

    // ── ハードコードマッピングを優先 ──
    if (KNOWN_VOLUME_COUNTS[workId]) {
      patches[workId] = KNOWN_VOLUME_COUNTS[workId];
      hardcodedCount++;
      console.log(`  [known] ${title} → ${patches[workId]}巻`);
      continue;
    }

    // ── Google Books API で検索 ──
    console.log(`  [api] ${title} を検索中...`);
    const maxVol = await findMaxVolumeFromGB(title, workId);

    if (maxVol !== null) {
      patches[workId] = maxVol;
      apiCount++;
      console.log(`  [api] ${title} → ${maxVol}巻`);
    } else {
      notFoundCount++;
      notFoundWorks.push(`${workId} | ${title}`);
      console.log(`  [skip] ${title} → 巻数不明、スキップ`);
    }
  }

  // 結果を保存
  writeFileSync(PATCHES_PATH, JSON.stringify(patches, null, 2));

  console.log("\n── 完了 ───────────────────────────────────────────");
  console.log(`ハードコード補完: ${hardcodedCount}件`);
  console.log(`API補完:         ${apiCount}件`);
  console.log(`補完不可:        ${notFoundCount}件`);
  if (notFoundWorks.length > 0) {
    console.log("\n補完できなかった作品:");
    notFoundWorks.forEach((w) => console.log(`  - ${w}`));
  }
  console.log(`\n✓ data/volume-count-patches.json を更新しました`);
  console.log("次のステップ: tsx scripts/normalize-works.ts");
}

main().catch((err) => {
  console.error("エラー:", err);
  process.exit(1);
});
