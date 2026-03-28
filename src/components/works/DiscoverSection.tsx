"use client";

/**
 * DiscoverSection.tsx
 *
 * 「気分で選ぶ」ページのメインUI。
 *
 * 流れ:
 *   1. 漫画/小説/すべてタブ
 *   2. ムード選択（8つの読書気分カード）
 *   3. AI選書（curated）表示 ← 主役
 *   4. 「全作品を見る」— 補助導線
 *
 * URLパラメータ:
 *   ?mood={slug}  - ムードを自動選択
 *   ?type={manga|novel} - タイプフィルタを自動適用
 *   ?tag={tag}    - 感情タグで絞り込み（対応するムードを自動選択 + タグフィルタ）
 */

import { useState, useEffect, useCallback } from "react";
import WorkCard from "./WorkCard";
import CuratedDiscoverView from "./CuratedDiscoverView";
import { DISCOVER_MOODS } from "@/constants/discoverMoods";
import type { WorkListItem, DiscoveryIndex } from "@/types/work";
import type { DiscoverCurated } from "@/types/discover-curated";

type LoadState = "idle" | "loading" | "loaded" | "error";
type TypeFilter = "all" | "manga" | "novel";

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: "all",   label: "すべて" },
  { value: "manga", label: "📖 漫画" },
  { value: "novel", label: "📕 小説" },
];

// 感情タグ → ムードスラグのマッピング（最初にマッチしたものを優先）
const TAG_TO_SLUG: Record<string, string> = {};
for (const mood of DISCOVER_MOODS) {
  for (const tag of mood.tags) {
    if (!TAG_TO_SLUG[tag]) TAG_TO_SLUG[tag] = mood.slug;
  }
}

