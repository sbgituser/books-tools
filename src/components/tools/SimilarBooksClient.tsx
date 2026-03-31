"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { buildAmazonUrl } from "@/data/products";

// ── 型定義 ──────────────────────────────────────────────────

interface SimilarToItem {
  workId: string;
  fileId: string;
  title: string;
  author: string;
  type: string;
  reason: string;
  groupType: "same_author" | "same_publisher" | "similar_taste";
}

interface SimilarIndexItem {
  workId: string;
  fileId: string;
  title: string;
  author: string;
  type: string;
  similarTo: SimilarToItem[];
}

interface SimilarIndex {
  works: SimilarIndexItem[];
  generatedAt: string;
}

// ── 定数 ────────────────────────────────────────────────────

const QUICK_CHIPS = [
  "東野圭吾",
  "村上春樹",
  "ワンピース",
  "鬼滅の刃",
  "進撃の巨人",
  "宮部みゆき",
  "百年の孤独",
  "容疑者Xの献身",
];

const GROUP_TYPE_CONFIG = {
  same_author: { label: "同じ作者", badgeClass: "bg-blue-100 text-blue-700" },
  same_publisher: { label: "同じ出版社", badgeClass: "bg-green-100 text-green-700" },
  similar_taste: { label: "読み味が近い", badgeClass: "bg-violet-100 text-violet-700" },
} as const;

const TYPE_CONFIG = {
  novel: { label: "小説", badgeClass: "bg-orange-100 text-orange-700" },
  manga: { label: "漫画", badgeClass: "bg-pink-100 text-pink-700" },
  other: { label: "その他", badgeClass: "bg-stone-100 text-stone-600" },
} as const;

function getTypeCfg(type: string) {
  if (type === "novel") return TYPE_CONFIG.novel;
  if (type === "manga") return TYPE_CONFIG.manga;
  return TYPE_CONFIG.other;
}

// ── サブコンポーネント ────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const cfg = getTypeCfg(type);
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
      {cfg.label}
    </span>
  );
}

function GroupTypeBadge({ groupType }: { groupType: SimilarToItem["groupType"] }) {
  const cfg = GROUP_TYPE_CONFIG[groupType] ?? GROUP_TYPE_CONFIG.similar_taste;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
      {cfg.label}
    </span>
  );
}

