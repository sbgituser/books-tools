#!/usr/bin/env tsx
/**
 * enrich-volumes-ndl.ts — Phase 1-1: NDL書誌APIによる巻データ補完パイロット
 *
 * 国立国会図書館サーチ OpenSearch API から作品の巻一覧(巻番号・ISBN・発売日)を取得し、
 * openBD で ISBN を検証したうえで、既存 volumes.json との差分を
 * data/enrichment/ndl/{fileId}.json に信頼度付きで出力する。
 *
 * この段階では正規化データへの書き込みは行わない（検証レポートの生成まで）。
 * 全件のサマリーは data/enrichment/pilot-report.json に出力する。
 *
 * 使い方:
 *   npx tsx scripts/enrich-volumes-ndl.ts                 # パイロット50作品
 *   npx tsx scripts/enrich-volumes-ndl.ts --limit 10
 *   npx tsx scripts/enrich-volumes-ndl.ts --work 002teaa  # fileId/workId指定
 *   npx tsx scripts/enrich-volumes-ndl.ts --dry-run       # ファイル出力なし
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { Work, Volume } from "../src/types/work";

// ── 定数 ──────────────────────────────────────────────────────────

const NDL_ENDPOINT = "https://ndlsearch.ndl.go.jp/api/opensearch";
const OPENBD_ENDPOINT = "https://api.openbd.jp/v1/get";
/** NDLへのリクエスト間隔(ms)。公共APIなので控えめに */
const REQUEST_DELAY_MS = 1000;
/** 1作品あたりの最大取得レコード数(長期シリーズ対策) */
const MAX_RECORDS_PER_WORK = 1200;
const PAGE_SIZE = 200;

/** 検索クエリから除去する版・判型サフィックス */
const EDITION_SUFFIX_RE =
  /(〔新装版〕|【新装版】|新装版|モノクロ版|カラー版|フルカラー版|完全版|文庫版|ワイド版|愛蔵版|豪華版|新版)/g;

/** シリーズ本体ではない派生物を示す語(前方一致マッチから除外) */
const DERIVATIVE_WORDS = [
  "novel", "ノベル", "小説", "外伝", "番外編", "スピンオフ", "アンソロジー",
  "ファンブック", "公式", "ガイドブック", "イラスト", "画集", "設定資料",
  "データブック", "キャラクターブック", "映画", "劇場版", "エピソード",
];

// ── 型 ────────────────────────────────────────────────────────────

type NdlItem = {
  title: string;
  volumeRaw: string | null;
  volumeNo: number | null;
  isbn13: string | null;
  /** YYYY or YYYY-MM 形式 */
  issued: string | null;
  publisher: string | null;
  author: string | null;
  isBook: boolean;
};

type EnrichedVolume = {
  volumeNo: number | null;
  volumeLabel: string;
  isbn13: string;
  publishedDate: string | null;
  publisher: string | null;
  source: "ndl";
  openbdVerified: boolean;
  /** 既存volumes.jsonに同一ISBNが存在するか */
  existsInCurrent: boolean;
};

type WorkEnrichment = {
  workId: string;
  fileId: string;
  title: string;
  authorDisplay: string;
  confidence: "high" | "medium" | "low";
  expectedVolumeCount: number;
  existingVolumeRecords: number;
  existingWithIsbn: number;
  ndlTotalResults: number;
  ndlBookItems: number;
  volumes: EnrichedVolume[];
  newIsbnCount: number;
  /** 巻番号1..expectedVolumeCount のうちISBNが確定した割合 */
  coverageAfter: number;
  notes: string[];
};

// ── ユーティリティ ────────────────────────────────────────────────

