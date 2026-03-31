/**
 * /tools/reading-time — 読書時間計算ツール
 *
 * 本のページ数・種類・読書速度から読了時間を推定するツール。
 * インタラクティブUI は ReadingTimeClient が担当する。
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadingTimeClient from "@/components/tools/ReadingTimeClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// ── メタデータ ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `読書時間計算ツール | 本を読むのにかかる時間を簡単計算 | ${SITE_NAME}`,
  description:
    "本のページ数と種類（小説・漫画・ビジネス書等）を入力するだけで読了時間を自動計算。1日30分読むと何日かかるか、シリーズ全巻を読破するには何ヶ月かかるかも一目でわかります。",
  alternates: {
    canonical: `${SITE_URL}/tools/reading-time`,
  },
  openGraph: {
    title: `読書時間計算ツール | 本を読むのにかかる時間を簡単計算 | ${SITE_NAME}`,
    description:
      "本のページ数と種類（小説・漫画・ビジネス書等）を入力するだけで読了時間を自動計算。1日30分読むと何日かかるか、シリーズ全巻を読破するには何ヶ月かかるかも一目でわかります。",
    url: `${SITE_URL}/tools/reading-time`,
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
        name: "日本語の平均的な読書速度は？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "一般的な日本語の読書速度は1分あたり400〜600文字程度です。小説では文庫本1ページ（約600字）を1〜1.5分で読む方が多く、漫画は絵と文字を合わせて1ページあたり10〜20秒ほどが平均的です。",
        },
      },
      {
        "@type": "Question",
        name: "本のページ数はどこで確認できますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "書籍の奥付（最終ページ付近）やAmazonの商品ページ「本の詳細」欄でページ数を確認できます。電子書籍の場合はページ数が異なる場合があります。",
        },
      },
      {
        "@type": "Question",
        name: "小説・漫画・ビジネス書で読書速度が違うのはなぜですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ジャンルによって1ページあたりの文字数や内容の密度が大きく異なります。漫画は絵が主体でセリフが少ないため速く読め、ビジネス書は図表や専門用語が多く理解しながら読むため遅くなります。",
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
        name: "読書時間計算ツール",
        item: `${SITE_URL}/tools/reading-time`,
      },
    ],
  };

  return [faqSchema, breadcrumbSchema];
}

// ── ページ ────────────────────────────────────────────────────

export default function ReadingTimePage() {
  const jsonLdArray = buildJsonLd();

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
        <section className="bg-gradient-to-br from-emerald-900 via-green-900 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-emerald-300/70 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-emerald-300 transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/tools" className="hover:text-emerald-300 transition-colors">
                    ツール
                  </Link>
                </li>
                <li>/</li>
                <li className="text-emerald-200 font-medium">
                  読書時間計算ツール
                </li>
              </ol>
            </nav>

            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* 左カラム */}
              <div>
                <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3">
                  Reading Time · Books Tools
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
                  <span className="text-3xl sm:text-4xl mr-2" aria-hidden="true">⏱️</span>
                  読書時間
                  <br />
                  <span className="text-emerald-400">計算ツール</span>
                </h1>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  ページ数と本の種類を入力するだけで読了時間を自動計算。「1日30分読むと何日で読める？」がすぐわかります。
                </p>
              </div>

              {/* 右カラム：特徴プレビュー */}
              <div className="hidden sm:grid grid-cols-2 gap-2">
                {[
                  { icon: "📖", label: "5ジャンル対応", desc: "小説・漫画・ビジネス書等" },
                  { icon: "⚡", label: "リアルタイム計算", desc: "入力するだけで即計算" },
                  { icon: "📅", label: "日数換算", desc: "1日30分/1時間で何日？" },
                  { icon: "📚", label: "シリーズ対応", desc: "全巻読破の所要時間も" },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2.5"
                  >
                    <span className="text-xl shrink-0" aria-hidden="true">
                      {feat.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {feat.label}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* インタラクティブエリア */}
        <ReadingTimeClient />

        {/* SEOテキストコンテンツ */}
        <section className="max-w-2xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-stone-800">読書速度の豆知識</h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                日本語の平均的な読書速度は<strong>1分あたり400〜600文字</strong>といわれています。文庫本1ページは約600字なので、ふつうのペースで読むと1ページ約1分が目安です。
              </p>
              <p>
                ただし本の種類によって大きく異なります。<strong>漫画</strong>は絵が主体でセリフが少ないため1ページ10〜20秒ほどと速く、<strong>ビジネス書</strong>は専門用語や図表を理解しながら読むため1ページ1〜2分かかることもあります。
              </p>
              <p>
                また、読書に集中できる環境・時間帯によっても速度は変わります。就寝前や移動中は集中力が落ちやすく、休日の朝など静かな環境では速く読めることが多いです。
              </p>
              <p>
                シリーズものを読む場合は全巻合計のページ数で計算すると現実的な読了目標を立てやすくなります。「1日30分」を習慣化すると、月10〜15時間の読書時間を確保できます。
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
