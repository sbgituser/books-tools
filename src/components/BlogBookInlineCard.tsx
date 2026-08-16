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
  workId?: string;
};

export default function BlogBookInlineCard({ book }: { book: BlogLinkedBook }) {
  const [coverIndex, setCoverIndex] = useState(0);

  const coverCandidates = useMemo(
    () =>
      [
        book.isbn13
          ? `https://books.google.com/books/content?vid=ISBN${book.isbn13}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
          : undefined,
        book.sourceIds?.googleBooksId
          ? `https://books.google.com/books/content?id=${book.sourceIds.googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
          : undefined,
        book.thumbnailUrl,
        book.isbn13
          ? `https://covers.openlibrary.org/b/isbn/${book.isbn13}-M.jpg?default=false`
          : undefined,
      ].filter((v): v is string => Boolean(v)),
    [book.isbn13, book.sourceIds?.googleBooksId, book.thumbnailUrl],
  );

  const coverSrc = coverCandidates[coverIndex] ?? null;
  // Google Booksの画像を使う場合、Google Booksページへのリンクが必須(Googleガイドライン)。
  // workIdがある場合は /works/[workId] 側に既にリンクを設置済みのためここでは不要。
  const googleBooksUrl = book.sourceIds?.googleBooksId
    ? `https://books.google.com/books?id=${book.sourceIds.googleBooksId}`
    : null;

  const cardContent = (
    <>
      {coverSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverSrc}
          alt={`${book.title}のサムネイル`}
          onError={() => setCoverIndex((prev) => prev + 1)}
          className="book-card-thumb w-12 h-[68px] sm:w-14 sm:h-20 object-cover rounded-md border border-stone-200 bg-white shrink-0"
          loading="lazy"
          width={56}
          height={80}
        />
      ) : (
        <div className="w-12 h-[68px] sm:w-14 sm:h-20 rounded-md border border-stone-300 bg-stone-200 px-1 py-1.5 flex items-center justify-center text-center text-[10px] leading-tight text-stone-700 font-medium shrink-0 overflow-hidden">
          <span className="line-clamp-4 break-words">{book.title}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2 m-0 group-hover:text-amber-700 transition-colors">
          {book.title}
        </p>
        {book.authors && book.authors.length > 0 ? (
          <p className="text-xs text-stone-500 mt-1 mb-0 line-clamp-1">{book.authors.join(" / ")}</p>
        ) : null}
      </div>

      <svg
        className="w-4 h-4 text-stone-400 shrink-0 group-hover:text-amber-600 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </>
  );

  if (book.workId) {
    return (
      <Link
        href={`/works/${book.workId}`}
        className="my-3 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4 hover:bg-stone-100 hover:border-stone-300 hover:shadow-sm transition-all duration-200 no-underline group book-card-link"
      >
        {cardContent}
      </Link>
    );
  }

  if (googleBooksUrl) {
    return (
      <a
        href={googleBooksUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="my-3 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4 hover:bg-stone-100 hover:border-stone-300 hover:shadow-sm transition-all duration-200 no-underline group book-card-link"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className="my-3 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4">
      {cardContent}
    </div>
  );
}
