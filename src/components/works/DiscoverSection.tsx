"use client";

import { useState, useEffect, useCallback } from "react";
import WorkCard from "./WorkCard";
import type { WorkListItem, DiscoveryIndex } from "@/types/work";

// ── 表示順序つきタグ定義 ─────────────────────────────────────────

const TAG_DISPLAY_ORDER = [
  { tag: "泣ける", icon: "😢" },
  { tag: "感動", icon: "🥺" },
  { tag: "切ない", icon: "💔" },
  { tag: "熱い", icon: "🔥" },
  { tag: "爽快", icon: "⚡" },
  { tag: "笑える", icon: "😄" },
  { tag: "癒やし", icon: "🌿" },
  { tag: "怖い", icon: "👻" },
  { tag: "ダーク", icon: "🌑" },
  { tag: "前向き", icon: "☀️" },
  { tag: "心温まる", icon: "💕" },
  { tag: "考えさせられる", icon: "🧠" },
  { tag: "知的", icon: "🔬" },
  { tag: "一気読み", icon: "📖" },
  { tag: "読みやすい", icon: "😌" },
  { tag: "世界観重視", icon: "🌍" },
  { tag: "やる気が出る", icon: "🚀" },
  { tag: "日常系", icon: "🏡" },
  { tag: "ファンタジー", icon: "🦄" },
  { tag: "バトル", icon: "⚔️" },
  { tag: "深い", icon: "🗿" },
  { tag: "明るい", icon: "🌟" },
  { tag: "穏やか", icon: "🍃" },
  { tag: "完結", icon: "✅" },
];

function getTagIcon(tag: string): string {
  return TAG_DISPLAY_ORDER.find((t) => t.tag === tag)?.icon ?? "✦";
}

const PAGE_SIZE = 12;

interface Props {
  /** 絞り込むタイプ。undefined = 全て */
  defaultType?: "manga" | "novel";
}

export default function DiscoverSection({ defaultType }: Props) {
  const [index, setIndex] = useState<DiscoveryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "manga" | "novel">(
    defaultType ?? "all"
  );
  const [page, setPage] = useState(1);

  // URL クエリパラメータ（?tag=xxx&type=manga）を初期値に反映
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tag");
    const type = params.get("type") as "manga" | "novel" | null;
    if (tag) setSelectedTag(tag);
    if (type === "manga" || type === "novel") setTypeFilter(type);
  }, []);

  // discovery-index.json をフェッチ
  useEffect(() => {
    fetch("/data/discovery-index.json")
      .then((r) => r.json())
      .then((data: DiscoveryIndex) => {
        setIndex(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // フィルタリングされた作品一覧
  const filtered: WorkListItem[] = (() => {
    if (!index) return [];
    let works = Object.values(index.works);
    if (typeFilter !== "all") works = works.filter((w) => w.type === typeFilter);
    if (selectedTag) {
      const ids = new Set(index.tagIndex[selectedTag] ?? []);
      works = works.filter((w) => ids.has(w.workId));
    }
    return works;
  })();

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTagClick = useCallback(
    (tag: string) => {
      setSelectedTag((prev) => (prev === tag ? null : tag));
      setPage(1);
    },
    []
  );

  const handleTypeChange = useCallback((type: "all" | "manga" | "novel") => {
    setTypeFilter(type);
    setPage(1);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-stone-400 text-sm">読み込み中...</div>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="text-center py-12 text-stone-400 text-sm">
        データを読み込めませんでした
      </div>
    );
  }

  // 表示するタグ：定義順 → それ以外のタグ（カウント降順）
  const orderedTags: string[] = [
    ...TAG_DISPLAY_ORDER.map((t) => t.tag).filter((t) => index.availableTags.includes(t)),
    ...index.availableTags.filter((t) => !TAG_DISPLAY_ORDER.some((d) => d.tag === t)),
  ];

  return (
    <div>
      {/* タイプ切り替え */}
      <div className="flex gap-2 mb-6">
        {(["all", "manga", "novel"] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              typeFilter === t
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {t === "all" ? "すべて" : t === "manga" ? "📖 漫画" : "📕 小説"}
          </button>
        ))}
      </div>

      {/* タグパネル */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          気分・雰囲気で絞り込む
        </p>
        <div className="flex flex-wrap gap-2">
          {orderedTags.map((tag) => {
            const count = (index.tagIndex[tag] ?? []).length;
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-rose-500 text-white shadow-md scale-105"
                    : "bg-white border border-stone-200 text-stone-700 hover:border-rose-400 hover:text-rose-700 hover:shadow-sm"
                }`}
              >
                <span aria-hidden="true">{getTagIcon(tag)}</span>
                <span>{tag}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-white/30 text-white" : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedTag && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-stone-600">
              <span className="font-bold text-rose-600">「{selectedTag}」</span>
              の作品{" "}
              <span className="font-bold">{filtered.length}件</span>
            </span>
            <button
              onClick={() => { setSelectedTag(null); setPage(1); }}
              className="text-xs text-stone-400 hover:text-stone-600 underline"
            >
              絞り込みをクリア
            </button>
          </div>
        )}
      </div>

      {/* 作品グリッド */}
      {currentPage.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">条件に合う作品が見つかりませんでした</p>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="mt-3 text-sm text-rose-500 hover:underline"
            >
              絞り込みをクリア
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {currentPage.map((work) => (
              <WorkCard
                key={work.workId}
                work={work}
                highlightTags={selectedTag ? [selectedTag] : []}
              />
            ))}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm border border-stone-200 text-stone-600 hover:border-rose-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← 前へ
              </button>
              <span className="text-sm text-stone-500">
                {page} / {totalPages}
                <span className="ml-2 text-stone-400">({filtered.length}件)</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm border border-stone-200 text-stone-600 hover:border-rose-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                次へ →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
