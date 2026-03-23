/**
 * AdSlot.tsx
 *
 * Google AdSense 広告枠プレースホルダー。
 * AdSense承認後にスクリプトを有効化する。
 *
 * 使い方:
 *   <AdSlot slot="1234567890" format="auto" />
 *
 * 現在は非表示（AdSense未承認）。
 * 承認後、ADSENSE_ENABLED を true に変更し、layout.tsx に AdSense スクリプトタグを追加する。
 */

// AdSense が有効化されるまで false に設定
const ADSENSE_ENABLED = false;

// AdSense承認後に取得するパブリッシャーID
// const ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";

interface Props {
  /** AdSense広告ユニットのスロットID */
  slot: string;
  /** 広告フォーマット: "auto" | "horizontal" | "vertical" | "rectangle" */
  format?: string;
  /** className の追加 */
  className?: string;
}

export default function AdSlot({ slot, format = "auto", className = "" }: Props) {
  if (!ADSENSE_ENABLED) {
    // 開発時・未承認時はプレースホルダーを表示しない
    return null;
  }

  return (
    <div className={`ad-slot ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format={format}
        data-ad-slot={slot}
        data-full-width-responsive="true"
      />
    </div>
  );
}
