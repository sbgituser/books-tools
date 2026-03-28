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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { Work, Volume, WorkType, WorkStatus, LegacyBookEntry } from "../src/types/work";

// ── サマリー補完データ ─────────────────────────────────────────────
// data/summaries-supplement.json から workId → summaryShort のマッピングを読み込む
const supplementPath = join(process.cwd(), "data", "summaries-supplement.json");
const summariesSupplement: Record<string, string> = existsSync(supplementPath)
  ? JSON.parse(readFileSync(supplementPath, "utf-8"))
  : {};

// ── 巻数パッチデータ ───────────────────────────────────────────────
// data/volume-count-patches.json から workId → volumeCount のマッピングを読み込む
// fix-manga-volumes.ts で生成されたパッチを適用する
const volumeCountPatchesPath = join(process.cwd(), "data", "volume-count-patches.json");
const volumeCountPatches: Record<string, number> = existsSync(volumeCountPatchesPath)
  ? JSON.parse(readFileSync(volumeCountPatchesPath, "utf-8"))
  : {};

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

  // ── moodTags ベースのマッピング ──────────────────────────────────
  if (mood) {
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
  }

  // ── 小説: l2/l3 + タイトルキーワードからのルールベースタグ ──────
  // moodTags がない場合でも小説には自動的にタグを付与する
  if (entry.manualClassification?.l1Id === "novel") {
    tags.push(...buildNovelDiscoveryTags(entry));
  }

  return [...new Set(tags)];
}

/**
 * 小説向けルールベースの discoveryTags 生成。
 * l2Id / l3Id / タイトルキーワードを組み合わせて判定する。
 */
