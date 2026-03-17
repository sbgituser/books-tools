/**
 * moodSearch.ts
 * 感情・目的ベース検索のフィルタリング・スコアリングロジック
 */

import type { MoodBookEntry, MoodSearchFilters, MoodSearchResult } from "@/types/book";
import type { EmotionalTagId, PurposeTagId, AtmosphereTagId } from "@/constants/bookTags";

// ── スコアリング定数 ──────────────────────────────────────────────

const SCORE_WEIGHTS = {
  EMOTIONAL_MATCH: 3,   // 感情タグ一致
  PURPOSE_MATCH: 3,     // 目的タグ一致
  ATMOSPHERE_MATCH: 2,  // 雰囲気タグ一致
  EXTRA_CONDITION: 1,   // 補助条件（ペース/重さ/読みやすさ/完結/読書時間）一致
  HAS_CATCH: 0.5,       // recommendationCatch が存在
  HAS_RECOMMENDED_FOR: 0.5, // recommendedFor が存在
} as const;

// ── 単書籍スコア計算 ──────────────────────────────────────────────

interface ScoreDetail {
  score: number;
  matchedEmotional: EmotionalTagId[];
  matchedPurpose: PurposeTagId[];
  matchedAtmosphere: AtmosphereTagId[];
  excluded: boolean;
}

function scoreBook(book: MoodBookEntry, filters: MoodSearchFilters): ScoreDetail {
  const mt = book.moodTags;
  let score = 0;
  const matchedEmotional: EmotionalTagId[] = [];
  const matchedPurpose: PurposeTagId[] = [];
  const matchedAtmosphere: AtmosphereTagId[] = [];

  // ── 感情タグ（グループ内 OR、グループ間 AND）──────────────────
  if (filters.emotionalTags.length > 0) {
    const bookEmotional = mt?.emotionalTags ?? [];
    const matched = filters.emotionalTags.filter(t => bookEmotional.includes(t));
    if (matched.length === 0) return { score: -1, matchedEmotional: [], matchedPurpose: [], matchedAtmosphere: [], excluded: true };
    matchedEmotional.push(...matched);
    score += matched.length * SCORE_WEIGHTS.EMOTIONAL_MATCH;
  }

  // ── 目的タグ（グループ内 OR、グループ間 AND）──────────────────
  if (filters.purposeTags.length > 0) {
    const bookPurpose = mt?.purposeTags ?? [];
    const matched = filters.purposeTags.filter(t => bookPurpose.includes(t));
    if (matched.length === 0) return { score: -1, matchedEmotional: [], matchedPurpose: [], matchedAtmosphere: [], excluded: true };
    matchedPurpose.push(...matched);
    score += matched.length * SCORE_WEIGHTS.PURPOSE_MATCH;
  }

  // ── 雰囲気タグ（グループ内 OR、グループ間 AND）───────────────
  if (filters.atmosphereTags.length > 0) {
    const bookAtmosphere = mt?.atmosphereTags ?? [];
    const matched = filters.atmosphereTags.filter(t => bookAtmosphere.includes(t));
    if (matched.length === 0) return { score: -1, matchedEmotional: [], matchedPurpose: [], matchedAtmosphere: [], excluded: true };
    matchedAtmosphere.push(...matched);
    score += matched.length * SCORE_WEIGHTS.ATMOSPHERE_MATCH;
  }

  // ── 補助条件（すべて任意 — 一致でボーナス）──────────────────
  if (filters.paceTag && mt?.paceTag === filters.paceTag) score += SCORE_WEIGHTS.EXTRA_CONDITION;
  if (filters.depthTag && mt?.depthTag === filters.depthTag) score += SCORE_WEIGHTS.EXTRA_CONDITION;
  if (filters.readingEaseTag && mt?.readingEaseTag === filters.readingEaseTag) score += SCORE_WEIGHTS.EXTRA_CONDITION;
  if (filters.completionStatus && mt?.completionStatus === filters.completionStatus) score += SCORE_WEIGHTS.EXTRA_CONDITION;
  if (filters.estimatedReadingTimeCategory && mt?.estimatedReadingTimeCategory === filters.estimatedReadingTimeCategory) {
    score += SCORE_WEIGHTS.EXTRA_CONDITION;
  }

  // ── リッチデータボーナス ──────────────────────────────────────
  if (mt?.recommendationCatch) score += SCORE_WEIGHTS.HAS_CATCH;
  if (mt?.recommendedFor && mt.recommendedFor.length > 0) score += SCORE_WEIGHTS.HAS_RECOMMENDED_FOR;

  return { score, matchedEmotional, matchedPurpose, matchedAtmosphere, excluded: false };
}

