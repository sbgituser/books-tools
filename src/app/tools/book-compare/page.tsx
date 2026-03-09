"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORY_TREE } from "@/lib/categories";
import { trackBookCompareOpen } from "@/lib/analytics";

// ── 型定義 ──────────────────────────────────────────────────────

interface RawBook {
  id: string;
  title: string;
  authors: string[];
  categories: string[];
  keywords: string[];
  searchableText: string;
  subtitle?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
}

interface CachedBook extends RawBook {
  l1Id: string;
}

type CompareField =
  | "authors"
  | "publishedYear"
  | "pageCount"
  | "estimatedReadingHours"
  | "categories"
  | "descriptionSummary"
  | "commonKeywords"
  | "diffKeywords";

const FIELD_CONFIG: { key: CompareField; label: string; defaultOn: boolean }[] = [
  { key: "authors",               label: "著者",         defaultOn: true  },
  { key: "publishedYear",         label: "出版年",       defaultOn: true  },
  { key: "pageCount",             label: "ページ数",     defaultOn: true  },
  { key: "estimatedReadingHours", label: "読書時間",     defaultOn: true  },
  { key: "categories",            label: "カテゴリ",     defaultOn: true  },
  { key: "descriptionSummary",    label: "説明",         defaultOn: false },
  { key: "commonKeywords",        label: "共通キーワード", defaultOn: true },
  { key: "diffKeywords",          label: "相違キーワード", defaultOn: true },
];

const DEFAULT_FIELDS = FIELD_CONFIG.filter(f => f.defaultOn).map(f => f.key);

const L1_IDS = [
  "business", "tech", "self-help", "investing",
  "psychology", "novel", "philosophy", "history", "science", "manga",
];

// ── データ管理 ──────────────────────────────────────────────────

const bookCache = new Map<string, CachedBook[]>();

async function loadL1Books(l1Id: string): Promise<CachedBook[]> {
  if (bookCache.has(l1Id)) return bookCache.get(l1Id)!;
  const res = await fetch(`/data/books-${l1Id}.json`);
  const books: RawBook[] = await res.json();
  const cached: CachedBook[] = books
    .filter(b => b.title && b.authors?.length)
    .map(b => ({ ...b, l1Id }));
  bookCache.set(l1Id, cached);
  return cached;
}

async function searchBooks(query: string): Promise<CachedBook[]> {
  if (query.trim().length < 2) return [];
  const q = query.toLowerCase();
  const allResults: { book: CachedBook; score: number }[] = [];

  await Promise.all(
    L1_IDS.map(async (l1Id) => {
      const books = await loadL1Books(l1Id);
      for (const book of books) {
        let score = 0;
        if (book.title.toLowerCase().includes(q)) score += 10;
        if (book.authors.some(a => a.toLowerCase().includes(q))) score += 6;
        if (book.subtitle?.toLowerCase().includes(q)) score += 3;
        if (score > 0) allResults.push({ book, score });
      }
    })
  );

  allResults.sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title, "ja"));
  return allResults.slice(0, 15).map(r => r.book);
}

async function getBookById(id: string): Promise<CachedBook | null> {
  for (const l1Id of L1_IDS) {
    const books = await loadL1Books(l1Id);
    const found = books.find(b => b.id === id);
    if (found) return found;
  }
  return null;
}

// ── ユーティリティ ──────────────────────────────────────────────

function getPublishedYear(publishedDate?: string): string {
  if (!publishedDate) return "—";
  const m = publishedDate.match(/^(\d{4})/);
  return m ? m[1] : "—";
}

function getCategoryLabel(l1Id: string): string {
  return CATEGORY_TREE.find(c => c.id === l1Id)?.label ?? l1Id;
}

function getDescription(book: CachedBook): string {
  if (book.subtitle) return book.subtitle;
  if (book.keywords.length > 0) return book.keywords.slice(0, 5).join("・");
  return "—";
}

function getCommonKeywords(books: CachedBook[]): string[] {
  if (books.length < 2) return [];
  const nonEmpty = books.filter(b => b.keywords.length > 0);
  if (nonEmpty.length < 2) return [];
  const sets = nonEmpty.map(b => new Set(b.keywords));
  return [...sets[0]].filter(k => sets.slice(1).every(s => s.has(k))).slice(0, 8);
}

// ── BookMiniCard ────────────────────────────────────────────────

