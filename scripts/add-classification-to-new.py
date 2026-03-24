#!/usr/bin/env python3
"""
manualClassification が未設定のエントリに対して
categories, keywords, title, publisher からルールベースで l1Id / l2Id を付与する。

v2: タイトル・出版社・巻数パターンによる拡張ヒューリスティック追加
"""

import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "books.index.json")
SOURCE_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "books.source.json")

# ── カテゴリラベル → L1/L2 マッピング ──
# categories.config.json のラベルから直接 l1Id / l2Id を推定
CATEGORY_TO_CLASSIFICATION = {
    "ミステリー・サスペンス":           {"l1Id": "novel",  "l2Id": "mystery"},
    "SF・ファンタジー":                {"l1Id": "novel",  "l2Id": "sf"},
    "恋愛・青春小説":                  {"l1Id": "novel",  "l2Id": "romance"},
    "純文学・日本文学":                {"l1Id": "novel",  "l2Id": "literary"},
    "少年コミック":                    {"l1Id": "manga",  "l2Id": "shonen"},
    "少女・恋愛コミック":              {"l1Id": "manga",  "l2Id": "shojo"},
    "青年・一般コミック":              {"l1Id": "manga",  "l2Id": "seinen"},
    "ホラー小説":                      {"l1Id": "novel",  "l2Id": "horror"},
    "歴史小説・時代小説":              {"l1Id": "novel",  "l2Id": "historical-novel"},
    "エンタメ・映像化原作小説":        {"l1Id": "novel",  "l2Id": "entertainment"},
    "ファンタジー小説・異世界転生":    {"l1Id": "novel",  "l2Id": "fantasy"},
    "青春・成長小説":                  {"l1Id": "novel",  "l2Id": "youth"},
    "ホラー・サスペンス漫画":          {"l1Id": "manga",  "l2Id": "seinen"},
    "日常・ギャグ・コメディ漫画":      {"l1Id": "manga",  "l2Id": "seinen"},
    "SF・ファンタジー漫画":            {"l1Id": "manga",  "l2Id": "seinen"},
    "グルメ・趣味漫画":               {"l1Id": "manga",  "l2Id": "seinen"},
    "スポーツ漫画":                    {"l1Id": "manga",  "l2Id": "shonen"},
    "ライトノベル・ラブコメ":          {"l1Id": "novel",  "l2Id": "fantasy"},
    "推理・探偵漫画":                  {"l1Id": "manga",  "l2Id": "seinen"},
    "女性向け・レディースコミック":    {"l1Id": "manga",  "l2Id": "general"},
    "歴史・戦記漫画":                  {"l1Id": "manga",  "l2Id": "seinen"},
    "医療・お仕事小説":               {"l1Id": "novel",  "l2Id": "entertainment"},
    "家族・ヒューマンドラマ小説":      {"l1Id": "novel",  "l2Id": "entertainment"},
    "異世界・転生漫画":               {"l1Id": "manga",  "l2Id": "shonen"},
    "医療・お仕事漫画":               {"l1Id": "manga",  "l2Id": "seinen"},
    "ライトノベル・バトル/アクション":  {"l1Id": "novel",  "l2Id": "fantasy"},
    "短編小説・アンソロジー":          {"l1Id": "novel",  "l2Id": "literary"},
    "受賞作・名作小説":               {"l1Id": "novel",  "l2Id": "entertainment"},
    "BL・ボーイズラブ漫画":            {"l1Id": "manga",  "l2Id": "shojo"},
    "百合・ガールズラブ漫画":          {"l1Id": "manga",  "l2Id": "shojo"},
    "エッセイ漫画・コミックエッセイ":  {"l1Id": "manga",  "l2Id": "general"},
    "ウェブ発・なろう系漫画":          {"l1Id": "manga",  "l2Id": "shonen"},
    "社会派・ノンフィクション小説":    {"l1Id": "novel",  "l2Id": "entertainment"},
    "ダーク・サイコスリラー小説":      {"l1Id": "novel",  "l2Id": "mystery"},
    "教養・学び漫画":                  {"l1Id": "manga",  "l2Id": "general"},
    "4コマ・ショート漫画":             {"l1Id": "manga",  "l2Id": "general"},
    "完結済み名作漫画（少年）":        {"l1Id": "manga",  "l2Id": "shonen"},
    "完結済み名作漫画（青年）":        {"l1Id": "manga",  "l2Id": "seinen"},
}

