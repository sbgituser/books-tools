import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import Link from "next/link";
import type { ReactNode, ComponentPropsWithoutRef } from "react";
import { findBookByHeadingText } from "@/lib/blogBookLookup";

const prettyCodeOptions = {
  theme: "github-dark",
  keepBackground: false,
} as const;

function toPlainText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toPlainText).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return toPlainText(props?.children ?? "");
  }
  return "";
}

function BlogBookHeading(props: ComponentPropsWithoutRef<"h3">) {
  const headingText = toPlainText(props.children).trim();
  const book = headingText ? findBookByHeadingText(headingText) : null;

  return (
    <>
      <h3 {...props} />
      {book ? (
        <div className="my-3 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              {book.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.thumbnailUrl}
                  alt={`${book.title}のサムネイル`}
                  className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-md border border-stone-200 bg-white shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-md border border-stone-300 bg-stone-200 px-1 py-1.5 flex items-center justify-center text-center text-[10px] leading-tight text-stone-700 font-medium shrink-0 overflow-hidden">
                  <span className="line-clamp-4 break-words">{book.title}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-stone-500 mb-0.5">この作品を起点に比較</p>
                <p className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2">{book.title}</p>
                {book.authors && book.authors.length > 0 ? (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{book.authors.join(" / ")}</p>
                ) : null}
              </div>
            </div>
            <Link
              href={`/tools/book-compare?baseId=${encodeURIComponent(book.id)}`}
              className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
            >
              条件一致で本を探す
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}

export async function renderBlogMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: {
      h3: BlogBookHeading,
    },
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "append" }],
          [rehypePrettyCode, prettyCodeOptions],
        ],
      },
    },
  });

  return content;
}

