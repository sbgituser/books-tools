"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORY_TREE } from "@/lib/categories";
import {
  loadSearchIndex,
  searchBooks,
  getSuggestions,
  type SearchEntry,
  type SearchResult,
  type Suggestion,
  type SortOrder,
} from "@/lib/searchEngine";
import {
  trackSearchExecuted,
  trackSearchZeroResult,
  trackSearchResultClicked,
  trackSearchSuggestionClicked,
  trackRelatedToolClicked,
  trackSearchFilterChanged,
} from "@/lib/analytics";

// ── カバー画像 ────────────────────────────────────────────────────

function CoverImage({ entry }: { entry: SearchEntry }) {
  const [idx, setIdx] = useState(0);

  const candidates = [
    entry.thumbnailUrl,
    entry.googleBooksId
      ? `https://books.google.com/books/content?id=${entry.googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : undefined,
    entry.isbn13
      ? `https://books.google.com/books/content?vid=ISBN${entry.isbn13}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : undefined,
    entry.isbn13
      ? `https://covers.openlibrary.org/b/isbn/${entry.isbn13}-M.jpg?default=false`
      : undefined,
  ].filter((v): v is string => Boolean(v));

  const src = candidates[idx] ?? null;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        onError={() => setIdx(p => p + 1)}
        className="w-12 h-[68px] sm:w-14 sm:h-[80px] object-cover rounded shadow-sm shrink-0"
      />
    );
  }
  return (
    <div className="w-12 h-[68px] sm:w-14 sm:h-[80px] bg-stone-200 rounded flex items-center justify-center shadow-sm shrink-0">
      <span className="text-stone-500 text-xs font-bold">{entry.title.slice(0, 2)}</span>
    </div>
  );
}

// ── 検索結果カード ────────────────────────────────────────────────

