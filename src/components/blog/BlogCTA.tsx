/**
 * BlogCTA.tsx
 *
 * ブログ記事内のインラインCTAコンポーネント。
 * 文脈に合ったツール誘導・記事誘導をカード形式で表示する。
 *
 * 使い方（MDX内）:
 *   <BlogCTA href="/similar-books" label="松本清張に近い雰囲気の本を探す" />
 *   <BlogCTA href="/tools/book-compare" label="社会派ミステリーを比較して選ぶ" description="条件を絞って次の1冊を決める" variant="compare" />
 */

import Link from "next/link";

type Variant = "discover" | "compare" | "article" | "default";

interface BlogCTAProps {
  href: string;
  label: string;
  description?: string;
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, { wrap: string; icon: string }> = {
  discover: {
    wrap: "border-rose-200 bg-rose-50 hover:border-rose-400 hover:bg-rose-100",
    icon: "🔍",
  },
  compare: {
    wrap: "border-amber-200 bg-amber-50 hover:border-amber-400 hover:bg-amber-100",
    icon: "⚖️",
  },
  article: {
    wrap: "border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-stone-100",
    icon: "📖",
  },
  default: {
    wrap: "border-amber-200 bg-amber-50 hover:border-amber-400 hover:bg-amber-100",
    icon: "→",
  },
};

export default function BlogCTA({ href, label, description, variant = "default" }: BlogCTAProps) {
  const styles = VARIANT_STYLES[variant];
  const isExternal = href.startsWith("http");

  return (
    <div className="my-6">
      <Link
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${styles.wrap}`}
      >
        <span className="text-xl shrink-0" aria-hidden="true">{styles.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-stone-800 leading-snug">{label}</p>
          {description && (
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        <span className="shrink-0 text-stone-400 ml-auto" aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
