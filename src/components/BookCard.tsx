import type { Book, SimilarityResult } from "@/lib/bookProviders/types";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; cover: string }> = {
  "ビジネス・経済":     { bg: "bg-amber-100 text-amber-800",   text: "text-amber-700",   cover: "bg-amber-600" },
  "テクノロジー・AI":   { bg: "bg-blue-100 text-blue-800",     text: "text-blue-700",    cover: "bg-blue-600" },
  "自己啓発":           { bg: "bg-emerald-100 text-emerald-800", text: "text-emerald-700", cover: "bg-emerald-600" },
  "投資・お金":         { bg: "bg-red-100 text-red-800",       text: "text-red-700",     cover: "bg-red-600" },
  "小説・文学":         { bg: "bg-purple-100 text-purple-800", text: "text-purple-700",  cover: "bg-purple-600" },
  "健康・ライフスタイル": { bg: "bg-teal-100 text-teal-800",   text: "text-teal-700",    cover: "bg-teal-600" },
  "歴史・社会":         { bg: "bg-orange-100 text-orange-800", text: "text-orange-700",  cover: "bg-orange-600" },
  "心理学":             { bg: "bg-pink-100 text-pink-800",     text: "text-pink-700",    cover: "bg-pink-600" },
  "哲学・思想":         { bg: "bg-slate-100 text-slate-800",   text: "text-slate-700",   cover: "bg-slate-600" },
  "科学・教養":         { bg: "bg-cyan-100 text-cyan-800",     text: "text-cyan-700",    cover: "bg-cyan-600" },
  "漫画":               { bg: "bg-rose-100 text-rose-800",     text: "text-rose-700",    cover: "bg-rose-500" },
};

const DEFAULT_STYLE = { bg: "bg-stone-100 text-stone-700", text: "text-stone-600", cover: "bg-stone-600" };

function BookCover({ title, category, thumbnailUrl }: { title: string; category: string; thumbnailUrl?: string }) {
  const style = CATEGORY_STYLES[category] ?? DEFAULT_STYLE;

  if (thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnailUrl}
        alt={title}
        className="shrink-0 w-16 h-24 sm:w-20 sm:h-28 rounded object-cover shadow-md"
      />
    );
  }

  return (
    <div
      className={`${style.cover} shrink-0 w-16 h-24 sm:w-20 sm:h-28 rounded flex items-center justify-center shadow-md`}
      aria-hidden="true"
    >
      <span className="text-white font-bold text-base leading-tight text-center px-1">
        {title.slice(0, 2)}
      </span>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="text-amber-400 text-xs" aria-label={`評価: ${rating}`}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
      <span className="text-stone-400 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

interface Props {
  result: SimilarityResult;
  onSelect?: (book: Book) => void;
}

export default function BookCard({ result, onSelect }: Props) {
  const { book, reasons } = result;
  const style = CATEGORY_STYLES[book.category] ?? DEFAULT_STYLE;

  return (
    <article
      className={`bg-white border border-stone-200 rounded-xl p-4 sm:p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow ${onSelect ? "cursor-pointer hover:border-amber-300" : ""}`}
      onClick={onSelect ? () => onSelect(book) : undefined}
    >
      {/* Cover */}
      <BookCover title={book.title} category={book.category} thumbnailUrl={book.thumbnailUrl} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg}`}>
            {book.category}
          </span>
          {book.isKindle && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Kindle
            </span>
          )}
        </div>

        <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug mb-1 line-clamp-2">
          {book.title}
        </h3>

        <p className="text-stone-500 text-xs mb-2">{book.author}</p>

        {book.rating && (
          <div className="mb-2">
            <StarRating rating={book.rating} />
            {book.reviewCount && (
              <span className="text-stone-400 text-xs ml-1">
                ({book.reviewCount.toLocaleString("ja-JP")}件)
              </span>
            )}
          </div>
        )}

        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2">
          {book.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {book.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Similarity reasons */}
        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {reasons.map((r, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
              >
                ✓ {r}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm">
            {book.kindlePrice != null && (
              <span className="font-bold text-stone-800">
                Kindle ¥{book.kindlePrice.toLocaleString("ja-JP")}
              </span>
            )}
            {book.paperbackPrice != null && (
              <span className="text-stone-400 text-xs ml-2">
                紙 ¥{book.paperbackPrice.toLocaleString("ja-JP")}
              </span>
            )}
          </div>
          <a
            href={book.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Amazonで見る
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}
