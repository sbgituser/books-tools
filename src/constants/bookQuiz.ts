import type { QuizQuestion, QuizResultType } from "@/types/quiz";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "今の気分に一番近いのは？",
    options: [
      {
        id: "excited",
        label: "熱い物語でテンションを上げたい",
        icon: "🔥",
        scores: { hot: 3, refreshing: 2, motivated: 2 },
      },
      {
        id: "emotional",
        label: "思いっきり感動したい",
        icon: "😢",
        scores: { cry: 3, emotional: 3, heartwarming: 1 },
      },
      {
        id: "thinking",
        label: "じっくり考えさせられたい",
        icon: "🧠",
        scores: { thinking: 3, profound: 2, intellectual: 2 },
      },
      {
        id: "relaxing",
        label: "リラックスして気軽に読みたい",
        icon: "😌",
        scores: { easy: 3, healing: 3, calm: 2 },
      },
    ],
  },
  {
    id: "q2",
    question: "読書に使える時間は？",
    options: [
      {
        id: "short",
        label: "すきま時間（10〜15分）",
        icon: "⏱️",
        scores: { short: 3, easy: 2 },
      },
      {
        id: "medium",
        label: "1〜2時間くらい",
        icon: "☕",
        scores: { binge: 2, gentle: 2 },
      },
      {
        id: "binge",
        label: "休日に一気読みしたい",
        icon: "📚",
        scores: { binge: 3, immersive: 3 },
      },
      {
        id: "night",
        label: "寝る前に少しずつ",
        icon: "🌙",
        scores: { calm: 3, gentle: 3, healing: 1 },
      },
    ],
  },
  {
    id: "q3",
    question: "好きな作品の雰囲気は？",
    options: [
      {
        id: "bright",
        label: "明るくポジティブ",
        icon: "✨",
        scores: { bright: 3, positive: 3, refreshing: 2 },
      },
      {
        id: "dark",
        label: "ダークで重厚",
        icon: "🌑",
        scores: { dark: 3, profound: 3, hopeless: 1 },
      },
      {
        id: "calm",
        label: "静かで穏やか",
        icon: "🌿",
        scores: { calm: 3, gentle: 3, healing: 2 },
      },
      {
        id: "tense",
        label: "スリルとサスペンス",
        icon: "⚡",
        scores: { tense: 3, scary: 2, extraordinary: 2 },
      },
    ],
  },
  {
    id: "q4",
    question: "主人公に求めるものは？",
    options: [
      {
        id: "strong",
        label: "逆境に立ち向かう強さ",
        icon: "💪",
        scores: { hot: 3, motivated: 3 },
      },
      {
        id: "complex",
        label: "複雑な内面と成長",
        icon: "🎭",
        scores: { thinking: 2, profound: 3 },
      },
      {
        id: "funny",
        label: "笑いと個性的なキャラ",
        icon: "😄",
        scores: { funny: 3, positive: 2 },
      },
      {
        id: "sensitive",
        label: "繊細な感情と人間関係",
        icon: "💕",
        scores: { emotional: 2, heartwarming: 3, gentle: 2 },
      },
    ],
  },
  {
    id: "q5",
    question: "読みたいのは？",
    options: [
      {
        id: "novel",
        label: "小説（文章で想像を楽しむ）",
        icon: "📖",
        scores: { type_novel: 3 },
      },
      {
        id: "manga",
        label: "漫画（ビジュアルで楽しむ）",
        icon: "📕",
        scores: { type_manga: 3 },
      },
      {
        id: "either",
        label: "どちらでも",
        icon: "📚",
        scores: { type_novel: 1, type_manga: 1 },
      },
    ],
  },
];

