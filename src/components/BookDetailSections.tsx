"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { indexProvider } from "@/lib/bookProviders/indexProvider";
import type { Book, SimilarityResult } from "@/lib/bookProviders/types";
import BookCoverImage from "@/components/BookCoverImage";

// サーバーから渡される書籍の基本情報
export interface BookData {
  id: string;
  title: string;
  authors: string[];
  keywords: string[];
  /** books.index.json の pathIds: [l1Id, l2Id?, l3Id?, ...] */
  pathIds: string[];
  l1Id: string;
}

// ── ミニカード ────────────────────────────────────────────────────

function BookMiniCard({
  book,
  reasons,
}: {
  book: Book;
  reasons?: string[];
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 sm:p-4 flex gap-3 hover:border-amber-300 hover:shadow-md transition-all">
      <BookCoverImage
        title={book.title}
        category={book.category}
        thumbnailUrl={book.thumbnailUrl}
        googleBooksId={book.googleBooksId}
        isbn13={book.isbn13}
        size="md"
      />
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {book.category && (
            <span className="text-xs text-amber-700 font-semibold">
              {book.category}
            </span>
          )}
          <h3 className="font-semibold text-stone-900 text-sm leading-snug mt-0.5 mb-0.5 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-stone-500 text-xs line-clamp-1">{book.author}</p>
          {reasons && reasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {reasons.slice(0, 2).map((r) => (
                <span
                  key={r}
                  className="text-xs px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-2">
          <Link
            href={`/books/${encodeURIComponent(book.id)}`}
            className="text-xs text-amber-700 font-semibold hover:underline"
          >
            詳細 →
          </Link>
          <Link
            href={`/tools/book-compare?baseId=${encodeURIComponent(book.id)}`}
            className="text-xs text-stone-500 hover:text-stone-700"
          >
            比較
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── セクションヘッダー ────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-bold text-stone-800 mb-4">{title}</h2>
  );
}

// ── メインコンポーネント ──────────────────────────────────────────

interface Props {
  book: BookData;
}

export default function BookDetailSections({ book }: Props) {
  const [similar, setSimilar] = useState<SimilarityResult[] | null>(null);
  const [genreBooks, setGenreBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // 類似本 + 同ジャンル本を並列ロード
        const genreCatIds = (book.pathIds ?? []).slice(1, 3); // L2〜L3までで絞る
        const [sim, genre] = await Promise.all([
          indexProvider.getSimilarBooks(book.id),
          book.l1Id
            ? indexProvider.getBooksByPath(book.l1Id, genreCatIds)
            : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setSimilar(sim);
          setGenreBooks(genre.filter((b2) => b2.id !== book.id));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [book.id, book.l1Id, book.pathIds]);

  if (loading) {
    return (
      <div className="text-center py-16 text-stone-400 text-sm">
        読み込み中…
      </div>
    );
  }

  const sim = similar ?? [];

  // 同著者 (類似本のうち "同著者" reason を持つもの)
  const authorBooks = sim
    .filter((r) => r.reasons.includes("同著者"))
    .slice(0, 6);

  // 類似本 (全て、最大6件)
  const similarBooks = sim.slice(0, 6);

  // 同ジャンル (類似本と重複しないもの)
  const similarIds = new Set(sim.map((r) => r.book.id));
  const pureGenreBooks = genreBooks
    .filter((b2) => !similarIds.has(b2.id))
    .slice(0, 6);

  // 次に読む: 同著者 > 同ジャンル > 類似 (重複排除, 最大4件)
  const nextToRead = [
    ...authorBooks.map((r) => r.book),
    ...pureGenreBooks.slice(0, 2),
    ...sim.map((r) => r.book),
  ]
    .filter((b2, idx, arr) => arr.findIndex((x) => x.id === b2.id) === idx)
    .filter((b2) => b2.id !== book.id)
    .slice(0, 4);

  // キーワード (サイト固有タグを除外)
  const keywords = book.keywords.filter(
    (k) => k !== "ブログ掲載書籍" && k.length > 1,
  );

  return (
    <div className="space-y-10">
      {/* 1. この本に似た本 */}
      {similarBooks.length > 0 && (
        <section>
          <SectionHeader title="この本に似た本" />
          <div className="grid sm:grid-cols-2 gap-3">
            {similarBooks.map((r) => (
              <BookMiniCard key={r.book.id} book={r.book} reasons={r.reasons} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/similar-books"
              className="text-sm text-amber-700 hover:underline"
            >
              書籍ブラウザで類似本をもっと探す →
            </Link>
          </div>
        </section>
      )}

      {/* 2. 同じ著者の本 */}
      {authorBooks.length > 0 && (
        <section>
          <SectionHeader
            title={`${book.authors[0] ?? "著者"}の他の作品`}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {authorBooks.map((r) => (
              <BookMiniCard key={r.book.id} book={r.book} />
            ))}
          </div>
        </section>
      )}

      {/* 3. 同ジャンルの本 */}
      {pureGenreBooks.length > 0 && (
        <section>
          <SectionHeader title="同じジャンルの本" />
          <div className="grid sm:grid-cols-2 gap-3">
            {pureGenreBooks.map((b2) => (
              <BookMiniCard key={b2.id} book={b2} />
            ))}
          </div>
        </section>
      )}

      {/* 4. 次に読むならこの本 */}
      {nextToRead.length > 0 && (
        <section>
          <SectionHeader title="次に読むならこの本" />
          <div className="grid sm:grid-cols-2 gap-3">
            {nextToRead.map((b2) => (
              <BookMiniCard key={b2.id} book={b2} />
            ))}
          </div>
        </section>
      )}

      {/* 5. この本を比較する */}
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h2 className="text-base font-bold text-amber-900 mb-2">
          この本を比較する ⚖️
        </h2>
        <p className="text-sm text-amber-800 mb-4">
          著者・出版年・ページ数・カテゴリを条件に、次に読む本の候補を探せます。
        </p>
        <Link
          href={`/tools/book-compare?baseId=${encodeURIComponent(book.id)}`}
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          比較ツールで探す
        </Link>
      </section>

      {/* 6. 映像化情報 */}
      <section className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
        <h2 className="text-base font-bold text-stone-800 mb-2">
          映像化・原作情報 🎬
        </h2>
        <p className="text-sm text-stone-600 mb-4">
          映像化作品の原作一覧や、この本が原作かどうかを確認できます。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tools/adaptation-originals"
            className="inline-flex items-center gap-1 border border-stone-300 hover:border-amber-400 text-stone-700 hover:text-amber-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            映像化作品 原作検索
          </Link>
          <Link
            href="/tools/original-reverse-lookup"
            className="inline-flex items-center gap-1 border border-stone-300 hover:border-amber-400 text-stone-700 hover:text-amber-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            原作から映像化を逆引き
          </Link>
        </div>
      </section>

      {/* 7. 関連キーワード */}
      {keywords.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-stone-800 mb-3">
            関連キーワード
          </h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <Link
                key={kw}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="text-sm px-3 py-1.5 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition-colors"
              >
                {kw}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