function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ")
    .replace(/[・‐－\-～〜―…‥!！?？:：。、,，.「」『』【】〔〕()（）]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/** 検索用タイトル: 版サフィックスと囲み記号を除去し、ダッシュ類を空白化
 *  (例: "NARUTO―ナルト―" → "NARUTO ナルト"。NDL側の書誌タイトルは記号表記が揺れるため) */
function queryTitle(s: string): string {
  return s
    .replace(EDITION_SUFFIX_RE, "")
    .replace(/[〔〕【】]/g, "")
    .replace(/[―–—‐～〜]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 比較用タイトル: 版サフィックスも正規化から除外(既存データ側の「〔新装版〕」等に対応) */
function normalizeTitleForMatch(s: string): string {
  return normalizeTitle(s.replace(EDITION_SUFFIX_RE, ""));
}

function normalizeAuthor(s: string): string {
  return s.replace(/[\s　,、]/g, "").trim();
}

/** ISBN10 → ISBN13 変換。既に13桁ならチェックサム検証。無効ならnull */
function toIsbn13(raw: string): string | null {
  const digits = raw.replace(/[^0-9Xx]/g, "");
  if (digits.length === 13) {
    if (!/^\d{13}$/.test(digits)) return null;
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(digits[i], 10) * (i % 2 === 0 ? 1 : 3);
    return (10 - (sum % 10)) % 10 === parseInt(digits[12], 10) ? digits : null;
  }
  if (digits.length === 10) {
    const core = "978" + digits.substring(0, 9);
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(core[i], 10) * (i % 2 === 0 ? 1 : 3);
    const check = (10 - (sum % 10)) % 10;
    return core + check;
  }
  return null;
}

/** dcterms:issued "2018.10" / "1987" → "2018-10" / "1987" */
function normalizeIssued(s: string | null): string | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{4})(?:[.\-\/](\d{1,2}))?/);
  if (!m) return null;
  return m[2] ? `${m[1]}-${m[2].padStart(2, "0")}` : m[1];
}

function extractTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return m ? m[1].trim() : null;
}

function extractAll(block: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "g");
  const out: string[] = [];
  let m;
  while ((m = re.exec(block)) !== null) out.push(m[1].trim());
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── NDL取得 ───────────────────────────────────────────────────────

function parseNdlItems(xml: string): { total: number; items: NdlItem[] } {
  const totalM = xml.match(/<openSearch:totalResults>(\d+)<\/openSearch:totalResults>/);
  const total = totalM ? parseInt(totalM[1], 10) : 0;
  const blocks = xml.split("<item>").slice(1).map((s) => s.split("</item>")[0]);

  const items: NdlItem[] = blocks.map((b) => {
    const categories = extractAll(b, "category");
    const isbnM = b.match(/<dc:identifier xsi:type="dcndl:ISBN">([^<]+)<\/dc:identifier>/);
    const volumeRaw = extractTag(b, "dcndl:volume");
    let volumeNo: number | null = null;
    if (volumeRaw && !/セット/.test(volumeRaw)) {
      // "1" / "巻ノ58 (サブタイトル)" / "巻 10" / "第3巻" などから巻番号を抽出
      const half = volumeRaw.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
      const vm = half.match(/(\d+)/);
      if (vm) {
        const n = parseInt(vm[1], 10);
        if (n >= 1 && n <= 250) volumeNo = n;
      }
    }
    return {
      title: extractTag(b, "dc:title") ?? extractTag(b, "title") ?? "",
      volumeRaw,
      volumeNo,
      isbn13: isbnM ? toIsbn13(isbnM[1]) : null,
      issued: normalizeIssued(extractTag(b, "dcterms:issued")),
      publisher: extractTag(b, "dc:publisher"),
      author: extractTag(b, "author"),
      isBook: categories.includes("図書"),
    };
  });
  return { total, items };
}

async function fetchNdlAll(title: string, creator: string | null): Promise<{ total: number; items: NdlItem[] }> {
  const items: NdlItem[] = [];
  let total = 0;
  for (let idx = 1; idx <= MAX_RECORDS_PER_WORK; idx += PAGE_SIZE) {
    const url =
      `${NDL_ENDPOINT}?title=${encodeURIComponent(title)}` +
      (creator ? `&creator=${encodeURIComponent(creator)}` : "") +
      `&cnt=${PAGE_SIZE}&idx=${idx}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NDL API error ${res.status}`);
    const xml = await res.text();
    const parsed = parseNdlItems(xml);
    total = parsed.total;
    items.push(...parsed.items);
    if (idx + PAGE_SIZE > total || parsed.items.length === 0) break;
    await sleep(REQUEST_DELAY_MS);
  }
  return { total, items };
}

