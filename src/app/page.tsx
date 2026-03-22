import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { READING_SCENES } from "@/constants/readingScenes";

export const metadata: Metadata = {
  title: "Books Discover | 気分から漫画・小説を発見する",
  description:
    "「泣きたい」「一気読みしたい」など、今の気分・体験ベースで漫画・小説を発見できるサイト。タイトルが分からなくても、雰囲気タグから次の一冊が見つかります。",
  openGraph: {
    title: "Books Discover | 気分から漫画・小説を発見する",
    description: "今の気分・雰囲気で漫画・小説を発見。タグを選ぶだけで次の一冊が見つかる。",
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
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>

        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 text-white py-16 sm:py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-rose-400 text-xs font-bold tracking-widest uppercase mb-4">
              Books Discover · kuras-plus
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              今の気分で、<br />
              <span className="text-rose-400">次の一冊</span>を見つける。
            </h1>
            <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
              「泣きたい」「一気読みしたい」「ダークな話が読みたい」——<br className="hidden sm:block" />
              タイトルが分からなくても、<strong className="text-white">読みたい体験</strong>から漫画・小説が見つかります。
            </p>

            {/* メイン CTA */}
            <Link
              href="/discover"
              className="inline-flex items-center gap-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-base sm:text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg hover:shadow-rose-500/30"
            >
              <span>気分から本を探す</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* ─── 気分・ジャンルショートカット ──────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 py-12">
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

        {/* ─── サイトの説明 ──────────────────────────────────────── */}
        <section className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="text-lg font-bold text-stone-800 mb-4">
            Amazonとは違う、発見の体験を
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">
            Books Discover は、タイトルや著者名で検索するサイトではありません。<br />
            「今日はこんな気分」「こんな体験がしたい」という曖昧な感覚から、
            ぴったりの漫画・小説に出会えることを目指しています。
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-stone-400">
            <span>✓ 登録不要・完全無料</span>
            <span>✓ 漫画・小説どちらも対応</span>
            <span>✓ 気分・雰囲気タグで絞り込み</span>
            <span>✓ 作品単位 → 巻一覧で確認</span>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <Link
                href="/similar-books"
                className="group flex flex-col gap-2 bg-white border border-stone-200 hover:border-rose-300 hover:bg-rose-50 rounded-2xl p-4 transition-all hover:shadow-sm"
              >
                <span className="text-2xl" aria-hidden="true">🔍</span>
                <p className="text-sm font-bold text-stone-800 group-hover:text-rose-700 transition-colors leading-snug">類似書籍を探す</p>
                <p className="text-xs text-stone-500">1冊から似た本を見つける</p>
              </Link>
              <Link
                href="/tools/book-compare"
                className="group flex flex-col gap-2 bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 rounded-2xl p-4 transition-all hover:shadow-sm"
              >
                <span className="text-2xl" aria-hidden="true">⚖️</span>
                <p className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">書籍を比較して選ぶ</p>
                <p className="text-xs text-stone-500">条件を絞って次の1冊を決める</p>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── ブログ導線 ───────────────────────────────────────── */}
        <section className="bg-stone-50 border-t border-stone-200 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-lg font-bold text-stone-800 mb-2">読み物・ランキング</h2>
            <p className="text-stone-500 text-sm mb-6">
              「今週読みたい漫画」「泣ける作品特集」など、発見のヒントを記事でお届けします。
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 border border-stone-300 hover:border-rose-400 text-stone-700 hover:text-rose-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              ブログ記事を読む →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
