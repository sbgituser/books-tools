#!/usr/bin/env python3
"""
generate-similar-works.ts の Python版。
各作品に対して「似た作品」をグループ別に生成する。
"""

import json
import os
import re
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKS_PATH = os.path.join(ROOT, "data", "normalized", "works.json")
OUTPUT_DIR = os.path.join(ROOT, "data", "similar-works")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def djb2hash(s):
    h = 5381
    for c in s:
        h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    result = []
    n = h
    if n == 0:
        return "0".zfill(7)
    while n:
        result.append(digits[n % 36])
        n //= 36
    return "".join(reversed(result)).zfill(7)


def normalize_author(name):
    return re.sub(r'\s+', '', name).replace('　', '').lower()


def count_overlap(a, b):
    sb = set(b)
    return sum(1 for x in a if x in sb)


def shared_tags(a, b):
    sb = set(b)
    return [x for x in a if x in sb]


SAME_AUTHOR_MAX = 6
SAME_PUBLISHER_MAX = 5
SIMILAR_TASTE_MAX = 6
MIN_TAG_OVERLAP = 2


def status_score(s):
    return 2 if s == "completed" else 1 if s == "ongoing" else 0


def build_same_author(target, all_works, fid_map, exclude):
    t_authors = [normalize_author(a) for a in target.get("authors", [])]
    if not t_authors:
        return None

    candidates = []
    for w in all_works:
        if w["workId"] == target["workId"] or w["workId"] in exclude:
            continue
        w_authors = [normalize_author(a) for a in w.get("authors", [])]
        overlap = sum(1 for a in w_authors if a in t_authors)
        if overlap > 0:
            candidates.append((w, overlap))

    candidates.sort(key=lambda x: (-x[1], -status_score(x[0].get("status", "")), -x[0].get("volumeCount", 0)))
    candidates = candidates[:SAME_AUTHOR_MAX]

    if not candidates:
        return None

    items = []
    for w, _ in candidates:
        shared = [a for a in w.get("authors", []) if normalize_author(a) in t_authors]
        author = shared[0] if shared else (w.get("authors", ["同著者"])[0] if w.get("authors") else "同著者")
        tl = "漫画" if w.get("type") == "manga" else "小説"
        items.append({
            "workId": w["workId"], "fileId": fid_map.get(w["workId"], ""),
            "title": w["title"], "authorDisplay": w.get("authorDisplay", ""),
            "type": w.get("type", ""), "status": w.get("status", "unknown"),
            "volumeCount": w.get("volumeCount", 1),
            "coverImageUrl": w.get("coverImageUrl"),
            "reason": f"{author}による{tl}",
        })

    return {"type": "same_author", "title": "同じ作者の作品", "items": items}


def build_same_publisher(target, all_works, fid_map, exclude):
    pub = target.get("publisherMain")
    if not pub:
        return None

    candidates = []
    for w in all_works:
        if w["workId"] == target["workId"] or w["workId"] in exclude:
            continue
        if w.get("publisherMain") != pub or w.get("type") != target.get("type"):
            continue
        tag_ol = count_overlap(w.get("discoveryTags", []), target.get("discoveryTags", []))
        candidates.append((w, tag_ol))

    candidates.sort(key=lambda x: (-x[1], -status_score(x[0].get("status", "")), -x[0].get("volumeCount", 0)))
    candidates = candidates[:SAME_PUBLISHER_MAX]

    if not candidates:
        return None

    tl = "漫画" if target.get("type") == "manga" else "小説"
    items = [{
        "workId": w["workId"], "fileId": fid_map.get(w["workId"], ""),
        "title": w["title"], "authorDisplay": w.get("authorDisplay", ""),
        "type": w.get("type", ""), "status": w.get("status", "unknown"),
        "volumeCount": w.get("volumeCount", 1),
        "coverImageUrl": w.get("coverImageUrl"),
        "reason": f"{pub}の{tl}",
    } for w, _ in candidates]

    return {"type": "same_publisher", "title": "同じ出版社・レーベルから探す", "items": items}


def build_similar_taste(target, all_works, fid_map, exclude):
    t_tags = target.get("discoveryTags", [])
    if not t_tags:
        return None

    candidates = []
    for w in all_works:
        if w["workId"] == target["workId"] or w["workId"] in exclude:
            continue
        if not w.get("discoveryTags"):
            continue
        sh = shared_tags(t_tags, w["discoveryTags"])
        if len(sh) >= MIN_TAG_OVERLAP:
            candidates.append((w, sh))

    candidates.sort(key=lambda x: (-len(x[1]), -status_score(x[0].get("status", ""))))
    candidates = candidates[:SIMILAR_TASTE_MAX]

    if not candidates:
        return None

    items = []
    for w, sh in candidates:
        top = sh[:2]
        reason = f"「{'」「'.join(top)}」など読み味が近い" if top else "読み味が近い作品"
        items.append({
            "workId": w["workId"], "fileId": fid_map.get(w["workId"], ""),
            "title": w["title"], "authorDisplay": w.get("authorDisplay", ""),
            "type": w.get("type", ""), "status": w.get("status", "unknown"),
            "volumeCount": w.get("volumeCount", 1),
            "coverImageUrl": w.get("coverImageUrl"),
            "reason": reason,
        })

    return {"type": "similar_taste", "title": "読み味が近い作品", "items": items}


def main():
    with open(WORKS_PATH, encoding="utf-8") as f:
        all_works = json.load(f)

    print(f"類似作品生成開始 — {len(all_works)} 作品")

    fid_map = {w["workId"]: djb2hash(w["workId"]) for w in all_works}

    count = 0
    empty = 0

    for work in all_works:
        fid = fid_map[work["workId"]]

        g1 = build_same_author(work, all_works, fid_map, set())
        ex1 = {i["workId"] for i in (g1["items"] if g1 else [])}

        g2 = build_same_publisher(work, all_works, fid_map, ex1)
        ex2 = ex1 | {i["workId"] for i in (g2["items"] if g2 else [])}

        g3 = build_similar_taste(work, all_works, fid_map, ex2)

        groups = [g for g in [g1, g2, g3] if g and g["items"]]

        output = {
            "workId": work["workId"],
            "groups": groups,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

        with open(os.path.join(OUTPUT_DIR, f"{fid}.json"), "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        if not groups:
            empty += 1
        count += 1

        if count % 200 == 0:
            print(f"  {count} / {len(all_works)} 完了...")

    print(f"\n✓ 完了: {count} 作品, 類似なし: {empty}")


if __name__ == "__main__":
    main()
