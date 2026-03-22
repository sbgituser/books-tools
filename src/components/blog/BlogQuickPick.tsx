/**
 * BlogQuickPick.tsx
 *
 * 記事冒頭の「タイプ別即決導線」カードUI。
 * 読者が自分のタイプをすぐ選べるようにする。
 *
 * 使い方（MDX内）:
 *   <BlogQuickPick
 *     heading="あなたはどのタイプ？"
 *     items={[
 *       { type: "まず王道から読みたい", book: "点と線", icon: "📌", href: "#点と線" },
 *       ...
 *     ]}
 *   />
 */

interface QuickPickItem {
  /** タイプ説明（例: "まず王道から読みたい"） */
  type: string;
  /** 推薦作品名 */
  book: string;
  /** 絵文字アイコン */
  icon?: string;
  /** スクロール先またはリンク先 */
  href?: string;
  /** 補足（例: "初心者最有力"） */
  note?: string;
}

interface BlogQuickPickProps {
  items: QuickPickItem[];
  heading?: string;
}

export default function BlogQuickPick({ items = [], heading }: BlogQuickPickProps) {
  return (
    <div className="my-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
      {heading && (
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
          {heading}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-3">
        {items.map((item) => {
          const inner = (
            <div className="flex items-center gap-3 bg-white border border-amber-100 rounded-xl px-4 py-3 hover:border-amber-400 hover:shadow-sm transition-all">
              {item.icon && (
                <span className="text-2xl shrink-0" aria-hidden="true">{item.icon}</span>
              )}
              <div className="min-w-0">
                <p className="text-xs text-stone-500 leading-tight mb-0.5">{item.type}</p>
                <p className="text-sm font-bold text-stone-900 leading-snug">
                  {item.book}
                </p>
                {item.note && (
                  <p className="text-xs text-amber-600 mt-0.5">{item.note}</p>
                )}
              </div>
              {item.href && (
                <span className="shrink-0 text-stone-300 ml-auto text-sm" aria-hidden="true">↓</span>
              )}
            </div>
          );

          if (item.href) {
            return (
              <a key={item.type} href={item.href} className="block no-underline">
                {inner}
              </a>
            );
          }
          return <div key={item.type}>{inner}</div>;
        })}
      </div>
    </div>
  );
}
