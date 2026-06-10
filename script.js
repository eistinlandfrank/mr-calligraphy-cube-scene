const SCENES = [
  {
    title: "进入系统 / 沉浸准备",
    image: "assets/scenes/scene-01.png",
    description: "进入 MR 书法教练主界面，确认学习路径、当前任务和实时反馈。",
    focus: "系统首页把学习路径、单字练习、实时反馈和历史记录集中在同一空间。",
    metrics: [
      ["综合评分", "86分"],
      ["结构", "88"],
      ["笔画", "85"],
      ["笔法", "87"],
      ["流畅度", "89"]
    ],
    actions: [
      { label: "查看笔画分析", response: "已展开结构评分：重点关注“永”字重心、横画长度与转折力度。" },
      { label: "进入临摹训练", target: 3, response: "切换到空间临摹与实时引导。" },
      { label: "打开历史记录", target: 5, response: "跳转到学习记录和成长轨迹。" }
    ],
    points: [
      {
        label: "AI 书法教练",
        pitch: 2,
        yaw: 0,
        body: "中心面板显示当前单字“永”的结构评分，并拆出结构、笔画、笔法、力度、流畅度等维度。",
        tags: ["单字学习", "结构评分", "笔画分析"]
      },
      {
        label: "学习路径",
        pitch: 0,
        yaw: -38,
        body: "左侧路径用于组织学习阶段：碑帖讲解、笔画练习、结构训练、章法学习和创作实践。",
        tags: ["阶段导航", "进度锁定", "任务流"]
      },
      {
        label: "实时反馈",
        pitch: 3,
        yaw: 36,
        body: "右侧反馈将书写轨迹和历史记录放在同一区域，便于复盘刚刚完成的练习。",
        tags: ["书写轨迹", "即时建议", "历史趋势"]
      }
    ]
  },
  {
    title: "选择碑帖 / AI讲解",
    image: "assets/scenes/scene-02.png",
    description: "选择日课字、碑帖或练习任务，系统同步显示学习数据与成就状态。",
    focus: "这一屏像学习入口：先确定今日练习，再进入讲解、临摹或创作。",
    metrics: [
      ["学习时长", "0分钟"],
      ["完成字数", "0个"],
      ["实践次数", "0次"],
      ["连续学习", "0天"]
    ],
    actions: [
      { label: "选择日课字", response: "已选中“永”作为今日单字，适合练习永字八法。" },
      { label: "进入 AI 讲解", target: 2, response: "切换到碑帖讲解场景。" },
      { label: "查看成就", response: "成就徽章会在完成练习、复盘和分享后逐步解锁。" }
    ],
    points: [
      {
        label: "日课字",
        pitch: 5,
        yaw: -2,
        body: "中心卡片展示今日学习目标，当前识别为“永”字，用作后续讲解和训练的主线。",
        tags: ["今日任务", "永字", "目标确认"]
      },
      {
        label: "学习路径",
        pitch: 2,
        yaw: -35,
        body: "左侧列出单字学习、集字练习、结构训练、章法学习和创作实践，已完成项带有勾选状态。",
        tags: ["路径", "勾选", "解锁"]
      },
      {
        label: "学习数据",
        pitch: 4,
        yaw: 35,
        body: "右侧统计学习时长、完成字数、实践次数和连续学习天数，适合作为个人学习仪表盘。",
        tags: ["数据", "成就", "习惯"]
      }
    ]
  },
  {
    title: "选择碑帖 / AI讲解",
    image: "assets/scenes/scene-03.png",
    description: "通过碑帖选择、教师讲解和 AI 要点，理解“永”字的来源与方法。",
    focus: "画面包含碑帖列表、讲解视频、AI 讲解卡和永字八法清单。",
    metrics: [
      ["讲解进度", "0%"],
      ["当前字", "永"],
      ["学习法", "永字八法"],
      ["讲解模式", "AI + 教师"]
    ],
    actions: [
      { label: "播放讲解", response: "将按讲解步骤推进，并保存当前进度。" },
      { label: "切换碑帖", response: "碑帖列表可切换不同范本，当前保持“永”字讲解。" },
      { label: "开始临摹", target: 3, response: "进入空间临摹与实时引导。" }
    ],
    points: [
      {
        label: "碑帖列表",
        pitch: 1,
        yaw: -42,
        body: "左侧可在多个碑帖或范字之间切换；系统会同步替换范字、讲解内容和练习目标。",
        tags: ["碑帖选择", "范字", "目录"]
      },
      {
        label: "AI 讲解",
        pitch: 6,
        yaw: 31,
        body: "AI 讲解区域将字源、结构、笔法要点拆成短句，适合在临写前快速理解。",
        tags: ["讲解", "结构", "笔法"]
      },
      {
        label: "永字八法",
        pitch: 1,
        yaw: 54,
        body: "右侧清单包含侧、勒、努、趯、策、掠、啄、磔，用于把“永”字拆成基本笔法。",
        tags: ["八法", "清单", "基础笔法"]
      }
    ]
  },
  {
    title: "空间临摹 / 实时引导",
    image: "assets/scenes/scene-04.png",
    description: "在临摹过程中接收笔画方向、长度和力度提醒，并实时查看评分。",
    focus: "这一屏把范字、临摹模式、当前笔画和综合评分组合成训练工作台。",
    metrics: [
      ["综合评分", "86分"],
      ["结构", "88"],
      ["笔画", "85"],
      ["笔法", "87"],
      ["力度", "84"]
    ],
    actions: [
      { label: "示范模式", response: "已切换为示范：先观察范字路径和笔画顺序。" },
      { label: "对比模式", response: "已切换为对比：会把你的笔迹与范字重叠观察。" },
      { label: "进入笔画拆解", target: 4, response: "切换到笔画拆解和细节学习。" }
    ],
    points: [
      {
        label: "实时引导",
        pitch: 4,
        yaw: 27,
        body: "系统提示横画平稳、起笔微顿，并提醒控制横画长度，反馈更接近练习中的“教练”。",
        tags: ["起笔", "长度", "实时建议"]
      },
      {
        label: "当前笔画",
        pitch: -2,
        yaw: 28,
        body: "当前笔画被识别为横，面板显示起笔到收笔的方向和速度变化。",
        tags: ["横画", "轨迹", "节奏"]
      },
      {
        label: "综合评分",
        pitch: 2,
        yaw: 45,
        body: "评分面板把结构、笔画、笔法、力度、流畅度拆开，方便定位薄弱环节。",
        tags: ["评分", "维度", "复盘"]
      }
    ]
  },
  {
    title: "笔画拆解 / 细节学习",
    image: "assets/scenes/scene-05.png",
    description: "选择单个笔画，查看起笔、行笔、收笔和结构作用。",
    focus: "当前展示“竖”画拆解：它是“永”字中居中求稳的主骨。",
    metrics: [
      ["当前笔画", "竖"],
      ["进度", "3/8"],
      ["起笔", "轻入纸"],
      ["行笔", "垂直向下"],
      ["收笔", "稍顿回锋"]
    ],
    actions: [
      { label: "上一个笔画", response: "已切换到上一个笔画，可继续观察笔势变化。" },
      { label: "下一个笔画", response: "已切换到下一个笔画，建议对比收笔方式。" },
      { label: "进入创作", target: 5, response: "完成拆解后进入作品生成。" }
    ],
    points: [
      {
        label: "笔画选择",
        pitch: 1,
        yaw: -40,
        body: "左侧列出点、横、竖、撇、捺、钩、提、折，当前高亮“竖”。",
        tags: ["八法", "笔画库", "逐项学习"]
      },
      {
        label: "运笔轨迹",
        pitch: 0,
        yaw: 24,
        body: "中右侧轨迹把竖画的运动方向单独呈现，便于观察中锋与垂直度。",
        tags: ["轨迹", "中锋", "垂直"]
      },
      {
        label: "结构提示",
        pitch: 0,
        yaw: 43,
        body: "竖画在“永”字中为主骨，居中求稳，支撑整体结构。",
        tags: ["主骨", "重心", "结构稳定"]
      }
    ]
  },
  {
    title: "创作实践 / 作品生成",
    image: "assets/scenes/scene-06.png",
    description: "选择创作工具与字体风格，生成、保存并评价个人作品。",
    focus: "这一屏从练习转向创作：工具、风格、作品信息和学习建议都已结构化。",
    metrics: [
      ["作品名称", "永字创作"],
      ["风格", "楷书"],
      ["用笔", "中锋为主"],
      ["尺寸", "四尺三开"],
      ["综合评分", "92分"]
    ],
    actions: [
      { label: "切换行书", response: "已切换到行书风格，保存作品时会写入本机作品记录。" },
      { label: "保存作品", response: "作品已加入作品集，可在复盘与分享环节调用。" },
      { label: "查看学习记录", target: 6, response: "跳转到成长轨迹。" }
    ],
    points: [
      {
        label: "创作工具",
        pitch: 2,
        yaw: -40,
        body: "毛笔、硬笔、水墨、纸张、印章、落款构成创作工具组，可模拟不同创作状态。",
        tags: ["工具", "纸张", "落款"]
      },
      {
        label: "作品预览",
        pitch: 4,
        yaw: -2,
        body: "中心区域展示作品预览，并提供楷书、行书、草书、隶书等风格切换。",
        tags: ["预览", "风格", "生成"]
      },
      {
        label: "学习建议",
        pitch: 2,
        yaw: 43,
        body: "建议聚焦重心稳定、中锋行笔、章法经营和气韵连贯，形成下一轮练习目标。",
        tags: ["建议", "92分", "下一步"]
      }
    ]
  },
  {
    title: "学习记录 / 成长轨迹",
    image: "assets/scenes/scene-07.png",
    description: "查看练习时长、练习字数、掌握进度和最近学习记录。",
    focus: "这是一张学习仪表盘，用数据说明长期练习如何积累。",
    metrics: [
      ["学习时长", "24.5小时"],
      ["练习汉字", "256字"],
      ["掌握字帖", "12篇"],
      ["本周进度", "85%"],
      ["掌握进度", "25.6%"]
    ],
    actions: [
      { label: "筛选优秀记录", response: "已筛选：永 92、和 88、礼 90 适合作为复盘样本。" },
      { label: "导出学习报告", target: 8, response: "跳转到综合评价与学习报告。" },
      { label: "查看作品", target: 7, response: "进入复盘总结与作品分享。" }
    ],
    points: [
      {
        label: "数据总览",
        pitch: 4,
        yaw: -32,
        body: "24.5 小时、256 字、12 篇字帖三项数据共同描述学习投入。",
        tags: ["时长", "练习量", "字帖"]
      },
      {
        label: "学习曲线",
        pitch: 6,
        yaw: 0,
        body: "进度曲线从 05.10 到 06.07 持续上升，本周进度达到 85%。",
        tags: ["曲线", "进度", "趋势"]
      },
      {
        label: "最近记录",
        pitch: 3,
        yaw: 33,
        body: "最近练习包括“永、和、中、礼”，每条记录带时间、综合评分和等级。",
        tags: ["记录", "评分", "复盘入口"]
      }
    ]
  },
  {
    title: "复盘总结 / 分享成果",
    image: "assets/scenes/scene-08.png",
    description: "复盘作品、汇总笔画得失，并生成可保存或分享的成果。",
    focus: "复盘层把八个笔画逐条总结，同时给出成长曲线和分享入口。",
    metrics: [
      ["作品", "永字小楷练习"],
      ["创作时间", "2024.05.20"],
      ["满意度", "4星"],
      ["综合进步", "+36%"]
    ],
    actions: [
      { label: "再写一遍", target: 3, response: "回到临摹场景，带着复盘结论再练一次。" },
      { label: "生成视频", response: "将根据真实书写笔迹导出 WebM 回放视频。" },
      { label: "保存作品", response: "作品已保存到作品集，可继续分享或导出。" }
    ],
    points: [
      {
        label: "书写总结",
        pitch: 4,
        yaw: -3,
        body: "总结涵盖点、横、竖、撇、捺、钩、提、折，突出起笔、行笔和收笔表现。",
        tags: ["八法复盘", "逐笔总结", "改进点"]
      },
      {
        label: "成长轨迹",
        pitch: 2,
        yaw: 25,
        body: "成长曲线显示综合进步率 +36%，说明练习反馈已经转化为可见提升。",
        tags: ["曲线", "+36%", "趋势"]
      },
      {
        label: "分享作品",
        pitch: 2,
        yaw: 43,
        body: "分享卡可保存作品，也可扩展成微信、社群或课堂展示入口。",
        tags: ["分享", "保存", "成果"]
      }
    ]
  },
  {
    title: "综合评价 / 学习报告",
    image: "assets/scenes/scene-09.png",
    description: "汇总学习数据、能力雷达和综合评分，形成学习报告。",
    focus: "报告层把学习投入、能力结构和排名反馈组合成最终评价。",
    metrics: [
      ["学习时长", "27.6小时"],
      ["练习字数", "1286字"],
      ["掌握汉字", "68个"],
      ["字帖作品", "12幅"],
      ["连续学习", "18天"]
    ],
    actions: [
      { label: "继续学习", target: 3, response: "回到临摹训练，继续补齐薄弱项。" },
      { label: "制定计划", response: "建议下一阶段重点练结构稳定、章法呼应和创作完整度。" },
      { label: "导出报告", response: "将根据本机练习、作品和报告记录导出学习报告。" }
    ],
    points: [
      {
        label: "学习数据",
        pitch: 4,
        yaw: -34,
        body: "左侧统计 27.6 小时、1286 字、68 个掌握汉字、12 幅作品和 18 天连续学习。",
        tags: ["投入", "数量", "连续学习"]
      },
      {
        label: "能力雷达",
        pitch: 6,
        yaw: 0,
        body: "雷达图包含结构、笔画、章法、创作、笔法等维度，用于定位长板和短板。",
        tags: ["雷达图", "能力维度", "诊断"]
      },
      {
        label: "综合评分",
        pitch: 5,
        yaw: 30,
        body: "当前综合评分 86 分，超过 92% 学习者，建议继续保持并补强章法。",
        tags: ["86分", "排名", "建议"]
      }
    ]
  },
  {
    title: "学习总结 / 复习巩固",
    image: "assets/scenes/scene-10.png",
    description: "对比学习前后作品，确认进步并进入复习巩固。",
    focus: "这一屏展示学习前后对比、综合评分和返回首页/复习入口。",
    metrics: [
      ["复习单字", "8个"],
      ["结构学习", "8项结构"],
      ["作品创作", "3幅作品"],
      ["实践练习", "18次"],
      ["学习时长", "27.6小时"]
    ],
    actions: [
      { label: "查看详情", response: "学习前后对比显示笔画更稳、结构更聚、整体完成度更高。" },
      { label: "复习巩固", target: 4, response: "回到笔画拆解，针对薄弱笔画进行专项复习。" },
      { label: "返回首页", target: 0, response: "回到 MR 书法教练首页。" }
    ],
    points: [
      {
        label: "内容回顾",
        pitch: 4,
        yaw: -34,
        body: "左侧回顾复习单字、结构学习、作品创作、实践练习和总学习时长。",
        tags: ["回顾", "学习量", "复习"]
      },
      {
        label: "进步对比",
        pitch: 5,
        yaw: 0,
        body: "中心对比学习前与学习后的“永”字，强调“进步明显，继续保持”。",
        tags: ["前后对比", "作品变化", "保持"]
      },
      {
        label: "综合评分",
        pitch: 5,
        yaw: 31,
        body: "总结评分 92 分，超过 95% 学习者，适合作为本轮学习的收束页。",
        tags: ["92分", "95%", "总结"]
      }
    ]
  }
];

