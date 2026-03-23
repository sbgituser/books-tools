#!/usr/bin/env python3
"""
manualClassification が未設定のエントリに対して
categories と keywords からルールベースで l1Id / l2Id を付与する。
"""

import json
import os
import re

INDEX_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "books.index.json")

# ── L2 分類ルール ──
# keywords/categories 内のキーワードから L2 を推定
MANGA_L2_RULES = [
    # (keywords_pattern, l2Id)
    (["少年漫画","ジャンプ","マガジン","サンデー","チャンピオン"], "shonen"),
    (["少女漫画","花とゆめ","マーガレット","LaLa"], "shojo"),
    (["青年漫画","ヤングジャンプ","モーニング","ビッグコミック","アフタヌーン"], "seinen"),
    (["女性漫画","レディコミ","レディースコミック","女性向け"], "general"),
]

NOVEL_L2_RULES = [
    (["ミステリー","推理","探偵","殺人","サスペンス","スリラー","イヤミス","密室"], "mystery"),
    (["SF","サイエンスフィクション","宇宙","ディストピア","サイバーパンク","近未来"], "sf"),
    (["ファンタジー","異世界","魔法","魔王","転生","ライトノベル"], "fantasy"),
    (["恋愛","ラブコメ","純愛","ラブ","青春ブタ","ラムネ瓶"], "romance"),
    (["青春","学園","高校","成長","部活"], "youth"),
    (["純文学","芥川賞","文学","古典","日本文学"], "literary"),
    (["歴史","時代小説","戦国","幕末","江戸","武士"], "historical-novel"),
    (["ホラー","恐怖","怪談","心霊","妖怪","百鬼夜行"], "horror"),
    (["お仕事","企業","医療","弁護士","警察","エンタメ","本屋大賞","映画化","ドラマ化","感動","家族","ヒューマンドラマ"], "entertainment"),
]

def classify_entry(entry):
    """categories と keywords から l1Id, l2Id を推定"""
    cats = entry.get("categories", [])
    kws = entry.get("keywords", [])
    all_text = " ".join(cats + kws + [entry.get("title", "")])

    # Determine l1Id
    l1Id = None
    if "漫画" in all_text or "コミック" in all_text or "Comics" in all_text:
        l1Id = "manga"
    elif "小説" in all_text or "文学" in all_text or "ライトノベル" in all_text:
        l1Id = "novel"
    else:
        # Default based on categories
        for c in cats:
            if "漫画" in c or "Comics" in c:
                l1Id = "manga"
                break
            if "小説" in c or "文学" in c:
                l1Id = "novel"
                break

    if not l1Id:
        return None

    # Determine l2Id
    l2Id = None
    rules = MANGA_L2_RULES if l1Id == "manga" else NOVEL_L2_RULES

    best_score = 0
    for keywords, l2 in rules:
        score = sum(1 for kw in keywords if kw in all_text)
        if score > best_score:
            best_score = score
            l2Id = l2

    # Fallback l2 assignment
    if not l2Id:
        if l1Id == "manga":
            # Check specific patterns
            if any(kw in all_text for kw in ["バトル","アクション","冒険","少年"]):
                l2Id = "shonen"
            elif any(kw in all_text for kw in ["恋愛","ラブ","少女"]):
                l2Id = "shojo"
            elif any(kw in all_text for kw in ["ホラー","サスペンス","頭脳戦","グルメ","お仕事","社会","日常","ギャグ","スポーツ","歴史","異世界","転生","医療","投資","音楽","SF","ファンタジー","格闘"]):
                l2Id = "seinen"
            else:
                l2Id = "general"
        else:
            l2Id = "entertainment"

    return {"l1Id": l1Id, "l2Id": l2Id, "l3Id": None, "l4TagIds": [], "l5TagIds": []}


def main():
    with open(INDEX_PATH, encoding="utf-8") as f:
        entries = json.load(f)

    classified = 0
    already = 0
    failed = 0

    for entry in entries:
        if entry.get("manualClassification"):
            already += 1
            continue

        mc = classify_entry(entry)
        if mc:
            entry["manualClassification"] = mc
            classified += 1
        else:
            failed += 1

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f"Already classified: {already}")
    print(f"Newly classified: {classified}")
    print(f"Failed to classify: {failed}")
    print(f"Total: {len(entries)}")

    # Distribution
    l1_dist = {}
    l2_dist = {}
    for e in entries:
        mc = e.get("manualClassification", {})
        l1 = mc.get("l1Id", "none")
        l2 = mc.get("l2Id", "none")
        l1_dist[l1] = l1_dist.get(l1, 0) + 1
        l2_dist[l2] = l2_dist.get(l2, 0) + 1

    print(f"\nL1 distribution: {dict(sorted(l1_dist.items(), key=lambda x:-x[1]))}")
    print(f"L2 distribution: {dict(sorted(l2_dist.items(), key=lambda x:-x[1]))}")

if __name__ == "__main__":
    main()