export default function DiscoverSection() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [index, setIndex] = useState<DiscoveryIndex | null>(null);
  const [curatedCache, setCuratedCache] = useState<Map<string, DiscoverCurated | null>>(new Map());
  const [curatedState, setCuratedState] = useState<LoadState>("idle");
  const [showAll, setShowAll] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // URL クエリ初期値
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mood = params.get("mood");
    if (mood && DISCOVER_MOODS.some((m) => m.slug === mood)) setSelectedSlug(mood);
    const type = params.get("type") as TypeFilter | null;
    if (type === "manga" || type === "novel") setTypeFilter(type);
    // タグパラメータ: 対応するムードを自動選択してタグで絞り込む
    const tag = params.get("tag");
    if (tag) {
      setActiveTag(tag);
      const mappedSlug = TAG_TO_SLUG[tag];
      if (mappedSlug) setSelectedSlug(mappedSlug);
      setShowAll(true);
    }
  }, []);

  // discovery-index fetch
  useEffect(() => {
    fetch("/data/discovery-index.json")
      .then((r) => r.json())
      .then((data: DiscoveryIndex) => setIndex(data))
      .catch(() => {});
  }, []);

  // ムード選択時に curated JSON を fetch
  useEffect(() => {
    if (!selectedSlug) return;
    if (curatedCache.has(selectedSlug)) return;

    setCuratedState("loading");
    fetch(`/data/discover-curated/${selectedSlug}.json`)
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json() as Promise<DiscoverCurated>; })
      .then((data) => {
        setCuratedCache((prev) => new Map(prev).set(selectedSlug, data));
        setCuratedState("loaded");
      })
      .catch(() => {
        setCuratedCache((prev) => new Map(prev).set(selectedSlug, null));
        setCuratedState("error");
      });
  }, [selectedSlug, curatedCache]);

  const handleSelectMood = useCallback((slug: string) => {
    if (selectedSlug === slug) {
      setSelectedSlug(null);
      setShowAll(false);
      setActiveTag(null);
      return;
    }
    setSelectedSlug(slug);
    setShowAll(false);
    setActiveTag(null);
  }, [selectedSlug]);

  const handleTypeChange = useCallback((t: TypeFilter) => {
    setTypeFilter(t);
    setShowAll(false);
  }, []);

  const handleClearTag = useCallback(() => {
    setActiveTag(null);
    setShowAll(false);
  }, []);

  const selectedMood = DISCOVER_MOODS.find((m) => m.slug === selectedSlug) ?? null;
  const curatedData = selectedSlug ? (curatedCache.get(selectedSlug) ?? null) : null;

  // ムードに合致する全作品（タイプフィルタ前）
  const moodFiltered: WorkListItem[] = (() => {
    if (!index || !selectedMood) return [];
    const matchedIds = new Set<string>();
    for (const tag of selectedMood.tags) {
      for (const id of index.tagIndex[tag] ?? []) matchedIds.add(id);
    }
    return Object.values(index.works).filter((w) => matchedIds.has(w.workId));
  })();

  // タイプフィルタ適用後
  const allFiltered = typeFilter === "all"
    ? moodFiltered
    : moodFiltered.filter((w) => w.type === typeFilter);

  // アクティブタグによる絞り込み
  const tagFiltered: WorkListItem[] = (() => {
    if (!activeTag || !index) return allFiltered;
    if (selectedSlug) {
      // ムードの候補作品からさらに指定タグで絞り込む
      return allFiltered.filter((w) => w.discoveryTags.includes(activeTag));
    } else {
      // マッピングなし: tagIndex から直接取得してタイプフィルタ適用
      const ids = index.tagIndex[activeTag] ?? [];
      const works = ids.map((id) => index.works[id]).filter(Boolean);
      return typeFilter === "all" ? works : works.filter((w) => w.type === typeFilter);
    }
  })();

  const displayFiltered = activeTag ? tagFiltered : allFiltered;

  // curated 用 workMap（タイプフィルタ適用済み）
  const workMap = new Map<string, WorkListItem>(
    allFiltered.map((w) => [w.workId, w])
  );

  return (
    <div>
      {/* ── タイプタブ ── */}
      <div className="flex gap-2 mb-7">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTypeChange(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              typeFilter === tab.value
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                    : "bg-white border border-stone-200 text-stone-700 hover:border-rose-300 hover:shadow-sm"
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
              onClick={() => { setSelectedSlug(null); setShowAll(false); setActiveTag(null); }}
              className="text-xs text-stone-400 hover:text-stone-600 underline"
            >
              選択を解除する
            </button>
          </div>
        )}
      </div>

      {/* ── タグフィルタバッジ ── */}
      {activeTag && (
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
            「{activeTag}」で絞り込み中
            <button
              onClick={handleClearTag}
              className="ml-1 hover:text-rose-900 font-bold"
              aria-label="絞り込みを解除"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* ── 選択なし（タグなし時のみ） ── */}
      {!selectedSlug && !activeTag && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-base font-medium text-stone-500 mb-2">
            今の気分を選ぶと、おすすめの本を手渡しします。
          </p>
          <p className="text-sm">ランキングではなく、「こんな人に」という選書です。</p>
        </div>
      )}

      {/* ── 選択済み or タグフィルタあり ── */}
      {(selectedSlug || activeTag) && (
        <div>
          {activeTag ? (
            /* ── タグフィルタ時: 全件グリッド表示 ── */
            <>
              {index && (
                <div className="mb-6">
                  <p className="text-sm text-stone-500">
                    <span className="font-bold text-stone-700">{displayFiltered.length}件</span> の候補作品
                  </p>
                </div>
              )}
              {displayFiltered.length === 0 && index ? (
                <div className="text-center py-16 text-stone-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-sm">この条件に合う作品は見つかりませんでした</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {displayFiltered.map((work) => (
                    <WorkCard key={work.workId} work={work} />
                  ))}
                </div>
              )}
            </>
          ) : curatedState === "loading" ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-stone-400 text-sm">選書中...</div>
            </div>
          ) : curatedData !== null && !showAll ? (
            /* ── AI選書ビュー（主役） ── */
            <>
              {allFiltered.length === 0 && typeFilter !== "all" && (
                <p className="text-sm text-stone-400 text-center mb-6">
                  {typeFilter === "manga" ? "漫画" : "小説"}の選書結果がありません。「すべて」タブでご覧ください。
                </p>
              )}
              <CuratedDiscoverView
                curated={curatedData}
                workMap={workMap}
                allCount={allFiltered.length}
                onShowAll={() => setShowAll(true)}
              />
            </>
          ) : (
            /* ── 全件一覧 ── */
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
                  <p className="text-sm">この条件に合う作品は見つかりませんでした</p>
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