/**
 * 筆頭著者で検索し、0件なら著者なし(タイトルのみ)で再試行する。
 * 著者なし検索の結果は後段のタイトル・著者マッチングで絞り込まれる。
 */
async function fetchNdlWithFallback(
  work: Work,
): Promise<{ total: number; items: NdlItem[]; queryNote: string | null }> {
  const title = queryTitle(work.title);
  const firstAuthor = work.authors[0] ?? work.authorDisplay;
  let result = await fetchNdlAll(title, firstAuthor);
  if (result.total > 0) return { ...result, queryNote: null };
  await sleep(REQUEST_DELAY_MS);
  result = await fetchNdlAll(title, null);
  return { ...result, queryNote: result.total > 0 ? "著者なし検索で取得" : null };
}

// ── openBD検証 ────────────────────────────────────────────────────

async function verifyWithOpenBd(isbns: string[]): Promise<Map<string, { pubdate: string | null }>> {
  const verified = new Map<string, { pubdate: string | null }>();
  for (let i = 0; i < isbns.length; i += 500) {
    const batch = isbns.slice(i, i + 500);
    const res = await fetch(`${OPENBD_ENDPOINT}?isbn=${batch.join(",")}`);
    if (!res.ok) {
      console.warn(`  openBD error ${res.status} — 検証スキップ`);
      continue;
    }
    const data = (await res.json()) as Array<{ summary?: { isbn: string; pubdate?: string } } | null>;
    for (const entry of data) {
      if (entry?.summary?.isbn) {
        const raw = entry.summary.pubdate ?? null;
        // "20181004" / "2018-10" → "2018-10-04" / "2018-10"
        let pubdate: string | null = null;
        if (raw) {
          const m = raw.replace(/-/g, "").match(/^(\d{4})(\d{2})?(\d{2})?$/);
          if (m) pubdate = [m[1], m[2], m[3]].filter(Boolean).join("-");
        }
        verified.set(entry.summary.isbn, { pubdate });
      }
    }
    if (i + 500 < isbns.length) await sleep(300);
  }
  return verified;
}

// ── マッチング ────────────────────────────────────────────────────

/** NDLタイトルの主題名(サブタイトル・巻表記を除く)を取り出す */
function ndlMainTitle(title: string): string {
  return title.split(" : ")[0].replace(/[\s.]*[0-9０-９]+\s*$/, "");
}

/** 前方一致の残り部分が派生物(ノベライズ・ファンブック等)を示すか */
function looksDerivative(ndlTitleNorm: string, workTitleNorm: string): boolean {
  const rest = ndlTitleNorm.slice(workTitleNorm.length);
  if (!rest) return false;
  const lower = rest.toLowerCase();
  return DERIVATIVE_WORDS.some((w) => lower.includes(w.toLowerCase()));
}

function judgeConfidence(work: Work, bookItems: NdlItem[]): "high" | "medium" | "low" {
  if (bookItems.length === 0) return "low";
  const workTitle = normalizeTitleForMatch(work.title);
  const workAuthors = work.authors.map(normalizeAuthor);

  let titleExact = 0;
  let titlePrefix = 0;
  let authorOk = 0;
  for (const it of bookItems) {
    const main = normalizeTitleForMatch(ndlMainTitle(it.title));
    if (main === workTitle) titleExact++;
    else if (main.startsWith(workTitle) || workTitle.startsWith(main)) titlePrefix++;
    const a = it.author ? normalizeAuthor(it.author) : "";
    if (workAuthors.some((wa) => wa.length >= 2 && a.includes(wa))) authorOk++;
  }
  const authorRatio = authorOk / bookItems.length;
  if (titleExact > 0 && authorRatio >= 0.7) return "high";
  if ((titleExact > 0 || titlePrefix > 0) && authorRatio >= 0.5) return "medium";
  return "low";
}

