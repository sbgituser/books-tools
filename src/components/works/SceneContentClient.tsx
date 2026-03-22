"use client";

/**
 * SceneContentClient.tsx
 *
 * /scene/[slug] ページのインタラクティブ部分。
 * 漫画/小説/すべてタブ切り替えと、AI選書 / 全件一覧の表示を担当する。
 *
 * SSGページ（server component）からシリアライズ可能なpropsを受け取り、
 * クライアントサイドでタイプフィルタリングを行う。
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import WorkCard from "./WorkCard";
import CuratedSceneView from "./CuratedSceneView";
import type { WorkListItem } from "@/types/work";
import type { SceneCurated } from "@/types/scene-curated";

type TypeFilter = "all" | "manga" | "novel";

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: "all",   label: "すべて" },
  { value: "manga", label: "📖 漫画" },
  { value: "novel", label: "📕 小説" },
];

interface Props {
  curated: SceneCurated | null;
  works: WorkListItem[];
}

export default function SceneContentClient({ curated, works }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const handleTypeChange = useCallback((t: TypeFilter) => {
    setTypeFilter(t);
    setShowAll(false);
  }, []);

  const hasCurated = curated !== null && curated.sections.length > 0;

  // タイプフィルタ適用
  const filteredWorks = typeFilter === "all"
    ? works
    : works.filter((w) => w.type === typeFilter);

  // curated 用 workMap（タイプフィルタ適用済み）
  const workMap = new Map<string, WorkListItem>(
    filteredWorks.map((w) => [w.workId, w])
  );

  return (
    <>
      {/* ── タイプタブ ── */}
      <div className="flex gap-2 mb-8">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTypeChange(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              typeFilter === tab.value
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── メインコンテンツ ── */}
      {hasCurated && !showAll ? (
        /* ── AI選書ビュー（主役） ── */
        <>
          {filteredWorks.length === 0 && typeFilter !== "all" && (
            <p className="text-sm text-stone-400 text-center mb-6">
              {typeFilter === "manga" ? "漫画" : "小説"}の選書結果がありません。「すべて」タブでご覧ください。
            </p>
          )}
          <CuratedSceneView curated={curated!} workMap={workMap} />
          {/* 全作品ボタン */}
          {filteredWorks.length > 0 && (
            <div className="text-center mt-10">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-500 hover:text-violet-600 hover:border-violet-300 rounded-full text-sm transition-colors"
              >
                <span>このシーンの全作品を見る（{filteredWorks.length}件）</span>
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          )}
        </>
      ) : hasCurated && showAll ? (
        /* ── 全件一覧（AI選書あり・展開時） ── */
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              以下はルールベースで抽出した全候補作品です（選書とは評価基準が異なります）
            </p>
            <button
              onClick={() => setShowAll(false)}
              className="text-xs text-violet-500 hover:underline shrink-0 ml-4"
            >
              ← 選書に戻る
            </button>
          </div>
          {filteredWorks.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-sm">この条件に合う作品はありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredWorks.map((work) => (
                <WorkCard key={work.workId} work={work} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── フォールバック: curated なし ── */
        filteredWorks.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-sm mb-4">このシーンに合う作品は現在準備中です</p>
            <Link href="/discover" className="text-sm text-violet-600 hover:underline">
              気分タグから探してみる →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredWorks.map((work) => (
              <WorkCard key={work.workId} work={work} />
            ))}
          </div>
        )
      )}
    </>
  );
}
