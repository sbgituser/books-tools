#!/usr/bin/env tsx
/**
 * fix-manga-vol1-patch.ts
 *
 * 前回スクリプトで誤ったGB IDが入ったエントリを修正する。
 * intitle: クエリで精度を上げ、シリーズ名一致チェックを追加。
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const BOOK_INDEX_PATH = join(process.cwd(), "src/data/books.index.json");
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY ?? "";
const SLEEP_MS = 350;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GBVolumeInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  language?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
  imageLinks?: { thumbnail?: string };
}
interface GBItem { id: string; volumeInfo: GBVolumeInfo; }

function extractIsbn13(item: GBItem): string | undefined {
  return item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier;
}

function buildThumb(gbId: string): string {
  return `https://books.google.com/books/content?id=${gbId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
}

function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase().replace(/[\s\u3000]+/g, "").replace(/[^\p{L}\p{N}]/gu, "");
}

async function searchGB(query: string): Promise<GBItem[]> {
  const keyParam = API_KEY ? `&key=${API_KEY}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=15&langRestrict=ja${keyParam}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: GBItem[] };
    return data.items ?? [];
  } catch { return []; }
}

/**
 * シリーズ名 + 第1巻を探す。
 * 複数クエリを試して最初に見つかった正しい1巻を返す。
 */
async function findVol1(
  queries: string[],
  seriesNameKey: string, // 正規化したシリーズ名（部分一致チェック用）
): Promise<GBItem | null> {
  const vol1Pats = [/[(\s（]1[)）\s$]/, /[（\(]１[）\)]/, / 1$/, /（１）/, /\(1\)$/, / 1巻/, /第1巻/];
  const badPats = [/[（\(][2-9０-９][）\)]/, /[（\(]\d{2,}[）\)]/, /\d{2,}巻/, /ファンブック/, /ガイドブック/, /公式ガイド/, /読本/, /外伝/, /スピンオフ/, /解読/, /考察/, /愛読団/, /全史/, /研究/, /雑誌/, /ムック/, /月刊/, /週刊/, /増刊/, /解説/, /特装版|限定版/, /分冊/, /総集編/, /完全版\s*\d/, /短編集/, /英語/, /大解剖/, /秘密/];

  for (const q of queries) {
    const items = await searchGB(q);
    await sleep(SLEEP_MS);

    for (const item of items) {
      const t = item.volumeInfo?.title ?? "";
      const tn = normalize(t);

      // シリーズ名が含まれているか
      if (!tn.includes(seriesNameKey)) continue;
      // 悪いパターンを除外
      if (badPats.some((p) => p.test(t))) continue;
      // 1巻っぽいか確認
      if (vol1Pats.some((p) => p.test(t))) return item;
    }

    // 1巻パターンが無くてもシリーズ名が入っていて悪いパターンが無い最初のもの
    for (const item of items) {
      const t = item.volumeInfo?.title ?? "";
      const tn = normalize(t);
      if (!tn.includes(seriesNameKey)) continue;
      if (badPats.some((p) => p.test(t))) continue;
      // 2巻以上を示す数字が入っていないか
      const highNum = /[（\(][2-9０-９][）\)]|[（\(]\d{2,}[）\)]|\s[2-9０-９]$|\s\d{2,}$|(\(|（)[2-9０-９](\)|）)/;
      if (highNum.test(t)) continue;
      return item;
    }
  }
  return null;
}

// ── パッチリスト ───────────────────────────────────────────────
interface PatchTarget {
  id: string;
  seriesTitle: string;
  queries: string[];
  nameKey: string; // normalize したシリーズ名の部分一致キー
}

