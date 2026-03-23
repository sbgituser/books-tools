#!/usr/bin/env python3
"""
normalize-works.ts の Python版。
books.index.json → data/normalized/works.json, volumes.json
"""

import json
import os
import re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(ROOT, "src", "data", "books.index.json")
OUT_DIR = os.path.join(ROOT, "data", "normalized")
SUPPLEMENT_PATH = os.path.join(ROOT, "data", "summaries-supplement.json")

os.makedirs(OUT_DIR, exist_ok=True)

# Load summaries supplement
summaries = {}
if os.path.exists(SUPPLEMENT_PATH):
    with open(SUPPLEMENT_PATH, encoding="utf-8") as f:
        summaries = json.load(f)

def normalize_title(s):
    s = s.lower()
    # 全角英数→半角
    result = []
    for c in s:
        cp = ord(c)
        if 0xFF21 <= cp <= 0xFF3A or 0xFF41 <= cp <= 0xFF5A or 0xFF10 <= cp <= 0xFF19:
            result.append(chr(cp - 0xFEE0))
        elif c == '　':
            result.append(' ')
        elif c in '・‐－\-～〜':
            continue
        else:
            result.append(c)
    return re.sub(r'\s+', ' ', ''.join(result)).strip()

VOLUME_PATTERNS = [
    (r'^(.+?)[\s　]+(\d+)巻$', 2),
    (r'^(.+?)（([０-９]+)）$', 2),
    (r'^(.+?)\((\d+)\)$', 2),
    (r'^(.+?)[\s　]+(\d+)$', 2),
    (r'^(.+?)[\s　]+第(\d+)巻$', 2),
    (r'^(.+?)[\s　]+[Vv]ol\.?(\d+)$', 2),
]

def to_half_digit(s):
    result = []
    for c in s:
        cp = ord(c)
        if 0xFF10 <= cp <= 0xFF19:
            result.append(chr(cp - 0xFEE0))
        else:
            result.append(c)
    return ''.join(result)

def extract_volume_info(title):
    for pattern, _ in VOLUME_PATTERNS:
        m = re.match(pattern, title)
        if m:
            base = m.group(1).strip()
            num_str = to_half_digit(m.group(2))
            try:
                vol_no = int(num_str)
                return base, vol_no
            except ValueError:
                pass
    return title, None

def make_work_id(type_str, base_title, first_author):
    norm = normalize_title(base_title)
    norm = re.sub(r'[^\w\u3040-\u30ff\u4e00-\u9fff\u3400-\u4dbf]', '_', norm)
    norm = re.sub(r'_+', '_', norm).strip('_')[:40]
    author_slug = re.sub(r'[^\w\u3040-\u30ff\u4e00-\u9fff]', '', first_author)[:10]
    return f"{type_str}__{norm}__{author_slug}".lower()

def make_volume_id(work_id, legacy_id):
    return f"vol__{work_id}__{legacy_id}"[:80]

# Emotional/purpose/atmosphere tag maps (from TS)
EMOTIONAL_MAP = {"cry":"泣ける","emotional":"感動","sad":"切ない","hot":"熱い","refreshing":"爽快",
    "funny":"笑える","healing":"癒やし","scary":"怖い","hopeless":"絶望","positive":"前向き","heartwarming":"心温まる"}
PURPOSE_MAP = {"thinking":"考えさせられる","intellectual":"知的","learning":"学べる","binge":"一気読み",
    "easy":"読みやすい","short":"短編","immersive":"世界観重視","motivated":"やる気が出る"}
ATMOSPHERE_MAP = {"dark":"ダーク","bright":"明るい","calm":"穏やか","daily":"日常系",
    "fantasy":"ファンタジー","tense":"バトル","gentle":"優しい","profound":"深い"}

L2_TAGS = {"mystery":["考えさせられる","深い"],"literary":["感動","考えさせられる"],
    "sf":["世界観重視"],"fantasy":["ファンタジー","世界観重視"],
    "romance":["泣ける","感動","心温まる"],"entertainment":["読みやすい","一気読み"],
    "horror":["怖い","ダーク"]}

