#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseArgs() {
  const args = process.argv.slice(2);
  const map = new Map<string, string>();
  for (const arg of args) {
    const [k, v] = arg.split("=");
    if (k.startsWith("--") && v) map.set(k.slice(2), v);
  }
  return {
    title: map.get("title") ?? "新しい記事",
    slug: map.get("slug") ?? "",
    description: map.get("description") ?? "",
    tags: (map.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    draft: (map.get("draft") ?? "false") === "true",
  };
}

function main() {
  const { title, slug, description, tags, draft } = parseArgs();
  const safeSlug = slug || slugify(title) || `post-${Date.now()}`;
  const date = new Date().toISOString().slice(0, 10);

  const blogDir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

  const filePath = path.join(blogDir, `${safeSlug}.mdx`);
  if (fs.existsSync(filePath)) {
    console.error(`[ERROR] 既に存在します: ${filePath}`);
    process.exit(1);
  }

  const template = `---
title: "${title.replace(/"/g, '\\"')}"
slug: "${safeSlug}"
description: "${description.replace(/"/g, '\\"')}"
date: "${date}"
updated: "${date}"
tags: [${tags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(", ")}]
draft: ${draft}
coverImage: ""
---

# ${title}

ここに本文を書いてください。

## 関連ツール

- [類似書籍探索](/similar-books)
- [条件一致で本を探す](/tools/book-compare)
`;

  fs.writeFileSync(filePath, template, "utf-8");
  console.log(`✅ 作成: ${filePath}`);
}

main();

