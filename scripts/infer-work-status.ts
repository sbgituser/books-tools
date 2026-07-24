#!/usr/bin/env tsx
/**
 * infer-work-status.ts — Phase 1-2: 完結/連載ステータスの推定
 *
 * status="unknown" の複数巻作品について、巻の発売日データから
 * 「連載中」「完結」を推定し data/status-patches.json に出力する。
 * normalize-works.ts はこのパッチを既存の inferStatus() の後に適用する
 * （moodTags 由来の明示的な status を絶対に上書きしない）。
 *
 * 判定ルール:
 *   - 直近 RECENT_MONTHS ヶ月以内に新刊があれば「ongoing」
 *   - 最新刊から STALE_YEARS 年以上経過していれば「completed」
 *     ただし、巻データの網羅率(発売日が判明している巻数 / volumeCount)が
 *     COVERAGE_THRESHOLD 未満の場合は「データ欠落による見かけ上の停滞」の
 *     可能性があるため判定を保留する(ONE PIECE のようなケースを誤って
 *     completed 扱いしないため)
 *   - それ以外(1年超・数年未満の空白)は判定を保留(unknownのまま)
 *
 * 使い方:
 *   npx tsx scripts/infer-work-status.ts            # 生成
 *   npx tsx scripts/infer-work-status.ts --dry-run   # 集計のみ
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Work, Volume, WorkStatus } from "../src/types/work";

const RECENT_MONTHS = 12;
const STALE_YEARS = 2;
const COVERAGE_THRESHOLD = 0.7;

type StatusPatchEntry = {
  status: WorkStatus;
  reason: string;
};

function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

/** "2018" / "2018-10" / "2018-10-04" のいずれでも解釈できるようにパースする */
function parseFlexibleDate(s: string): Date | null {
  const m = s.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = m[2] ? parseInt(m[2], 10) - 1 : 0;
  const day = m[3] ? parseInt(m[3], 10) : 1;
  return new Date(year, month, day);
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const now = new Date();

  const works: Work[] = JSON.parse(readFileSync(join(process.cwd(), "data/normalized/works.json"), "utf-8"));
  const volumes: Volume[] = JSON.parse(readFileSync(join(process.cwd(), "data/normalized/volumes.json"), "utf-8"));

  const volsByWork = new Map<string, Volume[]>();
  for (const v of volumes) {
    if (!volsByWork.has(v.workId)) volsByWork.set(v.workId, []);
    volsByWork.get(v.workId)!.push(v);
  }

  const patches: Record<string, StatusPatchEntry> = {};
  let ongoingCount = 0;
  let completedCount = 0;
  let heldLowCoverage = 0;
  let heldAmbiguousGap = 0;
  let skippedNoDate = 0;

  const targets = works.filter((w) => w.status === "unknown" && (w.volumeCount ?? 1) >= 2);

  for (const work of targets) {
    const vols = volsByWork.get(work.workId) ?? [];
    const datedVols = vols
      .map((v) => v.publishedDate)
      .filter((d): d is string => Boolean(d))
      .map(parseFlexibleDate)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    if (datedVols.length === 0) {
      skippedNoDate++;
      continue;
    }

    const latest = datedVols[datedVols.length - 1];
    const monthsSinceLatest = monthsBetween(latest, now);
    const coverage = datedVols.length / work.volumeCount;

    if (monthsSinceLatest <= RECENT_MONTHS) {
      patches[work.workId] = {
        status: "ongoing",
        reason: `最新巻が${monthsSinceLatest}ヶ月前(閾値${RECENT_MONTHS}ヶ月以内)`,
      };
      ongoingCount++;
      continue;
    }

    if (monthsSinceLatest >= STALE_YEARS * 12) {
      if (coverage < COVERAGE_THRESHOLD) {
        heldLowCoverage++;
        continue;
      }
      patches[work.workId] = {
        status: "completed",
        reason: `最新巻が${Math.floor(monthsSinceLatest / 12)}年前・巻データ網羅率${Math.round(coverage * 100)}%`,
      };
      completedCount++;
      continue;
    }

    heldAmbiguousGap++;
  }

  console.log(`対象(status=unknown かつ 複数巻): ${targets.length}作品`);
  console.log(`  ongoing推定: ${ongoingCount}`);
  console.log(`  completed推定: ${completedCount}`);
  console.log(`  保留(巻データ網羅率不足): ${heldLowCoverage}`);
  console.log(`  保留(1〜2年の中間的な空白): ${heldAmbiguousGap}`);
  console.log(`  スキップ(発売日データなし): ${skippedNoDate}`);

  if (!dryRun) {
    writeFileSync(join(process.cwd(), "data/status-patches.json"), JSON.stringify(patches, null, 2), "utf-8");
    console.log(`\n✅ data/status-patches.json に${Object.keys(patches).length}件を出力しました`);
  }
}

main();
