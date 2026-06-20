/**
 * seo-protected-pages.ts
 *
 * GA4 で表示回数・アクティブユーザー実績があるページ、およびユーザーが明示的に
 * 保護対象として指定したページの一覧。
 *
 * ここに登録されたページは SEO 整理（noindex / canonical統合 / redirect / 削除 /
 * sitemap除外 / slug変更）の対象から「絶対に」除外される。
 *
 * 判定は src/lib/seoPolicy.ts が一元的に行い、ビルド時・seo:audit時に
 * 違反（protected なのに noindex 等）を検出して警告する。
 *
 * 出典: GA4 実績データ（2026/5/23-6/19）および T-1180 タスク指定。
 */

export type ProtectedReason = {
  /** GA4 表示回数（分かっている場合） */
  impressions?: number;
  /** GA4 アクティブユーザー（分かっている場合） */
  users?: number;
  /** 保護理由のメモ */
  note: string;
};

export type ProtectedBlogPage = {
  /** ブログ記事の slug（frontmatter の slug フィールドと一致） */
  slug: string;
  /** 人間可読のタイトル（照合・レポート用） */
  title: string;
  reason: ProtectedReason;
};

export type ProtectedPathPage = {
  /** サイト内パス（例: "/", "/discover"） */
  path: string;
  title: string;
  reason: ProtectedReason;
};

/**
 * 保護対象ブログ記事。
 * GA4 で表示回数 / アクティブユーザー実績があるため、index 維持・内容強化の対象。
 */
export const PROTECTED_BLOG_PAGES: ProtectedBlogPage[] = [
  {
    slug: "2026-adaptation-original-books",
    title: "2026年映像化決定・公開予定の原作本一覧",
    reason: {
      impressions: 290,
      users: 218,
      note: "GA4で最多の流入。SEO整理時にnoindex/redirect/canonical統合しない。",
    },
  },
  {
    slug: "movie-adapted-novels",
    title: "映画化・映像化された小説おすすめ30選",
    reason: {
      impressions: 42,
      users: 37,
      note: "GA4で表示回数・アクティブユーザー実績あり。SEO整理時にnoindex/redirect/canonical統合しない。",
    },
  },
  {
    slug: "trending-novels-2026",
    title: "2026年 今話題の小説おすすめ20選",
    reason: {
      impressions: 26,
      users: 22,
      note: "GA4で表示回数・アクティブユーザー実績あり。SEO整理時にnoindex/redirect/canonical統合しない。",
    },
  },
  {
    slug: "philosophical-novels",
    title: "哲学的な小説おすすめ15選",
    reason: {
      impressions: 20,
      users: 16,
      note: "GA4で表示回数・アクティブユーザー実績あり。SEO整理時にnoindex/redirect/canonical統合しない。",
    },
  },
];

/**
 * 保護対象パス（ブログ以外）。
 * トップページなど、GA4実績または主要導線として保護する。
 */
export const PROTECTED_PATH_PAGES: ProtectedPathPage[] = [
  {
    path: "/",
    title: "Books Discover トップページ",
    reason: {
      impressions: 38,
      users: 37,
      note: "GA4実績あり。サイトの起点。常に index・sitemap掲載・自己参照canonical。",
    },
  },
  {
    path: "/discover",
    title: "Books Discover",
    reason: { note: "主要導線。気分・シーンで本を探すツール型トップ。" },
  },
];

const PROTECTED_BLOG_SLUGS = new Set(PROTECTED_BLOG_PAGES.map((p) => p.slug));
const PROTECTED_PATHS = new Set(PROTECTED_PATH_PAGES.map((p) => p.path));

/** 指定 slug のブログ記事が保護対象か */
export function isProtectedBlogSlug(slug: string): boolean {
  return PROTECTED_BLOG_SLUGS.has(slug);
}

/** 指定パスが保護対象か（末尾スラッシュは無視） */
export function isProtectedPath(path: string): boolean {
  const normalized =
    path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
  return PROTECTED_PATHS.has(normalized);
}

/** ブログ slug に対応する保護理由を返す（なければ undefined） */
export function getProtectedBlogReason(
  slug: string,
): ProtectedReason | undefined {
  return PROTECTED_BLOG_PAGES.find((p) => p.slug === slug)?.reason;
}
