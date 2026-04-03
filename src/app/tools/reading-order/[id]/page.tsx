/**
 * /tools/reading-order/[id] — 各シリーズの読む順番 詳細ページ
 *
 * 刊行順の読む順番テーブルとAmazonリンクを提供するSSG静的ページ。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { READING_ORDER_SERIES } from "@/constants/readingOrders";
import { buildAmazonUrl } from "@/data/products";

// ── SSG 静的パス生成 ──────────────────────────────────────────

export function generateStaticParams() {
  return READING_ORDER_SERIES.map((s) => ({ id: s.id }));
}

// ── メタデータ ────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const series = READING_ORDER_SERIES.find((s) => s.id === id);
  if (!series) {
    return { title: `読む順番 | ${SITE_NAME}` };
  }
  const title = `${series.seriesName}（${series.author}）読む順番`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description: `${series.seriesName}の読む順番を刊行順で一覧表示。${series.description}`,
    alternates: {
      canonical: `${SITE_URL}/tools/reading-order/${series.id}`,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: series.description,
      url: `${SITE_URL}/tools/reading-order/${series.id}`,
      type: "website",
    },
  };
}

// ── ユーティリティ ────────────────────────────────────────────

const GENRE_LABEL: Record<string, string> = {
  novel: "小説",
  manga: "漫画",
  lightnovel: "ライトノベル",
};

const GENRE_BADGE_CLASS: Record<string, string> = {
  novel: "bg-blue-100 text-blue-700",
  manga: "bg-pink-100 text-pink-700",
  lightnovel: "bg-purple-100 text-purple-700",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "完結",
  ongoing: "連載中",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "入門向け",
  intermediate: "中級",
  advanced: "上級",
};

// ── ページ ────────────────────────────────────────────────────

export default async function ReadingOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const series = READING_ORDER_SERIES.find((s) => s.id === id);

  if (!series) {
    notFound();
  }

  const relatedSeries = (series.relatedSeriesIds ?? [])
    .map((rid) => READING_ORDER_SERIES.find((s) => s.id === rid))
    .filter(Boolean) as typeof READING_ORDER_SERIES;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "ツール",
        item: `${SITE_URL}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "読む順番データベース",
        item: `${SITE_URL}/tools/reading-order`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${series.seriesName} 読む順番`,
        item: `${SITE_URL}/tools/reading-order/${series.id}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${series.seriesName}はどの順番で読めばいいですか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${series.seriesName}は刊行順に読むのがおすすめです。全${series.totalBooks}巻${series.status === "completed" ? "（完結済み）" : "（連載中）"}。${series.recommendedStartBook ? `おすすめ開始巻は「${series.recommendedStartBook}」です。` : ""}`,
        },
      },
      {
        "@type": "Question",
        name: `${series.seriesName}は全何巻ですか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${series.seriesName}は全${series.totalBooks}巻です。${series.status === "completed" ? "完結しています。" : "現在も連載中です。"}`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Header />
      <main className="min-h-screen bg-stone-50">

        {/* ヒーロー */}
        <section className="bg-gradient-to-br from-amber-900 via-yellow-900 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-amber-300/70 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-amber-300 transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/tools" className="hover:text-amber-300 transition-colors">
                    ツール
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link
                    href="/tools/reading-order"
                    className="hover:text-amber-300 transition-colors"
                  >
                    読む順番DB
                  </Link>
                </li>
                <li>/</li>
                <li className="text-amber-200 font-medium">
                  {series.seriesName}
                </li>
              </ol>
            </nav>

            {/* タイトル */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {series.seriesName}
                <span className="text-amber-300 text-lg sm:text-xl ml-2">
                  読む順番
                </span>
              </h1>
              <p className="text-amber-300/80 text-sm mt-1">
                {series.author}
                {series.authorReading && (
                  <span className="text-amber-300/50 ml-1">
                    （{series.authorReading}）
                  </span>
                )}
              </p>
            </div>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mb-6">
              {series.description}
            </p>

            {/* メタ情報 */}
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <dt className="text-stone-400 text-xs">ジャンル</dt>
                <dd>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${GENRE_BADGE_CLASS[series.genre] ?? "bg-stone-100 text-stone-600"}`}
                  >
                    {GENRE_LABEL[series.genre] ?? series.genre}
                  </span>
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="text-stone-400 text-xs">ステータス</dt>
                <dd className="text-amber-300 font-semibold">
                  {STATUS_LABEL[series.status] ?? series.status}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="text-stone-400 text-xs">巻数</dt>
                <dd className="text-amber-300 font-semibold">
                  全{series.totalBooks}巻
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="text-stone-400 text-xs">難易度</dt>
                <dd className="text-amber-300 font-semibold">
                  {DIFFICULTY_LABEL[series.difficulty] ?? series.difficulty}
                </dd>
              </div>
              {series.estimatedReadingHours && (
                <div className="flex items-center gap-1.5">
                  <dt className="text-stone-400 text-xs">読了目安</dt>
                  <dd className="text-amber-300 font-semibold">
                    約{series.estimatedReadingHours}時間
                  </dd>
                </div>
              )}
            </dl>

            {/* おすすめ開始巻 */}
            {series.recommendedStartBook && (
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-800/40 border border-amber-600/40 rounded-lg px-3 py-2">
                <span className="text-amber-400 text-xs font-bold">おすすめ開始巻:</span>
                <span className="text-white text-sm font-semibold">
                  {series.recommendedStartBook}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 読む順番テーブル */}
        <section className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5">
            読む順番（刊行順）
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
            <table className="w-full text-sm bg-white">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                    刊行年
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                    必読
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {series.books.map((book, i) => {
                  const amazonUrl = buildAmazonUrl(
                    book.amazonKeyword ?? `${book.title} ${book.author}`,
                  );
                  return (
                    <tr
                      key={`${book.title}-${i}`}
                      className={`border-b border-stone-100 last:border-0 hover:bg-amber-50/40 transition-colors ${
                        book.isEssential ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-stone-400 tabular-nums whitespace-nowrap text-xs">
                        {book.order}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-stone-900 leading-snug">
                            {book.title}
                          </p>
                          {book.isEssential && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">
                              必読
                            </span>
                          )}
                        </div>
                        {book.note && (
                          <p className="text-[11px] text-stone-400 leading-relaxed mt-0.5 line-clamp-2">
                            {book.note}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-500 tabular-nums whitespace-nowrap text-xs">
                        {book.publishedYear ? `${book.publishedYear}年` : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {book.isEssential ? (
                          <span className="text-amber-500" aria-label="必読">
                            ★
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a
                          href={amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-amber-600 hover:text-amber-800 hover:underline transition-colors"
                          aria-label={`${book.title}をAmazonで探す`}
                        >
                          Amazon →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* タグ */}
        {series.tags.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-6">
            <div className="flex flex-wrap gap-1.5">
              {series.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 関連シリーズ */}
        {relatedSeries.length > 0 && (
          <section className="border-t border-stone-200 bg-white py-10 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
                関連シリーズ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {relatedSeries.map((rs) => (
                  <Link
                    key={rs.id}
                    href={`/tools/reading-order/${rs.id}`}
                    className="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-white p-3 hover:border-amber-300 hover:bg-amber-50 transition-all"
                  >
                    <p className="text-xs font-semibold text-stone-700 leading-tight">
                      {rs.seriesName}
                    </p>
                    <p className="text-[10px] text-stone-400">{rs.author}</p>
                    <p className="text-[10px] text-stone-400">
                      全{rs.totalBooks}巻
                    </p>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/tools/reading-order"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 border border-amber-200 rounded-xl px-5 py-2.5 hover:bg-amber-50 hover:border-amber-400 transition-all"
                >
                  ← すべてのシリーズを見る
                </Link>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
