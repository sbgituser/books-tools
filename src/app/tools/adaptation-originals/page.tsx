"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { adaptationsSample, type WorkItem } from "@/data/adaptationsSample";

type Quarter = WorkItem["quarter"];
type MediaType = WorkItem["media_type"];
type OriginalFilterType = "all" | "manga" | "novel";

const quarterOrder: Record<Quarter, number> = {
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4,
};

const mediaLabel: Record<MediaType, string> = {
  anime: "アニメ",
  drama: "ドラマ",
  movie: "映画",
};

const originalTypeLabel: Record<"manga" | "novel" | "original", string> = {
  manga: "漫画",
  novel: "小説",
  original: "オリジナル",
};

function buildBooksSearchUrl(work: WorkItem): string {
  const params = new URLSearchParams({
    title: work.original.title ?? "",
    author: work.original.author ?? "",
    publisher: work.original.publisher ?? "",
    isbn: work.original.isbn ?? "",
    type: work.original.type ?? "",
  });
  return `/books/search?${params.toString()}`;
}

export default function AdaptationOriginalsPage() {
  const years = useMemo(
    () => [...new Set(adaptationsSample.map((x) => x.year))].sort((a, b) => b - a),
    [],
  );

  const [year, setYear] = useState<number>(years[0] ?? new Date().getFullYear());
  const [quarter, setQuarter] = useState<Quarter | "all">("all");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [originalOnly, setOriginalOnly] = useState<boolean>(false);
  const [originalType, setOriginalType] = useState<OriginalFilterType>("all");

  const filtered = useMemo(() => {
    return adaptationsSample
      .filter((item) => item.year === year)
      .filter((item) => (quarter === "all" ? true : item.quarter === quarter))
      .filter((item) => (mediaType === "all" ? true : item.media_type === mediaType))
      .filter((item) => (originalOnly ? item.original.exists : true))
      .filter((item) => {
        if (originalType === "all") return true;
        return item.original.type === originalType;
      })
      .slice()
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.quarter !== b.quarter) return quarterOrder[a.quarter] - quarterOrder[b.quarter];
        if (a.release_window !== b.release_window) {
          return a.release_window.localeCompare(b.release_window, "ja");
        }
        return a.title.localeCompare(b.title, "ja");
      });
  }, [year, quarter, mediaType, originalOnly, originalType]);

  const clearConditions = () => {
    setYear(years[0] ?? new Date().getFullYear());
    setQuarter("all");
    setMediaType("all");
    setOriginalOnly(false);
    setOriginalType("all");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-100">
        <section className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs text-stone-500 mb-2">Tools</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">映像化作品 原作検索ツール</h1>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              年・期・メディア種別で映像化作品を絞り込み、原作が漫画/小説の作品は書籍カードとして確認できます。
            </p>
          </div>

          <section className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 mb-5 sm:mb-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">年</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}年
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">期</span>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value as Quarter | "all")}
                  className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white"
                >
                  <option value="all">すべて</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">メディア種別</span>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as MediaType | "all")}
                  className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white"
                >
                  <option value="all">すべて</option>
                  <option value="movie">映画</option>
                  <option value="drama">ドラマ</option>
                  <option value="anime">アニメ</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-stone-600">原作種別</span>
                <select
                  value={originalType}
                  onChange={(e) => setOriginalType(e.target.value as OriginalFilterType)}
                  className="h-10 rounded-lg border border-stone-300 px-3 text-sm bg-white"
                >
                  <option value="all">すべて</option>
                  <option value="manga">漫画</option>
                  <option value="novel">小説</option>
                </select>
              </label>

              <label className="inline-flex items-center gap-2 pt-6 sm:pt-7">
                <input
                  type="checkbox"
                  checked={originalOnly}
                  onChange={(e) => setOriginalOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300"
                />
                <span className="text-sm text-stone-700">原作ありのみ表示</span>
              </label>

              <div className="pt-6 sm:pt-7">
                <button
                  type="button"
                  onClick={clearConditions}
                  className="h-10 px-4 rounded-lg border border-stone-300 text-sm text-stone-700 hover:bg-stone-50"
                >
                  条件クリア
                </button>
              </div>
            </div>
          </section>

          <div className="mb-3 text-sm text-stone-700 font-medium">検索結果: {filtered.length}件</div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
              条件に一致する作品はありません
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((work) => {
                const isMangaOrNovel = work.original.exists && (work.original.type === "manga" || work.original.type === "novel");
                const searchUrl = isMangaOrNovel ? buildBooksSearchUrl(work) : "";

                return (
                  <article key={`${work.year}-${work.title}-${work.release_window}`} className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col gap-2 mb-3">
                      <h2 className="text-lg font-bold text-stone-900 leading-snug">{work.title}</h2>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-semibold">{mediaLabel[work.media_type]}</span>
                        <span className="px-2 py-1 rounded bg-stone-100 text-stone-700">{work.year}年</span>
                        <span className="px-2 py-1 rounded bg-stone-100 text-stone-700">{work.quarter}</span>
                      </div>
                    </div>

                    <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <dt className="text-stone-500">公開/放送開始日</dt>
                        <dd className="text-stone-900 font-medium">{work.release_window}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-500">原作有無</dt>
                        <dd className="text-stone-900 font-medium">{work.original.exists ? "あり" : "なし"}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-500">原作種別</dt>
                        <dd className="text-stone-900 font-medium">
                          {work.original.type ? originalTypeLabel[work.original.type] : "—"}
                        </dd>
                      </div>
                    </dl>

                    {isMangaOrNovel ? (
                      <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={work.original.thumbnail_url ?? "https://placehold.jp/120x160.png?text=No+Image"}
                            alt={`${work.original.title ?? "原作"}のサムネイル`}
                            className="w-[90px] h-[120px] object-cover rounded border border-stone-200 bg-white shrink-0"
                            loading="lazy"
                          />

                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-stone-900 leading-snug mb-2">{work.original.title ?? "不明"}</h3>
                            <dl className="grid gap-1 text-sm">
                              <div className="flex gap-2">
                                <dt className="text-stone-500 shrink-0 w-14">著者</dt>
                                <dd className="text-stone-800">{work.original.author ?? "—"}</dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="text-stone-500 shrink-0 w-14">出版社</dt>
                                <dd className="text-stone-800">{work.original.publisher ?? "—"}</dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="text-stone-500 shrink-0 w-14">ISBN</dt>
                                <dd className="text-stone-800">{work.original.isbn ?? "—"}</dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="text-stone-500 shrink-0 w-14">種別</dt>
                                <dd className="text-stone-800">
                                  {work.original.type ? originalTypeLabel[work.original.type] : "—"}
                                </dd>
                              </div>
                            </dl>

                            <div className="mt-3">
                              <Link
                                href={searchUrl}
                                className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                              >
                                この条件で探す
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
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

