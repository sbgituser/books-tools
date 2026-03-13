# ブログ投稿手順（Books Tools）

このドキュメントは、`books-tools` のブログ記事を安全に追加・公開するための手順書です。

## 1. 記事データ形式

記事は `content/blog/*.mdx`（または `.md`）に保存します。

```md
---
title: "記事タイトル"
slug: "2026-03-10-sample-post"
description: "記事の概要（一覧に表示）"
date: "2026-03-10"
tags: ["タグ1", "タグ2"]
---

# 見出し

本文（Markdown）
```

## 2. ローカルで記事を作成

```bash
cd books-tools
npm run blog:new -- --title="記事タイトル" --description="概要" --tags="お知らせ,運用"
```

生成先: `content/blog/<slug>.md`

## 3. ローカル確認

```bash
cd books-tools
npm run dev
```

- 一覧: `/blog`
- 詳細: `/blog/<slug>`

## 4. GitHub Actions でテンプレート作成（運用向け）

ワークフロー: `.github/workflows/blog-post-template.yml`

1. GitHub の `Actions` タブを開く
2. `blog-post-template` を選択
3. `Run workflow` を押す
4. `title / slug / description / tags` を入力して実行

実行後、`content/blog/*.md` が自動コミットされます。

## 5. 公開フロー

1. 記事ファイルを編集
2. `main`（運用ブランチ）へ push
3. Cloudflare Pages が自動デプロイ

## 6. 自動記事生成（Google Trends + YouTube + OpenAI）

### 事前設定

`.env.local` または GitHub Secrets / Variables に以下を設定します。

- `YOUTUBE_API_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`（任意、既定: `gpt-4o-mini`）

### ローカル実行

```bash
cd books-tools
npm run blog:auto
```

生成結果は `content/blog/*.md` に保存されます。

### GitHub Actions 実行

- ワークフロー: `.github/workflows/auto-generate-blog.yml`
- 実行方法:
  - 手動: `workflow_dispatch`
  - 定期: 毎日 JST 10:00

### 生成ポリシー（自動記事）

自動生成では、以下を必須制約として運用します。

- ですます調
- ネタバレ禁止
- 著作権侵害（本文の長文引用等）禁止
- センシティブ内容禁止

実装箇所: `scripts/auto-generate-blog.ts`

## 7. 書籍情報（`books.index.json`）更新手順

ブログ記事を追加・更新したあと、ランキング見出し（`### 1位 タイトル（著者）`）に対応する書籍情報を `src/data/books.index.json` に反映します。

### 7-1. 事前準備

- 作業ディレクトリを `books-tools` に移動
- 必要に応じて `GOOGLE_BOOKS_API_KEY` を設定（未設定でも実行可）
- 見出し形式は `### <順位>位 <タイトル>（<著者>）` に統一

### 7-2. 不足書籍の自動補完（ブログ見出し → index）

```bash
cd books-tools
npx tsx scripts/sync-blog-books.ts
```

このスクリプトは以下を行います。

1. `content/blog/*.mdx` の見出しを走査
2. `src/data/books.index.json` に未登録の書籍を検出
3. Google Books API 候補からタイトル・著者一致度で最適候補を選択
4. `books.index.json` へ追記（`id / title / authors / categories / keywords` など）

### 7-3. ISBN ベースで新規収集する場合（カテゴリ収集）

カテゴリ単位で候補ISBNを収集してから、書誌情報を生成する場合は次を実行します。

```bash
cd books-tools
npm run search:books
npm run fetch:books
npm run build:related
npm run split:index
```

一括実行は以下でも可能です。

```bash
cd books-tools
npm run build:all
```

### 7-4. 反映確認

- `src/data/books.index.json` に対象タイトル・著者が追加されていること
- 可能なら `npm run dev` で画面表示を確認
- 画像未取得（`[no-thumb]`）は必要に応じて手動補完

### 7-5. 運用メモ

