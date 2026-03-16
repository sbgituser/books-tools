/**
 * postbuild-cleanup.ts
 *
 * next build (Turbopack) が out/ に生成する RSC セグメント別 payload の
 * サブディレクトリ（__next.* ファイル群）を削除する。
 *
 * Cloudflare Pages の 20,000 ファイル上限対策。
 * - out/books/{id}/ 配下の __next.* は client-side navigation 用の補助ファイル。
 * - out/{id}.html と out/{id}.txt（ルート RSC payload）は残す。
 * - 直接 URL アクセスおよびページ遷移は問題なく動作する。
 *
 * 実行: npm run build（package.json の postbuild として自動実行）
 */

import { readdirSync, rmSync, statSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "out");

function removeSubdirs(dir: string): number {
  let removed = 0;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      const fullPath = join(dir, e.name);
      rmSync(fullPath, { recursive: true, force: true });
      removed++;
    }
  }
  return removed;
}

function countFiles(dir: string): number {
  let count = 0;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isFile()) count++;
    else if (e.isDirectory()) count += countFiles(join(dir, e.name));
  }
  return count;
}

const targets = ["books", "blog"];
let totalRemoved = 0;

for (const target of targets) {
  const dir = join(OUT_DIR, target);
  try {
    statSync(dir);
  } catch {
    continue;
  }
  const n = removeSubdirs(dir);
  console.log(`  cleaned ${dir} — removed ${n} subdirs`);
  totalRemoved += n;
}

const finalCount = countFiles(OUT_DIR);
console.log(`postbuild-cleanup: removed ${totalRemoved} RSC subdirs, final file count = ${finalCount}`);

if (finalCount > 20000) {
  console.warn(`⚠ WARNING: ${finalCount} files still exceeds Cloudflare Pages limit of 20,000`);
}
