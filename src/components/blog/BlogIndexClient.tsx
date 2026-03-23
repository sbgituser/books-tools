"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogMeta } from "@/lib/blog";

// タグ → ツールカテゴリのマッピング
const TOOL_CATEGORIES = [
  {
    id: "mood",
    label: "気分で探す",
    toolHref: "/manga/mood",
    tags: ["気分で探す", "泣ける漫画", "感動漫画", "考えさせられる小説", "癒やし 小説"],
    color: "rose",
  },
  {
    id: "scene",
    label: "シーンで探す",
    toolHref: "/scene",
    tags: ["シーンで探す", "通勤 本", "通学 本", "寝る前 本", "就寝前 読書", "移動中 読書"],
    color: "sky",
  },
  {
    id: "media",
    label: "映像から原作",
    toolHref: "/tools/media-originals",
    tags: ["映像から原作", "映画 原作 小説", "アニメ 原作", "ドラマ 原作 漫画", "映像化作品"],
    color: "violet",
  },
  {
    id: "theme",
    label: "テーマから学ぶ",
    toolHref: "/tools/trend-books",
    tags: ["テーマから学ぶ", "AI 本 おすすめ", "経済 本 初心者", "テクノロジー"],
    color: "emerald",
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