function buildNovelDiscoveryTags(entry: LegacyBookEntry): string[] {
  const tags: string[] = [];
  const l2 = entry.manualClassification?.l2Id ?? "";
  const l3 = entry.manualClassification?.l3Id ?? "";
  const title = entry.title ?? "";

  // ── L3ベースの精細マッピング ──────────────────────────────────────
  const l3Tags: Record<string, string[]> = {
    "mystery":           ["考えさせられる", "深い", "一気読み"],
    "honkaku-mystery":   ["考えさせられる", "深い"],
    "classic-mystery":   ["考えさせられる", "深い"],
    "suspense":          ["考えさせられる", "怖い", "一気読み"],
    "police":            ["考えさせられる", "深い"],
    "modern-literature": ["感動", "考えさせられる"],
    "literary":          ["感動", "考えさせられる", "深い"],
    "jp-literature":     ["感動", "考えさせられる", "深い"],
    "tearjerker":        ["泣ける", "感動", "切ない"],
    "literary-criticism":["考えさせられる", "学べる"],
    "sf":                ["世界観重視", "考えさせられる"],
    "hard-sf":           ["世界観重視", "考えさせられる", "深い"],
    "space-sf":          ["世界観重視"],
    "ai-tech-sf":        ["考えさせられる", "世界観重視"],
    "near-future":       ["考えさせられる", "世界観重視"],
    "fantasy":           ["ファンタジー", "世界観重視"],
    "modern-fantasy":    ["ファンタジー"],
    "adventure-fantasy": ["ファンタジー", "世界観重視", "熱い"],
    "myth":              ["世界観重視"],
    "romance":           ["泣ける", "感動", "心温まる", "切ない"],
    "horror":            ["怖い", "ダーク"],
  };

  // ── L2ベースのフォールバックマッピング ──────────────────────────
  const l2Tags: Record<string, string[]> = {
    "mystery":           ["考えさせられる", "深い"],
    "literary":          ["感動", "考えさせられる"],
    "sf":                ["世界観重視"],
    "fantasy":           ["ファンタジー", "世界観重視"],
    "romance":           ["泣ける", "感動", "心温まる"],
    "entertainment":     ["読みやすい", "一気読み"],
    "horror":            ["怖い", "ダーク"],
  };

  // L3タグを優先、なければL2タグを使用
  const baseTags = l3Tags[l3] ?? l2Tags[l2] ?? [];
  tags.push(...baseTags);

  // ── タイトルキーワードによる補強 ────────────────────────────────
  // ミステリ系
  if (/ミステリ|推理|探偵|殺人|密室|謎解き|事件|犯人|刑事/.test(title)) {
    if (!tags.includes("考えさせられる")) tags.push("考えさせられる");
    if (!tags.includes("深い")) tags.push("深い");
  }
  // SF系
  if (/SF|宇宙|未来|ロボット|AI|人工知能|量子|タイムトラベル|時間跳躍/.test(title)) {
    if (!tags.includes("世界観重視")) tags.push("世界観重視");
  }
  // ファンタジー系
  if (/ファンタジー|魔法|魔王|ドラゴン|異世界|転生|勇者/.test(title)) {
    if (!tags.includes("ファンタジー")) tags.push("ファンタジー");
    if (!tags.includes("世界観重視")) tags.push("世界観重視");
  }
  // 恋愛・青春系
  if (/恋愛|恋する|青春|ラブ|初恋|片思い|両思い/.test(title)) {
    if (!tags.includes("心温まる")) tags.push("心温まる");
    if (!tags.includes("泣ける")) tags.push("泣ける");
  }
  // 感動・泣き系
  if (/感動|泣ける|涙|切ない|ひとりぼっち/.test(title)) {
    if (!tags.includes("感動")) tags.push("感動");
    if (!tags.includes("泣ける")) tags.push("泣ける");
  }
  // ホラー・怖い系
  if (/ホラー|怖い|恐怖|恐ろしい|呪い|幽霊|心霊/.test(title)) {
    if (!tags.includes("怖い")) tags.push("怖い");
    if (!tags.includes("ダーク")) tags.push("ダーク");
  }
  // 日常・ほのぼの系
  if (/日常|ほのぼの|ゆったり|穏やか|のんびり/.test(title)) {
    if (!tags.includes("日常系")) tags.push("日常系");
    if (!tags.includes("癒やし")) tags.push("癒やし");
  }
  // 笑える系
  if (/コメディ|笑え|ユーモア|おかしな|おもしろ/.test(title)) {
    if (!tags.includes("笑える")) tags.push("笑える");
  }
  // 冒険・熱い系
  if (/冒険|旅|探検|チャレンジ|熱い|情熱/.test(title)) {
    if (!tags.includes("熱い")) tags.push("熱い");
  }

  // ── 完結判定（単巻小説は基本完結） ──────────────────────────────
  // volumeCount は Work 生成後にしか分からないが、ここでは
  // moodTags の completionStatus がある場合のみ反映（単独ではここで判断不可）

  return tags;
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

  // L2/L3 カテゴリの多数決（全巻から最頻値を採用）
  const l2Votes = new Map<string, number>();
  const l3Votes = new Map<string, number>();
  for (const e of entries) {
    const l2 = e.manualClassification?.l2Id;
    const l3 = e.manualClassification?.l3Id;
    if (l2) l2Votes.set(l2, (l2Votes.get(l2) ?? 0) + 1);
    if (l3) l3Votes.set(l3, (l3Votes.get(l3) ?? 0) + 1);
  }
  const l2Id = l2Votes.size > 0
    ? [...l2Votes.entries()].sort((a, b) => b[1] - a[1])[0][0]
    : undefined;
  const l3Id = l3Votes.size > 0
    ? [...l3Votes.entries()].sort((a, b) => b[1] - a[1])[0][0]
    : undefined;

  const work: Work = {
    workId,
    type,
    title: baseTitle,
    titleNormalized: normalizeTitle(baseTitle),
    authorDisplay: representative.authors.join(" / "),
    authors: representative.authors,
    publisherMain: representative.publisher,
    summaryShort: summariesSupplement[workId] ?? moodRep?.recommendationCatch,
    status,
    volumeCount: volumeCountPatches[workId] ?? workVolumes.length,
    firstPublishedDate: dates[0],
    latestPublishedDate: dates[dates.length - 1],
    coverImageUrl: representative.thumbnailUrl,
    discoveryTags: [...allDiscoveryTags],
    discoveryAttributes,
    ...(l2Id ? { l2Id } : {}),
    ...(l3Id ? { l3Id } : {}),
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
