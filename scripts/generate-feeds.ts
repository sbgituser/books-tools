#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { Feed } from "feed";
import { getAllBlogForFeed, getBlogCanonical } from "../src/lib/blog";
import { BLOG_DESCRIPTION, SITE_NAME, SITE_URL } from "../src/lib/site";

function main() {
  const feed = new Feed({
    title: `${SITE_NAME} Blog`,
    description: BLOG_DESCRIPTION,
    id: `${SITE_URL}/blog`,
    link: `${SITE_URL}/blog`,
    language: "ja",
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} kuras-plus`,
    updated: new Date(),
    feedLinks: {
      rss2: `${SITE_URL}/rss.xml`,
      atom: `${SITE_URL}/atom.xml`,
    },
  });

  const posts = getAllBlogForFeed();
  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: getBlogCanonical(post.slug),
      link: getBlogCanonical(post.slug),
      description: post.description,
      date: new Date(post.updated ?? post.date),
      category: post.tags.map((tag) => ({ name: tag })),
      content: post.content,
    });
  }

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  fs.writeFileSync(path.join(publicDir, "rss.xml"), feed.rss2(), "utf-8");
  fs.writeFileSync(path.join(publicDir, "atom.xml"), feed.atom1(), "utf-8");

  console.log("✅ generated feeds: public/rss.xml, public/atom.xml");
}

main();

