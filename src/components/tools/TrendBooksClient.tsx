"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  TREND_THEMES,
  TREND_BOOKS,
  FEATURED_COLLECTIONS,
  LEVEL_CONFIG,
  type TrendBook,
  type BookLevel,
  type TrendTheme,
} from "@/constants/trendBooks";

// ── フィルタ定義 ──────────────────────────────────────────────

type LevelFilter = "all" | BookLevel;

const LEVEL_FILTERS: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "beginner", label: "初心者向け" },
  { value: "intermediate", label: "中級向け" },
  { value: "advanced", label: "深掘り" },
];

// ── サブコンポーネント：レベルバッジ ─────────────────────────

function LevelBadge({ level }: { level: BookLevel }) {
  const cfg = LEVEL_CONFIG[level];
  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.badgeClass}`}
    >
      {cfg.shortLabel}
    </span>
  );
}

// ── サブコンポーネント：テーマカード ─────────────────────────

function ThemeCard({
  theme,
  count,
  isSelected,
  onClick,
}: {
  theme: TrendTheme;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400
        ${isSelected
          ? "border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-300"
          : theme.cardClass
        }
      `}
      aria-pressed={isSelected}
      aria-label={`${theme.label}のテーマを選択。${count}冊収録`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl sm:text-3xl leading-none" aria-hidden="true">
          {theme.icon}
        </span>
        <span className="text-xs text-stone-400 tabular-nums shrink-0 mt-0.5">
          {count}冊
        </span>
      </div>
      <div className="mt-3">
        <p
          className={`text-sm sm:text-base font-bold leading-snug ${
            isSelected ? "text-teal-700" : "text-stone-800"
          }`}
        >
          {theme.label}
        </p>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
          {theme.description}
        </p>
      </div>
    </button>
  );
}

// ── サブコンポーネント：書籍カード ───────────────────────────

