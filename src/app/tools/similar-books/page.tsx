/**
 * /tools/similar-books — 似ている本を探す
 *
 * お気に入りの本に似た作品を見つける類似作品レコメンドツール。
 * インタラクティブUI は SimilarBooksClient が担当する。
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimilarBooksClient from "@/components/tools/SimilarBooksClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// ── メタデータ ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `似ている本を探す | この本が好きならおすすめの類似作品検索 | ${SITE_NAME}`,
  description:
    "お気に入りの本に似た作品を見つけよう。テーマ・トーン・テンポなどの属性で類似度を判定し、「この本が好きなら」系のレコメンドを提供します。389作品収録。",
  alternates: {
    canonical: `${SITE_URL}/tools/similar-books`,
  },
  openGraph: {
    title: `似ている本を探す | この本が好きならおすすめの類似作品検索 | ${SITE_NAME}`,
    description:
      "お気に入りの本に似た作品を見つけよう。テーマ・トーン・テンポなどの属性で類似度を判定し、「この本が好きなら」系のレコメンドを提供します。389作品収録。",
    url: `${SITE_URL}/tools/similar-books`,
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
        name: "どんな本に対応していますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "小説・漫画など389作品以上の類似関係データを収録しています。東野圭吾・村上春樹などの人気作家や、ワンピース・鬼滅の刃などの人気漫画に対応しています。",
        },
      },
      {
        "@type": "Question",
        name: "どのような基準で「似ている」と判定しますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "同じ作者・同じ出版社・読み味が近い（テーマ・トーン・テンポ・文体・時代設定・深さ・読後感）の3種類の基準で類似作品を分類しています。",
        },
      },
      {
        "@type": "Question",
        name: "Amazonで購入できますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "各類似作品にAmazonへのリンクを設置しています。書名をクリックすることで該当書籍のAmazon検索ページに移動できます。",
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
        name: "似ている本を探す",
        item: `${SITE_URL}/tools/similar-books`,
      },
    ],
  };

  return [faqSchema, breadcrumbSchema];
}

// ── ページ ────────────────────────────────────────────────────

export default function SimilarBooksPage() {
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
        <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-violet-300/70 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-violet-300 transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/tools" className="hover:text-violet-300 transition-colors">
                    ツール
                  </Link>
                </li>
                <li>/</li>
                <li className="text-violet-200 font-medium">
                  似ている本を探す
                </li>
              </ol>
            </nav>

            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* 左カラム */}
              <div>
                <p className="text-violet-400 text-xs font-bold tracking-widest uppercase mb-3">
                  Similar Books · Books Tools
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
                  <span className="text-3xl sm:text-4xl mr-2" aria-hidden="true">📚</span>
                  似ている本を
                  <br />
                  <span className="text-violet-400">探す</span>
                </h1>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  お気に入りの本に似た作品を見つけよう。テーマ・トーン・テンポなどの属性で類似作品をレコメンドします。
                </p>
                <p className="mt-4 text-xs text-stone-400">
                  <span className="text-violet-300 font-semibold">389作品以上</span>
                  {" "}収録
                </p>
              </div>

              {/* 右カラム：特徴プレビュー */}
              <div className="hidden sm:grid grid-cols-2 gap-2">
                {[
                  { icon: "🎭", label: "同じ作者", desc: "著者の他の作品" },
                  { icon: "📖", label: "同じテーマ", desc: "テーマが近い作品" },
                  { icon: "✨", label: "読み味が近い", desc: "雰囲気・テンポが類似" },
                  { icon: "🔍", label: "属性検索", desc: "ジャンル・タイプで絞込" },
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
        <SimilarBooksClient />

        {/* ジャンル別に探す導線 */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-base font-bold text-stone-700 mb-4">ジャンル別に作品を探す</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              href="/genre/fantasy"
              className="group flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 hover:border-amber-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">🐉</span>
              <div>
                <p className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">ファンタジー</p>
                <p className="text-xs text-stone-500 mt-0.5">異世界・魔法・冒険の人気作品</p>
              </div>
            </Link>
            <Link
              href="/genre/mystery"
              className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">🔍</span>
              <div>
                <p className="text-sm font-bold text-stone-800 group-hover:text-indigo-700 transition-colors leading-snug">ミステリー</p>
                <p className="text-xs text-stone-500 mt-0.5">推理・サスペンスの名作</p>
              </div>
            </Link>
            <Link
              href="/genre/shonen"
              className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">⚡</span>
              <div>
                <p className="text-sm font-bold text-stone-800 group-hover:text-indigo-700 transition-colors leading-snug">少年漫画</p>
                <p className="text-xs text-stone-500 mt-0.5">バトル・冒険・スポーツ</p>
              </div>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
