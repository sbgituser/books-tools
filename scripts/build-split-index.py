#!/usr/bin/env python3
"""
build-split-index.ts の Python版（簡易版）。
books.index.json を L1カテゴリ別に分割し、public/data/ に書き出す。
manualClassification を使うため、resolveBookClassification の完全移植は不要。
"""

import json
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(ROOT, "src", "data", "books.index.json")
OUT_DIR = os.path.join(ROOT, "public", "data")
os.makedirs(OUT_DIR, exist_ok=True)

# L1カテゴリ定義（categories.ts のIDリスト）
L1_IDS = ["manga", "novel", "business", "self-help", "tech", "science",
           "philosophy", "psychology", "history", "investing"]

with open(INDEX_PATH, encoding="utf-8") as f:
    raw_data = json.load(f)

l1_groups = defaultdict(list)
book_l1 = {}
skipped = 0

for raw in raw_data:
    if not raw.get("title"):
        skipped += 1
        continue

    mc = raw.get("manualClassification", {})
    l1_id = mc.get("l1Id")

    if not l1_id:
        # Fallback: カテゴリ・キーワードから推定
        cats = " ".join(raw.get("categories", []))
        kws = " ".join(raw.get("keywords", []))
        all_text = cats + " " + kws + " " + raw.get("title", "")

        if "漫画" in all_text or "コミック" in all_text or "Comics" in all_text:
            l1_id = "manga"
        elif "小説" in all_text or "文学" in all_text or "ライトノベル" in all_text:
            l1_id = "novel"
        elif any(k in all_text for k in ["ビジネス", "経営", "マネジメント"]):
            l1_id = "business"
        elif any(k in all_text for k in ["自己啓発", "習慣", "メンタル"]):
            l1_id = "self-help"
        elif any(k in all_text for k in ["プログラミング", "エンジニア", "IT", "技術"]):
            l1_id = "tech"
        elif any(k in all_text for k in ["科学", "物理", "化学", "生物"]):
            l1_id = "science"
        elif any(k in all_text for k in ["哲学", "思想"]):
            l1_id = "philosophy"
        elif any(k in all_text for k in ["心理", "精神"]):
            l1_id = "psychology"
        elif any(k in all_text for k in ["歴史", "世界史", "日本史"]):
            l1_id = "history"
        elif any(k in all_text for k in ["投資", "株", "FX", "資産運用"]):
            l1_id = "investing"

    if not l1_id or l1_id not in L1_IDS:
        skipped += 1
        continue

    l2_id = mc.get("l2Id")
    l3_id = mc.get("l3Id")

    # pathIds 構築
    path_ids = []
    if l2_id:
        path_ids.append(l2_id)
    if l3_id:
        path_ids.append(l3_id)

    split_book = {
        "id": raw.get("id", raw.get("isbn13", "")),
        "title": raw["title"],
        "authors": raw.get("authors", []),
        "keywords": raw.get("keywords", []),
        "pathIds": path_ids,
        "l1Id": l1_id,
        "confidence": {"l1": 1.0, "l2": 0.8, "l3": 0.5},
        "reasons": ["manualClassification"],
    }

    if l2_id: split_book["l2Id"] = l2_id
    if l3_id: split_book["l3Id"] = l3_id
    split_book["l4TagIds"] = mc.get("l4TagIds", [])
    split_book["l5TagIds"] = mc.get("l5TagIds", [])

    # Optional fields
    if raw.get("subtitle"): split_book["subtitle"] = raw["subtitle"]
    if raw.get("publisher"): split_book["publisher"] = raw["publisher"]
    if raw.get("publishedDate"): split_book["publishedDate"] = raw["publishedDate"]
    if raw.get("isbn13"): split_book["isbn13"] = raw["isbn13"]
    if raw.get("subjects"): split_book["subjects"] = raw["subjects"]
    if raw.get("pageCount"): split_book["pageCount"] = raw["pageCount"]
    if raw.get("estimatedReadingHours"): split_book["estimatedReadingHours"] = raw["estimatedReadingHours"]
    if raw.get("thumbnailUrl"): split_book["thumbnailUrl"] = raw["thumbnailUrl"]
    if raw.get("relatedBookIds"): split_book["relatedBookIds"] = raw["relatedBookIds"]
    if raw.get("sourceIds", {}).get("googleBooksId"):
        split_book["sourceIds"] = {"googleBooksId": raw["sourceIds"]["googleBooksId"]}
    if raw.get("moodTags"): split_book["moodTags"] = raw["moodTags"]

    l1_groups[l1_id].append(split_book)
    book_l1[split_book["id"]] = l1_id

# パス別冊数・サムネ
l1_counts = {}
path_counts = {}
path_thumbs = {}

for l1_id in L1_IDS:
    books = l1_groups.get(l1_id, [])
    if not books:
        continue

    l1_counts[l1_id] = len(books)

    # パスインデックス
    thumb_sets = {}
    for b in books:
        ids = b.get("pathIds", [])
        for i in range(len(ids)):
            p = f"{l1_id}:{':'.join(ids[:i+1])}"
            path_counts[p] = path_counts.get(p, 0) + 1
            if p not in thumb_sets:
                thumb_sets[p] = set()
            if b.get("thumbnailUrl") and len(thumb_sets[p]) < 3:
                thumb_sets[p].add(b["thumbnailUrl"])

    for p, ts in thumb_sets.items():
        path_thumbs[p] = list(ts)

    # L1別 JSON
    with open(os.path.join(OUT_DIR, f"books-{l1_id}.json"), "w", encoding="utf-8") as f:
        json.dump(books, f, ensure_ascii=False, separators=(",", ":"))
    print(f"✓ books-{l1_id}.json  ({len(books)}冊)")

# meta.json
with open(os.path.join(OUT_DIR, "meta.json"), "w", encoding="utf-8") as f:
    json.dump({"l1Counts": l1_counts, "pathCounts": path_counts, "pathThumbs": path_thumbs},
              f, ensure_ascii=False, separators=(",", ":"))
print("✓ meta.json")

# book-l1.json
with open(os.path.join(OUT_DIR, "book-l1.json"), "w", encoding="utf-8") as f:
    json.dump(book_l1, f, ensure_ascii=False, separators=(",", ":"))
print(f"✓ book-l1.json  ({len(book_l1)}冊)")

if skipped > 0:
    print(f"  ※ {skipped}冊は分類不能のためスキップ")
