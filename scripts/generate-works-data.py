#!/usr/bin/env python3
"""
generate-works-data.ts の Python版。
data/normalized/ の works.json / volumes.json を読み込み、本番サイト用生成物を出力する。

出力先:
  public/data/works-list.json       - 一覧用・軽量
  public/data/discovery-index.json  - 発見機能用
  public/data/works/{fileId}.json   - 詳細用・1ファイル/作品
  public/data/work-id-map.json      - workId → fileId マッピング
"""

import json
import os
from collections import defaultdict
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NORM_DIR = os.path.join(ROOT, "data", "normalized")
OUT_DIR = os.path.join(ROOT, "public", "data")
WORKS_OUT_DIR = os.path.join(OUT_DIR, "works")

os.makedirs(WORKS_OUT_DIR, exist_ok=True)

# ── データ読み込み ──
with open(os.path.join(NORM_DIR, "works.json"), encoding="utf-8") as f:
    works = json.load(f)
with open(os.path.join(NORM_DIR, "volumes.json"), encoding="utf-8") as f:
    volumes = json.load(f)

print(f"読み込み: {len(works)} 作品 / {len(volumes)} 巻")

# volumeId → Volume マップ
volume_map = {v["volumeId"]: v for v in volumes}

# workId → Volume[] マップ
work_volumes_map = defaultdict(list)
for v in volumes:
    work_volumes_map[v["workId"]].append(v)


# ── djb2 ハッシュ (TSと同一ロジック) ──
def djb2hash(s):
    h = 5381
    for c in s:
        h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF  # >>> 0 equivalent
    return base36(h).zfill(7)


def base36(n):
    if n == 0:
        return "0"
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    result = []
    while n:
        result.append(digits[n % 36])
        n //= 36
    return "".join(reversed(result))


# workId → fileId
work_file_ids = {}
for w in works:
    work_file_ids[w["workId"]] = djb2hash(w["workId"])

# ── 1. works-list.json (一覧用軽量データ) ──
work_list_items = []
for w in works:
    work_list_items.append({
        "workId": work_file_ids[w["workId"]],
        "type": w["type"],
        "title": w["title"],
        "authorDisplay": w.get("authorDisplay", ""),
        "status": w.get("status", "unknown"),
        "volumeCount": w.get("volumeCount", 1),
        "coverImageUrl": w.get("coverImageUrl"),
        "discoveryTags": w.get("discoveryTags", []),
        "firstPublishedDate": w.get("firstPublishedDate"),
        "latestPublishedDate": w.get("latestPublishedDate"),
    })

# 漫画→小説順、タイトル昇順
import locale
work_list_items.sort(key=lambda x: (0 if x["type"] == "manga" else 1, x["title"]))

with open(os.path.join(OUT_DIR, "works-list.json"), "w", encoding="utf-8") as f:
    json.dump(work_list_items, f, ensure_ascii=False, separators=(",", ":"))
print(f"✓ works-list.json  ({len(work_list_items)} 作品)")

# ── 2. discovery-index.json (発見機能用) ──
tag_counts = defaultdict(int)
for w in works:
    for tag in w.get("discoveryTags", []):
        tag_counts[tag] += 1

# タグ表示順: 件数降順
available_tags = [tag for tag, _ in sorted(tag_counts.items(), key=lambda x: -x[1]) if _ >= 1]

# タグ → fileId[] インデックス
tag_index = {}
for tag in available_tags:
    tag_index[tag] = [
        work_file_ids[w["workId"]]
        for w in works
        if tag in w.get("discoveryTags", [])
    ]

# 発見機能用 workId → WorkListItem マップ
works_map = {}
for item in work_list_items:
    works_map[item["workId"]] = item

discovery_index = {
    "tagIndex": tag_index,
    "works": works_map,
    "availableTags": available_tags,
    "generatedAt": datetime.now(timezone.utc).isoformat(),
}

with open(os.path.join(OUT_DIR, "discovery-index.json"), "w", encoding="utf-8") as f:
    json.dump(discovery_index, f, ensure_ascii=False, separators=(",", ":"))
print(f"✓ discovery-index.json  ({len(available_tags)} タグ)")
print(f"  タグ上位10: {', '.join(available_tags[:10])}")

# ── 3. works/{fileId}.json (詳細用・per-work) ──
work_id_map = {}
written = 0

for work in works:
    file_id = work_file_ids[work["workId"]]
    work_id_map[work["workId"]] = file_id
    vols = work_volumes_map.get(work["workId"], [])
    detail = {**work, "volumes": vols}
    with open(os.path.join(WORKS_OUT_DIR, f"{file_id}.json"), "w", encoding="utf-8") as f:
        json.dump(detail, f, ensure_ascii=False, separators=(",", ":"))
    written += 1

# work-id-map.json
with open(os.path.join(OUT_DIR, "work-id-map.json"), "w", encoding="utf-8") as f:
    json.dump(work_id_map, f, ensure_ascii=False, separators=(",", ":"))
print(f"✓ work-id-map.json  ({len(work_id_map)} エントリ)")

print(f"✓ works/*.json  ({written} ファイル)")
print("\nDone. 生成物 → public/data/")
