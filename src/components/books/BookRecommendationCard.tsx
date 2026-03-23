"use client";

import { useState } from "react";
import Link from "next/link";
import type { MoodBookEntry } from "@/types/book";
import type { EmotionalTagId, PurposeTagId, AtmosphereTagId } from "@/constants/bookTags";
import { EMOTIONAL_TAGS, PURPOSE_TAGS, ATMOSPHERE_TAGS } from "@/constants/bookTags";
import { amazonProductUrl } from "@/lib/site";

// ── タグID → ラベルのマップ ──────────────────────────────────────

const emotionalMap = Object.fromEntries(EMOTIONAL_TAGS.map(t => [t.id, t.label]));
const purposeMap   = Object.fromEntries(PURPOSE_TAGS.map(t => [t.id, t.label]));
const atmosphereMap = Object.fromEntries(ATMOSPHERE_TAGS.map(t => [t.id, t.label]));

// ── カテゴリカラー ────────────────────────────────────────────────

const L2_COLORS: Record<string, string> = {
  shonen:  "bg-orange-100 text-orange-700",
  shojo:   "bg-pink-100 text-pink-700",
  seinen:  "bg-blue-100 text-blue-700",
  general: "bg-stone-100 text-stone-600",
};

const L3_LABELS: Record<string, string> = {
  battle: "バトル", sports: "スポーツ", romance: "恋愛", romcom: "ラブコメ",
  social: "社会・人間ドラマ", drama: "ドラマ", adventure: "冒険・ファンタジー",
  gag: "ギャグ・コメディ", "daily-life": "日常", fantasy: "ファンタジー",
  comedy: "コメディ", "general-manga": "総合",
};

const L2_LABELS: Record<string, string> = {
  shonen: "少年", shojo: "少女", seinen: "青年", general: "一般",
};

// ── 書影コンポーネント ────────────────────────────────────────────

function MangaCover({ book }: { book: MoodBookEntry }) {
  const [idx, setIdx] = useState(0);
  const googleBooksId = book.sourceIds?.googleBooksId;

  const candidates = [
    book.thumbnailUrl,
    googleBooksId
      ? `https://books.google.com/books/content?id=${googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : undefined,
    book.isbn13
      ? `https://books.google.com/books/content?vid=ISBN${book.isbn13}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : undefined,
    book.isbn13
      ? `https://covers.openlibrary.org/b/isbn/${book.isbn13}-M.jpg?default=false`
      : undefined,
  ].filter((v): v is string => Boolean(v));

  const src = candidates[idx] ?? null;
  const color = L2_COLORS[book.l2Id ?? ""] ?? "bg-stone-200";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={book.title}
        onError={() => setIdx(p => p + 1)}
        className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg shadow-md shrink-0"
      />
    );
  }

  return (
    <div
      className={`${color} w-20 h-28 sm:w-24 sm:h-32 rounded-lg shadow-md shrink-0 flex items-center justify-center`}
      aria-hidden="true"
    >
      <span className="text-stone-500 text-sm font-bold text-center px-1 leading-tight">
        {book.title.slice(0, 4)}
      </span>
    </div>
  );
}

// ── タグチップ ────────────────────────────────────────────────────

function TagChip({ label, variant }: { label: string; variant: "emotional" | "purpose" | "atmosphere" | "meta" }) {
  const styles = {
    emotional:  "bg-rose-50 text-rose-600 border-rose-200",
    purpose:    "bg-blue-50 text-blue-600 border-blue-200",
    atmosphere: "bg-stone-100 text-stone-600 border-stone-200",
    meta:       "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[variant]}`}>
      {label}
    </span>
  );
}

// ── メインカード ──────────────────────────────────────────────────

interface Props {
  book: MoodBookEntry;
  matchedEmotional?: EmotionalTagId[];
  matchedPurpose?: PurposeTagId[];
  matchedAtmosphere?: AtmosphereTagId[];
  score?: number;
}

