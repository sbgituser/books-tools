#!/usr/bin/env python3
"""
discover-curated / scene-curated JSON生成スクリプト
タグベースのスコアリングで作品をムード・シーンに割り当て、
テンプレートベースのreason文を生成する。
Claude APIを使用せずに実行可能。
"""

import json
import os
import random
from collections import defaultdict
from datetime import datetime, timezone

WORK_DIR = "public/data/works/"
DISCOVER_OUT = "data/discover-curated/"
SCENE_OUT = "data/scene-curated/"

# ── ムード定義 ──────────────────────────────────────────
MOODS = [
    {
        "slug": "emotional",
        "label": "感動したい",
        "icon": "😢",
        "tags": {"感動": 3, "泣ける": 3, "切ない": 2, "心温まる": 2},
        "intro": "心に響く、じんとくる作品を。漫画も小説も、読後に深い余韻を残す一冊を集めました。",
        "sections_template": [
            {"title": "心の奥に響く小説", "filter_type": "novel", "max": 25},
            {"title": "涙が止まらない漫画", "filter_type": "manga", "max": 25},
            {"title": "切なくも温かい物語", "filter_type": None, "max": 20},
        ],
    },
    {
        "slug": "think",
        "label": "深く考えたい",
        "icon": "🧠",
        "tags": {"考えさせられる": 3, "深い": 2, "学べる": 1},
        "intro": "読み終わっても頭から離れない——そんな作品を。哲学的なテーマや社会問題を扱う深い作品を集めました。",
        "sections_template": [
            {"title": "思考を揺さぶる小説", "filter_type": "novel", "max": 30},
            {"title": "深く考えさせられる漫画", "filter_type": "manga", "max": 30},
            {"title": "読後に世界の見え方が変わる作品", "filter_type": None, "max": 25},
        ],
    },
    {
        "slug": "binge",
        "label": "一気読みしたい",
        "icon": "📖",
        "tags": {"一気読み": 3, "世界観重視": 2, "熱い": 1, "バトル": 1},
        "intro": "気づいたら朝になっていた——そんな体験をさせてくれる作品を。続きが気になって止まれない一冊を集めました。",
        "sections_template": [
            {"title": "一気読み必至の漫画", "filter_type": "manga", "max": 25},
            {"title": "止まれなくなる小説", "filter_type": "novel", "max": 25},
            {"title": "ページをめくる手が止まらない作品", "filter_type": None, "max": 20},
        ],
    },
    {
        "slug": "excited",
        "label": "熱くなりたい",
        "icon": "🔥",
        "tags": {"熱い": 3, "爽快": 2, "バトル": 2, "やる気が出る": 1, "前向き": 1},
        "intro": "心が燃えるような体験を。バトル、スポーツ、冒険——読んで気分が上がる熱い作品を集めました。",
        "sections_template": [
            {"title": "熱いバトル・スポーツ漫画", "filter_type": "manga", "max": 25},
            {"title": "心が燃える小説", "filter_type": "novel", "max": 20},
            {"title": "やる気が出る・前向きな作品", "filter_type": None, "max": 20},
        ],
    },
    {
        "slug": "laugh",
        "label": "笑いたい",
        "icon": "😄",
        "tags": {"笑える": 3, "明るい": 2, "日常系": 1},
        "intro": "クスッと笑える、明るい気分になれる作品を。気軽に楽しめるコメディ作品を集めました。",
        "sections_template": [
            {"title": "爆笑コメディ漫画", "filter_type": "manga", "max": 20},
            {"title": "クスッと笑える小説", "filter_type": "novel", "max": 20},
            {"title": "日常を彩る明るい作品", "filter_type": None, "max": 20},
        ],
    },
    {
        "slug": "dark",
        "label": "ダークな世界を覗きたい",
        "icon": "🌑",
        "tags": {"ダーク": 3, "怖い": 2, "絶望": 2, "深い": 1},
        "intro": "重く、暗く、ぞくりとする作品を。日常では味わえない闇の世界を覗き見る読書体験を。",
        "sections_template": [
            {"title": "背筋が凍るホラー・サスペンス", "filter_type": None, "max": 20},
            {"title": "ダークな世界観の漫画", "filter_type": "manga", "max": 20},
            {"title": "深淵を覗く小説", "filter_type": "novel", "max": 20},
        ],
    },
    {
        "slug": "immerse",
        "label": "世界観に浸りたい",
        "icon": "🌍",
        "tags": {"世界観重視": 3, "ファンタジー": 2, "深い": 1},
        "intro": "独自の世界観・設定に引き込まれる作品を。現実を忘れて別世界に浸りたい時に。",
        "sections_template": [
            {"title": "壮大なファンタジー漫画", "filter_type": "manga", "max": 25},
            {"title": "異世界に浸れる小説", "filter_type": "novel", "max": 20},
            {"title": "独特な世界観の作品", "filter_type": None, "max": 20},
        ],
    },
    {
        "slug": "easy",
        "label": "気軽に読みたい",
        "icon": "😌",
        "tags": {"読みやすい": 3, "明るい": 2, "日常系": 2, "短編": 1, "癒やし": 1},
        "intro": "肩肘張らず、サクッと読める作品を。疲れた日でも楽しめる軽い読み口の作品を集めました。",
        "sections_template": [
            {"title": "気軽に読める漫画", "filter_type": "manga", "max": 20},
            {"title": "サクッと読める小説", "filter_type": "novel", "max": 20},
            {"title": "癒やしの日常系作品", "filter_type": None, "max": 20},
        ],
    },
]

