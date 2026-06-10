# MR 书法康养应用长期开发执行清单

> 本文件用于长期开发进度管理。  
> 每完成一项任务并通过验收后，将 `- [ ]` 改为 `- [x]`。  
> 不要把未完成、半完成、临时可运行的任务勾选为完成。  
> 如果任务只完成一部分，在该任务下方添加“进度说明”，不要勾选。

---

## 使用规则

1. 每个任务使用唯一编号，格式为 `P阶段-序号`，例如 `P1-03`。
2. 每次提交代码时，应在提交说明或 PR 说明中写明完成了哪些任务编号。
3. 如果新增任务，应添加到对应阶段的末尾，不要修改已有编号含义。
4. 如果任务被废弃，应保留编号，并标注“已废弃”和废弃原因。
5. 只有通过对应验收标准后才能勾选。
6. 开发计划书维护方向与架构，本文件维护具体执行进度。

---

## 总体进度

| 阶段 | 名称 | 状态 |
|---|---|---|
| P0 | 项目整理与文档基线 | 完成 |
| P1 | 现代前端工程骨架 | 完成 |
| P2 | 数据结构与配置系统 | 完成 |
| P3 | 前台真实流程状态机 | 完成 |
| P4 | 书法游戏真实化 | 完成 |
| P5 | 护工端状态联动 | 完成 |
| P6 | 后台 3D 场景编辑器 MVP | 完成 |
| P7 | 前后台配置打通 | 完成 |
| P8 | WebXR / MR 增强 | 完成 |
| P9 | 测试、发布与答辩模式 | 完成 |

---

# P0 项目整理与文档基线

目标：保留现有静态原型，建立长期开发所需的文档、目录和任务管理规范。

- [x] **P0-01：确认旧版原型可运行**  
  验收：当前 `index.html` 仍可通过本地服务器运行，原有 3D 立方体房间、步骤导航、热点交互不被破坏。

- [x] **P0-02：建立文档目录**  
  验收：`docs/` 目录存在，并包含开发计划书与执行清单。

- [x] **P0-03：确认开发计划书只描述软件项目**  
  验收：`docs/development-plan.md` 不再包含硬件制造、工业设计生产、CMF、实体模型生产等内容。

- [x] **P0-04：建立长期执行清单**  
  验收：`docs/implementation-checklist.md` 存在，任务编号清晰，支持后续逐项勾选。

- [x] **P0-05：整理旧版文件保留策略**  
  验收：明确旧版静态文件是保留在根目录继续运行，还是迁移到 `legacy/static-demo/`。

- [x] **P0-06：补充 README 中的新旧版本说明**  
  验收：README 能说明旧版静态原型和新版前后台系统之间的关系。

验收记录：2026-06-10 使用 `npm run build` 验证新版构建通过；使用 Vite 本地服务检查 `/`、`/demo`、`/admin`、`/preview/capsule-product-showcase`、`/assets/vendor/pannellum/pannellum.js`、`/assets/vendor/three/three.module.js`、`/assets/cube/wall-wood-front.png`、`/script.js` 均返回 200。

---

# P1 现代前端工程骨架

目标：建立可长期维护的现代前端工程，支持前台、后台、预览端分离开发。

- [x] **P1-01：新增 package.json**  
  验收：项目根目录存在 `package.json`，包含 dev、build、preview 基础脚本。

- [x] **P1-02：新增 Vite 配置**  
  验收：项目根目录存在 `vite.config.js`，本地开发服务可启动。

- [x] **P1-03：安装核心依赖**  
  验收：依赖包含 React、React DOM、Three.js、@react-three/fiber、Zustand。

- [x] **P1-04：建立 src 目录结构**  
  验收：`src/app`、`src/demo`、`src/admin`、`src/scene-core`、`src/store`、`src/data`、`src/utils` 目录存在。

- [x] **P1-05：建立基础路由**  
  验收：可以访问 `/demo`、`/admin`、`/preview/:sceneId` 三类页面。