- `sync-blog-books.ts` は「ブログ見出し起点の不足補完」に最適
- `search-books.ts` + `fetch-books.ts` は「カテゴリ起点の大量収集」に最適
- 重複・誤マッチを防ぐため、見出しのタイトルと著者表記は一定に保つ

### 7-6. 著者名の表記ゆれ防止ルール（追記）

書籍情報登録時は、著者名の表記ゆれ（中点あり/なし、空白有無、全角半角混在）を防ぐため、以下を必須とします。

1. **正規表記の優先順位を固定**
   - 既存の `src/data/books.index.json` に同一著者が存在する場合は、**既存表記を正**として合わせる
   - 新規著者は、可能な限り書誌情報（Google Books / 出版社情報）に合わせる
2. **見出し表記の統一**
   - 見出しは `### <順位>位 <タイトル>（<著者>）` を維持し、著者名は `books.index.json` の表記に一致させる
3. **登録前に表記ゆれ検出を実施**
   - ブログ見出し内の著者ゆれを検出してから `sync-blog-books.ts` を実行する
4. **登録後に正規化バッチを実施**
   - `books.index.json` の `authors` 配列を正規化して、揺れを残さない

#### 推奨コマンド（登録時の標準フロー）

```bash
cd books-tools
npx tsx scripts/detect-blog-author-variants.ts
npx tsx scripts/sync-blog-books.ts
npx tsx scripts/normalize-author-variants.ts
```

- 検出レポート: `reports/blog-author-variants.tsv`
- 正規化レポート: `reports/author-variants-before.tsv` / `reports/author-variants-after.tsv` / `reports/author-variants-replaced.tsv`

#### 判定基準（公開前）

- `reports/blog-author-variants.tsv` の `variant_groups=0`
- `reports/author-variants-after.tsv` に複数表記グループが残っていないこと
- 変更があった場合、`reports/author-variants-replaced.tsv` に置換履歴が出力されていること

## 8. 書籍カード掲載ガイドライン（必須）

ブログ記事で書籍情報を載せる場合、**サムネイル付きカード + 「条件一致で本を探す」ボタン**が表示されることを必須とします。

### 8-1. 必須ルール

1. 書籍紹介見出しは `###` を使う（`h3`）
   - 例: `### 1位 火星の人（アンディ・ウィアー）`
   - 例: `### 火星の人（アンディ・ウィアー）`
2. 可能な限り **タイトル + 著者（括弧）** で表記する
   - 著者なし見出しは照合精度が落ちるため非推奨
3. スラッグはスペルミスを避ける
   - 例: `recommendations`（`recmmendations` はNG）
4. 記事公開前に、対象記事URLでカード表示を実画面確認する
   - サムネイル表示
   - 「条件一致で本を探す」ボタン表示

### 8-2. 記事作成時の標準手順（必ず参照）

記事作成時は、以下の順で必ずこのガイドラインを参照して作業します。

1. 本ドキュメントの `1` と `8` を先に確認
2. 記事本文を作成（書籍見出しは `###` + 著者付き）
3. 書籍情報同期を実行

```bash
cd books-tools
npx tsx scripts/sync-blog-books.ts
```

4. 必要に応じて不足補完（著者・画像）

```bash
cd books-tools
npx tsx scripts/fill-unknown-authors.ts
npx tsx scripts/fill-missing-image-sources.ts
```

5. 配信用データ再生成

```bash
cd books-tools
npx tsx scripts/build-split-index.ts
```

6. `npm run dev` で対象記事を開いてカード表示を最終確認

### 8-3. チェックリスト（公開前）

- [ ] 書籍紹介見出しは `###` で統一されている
- [ ] 見出しにタイトルと著者（`（著者）`）を記載している
- [ ] 対象記事で書籍カードにサムネイルが表示される
- [ ] 対象記事で「条件一致で本を探す」ボタンが表示される
- [ ] 誤字スラッグや404がない

