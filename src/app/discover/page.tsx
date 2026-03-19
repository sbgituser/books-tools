import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiscoverSection from "@/components/works/DiscoverSection";

export const metadata: Metadata = {
  title: "気分から本を発見する | Books Discover",
  description:
    "泣ける・ダーク・癒やし・一気読みなど、今の気分・雰囲気で漫画・小説を見つける発見サイト。タイトルが分からなくても、読みたい体験から逆引きできます。",
  openGraph: {
    title: "気分から本を発見する | Books Discover",
    description: "今の気分・雰囲気で漫画・小説を発見。タグを選ぶだけで次の一冊が見つかる。",
  },
};

export default function DiscoverPage() {
  return (
    <>
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

      </main>
      <Footer />
    </>
  );
}