function BookCard({
  book,
  theme,
  onSelect,
}: {
  book: TrendBook;
  theme: TrendTheme;
  onSelect: (book: TrendBook) => void;
}) {
  return (
    <article className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="px-5 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between gap-2">
        <LevelBadge level={book.level} />
        <span className="text-xs text-stone-400 truncate">{theme.label}</span>
      </div>

      {/* 本体 */}
      <div className="px-5 py-4 flex-1 flex flex-col">
        {/* 書名・著者 */}
        <div className="mb-3">
          <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
            {book.title}
          </h3>
          <p className="text-xs text-stone-500 mt-1">{book.author}</p>
        </div>

        {/* なぜ今読むか（強調） */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5 mb-3">
          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
            なぜ今読むか
          </p>
          <p className="text-xs text-teal-800 leading-relaxed">{book.reason}</p>
        </div>

        {/* 説明 */}
        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 flex-1">
          {book.description}
        </p>
      </div>

      {/* フッター */}
      <div className="px-5 pb-4">
        <button
          onClick={() => onSelect(book)}
          className="w-full text-center text-xs font-semibold text-teal-700 border border-teal-200 rounded-xl py-2 hover:bg-teal-50 hover:border-teal-400 transition-all"
          aria-label={`${book.title}の詳細を見る`}
        >
          詳細を見る →
        </button>
      </div>
    </article>
  );
}

// ── サブコンポーネント：詳細モーダル ─────────────────────────

function BookDetailModal({
  book,
  theme,
  onClose,
}: {
  book: TrendBook;
  theme: TrendTheme;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const relatedThemes = TREND_THEMES.filter((t) =>
    book.relatedThemeIds?.includes(t.id)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
    >
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル */}
      <div className="relative w-full sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">
        {/* ヘッダー */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-stone-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <LevelBadge level={book.level} />
              <span
                className={`text-xs font-semibold ${theme.accentClass}`}
              >
                {theme.icon} {theme.label}
              </span>
            </div>
            <h2
              id="book-modal-title"
              className="text-base sm:text-lg font-bold text-stone-900 leading-snug"
            >
              {book.title}
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">{book.author}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* スクロール可能コンテンツ */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5 space-y-4">
          {/* なぜ今読むか */}
          <div className="rounded-xl bg-teal-50 border border-teal-200 p-4">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">
              なぜ今読むか
            </p>
            <p className="text-sm text-teal-800 leading-relaxed">
              {book.reason}
            </p>
          </div>

          {/* 内容の特徴 */}
          <div>
            <h3 className="text-sm font-bold text-stone-700 mb-2">
              内容の特徴
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {book.description}
            </p>
          </div>

          {/* 理解できるようになること */}
          {book.whatYouLearn && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                読むと理解できること
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                {book.whatYouLearn}
              </p>
            </div>
          )}

          {/* 想定読者 */}
          {book.targetReader && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                こんな人におすすめ
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                {book.targetReader}
              </p>
            </div>
          )}

          {/* 関連テーマ */}
          {relatedThemes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                関連テーマ
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedThemes.map((t) => (
                  <span
                    key={t.id}
                    className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-600 font-medium"
                  >
                    {t.icon} {t.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 書籍詳細ページへ */}
          <Link
            href={`/search?q=${encodeURIComponent(book.title)}`}
            className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 hover:bg-teal-100 transition-all"
          >
            <span className="text-lg" aria-hidden="true">📖</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800">書籍の詳細を調べる</p>
              <p className="text-xs text-stone-500 truncate">
                「{book.title}」をサイト内で検索
              </p>
            </div>
            <span className="ml-auto text-stone-300 text-sm shrink-0">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── サブコンポーネント：特集カード ───────────────────────────

function FeaturedCard({
  collection,
  onClick,
}: {
  collection: (typeof FEATURED_COLLECTIONS)[number];
  onClick: (themeId: string, level?: BookLevel) => void;
}) {
  const count = TREND_BOOKS.filter(
    (b) =>
      b.themeId === collection.themeId &&
      (!collection.level || b.level === collection.level)
  ).length;

  return (
    <button
      onClick={() => onClick(collection.themeId, collection.level)}
      className="text-left rounded-xl border border-stone-200 bg-white p-4 hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl" aria-hidden="true">
          {collection.icon}
        </span>
        <p className="text-sm font-bold text-stone-800">{collection.label}</p>
      </div>
      <p className="text-xs text-stone-500 leading-relaxed">
        {collection.description}
      </p>
      <p className="text-xs text-teal-600 font-semibold mt-2">
        {count}冊を見る →
      </p>
    </button>
  );
}

// ── メインコンポーネント ──────────────────────────────────────

export default function TrendBooksClient() {
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [selectedBook, setSelectedBook] = useState<TrendBook | null>(null);

  const selectedTheme = useMemo(
    () => TREND_THEMES.find((t) => t.id === selectedThemeId) ?? null,
    [selectedThemeId]
  );

  // テーマ別件数
  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of TREND_BOOKS) {
      counts[b.themeId] = (counts[b.themeId] ?? 0) + 1;
    }
    return counts;
  }, []);

  // 書籍フィルタ
  const filteredBooks = useMemo(() => {
    if (!selectedThemeId) return [];
    return TREND_BOOKS.filter(
      (b) =>
        b.themeId === selectedThemeId &&
        (levelFilter === "all" || b.level === levelFilter)
    );
  }, [selectedThemeId, levelFilter]);

  // テーマ選択ハンドラ
  const handleThemeSelect = (themeId: string, level?: BookLevel) => {
    setSelectedThemeId(themeId);
    setLevelFilter(level ?? "all");
    // スクロール
    setTimeout(() => {
      document.getElementById("books-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleBack = () => {
    setSelectedThemeId(null);
    setLevelFilter("all");
  };

  const selectedBookTheme = selectedBook
    ? (TREND_THEMES.find((t) => t.id === selectedBook.themeId) ?? TREND_THEMES[0])
    : null;

  return (
    <>
      {/* ─── テーマ選択グリッド ─────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider">
            テーマを選ぶ
          </h2>
          {selectedThemeId && (
            <button
              onClick={handleBack}
              className="text-xs text-stone-400 hover:text-teal-600 transition-colors"
            >
              ← すべてのテーマ
            </button>
          )}
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          role="group"
          aria-label="テーマ選択"
        >
          {TREND_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              count={themeCounts[theme.id] ?? 0}
              isSelected={selectedThemeId === theme.id}
              onClick={() => handleThemeSelect(theme.id)}
            />
          ))}
        </div>
      </section>

      {/* ─── 書籍セクション（テーマ選択後） ────────────────── */}
      {selectedTheme && (
        <section
          id="books-section"
          className="max-w-4xl mx-auto px-4 pb-10"
          aria-label={`${selectedTheme.label}の書籍一覧`}
        >
          {/* テーマヘッダー */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl" aria-hidden="true">
              {selectedTheme.icon}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {selectedTheme.label}
              </h2>
              <p className="text-xs text-stone-500">{selectedTheme.description}</p>
            </div>
          </div>

          {/* レベルフィルタ */}
          <div
            className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 mb-6"
            role="tablist"
            aria-label="レベルフィルタ"
          >
            {LEVEL_FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? (themeCounts[selectedThemeId!] ?? 0)
                  : TREND_BOOKS.filter(
                      (b) =>
                        b.themeId === selectedThemeId && b.level === f.value
                    ).length;

              return (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={levelFilter === f.value}
                  onClick={() => setLevelFilter(f.value)}
                  className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                    levelFilter === f.value
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-stone-500 hover:text-teal-700 hover:bg-teal-50 border border-stone-200"
                  }`}
                >
                  {f.label}
                  <span
                    className={`ml-1.5 text-xs ${
                      levelFilter === f.value ? "text-teal-200" : "text-stone-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* レベル説明 */}
          {levelFilter !== "all" && (
            <p className="text-xs text-stone-400 mb-4 px-1">
              💡 {LEVEL_CONFIG[levelFilter as BookLevel].description}
            </p>
          )}

          {/* 書籍グリッド */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <p className="text-4xl mb-3" aria-hidden="true">📭</p>
              <p className="text-sm">このレベルの書籍はまだ準備中です</p>
              <button
                onClick={() => setLevelFilter("all")}
                className="mt-4 text-sm text-teal-600 hover:underline"
              >
                すべてのレベルを見る
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  theme={selectedTheme}
                  onSelect={setSelectedBook}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─── 非選択時：特集コレクション ─────────────────────── */}
      {!selectedThemeId && (
        <section className="max-w-4xl mx-auto px-4 pb-10">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5">
            特集
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURED_COLLECTIONS.map((col) => (
              <FeaturedCard
                key={col.id}
                collection={col}
                onClick={handleThemeSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── 既存ツール導線 ──────────────────────────────────── */}
      {!selectedThemeId && (
        <section className="border-t border-stone-200 bg-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-6 text-center">
              関連ツール
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/tools/media-originals"
                className="flex flex-col gap-2 rounded-xl border border-stone-200 p-4 hover:border-teal-300 hover:bg-teal-50 transition-all"
              >
                <span className="text-2xl" aria-hidden="true">🎬</span>
                <div>
                  <p className="text-sm font-bold text-stone-800">
                    映像から原作を探す
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    映画・ドラマ・アニメの原作逆引き
                  </p>
                </div>
              </Link>
              <Link
                href="/discover"
                className="flex flex-col gap-2 rounded-xl border border-stone-200 p-4 hover:border-teal-300 hover:bg-teal-50 transition-all"
              >
                <span className="text-2xl" aria-hidden="true">💡</span>
                <div>
                  <p className="text-sm font-bold text-stone-800">
                    気分で本を選ぶ
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    読みたい体験から本を逆引き
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 詳細モーダル ─────────────────────────────────────── */}
      {selectedBook && selectedBookTheme && (
        <BookDetailModal
          book={selectedBook}
          theme={selectedBookTheme}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  );
}
