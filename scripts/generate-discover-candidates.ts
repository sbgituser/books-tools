#!/usr/bin/env tsx
/**
 * generate-discover-candidates.ts
 *
 * 発見ムードごとの候補集合を生成する。
 * AI選書バッチ（generate-discover-curated.ts）の入力として使用する。
 *
 * 入力:
 *   public/data/works-list.json     (WorkListItem[])
 *   data/normalized/works.json      (discoveryAttributes 取得用)
 *   public/data/work-id-map.json    (workId → fileId マッピング)
 *   src/constants/discoverMoods.ts  (ムード定義)
 *
 * 出力:
 *   data/discover-candidates/{slug}.json  (DiscoverCandidates — AI入力用・内部のみ)
 *
 * 使い方:
 *   npm run generate:discover-candidates
 *   npm run generate:discover-candidates -- --mood emotional   # 特定ムードのみ
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { DISCOVER_MOODS } from "../src/constants/discoverMoods.js";
import type { WorkListItem } from "../src/types/work.js";
import type { DiscoverCandidates, DiscoverCandidateItem } from "../src/types/discover-curated.js";

// ── パス設定 ──────────────────────────────────────────────────────
const ROOT = process.cwd();
const CANDIDATES_DIR = join(ROOT, "data", "discover-candidates");
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
const MAX_CANDIDATES = 60;

// ── CLI オプション ────────────────────────────────────────────────
const targetSlug = (() => {
  const idx = process.argv.indexOf("--mood");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const moods = targetSlug
  ? DISCOVER_MOODS.filter((m) => m.slug === targetSlug)
  : DISCOVER_MOODS;

if (moods.length === 0) {
  console.error(`❌ ムード "${targetSlug}" が見つかりません`);
  console.error(`利用可能: ${DISCOVER_MOODS.map((m) => m.slug).join(", ")}`);
  process.exit(1);
}

// ── スコアリング ──────────────────────────────────────────────────

function scoreWork(
  work: WorkListItem,
  tags: string[],
  tagWeights: number[] = [],
): number {
  const workTags = new Set(work.discoveryTags);
  let score = 0;

  for (let i = 0; i < tags.length; i++) {
    if (workTags.has(tags[i])) {
      score += tagWeights[i] ?? 1;
    }
  }

  return score;
}

// ── ムードごとの候補生成 ──────────────────────────────────────────

function generateCandidates(mood: (typeof DISCOVER_MOODS)[number]): void {
  const weights = mood.tagWeights ?? mood.tags.map(() => 1);

  // スコアリング
  const scored = worksList
    .map((work) => ({
      work,
      score: scoreWork(work, mood.tags, weights),
    }))
    .filter(({ score }) => score > 0);

  // スコア降順 → タイトル五十音順
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.work.title.localeCompare(b.work.title, "ja");
  });

  const top = scored.slice(0, MAX_CANDIDATES);

  const candidates: DiscoverCandidateItem[] = top.map(({ work, score }) => {
    const attrs = fileIdToAttrs.get(work.workId) ?? {};
    return {
      workId: work.workId,
      type: work.type,
      title: work.title,
      authorDisplay: work.authorDisplay,
      status: work.status,
      volumeCount: work.volumeCount,
      discoveryTags: work.discoveryTags,
      discoveryAttributes: attrs,
      _score: score,
    };
  });

  const output: DiscoverCandidates = {
    axis: "mood",
    slug: mood.slug,
    label: mood.label,
    icon: mood.icon,
    description: mood.description,
    matchingTags: mood.tags,
    candidates,
    candidateCount: candidates.length,
    generatedAt: new Date().toISOString(),
  };

  const outPath = join(CANDIDATES_DIR, `${mood.slug}.json`);
  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`✓ ${mood.label} (${mood.slug}): ${candidates.length}件`);
}

// ── メイン処理 ────────────────────────────────────────────────────

for (const mood of moods) {
  generateCandidates(mood);
}

console.log(`\n完了 → data/discover-candidates/`);
console.log("次のステップ: npm run generate:discover-curated");
