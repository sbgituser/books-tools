import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-400 mt-20 py-10 px-4 text-sm">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="text-white font-bold text-base mb-1">
              📚 Books Tools
            </div>
            <p className="text-stone-500 text-xs">
              Kindle本を感覚的に探索するためのツール集
            </p>
          </div>
          <nav className="space-y-1.5" aria-label="本を探す">
            <p className="text-stone-300 text-xs font-bold mb-2">本を探す</p>
            <Link href="/discover" className="block text-stone-400 hover:text-white text-xs transition-colors">気分で探す</Link>
            <Link href="/discover/by-mood" className="block text-stone-400 hover:text-white text-xs transition-colors">気分別ガイド</Link>
            <Link href="/discover/by-author" className="block text-stone-400 hover:text-white text-xs transition-colors">著者別ガイド</Link>
            <Link href="/discover/new-releases" className="block text-stone-400 hover:text-white text-xs transition-colors">新着まとめ</Link>
            <Link href="/genre" className="block text-stone-400 hover:text-white text-xs transition-colors">ジャンルから探す</Link>
            <Link href="/scene" className="block text-stone-400 hover:text-white text-xs transition-colors">シーンで探す</Link>
            <Link href="/search" className="block text-stone-400 hover:text-white text-xs transition-colors">キーワード検索</Link>
          </nav>
          <nav className="space-y-1.5" aria-label="ツール">
            <p className="text-stone-300 text-xs font-bold mb-2">ツール</p>
            <Link href="/tools" className="block text-stone-400 hover:text-white text-xs transition-colors">ツール一覧</Link>
            <Link href="/tools/book-quiz" className="block text-stone-400 hover:text-white text-xs transition-colors">おすすめ本診断</Link>
            <Link href="/tools/similar-books" className="block text-stone-400 hover:text-white text-xs transition-colors">似ている本を探す</Link>
            <Link href="/tools/reading-order" className="block text-stone-400 hover:text-white text-xs transition-colors">シリーズ読む順番</Link>
          </nav>
          <nav className="space-y-1.5" aria-label="コンテンツ">
            <p className="text-stone-300 text-xs font-bold mb-2">コンテンツ</p>
            <Link href="/blog" className="block text-stone-400 hover:text-white text-xs transition-colors">ブログ</Link>
            <Link href="/" className="block text-stone-400 hover:text-white text-xs transition-colors">ホーム</Link>
            <Link href="/privacy" className="block text-stone-400 hover:text-white text-xs transition-colors">プライバシーポリシー</Link>
            <Link href="/contact" className="block text-stone-400 hover:text-white text-xs transition-colors">お問い合わせ</Link>
          </nav>
        </div>

        <div className="border-t border-stone-800 pt-6 mb-6">
          <p className="text-stone-300 text-xs font-bold mb-2">姉妹サイト</p>
          <nav className="space-y-1.5" aria-label="姉妹サイト">
            <a href="https://side-job-calc.kuras-plus.com" target="_blank" rel="noopener noreferrer" className="block text-stone-400 hover:text-white text-xs transition-colors">
              副業手取りシミュレーター — 副業の税金・手取りを自動計算
            </a>
            <a href="https://side-job-calc.kuras-plus.com/tedori-simulation" target="_blank" rel="noopener noreferrer" className="block text-stone-400 hover:text-white text-xs transition-colors">
              手取りシミュレーション（所得税・住民税・社会保険料）
            </a>
            <a href="https://side-job-calc.kuras-plus.com/income-wall" target="_blank" rel="noopener noreferrer" className="block text-stone-400 hover:text-white text-xs transition-colors">
              年収の壁シミュレーション（103万・130万・178万）
            </a>
            <a href="https://diy-shelf-maker.kuras-plus.com" target="_blank" rel="noopener noreferrer" className="block text-stone-400 hover:text-white text-xs transition-colors">
              DIY棚シミュレーター — 賃貸でもOKな突っ張り棚の設計ツール
            </a>
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