- [x] **P1-06：保留旧版入口**  
  验收：新增现代工程后，原 `index.html` 不被删除，旧版原型仍可打开。

- [x] **P1-07：建立全局样式与主题变量**  
  验收：项目有统一色彩、字号、按钮、面板样式变量，前后台共享基础视觉规范。

- [x] **P1-08：建立全局错误边界**  
  验收：页面渲染错误时能显示友好错误提示，而不是白屏。

  验收记录：2026-06-10 新增 `src/app/ErrorBoundary.jsx` 并在 `src/main.jsx` 包裹 App；错误时显示统一恢复界面，`npm run build` 通过。

- [x] **P1-09：建立加载状态组件**  
  验收：3D 场景、配置、资源加载期间有统一 loading 状态。

  验收记录：2026-06-10 新增 `src/app/LoadingState.jsx`，并接入 `SceneRenderer` 的 3D 首帧加载状态；`npm run build` 通过。

---

# P2 数据结构与配置系统

目标：让场景、流程、UI、热点、练习数据从代码硬编码转为配置驱动。

- [x] **P2-01：定义 ProjectConfig 数据结构**  
  验收：项目配置包含项目 ID、名称、默认场景、默认流程和主题信息。

- [x] **P2-02：定义 SceneConfig 数据结构**  
  验收：场景配置包含 camera、environment、objects、uiPanels、hotspots 等字段。

  验收记录：2026-06-10 默认场景 JSON 均补充 `uiPanels`，`sceneSchema.js` 增加 `uiPanels` 校验，`docs/scene-schema.md` 同步结构说明；全部默认场景通过校验。

- [x] **P2-03：定义 FlowConfig 数据结构**  
  验收：流程配置包含 states、actions、next、duration 等字段。

  验收记录：2026-06-10 新增 `src/flow-core/flowSchema.js`、`src/utils/validateFlowConfig.js` 和 `docs/flow-schema.md`，定义 FlowConfig 字段、标准状态与校验方法；示例 FlowConfig 校验通过。

- [x] **P2-04：定义 PracticeSession 数据结构**  
  验收：session 可记录开始时间、结束时间、当前状态、事件列表、练习数据、护工操作。

  验收记录：2026-06-10 新增 `src/session-core/sessionSchema.js`、`src/utils/validatePracticeSession.js` 和 `docs/session-schema.md`，定义 session、events、practiceData 与 caregiverActions；示例 PracticeSession 校验通过。

- [x] **P2-05：定义 Report 数据结构**  
  验收：报告包含综合分、分项指标、建议和对应 sessionId。

  验收记录：2026-06-10 新增 `src/report-core/reportSchema.js`、`src/utils/validateReport.js` 和 `docs/report-schema.md`，定义综合分、分项指标、建议与 sessionId；示例 Report 校验通过。

- [x] **P2-06：建立默认项目配置**  
  验收：`src/data/defaultProject.json` 存在，可被前台读取。

  验收记录：2026-06-10 新增 `src/data/defaultProject.json`，包含项目 ID、名称、默认场景、默认流程、场景列表、主题和功能开关；前台 Demo 已读取该配置用于项目名称展示，JSON 解析通过。

- [x] **P2-07：建立默认流程配置**  
  验收：`src/data/defaultFlow.json` 存在，覆盖 idle 到 finished 的主演示流程。

  验收记录：2026-06-10 新增 `src/data/defaultFlow.json`，覆盖 `idle`、`ready_check`、`enter_experience`、`immersive_intro`、`calligraphy_tutorial`、`practice_game`、`scoring`、`report`、`caregiver_confirm`、`finished`，并通过 FlowConfig 校验。

- [x] **P2-08：建立默认场景配置**  
  验收：至少包含产品视角、老人视角、护工视角三个默认场景配置。

- [x] **P2-09：建立配置校验方法**  
  验收：缺少必要字段时，系统能输出明确错误信息。

