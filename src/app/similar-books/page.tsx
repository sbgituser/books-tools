"use client";

import { useState, useCallback, useEffect } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import BookCard from "@/components/BookCard";
import { mockProvider } from "@/lib/bookProviders/mockProvider";
import type { SimilarityResult } from "@/lib/bookProviders/types";

// Note: metadata must be in a server component.
// For client pages, set <title> via useEffect or move metadata to a parent layout.
// For MVP this is handled by the layout's default title template.

const POPULAR_TAGS = [
  "投資・資産形成",
  "自己啓発",
  "AI・テクノロジー",
  "ビジネス思考",
  "小説",
  "睡眠・健康",
  "データ分析",
  "起業",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "類似本検索",
  url: "https://books.kuras-plus.com/similar-books",
  description:
    "本のタイトルやキーワードを入力して、類似するKindle本を探せる無料ツール。",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
};

export default function SimilarBooksPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SimilarityResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.trim().length === 0) {
      setResults([]);
      setSearched(false);
      return;
    }
    const res = await mockProvider.search(q);
    setResults(res);
    setSearched(true);
  }, []);

  // Update page title
  useEffect(() => {
    document.title = "類似本検索 | Books Tools";
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        {/* Hero + Search */}
        <section className="bg-gradient-to-br from-stone-800 to-stone-700 text-white px-4 py-10 sm:py-14">
          <div className="max-w-3xl mx-auto">
            <nav className="text-stone-400 text-xs mb-4 flex gap-1 items-center" aria-label="パンくずリスト">
              <a href="/" className="hover:text-white transition-colors">ホーム</a>
              <span>›</span>
              <span className="text-stone-300">類似本検索</span>
            </nav>

            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2">
              Similar Books Search
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">類似本検索</h1>
            <p className="text-stone-300 text-sm sm:text-base mb-8 leading-relaxed">
              本のタイトルやキーワードを入力すると、似た本をまとめて表示します。<br className="hidden sm:block" />
              気になる本の「隣の棚」を感覚的に探索しましょう。
            </p>

            <SearchBox value={query} onChange={handleSearch} />

            {/* Popular tag shortcuts */}
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-stone-400 text-xs">よく使われる:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSearch(tag)}
                  className="text-xs bg-stone-600 hover:bg-stone-500 active:bg-amber-600 text-stone-200 px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="max-w-3xl mx-auto px-4 py-10">
          {/* Empty state */}
          {!searched && (
            <div className="text-center py-20 text-stone-400">
              <div className="text-6xl mb-5">📚</div>
              <p className="text-lg font-medium text-stone-600 mb-2">
                タイトルやキーワードを入力してください
              </p>
              <p className="text-sm text-stone-400">
                例：「嫌われる勇気」「投資 初心者」「AI 未来」「睡眠」
              </p>
            </div>
          )}

          {/* No results */}
          {searched && results.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-5">🔍</div>
              <p className="text-lg font-medium text-stone-600 mb-2">
                「{query}」に類似する本が見つかりませんでした
              </p>
              <p className="text-sm text-stone-400 mb-6">
                別のキーワードや本のタイトルで試してみてください
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {POPULAR_TAGS.slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="text-sm bg-stone-100 hover:bg-amber-50 text-stone-600 hover:text-amber-700 px-4 py-2 rounded-full transition-colors border border-stone-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <>
              <p className="text-sm text-stone-400 mb-5">
                「<span className="font-medium text-stone-700">{query}</span>」に類似する本 — {results.length}件
              </p>
              <div className="space-y-4">
                {results.map((result) => (
                  <BookCard key={result.book.id} result={result} />
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-8 text-center leading-relaxed">
                ※ 表示価格は参考値です。Amazonでの実際の価格・Kindle対応状況をご確認ください。<br />
                ※ 現在はデモ用データを使用しています。
              </p>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
