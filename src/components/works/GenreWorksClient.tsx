"use client";

/**
 * GenreWorksClient.tsx
 * /genre/[l2Id] ページのクライアントコンポーネント。
 * 漫画/小説タブ、表示件数の「もっと見る」を担当する。
 */

import { useState, useMemo } from "react";
import WorkCard from "./WorkCard";
import type { WorkListItem } from "@/types/work";

type TypeFilter = "all" | "manga" | "novel";

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "manga", label: "📖 漫画" },
  { value: "novel", label: "📕 小説" },
];

const INITIAL_COUNT = 24;
const LOAD_MORE_COUNT = 24;

interface Props {
  works: WorkListItem[];
}

export default function GenreWorksClient({ works }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const hasBothTypes = useMemo(() => {
    const types = new Set(works.map((w) => w.type));
    return types.size > 1;
  }, [works]);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return works;
    return works.filter((w) => w.type === typeFilter);
  }, [works, typeFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      {/* タブ（漫画・小説が混在する場合のみ） */}
      {hasBothTypes && (
        <div className="flex gap-2 mb-6 justify-center">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setTypeFilter(tab.value);
                setVisibleCount(INITIAL_COUNT);
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                typeFilter === tab.value
                  ? "bg-amber-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 作品グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((work) => (
          <WorkCard key={work.workId} work={work} />
        ))}
      </div>

      {/* もっと見る */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
            className="px-6 py-3 text-sm font-semibold rounded-full bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-800 transition-colors"
          >
            もっと見る（残り {filtered.length - visibleCount} 作品）
          </button>
        </div>
      )}

      {/* 件数表示 */}
      <p className="text-center text-xs text-stone-400 mt-4">
        {filtered.length}作品中 {Math.min(visibleCount, filtered.length)}件を表示
      </p>
    </div>
  );
}
