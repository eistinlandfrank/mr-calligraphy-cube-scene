const SCENES = [
  {
    title: "进入系统 / 沉浸准备",
    image: "assets/scenes/scene-01.png",
    description: "进入 MR 书法教练主界面，确认学习路径、当前任务和实时反馈。",
    focus: "系统首页把学习路径、单字练习、实时反馈和历史记录集中在同一空间。",
    metrics: [
      ["综合评分", "未评分"],
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
      ["综合评分", "未评分"],
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
      ["综合评分", "未评分"]
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
        tags: ["建议", "未评分", "下一步"]
      }
    ]
  },
  {
    title: "学习记录 / 成长轨迹",
    image: "assets/scenes/scene-07.png",
    description: "查看练习时长、练习字数、掌握进度和最近学习记录。",
    focus: "这是一张学习仪表盘，用数据说明长期练习如何积累。",
    metrics: [
      ["学习时长", "0分钟"],
      ["真实练习", "0次"],
      ["保存作品", "0幅"],
      ["报告数量", "0份"],
      ["平均评分", "未评分"]
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
        body: "本机练习、作品和报告记录共同描述学习投入；没有真实记录时不显示静态成绩。",
        tags: ["时长", "练习量", "字帖"]
      },
      {
        label: "学习曲线",
        pitch: 6,
        yaw: 0,
        body: "进度曲线来自本机真实评分和按日聚合记录；没有评分时保持空状态。",
        tags: ["曲线", "进度", "趋势"]
      },
      {
        label: "最近记录",
        pitch: 3,
        yaw: 33,
        body: "最近练习会读取本机练习、作品和报告条目，每条记录带时间、综合评分和复盘入口。",
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
      ["创作时间", "待保存"],
      ["满意度", "未评分"],
      ["综合进步", "待对比"]
    ],
    actions: [
      { label: "再写一遍", target: 3, response: "回到临摹场景，带着复盘结论再练一次。" },
      { label: "生成视频", response: "将根据真实书写笔迹导出 WebM 回放视频。" },
      { label: "导出分享页", response: "将最近作品导出为可离线打开的 HTML 分享页。" },
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
        body: "成长曲线读取本机真实评分，保存多次作品后才会形成可见提升。",
        tags: ["曲线", "真实评分", "趋势"]
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
      ["真实练习", "0次"],
      ["练习字数", "0字"],
      ["保存作品", "0幅"],
      ["报告导出", "未导出"],
      ["平均评分", "未评分"]
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
        body: "左侧统计本机真实练习、练习字数、作品数量、报告导出和平均评分。",
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
        body: "综合评分来自本机真实评分记录；没有评分时不会显示静态排名。",
        tags: ["评分", "本机记录", "建议"]
      }
    ]
  },
  {
    title: "学习总结 / 复习巩固",
    image: "assets/scenes/scene-10.png",
    description: "对比学习前后作品，确认进步并进入复习巩固。",
    focus: "这一屏展示学习前后对比、综合评分和返回首页/复习入口。",
    metrics: [
      ["复习单字", "0个"],
      ["结构学习", "0次"],
      ["作品创作", "0幅"],
      ["实践练习", "0次"],
      ["计划完成", "未制定"]
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
        body: "左侧回顾本机复习单字、结构学习、作品创作、真实练习和计划完成度。",
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
        body: "总结评分来自本机记录；没有真实评分时只显示待完成状态。",
        tags: ["评分", "计划", "总结"]
      }
    ]
  }
];

const WRAP_STEPS = false;
const IS_FILE_MODE = window.location.protocol === "file:";
const LEARNING_ACTION_FEATURES = {
  查看笔画分析: ["real-local", "读取当前书写画布笔迹并写入本机练习记录。"],
  进入临摹训练: ["real-local", "创建或继续本机 PracticeSession。"],
  打开历史记录: ["real-local", "打开本机学习档案面板。"],
  选择日课字: ["real-local", "在本机任务库中切换当前学习任务。"],
  "进入 AI 讲解": ["real-local", "进入本机讲解流程，讲解进度会写入浏览器本机状态。"],
  查看成就: ["real-local", "按本机练习、作品和报告记录计算成就概览。"],
  播放讲解: ["real-local", "调用浏览器本机语音合成逐段朗读，并写入讲解进度。"],
  切换碑帖: ["real-local", "切换当前任务对应碑帖并重置讲解上下文。"],
  开始临摹: ["real-local", "创建或继续本机 PracticeSession。"],
  示范模式: ["real-local", "切换当前练习会话的训练模式。"],
  对比模式: ["real-local", "切换当前练习会话的训练模式。"],
  进入笔画拆解: ["real-local", "写入本机笔画拆解阶段记录，并跳转到拆解步骤。"],
  上一个笔画: ["real-local", "切换本机当前笔画索引。"],
  下一个笔画: ["real-local", "切换本机当前笔画索引。"],
  进入创作: ["real-local", "写入本机创作实践阶段记录，并跳转到创作步骤。"],
  切换行书: ["real-local", "切换作品风格，保存作品时会写入本机记录。"],
  保存作品: ["real-local", "保存真实书写轨迹和截图到本机作品记录。"],
  查看学习记录: ["real-local", "打开本机学习档案面板。"],
  筛选优秀记录: ["real-local", "按本机作品评分筛选优秀记录。"],
  导出学习报告: ["real-export", "用本机练习和作品记录生成 HTML 报告文件。"],
  查看作品: ["real-local", "打开最近保存作品的复盘区域。"],
  再写一遍: ["real-local", "回到临摹训练并继续当前任务。"],
  生成视频: ["real-export", "用真实笔迹导出 WebM 回放视频文件。"],
  导出分享页: ["real-export", "用最近作品生成可离线打开的本机 HTML 分享页。"],
  继续学习: ["real-local", "回到临摹训练并继续当前任务。"],
  制定计划: ["real-local", "按当前任务和本机评分生成可勾选计划。"],
  导出报告: ["real-export", "用本机练习和作品记录生成 HTML 报告文件。"],
  查看详情: ["real-local", "读取本机记录摘要。"],
  复习巩固: ["real-local", "写入本机复习巩固阶段记录，并跳转到薄弱笔画复习。"],
  返回首页: ["real-local", "回到 MR 书法教练首页。"]
};
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
  serviceBoundaryPanel: document.getElementById("serviceBoundaryPanel"),
  serviceBoundaryStatus: document.getElementById("serviceBoundaryStatus"),
  serviceBoundaryList: document.getElementById("serviceBoundaryList"),
  taskPanel: document.getElementById("taskPanel"),
  taskTitle: document.getElementById("taskTitle"),
  taskLevel: document.getElementById("taskLevel"),
  taskDescription: document.getElementById("taskDescription"),
  taskMeta: document.getElementById("taskMeta"),
  taskProgress: document.getElementById("taskProgress"),
  taskSteps: document.getElementById("taskSteps"),
  taskList: document.getElementById("taskList"),
  lecturePanel: document.getElementById("lecturePanel"),
  lectureTitle: document.getElementById("lectureTitle"),
  lectureStatusLabel: document.getElementById("lectureStatusLabel"),
  lectureProgressFill: document.getElementById("lectureProgressFill"),
  lectureBody: document.getElementById("lectureBody"),
  lectureVoiceStatus: document.getElementById("lectureVoiceStatus"),
  lectureServiceSummary: document.getElementById("lectureServiceSummary"),
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
  reviewDownloadVideo: document.getElementById("reviewDownloadVideo"),
  reviewDownloadVideoCover: document.getElementById("reviewDownloadVideoCover"),
  reviewDownloadImage: document.getElementById("reviewDownloadImage"),
  reviewDownloadReport: document.getElementById("reviewDownloadReport"),
  reviewDownloadShare: document.getElementById("reviewDownloadShare"),
  videoExportSummary: document.getElementById("videoExportSummary"),
  videoExportRecords: document.getElementById("videoExportRecords"),
  shareServiceSummary: document.getElementById("shareServiceSummary"),
  reviewCreateShareLink: document.getElementById("reviewCreateShareLink"),
  reviewCopyShareLink: document.getElementById("reviewCopyShareLink"),
  reviewRevokeShareLink: document.getElementById("reviewRevokeShareLink"),
  shareRemoteStatus: document.getElementById("shareRemoteStatus"),
  shareRemoteEndpointInput: document.getElementById("shareRemoteEndpointInput"),
  shareRemoteTokenInput: document.getElementById("shareRemoteTokenInput"),
  shareRemoteWorkspaceInput: document.getElementById("shareRemoteWorkspaceInput"),
  shareRemoteSaveButton: document.getElementById("shareRemoteSaveButton"),
  shareRemoteCheckButton: document.getElementById("shareRemoteCheckButton"),
  shareRemotePushButton: document.getElementById("shareRemotePushButton"),
  shareRemoteRevokeButton: document.getElementById("shareRemoteRevokeButton"),
  shareRemoteCopyButton: document.getElementById("shareRemoteCopyButton"),
  shareRepositoryReceiptAudit: document.getElementById("shareRepositoryReceiptAudit"),
  shareRepositoryReceiptStatus: document.getElementById("shareRepositoryReceiptStatus"),
  shareRepositoryReceiptList: document.getElementById("shareRepositoryReceiptList"),
  shareRepositoryReceiptExportButton: document.getElementById("shareRepositoryReceiptExportButton"),
  shareServiceRecords: document.getElementById("shareServiceRecords"),
  reportPanel: document.getElementById("reportPanel"),
  reportTitle: document.getElementById("reportTitle"),
  reportStatus: document.getElementById("reportStatus"),
  reportSummary: document.getElementById("reportSummary"),
  reportVerification: document.getElementById("reportVerification"),
  reportStats: document.getElementById("reportStats"),
  reportMetrics: document.getElementById("reportMetrics"),
  reportTrend: document.getElementById("reportTrend"),
  reportComparison: document.getElementById("reportComparison"),
  reportSeries: document.getElementById("reportSeries"),
  reportLatest: document.getElementById("reportLatest"),
  reportRecommendations: document.getElementById("reportRecommendations"),
  reportTeacherReviewStatus: document.getElementById("reportTeacherReviewStatus"),
  reportTeacherReviewView: document.getElementById("reportTeacherReviewView"),
  reportTeacherReviewerInput: document.getElementById("reportTeacherReviewerInput"),
  reportTeacherReviewRoleInput: document.getElementById("reportTeacherReviewRoleInput"),
  reportTeacherReviewInput: document.getElementById("reportTeacherReviewInput"),
  reportTeacherReviewSave: document.getElementById("reportTeacherReviewSave"),
  reportTeacherReviewClear: document.getElementById("reportTeacherReviewClear"),
  reportTeacherReviewAuditStatus: document.getElementById("reportTeacherReviewAuditStatus"),
  reportTeacherReviewAuditList: document.getElementById("reportTeacherReviewAuditList"),
  reportTeacherReviewAuditExport: document.getElementById("reportTeacherReviewAuditExport"),
  reportRepositorySummary: document.getElementById("reportRepositorySummary"),
  reportRepositoryExportButton: document.getElementById("reportRepositoryExportButton"),
  reportRepositoryImportButton: document.getElementById("reportRepositoryImportButton"),
  reportRepositoryImportInput: document.getElementById("reportRepositoryImportInput"),
  reportRepositoryEndpointInput: document.getElementById("reportRepositoryEndpointInput"),
  reportRepositoryTokenInput: document.getElementById("reportRepositoryTokenInput"),
  reportRepositoryWorkspaceInput: document.getElementById("reportRepositoryWorkspaceInput"),
  reportRepositorySaveRemoteButton: document.getElementById("reportRepositorySaveRemoteButton"),
  reportRepositoryRemoteButton: document.getElementById("reportRepositoryRemoteButton"),
  reportRepositoryPushButton: document.getElementById("reportRepositoryPushButton"),
  reportRepositoryPullButton: document.getElementById("reportRepositoryPullButton"),
  reportRepositoryReceiptAudit: document.getElementById("reportRepositoryReceiptAudit"),
  reportRepositoryReceiptStatus: document.getElementById("reportRepositoryReceiptStatus"),
  reportRepositoryReceiptList: document.getElementById("reportRepositoryReceiptList"),
  reportRepositoryReceiptExportButton: document.getElementById("reportRepositoryReceiptExportButton"),
  reportRepositoryConflictPanel: document.getElementById("reportRepositoryConflictPanel"),
  reportRepositoryConflictStatus: document.getElementById("reportRepositoryConflictStatus"),
  reportRepositoryConflictList: document.getElementById("reportRepositoryConflictList"),
  reportDetailCopyLink: document.getElementById("reportDetailCopyLink"),
  reportDetailDownload: document.getElementById("reportDetailDownload"),
  reportDetailDownloadPdf: document.getElementById("reportDetailDownloadPdf"),
  reportDetailPrint: document.getElementById("reportDetailPrint"),
  reportDetailOpenHistory: document.getElementById("reportDetailOpenHistory"),
  historyPanel: document.getElementById("historyPanel"),
  historySummary: document.getElementById("historySummary"),
  historyDownloadArchive: document.getElementById("historyDownloadArchive"),
  historyRepositorySummary: document.getElementById("historyRepositorySummary"),
  historyRepositoryExportButton: document.getElementById("historyRepositoryExportButton"),
  historyRepositoryImportButton: document.getElementById("historyRepositoryImportButton"),
  historyRepositoryEndpointInput: document.getElementById("historyRepositoryEndpointInput"),
  historyRepositoryTokenInput: document.getElementById("historyRepositoryTokenInput"),
  historyRepositoryWorkspaceInput: document.getElementById("historyRepositoryWorkspaceInput"),
  historyRepositorySaveRemoteButton: document.getElementById("historyRepositorySaveRemoteButton"),
  historyRepositoryRemoteButton: document.getElementById("historyRepositoryRemoteButton"),
  historyRepositoryPushButton: document.getElementById("historyRepositoryPushButton"),
  historyRepositoryPullButton: document.getElementById("historyRepositoryPullButton"),
  historyRepositoryReceiptAudit: document.getElementById("historyRepositoryReceiptAudit"),
  historyRepositoryReceiptStatus: document.getElementById("historyRepositoryReceiptStatus"),
  historyRepositoryReceiptList: document.getElementById("historyRepositoryReceiptList"),
  historyRepositoryReceiptExportButton: document.getElementById("historyRepositoryReceiptExportButton"),
  historyRepositoryConflictPanel: document.getElementById("historyRepositoryConflictPanel"),
  historyRepositoryConflictStatus: document.getElementById("historyRepositoryConflictStatus"),
  historyRepositoryConflictList: document.getElementById("historyRepositoryConflictList"),
  historyRepositoryImportInput: document.getElementById("historyRepositoryImportInput"),
  historyFilterButtons: Array.from(document.querySelectorAll("[data-history-filter]")),
  historySelectVisible: document.getElementById("historySelectVisible"),
  historySelectionStatus: document.getElementById("historySelectionStatus"),
  historyExportSelected: document.getElementById("historyExportSelected"),
  historyDeleteSelected: document.getElementById("historyDeleteSelected"),
  historyRestoreTrash: document.getElementById("historyRestoreTrash"),
  historyClearTrash: document.getElementById("historyClearTrash"),
  historyTrashStatus: document.getElementById("historyTrashStatus"),
  historyTrashList: document.getElementById("historyTrashList"),
  historyTrend: document.getElementById("historyTrend"),
  historyArtworkCompare: document.getElementById("historyArtworkCompare"),
  historyArtworkGallery: document.getElementById("historyArtworkGallery"),
  artworkGalleryStatus: document.getElementById("artworkGalleryStatus"),
  artworkSearch: document.getElementById("artworkSearch"),
  artworkTagList: document.getElementById("artworkTagList"),
  artworkGalleryGrid: document.getElementById("artworkGalleryGrid"),
  historyList: document.getElementById("historyList"),
  historyLoadMore: document.getElementById("historyLoadMore"),
  historyDetail: document.getElementById("historyDetail"),
  historyDetailType: document.getElementById("historyDetailType"),
  historyDetailTitle: document.getElementById("historyDetailTitle"),
  historyDetailBody: document.getElementById("historyDetailBody"),
  historyDetailClose: document.getElementById("historyDetailClose"),
  historyDetailRename: document.getElementById("historyDetailRename"),
  historyDetailReplay: document.getElementById("historyDetailReplay"),
  historyDetailDownloadImage: document.getElementById("historyDetailDownloadImage"),
  historyDetailDownloadReport: document.getElementById("historyDetailDownloadReport"),
  historyDetailOpenReport: document.getElementById("historyDetailOpenReport"),
  historyDetailCopyLink: document.getElementById("historyDetailCopyLink"),
  historyDetailDelete: document.getElementById("historyDetailDelete"),
  historyRenameDialog: document.getElementById("historyRenameDialog"),
  historyRenameForm: document.getElementById("historyRenameForm"),
  historyRenameCancel: document.getElementById("historyRenameCancel"),
  historyRenameTitleInput: document.getElementById("historyRenameTitleInput"),
  historyRenameFeedback: document.getElementById("historyRenameFeedback"),
  artworkTagsDialog: document.getElementById("artworkTagsDialog"),
  artworkTagsForm: document.getElementById("artworkTagsForm"),
  artworkTagsCancel: document.getElementById("artworkTagsCancel"),
  artworkTagsInput: document.getElementById("artworkTagsInput"),
  artworkTagsFeedback: document.getElementById("artworkTagsFeedback"),
  planPanel: document.getElementById("planPanel"),
  planTitle: document.getElementById("planTitle"),
  planProgressLabel: document.getElementById("planProgressLabel"),
  planProgressFill: document.getElementById("planProgressFill"),
  planSummary: document.getElementById("planSummary"),
  planReminderSummary: document.getElementById("planReminderSummary"),
  planReminderServiceSummary: document.getElementById("planReminderServiceSummary"),
  planRepositorySummary: document.getElementById("planRepositorySummary"),
  planCycleSummary: document.getElementById("planCycleSummary"),
  planHistorySelect: document.getElementById("planHistorySelect"),
  planAddItem: document.getElementById("planAddItem"),
  planReminderPermissionButton: document.getElementById("planReminderPermissionButton"),
  planRepositoryExportButton: document.getElementById("planRepositoryExportButton"),
  planRepositoryImportButton: document.getElementById("planRepositoryImportButton"),
  planRepositoryEndpointInput: document.getElementById("planRepositoryEndpointInput"),
  planRepositoryTokenInput: document.getElementById("planRepositoryTokenInput"),
  planRepositoryWorkspaceInput: document.getElementById("planRepositoryWorkspaceInput"),
  planRepositorySaveRemoteButton: document.getElementById("planRepositorySaveRemoteButton"),
  planRepositoryRemoteButton: document.getElementById("planRepositoryRemoteButton"),
  planRepositoryPushButton: document.getElementById("planRepositoryPushButton"),
  planRepositoryPullButton: document.getElementById("planRepositoryPullButton"),
  planRepositoryReceiptAudit: document.getElementById("planRepositoryReceiptAudit"),
  planRepositoryReceiptStatus: document.getElementById("planRepositoryReceiptStatus"),
  planRepositoryReceiptList: document.getElementById("planRepositoryReceiptList"),
  planRepositoryReceiptExportButton: document.getElementById("planRepositoryReceiptExportButton"),
  planRepositoryConflictPanel: document.getElementById("planRepositoryConflictPanel"),
  planRepositoryConflictStatus: document.getElementById("planRepositoryConflictStatus"),
  planRepositoryConflictList: document.getElementById("planRepositoryConflictList"),
  planRepositoryKeepLocalButton: document.getElementById("planRepositoryKeepLocalButton"),
  planRepositoryUseRemoteButton: document.getElementById("planRepositoryUseRemoteButton"),
  planRepositoryCopyRemoteButton: document.getElementById("planRepositoryCopyRemoteButton"),
  planRepositoryMergeFieldsButton: document.getElementById("planRepositoryMergeFieldsButton"),
  planRepositoryImportInput: document.getElementById("planRepositoryImportInput"),
  planExportButton: document.getElementById("planExportButton"),
  planCalendarExportButton: document.getElementById("planCalendarExportButton"),
  planNextCycleButton: document.getElementById("planNextCycleButton"),
  planDependencyGraph: document.getElementById("planDependencyGraph"),
  planItemList: document.getElementById("planItemList"),
  planItemDialog: document.getElementById("planItemDialog"),
  planItemForm: document.getElementById("planItemForm"),
  planItemDialogTitle: document.getElementById("planItemDialogTitle"),
  planItemCancel: document.getElementById("planItemCancel"),
  planItemTitleInput: document.getElementById("planItemTitleInput"),
  planItemDetailInput: document.getElementById("planItemDetailInput"),
  planItemDueInput: document.getElementById("planItemDueInput"),
  planItemRemindInput: document.getElementById("planItemRemindInput"),
  planItemReviewActionInput: document.getElementById("planItemReviewActionInput"),
  planItemDialogFeedback: document.getElementById("planItemDialogFeedback"),
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
  scoreServiceSummary: document.getElementById("scoreServiceSummary"),
  pointList: document.getElementById("pointList"),
  actionList: document.getElementById("actionList"),
  actionFeedback: document.getElementById("actionFeedback"),
  actionDetail: document.getElementById("actionDetail"),
  coachScore: document.getElementById("coachScore"),
  insightScore: document.getElementById("insightScore"),
  pathProgress: document.getElementById("pathProgress"),
  pathProgressBar: document.getElementById("pathProgressBar"),
  pathList: document.getElementById("pathList"),
  learningPathServiceSummary: document.getElementById("learningPathServiceSummary"),
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
let activeHistoryRenameId = null;
let activeArtworkTagEditorId = null;
let activeReportDetailId = null;
let activeArtworkSearch = "";
let activeArtworkTag = "";
let activeReportMetricKey = "structure";
let activeReportSeriesMetricKeys = new Set(["structure"]);
let activeReportSeriesTooltipTarget = null;
let activeReportSeriesWindowSize = null;
let activeReportSeriesPointId = null;
let activeHistoryLimit = 8;
const selectedHistoryIds = new Set();
const HISTORY_PAGE_SIZE = 8;
const STEP_ROUTE_QUERY_KEY = "step";
const POINT_ROUTE_QUERY_KEY = "point";
const MODEL_VIEW_QUERY_KEY = "modelView";
const HISTORY_DETAIL_QUERY_KEY = "history";
const REPORT_DETAIL_QUERY_KEY = "report";
const ARTWORK_DETAIL_QUERY_KEY = "artwork";
const SHARE_LINK_QUERY_KEY = "share";
const REPORT_DETAIL_SCENE_INDEX = 8;
const REPORT_METRIC_LABELS = [
  ["structure", "结构"],
  ["stroke", "笔画"],
  ["technique", "笔法"],
  ["fluency", "流畅"],
  ["force", "力度"]
];
const REPORT_SERIES_TEMPLATES = [
  { key: "shape", label: "字形", keys: ["structure", "stroke"] },
  { key: "brush", label: "笔势", keys: ["technique", "force"] },
  { key: "rhythm", label: "节奏", keys: ["fluency", "force"] },
  { key: "all", label: "全部", keys: ["structure", "stroke", "technique", "fluency", "force"] }
];
const REPORT_METRIC_GUIDES = {
  structure: {
    focus: "结构稳定度",
    advice: "观察中宫、重心和外轮廓，优先把字形站稳。"
  },
  stroke: {
    focus: "笔画完整度",
    advice: "单独复盘起笔、行笔和收笔，减少断裂和过短笔画。"
  },
  technique: {
    focus: "笔法变化",
    advice: "关注提按、转折和主次轻重，让线条更有层次。"
  },
  fluency: {
    focus: "行笔流畅度",
    advice: "用回放检查不必要停顿，保持速度变化自然。"
  },
  force: {
    focus: "力度控制",
    advice: "放大主笔按压力度，辅笔保持轻盈，避免整字同一重量。"
  }
};
let activePlanId = null;
let activePlanItemEditor = null;
let activeArtworkShareId = null;
let isReplayVideoExporting = false;
let isLecturePlaybackActive = false;
let lecturePlaybackTimer = null;
let lectureSpeechUtterance = null;
let lecturePlaybackToken = 0;
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
    color: normalizeMainColor(record.color || "#c8b08a"),
    opacity: normalizeMainOpacity(record.opacity),
    roughness: normalizeMainRoughness(record.roughness),
    metalness: normalizeMainMetalness(record.metalness),
    sha256: normalizeMainSha256(record.sha256),
    metrics: normalizeMainImportMetrics(record.metrics),
    texture: normalizeMainTextureRecord(record.texture),
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

function normalizeMainColor(value, fallback = "#c8b08a") {
  const string = String(value || "").trim();

  return /^#[0-9a-f]{6}$/i.test(string) ? string : fallback;
}

function normalizeMainOpacity(value) {
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number, 0.2, 1) : 1;
}

function normalizeMainRoughness(value) {
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number, 0.05, 1) : 0.64;
}

function normalizeMainMetalness(value) {
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number, 0, 1) : 0.02;
}

function normalizeMainSha256(value) {
  const hash = String(value || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
}

function normalizeMainTextureRecord(record = {}) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const fileName = String(record.fileName || "").trim().slice(0, 160);
  const type = getMainImportTextureType(fileName, record.mimeType || record.type);
  const dbKey = String(record.dbKey || "").trim();
  const sha256 = normalizeMainSha256(record.sha256);

  if (!fileName || !type || !dbKey) {
    return null;
  }

  return {
    dbKey,
    fileName,
    type,
    mimeType: getMainImportTextureMimeType(type),
    sha256,
    fileBytes: Math.max(0, Math.round(readMainNumber(record.fileBytes, 0))),
    updatedAt: Number.isFinite(Date.parse(record.updatedAt)) ? record.updatedAt : ""
  };
}

function normalizeMainImportMetrics(metrics = {}) {
  const source = metrics && typeof metrics === "object" ? metrics : {};
  const dimensions = source.dimensions && typeof source.dimensions === "object" ? source.dimensions : {};

  return {
    fileBytes: Math.max(0, Math.round(readMainNumber(source.fileBytes, 0))),
    meshCount: Math.max(0, Math.round(readMainNumber(source.meshCount, 0))),
    vertexCount: Math.max(0, Math.round(readMainNumber(source.vertexCount, 0))),
    dimensions: {
      width: readMainNumber(dimensions.width, 0),
      height: readMainNumber(dimensions.height, 0),
      depth: readMainNumber(dimensions.depth, 0)
    }
  };
}

function getMainImportFileType(fileName) {
  const match = String(fileName || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];

  return extension === "glb" || extension === "obj" ? extension : "";
}

function getMainImportTextureType(fileName, mimeType = "") {
  const match = String(fileName || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];
  const mime = String(mimeType || "").toLowerCase();

  if (extension === "png" || mime === "image/png") return "png";
  if (extension === "jpg" || extension === "jpeg" || mime === "image/jpeg") return "jpg";
  if (extension === "webp" || mime === "image/webp") return "webp";
  return "";
}

function getMainImportTextureMimeType(type) {
  if (type === "png") return "image/png";
  if (type === "jpg") return "image/jpeg";
  if (type === "webp") return "image/webp";
  return "application/octet-stream";
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
      color: normalizeMainColor(record.color || "#c8b08a"),
      opacity: normalizeMainOpacity(record.opacity),
      roughness: normalizeMainRoughness(record.roughness),
      metalness: normalizeMainMetalness(record.metalness),
      texture: normalizeMainTextureRecord(record.texture)
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
  bindTaskControls();
  bindReviewControls();
  bindReportControls();
  bindHistoryControls();
  bindPlanControls();
  initPracticeCanvas();
  initInfoPanelDrag();
  installRoomApi();
  bindSceneEditorControls();
  bindMainSceneAdminControls();
  applyRoomConfigToCssCube();
  buildSceneConfigPanel();
  installFeatureStateMarkers();
  initCubeControls();
  renderLearningStateSummary();
  renderTaskPanel();

  const routedShareId = getArtworkShareRouteId();
  const routedReportId = getReportDetailRouteId();
  const routedArtworkId = getArtworkDetailRouteId();
  const routedHistoryId = getHistoryDetailRouteId();
  const routedStepIndex = getLearningStepRouteIndex();
  const routedPointIndex = getLearningPointRouteIndex(routedStepIndex ?? 0);
  if (routedShareId) {
    openArtworkShareRoute(routedShareId, { updateUrl: false, showMissing: true, routeMode: "replace" });
  } else if (routedReportId) {
    openReportDetailRoute(routedReportId, { updateUrl: false, showMissing: true, routeMode: "replace" });
  } else if (routedArtworkId) {
    openArtworkDetailRoute(routedArtworkId, { updateUrl: false, showMissing: true, routeMode: "replace" });
  } else if (routedHistoryId) {
    openHistoryDetailRoute(routedHistoryId, { updateUrl: false, showMissing: true, routeMode: "replace" });
  } else {
    loadScene(routedStepIndex ?? 0, {
      routeMode: "replace",
      updateStepRoute: routedStepIndex !== null || routedPointIndex !== null,
      pointIndex: routedPointIndex ?? 0
    });
  }
  if (new URLSearchParams(window.location.search).has(MODEL_VIEW_QUERY_KEY)) {
    window.setTimeout(() => focusModelView({ updateRoute: false }), 900);
  }
  window.addEventListener("keydown", handleKeyboardSceneChange, true);
  window.addEventListener("popstate", handleRoutePopState);
  window.addEventListener("storage", handleMainSceneStorageChange);
  window.addEventListener("mr-learning-state-change", renderLearningState);
}

function installFeatureStateMarkers() {
  annotateFeatureControls(document);

  if (!window.MutationObserver) {
    return;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          annotateFeatureControls(node);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function annotateFeatureControls(root) {
  const controls = root.matches?.("button, a[href]")
    ? [root]
    : Array.from(root.querySelectorAll?.("button, a[href]") || []);

  controls.forEach((control) => {
    if (!control.dataset.featureState) {
      control.dataset.featureState = "disabled";
      control.dataset.featureStateMissing = "true";
    }
    if (!control.dataset.featureLabel) {
      control.dataset.featureLabel = getFeatureStateLabel(control.dataset.featureState);
    }
    if (!control.title && !["real", "real-local"].includes(control.dataset.featureState)) {
      control.title = control.dataset.featureLabel;
    }
  });
}

function getFeatureStateLabel(state) {
  const labels = {
    real: "真实可用",
    "real-local": "本机真实",
    "real-export": "文件导出",
    "real-published-local": "本机发布",
    demo: "演示能力",
    "demo-content": "演示内容",
    disabled: "暂不可用"
  };
  return labels[state] || labels.disabled;
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
    applyButton.dataset.featureState = "real-local";
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
    button.dataset.featureState = "real-local";
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

const ROOM_VERTEX_STRIDE = 14;

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
    material: gl.getAttribLocation(program, "aMaterial"),
    projection: gl.getUniformLocation(program, "uProjection"),
    view: gl.getUniformLocation(program, "uView"),
    texture: gl.getUniformLocation(program, "uTexture"),
    useTexture: gl.getUniformLocation(program, "uUseTexture")
  };
  const roomMeshes = createRoomTextureMeshes(gl);
  let modelVertices = [];
  let texturedModelMeshes = [];
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
      texturedModelMeshes = [];
      furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices, false);
      window.MR_LOADED_MODEL_COUNT = 0;
      window.MR_LOADED_MODEL_VERTICES = 0;
      window.MR_LOADED_TEXTURED_MODEL_COUNT = 0;
      updateCubeTransform();
      return Promise.resolve();
    }

    if (showLoadingFallback) {
      furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices, true);
    }

    return loadRoomModels(modelSpecs)
      .then((result) => {
        modelVertices = result.vertices;
        texturedModelMeshes = result.textured.map((chunk) => ({
          id: chunk.id,
          mesh: createMesh(gl, chunk.vertices, null),
          texture: loadRoomTextureFromArrayBuffer(gl, chunk.textureAsset, () => {
            updateCubeTransform();
          })
        }));
        furnitureMesh = createFurnitureMesh(gl, roomConfig.roles, modelVertices, result.loaded === 0 && hasRenderableModels);
        window.MR_LOADED_MODEL_COUNT = result.loaded;
        window.MR_LOADED_MODEL_VERTICES = result.vertexCount;
        window.MR_LOADED_TEXTURED_MODEL_COUNT = texturedModelMeshes.length;
        showNotice(`已加载 ${result.loaded} 个 3D 模型。`);
        updateCubeTransform();
      })
      .catch((error) => {
        console.error(error);
        texturedModelMeshes = [];
        window.MR_LOADED_TEXTURED_MODEL_COUNT = 0;
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
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
    texturedModelMeshes.forEach((item) => {
      drawRoomMesh(gl, locations, item.mesh, item.texture, true);
    });
  }

  return { render, setTextures, setRoles, setMainSceneLayout };
}