- [x] **P2-10：建立配置加载器**  
  验收：前台和后台可以通过同一套方法加载默认配置。

  验收记录：2026-06-10 新增 `src/data/configLoader.js`，统一加载默认 Project、Flow、Scene 配置；`sceneStore` 与前台 Demo 均改为通过加载器读取默认配置，加载器校验脚本和 `npm run build` 通过。

- [x] **P2-11：建立配置导入方法**  
  验收：用户可以导入 JSON 配置，并进行校验。

  验收记录：2026-06-10 新增 `src/data/configIO.js`，支持识别并校验 ProjectConfig、FlowConfig、SceneConfig JSON；后台 SceneConfig 导入改用统一解析校验方法，导入方法脚本和 `npm run build` 通过。

- [x] **P2-12：建立配置导出方法**  
  验收：用户可以导出当前项目配置为 JSON 文件。

  验收记录：2026-06-10 `src/data/configIO.js` 新增 JSON 序列化、浏览器下载与项目导出 payload 方法；后台支持导出当前 SceneConfig 与包含 project、flow、scenes 的项目配置 JSON，导出方法脚本和 `npm run build` 通过。

---

# P3 前台真实流程状态机

目标：前台从静态切图升级为真实流程驱动的软件演示。

- [x] **P3-01：建立 flowStore**  
  验收：系统有统一的流程状态、当前状态、状态历史和可执行操作。

- [x] **P3-02：实现 idle 状态**  
  验收：进入 `/demo` 后默认处于等待开始状态。

  验收记录：2026-06-10 新增 `src/store/flowStore.js`，默认读取 `defaultFlow.json` 并进入 `idle`；Demo 控制台展示当前状态、历史数量和可执行 actions，`npm run build` 通过。

- [x] **P3-03：实现 ready_check 状态**  
  验收：开始体验后进入准备检查状态，并创建 PracticeSession。

  验收记录：2026-06-10 `flowStore.executeAction("start")` 会从 `idle` 进入 `ready_check` 并创建 PracticeSession；Demo 控制台显示 session 标识，store 脚本和 `npm run build` 通过。

- [x] **P3-04：实现 enter_experience 状态**  
  验收：系统进入体验启动状态，开始记录 session 事件。

  验收记录：2026-06-10 从 `ready_check` 执行 `next` 会进入 `enter_experience`，并向 PracticeSession 写入 action、state_exited、state_entered 事件；store 脚本和 `npm run build` 通过。

- [x] **P3-05：实现 immersive_intro 状态**  
  验收：进入沉浸导入阶段，计时器和场景说明同步更新。

  验收记录：2026-06-10 flowStore 增加状态进入时间、已用时和剩余时间计算；Demo 根据 `immersive_intro` 同步切换老人视角与阶段说明，并使用 FlowConfig duration 计算剩余时间，store 脚本和 `npm run build` 通过。

- [x] **P3-06：实现 calligraphy_tutorial 状态**  
  验收：进入书法讲解阶段，前台显示当前练习字与笔画说明。

  验收记录：2026-06-10 老人端在 `calligraphy_tutorial` 状态显示“永”字教程卡片和八法笔画说明，其他阶段保留书法练习组件；`npm run build` 通过。

- [x] **P3-07：实现 practice_game 状态**  
  验收：进入真实书法练习组件，开始采集用户输入。

  验收记录：2026-06-10 从 `calligraphy_tutorial` 进入 `practice_game` 时，Demo 同步老人端书法练习组件，PracticeSession 写入 `practice_started` 事件并记录 `practiceData.startedAt`；真实鼠标/触控轨迹采集继续在 P4-03 至 P4-05 完成。

- [x] **P3-08：实现 scoring 状态**  
  验收：练习结束后进入评分阶段，根据练习数据计算分数。

  验收记录：2026-06-10 `practice_game` 执行 `finish` 会进入 `scoring`，基于 PracticeSession.practiceData 生成 Report 原型并写入 `score_generated` 事件；书法组件完成回调接入状态机，store 脚本和 `npm run build` 通过。

