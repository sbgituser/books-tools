"use client";

interface ShareButtonsProps {
  /** 共有するページの完全URL */
  url: string;
  /** 共有時に添えるテキスト(タイトル等) */
  text: string;
}

/**
 * SNS共有ボタン — X(Twitter), LINE, Facebook
 * 作品ページ・ブログ記事など、汎用的に使えるシェアボタン
 */
export default function ShareButtons({ url, text }: ShareButtonsProps) {
  const handleShareX = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  const handleShareLine = () => {
    const msg = `${text}\n${url}`;
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  const handleShareFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-400 font-medium">シェア:</span>
      <button
        type="button"
        onClick={handleShareX}
        aria-label="Xでシェア"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-700 text-white transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleShareLine}
        aria-label="LINEでシェア"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-[#06C755] hover:opacity-90 text-white transition-opacity"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M12 2C6.477 2 2 5.79 2 10.44c0 4.17 3.59 7.67 8.44 8.33.33.07.78.22.89.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1 .87.55 1.07-.46 5.77-3.4 7.87-5.82C21.31 13.5 22 12.03 22 10.44 22 5.79 17.52 2 12 2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleShareFacebook}
        aria-label="Facebookでシェア"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1877F2] hover:opacity-90 text-white transition-opacity"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M13.5 21v-7.5H16l.5-3.5h-3V7.8c0-1 .3-1.7 1.7-1.7H16.5V3.1C16.2 3 15.2 3 14 3c-2.5 0-4.2 1.5-4.2 4.4v2.6H7v3.5h2.8V21h3.7z" />
        </svg>
      </button>
    </div>
  );
}
