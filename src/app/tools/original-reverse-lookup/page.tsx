"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { adaptationsSample, type WorkItem, type OriginalType } from "@/data/adaptationsSample";

type MediaType = "anime" | "drama" | "movie";
type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

type ReverseLookupBook = {
  key: string;
  title: string;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
  type: "manga" | "novel";
  thumbnail_url: string | null;
  adaptations: Array<{
    title: string;
    media_type: MediaType;
    year: number;
    quarter: Quarter;
    season: "winter" | "spring" | "summer" | "autumn";
    release_window: string;
  }>;
};

type BookTypeFilter = "all" | "manga" | "novel";
type MediaFilter = "all" | MediaType;
type QuarterFilter = "all" | Quarter;

const quarterOrder: Record<Quarter, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

const mediaLabel: Record<MediaType, string> = {
  anime: "アニメ",
  drama: "ドラマ",
  movie: "映画",
};

const originalTypeLabel: Record<Exclude<OriginalType, null | "original">, string> = {
  manga: "漫画",
  novel: "小説",
};

function normalize(v: string | null | undefined): string {
  return (v ?? "").trim().toLowerCase();
}

function toBookKey(work: WorkItem): string | null {
  const o = work.original;
  if (!o.exists || (o.type !== "manga" && o.type !== "novel")) return null;
  if (o.isbn) return `isbn:${o.isbn}`;
  return `meta:${o.title ?? ""}::${o.author ?? ""}::${o.publisher ?? ""}`;
}

function aggregateReverseBooks(data: readonly WorkItem[]): ReverseLookupBook[] {
  const map = new Map<string, ReverseLookupBook>();

  for (const item of data) {
    const key = toBookKey(item);
    if (!key) continue;

    const o = item.original;
    const originalType = o.type === "manga" || o.type === "novel" ? o.type : null;
    if (!originalType) continue;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        key,
        title: o.title ?? "不明",
        author: o.author,
        publisher: o.publisher,
        isbn: o.isbn,
        type: originalType,
        thumbnail_url: o.thumbnail_url,
        adaptations: [
          {
            title: item.title,
            media_type: item.media_type,
            year: item.year,
            quarter: item.quarter,
            season: item.season,
            release_window: item.release_window,
          },
        ],
      });
      continue;
    }

    existing.adaptations.push({
      title: item.title,
      media_type: item.media_type,
      year: item.year,
      quarter: item.quarter,
      season: item.season,
      release_window: item.release_window,
    });
  }

  return [...map.values()]
    .map((book) => ({
      ...book,
      adaptations: book.adaptations
        .slice()
        .sort((a, b) => b.year - a.year || quarterOrder[a.quarter] - quarterOrder[b.quarter] || a.release_window.localeCompare(b.release_window, "ja")),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "ja"));
}

function buildBooksSearchUrl(book: ReverseLookupBook): string {
  const params = new URLSearchParams({
    title: book.title ?? "",
    author: book.author ?? "",
    publisher: book.publisher ?? "",
    isbn: book.isbn ?? "",
    type: book.type,
  });
  return `/books/search?${params.toString()}`;
}

