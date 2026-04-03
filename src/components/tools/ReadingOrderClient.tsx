"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { READING_ORDER_SERIES } from "@/constants/readingOrders";
import type { ReadingOrderSeries } from "@/types/reading-order";

// ── フィルター定義 ────────────────────────────────────────────

type GenreFilter = "all" | "novel" | "manga" | "lightnovel";
type StatusFilter = "all" | "completed" | "ongoing";
type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

const GENRE_FILTERS: { value: GenreFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "novel", label: "小説" },
  { value: "manga", label: "漫画" },
  { value: "lightnovel", label: "ライトノベル" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "completed", label: "完結" },
  { value: "ongoing", label: "連載中" },
];

const DIFFICULTY_FILTERS: { value: DifficultyFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "beginner", label: "入門向け" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
];

const GENRE_CONFIG: Record<
  ReadingOrderSeries["genre"],
  { label: string; badgeClass: string }
> = {
  novel: { label: "小説", badgeClass: "bg-blue-100 text-blue-700" },
  manga: { label: "漫画", badgeClass: "bg-pink-100 text-pink-700" },
  lightnovel: {
    label: "ライトノベル",
    badgeClass: "bg-purple-100 text-purple-700",
  },
};

const STATUS_CONFIG: Record<
  ReadingOrderSeries["status"],
  { label: string; badgeClass: string }
> = {
  completed: { label: "完結", badgeClass: "bg-green-100 text-green-700" },
  ongoing: { label: "連載中", badgeClass: "bg-amber-100 text-amber-700" },
};

const DIFFICULTY_CONFIG: Record<
  ReadingOrderSeries["difficulty"],
  { label: string; badgeClass: string }
> = {
  beginner: { label: "入門向け", badgeClass: "bg-emerald-100 text-emerald-700" },
  intermediate: { label: "中級", badgeClass: "bg-sky-100 text-sky-700" },
  advanced: { label: "上級", badgeClass: "bg-red-100 text-red-700" },
};

// ── 検索ロジック ──────────────────────────────────────────────

function filterSeries(
  series: ReadingOrderSeries[],
  query: string,
  genre: GenreFilter,
  status: StatusFilter,
  difficulty: DifficultyFilter,
): ReadingOrderSeries[] {
  const q = query.trim().toLowerCase();

  return series.filter((s) => {
    if (genre !== "all" && s.genre !== genre) return false;
    if (status !== "all" && s.status !== status) return false;
    if (difficulty !== "all" && s.difficulty !== difficulty) return false;

    if (!q) return true;

    const targets = [
      s.seriesName,
      s.author,
      s.authorReading ?? "",
      s.description,
      ...s.tags,
    ]
      .join(" ")
      .toLowerCase();

    return targets.includes(q);
  });
}

// ── サブコンポーネント ────────────────────────────────────────

function GenreBadge({ genre }: { genre: ReadingOrderSeries["genre"] }) {
  const cfg = GENRE_CONFIG[genre];
  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: ReadingOrderSeries["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
    >
      {cfg.label}
    </span>
  );
}

function SeriesCard({ series }: { series: ReadingOrderSeries }) {
  const diffCfg = DIFFICULTY_CONFIG[series.difficulty];

  return (
    <Link
      href={`/tools/reading-order/${series.id}`}
      className="group flex flex-col gap-3 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <GenreBadge genre={series.genre} />
          <StatusBadge status={series.status} />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffCfg.badgeClass}`}
        >
          {diffCfg.label}
        </span>
      </div>

      {/* タイトル */}
      <div>
        <p className="text-sm font-bold text-stone-900 leading-snug mb-0.5">
          {series.seriesName}
        </p>
        <p className="text-xs text-stone-500">{series.author}</p>
      </div>

      {/* 説明 */}
      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
        {series.description}
      </p>

      {/* メタ情報 */}
      <div className="flex items-center gap-3 text-xs text-stone-400 mt-auto">
        <span>全{series.totalBooks}巻</span>
        {series.estimatedReadingHours && (
          <span>約{series.estimatedReadingHours}時間</span>
        )}
      </div>

      {/* CTA */}
      <span className="text-xs font-semibold text-amber-600 group-hover:text-amber-800 transition-colors">
        読む順番を見る →
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3" aria-hidden="true">
        📭
      </p>
      <p className="text-sm text-stone-500 mb-1">
        条件に一致するシリーズが見つかりませんでした
      </p>
      <p className="text-xs text-stone-400">
        検索キーワードやフィルターを変更してみてください
      </p>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────

export default function ReadingOrderClient() {
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");

  const results = useMemo(
    () =>
      filterSeries(
        READING_ORDER_SERIES,
        query,
        genreFilter,
        statusFilter,
        difficultyFilter,
      ),
    [query, genreFilter, statusFilter, difficultyFilter],
  );

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* 検索 */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="シリーズ名・著者名で検索..."
            className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-sm"
              aria-label="検索をクリア"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* ジャンル */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500 font-semibold shrink-0">
            ジャンル:
          </span>
          <div className="flex gap-1" role="tablist">
            {GENRE_FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={genreFilter === f.value}
                onClick={() => setGenreFilter(f.value)}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  genreFilter === f.value
                    ? "bg-amber-600 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ステータス */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500 font-semibold shrink-0">
            ステータス:
          </span>
          <div className="flex gap-1" role="tablist">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={statusFilter === f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  statusFilter === f.value
                    ? "bg-amber-600 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 難易度 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500 font-semibold shrink-0">
            難易度:
          </span>
          <div className="flex gap-1" role="tablist">
            {DIFFICULTY_FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={difficultyFilter === f.value}
                onClick={() => setDifficultyFilter(f.value)}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  difficultyFilter === f.value
                    ? "bg-amber-600 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 結果件数 */}
      <p className="text-xs text-stone-400 mb-4">
        {results.length}件のシリーズ
      </p>

      {/* 一覧 */}
      {results.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {results.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      )}
    </section>
  );
}
