<#
.SYNOPSIS
    書籍情報の日次収集・デプロイスクリプト

.DESCRIPTION
    Google Books API の日次クォータ（10,000 req/日）を上限として
    書籍情報を収集し、Cloudflare Pages へ自動デプロイする。

    実行内容:
      1. search:books   - ISBNを収集（クォータ上限で自動停止）
      2. fetch:books    - 書籍詳細を取得（差分のみ）
      3. build:related  - 類似本を計算
      4. git commit & push → Cloudflare Pages へ自動デプロイ
#>

$projectDir = "C:\Users\ukuiu\Documents\work\books-tools"
$logDir     = "$projectDir\scripts\logs"
$logFile    = "$logDir\$(Get-Date -Format 'yyyy-MM-dd').log"

# ── ログ準備 ──────────────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Log($msg) {
    $line = "[$(Get-Date -Format 'HH:mm:ss')] $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line -Encoding UTF8
}

function Run($cmd, $desc) {
    Log "▶ $desc"
    $result = Invoke-Expression $cmd 2>&1
    $result | ForEach-Object { Add-Content -Path $logFile -Value "    $_" -Encoding UTF8 }
    if ($LASTEXITCODE -ne 0) {
        Log "  ⚠️  終了コード $LASTEXITCODE（レート制限か軽微なエラー、続行）"
    } else {
        Log "  ✓ 完了"
    }
    return $result
}

# ── メイン ────────────────────────────────────────────────────────
Log "========================================"
Log "書籍情報 日次収集 開始"
Log "========================================"

Set-Location $projectDir

# 1. ISBN収集（429レート制限で自動停止、終了コードは無視）
Run "npx tsx scripts/search-books.ts 2>&1" "search:books (ISBN収集)"

# 2. 書籍詳細取得（差分のみ）
Run "npx tsx scripts/fetch-books.ts 2>&1" "fetch:books (詳細取得)"

# 3. 類似本計算
Run "npx tsx scripts/build-related.ts 2>&1" "build:related (類似本計算)"

# 4. git: 変更があればコミット＆プッシュ
Log "▶ git: 変更チェック"
$status = git status --porcelain src/data/books.index.json src/data/books.source.json
if ($status) {
    $date    = Get-Date -Format 'yyyy-MM-dd'
    $count   = (Get-Content src/data/books.index.json | ConvertFrom-Json).Count
    Log "  変更あり → コミット中..."
    git add src/data/books.index.json src/data/books.source.json 2>&1 | Out-Null
    $msg = "data: 書籍データ更新 $date ($count 冊)"
    git commit -m $msg 2>&1 | ForEach-Object { Log "    $_" }
    git push origin master 2>&1 | ForEach-Object { Log "    $_" }
    Log "  ✓ push 完了 → Cloudflare Pages デプロイ開始"
} else {
    Log "  変更なし（新規書籍なし）、スキップ"
}

Log "========================================"
Log "完了"
Log "========================================"
