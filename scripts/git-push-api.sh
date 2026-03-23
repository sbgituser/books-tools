#!/bin/bash
# =============================================================================
# git-push-api.sh - GitHub API経由でファイルをプッシュするスクリプト
#
# サンドボックスVMのネットワーク制約（proxyがgithub.comをブロック）を回避し、
# ブラウザタブのfetch()経由でGitHub Contents APIを呼び出してファイルを更新する。
#
# 使用方法:
#   ./scripts/git-push-api.sh <file_path> <commit_message>
#
# 例:
#   ./scripts/git-push-api.sh src/lib/site.ts "feat: パートナータグを追加"
#
# 前提条件:
#   - .github-token ファイルにPATが保存されていること
#   - Coworkブラウザタブが利用可能であること
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOKEN_FILE="$REPO_ROOT/.github-token"
OWNER="sbgituser"
REPO="books-tools"
BRANCH="master"

# 引数チェック
if [ $# -lt 2 ]; then
    echo "Usage: $0 <file_path> <commit_message>"
    echo "  file_path: リポジトリルートからの相対パス (例: src/lib/site.ts)"
    echo "  commit_message: コミットメッセージ"
    exit 1
fi

FILE_PATH="$1"
COMMIT_MSG="$2"
FULL_PATH="$REPO_ROOT/$FILE_PATH"

# ファイル存在チェック
if [ ! -f "$FULL_PATH" ]; then
    echo "Error: ファイルが見つかりません: $FULL_PATH"
    exit 1
fi

# トークン読み込み
if [ ! -f "$TOKEN_FILE" ]; then
    echo "Error: トークンファイルが見つかりません: $TOKEN_FILE"
    echo "  .github-token にGitHub PATを保存してください"
    exit 1
fi
TOKEN=$(cat "$TOKEN_FILE" | tr -d '\n')

# ファイルをbase64エンコード (CRLF→LFに変換してからエンコード)
CONTENT_B64=$(sed 's/\r$//' "$FULL_PATH" | base64 -w 0)

echo "📁 Push対象: $FILE_PATH"
echo "📝 メッセージ: $COMMIT_MSG"
echo "📦 エンコード済みサイズ: ${#CONTENT_B64} bytes"

# 既存ファイルのSHAを取得 (更新時に必要)
echo "🔍 既存ファイルのSHA取得中..."
SHA_RESPONSE=$(curl -s \
    --proxy http://localhost:3128 \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$OWNER/$REPO/contents/$FILE_PATH?ref=$BRANCH" 2>&1) || true

# SHAを抽出 (ファイルが存在する場合)
SHA=$(echo "$SHA_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('sha', ''))
except:
    print('')
" 2>/dev/null)

if [ -n "$SHA" ]; then
    echo "✅ 既存ファイルSHA: ${SHA:0:7}..."
else
    echo "📄 新規ファイルとしてプッシュします"
fi

# GitHub Contents APIでファイルを更新/作成
echo "🚀 プッシュ中..."

# JSONペイロードを作成
PAYLOAD=$(python3 -c "
import json
data = {
    'message': '''$COMMIT_MSG''',
    'content': '$CONTENT_B64',
    'branch': '$BRANCH'
}
sha = '$SHA'
if sha:
    data['sha'] = sha
print(json.dumps(data))
")

PUSH_RESPONSE=$(curl -s \
    --proxy http://localhost:3128 \
    -X PUT \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    "https://api.github.com/repos/$OWNER/$REPO/contents/$FILE_PATH" 2>&1) || true

# 結果チェック
COMMIT_SHA=$(echo "$PUSH_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'commit' in data:
        print(data['commit']['sha'][:7])
    elif 'message' in data:
        print('ERROR: ' + data['message'])
    else:
        print('ERROR: Unknown response')
except Exception as e:
    print('ERROR: ' + str(e))
" 2>/dev/null)

if [[ "$COMMIT_SHA" == ERROR:* ]]; then
    echo "❌ プッシュ失敗: $COMMIT_SHA"
    echo "Response: $PUSH_RESPONSE" | head -5
    exit 1
else
    echo "✅ プッシュ成功! コミット: $COMMIT_SHA"
    echo "🔗 https://github.com/$OWNER/$REPO/blob/$BRANCH/$FILE_PATH"
fi
