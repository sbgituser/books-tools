#!/usr/bin/env tsx
/**
 * fill-missing-authors.ts
 * 著者情報が未取得のエントリをGoogle Books APIタイトル検索で補完するスクリプト
 * ISBNは誤っている可能性があるため使用しない。漫画カテゴリを優先処理。
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

const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

async function fetchByTitle(title: string, isManga: boolean): Promise<any | null> {
  // 漫画は "漫画" キーワードを付加して検索精度を上げる
  const query = isManga ? `${title} 漫画` : title;
  const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&langRestrict=ja&maxResults=10&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  if (!data.items) return null;

  // タイトルの先頭6文字で一致確認（短いタイトルは全体一致も許容）
  const key = title.substring(0, Math.min(6, title.length));
  return data.items.find((item: any) => {
    const t: string = item.volumeInfo?.title ?? "";
    return t.includes(key) || title.includes(t.substring(0, Math.min(6, t.length)));
  }) ?? null;
}

async function main() {
  const books: any[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));

  const allTargets = books.filter(b => !b.authors || b.authors.length === 0);
  // 漫画を先に処理
  const manga = allTargets.filter(b => b.manualClassification?.l1Id === "manga");
  const other = allTargets.filter(b => b.manualClassification?.l1Id !== "manga");
  const targets = [...manga, ...other];

  console.log(`著者未取得: ${targets.length}件 (漫画: ${manga.length}件、その他: ${other.length}件)`);
  console.log("※ ISBNは使用せずタイトル検索のみで取得します\n");

  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < targets.length; i++) {
    const book = targets[i];
    const isManga = book.manualClassification?.l1Id === "manga";
    const label = isManga ? "[漫画]" : "[書籍]";
    process.stdout.write(`[${i + 1}/${targets.length}]${label} ${book.title?.substring(0, 28)}...`);

    if (!book.title) {
      console.log(" ⚠ タイトルなし");
      notFound++;
      continue;
    }

    const item = await fetchByTitle(book.title, isManga);

    if (!item) {
      console.log(" ⚠ 未発見");
      notFound++;
      await new Promise(r => setTimeout(r, 150));
      continue;
    }

    const info = item.volumeInfo;
    const authors: string[] = info.authors ?? [];
    const publisher: string | undefined = info.publisher;
    const publishedDate: string | undefined = info.publishedDate;
    const pageCount: number | undefined = info.pageCount;
    const thumbnailUrl: string | undefined =
      info.imageLinks?.thumbnail?.replace("http://", "https://") ??
      info.imageLinks?.smallThumbnail?.replace("http://", "https://");

    const idx = books.findIndex(b => b.id === book.id);
    if (idx === -1) { console.log(" ⚠ index未発見"); continue; }

    let changed = false;
    if (authors.length > 0 && (!books[idx].authors || books[idx].authors.length === 0)) {
      books[idx].authors = authors;
      changed = true;
    }
    if (publisher && !books[idx].publisher) {
      books[idx].publisher = publisher;
      changed = true;
    }
    if (publishedDate && !books[idx].publishedDate) {
      books[idx].publishedDate = publishedDate;
      changed = true;
    }
    if (pageCount && !books[idx].pageCount) {
      books[idx].pageCount = pageCount;
      changed = true;
    }
    if (thumbnailUrl && !books[idx].thumbnailUrl) {
      books[idx].thumbnailUrl = thumbnailUrl;
      changed = true;
    }

    if (changed) {
      const keywords: string[] = books[idx].keywords ?? [];
      books[idx].searchableText = [
        books[idx].title ?? "",
        books[idx].subtitle,
        ...books[idx].authors,
        books[idx].publisher ?? "",
        ...keywords,
      ].filter(Boolean).join(" ");
      books[idx].updatedAt = new Date().toISOString();
      console.log(` ✓ ${authors.join(", ").substring(0, 25)}`);
      updated++;
    } else {
      console.log(" - 変更なし");
    }

    await new Promise(r => setTimeout(r, 150));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n完了: 更新${updated}件 / 未発見${notFound}件`);
  console.log("次のステップ: npm run split:index");
}

main().catch(console.error);
