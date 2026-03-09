"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import BookListCard from "@/components/BookListCard";
import { indexProvider, type SubcatResult } from "@/lib/bookProviders/indexProvider";
import type { Book, SimilarityResult } from "@/lib/bookProviders/types";
import type { L1Category, Category } from "@/lib/categories";
import { trackBookSelect, trackSimilarNavigate } from "@/lib/analytics";

// ── 状態型 ──────────────────────────────────────────────────────

type View =
  | { type: "home" }
  | { type: "category"; l1: L1Category; catPath: Category[] }
  | { type: "books";    l1: L1Category; catPath: Category[] }
  | { type: "similar";  book: Book; l1?: L1Category; catPath?: Category[] };

type ViewData =
  | { type: "home"; categories: { l1: L1Category; count: number }[] }
  | { type: "category"; subcats: SubcatResult[]; bookCount: number; books?: Book[] }
  | { type: "books"; books: Book[] }
  | { type: "similar"; similar: SimilarityResult[] };

// ── パンくず ──────────────────────────────────────────────────────

function Breadcrumb({ view, go }: { view: View; go: (v: View) => void }) {
  type Crumb = { label: string; action?: () => void };
  const crumbs: Crumb[] = [
    {
      label: "カテゴリ",
      action: view.type !== "home" ? () => go({ type: "home" }) : undefined,
    },
  ];

  if (view.type === "category" || view.type === "books") {
    const { l1, catPath } = view;
    const isAtL1Root = view.type === "category" && catPath.length === 0;
    crumbs.push({
      label: l1.label,
      action: isAtL1Root ? undefined : () => go({ type: "category", l1, catPath: [] }),
    });
    catPath.forEach((cat, i) => {
      const isCurrentNode = view.type === "category" && i === catPath.length - 1;
      crumbs.push({
        label: cat.label,
        action: isCurrentNode
          ? undefined
          : () => go({ type: "category", l1, catPath: catPath.slice(0, i + 1) }),
      });
    });
    if (view.type === "books") {
      crumbs.push({ label: "書籍一覧" });
    }
  } else if (view.type === "similar") {
    const { l1, catPath } = view;
    if (l1) {
      crumbs.push({
        label: l1.label,
        action: () => go({ type: "category", l1, catPath: [] }),
      });
      (catPath ?? []).forEach((cat, i) => {
        const cp = catPath ?? [];
        crumbs.push({
          label: cat.label,
          action: () => go({ type: "category", l1, catPath: cp.slice(0, i + 1) }),
        });
      });
    }
    crumbs.push({ label: view.book.title });
  }

  return (
    <nav className="text-stone-400 text-xs mb-4 flex gap-1 items-center flex-wrap" aria-label="パンくずリスト">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-stone-600">›</span>}
          {c.action ? (
            <button onClick={c.action} className="hover:text-white transition-colors max-w-[140px] truncate">
              {c.label}
            </button>
          ) : (
            <span className="text-stone-300 max-w-[160px] truncate">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ── Hero wrapper ─────────────────────────────────────────────────

function Hero({ view, go, children }: { view: View; go: (v: View) => void; children: React.ReactNode }) {
  return (
    <section className="bg-gradient-to-br from-stone-800 to-stone-700 text-white px-4 py-8 sm:py-10">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb view={view} go={go} />
        {children}
      </div>
    </section>
  );
}

// ── ローディング ──────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-stone-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════

export default function SimilarBooksPage() {
  const [view, setView] = useState<View>({ type: "home" });
  const [viewData, setViewData] = useState<ViewData | null>(null);
  const [loading, setLoading] = useState(true);

  const go = (v: View) => setView(v);

  // ── データ取得 ────────────────────────────────────────────────
  useEffect(() => {
    document.title = "書籍ブラウザ | Books Tools";
    window.scrollTo({ top: 0, behavior: "smooth" });

    let cancelled = false;
    setLoading(true);
    setViewData(null);

    (async () => {
      let data: ViewData;

      if (view.type === "home") {
        const categories = await indexProvider.getL1Categories();
        data = { type: "home", categories };

      } else if (view.type === "category") {
        const { l1, catPath } = view;
        const catIds = catPath.map(c => c.id);
        const [subcats, bookCount] = await Promise.all([
          indexProvider.getSubcategories(l1.id, catIds),
          indexProvider.getBookCountByPath(l1.id, catIds),
        ]);
        if (subcats.length === 0) {
          const books = await indexProvider.getBooksByPath(l1.id, catIds);
          data = { type: "category", subcats: [], bookCount, books };
        } else {
          data = { type: "category", subcats, bookCount };
        }

      } else if (view.type === "books") {
        const { l1, catPath } = view;
        const books = await indexProvider.getBooksByPath(l1.id, catPath.map(c => c.id));
        data = { type: "books", books };

      } else {
        const similar = await indexProvider.getSimilarBooks(view.book.id);
        data = { type: "similar", similar };
      }

      if (!cancelled) {
        setViewData(data);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [view]);

  // ── A. カテゴリトップ ──────────────────────────────────────────
  if (view.type === "home") {
    return (
      <>
        <Header />
        <main>
          <Hero view={view} go={go}>
            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2">Book Browser</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">書籍ブラウザ</h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              カテゴリを絞り込んで書籍を探し、気になる本をクリックすると<br className="hidden sm:block" />
              類似した本が表示されます。
            </p>
          </Hero>

          {loading || viewData?.type !== "home" ? (
            <LoadingSkeleton />
          ) : (
            <section className="max-w-3xl mx-auto px-4 py-8">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">カテゴリを選択</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {viewData.categories.map(({ l1, count }) => (
                  <button
                    key={l1.id}
                    onClick={() => go({ type: "category", l1, catPath: [] })}
                    className="flex flex-col items-start gap-1.5 bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-amber-400 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">{l1.emoji}</span>
                    <span className="font-semibold text-stone-800 text-sm leading-tight">{l1.label}</span>
                    <span className="text-stone-400 text-xs leading-snug">{l1.desc}</span>
                    <span className="text-stone-400 text-xs mt-1">{count}冊</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </>
    );
  }

  // ── B. カテゴリナビゲーション（任意の深さ）─────────────────────
  if (view.type === "category") {
    const { l1, catPath } = view;
    const currentLabel = catPath.length > 0 ? catPath[catPath.length - 1].label : l1.label;

    if (loading || viewData?.type !== "category") {
      return (
        <>
          <Header />
          <main>
            <Hero view={view} go={go}>
              <h1 className="text-xl sm:text-2xl font-bold mb-1">{currentLabel}</h1>
              <p className="text-stone-400 text-sm">読み込み中…</p>
            </Hero>
            <LoadingSkeleton />
          </main>
          <Footer />
        </>
      );
    }

    const { subcats, bookCount, books: leafBooks } = viewData;

    // サブカテゴリが存在しない場合は書籍一覧を直接表示
    if (subcats.length === 0) {
      return (
        <>
          <Header />
          <main>
            <Hero view={view} go={go}>
              <h1 className="text-xl sm:text-2xl font-bold mb-1">{currentLabel}</h1>
              <p className="text-stone-400 text-sm">{leafBooks?.length ?? 0}冊 · クリックで類似本を表示</p>
            </Hero>
            <section className="max-w-3xl mx-auto px-4 py-6">
              {!leafBooks?.length ? (
                <p className="text-center text-stone-400 py-20">書籍が見つかりませんでした</p>
              ) : (
                <div className="space-y-2">
                  {leafBooks.map(book => (
                    <BookListCard
                      key={book.id}
                      book={book}
                      onClick={b => {
                        trackBookSelect({
                          bookId: b.id,
                          bookTitle: b.title,
                          l1CategoryId: l1.id,
                          l1CategoryLabel: l1.label,
                          catPath: catPath.map(c => c.label).join(" > "),
                        });
                        go({ type: "similar", book: b, l1, catPath });
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Header />
        <main>
          <Hero view={view} go={go}>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
              {catPath.length === 0 && <span>{l1.emoji}</span>}
              {currentLabel}
            </h1>
            <p className="text-stone-400 text-sm">
              {bookCount}冊 · さらに絞り込むか、全書籍を表示
            </p>
          </Hero>

          <section className="max-w-3xl mx-auto px-4 py-6">
            {/* この階層の全書籍ボタン */}
            <button
              onClick={() => go({ type: "books", l1, catPath })}
              className="w-full mb-5 flex items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left hover:bg-amber-100 hover:border-amber-400 transition-all"
            >
              <span className="text-sm font-medium text-amber-800">
                📚 「{currentLabel}」の全書籍を見る
              </span>
              <span className="text-xs text-amber-600 shrink-0">{bookCount}冊 ›</span>
            </button>

            {/* サブカテゴリグリッド */}
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
              さらに絞り込む
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subcats.map(({ cat, count, hasDeeper, sampleThumbnails }) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const nextPath = [...catPath, cat];
                    if (hasDeeper) {
                      go({ type: "category", l1, catPath: nextPath });
                    } else {
                      go({ type: "books", l1, catPath: nextPath });
                    }
                  }}
                  className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-amber-400 hover:shadow-md transition-all"
                >
                  <div className="shrink-0 flex gap-0.5">
                    {sampleThumbnails.length > 0 ? (
                      sampleThumbnails.map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt="" className="w-8 h-12 object-cover rounded shadow-sm" />
                      ))
                    ) : (
                      <div className="w-8 h-12 rounded bg-stone-100 flex items-center justify-center">
                        <span className="text-stone-400 text-xs">📚</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 text-sm leading-tight">{cat.label}</p>
                    <p className="text-stone-400 text-xs mt-0.5">
                      {count}冊
                      {hasDeeper && <span className="text-amber-500"> · さらに絞り込めます</span>}
                    </p>
                  </div>

                  <span className="text-stone-300 shrink-0">›</span>
                </button>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // ── C. 書籍一覧 ───────────────────────────────────────────────
  if (view.type === "books") {
    const { l1, catPath } = view;
    const currentLabel = catPath.length > 0 ? catPath[catPath.length - 1].label : l1.label;
    const subLabel =
      catPath.length > 0 && catPath[catPath.length - 1].id !== "other"
        ? catPath[catPath.length - 1].label
        : undefined;

    const books = viewData?.type === "books" ? viewData.books : null;

    return (
      <>
        <Header />
        <main>
          <Hero view={view} go={go}>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">{currentLabel}</h1>
            <p className="text-stone-400 text-sm">
              {books ? `${books.length}冊 · クリックで類似本を表示` : "読み込み中…"}
            </p>
          </Hero>

          <section className="max-w-3xl mx-auto px-4 py-6">
            {loading || !books ? (
              <LoadingSkeleton />
            ) : books.length === 0 ? (
              <p className="text-center text-stone-400 py-20">書籍が見つかりませんでした</p>
            ) : (
              <div className="space-y-2">
                {books.map(book => (
                  <BookListCard
                    key={book.id}
                    book={book}
                    subLabel={subLabel}
                    onClick={b => {
                      trackBookSelect({
                        bookId: b.id,
                        bookTitle: b.title,
                        l1CategoryId: l1.id,
                        l1CategoryLabel: l1.label,
                        catPath: catPath.map(c => c.label).join(" > "),
                      });
                      go({ type: "similar", book: b, l1, catPath });
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // ── D. 類似本一覧 ────────────────────────────────────────────
  if (view.type === "similar") {
    const { book, l1, catPath } = view;
    const similar = viewData?.type === "similar" ? viewData.similar : null;

    return (
      <>
        <Header />
        <main>
          <Hero view={view} go={go}>
            <h1 className="text-xl font-bold mb-1">この本に似た本</h1>
            <p className="text-stone-400 text-sm">
              {similar ? `${similar.length}件` : "読み込み中…"}
            </p>
          </Hero>

          <section className="max-w-3xl mx-auto px-4 py-6">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">選択中</p>
            <div className="mb-6">
              <BookCard result={{ book, score: 0, reasons: [] }} />
            </div>

            {loading || !similar ? (
              <LoadingSkeleton />
            ) : (
              <>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                  類似した本 — {similar.length}件
                </p>
                {similar.length === 0 ? (
                  <div className="text-center py-16 text-stone-400">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="mb-4">類似書籍データがありません</p>
                    {l1 && catPath && (
                      <button
                        onClick={() => go({ type: "books", l1, catPath })}
                        className="text-amber-600 hover:underline text-sm"
                      >
                        ← 書籍一覧に戻る
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {similar.map(({ book: simBook, reasons }, index) => (
                      <BookCard
                        key={simBook.id}
                        result={{ book: simBook, score: 1, reasons }}
                        onSelect={b => {
                          trackSimilarNavigate({
                            fromBookId: book.id,
                            fromBookTitle: book.title,
                            toBookId: b.id,
                            toBookTitle: b.title,
                            rank: index + 1,
                          });
                          go({ type: "similar", book: b, l1, catPath });
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            <p className="text-xs text-stone-400 mt-8 text-center leading-relaxed">
              ※ 書籍情報はGoogle Books / OpenBDから取得しています。<br />
              ※ Amazonでの実際の価格・在庫状況をご確認ください。
            </p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return null;
}
