/**
 * generate-scenes-data.ts
 *
 * 読書シーン別の作品JSONを生成する。
 *
 * 入力:
 *   public/data/works-list.json    (WorkListItem[])
 *   data/normalized/works.json     (Work[] — discoveryAttributes参照用)
 *   public/data/work-id-map.json   (workId → fileId マッピング)
 *   src/constants/readingScenes.ts (シーン定義)
 *
 * 出力:
 *   public/data/scenes/index.json          (SceneIndexMeta)
 *   public/data/scenes/{slug}.json         (SceneWorksData)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { READING_SCENES, type ReadingScene } from "../src/constants/readingScenes.js";
import type { WorkListItem, SceneWorksData, SceneIndexMeta } from "../src/types/work.js";

// ── パス設定 ──────────────────────────────────────────────────────
const ROOT = process.cwd();
const SCENES_DIR = join(ROOT, "public", "data", "scenes");
mkdirSync(SCENES_DIR, { recursive: true });

// ── データ読み込み ────────────────────────────────────────────────
const worksList: WorkListItem[] = JSON.parse(
  readFileSync(join(ROOT, "public", "data", "works-list.json"), "utf-8")
);

// normalized works — discoveryAttributes (paceTag, depthTag) 取得用
const normalizedWorks: Array<{
  workId: string;
  discoveryAttributes: Record<string, unknown>;
  volumeCount: number;
  type: string;
}> = JSON.parse(
  readFileSync(join(ROOT, "data", "normalized", "works.json"), "utf-8")
);

// workId(normalized) → fileId マップ
const workIdMap: Record<string, string> = JSON.parse(
  readFileSync(join(ROOT, "public", "data", "work-id-map.json"), "utf-8")
);

// fileId → discoveryAttributes マップを構築
const fileIdToAttrs = new Map<string, Record<string, unknown>>();
for (const w of normalizedWorks) {
  const fileId = workIdMap[w.workId];
  if (fileId) {
    fileIdToAttrs.set(fileId, w.discoveryAttributes ?? {});
  }
}

console.log(`読み込み: ${worksList.length} 作品`);
console.log(`属性マップ: ${fileIdToAttrs.size} エントリ`);

// ── スコアリング ──────────────────────────────────────────────────

/**
 * 1作品の読書シーン適合スコアを算出する。
 *
 * スコア内訳:
 *   primaryTags マッチ    +3 per tag
 *   bonusTags マッチ      +1 per tag
 *   paceTag マッチ        +1
 *   depthTag マッチ       +1
 *   volumeCount 条件      +1
 *   preferredType 一致    +1
 *   excludeTags マッチ    → 即 -999（除外）
 *
 * タグが0件の作品は構造的ヒューリスティックのみで判定する。
 */
function scoreWork(work: WorkListItem, scene: ReadingScene): number {
  const tags = new Set(work.discoveryTags);
  const attrs = fileIdToAttrs.get(work.workId) ?? {};

  // 除外タグチェック
  for (const ex of scene.excludeTags) {
    if (tags.has(ex)) return -999;
  }

  let score = 0;

  // primaryTags
  for (const t of scene.primaryTags) {
    if (tags.has(t)) score += 3;
  }

  // bonusTags
  for (const t of scene.bonusTags) {
    if (tags.has(t)) score += 1;
  }

  // paceTag
  if (scene.paceTags && attrs.paceTag) {
    if (scene.paceTags.includes(attrs.paceTag as string)) score += 1;
  }

  // depthTag
  if (scene.depthTags && attrs.depthTag) {
    if (scene.depthTags.includes(attrs.depthTag as string)) score += 1;
  }

  // volumeCount 条件
  if (scene.volumeCountMin !== undefined && work.volumeCount >= scene.volumeCountMin) score += 1;
  if (scene.volumeCountMax !== undefined && work.volumeCount <= scene.volumeCountMax) score += 1;

  // preferredType
  if (scene.preferredType && work.type === scene.preferredType) score += 1;

  // ── タグなし作品のフォールバック ──────────────────────────────
  // discoveryTags が空の場合、構造的ヒューリスティックのみで基礎スコアを付与
  if (tags.size === 0) {
    score += structuralScore(work, scene);
  }

  return score;
}

/**
 * タグ未設定作品向け: 作品の構造情報からシーン適合度を推定する。
 * 0〜2 点を返す（主タグマッチの最低基準=3点には届かないが、他の条件と合わせて合格できる）。
 */
