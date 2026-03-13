#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content", "blog");

function walk(dir: string, out: string[] = []): string[] {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(md|mdx)$/i.test(ent.name)) out.push(p);
  }
  return out;
}

function normalizeAuthorKey(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000・･\-‐‑‒–—―'"`´’‘()（）\[\]【】]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

type Hit = {
  value: string;
  file: string;
  line: number;
};

function main() {
  const files = walk(BLOG_DIR);
  const groups = new Map<string, Map<string, Hit[]>>();

  for (const file of files) {
    const text = fs.readFileSync(file, "utf-8");
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(/^#{2,4}\s+.*?（([^）]+)）/u);
      if (!m) continue;

      const author = m[1].trim();
      if (!author || author.length > 80) continue;
      if (/^https?:/i.test(author)) continue;

      const key = normalizeAuthorKey(author);
      if (!key) continue;

      const variants = groups.get(key) ?? new Map<string, Hit[]>();
      const arr = variants.get(author) ?? [];
      arr.push({ value: author, file: path.relative(ROOT, file), line: i + 1 });
      variants.set(author, arr);
      groups.set(key, variants);
    }
  }

  const out: string[] = [];
  out.push("key\tvariant\thits\tlocations");

  const variantGroups = [...groups.entries()]
    .filter(([, variants]) => variants.size >= 2)
    .sort((a, b) => a[0].localeCompare(b[0], "ja"));

  for (const [key, variants] of variantGroups) {
    const sorted = [...variants.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ja"));
    for (const [variant, hits] of sorted) {
      const locations = hits
        .slice(0, 5)
        .map((h) => `${h.file}:${h.line}`)
        .join(" | ");
      out.push(`${key}\t${variant}\t${hits.length}\t${locations}`);
    }
  }

  const reportPath = path.join(ROOT, "reports", "blog-author-variants.tsv");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, out.join("\n") + "\n", "utf-8");

  console.log(`variant_groups=${variantGroups.length}`);
  console.log(`report=${path.relative(ROOT, reportPath)}`);
}

main();