const WRAP_STEPS = false;
const IS_FILE_MODE = window.location.protocol === "file:";
const ROOM_STORAGE_KEY = "mr-calligraphy-room-config-v3-wood";
const MAIN_SCENE_STORAGE_KEY = "mr-calligraphy-main-scene-layout-v1";
const MAIN_SCENE_PUBLISHED_KEY = "mr-calligraphy-main-scene-published-v1";
const MAIN_IMPORT_DB_NAME = "mr-calligraphy-main-model-store";
const MAIN_IMPORT_DB_STORE = "models";
const MAIN_SCENE_MAX_UNDO = 256;
const IS_MAIN_SCENE_ADMIN = document.body.classList.contains("main-admin-page");
const FACE_LABELS = {
  front: "前墙",
  back: "后墙",
  left: "左墙",
  right: "右墙",
  ceiling: "天花",
  floor: "地面"
};
const DEFAULT_ROOM_CONFIG = {
  textures: {
    front: "assets/cube/wall-wood-front.png",
    back: "assets/cube/wall-wood-back.png",
    left: "assets/cube/wall-wood-left.png",
    right: "assets/cube/wall-wood-right.png",
    ceiling: "assets/cube/ceiling.png",
    floor: "assets/cube/floor.png"
  },
  roles: []
};
const LEGACY_WALL_TEXTURES = {
  front: "assets/cube/wall-front.png",
  back: "assets/cube/wall-back.png",
  left: "assets/cube/wall-left.png",
  right: "assets/cube/wall-right.png"
};
const EXTERNAL_ROOM_MODELS = [
  {
    id: "front-doorway",
    src: "assets/models/poly-pizza-cc0/japanese-door-quaternius.glb",
    position: [0, -3.1, -7.92],
    rotationY: 0,
    scale: 118,
    tint: [0.62, 0.38, 0.2]
  },
  {
    id: "left-window",
    src: "assets/models/kenney-furniture-kit/wallWindow.glb",
    position: [-5.15, -1.75, -7.9],
    rotationY: 0,
    scale: 2.45,
    tint: [0.62, 0.42, 0.26]
  },
  {
    id: "right-window",
    src: "assets/models/kenney-furniture-kit/wallWindow.glb",
    position: [5.15, -1.75, -7.9],
    rotationY: 0,
    scale: 2.45,
    tint: [0.62, 0.42, 0.26]
  },
  {
    id: "left-bookcase",
    src: "assets/models/poly-pizza-cc0/bookshelf-creative-trio.glb",
    position: [-7.25, -3.12, -4.4],
    rotationY: 90,
    scale: 380,
    tint: [0.58, 0.36, 0.2]
  },
  {
    id: "right-bookcase",
    src: "assets/models/poly-pizza-cc0/bookshelf-creative-trio.glb",
    position: [7.25, -3.12, -3.05],
    rotationY: -90,
    scale: 380,
    tint: [0.56, 0.34, 0.19]
  },
  {
    id: "main-writing-table",
    src: "assets/models/poly-pizza-cc0/table-creative-trio.glb",
    position: [0, -3.12, -3.45],
    rotationY: 0,
    scale: 410,
    tint: [0.58, 0.35, 0.18]
  },
  {
    id: "left-chair",
    src: "assets/models/kenney-furniture-kit/chair.glb",
    position: [-3.25, -3.12, -2.4],
    rotationY: 24,
    scale: 3.3,
    tint: [0.48, 0.28, 0.15]
  },
  {
    id: "right-chair",
    src: "assets/models/kenney-furniture-kit/chair.glb",
    position: [3.25, -3.12, -2.4],
    rotationY: -24,
    scale: 3.3,
    tint: [0.48, 0.28, 0.15]
  },
  {
    id: "woven-rug",
    src: "assets/models/kenney-furniture-kit/rugRectangle.glb",
    position: [0, -3.09, -3.2],
    rotationY: 0,
    scale: 4.15,
    tint: [0.46, 0.34, 0.24]
  },
  {
    id: "side-cabinet",
    src: "assets/models/kenney-furniture-kit/sideTableDrawers.glb",
    position: [6.15, -3.12, 0.6],
    rotationY: -90,
    scale: 3.15,
    tint: [0.52, 0.31, 0.17]
  },
  {
    id: "desk-books",
    src: "assets/models/kenney-furniture-kit/books.glb",
    position: [-1.4, -1.4, -3.0],
    rotationY: 12,
    scale: 4.1,
    tint: [0.74, 0.56, 0.38]
  },
  {
    id: "front-left-potted-plant",
    src: "assets/models/poly-pizza-kenney-decor/potted-plant-kenney.glb",
    position: [-6.65, -3.12, -7.3],
    rotationY: 18,
    scale: 2.6,
    tint: [0.88, 1.05, 0.82]
  },
  {
    id: "right-corner-potted-plant",
    src: "assets/models/poly-pizza-kenney-decor/potted-plant-kenney.glb",
    position: [7.15, -3.12, 5.4],
    rotationY: -58,
    scale: 2.35,
    tint: [0.84, 1.02, 0.78]
  },
  {
    id: "desk-small-plant",
    src: "assets/models/poly-pizza-kenney-decor/plant-small-kenney.glb",
    position: [1.74, -1.38, -3.74],
    rotationY: -24,
    scale: 1.36,
    tint: [0.78, 1.1, 0.7]
  },
  {
    id: "front-left-wall-lamp",
    src: "assets/models/poly-pizza-kenney-decor/lamp-wall-kenney.glb",
    position: [-6.9, -0.25, -7.88],
    rotationY: 0,
    scale: 2.1,
    tint: [1.08, 0.84, 0.54]
  },
  {
    id: "front-right-wall-lamp",
    src: "assets/models/poly-pizza-kenney-decor/lamp-wall-kenney.glb",
    position: [6.9, -0.25, -7.88],
    rotationY: 0,
    scale: 2.1,
    tint: [1.08, 0.84, 0.54]
  },
  {
    id: "side-table-lamp",
    src: "assets/models/poly-pizza-kenney-decor/lamp-square-table-kenney.glb",
    position: [6.1, -1.75, 0.64],
    rotationY: -90,
    scale: 2.45,
    tint: [1.0, 0.82, 0.58]
  },
  {
    id: "left-coat-rack",
    src: "assets/models/poly-pizza-kenney-decor/coat-rack-standing-kenney.glb",
    position: [-7.35, -3.12, 4.7],
    rotationY: 88,
    scale: 2.4,
    tint: [0.58, 0.36, 0.2]
  },
  {
    id: "tea-corner-round-rug",
    src: "assets/models/poly-pizza-kenney-decor/rug-round-kenney.glb",
    position: [4.75, -3.08, 5.1],
    rotationY: -12,
    scale: 3.35,
    tint: [0.52, 0.34, 0.24]
  }
];
const MAIN_MODEL_LABELS = {
  "front-doorway": "正面门廊",
  "left-window": "左侧窗户",
  "right-window": "右侧窗户",
  "left-bookcase": "左侧书架",
  "right-bookcase": "右侧书架",
  "main-writing-table": "主写字桌",
  "left-chair": "左侧椅子",
  "right-chair": "右侧椅子",
  "woven-rug": "地面织毯",
  "side-cabinet": "右侧边柜",
  "desk-books": "桌面书本",
  "front-left-potted-plant": "前左盆栽",
  "right-corner-potted-plant": "右后盆栽",
  "desk-small-plant": "桌面小植物",
  "front-left-wall-lamp": "前左壁灯",
  "front-right-wall-lamp": "前右壁灯",
  "side-table-lamp": "边桌台灯",
  "left-coat-rack": "左侧衣帽架",
  "tea-corner-round-rug": "茶席圆毯"
};
const MAIN_DECOR_OBJECTS = [
  {
    id: "desktop-paper",
    label: "桌面宣纸",
    position: [0, -1.44, -3.42],
    draw: (vertices) => addBox(vertices, 0, 0, 0, 1.95, 0.04, 1.32, [0.84, 0.78, 0.64])
  },
  {
    id: "desktop-inkstone",
    label: "桌面砚台",
    position: [-1.38, -1.38, -3.25],
    draw: (vertices) => addBox(vertices, 0, 0, 0, 0.52, 0.14, 0.38, [0.03, 0.025, 0.02])
  },
  {
    id: "desktop-gold-brush",
    label: "桌面金色毛笔",
    position: [1.18, -1.36, -3.25],
    draw: (vertices) => addBox(vertices, 0, 0, 0, 1.12, 0.055, 0.07, [0.86, 0.6, 0.22])
  },
  {
    id: "desktop-red-brush",
    label: "桌面红色毛笔",
    position: [1.02, -1.34, -3.62],
    draw: (vertices) => addBox(vertices, 0, 0, 0, 1, 0.05, 0.065, [0.68, 0.22, 0.1])
  },
  {
    id: "front-left-scroll",
    label: "前墙左卷轴",
    position: [-4.85, 1.05, -7.74],
    draw: (vertices) => addWallScroll(vertices, "front", 0, 0, 0, 0.52, 2.05, [0.68, 0.58, 0.4])
  },
  {
    id: "front-right-scroll",
    label: "前墙右卷轴",
    position: [4.85, 1.05, -7.74],
    draw: (vertices) => addWallScroll(vertices, "front", 0, 0, 0, 0.52, 2.05, [0.68, 0.58, 0.4])
  },
  {
    id: "back-left-scroll",
    label: "后墙左卷轴",
    position: [-4.2, 0.84, 7.72],
    rotation: [0, 180, 0],
    draw: (vertices) => addWallScroll(vertices, "front", 0, 0, 0, 0.82, 1.86, [0.78, 0.69, 0.52])
  },
  {
    id: "back-right-scroll",
    label: "后墙右卷轴",
    position: [4.2, 0.84, 7.72],
    rotation: [0, 180, 0],
    draw: (vertices) => addWallScroll(vertices, "front", 0, 0, 0, 0.82, 1.86, [0.78, 0.69, 0.52])
  },
  {
    id: "left-wall-scroll",
    label: "左墙卷轴",
    position: [-7.72, 0.82, 2.45],
    draw: (vertices) => addWallScroll(vertices, "left", 0, 0, 0, 0.78, 1.74, [0.8, 0.72, 0.55])
  },
  {
    id: "right-wall-scroll",
    label: "右墙卷轴",
    position: [7.72, 0.82, 2.2],
    draw: (vertices) => addWallScroll(vertices, "right", 0, 0, 0, 0.78, 1.74, [0.8, 0.72, 0.55])
  },
  {
    id: "brush-rack",
    label: "笔架",
    position: [-2.72, -1.08, -3.05],
    draw: (vertices) => addBrushRack(vertices, 0, 0, 0)
  },
  {
    id: "ink-set",
    label: "墨具",
    position: [-1.42, -1.28, -3.1],
    draw: (vertices) => addInkSet(vertices, 0, 0, 0)
  },
  {
    id: "desktop-ceramic-jar",
    label: "桌面瓷罐",
    position: [2.52, -1.18, -3.82],
    draw: (vertices) => addCeramicJar(vertices, 0, 0, 0, 0.28, [0.23, 0.37, 0.34])
  },
  {
    id: "floor-ceramic-jar",
    label: "地面陶罐",
    position: [-6.92, -2.38, 5.72],
    draw: (vertices) => addCeramicJar(vertices, 0, 0, 0, 0.34, [0.34, 0.27, 0.2])
  },
  {
    id: "low-display-stand",
    label: "低展示架",
    position: [-6.9, -2.72, 5.72],
    draw: (vertices) => addLowDisplayStand(vertices, 0, 0, 0)
  },
  {
    id: "ceiling-beam-front",
    label: "前侧横梁",
    position: [0, 5.02, -4.8],
    draw: (vertices) => addBox(vertices, 0, 0, 0, 16, 0.18, 0.24, [0.38, 0.18, 0.07])
  },
  {
    id: "ceiling-beam-middle",
    label: "中部横梁",
    position: [0, 5.02, -0.8],
    draw: (vertices) => addBox(vertices, 0, 0, 0, 16, 0.18, 0.24, [0.38, 0.18, 0.07])
  },
  {
    id: "ceiling-beam-back",
    label: "后侧横梁",
    position: [0, 5.02, 3.2],
    draw: (vertices) => addBox(vertices, 0, 0, 0, 16, 0.18, 0.24, [0.38, 0.18, 0.07])
  }
];
let mainSceneLayout = loadMainSceneLayout();
let roomConfig = normalizeRoomConfig(loadStoredRoomConfig() || window.MR_ROOM_CONFIG);
const textureSourceNames = {};