# ── L1 判定: 出版社ベースのヒント ──
# 既存分類済みデータの出版社分布から、マンガ専門・小説専門の出版社を特定
MANGA_ONLY_PUBLISHERS = [
    "秋田書店", "白泉社", "Square Enix", "スクウェア・エニックス",
    "芳文社", "少年画報社", "一迅社", "日本文芸社", "サード・ライン",
    "フレックスコミックス", "マッグガーデン", "コアミックス", "竹書房",
    "リイド社", "ぶんか社", "ノース・スターズ・ピクチャーズ",
    "コミックバンチ", "ホーム社", "ヒーローズ",
    "メディアファクトリー", "エニックス",  # 旧スクエニ系
]

NOVEL_ONLY_PUBLISHERS = [
    "東京創元社", "文藝春秋", "早川書房", "光文社", "原書房",
    "幻冬舎", "出版芸術社", "グーテンベルク21", "化学同人",
    "河出書房新社", "筑摩書房", "岩波書店",
    "中央公論新社",  # 中公文庫等の文芸
    "角川春樹事務所",  # 文芸系
    "静山社",  # ハリーポッター等
    "ハーレクイン",  # ロマンス小説
    "実業之日本社",  # ミステリー多い
    "廣済堂出版",  # 文芸系
]

# マンガ・小説両方出す出版社 → 他のヒントと組み合わせて判定
MIXED_PUBLISHERS_MANGA_HEAVY = ["集英社", "小学館"]  # マンガ比率高い
MIXED_PUBLISHERS_NOVEL_HEAVY = ["新潮社", "角川書店"]  # 小説比率高い
MIXED_PUBLISHERS_BALANCED = [
    "KADOKAWA", "ＫＡＤＯＫＡＷＡ", "講談社", "双葉社", "宝島社",
    "角川グループパブリッシング", "角川グループパブリッシング ",  # 末尾スペースあり注意
    "講談社 ", "講談社 (発売)",  # バリエーション
]


# ── L1 判定: タイトルキーワード (拡張) ──
MANGA_TITLE_KEYWORDS = [
    "漫画", "マンガ", "まんが", "コミック", "COMIC", "Comic",
    "Comics", "Graphic Novel",
]

NOVEL_TITLE_KEYWORDS = [
    "小説", "ノベル", "ライトノベル", "文学", "物語",
]


# ── L2 分類ルール ──
MANGA_L2_RULES = [
    (["少年漫画","ジャンプ","マガジン","サンデー","チャンピオン"], "shonen"),
    (["少女漫画","花とゆめ","マーガレット","LaLa"], "shojo"),
    (["青年漫画","ヤングジャンプ","モーニング","ビッグコミック","アフタヌーン"], "seinen"),
    (["女性漫画","レディコミ","レディースコミック","女性向け"], "general"),
]

NOVEL_L2_RULES = [
    (["ミステリー","推理","探偵","殺人","サスペンス","スリラー","イヤミス","密室","犯人","事件"], "mystery"),
    (["SF","サイエンスフィクション","宇宙","ディストピア","サイバーパンク","近未来"], "sf"),
    (["ファンタジー","異世界","魔法","魔王","転生","ライトノベル","剣","冒険","ダンジョン"], "fantasy"),
    (["恋愛","ラブコメ","純愛","ラブ","青春ブタ","ラムネ瓶"], "romance"),
    (["青春","学園","高校","成長","部活"], "youth"),
    (["純文学","芥川賞","文学","古典","日本文学"], "literary"),
    (["歴史","時代小説","戦国","幕末","江戸","武士","鬼平","犯科帳","藩","侍"], "historical-novel"),
    (["ホラー","恐怖","怪談","心霊","妖怪","百鬼夜行","呪い","怪奇"], "horror"),
    (["お仕事","企業","医療","弁護士","警察","エンタメ","本屋大賞","映画化","ドラマ化","感動","家族","ヒューマンドラマ"], "entertainment"),
]


