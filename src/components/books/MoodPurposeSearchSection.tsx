"use client";

/**
 * MoodPurposeSearchSection.tsx
 * 気分・目的ベース検索のメインUIセクション
 * — タグ選択 → フィルタ実行 → 結果表示まで完結
 */

import { useState, useEffect, useCallback } from "react";
import SearchTagGroup from "./SearchTagGroup";
import SelectedFiltersSummary from "./SelectedFiltersSummary";
import BookRecommendationCard from "./BookRecommendationCard";
import {
  EMOTIONAL_TAGS,
  PURPOSE_TAGS,
  ATMOSPHERE_TAGS,
  PACE_OPTIONS,
  DEPTH_OPTIONS,
  READING_EASE_OPTIONS,
  COMPLETION_OPTIONS,
  READING_TIME_OPTIONS,
  type EmotionalTagId,
  type PurposeTagId,
  type AtmosphereTagId,
  type PaceTag,
  type DepthTag,
  type ReadingEaseTag,
  type CompletionStatus,
  type ReadingTimeCategory,
} from "@/constants/bookTags";
import type { MoodSearchFilters, MoodBookEntry, MoodSearchResult } from "@/types/book";
import { EMPTY_FILTERS } from "@/types/book";
import {
  filterByMood,
  loadMangaIndex,
  hasAnyFilter,
  getFilterLabels,
} from "@/utils/moodSearch";

const emotionalMap = Object.fromEntries(EMOTIONAL_TAGS.map(t => [t.id, t.label]));
const purposeMap   = Object.fromEntries(PURPOSE_TAGS.map(t => [t.id, t.label]));
const atmosphereMap = Object.fromEntries(ATMOSPHERE_TAGS.map(t => [t.id, t.label]));

const PAGE_SIZE = 12;

interface Props {
  /** 初期フィルタ（URL引数などで外部から渡す場合） */
  initialFilters?: Partial<MoodSearchFilters>;
  /** true の場合、データロードをスキップして外部からデータを受け取る */
  books?: MoodBookEntry[];
}

