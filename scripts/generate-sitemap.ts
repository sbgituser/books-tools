#!/usr/bin/env tsx
/**
 * generate-sitemap.ts
 *
 * カテゴリ別分割サイトマップを public/ に生成する。
 * - sitemap.xml              : サイトマップインデックス
 * - sitemap-static.xml       : 静的ページ（/, /search, /privacy, /contact）
 * - sitemap-tools.xml        : ツール・シーン・ジャンル・漫画気分ページ
 * - sitemap-works-{n}.xml    : 作品詳細ページ（/works/*）500件ずつ分割
 * - sitemap-blog.xml         : ブログ記事（/blog, /blog/*）
 * - sitemap-discover.xml     : ディスカバーページ（/discover）
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
import { READING_ORDER_SERIES } from "../src/constants/readingOrders";
import { LITERARY_AWARDS } from "../src/constants/literaryAwards";

// ── 定数 ──────────────────────────────────────────────────────────────────

/** 1サイトマップあたりの最大URL数（Google上限50,000だがクロール効率を考慮して小さめに） */
const WORKS_PER_SITEMAP = 500;

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

/** 配列を指定サイズのチャンクに分割する */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

type WorkEntry = { id: string; lastmod: string; priority: number };

/**
 * summaryShort または discoveryTags を持つ作品を取得し、
 * summary あり（高品質）と tags のみ（中品質）に分離して返す。
 * 薄いコンテンツ（両方なし）はサイトマップから除外。
 */
function getIndexableWorks(): { summary: WorkEntry[]; tagsOnly: WorkEntry[] } {
  try {
    const dir = path.join(process.cwd(), "public", "data", "works");
    const summary: WorkEntry[] = [];
    const tagsOnly: WorkEntry[] = [];

    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      try {
        const filePath = path.join(dir, f);
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const hasSummary = Boolean((data.summaryShort ?? "").trim());
        const hasTags = (data.discoveryTags?.length ?? 0) > 0;
        if (!hasSummary && !hasTags) continue;

        const stat = fs.statSync(filePath);
        const lastmod = stat.mtime.toISOString().substring(0, 10);
        const id = f.replace(/\.json$/, "");

        if (hasSummary) {
          summary.push({ id, lastmod, priority: 0.6 });
        } else {
          tagsOnly.push({ id, lastmod, priority: 0.4 });
        }
      } catch {
        // skip
      }
    }

    return { summary, tagsOnly };
  } catch {
    return { summary: [], tagsOnly: [] };
  }
}

// ── メイン ────────────────────────────────────────────────────────────────

