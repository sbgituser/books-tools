import { useState } from "react";
import type { Book } from "@/lib/bookProviders/types";

interface Props {
  book: Book;
  subLabel?: string | null;
  onClick: (book: Book) => void;
}

export default function BookListCard({ book, subLabel, onClick }: Props) {
  const [coverError, setCoverError] = useState(false);
  const fallbackCover = book.isbn13
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn13}-M.jpg?default=false`
    : null;
  const coverSrc = coverError ? null : (book.thumbnailUrl ?? fallbackCover);

  return (
    <article
      onClick={() => onClick(book)}
      className="bg-white border border-stone-200 rounded-xl p-3 sm:p-4 flex gap-3 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all"
    >
      {/* 書影 */}
      {coverSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverSrc}
          alt={book.title}
          onError={() => setCoverError(true)}
          className="shrink-0 w-12 h-[72px] sm:w-14 sm:h-[84px] rounded object-cover shadow-sm"
        />
      ) : (
        <div className="shrink-0 w-12 h-[72px] sm:w-14 sm:h-[84px] rounded bg-stone-200 flex items-center justify-center shadow-sm">
          <span className="text-stone-500 font-bold text-sm">{book.title.slice(0, 2)}</span>
        </div>
      )}

      {/* 情報 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 mb-0.5">
            {book.title}
          </h3>
          <p className="text-stone-500 text-xs line-clamp-1">{book.author}</p>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {subLabel && (
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
              {subLabel}
            </span>
          )}
          {book.pageCount && (
            <span className="text-xs text-stone-400">
              {book.pageCount}ページ
              {book.estimatedReadingHours && ` · 約${book.estimatedReadingHours}時間`}
            </span>
          )}
        </div>
      </div>

      {/* 矢印 */}
      <div className="shrink-0 self-center text-stone-300 text-sm">›</div>
    </article>
  );
}
