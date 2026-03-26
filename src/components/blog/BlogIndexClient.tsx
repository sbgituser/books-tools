"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogMeta } from "@/lib/blog";

// タグ → ジャンルカテゴリのマッピング
const TOOL_CATEGORIES = [
  {
    id: "mystery",
    label: "ミステリー・推理",
    toolHref: "/genre",
    tags: ["ミステリー", "日本ミステリー", "本格ミステリー", "ミステリー小説", "推理小説", "推理", "社会派ミステリー", "海外ミステリー", "どんでん返し", "謎解き小説", "密室ミステリー", "心理ミステリー", "イヤミス", "イヤミス小説", "サスペンス", "サスペンス小説", "心理サスペンス", "ミステリー漫画", "謎解き漫画", "推理漫画"],
    color: "rose",
  },
  {
    id: "manga",
    label: "漫画",
    toolHref: "/manga/mood",
    tags: ["漫画", "おすすめ漫画", "少年漫画", "泣ける漫画", "日常系漫画", "恋愛漫画", "冒険漫画", "ファンタジー漫画", "バトル漫画", "大人向け漫画", "コメディ漫画", "ホラー漫画", "サスペンス漫画", "心理戦漫画", "グルメ漫画", "料理漫画", "お仕事漫画", "スポーツ漫画", "青年漫画", "少女漫画", "女性向け漫画", "社会人漫画", "癒やし漫画", "癒し漫画", "ほのぼの漫画", "1巻完結漫画", "短編漫画", "一気読み漫画", "転生漫画", "異世界漫画", "SF漫画", "ドラマ漫画", "ストーリー漫画", "面白い漫画", "漫画おすすめ", "漫画ガイド", "マンガ", "完結済み"],
    color: "sky",
  },
  {
    id: "sf-fantasy",
    label: "SF・ファンタジー",
    toolHref: "/genre",
    tags: ["SF小説", "海外SF", "SF", "SF作家", "ファンタジー", "ファンタジー小説", "異世界小説", "異世界", "ダークファンタジー", "タイムトラベル小説", "ディストピア小説", "サイバーパンク", "冒険", "冒険小説"],
    color: "violet",
  },
  {
    id: "novel",
    label: "小説・文学",
    toolHref: "/discover",
    tags: ["おすすめ小説", "小説", "日本文学", "文学", "人間ドラマ", "感動", "恋愛", "青春小説", "青春文学", "家族小説", "社会派小説", "歴史小説", "時代小説", "海外小説", "海外文学", "短編小説", "短編集", "エンタメ小説", "お仕事小説", "社会人小説", "感動小説", "ホラー小説", "怖い小説", "怪談小説"],
    color: "emerald",
  },
  {
    id: "guide",
    label: "読書ガイド・入門",
    toolHref: "/tools/trend-books",
    tags: ["初心者向け", "読書初心者", "読書", "読む順番", "読書術", "読書習慣", "本選び", "本の選び方", "読書のコツ", "読書スランプ", "テーマから学ぶ", "テクノロジー", "AI 本 おすすめ", "経済 本 初心者", "ビジネス書", "自己啓発", "教養", "作家別ガイド", "ガイド", "ジャンル別"],
    color: "amber",
  },
] as const;

type CategoryId = (typeof TOOL_CATEGORIES)[number]["id"] | "all";

const COLOR_MAP = {
  rose: {
    chip: "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100",
    active: "bg-rose-600 text-white border-rose-600",
    badge: "bg-rose-50 text-rose-700",
  },
  sky: {
    chip: "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100",
    active: "bg-sky-600 text-white border-sky-600",
    badge: "bg-sky-50 text-sky-700",
  },
  violet: {
    chip: "bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100",
    active: "bg-violet-600 text-white border-violet-600",
    badge: "bg-violet-50 text-violet-700",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
    active: "bg-emerald-600 text-white border-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
  },
  amber: {
    chip: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
    active: "bg-amber-600 text-white border-amber-600",
    badge: "bg-amber-50 text-amber-700",
  },
} as const;

function getPostCategory(post: BlogMeta): (typeof TOOL_CATEGORIES)[number] | null {
  for (const cat of TOOL_CATEGORIES) {
    if (post.tags.some((tag) => cat.tags.includes(tag as never))) {
      return cat;
    }
  }
  return null;
}

function formatDateLabel(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  posts: BlogMeta[];
}

export default function BlogIndexClient({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((post) => {
          const cat = getPostCategory(post);
          return cat?.id === activeCategory;
        });

  return (
    <div>
      {/* カテゴリフィルタチップ */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-stone-800 text-white border-stone-800"
              : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
          }`}
        >
          すべて（{posts.length}件）
        </button>
        {TOOL_CATEGORIES.map((cat) => {
          const count = posts.filter((p) => getPostCategory(p)?.id === cat.id).length;
          if (count === 0) return null;
          const colors = COLOR_MAP[cat.color];
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                isActive ? colors.active : colors.chip
              }`}
            >
              {cat.label}（{count}件）
            </button>
          );
        })}
      </div>

      {/* アクティブカテゴリのツールリンク */}
      {activeCategory !== "all" && (
        <div className="mb-5">
          {TOOL_CATEGORIES.filter((c) => c.id === activeCategory).map((cat) => {
            const colors = COLOR_MAP[cat.color];
            return (
              <Link
                key={cat.id}
                href={cat.toolHref}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${colors.chip} font-medium`}
              >
                → {cat.label}のツールを使う
              </Link>
            );
          })}
        </div>
      )}

      {/* 記事グリッド */}
      {filteredPosts.length === 0 ? (
        <div className="border border-dashed border-stone-300 rounded-xl p-6 text-sm text-stone-500">
          この条件の記事はまだありません。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPosts.map((post) => {
            const postCat = getPostCategory(post);
            return (
              <article
                key={post.slug}
                className="border border-stone-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <time dateTime={post.date}>{formatDateLabel(post.date)}</time>
                    <span>・{post.readingText}</span>
                  </div>
                  {postCat && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${COLOR_MAP[postCat.color].badge}`}
                    >
                      {postCat.label}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-stone-900 mb-2 leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:text-amber-700">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-stone-600 mb-3 line-clamp-2">{post.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
