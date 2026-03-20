#!/usr/bin/env tsx
/**
 * copy-discover-curated.ts
 *
 * data/discover-curated/*.json を public/data/discover-curated/ にコピーする。
 * prebuild 時に実行される。
 *
 * data/discover-curated/ — git管理・AI選書バッチ出力
 * public/data/discover-curated/ — 本番サイトで fetch される静的ファイル
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "data", "discover-curated");
const DST_DIR = join(ROOT, "public", "data", "discover-curated");

mkdirSync(DST_DIR, { recursive: true });

if (!existsSync(SRC_DIR)) {
  console.log("discover-curated: ソースディレクトリが存在しません (スキップ)");
  process.exit(0);
}

const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".json"));

if (files.length === 0) {
  console.log("discover-curated: コピー対象ファイルなし (スキップ)");
  process.exit(0);
}

for (const file of files) {
  const src = join(SRC_DIR, file);
  const dst = join(DST_DIR, file);
  writeFileSync(dst, readFileSync(src));
}

console.log(`discover-curated: ${files.length} 件コピー → public/data/discover-curated/`);
