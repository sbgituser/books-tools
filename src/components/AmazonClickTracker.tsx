"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * サイト内のAmazonリンク(kurasplus-22タグ付き)のクリックをGA4に計測する。
 *
 * 個々のAmazonリンクを持つコンポーネント(作品ページ・VolumeCard・
 * BookRecommendationCard等、多数に散在)を1つずつ変更する代わりに、
 * document単位のイベント委任(capture phase)で全リンクを一括捕捉する。
 * 既存・将来追加分のAmazonリンクをすべて自動的に計測対象にできる。
 */
export default function AmazonClickTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href*="amazon.co.jp"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      window.gtag?.("event", "amazon_link_click", {
        link_url: anchor.href,
        link_text: anchor.textContent?.trim().slice(0, 100) ?? "",
        page_path: window.location.pathname,
      });
    };

    // capture phaseで捕捉することで、リンク側でstopPropagation()されていても
    // 確実にイベントを検知できる
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
