import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DISCOVER_MOODS } from "@/constants/discoverMoods";
import { SITE_URL } from "@/lib/site";

interface PickedWork {
  fileId: string;
  title: string;
  authorDisplay: string;
}

interface MoodSection {
  slug: string;
  label: string;
  icon: string;
  description: string;
  works: PickedWork[];
}

function getMoodSections(): MoodSection[] {
  try {
    const curatedDir = join(process.cwd(), "data", "discover-curated");
    if (!existsSync(curatedDir)) return [];
    return DISCOVER_MOODS.map((mood) => {
      const filePath = join(curatedDir, `${mood.slug}.json`);
      if (!existsSync(filePath)) return { slug: mood.slug, label: mood.label, icon: mood.icon, description: mood.description, works: [] };
      const data = JSON.parse(readFileSync(filePath, "utf-8"));
      const picks: PickedWork[] = [];
      for (const section of data.sections ?? []) {
        for (const item of section.items ?? []) {
          if (picks.length >= 12) break;
          const workPath = join(process.cwd(), "public", "data", "works", `${item.workId}.json`);
          if (!existsSync(workPath)) continue;
          const work = JSON.parse(readFileSync(workPath, "utf-8"));
          picks.push({ fileId: item.workId, title: work.title, authorDisplay: work.authorDisplay ?? work.author ?? "" });
        }
        if (picks.length >= 12) break;
      }
      return { slug: mood.slug, label: mood.label, icon: mood.icon, description: mood.description, works: picks };
    }).filter((m) => m.works.length > 0);
  } catch {
    return [];
  }
}

const canonical = `${SITE_URL}/discover/by-mood`;

export const metadata: Metadata = {
  title: "気分で選ぶ本・漫画ガイド | Books Tools",
  description: "泣きたい・笑いたい・熱くなりたい・ダークな世界を覗きたい…今の気分にぴったりの小説・漫画を見つけるガイドページです。",
  alternates: { canonical },
  openGraph: {
    title: "気分で選ぶ本・漫画ガイド | Books Tools",
    description: "今の気分にぴったりの小説・漫画を見つけるガイド。",
    url: canonical,
    type: "website",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

export default function ByMoodPage() {
  const moods = getMoodSections();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "気分から本を発見する", item: `${SITE_URL}/discover` },
      { "@type": "ListItem", position: 3, name: "気分で選ぶガイド", item: canonical },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "気分で選ぶ本・漫画ガイド",
    url: canonical,
    description: "今の気分にぴったりの小説・漫画を見つけるガイドページ。",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-xs text-stone-500 mb-4" aria-label="パンくず">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-amber-700">ホーム</Link></li>
            <li>/</li>
            <li><Link href="/discover" className="hover:text-amber-700">気分から発見</Link></li>
            <li>/</li>
            <li className="text-stone-700">気分で選ぶガイド</li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">気分で選ぶ本・漫画ガイド</h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            今の気分にぴったりの本を見つけましょう。泣きたい、笑いたい、熱くなりたい…
            気分別に厳選した小説・漫画をまとめています。
          </p>
        </div>

        {/* 気分カテゴリ一覧 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {DISCOVER_MOODS.map((mood) => (
            <a
              key={mood.slug}
              href={`#mood-${mood.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 rounded-xl transition-all text-center"
            >
              <span className="text-3xl" aria-hidden="true">{mood.icon}</span>
              <span className="text-sm font-bold text-stone-800">{mood.label}</span>
              <span className="text-xs text-stone-500 leading-snug">{mood.description}</span>
            </a>
          ))}
        </div>

        {/* 各気分セクション */}
        <div className="space-y-10">
          {moods.map((mood) => (
            <section key={mood.slug} id={`mood-${mood.slug}`} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900 mb-1">
                <span className="mr-1.5">{mood.icon}</span>
                {mood.label}
              </h2>
              <p className="text-sm text-stone-500 mb-4">{mood.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {mood.works.map((w) => (
                  <Link
                    key={w.fileId}
                    href={`/works/${w.fileId}`}
                    className="block p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-all"
                  >
                    <p className="text-xs font-bold text-stone-800 line-clamp-2 leading-snug">{w.title}</p>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-1">{w.authorDisplay}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-3">
                <Link
                  href={`/discover?mood=${mood.slug}`}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                >
                  「{mood.label}」の作品をもっと見る →
                </Link>
              </div>
            </section>
          ))}
        </div>

        {/* 関連ナビゲーション */}
        <div className="mt-10 grid sm:grid-cols-3 gap-3">
          <Link href="/discover/by-author" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-amber-400 rounded-xl p-4 transition-all text-center">
            <span className="text-2xl" aria-hidden="true">✏️</span>
            <span className="text-sm font-bold text-stone-800 group-hover:text-amber-700">著者別ガイド</span>
          </Link>
          <Link href="/discover/new-releases" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-violet-400 rounded-xl p-4 transition-all text-center">
            <span className="text-2xl" aria-hidden="true">🆕</span>
            <span className="text-sm font-bold text-stone-800 group-hover:text-violet-700">新着まとめ</span>
          </Link>
          <Link href="/blog" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-rose-400 rounded-xl p-4 transition-all text-center">
            <span className="text-2xl" aria-hidden="true">📝</span>
            <span className="text-sm font-bold text-stone-800 group-hover:text-rose-700">ブログ</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
