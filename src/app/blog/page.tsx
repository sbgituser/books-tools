import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllBlogMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: "ブログ",
  description: "Books Tools の更新情報・記事一覧",
};

export default function BlogIndexPage() {
  const posts = getAllBlogMeta();

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">ブログ</h1>
          <p className="text-stone-500 text-sm">更新情報・記事一覧</p>
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
                <p className="text-xs text-stone-400 mb-2">{post.date}</p>
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