const ROOM_VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  attribute vec4 aColor;
  attribute vec3 aNormal;
  attribute vec2 aMaterial;

  uniform mat4 uProjection;
  uniform mat4 uView;

  varying vec2 vTexCoord;
  varying vec4 vColor;
  varying float vLight;
  varying float vSpecular;
  varying float vMetalness;

  void main() {
    vec3 lightDir = normalize(vec3(-0.34, 0.78, 0.48));
    vec3 normal = normalize(aNormal);
    float roughness = clamp(aMaterial.x, 0.05, 1.0);
    float metalness = clamp(aMaterial.y, 0.0, 1.0);
    float diffuse = max(dot(normal, lightDir), 0.0);
    vec3 halfDir = normalize(lightDir + vec3(0.0, 0.22, 1.0));
    float gloss = 1.0 - roughness;
    vSpecular = pow(max(dot(normal, halfDir), 0.0), mix(68.0, 9.0, roughness)) * (0.035 + metalness * 0.3) * gloss;
    vMetalness = metalness;
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
  varying vec4 vColor;
  varying float vLight;
  varying float vSpecular;
  varying float vMetalness;

  void main() {
    vec4 texel = texture2D(uTexture, vTexCoord);
    vec3 base = mix(vColor.rgb, texel.rgb, uUseTexture);
    float alpha = mix(vColor.a, texel.a * vColor.a, uUseTexture);
    vec3 lit = base * vLight + vec3(vSpecular);
    vec3 metalTint = mix(lit, lit * mix(vec3(1.0), base, 0.45), vMetalness);
    gl_FragColor = vec4(metalTint, alpha);
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

function loadRoomTextureFromArrayBuffer(gl, textureAsset, onLoad) {
  const texture = createSolidTexture(gl, [255, 255, 255, 255]);
  const textureRecord = normalizeMainTextureRecord(textureAsset);

  if (!textureRecord || !textureAsset?.arrayBuffer) {
    return texture;
  }

  const blob = new Blob([textureAsset.arrayBuffer.slice(0)], { type: getMainImportTextureMimeType(textureRecord.type) });
  const url = URL.createObjectURL(blob);
  const image = new Image();

  image.onload = () => {
    URL.revokeObjectURL(url);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    onLoad();
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    showNotice(`无法加载导入模型贴图：${textureRecord.fileName}`);
  };
  image.src = url;

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
const roomModelTextureBufferCache = new Map();

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
  return readMainImportedAssetByKey(record?.dbKey);
}

async function readMainImportedAssetByKey(dbKey) {
  const db = await openMainImportDb();
  const key = String(dbKey || "").trim();

  if (!key) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MAIN_IMPORT_DB_STORE, "readonly");
    const store = transaction.objectStore(MAIN_IMPORT_DB_STORE);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Could not read imported asset."));
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

async function getRoomModelTextureAsset(spec) {
  const textureRecord = normalizeMainTextureRecord(spec.texture);
  if (!textureRecord) {
    return null;
  }

  const cacheKey = `texture:${textureRecord.dbKey}`;
  if (roomModelTextureBufferCache.has(cacheKey)) {
    return {
      ...textureRecord,
      arrayBuffer: roomModelTextureBufferCache.get(cacheKey).slice(0)
    };
  }

  const stored = await readMainImportedAssetByKey(textureRecord.dbKey);
  if (!stored?.arrayBuffer) {
    throw new Error(`Imported model texture missing: ${textureRecord.fileName}`);
  }

  roomModelTextureBufferCache.set(cacheKey, stored.arrayBuffer.slice(0));
  return {
    ...textureRecord,
    arrayBuffer: stored.arrayBuffer.slice(0)
  };
}

async function loadRoomModels(modelSpecs) {
  if (!modelSpecs.length) {
    return {
      vertices: [],
      textured: [],
      vertexCount: 0,
      loaded: 0
    };
  }

  const chunks = await Promise.all(modelSpecs.map(async (spec) => {
    try {
      const buffer = await getRoomModelBuffer(spec);
      const vertices = spec.type === "obj"
        ? parseObjModel(buffer, spec)
        : parseGlbModel(buffer, spec);
      const textureAsset = spec.texture
        ? await getRoomModelTextureAsset(spec).catch((error) => {
            console.warn(error);
            return null;
          })
        : null;

      return {
        id: spec.id,
        vertices,
        textureAsset
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
  const solidChunks = loadedChunks.filter((chunk) => !chunk.textureAsset);
  const textured = loadedChunks.filter((chunk) => chunk.textureAsset);
  const vertices = solidChunks.flatMap((chunk) => chunk.vertices);
  const vertexCount = loadedChunks.reduce((count, chunk) => count + chunk.vertices.length / ROOM_VERTEX_STRIDE, 0);

  if (!vertexCount) {
    throw new Error("No 3D models could be loaded.");
  }

  return {
    vertices,
    textured,
    vertexCount,
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
      const texCoords = primitive.attributes.TEXCOORD_0 !== undefined
        ? readGlbAccessor(gltf, binaryChunk, primitive.attributes.TEXCOORD_0)
        : null;
      const indices = primitive.indices !== undefined
        ? readGlbAccessor(gltf, binaryChunk, primitive.indices)
        : positions.map((_, index) => index);
      const color = getGlbMaterialColor(gltf, primitive.material, spec);
      const material = getGlbMaterialParams(gltf, primitive.material, spec);

      for (let i = 0; i < indices.length; i += 3) {
        pushGlbModelVertex(vertices, positions[indices[i]], normals && normals[indices[i]], texCoords && texCoords[indices[i]], color, bounds, spec, material);
        pushGlbModelVertex(vertices, positions[indices[i + 1]], normals && normals[indices[i + 1]], texCoords && texCoords[indices[i + 1]], color, bounds, spec, material);
        pushGlbModelVertex(vertices, positions[indices[i + 2]], normals && normals[indices[i + 2]], texCoords && texCoords[indices[i + 2]], color, bounds, spec, material);
      }
    });
  });

  return vertices;
}

function parseObjModel(arrayBuffer, spec) {
  const text = new TextDecoder("utf-8").decode(arrayBuffer);
  const positions = [];
  const texCoords = [];
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

    if (command === "vt" && parts.length >= 2) {
      texCoords.push([
        Number(parts[0]),
        Number(parts[1])
      ]);
      return;
    }

    if (command === "f" && parts.length >= 3) {
      const faceVertices = parts
        .map((part) => parseObjFaceVertex(part, positions.length, texCoords.length))
        .filter((item) => item.positionIndex >= 0 && item.positionIndex < positions.length);

      for (let i = 1; i < faceVertices.length - 1; i += 1) {
        faces.push([faceVertices[0], faceVertices[i], faceVertices[i + 1]]);
      }
    }
  });

  if (!positions.length || !faces.length) {
    throw new Error(`OBJ has no readable mesh: ${spec.fileName || spec.id}`);
  }

  const bounds = getObjPositionBounds(positions);
  const color = withAlpha(spec.color ? hexToRgb(spec.color) : [0.72, 0.5, 0.32], spec.opacity);
  const material = getModelMaterialParams(spec);
  const rx = degToRad(spec.rotationX || 0);
  const ry = degToRad(spec.rotationY || 0);
  const rz = degToRad(spec.rotationZ || 0);
  const vertices = [];

  faces.forEach((face) => {
    const triangle = face.map((item) => transformObjPosition(positions[item.positionIndex], bounds, spec, rx, ry, rz));
    const normal = normalizeVector(crossVector(
      subtractVector(triangle[1], triangle[0]),
      subtractVector(triangle[2], triangle[0])
    ));
    const uvs = face.map((item, index) => {
      const uv = texCoords[item.texCoordIndex];
      return Array.isArray(uv) ? uv : [[0, 0], [1, 0], [0, 1]][index];
    });

    pushVertex(vertices, triangle[0], uvs[0], color, normal, material);
    pushVertex(vertices, triangle[1], uvs[1], color, normal, material);
    pushVertex(vertices, triangle[2], uvs[2], color, normal, material);
  });

  return vertices;
}

function parseObjFaceVertex(token, vertexCount, texCoordCount) {
  const parts = String(token).split("/");

  return {
    positionIndex: parseObjRelativeIndex(parts[0], vertexCount),
    texCoordIndex: parseObjRelativeIndex(parts[1], texCoordCount)
  };
}

function parseObjRelativeIndex(value, count) {
  const index = Number.parseInt(String(value || ""), 10);

  if (!Number.isFinite(index) || index === 0) {
    return -1;
  }

  return index > 0 ? index - 1 : count + index;
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
  if (spec.color) {
    return withAlpha(hexToRgb(spec.color).map((channel) => clamp(channel, 0.04, 1)), spec.opacity);
  }

  const material = (gltf.materials || [])[materialIndex] || {};
  const pbr = material.pbrMetallicRoughness || {};
  const base = pbr.baseColorFactor || [0.72, 0.5, 0.32, 1];
  const tint = spec.tint || [1, 1, 1];
  const opacity = spec.opacity ?? base[3];

  return withAlpha(
    [0, 1, 2].map((channel) => clamp(base[channel] * (tint[channel] || 1), 0.04, 1)),
    opacity
  );
}

function getGlbMaterialParams(gltf, materialIndex, spec) {
  if (spec.roughness !== undefined || spec.metalness !== undefined) {
    return getModelMaterialParams(spec);
  }

  const material = (gltf.materials || [])[materialIndex] || {};
  const pbr = material.pbrMetallicRoughness || {};

  return [
    normalizeMainRoughness(pbr.roughnessFactor),
    normalizeMainMetalness(pbr.metallicFactor)
  ];
}

function getModelMaterialParams(spec = {}) {
  return [
    normalizeMainRoughness(spec.roughness),
    normalizeMainMetalness(spec.metalness)
  ];
}

function pushGlbModelVertex(vertices, position, normal, uv, color, bounds, spec, material) {
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

  pushVertex(vertices, finalPosition, Array.isArray(uv) ? uv : [0, 0], color, finalNormal, material);
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

  for (let i = 0; i < source.length; i += ROOM_VERTEX_STRIDE) {
    const rotatedPosition = rotateVectorWithRadians(
      [source[i] * scale, source[i + 1] * scale, source[i + 2] * scale],
      rx,
      ry,
      rz
    );
    const rotatedNormal = normalizeVector(rotateVectorWithRadians(
      [source[i + 9], source[i + 10], source[i + 11]],
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
      source[i + 8],
      rotatedNormal[0],
      rotatedNormal[1],
      rotatedNormal[2],
      source[i + 12] ?? 0.64,
      source[i + 13] ?? 0.02
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

function withAlpha(color, opacity = 1) {
  return [color[0], color[1], color[2], normalizeMainOpacity(opacity)];
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

function pushVertex(vertices, position, uv, color, normal, material) {
  const materialParams = normalizeMainMaterialVector(material);

  vertices.push(
    position[0], position[1], position[2],
    uv[0], uv[1],
    color[0], color[1], color[2], color[3] ?? 1,
    normal[0], normal[1], normal[2],
    materialParams[0], materialParams[1]
  );
}

function normalizeMainMaterialVector(material) {
  if (Array.isArray(material)) {
    return [
      normalizeMainRoughness(material[0]),
      normalizeMainMetalness(material[1])
    ];
  }

  return [
    normalizeMainRoughness(material?.roughness),
    normalizeMainMetalness(material?.metalness)
  ];
}

function createMesh(gl, vertices, texture) {
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  return {
    buffer,
    texture,
    count: vertices.length / ROOM_VERTEX_STRIDE
  };
}

function drawRoomMesh(gl, locations, mesh, texture, useTexture) {
  const stride = ROOM_VERTEX_STRIDE * Float32Array.BYTES_PER_ELEMENT;

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  gl.enableVertexAttribArray(locations.position);
  gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(locations.texCoord);
  gl.vertexAttribPointer(locations.texCoord, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(locations.color);
  gl.vertexAttribPointer(locations.color, 4, gl.FLOAT, false, stride, 5 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(locations.normal);
  gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, stride, 9 * Float32Array.BYTES_PER_ELEMENT);
  if (locations.material >= 0) {
    gl.enableVertexAttribArray(locations.material);
    gl.vertexAttribPointer(locations.material, 2, gl.FLOAT, false, stride, 12 * Float32Array.BYTES_PER_ELEMENT);
  }

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

  SCENES.forEach((_, index) => {
    const sceneView = getLearningSceneView(index);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.featureState = "real-local";
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", `切换到步骤 ${index + 1}: ${sceneView.title}`);
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
    button.dataset.featureState = "real-local";
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

function bindTaskControls() {
  els.taskList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-task-id]");
    if (!button) return;

    stopLecturePlayback();
    const result = window.MRAppState?.selectTask?.(button.dataset.taskId);
    if (result?.message) {
      showNotice(result.message);
    }
    renderLearningState();
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
  els.reviewDownloadVideo?.addEventListener("click", downloadLatestPracticeVideo);
  els.reviewDownloadVideoCover?.addEventListener("click", downloadLatestPracticeVideoCover);
  els.reviewDownloadImage?.addEventListener("click", downloadLatestArtworkImage);
  els.reviewDownloadReport?.addEventListener("click", downloadLatestReport);
  els.reviewDownloadShare?.addEventListener("click", downloadLatestArtworkSharePage);
  els.videoExportRecords?.addEventListener("click", handleVideoExportAction);
  els.reviewCreateShareLink?.addEventListener("click", createLatestArtworkShareLink);
  els.reviewCopyShareLink?.addEventListener("click", () => copyActiveArtworkShareLink());
  els.reviewRevokeShareLink?.addEventListener("click", () => revokeActiveArtworkShareLink());
  els.shareRemoteSaveButton?.addEventListener("click", saveShareRemoteConfig);
  els.shareRemoteCheckButton?.addEventListener("click", checkShareRemote);
  els.shareRemotePushButton?.addEventListener("click", pushActiveShareRemote);
  els.shareRemoteRevokeButton?.addEventListener("click", revokeActiveShareRemote);
  els.shareRemoteCopyButton?.addEventListener("click", copyRemoteShareUrl);
  els.shareRepositoryReceiptExportButton?.addEventListener("click", exportShareRepositoryReceipts);
  els.shareServiceRecords?.addEventListener("click", handleShareRecordAction);
}

function bindReportControls() {
  els.reportDetailCopyLink?.addEventListener("click", copyReportDetailLink);
  els.reportDetailDownload?.addEventListener("click", downloadReportDetail);
  els.reportDetailDownloadPdf?.addEventListener("click", downloadReportPdfDetail);
  els.reportDetailPrint?.addEventListener("click", printReportDetail);
  els.reportDetailOpenHistory?.addEventListener("click", openReportHistoryRecord);
  els.reportTeacherReviewSave?.addEventListener("click", saveReportTeacherReview);
  els.reportTeacherReviewClear?.addEventListener("click", clearReportTeacherReview);
  els.reportTeacherReviewAuditExport?.addEventListener("click", exportReportTeacherReviewAudit);
  els.reportRepositoryExportButton?.addEventListener("click", downloadReportRepositoryPackage);
  els.reportRepositoryImportButton?.addEventListener("click", chooseReportRepositoryImport);
  els.reportRepositoryImportInput?.addEventListener("change", importReportRepositoryFile);
  els.reportRepositorySaveRemoteButton?.addEventListener("click", saveReportRepositoryRemoteConfig);
  els.reportRepositoryRemoteButton?.addEventListener("click", checkReportRepositoryRemote);
  els.reportRepositoryPushButton?.addEventListener("click", pushReportRepositoryRemote);
  els.reportRepositoryPullButton?.addEventListener("click", pullReportRepositoryRemote);
  els.reportRepositoryReceiptExportButton?.addEventListener("click", exportReportRepositoryReceipts);
  els.reportRepositoryConflictList?.addEventListener("click", handleReportRepositoryConflictAction);
  els.reportMetrics?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-report-metric]");
    if (!button) return;
    activeReportMetricKey = normalizeReportMetricKey(button.dataset.reportMetric);
    activeReportSeriesMetricKeys.add(activeReportMetricKey);
    renderReportPanel(currentIndex);
  });
  els.reportComparison?.addEventListener("click", (event) => {
    const exportButton = event.target.closest("[data-report-comparison-export]");
    if (exportButton) {
      downloadReportComparisonDetail(exportButton.dataset.reportComparisonExport);
      return;
    }

    const button = event.target.closest("[data-report-jump]");
    if (!button) return;
    openReportDetailRoute(button.dataset.reportJump);
  });
  els.reportSeries?.addEventListener("click", (event) => {
    const tooltipAction = event.target.closest("[data-report-series-tooltip-action]");
    if (tooltipAction) {
      event.preventDefault();
      event.stopPropagation();
      handleReportSeriesTooltipAction(tooltipAction.dataset.reportSeriesTooltipAction);
      return;
    }

    const zoomButton = event.target.closest("[data-report-series-zoom]");
    if (zoomButton) {
      updateReportSeriesZoom(zoomButton.dataset.reportSeriesZoom);
      renderReportPanel(currentIndex);
      return;
    }

    const pointDetail = event.target.closest("[data-report-series-point-detail]");
    if (pointDetail) {
      activeReportSeriesPointId = pointDetail.dataset.reportSeriesPointDetail || null;
      hideReportSeriesTooltip({ force: true });
      renderReportPanel(currentIndex);
      return;
    }

    const templateButton = event.target.closest("[data-report-series-template]");
    if (templateButton) {
      applyReportSeriesTemplate(templateButton.dataset.reportSeriesTemplate);
      renderReportPanel(currentIndex);
      return;
    }

    const metricButton = event.target.closest("[data-report-series-metric]");
    if (metricButton) {
      toggleReportSeriesMetric(metricButton.dataset.reportSeriesMetric);
      renderReportPanel(currentIndex);
      return;
    }

    const button = event.target.closest("[data-report-jump]");
    if (!button) return;
    openReportDetailRoute(button.dataset.reportJump);
  });
  els.reportSeries?.addEventListener("pointerover", (event) => {
    const target = event.target.closest("[data-report-series-tooltip]");
    if (!target) return;
    showReportSeriesTooltip(target, event);
  });
  els.reportSeries?.addEventListener("pointermove", (event) => {
    const target = event.target.closest("[data-report-series-tooltip]");
    if (!target) return;
    moveReportSeriesTooltip(event);
  });
  els.reportSeries?.addEventListener("pointerout", (event) => {
    const target = event.target.closest("[data-report-series-tooltip]");
    if (target) {
      if (isReportSeriesTooltipTransition(event.relatedTarget, target)) return;
      hideReportSeriesTooltip();
      return;
    }

    const tooltip = event.target.closest("[data-report-series-tooltip-box]");
    if (!tooltip) return;
    if (isReportSeriesTooltipTransition(event.relatedTarget)) return;
    hideReportSeriesTooltip();
  });
  els.reportSeries?.addEventListener("focusin", (event) => {
    const target = event.target.closest("[data-report-series-tooltip]");
    if (!target) return;
    showReportSeriesTooltip(target);
  });
  els.reportSeries?.addEventListener("focusout", (event) => {
    if (!event.target.closest("[data-report-series-tooltip], [data-report-series-tooltip-box]")) return;
    if (isReportSeriesTooltipTransition(event.relatedTarget)) return;
    hideReportSeriesTooltip();
  });
  els.reportSeries?.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.closest("[data-report-series-point-detail]")) {
      const target = event.target.closest("[data-report-series-point-detail]");
      if (target?.tagName?.toLowerCase() !== "button") {
        event.preventDefault();
        activeReportSeriesPointId = target.dataset.reportSeriesPointDetail || null;
        hideReportSeriesTooltip({ force: true });
        renderReportPanel(currentIndex);
        return;
      }
    }

    if (event.key !== "Escape") return;
    const tooltip = getReportSeriesTooltip();
    if (!tooltip || tooltip.hidden) return;
    event.preventDefault();
    hideReportSeriesTooltip({ force: true });
  });
}

function bindHistoryControls() {
  els.historyFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeHistoryFilter = button.dataset.historyFilter || "all";
      activeHistoryLimit = HISTORY_PAGE_SIZE;
      activeHistoryDetailId = null;
      selectedHistoryIds.clear();
      clearHistoryDetailRoute();
      clearArtworkDetailRoute();
      renderHistoryPanel(currentIndex);
    });
  });
  els.historyList?.addEventListener("click", handleHistoryListClick);
  els.historyList?.addEventListener("change", handleHistorySelectionChange);
  els.historySelectVisible?.addEventListener("change", handleHistorySelectVisible);
  els.historyExportSelected?.addEventListener("click", exportSelectedHistoryRecords);
  els.historyDeleteSelected?.addEventListener("click", deleteSelectedHistoryRecords);
  els.historyRestoreTrash?.addEventListener("click", restoreLatestHistoryTrash);
  els.historyClearTrash?.addEventListener("click", clearHistoryTrash);
  els.historyTrashList?.addEventListener("click", handleHistoryTrashAction);
  els.historyArtworkCompare?.addEventListener("click", handleArtworkCompareAction);
  els.artworkSearch?.addEventListener("input", () => {
    activeArtworkSearch = els.artworkSearch.value;
    renderHistoryArtworkGallery();
  });
  els.artworkTagList?.addEventListener("click", handleArtworkTagClick);
  els.artworkGalleryGrid?.addEventListener("click", handleArtworkGalleryAction);
  els.historyLoadMore?.addEventListener("click", () => {
    activeHistoryLimit += HISTORY_PAGE_SIZE;
    renderHistoryPanel(currentIndex);
  });
  els.historyDetailClose?.addEventListener("click", () => {
    activeHistoryDetailId = null;
    clearHistoryDetailRoute();
    clearArtworkDetailRoute();
    renderHistoryDetail();
    renderHistoryPanel(currentIndex);
  });
  els.historyDetailRename?.addEventListener("click", renameHistoryDetail);
  els.historyDetailReplay?.addEventListener("click", replayHistoryDetail);
  els.historyDetailDownloadImage?.addEventListener("click", downloadHistoryDetailImage);
  els.historyDetailDownloadReport?.addEventListener("click", downloadHistoryDetailReport);
  els.historyDetailOpenReport?.addEventListener("click", openHistoryReportDetail);
  els.historyDetailCopyLink?.addEventListener("click", copyHistoryDetailLink);
  els.historyDetailDelete?.addEventListener("click", deleteHistoryDetail);
  els.historyRenameForm?.addEventListener("submit", submitHistoryRenameForm);
  els.historyRenameCancel?.addEventListener("click", closeHistoryRenameDialog);
  els.historyRenameDialog?.addEventListener("cancel", () => {
    activeHistoryRenameId = null;
  });
  els.historyRenameDialog?.addEventListener("click", (event) => {
    if (event.target === els.historyRenameDialog) {
      closeHistoryRenameDialog();
    }
  });
  els.artworkTagsForm?.addEventListener("submit", submitArtworkTagsForm);
  els.artworkTagsCancel?.addEventListener("click", closeArtworkTagsDialog);
  els.artworkTagsDialog?.addEventListener("cancel", () => {
    activeArtworkTagEditorId = null;
  });
  els.artworkTagsDialog?.addEventListener("click", (event) => {
    if (event.target === els.artworkTagsDialog) {
      closeArtworkTagsDialog();
    }
  });
  els.historyDownloadArchive?.addEventListener("click", () => {
    const result = window.MRAppState?.downloadArchive?.();
    if (result?.message) {
      showNotice(result.message);
    }
  });
  els.historyRepositoryExportButton?.addEventListener("click", downloadHistoryRepositoryPackage);
  els.historyRepositoryImportButton?.addEventListener("click", chooseHistoryRepositoryImport);
  els.historyRepositorySaveRemoteButton?.addEventListener("click", saveHistoryRepositoryRemoteConfig);
  els.historyRepositoryRemoteButton?.addEventListener("click", checkHistoryRepositoryRemote);
  els.historyRepositoryPushButton?.addEventListener("click", pushHistoryRepositoryRemote);
  els.historyRepositoryPullButton?.addEventListener("click", pullHistoryRepositoryRemote);
  els.historyRepositoryReceiptExportButton?.addEventListener("click", exportHistoryRepositoryReceipts);
  els.historyRepositoryConflictList?.addEventListener("click", handleHistoryRepositoryConflictAction);
  els.historyRepositoryImportInput?.addEventListener("change", importHistoryRepositoryFile);
}

function bindPlanControls() {
  els.planHistorySelect?.addEventListener("change", () => {
    activePlanId = els.planHistorySelect.value || null;
    renderPlanPanel(currentIndex);
    updateSceneText(currentIndex);
    updatePathPanel(currentIndex);
  });

  els.planAddItem?.addEventListener("click", addCustomPlanItem);
  els.planReminderPermissionButton?.addEventListener("click", requestActivePlanReminderPermission);
  els.planRepositoryExportButton?.addEventListener("click", downloadPlanRepositoryPackage);
  els.planRepositoryImportButton?.addEventListener("click", choosePlanRepositoryImport);
  els.planRepositorySaveRemoteButton?.addEventListener("click", savePlanRepositoryRemoteConfig);
  els.planRepositoryRemoteButton?.addEventListener("click", checkPlanRepositoryRemote);
  els.planRepositoryPushButton?.addEventListener("click", pushPlanRepositoryRemote);
  els.planRepositoryPullButton?.addEventListener("click", pullPlanRepositoryRemote);
  els.planRepositoryReceiptExportButton?.addEventListener("click", exportPlanRepositoryReceipts);
  els.planRepositoryKeepLocalButton?.addEventListener("click", () => resolvePlanRepositoryConflict("keep-local"));
  els.planRepositoryUseRemoteButton?.addEventListener("click", () => resolvePlanRepositoryConflict("use-remote"));
  els.planRepositoryCopyRemoteButton?.addEventListener("click", () => resolvePlanRepositoryConflict("copy-remote"));
  els.planRepositoryMergeFieldsButton?.addEventListener("click", () => resolvePlanRepositoryConflict("merge-fields"));
  els.planRepositoryImportInput?.addEventListener("change", importPlanRepositoryFile);
  els.planExportButton?.addEventListener("click", downloadActivePlan);
  els.planCalendarExportButton?.addEventListener("click", downloadActivePlanCalendar);
  els.planNextCycleButton?.addEventListener("click", createNextPlanCycle);
  els.planDependencyGraph?.addEventListener("click", handlePlanDependencyClick);
  els.planItemForm?.addEventListener("submit", submitPlanItemForm);
  els.planItemCancel?.addEventListener("click", closePlanItemDialog);
  els.planItemDialog?.addEventListener("cancel", () => {
    activePlanItemEditor = null;
  });
  els.planItemDialog?.addEventListener("click", (event) => {
    if (event.target === els.planItemDialog) {
      closePlanItemDialog();
    }
  });

  els.planItemList?.addEventListener("change", (event) => {
    const input = event.target.closest("[data-plan-item-id]");
    if (!input) return;
    const planId = input.dataset.planId;
    const itemId = input.dataset.planItemId;
    const result = window.MRAppState?.togglePlanItem?.(planId, itemId, input.checked);
    if (result?.plan?.id) {
      activePlanId = result.plan.id;
    }
    if (result?.message) {
      showNotice(result.message);
    }
    renderPlanPanel(currentIndex);
    updateSceneText(currentIndex);
    updatePathPanel(currentIndex);
  });

  els.planItemList?.addEventListener("click", handlePlanItemAction);
}

function renderLearningState() {
  renderLearningStateSummary();
  renderTaskPanel();
  updateSceneText(currentIndex);
  updateInteractionPanel(currentIndex, activePointIndex);
  updatePathPanel(currentIndex);
  renderLecturePanel(currentIndex);
  renderReviewPanel(currentIndex);
  renderReportPanel(currentIndex);
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
    const stageLabel = stats.stageProgress?.done
      ? `阶段${stats.stageProgress.done}/${stats.stageProgress.total}`
      : "阶段待开始";
    els.learningStateSummary.textContent = `${stats.modeLabel} / ${stats.taskTitle} / ${stats.copybook} / ${stats.sessionCount}次练习 / ${stats.artworkCount}幅作品 / ${stageLabel} / ${trainingLabel}模式`;
  }
  renderServiceBoundaryPanel(stats);
}

function renderServiceBoundaryPanel(stats = window.MRAppState?.getStats?.()) {
  if (!els.serviceBoundaryList) {
    return;
  }
  if (!stats) {
    if (els.serviceBoundaryStatus) {
      els.serviceBoundaryStatus.textContent = "本机能力尚未初始化。";
    }
    els.serviceBoundaryList.replaceChildren();
    return;
  }

  const repositories = getServiceBoundaryRepositoryStates();
  const configured = repositories.filter((item) => item.remoteConfigured);
  const receiptCount = repositories.reduce((sum, item) => sum + item.receiptCount, 0);
  const verifiedCount = repositories.reduce((sum, item) => sum + item.verifiedCount, 0);
  const localRecordCount = Number(stats.recordCount || 0);
  const localText = `${localRecordCount} 条本机记录，含 ${Number(stats.practicedSessionCount || 0)} 次真实练习、${Number(stats.artworkCount || 0)} 幅作品、${Number(stats.reportCount || 0)} 份报告。`;
  const remoteReceiptText = receiptCount
    ? `本机校验通过 ${verifiedCount}/${receiptCount} 条回执。`
    : "暂无远端回执。";
  const remoteText = configured.length
    ? `已配置 ${configured.length} 个远端 adapter：${configured.map((item) => item.label).join("、")}；${remoteReceiptText}`
    : "尚未配置远端 adapter；当前以本机 JSON、HTML、PDF、ICS 和本机分享链接留存。";
  const cloudText = "未接入账号登录、教师端权限、生产 CDN、跨设备云同步和服务端不可篡改审计。";

  if (els.serviceBoundaryStatus) {
    els.serviceBoundaryStatus.textContent = configured.length
      ? `${configured.length} 个远端接口已配置，生产云端仍未接入。`
      : "当前为本机真实闭环，生产云端未接入。";
  }

  const rows = [
    {
      label: "本机真实",
      state: localRecordCount ? "ready" : "idle",
      detail: localText
    },
    {
      label: "远端 Adapter",
      state: configured.length ? "ready" : "idle",
      detail: remoteText
    },
    {
      label: "生产云端",
      state: "missing",
      detail: cloudText
    }
  ];
  els.serviceBoundaryList.replaceChildren(...rows.map(createServiceBoundaryItem));
}

function getServiceBoundaryRepositoryStates() {
  const sources = [
    {
      label: "学习档案",
      status: window.MRAppState?.getHistoryRepositoryStatus?.(),
      audit: window.MRAppState?.getHistoryRepositoryReceiptAudit?.()
    },
    {
      label: "计划",
      status: window.MRAppState?.getPlanRepositoryStatus?.(),
      audit: window.MRAppState?.getPlanRepositoryReceiptAudit?.()
    },
    {
      label: "报告",
      status: window.MRAppState?.getReportRepositoryStatus?.(),
      audit: window.MRAppState?.getReportRepositoryReceiptAudit?.()
    },
    {
      label: "作品分享",
      status: window.MRAppState?.getShareServiceStatus?.(),
      audit: window.MRAppState?.getShareRepositoryReceiptAudit?.()
    }
  ];
  return sources.map((item) => ({
    label: item.label,
    remoteConfigured: Boolean(item.status?.remoteConfigured),
    receiptCount: Number(item.audit?.total || item.status?.receiptCount || 0),
    verifiedCount: Number(item.audit?.verifiedCount || 0)
  }));
}

function createServiceBoundaryItem(item) {
  const li = document.createElement("li");
  li.dataset.boundaryState = item.state;
  const label = document.createElement("strong");
  label.textContent = item.label;
  const detail = document.createElement("span");
  detail.textContent = item.detail;
  li.append(label, detail);
  return li;
}

function renderTaskPanel() {
  if (!els.taskPanel || !window.MRAppState?.getTaskLibrary) {
    return;
  }

  const library = window.MRAppState.getTaskLibrary();
  const stats = window.MRAppState.getStats();
  const task = library.currentTask || {
    taskTitle: stats.taskTitle,
    level: stats.taskLevel,
    description: stats.taskDescription,
    glyph: stats.glyph,
    copybook: stats.copybook,
    focus: stats.taskFocus,
    strokePlan: stats.taskSteps || [],
    progress: stats.taskProgress
  };
  const progress = task.progress || stats.taskProgress || {};

  els.taskTitle.textContent = task.taskTitle || stats.taskTitle;
  els.taskLevel.textContent = task.level || stats.taskLevel || "基础";
  els.taskDescription.textContent = task.description || stats.taskDescription || "选择任务后显示练习目标。";

  els.taskMeta.innerHTML = "";
  [
    ["练习字", `${task.glyph || stats.glyph}字`],
    ["碑帖", task.copybook || stats.copybook],
    ["重点", task.focus || stats.taskFocus],
    ["状态", progress.statusLabel || "待开始"],
    ["依赖", progress.dependencyStatus?.label || "无前置"],
    ["完成条件", progress.ruleSummary || "阶段 / 练习 / 作品 / 报告"]
  ].forEach(([label, value]) => {
    const chip = document.createElement("span");
    chip.textContent = `${label}：${value}`;
    els.taskMeta.appendChild(chip);
  });

  renderTaskProgress(progress);

  els.taskSteps.innerHTML = "";
  const steps = task.strokePlan?.length ? task.strokePlan : stats.taskSteps || [];
  steps.forEach((step, index) => {
    const item = document.createElement("li");
    item.textContent = `${index + 1}. ${step}`;
    els.taskSteps.appendChild(item);
  });

  els.taskList.innerHTML = "";
  library.tasks.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "task-option";
    button.dataset.taskId = item.id;
    button.dataset.featureState = "real-local";
    button.classList.toggle("is-active", Boolean(item.active));
    button.classList.toggle("is-locked", Boolean(item.locked));
    button.setAttribute("aria-disabled", item.locked ? "true" : "false");
    button.title = item.locked
      ? item.dependencyStatus?.reason || "请先完成前置任务。"
      : item.description || item.taskTitle;

    const title = document.createElement("strong");
    title.textContent = item.taskTitle;
    const detail = document.createElement("span");
    detail.textContent = `${item.level} / ${item.copybook}`;
    const focus = document.createElement("small");
    focus.textContent = item.focus;
    const status = document.createElement("em");
    status.textContent = item.locked
      ? `${item.progress?.statusLabel || "未解锁"} · ${item.dependencyStatus?.label || "前置"}`
      : `${item.progress?.statusLabel || "待开始"} · ${item.progress?.percent || 0}%`;

    button.append(title, detail, focus, status);
    els.taskList.appendChild(button);
  });
}

function renderTaskProgress(progress = {}) {
  if (!els.taskProgress) {
    return;
  }

  els.taskProgress.innerHTML = "";

  const head = document.createElement("div");
  head.className = "task-progress-head";
  const label = document.createElement("strong");
  label.textContent = progress.statusLabel || "待开始";
  const percent = document.createElement("span");
  percent.textContent = `${progress.percent || 0}%`;
  head.append(label, percent);

  const rail = document.createElement("div");
  rail.className = "task-progress-rail";
  const fill = document.createElement("span");
  fill.style.width = `${Math.max(0, Math.min(100, progress.percent || 0))}%`;
  rail.appendChild(fill);

  const detail = document.createElement("p");
  detail.textContent = `${progress.stageCount || 0} 条阶段记录 / ${progress.sessionCount || 0} 次练习 / ${progress.artworkCount || 0} 幅作品 / ${progress.reportCount || 0} 份报告 / 均分 ${progress.averageScore || 0}`;

  const rule = document.createElement("p");
  rule.className = "task-progress-rule";
  rule.textContent = `完成条件：${progress.ruleSummary || "阶段 / 练习 / 作品 / 报告"}`;

  const dependency = document.createElement("p");
  dependency.className = "task-dependency-note";
  dependency.hidden = !progress.dependencyStatus?.dependencies?.length;
  dependency.textContent = progress.dependencyStatus?.reason || "";

  const milestones = document.createElement("div");
  milestones.className = "task-milestones";
  (progress.milestones || []).forEach((item) => {
    const badge = document.createElement("span");
    badge.classList.toggle("is-done", Boolean(item.done));
    badge.textContent = item.done ? `已${item.label}` : item.label;
    milestones.appendChild(badge);
  });

  els.taskProgress.append(head, rail, detail, rule, dependency, milestones);
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
  updateLectureVoiceStatus(progress);
  renderLectureServiceSummary();
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
  if (isLecturePlaybackActive || lecturePlaybackTimer || lectureSpeechUtterance) {
    return { ok: false, message: "AI 讲解正在播放中，请稍候。" };
  }

  const result = appState.startLecture();
  syncLectureServiceCapabilities();
  const token = ++lecturePlaybackToken;
  isLecturePlaybackActive = true;
  renderLearningStateSummary();
  renderLecturePanel(currentIndex);
  updateSceneText(currentIndex);
  updatePathPanel(currentIndex);
  const playback = playOrScheduleLectureStep(result.lecture, token);
  return {
    ...result,
    message: `${result.message} ${playback.message}`
  };
}

function playOrScheduleLectureStep(progress, token) {
  if (!progress || progress.status === "complete") {
    stopLecturePlayback();
    return { ok: true, message: "讲解已完成。" };
  }

  const speech = speakLectureStep(progress, token);
  if (speech.ok) {
    return speech;
  }

  recordLectureServiceEvent({
    mode: "local-text-timer",
    status: "fallback",
    stepTitle: progress.currentStep?.title,
    message: speech.message
  });
  setLectureVoiceStatus(speech.message, "fallback");
  scheduleLectureAdvance(token, LECTURE_PLAYBACK_STEP_MS);
  return {
    ok: true,
    mode: "timer",
    message: `${speech.message} 正在按段推进。`
  };
}

function scheduleLectureAdvance(token, delay = LECTURE_PLAYBACK_STEP_MS) {
  const progress = window.MRAppState?.getLectureProgress?.();
  if (!progress || progress.status === "complete" || token !== lecturePlaybackToken) {
    stopLecturePlayback();
    return;
  }

  lecturePlaybackTimer = window.setTimeout(() => {
    lecturePlaybackTimer = null;
    advanceLecturePlayback(token);
  }, delay);
}

function advanceLecturePlayback(token) {
  if (token !== lecturePlaybackToken || !isLecturePlaybackActive) {
    return;
  }

  const result = window.MRAppState?.advanceLecture?.();
  renderLearningStateSummary();
  renderLecturePanel(currentIndex);
  updateSceneText(currentIndex);
  updatePathPanel(currentIndex);
  if (result?.message) {
    els.actionFeedback.textContent = result.message;
  }
  if (result?.lecture?.status === "complete") {
    isLecturePlaybackActive = false;
    recordLectureServiceEvent({
      status: "complete",
      stepTitle: result.lecture.currentStep?.title,
      message: "本机讲解服务已完成全部段落。"
    });
    setLectureVoiceStatus("本机语音讲解已完成，进度已保存。", "complete");
    showNotice("AI 讲解已完成，进度已保存。");
    return;
  }
  playOrScheduleLectureStep(result?.lecture, token);
}

function speakLectureStep(progress, token) {
  if (!supportsLectureSpeech()) {
    return { ok: false, message: "当前浏览器不支持本机语音合成。" };
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getLectureSpeechText(progress));
    utterance.lang = "zh-CN";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.voice = getLectureSpeechVoice();
    utterance.onstart = () => {
      if (token !== lecturePlaybackToken) return;
      recordLectureServiceEvent({
        mode: "local-tts",
        status: "playing",
        supported: true,
        voiceName: utterance.voice?.name || "",
        stepTitle: progress.currentStep?.title,
        message: `本机语音朗读中：${progress.currentStep?.title || "当前段落"}`
      });
      setLectureVoiceStatus(`本机语音朗读中：${progress.currentStep?.title || "当前段落"}`, "playing");
    };
    utterance.onend = () => {
      if (token !== lecturePlaybackToken) return;
      lectureSpeechUtterance = null;
      recordLectureServiceEvent({
        mode: "local-tts",
        status: "playing",
        supported: true,
        voiceName: utterance.voice?.name || "",
        stepTitle: progress.currentStep?.title,
        spoken: true,
        message: `已朗读：${progress.currentStep?.title || "当前段落"}`
      });
      scheduleLectureAdvance(token, 180);
    };
    utterance.onerror = () => {
      if (token !== lecturePlaybackToken) return;
      lectureSpeechUtterance = null;
      recordLectureServiceEvent({
        mode: "local-text-timer",
        status: "fallback",
        stepTitle: progress.currentStep?.title,
        message: "本机语音播放失败，已改用文本计时推进。"
      });
      setLectureVoiceStatus("本机语音播放失败，已改用文本计时推进。", "fallback");
      scheduleLectureAdvance(token, LECTURE_PLAYBACK_STEP_MS);
    };
    lectureSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return { ok: true, mode: "speech", message: "正在用浏览器本机语音逐段朗读。" };
  } catch (error) {
    console.warn("本机语音讲解启动失败", error);
    lectureSpeechUtterance = null;
    recordLectureServiceEvent({
      mode: "local-text-timer",
      status: "error",
      stepTitle: progress.currentStep?.title,
      message: "本机语音启动失败。"
    });
    return { ok: false, message: "本机语音启动失败。" };
  }
}

function supportsLectureSpeech() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function getLectureSpeechVoice() {
  if (!supportsLectureSpeech()) return null;
  const voices = window.speechSynthesis.getVoices?.() || [];
  return voices.find((voice) => /^zh/i.test(voice.lang))
    || voices.find((voice) => /Chinese|Mandarin|中文|普通话/i.test(voice.name))
    || null;
}

