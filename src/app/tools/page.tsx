import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `ツール一覧 | ${SITE_NAME}`,
  description:
    "Books Toolsのツール一覧。映像から原作を探す・テーマから本を探す・類似書籍探索・書籍比較など、Amazonにはない本の探し方を提供します。",
  alternates: { canonical: `${SITE_URL}/tools` },
};

const TOOLS = [
  {
    href: "/tools/book-quiz",
    icon: "🔮",
    label: "おすすめ本診断",
    description: "5つの質問に答えるだけで読書タイプを診断。あなたにぴったりのおすすめ本5冊を提案します。",
    badge: "NEW",
    badgeClass: "bg-rose-100 text-rose-700",
    cardClass: "hover:border-rose-300 hover:bg-rose-50",
  },
  {
    href: "/tools/media-originals",
    icon: "🎬",
    label: "映像から原作を探す",
    description: "映画・ドラマ・アニメから原作となった小説・漫画を逆引き検索できます。",
    badge: "NEW",
    badgeClass: "bg-indigo-100 text-indigo-700",
    cardClass: "hover:border-indigo-300 hover:bg-indigo-50",
  },
  {
    href: "/tools/trend-books",
    icon: "📰",
    label: "テーマから本を探す",
    description: "AI・経済・環境など今気になるテーマから、理解を深める本をレベル別に提案します。",
    badge: "NEW",
    badgeClass: "bg-teal-100 text-teal-700",
    cardClass: "hover:border-teal-300 hover:bg-teal-50",
  },
  {
    href: "/tools/literary-awards",
    icon: "🏆",
    label: "文学賞受賞作データベース",
    description: "直木賞・芥川賞・本屋大賞など10の主要文学賞の歴代受賞作を横断検索できます。",
    badge: "NEW",
    badgeClass: "bg-amber-100 text-amber-700",
    cardClass: "hover:border-amber-300 hover:bg-amber-50",
  },
  {
    href: "/tools/similar-books",
    icon: "📚",
    label: "似ている本を探す",
    description: "お気に入りの本に似た作品を見つけよう。389作品・属性ベースの類似度検索。",
    badge: "NEW",
    badgeClass: "bg-violet-100 text-violet-700",
    cardClass: "hover:border-violet-300 hover:bg-violet-50",
  },
  {
    href: "/tools/reading-time",
    icon: "⏱️",
    label: "読書時間計算ツール",
    description: "ページ数と本の種類を入力するだけで読了時間を自動計算。1日30分で何日かかるかも一目でわかります。",
    badge: "NEW",
    badgeClass: "bg-emerald-100 text-emerald-700",
    cardClass: "hover:border-emerald-300 hover:bg-emerald-50",
  },
  {
    href: "/tools/reading-order",
    icon: "📖",
    label: "シリーズ読む順番データベース",
    description: "人気シリーズの読む順番を一覧表示。小説・漫画50シリーズの刊行順・おすすめ順がすぐわかります。",
    badge: "NEW",
    badgeClass: "bg-amber-100 text-amber-700",
    cardClass: "hover:border-amber-300 hover:bg-amber-50",
  },
] as const;

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "ツール一覧", item: `${SITE_URL}/tools` },
  ],
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-br from-stone-900 to-stone-800 text-white py-10 sm:py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <nav aria-label="パンくず" className="text-xs text-stone-400 mb-4">
              <ol className="flex items-center gap-1.5">
                <li><Link href="/" className="hover:text-white transition-colors">ホーム</Link></li>
                <li>/</li>
                <li className="text-stone-300">ツール一覧</li>
              </ol>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">ツール一覧</h1>
            <p className="text-stone-300 text-sm sm:text-base">
              Amazonにはない「本の探し方」を提供するツール集です。
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-2 gap-4">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group flex flex-col gap-3 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${tool.cardClass}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl" aria-hidden="true">{tool.icon}</span>
                  {tool.badge && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tool.badgeClass}`}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900 mb-1">{tool.label}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{tool.description}</p>
                </div>
                <span className="text-xs font-semibold text-stone-400 group-hover:text-stone-600 transition-colors mt-auto">
                  使ってみる →
                </span>
              </Link>
            ))}
          </div>

          {/* クロスリンク: ジャンル・ブログ */}
          <div className="mt-10 grid sm:grid-cols-2 gap-3">
            <Link
              href="/genre"
              className="group flex items-center gap-3 bg-amber-50 border border-amber-200 hover:border-amber-400 rounded-xl px-5 py-4 transition-all"
            >
              <span className="text-2xl" aria-hidden="true">📂</span>
              <div>
                <p className="text-sm font-bold text-amber-800 group-hover:text-amber-900">ジャンルで本を探す</p>
                <p className="text-xs text-amber-600">ツールで見つかった本をジャンルで絞り込み</p>
              </div>
            </Link>
            <Link
              href="/blog"
              className="group flex items-center gap-3 bg-rose-50 border border-rose-200 hover:border-rose-400 rounded-xl px-5 py-4 transition-all"
            >
              <span className="text-2xl" aria-hidden="true">📝</span>
              <div>
                <p className="text-sm font-bold text-rose-800 group-hover:text-rose-900">おすすめ記事を読む</p>
                <p className="text-xs text-rose-600">ジャンル別おすすめ・読む順番ガイドなど</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
