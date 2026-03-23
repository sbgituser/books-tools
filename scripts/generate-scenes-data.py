#!/usr/bin/env python3
"""
generate-scenes-data.ts の Python版。
読書シーン別の作品JSONを生成する。
"""

import json
import os
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCENES_DIR = os.path.join(ROOT, "public", "data", "scenes")
os.makedirs(SCENES_DIR, exist_ok=True)

# ── READING_SCENES 定義 (readingScenes.ts と同一) ──
READING_SCENES = [
    {
        "slug": "commute", "label": "通勤・通学", "icon": "🚃",
        "description": "電車・バスの移動中にサクッと読める",
        "primaryTags": ["読みやすい", "一気読み", "短編", "笑える", "爽快"],
        "bonusTags": ["明るい", "前向き", "日常系"],
        "excludeTags": ["深い", "絶望"],
        "paceTags": ["早い", "テンポ良い"], "depthTags": ["軽い"],
        "volumeCountMax": 12,
    },
    {
        "slug": "before-sleep", "label": "寝る前", "icon": "🌙",
        "description": "就寝前にほっこり・癒やされる作品",
        "primaryTags": ["癒やし", "穏やか", "優しい", "日常系", "心温まる"],
        "bonusTags": ["明るい", "切ない", "感動"],
        "excludeTags": ["怖い", "絶望", "ダーク", "バトル"],
        "depthTags": ["軽い", "中程度"], "preferredType": "novel",
    },
    {
        "slug": "holiday-binge", "label": "休日に一気読み", "icon": "📚",
        "description": "休みの日にどっぷり没入して読み切る",
        "primaryTags": ["一気読み", "世界観重視", "熱い", "バトル", "感動"],
        "bonusTags": ["考えさせられる", "泣ける", "深い"],
        "excludeTags": [], "volumeCountMin": 5,
    },
    {
        "slug": "short-break", "label": "すきま時間", "icon": "⏱️",
        "description": "5〜15分の合間にサッと読める",
        "primaryTags": ["短編", "読みやすい", "笑える", "日常系"],
        "bonusTags": ["明るい", "爽快", "癒やし"],
        "excludeTags": ["世界観重視", "深い", "絶望"],
        "paceTags": ["早い"], "depthTags": ["軽い"], "volumeCountMax": 5,
    },
    {
        "slug": "cafe", "label": "カフェでゆっくり", "icon": "☕",
        "description": "カフェで落ち着いてじっくり味わえる",
        "primaryTags": ["穏やか", "癒やし", "日常系", "心温まる", "優しい", "感動"],
        "bonusTags": ["切ない", "考えさせられる", "明るい"],
        "excludeTags": ["バトル", "絶望", "怖い", "熱い"],
        "depthTags": ["軽い", "中程度"], "preferredType": "novel",
    },
    {
        "slug": "stress-relief", "label": "ストレス解消したい", "icon": "💪",
        "description": "スカッと発散できる爽快・熱い作品",
        "primaryTags": ["笑える", "爽快", "熱い", "前向き", "やる気が出る", "バトル"],
        "bonusTags": ["明るい", "一気読み"],
        "excludeTags": ["ダーク", "絶望", "怖い"],
        "paceTags": ["早い"], "preferredType": "manga",
    },
    {
        "slug": "calm-down", "label": "気分を落ち着けたい", "icon": "🍃",
        "description": "心を穏やかにしてくれる癒やし系",
        "primaryTags": ["癒やし", "優しい", "穏やか", "心温まる", "日常系"],
        "bonusTags": ["感動", "泣ける", "切ない"],
        "excludeTags": ["バトル", "怖い", "絶望", "ダーク"],
        "depthTags": ["軽い", "中程度"],
    },
    {
        "slug": "exciting", "label": "ワクワクしたい", "icon": "✨",
        "description": "ドキドキ・ワクワクが止まらない作品",
        "primaryTags": ["熱い", "爽快", "バトル", "ファンタジー", "やる気が出る", "世界観重視", "一気読み"],
        "bonusTags": ["明るい", "前向き", "感動"],
        "excludeTags": ["絶望"],
        "paceTags": ["早い"], "preferredType": "manga",
    },
    {
        "slug": "think-deeply", "label": "考えたい", "icon": "🧠",
        "description": "読み終わった後も考え続けてしまう作品",
        "primaryTags": ["考えさせられる", "深い", "学べる", "世界観重視", "ダーク"],
        "bonusTags": ["感動", "泣ける", "絶望", "切ない"],
        "excludeTags": ["笑える"],
        "depthTags": ["重い", "中程度"], "preferredType": "novel",
    },
]

# ── データ読み込み ──
with open(os.path.join(ROOT, "public", "data", "works-list.json"), encoding="utf-8") as f:
    works_list = json.load(f)