# ── シーン定義 ──────────────────────────────────────────
SCENES = [
    {
        "slug": "commute",
        "scene": "通勤・通学",
        "intro": "電車やバスの揺れの中でも、スッと物語に入れる作品を選びました。テンポよく読めて、途中で止めやすい作品を中心に。",
        "primaryTags": {"読みやすい": 3, "一気読み": 2, "短編": 3, "笑える": 2, "爽快": 2},
        "bonusTags": {"明るい": 1, "前向き": 1, "日常系": 1},
        "excludeTags": ["深い", "絶望"],
        "sections_template": [
            {"title": "スキマ時間に笑えるもの", "prefer_tags": ["笑える", "明るい"], "max": 15},
            {"title": "軽く読み進められるもの", "prefer_tags": ["読みやすい", "日常系"], "max": 15},
            {"title": "テンポよく没入できるもの", "prefer_tags": ["一気読み", "爽快"], "max": 15},
        ],
    },
    {
        "slug": "before-sleep",
        "scene": "寝る前",
        "intro": "就寝前にゆったり読める作品を。穏やかな気持ちで眠りにつける、癒やし系の作品を選びました。",
        "primaryTags": {"癒やし": 3, "心温まる": 3, "日常系": 2, "優しい": 3, "穏やか": 3},
        "bonusTags": {"明るい": 1, "切ない": 1, "感動": 1},
        "excludeTags": ["怖い", "絶望", "ダーク", "バトル"],
        "sections_template": [
            {"title": "穏やかな気持ちになれるもの", "prefer_tags": ["癒やし", "穏やか", "優しい"], "max": 15},
            {"title": "じんわり温まるもの", "prefer_tags": ["心温まる", "感動"], "max": 15},
            {"title": "ゆっくり味わえるもの", "prefer_tags": ["日常系", "明るい"], "max": 15},
        ],
    },
    {
        "slug": "holiday-binge",
        "scene": "休日に一気読み",
        "intro": "休みの日にどっぷり没入して読み切る。長編シリーズでも完結作品でも、休日の贅沢な読書時間を。",
        "primaryTags": {"一気読み": 3, "世界観重視": 3, "熱い": 2, "バトル": 2, "感動": 2},
        "bonusTags": {"考えさせられる": 1, "泣ける": 1, "深い": 1},
        "excludeTags": [],
        "sections_template": [
            {"title": "世界観にどっぷり浸れるもの", "prefer_tags": ["世界観重視", "ファンタジー"], "max": 20},
            {"title": "一日で駆け抜けたい熱い作品", "prefer_tags": ["熱い", "バトル", "爽快"], "max": 20},
            {"title": "感動で休日を締めくくる作品", "prefer_tags": ["感動", "泣ける"], "max": 20},
        ],
    },
    {
        "slug": "short-break",
        "scene": "すきま時間",
        "intro": "5〜15分の合間にサッと読める作品を。短編や1話完結スタイルの作品を中心に選びました。",
        "primaryTags": {"短編": 3, "読みやすい": 3, "笑える": 2, "日常系": 2},
        "bonusTags": {"明るい": 1, "爽快": 1, "癒やし": 1},
        "excludeTags": ["世界観重視", "深い", "絶望"],
        "sections_template": [
            {"title": "サッと読めて笑える", "prefer_tags": ["笑える", "明るい"], "max": 15},
            {"title": "短い時間でも楽しめる", "prefer_tags": ["短編", "読みやすい"], "max": 15},
            {"title": "気分転換にちょうどいい", "prefer_tags": ["日常系", "癒やし"], "max": 15},
        ],
    },
    {
        "slug": "cafe",
        "scene": "カフェでゆっくり",
        "intro": "カフェの心地よい空間で、じっくり味わいたい作品を。文学的な香りのする作品を中心に選びました。",
        "primaryTags": {"心温まる": 3, "癒やし": 3, "日常系": 2, "優しい": 3, "穏やか": 3, "感動": 2},
        "bonusTags": {"切ない": 1, "考えさせられる": 1, "明るい": 1},
        "excludeTags": ["バトル", "絶望", "怖い", "熱い"],
        "sections_template": [
            {"title": "穏やかに味わう小説", "prefer_tags": ["穏やか", "優しい", "癒やし"], "filter_type": "novel", "max": 15},
            {"title": "カフェで読みたい漫画", "prefer_tags": ["日常系", "心温まる"], "filter_type": "manga", "max": 15},
            {"title": "しっとりと心に染みる作品", "prefer_tags": ["感動", "切ない"], "max": 15},
        ],
    },
    {
        "slug": "stress-relief",
        "scene": "ストレス解消したい",
        "intro": "スカッと発散できる爽快な作品を。読んで気分がすっきりする、ストレス解消にぴったりの作品です。",
        "primaryTags": {"笑える": 3, "爽快": 3, "熱い": 3, "前向き": 2, "やる気が出る": 2, "バトル": 2},
        "bonusTags": {"明るい": 1, "一気読み": 1},
        "excludeTags": ["ダーク", "絶望", "怖い"],
        "sections_template": [
            {"title": "爽快バトル・アクション", "prefer_tags": ["バトル", "爽快", "熱い"], "max": 15},
            {"title": "笑ってストレス発散", "prefer_tags": ["笑える", "明るい"], "max": 15},
            {"title": "前向きになれる作品", "prefer_tags": ["前向き", "やる気が出る"], "max": 15},
        ],
    },
    {
        "slug": "calm-down",
        "scene": "気分を落ち着けたい",
        "intro": "心を穏やかにしてくれる作品を。イライラや不安な気持ちを鎮めてくれる、癒やし系の作品です。",
        "primaryTags": {"癒やし": 3, "優しい": 3, "穏やか": 3, "心温まる": 3, "日常系": 2},
        "bonusTags": {"感動": 1, "泣ける": 1, "切ない": 1},
        "excludeTags": ["バトル", "怖い", "絶望", "ダーク"],
        "sections_template": [
            {"title": "心が落ち着く穏やかな作品", "prefer_tags": ["穏やか", "癒やし", "優しい"], "max": 15},
            {"title": "温かい気持ちになれるもの", "prefer_tags": ["心温まる", "感動"], "max": 15},
            {"title": "ゆったりした日常系", "prefer_tags": ["日常系", "明るい"], "max": 15},
        ],
    },
    {
        "slug": "exciting",
        "scene": "ワクワクしたい",
        "intro": "ドキドキ・ワクワクが止まらない作品を。冒険、ファンタジー、バトル——読み始めたら止まらない。",
        "primaryTags": {"熱い": 3, "爽快": 3, "バトル": 3, "ファンタジー": 2, "やる気が出る": 2, "世界観重視": 2, "一気読み": 2},
        "bonusTags": {"明るい": 1, "前向き": 1, "感動": 1},
        "excludeTags": ["絶望"],
        "sections_template": [
            {"title": "冒険・ファンタジーの世界へ", "prefer_tags": ["ファンタジー", "世界観重視"], "max": 20},
            {"title": "熱いバトルにワクワク", "prefer_tags": ["バトル", "熱い", "爽快"], "max": 20},
            {"title": "止まれない面白さ", "prefer_tags": ["一気読み", "やる気が出る"], "max": 20},
        ],
    },
    {
        "slug": "think-deeply",
        "scene": "考えたい",
        "intro": "読み終わった後も考え続けてしまう作品を。哲学、社会、人間の深淵——思考を刺激する作品です。",
        "primaryTags": {"考えさせられる": 3, "深い": 3, "学べる": 2, "世界観重視": 1, "ダーク": 1},
        "bonusTags": {"感動": 1, "泣ける": 1, "絶望": 1, "切ない": 1},
        "excludeTags": ["笑える"],
        "sections_template": [
            {"title": "深く考えさせられる小説", "prefer_tags": ["考えさせられる", "深い"], "filter_type": "novel", "max": 15},
            {"title": "思考を刺激する漫画", "prefer_tags": ["考えさせられる", "深い"], "filter_type": "manga", "max": 15},
            {"title": "読後に世界観が変わる作品", "prefer_tags": ["学べる", "世界観重視"], "max": 20},
        ],
    },
]


