#!/usr/bin/env tsx
/**
 * dedup-books.ts
 * タイトル正規化による重複エントリ検出・削除スクリプト
 * - gb-blog-* / blog-* ID + 実データが重複 → blog版を削除
 * - 同種の重複 → 情報充実度スコアが最高のものを1件残す
 */

import * as fs from "fs";
import * as path from "path";

const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s　]+/g, "")
    .replace(/[（）()【】「」『』・‐－\-～〜]/g, "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    );
}

function completeness(b: any): number {
  let s = 0;
  if (b.authors && b.authors.length > 0) s += 3;
  if (b.thumbnailUrl) s += 2;
  if (b.publishedDate) s += 1;
  if (b.pageCount) s += 1;
  if (b.publisher) s += 1;
  return s;
}

function isBlogId(id: string): boolean {
  return id.startsWith("gb-blog-") || id.startsWith("blog-");
}

function main() {
  const books: any[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  console.log(`元件数: ${books.length}`);

  // タイトル正規化でグルーピング
  const titleMap = new Map<string, number[]>();
  books.forEach((b, i) => {
    const key = normalize(b.title ?? "");
    if (!key) return;
    if (titleMap.has(key)) titleMap.get(key)!.push(i);
    else titleMap.set(key, [i]);
  });

  const dupGroups = [...titleMap.entries()].filter(([, v]) => v.length > 1);
  console.log(`重複グループ数: ${dupGroups.length}`);

  const removeIndices = new Set<number>();
  let blogRemoved = 0;
  let realDeduped = 0;

  for (const [, indices] of dupGroups) {
    const entries = indices.map((i) => ({ i, b: books[i] }));
    const blogEntries = entries.filter((e) => isBlogId(e.b.id));
    const realEntries = entries.filter((e) => !isBlogId(e.b.id));

    if (realEntries.length > 0 && blogEntries.length > 0) {
      // 実データがある → blog版をすべて削除
      for (const e of blogEntries) {
        console.log(`  [blog削除] ${e.b.id} | ${e.b.title}`);
        removeIndices.add(e.i);
        blogRemoved++;
      }
    } else {
      // 同種 → スコア最高のものを1件残し、残りを削除
      entries.sort((a, b) => completeness(b.b) - completeness(a.b));
      const keep = entries[0];
      for (const e of entries.slice(1)) {
        console.log(
          `  [重複削除] ${e.b.id} | ${e.b.title} (score:${completeness(e.b)}) → 保持: ${keep.b.id} (score:${completeness(keep.b)})`
        );
        removeIndices.add(e.i);
        realDeduped++;
      }
    }
  }

  console.log(`\nblog版削除: ${blogRemoved}件`);
  console.log(`実データ重複解消: ${realDeduped}件`);
  console.log(`削除合計: ${removeIndices.size}件`);

  const result = books.filter((_, i) => !removeIndices.has(i));
  console.log(`削除後件数: ${result.length}`);

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log("書き込み完了");
  console.log("次のステップ: npm run split:index");
}

main();