- [x] **P3-09：实现 report 状态**  
  验收：系统根据 session 数据生成报告页面。

  验收记录：2026-06-10 新增 `ReportView`，`report` 状态读取 PracticeSession.report 展示综合分、分项指标、摘要和建议；store 脚本和 `npm run build` 通过。

- [x] **P3-10：实现 caregiver_confirm 状态**  
  验收：护工端需要确认结束、重来或保存报告。

  验收记录：2026-06-10 新增 `CaregiverConfirmView`，`caregiver_confirm` 状态展示报告摘要，并提供确认结束、重新练习、保存报告操作；store 脚本和 `npm run build` 通过。

- [x] **P3-11：实现 finished 状态**  
  验收：流程结束，session 保存，用户可重新开始。

  验收记录：2026-06-10 进入 `finished` 会标记 PracticeSession 为 completed、写入 `session_finished` 事件并保存到浏览器 localStorage；finished 保留 reset/restart 操作，store 脚本和 `npm run build` 通过。

- [x] **P3-12：实现暂停逻辑**  
  验收：暂停后计时器、动画、输入采集停止。

  验收记录：2026-06-10 flowStore 增加 pause 状态、暂停时间和剩余时间冻结计算；VirtualCalligraphyGame 支持 paused，暂停时停止 requestAnimationFrame 动画，store 脚本和 `npm run build` 通过。

- [x] **P3-13：实现继续逻辑**  
  验收：继续后计时器、动画、输入采集恢复。

  验收记录：2026-06-10 暂停时可执行操作自动从 pause 切换为 resume；resume 会恢复 active 状态、累计暂停时长并继续倒计时，store 脚本和 `npm run build` 通过。

- [x] **P3-14：实现结束逻辑**  
  验收：结束后保存 session，并进入报告或完成状态。

  验收记录：2026-06-10 非练习评分阶段执行 `finish` 会进入 `finished` 或已有报告时进入 `caregiver_confirm`；进入 finished 会保存 session，护工结束操作已接入状态机，store 脚本和 `npm run build` 通过。

- [x] **P3-15：实现 session event 记录**  
  验收：每次状态变化和关键操作都会写入 events。

  验收记录：2026-06-10 flowStore 已在 start、pause、resume、状态切换、评分生成、练习开始、流程完成等关键操作写入 PracticeSession.events，并新增 `recordSessionEvent` 通用方法；Demo 控制台显示事件数量，store 脚本和 `npm run build` 通过。

---

# P4 书法游戏真实化

目标：实现可操作、可记录、可评分的书法游戏，而不是固定图片展示。

- [x] **P4-01：建立永字八法数据文件**  
  验收：`yongCharacter.json` 包含“永”字的笔画顺序、路径点和容差配置。

- [x] **P4-02：渲染标准笔画路径**  
  验收：前台能显示标准路径，并区分当前笔画和未完成笔画。

- [x] **P4-03：实现鼠标拖拽输入**  
  验收：用户按住鼠标移动时，系统记录轨迹点。

- [x] **P4-04：实现触控输入**  
  验收：触屏设备上可以通过手指描摹路径。

- [x] **P4-05：实现轨迹绘制**  
  验收：用户输入轨迹能实时显示在画面上。

  验收记录：2026-06-10 VirtualCalligraphyGame 使用 Pointer Events 统一支持鼠标和触控描摹；拖拽时记录 SVG 坐标轨迹点，并用 `polyline.user-stroke` 实时绘制用户轨迹，`npm run build` 通过。

- [x] **P4-06：实现笔画完成判断**  
  验收：用户完成当前笔画后，系统进入下一笔。

- [x] **P4-07：实现笔顺判断**  
  验收：按错误顺序操作时，系统能记录并提示。

  验收记录：2026-06-10 VirtualCalligraphyGame 在用户结束描摹时根据轨迹点数量和进度判断当前笔画完成，完成后自动进入下一笔；起笔偏离当前标准笔画起点时记录笔顺提醒并提示用户，`npm run build` 通过。