function structuralScore(work: WorkListItem, scene: ReadingScene): number {
  let s = 0;
  const { slug, volumeCount, type } = { ...work, slug: "" };
  const sc = scene.slug;

  // 巻数ベース
  if (sc === "commute" && work.volumeCount <= 10) s += 1;
  if (sc === "short-break" && work.volumeCount <= 3) s += 1;
  if (sc === "holiday-binge" && work.volumeCount >= 8) s += 1;

  // タイプベース
  if ((sc === "before-sleep" || sc === "cafe" || sc === "think-deeply") && work.type === "novel") s += 1;
  if ((sc === "stress-relief" || sc === "exciting") && work.type === "manga") s += 1;

  // 完結ボーナス（一気読み・すきま向き）
  if ((sc === "short-break" || sc === "commute") && work.status === "completed") s += 1;

  // 連載中ボーナス（ワクワク・一気読み向き）
  if ((sc === "exciting" || sc === "holiday-binge") && work.status === "ongoing") s += 1;

  return s;
}

// ── シーンごとに作品選定・JSON生成 ───────────────────────────────

/** 1シーンあたりの最大作品数 */
const MAX_WORKS_PER_SCENE = 120;
/** タグ/属性マッチで必要な最低スコア（これ未満はタグなし構造マッチで補完） */
const PRIMARY_MIN_SCORE = 3;
/** 構造マッチだけで補完する際の最低スコア */
const STRUCTURAL_MIN_SCORE = 1;
/** 構造マッチで補完を開始する閾値（タグマッチがこの件数未満なら補完する） */
const FALLBACK_THRESHOLD = 30;

function sortWorks(a: { score: number; work: WorkListItem }, b: { score: number; work: WorkListItem }) {
  if (b.score !== a.score) return b.score - a.score;
  const dateA = a.work.latestPublishedDate ?? "";
  const dateB = b.work.latestPublishedDate ?? "";
  if (dateB !== dateA) return dateB.localeCompare(dateA);
  return a.work.title.localeCompare(b.work.title, "ja");
}

const sceneIndexItems: SceneIndexMeta["scenes"] = [];

for (const scene of READING_SCENES) {
  // Step1: タグ/属性マッチ（スコアが primaryTags 等から来るもの）
  const allScored = worksList.map((work) => ({ work, score: scoreWork(work, scene) }));
  const excluded = allScored.filter(({ score }) => score <= -999);
  const excludedIds = new Set(excluded.map(({ work }) => work.workId));

  // タグ or 属性マッチしたもの（discoveryTags が空でない OR attrs マッチ）
  const tagged = allScored.filter(({ work, score }) =>
    score >= PRIMARY_MIN_SCORE && !excludedIds.has(work.workId)
  ).sort(sortWorks);

  let combined = tagged;

  // タグマッチが少ない場合は構造ベースで補完
  if (tagged.length < FALLBACK_THRESHOLD) {
    const taggedIds = new Set(tagged.map(({ work }) => work.workId));
    const structural = allScored.filter(({ work, score }) =>
      score >= STRUCTURAL_MIN_SCORE &&
      score < PRIMARY_MIN_SCORE &&
      !excludedIds.has(work.workId) &&
      !taggedIds.has(work.workId)
    ).sort(sortWorks);
    combined = [...tagged, ...structural];
  }

  const items = combined.slice(0, MAX_WORKS_PER_SCENE).map(({ work }) => work);

  const data: SceneWorksData = {
    slug: scene.slug,
    label: scene.label,
    icon: scene.icon,
    description: scene.description,
    works: items,
    totalCount: items.length,
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(
    join(SCENES_DIR, `${scene.slug}.json`),
    JSON.stringify(data)
  );

  sceneIndexItems.push({
    slug: scene.slug,
    label: scene.label,
    icon: scene.icon,
    description: scene.description,
    count: items.length,
  });

  console.log(`✓ scenes/${scene.slug}.json  (${items.length} 作品) [${scene.label}]`);
}

// ── index.json 生成 ───────────────────────────────────────────────

const indexData: SceneIndexMeta = {
  scenes: sceneIndexItems,
  generatedAt: new Date().toISOString(),
};

writeFileSync(
  join(SCENES_DIR, "index.json"),
  JSON.stringify(indexData)
);

console.log(`\n✓ scenes/index.json  (${READING_SCENES.length} シーン)`);
console.log("\nDone. 生成物 → public/data/scenes/");
