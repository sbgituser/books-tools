#!/usr/bin/env tsx
/**
 * seo-audit.ts
 *
 * サイト全体の SEO 状態を監査し、reports/seo-audit.md と reports/seo-audit.csv を出力する。
 *
 * 推奨対応の優先順位（上が優先）:
 *   protected > index > strengthen > merge > noindex / redirect / canonical
 *
 * アクセス実績がある可能性のあるページは、いきなり noindex にせず strengthen とする。
 *
 * 実行: npm run seo:audit
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getAllBlogMeta } from "../src/lib/blog";
import { resolveBlogSeo, findProtectedViolations } from "../src/lib/seoPolicy";
import {
  PROTECTED_BLOG_PAGES,
  isProtectedBlogSlug,
} from "../src/data/seo-protected-pages";
import { SITE_URL } from "../src/lib/site";
import { READING_SCENES } from "../src/constants/readingScenes";
import { PRESET_SEARCHES } from "../src/constants/bookTags";
import { CATEGORY_TREE } from "../src/lib/categories";
import { READING_ORDER_SERIES } from "../src/constants/readingOrders";
import { LITERARY_AWARDS } from "../src/constants/literaryAwards";

type PageType =
  | "blog"
  | "work"
  | "genre"
  | "scene"
  | "tool"
  | "manga-mood"
  | "reading-order"
  | "award"
  | "static"
  | "other";

type Recommendation =
  | "protect"
  | "index"
  | "strengthen"
  | "merge"
  | "noindex"
  | "redirect"
  | "canonical";

type AuditRow = {
  url: string;
  type: PageType;
  title: string;
  description: string;
  bodyChars: number;
  internalLinks: number;
  canonical: string;
  robots: string;
  inSitemap: boolean;
  isNoindex: boolean;
  isProtected: boolean;
  ga4Likely: boolean;
  dupGroup: string;
  recommendation: Recommendation;
  reason: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const WORKS_DIR = path.join(process.cwd(), "public", "data", "works");
const REPORTS_DIR = path.join(process.cwd(), "reports");

/** 薄いコンテンツの本文しきい値（日本語文字数） */
const THIN_BODY_CHARS = 1200;

// ── ヘルパー ──────────────────────────────────────────────────────────────

/** Markdown から本文の概算文字数を数える（記法・空白を除去） */
function countBodyChars(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, (m) => m.replace(/\]\([^)]*\)/, ""))
    .replace(/[#>*_`~|-]/g, "")
    .replace(/\s+/g, "");
  return stripped.length;
}

/** 本文中の内部リンク数（/ で始まるリンク） */
function countInternalLinks(markdown: string): number {
  const matches = markdown.match(/\]\(\/[^)]*\)/g);
  return matches ? matches.length : 0;
}

/** タイトルから重複グループ推定用のキーワードを抽出 */
function dupKeyword(title: string): string {
  const keywords = [
    "映像化",
    "映画化",
    "ファンタジー漫画",
    "異世界",
    "アニメ",
    "ミステリー",
    "SF",
    "恋愛",
    "ホラー",
    "泣ける",
    "ランキング",
    "初心者",
    "ベストセラー",
    "純文学",
    "哲学",
    "ライトノベル",
    "バトル漫画",
    "歴史",
  ];
  for (const kw of keywords) {
    if (title.includes(kw)) return kw;
  }
  return "";
}

