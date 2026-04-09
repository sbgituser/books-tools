import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiscoverSection from "@/components/works/DiscoverSection";
import { DISCOVER_MOODS } from "@/constants/discoverMoods";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "気分から本を発見する | Books Discover",
  description:
    "泣ける・ダーク・癒やし・一気読みなど、今の気分・雰囲気で漫画・小説を見つける発見サイト。タイトルが分からなくても、読みたい体験から逆引きできます。",
  alternates: { canonical: `${SITE_URL}/discover` },
  openGraph: {
    title: "気分から本を発見する | Books Discover",
    description: "今の気分・雰囲気で漫画・小説を発見。タグを選ぶだけで次の一冊が見つかる。",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "気分から本を発見する", item: `${SITE_URL}/discover` },
  ],
};

export default function DiscoverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-stone-50">

        {/* ヒーロー */}
        <section className="bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 text-white py-14 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-rose-400 text-xs font-bold tracking-widest uppercase mb-4">
              Books Discover · kuras-plus
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              今の気分で、<br />
              <span className="text-rose-400">次の一冊</span>を見つける。
            </h1>
            <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              タイトルが分からなくても大丈夫。
              「泣きたい」「一気読みしたい」「ダークな話が読みたい」——
              <br className="hidden sm:block" />
              読みたい<strong className="text-white">体験</strong>から、漫画・小説を逆引きします。
            </p>
          </div>
        </section>

        {/* 発見セクション */}
        <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
          <DiscoverSection />
        </section>

        {/* 気分カテゴリー（サーバーサイドレンダリング、SEO用） */}
        <section className="border-t border-stone-200 bg-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
              気分・雰囲気で探す
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DISCOVER_MOODS.map((mood) => (
                <Link
                  key={mood.slug}
                  href={`/discover?mood=${mood.slug}`}
                  className="flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-rose-50 border border-stone-200 hover:border-rose-300 rounded-xl transition-all text-center"
                >
                  <span className="text-3xl" aria-hidden="true">{mood.icon}</span>
                  <span className="text-sm font-bold text-stone-800">{mood.label}</span>
                  <span className="text-xs text-stone-500 leading-snug">{mood.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* もっと探す & おすすめ本診断CTA */}
        <section className="border-t border-stone-200 bg-stone-50 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
              もっと探す
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Link href="/scene" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-violet-400 rounded-xl p-4 transition-all text-center">
                <span className="text-2xl" aria-hidden="true">🎬</span>
                <span className="text-sm font-bold text-stone-800 group-hover:text-violet-700">シーンで探す</span>
              </Link>
              <Link href="/genre" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-amber-400 rounded-xl p-4 transition-all text-center">
                <span className="text-2xl" aria-hidden="true">📂</span>
                <span className="text-sm font-bold text-stone-800 group-hover:text-amber-700">ジャンルで探す</span>
              </Link>
              <Link href="/tools" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-indigo-400 rounded-xl p-4 transition-all text-center">
                <span className="text-2xl" aria-hidden="true">🛠️</span>
                <span className="text-sm font-bold text-stone-800 group-hover:text-indigo-700">ツールで探す</span>
              </Link>
              <Link href="/blog" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-rose-400 rounded-xl p-4 transition-all text-center">
                <span className="text-2xl" aria-hidden="true">📝</span>
                <span className="text-sm font-bold text-stone-800 group-hover:text-rose-700">ブログを読む</span>
              </Link>
            </div>
            <Link
              href="/tools/book-quiz"
              className="group flex items-center gap-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl px-6 py-4 hover:shadow-lg transition-all"
            >
              <span className="text-3xl" aria-hidden="true">🔮</span>
              <div className="flex-1">
                <p className="font-bold text-sm">おすすめ本診断</p>
                <p className="text-rose-100 text-xs">5つの質問に答えるだけで、あなたにぴったりの本を提案します</p>
              </div>
              <span className="font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