/** 同一巻番号の複数版(新装版等)から代表を1つ選ぶ */
function pickPrimary(candidates: NdlItem[], publisherMain: string | null): NdlItem {
  if (candidates.length === 1) return candidates[0];
  const byPublisher = publisherMain
    ? candidates.filter((c) => c.publisher && publisherMain.includes(c.publisher))
    : [];
  const pool = byPublisher.length > 0 ? byPublisher : candidates;
  // 初版優先(issued が最も古いもの)
  return [...pool].sort((a, b) => (a.issued ?? "9999").localeCompare(b.issued ?? "9999"))[0];
}

// ── メイン ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  /** 全複数巻作品を対象にする(デフォルトはパイロット: 要約整備済み漫画のみ) */
  const allMode = args.includes("--all");
  /** 既に enrichment ファイルがある作品をスキップ(バッチ分割実行用) */
  const skipExisting = args.includes("--skip-existing");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 50;
  const workIdx = args.indexOf("--work");
  const targetWork = workIdx >= 0 ? args[workIdx + 1] : null;

  const works: Work[] = JSON.parse(readFileSync(join(process.cwd(), "data/normalized/works.json"), "utf-8"));
  const volumes: Volume[] = JSON.parse(readFileSync(join(process.cwd(), "data/normalized/volumes.json"), "utf-8"));
  const idMap: Record<string, string> = JSON.parse(
    readFileSync(join(process.cwd(), "public/data/work-id-map.json"), "utf-8"),
  );

  const volsByWork = new Map<string, Volume[]>();
  for (const v of volumes) {
    if (!volsByWork.has(v.workId)) volsByWork.set(v.workId, []);
    volsByWork.get(v.workId)!.push(v);
  }

  // ── 対象作品の選定 ──
  let candidates: Work[];
  if (targetWork) {
    candidates = works.filter((w) => w.workId === targetWork || idMap[w.workId] === targetWork);
    if (candidates.length === 0) {
      console.error(`作品が見つかりません: ${targetWork}`);
      process.exit(1);
    }
  } else {
    const enrichDir = join(process.cwd(), "data/enrichment/ndl");
    candidates = works
      .filter((w) => {
        if (allMode) {
          if ((w.volumeCount ?? 1) < 2) return false;
        } else {
          // パイロット: 有名作(要約整備済み)の漫画に限定
          if (w.type !== "manga" || (w.volumeCount ?? 1) < 3) return false;
          if (!w.summaryShort?.trim()) return false;
        }
        if (skipExisting && existsSync(join(enrichDir, `${idMap[w.workId] ?? w.workId}.json`))) return false;
        const vols = volsByWork.get(w.workId) ?? [];
        const withIsbn = vols.filter((v) => v.isbn13).length;
        return vols.length < w.volumeCount || withIsbn < w.volumeCount;
      })
      .sort((a, b) => (b.volumeCount ?? 0) - (a.volumeCount ?? 0))
      .slice(0, limit);
  }

  console.log(`対象: ${candidates.length}作品 (dry-run: ${dryRun})\n`);

  const outDir = join(process.cwd(), "data/enrichment/ndl");
  if (!dryRun) mkdirSync(outDir, { recursive: true });

  const results: WorkEnrichment[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const work = candidates[i];
    const fileId = idMap[work.workId] ?? work.workId;
    const existing = volsByWork.get(work.workId) ?? [];
    const existingIsbns = new Set(existing.map((v) => v.isbn13).filter(Boolean) as string[]);
    const notes: string[] = [];

    process.stdout.write(`[${i + 1}/${candidates.length}] ${work.title} (全${work.volumeCount}巻) ... `);

    let ndl: { total: number; items: NdlItem[]; queryNote: string | null };
    try {
      ndl = await fetchNdlWithFallback(work);
      if (ndl.queryNote) notes.push(ndl.queryNote);
    } catch (e) {
      console.log(`NDL取得失敗: ${e}`);
      notes.push(`NDL取得失敗: ${e}`);
      results.push({
        workId: work.workId, fileId, title: work.title, authorDisplay: work.authorDisplay,
        confidence: "low", expectedVolumeCount: work.volumeCount ?? 1,
        existingVolumeRecords: existing.length, existingWithIsbn: existingIsbns.size,
        ndlTotalResults: 0, ndlBookItems: 0, volumes: [], newIsbnCount: 0, coverageAfter: 0, notes,
      });
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    const bookItems = ndl.items.filter((it) => it.isBook && it.isbn13);
    const confidence = judgeConfidence(work, bookItems);

    // タイトル一致したアイテムを巻候補にする。
    // 完全一致を優先し、前方一致は派生物(ノベライズ等)を除外したうえで補完にのみ使う
    const workTitleNorm = normalizeTitleForMatch(work.title);
    const exactMatched: NdlItem[] = [];
    const prefixMatched: NdlItem[] = [];
    for (const it of bookItems) {
      const main = normalizeTitleForMatch(ndlMainTitle(it.title));
      if (main === workTitleNorm) {
        exactMatched.push(it);
      } else if (main.startsWith(workTitleNorm) && !looksDerivative(main, workTitleNorm)) {
        prefixMatched.push(it);
      } else if (
        // 逆方向: 既存タイトル側が長い場合(例: 作品名「NARUTO―ナルト―」 vs NDL「NARUTO」)。
        // 短すぎる主題名の誤マッチを避けるため、作品名の半分以上の長さを要求する
        workTitleNorm.startsWith(main) &&
        main.length >= Math.max(3, Math.ceil(workTitleNorm.length / 2))
      ) {
        prefixMatched.push(it);
      }
    }

    /** 巻番号を決定(dcndl:volume → タイトル末尾の数字の順で試す) */
    const resolveVolumeNo = (it: NdlItem): number | null => {
      if (it.volumeNo != null) return it.volumeNo;
      // "テニスの王子様 1" のようにタイトル側に巻数があるケース。
      // 作品名自体が数字で終わる場合(アイシールド21等)を考慮し、主題名を除いた残りから抽出する
      const raw = it.title.split(" : ")[0].trim();
      const m = raw.match(/[\s.．]([0-9０-９]{1,3})\s*$/);
      if (!m) return null;
      const n = parseInt(m[1].replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)), 10);
      return Number.isFinite(n) && n >= 1 && n <= 250 ? n : null;
    };

    // 巻番号でグループ化して代表を選ぶ(完全一致を優先、前方一致は不足巻の補完のみ)
    const byVolume = new Map<number, NdlItem[]>();
    for (const it of exactMatched) {
      const volNo = resolveVolumeNo(it);
      if (volNo == null) continue;
      if (!byVolume.has(volNo)) byVolume.set(volNo, []);
      byVolume.get(volNo)!.push(it);
    }
    for (const it of prefixMatched) {
      const volNo = resolveVolumeNo(it);
      if (volNo == null || byVolume.has(volNo)) continue;
      byVolume.set(volNo, [it]);
    }
    const matched = [...exactMatched, ...prefixMatched];

    const enriched: EnrichedVolume[] = [];
    for (const [volNo, cands] of [...byVolume.entries()].sort((a, b) => a[0] - b[0])) {
      const primary = pickPrimary(cands, work.publisherMain ?? null);
      enriched.push({
        volumeNo: volNo,
        volumeLabel: `${volNo}巻`,
        isbn13: primary.isbn13!,
        publishedDate: primary.issued,
        publisher: primary.publisher,
        source: "ndl",
        openbdVerified: false,
        existsInCurrent: existingIsbns.has(primary.isbn13!),
      });
    }

    const newIsbns = enriched.filter((v) => !v.existsInCurrent);
    const expected = work.volumeCount ?? 1;
    const covered = new Set(enriched.map((v) => v.volumeNo).filter((n) => n != null && n >= 1 && n <= expected));
    const coverageAfter = expected > 0 ? covered.size / expected : 0;

    if (byVolume.size === 0 && matched.length > 0) notes.push("タイトル一致はあるが巻番号(dcndl:volume)なし");
    if (ndl.total >= MAX_RECORDS_PER_WORK) notes.push(`NDL結果${ndl.total}件中${MAX_RECORDS_PER_WORK}件で打ち切り`);

    results.push({
      workId: work.workId, fileId, title: work.title, authorDisplay: work.authorDisplay,
      confidence, expectedVolumeCount: expected,
      existingVolumeRecords: existing.length, existingWithIsbn: existingIsbns.size,
      ndlTotalResults: ndl.total, ndlBookItems: bookItems.length,
      volumes: enriched, newIsbnCount: newIsbns.length,
      coverageAfter: Math.round(coverageAfter * 100) / 100, notes,
    });

    console.log(
      `NDL ${ndl.total}件 → 巻特定 ${enriched.length}/${expected} (新規ISBN ${newIsbns.length}) [${confidence}]`,
    );
    await sleep(REQUEST_DELAY_MS);
  }

  // ── openBD検証 ──
  const allIsbns = [...new Set(results.flatMap((r) => r.volumes.map((v) => v.isbn13)))];
  console.log(`\nopenBD検証: ${allIsbns.length} ISBN ...`);
  const verified = await verifyWithOpenBd(allIsbns);
  for (const r of results) {
    for (const v of r.volumes) {
      const hit = verified.get(v.isbn13);
      if (hit) {
        v.openbdVerified = true;
        // openBDの日付の方が精度が高い(YYYY-MM-DD)場合は置き換え
        if (hit.pubdate && (!v.publishedDate || hit.pubdate.length > v.publishedDate.length)) {
          v.publishedDate = hit.pubdate;
        }
      }
    }
  }
  const verifiedCount = results.flatMap((r) => r.volumes).filter((v) => v.openbdVerified).length;
  console.log(`openBD一致: ${verifiedCount}/${results.flatMap((r) => r.volumes).length}`);

  // ── 出力 ──
  if (!dryRun) {
    for (const r of results) {
      writeFileSync(join(outDir, `${r.fileId}.json`), JSON.stringify(r, null, 2), "utf-8");
    }
    const report = {
      generatedAt: new Date().toISOString(),
      totalWorks: results.length,
      byConfidence: {
        high: results.filter((r) => r.confidence === "high").length,
        medium: results.filter((r) => r.confidence === "medium").length,
        low: results.filter((r) => r.confidence === "low").length,
      },
      totalNewIsbns: results.reduce((s, r) => s + r.newIsbnCount, 0),
      avgCoverageAfter:
        Math.round((results.reduce((s, r) => s + r.coverageAfter, 0) / Math.max(1, results.length)) * 100) / 100,
      openbdVerifiedRatio:
        Math.round((verifiedCount / Math.max(1, results.flatMap((r) => r.volumes).length)) * 100) / 100,
      works: results.map((r) => ({
        fileId: r.fileId, title: r.title, confidence: r.confidence,
        expected: r.expectedVolumeCount, found: r.volumes.length,
        newIsbns: r.newIsbnCount, coverage: r.coverageAfter, notes: r.notes,
      })),
    };
    writeFileSync(join(process.cwd(), "data/enrichment/pilot-report.json"), JSON.stringify(report, null, 2), "utf-8");
    console.log(`\n✅ data/enrichment/ndl/ に${results.length}件、pilot-report.json を出力しました`);
  }

  // ── サマリー表示 ──
  console.log("\n── サマリー ──");
  console.log(`high: ${results.filter((r) => r.confidence === "high").length}件 / medium: ${results.filter((r) => r.confidence === "medium").length}件 / low: ${results.filter((r) => r.confidence === "low").length}件`);
  console.log(`新規ISBN合計: ${results.reduce((s, r) => s + r.newIsbnCount, 0)}`);
  const lowWorks = results.filter((r) => r.confidence === "low");
  if (lowWorks.length > 0) {
    console.log("\n低信頼(要確認):");
    for (const r of lowWorks) console.log(`  - ${r.title} (${r.fileId}): NDL ${r.ndlTotalResults}件, ${r.notes.join("; ")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
