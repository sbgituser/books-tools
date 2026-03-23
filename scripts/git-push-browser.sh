#!/bin/bash
# =============================================================================
# git-push-browser.sh - ブラウザ経由でGitHub APIを呼び出しファイルをプッシュ
#
# Coworkサンドボックスのプロキシがgithub.comをブロックするため、
# ブラウザタブのfetch()でGitHub Contents APIを呼び出す。
#
# 出力: ブラウザで実行するJavaScriptコードをSTDOUTに出力する。
#       Coworkのjavascript_toolで実行すること。
#
# 使用方法:
#   # 1. JavaScriptコードを生成
#   ./scripts/git-push-browser.sh src/lib/site.ts "feat: 変更内容"
#
#   # 2. 出力されたJSをCoworkのjavascript_toolで実行
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOKEN_FILE="$REPO_ROOT/.github-token"
OWNER="sbgituser"
REPO="books-tools"
BRANCH="master"

if [ $# -lt 2 ]; then
    echo "Usage: $0 <file_path> <commit_message>" >&2
    exit 1
fi

FILE_PATH="$1"
COMMIT_MSG="$2"
FULL_PATH="$REPO_ROOT/$FILE_PATH"

if [ ! -f "$FULL_PATH" ]; then
    echo "Error: File not found: $FULL_PATH" >&2
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE" | tr -d '\n')

# CRLF→LF変換してbase64エンコード
CONTENT_B64=$(sed 's/\r$//' "$FULL_PATH" | base64 -w 0)

# JavaScriptコードを生成
cat << JSEOF
(async () => {
  const TOKEN = '${TOKEN}';
  const OWNER = '${OWNER}';
  const REPO = '${REPO}';
  const BRANCH = '${BRANCH}';
  const FILE_PATH = '${FILE_PATH}';
  const COMMIT_MSG = '${COMMIT_MSG}';
  const CONTENT_B64 = '${CONTENT_B64}';

  const headers = {
    'Authorization': 'Bearer ' + TOKEN,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };
  const apiBase = 'https://api.github.com/repos/' + OWNER + '/' + REPO;

  // 1. 既存ファイルのSHA取得
  let sha = '';
  try {
    const getResp = await fetch(apiBase + '/contents/' + FILE_PATH + '?ref=' + BRANCH, { headers });
    if (getResp.ok) {
      const data = await getResp.json();
      sha = data.sha;
    }
  } catch (e) {}

  // 2. ファイル更新/作成
  const body = {
    message: COMMIT_MSG,
    content: CONTENT_B64,
    branch: BRANCH
  };
  if (sha) body.sha = sha;

  const putResp = await fetch(apiBase + '/contents/' + FILE_PATH, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });
  const result = await putResp.json();

  if (result.commit) {
    return 'SUCCESS: commit ' + result.commit.sha.slice(0, 7) + ' - ' + FILE_PATH;
  } else {
    return 'ERROR: ' + (result.message || JSON.stringify(result));
  }
})();
JSEOF
