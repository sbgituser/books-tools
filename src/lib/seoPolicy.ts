/**
 * seoPolicy.ts
 *
 * 各ページが index / protect / noindex / sitemap掲載対象 になる条件を一元管理する。
 *
 * 優先順位（上が強い）:
 *   1. protectedPages に含まれる slug/path は必ず "protect"（index・自己参照canonical・sitemap掲載）
 *   2. frontmatter seoStatus が "protect" / "index" のページは index 対象
 *   3. frontmatter seoStatus が "noindex" / "redirect" / "canonical" のページは sitemap除外
 *   4. seoStatus 未指定のブログ記事はデフォルトで "index"
 *      （T-1180方針: 流入実績の可能性があるため機械的に noindex 化しない）
 *
 * 重要ルール:
 *   - protected 対象には絶対に noindex を出さない
 *   - protected 対象の canonical を別URLへ向けない
 *   - protected 対象を sitemap から除外しない
 */

import {
  getProtectedBlogReason,
  isProtectedBlogSlug,
  isProtectedPath,
} from "../data/seo-protected-pages";

export type SeoStatus =
  | "protect"
  | "index"
  | "strengthen"
  | "noindex"
  | "canonical"
  | "redirect";

export type RobotsDirective = { index: boolean; follow: boolean };

/** seoPolicy が解釈に必要なブログ記事の最小フィールド */
export type BlogSeoInput = {
  slug: string;
  /** frontmatter で明示された seoStatus（未指定可） */
  seoStatus?: SeoStatus;
  /** canonical を別 slug に統合する場合の統合先 slug */
  canonicalSlug?: string;
  /** redirect 先の slug */
  redirectTo?: string;
};

export type BlogSeoDecision = {
  /** 最終的な seoStatus */
  status: SeoStatus;
  /** <meta name="robots"> に出す値 */
  robots: RobotsDirective;
  /** sitemap に含めるべきか */
  includeInSitemap: boolean;
  /** canonical の対象 slug（自己参照なら自分の slug） */
  canonicalSlug: string;
  /** protected 対象か */
  isProtected: boolean;
  /** 判定理由（レポート用） */
  reason: string;
};

const INDEX_FOLLOW: RobotsDirective = { index: true, follow: true };
const NOINDEX_FOLLOW: RobotsDirective = { index: false, follow: true };

/**
 * ブログ記事の SEO 方針を決定する。
 */
export function resolveBlogSeo(input: BlogSeoInput): BlogSeoDecision {
  const { slug } = input;

  // 1. protected が最優先。frontmatter で何が指定されていても protect に上書きする。
  if (isProtectedBlogSlug(slug)) {
    const r = getProtectedBlogReason(slug);
    return {
      status: "protect",
      robots: INDEX_FOLLOW,
      includeInSitemap: true,
      canonicalSlug: slug, // 必ず自己参照
      isProtected: true,
      reason: `保護対象（${r?.note ?? "GA4実績あり"}）`,
    };
  }

  const status = input.seoStatus;

  // 2. frontmatter で明示された方針を尊重する。
  switch (status) {
    case "noindex":
      return {
        status: "noindex",
        robots: NOINDEX_FOLLOW,
        includeInSitemap: false,
        canonicalSlug: slug,
        isProtected: false,
        reason: "frontmatter seoStatus=noindex",
      };
    case "redirect":
      return {
        status: "redirect",
        robots: NOINDEX_FOLLOW,
        includeInSitemap: false,
        canonicalSlug: input.redirectTo ?? slug,
        isProtected: false,
        reason: `frontmatter seoStatus=redirect → ${input.redirectTo ?? "(未指定)"}`,
      };
    case "canonical":
      return {
        status: "canonical",
        robots: INDEX_FOLLOW,
        includeInSitemap: false, // canonical先が別URLなのでsitemapには載せない
        canonicalSlug: input.canonicalSlug ?? slug,
        isProtected: false,
        reason: `frontmatter seoStatus=canonical → ${input.canonicalSlug ?? "(未指定)"}`,
      };
    case "protect":
      return {
        status: "protect",
        robots: INDEX_FOLLOW,
        includeInSitemap: true,
        canonicalSlug: slug,
        isProtected: true,
        reason: "frontmatter seoStatus=protect",
      };
    case "strengthen":
      // 強化対象だが index は維持する
      return {
        status: "strengthen",
        robots: INDEX_FOLLOW,
        includeInSitemap: true,
        canonicalSlug: slug,
        isProtected: false,
        reason: "frontmatter seoStatus=strengthen（index維持・内容強化対象）",
      };
    case "index":
      return {
        status: "index",
        robots: INDEX_FOLLOW,
        includeInSitemap: true,
        canonicalSlug: slug,
        isProtected: false,
        reason: "frontmatter seoStatus=index",
      };
    default:
      // 3. 未指定はデフォルト index（機械的に noindex 化しない）
      return {
        status: "index",
        robots: INDEX_FOLLOW,
        includeInSitemap: true,
        canonicalSlug: slug,
        isProtected: false,
        reason: "デフォルト（seoStatus未指定 → index維持）",
      };
  }
}

/** パスベースの保護判定（トップページ等） */
export function isProtectedPagePath(path: string): boolean {
  return isProtectedPath(path);
}

/**
 * protected 対象に対する危険な設定を検出して違反メッセージを返す。
 * 違反がなければ空配列。ビルド時・seo:audit時の安全装置。
 */
export function findProtectedViolations(input: BlogSeoInput): string[] {
  if (!isProtectedBlogSlug(input.slug)) return [];
  const violations: string[] = [];
  if (input.seoStatus === "noindex")
    violations.push(`protected記事 "${input.slug}" に seoStatus=noindex が設定されている`);
  if (input.seoStatus === "redirect" || input.redirectTo)
    violations.push(`protected記事 "${input.slug}" に redirect 設定がある`);
  if (
    input.seoStatus === "canonical" ||
    (input.canonicalSlug && input.canonicalSlug !== input.slug)
  )
    violations.push(
      `protected記事 "${input.slug}" の canonical が自己参照でない（${input.canonicalSlug}）`,
    );
  return violations;
}
