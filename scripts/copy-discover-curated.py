#!/usr/bin/env python3
"""copy-discover-curated.ts の Python版。"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "discover-curated")
DST = os.path.join(ROOT, "public", "data", "discover-curated")

os.makedirs(DST, exist_ok=True)

if not os.path.exists(SRC):
    print("discover-curated: ソースディレクトリが存在しません (スキップ)")
    exit(0)

files = [f for f in os.listdir(SRC) if f.endswith(".json")]
if not files:
    print("discover-curated: コピー対象ファイルなし (スキップ)")
    exit(0)

for f in files:
    shutil.copy2(os.path.join(SRC, f), os.path.join(DST, f))

print(f"discover-curated: {len(files)} 件コピー → public/data/discover-curated/")