export default function BookRecommendationCard({
  book,
  matchedEmotional = [],
  matchedPurpose = [],
  matchedAtmosphere = [],
}: Props) {
  const mt = book.moodTags;
  const l2Label = L2_LABELS[book.l2Id ?? ""] ?? book.l2Id ?? "";
  const l3Label = L3_LABELS[book.l3Id ?? ""] ?? book.l3Id ?? "";
  const catLabel = [l2Label, l3Label].filter(Boolean).join(" › ");

  // 表示する感情・目的タグ（一致したものを優先、最大3つ）
  const displayEmotional = [
    ...matchedEmotional,
    ...(mt?.emotionalTags ?? []).filter(t => !matchedEmotional.includes(t)),
  ].slice(0, 3);

  const displayPurpose = [
    ...matchedPurpose,
    ...(mt?.purposeTags ?? []).filter(t => !matchedPurpose.includes(t)),
  ].slice(0, 3);

  // Amazon URL を生成（パートナータグは site.ts で一元管理）
  const amazonUrl = amazonProductUrl(book.isbn13, book.title);

  return (
    <article className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 flex gap-4 shadow-sm hover:shadow-md hover:border-rose-200 transition-all">
      {/* 書影 */}
      <MangaCover book={book} />

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        {/* カテゴリバッジ */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {catLabel && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${L2_COLORS[book.l2Id ?? ""] ?? "bg-stone-100 text-stone-600"}`}>
              🎨 {catLabel}
            </span>
          )}
          {mt?.completionStatus && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              mt.completionStatus === "完結" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              {mt.completionStatus === "完結" ? "✅ 完結" : "🔄 連載中"}
            </span>
          )}
        </div>

        {/* タイトル */}
        <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug mb-0.5 line-clamp-2">
          {book.title}
        </h3>

        {/* 著者 */}
        <p className="text-stone-500 text-xs mb-2 line-clamp-1">
          {book.authors.join(" / ")}
          {book.publisher ? ` · ${book.publisher}` : ""}
        </p>

        {/* 一言訴求 */}
        {mt?.recommendationCatch && (
          <p className="text-stone-700 text-sm font-medium leading-relaxed mb-2 line-clamp-2">
            {mt.recommendationCatch}
          </p>
        )}

        {/* タグ群 */}
        <div className="flex flex-wrap gap-1 mb-2">
          {displayEmotional.map(id => (
            <TagChip
              key={`e-${id}`}
              label={emotionalMap[id] ?? id}
              variant={matchedEmotional.includes(id) ? "emotional" : "atmosphere"}
            />
          ))}
          {displayPurpose.map(id => (
            <TagChip
              key={`p-${id}`}
              label={purposeMap[id] ?? id}
              variant={matchedPurpose.includes(id) ? "purpose" : "atmosphere"}
            />
          ))}
          {matchedAtmosphere.map(id => (
            <TagChip
              key={`a-${id}`}
              label={atmosphereMap[id] ?? id}
              variant="atmosphere"
            />
          ))}
          {mt?.paceTag && (
            <TagChip label={`テンポ: ${mt.paceTag}`} variant="meta" />
          )}
          {mt?.depthTag && (
            <TagChip label={`重さ: ${mt.depthTag}`} variant="meta" />
          )}
        </div>

        {/* こんな人に */}
        {mt?.recommendedFor && mt.recommendedFor.length > 0 && (
          <p className="text-xs text-stone-500 mb-3">
            <span className="font-semibold text-stone-600">こんな人に: </span>
            {mt.recommendedFor.join(" · ")}
          </p>
        )}

        {/* メタ情報 */}
        {(book.pageCount || book.estimatedReadingHours) && (
          <p className="text-xs text-stone-400 mb-3">
            {book.pageCount && `${book.pageCount}P`}
            {book.pageCount && book.estimatedReadingHours && " · "}
            {book.estimatedReadingHours && `読書時間 約${book.estimatedReadingHours.toFixed(1)}h`}
          </p>
        )}

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-3 mt-auto">
          <a
            href={amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Amazonで見る <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}
