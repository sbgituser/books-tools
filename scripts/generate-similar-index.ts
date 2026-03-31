#!/usr/bin/env tsx
/**
 * generate-similar-index.ts
 *
 * data/similar-works/ 内の全JSONを読み込み、
 * 類似作品のフラットなインデックスを public/data/similar-index.json に出力する。
 *
 * 出力構造:
 * {
 *   works: Array<{
 *     workId, fileId, title, author, type,
 *     similarTo: Array<{ workId, fileId, title, author, type, reason, groupType }>
 *   }>,
 *   generatedAt: string
 * }
 */

import fs from "node:fs";
import path from "node:path";

const SIMILAR_WORKS_DIR = path.join(process.cwd(), "data", "similar-works");
const WORKS_DATA_DIR = path.join(process.cwd(), "public", "data", "works");
const OUTPUT_PATH = path.join(process.cwd(), "public", "data", "similar-index.json");

interface WorkData {
  workId: string;
  title: string;
  authorDisplay: string;
  type: string;
}

interface SimilarItem {
  workId: string;
  fileId: string;
  title: string;
  authorDisplay: string;
  type: string;
  reason: string;
}

interface SimilarGroup {
  type: string;
  items: SimilarItem[];
}

interface SimilarWorksFile {
  workId: string;
  groups: SimilarGroup[];
  generatedAt: string;
}

/** public/data/works/{fileId}.json からタイトル・著者を取得 */
function getWorkData(fileId: string): WorkData | null {
  try {
    const filePath = path.join(WORKS_DATA_DIR, `${fileId}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return {
      workId: data.workId ?? "",
      title: data.title ?? "",
      authorDisplay: data.authorDisplay ?? "",
      type: data.type ?? "novel",
    };
  } catch {
    return null;
  }
}

function main() {
  if (!fs.existsSync(SIMILAR_WORKS_DIR)) {
    console.error(`❌ data/similar-works/ ディレクトリが見つかりません: ${SIMILAR_WORKS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SIMILAR_WORKS_DIR).filter((f) => f.endsWith(".json"));
  console.log(`📂 ${files.length} ファイルを処理中...`);

  const works: Array<{
    workId: string;
    fileId: string;
    title: string;
    author: string;
    type: string;
    similarTo: Array<{
      workId: string;
      fileId: string;
      title: string;
      author: string;
      type: string;
      reason: string;
      groupType: string;
    }>;
  }> = [];

  let skipped = 0;

  for (const file of files) {
    const fileId = file.replace(/\.json$/, "");
    try {
      const raw = fs.readFileSync(path.join(SIMILAR_WORKS_DIR, file), "utf-8");
      const data: SimilarWorksFile = JSON.parse(raw);

      if (!data.workId || !data.groups || data.groups.length === 0) {
        skipped++;
        continue;
      }

      // メイン作品の情報を works ファイルから取得
      const workData = getWorkData(fileId);
      if (!workData || !workData.title) {
        skipped++;
        continue;
      }

      // 類似作品をフラット化
      const similarTo: Array<{
        workId: string;
        fileId: string;
        title: string;
        author: string;
        type: string;
        reason: string;
        groupType: string;
      }> = [];

      for (const group of data.groups) {
        for (const item of group.items) {
          if (!item.workId || !item.title) continue;
          similarTo.push({
            workId: item.workId,
            fileId: item.fileId ?? "",
            title: item.title,
            author: item.authorDisplay ?? "",
            type: item.type ?? "novel",
            reason: item.reason ?? "",
            groupType: group.type,
          });
        }
      }

      if (similarTo.length === 0) {
        skipped++;
        continue;
      }

      works.push({
        workId: data.workId,
        fileId,
        title: workData.title,
        author: workData.authorDisplay,
        type: workData.type,
        similarTo,
      });
    } catch {
      skipped++;
    }
  }

  const output = {
    works,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output), "utf-8");
  console.log(`✅ similar-index.json 生成完了`);
  console.log(`   収録作品数: ${works.length}`);
  console.log(`   スキップ数: ${skipped}`);
  console.log(`   出力先: ${OUTPUT_PATH}`);
}

main();
