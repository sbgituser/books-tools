import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { READING_SCENES } from "@/constants/readingScenes";
import { getAllBlogMeta } from "@/lib/blog";
import { isProtectedBlogSlug } from "@/data/seo-protected-pages";

const POPULAR_WORKS = [
  { workId: "1d7xco7", title: "ハイキュー!!", author: "古舘春一",   type: "漫画", tags: ["熱い", "感動"],  cover: "https://books.google.com/books/content?id=e5KFDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
  { workId: "0zni0pn", title: "進撃の巨人",  author: "諫山創",      type: "漫画", tags: ["絶望", "泣ける"], cover: "https://books.google.com/books/content?id=nMjEBQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  { workId: "0cb8t8s", title: "ONE PIECE",   author: "尾田栄一郎",  type: "漫画", tags: ["熱い", "爽快"],  cover: "https://books.google.com/books/content?id=9ca7CwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  { workId: "17otkk9", title: "NARUTO",      author: "岸本斉史",    type: "漫画", tags: ["感動", "熱い"],  cover: "https://books.google.com/books/content?id=ji3NCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  { workId: "0wafq68", title: "かがみの孤城", author: "辻村深月",    type: "小説", tags: ["ファンタジー", "世界観"], cover: "http://books.google.com/books/content?id=XRi_PAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  { workId: "0ilmrkf", title: "旅猫リポート", author: "有川　浩",   type: "小説", tags: ["泣ける", "感動"], cover: "https://books.google.com/books/content?id=aFXzrQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
] as const;

export const metadata: Metadata = {
  title: "Books Discover | 気分から漫画・小説を発見する",
  description:
    "「泣きたい」「一気読みしたい」など、今の気分・体験ベースで漫画・小説を発見できるサイト。タイトルが分からなくても、雰囲気タグから次の一冊が見つかります。",
  openGraph: {
    title: "Books Discover | 気分から漫画・小説を発見する",
    description: "今の気分・雰囲気で漫画・小説を発見。タグを選ぶだけで次の一冊が見つかる。",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

const MOOD_TAGS = [
  { tag: "泣ける", icon: "😢", href: "/discover?tag=%E6%B3%A3%E3%81%91%E3%82%8B" },
  { tag: "癒やし", icon: "🌿", href: "/discover?tag=%E7%99%92%E3%82%84%E3%81%97" },
  { tag: "熱い", icon: "🔥", href: "/discover?tag=%E7%86%B1%E3%81%84" },
  { tag: "ダーク", icon: "🌑", href: "/discover?tag=%E3%83%80%E3%83%BC%E3%82%AF" },
  { tag: "一気読み", icon: "📖", href: "/discover?tag=%E4%B8%80%E6%B0%97%E8%AA%AD%E3%81%BF" },
  { tag: "考えさせられる", icon: "🧠", href: "/discover?tag=%E8%80%83%E3%81%88%E3%81%95%E3%81%9B%E3%82%89%E3%82%8C%E3%82%8B" },
  { tag: "爽快", icon: "⚡", href: "/discover?tag=%E7%88%BD%E5%BF%AB" },
  { tag: "日常系", icon: "🏡", href: "/discover?tag=%E6%97%A5%E5%B8%B8%E7%B3%BB" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Books Discover",
  url: "https://books.kuras-plus.com",
  description: "気分・雰囲気で漫画・小説を発見する",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://books.kuras-plus.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Books Tools",
  url: "https://books.kuras-plus.com",
  logo: "https://books.kuras-plus.com/ogp/default-ogp.png",
  sameAs: [],
};

function FeaturedArticlesSection() {
  // GA4実績のある保護記事をトップに優先表示し、内部リンクを集中させる
  const all = getAllBlogMeta();
  const protectedPosts = all.filter((p) => isProtectedBlogSlug(p.slug));
  const rest = all.filter((p) => !isProtectedBlogSlug(p.slug));
  const posts = [...protectedPosts, ...rest].slice(0, 4);
  if (posts.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-rose-50 to-stone-50 border-t border-rose-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-rose-500 text-xs font-bold tracking-widest uppercase mb-2">
            Featured
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
            今週の人気記事
          </h2>
          <p className="text-stone-500 text-sm">
            ファンタジー漫画・春アニメ原作など、今読みたい特集記事
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-stone-200 hover:border-rose-300 rounded-xl p-5 transition-all hover:shadow-md"
            >
              <p className="text-xs text-stone-400 mb-1.5">
                {post.date} · {post.readingText}
              </p>
              <p className="text-sm font-bold text-stone-800 group-hover:text-rose-700 transition-colors leading-snug line-clamp-2 mb-2">
                {post.title}
              </p>
              {post.description && (
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-2">{post.description}</p>
              )}
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/blog"
            className="text-sm text-rose-600 hover:text-rose-700 font-semibold hover:underline"
          >
            すべてのブログ記事を読む →
          </Link>
        </div>
      </div>
    </section>
  );
}

function NewContentSection() {
  const posts = getAllBlogMeta().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="bg-stone-50 border-t border-stone-200 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
            新着コンテンツ
          </h2>
          <p className="text-stone-500 text-sm">最新の追加記事をチェック</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">NEW</span>
                <time className="text-xs text-stone-400">{post.date}</time>
              </div>
              <p className="text-sm font-semibold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                {post.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Header />
      <main>

        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 text-white py-14 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-rose-400 text-xs font-bold tracking-widest uppercase mb-4">
              Books Discover · kuras-plus
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              今の気分で、<br />
              <span className="text-rose-400">次の一冊</span>を見つける。
            </h1>
            <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
              「泣きたい」「一気読みしたい」「ダークな話が読みたい」——<br className="hidden sm:block" />
              タイトルが分からなくても、<strong className="text-white">読みたい体験</strong>から漫画・小説が見つかります。
            </p>

            {/* メイン CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/discover"
                className="inline-flex items-center gap-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-base sm:text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg hover:shadow-rose-500/30"
              >
                <span>気分から本を探す</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-stone-300 hover:text-white text-sm px-5 py-3 rounded-xl border border-stone-700 hover:border-stone-500 transition-colors"
              >
                おすすめ記事を読む
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Stats バー ──────────────────────────────────────────── */}
        <section className="bg-stone-800 text-white py-4 px-4">
          <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-2">
            {[
              { num: "2,000+", label: "漫画・小説" },
              { num: "50+",    label: "気分タグ" },
              { num: "100+",   label: "ブログ記事" },
              { num: "無料",   label: "登録不要" },
            ].map(({ num, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm">
                <span className="font-bold text-rose-400 text-base">{num}</span>
                <span className="text-stone-400">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 人気の使い方 ──────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
              人気の使い方
            </h2>
            <p className="text-stone-500 text-sm">目的に合わせた本の探し方を選べます</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { href: "/tools/book-quiz", icon: "🔮", title: "おすすめ本診断", desc: "5つの質問であなたにぴったりの本を提案" },
              { href: "/genre", icon: "📂", title: "ジャンルから探す", desc: "ミステリー・SF・ファンタジー等で絞り込み" },
              { href: "/discover", icon: "💡", title: "気分で選ぶ", desc: "泣ける・熱い・ダーク等の雰囲気で探す" },
              { href: "/tools/reading-order", icon: "📖", title: "シリーズ読む順番", desc: "50以上の人気シリーズの読む順番がわかる" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col gap-2 bg-white border border-stone-200 hover:border-rose-400 hover:shadow-md rounded-2xl p-4 transition-all"
              >
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <p className="font-bold text-sm text-stone-800 group-hover:text-rose-700 transition-colors leading-snug">{item.title}</p>
                <p className="text-xs text-stone-500 leading-snug">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 気分・ジャンルショートカット ──────────────────────── */}
        <section className="bg-white border-t border-stone-100 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
                どんな気分ですか？
              </h2>
              <p className="text-stone-500 text-sm">タグを選ぶと、その雰囲気の作品一覧が見られます</p>
            </div>

            {/* 気分タグ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {MOOD_TAGS.map(({ tag, icon, href }) => (
                <Link
                  key={tag}
                  href={href}
                  className="flex items-center gap-3 bg-white border border-stone-200 hover:border-rose-400 hover:shadow-md rounded-2xl px-4 py-4 transition-all group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">{icon}</span>
                  <span className="font-bold text-stone-800 group-hover:text-rose-700 transition-colors">
                    {tag}
                  </span>
                </Link>
              ))}
            </div>

            {/* ジャンル */}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <Link
                href="/discover?type=manga"
                className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl px-6 py-5 text-white hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-4"
              >
                <span className="text-4xl opacity-80" aria-hidden="true">📖</span>
                <div>
                  <p className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-0.5">Manga</p>
                  <p className="font-bold text-lg leading-tight">漫画を発見する</p>
                  <p className="text-rose-100 text-xs mt-0.5">少年・少女・青年・SF・ホラー</p>
                </div>
                <span className="ml-auto font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/discover?type=novel"
                className="group relative overflow-hidden bg-gradient-to-br from-sky-500 to-sky-700 rounded-xl px-6 py-5 text-white hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-4"
              >
                <span className="text-4xl opacity-80" aria-hidden="true">📕</span>
                <div>
                  <p className="text-sky-200 text-xs font-bold uppercase tracking-wider mb-0.5">Novel</p>
                  <p className="font-bold text-lg leading-tight">小説を発見する</p>
                  <p className="text-sky-100 text-xs mt-0.5">ミステリ・恋愛・SF・純文学</p>
                </div>
                <span className="ml-auto font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/discover"
                className="text-sm text-rose-600 hover:text-rose-700 font-semibold hover:underline"
              >
                すべてのタグで探す →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 人気作品ピックアップ ──────────────────────────────────── */}
        <section className="bg-white border-t border-stone-100 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
                こんな作品が見つかります
              </h2>
              <p className="text-stone-500 text-sm">
                各作品の巻一覧・タグ・Kindleリンクをまとめて確認できます
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {POPULAR_WORKS.map((work) => (
                <Link
                  key={work.workId}
                  href={`/works/${work.workId}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-stone-200 shadow-sm group-hover:shadow-md transition-shadow bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={work.cover}
                      alt={`${work.title} の表紙`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={200}
                      height={300}
                    />
                    <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-stone-900/80 text-white">
                      {work.type}
                    </span>
                  </div>
                  <div className="w-full text-center">
                    <p className="text-xs font-semibold text-stone-800 group-hover:text-rose-700 transition-colors leading-snug line-clamp-2">
                      {work.title}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                      {work.tags.map((t) => (
                        <span key={t} className="text-[9px] px-1 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/discover"
                className="text-sm text-rose-600 hover:text-rose-700 font-semibold hover:underline"
              >
                すべての作品を探す →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── ジャンルから探す（タグクラウド） ──────────────────────── */}
        <section className="bg-white border-t border-stone-100 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
                ジャンルから探す
              </h2>
              <p className="text-stone-500 text-sm">
                好きなジャンルを選んで、おすすめ作品を発見しましょう
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: "fantasy", label: "ファンタジー", emoji: "🐉" },
                { id: "mystery", label: "ミステリー", emoji: "🔍" },
                { id: "shonen", label: "少年漫画", emoji: "⚡" },
                { id: "seinen", label: "青年漫画", emoji: "📘" },
                { id: "sf", label: "SF", emoji: "🚀" },
                { id: "literary", label: "純文学", emoji: "✒️" },
                { id: "romance", label: "恋愛", emoji: "💕" },
                { id: "horror", label: "ホラー", emoji: "👻" },
                { id: "shojo", label: "少女漫画", emoji: "🌸" },
                { id: "youth", label: "青春", emoji: "🌅" },
                { id: "historical-novel", label: "歴史・時代小説", emoji: "🏯" },
                { id: "entertainment", label: "エンタメ", emoji: "🎭" },
              ].map((g) => (
                <Link
                  key={g.id}
                  href={`/genre/${g.id}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-50 border border-stone-200 hover:border-amber-400 hover:bg-amber-50 rounded-full text-sm font-semibold text-stone-700 hover:text-amber-700 transition-all"
                >
                  <span aria-hidden="true">{g.emoji}</span>
                  {g.label}
                </Link>
              ))}
            </div>
            <div className="text-center mt-5">
              <Link
                href="/genre"
                className="text-sm text-amber-600 hover:text-amber-700 font-semibold hover:underline"
              >
                すべてのジャンルを見る →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 春アニメ×ファンタジー特集 ──────────────────────────── */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-100 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-amber-600 text-xs font-bold tracking-widest uppercase mb-2">
                Spring 2026
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
                2026年春アニメ化ファンタジー原作
              </h2>
              <p className="text-stone-500 text-sm">
                転スラ4期・リゼロ4th・黄泉のツガイなど、話題のファンタジー原作を今すぐチェック
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { title: "ファンタジー漫画おすすめ30選", desc: "異世界・ダークファンタジー・冒険ファンタジーの名作を厳選", href: "/blog/fantasy-manga-recommendations", emoji: "🐉" },
                { title: "春アニメ原作ガイド全60作品", desc: "2026年4月放送開始アニメの原作漫画・ラノベを完全網羅", href: "/blog/spring-anime-2026-original-manga", emoji: "📺" },
                { title: "冒険漫画おすすめ厳選20選", desc: "ファンタジー×冒険の名作・最新作を網羅", href: "/collections/adventure-manga", emoji: "⚔️" },
                { title: "魔法小説おすすめ12選", desc: "ハリー・ポッターから和風ファンタジーまで", href: "/blog/magic-fantasy-novel-recommendations", emoji: "✨" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 bg-white border border-amber-100 hover:border-amber-300 rounded-xl px-5 py-4 transition-all hover:shadow-sm"
                >
                  <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">{item.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/genre/fantasy"
                className="text-sm text-amber-600 hover:text-amber-700 font-semibold hover:underline"
              >
                ファンタジー作品をもっと探す →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 読書シーン ────────────────────────────────────────── */}
        <section className="bg-white border-t border-stone-100 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
                今の状況で探す
              </h2>
              <p className="text-stone-500 text-sm">
                読書シーンを選ぶだけで、ぴったりの作品が見つかります
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {READING_SCENES.map((scene) => (
                <Link
                  key={scene.slug}
                  href={`/scene/${scene.slug}`}
                  className="group flex items-center gap-3 bg-stone-50 border border-stone-200 hover:border-violet-400 hover:bg-violet-50 rounded-xl px-4 py-3.5 transition-all"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">{scene.icon}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-stone-800 group-hover:text-violet-700 transition-colors text-sm leading-snug">
                      {scene.label}
                    </p>
                    <p className="text-xs text-stone-400 leading-tight mt-0.5 line-clamp-1">
                      {scene.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/scene"
                className="text-sm text-violet-600 hover:text-violet-700 font-semibold hover:underline"
              >
                すべての読書シーンを見る →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 使い方 3ステップ ──────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 py-14">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
              3ステップで次の一冊へ
            </h2>
            <p className="text-stone-500 text-sm">タイトルが思い浮かばなくても大丈夫</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "01", icon: "🎯", title: "気分を選ぶ", desc: "「泣きたい」「熱い展開が読みたい」など、今の気分に合うタグをタップ" },
              { step: "02", icon: "📚", title: "作品リストが出る", desc: "そのタグに合う漫画・小説が一覧表示。ジャンル・巻数・連載状況も確認できる" },
              { step: "03", icon: "🛒", title: "Kindleで読む", desc: "気に入った作品の試し読み・購入はAmazonのリンクから。登録・課金は一切不要" },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative bg-stone-50 border border-stone-200 rounded-2xl p-5">
                <span className="absolute -top-3 left-5 text-xs font-bold text-rose-500 bg-white border border-rose-200 px-2 py-0.5 rounded-full">
                  STEP {step}
                </span>
                <div className="text-3xl mb-3 mt-1" aria-hidden="true">{icon}</div>
                <p className="font-bold text-stone-900 mb-1.5">{title}</p>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ツール一覧 ────────────────────────────────────────── */}
        <section className="bg-stone-50 border-t border-stone-200 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">
                本を探すツール
              </h2>
              <p className="text-stone-500 text-sm">Amazonにはない「本の探し方」を提供します</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/tools/media-originals"
                className="group flex flex-col gap-2 bg-white border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-2xl p-4 transition-all hover:shadow-sm"
              >
                <span className="text-2xl" aria-hidden="true">🎬</span>
                <p className="text-sm font-bold text-stone-800 group-hover:text-indigo-700 transition-colors leading-snug">映像から原作を探す</p>
                <p className="text-xs text-stone-500">映画・ドラマ・アニメの原作本を逆引き</p>
              </Link>
              <Link
                href="/tools/trend-books"
                className="group flex flex-col gap-2 bg-white border border-stone-200 hover:border-teal-300 hover:bg-teal-50 rounded-2xl p-4 transition-all hover:shadow-sm"
              >
                <span className="text-2xl" aria-hidden="true">📰</span>
                <p className="text-sm font-bold text-stone-800 group-hover:text-teal-700 transition-colors leading-snug">テーマから本を探す</p>
                <p className="text-xs text-stone-500">AI・経済・環境など今のテーマで選ぶ</p>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 今週の人気記事 ──────────────────────────────────────── */}
        <FeaturedArticlesSection />

        {/* ─── 新着コンテンツ ──────────────────────────────────────── */}
        <NewContentSection />

        {/* ─── 最終 CTA ──────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-rose-500 to-rose-700 text-white py-14 px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            あなたにぴったりの一冊を見つけよう
          </h2>
          <p className="text-rose-100 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
            2,000冊以上の中から、今の気分・シーン・ジャンルで絞り込み。
            登録不要・完全無料で今すぐ使えます。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 bg-white text-rose-600 hover:bg-rose-50 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-md text-base"
            >
              今すぐ本を探す →
            </Link>
            <Link
              href="/manga/mood"
              className="inline-flex items-center gap-2 text-white border border-white/40 hover:border-white hover:bg-white/10 px-6 py-3.5 rounded-xl text-sm font-medium transition-colors"
            >
              漫画を気分で探す
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