- [x] **P4-08：实现路径偏差计算**  
  验收：系统能计算用户轨迹与标准路径之间的平均偏差。

  验收记录：2026-06-10 VirtualCalligraphyGame 在每笔完成时计算用户采样点到标准笔画折线的平均偏差、最大偏差和路径准确度，并在当前笔画卡片展示最近一笔偏差指标；`npm run build` 通过。

- [x] **P4-09：实现节奏稳定度计算**  
  验收：系统能根据每笔耗时与预期耗时计算节奏指标。

  验收记录：2026-06-10 VirtualCalligraphyGame 在每笔完成记录中写入实际耗时、预期耗时、耗时比例和节奏稳定分，当前笔画卡片展示最近一笔节奏稳定度；`npm run build` 通过。

- [x] **P4-10：实现重写当前笔画**  
  验收：用户可重写当前笔画，并记录重写次数。

- [x] **P4-11：实现完成练习**  
  验收：所有笔画完成后自动进入 scoring 状态。

  验收记录：2026-06-10 最后一笔完成时 VirtualCalligraphyGame 会生成 `practiceState: completed` 的完成结果，带出完成时间、完成笔画数和每笔记录；Demo 收到完成回调后触发 FlowConfig 的 `finish` 动作进入 `scoring`，`npm run build` 通过。

- [x] **P4-12：实现评分算法**  
  验收：综合分由路径准确度、笔顺完成度、节奏稳定度、中断控制计算得到。

  验收记录：2026-06-10 评分算法改为按路径准确度 40%、笔顺完成度 25%、节奏稳定度 20%、中断控制 15% 加权生成综合分；路径和节奏来自每笔真实记录，笔顺和中断来自练习过程事件，动态建议继续指向最低分指标；`npm run build` 通过。

- [x] **P4-13：实现动态建议生成**  
  验收：建议内容根据最低分指标生成，而不是固定文案。

- [x] **P4-14：实现练习数据保存**  
  验收：每次练习生成 PracticeSession.practiceData。

  验收记录：2026-06-10 VirtualCalligraphyGame 每笔完成后向 Demo 发出包含轨迹点、偏差、耗时和节奏的 strokeRecord，flowStore 写入 PracticeSession.practiceData.strokes 并追加 `stroke_completed` 事件；整字完成时写入 completedAt、expectedStrokeCount、rewriteCount、interruptionCount 和 strokeOrderWarnings，进入 scoring 时报告读取真实 practiceData 生成，`npm run build` 通过。

---

# P5 护工端状态联动

目标：护工端成为真实联动的控制台，而不是静态视觉面板。

- [x] **P5-01：建立 CaregiverDashboard 组件**  
  验收：护工端能显示当前 session 和当前流程状态。

- [x] **P5-02：显示当前老人信息**  
  验收：显示当前体验用户的姓名或模拟档案。

- [x] **P5-03：显示当前流程阶段**  
  验收：流程变化时护工端同步变化。

- [x] **P5-04：显示剩余时间**  
  验收：剩余时间由状态机计时器计算。

  验收记录：2026-06-10 DemoPage 根据 FlowConfig duration、stateEnteredAt、accumulatedPausedMs 和 pausedAt 计算状态机剩余时间，并传入 CaregiverDashboard；护工端剩余时间做非负格式化并标注来源于流程状态计时器，`npm run build` 通过。

- [x] **P5-05：显示练习完成度**  
  验收：完成度来自书法游戏真实进度。

- [x] **P5-06：显示当前笔画**  
  验收：当前笔画与书法游戏状态同步。

- [x] **P5-07：实现暂停按钮**  
  验收：护工点击暂停后，老人端流程真实暂停。

- [x] **P5-08：实现继续按钮**  
  验收：护工点击继续后，老人端流程恢复。

- [x] **P5-09：实现结束体验按钮**  
  验收：护工点击结束后，session 保存并进入报告或完成状态。

