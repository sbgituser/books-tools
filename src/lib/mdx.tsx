import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import Link from "next/link";
import type { ReactNode, ComponentPropsWithoutRef } from "react";
import { findBookByHeadingText } from "@/lib/blogBookLookup";
import BlogBookInlineCard from "@/components/BlogBookInlineCard";

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
        <BlogBookInlineCard book={book} />
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

