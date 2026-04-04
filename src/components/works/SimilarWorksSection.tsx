/**
 * SimilarWorksSection.tsx
 *
 * 「似た作品」セクション。
 * 作品詳細ページの下部に配置し、理由別グループで類似作品を表示する。
 *
 * Props:
 *   similar — data/similar-works/{fileId}.json の内容
 */

import Link from "next/link";
import Image from "next/image";
import type { SimilarWorks, SimilarWorkItem } from "@/types/similar-works";

// ── タイプ設定 ────────────────────────────────────────────────────

const TYPE_CONFIG = {
  manga: { label: "漫画", color: "bg-rose-100 text-rose-700" },
  novel: { label: "小説", color: "bg-sky-100 text-sky-700" },
  other: { label: "書籍", color: "bg-stone-100 text-stone-600" },
} as const;

// ── 内部: 類似作品カード ──────────────────────────────────────────

function SimilarCard({ item }: { item: SimilarWorkItem }) {
  const typeConfig = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.other;

  return (
    <Link
      href={`/works/${encodeURIComponent(item.fileId)}`}
      className="group flex gap-3 bg-white border border-stone-200 rounded-xl p-3 hover:border-violet-300 hover:shadow-md transition-all duration-200"
    >
      {/* 書影 */}
      <div className="relative shrink-0 w-12 h-[72px] sm:w-14 sm:h-[84px] rounded-lg overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
        {item.coverImageUrl ? (
          <Image
            src={item.coverImageUrl}
            alt={`${item.title} の表紙`}
            fill
            sizes="56px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl">{item.type === "manga" ? "📖" : "📕"}</span>
          </div>
        )}
      </div>

      {/* テキスト情報 */}
      <div className="flex-1 min-w-0">
        {/* バッジ行 */}
        <div className="flex items-center gap-1 mb-1 flex-wrap">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          {item.status === "completed" && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              完結
            </span>
          )}
          {item.volumeCount >= 2 && (
            <span className="text-xs text-stone-400">全{item.volumeCount}巻</span>
          )}
        </div>

        {/* タイトル */}
        <p className="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors mb-0.5">
          {item.title}
        </p>

        {/* 著者 */}
        <p className="text-xs text-stone-400 line-clamp-1 mb-1.5">{item.authorDisplay}</p>

        {/* 理由 */}
        <p className="text-xs text-violet-600 leading-snug line-clamp-2">
          {item.reason}
        </p>
      </div>
    </Link>
  );
}

// ── メイン: セクション全体 ────────────────────────────────────────

interface Props {
  similar: SimilarWorks;
}

export default function SimilarWorksSection({ similar }: Props) {
  const nonEmptyGroups = similar.groups.filter((g) => g.items.length > 0);
  if (nonEmptyGroups.length === 0) return null;

  return (
    <section id="similar-works" className="mb-8">
      {/* セクションヘッダー */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-1 h-6 bg-violet-500 rounded-full shrink-0" aria-hidden="true" />
        <h2 className="text-lg font-bold text-stone-800">似た作品</h2>
        <span className="text-xs text-stone-400 font-normal">
          この作品から広げて探す
        </span>
      </div>

      <div className="space-y-6">
        {nonEmptyGroups.map((group) => (
          <div key={group.type}>
            {/* グループヘッダー */}
            <h3 className="text-sm font-semibold text-stone-600 mb-3 flex items-center gap-2">
              <span aria-hidden="true">
                {group.type === "same_author"
                  ? "✏️"
                  : group.type === "same_publisher"
                  ? "🏢"
                  : "✨"}
              </span>
              {group.title}
            </h3>

            {/* カードグリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((item) => (
                <SimilarCard key={item.workId} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 補助導線 */}
      <div className="mt-6 pt-5 border-t border-stone-200 text-center">
        <p className="text-xs text-stone-400 mb-2">もっと幅広く探したい方へ</p>
        <Link
          href="/discover"
          className="text-xs text-violet-600 hover:underline"
        >
          気分・雰囲気から別の作品を探す →
        </Link>
      </div>
    </section>
  );
}