function SearchResultCard({
  result,
  rank,
  query,
}: {
  result: SearchResult;
  rank: number;
  query: string;
}) {
  const { entry } = result;
  const cat = CATEGORY_TREE.find(c => c.id === entry.l1Id);
  const year = entry.publishedDate ? entry.publishedDate.slice(0, 4) : null;
  const rh = entry.estimatedReadingHours;
  const readingLabel = rh
    ? rh < 1
      ? `約${Math.round(rh * 60)}分`
      : `約${rh.toFixed(1)}時間`
    : null;

  return (
    <article className="bg-white border border-stone-200 rounded-xl p-3 sm:p-4 flex gap-3 hover:border-amber-300 hover:shadow-sm transition-all">
      <CoverImage entry={entry} />

      <div className="flex-1 min-w-0">
        {/* カテゴリ + 出版年 */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {cat && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {cat.emoji} {cat.label}
            </span>
          )}
          {year && <span className="text-xs text-stone-400">{year}年</span>}
        </div>

        {/* タイトル */}
        <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug mb-0.5 line-clamp-2">
          {entry.title}
        </h3>

        {/* 著者・出版社 */}
        <p className="text-stone-500 text-xs mb-1.5 line-clamp-1">
          {entry.authors.join(" / ")}
          {entry.publisher ? ` · ${entry.publisher}` : ""}
        </p>

        {/* キーワード */}
        {entry.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {entry.keywords.slice(0, 4).map(k => (
              <span key={k} className="text-xs px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
                {k}
              </span>
            ))}
          </div>
        )}

        {/* 読書時間・ページ数 */}
        {(readingLabel || entry.pageCount) && (
          <p className="text-xs text-stone-400 mb-2">
            {readingLabel && `読書時間 ${readingLabel}`}
            {readingLabel && entry.pageCount && " · "}
            {entry.pageCount && `${entry.pageCount}ページ`}
          </p>
        )}

        {/* アクション */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/works/${entry.id}`}
            onClick={() => {
              trackSearchResultClicked({
                query,
                bookId: entry.id,
                bookTitle: entry.title,
                rank,
              });
            }}
            className="text-xs text-amber-700 font-semibold hover:underline"
          >
            詳細を見る →
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── 0件表示 ───────────────────────────────────────────────────────

function ZeroResultState({ query }: { query: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-stone-500 text-base mb-1">
        「{query}」に該当する本が見つかりませんでした
      </p>
      <p className="text-stone-400 text-sm mb-8">
        表記ゆれや別のキーワードをお試しください
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <Link
          href="/discover"
          className="text-sm text-amber-700 font-semibold hover:underline"
        >
          気分で本を探す →
        </Link>
        <Link
          href="/tools/media-originals"
          className="text-sm text-amber-700 font-semibold hover:underline"
        >
          映像から原作を探す →
        </Link>
      </div>

      <p className="text-stone-500 text-sm font-semibold mb-3">カテゴリから探す</p>
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORY_TREE.map(cat => (
          <Link
            key={cat.id}
            href={`/discover?category=${cat.id}`}
            className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-800 transition-colors"
          >
            {cat.emoji} {cat.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── メイン検索コンポーネント ──────────────────────────────────────

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "score",             label: "関連度順" },
  { value: "newest",            label: "新しい順" },
  { value: "oldest",            label: "古い順" },
  { value: "readingHours_asc",  label: "読書時間が短い順" },
  { value: "readingHours_desc", label: "読書時間が長い順" },
  { value: "pageCount_asc",     label: "ページ数が少ない順" },
  { value: "pageCount_desc",    label: "ページ数が多い順" },
];

const SUGGEST_TYPE_LABEL: Record<Suggestion["type"], string> = {
  title:    "書名",
  author:   "著者",
  isbn:     "ISBN",
  category: "カテゴリ",
};

function SearchPageInner() {
  const params = useSearchParams();
  const router = useRouter();

  // インデックス
  const [index, setIndex]       = useState<SearchEntry[] | null>(null);
  const [indexError, setIndexError] = useState(false);

  // 入力・検索状態
  const [inputValue, setInputValue]   = useState(params.get("q") ?? "");
  const [activeQuery, setActiveQuery] = useState(params.get("q") ?? "");
  const [l1Filter, setL1Filter]       = useState(params.get("l1") ?? "");
  const [sortBy, setSortBy]           = useState<SortOrder>(
    (params.get("sort") as SortOrder) ?? "score",
  );
  const [tab, setTab] = useState<"simple" | "advanced">("simple");

  // 詳細フィルタ
  const [yearFrom, setYearFrom]       = useState("");
  const [yearTo, setYearTo]           = useState("");
  const [minRH, setMinRH]             = useState("");
  const [maxRH, setMaxRH]             = useState("");
  const [authorFilter, setAuthorFilter] = useState("");

  // 結果
  const [results, setResults]     = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  // サジェスト
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);

  // インデックス読み込み
  useEffect(() => {
    loadSearchIndex()
      .then(setIndex)
      .catch(() => setIndexError(true));
  }, []);

  // 検索実行（同期的に実行してUIが固まらないようにsetTimeout(0)を使う）
  const executeSearch = useCallback(
    (
      query: string,
      overrides?: { l1Id?: string; sort?: SortOrder },
    ) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setSearching(true);
      setVisibleCount(20);

      setTimeout(() => {
        setResults(prev => {
          if (!index) return prev;

          const res = searchBooks(index, query, {
            l1Id:            overrides?.l1Id  ?? (l1Filter || undefined),
            sortBy:          overrides?.sort  ?? sortBy,
            yearFrom:        yearFrom   ? parseInt(yearFrom)   : undefined,
            yearTo:          yearTo     ? parseInt(yearTo)     : undefined,
            minReadingHours: minRH      ? parseFloat(minRH)    : undefined,
            maxReadingHours: maxRH      ? parseFloat(maxRH)    : undefined,
            author:          authorFilter || undefined,
            limit:           200,
          });

          if (res.length === 0) {
            trackSearchZeroResult({ query, mode: tab });
          } else {
            trackSearchExecuted({ query, resultCount: res.length, mode: tab });
          }

          setSearching(false);
          return res;
        });
      }, 0);
    },
    [index, l1Filter, sortBy, yearFrom, yearTo, minRH, maxRH, authorFilter, tab],
  );

  // URLパラメータ変化 or インデックス読み込み完了 → 検索
  useEffect(() => {
    const q = params.get("q") ?? "";
    setActiveQuery(q);
    setInputValue(q);
    if (q && index) executeSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, index]);

  // サジェスト更新（デバウンス 300ms）
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!index || inputValue.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    suggestTimer.current = setTimeout(() => {
      setSuggestions(getSuggestions(index, inputValue, CATEGORY_TREE, 8));
    }, 300);
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, [inputValue, index]);

  // サジェスト外クリックで閉じる
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // 検索送信
  function handleSubmit(query?: string) {
    const q = (query ?? inputValue).trim();
    setShowSuggest(false);
    setSelectedIdx(-1);
    if (!q) return;
    setActiveQuery(q);

    const url = new URL(window.location.href);
    url.searchParams.set("q", q);
    if (l1Filter) url.searchParams.set("l1", l1Filter);
    else url.searchParams.delete("l1");
    url.searchParams.set("sort", sortBy);
    router.push(url.pathname + url.search, { scroll: false });

    executeSearch(q);
  }

  // サジェストクリック
  function handleSuggestionClick(s: Suggestion) {
    trackSearchSuggestionClicked({
      query: inputValue,
      suggestionType: s.type,
      suggestionValue: s.value,
    });
    setInputValue(s.value);
    setShowSuggest(false);
    handleSubmit(s.value);
  }

  // キーボード操作
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      if (!showSuggest || suggestions.length === 0) return;
      e.preventDefault();
      setSelectedIdx(p => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      if (!showSuggest || suggestions.length === 0) return;
      e.preventDefault();
      setSelectedIdx(p => Math.max(p - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggest && selectedIdx >= 0) {
        handleSuggestionClick(suggestions[selectedIdx]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowSuggest(false);
      setSelectedIdx(-1);
    }
  }

  function handleSortChange(val: SortOrder) {
    setSortBy(val);
    trackSearchFilterChanged({ filterType: "sort", filterValue: val });
    if (activeQuery) executeSearch(activeQuery, { sort: val });
  }

  function handleL1Change(val: string) {
    setL1Filter(val);
    trackSearchFilterChanged({ filterType: "l1", filterValue: val });
    if (activeQuery) executeSearch(activeQuery, { l1Id: val || undefined });
  }

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = results.length > visibleCount;

  // カテゴリフィルタバー（結果に含まれるカテゴリのみ表示）
  const resultCategories = CATEGORY_TREE.filter(c =>
    results.some(r => r.entry.l1Id === c.id),
  );

  return (
    <>
      <Header />
      <main>
        {/* ヒーロー + 検索入力 */}
        <section className="bg-stone-900 text-white py-10 sm:py-14 px-4">
          <div className="max-w-2xl mx-auto">
            <nav className="flex items-center gap-1 text-xs text-stone-400 mb-4" aria-label="パンくず">
              <Link href="/" className="hover:text-white transition-colors">Books Tools</Link>
              <span aria-hidden="true">›</span>
              <span className="text-stone-300">本を探す</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">本を探す</h1>

            {/* 検索ボックス */}
            <div ref={wrapRef} className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"
                    aria-hidden="true"
                  >
                    🔍
                  </span>
                  <input
                    ref={inputRef}
                    type="search"
                    value={inputValue}
                    onChange={e => {
                      setInputValue(e.target.value);
                      setShowSuggest(true);
                      setSelectedIdx(-1);
                    }}
                    onFocus={() => setShowSuggest(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="書名・著者・キーワード・ISBNで探す"
                    className="w-full pl-10 pr-9 py-3 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    autoComplete="off"
                    aria-label="本を検索"
                    aria-autocomplete="list"
                    aria-expanded={showSuggest && suggestions.length > 0}
                    aria-controls="suggest-list"
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputValue("");
                        setSuggestions([]);
                        setShowSuggest(false);
                        inputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label="入力をクリア"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  検索
                </button>
              </div>

              {/* サジェストドロップダウン */}
              {showSuggest && suggestions.length > 0 && (
                <ul
                  id="suggest-list"
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-lg z-50 overflow-hidden"
                  role="listbox"
                  aria-label="検索候補"
                >
                  {suggestions.map((s, i) => (
                    <li
                      key={`${s.type}-${s.value}`}
                      role="option"
                      aria-selected={i === selectedIdx}
                    >
                      <button
                        type="button"
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          i === selectedIdx ? "bg-amber-50" : "hover:bg-stone-50"
                        }`}
                        onMouseDown={e => {
                          e.preventDefault();
                          handleSuggestionClick(s);
                        }}
                      >
                        <span className="text-xs font-semibold text-stone-400 w-12 shrink-0">
                          {SUGGEST_TYPE_LABEL[s.type]}
                        </span>
                        <span className="text-sm text-stone-800 truncate">{s.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* モードタブ */}
            <div className="flex gap-1 mt-4" role="tablist" aria-label="検索モード">
              {(["simple", "advanced"] as const).map(t => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                    tab === t
                      ? "bg-amber-500 text-white"
                      : "text-stone-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t === "simple" ? "かんたん" : "詳細フィルタ"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 詳細フィルタパネル */}
        {tab === "advanced" && (
          <section className="bg-stone-50 border-b border-stone-200 px-4 py-4">
            <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1" htmlFor="filter-author">著者</label>
                <input
                  id="filter-author"
                  type="text"
                  value={authorFilter}
                  onChange={e => setAuthorFilter(e.target.value)}
                  placeholder="著者名（部分一致）"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1" htmlFor="filter-l1">カテゴリ</label>
                <select
                  id="filter-l1"
                  value={l1Filter}
                  onChange={e => handleL1Change(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">すべて</option>
                  {CATEGORY_TREE.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1" htmlFor="filter-yearfrom">出版年（から）</label>
                <input
                  id="filter-yearfrom"
                  type="number"
                  value={yearFrom}
                  onChange={e => setYearFrom(e.target.value)}
                  placeholder="例: 2020"
                  min="1900"
                  max="2030"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1" htmlFor="filter-yearto">出版年（まで）</label>
                <input
                  id="filter-yearto"
                  type="number"
                  value={yearTo}
                  onChange={e => setYearTo(e.target.value)}
                  placeholder="例: 2024"
                  min="1900"
                  max="2030"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1" htmlFor="filter-minrh">読書時間 最小（h）</label>
                <input
                  id="filter-minrh"
                  type="number"
                  value={minRH}
                  onChange={e => setMinRH(e.target.value)}
                  placeholder="例: 2"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1" htmlFor="filter-maxrh">読書時間 最大（h）</label>
                <input
                  id="filter-maxrh"
                  type="number"
                  value={maxRH}
                  onChange={e => setMaxRH(e.target.value)}
                  placeholder="例: 10"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setAuthorFilter("");
                    setYearFrom(""); setYearTo("");
                    setMinRH(""); setMaxRH("");
                    setL1Filter("");
                  }}
                  className="w-full px-3 py-2 text-xs text-stone-500 border border-stone-300 rounded-lg hover:border-stone-400 transition-colors"
                >
                  条件をリセット
                </button>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => { if (activeQuery) executeSearch(activeQuery); }}
                  className="w-full px-3 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  再検索
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 結果エリア */}
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* インデックス読み込み中 */}
          {!index && !indexError && (
            <p className="text-stone-400 text-sm text-center py-12 animate-pulse">読み込み中…</p>
          )}

          {/* インデックスエラー */}
          {indexError && (
            <p className="text-red-500 text-sm text-center py-12">
              データの読み込みに失敗しました。ページを再読み込みしてください。
            </p>
          )}

          {/* クエリなし → カテゴリ一覧 */}
          {index && !activeQuery && (
            <div>
              <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-4">
                カテゴリから探す
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                {CATEGORY_TREE.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setL1Filter(cat.id);
                      setTab("advanced");
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-sm transition-all text-left"
                  >
                    <span className="text-xl shrink-0">{cat.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-800">{cat.label}</p>
                      <p className="text-xs text-stone-400 mt-0.5 truncate">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-center">
                <p className="text-stone-400 text-sm mb-3">他のツールでも本を探せます</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/discover" className="text-sm text-amber-700 font-semibold hover:underline">
                    気分で本を探す →
                  </Link>
                  <Link href="/tools/media-originals" className="text-sm text-amber-700 font-semibold hover:underline">
                    映像から原作を探す →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 検索中 */}
          {index && activeQuery && searching && (
            <p className="text-stone-400 text-sm text-center py-12 animate-pulse">検索中…</p>
          )}

          {/* 結果あり */}
          {index && activeQuery && !searching && results.length > 0 && (
            <div>
              {/* 結果ヘッダー */}
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <p className="text-sm text-stone-600">
                  <span className="font-bold text-stone-900">{results.length}件</span> の結果
                  {l1Filter && (
                    <button
                      type="button"
                      onClick={() => handleL1Change("")}
                      className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
                    >
                      {CATEGORY_TREE.find(c => c.id === l1Filter)?.label} ✕
                    </button>
                  )}
                </p>
                <select
                  value={sortBy}
                  onChange={e => handleSortChange(e.target.value as SortOrder)}
                  className="text-xs px-3 py-1.5 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-400"
                  aria-label="並び順"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* カテゴリクイックフィルタ（かんたんモード + カテゴリ未選択時） */}
              {tab === "simple" && !l1Filter && resultCategories.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-4" aria-label="カテゴリで絞り込む">
                  {resultCategories.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleL1Change(c.id)}
                      className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              )}

              {/* 結果リスト */}
              <div className="space-y-3">
                {visibleResults.map((r, i) => (
                  <SearchResultCard
                    key={r.entry.id}
                    result={r}
                    rank={i + 1}
                    query={activeQuery}
                  />
                ))}
              </div>

              {/* もっと見る */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(v => v + 20)}
                    className="px-5 py-2.5 text-sm font-semibold border border-stone-300 rounded-xl hover:border-amber-400 hover:text-amber-700 transition-colors"
                  >
                    さらに表示（残り {results.length - visibleCount}件）
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 0件 */}
          {index && activeQuery && !searching && results.length === 0 && (
            <ZeroResultState query={activeQuery} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Suspenseラッパー ──────────────────────────────────────────────

function LoadingScreen() {
  return (
    <>
      <Header />
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-400 text-sm animate-pulse">読み込み中…</p>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SearchPageInner />
    </Suspense>
  );
}
