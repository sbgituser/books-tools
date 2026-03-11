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