const els = {
  cubeViewport: document.getElementById("cubeViewport"),
  roomCanvas: document.getElementById("roomCanvas"),
  cubeScene: document.getElementById("cubeScene"),
  cssRoleLayer: document.getElementById("cssRoleLayer"),
  textureControls: document.getElementById("textureControls"),
  textureModeLabel: document.getElementById("textureModeLabel"),
  roleControls: document.getElementById("roleControls"),
  roleCountLabel: document.getElementById("roleCountLabel"),
  saveRoomConfig: document.getElementById("saveRoomConfig"),
  resetRoomConfig: document.getElementById("resetRoomConfig"),
  roleEditor: document.getElementById("roleEditor"),
  roleNameInput: document.getElementById("roleNameInput"),
  roleTypeInput: document.getElementById("roleTypeInput"),
  roleColorInput: document.getElementById("roleColorInput"),
  roleScaleInput: document.getElementById("roleScaleInput"),
  roleXInput: document.getElementById("roleXInput"),
  roleYInput: document.getElementById("roleYInput"),
  roleZInput: document.getElementById("roleZInput"),
  roleYawInput: document.getElementById("roleYawInput"),
  rolePitchInput: document.getElementById("rolePitchInput"),
  roleViewScaleInput: document.getElementById("roleViewScaleInput"),
  roleDescriptionInput: document.getElementById("roleDescriptionInput"),
  newRoleButton: document.getElementById("newRoleButton"),
  saveRoleButton: document.getElementById("saveRoleButton"),
  deleteRoleButton: document.getElementById("deleteRoleButton"),
  infoPanel: document.getElementById("infoPanel"),
  infoPanelHandle: document.getElementById("infoPanelHandle"),
  modeButtons: Array.from(document.querySelectorAll("[data-learning-mode]")),
  learningStateSummary: document.getElementById("learningStateSummary"),
  lecturePanel: document.getElementById("lecturePanel"),
  lectureTitle: document.getElementById("lectureTitle"),
  lectureStatusLabel: document.getElementById("lectureStatusLabel"),
  lectureProgressFill: document.getElementById("lectureProgressFill"),
  lectureBody: document.getElementById("lectureBody"),
  lectureStepList: document.getElementById("lectureStepList"),
  glyphValue: document.getElementById("practiceGlyphGuide"),
  practiceCanvas: document.getElementById("practiceCanvas"),
  practiceUndo: document.getElementById("practiceUndo"),
  practiceClear: document.getElementById("practiceClear"),
  practiceReplay: document.getElementById("practiceReplay"),
  practiceCanvasStatus: document.getElementById("practiceCanvasStatus"),
  reviewPanel: document.getElementById("reviewPanel"),
  reviewTitle: document.getElementById("reviewTitle"),
  reviewStatus: document.getElementById("reviewStatus"),
  reviewArtworkImage: document.getElementById("reviewArtworkImage"),
  reviewEmpty: document.getElementById("reviewEmpty"),
  reviewScore: document.getElementById("reviewScore"),
  reviewStrokeCount: document.getElementById("reviewStrokeCount"),
  reviewPointCount: document.getElementById("reviewPointCount"),
  reviewFeedback: document.getElementById("reviewFeedback"),
  reviewReplay: document.getElementById("reviewReplay"),
  reviewDownloadImage: document.getElementById("reviewDownloadImage"),
  reviewDownloadReport: document.getElementById("reviewDownloadReport"),
  historyPanel: document.getElementById("historyPanel"),
  historySummary: document.getElementById("historySummary"),
  historyDownloadArchive: document.getElementById("historyDownloadArchive"),
  historyFilterButtons: Array.from(document.querySelectorAll("[data-history-filter]")),
  historyTrend: document.getElementById("historyTrend"),
  historyList: document.getElementById("historyList"),
  historyDetail: document.getElementById("historyDetail"),
  historyDetailType: document.getElementById("historyDetailType"),
  historyDetailTitle: document.getElementById("historyDetailTitle"),
  historyDetailBody: document.getElementById("historyDetailBody"),
  historyDetailClose: document.getElementById("historyDetailClose"),
  historyDetailRename: document.getElementById("historyDetailRename"),
  historyDetailReplay: document.getElementById("historyDetailReplay"),
  historyDetailDownloadImage: document.getElementById("historyDetailDownloadImage"),
  historyDetailDownloadReport: document.getElementById("historyDetailDownloadReport"),
  historyDetailDelete: document.getElementById("historyDetailDelete"),
  planPanel: document.getElementById("planPanel"),
  planTitle: document.getElementById("planTitle"),
  planProgressLabel: document.getElementById("planProgressLabel"),
  planProgressFill: document.getElementById("planProgressFill"),
  planSummary: document.getElementById("planSummary"),
  planItemList: document.getElementById("planItemList"),
  stepLabel: document.getElementById("stepLabel"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneDescription: document.getElementById("sceneDescription"),
  stepNav: document.getElementById("stepNav"),
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  noticeState: document.getElementById("noticeState"),
  sceneFocus: document.getElementById("sceneFocus"),
  contentTitle: document.getElementById("contentTitle"),
  contentBody: document.getElementById("contentBody"),
  contentTags: document.getElementById("contentTags"),
  metricGrid: document.getElementById("metricGrid"),
  pointList: document.getElementById("pointList"),
  actionList: document.getElementById("actionList"),
  actionFeedback: document.getElementById("actionFeedback"),
  coachScore: document.getElementById("coachScore"),
  insightScore: document.getElementById("insightScore"),
  pathProgress: document.getElementById("pathProgress"),
  pathProgressBar: document.getElementById("pathProgressBar"),
  pathList: document.getElementById("pathList"),
  quickPrev: document.getElementById("quickPrev"),
  quickHome: document.getElementById("quickHome"),
  quickModels: document.getElementById("quickModels"),
  quickNext: document.getElementById("quickNext"),
  mainObjectSelect: document.getElementById("mainObjectSelect"),
  mainObjectType: document.getElementById("mainObjectType"),
  mainObjectStatus: document.getElementById("mainObjectStatus"),
  mainObjectX: document.getElementById("mainObjectX"),
  mainObjectY: document.getElementById("mainObjectY"),
  mainObjectZ: document.getElementById("mainObjectZ"),
  mainObjectRotX: document.getElementById("mainObjectRotX"),
  mainObjectRotY: document.getElementById("mainObjectRotY"),
  mainObjectRotZ: document.getElementById("mainObjectRotZ"),
  mainObjectScale: document.getElementById("mainObjectScale"),
  mainObjectUndo: document.getElementById("mainObjectUndo"),
  mainObjectReset: document.getElementById("mainObjectReset"),
  mainObjectDelete: document.getElementById("mainObjectDelete"),
  mainObjectRestore: document.getElementById("mainObjectRestore"),
  mainObjectSave: document.getElementById("mainObjectSave"),
  mainObjectResetAll: document.getElementById("mainObjectResetAll")
};

let currentIndex = 0;
let activePointIndex = 0;
let cubeYaw = 0;
let cubePitch = -7;
let cubeScale = 1;
let roomRenderer = null;
let activeRoleId = null;
let activeMainObjectId = null;
let mainImportDbPromise = null;
let activeHistoryFilter = "all";
let activeHistoryDetailId = null;
let isReplayVideoExporting = false;
let lecturePlaybackTimer = null;
const LECTURE_PLAYBACK_STEP_MS = 1200;
const mainSceneUndoStack = [];

document.addEventListener("DOMContentLoaded", init);

function loadMainSceneLayout() {
  try {
    return normalizeMainSceneLayout(readMainSceneLayoutSource());
  } catch (error) {
    console.warn("无法读取主场景物体布局", error);
    return normalizeMainSceneLayout(null);
  }
}

function readMainSceneLayoutSource() {
  const params = new URLSearchParams(window.location.search);
  const isDraftPreview = params.get("mainScenePreview") === "draft";
  const draft = readStoredJson(MAIN_SCENE_STORAGE_KEY);

  if (isDraftPreview) {
    window.MR_MAIN_SCENE_SOURCE = "draft-preview";
    return draft;
  }

  const published = readStoredJson(MAIN_SCENE_PUBLISHED_KEY);
  if (published?.layout) {
    window.MR_MAIN_SCENE_SOURCE = "published";
    window.MR_MAIN_SCENE_PUBLISHED_AT = published.publishedAt || "";
    return published.layout;
  }

  window.MR_MAIN_SCENE_SOURCE = "draft-fallback";
  return draft;
}

function readStoredJson(key) {
  const raw = window.localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

function normalizeMainSceneLayout(layout) {
  return {
    objects: layout && typeof layout.objects === "object" && layout.objects
      ? { ...layout.objects }
      : {},
    customObjects: layout && Array.isArray(layout.customObjects)
      ? layout.customObjects.map(normalizeMainCustomObject)
      : [],
    importedModels: layout && Array.isArray(layout.importedModels)
      ? layout.importedModels.map(normalizeMainImportedModel)
      : [],
    lighting: layout && typeof layout.lighting === "object" && layout.lighting
      ? { ...layout.lighting }
      : undefined
  };
}

function normalizeMainCustomObject(record = {}, index = 0) {
  const type = ["box", "cylinder", "plane"].includes(record.type) ? record.type : "box";
  const fallbackSize = type === "cylinder"
    ? { radius: 0.38, height: 0.9 }
    : type === "plane"
      ? { width: 1.4, height: 0.08, depth: 0.9 }
      : { width: 0.8, height: 0.8, depth: 0.8 };
  const position = Array.isArray(record.position) ? record.position : [0, -1.05, -3.2];
  const rotation = Array.isArray(record.rotation) ? record.rotation : [0, 0, 0];

  return {
    id: String(record.id || `custom-${index + 1}`),
    label: String(record.label || `新增物体 ${index + 1}`),
    type,
    color: /^#[0-9a-f]{6}$/i.test(String(record.color || "")) ? record.color : "#8b5a2b",
    size: {
      ...fallbackSize,
      ...(record.size || {})
    },
    position: [
      readMainNumber(position[0], 0),
      readMainNumber(position[1], -1.05),
      readMainNumber(position[2], -3.2)
    ],
    rotation: [
      readMainNumber(rotation[0], 0),
      readMainNumber(rotation[1], 0),
      readMainNumber(rotation[2], 0)
    ],
    scale: readMainNumber(record.scale, 1)
  };
}

function normalizeMainImportedModel(record = {}, index = 0) {
  const fileName = String(record.fileName || "model.glb");
  const type = record.type === "obj" || record.type === "glb"
    ? record.type
    : getMainImportFileType(fileName) || "glb";
  const position = Array.isArray(record.position) ? record.position : [0, -1.05, -3.2];
  const rotation = Array.isArray(record.rotation) ? record.rotation : [0, 0, 0];
  const baseScale = Number(record.baseScale);

  return {
    id: String(record.id || `imported-${index + 1}`),
    dbKey: String(record.dbKey || record.id || `imported-${index + 1}`),
    label: String(record.label || stripMainModelExtension(fileName) || `Imported model ${index + 1}`),
    fileName,
    type,
    position: [
      readMainNumber(position[0], 0),
      readMainNumber(position[1], -1.05),
      readMainNumber(position[2], -3.2)
    ],
    rotation: [
      readMainNumber(rotation[0], 0),
      readMainNumber(rotation[1], 0),
      readMainNumber(rotation[2], 0)
    ],
    scale: readMainNumber(record.scale, 1),
    baseScale: Number.isFinite(baseScale) && baseScale > 0 ? baseScale : 1
  };
}

function getMainImportFileType(fileName) {
  const match = String(fileName || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];

  return extension === "glb" || extension === "obj" ? extension : "";
}

function stripMainModelExtension(fileName) {
  return String(fileName || "").replace(/\.(glb|obj)$/i, "");
}

function saveMainSceneLayoutToStorage() {
  try {
    window.localStorage.setItem(MAIN_SCENE_STORAGE_KEY, JSON.stringify(mainSceneLayout));
  } catch (error) {
    console.warn("无法保存主场景物体布局", error);
  }
}

function getMainSceneObjectDefaults() {
  return [
    ...EXTERNAL_ROOM_MODELS.map((spec) => ({
      id: spec.id,
      type: "model",
      label: MAIN_MODEL_LABELS[spec.id] || spec.id,
      x: spec.position[0],
      y: spec.position[1],
      z: spec.position[2],
      rx: Number(spec.rotationX || 0),
      ry: Number(spec.rotationY || 0),
      rz: Number(spec.rotationZ || 0),
      scale: Number(spec.scale || 1)
    })),
    ...MAIN_DECOR_OBJECTS.map((spec) => {
      const rotation = spec.rotation || [0, 0, 0];

      return {
        id: spec.id,
        type: "decor",
        label: spec.label,
        x: spec.position[0],
        y: spec.position[1],
        z: spec.position[2],
        rx: Number(rotation[0] || 0),
        ry: Number(rotation[1] || 0),
        rz: Number(rotation[2] || 0),
        scale: Number(spec.scale || 1)
      };
    }),
    ...mainSceneLayout.importedModels.map((spec, index) => {
      const rotation = spec.rotation || [0, 0, 0];

      return {
        id: spec.id,
        type: "imported",
        label: spec.label || `Imported model ${index + 1}`,
        x: spec.position[0],
        y: spec.position[1],
        z: spec.position[2],
        rx: Number(rotation[0] || 0),
        ry: Number(rotation[1] || 0),
        rz: Number(rotation[2] || 0),
        scale: Number(spec.scale || 1)
      };
    })
  ];
}

function getMainSceneObjectDefault(id) {
  return getMainSceneObjectDefaults().find((item) => item.id === id) || null;
}

function readMainNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function getMainSceneObjectState(defaultObject) {
  const saved = mainSceneLayout.objects[defaultObject.id] || {};

  return {
    ...defaultObject,
    x: readMainNumber(saved.x, defaultObject.x),
    y: readMainNumber(saved.y, defaultObject.y),
    z: readMainNumber(saved.z, defaultObject.z),
    rx: readMainNumber(saved.rx, defaultObject.rx),
    ry: readMainNumber(saved.ry, defaultObject.ry),
    rz: readMainNumber(saved.rz, defaultObject.rz),
    scale: readMainNumber(saved.scale, defaultObject.scale),
    deleted: saved.deleted === true,
    hidden: saved.hidden === true,
    locked: saved.locked === true
  };
}

function getMainSceneObjectStateById(id) {
  const defaultObject = getMainSceneObjectDefault(id);

  return defaultObject ? getMainSceneObjectState(defaultObject) : null;
}

function getRenderableMainModelSpecs() {
  const builtInModels = EXTERNAL_ROOM_MODELS.map((spec) => {
    const state = getMainSceneObjectStateById(spec.id);

    return {
      ...spec,
      position: [state.x, state.y, state.z],
      rotationX: state.rx,
      rotationY: state.ry,
      rotationZ: state.rz,
      scale: state.scale,
      deleted: state.deleted,
      hidden: state.hidden
    };
  }).filter((spec) => !spec.deleted && !spec.hidden);

  return [
    ...builtInModels,
    ...getRenderableImportedModelSpecs()
  ];
}

function getRenderableImportedModelSpecs() {
  return mainSceneLayout.importedModels.map((record) => {
    const state = getMainSceneObjectStateById(record.id);

    if (!state || state.deleted || state.hidden) {
      return null;
    }

    return {
      id: record.id,
      dbKey: record.dbKey,
      fileName: record.fileName,
      type: record.type,
      position: [state.x, state.y, state.z],
      rotationX: state.rx,
      rotationY: state.ry,
      rotationZ: state.rz,
      scale: state.scale * readMainNumber(record.baseScale, 1),
      tint: [1, 1, 1],
      color: record.color || "#c8b08a"
    };
  }).filter(Boolean);
}

function isMainModelObject(id) {
  return EXTERNAL_ROOM_MODELS.some((spec) => spec.id === id) ||
    mainSceneLayout.importedModels.some((spec) => spec.id === id);
}

function getMainLayoutEntry(id) {
  const entry = mainSceneLayout.objects[id];

  return entry ? { ...entry } : null;
}

function pushMainSceneUndo(id) {
  if (!IS_MAIN_SCENE_ADMIN || !id) {
    return;
  }

  mainSceneUndoStack.push({
    id,
    entry: getMainLayoutEntry(id)
  });

  if (mainSceneUndoStack.length > MAIN_SCENE_MAX_UNDO) {
    mainSceneUndoStack.shift();
  }
}

function undoMainSceneChange() {
  const snapshot = mainSceneUndoStack.pop();

  if (!snapshot) {
    return;
  }

  if (snapshot.entry) {
    mainSceneLayout.objects[snapshot.id] = snapshot.entry;
  } else {
    delete mainSceneLayout.objects[snapshot.id];
  }

  saveMainSceneLayoutToStorage();
  syncMainSceneLayout(snapshot.id);
  selectMainSceneObject(snapshot.id);
}

function setMainSceneObjectState(id, patch, options = {}) {
  const current = getMainSceneObjectStateById(id);

  if (!current) {
    return null;
  }

  if (options.recordUndo !== false) {
    pushMainSceneUndo(id);
  }

  const next = {
    x: readMainNumber(patch.x, current.x),
    y: readMainNumber(patch.y, current.y),
    z: readMainNumber(patch.z, current.z),
    rx: readMainNumber(patch.rx, current.rx),
    ry: readMainNumber(patch.ry, current.ry),
    rz: readMainNumber(patch.rz, current.rz),
    scale: readMainNumber(patch.scale, current.scale),
    deleted: patch.deleted === undefined ? current.deleted : patch.deleted === true,
    hidden: patch.hidden === undefined ? current.hidden : patch.hidden === true,
    locked: patch.locked === undefined ? current.locked : patch.locked === true
  };

  mainSceneLayout.objects[id] = next;
  saveMainSceneLayoutToStorage();
  syncMainSceneLayout(id);

  return getMainSceneObjectStateById(id);
}

function resetMainSceneObject(id) {
  if (!getMainSceneObjectDefault(id)) {
    return;
  }

  pushMainSceneUndo(id);
  delete mainSceneLayout.objects[id];
  saveMainSceneLayoutToStorage();
  syncMainSceneLayout(id);
  selectMainSceneObject(id);
}

function resetAllMainSceneObjects() {
  const selectedId = activeMainObjectId;

  mainSceneUndoStack.length = 0;
  mainSceneLayout = normalizeMainSceneLayout(null);
  saveMainSceneLayoutToStorage();
  syncMainSceneLayout();
  selectMainSceneObject(selectedId || getMainSceneObjectDefaults()[0]?.id);
  showNotice("主场景物体布局已恢复默认。");
}

function syncMainSceneLayout(changedId) {
  renderMainSceneObjectSelect();
  renderMainSceneObjectEditor();

  if (roomRenderer?.setMainSceneLayout) {
    roomRenderer.setMainSceneLayout(changedId);
  } else {
    updateCubeTransform();
  }
}

function loadStoredRoomConfig() {
  try {
    const stored = window.localStorage.getItem(ROOM_STORAGE_KEY);

    return stored ? migrateStoredRoomConfig(JSON.parse(stored)) : null;
  } catch (error) {
    console.warn("无法读取本地场景配置", error);
    return null;
  }
}

function migrateStoredRoomConfig(config) {
  if (!config || typeof config !== "object") {
    return null;
  }

  const migrated = cloneConfig(config);
  migrated.textures = migrated.textures || {};

  Object.entries(LEGACY_WALL_TEXTURES).forEach(([face, legacySrc]) => {
    const currentSrc = String(migrated.textures[face] || "");

    if (!currentSrc || currentSrc === legacySrc) {
      migrated.textures[face] = DEFAULT_ROOM_CONFIG.textures[face];
    }
  });

  return migrated;
}

function saveRoomConfigToStorage() {
  const configToSave = cloneConfig(roomConfig);
  let hasTemporaryTexture = false;

  Object.entries(configToSave.textures).forEach(([face, src]) => {
    if (String(src).startsWith("blob:")) {
      configToSave.textures[face] = DEFAULT_ROOM_CONFIG.textures[face];
      hasTemporaryTexture = true;
    }
  });

  try {
    window.localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(configToSave));
    showNotice(hasTemporaryTexture
      ? "已保存角色和文本路径。上传图片是临时预览，长期使用请填写项目内图片路径。"
      : "已保存到本机浏览器，下次打开会自动读取。");
  } catch (error) {
    console.warn("无法保存本地场景配置", error);
    showNotice("浏览器阻止了本地保存，但当前页面的修改仍然有效。");
  }
}

function resetStoredRoomConfig() {
  try {
    window.localStorage.removeItem(ROOM_STORAGE_KEY);
  } catch (error) {
    console.warn("无法清除本地场景配置", error);
  }
  roomConfig = normalizeRoomConfig(window.MR_ROOM_CONFIG);
  activeRoleId = roomConfig.roles[0]?.id || null;
  applyRoomConfigToCssCube();

  if (roomRenderer) {
    roomRenderer.setTextures(roomConfig.textures);
    roomRenderer.setRoles(roomConfig.roles);
  }

  renderTextureControls();
  renderRoleControls();
  populateRoleEditor(roomConfig.roles[0] || createDraftRole());
  updateCubeTransform();
  showNotice("已恢复 room-config.js 中的默认配置。");
}

function normalizeRoomConfig(config = {}) {
  const source = config && typeof config === "object" ? config : {};
  const textures = {
    ...DEFAULT_ROOM_CONFIG.textures,
    ...(source.textures || {})
  };
  const roles = Array.isArray(source.roles)
    ? source.roles.map(normalizeRole).filter(Boolean)
    : [];

  return { textures, roles };
}

function normalizeRole(role, index) {
  if (!role || typeof role !== "object") {
    return null;
  }

  const id = String(role.id || `role-${index + 1}`);
  const name = String(role.name || `角色 ${index + 1}`);
  const position = Array.isArray(role.position) ? role.position : [0, -3.02, -4];
  const view = role.view && typeof role.view === "object" ? role.view : {};

  return {
    id,
    name,
    type: String(role.type || "role"),
    color: role.color || "#39b88f",
    position: [
      Number(position[0] ?? 0),
      Number(position[1] ?? -3.02),
      Number(position[2] ?? -4)
    ],
    scale: Number(role.scale || 1),
    view: {
      yaw: Number(view.yaw ?? 0),
      pitch: Number(view.pitch ?? -7),
      scale: Number(view.scale ?? 1)
    },
    description: String(role.description || "自定义场景角色。"),
    visible: role.visible !== false
  };
}

function init() {
  buildStepNavigation();
  buildPathList();
  bindQuickControls();
  bindLearningControls();
  bindReviewControls();
  bindHistoryControls();
  bindPlanControls();
  initPracticeCanvas();
  initInfoPanelDrag();
  installRoomApi();
  bindSceneEditorControls();
  bindMainSceneAdminControls();
  applyRoomConfigToCssCube();
  buildSceneConfigPanel();
  initCubeControls();
  renderLearningStateSummary();

  loadScene(0);
  if (new URLSearchParams(window.location.search).has("modelView")) {
    window.setTimeout(focusModelView, 900);
  }
  window.addEventListener("keydown", handleKeyboardSceneChange, true);
  window.addEventListener("storage", handleMainSceneStorageChange);
  window.addEventListener("mr-learning-state-change", renderLearningState);
}

function handleMainSceneStorageChange(event) {
  if (event.key !== MAIN_SCENE_STORAGE_KEY) {
    return;
  }

  mainSceneLayout = loadMainSceneLayout();
  syncMainSceneLayout();
}

function initCubeControls() {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  if (IS_FILE_MODE) {
    activateCssCubeFallback();
  } else {
    try {
      roomRenderer = createRoomRenderer(els.roomCanvas);
    } catch (error) {
      console.error(error);
      activateCssCubeFallback();
    }
  }
  updateCubeTransform();
  window.addEventListener("resize", updateCubeTransform);

  els.cubeViewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    els.cubeViewport.classList.add("is-dragging");
    els.cubeViewport.setPointerCapture(event.pointerId);
  });

  els.cubeViewport.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    cubeYaw += dx * 0.13;
    cubePitch = clamp(cubePitch - dy * 0.1, -38, 32);
    updateCubeTransform();
  });

  els.cubeViewport.addEventListener("pointerup", (event) => {
    isDragging = false;
    els.cubeViewport.classList.remove("is-dragging");

    if (els.cubeViewport.hasPointerCapture(event.pointerId)) {
      els.cubeViewport.releasePointerCapture(event.pointerId);
    }
  });

  els.cubeViewport.addEventListener("pointercancel", () => {
    isDragging = false;
    els.cubeViewport.classList.remove("is-dragging");
  });

  els.cubeViewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    cubeScale = clamp(cubeScale - event.deltaY * 0.001, 0.7, 1.55);
    updateCubeTransform();
  }, { passive: false });
}

function activateCssCubeFallback() {
  roomRenderer = null;
  cubeYaw = 180;
  cubePitch = 8;
  cubeScale = 0.78;

  if (els.roomCanvas) {
    els.roomCanvas.hidden = true;
  }

  els.cubeScene.style.display = "block";
}

function updateCubeTransform() {
  if (roomRenderer) {
    roomRenderer.render(cubeYaw, cubePitch, cubeScale);
    return;
  }

  els.cubeScene.style.setProperty("--scene-yaw", `${cubeYaw}deg`);
  els.cubeScene.style.setProperty("--scene-pitch", `${cubePitch}deg`);
  els.cubeScene.style.setProperty("--scene-scale", cubeScale.toFixed(3));
}

function installRoomApi() {
  window.MRRoomAPI = {
    getConfig: () => cloneConfig(roomConfig),
    setTextures: (textures) => setRoomTextures(textures),
    setRoles: (roles) => setRoomRoles(roles),
    addRole: (role) => {
      const nextRole = normalizeRole(role, roomConfig.roles.length);
      if (!nextRole) {
        return cloneConfig(roomConfig);
      }

      return setRoomRoles([...roomConfig.roles, nextRole]);
    },
    focusRole,
    getMainSceneLayout: () => cloneConfig(mainSceneLayout),
    setMainSceneObject: (id, patch) => setMainSceneObjectState(id, patch, { recordUndo: false }),
    resetMainSceneObject
  };
}

function bindSceneEditorControls() {
  els.saveRoomConfig?.addEventListener("click", saveRoomConfigToStorage);
  els.resetRoomConfig?.addEventListener("click", resetStoredRoomConfig);
  els.newRoleButton?.addEventListener("click", () => {
    activeRoleId = null;
    populateRoleEditor(createDraftRole());
    renderRoleControls();
  });
  els.deleteRoleButton?.addEventListener("click", deleteActiveRole);
  els.roleEditor?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveRoleFromEditor();
  });
}

function bindMainSceneAdminControls() {
  if (!els.mainObjectSelect) {
    return;
  }

  renderMainSceneObjectSelect();
  selectMainSceneObject(getMainSceneObjectDefaults()[0]?.id);

  els.mainObjectSelect.addEventListener("change", () => {
    selectMainSceneObject(els.mainObjectSelect.value);
  });

  [
    els.mainObjectX,
    els.mainObjectY,
    els.mainObjectZ,
    els.mainObjectRotX,
    els.mainObjectRotY,
    els.mainObjectRotZ,
    els.mainObjectScale
  ].forEach((input) => {
    input?.addEventListener("change", applyMainSceneEditorInputs);
  });

  document.querySelectorAll("[data-main-nudge]").forEach((button) => {
    button.addEventListener("click", () => nudgeMainSceneObject(button));
  });

  els.mainObjectUndo?.addEventListener("click", undoMainSceneChange);
  els.mainObjectReset?.addEventListener("click", () => resetMainSceneObject(activeMainObjectId));
  els.mainObjectDelete?.addEventListener("click", () => {
    const current = getMainSceneObjectStateById(activeMainObjectId);
    if (current) {
      setMainSceneObjectState(current.id, { ...current, deleted: true });
      selectMainSceneObject(current.id);
    }
  });
  els.mainObjectRestore?.addEventListener("click", () => {
    const current = getMainSceneObjectStateById(activeMainObjectId);
    if (current) {
      setMainSceneObjectState(current.id, { ...current, deleted: false });
      selectMainSceneObject(current.id);
    }
  });
  els.mainObjectSave?.addEventListener("click", () => {
    saveMainSceneLayoutToStorage();
    showNotice("主场景物体参数已保存，演示页会自动读取。");
  });
  els.mainObjectResetAll?.addEventListener("click", resetAllMainSceneObjects);
  window.addEventListener("keydown", handleMainSceneAdminKeydown, true);
}

