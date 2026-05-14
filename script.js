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
      ["讲解进度", "01:32 / 05:48"],
      ["当前字", "永"],
      ["学习法", "永字八法"],
      ["讲解模式", "AI + 教师"]
    ],
    actions: [
      { label: "播放讲解", response: "模拟播放：AI 正在讲解“点、横、竖、钩、撇、捺”等笔法关系。" },
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
      { label: "切换行书", response: "已模拟切换到行书风格：笔意更连贯，结构约束稍放松。" },
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
      { label: "生成视频", response: "已模拟生成书写过程视频，适合展示运笔轨迹。" },
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
      { label: "导出报告", response: "已模拟导出学习报告，包含数据、雷达图和综合评分。" }
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
  quickNext: document.getElementById("quickNext")
};

let currentIndex = 0;
let activePointIndex = 0;
let cubeYaw = 0;
let cubePitch = -7;
let cubeScale = 1;
let roomRenderer = null;
let activeRoleId = null;

document.addEventListener("DOMContentLoaded", init);

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
  initInfoPanelDrag();
  installRoomApi();
  bindSceneEditorControls();
  applyRoomConfigToCssCube();
  buildSceneConfigPanel();
  initCubeControls();

  loadScene(0);
  if (new URLSearchParams(window.location.search).has("modelView")) {
    window.setTimeout(focusModelView, 900);
  }
  window.addEventListener("keydown", handleKeyboardSceneChange, true);
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
    focusRole
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
  let furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices);
  const fallbackTexture = createSolidTexture(gl, [255, 255, 255, 255]);
  const textures = {};

  loadTextures(roomConfig.textures);
  loadRoomModels(EXTERNAL_ROOM_MODELS)
    .then((result) => {
      modelVertices = result.vertices;
      furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices);
      window.MR_LOADED_MODEL_COUNT = result.loaded;
      window.MR_LOADED_MODEL_VERTICES = modelVertices.length / 11;
      showNotice(`已加载 ${result.loaded} 个开源 GLB 模型。`);
      updateCubeTransform();
    })
    .catch((error) => {
      console.error(error);
      showNotice("开源 3D 模型加载失败，已保留基础几何家具。");
    });

  function loadTextures(nextTextures) {
    Object.entries(nextTextures).forEach(([name, src]) => {
      textures[name] = loadRoomTexture(gl, src, () => {
        updateCubeTransform();
      });
    });
  }

  function setRoles(roles) {
    furnitureMesh = createFurnitureMesh(gl, roles, modelVertices);
  }

  function setTextures(nextTextures) {
    loadTextures(nextTextures);
    Object.keys(nextTextures).forEach((face) => {
      textureSourceNames[face] = textureSourceNames[face] || nextTextures[face];
    });
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

  return { render, setTextures, setRoles };
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

async function loadRoomModels(modelSpecs) {
  const chunks = await Promise.all(modelSpecs.map(async (spec) => {
    try {
      const response = await fetch(spec.src);

      if (!response.ok) {
        throw new Error(`Model load failed: ${spec.src}`);
      }

      return {
        id: spec.id,
        vertices: parseGlbModel(await response.arrayBuffer(), spec)
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
    throw new Error("No GLB models could be loaded.");
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
    throw new Error(`Invalid GLB file: ${spec.src}`);
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
    throw new Error(`Missing GLB chunks: ${spec.src}`);
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
  const rotation = degToRad(spec.rotationY || 0);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const localX = (position[0] - bounds.centerX) * scale;
  const localY = (position[1] - bounds.minY) * scale;
  const localZ = (position[2] - bounds.centerZ) * scale;
  const rotatedX = localX * cos - localZ * sin;
  const rotatedZ = localX * sin + localZ * cos;
  const finalPosition = [
    spec.position[0] + rotatedX,
    spec.position[1] + localY,
    spec.position[2] + rotatedZ
  ];
  const sourceNormal = normal || [0, 1, 0];
  const finalNormal = normalizeVector([
    sourceNormal[0] * cos - sourceNormal[2] * sin,
    sourceNormal[1],
    sourceNormal[0] * sin + sourceNormal[2] * cos
  ]);

  pushVertex(vertices, finalPosition, [0, 0], color, finalNormal);
}

function createFurnitureMesh(gl, roles = [], modelVertices = []) {
  const vertices = [];
  const hasExternalModels = modelVertices.length > 0;

  if (hasExternalModels) {
    appendVertices(vertices, modelVertices);
  } else {
    addBox(vertices, 0, -1.58, -3.42, 4.75, 0.18, 2.05, [0.52, 0.27, 0.1]);
    addBox(vertices, -2.1, -2.36, -4.18, 0.2, 1.42, 0.2, [0.36, 0.18, 0.07]);
    addBox(vertices, 2.1, -2.36, -4.18, 0.2, 1.42, 0.2, [0.36, 0.18, 0.07]);
    addBox(vertices, -2.1, -2.36, -2.66, 0.2, 1.42, 0.2, [0.36, 0.18, 0.07]);
    addBox(vertices, 2.1, -2.36, -2.66, 0.2, 1.42, 0.2, [0.36, 0.18, 0.07]);
  }

  addBox(vertices, 0, -1.44, -3.42, 1.95, 0.04, 1.32, [0.84, 0.78, 0.64]);
  addBox(vertices, -1.38, -1.38, -3.25, 0.52, 0.14, 0.38, [0.03, 0.025, 0.02]);
  addBox(vertices, 1.18, -1.36, -3.25, 1.12, 0.055, 0.07, [0.86, 0.6, 0.22]);
  addBox(vertices, 1.02, -1.34, -3.62, 1, 0.05, 0.065, [0.68, 0.22, 0.1]);

  if (!hasExternalModels) {
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

  addBox(vertices, -4.85, 1.05, -7.74, 0.52, 2.05, 0.06, [0.68, 0.58, 0.4]);
  addBox(vertices, 4.85, 1.05, -7.74, 0.52, 2.05, 0.06, [0.68, 0.58, 0.4]);

  addBox(vertices, 0, 5.02, -4.8, 16, 0.18, 0.24, [0.38, 0.18, 0.07]);
  addBox(vertices, 0, 5.02, -0.8, 16, 0.18, 0.24, [0.38, 0.18, 0.07]);
  addBox(vertices, 0, 5.02, 3.2, 16, 0.18, 0.24, [0.38, 0.18, 0.07]);

  addCalligraphyDecor(vertices);

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

function addCalligraphyDecor(vertices) {
  addWallScroll(vertices, "front", -4.55, 1.08, -7.72, 0.84, 2.08, [0.82, 0.74, 0.56]);
  addWallScroll(vertices, "front", 4.55, 1.08, -7.72, 0.84, 2.08, [0.82, 0.74, 0.56]);
  addWallScroll(vertices, "back", -4.2, 0.84, 7.72, 0.82, 1.86, [0.78, 0.69, 0.52]);
  addWallScroll(vertices, "back", 4.2, 0.84, 7.72, 0.82, 1.86, [0.78, 0.69, 0.52]);
  addWallScroll(vertices, "left", -7.72, 0.82, 2.45, 0.78, 1.74, [0.8, 0.72, 0.55]);
  addWallScroll(vertices, "right", 7.72, 0.82, 2.2, 0.78, 1.74, [0.8, 0.72, 0.55]);

  addBrushRack(vertices, -2.72, -1.08, -3.05);
  addInkSet(vertices, -1.42, -1.28, -3.1);
  addCeramicJar(vertices, 2.52, -1.18, -3.82, 0.28, [0.23, 0.37, 0.34]);
  addCeramicJar(vertices, -6.92, -2.38, 5.72, 0.34, [0.34, 0.27, 0.2]);
  addLowDisplayStand(vertices, -6.9, -2.72, 5.72);
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

function updateSceneText(index) {
  const scene = SCENES[index];
  els.stepLabel.textContent = `步骤 ${String(index + 1).padStart(2, "0")}`;
  els.sceneTitle.textContent = scene.title;
  els.sceneDescription.textContent = scene.description;
  els.coachScore.textContent = scene.metrics[0][1];
  els.insightScore.textContent = scene.metrics[0][1].replace("分", "");
}

function updateInteractionPanel(sceneIndex, pointIndex) {
  const scene = SCENES[sceneIndex];
  const point = scene.points[pointIndex];

  els.sceneFocus.textContent = scene.focus;
  els.contentTitle.textContent = point.label;
  els.contentBody.textContent = point.body;
  els.contentTags.innerHTML = "";
  els.metricGrid.innerHTML = "";
  els.pointList.innerHTML = "";
  els.actionList.innerHTML = "";
  els.actionFeedback.textContent = "点击场景热点或下方按钮，可查看该模块的交互反馈。";

  point.tags.forEach((tag) => {
    const tagEl = document.createElement("span");
    tagEl.textContent = tag;
    els.contentTags.appendChild(tagEl);
  });

  scene.metrics.slice(1).forEach(([label, value]) => {
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
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-button";
    button.textContent = action.label;
    button.addEventListener("click", () => runAction(action));
    els.actionList.appendChild(button);
  });
}

function runAction(action) {
  els.actionFeedback.textContent = action.response;

  if (typeof action.target === "number") {
    window.setTimeout(() => loadScene(action.target), 420);
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

  els.pathProgress.textContent = `${index + 1} / ${SCENES.length}`;
  els.pathProgressBar.style.width = `${progress}%`;

  pathItems.forEach((button, buttonIndex) => {
    const state = button.querySelector(".path-item-state");
    const isDone = buttonIndex < index;
    const isActive = buttonIndex === index;

    button.classList.toggle("is-done", isDone);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");

    if (state) {
      state.textContent = isActive ? "进行中" : isDone ? "完成" : "待学习";
    }
  });
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