function main() {
  const publicDir = path.join(process.cwd(), "public");
  const today = new Date().toISOString().substring(0, 10);

  // 古いworksサイトマップを削除（分割数が変わった場合に備える）
  for (const f of fs.readdirSync(publicDir)) {
    if (/^sitemap-works(-\d+|-tags)?\.xml$/.test(f)) {
      fs.unlinkSync(path.join(publicDir, f));
    }
  }

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
    urlEntry(`${SITE_URL}/tools/book-quiz`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/tools/media-originals`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/tools/trend-books`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/tools/similar-books`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/tools/reading-time`, today, "monthly", 0.8),
    urlEntry(`${SITE_URL}/tools/reading-order`, today, "weekly", 0.85),
    ...READING_ORDER_SERIES.map((s) =>
      urlEntry(`${SITE_URL}/tools/reading-order/${s.id}`, today, "weekly", 0.8),
    ),
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
    // コレクション
    urlEntry(`${SITE_URL}/collections/adventure-manga`, today, "weekly", 0.8),
    urlEntry(`${SITE_URL}/tools/literary-awards`, today, "weekly", 0.85),
    ...LITERARY_AWARDS.map((a) =>
      urlEntry(`${SITE_URL}/tools/literary-awards/${a.id}`, today, "monthly", 0.8),
    ),
  ];
  fs.writeFileSync(
    path.join(publicDir, "sitemap-tools.xml"),
    buildSitemap(toolsEntries),
    "utf-8",
  );
  console.log(`✅ sitemap-tools.xml  : ${toolsEntries.length} URLs`);

  // ── sitemap-works-{n}.xml（summaryあり＝高品質）─────────────────────
  const { summary: summaryWorks, tagsOnly: tagsOnlyWorks } = getIndexableWorks();
  const worksChunks = chunk(summaryWorks, WORKS_PER_SITEMAP);
  const worksSitemaps: Array<{ loc: string; lastmod: string }> = [];

  worksChunks.forEach((worksSlice, idx) => {
    const suffix = worksChunks.length === 1 ? "" : `-${idx + 1}`;
    const fileName = `sitemap-works${suffix}.xml`;
    const entries = worksSlice.map((w) =>
      urlEntry(`${SITE_URL}/works/${w.id}`, w.lastmod, "monthly", w.priority),
    );
    fs.writeFileSync(
      path.join(publicDir, fileName),
      buildSitemap(entries),
      "utf-8",
    );
    const latestMod = worksSlice.reduce(
      (max, w) => (w.lastmod > max ? w.lastmod : max),
      worksSlice[0]?.lastmod ?? today,
    );
    worksSitemaps.push({ loc: `${SITE_URL}/${fileName}`, lastmod: latestMod });
    console.log(`✅ ${fileName.padEnd(24)}: ${entries.length} URLs (summary)`);
  });

  // ── sitemap-works-tags.xml（tagsのみ＝中品質・低優先度）───────────────
  // crawl予算を高品質ページに集中させるため、分離して低priorityで配置
  if (tagsOnlyWorks.length > 0) {
    const tagsFileName = "sitemap-works-tags.xml";
    const tagsEntries = tagsOnlyWorks.map((w) =>
      urlEntry(`${SITE_URL}/works/${w.id}`, w.lastmod, "monthly", 0.3),
    );
    fs.writeFileSync(
      path.join(publicDir, tagsFileName),
      buildSitemap(tagsEntries),
      "utf-8",
    );
    const tagsLatestMod = tagsOnlyWorks.reduce(
      (max, w) => (w.lastmod > max ? w.lastmod : max),
      tagsOnlyWorks[0]?.lastmod ?? today,
    );
    worksSitemaps.push({ loc: `${SITE_URL}/${tagsFileName}`, lastmod: tagsLatestMod });
    console.log(`✅ ${tagsFileName.padEnd(24)}: ${tagsEntries.length} URLs (tags-only)`);
  }

  // ── sitemap-blog.xml ────────────────────────────────────────────────────
  const blogPosts = getAllBlogMeta();
  const blogLatest = blogPosts.length > 0
    ? (blogPosts[0].updated ?? blogPosts[0].date).substring(0, 10)
    : today;
  const blogEntries = [
    urlEntry(`${SITE_URL}/blog`, blogLatest, "daily", 0.9),
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
    ...worksSitemaps,
    { loc: `${SITE_URL}/sitemap-blog.xml`, lastmod: blogLatest },
    { loc: `${SITE_URL}/sitemap-discover.xml`, lastmod: today },
  ]);
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), indexXml, "utf-8");
  const totalSitemaps = 3 + worksSitemaps.length + 1; // static + tools + works[] + blog + discover
  console.log(`✅ sitemap.xml        : ${totalSitemaps} sub-sitemaps`);

  const allWorksCount = summaryWorks.length + tagsOnlyWorks.length;
  const total =
    staticEntries.length +
    toolsEntries.length +
    allWorksCount +
    blogEntries.length +
    discoverEntries.length;
  console.log(`\n📊 合計 URL 数: ${total}`);
  console.log(`   作品ページ(summary): ${summaryWorks.length} (priority 0.6)`);
  console.log(`   作品ページ(tags-only): ${tagsOnlyWorks.length} (priority 0.3)`);
  console.log(`   薄いコンテンツ除外: ${2645 - allWorksCount} ページ (noindex)`);
}

main();
