import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatDateLabel, getAllBlogMeta, getBlogCanonical } from "@/lib/blog";
import type { BlogMeta } from "@/lib/blog";
import { BLOG_DESCRIPTION, SITE_NAME, TOOL_LINKS } from "@/lib/site";
import BlogIndexClient from "@/components/blog/BlogIndexClient";

interface FeaturedWork {
  fileId: string;
  title: string;
  authorDisplay: string;
}

function getFeaturedWorks(): FeaturedWork[] {
  try {
    const dir = join(process.cwd(), "public", "data", "works");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const candidates: Array<FeaturedWork & { score: number }> = [];
    for (const f of files) {
      const data = JSON.parse(readFileSync(join(dir, f), "utf-8"));
      const hasSummary = Boolean((data.summaryShort ?? "").trim());
      const hasTags = (data.discoveryTags?.length ?? 0) > 0;
      if (!hasSummary) continue;
      const score = (data.summaryShort?.length ?? 0) + (data.discoveryTags?.length ?? 0) * 20 + (data.volumeCount ?? 1) * 2;
      candidates.push({ fileId: f.replace(/\.json$/, ""), title: data.title, authorDisplay: data.authorDisplay ?? data.author ?? "", score });
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, 48);
  } catch {
    return [];
  }
}

// カテゴリ定義（SSRセクション用）
const BLOG_CATEGORIES = [
  { id: "mystery", label: "ミステリー・推理", icon: "🔍", tags: ["ミステリー", "日本ミステリー", "本格ミステリー", "ミステリー小説", "推理小説", "推理", "社会派ミステリー", "海外ミステリー", "どんでん返し", "サスペンス"] },
  { id: "sf-fantasy", label: "SF・ファンタジー", icon: "🚀", tags: ["SF小説", "海外SF", "SF", "ファンタジー", "ファンタジー小説", "異世界小説", "ダークファンタジー"] },
  { id: "manga", label: "漫画", icon: "🎨", tags: ["漫画", "おすすめ漫画", "少年漫画", "泣ける漫画", "恋愛漫画", "ファンタジー漫画", "バトル漫画", "青年漫画", "少女漫画"] },
  { id: "novel", label: "小説・文学", icon: "📖", tags: ["おすすめ小説", "小説", "日本文学", "文学", "恋愛", "青春小説", "歴史小説", "時代小説", "ホラー小説"] },
  { id: "guide", label: "読書ガイド・入門", icon: "📚", tags: ["初心者向け", "読書初心者", "読書", "読む順番", "読書術", "本選び", "ガイド", "ジャンル別"] },
  { id: "author", label: "著者別", icon: "✏️", tags: ["作家別ガイド", "著者別"] },
  { id: "scene", label: "シーン別", icon: "🎬", tags: ["通勤読書", "寝る前", "休日", "旅行", "カフェ読書"] },
  { id: "trend", label: "トレンド", icon: "🔥", tags: ["話題作", "新刊", "ベストセラー", "映像化", "本屋大賞"] },
] as const;

function getCategorizedPosts(posts: BlogMeta[]) {
  return BLOG_CATEGORIES.map((cat) => {
    const catPosts = posts.filter((p) => p.tags.some((tag) => (cat.tags as readonly string[]).includes(tag)));
    return { ...cat, posts: catPosts.slice(0, 10), total: catPosts.length };
  }).filter((c) => c.posts.length > 0);
}

function getLatestDate(posts: BlogMeta[]): string {
  if (posts.length === 0) return new Date().toISOString().substring(0, 10);
  return (posts[0].updated ?? posts[0].date).substring(0, 10);
}

