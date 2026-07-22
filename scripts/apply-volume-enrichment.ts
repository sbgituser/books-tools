#!/usr/bin/env tsx
/**
 * apply-volume-enrichment.ts — Phase 1-1: NDL突合結果を正規化用サプリメントに集約する
 *
 * data/enrichment/ndl/{fileId}.json (enrich-volumes-ndl.ts の出力) から
 * 採用基準を満たすものだけを data/volumes-supplement.json にまとめる。
 * このファイルは normalize-works.ts が読み込み、works/volumes にマージする。
 *
 * 採用基準:
 *   - 作品の突合信頼度が high であること
 *   - 巻の ISBN はチェックサム検証済み(enrich側)。openBD検証は発売日精度の向上に使い、
 *     未収録でも除外しない(NDLは法定納本書誌であり、旧作はopenBD側に存在しないため)
 *   - volumeCount の更新は「1巻から欠番なく連続して特定できた」場合のみ
 *     (既存 volumeCount より大きい場合に限る。版違いで少なく出た場合は既存を維持)
 *
 * 使い方:
 *   npx tsx scripts/apply-volume-enrichment.ts            # 生成
 *   npx tsx scripts/apply-volume-enrichment.ts --dry-run  # 集計表示のみ
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

type EnrichedVolume = {
  volumeNo: number | null;
  volumeLabel: string;
  isbn13: string;
  publishedDate: string | null;
  publisher: string | null;
  source: "ndl";
  openbdVerified: boolean;
  existsInCurrent: boolean;
};

type WorkEnrichment = {
  workId: string;
  fileId: string;
  title: string;
  confidence: "high" | "medium" | "low";
  expectedVolumeCount: number;
  volumes: EnrichedVolume[];
};

export type VolumeSupplementEntry = {
  source: "ndl";
  fileId: string;
  volumes: Array<{
    volumeNo: number;
    isbn13: string;
    publishedDate: string | null;
    publisher: string | null;
  }>;
  /** 1巻から欠番なく特定できた場合のみ設定(それ以外はnull) */
  completeVolumeCount: number | null;
};

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const srcDir = join(process.cwd(), "data/enrichment/ndl");
  if (!existsSync(srcDir)) {
    console.error("data/enrichment/ndl がありません。先に enrich-volumes-ndl.ts を実行してください。");
    process.exit(1);
  }

  const supplement: Record<string, VolumeSupplementEntry> = {};
  let skippedLowConfidence = 0;
  let skippedNoVolumes = 0;
  let totalVolumes = 0;
  let droppedUnverified = 0;

  for (const f of readdirSync(srcDir).filter((f) => f.endsWith(".json"))) {
    const e: WorkEnrichment = JSON.parse(readFileSync(join(srcDir, f), "utf-8"));
    if (e.confidence !== "high") {
      skippedLowConfidence++;
      continue;
    }
    const usable = e.volumes.filter((v) => v.volumeNo != null);
    droppedUnverified += usable.filter((v) => !v.openbdVerified).length;
    if (usable.length === 0) {
      skippedNoVolumes++;
      continue;
    }

    // 巻番号の重複除去(念のため)と昇順ソート
    const byNo = new Map<number, EnrichedVolume>();
    for (const v of usable) if (!byNo.has(v.volumeNo!)) byNo.set(v.volumeNo!, v);
    const sorted = [...byNo.values()].sort((a, b) => a.volumeNo! - b.volumeNo!);

    // 1..max が欠番なく揃っているか
    const max = sorted[sorted.length - 1].volumeNo!;
    const complete = sorted.length === max && sorted[0].volumeNo === 1;

    supplement[e.workId] = {
      source: "ndl",
      fileId: e.fileId,
      volumes: sorted.map((v) => ({
        volumeNo: v.volumeNo!,
        isbn13: v.isbn13,
        publishedDate: v.publishedDate,
        publisher: v.publisher,
      })),
      completeVolumeCount: complete ? max : null,
    };
    totalVolumes += sorted.length;
  }

  const workCount = Object.keys(supplement).length;
  const completeCount = Object.values(supplement).filter((s) => s.completeVolumeCount != null).length;

  console.log(`採用: ${workCount}作品 / ${totalVolumes}巻`);
  console.log(`  うち全巻連続特定(volumeCount更新対象): ${completeCount}作品`);
  console.log(`除外: 低信頼 ${skippedLowConfidence}作品, 有効巻なし ${skippedNoVolumes}作品 (参考: openBD未収録のまま採用 ${droppedUnverified}巻)`);

  if (!dryRun) {
    const outPath = join(process.cwd(), "data/volumes-supplement.json");
    writeFileSync(outPath, JSON.stringify(supplement, null, 2), "utf-8");
    console.log(`\n✅ ${outPath} を出力しました`);
  }
}

main();
