import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/blog";

type Params = { slug: string };

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "記事が見つかりません" };
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-stone-900">記事が見つかりません</h1>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <p className="text-xs text-stone-400 mb-2">{post.date}</p>
          <h1 className="text-3xl font-bold text-stone-900 mb-3 leading-tight">{post.title}</h1>
          <p className="text-sm text-stone-500 mb-8">{post.description}</p>

          <article className="blog-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {post.content}
            </ReactMarkdown>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

