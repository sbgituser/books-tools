import { readdirSync } from "fs";
import { join } from "path";
import type { MetadataRoute } from "next";
import { getAllBlogMeta } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { READING_SCENES } from "@/constants/readingScenes";
import { PRESET_SEARCHES } from "@/constants/bookTags";
import { CATEGORY_TREE } from "@/lib/categories";

export const dynamic = "force-static";


function getAllWorkFileIds(): string[] {
  try {
    const dir = join(process.cwd(), "public", "data", "works");
    return readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/discover`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools/media-originals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools/trend-books`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/manga/mood`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogMeta().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

const workRoutes: MetadataRoute.Sitemap = getAllWorkFileIds().map((fileId) => ({
    url: `${SITE_URL}/works/${fileId}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const sceneRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/scene`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...READING_SCENES.map((s) => ({
      url: `${SITE_URL}/scene/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const mangaMoodRoutes: MetadataRoute.Sitemap = PRESET_SEARCHES.map((p) => ({
    url: `${SITE_URL}/manga/by-mood/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // ── ジャンルルート ──
  const allL2Ids: string[] = [];
  for (const l1 of CATEGORY_TREE) {
    for (const l2 of l1.subcategories ?? []) {
      allL2Ids.push(l2.id);
    }
  }

  const genreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/genre`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...allL2Ids.map((l2Id) => ({
      url: `${SITE_URL}/genre/${l2Id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  // ── 固定ページルート ──
  const legalRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  return [
    ...staticRoutes,
    ...sceneRoutes,
    ...genreRoutes,
    ...mangaMoodRoutes,
    ...workRoutes,
    ...blogRoutes,
    ...legalRoutes,
  ];
}