function getLectureSpeechText(progress) {
  const title = progress?.currentStep?.title || "当前讲解";
  const body = progress?.currentStep?.body || "";
  return `${title}。${body}`;
}

function syncLectureServiceCapabilities() {
  const supported = supportsLectureSpeech();
  const voice = supported ? getLectureSpeechVoice() : null;
  return window.MRAppState?.updateLectureServiceCapabilities?.({
    supported,
    voiceName: voice?.name || ""
  });
}

function recordLectureServiceEvent(event = {}) {
  return window.MRAppState?.recordLectureServiceEvent?.(event);
}

function renderLectureServiceSummary() {
  if (!els.lectureServiceSummary) return;
  const status = window.MRAppState?.getLectureServiceStatus?.();
  if (!status) {
    els.lectureServiceSummary.textContent = "本机讲解服务尚未初始化。";
    els.lectureServiceSummary.dataset.serviceTone = "idle";
    return;
  }

  els.lectureServiceSummary.textContent = `${status.message} ${status.boundary}`;
  els.lectureServiceSummary.dataset.serviceTone = status.status === "complete" || status.status === "ready"
    ? "ready"
    : status.status === "fallback"
      ? "warning"
      : status.status === "error"
        ? "danger"
        : status.status === "playing"
          ? "playing"
          : "idle";
}

function updateLectureVoiceStatus(progress) {
  if (!els.lectureVoiceStatus) return;
  if (isLecturePlaybackActive && lectureSpeechUtterance) {
    setLectureVoiceStatus(`本机语音朗读中：${progress.currentStep?.title || "当前段落"}`, "playing");
    return;
  }
  if (progress?.status === "complete") {
    setLectureVoiceStatus("本机讲解已完成，进度已保存。", "complete");
    return;
  }
  if (!supportsLectureSpeech()) {
    setLectureVoiceStatus("当前浏览器不支持本机语音合成，将使用文本计时推进。", "fallback");
    return;
  }
  setLectureVoiceStatus("本机语音待播放。", "idle");
}

function setLectureVoiceStatus(text, tone = "idle") {
  if (!els.lectureVoiceStatus) return;
  els.lectureVoiceStatus.textContent = text;
  els.lectureVoiceStatus.dataset.tone = tone;
}

function stopLecturePlayback() {
  lecturePlaybackToken += 1;
  isLecturePlaybackActive = false;
  if (lecturePlaybackTimer) {
    window.clearTimeout(lecturePlaybackTimer);
    lecturePlaybackTimer = null;
  }
  if (lectureSpeechUtterance && supportsLectureSpeech()) {
    window.speechSynthesis.cancel();
  }
  lectureSpeechUtterance = null;
  updateLectureVoiceStatus(window.MRAppState?.getLectureProgress?.());
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
  const scoreEvidence = artwork?.scoreEvidence || session?.scoreEvidence || null;
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
  const reviewItems = feedback.length ? [...feedback] : ["完成一次书写并保存作品后，会显示针对笔迹的复盘建议。"];
  if (scoreEvidence) {
    reviewItems.push(`评分依据：${scoreEvidence.label || "基础练习评分"}，${scoreEvidence.disclaimer || "本机启发式评分，不等同于专业评级。"}`);
    (scoreEvidence.reasons || []).slice(0, 3).forEach((reason) => {
      reviewItems.push(`${reason.label} ${reason.score}分：${reason.evidence}`);
    });
  }
  reviewItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    els.reviewFeedback.appendChild(li);
  });

  const hasStrokes = Boolean(session?.strokes?.length);
  els.reviewReplay.disabled = !hasStrokes;
  if (els.reviewDownloadVideo) els.reviewDownloadVideo.disabled = !hasStrokes;
  els.reviewDownloadImage.disabled = !hasImage;
  els.reviewDownloadReport.disabled = !report;
  if (els.reviewDownloadShare) els.reviewDownloadShare.disabled = !artwork;
  renderVideoExportPanel(artwork, session);
  renderShareServicePanel(artwork);
}

function renderVideoExportPanel(artwork, session) {
  const status = window.MRAppState?.getPracticeVideoExportStatus?.({
    artworkId: artwork?.id,
    sessionId: session?.id
  }) || null;
  const currentRecord = status?.currentRecord || null;
  if (els.reviewDownloadVideoCover) {
    els.reviewDownloadVideoCover.disabled = !currentRecord?.coverDataUrl;
  }
  if (els.videoExportSummary) {
    els.videoExportSummary.textContent = status
      ? `${status.message} ${status.boundary}`
      : "本机视频导出服务尚未初始化。";
    const tone = status?.failedCount
      ? "warning"
      : status?.runningCount
        ? "running"
        : currentRecord?.coverDataUrl
          ? "ready"
          : status?.lastError
            ? "warning"
            : "idle";
    els.videoExportSummary.dataset.videoTone = tone;
  }
  if (!els.videoExportRecords) return;
  els.videoExportRecords.innerHTML = "";
  const jobs = (status?.jobs || []).slice(0, 4);
  if (!jobs.length) {
    const item = document.createElement("li");
    const body = document.createElement("span");
    body.textContent = status?.lastError
      ? `最近导出失败：${status.lastError}`
      : "暂无视频导出记录。导出视频后会显示 WebM 文件、封面和笔迹统计。";
    item.appendChild(body);
    els.videoExportRecords.appendChild(item);
    return;
  }

  jobs.forEach((job) => {
    const item = document.createElement("li");
    item.dataset.videoJobStatus = job.status;
    const title = document.createElement("strong");
    title.textContent = `${job.title} · ${job.statusLabel}`;
    const detail = document.createElement("span");
    const errorText = job.error ? ` / ${job.error}` : "";
    detail.textContent = `${job.sourceLabel} / ${job.strokeCount} 笔 / ${job.pointCount} 点 / ${job.updatedLabel}${errorText}`;
    item.append(title, detail);
    if (job.canRetry) {
      const actions = document.createElement("div");
      actions.className = "video-export-record-actions";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.dataset.videoExportRetry = job.id;
      retry.textContent = "重试";
      actions.appendChild(retry);
      item.appendChild(actions);
    }
    els.videoExportRecords.appendChild(item);
  });
}

async function handleVideoExportAction(event) {
  const retryButton = event.target?.closest?.("[data-video-export-retry]");
  if (!retryButton) return;
  const jobId = retryButton.dataset.videoExportRetry || "";
  retryButton.disabled = true;
  try {
    await retryPracticeVideoExport(jobId);
  } finally {
    retryButton.disabled = false;
  }
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

function downloadLatestArtworkSharePage() {
  const result = window.MRAppState?.downloadArtworkSharePage?.();
  if (result?.message) {
    showNotice(result.message);
    return;
  }
  showNotice("还没有可导出的作品分享页。请先保存作品。");
}

function renderShareServicePanel(artwork) {
  const status = window.MRAppState?.getShareServiceStatus?.(artwork?.id) || null;
  const config = window.MRAppState?.getShareServiceRemoteConfig?.() || null;
  const currentRecord = status?.currentRecord || null;
  if (currentRecord) {
    activeArtworkShareId = currentRecord.id;
  } else if (activeArtworkShareId && !status?.records?.some((record) => record.id === activeArtworkShareId)) {
    activeArtworkShareId = null;
  }

  if (els.shareServiceSummary) {
    els.shareServiceSummary.textContent = status
      ? `${status.message} ${status.boundary}`
      : "本机分享服务尚未初始化。";
    els.shareServiceSummary.dataset.shareTone = status?.activeCount
      ? "ready"
      : status?.total
        ? "warning"
        : "idle";
  }

  const activeRecord = getShareRecordForAction();
  if (els.reviewCreateShareLink) {
    els.reviewCreateShareLink.disabled = !artwork;
  }
  if (els.reviewCopyShareLink) {
    els.reviewCopyShareLink.disabled = !activeRecord?.isActive;
  }
  if (els.reviewRevokeShareLink) {
    els.reviewRevokeShareLink.disabled = !activeRecord?.isActive;
  }
  if (els.shareRemoteEndpointInput && document.activeElement !== els.shareRemoteEndpointInput) {
    els.shareRemoteEndpointInput.value = config?.remoteEndpoint || "";
  }
  if (els.shareRemoteTokenInput && document.activeElement !== els.shareRemoteTokenInput) {
    els.shareRemoteTokenInput.value = config?.remoteToken || "";
  }
  if (els.shareRemoteWorkspaceInput && document.activeElement !== els.shareRemoteWorkspaceInput) {
    els.shareRemoteWorkspaceInput.value = config?.workspaceId || status?.workspaceId || "local-browser";
  }
  if (els.shareRemoteStatus) {
    const receiptText = status?.lastReceipt?.receiptDigest
      ? ` 回执 ${status.lastReceipt.receiptDigest.slice(0, 12)}，${formatShareRepositoryReceiptVerificationStatus(status.lastReceipt.verificationStatus)}。`
      : "";
    const publicText = status?.lastRemotePublicUrl
      ? ` 远端链接：${status.lastRemotePublicUrl}`
      : "";
    els.shareRemoteStatus.textContent = status?.remoteConfigured
      ? `${status.lastError || status.lastRemoteStatus || "远端分享 API 已配置，尚未检查。"}${receiptText}${publicText} ${config?.boundary || ""}`
      : `尚未配置远端分享 API，当前空间 ${config?.workspaceId || status?.workspaceId || "local-browser"}。${config?.boundary || ""}`;
    els.shareRemoteStatus.dataset.shareRemoteTone = status?.lastError
      ? "warning"
      : status?.lastRemotePublicUrl
        ? "ready"
        : status?.remoteConfigured
          ? "pending"
          : "idle";
  }
  [
    els.shareRemoteSaveButton,
    els.shareRemoteCheckButton
  ].forEach((button) => {
    if (button) button.disabled = false;
  });
  if (els.shareRemoteCheckButton) {
    els.shareRemoteCheckButton.textContent = status?.remoteConfigured ? "检查远端" : "远端未配置";
  }
  if (els.shareRemotePushButton) {
    els.shareRemotePushButton.disabled = !status?.remoteConfigured || !activeRecord?.isActive;
  }
  if (els.shareRemoteRevokeButton) {
    const remoteMatchesWorkspace = !activeRecord?.remoteWorkspaceId || activeRecord.remoteWorkspaceId === status?.workspaceId;
    els.shareRemoteRevokeButton.disabled = !status?.remoteConfigured || !activeRecord?.remotePublicUrl || Boolean(activeRecord?.remoteRevokedAt) || !remoteMatchesWorkspace;
  }
  if (els.shareRemoteCopyButton) {
    els.shareRemoteCopyButton.disabled = !status?.lastRemotePublicUrl || Boolean(activeRecord?.remoteRevokedAt);
  }
  renderShareRepositoryReceipts();

  if (!els.shareServiceRecords) return;
  els.shareServiceRecords.innerHTML = "";
  const records = (status?.records || []).slice(0, 4);
  if (!records.length) {
    const item = document.createElement("li");
    const body = document.createElement("span");
    body.textContent = "暂无分享记录。生成本机链接后会在这里显示访问、复制和撤销状态。";
    item.appendChild(body);
    els.shareServiceRecords.appendChild(item);
    return;
  }

  records.forEach((record) => {
    const item = document.createElement("li");
    item.dataset.shareRecordStatus = record.status;
    const body = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = record.artworkTitle || record.title;
    const meta = document.createElement("span");
    const remoteWorkspaceText = record.remoteWorkspaceId ? ` ${record.remoteWorkspaceId}` : "";
    const remoteText = record.remoteRevokedAt
      ? ` / 远端已撤销${remoteWorkspaceText}`
      : record.remotePublicUrl
        ? ` / 已发布远端${remoteWorkspaceText}`
        : "";
    meta.textContent = `${record.statusLabel} / ${record.permissionLabel} / 浏览 ${record.viewCount || 0} / 复制 ${record.copyCount || 0}${remoteText}`;
    body.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "share-service-record-actions";
    [
      ["copy", "复制", !record.isActive],
      ["revoke", "撤销", !record.isActive]
    ].forEach(([action, label, disabled]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.featureState = "real-local";
      button.dataset.shareRecordAction = action;
      button.dataset.shareRecordId = record.id;
      button.disabled = Boolean(disabled);
      button.textContent = label;
      actions.appendChild(button);
    });
    item.append(body, actions);
    els.shareServiceRecords.appendChild(item);
  });
}

function renderShareRepositoryReceipts() {
  const audit = window.MRAppState?.getShareRepositoryReceiptAudit?.();
  const receipts = Array.isArray(audit?.receipts) ? audit.receipts : [];
  if (els.shareRepositoryReceiptStatus) {
    els.shareRepositoryReceiptStatus.textContent = audit?.message || "暂无作品分享远端回执。";
    els.shareRepositoryReceiptStatus.dataset.receiptTone = receipts.length ? "ready" : "idle";
  }
  if (els.shareRepositoryReceiptExportButton) {
    els.shareRepositoryReceiptExportButton.disabled = !receipts.length;
  }
  if (!els.shareRepositoryReceiptList) return;
  els.shareRepositoryReceiptList.replaceChildren();
  receipts.slice(0, 5).forEach((receipt) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = receipt.packageId || receipt.sourcePackageId || receipt.shareId || "作品分享回执";
    const meta = document.createElement("span");
    const digest = receipt.repositoryDigest ? receipt.repositoryDigest.slice(0, 12) : "摘要未知";
    const receiptDigest = receipt.receiptDigest ? receipt.receiptDigest.slice(0, 12) : "回执未知";
    meta.textContent = `${formatShareRepositoryReceiptDirection(receipt.direction)} · 空间 ${receipt.workspaceId || audit?.workspaceId || "local-browser"} · ${formatHistoryTime(receipt.receivedAt || receipt.acceptedAt)} · 仓库 ${digest} · 回执 ${receiptDigest} · ${formatShareRepositoryReceiptVerificationStatus(receipt.verificationStatus)}`;
    const detail = document.createElement("small");
    const publicText = receipt.publicUrl ? "有公开链接" : "未返回公开链接";
    detail.textContent = `${receipt.remoteVersion || "远端版本未知"} / ${receipt.shareCount || 0} 条分享 / ${publicText} / ${receipt.verificationMessage || "本机校验未执行"}`;
    item.append(title, meta, detail);
    els.shareRepositoryReceiptList.appendChild(item);
  });
}

function formatShareRepositoryReceiptDirection(direction) {
  return {
    check: "检查",
    push: "发布",
    revoke: "撤销"
  }[direction] || "回执";
}

function formatShareRepositoryReceiptVerificationStatus(status) {
  return {
    verified: "本机校验通过",
    "workspace-mismatch": "空间不匹配",
    "digest-mismatch": "摘要不匹配"
  }[status] || "未校验";
}

function createLatestArtworkShareLink() {
  const artwork = window.MRAppState?.getLatestReview?.()?.artwork;
  if (!artwork) {
    showNotice("请先保存作品，再生成本机分享链接。");
    return;
  }

  const result = window.MRAppState?.createArtworkShareLink?.(artwork.id);
  if (result?.record?.id) {
    activeArtworkShareId = result.record.id;
    setArtworkShareRoute(result.record.id);
  }
  showNotice(result?.message || "本机分享链接生成失败。");
  renderLearningState();
}

function copyActiveArtworkShareLink(shareId = activeArtworkShareId) {
  const record = getShareRecordForAction(shareId);
  if (!record?.isActive) {
    showNotice("没有可复制的有效本机分享链接。");
    return;
  }

  activeArtworkShareId = record.id;
  const url = getArtworkShareUrl(record.id);
  setArtworkShareRoute(record.id);
  copyText(url).then((ok) => {
    const result = window.MRAppState?.markArtworkShareLinkCopied?.(record.id);
    showNotice(ok
      ? `已复制本机分享链接：${record.artworkTitle || record.title}`
      : result?.message || "已把本机分享链接写入地址栏，可手动复制。");
    renderLearningState();
  });
}

function revokeActiveArtworkShareLink(shareId = activeArtworkShareId) {
  const record = getShareRecordForAction(shareId);
  if (!record) {
    showNotice("没有可撤销的本机分享链接。");
    return;
  }

  const result = window.MRAppState?.revokeArtworkShareLink?.(record.id);
  if (activeArtworkShareId === record.id) {
    activeArtworkShareId = null;
  }
  showNotice(result?.message || "本机分享链接撤销失败。");
  renderLearningState();
}

function saveShareRemoteConfig() {
  const endpoint = els.shareRemoteEndpointInput?.value || "";
  const token = els.shareRemoteTokenInput?.value || "";
  const workspaceId = els.shareRemoteWorkspaceInput?.value || "";
  const result = window.MRAppState?.configureShareServiceRemote?.({
    remoteEndpoint: endpoint,
    remoteToken: token,
    workspaceId
  });
  showNotice(result?.message || "远端分享 API 配置保存失败。");
  renderLearningState();
}

async function checkShareRemote() {
  setShareRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.checkRemoteShareService?.());
    showNotice(result?.message || "远端分享 API 检查失败。");
  } catch (error) {
    showNotice(`远端分享 API 检查失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setShareRemoteBusy(false);
    renderLearningState();
  }
}

async function pushActiveShareRemote() {
  const record = getShareRecordForAction();
  if (!record?.isActive) {
    showNotice("请先生成有效的本机分享链接，再发布到远端 API。");
    return;
  }
  setShareRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.pushArtworkShareToRemote?.(record.id));
    if (result?.publicUrl) {
      activeArtworkShareId = record.id;
    }
    showNotice(result?.message || "远端分享 API 发布失败。");
  } catch (error) {
    showNotice(`远端分享 API 发布失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setShareRemoteBusy(false);
    renderLearningState();
  }
}

async function revokeActiveShareRemote() {
  const record = getShareRecordForAction();
  if (!record?.remotePublicUrl) {
    showNotice("这条分享还没有远端公开链接，无法撤销远端。");
    return;
  }
  if (record.remoteRevokedAt) {
    showNotice("这条分享的远端链接此前已撤销。");
    return;
  }
  setShareRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.revokeArtworkShareRemote?.(record.id));
    showNotice(result?.message || "远端分享 API 撤销失败。");
  } catch (error) {
    showNotice(`远端分享 API 撤销失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setShareRemoteBusy(false);
    renderLearningState();
  }
}

function copyRemoteShareUrl() {
  const status = window.MRAppState?.getShareServiceStatus?.();
  const publicUrl = status?.lastRemotePublicUrl || "";
  if (!publicUrl) {
    showNotice("还没有可复制的远端分享链接。");
    return;
  }
  copyText(publicUrl).then((ok) => {
    showNotice(ok
      ? "已复制远端分享链接。"
      : `远端分享链接：${publicUrl}`);
  });
}

function exportShareRepositoryReceipts() {
  const result = window.MRAppState?.downloadShareRepositoryReceiptAudit?.();
  if (result?.message) {
    showNotice(result.message);
  } else {
    showNotice("暂无可导出的作品分享远端回执。");
  }
  renderLearningState();
}

function setShareRemoteBusy(isBusy) {
  [
    els.shareRemoteSaveButton,
    els.shareRemoteWorkspaceInput,
    els.shareRemoteCheckButton,
    els.shareRemotePushButton,
    els.shareRemoteRevokeButton,
    els.shareRemoteCopyButton,
    els.shareRepositoryReceiptExportButton
  ].forEach((button) => {
    if (button) {
      button.disabled = Boolean(isBusy);
    }
  });
}

function handleShareRecordAction(event) {
  const button = event.target.closest("[data-share-record-action]");
  if (!button) return;
  const action = button.dataset.shareRecordAction;
  const recordId = button.dataset.shareRecordId;
  if (action === "copy") {
    copyActiveArtworkShareLink(recordId);
  } else if (action === "revoke") {
    revokeActiveArtworkShareLink(recordId);
  }
}

function getShareRecordForAction(shareId = activeArtworkShareId) {
  const status = window.MRAppState?.getShareServiceStatus?.();
  const id = String(shareId || "").trim();
  if (id) {
    return status?.records?.find((record) => record.id === id) || null;
  }
  return status?.currentRecord || status?.latestRecord || null;
}

function renderReportPanel(sceneIndex = currentIndex) {
  if (!els.reportPanel || !window.MRAppState?.getReportDetail) {
    return;
  }

  let detail = window.MRAppState.getReportDetail(activeReportDetailId);
  if (activeReportDetailId && !detail) {
    activeReportDetailId = null;
    clearReportDetailRoute();
    detail = window.MRAppState.getReportDetail();
  }

  const shouldShow = Boolean(detail || sceneIndex >= REPORT_DETAIL_SCENE_INDEX);
  els.reportPanel.hidden = !shouldShow;
  if (!shouldShow) {
    return;
  }

  if (!detail) {
    renderReportEmptyState();
    setReportDetailActions(null);
    return;
  }

  els.reportTitle.textContent = detail.title || "学习报告";
  els.reportStatus.textContent = detail.status || "站内报告";
  els.reportSummary.textContent = `${formatHistoryTime(detail.createdAt)} / ${detail.summary || "本报告基于本机练习、作品和评分记录生成。"}`;
  renderReportVerification(detail);
  renderReportStats(detail);
  activeReportMetricKey = normalizeReportMetricKey(activeReportMetricKey);
  renderReportMetrics(detail, activeReportMetricKey);
  renderReportTrend(detail, activeReportMetricKey);
  renderReportComparison(window.MRAppState.getReportComparison?.(detail.id));
  renderReportSeries(window.MRAppState.getReportSeries?.(detail.id), activeReportMetricKey);
  renderReportLatest(detail);
  renderReportRecommendations(detail.recommendations || []);
  renderReportTeacherReview(detail);
  renderReportRepositoryStatus(detail);
  setReportDetailActions(detail);
}

function renderReportEmptyState() {
  els.reportTitle.textContent = "暂无站内报告";
  els.reportStatus.textContent = "待生成";
  els.reportSummary.textContent = "点击“导出报告”后，会生成可下载的 HTML 文件，并在这里展示同一份本机报告。";
  [
    els.reportStats,
    els.reportVerification,
    els.reportMetrics,
    els.reportTrend,
    els.reportComparison,
    els.reportSeries,
    els.reportLatest,
    els.reportRecommendations
  ].forEach((node) => {
    if (node) node.innerHTML = "";
  });

  if (els.reportStats) {
    const empty = document.createElement("p");
    empty.className = "report-empty";
    empty.textContent = "还没有报告记录。完成一次真实练习并导出报告后，这里会显示学习统计、能力结构、趋势和建议。";
    els.reportStats.appendChild(empty);
  }
  renderReportTeacherReview(null);
  renderReportRepositoryStatus(null);
}

function renderReportVerification(detail) {
  if (!els.reportVerification) return;
  els.reportVerification.innerHTML = "";
  const result = detail?.id ? window.MRAppState?.getReportVerification?.(detail.id) : null;
  const verification = result?.ok ? result.verification : null;

  const heading = document.createElement("strong");
  heading.textContent = "本机验真摘要";
  const status = document.createElement("small");
  status.textContent = verification
    ? `${verification.algorithm} / ${verification.kind}`
    : "暂无可验真的报告记录。";
  els.reportVerification.append(heading, status);

  if (!verification) {
    return;
  }

  const digest = document.createElement("code");
  digest.textContent = verification.digest;
  const boundary = document.createElement("p");
  boundary.textContent = verification.boundary;
  els.reportVerification.append(digest, boundary);
}

function renderReportStats(detail) {
  if (!els.reportStats) return;
  els.reportStats.innerHTML = "";
  [
    ["练习", `${detail.sessionCount || 0}次`],
    ["作品", `${detail.artworkCount || 0}幅`],
    ["平均", `${detail.averageScore || 0}分`],
    ["分钟", `${detail.learningMinutes || 0}`]
  ].forEach(([label, value]) => {
    const item = document.createElement("span");
    const name = document.createElement("small");
    const data = document.createElement("strong");
    name.textContent = label;
    data.textContent = value;
    item.append(name, data);
    els.reportStats.appendChild(item);
  });
}

function renderReportMetrics(detail, selectedKey = activeReportMetricKey) {
  if (!els.reportMetrics) return;
  els.reportMetrics.innerHTML = "";
  const metrics = detail?.scoreBreakdown || {};
  const activeKey = normalizeReportMetricKey(selectedKey);
  const activeLabel = getReportMetricLabel(activeKey);
  const activeValue = clamp(Number(metrics?.[activeKey]) || 0, 0, 100);
  const activePoints = getReportMetricPoints(detail, activeKey);
  const guide = REPORT_METRIC_GUIDES[activeKey] || {};
  const title = document.createElement("strong");
  title.textContent = "能力结构";
  const list = document.createElement("div");
  list.className = "report-metric-list";

  REPORT_METRIC_LABELS.forEach(([key, label]) => {
    const value = clamp(Number(metrics?.[key]) || 0, 0, 100);
    const row = document.createElement("button");
    row.type = "button";
    row.className = `report-metric-row is-${key}`;
    row.dataset.reportMetric = key;
    row.setAttribute("aria-pressed", String(key === activeKey));
    const name = document.createElement("span");
    name.textContent = label;
    const track = document.createElement("i");
    track.setAttribute("aria-hidden", "true");
    const fill = document.createElement("b");
    fill.style.width = `${value}%`;
    track.appendChild(fill);
    const score = document.createElement("em");
    score.textContent = value ? `${value}` : "未评分";
    row.append(name, track, score);
    list.appendChild(row);
  });

  const detailCard = document.createElement("div");
  detailCard.className = "report-metric-detail";
  const detailTitle = document.createElement("span");
  detailTitle.textContent = `${activeLabel}：${activeValue ? `${activeValue}分` : "未评分"}`;
  const detailBody = document.createElement("p");
  detailBody.textContent = activePoints.length
    ? `${guide.focus || activeLabel}共有 ${activePoints.length} 个真实趋势点；${guide.advice || "继续保存更多练习后会形成更稳定的判断。"}`
    : `${guide.focus || activeLabel}暂无趋势点。保存带评分的练习或导出报告后，这里会显示字段变化。`;
  detailCard.append(detailTitle, detailBody);

  els.reportMetrics.append(title, list, detailCard);
}

function renderReportTrend(detail, metricKey = activeReportMetricKey) {
  if (!els.reportTrend) return;
  els.reportTrend.innerHTML = "";
  const activeKey = normalizeReportMetricKey(metricKey);
  const metricLabel = getReportMetricLabel(activeKey);
  const points = getReportMetricPoints(detail, activeKey);
  const title = document.createElement("strong");
  title.textContent = `${metricLabel}趋势`;
  els.reportTrend.appendChild(title);

  if (!points.length) {
    const empty = document.createElement("p");
    empty.className = "report-empty";
    empty.textContent = `暂无${metricLabel}趋势点。保存练习或导出报告后，会记录该字段的真实分数变化。`;
    els.reportTrend.appendChild(empty);
    return;
  }

  const bars = document.createElement("div");
  bars.className = "report-trend-bars";
  points.slice(-8).forEach((item) => {
    const bar = document.createElement("span");
    const score = clamp(Number(item.value) || 0, 6, 100);
    bar.className = `report-trend-bar is-${item.type || "record"}`;
    bar.style.setProperty("--report-score-height", `${score}%`);
    bar.title = `${item.label || "记录"} ${metricLabel} ${item.value || 0}分`;
    bar.setAttribute("aria-label", bar.title);

    const value = document.createElement("em");
    value.textContent = String(item.value || "-");
    const label = document.createElement("small");
    label.textContent = item.label || "记录";
    bar.append(value, label);
    bars.appendChild(bar);
  });
  els.reportTrend.appendChild(bars);
}

function renderReportComparison(comparison) {
  if (!els.reportComparison) return;
  els.reportComparison.innerHTML = "";
  const title = document.createElement("strong");
  title.textContent = "报告对比";
  els.reportComparison.appendChild(title);

  if (!comparison?.ok) {
    const empty = document.createElement("p");
    empty.className = "report-empty";
    empty.textContent = comparison?.message || "至少生成两份报告后，这里会显示本机报告跨版本变化。";
    els.reportComparison.appendChild(empty);
    return;
  }

  const meta = document.createElement("div");
  meta.className = "report-comparison-meta";
  const previous = document.createElement("span");
  previous.textContent = `上份 ${formatHistoryTime(comparison.previous.createdAt)}`;
  const current = document.createElement("span");
  current.textContent = `本份 ${formatHistoryTime(comparison.current.createdAt)}`;
  meta.append(previous, current);

  const summary = document.createElement("p");
  summary.className = "report-comparison-summary";
  summary.textContent = comparison.summary || "已读取两份本机报告进行对比。";

  const stats = document.createElement("div");
  stats.className = "report-comparison-stats";
  [
    ["平均分", comparison.averageDelta, "分"],
    ["练习", comparison.sessionDelta, "次"],
    ["作品", comparison.artworkDelta, "幅"],
    ["分钟", comparison.learningMinutesDelta, ""]
  ].forEach(([label, value, unit]) => {
    const item = document.createElement("span");
    const name = document.createElement("small");
    name.textContent = label;
    const data = document.createElement("em");
    data.textContent = formatSignedDelta(value, unit);
    data.dataset.tone = value > 0 ? "up" : value < 0 ? "down" : "same";
    item.append(name, data);
    stats.appendChild(item);
  });

  const metrics = document.createElement("div");
  metrics.className = "report-comparison-metrics";
  (comparison.metricDeltas || []).forEach((metric) => {
    const item = document.createElement("span");
    item.dataset.tone = metric.delta > 0 ? "up" : metric.delta < 0 ? "down" : "same";
    item.textContent = `${metric.label} ${metric.previous || "-"} → ${metric.current || "-"} (${formatSignedDelta(metric.delta)})`;
    metrics.appendChild(item);
  });

  const actions = document.createElement("div");
  actions.className = "report-comparison-actions";
  [
    ["查看上份", comparison.previous.id],
    ["查看本份", comparison.current.id]
  ].forEach(([label, id]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.featureState = "real-local";
    button.dataset.reportJump = id;
    button.textContent = label;
    actions.appendChild(button);
  });
  const exportButton = document.createElement("button");
  exportButton.id = "reportComparisonExport";
  exportButton.type = "button";
  exportButton.dataset.featureState = "real-export";
  exportButton.dataset.reportComparisonExport = comparison.current.id;
  exportButton.textContent = "导出对比页";
  actions.appendChild(exportButton);

  els.reportComparison.append(meta, summary, stats, metrics, actions);
}

function renderReportSeries(series, metricKey = activeReportMetricKey) {
  if (!els.reportSeries) return;
  els.reportSeries.innerHTML = "";
  const title = document.createElement("strong");
  title.textContent = "多报告趋势";
  els.reportSeries.appendChild(title);

  if (!series?.ok) {
    const empty = document.createElement("p");
    empty.className = "report-empty";
    empty.textContent = series?.message || "至少生成两份报告后，这里会显示多报告趋势。";
    els.reportSeries.appendChild(empty);
    return;
  }

  const selectedKeys = getActiveReportSeriesMetricKeys(metricKey);
  const visibleSeries = getVisibleReportSeries(series);
  const selectedMetrics = selectedKeys
    .map((key) => (visibleSeries.metricSeries || []).find((item) => item.key === key))
    .filter(Boolean);
  const metricText = selectedMetrics.length
    ? selectedMetrics.map((metric) => `${metric.label}${formatSignedDelta(metric.delta)}`).join(" / ")
    : "未选择字段";
  const pointSelection = getReportSeriesPointSelection(visibleSeries);
  const summary = document.createElement("p");
  summary.className = "report-series-summary";
  summary.textContent = `${visibleSeries.summary || series.summary || "已读取本机报告序列。"} 字段对比：${metricText}。`;

  const zoomControls = createReportSeriesZoomControls(series, visibleSeries);
  const templateControls = createReportSeriesTemplateControls(selectedKeys);
  const controls = createReportSeriesMetricControls(selectedKeys, visibleSeries.metricSeries || []);
  const chart = createReportSeriesChart(visibleSeries, selectedMetrics, pointSelection.point?.id);
  const points = document.createElement("div");
  points.className = "report-series-points";
  (visibleSeries.points || []).forEach((point) => {
    const card = document.createElement("div");
    card.className = "report-series-point-card";
    card.classList.toggle("is-selected", point.id === pointSelection.point?.id);
    card.dataset.reportSeriesTooltip = "";
    card.dataset.tooltipTitle = point.title || `第${point.sequence}份报告`;
    card.dataset.tooltipBody = `平均 ${point.averageScore || 0} 分 / 练习 ${point.sessionCount || 0} 次 / 作品 ${point.artworkCount || 0} 幅 / ${formatHistoryTime(point.createdAt)}`;
    const label = document.createElement("span");
    label.textContent = `第${point.sequence}份`;
    const score = document.createElement("strong");
    score.textContent = `${point.averageScore || 0}`;
    const meta = document.createElement("small");
    meta.textContent = formatHistoryTime(point.createdAt);
    const actions = document.createElement("div");
    actions.className = "report-series-point-actions";
    const detailButton = document.createElement("button");
    detailButton.type = "button";
    detailButton.dataset.featureState = "real-local";
    detailButton.dataset.reportSeriesPointDetail = point.id;
    detailButton.setAttribute("aria-pressed", String(point.id === pointSelection.point?.id));
    if (point.id === pointSelection.point?.id) {
      detailButton.id = "reportSeriesPointDetail";
    }
    detailButton.textContent = "明细";
    const reportButton = document.createElement("button");
    reportButton.type = "button";
    reportButton.dataset.featureState = "real-local";
    reportButton.dataset.reportJump = point.id;
    reportButton.textContent = "报告";
    actions.append(detailButton, reportButton);
    card.append(label, score, meta, actions);
    points.appendChild(card);
  });
  const pointDetail = createReportSeriesPointDetail(pointSelection, visibleSeries);

  els.reportSeries.append(summary, zoomControls, templateControls, controls, chart, points, pointDetail, createReportSeriesTooltip());
}

function createReportSeriesZoomControls(series, visibleSeries) {
  const total = (series.points || []).length;
  const visibleCount = (visibleSeries.points || []).length;
  const controls = document.createElement("div");
  controls.className = "report-series-zoom-controls";

  const status = document.createElement("span");
  status.id = "reportSeriesZoomStatus";
  status.textContent = total > visibleCount
    ? `显示最近 ${visibleCount} / ${total} 份`
    : `显示全部 ${total} 份`;

  [
    ["in", "放大", "reportSeriesZoomIn", visibleCount <= 2],
    ["out", "缩小", "reportSeriesZoomOut", visibleCount >= total],
    ["reset", "重置", "reportSeriesZoomReset", visibleCount >= total]
  ].forEach(([action, label, id, disabled]) => {
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.dataset.featureState = "real-local";
    button.dataset.reportSeriesZoom = action;
    button.disabled = Boolean(disabled);
    button.textContent = label;
    controls.appendChild(button);
  });

  controls.appendChild(status);
  return controls;
}

function createReportSeriesTemplateControls(selectedKeys) {
  const controls = document.createElement("div");
  controls.id = "reportSeriesTemplates";
  controls.className = "report-series-template-controls";
  const activeTemplateKey = getActiveReportSeriesTemplateKey(selectedKeys);

  REPORT_SERIES_TEMPLATES.forEach((template) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.featureState = "real-local";
    button.dataset.reportSeriesTemplate = template.key;
    button.setAttribute("aria-pressed", String(template.key === activeTemplateKey));
    button.textContent = template.label;
    controls.appendChild(button);
  });

  return controls;
}

function getVisibleReportSeries(series) {
  const points = series?.points || [];
  const total = points.length;
  if (total <= 2) {
    activeReportSeriesWindowSize = null;
    return {
      ...series,
      visibleCount: total,
      totalCount: total
    };
  }

  const windowSize = activeReportSeriesWindowSize
    ? clamp(Math.round(activeReportSeriesWindowSize), 2, total)
    : total;
  activeReportSeriesWindowSize = windowSize >= total ? null : windowSize;
  const visibleCount = activeReportSeriesWindowSize || total;
  const visiblePoints = points.slice(-visibleCount);
  const visibleIds = new Set(visiblePoints.map((point) => point.id));
  const visibleMetricSeries = (series.metricSeries || []).map((metric) => {
    const metricPoints = (metric.points || []).filter((point) => visibleIds.has(point.id));
    const first = metricPoints[0]?.value || 0;
    const latest = metricPoints[metricPoints.length - 1]?.value || 0;
    return {
      ...metric,
      points: metricPoints,
      first,
      latest,
      delta: latest - first
    };
  });
  const firstPoint = visiblePoints[0];
  const latestPoint = visiblePoints[visiblePoints.length - 1];
  const averageDelta = (latestPoint?.averageScore || 0) - (firstPoint?.averageScore || 0);
  return {
    ...series,
    points: visiblePoints,
    metricSeries: visibleMetricSeries,
    visibleCount,
    totalCount: total,
    averageDelta,
    summary: visibleCount < total
      ? `已放大查看最近 ${visibleCount} / ${total} 份本机报告，当前视图平均分较首份${formatSignedDelta(averageDelta, "分")}。`
      : series.summary
  };
}

function getReportSeriesPointSelection(series) {
  const points = series?.points || [];
  if (!points.length) {
    activeReportSeriesPointId = null;
    return { point: null, previous: null, index: -1 };
  }

  const fallback = points.find((point) => point.current) || points[points.length - 1];
  if (!points.some((point) => point.id === activeReportSeriesPointId)) {
    activeReportSeriesPointId = fallback.id;
  }
  const index = points.findIndex((point) => point.id === activeReportSeriesPointId);
  return {
    point: points[index] || fallback,
    previous: index > 0 ? points[index - 1] : null,
    index
  };
}

function createReportSeriesPointDetail(selection, series) {
  const panel = document.createElement("div");
  panel.className = "report-series-point-detail";
  panel.setAttribute("aria-live", "polite");
  const point = selection.point;
  if (!point) {
    panel.textContent = "选择一份报告后显示逐点明细。";
    return panel;
  }

  const previous = selection.previous;
  const head = document.createElement("div");
  head.className = "report-series-point-detail-head";
  const title = document.createElement("strong");
  title.textContent = point.title || `第${point.sequence}份报告`;
  const meta = document.createElement("span");
  meta.textContent = `${formatHistoryTime(point.createdAt)} / 第 ${point.sequence} 份 / 当前视图 ${selection.index + 1} / ${(series.points || []).length}`;
  head.append(title, meta);

  const stats = document.createElement("div");
  stats.className = "report-series-point-detail-stats";
  [
    ["平均分", point.averageScore || 0, previous ? point.averageScore - previous.averageScore : null, "分"],
    ["练习", point.sessionCount || 0, previous ? point.sessionCount - previous.sessionCount : null, "次"],
    ["作品", point.artworkCount || 0, previous ? point.artworkCount - previous.artworkCount : null, "幅"],
    ["分钟", point.learningMinutes || 0, previous ? point.learningMinutes - previous.learningMinutes : null, ""]
  ].forEach(([label, value, delta, unit]) => {
    const item = document.createElement("span");
    const name = document.createElement("small");
    name.textContent = label;
    const data = document.createElement("em");
    data.textContent = `${value}${unit}`;
    const trend = document.createElement("b");
    trend.dataset.tone = delta > 0 ? "up" : delta < 0 ? "down" : "same";
    trend.textContent = delta === null ? "首份" : formatSignedDelta(delta, unit);
    item.append(name, data, trend);
    stats.appendChild(item);
  });

  const metrics = document.createElement("div");
  metrics.className = "report-series-point-detail-metrics";
  REPORT_METRIC_LABELS.forEach(([key, label]) => {
    const value = clamp(Number(point.scoreBreakdown?.[key]) || 0, 0, 100);
    const prevValue = previous ? clamp(Number(previous.scoreBreakdown?.[key]) || 0, 0, 100) : null;
    const row = document.createElement("span");
    row.dataset.tone = prevValue === null ? "same" : value > prevValue ? "up" : value < prevValue ? "down" : "same";
    row.textContent = prevValue === null
      ? `${label} ${value}分`
      : `${label} ${prevValue} → ${value} (${formatSignedDelta(value - prevValue)})`;
    metrics.appendChild(row);
  });

  const actions = document.createElement("div");
  actions.className = "report-series-point-detail-actions";
  const open = document.createElement("button");
  open.type = "button";
  open.dataset.featureState = "real-local";
  open.dataset.reportJump = point.id;
  open.textContent = "打开这份报告";
  actions.appendChild(open);

  panel.append(head, stats, metrics, actions);
  return panel;
}

function createReportSeriesMetricControls(selectedKeys, metricSeries = []) {
  const controls = document.createElement("div");
  controls.className = "report-series-metric-controls";
  REPORT_METRIC_LABELS.forEach(([key, label]) => {
    const metric = metricSeries.find((item) => item.key === key);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.featureState = "real-local";
    button.dataset.reportSeriesMetric = key;
    button.dataset.reportSeriesTooltip = "";
    button.dataset.tooltipTitle = `${label}趋势`;
    button.dataset.tooltipBody = metric
      ? `首份 ${metric.first || 0} 分，最新 ${metric.latest || 0} 分，变化 ${formatSignedDelta(metric.delta)}。`
      : "当前报告序列没有这个字段的评分点。";
    button.setAttribute("aria-pressed", String(selectedKeys.includes(key)));
    button.title = `${label}趋势 ${metric ? formatSignedDelta(metric.delta) : "暂无变化"}`;
    const name = document.createElement("span");
    name.textContent = label;
    const delta = document.createElement("em");
    delta.textContent = metric ? formatSignedDelta(metric.delta) : "-";
    button.append(name, delta);
    controls.appendChild(button);
  });
  return controls;
}

function createReportSeriesChart(series, selectedMetrics = [], selectedPointId = "") {
  const points = series.points || [];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "report-series-chart");
  svg.setAttribute("viewBox", "0 0 320 128");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "多报告平均分和多字段趋势图");

  const axis = document.createElementNS("http://www.w3.org/2000/svg", "path");
  axis.setAttribute("class", "report-series-axis");
  axis.setAttribute("d", "M24 12 V106 H304");
  svg.appendChild(axis);

  const averageCoords = points.map((point, index) => makeReportSeriesCoord(point.averageScore, index, points.length));
  svg.appendChild(createReportSeriesPolyline(averageCoords, "report-series-line is-average", "平均分趋势", `从 ${points[0]?.averageScore || 0} 分到 ${points[points.length - 1]?.averageScore || 0} 分，共 ${points.length} 份报告。`));
  selectedMetrics.forEach((metric, metricIndex) => {
    const metricPointMap = new Map((metric.points || []).map((point) => [point.id, point.value]));
    const metricCoords = points
      .map((point, index) => {
        const value = metricPointMap.get(point.id);
        return Number.isFinite(value) && value > 0
          ? makeReportSeriesCoord(value, index, points.length)
          : null;
      })
      .filter(Boolean);
    if (metricCoords.length > 1) {
      svg.appendChild(createReportSeriesPolyline(metricCoords, `report-series-line is-metric is-metric-${metricIndex}`, `${metric.label}趋势`, `首份 ${metric.first || 0} 分，最新 ${metric.latest || 0} 分，变化 ${formatSignedDelta(metric.delta)}。`));
    }
  });

  points.forEach((point, index) => {
    const average = averageCoords[index];
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const classNames = ["report-series-dot"];
    if (point.current) classNames.push("is-current");
    if (point.id === selectedPointId) classNames.push("is-selected");
    circle.setAttribute("class", classNames.join(" "));
    circle.setAttribute("cx", average.x);
    circle.setAttribute("cy", average.y);
    circle.setAttribute("r", point.current ? "4.6" : "3.4");
    circle.setAttribute("aria-label", `${point.title} 平均 ${point.averageScore || 0} 分`);
    circle.setAttribute("tabindex", "0");
    circle.setAttribute("role", "button");
    circle.dataset.reportSeriesPointDetail = point.id;
    circle.dataset.reportSeriesTooltip = "";
    circle.dataset.tooltipTitle = point.title || `第${point.sequence}份报告`;
    circle.dataset.tooltipBody = `平均 ${point.averageScore || 0} 分 / 练习 ${point.sessionCount || 0} 次 / 作品 ${point.artworkCount || 0} 幅 / ${formatHistoryTime(point.createdAt)}`;
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${point.title} / 平均 ${point.averageScore || 0} 分 / ${formatHistoryTime(point.createdAt)}`;
    circle.appendChild(title);
    svg.appendChild(circle);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "report-series-label");
    label.setAttribute("x", average.x);
    label.setAttribute("y", "122");
    label.setAttribute("text-anchor", "middle");
    label.textContent = String(point.sequence);
    svg.appendChild(label);
  });

  const legend = document.createElementNS("http://www.w3.org/2000/svg", "text");
  legend.setAttribute("class", "report-series-legend");
  legend.setAttribute("x", "304");
  legend.setAttribute("y", "18");
  legend.setAttribute("text-anchor", "end");
  legend.textContent = selectedMetrics.length
    ? `平均 / ${selectedMetrics.map((metric) => metric.label).join(" / ")}`
    : "平均";
  svg.appendChild(legend);

  return svg;
}

