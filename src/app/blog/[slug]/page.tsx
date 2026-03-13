import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { renderBlogMdx } from "@/lib/mdx";
import {
  formatDateLabel,
  getAdjacentPosts,
  getAllBlogSlugs,
  getBlogCanonical,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import { SITE_NAME, TOOL_LINKS } from "@/lib/site";

type Params = { slug: string };

function normalizeBlogSlug(slug: string): string {
  return slug.replace(/recmmendations/g, "recommendations");
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = normalizeBlogSlug(slug);
  const post = await getBlogPostBySlug(normalizedSlug);
  if (!post) return { title: "記事が見つかりません" };

  const canonical = getBlogCanonical(post.slug);
  return {
    title: `${post.title} | ブログ`,
    description: post.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description: post.description,
      url: canonical,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${SITE_NAME}`,
      description: post.description,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const normalizedSlug = normalizeBlogSlug(slug);
  if (normalizedSlug !== slug) {
    redirect(`/blog/${normalizedSlug}`);
  }

  const post = await getBlogPostBySlug(normalizedSlug);

  if (!post) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug, 3);
  const content = await renderBlogMdx(post.content);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: getBlogCanonical(post.slug),
    keywords: post.tags.join(","),
    publisher: {
      "@type": "Organization",
      name: "Books Tools",
      url: "https://books.kuras-plus.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <nav className="text-xs text-stone-500 mb-4" aria-label="パンくず">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-amber-700">ホーム</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-amber-700">ブログ</Link>
            </li>
            <li>/</li>
            <li className="text-stone-700">{post.title}</li>
          </ol>
        </nav>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mb-2">
            <time dateTime={post.date}>公開: {formatDateLabel(post.date)}</time>
            {post.updated ? <span>更新: {formatDateLabel(post.updated)}</span> : null}
            <span>読了目安: {post.readingText}</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3 leading-tight">{post.title}</h1>
          <p className="text-sm text-stone-500 mb-4">{post.description}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">
                #{tag}
              </span>
            ))}
          </div>

          {post.toc.length > 0 ? (
            <aside className="mb-8 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-semibold text-stone-800 mb-2">目次</p>
              <ul className="space-y-1">
                {post.toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                    <a href={`#${item.id}`} className="text-sm text-stone-600 hover:text-amber-700">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <article className="blog-content">
            {content}
          </article>

          <section className="mt-10 pt-8 border-t border-stone-200">
            <h2 className="text-lg font-bold text-stone-900 mb-3">関連ツール</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {TOOL_LINKS.filter((x) => x.href !== "/blog").map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 hover:bg-amber-100"
                >
                  <p className="font-semibold text-amber-900 text-sm">{tool.title}</p>
                  <p className="text-xs text-amber-800 mt-1">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 pt-8 border-t border-stone-200 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-500 mb-1">前の記事</p>
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className="text-sm font-semibold text-stone-800 hover:text-amber-700">
                  {prev.title}
                </Link>
              ) : (
                <p className="text-sm text-stone-400">なし</p>
              )}
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">次の記事</p>
              {next ? (
                <Link href={`/blog/${next.slug}`} className="text-sm font-semibold text-stone-800 hover:text-amber-700">
                  {next.title}
                </Link>
              ) : (
                <p className="text-sm text-stone-400">なし</p>
              )}
            </div>
          </section>

          {related.length > 0 ? (
            <section className="mt-10 pt-8 border-t border-stone-200">
              <h2 className="text-lg font-bold text-stone-900 mb-3">関連記事</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="rounded-lg border border-stone-200 p-3 hover:border-amber-300"
                  >
                    <p className="text-xs text-stone-500">{formatDateLabel(item.date)}</p>
                    <p className="text-sm font-semibold text-stone-800 mt-1">{item.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}

