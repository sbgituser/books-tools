"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MEDIA_ORIGINALS,
  MEDIA_TYPE_FILTERS,
  QUICK_SEARCH_CHIPS,
  MEDIA_TYPE_CONFIG,
  ORIGINAL_TYPE_CONFIG,
  type MediaOriginalItem,
  type FilterValue,
} from "@/constants/mediaOriginals";

/**
 * Google Books content API の画像URL(?id=XXX)からbook idを取り出し、
 * 該当書籍のGoogle Booksページへのリンクを組み立てる。
 * Googleの画像を表示する場合、該当ページへのリンクが必須(Googleガイドライン)。
 */
function googleBooksPageUrlFromThumbnail(thumbnailUrl?: string): string | null {
  if (!thumbnailUrl) return null;
  const m = thumbnailUrl.match(/[?&]id=([^&]+)/);
  return m ? `https://books.google.com/books?id=${m[1]}` : null;
}

// ── 検索ロジック ──────────────────────────────────────────────

function searchItems(
  items: MediaOriginalItem[],
  query: string,
  filter: FilterValue
): MediaOriginalItem[] {
  const q = query.trim().toLowerCase();

  return items.filter((item) => {
    // フィルタ
    if (filter !== "all" && item.mediaType !== filter) return false;

    // テキスト検索
    if (!q) return true;
    const targets = [
      item.mediaTitle,
      item.originalTitle ?? "",
      item.originalAuthor ?? "",
      item.description,
      ...(item.searchAliases ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return targets.includes(q);
  });
}

// ── サブコンポーネント：カード ──────────────────────────────

function MediaBadge({ type }: { type: MediaOriginalItem["mediaType"] }) {
  const cfg = MEDIA_TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function OriginalTypeBadge({
  type,
}: {
  type: MediaOriginalItem["originalType"];
}) {
  if (!type) return null;
  const cfg = ORIGINAL_TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
    >
      {cfg.label}
    </span>
  );
}

function MediaOriginalCard({
  item,
  onSelect,
}: {
  item: MediaOriginalItem;
  onSelect: (item: MediaOriginalItem) => void;
}) {
  return (
    <article className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2 border-b border-stone-100">
        <div className="flex items-center gap-2 flex-wrap">
          <MediaBadge type={item.mediaType} />
          {item.adaptationLabel && (
            <span className="text-xs text-stone-400 font-medium">
              {item.adaptationLabel}
            </span>
          )}
        </div>
        {item.mediaYear && (
          <span className="text-xs text-stone-400 tabular-nums shrink-0">
            {item.mediaYear}年
          </span>
        )}
      </div>

      {/* 本体 */}
      <div className="flex gap-3 px-4 py-4">
        {/* サムネイル */}
        {item.thumbnailUrl && (
          <div className="shrink-0">
            {(() => {
              const googleBooksUrl = googleBooksPageUrlFromThumbnail(item.thumbnailUrl);
              const img = (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.originalTitle ?? item.mediaTitle}
                  width={56}
                  height={80}
                  className="rounded-md object-cover shadow-sm border border-stone-100"
                  unoptimized
                />
              );
              return googleBooksUrl ? (
                <a
                  href={googleBooksUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.originalTitle ?? item.mediaTitle}をGoogle Booksで見る`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {img}
                </a>
              ) : img;
            })()}
          </div>
        )}

        {/* テキスト情報 */}
        <div className="flex-1 min-w-0">
          {/* 映像タイトル */}
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
            映像作品
          </p>
          <p className="text-sm font-bold text-stone-700 leading-snug truncate">
            {item.mediaTitle}
          </p>

          {/* 矢印 + 原作 */}
          {item.originalExists && item.originalTitle && (
            <div className="mt-2">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
                原作
              </p>
              <p className="text-sm font-bold text-stone-800 leading-snug line-clamp-2">
                {item.originalTitle}
              </p>
              {item.originalAuthor && (
                <p className="text-xs text-stone-500 mt-0.5 truncate">
                  {item.originalAuthor}
                </p>
              )}
              <div className="mt-1">
                <OriginalTypeBadge type={item.originalType} />
              </div>
            </div>
          )}

          {/* 説明文 */}
          <p className="text-xs text-stone-500 mt-2 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* フッター */}
      <div className="px-4 pb-3 flex justify-end">
        <button
          onClick={() => onSelect(item)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
          aria-label={`${item.mediaTitle}の詳細を見る`}
        >
          詳細を見る →
        </button>
      </div>
    </article>
  );
}

// ── サブコンポーネント：詳細モーダル ──────────────────────────

function DetailModal({
  item,
  onClose,
}: {
  item: MediaOriginalItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // スクロール禁止
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const mediaCfg = MEDIA_TYPE_CONFIG[item.mediaType];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル本体 */}
      <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">
        {/* モーダルヘッダー */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-stone-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${mediaCfg.badgeClass}`}
              >
                <span aria-hidden="true">{mediaCfg.icon}</span>
                {mediaCfg.label}
              </span>
              {item.mediaYear && (
                <span className="text-xs text-stone-400">
                  {item.mediaYear}年
                </span>
              )}
            </div>
            <h2
              id="modal-title"
              className="text-lg sm:text-xl font-bold text-stone-900 leading-tight"
            >
              {item.mediaTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* モーダルコンテンツ（スクロール可） */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5 space-y-5">
          {/* 映像 → 原作 パネル */}
          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-start">
            {/* 映像情報 */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                映像作品
              </p>
              <p className="text-base font-bold text-stone-800">
                {item.mediaTitle}
              </p>
              {item.adaptationLabel && (
                <p className="text-xs text-stone-500 mt-1">
                  {item.adaptationLabel}
                </p>
              )}
              {item.mediaYear && (
                <p className="text-xs text-stone-400 mt-1">
                  {item.mediaYear}年
                </p>
              )}
            </div>

            {/* 矢印 */}
            <div className="hidden sm:flex items-center justify-center pt-8">
              <span className="text-2xl text-indigo-400" aria-hidden="true">
                →
              </span>
            </div>

            {/* 原作情報 */}
            {item.originalExists && item.originalTitle ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
                  原作
                </p>
                <p className="text-base font-bold text-stone-800">
                  {item.originalTitle}
                </p>
                {item.originalAuthor && (
                  <p className="text-sm text-stone-600 mt-1">
                    著者: {item.originalAuthor}
                  </p>
                )}
                {item.originalType && (
                  <div className="mt-2">
                    <OriginalTypeBadge type={item.originalType} />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-400">
                原作なし（オリジナル作品）
              </div>
            )}
          </div>

          {/* 説明 */}
          <div>
            <h3 className="text-sm font-bold text-stone-700 mb-2">作品について</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* 原作と映像の違い */}
          {item.adaptationNotes && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                原作と映像の違い
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                {item.adaptationNotes}
              </p>
            </div>
          )}

          {/* おすすめ対象 */}
          {item.recommendedFor && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">
              <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
                原作をおすすめする人
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                {item.recommendedFor}
              </p>
            </div>
          )}

          {/* 書籍詳細ページへ */}
          <Link
            href={item.workId
              ? `/works/${item.workId}`
              : `/search?q=${encodeURIComponent(item.originalTitle ?? item.mediaTitle)}`}
            className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 hover:bg-indigo-100 transition-all"
          >
            <span className="text-lg" aria-hidden="true">📖</span>
            <div>
              <p className="text-sm font-semibold text-stone-800">書籍の詳細を見る</p>
              <p className="text-xs text-stone-500">
                {item.originalTitle
                  ? `「${item.originalTitle}」の詳細ページへ`
                  : "原作本の詳細ページへ"}
              </p>
            </div>
            <span className="ml-auto text-stone-300 text-sm">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── サブコンポーネント：空状態 ──────────────────────────────

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="text-4xl mb-4" aria-hidden="true">🔎</div>
      <p className="text-stone-700 font-semibold mb-1">
        「{query}」に一致する作品が見つかりませんでした
      </p>
      <p className="text-sm text-stone-500 mb-6">
        映像作品名・原作書名・著者名で検索できます
      </p>
      <div className="space-y-2">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
          試してみてください
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_SEARCH_CHIPS.slice(0, 5).map((chip) => (
            <button
              key={chip}
              onClick={() => onReset()}
              className="text-sm px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────

export default function MediaOriginalsClient() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedItem, setSelectedItem] = useState<MediaOriginalItem | null>(
    null
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // フィルタ済み結果
  const results = useMemo(
    () => searchItems(MEDIA_ORIGINALS, query, filter),
    [query, filter]
  );

  // サジェスト候補（query があるときのみ）
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchItems(MEDIA_ORIGINALS, query, "all").slice(0, 5);
  }, [query]);

  // クイック検索チップのクリック
  const handleChipClick = useCallback((chip: string) => {
    setQuery(chip);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  // サジェストのクリック
  const handleSuggestionClick = useCallback((item: MediaOriginalItem) => {
    setQuery(item.mediaTitle);
    setShowSuggestions(false);
  }, []);

  // 検索クリア
  const handleReset = useCallback(() => {
    setQuery("");
    setFilter("all");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  // 外クリックでサジェスト閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasQuery = query.trim().length > 0;

  return (
    <>
      {/* 検索エリア */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        {/* 検索ボックス */}
        <div className="relative">
          <label htmlFor="media-search" className="sr-only">
            映像作品名で検索
          </label>
          <div className="relative flex items-center">
            <span
              className="absolute left-4 text-stone-400 text-lg pointer-events-none"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              ref={inputRef}
              id="media-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              placeholder="作品名で検索（例：ガリレオ、君の名は、のだめカンタービレ）"
              className="w-full pl-12 pr-12 py-4 text-sm sm:text-base rounded-2xl border-2 border-stone-200 focus:border-indigo-400 focus:outline-none shadow-sm bg-white placeholder:text-stone-400 transition-colors"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions && suggestions.length > 0}
            />
            {hasQuery && (
              <button
                onClick={handleReset}
                className="absolute right-4 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="検索をクリア"
              >
                ✕
              </button>
            )}
          </div>

          {/* サジェストドロップダウン */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              id="search-suggestions"
              role="listbox"
              className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden"
            >
              {suggestions.map((item) => {
                const cfg = MEDIA_TYPE_CONFIG[item.mediaType];
                return (
                  <button
                    key={item.id}
                    role="option"
                    aria-selected="false"
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-left transition-colors"
                  >
                    <span className="text-base" aria-hidden="true">
                      {cfg.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-stone-800 block truncate">
                        {item.mediaTitle}
                      </span>
                      {item.originalTitle && (
                        <span className="text-xs text-stone-400 truncate block">
                          原作: {item.originalTitle}（{item.originalAuthor}）
                        </span>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* クイック検索チップ（非検索時のみ表示） */}
        {!hasQuery && (
          <div className="mt-4">
            <p className="text-xs text-stone-400 font-medium mb-2">
              人気の検索
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* フィルタタブ */}
      <section className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div
            className="flex gap-1 overflow-x-auto scrollbar-none py-2"
            role="tablist"
            aria-label="メディア種別フィルタ"
          >
            {MEDIA_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                  filter === f.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-stone-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 検索結果 */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        {/* 件数表示 */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-stone-500">
            {hasQuery ? (
              <>
                <span className="font-semibold text-stone-800">
                  「{query}」
                </span>{" "}
                の検索結果:{" "}
                <span className="font-semibold text-indigo-700">
                  {results.length}件
                </span>
              </>
            ) : (
              <>
                全{" "}
                <span className="font-semibold text-stone-800">
                  {results.length}件
                </span>{" "}
                の映像作品
              </>
            )}
          </p>
          {hasQuery && (
            <button
              onClick={handleReset}
              className="text-xs text-stone-400 hover:text-stone-600 underline transition-colors"
            >
              クリア
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <EmptyState query={query} onReset={handleReset} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {results.map((item) => (
              <MediaOriginalCard
                key={item.id}
                item={item}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        )}
      </section>

      {/* 下部コンテンツ（非検索時のみ） */}
      {!hasQuery && (
        <section className="border-t border-stone-200 bg-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-6 text-center">
              関連ツール
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/tools/trend-books"
                className="flex flex-col gap-2 rounded-xl border border-stone-200 p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <span className="text-2xl" aria-hidden="true">📰</span>
                <div>
                  <p className="text-sm font-bold text-stone-800">テーマから本を探す</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    AI・経済・環境などのテーマで選ぶ
                  </p>
                </div>
              </Link>
              <Link
                href="/discover"
                className="flex flex-col gap-2 rounded-xl border border-stone-200 p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <span className="text-2xl" aria-hidden="true">💡</span>
                <div>
                  <p className="text-sm font-bold text-stone-800">気分で本を選ぶ</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    読みたい体験から本を逆引き
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 詳細モーダル */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