# ── reason生成テンプレート ──────────────────────────────────
# タグの組み合わせに基づいてreason文を生成する
REASON_TEMPLATES = {
    # mood reasons
    "emotional": {
        "感動": [
            "{title}は、読むたびに心の奥に響く感動作。{author}が描く物語に心が震える。",
            "深い感動を味わいたいなら{title}。{type_label}としての完成度が高い一作。",
        ],
        "泣ける": [
            "涙なしでは読めない{title}。{author}の筆致が胸に刺さる。",
            "{title}は泣ける{type_label}の傑作。感情を揺さぶられたい人に。",
        ],
        "切ない": [
            "切なさの余韻が残る{title}。読後もしばらく物語が頭から離れない。",
            "{author}の{title}は、切ない気持ちに浸りたい時にぴったり。",
        ],
        "心温まる": [
            "読んで心が温まる{title}。{author}の優しいまなざしが伝わる{type_label}。",
            "{title}は心温まる物語。穏やかな感動を求める人におすすめ。",
        ],
        "_default": [
            "{title}は感動的な{type_label}。{author}の描く世界に心が動かされる。",
        ],
    },
    "think": {
        "考えさせられる": [
            "{title}は読後に深く考えさせられる{type_label}。{author}の問いかけが重い。",
            "考えることが好きな人に{title}。哲学的なテーマが読み応えあり。",
        ],
        "深い": [
            "深いテーマに切り込む{title}。{author}の作品世界に引き込まれる。",
            "{title}は表面的に読むだけでは勿体ない。何度も読み返したくなる深さ。",
        ],
        "学べる": [
            "{title}は楽しみながら学べる{type_label}。新しい視点が得られる一冊。",
            "知的好奇心を刺激する{title}。{author}の知見が詰まっている。",
        ],
        "_default": [
            "{title}は思考を深めてくれる{type_label}。じっくり読みたい一冊。",
        ],
    },
    "binge": {
        "一気読み": [
            "一度読み始めたら止まれない{title}。{type_label}好きなら必読。",
            "{title}は一気読み必至。{author}のストーリーテリングが圧巻。",
        ],
        "世界観重視": [
            "{title}の世界に入ったら抜け出せない。壮大な物語を一気に駆け抜けたい人に。",
            "世界観に没入して一気に読みたい{title}。{type_label}の醍醐味。",
        ],
        "_default": [
            "続きが気になって止められない{title}。休日にまとめて読みたい{type_label}。",
        ],
    },
    "excited": {
        "熱い": [
            "心が燃える{title}。{author}の描く熱い展開に胸が熱くなる。",
            "{title}は読んでいて気分が上がる{type_label}。熱さを求める人に。",
        ],
        "爽快": [
            "爽快感抜群の{title}。読後にスカッとする{type_label}。",
            "{title}は爽快な読後感が魅力。{author}の作品でテンションを上げたい人に。",
        ],
        "バトル": [
            "手に汗握るバトルが魅力の{title}。{type_label}好きにはたまらない。",
            "{title}のバトルシーンは圧巻。{author}の描写力に脱帽。",
        ],
        "_default": [
            "テンションが上がる{title}。{author}の{type_label}で熱くなりたい人に。",
        ],
    },
    "laugh": {
        "笑える": [
            "声を出して笑ってしまう{title}。{author}のユーモアセンスが光る{type_label}。",
            "{title}は笑いたい時にぴったり。読むだけで気分が明るくなる。",
        ],
        "明るい": [
            "明るい気分になれる{title}。{type_label}として気軽に楽しめる。",
            "{title}は読んでいて楽しい{type_label}。{author}の明るい世界観が魅力。",
        ],
        "日常系": [
            "日常を描いた{title}はクスッと笑えるシーンの連続。{author}の観察眼が光る。",
            "{title}は何気ない日常が面白い。リラックスして読める{type_label}。",
        ],
        "_default": [
            "楽しく読める{title}。笑いを求めるなら{author}の{type_label}がおすすめ。",
        ],
    },
    "dark": {
        "ダーク": [
            "暗く重い{title}の世界に引き込まれる。{author}のダークな作風が光る。",
            "{title}はダークな{type_label}の傑作。覚悟して読みたい一冊。",
        ],
        "怖い": [
            "背筋がゾクッとする{title}。{author}のホラー描写が秀逸。",
            "{title}は怖さの中に深みがある{type_label}。ホラー好きに。",
        ],
        "絶望": [
            "絶望的な展開に目が離せない{title}。{author}の容赦ない筆致が圧巻。",
            "{title}は絶望の中に光を見出す{type_label}。重い物語が好きな人に。",
        ],
        "_default": [
            "ダークな世界観の{title}。{author}の{type_label}で闇に浸りたい人に。",
        ],
    },
    "immerse": {
        "世界観重視": [
            "{title}の世界観は圧倒的。{author}が構築した世界に没入できる{type_label}。",
            "現実を忘れて{title}の世界に浸りたい人に。緻密な世界設定が魅力。",
        ],
        "ファンタジー": [
            "ファンタジーの世界に浸れる{title}。{author}の想像力に驚かされる。",
            "{title}は王道ファンタジーの魅力が詰まった{type_label}。異世界に行きたい人に。",
        ],
        "_default": [
            "独特な世界観の{title}。{author}の{type_label}で別世界を体験。",
        ],
    },
    "easy": {
        "読みやすい": [
            "気軽に手に取れる{title}。{author}の読みやすい文体で、サクサク読める{type_label}。",
            "{title}は肩肘張らず楽しめる{type_label}。疲れた日にもおすすめ。",
        ],
        "明るい": [
            "明るく気軽な{title}。{author}の{type_label}で気分転換を。",
        ],
        "日常系": [
            "ゆるやかな日常を描く{title}。{type_label}として気楽に楽しめる。",
        ],
        "_default": [
            "気軽に楽しめる{title}。{author}の{type_label}でリラックスした読書を。",
        ],
    },
}