def build_discovery_tags(entry):
    tags = set()
    mood = entry.get("moodTags", {})
    if mood:
        for t in mood.get("emotionalTags", []):
            if t in EMOTIONAL_MAP: tags.add(EMOTIONAL_MAP[t])
        for t in mood.get("purposeTags", []):
            if t in PURPOSE_MAP: tags.add(PURPOSE_MAP[t])
        for t in mood.get("atmosphereTags", []):
            if t in ATMOSPHERE_MAP: tags.add(ATMOSPHERE_MAP[t])
        if mood.get("completionStatus") == "完結":
            tags.add("完結")

    mc = entry.get("manualClassification", {})
    if mc.get("l1Id") == "novel":
        l2 = mc.get("l2Id", "")
        for tag in L2_TAGS.get(l2, []):
            tags.add(tag)
        # Title-based
        title = entry.get("title", "")
        kws = entry.get("keywords", [])
        all_text = title + " " + " ".join(kws)
        if re.search(r'ミステリ|推理|探偵|殺人|密室|謎解き|事件|犯人|刑事', all_text):
            tags.add("考えさせられる"); tags.add("深い")
        if re.search(r'SF|宇宙|未来|ロボット|AI|タイムトラベル', all_text):
            tags.add("世界観重視")
        if re.search(r'ファンタジー|魔法|魔王|ドラゴン|異世界|転生|勇者', all_text):
            tags.add("ファンタジー"); tags.add("世界観重視")
        if re.search(r'恋愛|恋する|青春|ラブ|初恋', all_text):
            tags.add("心温まる"); tags.add("泣ける")
        if re.search(r'感動|泣ける|涙|切ない', all_text):
            tags.add("感動"); tags.add("泣ける")
        if re.search(r'ホラー|恐怖|怪談|心霊|呪い|幽霊', all_text):
            tags.add("怖い"); tags.add("ダーク")
        if re.search(r'日常|ほのぼの|ゆったり|穏やか', all_text):
            tags.add("日常系"); tags.add("癒やし")
        if re.search(r'コメディ|笑え|ユーモア', all_text):
            tags.add("笑える")
        if re.search(r'冒険|旅|探検|熱い|情熱', all_text):
            tags.add("熱い")

    # Manga: keywords-based tags
    if mc.get("l1Id") == "manga":
        kws = entry.get("keywords", [])
        all_text = " ".join(kws)
        if any(k in all_text for k in ["バトル","アクション","冒険"]):
            tags.add("熱い"); tags.add("一気読み")
        if any(k in all_text for k in ["ファンタジー","異世界","魔法"]):
            tags.add("ファンタジー"); tags.add("世界観重視")
        if any(k in all_text for k in ["ホラー","恐怖","ゾンビ"]):
            tags.add("怖い"); tags.add("ダーク")
        if any(k in all_text for k in ["ギャグ","コメディ","笑"]):
            tags.add("笑える"); tags.add("読みやすい")
        if any(k in all_text for k in ["日常","ほのぼの","癒"]):
            tags.add("日常系"); tags.add("癒やし")
        if any(k in all_text for k in ["恋愛","ラブコメ","少女漫画"]):
            tags.add("心温まる")
        if any(k in all_text for k in ["推理","ミステリー","頭脳戦"]):
            tags.add("考えさせられる"); tags.add("深い")
        if any(k in all_text for k in ["感動","泣ける"]):
            tags.add("感動"); tags.add("泣ける")
        if any(k in all_text for k in ["スポーツ","サッカー","バスケ","野球","テニス","バレー"]):
            tags.add("熱い"); tags.add("爽快")
        if any(k in all_text for k in ["SF","宇宙","サイバーパンク","ロボット"]):
            tags.add("世界観重視")
        if any(k in all_text for k in ["歴史","戦国","三国志","戦記"]):
            tags.add("世界観重視"); tags.add("深い")
        if any(k in all_text for k in ["医療","お仕事","投資","音楽"]):
            tags.add("学べる"); tags.add("考えさせられる")
        if any(k in all_text for k in ["グルメ","料理","食"]):
            tags.add("癒やし"); tags.add("日常系")

    return list(tags)