def has_volume_number(title: str) -> bool:
    """タイトルに巻数パターンがあるかチェック"""
    patterns = [
        r'\s+\d+$',            # "タイトル 3"
        r'\s+\d+\s*$',
        r'第?\d+巻',           # "第3巻"
        r'Vol\.?\s*\d+',       # "Vol.3"
        r'\(\d+\)',            # "(3)"
        r'【\d+】',            # "【3】"
        r'\s\d+\s*[:：]',      # "3: サブタイトル"
    ]
    return any(re.search(p, title) for p in patterns)


def classify_l1(entry: dict, source_category: str | None = None) -> str | None:
    """L1 (manga/novel) を多段階ヒューリスティックで推定"""
    cats = entry.get("categories", [])
    kws = entry.get("keywords", [])
    title = entry.get("title", "")
    publisher = entry.get("publisher", "")
    all_text = " ".join(cats + kws + [title])
    subjects = entry.get("subjects", [])
    if isinstance(subjects, list):
        all_text += " " + " ".join(subjects)

    # ── Stage 1: カテゴリ/キーワード直接マッチ (最も信頼性高) ──
    if any(kw in all_text for kw in ["漫画", "コミック", "Comics", "Comic books"]):
        return "manga"
    if any(kw in all_text for kw in ["小説", "文学", "ライトノベル"]):
        return "novel"

    # ── Stage 2: タイトルキーワード ──
    if any(kw in title for kw in MANGA_TITLE_KEYWORDS):
        return "manga"
    if any(kw in title for kw in NOVEL_TITLE_KEYWORDS):
        return "novel"

    # ── Stage 3: 出版社（専門社のみ） ──
    if publisher in MANGA_ONLY_PUBLISHERS:
        return "manga"
    if publisher in NOVEL_ONLY_PUBLISHERS:
        return "novel"

    # ── Stage 4: 出版社 + 巻数パターン組み合わせ ──
    has_vol = has_volume_number(title)

    if publisher in MIXED_PUBLISHERS_MANGA_HEAVY:
        # 集英社・小学館: 巻数あり→マンガ確率高
        if has_vol:
            return "manga"
        # 巻数なしでもマンガ確率高いが確定しない
        return "manga"  # デフォルトマンガ寄り

    if publisher in MIXED_PUBLISHERS_NOVEL_HEAVY:
        return "novel"

    if publisher in MIXED_PUBLISHERS_BALANCED:
        # KADOKAWA, 講談社: 巻数パターンで判断
        if has_vol:
            # 巻数があればマンガ寄り（ただし確定ではない）
            return "manga"

    # ── Stage 5: Google Books カテゴリの英語表記 ──
    for c in cats:
        c_lower = c.lower()
        if "comic" in c_lower or "graphic novel" in c_lower or "manga" in c_lower:
            return "manga"
        if "fiction" in c_lower or "novel" in c_lower or "literary" in c_lower:
            return "novel"
        if "detective" in c_lower or "mystery" in c_lower or "adventure" in c_lower:
            return "novel"
        if "short stories" in c_lower:
            return "novel"

    # ── Stage 6: SBクリエイティブ + 特定パターン ──
    if publisher in ["SBクリエイティブ", "ＳＢクリエイティブ", "ソフトバンククリエイティブ"]:
        # SBクリエイティブ は GA文庫（ラノベ）が多い
        if has_vol or any(kw in title for kw in ["転生", "異世界", "勇者", "魔王", "スキル"]):
            return "novel"

    # ── Stage 7: オーバーラップ はラノベ/マンガ ──
    if publisher == "オーバーラップ":
        if has_vol:
            return "manga"  # オーバーラップはマンガもラノベも出す
        return "novel"  # デフォルトはラノベ寄り

    # ── Stage 8: books.source.json の _category フィールドから推定 ──
    if source_category and source_category in CATEGORY_TO_CLASSIFICATION:
        return CATEGORY_TO_CLASSIFICATION[source_category]["l1Id"]

    return None


