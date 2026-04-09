import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatDateLabel, getAllBlogMeta, getBlogCanonical } from "@/lib/blog";
import { BLOG_DESCRIPTION, SITE_NAME, TOOL_LINKS } from "@/lib/site";
import BlogIndexClient from "@/components/blog/BlogIndexClient";

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
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Books Tools Blog",
    url: getBlogCanonical(),
    description: BLOG_DESCRIPTION,
    hasPart: posts.slice(0, 20).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: getBlogCanonical(post.slug),
      datePublished: post.date,
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

        <BlogIndexClient posts={posts} />

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