export default function MoodPurposeSearchSection({ initialFilters, books: externalBooks }: Props) {
  // ── データ ────────────────────────────────────────────────────
  const [allBooks, setAllBooks]   = useState<MoodBookEntry[]>(externalBooks ?? []);
  const [loading, setLoading]     = useState(!externalBooks);
  const [loadError, setLoadError] = useState(false);

  // ── フィルタ状態 ───────────────────────────────────────────────
  const [filters, setFilters] = useState<MoodSearchFilters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── 結果 ──────────────────────────────────────────────────────
  const [results, setResults]         = useState<MoodSearchResult[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ── データロード ───────────────────────────────────────────────
  useEffect(() => {
    if (externalBooks) {
      setAllBooks(externalBooks);
      setLoading(false);
      return;
    }
    loadMangaIndex()
      .then(data => {
        setAllBooks(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError(true);
        setLoading(false);
      });
  }, [externalBooks]);

  // ── フィルタ変更時に検索実行 ───────────────────────────────────
  const runFilter = useCallback(
    (f: MoodSearchFilters, books: MoodBookEntry[]) => {
      const res = filterByMood(books, f);
      setResults(res);
      setVisibleCount(PAGE_SIZE);
    },
    [],
  );

  useEffect(() => {
    if (allBooks.length > 0) runFilter(filters, allBooks);
  }, [filters, allBooks, runFilter]);

  // ── タグトグル ────────────────────────────────────────────────
  function toggleTag<T extends string>(
    group: T[],
    id: T,
    setter: (val: T[]) => void,
  ) {
    setter(group.includes(id) ? group.filter(x => x !== id) : [...group, id]);
  }

  function setEmotional(tags: EmotionalTagId[]) {
    setFilters(f => ({ ...f, emotionalTags: tags }));
  }
  function setPurpose(tags: PurposeTagId[]) {
    setFilters(f => ({ ...f, purposeTags: tags }));
  }
  function setAtmosphere(tags: AtmosphereTagId[]) {
    setFilters(f => ({ ...f, atmosphereTags: tags }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  const filterLabels = getFilterLabels(filters, emotionalMap, purposeMap, atmosphereMap);
  const filtering = hasAnyFilter(filters);
  const visibleResults = results.slice(0, visibleCount);
  const hasMore = results.length > visibleCount;

  // ── UI ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">Mood × Purpose Search</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          気分・目的から漫画を探す
        </h2>
        <p className="text-stone-500 text-sm sm:text-base max-w-lg mx-auto">
          タイトルが分からなくても、<strong className="text-stone-700">「今読みたい体験」</strong>から探せます
        </p>
      </div>

      {/* タグ選択パネル */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5">
        {/* 感情タグ */}
        <SearchTagGroup
          title="感情・気分"
          tags={EMOTIONAL_TAGS}
          selected={filters.emotionalTags}
          onToggle={id => toggleTag(filters.emotionalTags, id as EmotionalTagId, setEmotional)}
          colorClass="bg-rose-50 text-rose-600 hover:bg-rose-100"
          selectedClass="bg-rose-500 text-white border-rose-500"
        />

        {/* 目的タグ */}
        <SearchTagGroup
          title="目的・用途"
          tags={PURPOSE_TAGS}
          selected={filters.purposeTags}
          onToggle={id => toggleTag(filters.purposeTags, id as PurposeTagId, setPurpose)}
          colorClass="bg-blue-50 text-blue-600 hover:bg-blue-100"
          selectedClass="bg-blue-500 text-white border-blue-500"
        />

        {/* 雰囲気タグ */}
        <SearchTagGroup
          title="雰囲気・世界観"
          tags={ATMOSPHERE_TAGS}
          selected={filters.atmosphereTags}
          onToggle={id => toggleTag(filters.atmosphereTags, id as AtmosphereTagId, setAtmosphere)}
          colorClass="bg-stone-100 text-stone-600 hover:bg-stone-200"
          selectedClass="bg-stone-700 text-white border-stone-700"
        />

        {/* 詳細条件トグル */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2 transition-colors"
          >
            {showAdvanced ? "▲ 詳細条件を閉じる" : "▼ 詳細条件（テンポ・重さ・完結など）"}
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* テンポ */}
              <div>
                <label className="block text-xs text-stone-500 mb-1 font-semibold">テンポ</label>
                <select
                  value={filters.paceTag ?? ""}
                  onChange={e => setFilters(f => ({ ...f, paceTag: (e.target.value as PaceTag) || undefined }))}
                  className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-rose-400"
                >
                  <option value="">こだわらない</option>
                  {PACE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* 重さ */}
              <div>
                <label className="block text-xs text-stone-500 mb-1 font-semibold">重さ</label>
                <select
                  value={filters.depthTag ?? ""}
                  onChange={e => setFilters(f => ({ ...f, depthTag: (e.target.value as DepthTag) || undefined }))}
                  className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-rose-400"
                >
                  <option value="">こだわらない</option>
                  {DEPTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* 読みやすさ */}
              <div>
                <label className="block text-xs text-stone-500 mb-1 font-semibold">読みやすさ</label>
                <select
                  value={filters.readingEaseTag ?? ""}
                  onChange={e => setFilters(f => ({ ...f, readingEaseTag: (e.target.value as ReadingEaseTag) || undefined }))}
                  className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-rose-400"
                >
                  <option value="">こだわらない</option>
                  {READING_EASE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* 完結/連載 */}
              <div>
                <label className="block text-xs text-stone-500 mb-1 font-semibold">連載状況</label>
                <select
                  value={filters.completionStatus ?? ""}
                  onChange={e => setFilters(f => ({ ...f, completionStatus: (e.target.value as CompletionStatus) || undefined }))}
                  className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-rose-400"
                >
                  <option value="">こだわらない</option>
                  {COMPLETION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* 読書時間 */}
              <div>
                <label className="block text-xs text-stone-500 mb-1 font-semibold">シリーズ量</label>
                <select
                  value={filters.estimatedReadingTimeCategory ?? ""}
                  onChange={e => setFilters(f => ({ ...f, estimatedReadingTimeCategory: (e.target.value as ReadingTimeCategory) || undefined }))}
                  className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-rose-400"
                >
                  <option value="">こだわらない</option>
                  {READING_TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* クリアボタン */}
        {filtering && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-stone-400 hover:text-rose-500 underline transition-colors"
            >
              条件をすべてクリア
            </button>
          </div>
        )}
      </div>

      {/* 絞り込みサマリー */}
      <SelectedFiltersSummary
        labels={filterLabels}
        resultCount={results.length}
        onClear={clearFilters}
      />

      {/* 結果エリア */}
      {loading && (
        <p className="text-center text-stone-400 text-sm animate-pulse py-12">読み込み中…</p>
      )}

      {loadError && (
        <p className="text-center text-red-500 text-sm py-8">
          データの読み込みに失敗しました。ページを再読み込みしてください。
        </p>
      )}

      {!loading && !loadError && results.length === 0 && filtering && (
        <div className="text-center py-12">
          <p className="text-stone-500 text-base mb-2">条件に合う漫画が見つかりませんでした</p>
          <p className="text-stone-400 text-sm mb-4">タグを減らすか、条件を変えてみてください</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-rose-500 font-semibold hover:underline"
          >
            条件をリセット
          </button>
        </div>
      )}

      {!loading && !loadError && results.length > 0 && (
        <div>
          {/* 結果ヘッダー */}
          {filtering && (
            <p className="text-sm text-stone-600 mb-4">
              <span className="font-bold text-stone-900">{results.length}件</span> が見つかりました
              <span className="text-stone-400 text-xs ml-2">（関連度順）</span>
            </p>
          )}

          {!filtering && (
            <p className="text-sm text-stone-500 mb-4">
              全 <span className="font-bold text-stone-700">{results.length}件</span> の漫画
              <span className="text-stone-400 text-xs ml-2">— タグを選んで絞り込む</span>
            </p>
          )}

          {/* 書籍カード一覧 */}
          <div className="space-y-4">
            {visibleResults.map(r => (
              <BookRecommendationCard
                key={r.book.id}
                book={r.book}
                matchedEmotional={r.matchedEmotional}
                matchedPurpose={r.matchedPurpose}
                matchedAtmosphere={r.matchedAtmosphere}
                score={r.score}
              />
            ))}
          </div>

          {/* もっと見る */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="px-6 py-2.5 text-sm font-semibold border border-stone-300 rounded-xl hover:border-rose-400 hover:text-rose-600 transition-colors"
              >
                さらに表示（残り {results.length - visibleCount}件）
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
