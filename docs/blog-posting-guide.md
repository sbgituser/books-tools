# ブログ投稿手順（Books Tools）

このドキュメントは、`books-tools` のブログ記事を安全に追加・公開するための手順書です。

## 1. 記事データ形式

記事は `content/blog/*.md` に保存します。

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

