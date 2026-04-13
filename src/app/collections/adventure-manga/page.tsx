/**
 * /collections/adventure-manga — 冒険漫画おすすめコレクション
 * 「冒険 漫画」「冒険 漫画 おすすめ」をターゲットKWとしたテーマ別コレクションページ。
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GenreWorksClient from "@/components/works/GenreWorksClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getAllBlogMeta } from "@/lib/blog";
import type { WorkListItem } from "@/types/work";

const PAGE_URL = `${SITE_URL}/collections/adventure-manga`;

export const metadata: Metadata = {
  title: `冒険漫画おすすめ20選【2026年版】王道・異世界・探索系の人気作を厳選 | ${SITE_NAME}`,
  description:
    "冒険漫画のおすすめ20選を2026年版で紹介。ONE PIECE・鋼の錬金術師・葬送のフリーレンなど王道から異世界冒険・ダンジョン探索系まで、人気の名作が見つかります。",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `冒険漫画おすすめ20選【2026年版】王道・異世界・探索系の人気作を厳選`,
    description:
      "冒険漫画のおすすめ20選を2026年版で紹介。王道から異世界冒険・ダンジョン探索系まで人気の名作が見つかります。",
    url: PAGE_URL,
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

/** 冒険系タグを持つ漫画を取得 */
function getAdventureMangaWorks(): WorkListItem[] {
  try {
    const worksListPath = join(
      process.cwd(),
      "public",
      "data",
      "works-list.json",
    );
    const allWorks: WorkListItem[] = JSON.parse(
      readFileSync(worksListPath, "utf-8"),
    );

    const adventureTags = new Set([
      "バトル",
      "熱い",
      "爽快",
      "ファンタジー",
      "世界観重視",
    ]);

    return allWorks.filter(
      (w) =>
        w.type === "manga" &&
        w.discoveryTags?.some((t) => adventureTags.has(t)),
    );
  } catch {
    return [];
  }
}

const ADVENTURE_TAGS = [
  { label: "冒険", href: "/collections/adventure-manga" },
  { label: "ファンタジー", href: "/genre/fantasy" },
  { label: "バトル", href: "/genre/shonen" },
  { label: "異世界", href: "/discover?tag=%E4%B8%96%E7%95%8C%E8%A6%B3%E9%87%8D%E8%A6%96" },
  { label: "SF", href: "/genre/sf" },
  { label: "魔法小説", href: "/blog/magic-fantasy-novel-recommendations" },
] as const;

