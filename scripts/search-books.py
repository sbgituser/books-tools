#!/usr/bin/env python3
"""
categories.config.json のクエリで Google Books API を検索し、
ISBN-13 を収集して books.source.json に追記するスクリプト
（search-books.ts の Python版）
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)

CONFIG_PATH = os.path.join(SCRIPT_DIR, "categories.config.json")
SOURCE_PATH = os.path.join(ROOT_DIR, "src", "data", "books.source.json")
ENV_PATH = os.path.join(SCRIPT_DIR, ".env")

# Load .env
def load_env():
    api_key = None
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH) as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                v = v.strip()
                if k.strip() == "GOOGLE_BOOKS_API_KEY" and not v.startswith("your_"):
                    api_key = v
    return api_key


def search_google_books(query, lang_restrict="ja", max_results=40, order_by="relevance", api_key=None):
    """Google Books API で検索し、ISBN-13 のリストを返す"""
    params = {
        "q": query,
        "langRestrict": lang_restrict,
        "maxResults": min(max_results, 40),
        "orderBy": order_by,
        "printType": "books",
    }
    if api_key:
        params["key"] = api_key

    url = "https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode(params)

    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        print(f"  [WARN] API error for query '{query}': {e}")
        return []

    items = data.get("items", [])
    isbns = []
    for item in items:
        vol = item.get("volumeInfo", {})
        ids = vol.get("industryIdentifiers", [])
        for iid in ids:
            if iid.get("type") == "ISBN_13":
                isbn = iid["identifier"]
                # 日本語の書籍 (978-4) のみ
                if isbn.startswith("978"):
                    isbns.append(isbn)
                break
    return isbns


def is_volume_duplicate(title):
    """2巻以降を検出（漫画・小説の巻数重複排除）"""
    patterns = [
        r'[（(]\s*\d+\s*[)）]',  # (2), （3）
        r'\s+\d+巻',             # 2巻
        r'\s+\d+$',              # trailing number
        r'[Vv]ol\.?\s*\d+',     # Vol.2
        r'第\d+巻',              # 第2巻
    ]
    # 1巻はOK
    if re.search(r'[（(]\s*1\s*[)）]|1巻$|第1巻|[Vv]ol\.?\s*1$', title or ""):
        return False
    for p in patterns:
        if re.search(p, title or ""):
            return True
    return False


def main():
    api_key = load_env()
    print(f"API Key: {'SET' if api_key else 'NOT SET (rate limited)'}")

    # Load config
    with open(CONFIG_PATH) as f:
        categories = json.load(f)

    # Load existing source
    existing_isbns = set()
    existing_entries = []
    if os.path.exists(SOURCE_PATH):
        with open(SOURCE_PATH) as f:
            existing_entries = json.load(f)
        for entry in existing_entries:
            if entry.get("isbn13"):
                existing_isbns.add(entry["isbn13"])

    print(f"Existing ISBNs: {len(existing_isbns)}")
    print(f"Categories: {len(categories)}")
    total_queries = sum(len(c.get("queries", [])) for c in categories)
    print(f"Total queries: {total_queries}")
    print()

    new_entries = []
    all_new_isbns = set()

    for i, cat in enumerate(categories):
        label = cat["label"]
        queries = cat.get("queries", [])
        lang = cat.get("langRestrict", "ja")
        max_res = cat.get("maxResults", 40)
        order = cat.get("orderBy", "relevance")
        dedup = cat.get("deduplicateVolumes", True)

        cat_isbns = set()
        print(f"[{i+1}/{len(categories)}] {label} ({len(queries)} queries)")

        for j, query in enumerate(queries):
            isbns = search_google_books(query, lang, max_res, order, api_key)
            added = 0
            for isbn in isbns:
                if isbn not in existing_isbns and isbn not in all_new_isbns:
                    new_entries.append({
                        "isbn13": isbn,
                        "_category": label,
                    })
                    all_new_isbns.add(isbn)
                    cat_isbns.add(isbn)
                    added += 1

            if (j + 1) % 10 == 0 or j == len(queries) - 1:
                print(f"  ... {j+1}/{len(queries)} queries done, {len(cat_isbns)} new ISBNs for this category")

            # Rate limiting: 500ms between requests
            time.sleep(0.5)

        print(f"  → {len(cat_isbns)} new ISBNs")
        print()

    # Merge and write
    all_entries = existing_entries + new_entries
    print(f"=== Results ===")
    print(f"Existing ISBNs: {len(existing_isbns)}")
    print(f"New ISBNs found: {len(all_new_isbns)}")
    print(f"Total ISBNs: {len(existing_isbns) + len(all_new_isbns)}")

    with open(SOURCE_PATH, "w", encoding="utf-8") as f:
        json.dump(all_entries, f, ensure_ascii=False, indent=2)

    print(f"Written to {SOURCE_PATH}")


if __name__ == "__main__":
    main()
