#!/usr/bin/env tsx
/**
 * add-mood-tags.ts
 * 代表的な漫画エントリに感情・目的・雰囲気タグを付与するスクリプト
 * books.index.json の moodTags フィールドを更新する
 */

import * as fs from "fs";
import * as path from "path";

const BOOKS_INDEX_PATH = path.join(__dirname, "../src/data/books.index.json");

interface MoodTags {
  emotionalTags?: string[];
  purposeTags?: string[];
  atmosphereTags?: string[];
  paceTag?: string;
  depthTag?: string;
  readingEaseTag?: string;
  completionStatus?: string;
  estimatedReadingTimeCategory?: string;
  recommendationCatch?: string;
  recommendedFor?: string[];
}

/** id または タイトル部分文字列でマッチ */
interface TagEntry {
  ids?: string[];
  titleContains?: string;
  tags: MoodTags;
}

const MOOD_DATA: TagEntry[] = [
  // ─── 少年バトル ────────────────────────────────────────────────────────
  {
    ids: ["gb-fVsxDwAAQBAJ"], // ONE PIECE
    tags: {
      emotionalTags: ["hot", "refreshing", "emotional", "funny"],
      purposeTags: ["binge", "immersive", "motivated"],
      atmosphereTags: ["bright", "extraordinary"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "仲間と夢を追う壮大な冒険、漫画の金字塔",
      recommendedFor: ["バトル好き", "友情テーマが好きな人", "長期連載OK"],
    },
  },
  {
    ids: ["blog-鬼滅の刃-吾峠呼世晴"],
    tags: {
      emotionalTags: ["hot", "emotional", "cry"],
      purposeTags: ["binge", "immersive"],
      atmosphereTags: ["tense", "extraordinary"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "涙と熱さで心を揺さぶる、令和最大の感動バトル",
      recommendedFor: ["感動したい人", "バトル好き", "完結作品を求める人"],
    },
  },
  {
    ids: ["blog-進撃の巨人-諫山創"],
    tags: {
      emotionalTags: ["hopeless", "cry", "hot", "emotional"],
      purposeTags: ["thinking", "analysis", "immersive"],
      atmosphereTags: ["dark", "tense", "uneasy", "profound"],
      paceTag: "普通", depthTag: "重い", readingEaseTag: "読みごたえあり",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "絶望と考察が止まらない衝撃の重厚ダーク大作",
      recommendedFor: ["考察好き", "重い物語が好きな人", "完結作品を求める人"],
    },
  },
  {
    ids: ["gb-blog-hunterhunter"],
    tags: {
      emotionalTags: ["hot", "funny", "emotional"],
      purposeTags: ["thinking", "analysis", "binge"],
      atmosphereTags: ["extraordinary", "tense"],
      paceTag: "普通", depthTag: "重い", readingEaseTag: "読みごたえあり",
      completionStatus: "連載中", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "頭脳戦と熱い戦いが融合した究極の少年漫画",
      recommendedFor: ["考察好き", "頭脳戦が好きな人", "バトル好き"],
    },
  },
  {
    ids: ["gb-blog-narutoナルト"],
    tags: {
      emotionalTags: ["emotional", "hot", "cry"],
      purposeTags: ["motivated", "immersive", "binge"],
      atmosphereTags: ["bright", "extraordinary"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "忍者の世界で夢と友情を貫く感動の成長物語",
      recommendedFor: ["友情テーマが好きな人", "成長物語が好きな人", "完結作品を求める人"],
    },
  },
  {
    ids: ["blog-鋼の錬金術師-荒川弘"],
    tags: {
      emotionalTags: ["emotional", "cry", "hot"],
      purposeTags: ["immersive", "thinking", "binge"],
      atmosphereTags: ["tense", "extraordinary"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "兄弟の絆と世界の真実に迫る完成度最高峰の傑作",
      recommendedFor: ["完結作品を求める人", "感動したい人", "SF・ファンタジー好き"],
    },
  },
  {
    ids: ["gb-blog-呪術廻戦"],
    tags: {
      emotionalTags: ["hot", "refreshing", "emotional"],
      purposeTags: ["binge", "immersive"],
      atmosphereTags: ["dark", "tense", "extraordinary"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "スタイリッシュな呪術バトルと濃密なキャラが魅力",
      recommendedFor: ["バトル好き", "ダーク系OK", "テンポ重視の人"],
    },
  },
  {
    ids: ["gb-blog-炎炎ノ消防隊"],
    tags: {
      emotionalTags: ["hot", "refreshing", "emotional"],
      purposeTags: ["binge"],
      atmosphereTags: ["tense", "extraordinary"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "炎を操る消防士たちの熱いバトルと世界の謎を追う",
      recommendedFor: ["バトル好き", "完結作品を求める人"],
    },
  },
  // ─── 青年 ────────────────────────────────────────────────────────────
  {
    ids: ["blog-deathnote-大場つぐみ小畑健"],
    tags: {
      emotionalTags: ["scary", "hopeless"],
      purposeTags: ["thinking", "analysis", "binge"],
      atmosphereTags: ["dark", "tense", "uneasy"],
      paceTag: "普通", depthTag: "重い", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "頭脳戦と緊張感を一気に味わえる傑作サスペンス",
      recommendedFor: ["考察好き", "頭脳戦が好きな人", "完結作品を求める人"],
    },
  },
  {
    ids: ["blog-monster-浦沢直樹"],
    tags: {
      emotionalTags: ["hopeless", "scary", "emotional"],
      purposeTags: ["immersive", "thinking", "analysis"],
      atmosphereTags: ["dark", "uneasy", "tense", "profound"],
      paceTag: "遅い", depthTag: "重い", readingEaseTag: "読みごたえあり",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "悪の本質を問う、浦沢直樹の最高傑作サスペンス大河",
      recommendedFor: ["重い物語が好きな人", "考察好き", "大人向け漫画を求める人"],
    },
  },
  {
    ids: ["blog-20世紀少年-浦沢直樹"],
    tags: {
      emotionalTags: ["emotional", "cry", "hopeless"],
      purposeTags: ["immersive", "thinking", "analysis"],
      atmosphereTags: ["dark", "uneasy", "tense", "profound"],
      paceTag: "遅い", depthTag: "重い", readingEaseTag: "読みごたえあり",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "少年時代の約束が世界の命運を握る壮大なSFミステリー",
      recommendedFor: ["大人向け漫画を求める人", "考察好き", "SF好き"],
    },
  },
  {
    ids: ["9784088901929"], // ゴールデンカムイ
    tags: {
      emotionalTags: ["funny", "hot", "emotional"],
      purposeTags: ["learning", "immersive", "binge"],
      atmosphereTags: ["extraordinary", "bright"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "アイヌ文化×グルメ×バトルが融合した唯一無二の北海道冒険譚",
      recommendedFor: ["学びながら楽しみたい人", "バトル好き", "完結作品を求める人"],
    },
  },
  {
    ids: ["9784063861501"], // ヴィンランド・サガ
    tags: {
      emotionalTags: ["emotional", "hot", "cry"],
      purposeTags: ["immersive", "learning", "thinking"],
      atmosphereTags: ["tense", "extraordinary", "profound"],
      paceTag: "普通", depthTag: "重い", readingEaseTag: "読みごたえあり",
      completionStatus: "連載中", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "北欧ヴァイキングの壮絶な生と死を描く歴史大河漫画",
      recommendedFor: ["歴史好き", "重い物語が好きな人", "大人向け漫画を求める人"],
    },
  },
  {
    ids: ["9784063287643"], // ヒストリエ
    tags: {
      emotionalTags: ["emotional"],
      purposeTags: ["learning", "immersive", "thinking"],
      atmosphereTags: ["extraordinary", "calm", "profound"],
      paceTag: "遅い", depthTag: "重い", readingEaseTag: "読みごたえあり",
      completionStatus: "連載中", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "アレクサンドロス大王の秘書官の一生を描く古代ギリシア叙事詩",
      recommendedFor: ["歴史好き", "考察好き", "大人向け漫画を求める人"],
    },
  },
  {
    ids: ["9784592135653"], // ベルセルク
    tags: {
      emotionalTags: ["hopeless", "hot", "emotional"],
      purposeTags: ["immersive", "thinking"],
      atmosphereTags: ["dark", "profound", "tense"],
      paceTag: "遅い", depthTag: "重い", readingEaseTag: "読みごたえあり",
      completionStatus: "連載中", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "極限のダークファンタジー、業と意志が交差する不朽の大作",
      recommendedFor: ["ダーク系OK", "大人向け漫画を求める人", "重い物語が好きな人"],
    },
  },
  {
    ids: ["gb-MgI8DAAAQBAJ"], // GANTZ
    tags: {
      emotionalTags: ["hopeless", "scary"],
      purposeTags: ["binge"],
      atmosphereTags: ["dark", "uneasy", "tense"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "死んだ人間が謎の球体に支配されるSFバトル・サバイバル",
      recommendedFor: ["ダーク系OK", "バトル好き", "完結作品を求める人"],
    },
  },
  {
    ids: ["gb-ykZNzwEACAAJ"], // サラリーマン金太郎
    tags: {
      emotionalTags: ["hot", "refreshing", "positive"],
      purposeTags: ["work", "motivated"],
      atmosphereTags: ["bright"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "型破りなサラリーマンが巻き起こすビジネス版熱血漫画",
      recommendedFor: ["仕事に役立つ漫画が好きな人", "熱い物語が好きな人"],
    },
  },
  {
    ids: ["9784065108581"], // デビルズライン
    tags: {
      emotionalTags: ["heartwarming", "sad"],
      purposeTags: ["immersive"],
      atmosphereTags: ["dark", "uneasy"],
      paceTag: "普通", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "人間と吸血鬼の禁断の愛と葛藤を描くダーク恋愛漫画",
      recommendedFor: ["恋愛好き", "ダーク系OK"],
    },
  },
  {
    ids: ["9784040750859"], // 光が死んだ夏
    tags: {
      emotionalTags: ["scary", "creepy", "sad"],
      purposeTags: ["immersive", "thinking"],
      atmosphereTags: ["dark", "uneasy", "tense"],
      paceTag: "普通", depthTag: "重い", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "最愛の幼馴染を「何か」に置き換えられた少年の恐怖",
      recommendedFor: ["ホラー好き", "考察好き", "ダーク系OK"],
    },
  },
  // ─── 青年コメディ ───────────────────────────────────────────────────────
  {
    ids: ["gb-blog-聖おにいさん"],
    tags: {
      emotionalTags: ["funny", "healing"],
      purposeTags: ["easy", "short", "learning"],
      atmosphereTags: ["bright", "daily", "gentle"],
      paceTag: "普通", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "連載中", estimatedReadingTimeCategory: "短め",
      recommendationCatch: "ブッダとイエスが東京でルームシェア、クスッと学べる日常コメディ",
      recommendedFor: ["宗教・歴史に興味がある人", "気軽に読みたい人", "初心者"],
    },
  },
  {
    ids: ["gb-blog-ぐらんぶる"],
    tags: {
      emotionalTags: ["funny"],
      purposeTags: ["easy", "binge"],
      atmosphereTags: ["bright", "daily"],
      paceTag: "早い", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "ダイビングサークルの爆笑エピソードが止まらない青春コメディ",
      recommendedFor: ["笑いたい人", "気軽に読みたい人", "完結作品を求める人"],
    },
  },
  {
    ids: ["gb-blog-坂本ですが"],
    tags: {
      emotionalTags: ["funny"],
      purposeTags: ["easy"],
      atmosphereTags: ["bright", "daily"],
      paceTag: "早い", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "完結", estimatedReadingTimeCategory: "短め",
      recommendationCatch: "何をやっても完璧なハイスペック男子・坂本くんの爆笑日常",
      recommendedFor: ["笑いたい人", "気軽に読みたい人"],
    },
  },
  {
    ids: ["gb-blog-あそびあそばせ"],
    tags: {
      emotionalTags: ["funny"],
      purposeTags: ["easy", "short"],
      atmosphereTags: ["bright", "daily"],
      paceTag: "早い", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "陰キャ・陽キャ・帰国子女の謎の「遊び研究部」爆笑コメディ",
      recommendedFor: ["笑いたい人", "気軽に読みたい人"],
    },
  },
  // ─── 少女漫画 ────────────────────────────────────────────────────────────
  {
    ids: ["9784088484101"], // 花より男子
    tags: {
      emotionalTags: ["heartwarming", "hot", "funny"],
      purposeTags: ["binge", "easy"],
      atmosphereTags: ["bright", "extraordinary"],
      paceTag: "早い", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "F4と庶民のシンデレラストーリー、少女漫画の永遠の名作",
      recommendedFor: ["恋愛好き", "少女漫画入門", "完結作品を求める人"],
    },
  },
  {
    ids: ["9784088485788"], // NANA
    tags: {
      emotionalTags: ["sad", "cry", "heartwarming"],
      purposeTags: ["immersive"],
      atmosphereTags: ["uneasy"],
      paceTag: "普通", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "同じ名前の二人の女の子が交差する、切ない大人の恋と夢の物語",
      recommendedFor: ["恋愛好き", "大人の恋愛漫画を求める人", "切ない話が好きな人"],
    },
  },
  {
    ids: ["9784088452616"], // 君に届け
    tags: {
      emotionalTags: ["heartwarming", "cry", "emotional"],
      purposeTags: ["easy", "binge"],
      atmosphereTags: ["bright", "gentle", "daily"],
      paceTag: "普通", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "不器用な女の子と周囲との絆を描く、純粋で温かい青春恋愛",
      recommendedFor: ["恋愛好き", "癒やされたい人", "完結作品を求める人"],
    },
  },
  {
    ids: ["9784592190813"], // 暁のヨナ
    tags: {
      emotionalTags: ["hot", "emotional", "heartwarming"],
      purposeTags: ["immersive", "binge"],
      atmosphereTags: ["extraordinary"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "王女が成長し四龍を集める、ファンタジー少女漫画の傑作",
      recommendedFor: ["恋愛好き", "ファンタジー好き", "成長物語が好きな人"],
    },
  },
  // ─── スポーツ少年漫画 ────────────────────────────────────────────────────
  {
    ids: ["blog-ハイキュー-古舘春一"],
    tags: {
      emotionalTags: ["hot", "emotional", "refreshing", "cry"],
      purposeTags: ["motivated", "binge", "immersive"],
      atmosphereTags: ["bright", "tense"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "小さな巨人の夢に胸が熱くなる、バレー漫画の最高傑作",
      recommendedFor: ["スポーツ漫画入門", "熱い物語が好きな人", "完結作品を求める人"],
    },
  },
  {
    ids: ["9784065110324"], // ダイヤのA
    tags: {
      emotionalTags: ["hot", "emotional"],
      purposeTags: ["motivated", "binge"],
      atmosphereTags: ["bright", "tense"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "熱血野球と個性豊かなキャラが絡む青春スポーツ漫画",
      recommendedFor: ["スポーツ漫画好き", "熱い物語が好きな人"],
    },
  },
  {
    ids: ["9784091877136"], // アオアシ
    tags: {
      emotionalTags: ["hot", "emotional", "positive"],
      purposeTags: ["motivated", "learning", "binge"],
      atmosphereTags: ["bright", "tense"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "個人技からチーム戦術へ。戦略性とドラマが熱いサッカー漫画",
      recommendedFor: ["スポーツ漫画好き", "成長物語が好きな人", "サッカーに興味ある人"],
    },
  },
  // ─── 一般（コメディ・日常）────────────────────────────────────────────
  {
    ids: ["gb-blog-日常"],
    tags: {
      emotionalTags: ["funny", "healing"],
      purposeTags: ["easy", "short"],
      atmosphereTags: ["bright", "daily", "gentle"],
      paceTag: "普通", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "「日常」なのに何かがおかしい、独特のシュール感が中毒性抜群",
      recommendedFor: ["笑いたい人", "シュール系が好きな人", "気軽に読みたい人"],
    },
  },
  {
    ids: ["gb-blog-女子高生の無駄づかい"],
    tags: {
      emotionalTags: ["funny"],
      purposeTags: ["easy", "short"],
      atmosphereTags: ["bright", "daily"],
      paceTag: "早い", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "名前の通り「無駄」しかない女子高生の爆笑日常",
      recommendedFor: ["笑いたい人", "気軽に読みたい人"],
    },
  },
  {
    ids: ["gb-OPJQEQAAQBAJ"], // マッシュル
    tags: {
      emotionalTags: ["funny", "refreshing", "hot"],
      purposeTags: ["easy", "binge"],
      atmosphereTags: ["bright", "extraordinary"],
      paceTag: "早い", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "完結", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "魔法ゼロ・筋肉全振りで魔法世界を蹂躙する爆笑バトル漫画",
      recommendedFor: ["笑いたい人", "バトル好き", "気軽に読みたい人"],
    },
  },
  {
    ids: ["9784063906339"], // 転生したらスライムだった件
    tags: {
      emotionalTags: ["healing", "funny", "refreshing"],
      purposeTags: ["easy", "immersive", "binge"],
      atmosphereTags: ["bright", "extraordinary", "fantasy"],
      paceTag: "早い", depthTag: "軽い", readingEaseTag: "初心者向け",
      completionStatus: "連載中", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "スライムに転生してチート級に成長、気持ちいい異世界ファンタジー",
      recommendedFor: ["ファンタジー好き", "異世界もの入門", "気軽に読みたい人"],
    },
  },
  {
    ids: ["gb-blog-魔法使いの嫁"],
    tags: {
      emotionalTags: ["healing", "emotional", "sad"],
      purposeTags: ["immersive"],
      atmosphereTags: ["fantasy", "calm", "gentle"],
      paceTag: "遅い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "普通",
      recommendationCatch: "幻想的な世界観と少女の成長が紡ぐ美しいファンタジー",
      recommendedFor: ["ファンタジー好き", "幻想的な雰囲気が好きな人", "癒やされたい人"],
    },
  },
  // ─── 少年漫画追加 ────────────────────────────────────────────────────────
  {
    ids: ["blog-僕のヒーローアカデミア-堀越耕平"],
    tags: {
      emotionalTags: ["hot", "emotional", "positive"],
      purposeTags: ["motivated", "binge", "immersive"],
      atmosphereTags: ["bright", "tense", "extraordinary"],
      paceTag: "早い", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "完結", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "個性（超能力）社会で無個性の少年が最高のヒーローを目指す",
      recommendedFor: ["スーパーヒーロー好き", "バトル好き", "完結作品を求める人"],
    },
  },
  {
    ids: ["gb-blog-ジョジョの奇妙な冒険"],
    tags: {
      emotionalTags: ["hot", "funny", "emotional"],
      purposeTags: ["immersive", "thinking"],
      atmosphereTags: ["extraordinary", "tense", "profound"],
      paceTag: "普通", depthTag: "中程度", readingEaseTag: "普通",
      completionStatus: "連載中", estimatedReadingTimeCategory: "長め",
      recommendationCatch: "スタンド能力と奇妙な運命が世代を超えて続く伝説のバトル漫画",
      recommendedFor: ["バトル好き", "個性的な世界観が好きな人"],
    },
  },
];

function main() {
  const books: any[] = JSON.parse(fs.readFileSync(BOOKS_INDEX_PATH, "utf-8"));
  let updated = 0;

  for (const entry of MOOD_DATA) {
    // IDで検索
    if (entry.ids) {
      for (const id of entry.ids) {
        const idx = books.findIndex(b => b.id === id);
        if (idx !== -1) {
          books[idx].moodTags = entry.tags;
          console.log(`✓ [ID] ${id} | ${books[idx].title}`);
          updated++;
        } else {
          console.warn(`⚠ NOT FOUND: ${id}`);
        }
      }
    }

    // タイトル部分一致で検索
    if (entry.titleContains) {
      const matches = books.filter(b => b.title?.includes(entry.titleContains!));
      for (const b of matches) {
        const idx = books.findIndex(x => x.id === b.id);
        books[idx].moodTags = entry.tags;
        console.log(`✓ [TITLE] ${b.title}`);
        updated++;
      }
    }
  }

  fs.writeFileSync(BOOKS_INDEX_PATH, JSON.stringify(books, null, 2), "utf-8");
  console.log(`\n完了: ${updated}件にムードタグを付与`);
  console.log("次のステップ: npm run split:index");
}

main();
