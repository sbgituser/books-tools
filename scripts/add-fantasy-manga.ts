#!/usr/bin/env tsx
/**
 * add-fantasy-manga.ts
 * ファンタジー漫画30作品を books.index.json に追加する
 */

import * as fs from "fs";
import * as path from "path";

{
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  }
}

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
if (!API_KEY) { console.error("GOOGLE_BOOKS_API_KEY が設定されていません"); process.exit(1); }

const INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

const TARGETS: Array<{
  title: string;
  searchTitle: string;
  author: string;
  l2Id: string;
  l3Id: string;
  expectedFragment: string;
}> = [
  // ─── 少年誌ファンタジー ────────────────────────────────────────────
  { title: "ソードアート・オンライン アインクラッド",    searchTitle: "ソードアート・オンライン アインクラッド", author: "渡辺信一郎",   l2Id: "shonen", l3Id: "fantasy",  expectedFragment: "アインクラッド" },
  { title: "スライム倒して300年、知らないうちにレベルMAXになってました", searchTitle: "スライム倒して300年",              author: "森沢晴行",     l2Id: "shonen", l3Id: "isekai",   expectedFragment: "スライム倒して" },
  { title: "ありふれた職業で世界最強",                  searchTitle: "ありふれた職業で世界最強",               author: "宮崎猛",       l2Id: "shonen", l3Id: "isekai",   expectedFragment: "ありふれた職業" },
  { title: "骸骨騎士様、只今異世界へお出掛け中",         searchTitle: "骸骨騎士様",                           author: "ぽこ",         l2Id: "shonen", l3Id: "isekai",   expectedFragment: "骸骨騎士" },
  { title: "魔王学院の不適合者",                        searchTitle: "魔王学院の不適合者",                    author: "阿久井真",     l2Id: "shonen", l3Id: "fantasy",  expectedFragment: "魔王学院" },
  { title: "聖女の魔力は万能です",                      searchTitle: "聖女の魔力は万能です",                  author: "桑原光太",     l2Id: "shonen", l3Id: "fantasy",  expectedFragment: "聖女の魔力" },
  { title: "最果てのパラディン",                        searchTitle: "最果てのパラディン",                    author: "柴本蒸留",     l2Id: "shonen", l3Id: "fantasy",  expectedFragment: "パラディン" },
  { title: "蜘蛛ですが、なにか？",                      searchTitle: "蜘蛛ですが なにか",                    author: "かかし朝浩",   l2Id: "shonen", l3Id: "isekai",   expectedFragment: "蜘蛛ですが" },
  { title: "七つの魔剣が支配する",                      searchTitle: "七つの魔剣が支配する",                  author: "中西達哉",     l2Id: "shonen", l3Id: "fantasy",  expectedFragment: "七つの魔剣" },
  { title: "幼女戦記",                                 searchTitle: "幼女戦記",                             author: "東條チカ",     l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "幼女戦記" },

  // ─── 青年誌ファンタジー ────────────────────────────────────────────
  { title: "ゴブリンスレイヤー",                        searchTitle: "ゴブリンスレイヤー",                    author: "足立慎吾",     l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "ゴブリンスレイヤー" },
  { title: "魔女の旅々",                               searchTitle: "魔女の旅々",                           author: "七緒一綺",     l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "魔女の旅" },
  { title: "異世界居酒屋「のぶ」",                      searchTitle: "異世界居酒屋 のぶ",                    author: "ヴァルネリア", l2Id: "seinen", l3Id: "isekai",   expectedFragment: "居酒屋" },
  { title: "影の実力者になりたくて！",                   searchTitle: "影の実力者になりたくて",                author: "坂野杏梨",     l2Id: "seinen", l3Id: "isekai",   expectedFragment: "影の実力者" },
  { title: "回復術士のやり直し",                        searchTitle: "回復術士のやり直し",                    author: "しおこんぶ",   l2Id: "seinen", l3Id: "isekai",   expectedFragment: "回復術士" },
  { title: "ゼロの使い魔",                              searchTitle: "ゼロの使い魔",                         author: "八重垣友博",   l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "ゼロの使い魔" },
  { title: "迷宮ブラックカンパニー",                    searchTitle: "迷宮ブラックカンパニー",                 author: "安田剛助",     l2Id: "seinen", l3Id: "isekai",   expectedFragment: "ブラックカンパニー" },
  { title: "ロードス島戦記",                            searchTitle: "ロードス島戦記",                        author: "出渕裕",       l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "ロードス" },
  { title: "スレイヤーズ",                              searchTitle: "スレイヤーズ",                         author: "大嶋高明",     l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "スレイヤーズ" },
  { title: "狼と香辛料",                               searchTitle: "狼と香辛料",                           author: "文倉十",       l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "狼と香辛料" },
  { title: "賢者の孫",                                 searchTitle: "賢者の孫",                             author: "吉岡剛",       l2Id: "seinen", l3Id: "isekai",   expectedFragment: "賢者の孫" },

  // ─── 少女誌・乙女ファンタジー ──────────────────────────────────────
  { title: "魔法騎士レイアース",                        searchTitle: "魔法騎士レイアース",                    author: "CLAMP",        l2Id: "shojo",  l3Id: "fantasy",  expectedFragment: "レイアース" },
  { title: "美少女戦士セーラームーン",                   searchTitle: "美少女戦士セーラームーン",               author: "武内直子",     l2Id: "shojo",  l3Id: "fantasy",  expectedFragment: "セーラームーン" },
  { title: "乙女ゲームの破滅フラグしかない悪役令嬢に転生してしまった…", searchTitle: "乙女ゲームの破滅フラグ",  author: "サブロウタ",   l2Id: "shojo",  l3Id: "isekai",   expectedFragment: "破滅フラグ" },
  { title: "私の推しは悪役令嬢。",                      searchTitle: "私の推しは悪役令嬢",                    author: "いのり。",     l2Id: "shojo",  l3Id: "fantasy",  expectedFragment: "推しは悪役" },
  { title: "転生王女と天才令嬢の魔法革命",               searchTitle: "転生王女と天才令嬢の魔法革命",           author: "岩柄イズカ",   l2Id: "shojo",  l3Id: "isekai",   expectedFragment: "転生王女" },
  { title: "魔法少女まどか☆マギカ",                    searchTitle: "魔法少女まどか マギカ",                 author: "ハノカゲ",     l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "まどか" },

  // ─── isekai・その他 ────────────────────────────────────────────────
  { title: "デート・ア・ライブ",                        searchTitle: "デート・ア・ライブ",                    author: "仮名",         l2Id: "shonen", l3Id: "fantasy",  expectedFragment: "デート・ア・ライブ" },
  { title: "聖剣学院の魔剣使い",                        searchTitle: "聖剣学院の魔剣使い",                    author: "多田",         l2Id: "shonen", l3Id: "fantasy",  expectedFragment: "魔剣使い" },
  { title: "魔術師オーフェン",                          searchTitle: "魔術師オーフェン",                      author: "草河遊也",     l2Id: "seinen", l3Id: "fantasy",  expectedFragment: "オーフェン" },
];

