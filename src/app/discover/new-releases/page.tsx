import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatDateLabel, getAllBlogMeta } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

interface RecentWork {
  fileId: string;
  title: string;
  authorDisplay: string;
  type: string;
  latestPublishedDate: string;
}

interface RecentBlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
}

function getRecentWorks(days: number = 30): RecentWork[] {
  try {
    const worksDir = join(process.cwd(), "public", "data", "works");
    if (!existsSync(worksDir)) return [];
    const files = readdirSync(worksDir).filter((f) => f.endsWith(".json"));
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const recent: (RecentWork & { sortDate: string })[] = [];
    for (const f of files) {
      const data = JSON.parse(readFileSync(join(worksDir, f), "utf-8"));
      const date = data.latestPublishedDate ?? data.firstPublishedDate ?? "";
      if (!date || date < cutoffStr) continue;
      recent.push({
        fileId: f.replace(/\.json$/, ""),
        title: data.title,
        authorDisplay: data.authorDisplay ?? data.author ?? "",
        type: data.type ?? "other",
        latestPublishedDate: date,
        sortDate: date,
      });
    }
    recent.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    return recent.slice(0, 60);
  } catch {
    return [];
  }
}

function getRecentBlogPosts(days: number = 30): RecentBlogPost[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return getAllBlogMeta()
    .filter((p) => (p.updated ?? p.date) >= cutoffStr)
    .slice(0, 20)
    .map((p) => ({ slug: p.slug, title: p.title, date: p.updated ?? p.date, description: p.description }));
}

const canonical = `${SITE_URL}/discover/new-releases`;

export const metadata: Metadata = {
  title: "新着作品・記事まとめ | Books Tools",
  description: "直近30日に追加・更新された小説・漫画の作品情報とブログ記事を時系列でまとめています。",
  alternates: { canonical },
  openGraph: {
    title: "新着作品・記事まとめ | Books Tools",
    description: "直近30日の新着作品・ブログ記事まとめ。",
    url: canonical,
    type: "website",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

export default function NewReleasesPage() {
  const recentWorks = getRecentWorks(30);
  const recentPosts = getRecentBlogPosts(30);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "気分から本を発見する", item: `${SITE_URL}/discover` },
      { "@type": "ListItem", position: 3, name: "新着まとめ", item: canonical },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "新着作品・記事まとめ",
    url: canonical,
    description: "直近30日に追加・更新された小説・漫画の作品情報とブログ記事を時系列でまとめています。",
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
            <li className="text-stone-700">新着まとめ</li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">新着作品・記事まとめ</h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            直近30日に追加・更新された作品情報とブログ記事を時系列でまとめています。
          </p>
        </div>

        {/* 新着ブログ記事 */}
        <section className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            <span className="mr-1.5">📝</span>新着・更新ブログ記事
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-stone-500">直近30日の新着記事はありません。</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all"
                >
                  <p className="text-xs text-stone-400 mb-1">{formatDateLabel(post.date)}</p>
                  <p className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug">{post.title}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{post.description}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 新着作品 */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            <span className="mr-1.5">📚</span>新着・更新作品
          </h2>
          {recentWorks.length === 0 ? (
            <p className="text-sm text-stone-500">直近30日の新着作品はありません。</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {recentWorks.map((w) => (
                <Link
                  key={w.fileId}
                  href={`/works/${w.fileId}`}
                  className="block p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all"
                >
                  <p className="text-[10px] text-stone-400 mb-1">
                    {formatDateLabel(w.latestPublishedDate)}
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">
                      {w.type === "manga" ? "漫画" : w.type === "novel" ? "小説" : "その他"}
                    </span>
                  </p>
                  <p className="text-xs font-bold text-stone-800 line-clamp-2 leading-snug">{w.title}</p>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-1">{w.authorDisplay}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 関連ナビゲーション */}
        <div className="mt-10 grid sm:grid-cols-3 gap-3">
          <Link href="/discover/by-mood" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-rose-400 rounded-xl p-4 transition-all text-center">
            <span className="text-2xl" aria-hidden="true">😢</span>
            <span className="text-sm font-bold text-stone-800 group-hover:text-rose-700">気分で選ぶガイド</span>
          </Link>
          <Link href="/discover/by-author" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-amber-400 rounded-xl p-4 transition-all text-center">
            <span className="text-2xl" aria-hidden="true">✏️</span>
            <span className="text-sm font-bold text-stone-800 group-hover:text-amber-700">著者別ガイド</span>
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
