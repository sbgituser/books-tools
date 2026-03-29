import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import Link from "next/link";
import type { ReactNode, ComponentPropsWithoutRef } from "react";
import { findBookByHeadingText } from "@/lib/blogBookLookup";
import BlogBookInlineCard from "@/components/BlogBookInlineCard";
import BlogFAQ from "@/components/blog/BlogFAQ";
import BlogCTA from "@/components/blog/BlogCTA";
import BlogQuickPick from "@/components/blog/BlogQuickPick";
import BlogRelatedArticles from "@/components/blog/BlogRelatedArticles";

type BlogBookCardProps = {
  id: string;
  title: string;
  author?: string;
  thumbnailUrl?: string;
  isbn13?: string;
  googleBooksId?: string;
};

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

function BlogBookCard(props: BlogBookCardProps) {
  const authors = props.author ? [props.author] : [];

  return (
    <BlogBookInlineCard
      book={{
        id: props.id,
        title: props.title,
        authors,
        thumbnailUrl: props.thumbnailUrl,
        isbn13: props.isbn13,
        sourceIds: props.googleBooksId ? { googleBooksId: props.googleBooksId } : undefined,
      }}
    />
  );
}

/**
 * MDX ソースから <BlogFAQ items={[...]} /> のアイテム配列を事前抽出する。
 * next-mdx-remote v6 (MDX v3) では JSX 属性内のオブジェクト配列リテラルが
 * 正しく評価されないため、正規表現で抽出しクロージャ経由でコンポーネントに渡す。
 *
 * `q`/`a` キーと `question`/`answer` キーの両方に対応する。
 */
function extractFaqItems(source: string): Array<{ q: string; a: string }> {
  const match = source.match(/<BlogFAQ\s+items=\{\s*(\[[\s\S]*?\])\s*\}\s*\/?>/);
  if (!match) return [];
  try {
    // eslint-disable-next-line no-new-func
    const raw = new Function(`return ${match[1]}`)() as Array<
      { q?: string; a?: string; question?: string; answer?: string }
    >;
    // question/answer キーを q/a へ正規化
    return raw.map((item) => ({
      q: item.q ?? item.question ?? "",
      a: item.a ?? item.answer ?? "",
    }));
  } catch {
    return [];
  }
}

export async function renderBlogMdx(source: string) {
  // 1. MDX ソースから FAQ アイテムを事前抽出
  const faqItems = extractFaqItems(source);

  // 2. MDX 内の <BlogFAQ items={[...]} /> をプロップなしの <BlogFAQ /> に置換
  //    （MDX v3 がオブジェクト配列式を評価できない問題を回避）
  const cleanedSource = source.replace(
    /<BlogFAQ\s+items=\{\s*\[[\s\S]*?\]\s*\}\s*\/>/g,
    "<BlogFAQ />",
  );

  // 3. クロージャで事前抽出したアイテムを渡すラッパーコンポーネント
  function BlogFAQBound() {
    return <BlogFAQ items={faqItems} />;
  }

  // ブログ記事ページでは <h1>{post.title}</h1> がすでに存在するため、
  // MDX コンテンツ内の # 見出し（h1）は非表示にして H1 の重複を防ぐ。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function BlogH1(_props: ComponentPropsWithoutRef<"h1">) {
    return null;
  }

  const { content } = await compileMDX({
    source: cleanedSource,
    components: {
      h1: BlogH1,
      h3: BlogBookHeading,
      BlogBookCard,
      BlogFAQ: BlogFAQBound,
      BlogCTA,
      BlogQuickPick,
      BlogRelatedArticles,
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