- [x] **P5-10：实现呼叫老人端**  
  验收：护工点击呼叫后，老人端出现提示。

- [x] **P5-11：实现老人端求助**  
  验收：老人端点击求助后，护工端出现提醒。

  验收记录：2026-06-10 老人端阶段信息条新增“求助护工”按钮；点击后 Demo 写入 session action 事件、顶部提示更新，并把 elderHelpRequest 传入护工端；CaregiverDashboard 的安全状态切换为“老人求助”，反馈栏显示求助次数与处理提示，`npm run build` 通过。

- [x] **P5-12：实现模拟心率曲线**  
  验收：心率随流程状态动态变化，并标注模拟数据。

- [x] **P5-13：实现模拟呼吸曲线**  
  验收：呼吸数据随流程状态动态变化，并标注模拟数据。

- [x] **P5-14：实现安全状态提示**  
  验收：暂停过久、中断过多或求助时，护工端显示安全提醒。

---

# P6 后台 3D 场景编辑器 MVP

目标：后台能真正编辑 3D 场景对象，并保存为配置。

- [x] **P6-01：建立 AdminPage**  
  验收：`/admin` 页面可访问，并显示后台基础布局。

- [x] **P6-02：建立 SceneList**  
  验收：后台能显示场景列表。

- [x] **P6-03：建立 SceneEditor 布局**  
  验收：页面包含对象树、3D 视窗、属性面板。

- [x] **P6-04：建立 3D Viewport**  
  验收：后台能渲染当前选中场景。

- [x] **P6-05：建立 Scene Tree**  
  验收：对象树显示当前场景 objects、lights、uiPanels、hotspots。

  验收记录：2026-06-10 SceneTree 改为按 Objects、Lights、UI Panels、Hotspots 分组渲染；Objects 保持可点击选择并显示可见状态，其余配置节点以只读行展示标题、ID 或触发类型，空数组显示空状态；`npm run build` 通过。

- [x] **P6-06：实现对象选择**  
  验收：点击对象树或 3D 对象后，属性面板显示对应对象。

- [x] **P6-07：编辑 position**  
  验收：修改 x/y/z 后，3D 视窗对象位置实时变化。

- [x] **P6-08：编辑 rotation**  
  验收：修改旋转后，3D 视窗对象角度实时变化。

- [x] **P6-09：编辑 scale**  
  验收：修改缩放后，3D 视窗对象大小实时变化。

- [x] **P6-10：编辑颜色**  
  验收：修改颜色后，材质立即变化。

- [x] **P6-11：编辑透明度**  
  验收：修改 opacity 后，对象透明度立即变化。

- [x] **P6-12：新增基础几何体**  
  验收：可添加 box、sphere、plane 等基础对象。

- [x] **P6-13：删除对象**  
  验收：删除后对象从对象树和 3D 视窗消失。

- [x] **P6-14：复制对象**  
  验收：复制对象生成新的唯一 ID。

- [x] **P6-15：保存场景配置**  
  验收：编辑结果保存到 IndexedDB。

  验收记录：2026-06-10 sceneStore 新增 IndexedDB `moyin-xinjing-scene-editor/sceneSnapshots` 最新快照保存与恢复；后台“保存到本机”会同步写入 localStorage 兼容数据和 IndexedDB 快照，SceneEditor 启动时异步恢复最新 IndexedDB 场景配置；`npm run build` 通过。

- [x] **P6-16：导出 SceneConfig JSON**  
  验收：可下载当前场景 JSON。

- [x] **P6-17：导入 SceneConfig JSON**  
  验收：导入后场景恢复，并通过配置校验。

---

# P7 前后台配置打通

目标：后台编辑的配置能够驱动前台演示。

- [x] **P7-01：前台读取默认配置**  
  验收：无后台保存内容时，前台正常读取默认配置。

- [x] **P7-02：前台读取后台保存配置**  
  验收：后台修改并保存后，前台能读取最新配置。

- [x] **P7-03：实现 preview 页面**  
  验收：`/preview/:sceneId` 能预览指定场景。