export default function OriginalReverseLookupPage() {
  const reverseBooks = useMemo(() => aggregateReverseBooks(adaptationsSample), []);
  const years = useMemo(() => [...new Set(adaptationsSample.map((x) => x.year))].sort((a, b) => b - a), []);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [type, setType] = useState<BookTypeFilter>("all");
  const [media, setMedia] = useState<MediaFilter>("all");
  const [year, setYear] = useState<number | "all">("all");
  const [quarter, setQuarter] = useState<QuarterFilter>("all");

  const filteredBooks = useMemo(() => {
    return reverseBooks.filter((book) => {
      if (title && !normalize(book.title).includes(normalize(title))) return false;
      if (author && !normalize(book.author).includes(normalize(author))) return false;
      if (publisher && !normalize(book.publisher).includes(normalize(publisher))) return false;
      if (isbn && (book.isbn ?? "") !== isbn.trim()) return false;
      if (type !== "all" && book.type !== type) return false;

      const adaptations = book.adaptations.filter((a) => {
        if (media !== "all" && a.media_type !== media) return false;
        if (year !== "all" && a.year !== year) return false;
        if (quarter !== "all" && a.quarter !== quarter) return false;
        return true;
      });

      return adaptations.length > 0;
    });
  }, [reverseBooks, title, author, publisher, isbn, type, media, year, quarter]);

  const clearConditions = () => {
    setTitle("");
    setAuthor("");
    setPublisher("");
    setIsbn("");
    setType("all");
    setMedia("all");
    setYear("all");
    setQuarter("all");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-100">
        <section className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs text-stone-500 mb-2">Tools</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">原作本から映像化作品を探すツール</h1>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              原作本（漫画・小説）を起点に、過去の映像化作品（アニメ・ドラマ・映画）を逆引きで確認できます。
            </p>
          </div>

          <section className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 mb-5 sm:mb-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">書名</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white" placeholder="部分一致" />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">著者</span>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white" placeholder="部分一致" />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">出版社</span>
                <input value={publisher} onChange={(e) => setPublisher(e.target.value)} className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white" placeholder="部分一致" />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">ISBN</span>
                <input value={isbn} onChange={(e) => setIsbn(e.target.value)} className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white" placeholder="完全一致" />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">原作種別</span>
                <select value={type} onChange={(e) => setType(e.target.value as BookTypeFilter)} className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white">
                  <option value="all">すべて</option>
                  <option value="manga">漫画</option>
                  <option value="novel">小説</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">映像化種別</span>
                <select value={media} onChange={(e) => setMedia(e.target.value as MediaFilter)} className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white">
                  <option value="all">すべて</option>
                  <option value="anime">アニメ</option>
                  <option value="drama">ドラマ</option>
                  <option value="movie">映画</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">年</span>
                <select value={year} onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))} className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white">
                  <option value="all">すべて</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">期</span>
                <select value={quarter} onChange={(e) => setQuarter(e.target.value as QuarterFilter)} className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white">
                  <option value="all">すべて</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </label>

              <div className="pt-6 sm:pt-7">
                <button type="button" onClick={clearConditions} className="h-10 px-4 rounded-lg border border-stone-300 text-sm text-stone-700 hover:bg-stone-50">
                  条件クリア
                </button>
              </div>
            </div>
          </section>

          <div className="mb-3 text-sm text-stone-700 font-medium">検索結果: {filteredBooks.length}冊</div>

          {filteredBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
              条件に一致する原作本はありません
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBooks.map((book) => {
                const visibleAdaptations = book.adaptations.filter((a) => {
                  if (media !== "all" && a.media_type !== media) return false;
                  if (year !== "all" && a.year !== year) return false;
                  if (quarter !== "all" && a.quarter !== quarter) return false;
                  return true;
                });

                return (
                  <article key={book.key} className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.thumbnail_url ?? "https://placehold.jp/120x160.png?text=No+Image"}
                        alt={`${book.title}のサムネイル`}
                        className="w-[96px] h-[128px] object-cover rounded border border-stone-200 bg-stone-50 shrink-0"
                        loading="lazy"
                      />

                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-stone-900 leading-snug mb-2">{book.title}</h2>
                        <dl className="grid gap-1 text-sm mb-3">
                          <div className="flex gap-2"><dt className="w-14 text-stone-500 shrink-0">著者</dt><dd className="text-stone-800">{book.author ?? "—"}</dd></div>
                          <div className="flex gap-2"><dt className="w-14 text-stone-500 shrink-0">出版社</dt><dd className="text-stone-800">{book.publisher ?? "—"}</dd></div>
                          <div className="flex gap-2"><dt className="w-14 text-stone-500 shrink-0">ISBN</dt><dd className="text-stone-800">{book.isbn ?? "—"}</dd></div>
                          <div className="flex gap-2"><dt className="w-14 text-stone-500 shrink-0">種別</dt><dd className="text-stone-800">{originalTypeLabel[book.type]}</dd></div>
                        </dl>

                        <div className="flex flex-wrap gap-2 items-center mb-3">
                          <span className="inline-flex items-center rounded bg-stone-100 px-2 py-1 text-xs text-stone-700">
                            映像化件数: {visibleAdaptations.length}件
                          </span>
                          <Link href={buildBooksSearchUrl(book)} className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600">
                            この条件で探す
                          </Link>
                        </div>

                        <details className="rounded-lg border border-stone-200 bg-stone-50 p-3" open>
                          <summary className="cursor-pointer text-sm font-semibold text-stone-800">映像化作品一覧</summary>
                          <div className="mt-3 space-y-2">
                            {visibleAdaptations.map((a) => (
                              <div key={`${a.title}-${a.release_window}`} className="rounded-md border border-stone-200 bg-white p-2.5 text-sm">
                                <div className="font-medium text-stone-900 mb-1">{a.title}</div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">{mediaLabel[a.media_type]}</span>
                                  <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700">{a.year}年</span>
                                  <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700">{a.quarter}</span>
                                  <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700">{a.release_window}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