function renderMainSceneObjectSelect() {
  if (!els.mainObjectSelect) {
    return;
  }

  const selectedId = activeMainObjectId || els.mainObjectSelect.value;
  els.mainObjectSelect.innerHTML = "";

  getMainSceneObjectDefaults().forEach((object) => {
    const state = getMainSceneObjectState(object);
    const option = document.createElement("option");
    const typeLabel = object.type === "model" ? "模型" : object.type === "imported" ? "导入" : "装饰";

    option.value = object.id;
    option.textContent = `${typeLabel} / ${object.label}${state.deleted ? "（已隐藏）" : ""}`;
    els.mainObjectSelect.appendChild(option);
  });

  if (selectedId && getMainSceneObjectDefault(selectedId)) {
    els.mainObjectSelect.value = selectedId;
  }
}

function selectMainSceneObject(id) {
  const state = getMainSceneObjectStateById(id);

  if (!state || !els.mainObjectSelect) {
    return;
  }

  activeMainObjectId = state.id;
  els.mainObjectSelect.value = state.id;
  renderMainSceneObjectEditor();
}

function renderMainSceneObjectEditor() {
  if (!els.mainObjectSelect || !activeMainObjectId) {
    return;
  }

  const state = getMainSceneObjectStateById(activeMainObjectId);

  if (!state) {
    return;
  }

  const deleted = state.deleted === true;
  const typeText = state.type === "model" ? "WebGL GLB 模型" : "主场景几何装饰";

  if (els.mainObjectType) {
    els.mainObjectType.textContent = typeText;
  }
  if (els.mainObjectStatus) {
    els.mainObjectStatus.textContent = deleted ? "当前已隐藏，可点击恢复物体。" : "调整后会自动同步到演示页。";
  }

  setMainInputValue(els.mainObjectX, state.x);
  setMainInputValue(els.mainObjectY, state.y);
  setMainInputValue(els.mainObjectZ, state.z);
  setMainInputValue(els.mainObjectRotX, state.rx);
  setMainInputValue(els.mainObjectRotY, state.ry);
  setMainInputValue(els.mainObjectRotZ, state.rz);
  setMainInputValue(els.mainObjectScale, state.scale);

  [
    els.mainObjectX,
    els.mainObjectY,
    els.mainObjectZ,
    els.mainObjectRotX,
    els.mainObjectRotY,
    els.mainObjectRotZ,
    els.mainObjectScale
  ].forEach((input) => {
    if (input) {
      input.disabled = deleted;
    }
  });

  if (els.mainObjectDelete) {
    els.mainObjectDelete.disabled = deleted;
  }
  if (els.mainObjectRestore) {
    els.mainObjectRestore.disabled = !deleted;
  }
}

function setMainInputValue(input, value) {
  if (input) {
    input.value = Number(value).toFixed(input === els.mainObjectScale ? 3 : 2);
  }
}

function applyMainSceneEditorInputs() {
  const current = getMainSceneObjectStateById(activeMainObjectId);

  if (!current || current.deleted) {
    return;
  }

  setMainSceneObjectState(current.id, {
    x: Number(els.mainObjectX.value),
    y: Number(els.mainObjectY.value),
    z: Number(els.mainObjectZ.value),
    rx: Number(els.mainObjectRotX.value),
    ry: Number(els.mainObjectRotY.value),
    rz: Number(els.mainObjectRotZ.value),
    scale: Number(els.mainObjectScale.value),
    deleted: current.deleted
  });
  selectMainSceneObject(current.id);
}

function nudgeMainSceneObject(button) {
  const current = getMainSceneObjectStateById(activeMainObjectId);

  if (!current || current.deleted) {
    return;
  }

  const axis = button.dataset.mainNudge;
  const step = Number(button.dataset.step || 0);

  if (!axis || !Number.isFinite(step)) {
    return;
  }

  setMainSceneObjectState(current.id, {
    ...current,
    [axis]: Number(current[axis]) + step
  });
  selectMainSceneObject(current.id);
}

function handleMainSceneAdminKeydown(event) {
  if (!IS_MAIN_SCENE_ADMIN) {
    return;
  }

  const key = event.key.toLowerCase();

  if ((event.ctrlKey || event.metaKey) && key === "z") {
    event.preventDefault();
    event.stopPropagation();
    undoMainSceneChange();
  }
}

function setRoomTextures(textures = {}) {
  roomConfig = normalizeRoomConfig({
    ...roomConfig,
    textures: {
      ...roomConfig.textures,
      ...textures
    }
  });

  applyRoomConfigToCssCube();

  if (roomRenderer) {
    roomRenderer.setTextures(roomConfig.textures);
  }

  renderTextureControls();
  updateCubeTransform();

  return cloneConfig(roomConfig);
}

function setRoomRoles(roles = []) {
  roomConfig = normalizeRoomConfig({
    ...roomConfig,
    roles
  });

  syncCssRoomRoles();

  if (roomRenderer) {
    roomRenderer.setRoles(roomConfig.roles);
  }

  renderRoleControls();
  updateCubeTransform();

  return cloneConfig(roomConfig);
}

function buildSceneConfigPanel() {
  activeRoleId = roomConfig.roles[0]?.id || null;
  renderTextureControls();
  renderRoleControls();
  syncCssRoomRoles();
  populateRoleEditor(roomConfig.roles[0] || createDraftRole());
}

function renderTextureControls() {
  if (!els.textureControls) {
    return;
  }

  els.textureControls.innerHTML = "";

  Object.entries(FACE_LABELS).forEach(([face, label]) => {
    const row = document.createElement("div");
    const pathInput = document.createElement("input");
    const applyButton = document.createElement("button");
    const input = document.createElement("input");
    const upload = document.createElement("label");

    row.className = "texture-row";
    pathInput.className = "texture-input";
    pathInput.type = "text";
    pathInput.value = String(roomConfig.textures[face] || "");
    pathInput.setAttribute("aria-label", `${label}贴图路径`);
    pathInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyTexturePath(face, pathInput.value);
      }
    });

    applyButton.className = "texture-apply";
    applyButton.type = "button";
    applyButton.textContent = "应用";
    applyButton.addEventListener("click", () => applyTexturePath(face, pathInput.value));

    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", () => handleTextureUpload(face, input.files[0]));
    upload.className = "texture-upload";
    upload.textContent = "替换";
    upload.appendChild(input);

    row.innerHTML = `
      <span class="texture-name">${label}</span>
    `;
    row.appendChild(pathInput);
    row.appendChild(applyButton);
    row.appendChild(upload);
    els.textureControls.appendChild(row);
  });

  if (els.textureModeLabel) {
    els.textureModeLabel.textContent = IS_FILE_MODE ? "CSS" : "WebGL";
  }
}

function applyTexturePath(face, value) {
  const nextPath = String(value || "").trim();

  if (!nextPath) {
    showNotice(`${FACE_LABELS[face]}贴图路径不能为空。`);
    return;
  }

  textureSourceNames[face] = "";
  setRoomTextures({ [face]: nextPath });
  showNotice(`已应用${FACE_LABELS[face]}贴图路径。点击“保存到本机”可保留下次使用。`);
}

function handleTextureUpload(face, file) {
  if (!file) {
    return;
  }

  const url = URL.createObjectURL(file);
  textureSourceNames[face] = file.name;
  setRoomTextures({ [face]: url });
  showNotice(`已临时替换${FACE_LABELS[face]}贴图：${file.name}`);
}

function renderRoleControls() {
  if (!els.roleControls) {
    return;
  }

  els.roleControls.innerHTML = "";

  roomConfig.roles.forEach((role) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "role-button";
    button.classList.toggle("is-active", role.id === activeRoleId);
    button.style.setProperty("--role-color", role.color);
    button.innerHTML = `
      <span class="role-copy">
        <strong>${role.name}</strong>
        <span>${role.description}</span>
      </span>
      <span class="role-dot" aria-hidden="true"></span>
    `;
    button.addEventListener("click", () => focusRole(role.id));
    els.roleControls.appendChild(button);
  });

  if (els.roleCountLabel) {
    els.roleCountLabel.textContent = `${roomConfig.roles.length} 个`;
  }
}

function focusRole(roleId) {
  const role = roomConfig.roles.find((item) => item.id === roleId);

  if (!role) {
    return null;
  }

  activeRoleId = role.id;
  cubeYaw = role.view.yaw;
  cubePitch = role.view.pitch;
  cubeScale = role.view.scale;
  updateCubeTransform();
  renderRoleControls();
  populateRoleEditor(role);
  els.actionFeedback.textContent = `${role.name}：${role.description}`;

  return cloneConfig(role);
}

function createDraftRole() {
  const index = roomConfig.roles.length + 1;

  return normalizeRole({
    id: `role-${Date.now()}`,
    name: `新角色 ${index}`,
    type: "custom",
    color: "#8e6cff",
    position: [0, -3.02, -4],
    scale: 1,
    view: { yaw: cubeYaw, pitch: cubePitch, scale: cubeScale },
    description: "可在网页中编辑位置、颜色和视角。"
  }, index - 1);
}

function populateRoleEditor(role) {
  if (!els.roleEditor || !role) {
    return;
  }

  els.roleNameInput.value = role.name;
  els.roleTypeInput.value = role.type;
  els.roleColorInput.value = role.color;
  els.roleScaleInput.value = role.scale;
  els.roleXInput.value = role.position[0];
  els.roleYInput.value = role.position[1];
  els.roleZInput.value = role.position[2];
  els.roleYawInput.value = role.view.yaw;
  els.rolePitchInput.value = role.view.pitch;
  els.roleViewScaleInput.value = role.view.scale;
  els.roleDescriptionInput.value = role.description;
}

function readRoleEditor() {
  const existing = roomConfig.roles.find((role) => role.id === activeRoleId);

  return normalizeRole({
    id: existing?.id || `role-${Date.now()}`,
    name: els.roleNameInput.value,
    type: els.roleTypeInput.value,
    color: els.roleColorInput.value,
    position: [
      Number(els.roleXInput.value),
      Number(els.roleYInput.value),
      Number(els.roleZInput.value)
    ],
    scale: Number(els.roleScaleInput.value),
    view: {
      yaw: Number(els.roleYawInput.value),
      pitch: Number(els.rolePitchInput.value),
      scale: Number(els.roleViewScaleInput.value)
    },
    description: els.roleDescriptionInput.value
  }, roomConfig.roles.length);
}

function saveRoleFromEditor() {
  const nextRole = readRoleEditor();
  const existingIndex = roomConfig.roles.findIndex((role) => role.id === nextRole.id);
  const nextRoles = [...roomConfig.roles];

  if (existingIndex >= 0) {
    nextRoles[existingIndex] = nextRole;
  } else {
    nextRoles.push(nextRole);
  }

  activeRoleId = nextRole.id;
  setRoomRoles(nextRoles);
  populateRoleEditor(nextRole);
  showNotice(`已保存角色：${nextRole.name}。点击“保存到本机”可保留下次使用。`);
}

function deleteActiveRole() {
  if (!activeRoleId) {
    populateRoleEditor(createDraftRole());
    return;
  }

  const nextRoles = roomConfig.roles.filter((role) => role.id !== activeRoleId);
  activeRoleId = nextRoles[0]?.id || null;
  setRoomRoles(nextRoles);
  populateRoleEditor(nextRoles[0] || createDraftRole());
  showNotice("已删除当前角色。点击“保存到本机”可保留下次使用。");
}

function applyRoomConfigToCssCube() {
  const faceClassNames = {
    front: ".wall-front",
    back: ".wall-back",
    left: ".wall-left",
    right: ".wall-right",
    ceiling: ".ceiling",
    floor: ".floor"
  };

  Object.entries(faceClassNames).forEach(([face, selector]) => {
    const target = els.cubeScene.querySelector(selector);

    if (target) {
      target.style.backgroundImage = `url("${roomConfig.textures[face]}")`;
    }
  });

  syncCssRoomRoles();
}

function syncCssRoomRoles() {
  if (!els.cssRoleLayer) {
    return;
  }

  els.cssRoleLayer.innerHTML = "";

  roomConfig.roles
    .filter((role) => role.visible)
    .forEach((role) => {
      const element = document.createElement("span");
      const [x, y, z] = role.position;
      const scale = role.scale || 1;

      element.className = "css-room-role";
      element.title = role.name;
      element.style.setProperty("--role-color", role.color);
      element.style.transform = `translate3d(${x * 52}px, ${-y * 52 - 290}px, ${z * 78}px) scale(${scale})`;
      els.cssRoleLayer.appendChild(element);
    });
}

function cloneConfig(value) {
  return JSON.parse(JSON.stringify(value));
}

function createRoomRenderer(canvas) {
  if (!canvas) {
    return null;
  }

  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    powerPreference: "high-performance"
  });

  if (!gl) {
    canvas.hidden = true;
    els.cubeScene.style.display = "block";
    return null;
  }

  const program = createShaderProgram(gl, ROOM_VERTEX_SHADER, ROOM_FRAGMENT_SHADER);
  const locations = {
    position: gl.getAttribLocation(program, "aPosition"),
    texCoord: gl.getAttribLocation(program, "aTexCoord"),
    color: gl.getAttribLocation(program, "aColor"),
    normal: gl.getAttribLocation(program, "aNormal"),
    projection: gl.getUniformLocation(program, "uProjection"),
    view: gl.getUniformLocation(program, "uView"),
    texture: gl.getUniformLocation(program, "uTexture"),
    useTexture: gl.getUniformLocation(program, "uUseTexture")
  };
  const roomMeshes = createRoomTextureMeshes(gl);
  let modelVertices = [];
  let hasRenderableModels = true;
  let furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices, true);
  const fallbackTexture = createSolidTexture(gl, [255, 255, 255, 255]);
  const textures = {};

  loadTextures(roomConfig.textures);
  rebuildRoomModelMesh(true);

  function rebuildRoomModelMesh(showLoadingFallback = false) {
    const modelSpecs = getRenderableMainModelSpecs();

    hasRenderableModels = modelSpecs.length > 0;
    if (!hasRenderableModels) {
      modelVertices = [];
      furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices, false);
      updateCubeTransform();
      return Promise.resolve();
    }

    if (showLoadingFallback) {
      furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices, true);
    }

    return loadRoomModels(modelSpecs)
      .then((result) => {
        modelVertices = result.vertices;
        furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices, hasRenderableModels);
        window.MR_LOADED_MODEL_COUNT = result.loaded;
        window.MR_LOADED_MODEL_VERTICES = modelVertices.length / 11;
        showNotice(`已加载 ${result.loaded} 个 3D 模型。`);
        updateCubeTransform();
      })
      .catch((error) => {
        console.error(error);
        showNotice("开源 3D 模型加载失败，已保留基础几何家具。");
      });
  }

  function loadTextures(nextTextures) {
    Object.entries(nextTextures).forEach(([name, src]) => {
      textures[name] = loadRoomTexture(gl, src, () => {
        updateCubeTransform();
      });
    });
  }

  function setRoles(roles) {
    furnitureMesh = createFurnitureMesh(gl, roles, modelVertices, hasRenderableModels);
  }

  function setTextures(nextTextures) {
    loadTextures(nextTextures);
    Object.keys(nextTextures).forEach((face) => {
      textureSourceNames[face] = textureSourceNames[face] || nextTextures[face];
    });
  }

  function setMainSceneLayout(changedId) {
    if (!changedId || isMainModelObject(changedId)) {
      rebuildRoomModelMesh(false);
      return;
    }

    furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices, hasRenderableModels);
    updateCubeTransform();
  }

  Object.entries(roomConfig.textures).forEach(([name, src]) => {
    if (!textures[name]) {
      textures[name] = loadRoomTexture(gl, src, () => {
        updateCubeTransform();
      });
    }
  });

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0.06, 0.055, 0.048, 1);
  gl.uniform1i(locations.texture, 0);

  function render(yaw, pitch, scale) {
    resizeRoomCanvas(gl, canvas);

    const aspect = canvas.width / canvas.height;
    const projection = makePerspectiveMatrix(degToRad(clamp(74 / scale, 42, 92)), aspect, 0.1, 80);
    const view = makeRoomViewMatrix(yaw, pitch);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix4fv(locations.projection, false, projection);
    gl.uniformMatrix4fv(locations.view, false, view);

    roomMeshes.forEach((mesh) => {
      drawRoomMesh(gl, locations, mesh, textures[mesh.texture], true);
    });

    drawRoomMesh(gl, locations, furnitureMesh, fallbackTexture, false);
  }

  return { render, setTextures, setRoles, setMainSceneLayout };
}

const ROOM_VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  attribute vec3 aColor;
  attribute vec3 aNormal;

  uniform mat4 uProjection;
  uniform mat4 uView;

  varying vec2 vTexCoord;
  varying vec3 vColor;
  varying float vLight;

  void main() {
    vec3 lightDir = normalize(vec3(-0.34, 0.78, 0.48));
    float diffuse = max(dot(normalize(aNormal), lightDir), 0.0);
    vLight = 0.76 + diffuse * 0.24;
    vTexCoord = aTexCoord;
    vColor = aColor;
    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
  }
`;

const ROOM_FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D uTexture;
  uniform float uUseTexture;

  varying vec2 vTexCoord;
  varying vec3 vColor;
  varying float vLight;

  void main() {
    vec4 texel = texture2D(uTexture, vTexCoord);
    vec3 base = mix(vColor, texel.rgb, uUseTexture);
    gl_FragColor = vec4(base * vLight, 1.0);
  }
`;

function createShaderProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "WebGL program link failed.");
  }

  return program;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "WebGL shader compile failed.");
  }

  return shader;
}

function loadRoomTexture(gl, src, onLoad) {
  const texture = createSolidTexture(gl, [70, 54, 40, 255]);

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    onLoad();
  };
  image.onerror = () => {
    showNotice(`无法加载立方体贴图：${src}`);
  };
  image.src = src;

  return texture;
}

function createSolidTexture(gl, rgba) {
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(rgba)
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

function createRoomTextureMeshes(gl) {
  const x = 8;
  const yTop = 5.2;
  const yBottom = -3.2;
  const zFront = -8;
  const zBack = 8;

  return [
    createMesh(gl, buildQuad(
      [-x, yTop, zFront],
      [x, yTop, zFront],
      [x, yBottom, zFront],
      [-x, yBottom, zFront],
      [1, 1, 1],
      [0, 0, 1]
    ), "front"),
    createMesh(gl, buildQuad(
      [x, yTop, zBack],
      [-x, yTop, zBack],
      [-x, yBottom, zBack],
      [x, yBottom, zBack],
      [1, 1, 1],
      [0, 0, -1]
    ), "back"),
    createMesh(gl, buildQuad(
      [-x, yTop, zBack],
      [-x, yTop, zFront],
      [-x, yBottom, zFront],
      [-x, yBottom, zBack],
      [1, 1, 1],
      [1, 0, 0]
    ), "left"),
    createMesh(gl, buildQuad(
      [x, yTop, zFront],
      [x, yTop, zBack],
      [x, yBottom, zBack],
      [x, yBottom, zFront],
      [1, 1, 1],
      [-1, 0, 0]
    ), "right"),
    createMesh(gl, buildQuad(
      [-x, yTop, zBack],
      [x, yTop, zBack],
      [x, yTop, zFront],
      [-x, yTop, zFront],
      [1, 1, 1],
      [0, -1, 0]
    ), "ceiling"),
    createMesh(gl, buildQuad(
      [-x, yBottom, zFront],
      [x, yBottom, zFront],
      [x, yBottom, zBack],
      [-x, yBottom, zBack],
      [1, 1, 1],
      [0, 1, 0]
    ), "floor")
  ];
}

const roomModelBufferCache = new Map();

async function fetchRoomModelBuffer(src) {
  if (roomModelBufferCache.has(src)) {
    return roomModelBufferCache.get(src).slice(0);
  }

  const response = await fetch(src);

  if (!response.ok) {
    throw new Error(`Model load failed: ${src}`);
  }

  const buffer = await response.arrayBuffer();
  roomModelBufferCache.set(src, buffer.slice(0));

  return buffer;
}

function openMainImportDb() {
  if (mainImportDbPromise) {
    return mainImportDbPromise;
  }

  mainImportDbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(MAIN_IMPORT_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MAIN_IMPORT_DB_STORE)) {
        db.createObjectStore(MAIN_IMPORT_DB_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open imported model storage."));
  });

  return mainImportDbPromise;
}