const PATCHES: PatchTarget[] = [
  { id: "gb-blog-hunterhunter",     seriesTitle: "HUNTER×HUNTER",     nameKey: "hunterxhunter",     queries: ['intitle:"HUNTER×HUNTER" 1', 'HUNTER×HUNTER（１）'] },
  { id: "gb-blog-バキ",              seriesTitle: "グラップラー刃牙",  nameKey: "グラップラー刃牙",   queries: ['intitle:"グラップラー刃牙" 1', '"グラップラー刃牙（１）"'] },
  { id: "gb-blog-彼岸島",            seriesTitle: "彼岸島",            nameKey: "彼岸島",             queries: ['intitle:"彼岸島" 1 松本光司 -48', '"彼岸島（１）"'] },
  { id: "gb-blog-なるたる",          seriesTitle: "なるたる",          nameKey: "なるたる",           queries: ['intitle:"なるたる" 1 鬼頭莫宏', '"なるたる（１）"'] },
  { id: "gb-blog-漂流教室",          seriesTitle: "漂流教室",          nameKey: "漂流教室",           queries: ['intitle:"漂流教室" 1 楳図', '"漂流教室（１）"'] },
  { id: "gb-blog-学校怪談",          seriesTitle: "学校怪談",          nameKey: "学校怪談",           queries: ['"学校怪談（１）"', 'intitle:"学校怪談" 1 漫画'] },
  { id: "gb-blog-見える子ちゃん",    seriesTitle: "見える子ちゃん",    nameKey: "見えるこちゃん",     queries: ['intitle:"見える子ちゃん" 1 泉朝樹', '"見える子ちゃん　１"'] },
  { id: "gb-blog-slamdunk",          seriesTitle: "SLAM DUNK",         nameKey: "slamdunk",           queries: ['intitle:"SLAM DUNK" 1 井上雄彦', '"スラムダンク 1"', '"スラムダンク（１）"'] },
  { id: "gb-blog-giantkilling",      seriesTitle: "Giant Killing",     nameKey: "giantkilling",       queries: ['intitle:"GIANT KILLING" 1 ツジトモ', '"GIANT KILLING（１）"'] },
  { id: "gb-blog-days",              seriesTitle: "SAKAMOTO DAYS",     nameKey: "sakamotodays",       queries: ['intitle:"SAKAMOTO DAYS" 1 鈴木祐斗', '"SAKAMOTO DAYS 1"'] },
  { id: "gb-blog-ベルセルク",        seriesTitle: "ベルセルク",        nameKey: "ベルセルク",         queries: ['intitle:"ベルセルク" 1 三浦建太郎', '"ベルセルク　1"', '"ベルセルク（１）"'] },
  { id: "gb-blog-七つの大罪",        seriesTitle: "七つの大罪",        nameKey: "七つの大罪",         queries: ['intitle:"七つの大罪" 1 鈴木央', '"七つの大罪（１）"'] },
  { id: "gb-blog-fairytail",         seriesTitle: "FAIRY TAIL",        nameKey: "fairytail",          queries: ['intitle:"FAIRY TAIL" 1 真島ヒロ -ハッピー', '"FAIRY TAIL（１）"'] },
  { id: "gb-blog-暁のヨナ",          seriesTitle: "暁のヨナ",          nameKey: "暁のヨナ",           queries: ['intitle:"暁のヨナ" 1 草凪みずほ', '"暁のヨナ（１）"'] },
  { id: "gb-blog-ヴァニタスの手記",  seriesTitle: "ヴァニタスの手記",  nameKey: "ヴァニタスの手記",   queries: ['intitle:"ヴァニタスの手記" 1 望月淳', '"ヴァニタスの手記(1)"'] },
  { id: "gb-blog-転生したらスライムだった件", seriesTitle: "転生したらスライムだった件", nameKey: "転生したらスライムだった件", queries: ['intitle:"転生したらスライムだった件" 漫画 1 川上泰樹', '"転生したらスライムだった件（１）"'] },
  { id: "gb-blog-オーバーロード",    seriesTitle: "オーバーロード",    nameKey: "オーバーロード",     queries: ['intitle:"オーバーロード" 漫画 1 長月達平 竹村洋平', '"オーバーロード（１）"'] },
  { id: "gb-blog-3月のライオン",     seriesTitle: "3月のライオン",     nameKey: "3月のライオン",      queries: ['intitle:"3月のライオン" 1 羽海野チカ', '"3月のライオン（１）"'] },
  { id: "gb-blog-魔法陣グルグル",    seriesTitle: "魔法陣グルグル",    nameKey: "魔法陣グルグル",     queries: ['intitle:"魔法陣グルグル" 1 衛藤ヒロユキ -外伝', '"魔法陣グルグル　1"'] },
  { id: "blog-鋼の錬金術師-荒川弘",  seriesTitle: "鋼の錬金術師",      nameKey: "鋼の錬金術師",       queries: ['intitle:"鋼の錬金術師" 1 荒川弘 -イラスト', '"鋼の錬金術師（１）"'] },
  { id: "blog-進撃の巨人-諫山創",    seriesTitle: "進撃の巨人",        nameKey: "進撃の巨人",         queries: ['intitle:"進撃の巨人" 1 諫山創 -悔いなき', '"進撃の巨人（１）"'] },
  { id: "blog-鬼滅の刃-吾峠呼世晴",  seriesTitle: "鬼滅の刃",          nameKey: "鬼滅の刃",           queries: ['intitle:"鬼滅の刃" 1 吾峠呼世晴', '"鬼滅の刃（１）"'] },
  { id: "blog-ハイキュー-古舘春一",   seriesTitle: "ハイキュー!!",       nameKey: "ハイキュー",         queries: ['intitle:"ハイキュー!!" 1 古舘春一 -れっつ', '"ハイキュー!!（１）"'] },
  { id: "blog-deathnote-大場つぐみ小畑健", seriesTitle: "DEATH NOTE", nameKey: "deathnote",          queries: ['intitle:"DEATH NOTE" 1 大場つぐみ 小畑健', '"DEATH NOTE（１）"', '"DEATH NOTE 1"'] },
  { id: "blog-メイドインアビス-つくしあきひと", seriesTitle: "メイドインアビス", nameKey: "メイドインアビス", queries: ['intitle:"メイドインアビス" 1 つくしあきひと -分冊 -図説', '"メイドインアビス（１）"'] },
  { id: "blog-宇宙兄弟-小山宙哉",    seriesTitle: "宇宙兄弟",          nameKey: "宇宙兄弟",           queries: ['intitle:"宇宙兄弟" 1 小山宙哉 -カラー', '"宇宙兄弟（１）"'] },
  { id: "blog-寄生獣-岩明均",        seriesTitle: "寄生獣",            nameKey: "寄生獣",             queries: ['intitle:"寄生獣" 1 岩明均 -リバーシ -ネオ', '"寄生獣（１）"'] },
  { id: "blog-monster-浦沢直樹",     seriesTitle: "MONSTER",           nameKey: "monster",            queries: ['intitle:"MONSTER" 1 浦沢直樹 -完全版', '"MONSTER（１）"'] },
  { id: "blog-ヒカルの碁-ほったゆみ小畑健", seriesTitle: "ヒカルの碁", nameKey: "ヒカルの碁",         queries: ['intitle:"ヒカルの碁" 1 小畑健 ほった', '"ヒカルの碁（１）"'] },
  { id: "blog-タッチ-あだち充",       seriesTitle: "タッチ",            nameKey: "タッチ",             queries: ['intitle:"タッチ" 1 あだち充 -ポスター', '"タッチ（１）"'] },
  { id: "gb-blog-葬送のフリーレン",   seriesTitle: "葬送のフリーレン",  nameKey: "葬送のフリーレン",   queries: ['intitle:"葬送のフリーレン" 1 山田鐘人', '"葬送のフリーレン（１）"'] },
  { id: "gb-blog-ダンダダン",         seriesTitle: "ダンダダン",        nameKey: "ダンダダン",         queries: ['intitle:"ダンダダン" 1 龍幸伸', '"ダンダダン（１）"'] },
  { id: "gb-blog-怪獣8号",            seriesTitle: "怪獣8号",           nameKey: "怪獣8号",            queries: ['intitle:"怪獣8号" 1 松本直也', '"怪獣8号（１）"'] },
  { id: "gb-blog-薬屋のひとりごと",   seriesTitle: "薬屋のひとりごと", nameKey: "薬屋のひとりごと",   queries: ['intitle:"薬屋のひとりごと" 漫画 1 日向夏 三上和行', '"薬屋のひとりごと（１）"'] },
  { id: "gb-blog-ブルーロック",       seriesTitle: "ブルーロック",      nameKey: "ブルーロック",       queries: ['intitle:"ブルーロック" 1 金城宗幸 ノ村優介 -凪 -EPISODE', '"ブルーロック（１）"'] },
  { id: "gb-blog-呪術廻戦",           seriesTitle: "呪術廻戦",          nameKey: "呪術廻戦",           queries: ['intitle:"呪術廻戦" 1 芥見下々', '"呪術廻戦（１）"'] },
  { id: "gb-blog-キングダム",         seriesTitle: "キングダム",        nameKey: "キングダム",         queries: ['intitle:"キングダム" 1 原泰久 -ガイドブック -英傑', '"キングダム（１）"'] },
  { id: "gb-blog-メダリスト",         seriesTitle: "メダリスト",        nameKey: "メダリスト",         queries: ['intitle:"メダリスト" 1 つるまいかだ -小説', '"メダリスト（１）"'] },
  { id: "gb-blog-アオアシ",           seriesTitle: "アオアシ",          nameKey: "アオアシ",           queries: ['intitle:"アオアシ" 1 小林有吾', '"アオアシ（１）"'] },
  { id: "gb-blog-光が死んだ夏",       seriesTitle: "光が死んだ夏",      nameKey: "光が死んだ夏",       queries: ['intitle:"光が死んだ夏" 1 モリタイシ', '"光が死んだ夏（１）"'] },
  { id: "gb-blog-exarm",              seriesTitle: "EX-ARM エクスアーム", nameKey: "exarm",            queries: ['intitle:"EX-ARM" 1 古味慎也 -EXA', '"EX-ARM エクスアーム（１）"'] },
  { id: "gb-blog-ヴィンランドサガ",   seriesTitle: "ヴィンランド・サガ", nameKey: "ヴィンランド",       queries: ['intitle:"ヴィンランド・サガ" 1 幸村誠 -特別', '"ヴィンランド・サガ（１）"'] },
];