# Scene用のreason テンプレート（シーンに応じた表現）
SCENE_REASON_TEMPLATES = {
    "commute": [
        "移動中にサクッと読める{title}。{type_label}として区切りがつけやすい。",
        "通勤時間が楽しくなる{title}。{author}の{type_label}でスキマ時間を有効活用。",
        "電車の中でも集中できる{title}。テンポよく読める{type_label}。",
    ],
    "before-sleep": [
        "就寝前に穏やかな気持ちになれる{title}。{author}の優しい{type_label}。",
        "寝る前のひとときに{title}。心地よい読後感で眠りにつける。",
        "リラックスして読める{title}。寝る前の読書にぴったりの{type_label}。",
    ],
    "holiday-binge": [
        "休日にまとめて読みたい{title}。{author}の{type_label}で贅沢な時間を。",
        "休日の一日を{title}に捧げたい。没入感抜群の{type_label}。",
        "休みの日にどっぷり浸れる{title}。一気読みの快感を味わえる。",
    ],
    "short-break": [
        "短い時間でも楽しめる{title}。区切りよく読める{type_label}。",
        "すきま時間に{title}。{author}の{type_label}でちょっとした気分転換を。",
        "5分あれば楽しめる{title}。忙しい日にもおすすめの{type_label}。",
    ],
    "cafe": [
        "カフェでじっくり味わいたい{title}。{author}の{type_label}と珈琲の相性は抜群。",
        "カフェの静かな空間で読みたい{title}。{type_label}の世界に浸れる。",
        "落ち着いた場所で読みたい{title}。{author}の文体が心地よい。",
    ],
    "stress-relief": [
        "読んでスカッとする{title}。ストレス解消にぴったりの{type_label}。",
        "気分転換に最適な{title}。{author}の{type_label}で嫌なことを忘れる。",
        "ストレスを吹き飛ばす{title}。爽快な展開が気持ちいい{type_label}。",
    ],
    "calm-down": [
        "心が落ち着く{title}。{author}の{type_label}で穏やかな時間を。",
        "気分を整えたい時に{title}。{type_label}の穏やかさに癒される。",
        "不安な気持ちを鎮めてくれる{title}。{author}の優しい世界観。",
    ],
    "exciting": [
        "ワクワクが止まらない{title}。{author}の{type_label}で冒険気分を。",
        "ドキドキする展開の{title}。次の展開が気になって止まれない{type_label}。",
        "わくわくしたい時に{title}。{type_label}としてのエンタメ度が高い。",
    ],
    "think-deeply": [
        "じっくり考えさせられる{title}。{author}の{type_label}で思考を深める。",
        "読後に何度も考え返してしまう{title}。深い問いかけがある{type_label}。",
        "知的好奇心を満たしてくれる{title}。{author}の洞察が光る一冊。",
    ],
}