async function readMainImportedModel(record) {
  const db = await openMainImportDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MAIN_IMPORT_DB_STORE, "readonly");
    const store = transaction.objectStore(MAIN_IMPORT_DB_STORE);
    const request = store.get(record.dbKey);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Could not read imported model."));
  });
}

async function getRoomModelBuffer(spec) {
  if (!spec.dbKey) {
    return fetchRoomModelBuffer(spec.src);
  }

  const cacheKey = `idb:${spec.dbKey}`;
  if (roomModelBufferCache.has(cacheKey)) {
    return roomModelBufferCache.get(cacheKey).slice(0);
  }

  const stored = await readMainImportedModel(spec);
  if (!stored?.arrayBuffer) {
    throw new Error(`Imported model data missing: ${spec.label || spec.fileName || spec.id}`);
  }

  roomModelBufferCache.set(cacheKey, stored.arrayBuffer.slice(0));
  return stored.arrayBuffer.slice(0);
}

async function loadRoomModels(modelSpecs) {
  if (!modelSpecs.length) {
    return {
      vertices: [],
      loaded: 0
    };
  }

  const chunks = await Promise.all(modelSpecs.map(async (spec) => {
    try {
      const buffer = await getRoomModelBuffer(spec);
      return {
        id: spec.id,
        vertices: spec.type === "obj"
          ? parseObjModel(buffer, spec)
          : parseGlbModel(buffer, spec)
      };
    } catch (error) {
      console.warn(error);
      return {
        id: spec.id,
        vertices: [],
        error
      };
    }
  }));
  const loadedChunks = chunks.filter((chunk) => chunk.vertices.length > 0);
  const vertices = loadedChunks.flatMap((chunk) => chunk.vertices);

  if (!vertices.length) {
    throw new Error("No 3D models could be loaded.");
  }

  return {
    vertices,
    loaded: loadedChunks.length
  };
}

function parseGlbModel(arrayBuffer, spec) {
  const dataView = new DataView(arrayBuffer);
  const magic = dataView.getUint32(0, true);

  if (magic !== 0x46546c67) {
    throw new Error(`Invalid GLB file: ${spec.src || spec.fileName || spec.id}`);
  }

  let offset = 12;
  let gltf = null;
  let binaryChunk = null;

  while (offset < arrayBuffer.byteLength) {
    const chunkLength = dataView.getUint32(offset, true);
    const chunkType = dataView.getUint32(offset + 4, true);
    const chunkStart = offset + 8;
    const chunk = arrayBuffer.slice(chunkStart, chunkStart + chunkLength);

    if (chunkType === 0x4e4f534a) {
      gltf = JSON.parse(new TextDecoder("utf-8").decode(chunk));
    } else if (chunkType === 0x004e4942) {
      binaryChunk = chunk;
    }

    offset = chunkStart + chunkLength;
  }

  if (!gltf || !binaryChunk) {
    throw new Error(`Missing GLB chunks: ${spec.src || spec.fileName || spec.id}`);
  }

  const bounds = getGlbPositionBounds(gltf);
  const vertices = [];

  (gltf.meshes || []).forEach((mesh) => {
    (mesh.primitives || []).forEach((primitive) => {
      if (primitive.mode !== undefined && primitive.mode !== 4) {
        return;
      }

      const positionIndex = primitive.attributes && primitive.attributes.POSITION;
      if (positionIndex === undefined) {
        return;
      }

      const positions = readGlbAccessor(gltf, binaryChunk, positionIndex);
      const normals = primitive.attributes.NORMAL !== undefined
        ? readGlbAccessor(gltf, binaryChunk, primitive.attributes.NORMAL)
        : null;
      const indices = primitive.indices !== undefined
        ? readGlbAccessor(gltf, binaryChunk, primitive.indices)
        : positions.map((_, index) => index);
      const color = getGlbMaterialColor(gltf, primitive.material, spec);

      for (let i = 0; i < indices.length; i += 3) {
        pushGlbModelVertex(vertices, positions[indices[i]], normals && normals[indices[i]], color, bounds, spec);
        pushGlbModelVertex(vertices, positions[indices[i + 1]], normals && normals[indices[i + 1]], color, bounds, spec);
        pushGlbModelVertex(vertices, positions[indices[i + 2]], normals && normals[indices[i + 2]], color, bounds, spec);
      }
    });
  });

  return vertices;
}

function parseObjModel(arrayBuffer, spec) {
  const text = new TextDecoder("utf-8").decode(arrayBuffer);
  const positions = [];
  const faces = [];

  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      return;
    }

    const parts = line.split(/\s+/);
    const command = parts.shift();

    if (command === "v" && parts.length >= 3) {
      positions.push([
        Number(parts[0]),
        Number(parts[1]),
        Number(parts[2])
      ]);
      return;
    }

    if (command === "f" && parts.length >= 3) {
      const indices = parts
        .map((part) => parseObjFaceIndex(part, positions.length))
        .filter((index) => index >= 0 && index < positions.length);

      for (let i = 1; i < indices.length - 1; i += 1) {
        faces.push([indices[0], indices[i], indices[i + 1]]);
      }
    }
  });

  if (!positions.length || !faces.length) {
    throw new Error(`OBJ has no readable mesh: ${spec.fileName || spec.id}`);
  }

  const bounds = getObjPositionBounds(positions);
  const color = spec.color ? hexToRgb(spec.color) : [0.72, 0.5, 0.32];
  const rx = degToRad(spec.rotationX || 0);
  const ry = degToRad(spec.rotationY || 0);
  const rz = degToRad(spec.rotationZ || 0);
  const vertices = [];

  faces.forEach((face) => {
    const triangle = face.map((index) => transformObjPosition(positions[index], bounds, spec, rx, ry, rz));
    const normal = normalizeVector(crossVector(
      subtractVector(triangle[1], triangle[0]),
      subtractVector(triangle[2], triangle[0])
    ));

    pushVertex(vertices, triangle[0], [0, 0], color, normal);
    pushVertex(vertices, triangle[1], [1, 0], color, normal);
    pushVertex(vertices, triangle[2], [0, 1], color, normal);
  });

  return vertices;
}

function parseObjFaceIndex(token, vertexCount) {
  const value = Number.parseInt(String(token).split("/")[0], 10);

  if (!Number.isFinite(value) || value === 0) {
    return -1;
  }

  return value > 0 ? value - 1 : vertexCount + value;
}

function getObjPositionBounds(positions) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  positions.forEach((position) => {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], position[axis]);
      max[axis] = Math.max(max[axis], position[axis]);
    }
  });

  return {
    centerX: (min[0] + max[0]) / 2,
    centerZ: (min[2] + max[2]) / 2,
    minY: min[1]
  };
}

function transformObjPosition(position, bounds, spec, rx, ry, rz) {
  const scale = spec.scale || 1;
  const rotated = rotateVectorWithRadians([
    (position[0] - bounds.centerX) * scale,
    (position[1] - bounds.minY) * scale,
    (position[2] - bounds.centerZ) * scale
  ], rx, ry, rz);

  return [
    spec.position[0] + rotated[0],
    spec.position[1] + rotated[1],
    spec.position[2] + rotated[2]
  ];
}

function subtractVector(a, b) {
  return [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2]
  ];
}

function getGlbPositionBounds(gltf) {
  const mins = [];
  const maxs = [];

  (gltf.meshes || []).forEach((mesh) => {
    (mesh.primitives || []).forEach((primitive) => {
      const positionIndex = primitive.attributes && primitive.attributes.POSITION;
      const accessor = gltf.accessors && gltf.accessors[positionIndex];

      if (accessor && accessor.min && accessor.max) {
        mins.push(accessor.min);
        maxs.push(accessor.max);
      }
    });
  });

  if (!mins.length) {
    return { centerX: 0, centerZ: 0, minY: 0 };
  }

  const min = [0, 1, 2].map((axis) => Math.min(...mins.map((value) => value[axis])));
  const max = [0, 1, 2].map((axis) => Math.max(...maxs.map((value) => value[axis])));

  return {
    centerX: (min[0] + max[0]) / 2,
    centerZ: (min[2] + max[2]) / 2,
    minY: min[1]
  };
}

function readGlbAccessor(gltf, binaryChunk, accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  const bufferView = gltf.bufferViews[accessor.bufferView];
  const component = getGlbComponentInfo(accessor.componentType);
  const itemSize = getGlbAccessorItemSize(accessor.type);
  const stride = bufferView.byteStride || component.bytes * itemSize;
  const offset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const view = new DataView(binaryChunk);
  const values = [];

  for (let i = 0; i < accessor.count; i += 1) {
    const item = [];

    for (let j = 0; j < itemSize; j += 1) {
      const byteOffset = offset + i * stride + j * component.bytes;
      let value = component.read(view, byteOffset);

      if (accessor.normalized) {
        value = normalizeGlbComponent(value, accessor.componentType);
      }

      item.push(value);
    }

    values.push(itemSize === 1 ? item[0] : item);
  }

  return values;
}

function getGlbComponentInfo(componentType) {
  const readers = {
    5120: { bytes: 1, read: (view, offset) => view.getInt8(offset) },
    5121: { bytes: 1, read: (view, offset) => view.getUint8(offset) },
    5122: { bytes: 2, read: (view, offset) => view.getInt16(offset, true) },
    5123: { bytes: 2, read: (view, offset) => view.getUint16(offset, true) },
    5125: { bytes: 4, read: (view, offset) => view.getUint32(offset, true) },
    5126: { bytes: 4, read: (view, offset) => view.getFloat32(offset, true) }
  };

  return readers[componentType] || readers[5126];
}

function getGlbAccessorItemSize(type) {
  return {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  }[type] || 1;
}

function normalizeGlbComponent(value, componentType) {
  if (componentType === 5120) {
    return Math.max(value / 127, -1);
  }
  if (componentType === 5121) {
    return value / 255;
  }
  if (componentType === 5122) {
    return Math.max(value / 32767, -1);
  }
  if (componentType === 5123) {
    return value / 65535;
  }

  return value;
}

function getGlbMaterialColor(gltf, materialIndex, spec) {
  const material = (gltf.materials || [])[materialIndex] || {};
  const pbr = material.pbrMetallicRoughness || {};
  const base = pbr.baseColorFactor || [0.72, 0.5, 0.32, 1];
  const tint = spec.tint || [1, 1, 1];

  return [0, 1, 2].map((channel) => clamp(base[channel] * (tint[channel] || 1), 0.04, 1));
}

function pushGlbModelVertex(vertices, position, normal, color, bounds, spec) {
  if (!position) {
    return;
  }

  const scale = spec.scale || 1;
  const localX = (position[0] - bounds.centerX) * scale;
  const localY = (position[1] - bounds.minY) * scale;
  const localZ = (position[2] - bounds.centerZ) * scale;
  const rotatedPosition = rotateVectorWithRadians(
    [localX, localY, localZ],
    degToRad(spec.rotationX || 0),
    degToRad(spec.rotationY || 0),
    degToRad(spec.rotationZ || 0)
  );
  const finalPosition = [
    spec.position[0] + rotatedPosition[0],
    spec.position[1] + rotatedPosition[1],
    spec.position[2] + rotatedPosition[2]
  ];
  const sourceNormal = normal || [0, 1, 0];
  const finalNormal = normalizeVector(rotateVectorWithRadians(
    sourceNormal,
    degToRad(spec.rotationX || 0),
    degToRad(spec.rotationY || 0),
    degToRad(spec.rotationZ || 0)
  ));

  pushVertex(vertices, finalPosition, [0, 0], color, finalNormal);
}

function createFurnitureMesh(gl, roles = [], modelVertices = [], showFallbackFurniture = true) {
  const vertices = [];
  const hasExternalModels = modelVertices.length > 0;

  if (hasExternalModels) {
    appendVertices(vertices, modelVertices);
  } else if (showFallbackFurniture) {
    addBox(vertices, 0, -1.58, -3.42, 4.75, 0.18, 2.05, [0.52, 0.27, 0.1]);
    addBox(vertices, -2.1, -2.36, -4.18, 0.2, 1.42, 0.2, [0.36, 0.18, 0.07]);
    addBox(vertices, 2.1, -2.36, -4.18, 0.2, 1.42, 0.2, [0.36, 0.18, 0.07]);
    addBox(vertices, -2.1, -2.36, -2.66, 0.2, 1.42, 0.2, [0.36, 0.18, 0.07]);
    addBox(vertices, 2.1, -2.36, -2.66, 0.2, 1.42, 0.2, [0.36, 0.18, 0.07]);
  }

  if (!hasExternalModels && showFallbackFurniture) {
    addBox(vertices, -3.55, -2.12, -2.05, 0.95, 0.35, 0.92, [0.45, 0.24, 0.1]);
    addBox(vertices, -3.55, -1.46, -2.42, 0.95, 0.92, 0.18, [0.38, 0.2, 0.09]);
    addBox(vertices, 3.55, -2.12, -2.05, 0.95, 0.35, 0.92, [0.45, 0.24, 0.1]);
    addBox(vertices, 3.55, -1.46, -2.42, 0.95, 0.92, 0.18, [0.38, 0.2, 0.09]);

    addBox(vertices, -7.55, -0.15, -1.1, 0.24, 2.55, 3.2, [0.42, 0.24, 0.11]);
    addBox(vertices, -7.3, 0.75, -1.1, 0.28, 0.16, 3.0, [0.31, 0.16, 0.07]);
    addBox(vertices, -7.3, -0.15, -1.1, 0.28, 0.16, 3.0, [0.31, 0.16, 0.07]);
    addBox(vertices, 7.55, -0.15, -1.6, 0.24, 2.55, 3.2, [0.42, 0.24, 0.11]);
    addBox(vertices, 7.3, 0.75, -1.6, 0.28, 0.16, 3.0, [0.31, 0.16, 0.07]);
    addBox(vertices, 7.3, -0.15, -1.6, 0.28, 0.16, 3.0, [0.31, 0.16, 0.07]);
  }

  addCalligraphyDecor(vertices);
  addCustomMainSceneObjects(vertices);

  roles
    .filter((role) => role.visible)
    .forEach((role) => addRoleFigure(vertices, role));

  return createMesh(gl, vertices, null);
}

function appendVertices(target, source) {
  for (let i = 0; i < source.length; i += 1) {
    target.push(source[i]);
  }
}

function appendTransformedVertices(target, source, transform) {
  const scale = Number(transform.scale || 1);
  const rx = degToRad(transform.rx || 0);
  const ry = degToRad(transform.ry || 0);
  const rz = degToRad(transform.rz || 0);

  for (let i = 0; i < source.length; i += 11) {
    const rotatedPosition = rotateVectorWithRadians(
      [source[i] * scale, source[i + 1] * scale, source[i + 2] * scale],
      rx,
      ry,
      rz
    );
    const rotatedNormal = normalizeVector(rotateVectorWithRadians(
      [source[i + 8], source[i + 9], source[i + 10]],
      rx,
      ry,
      rz
    ));

    target.push(
      transform.x + rotatedPosition[0],
      transform.y + rotatedPosition[1],
      transform.z + rotatedPosition[2],
      source[i + 3],
      source[i + 4],
      source[i + 5],
      source[i + 6],
      source[i + 7],
      rotatedNormal[0],
      rotatedNormal[1],
      rotatedNormal[2]
    );
  }
}

function rotateVectorWithRadians(vector, rx, ry, rz) {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);

  const x1 = vector[0];
  const y1 = vector[1] * cx - vector[2] * sx;
  const z1 = vector[1] * sx + vector[2] * cx;
  const x2 = x1 * cy - z1 * sy;
  const y2 = y1;
  const z2 = x1 * sy + z1 * cy;

  return [
    x2 * cz - y2 * sz,
    x2 * sz + y2 * cz,
    z2
  ];
}

function addCalligraphyDecor(vertices) {
  MAIN_DECOR_OBJECTS.forEach((spec) => {
    const state = getMainSceneObjectStateById(spec.id);
    const localVertices = [];

    if (!state || state.deleted || state.hidden) {
      return;
    }

    spec.draw(localVertices);
    appendTransformedVertices(vertices, localVertices, state);
  });
}

function addCustomMainSceneObjects(vertices) {
  mainSceneLayout.customObjects.forEach((spec) => {
    const saved = mainSceneLayout.objects[spec.id] || {};
    const color = hexToRgb(spec.color);
    const localVertices = [];
    const state = {
      x: readMainNumber(saved.x, spec.position[0]),
      y: readMainNumber(saved.y, spec.position[1]),
      z: readMainNumber(saved.z, spec.position[2]),
      rx: readMainNumber(saved.rx, spec.rotation[0]),
      ry: readMainNumber(saved.ry, spec.rotation[1]),
      rz: readMainNumber(saved.rz, spec.rotation[2]),
      scale: readMainNumber(saved.scale, spec.scale),
      deleted: saved.deleted === true,
      hidden: saved.hidden === true
    };

    if (state.deleted || state.hidden) {
      return;
    }

    if (spec.type === "cylinder") {
      addCylinder(
        localVertices,
        0,
        0,
        0,
        readMainNumber(spec.size.radius, 0.38),
        readMainNumber(spec.size.height, 0.9),
        color,
        28
      );
    } else {
      const width = readMainNumber(spec.size.width, spec.type === "plane" ? 1.4 : 0.8);
      const height = readMainNumber(spec.size.height, spec.type === "plane" ? 0.08 : 0.8);
      const depth = readMainNumber(spec.size.depth, spec.type === "plane" ? 0.9 : 0.8);
      addBox(localVertices, 0, 0, 0, width, height, depth, color);
    }

    appendTransformedVertices(vertices, localVertices, state);
  });
}