- [x] **P7-04：实现配置版本选择**  
  验收：后台能查看并切换不同保存版本。

  验收记录：2026-06-10 sceneStore 在每次保存时向 IndexedDB 写入最新快照和带时间戳的版本快照，并维护 sceneVersions/activeVersionId；后台工具栏新增配置版本下拉，可查看最近保存版本并切换恢复对应场景配置，同时同步 localStorage 兼容前台读取；`npm run build` 通过。

- [x] **P7-05：实现恢复默认配置**  
  验收：用户可恢复系统默认配置。

- [x] **P7-06：实现配置错误提示**  
  验收：配置缺字段或格式错误时，前台显示明确错误。

  验收记录：2026-06-10 SceneRenderer 在渲染前调用 validateSceneConfig 校验当前 SceneConfig；缺字段、格式错误或无法识别配置时不再进入 3D Canvas，而是显示带 sceneId、首条错误和警告信息的配置错误面板；`npm run build` 通过。

- [x] **P7-07：实现 UI 面板配置驱动**  
  验收：前台空间 UI 的标题、内容、位置来自配置。

  验收记录：2026-06-10 SceneRenderer 新增 SceneUiPanel 渲染器，直接读取 SceneConfig.uiPanels 的 title、body、position、rotation、size 和 tone；面板文字通过 CanvasTexture 绘制，前台、预览和后台视窗共用配置驱动空间 UI；`npm run build` 通过。

- [x] **P7-08：实现热点配置驱动**  
  验收：前台热点位置、名称、动作来自配置。

- [x] **P7-09：实现流程配置驱动**  
  验收：前台状态机可读取 FlowConfig。

  验收记录：2026-06-10 flowStore 启动时优先读取本地保存的 FlowConfig，并新增 setFlowConfig 校验、保存和重置状态机入口；后台导入 JSON 支持 FlowConfig，项目导出使用当前流程配置，Demo 状态机可按导入后的 states、actions、next 和 duration 运行；`npm run build` 通过。

---

# P8 WebXR / MR 增强

目标：在桌面模式稳定后，增加 MR / VR 设备增强能力。

- [x] **P8-01：检测 WebXR 支持**  
  验收：系统能判断当前浏览器是否支持 WebXR。

- [x] **P8-02：添加进入 XR 模式按钮**  
  验收：支持设备上可进入 XR 模式，不支持时显示提示。

  验收记录：2026-06-10 SceneRenderer 启动后通过 navigator.xr.isSessionSupported 检测 immersive-vr 支持，3D 视窗右上角显示 WebXR 状态；支持设备可点击“进入 XR”请求 XRSession，不支持或检测失败时按钮禁用并显示原因；`npm run build` 通过。

- [x] **P8-03：实现 XR 控制器射线选择**  
  验收：控制器射线可以选择空间按钮。

- [x] **P8-04：实现 XR 凝视交互**  
  验收：头部朝向可触发凝视按钮。

  验收记录：2026-06-10 SceneRenderer 在 XR active 时挂载 XrInteractionLayer，为双控制器添加可视射线并在 selectstart 时 raycast 可选节点；Hotspot 和 SceneUiPanel 写入 selectableId，射线可选中热点或空间 UI；同时中心凝视 raycast 同一批 selectable 节点，停留约 1.15 秒触发选择；`npm run build` 通过。

- [x] **P8-05：适配老人端空间 UI 大字号**  
  验收：XR 模式下文字可读，按钮尺寸适老。

  验收记录：2026-06-10 SceneUiPanel 接收 xrActive 状态，XR 模式下面板几何放大 1.24 倍，并使用更大的 title/body CanvasTexture 字号与行高，提升头显内空间 UI 可读性；`npm run build` 通过。

- [x] **P8-06：实现 XR 安全退出**  
  验收：XR 模式下可以随时退出回桌面模式。

  验收记录：2026-06-10 进入 XR 后控件切换为“退出 XR”，点击会调用 XRSession.end；同时监听 session end 事件恢复桌面状态，避免退出后界面仍停留在 XR active 状态；`npm run build` 通过。

