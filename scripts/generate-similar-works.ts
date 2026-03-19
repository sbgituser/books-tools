#!/usr/bin/env tsx
/**
 * generate-similar-works.ts
 *
 * 各作品に対して「似た作品」をグループ別に生成し、
 * data/similar-works/{fileId}.json として保存する。
 *
 * 入力:
 *   data/normalized/works.json
 *
 * 出力:
 *   data/similar-works/{fileId}.json  (per-work 類似作品データ)
 *
 * 生成グループ:
 *   1. same_author    — 同じ著者の別作品（最優先）
 *   2. same_publisher — 同じ出版社の同タイプ作品
 *   3. similar_taste  — 読み味が近い作品（タグ重複ベース）
 *
 * 前提:
 *   npm run normalize:works を先に実行しておくこと
 *
 * 使い方:
 *   npm run generate:similar
 *   npm run generate:similar -- --work manga__bleach__久保帯人  # 特定作品のみ
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { Work } from "../src/types/work.js";
import type {
  SimilarWorks,
  SimilarGroup,
  SimilarWorkItem,
} from "../src/types/similar-works.js";

// ── パス設定 ──────────────────────────────────────────────────────

const ROOT = process.cwd();
const WORKS_PATH = join(ROOT, "data", "normalized", "works.json");
const OUTPUT_DIR = join(ROOT, "data", "similar-works");
mkdirSync(OUTPUT_DIR, { recursive: true });

// ── CLI オプション ────────────────────────────────────────────────

const targetWorkId = (() => {
  const idx = process.argv.indexOf("--work");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

// ── fileId 生成（generate-works-data.ts と同じ djb2 ハッシュ）───

function djb2hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36).padStart(7, "0");
}

// ── ユーティリティ ────────────────────────────────────────────────

/** 著者名を正規化（表記ゆれ吸収：全角スペース、記号など） */
function normalizeAuthor(name: string): string {
  return name
    .replace(/\s+/g, "")
    .replace(/　/g, "")
    .toLowerCase();
}

/** 2つの文字列配列の共通要素数 */
function countOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x)).length;
}

