import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MoodPurposeSearchSection from "@/components/books/MoodPurposeSearchSection";
import { PRESET_SEARCHES } from "@/constants/bookTags";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "気分・目的から漫画を探す | Books Tools",
  description:
    "「泣ける」「頭を使う」「癒やされる」など、読みたい体験・気分から漫画を探せます。タイトルが思い浮かばなくても大丈夫。Amazonでは見つかりにくい切り口で漫画を発見。",
  alternates: { canonical: `${SITE_URL}/manga/mood` },
  openGraph: {
    title: "気分・目的から漫画を探す | Books Tools",
    description: "「今の気分」「読みたい体験」から漫画を探せる新しい検索体験。",
    url: `${SITE_URL}/manga/mood`,
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "気分・目的から漫画を探す",
  description: "「泣ける」「頭を使う」「癒やされる」など、読みたい体験・気分から漫画を発見できるページ。",
  url: `${SITE_URL}/manga/mood`,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Books Tools", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "気分・目的で探す", item: `${SITE_URL}/manga/mood` },
    ],
  },
};

export default function MangaMoodPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        {/* ヒーロー */}
        <section className="bg-gradient-to-br from-rose-900 via-stone-900 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-1 text-xs text-stone-400 mb-5" aria-label="パンくず">
              <Link href="/" className="hover:text-white transition-colors">Books Tools</Link>
              <span aria-hidden="true">›</span>
              <span className="text-stone-300">気分・目的で探す</span>
            </nav>

            <p className="text-rose-400 text-xs font-bold tracking-widest uppercase mb-3">
              Mood × Purpose Search
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              今の気分で、<br className="sm:hidden" />漫画を探す
            </h1>
            <p className="text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Amazonの検索では見つからない切り口で漫画を発見できます。
              「泣きたい」「頭を使いたい」「癒やされたい」…
              <strong className="text-white">読みたい体験から逆引き</strong>できます。
            </p>
          </div>
        </section>

        {/* プリセット一覧（よく使う気分タグへのショートカット） */}
        <section className="bg-stone-50 border-b border-stone-200 px-4 py-5">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">よく使われる気分タグ</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_SEARCHES.map(preset => (
                <a
                  key={preset.slug}
                  href={`/manga/by-mood/${preset.slug}`}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-rose-400 hover:text-rose-600 transition-colors font-medium"
                >
                  <span aria-hidden="true">{preset.icon}</span>
                  {preset.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* メイン検索セクション */}
        <section className="max-w-3xl mx-auto px-4 py-10">
          <MoodPurposeSearchSection />
        </section>

        {/* 補足テキスト */}
        <section className="max-w-2xl mx-auto px-4 pb-16 text-center">
          <p className="text-stone-400 text-sm leading-relaxed">
            ※ タグは主要漫画作品に対して付与しています。タグのない作品は表示されませんが、
            <Link href="/discover?type=manga" className="text-amber-600 hover:underline ml-1">気分で探す</Link>
            でも作品を探せます。
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