- [x] **P8-07：性能优化**  
  验收：XR 模式下帧率稳定，无明显卡顿。

  验收记录：2026-06-10 SceneRenderer 在 XR active 时关闭实时阴影、将 dpr 限制到 [1, 1.25]，并使用 high-performance WebGL 偏好；XR 控制器射线退出时释放几何与材质资源，降低重复进入退出后的资源压力；`npm run build` 通过。

---

# P9 测试、发布与答辩模式

目标：形成可以稳定展示和长期迭代的版本。

- [x] **P9-01：建立基础测试清单**  
  验收：包含前台流程、书法游戏、护工联动、后台编辑、导入导出测试项。

  验收记录：2026-06-10 新增 `docs/test-checklist.md`，覆盖前台流程、书法游戏、护工联动、后台编辑、导入导出五类浏览器检查项；新增 `npm run test:smoke` 覆盖核心数据流，测试通过。

- [x] **P9-02：测试前台完整流程**  
  验收：从开始体验到报告完成不中断。

  验收记录：2026-06-10 `npm run test:smoke` 模拟默认 FlowConfig 从 idle 到 practice_game，再完成练习进入 scoring 并生成有效 Report，流程不中断。

- [x] **P9-03：测试书法游戏评分差异**  
  验收：不同轨迹会得到不同分数。

  验收记录：2026-06-10 `npm run test:smoke` 构造高路径准确/高节奏稳定与低路径准确/低节奏稳定两组练习数据，高分样例显著高于低分样例。

- [x] **P9-04：测试护工端控制**  
  验收：暂停、继续、结束、呼叫均能影响老人端。

  验收记录：2026-06-10 `npm run test:smoke` 验证 pause/resume 会冻结并恢复状态，callCaregiver 只记录即时动作且不错误推进流程；同时修正 flowStore 即时动作处理。

- [x] **P9-05：测试后台保存与读取**  
  验收：刷新页面后配置不丢失。

  验收记录：2026-06-10 `npm run test:smoke` 使用模拟 localStorage 保存后台场景，再以新的 sceneStore 模块实例重新加载，确认新增对象仍存在。

- [x] **P9-06：测试 JSON 导入导出**  
  验收：导出后重新导入，场景一致。

  验收记录：2026-06-10 `npm run test:smoke` 校验项目导出包可识别为 project-export，单场景导出可识别为 SceneConfig 并通过校验；configIO 补充 project-config-export 解析与校验。

- [x] **P9-07：建立一键演示模式**  
  验收：答辩时可以自动播放关键流程。

  验收记录：2026-06-10 Demo 控制台新增“一键演示”，会重置并启动 FlowConfig，自动推进准备检查、入舱、沉浸导入、书法讲解、模拟完成书法练习、评分报告、保存报告和护工确认；`npm run build` 通过。

- [x] **P9-08：建立全屏展示模式**  
  验收：前台可进入全屏，隐藏无关开发信息。

  验收记录：2026-06-10 Demo 控制台新增全屏按钮，接入浏览器 Fullscreen API；全屏时隐藏顶部开发导航、选中对象调试标签和 session 细节，并调整舞台高度铺满答辩屏幕；`npm run build` 通过。

- [x] **P9-09：构建生产版本**  
  验收：`npm run build` 成功。

- [x] **P9-10：撰写运行说明**  
  验收：README 包含安装、启动、演示、后台编辑说明。

  验收记录：2026-06-10 重写 `README.md`，补充新版 Vite 系统安装、启动、生产构建、冒烟测试、前台演示、一键答辩、后台编辑、预览页面、旧版静态原型和开发记录说明。

---

## 阶段完成判定

一个阶段只有在该阶段全部任务勾选完成后，才能在“总体进度”表中改为“完成”。

如果某阶段暂时不做，应标注为“延期”，不要标注为完成。
