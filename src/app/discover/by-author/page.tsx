import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllBlogMeta } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

interface AuthorGroup {
  name: string;
  works: { fileId: string; title: string }[];
  blogPosts: { slug: string; title: string }[];
}

function getPopularAuthors(): AuthorGroup[] {
  try {
    const worksDir = join(process.cwd(), "public", "data", "works");
    if (!existsSync(worksDir)) return [];
    const files = readdirSync(worksDir).filter((f) => f.endsWith(".json"));

    // 著者別に作品を集約
    const authorMap = new Map<string, { fileId: string; title: string; volumeCount: number }[]>();
    for (const f of files) {
      const data = JSON.parse(readFileSync(join(worksDir, f), "utf-8"));
      const author = data.authorDisplay ?? data.author ?? "";
      if (!author || author.length < 2) continue;
      if (!authorMap.has(author)) authorMap.set(author, []);
      authorMap.get(author)!.push({
        fileId: f.replace(/\.json$/, ""),
        title: data.title,
        volumeCount: data.volumeCount ?? 1,
      });
    }

    // 作品数の多い著者を抽出（3作品以上）
    const popular = Array.from(authorMap.entries())
      .filter(([, works]) => works.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 30);

    // ブログ記事との紐付け
    const blogPosts = getAllBlogMeta();

    return popular.map(([name, works]) => {
      const nameParts = name.split(/[・\s]/).filter((p) => p.length >= 2);
      const relatedPosts = blogPosts.filter((post) =>
        nameParts.some((part) => post.tags.join(" ").includes(part) || post.title.includes(part))
      ).slice(0, 3);

      return {
        name,
        works: works.slice(0, 8).map(({ fileId, title }) => ({ fileId, title })),
        blogPosts: relatedPosts.map((p) => ({ slug: p.slug, title: p.title })),
      };
    });
  } catch {
    return [];
  }
}

const canonical = `${SITE_URL}/discover/by-author`;

export const metadata: Metadata = {
  title: "著者別おすすめガイド | Books Tools",
  description: "人気作家・著者別に作品とブログ記事をまとめたガイドページ。お気に入りの著者の作品を一覧で探せます。",
  alternates: { canonical },
  openGraph: {
    title: "著者別おすすめガイド | Books Tools",
    description: "人気作家・著者別に作品とブログ記事をまとめたガイド。",
    url: canonical,
    type: "website",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

export default function ByAuthorPage() {
  const authors = getPopularAuthors();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "気分から本を発見する", item: `${SITE_URL}/discover` },
      { "@type": "ListItem", position: 3, name: "著者別ガイド", item: canonical },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "著者別おすすめガイド",
    url: canonical,
    description: "人気作家・著者別に作品とブログ記事をまとめたガイドページ。",
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
            <li className="text-stone-700">著者別ガイド</li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">著者別おすすめガイド</h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            人気作家・著者ごとに作品と関連ブログ記事をまとめました。
            お気に入りの著者の全作品を一覧で確認できます。
          </p>
        </div>

        {authors.length === 0 ? (
          <p className="text-sm text-stone-500">著者データを読み込み中です...</p>
        ) : (
          <div className="space-y-6">
            {authors.map((author) => (
              <section key={author.name} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900 mb-3">
                  <span className="mr-1.5">✏️</span>
                  {author.name}
                  <span className="ml-2 text-xs font-normal text-stone-400">({author.works.length}作品)</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {author.works.map((w) => (
                    <Link
                      key={w.fileId}
                      href={`/works/${w.fileId}`}
                      className="block p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all"
                    >
                      <p className="text-xs font-bold text-stone-800 line-clamp-2 leading-snug">{w.title}</p>
                    </Link>
                  ))}
                </div>
                {author.blogPosts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <p className="text-xs font-bold text-stone-500 mb-2">関連ブログ記事</p>
                    <div className="flex flex-wrap gap-2">
                      {author.blogPosts.map((post) => (
                        <Link
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
                        >
                          {post.title.length > 30 ? `${post.title.slice(0, 30)}...` : post.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* 関連ナビゲーション */}
        <div className="mt-10 grid sm:grid-cols-3 gap-3">
          <Link href="/discover/by-mood" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-rose-400 rounded-xl p-4 transition-all text-center">
            <span className="text-2xl" aria-hidden="true">😢</span>
            <span className="text-sm font-bold text-stone-800 group-hover:text-rose-700">気分で選ぶガイド</span>
          </Link>
          <Link href="/discover/new-releases" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-violet-400 rounded-xl p-4 transition-all text-center">
            <span className="text-2xl" aria-hidden="true">🆕</span>
            <span className="text-sm font-bold text-stone-800 group-hover:text-violet-700">新着まとめ</span>
          </Link>
          <Link href="/blog" className="group flex flex-col items-center gap-2 bg-white border border-stone-200 hover:border-amber-400 rounded-xl p-4 transition-all text-center">
            <span className="text-2xl" aria-hidden="true">📝</span>
            <span className="text-sm font-bold text-stone-800 group-hover:text-amber-700">ブログ</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
