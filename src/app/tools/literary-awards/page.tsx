/**
 * /tools/literary-awards — 文学賞受賞作データベース
 *
 * 直木賞・芥川賞・本屋大賞など10の主要文学賞の歴代受賞作を横断検索できるツール。
 * インタラクティブUI は LiteraryAwardsClient が担当する。
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiteraryAwardsClient from "@/components/tools/LiteraryAwardsClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { LITERARY_AWARDS } from "@/constants/literaryAwards";

// ── メタデータ ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `文学賞受賞作データベース | ${SITE_NAME}`,
  description:
    "直木賞・芥川賞・本屋大賞など主要文学賞の歴代受賞作を横断検索。年代・ジャンル・テーマで絞り込める文学賞データベース。",
  alternates: {
    canonical: `${SITE_URL}/tools/literary-awards`,
  },
  openGraph: {
    title: `文学賞受賞作データベース | ${SITE_NAME}`,
    description:
      "直木賞・芥川賞・本屋大賞など主要文学賞の歴代受賞作を横断検索。年代・ジャンル・テーマで絞り込める文学賞データベース。",
    url: `${SITE_URL}/tools/literary-awards`,
    type: "website",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

// ── 構造化データ ──────────────────────────────────────────────

function buildJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "どんな文学賞の受賞作を検索できますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "本屋大賞・直木賞・芥川賞・このミステリーがすごい!・キノベス!・本格ミステリ大賞・吉川英治文学新人賞・山本周五郎賞・日本SF大賞・マンガ大賞の10賞を収録しています。",
        },
      },
      {
        "@type": "Question",
        name: "ジャンルやテーマで絞り込めますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。小説・漫画・ミステリー・SF・ノンフィクション・エッセイ・ホラーのジャンル別フィルタと、テーマのフリーテキスト検索が使えます。",
        },
      },
      {
        "@type": "Question",
        name: "Amazonで購入できますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "各受賞作にAmazonへのリンクを設置しています。書名をクリックすることで該当書籍のAmazon検索ページに移動できます。",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ツール",
        item: `${SITE_URL}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "文学賞受賞作データベース",
        item: `${SITE_URL}/tools/literary-awards`,
      },
    ],
  };

  return [faqSchema, breadcrumbSchema];
}

// ── ページ ────────────────────────────────────────────────────

export default function LiteraryAwardsPage() {
  const jsonLdArray = buildJsonLd();
  const totalWinners = LITERARY_AWARDS.reduce((sum, a) => sum + a.winners.length, 0);
  const totalAwards = LITERARY_AWARDS.length;

  return (
    <>
      {jsonLdArray.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Header />
      <main className="min-h-screen bg-stone-50">

        {/* ヒーローセクション */}
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
                <li className="text-amber-200 font-medium">
                  文学賞受賞作データベース
                </li>
              </ol>
            </nav>

            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* 左カラム */}
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-3">
                  Literary Awards · Books Tools
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
                  <span className="text-3xl sm:text-4xl mr-2" aria-hidden="true">🏆</span>
                  文学賞受賞作
                  <br />
                  <span className="text-amber-400">データベース</span>
                </h1>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  直木賞・芥川賞・本屋大賞など{totalAwards}の主要文学賞の歴代受賞作を横断検索できます。
                </p>
                <p className="mt-4 text-xs text-stone-400">
                  <span className="text-amber-300 font-semibold">
                    {totalWinners}作品
                  </span>{" "}
                  収録 ・{" "}
                  <span className="text-amber-300 font-semibold">
                    {totalAwards}賞
                  </span>
                </p>
              </div>

              {/* 右カラム：賞プレビュー */}
              <div className="hidden sm:grid grid-cols-2 gap-2">
                {LITERARY_AWARDS.slice(0, 6).map((award) => (
                  <div
                    key={award.id}
                    className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2.5"
                  >
                    <span className="text-xl shrink-0" aria-hidden="true">
                      {award.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {award.name}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
                        {award.winners.length}作品収録
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* インタラクティブエリア */}
        <LiteraryAwardsClient />

      </main>
      <Footer />
    </>
  );
}
