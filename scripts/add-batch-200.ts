#!/usr/bin/env tsx
/**
 * add-batch-200.ts
 * 漫画100作品・小説100作品をタイトル検索でGoogle Books APIから取得して
 * books.index.json に追加するスクリプト
 */

import * as fs from "fs";
import * as path from "path";

// scripts/.env を手動ロード
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
if (!API_KEY) {
  console.error("GOOGLE_BOOKS_API_KEY が設定されていません");
  process.exit(1);
}

const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface ManualClassification {
  l1Id: string;
  l2Id: string;
  l3Id: string;
  l4TagIds?: string[];
}

interface BookEntry {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  language: string;
  pageCount?: number;
  categories: string[];
  keywords: string[];
  searchableText: string;
  thumbnailUrl?: string;
  sourceIds: { googleBooksId?: string };
  updatedAt: string;
  manualClassification: ManualClassification;
}

interface WorkTarget {
  title: string;
  type: "manga" | "novel";
  classification: ManualClassification;
}

function buildClassification(l1: string, l2Label: string, l3Label: string): ManualClassification {
  if (l1 === "manga") {
    let l2Id: string;
    if (l2Label === "少年漫画") l2Id = "shonen";
    else if (l2Label === "少女漫画") l2Id = "shojo";
    else if (l2Label === "青年漫画") l2Id = "seinen";
    else l2Id = "general";

    let finalL2 = l2Id;
    let l3Id: string;

    if (l3Label === "スポーツ") { finalL2 = "shonen"; l3Id = "sports"; }
    else if (l3Label === "ラブコメ") { finalL2 = "shojo"; l3Id = "romcom"; }
    else if (l3Label === "恋愛") { finalL2 = "shojo"; l3Id = "romance"; }
    else if (l3Label === "ファンタジー") { l3Id = "fantasy"; }
    else if (l3Label === "ダークファンタジー") { l3Id = "dark_fantasy"; }
    else if (l3Label === "SF") { l3Id = "sf"; }
    else if (l3Label === "バトル") { l3Id = "battle"; }
    else if (l3Label === "ギャグ" || l3Label === "コメディ") { l3Id = "comedy"; }
    else if (l3Label === "日常") { l3Id = "daily_life"; }
    else if (l3Label === "ミステリー" || l3Label === "サスペンス") { l3Id = "mystery"; }
    else if (l3Label === "ホラー") { l3Id = "horror"; }
    else if (l3Label === "歴史") { l3Id = "history"; }
    else if (l3Label === "料理" || l3Label === "グルメ") { l3Id = "gourmet"; }
    else if (l3Label === "音楽") { l3Id = "music"; }
    else if (l3Label === "医療") { l3Id = "medical"; }
    else if (l3Label === "学園") { l3Id = "school"; }
    else if (l3Label === "青春") { l3Id = "youth"; }
    else { l3Id = "other"; }

    return { l1Id: "manga", l2Id: finalL2, l3Id };
  } else {
    // novel
    let l2Id: string;
    if (l2Label === "ライトノベル") l2Id = "light_novel";
    else if (l2Label === "文芸") l2Id = "literary";
    else if (l2Label === "ミステリー") l2Id = "mystery";
    else if (l2Label === "SF") l2Id = "sf";
    else if (l2Label === "ファンタジー") l2Id = "fantasy";
    else if (l2Label === "ホラー") l2Id = "horror";
    else if (l2Label === "歴史・時代") l2Id = "historical";
    else if (l2Label === "海外文学") l2Id = "foreign";
    else l2Id = "general";

    let l3Id: string;
    if (l3Label === "異世界") l3Id = "isekai";
    else if (l3Label === "バトル") l3Id = "battle";
    else if (l3Label === "恋愛") l3Id = "romance";
    else if (l3Label === "日常") l3Id = "daily_life";
    else if (l3Label === "本格") l3Id = "honkaku";
    else if (l3Label === "社会派") l3Id = "social";
    else if (l3Label === "ハードボイルド") l3Id = "hardboiled";
    else if (l3Label === "サイバーパンク") l3Id = "cyberpunk";
    else if (l3Label === "ハードSF") l3Id = "hard_sf";
    else if (l3Label === "クラシック") l3Id = "classic";
    else if (l3Label === "青春") l3Id = "youth";
    else if (l3Label === "時代") l3Id = "jidai";
    else if (l3Label === "ファンタジー") l3Id = "fantasy";
    else { l3Id = "other"; }

    return { l1Id: "novel", l2Id, l3Id };
  }
}

