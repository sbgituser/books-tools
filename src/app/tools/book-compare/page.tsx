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
  pathIds: string[];
  keywords: string[];
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
  | "publisher"
  | "publishedYear"
  | "pageCount"
  | "estimatedReadingHours"
  | "categories"
  | "commonKeywords";

const FIELD_CONFIG: { key: CompareField; label: string; defaultOn: boolean }[] = [
  { key: "authors",               label: "著者",         defaultOn: true  },
  { key: "publisher",             label: "出版社",       defaultOn: false },
  { key: "publishedYear",         label: "出版年",       defaultOn: false },
  { key: "pageCount",             label: "ページ数",     defaultOn: false },
  { key: "estimatedReadingHours", label: "読書時間",     defaultOn: false },
  { key: "categories",            label: "カテゴリ",     defaultOn: false },
  { key: "commonKeywords",        label: "共通キーワード", defaultOn: false },
];

const DEFAULT_FIELDS = FIELD_CONFIG.filter(f => f.defaultOn).map(f => f.key);

type MatchedBook = CachedBook & {
  matchedBy: CompareField[];
  score: number;
};

type SearchFilters = {
  author: string;
  publisher: string;
  category: string;
  publishedYear: string;
};

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

async function searchBooks(query: string, filters: SearchFilters): Promise<CachedBook[]> {
  if (query.trim().length < 2 && !filters.author && !filters.publisher && !filters.category && !filters.publishedYear) return [];
  const q = query.toLowerCase();
  const allResults: { book: CachedBook; score: number }[] = [];

  await Promise.all(
    L1_IDS.map(async (l1Id) => {
      const books = await loadL1Books(l1Id);
      for (const book of books) {
        if (filters.author && !book.authors.some(a => normalizeText(a).includes(normalizeText(filters.author)))) continue;
        if (filters.publisher && (book.publisher ?? "") !== filters.publisher) continue;
        if (filters.category && getCategoryLabel(book.l1Id) !== filters.category) continue;
        if (filters.publishedYear && getPublishedYear(book.publishedDate) !== filters.publishedYear) continue;

        let score = 0;
        if (q.length >= 2) {
          if (book.title.toLowerCase().includes(q)) score += 10;
          if (book.authors.some(a => a.toLowerCase().includes(q))) score += 6;
          if (book.subtitle?.toLowerCase().includes(q)) score += 3;
          if (book.keywords.some(k => k.toLowerCase().includes(q))) score += 2;
        }

        if (filters.author) score += 3;
        if (filters.publisher) score += 2;
        if (filters.category) score += 2;
        if (filters.publishedYear) score += 2;

        if (q.length < 2 && score > 0) score += 1;
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

function formatReadingHours(hours?: number): string {
  if (!hours) return "—";
  return hours < 1 ? `約${Math.round(hours * 60)}分` : `約${hours.toFixed(1)}時間`;
}

function getCommonKeywords(books: CachedBook[]): string[] {
  if (books.length < 2) return [];
  const nonEmpty = books.filter(b => b.keywords.length > 0);
  if (nonEmpty.length < 2) return [];
  const sets = nonEmpty.map(b => new Set(b.keywords));
  return [...sets[0]].filter(k => sets.slice(1).every(s => s.has(k))).slice(0, 8);
}

function normalizeText(v: string): string {
  return v.trim().toLowerCase();
}

function toYear(v?: string): number | null {
  if (!v) return null;
  const m = v.match(/^(\d{4})/);
  return m ? Number(m[1]) : null;
}

function withinRange(base: number, target: number, ratio: number, minAbs: number): boolean {
  const threshold = Math.max(minAbs, base * ratio);
  return Math.abs(base - target) <= threshold;
}

function countKeywordOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const set = new Set(b.map(normalizeText));
  return a.map(normalizeText).filter(k => set.has(k)).length;
}

function isMatchedByField(base: CachedBook, candidate: CachedBook, field: CompareField): boolean {
  switch (field) {
    case "authors": {
      const baseAuthors = new Set(base.authors.map(normalizeText));
      return candidate.authors.some(a => baseAuthors.has(normalizeText(a)));
    }
    case "publisher": {
      if (!base.publisher || !candidate.publisher) return false;
      return normalizeText(base.publisher) === normalizeText(candidate.publisher);
    }
    case "publishedYear": {
      const by = toYear(base.publishedDate);
      const cy = toYear(candidate.publishedDate);
      if (by == null || cy == null) return false;
      return Math.abs(by - cy) <= 1;
    }
    case "pageCount": {
      if (!base.pageCount || !candidate.pageCount) return false;
      return withinRange(base.pageCount, candidate.pageCount, 0.25, 40);
    }
    case "estimatedReadingHours": {
      if (!base.estimatedReadingHours || !candidate.estimatedReadingHours) return false;
      return withinRange(base.estimatedReadingHours, candidate.estimatedReadingHours, 0.3, 0.8);
    }
    case "categories": {
      if (base.l1Id === candidate.l1Id) return true;
      const basePath = new Set(base.pathIds.map(normalizeText));
      return candidate.pathIds.some(p => basePath.has(normalizeText(p)));
    }
    case "commonKeywords": {
      return countKeywordOverlap(base.keywords, candidate.keywords) >= 1;
    }
    default:
      return false;
  }
}

async function findMatchedBooks(base: CachedBook, selectedFields: CompareField[]): Promise<MatchedBook[]> {
  if (selectedFields.length === 0) return [];

  const buckets = await Promise.all(L1_IDS.map(loadL1Books));
  const allBooks = buckets.flat();

  const matched: MatchedBook[] = [];
  for (const candidate of allBooks) {
    if (candidate.id === base.id) continue;

    const matchedBy = selectedFields.filter(field => isMatchedByField(base, candidate, field));
    const allMatched = matchedBy.length === selectedFields.length;
    if (!allMatched) continue;

    const score =
      matchedBy.length * 10 +
      countKeywordOverlap(base.keywords, candidate.keywords) +
      (base.l1Id === candidate.l1Id ? 2 : 0);

    matched.push({ ...candidate, matchedBy, score });
  }

  return matched.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ja"));
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
  placeholder = "キーワードで検索（タイトル・著者・キーワード）",
}: {
  onSelect: (book: CachedBook) => void;
  excludeIds?: string[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ author: "", publisher: "", category: "", publishedYear: "" });
  const [results, setResults] = useState<CachedBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [publishedYears, setPublishedYears] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excludeIdsRef = useRef(excludeIds);
  excludeIdsRef.current = excludeIds;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const buckets = await Promise.all(L1_IDS.map(loadL1Books));
      const all = buckets.flat();

      const publisherSet = new Set<string>();
      const categorySet = new Set<string>();
      const yearSet = new Set<string>();

      for (const b of all) {
        if (b.publisher) publisherSet.add(b.publisher);
        categorySet.add(getCategoryLabel(b.l1Id));
        const y = getPublishedYear(b.publishedDate);
        if (y !== "—") yearSet.add(y);
      }

      if (!mounted) return;
      setPublishers([...publisherSet].sort((a, b) => a.localeCompare(b, "ja")));
      setCategories([...categorySet].sort((a, b) => a.localeCompare(b, "ja")));
      setPublishedYears([...yearSet].sort((a, b) => Number(b) - Number(a)));
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2 && !filters.author && !filters.publisher && !filters.category && !filters.publishedYear) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      const res = await searchBooks(query, filters);
      setResults(res.filter(b => !excludeIdsRef.current.includes(b.id)));
      setSearching(false);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, filters]);

  const handleSelect = useCallback(
    (book: CachedBook) => {
      onSelect(book);
      setQuery("");
      setFilters({ author: "", publisher: "", category: "", publishedYear: "" });
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

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <input
          type="text"
          value={filters.author}
          onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
          placeholder="著者で絞り込み（部分一致）"
          className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-400"
        />

        <select
          value={filters.publisher}
          onChange={(e) => setFilters(prev => ({ ...prev, publisher: e.target.value }))}
          className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-400"
        >
          <option value="">出版社で絞り込み</option>
          {publishers.map(publisher => (
            <option key={publisher} value={publisher}>{publisher}</option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-400"
        >
          <option value="">カテゴリで絞り込み</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={filters.publishedYear}
          onChange={(e) => setFilters(prev => ({ ...prev, publishedYear: e.target.value }))}
          className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-400"
        >
          <option value="">出版年で絞り込み</option>
          {publishedYears.map(year => (
            <option key={year} value={year}>{year}年</option>
          ))}
        </select>
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

      {(query.trim().length >= 2 || !!filters.author || !!filters.publisher || !!filters.category || !!filters.publishedYear) && results.length === 0 && !searching && (
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

    case "publisher":
      return <span>{book.publisher || "—"}</span>;

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
  const [matchedBooks, setMatchedBooks] = useState<MatchedBook[]>([]);
  const [selectedFields, setSelectedFields] = useState<CompareField[]>(DEFAULT_FIELDS);
  const [matching, setMatching] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // URL パラメータから初期状態を復元
  useEffect(() => {
    const baseId = params.get("baseId");
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
      setInitialized(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!baseBook) {
      setMatchedBooks([]);
      return;
    }

    setMatching(true);
    findMatchedBooks(baseBook, selectedFields)
      .then(setMatchedBooks)
      .finally(() => setMatching(false));
  }, [baseBook, selectedFields]);

  const tableBooks = baseBook ? [baseBook, ...matchedBooks.slice(0, 3)] : [];
  const excludeIds = baseBook ? [baseBook.id] : [];

  const toggleField = useCallback((field: CompareField) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
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
              <span className="text-stone-300">条件一致で本を探す</span>
            </nav>
            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2">
              Book Match
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">条件一致で本を探す</h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              起点となる1冊を選び、著者や出版年などの条件に合う本を一覧で見つけられます。
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {/* ── 1. 起点 + 条件（上部固定） ── */}
          <section className={baseBook ? "sticky top-14 z-30 bg-white/95 backdrop-blur py-4 border-b border-stone-200" : ""}>
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
                  placeholder="キーワードで検索（タイトル・著者・キーワード）…"
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
              <div className="space-y-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                  <div className="flex items-start gap-3">
                    {baseBook.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={baseBook.thumbnailUrl}
                        alt=""
                        className="w-12 h-16 object-cover rounded shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-stone-100 rounded flex items-center justify-center shrink-0">
                        <span className="text-stone-400 text-xs">📚</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">起点</p>
                      <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">{baseBook.title}</p>
                      <p className="text-stone-500 text-xs mt-0.5 truncate">{baseBook.authors.join(" / ") || "—"}</p>

                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-6 gap-1.5 text-[11px]">
                        <div className="rounded-md bg-white border border-stone-200 px-2 py-1">
                          <p className="text-stone-400 leading-none">出版年</p>
                          <p className="text-stone-700 font-medium mt-1 leading-none">{getPublishedYear(baseBook.publishedDate)}</p>
                        </div>
                        <div className="rounded-md bg-white border border-stone-200 px-2 py-1">
                          <p className="text-stone-400 leading-none">ページ数</p>
                          <p className="text-stone-700 font-medium mt-1 leading-none">{baseBook.pageCount ? `${baseBook.pageCount.toLocaleString()}p` : "—"}</p>
                        </div>
                        <div className="rounded-md bg-white border border-stone-200 px-2 py-1">
                          <p className="text-stone-400 leading-none">読書時間</p>
                          <p className="text-stone-700 font-medium mt-1 leading-none">{formatReadingHours(baseBook.estimatedReadingHours)}</p>
                        </div>
                        <div className="rounded-md bg-white border border-stone-200 px-2 py-1 col-span-2 sm:col-span-3">
                          <p className="text-stone-400 leading-none">出版社</p>
                          <p className="text-stone-700 font-medium mt-1 line-clamp-1">{baseBook.publisher || "—"}</p>
                        </div>
                        <div className="rounded-md bg-white border border-stone-200 px-2 py-1 col-span-2 sm:col-span-3">
                          <p className="text-stone-400 leading-none">カテゴリ</p>
                          <p className="text-stone-700 font-medium mt-1 line-clamp-1">{getCategoryLabel(baseBook.l1Id)}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBaseBook(null);
                        setMatchedBooks([]);
                      }}
                      className="shrink-0 text-stone-400 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1"
                      aria-label="起点を削除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-500">
                  一致候補: <span className="font-semibold text-stone-700">{matching ? "抽出中…" : `${matchedBooks.length}冊`}</span>
                </p>
              </div>
            )}

            {/* ── 条件選択（起点の直下に固定） ── */}
            {baseBook && (
              <div className="mt-4 pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider">
                    条件項目
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
                <p className="text-xs text-stone-400 mt-2">
                  著者を選ぶと、同じ著者の本が優先的に一覧表示されます
                </p>
              </div>
            )}
          </section>

          {/* ── 2. 一致書籍一覧 ── */}
          {baseBook && (
            <section>
              <div className="flex items-center justify-between mb-3 gap-3">
                <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider">
                  一致した書籍{" "}
                  <span className="text-stone-400 font-normal normal-case">（起点に合致する本）</span>
                </h2>
                <p className="text-xs text-stone-400">一覧は自動抽出されます</p>
              </div>

              {matching && (
                <p className="text-sm text-stone-400 py-3 text-center">候補を抽出中…</p>
              )}

              {!matching && matchedBooks.length === 0 && (
                <div className="border border-dashed border-stone-300 rounded-xl p-5 text-center text-sm text-stone-500">
                  選択した比較軸に合致する本が見つかりませんでした
                </div>
              )}

              {!matching && matchedBooks.length > 0 && (
                <div className="space-y-2">
                  {matchedBooks.slice(0, 12).map((book) => (
                    <div key={book.id} className="space-y-1">
                      <BookMiniCard book={book} />
                      <p className="text-xs text-stone-400 pl-1">
                        一致軸: {book.matchedBy.map(f => FIELD_CONFIG.find(v => v.key === f)?.label ?? f).join(" / ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── 待機メッセージ ── */}
          {baseBook && !matching && matchedBooks.length === 0 && (
            <div className="text-center py-6 text-stone-400 text-sm">
              条件を切り替えると、合致する本の候補が更新されます
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
