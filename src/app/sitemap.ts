import { readFileSync } from "fs";
import { join } from "path";
import type { MetadataRoute } from "next";
import { getAllBlogMeta } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { READING_SCENES } from "@/constants/readingScenes";

export const dynamic = "force-static";

function getAllBookIds(): string[] {
  const path = join(process.cwd(), "src/data/books.index.json");
  const books = JSON.parse(readFileSync(path, "utf-8")) as { id: string }[];
  return books.map((b) => b.id);
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
      url: `${SITE_URL}/similar-books`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools/book-compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogMeta().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const bookRoutes: MetadataRoute.Sitemap = getAllBookIds().map((id) => ({
    url: `${SITE_URL}/books/${encodeURIComponent(id)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
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

  return [...staticRoutes, ...sceneRoutes, ...blogRoutes, ...bookRoutes];
}

