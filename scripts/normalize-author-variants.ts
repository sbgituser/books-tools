#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

type Book = {
  id: string;
  title: string;
  authors?: string[];
};

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, "src", "data", "books.index.json");
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_BEFORE = path.join(REPORT_DIR, "author-variants-before.tsv");
const REPORT_AFTER = path.join(REPORT_DIR, "author-variants-after.tsv");
const REPORT_REPLACED = path.join(REPORT_DIR, "author-variants-replaced.tsv");

function normalizeAuthorKey(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000・･\-‐‑‒–—―'"`´’‘()（）\[\]【】]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function toVariantMap(books: Book[]): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>();
  for (const b of books) {
    for (const raw of b.authors ?? []) {
      const author = String(raw ?? "").trim();
      if (!author) continue;
      const key = normalizeAuthorKey(author);
      if (!key) continue;
      const variants = map.get(key) ?? new Map<string, number>();
      variants.set(author, (variants.get(author) ?? 0) + 1);
      map.set(key, variants);
    }
  }
  return map;
}

function chooseCanonical(variants: Map<string, number>): string {
  return [...variants.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      if (b[0].length !== a[0].length) return b[0].length - a[0].length;
      return a[0].localeCompare(b[0], "ja");
    })[0][0];
}

function writeVariantReport(filePath: string, map: Map<string, Map<string, number>>) {
  const rows: string[] = ["key\tvariant\tcount"];
  for (const [key, variants] of [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "ja"))) {
    if (variants.size < 2) continue;
    const sorted = [...variants.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
    for (const [variant, count] of sorted) {
      rows.push(`${key}\t${variant.replace(/\t/g, " ")}\t${count}`);
    }
  }
  fs.writeFileSync(filePath, rows.join("\n") + "\n", "utf-8");
}

function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const books = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")) as Book[];
  const before = toVariantMap(books);
  writeVariantReport(REPORT_BEFORE, before);

  const replacement = new Map<string, string>();
  const replacedRows: string[] = ["key\tfrom\tto"];

  for (const [key, variants] of before.entries()) {
    if (variants.size < 2) continue;
    const canonical = chooseCanonical(variants);
    for (const from of variants.keys()) {
      if (from === canonical) continue;
      replacement.set(from, canonical);
      replacedRows.push(`${key}\t${from.replace(/\t/g, " ")}\t${canonical.replace(/\t/g, " ")}`);
    }
  }

  let changedBooks = 0;
  for (const b of books) {
    if (!b.authors?.length) continue;
    let changed = false;
    b.authors = b.authors.map((a) => {
      const raw = String(a ?? "").trim();
      const to = replacement.get(raw);
      if (to && to !== raw) {
        changed = true;
        return to;
      }
      return raw;
    });
    if (changed) changedBooks++;
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(books, null, 2) + "\n", "utf-8");
  fs.writeFileSync(REPORT_REPLACED, replacedRows.join("\n") + "\n", "utf-8");

  const after = toVariantMap(books);
  writeVariantReport(REPORT_AFTER, after);

  const beforeGroups = [...before.values()].filter((v) => v.size >= 2).length;
  const afterGroups = [...after.values()].filter((v) => v.size >= 2).length;
  console.log(`variant_groups_before=${beforeGroups}`);
  console.log(`variant_groups_after=${afterGroups}`);
  console.log(`replacements=${replacement.size}`);
  console.log(`changed_books=${changedBooks}`);
}

main();

