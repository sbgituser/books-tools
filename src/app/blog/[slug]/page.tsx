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
import { resolveBlogSeo } from "@/lib/seoPolicy";
import ShareButtons from "@/components/ShareButtons";

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

  // SEO 方針を seoPolicy で一元決定（protected は必ず index・自己参照canonical）
  const seo = resolveBlogSeo({
    slug: post.slug,
    seoStatus: post.seoStatus,
    canonicalSlug: post.canonicalSlug,
    redirectTo: post.redirectTo,
  });
  const canonical = getBlogCanonical(seo.canonicalSlug);

  const description = post.description && post.description.length >= 80
    ? post.description
    : post.description
    ? `${post.description}詳しい解説・選び方のポイントを作品データと選定基準にもとづいて紹介します。`
    : `${post.title}。作品データ・ジャンル・読書体験タグをもとに選定した情報を詳しく解説します。`;

  const ogDisplayTitle = post.ogTitle ?? post.title;

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical,
    },
    robots: seo.robots,
    openGraph: {
      title: `${ogDisplayTitle} | ${SITE_NAME}`,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
      images: post.coverImage
        ? [post.coverImage]
        : [{ url: `/ogp/blog/${normalizedSlug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${ogDisplayTitle} | ${SITE_NAME}`,
      description,
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
  const ogpImage = post.coverImage
    ? post.coverImage
    : `https://books.kuras-plus.com/ogp/blog/${normalizedSlug}.png`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: ogpImage,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: getBlogCanonical(post.slug),
    keywords: post.tags.join(","),
    author: {
      "@type": "Person",
      name: "Books Tools 編集部",
      url: "https://books.kuras-plus.com/about",
      jobTitle: "編集部",
    },
    publisher: {
      "@type": "Organization",
      name: "Books Tools",
      url: "https://books.kuras-plus.com",
      logo: {
        "@type": "ImageObject",
        url: "https://books.kuras-plus.com/ogp/default-ogp.png",
      },
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Books Tools", item: "https://books.kuras-plus.com" },
      { "@type": "ListItem", position: 2, name: "ブログ", item: "https://books.kuras-plus.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: getBlogCanonical(post.slug) },
    ],
  };

  // ItemList JSON-LD: ランキング型記事（〇選）で『タイトル』パターンのh3見出しからリスト生成
  const listItems = post.toc
    .filter((item) => item.level === 3 && /^『.+』/.test(item.text))
    .map((item, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: item.text.replace(/^『(.+?)』.*$/, "$1"),
    }));
  const itemListJsonLd = listItems.length >= 3 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: post.title,
    numberOfItems: listItems.length,
    itemListElement: listItems,
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
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
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mb-8">
            <ShareButtons url={getBlogCanonical(post.slug)} text={post.title} />
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

          <div className="mt-8 flex justify-end">
            <ShareButtons url={getBlogCanonical(post.slug)} text={post.title} />
          </div>

          <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <h3 className="text-sm font-semibold text-stone-600 mb-2">この記事の選定方針について</h3>
            <p className="text-sm text-stone-700">
              当サイトでは、作品データ・ジャンル・読書体験タグ・関連作品との比較をもとに記事を構成しています。
              選定基準は、読みやすさ、完結状況、ジャンル適合度、読後感、初心者向け度です。
              外部評価や受賞歴は、確認できる範囲で参考情報として扱います。
            </p>
          </div>

          {/* おすすめ本診断 CTA */}
          <section className="mt-10 pt-8 border-t border-stone-200">
            <Link
              href="/tools/book-quiz"
              className="group flex items-center gap-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl px-5 py-4 hover:shadow-lg transition-all"
            >
              <span className="text-3xl" aria-hidden="true">🔮</span>
              <div className="flex-1">
                <p className="font-bold text-sm">おすすめ本診断ツールで自分に合う本を見つける</p>
                <p className="text-rose-100 text-xs">5つの質問に答えるだけで、あなたにぴったりの本を提案します</p>
              </div>
              <span className="font-bold text-sm group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </section>

          {/* おすすめカテゴリ */}
          <section className="mt-6">
            <p className="text-xs font-bold text-stone-500 mb-2">おすすめカテゴリ</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { id: "fantasy", label: "ファンタジー" },
                { id: "mystery", label: "ミステリー" },
                { id: "sf", label: "SF" },
                { id: "romance", label: "恋愛" },
                { id: "shonen", label: "少年漫画" },
                { id: "seinen", label: "青年漫画" },
              ].map((g) => (
                <Link
                  key={g.id}
                  href={`/genre/${g.id}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  {g.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/discover/by-mood" className="text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors">
                気分で選ぶガイド
              </Link>
              <Link href="/discover/by-author" className="text-xs px-3 py-1.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100 transition-colors">
                著者別ガイド
              </Link>
              <Link href="/discover/new-releases" className="text-xs px-3 py-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors">
                新着まとめ
              </Link>
            </div>
          </section>

          <section className="mt-8 pt-8 border-t border-stone-200">
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

