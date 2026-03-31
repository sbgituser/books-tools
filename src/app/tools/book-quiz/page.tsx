/**
 * /tools/book-quiz — おすすめ本診断ツール
 *
 * 5つの質問に答えると読書タイプを診断し、おすすめ本5冊を提案する。
 * インタラクティブUIは BookQuizClient が担当する。
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookQuizClient from "@/components/tools/BookQuizClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// ── メタデータ ────────────────────────────────────────────

export const metadata: Metadata = {
  title: `おすすめ本診断 | 5つの質問であなたにぴったりの本を発見 | ${SITE_NAME}`,
  description:
    "5つの質問に答えるだけで、あなたの読書タイプとおすすめ本5冊を診断。気分・読める時間・雰囲気の好みから、ぴったりの本が見つかります。",
  alternates: {
    canonical: `${SITE_URL}/tools/book-quiz`,
  },
  openGraph: {
    title: `おすすめ本診断 | 5つの質問であなたにぴったりの本を発見 | ${SITE_NAME}`,
    description:
      "5つの質問に答えるだけで読書タイプとおすすめ本5冊を診断。SNSでシェアして友達と比べよう。",
    url: `${SITE_URL}/tools/book-quiz`,
    type: "website",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

// ── 構造化データ ──────────────────────────────────────────

function buildJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "おすすめ本診断とは何ですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "5つの質問（気分・読める時間・雰囲気・主人公への好み・読みたいジャンル）に答えると、あなたの読書タイプ（12タイプ）とおすすめ本5冊を診断するツールです。",
        },
      },
      {
        "@type": "Question",
        name: "何タイプの診断結果がありますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "熱血バトル愛好家・感動ストーリーハンター・知的探求者・癒し系読書家・ダークファンタジー探検家・サスペンス中毒・恋愛小説マイスター・一気読みマラソンランナー・すきま時間の達人・コメディ愛好家・ワールドビルダー・文学探求者の12タイプです。",
        },
      },
      {
        "@type": "Question",
        name: "診断にかかる時間はどのくらいですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "5問の選択式質問に答えるだけで、約1分で診断が完了します。",
        },
      },
      {
        "@type": "Question",
        name: "診断結果はSNSでシェアできますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。X（Twitter）へのシェアボタンとテキストコピーボタンがあり、診断結果を簡単にシェアできます。",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ツール", item: `${SITE_URL}/tools` },
      { "@type": "ListItem", position: 3, name: "おすすめ本診断", item: `${SITE_URL}/tools/book-quiz` },
    ],
  };

  return [faqSchema, breadcrumbSchema];
}

// ── ページ ────────────────────────────────────────────────

export default function BookQuizPage() {
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
        <section className="bg-gradient-to-br from-rose-950 via-pink-900 to-rose-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-rose-300 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/tools" className="hover:text-white transition-colors">ツール</Link>
                </li>
                <li>/</li>
                <li className="text-rose-100 font-medium">おすすめ本診断</li>
              </ol>
            </nav>

            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* 左カラム */}
              <div>
                <p className="text-rose-300 text-xs font-bold tracking-widest uppercase mb-3">
                  Book Quiz · Books Tools
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
                  おすすめ本診断
                  <br />
                  <span className="text-rose-300">5問でわかるあなたの読書タイプ</span>
                </h1>
                <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
                  気分・時間・雰囲気の好みから、あなたにぴったりの
                  本を診断します。12タイプ・おすすめ本5冊付き。
                </p>
                <p className="mt-4 text-xs text-rose-300">
                  <span className="text-white font-semibold">約1分</span>で完了 ·{" "}
                  <span className="text-white font-semibold">12</span>タイプ ·{" "}
                  SNSシェア対応
                </p>
              </div>

              {/* 右カラム：タイププレビュー */}
              <div className="hidden sm:grid grid-cols-2 gap-2">
                {[
                  { icon: "🔥", label: "熱血バトル愛好家" },
                  { icon: "😢", label: "感動ストーリーハンター" },
                  { icon: "🧠", label: "知的探求者" },
                  { icon: "😌", label: "癒し系読書家" },
                  { icon: "🌑", label: "ダークファンタジー探検家" },
                  { icon: "⚡", label: "サスペンス中毒" },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2.5"
                  >
                    <span className="text-xl shrink-0" aria-hidden="true">{t.icon}</span>
                    <p className="text-xs font-semibold text-white truncate">{t.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ステップ */}
            <div className="mt-8 flex items-center gap-6 flex-wrap">
              {[
                { step: "1", label: "質問に答える" },
                { step: "2", label: "タイプ診断" },
                { step: "3", label: "おすすめ本GET" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500/30 border border-rose-400/50 text-rose-200 text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                  <span className="text-sm text-rose-100">{s.label}</span>
                  {i < 2 && (
                    <span className="text-rose-700 text-sm" aria-hidden="true">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 診断インタラクティブエリア */}
        <BookQuizClient />

      </main>
      <Footer />
    </>
  );
}