type BookEntry = Record<string, unknown>;

async function main() {
  const raw = readFileSync(BOOK_INDEX_PATH, "utf-8");
  const books: BookEntry[] = JSON.parse(raw);
  const bookMap = new Map(books.map((b) => [b.id as string, b]));

  let updated = 0;
  let skipped = 0;

  for (const patch of PATCHES) {
    const book = bookMap.get(patch.id);
    if (!book) { console.log(`⚠ ID not found: ${patch.id}`); continue; }

    console.log(`\n📖 [${patch.id}]`);

    const vol1 = await findVol1(patch.queries, normalize(patch.nameKey));

    if (!vol1) {
      console.log(`   ⚠ 1巻見つからず → スキップ (title="${patch.seriesTitle}" のまま保持)`);
      skipped++;
      continue;
    }

    const gbId = vol1.id;
    const isbn13 = extractIsbn13(vol1);
    const apiTitle = vol1.volumeInfo.title ?? patch.seriesTitle;

    console.log(`   → ${gbId}  "${apiTitle}"  ${isbn13 ?? "(isbn無し)"}`);

    book.title = patch.seriesTitle;
    book.sourceIds = { googleBooksId: gbId };
    book.thumbnailUrl = buildThumb(gbId);
    if (isbn13) book.isbn13 = isbn13;
    else delete book.isbn13;

    updated++;
  }

  writeFileSync(BOOK_INDEX_PATH, JSON.stringify(books, null, 2));
  console.log(`\n✅ 保存完了  更新:${updated}件  スキップ:${skipped}件`);
}

main().catch(console.error);