const WORK_LIST: WorkTarget[] = [
  // ═══ 漫画 100作品 ═══
  // 少年漫画 - バトル
  { title: "NARUTO", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "DRAGON BALL", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "BLEACH", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "幽☆遊☆白書", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "るろうに剣心", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "鬼滅の刃", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "チェンソーマン", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "僕のヒーローアカデミア", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "北斗の拳", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "ジョジョの奇妙な冒険", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "シャーマンキング", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "封神演義", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "家庭教師ヒットマンREBORN!", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "炎炎ノ消防隊", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },

  // 少年漫画 - スポーツ
  { title: "SLAM DUNK", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "ハイキュー!!", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "テニスの王子様", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "はじめの一歩", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "ダイヤのA", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "キャプテン翼", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "アイシールド21", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "弱虫ペダル", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "ブルーロック", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "MAJOR", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },

  // 少年漫画 - ラブコメ・恋愛
  { title: "ニセコイ", type: "manga", classification: buildClassification("manga", "少年漫画", "ラブコメ") },
  { title: "五等分の花嫁", type: "manga", classification: buildClassification("manga", "少年漫画", "ラブコメ") },
  { title: "彼女、お借りします", type: "manga", classification: buildClassification("manga", "少年漫画", "ラブコメ") },
  { title: "To LOVEる", type: "manga", classification: buildClassification("manga", "少年漫画", "ラブコメ") },
  { title: "I\"s", type: "manga", classification: buildClassification("manga", "少年漫画", "ラブコメ") },
  { title: "うる星やつら", type: "manga", classification: buildClassification("manga", "少年漫画", "ラブコメ") },
  { title: "らんま1/2", type: "manga", classification: buildClassification("manga", "少年漫画", "ラブコメ") },

  // 少年漫画 - ミステリー・サスペンス
  { title: "DEATH NOTE", type: "manga", classification: buildClassification("manga", "少年漫画", "サスペンス") },
  { title: "約束のネバーランド", type: "manga", classification: buildClassification("manga", "少年漫画", "サスペンス") },
  { title: "金田一少年の事件簿", type: "manga", classification: buildClassification("manga", "少年漫画", "ミステリー") },

  // 少年漫画 - ファンタジー・SF
  { title: "FAIRY TAIL", type: "manga", classification: buildClassification("manga", "少年漫画", "ファンタジー") },
  { title: "Dr.STONE", type: "manga", classification: buildClassification("manga", "少年漫画", "SF") },
  { title: "ワールドトリガー", type: "manga", classification: buildClassification("manga", "少年漫画", "SF") },

  // 少年漫画 - ギャグ・コメディ
  { title: "銀魂", type: "manga", classification: buildClassification("manga", "少年漫画", "ギャグ") },
  { title: "斉木楠雄のΨ難", type: "manga", classification: buildClassification("manga", "少年漫画", "ギャグ") },
  { title: "ボボボーボ・ボーボボ", type: "manga", classification: buildClassification("manga", "少年漫画", "ギャグ") },

  // 少年漫画 - 料理・学園・音楽
  { title: "食戟のソーマ", type: "manga", classification: buildClassification("manga", "少年漫画", "料理") },
  { title: "暗殺教室", type: "manga", classification: buildClassification("manga", "少年漫画", "学園") },
  { title: "GTO", type: "manga", classification: buildClassification("manga", "少年漫画", "学園") },
  { title: "四月は君の嘘", type: "manga", classification: buildClassification("manga", "少年漫画", "音楽") },
  { title: "BECK", type: "manga", classification: buildClassification("manga", "少年漫画", "音楽") },
  { title: "聲の形", type: "manga", classification: buildClassification("manga", "少年漫画", "青春") },
  { title: "ヒカルの碁", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },

  // 少年漫画 - 不良・アクション
  { title: "東京卍リベンジャーズ", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "ろくでなしBLUES", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "あしたのジョー", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "巨人の星", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "デビルマン", type: "manga", classification: buildClassification("manga", "少年漫画", "ダークファンタジー") },

  // 少年漫画 - その他ジャンル
  { title: "SPY×FAMILY", type: "manga", classification: buildClassification("manga", "少年漫画", "ギャグ") },
  { title: "タッチ", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "犬夜叉", type: "manga", classification: buildClassification("manga", "少年漫画", "ファンタジー") },
  { title: "ドラえもん", type: "manga", classification: buildClassification("manga", "少年漫画", "SF") },
  { title: "推しの子", type: "manga", classification: buildClassification("manga", "青年漫画", "サスペンス") },

  // 少女漫画
  { title: "花より男子", type: "manga", classification: buildClassification("manga", "少女漫画", "恋愛") },
  { title: "NANA", type: "manga", classification: buildClassification("manga", "少女漫画", "恋愛") },
  { title: "フルーツバスケット", type: "manga", classification: buildClassification("manga", "少女漫画", "恋愛") },
  { title: "ちはやふる", type: "manga", classification: buildClassification("manga", "少女漫画", "スポーツ") },
  { title: "夏目友人帳", type: "manga", classification: buildClassification("manga", "少女漫画", "ファンタジー") },
  { title: "君に届け", type: "manga", classification: buildClassification("manga", "少女漫画", "恋愛") },
  { title: "赤ちゃんと僕", type: "manga", classification: buildClassification("manga", "少女漫画", "日常") },
  { title: "天使禁猟区", type: "manga", classification: buildClassification("manga", "少女漫画", "ダークファンタジー") },
  { title: "BANANA FISH", type: "manga", classification: buildClassification("manga", "少女漫画", "バトル") },
  { title: "ガラスの仮面", type: "manga", classification: buildClassification("manga", "少女漫画", "青春") },
  { title: "パタリロ!", type: "manga", classification: buildClassification("manga", "少女漫画", "ギャグ") },
  { title: "カードキャプターさくら", type: "manga", classification: buildClassification("manga", "少女漫画", "ファンタジー") },
  { title: "ハチミツとクローバー", type: "manga", classification: buildClassification("manga", "少女漫画", "恋愛") },
  { title: "のだめカンタービレ", type: "manga", classification: buildClassification("manga", "少女漫画", "音楽") },
  { title: "動物のお医者さん", type: "manga", classification: buildClassification("manga", "少女漫画", "ギャグ") },

  // 青年漫画
  { title: "進撃の巨人", type: "manga", classification: buildClassification("manga", "青年漫画", "ダークファンタジー") },
  { title: "3月のライオン", type: "manga", classification: buildClassification("manga", "青年漫画", "青春") },
  { title: "宇宙兄弟", type: "manga", classification: buildClassification("manga", "青年漫画", "SF") },
  { title: "ヴィンランド・サガ", type: "manga", classification: buildClassification("manga", "青年漫画", "歴史") },
  { title: "MONSTER", type: "manga", classification: buildClassification("manga", "青年漫画", "サスペンス") },
  { title: "PLUTO", type: "manga", classification: buildClassification("manga", "青年漫画", "SF") },
  { title: "蒼天航路", type: "manga", classification: buildClassification("manga", "青年漫画", "歴史") },
  { title: "キングダム", type: "manga", classification: buildClassification("manga", "青年漫画", "歴史") },
  { title: "ベルセルク", type: "manga", classification: buildClassification("manga", "青年漫画", "ダークファンタジー") },
  { title: "寄生獣", type: "manga", classification: buildClassification("manga", "青年漫画", "SF") },
  { title: "20世紀少年", type: "manga", classification: buildClassification("manga", "青年漫画", "サスペンス") },
  { title: "めぞん一刻", type: "manga", classification: buildClassification("manga", "青年漫画", "ラブコメ") },
  { title: "美味しんぼ", type: "manga", classification: buildClassification("manga", "青年漫画", "グルメ") },
  { title: "頭文字D", type: "manga", classification: buildClassification("manga", "青年漫画", "スポーツ") },
  { title: "よつばと!", type: "manga", classification: buildClassification("manga", "青年漫画", "日常") },
  { title: "怪獣8号", type: "manga", classification: buildClassification("manga", "青年漫画", "バトル") },
  { title: "アオのハコ", type: "manga", classification: buildClassification("manga", "少年漫画", "ラブコメ") },
  { title: "逃げ上手の若君", type: "manga", classification: buildClassification("manga", "少年漫画", "歴史") },
  { title: "からくりサーカス", type: "manga", classification: buildClassification("manga", "少年漫画", "バトル") },
  { title: "YAWARA!", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "ベイビーステップ", type: "manga", classification: buildClassification("manga", "少年漫画", "スポーツ") },
  { title: "銀の匙 Silver Spoon", type: "manga", classification: buildClassification("manga", "少年漫画", "青春") },
  { title: "薬屋のひとりごと", type: "manga", classification: buildClassification("manga", "青年漫画", "ミステリー") },
  { title: "ああっ女神さまっ", type: "manga", classification: buildClassification("manga", "青年漫画", "ラブコメ") },
  { title: "七つの大罪", type: "manga", classification: buildClassification("manga", "少年漫画", "ファンタジー") },
  { title: "ARMS", type: "manga", classification: buildClassification("manga", "少年漫画", "SF") },

  // ═══ 小説 100作品 ═══
  // ミステリー
  { title: "容疑者Xの献身", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "そして誰もいなくなった", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "告白 湊かなえ", type: "novel", classification: buildClassification("novel", "ミステリー", "社会派") },
  { title: "白夜行", type: "novel", classification: buildClassification("novel", "ミステリー", "社会派") },
  { title: "模倣犯", type: "novel", classification: buildClassification("novel", "ミステリー", "社会派") },
  { title: "火車 宮部みゆき", type: "novel", classification: buildClassification("novel", "ミステリー", "社会派") },
  { title: "64 ロクヨン", type: "novel", classification: buildClassification("novel", "ミステリー", "社会派") },
  { title: "半落ち", type: "novel", classification: buildClassification("novel", "ミステリー", "社会派") },
  { title: "殺戮にいたる病", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "インシテミル", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "アクロイド殺し", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "薔薇の名前", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "長いお別れ チャンドラー", type: "novel", classification: buildClassification("novel", "ミステリー", "ハードボイルド") },
  { title: "Yの悲劇", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "ハサミ男", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "ビブリア古書堂の事件手帖", type: "novel", classification: buildClassification("novel", "ミステリー", "日常") },
  { title: "OUT 桐野夏生", type: "novel", classification: buildClassification("novel", "ミステリー", "社会派") },
  { title: "砂の器", type: "novel", classification: buildClassification("novel", "ミステリー", "社会派") },

  // SF
  { title: "夏への扉", type: "novel", classification: buildClassification("novel", "SF", "クラシック") },
  { title: "アンドロイドは電気羊の夢を見るか", type: "novel", classification: buildClassification("novel", "SF", "クラシック") },
  { title: "幼年期の終り", type: "novel", classification: buildClassification("novel", "SF", "ハードSF") },
  { title: "ニューロマンサー", type: "novel", classification: buildClassification("novel", "SF", "サイバーパンク") },
  { title: "ソラリス", type: "novel", classification: buildClassification("novel", "SF", "ハードSF") },
  { title: "デューン 砂の惑星", type: "novel", classification: buildClassification("novel", "SF", "クラシック") },
  { title: "たったひとつの冴えたやりかた", type: "novel", classification: buildClassification("novel", "SF", "クラシック") },
  { title: "銀河ヒッチハイク・ガイド", type: "novel", classification: buildClassification("novel", "SF", "クラシック") },
  { title: "日本沈没", type: "novel", classification: buildClassification("novel", "SF", "ハードSF") },
  { title: "月は無慈悲な夜の女王", type: "novel", classification: buildClassification("novel", "SF", "ハードSF") },
  { title: "果しなき流れの果に", type: "novel", classification: buildClassification("novel", "SF", "ハードSF") },
  { title: "エンダーのゲーム", type: "novel", classification: buildClassification("novel", "SF", "クラシック") },

  // ファンタジー
  { title: "ゲド戦記", type: "novel", classification: buildClassification("novel", "ファンタジー", "ファンタジー") },
  { title: "ロードス島戦記", type: "novel", classification: buildClassification("novel", "ファンタジー", "ファンタジー") },

  // 文芸
  { title: "ノルウェイの森", type: "novel", classification: buildClassification("novel", "文芸", "恋愛") },
  { title: "こころ 夏目漱石", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "坊っちゃん", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "人間失格", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "斜陽", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "雪国 川端康成", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "金閣寺 三島由紀夫", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "砂の女 安部公房", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "銀河鉄道の夜", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "檸檬 梶井基次郎", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "走れメロス", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "羅生門", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "沈黙 遠藤周作", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "火花 又吉直樹", type: "novel", classification: buildClassification("novel", "文芸", "青春") },
  { title: "コンビニ人間", type: "novel", classification: buildClassification("novel", "文芸", "日常") },
  { title: "博士の愛した数式", type: "novel", classification: buildClassification("novel", "文芸", "日常") },
  { title: "キッチン 吉本ばなな", type: "novel", classification: buildClassification("novel", "文芸", "日常") },
  { title: "コインロッカー・ベイビーズ", type: "novel", classification: buildClassification("novel", "文芸", "青春") },
  { title: "限りなく透明に近いブルー", type: "novel", classification: buildClassification("novel", "文芸", "青春") },
  { title: "何者 朝井リョウ", type: "novel", classification: buildClassification("novel", "文芸", "青春") },
  { title: "塩狩峠", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "TUGUMI つぐみ", type: "novel", classification: buildClassification("novel", "文芸", "青春") },
  { title: "暗夜行路", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "夜のピクニック", type: "novel", classification: buildClassification("novel", "文芸", "青春") },
  { title: "海辺のカフカ", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "永遠の0", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },

  // 海外文学
  { title: "変身 カフカ", type: "novel", classification: buildClassification("novel", "海外文学", "クラシック") },
  { title: "異邦人 カミュ", type: "novel", classification: buildClassification("novel", "海外文学", "クラシック") },
  { title: "グレート・ギャツビー", type: "novel", classification: buildClassification("novel", "海外文学", "クラシック") },
  { title: "ライ麦畑でつかまえて", type: "novel", classification: buildClassification("novel", "海外文学", "青春") },

  // ホラー
  { title: "Another 綾辻行人", type: "novel", classification: buildClassification("novel", "ホラー", "本格") },
  { title: "陰陽師 夢枕獏", type: "novel", classification: buildClassification("novel", "ホラー", "ファンタジー") },

  // 歴史・時代
  { title: "竜馬がゆく", type: "novel", classification: buildClassification("novel", "歴史・時代", "時代") },
  { title: "燃えよ剣", type: "novel", classification: buildClassification("novel", "歴史・時代", "時代") },

  // ライトノベル
  { title: "ソードアート・オンライン", type: "novel", classification: buildClassification("novel", "ライトノベル", "異世界") },
  { title: "涼宮ハルヒの憂鬱", type: "novel", classification: buildClassification("novel", "ライトノベル", "日常") },
  { title: "涼宮ハルヒの消失", type: "novel", classification: buildClassification("novel", "ライトノベル", "日常") },
  { title: "灼眼のシャナ", type: "novel", classification: buildClassification("novel", "ライトノベル", "バトル") },
  { title: "狼と香辛料", type: "novel", classification: buildClassification("novel", "ライトノベル", "ファンタジー") },
  { title: "ゼロの使い魔", type: "novel", classification: buildClassification("novel", "ライトノベル", "異世界") },
  { title: "Re:ゼロから始める異世界生活", type: "novel", classification: buildClassification("novel", "ライトノベル", "異世界") },
  { title: "この素晴らしい世界に祝福を!", type: "novel", classification: buildClassification("novel", "ライトノベル", "異世界") },
  { title: "オーバーロード 丸山くがね", type: "novel", classification: buildClassification("novel", "ライトノベル", "異世界") },
  { title: "無職転生", type: "novel", classification: buildClassification("novel", "ライトノベル", "異世界") },
  { title: "ダンジョンに出会いを求めるのは間違っているだろうか", type: "novel", classification: buildClassification("novel", "ライトノベル", "ファンタジー") },
  { title: "魔法科高校の劣等生", type: "novel", classification: buildClassification("novel", "ライトノベル", "バトル") },
  { title: "盾の勇者の成り上がり", type: "novel", classification: buildClassification("novel", "ライトノベル", "異世界") },
  { title: "デート・ア・ライブ", type: "novel", classification: buildClassification("novel", "ライトノベル", "バトル") },
  { title: "転生したらスライムだった件", type: "novel", classification: buildClassification("novel", "ライトノベル", "異世界") },
  { title: "薬屋のひとりごと 小説", type: "novel", classification: buildClassification("novel", "ライトノベル", "日常") },
  { title: "窓ぎわのトットちゃん", type: "novel", classification: buildClassification("novel", "文芸", "日常") },
  { title: "失楽園 渡辺淳一", type: "novel", classification: buildClassification("novel", "文芸", "恋愛") },
  { title: "友情 武者小路実篤", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "注文の多い料理店", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "春琴抄", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
  { title: "氷菓 米澤穂信", type: "novel", classification: buildClassification("novel", "ミステリー", "日常") },
  { title: "時をかける少女", type: "novel", classification: buildClassification("novel", "SF", "クラシック") },
  { title: "葉桜の季節に君を想うということ", type: "novel", classification: buildClassification("novel", "ミステリー", "本格") },
  { title: "陰翳礼讃", type: "novel", classification: buildClassification("novel", "文芸", "クラシック") },
];

/** タイトルでGoogle Books APIを検索 */
async function fetchByTitle(title: string, type: "manga" | "novel"): Promise<any | null> {
  const typeKeyword = type === "manga" ? "漫画" : "小説";
  const query = `intitle:${title} ${typeKeyword}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`    [Google Books] HTTP ${res.status}`);
    return null;
  }
  const data = (await res.json()) as any;
  if (!data.items) return null;

  // タイトルの主要部分を抽出
  const normalizedTitle = title.replace(/[\s　]*[（(【「].*/g, "").replace(/\s+/g, "").trim();

  const candidates = data.items.filter((item: any) => {
    const t: string = (item.volumeInfo?.title ?? "").replace(/\s+/g, "");
    return t.includes(normalizedTitle) || normalizedTitle.includes(t);
  });

  if (candidates.length === 0) return null;

  // スコアリング
  function scoreItem(item: any): number {
    const t: string = item.volumeInfo?.title ?? "";
    let score = 0;
    if (t.replace(/\s+/g, "") === normalizedTitle) score += 10;
    if (/[（(][１1][）)]/.test(t)) score += 8;
    if (/[　\s][１1]$/.test(t)) score += 7;
    if (/第?[１1]巻/.test(t)) score += 7;
    const hasIsbn = item.volumeInfo?.industryIdentifiers?.some((i: any) => i.type === "ISBN_13");
    if (hasIsbn) score += 3;
    score -= t.length * 0.1;
    return score;
  }

  candidates.sort((a: any, b: any) => scoreItem(b) - scoreItem(a));
  return candidates[0];
}

function buildEntry(
  item: any,
  title: string,
  type: "manga" | "novel",
  classification: ManualClassification
): BookEntry {
  const info = item.volumeInfo;
  const isbn13 =
    info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier;
  const id = isbn13 ?? item.id;
  const bookTitle: string = info.title ?? title;
  const subtitle: string | undefined = info.subtitle;
  const authors: string[] = info.authors ?? [];
  const publisher: string | undefined = info.publisher;
  const publishedDate: string | undefined = info.publishedDate;
  const pageCount: number | undefined = info.pageCount;
  const thumbnailUrl: string | undefined =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ??
    info.imageLinks?.smallThumbnail?.replace("http://", "https://");

  const keywords = type === "manga" ? ["漫画", "コミック"] : ["小説"];
  const searchableText = [bookTitle, subtitle, ...authors, publisher ?? "", ...keywords]
    .filter(Boolean)
    .join(" ");

  return {
    id,
    title: bookTitle,
    ...(subtitle ? { subtitle } : {}),
    authors,
    ...(publisher ? { publisher } : {}),
    ...(publishedDate ? { publishedDate } : {}),
    ...(isbn13 ? { isbn13 } : {}),
    language: info.language ?? "ja",
    ...(pageCount ? { pageCount } : {}),
    categories: type === "manga" ? ["漫画"] : ["小説"],
    keywords,
    searchableText,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    sourceIds: { googleBooksId: item.id },
    updatedAt: new Date().toISOString(),
    manualClassification: classification,
  };
}

async function main() {
  const books: BookEntry[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  const existingIds = new Set(books.map((b) => b.id));
  const existingTitles = new Set(
    books
      .filter((b) => b.manualClassification?.l1Id)
      .map((b) => b.title.replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase())
  );

  let added = 0;
  let skipped = 0;
  let notFound = 0;

  const mangaCount = WORK_LIST.filter((w) => w.type === "manga").length;
  const novelCount = WORK_LIST.filter((w) => w.type === "novel").length;
  console.log(`\n📋  対象: 漫画 ${mangaCount} / 小説 ${novelCount} / 合計 ${WORK_LIST.length}`);
  console.log("──────────────────────────────────────────────────");

  for (let i = 0; i < WORK_LIST.length; i++) {
    const target = WORK_LIST[i];
    const normalizedSearch = target.title.replace(/\s+/g, "").replace(/[（(].*/g, "").toLowerCase();

    // タイトルで既存チェック
    if (existingTitles.has(normalizedSearch)) {
      console.log(`[${i + 1}/${WORK_LIST.length}] ⏭  スキップ（既存）: ${target.title}`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${WORK_LIST.length}] 🔍  検索: ${target.title} (${target.type})`);
    const item = await fetchByTitle(target.title, target.type);

    if (!item) {
      console.log(`    ⚠  見つかりません: ${target.title}`);
      notFound++;
      continue;
    }

    const entry = buildEntry(item, target.title, target.type, target.classification);

    if (existingIds.has(entry.id)) {
      // IDは既存だが分類がなければ追加
      const existing = books.find((b) => b.id === entry.id);
      if (existing && !existing.manualClassification?.l1Id) {
        existing.manualClassification = target.classification;
        console.log(`    ✏  分類追加: ${existing.title} (${entry.id})`);
        added++;
      } else {
        console.log(`    ⏭  スキップ（ID重複）: ${entry.title} (${entry.id})`);
        skipped++;
      }
      continue;
    }

    books.push(entry);
    existingIds.add(entry.id);
    existingTitles.add(normalizedSearch);
    console.log(`    ✅  追加: ${entry.title} (${entry.id}) [${target.classification.l2Id}/${target.classification.l3Id}]`);
    added++;

    // レート制限対策
    await new Promise((r) => setTimeout(r, 500));
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`✅  完了: 追加/更新 ${added}件 / スキップ ${skipped}件 / 未発見 ${notFound}件`);
  console.log(`📚  合計: ${books.length}件`);
}

main().catch(console.error);
