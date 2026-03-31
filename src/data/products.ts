/**
 * products.ts
 *
 * Amazon アフィリエイトリンクのユーティリティ。
 * src/lib/site.ts の関数をラップして統一インターフェースを提供する。
 */

export { AMAZON_PARTNER_TAG as AMAZON_ASSOCIATE_TAG } from "@/lib/site";

/** Amazon 商品検索 URL を生成（パートナータグ付き） */
export function buildAmazonUrl(keyword: string): string {
  const tag = "kurasplus-22";
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&tag=${tag}`;
}