def classify_l2(entry: dict, l1Id: str) -> str:
    """L2 カテゴリを推定"""
    cats = entry.get("categories", [])
    kws = entry.get("keywords", [])
    title = entry.get("title", "")
    all_text = " ".join(cats + kws + [title])
    subjects = entry.get("subjects", [])
    if isinstance(subjects, list):
        all_text += " " + " ".join(subjects)

    rules = MANGA_L2_RULES if l1Id == "manga" else NOVEL_L2_RULES

    best_score = 0
    l2Id = None
    for keywords, l2 in rules:
        score = sum(1 for kw in keywords if kw in all_text)
        if score > best_score:
            best_score = score
            l2Id = l2

    # Fallback l2 assignment
    if not l2Id:
        if l1Id == "manga":
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

    return l2Id


def classify_entry(entry: dict, source_category: str | None = None) -> dict | None:
    """categories, keywords, title, publisher, source_category から l1Id, l2Id を推定"""
    l1Id = classify_l1(entry, source_category)
    if not l1Id:
        return None

    # source_category があれば l2Id もそこから取得
    l2Id = None
    if source_category and source_category in CATEGORY_TO_CLASSIFICATION:
        l2Id = CATEGORY_TO_CLASSIFICATION[source_category]["l2Id"]

    # source_category で取れなかったら従来ロジック
    if not l2Id:
        l2Id = classify_l2(entry, l1Id)

    return {"l1Id": l1Id, "l2Id": l2Id, "l3Id": None, "l4TagIds": [], "l5TagIds": []}


def main():
    with open(INDEX_PATH, encoding="utf-8") as f:
        entries = json.load(f)

    # books.source.json から ISBN → _category のマッピングを構築
    isbn_to_category = {}
    if os.path.exists(SOURCE_PATH):
        with open(SOURCE_PATH, encoding="utf-8") as f:
            sources = json.load(f)
        for s in sources:
            cat = s.get("_category")
            if cat:
                isbn_to_category[s["isbn13"]] = cat
        print(f"Source categories loaded: {len(isbn_to_category)} ISBNs with _category")
    else:
        print("Warning: books.source.json not found, skipping source category lookup")

    classified = 0
    already = 0
    failed = 0
    newly_classified = []

    for entry in entries:
        if entry.get("manualClassification"):
            already += 1
            continue

        source_cat = isbn_to_category.get(entry.get("isbn13"))
        mc = classify_entry(entry, source_cat)
        if mc:
            entry["manualClassification"] = mc
            classified += 1
            newly_classified.append({
                "title": entry.get("title", ""),
                "publisher": entry.get("publisher", ""),
                "l1Id": mc["l1Id"],
                "l2Id": mc["l2Id"],
            })
        else:
            failed += 1

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f"Already classified: {already}")
    print(f"Newly classified: {classified}")
    print(f"Failed to classify: {failed}")
    print(f"Total: {len(entries)}")

    # Newly classified breakdown
    from collections import Counter
    new_l1 = Counter(e["l1Id"] for e in newly_classified)
    new_l2 = Counter(e["l2Id"] for e in newly_classified)
    print(f"\nNewly classified L1: {dict(new_l1.most_common())}")
    print(f"Newly classified L2: {dict(new_l2.most_common())}")

    # Overall distribution
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