function addWallScroll(vertices, face, x, y, z, width, height, paperColor) {
  const rod = [0.33, 0.17, 0.07];
  const ink = [0.08, 0.07, 0.055];
  const seal = [0.72, 0.17, 0.12];
  const thin = 0.045;
  const isSide = face === "left" || face === "right";
  const isBack = face === "back";
  const wallOffset = face === "right" ? -thin / 2 : thin / 2;
  const panelX = isSide ? x + wallOffset : x;
  const panelZ = isSide ? z : z + (isBack ? -thin / 2 : thin / 2);

  if (isSide) {
    addBox(vertices, panelX, y, panelZ, thin, height, width, paperColor);
    addBox(vertices, panelX, y + height / 2 + 0.08, panelZ, thin * 1.6, 0.07, width + 0.18, rod);
    addBox(vertices, panelX, y - height / 2 - 0.08, panelZ, thin * 1.6, 0.07, width + 0.18, rod);
    addBox(vertices, panelX, y + 0.34, panelZ, thin * 1.9, height * 0.48, 0.08, ink);
    addBox(vertices, panelX, y - 0.26, panelZ + width * 0.13, thin * 1.9, height * 0.38, 0.07, ink);
    addBox(vertices, panelX, y - height * 0.28, panelZ - width * 0.22, thin * 2.1, 0.18, 0.18, seal);
    return;
  }

  addBox(vertices, panelX, y, panelZ, width, height, thin, paperColor);
  addBox(vertices, panelX, y + height / 2 + 0.08, panelZ, width + 0.18, 0.07, thin * 1.6, rod);
  addBox(vertices, panelX, y - height / 2 - 0.08, panelZ, width + 0.18, 0.07, thin * 1.6, rod);
  addBox(vertices, panelX - width * 0.12, y + 0.34, panelZ, 0.08, height * 0.48, thin * 1.9, ink);
  addBox(vertices, panelX + width * 0.1, y - 0.2, panelZ, 0.07, height * 0.34, thin * 1.9, ink);
  addBox(vertices, panelX + width * 0.22, y - height * 0.28, panelZ, 0.18, 0.18, thin * 2.1, seal);
}

function addBrushRack(vertices, x, y, z) {
  const wood = [0.34, 0.18, 0.07];
  const handle = [0.62, 0.38, 0.16];
  const bristle = [0.08, 0.06, 0.045];

  addBox(vertices, x, y + 0.48, z, 1.12, 0.06, 0.08, wood);
  addBox(vertices, x - 0.48, y + 0.18, z, 0.07, 0.66, 0.07, wood);
  addBox(vertices, x + 0.48, y + 0.18, z, 0.07, 0.66, 0.07, wood);
  addBox(vertices, x, y - 0.16, z, 1.08, 0.07, 0.22, wood);

  [-0.34, -0.12, 0.12, 0.34].forEach((offset, index) => {
    const length = 0.42 + index * 0.04;
    addBox(vertices, x + offset, y + 0.18, z + 0.04, 0.045, length, 0.045, handle);
    addBox(vertices, x + offset, y - length / 2 - 0.06, z + 0.04, 0.08, 0.13, 0.08, bristle);
  });
}

function addInkSet(vertices, x, y, z) {
  addCylinder(vertices, x, y + 0.05, z, 0.28, 0.1, [0.04, 0.035, 0.03], 24);
  addCylinder(vertices, x, y + 0.12, z, 0.19, 0.04, [0.015, 0.014, 0.013], 24);
  addBox(vertices, x + 0.55, y + 0.06, z - 0.06, 0.62, 0.055, 0.09, [0.12, 0.11, 0.09]);
  addBox(vertices, x + 0.55, y + 0.13, z - 0.06, 0.48, 0.045, 0.065, [0.82, 0.72, 0.54]);
}

function addCeramicJar(vertices, x, y, z, radius, color) {
  const dark = color.map((value) => value * 0.66);

  addCylinder(vertices, x, y + radius * 0.68, z, radius, radius * 1.35, color, 28);
  addCylinder(vertices, x, y + radius * 1.45, z, radius * 0.58, radius * 0.32, dark, 28);
  addCylinder(vertices, x, y + radius * 0.04, z, radius * 0.74, radius * 0.16, dark, 28);
}

function addLowDisplayStand(vertices, x, y, z) {
  addBox(vertices, x, y, z, 1.24, 0.12, 0.72, [0.28, 0.15, 0.07]);
  addBox(vertices, x - 0.48, y - 0.22, z - 0.24, 0.12, 0.34, 0.12, [0.2, 0.1, 0.045]);
  addBox(vertices, x + 0.48, y - 0.22, z - 0.24, 0.12, 0.34, 0.12, [0.2, 0.1, 0.045]);
  addBox(vertices, x - 0.48, y - 0.22, z + 0.24, 0.12, 0.34, 0.12, [0.2, 0.1, 0.045]);
  addBox(vertices, x + 0.48, y - 0.22, z + 0.24, 0.12, 0.34, 0.12, [0.2, 0.1, 0.045]);
}

function addRoleFigure(vertices, role) {
  const [x, baseY, z] = role.position;
  const scale = role.scale || 1;
  const color = hexToRgb(role.color);
  const dark = color.map((value) => value * 0.48);
  const light = color.map((value) => Math.min(1, value * 1.2 + 0.08));

  addBox(vertices, x, baseY + 0.08 * scale, z, 0.72 * scale, 0.08 * scale, 0.46 * scale, dark);
  addBox(vertices, x, baseY + 0.78 * scale, z, 0.42 * scale, 1.06 * scale, 0.28 * scale, color);
  addBox(vertices, x, baseY + 1.46 * scale, z, 0.34 * scale, 0.34 * scale, 0.34 * scale, light);
  addBox(vertices, x - 0.34 * scale, baseY + 0.78 * scale, z, 0.12 * scale, 0.78 * scale, 0.16 * scale, dark);
  addBox(vertices, x + 0.34 * scale, baseY + 0.78 * scale, z, 0.12 * scale, 0.78 * scale, 0.16 * scale, dark);
}

function hexToRgb(value) {
  const hex = String(value || "#39b88f").replace("#", "");
  const normalized = hex.length === 3
    ? hex.split("").map((char) => char + char).join("")
    : hex.padEnd(6, "0").slice(0, 6);
  const number = Number.parseInt(normalized, 16);

  if (Number.isNaN(number)) {
    return [0.22, 0.72, 0.56];
  }

  return [
    ((number >> 16) & 255) / 255,
    ((number >> 8) & 255) / 255,
    (number & 255) / 255
  ];
}

function buildQuad(topLeft, topRight, bottomRight, bottomLeft, color, normal) {
  const vertices = [];

  pushVertex(vertices, topLeft, [0, 1], color, normal);
  pushVertex(vertices, bottomLeft, [0, 0], color, normal);
  pushVertex(vertices, bottomRight, [1, 0], color, normal);
  pushVertex(vertices, topLeft, [0, 1], color, normal);
  pushVertex(vertices, bottomRight, [1, 0], color, normal);
  pushVertex(vertices, topRight, [1, 1], color, normal);

  return vertices;
}

function addBox(vertices, centerX, centerY, centerZ, width, height, depth, color) {
  const x1 = centerX - width / 2;
  const x2 = centerX + width / 2;
  const y1 = centerY - height / 2;
  const y2 = centerY + height / 2;
  const z1 = centerZ - depth / 2;
  const z2 = centerZ + depth / 2;

  vertices.push(...buildQuad([x1, y2, z1], [x2, y2, z1], [x2, y1, z1], [x1, y1, z1], color, [0, 0, 1]));
  vertices.push(...buildQuad([x2, y2, z2], [x1, y2, z2], [x1, y1, z2], [x2, y1, z2], color, [0, 0, -1]));
  vertices.push(...buildQuad([x1, y2, z2], [x1, y2, z1], [x1, y1, z1], [x1, y1, z2], color, [1, 0, 0]));
  vertices.push(...buildQuad([x2, y2, z1], [x2, y2, z2], [x2, y1, z2], [x2, y1, z1], color, [-1, 0, 0]));
  vertices.push(...buildQuad([x1, y2, z2], [x2, y2, z2], [x2, y2, z1], [x1, y2, z1], color, [0, 1, 0]));
  vertices.push(...buildQuad([x1, y1, z1], [x2, y1, z1], [x2, y1, z2], [x1, y1, z2], color, [0, -1, 0]));
}

function addCylinder(vertices, centerX, centerY, centerZ, radius, height, color, segments = 18) {
  const topY = centerY + height / 2;
  const bottomY = centerY - height / 2;

  for (let i = 0; i < segments; i += 1) {
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = ((i + 1) / segments) * Math.PI * 2;
    const x1 = centerX + Math.cos(a1) * radius;
    const z1 = centerZ + Math.sin(a1) * radius;
    const x2 = centerX + Math.cos(a2) * radius;
    const z2 = centerZ + Math.sin(a2) * radius;
    const normal1 = normalizeVector([Math.cos(a1), 0, Math.sin(a1)]);
    const normal2 = normalizeVector([Math.cos(a2), 0, Math.sin(a2)]);

    pushVertex(vertices, [x1, topY, z1], [0, 1], color, normal1);
    pushVertex(vertices, [x1, bottomY, z1], [0, 0], color, normal1);
    pushVertex(vertices, [x2, bottomY, z2], [1, 0], color, normal2);
    pushVertex(vertices, [x1, topY, z1], [0, 1], color, normal1);
    pushVertex(vertices, [x2, bottomY, z2], [1, 0], color, normal2);
    pushVertex(vertices, [x2, topY, z2], [1, 1], color, normal2);

    pushVertex(vertices, [centerX, topY, centerZ], [0.5, 0.5], color, [0, 1, 0]);
    pushVertex(vertices, [x2, topY, z2], [1, 1], color, [0, 1, 0]);
    pushVertex(vertices, [x1, topY, z1], [0, 1], color, [0, 1, 0]);

    pushVertex(vertices, [centerX, bottomY, centerZ], [0.5, 0.5], color, [0, -1, 0]);
    pushVertex(vertices, [x1, bottomY, z1], [0, 0], color, [0, -1, 0]);
    pushVertex(vertices, [x2, bottomY, z2], [1, 0], color, [0, -1, 0]);
  }
}

function pushVertex(vertices, position, uv, color, normal) {
  vertices.push(
    position[0], position[1], position[2],
    uv[0], uv[1],
    color[0], color[1], color[2],
    normal[0], normal[1], normal[2]
  );
}

function createMesh(gl, vertices, texture) {
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  return {
    buffer,
    texture,
    count: vertices.length / 11
  };
}

function drawRoomMesh(gl, locations, mesh, texture, useTexture) {
  const stride = 11 * Float32Array.BYTES_PER_ELEMENT;

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  gl.enableVertexAttribArray(locations.position);
  gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(locations.texCoord);
  gl.vertexAttribPointer(locations.texCoord, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(locations.color);
  gl.vertexAttribPointer(locations.color, 3, gl.FLOAT, false, stride, 5 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(locations.normal);
  gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, stride, 8 * Float32Array.BYTES_PER_ELEMENT);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1f(locations.useTexture, useTexture ? 1 : 0);
  gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
}

function resizeRoomCanvas(gl, canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function makeRoomViewMatrix(yawDegrees, pitchDegrees) {
  const yaw = degToRad(yawDegrees);
  const pitch = degToRad(pitchDegrees);
  const eye = [0, 0.25, 0.3];
  const direction = [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch)
  ];
  const target = [
    eye[0] + direction[0],
    eye[1] + direction[1],
    eye[2] + direction[2]
  ];

  return makeLookAtMatrix(eye, target, [0, 1, 0]);
}

function makePerspectiveMatrix(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  const rangeInv = 1 / (near - far);

  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  ]);
}

function makeLookAtMatrix(eye, target, up) {
  const zAxis = normalizeVector([
    eye[0] - target[0],
    eye[1] - target[1],
    eye[2] - target[2]
  ]);
  const xAxis = normalizeVector(crossVector(up, zAxis));
  const yAxis = crossVector(zAxis, xAxis);

  return new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dotVector(xAxis, eye), -dotVector(yAxis, eye), -dotVector(zAxis, eye), 1
  ]);
}

function crossVector(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dotVector(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalizeVector(value) {
  const length = Math.hypot(value[0], value[1], value[2]) || 1;

  return [
    value[0] / length,
    value[1] / length,
    value[2] / length
  ];
}

function degToRad(value) {
  return value * Math.PI / 180;
}

function initInfoPanelDrag() {
  const panel = els.infoPanel;
  const handle = els.infoPanelHandle;
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    isDragging = true;
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    panel.classList.add("is-dragging");
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.transform = "none";
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  handle.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    moveInfoPanel(event.clientX - offsetX, event.clientY - offsetY);
  });

  handle.addEventListener("pointerup", (event) => {
    isDragging = false;
    panel.classList.remove("is-dragging");

    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
  });

  handle.addEventListener("pointercancel", () => {
    isDragging = false;
    panel.classList.remove("is-dragging");
  });

  window.addEventListener("resize", keepInfoPanelInView);
}

function moveInfoPanel(left, top) {
  const rect = els.infoPanel.getBoundingClientRect();
  const margin = 12;
  const maxLeft = window.innerWidth - rect.width - margin;
  const maxTop = window.innerHeight - rect.height - margin;
  const nextLeft = clamp(left, margin, Math.max(margin, maxLeft));
  const nextTop = clamp(top, margin, Math.max(margin, maxTop));

  els.infoPanel.style.left = `${nextLeft}px`;
  els.infoPanel.style.top = `${nextTop}px`;
}

function keepInfoPanelInView() {
  const rect = els.infoPanel.getBoundingClientRect();

  if (!els.infoPanel.style.left || !els.infoPanel.style.top) {
    return;
  }

  moveInfoPanel(rect.left, rect.top);
}

function buildStepNavigation() {
  const fragment = document.createDocumentFragment();

  SCENES.forEach((scene, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", `切换到步骤 ${index + 1}: ${scene.title}`);
    button.addEventListener("click", () => loadScene(index));
    fragment.appendChild(button);
  });

  els.stepNav.appendChild(fragment);
}

function bindQuickControls() {
  els.quickPrev.addEventListener("click", goPrevious);
  els.quickHome.addEventListener("click", () => loadScene(0));
  els.quickModels.addEventListener("click", focusModelView);
  els.quickNext.addEventListener("click", goNext);
}

function bindLearningControls() {
  els.modeButtons.forEach((button) => {
    button.dataset.featureState = "real";
    button.addEventListener("click", () => {
      const mode = button.dataset.learningMode;
      stopLecturePlayback();
      const result = window.MRAppState?.setMode(mode);
      if (result?.message) {
        showNotice(result.message);
      }
      renderLearningState();
      loadScene(0);
    });
  });
}

function initPracticeCanvas() {
  const stats = window.MRAppState?.getStats?.();
  window.MRPracticeCanvas?.init?.({
    canvas: els.practiceCanvas,
    statusEl: els.practiceCanvasStatus,
    undoButton: els.practiceUndo,
    clearButton: els.practiceClear,
    replayButton: els.practiceReplay,
    glyph: stats?.glyph || "永"
  });

  if (stats?.latestSession?.status === "active" && stats.latestSession.strokes?.length) {
    window.MRPracticeCanvas?.loadStrokes?.(stats.latestSession.strokes);
  }
}

function bindReviewControls() {
  els.reviewReplay?.addEventListener("click", replayLatestArtwork);
  els.reviewDownloadImage?.addEventListener("click", downloadLatestArtworkImage);
  els.reviewDownloadReport?.addEventListener("click", downloadLatestReport);
}

function bindHistoryControls() {
  els.historyFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeHistoryFilter = button.dataset.historyFilter || "all";
      renderHistoryPanel(currentIndex);
    });
  });
  els.historyList?.addEventListener("click", handleHistoryListClick);
  els.historyDetailClose?.addEventListener("click", () => {
    activeHistoryDetailId = null;
    renderHistoryDetail();
    renderHistoryPanel(currentIndex);
  });
  els.historyDetailRename?.addEventListener("click", renameHistoryDetail);
  els.historyDetailReplay?.addEventListener("click", replayHistoryDetail);
  els.historyDetailDownloadImage?.addEventListener("click", downloadHistoryDetailImage);
  els.historyDetailDownloadReport?.addEventListener("click", downloadHistoryDetailReport);
  els.historyDetailDelete?.addEventListener("click", deleteHistoryDetail);
  els.historyDownloadArchive?.addEventListener("click", () => {
    const result = window.MRAppState?.downloadArchive?.();
    if (result?.message) {
      showNotice(result.message);
    }
  });
}

function bindPlanControls() {
  els.planItemList?.addEventListener("change", (event) => {
    const input = event.target.closest("[data-plan-item-id]");
    if (!input) return;
    const planId = input.dataset.planId;
    const itemId = input.dataset.planItemId;
    const result = window.MRAppState?.togglePlanItem?.(planId, itemId, input.checked);
    if (result?.message) {
      showNotice(result.message);
    }
    renderPlanPanel(currentIndex);
    updateSceneText(currentIndex);
    updatePathPanel(currentIndex);
  });
}

function renderLearningState() {
  renderLearningStateSummary();
  updateSceneText(currentIndex);
  updateInteractionPanel(currentIndex, activePointIndex);
  updatePathPanel(currentIndex);
  renderLecturePanel(currentIndex);
  renderReviewPanel(currentIndex);
  renderHistoryPanel(currentIndex);
  renderPlanPanel(currentIndex);
}

