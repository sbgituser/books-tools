/**
 * /tools/reading-order — シリーズ読む順番データベース
 *
 * 人気シリーズの読む順番を一覧できるツール。
 * フィルター・検索は ReadingOrderClient が担当する。
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadingOrderClient from "@/components/tools/ReadingOrderClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { READING_ORDER_SERIES } from "@/constants/readingOrders";

// ── メタデータ ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `シリーズ読む順番データベース | ${SITE_NAME}`,
  description:
    "人気シリーズの読む順番を一覧検索。東野圭吾・村上春樹・ワンピース・鬼滅の刃など小説・漫画50シリーズの刊行順・おすすめ順がすぐわかるデータベース。",
  alternates: {
    canonical: `${SITE_URL}/tools/reading-order`,
  },
  openGraph: {
    title: `シリーズ読む順番データベース | ${SITE_NAME}`,
    description:
      "人気シリーズの読む順番を一覧検索。小説・漫画50シリーズの刊行順・おすすめ順がすぐわかる。",
    url: `${SITE_URL}/tools/reading-order`,
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
        name: "シリーズの読む順番がわかりますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。小説・漫画あわせて50シリーズの刊行順・おすすめ読む順番を掲載しています。各シリーズの必読巻やおすすめ開始巻もわかります。",
        },
      },
      {
        "@type": "Question",
        name: "漫画の読む順番も対応していますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。ワンピース・鬼滅の刃・進撃の巨人・呪術廻戦など人気漫画25シリーズの読む順番をエピソード・アーク区切りで整理しています。",
        },
      },
      {
        "@type": "Question",
        name: "どのシリーズから読み始めるのがおすすめですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "各シリーズのページでおすすめ開始巻を表示しています。また、難易度フィルターで初心者向けのシリーズを絞り込むこともできます。",
        },
      },
    ],
  };

  const breadcrumbSchema = {
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
    ],
  };

  return [faqSchema, breadcrumbSchema];
}

// ── ページ ────────────────────────────────────────────────────

export default function ReadingOrderPage() {
  const jsonLdArray = buildJsonLd();
  const totalCount = READING_ORDER_SERIES.length;

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
        <section className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white py-12 sm:py-16 px-4">
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
                  読む順番データベース
                </li>
              </ol>
            </nav>

            {/* 2カラム */}
            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* 左カラム */}
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-3">
                  Reading Order · Books Tools
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
                  シリーズ
                  <br />
                  <span className="text-amber-400">読む順番</span>データベース
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  人気シリーズの読む順番を一覧検索。
                  刊行順・おすすめ順で各巻の情報をチェックできます。
                </p>
                <p className="mt-4 text-xs text-slate-400">
                  <span className="text-amber-300 font-semibold">
                    {totalCount}シリーズ
                  </span>{" "}
                  の読む順番データを収録
                </p>
              </div>

              {/* 右カラム：ビジュアル */}
              <div className="hidden sm:flex flex-col gap-3">
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                      小説
                    </span>
                    <span className="text-xs text-slate-400">全10巻</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">ガリレオシリーズ</p>
                  <p className="text-xs text-slate-400">東野圭吾</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-amber-300">1.</span>
                    <span className="text-white">探偵ガリレオ</span>
                    <span className="text-amber-400">→</span>
                    <span className="text-amber-300">2.</span>
                    <span className="text-white">予知夢</span>
                    <span className="text-amber-400">→</span>
                    <span className="text-slate-400">...</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-pink-500/30 text-pink-300 px-2 py-0.5 rounded-full font-semibold">
                      漫画
                    </span>
                    <span className="text-xs text-slate-400">連載中</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">ワンピース</p>
                  <p className="text-xs text-slate-400">尾田栄一郎</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-amber-300">1.</span>
                    <span className="text-white">東の海編</span>
                    <span className="text-amber-400">→</span>
                    <span className="text-amber-300">2.</span>
                    <span className="text-white">アラバスタ編</span>
                    <span className="text-amber-400">→</span>
                    <span className="text-slate-400">...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 説明テキスト */}
        <section className="max-w-4xl mx-auto px-4 pt-8 pb-2">
          <h2 className="text-base font-bold text-stone-700 mb-2">
            読む順番データベースとは
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            「このシリーズ、どこから読めばいい？」を解決するデータベースです。
            人気小説・漫画50シリーズの刊行順を整理し、必読巻やおすすめ開始巻を表示。
            ジャンル・ステータス・難易度でフィルタリングして、あなたに合ったシリーズを見つけましょう。
          </p>
        </section>

        {/* インタラクティブエリア */}
        <ReadingOrderClient />

      </main>
      <Footer />
    </>
  );
}