with open(os.path.join(ROOT, "data", "normalized", "works.json"), encoding="utf-8") as f:
    normalized_works = json.load(f)

with open(os.path.join(ROOT, "public", "data", "work-id-map.json"), encoding="utf-8") as f:
    work_id_map = json.load(f)

# fileId → discoveryAttributes
file_id_to_attrs = {}
for w in normalized_works:
    fid = work_id_map.get(w["workId"])
    if fid:
        file_id_to_attrs[fid] = w.get("discoveryAttributes", {})

print(f"読み込み: {len(works_list)} 作品, 属性マップ: {len(file_id_to_attrs)} エントリ")


def score_work(work, scene):
    tags = set(work.get("discoveryTags", []))
    attrs = file_id_to_attrs.get(work["workId"], {})

    for ex in scene.get("excludeTags", []):
        if ex in tags:
            return -999

    score = 0
    for t in scene.get("primaryTags", []):
        if t in tags:
            score += 3
    for t in scene.get("bonusTags", []):
        if t in tags:
            score += 1

    if scene.get("paceTags") and attrs.get("paceTag"):
        if attrs["paceTag"] in scene["paceTags"]:
            score += 1
    if scene.get("depthTags") and attrs.get("depthTag"):
        if attrs["depthTag"] in scene["depthTags"]:
            score += 1

    if scene.get("volumeCountMin") is not None and work.get("volumeCount", 1) >= scene["volumeCountMin"]:
        score += 1
    if scene.get("volumeCountMax") is not None and work.get("volumeCount", 1) <= scene["volumeCountMax"]:
        score += 1

    if scene.get("preferredType") and work.get("type") == scene["preferredType"]:
        score += 1

    if len(tags) == 0:
        score += structural_score(work, scene)

    return score


def structural_score(work, scene):
    s = 0
    sc = scene["slug"]
    vc = work.get("volumeCount", 1)
    wtype = work.get("type", "")
    status = work.get("status", "")

    if sc == "commute" and vc <= 10: s += 1
    if sc == "short-break" and vc <= 3: s += 1
    if sc == "holiday-binge" and vc >= 8: s += 1

    if sc in ("before-sleep", "cafe", "think-deeply") and wtype == "novel": s += 1
    if sc in ("stress-relief", "exciting") and wtype == "manga": s += 1

    if sc in ("short-break", "commute") and status == "completed": s += 1
    if sc in ("exciting", "holiday-binge") and status == "ongoing": s += 1

    return s


MAX_WORKS = 120
PRIMARY_MIN = 3
STRUCTURAL_MIN = 1
FALLBACK_THRESHOLD = 30

scene_index_items = []

for scene in READING_SCENES:
    scored = [(w, score_work(w, scene)) for w in works_list]
    excluded_ids = {w["workId"] for w, s in scored if s <= -999}

    def sort_key(x):
        return (-x[1], x[0].get("latestPublishedDate") or "", x[0]["title"])

    tagged = sorted(
        [(w, s) for w, s in scored if s >= PRIMARY_MIN and w["workId"] not in excluded_ids],
        key=sort_key, reverse=False
    )
    # Re-sort: score desc, date desc, title asc
    tagged.sort(key=lambda x: (-x[1], -(ord(x[0].get("latestPublishedDate", "0")[0]) if x[0].get("latestPublishedDate") else 0)))

    combined = tagged
    if len(tagged) < FALLBACK_THRESHOLD:
        tagged_ids = {w["workId"] for w, _ in tagged}
        structural = sorted(
            [(w, s) for w, s in scored if STRUCTURAL_MIN <= s < PRIMARY_MIN
             and w["workId"] not in excluded_ids and w["workId"] not in tagged_ids],
            key=lambda x: (-x[1], x[0].get("title", ""))
        )
        combined = tagged + structural

    items = [w for w, _ in combined[:MAX_WORKS]]

    data = {
        "slug": scene["slug"], "label": scene["label"], "icon": scene["icon"],
        "description": scene["description"], "works": items,
        "totalCount": len(items),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }

    with open(os.path.join(SCENES_DIR, f'{scene["slug"]}.json'), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    scene_index_items.append({
        "slug": scene["slug"], "label": scene["label"], "icon": scene["icon"],
        "description": scene["description"], "count": len(items),
    })

    print(f'✓ scenes/{scene["slug"]}.json  ({len(items)} 作品) [{scene["label"]}]')

index_data = {
    "scenes": scene_index_items,
    "generatedAt": datetime.now(timezone.utc).isoformat(),
}
with open(os.path.join(SCENES_DIR, "index.json"), "w", encoding="utf-8") as f:
    json.dump(index_data, f, ensure_ascii=False, separators=(",", ":"))

print(f"\n✓ scenes/index.json  ({len(READING_SCENES)} シーン)")