function renderLearningStateSummary() {
  const stats = window.MRAppState?.getStats?.();
  if (!stats) {
    return;
  }

  els.modeButtons.forEach((button) => {
    const isActive = button.dataset.learningMode === stats.activeMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (els.glyphValue) {
    els.glyphValue.textContent = stats.glyph;
  }
  window.MRPracticeCanvas?.setGlyph?.(stats.glyph);

  if (els.learningStateSummary) {
    const trainingLabel = stats.trainingMode === "compare" ? "对比" : "示范";
    els.learningStateSummary.textContent = `${stats.modeLabel} / ${stats.glyph}字 / ${stats.copybook} / ${stats.sessionCount}次练习 / ${stats.artworkCount}幅作品 / ${trainingLabel}模式`;
  }
}

function renderLecturePanel(sceneIndex = currentIndex) {
  if (!els.lecturePanel || !window.MRAppState?.getLectureProgress) {
    return;
  }

  const progress = window.MRAppState.getLectureProgress();
  const shouldShow = sceneIndex === 2 || progress.status !== "idle";
  els.lecturePanel.hidden = !shouldShow;
  if (!shouldShow) {
    return;
  }

  const statusLabel = progress.status === "complete"
    ? "已完成"
    : progress.status === "playing"
      ? "播放中"
      : "待讲解";
  els.lectureTitle.textContent = progress.currentStep?.title || "讲解待开始";
  els.lectureStatusLabel.textContent = statusLabel;
  els.lectureProgressFill.style.width = `${progress.progressPercent}%`;
  els.lectureBody.textContent = progress.currentStep?.body || "选择讲解后显示当前段落。";
  els.lectureStepList.innerHTML = "";

  progress.steps.forEach((step, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = step.title;
    const isDone = progress.status === "complete" || index < progress.completedSteps - 1;
    const isCurrent = progress.status !== "idle" && index === progress.stepIndex;
    button.classList.toggle("is-done", isDone);
    button.classList.toggle("is-current", isCurrent);
    button.title = step.body;
    button.disabled = true;
    els.lectureStepList.appendChild(button);
  });
}

function startLecturePlayback() {
  const appState = window.MRAppState;
  if (!appState?.startLecture || !appState?.advanceLecture) {
    return { ok: false, message: "AI 讲解状态层尚未初始化。" };
  }
  if (lecturePlaybackTimer) {
    return { ok: false, message: "AI 讲解正在播放中，请稍候。" };
  }

  const result = appState.startLecture();
  renderLearningStateSummary();
  renderLecturePanel(currentIndex);
  updateSceneText(currentIndex);
  updatePathPanel(currentIndex);
  scheduleLectureAdvance();
  return {
    ...result,
    message: `${result.message} 正在按段播放。`
  };
}

function scheduleLectureAdvance() {
  const progress = window.MRAppState?.getLectureProgress?.();
  if (!progress || progress.status === "complete") {
    stopLecturePlayback();
    return;
  }

  lecturePlaybackTimer = window.setTimeout(() => {
    lecturePlaybackTimer = null;
    const result = window.MRAppState?.advanceLecture?.();
    renderLearningStateSummary();
    renderLecturePanel(currentIndex);
    updateSceneText(currentIndex);
    updatePathPanel(currentIndex);
    if (result?.message) {
      els.actionFeedback.textContent = result.message;
    }
    if (result?.lecture?.status === "complete") {
      showNotice("AI 讲解已完成，进度已保存。");
      return;
    }
    scheduleLectureAdvance();
  }, LECTURE_PLAYBACK_STEP_MS);
}

function stopLecturePlayback() {
  if (lecturePlaybackTimer) {
    window.clearTimeout(lecturePlaybackTimer);
    lecturePlaybackTimer = null;
  }
}

function renderReviewPanel(sceneIndex = currentIndex) {
  if (!els.reviewPanel || !window.MRAppState?.getLatestReview) {
    return;
  }

  const review = window.MRAppState.getLatestReview();
  const artwork = review.artwork;
  const session = review.session;
  const report = review.report;
  const shouldShow = Boolean(artwork || report || sceneIndex >= 6);
  els.reviewPanel.hidden = !shouldShow;
  if (!shouldShow) {
    return;
  }

  const feedback = artwork?.feedback?.length ? artwork.feedback : session?.feedback || [];
  els.reviewTitle.textContent = artwork?.title || "暂无作品";
  els.reviewStatus.textContent = report ? "报告已生成" : artwork ? "可复盘" : "待保存";
  els.reviewScore.textContent = artwork ? `${artwork.score}` : session ? `${session.score}` : "-";
  els.reviewStrokeCount.textContent = String(artwork?.strokeCount || session?.strokeCount || 0);
  els.reviewPointCount.textContent = String(artwork?.pointCount || session?.pointCount || 0);

  const hasImage = Boolean(artwork?.imageData);
  if (els.reviewArtworkImage) {
    els.reviewArtworkImage.hidden = !hasImage;
    if (hasImage) {
      els.reviewArtworkImage.src = artwork.imageData;
    } else {
      els.reviewArtworkImage.removeAttribute("src");
    }
  }
  if (els.reviewEmpty) {
    els.reviewEmpty.hidden = hasImage;
    els.reviewEmpty.textContent = artwork
      ? "该作品没有截图，可回放已保存的笔迹。"
      : "保存作品后会在这里显示截图、评分和笔迹反馈。";
  }

  els.reviewFeedback.innerHTML = "";
  (feedback.length ? feedback : ["完成一次书写并保存作品后，会显示针对笔迹的复盘建议。"]).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    els.reviewFeedback.appendChild(li);
  });

  const hasStrokes = Boolean(session?.strokes?.length);
  els.reviewReplay.disabled = !hasStrokes;
  els.reviewDownloadImage.disabled = !hasImage;
  els.reviewDownloadReport.disabled = !report;
}

function replayLatestArtwork() {
  const review = window.MRAppState?.getLatestReview?.();
  const strokes = review?.session?.strokes || [];
  if (!strokes.length) {
    showNotice("还没有可回放的作品笔迹。");
    return;
  }
  window.MRPracticeCanvas?.loadStrokes?.(strokes);
  window.MRPracticeCanvas?.replay?.();
  showNotice("正在回放最近保存的作品笔迹。");
}

function downloadLatestArtworkImage() {
  const artwork = window.MRAppState?.getLatestReview?.()?.artwork;
  if (!artwork?.imageData) {
    showNotice("还没有可下载的作品图片。");
    return;
  }
  downloadDataUrl(artwork.imageData, `${sanitizeFilename(artwork.title)}.jpg`);
  showNotice("已下载最近保存的作品图片。");
}

function downloadLatestReport() {
  const result = window.MRAppState?.downloadReport?.();
  if (result?.message) {
    showNotice(result.message);
  }
}

async function exportPracticeReplayVideo() {
  if (!window.MRPracticeCanvas?.exportReplayVideo) {
    return { ok: false, message: "书写画布尚未初始化，无法导出视频。" };
  }
  if (isReplayVideoExporting) {
    return { ok: false, message: "书写回放视频正在生成中，请稍候。" };
  }

  const source = getPracticeVideoSource();
  if (!source.strokes.length) {
    return { ok: false, message: "请先在练习格中书写，或保存一条带笔迹的作品后再生成视频。" };
  }

  isReplayVideoExporting = true;
  try {
    if (source.source === "当前练习") {
      recordLivePracticeIfAvailable({ allowCreate: true });
    } else {
      window.MRPracticeCanvas.loadStrokes?.(source.strokes);
    }

    const result = await window.MRPracticeCanvas.exportReplayVideo({
      strokes: source.strokes,
      glyph: source.glyph
    });
    if (!result?.ok || !result.blob) {
      return result || { ok: false, message: "视频导出失败。" };
    }

    const filename = `mr-calligraphy-replay-${sanitizeFilename(source.glyph)}-${Date.now()}.webm`;
    downloadBlob(result.blob, filename);
    return {
      ok: true,
      message: `${result.message} 已下载：${filename}。`,
      notice: `已导出${source.source}回放视频。`
    };
  } finally {
    isReplayVideoExporting = false;
  }
}

function getPracticeVideoSource() {
  const liveStrokes = window.MRPracticeCanvas?.getStrokes?.() || [];
  const stats = window.MRAppState?.getStats?.();
  if (liveStrokes.length) {
    return {
      source: "当前练习",
      glyph: stats?.glyph || "永",
      strokes: liveStrokes
    };
  }

  const review = window.MRAppState?.getLatestReview?.();
  const session = review?.session;
  if (session?.strokes?.length) {
    return {
      source: "最近作品",
      glyph: session.glyph || stats?.glyph || "永",
      strokes: session.strokes
    };
  }

  return { source: "空记录", glyph: stats?.glyph || "永", strokes: [] };
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function sanitizeFilename(name) {
  return String(name || "mr-calligraphy-artwork")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 64) || "mr-calligraphy-artwork";
}

function renderHistoryPanel(sceneIndex = currentIndex) {
  if (!els.historyPanel || !window.MRAppState?.getHistory) {
    return;
  }

  const history = window.MRAppState.getHistory({ filter: activeHistoryFilter, limit: 8 });
  const shouldShow = history.total > 0 || sceneIndex >= 6;
  els.historyPanel.hidden = !shouldShow;
  if (!shouldShow) {
    return;
  }

  els.historyFilterButtons.forEach((button) => {
    const isActive = button.dataset.historyFilter === activeHistoryFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  const summary = history.summary;
  els.historySummary.textContent = history.total
    ? `${summary.practiceCount} 次练习 / ${summary.artworkCount} 幅作品 / ${summary.reportCount} 份报告 / 平均 ${summary.averageScore} 分`
    : "暂无记录";
  els.historyDownloadArchive.disabled = history.total === 0;

  renderHistoryTrend(history.trend);
  renderHistoryList(history.entries, history.filteredTotal);
  renderHistoryDetail();
}

function renderPlanPanel(sceneIndex = currentIndex) {
  if (!els.planPanel || !window.MRAppState?.getLatestPlan) {
    return;
  }

  const plan = window.MRAppState.getLatestPlan();
  const shouldShow = Boolean(plan || sceneIndex >= 8);
  els.planPanel.hidden = !shouldShow;
  if (!shouldShow) {
    return;
  }

  const progress = plan?.progress || { done: 0, total: 0, percent: 0 };
  els.planTitle.textContent = plan?.title || "暂无计划";
  els.planProgressLabel.textContent = `${progress.done}/${progress.total}`;
  els.planProgressFill.style.width = `${progress.percent}%`;
  els.planSummary.textContent = plan?.summary || "点击“制定计划”后会生成可勾选任务。";
  els.planItemList.innerHTML = "";

  if (!plan?.items?.length) {
    const empty = document.createElement("p");
    empty.className = "plan-empty";
    empty.textContent = "还没有学习计划。";
    els.planItemList.appendChild(empty);
    return;
  }

  plan.items.forEach((item) => {
    const label = document.createElement("label");
    label.className = "plan-item";
    label.classList.toggle("is-done", item.done);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done === true;
    checkbox.dataset.planId = plan.id;
    checkbox.dataset.planItemId = item.id;

    const body = document.createElement("span");
    const title = document.createElement("strong");
    const detail = document.createElement("small");
    title.textContent = item.title;
    detail.textContent = item.detail || "完成后勾选，进度会保存到本机。";
    body.append(title, detail);
    label.append(checkbox, body);
    els.planItemList.appendChild(label);
  });
}

function renderHistoryTrend(trend) {
  if (!els.historyTrend) return;
  els.historyTrend.innerHTML = "";

  if (!trend.length) {
    const empty = document.createElement("p");
    empty.textContent = "保存作品后会显示分数趋势。";
    els.historyTrend.appendChild(empty);
    return;
  }

  trend.forEach((item) => {
    const bar = document.createElement("span");
    const height = clamp(Number(item.score) || 0, 8, 100);
    bar.className = `history-trend-bar is-${item.type}`;
    bar.style.height = `${height}%`;
    bar.title = `${item.label} ${item.score}分`;
    bar.setAttribute("aria-label", `${item.label} ${item.score}分`);
    els.historyTrend.appendChild(bar);
  });
}

function renderHistoryList(entries, filteredTotal) {
  if (!els.historyList) return;
  els.historyList.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = filteredTotal ? "没有更多记录。" : "当前筛选下暂无记录。";
    els.historyList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `history-item is-${entry.type}`;
    item.dataset.historyId = entry.id;
    item.classList.toggle("is-active", activeHistoryDetailId === entry.id);
    item.setAttribute("aria-pressed", activeHistoryDetailId === entry.id ? "true" : "false");
    const body = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");
    const score = document.createElement("em");

    title.textContent = entry.title;
    meta.textContent = `${formatHistoryTime(entry.createdAt)} / ${entry.meta}`;
    score.textContent = entry.score ? `${entry.score}分` : entry.status;
    body.append(title, meta);
    item.append(body, score);
    els.historyList.appendChild(item);
  });
}

function handleHistoryListClick(event) {
  const item = event.target.closest("[data-history-id]");
  if (!item) return;
  activeHistoryDetailId = item.dataset.historyId;
  renderHistoryPanel(currentIndex);
}

function renderHistoryDetail() {
  if (!els.historyDetail || !window.MRAppState?.getHistoryDetail) {
    return;
  }

  const detail = activeHistoryDetailId
    ? window.MRAppState.getHistoryDetail(activeHistoryDetailId)
    : null;

  if (!detail) {
    els.historyDetail.hidden = true;
    setHistoryDetailActions(null);
    return;
  }

  els.historyDetail.hidden = false;
  if (els.historyDetailType) {
    els.historyDetailType.textContent = getHistoryDetailTypeLabel(detail.type);
  }
  if (els.historyDetailTitle) {
    els.historyDetailTitle.textContent = detail.title;
  }
  renderHistoryDetailBody(detail);
  setHistoryDetailActions(detail);
}

function renderHistoryDetailBody(detail) {
  if (!els.historyDetailBody) return;
  els.historyDetailBody.innerHTML = "";

  const summary = document.createElement("p");
  summary.className = "history-detail-summary";
  summary.textContent = `${formatHistoryTime(detail.createdAt)} / ${detail.summary || detail.status}`;
  els.historyDetailBody.appendChild(summary);

  const stats = document.createElement("div");
  stats.className = "history-detail-stats";
  getHistoryDetailStats(detail).forEach(([label, value]) => {
    const item = document.createElement("span");
    const name = document.createElement("small");
    const data = document.createElement("strong");
    name.textContent = label;
    data.textContent = String(value);
    item.append(name, data);
    stats.appendChild(item);
  });
  els.historyDetailBody.appendChild(stats);

  if (detail.imageData) {
    const image = document.createElement("img");
    image.className = "history-detail-image";
    image.src = detail.imageData;
    image.alt = detail.title;
    els.historyDetailBody.appendChild(image);
  }

  const feedback = detail.recommendations || detail.feedback || [];
  const list = document.createElement("ul");
  list.className = "history-detail-feedback";
  (feedback.length ? feedback : ["该记录暂无详细建议。"]).slice(0, 6).forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  });
  els.historyDetailBody.appendChild(list);
}

function getHistoryDetailStats(detail) {
  if (detail.type === "report") {
    return [
      ["练习", `${detail.sessionCount || 0}次`],
      ["作品", `${detail.artworkCount || 0}幅`],
      ["平均", `${detail.averageScore || 0}分`],
      ["分钟", `${detail.learningMinutes || 0}`]
    ];
  }

  if (detail.type === "artwork") {
    return [
      ["评分", `${detail.score || 0}分`],
      ["风格", detail.style || "-"],
      ["笔画", `${detail.strokeCount || 0}`],
      ["采样", `${detail.pointCount || 0}`]
    ];
  }

  return [
    ["评分", `${detail.score || 0}分`],
    ["字", detail.glyph || "-"],
    ["笔画", `${detail.strokeCount || 0}`],
    ["采样", `${detail.pointCount || 0}`]
  ];
}

function getHistoryDetailTypeLabel(type) {
  if (type === "artwork") return "作品详情";
  if (type === "report") return "报告详情";
  return "练习详情";
}

function setHistoryDetailActions(detail) {
  const hasStrokes = Boolean(detail?.strokes?.length);
  const hasImage = Boolean(detail?.imageData);
  const hasReport = detail?.type === "report";
  const hasDetail = Boolean(detail);
  if (els.historyDetailRename) els.historyDetailRename.disabled = !hasDetail;
  if (els.historyDetailReplay) els.historyDetailReplay.disabled = !hasStrokes;
  if (els.historyDetailDownloadImage) els.historyDetailDownloadImage.disabled = !hasImage;
  if (els.historyDetailDownloadReport) els.historyDetailDownloadReport.disabled = !hasReport;
  if (els.historyDetailDelete) els.historyDetailDelete.disabled = !hasDetail;
}

function getActiveHistoryDetail() {
  if (!activeHistoryDetailId || !window.MRAppState?.getHistoryDetail) {
    return null;
  }
  return window.MRAppState.getHistoryDetail(activeHistoryDetailId);
}

function renameHistoryDetail() {
  const detail = getActiveHistoryDetail();
  if (!detail) {
    showNotice("请选择一条记录。");
    return;
  }

  const title = window.prompt("输入新的记录标题", detail.title);
  if (title === null) {
    return;
  }

  const result = window.MRAppState?.renameHistoryRecord?.(detail.id, title);
  if (result?.ok) {
    activeHistoryDetailId = result.detail?.id || detail.id;
    renderHistoryPanel(currentIndex);
    renderReviewPanel(currentIndex);
    showNotice(result.message);
    return;
  }
  showNotice(result?.message || "重命名失败。");
}

function deleteHistoryDetail() {
  const detail = getActiveHistoryDetail();
  if (!detail) {
    showNotice("请选择一条记录。");
    return;
  }

  const confirmed = window.confirm(`确定删除“${detail.title}”吗？此操作会写入本机学习档案。`);
  if (!confirmed) {
    return;
  }

  const result = window.MRAppState?.deleteHistoryRecord?.(detail.id);
  if (result?.ok) {
    activeHistoryDetailId = null;
    renderLearningStateSummary();
    renderReviewPanel(currentIndex);
    renderHistoryPanel(currentIndex);
    updatePathPanel(currentIndex);
    updateSceneText(currentIndex);
    showNotice(result.message);
    return;
  }
  showNotice(result?.message || "删除失败。");
}

function replayHistoryDetail() {
  const detail = getActiveHistoryDetail();
  const strokes = detail?.strokes || [];
  if (!strokes.length) {
    showNotice("这条记录没有可回放的笔迹。");
    return;
  }
  window.MRPracticeCanvas?.loadStrokes?.(strokes);
  window.MRPracticeCanvas?.replay?.();
  showNotice(`正在回放：${detail.title}`);
}

function downloadHistoryDetailImage() {
  const detail = getActiveHistoryDetail();
  if (!detail?.imageData) {
    showNotice("这条记录没有可下载的图片。");
    return;
  }
  downloadDataUrl(detail.imageData, `${sanitizeFilename(detail.title)}.jpg`);
  showNotice("已下载所选历史作品图片。");
}

function downloadHistoryDetailReport() {
  const detail = getActiveHistoryDetail();
  if (detail?.type !== "report") {
    showNotice("请选择一条报告记录。");
    return;
  }
  const result = window.MRAppState?.downloadReport?.(detail.id);
  if (result?.message) {
    showNotice(result.message);
  }
}

function formatHistoryTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未知时间";
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

function focusModelView() {
  cubeYaw = 0;
  cubePitch = 2;
  cubeScale = 0.78;
  updateCubeTransform();
  document.body.classList.add("is-model-view");
  window.clearTimeout(focusModelView.hideTimer);
  focusModelView.hideTimer = window.setTimeout(() => {
    document.body.classList.remove("is-model-view");
  }, 60000);
  showNotice("模型展示模式：已临时淡出教学面板，前方可查看木墙、门窗、书架、桌椅、盆栽、灯具和书法装饰。");
}

function buildPathList() {
  const fragment = document.createDocumentFragment();

  SCENES.forEach((scene, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "path-item";
    button.setAttribute("aria-label", `跳转到步骤 ${index + 1}: ${scene.title}`);
    button.innerHTML = `
      <span class="path-item-index">${index + 1}</span>
      <span class="path-item-name">${getShortSceneName(scene.title)}</span>
      <span class="path-item-state">待学习</span>
    `;
    button.addEventListener("click", () => loadScene(index));
    fragment.appendChild(button);
  });

  els.pathList.appendChild(fragment);
}

function loadScene(index) {
  if (index < 0 || index >= SCENES.length) {
    return;
  }

  currentIndex = index;
  activePointIndex = 0;

  updateSceneText(index);
  updateStepNavigation(index);
  updateInteractionPanel(index, 0);
  renderLecturePanel(index);
  renderReviewPanel(index);
  renderHistoryPanel(index);
  renderPlanPanel(index);
  hideError();
  hideNotice();
}

