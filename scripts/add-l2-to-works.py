#!/usr/bin/env python3
"""
L1/L2カテゴリ分類を works.json と public/data/works/*.json に追加するスクリプト。

処理フロー:
1. books.index.json からISBN → manualClassification のマッピングを構築
2. data/normalized/works.json の各作品に l2Id, l3Id を付与
3. public/data/works/*.json にも反映
4. public/data/works-list.json, discovery-index.json にもl2Idを付与

books.index.json のmanualClassificationは categoryClassifier.ts で付与済み。
"""

import json
import os
from collections import Counter

INDEX_PATH = "src/data/books.index.json"
WORKS_PATH = "data/normalized/works.json"
VOLUMES_PATH = "data/normalized/volumes.json"
PUBLIC_WORKS_DIR = "public/data/works/"
WORKS_LIST_PATH = "public/data/works-list.json"
DISCOVERY_INDEX_PATH = "public/data/discovery-index.json"
WORK_ID_MAP_PATH = "public/data/work-id-map.json"

# ── books.index.json → ISBN → classification マッピング構築 ──

def build_isbn_classification_map():
    """ISBN13 → {l1Id, l2Id, l3Id} のマッピングを構築"""
    with open(INDEX_PATH) as f:
        books = json.load(f)

    isbn_map = {}
    for book in books:
        isbn = book.get("isbn13", "")
        mc = book.get("manualClassification", {})
        if isbn and mc.get("l1Id"):
            isbn_map[isbn] = {
                "l1Id": mc.get("l1Id", ""),
                "l2Id": mc.get("l2Id", ""),
                "l3Id": mc.get("l3Id", ""),
            }
    return isbn_map


def build_work_isbn_map():
    """workId → [ISBN13, ...] のマッピングを構築(volumes.json経由)"""
    with open(VOLUMES_PATH) as f:
        volumes = json.load(f)

    work_isbns = {}
    for vol in volumes:
        wid = vol.get("workId", "")
        isbn = vol.get("isbn13", "")
        if wid and isbn:
            if wid not in work_isbns:
                work_isbns[wid] = []
            work_isbns[wid].append(isbn)
    return work_isbns


def majority_vote(classifications):
    """複数巻のclassificationから多数決でl2Id/l3Idを決定"""
    l2_votes = Counter()
    l3_votes = Counter()
    for cl in classifications:
        l2 = cl.get("l2Id", "")
        l3 = cl.get("l3Id", "")
        if l2:
            l2_votes[l2] += 1
        if l3:
            l3_votes[l3] += 1

    l2_winner = l2_votes.most_common(1)[0][0] if l2_votes else ""
    l3_winner = l3_votes.most_common(1)[0][0] if l3_votes else ""
    return l2_winner, l3_winner


