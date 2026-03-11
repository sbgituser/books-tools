import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatDateLabel, getAllBlogMeta, getBlogCanonical } from "@/lib/blog";
import { BLOG_DESCRIPTION, SITE_NAME, TOOL_LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "ブログ",
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: getBlogCanonical(),
  },
  openGraph: {
    title: `ブログ | ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
    url: getBlogCanonical(),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `ブログ | ${SITE_NAME}`,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">ブログ</h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            本選び・読書術・比較ノウハウを発信するBooks Tools公式ブログです。記事からそのままツールへ移動して、
            実際の書籍探索や比較に活用できます。
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

        {posts.length === 0 ? (
          <div className="border border-dashed border-stone-300 rounded-xl p-6 text-sm text-stone-500">
            まだ記事がありません。
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border border-stone-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
                  <time dateTime={post.date}>{formatDateLabel(post.date)}</time>
                  <span>・</span>
                  <span>読了目安 {post.readingText}</span>
                </div>
                <h2 className="text-lg font-bold text-stone-900 mb-3 leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:text-amber-700">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-stone-600 mb-4 line-clamp-2">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

