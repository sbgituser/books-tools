/**
 * /tools/literary-awards/[id] — 各文学賞の詳細ページ
 *
 * 受賞一覧テーブルと他の賞へのナビゲーションを提供するSSG静的ページ。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { LITERARY_AWARDS } from "@/constants/literaryAwards";
import { buildAmazonUrl } from "@/data/products";

// ── SSG 静的パス生成 ──────────────────────────────────────────

export function generateStaticParams() {
  return LITERARY_AWARDS.map((award) => ({ id: award.id }));
}

// ── メタデータ ────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const award = LITERARY_AWARDS.find((a) => a.id === id);
  if (!award) {
    return { title: `文学賞 | ${SITE_NAME}` };
  }
  return {
    title: `${award.name} 歴代受賞作 | ${SITE_NAME}`,
    description: `${award.name}の歴代受賞作一覧。${award.description}`,
    alternates: {
      canonical: `${SITE_URL}/tools/literary-awards/${award.id}`,
    },
    openGraph: {
      title: `${award.name} 歴代受賞作 | ${SITE_NAME}`,
      description: award.description,
      url: `${SITE_URL}/tools/literary-awards/${award.id}`,
      type: "website",
    },
  };
}

// ── ユーティリティ ────────────────────────────────────────────

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

const FREQUENCY_LABEL: Record<string, string> = {
  annual: "年1回",
  biannual: "年2回",
};

// ── ページ ────────────────────────────────────────────────────

export default async function LiteraryAwardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const award = LITERARY_AWARDS.find((a) => a.id === id);

  if (!award) {
    notFound();
  }

  // 年降順ソート
  const sortedWinners = [...award.winners].sort((a, b) => b.year - a.year);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ツール", item: `${SITE_URL}/tools` },
      {
        "@type": "ListItem",
        position: 3,
        name: "文学賞受賞作データベース",
        item: `${SITE_URL}/tools/literary-awards`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: award.name,
        item: `${SITE_URL}/tools/literary-awards/${award.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
                  <Link href="/tools/literary-awards" className="hover:text-amber-300 transition-colors">
                    文学賞DB
                  </Link>
                </li>
                <li>/</li>
                <li className="text-amber-200 font-medium">{award.name}</li>
              </ol>
            </nav>

            {/* タイトル */}
            <div className="flex items-start gap-4 mb-4">
              <span className="text-5xl shrink-0" aria-hidden="true">
                {award.icon}
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {award.name}
                </h1>
                {award.officialName && award.officialName !== award.name && (
                  <p className="text-amber-300/80 text-sm mt-0.5">{award.officialName}</p>
                )}
              </div>
            </div>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mb-6">
              {award.description}
            </p>

            {/* メタ情報 */}
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <dt className="text-stone-400 text-xs">開始年</dt>
                <dd className="text-amber-300 font-semibold">{award.startYear}年〜</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="text-stone-400 text-xs">開催頻度</dt>
                <dd className="text-amber-300 font-semibold">
                  {FREQUENCY_LABEL[award.frequency] ?? award.frequency}
                </dd>
              </div>
              {award.announcementMonth != null && (
                <div className="flex items-center gap-1.5">
                  <dt className="text-stone-400 text-xs">発表月</dt>
                  <dd className="text-amber-300 font-semibold">{award.announcementMonth}月</dd>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <dt className="text-stone-400 text-xs">収録数</dt>
                <dd className="text-amber-300 font-semibold">{award.winners.length}作品</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 受賞作一覧 */}
        <section className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5">
            歴代受賞作一覧
          </h2>

          {sortedWinners.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <p className="text-4xl mb-3" aria-hidden="true">📭</p>
              <p className="text-sm">データを準備中です</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
              <table className="w-full text-sm bg-white">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                      年
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                      回
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                      作品名
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                      著者
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                      ジャンル
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                      テーマ
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWinners.map((winner, i) => {
                    const amazonUrl = buildAmazonUrl(
                      winner.amazonKeyword ?? `${winner.title} ${winner.author}`
                    );
                    return (
                      <tr
                        key={`${winner.title}-${winner.year}-${i}`}
                        className="border-b border-stone-100 last:border-0 hover:bg-amber-50/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-stone-500 tabular-nums whitespace-nowrap text-xs">
                          {winner.year}年
                        </td>
                        <td className="px-4 py-3 text-stone-400 tabular-nums whitespace-nowrap text-xs">
                          {winner.session != null ? `第${winner.session}回` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-stone-900 leading-snug">
                            {winner.title}
                          </p>
                          {winner.description && (
                            <p className="text-[11px] text-stone-400 leading-relaxed mt-0.5 line-clamp-1">
                              {winner.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-600 whitespace-nowrap text-xs">
                          {winner.author}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${GENRE_BADGE_CLASS[winner.genre] ?? "bg-stone-100 text-stone-600"}`}
                          >
                            {GENRE_LABEL[winner.genre] ?? winner.genre}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {winner.themes.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <a
                            href={amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-amber-600 hover:text-amber-800 hover:underline transition-colors"
                            aria-label={`${winner.title}をAmazonで探す`}
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
          )}
        </section>

        {/* 他の賞へのナビゲーション */}
        <section className="border-t border-stone-200 bg-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
              他の文学賞
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {LITERARY_AWARDS.filter((a) => a.id !== award.id).map((a) => (
                <Link
                  key={a.id}
                  href={`/tools/literary-awards/${a.id}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-stone-200 bg-white p-3 hover:border-amber-300 hover:bg-amber-50 transition-all text-center"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {a.icon}
                  </span>
                  <p className="text-xs font-semibold text-stone-700 leading-tight">
                    {a.name}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    {a.winners.length}作品
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/tools/literary-awards"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 border border-amber-200 rounded-xl px-5 py-2.5 hover:bg-amber-50 hover:border-amber-400 transition-all"
              >
                ← すべての受賞作を横断検索
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
