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

/** Kindle版検索URL（パートナータグ付き） */
export function kindleSearchUrl(title: string): string {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(title)}&i=digital-text&tag=${AMAZON_PARTNER_TAG}`;
}

/** Audible版検索URL（パートナータグ付き） */
export function audibleSearchUrl(title: string): string {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(title)}&i=audible&tag=${AMAZON_PARTNER_TAG}`;
}

/** Kindle Unlimited紹介URL */
export const KINDLE_UNLIMITED_URL = `https://www.amazon.co.jp/kindle-dbs/hz/subscribe/ku?tag=${AMAZON_PARTNER_TAG}`;

/** Audible無料体験URL */
export const AUDIBLE_FREE_TRIAL_URL = `https://www.amazon.co.jp/hz/audible/mlp/mffly?tag=${AMAZON_PARTNER_TAG}`;

export const BLOG_DESCRIPTION =
  "小説・漫画のおすすめ作品紹介、ジャンル別の読書ガイド、作家別の読む順番まで。初心者から本好きまで役立つ読書ブログです。";

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