export const metadata: Metadata = {
  title: "読書ブログ｜小説・漫画のおすすめ＆読書ガイド",
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: getBlogCanonical(),
  },
  openGraph: {
    title: `読書ブログ｜小説・漫画のおすすめ＆読書ガイド | ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
    url: getBlogCanonical(),
    type: "website",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `読書ブログ｜小説・漫画のおすすめ＆読書ガイド | ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogMeta();
  const categorized = getCategorizedPosts(posts);
  const latestDate = getLatestDate(posts);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "読書ブログ｜小説・漫画のおすすめ＆読書ガイド",
    url: getBlogCanonical(),
    description: BLOG_DESCRIPTION,
    numberOfItems: posts.length,
    dateModified: latestDate,
    hasPart: categorized.map((cat) => ({
      "@type": "ItemList",
      name: cat.label,
      numberOfItems: cat.total,
      itemListElement: cat.posts.slice(0, 5).map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "BlogPosting",
          headline: post.title,
          url: getBlogCanonical(post.slug),
          datePublished: post.date,
        },
      })),
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Books Tools", item: "https://books.kuras-plus.com" },
      { "@type": "ListItem", position: 2, name: "読書ブログ", item: getBlogCanonical() },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            読書ブログ｜小説・漫画のおすすめ＆読書ガイド
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            ミステリー・SF・ファンタジーなどジャンル別のおすすめ作品、人気作家の読む順番ガイド、初心者向けの読書入門まで。
            気になるカテゴリからお好みの記事を探せます。
          </p>
          <p className="text-xs text-stone-400 mt-2">
            全 {posts.length} 記事 ・ 最終更新 {formatDateLabel(latestDate)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOOL_LINKS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              >
                {tool.title}
              </Link>
            ))}
          </div>
        </div>

        {/* カテゴリジャンプナビ */}
        {categorized.length > 0 && (
          <nav className="mb-8 overflow-x-auto -mx-4 px-4" aria-label="カテゴリナビゲーション">
            <div className="flex gap-2 min-w-max">
              {categorized.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50 transition-colors whitespace-nowrap shadow-sm"
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                  <span className="text-stone-400">({cat.total})</span>
                </a>
              ))}
            </div>
          </nav>
        )}

        <BlogIndexClient posts={posts} />

        {/* カテゴリ別記事セクション（SSR: クローラー向け内部リンク） */}
        {categorized.length > 0 && (
          <section className="mt-10 space-y-8">
            <h2 className="text-xl font-bold text-stone-900">カテゴリ別の記事</h2>
            {categorized.map((cat) => (
              <div key={cat.id} id={`cat-${cat.id}`} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm scroll-mt-20">
                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  <span className="mr-1.5">{cat.icon}</span>
                  {cat.label}
                </h3>
                <p className="text-xs text-stone-400 mb-4">{cat.total} 件の記事</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {cat.posts.map((post) => (
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
                {cat.total > 10 && (
                  <p className="mt-3 text-xs text-stone-500">
                    他 {cat.total - 10} 件の記事があります
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* 人気の作品（SSR: クローラー向け内部リンク） */}
        {(() => {
          const featured = getFeaturedWorks();
          if (featured.length === 0) return null;
          return (
            <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900 mb-4">ブログで紹介している人気作品</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {featured.map((w) => (
                  <Link
                    key={w.fileId}
                    href={`/works/${w.fileId}`}
                    className="block p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all"
                  >
                    <p className="text-xs font-bold text-stone-800 line-clamp-2 leading-snug">{w.title}</p>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-1">{w.authorDisplay}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ツールで本を探す CTAバナー */}
        <div className="mt-10 grid sm:grid-cols-2 gap-3">
          <Link
            href="/tools/book-quiz"
            className="group flex items-center gap-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl px-5 py-4 hover:shadow-lg transition-all"
          >
            <span className="text-3xl" aria-hidden="true">🔮</span>
            <div className="flex-1">
              <p className="font-bold text-sm">おすすめ本診断ツール</p>
              <p className="text-rose-100 text-xs">5つの質問であなたにぴったりの本を提案</p>
            </div>
            <span className="font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            href="/discover"
            className="group flex items-center gap-4 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl px-5 py-4 hover:shadow-lg transition-all"
          >
            <span className="text-3xl" aria-hidden="true">💡</span>
            <div className="flex-1">
              <p className="font-bold text-sm">気分から本を探す</p>
              <p className="text-violet-100 text-xs">泣ける・熱い・ダーク等の雰囲気で発見</p>
            </div>
            <span className="font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
