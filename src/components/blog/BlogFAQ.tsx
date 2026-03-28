/**
 * BlogFAQ.tsx
 *
 * ブログ記事内のFAQセクション。
 * アコーディオンUIで表示し、FAQPage JSON-LD をインラインで出力する。
 *
 * 使い方（MDX内）:
 *   <BlogFAQ items={[
 *     { q: "質問文", a: "回答文" },
 *     ...
 *   ]} />
 */

type FaqItem = {
  q: string;
  a: string;
};

interface BlogFAQProps {
  items: FaqItem[];
  heading?: string;
}

export default function BlogFAQ({ items = [], heading = "よくある質問" }: BlogFAQProps) {
  // 空データガード: 有効な質問が1件もない場合は何も表示しない
  const validItems = items.filter((item) => item.q?.trim());
  if (validItems.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="my-8 rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 bg-white">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span aria-hidden="true">❓</span>
            {heading}
          </h2>
        </div>
        <div className="divide-y divide-stone-200">
          {validItems.map(({ q, a }, i) => (
            <details key={i} className="group">
              <summary className="flex items-start justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-stone-100 transition-colors">
                <span className="text-sm font-semibold text-stone-800 leading-relaxed">{q}</span>
                <span
                  className="shrink-0 text-stone-400 mt-0.5 group-open:rotate-180 transition-transform duration-200"
                  aria-hidden="true"
                >
                  ↓
                </span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-white">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