function createReportSeriesPolyline(coords, className, label = "", detail = "") {
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("class", className);
  polyline.setAttribute("points", coords.map((point) => `${point.x},${point.y}`).join(" "));
  polyline.setAttribute("tabindex", "0");
  polyline.dataset.reportSeriesTooltip = "";
  polyline.dataset.tooltipTitle = label;
  polyline.dataset.tooltipBody = detail || "这条线基于本机报告序列生成。";
  if (label) {
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = label;
    polyline.appendChild(title);
  }
  return polyline;
}

function makeReportSeriesCoord(score, index, total) {
  const left = 28;
  const width = 272;
  const top = 14;
  const height = 88;
  const x = total > 1 ? left + (width * index) / (total - 1) : left + width / 2;
  const y = top + height - (clamp(Number(score) || 0, 0, 100) / 100) * height;
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2))
  };
}

function createReportSeriesTooltip() {
  const tooltip = document.createElement("div");
  tooltip.id = "reportSeriesTooltip";
  tooltip.className = "report-series-tooltip";
  tooltip.dataset.reportSeriesTooltipBox = "";
  tooltip.dataset.pinned = "false";
  tooltip.setAttribute("role", "group");
  tooltip.setAttribute("aria-label", "趋势详情提示");
  tooltip.setAttribute("aria-live", "polite");

  const content = document.createElement("div");
  content.className = "report-series-tooltip-content";
  const title = document.createElement("strong");
  title.dataset.reportSeriesTooltipTitle = "";
  const body = document.createElement("span");
  body.dataset.reportSeriesTooltipBody = "";
  content.append(title, body);

  const actions = document.createElement("div");
  actions.className = "report-series-tooltip-actions";
  const pin = document.createElement("button");
  pin.id = "reportSeriesTooltipPin";
  pin.type = "button";
  pin.dataset.featureState = "real-local";
  pin.dataset.reportSeriesTooltipAction = "pin";
  pin.setAttribute("aria-pressed", "false");
  pin.textContent = "固定";
  const copy = document.createElement("button");
  copy.id = "reportSeriesTooltipCopy";
  copy.type = "button";
  copy.dataset.featureState = "real-local";
  copy.dataset.reportSeriesTooltipAction = "copy";
  copy.textContent = "复制";
  actions.append(pin, copy);

  const status = document.createElement("small");
  status.className = "report-series-tooltip-status";
  status.dataset.reportSeriesTooltipStatus = "";

  tooltip.append(content, actions, status);
  tooltip.hidden = true;
  return tooltip;
}

function showReportSeriesTooltip(target, event = null) {
  const tooltip = getReportSeriesTooltip();
  if (!tooltip || !target?.dataset || !Object.prototype.hasOwnProperty.call(target.dataset, "reportSeriesTooltip")) {
    return;
  }
  if (isReportSeriesTooltipPinned(tooltip)) {
    return;
  }

  activeReportSeriesTooltipTarget = target;
  setReportSeriesTooltipContent(
    tooltip,
    target.dataset.tooltipTitle || "趋势详情",
    target.dataset.tooltipBody || "这项数据来自本机报告记录。"
  );
  tooltip.hidden = false;

  if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
    positionReportSeriesTooltip(event.clientX, event.clientY);
    return;
  }

  const rect = target.getBoundingClientRect?.();
  if (rect) {
    positionReportSeriesTooltip(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
}

function moveReportSeriesTooltip(event) {
  const tooltip = getReportSeriesTooltip();
  if (!tooltip || tooltip.hidden || isReportSeriesTooltipPinned(tooltip)) return;
  positionReportSeriesTooltip(event.clientX, event.clientY);
}

function positionReportSeriesTooltip(clientX, clientY) {
  const tooltip = getReportSeriesTooltip();
  if (!tooltip || !els.reportSeries) return;
  const rect = els.reportSeries.getBoundingClientRect();
  const tooltipWidth = Math.min(260, Math.max(178, rect.width - 16));
  const left = clamp(clientX - rect.left + 12, 8, Math.max(8, rect.width - tooltipWidth - 8));
  const top = clamp(clientY - rect.top + 12, 8, Math.max(8, rect.height - 118));
  tooltip.style.width = `${tooltipWidth}px`;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideReportSeriesTooltip(options = {}) {
  const tooltip = getReportSeriesTooltip();
  if (!tooltip) return;
  if (isReportSeriesTooltipPinned(tooltip) && !options.force) return;
  tooltip.dataset.pinned = "false";
  tooltip.classList.remove("is-pinned");
  updateReportSeriesTooltipState(tooltip);
  activeReportSeriesTooltipTarget = null;
  tooltip.hidden = true;
}

function getReportSeriesTooltip() {
  return els.reportSeries?.querySelector("[data-report-series-tooltip-box]") || null;
}

function isReportSeriesTooltipPinned(tooltip = getReportSeriesTooltip()) {
  return tooltip?.dataset.pinned === "true";
}

function setReportSeriesTooltipContent(tooltip, titleText, bodyText) {
  tooltip.dataset.tooltipTitle = titleText;
  tooltip.dataset.tooltipBody = bodyText;
  const title = tooltip.querySelector("[data-report-series-tooltip-title]");
  const body = tooltip.querySelector("[data-report-series-tooltip-body]");
  if (title) title.textContent = titleText;
  if (body) body.textContent = bodyText;
  updateReportSeriesTooltipState(tooltip);
}

function updateReportSeriesTooltipState(tooltip = getReportSeriesTooltip(), statusText = "") {
  if (!tooltip) return;
  const pinned = isReportSeriesTooltipPinned(tooltip);
  tooltip.classList.toggle("is-pinned", pinned);
  const pin = tooltip.querySelector("[data-report-series-tooltip-action='pin']");
  if (pin) {
    pin.textContent = pinned ? "解除" : "固定";
    pin.setAttribute("aria-pressed", String(pinned));
  }
  const status = tooltip.querySelector("[data-report-series-tooltip-status]");
  if (status) {
    status.textContent = statusText || (pinned ? "已固定，可复制或按 Esc 关闭。" : "悬停后可固定或复制。");
  }
}

function handleReportSeriesTooltipAction(action) {
  const tooltip = getReportSeriesTooltip();
  if (!tooltip || tooltip.hidden) return;

  if (action === "pin") {
    const pinned = !isReportSeriesTooltipPinned(tooltip);
    tooltip.dataset.pinned = String(pinned);
    tooltip.hidden = false;
    updateReportSeriesTooltipState(tooltip);
    showNotice(pinned ? "已固定趋势提示，可继续复制。" : "已解除趋势提示固定。");
    return;
  }

  if (action === "copy") {
    const title = tooltip.dataset.tooltipTitle || "趋势详情";
    const body = tooltip.dataset.tooltipBody || "这项数据来自本机报告记录。";
    copyText(`${title}\n${body}`).then((ok) => {
      updateReportSeriesTooltipState(tooltip, ok ? "已复制到剪贴板。" : "复制失败，可手动选中提示内容。");
      showNotice(ok ? "已复制趋势提示内容。" : "复制失败，可手动复制提示内容。");
    });
  }
}

function isReportSeriesTooltipTransition(node, target = activeReportSeriesTooltipTarget) {
  const tooltip = getReportSeriesTooltip();
  return isNodeInside(node, target) || isNodeInside(node, tooltip);
}

function isNodeInside(node, root) {
  return Boolean(node && root && (node === root || root.contains(node)));
}

function renderReportLatest(detail) {
  if (!els.reportLatest) return;
  els.reportLatest.innerHTML = "";
  const title = document.createElement("strong");
  title.textContent = "最近笔迹";
  els.reportLatest.appendChild(title);

  const latest = document.createElement("div");
  latest.className = "report-latest-grid";

  const session = document.createElement("div");
  session.className = "report-latest-text";
  const sessionTitle = document.createElement("span");
  sessionTitle.textContent = detail.latestSession?.title || "暂无练习会话";
  const sessionMeta = document.createElement("small");
  sessionMeta.textContent = detail.latestSession
    ? `${detail.latestSession.glyph || "-"} / ${detail.latestSession.strokeCount || 0} 笔 / ${detail.latestSession.pointCount || 0} 点 / ${detail.latestSession.score || 0}分`
    : "完成一次临摹后，报告会关联最近笔迹。";
  session.append(sessionTitle, sessionMeta);
  latest.appendChild(session);

  if (detail.latestArtwork?.imageData) {
    const image = document.createElement("img");
    image.src = detail.latestArtwork.imageData;
    image.alt = detail.latestArtwork.title || "最近作品";
    latest.appendChild(image);
  } else {
    const empty = document.createElement("p");
    empty.className = "report-empty";
    empty.textContent = detail.latestArtwork
      ? "最近作品没有截图，可从学习档案回放笔迹。"
      : "暂无最近作品截图。";
    latest.appendChild(empty);
  }

  els.reportLatest.appendChild(latest);
  els.reportLatest.appendChild(createReportScoreEvidenceSummaryNode(detail.scoreEvidenceSummary));
}

function createReportScoreEvidenceSummaryNode(evidence) {
  const panel = document.createElement("div");
  panel.className = "report-score-evidence";

  const heading = document.createElement("strong");
  heading.textContent = "基础评分证据";
  panel.appendChild(heading);

  if (!evidence) {
    const empty = document.createElement("p");
    empty.className = "report-empty";
    empty.textContent = "暂无可写入报告的评分证据。完成真实书写并保存作品后，会显示算法版本、笔顺、路径误差和压感摘要。";
    panel.appendChild(empty);
    return panel;
  }

  const summary = document.createElement("p");
  summary.textContent = evidence.summary || "本报告已保留最近一次本机评分证据。";
  panel.appendChild(summary);

  const stats = document.createElement("div");
  stats.className = "report-score-evidence-stats";
  [
    ["算法", evidence.algorithmVersion || "local-heuristic-v2.2.0"],
    ["笔顺匹配", `${evidence.strokeOrderMatchPercent || 0}%`],
    ["路径贴合", `${evidence.pathFitPercent || 0}%`],
    ["压感采样", `${evidence.pressurePointCount || 0}点`]
  ].forEach(([label, value]) => {
    const item = document.createElement("span");
    const name = document.createElement("small");
    const data = document.createElement("em");
    name.textContent = label;
    data.textContent = value;
    item.append(name, data);
    stats.appendChild(item);
  });
  panel.appendChild(stats);

  if (evidence.hotspots?.length) {
    const hotspot = document.createElement("small");
    hotspot.textContent = `误差热力：${evidence.hotspots.slice(0, 3).map((item) => `${item.label || item.zone} ${item.errorPercent}%`).join(" / ")}`;
    panel.appendChild(hotspot);
  }

  if (evidence.weakestReason) {
    const weakest = document.createElement("small");
    weakest.textContent = `最低项：${evidence.weakestReason.label || "维度"} ${evidence.weakestReason.score || 0}分`;
    panel.appendChild(weakest);
  }

  return panel;
}

function renderReportRecommendations(items) {
  if (!els.reportRecommendations) return;
  els.reportRecommendations.innerHTML = "";
  (items.length ? items : ["完成真实书写并保存作品后，会生成更具体的练习建议。"]).slice(0, 6).forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    els.reportRecommendations.appendChild(item);
  });
}

function renderReportTeacherReview(detail) {
  const review = detail?.teacherReview || null;
  if (els.reportTeacherReviewStatus) {
    const signature = review?.localSignatureDigest ? ` · 签名 ${review.localSignatureDigest.slice(0, 10)}` : "";
    els.reportTeacherReviewStatus.textContent = review
      ? `${review.reviewer || "本机教师"} · ${formatReportTeacherReviewRoleLabel(review.role)} · ${formatHistoryTime(review.reviewedAt)}${signature}`
      : "暂无本机教师批注。";
  }
  if (els.reportTeacherReviewView) {
    els.reportTeacherReviewView.textContent = review?.note || "批注会保存到当前浏览器的报告记录中，不代表云端教师端。";
  }
  if (els.reportTeacherReviewerInput && document.activeElement !== els.reportTeacherReviewerInput) {
    els.reportTeacherReviewerInput.value = review?.reviewer || "";
  }
  if (els.reportTeacherReviewRoleInput && document.activeElement !== els.reportTeacherReviewRoleInput) {
    els.reportTeacherReviewRoleInput.value = normalizeReportTeacherReviewRoleValue(review?.role);
  }
  if (els.reportTeacherReviewInput && document.activeElement !== els.reportTeacherReviewInput) {
    els.reportTeacherReviewInput.value = review?.note || "";
  }
  const hasDetail = Boolean(detail);
  if (els.reportTeacherReviewerInput) els.reportTeacherReviewerInput.disabled = !hasDetail;
  if (els.reportTeacherReviewRoleInput) els.reportTeacherReviewRoleInput.disabled = !hasDetail;
  if (els.reportTeacherReviewInput) els.reportTeacherReviewInput.disabled = !hasDetail;
  if (els.reportTeacherReviewSave) els.reportTeacherReviewSave.disabled = !hasDetail;
  if (els.reportTeacherReviewClear) els.reportTeacherReviewClear.disabled = !hasDetail || !review;
  renderReportTeacherReviewAudit(detail);
}

function renderReportTeacherReviewAudit(detail) {
  const audit = detail
    ? window.MRAppState?.getReportTeacherReviewAudit?.(detail.id)
    : null;
  const records = Array.isArray(audit?.records) ? audit.records : [];
  if (els.reportTeacherReviewAuditStatus) {
    els.reportTeacherReviewAuditStatus.textContent = detail
      ? audit?.message || "当前报告暂无教师批注审计记录。"
      : "请选择一份报告后查看教师批注审计记录。";
    els.reportTeacherReviewAuditStatus.dataset.auditTone = records.length ? "ready" : "idle";
  }
  if (els.reportTeacherReviewAuditExport) {
    els.reportTeacherReviewAuditExport.disabled = !detail || !records.length;
  }
  if (!els.reportTeacherReviewAuditList) return;
  els.reportTeacherReviewAuditList.replaceChildren();
  records.slice(0, 5).forEach((record) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${formatReportTeacherReviewAuditAction(record.action)} · ${record.reviewer || "本机教师"} · ${formatReportTeacherReviewRoleLabel(record.role)}`;
    const meta = document.createElement("span");
    const previousDigest = record.previousSignatureDigest || record.previousDigest;
    const nextDigest = record.nextSignatureDigest || record.nextDigest;
    const previousLabel = previousDigest ? previousDigest.slice(0, 10) : "无";
    const nextLabel = nextDigest ? nextDigest.slice(0, 10) : "无";
    meta.textContent = `${formatHistoryTime(record.createdAt)} · 签名 ${previousLabel} → ${nextLabel}`;
    const detailText = document.createElement("small");
    const detailSignature = record.nextSignatureDigest || record.previousSignatureDigest || "";
    detailText.textContent = record.nextPreview || record.previousPreview
      ? `${record.nextPreview || record.previousPreview} · ${detailSignature ? `本机签名 ${detailSignature.slice(0, 12)}` : "本机签名已记录"}`
      : record.message || "本机教师批注动作";
    item.append(title, meta, detailText);
    els.reportTeacherReviewAuditList.appendChild(item);
  });
}

function formatReportTeacherReviewAuditAction(action) {
  return action === "clear" ? "清除批注" : "保存批注";
}

function normalizeReportTeacherReviewRoleValue(role) {
  const value = String(role || "").trim();
  return ["local-teacher", "local-assistant", "local-reviewer"].includes(value) ? value : "local-teacher";
}

function formatReportTeacherReviewRoleLabel(role) {
  return {
    "local-teacher": "授课教师",
    "local-assistant": "助教",
    "local-reviewer": "教研审核"
  }[normalizeReportTeacherReviewRoleValue(role)] || "授课教师";
}

function renderReportRepositoryStatus(detail) {
  const status = window.MRAppState?.getReportRepositoryStatus?.();
  const config = window.MRAppState?.getReportRepositoryRemoteConfig?.();
  if (els.reportRepositorySummary) {
    els.reportRepositorySummary.textContent = status
      ? `${status.message} ${status.boundary}`
      : "报告仓库尚未初始化。";
    els.reportRepositorySummary.dataset.repositoryTone = status?.tone || "idle";
  }
  if (els.reportRepositoryEndpointInput && document.activeElement !== els.reportRepositoryEndpointInput) {
    els.reportRepositoryEndpointInput.value = config?.remoteEndpoint || "";
  }
  if (els.reportRepositoryTokenInput && document.activeElement !== els.reportRepositoryTokenInput) {
    els.reportRepositoryTokenInput.value = config?.remoteToken || "";
  }
  if (els.reportRepositoryWorkspaceInput && document.activeElement !== els.reportRepositoryWorkspaceInput) {
    els.reportRepositoryWorkspaceInput.value = config?.workspaceId || status?.workspaceId || "local-browser";
  }
  if (els.reportRepositoryExportButton) {
    els.reportRepositoryExportButton.disabled = !status?.reportCount;
  }
  if (els.reportRepositoryImportButton) {
    els.reportRepositoryImportButton.disabled = false;
  }
  if (els.reportRepositoryRemoteButton) {
    els.reportRepositoryRemoteButton.disabled = false;
    els.reportRepositoryRemoteButton.textContent = status?.remoteConfigured ? "检查远端" : "远端未配置";
  }
  if (els.reportRepositoryPushButton) {
    els.reportRepositoryPushButton.disabled = !status?.remoteConfigured || !status?.reportCount;
  }
  if (els.reportRepositoryPullButton) {
    els.reportRepositoryPullButton.disabled = !status?.remoteConfigured;
  }
  if (els.reportRepositorySaveRemoteButton) {
    els.reportRepositorySaveRemoteButton.disabled = false;
  }
  if (!detail && els.reportRepositoryPushButton) {
    els.reportRepositoryPushButton.disabled = true;
  }
  renderReportRepositoryReceipts();
  renderReportRepositoryConflictPanel(status);
}

function renderReportRepositoryReceipts() {
  const audit = window.MRAppState?.getReportRepositoryReceiptAudit?.();
  const receipts = Array.isArray(audit?.receipts) ? audit.receipts : [];
  if (els.reportRepositoryReceiptStatus) {
    els.reportRepositoryReceiptStatus.textContent = audit?.message || "暂无报告仓库签名回执。";
    els.reportRepositoryReceiptStatus.dataset.receiptTone = receipts.length ? "ready" : "idle";
  }
  if (els.reportRepositoryReceiptExportButton) {
    els.reportRepositoryReceiptExportButton.disabled = !receipts.length;
  }
  if (!els.reportRepositoryReceiptList) return;
  els.reportRepositoryReceiptList.replaceChildren();
  receipts.slice(0, 5).forEach((receipt) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = receipt.packageId || receipt.sourcePackageId || "报告仓库回执";
    const meta = document.createElement("span");
    const signature = receipt.signature ? receipt.signature.slice(0, 12) : "签名未知";
    const digest = receipt.repositoryDigest ? receipt.repositoryDigest.slice(0, 12) : "摘要未知";
    meta.textContent = `${formatReportRepositoryReceiptDirection(receipt.direction)} · ${formatHistoryTime(receipt.receivedAt || receipt.acceptedAt)} · 签名 ${signature} · 仓库 ${digest} · ${formatReportRepositoryReceiptVerificationStatus(receipt.verificationStatus)}`;
    const detail = document.createElement("small");
    detail.textContent = `${receipt.signatureAlgorithm || "签名算法未知"} / ${receipt.signingKeyId || "key 未知"} / ${receipt.workspaceId || "local-browser"} / ${receipt.reportCount || 0} 份报告 / ${receipt.verificationMessage || "本机校验未执行"}`;
    item.append(title, meta, detail);
    els.reportRepositoryReceiptList.appendChild(item);
  });
}

function formatReportRepositoryReceiptDirection(direction) {
  return {
    check: "检查",
    push: "推送",
    pull: "拉取"
  }[direction] || "回执";
}

function formatReportRepositoryReceiptVerificationStatus(status) {
  return {
    verified: "本机校验通过",
    "workspace-mismatch": "空间不匹配",
    "digest-mismatch": "摘要不匹配"
  }[status] || "未校验";
}

function renderReportRepositoryConflictPanel(status) {
  const panel = els.reportRepositoryConflictPanel;
  if (!panel) return;
  const conflicts = Array.isArray(status?.lastConflictReports) ? status.lastConflictReports : [];
  const hasConflict = Boolean(conflicts.length);
  panel.hidden = !hasConflict;
  if (!hasConflict) {
    if (els.reportRepositoryConflictList) {
      els.reportRepositoryConflictList.innerHTML = "";
    }
    return;
  }

  if (els.reportRepositoryConflictStatus) {
    els.reportRepositoryConflictStatus.textContent = `${conflicts.length} 份远端同 ID 差异报告已跳过，可字段合并、另存副本或忽略审计。`;
  }
  if (!els.reportRepositoryConflictList) return;
  els.reportRepositoryConflictList.innerHTML = "";
  conflicts.forEach((conflict, conflictIndex) => {
    const item = document.createElement("li");
    const head = document.createElement("div");
    head.className = "report-repository-conflict-item-head";
    const title = document.createElement("strong");
    title.textContent = `${conflict.typeLabel || "报告"}：${conflict.remoteTitle || conflict.title || conflict.id}`;
    const detail = document.createElement("span");
    detail.textContent = `本机：${conflict.localTitle || conflict.id} / ${formatHistoryTime(conflict.localUpdatedAt)}；远端：${conflict.remoteTitle || conflict.id} / ${formatHistoryTime(conflict.remoteUpdatedAt)}`;
    head.append(title, detail);
    item.appendChild(head);

    const fields = Array.isArray(conflict.fieldDiffs) ? conflict.fieldDiffs : [];
    if (fields.length) {
      const fieldList = document.createElement("div");
      fieldList.className = "report-repository-conflict-fields";
      fields.slice(0, 8).forEach((field, fieldIndex) => {
        fieldList.appendChild(createReportRepositoryMergeChoice({
          conflictId: conflict.conflictId || "",
          fieldDiff: field,
          groupKey: `${conflictIndex}-${fieldIndex}`
        }));
      });
      item.appendChild(fieldList);
    }

    const actions = document.createElement("div");
    actions.className = "report-repository-conflict-actions";
    [
      ["merge-fields", "应用字段合并"],
      ["copy-remote", "另存远端副本"],
      ["dismiss", "忽略审计"]
    ].forEach(([action, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.featureState = "real-local";
      button.dataset.reportConflictAction = action;
      button.dataset.reportConflictId = conflict.conflictId || "";
      button.textContent = label;
      actions.appendChild(button);
    });
    item.appendChild(actions);
    els.reportRepositoryConflictList.appendChild(item);
  });
}

function createReportRepositoryMergeChoice({ conflictId = "", fieldDiff = {}, groupKey = "" }) {
  const wrapper = document.createElement("fieldset");
  wrapper.className = "report-repository-merge-choice";
  const legend = document.createElement("legend");
  legend.textContent = fieldDiff.label || fieldDiff.field || "字段";
  const options = document.createElement("div");
  options.className = "report-repository-merge-options";
  [
    { value: "local", label: "本机", detail: fieldDiff.localValue || "空", checked: true },
    { value: "remote", label: "远端", detail: fieldDiff.remoteValue || "空", checked: false }
  ].forEach((choice) => {
    const choiceLabel = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `report-merge-${groupKey}`;
    input.value = choice.value;
    input.checked = choice.checked;
    input.dataset.reportMergeConflictId = conflictId;
    input.dataset.reportMergeField = fieldDiff.field || "";
    const title = document.createElement("strong");
    title.textContent = choice.label;
    const detail = document.createElement("span");
    detail.textContent = choice.detail;
    choiceLabel.append(input, title, detail);
    options.appendChild(choiceLabel);
  });
  wrapper.append(legend, options);
  return wrapper;
}

function setReportDetailActions(detail) {
  const hasDetail = Boolean(detail);
  if (els.reportDetailCopyLink) els.reportDetailCopyLink.disabled = !hasDetail;
  if (els.reportDetailDownload) els.reportDetailDownload.disabled = !hasDetail;
  if (els.reportDetailDownloadPdf) els.reportDetailDownloadPdf.disabled = !hasDetail;
  if (els.reportDetailPrint) els.reportDetailPrint.disabled = !hasDetail;
  if (els.reportDetailOpenHistory) els.reportDetailOpenHistory.disabled = !hasDetail;
}

function saveReportTeacherReview() {
  const detail = getActiveReportDetail();
  if (!detail) {
    showNotice("还没有可批注的学习报告。");
    renderReportTeacherReview(null);
    return;
  }
  const result = window.MRAppState?.updateReportTeacherReview?.(detail.id, {
    reviewer: els.reportTeacherReviewerInput?.value || "",
    role: els.reportTeacherReviewRoleInput?.value || "local-teacher",
    note: els.reportTeacherReviewInput?.value || ""
  });
  if (result?.ok) {
    activeReportDetailId = detail.id;
    renderReportPanel(currentIndex);
  }
  showNotice(result?.message || "教师批注保存失败。");
}

function clearReportTeacherReview() {
  const detail = getActiveReportDetail();
  if (!detail) {
    showNotice("还没有可清除批注的学习报告。");
    renderReportTeacherReview(null);
    return;
  }
  const result = window.MRAppState?.clearReportTeacherReview?.(detail.id);
  if (result?.ok) {
    activeReportDetailId = detail.id;
    renderReportPanel(currentIndex);
  }
  showNotice(result?.message || "教师批注清除失败。");
}

function exportReportTeacherReviewAudit() {
  const detail = getActiveReportDetail();
  if (!detail) {
    showNotice("请选择一份报告后导出教师批注审计。");
    renderReportTeacherReview(null);
    return;
  }
  const result = window.MRAppState?.downloadReportTeacherReviewAudit?.(detail.id);
  if (result?.message) {
    showNotice(result.message);
  } else {
    showNotice("暂无可导出的教师批注审计记录。");
  }
  renderReportPanel(currentIndex);
}

function downloadReportRepositoryPackage() {
  const result = window.MRAppState?.downloadReportRepository?.();
  if (result?.message) {
    showNotice(result.message);
  }
  renderReportPanel(currentIndex);
}

function exportReportRepositoryReceipts() {
  const result = window.MRAppState?.downloadReportRepositoryReceiptAudit?.();
  if (result?.message) {
    showNotice(result.message);
  } else {
    showNotice("暂无可导出的报告仓库签名回执。");
  }
  renderReportPanel(currentIndex);
}

function chooseReportRepositoryImport() {
  if (!els.reportRepositoryImportInput) {
    showNotice("当前浏览器不支持选择报告仓库同步包文件。");
    return;
  }
  els.reportRepositoryImportInput.value = "";
  els.reportRepositoryImportInput.click();
}

function importReportRepositoryFile(event) {
  const file = event.target.files?.[0] || null;
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const result = window.MRAppState?.importReportRepositoryPackage?.(String(reader.result || ""));
    renderReportPanel(currentIndex);
    renderLearningStateSummary();
    showNotice(result?.message || "报告仓库同步包导入失败。");
  });
  reader.addEventListener("error", () => {
    showNotice("报告仓库同步包读取失败。");
  });
  reader.readAsText(file);
}

function saveReportRepositoryRemoteConfig() {
  const endpoint = els.reportRepositoryEndpointInput?.value || "";
  const token = els.reportRepositoryTokenInput?.value || "";
  const workspaceId = els.reportRepositoryWorkspaceInput?.value || "";
  const result = window.MRAppState?.configureReportRepositoryRemote?.({
    remoteEndpoint: endpoint,
    remoteToken: token,
    workspaceId
  });
  if (result?.message) {
    showNotice(result.message);
  }
  renderReportPanel(currentIndex);
}

async function checkReportRepositoryRemote() {
  setReportRepositoryRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.checkRemoteReportRepository?.());
    if (result?.message) {
      showNotice(result.message);
    }
  } catch (error) {
    showNotice(`远端报告 API 检查失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setReportRepositoryRemoteBusy(false);
    renderReportPanel(currentIndex);
  }
}

async function pushReportRepositoryRemote() {
  setReportRepositoryRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.pushReportRepositoryToRemote?.());
    if (result?.message) {
      showNotice(result.message);
    }
  } catch (error) {
    showNotice(`远端报告 API 推送失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setReportRepositoryRemoteBusy(false);
    renderReportPanel(currentIndex);
  }
}

async function pullReportRepositoryRemote() {
  setReportRepositoryRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.pullReportRepositoryFromRemote?.());
    if (result?.message) {
      showNotice(result.message);
    }
    renderLearningStateSummary();
  } catch (error) {
    showNotice(`远端报告 API 拉取失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setReportRepositoryRemoteBusy(false);
    renderReportPanel(currentIndex);
  }
}

function handleReportRepositoryConflictAction(event) {
  const button = event.target?.closest?.("[data-report-conflict-action]");
  if (!button) return;
  const action = button.dataset.reportConflictAction || "";
  const conflictId = button.dataset.reportConflictId || "";
  const options = action === "merge-fields"
    ? { conflictId, selections: collectReportRepositoryMergeSelections(conflictId) }
    : { conflictId };
  const result = window.MRAppState?.resolveReportRepositoryConflict?.(action, options);
  renderReportPanel(currentIndex);
  renderLearningStateSummary();
  showNotice(result?.message || "报告仓库冲突处理失败。");
}