# ── summaryShort からタグを推論するキーワードマッピング ──
SUMMARY_TAG_KEYWORDS = {
    "感動": ["感動", "泣ける", "涙", "心に響く", "心に染み", "胸を打つ", "胸が熱く", "じんとく"],
    "泣ける": ["泣ける", "涙", "号泣"],
    "切ない": ["切ない", "切なさ", "哀しい", "悲しい", "哀愁", "別れ"],
    "心温まる": ["温かい", "温かさ", "心温まる", "ほっこり", "ほのぼの", "優しい物語"],
    "考えさせられる": ["考えさせ", "哲学", "社会派", "問いかけ", "テーマが深", "テーマが重", "深いテーマ", "問題提起", "理解と共感"],
    "深い": ["深い", "深さ", "奥深い", "重厚", "深淵"],
    "学べる": ["学べる", "学び", "知識", "雑学", "知的好奇心"],
    "一気読み": ["一気読み", "止まらない", "止まれない", "止められない", "次が気になる", "引きが強い", "テンポの良い"],
    "世界観重視": ["世界観", "壮大", "緻密な設定", "独自世界", "スケール"],
    "熱い": ["熱い", "熱く", "燃える", "青春", "情熱", "成長物語", "成長を描"],
    "爽快": ["爽快", "スカッと", "痛快", "気持ちいい"],
    "バトル": ["バトル", "戦い", "戦闘", "アクション", "戦う", "格闘"],
    "やる気が出る": ["やる気", "前向き", "励まされ", "勇気をもら"],
    "前向き": ["前向き", "ポジティブ", "希望"],
    "笑える": ["笑える", "笑い", "コメディ", "ギャグ", "ユーモア", "爆笑", "クスッ", "シュール"],
    "明るい": ["明るい", "楽しい", "楽しめる", "ポップ"],
    "日常系": ["日常", "ゆるい", "ゆったり", "のんびり", "ほのぼの"],
    "怖い": ["ホラー", "恐怖", "怖い", "ゾクッ", "背筋", "サスペンス", "スリラー"],
    "ダーク": ["ダーク", "暗い", "闇", "残酷", "グロ", "陰鬱"],
    "絶望": ["絶望", "救いがない", "容赦ない"],
    "ファンタジー": ["ファンタジー", "異世界", "魔法", "魔術", "魔女", "剣と魔法", "転生"],
    "読みやすい": ["読みやすい", "サクサク", "気軽", "軽い読み口"],
    "短編": ["短編", "1話完結", "オムニバス", "アンソロジー"],
    "癒やし": ["癒やし", "癒し", "癒される", "ほっこり", "心地よい"],
    "優しい": ["優しい", "温かい目線", "丁寧に描"],
    "穏やか": ["穏やか", "のどか", "静か"],
}


