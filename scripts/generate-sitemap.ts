#!/usr/bin/env tsx
/**
 * generate-sitemap.ts
 *
 * カテゴリ別分割サイトマップを public/ に生成する。
 * - sitemap.xml         : サイトマップインデックス
 * - sitemap-static.xml  : 静的ページ（/, /search, /privacy, /contact）
 * - sitemap-tools.xml   : ツール・シーン・ジャンル・漫画気分ページ
 * - sitemap-works.xml   : 作品詳細ページ（/works/*）
 * - sitemap-blog.xml    : ブログ記事（/blog, /blog/*）
 * - sitemap-discover.xml: ディスカバーページ（/discover）
 *
 * prebuild の最後に実行されることを想定。
 */

import fs from "node:fs";
import path from "node:path";
import { getAllBlogMeta } from "../src/lib/blog";
import { SITE_URL } from "../src/lib/site";
import { READING_SCENES } from "../src/constants/readingScenes";
import { PRESET_SEARCHES } from "../src/constants/bookTags";
import { CATEGORY_TREE } from "../src/lib/categories";

// ── ヘルパー ──────────────────────────────────────────────────────────────

function urlEntry(
  url: string,
  lastmod: string,
  changefreq: string,
  priority: number,
): string {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod.substring(0, 10)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

function buildSitemap(entries: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

function buildSitemapIndex(
  sitemaps: Array<{ loc: string; lastmod: string }>,
): string {
  const items = sitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod.substring(0, 10)}</lastmod>
  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
}

/**
 * summaryShort または discoveryTags を持つ作品のみ対象にする。
 * 薄いコンテンツはクロール予算の無駄遣いになるため除外。
 */
function getIndexableWorkIds(): string[] {
  try {
    const dir = path.join(process.cwd(), "public", "data", "works");
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .filter((f) => {
        try {
          const data = JSON.parse(
            fs.readFileSync(path.join(dir, f), "utf-8"),
          );
          const hasSummary = Boolean((data.summaryShort ?? "").trim());
          const hasTags = (data.discoveryTags?.length ?? 0) > 0;
          return hasSummary || hasTags;
        } catch {
          return false;
        }
      })
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

// ── メイン ────────────────────────────────────────────────────────────────

function main() {
  const publicDir = path.join(process.cwd(), "public");
  const today = new Date().toISOString().substring(0, 10);

  // ── sitemap-static.xml ──────────────────────────────────────────────────
  const staticEntries = [
    urlEntry(`${SITE_URL}/`, today, "daily", 1.0),
    urlEntry(`${SITE_URL}/search`, today, "weekly", 0.7),
    urlEntry(`${SITE_URL}/privacy`, today, "monthly", 0.3),
    urlEntry(`${SITE_URL}/contact`, today, "monthly", 0.3),
  ];
  fs.writeFileSync(
    path.join(publicDir, "sitemap-static.xml"),
    buildSitemap(staticEntries),
    "utf-8",
  );
  console.log(`✅ sitemap-static.xml : ${staticEntries.length} URLs`);

  // ── sitemap-tools.xml ───────────────────────────────────────────────────
  // ツール・シーン・ジャンル・漫画気分 をまとめる
  const allL2Ids: string[] = [];
  for (const l1 of CATEGORY_TREE) {
    for (const l2 of l1.subcategories ?? []) {
      allL2Ids.push(l2.id);
    }
  }

  const toolsEntries = [
    urlEntry(`${SITE_URL}/tools`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/tools/media-originals`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/tools/trend-books`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/tools/similar-books`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/scene`, today, "weekly", 0.85),
    ...READING_SCENES.map((s) =>
      urlEntry(`${SITE_URL}/scene/${s.slug}`, today, "weekly", 0.8),
    ),
    urlEntry(`${SITE_URL}/genre`, today, "weekly", 0.85),
    ...allL2Ids.map((id) =>
      urlEntry(`${SITE_URL}/genre/${id}`, today, "weekly", 0.8),
    ),
    urlEntry(`${SITE_URL}/manga/mood`, today, "weekly", 0.8),
    ...PRESET_SEARCHES.map((p) =>
      urlEntry(`${SITE_URL}/manga/by-mood/${p.slug}`, today, "weekly", 0.75),
    ),
  ];
  fs.writeFileSync(
    path.join(publicDir, "sitemap-tools.xml"),
    buildSitemap(toolsEntries),
    "utf-8",
  );
  console.log(`✅ sitemap-tools.xml  : ${toolsEntries.length} URLs`);

  // ── sitemap-works.xml ───────────────────────────────────────────────────
  const workIds = getIndexableWorkIds();
  const worksEntries = workIds.map((id) =>
    urlEntry(`${SITE_URL}/works/${id}`, today, "monthly", 0.5),
  );
  fs.writeFileSync(
    path.join(publicDir, "sitemap-works.xml"),
    buildSitemap(worksEntries),
    "utf-8",
  );
  console.log(`✅ sitemap-works.xml  : ${worksEntries.length} URLs`);

  // ── sitemap-blog.xml ────────────────────────────────────────────────────
  const blogPosts = getAllBlogMeta();
  const blogEntries = [
    urlEntry(`${SITE_URL}/blog`, today, "daily", 0.9),
    ...blogPosts.map((post) =>
      urlEntry(
        `${SITE_URL}/blog/${post.slug}`,
        (post.updated ?? post.date).substring(0, 10),
        "weekly",
        0.7,
      ),
    ),
  ];
  fs.writeFileSync(
    path.join(publicDir, "sitemap-blog.xml"),
    buildSitemap(blogEntries),
    "utf-8",
  );
  console.log(`✅ sitemap-blog.xml   : ${blogEntries.length} URLs`);

  // ── sitemap-discover.xml ────────────────────────────────────────────────
  const discoverEntries = [
    urlEntry(`${SITE_URL}/discover`, today, "weekly", 0.9),
  ];
  fs.writeFileSync(
    path.join(publicDir, "sitemap-discover.xml"),
    buildSitemap(discoverEntries),
    "utf-8",
  );
  console.log(`✅ sitemap-discover.xml: ${discoverEntries.length} URLs`);

  // ── sitemap.xml (インデックス) ──────────────────────────────────────────
  const indexXml = buildSitemapIndex([
    { loc: `${SITE_URL}/sitemap-static.xml`, lastmod: today },
    { loc: `${SITE_URL}/sitemap-tools.xml`, lastmod: today },
    { loc: `${SITE_URL}/sitemap-works.xml`, lastmod: today },
    { loc: `${SITE_URL}/sitemap-blog.xml`, lastmod: today },
    { loc: `${SITE_URL}/sitemap-discover.xml`, lastmod: today },
  ]);
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), indexXml, "utf-8");
  console.log(`✅ sitemap.xml        : 5 sub-sitemaps`);

  const total =
    staticEntries.length +
    toolsEntries.length +
    worksEntries.length +
    blogEntries.length +
    discoverEntries.length;
  console.log(`\n📊 合計 URL 数: ${total}`);
}

main();
