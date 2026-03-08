import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Books Tools | Kindle本を感覚的に探索",
  description:
    "Kindle本を感覚的に探索できる無料ツール集。類似本検索・比較など、Amazonでは体験できない本の探し方を提供します。登録不要・完全無料。",
  openGraph: {
    title: "Books Tools | Kindle本を感覚的に探索",
    description:
      "類似本検索など、Kindle本を感覚的に探索するための無料ツール集。",
  },
};

const tools = [
  {
    href: "/similar-books",
    icon: "🔍",
    label: "Search",
    title: "類似本検索",
    description:
      "本のタイトルやキーワードを入力するだけで、似た本を一覧表示。タイトル・著者・カテゴリ・キーワードから類似度を自動判定。Amazonでは体験できない横断的な探索ができます。",
    badge: "無料",
    status: "利用可能",
  },
  {
    href: "#",
    icon: "⚖️",
    label: "Compare",
    title: "本の比較ツール",
    description:
      "複数の本をサイドバイサイドで比較。価格・評価・内容の違いを一目で把握して購入判断をサポートします。",
    badge: "近日公開",
    status: "開発予定",
  },
  {
    href: "#",
    icon: "🗺️",
    label: "Explore",
    title: "ジャンルマップ",
    description:
      "ジャンル・テーマの繋がりを視覚的に表示。気になる本の「隣の棚」を地図感覚で探索できます。",
    badge: "近日公開",
    status: "開発予定",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Books Tools",
  url: "https://books.kuras-plus.com",
  description: "Kindle本を感覚的に探索するためのツール集",
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
        {/* Hero */}
        <section className="bg-stone-900 text-white py-16 sm:py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">
              Books Tools · kuras-plus
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              Kindle本を、<br />
              もっと感覚的に。
            </h1>
            <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
              Amazonの検索では見つかりにくい本を、
              テーマ・類似度・タグで横断的に探索。
              本選びの新しい体験を提供します。
            </p>
            <Link
              href="/similar-books"
              className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg"
            >
              類似本を探してみる →
            </Link>
          </div>
        </section>

        {/* Tools */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-xl font-bold text-stone-800 mb-2">ツール一覧</h2>
          <p className="text-stone-500 text-sm mb-8">
            すべて無料・登録不要でご利用いただけます
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const isAvailable = tool.status === "利用可能";
              const Card = (
                <div
                  className={`bg-white border rounded-2xl p-6 flex flex-col gap-3 transition-all ${
                    isAvailable
                      ? "border-stone-200 hover:border-amber-400 hover:shadow-md cursor-pointer"
                      : "border-stone-200 opacity-60 cursor-default"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{tool.icon}</span>
                    <div className="flex gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          tool.badge === "無料"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {tool.badge}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                      {tool.label}
                    </p>
                    <h3 className="text-lg font-bold text-stone-900 mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  {isAvailable && (
                    <span className="text-amber-700 text-sm font-semibold mt-auto">
                      使ってみる →
                    </span>
                  )}
                </div>
              );

              return isAvailable ? (
                <Link key={tool.href} href={tool.href} className="block">
                  {Card}
                </Link>
              ) : (
                <div key={tool.title}>{Card}</div>
              );
            })}
          </div>
        </section>

        {/* About */}
        <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <h2 className="text-lg font-bold text-stone-800 mb-3">
            このサイトについて
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            Books Toolsは、Kindle本をより感覚的に・直感的に探索できるようにするためのツール集です。
            Amazonの検索では「似た本を比べたい」「テーマで横断的に探したい」というニーズに応えにくいという課題を解決します。
            登録不要・完全無料・ブラウザだけで動作します。
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