def main():
    print("Loading data...")
    isbn_map = build_isbn_classification_map()
    work_isbns = build_work_isbn_map()

    print(f"ISBN → classification: {len(isbn_map)} entries")
    print(f"Work → ISBNs: {len(work_isbns)} works")

    # Load works.json
    with open(WORKS_PATH) as f:
        works = json.load(f)
    print(f"Works: {len(works)}")

    # Assign L2/L3 to each work
    assigned = 0
    l2_dist = Counter()

    for work in works:
        wid = work.get("workId", "")
        isbns = work_isbns.get(wid, [])

        # Collect classifications from all volumes of this work
        classifications = []
        for isbn in isbns:
            if isbn in isbn_map:
                classifications.append(isbn_map[isbn])

        if classifications:
            l2, l3 = majority_vote(classifications)
            if l2:
                work["l2Id"] = l2
                work["l3Id"] = l3 if l3 else None
                assigned += 1
                l2_dist[l2] += 1

        # Fallback: if no classification from ISBN, try summaryShort-based inference
        if "l2Id" not in work or not work.get("l2Id"):
            inferred_l2 = infer_l2_from_metadata(work)
            if inferred_l2:
                work["l2Id"] = inferred_l2
                work["l3Id"] = None
                assigned += 1
                l2_dist[inferred_l2] += 1

    print(f"\nAssigned L2 to {assigned}/{len(works)} works")
    print("L2 distribution:")
    for l2, count in l2_dist.most_common():
        print(f"  {l2}: {count}")

    unassigned = sum(1 for w in works if not w.get("l2Id"))
    print(f"Unassigned: {unassigned}")

    # Save updated works.json
    with open(WORKS_PATH, "w", encoding="utf-8") as f:
        json.dump(works, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Updated {WORKS_PATH}")

    # Update public/data/works/*.json
    # Need work-id-map to find fileId for each workId
    if os.path.exists(WORK_ID_MAP_PATH):
        with open(WORK_ID_MAP_PATH) as f:
            work_id_map = json.load(f)
    else:
        work_id_map = {}

    updated_public = 0
    for work in works:
        wid = work.get("workId", "")
        file_id = work_id_map.get(wid, "")
        if not file_id:
            continue

        fpath = os.path.join(PUBLIC_WORKS_DIR, f"{file_id}.json")
        if not os.path.exists(fpath):
            continue

        with open(fpath) as f:
            public_work = json.load(f)

        # Add l2Id/l3Id
        if work.get("l2Id"):
            public_work["l2Id"] = work["l2Id"]
            if work.get("l3Id"):
                public_work["l3Id"] = work["l3Id"]

            with open(fpath, "w", encoding="utf-8") as f:
                json.dump(public_work, f, ensure_ascii=False)
            updated_public += 1

    print(f"✓ Updated {updated_public} files in {PUBLIC_WORKS_DIR}")

    # Update works-list.json
    if os.path.exists(WORKS_LIST_PATH):
        with open(WORKS_LIST_PATH) as f:
            works_list = json.load(f)

        # Build fileId → l2Id map
        fid_l2 = {}
        for work in works:
            fid = work_id_map.get(work.get("workId", ""), "")
            if fid and work.get("l2Id"):
                fid_l2[fid] = work["l2Id"]

        for item in works_list:
            wid = item.get("workId", "")
            if wid in fid_l2:
                item["l2Id"] = fid_l2[wid]

        with open(WORKS_LIST_PATH, "w", encoding="utf-8") as f:
            json.dump(works_list, f, ensure_ascii=False)
        print(f"✓ Updated {WORKS_LIST_PATH}")

    print("\nDone!")


def infer_l2_from_metadata(work):
    """summaryShort + title からL2カテゴリを推論"""
    text = (work.get("summaryShort", "") + " " + work.get("title", "")).lower()
    wtype = work.get("type", "")

    if wtype == "manga":
        # Manga L2 inference
        if any(kw in text for kw in ["バトル", "戦闘", "能力", "ジャンプ", "少年", "冒険", "友情", "スポーツ", "野球", "サッカー", "バスケ", "試合"]):
            return "shonen"
        if any(kw in text for kw in ["恋愛", "ラブ", "胸キュン", "片思い", "少女", "告白", "ドキドキ"]):
            return "shojo"
        if any(kw in text for kw in ["社会派", "リアル", "ドラマ", "人間ドラマ", "グルメ", "料理", "食", "青年"]):
            return "seinen"
        if any(kw in text for kw in ["日常", "ギャグ", "コメディ", "4コマ", "ほのぼの", "笑い", "ユーモア"]):
            return "general"
        # Default for manga
        return "shonen"  # Most manga default to shonen

    elif wtype == "novel":
        # Novel L2 inference
        if any(kw in text for kw in ["ミステリ", "推理", "探偵", "サスペンス", "事件", "犯人", "殺人", "刑事", "謎"]):
            return "mystery"
        if any(kw in text for kw in ["sf", "宇宙", "ディストピア", "近未来", "ロボット", "人工知能"]):
            return "sf"
        if any(kw in text for kw in ["ファンタジー", "魔法", "異世界", "転生", "魔王", "勇者", "ドラゴン"]):
            return "fantasy"
        if any(kw in text for kw in ["恋愛", "ラブ", "純愛", "恋", "ロマンス"]):
            return "romance"
        if any(kw in text for kw in ["ホラー", "怪談", "恐怖", "心霊", "怖い"]):
            return "horror"
        if any(kw in text for kw in ["青春", "学園", "成長", "部活", "高校"]):
            return "youth"
        if any(kw in text for kw in ["歴史", "時代", "戦国", "幕末", "江戸", "武士"]):
            return "historical-novel"
        if any(kw in text for kw in ["純文学", "文豪", "芥川賞", "直木賞", "文学賞", "受賞"]):
            return "literary"
        if any(kw in text for kw in ["エンタメ", "ベストセラー", "映像化", "映画化", "ドラマ化", "泣ける", "感動"]):
            return "entertainment"
        # Default for novel
        return "literary"

    return ""


if __name__ == "__main__":
    main()