interface GBVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: { type: string; identifier: string }[];
    language?: string;
  };
}

async function searchByQuery(query: string): Promise<GBVolume[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=5&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json() as { items?: GBVolume[] };
  return data.items ?? [];
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function thumbnailUrl(gbId: string): string {
  return `https://books.google.com/books/content?id=${gbId}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`;
}

async function main() {
  const index: Record<string, unknown>[] = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const existingIds = new Set(index.map(b => b.id as string));
  const existingGbIds = new Set(
    index.map(b => (b.sourceIds as { googleBooksId?: string } | undefined)?.googleBooksId).filter(Boolean)
  );
  const existingTitles = new Set(index.map(b =>
    (b.title as string | undefined)?.replace(/\s*(モノクロ版|カラー版)?\s*[\d（）()１-９]+.*$/, "").trim()
  ));

  let added = 0;
  const notFound: string[] = [];

  for (const target of TARGETS) {
    if (existingTitles.has(target.title)) {
      console.log(`SKIP (exists): ${target.title}`);
      continue;
    }

    console.log(`Searching: ${target.title}`);

    let vols = await searchByQuery(`intitle:${target.searchTitle} inauthor:${target.author}`);
    await delay(400);

    if (!vols.find(v => v.volumeInfo.title?.includes(target.expectedFragment))) {
      vols = await searchByQuery(`intitle:${target.searchTitle}`);
      await delay(400);
    }

    const vol = vols.find(v => v.volumeInfo.title?.includes(target.expectedFragment));
    if (!vol) {
      console.warn(`  NOT FOUND: ${target.title} [${vols.map(v => v.volumeInfo.title).join(", ") || "none"}]`);
      notFound.push(target.title);
      continue;
    }

    const gbId = vol.id;
    if (existingGbIds.has(gbId)) {
      console.log(`  SKIP (gbId exists): ${vol.volumeInfo.title}`);
      continue;
    }

    const vi = vol.volumeInfo;
    const isbn13 = vi.industryIdentifiers?.find(x => x.type === "ISBN_13")?.identifier;
    const isbn10 = vi.industryIdentifiers?.find(x => x.type === "ISBN_10")?.identifier;
    const finalId = isbn13 ?? `gb-${gbId}`;

    if (existingIds.has(finalId)) {
      console.log(`  SKIP (id exists): ${finalId}`);
      continue;
    }

    const entry: Record<string, unknown> = {
      id: finalId,
      title: target.title,
      authors: vi.authors ?? [target.author],
      categories: ["Comics & Graphic Novels"],
      keywords: ["Comics & Graphic Novels"],
      searchableText: [target.title, ...(vi.authors ?? [target.author]), vi.publisher].filter(Boolean).join(" "),
      updatedAt: new Date().toISOString(),
      language: vi.language ?? "ja",
      thumbnailUrl: thumbnailUrl(gbId),
      sourceIds: { googleBooksId: gbId },
      manualClassification: { l1Id: "manga", l2Id: target.l2Id, l3Id: target.l3Id },
    };

    if (vi.publisher) entry.publisher = vi.publisher;
    if (vi.publishedDate) entry.publishedDate = vi.publishedDate;
    if (isbn10) entry.isbn10 = isbn10;
    if (isbn13) entry.isbn13 = isbn13;
    if (vi.pageCount) entry.pageCount = vi.pageCount;

    index.push(entry);
    existingIds.add(finalId);
    existingGbIds.add(gbId);
    existingTitles.add(target.title);
    added++;
    console.log(`  ADDED: ${target.title} [${finalId}] (GB: ${gbId})`);
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\n✓ books.index.json updated (+${added} entries, total: ${index.length})`);
  if (notFound.length) {
    console.log(`\n未登録 (${notFound.length}件): ${notFound.join(", ")}`);
  }
}

main().catch(console.error);
