"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LITERARY_AWARDS } from "@/constants/literaryAwards";
import { buildAmazonUrl } from "@/data/products";
import type { AwardWinner, LiteraryAward } from "@/types/literary-awards";

// ── 型定義 ────────────────────────────────────────────────────

type WinnerWithAward = AwardWinner & { award: LiteraryAward };

// ── 定数定義 ──────────────────────────────────────────────────

const GENRE_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "novel", label: "小説" },
  { value: "manga", label: "漫画" },
  { value: "mystery", label: "ミステリー" },
  { value: "sf", label: "SF" },
  { value: "nonfiction", label: "ノンフィクション" },
  { value: "essay", label: "エッセイ" },
  { value: "horror", label: "ホラー" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "grand_prize", label: "大賞" },
  { value: "nominee", label: "ノミネート" },
] as const;

const SORT_OPTIONS = [
  { value: "year_desc", label: "新しい順" },
  { value: "year_asc", label: "古い順" },
  { value: "award", label: "賞別" },
] as const;

type GenreFilter = typeof GENRE_OPTIONS[number]["value"];
type CategoryFilter = typeof CATEGORY_OPTIONS[number]["value"];
type SortOrder = typeof SORT_OPTIONS[number]["value"];

const GENRE_LABEL: Record<string, string> = {
  novel: "小説",
  manga: "漫画",
  nonfiction: "ノンフィクション",
  essay: "エッセイ",
  mystery: "ミステリー",
  sf: "SF",
  horror: "ホラー",
};

const GENRE_BADGE_CLASS: Record<string, string> = {
  novel: "bg-blue-100 text-blue-700",
  manga: "bg-pink-100 text-pink-700",
  nonfiction: "bg-teal-100 text-teal-700",
  essay: "bg-green-100 text-green-700",
  mystery: "bg-indigo-100 text-indigo-700",
  sf: "bg-cyan-100 text-cyan-700",
  horror: "bg-red-100 text-red-700",
};

// ── サブコンポーネント：受賞作カード ─────────────────────────