function selectPoint(pointIndex) {
  activePointIndex = pointIndex;
  updateInteractionPanel(currentIndex, pointIndex);
}

function goPrevious() {
  if (currentIndex > 0) {
    loadScene(currentIndex - 1);
    return;
  }

  if (WRAP_STEPS) {
    loadScene(SCENES.length - 1);
  }
}

function goNext() {
  if (currentIndex < SCENES.length - 1) {
    loadScene(currentIndex + 1);
    return;
  }

  if (WRAP_STEPS) {
    loadScene(0);
  }
}

function handleKeyboardSceneChange(event) {
  if (IS_MAIN_SCENE_ADMIN) {
    return;
  }

  const tagName = event.target.tagName;
  const isTyping = tagName === "INPUT" || tagName === "TEXTAREA" || event.target.isContentEditable;

  if (isTyping) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    event.stopPropagation();
    goPrevious();
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    event.stopPropagation();
    goNext();
  }

  if (/^[1-9]$/.test(event.key)) {
    loadScene(Number(event.key) - 1);
  }

  if (event.key === "0") {
    loadScene(9);
  }
}

function getCurrentPracticeResult(options = {}) {
  const result = window.MRPracticeCanvas?.getResult?.({ includeImage: options.includeImage !== false });
  if (!result) {
    return null;
  }

  if (options.requireStrokes && result.strokeCount <= 0) {
    return null;
  }

  return result;
}

function recordLivePracticeIfAvailable(options = {}) {
  const result = getCurrentPracticeResult({ includeImage: false, requireStrokes: true });
  if (!result || !window.MRAppState?.recordPracticeResult) {
    return null;
  }
  if (!options.allowCreate && !window.MRAppState.getState?.().currentSessionId) {
    return null;
  }
  return window.MRAppState.recordPracticeResult(result);
}

function getLearningSceneMetrics(index) {
  const scene = SCENES[index];
  const stats = window.MRAppState?.getStats?.();
  if (!stats) {
    return scene.metrics;
  }

  const latestSession = stats.latestSession;
  const latestArtwork = stats.latestArtwork;
  const latestReport = stats.latestReport;
  const latestPlan = stats.latestPlan;
  const planProgress = latestPlan?.progress;
  const livePractice = getCurrentPracticeResult({ includeImage: false, requireStrokes: false });
  const hasLivePractice = livePractice && livePractice.strokeCount > 0;
  const metrics = hasLivePractice ? livePractice.metrics : latestSession?.metrics || {};
  const score = hasLivePractice ? livePractice.score : latestSession?.score || stats.averageScore;
  const lectureLabel = stats.lectureStatus === "complete"
    ? "已完成"
    : stats.lectureStatus === "playing"
      ? "播放中"
      : "未开始";
  const lectureProgress = stats.lectureProgress || window.MRAppState?.getLectureProgress?.();
  const trainingLabel = stats.trainingMode === "compare" ? "对比模式" : "示范模式";

  switch (index) {
    case 0:
      return [
        ["综合评分", `${stats.averageScore}分`],
        ["当前模式", stats.modeLabel],
        ["练习次数", `${stats.sessionCount}次`],
        ["作品", `${stats.artworkCount}幅`],
        ["报告", `${stats.reportCount}份`]
      ];
    case 1:
      return [
        ["学习时长", `${stats.learningMinutes}分钟`],
        ["完成练习", `${stats.savedSessionCount}次`],
        ["当前字", stats.glyph],
        ["碑帖", stats.copybook],
        ["连续学习", stats.sessionCount > 0 ? "1天" : "0天"]
      ];
    case 2:
      return [
        ["讲解状态", lectureLabel],
        ["讲解进度", `${lectureProgress?.progressPercent || 0}%`],
        ["当前段落", lectureProgress?.currentStep?.title || "待开始"],
        ["字帖", stats.copybook],
        ["学习模式", stats.modeLabel]
      ];
    case 3:
      return [
        ["综合评分", `${score}分`],
        ["结构", String(metrics.structure || 88)],
        ["笔画", String(metrics.stroke || 85)],
        ["笔法", String(metrics.technique || 87)],
        ["模式", trainingLabel]
      ];
    case 4:
      return [
        ["当前笔画", stats.activeStroke],
        ["进度", `${(window.MRAppState?.strokes || []).indexOf(stats.activeStroke) + 1 || 1}/8`],
        ["采样点", hasLivePractice ? `${livePractice.pointCount}个` : "未书写"],
        ["笔画数", hasLivePractice ? `${livePractice.strokeCount}笔` : "0笔"],
        ["模式", trainingLabel]
      ];
    case 5:
      return [
        ["作品名称", latestArtwork?.title || `${stats.glyph}字创作`],
        ["风格", latestArtwork?.style || "楷书"],
        ["作品数量", `${stats.artworkCount}幅`],
        ["碑帖", stats.copybook],
        ["综合评分", `${latestArtwork?.score || score}分`]
      ];
    case 6:
      return [
        ["学习时长", `${stats.learningMinutes}分钟`],
        ["练习次数", `${stats.sessionCount}次`],
        ["保存作品", `${stats.artworkCount}幅`],
        ["报告数量", `${stats.reportCount}份`],
        ["平均评分", `${stats.averageScore}分`]
      ];
    case 7:
      return [
        ["作品", latestArtwork?.title || "暂无作品"],
        ["复盘会话", `${stats.savedSessionCount}次`],
        ["最近风格", latestArtwork?.style || "未保存"],
        ["平均评分", `${stats.averageScore}分`],
        ["作品数", `${stats.artworkCount}幅`]
      ];
    case 8:
      return [
        ["练习次数", `${stats.sessionCount}次`],
        ["练习字数", `${stats.sessionCount}字`],
        ["保存作品", `${stats.artworkCount}幅`],
        ["报告导出", latestReport ? "已导出" : "未导出"],
        ["计划进度", planProgress ? `${planProgress.done}/${planProgress.total}` : "未制定"]
      ];
    case 9:
      return [
        ["复习单字", `${Math.max(1, stats.sessionCount)}个`],
        ["结构学习", `${stats.savedSessionCount}次`],
        ["作品创作", `${stats.artworkCount}幅`],
        ["实践练习", `${stats.sessionCount}次`],
        ["计划完成", planProgress ? `${planProgress.percent}%` : "未制定"]
      ];
    default:
      return scene.metrics;
  }
}

function updateSceneText(index) {
  const scene = SCENES[index];
  const metrics = getLearningSceneMetrics(index);
  els.stepLabel.textContent = `步骤 ${String(index + 1).padStart(2, "0")}`;
  els.sceneTitle.textContent = scene.title;
  els.sceneDescription.textContent = scene.description;
  els.coachScore.textContent = metrics[0][1];
  els.insightScore.textContent = String(metrics[0][1]).replace("分", "");
}

function updateInteractionPanel(sceneIndex, pointIndex) {
  const scene = SCENES[sceneIndex];
  const point = scene.points[pointIndex];
  const metrics = getLearningSceneMetrics(sceneIndex);

  els.sceneFocus.textContent = scene.focus;
  els.contentTitle.textContent = point.label;
  els.contentBody.textContent = point.body;
  els.contentTags.innerHTML = "";
  els.metricGrid.innerHTML = "";
  els.pointList.innerHTML = "";
  els.actionList.innerHTML = "";
  els.actionFeedback.textContent = getLearningActionHint(sceneIndex);

  point.tags.forEach((tag) => {
    const tagEl = document.createElement("span");
    tagEl.textContent = tag;
    els.contentTags.appendChild(tagEl);
  });

  metrics.slice(1).forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "metric-item";
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    els.metricGrid.appendChild(item);
  });

  scene.points.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "point-button";
    button.textContent = item.label;
    button.classList.toggle("is-active", index === pointIndex);
    button.addEventListener("click", () => selectPoint(index));
    els.pointList.appendChild(button);
  });

  scene.actions.forEach((action) => {
    const feature = getLearningActionFeature(action);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-button";
    button.textContent = action.label;
    button.dataset.featureState = feature.state;
    if (feature.state === "disabled") {
      button.disabled = true;
      button.title = feature.reason;
      button.setAttribute("aria-label", `${action.label}：${feature.reason}`);
    } else {
      button.addEventListener("click", () => runAction(action));
    }
    els.actionList.appendChild(button);
  });
}

function runAction(action) {
  const result = runLearningAction(action);
  if (result && typeof result.then === "function") {
    els.actionFeedback.textContent = "正在生成真实书写回放视频，请稍候...";
    result
      .then((resolved) => applyActionResult(resolved, action))
      .catch((error) => applyActionResult({
        ok: false,
        message: error?.message || "操作失败，请稍后重试。"
      }, action));
    return;
  }

  applyActionResult(result, action);
}

function applyActionResult(result = {}, action = {}) {
  els.actionFeedback.textContent = result.message || action.response;
  renderLearningStateSummary();
  renderLecturePanel(currentIndex);
  renderReviewPanel(currentIndex);
  renderPlanPanel(currentIndex);

  if (result.notice) {
    showNotice(result.notice);
  }

  const target = typeof result.target === "number" ? result.target : action.target;
  if (typeof target === "number") {
    window.setTimeout(() => loadScene(target), 420);
    return;
  }

  updateSceneText(currentIndex);
  updatePathPanel(currentIndex);
  renderLecturePanel(currentIndex);
  renderReviewPanel(currentIndex);
  renderHistoryPanel(currentIndex);
  renderPlanPanel(currentIndex);
}

function getLearningActionHint(sceneIndex) {
  if (!window.MRAppState) {
    return "点击场景热点或下方按钮，可查看该模块的交互反馈。";
  }

  if (sceneIndex === 6 || sceneIndex === 8 || sceneIndex === 9) {
    return window.MRAppState.getReportPreview();
  }

  return "点击按钮会写入本机学习记录；未接入的能力会明确禁用。";
}

function getLearningActionFeature(action) {
  return { state: "real" };
}

function runLearningAction(action) {
  const appState = window.MRAppState;
  if (!appState) {
    return { message: action.response, target: action.target };
  }

  switch (action.label) {
    case "查看笔画分析":
      {
        const recorded = recordLivePracticeIfAvailable({ allowCreate: true });
        if (recorded?.practice) {
          return {
            message: `已记录当前笔迹：${recorded.practice.strokeCount} 笔、${recorded.practice.pointCount} 个采样点，评分 ${recorded.practice.score}。${recorded.practice.feedback[0] || ""}`
          };
        }
        return {
          message: `当前任务：${appState.getStats().glyph}字。请先在练习格中书写，再查看真实笔画分析。`
        };
      }
    case "选择日课字":
      stopLecturePlayback();
      return appState.selectDailyGlyph();
    case "进入 AI 讲解":
      return { ...appState.startLecture(), target: action.target };
    case "播放讲解":
      return startLecturePlayback();
    case "切换碑帖":
      stopLecturePlayback();
      return appState.rotateCopybook();
    case "进入临摹训练":
    case "开始临摹":
    case "继续学习":
    case "再写一遍":
      return { ...appState.startPractice(), target: action.target ?? 3 };
    case "示范模式":
      return appState.setTrainingMode("guide");
    case "对比模式":
      return appState.setTrainingMode("compare");
    case "上一个笔画":
      return appState.moveStroke(-1);
    case "下一个笔画":
      return appState.moveStroke(1);
    case "进入笔画拆解":
    case "复习巩固":
      return { message: action.response, target: action.target };
    case "进入创作":
      return { message: "已完成笔画拆解，进入创作实践。", target: action.target };
    case "切换行书":
      return appState.setArtworkStyle("行书");
    case "保存作品":
      {
        const practiceResult = getCurrentPracticeResult({ includeImage: true, requireStrokes: true });
        if (!practiceResult) {
          return { ok: false, message: "请先在练习格中书写，再保存作品。" };
        }
        return appState.saveArtwork(practiceResult);
      }
    case "查看学习记录":
    case "打开历史记录":
      return { message: appState.getReportPreview(), target: 6 };
    case "筛选优秀记录":
      activeHistoryFilter = "excellent";
      renderHistoryPanel(6);
      return appState.filterExcellentRecords();
    case "导出学习报告":
    case "导出报告":
      recordLivePracticeIfAvailable();
      return { ...appState.createReport(), target: action.target };
    case "查看作品":
      return { message: appState.getStats().latestArtwork ? "已打开最近保存的作品复盘页。" : "还没有保存作品，请先完成一次保存作品。", target: action.target };
    case "生成视频":
      return exportPracticeReplayVideo();
    case "制定计划":
      return appState.createPlan();
    case "查看成就":
      return {
        message: `当前成就来自本机记录：${appState.getStats().sessionCount} 次练习、${appState.getStats().artworkCount} 幅作品、${appState.getStats().reportCount} 份报告。`
      };
    case "查看详情":
      return { message: appState.getReportPreview() };
    case "返回首页":
      return { message: "回到 MR 书法教练首页。", target: 0 };
    default:
      return { message: action.response, target: action.target };
  }
}

function updateStepNavigation(index) {
  const buttons = els.stepNav.querySelectorAll("button");

  buttons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });

  updatePathPanel(index);
  updateQuickControls(index);
}

function updateQuickControls(index) {
  const atFirst = index === 0;
  const atLast = index === SCENES.length - 1;

  els.quickPrev.disabled = atFirst && !WRAP_STEPS;
  els.quickHome.disabled = atFirst;
  els.quickNext.disabled = atLast && !WRAP_STEPS;
}

function updatePathPanel(index) {
  const progress = Math.round(((index + 1) / SCENES.length) * 100);
  const pathItems = els.pathList.querySelectorAll(".path-item");
  const stats = window.MRAppState?.getStats?.();

  els.pathProgress.textContent = `${index + 1} / ${SCENES.length}`;
  els.pathProgressBar.style.width = `${progress}%`;

  pathItems.forEach((button, buttonIndex) => {
    const state = button.querySelector(".path-item-state");
    const realState = getLearningPathState(buttonIndex, stats);
    const isDone = realState.done;
    const isVisited = buttonIndex < index;
    const isActive = buttonIndex === index;

    button.classList.toggle("is-done", isDone);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");

    if (state) {
      state.textContent = isActive ? realState.activeLabel : isDone ? realState.doneLabel : isVisited ? "已浏览" : realState.pendingLabel;
    }
  });
}

function getLearningPathState(index, stats) {
  if (!stats) {
    return { done: false, activeLabel: "进行中", doneLabel: "完成", pendingLabel: "待学习" };
  }

  switch (index) {
    case 1:
      return { done: Boolean(stats.glyph), activeLabel: "选字中", doneLabel: "已选字", pendingLabel: "待选字" };
    case 2:
      return { done: stats.lectureStatus === "complete", activeLabel: "讲解中", doneLabel: "已讲解", pendingLabel: "待讲解" };
    case 3:
      return { done: stats.sessionCount > 0, activeLabel: stats.sessionCount > 0 ? "练习中" : "待创建", doneLabel: "已练习", pendingLabel: "待练习" };
    case 5:
      return { done: stats.artworkCount > 0, activeLabel: "创作中", doneLabel: "已保存", pendingLabel: "待创作" };
    case 6:
      return { done: stats.sessionCount > 0, activeLabel: "记录中", doneLabel: "有记录", pendingLabel: "无记录" };
    case 7:
      return { done: stats.artworkCount > 0, activeLabel: "复盘中", doneLabel: "可复盘", pendingLabel: "待作品" };
    case 8:
      return { done: stats.reportCount > 0, activeLabel: "报告中", doneLabel: "已导出", pendingLabel: "待报告" };
    case 9:
      {
        const progress = stats.latestPlan?.progress;
        const hasPlan = Boolean(progress?.total);
        return {
          done: hasPlan && progress.done === progress.total,
          activeLabel: hasPlan ? `计划 ${progress.done}/${progress.total}` : "总结中",
          doneLabel: "计划完成",
          pendingLabel: "待计划"
        };
      }
    default:
      return { done: false, activeLabel: "进行中", doneLabel: "完成", pendingLabel: "待学习" };
  }
}

function getShortSceneName(title) {
  return title.split(" / ")[0];
}

function showLoading(isVisible) {
  els.loadingState.hidden = !isVisible;
}

function showError(message) {
  els.errorState.textContent = message;
  els.errorState.hidden = false;
}

function hideError() {
  els.errorState.hidden = true;
  els.errorState.textContent = "";
}

function showNotice(message) {
  els.noticeState.textContent = message;
  els.noticeState.hidden = false;
}

function hideNotice() {
  els.noticeState.hidden = true;
  els.noticeState.textContent = "";
}

function getImageInfo(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({
      width: image.naturalWidth,
      height: image.naturalHeight
    });
    image.onerror = reject;
    image.src = src;
  });
}

function createPlaceholderPanorama(index) {
  const scene = SCENES[index];
  const hue = (index * 31 + 8) % 360;
  const nextHue = (hue + 128) % 360;
  const title = escapeSvg(scene.title);
  const step = String(index + 1).padStart(2, "0");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="4096" height="2048" viewBox="0 0 4096 2048">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="hsl(${hue}, 44%, 24%)"/>
          <stop offset="0.55" stop-color="hsl(${nextHue}, 35%, 18%)"/>
          <stop offset="1" stop-color="hsl(${hue}, 34%, 10%)"/>
        </linearGradient>
        <pattern id="grid" width="256" height="256" patternUnits="userSpaceOnUse">
          <path d="M256 0H0V256" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="4"/>
        </pattern>
      </defs>
      <rect width="4096" height="2048" fill="url(#sky)"/>
      <rect width="4096" height="2048" fill="url(#grid)"/>
      <path d="M0 1368C480 1240 820 1512 1270 1360C1740 1202 2048 1390 2540 1265C3040 1138 3430 1334 4096 1208V2048H0Z" fill="rgba(0,0,0,0.26)"/>
      <path d="M0 1528C590 1352 980 1670 1530 1500C2090 1328 2460 1610 3090 1408C3510 1274 3810 1354 4096 1288V2048H0Z" fill="rgba(0,0,0,0.34)"/>
      <g fill="rgba(255,255,255,0.88)" font-family="Microsoft YaHei, PingFang SC, Arial, sans-serif" text-anchor="middle">
        <text x="2048" y="905" font-size="126" font-weight="700">步骤 ${step}</text>
        <text x="2048" y="1064" font-size="86">${title}</text>
        <text x="2048" y="1210" font-size="44" fill="rgba(255,255,255,0.72)">请替换 assets/scenes/scene-${step}.png</text>
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPartialPanoramaConfig(width, height) {
  const aspectRatio = width / height;
  const isFullPanorama = Math.abs(aspectRatio - 2) < 0.05;

  if (isFullPanorama) {
    return {};
  }

  if (aspectRatio > 2) {
    return {
      haov: 360,
      vaov: clamp(360 / aspectRatio, 45, 180),
      vOffset: 0
    };
  }

  return {
    haov: clamp(180 * aspectRatio, 70, 360),
    vaov: 180,
    vOffset: 0
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