// ── フィルタが空かどうか ──────────────────────────────────────────

export function hasAnyFilter(filters: MoodSearchFilters): boolean {
  return (
    filters.emotionalTags.length > 0 ||
    filters.purposeTags.length > 0 ||
    filters.atmosphereTags.length > 0 ||
    !!filters.paceTag ||
    !!filters.depthTag ||
    !!filters.readingEaseTag ||
    !!filters.completionStatus ||
    !!filters.estimatedReadingTimeCategory
  );
}

// ── 選択フィルタのラベル一覧（サマリー表示用）────────────────────

export function getFilterLabels(
  filters: MoodSearchFilters,
  emotionalMap: Record<string, string>,
  purposeMap: Record<string, string>,
  atmosphereMap: Record<string, string>,
): string[] {
  const labels: string[] = [];
  filters.emotionalTags.forEach(id => { if (emotionalMap[id]) labels.push(emotionalMap[id]); });
  filters.purposeTags.forEach(id => { if (purposeMap[id]) labels.push(purposeMap[id]); });
  filters.atmosphereTags.forEach(id => { if (atmosphereMap[id]) labels.push(atmosphereMap[id]); });
  if (filters.paceTag) labels.push(filters.paceTag);
  if (filters.depthTag) labels.push(filters.depthTag);
  if (filters.readingEaseTag) labels.push(filters.readingEaseTag);
  if (filters.completionStatus) labels.push(filters.completionStatus);
  if (filters.estimatedReadingTimeCategory) labels.push(filters.estimatedReadingTimeCategory);
  return labels;
}

// ── メインフィルタ関数 ────────────────────────────────────────────

/**
 * 書籍リストを気分・目的フィルタで絞り込み、関連度順に返す。
 * フィルタが空の場合はムードタグ付きの書籍を優先しつつ全件を返す。
 */
export function filterByMood(
  books: MoodBookEntry[],
  filters: MoodSearchFilters,
): MoodSearchResult[] {
  const filtering = hasAnyFilter(filters);

  if (!filtering) {
    // フィルタなし → ムードタグ付き書籍を先頭に、全件返す
    const withTags = books.filter(b => b.moodTags);
    const withoutTags = books.filter(b => !b.moodTags);
    return [...withTags, ...withoutTags].map(book => ({
      book,
      score: 0,
      matchedEmotional: [],
      matchedPurpose: [],
      matchedAtmosphere: [],
    }));
  }

  const results: MoodSearchResult[] = [];

  for (const book of books) {
    const detail = scoreBook(book, filters);
    if (detail.excluded || detail.score < 0) continue;
    results.push({
      book,
      score: detail.score,
      matchedEmotional: detail.matchedEmotional,
      matchedPurpose: detail.matchedPurpose,
      matchedAtmosphere: detail.matchedAtmosphere,
    });
  }

  // 関連度降順
  results.sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title, "ja"));
  return results;
}

// ── 単一タグで絞り込む（SEO静的ページ用）────────────────────────

export function filterByEmotionalTag(
  books: MoodBookEntry[],
  tagId: EmotionalTagId,
): MoodBookEntry[] {
  return books.filter(b => b.moodTags?.emotionalTags?.includes(tagId));
}

export function filterByPurposeTag(
  books: MoodBookEntry[],
  tagId: PurposeTagId,
): MoodBookEntry[] {
  return books.filter(b => b.moodTags?.purposeTags?.includes(tagId));
}

export function filterByAtmosphereTag(
  books: MoodBookEntry[],
  tagId: AtmosphereTagId,
): MoodBookEntry[] {
  return books.filter(b => b.moodTags?.atmosphereTags?.includes(tagId));
}

// ── books-manga.json ローダー（クライアント用キャッシュ）────────

let _cache: MoodBookEntry[] | null = null;
let _loading: Promise<MoodBookEntry[]> | null = null;

export async function loadMangaIndex(): Promise<MoodBookEntry[]> {
  if (_cache) return _cache;
  if (!_loading) {
    _loading = fetch("/data/books-manga.json")
      .then(r => {
        if (!r.ok) throw new Error(`books-manga fetch failed: ${r.status}`);
        return r.json() as Promise<MoodBookEntry[]>;
      })
      .then(data => {
        _cache = data;
        return data;
      })
      .catch(err => {
        _loading = null;
        throw err;
      });
  }
  return _loading;
}