function WinnerCard({ item }: { item: WinnerWithAward }) {
  const amazonUrl = buildAmazonUrl(
    item.amazonKeyword ?? `${item.title} ${item.author}`
  );

  return (
    <article className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="px-4 pt-3.5 pb-3 border-b border-stone-100 flex items-center justify-between gap-2">
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 truncate max-w-[60%]">
          {item.award.icon} {item.award.name}
        </span>
        <span className="text-xs text-stone-400 shrink-0 tabular-nums">
          {item.year}年
          {item.session != null ? ` 第${item.session}回` : ""}
        </span>
      </div>

      {/* 本体 */}
      <div className="px-4 py-3.5 flex-1 flex flex-col gap-2">
        {/* タイトル・著者 */}
        <div>
          <h3 className="text-sm font-bold text-stone-900 leading-snug">
            {item.title}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">{item.author}</p>
        </div>

        {/* バッジ行 */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${GENRE_BADGE_CLASS[item.genre] ?? "bg-stone-100 text-stone-600"}`}
          >
            {GENRE_LABEL[item.genre] ?? item.genre}
          </span>
        </div>

        {/* 説明 */}
        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 flex-1">
          {item.description}
        </p>

        {/* テーマチップ */}
        {item.themes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.themes.map((theme) => (
              <span
                key={theme}
                className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="px-4 pb-3.5 pt-0 flex gap-2">
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-xs font-semibold text-amber-700 border border-amber-200 rounded-xl py-2 hover:bg-amber-50 hover:border-amber-400 transition-all"
          aria-label={`${item.title}をAmazonで探す`}
        >
          Amazonで探す →
        </a>
        <Link
          href={`/tools/literary-awards/${item.award.id}`}
          className="text-xs font-semibold text-stone-500 border border-stone-200 rounded-xl px-3 py-2 hover:bg-stone-50 transition-all"
          aria-label={`${item.award.name}の一覧を見る`}
        >
          賞の一覧
        </Link>
      </div>
    </article>
  );
}

// ── メインコンポーネント ──────────────────────────────────────

export default function LiteraryAwardsClient() {
  // フィルタ状態
  const [selectedAwardIds, setSelectedAwardIds] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("year_desc");
  const [majorOnly, setMajorOnly] = useState(false);

  // 全受賞作をフラット化
  const allWinners = useMemo<WinnerWithAward[]>(() => {
    const result: WinnerWithAward[] = [];
    for (const award of LITERARY_AWARDS) {
      for (const winner of award.winners) {
        result.push({ ...winner, award });
      }
    }
    return result;
  }, []);

  // 年一覧 (2004〜2024)
  const years = useMemo(() => {
    const ys = Array.from(new Set(allWinners.map((w) => w.year))).sort(
      (a, b) => b - a
    );
    return ys;
  }, [allWinners]);

  // フィルタ & ソート
  const filtered = useMemo<WinnerWithAward[]>(() => {
    let result = allWinners;

    // 賞フィルタ
    if (selectedAwardIds.length > 0) {
      result = result.filter((w) => selectedAwardIds.includes(w.award.id));
    }

    // メジャー賞フィルタ
    if (majorOnly) {
      result = result.filter((w) => w.award.prestige === "major");
    }

    // 年フィルタ
    if (selectedYear !== "all") {
      result = result.filter((w) => String(w.year) === selectedYear);
    }

    // ジャンルフィルタ
    if (selectedGenre !== "all") {
      result = result.filter((w) => w.genre === selectedGenre);
    }

    // カテゴリフィルタ
    if (selectedCategory !== "all") {
      result = result.filter((w) => w.category === selectedCategory);
    }

    // テキスト検索
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.author.toLowerCase().includes(q) ||
          w.themes.some((t) => t.toLowerCase().includes(q))
      );
    }

    // ソート
    if (sortOrder === "year_desc") {
      result = [...result].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
    } else if (sortOrder === "year_asc") {
      result = [...result].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
    } else if (sortOrder === "award") {
      result = [...result].sort(
        (a, b) =>
          a.award.name.localeCompare(b.award.name) || b.year - a.year
      );
    }

    return result;
  }, [allWinners, selectedAwardIds, majorOnly, selectedYear, selectedGenre, selectedCategory, searchText, sortOrder]);

  // 賞チップ切り替え
  const toggleAward = (id: string) => {
    setSelectedAwardIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedAwardIds([]);
    setSelectedYear("all");
    setSelectedGenre("all");
    setSelectedCategory("all");
    setSearchText("");
    setSortOrder("year_desc");
    setMajorOnly(false);
  };

  const hasActiveFilters =
    selectedAwardIds.length > 0 ||
    selectedYear !== "all" ||
    selectedGenre !== "all" ||
    selectedCategory !== "all" ||
    searchText.trim() !== "" ||
    majorOnly;

  return (
    <>
      {/* ─── フィルタパネル ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-6 sm:py-8">

        {/* テキスト検索 */}
        <div className="mb-5">
          <label
            htmlFor="award-search"
            className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2"
          >
            作品・著者・テーマで検索
          </label>
          <input
            id="award-search"
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="例：米澤穂信、歴史ミステリー、青春..."
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
          />
        </div>

        {/* 賞フィルタ (チップ) */}
        <div className="mb-4">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            賞で絞り込む
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="賞フィルタ"
          >
            {LITERARY_AWARDS.map((award) => {
              const isSelected = selectedAwardIds.includes(award.id);
              return (
                <button
                  key={award.id}
                  onClick={() => toggleAward(award.id)}
                  aria-pressed={isSelected}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    isSelected
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:bg-amber-50"
                  }`}
                >
                  {award.icon} {award.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* カテゴリフィルタ */}
        <div className="mb-4">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            カテゴリ
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="カテゴリフィルタ">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedCategory(opt.value)}
                aria-pressed={selectedCategory === opt.value}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  selectedCategory === opt.value
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:bg-amber-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2列: ジャンル + 年 + ソート */}
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {/* ジャンル */}
          <div>
            <label
              htmlFor="genre-select"
              className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5"
            >
              ジャンル
            </label>
            <select
              id="genre-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value as GenreFilter)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-amber-400 focus:outline-none transition"
            >
              {GENRE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 年 */}
          <div>
            <label
              htmlFor="year-select"
              className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5"
            >
              発表年
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-amber-400 focus:outline-none transition"
            >
              <option value="all">すべての年</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}年
                </option>
              ))}
            </select>
          </div>

          {/* ソート */}
          <div>
            <label
              htmlFor="sort-select"
              className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5"
            >
              並び順
            </label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-amber-400 focus:outline-none transition"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* メジャー賞トグル & クリアボタン */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={majorOnly}
              onChange={(e) => setMajorOnly(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-sm text-stone-600 font-medium">
              メジャー賞のみ表示
            </span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-stone-400 hover:text-amber-600 transition-colors underline"
            >
              フィルタをリセット
            </button>
          )}
        </div>
      </section>

      {/* ─── 結果一覧 ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        {/* 件数表示 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-stone-500">
            <span className="font-bold text-stone-800 text-base">{filtered.length}</span>
            {" "}件の受賞作
          </p>
        </div>

        {/* 結果グリッド or 空状態 */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-4xl mb-3" aria-hidden="true">🔎</p>
            <p className="text-sm font-medium">見つかりませんでした</p>
            <p className="text-xs mt-1">検索条件を変えてお試しください</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-amber-600 hover:underline"
            >
              フィルタをリセット
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <WinnerCard
                key={`${item.award.id}-${item.title}-${item.year}-${i}`}
                item={item}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── 各賞詳細ページへの導線 ─────────────────────────── */}
      <section className="border-t border-stone-200 bg-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
            各賞の詳細ページ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {LITERARY_AWARDS.map((award) => (
              <Link
                key={award.id}
                href={`/tools/literary-awards/${award.id}`}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-stone-200 bg-white p-3 hover:border-amber-300 hover:bg-amber-50 transition-all text-center"
              >
                <span className="text-2xl" aria-hidden="true">
                  {award.icon}
                </span>
                <p className="text-xs font-semibold text-stone-700 leading-tight">
                  {award.name}
                </p>
                <p className="text-[10px] text-stone-400">
                  {award.winners.length}作品
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