def main():
    with open(INDEX_PATH, encoding="utf-8") as f:
        raw_data = json.load(f)

    targets = [b for b in raw_data if b.get("manualClassification", {}).get("l1Id") in ("manga", "novel")]
    print(f"対象エントリ数: {len(targets)} (manga + novel)")

    # Group by work
    groups = defaultdict(list)
    for entry in targets:
        mc = entry["manualClassification"]
        type_str = mc["l1Id"]
        base, _ = extract_volume_info(entry["title"])
        authors = entry.get("authors", ["unknown"])
        first_author = authors[0] if authors else "unknown"
        key = make_work_id(type_str, base, first_author)
        groups[key].append(entry)

    print(f"グループ数 (Work候補): {len(groups)}")

    works = []
    volumes = []

    for work_id, entries in groups.items():
        # Representative entry
        entries_sorted = sorted(entries, key=lambda e: (
            2 if e.get("thumbnailUrl") else 0) + (1 if e.get("publishedDate") else 0), reverse=True)
        rep = entries_sorted[0]
        mc = rep["manualClassification"]
        type_str = mc["l1Id"]
        base_title, _ = extract_volume_info(rep["title"])

        dates = sorted([e["publishedDate"] for e in entries if e.get("publishedDate")])

        # Discovery tags from all entries
        all_tags = set()
        for e in entries:
            for t in build_discovery_tags(e):
                all_tags.add(t)

        # Status
        mood = rep.get("moodTags", {})
        cs = mood.get("completionStatus", "")
        status = "completed" if cs == "完結" else "ongoing" if cs == "連載中" else "unknown"

        # Volumes
        work_vols = []
        for e in entries:
            _, vol_no = extract_volume_info(e["title"])
            vol_id = make_volume_id(work_id, e.get("id", e.get("isbn13", "")))
            work_vols.append({
                "volumeId": vol_id, "workId": work_id, "volumeNo": vol_no,
                "volumeLabel": f"第{vol_no}巻" if vol_no else e["title"],
                "title": e["title"], "publishedDate": e.get("publishedDate"),
                "isbn13": e.get("isbn13"), "pageCount": e.get("pageCount"),
                "coverImageUrl": e.get("thumbnailUrl"),
                "googleBooksId": e.get("sourceIds", {}).get("googleBooksId"),
            })
        work_vols.sort(key=lambda v: (v["volumeNo"] if v["volumeNo"] is not None else 9999))
        volumes.extend(work_vols)

        # L2/L3 majority vote
        l2_votes = defaultdict(int)
        l3_votes = defaultdict(int)
        for e in entries:
            emc = e.get("manualClassification", {})
            l2 = emc.get("l2Id")
            l3 = emc.get("l3Id")
            if l2: l2_votes[l2] += 1
            if l3: l3_votes[l3] += 1
        l2_id = max(l2_votes, key=l2_votes.get) if l2_votes else None
        l3_id = max(l3_votes, key=l3_votes.get) if l3_votes else None

        # Discovery attributes
        disc_attr = {}
        if mood.get("paceTag"): disc_attr["paceTag"] = mood["paceTag"]
        if mood.get("depthTag"): disc_attr["depthTag"] = mood["depthTag"]
        if mood.get("readingEaseTag"): disc_attr["readingEaseTag"] = mood["readingEaseTag"]
        if mood.get("completionStatus"): disc_attr["completionStatus"] = mood["completionStatus"]
        if mood.get("recommendedFor"): disc_attr["recommendedFor"] = mood["recommendedFor"]

        summary = summaries.get(work_id) or (mood.get("recommendationCatch") if mood else None)

        work = {
            "workId": work_id,
            "type": type_str,
            "title": base_title,
            "titleNormalized": normalize_title(base_title),
            "authorDisplay": " / ".join(rep.get("authors", [])),
            "authors": rep.get("authors", []),
            "publisherMain": rep.get("publisher"),
            "summaryShort": summary,
            "status": status,
            "volumeCount": len(work_vols),
            "firstPublishedDate": dates[0] if dates else None,
            "latestPublishedDate": dates[-1] if dates else None,
            "coverImageUrl": rep.get("thumbnailUrl"),
            "discoveryTags": list(all_tags),
            "discoveryAttributes": disc_attr,
            "relatedWorkIds": [],
            "volumeIds": [v["volumeId"] for v in work_vols],
        }
        if l2_id:
            work["l2Id"] = l2_id
        if l3_id:
            work["l3Id"] = l3_id

        works.append(work)

    # Related works (same type, overlapping tags)
    by_type = defaultdict(list)
    for w in works:
        by_type[w["type"]].append(w)

    for work in works:
        my_tags = set(work["discoveryTags"])
        if not my_tags:
            continue
        same = by_type[work["type"]]
        scored = []
        for other in same:
            if other["workId"] == work["workId"]:
                continue
            overlap = len(set(other["discoveryTags"]) & my_tags)
            if overlap > 0:
                scored.append((other["workId"], overlap))
        scored.sort(key=lambda x: -x[1])
        work["relatedWorkIds"] = [s[0] for s in scored[:6]]

    # Write
    with open(os.path.join(OUT_DIR, "works.json"), "w", encoding="utf-8") as f:
        json.dump(works, f, ensure_ascii=False, indent=2)
    with open(os.path.join(OUT_DIR, "volumes.json"), "w", encoding="utf-8") as f:
        json.dump(volumes, f, ensure_ascii=False, indent=2)

    manga = sum(1 for w in works if w["type"] == "manga")
    novel = sum(1 for w in works if w["type"] == "novel")
    print(f"\n✓ works.json   ({len(works)} 作品)")
    print(f"✓ volumes.json ({len(volumes)} 巻)")
    print(f"  漫画: {manga} / 小説: {novel}")

    # L2 distribution
    l2d = defaultdict(int)
    for w in works:
        l2d[w.get("l2Id", "none")] += 1
    print(f"\nL2分布: {dict(sorted(l2d.items(), key=lambda x:-x[1]))}")

    # Discovery tags coverage
    has_tags = sum(1 for w in works if w.get("discoveryTags") and len(w["discoveryTags"]) > 0)
    print(f"discoveryTags付き: {has_tags}/{len(works)}")

if __name__ == "__main__":
    main()