function csvEscape(v: string | number | boolean): string {
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// ── ブログ監査 ────────────────────────────────────────────────────────────

const violations: string[] = [];
const futureDecisions: string[] = [];

function auditBlog(): AuditRow[] {
  const rows: AuditRow[] = [];
  const metas = getAllBlogMeta({ includeDraft: false });

  // 重複グループ集計
  const groupCounts = new Map<string, number>();
  for (const m of metas) {
    const kw = dupKeyword(m.title);
    if (kw) groupCounts.set(kw, (groupCounts.get(kw) ?? 0) + 1);
  }

  // slug → 本文 を一度だけ構築（O(n²)回避）
  const bodyBySlug = new Map<string, string>();
  for (const f of fs.readdirSync(BLOG_DIR)) {
    if (!/\.mdx?$/.test(f)) continue;
    const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf-8");
    const parsed = matter(raw);
    const slug = String(parsed.data.slug ?? f.replace(/\.mdx?$/, ""));
    bodyBySlug.set(slug, parsed.content);
  }

  for (const m of metas) {
    const body = bodyBySlug.get(m.slug) ?? "";
    const bodyChars = countBodyChars(body);
    const internalLinks = countInternalLinks(body);

    const seo = resolveBlogSeo({
      slug: m.slug,
      seoStatus: m.seoStatus,
      canonicalSlug: m.canonicalSlug,
      redirectTo: m.redirectTo,
    });

    // 安全装置違反チェック
    violations.push(
      ...findProtectedViolations({
        slug: m.slug,
        seoStatus: m.seoStatus,
        canonicalSlug: m.canonicalSlug,
        redirectTo: m.redirectTo,
      }),
    );

    const kw = dupKeyword(m.title);
    const groupSize = kw ? groupCounts.get(kw) ?? 0 : 0;
    const dupGroup = kw && groupSize >= 4 ? `${kw}(${groupSize}件)` : "";

    // 推奨対応の決定
    let recommendation: Recommendation;
    let reason: string;
    if (seo.isProtected) {
      recommendation = "protect";
      reason = "GA4実績ありの保護対象。index維持・内容強化・内部リンク強化。";
    } else if (seo.status === "noindex") {
      recommendation = "noindex";
      reason = "frontmatterでnoindex指定済み。";
    } else if (seo.status === "redirect") {
      recommendation = "redirect";
      reason = `frontmatterでredirect指定済み → ${m.redirectTo}`;
    } else if (seo.status === "canonical") {
      recommendation = "canonical";
      reason = `frontmatterでcanonical統合指定済み → ${m.canonicalSlug}`;
    } else if (m.isPillar) {
      recommendation = "index";
      reason = "柱記事。index維持。";
    } else if (bodyChars < THIN_BODY_CHARS) {
      // 薄いが、いきなりnoindexにせず strengthen
      recommendation = "strengthen";
      reason = `本文が薄い（約${bodyChars}字）。流入実績が不明なため、noindexではなく内容強化を推奨。`;
      futureDecisions.push(
        `/blog/${m.slug} : 本文約${bodyChars}字で薄い。強化 or noindex を要判断（GA4で流入確認）。`,
      );
    } else if (dupGroup) {
      recommendation = "merge";
      reason = `重複候補グループ ${dupGroup}。柱記事への統合 or 内部リンク強化を要検討（削除・redirectはしない）。`;
      futureDecisions.push(
        `/blog/${m.slug} : 重複グループ ${dupGroup} の一員。柱記事への統合可否を要判断。`,
      );
    } else {
      recommendation = "index";
      reason = "本文量・独自性ともに index 維持で問題なし。";
    }

    rows.push({
      url: `/blog/${m.slug}`,
      type: "blog",
      title: m.title,
      description: m.description,
      bodyChars,
      internalLinks,
      canonical: `${SITE_URL}/blog/${seo.canonicalSlug}`,
      robots: `${seo.robots.index ? "index" : "noindex"},${seo.robots.follow ? "follow" : "nofollow"}`,
      inSitemap: seo.includeInSitemap,
      isNoindex: !seo.robots.index,
      isProtected: seo.isProtected,
      ga4Likely: isProtectedBlogSlug(m.slug),
      dupGroup,
      recommendation,
      reason,
    });
  }

  return rows;
}

// ── 作品ページ監査 ──────────────────────────────────────────────────────────

function auditWorks(): AuditRow[] {
  const rows: AuditRow[] = [];
  if (!fs.existsSync(WORKS_DIR)) return rows;

  for (const f of fs.readdirSync(WORKS_DIR).filter((f) => f.endsWith(".json"))) {
    let data: {
      title?: string;
      summaryShort?: string;
      discoveryTags?: string[];
      authorDisplay?: string;
    };
    try {
      data = JSON.parse(fs.readFileSync(path.join(WORKS_DIR, f), "utf-8"));
    } catch {
      continue;
    }
    const id = f.replace(/\.json$/, "");
    const hasSummary = Boolean((data.summaryShort ?? "").trim());
    const hasTags = (data.discoveryTags?.length ?? 0) > 0;
    const isThin = !hasSummary && !hasTags;
    const bodyChars = (data.summaryShort ?? "").length;

    rows.push({
      url: `/works/${id}`,
      type: "work",
      title: data.title ?? id,
      description: (data.summaryShort ?? "").slice(0, 80),
      bodyChars,
      internalLinks: 0,
      canonical: `${SITE_URL}/works/${id}`,
      robots: isThin ? "noindex,follow" : "index,follow",
      inSitemap: !isThin,
      isNoindex: isThin,
      isProtected: false,
      ga4Likely: false,
      dupGroup: "",
      recommendation: isThin ? "noindex" : hasSummary ? "index" : "strengthen",
      reason: isThin
        ? "summary・タグともになし。薄いコンテンツとして noindex,follow（既存方針）。"
        : hasSummary
          ? "あらすじあり。index対象。"
          : "タグのみ。あらすじ追記で強化推奨。",
    });
  }
  return rows;
}

// ── ルート（ツール・ジャンル・シーン等）監査 ─────────────────────────────────

function auditRoutes(): AuditRow[] {
  const rows: AuditRow[] = [];
  const add = (
    url: string,
    type: PageType,
    title: string,
    rec: Recommendation = "index",
    reason = "主要ページ。index維持・sitemap掲載。",
  ) =>
    rows.push({
      url,
      type,
      title,
      description: "",
      bodyChars: 0,
      internalLinks: 0,
      canonical: `${SITE_URL}${url}`,
      robots: "index,follow",
      inSitemap: true,
      isNoindex: false,
      isProtected: url === "/",
      ga4Likely: url === "/" || url === "/discover",
      dupGroup: "",
      recommendation: url === "/" ? "protect" : rec,
      reason: url === "/" ? "トップページ。保護対象。" : reason,
    });

  add("/", "static", "Books Discover トップページ", "protect");
  add("/discover", "static", "Books Discover", "index");
  add("/search", "static", "検索", "index", "検索トップ。index維持。");
  add("/blog", "static", "ブログ一覧", "index");
  add("/tools", "tool", "ツール一覧");
  add("/tools/book-quiz", "tool", "おすすめ本診断");
  add("/tools/media-originals", "tool", "映像から原作を探す");
  add("/tools/trend-books", "tool", "テーマから本を探す");
  add("/tools/similar-books", "tool", "類似本検索");
  add("/tools/reading-time", "tool", "読書時間計算");
  add("/tools/reading-order", "tool", "読む順番ガイド");
  add("/tools/literary-awards", "tool", "文学賞一覧");

  for (const s of READING_ORDER_SERIES)
    add(`/tools/reading-order/${s.id}`, "reading-order", `${s.seriesName} 読む順番`);
  for (const a of LITERARY_AWARDS)
    add(`/tools/literary-awards/${a.id}`, "award", `${a.name}`);
  add("/scene", "scene", "シーンで探す");
  for (const s of READING_SCENES)
    add(`/scene/${s.slug}`, "scene", s.label ?? s.slug);
  add("/genre", "genre", "ジャンルで探す");
  for (const l1 of CATEGORY_TREE)
    for (const l2 of l1.subcategories ?? [])
      add(`/genre/${l2.id}`, "genre", l2.label ?? l2.id);
  add("/manga/mood", "manga-mood", "漫画を気分で探す");
  for (const p of PRESET_SEARCHES)
    add(`/manga/by-mood/${p.slug}`, "manga-mood", p.label ?? p.slug);

  return rows;
}

// ── レポート生成 ──────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const blogRows = auditBlog();
  const workRows = auditWorks();
  const routeRows = auditRoutes();
  const allRows = [...routeRows, ...blogRows, ...workRows];

  // 集計
  const byRec = (rows: AuditRow[], rec: Recommendation) =>
    rows.filter((r) => r.recommendation === rec).length;
  const indexCount = allRows.filter((r) => !r.isNoindex).length;
  const noindexCount = allRows.filter((r) => r.isNoindex).length;
  const sitemapCount = allRows.filter((r) => r.inSitemap).length;
  const protectedRows = allRows.filter((r) => r.isProtected);

  // ── CSV ──
  const header = [
    "url",
    "type",
    "title",
    "description",
    "bodyChars",
    "internalLinks",
    "canonical",
    "robots",
    "inSitemap",
    "isNoindex",
    "isProtected",
    "ga4Likely",
    "dupGroup",
    "recommendation",
    "reason",
  ];
  const csvLines = [header.join(",")];
  for (const r of allRows) {
    csvLines.push(
      [
        r.url,
        r.type,
        r.title,
        r.description,
        r.bodyChars,
        r.internalLinks,
        r.canonical,
        r.robots,
        r.inSitemap,
        r.isNoindex,
        r.isProtected,
        r.ga4Likely,
        r.dupGroup,
        r.recommendation,
        r.reason,
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  fs.writeFileSync(
    path.join(REPORTS_DIR, "seo-audit.csv"),
    csvLines.join("\n"),
    "utf-8",
  );

  // ── Markdown ──
  const md: string[] = [];
  md.push("# SEO監査レポート — books.kuras-plus.com");
  md.push("");
  md.push(`生成日時: ${process.env.AUDIT_DATE ?? "(build time)"}`);
  md.push("");
  md.push("## サマリ");
  md.push("");
  md.push(`- 監査URL総数: **${allRows.length}**`);
  md.push(`- index対象URL数: **${indexCount}**`);
  md.push(`- noindex対象URL数: **${noindexCount}**`);
  md.push(`- sitemap掲載URL数: **${sitemapCount}**`);
  md.push(`- protected対象URL数: **${protectedRows.length}**`);
  md.push("");
  md.push("### 種別別内訳");
  md.push("");
  md.push("| 種別 | 件数 | index | noindex |");
  md.push("|---|---:|---:|---:|");
  const types: PageType[] = [
    "blog",
    "work",
    "genre",
    "scene",
    "tool",
    "manga-mood",
    "reading-order",
    "award",
    "static",
  ];
  for (const t of types) {
    const rows = allRows.filter((r) => r.type === t);
    if (rows.length === 0) continue;
    md.push(
      `| ${t} | ${rows.length} | ${rows.filter((r) => !r.isNoindex).length} | ${rows.filter((r) => r.isNoindex).length} |`,
    );
  }
  md.push("");
  md.push("### 推奨対応別内訳（優先度順）");
  md.push("");
  md.push("| 推奨 | 件数 |");
  md.push("|---|---:|");
  for (const rec of [
    "protect",
    "index",
    "strengthen",
    "merge",
    "noindex",
    "redirect",
    "canonical",
  ] as Recommendation[]) {
    md.push(`| ${rec} | ${byRec(allRows, rec)} |`);
  }
  md.push("");

  // protected確認
  md.push("## protected対象ページの検証");
  md.push("");
  md.push("| slug/path | タイトル | robots | sitemap | canonical自己参照 |");
  md.push("|---|---|---|:--:|:--:|");
  for (const r of protectedRows) {
    const selfCanon = r.canonical === `${SITE_URL}${r.url}`;
    md.push(
      `| ${r.url} | ${r.title} | ${r.robots} | ${r.inSitemap ? "✅" : "🚨"} | ${selfCanon ? "✅" : "🚨"} |`,
    );
  }
  md.push("");

  // 安全装置
  md.push("## 安全装置（protected違反チェック）");
  md.push("");
  if (violations.length === 0) {
    md.push("✅ protected対象に対する危険な設定（noindex/redirect/別canonical）は検出されませんでした。");
  } else {
    md.push("🚨 以下の違反が検出されました:");
    for (const v of violations) md.push(`- ${v}`);
  }
  md.push("");

  // 重複グループ
  md.push("## 重複候補グループ（merge要判断・自動処理はしない）");
  md.push("");
  const groups = new Map<string, string[]>();
  for (const r of blogRows) {
    if (r.dupGroup) {
      if (!groups.has(r.dupGroup)) groups.set(r.dupGroup, []);
      groups.get(r.dupGroup)!.push(`${r.url} (${r.title})`);
    }
  }
  if (groups.size === 0) {
    md.push("検出なし。");
  } else {
    for (const [g, urls] of groups) {
      md.push(`### ${g}`);
      for (const u of urls) md.push(`- ${u}`);
      md.push("");
    }
  }
  md.push("");

  // 今後判断が必要なページ
  md.push("## 今後判断が必要なページ（今回noindexにしていない）");
  md.push("");
  if (futureDecisions.length === 0) {
    md.push("なし。");
  } else {
    for (const d of futureDecisions.slice(0, 60)) md.push(`- ${d}`);
    if (futureDecisions.length > 60)
      md.push(`- ...ほか ${futureDecisions.length - 60} 件（CSV参照）`);
  }
  md.push("");

  fs.writeFileSync(
    path.join(REPORTS_DIR, "seo-audit.md"),
    md.join("\n"),
    "utf-8",
  );

  // コンソール出力
  console.log("📊 SEO監査完了");
  console.log(`   監査URL総数      : ${allRows.length}`);
  console.log(`   index対象        : ${indexCount}`);
  console.log(`   noindex対象      : ${noindexCount}`);
  console.log(`   sitemap掲載      : ${sitemapCount}`);
  console.log(`   protected対象    : ${protectedRows.length}`);
  console.log(`   strengthen推奨   : ${byRec(allRows, "strengthen")}`);
  console.log(`   merge候補        : ${byRec(allRows, "merge")}`);
  console.log(`   → reports/seo-audit.md / reports/seo-audit.csv`);

  if (violations.length > 0) {
    console.error(`\n🚨 protected違反 ${violations.length} 件:`);
    for (const v of violations) console.error(`   - ${v}`);
    process.exitCode = 1;
  } else {
    console.log("🛡️  protected違反なし");
  }

  // protected が sitemap/index から漏れていないか最終検証
  const protectedMissing = PROTECTED_BLOG_PAGES.filter((p) => {
    const row = blogRows.find((r) => r.url === `/blog/${p.slug}`);
    return !row || !row.inSitemap || row.isNoindex;
  });
  if (protectedMissing.length > 0) {
    console.error(`\n🚨 protected記事が index/sitemap から漏れています:`);
    for (const p of protectedMissing) console.error(`   - ${p.slug}`);
    process.exitCode = 1;
  }
}

main();