def infer_tags_from_summary(work):
    """summaryShort と title からタグを推論"""
    summary = work.get("summaryShort", "")
    title = work.get("title", "")
    text = summary + " " + title

    inferred = set()
    for tag, keywords in SUMMARY_TAG_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                inferred.add(tag)
                break
    return list(inferred)


def load_works():
    """public/data/works/ から全作品データを読み込み、short_id -> work のマップを返す。
    タグ未設定の作品にはsummaryShortからタグを推論して付与する。"""
    works = {}
    inferred_count = 0
    skipped = 0
    for fname in os.listdir(WORK_DIR):
        if fname.endswith(".json"):
            short_id = fname.replace(".json", "")
            # Skip long-format IDs (URL-encoded or containing __)
            if len(short_id) > 14 or "%" in short_id or "__" in short_id:
                skipped += 1
                continue
            with open(os.path.join(WORK_DIR, fname)) as f:
                data = json.load(f)

            # タグ未設定の場合、summaryShortからタグを推論
            existing_tags = data.get("discoveryTags", [])
            if not existing_tags:
                inferred = infer_tags_from_summary(data)
                if inferred:
                    data["discoveryTags"] = inferred
                    data["_tagsInferred"] = True
                    inferred_count += 1

            works[short_id] = data

    print(f"Tag inference: {inferred_count} works got inferred tags from summaryShort")
    print(f"Skipped {skipped} long-format IDs")
    return works


