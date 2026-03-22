/**
 * BlogRelatedArticles.tsx
 *
 * 記事内の文脈つき関連記事導線コンポーネント。
 * カテゴリラベル付きでリンクを整理表示する。
 *
 * 使い方（MDX内）:
 *   <BlogRelatedArticles groups={[
 *     {
 *       label: "社会派ミステリーを広げたい人向け",
 *       links: [
 *         { href: "/blog/social-mystery-recommendations", title: "社会派ミステリーおすすめ15選" },
 *       ],
 *     },
 *   ]} />
 */

import Link from "next/link";

interface RelatedLink {
  href: string;
  title: string;
  description?: string;
}

interface RelatedGroup {
  label: string;
  links: RelatedLink[];
}

interface BlogRelatedArticlesProps {
  groups: RelatedGroup[];
  heading?: string;
}

export default function BlogRelatedArticles({
  groups = [],
  heading = "この記事を読んだ方へ",
}: BlogRelatedArticlesProps) {
  return (
    <section className="my-8 rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 bg-stone-50">
        <h2 className="text-base font-bold text-stone-800">{heading}</h2>
      </div>
      <div className="divide-y divide-stone-100">
        {groups.map((group) => (
          <div key={group.label} className="px-5 py-4">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
              {group.label}
            </p>
            <div className="flex flex-col gap-2">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-start gap-2 group"
                >
                  <span className="shrink-0 text-amber-400 mt-0.5" aria-hidden="true">→</span>
                  <div>
                    <span className="text-sm font-semibold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">
                      {link.title}
                    </span>
                    {link.description && (
                      <p className="text-xs text-stone-500 mt-0.5">{link.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
