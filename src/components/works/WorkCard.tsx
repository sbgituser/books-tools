import Link from "next/link";
import Image from "next/image";
import type { WorkListItem } from "@/types/work";

interface Props {
  work: WorkListItem;
  /** タグをハイライト表示する（発見機能で選択中のタグ） */
  highlightTags?: string[];
}

const TYPE_CONFIG = {
  manga: { label: "漫画", color: "bg-rose-100 text-rose-700 border-rose-200" },
  novel: { label: "小説", color: "bg-sky-100 text-sky-700 border-sky-200" },
  other: { label: "その他", color: "bg-stone-100 text-stone-600 border-stone-200" },
} as const;

const STATUS_CONFIG = {
  completed: { label: "完結", color: "bg-emerald-100 text-emerald-700" },
  ongoing: { label: "連載中", color: "bg-amber-100 text-amber-700" },
  unknown: { label: "", color: "" },
} as const;

export default function WorkCard({ work, highlightTags = [] }: Props) {
  const typeConfig = TYPE_CONFIG[work.type] ?? TYPE_CONFIG.other;
  const statusConfig = STATUS_CONFIG[work.status];
  const highlightSet = new Set(highlightTags);

  return (
    <Link
      href={`/works/${encodeURIComponent(work.workId)}`}
      className="group block bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-rose-300 hover:shadow-lg transition-all duration-200"
    >
      {/* 書影エリア */}
      <div className="relative aspect-[2/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
        {work.coverImageUrl ? (
          <Image
            src={work.coverImageUrl}
            alt={`${work.title} の表紙`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-3xl mb-2">{work.type === "manga" ? "📖" : "📕"}</span>
            <span className="text-xs text-stone-400 font-medium leading-tight line-clamp-3">
              {work.title}
            </span>
          </div>
        )}

        {/* タイプバッジ */}
        <span
          className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full border ${typeConfig.color}`}
        >
          {typeConfig.label}
        </span>

        {/* 完結バッジ */}
        {statusConfig.label && (
          <span
            className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
        )}

        {/* 巻数バッジ（2巻以上） */}
        {work.volumeCount >= 2 && (
          <span className="absolute bottom-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-black/60 text-white">
            全{work.volumeCount}巻
          </span>
        )}
      </div>

      {/* 情報エリア */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-stone-900 leading-tight line-clamp-2 mb-1 group-hover:text-rose-700 transition-colors">
          {work.title}
        </h3>
        <p className="text-xs text-stone-500 mb-2 line-clamp-1">{work.authorDisplay}</p>

        {/* タグ */}
        {work.discoveryTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {work.discoveryTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                  highlightSet.has(tag)
                    ? "bg-rose-500 text-white font-semibold"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