export const QUIZ_RESULT_TYPES: QuizResultType[] = [
  {
    id: "battle-fan",
    title: "熱血バトル愛好家",
    description:
      "熱い展開と仲間との絆、主人公の成長物語が大好き！燃えるバトルシーンと諦めない精神に心を打たれるあなたは、読むたびにエネルギーをもらえる作品との相性抜群です。",
    icon: "🔥",
    accentColor: "rose",
    primaryTags: ["hot", "motivated", "refreshing"],
    recommendedMoods: ["excited"],
    recommendedScenes: ["stress-relief", "exciting"],
    recommendedWorks: [
      {
        title: "鬼滅の刃",
        author: "吾峠呼世晴",
        reason: "家族への愛と仲間との絆、圧倒的な熱量のバトル描写があなたを熱くさせる",
        amazonKeyword: "鬼滅の刃 吾峠呼世晴",
      },
      {
        title: "僕のヒーローアカデミア",
        author: "堀越耕平",
        reason: "「個性」を持つヒーローたちの成長と熱い戦いが、あなたのモチベーションを高める",
        amazonKeyword: "僕のヒーローアカデミア 堀越耕平",
      },
      {
        title: "ハイキュー!!",
        author: "古舘春一",
        reason: "チームの絆と個人の成長、スポーツの熱量が完璧に描かれた傑作",
        amazonKeyword: "ハイキュー 古舘春一",
      },
      {
        title: "キングダム",
        author: "原泰久",
        reason: "中国古代史を舞台にした壮大な熱血物語、リーダーシップと友情の物語",
        amazonKeyword: "キングダム 原泰久",
      },
      {
        title: "オーバーロード",
        author: "丸山くがね",
        reason: "最強主人公が異世界を制覇する爽快感、戦略と迫力の物語",
        amazonKeyword: "オーバーロード 丸山くがね",
      },
    ],
    shareText: "私の読書タイプは「熱血バトル愛好家」でした！燃える展開と成長物語が大好きなあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "emotion-hunter",
    title: "感動ストーリーハンター",
    description:
      "涙なしには読めない物語を求めて、感動的な作品を探し続けるあなた。人間の心の機微を丁寧に描いた物語に深く共鳴し、読了後に豊かな余韻を感じられる作品があなたの宝物です。",
    icon: "😢",
    accentColor: "blue",
    primaryTags: ["cry", "emotional", "heartwarming"],
    recommendedMoods: ["emotional"],
    recommendedScenes: ["before-sleep", "cafe"],
    recommendedWorks: [
      {
        title: "君の膵臓をたべたい",
        author: "住野よる",
        reason: "命の儚さと青春の輝きが胸に突き刺さる、あなたの涙腺を揺さぶる傑作",
        amazonKeyword: "君の膵臓をたべたい 住野よる",
      },
      {
        title: "一リットルの涙",
        author: "木藤亜也",
        reason: "実話ベースの感動物語、生きることへの強さと家族の愛",
        amazonKeyword: "一リットルの涙 木藤亜也",
      },
      {
        title: "夏目友人帳",
        author: "緑川ゆき",
        reason: "妖怪と人間の心温まる交流、静かで深い感動があなたの心に響く",
        amazonKeyword: "夏目友人帳 緑川ゆき",
      },
      {
        title: "orange",
        author: "高野苺",
        reason: "未来からの手紙と青春の後悔、胸が締め付けられる感動の物語",
        amazonKeyword: "orange 高野苺",
      },
      {
        title: "西の魔女が死んだ",
        author: "梨木香歩",
        reason: "祖母と孫の短い夏の記憶、じんわりと心に染みる永遠の名作",
        amazonKeyword: "西の魔女が死んだ 梨木香歩",
      },
    ],
    shareText: "私の読書タイプは「感動ストーリーハンター」でした！涙なしには読めない物語を求めているあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "intellectual-seeker",
    title: "知的探求者",
    description:
      "読後も頭から離れない深いテーマ、複雑な伏線、哲学的な問いかけが大好きなあなた。考察するほど面白い作品や、読者に思考を促す骨太な物語との相性が抜群です。",
    icon: "🧠",
    accentColor: "violet",
    primaryTags: ["thinking", "profound", "intellectual"],
    recommendedMoods: ["think"],
    recommendedScenes: ["think-deeply", "cafe"],
    recommendedWorks: [
      {
        title: "ソクラテスの弁明",
        author: "プラトン",
        reason: "哲学の原点、「無知の知」という問いがあなたの知的好奇心を刺激する",
        amazonKeyword: "ソクラテスの弁明 プラトン",
      },
      {
        title: "銃・病原菌・鉄",
        author: "ジャレド・ダイアモンド",
        reason: "人類史の謎を解き明かす壮大な知的冒険、あなたの世界観を広げる",
        amazonKeyword: "銃病原菌鉄 ジャレドダイアモンド",
      },
      {
        title: "ハーモニー",
        author: "伊藤計劃",
        reason: "SF的設定で人間の意識と社会を深く問いかける、考察しがいのある傑作",
        amazonKeyword: "ハーモニー 伊藤計劃",
      },
      {
        title: "容疑者Xの献身",
        author: "東野圭吾",
        reason: "完璧な論理の裏に隠された人間の真実、読後に深く考えさせられる",
        amazonKeyword: "容疑者Xの献身 東野圭吾",
      },
      {
        title: "嫌われる勇気",
        author: "岸見一郎・古賀史健",
        reason: "アドラー心理学を対話形式で展開、自分の思考を根本から問い直す",
        amazonKeyword: "嫌われる勇気 岸見一郎",
      },
    ],
    shareText: "私の読書タイプは「知的探求者」でした！考えさせられる深い物語が大好きなあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "healing-reader",
    title: "癒し系読書家",
    description:
      "穏やかな世界観に浸り、心をほっこりさせてくれる作品が至福のあなた。日常の温かみや人の優しさを丁寧に描いた物語に癒され、読後に心が満たされる体験を求めています。",
    icon: "😌",
    accentColor: "green",
    primaryTags: ["healing", "gentle", "calm"],
    recommendedMoods: ["easy"],
    recommendedScenes: ["before-sleep", "calm-down"],
    recommendedWorks: [
      {
        title: "よつばと！",
        author: "あずまきよひこ",
        reason: "子供の目線で見る日常の発見と喜び、読むだけで心が温かくなる",
        amazonKeyword: "よつばと あずまきよひこ",
      },
      {
        title: "ゆるキャン△",
        author: "あfろ",
        reason: "ソロキャンプの癒やしと仲間との温かい交流、のんびり読める至福の一冊",
        amazonKeyword: "ゆるキャン あfろ",
      },
      {
        title: "小さなおうち",
        author: "中島京子",
        reason: "昭和の日常を丁寧に描いた温かな物語、ゆっくり読みたい大人の小説",
        amazonKeyword: "小さなおうち 中島京子",
      },
      {
        title: "からかい上手の高木さん",
        author: "山本崇一朗",
        reason: "ほのぼのとした恋愛と日常のじれったさが癒やしになる青春漫画",
        amazonKeyword: "からかい上手の高木さん",
      },
      {
        title: "銀の匙",
        author: "荒川弘",
        reason: "農業高校の日常と成長、食への感謝と人の温かさが詰まった名作",
        amazonKeyword: "銀の匙 荒川弘",
      },
    ],
    shareText: "私の読書タイプは「癒し系読書家」でした！穏やかな世界観に浸れる作品が大好きなあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "dark-explorer",
    title: "ダークファンタジー探検家",
    description:
      "重厚で暗い世界観、絶望の中に光を見出す物語に魅了されるあなた。単純な勧善懲悪では終わらない複雑な道徳観や、人間の闇を描いた作品に深い充実感を覚えます。",
    icon: "🌑",
    accentColor: "gray",
    primaryTags: ["dark", "profound", "hopeless"],
    recommendedMoods: ["dark"],
    recommendedScenes: ["think-deeply"],
    recommendedWorks: [
      {
        title: "進撃の巨人",
        author: "諫山創",
        reason: "絶望と希望が交差する世界、衝撃的な真実と人間の本性を描いた傑作",
        amazonKeyword: "進撃の巨人 諫山創",
      },
      {
        title: "ベルセルク",
        author: "三浦建太郎",
        reason: "圧倒的な画力と深い世界観、絶望の淵でも立ち続ける主人公の物語",
        amazonKeyword: "ベルセルク 三浦建太郎",
      },
      {
        title: "1984年",
        author: "ジョージ・オーウェル",
        reason: "全体主義の恐怖を描いた古典的ディストピア小説、現代にも通じる闇",
        amazonKeyword: "1984年 オーウェル",
      },
      {
        title: "寄生獣",
        author: "岩明均",
        reason: "人間とは何かを問いかけるダークSF、命と共存を深く考えさせられる",
        amazonKeyword: "寄生獣 岩明均",
      },
      {
        title: "虐殺器官",
        author: "伊藤計劃",
        reason: "近未来の暗い世界で描かれる虐殺と人間の意志、SFダークの傑作",
        amazonKeyword: "虐殺器官 伊藤計劃",
      },
    ],
    shareText: "私の読書タイプは「ダークファンタジー探検家」でした！重厚な世界観に魅了されるあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "suspense-addict",
    title: "サスペンス中毒",
    description:
      "ページを捲る手が止まらない、先が気になってたまらない作品が大好きなあなた。予想外の展開、謎解き、心理戦に夢中になり、読み終わるまで止められない読書体験を求めています。",
    icon: "⚡",
    accentColor: "amber",
    primaryTags: ["tense", "scary", "extraordinary"],
    recommendedMoods: ["binge"],
    recommendedScenes: ["holiday-binge", "exciting"],
    recommendedWorks: [
      {
        title: "殺人鬼フジコの衝動",
        author: "真梨幸子",
        reason: "衝撃的な展開が続くイヤミスの傑作、読み始めたら止まれない",
        amazonKeyword: "殺人鬼フジコの衝動 真梨幸子",
      },
      {
        title: "告白",
        author: "湊かなえ",
        reason: "複数視点で描かれる復讐の物語、真実が明かされるたびに震える",
        amazonKeyword: "告白 湊かなえ",
      },
      {
        title: "デスノート",
        author: "大場つぐみ・小畑健",
        reason: "天才同士の頭脳戦、先が読めない展開が続く究極のサスペンス漫画",
        amazonKeyword: "デスノート 大場つぐみ",
      },
      {
        title: "イニシエーション・ラブ",
        author: "乾くるみ",
        reason: "最後の2行で全てが変わる、騙されることで楽しめる仕掛け小説",
        amazonKeyword: "イニシエーションラブ 乾くるみ",
      },
      {
        title: "MONSTER",
        author: "浦沢直樹",
        reason: "謎の怪物を追う医師の旅、緊張感が続く圧倒的なサスペンス漫画",
        amazonKeyword: "MONSTER 浦沢直樹",
      },
    ],
    shareText: "私の読書タイプは「サスペンス中毒」でした！止まれないスリルを求めるあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "romance-master",
    title: "恋愛小説マイスター",
    description:
      "繊細な感情描写と恋愛の機微に心打たれるあなた。片想いのときめき、すれ違いのもどかしさ、成就したときの喜びを一緒に体験できる物語との相性が最高です。",
    icon: "💕",
    accentColor: "pink",
    primaryTags: ["heartwarming", "emotional", "gentle"],
    recommendedMoods: ["emotional"],
    recommendedScenes: ["before-sleep", "cafe"],
    recommendedWorks: [
      {
        title: "ハチミツとクローバー",
        author: "羽海野チカ",
        reason: "美大生たちの青春と恋愛、繊細な感情描写と笑いのバランスが絶妙",
        amazonKeyword: "ハチミツとクローバー 羽海野チカ",
      },
      {
        title: "センセイの鞄",
        author: "川上弘美",
        reason: "年の差の静かな恋愛、大人の恋の始まりをじっくり味わえる",
        amazonKeyword: "センセイの鞄 川上弘美",
      },
      {
        title: "四月は君の嘘",
        author: "新川直司",
        reason: "音楽と恋愛が交わる青春物語、切ない感動があなたの涙を誘う",
        amazonKeyword: "四月は君の嘘 新川直司",
      },
      {
        title: "スキップとローファー",
        author: "高松美咲",
        reason: "ほのぼのとした青春恋愛、主人公の純粋さが心を温かくする",
        amazonKeyword: "スキップとローファー 高松美咲",
      },
      {
        title: "コーヒーが冷めないうちに",
        author: "川口俊和",
        reason: "時間をテーマにした切ない恋愛と別れ、涙と温かさが共存する物語",
        amazonKeyword: "コーヒーが冷めないうちに 川口俊和",
      },
    ],
    shareText: "私の読書タイプは「恋愛小説マイスター」でした！繊細な感情描写が大好きなあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "marathon-reader",
    title: "一気読みマラソンランナー",
    description:
      "長編シリーズを制覇する喜びを知っているあなた。世界観が広がるほど没入感が高まり、キャラクターの成長を長期間追い続けることに特別な満足感を覚えます。",
    icon: "📚",
    accentColor: "teal",
    primaryTags: ["binge", "immersive"],
    recommendedMoods: ["binge", "immerse"],
    recommendedScenes: ["holiday-binge"],
    recommendedWorks: [
      {
        title: "鋼の錬金術師",
        author: "荒川弘",
        reason: "完璧な構成と感動のフィナーレ、一気読みで真価を発揮する完結名作",
        amazonKeyword: "鋼の錬金術師 荒川弘",
      },
      {
        title: "ナルニア国物語",
        author: "C.S.ルイス",
        reason: "7冊の壮大なファンタジー、読み進めるごとに世界が広がる古典",
        amazonKeyword: "ナルニア国物語 C.S.ルイス",
      },
      {
        title: "マスカレード・ホテル",
        author: "東野圭吾",
        reason: "シリーズが続く高品質なミステリー、読み終わったら次が気になる",
        amazonKeyword: "マスカレードホテル 東野圭吾",
      },
      {
        title: "ワンピース",
        author: "尾田栄一郎",
        reason: "100巻超えの壮大な冒険、完走したときの達成感は他に類を見ない",
        amazonKeyword: "ワンピース 尾田栄一郎",
      },
      {
        title: "銀河英雄伝説",
        author: "田中芳樹",
        reason: "宇宙戦争と政治が交差する大河SF、長編を読み切る喜びを味わえる",
        amazonKeyword: "銀河英雄伝説 田中芳樹",
      },
    ],
    shareText: "私の読書タイプは「一気読みマラソンランナー」でした！長編シリーズを制覇するのが好きなあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "gap-time-master",
    title: "すきま時間の達人",
    description:
      "短い時間でも濃密な読書体験ができる作品の使い手。サクッと読めるのに内容が濃い作品や、どこからでも読める短編集との相性が抜群。移動中も待ち時間も読書タイムにしてしまいます。",
    icon: "⏱️",
    accentColor: "orange",
    primaryTags: ["short", "easy"],
    recommendedMoods: ["easy"],
    recommendedScenes: ["commute", "short-break"],
    recommendedWorks: [
      {
        title: "ショートショートの広場",
        author: "星新一",
        reason: "数ページで完結する傑作SF短編、すきま時間にぴったりの名作集",
        amazonKeyword: "星新一 ショートショート",
      },
      {
        title: "夜は短し歩けよ乙女",
        author: "森見登美彦",
        reason: "連作短編形式で読みやすく、テンポよく進む楽しい物語",
        amazonKeyword: "夜は短し歩けよ乙女 森見登美彦",
      },
      {
        title: "SPY×FAMILY",
        author: "遠藤達哉",
        reason: "1話完結のエピソードが多く、どこからでも楽しめるスパイコメディ",
        amazonKeyword: "SPYxFAMILY 遠藤達哉",
      },
      {
        title: "ダンジョン飯",
        author: "九井諒子",
        reason: "章ごとに料理と冒険が完結、軽いノリで楽しめる独創的ファンタジー",
        amazonKeyword: "ダンジョン飯 九井諒子",
      },
      {
        title: "檸檬",
        author: "梶井基次郎",
        reason: "短い短編集ながら文学的充実度が高い、すきま時間に最高の文学体験",
        amazonKeyword: "檸檬 梶井基次郎",
      },
    ],
    shareText: "私の読書タイプは「すきま時間の達人」でした！短い時間でも濃密に楽しめる本が好きなあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "comedy-fan",
    title: "コメディ愛好家",
    description:
      "笑える物語で気分をリフレッシュするのが一番のあなた。ユーモアとセンスが光るキャラクター、クスッと笑える場面、思わず声を出して笑ってしまうシーンがある作品が大好きです。",
    icon: "😄",
    accentColor: "yellow",
    primaryTags: ["funny", "positive", "bright"],
    recommendedMoods: ["laugh"],
    recommendedScenes: ["stress-relief", "commute"],
    recommendedWorks: [
      {
        title: "ゴールデンカムイ",
        author: "野田サトル",
        reason: "笑いと感動とシリアスが絶妙にブレンドされた、ギャグが最高の冒険漫画",
        amazonKeyword: "ゴールデンカムイ 野田サトル",
      },
      {
        title: "銀魂",
        author: "空知英秋",
        reason: "パロディとギャグが満載、笑いながらいつの間にか感動させられる",
        amazonKeyword: "銀魂 空知英秋",
      },
      {
        title: "あの日見た花の名前を僕達はまだ知らない。",
        author: "岡田麿里",
        reason: "笑いと涙が共存する青春物語、コメディパートが心の準備をしてくれる",
        amazonKeyword: "あの花 岡田麿里",
      },
      {
        title: "チェーザレ 破壊の創造者",
        author: "惣領冬実",
        reason: "歴史的人物の意外な笑いと知性が融合、学びと笑いが両立する傑作",
        amazonKeyword: "チェーザレ 惣領冬実",
      },
      {
        title: "三国志演義",
        author: "羅貫中",
        reason: "英雄たちの人間臭さと笑える場面、長大な歴史物語の中の面白さ",
        amazonKeyword: "三国志演義 羅貫中",
      },
    ],
    shareText: "私の読書タイプは「コメディ愛好家」でした！笑える物語でリフレッシュするのが好きなあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "world-builder",
    title: "ワールドビルダー",
    description:
      "壮大な世界観に没入したいあなた。独自の地理、歴史、魔法体系、文化が丁寧に構築された世界を探索する喜びが読書の醍醐味。フィクションの世界に完全に迷い込むことが最高の体験です。",
    icon: "🌍",
    accentColor: "indigo",
    primaryTags: ["immersive", "extraordinary"],
    recommendedMoods: ["immerse"],
    recommendedScenes: ["holiday-binge", "exciting"],
    recommendedWorks: [
      {
        title: "指輪物語",
        author: "J.R.R.トールキン",
        reason: "世界観構築の金字塔、独自の言語まで作り上げた究極のファンタジー",
        amazonKeyword: "指輪物語 トールキン",
      },
      {
        title: "まおゆう魔王勇者",
        author: "橙乃ままれ",
        reason: "魔王と勇者の異世界経済戦争、緻密な世界設定に圧倒される",
        amazonKeyword: "まおゆう魔王勇者",
      },
      {
        title: "ダンジョン飯",
        author: "九井諒子",
        reason: "食文化まで設定した緻密なファンタジー世界、探索する楽しさ満載",
        amazonKeyword: "ダンジョン飯 九井諒子",
      },
      {
        title: "氷と炎の歌（ゲーム・オブ・スローンズ原作）",
        author: "ジョージ・R・R・マーティン",
        reason: "複雑な政治と広大な世界、どこまでも広がる究極のファンタジー大河",
        amazonKeyword: "氷と炎の歌 マーティン",
      },
      {
        title: "魔法使いの弟子",
        author: "田中芳樹",
        reason: "歴史と魔法が融合した独自世界観、深く掘り下げられた文化設定",
        amazonKeyword: "魔法使いの弟子 田中芳樹",
      },
    ],
    shareText: "私の読書タイプは「ワールドビルダー」でした！壮大な世界観に没入したいあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
  {
    id: "literature-seeker",
    title: "文学探求者",
    description:
      "文章の美しさと深いテーマを味わうことに喜びを感じるあなた。一文一文に込められた意味、作家の独特の文体、時代を超えたテーマを持つ作品との出会いが人生を豊かにします。",
    icon: "📖",
    accentColor: "stone",
    primaryTags: ["profound", "thinking", "type_novel"],
    recommendedMoods: ["think"],
    recommendedScenes: ["cafe", "think-deeply"],
    recommendedWorks: [
      {
        title: "雪国",
        author: "川端康成",
        reason: "「国境の長いトンネルを抜けると雪国であった」美しき文体の頂点",
        amazonKeyword: "雪国 川端康成",
      },
      {
        title: "人間失格",
        author: "太宰治",
        reason: "人間の本質と孤独を描いた日本文学の問題作、深く考えさせられる",
        amazonKeyword: "人間失格 太宰治",
      },
      {
        title: "ノルウェイの森",
        author: "村上春樹",
        reason: "喪失と再生、村上春樹の磨き抜かれた文体で描く青春の記憶",
        amazonKeyword: "ノルウェイの森 村上春樹",
      },
      {
        title: "羅生門・鼻",
        author: "芥川龍之介",
        reason: "短編の中に凝縮された人間の本性、文学的完成度の高い古典",
        amazonKeyword: "羅生門 芥川龍之介",
      },
      {
        title: "砂の女",
        author: "安部公房",
        reason: "不条理の中で描かれる実存、哲学的な問いが文体に宿る傑作",
        amazonKeyword: "砂の女 安部公房",
      },
    ],
    shareText: "私の読書タイプは「文学探求者」でした！文章の美しさと深いテーマを愛するあなたにぴったりの本を診断 #おすすめ本診断 #BookDiscover",
  },
];

/**
 * スコア合計から最も一致する結果タイプを返す
 */
export function calcQuizResult(scores: Record<string, number>): QuizResultType {
  let bestType = QUIZ_RESULT_TYPES[0];
  let bestScore = -1;

  for (const resultType of QUIZ_RESULT_TYPES) {
    const score = resultType.primaryTags.reduce(
      (sum, tag) => sum + (scores[tag] ?? 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestType = resultType;
    }
  }

  return bestType;
}
