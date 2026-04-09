/**
 * /tools/media-originals — メディア横断原作逆引きツール
 *
 * 映画・ドラマ・アニメなどの映像作品から原作書籍を逆引きできるツール。
 * インタラクティブUI は MediaOriginalsClient が担当する。
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MediaOriginalsClient from "@/components/tools/MediaOriginalsClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { MEDIA_ORIGINALS } from "@/constants/mediaOriginals";

// ── メタデータ ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `映像作品から原作本を探す | ${SITE_NAME}`,
  description:
    "映画・ドラマ・アニメから原作となった本を検索できる逆引きツール。ガリレオ・君の名は・DEATH NOTE・半沢直樹など、映像作品名で原作書籍をすぐ発見できます。",
  alternates: {
    canonical: `${SITE_URL}/tools/media-originals`,
  },
  openGraph: {
    title: `映像作品から原作本を探す | ${SITE_NAME}`,
    description:
      "映画・ドラマ・アニメから原作となった本を検索できる逆引きツール。映像作品名で原作書籍をすぐ発見。",
    url: `${SITE_URL}/tools/media-originals`,
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
        name: "映像作品から原作本を検索できますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。映画・ドラマ・アニメ・海外作品の名前を入力すると、原作となった小説・漫画を逆引きできます。作品名の一部でも検索可能です。",
        },
      },
      {
        "@type": "Question",
        name: "アニメの原作も対象ですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。鬼滅の刃・進撃の巨人・のだめカンタービレなど、アニメ作品の原作漫画・小説も検索できます。",
        },
      },
      {
        "@type": "Question",
        name: "海外映画の原作本も探せますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。ハリー・ポッターなど海外作品の原作も対象です。フィルタで「海外」を選ぶと絞り込めます。",
        },
      },
      {
        "@type": "Question",
        name: "原作と映像版の違いも分かりますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。各作品の詳細画面で「原作と映像の違い」「原作をおすすめする人」を確認できます。",
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
        name: "映像作品から原作本を探す",
        item: `${SITE_URL}/tools/media-originals`,
      },
    ],
  };

  return [faqSchema, breadcrumbSchema];
}

// ── ページ ────────────────────────────────────────────────────

export default function MediaOriginalsPage() {
  const jsonLdArray = buildJsonLd();
  const totalCount = MEDIA_ORIGINALS.length;

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
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-slate-400 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-indigo-400 transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li className="text-slate-300 font-medium">
                  映像から原作を探す
                </li>
              </ol>
            </nav>

            {/* PC：2カラム / スマホ：縦並び */}
            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* 左カラム：テキスト */}
              <div>
                <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">
                  Media Originals · Books Tools
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
                  映像作品から
                  <br />
                  <span className="text-indigo-400">原作本</span>を探す
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  映画・ドラマ・アニメから原作となった本を逆引きできます。
                  作品名を入力するだけで、小説・漫画の原作が
                  すぐ見つかります。
                </p>
                <p className="mt-4 text-xs text-slate-400">
                  <span className="text-indigo-300 font-semibold">
                    {totalCount}件
                  </span>{" "}
                  の映像作品 ・ 原作対応を収録
                </p>
              </div>

              {/* 右カラム：ビジュアル説明 */}
              <div className="hidden sm:flex flex-col gap-3">
                {/* 例カード（静的デモ） */}
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                      📺 ドラマ
                    </span>
                    <span className="text-xs text-slate-400">2007年</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-0.5">映像作品</p>
                      <p className="text-sm font-bold text-white">ガリレオ</p>
                    </div>
                    <span className="text-indigo-400 font-bold text-lg">→</span>
                    <div className="flex-1">
                      <p className="text-xs text-indigo-300 mb-0.5">原作</p>
                      <p className="text-sm font-bold text-white">探偵ガリレオ</p>
                      <p className="text-xs text-slate-400">東野圭吾</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                      ✨ アニメ
                    </span>
                    <span className="text-xs text-slate-400">2019年</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-0.5">映像作品</p>
                      <p className="text-sm font-bold text-white">鬼滅の刃</p>
                    </div>
                    <span className="text-indigo-400 font-bold text-lg">→</span>
                    <div className="flex-1">
                      <p className="text-xs text-indigo-300 mb-0.5">原作</p>
                      <p className="text-sm font-bold text-white">鬼滅の刃</p>
                      <p className="text-xs text-slate-400">吾峠呼世晴</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* インタラクティブエリア */}
        <MediaOriginalsClient />

        {/* 関連記事 */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-base font-bold text-stone-700 mb-4">映像化小説の関連記事</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              href="/blog/movie-adapted-novels"
              className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <p className="text-xs text-indigo-600 font-semibold mb-1">おすすめ記事</p>
              <p className="text-sm font-bold text-stone-800 leading-snug">
                映画化・映像化された小説おすすめ30選【2026年最新】
              </p>
              <p className="text-xs text-stone-500 mt-1">映画・ドラマ別に厳選した原作ガイド</p>
            </Link>
            <Link
              href="/blog/movie-adaptations-2026"
              className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <p className="text-xs text-indigo-600 font-semibold mb-1">2026年最新</p>
              <p className="text-sm font-bold text-stone-800 leading-snug">
                【2026年版】映像化された小説・漫画おすすめ一覧
              </p>
              <p className="text-xs text-stone-500 mt-1">映画・ドラマ・アニメ原作を一覧で確認</p>
            </Link>
            <Link
              href="/blog/find-original-books-from-movies"
              className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <p className="text-xs text-indigo-600 font-semibold mb-1">使い方ガイド</p>
              <p className="text-sm font-bold text-stone-800 leading-snug">
                映画・ドラマ・アニメの原作本の探し方
              </p>
              <p className="text-xs text-stone-500 mt-1">映像から本の世界に入る楽しみ方</p>
            </Link>
          </div>
        </section>

        {/* ファンタジー系ジャンル導線 */}
        <section className="max-w-4xl mx-auto px-4 pb-10">
          <h2 className="text-base font-bold text-stone-700 mb-4">ジャンル別に原作を探す</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/genre/fantasy"
              className="group flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 hover:border-amber-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">🐉</span>
              <div>
                <p className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">ファンタジー漫画・小説おすすめ</p>
                <p className="text-xs text-stone-500 mt-0.5">異世界・魔法・冒険の人気作品を一覧で探す</p>
              </div>
            </Link>
            <Link
              href="/blog/spring-anime-2026-original-manga"
              className="group flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 hover:border-amber-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">📺</span>
              <div>
                <p className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">2026年春アニメ原作ガイド全60作品</p>
                <p className="text-xs text-stone-500 mt-0.5">転スラ4期・リゼロ4th・あかね噺など注目作の原作情報</p>
              </div>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
