"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BlogLinkedBook = {
  id: string;
  title: string;
  authors?: string[];
  thumbnailUrl?: string;
  isbn13?: string;
  sourceIds?: {
    googleBooksId?: string;
  };
};

export default function BlogBookInlineCard({ book }: { book: BlogLinkedBook }) {
  const [coverIndex, setCoverIndex] = useState(0);

  const coverCandidates = useMemo(
    () =>
      [
        book.sourceIds?.googleBooksId
          ? `https://books.google.com/books/content?id=${book.sourceIds.googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
          : undefined,
        book.isbn13
          ? `https://books.google.com/books/content?vid=ISBN${book.isbn13}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
          : undefined,
        book.thumbnailUrl,
        book.isbn13
          ? `https://covers.openlibrary.org/b/isbn/${book.isbn13}-M.jpg?default=false`
          : undefined,
      ].filter((v): v is string => Boolean(v)),
    [book.isbn13, book.sourceIds?.googleBooksId, book.thumbnailUrl],
  );

  const coverSrc = coverCandidates[coverIndex] ?? null;

  return (
    <div className="my-3 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {coverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverSrc}
              alt={`${book.title}のサムネイル`}
              onError={() => setCoverIndex((prev) => prev + 1)}
              className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-md border border-stone-200 bg-white shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-md border border-stone-300 bg-stone-200 px-1 py-1.5 flex items-center justify-center text-center text-[10px] leading-tight text-stone-700 font-medium shrink-0 overflow-hidden">
              <span className="line-clamp-4 break-words">{book.title}</span>
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs text-stone-500 mb-0.5">この作品を起点に比較</p>
            <p className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2">{book.title}</p>
            {book.authors && book.authors.length > 0 ? (
              <p className="text-xs text-stone-500 mt-1 line-clamp-1">{book.authors.join(" / ")}</p>
            ) : null}
          </div>
        </div>

        <Link
          href={`/tools/book-compare?baseId=${encodeURIComponent(book.id)}`}
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
        >
          条件一致で本を探す
        </Link>
      </div>
    </div>
  );
}

