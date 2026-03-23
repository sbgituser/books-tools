export const SITE_NAME = "Books Tools | kuras-plus";
export const SITE_URL = "https://books.kuras-plus.com";
export const SITE_DESCRIPTION =
  "Kindle本を感覚的に探索できるツール集。類似本検索・比較など、Amazonでは体験できない本の探し方を提供します。";

// ── Amazon アフィリエイト設定 ─────────────────────────────────────
export const AMAZON_PARTNER_TAG = "kurasplus-22";

/** Amazon検索URLを生成（パートナータグ付き） */
export function amazonSearchUrl(query: string): string {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}&tag=${AMAZON_PARTNER_TAG}`;
}

/** Amazon商品URLを生成（ISBN → 商品検索、なければタイトル検索） */
export function amazonProductUrl(isbn13?: string, title?: string): string {
  const q = isbn13 ?? title ?? "";
  return `https://www.amazon.co.jp/s?k=${isbn13 ? isbn13 : encodeURIComponent(q)}&tag=${AMAZON_PARTNER_TAG}`;
}

export const BLOG_DESCRIPTION =
  "本選び・読書術・比較ノウハウを発信するBooks Tools公式ブログ。検索流入から書籍ツール活用までをつなげます。";

export const TOOL_LINKS = [
  {
    href: "/tools/media-originals",
    title: "映像から原作を探す",
    description: "映画・ドラマ・アニメから原作となった本を逆引き",
  },
  {
    href: "/tools/trend-books",
    title: "テーマから本を探す",
    description: "AI・経済・環境などのテーマから今読むべき本を提案",
  },
  {
    href: "/blog",
    title: "ブログ一覧",
    description: "読書・比較ノウハウをまとめて確認する",
  },
  {
    href: "/",
    title: "ツール一覧",
    description: "Books Toolsの全機能へアクセスする",
  },
] as const;

