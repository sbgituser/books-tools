#!/usr/bin/env tsx
/**
 * generate-scene-candidates.ts
 *
 * 読書シーンごとの候補集合を生成する。
 * AI選書バッチ（generate-scene-curated.ts）の入力として使用する。
 *
 * 入力:
 *   public/data/works-list.json    (WorkListItem[])
 *   data/normalized/works.json     (discoveryAttributes 取得用)
 *   public/data/work-id-map.json   (workId → fileId マッピング)
 *   src/constants/readingScenes.ts (シーン定義)
 *
 * 出力:
 *   data/scene-candidates/{slug}.json  (SceneCandidates — AI入力用・内部のみ)
 *
 * 注意:
 *   このファイルは public/ に置かない。
 *   AI選書の結果は generate-scene-curated.ts が public/data/scene-curated/ に出力する。
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { READING_SCENES, type ReadingScene } from "../src/constants/readingScenes.js";
import type { WorkListItem } from "../src/types/work.js";
import type { SceneCandidates, SceneCandidateItem } from "../src/types/scene-curated.js";

// ── パス設定 ──────────────────────────────────────────────────────
const ROOT = process.cwd();
const CANDIDATES_DIR = join(ROOT, "data", "scene-candidates");
mkdirSync(CANDIDATES_DIR, { recursive: true });

// ── データ読み込み ────────────────────────────────────────────────
const worksList: WorkListItem[] = JSON.parse(
  readFileSync(join(ROOT, "public", "data", "works-list.json"), "utf-8")
);

const normalizedWorks: Array<{
  workId: string;
  discoveryAttributes: Record<string, unknown>;
}> = JSON.parse(
  readFileSync(join(ROOT, "data", "normalized", "works.json"), "utf-8")
);

const workIdMap: Record<string, string> = JSON.parse(
  readFileSync(join(ROOT, "public", "data", "work-id-map.json"), "utf-8")
);

// fileId → discoveryAttributes
const fileIdToAttrs = new Map<string, Record<string, unknown>>();
for (const w of normalizedWorks) {
  const fileId = workIdMap[w.workId];
  if (fileId) {
    fileIdToAttrs.set(fileId, w.discoveryAttributes ?? {});
  }
}

console.log(`読み込み: ${worksList.length} 作品`);

// ── 候補上限 ─────────────────────────────────────────────────────
/** 1シーンあたりの候補最大件数（AI に渡す上限） */
const MAX_CANDIDATES = 70;
/** タグ/属性マッチで必要な最低スコア */
const PRIMARY_MIN_SCORE = 3;
/** フォールバック閾値 */
const FALLBACK_THRESHOLD = 30;
const STRUCTURAL_MIN_SCORE = 1;

// ── スコアリング（generate-scenes-data.ts と同じロジック） ────────

function scoreWork(work: WorkListItem, scene: ReadingScene): number {
  const tags = new Set(work.discoveryTags);
  const attrs = fileIdToAttrs.get(work.workId) ?? {};

  for (const ex of scene.excludeTags) {
    if (tags.has(ex)) return -999;
  }

  let score = 0;

  for (const t of scene.primaryTags) {
    if (tags.has(t)) score += 3;
  }
  for (const t of scene.bonusTags) {
    if (tags.has(t)) score += 1;
  }
  if (scene.paceTags && attrs.paceTag) {
    if (scene.paceTags.includes(attrs.paceTag as string)) score += 1;
  }
  if (scene.depthTags && attrs.depthTag) {
    if (scene.depthTags.includes(attrs.depthTag as string)) score += 1;
  }
  if (scene.volumeCountMin !== undefined && work.volumeCount >= scene.volumeCountMin) score += 1;
  if (scene.volumeCountMax !== undefined && work.volumeCount <= scene.volumeCountMax) score += 1;
  if (scene.preferredType && work.type === scene.preferredType) score += 1;

  if (tags.size === 0) {
    score += structuralScore(work, scene);
  }

  return score;
}

function structuralScore(work: WorkListItem, scene: ReadingScene): number {
  let s = 0;
  const sc = scene.slug;

  if (sc === "commute" && work.volumeCount <= 10) s += 1;
  if (sc === "short-break" && work.volumeCount <= 3) s += 1;
  if (sc === "holiday-binge" && work.volumeCount >= 8) s += 1;

  if ((sc === "before-sleep" || sc === "cafe" || sc === "think-deeply") && work.type === "novel") s += 1;
  if ((sc === "stress-relief" || sc === "exciting") && work.type === "manga") s += 1;

  if ((sc === "short-break" || sc === "commute") && work.status === "completed") s += 1;
  if ((sc === "exciting" || sc === "holiday-binge") && work.status === "ongoing") s += 1;

  return s;
}

function sortByScore(
  a: { score: number; work: WorkListItem },
  b: { score: number; work: WorkListItem }
) {
  if (b.score !== a.score) return b.score - a.score;
  const dateA = a.work.latestPublishedDate ?? "";
  const dateB = b.work.latestPublishedDate ?? "";
  if (dateB !== dateA) return dateB.localeCompare(dateA);
  return a.work.title.localeCompare(b.work.title, "ja");
}

// ── 各シーンの候補生成 ────────────────────────────────────────────

for (const scene of READING_SCENES) {
  const allScored = worksList.map((work) => ({ work, score: scoreWork(work, scene) }));
  const excluded = new Set(
    allScored.filter(({ score }) => score <= -999).map(({ work }) => work.workId)
  );

  const tagged = allScored
    .filter(({ work, score }) => score >= PRIMARY_MIN_SCORE && !excluded.has(work.workId))
    .sort(sortByScore);

  let combined = tagged;

  if (tagged.length < FALLBACK_THRESHOLD) {
    const taggedIds = new Set(tagged.map(({ work }) => work.workId));
    const structural = allScored
      .filter(
        ({ work, score }) =>
          score >= STRUCTURAL_MIN_SCORE &&
          score < PRIMARY_MIN_SCORE &&
          !excluded.has(work.workId) &&
          !taggedIds.has(work.workId)
      )
      .sort(sortByScore);
    combined = [...tagged, ...structural];
  }

  const selected = combined.slice(0, MAX_CANDIDATES);

  const candidates: SceneCandidateItem[] = selected.map(({ work, score }) => ({
    workId: work.workId,
    type: work.type,
    title: work.title,
    authorDisplay: work.authorDisplay,
    status: work.status,
    volumeCount: work.volumeCount,
    discoveryTags: work.discoveryTags,
    discoveryAttributes: fileIdToAttrs.get(work.workId) ?? {},
    _score: score,
  }));

  const output: SceneCandidates = {
    slug: scene.slug,
    label: scene.label,
    icon: scene.icon,
    description: scene.description,
    candidates,
    candidateCount: candidates.length,
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(
    join(CANDIDATES_DIR, `${scene.slug}.json`),
    JSON.stringify(output, null, 2),
    "utf-8"
  );

  console.log(`✓ scene-candidates/${scene.slug}.json  (${candidates.length} 件) [${scene.label}]`);
}

console.log(`\nDone. 候補データ → data/scene-candidates/`);
console.log("次のステップ: npm run generate:curated");
