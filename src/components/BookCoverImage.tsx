"use client";

import { useState } from "react";

const CATEGORY_COVER: Record<string, string> = {
  "ビジネス・経済":       "bg-amber-600",
  "テクノロジー・AI":     "bg-blue-600",
  "自己啓発":             "bg-emerald-600",
  "投資・お金":           "bg-red-600",
  "小説・文学":           "bg-purple-600",
  "健康・ライフスタイル": "bg-teal-600",
  "歴史・社会":           "bg-orange-600",
  "心理学":               "bg-pink-600",
  "哲学・思想":           "bg-slate-600",
  "科学・教養":           "bg-cyan-600",
  "漫画":                 "bg-rose-500",
};

interface Props {
  title: string;
  category: string;
  thumbnailUrl?: string;
  googleBooksId?: string;
  isbn13?: string;
  /** "lg" = 詳細ページヒーロー用, "md" = ミニカード用 (デフォルト) */
  size?: "md" | "lg";
}

export default function BookCoverImage({
  title,
  category,
  thumbnailUrl,
  googleBooksId,
  isbn13,
  size = "md",
}: Props) {
  const [coverIndex, setCoverIndex] = useState(0);

  const candidates = [
    thumbnailUrl,
    googleBooksId
      ? `https://books.google.com/books/content?id=${googleBooksId}&printsec=frontcover&img=1&zoom=2&source=gbs_api`
      : undefined,
    isbn13
      ? `https://books.google.com/books/content?vid=ISBN${isbn13}&printsec=frontcover&img=1&zoom=2&source=gbs_api`
      : undefined,
    isbn13
      ? `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg?default=false`
      : undefined,
  ].filter((v): v is string => Boolean(v));

  const src = candidates[coverIndex] ?? null;
  const coverColor = CATEGORY_COVER[category] ?? "bg-stone-600";
  const sizeClass =
    size === "lg"
      ? "w-24 h-36 sm:w-32 sm:h-48"
      : "w-14 h-20 sm:w-16 sm:h-24";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={title}
        loading="lazy"
        onError={() => setCoverIndex((prev) => prev + 1)}
        className={`${sizeClass} rounded-lg object-cover shadow-md shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${coverColor} rounded-lg flex items-center justify-center shadow-md shrink-0`}
    >
      <span className="text-white font-bold text-base text-center px-1 leading-tight">
        {title.slice(0, 3)}
      </span>
    </div>
  );
}
