/**
 * book.ts
 * 感情・目的ベース検索のための拡張型定義
 */

import type {
  EmotionalTagId,
  PurposeTagId,
  AtmosphereTagId,
  PaceTag,
  DepthTag,
  ReadingEaseTag,
  CompletionStatus,
  ReadingTimeCategory,
} from "@/constants/bookTags";

// ── 書籍ムードタグ ─────────────────────────────────────────────────

/** books.index.json / split index に追加されるムードタグフィールド */
export interface MoodTags {
  emotionalTags?: EmotionalTagId[];
  purposeTags?: PurposeTagId[];
  atmosphereTags?: AtmosphereTagId[];
  paceTag?: PaceTag;
  depthTag?: DepthTag;
  readingEaseTag?: ReadingEaseTag;
  completionStatus?: CompletionStatus;
  estimatedReadingTimeCategory?: ReadingTimeCategory;
  /** 30〜50文字程度の一言訴求文 */
  recommendationCatch?: string;
  /** こんな人におすすめ */
  recommendedFor?: string[];
}

// ── 気分・目的検索フィルタ ────────────────────────────────────────

export interface MoodSearchFilters {
  emotionalTags: EmotionalTagId[];
  purposeTags: PurposeTagId[];
  atmosphereTags: AtmosphereTagId[];
  paceTag?: PaceTag;
  depthTag?: DepthTag;
  readingEaseTag?: ReadingEaseTag;
  completionStatus?: CompletionStatus;
  estimatedReadingTimeCategory?: ReadingTimeCategory;
}

export const EMPTY_FILTERS: MoodSearchFilters = {
  emotionalTags: [],
  purposeTags: [],
  atmosphereTags: [],
};

// ── ムード検索用書籍エントリ ─────────────────────────────────────

/**
 * books-manga.json のエントリ + ムードタグをマージした型
 * MoodPurposeSearchSection / BookRecommendationCard で使用
 */
export interface MoodBookEntry {
  id: string;
  title: string;
  authors: string[];
  subtitle?: string;
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  keywords: string[];
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  l1Id: string;
  l2Id?: string;
  l3Id?: string;
  l4TagIds: string[];
  sourceIds?: { googleBooksId?: string };
  // ムードタグ（省略可能 — データがない書籍でも動作するように）
  moodTags?: MoodTags;
}

/** スコア付きの検索結果 */
export interface MoodSearchResult {
  book: MoodBookEntry;
  score: number;
  /** どのタグが一致したか（UI表示用） */
  matchedEmotional: EmotionalTagId[];
  matchedPurpose: PurposeTagId[];
  matchedAtmosphere: AtmosphereTagId[];
}