function collectReportRepositoryMergeSelections(conflictId = "") {
  const selections = {};
  const panel = els.reportRepositoryConflictPanel;
  if (!panel) return selections;
  panel.querySelectorAll("input[data-report-merge-field]:checked").forEach((input) => {
    const inputConflictId = input.dataset.reportMergeConflictId || "";
    const field = input.dataset.reportMergeField || "";
    if (!field || (conflictId && inputConflictId !== conflictId)) return;
    selections[field] = input.value === "remote" ? "remote" : "local";
  });
  return selections;
}

function setReportRepositoryRemoteBusy(isBusy) {
  [
    els.reportRepositorySaveRemoteButton,
    els.reportRepositoryRemoteButton,
    els.reportRepositoryPushButton,
    els.reportRepositoryPullButton,
    els.reportRepositoryReceiptExportButton
  ].forEach((button) => {
    if (button) {
      button.disabled = Boolean(isBusy);
    }
  });
}

function updateReportSeriesZoom(action) {
  const series = window.MRAppState?.getReportSeries?.(activeReportDetailId);
  const total = series?.ok ? (series.points || []).length : 0;
  if (total <= 2) {
    activeReportSeriesWindowSize = null;
    showNotice("当前报告数量较少，已显示全部趋势。");
    return;
  }

  const currentSize = activeReportSeriesWindowSize
    ? clamp(Math.round(activeReportSeriesWindowSize), 2, total)
    : total;
  if (action === "in") {
    activeReportSeriesWindowSize = Math.max(2, currentSize - 1);
    showNotice(`已放大到最近 ${activeReportSeriesWindowSize} 份报告。`);
    return;
  }

  if (action === "out") {
    const nextSize = Math.min(total, currentSize + 1);
    activeReportSeriesWindowSize = nextSize >= total ? null : nextSize;
    showNotice(activeReportSeriesWindowSize
      ? `已缩小到最近 ${activeReportSeriesWindowSize} 份报告。`
      : "已显示全部报告趋势。");
    return;
  }

  activeReportSeriesWindowSize = null;
  showNotice("已重置为全部报告趋势。");
}

function applyReportSeriesTemplate(templateKey) {
  const template = REPORT_SERIES_TEMPLATES.find((item) => item.key === templateKey);
  if (!template) return;
  const keys = template.keys.map(normalizeReportMetricKey);
  activeReportSeriesMetricKeys = new Set(keys);
  activeReportMetricKey = keys[0] || REPORT_METRIC_LABELS[0][0];
  showNotice(`已切换到${template.label}字段模板。`);
}

function toggleReportSeriesMetric(key) {
  const metricKey = normalizeReportMetricKey(key);
  if (activeReportSeriesMetricKeys.has(metricKey)) {
    if (activeReportSeriesMetricKeys.size > 1) {
      activeReportSeriesMetricKeys.delete(metricKey);
    }
  } else {
    activeReportSeriesMetricKeys.add(metricKey);
    activeReportMetricKey = metricKey;
  }

  if (!activeReportSeriesMetricKeys.has(activeReportMetricKey)) {
    activeReportMetricKey = activeReportSeriesMetricKeys.values().next().value || REPORT_METRIC_LABELS[0][0];
  }
}

function getActiveReportSeriesMetricKeys(fallbackKey = activeReportMetricKey) {
  const keys = [...activeReportSeriesMetricKeys]
    .map(normalizeReportMetricKey)
    .filter((key, index, list) => list.indexOf(key) === index);
  if (!keys.length) {
    const metricKey = normalizeReportMetricKey(fallbackKey);
    activeReportSeriesMetricKeys = new Set([metricKey]);
    return [metricKey];
  }
  activeReportSeriesMetricKeys = new Set(keys);
  return keys;
}

function getActiveReportSeriesTemplateKey(selectedKeys) {
  const normalized = selectedKeys.map(normalizeReportMetricKey).sort().join("|");
  const template = REPORT_SERIES_TEMPLATES.find((item) => item.keys.map(normalizeReportMetricKey).sort().join("|") === normalized);
  return template?.key || "";
}

function normalizeReportMetricKey(key) {
  return REPORT_METRIC_LABELS.some(([metricKey]) => metricKey === key) ? key : REPORT_METRIC_LABELS[0][0];
}

function getReportMetricLabel(key) {
  const found = REPORT_METRIC_LABELS.find(([metricKey]) => metricKey === key);
  return found ? found[1] : "结构";
}

function getReportMetricPoints(detail, metricKey) {
  const key = normalizeReportMetricKey(metricKey);
  const source = Array.isArray(detail?.metricTrend) && detail.metricTrend.length
    ? detail.metricTrend
    : buildReportMetricTrendFallback(detail);

  return source
    .map((item) => ({
      ...item,
      value: clamp(Number(item?.metrics?.[key]) || 0, 0, 100)
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => Date.parse(a.createdAt || 0) - Date.parse(b.createdAt || 0));
}

function buildReportMetricTrendFallback(detail) {
  if (!detail?.scoreBreakdown) {
    return [];
  }

  return [{
    label: detail.title || "学习报告",
    type: "report",
    createdAt: detail.createdAt,
    metrics: detail.scoreBreakdown
  }];
}

function getActiveReportDetail() {
  if (!window.MRAppState?.getReportDetail) {
    return null;
  }
  return window.MRAppState.getReportDetail(activeReportDetailId);
}

async function exportPracticeReplayVideo(options = {}) {
  if (!window.MRPracticeCanvas?.exportReplayVideo || !window.MRPracticeCanvas?.exportReplayCover) {
    return { ok: false, message: "书写画布尚未初始化，无法导出视频。" };
  }
  if (isReplayVideoExporting) {
    return { ok: false, message: "书写回放视频正在生成中，请稍候。" };
  }

  const source = getPracticeVideoSource(options);
  if (!source.strokes.length) {
    return { ok: false, message: "请先在练习格中书写，或保存一条带笔迹的作品后再生成视频。" };
  }

  if (source.source === "当前练习" && !source.sessionId) {
    const recorded = recordLivePracticeIfAvailable({ allowCreate: true });
    if (recorded?.session?.id) {
      source.sessionId = recorded.session.id;
      source.sourceId = recorded.session.id;
      source.title = recorded.session.title || `${source.glyph}字当前练习`;
    }
  }

  const queuedJob = options.jobId
    ? { ok: true, job: { id: options.jobId } }
    : window.MRAppState?.queuePracticeVideoExportJob?.({
        source: source.source,
        sourceId: source.sourceId,
        artworkId: source.artworkId,
        sessionId: source.sessionId,
        glyph: source.glyph,
        title: source.title,
        strokeCount: source.strokes.length,
        pointCount: countVideoSourcePoints(source.strokes),
        retryOf: options.retryOf,
        retryCount: options.retryCount
      });
  if (!queuedJob?.ok) {
    return { ok: false, message: queuedJob?.message || "视频导出任务无法加入队列。" };
  }
  const jobId = queuedJob.job?.id || options.jobId || "";

  isReplayVideoExporting = true;
  try {
    window.MRAppState?.startPracticeVideoExportJob?.(jobId);
    if (source.source !== "当前练习") {
      window.MRPracticeCanvas.loadStrokes?.(source.strokes);
    }

    const coverResult = window.MRPracticeCanvas.exportReplayCover({
      strokes: source.strokes,
      glyph: source.glyph
    });
    if (!coverResult?.ok || !coverResult.dataUrl) {
      const message = coverResult?.message || "视频封面生成失败。";
      window.MRAppState?.recordPracticeVideoExportError?.(message, {
        jobId,
        artworkId: source.artworkId,
        sessionId: source.sessionId,
        sourceId: source.sourceId
      });
      return { ok: false, message };
    }

    const result = await window.MRPracticeCanvas.exportReplayVideo({
      strokes: source.strokes,
      glyph: source.glyph
    });
    if (!result?.ok || !result.blob) {
      const message = result?.message || "视频导出失败。";
      window.MRAppState?.recordPracticeVideoExportError?.(message, {
        jobId,
        artworkId: source.artworkId,
        sessionId: source.sessionId,
        sourceId: source.sourceId
      });
      return result || { ok: false, message };
    }

    const timestamp = Date.now();
    const filename = `mr-calligraphy-replay-${sanitizeFilename(source.glyph)}-${timestamp}.webm`;
    const coverFilename = `mr-calligraphy-replay-cover-${sanitizeFilename(source.glyph)}-${timestamp}.png`;
    const recordResult = window.MRAppState?.recordPracticeVideoExport?.({
      jobId,
      source: source.source,
      sourceId: source.sourceId,
      artworkId: source.artworkId,
      sessionId: source.sessionId,
      glyph: source.glyph,
      title: source.title || `${source.glyph}字书写回放`,
      videoFilename: filename,
      coverFilename,
      mimeType: result.mimeType || result.blob.type || "video/webm",
      videoBytes: result.blob.size || 0,
      coverDataUrl: coverResult.dataUrl,
      durationMs: result.durationMs,
      strokeCount: source.strokes.length,
      pointCount: countVideoSourcePoints(source.strokes),
      message: `已导出 ${source.source} 的 WebM 回放视频，并生成 PNG 封面。`
    });
    downloadBlob(result.blob, filename);
    return {
      ok: true,
      detail: recordResult?.record ? {
        title: "视频导出记录",
        rows: [
          ["来源", recordResult.record.sourceLabel],
          ["视频", recordResult.record.videoFilename],
          ["封面", recordResult.record.coverFilename],
          ["时长", recordResult.record.durationLabel],
          ["大小", recordResult.record.videoSizeLabel]
        ]
      } : null,
      message: `${result.message} 已下载：${filename}。封面已保存到复盘记录，可点击“下载封面”。`,
      notice: `已导出${source.source}回放视频，并生成封面记录。`
    };
  } finally {
    isReplayVideoExporting = false;
  }
}

function getPracticeVideoSource(options = {}) {
  if (options.source?.strokes?.length) {
    return options.source;
  }

  const liveStrokes = window.MRPracticeCanvas?.getStrokes?.() || [];
  const stats = window.MRAppState?.getStats?.();
  const review = window.MRAppState?.getLatestReview?.();
  const session = review?.session;
  if (options.preferReview && session?.strokes?.length) {
    return {
      source: "最近作品",
      sourceId: review?.artwork?.id || session.id,
      sessionId: session.id,
      artworkId: review?.artwork?.id || "",
      glyph: session.glyph || stats?.glyph || "永",
      title: review?.artwork?.title || session.title || `${session.glyph || stats?.glyph || "永"}字最近作品`,
      strokes: session.strokes
    };
  }

  if (liveStrokes.length) {
    return {
      source: "当前练习",
      sourceId: "",
      sessionId: "",
      artworkId: "",
      glyph: stats?.glyph || "永",
      title: `${stats?.glyph || "永"}字当前练习`,
      strokes: liveStrokes
    };
  }

  if (session?.strokes?.length) {
    return {
      source: "最近作品",
      sourceId: review?.artwork?.id || session.id,
      sessionId: session.id,
      artworkId: review?.artwork?.id || "",
      glyph: session.glyph || stats?.glyph || "永",
      title: review?.artwork?.title || session.title || `${session.glyph || stats?.glyph || "永"}字最近作品`,
      strokes: session.strokes
    };
  }

  return { source: "空记录", glyph: stats?.glyph || "永", strokes: [] };
}

function countVideoSourcePoints(strokes = []) {
  return strokes.reduce((sum, stroke) => sum + (Array.isArray(stroke) ? stroke.length : 0), 0);
}

async function downloadLatestPracticeVideo() {
  if (els.actionFeedback) {
    els.actionFeedback.textContent = "正在生成真实书写回放视频，请稍候...";
  }
  const result = await exportPracticeReplayVideo({ preferReview: true });
  applyActionResult(result, { label: "生成视频" });
}

async function retryPracticeVideoExport(jobId) {
  const sourceResult = window.MRAppState?.getPracticeVideoRetrySource?.(jobId);
  if (!sourceResult?.ok) {
    showNotice(sourceResult?.message || "这条视频导出任务暂时不能重试。");
    renderReviewPanel(currentIndex);
    return;
  }
  const queued = window.MRAppState?.retryPracticeVideoExportJob?.(jobId);
  if (!queued?.ok) {
    showNotice(queued?.message || "视频导出重试任务无法加入队列。");
    renderReviewPanel(currentIndex);
    return;
  }
  if (els.actionFeedback) {
    els.actionFeedback.textContent = "正在重试书写回放视频，请稍候...";
  }
  const result = await exportPracticeReplayVideo({
    source: sourceResult.source,
    jobId: queued.job.id
  });
  applyActionResult(result, { label: "生成视频" });
}

function downloadLatestPracticeVideoCover() {
  const review = window.MRAppState?.getLatestReview?.();
  const status = window.MRAppState?.getPracticeVideoExportStatus?.({
    artworkId: review?.artwork?.id,
    sessionId: review?.session?.id
  });
  const record = status?.currentRecord || status?.latestRecord;
  if (!record?.coverDataUrl) {
    showNotice("还没有可下载的视频封面。请先导出一次书写视频。");
    return;
  }
  downloadDataUrl(record.coverDataUrl, record.coverFilename || `mr-calligraphy-replay-cover-${Date.now()}.png`);
  showNotice(`已下载视频封面：${record.coverFilename || "PNG 封面"}。`);
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

  const history = window.MRAppState.getHistory({ filter: activeHistoryFilter, limit: activeHistoryLimit });
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
  renderHistoryRepositoryStatus(history);
  pruneHistorySelection(history.allIds || []);

  renderHistoryTrend(history.trend, history.dailyTrend, history.metricTrend);
  renderHistoryArtworkCompare();
  renderHistoryArtworkGallery();
  renderHistoryList(history.entries, history.filteredTotal);
  renderHistoryBatchControls(history);
  renderHistoryDetail();
}

function pruneHistorySelection(allIds) {
  const validIds = new Set(allIds);
  selectedHistoryIds.forEach((id) => {
    if (!validIds.has(id)) {
      selectedHistoryIds.delete(id);
    }
  });
}

function renderHistoryBatchControls(history) {
  const visibleIds = (history.entries || []).map((entry) => entry.id);
  const selectedCount = selectedHistoryIds.size;
  const selectableCount = visibleIds.length;
  const selectedVisibleCount = visibleIds.filter((id) => selectedHistoryIds.has(id)).length;

  if (els.historySelectVisible) {
    els.historySelectVisible.checked = selectableCount > 0 && selectedVisibleCount === selectableCount;
    els.historySelectVisible.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < selectableCount;
    els.historySelectVisible.disabled = selectableCount === 0;
  }
  if (els.historySelectionStatus) {
    els.historySelectionStatus.textContent = selectedCount
      ? `已选 ${selectedCount} 条`
      : `本页 ${selectableCount} 条`;
  }
  if (els.historyExportSelected) {
    els.historyExportSelected.disabled = selectedCount === 0;
  }
  if (els.historyDeleteSelected) {
    els.historyDeleteSelected.disabled = selectedCount === 0;
  }
  const trash = window.MRAppState?.getHistoryTrash?.() || { total: 0, recordCount: 0, latest: null };
  if (els.historyRestoreTrash) {
    els.historyRestoreTrash.disabled = trash.total === 0;
    els.historyRestoreTrash.title = trash.latest
      ? `恢复：${trash.latest.title}`
      : "回收站为空";
  }
  if (els.historyClearTrash) {
    els.historyClearTrash.disabled = trash.total === 0;
  }
  if (els.historyTrashStatus) {
    els.historyTrashStatus.textContent = trash.recordCount
      ? `回收站 ${trash.recordCount} 条`
      : "回收站 0 条";
  }
  renderHistoryTrashList(trash);
  if (els.historyLoadMore) {
    els.historyLoadMore.hidden = !history.hasMore;
    els.historyLoadMore.textContent = history.hasMore
      ? `加载更多记录（${history.entries.length}/${history.filteredTotal}）`
      : "已显示全部记录";
  }
}

function renderHistoryRepositoryStatus(history) {
  const status = window.MRAppState?.getHistoryRepositoryStatus?.();
  const config = window.MRAppState?.getHistoryRepositoryRemoteConfig?.();
  if (els.historyRepositorySummary) {
    els.historyRepositorySummary.textContent = status
      ? `${status.message} ${status.boundary}`
      : "学习档案仓库尚未初始化。";
    els.historyRepositorySummary.dataset.repositoryTone = status?.tone || "idle";
  }
  if (els.historyRepositoryExportButton) {
    els.historyRepositoryExportButton.disabled = !history?.total;
  }
  if (els.historyRepositoryImportButton) {
    els.historyRepositoryImportButton.disabled = !window.FileReader;
  }
  if (els.historyRepositoryEndpointInput && document.activeElement !== els.historyRepositoryEndpointInput) {
    els.historyRepositoryEndpointInput.value = config?.remoteEndpoint || "";
  }
  if (els.historyRepositoryTokenInput && document.activeElement !== els.historyRepositoryTokenInput) {
    els.historyRepositoryTokenInput.value = config?.remoteToken || "";
  }
  if (els.historyRepositoryWorkspaceInput && document.activeElement !== els.historyRepositoryWorkspaceInput) {
    els.historyRepositoryWorkspaceInput.value = config?.workspaceId || "local-browser";
  }
  if (els.historyRepositoryRemoteButton) {
    els.historyRepositoryRemoteButton.disabled = false;
    els.historyRepositoryRemoteButton.textContent = status?.remoteConfigured ? "检查远端" : "远端未配置";
  }
  if (els.historyRepositoryPushButton) {
    els.historyRepositoryPushButton.disabled = !status?.remoteConfigured || !history?.total;
  }
  if (els.historyRepositoryPullButton) {
    els.historyRepositoryPullButton.disabled = !status?.remoteConfigured;
  }
  renderHistoryRepositoryReceipts();
  renderHistoryRepositoryConflictPanel(status);
}

function renderHistoryRepositoryReceipts() {
  const audit = window.MRAppState?.getHistoryRepositoryReceiptAudit?.();
  const receipts = Array.isArray(audit?.receipts) ? audit.receipts : [];
  if (els.historyRepositoryReceiptStatus) {
    els.historyRepositoryReceiptStatus.textContent = audit?.message || "暂无学习档案仓库回执。";
    els.historyRepositoryReceiptStatus.dataset.receiptTone = receipts.length ? "ready" : "idle";
  }
  if (els.historyRepositoryReceiptExportButton) {
    els.historyRepositoryReceiptExportButton.disabled = !receipts.length;
  }
  if (!els.historyRepositoryReceiptList) return;
  els.historyRepositoryReceiptList.replaceChildren();
  receipts.slice(0, 6).forEach((receipt) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${formatHistoryRepositoryReceiptDirection(receipt.direction)} · ${receipt.packageId || receipt.sourcePackageId || "远端回执"}`;
    const meta = document.createElement("span");
    const digest = receipt.repositoryDigest ? receipt.repositoryDigest.slice(0, 12) : "摘要未知";
    const receiptDigest = receipt.receiptDigest ? receipt.receiptDigest.slice(0, 12) : "回执未知";
    meta.textContent = `空间 ${receipt.workspaceId || audit?.workspaceId || "local-browser"} · ${formatHistoryTime(receipt.receivedAt || receipt.acceptedAt)} · 档案 ${receipt.recordCount || 0} · 仓库 ${digest} · 回执 ${receiptDigest} · ${formatHistoryRepositoryReceiptVerificationStatus(receipt.verificationStatus)}`;
    const detail = document.createElement("small");
    detail.textContent = `${receipt.remoteVersion || "远端版本未知"} / ${receipt.verificationMessage || "本机校验未执行"}`;
    item.append(title, meta, detail);
    els.historyRepositoryReceiptList.appendChild(item);
  });
}

function formatHistoryRepositoryReceiptDirection(direction) {
  return {
    check: "检查",
    push: "推送",
    pull: "拉取"
  }[direction] || "回执";
}

function formatHistoryRepositoryReceiptVerificationStatus(status) {
  return {
    verified: "本机校验通过",
    "workspace-mismatch": "空间不匹配",
    "digest-mismatch": "摘要不匹配"
  }[status] || "未校验";
}

function renderHistoryRepositoryConflictPanel(status) {
  const panel = els.historyRepositoryConflictPanel;
  if (!panel) return;
  const conflicts = Array.isArray(status?.lastConflictRecords) ? status.lastConflictRecords : [];
  const hasConflict = Boolean(conflicts.length);
  panel.hidden = !hasConflict;
  if (!hasConflict) {
    if (els.historyRepositoryConflictList) {
      els.historyRepositoryConflictList.innerHTML = "";
    }
    return;
  }

  if (els.historyRepositoryConflictStatus) {
    els.historyRepositoryConflictStatus.textContent = `${conflicts.length} 条远端同 ID 差异记录已跳过，可字段合并、另存副本或忽略审计。`;
  }
  if (!els.historyRepositoryConflictList) return;
  els.historyRepositoryConflictList.innerHTML = "";
  conflicts.forEach((conflict, conflictIndex) => {
    const item = document.createElement("li");
    const head = document.createElement("div");
    head.className = "history-repository-conflict-item-head";
    const title = document.createElement("strong");
    title.textContent = `${conflict.typeLabel || "档案"}：${conflict.remoteTitle || conflict.title || conflict.id}`;
    const detail = document.createElement("span");
    detail.textContent = `本机：${conflict.localTitle || conflict.id} / ${formatHistoryTime(conflict.localUpdatedAt)}；远端：${conflict.remoteTitle || conflict.id} / ${formatHistoryTime(conflict.remoteUpdatedAt)}`;
    head.append(title, detail);
    item.appendChild(head);

    const fields = Array.isArray(conflict.fieldDiffs) ? conflict.fieldDiffs : [];
    if (fields.length) {
      const fieldList = document.createElement("div");
      fieldList.className = "history-repository-conflict-fields";
      fields.slice(0, 8).forEach((field, fieldIndex) => {
        fieldList.appendChild(createHistoryRepositoryMergeChoice({
          conflictId: conflict.conflictId || "",
          fieldDiff: field,
          groupKey: `${conflictIndex}-${fieldIndex}`
        }));
      });
      item.appendChild(fieldList);
    }

    const actions = document.createElement("div");
    actions.className = "history-repository-conflict-actions";
    [
      ["merge-fields", "应用字段合并"],
      ["copy-remote", "另存远端副本"],
      ["dismiss", "忽略审计"]
    ].forEach(([action, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.featureState = "real-local";
      button.dataset.historyConflictAction = action;
      button.dataset.historyConflictId = conflict.conflictId || "";
      button.textContent = label;
      actions.appendChild(button);
    });
    item.appendChild(actions);
    els.historyRepositoryConflictList.appendChild(item);
  });
}

function createHistoryRepositoryMergeChoice({ conflictId = "", fieldDiff = {}, groupKey = "" }) {
  const wrapper = document.createElement("fieldset");
  wrapper.className = "history-repository-merge-choice";
  const legend = document.createElement("legend");
  legend.textContent = fieldDiff.label || fieldDiff.field || "字段";
  const options = document.createElement("div");
  options.className = "history-repository-merge-options";
  [
    { value: "local", label: "本机", detail: fieldDiff.localValue || "空", checked: true },
    { value: "remote", label: "远端", detail: fieldDiff.remoteValue || "空", checked: false }
  ].forEach((choice) => {
    const choiceLabel = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `history-merge-${groupKey}`;
    input.value = choice.value;
    input.checked = choice.checked;
    input.dataset.historyMergeConflictId = conflictId;
    input.dataset.historyMergeField = fieldDiff.field || "";
    const title = document.createElement("strong");
    title.textContent = choice.label;
    const detail = document.createElement("span");
    detail.textContent = choice.detail;
    choiceLabel.append(input, title, detail);
    options.appendChild(choiceLabel);
  });
  wrapper.append(legend, options);
  return wrapper;
}

function renderHistoryTrashList(trash = { entries: [] }) {
  if (!els.historyTrashList) {
    return;
  }

  const entries = trash.entries || [];
  els.historyTrashList.hidden = entries.length === 0;
  els.historyTrashList.innerHTML = "";
  if (!entries.length) {
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "history-trash-row";

    const body = document.createElement("div");
    body.className = "history-trash-body";
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const meta = document.createElement("span");
    meta.textContent = `${formatHistoryTime(entry.deletedAt)} / ${entry.recordCount} 条 / 练习 ${entry.counts.practice} / 作品 ${entry.counts.artwork} / 报告 ${entry.counts.report}`;
    body.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "history-trash-actions";
    [
      ["restore", "恢复"],
      ["delete", "永久删除"]
    ].forEach(([action, text]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.featureState = "real-local";
      button.dataset.trashAction = action;
      button.dataset.trashId = entry.id;
      button.textContent = text;
      actions.appendChild(button);
    });

    row.append(body, actions);
    els.historyTrashList.appendChild(row);
  });
}

function refreshHistoryRepositoryViews() {
  renderHistoryPanel(currentIndex);
  renderLearningStateSummary();
  updateSceneText(currentIndex);
  updatePathPanel(currentIndex);
}

function downloadHistoryRepositoryPackage() {
  const result = window.MRAppState?.downloadHistoryRepository?.();
  if (result?.message) {
    showNotice(result.message);
  }
  renderHistoryPanel(currentIndex);
}

function chooseHistoryRepositoryImport() {
  if (!els.historyRepositoryImportInput) return;
  els.historyRepositoryImportInput.value = "";
  els.historyRepositoryImportInput.click();
}

function importHistoryRepositoryFile(event) {
  const file = event.target.files?.[0] || null;
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const result = window.MRAppState?.importHistoryRepositoryPackage?.(String(reader.result || ""));
    refreshHistoryRepositoryViews();
    showNotice(result?.message || "学习档案同步包导入失败。");
  });
  reader.addEventListener("error", () => {
    showNotice("学习档案同步包读取失败。");
  });
  reader.readAsText(file);
}

function saveHistoryRepositoryRemoteConfig() {
  const endpoint = els.historyRepositoryEndpointInput?.value || "";
  const token = els.historyRepositoryTokenInput?.value || "";
  const workspaceId = els.historyRepositoryWorkspaceInput?.value || "";
  const result = window.MRAppState?.configureHistoryRepositoryRemote?.({
    remoteEndpoint: endpoint,
    remoteToken: token,
    workspaceId
  });
  if (result?.message) {
    showNotice(result.message);
  }
  renderHistoryPanel(currentIndex);
}

async function checkHistoryRepositoryRemote() {
  setHistoryRepositoryRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.checkRemoteHistoryRepository?.());
    if (result?.message) {
      showNotice(result.message);
    }
  } catch (error) {
    showNotice(`远端学习档案 API 检查失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setHistoryRepositoryRemoteBusy(false);
    renderHistoryPanel(currentIndex);
  }
}

async function pushHistoryRepositoryRemote() {
  setHistoryRepositoryRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.pushHistoryRepositoryToRemote?.());
    if (result?.message) {
      showNotice(result.message);
    }
  } catch (error) {
    showNotice(`远端学习档案 API 推送失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setHistoryRepositoryRemoteBusy(false);
    renderHistoryPanel(currentIndex);
  }
}

async function pullHistoryRepositoryRemote() {
  setHistoryRepositoryRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.pullHistoryRepositoryFromRemote?.());
    if (result?.ok) {
      refreshHistoryRepositoryViews();
    } else {
      renderHistoryPanel(currentIndex);
    }
    if (result?.message) {
      showNotice(result.message);
    }
  } catch (error) {
    showNotice(`远端学习档案 API 拉取失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setHistoryRepositoryRemoteBusy(false);
    renderHistoryPanel(currentIndex);
  }
}

function exportHistoryRepositoryReceipts() {
  const result = window.MRAppState?.downloadHistoryRepositoryReceiptAudit?.();
  if (result?.message) {
    showNotice(result.message);
  }
  renderHistoryPanel(currentIndex);
}

function handleHistoryRepositoryConflictAction(event) {
  const button = event.target?.closest?.("[data-history-conflict-action]");
  if (!button) return;
  const action = button.dataset.historyConflictAction || "";
  const conflictId = button.dataset.historyConflictId || "";
  const options = action === "merge-fields"
    ? { conflictId, selections: collectHistoryRepositoryMergeSelections(conflictId) }
    : { conflictId };
  const result = window.MRAppState?.resolveHistoryRepositoryConflict?.(action, options);
  refreshHistoryRepositoryViews();
  showNotice(result?.message || "学习档案冲突处理失败。");
}

function collectHistoryRepositoryMergeSelections(conflictId = "") {
  const selections = {};
  const panel = els.historyRepositoryConflictPanel;
  if (!panel) return selections;
  panel.querySelectorAll("input[data-history-merge-field]:checked").forEach((input) => {
    const inputConflictId = input.dataset.historyMergeConflictId || "";
    const field = input.dataset.historyMergeField || "";
    if (!field || (conflictId && inputConflictId !== conflictId)) return;
    selections[field] = input.value === "remote" ? "remote" : "local";
  });
  return selections;
}

function setHistoryRepositoryRemoteBusy(isBusy) {
  [
    els.historyRepositorySaveRemoteButton,
    els.historyRepositoryRemoteButton,
    els.historyRepositoryPushButton,
    els.historyRepositoryPullButton,
    els.historyRepositoryReceiptExportButton
  ].forEach((button) => {
    if (button) {
      button.disabled = Boolean(isBusy);
    }
  });
}

function renderPlanPanel(sceneIndex = currentIndex) {
  if (!els.planPanel || !window.MRAppState?.getPlanHistory) {
    return;
  }

  const planHistory = window.MRAppState.getPlanHistory();
  if (activePlanId && !planHistory.some((plan) => plan.id === activePlanId)) {
    activePlanId = null;
  }
  const fallbackPlan = planHistory[0] || null;
  const plan = activePlanId
    ? window.MRAppState.getPlan?.(activePlanId)
    : fallbackPlan;
  if (!activePlanId && plan) {
    activePlanId = plan.id;
  }
  const shouldShow = Boolean(planHistory.length || sceneIndex >= 8);
  els.planPanel.hidden = !shouldShow;
  if (!shouldShow) {
    return;
  }
  renderPlanHistorySelect(planHistory, plan?.id || "");

  const progress = plan?.progress || { done: 0, total: 0, percent: 0 };
  els.planTitle.textContent = plan?.title || "暂无计划";
  els.planProgressLabel.textContent = `${progress.done}/${progress.total}`;
  els.planProgressFill.style.width = `${progress.percent}%`;
  els.planSummary.textContent = plan?.summary || "点击“制定计划”后会生成可勾选任务。";
  if (els.planReminderSummary) {
    els.planReminderSummary.textContent = plan?.reminderSummary?.label || "暂无计划提醒";
    els.planReminderSummary.dataset.reminderTone = plan?.reminderSummary?.overdue
      ? "danger"
      : plan?.reminderSummary?.due || plan?.reminderSummary?.reviewPending
        ? "warning"
        : plan?.reminderSummary?.snoozed
          ? "snoozed"
          : "idle";
  }
  if (els.planCycleSummary) {
    const cycleStatus = plan?.cycleStatus || null;
    els.planCycleSummary.textContent = cycleStatus
      ? `${cycleStatus.label} / ${cycleStatus.message}`
      : "暂无周期规则";
    els.planCycleSummary.dataset.cycleTone = cycleStatus?.tone || "idle";
  }
  renderPlanReminderService(plan);
  renderPlanRepositoryStatus(planHistory);
  if (els.planAddItem) {
    els.planAddItem.disabled = !plan;
  }
  if (els.planExportButton) {
    els.planExportButton.disabled = !plan;
  }
  if (els.planCalendarExportButton) {
    els.planCalendarExportButton.disabled = !plan;
  }
  if (els.planNextCycleButton) {
    els.planNextCycleButton.disabled = !plan?.cycleStatus?.canCreateNext;
  }
  renderPlanDependencyGraph(plan);
  els.planItemList.innerHTML = "";

  if (!plan?.items?.length) {
    const empty = document.createElement("p");
    empty.className = "plan-empty";
    empty.textContent = plan ? "这份计划还没有任务项，可以新增自定义计划项。" : "还没有学习计划。";
    els.planItemList.appendChild(empty);
    return;
  }

  plan.items.forEach((item, index) => {
    const reminder = item.reminder || {};
    const row = document.createElement("div");
    row.className = "plan-item";
    row.dataset.planRowId = item.id;
    row.tabIndex = -1;
    row.classList.toggle("is-done", item.done);
    row.classList.toggle("is-overdue", reminder.status === "overdue");
    row.classList.toggle("is-due", reminder.status === "due");
    row.classList.toggle("is-snoozed", reminder.status === "snoozed");
    row.classList.toggle("is-review-pending", reminder.status === "review-pending");
    row.classList.toggle("is-reviewed", reminder.status === "reviewed");

    const label = document.createElement("label");
    label.className = "plan-item-check";

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
    const meta = document.createElement("span");
    meta.className = "plan-item-meta";
    [
      reminder.label || "未设置提醒",
      reminder.dueLabel || "未设置到期",
      reminder.remindLabel || "未设置提醒",
      `复盘：${reminder.reviewLabel || "自定义复盘"}`
    ].forEach((text) => {
      const chip = document.createElement("span");
      chip.textContent = text;
      meta.appendChild(chip);
    });
    body.append(title, detail, meta);
    label.append(checkbox, body);

    const actions = document.createElement("div");
    actions.className = "plan-item-actions";
    [
      ["review", reminder.status === "reviewed" ? "已复盘" : "复盘", reminder.status === "reviewed"],
      ["snooze", "顺延", item.done],
      ["up", "上移", index === 0],
      ["down", "下移", index === plan.items.length - 1],
      ["edit", "编辑", false],
      ["delete", "删除", false]
    ].forEach(([action, text, disabled]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.featureState = "real-local";
      button.dataset.planAction = action;
      button.dataset.planId = plan.id;
      button.dataset.planItemId = item.id;
      button.disabled = disabled;
      button.textContent = text;
      actions.appendChild(button);
    });

    row.append(label, actions);
    els.planItemList.appendChild(row);
  });
}

function renderPlanReminderService(plan) {
  const status = window.MRAppState?.getPlanReminderServiceStatus?.(plan?.id);
  if (els.planReminderServiceSummary) {
    if (!plan) {
      els.planReminderServiceSummary.textContent = "生成学习计划后，可检查本机浏览器提醒边界。";
      els.planReminderServiceSummary.dataset.serviceTone = "idle";
    } else if (status) {
      els.planReminderServiceSummary.textContent = `${status.message} ${status.boundary}`;
      els.planReminderServiceSummary.dataset.serviceTone = status.tone || "idle";
    }
  }

  if (els.planReminderPermissionButton) {
    els.planReminderPermissionButton.disabled = !plan
      || status?.supported === false
      || status?.permission === "denied"
      || (status?.enabled && !status?.hasPendingLocalReminder);
    els.planReminderPermissionButton.textContent = !plan
      ? "启用本机提醒"
      : status?.hasPendingLocalReminder
        ? "触发本机提醒"
        : status?.enabled
          ? "提醒已启用"
          : status?.permission === "denied"
            ? "提醒被拒绝"
            : status?.supported === false
              ? "仅页面内提醒"
              : "启用本机提醒";
  }

  if (plan && status?.hasPendingLocalReminder) {
    const dispatched = window.MRAppState?.dispatchPlanReminderNotification?.(plan.id);
    if (dispatched?.ok) {
      showNotice(dispatched.message);
    }
  }
}

function renderPlanRepositoryStatus(planHistory = []) {
  const status = window.MRAppState?.getPlanRepositoryStatus?.();
  const config = window.MRAppState?.getPlanRepositoryRemoteConfig?.();
  if (els.planRepositorySummary) {
    els.planRepositorySummary.textContent = status
      ? `${status.message} ${status.boundary}`
      : "计划同步仓库尚未初始化。";
    els.planRepositorySummary.dataset.repositoryTone = status?.tone || "idle";
  }
  if (els.planRepositoryExportButton) {
    els.planRepositoryExportButton.disabled = !planHistory.length;
  }
  if (els.planRepositoryImportButton) {
    els.planRepositoryImportButton.disabled = !window.FileReader;
  }
  if (els.planRepositoryEndpointInput && document.activeElement !== els.planRepositoryEndpointInput) {
    els.planRepositoryEndpointInput.value = config?.remoteEndpoint || "";
  }
  if (els.planRepositoryTokenInput && document.activeElement !== els.planRepositoryTokenInput) {
    els.planRepositoryTokenInput.value = config?.remoteToken || "";
  }
  if (els.planRepositoryWorkspaceInput && document.activeElement !== els.planRepositoryWorkspaceInput) {
    els.planRepositoryWorkspaceInput.value = config?.workspaceId || "";
  }
  if (els.planRepositorySaveRemoteButton) {
    els.planRepositorySaveRemoteButton.disabled = false;
  }
  if (els.planRepositoryRemoteButton) {
    els.planRepositoryRemoteButton.disabled = false;
    els.planRepositoryRemoteButton.textContent = status?.remoteConfigured ? "检查远端" : "远端未配置";
  }
  if (els.planRepositoryPushButton) {
    els.planRepositoryPushButton.disabled = !status?.remoteConfigured || !planHistory.length;
    els.planRepositoryPushButton.textContent = status?.pendingAutoSync ? "同步队列" : "推送计划";
  }
  if (els.planRepositoryPullButton) {
    els.planRepositoryPullButton.disabled = !status?.remoteConfigured;
  }
  renderPlanRepositoryReceipts();
  renderPlanRepositoryConflictPanel(status);
}

function renderPlanRepositoryReceipts() {
  const audit = window.MRAppState?.getPlanRepositoryReceiptAudit?.();
  const receipts = Array.isArray(audit?.receipts) ? audit.receipts : [];
  if (els.planRepositoryReceiptStatus) {
    els.planRepositoryReceiptStatus.textContent = audit?.message || "暂无计划仓库回执。";
    els.planRepositoryReceiptStatus.dataset.receiptTone = receipts.length ? "ready" : "idle";
  }
  if (els.planRepositoryReceiptExportButton) {
    els.planRepositoryReceiptExportButton.disabled = !receipts.length;
  }
  if (!els.planRepositoryReceiptList) return;
  els.planRepositoryReceiptList.replaceChildren();
  receipts.slice(0, 5).forEach((receipt) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = receipt.packageId || receipt.sourcePackageId || "计划仓库回执";
    const meta = document.createElement("span");
    const digest = receipt.repositoryDigest ? receipt.repositoryDigest.slice(0, 12) : "摘要未知";
    const receiptDigest = receipt.receiptDigest ? receipt.receiptDigest.slice(0, 12) : "回执未知";
    meta.textContent = `${formatPlanRepositoryReceiptDirection(receipt.direction)} · ${formatHistoryTime(receipt.receivedAt || receipt.acceptedAt)} · 仓库 ${digest} · 回执 ${receiptDigest} · ${formatPlanRepositoryReceiptVerificationStatus(receipt.verificationStatus)}`;
    const detail = document.createElement("small");
    detail.textContent = `${receipt.remoteVersion || "远端版本未知"} / ${receipt.workspaceId || "local-browser"} / ${receipt.planCount || 0} 份计划 / ${receipt.verificationMessage || "本机校验未执行"}`;
    item.append(title, meta, detail);
    els.planRepositoryReceiptList.appendChild(item);
  });
}

