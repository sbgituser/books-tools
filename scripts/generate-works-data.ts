/**
 * generate-works-data.ts
 *
 * data/normalized/ の Works/Volumes を読み込み、本番サイト用生成物を出力する。
 *
 * 出力先:
 *   public/data/works-list.json       - WorkListItem[] (一覧用・軽量)
 *   public/data/discovery-index.json  - DiscoveryIndex (発見機能用)
 *   public/data/works/{workId}.json   - WorkDetail (詳細用・1ファイル/作品)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { Work, Volume, WorkListItem, WorkDetail, DiscoveryIndex } from "../src/types/work";

// ── データ読み込み ────────────────────────────────────────────────

const NORM_DIR = join(process.cwd(), "data", "normalized");
const OUT_DIR = join(process.cwd(), "public", "data");
const WORKS_OUT_DIR = join(OUT_DIR, "works");

mkdirSync(WORKS_OUT_DIR, { recursive: true });

const works: Work[] = JSON.parse(
  readFileSync(join(NORM_DIR, "works.json"), "utf-8")
);
const volumes: Volume[] = JSON.parse(
  readFileSync(join(NORM_DIR, "volumes.json"), "utf-8")
);

console.log(`読み込み: ${works.length} 作品 / ${volumes.length} 巻`);

// volumeId → Volume マップ
const volumeMap = new Map<string, Volume>();
for (const v of volumes) volumeMap.set(v.volumeId, v);

// workId → Volume[] マップ
const workVolumesMap = new Map<string, Volume[]>();
for (const v of volumes) {
  if (!workVolumesMap.has(v.workId)) workVolumesMap.set(v.workId, []);
  workVolumesMap.get(v.workId)!.push(v);
}

// ── 共通: fileId 生成 ─────────────────────────────────────────────
// workId は長い Unicode 文字列になるため、djb2 ハッシュで短い安定 fileId に変換する。
// これを /works/[workId] ルートの実 ID として使う。

function djb2hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36).padStart(7, "0");
}

const workFileIds = new Map<string, string>();
for (const w of works) {
  workFileIds.set(w.workId, djb2hash(w.workId));
}

// ── 1. works-list.json (一覧用軽量データ) ────────────────────────

const workListItems: WorkListItem[] = works.map((w) => ({
  workId: workFileIds.get(w.workId)!, // フロントからのリンクには fileId を使う
  type: w.type,
  title: w.title,
  authorDisplay: w.authorDisplay,
  status: w.status,
  volumeCount: w.volumeCount,
  coverImageUrl: w.coverImageUrl,
  discoveryTags: w.discoveryTags,
  firstPublishedDate: w.firstPublishedDate,
  latestPublishedDate: w.latestPublishedDate,
}));

// 漫画→小説順、タイトル昇順で安定ソート
workListItems.sort((a, b) => {
  if (a.type !== b.type) return a.type === "manga" ? -1 : 1;
  return a.title.localeCompare(b.title, "ja");
});

writeFileSync(
  join(OUT_DIR, "works-list.json"),
  JSON.stringify(workListItems)
);
console.log(`✓ works-list.json  (${workListItems.length} 作品)`);

// ── 2. discovery-index.json (発見機能用) ─────────────────────────

// 全タグの収集とカウント
const tagCounts = new Map<string, number>();
for (const w of works) {
  for (const tag of w.discoveryTags) {
    tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
}

// タグ表示順: 件数降順 → 日本語文字順
const availableTags = [...tagCounts.entries()]
  .filter(([, count]) => count >= 1)
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);

// タグ → workId[] インデックス
const tagIndex: Record<string, string[]> = {};
for (const tag of availableTags) {
  tagIndex[tag] = works
    .filter((w) => w.discoveryTags.includes(tag))
    .map((w) => w.workId);
}

// 発見機能用 workId → WorkListItem マップ
const worksMap: Record<string, WorkListItem> = {};
for (const item of workListItems) {
  worksMap[item.workId] = item;
}

const discoveryIndex: DiscoveryIndex = {
  tagIndex,
  works: worksMap,
  availableTags,
  generatedAt: new Date().toISOString(),
};

writeFileSync(
  join(OUT_DIR, "discovery-index.json"),
  JSON.stringify(discoveryIndex)
);
console.log(`✓ discovery-index.json  (${availableTags.length} タグ)`);
console.log(`  タグ上位10: ${availableTags.slice(0, 10).join(", ")}`);

// ── 3. works/{fileId}.json (詳細用・per-work) ────────────────────

// workId → fileId マップを生成物として public/data/work-id-map.json に書き出す
const workIdMap: Record<string, string> = {};

let written = 0;
for (const work of works) {
  const fileId = workFileIds.get(work.workId)!;
  workIdMap[work.workId] = fileId;
  const vols = workVolumesMap.get(work.workId) ?? [];
  const detail: WorkDetail = { ...work, volumes: vols };
  writeFileSync(
    join(WORKS_OUT_DIR, `${fileId}.json`),
    JSON.stringify(detail)
  );
  written++;
}

// work-id-map.json を書き出し（フロントでの workId → fileId 解決に使う）
writeFileSync(
  join(OUT_DIR, "work-id-map.json"),
  JSON.stringify(workIdMap)
);
console.log(`✓ work-id-map.json  (${Object.keys(workIdMap).length} エントリ)`);

console.log(`✓ works/*.json  (${written} ファイル)`);
console.log("\nDone. 生成物 → public/data/");
