import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-400 mt-20 py-10 px-4 text-sm">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
          <div>
            <div className="text-white font-bold text-base mb-1">
              📚 Books Tools
            </div>
            <p className="text-stone-500 text-xs">
              Kindle本を感覚的に探索するためのツール集
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="フッターナビゲーション">
            <Link href="/" className="text-stone-400 hover:text-white text-xs transition-colors">
              ホーム
            </Link>
            <Link href="/discover" className="text-stone-400 hover:text-white text-xs transition-colors">
              気分で探す
            </Link>
            <Link href="/genre" className="text-stone-400 hover:text-white text-xs transition-colors">
              ジャンル
            </Link>
            <Link href="/scene" className="text-stone-400 hover:text-white text-xs transition-colors">
              シーン
            </Link>
            <Link href="/tools" className="text-stone-400 hover:text-white text-xs transition-colors">
              ツール一覧
            </Link>
            <Link href="/privacy" className="text-stone-400 hover:text-white text-xs transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="text-stone-400 hover:text-white text-xs transition-colors">
              お問い合わせ
            </Link>
          </nav>
        </div>

        <div className="border-t border-stone-800 pt-6 text-center text-xs text-stone-600 space-y-1">
          <p>© {year} kuras-plus. All rights reserved.</p>
          <p>
            本ツールはAmazon アソシエイト・プログラムに参加しています。
            表示される価格は参考値であり、実際の価格はAmazonでご確認ください。
          </p>
        </div>
      </div>
    </footer>
  );
}
