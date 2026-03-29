/**
 * /tools/trend-books — ニュース・社会テーマから本を探すツール
 *
 * テーマ選択 → レベル選択 → 書籍提案 という3ステップのUXを提供。
 * インタラクティブUI は TrendBooksClient が担当する。
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrendBooksClient from "@/components/tools/TrendBooksClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TREND_BOOKS, TREND_THEMES } from "@/constants/trendBooks";

// ── メタデータ ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `ニュース・社会テーマから本を探す | ${SITE_NAME}`,
  description:
    "AI・経済・環境・政治などのテーマから、理解を深める本を探せるツール。初心者向け〜深掘りまでレベル別に厳選した書籍を提案します。",
  alternates: {
    canonical: `${SITE_URL}/tools/trend-books`,
  },
  openGraph: {
    title: `ニュース・社会テーマから本を探す | ${SITE_NAME}`,
    description:
      "AI・経済・環境・政治などのテーマから理解を深める本をレベル別に提案。今気になるテーマから学びの入口を見つける。",
    url: `${SITE_URL}/tools/trend-books`,
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
        name: "ニュースや社会テーマから本を探せますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。AI・経済・教育・戦争・環境・政治・医療・ビジネス・心理・歴史の10テーマから関連書籍を探せます。テーマを選ぶだけで書籍が表示されます。",
        },
      },
      {
        "@type": "Question",
        name: "初心者向けの本はありますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。各テーマに「初心者向け」「中級向け」「深掘り」のレベル別フィルタがあり、前提知識なしで読める入門書から専門書まで選べます。",
        },
      },
      {
        "@type": "Question",
        name: "どんな分野の本が見つかりますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI・テクノロジー、経済・お金、教育・学び、戦争・国際情勢、環境・気候変動、政治・民主主義、医療・健康、ビジネス・経営、心理・行動科学、歴史・文明の10テーマを収録しています。",
        },
      },
      {
        "@type": "Question",
        name: "書籍はどうやって選ばれていますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "各テーマについて「今なぜ読むべきか」の文脈を重視して厳選しています。各書籍には「なぜ今読むか」という理由を明記しています。",
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
        name: "ニュース・社会テーマから本を探す",
        item: `${SITE_URL}/tools/trend-books`,
      },
    ],
  };

  return [faqSchema, breadcrumbSchema];
}

// ── ページ ────────────────────────────────────────────────────

export default function TrendBooksPage() {
  const jsonLdArray = buildJsonLd();
  const totalBooks = TREND_BOOKS.length;
  const totalThemes = TREND_THEMES.length;

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
        <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-slate-400 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-teal-400 transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li className="text-slate-300 font-medium">
                  テーマから本を探す
                </li>
              </ol>
            </nav>

            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* 左カラム */}
              <div>
                <p className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-3">
                  Trend Books · Books Tools
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
                  ニュース・社会テーマから
                  <br />
                  <span className="text-teal-400">本を探す</span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  今気になるテーマから、理解を深める本を見つける。
                  AI・経済・環境など{totalThemes}テーマを収録。
                  初心者向けから深掘りまでレベル別に提案します。
                </p>
                <p className="mt-4 text-xs text-slate-400">
                  <span className="text-teal-300 font-semibold">
                    {totalBooks}冊
                  </span>{" "}
                  収録 ・{" "}
                  <span className="text-teal-300 font-semibold">
                    {totalThemes}テーマ
                  </span>
                </p>
              </div>

              {/* 右カラム：テーマプレビュー */}
              <div className="hidden sm:grid grid-cols-2 gap-2">
                {TREND_THEMES.slice(0, 6).map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2.5"
                  >
                    <span className="text-xl shrink-0" aria-hidden="true">
                      {theme.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {theme.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {theme.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 使い方 */}
            <div className="mt-8 flex items-center gap-6 flex-wrap">
              {[
                { step: "1", label: "テーマを選ぶ" },
                { step: "2", label: "レベルを選ぶ" },
                { step: "3", label: "本を見つける" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500/30 border border-teal-400/50 text-teal-300 text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                  <span className="text-sm text-slate-300">{s.label}</span>
                  {i < 2 && (
                    <span className="text-slate-600 text-sm" aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* インタラクティブエリア */}
        <TrendBooksClient />

      </main>
      <Footer />
    </>
  );
}
