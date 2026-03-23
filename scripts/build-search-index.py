#!/usr/bin/env python3
"""
build-search-index.ts の Python版。
public/data/books-{l1id}.json から検索用インデックスを生成。
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "public", "data")

L1_IDS = ["manga", "novel", "business", "self-help", "tech", "science",
           "philosophy", "psychology", "history", "investing"]

all_entries = []

for l1_id in L1_IDS:
    fpath = os.path.join(DATA_DIR, f"books-{l1_id}.json")
    if not os.path.exists(fpath):
        continue

    with open(fpath, encoding="utf-8") as f:
        books = json.load(f)

    for b in books:
        if not b.get("title") or not b.get("authors"):
            continue

        entry = {
            "id": b["id"],
            "title": b["title"],
            "authors": b["authors"],
            "keywords": b.get("keywords", [])[:10],
            "l1Id": l1_id,
        }

        if b.get("publisher"): entry["publisher"] = b["publisher"]
        if b.get("publishedDate"): entry["publishedDate"] = b["publishedDate"][:7]
        if b.get("isbn13"): entry["isbn13"] = b["isbn13"]
        if b.get("sourceIds", {}).get("googleBooksId"):
            entry["googleBooksId"] = b["sourceIds"]["googleBooksId"]
        if b.get("thumbnailUrl"): entry["thumbnailUrl"] = b["thumbnailUrl"]
        if b.get("pageCount"): entry["pageCount"] = b["pageCount"]
        if b.get("estimatedReadingHours"):
            entry["estimatedReadingHours"] = round(b["estimatedReadingHours"], 1)

        all_entries.append(entry)

with open(os.path.join(DATA_DIR, "search-index.json"), "w", encoding="utf-8") as f:
    json.dump(all_entries, f, ensure_ascii=False, separators=(",", ":"))

print(f"✓ search-index.json  ({len(all_entries)}冊)")