def score_work_for_mood(work, mood_def):
    """ムード定義に対する作品のスコアを計算"""
    tags = set(work.get("discoveryTags", []))
    if not tags:
        return 0
    score = 0
    for tag, weight in mood_def["tags"].items():
        if tag in tags:
            score += weight
    return score


def score_work_for_scene(work, scene_def):
    """シーン定義に対する作品のスコアを計算"""
    tags = set(work.get("discoveryTags", []))
    if not tags:
        return 0

    # Exclude check
    for ex_tag in scene_def.get("excludeTags", []):
        if ex_tag in tags:
            return -1

    score = 0
    for tag, weight in scene_def["primaryTags"].items():
        if tag in tags:
            score += weight
    for tag, weight in scene_def.get("bonusTags", {}).items():
        if tag in tags:
            score += weight

    # discoveryAttributes bonuses
    attrs = work.get("discoveryAttributes", {})
    pace_tags = scene_def.get("paceTags", [])
    if pace_tags and attrs.get("paceTag") in pace_tags:
        score += 1
    depth_tags = scene_def.get("depthTags", [])
    if depth_tags and attrs.get("depthTag") in depth_tags:
        score += 1

    return score


def generate_reason(work, context_key, tag_match=None):
    """テンプレートからreason文を生成"""
    title = work.get("title", "")
    # Truncate very long titles
    if len(title) > 30:
        title = title[:28] + "…"

    author = work.get("authorDisplay", "")
    if " / " in author:
        author = author.split(" / ")[0]
    if len(author) > 15:
        author = author[:13] + "…"

    type_label = "漫画" if work.get("type") == "manga" else "小説"

    templates = None
    if context_key in REASON_TEMPLATES:
        mood_templates = REASON_TEMPLATES[context_key]
        if tag_match and tag_match in mood_templates:
            templates = mood_templates[tag_match]
        else:
            templates = mood_templates.get("_default", [])
    elif context_key in SCENE_REASON_TEMPLATES:
        templates = SCENE_REASON_TEMPLATES[context_key]

    if not templates:
        templates = ["{title}は{type_label}として楽しめる一冊。{author}の作品世界に触れてみて。"]

    template = random.choice(templates)
    return template.format(title=title, author=author, type_label=type_label)


def assign_works_to_sections(scored_works, sections_template, context_key, mood_tags=None):
    """スコア付き作品をセクションに割り当て"""
    used_ids = set()
    sections = []

    for sec_tmpl in sections_template:
        section_items = []
        candidates = []

        for short_id, score, work in scored_works:
            if short_id in used_ids:
                continue
            if score <= 0:
                continue

            # Type filter
            if sec_tmpl.get("filter_type"):
                if work.get("type") != sec_tmpl["filter_type"]:
                    continue

            # Tag preference for scenes
            prefer_tags = sec_tmpl.get("prefer_tags", [])
            bonus = 0
            work_tags = set(work.get("discoveryTags", []))
            for pt in prefer_tags:
                if pt in work_tags:
                    bonus += 1

            candidates.append((short_id, score + bonus, work))

        # Sort by score descending, then by title for stability
        candidates.sort(key=lambda x: (-x[1], x[2].get("title", "")))

        max_items = sec_tmpl.get("max", 10)
        for short_id, sc, work in candidates[:max_items]:
            # Find best matching tag for reason generation
            work_tags = set(work.get("discoveryTags", []))
            best_tag = None
            if mood_tags:
                for tag in mood_tags:
                    if tag in work_tags:
                        best_tag = tag
                        break

            reason = generate_reason(work, context_key, best_tag)
            section_items.append({"workId": short_id, "reason": reason})
            used_ids.add(short_id)

        if section_items:
            sections.append({"title": sec_tmpl["title"], "items": section_items})

    return sections