export default function AdventureMangaPage() {
  const works = getAdventureMangaWorks();

  const relatedBlogPosts = getAllBlogMeta()
    .filter(
      (post) =>
        post.tags?.some(
          (tag) =>
            tag.includes("冒険") ||
            tag.includes("ファンタジー") ||
            tag.includes("漫画") ||
            tag.includes("バトル"),
        ) || post.title?.includes("冒険"),
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "冒険漫画おすすめ20選【2026年版】",
    description:
      "冒険漫画のおすすめ20選を2026年版で紹介。王道から異世界冒険・ダンジョン探索系まで人気の名作が見つかります。",
    url: PAGE_URL,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: works.length,
      itemListElement: works.slice(0, 20).map((w, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: w.title,
        url: `${SITE_URL}/works/${w.workId}`,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "冒険漫画おすすめ",
        item: PAGE_URL,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "冒険漫画でまず読むべきおすすめ作品は？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "冒険漫画の王道なら「ONE PIECE」「NARUTO」が定番です。完結済みの名作なら「鋼の錬金術師」「進撃の巨人」がおすすめ。ファンタジー要素が強い冒険漫画を探しているなら「葬送のフリーレン」「ダンジョン飯」も人気です。",
        },
      },
      {
        "@type": "Question",
        name: "冒険漫画とファンタジー漫画の違いは？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "冒険漫画は「旅・探索・未知の世界への挑戦」がメインテーマ。ファンタジー漫画は「魔法・異世界・非日常の世界観」が特徴です。多くの作品は両方の要素を持っており、「冒険ファンタジー」として楽しめます。",
        },
      },
      {
        "@type": "Question",
        name: "大人でも楽しめる冒険漫画はありますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。「ヴィンランド・サガ」「ベルセルク」「ゴールデンカムイ」などは大人向けの深いテーマを持つ冒険漫画です。歴史・哲学・人間ドラマの要素が強く、読み応えがあります。",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
        {/* Hero */}
        <section className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-stone-400 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-amber-400">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li className="text-stone-300 font-medium">
                  冒険漫画おすすめ
                </li>
              </ol>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-5xl sm:text-6xl" aria-hidden="true">
                ⚔️
              </span>
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-wider mb-1">
                  テーマ別コレクション
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-2">
                  冒険漫画おすすめ
                  <span className="text-amber-400">厳選20選</span>
                </h1>
                <p className="text-stone-300 text-sm sm:text-base">
                  ファンタジー×冒険の王道バトル漫画から異世界冒険、壮大な旅の物語まで。
                  名作・人気作・最新作を網羅した冒険漫画おすすめガイドです。
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-400">
              <span className="text-amber-300 font-semibold">
                {works.length}作品
              </span>{" "}
              が見つかりました
            </p>
          </div>
        </section>

        {/* 関連タグナビ */}
        <section className="max-w-4xl mx-auto px-4 pt-8 pb-2">
          <div className="flex flex-wrap gap-2">
            {ADVENTURE_TAGS.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  tag.label === "冒険"
                    ? "bg-amber-500 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-700"
                }`}
              >
                #{tag.label}
              </Link>
            ))}
          </div>
        </section>

        {/* リッチリード文 */}
        <section className="max-w-4xl mx-auto px-4 pt-6 pb-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-stone-800 mb-3">
              冒険漫画の魅力と選び方
            </h2>
            <div className="text-sm text-stone-600 leading-relaxed space-y-3">
              <p>
                冒険漫画は、主人公が未知の世界を旅し、仲間と出会い、困難を乗り越えて成長していく物語です。
                ファンタジー要素を持つ壮大な世界観、熱いバトルシーン、感動的な仲間との絆が魅力。
                少年漫画の王道ジャンルとして長年愛されています。
              </p>
              <p>
                選び方のポイントは「テイスト」を意識すること。
                王道の熱血バトル系（ONE PIECE・NARUTO）、ダークで重厚な冒険（ベルセルク・進撃の巨人）、
                ファンタジー探索系（ダンジョン飯・葬送のフリーレン）では、読み心地がまったく異なります。
                まずは好みのテイストから選んでみてください。
              </p>
            </div>
          </div>
        </section>

        {/* テイスト別おすすめ */}
        <section className="max-w-4xl mx-auto px-4 py-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">
            テイスト別・冒険漫画の選び方
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "🔥",
                label: "王道バトル・熱血系",
                desc: "ONE PIECE、NARUTO、僕のヒーローアカデミアなど。仲間との絆と成長、熱いバトルが魅力。",
                href: "/genre/shonen",
              },
              {
                emoji: "🌑",
                label: "ダーク・重厚系",
                desc: "ベルセルク、進撃の巨人、呪術廻戦など。壮絶な展開と深いテーマが読み応え抜群。",
                href: "/blog/dark-fantasy-manga",
              },
              {
                emoji: "🏰",
                label: "ファンタジー探索系",
                desc: "鋼の錬金術師、葬送のフリーレン、ヴィンランド・サガなど。世界設定と旅の楽しさが魅力。",
                href: "/genre/fantasy",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-5 transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <h3 className="font-bold text-stone-800 text-sm group-hover:text-amber-700 transition-colors">
                    {item.label}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* メインコンテンツ */}
        <section className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <h2 className="text-lg font-bold text-stone-800 mb-6">
            冒険漫画おすすめ作品一覧
          </h2>
          {works.length > 0 ? (
            <GenreWorksClient works={works} />
          ) : (
            <p className="text-center text-stone-500 py-12">
              作品データを読み込み中です。
            </p>
          )}
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-4 py-10 border-t border-stone-200">
          <h2 className="text-lg font-bold text-stone-800 mb-5">
            よくある質問
          </h2>
          <dl className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <dt className="text-sm font-semibold text-stone-800 mb-2">
                冒険漫画でまず読むべきおすすめ作品は？
              </dt>
              <dd className="text-sm text-stone-600 leading-relaxed">
                冒険漫画の王道なら「ONE
                PIECE」「NARUTO」が定番です。完結済みの名作なら「鋼の錬金術師」「進撃の巨人」がおすすめ。ファンタジー要素が強い冒険漫画を探しているなら「葬送のフリーレン」「ダンジョン飯」も人気です。
              </dd>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <dt className="text-sm font-semibold text-stone-800 mb-2">
                冒険漫画とファンタジー漫画の違いは？
              </dt>
              <dd className="text-sm text-stone-600 leading-relaxed">
                冒険漫画は「旅・探索・未知の世界への挑戦」がメインテーマ。ファンタジー漫画は「魔法・異世界・非日常の世界観」が特徴です。多くの作品は両方の要素を持っており、「冒険ファンタジー」として楽しめます。
              </dd>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <dt className="text-sm font-semibold text-stone-800 mb-2">
                大人でも楽しめる冒険漫画はありますか？
              </dt>
              <dd className="text-sm text-stone-600 leading-relaxed">
                はい。「ヴィンランド・サガ」「ベルセルク」「ゴールデンカムイ」などは大人向けの深いテーマを持つ冒険漫画です。歴史・哲学・人間ドラマの要素が強く、読み応えがあります。
              </dd>
            </div>
          </dl>
        </section>

        {/* 関連ブログ記事 */}
        {relatedBlogPosts.length > 0 && (
          <section className="border-t border-stone-200 bg-stone-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
                関連ブログ記事
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedBlogPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1 bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-4 transition-all hover:shadow-sm"
                  >
                    <p className="text-xs text-stone-400">{post.date}</p>
                    <p className="text-sm font-semibold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 関連ジャンル */}
        <section className="border-t border-stone-200 bg-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
              関連ジャンル
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: "fantasy", label: "ファンタジー" },
                { id: "shonen", label: "少年漫画" },
                { id: "sf", label: "SF" },
                { id: "seinen", label: "青年漫画" },
                { id: "entertainment", label: "エンタメ" },
              ].map((g) => (
                <Link
                  key={g.id}
                  href={`/genre/${g.id}`}
                  className="px-3 py-2 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-700 rounded-full text-sm font-semibold transition-colors"
                >
                  {g.label}
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/genre"
                className="text-sm text-stone-500 hover:text-amber-600 transition-colors"
              >
                ← ジャンル一覧に戻る
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
