"use client";

/**
 * DiscoverSection.tsx
 *
 * 「発見する」ページのメインUI。
 *
 * 流れ:
 *   1. ムード選択（8つの読書気分カード）
 *   2. AI選書（curated）表示 ← 主役
 *   3. 「全作品を見る」— 補助導線
 *
 * curated データは選択時に /data/discover-curated/{slug}.json を fetch する。
 * curated が未生成のムードは全件一覧で表示する。
 */

import { useState, useEffect, useCallback } from "react";
import WorkCard from "./WorkCard";
import CuratedDiscoverView from "./CuratedDiscoverView";
import { DISCOVER_MOODS } from "@/constants/discoverMoods";
import type { WorkListItem, DiscoveryIndex } from "@/types/work";
import type { DiscoverCurated } from "@/types/discover-curated";

// ── 型 ────────────────────────────────────────────────────────────

type LoadState = "idle" | "loading" | "loaded" | "error";

// ── メインコンポーネント ──────────────────────────────────────────

export default function DiscoverSection() {
  // 選択中のムード slug
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  // discovery-index (全件一覧 + タグ → workIds)
  const [index, setIndex] = useState<DiscoveryIndex | null>(null);

  // AI選書データ (slug → DiscoverCurated)
  const [curatedCache, setCuratedCache] = useState<Map<string, DiscoverCurated | null>>(new Map());
  const [curatedState, setCuratedState] = useState<LoadState>("idle");

  // 全件一覧表示フラグ
  const [showAll, setShowAll] = useState(false);

  // URL クエリ初期値
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mood = params.get("mood");
    if (mood && DISCOVER_MOODS.some((m) => m.slug === mood)) {
      setSelectedSlug(mood);
    }
  }, []);

  // discovery-index fetch（全件一覧用）
  useEffect(() => {
    fetch("/data/discovery-index.json")
      .then((r) => r.json())
      .then((data: DiscoveryIndex) => setIndex(data))
      .catch(() => {/* silently fail — curated view works without it */});
  }, []);

  // ムード選択時に curated JSON を fetch
  useEffect(() => {
    if (!selectedSlug) return;
    if (curatedCache.has(selectedSlug)) return; // キャッシュ済み

    setCuratedState("loading");
    fetch(`/data/discover-curated/${selectedSlug}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json() as Promise<DiscoverCurated>;
      })
      .then((data) => {
        setCuratedCache((prev) => new Map(prev).set(selectedSlug, data));
        setCuratedState("loaded");
      })
      .catch(() => {
        // curated データなし → null をキャッシュして全件一覧にフォールバック
        setCuratedCache((prev) => new Map(prev).set(selectedSlug, null));
        setCuratedState("error");
      });
  }, [selectedSlug, curatedCache]);

  // ムード選択ハンドラー
  const handleSelectMood = useCallback((slug: string) => {
    if (selectedSlug === slug) {
      // 同じムードを再クリック → 解除
      setSelectedSlug(null);
      setShowAll(false);
      return;
    }
    setSelectedSlug(slug);
    setShowAll(false);
  }, [selectedSlug]);

  // 選択中ムードのデータ
  const selectedMood = DISCOVER_MOODS.find((m) => m.slug === selectedSlug) ?? null;
  const curatedData = selectedSlug ? (curatedCache.get(selectedSlug) ?? null) : null;

  // 全件一覧: 選択ムードのタグに合致する作品
  const allFiltered: WorkListItem[] = (() => {
    if (!index || !selectedMood) return [];
    const matchedIds = new Set<string>();
    for (const tag of selectedMood.tags) {
      for (const id of index.tagIndex[tag] ?? []) {
        matchedIds.add(id);
      }
    }
    return Object.values(index.works).filter((w) => matchedIds.has(w.workId));
  })();

  // curated 用 workMap
  const workMap = new Map<string, WorkListItem>(
    allFiltered.map((w) => [w.workId, w])
  );

  return (
    <div>
      {/* ── ムード選択グリッド ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
          今の気分を選ぶ
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DISCOVER_MOODS.map((mood) => {
            const isSelected = selectedSlug === mood.slug;
            return (
              <button
                key={mood.slug}
                onClick={() => handleSelectMood(mood.slug)}
                className={`flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-center transition-all ${
                  isSelected
                    ? "bg-rose-500 text-white shadow-md scale-105"
                    : "bg-white border border-stone-200 text-stone-700 hover:border-rose-300 hover:shadow-sm hover:scale-102"
                }`}
              >
                <span className="text-2xl" aria-hidden="true">{mood.icon}</span>
                <span className="text-sm font-bold leading-tight">{mood.label}</span>
                <span className={`text-xs leading-tight ${isSelected ? "text-rose-100" : "text-stone-400"}`}>
                  {mood.description}
                </span>
              </button>
            );
          })}
        </div>

        {selectedMood && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => { setSelectedSlug(null); setShowAll(false); }}
              className="text-xs text-stone-400 hover:text-stone-600 underline"
            >
              選択を解除する
            </button>
          </div>
        )}
      </div>

      {/* ── 選択なし: ガイドテキスト ── */}
      {!selectedSlug && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-base font-medium text-stone-500 mb-2">
            今の気分を選ぶと、おすすめの本を手渡しします。
          </p>
          <p className="text-sm">
            ランキングではなく、「こんな人に」という選書です。
          </p>
        </div>
      )}

      {/* ── 選択済み: curated / ローディング / 全件 ── */}
      {selectedSlug && (
        <div>
          {curatedState === "loading" ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-stone-400 text-sm">選書中...</div>
            </div>
          ) : curatedData !== null && !showAll ? (
            /* ── AI選書ビュー（主役） ── */
            <CuratedDiscoverView
              curated={curatedData}
              workMap={workMap}
              allCount={allFiltered.length}
              onShowAll={() => setShowAll(true)}
            />
          ) : (
            /* ── 全件一覧（補助 or curated未生成時のフォールバック） ── */
            <>
              {curatedData !== null && (
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-stone-500">
                    <span className="font-bold text-stone-700">{allFiltered.length}件</span> の候補作品
                  </p>
                  <button
                    onClick={() => setShowAll(false)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    ← 選書に戻る
                  </button>
                </div>
              )}
              {allFiltered.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-sm">この気分に合う作品は準備中です</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {allFiltered.map((work) => (
                    <WorkCard key={work.workId} work={work} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