def generate_discover_curated(works):
    """ムードごとのキュレーションJSONを生成"""
    os.makedirs(DISCOVER_OUT, exist_ok=True)
    total_items = 0

    for mood in MOODS:
        # Score all works for this mood
        scored = []
        for short_id, work in works.items():
            score = score_work_for_mood(work, mood)
            if score > 0:
                scored.append((short_id, score, work))

        scored.sort(key=lambda x: (-x[1], x[2].get("title", "")))

        mood_tags = list(mood["tags"].keys())
        sections = assign_works_to_sections(
            scored, mood["sections_template"], mood["slug"], mood_tags
        )

        item_count = sum(len(s["items"]) for s in sections)
        total_items += item_count

        output = {
            "axis": "mood",
            "slug": mood["slug"],
            "label": mood["label"],
            "icon": mood["icon"],
            "intro": mood["intro"],
            "sections": sections,
            "allCandidatesCount": len(scored),
            "selectedCount": item_count,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

        out_path = os.path.join(DISCOVER_OUT, f"{mood['slug']}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"  mood/{mood['slug']}: {len(scored)} candidates → {item_count} selected")

    print(f"  Discover total: {total_items} items")
    return total_items


def generate_scene_curated(works):
    """シーンごとのキュレーションJSONを生成"""
    os.makedirs(SCENE_OUT, exist_ok=True)
    total_items = 0

    for scene in SCENES:
        # Score all works for this scene
        scored = []
        for short_id, work in works.items():
            score = score_work_for_scene(work, scene)
            if score > 0:
                scored.append((short_id, score, work))

        scored.sort(key=lambda x: (-x[1], x[2].get("title", "")))

        sections = assign_works_to_sections(
            scored, scene["sections_template"], scene["slug"]
        )

        item_count = sum(len(s["items"]) for s in sections)
        total_items += item_count

        output = {
            "scene": scene["scene"],
            "slug": scene["slug"],
            "intro": scene["intro"],
            "sections": sections,
            "allCandidatesCount": len(scored),
            "selectedCount": item_count,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

        out_path = os.path.join(SCENE_OUT, f"{scene['slug']}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"  scene/{scene['slug']}: {len(scored)} candidates → {item_count} selected")

    print(f"  Scene total: {total_items} items")
    return total_items


def main():
    random.seed(42)  # 再現性のため固定シード
    print("Loading works from public/data/works/...")
    works = load_works()
    print(f"Loaded {len(works)} works")

    tagged = sum(1 for w in works.values() if w.get("discoveryTags") and len(w["discoveryTags"]) > 0)
    print(f"Tagged works: {tagged}")

    print("\n=== Generating discover-curated ===")
    discover_total = generate_discover_curated(works)

    print("\n=== Generating scene-curated ===")
    scene_total = generate_scene_curated(works)

    # Count unique works
    all_ids = set()
    for d in [DISCOVER_OUT, SCENE_OUT]:
        for fname in os.listdir(d):
            if fname.endswith(".json"):
                with open(os.path.join(d, fname)) as f:
                    data = json.load(f)
                for section in data.get("sections", []):
                    for item in section.get("items", []):
                        all_ids.add(item["workId"])

    print(f"\n=== Summary ===")
    print(f"Discover items: {discover_total}")
    print(f"Scene items: {scene_total}")
    print(f"Total items: {discover_total + scene_total}")
    print(f"Unique works referenced: {len(all_ids)}")
    print(f"Coverage: {len(all_ids)}/{len(works)} ({100*len(all_ids)//len(works)}%)")


if __name__ == "__main__":
    main()