/** 2つのタグ配列の共通タグリスト */
function sharedTags(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

/** 作品タイプの日本語ラベル */
function typeLabel(type: Work["type"]): string {
  return type === "manga" ? "漫画" : type === "novel" ? "小説" : "作品";
}

// ── 理由文生成 ────────────────────────────────────────────────────

function makeSameAuthorReason(work: Work, target: Work): string {
  // 共通著者を取得
  const targetNorm = target.authors.map(normalizeAuthor);
  const shared = work.authors.filter((a) =>
    targetNorm.includes(normalizeAuthor(a))
  );
  const author = shared[0] ?? work.authors[0] ?? "同著者";
  return `${author}による${typeLabel(work.type)}`;
}

function makeSamePublisherReason(work: Work, publisher: string): string {
  return `${publisher}の${typeLabel(work.type)}`;
}

function makeSimilarTasteReason(tags: string[]): string {
  const top = tags.slice(0, 2);
  if (top.length === 0) return "読み味が近い作品";
  return `「${top.join("」「")}」など読み味が近い`;
}

// ── グループ生成 ──────────────────────────────────────────────────

const SAME_AUTHOR_MAX = 6;
const SAME_PUBLISHER_MAX = 5;
const SIMILAR_TASTE_MAX = 6;
const MIN_TAG_OVERLAP = 2; // similar_taste に必要な最小共通タグ数

function buildSameAuthorGroup(
  target: Work,
  allWorks: Work[],
  fileIdMap: Map<string, string>,
  excludeIds: Set<string>
): SimilarGroup | null {
  const targetNormAuthors = target.authors.map(normalizeAuthor);
  if (targetNormAuthors.length === 0) return null;

  const candidates = allWorks
    .filter((w) => {
      if (w.workId === target.workId) return false;
      if (excludeIds.has(w.workId)) return false;
      const normAuthors = w.authors.map(normalizeAuthor);
      return normAuthors.some((a) => targetNormAuthors.includes(a));
    })
    .map((w) => ({
      work: w,
      overlap: countOverlap(
        w.authors.map(normalizeAuthor),
        targetNormAuthors
      ),
    }))
    .sort((a, b) => {
      // 共通著者数が多い順 → 完結優先 → 巻数多い順
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      const statusScore = (s: Work["status"]) =>
        s === "completed" ? 2 : s === "ongoing" ? 1 : 0;
      return (
        statusScore(b.work.status) - statusScore(a.work.status) ||
        b.work.volumeCount - a.work.volumeCount
      );
    })
    .slice(0, SAME_AUTHOR_MAX);

  if (candidates.length === 0) return null;

  const items: SimilarWorkItem[] = candidates.map(({ work }) => ({
    workId: work.workId,
    fileId: fileIdMap.get(work.workId)!,
    title: work.title,
    authorDisplay: work.authorDisplay,
    type: work.type,
    status: work.status,
    volumeCount: work.volumeCount,
    coverImageUrl: work.coverImageUrl,
    reason: makeSameAuthorReason(work, target),
  }));

  return {
    type: "same_author",
    title: "同じ作者の作品",
    items,
  };
}

function buildSamePublisherGroup(
  target: Work,
  allWorks: Work[],
  fileIdMap: Map<string, string>,
  excludeIds: Set<string>
): SimilarGroup | null {
  if (!target.publisherMain) return null;
  const pub = target.publisherMain;

  const candidates = allWorks
    .filter((w) => {
      if (w.workId === target.workId) return false;
      if (excludeIds.has(w.workId)) return false;
      if (w.publisherMain !== pub) return false;
      // 同タイプ優先（必須ではないが、異タイプのみ候補がいる場合は表示しない）
      // → 同タイプに絞る（体験上の違和感が出やすいため）
      if (w.type !== target.type) return false;
      return true;
    })
    .map((w) => ({
      work: w,
      // タグ重複があれば加点
      tagOverlap:
        target.discoveryTags.length > 0 && w.discoveryTags.length > 0
          ? countOverlap(w.discoveryTags, target.discoveryTags)
          : 0,
    }))
    .sort((a, b) => {
      // タグ重複多い順 → 完結優先 → 巻数多い順
      if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap;
      const statusScore = (s: Work["status"]) =>
        s === "completed" ? 2 : s === "ongoing" ? 1 : 0;
      return (
        statusScore(b.work.status) - statusScore(a.work.status) ||
        b.work.volumeCount - a.work.volumeCount
      );
    })
    .slice(0, SAME_PUBLISHER_MAX);

  if (candidates.length === 0) return null;

  const items: SimilarWorkItem[] = candidates.map(({ work }) => ({
    workId: work.workId,
    fileId: fileIdMap.get(work.workId)!,
    title: work.title,
    authorDisplay: work.authorDisplay,
    type: work.type,
    status: work.status,
    volumeCount: work.volumeCount,
    coverImageUrl: work.coverImageUrl,
    reason: makeSamePublisherReason(work, pub),
  }));

  return {
    type: "same_publisher",
    title: "同じ出版社・レーベルから探す",
    items,
  };
}

function buildSimilarTasteGroup(
  target: Work,
  allWorks: Work[],
  fileIdMap: Map<string, string>,
  excludeIds: Set<string>
): SimilarGroup | null {
  if (target.discoveryTags.length === 0) return null;

  const candidates = allWorks
    .filter((w) => {
      if (w.workId === target.workId) return false;
      if (excludeIds.has(w.workId)) return false;
      if (w.discoveryTags.length === 0) return false;
      const overlap = countOverlap(w.discoveryTags, target.discoveryTags);
      return overlap >= MIN_TAG_OVERLAP;
    })
    .map((w) => ({
      work: w,
      shared: sharedTags(target.discoveryTags, w.discoveryTags),
    }))
    .sort((a, b) => {
      // 共通タグ数が多い順 → 完結優先
      if (b.shared.length !== a.shared.length)
        return b.shared.length - a.shared.length;
      const statusScore = (s: Work["status"]) =>
        s === "completed" ? 2 : s === "ongoing" ? 1 : 0;
      return statusScore(b.work.status) - statusScore(a.work.status);
    })
    .slice(0, SIMILAR_TASTE_MAX);

  if (candidates.length === 0) return null;

  const items: SimilarWorkItem[] = candidates.map(({ work, shared }) => ({
    workId: work.workId,
    fileId: fileIdMap.get(work.workId)!,
    title: work.title,
    authorDisplay: work.authorDisplay,
    type: work.type,
    status: work.status,
    volumeCount: work.volumeCount,
    coverImageUrl: work.coverImageUrl,
    reason: makeSimilarTasteReason(shared),
  }));

  return {
    type: "similar_taste",
    title: "読み味が近い作品",
    items,
  };
}

// ── メイン処理 ────────────────────────────────────────────────────

function main(): void {
  const allWorks: Work[] = JSON.parse(readFileSync(WORKS_PATH, "utf-8"));
  console.log(`\n類似作品生成開始 — ${allWorks.length} 作品`);

  // fileId マップ構築
  const fileIdMap = new Map<string, string>();
  for (const w of allWorks) {
    fileIdMap.set(w.workId, djb2hash(w.workId));
  }

  // 処理対象を絞り込み（CLI オプション）
  const targetWorks = targetWorkId
    ? allWorks.filter((w) => w.workId === targetWorkId)
    : allWorks;

  if (targetWorks.length === 0) {
    console.error(`❌ 作品が見つかりません: ${targetWorkId}`);
    process.exit(1);
  }

  let count = 0;
  let emptyCount = 0;

  for (const work of targetWorks) {
    const fileId = fileIdMap.get(work.workId)!;

    // グループ1: 同一著者
    const group1 = buildSameAuthorGroup(work, allWorks, fileIdMap, new Set());
    const excludeAfterGroup1 = new Set<string>(
      group1?.items.map((i) => i.workId) ?? []
    );

    // グループ2: 同一出版社
    const group2 = buildSamePublisherGroup(
      work,
      allWorks,
      fileIdMap,
      new Set([...excludeAfterGroup1])
    );
    const excludeAfterGroup2 = new Set<string>([
      ...excludeAfterGroup1,
      ...(group2?.items.map((i) => i.workId) ?? []),
    ]);

    // グループ3: 読み味が近い
    const group3 = buildSimilarTasteGroup(
      work,
      allWorks,
      fileIdMap,
      excludeAfterGroup2
    );

    const groups: SimilarGroup[] = [group1, group2, group3].filter(
      (g): g is SimilarGroup => g !== null && g.items.length > 0
    );

    const output: SimilarWorks = {
      workId: work.workId,
      groups,
      generatedAt: new Date().toISOString(),
    };

    writeFileSync(
      join(OUTPUT_DIR, `${fileId}.json`),
      JSON.stringify(output, null, 2),
      "utf-8"
    );

    if (groups.length === 0) {
      emptyCount++;
    }
    count++;

    if (count % 100 === 0) {
      console.log(`  ${count} / ${targetWorks.length} 完了...`);
    }
  }

  const totalItems = targetWorks.reduce((sum, work) => {
    const fileId = fileIdMap.get(work.workId)!;
    try {
      const data: SimilarWorks = JSON.parse(
        readFileSync(join(OUTPUT_DIR, `${fileId}.json`), "utf-8")
      );
      return (
        sum +
        data.groups.reduce((gs, g) => gs + g.items.length, 0)
      );
    } catch {
      return sum;
    }
  }, 0);

  console.log(`\n✓ 完了`);
  console.log(`  生成: ${count} 作品`);
  console.log(`  類似なし: ${emptyCount} 作品`);
  console.log(`  総類似アイテム: ${totalItems} 件`);
  console.log(`  出力先: data/similar-works/\n`);
}

main();