function BookMiniCard({
  book,
  onRemove,
  isBase = false,
}: {
  book: CachedBook;
  onRemove?: () => void;
  isBase?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border ${
        isBase ? "bg-amber-50 border-amber-300" : "bg-white border-stone-200"
      }`}
    >
      {book.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.thumbnailUrl}
          alt=""
          className="w-10 h-14 object-cover rounded shadow-sm shrink-0"
        />
      ) : (
        <div className="w-10 h-14 bg-stone-100 rounded flex items-center justify-center shrink-0">
          <span className="text-stone-400 text-xs">📚</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        {isBase && (
          <p className="text-xs font-bold text-amber-700 mb-0.5 uppercase tracking-wider">起点</p>
        )}
        <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">
          {book.title}
        </p>
        <p className="text-stone-500 text-xs mt-0.5 truncate">{book.authors.join(" / ")}</p>
        <p className="text-stone-400 text-xs mt-0.5">{getCategoryLabel(book.l1Id)}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 text-stone-400 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1"
          aria-label="削除"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── SearchPanel ─────────────────────────────────────────────────

function SearchPanel({
  onSelect,
  excludeIds = [],
  placeholder = "タイトルまたは著者名で検索",
}: {
  onSelect: (book: CachedBook) => void;
  excludeIds?: string[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CachedBook[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excludeIdsRef = useRef(excludeIds);
  excludeIdsRef.current = excludeIds;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      const res = await searchBooks(query);
      setResults(res.filter(b => !excludeIdsRef.current.includes(b.id)));
      setSearching(false);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const handleSelect = useCallback(
    (book: CachedBook) => {
      onSelect(book);
      setQuery("");
      setResults([]);
    },
    [onSelect]
  );

  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
            検索中…
          </span>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {results.map(book => (
            <button
              key={book.id}
              onClick={() => handleSelect(book)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0"
            >
              {book.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.thumbnailUrl}
                  alt=""
                  className="w-8 h-11 object-cover rounded shadow-sm shrink-0"
                />
              ) : (
                <div className="w-8 h-11 bg-stone-100 rounded flex items-center justify-center shrink-0">
                  <span className="text-stone-400 text-xs">📚</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 line-clamp-1">{book.title}</p>
                <p className="text-xs text-stone-500 truncate">
                  {book.authors.join(" / ")} · {getCategoryLabel(book.l1Id)}
                </p>
              </div>
              <span className="text-amber-600 text-xs font-semibold shrink-0">追加 +</span>
            </button>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && results.length === 0 && !searching && (
        <p className="mt-2 text-sm text-stone-400 text-center py-3">見つかりませんでした</p>
      )}
    </div>
  );
}

// ── FieldSelector ────────────────────────────────────────────────

function FieldSelector({
  selectedFields,
  onToggle,
}: {
  selectedFields: CompareField[];
  onToggle: (field: CompareField) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FIELD_CONFIG.map(({ key, label }) => {
        const active = selectedFields.includes(key);
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              active
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-white text-stone-500 border-stone-300 hover:border-amber-300 hover:text-amber-700"
            }`}
          >
            {active ? "✓ " : ""}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── CompareTable ─────────────────────────────────────────────────

function CellValue({
  field,
  book,
  allBooks,
}: {
  field: CompareField;
  book: CachedBook;
  allBooks: CachedBook[];
}) {
  switch (field) {
    case "authors":
      return <span>{book.authors.join(" / ") || "—"}</span>;

    case "publishedYear":
      return <span>{getPublishedYear(book.publishedDate)}</span>;

    case "pageCount":
      return <span>{book.pageCount ? `${book.pageCount.toLocaleString()}ページ` : "—"}</span>;

    case "estimatedReadingHours": {
      const h = book.estimatedReadingHours;
      if (!h) return <span>—</span>;
      return <span>{h < 1 ? `約${Math.round(h * 60)}分` : `約${h.toFixed(1)}時間`}</span>;
    }

    case "categories":
      return <span>{getCategoryLabel(book.l1Id)}</span>;

    case "descriptionSummary":
      return (
        <span className="text-xs leading-relaxed text-stone-600">{getDescription(book)}</span>
      );

    case "commonKeywords": {
      const common = getCommonKeywords(allBooks);
      if (common.length === 0)
        return <span className="text-stone-400 text-xs">共通キーワードなし</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {common.map(k => (
            <span
              key={k}
              className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs border border-green-200"
            >
              {k}
            </span>
          ))}
        </div>
      );
    }

    case "diffKeywords": {
      const base = allBooks[0];
      const isBase = book.id === base.id;
      const compareSet = isBase
        ? new Set(allBooks.slice(1).flatMap(b => b.keywords))
        : new Set(base.keywords);
      const uniqueKeywords = book.keywords
        .filter(k => !compareSet.has(k))
        .slice(0, 6);

      if (uniqueKeywords.length === 0)
        return <span className="text-stone-400 text-xs">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {uniqueKeywords.map(k => (
            <span
              key={k}
              className={`px-1.5 py-0.5 rounded text-xs border ${
                isBase
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              }`}
            >
              {k}
            </span>
          ))}
        </div>
      );
    }

    default:
      return <span>—</span>;
  }
}