function formatPlanRepositoryReceiptDirection(direction) {
  return {
    check: "检查",
    push: "推送",
    pull: "拉取"
  }[direction] || "回执";
}

function formatPlanRepositoryReceiptVerificationStatus(status) {
  return {
    verified: "本机校验通过",
    "workspace-mismatch": "空间不匹配",
    "digest-mismatch": "摘要不匹配"
  }[status] || "未校验";
}

function renderPlanRepositoryConflictPanel(status) {
  const panel = els.planRepositoryConflictPanel;
  if (!panel) return;
  const conflicts = Array.isArray(status?.lastSyncConflicts) ? status.lastSyncConflicts : [];
  const hasConflict = Boolean(status?.lastSyncConflictCount) && conflicts.length > 0;
  panel.hidden = !hasConflict;
  if (!hasConflict) {
    if (els.planRepositoryConflictList) {
      els.planRepositoryConflictList.innerHTML = "";
    }
    return;
  }

  if (els.planRepositoryConflictStatus) {
    els.planRepositoryConflictStatus.textContent = `${status.lastSyncConflictCount} 份计划同时有本机和远端修改，请选择处理方式。`;
  }
  if (els.planRepositoryConflictList) {
    els.planRepositoryConflictList.innerHTML = "";
    conflicts.forEach((conflict, conflictIndex) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = conflict.title || conflict.id;
      const detail = document.createElement("span");
      detail.textContent = `本机：${conflict.localTitle || conflict.id} / ${formatHistoryTime(conflict.localUpdatedAt)}；远端：${conflict.remoteTitle || conflict.id} / ${formatHistoryTime(conflict.remoteUpdatedAt)}`;
      item.append(title, detail);
      const fieldDiffs = conflict.fieldDiffs || {};
      const planFields = Array.isArray(fieldDiffs.plan) ? fieldDiffs.plan : [];
      const itemFields = Array.isArray(fieldDiffs.items) ? fieldDiffs.items : [];
      if (planFields.length || itemFields.length) {
        const mergeGrid = document.createElement("div");
        mergeGrid.className = "plan-repository-merge-fields";
        planFields.forEach((fieldDiff, fieldIndex) => {
          mergeGrid.appendChild(createPlanRepositoryMergeChoice({
            planId: conflict.id,
            itemId: "",
            fieldDiff,
            label: `计划${fieldDiff.label || fieldDiff.field}`,
            groupKey: `${conflictIndex}-plan-${fieldIndex}`
          }));
        });
        itemFields.forEach((itemDiff, itemIndex) => {
          const fields = Array.isArray(itemDiff.fields) ? itemDiff.fields : [];
          fields.forEach((fieldDiff, fieldIndex) => {
            mergeGrid.appendChild(createPlanRepositoryMergeChoice({
              planId: conflict.id,
              itemId: itemDiff.itemId || "",
              fieldDiff,
              label: `${itemDiff.localTitle || itemDiff.remoteTitle || "任务"} / ${fieldDiff.label || fieldDiff.field}`,
              groupKey: `${conflictIndex}-item-${itemIndex}-${fieldIndex}`
            }));
          });
        });
        item.appendChild(mergeGrid);
      }
      els.planRepositoryConflictList.appendChild(item);
    });
  }
}

function createPlanRepositoryMergeChoice({ planId, itemId = "", fieldDiff = {}, label = "", groupKey = "" }) {
  const wrapper = document.createElement("fieldset");
  wrapper.className = "plan-repository-merge-choice";
  const legend = document.createElement("legend");
  legend.textContent = label || fieldDiff.label || fieldDiff.field || "字段";
  const options = document.createElement("div");
  options.className = "plan-repository-merge-options";
  [
    { value: "local", label: "本机", detail: fieldDiff.localValue || "空", checked: true },
    { value: "remote", label: "远端", detail: fieldDiff.remoteValue || "空", checked: false }
  ].forEach((choice) => {
    const choiceLabel = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `plan-merge-${groupKey}`;
    input.value = choice.value;
    input.checked = choice.checked;
    input.dataset.planMergePlanId = planId;
    input.dataset.planMergeItemId = itemId;
    input.dataset.planMergeField = fieldDiff.field || "";
    const title = document.createElement("strong");
    title.textContent = choice.label;
    const detail = document.createElement("span");
    detail.textContent = choice.detail;
    choiceLabel.append(input, title, detail);
    options.appendChild(choiceLabel);
  });
  wrapper.append(legend, options);
  return wrapper;
}

function renderPlanDependencyGraph(plan) {
  if (!els.planDependencyGraph) return;
  els.planDependencyGraph.innerHTML = "";
  if (!plan) {
    els.planDependencyGraph.hidden = false;
    const empty = document.createElement("p");
    empty.textContent = "生成学习计划后，这里会显示任务依赖图。";
    els.planDependencyGraph.appendChild(empty);
    return;
  }

  const graph = plan.dependencyGraph || { nodes: [], edges: [], summary: "暂无依赖摘要" };
  els.planDependencyGraph.hidden = false;

  const header = document.createElement("div");
  header.className = "plan-dependency-head";
  const title = document.createElement("strong");
  title.textContent = "任务依赖图";
  const summary = document.createElement("span");
  summary.textContent = graph.summary || "暂无依赖摘要";
  header.append(title, summary);

  const list = document.createElement("div");
  list.className = "plan-dependency-list";

  if (!graph.nodes?.length) {
    const empty = document.createElement("p");
    empty.textContent = "这份计划还没有可展示的任务依赖。";
    list.appendChild(empty);
  } else {
    graph.nodes.forEach((node) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.featureState = "real-local";
      button.dataset.planJumpItemId = node.id;
      button.dataset.planJumpTitle = node.title;
      button.dataset.dependencyTone = node.tone || "ready";
      button.className = "plan-dependency-node";

      const step = document.createElement("span");
      step.className = "plan-dependency-step";
      step.textContent = String(node.step || 1);

      const body = document.createElement("span");
      body.className = "plan-dependency-body";
      const nodeTitle = document.createElement("strong");
      nodeTitle.textContent = node.title;
      const detail = document.createElement("small");
      detail.textContent = node.dependencyLabels?.length
        ? `依赖：${node.dependencyLabels.join("、")}`
        : "依赖：起点任务";
      body.append(nodeTitle, detail);

      const status = document.createElement("em");
      status.textContent = node.label || "可开始";

      button.append(step, body, status);
      list.appendChild(button);
    });
  }

  els.planDependencyGraph.append(header, list);
}

function handlePlanDependencyClick(event) {
  const button = event.target.closest("[data-plan-jump-item-id]");
  if (!button) return;
  focusPlanItem(button.dataset.planJumpItemId, button.dataset.planJumpTitle);
}

function focusPlanItem(itemId, title = "") {
  if (!els.planItemList || !itemId) return;
  const rows = Array.from(els.planItemList.querySelectorAll("[data-plan-row-id]"));
  rows.forEach((row) => row.classList.toggle("is-highlighted", row.dataset.planRowId === itemId));
  const target = rows.find((row) => row.dataset.planRowId === itemId);
  if (!target) {
    showNotice("未找到对应计划项。");
    return;
  }
  target.scrollIntoView({ block: "nearest", behavior: "smooth" });
  target.focus();
  showNotice(title ? `已定位计划项：${title}` : "已定位计划项。");
  window.setTimeout(() => {
    target.classList.remove("is-highlighted");
  }, 1800);
}

function renderPlanHistorySelect(planHistory, activeId) {
  if (!els.planHistorySelect) return;
  els.planHistorySelect.innerHTML = "";
  if (!planHistory.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "暂无计划";
    els.planHistorySelect.appendChild(option);
    els.planHistorySelect.disabled = true;
    return;
  }

  planHistory.forEach((plan, index) => {
    const option = document.createElement("option");
    option.value = plan.id;
    option.textContent = `${index === 0 ? "最新 · " : ""}${formatHistoryTime(plan.createdAt)} · ${plan.progress.done}/${plan.progress.total} · ${plan.title}`;
    els.planHistorySelect.appendChild(option);
  });
  els.planHistorySelect.disabled = false;
  els.planHistorySelect.value = activeId || planHistory[0]?.id || "";
}

function handlePlanItemAction(event) {
  const button = event.target.closest("[data-plan-action]");
  if (!button) return;

  const planId = button.dataset.planId;
  const itemId = button.dataset.planItemId;
  const action = button.dataset.planAction;
  let result = null;

  if (action === "edit") {
    openPlanItemDialog("edit", planId, itemId);
    return;
  } else if (action === "delete") {
    result = deletePlanItem(planId, itemId);
  } else if (action === "up" || action === "down") {
    result = window.MRAppState?.movePlanItem?.(planId, itemId, action);
  } else if (action === "snooze") {
    result = window.MRAppState?.snoozePlanItem?.(planId, itemId, 1);
  } else if (action === "review") {
    result = window.MRAppState?.completePlanItemReview?.(planId, itemId);
  }

  if (result?.message) {
    showNotice(result.message);
  }
  if (result?.ok) {
    activePlanId = result.plan?.id || planId;
    renderPlanPanel(currentIndex);
    updateSceneText(currentIndex);
    updatePathPanel(currentIndex);
    renderLearningStateSummary();
    if (action === "review" && result.nextAction) {
      followPlanReviewAction(result.nextAction);
    }
  }
}

function openPlanItemDialog(mode, planId, itemId = null) {
  const plan = window.MRAppState?.getPlan?.(planId);
  if (!plan) {
    showNotice("请先生成一份学习计划。");
    return;
  }
  const item = mode === "edit"
    ? plan.items?.find((entry) => entry.id === itemId)
    : null;
  if (mode === "edit" && !item) {
    showNotice("未找到计划任务。");
    return;
  }

  activePlanItemEditor = {
    mode: mode === "edit" ? "edit" : "add",
    planId,
    itemId: item?.id || null
  };
  if (els.planItemDialogTitle) {
    els.planItemDialogTitle.textContent = mode === "edit" ? "编辑计划项" : "新增计划项";
  }
  if (els.planItemTitleInput) {
    els.planItemTitleInput.value = item?.title || "补充一次专项练习";
  }
  if (els.planItemDetailInput) {
    els.planItemDetailInput.value = item?.detail || (mode === "edit" ? "" : "写下这项练习的完成标准。");
  }
  if (els.planItemDueInput) {
    els.planItemDueInput.value = item ? formatPlanInputDate(item.dueAt) : "";
  }
  if (els.planItemRemindInput) {
    els.planItemRemindInput.value = item ? formatPlanInputDate(item.remindAt) : "";
  }
  if (els.planItemReviewActionInput) {
    els.planItemReviewActionInput.value = item?.reviewAction || "custom";
  }
  setPlanItemDialogFeedback("");
  if (els.planItemDialog?.showModal) {
    els.planItemDialog.showModal();
  } else if (els.planItemDialog) {
    els.planItemDialog.hidden = false;
    els.planItemDialog.setAttribute("open", "");
  }
  els.planItemTitleInput?.focus();
}

function deletePlanItem(planId, itemId) {
  const plan = window.MRAppState?.getPlan?.(planId);
  const item = plan?.items?.find((entry) => entry.id === itemId);
  if (!item) {
    return { ok: false, message: "未找到计划任务。" };
  }
  if (!window.confirm(`确定删除计划项“${item.title}”吗？`)) {
    return null;
  }
  return window.MRAppState?.deletePlanItem?.(planId, itemId);
}

function addCustomPlanItem() {
  const planId = activePlanId || els.planHistorySelect?.value || "";
  if (!planId) {
    showNotice("请先点击“制定计划”，再新增自定义计划项。");
    return;
  }
  openPlanItemDialog("add", planId);
}

function closePlanItemDialog() {
  activePlanItemEditor = null;
  setPlanItemDialogFeedback("");
  if (els.planItemDialog?.close) {
    els.planItemDialog.close();
  } else if (els.planItemDialog) {
    els.planItemDialog.removeAttribute("open");
    els.planItemDialog.hidden = true;
  }
}

function submitPlanItemForm(event) {
  event.preventDefault();
  if (!activePlanItemEditor) {
    setPlanItemDialogFeedback("当前没有正在编辑的计划项。", "danger");
    return;
  }

  const payload = {
    title: String(els.planItemTitleInput?.value || "").trim(),
    detail: String(els.planItemDetailInput?.value || "").trim(),
    dueAt: els.planItemDueInput?.value || "",
    remindAt: els.planItemRemindInput?.value || "",
    reviewAction: els.planItemReviewActionInput?.value || "custom"
  };
  if (payload.title.length < 2) {
    setPlanItemDialogFeedback("计划项标题至少需要 2 个字符。", "danger");
    els.planItemTitleInput?.focus();
    return;
  }
  if (payload.dueAt && payload.remindAt && Date.parse(payload.remindAt) > Date.parse(payload.dueAt)) {
    setPlanItemDialogFeedback("提醒日期不能晚于到期日期。", "danger");
    els.planItemRemindInput?.focus();
    return;
  }

  const result = activePlanItemEditor.mode === "edit"
    ? window.MRAppState?.updatePlanItem?.(activePlanItemEditor.planId, activePlanItemEditor.itemId, payload)
    : window.MRAppState?.addPlanItem?.(activePlanItemEditor.planId, payload);
  if (result?.ok) {
    activePlanId = result.plan?.id || activePlanItemEditor.planId;
    closePlanItemDialog();
    if (result.message) {
      showNotice(result.message);
    }
    renderPlanPanel(currentIndex);
    updateSceneText(currentIndex);
    updatePathPanel(currentIndex);
    renderLearningStateSummary();
    return;
  }

  setPlanItemDialogFeedback(result?.message || "计划项保存失败。", "danger");
}

function setPlanItemDialogFeedback(message, tone = "idle") {
  if (!els.planItemDialogFeedback) return;
  els.planItemDialogFeedback.textContent = message;
  els.planItemDialogFeedback.dataset.feedbackTone = tone;
  els.planItemDialogFeedback.hidden = !message;
}

function downloadActivePlan() {
  const planId = activePlanId || els.planHistorySelect?.value || "";
  const result = window.MRAppState?.downloadPlan?.(planId);
  showNotice(result?.message || "暂无可导出的学习计划。");
}

function downloadActivePlanCalendar() {
  const planId = activePlanId || els.planHistorySelect?.value || "";
  const result = window.MRAppState?.downloadPlanCalendar?.(planId);
  showNotice(result?.message || "暂无可导出的学习计划提醒日历。");
}

function downloadPlanRepositoryPackage() {
  const result = window.MRAppState?.downloadPlanRepository?.();
  if (result?.message) {
    showNotice(result.message);
  }
  renderPlanPanel(currentIndex);
}

function exportPlanRepositoryReceipts() {
  const result = window.MRAppState?.downloadPlanRepositoryReceiptAudit?.();
  if (result?.message) {
    showNotice(result.message);
  } else {
    showNotice("暂无可导出的计划仓库回执。");
  }
  renderPlanPanel(currentIndex);
}

function choosePlanRepositoryImport() {
  if (!els.planRepositoryImportInput) {
    showNotice("当前浏览器不支持选择同步包文件。");
    return;
  }
  els.planRepositoryImportInput.value = "";
  els.planRepositoryImportInput.click();
}

function importPlanRepositoryFile(event) {
  const file = event.target.files?.[0] || null;
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const result = window.MRAppState?.importPlanRepositoryPackage?.(String(reader.result || ""));
    if (result?.ok) {
      activePlanId = window.MRAppState?.getLatestPlan?.()?.id || activePlanId;
      renderPlanPanel(currentIndex);
      updateSceneText(currentIndex);
      updatePathPanel(currentIndex);
      renderLearningStateSummary();
    } else {
      renderPlanPanel(currentIndex);
    }
    showNotice(result?.message || "计划同步包导入失败。");
  });
  reader.addEventListener("error", () => {
    showNotice("计划同步包读取失败。");
  });
  reader.readAsText(file);
}

function savePlanRepositoryRemoteConfig() {
  const endpoint = els.planRepositoryEndpointInput?.value || "";
  const token = els.planRepositoryTokenInput?.value || "";
  const workspaceId = els.planRepositoryWorkspaceInput?.value || "";
  const result = window.MRAppState?.configurePlanRepositoryRemote?.({
    remoteEndpoint: endpoint,
    remoteToken: token,
    workspaceId
  });
  if (result?.message) {
    showNotice(result.message);
  }
  renderPlanPanel(currentIndex);
}

async function checkPlanRepositoryRemote() {
  setPlanRepositoryRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.checkRemotePlanRepository?.());
    if (result?.message) {
      showNotice(result.message);
    }
  } catch (error) {
    showNotice(`远端计划 API 检查失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setPlanRepositoryRemoteBusy(false);
    renderPlanPanel(currentIndex);
  }
}

async function pushPlanRepositoryRemote() {
  setPlanRepositoryRemoteBusy(true);
  try {
    const status = window.MRAppState?.getPlanRepositoryStatus?.();
    const action = status?.pendingAutoSync
      ? window.MRAppState?.flushPlanRepositoryAutoSync
      : window.MRAppState?.pushPlanRepositoryToRemote;
    const result = await Promise.resolve(action?.());
    if (result?.message) {
      showNotice(result.message);
    }
  } catch (error) {
    showNotice(`远端计划 API 推送失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setPlanRepositoryRemoteBusy(false);
    renderPlanPanel(currentIndex);
  }
}

async function pullPlanRepositoryRemote() {
  setPlanRepositoryRemoteBusy(true);
  try {
    const result = await Promise.resolve(window.MRAppState?.pullPlanRepositoryFromRemote?.());
    if (result?.ok) {
      activePlanId = window.MRAppState?.getLatestPlan?.()?.id || activePlanId;
      updateSceneText(currentIndex);
      updatePathPanel(currentIndex);
      renderLearningStateSummary();
    }
    if (result?.message) {
      showNotice(result.message);
    }
  } catch (error) {
    showNotice(`远端计划 API 拉取失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setPlanRepositoryRemoteBusy(false);
    renderPlanPanel(currentIndex);
  }
}

async function resolvePlanRepositoryConflict(strategy) {
  const labels = {
    "keep-local": "保留本机计划",
    "use-remote": "采用远端计划",
    "copy-remote": "另存远端副本",
    "merge-fields": "字段级合并"
  };
  setPlanRepositoryRemoteBusy(true);
  try {
    const options = strategy === "merge-fields"
      ? { selections: collectPlanRepositoryMergeSelections() }
      : {};
    const result = await Promise.resolve(window.MRAppState?.resolvePlanRepositoryConflict?.(strategy, options));
    if (result?.ok) {
      activePlanId = result.plans?.[0]?.id || window.MRAppState?.getLatestPlan?.()?.id || activePlanId;
      updateSceneText(currentIndex);
      updatePathPanel(currentIndex);
      renderLearningStateSummary();
    }
    showNotice(result?.message || `${labels[strategy] || "计划冲突处理"}失败。`);
  } catch (error) {
    showNotice(`${labels[strategy] || "计划冲突处理"}失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setPlanRepositoryRemoteBusy(false);
    renderPlanPanel(currentIndex);
  }
}

function collectPlanRepositoryMergeSelections() {
  const selections = {};
  const panel = els.planRepositoryConflictPanel;
  if (!panel) return selections;
  panel.querySelectorAll("input[data-plan-merge-field]:checked").forEach((input) => {
    const planId = input.dataset.planMergePlanId || "";
    const itemId = input.dataset.planMergeItemId || "";
    const field = input.dataset.planMergeField || "";
    if (!planId || !field) return;
    if (!selections[planId]) {
      selections[planId] = { plan: {}, items: {} };
    }
    if (itemId) {
      if (!selections[planId].items[itemId]) {
        selections[planId].items[itemId] = {};
      }
      selections[planId].items[itemId][field] = input.value === "remote" ? "remote" : "local";
    } else {
      selections[planId].plan[field] = input.value === "remote" ? "remote" : "local";
    }
  });
  return selections;
}

function setPlanRepositoryRemoteBusy(isBusy) {
  [
    els.planRepositorySaveRemoteButton,
    els.planRepositoryRemoteButton,
    els.planRepositoryPushButton,
    els.planRepositoryPullButton,
    els.planRepositoryReceiptExportButton,
    els.planRepositoryKeepLocalButton,
    els.planRepositoryUseRemoteButton,
    els.planRepositoryCopyRemoteButton,
    els.planRepositoryMergeFieldsButton
  ].forEach((button) => {
    if (button) {
      button.disabled = Boolean(isBusy);
    }
  });
}

async function requestActivePlanReminderPermission() {
  const planId = activePlanId || els.planHistorySelect?.value || "";
  if (!planId) {
    showNotice("先生成一份学习计划，再启用本机提醒。");
    return;
  }

  try {
    const result = await window.MRAppState?.requestPlanReminderPermission?.(planId);
    let message = result?.message || "已检查本机提醒状态。";
    if (result?.ok) {
      const status = window.MRAppState?.getPlanReminderServiceStatus?.(planId);
      if (status?.hasPendingLocalReminder) {
        const dispatched = window.MRAppState?.dispatchPlanReminderNotification?.(planId, { force: true });
        if (dispatched?.message) {
          message = dispatched.message;
        }
      }
    }
    showNotice(message);
  } catch (error) {
    console.warn("本机提醒权限请求失败", error);
    showNotice("本机提醒权限请求失败，页面内提醒仍可使用。");
  } finally {
    renderPlanPanel(currentIndex);
    updateSceneText(currentIndex);
    updatePathPanel(currentIndex);
  }
}

function createNextPlanCycle() {
  const planId = activePlanId || els.planHistorySelect?.value || "";
  const result = window.MRAppState?.createNextPlanCycle?.(planId);
  if (result?.message) {
    showNotice(result.message);
  }
  if (result?.ok) {
    activePlanId = result.plan?.id || null;
    renderPlanPanel(currentIndex);
    updateSceneText(currentIndex);
    updatePathPanel(currentIndex);
    renderLearningStateSummary();
  }
}

function followPlanReviewAction(nextAction = {}) {
  if (nextAction.openArtworkId && typeof openArtworkDetailRoute === "function") {
    openArtworkDetailRoute(nextAction.openArtworkId, { routeMode: "push", updateUrl: true, showMissing: true });
    return;
  }
  if (nextAction.openReportId && typeof openReportDetailRoute === "function") {
    openReportDetailRoute(nextAction.openReportId, { routeMode: "push", updateUrl: true, showMissing: true });
    return;
  }
  if (Number.isInteger(nextAction.targetStep)) {
    loadScene(nextAction.targetStep, { routeMode: "push", updateStepRoute: true });
  }
}

function renderHistoryTrend(trend = [], dailyTrend = [], metricTrend = []) {
  if (!els.historyTrend) return;
  els.historyTrend.innerHTML = "";

  if (!trend.length && !dailyTrend.length && !metricTrend.length) {
    const empty = document.createElement("p");
    empty.textContent = "完成真实笔迹练习后会显示分数和维度趋势。";
    els.historyTrend.appendChild(empty);
    return;
  }

  if (trend.length) {
    const section = document.createElement("div");
    section.className = "history-trend-section";
    const title = document.createElement("strong");
    title.textContent = "最近分数";
    const bars = document.createElement("div");
    bars.className = "history-score-bars";

    trend.forEach((item) => {
      const bar = document.createElement("span");
      const height = clamp(Number(item.score) || 0, 8, 100);
      bar.className = `history-trend-bar is-${item.type}`;
      bar.style.height = `${height}%`;
      bar.title = `${item.label} ${item.score}分`;
      bar.setAttribute("aria-label", `${item.label} ${item.score}分`);
      bars.appendChild(bar);
    });

    section.append(title, bars);
    els.historyTrend.appendChild(section);
  }

  if (dailyTrend.length) {
    const section = document.createElement("div");
    section.className = "history-trend-section history-daily-section";
    const title = document.createElement("strong");
    title.textContent = "按日趋势";
    const bars = document.createElement("div");
    bars.className = "history-daily-bars";

    dailyTrend.forEach((item) => {
      const bar = document.createElement("span");
      const scoreHeight = item.averageScore ? clamp(Number(item.averageScore), 8, 100) : 6;
      bar.className = "history-daily-bar";
      bar.style.setProperty("--score-height", `${scoreHeight}%`);
      bar.title = `${item.date} 平均 ${item.averageScore || "-"} 分 / ${item.totalCount} 条记录`;
      bar.setAttribute("aria-label", bar.title);

      const score = document.createElement("em");
      score.textContent = item.averageScore || "-";
      const label = document.createElement("small");
      label.textContent = item.label;
      const count = document.createElement("b");
      count.textContent = String(item.totalCount);
      bar.append(score, label, count);
      bars.appendChild(bar);
    });

    section.append(title, bars);
    els.historyTrend.appendChild(section);
  }

  if (metricTrend.length) {
    const section = document.createElement("div");
    section.className = "history-trend-section history-metric-section";
    const title = document.createElement("strong");
    title.textContent = "维度趋势";
    const list = document.createElement("div");
    list.className = "history-metric-list";

    metricTrend.forEach((item) => {
      const row = document.createElement("div");
      row.className = `history-metric-row is-${item.key}`;
      const label = document.createElement("div");
      label.className = "history-metric-label";
      const name = document.createElement("span");
      name.textContent = item.label;
      const delta = document.createElement("em");
      const deltaText = item.points.length > 1
        ? `${item.delta >= 0 ? "+" : ""}${item.delta}`
        : "新";
      delta.textContent = `最新 ${item.latest} / 均 ${item.average} / ${deltaText}`;
      label.append(name, delta);

      const bars = document.createElement("div");
      bars.className = "history-metric-bars";
      item.points.forEach((point) => {
        const bar = document.createElement("span");
        const value = clamp(Number(point.value) || 0, 4, 100);
        bar.className = `history-metric-point is-${point.type}`;
        bar.style.setProperty("--metric-height", `${value}%`);
        bar.title = `${point.shortDate} ${point.label} ${item.label} ${point.value}分`;
        bar.setAttribute("aria-label", bar.title);
        bars.appendChild(bar);
      });

      row.append(label, bars);
      list.appendChild(row);
    });

    section.append(title, list);
    els.historyTrend.appendChild(section);
  }
}

function renderHistoryArtworkCompare() {
  if (!els.historyArtworkCompare || !window.MRAppState?.getArtworkComparison) return;
  const activeDetail = getActiveHistoryDetail();
  const stats = window.MRAppState?.getStats?.();
  const preferredGlyph = activeDetail?.type === "artwork"
    ? activeDetail.glyph
    : stats?.glyph || "";
  const comparison = window.MRAppState.getArtworkComparison(preferredGlyph);
  els.historyArtworkCompare.innerHTML = "";
  els.historyArtworkCompare.classList.toggle("is-empty", !comparison?.ok);

  const head = document.createElement("div");
  head.className = "history-artwork-compare-head";
  const title = document.createElement("strong");
  title.textContent = comparison?.ok
    ? `${comparison.glyph}字作品对比`
    : "作品对比";
  const summary = document.createElement("span");
  summary.textContent = comparison?.ok
    ? `${comparison.total} 幅同字作品 · ${comparison.summary}`
    : comparison?.message || "保存两幅同字作品后会显示前后对比。";
  head.append(title, summary);
  els.historyArtworkCompare.appendChild(head);

  if (!comparison?.ok) {
    return;
  }

  const grid = document.createElement("div");
  grid.className = "history-artwork-compare-grid";
  grid.append(
    createArtworkCompareCard("较早作品", comparison.previous),
    createArtworkDeltaPanel(comparison),
    createArtworkCompareCard("最新作品", comparison.latest)
  );
  els.historyArtworkCompare.appendChild(grid);
}

function renderHistoryArtworkGallery() {
  if (!els.historyArtworkGallery || !window.MRAppState?.getArtworkGallery) return;
  let gallery = window.MRAppState.getArtworkGallery({
    query: activeArtworkSearch,
    tag: activeArtworkTag,
    limit: 9
  });
  const knownTags = new Set((gallery.tags || []).map((item) => item.tag));
  if (activeArtworkTag && !knownTags.has(activeArtworkTag)) {
    activeArtworkTag = "";
    gallery = window.MRAppState.getArtworkGallery({
      query: activeArtworkSearch,
      tag: activeArtworkTag,
      limit: 9
    });
  }

  els.historyArtworkGallery.classList.toggle("is-empty", gallery.total === 0);
  if (els.artworkSearch && document.activeElement !== els.artworkSearch) {
    els.artworkSearch.value = activeArtworkSearch;
  }
  if (els.artworkGalleryStatus) {
    els.artworkGalleryStatus.textContent = gallery.total
      ? `${gallery.filteredTotal}/${gallery.total} 幅作品${activeArtworkTag ? ` · ${activeArtworkTag}` : ""}`
      : "暂无作品";
  }
  renderArtworkTagList(gallery.tags || []);
  renderArtworkGalleryGrid(gallery);
}

function renderArtworkTagList(tags = []) {
  if (!els.artworkTagList) return;
  els.artworkTagList.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.dataset.featureState = "real-local";
  allButton.dataset.artworkTag = "";
  allButton.classList.toggle("is-active", !activeArtworkTag);
  allButton.textContent = "全部标签";
  els.artworkTagList.appendChild(allButton);

  tags.slice(0, 14).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.featureState = "real-local";
    button.dataset.artworkTag = item.tag;
    button.classList.toggle("is-active", activeArtworkTag === item.tag);
    button.textContent = `${item.tag} ${item.count}`;
    els.artworkTagList.appendChild(button);
  });
}

function renderArtworkGalleryGrid(gallery) {
  if (!els.artworkGalleryGrid) return;
  els.artworkGalleryGrid.innerHTML = "";
  const items = gallery.items || [];

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "artwork-gallery-empty";
    empty.textContent = gallery.total
      ? "当前搜索或标签下没有匹配作品。"
      : "保存作品后，这里会出现可搜索、可打标签、可复制直达链接的作品集。";
    els.artworkGalleryGrid.appendChild(empty);
    return;
  }

  items.forEach((artwork) => {
    els.artworkGalleryGrid.appendChild(createArtworkGalleryCard(artwork));
  });
}

function createArtworkGalleryCard(artwork) {
  const card = document.createElement("article");
  card.className = "artwork-gallery-card";

  const media = document.createElement("button");
  media.type = "button";
  media.className = "artwork-gallery-media";
  media.dataset.featureState = "real-local";
  media.dataset.artworkAction = "open";
  media.dataset.artworkId = artwork.id;
  media.setAttribute("aria-label", `打开作品：${artwork.title}`);
  if (artwork.imageData) {
    const image = document.createElement("img");
    image.src = artwork.imageData;
    image.alt = artwork.title;
    media.appendChild(image);
  } else {
    const empty = document.createElement("span");
    empty.textContent = artwork.glyph || "作品";
    media.appendChild(empty);
  }

  const body = document.createElement("div");
  body.className = "artwork-gallery-body";
  const title = document.createElement("strong");
  title.textContent = artwork.title;
  const meta = document.createElement("span");
  meta.textContent = `${formatHistoryTime(artwork.createdAt)} / ${artwork.glyph || "-"} / ${artwork.style || "-"} / ${artwork.score || 0}分`;
  body.append(title, meta);

  const tags = document.createElement("div");
  tags.className = "artwork-gallery-tags";
  (artwork.tags?.length ? artwork.tags : ["未标记"]).slice(0, 5).forEach((tag) => {
    const item = document.createElement("button");
    item.type = "button";
    item.dataset.featureState = "real-local";
    item.dataset.artworkTag = tag === "未标记" ? "" : tag;
    item.textContent = tag;
    tags.appendChild(item);
  });
  body.appendChild(tags);

  const stats = document.createElement("div");
  stats.className = "artwork-gallery-stats";
  [
    ["笔画", artwork.strokeCount || 0],
    ["采样", artwork.pointCount || 0]
  ].forEach(([label, value]) => {
    const item = document.createElement("span");
    item.textContent = `${label} ${value}`;
    stats.appendChild(item);
  });
  body.appendChild(stats);

  const actions = document.createElement("div");
  actions.className = "artwork-gallery-actions";
  [
    ["open", "详情"],
    ["copy", "复制链接"],
    ["tags", "标签"]
  ].forEach(([action, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.featureState = "real-local";
    button.dataset.artworkAction = action;
    button.dataset.artworkId = artwork.id;
    button.textContent = label;
    actions.appendChild(button);
  });
  body.appendChild(actions);

  card.append(media, body);
  return card;
}

function createArtworkCompareCard(label, artwork) {
  const card = document.createElement("div");
  card.className = "history-artwork-card";
  const heading = document.createElement("div");
  heading.className = "history-artwork-card-head";
  const eyebrow = document.createElement("span");
  eyebrow.textContent = label;
  const title = document.createElement("strong");
  title.textContent = artwork.title || `${artwork.glyph || "作品"}练习`;
  const meta = document.createElement("small");
  meta.textContent = `${formatHistoryTime(artwork.createdAt)} / ${artwork.style || "-"} / ${artwork.score || 0}分`;
  heading.append(eyebrow, title, meta);
  card.appendChild(heading);

  if (artwork.imageData) {
    const image = document.createElement("img");
    image.src = artwork.imageData;
    image.alt = artwork.title || label;
    card.appendChild(image);
  } else {
    const empty = document.createElement("p");
    empty.className = "history-artwork-empty";
    empty.textContent = "这幅作品没有截图，可进入详情回放笔迹。";
    card.appendChild(empty);
  }

  const stats = document.createElement("div");
  stats.className = "history-artwork-card-stats";
  [
    ["笔画", artwork.strokeCount || 0],
    ["采样", artwork.pointCount || 0]
  ].forEach(([name, value]) => {
    const item = document.createElement("span");
    item.textContent = `${name} ${value}`;
    stats.appendChild(item);
  });
  card.appendChild(stats);

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.featureState = "real-local";
  button.dataset.compareHistoryId = artwork.id;
  button.textContent = "查看这幅";
  card.appendChild(button);
  return card;
}

function createArtworkDeltaPanel(comparison) {
  const panel = document.createElement("div");
  panel.className = "history-artwork-delta";
  const title = document.createElement("strong");
  title.textContent = "变化";
  panel.appendChild(title);

  const stats = document.createElement("div");
  stats.className = "history-artwork-delta-stats";
  [
    ["评分", comparison.scoreDelta, "分"],
    ["笔画", comparison.strokeDelta, ""],
    ["采样", comparison.pointDelta, ""]
  ].forEach(([label, value, unit]) => {
    const item = document.createElement("span");
    const name = document.createElement("small");
    name.textContent = label;
    const data = document.createElement("em");
    data.textContent = formatSignedDelta(value, unit);
    data.dataset.tone = value > 0 ? "up" : value < 0 ? "down" : "same";
    item.append(name, data);
    stats.appendChild(item);
  });
  panel.appendChild(stats);

  if (comparison.metricDeltas?.length) {
    const metrics = document.createElement("div");
    metrics.className = "history-artwork-metric-deltas";
    comparison.metricDeltas.slice(0, 5).forEach((metric) => {
      const row = document.createElement("span");
      row.textContent = `${metric.label} ${metric.previous || "-"} → ${metric.latest || "-"} (${formatSignedDelta(metric.delta)})`;
      metrics.appendChild(row);
    });
    panel.appendChild(metrics);
  } else {
    const empty = document.createElement("p");
    empty.textContent = "这两幅作品暂无可比较的维度评分。";
    panel.appendChild(empty);
  }
  return panel;
}

function formatSignedDelta(value, unit = "") {
  const number = Number(value) || 0;
  if (number > 0) return `+${number}${unit}`;
  if (number < 0) return `${number}${unit}`;
  return `0${unit}`;
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
    const row = document.createElement("div");
    row.className = "history-list-row";
    row.classList.toggle("is-selected", selectedHistoryIds.has(entry.id));

    const selector = document.createElement("input");
    selector.type = "checkbox";
    selector.className = "history-select";
    selector.checked = selectedHistoryIds.has(entry.id);
    selector.dataset.historySelectId = entry.id;
    selector.setAttribute("aria-label", `选择记录：${entry.title}`);

    const item = document.createElement("button");
    item.type = "button";
    item.className = `history-item is-${entry.type}`;
    item.dataset.featureState = "real-local";
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
    row.append(selector, item);
    els.historyList.appendChild(row);
  });
}

