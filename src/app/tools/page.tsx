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
        </section>
      </main>
      <Footer />
    </>
  );
}
