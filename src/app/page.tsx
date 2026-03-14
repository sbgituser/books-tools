import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Books Tools | カテゴリと類似度で本を探す",
  description:
    "ジャンルを絞り込んで書籍を探し、気になる本から類似本を発見できる無料ツール集。Amazonでは体験できない横断的な本の探し方を提供します。登録不要・完全無料。",
  openGraph: {
    title: "Books Tools | カテゴリと類似度で本を探す",
    description:
      "カテゴリ絞り込み＋類似本発見で、読みたい本が見つかる無料ツール集。",
  },
};

const tools = [
  {
    href: "/similar-books",
    icon: "📚",
    label: "Browse",
    title: "書籍ブラウザ",
    description:
      "カテゴリを絞り込んで書籍を探し、気になる本をクリックすると類似した本が一覧表示されます。ジャンル・著者・キーワードをもとに類似度を自動判定。",
    badge: "無料",
    status: "利用可能",
  },
  {
    href: "/tools/book-compare",
    icon: "⚖️",
    label: "Match",
    title: "条件一致で本を探す",
    description:
      "起点となる1冊を選び、著者・出版年・ページ数・読書時間・カテゴリ・共通キーワードの条件に合う本を自動抽出。次に読む本の候補探しを支援します。",
    badge: "無料",
    status: "利用可能",
  },
  {
    href: "/tools/adaptation-originals",
    icon: "🎬",
    label: "Adaptations",
    title: "映像化作品 原作検索ツール",
    description:
      "年・期・メディア種別で映像化作品を絞り込み、原作が漫画/小説の作品は書籍カードで確認。条件一致の書籍検索へすぐ遷移できます。",
    badge: "無料",
    status: "利用可能",
  },
  {
    href: "/blog",
    icon: "📝",
    label: "Blog",
    title: "ブログ",
    description:
      "Books Tools の更新情報や、本選び・読書体験に関する記事を掲載します。",
    badge: "無料",
    status: "利用可能",
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
            <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              カテゴリを絞り込んで書籍を探し、気になる本から類似作品を発見。
              Amazonの検索では見つかりにくい本との出会いを提供します。
            </p>
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
            Books Toolsは、Kindle本をカテゴリと類似度で横断的に探索できるツール集です。
            ジャンルを絞り込んで書籍を探し、気になった本から類似作品を芋づる式に発見できます。
            登録不要・完全無料・ブラウザだけで動作します。
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
