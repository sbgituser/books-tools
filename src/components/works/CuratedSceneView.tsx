/**
 * CuratedSceneView.tsx
 *
 * AI選書結果を「選書棚」らしく表示するコンポーネント。
 * セクション分け + 各作品への推薦理由付きカードで構成。
 *
 * Props:
 *   curated  — public/data/scene-curated/{slug}.json の内容
 *   workMap  — workId → WorkListItem のマップ（ページ側で構築して渡す）
 */

import Link from "next/link";
import Image from "next/image";
import type { WorkListItem } from "@/types/work";
import type { SceneCurated, CuratedItem } from "@/types/scene-curated";

// ────────────────────────────────────────────────────────────────
// 内部: 推薦理由付き作品カード（横並びレイアウト）
// ────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  manga: { label: "漫画", color: "bg-rose-100 text-rose-700" },
  novel: { label: "小説", color: "bg-sky-100 text-sky-700" },
  other: { label: "その他", color: "bg-stone-100 text-stone-600" },
} as const;

interface CuratedCardProps {
  item: CuratedItem;
  work: WorkListItem;
}

function CuratedCard({ item, work }: CuratedCardProps) {
  const typeConfig = TYPE_CONFIG[work.type] ?? TYPE_CONFIG.other;

  return (
    <Link
      href={`/works/${encodeURIComponent(work.workId)}`}
      className="group flex gap-4 bg-white border border-stone-200 rounded-2xl p-4 hover:border-violet-300 hover:shadow-md transition-all duration-200"
    >
      {/* 書影 */}
      <div className="relative shrink-0 w-14 h-20 sm:w-16 sm:h-24 rounded-lg overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
        {work.coverImageUrl ? (
          <Image
            src={work.coverImageUrl}
            alt={`${work.title} の表紙`}
            fill
            sizes="64px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">{work.type === "manga" ? "📖" : "📕"}</span>
          </div>
        )}
      </div>

      {/* テキスト情報 */}
      <div className="flex-1 min-w-0">
        {/* メタバッジ行 */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          {work.status === "completed" && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              完結
            </span>
          )}
          {work.volumeCount >= 2 && (
            <span className="text-xs text-stone-400">全{work.volumeCount}巻</span>
          )}
        </div>

        {/* タイトル */}
        <h3 className="text-sm font-bold text-stone-900 leading-snug mb-0.5 line-clamp-2 group-hover:text-violet-700 transition-colors">
          {work.title}
        </h3>

        {/* 著者 */}
        <p className="text-xs text-stone-400 mb-2 line-clamp-1">{work.authorDisplay}</p>

        {/* 推薦理由 */}
        <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 bg-stone-50 rounded-lg px-2.5 py-2 border border-stone-100">
          {item.reason}
        </p>
      </div>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────
// メイン: 選書ビュー全体
// ────────────────────────────────────────────────────────────────

interface Props {
  curated: SceneCurated;
  workMap: Map<string, WorkListItem>;
}

export default function CuratedSceneView({ curated, workMap }: Props) {
  return (
    <div className="space-y-10">
      {/* 導入文 */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-3">
          <span className="text-violet-400 text-lg shrink-0 mt-0.5" aria-hidden="true">
            📚
          </span>
          <p className="text-sm sm:text-base text-violet-900 leading-relaxed">{curated.intro}</p>
        </div>
        <p className="mt-3 text-xs text-violet-400 text-right">
          {curated.allCandidatesCount
            ? `${curated.allCandidatesCount}件の候補から ${curated.selectedCount}件を厳選`
            : `${curated.selectedCount}件を厳選`}
        </p>
      </div>

      {/* セクション */}
      {curated.sections.map((section) => {
        const sectionItems = section.items
          .map((item) => {
            const work = workMap.get(item.workId);
            if (!work) return null;
            return { item, work };
          })
          .filter((x): x is { item: CuratedItem; work: WorkListItem } => x !== null);

        if (sectionItems.length === 0) return null;

        return (
          <section key={section.title}>
            {/* セクションヘッダー */}
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1 h-5 bg-violet-500 rounded-full shrink-0" aria-hidden="true" />
              <h2 className="text-base sm:text-lg font-bold text-stone-800">{section.title}</h2>
            </div>

            {/* カードリスト */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sectionItems.map(({ item, work }) => (
                <CuratedCard key={item.workId} item={item} work={work} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