function CompareTable({
  books,
  selectedFields,
}: {
  books: CachedBook[];
  selectedFields: CompareField[];
}) {
  if (books.length < 2 || selectedFields.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-stone-800 text-white">
            <th className="sticky left-0 bg-stone-800 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider min-w-[100px] z-10 border-r border-stone-700">
              比較項目
            </th>
            {books.map((book, i) => (
              <th
                key={book.id}
                className={`px-4 py-3 text-left min-w-[190px] max-w-[240px] align-top ${
                  i === 0 ? "border-l-2 border-amber-400" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {book.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.thumbnailUrl}
                      alt=""
                      className="w-7 h-10 object-cover rounded shadow-sm shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-7 h-10 bg-stone-600 rounded shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    {i === 0 && (
                      <p className="text-amber-400 text-xs font-bold mb-0.5 uppercase tracking-wide">
                        起点
                      </p>
                    )}
                    <p className="font-semibold text-white text-xs leading-snug line-clamp-2">
                      {book.title}
                    </p>
                    <p className="text-stone-400 text-xs truncate mt-0.5">
                      {book.authors[0] ?? ""}
                    </p>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {selectedFields.map((field, fi) => {
            const fieldLabel = FIELD_CONFIG.find(f => f.key === field)?.label ?? field;
            return (
              <tr key={field} className={fi % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                <td
                  className={`sticky left-0 px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 z-10 ${
                    fi % 2 === 0 ? "bg-white" : "bg-stone-50"
                  }`}
                >
                  {fieldLabel}
                </td>
                {books.map((book, i) => (
                  <td
                    key={book.id}
                    className={`px-4 py-3 text-stone-700 align-top ${
                      i === 0 ? "border-l-2 border-amber-200" : ""
                    }`}
                  >
                    <CellValue field={field} book={book} allBooks={books} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Inner page (useSearchParams)
// ════════════════════════════════════════════════════════════════

function BookCompareInner() {
  const params = useSearchParams();
  const [baseBook, setBaseBook] = useState<CachedBook | null>(null);
  const [compareBooks, setCompareBooks] = useState<CachedBook[]>([]);
  const [selectedFields, setSelectedFields] = useState<CompareField[]>(DEFAULT_FIELDS);
  const [showAddSearch, setShowAddSearch] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // URL パラメータから初期状態を復元
  useEffect(() => {
    const baseId = params.get("baseId");
    const compareIdsParam = params.get("compareIds");
    const compareIds = compareIdsParam ? compareIdsParam.split(",").filter(Boolean) : [];

    (async () => {
      if (baseId) {
        const book = await getBookById(baseId);
        if (book) {
          setBaseBook(book);
          trackBookCompareOpen({
            baseBookId: book.id,
            baseBookTitle: book.title,
            source: "browser",
          });
        }
      }
      if (compareIds.length > 0) {
        const books = (
          await Promise.all(compareIds.map(id => getBookById(id)))
        ).filter(Boolean) as CachedBook[];
        setCompareBooks(books);
      }
      setInitialized(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allBooks = baseBook ? [baseBook, ...compareBooks] : [];
  const canAddMore = allBooks.length < 4;
  const excludeIds = allBooks.map(b => b.id);

  const toggleField = useCallback((field: CompareField) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  }, []);

  const handleAddCompare = useCallback((book: CachedBook) => {
    setCompareBooks(prev => [...prev, book]);
    setShowAddSearch(false);
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* ページヘッダー */}
        <section className="bg-gradient-to-br from-stone-800 to-stone-700 text-white px-4 py-8 sm:py-10">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-1 text-xs text-stone-400 mb-3">
              <Link href="/" className="hover:text-white transition-colors">
                Books Tools
              </Link>
              <span>›</span>
              <span className="text-stone-300">本を比較する</span>
            </nav>
            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2">
              Book Compare
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">本を比較する</h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              気になる本を並べて、違いと共通点を確認できます。
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {/* ── 1. 比較元書籍 ── */}
          <section>
            <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-3">
              比較の起点
            </h2>
            {!baseBook ? (
              <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl p-6">
                <p className="text-stone-500 text-sm mb-4 text-center">
                  比較したい本を1冊選んでください
                </p>
                <SearchPanel
                  onSelect={book => {
                    setBaseBook(book);
                    trackBookCompareOpen({
                      baseBookId: book.id,
                      baseBookTitle: book.title,
                      source: "direct",
                    });
                  }}
                  excludeIds={excludeIds}
                  placeholder="タイトルまたは著者名で検索…"
                />
                {initialized && (
                  <p className="text-xs text-stone-400 text-center mt-4">
                    <Link
                      href="/similar-books"
                      className="text-amber-600 hover:underline"
                    >
                      書籍ブラウザで本を探す →
                    </Link>
                  </p>
                )}
              </div>
            ) : (
              <BookMiniCard
                book={baseBook}
                isBase
                onRemove={() => {
                  setBaseBook(null);
                  setCompareBooks([]);
                  setShowAddSearch(false);
                }}
              />
            )}
          </section>

          {/* ── 2. 比較対象 ── */}
          {baseBook && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider">
                  比較対象{" "}
                  <span className="text-stone-400 font-normal normal-case">（最大3冊）</span>
                </h2>
                {canAddMore && compareBooks.length > 0 && (
                  <button
                    onClick={() => setShowAddSearch(s => !s)}
                    className="text-xs text-amber-700 font-semibold hover:underline"
                  >
                    {showAddSearch ? "✕ 閉じる" : "+ 本を追加"}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {compareBooks.map((book, i) => (
                  <BookMiniCard
                    key={book.id}
                    book={book}
                    onRemove={() =>
                      setCompareBooks(prev => prev.filter((_, j) => j !== i))
                    }
                  />
                ))}
              </div>

              {compareBooks.length === 0 && !showAddSearch && (
                <button
                  onClick={() => setShowAddSearch(true)}
                  className="w-full mt-2 py-5 border border-dashed border-stone-300 rounded-xl text-stone-400 hover:border-amber-400 hover:text-amber-600 transition-all text-sm"
                >
                  ＋ 比較する本を追加
                </button>
              )}

              {showAddSearch && canAddMore && (
                <div className="mt-3">
                  <SearchPanel
                    onSelect={handleAddCompare}
                    excludeIds={excludeIds}
                    placeholder="追加する本を検索…"
                  />
                </div>
              )}

              {!canAddMore && (
                <p className="text-xs text-stone-400 mt-2 text-center">
                  最大4冊まで比較できます
                </p>
              )}
            </section>
          )}

          {/* ── 3. 比較軸選択 ── */}
          {allBooks.length >= 2 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider">
                  比較項目
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedFields(DEFAULT_FIELDS)}
                    className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    デフォルト
                  </button>
                  <button
                    onClick={() => setSelectedFields(FIELD_CONFIG.map(f => f.key))}
                    className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    すべて
                  </button>
                </div>
              </div>
              <FieldSelector selectedFields={selectedFields} onToggle={toggleField} />
            </section>
          )}

          {/* ── 4. 比較テーブル ── */}
          {allBooks.length >= 2 && selectedFields.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-3">
                比較結果
              </h2>
              <CompareTable books={allBooks} selectedFields={selectedFields} />
              <p className="text-xs text-stone-400 mt-3 text-center">
                ← 横スクロールで全列を確認できます（スマートフォン）
              </p>
            </section>
          )}

          {/* ── 待機メッセージ ── */}
          {baseBook && compareBooks.length === 0 && !showAddSearch && (
            <div className="text-center py-6 text-stone-400 text-sm">
              比較する本を追加すると、違いと共通点が表示されます
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// Default export（Suspense wrapper for useSearchParams）
// ════════════════════════════════════════════════════════════════

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

export default function BookComparePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BookCompareInner />
    </Suspense>
  );
}