function handleHistoryListClick(event) {
  const item = event.target.closest("[data-history-id]");
  if (!item) return;
  selectHistoryDetail(item.dataset.historyId);
}

function selectHistoryDetail(recordId, options = {}) {
  const detailId = String(recordId || "").trim();
  if (!detailId) {
    return false;
  }

  activeHistoryDetailId = detailId;
  activeReportDetailId = null;
  if (options.updateUrl !== false) {
    setHistoryDetailRoute(detailId);
  }
  renderHistoryPanel(currentIndex);
  return true;
}

function getArtworkShareRouteId() {
  try {
    return new URLSearchParams(window.location.search).get(SHARE_LINK_QUERY_KEY) || "";
  } catch (error) {
    return "";
  }
}

function getArtworkShareUrl(shareId) {
  const url = new URL(window.location.href);
  url.searchParams.delete(HISTORY_DETAIL_QUERY_KEY);
  url.searchParams.delete(REPORT_DETAIL_QUERY_KEY);
  url.searchParams.delete(ARTWORK_DETAIL_QUERY_KEY);
  url.searchParams.delete(STEP_ROUTE_QUERY_KEY);
  url.searchParams.delete(POINT_ROUTE_QUERY_KEY);
  url.searchParams.set(SHARE_LINK_QUERY_KEY, String(shareId || "").trim());
  return url.toString();
}

function setArtworkShareRoute(shareId) {
  if (!window.history?.replaceState || !shareId) {
    return;
  }

  const url = new URL(getArtworkShareUrl(shareId));
  window.history.replaceState(
    { ...(window.history.state || {}), shareId: String(shareId), historyDetailId: null, reportDetailId: null, artworkDetailId: null },
    "",
    url.toString()
  );
}

function clearArtworkShareRoute() {
  if (!window.history?.replaceState) {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has(SHARE_LINK_QUERY_KEY)) {
    return;
  }
  url.searchParams.delete(SHARE_LINK_QUERY_KEY);
  window.history.replaceState(
    { ...(window.history.state || {}), shareId: null },
    "",
    url.toString()
  );
}

function openArtworkShareRoute(shareId, options = {}) {
  const result = window.MRAppState?.openArtworkShareLink?.(shareId);
  const record = result?.record || null;
  activeArtworkShareId = record?.id || null;
  const shouldUpdateStepRoute = options.updateStepRoute === true;
  if (record?.artworkId) {
    openArtworkDetailRoute(record.artworkId, {
      updateUrl: false,
      updateStepRoute: shouldUpdateStepRoute,
      routeMode: options.routeMode,
      showMissing: true
    });
    showNotice(result?.message || "已打开本机分享链接。");
    return Boolean(result?.ok);
  }

  clearArtworkShareRoute();
  loadScene(6, { routeMode: options.routeMode, updateStepRoute: shouldUpdateStepRoute });
  if (options.showMissing) {
    showNotice(result?.message || "未找到这条本机分享链接。");
  }
  return false;
}

function getHistoryDetailRouteId() {
  try {
    return new URLSearchParams(window.location.search).get(HISTORY_DETAIL_QUERY_KEY) || "";
  } catch (error) {
    return "";
  }
}

function getLearningStepRouteIndex() {
  try {
    const raw = new URLSearchParams(window.location.search).get(STEP_ROUTE_QUERY_KEY);
    if (!raw) return null;
    const value = Number.parseInt(raw, 10);
    if (!Number.isFinite(value)) return null;
    return clamp(value - 1, 0, SCENES.length - 1);
  } catch (error) {
    return null;
  }
}

function clampScenePointIndex(sceneIndex, pointIndex) {
  const points = SCENES[sceneIndex]?.points || [];
  if (!points.length) return 0;
  return clamp(Number.isFinite(pointIndex) ? pointIndex : 0, 0, points.length - 1);
}

function getLearningPointRouteIndex(sceneIndex = getLearningStepRouteIndex() ?? currentIndex) {
  try {
    const raw = new URLSearchParams(window.location.search).get(POINT_ROUTE_QUERY_KEY);
    if (!raw) return null;
    const value = Number.parseInt(raw, 10);
    if (!Number.isFinite(value)) return null;
    return clampScenePointIndex(sceneIndex, value - 1);
  } catch (error) {
    return null;
  }
}

function setLearningStepRoute(index, options = {}) {
  if (!window.history?.pushState || index < 0 || index >= SCENES.length) {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_LINK_QUERY_KEY);
  url.searchParams.set(STEP_ROUTE_QUERY_KEY, String(index + 1));
  const pointIndex = Number.isInteger(options.pointIndex)
    ? clampScenePointIndex(index, options.pointIndex)
    : 0;
  if (pointIndex > 0) {
    url.searchParams.set(POINT_ROUTE_QUERY_KEY, String(pointIndex + 1));
  } else {
    url.searchParams.delete(POINT_ROUTE_QUERY_KEY);
  }
  const nextUrl = url.toString();
  const state = { ...(window.history.state || {}), stepIndex: index, pointIndex };
  if (nextUrl === window.location.href || options.routeMode === "replace") {
    window.history.replaceState(state, "", nextUrl);
    return;
  }
  window.history.pushState(state, "", nextUrl);
}

function setModelViewRoute(active, options = {}) {
  if (!window.history?.replaceState) {
    return;
  }

  const url = new URL(window.location.href);
  if (active) {
    url.searchParams.set(MODEL_VIEW_QUERY_KEY, "1");
  } else if (!url.searchParams.has(MODEL_VIEW_QUERY_KEY)) {
    return;
  } else {
    url.searchParams.delete(MODEL_VIEW_QUERY_KEY);
  }
  window.history.replaceState(
    { ...(window.history.state || {}), modelView: Boolean(active) },
    "",
    url.toString()
  );
}

function handleRoutePopState() {
  const routedShareId = getArtworkShareRouteId();
  const routedReportId = getReportDetailRouteId();
  const routedArtworkId = getArtworkDetailRouteId();
  const routedHistoryId = getHistoryDetailRouteId();
  if (routedShareId) {
    openArtworkShareRoute(routedShareId, { updateUrl: false, updateStepRoute: false, showMissing: true });
  } else if (routedReportId) {
    openReportDetailRoute(routedReportId, { updateUrl: false, updateStepRoute: false, showMissing: true });
  } else if (routedArtworkId) {
    openArtworkDetailRoute(routedArtworkId, { updateUrl: false, updateStepRoute: false, showMissing: true });
  } else if (routedHistoryId) {
    openHistoryDetailRoute(routedHistoryId, { updateUrl: false, updateStepRoute: false, showMissing: true });
  } else {
    const stepIndex = getLearningStepRouteIndex() ?? 0;
    loadScene(stepIndex, {
      updateStepRoute: false,
      pointIndex: getLearningPointRouteIndex(stepIndex) ?? 0
    });
  }

  if (new URLSearchParams(window.location.search).has(MODEL_VIEW_QUERY_KEY)) {
    focusModelView({ updateRoute: false });
  } else {
    clearModelView({ updateRoute: false });
  }
}

function openHistoryDetailRoute(recordId, options = {}) {
  const detailId = String(recordId || "").trim();
  if (!detailId) {
    return false;
  }

  activeHistoryFilter = "all";
  activeHistoryLimit = 50;
  selectedHistoryIds.clear();

  const detail = window.MRAppState?.getHistoryDetail?.(detailId) || null;
  activeHistoryDetailId = detail ? detailId : null;
  activeReportDetailId = null;
  if (options.updateUrl !== false) {
    setHistoryDetailRoute(detailId);
  }
  clearReportDetailRoute();
  clearArtworkDetailRoute();
  loadScene(6, { routeMode: options.routeMode, updateStepRoute: options.updateStepRoute !== false });

  if (detail) {
    showNotice(`已打开学习档案详情：${detail.title}`);
    return true;
  }

  clearHistoryDetailRoute();
  if (options.showMissing) {
    showNotice("未找到这条学习档案，已打开学习档案列表。");
  }
  return false;
}

function getHistoryDetailUrl(recordId) {
  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_LINK_QUERY_KEY);
  url.searchParams.delete(REPORT_DETAIL_QUERY_KEY);
  url.searchParams.delete(ARTWORK_DETAIL_QUERY_KEY);
  url.searchParams.set(HISTORY_DETAIL_QUERY_KEY, String(recordId || "").trim());
  return url.toString();
}

function setHistoryDetailRoute(recordId) {
  if (!window.history?.replaceState || !recordId) {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_LINK_QUERY_KEY);
  url.searchParams.delete(REPORT_DETAIL_QUERY_KEY);
  url.searchParams.delete(ARTWORK_DETAIL_QUERY_KEY);
  url.searchParams.set(HISTORY_DETAIL_QUERY_KEY, String(recordId));
  window.history.replaceState(
    { ...(window.history.state || {}), historyDetailId: String(recordId), reportDetailId: null, artworkDetailId: null },
    "",
    url.toString()
  );
}

function clearHistoryDetailRoute() {
  if (!window.history?.replaceState) {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has(HISTORY_DETAIL_QUERY_KEY)) {
    return;
  }
  url.searchParams.delete(HISTORY_DETAIL_QUERY_KEY);
  window.history.replaceState(
    { ...(window.history.state || {}), historyDetailId: null },
    "",
    url.toString()
  );
}

function getArtworkDetailRouteId() {
  try {
    return new URLSearchParams(window.location.search).get(ARTWORK_DETAIL_QUERY_KEY) || "";
  } catch (error) {
    return "";
  }
}

function openArtworkDetailRoute(artworkId, options = {}) {
  const detailId = String(artworkId || "").trim();
  if (!detailId) {
    return false;
  }

  const detail = window.MRAppState?.getHistoryDetail?.(detailId) || null;
  activeHistoryFilter = "artwork";
  activeHistoryLimit = 50;
  selectedHistoryIds.clear();
  activeReportDetailId = null;
  activeHistoryDetailId = detail?.type === "artwork" ? detail.id : null;

  if (activeHistoryDetailId) {
    if (options.updateUrl !== false) {
      setArtworkDetailRoute(activeHistoryDetailId);
    }
    clearHistoryDetailRoute();
    clearReportDetailRoute();
    loadScene(6, { routeMode: options.routeMode, updateStepRoute: options.updateStepRoute !== false });
    showNotice(`已打开作品集详情：${detail.title}`);
    return true;
  }

  clearArtworkDetailRoute();
  clearHistoryDetailRoute();
  clearReportDetailRoute();
  loadScene(6, { routeMode: options.routeMode, updateStepRoute: options.updateStepRoute !== false });
  if (options.showMissing) {
    showNotice("未找到这幅作品，已打开作品集列表。");
  }
  return false;
}

function getArtworkDetailUrl(artworkId) {
  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_LINK_QUERY_KEY);
  url.searchParams.delete(HISTORY_DETAIL_QUERY_KEY);
  url.searchParams.delete(REPORT_DETAIL_QUERY_KEY);
  url.searchParams.set(ARTWORK_DETAIL_QUERY_KEY, String(artworkId || "").trim());
  return url.toString();
}

function setArtworkDetailRoute(artworkId) {
  if (!window.history?.replaceState || !artworkId) {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_LINK_QUERY_KEY);
  url.searchParams.delete(HISTORY_DETAIL_QUERY_KEY);
  url.searchParams.delete(REPORT_DETAIL_QUERY_KEY);
  url.searchParams.set(ARTWORK_DETAIL_QUERY_KEY, String(artworkId));
  window.history.replaceState(
    { ...(window.history.state || {}), historyDetailId: null, reportDetailId: null, artworkDetailId: String(artworkId) },
    "",
    url.toString()
  );
}

function clearArtworkDetailRoute() {
  if (!window.history?.replaceState) {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has(ARTWORK_DETAIL_QUERY_KEY)) {
    return;
  }
  url.searchParams.delete(ARTWORK_DETAIL_QUERY_KEY);
  window.history.replaceState(
    { ...(window.history.state || {}), artworkDetailId: null },
    "",
    url.toString()
  );
}

function copyHistoryDetailLink() {
  const detail = getActiveHistoryDetail();
  if (!detail) {
    showNotice("请选择一条记录后再复制链接。");
    return;
  }

  const url = getHistoryDetailUrl(detail.id);
  setHistoryDetailRoute(detail.id);
  copyText(url)
    .then((ok) => {
      showNotice(ok
        ? "已复制这条学习档案的直达链接。"
        : "已把这条学习档案的直达链接写入地址栏，可手动复制。");
    });
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => fallbackCopyText(text));
  }
  return Promise.resolve(fallbackCopyText(text));
}

function fallbackCopyText(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (error) {
    ok = false;
  }
  field.remove();
  return ok;
}

function getReportDetailRouteId() {
  try {
    return new URLSearchParams(window.location.search).get(REPORT_DETAIL_QUERY_KEY) || "";
  } catch (error) {
    return "";
  }
}

function openReportDetailRoute(reportId, options = {}) {
  const detailId = String(reportId || "").trim();
  if (!detailId) {
    return false;
  }

  const detail = window.MRAppState?.getReportDetail?.(detailId) || null;
  activeReportDetailId = detail ? detail.id : null;
  activeHistoryDetailId = null;
  selectedHistoryIds.clear();

  if (detail) {
    if (options.updateUrl !== false) {
      setReportDetailRoute(detail.id);
    }
    clearHistoryDetailRoute();
    clearArtworkDetailRoute();
    loadScene(REPORT_DETAIL_SCENE_INDEX, { routeMode: options.routeMode, updateStepRoute: options.updateStepRoute !== false });
    showNotice(`已打开站内学习报告：${detail.title}`);
    return true;
  }

  clearReportDetailRoute();
  clearHistoryDetailRoute();
  clearArtworkDetailRoute();
  loadScene(REPORT_DETAIL_SCENE_INDEX, { routeMode: options.routeMode, updateStepRoute: options.updateStepRoute !== false });
  if (options.showMissing) {
    showNotice("未找到这份学习报告，已打开报告页空状态。");
  }
  return false;
}

function getReportDetailUrl(reportId) {
  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_LINK_QUERY_KEY);
  url.searchParams.delete(HISTORY_DETAIL_QUERY_KEY);
  url.searchParams.delete(ARTWORK_DETAIL_QUERY_KEY);
  url.searchParams.set(REPORT_DETAIL_QUERY_KEY, String(reportId || "").trim());
  return url.toString();
}

function setReportDetailRoute(reportId) {
  if (!window.history?.replaceState || !reportId) {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_LINK_QUERY_KEY);
  url.searchParams.delete(HISTORY_DETAIL_QUERY_KEY);
  url.searchParams.delete(ARTWORK_DETAIL_QUERY_KEY);
  url.searchParams.set(REPORT_DETAIL_QUERY_KEY, String(reportId));
  window.history.replaceState(
    { ...(window.history.state || {}), reportDetailId: String(reportId), historyDetailId: null, artworkDetailId: null },
    "",
    url.toString()
  );
}

function clearReportDetailRoute() {
  if (!window.history?.replaceState) {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has(REPORT_DETAIL_QUERY_KEY)) {
    return;
  }
  url.searchParams.delete(REPORT_DETAIL_QUERY_KEY);
  window.history.replaceState(
    { ...(window.history.state || {}), reportDetailId: null },
    "",
    url.toString()
  );
}

function copyReportDetailLink() {
  const detail = getActiveReportDetail();
  if (!detail) {
    showNotice("还没有可复制的站内报告链接。");
    return;
  }

  const url = getReportDetailUrl(detail.id);
  activeReportDetailId = detail.id;
  setReportDetailRoute(detail.id);
  copyText(url)
    .then((ok) => {
      showNotice(ok
        ? "已复制这份站内报告的直达链接。"
        : "已把这份站内报告的直达链接写入地址栏，可手动复制。");
    });
}

function downloadReportDetail() {
  const detail = getActiveReportDetail();
  if (!detail) {
    showNotice("还没有可下载的站内报告。");
    return;
  }

  const result = window.MRAppState?.downloadReport?.(detail.id);
  if (result?.message) {
    showNotice(result.message);
  }
}

function downloadReportPdfDetail() {
  const detail = getActiveReportDetail();
  if (!detail) {
    showNotice("还没有可下载的 PDF 报告。");
    return;
  }

  const result = window.MRAppState?.downloadReportPdf?.(detail.id);
  if (result?.message) {
    showNotice(result.message);
  }
}

function downloadReportComparisonDetail(reportId = activeReportDetailId) {
  const id = reportId || getActiveReportDetail()?.id || null;
  const result = window.MRAppState?.downloadReportComparison?.(id);
  if (result?.message) {
    showNotice(result.message);
    return;
  }
  showNotice("还没有可导出的报告对比。");
}