function SimilarWorkCard({ item }: { item: SimilarToItem }) {
  const amazonUrl = buildAmazonUrl(`${item.title} ${item.author}`);
  const workUrl = item.fileId ? `/works/${item.fileId}` : null;

  return (
    <article className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TypeBadge type={item.type} />
          <GroupTypeBadge groupType={item.groupType} />
        </div>
      </div>
      <p className="text-sm font-bold text-stone-900 leading-snug mb-0.5">{item.title}</p>
      {item.author && (
        <p className="text-xs text-stone-500 mb-2">{item.author}</p>
      )}
      {item.reason && (
        <p className="text-xs text-stone-500 leading-relaxed mb-3 line-clamp-2">{item.reason}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <span aria-hidden="true">🛒</span>
          Amazonで見る
        </a>
        {workUrl && (
          <Link
            href={workUrl}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
          >
            <span aria-hidden="true">📖</span>
            詳細を見る
          </Link>
        )}
      </div>
    </article>
  );
}

function SelectedWorkCard({ work }: { work: SimilarIndexItem }) {
  return (
    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-6">
      <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-1">選択中の作品</p>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-stone-900 mb-0.5">{work.title}</p>
          {work.author && <p className="text-sm text-stone-600">{work.author}</p>}
          <div className="mt-1.5">
            <TypeBadge type={work.type} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-violet-600">{work.similarTo.length}</p>
          <p className="text-xs text-stone-500">件の類似作品</p>
        </div>
      </div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────

export default function SimilarBooksClient() {
  const [index, setIndex] = useState<SimilarIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedWork, setSelectedWork] = useState<SimilarIndexItem | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "novel" | "manga">("all");
  const [groupFilter, setGroupFilter] = useState<"all" | "same_author" | "same_publisher" | "similar_taste">("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // データ取得
  useEffect(() => {
    fetch("/data/similar-index.json")
      .then((res) => {
        if (!res.ok) throw new Error("データの取得に失敗しました");
        return res.json() as Promise<SimilarIndex>;
      })
      .then((data) => {
        setIndex(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
        setLoading(false);
      });
  }, []);

  // サジェスト候補
  const suggestions = useMemo(() => {
    if (!index || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return index.works
      .filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.author.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [index, query]);

  // 類似作品（フィルタ適用後）
  const filteredSimilar = useMemo(() => {
    if (!selectedWork) return [];
    return selectedWork.similarTo.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (groupFilter !== "all" && item.groupType !== groupFilter) return false;
      return true;
    });
  }, [selectedWork, typeFilter, groupFilter]);

  const handleChipClick = useCallback((chip: string) => {
    setQuery(chip);
    setShowSuggestions(true);
    inputRef.current?.focus();
  }, []);

  const handleSuggestionClick = useCallback((work: SimilarIndexItem) => {
    setQuery(work.title);
    setSelectedWork(work);
    setShowSuggestions(false);
    setTypeFilter("all");
    setGroupFilter("all");
  }, []);

  const handleReset = useCallback(() => {
    setQuery("");
    setSelectedWork(null);
    setShowSuggestions(false);
    setTypeFilter("all");
    setGroupFilter("all");
    inputRef.current?.focus();
  }, []);

  // 外クリックでサジェスト閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasQuery = query.trim().length > 0;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">📚</div>
        <p className="text-stone-500 text-sm">データを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
        <p className="text-stone-700 font-semibold mb-1">データの読み込みに失敗しました</p>
        <p className="text-sm text-stone-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* 検索エリア */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        {/* 検索ボックス */}
        <div className="relative">
          <label htmlFor="similar-search" className="sr-only">
            好きな本のタイトルを入力
          </label>
          <div className="relative flex items-center">
            <span
              className="absolute left-4 text-stone-400 text-lg pointer-events-none"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              ref={inputRef}
              id="similar-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedWork(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              placeholder="好きな本のタイトルを入力..."
              className="w-full pl-12 pr-12 py-4 text-sm sm:text-base rounded-2xl border-2 border-stone-200 focus:border-violet-400 focus:outline-none shadow-sm bg-white placeholder:text-stone-400 transition-colors"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="similar-suggestions"
              aria-expanded={showSuggestions && suggestions.length > 0}
            />
            {hasQuery && (
              <button
                onClick={handleReset}
                className="absolute right-4 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="検索をクリア"
              >
                ✕
              </button>
            )}
          </div>

          {/* サジェストドロップダウン */}
          {showSuggestions && suggestions.length > 0 && !selectedWork && (
            <div
              ref={suggestionsRef}
              id="similar-suggestions"
              role="listbox"
              className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden"
            >
              {suggestions.map((work) => {
                const typeCfg = getTypeCfg(work.type);
                return (
                  <button
                    key={work.workId}
                    role="option"
                    aria-selected="false"
                    onClick={() => handleSuggestionClick(work)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 text-left transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-stone-800 block truncate">
                        {work.title}
                      </span>
                      {work.author && (
                        <span className="text-xs text-stone-400 truncate block">
                          {work.author}
                        </span>
                      )}
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${typeCfg.badgeClass}`}>
                      {typeCfg.label}
                    </span>
                    <span className="shrink-0 text-xs text-stone-400">
                      類似 {work.similarTo.length}件
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* クイック検索チップ（非検索時のみ） */}
        {!hasQuery && (
          <div className="mt-4">
            <p className="text-xs text-stone-400 font-medium mb-2">人気の検索</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 検索結果エリア */}
      {selectedWork && (
        <section className="max-w-4xl mx-auto px-4 pb-12">
          {/* 選択中の作品カード */}
          <SelectedWorkCard work={selectedWork} />

          {/* フィルター */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* ジャンルフィルター */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 font-medium">ジャンル:</span>
              {(["all", "novel", "manga"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setTypeFilter(v)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                    typeFilter === v
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-violet-300 hover:text-violet-700"
                  }`}
                >
                  {v === "all" ? "すべて" : v === "novel" ? "小説のみ" : "漫画のみ"}
                </button>
              ))}
            </div>
            {/* 類似タイプフィルター */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 font-medium">種別:</span>
              {(["all", "same_author", "same_publisher", "similar_taste"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setGroupFilter(v)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                    groupFilter === v
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-violet-300 hover:text-violet-700"
                  }`}
                >
                  {v === "all"
                    ? "すべて"
                    : v === "same_author"
                    ? "同じ作者"
                    : v === "same_publisher"
                    ? "同じ出版社"
                    : "読み味が近い"}
                </button>
              ))}
            </div>
          </div>

          {/* 件数表示 */}
          <p className="text-sm text-stone-500 mb-4">
            <span className="font-semibold text-stone-800">「{selectedWork.title}」</span>
            {" "}に似た作品:{" "}
            <span className="font-semibold text-violet-700">{filteredSimilar.length}件</span>
          </p>

          {/* 類似作品グリッド */}
          {filteredSimilar.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3" aria-hidden="true">🔎</div>
              <p className="text-stone-600 font-semibold mb-1">条件に合う作品が見つかりませんでした</p>
              <p className="text-sm text-stone-500">フィルターを変更してみてください</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredSimilar.map((item, idx) => (
                <SimilarWorkCard key={`${item.workId}-${idx}`} item={item} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 検索前の案内（初期状態） */}
      {!hasQuery && !selectedWork && (
        <section className="border-t border-stone-200 bg-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-6 text-center">
              使い方
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: "1", icon: "🔍", title: "タイトルを入力", desc: "好きな本・漫画のタイトルか著者名を検索" },
                { step: "2", icon: "📋", title: "作品を選択", desc: "サジェストから読みたい作品を選ぶ" },
                { step: "3", icon: "📚", title: "類似作品を確認", desc: "テーマ・トーン・読み味が近い作品を発見" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col items-center text-center gap-3 rounded-xl border border-stone-200 p-5"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center">
                    {item.step}
                  </div>
                  <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-stone-800 mb-1">{item.title}</p>
                    <p className="text-xs text-stone-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 text-center">
                関連ツール
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/tools/literary-awards"
                  className="flex flex-col gap-2 rounded-xl border border-stone-200 p-4 hover:border-violet-300 hover:bg-violet-50 transition-all"
                >
                  <span className="text-2xl" aria-hidden="true">🏆</span>
                  <div>
                    <p className="text-sm font-bold text-stone-800">文学賞受賞作データベース</p>
                    <p className="text-xs text-stone-500 mt-0.5">直木賞・芥川賞など10賞の受賞作を検索</p>
                  </div>
                </Link>
                <Link
                  href="/discover"
                  className="flex flex-col gap-2 rounded-xl border border-stone-200 p-4 hover:border-violet-300 hover:bg-violet-50 transition-all"
                >
                  <span className="text-2xl" aria-hidden="true">💡</span>
                  <div>
                    <p className="text-sm font-bold text-stone-800">気分で本を選ぶ</p>
                    <p className="text-xs text-stone-500 mt-0.5">読みたい体験から本を逆引き</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
