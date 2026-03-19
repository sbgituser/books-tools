/**
 * normalize-works.ts
 *
 * books.index.json のエントリを「作品(Work)」と「巻(Volume)」に正規化する。
 *
 * 処理フロー:
 *   1. books.index.json を読み込む
 *   2. 漫画エントリ: タイトルから巻番号を除去し、同一シリーズをグループ化
 *   3. 小説エントリ: 基本的に各エントリが1作品1巻
 *   4. data/normalized/works.json, volumes.json に書き出す
 *
 * 出力:
 *   data/normalized/works.json   - Work[]
 *   data/normalized/volumes.json - Volume[]
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { Work, Volume, WorkType, WorkStatus, LegacyBookEntry } from "../src/types/work";

// ── ユーティリティ ────────────────────────────────────────────────

/**
 * タイトルを正規化（全角→半角、スペース除去、小文字化）
 */
function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ")
    .replace(/[・‐－\-～〜]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * タイトルから巻番号パターンを検出し、{base, volumeNo} を返す。
 * 巻番号が見つからない場合は { base: title, volumeNo: null }
 */
const VOLUME_PATTERNS: { pattern: RegExp; group: number }[] = [
  // "タイトル　1巻" / "タイトル 1巻"
  { pattern: /^(.+?)[\s　]+(\d+)巻$/, group: 2 },
  // "タイトル（１）" / "タイトル（10）" - 全角数字
  { pattern: /^(.+?)（([０-９]+)）$/, group: 2 },
  // "タイトル(1)" / "タイトル(10)"
  { pattern: /^(.+?)\((\d+)\)$/, group: 2 },
  // "タイトル 1" / "タイトル 10" - 末尾スペース+数字
  { pattern: /^(.+?)[\s　]+(\d+)$/, group: 2 },
  // "タイトル 第1巻" / "タイトル 第10巻"
  { pattern: /^(.+?)[\s　]+第(\d+)巻$/, group: 2 },
  // "タイトル vol.1" / "タイトル Vol.10"
  { pattern: /^(.+?)[\s　]+[Vv]ol\.?(\d+)$/i, group: 2 },
];

function toHalfWidthDigit(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

function extractVolumeInfo(title: string): { base: string; volumeNo: number | null } {
  for (const { pattern, group: _g } of VOLUME_PATTERNS) {
    const m = title.match(pattern);
    if (m) {
      const base = m[1].trim();
      const numStr = toHalfWidthDigit(m[2]);
      const volumeNo = parseInt(numStr, 10);
      if (!isNaN(volumeNo)) {
        return { base, volumeNo };
      }
    }
  }
  return { base: title, volumeNo: null };
}

/**
 * workId 生成: タイトル正規化 + 著者名から安定したIDを作る
 */
function makeWorkId(type: string, baseTitle: string, firstAuthor: string): string {
  const normalBase = normalizeTitle(baseTitle)
    .replace(/[^\w\u3040-\u30ff\u4e00-\u9fff\u3400-\u4dbf]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 40);
  const authorSlug = firstAuthor
    .replace(/[^\w\u3040-\u30ff\u4e00-\u9fff]/g, "")
    .substring(0, 10);
  return `${type}__${normalBase}__${authorSlug}`.toLowerCase();
}

/**
 * volumeId 生成
 */
function makeVolumeId(workId: string, legacyId: string): string {
  return `vol__${workId}__${legacyId}`.substring(0, 80);
}

/**
 * mood タグから discoveryTags を生成（既存資産を活かす）
 */
function buildDiscoveryTags(entry: LegacyBookEntry): string[] {
  const tags: string[] = [];
  const mood = entry.moodTags;
  if (!mood) return tags;

  const emotionalMap: Record<string, string> = {
    cry: "泣ける",
    emotional: "感動",
    sad: "切ない",
    hot: "熱い",
    refreshing: "爽快",
    funny: "笑える",
    healing: "癒やし",
    scary: "怖い",
    hopeless: "絶望",
    positive: "前向き",
    heartwarming: "心温まる",
  };
  const purposeMap: Record<string, string> = {
    thinking: "考えさせられる",
    intellectual: "知的",
    learning: "学べる",
    binge: "一気読み",
    easy: "読みやすい",
    short: "短編",
    immersive: "世界観重視",
    motivated: "やる気が出る",
  };
  const atmosphereMap: Record<string, string> = {
    dark: "ダーク",
    bright: "明るい",
    calm: "穏やか",
    daily: "日常系",
    fantasy: "ファンタジー",
    tense: "バトル",
    gentle: "優しい",
    profound: "深い",
  };

  for (const t of mood.emotionalTags ?? []) {
    if (emotionalMap[t]) tags.push(emotionalMap[t]);
  }
  for (const t of mood.purposeTags ?? []) {
    if (purposeMap[t]) tags.push(purposeMap[t]);
  }
  for (const t of mood.atmosphereTags ?? []) {
    if (atmosphereMap[t]) tags.push(atmosphereMap[t]);
  }
  if (mood.completionStatus === "完結") tags.push("完結");

  return [...new Set(tags)];
}

/**
 * 完結ステータスを判定
 */
function inferStatus(entry: LegacyBookEntry): WorkStatus {
  if (entry.moodTags?.completionStatus === "完結") return "completed";
  if (entry.moodTags?.completionStatus === "連載中") return "ongoing";
  return "unknown";
}

// ── メイン処理 ────────────────────────────────────────────────────

const DATA_DIR = join(process.cwd(), "data", "normalized");
mkdirSync(DATA_DIR, { recursive: true });

const rawData = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/books.index.json"), "utf-8")
) as LegacyBookEntry[];

// manga / novel に絞る
const targets = rawData.filter(
  (b) => b.manualClassification?.l1Id === "manga" || b.manualClassification?.l1Id === "novel"
);

console.log(`対象エントリ数: ${targets.length} (manga + novel)`);

// ── グループ化 ────────────────────────────────────────────────────
// workGroupKey → LegacyBookEntry[]
const groups = new Map<string, LegacyBookEntry[]>();

for (const entry of targets) {
  const type = entry.manualClassification!.l1Id as WorkType;
  const { base } = extractVolumeInfo(entry.title);
  const firstAuthor = entry.authors[0] ?? "unknown";
  const key = makeWorkId(type, base, firstAuthor);

  if (!groups.has(key)) groups.set(key, []);
  groups.get(key)!.push(entry);
}

console.log(`グループ数 (Work候補): ${groups.size}`);

// ── Work / Volume 生成 ────────────────────────────────────────────
const works: Work[] = [];
const volumes: Volume[] = [];

for (const [workId, entries] of groups.entries()) {
  // 代表エントリ: 最も情報が豊富なもの（thumbnailUrl > publishedDate順）
  const sorted = [...entries].sort((a, b) => {
    const scoreA = (a.thumbnailUrl ? 2 : 0) + (a.publishedDate ? 1 : 0);
    const scoreB = (b.thumbnailUrl ? 2 : 0) + (b.publishedDate ? 1 : 0);
    return scoreB - scoreA;
  });
  const representative = sorted[0];

  const type = representative.manualClassification!.l1Id as WorkType;
  const { base: baseTitle } = extractVolumeInfo(representative.title);

  // 発行日の並び
  const dates = entries
    .map((e) => e.publishedDate)
    .filter(Boolean)
    .sort() as string[];

  // discoveryTags: entries 全体から収集してマージ
  const allDiscoveryTags = new Set<string>();
  for (const e of entries) {
    for (const t of buildDiscoveryTags(e)) allDiscoveryTags.add(t);
  }

  // status: 代表エントリで判定
  const status = inferStatus(representative);

  // 巻エントリ生成
  const workVolumes: Volume[] = entries.map((entry) => {
    const { volumeNo } = extractVolumeInfo(entry.title);
    const volumeId = makeVolumeId(workId, entry.id);
    const vol: Volume = {
      volumeId,
      workId,
      volumeNo,
      volumeLabel: volumeNo !== null ? `第${volumeNo}巻` : entry.title,
      title: entry.title,
      publishedDate: entry.publishedDate,
      isbn13: entry.isbn13,
      pageCount: entry.pageCount,
      coverImageUrl: entry.thumbnailUrl,
      googleBooksId: entry.sourceIds?.googleBooksId,
    };
    return vol;
  });

  // volumeNo 順にソート
  workVolumes.sort((a, b) => {
    if (a.volumeNo === null && b.volumeNo === null) return 0;
    if (a.volumeNo === null) return 1;
    if (b.volumeNo === null) return -1;
    return a.volumeNo - b.volumeNo;
  });

  volumes.push(...workVolumes);

  // discoveryAttributes
  const discoveryAttributes: Work["discoveryAttributes"] = {};
  const moodRep = representative.moodTags;
  if (moodRep?.paceTag) discoveryAttributes.paceTag = moodRep.paceTag;
  if (moodRep?.depthTag) discoveryAttributes.depthTag = moodRep.depthTag;
  if (moodRep?.readingEaseTag) discoveryAttributes.readingEaseTag = moodRep.readingEaseTag;
  if (moodRep?.completionStatus) discoveryAttributes.completionStatus = moodRep.completionStatus;
  if (moodRep?.recommendedFor?.length) discoveryAttributes.recommendedFor = moodRep.recommendedFor;

  const work: Work = {
    workId,
    type,
    title: baseTitle,
    titleNormalized: normalizeTitle(baseTitle),
    authorDisplay: representative.authors.join(" / "),
    authors: representative.authors,
    publisherMain: representative.publisher,
    summaryShort: moodRep?.recommendationCatch,
    status,
    volumeCount: workVolumes.length,
    firstPublishedDate: dates[0],
    latestPublishedDate: dates[dates.length - 1],
    coverImageUrl: representative.thumbnailUrl,
    discoveryTags: [...allDiscoveryTags],
    discoveryAttributes,
    relatedWorkIds: [],
    volumeIds: workVolumes.map((v) => v.volumeId),
  };

  works.push(work);
}

// ── 類似作品ID の簡易生成（同type・共通タグ上位） ─────────────────

const worksByType = new Map<WorkType, Work[]>();
for (const w of works) {
  if (!worksByType.has(w.type)) worksByType.set(w.type, []);
  worksByType.get(w.type)!.push(w);
}

for (const work of works) {
  const sameType = worksByType.get(work.type) ?? [];
  const myTags = new Set(work.discoveryTags);
  if (myTags.size === 0) continue;

  const scored = sameType
    .filter((w) => w.workId !== work.workId)
    .map((w) => {
      const overlap = w.discoveryTags.filter((t) => myTags.has(t)).length;
      return { workId: w.workId, overlap };
    })
    .filter((s) => s.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 6);

  work.relatedWorkIds = scored.map((s) => s.workId);
}

// ── 書き出し ──────────────────────────────────────────────────────

writeFileSync(join(DATA_DIR, "works.json"), JSON.stringify(works, null, 2));
writeFileSync(join(DATA_DIR, "volumes.json"), JSON.stringify(volumes, null, 2));

console.log(`\n✓ data/normalized/works.json   (${works.length} 作品)`);
console.log(`✓ data/normalized/volumes.json (${volumes.length} 巻)`);

const mangaWorks = works.filter((w) => w.type === "manga").length;
const novelWorks = works.filter((w) => w.type === "novel").length;
console.log(`  漫画: ${mangaWorks} 作品 / 小説: ${novelWorks} 作品`);
console.log("\nDone. → scripts/generate-works-data.ts を実行してください。");