function printReportDetail() {
  const detail = getActiveReportDetail();
  if (!detail) {
    showNotice("还没有可打印的站内报告。");
    return;
  }

  document.body.classList.add("is-report-printing");
  showNotice("正在打开浏览器打印，可在打印窗口中选择“保存为 PDF”。");

  const cleanup = () => {
    document.body.classList.remove("is-report-printing");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.setTimeout(() => {
    window.print();
    window.setTimeout(cleanup, 1200);
  }, 60);
}

function openReportHistoryRecord() {
  const detail = getActiveReportDetail();
  if (!detail) {
    showNotice("还没有可查看的报告档案记录。");
    return;
  }

  activeHistoryFilter = "report";
  activeHistoryLimit = 50;
  activeHistoryDetailId = detail.id;
  activeReportDetailId = null;
  selectedHistoryIds.clear();
  setHistoryDetailRoute(detail.id);
  clearReportDetailRoute();
  clearArtworkDetailRoute();
  loadScene(6);
  showNotice(`已打开报告档案记录：${detail.title}`);
}

function openHistoryReportDetail() {
  const detail = getActiveHistoryDetail();
  if (detail?.type !== "report") {
    showNotice("请选择一条报告记录。");
    return;
  }
  openReportDetailRoute(detail.id);
}

function handleHistorySelectionChange(event) {
  const input = event.target.closest("[data-history-select-id]");
  if (!input) return;
  const recordId = input.dataset.historySelectId;
  if (input.checked) {
    selectedHistoryIds.add(recordId);
  } else {
    selectedHistoryIds.delete(recordId);
  }
  renderHistoryPanel(currentIndex);
}

function handleHistorySelectVisible(event) {
  const history = window.MRAppState?.getHistory?.({ filter: activeHistoryFilter, limit: activeHistoryLimit });
  const visibleIds = (history?.entries || []).map((entry) => entry.id);
  if (event.target.checked) {
    visibleIds.forEach((id) => selectedHistoryIds.add(id));
  } else {
    visibleIds.forEach((id) => selectedHistoryIds.delete(id));
  }
  renderHistoryPanel(currentIndex);
}

function exportSelectedHistoryRecords() {
  if (!selectedHistoryIds.size) {
    showNotice("请先选择要导出的学习档案。");
    return;
  }
  const result = window.MRAppState?.downloadHistoryRecords?.([...selectedHistoryIds]);
  if (result?.ok) {
    showNotice(result.message);
    return;
  }
  showNotice(result?.message || "导出所选档案失败。");
}

function deleteSelectedHistoryRecords() {
  const count = selectedHistoryIds.size;
  if (!count) {
    showNotice("请先选择要删除的学习档案。");
    return;
  }

  const confirmed = window.confirm(`确定将已选择的 ${count} 条学习档案移入回收站吗？之后可恢复最近删除。`);
  if (!confirmed) {
    return;
  }

  const ids = [...selectedHistoryIds];
  const result = window.MRAppState?.deleteHistoryRecords?.(ids);
  if (result?.ok) {
    ids.forEach((id) => selectedHistoryIds.delete(id));
    if (activeHistoryDetailId && ids.includes(activeHistoryDetailId)) {
      activeHistoryDetailId = null;
      clearHistoryDetailRoute();
      clearArtworkDetailRoute();
    }
    if (activeReportDetailId && ids.includes(activeReportDetailId)) {
      activeReportDetailId = null;
      clearReportDetailRoute();
    }
    refreshAfterHistoryMutation();
    showNotice(result.message);
    return;
  }
  showNotice(result?.message || "批量删除失败。");
}

function restoreLatestHistoryTrash() {
  const result = window.MRAppState?.restoreHistoryTrash?.();
  if (result?.ok) {
    activeHistoryLimit = Math.max(activeHistoryLimit, HISTORY_PAGE_SIZE);
    refreshAfterHistoryMutation();
    showNotice(result.message);
    return;
  }
  showNotice(result?.message || "恢复失败。");
}

function handleHistoryTrashAction(event) {
  const button = event.target.closest("[data-trash-action]");
  if (!button) {
    return;
  }

  const trashId = button.dataset.trashId;
  if (button.dataset.trashAction === "restore") {
    const result = window.MRAppState?.restoreHistoryTrash?.(trashId);
    if (result?.ok) {
      activeHistoryLimit = Math.max(activeHistoryLimit, HISTORY_PAGE_SIZE);
      refreshAfterHistoryMutation();
      showNotice(result.message);
      return;
    }
    showNotice(result?.message || "恢复失败。");
    return;
  }

  if (button.dataset.trashAction === "delete") {
    const trash = window.MRAppState?.getHistoryTrash?.();
    const entry = (trash?.entries || []).find((item) => item.id === trashId);
    const label = entry ? `“${entry.title}”中的 ${entry.recordCount} 条学习档案` : "这条回收站记录";
    if (!window.confirm(`确定永久删除${label}吗？此操作不能恢复。`)) {
      return;
    }
    const result = window.MRAppState?.deleteHistoryTrashEntry?.(trashId);
    refreshAfterHistoryMutation();
    showNotice(result?.message || "已永久删除回收站记录。");
  }
}

function handleArtworkCompareAction(event) {
  const button = event.target.closest("[data-compare-history-id]");
  if (!button) {
    return;
  }
  openArtworkDetailRoute(button.dataset.compareHistoryId);
}

function handleArtworkTagClick(event) {
  const button = event.target.closest("[data-artwork-tag]");
  if (!button) return;
  activeArtworkTag = button.dataset.artworkTag || "";
  renderHistoryArtworkGallery();
}

function handleArtworkGalleryAction(event) {
  const tagButton = event.target.closest(".artwork-gallery-tags [data-artwork-tag]");
  if (tagButton) {
    activeArtworkTag = tagButton.dataset.artworkTag || "";
    renderHistoryArtworkGallery();
    return;
  }

  const button = event.target.closest("[data-artwork-action]");
  if (!button) return;
  const artworkId = button.dataset.artworkId;
  const action = button.dataset.artworkAction;

  if (action === "open") {
    openArtworkDetailRoute(artworkId);
  } else if (action === "copy") {
    copyArtworkLink(artworkId);
  } else if (action === "tags") {
    editArtworkTags(artworkId);
  }
}

function copyArtworkLink(artworkId) {
  const detail = window.MRAppState?.getHistoryDetail?.(artworkId);
  if (detail?.type !== "artwork") {
    showNotice("未找到这幅作品，无法复制链接。");
    return;
  }

  const url = getArtworkDetailUrl(detail.id);
  setArtworkDetailRoute(detail.id);
  copyText(url)
    .then((ok) => {
      showNotice(ok
        ? "已复制这幅作品的作品集直达链接。"
        : "已把这幅作品的直达链接写入地址栏，可手动复制。");
    });
}

function editArtworkTags(artworkId) {
  const detail = window.MRAppState?.getHistoryDetail?.(artworkId);
  if (detail?.type !== "artwork") {
    showNotice("请选择一幅作品后再编辑标签。");
    return;
  }

  activeArtworkTagEditorId = detail.id;
  if (els.artworkTagsInput) {
    els.artworkTagsInput.value = (detail.tags || []).join("、");
  }
  setHistoryEditFeedback(els.artworkTagsFeedback, "");
  if (els.artworkTagsDialog?.showModal) {
    els.artworkTagsDialog.showModal();
  } else if (els.artworkTagsDialog) {
    els.artworkTagsDialog.hidden = false;
    els.artworkTagsDialog.setAttribute("open", "");
  }
  els.artworkTagsInput?.focus();
}

function closeArtworkTagsDialog() {
  activeArtworkTagEditorId = null;
  setHistoryEditFeedback(els.artworkTagsFeedback, "");
  if (els.artworkTagsDialog?.close) {
    els.artworkTagsDialog.close();
  } else if (els.artworkTagsDialog) {
    els.artworkTagsDialog.removeAttribute("open");
    els.artworkTagsDialog.hidden = true;
  }
}

function submitArtworkTagsForm(event) {
  event.preventDefault();
  const detail = activeArtworkTagEditorId
    ? window.MRAppState?.getHistoryDetail?.(activeArtworkTagEditorId)
    : null;
  if (detail?.type !== "artwork") {
    setHistoryEditFeedback(els.artworkTagsFeedback, "未找到这幅作品。", "danger");
    return;
  }

  const value = String(els.artworkTagsInput?.value || "").trim();
  const result = window.MRAppState?.updateArtworkTags?.(detail.id, value);
  if (result?.ok) {
    activeHistoryDetailId = detail.id;
    closeArtworkTagsDialog();
    renderHistoryPanel(currentIndex);
    renderReviewPanel(currentIndex);
    showNotice(result.message);
    return;
  }
  setHistoryEditFeedback(els.artworkTagsFeedback, result?.message || "作品标签更新失败。", "danger");
}

function clearHistoryTrash() {
  const trash = window.MRAppState?.getHistoryTrash?.();
  if (!trash?.total) {
    showNotice("回收站已经是空的。");
    return;
  }
  if (!window.confirm(`确定清空回收站中的 ${trash.recordCount} 条学习档案吗？清空后将不能恢复。`)) {
    return;
  }

  const result = window.MRAppState?.clearHistoryTrash?.();
  refreshAfterHistoryMutation();
  showNotice(result?.message || "已清空回收站。");
}

function refreshAfterHistoryMutation() {
  renderLearningStateSummary();
  renderReviewPanel(currentIndex);
  renderReportPanel(currentIndex);
  renderHistoryPanel(currentIndex);
  updatePathPanel(currentIndex);
  updateSceneText(currentIndex);
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

  if (detail.type === "artwork" && detail.tags?.length) {
    const tags = document.createElement("div");
    tags.className = "history-detail-tags";
    detail.tags.slice(0, 8).forEach((tag) => {
      const item = document.createElement("span");
      item.textContent = tag;
      tags.appendChild(item);
    });
    els.historyDetailBody.appendChild(tags);
  }

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
  if (els.historyDetailOpenReport) els.historyDetailOpenReport.disabled = !hasReport;
  if (els.historyDetailCopyLink) els.historyDetailCopyLink.disabled = !hasDetail;
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

  activeHistoryRenameId = detail.id;
  if (els.historyRenameTitleInput) {
    els.historyRenameTitleInput.value = detail.title || "";
  }
  setHistoryEditFeedback(els.historyRenameFeedback, "");
  if (els.historyRenameDialog?.showModal) {
    els.historyRenameDialog.showModal();
  } else if (els.historyRenameDialog) {
    els.historyRenameDialog.hidden = false;
    els.historyRenameDialog.setAttribute("open", "");
  }
  els.historyRenameTitleInput?.focus();
  els.historyRenameTitleInput?.select();
}

function closeHistoryRenameDialog() {
  activeHistoryRenameId = null;
  setHistoryEditFeedback(els.historyRenameFeedback, "");
  if (els.historyRenameDialog?.close) {
    els.historyRenameDialog.close();
  } else if (els.historyRenameDialog) {
    els.historyRenameDialog.removeAttribute("open");
    els.historyRenameDialog.hidden = true;
  }
}

function submitHistoryRenameForm(event) {
  event.preventDefault();
  const detail = activeHistoryRenameId
    ? window.MRAppState?.getHistoryDetail?.(activeHistoryRenameId)
    : null;
  if (!detail) {
    setHistoryEditFeedback(els.historyRenameFeedback, "未找到这条学习档案。", "danger");
    return;
  }

  const title = String(els.historyRenameTitleInput?.value || "").trim();
  if (title.length < 2) {
    setHistoryEditFeedback(els.historyRenameFeedback, "标题至少需要 2 个字符。", "danger");
    els.historyRenameTitleInput?.focus();
    return;
  }

  const result = window.MRAppState?.renameHistoryRecord?.(detail.id, title);
  if (result?.ok) {
    activeHistoryDetailId = result.detail?.id || detail.id;
    closeHistoryRenameDialog();
    renderHistoryPanel(currentIndex);
    renderReviewPanel(currentIndex);
    showNotice(result.message);
    return;
  }
  setHistoryEditFeedback(els.historyRenameFeedback, result?.message || "重命名失败。", "danger");
}

function setHistoryEditFeedback(target, message, tone = "idle") {
  if (!target) return;
  target.textContent = message;
  target.dataset.feedbackTone = tone;
  target.hidden = !message;
}

function deleteHistoryDetail() {
  const detail = getActiveHistoryDetail();
  if (!detail) {
    showNotice("请选择一条记录。");
    return;
  }

  const confirmed = window.confirm(`确定将“${detail.title}”移入回收站吗？之后可恢复最近删除。`);
  if (!confirmed) {
    return;
  }

  const result = window.MRAppState?.deleteHistoryRecord?.(detail.id);
  if (result?.ok) {
    selectedHistoryIds.delete(detail.id);
    if (activeReportDetailId === detail.id) {
      activeReportDetailId = null;
      clearReportDetailRoute();
    }
    activeHistoryDetailId = null;
    clearHistoryDetailRoute();
    clearArtworkDetailRoute();
    refreshAfterHistoryMutation();
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

function formatPlanInputDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function focusModelView(options = {}) {
  cubeYaw = 0;
  cubePitch = 2;
  cubeScale = 0.78;
  updateCubeTransform();
  document.body.classList.add("is-model-view");
  if (options.updateRoute !== false) {
    setModelViewRoute(true);
  }
  window.clearTimeout(focusModelView.hideTimer);
  focusModelView.hideTimer = window.setTimeout(() => {
    clearModelView();
  }, 60000);
  showNotice("模型展示模式：已临时淡出教学面板，前方可查看木墙、门窗、书架、桌椅、盆栽、灯具和书法装饰。");
}

function clearModelView(options = {}) {
  window.clearTimeout(focusModelView.hideTimer);
  document.body.classList.remove("is-model-view");
  if (options.updateRoute !== false) {
    setModelViewRoute(false);
  }
}

function buildPathList() {
  const fragment = document.createDocumentFragment();

  SCENES.forEach((_, index) => {
    const sceneView = getLearningSceneView(index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "path-item";
    button.dataset.featureState = "real-local";
    button.setAttribute("aria-label", `跳转到步骤 ${index + 1}: ${sceneView.title}`);
    button.innerHTML = `
      <span class="path-item-index">${index + 1}</span>
      <span class="path-item-name">${sceneView.shortName}</span>
      <span class="path-item-state">待学习</span>
    `;
    button.addEventListener("click", () => loadScene(index));
    fragment.appendChild(button);
  });

  els.pathList.appendChild(fragment);
}

function loadScene(index, options = {}) {
  if (index < 0 || index >= SCENES.length) {
    return;
  }

  currentIndex = index;
  const pointIndex = clampScenePointIndex(index, Number.isInteger(options.pointIndex) ? options.pointIndex : 0);
  activePointIndex = pointIndex;
  if (index !== 6 && getHistoryDetailRouteId()) {
    activeHistoryDetailId = null;
    clearHistoryDetailRoute();
  }
  if (index !== 6 && getArtworkDetailRouteId()) {
    activeHistoryDetailId = null;
    clearArtworkDetailRoute();
  }
  if (index !== REPORT_DETAIL_SCENE_INDEX && getReportDetailRouteId()) {
    activeReportDetailId = null;
    clearReportDetailRoute();
  }
  if (options.updateStepRoute !== false) {
    setLearningStepRoute(index, { routeMode: options.routeMode, pointIndex });
  }

  updateSceneText(index);
  updateStepNavigation(index);
  updateInteractionPanel(index, pointIndex);
  renderLecturePanel(index);
  renderReviewPanel(index);
  renderReportPanel(index);
  renderHistoryPanel(index);
  renderPlanPanel(index);
  hideError();
  hideNotice();
}

function selectPoint(pointIndex, options = {}) {
  const nextPointIndex = clampScenePointIndex(currentIndex, pointIndex);
  activePointIndex = nextPointIndex;
  updateInteractionPanel(currentIndex, nextPointIndex);
  if (options.updateRoute !== false) {
    setLearningStepRoute(currentIndex, { routeMode: options.routeMode, pointIndex: nextPointIndex });
  }
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

function formatAverageScore(stats) {
  return stats?.scoreCount ? `${stats.averageScore}分` : "未评分";
}

function formatScoreMetric(value, stats = null) {
  if (Number.isFinite(value) && value > 0) {
    return String(value);
  }
  return stats?.scoreCount ? "0" : "未评分";
}

function getMetricInsightValue(value) {
  const text = String(value ?? "");
  const number = text.match(/\d+/)?.[0];
  return number || "—";
}

function getPracticeScoreSource(stats, latestSession, latestArtwork, livePractice, hasLivePractice) {
  if (hasLivePractice) {
    return {
      score: livePractice.score,
      metrics: livePractice.metrics || {},
      hasScore: true
    };
  }

  if (latestSession && (latestSession.strokeCount > 0 || latestSession.status === "saved" || latestSession.endedAt)) {
    return {
      score: latestSession.score,
      metrics: latestSession.metrics || {},
      hasScore: Number.isFinite(latestSession.score) && latestSession.score > 0
    };
  }

  if (latestArtwork) {
    return {
      score: latestArtwork.score,
      metrics: latestSession?.metrics || {},
      hasScore: Number.isFinite(latestArtwork.score) && latestArtwork.score > 0
    };
  }

  return {
    score: stats?.averageScore || 0,
    metrics: {},
    hasScore: Boolean(stats?.scoreCount)
  };
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
  const scoreSource = getPracticeScoreSource(stats, latestSession, latestArtwork, livePractice, hasLivePractice);
  const metrics = scoreSource.metrics;
  const score = scoreSource.score;
  const averageScoreLabel = formatAverageScore(stats);
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
        ["综合评分", averageScoreLabel],
        ["当前模式", stats.modeLabel],
        ["当前任务", stats.taskTitle],
        ["练习次数", `${stats.sessionCount}次`],
        ["作品", `${stats.artworkCount}幅`]
      ];
    case 1:
      return [
        ["任务进度", `${stats.taskProgress?.percent || 0}%`],
        ["任务级别", stats.taskLevel],
        ["当前字", stats.glyph],
        ["碑帖", stats.copybook],
        ["练习重点", stats.taskFocus]
      ];
    case 2:
      return [
        ["讲解状态", lectureLabel],
        ["讲解进度", `${lectureProgress?.progressPercent || 0}%`],
        ["当前段落", lectureProgress?.currentStep?.title || "待开始"],
        ["字帖", stats.copybook],
        ["任务", stats.taskTitle]
      ];
    case 3:
      return [
        ["综合评分", scoreSource.hasScore ? `${score}分` : "未评分"],
        ["结构", formatScoreMetric(metrics.structure, stats)],
        ["笔画", formatScoreMetric(metrics.stroke, stats)],
        ["笔法", formatScoreMetric(metrics.technique, stats)],
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
        ["综合评分", latestArtwork?.score ? `${latestArtwork.score}分` : scoreSource.hasScore ? `${score}分` : "未评分"]
      ];
    case 6:
      return [
        ["学习时长", `${stats.learningMinutes}分钟`],
        ["真实练习", `${stats.practicedSessionCount || 0}/${stats.sessionCount}次`],
        ["保存作品", `${stats.artworkCount}幅`],
        ["报告数量", `${stats.reportCount}份`],
        ["平均评分", averageScoreLabel]
      ];
    case 7:
      return [
        ["作品", latestArtwork?.title || "暂无作品"],
        ["复盘会话", `${stats.savedSessionCount}次`],
        ["最近风格", latestArtwork?.style || "未保存"],
        ["平均评分", averageScoreLabel],
        ["作品数", `${stats.artworkCount}幅`]
      ];
    case 8:
      return [
        ["真实练习", `${stats.practicedSessionCount || 0}次`],
        ["练习字数", `${stats.practicedGlyphCount || 0}字`],
        ["保存作品", `${stats.artworkCount}幅`],
        ["报告导出", latestReport ? "已导出" : "未导出"],
        ["平均评分", averageScoreLabel]
      ];
    case 9:
      return [
        ["复习单字", `${stats.practicedGlyphCount || 0}个`],
        ["结构学习", `${stats.savedSessionCount}次`],
        ["作品创作", `${stats.artworkCount}幅`],
        ["实践练习", `${stats.practicedSessionCount || 0}次`],
        ["计划完成", planProgress ? `${planProgress.percent}%` : "未制定"]
      ];
    default:
      return scene.metrics;
  }
}

function getLearningPathStatus() {
  return window.MRAppState?.getLearningPathStatus?.() || null;
}

function getLearningSceneView(index) {
  const scene = SCENES[index] || SCENES[0];
  const step = getLearningPathStatus()?.steps?.[index];
  if (!step) {
    return {
      title: scene.title,
      shortName: getShortSceneName(scene.title),
      description: scene.description,
      focus: scene.focus,
      actionHint: null,
      evidence: []
    };
  }

  return {
    title: step.title || scene.title,
    shortName: step.shortName || getShortSceneName(step.title || scene.title),
    description: step.description || scene.description,
    focus: step.focus || scene.focus,
    actionHint: step.actionHint || null,
    statusLabel: step.statusLabel,
    evidence: step.evidence || [],
    step
  };
}

function renderLearningPathServiceSummary(pathStatus = getLearningPathStatus()) {
  if (!els.learningPathServiceSummary) return;
  if (!pathStatus) {
    els.learningPathServiceSummary.textContent = "学习路径服务尚未初始化。";
    els.learningPathServiceSummary.dataset.serviceTone = "active";
    return;
  }

  const next = pathStatus.nextStep?.shortName || "继续学习";
  els.learningPathServiceSummary.textContent = `${pathStatus.doneCount}/${pathStatus.total} 步完成，下一步：${next}。数据来自本机任务、练习、作品、报告和计划。`;
  els.learningPathServiceSummary.dataset.serviceTone = pathStatus.doneCount >= pathStatus.total ? "done" : "active";
}

function updateSceneText(index) {
  const sceneView = getLearningSceneView(index);
  const metrics = getLearningSceneMetrics(index);
  els.stepLabel.textContent = `步骤 ${String(index + 1).padStart(2, "0")}`;
  els.sceneTitle.textContent = sceneView.title;
  els.sceneDescription.textContent = sceneView.description;
  els.coachScore.textContent = metrics[0][1];
  els.insightScore.textContent = getMetricInsightValue(metrics[0][1]);
  renderLearningPathServiceSummary();
  renderScoreServiceSummary();
}

function renderScoreServiceSummary() {
  if (!els.scoreServiceSummary) return;
  const status = window.MRAppState?.getScoreServiceStatus?.();
  if (!status) {
    els.scoreServiceSummary.textContent = "基础评分服务尚未初始化。";
    els.scoreServiceSummary.dataset.serviceTone = "idle";
    return;
  }

  els.scoreServiceSummary.textContent = `${status.message} ${status.boundary}`;
  els.scoreServiceSummary.dataset.serviceTone = status.status === "scored" || status.status === "ready"
    ? "ready"
    : status.status === "no-data"
      ? "warning"
      : status.status === "error"
        ? "danger"
        : "idle";
}

function updateInteractionPanel(sceneIndex, pointIndex) {
  const scene = SCENES[sceneIndex];
  const sceneView = getLearningSceneView(sceneIndex);
  const point = scene.points[pointIndex];
  const pointView = getLearningPointView(sceneIndex, pointIndex, point);
  const metrics = getLearningSceneMetrics(sceneIndex);

  els.sceneFocus.textContent = sceneView.focus;
  els.contentTitle.textContent = pointView.label;
  els.contentBody.textContent = pointView.body;
  els.contentTags.innerHTML = "";
  els.metricGrid.innerHTML = "";
  els.pointList.innerHTML = "";
  els.actionList.innerHTML = "";
  els.actionFeedback.textContent = getLearningActionHint(sceneIndex);
  renderActionDetail(null);

  pointView.tags.forEach((tag) => {
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
    button.dataset.featureState = "real-local";
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
    button.dataset.featureLabel = getFeatureStateLabel(feature.state);
    button.title = feature.reason || getFeatureStateLabel(feature.state);
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

function getLearningPathPointView(sceneIndex, pointIndex, point, stats) {
  const sceneView = getLearningSceneView(sceneIndex);
  const step = sceneView.step;
  if (!step) return point;

  const evidence = sceneView.evidence?.length ? sceneView.evidence : ["暂无本机证据"];
  const averageScore = formatAverageScore(stats);
  const bodies = [
    sceneView.description,
    sceneView.focus,
    `${step.statusLabel || "待完成"}。${step.actionHint || `下一步：${step.nextActionLabel || "继续学习"}。`}`
  ];
  const tags = [
    step.statusLabel || "路径状态",
    stats.glyph,
    evidence[pointIndex] || evidence[0],
    averageScore
  ].filter(Boolean).slice(0, 4);

  return {
    ...point,
    body: bodies[pointIndex] || sceneView.description,
    tags
  };
}

function mergeLearningPathStatusIntoPoint(sceneIndex, pointIndex, pointView) {
  const step = getLearningPathStatus()?.steps?.[sceneIndex];
  if (!step) return pointView;

  const evidence = Array.isArray(step.evidence) ? step.evidence.filter(Boolean) : [];
  const evidenceText = evidence[pointIndex] || evidence[0] || "";
  const statusText = step.statusLabel || "路径状态";
  const actionText = step.actionHint || (step.nextActionLabel ? `下一步：${step.nextActionLabel}` : "");
  const pathBody = [
    `路径状态：${statusText}。`,
    actionText,
    evidenceText ? `本机证据：${evidenceText}。` : ""
  ].filter(Boolean).join(" ");
  const tags = [
    ...(Array.isArray(pointView.tags) ? pointView.tags : []),
    statusText,
    evidenceText
  ].filter(Boolean).slice(0, 4);

  return {
    ...pointView,
    body: `${pointView.body || ""} ${pathBody}`.trim(),
    tags
  };
}

function getLearningPointView(sceneIndex, pointIndex, point) {
  const stats = window.MRAppState?.getStats?.();
  if (!stats) {
    return point;
  }

  const latestTime = stats.latestRecordAt ? formatHistoryTime(stats.latestRecordAt) : "暂无记录";
  const averageScore = formatAverageScore(stats);
  const latestArtworkTitle = stats.latestArtwork?.title || "暂无作品";
  const latestReportLabel = stats.latestReport ? formatHistoryTime(stats.latestReport.createdAt) : "尚未导出";
  const planProgress = stats.latestPlan?.progress;
  const planLabel = planProgress ? `${planProgress.done}/${planProgress.total}` : "未制定";

  if (sceneIndex >= 0 && sceneIndex <= 5) {
    return getLearningPathPointView(sceneIndex, pointIndex, point, stats);
  }

  if (sceneIndex === 6) {
    const views = [
      {
        body: `本机档案当前有 ${stats.sessionCount} 次练习会话、${stats.practicedSessionCount || 0} 次真实笔迹练习、${stats.artworkCount} 幅作品和 ${stats.reportCount} 份报告。`,
        tags: ["本机档案", `${stats.recordCount}条记录`, latestTime]
      },
      {
        body: stats.scoreCount
          ? `最近分数和按日趋势来自 ${stats.scoreCount} 条真实评分记录，当前平均 ${stats.averageScore} 分。`
          : "还没有真实评分记录。完成书写并保存作品后，这里会显示最近分数和按日趋势。",
        tags: ["趋势", averageScore, `${stats.scoreCount}条评分`]
      },
      {
        body: stats.recordCount
          ? `最近记录会优先展示本机练习、作品和报告；当前最近更新时间为 ${latestTime}。`
          : "暂无最近记录。开始临摹、保存作品或导出报告后，这里会出现可复盘条目。",
        tags: ["记录", `${stats.practicedGlyphCount || 0}字`, "复盘入口"]
      }
    ];
    return mergeLearningPathStatusIntoPoint(sceneIndex, pointIndex, { ...point, ...views[pointIndex] });
  }

  if (sceneIndex === 7) {
    const views = [
      {
        body: stats.latestSession
          ? `最近练习包含 ${stats.latestSession.strokeCount || 0} 笔、${stats.latestSession.pointCount || 0} 个采样点，可用于回放和复盘。`
          : "还没有可复盘练习。请先在练习格中书写并保存作品。",
        tags: ["八法复盘", `${stats.practicedSessionCount || 0}次练习`, "改进点"]
      },
      {
        body: stats.scoreCount
          ? `成长轨迹基于本机真实评分计算，当前平均 ${stats.averageScore} 分，最近记录 ${latestTime}。`
          : "成长轨迹等待真实评分。保存作品后会开始形成可见趋势。",
        tags: ["曲线", averageScore, "趋势"]
      },
      {
        body: stats.artworkCount
          ? `当前最近作品是“${latestArtworkTitle}”，可下载图片、回放笔迹或继续导出报告。`
          : "当前没有作品可分享。保存作品后，这里才会提供成果预览和导出入口。",
        tags: ["分享", `${stats.artworkCount}幅作品`, "成果"]
      }
    ];
    return mergeLearningPathStatusIntoPoint(sceneIndex, pointIndex, { ...point, ...views[pointIndex] });
  }

  if (sceneIndex === 8) {
    const views = [
      {
        body: `报告数据来自本机：${stats.practicedSessionCount || 0} 次真实练习、${stats.artworkCount} 幅作品、${stats.reportCount} 份报告，最近报告 ${latestReportLabel}。`,
        tags: ["投入", `${stats.learningMinutes}分钟`, `${stats.practicedGlyphCount || 0}字`]
      },
      {
        body: stats.scoreCount
          ? `能力结构会根据真实练习评分生成，当前平均 ${stats.averageScore} 分；后续还需补维度级长期曲线。`
          : "能力雷达等待真实练习评分。没有笔迹评分时不会显示静态高分。",
        tags: ["雷达图", "能力维度", averageScore]
      },
      {
        body: stats.scoreCount
          ? `当前综合评分来自本机 ${stats.scoreCount} 条评分记录，建议围绕最低维度继续制定计划。`
          : "当前还没有综合评分。完成一次真实书写后再生成报告会更有意义。",
        tags: [averageScore, planLabel, "建议"]
      }
    ];
    return mergeLearningPathStatusIntoPoint(sceneIndex, pointIndex, { ...point, ...views[pointIndex] });
  }

  if (sceneIndex === 9) {
    const views = [
      {
        body: `本轮回顾基于 ${stats.practicedGlyphCount || 0} 个练习字、${stats.savedSessionCount} 次已保存会话、${stats.artworkCount} 幅作品和 ${stats.learningMinutes} 分钟本机学习时长。`,
        tags: ["回顾", `${stats.recordCount}条记录`, "复习"]
      },
      {
        body: stats.latestArtwork
          ? `中心可对比最近作品“${latestArtworkTitle}”和当前练习状态，也可从作品集复制直达链接继续复盘。`
          : "暂无作品可做前后对比。保存作品后，这里会显示真实成果变化。",
        tags: ["前后对比", latestArtworkTitle, "保持"]
      },
      {
        body: stats.scoreCount
          ? `总结评分来自本机记录，当前平均 ${stats.averageScore} 分；计划完成度为 ${planLabel}。`
          : `总结页等待真实评分；当前计划完成度为 ${planLabel}。`,
        tags: [averageScore, planLabel, "总结"]
      }
    ];
    return mergeLearningPathStatusIntoPoint(sceneIndex, pointIndex, { ...point, ...views[pointIndex] });
  }

  return point;
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
  els.actionFeedback.textContent = result.message || (action.label ? "操作已处理，但没有返回详细结果。" : "");
  renderActionDetail(result.detail || null);
  if (result.plan?.id) {
    activePlanId = result.plan.id;
  }
  if (result.report?.id) {
    activeReportDetailId = result.report.id;
    setReportDetailRoute(result.report.id);
  }
  if (result.openArtworkId) {
    openArtworkDetailRoute(result.openArtworkId);
    return;
  }
  renderLearningStateSummary();
  renderTaskPanel();
  renderLecturePanel(currentIndex);
  renderReviewPanel(currentIndex);
  renderReportPanel(currentIndex);
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
  renderTaskPanel();
  renderLecturePanel(currentIndex);
  renderReviewPanel(currentIndex);
  renderReportPanel(currentIndex);
  renderHistoryPanel(currentIndex);
  renderPlanPanel(currentIndex);
}

function renderActionDetail(detail) {
  if (!els.actionDetail) {
    return;
  }

  els.actionDetail.innerHTML = "";
  if (!detail) {
    els.actionDetail.hidden = true;
    els.actionDetail.removeAttribute("data-detail-type");
    return;
  }

  els.actionDetail.hidden = false;
  els.actionDetail.dataset.detailType = detail.type || "info";

  const head = document.createElement("div");
  head.className = "action-detail-head";
  const titleWrap = document.createElement("div");
  const eyebrow = document.createElement("span");
  eyebrow.textContent = detail.eyebrow || "真实详情";
  const title = document.createElement("strong");
  title.textContent = detail.title || "操作详情";
  titleWrap.append(eyebrow, title);
  head.appendChild(titleWrap);

  if (detail.status) {
    const status = document.createElement("em");
    status.textContent = detail.status;
    head.appendChild(status);
  }
  els.actionDetail.appendChild(head);

  if (detail.summary) {
    const summary = document.createElement("p");
    summary.className = "action-detail-summary";
    summary.textContent = detail.summary;
    els.actionDetail.appendChild(summary);
  }

  if (Array.isArray(detail.metrics) && detail.metrics.length) {
    const metrics = document.createElement("div");
    metrics.className = "action-detail-metrics";
    detail.metrics.forEach((metric) => {
      const item = document.createElement("div");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      label.textContent = metric.label;
      value.textContent = metric.value;
      item.append(label, value);
      metrics.appendChild(item);
    });
    els.actionDetail.appendChild(metrics);
  }

  if (Array.isArray(detail.badges) && detail.badges.length) {
    const badges = document.createElement("div");
    badges.className = "achievement-grid";
    detail.badges.forEach((badge) => {
      const item = document.createElement("div");
      item.className = "achievement-badge";
      item.classList.toggle("is-done", Boolean(badge.done));
      const label = document.createElement("strong");
      const state = document.createElement("span");
      const meta = document.createElement("small");
      label.textContent = badge.label;
      state.textContent = badge.done ? "已达成" : "未达成";
      meta.textContent = badge.detail;
      item.append(label, state, meta);
      badges.appendChild(item);
    });
    els.actionDetail.appendChild(badges);
  }

  if (Array.isArray(detail.items) && detail.items.length) {
    const list = document.createElement("ul");
    list.className = "action-detail-list";
    detail.items.slice(0, 6).forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.appendChild(item);
    });
    els.actionDetail.appendChild(list);
  }
}

function getMetricValue(metrics, key) {
  const value = Number(metrics?.[key]);
  return Number.isFinite(value) && value > 0 ? `${Math.round(value)}分` : "未评分";
}

function getLatestAnalyzablePractice(stats) {
  const latestSession = stats?.latestSession;
  const latestArtwork = stats?.latestArtwork;

  if (latestSession && ((latestSession.strokeCount || 0) > 0 || latestSession.feedback?.length)) {
    return {
      source: "最近练习",
      glyph: latestSession.glyph || stats.glyph,
      score: latestSession.score || 0,
      metrics: latestSession.metrics || {},
      strokeCount: latestSession.strokeCount || 0,
      pointCount: latestSession.pointCount || 0,
      scoreEvidence: latestSession.scoreEvidence || null,
      feedback: latestSession.feedback || [],
      createdAt: latestSession.snapshotAt || latestSession.endedAt || latestSession.startedAt
    };
  }

  if (latestArtwork && ((latestArtwork.strokeCount || 0) > 0 || latestArtwork.feedback?.length)) {
    return {
      source: "最近作品",
      glyph: latestArtwork.glyph || stats.glyph,
      score: latestArtwork.score || 0,
      metrics: latestSession?.metrics || {},
      strokeCount: latestArtwork.strokeCount || 0,
      pointCount: latestArtwork.pointCount || 0,
      scoreEvidence: latestArtwork.scoreEvidence || latestSession?.scoreEvidence || null,
      feedback: latestArtwork.feedback?.length ? latestArtwork.feedback : latestSession?.feedback || [],
      createdAt: latestArtwork.createdAt
    };
  }

  return null;
}

function buildPracticeAnalysisDetail(recorded = null) {
  const stats = window.MRAppState?.getStats?.();
  const practice = recorded?.practice
    ? {
        source: "当前练习格",
        glyph: stats?.glyph || "当前字",
        score: recorded.practice.score || 0,
        metrics: recorded.practice.metrics || {},
        strokeCount: recorded.practice.strokeCount || 0,
        pointCount: recorded.practice.pointCount || 0,
        scoreEvidence: recorded.practice.scoreEvidence || null,
        feedback: recorded.practice.feedback || [],
        createdAt: new Date().toISOString()
      }
    : getLatestAnalyzablePractice(stats);

  if (!practice) {
    return {
      type: "analysis",
      eyebrow: "笔画分析",
      title: "暂无真实笔迹",
      status: "空状态",
      summary: `当前任务是“${stats?.taskTitle || "书法练习"}”。请先在练习格中书写，再查看结构、笔画、笔法、流畅度和力度分析。`,
      metrics: [
        { label: "真实练习", value: `${stats?.practicedSessionCount || 0}次` },
        { label: "评分记录", value: `${stats?.scoreCount || 0}条` },
        { label: "当前字", value: stats?.glyph || "未选择" }
      ],
      items: ["没有真实笔迹时不会返回静态分析。", "完成一笔以上书写后，点击“查看笔画分析”会写入本机练习会话。"]
    };
  }

  const feedback = practice.feedback?.length
    ? practice.feedback
    : ["暂无自动建议，请保存更多笔迹后继续复盘。"];
  const scoreEvidence = practice.scoreEvidence || null;
  const evidenceMetrics = getScoreEvidenceMetrics(scoreEvidence);
  const evidenceItems = getScoreEvidenceItems(scoreEvidence);

  return {
    type: "analysis",
    eyebrow: "基础练习评分",
    title: `${practice.glyph || stats?.glyph || "当前字"}字真实笔迹分析`,
    status: practice.source,
    summary: `${practice.source}包含 ${practice.strokeCount} 笔、${practice.pointCount} 个采样点，综合评分 ${practice.score || "未评分"}。该评分来自浏览器本机基础练习算法。`,
    metrics: [
      { label: "综合", value: practice.score ? `${practice.score}分` : "未评分" },
      { label: "结构", value: getMetricValue(practice.metrics, "structure") },
      { label: "笔画", value: getMetricValue(practice.metrics, "stroke") },
      { label: "笔法", value: getMetricValue(practice.metrics, "technique") },
      { label: "流畅", value: getMetricValue(practice.metrics, "fluency") },
      { label: "力度", value: getMetricValue(practice.metrics, "force") },
      ...evidenceMetrics
    ],
    items: [...evidenceItems, ...feedback]
  };
}

function getScoreEvidenceMetrics(scoreEvidence) {
  if (!scoreEvidence?.evidence) {
    return [];
  }
  const evidence = scoreEvidence.evidence;
  return [
    { label: "评分类型", value: scoreEvidence.label || "基础练习评分" },
    { label: "算法版本", value: scoreEvidence.algorithmVersion || scoreEvidence.kind || "local-heuristic-v2.2.0" },
    { label: "范字来源", value: scoreEvidence.copybook || evidence.copybook || "通用范字" },
    { label: "目标笔画", value: `${evidence.targetStrokeCount || 0}笔` },
    { label: "笔顺匹配", value: `${evidence.strokeOrderMatchPercent || 0}%` },
    { label: "笔顺覆盖", value: `${evidence.strokeOrderCoveragePercent || 0}%` },
    { label: "形态匹配", value: `${evidence.strokeShapeMatchPercent || 0}%` },
    { label: "路径贴合", value: `${evidence.pathFitPercent || 0}%` },
    { label: "路径误差", value: `${evidence.pathErrorPercent || 0}%` },
    { label: "覆盖范围", value: `${evidence.coveragePercent || 0}%` },
    { label: "重心偏移", value: `${evidence.centerOffsetPercent || 0}%` },
    { label: "长停顿", value: `${evidence.longBreaks || 0}次` },
    { label: "压感采样", value: `${evidence.pressurePointCount || 0}点` },
    { label: "压感跨度", value: `${evidence.pressureSpreadPercent || 0}%` }
  ];
}

function getScoreEvidenceItems(scoreEvidence) {
  if (!scoreEvidence) {
    return ["本记录缺少早期评分证据，后续新书写会保存完整评分依据。"];
  }
  const evidence = scoreEvidence.evidence || {};
  const targetStrokeNames = Array.isArray(evidence.targetStrokeNames)
    ? evidence.targetStrokeNames
    : Array.isArray(scoreEvidence.targetStrokeNames)
      ? scoreEvidence.targetStrokeNames
      : [];
  const strokeOrderText = targetStrokeNames.length
    ? `范字笔顺：${targetStrokeNames.join("、")}。`
    : "";
  const strokeMatchText = Array.isArray(evidence.strokeMatches) && evidence.strokeMatches.length
    ? `逐笔轨迹：${evidence.strokeMatches.slice(0, 6).map((item) => `第${item.index}笔${item.status === "match" ? "匹配" : item.status === "possible-misorder" ? "疑似错序" : item.status === "extra" ? "超出目标" : "需复核"}${item.expected ? `“${item.expected}”` : ""}，${item.matchScore || 0}分`).join("；")}。`
    : "";
  const strokeWarningText = Array.isArray(evidence.strokeOrderWarnings) && evidence.strokeOrderWarnings.length
    ? `笔顺提醒：${evidence.strokeOrderWarnings.join("；")}。`
    : "";
  const pathErrorText = Array.isArray(evidence.strokePathErrors) && evidence.strokePathErrors.length
    ? `路径误差：${evidence.strokePathErrors.slice(0, 5).map((item) => `第${item.index}笔${item.expected || ""}贴合${item.fitPercent || 0}%`).join("；")}。`
    : "";
  const pathHotspotText = Array.isArray(evidence.pathErrorHotspots) && evidence.pathErrorHotspots.length
    ? `误差热力：${evidence.pathErrorHotspots.map((item) => `${item.label || item.zone}${item.errorPercent || 0}%`).join("；")}。`
    : "";
  const pressureText = evidence.pressurePointCount
    ? `压感证据：${evidence.pressurePointCount} 个采样点，平均约 ${evidence.pressureAveragePercent || 0}%，范围 ${evidence.pressureMinPercent || 0}% - ${evidence.pressureMaxPercent || 0}%。`
    : "";
  const reasons = Array.isArray(scoreEvidence.reasons)
    ? scoreEvidence.reasons.map((reason) => `${reason.label} ${reason.score}分：${reason.evidence}`)
    : [];
  return [
    scoreEvidence.disclaimer || "本评分为浏览器本机基础练习评分，不等同于专业评级。",
    scoreEvidence.algorithmVersion || scoreEvidence.kind ? `算法版本：${scoreEvidence.algorithmVersion || scoreEvidence.kind}。` : "",
    scoreEvidence.copybook || evidence.copybook ? `范字来源：${scoreEvidence.copybook || evidence.copybook}。` : "",
    strokeOrderText,
    evidence.strokeOrderVerdict ? `笔顺判定：${getStrokeOrderVerdictLabel(evidence.strokeOrderVerdict)}。` : "",
    strokeMatchText,
    strokeWarningText,
    pathErrorText,
    pathHotspotText,
    pressureText,
    ...reasons
  ].filter(Boolean);
}

function getStrokeOrderVerdictLabel(verdict) {
  return {
    aligned: "当前书写顺序与本机范字参考基本一致",
    partial: "当前只覆盖部分目标笔画",
    "needs-shape-review": "存在形态偏弱的笔画",
    "needs-order-review": "存在疑似错序笔画"
  }[verdict] || "需要继续复核";
}

function buildAchievementDetail() {
  const stats = window.MRAppState?.getStats?.();
  const taskProgress = stats?.taskProgress || {};
  const planProgress = stats?.latestPlan?.progress || null;
  const averageDone = Boolean(stats?.scoreCount && stats.averageScore >= 80);
  const excellentDone = Boolean(stats?.scoreCount && stats.averageScore >= 90);
  const badges = [
    {
      label: "完成真实练习",
      done: (stats?.practicedSessionCount || 0) > 0,
      detail: `${stats?.practicedSessionCount || 0} 次有笔迹练习`
    },
    {
      label: "保存作品",
      done: (stats?.artworkCount || 0) > 0,
      detail: `${stats?.artworkCount || 0} 幅本机作品`
    },
    {
      label: "导出报告",
      done: (stats?.reportCount || 0) > 0,
      detail: `${stats?.reportCount || 0} 份 HTML 报告`
    },
    {
      label: "基础达标",
      done: averageDone,
      detail: stats?.scoreCount ? `平均 ${stats.averageScore} 分` : "暂无评分"
    },
    {
      label: "优秀稳定",
      done: excellentDone,
      detail: stats?.scoreCount ? `平均 ${stats.averageScore} 分` : "暂无评分"
    },
    {
      label: "制定计划",
      done: Boolean(planProgress?.total),
      detail: planProgress ? `${planProgress.done}/${planProgress.total} 项完成` : "暂无计划"
    }
  ];
  const doneCount = badges.filter((badge) => badge.done).length;
  const nextBadge = badges.find((badge) => !badge.done);

  return {
    type: "achievements",
    eyebrow: "本机成就",
    title: `${stats?.taskTitle || "当前任务"}成就进度`,
    status: `${doneCount}/${badges.length}`,
    summary: doneCount
      ? `成就只根据本机真实记录计算：${stats.practicedSessionCount || 0} 次真实练习、${stats.artworkCount || 0} 幅作品、${stats.reportCount || 0} 份报告。`
      : "当前还没有可达成成就的真实记录。先完成一次书写，成就会从本机状态中点亮。",
    metrics: [
      { label: "任务进度", value: `${taskProgress.percent || 0}%` },
      { label: "真实练习", value: `${stats?.practicedSessionCount || 0}次` },
      { label: "评分记录", value: `${stats?.scoreCount || 0}条` },
      { label: "平均评分", value: formatAverageScore(stats) }
    ],
    badges,
    items: [
      nextBadge ? `下一步：${nextBadge.label}。${nextBadge.detail}` : "当前本机成就已全部点亮，可继续提高平均分或补充更多任务。",
      "成就不会读取静态场景文案，也不会伪装成云端徽章。"
    ]
  };
}

function buildCompletionDetail() {
  const stats = window.MRAppState?.getStats?.();
  const pathStatus = window.MRAppState?.getLearningPathStatus?.();
  const taskProgress = stats?.taskProgress || pathStatus?.taskProgress || {};
  const steps = Array.isArray(pathStatus?.steps) ? pathStatus.steps : [];
  const doneCount = Number(pathStatus?.doneCount || steps.filter((step) => step.done).length || 0);
  const total = Number(pathStatus?.total || steps.length || 10);
  const nextStep = steps.find((step) => !step.done && !step.locked) || steps.find((step) => !step.done) || pathStatus?.nextStep || null;
  const latestArtwork = stats?.latestArtwork || null;
  const latestReport = stats?.latestReport || null;
  const latestPlan = stats?.latestPlan || null;
  const planProgress = latestPlan?.progress || null;
  const scoreLabel = formatAverageScore(stats);
  const stepBadges = steps.slice(0, 10).map((step) => ({
    label: step.shortName || step.title || "学习步骤",
    done: Boolean(step.done),
    detail: step.done
      ? step.doneLabel || "已完成"
      : step.locked
        ? step.lockedLabel || "未解锁"
        : step.activeLabel || step.pendingLabel || "待完成"
  }));
  const items = [
    latestArtwork
      ? `最近作品：${latestArtwork.title || "未命名作品"}，${latestArtwork.strokeCount || 0} 笔，评分 ${latestArtwork.score || "未评分"}。`
      : "尚未保存作品，保存真实笔迹后这里会显示最近作品。",
    latestReport
      ? `最近报告：${latestReport.title || "学习报告"}，平均 ${latestReport.averageScore || 0} 分，含 ${latestReport.artworkCount || 0} 幅作品。`
      : "尚未导出报告，完成作品后可生成本机 HTML/PDF 报告。",
    latestPlan
      ? `学习计划：${latestPlan.title || "未命名计划"}，进度 ${planProgress?.done || 0}/${planProgress?.total || 0}。`
      : "尚未制定计划，可根据本机评分生成下一轮练习计划。",
    nextStep
      ? `下一步：${nextStep.title || nextStep.shortName}。${nextStep.focus || nextStep.description || "继续补齐当前学习路径。"}`
      : "当前学习路径已完成，可选择新的日课字或继续巩固薄弱项。",
    "本详情只读取浏览器本机学习记录，不伪装成云端学情报告。"
  ];

  return {
    type: "completion",
    eyebrow: "学习总结",
    title: `${stats?.taskTitle || "当前任务"}真实学习详情`,
    status: `${doneCount}/${total}步`,
    summary: taskProgress.complete
      ? `当前任务已满足完成规则：${taskProgress.ruleSummary || "阶段、练习、作品和报告"}。`
      : `当前任务完成度 ${taskProgress.percent || 0}%，仍需继续完成本机练习、作品、报告或复习计划。`,
    metrics: [
      { label: "路径", value: `${doneCount}/${total}` },
      { label: "任务完成", value: taskProgress.complete ? "是" : "否" },
      { label: "真实练习", value: `${stats?.practicedSessionCount || 0}次` },
      { label: "作品", value: `${stats?.artworkCount || 0}幅` },
      { label: "报告", value: `${stats?.reportCount || 0}份` },
      { label: "平均评分", value: scoreLabel }
    ],
    badges: stepBadges,
    items
  };
}

function getLearningActionHint(sceneIndex) {
  if (!window.MRAppState) {
    return "点击场景热点或下方按钮，可查看该模块的交互反馈。";
  }

  const sceneView = getLearningSceneView(sceneIndex);
  if (sceneIndex === 6 || sceneIndex === 8 || sceneIndex === 9) {
    const preview = window.MRAppState.getReportPreview();
    return sceneView.actionHint ? `${sceneView.actionHint} ${preview}` : preview;
  }

  if (sceneView.actionHint) {
    return sceneView.actionHint;
  }

  return "点击按钮会写入本机学习记录；未接入的能力会明确禁用。";
}

function getLearningActionFeature(action) {
  const [state, reason] = LEARNING_ACTION_FEATURES[action.label] || [
    "disabled",
    "此操作尚未接入真实处理，避免返回虚假成功。"
  ];
  return { state, reason };
}

function runLearningAction(action) {
  const appState = window.MRAppState;
  if (!appState) {
    return { ok: false, message: "学习状态层尚未载入，已阻止虚假成功反馈。" };
  }

  switch (action.label) {
    case "查看笔画分析":
      {
        const recorded = recordLivePracticeIfAvailable({ allowCreate: true });
        if (recorded?.practice) {
          const detail = buildPracticeAnalysisDetail(recorded);
          return {
            message: `已记录当前笔迹：${recorded.practice.strokeCount} 笔、${recorded.practice.pointCount} 个采样点，评分 ${recorded.practice.score}。`,
            detail
          };
        }
        const detail = buildPracticeAnalysisDetail();
        const hasExisting = detail.status !== "空状态";
        return {
          message: hasExisting
            ? "已读取最近一次真实笔迹分析。"
            : `当前任务：${appState.getStats().glyph}字。请先在练习格中书写，再查看真实笔画分析。`,
          detail
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
      return appState.recordLearningStage("strokeBreakdown", {
        target: action.target,
        note: "已进入笔画拆解，当前任务状态和拆解阶段会保存到本机。"
      });
    case "复习巩固":
      return appState.recordLearningStage("review", {
        target: action.target,
        note: "已进入复习巩固，继续围绕当前任务补强薄弱笔画。"
      });
    case "进入创作":
      return appState.recordLearningStage("creation", {
        target: action.target,
        note: "已完成笔画拆解并进入创作实践，后续保存作品会继续关联本机任务。"
      });
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
      {
        const latestArtwork = appState.getStats().latestArtwork;
        return latestArtwork
          ? { message: `已打开最近保存的作品：${latestArtwork.title}。`, openArtworkId: latestArtwork.id }
          : { ok: false, message: "还没有保存作品，请先完成一次保存作品。" };
      }
    case "生成视频":
      return exportPracticeReplayVideo();
    case "导出分享页":
      return appState.downloadArtworkSharePage();
    case "制定计划":
      return appState.createPlan();
    case "查看成就":
      {
        const stats = appState.getStats();
        return {
          message: `当前成就来自本机记录：${stats.practicedSessionCount || 0} 次真实练习、${stats.artworkCount} 幅作品、${stats.reportCount} 份报告。`,
          detail: buildAchievementDetail()
        };
      }
    case "查看详情":
      {
        const detail = buildCompletionDetail();
        return {
          message: `已读取本机学习详情：${detail.status}，${appState.getReportPreview()}`,
          detail
        };
      }
    case "返回首页":
      return { message: "回到 MR 书法教练首页。", target: 0 };
    default:
      return { ok: false, message: "此操作尚未接入真实处理，已阻止虚假成功反馈。" };
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
  const pathItems = els.pathList.querySelectorAll(".path-item");
  const pathStatus = getLearningPathStatus();
  const stats = window.MRAppState?.getStats?.();
  const progress = pathStatus?.total
    ? pathStatus.progressPercent
    : Math.round(((index + 1) / SCENES.length) * 100);

  els.pathProgress.textContent = pathStatus?.total
    ? `${pathStatus.doneCount} / ${pathStatus.total}`
    : `${index + 1} / ${SCENES.length}`;
  els.pathProgressBar.style.width = `${progress}%`;
  renderLearningPathServiceSummary(pathStatus);

  pathItems.forEach((button, buttonIndex) => {
    const state = button.querySelector(".path-item-state");
    const name = button.querySelector(".path-item-name");
    const sceneView = getLearningSceneView(buttonIndex);
    const realState = getLearningPathState(buttonIndex, stats, pathStatus);
    const isDone = realState.done;
    const isActive = buttonIndex === index;

    button.classList.toggle("is-done", isDone);
    button.classList.toggle("is-active", isActive);
    button.classList.toggle("is-locked", Boolean(realState.locked));
    button.setAttribute("aria-current", isActive ? "step" : "false");
    button.setAttribute("aria-label", `跳转到步骤 ${buttonIndex + 1}: ${sceneView.title}`);

    if (name) {
      name.textContent = sceneView.shortName;
    }

    if (state) {
      state.textContent = isActive
        ? realState.activeLabel
        : isDone
          ? realState.doneLabel
          : realState.locked
            ? realState.lockedLabel || "未解锁"
            : realState.pendingLabel;
    }
  });
}

function getLearningPathState(index, stats, pathStatus = getLearningPathStatus()) {
  const step = pathStatus?.steps?.[index];
  if (step) {
    return {
      done: Boolean(step.done),
      locked: Boolean(step.locked),
      activeLabel: step.activeLabel || step.statusLabel || "进行中",
      doneLabel: step.doneLabel || "已完成",
      pendingLabel: step.pendingLabel || "待完成",
      lockedLabel: step.lockedLabel || "未解锁"
    };
  }

  if (!stats) {
    return { done: false, activeLabel: "进行中", doneLabel: "完成", pendingLabel: "待学习" };
  }

  const taskProgress = stats.taskProgress || {};

  switch (index) {
    case 1:
      return { done: Boolean(stats.glyph), activeLabel: "选字中", doneLabel: "已选字", pendingLabel: "待选字" };
    case 2:
      return { done: stats.lectureStatus === "complete", activeLabel: "讲解中", doneLabel: "已讲解", pendingLabel: "待讲解" };
    case 3:
      return {
        done: (taskProgress.practicedSessionCount || 0) > 0,
        activeLabel: (taskProgress.activeSessionCount || 0) > 0 ? "练习中" : "待创建",
        doneLabel: "已练习",
        pendingLabel: "待练习"
      };
    case 5:
      return { done: (taskProgress.artworkCount || 0) > 0, activeLabel: "创作中", doneLabel: "已保存", pendingLabel: "待创作" };
    case 6:
      return { done: (taskProgress.practicedSessionCount || 0) > 0 || (taskProgress.artworkCount || 0) > 0 || (taskProgress.reportCount || 0) > 0, activeLabel: "记录中", doneLabel: "有记录", pendingLabel: "无记录" };
    case 7:
      return { done: (taskProgress.artworkCount || 0) > 0, activeLabel: "复盘中", doneLabel: "可复盘", pendingLabel: "待作品" };
    case 8:
      return { done: (taskProgress.reportCount || 0) > 0, activeLabel: "报告中", doneLabel: "已导出", pendingLabel: "待报告" };
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
