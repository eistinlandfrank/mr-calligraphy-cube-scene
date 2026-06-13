# 当前版本功能缺口与前端真实化开发文档

日期：2026-06-12
适用范围：当前 `main` 分支，已恢复并继续开发的 5.16 版本线。  
当前本机入口：`http://localhost:41496/`、`http://localhost:41496/main-admin.html`、`http://localhost:41496/realistic-demo.html`、`http://localhost:41496/realistic-admin.html`。

## 1. 总体判断

这一版已经不是纯静态 Demo。前台已经有本机学习状态、书写画布、作品保存、报告、学习档案和本机导出；主后台、写实后台也已经能编辑对象、导入模型、保存草稿、发布本机版本、回滚历史。

但它还不是一个真正完整可交付的产品。当前最明显的问题不是“页面完全不能点”，而是很多能力只完成了本机原型闭环，用户看到按钮时会自然理解成更强的生产能力，例如云端 AI 讲解、专业评分、公开分享、远端发布、多人协作和账号权限。这些能力目前还没有真正接入。

所以后续真实化的核心目标是：

- 所有按钮必须有真实数据来源。
- 点击后必须产生可验证的状态变化或文件产物。
- 刷新、切页、导出、导入、回滚后还能复现结果。
- 做不到生产级能力时，UI 必须明确写成本机能力、导出能力、演示内容或暂不可用。
- 不能再用静态成功文案假装功能已完成。

## 2. 当前控件状态审计

已运行控件清单脚本：

```bash
node scripts/control-inventory.js
```

当前结果：

| 页面 | 本机真实 | 文件导出 | 本机发布 | 演示内容 | 暂不可用 | 缺失标记 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `index.html` | 75 | 31 | 0 | 0 | 0 | 0 |
| `main-admin.html` | 45 | 7 | 1 | 0 | 0 | 0 |
| `realistic-demo.html` | 3 | 0 | 0 | 0 | 0 | 0 |
| `realistic-admin.html` | 30 | 3 | 1 | 0 | 0 | 0 |
| `script.js dynamic` | 31 | 1 | 0 | 0 | 1 | 0 |

结论：四个入口 HTML 的静态按钮和导航链接已经没有 `demo-content` 或缺失标记；前台动态场景热点按钮也已纳入清单脚本并改为本机真实交互。下一步要审计的是“标为真实的控件是否足够真实”。

## 3. 当前不够完善的功能

### 3.1 前台学习产品

| 模块 | 当前可用内容 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 10 步学习路径 | 可导航，支持 `?step=1-10` 直达；已新增本机 `LearningPathService`，用 `LearningTask`、`PracticeSession`、`ArtworkRecord`、`ReportRecord` 和 `PlanRecord` 推导 10 步标题、说明、完成状态、证据和下一步动作 | 仍不是云端课程编排、教师下发任务或跨设备学习进度；视觉场景和少量标签仍保留静态兜底 | 继续把课程任务版本、服务端课程包、教师端排课和跨设备进度接到同一服务接口 |
| 学习模式 | 单字、集字、创作可切换，并有本机任务状态 | 没有课程编排、教师下发、步骤依赖和评分规则 | 增加课程/任务 schema、任务版本、必做步骤、完成条件和任务依赖 |
| AI 讲解 | 浏览器本机语音合成能朗读本机讲解段落；已新增本机 `LectureService` adapter，记录语音能力、播放段落、降级、失败和完成状态 | 不是云端 AI 音频，也不是根据真实笔迹动态生成 | UI 保持“本机语音讲解”定位；后续扩展云端生成和音频资源 |
| 书写练习 | 支持鼠标/触控笔迹、撤销、清空、回放、本机保存、第一版范字笔顺、逐笔轨迹匹配、路径误差热力和压感采样证据 | 缺高精度笔锋路径、硬件压感校准和专业评分模型 | 增加笔锋分析、专业评分接口、教师标定和离线 fallback |
| 评分反馈 | 能从本机笔迹计算结构、笔画、笔法、力度、流畅度；已新增本机 `ScoreService` adapter，记录评分来源、算法版本、最近证据摘要、累计评分次数和采样点；`local-heuristic-v2.2.0` 会保存范字来源、目标笔顺、逐笔匹配列表、路径误差热力、疑似错序提醒、笔画差和压感采样 | 仍是启发式评分，容易被误解为专业识别模型 | 继续保持“基础练习评分”边界；后续扩展笔锋模型、硬件压感校准、教师标定和服务端专业评分来源 |
| 学习计划 | 可按本机状态生成、勾选、顺延、复盘、管理计划项，显示任务依赖图，生成下周期，检查浏览器通知权限，触发页面打开时的一次性本机通知，导出/导入 JSON 同步包，配置远端 API endpoint/token/Workspace 并通过 `fetch` 检查、推送、拉取计划仓库，可导出离线 HTML 计划单和 `.ics` 日历提醒；计划变更已进入自动同步队列，拉取远端时会检测本机待同步冲突，并提供保留本机、采用远端、另存远端副本和字段级合并入口；推送 422、网络中断或请求超时时会保留待同步队列、记录失败历史、显示下一次可重试时间，并可通过“重试队列”恢复；远端计划仓库 API 合同、本机 mock 服务、Workspace 空间隔离、回执审计导出和回执本机一致性校验已完成第一版 | 缺真正账号登录、后台托管仓库、远端提醒、教师端通知和服务端不可篡改审计 | 继续增加账号同步、后台计划仓库、教师端通知、远端提醒和服务端审计 |

### 3.2 作品、报告和分享

| 模块 | 当前可用内容 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 保存作品 | 能保存笔迹、截图、评分、标签和本机作品记录 | 作品只在当前浏览器可见 | 增加公开作品集适配、跨设备作品库和课堂评阅入口 |
| 生成视频 | 能用真实笔迹导出 WebM 回放，并生成 PNG 封面、本机导出记录、本机队列、失败重试入口和视频导出回执审计 HTML | 不是 MP4/GIF，没有压缩、云端转码、生产签名回执、页面关闭后的后台队列和分享链路 | UI 写明 WebM；后续加格式转换、压缩和 Service Worker/服务端异步导出队列 |
| 导出报告 | 能生成 HTML 报告、站内报告详情、原生 PDF 报告、PDF 能力条形图、PDF 能力雷达图、PDF 分数趋势图、报告对比、多报告趋势、本机教师批注、本机验真摘要、PDF 最近作品 JPEG 截图嵌入、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、报告仓库 Workspace 空间隔离、报告仓库签名回执审计导出、报告冲突审计、字段级合并和远端副本另存 | 本机 JSON 包只是手动备份/迁移，报告仓库 adapter 只是用户配置 endpoint 的真实 GET/PUT；当前 Workspace 是账号化前置隔离，签名回执审计是本机列表和 mock/HMAC 开发验收，不是生产证书签名、不可篡改审计和云端长期报告产品 | 继续增加账号化 ReportRepository、教师身份审计、生产证书签名、服务端 PDF 渲染和导出验收 |
| 学习档案 | 有筛选、趋势、详情、回收站、导出、直达链接、远端 API 推送/拉取、分页 `nextPageUrl` 自动追取、同 ID 冲突审计、字段级合并、远端冲突另存副本、远端回执审计导出、回执本机一致性校验、API 合同和本机 mock 服务 | 还没有账号登录、托管档案仓库、生产级分页查询、服务端教师批注审计和长期归档 | 继续增加账号化 history repository、云端详情 URL、服务端合并审计和长期归档 |
| 分享成果 | 能导出离线 HTML 分享页；已新增同浏览器内可访问的本机 `?share=...` 链接、复制/访问计数、撤销记录和远端分享 API adapter；可配置 endpoint/token/Workspace，真实 GET 检查、PUT 发布分享包、DELETE 撤销远端分享，保存 publicUrl、发布/撤销回执、回执审计和回执本机一致性校验；已有 API 合同与本机 mock 服务 | 远端 adapter 仍需用户自备服务端；没有内置账号、微信、社群、课堂作品墙、CDN 托管或生产权限控制 | 离线导出按钮保持 `real-export`，本机分享服务和远端 adapter 标记 `real-local`；后续加账号化公开链接服务、权限、撤销审计和课堂作品墙 |

### 3.3 主后台和写实后台

| 模块 | 当前可用内容 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 主后台编辑 | 能编辑对象、图层、灯光、导入模型、保存布局；项目档案区已显示统一 `ProjectRepository` 状态，并可配置远端项目仓库 API 执行真实 GET/PUT，支持远端版本历史、指定版本拉取预览、回执审计导出、回执本机一致性校验、请求超时保护、失败历史和重试推送恢复 | 保存主体仍在 localStorage / IndexedDB，远端 adapter 不是账号协作后台 | 继续接账号化项目 repository、多人合并和服务端资产签名 |
| 写实后台编辑 | 能编辑写实样张对象、导入模型、保存快照和发布到演示；已纳入 `project-scene-repository-v1` 统一视图 | 与主后台对象模型仍有字段差异 | 继续做字段迁移、资产引用规则和完整 diff |
| 本机发布 | 主后台发布到前台，写实后台发布到演示，支持历史和回滚，并可配置远端发布 API 真实 POST 当前发布包；远端推送前已有本机审核流、本机发布锁、服务端锁 / 最近回执预检、模型/贴图资产清单、远端资产签名回执、CDN upload 回执、DELETE 撤销发布和 CDN purge 回执审计 | 远端发布 adapter 已完成开发级闭环，但还不是服务端账号权限、生产 CDN 部署、生产证书签名或服务器托管 | 继续增加服务端审批合同、账号权限、生产证书资产签名、生产 CDN 回调和不可篡改审计 |
| 项目档案 | 可导出/导入 JSON，含 schema、迁移、模型哈希、选择恢复、恢复审计、统一项目仓库状态、远端项目仓库 API adapter、版本历史拉取预览、API 合同、本机 mock 服务、回执审计导出和回执本机一致性校验 | 三方合并、完整 JSON 树、账号权限和远端资产服务仍弱 | 增加账号化服务端 repository、多人合并策略和远端资产完整性校验 |
| 后台权限 | 当前无需登录即可编辑，主后台和写实后台已增加本机无权限保护提示与确认状态 | 任何人打开后台仍能改本机内容 | 后端版加入账号、角色、审计和发布权限 |

## 4. 最像“假的”的界面来源

1. 部分热点说明仍来自静态场景导览；学习动作里的笔画拆解、创作实践、复习巩固已开始写入本机阶段记录。
2. AI 讲解、评分、发布、分享、PDF 这些词天然会让用户期待生产级能力，但当前多为本机原型或导出文件。
3. 学习计划已有到期、提醒、顺延、复盘、依赖图、周期循环、离线导出、本机提醒权限边界、JSON 同步包、远端 API adapter、API 合同、mock 服务、自动同步队列、冲突检测和前端冲突解决入口；真正账号系统、后台托管仓库、远端提醒和教师端通知仍未接入。
4. 后台本机发布、统一项目仓库状态、远端项目仓库 API adapter 和远端发布 API adapter 已可用，但它们仍是本机 adapter 或用户配置 endpoint，不是部署、审核、账号权限或 CDN 托管。
5. 现有 smoke test 能证明页面和脚本不坏，但还不能证明所有深层交互都真实可用。
6. 前台主脚本已清零 `window.prompt()`；学习计划新增/编辑、作品标签编辑和历史记录重命名都已升级为表单弹层。删除、清空等高风险动作仍保留浏览器确认框。

## 5. 真实化定义

一个前端控件只有满足下面条件，才能标为真实能力：

| 条件 | 要求 |
| --- | --- |
| 数据来源 | 明确读取哪个 state、storage key、IndexedDB store、文件或 API |
| 执行动作 | 明确调用哪个函数，写入哪些字段或生成什么文件 |
| 成功反馈 | 成功后页面能看到状态变化、文件下载、版本增加或记录新增 |
| 失败反馈 | 缺数据、浏览器不支持、导入失败、权限不足时有明确提示 |
| 持久化 | 刷新后还能读到结果；如果不能持久化，必须标为临时或演示 |
| 验收 | 有手工步骤或脚本能证明它不是只改文案 |

状态标记继续使用：

| 状态 | 使用条件 |
| --- | --- |
| `real-local` | 本机浏览器内真实可用，刷新可保留，但不跨设备 |
| `real-export` | 会生成真实文件，如 HTML、JSON、WebM |
| `real-published-local` | 发布到本机前台或本机演示快照 |
| `demo-content` | 可点但内容来自演示素材或静态剧本 |
| `disabled` | 尚未接入，不允许出现成功反馈 |

## 6. 真实化改造路线

### 阶段 A：把假成功全部消掉

目标：用户点击任何按钮，都不会被假成功误导。

任务：

- 审计 `LEARNING_ACTION_FEATURES` 里所有动作。
- `demo-content` 动作保留演示标签，或改成真实功能。
- 高预期按钮文案补边界：本机语音、本机发布、本机 HTML、WebM。
- 禁止新增只弹出成功文案、不写状态、不导出文件的按钮。

验收：

- 清空本机状态后，页面不显示伪造学习成果。
- 点击未完成能力不会出现“已成功发布/已分享/已生成”的误导。
- `node scripts/control-inventory.js --check` 通过。

### 阶段 B：补齐学习任务和计划状态机

目标：前台学习不是单页剧本，而是可以完成、复盘和继续的任务。

任务：

- 给 `LearningTask` 增加任务版本、依赖步骤、完成条件和当前状态。
- 给学习计划项增加 `dueAt`、`remindAt`、`reviewAction`、`reviewDoneAt`、`snoozedUntil`。第一版已完成。
- 计划面板显示到期、逾期、已顺延、待复盘、已复盘。第一版已完成。
- 勾选计划项后触发复盘建议或下一步动作。第一版已完成。
- 学习计划可导出为离线 HTML，便于保存、打印或归档。第一版已完成。
- 学习计划依赖图可从计划项 `dependsOn` 推导节点、依赖边、阻塞和解锁状态。第一版已完成。
- 学习计划周期循环可在本周期完成后生成下一轮计划，保留任务结构和依赖链。第一版已完成。
- 自定义计划项从 `prompt()` 升级为表单或轻量弹层。第一版已完成，新增和编辑共用同一个真实表单。

验收：

- 新建计划后，每个计划项都有到期/提醒信息。
- 到期或逾期计划项有明确状态，不只是普通 checkbox。
- 完成计划项后刷新仍保留状态。
- 复盘动作能打开相关练习、作品或报告入口。
- 点击“导出计划”会下载 `mr-calligraphy-plan-*.html`，文件包含计划 ID、任务、到期、提醒、复盘状态和本机导出边界说明。
- 计划面板会显示依赖图，点击图中节点会定位到对应任务项；完成前置计划项后刷新仍能推导下一项解锁。
- 完成本周期全部计划项后，“生成下周期”会创建新的本机计划，重置完成/复盘状态并保留依赖链。

### 阶段 C：让评分和讲解更可信

目标：即使暂时没有专业模型，也要让用户知道分数怎么来。

任务：

- 评分结果旁显示计算依据，例如笔画数量、采样点、重心偏移、停顿次数、范字笔顺、逐笔匹配、路径误差热力和压感采样。
- 把启发式评分命名为“基础练习评分”。
- 已增加本机 `ScoreService` adapter 和 `local-heuristic-v2.2.0` 证据包，未来可替换成专业模型或服务端评分来源。
- 本机语音讲解继续可用，并通过 `LectureService` 记录能力、降级和完成状态；后续在同一接口上接云端讲解服务。

验收：

- 同一用户写两次不同质量的字，评分差异有可解释原因。
- 没有笔迹时不出现假评分。
- 浏览器不支持语音合成时，AI 讲解显示文本播放状态和失败提示。

### 阶段 D：把报告和分享从导出文件升级为产品能力

目标：保留当前本机导出优势，同时为云端能力留接口。

任务：

- 定义 `ReportRecord` 和 `ShareRecord` 的稳定 schema。
- HTML 报告继续保留，增加 PDF 生成适配层。
- 分享页导出继续标为 `real-export`，本机分享链接标为 `real-local`；公网公开链接功能仍单独标为后续能力。
- 报告、作品、分享页都写入统一来源说明和生成时间。

验收：

- 报告数据全部来自本机练习、作品和计划，不依赖静态分数。
- 导出的 HTML 能离线打开，并显示报告 ID、来源和生成时间。
- 未接入公开链接前，不出现“已分享到社交平台”的提示。

### 阶段 E：后台编辑器项目化

目标：后台不只是单浏览器调参，而是可长期维护的项目编辑器。

任务：

- 统一主后台和写实后台对象 schema。
- 导入模型统一资产引用、哈希、尺寸、来源和恢复策略。
- 项目档案支持字段级 merge、冲突解决和完整 JSON 树预览。
- 本机发布与远端发布拆开：本机发布保留，远端发布走独立 adapter。
- 静态版本已补“本机无权限保护”风险提示和本机确认状态；后端版本继续补账号、角色和审计。

验收：

- 主后台新增、编辑、发布、回滚后，前台能读到正确版本。
- 写实后台发布、回滚后，写实演示页能读到正确版本。
- 导出项目档案后，在新浏览器导入能恢复主要配置和本机模型。
- 发布按钮文案不会暗示已经部署到服务器。

### 阶段 F：浏览器级自动化验收

目标：减少“看起来能点，实际不可用”的回归。

任务：

- 在可安装依赖的环境跑通 Playwright。
- 覆盖前台书写、保存作品、导出报告、学习档案复盘。
- 覆盖主后台新增物体、保存、发布、回滚。
- 覆盖写实后台发布历史和发布差异。
- 对 WebGL canvas 增加非空像素检查。

验收：

- 每次功能提交前至少跑 smoke test。
- 高风险交互有 Playwright 用例。
- 下载类功能校验文件名和内容关键字段。

## 7. 下一批优先级

| 优先级 | 功能 | 原因 | 交付物 |
| --- | --- | --- | --- |
| P0 | 账号化计划仓库和跨设备提醒 | 远端 API adapter、服务端 repository 合同、mock 服务、Workspace 空间隔离、自动同步队列、冲突检测、前端冲突解决入口和本机回执审计第一版已完成，学习计划也可导出标准 `.ics` 日历提醒；但还没有账号登录、后台托管仓库、教师端通知或后台推送 | 账号同步状态、托管 repository、跨设备提醒策略 |
| P0 | 剩余 `demo-content` 动作治理 | 用户最容易觉得“按钮是假的” | 四个入口 HTML 静态控件和前台动态热点已清零；后续持续审计新增控件 |
| P1 | 评分解释层 | 评分是核心信任点 | 第一版已完成：基础评分证据、缺数据状态、本机 `ScoreService` adapter 和模型替换接口 |
| P1 | 任务驱动学习路径 | 10 步学习路径需要真实进度和真实下一步 | 第一版已完成：任务依赖、完成规则、锁定状态、选择拦截、`LearningPathService`、路径完成证据和测试 |
| P1 | 后台权限风险提示 | 当前后台可直接编辑 | 第一版已完成：主后台和写实后台风险提示、本机确认状态、烟测标记 |
| P1 | 统一项目仓库和远端 adapter | 主后台和写实后台长期分叉，用户难判断草稿、发布、资产和远端保存是否齐 | 第一版已完成：`ProjectRepository` 状态、`project-scene-repository-v1` 统一视图、主后台仓库状态面板、远端项目仓库 API adapter、版本历史拉取预览、回执审计导出、回执本机一致性校验、失败历史、重试推送恢复、API 合同、mock 服务、E2E 和项目 Schema 检查 |
| P2 | 报告 PDF/云端适配 | 原生 PDF、本机教师批注、本机验真摘要、PDF 能力条形图、PDF 能力雷达图、PDF 分数趋势图、PDF 最近作品 JPEG 截图嵌入、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、报告仓库 Workspace 空间隔离、报告仓库签名回执审计导出、同 ID 冲突审计和本机字段级合并已完成，但仍缺账号化教师端、生产证书签名验真、不可篡改审计和生产长期报告仓库 | 账号化 ReportRepository、教师端身份与服务端审计 |
| P2 | 项目档案 merge 和冲突解决 | 字段级 merge、模型冲突处理和导入影响报告已有第一版，但还缺多人协作级冲突审计 | 冲突审计历史、远端资产完整性校验、多人合并策略 |
| P2 | 后台远端发布生产化 | 远端发布 API adapter、发布包 manifest/digest、发布前预检、审核流、发布锁、服务端锁预检、模型/贴图资产清单哈希、HMAC 开发资产签名回执、服务端合同文档和 mock server 已完成第一版，但仍缺服务端账号权限、生产证书资产签名和不可篡改审计 | 服务端审批合同强化、生产证书资产签名、账号权限和审计签名 |
| P3 | Playwright 环境和深层用例 | 需要证明真实交互可用 | 可运行 E2E、canvas 非空检查 |

## 8. 每个功能完成时的记录格式

后续每完成一个功能，在开发文档里追加一节：

```text
### YYYY-MM-DD：功能名称

完成内容：
- ...

真实化说明：
- 数据来源：
- 写入状态：
- 成功反馈：
- 失败反馈：
- 刷新后复现方式：

验收：
- 手工验收：
- 脚本验收：

提交：
- 中文 commit message：
```

## 9. 本轮结论

目前版本的基础已经比最早的静态页面强很多，但还没有达到“真实产品”的标准。下一阶段不应该继续堆新 Demo，而应该继续补真实闭环，尤其是账号化计划/档案 repository、浏览器级自动化验收、报告 PDF/云端适配和后台远端发布生产化。

最重要的原则是：可以先做本机能力，但必须说清楚是本机能力；可以保留演示内容，但不能让用户误以为它已经接入真实业务。

## 10. 开发记录

### 2026-06-11：学习报告原生 PDF 导出

完成内容：

- `MRAppState` 新增 `getReportPdfExport()`，可从当前 `ReportRecord` 生成真正的 `application/pdf` 文件内容。
- 新增 `downloadReportPdf()`，下载 `mr-calligraphy-report-*.pdf`，不再依赖浏览器打印窗口才能得到 PDF 文件。
- PDF 内容来自本机报告数据，包含报告 ID、生成时间、数据来源、摘要、练习次数、作品数量、平均分、学习分钟、五项能力分、最近练习/作品和练习建议。
- 站内报告操作区新增“下载 PDF”按钮，标记为 `real-export`。
- 学习状态检查新增 PDF 文件头、MIME、文件名、数据来源和非空内容断言；smoke test 新增 `reportDetailDownloadPdf` 页面标记。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.reports`，并复用最近练习、作品、能力维度和建议数据。
- 写入状态：PDF 导出不改写学习状态，只生成真实文件产物。
- 成功反馈：点击“下载 PDF”会下载 `.pdf` 文件，页面提示原生 PDF 已下载。
- 失败反馈：没有报告时按钮禁用或返回“还没有可下载的 PDF 报告”，不会生成空壳文件。
- 刷新后复现方式：报告记录保存在本机状态中，刷新后重新打开站内报告仍可再次导出同一报告的 PDF。

验收：

- 手工验收：生成学习报告后打开站内报告，点击“下载 PDF”，应得到 `mr-calligraphy-report-*.pdf` 文件。
- 脚本验收：`node scripts/learning-state-check.js` 会验证 PDF 头、MIME、文件名、数据来源和文件长度；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台 PDF 入口。

提交：

- 中文 commit message：`新增学习报告原生PDF导出`

### 2026-06-11：增强学习报告 PDF 图表与作品卡片

完成内容：

- `MRAppState.createReportPdf()` 改为输出带块级内容的 PDF 报告，不再只堆叠文字行。
- PDF 内容流新增五项能力原生条形图，使用 PDF 矩形绘制能力轨道和分值填充。
- PDF 新增最近作品卡片，写入作品标题、评分、笔画数、采样点、保存时间和截图来源状态。
- `getReportPdfExport()` 返回 `features.metricBars`、`features.metricCount`、`features.artworkCard`、`features.artworkAvailable` 和 `features.artworkImageAvailable`，便于前端、后台和脚本判断导出能力。
- 学习状态检查新增 PDF 图表标记、作品卡片标记和导出 feature 断言。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.reports`、最近练习会话和最近保存作品。
- 写入状态：PDF 导出仍不改写学习状态，只读取本机报告、练习和作品数据生成文件。
- 成功反馈：生成的 PDF 内含 `MetricBars: 5` 和 `ArtworkCard: yes` 标记，可被自动化脚本验证。
- 失败反馈：没有报告时仍返回明确失败；没有作品时 PDF 会生成空作品卡片，不伪造截图。
- 刷新后复现方式：刷新后重新打开同一份报告，因报告和作品保存在本机状态中，仍可导出同样的 PDF 图表和作品卡片。

验收：

- 手工验收：生成报告后下载 PDF，应看到五项能力条形图和最近作品信息卡片。
- 脚本验收：`node scripts/learning-state-check.js` 验证 PDF feature、条形图标记和作品卡片标记。

后续状态：

- 后续版本已补最近作品 JPEG 截图嵌入和分数趋势图；雷达图、复杂图片转码和服务端 PDF 渲染仍待实现。

提交：

- 中文 commit message：`增强学习报告PDF图表`

### 2026-06-12：嵌入学习报告 PDF 作品截图

完成内容：

- `createReportPdf()` 会把最近作品的 JPEG `imageData` 转为 PDF Image XObject，在作品卡片中真实绘制截图。
- `createSimplePdf()` 新增 `/XObject` 图片资源、`/Subtype /Image`、`/ASCIIHexDecode` 和 `/DCTDecode` 输出。
- `getReportPdfExport()` 新增 `features.artworkImageEmbedded`、`artworkImageMime` 和 `artworkImageDigest`。
- 学习状态检查使用有效 JPEG 作品截图，并断言 PDF 中包含 `ArtworkImageEmbedded: yes`、`/Subtype /Image` 和 `/DCTDecode`。
- Playwright 前台流程点击“下载 PDF”后读取下载文件，验证浏览器级 PDF 文件内含嵌入图片对象。

真实化说明：

- 数据来源：当前浏览器保存作品时生成的 JPEG 截图 data URL。
- 写入状态：PDF 导出仍不改写学习状态；图片只进入下载文件。
- 成功反馈：导出结果 feature 显示 `artworkImageEmbedded: true`，PDF 注释显示 `ArtworkImageEmbedded: yes`。
- 失败反馈：没有作品、没有截图、非 JPEG 或图片过大时继续生成作品卡片，不输出损坏图片流。
- 刷新后复现方式：刷新后重新打开同一报告，只要作品截图仍在本机状态，就能再次嵌入 PDF。

仍待补：

- 当前只嵌入保存作品的 JPEG 截图；后续已补 PDF 分数趋势图和能力雷达图，PNG 转码、服务端 PDF 渲染和服务端签章仍待实现。

验收：

- `node --check app-state.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`嵌入学习报告PDF作品截图`

### 2026-06-11：新增项目档案导入差异报告

完成内容：

- 主后台项目档案导入预览区新增“导出差异报告”按钮，标记为 `real-export`。
- `MRProjectArchive` 新增 `getImportImpactReport(preview, options)` 和 `downloadImportImpactReport(preview, options)`。
- 差异报告会生成离线 HTML，包含档案时间、来源、schema 摘要、storage 新增/覆盖/清空统计、模型数量、哈希统计和迁移记录。
- 报告复用当前导入预览的字段级差异、字段 JSON 片段、模型新增/修改/删除、命名冲突和当前恢复选择。
- `scripts/archive-migration-check.js` 新增差异报告断言；`scripts/smoke-test.js` 新增主后台 `projectImportExportImpact` 入口检查。

真实化说明：

- 数据来源：`MRProjectArchive.prepareImportProject()` 生成的真实导入预览对象，包括本机 localStorage、IndexedDB 模型仓库和导入档案内容的差异。
- 写入状态：导出差异报告不会恢复、覆盖或删除任何本机数据，只生成 HTML 文件。
- 成功反馈：选择项目档案并生成预览后，点击“导出差异报告”会下载 `mr-calligraphy-archive-impact-*.html`。
- 失败反馈：未选择档案或预览不存在时返回“请先选择项目档案并生成差异预览”，不会生成空报告。
- 刷新后复现方式：重新选择同一项目档案，预览会再次计算本机与档案差异，并可导出同样结构的审阅报告。

验收：

- 手工验收：在主后台选择项目档案 JSON，预览出现后点击“导出差异报告”，离线 HTML 应显示字段覆盖、模型冲突和当前恢复选择。
- 脚本验收：`node scripts/archive-migration-check.js` 验证 HTML 标题、深层字段、命名冲突、自定义冲突名称和“不直接覆盖本机数据”说明；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 验证入口存在。

已知限制：

- 差异报告是导入前审阅产物；恢复动作完成后会写入本机“项目档案恢复审计”，多人协作审计仍待补充。
- 当前报告复用本机预览结果，不会连接远端项目仓库或资产服务。

提交：

- 中文 commit message：`新增项目档案差异报告`

### 2026-06-11：新增项目档案恢复审计

完成内容：

- 新增 `mr-calligraphy-project-archive-audit-v1` 本机审计日志，项目档案恢复成功后会记录恢复时间、档案来源、恢复配置、恢复模型库、字段级选择、模型级选择、哈希数量和迁移数量。
- 主后台项目档案面板新增“恢复审计”区域，显示最近恢复记录。
- 主后台新增“导出审计”按钮，标记为 `real-export`，可下载 `mr-calligraphy-archive-audit-*.html`。
- `MRProjectArchive` 新增 `getRestoreAuditLog()`、`getRestoreAuditExport()` 和 `downloadRestoreAuditLog()`。
- `scripts/archive-migration-check.js` 新增恢复审计写入和 HTML 导出断言；`scripts/smoke-test.js` 新增 `projectAuditExport`、`projectAuditList` 页面标记。

真实化说明：

- 数据来源：恢复成功后的 `restoreProjectArchive()` 参数、迁移后的档案、选择恢复范围和模型哈希校验结果。
- 写入状态：只在 storage 和 IndexedDB 恢复成功后写入 `mr-calligraphy-project-archive-audit-v1`；哈希失败或恢复失败不会写成功审计。
- 成功反馈：主后台会显示最近恢复记录，点击“导出审计”会生成离线 HTML。
- 失败反馈：没有审计记录时导出按钮禁用，API 导出空报告时会明确显示暂无恢复审计记录。
- 刷新后复现方式：审计日志保存在 localStorage，刷新主后台后仍会显示最近恢复记录。

验收：

- 手工验收：在主后台恢复任意项目档案后刷新页面，恢复审计区域应显示最近恢复记录；点击“导出审计”应得到 HTML 审计报告。
- 脚本验收：`node scripts/archive-migration-check.js` 验证恢复成功后写入审计、审计记录包含恢复 key 和字段级选择数量，并可导出 HTML。

已知限制：

- 当前审计是本机浏览器日志，不是账号级、团队级或服务端不可篡改审计。
- 审计日志不会随项目档案自动导入导出，需要单独导出审计报告。

提交：

- 中文 commit message：`新增项目档案恢复审计`

### 2026-06-11：后台远端发布 API adapter

完成内容：

- 新增共享 `project-remote-publish.js`，定义 `mr-calligraphy-remote-publish-package-v1` 远端发布包。
- 远端发布状态写入 `mr-calligraphy-remote-publish-v1`，按 `mainScene` 和 `realisticScene` 分别保存 endpoint、token、最近检查/推送时间、packageId、releaseId、远端版本和错误。
- 主后台发布面板新增“远端发布 API”折叠区，包含 endpoint、token、“保存远端”“检查远端”“推送发布包”控件。
- 写实后台发布面板使用同一套 adapter 和同名能力，推送 `mr-calligraphy-realistic-published-v1` 当前发布版本。
- 新增 `scripts/remote-publish-check.js`，用 mock `fetch` 验证非 HTTP 地址拒绝、未配置失败、Bearer token、GET 检查、POST 推送、发布包内容和状态持久化。
- smoke test 新增远端发布脚本、页面控件和 `project-remote-publish.js` 加载检查。

真实化说明：

- 数据来源：主后台 `mr-calligraphy-main-scene-published-v1` 和写实后台 `mr-calligraphy-realistic-published-v1` 当前本机发布版本。
- 写入状态：远端 endpoint/token、最近远端 packageId、releaseId、远端版本和错误会写入 `mr-calligraphy-remote-publish-v1`。
- 成功反馈：检查远端会显示服务返回状态；推送成功会显示远端接收消息并记录 packageId；刷新后台后仍能看到最近远端状态。
- 失败反馈：未配置 endpoint、非 HTTP 地址、无本机发布版本、浏览器不支持 `fetch`、HTTP 失败或返回非 JSON 时都明确失败，不显示“已部署上线”。
- 刷新后复现方式：保存远端配置或推送后刷新后台，对应场景的 endpoint 和最近远端发布状态仍保留。

验收：

- 手工验收：在主后台或写实后台先完成一次本机发布，展开“远端发布 API”，保存 HTTP/HTTPS endpoint 后点击“检查远端 / 推送发布包”；服务不可用时应显示具体失败，mock 服务可接收当前发布包。
- 脚本验收：`node scripts/remote-publish-check.js` 验证主后台和写实后台远端发布包、endpoint/token、fetch 检查、POST 推送和状态持久化；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 覆盖页面入口。

提交：

- 中文 commit message：`新增后台远端发布适配`

### 2026-06-11：新增远端发布包 Manifest 摘要

完成内容：

- `MRProjectRemotePublish.createPackage()` 新增 `manifest`，kind 为 `mr-calligraphy-remote-publish-manifest-v1`。
- manifest 包含 `packageDigest`、`recordDigest`、`releaseDigest`、`layoutDigest` 四个稳定 SHA-256 摘要。
- manifest 统计发布布局对象数量、可见对象数量、自定义对象数量、导入模型数量、灯光和图层顺序信息。
- 远端推送成功后，`mr-calligraphy-remote-publish-v1.scenes.*.lastPackageDigest` 会持久化最近发布包摘要。
- 主后台和写实后台更新 `project-remote-publish.js` 缓存版本，刷新后会加载新的 manifest 逻辑。
- `scripts/remote-publish-check.js` 新增 manifest、稳定 digest、POST body manifest 和持久化 digest 断言。

真实化说明：

- 数据来源：当前本机发布记录 `record`、当前 release、release layout 和发布场景信息。
- 写入状态：推送成功后写入远端发布状态中的 `lastPackageDigest`；生成包本身不修改本机发布记录。
- 成功反馈：mock 远端接收发布包时，脚本可验证 POST body 携带 manifest 和 SHA-256 摘要。
- 失败反馈：没有本机发布记录、没有远端 endpoint 或没有 `fetch` 时仍返回明确失败，不生成伪远端成功。
- 刷新后复现方式：远端发布状态保存在 `mr-calligraphy-remote-publish-v1`，刷新后台后仍可读到最近 packageId、releaseId 和 packageDigest。

验收：

- 手工验收：完成一次本机发布并配置远端 API 后推送，服务端收到的 JSON 应包含 `manifest.packageDigest` 等摘要字段。
- 脚本验收：`node scripts/remote-publish-check.js` 验证 manifest、稳定 digest、POST body 和状态持久化。

已知限制：

- 当前摘要用于本机与远端核对发布包内容，不是远端资产签名、账号审批或不可抵赖签章。
- 远端服务是否强制校验 digest 仍取决于用户配置的 API 实现。

提交：

- 中文 commit message：`新增远端发布包摘要`

### 2026-06-11：新增远端发布包预检

完成内容：

- `MRProjectRemotePublish` 新增 `validatePackage(packagePayload)`，可校验远端发布包结构和 manifest 摘要。
- `createPackage()` 会返回 `validation`，只有 manifest、release、record、layout 和摘要一致时才算通过。
- `push()` 在 POST 前重新执行本机预检；预检失败会写入远端发布错误状态，不会把坏包发给远端 API。
- 预检会识别 `packageDigest`、`recordDigest`、`releaseDigest`、`layoutDigest`、对象摘要、sceneId 和 releaseId 不匹配。
- `scripts/remote-publish-check.js` 新增篡改发布包的失败断言，并验证正常推送返回通过的 validation。

真实化说明：

- 数据来源：即将发送的远端发布包、manifest 和当前本机发布记录。
- 写入状态：预检失败只写入 `mr-calligraphy-remote-publish-v1.scenes.*.lastError`；预检通过且远端接收后才写入最近推送状态。
- 成功反馈：正常包会返回 `validation.ok === true` 并继续推送。
- 失败反馈：摘要不匹配、缺少 release、缺少 layout 或 manifest 不一致时返回明确错误，不执行 POST。
- 刷新后复现方式：预检失败写入的错误状态保存在远端发布状态中，刷新后台后仍可看到失败提示。

验收：

- 手工验收：构造或拦截发布包并篡改 manifest 后，调用 `validatePackage()` 应返回失败；正常后台推送仍应先通过预检再 POST。
- 脚本验收：`node scripts/remote-publish-check.js` 验证正常包预检通过、篡改包预检失败、推送结果包含 validation。

已知限制：

- 当前预检在浏览器本机执行，不替代远端服务端校验；生产 API 仍应重新校验 digest。
- 预检本身不包含账号权限、审核流、发布锁或资产签名。

提交：

- 中文 commit message：`新增远端发布包预检`

### 2026-06-11：新增远端发布审核锁

完成内容：

- `MRProjectRemotePublish` 新增本机审核状态和发布锁状态，写入 `mr-calligraphy-remote-publish-v1.scenes.*.review` 与 `lock`。
- 新增 `getWorkflow()`、`requestReview()`、`approveReview()`、`rejectReview()` 和 `unlock()`。
- `push()` 现在必须满足当前发布包已通过审核、发布包摘要与审核记录一致、当前包没有发布锁，才会执行 POST。
- 推送成功后会保留当前发布包的发布锁，防止重复推送同一 release / digest；用户可在后台明确解除发布锁。
- 主后台和写实后台的远端发布面板新增“提交审核 / 通过审核 / 退回审核 / 解除发布锁”控件，并按当前工作流启停“推送发布包”。
- `scripts/remote-publish-check.js` 覆盖未审核阻断、审核中阻断、审核通过放行、推送后锁定、重复推送阻断和解除锁。

真实化说明：

- 数据来源：当前本机发布记录、当前 release、远端发布包 manifest 摘要和本机远端发布工作流状态。
- 写入状态：审核、退回、通过、推送锁和解除锁都会写回 `mr-calligraphy-remote-publish-v1`。
- 成功反馈：审核状态区会显示当前包待审、已审、退回或锁定；推送成功后锁状态刷新并禁用重复推送。
- 失败反馈：未审核、审核记录与当前包不一致、发布包已锁定、缺少本机发布版本时都会返回明确错误，不执行 POST。
- 刷新后复现方式：刷新后台后，审核状态、退回原因、发布锁和最近远端状态仍从本机状态读取。

验收：

- 手工验收：在主后台或写实后台完成本机发布后，远端面板先提交审核再通过审核；未通过审核前“推送发布包”不可用或推送失败；推送成功后再次推送应被发布锁阻断，点击“解除发布锁”后恢复。
- 脚本验收：`node scripts/remote-publish-check.js` 验证审核流、发布锁、远端 POST 和状态持久化。

已知限制：

- 当前审核人与发布锁仍是本机浏览器状态，不是服务端账号、角色权限或不可篡改审批。
- 远端 API 是否二次校验审核状态和锁状态，仍取决于用户配置的服务端实现。
- CDN 发布合同尚未接入；远端资产清单和哈希摘要已在后续功能补齐，但服务端资产签名仍待接入。

提交：

- 中文 commit message：`新增远端发布审核锁`

### 2026-06-11：新增远端发布资产清单

完成内容：

- `model-import-utils.js` 新增 `createArrayBufferSha256()`，主后台和写实后台导入 GLB / OBJ 时会计算并保存模型 SHA-256。
- 导入模型记录和 IndexedDB 模型仓库会保留 `sha256`，后续发布、项目 schema 和项目档案都能读取同一资产哈希。
- `MRProjectRemotePublish.createPackage()` 新增 `assetManifest`，列出当前 release 布局依赖的导入模型资产、文件名、类型、大小和 SHA-256。
- 远端发布 manifest 新增 `assetSummary` 和 `assetDigest`，并把资产清单纳入 `packageDigest`。
- `validatePackage()` 会校验资产摘要、资产统计、资产数量和布局导入模型 ID 是否一致；缺哈希资产会给出预检警告。
- `scripts/remote-publish-check.js` 新增资产清单、资产摘要、资产 SHA-256、资产篡改失败和缺哈希警告断言。

真实化说明：

- 数据来源：主后台 / 写实后台导入模型的真实文件 ArrayBuffer、当前本机发布 release 布局和模型记录。
- 写入状态：新导入模型的 `sha256` 会写入本机布局记录与 IndexedDB；远端发布包生成时不额外写状态，只把资产清单放进发布包。
- 成功反馈：远端发布包包含 `assetManifest.assets`、`manifest.assetSummary` 和 `manifest.assetDigest`，mock 远端可接收并校验。
- 失败反馈：资产清单被篡改、资产摘要不匹配、资产数量与布局不一致时预检失败；缺哈希资产不阻止本机发布包生成，但会返回明确 warning。
- 刷新后复现方式：新导入模型哈希保存在本机布局和 IndexedDB；刷新后台、本机发布后重新生成远端发布包仍能得到同一资产 SHA-256。

验收：

- 手工验收：导入 GLB / OBJ 后完成本机发布，在控制台调用 `MRProjectRemotePublish.createPackage()`，应看到 `assetManifest.assets[0].sha256`；篡改 `assetManifest` 后 `validatePackage()` 应失败。
- 脚本验收：`node scripts/remote-publish-check.js` 验证资产清单、资产摘要、缺哈希 warning 和资产篡改失败。

已知限制：

- 旧的本机导入模型如果没有重新导入或没有通过项目档案刷新，可能缺少 SHA-256；系统会警告但不阻断发布包生成。
- 当前资产哈希是浏览器本机计算的 SHA-256，不是远端服务端签名，也不包含 CDN 上传或资产托管。

提交：

- 中文 commit message：`新增远端发布资产清单`

### 2026-06-12：远端发布服务端合同与 mock 服务

完成内容：

- 新增 `docs/remote-publish-api-contract.md`，明确远端发布 `GET` 检查、`POST` 发布、Authorization、发布包字段、manifest 摘要、成功回执和失败状态码。
- 新增 `scripts/remote-publish-mock-server.js`，使用 Node 标准库启动本地 HTTP mock 服务，不依赖 npm 包。
- mock 服务会返回 `mr-calligraphy-remote-publish-contract-v1` 合同、`mr-calligraphy-remote-publish-receipt-v1` 回执，并重新校验 package、manifest、assetManifest、packageDigest、layoutDigest 和 assetDigest。
- mock 服务支持可选 Bearer token，并会拒绝 token 不匹配、摘要不匹配、资产清单不匹配和重复 packageDigest。
- mock 服务会对带 SHA-256 的模型 / 贴图资产返回 HMAC-SHA256 开发签名回执；缺哈希资产只保留 warning，不生成假签名。
- `scripts/remote-publish-check.js` 新增真实 HTTP mock server 验收，覆盖 GET 检查、POST 推送、回执、重复摘要拒绝和远端状态持久化。
- `scripts/smoke-test.js` 把远端发布 mock server 纳入语法检查。

真实化说明：

- 数据来源：后台当前本机发布包、manifest 摘要、资产清单和本地 mock server 内存 receipt。
- 写入状态：前端 adapter 仍写入 `mr-calligraphy-remote-publish-v1`；mock server 记录 receipt、packageDigest 和重复发布状态。
- 成功反馈：mock server 返回远端版本、packageId、releaseId、packageDigest、receiptDigest 和资产签名摘要；adapter 会把远端版本、packageId 和资产签名回执写回本机远端发布状态。
- 失败反馈：HTTP 401、409、422 和 500 会返回结构化 JSON，不显示部署成功。
- 刷新后复现方式：本机 adapter 的最近远端状态可刷新读取；mock server receipt 是临时测试服务内存状态，用于本地验收。

验收：

- 手工验收：运行 `node scripts/remote-publish-mock-server.js`，在主后台或写实后台配置输出的 endpoint，完成本机发布、审核通过后推送，应看到 mock server 返回回执。
- 脚本验收：`node scripts/remote-publish-check.js` 会启动临时 mock server，验证真实 HTTP GET/POST、Bearer token、receipt 和重复 digest 拒绝；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查新脚本语法。

已知限制：

- mock server 是开发验收工具，不提供持久化数据库、账号权限、CDN 上传或生产审计。
- 当前资产签名是 mock/HMAC 开发验收回执；账号权限、生产证书签名和不可篡改审计仍需要生产服务实现。
- 当前前端 adapter 读取 `message`、`packageId` 和 `remoteVersion`，完整 receipt 主要用于 mock server 和服务端合同验收。

提交：

- 中文 commit message：`新增远端发布mock服务`

### 2026-06-12：远端计划仓库合同与 mock 服务

完成内容：

- 新增 `docs/plan-repository-api-contract.md`，明确远端计划仓库 `GET` 检查/拉取、`PUT` 推送、`OPTIONS` 跨端口预检、Authorization、计划包字段、成功回执和失败状态码。
- 新增 `scripts/plan-repository-mock-server.js`，使用 Node 标准库启动本地 HTTP mock 服务，不依赖 npm 包。
- mock 服务会返回 `mr-calligraphy-plan-repository-contract-v1` 合同、`mr-calligraphy-plan-repository-receipt-v1` 回执，并校验计划包 kind、version、packageId、summary、plans 和计划项字段。
- mock 服务支持可选 Bearer token 和浏览器跨端口 CORS 预检，便于直接在前台远端计划 API 面板配置使用。
- `scripts/learning-state-check.js` 新增真实 HTTP mock server 验收，覆盖 GET 检查、PUT 推送、最近计划包拉取、回执 digest 和错误 token 拒绝。
- `scripts/smoke-test.js` 把计划仓库 mock server 纳入语法检查。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.plans` 生成的 `mr-calligraphy-plan-repository-v1` 同步包。
- 写入状态：前端 adapter 仍写入本机 `planRepository` 状态；mock server 在内存里保存最近计划包和 receipt。
- 成功反馈：mock server 返回远端版本、服务端 packageId、repositoryDigest 和 receiptDigest；adapter 会把远端 packageId、计划数量和同步方向写回本机状态。
- 失败反馈：HTTP 401、404、405、422 和 500 会返回结构化 JSON，不显示同步成功。
- 刷新后复现方式：前端保存的 endpoint、最近同步方向和远端状态可刷新读取；mock server 内存状态只用于本地开发验收。

验收：

- 手工验收：运行 `node scripts/plan-repository-mock-server.js`，在前台计划同步面板配置输出的 endpoint，生成学习计划后点击“检查远端 / 推送计划 / 拉取计划”，应看到真实 HTTP 状态和同步结果。
- 脚本验收：`node scripts/learning-state-check.js` 会启动临时 mock server，验证真实 HTTP GET/PUT、Bearer token、receipt 和错误 token 拒绝；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查新脚本语法。

已知限制：

- mock server 是开发验收工具，不提供持久化数据库、账号权限、教师端排课、远端推送提醒或服务端合并审计。
- 当前冲突解决已补前端字段级合并第一版，后续需要服务端版本、计划项增删合并审计和账号空间隔离。
- 跨设备提醒目前只能同步计划数据，提醒仍由各设备本机浏览器处理。

提交：

- 中文 commit message：`新增计划仓库mock服务`

### 2026-06-12：远端学习档案仓库合同与 mock 服务

完成内容：

- 新增 `docs/history-repository-api-contract.md`，明确远端学习档案仓库 `GET` 检查/拉取、`PUT` 推送、`OPTIONS` 跨端口预检、Authorization、档案包字段、成功回执、同 ID 差异策略和失败状态码。
- 新增 `scripts/history-repository-mock-server.js`，使用 Node 标准库启动本地 HTTP mock 服务，不依赖 npm 包。
- `MRAppState` 新增学习档案仓库状态、同步包生成/导入、远端配置、GET 检查、PUT 推送和 GET 拉取接口。
- 前台学习档案面板新增档案仓库状态、“导出同步包 / 导入同步包”和“远端学习档案 API” endpoint/token/检查/推送/拉取入口。
- 拉取远端档案时，同 ID 且内容不同的记录会跳过并记录冲突数量，不静默覆盖本机练习、作品或报告。
- 远端返回分页元数据时，前台检查会提示仍有后续页面；点击拉取时会沿 `pagination.nextPageUrl` 或顶层 `nextPageUrl` 自动追取后续页并合并导入。
- `scripts/learning-state-check.js` 新增真实 HTTP mock server 验收，覆盖 GET 检查、PUT 推送、最近档案包拉取、同 ID 差异跳过、回执 digest 和错误 token 拒绝。
- `scripts/smoke-test.js` 把学习档案仓库 mock server 和前台档案仓库控件纳入检查。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.sessions/artworks/reports` 生成的 `mr-calligraphy-history-repository-v1` 同步包。
- 写入状态：远端配置、最近同步方向、远端记录数、最近 packageId、跳过冲突数量和错误写入 `historyRepository`。
- 成功反馈：mock server 返回远端版本、服务端 packageId、repositoryDigest 和 receiptDigest；前台状态条显示最近推送/拉取结果。
- 失败反馈：HTTP 401、404、405、422、500 和网络中断都会返回明确错误，不显示同步成功；分页循环或超过 20 页会停止追取并给出警告；同 ID 差异不会覆盖本机。
- 刷新后复现方式：前端保存的 endpoint、最近同步方向、跳过冲突数量和远端状态可刷新读取；mock server 内存状态只用于本地开发验收。

验收：

- 手工验收：运行 `node scripts/history-repository-mock-server.js`，在前台学习档案面板配置输出的 endpoint，产生练习/作品/报告后点击“检查远端 / 推送档案 / 拉取档案”，应看到真实 HTTP 状态和同步结果。
- 脚本验收：`node scripts/learning-state-check.js` 会启动临时 mock server，验证真实 HTTP GET/PUT、Bearer token、receipt、同 ID 差异跳过和错误 token 拒绝；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查新脚本语法和页面控件。
- 浏览器验收：`npm run test:e2e -- --grep "history repository handles network"` 覆盖网络中断、分页检查提示、拉取自动追取第二页和同 ID 差异跳过；全量 `npm run test:e2e` 当前 11 条用例全部通过。

已知限制：

- mock server 是开发验收工具，不提供持久化数据库、账号权限、生产级分页查询、教师批注审计、公开作品墙或长期归档。
- 当前同 ID 差异会跳过并保存本机冲突审计，可字段级合并、另存远端副本或忽略审计；后续需要账号化服务端版本、服务端字段级 merge、服务端审计签名、服务端游标重试和空间隔离。
- 学习档案远端同步仍由用户自配 HTTP endpoint 驱动，不是内置云服务。

提交：

- 中文 commit message：`新增学习档案远端仓库`

### 2026-06-12：学习档案分页冲突浏览器验收

完成内容：

- `app-state.js` 将学习档案远端检查、推送、拉取的 fetch 异常统一转成中文“网络请求异常”，并保留底层错误细节。
- `parseRemoteHistoryRepositoryResponse()` 识别 `pagination.hasMore`、`pagination.nextPageUrl` 和顶层 `nextPageUrl`，在状态文案里提示后续页面。自动追取已在下一功能补齐。
- `tests/e2e/real-flows.spec.js` 新增 `front history repository handles network, paged pull, and id conflicts`。
- E2E 通过真实前台面板配置 endpoint/token，覆盖 GET 网络中断、分页远端包检查、分页远端包拉取和同 ID 差异跳过。
- E2E 确认远端新增记录写入本机，同 ID 差异记录不覆盖本机反馈，`lastSkippedConflictCount` 写入 localStorage。

真实化说明：

- 数据来源：本机真实练习/作品生成的学习档案同步包、同源模拟远端分页响应和实际 Authorization header。
- 写入状态：网络失败写入 `historyRepository.lastError`；分页检查写入 `lastRemoteStatus`；冲突拉取写入 `lastSkippedConflictCount`。
- 成功反馈：分页检查明确提示还有后续页面；拉取成功提示新增和跳过冲突数量。
- 失败反馈：网络中断不会显示同步成功；同 ID 差异不会覆盖本机记录。
- 刷新后复现方式：分页状态、错误和跳过冲突数量保存在 `mr-calligraphy-learning-state-v1.historyRepository`。

验收：

- 手工验收：配置一个会断开的 endpoint 应显示网络请求异常；配置一个返回分页包且包含同 ID 差异的 endpoint，应提示分页并在拉取时跳过冲突。
- 脚本验收：`npm run test:e2e -- --grep "history repository handles network"` 覆盖网络中断、分页提示和同 ID 差异跳过。

已知限制：

- 该阶段同 ID 差异不提供字段级合并 UI；自动追取下一页和冲突审计已在后续功能补齐。

提交：

- 中文 commit message：`新增学习档案分页冲突验收`

### 2026-06-12：学习档案分页自动追取

完成内容：

- `app-state.js` 新增学习档案分页对象解析，支持 `pagination.nextPageUrl` 和顶层 `nextPageUrl`。
- `pullHistoryRepositoryFromRemote()` 会从远端 endpoint 开始，自动 GET 后续分页，最多追取 20 页，并用已访问 URL 防止循环。
- 多页返回的练习、作品和报告记录会合并导入；同 ID 差异仍跳过，不覆盖本机记录。
- 拉取状态会记录实际处理记录数、页数、新增数量和跳过冲突数量。
- `tests/e2e/real-flows.spec.js` 将分页场景升级为两页响应，断言第二页请求真实发生且继续携带 Bearer token。

真实化说明：

- 数据来源：远端学习档案 API、分页响应里的 `nextPageUrl`、真实本机学习档案状态和实际 GET 请求。
- 写入状态：多页新增记录写入 `mr-calligraphy-learning-state-v1.sessions/artworks/reports`，同步状态写入 `historyRepository`。
- 成功反馈：拉取提示显示“2 页”、新增数量和跳过冲突数量。
- 失败反馈：网络异常、错误响应、分页循环或超过 20 页会停止追取并给出明确状态，不会显示假成功。
- 刷新后复现方式：导入记录、最近远端状态和冲突跳过数量保存在 `mr-calligraphy-learning-state-v1`。

验收：

- 手工验收：配置一个返回 `pagination.nextPageUrl` 的远端学习档案 endpoint，点击“拉取档案”后应请求下一页并导入第二页记录。
- 脚本验收：`npm run test:e2e -- --grep "history repository handles network"` 覆盖网络中断、分页检查提示、第二页自动追取和同 ID 差异跳过。

已知限制：

- 自动追取是前端 adapter 的分页消费能力，不等同账号化托管仓库；冲突审计和字段级合并是本机记录，不等同服务端不可篡改审计；仍缺服务端游标重试、服务端合并审计和长期归档。

提交：

- 中文 commit message：`新增学习档案分页自动追取`

### 2026-06-12：学习档案冲突审计

完成内容：

- `app-state.js` 在学习档案同步包导入和远端拉取时记录同 ID 差异冲突审计。
- 冲突审计保存类型、ID、本机/远端标题、更新时间、字段差异摘要和远端记录快照。
- 新增 `MRAppState.getHistoryRepositoryConflicts()` 和 `resolveHistoryRepositoryConflict()`。
- 前台“远端学习档案 API”区域新增“学习档案冲突审计”面板，列出冲突字段。
- 用户可点击“另存远端副本”把远端冲突记录保存为新的本机档案；也可点击“忽略审计”清掉审计项。
- 远端冲突处理始终不覆盖原本机记录。

真实化说明：

- 数据来源：真实同步包里的远端记录、本机已有同 ID 记录和字段级差异摘要。
- 写入状态：冲突写入 `mr-calligraphy-learning-state-v1.historyRepository.lastConflictRecords`；另存副本写入对应的 `sessions/artworks/reports`。
- 成功反馈：前台显示冲突审计列表，处理后显示副本保存或忽略结果，并刷新学习档案列表。
- 失败反馈：无匹配冲突或未知处理方式时返回明确失败，不修改本机档案。
- 刷新后复现方式：冲突审计和处理后的副本都保存在本机学习状态。

验收：

- 手工验收：配置一个返回同 ID 差异记录的远端学习档案 endpoint，点击“拉取档案”后应出现冲突审计；点击“另存远端副本”后应新增一条带“远端副本”的本机记录。
- 脚本验收：`node scripts/learning-state-check.js` 覆盖冲突审计和远端冲突另存副本；`npm run test:e2e -- --grep "history repository handles network"` 覆盖前台冲突审计面板和按钮路径。

已知限制：

- 当前支持审计、另存副本、忽略审计和本机字段级合并；还没有服务端审计签名或账号空间隔离。

提交：

- 中文 commit message：`新增学习档案冲突审计`

### 2026-06-12：学习档案字段级冲突合并

完成内容：

- `MRAppState.resolveHistoryRepositoryConflict("merge-fields", { conflictId, selections })` 新增字段级合并策略。
- 冲突面板中的差异字段升级为本机/远端单选表单，默认保留本机字段。
- 点击“应用字段合并”后，只把用户选择的远端字段写回同 ID 本机练习、作品或报告。
- 合并完成后清理对应 `historyRepository.lastConflictRecords`，并写入本机同步状态和事件日志。
- 数据层验收同时覆盖字段级合并和远端冲突另存副本；浏览器验收覆盖只采用远端反馈字段、本机评分保留的路径。

真实化说明：

- 数据来源：本机同 ID 档案、远端冲突记录快照和用户在前台冲突面板里的字段选择。
- 写入状态：合并结果写入 `mr-calligraphy-learning-state-v1.sessions/artworks/reports`；冲突处理状态写入 `historyRepository.lastRemoteStatus`、`lastSkippedConflictCount` 和 `lastConflictRecords`。
- 成功反馈：页面提示“字段合并”，冲突面板关闭，档案列表和学习摘要刷新。
- 失败反馈：没有匹配冲突或本机同 ID 记录不存在时返回明确失败，不伪造合并成功。
- 刷新后复现方式：字段合并后的本机档案保存在 localStorage，冲突审计清理状态也持久化。

验收：

- 手工验收：拉取同 ID 差异后，在冲突审计里选择某个远端字段并点击“应用字段合并”，应只更新被选择字段。
- 脚本验收：`node scripts/learning-state-check.js` 覆盖远端标题字段合并；`npm run test:e2e -- --grep "history repository handles network"` 覆盖前台反馈字段合并。

已知限制：

- 当前是本机字段级合并，不是服务端版本合并或不可篡改审计。
- 复杂数组深层合并、服务端签名、账号空间隔离和长期归档仍待后续实现。

提交：

- 中文 commit message：`新增学习档案字段级合并`

### 2026-06-11：学习计划自动同步队列

完成内容：

- `planRepository` 新增 `autoSyncEnabled`、`pendingAutoSync`、`pendingReason`、`pendingPlanCount`、`lastAutoSyncAt`、`lastSyncConflictCount` 和冲突计划 ID 等字段。
- 学习计划生成、勾选、编辑、新增、排序、删除、顺延、复盘、生成下周期和导入同步包后，都会写入 `updatedAt` 并进入待自动同步队列。
- 保存远端计划 API 后默认开启自动同步；浏览器页面环境下有待同步变更时会短延迟调用同步队列 flush。
- 前台“推送计划”按钮在存在待同步队列时显示为“同步队列”，点击会调用 `flushPlanRepositoryAutoSync()` 推送当前本机计划包。
- `pullPlanRepositoryFromRemote()` 拉取远端包前会比较本机待同步计划和远端计划的 `updatedAt` 与内容摘要，发现双方都在最近同步后改动时返回冲突，不会静默覆盖本机计划。
- 学习状态检查新增自动同步队列和冲突检测验收，覆盖本机修改进入队列、推送清队列、冲突拉取不覆盖本机计划项、flush 成功后清理冲突状态。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.plans`、每份计划的 `updatedAt` 和 `planRepository` 远端配置。
- 写入状态：本机计划变更会写入待同步队列；成功推送会清空 `pendingAutoSync` 并记录自动同步时间；冲突拉取会记录冲突数量和计划 ID。
- 成功反馈：前台同步按钮文案从“推送计划”变成“同步队列”，状态条显示待同步数量；flush 成功后恢复为普通推送状态。
- 失败反馈：未配置远端时提示等待远端 API；远端与本机待同步计划冲突时返回明确冲突，不显示拉取成功。
- 刷新后复现方式：计划 `updatedAt`、待同步状态、冲突状态和自动同步时间都持久化在学习状态中。

验收：

- 手工验收：生成学习计划并修改计划项后，远端同步状态应显示待同步；配置 endpoint 后点击“同步队列”应向远端发起真实 PUT；若远端同计划也改动，拉取时应提示冲突而不是覆盖本机计划。
- 脚本验收：`node scripts/learning-state-check.js` 会验证自动同步队列、冲突检测和冲突拉取不覆盖本机待同步计划项。

已知限制：

- 自动同步目前仍依赖用户配置的远端 HTTP endpoint，没有内置账号系统或托管计划服务。
- 冲突解决入口已在后续功能补齐；当前仍缺账号化服务端合并审计。
- 浏览器定时同步是页面打开期间的本机调度，不是 Service Worker 或服务端推送。

提交：

- 中文 commit message：`新增学习计划自动同步队列`

### 2026-06-12：学习计划冲突解决入口

完成内容：

- `planRepository` 冲突状态新增 `lastSyncConflicts` 和 `lastSyncConflictPlans`，会持久化冲突详情和远端冲突计划快照。
- 新增 `MRAppState.resolvePlanRepositoryConflict()`，支持三种真实处理方式：`keep-local` 推送本机计划、`use-remote` 强制采用远端计划、`copy-remote` 将远端冲突计划另存为新的本机副本。
- 前台远端 API 同步面板新增“计划同步冲突”区域，冲突时显示本机标题、远端标题和双方更新时间。
- 前台新增“保留本机”“采用远端”“另存副本”三个按钮，不再只让用户看到冲突错误。
- 学习状态检查新增冲突另存副本断言，确认另存远端副本不会覆盖本机待同步计划项，并会重新进入待同步队列。

真实化说明：

- 数据来源：远端拉取返回的计划同步包、本机计划 `updatedAt` 和本机 `planRepository` 冲突快照。
- 写入状态：冲突详情和远端计划快照写入 `mr-calligraphy-learning-state-v1.planRepository`；另存副本会新增计划 ID 并进入待同步队列；保留本机会走真实远端 PUT；采用远端会强制拉取远端计划。
- 成功反馈：冲突面板列出具体计划；处理成功后面板消失，计划历史、同步状态和学习摘要刷新。
- 失败反馈：没有冲突、没有远端快照、远端 API 不可用或推送/拉取失败时都会返回明确错误，不伪装同步成功。
- 刷新后复现方式：冲突详情和远端冲突计划快照持久化在学习状态中，刷新后仍可展示冲突处理入口。

验收：

- 手工验收：制造本机待同步计划和远端同 ID 计划冲突后，前台远端 API 同步面板应显示冲突区域；点击“另存副本”后计划历史新增“远端副本”，原本机计划项不被覆盖。
- 脚本验收：`node scripts/learning-state-check.js` 会验证冲突详情、另存副本、不覆盖本机待同步计划项和重新进入待同步队列；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查冲突面板和三个处理按钮。

已知限制：

- “采用远端”会重新请求当前远端 endpoint，因此如果远端包已经变化，会采用最新远端返回结果。
- 仍未接入账号化计划仓库、远端推送提醒、教师端通知或服务端合并审计。
- 当前冲突解决已从计划级推进到计划项字段级合并第一版，后续可继续细化到计划项增删、依赖调整和服务端审计。

提交：

- 中文 commit message：`新增学习计划冲突解决入口`

### 2026-06-12：计划仓库推送失败浏览器验收

完成内容：

- `app-state.js` 将计划仓库检查、推送、拉取的 fetch 异常统一转成中文“网络请求异常”，同时保留底层错误细节。
- `tests/e2e/real-flows.spec.js` 新增 `front plan repository keeps pending queue on push failures`。
- E2E 模拟远端 PUT 422 拒收，确认 `#noticeState`、`#planRepositorySummary` 和 `planRepository.lastError` 都显示 HTTP 422。
- E2E 模拟 PUT 网络中断，确认页面和本机状态都显示网络请求异常。
- E2E 同时断言 Authorization header、同步包 kind、计划数量和计划 ID，确认是真实 PUT 请求。
- 推送失败后会继续保留本机计划和 `pendingAutoSync`，不会把失败误判为已同步。

真实化说明：

- 数据来源：真实本机计划、真实前台计划同步面板、同源模拟远端失败和实际 PUT body。
- 写入状态：失败写入 `mr-calligraphy-learning-state-v1.planRepository.lastError`，但保留 `pendingAutoSync`、本机计划和待同步原因。
- 成功反馈：本轮不新增成功反馈，重点是推送失败不能假成功。
- 失败反馈：HTTP 422 和网络中断都会展示在页面通知与计划仓库摘要中。
- 刷新后复现方式：错误与待同步状态都保存在 `mr-calligraphy-learning-state-v1.planRepository`。

验收：

- 手工验收：配置一个会拒收 PUT 或断开的计划仓库 endpoint，点击“推送计划/同步队列”，页面应显示失败且待同步状态保留。
- 脚本验收：`npm run test:e2e -- --grep "keeps pending queue on push failures"` 覆盖 422 和网络中断；全量 `npm run test:e2e` 当前 11 条用例全部通过。

已知限制：

- 请求超时、失败历史和重试队列恢复已在后续补齐；仍缺批量队列部分失败恢复、账号化服务端合并审计和远端提醒。

提交：

- 中文 commit message：`新增计划推送失败验收`

### 2026-06-11：远端计划 API adapter

完成内容：

- `planRepository` 状态新增远端 endpoint、token、最近远端同步时间、同步方向、远端计划数量和远端状态文案。
- 新增 `MRAppState.configurePlanRepositoryRemote()` 和 `getPlanRepositoryRemoteConfig()`，可保存或清除远端计划 API 配置。
- `MRAppState.checkRemotePlanRepository()` 在配置 endpoint 后会真实调用 `fetch` GET 检查远端计划包；未配置、无 `fetch` 或返回格式错误时给出明确失败。
- 新增 `MRAppState.pushPlanRepositoryToRemote()`，把当前本机计划仓库以稳定 JSON 包通过 PUT 推送到远端。
- 新增 `MRAppState.pullPlanRepositoryFromRemote()`，从远端 GET 拉取计划包并复用导入逻辑合并到本机计划历史。
- 前台学习计划面板新增“远端 API 同步”折叠区，包含 endpoint、token、“保存远端”“检查远端”“推送计划”“拉取计划”控件。
- 学习状态检查新增 mock `fetch` 验收，覆盖 token header、远端检查、PUT 推送包、GET 拉取包、导入远端计划和远端状态持久化。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.plans`、`planRepository` 和用户配置的 HTTP/HTTPS endpoint。
- 写入状态：保存 endpoint/token、远端检查结果、最近推送/拉取方向、远端计划数量、远端 packageId 和导入后的计划历史。
- 成功反馈：检查远端会显示远端计划数量；推送会记录远端接收的 packageId；拉取会新增或更新计划并刷新计划历史、依赖图和学习摘要。
- 失败反馈：未配置 endpoint、非 HTTP 地址、浏览器不支持 `fetch`、网络异常、HTTP 失败或远端 JSON 格式错误时都返回明确失败，不显示云端同步成功。
- 刷新后复现方式：保存远端配置、推送或拉取后刷新前台，远端 endpoint、最近同步方向和导入计划仍从本机状态读取。

验收：

- 手工验收：生成学习计划，展开“远端 API 同步”；保存 HTTP/HTTPS endpoint 后“推送计划”可用，点击检查/推送/拉取会对该 endpoint 发起真实请求，失败时显示具体错误。
- 脚本验收：`node scripts/learning-state-check.js` 会用 mock `fetch` 验证远端配置、检查、推送、拉取和状态持久化；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台远端同步控件。

提交：

- 中文 commit message：`新增远端计划同步适配`

### 2026-06-11：学习计划同步仓库边界

完成内容：

- `MRAppState` 新增 `planRepository` 状态，记录同步模式、最近导出/导入时间、同步包 ID、计划数量和远端未配置错误。
- 新增 `MRAppState.getPlanRepositoryStatus()`，返回本机计划数量、远端是否配置、状态文案和同步边界。
- 新增 `MRAppState.getPlanRepositoryPackage()` 和 `downloadPlanRepository()`，可导出 `mr-calligraphy-plan-repository-*.json` 同步包。
- 新增 `MRAppState.importPlanRepositoryPackage()`，可导入同步包并按计划 ID 合并新增/更新计划。
- 新增 `MRAppState.checkRemotePlanRepository()`，在没有远端端点时明确返回未配置，不伪造云端同步成功。
- 前台学习计划面板新增同步仓库状态条、“导出同步包”“导入同步包”和“检查远端”入口。
- 学习状态检查新增同步包 kind、导入新增计划、远端未配置失败和状态持久化断言。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.plans` 和 `planRepository`。
- 写入状态：导出会写入最近导出时间和包 ID；导入会合并计划并写入最近导入状态；远端检查会写入未配置错误。
- 成功反馈：同步包下载为真实 JSON 文件；导入后计划历史、依赖图和学习摘要刷新。
- 失败反馈：无计划、JSON 无效、同步包 kind 不匹配或远端未配置时返回明确错误，不伪造云端同步。
- 刷新后复现方式：导入同步包后刷新前台，计划历史仍保留导入的计划；同步状态仍显示最近导入或远端未配置状态。

验收：

- 手工验收：生成计划后点击“导出同步包”应下载 JSON；点击“导入同步包”选择该 JSON 后，状态条应显示导入结果；点击“检查远端”应提示尚未配置远端 repository。
- 脚本验收：`node scripts/learning-state-check.js` 会验证同步包生成、导入和远端未配置边界；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台同步入口。

提交：

- 中文 commit message：`新增学习计划同步仓库`

### 2026-06-11：学习档案编辑表单化

完成内容：

- 前台新增 `historyRenameDialog` 学习档案重命名表单，替换历史记录重命名的 `window.prompt()`。
- 前台新增 `artworkTagsDialog` 作品标签编辑表单，替换作品集标签编辑的 `window.prompt()`。
- 两个表单都会在保存失败时留在弹层内显示错误，成功后关闭弹层并刷新学习档案、复盘区和作品集。
- `script.js` 中已不再包含 `window.prompt()`，避免继续出现临时浏览器弹窗式假交互。
- smoke test 前台页面新增 `historyRenameDialog`、`historyRenameTitleInput`、`artworkTagsDialog` 和 `artworkTagsInput` 标记，控件清单确认前台静态控件为 43 个 `real-local`、10 个 `real-export`。

真实化说明：

- 数据来源：当前学习档案详情和作品集卡片对应的本机记录。
- 写入状态：重命名写入 `mr-calligraphy-learning-state-v1` 中对应练习、作品或报告标题；标签编辑写入对应作品的 `tags`。
- 成功反馈：学习档案列表、详情标题、作品标签和复盘区即时刷新；刷新后仍能读取新标题或新标签。
- 失败反馈：未选中记录、作品不存在、标题过短或写入失败时在表单里显示错误，不写状态。
- 刷新后复现方式：保存标题或标签后刷新前台，学习档案详情和作品集仍显示更新后的内容。

验收：

- 手工验收：打开任一学习档案详情，点击“重命名”应打开表单；保存后详情标题与列表同步更新。打开作品集卡片，点击“标签”应打开表单；保存后标签云和作品详情同步更新。
- 脚本验收：`rg -n "window\\.prompt" script.js` 不应返回结果；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台表单 DOM 标记。

提交：

- 中文 commit message：`新增学习档案编辑表单`

### 2026-06-11：学习计划项表单编辑

完成内容：

- 前台新增 `planItemDialog` 计划项表单弹层，新增和编辑计划项共用同一套标题、说明、到期、提醒和复盘动作控件。
- “新增计划项”和计划项“编辑”不再使用连续 `window.prompt()`，保存会调用现有 `MRAppState.addPlanItem()` 或 `updatePlanItem()`。
- 表单提交前会校验标题长度和提醒/到期日期顺序；保存失败会留在弹层内显示错误，不再伪装成功。
- 成功保存后会关闭弹层、刷新计划列表、依赖图、场景文案和学习摘要。
- smoke test 前台页面新增 `planItemDialog` 和 `planItemTitleInput` 标记，控件清单确认前台静态控件为 39 个 `real-local`、10 个 `real-export`。

真实化说明：

- 数据来源：当前选中的本机计划和计划项。
- 写入状态：新增写入 `mr-calligraphy-learning-state-v1.plans[].items[]`；编辑写回对应计划项的标题、说明、排期和复盘动作。
- 成功反馈：计划列表、计划依赖图和学习摘要即时刷新，刷新页面后仍能读取保存后的计划项。
- 失败反馈：缺少计划、找不到任务、标题过短或日期不合法时在表单中显示错误，不写状态。
- 刷新后复现方式：保存计划项后刷新前台，计划历史仍保留新增或编辑后的任务项。

验收：

- 手工验收：生成计划后点击“新增计划项”或“编辑”，应打开表单弹层；输入内容保存后列表立即更新；非法日期应留在弹层内提示。
- 脚本验收：`node scripts/control-inventory.js --check` 会检查新增表单按钮状态；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台表单 DOM 标记。

提交：

- 中文 commit message：`新增计划项表单编辑`

### 2026-06-11：学习计划提醒服务边界

完成内容：

- `MRAppState` 新增 `planReminderService` 本机提醒服务状态，保存浏览器通知支持情况、权限、启用状态、最近检查时间、最近触发计划和触发指纹。
- 新增 `MRAppState.getPlanReminderServiceStatus(planId)`，可返回浏览器 Notification 支持情况、权限状态、页面内提醒 fallback、当前计划提醒摘要和边界说明。
- 新增 `MRAppState.setPlanReminderServicePreference(enabled, planId)` 与 `requestPlanReminderPermission(planId)`，会真实调用浏览器通知权限请求，并把结果写入本机状态。
- 新增 `MRAppState.dispatchPlanReminderNotification(planId)`，页面打开时如存在到点或逾期计划项，会触发一次本机浏览器通知，并避免同一条提醒重复弹出。
- 前台学习计划面板新增本机提醒状态条和“启用本机提醒 / 触发本机提醒”按钮。
- smoke test 前台页面新增 `planReminderServiceSummary` 和 `planReminderPermissionButton` 标记；学习状态检查新增不支持 Notification、已授权、启用、触发通知和重复触发保护断言。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.planReminderService`、浏览器 `Notification.permission` 和当前计划项提醒状态。
- 写入状态：请求权限、启用提醒、触发通知都会写入本机提醒服务状态。
- 成功反馈：前台状态条显示授权/启用/页面内提醒边界；到点或逾期计划项会真实调用浏览器 Notification。
- 失败反馈：浏览器不支持、权限被拒绝、没有计划或没有到点计划项时返回明确提示，不伪造云端推送。
- 刷新后复现方式：刷新后会继续读取本机提醒服务状态；同一条已触发提醒不会重复打扰。

验收：

- 手工验收：生成计划后点击“启用本机提醒”，浏览器应请求通知权限；授权后状态条显示已启用，本机提醒仍明确说明不是云端推送或跨设备提醒。
- 脚本验收：`node scripts/learning-state-check.js` 会验证提醒服务边界、启用、Notification 调用和重复触发保护；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台提醒服务入口。

提交：

- 中文 commit message：`新增学习计划提醒边界`

### 2026-06-11：学习计划周期循环

完成内容：

- `Plan` 新增 `cycleRule` 周期规则，包含间隔天数、当前轮次、下一周期建议时间、上一周期和下一周期关联。
- `MRAppState.getPlanCycleStatus(planId)` 新增可测试接口，会返回周期轮次、完成度、是否可生成下一周期和状态摘要。
- `MRAppState.createNextPlanCycle(planId)` 新增真实状态写入，会在本周期全部计划项完成后创建下一轮计划。
- 下一周期计划会重置完成、复盘和顺延状态，重新安排到期/提醒时间，并保留原任务结构和依赖链。
- 前台学习计划面板新增周期摘要和“生成下周期”按钮；未完成本周期时按钮禁用。
- 学习计划离线 HTML 导出新增周期摘要。
- smoke test 前台页面新增 `planCycleSummary` 和 `planNextCycleButton` 标记，学习状态检查新增周期循环断言。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.plans[].cycleRule` 和计划项完成状态。
- 写入状态：生成下周期会追加一份新计划，并在源计划 `cycleRule.generatedNextPlanId` 写入下一周期 ID。
- 成功反馈：前台切换到新周期计划，计划历史新增一项，任务完成和复盘状态重置。
- 失败反馈：没有计划、计划未完成或已生成过下一周期时返回明确提示，不伪造循环成功。
- 刷新后复现方式：刷新后计划历史仍保留源计划和下一周期；源计划显示已生成下一周期，新计划显示第 2 轮。

验收：

- 手工验收：生成学习计划并完成全部计划项后，“生成下周期”按钮应可用；点击后计划历史新增第 2 轮，任务均为未完成，依赖图仍保留。
- 脚本验收：`node scripts/learning-state-check.js` 会验证未完成时不能生成、完成后可生成、下一周期重置状态并保留依赖链；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台周期入口。

提交：

- 中文 commit message：`新增学习计划周期循环`

### 2026-06-11：学习计划任务依赖图

完成内容：

- `PlanItem` 新增 `dependsOn` 依赖字段；旧计划读取时会按任务顺序自动补默认依赖。
- 自动生成的学习计划会写入明确依赖链：首次临摹、任务复盘、弱项补强、作品、报告依次推进。
- `MRAppState.getPlanDependencyGraph(planId)` 新增可测试接口，会返回节点、依赖边、阻塞数、待复盘数和摘要。
- 前台学习计划面板新增依赖图，点击依赖节点会定位并高亮对应计划项。
- 学习计划离线 HTML 导出新增依赖摘要和每个任务的依赖来源。
- smoke test 前台页面新增 `planDependencyGraph` 标记，学习状态检查新增依赖图断言。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.plans[].items[].dependsOn`，旧计划使用计划项顺序派生兼容依赖。
- 写入状态：新建计划和新增自定义计划项会写入依赖 ID；删除计划项时会重连后续依赖。
- 成功反馈：计划依赖图显示任务节点、依赖来源和阻塞/解锁状态；点击节点会定位到对应任务项。
- 失败反馈：不存在的计划调用依赖图接口会返回明确空状态，不伪造图表。
- 刷新后复现方式：刷新后依赖图会从本机计划项重新推导，完成前置任务后下一节点不再显示阻塞。

验收：

- 手工验收：生成学习计划后应看到“任务依赖图”；第二项在第一项完成前显示等待前置，勾选第一项后依赖图应解锁下一项；点击图中节点会定位到对应计划项。
- 脚本验收：`node scripts/learning-state-check.js` 会验证依赖节点、依赖边、阻塞/解锁和导出 HTML 里的依赖摘要；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台依赖图入口。

提交：

- 中文 commit message：`新增学习计划任务依赖图`

### 2026-06-11：学习计划离线导出

完成内容：

- 前台学习计划面板新增“导出计划”按钮，标记为 `real-export`。
- `MRAppState.getPlanExport(planId)` 会基于本机计划生成可离线打开的 HTML 计划单。
- `MRAppState.downloadPlan(planId)` 会下载 `mr-calligraphy-plan-*.html`。
- 离线计划单包含计划 ID、创建时间、导出时间、当前字、碑帖、完成度、提醒摘要、每个计划项的到期、提醒、顺延和复盘状态。
- 学习状态检查新增计划导出断言；smoke test 前台页面新增 `planExportButton` 标记。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.plans`。
- 写入状态：导出不改写学习状态，只读取当前计划并生成文件产物。
- 成功反馈：点击按钮会下载离线 HTML，并提示可打印或保存为 PDF。
- 失败反馈：没有计划或计划 ID 不存在时返回明确空状态，不伪造导出成功。
- 刷新后复现方式：刷新页面后重新选择计划，仍可导出同一份本机计划。

验收：

- 手工验收：点击“制定计划”后再点“导出计划”，浏览器应下载 `mr-calligraphy-plan-*.html`，打开文件能看到计划 ID、任务列表和本机导出边界说明。
- 脚本验收：`node scripts/learning-state-check.js` 会验证计划导出 HTML；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查前台导出入口。

提交：

- 中文 commit message：`新增学习计划离线导出`

### 2026-06-11：动态热点控件真实化

完成内容：

- 前台 `script.js` 运行时生成的场景热点按钮从 `demo-content` 改为 `real-local`。
- 这些热点点击后会真实切换当前观察点、内容面板、标签和当前热点状态，不再按演示按钮标注。
- `scripts/control-inventory.js` 新增动态控件状态检查，会扫描 `script.js` 中的 `.dataset.featureState = "..."` 字面量。
- 动态控件如果写死 `demo-content`，控件清单会失败，避免运行时按钮回退成假演示控件。

真实化说明：

- 数据来源：`SCENES` 和 `MRAppState.getStats()` 派生出的热点内容。
- 写入状态：该功能更新当前前台观察点和互动面板，不写入长期学习状态。
- 成功反馈：热点按钮 active 状态、标题、正文、标签和指标会立即切换。
- 失败反馈：动态控件状态值非法或写死 `demo-content` 时，`node scripts/control-inventory.js --check` 会失败。
- 刷新后复现方式：刷新后热点列表重新生成，仍保持 `real-local` 标记。

验收：

- 手工验收：打开前台，点击任一场景热点，内容标题、正文和标签应立即切换。
- 脚本验收：`node scripts/control-inventory.js --check` 会输出 `script.js dynamic ... demo-content 0`。

提交：

- 中文 commit message：`真实化动态热点控件`

### 2026-06-11：热点选择路由复现

完成内容：

- 前台新增 `point` 查询参数，和已有 `step` 参数组合使用，例如 `?step=4&point=2`。
- 页面初始化时会读取 `point`，直接恢复对应步骤里的热点内容。
- 点击热点会写入 URL，浏览器后退/前进会恢复对应热点。
- 切换步骤时默认回到第一个热点，并清理旧 `point` 参数。
- smoke test 前台页面新增 `learningPointRoute` 静态标记，避免热点路由入口被误删。

真实化说明：

- 数据来源：URL 查询参数、`SCENES[index].points` 和当前前台状态。
- 写入状态：浏览器地址栏和 history state，会记录当前 `stepIndex` 与 `pointIndex`。
- 成功反馈：热点按钮 active 状态、标题、正文、标签和指标会按 URL 或点击结果切换。
- 失败反馈：非法或越界 `point` 会被限制到当前步骤可用热点范围，不会打开不存在内容。
- 刷新后复现方式：访问 `/?step=4&point=2`，刷新后仍打开第 4 步第 2 个热点。

验收：

- 手工验收：打开 `/?step=4&point=2`，应恢复第 4 步第 2 个热点；点击其他热点后 URL 的 `point` 应变化；浏览器后退应恢复上一个热点。
- 脚本验收：`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查 `learningPointRoute` 标记。

提交：

- 中文 commit message：`新增热点选择路由`

### 2026-06-11：前台写实样张入口真实化

完成内容：

- `index.html` 的“写实 3D 样张”入口从 `demo-content` 改为 `real-local`。
- smoke test 前台页面标记新增 `realistic-demo.html`，避免入口被误删。
- 控件清单中 `index.html` 现在为 35 个 `real-local`，0 个 `demo-content`；四个入口 HTML 静态控件均无 `demo-content`。

真实化说明：

- 数据来源：该入口直接导航到本机可访问的 `realistic-demo.html`。
- 写入状态：本功能是本机页面导航，不写入长期状态。
- 成功反馈：点击后打开写实 3D 样张页，可继续使用真实相机重置和旋转控制。
- 失败反馈：页面不可访问时 smoke test 会在 `/realistic-demo.html` 页面检查阶段失败。
- 刷新后复现方式：刷新前台后入口仍存在，点击仍打开本机写实样张页。

验收：

- 手工验收：打开前台，点击“写实 3D 样张”，应进入 `realistic-demo.html`。
- 脚本验收：`node scripts/control-inventory.js --check` 应显示 `index.html` 的 `demo-content` 为 0；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 应检查入口和目标页。

提交：

- 中文 commit message：`真实化前台写实入口`

### 2026-06-11：写实样张控件真实化

完成内容：

- `realistic-demo.html` 的“重置视角”和“暂停旋转”从 `demo-content` 改为 `real-local`。
- smoke test 对写实样张页新增 `resetCamera` 和 `toggleMotion` 标记检查。
- 控件清单中 `realistic-demo.html` 现在为 3 个 `real-local`，0 个 `demo-content`。

真实化说明：

- 数据来源：写实样张页的 `realistic-scene.js` 相机、OrbitControls 和自动旋转状态。
- 写入状态：本功能是即时视角交互，不写入长期项目状态。
- 成功反馈：“重置视角”会把相机和观察目标恢复默认；“暂停旋转”会切换自动旋转并更新按钮文案为“开始旋转 / 暂停旋转”。
- 失败反馈：脚本未加载时控件不会伪造成功；smoke test 会检查入口仍存在。
- 刷新后复现方式：刷新页面后恢复默认视角和默认自动旋转状态。

验收：

- 手工验收：打开 `realistic-demo.html`，点击“暂停旋转”应停止自动旋转并显示“开始旋转”；再次点击恢复旋转；拖动视角后点击“重置视角”应回到默认观察位。
- 脚本验收：`node scripts/control-inventory.js --check` 应显示 `realistic-demo.html` 的 `demo-content` 为 0；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 应检查两个控件标记。

提交：

- 中文 commit message：`真实化写实样张控件`

### 2026-06-11：后台权限风险提示

完成内容：

- 主后台和写实后台新增“本机静态后台”风险提示，明确当前无登录、角色权限和操作审计。
- 两个后台都增加“已了解”按钮，点击后写入 `mr-calligraphy-admin-risk-ack-v1`，刷新后显示确认时间。
- 写实后台“返回演示”从 `demo-content` 调整为 `real-local`，因为它是可用的本机导航。
- smoke test 新增 `mainAdminRiskBanner` 和 `realisticAdminRiskBanner` 标记，避免后续误删提示。

真实化说明：

- 数据来源：后台页面 DOM 与 `localStorage.mr-calligraphy-admin-risk-ack-v1`。
- 写入状态：分别写入 `mainScene` 和 `realisticScene` 确认时间。
- 成功反馈：提示栏切换为已确认状态，按钮文案变为“重新确认”，状态行显示确认时间。
- 失败反馈：localStorage 读取失败时保持未确认提示，不伪造权限保护。
- 刷新后复现方式：点击“已了解”后刷新对应后台，提示栏仍显示已确认时间。

验收：

- 手工验收：打开 `main-admin.html` 和 `realistic-admin.html`，确认顶部风险提示可见；点击“已了解”后刷新，确认状态仍保留。
- 脚本验收：`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查两个后台风险提示入口。

提交：

- 中文 commit message：`新增后台权限风险提示`

### 2026-06-11：任务依赖与完成条件

完成内容：

- `LearningTask` 增加 `dependsOn` 和 `completionRules`，单字、集字、创作三个模式都形成基础、进阶、挑战的前置关系。
- 任务完成不再只看是否有报告，而是按阶段记录、真实练习、保存作品、导出报告和可选均分规则综合计算。
- 任务进度新增 `complete`、`locked`、`ruleSummary`、`dependencyStatus` 字段。
- 任务列表会显示未解锁状态、前置进度和锁定原因；任务进度面板会显示完成条件和依赖提示。
- 任务列表、今日字切换和碑帖切换都会拦截未解锁任务，避免用户绕过前置任务。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1` 中的 `sessions`、`artworks`、`reports` 和 `stageRecords`。
- 写入状态：本功能主要读取并派生任务状态；选择已解锁任务时写入 `selectedTaskId`、当前字、碑帖和事件记录。
- 成功反馈：任务面板进度、里程碑、完成条件、锁定标签和提示消息会同步变化。
- 失败反馈：选择未解锁任务时返回前置任务原因，不切换当前任务，不显示虚假成功。
- 刷新后复现方式：完成阶段、练习、作品和报告后刷新页面，任务完成和下一任务解锁状态仍由本机状态重新推导。

验收：

- 手工验收：在未完成基础任务前点击进阶/挑战任务，应提示前置任务未完成；完成阶段、练习、作品和报告后，下一任务应解锁。
- 脚本验收：`node scripts/learning-state-check.js` 会验证未完成前置时锁定、完成当前任务后解锁下一任务、挑战任务仍被中间任务锁定。

提交：

- 中文 commit message：`新增任务依赖完成规则`

### 2026-06-11：学习计划提醒与复盘触发

完成内容：

- `PlanItem` 增加 `dueAt`、`remindAt`、`snoozedUntil`、`reviewAction`、`reviewDoneAt` 字段。
- 新建计划会自动生成 5 个带到期和提醒节奏的任务项，并按练习、任务、薄弱项、作品、报告分配复盘动作。
- 计划面板新增提醒摘要，单个计划项显示状态、到期、提醒和复盘目标。
- 计划项新增“顺延”和“复盘”动作；顺延会改写到期/提醒时间，复盘会写入复盘完成时间并触发下一步入口。
- 编辑和新增计划项时可录入到期日期、提醒日期和复盘动作。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1` 中的 `plans`。
- 写入状态：计划项排期、顺延、完成和复盘状态都写回本机状态层。
- 成功反馈：计划面板进度、提醒摘要、计划项标签和提示消息会同步变化。
- 失败反馈：计划不存在、标题过短、日期格式无效、提醒晚于到期、已完成任务顺延都会返回明确失败提示。
- 刷新后复现方式：刷新页面后重新打开学习计划，计划项仍保留到期、提醒、顺延和复盘状态。

验收：

- 手工验收：点击“制定计划”，检查 5 个计划项是否都有到期、提醒和复盘标签；点击“顺延”后到期时间变化；点击“复盘”后状态变为已复盘并跳转到对应学习入口。
- 脚本验收：`node scripts/learning-state-check.js` 会创建计划并验证提醒、顺延、复盘和持久化。

提交：

- 中文 commit message：`新增学习计划提醒复盘`

### 2026-06-11：学习阶段动作本机记录

完成内容：

- 新增 `stageRecords` 本机状态，用于记录笔画拆解、创作实践和复习巩固三个学习阶段。
- `进入笔画拆解`、`进入创作`、`复习巩固` 从 `demo-content` 学习动作升级为 `real-local` 动作。
- 任务进度里程碑增加笔画拆解、创作实践和复习巩固，任务面板会显示阶段记录数量。
- 学习摘要增加当前阶段进度，例如 `阶段2/3`。
- 动作反馈会显示本机阶段记录详情，包括任务、字帖、阶段进度和阶段清单。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.stageRecords`。
- 写入状态：每次点击阶段动作都会写入 `stage`、`taskId`、`glyph`、`copybook`、`targetStep`、`completedAt` 和说明。
- 成功反馈：动作反馈区显示阶段详情，任务面板里程碑和学习摘要同步更新。
- 失败反馈：未知阶段会返回失败，不写入虚假记录。
- 刷新后复现方式：刷新页面后 `getStats()`、`getTaskProgress()` 和 `getStageProgress()` 仍能读取阶段完成情况。

验收：

- 手工验收：依次点击“进入笔画拆解”“进入创作”“复习巩固”，检查任务面板阶段记录数、里程碑和学习摘要是否变化。
- 脚本验收：`node scripts/learning-state-check.js` 会验证三类阶段记录、任务里程碑、统计值和 localStorage 持久化。

提交：

- 中文 commit message：`新增学习阶段动作记录`

### 2026-06-11：基础练习评分解释层

完成内容：

- 书写画布评分结果新增 `scoreEvidence`，包含评分类型、权重、目标笔画、采样点、覆盖范围、重心偏移、停顿、压感跨度和五项维度理由。
- 练习会话和作品记录会保存评分证据，旧记录会按已有笔画、采样、bounds 和维度分合成基础证据。
- “查看笔画分析”面板显示基础练习评分类型、证据指标和每项评分理由。
- 作品复盘面板会追加评分依据，避免只显示分数和泛化建议。
- 学习状态检查已覆盖评分证据写入、归一化和 localStorage 持久化。

真实化说明：

- 数据来源：练习画布真实笔迹采样、bounds、压感、时间间隔和本机启发式评分。
- 写入状态：`PracticeSession.scoreEvidence` 和 `ArtworkRecord.scoreEvidence`。
- 成功反馈：笔画分析详情和作品复盘反馈列表会显示“基础练习评分”及证据理由。
- 失败反馈：没有笔迹时仍显示空状态，不返回假评分或假证据。
- 刷新后复现方式：保存练习或作品后刷新，重新打开分析或复盘仍能读取评分证据。

验收：

- 手工验收：书写后点击“查看笔画分析”，应看到评分类型、目标笔画、覆盖、重心偏移、停顿和维度理由；保存作品后复盘区也应展示评分依据。
- 脚本验收：`node scripts/learning-state-check.js` 会验证评分证据、五项理由和 localStorage 持久化。

提交：

- 中文 commit message：`新增基础评分解释层`

### 2026-06-12：新增远端发布回执审计

功能名：主后台和写实后台远端发布回执审计与导出。

涉及文件：

- `project-remote-publish.js`
- `main-admin.html`
- `realistic-admin.html`
- `main-admin-scene.js`
- `realistic-scene.js`
- `style.css`
- `scripts/remote-publish-check.js`
- `scripts/smoke-test.js`
- `docs/frontend-realification-development-plan.md`
- `docs/remote-publish-api-contract.md`
- `docs/smoke-test.md`
- `docs/current-version-gap-and-realification-plan.md`
- `docs/516-realification-development-plan.md`

已完成：

- `MRProjectRemotePublish` 新增远端回执审计状态，按场景保存最近 12 条回执。
- `push()` 会解析服务端 `receipt`，并在没有完整 receipt 时用本机发布包、远端响应和 endpoint 合成可追踪审计记录。
- 新增 `getReceiptAudit()` 和 `getReceiptAuditExport()`，可读取回执列表并生成离线 HTML 审计页。
- 主后台和写实后台“远端发布 API”面板新增“回执审计”区域，显示最近回执并可导出 HTML。
- 远端发布专项检查新增回执持久化、回执摘要、回执审计导出和 mock 服务 receipt 回写断言。
- smoke test 新增两个后台的回执状态、回执列表和回执导出按钮标记。

真实化说明：

- 数据来源：主后台 / 写实后台当前本机发布版本、远端发布 POST 响应、服务端 receipt、远端 endpoint 和本机推送时间。
- 写入状态：推送成功后写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts`，失败或被审核/发布锁阻止时不写成功回执。
- 成功反馈：后台回执审计区显示最近回执；点击“导出回执”会下载 `MR 书法远端发布回执审计` HTML。
- 失败反馈：暂无回执时导出按钮禁用；直接调用导出 API 会返回明确失败消息。
- 刷新后复现方式：回执审计保存在本机 localStorage，刷新后台后仍可读取和导出。

当前验证结果：

- `node --check project-remote-publish.js`
- `node --check scripts/remote-publish-check.js`
- `node --check scripts/smoke-test.js`
- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`

已知限制：

- 当前回执审计是本机浏览器日志，不是服务端不可篡改审计。
- 还没有账号、角色、远端审批、CDN 部署、服务端资产签名和审计签名。

提交：

- 中文 commit message：`新增远端发布回执审计`

### 2026-06-12：新增报告教师批注

功能名：站内学习报告本机教师批注。

涉及文件：

- `app-state.js`
- `index.html`
- `script.js`
- `style.css`
- `scripts/learning-state-check.js`
- `scripts/smoke-test.js`
- `docs/frontend-realification-development-plan.md`
- `docs/current-version-gap-and-realification-plan.md`
- `docs/516-realification-development-plan.md`
- `docs/smoke-test.md`

已完成：

- `ReportRecord` 新增 `teacherReview` 字段，保存批注人、批注内容、批注时间和本机来源。
- `MRAppState` 新增 `updateReportTeacherReview()`、`clearReportTeacherReview()` 和 `getReportHtmlExport()`。
- 站内报告面板新增“教师批注”表单，支持保存和清除当前报告批注。
- HTML 报告导出新增教师批注区；原生 PDF 新增教师批注章节和 `TeacherReview` 可测标记。
- 学习档案同步包新增 `summary.teacherReviewedReportCount`，远端学习档案 mock 服务会校验该摘要并保存 `records.reports[*].teacherReview`。
- 学习状态检查覆盖空批注拒绝、批注持久化、HTML 导出和 PDF 导出。
- smoke test 新增报告批注入口标记。

真实化说明：

- 数据来源：当前站内报告 ID、用户输入的批注人和批注内容。
- 写入状态：保存后写入 `mr-calligraphy-learning-state-v1.reports[*].teacherReview`；空批注不会写入。
- 成功反馈：报告详情显示批注人、时间和内容；HTML/PDF 导出保留批注状态。
- 失败反馈：没有报告或批注为空时返回明确提示，不伪造教师反馈。
- 刷新后复现方式：报告批注保存在本机 localStorage，刷新前台后重新打开报告仍可看到。

当前验证结果：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/history-repository-mock-server.js`
- `node --check scripts/smoke-test.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`

已知限制：

- 当前是本机教师批注，不是账号化教师端。
- 还没有服务端审计、教师身份、课堂权限、服务端签名验真或云端长期报告仓库。

提交：

- 中文 commit message：`新增报告教师批注`

### 2026-06-12：新增远端发布服务端锁预检

完成内容：

- `MRProjectRemotePublish.push()` 在 `POST` 前先 `GET` 远端 endpoint，读取 `publishLock` 和 `latestReceipt`。
- 服务端锁或最近回执命中当前 `releaseId` / `packageDigest` 时，会阻止 `POST` 并写入本机远端发布锁。
- 普通远端拒收或网络失败会释放本机“正在推送”临时锁，避免失败后误锁当前包。
- 远端发布 mock server 的 `GET` 新增 `publishLock`，API 合同新增服务端锁字段说明。
- `scripts/remote-publish-check.js` 覆盖服务端锁预检、mock 最近回执阻断、`422` 拒收释放临时锁和状态持久化。

真实化说明：

- 数据来源：当前本机发布包、服务端 `GET` 返回的发布锁 / 最近回执。
- 写入状态：命中服务端锁写入 `mr-calligraphy-remote-publish-v1.scenes[*].lock`、`lastRemoteStatus` 和 `lastError`。
- 成功反馈：后台显示“远端发布锁校验阻止推送”，不会出现成功回执。
- 失败反馈：服务端锁校验失败、远端拒收和网络异常都不会伪造成发布成功。
- 刷新后复现方式：远端锁和错误状态保存在本机远端发布状态中。

验收：

- `node --check project-remote-publish.js`
- `node --check scripts/remote-publish-mock-server.js`
- `node --check scripts/remote-publish-check.js`
- `node scripts/remote-publish-check.js`

提交：

- 中文 commit message：`新增远端发布服务端锁预检`

### 2026-06-12：新增远端项目仓库版本历史

完成内容：

- 远端项目仓库 mock server 保留最近 20 个项目仓库包版本。
- `GET /api/project-repository` 返回 `versions`、`selectedVersion`、最新包和回执摘要。
- `GET /api/project-repository?packageId=<remote-package-id>` 支持拉取指定历史版本。
- 主后台远端项目仓库面板新增“远端版本”选择框。
- `MRProjectArchive` 持久化 `versions` 到 `mr-calligraphy-project-repository-remote-v1`。
- “拉取预览”会使用选中版本发起真实 GET，校验包摘要后进入项目档案恢复预览。
- E2E 覆盖连续两次推送、版本列表持久化、选择旧版本和带 `packageId` 拉取。

真实化说明：

- 数据来源：远端 API 返回的版本列表、远端历史包和本机推送回执。
- 写入状态：版本列表、最近拉取版本、摘要和远端状态写入 `mr-calligraphy-project-repository-remote-v1`。
- 成功反馈：版本选择框显示远端版本；拉取后显示现有项目档案差异预览。
- 失败反馈：远端找不到版本、结构不匹配或摘要不匹配时明确失败，不覆盖本机状态。
- 刷新后复现方式：版本历史保存在本机 localStorage，刷新主后台后仍可显示。

验收：

- `node --check project-archive.js`
- `node --check scripts/project-repository-mock-server.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes"`
- `npm run test:e2e`
- `git diff --check`

提交：

- 中文 commit message：`新增远端项目仓库版本历史`

### 2026-06-12：新增报告本机验真摘要

完成内容：

- `MRAppState.getReportVerification(reportId)` 可按稳定 JSON 重新计算本机报告 SHA-256 摘要。
- 摘要 payload 覆盖报告核心字段、教师批注、关联练习和最近作品截图摘要。
- 前台报告详情显示摘要、算法和本机边界。
- HTML 报告和原生 PDF 都写入同一份摘要；PDF 额外包含 `ReportDigest` 可测注释。
- 学习状态检查验证摘要格式、PDF/HTML 一致性和教师批注变更后的摘要变化。

真实化说明：

- 数据来源：当前浏览器本机学习状态。
- 写入状态：不写新持久字段，摘要每次从报告内容复算。
- 成功反馈：页面、HTML 和 PDF 均展示同一份摘要。
- 失败反馈：没有报告时返回明确失败。
- 刷新后复现方式：从 `mr-calligraphy-learning-state-v1` 重新计算。

仍待补：

- 当前是本机验真摘要，不是账号化 `ReportRepository`、服务端签名、教师身份签章或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告本机验真摘要`

### 2026-06-12：新增报告仓库远端同步

完成内容：

- `MRAppState` 新增 `reportRepository` 状态，记录远端 endpoint/token、最近检查、推送、拉取、packageId、远端报告数、跳过冲突数和错误信息。
- 新增 `getReportRepositoryPackage()`，会把本机 `ReportRecord` 和对应 `getReportVerification()` 摘要打包为 `mr-calligraphy-report-repository-v1`。
- 新增 `configureReportRepositoryRemote()`、`checkRemoteReportRepository()`、`pushReportRepositoryToRemote()` 和 `pullReportRepositoryFromRemote()`，通过真实 `fetch` 对用户配置 endpoint 做 GET/PUT。
- 站内报告面板新增“远端报告 API”折叠区，提供 endpoint/token、保存远端、检查远端、推送报告和拉取报告。
- 新增 `scripts/report-repository-mock-server.js`，校验报告包、Bearer token、验真摘要和回执。
- 新增 `docs/report-repository-api-contract.md`，记录 endpoint、包结构、回执、失败响应、同 ID 差异策略和本机验收方式。
- `learning-state-check.js` 和 Playwright 前台用例覆盖报告包生成、远端检查、推送、拉取、Bearer token、教师批注、验真摘要和同 ID 差异跳过。

真实化说明：

- 数据来源：当前浏览器里的 `ReportRecord`、教师批注、本机报告验真摘要和用户配置的远端 endpoint/token。
- 写入状态：远端配置与同步状态写入 `mr-calligraphy-learning-state-v1.reportRepository`；拉取到的新报告写入本机 `reports`。
- 成功反馈：报告面板显示远端检查、推送或拉取结果；远端 mock server 返回 receipt 和 packageId。
- 失败反馈：未配置 endpoint、非法 URL、401、422、网络错误或远端结构错误都会返回明确失败，不清空本机报告。
- 刷新后复现方式：刷新前台后仍能看到远端配置和最近同步状态；报告记录继续从本机学习状态读取。

仍待补：

- 当前是前端远端 API adapter，不是账号化教师端、服务端签章、不可篡改审计、服务端 PDF 渲染或生产长期报告仓库。
- 当前同 ID 差异已在后续补为本机冲突审计、字段级合并和远端副本另存；后续仍要补账号化服务端合并策略和服务端签名审计。

验收：

- `node --check app-state.js && node --check script.js`
- `node --check scripts/report-repository-mock-server.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库远端同步`

### 2026-06-12：新增报告仓库冲突审计

完成内容：

- `reportRepository` 状态新增 `lastConflictReports`，保存远端同 ID 差异报告的本机/远端标题、时间、字段差异和远端报告快照。
- `importReportRepositoryPackage()` 和远端拉取遇到同 ID 差异时，不再只计数，而是保存报告冲突审计。
- 新增 `getReportRepositoryConflicts()` 和 `resolveReportRepositoryConflict()`，支持字段级合并、另存远端副本和忽略审计。
- 站内报告面板新增“报告仓库冲突审计”区域，显示字段差异并提供本机/远端单选合并。
- E2E 覆盖真实页面拉取冲突报告、显示冲突面板、选择远端摘要字段并应用合并。
- 学习状态检查覆盖报告冲突查询、字段级合并和远端副本另存。

真实化说明：

- 数据来源：远端报告包、本机同 ID `ReportRecord` 和用户在冲突审计区的字段选择。
- 写入状态：冲突审计写入 `mr-calligraphy-learning-state-v1.reportRepository.lastConflictReports`；字段合并写回本机 `reports`；另存副本新增本机报告。
- 成功反馈：冲突处理后报告面板刷新，审计数量减少或清空，notice 显示处理结果。
- 失败反馈：找不到冲突、本机报告不存在或未知处理方式时返回明确错误，不修改其他报告。
- 刷新后复现方式：未处理的冲突审计保存在本机学习状态中，刷新后仍会显示。

仍待补：

- 当前冲突审计仍是本机处理，不是服务端版本合并、教师身份审计、服务端签章或不可篡改日志。

验收：

- `node --check app-state.js && node --check script.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库冲突审计`

### 2026-06-12：新增报告仓库同步包导入导出

完成内容：

- `MRAppState.downloadReportRepository()` 复用 `getReportRepositoryPackage()` 生成 `mr-calligraphy-report-repository-*.json`，并记录最近导出时间、导出报告数和 packageId。
- 站内报告面板新增“导出同步包”和“导入同步包”，导出触发真实浏览器下载，导入走文件选择器读取 JSON。
- 导入后会把新增报告写入本机 `reports`，同 ID 差异继续生成 `reportRepository.lastConflictReports`，不静默覆盖本机报告。
- smoke test 检查新增 DOM 标记，学习状态检查确认下载 API 暴露，Playwright 覆盖报告仓库 JSON 下载和本机文件导入。

真实化说明：

- 数据来源：当前浏览器的 `ReportRecord`、教师批注、本机验真摘要，以及用户选择的报告仓库 JSON 文件。
- 写入状态：导出写回 `mr-calligraphy-learning-state-v1.reportRepository.lastExportedAt`、`lastExportedReportCount` 和 `lastPackageId`；导入写入 `reports` 与导入状态。
- 成功反馈：报告仓库摘要显示最近导出/导入报告数，notice 显示文件名或导入结果。
- 失败反馈：无报告、读文件失败、JSON 解析失败、kind 不匹配或空包都有明确提示。
- 刷新后复现方式：导入报告和同步状态写入本机学习状态，刷新后仍可打开报告。

仍待补：

- 本机同步包不是生产云端仓库；仍需账号化 ReportRepository、教师身份审计、服务端签名、不可篡改日志和长期归档。

验收：

- `node --check app-state.js && node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes|front report repository imports"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库同步包导入导出`

### 2026-06-12：新增学习报告 PDF 分数趋势图

完成内容：

- `createReportPdf()` 会把报告自带 `trend` 或按报告时间回填的本机练习/作品分数序列传入 PDF。
- `createSimplePdf()` 新增 `trendBars` 块，使用原生 PDF 矩形和线段绘制最近 8 条分数趋势。
- `getReportPdfExport()` 暴露 `features.trendBars` 和 `features.trendCount`，用于前端、脚本和后续服务端验收。
- PDF 注释新增 `TrendBars: N`，Playwright 下载 PDF 后可直接验证趋势图进入文件。

真实化说明：

- 数据来源：`ReportRecord.trend`；旧报告没有趋势数组时，从当前本机 `PracticeSession` 和 `ArtworkRecord` 按报告生成时间回填。
- 写入状态：不修改本机学习状态，只影响下载出的 PDF 文件。
- 成功反馈：PDF feature 和文件注释显示趋势记录数量。
- 失败反馈：没有真实分数时显示空趋势说明，不伪造高分曲线。
- 刷新后复现方式：报告、练习和作品保存在本机学习状态中，刷新后再次下载 PDF 仍会生成同一时间范围内的趋势图。

仍待补：

- 当前趋势图是轻量原生 PDF 矩形图；后续已补原生 PDF 能力雷达图，服务端签名验真、不可篡改审计和服务端 PDF 渲染仍未接入。

验收：

- `node --check app-state.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习报告PDF分数趋势图`

### 2026-06-12：新增学习报告 PDF 能力雷达图

完成内容：

- `createReportPdf()` 会把五项能力分传入 PDF 图表块，并暴露雷达图 feature。
- `createSimplePdf()` 在能力维度区域新增原生 PDF 雷达图绘制，包含四层参考环、五条轴线、能力区域和点位。
- `getReportPdfExport()` 暴露 `features.radarChart` 和 `features.radarMetricCount`。
- PDF 注释新增 `RadarChart: N`，Playwright 下载 PDF 后可直接验证雷达图进入文件。

真实化说明：

- 数据来源：当前报告 `scoreBreakdown` 中的结构、笔画、笔法、流畅和力度五项分数。
- 写入状态：不修改本机学习状态，只影响下载出的 PDF 文件。
- 成功反馈：PDF feature 和文件注释显示雷达图能力。
- 失败反馈：没有真实能力分时不会伪造雷达图，只保留条形图/空分值。
- 刷新后复现方式：报告保存在本机学习状态中，刷新后再次下载 PDF 仍会按同一 `scoreBreakdown` 绘制雷达图。

仍待补：

- 当前是本机原生 PDF 矢量雷达图，不是服务端签名报告；服务端 PDF 渲染、教师身份审计、不可篡改日志和长期报告仓库仍未接入。

验收：

- `node --check app-state.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习报告PDF能力雷达图`

### 2026-06-12：新增报告仓库签名回执

完成内容：

- `scripts/report-repository-mock-server.js` 的报告仓库 receipt 新增 `signatureAlgorithm`、`signingKeyId`、`signedFields` 和 64 位 `signature`。
- mock 服务使用 `HMAC-SHA256` 为 receipt 核心字段生成签名，支持 `REPORT_REPOSITORY_MOCK_SIGNING_SECRET` 和 `REPORT_REPOSITORY_MOCK_SIGNING_KEY_ID` 覆盖本机签名配置。
- `MRAppState` 新增报告仓库签名回执规范化，只有 kind、摘要和签名字段完整时才保存到 `reportRepository.lastSignedReceipt`。
- 远端检查、推送和拉取会读取 `receipt/latestReceipt`，并在报告仓库摘要中提示最近签名回执。
- 学习状态检查和 Playwright 浏览器用例都覆盖签名回执保存与持久化。

真实化说明：

- 数据来源：远端报告仓库 API 返回的 receipt。
- 写入状态：最近签名回执写入 `mr-calligraphy-learning-state-v1.reportRepository.lastSignedReceipt`；本机 JSON 导出/导入会清空旧远端签名，避免状态混淆。
- 成功反馈：报告仓库摘要显示签名算法、key id、签名前 12 位和仓库摘要前 12 位。
- 失败反馈：缺少 signature、digest 或 receipt kind 不匹配时不会伪造成签名回执。
- 刷新后复现方式：签名回执随本机学习状态持久化，刷新后仍可在报告仓库摘要和状态对象中读取。

仍待补：

- 当前是本机 mock/HMAC 回执，不是账号化教师端、生产证书签名、不可篡改日志或云端长期报告仓库。
- 前端目前保存服务端签名回执，但不持有生产公钥，也不做完整证书链验签。

验收：

- `node --check app-state.js && node --check scripts/report-repository-mock-server.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库签名回执`

### 2026-06-12：新增报告仓库回执审计导出

完成内容：

- `MRAppState` 新增 `signedReceipts` 最近 12 条报告仓库签名回执审计列表。
- 远端推送、检查和拉取保存回执时会记录方向、endpoint、本机收到时间、签名算法、key id、签名和仓库摘要。
- 新增 `getReportRepositoryReceiptAudit()`、`getReportRepositoryReceiptAuditExport()` 和 `downloadReportRepositoryReceiptAudit()`。
- 站内报告面板新增“签名回执审计”区域，展示最近回执，并可导出 HTML 审计页。
- 学习状态检查、smoke test 和 Playwright 都覆盖回执审计列表与导出文件。

真实化说明：

- 数据来源：远端报告仓库 API 返回的签名 receipt，以及本机记录的 endpoint / 同步方向 / 收到时间。
- 写入状态：回执列表写入 `mr-calligraphy-learning-state-v1.reportRepository.signedReceipts`。
- 成功反馈：报告仓库面板显示已保存回执数量、最近签名短码和仓库摘要短码；“导出回执”下载 HTML。
- 失败反馈：没有回执时导出按钮禁用，直接调用导出 API 会返回明确失败提示。
- 刷新后复现方式：回执审计列表保存在本机学习状态，刷新后仍可显示和导出。

仍待补：

- 当前是本机浏览器审计列表，不是服务端不可篡改日志、生产证书链或账号化教师身份审计。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库回执审计`

### 2026-06-12：新增学习计划日历提醒导出

本次把“跨设备提醒”先补成一个真实可用的本机出口：学习计划可以导出标准 `.ics` 日历文件，用户可导入系统日历或手机日历，由日历应用负责后续提醒。

完成内容：

- 新增 `MRAppState.getPlanCalendarExport(planId)`，从真实 `PlanItem.dueAt/remindAt` 生成 `VCALENDAR`。
- 每个带到期时间的计划项会生成一个 `VEVENT`，包含 `DTSTART`、`DTEND`、任务说明、计划 ID、计划项 ID 和完成状态。
- 若计划项存在不晚于到期时间的 `remindAt`，导出文件会写入 `VALARM`。
- 新增 `downloadPlanCalendar(planId)`，前台“导出日历”按钮会下载 `mr-calligraphy-plan-calendar-*.ics`。
- 学习状态检查、smoke test 和 Playwright 都验证 `.ics` 文件结构、提醒闹钟和真实下载。

真实化说明：

- 数据来源：本机学习计划里的 `dueAt`、`remindAt`、标题、说明和复盘动作。
- 写入状态：不新增持久字段，只读取当前本机计划生成文件。
- 成功反馈：前台下载 `.ics` 文件，并提示可导入系统日历。
- 失败反馈：没有计划或计划项没有到期时间时，导出 API 返回明确失败。
- 刷新后复现方式：计划保存在 `mr-calligraphy-learning-state-v1`，刷新后仍可再次导出同一计划日历。

仍待补：

- `.ics` 是本机文件导出，不是账号化云端推送、教师端通知或后台任务下发。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习计划日历提醒导出`

### 2026-06-12：新增计划仓库回执审计导出

完成内容：

- `MRAppState` 新增计划仓库回执规范化和最近 12 条 `planRepository.receipts` 审计列表。
- 远端计划 API 返回的 `receipt/latestReceipt` 会在检查、推送、拉取时补充方向、endpoint 和本机收到时间。
- 新增 `getPlanRepositoryReceiptAudit()`、`getPlanRepositoryReceiptAuditExport()` 和 `downloadPlanRepositoryReceiptAudit()`。
- 前台计划远端同步区新增“回执审计”区域，展示最近回执，并可导出 HTML 审计页。
- 学习状态检查、smoke test 和 Playwright 都覆盖回执持久化、摘要展示和导出文件。

真实化说明：

- 数据来源：远端计划仓库 API 返回的 receipt，以及本机记录的 endpoint / 同步方向 / 收到时间。
- 写入状态：回执列表写入 `mr-calligraphy-learning-state-v1.planRepository.receipts`。
- 成功反馈：计划仓库面板显示已保存回执数量、仓库摘要短码和回执短码；“导出回执”下载 HTML。
- 失败反馈：缺少完整 kind、`repositoryDigest` 或 `receiptDigest` 时不会保存为计划仓库回执；暂无回执时导出 API 返回明确失败。
- 刷新后复现方式：回执审计列表保存在本机学习状态，刷新后仍可显示和导出。

仍待补：

- 当前是本机浏览器审计列表，不是服务端不可篡改日志、账号空间审计或生产签名证书链。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front plan repository detects remote conflicts"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划仓库回执审计`

### 2026-06-12：新增项目仓库回执审计导出

完成内容：

- 主后台项目仓库远端状态新增回执审计 API，可返回最近 12 条 `mr-calligraphy-project-repository-receipt-v1`。
- 项目仓库远端检查、推送、拉取会读取 `receipt/latestReceipt`，并记录同步方向、endpoint 和本机收到时间。
- “远端项目仓库 API”面板新增回执审计状态和“导出回执”按钮。
- 导出的 `mr-calligraphy-project-repository-receipts-*.html` 包含远端 packageId、本机 sourcePackageId、packageDigest、repositoryDigest、receiptDigest、场景数、模型数和原始 JSON。
- smoke test 与 Playwright 覆盖新 DOM、回执持久化、导出 API 和下载文件内容。

真实化说明：

- 数据来源：远端项目仓库 API 返回的 receipt，以及本机记录的 endpoint / 方向 / 收到时间。
- 写入状态：`mr-calligraphy-project-repository-remote-v1.receipts`。
- 成功反馈：主后台显示已保存项目仓库回执数量，并可下载 HTML 审计页。
- 失败反馈：暂无回执时按钮禁用，导出 API 返回明确失败，不伪造回执。
- 刷新后复现方式：审计列表随本机项目仓库远端状态持久化。

仍待补：

- 当前是本机审计导出，不是账号化项目空间、服务端不可篡改审计、生产签名证书链或多人协作后台。

验收：

- `node --check project-archive.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库回执审计导出`

### 2026-06-12：新增项目仓库远端失败反馈

完成内容：

- 主后台项目仓库远端响应解析改为严格 JSON；200 返回 HTML / 纯文本不再被误判为成功。
- HTTP 非 2xx 与 `ok:false` 会携带 `HTTP <status>` 写入 `mr-calligraphy-project-repository-remote-v1.lastError`。
- 网络中断统一显示“网络请求异常”，避免暴露浏览器英文异常。
- 拉取响应缺少项目仓库包时会明确失败，不进入恢复预览。
- Playwright 新增失败用例覆盖 401、非 JSON、无项目包、PUT 422 和网络中断，并确认失败后本机项目布局仍保留。

真实化说明：

- 数据来源：真实 `fetch` 响应状态、JSON body、网络异常和本机主场景布局。
- 写入状态：失败写入 `mr-calligraphy-project-repository-remote-v1.lastError`。
- 成功反馈：合法 JSON 的检查、推送、拉取流程保持原有行为。
- 失败反馈：后台状态条显示 HTTP 状态、非 JSON、缺项目包或网络异常。
- 刷新后复现方式：最近错误保存在本机项目仓库远端状态。

仍待补：

- 当前是前端 adapter 失败反馈，不是生产服务端日志、账号告警或集中审计。

验收：

- `node --check project-archive.js && node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `npm run test:e2e -- --grep "main admin project repository keeps local data"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库远端失败反馈`

### 2026-06-12：新增报告教师批注审计导出

完成内容：

- `MRAppState.updateReportTeacherReview()` 保存批注时会追加 `reportTeacherReviewAudits` 审计记录。
- `MRAppState.clearReportTeacherReview()` 清除批注时会记录清除动作、前一摘要和清除时间。
- 新增 `getReportTeacherReviewAudit()`、`getReportTeacherReviewAuditExport()` 和 `downloadReportTeacherReviewAudit()`。
- 前台报告详情“教师批注”区新增批注审计状态、最近记录列表和“导出审计”按钮。
- 导出的 `mr-calligraphy-teacher-review-audit-*.html` 包含报告 ID、批注人、动作、前后 SHA-256 摘要、批注预览和原始审计 JSON。
- 数据层脚本和 E2E 覆盖保存审计、下载审计 HTML、清除审计和 localStorage 持久化。

真实化说明：

- 数据来源：当前浏览器里的 `ReportRecord.teacherReview` 保存/清除动作。
- 写入状态：`mr-calligraphy-learning-state-v1.reportTeacherReviewAudits`。
- 成功反馈：前台显示最近审计记录，并可下载 HTML 审计页。
- 失败反馈：暂无报告或暂无审计时导出按钮禁用，直接调用导出 API 会返回明确失败。
- 刷新后复现方式：审计记录保存在本机学习状态中，刷新后仍按报告 ID 可查。

仍待补：

- 当前是本机浏览器审计链，不是账号化教师端、电子签章、服务端不可篡改日志或跨设备教师工作台。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告教师批注审计`

### 2026-06-12：新增项目档案恢复审计摘要

完成内容：

- 项目档案恢复审计新增 `sha256-stable-json` 摘要算法标记。
- 每条恢复审计记录新增 `archiveDigest`、`selectionDigest` 和 `recordDigest`。
- `archiveDigest` 对本次选中的档案内容生成摘要，`selectionDigest` 对恢复范围生成摘要，`recordDigest` 对整条审计记录生成摘要。
- 主后台“恢复审计”列表会显示审计摘要短码。
- `mr-calligraphy-archive-audit-*.html` 导出新增三类摘要和原始审计 JSON。
- Node 验收环境新增 SHA-256 后备实现，保证本机脚本也能验证同一套摘要逻辑。
- Playwright 在远端项目仓库拉取预览后真实点击“恢复所选”，刷新后检查恢复审计列表并下载 HTML 审计报告。

真实化说明：

- 数据来源：当前浏览器中真实恢复成功的项目档案、用户选择的恢复范围和恢复后的本机审计记录。
- 写入状态：`mr-calligraphy-project-archive-audit-v1.records[*].archiveDigest / selectionDigest / recordDigest`。
- 成功反馈：后台恢复审计列表显示摘要短码，导出 HTML 包含完整摘要。
- 失败反馈：恢复失败或模型哈希校验失败时不会写入成功审计。
- 刷新后复现方式：审计记录保存在本机 localStorage，刷新主后台后仍可查看和导出。

仍待补：

- 当前仍是本机浏览器审计，不是多人协作级服务端审计、账号权限审计或不可篡改日志。

验收：

- `node --check project-archive.js && node --check scripts/archive-migration-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/archive-migration-check.js`
- `npm run test:e2e -- --grep "main admin publishes"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增项目档案恢复审计摘要`

### 2026-06-12：新增书写视频封面和导出记录

完成内容：

- 书写画布新增 `exportReplayCover()`，复用 WebM 回放同一套 canvas 绘制逻辑生成 PNG 封面。
- 前台复盘面板新增“导出视频”和“下载封面”按钮。
- WebM 导出成功后写入 `videoExportService.records`，记录来源、作品/练习 ID、文件名、时长、大小、笔画数、采样点和封面 Data URL。
- 复盘面板显示最近视频导出摘要和最近 3 条导出记录。
- 视频导出失败会写入 `videoExportService.lastError`，不会伪造成成功记录。
- Playwright 覆盖保存作品后导出 WebM、写入本机记录、下载 PNG 封面和刷新后状态读取。

真实化说明：

- 数据来源：当前浏览器真实书写笔迹、最近作品关联练习和 canvas 回放帧。
- 写入状态：`mr-calligraphy-learning-state-v1.videoExportService.records[*]`。
- 成功反馈：下载 WebM，复盘面板显示本机导出记录，并可下载 PNG 封面。
- 失败反馈：无笔迹、无录制能力或封面生成失败时返回明确错误，并写入最近失败原因。
- 刷新后复现方式：导出记录和封面 Data URL 保存在本机学习状态中，刷新后仍可查看并下载封面。

仍待补：

- 当前仍是浏览器端 WebM，不是 MP4/GIF 转码、服务端压缩、后台异步队列或公网分享链路。

验收：

- `node --check app-state.js && node --check script.js && node --check practice-canvas.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增书写视频封面导出记录`

### 2026-06-12：新增书写视频导出队列和失败重试

完成内容：

- `videoExportService` 新增 `jobs` 本机导出队列，记录排队、生成中、已完成、失败四种状态。
- WebM 导出会先写入队列任务，再进入生成中，成功后关联视频记录和封面记录。
- 导出失败会写入失败任务、错误原因和最近失败状态，不会只在页面提示里一闪而过。
- 复盘面板的视频导出记录列表改为展示队列状态；失败任务显示“重试”按钮。
- 重试会从失败任务关联的练习/作品中读取原始 strokes，重新加入队列并再次执行真实 WebM 导出。
- 刷新时发现未完成的生成中任务会标为失败并提示页面中断，避免永远停在“生成中”。
- Playwright 覆盖成功导出、禁用 `MediaRecorder` 触发失败、恢复录制能力后点击“重试”并下载 WebM。

真实化说明：

- 数据来源：真实书写笔迹、最近作品关联练习、本机队列任务和浏览器录制能力。
- 写入状态：`mr-calligraphy-learning-state-v1.videoExportService.jobs[*]` 和 `videoExportService.records[*]`。
- 成功反馈：队列显示“已完成”，下载 WebM，并保留可下载封面。
- 失败反馈：队列显示“失败”和错误原因，提供可执行的重试按钮。
- 刷新后复现方式：队列任务和失败原因保存在 localStorage；刷新时未完成任务会转为可重试失败态。

仍待补：

- 当前是页面打开期间的本机队列，不是 Service Worker 后台队列、服务端压缩转码队列、MP4/GIF 转码或公网分享链路。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增书写视频导出队列重试`

### 2026-06-12：新增作品分享远端 API adapter

完成内容：

- `shareService` 新增远端配置、最近远端状态、最近 publicUrl、最近 packageId、最近回执和回执列表。
- 新增 `MRAppState.getArtworkShareRemotePackage()`，把有效本机分享链接、作品分享数据和 HTML 组装为 `mr-calligraphy-share-repository-v1` 分享包。
- 新增 `configureShareServiceRemote()`、`checkRemoteShareService()` 和 `pushArtworkShareToRemote()`，支持 endpoint/token 保存、真实 GET 检查和 PUT 发布。
- 前台复盘区新增“远端分享 API”面板，可保存远端、检查远端、发布当前分享和复制远端链接。
- 新增 `scripts/share-repository-mock-server.js` 和 `docs/share-repository-api-contract.md`，本机 mock 支持 GET、PUT、OPTIONS、Bearer token、publicUrl 和回执。
- 数据层和 Playwright 覆盖分享包生成、mock server、Bearer token、publicUrl、回执持久化和前台按钮流程。

真实化说明：

- 数据来源：真实作品记录、本机分享链接、作品分享 HTML、用户配置的远端 endpoint 和真实 fetch 响应。
- 写入状态：`mr-calligraphy-learning-state-v1.shareService.remoteEndpoint`、`lastRemotePublicUrl`、`lastReceipt`、`receipts[*]` 和对应 `ShareRecord.remotePublicUrl`。
- 成功反馈：复盘区显示远端状态、publicUrl 和回执摘要，可复制远端链接。
- 失败反馈：非法协议、未配置 endpoint、fetch 不可用、HTTP 错误、非 JSON 和包结构错误都会写入分享服务错误状态。
- 刷新后复现方式：远端配置、publicUrl 和回执保存在 localStorage，刷新后仍能显示。

仍待补：

- 当前是用户自备 endpoint 的远端 adapter，不是内置账号系统、微信分享接口、班级作品墙、生产 CDN、访问权限服务或服务端撤销审计。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/share-repository-mock-server.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增作品分享远端发布`

### 2026-06-12：新增作品分享远端回执审计

完成内容：

- `shareService.receipts` 从内部状态暴露为可查看的作品分享远端回执审计。
- 新增 `getShareRepositoryReceiptAudit()`、`getShareRepositoryReceiptAuditExport()` 和 `downloadShareRepositoryReceiptAudit()`。
- 前台“远端分享 API”面板新增回执审计区、最近回执列表和“导出回执”按钮。
- 回执审计 HTML 会导出方向、分享 ID、作品 ID、publicUrl、HTML 字节数、仓库摘要、回执摘要、远端版本、endpoint、时间和原始 JSON。
- smoke test 新增前台回执审计 DOM 标记。
- `learning-state-check.js` 新增无回执不可导出、mock 推送后可导出和 HTML 内容断言。
- Playwright 主流程新增远端分享回执列表和下载文件内容验收。

真实化说明：

- 数据来源：远端分享 API 的 `receipt/latestReceipt` 和本机补充的方向、endpoint、收到时间。
- 写入状态：`mr-calligraphy-learning-state-v1.shareService.receipts[*]`。
- 成功反馈：复盘区显示回执数量，导出 HTML 中可核对 publicUrl 和 receiptDigest。
- 失败反馈：无回执时导出按钮禁用，API 返回“暂无可导出”。
- 刷新后复现方式：回执保存在本机学习状态中，刷新后仍可查看和导出。

仍待补：

- 当前仍是本机浏览器审计链，不是服务端不可篡改审计、账号权限审计、CDN 访问日志或远端撤销记录。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增分享远端回执审计`

### 2026-06-12：新增作品分享远端撤销

完成内容：

- 新增 `mr-calligraphy-share-repository-revoke-v1` 撤销请求体和 `MRAppState.getArtworkShareRemoteRevokePackage()`。
- 新增 `MRAppState.revokeArtworkShareRemote()`，对用户配置的分享 endpoint 发起真实 `DELETE`。
- `ShareRecord` 记录 `remoteRevokedAt` 和 `remoteRevokeReceiptDigest`，刷新后仍可追踪远端撤销。
- 前台远端分享面板新增“撤销远端”按钮。
- 远端回执审计方向支持 `revoke`，列表和 HTML 导出会显示“撤销”。
- 分享 mock server 支持 `DELETE`、撤销请求校验、`revokedShares` 内存记录和撤销回执。
- smoke test 新增撤销按钮 DOM 标记。
- 数据层和 Playwright 覆盖真实 DELETE、撤销请求体、Bearer token、撤销回执、本机状态和审计导出。

真实化说明：

- 数据来源：已远端发布的分享记录、远端 publicUrl、用户配置 endpoint/token 和服务端 DELETE 回执。
- 写入状态：`shareService.records[*].remoteRevokedAt`、`remoteRevokeReceiptDigest`、`lastRemoteDirection` 和 `receipts[*]`。
- 成功反馈：页面显示已请求远端撤销，分享记录显示“远端已撤销”，复制远端按钮禁用。
- 失败反馈：无远端发布记录、已撤销、未配置远端、fetch 不可用或 HTTP 错误都明确失败。
- 刷新后复现方式：撤销状态和撤销回执随学习状态持久化。

仍待补：

- 当前只是前端 adapter 对自备 API 的撤销请求；生产仍需要账号权限、服务端 URL 失效、CDN purge、访问日志、撤销审计和幂等防重复。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/share-repository-mock-server.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增分享远端撤销`

### 2026-06-12：真实化主后台基础物体更新

完成内容：

- 主后台“更新所选”按钮不再被 HTML 静态锁死，改由当前选中对象状态动态启用或禁用。
- 复用现有 `updateSelectedCustomObject()`，对新增基础物体的名称、类型、颜色和尺寸进行真实更新。
- 更新会写入 `mr-calligraphy-main-scene-layout-v1.customObjects[*]`，并可继续发布到 `mr-calligraphy-main-scene-published-v1`。
- smoke test 主后台页面标记新增基础物体新增/更新相关控件。
- Playwright 主后台主流程新增更新断言，确认草稿、本机发布版本和前台读取的发布布局都包含更新后的 cylinder 规格。

真实化说明：

- 数据来源：主后台基础物体表单和当前选中的自定义对象。
- 写入状态：`main-scene-layout` 草稿对象规格；发布后写入本机发布版本。
- 成功反馈：面板显示“已更新”，发布差异列表显示更新后的名称。
- 失败反馈：非新增基础物体、锁定、隐藏或删除对象不能更新，不伪造成功。
- 刷新后复现方式：刷新主后台后仍能从 localStorage 读取更新后的对象。

仍待补：

- 当前只覆盖基础几何体的结构更新；导入模型的材质编辑、网格替换和多人审计仍待后续生产化。

验收：

- `node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化主后台物体更新`

### 2026-06-12：真实化写实后台删除恢复

完成内容：

- 写实后台 smoke 标记新增对象坐标输入、撤回、删除和恢复控件。
- Playwright 写实后台主流程新增删除物体、恢复物体和撤回删除三段操作。
- 删除后验证 `#designObjectSelect option:checked` 显示“已删除”，删除按钮禁用、恢复按钮启用。
- 直接读取 `mr-calligraphy-realistic-layout-v1`，确认 `deleted` 字段真实写入 `true`，恢复和撤回后写回 `false`。
- 保留原发布/回滚流程，确认删除恢复验收不会破坏写实场景本机发布历史。

真实化说明：

- 数据来源：写实后台当前选中对象、对象操作按钮和撤回栈。
- 写入状态：`mr-calligraphy-realistic-layout-v1[objectId].deleted`。
- 成功反馈：下拉选项、按钮状态和本机布局字段同步变化。
- 失败反馈：按钮状态阻止重复删除或恢复，不出现无效成功提示。
- 刷新后复现方式：删除状态随写实草稿布局持久化。

仍待补：

- 当前覆盖内置写实对象的删除/恢复；导入模型资产清理、删除审计和多人权限仍需生产化。

验收：

- `node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "realistic admin keeps local publish releases and rollback history"`
- `git diff --check`

提交：

- 中文 commit message：`真实化写实后台删除恢复`

### 2026-06-12：新增主后台导入删除审计

完成内容：

- 主后台导入模型区新增“导入模型删除审计”列表和“导出审计”按钮。
- 删除导入模型时写入 `mr-calligraphy-main-import-audit-v1`，记录模型 ID、dbKey、标签、文件名、SHA-256、文件大小、快照引用状态和清理结果。
- 清理结果区分文件已清理、历史保留、清理失败和仅移除布局。
- 被历史快照引用的导入模型会明确记录“历史保留”，避免误报为已清理。
- `window.MRMainImportAudit.getAuditLog()` 和 `getAuditExport()` 可用于浏览器验收和人工排查。
- smoke test 主后台标记新增导入删除审计控件。
- Playwright 新增真实 `.glb` 导入、删除、刷新持久化和 HTML 审计下载测试。

真实化说明：

- 数据来源：主后台真实导入模型记录、IndexedDB 模型文件、当前布局和本机快照历史。
- 写入状态：`mr-calligraphy-main-import-audit-v1.records[*]`。
- 成功反馈：审计列表显示模型、清理状态、SHA 短码和文件大小；HTML 导出包含完整 SHA。
- 失败反馈：文件清理失败写入 `delete-failed`；历史快照仍引用时写入 `retained-for-history`。
- 刷新后复现方式：审计记录保存在 localStorage，刷新主后台后仍可查看和导出。

仍待补：

- 当前是本机浏览器导入资产删除审计；服务端不可篡改审计、账号权限、远端资产签名、云端垃圾回收和多人协作资产生命周期仍待补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "main admin records imported model deletion audit"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增主后台导入删除审计`

### 2026-06-12：新增写实导入删除审计

完成内容：

- 写实后台导入模型区新增“导入删除审计”列表和“导出审计”按钮。
- 删除写实导入模型时写入 `mr-calligraphy-realistic-import-audit-v1`，记录模型 ID、dbKey、标签、文件名、SHA-256、文件大小和结果。
- 恢复写实导入模型时记录 `restored` 动作，明确该能力是本机软删除和恢复。
- 审计结果使用 `soft-deleted-retained` 表示模型隐藏但资产文件保留在 IndexedDB。
- `window.MRRealisticImportAudit.getAuditLog()` 和 `getAuditExport()` 可用于浏览器验收和人工排查。
- smoke test 写实后台标记新增导入删除审计控件。
- Playwright 新增真实 `.glb` 导入、软删除、恢复、刷新持久化和 HTML 审计下载测试。

真实化说明：

- 数据来源：写实后台真实导入模型记录、IndexedDB 模型文件和写实草稿布局。
- 写入状态：`mr-calligraphy-realistic-import-audit-v1.records[*]` 和 `mr-calligraphy-realistic-layout-v1[modelId].deleted`。
- 成功反馈：审计列表显示模型、软删除/恢复结果、SHA 短码和文件大小；HTML 导出说明资产保留边界。
- 失败反馈：没有审计记录时导出按钮禁用，直接调用导出 API 会返回明确空状态。
- 刷新后复现方式：审计记录保存在 localStorage，刷新写实后台后仍可查看和导出。

仍待补：

- 当前是本机写实导入模型软删除审计；本机 IndexedDB 物理清理已在后续“清理已删除文件”中补齐，服务端资产删除、CDN purge、账号权限审计和不可篡改日志仍待补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "realistic admin records imported model deletion audit"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增写实导入删除审计`

### 2026-06-12：真实化主后台导入外观编辑

完成内容：

- 主后台导入模型区新增“导入模型外观”控件，包含主色调选择和更新按钮。
- `main-admin-scene.js` 为导入模型记录新增 `color` 字段，并在导入、选中、更新和撤销流程中保持同步。
- 更新外观时会克隆并替换导入模型 mesh 材质，后台 Three.js 画布即时显示新颜色。
- 颜色写入 `mr-calligraphy-main-scene-layout-v1.importedModels[*].color`，发布后同步进入 `mr-calligraphy-main-scene-published-v1.layout.importedModels[*].color`。
- 前台 `script.js` 读取导入模型 `color`，GLB 和 OBJ 都会按该主色调生成渲染顶点。
- smoke test 主后台标记新增 `mainImportModelColor`、`mainImportModelMaterialUpdate` 和 `mainImportMaterialStatus`。
- Playwright 新增真实 `.glb` 导入、更新主色调、草稿持久化、发布持久化和前台发布布局读取测试。

真实化说明：

- 数据来源：主后台真实导入模型记录、IndexedDB 模型文件、主场景草稿布局和本机发布快照。
- 写入状态：`mr-calligraphy-main-scene-layout-v1.importedModels[*].color` 和 `mr-calligraphy-main-scene-published-v1.layout.importedModels[*].color`。
- 成功反馈：选中导入模型后载入当前颜色，点击更新后状态显示已更新并立即刷新后台材质。
- 失败反馈：未选中导入模型、隐藏、锁定或删除时更新按钮禁用，状态文本说明原因。
- 刷新后复现方式：刷新主后台或打开前台发布页，颜色仍由本机布局读取。

仍待补：

- 当前完成主色调覆盖；贴图替换、透明度、PBR 参数、导入文件替换、版本差异对比、写实后台导入模型外观编辑和多人审计仍待补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "main admin updates imported model material"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化主后台导入外观编辑`

### 2026-06-12：真实化写实后台导入外观编辑

完成内容：

- 写实后台导入模型区新增“导入模型外观”控件，包含主色调选择和更新按钮。
- `realistic-scene.js` 为写实导入模型记录新增 `color` 字段，并在导入、选中、更新、撤销和发布读取流程中保持同步。
- 更新外观时会克隆并替换导入模型 mesh 材质，写实后台 Three.js 画布即时显示新颜色。
- 颜色写入 `mr-calligraphy-realistic-layout-v1.importedModels[*].color`，发布后同步进入 `mr-calligraphy-realistic-published-v1.layout.importedModels[*].color`。
- `window.MRRealisticScene.getLayout()` 可用于写实演示页验收当前读取布局。
- smoke test 写实后台标记新增 `realisticImportModelColor`、`realisticImportModelMaterialUpdate` 和 `realisticImportMaterialStatus`。
- Playwright 新增真实 `.glb` 导入、更新主色调、草稿持久化、发布持久化和写实演示页发布布局读取测试。

真实化说明：

- 数据来源：写实后台真实导入模型记录、IndexedDB 模型文件、写实草稿布局和本机发布快照。
- 写入状态：`mr-calligraphy-realistic-layout-v1.importedModels[*].color` 和 `mr-calligraphy-realistic-published-v1.layout.importedModels[*].color`。
- 成功反馈：选中写实导入模型后载入当前颜色，点击更新后状态显示已更新并立即刷新后台材质。
- 失败反馈：未选中导入模型或模型已删除时更新按钮禁用，状态文本说明原因。
- 刷新后复现方式：刷新写实后台或打开写实演示页，颜色仍由本机布局读取。

仍待补：

- 当前完成主色调覆盖；贴图替换、透明度、PBR 参数、导入文件替换、版本差异对比、服务端资产签名和多人审计仍待补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "realistic admin updates imported model material"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化写实导入外观编辑`

### 2026-06-12：真实化导入模型透明度编辑

完成内容：

- 主后台和写实后台导入模型外观区新增透明度滑杆和数值显示。
- `main-admin-scene.js` 与 `realistic-scene.js` 为导入模型记录新增 `opacity` 字段，旧数据默认按 `1` 读取，编辑范围限制为 `0.2-1`。
- 导入、选中、更新、撤销和发布读取流程会同步透明度。
- 后台 Three.js 材质更新会写入 `opacity`、`transparent` 和 `depthWrite`，半透明效果即时显示。
- 主后台透明度写入 `mr-calligraphy-main-scene-layout-v1.importedModels[*].opacity`，发布后进入 `mr-calligraphy-main-scene-published-v1.layout.importedModels[*].opacity`。
- 写实后台透明度写入 `mr-calligraphy-realistic-layout-v1.importedModels[*].opacity`，发布后进入 `mr-calligraphy-realistic-published-v1.layout.importedModels[*].opacity`。
- 普通前台 `script.js` 的 WebGL 顶点格式从 RGB 扩展为 RGBA，导入 GLB / OBJ 时会按发布布局透明度生成 alpha，并启用 alpha blend。
- smoke test 主后台和写实后台标记新增透明度控件。
- Playwright 更新主后台和写实后台导入外观用例，覆盖真实 `.glb` 导入、透明度更新、草稿、发布和演示页布局读取。

真实化说明：

- 数据来源：真实导入模型记录、IndexedDB 模型文件、草稿布局和发布快照。
- 写入状态：`importedModels[*].opacity`，发布后进入各自 published layout。
- 成功反馈：选中模型时滑杆回填，更新后后台画布即时显示透明效果。
- 失败反馈：未选中导入模型、隐藏、锁定或删除时更新按钮禁用，状态文本说明原因。
- 刷新后复现方式：刷新后台或打开演示页，透明度仍由本机布局读取。

仍待补：

- 当前完成主色调和透明度；贴图替换、PBR 参数、导入文件替换、版本差异对比、服务端资产签名和多人审计仍待补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型透明度编辑`

### 2026-06-12：真实化导入模型文件替换

完成内容：

- 主后台和写实后台导入模型外观区新增“替换当前模型”文件选择器。
- 主后台替换会保留原导入对象 `id/dbKey/label/color/opacity`，更新 `fileName/type/sha256/metrics/baseScale`，并覆盖 IndexedDB 中同一 `dbKey` 的二进制。
- 写实后台替换会保留原导入对象 `id/dbKey/label/color/opacity`，更新 `fileName/type/sha256/metrics`，并覆盖写实模型仓库。
- 替换后后台 Three.js 画布会释放旧 mesh 的几何体/材质，加载新模型并重新注册可选中 mesh。
- 替换动作可撤销，撤销会恢复旧导入记录和旧模型二进制。
- 发布后，替换后的文件记录进入主前台和写实演示页各自 published layout。
- 普通前台 `script.js` 保留导入模型 `sha256` 和 `metrics`，便于验收发布页读取的替换资产。
- smoke test 主后台和写实后台标记新增替换文件控件。
- Playwright 新增主后台和写实后台真实 `.glb` 导入、替换为另一个 `.glb`、草稿、发布和演示页布局读取测试。

真实化说明：

- 数据来源：真实文件选择器、GLB/OBJ 解析、IndexedDB 模型仓库、草稿布局和发布快照。
- 写入状态：`importedModels[*].fileName/type/sha256/metrics/baseScale` 和同一 `dbKey` 的 IndexedDB 二进制。
- 成功反馈：状态栏显示替换文件名和模型 metrics，后台画布立即显示替换后的模型。
- 失败反馈：未选中导入模型、隐藏、锁定、删除、文件为空、格式错误或解析失败时均显示明确错误。
- 刷新后复现方式：刷新后台或打开演示页，替换后的文件记录和模型二进制仍从本机存储读取。

仍待补：

- 当前完成主色调、透明度和文件替换；贴图替换、PBR 参数、版本差异对比、服务端资产签名和多人审计仍待补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "replaces imported model file"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型文件替换`

### 2026-06-12：真实化导入模型 PBR 参数编辑

完成内容：

- 主后台和写实后台导入模型外观区新增粗糙度、金属度滑杆和数值显示。
- 主后台导入模型记录新增 `roughness/metalness`，默认值为 `0.64/0.02`，编辑范围分别限制为 `0.05-1` 和 `0-1`。
- 写实后台导入模型记录新增 `roughness/metalness`，默认值为 `0.62/0.04`，编辑范围分别限制为 `0.05-1` 和 `0-1`。
- 导入、选中、更新、撤销、替换文件和发布读取流程会同步 PBR 参数。
- 后台 Three.js 材质更新会写入 `roughness` 和 `metalness`，材质变化即时显示。
- 普通前台 `script.js` 增加材质 attribute 和 shader 高光计算，发布页会按导入模型 PBR 参数渲染。
- 普通前台 WebGL 顶点步长统一为 14 个 float，同时修正局部几何变换时的 RGBA / normal 步长错位。
- smoke test 主后台和写实后台标记新增 PBR 控件。
- Playwright 更新主后台和写实后台导入外观用例，覆盖真实 `.glb` 导入、PBR 更新、草稿、发布和演示页布局读取。

真实化说明：

- 数据来源：真实导入模型记录、IndexedDB 模型文件、草稿布局和发布快照。
- 写入状态：`importedModels[*].roughness` 与 `importedModels[*].metalness`，发布后进入各自 published layout。
- 成功反馈：选中模型时滑杆回填，更新后后台画布即时显示材质变化。
- 失败反馈：未选中导入模型、隐藏、锁定或删除时更新按钮禁用，状态文本说明原因。
- 刷新后复现方式：刷新后台或打开演示页，PBR 参数仍由本机布局读取。

仍待补：

- 当前完成主色调、透明度、文件替换和 PBR 参数；贴图替换、版本差异对比、服务端资产签名和多人审计仍待补齐。

GitHub 状态：

- 本机代理可用，`git push origin main` 已通过代理重试，远端 `main` 能读取到上一笔中文提交。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js && node --check script.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型PBR参数编辑`

### 2026-06-12：真实化导入模型发布差异明细

完成内容：

- 主后台发布差异从签名级“修改：导入模型”升级为字段级摘要。
- 主后台导入模型新增差异会列出文件名、SHA、颜色、透明度、粗糙度、金属度和位置/缩放。
- 主后台导入模型修改差异会显示旧值到新值，例如颜色、透明度、PBR 参数、文件名、SHA、位置和缩放变化。
- 主后台导入模型删除差异会标注“将从发布版本移除”，并保留资产摘要。
- 写实后台发布差异同步支持导入模型文件、SHA、颜色、透明度、粗糙度、金属度和位置旋转摘要。
- Playwright 导入模型材质用例新增差异明细断言，验证新增差异和发布后草稿修改差异都显示具体字段。

真实化说明：

- 数据来源：真实草稿 layout、已发布 layout 和归一化导入模型记录。
- 写入状态：不新增存储字段，发布差异列表由草稿和发布快照实时计算。
- 成功反馈：发布前能看到具体字段变化，降低误发布风险。
- 失败反馈：无差异时继续显示草稿与发布版本一致。
- 刷新后复现方式：刷新后台后会重新读取本机草稿和已发布版本并计算相同差异。

仍待补：

- 当前完成导入模型发布差异明细；贴图替换、服务端资产签名、账号权限审计和多人协作三方合并仍待补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型发布差异明细`

### 2026-06-12：真实化写实导入模型物理清理

完成内容：

- 写实后台导入删除审计区新增“清理已删除文件”按钮，并纳入 `real-local` 控件清单。
- 按钮只在存在已软删除导入模型时启用，清理前弹出确认。
- 清理成功会删除 IndexedDB `mr-calligraphy-model-store.models` 中对应的导入模型二进制。
- 清理成功会从 `mr-calligraphy-realistic-layout-v1.importedModels` 和 `layout[modelId]` 移除该模型，并同步移除当前场景对象和选择器选项。
- 审计日志新增 `storage-deleted` 与 `delete-failed`，清理失败时保留草稿记录。
- HTML 审计导出说明软删除默认保留资产，执行清理后才删除本机 IndexedDB 文件。
- Playwright 扩展写实导入模型删除审计用例，覆盖软删除、恢复、再次删除、确认清理、IndexedDB 删除、草稿记录移除、刷新后审计和下载文件内容。

真实化说明：

- 数据来源：真实写实导入模型记录、写实草稿 layout 和 IndexedDB 模型仓库。
- 写入状态：删除 `importedModels[*]`、删除对象状态、写入 `mr-calligraphy-realistic-import-audit-v1.records[*].cleanupStatus = "storage-deleted"`。
- 成功反馈：页面状态显示清理数量，审计列表显示“文件已清理”，无待清理模型时按钮禁用。
- 失败反馈：IndexedDB 删除失败会写入 `delete-failed`，并保留草稿记录与场景对象。
- 刷新后复现方式：被清理模型不再从草稿恢复，审计记录仍持久化。

仍待补：

- 当前完成本机 IndexedDB 物理清理；服务端资产删除、CDN purge、远端资产签名、账号权限审计和多人协作审计仍待补齐。

验收：

- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "realistic admin records imported model deletion audit"`
- `git diff --check`

提交：

- 中文 commit message：`真实化写实导入模型物理清理`

### 2026-06-12：真实化前台学习详情总结

完成内容：

- 前台最后一步“查看详情”由单行 `getReportPreview()` 反馈升级为结构化详情面板。
- `script.js` 新增 `buildCompletionDetail()`，读取 `MRAppState.getStats()` 和 `MRAppState.getLearningPathStatus()`。
- 详情面板展示路径完成步数、任务完成状态、真实练习次数、作品数量、报告数量和平均评分。
- 详情徽章展示 10 个学习步骤的完成状态，避免最后总结页仍像静态文案。
- 详情列表展示最近作品、最近报告、学习计划和下一步建议；缺少数据时显示空状态。
- Playwright 前台完整流程验证真实练习、作品和报告之后，点击“查看详情”会显示本机学习详情。

真实化说明：

- 数据来源：浏览器本机学习状态、学习路径状态、作品记录、报告记录和计划记录。
- 写入状态：不新增字段，详情实时计算。
- 成功反馈：`#actionFeedback` 显示已读取本机学习详情，`#actionDetail` 展示指标和步骤徽章。
- 失败反馈：没有作品、报告或计划时显示明确空状态，不伪造完成数据。
- 刷新后复现方式：本机状态保留后，刷新进入第 10 步仍可重新生成详情。

仍待补：

- 当前完成前台“查看详情”真实化；移动端视口已在后续记录完成，导入模型贴图替换已在后续记录完成；服务端资产回收、账号权限和多人协作审计仍待补齐。

验收：

- `node --check script.js && node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`真实化前台学习详情总结`

### 2026-06-12：真实化移动端视口验收

完成内容：

- Playwright 新增手机视口用例，使用 390×844 打开前台、主后台、写实后台和写实演示页。
- 验收页面真实 `scrollWidth`，确认核心入口没有横向溢出。
- 验收 `.scene-heading`、`.mr-main-panel`、后台 header、权限风险提示、编辑面板和写实演示说明面板均停留在手机视口内。
- 验收前台主面板、主后台风险提示与编辑面板、写实后台风险提示与编辑面板、写实演示 header 与说明面板互不遮挡。
- 验收继续采样 `#roomCanvas`、`#mainAdminCanvas` 和 `#realisticCanvas`，确认移动端下仍有非空画布输出。
- 修复写实后台移动布局：风险提示条限制高度并可滚动，设计面板固定在提示下方并独立滚动，避免窄屏遮住真实控制项。

真实化说明：

- 数据来源：真实浏览器布局盒、真实滚动宽度和真实 canvas 像素。
- 写入状态：只调整移动端 CSS 和 E2E 验收，不改业务存储结构。
- 成功反馈：定向 Playwright 用例通过，说明四个入口在手机视口下可访问核心控制。
- 失败反馈：后续若面板越界或互相覆盖，测试会输出具体冲突选择器。
- 刷新后复现方式：手机宽度打开 `realistic-admin.html`，权限提示和编辑面板保持上下分层，编辑面板可滚动。

仍待补：

- 当前完成核心入口手机视口验收；导入模型贴图替换已在后续记录完成；服务端资产回收、账号权限、多用户协作审计、更多设备尺寸和全部触屏下载路径仍待补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "mobile viewports keep core panels usable"`
- `git diff --check`

提交：

- 中文 commit message：`真实化移动端视口验收`

### 2026-06-12：真实化导入模型贴图替换

完成内容：

- 主后台和写实后台导入模型外观区新增“替换当前贴图”，支持 PNG、JPG 和 WebP。
- 新增贴图校验与规范化：限制空文件、未知格式和超过 8MB 的图片。
- 贴图上传后读取真实 ArrayBuffer，计算 SHA-256，并以独立 dbKey 存入对应 IndexedDB 模型仓库。
- 导入模型记录新增 `texture` 摘要，包含 dbKey、文件名、类型、MIME、SHA-256、文件大小和更新时间。
- 后台 Three.js 加载导入模型时会读取贴图资产并挂到材质 `map`，换贴图后即时刷新。
- 换贴图进入撤销栈，撤销会按旧记录重新读取贴图或清空贴图，避免界面材质和布局记录错位。
- 发布差异新增贴图名称和贴图 SHA 摘要。
- 前台主场景 WebGL 会读取发布布局贴图记录，从 IndexedDB 取回贴图二进制，为带贴图导入模型单独绘制 textured mesh。
- GLB 前台解析新增 `TEXCOORD_0` 支持，OBJ 前台解析新增 `vt` 支持。
- Playwright 已覆盖主后台和写实后台真实贴图上传、草稿/发布持久化、IndexedDB 资产存在、发布差异和前台/演示页读取。

真实化说明：

- 数据来源：用户上传的真实图片文件、浏览器 IndexedDB 和本机发布布局。
- 写入状态：主后台写入 `mr-calligraphy-main-model-store`；写实后台写入 `mr-calligraphy-model-store`。
- 成功反馈：后台显示“已替换贴图”，发布差异显示贴图，前台可通过 `MR_LOADED_TEXTURED_MODEL_COUNT` 验证贴图模型加载。
- 失败反馈：无选中模型、不可编辑状态、空贴图、错误格式或超限文件都会明确失败。
- 刷新后复现方式：刷新后台或进入发布页，贴图记录和贴图资产仍可读取。

仍待补：

- 当前完成本机导入模型贴图替换；项目档案完整贴图打包和选择恢复已在后续“真实化项目档案贴图资产恢复”记录完成，贴图移除/恢复原材质已在后续“真实化导入模型贴图移除”记录完成；服务端资产签名、CDN purge、账号权限和多人协作审计仍待补齐。

验收：

- `node --check script.js && node --check tests/e2e/real-flows.spec.js`
- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型贴图替换`

### 2026-06-12：真实化项目档案贴图资产恢复

完成内容：

- `projectSchema.assetManifest` 把导入模型贴图纳入资产清单，新增 `assetKind: "texture"`、`modelId`、`textureAssetCount` 和 `missingTextureBinaryCount`。
- 资产记录按 `id/dbKey/key` 多键索引，兼容主后台和写实后台不同 IndexedDB keyPath。
- 项目仓库 summary 新增贴图资产数量，场景资产状态显示“导入模型 + 贴图”。
- 项目档案导入预览区分新增/修改/删除模型和新增/修改/删除贴图。
- 选择性恢复模型时自动扩展 `texture.dbKey` 依赖，把同档案内的贴图记录一起恢复。
- 资产哈希校验覆盖自动依赖贴图；贴图二进制哈希不匹配时会阻止恢复并保持 localStorage 未写入。
- 恢复审计摘要改为“导入资产/资产哈希”，统计自动依赖的贴图资产。
- 脚本测试覆盖资产清单贴图统计、选择恢复模型携带贴图、错误贴图哈希阻断恢复。

真实化说明：

- 数据来源：真实项目档案 IndexedDB 快照、模型记录中的 `texture.dbKey`、贴图记录的二进制与 SHA-256。
- 写入状态：恢复时模型和贴图写回同一 IndexedDB 模型仓库，布局记录继续保存可校验摘要。
- 成功反馈：导入预览能看见贴图差异，项目仓库能显示贴图数量，只恢复模型也不会丢贴图。
- 失败反馈：贴图记录缺二进制会进入资产缺失提醒；贴图哈希错误会直接阻断恢复。
- 刷新后复现方式：恢复带贴图项目档案后刷新后台/发布页，模型贴图仍从 IndexedDB 读取。

仍待补：

- 当前完成本机项目档案贴图资产打包、校验和选择恢复；贴图移除/恢复原材质已在后续“真实化导入模型贴图移除”记录完成；远端资产签名、CDN purge、账号权限和多人协作审计仍未完成。

验收：

- `node --check project-archive.js && node --check project-schema-utils.js`
- `node scripts/project-schema-check.js`
- `node scripts/archive-asset-hash-check.js`
- `node scripts/archive-migration-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`真实化项目档案贴图资产恢复`

### 2026-06-12：真实化导入模型贴图移除

完成内容：

- 主后台和写实后台导入模型外观区域新增“移除当前贴图”按钮。
- 按钮状态跟随选中对象、隐藏/锁定/删除状态和当前模型是否已有贴图。
- 点击后清空当前布局记录 `texture`，并重新应用颜色、透明度、粗糙度和金属度材质。
- 移除贴图进入现有外观撤销栈，撤销时会重新读取旧贴图资产并恢复。
- 不物理删除 IndexedDB 贴图二进制，避免历史快照或已发布版本仍引用的贴图失效。
- 发布差异显示 `贴图 文件名 → 空`，重新上传同一贴图后仍可继续发布。
- E2E 覆盖主后台和写实后台上传、移除、草稿置空、资产保留、重新上传和发布读取。

真实化说明：

- 数据来源：真实导入模型草稿记录、贴图 dbKey、IndexedDB 资产仓库和发布差异。
- 写入状态：只修改当前草稿 layout 的 `texture` 引用，不删除资产文件。
- 成功反馈：状态栏显示已移除贴图，按钮禁用，发布差异显示贴图移除。
- 失败反馈：未选中导入模型、不可编辑或当前无贴图时不执行假成功。
- 刷新后复现方式：移除后刷新后台仍无自定义贴图；重新上传并发布后前台/演示页仍可读取贴图。

仍待补：

- 当前完成本机贴图移除和恢复原材质；远端资产签名、云端垃圾回收、CDN purge、账号权限和多人协作审计仍未完成。

验收：

- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型贴图移除`

### 2026-06-12：真实化远端发布资产签名回执

完成内容：

- `project-remote-publish.js` 的远端发布 `assetManifest` 从“导入模型文件”扩展为“导入模型文件 + 导入模型贴图”，新增 `assetKind`、`modelId`、`assetCount`、`modelAssetCount` 和 `textureAssetCount`。
- 远端发布预检会校验贴图资产清单与 `importedModels[*].texture.dbKey` 是否一致，贴图清单被删或篡改时不再放行。
- 远端发布回执新增 `assetSignatureSummary` 和 `assetSignatures` 规范化，主后台与写实后台回执列表显示“资产签名 N”。
- 回执审计 HTML 新增 `Asset Signatures` 字段，并保留服务端原始签名 JSON。
- `scripts/remote-publish-mock-server.js` 对每个带 SHA-256 的模型/贴图资产生成 HMAC-SHA256 开发签名回执；缺哈希资产只返回 warning。
- `docs/remote-publish-api-contract.md` 补充模型/贴图资产清单字段、资产签名回执结构和 mock 服务验收边界。
- `scripts/remote-publish-check.js` 覆盖模型/贴图资产清单、签名摘要、签名明细、mock HMAC 回执、审计导出和持久化。

真实化说明：

- 数据来源：当前本机发布版本里的导入模型、贴图引用、SHA-256、远端 POST 响应和 mock 服务 HMAC 回执。
- 写入状态：远端推送成功后，资产签名摘要与明细写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts[*]`。
- 成功反馈：后台远端发布回执列表显示资产签名数量，HTML 审计导出包含签名摘要和原始回执。
- 失败反馈：缺哈希资产不会生成假签名，只进入 warning；资产清单与布局不一致会预检失败。
- 刷新后复现方式：远端回执保存在本机远端发布状态中，刷新后台后仍可查看最近资产签名摘要。

仍待补：

- 当前完成的是远端发布 mock/HMAC 开发签名回执；CDN 上传回执已在后续“真实化远端发布 CDN 上传回执”记录完成。它仍不是生产证书签名、账号权限审计或服务端不可篡改审计链。

验收：

- `node --check project-remote-publish.js`
- `node --check scripts/remote-publish-mock-server.js`
- `node --check scripts/remote-publish-check.js`
- `node scripts/remote-publish-check.js`
- `git diff --check`

提交：

- 中文 commit message：`真实化远端发布资产签名回执`

### 2026-06-12：真实化远端发布撤销与 CDN purge 回执

完成内容：

- 主后台和写实后台远端发布面板新增“撤销远端”按钮，只有最近回执是可撤销发布且 endpoint 已配置时才启用。
- `project-remote-publish.js` 新增 `mr-calligraphy-remote-publish-revoke-v1` 撤销包、真实 `DELETE` 请求、撤销回执规范化和 `lastRemoteDirection = "revoke"` 状态。
- 撤销成功后会清空本机发布锁，避免已撤销的发布包继续阻塞后续重新发布。
- 回执审计新增 `direction`、`sourcePackageId`、`revokedAt` 和 `cdnPurgeSummary`，HTML 导出显示 `CDN Purge` 字段。
- 主后台和写实后台回执列表会区分“发布 / 撤销”，撤销回执显示 `purge N`。
- `scripts/remote-publish-mock-server.js` 支持真实 HTTP `DELETE`，按 `sourcePackageId` / `releaseId` / `packageDigest` 匹配原发布回执，返回 mock CDN purge 摘要，并解除重复 digest 锁。
- `scripts/remote-publish-check.js` 覆盖 fake fetch 和真实 mock server 两条撤销路径，验证 DELETE body、撤销后禁用按钮状态、CDN purge 持久化和撤销后重新发布。
- 主后台 E2E 在远端发布后点击“撤销远端”，验证 DELETE 请求、回执列表、CDN purge 文案和本机状态持久化。
- `docs/remote-publish-api-contract.md` 补齐 `DELETE` 合同、撤销包、撤销回执和 CDN purge 摘要字段。

真实化说明：

- 数据来源：最近远端发布回执、原发布 `packageDigest` / `releaseId` / `packageId`、远端 DELETE 响应和 CDN purge 摘要。
- 写入状态：撤销成功后写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts[0]`，并保存 `lastRevokedAt` 与 `lastRemoteDirection`。
- 成功反馈：后台状态显示远端撤销结果，回执列表显示“撤销”和 purge 数量，审计导出包含 CDN purge 摘要。
- 失败反馈：无 endpoint、无可撤销发布、远端拒绝或网络异常时不会伪造成功。
- 刷新后复现方式：撤销回执保存在本机远端发布状态中，刷新后台仍能看到撤销方向和 CDN purge 摘要。

仍待补：

- 当前是用户自备 endpoint 与本机 mock 服务的开发验收；不是生产 CDN 实际失效保证、账号权限、服务端不可篡改审计或发布审批系统。

验收：

- `node --check project-remote-publish.js`
- `node --check scripts/remote-publish-mock-server.js`
- `node --check scripts/remote-publish-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/remote-publish-check.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`真实化远端发布撤销回执`

### 2026-06-12：真实化远端发布 CDN 上传回执

完成内容：

- `project-remote-publish.js` 新增 `cdnUploadSummary` 规范化，发布回执会持久化 CDN 上传状态、provider、request id、URL 数量、base URL 和资产摘要。
- 主后台和写实后台远端发布回执列表新增 `CDN N` 元信息，和资产签名、撤销 purge 信息一起展示。
- 回执审计 HTML 新增 `CDN Upload` 字段，保留服务端原始 receipt 里的 mock CDN URL 明细。
- `scripts/remote-publish-mock-server.js` 在真实 POST 接收发布包后，为每个已签名模型/贴图资产生成 `cdnUploadSummary.assetUrls[*]` mock CDN URL。
- `scripts/remote-publish-check.js` 覆盖 fake fetch 和真实 mock server 的 CDN upload 摘要、URL 数量、provider、审计导出和持久化。
- 主后台 E2E 模拟远端发布返回 CDN upload 摘要，验证回执列表显示 `CDN 1` 且 localStorage 持久化。
- `docs/remote-publish-api-contract.md` 补齐 POST 成功回执里的 CDN upload 字段和 mock/生产边界。
- `scripts/smoke-test.js` 增加两个后台远端撤销按钮标记，`docs/smoke-test.md` 同步远端发布检查范围。

真实化说明：

- 数据来源：远端 POST 成功响应中的 `cdnUploadSummary` 和 mock server 根据已签名资产生成的 URL 明细。
- 写入状态：写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts[*].cdnUploadSummary`。
- 成功反馈：后台回执列表显示 `CDN N`，审计导出显示 CDN provider、request id、URL 数量和 base URL。
- 失败反馈：没有服务端返回 CDN upload 字段时不会伪造成功，只显示“无 CDN upload 回执”。
- 刷新后复现方式：刷新后台后仍可从远端发布回执审计读取 CDN 上传摘要。

仍待补：

- 当前是开发级 mock CDN URL 回执；不是生产 CDN 实际上传、账号空间隔离、CDN 回调验签或不可篡改服务端审计。

验收：

- `node --check project-remote-publish.js`
- `node --check scripts/remote-publish-mock-server.js`
- `node --check scripts/remote-publish-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/remote-publish-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`真实化远端发布CDN上传回执`

### 2026-06-12：新增计划仓库空间隔离

完成内容：

- 前台“远端 API 同步”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- 计划仓库同步包新增顶层 `workspaceId` 和 `source.workspaceId`，远端请求统一携带 `X-MR-Workspace-Id`。
- 计划仓库状态、远端检查、推送、拉取、回执审计和导出 HTML 都会显示当前 workspace。
- `scripts/plan-repository-mock-server.js` 改为按 workspace 分桶保存计划包和回执，`class-a` 与 `class-b` 不再互相覆盖。
- 数据层、mock server 和 E2E 验收补充 Workspace header、包字段、回执持久化和空间切换回读。

真实化说明：

- 数据来源：用户配置的远端计划仓库 endpoint/token/workspace、本机计划同步包和远端返回回执。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.planRepository.workspaceId`、远端包 `workspaceId`、最近回执和回执列表。
- 成功反馈：计划同步状态会显示空间，回执列表显示 workspace，mock 服务能分别读取不同空间最近包。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON 或推送失败仍会写入本机错误，不清空本机计划。
- 刷新后复现方式：Workspace 保存在本机学习状态，刷新后仍会继续用同一空间推送和拉取。

仍待补：

- 当前是账号化前的空间隔离 adapter，不是完整登录、角色权限、教师端排课、后台推送提醒或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/plan-repository-mock-server.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front plan repository detects remote conflicts and saves a remote copy"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划仓库空间隔离`

### 2026-06-12：新增学习档案仓库空间隔离

完成内容：

- 前台“远端学习档案 API”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- 学习档案仓库同步包新增顶层 `workspaceId` 和 `source.workspaceId`，远端请求统一携带 `X-MR-Workspace-Id`。
- 学习档案仓库状态、远端检查、推送和拉取都会显示当前 workspace。
- `scripts/history-repository-mock-server.js` 改为按 workspace 分桶保存学习档案包和回执，`history-alpha` 与 `history-beta` 不再互相覆盖。
- 数据层、mock server 和 E2E 验收补充 Workspace header、包字段、本机状态持久化、空间切换回读、分页追取和冲突审计。
- `docs/history-repository-api-contract.md` 同步 Workspace header、包字段、mock 隔离和生产边界。

真实化说明：

- 数据来源：用户配置的远端学习档案 endpoint/token/workspace、本机练习/作品/报告同步包和远端返回。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.historyRepository.workspaceId`、远端包 `workspaceId` 和 mock server workspace 分桶。
- 成功反馈：学习档案同步状态会显示空间，mock 服务能分别读取不同空间最近包。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON 或推送失败仍会写入本机错误，不清空本机学习档案。
- 刷新后复现方式：Workspace 保存在本机学习状态，刷新后仍会继续用同一空间推送和拉取。

仍待补：

- 当前是账号化前的空间隔离 adapter，不是完整登录、角色权限、教师端批注审计、长期归档或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/history-repository-mock-server.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `npm run test:e2e -- --grep "front history repository handles network, paged pull, and id conflicts"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案仓库空间隔离`

### 2026-06-12：新增报告仓库空间隔离

完成内容：

- 前台“远端报告 API”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- 报告仓库同步包新增顶层 `workspaceId` 和 `source.workspaceId`，远端请求统一携带 `X-MR-Workspace-Id`。
- 报告仓库状态、远端检查、推送、拉取、签名回执列表和回执审计 HTML 都会显示当前 workspace。
- `scripts/report-repository-mock-server.js` 改为按 workspace 分桶保存报告包和签名回执，`report-alpha` 与 `report-beta` 不再互相覆盖。
- 数据层、mock server 和 E2E 验收补充 Workspace header、包字段、签名回执 workspace、本机状态持久化、空间切换回读和冲突审计继续可用。
- `docs/report-repository-api-contract.md` 同步 Workspace header、包字段、签名字段、mock 隔离和生产边界。

真实化说明：

- 数据来源：用户配置的远端报告 endpoint/token/workspace、本机报告同步包、本机验真摘要和远端签名回执。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.reportRepository.workspaceId`、远端包 `workspaceId`、最近签名回执、回执列表和 mock server workspace 分桶。
- 成功反馈：报告同步状态会显示空间，回执列表显示 workspace，mock 服务能分别读取不同空间最近包。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON 或推送失败仍会写入本机错误，不清空本机报告。
- 刷新后复现方式：Workspace 保存在本机学习状态，刷新后仍会继续用同一空间推送和拉取。

仍待补：

- 当前是账号化前的空间隔离 adapter，不是完整登录、角色权限、生产证书签名、教师端批注审计、长期归档或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/report-repository-mock-server.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库空间隔离`

### 2026-06-12：新增项目仓库空间隔离

完成内容：

- 主后台“远端项目仓库 API”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- 项目仓库包新增顶层 `workspaceId`，远端 GET / PUT 请求统一携带 `X-MR-Workspace-Id`。
- 项目仓库远端状态、版本列表、回执列表和回执审计 HTML 都会显示当前 workspace。
- 切换 endpoint 或 workspace 时会清空当前远端版本和回执视图，避免跨空间误读。
- `scripts/project-repository-mock-server.js` 改为按 workspace 分桶保存项目仓库包、回执和版本历史。
- E2E 验收补充 Workspace header、包字段、本机状态持久化、版本历史、回执导出和指定版本拉取预览。
- `docs/project-repository-api-contract.md` 同步 Workspace header、包字段、mock 隔离和生产边界。

真实化说明：

- 数据来源：用户配置的主后台项目仓库 endpoint/token/workspace、本机项目档案包、项目 schema 和远端返回。
- 写入状态：写入 `mr-calligraphy-project-repository-remote-v1.workspaceId`、项目仓库包 `workspaceId`、回执 `workspaceId` 和 mock server workspace 分桶。
- 成功反馈：项目仓库远端状态会显示空间，回执列表显示 workspace，mock 服务能分别读取不同空间最近包和版本历史。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON、无项目包或推送失败仍会写入本机错误，不清空本机项目档案。
- 刷新后复现方式：Workspace 保存在本机项目仓库远端状态，刷新后仍会继续用同一空间推送和拉取。

仍待补：

- 当前是账号化前的空间隔离 adapter，不是完整登录、角色权限、多人协作、服务端资产签名、长期归档或不可篡改审计。

验收：

- `node --check project-archive.js`
- `node --check scripts/project-repository-mock-server.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/project-schema-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库空间隔离`

### 2026-06-12：新增远端发布空间隔离

完成内容：

- 主后台和写实后台“远端发布 API”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- 远端发布包和 manifest 新增 `workspaceId`，远端 GET / POST / DELETE 请求统一携带 `X-MR-Workspace-Id`。
- 撤销包、发布回执、撤销回执、发布锁、回执列表和回执审计 HTML 都会显示当前 workspace。
- 切换 endpoint 或 workspace 时会清空当前远端回执、审核状态和发布锁，避免跨空间误读。
- 服务端返回的其他 workspace 回执或锁不会被当前空间当作重复发布锁。
- `scripts/remote-publish-mock-server.js` 改为按 workspace 分桶保存发布回执和重复摘要锁，撤销只匹配当前 workspace。
- `scripts/remote-publish-check.js` 和 E2E 验收补充 Workspace header、包字段、本机状态持久化、服务端锁隔离、回执导出和撤销回执。
- `docs/remote-publish-api-contract.md` 同步 Workspace header、包字段、mock 隔离和生产边界。

真实化说明：

- 数据来源：用户配置的远端发布 endpoint/token/workspace、本机已审核发布版本、资产清单和远端返回。
- 写入状态：写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].workspaceId`、远端包 `workspaceId`、回执 `workspaceId` 和 mock server workspace 分桶。
- 成功反馈：远端发布状态会显示空间，回执列表显示 workspace，mock 服务能分别读取不同空间最近发布回执。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON、摘要不匹配、未审核、重复发布或跨空间锁仍会写入明确错误，不清空本机发布版本。
- 刷新后复现方式：Workspace 保存在本机远端发布状态，刷新后仍会继续用同一空间检查、推送和撤销。

仍待补：

- 当前是账号化前的空间隔离 adapter，不是完整登录、角色权限、生产 CDN 上传、远端审批、生产签名或不可篡改审计。

验收：

- `node --check project-remote-publish.js`
- `node --check scripts/remote-publish-mock-server.js`
- `node --check scripts/remote-publish-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/remote-publish-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增远端发布空间隔离`

### 2026-06-12：新增作品分享远端空间隔离

完成内容：

- 前台“远端分享 API”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- 远端分享包新增顶层 `workspaceId`，远端 GET / PUT / DELETE 请求统一携带 `X-MR-Workspace-Id`。
- 撤销包、分享记录远端状态、发布回执、撤销回执、回执列表和回执审计 HTML 都会显示当前 workspace。
- 切换 endpoint 或 workspace 时会清空当前远端 publicUrl、packageId 和回执视图，避免跨空间误读。
- `scripts/share-repository-mock-server.js` 改为按 workspace 分桶保存分享包、回执和撤销记录。
- `scripts/learning-state-check.js` 和 E2E 验收补充 Workspace header、包字段、本机状态持久化、空间切换回读、回执导出和撤销回执。
- `docs/share-repository-api-contract.md` 同步 Workspace header、包字段、mock 隔离和生产边界。

真实化说明：

- 数据来源：用户配置的远端分享 endpoint/token/workspace、本机分享链接、作品分享 HTML 和远端返回。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.shareService.workspaceId`、远端分享包 `workspaceId`、`ShareRecord.remoteWorkspaceId`、回执 `workspaceId` 和 mock server workspace 分桶。
- 成功反馈：远端分享状态会显示空间，回执列表显示 workspace，mock 服务能分别读取不同空间最近分享包和撤销记录。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON、校验失败或跨空间撤销仍会写入明确错误，不清空本机分享链接。
- 刷新后复现方式：Workspace 保存在本机分享服务状态，刷新后仍会继续用同一空间检查、发布和撤销。

仍待补：

- 当前是账号化前的空间隔离 adapter，不是完整登录、角色权限、生产 CDN 托管、公开链接权限、访问统计或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/share-repository-mock-server.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增作品分享远端空间隔离`

### 2026-06-12：新增项目仓库远端恢复风险预览

完成内容：

- 主后台项目档案恢复预览新增 `projectImportPreviewSource`，用于显示远端项目仓库版本来源。
- 远端项目仓库拉取成功后，恢复预览会显示 packageId、Workspace、remoteVersion、packageDigest、repositoryDigest、历史版本数量和恢复风险。
- 项目档案预览统一新增 `riskSummary`，按本机配置覆盖/清空、模型库替换、缺哈希、缺文件和仓库状态生成低/中/高风险说明。
- 导出的项目档案差异 HTML 报告会保留远端版本来源、workspace、摘要和风险说明。
- Playwright 主后台项目仓库用例覆盖页面摘要和差异报告下载内容；smoke test 新增页面标记。

真实化说明：

- 数据来源：远端项目仓库 GET 响应、通过摘要校验的项目仓库包、当前本机项目差异和资产哈希状态。
- 写入状态：拉取只生成恢复预览，不自动覆盖本机数据；恢复仍需手动勾选并确认。
- 成功反馈：预览和 HTML 差异报告都能看到远端来源证据。
- 失败反馈：远端包无效或摘要不一致时不生成伪造预览。
- 刷新后复现方式：重新拉取同一个远端版本可再次生成同样的恢复来源摘要。

仍待补：

- 多人三方合并、账号化恢复权限审批、服务端不可篡改恢复日志仍未完成。

验收：

- `node --check project-archive.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库远端恢复风险预览`

### 2026-06-12：新增报告教师批注本机签名摘要

完成内容：

- 报告教师批注新增角色选择，保存时把授课教师、助教或教研审核写入报告记录。
- 教师批注新增稳定批注摘要和本机签名摘要，签名载荷包含报告 ID、报告创建时间、批注人、角色、内容、时间、来源和批注摘要。
- 教师批注审计新增前后批注摘要、前后本机签名、签名类型、算法和签名字段。
- 报告面板、审计列表、审计 HTML、HTML 报告和 PDF 注释都显示或保留本机签名证据。
- smoke test、状态层脚本和 Playwright 用例覆盖角色控件、签名摘要、导出和刷新复现。

真实化说明：

- 数据来源：本机报告记录、用户填写的批注人/角色/内容和报告自身上下文。
- 写入状态：写入 `ReportRecord.teacherReview` 和 `reportTeacherReviewAudits`，并进入报告仓库同步包。
- 成功反馈：页面显示角色和签名短码，导出文件保留完整签名摘要。
- 失败反馈：空批注不写入；清除批注生成清除审计并保留前一签名证据。
- 刷新后复现方式：刷新页面后打开同一报告仍能看到角色、批注和签名短码。

仍待补：

- 当前是本机摘要证据，不是账号化教师身份、生产电子签章、证书链、服务端时间戳或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告教师批注本机签名摘要`

### 2026-06-12：新增报告仓库回执本机校验

完成内容：

- 报告仓库签名回执新增本机一致性校验字段。
- 前端会重算 `receiptDigest`，检查回执是否与 `sourcePackageId`、`workspaceId`、`repositoryDigest` 和 `acceptedAt` 一致。
- 回执会检查 workspace 是否匹配当前报告仓库空间。
- 报告仓库状态、回执列表、审计 HTML 和本机状态都保留校验结果。
- 状态层脚本覆盖真实 mock 校验通过和篡改回执摘要不匹配；Playwright 覆盖页面与导出结果。

真实化说明：

- 数据来源：远端报告仓库回执和当前 Workspace。
- 写入状态：`reportRepository.lastSignedReceipt` 和 `reportRepository.signedReceipts[*]`。
- 成功反馈：页面与审计导出显示“本机校验通过”。
- 失败反馈：摘要不一致显示“摘要不匹配”，空间不一致显示“空间不匹配”。
- 刷新后复现方式：校验结果随回执持久化。

仍待补：

- 当前是本机一致性校验，不是生产 HMAC 私钥验签、证书链、公钥验签、账号权限或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库回执本机校验`

### 2026-06-12：新增计划仓库回执本机校验

完成内容：

- 计划仓库远端回执新增本机一致性校验字段。
- 前端会按 `sourcePackageId`、`workspaceId`、`repositoryDigest` 和 `acceptedAt` 重算 `receiptDigest`。
- 回执会检查 workspace 是否匹配当前计划仓库空间。
- 计划仓库状态、回执列表、审计 HTML 和本机状态都保留校验结果。
- 状态层脚本覆盖真实 mock 回执校验通过，并验证篡改 `receiptDigest` 的回执会被标记为摘要不匹配。
- Playwright 前台计划仓库用例验证页面、localStorage 和审计 HTML 都显示本机校验通过。
- `docs/plan-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端计划仓库 API 返回的 `receipt/latestReceipt` 和当前配置的 Workspace。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.planRepository.lastReceipt` 与 `receipts[*]` 的校验字段。
- 成功反馈：状态栏、回执列表和导出的审计 HTML 都显示“本机校验通过”。
- 失败反馈：摘要被篡改或公式不匹配会显示“摘要不匹配”；空间不一致会显示“空间不匹配”。
- 刷新后复现方式：校验字段随回执进入本机学习状态，刷新后重新读取仍会规范化保留校验结果。

仍待补：

- 当前校验只能证明计划仓库回执声明字段一致和空间匹配，不能替代生产 HMAC 私钥验签、证书链、公钥验签、账号权限或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front plan repository detects remote conflicts and saves a remote copy"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划仓库回执本机校验`

### 2026-06-12：新增作品分享回执本机校验

完成内容：

- 作品分享远端发布和撤销回执新增本机一致性校验字段。
- 前端会按发布回执的 `sourcePackageId`、`workspaceId`、`repositoryDigest`、`publicUrl` 和 `acceptedAt` 重算 `receiptDigest`。
- 前端会按撤销回执的 `action`、`sourcePackageId`、`workspaceId`、`shareId`、`repositoryDigest`、`publicUrl` 和 `acceptedAt` 重算 `receiptDigest`。
- 回执会检查 workspace 是否匹配当前作品分享空间，并区分发布回执和撤销回执。
- 作品分享状态、回执列表、审计 HTML 和本机状态都保留校验结果。
- 状态层脚本覆盖真实 mock 发布/撤销回执校验通过，并验证篡改 `receiptDigest` 的回执会被标记为摘要不匹配。
- Playwright 前台分享用例验证页面、localStorage 和审计 HTML 都显示本机校验通过。
- `docs/share-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端作品分享 API 返回的 `receipt/latestReceipt`、公开访问 URL、分享 ID 和当前配置的 Workspace。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.shareService.lastReceipt` 与 `receipts[*]` 的校验字段。
- 成功反馈：状态栏、回执列表和导出的审计 HTML 都显示“本机校验通过”。
- 失败反馈：摘要被篡改或公式不匹配会显示“摘要不匹配”；空间不一致会显示“空间不匹配”。
- 刷新后复现方式：校验字段随回执进入本机学习状态，刷新后重新读取仍会规范化保留校验结果。

仍待补：

- 当前校验只能证明作品分享回执声明字段一致和空间匹配，不能替代生产 HMAC 私钥验签、证书链、公钥验签、账号权限、公开页真实 CDN 发布或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增分享回执本机校验`

### 2026-06-12：新增学习档案仓库回执本机校验

完成内容：

- 学习档案仓库远端回执新增本机一致性校验字段。
- 前端会按 `workspaceId`、`sourcePackageId`、`repositoryDigest` 和 `acceptedAt` 重算 `receiptDigest`。
- 回执会检查 workspace 是否匹配当前学习档案仓库空间。
- 学习档案仓库状态、回执列表、审计 HTML 和本机状态都保留校验结果。
- 状态层脚本覆盖真实 mock 回执校验通过，并验证篡改 `receiptDigest` 的回执会被标记为摘要不匹配。
- Playwright 前台学习档案远端同步用例验证页面、localStorage 和审计 HTML 都显示本机校验通过。
- `docs/history-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端学习档案仓库 API 返回的 `receipt/latestReceipt` 和当前配置的 Workspace。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.historyRepository.lastReceipt` 与 `receipts[*]` 的校验字段。
- 成功反馈：状态栏、回执列表和导出的审计 HTML 都显示“本机校验通过”。
- 失败反馈：摘要被篡改或公式不匹配会显示“摘要不匹配”；空间不一致会显示“空间不匹配”。
- 刷新后复现方式：校验字段随回执进入本机学习状态，刷新后重新读取仍会规范化保留校验结果。

仍待补：

- 当前校验只能证明学习档案仓库回执声明字段一致和空间匹配，不能替代生产 HMAC 私钥验签、证书链、公钥验签、账号权限、服务端教师批注审计或不可篡改日志。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案回执本机校验`

### 2026-06-12：新增项目仓库回执本机校验

完成内容：

- 主后台远端项目仓库回执新增本机一致性校验字段。
- 前端会按 `sourcePackageId`、`workspaceId`、`repositoryDigest` 和 `acceptedAt` 重算 `receiptDigest`。
- 回执会检查 workspace 是否匹配当前项目仓库空间。
- 项目仓库回执状态摘要、回执列表、审计 HTML 和本机远端项目仓库状态都保留校验结果。
- Playwright 主后台项目仓库用例改为生成真实可重算回执，并验证页面、localStorage 和审计 HTML 都显示本机校验通过。
- `docs/project-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端项目仓库 API 返回的 `receipt/latestReceipt` 和当前配置的 Workspace。
- 写入状态：写入 `mr-calligraphy-project-repository-remote-v1.receipts[*]` 的校验字段。
- 成功反馈：主后台“项目仓库回执审计”、回执列表和导出的审计 HTML 都显示“本机校验通过”。
- 失败反馈：摘要被篡改或公式不匹配会显示“摘要不匹配”；空间不一致会显示“空间不匹配”。
- 刷新后复现方式：校验字段随回执进入本机项目仓库远端状态，刷新主后台后重新读取仍会规范化保留校验结果。

仍待补：

- 当前校验只能证明项目仓库回执声明字段一致和空间匹配，不能替代生产私钥验签、公钥证书链、账号权限、服务端资产完整性复核、多人合并审计或不可篡改日志。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库回执本机校验`

### 2026-06-12：新增远端发布回执本机校验

完成内容：

- 主后台和写实后台远端发布回执新增本机一致性校验字段。
- 发布回执会按 `sceneId`、`workspaceId`、`releaseId`、`packageDigest`、`acceptedAt`、`assetSignatureSummary` 和 `cdnUploadSummary` 重算 `receiptDigest`。
- 撤销回执会按 `direction: revoke`、`workspaceId`、`sceneId`、`packageId`、`sourcePackageId`、`releaseId`、`packageDigest`、`acceptedAt`、`revokedAt` 和 `cdnPurgeSummary` 重算 `receiptDigest`。
- 回执会检查 workspace 和 scene 是否匹配当前后台场景，区分“本机校验通过 / 空间不匹配 / 场景不匹配 / 摘要不匹配”。
- 主后台和写实后台远端发布回执列表显示本机校验结果。
- 远端发布回执审计 HTML 新增本机校验、校验说明和重算摘要字段。
- `scripts/remote-publish-check.js` 改为生成真实可重算的发布和撤销回执，并验证 fake API 与 mock server 回执都能本机校验通过。
- Playwright 主后台远端发布用例改为生成真实可重算 receipt，并验证页面、localStorage 和 HTML 审计导出显示本机校验通过。
- `docs/remote-publish-api-contract.md` 同步本机一致性校验公式、状态字段和生产边界。

真实化说明：

- 数据来源：远端发布 API 返回的 `receipt/latestReceipt`、当前配置的 Workspace 和当前后台场景 ID。
- 写入状态：写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts[*]` 的校验字段。
- 成功反馈：远端发布回执摘要、回执列表和导出的审计 HTML 都显示“本机校验通过”。
- 失败反馈：摘要被篡改或公式不匹配会显示“摘要不匹配”；空间不一致显示“空间不匹配”；场景不一致显示“场景不匹配”。
- 刷新后复现方式：校验字段随远端发布状态持久化，刷新后台后重新读取仍会规范化保留校验结果。

仍待补：

- 当前校验只能证明远端发布回执声明字段一致、空间匹配和场景匹配，不能替代生产私钥验签、公钥证书链、账号审批、真实 CDN 上传证明、服务端资产回收审计或不可篡改日志。

验收：

- `node --check project-remote-publish.js`
- `node --check scripts/remote-publish-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/remote-publish-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增远端发布回执本机校验`

### 2026-06-12：新增前台服务边界状态面板

完成内容：

- 前台顶部新增 `serviceBoundaryPanel`，把“本机真实 / 远端 Adapter / 生产云端”三层状态放到学习任务前。
- 面板读取本机学习统计、学习档案仓库、计划仓库、报告仓库和作品分享远端状态，展示本机记录数、真实练习、作品、报告、远端 adapter 配置数和回执本机校验数。
- 未配置远端时明确显示当前以本机 JSON、HTML、PDF、ICS 和本机分享链接留存。
- 生产云端行明确说明账号登录、教师端权限、生产 CDN、跨设备云同步和服务端不可篡改审计未接入。
- smoke test 和 Playwright 移动端入口用例新增服务边界面板验收。

真实化说明：

- 数据来源：`MRAppState.getStats()` 与各 repository/share service 的 status 和 receipt audit。
- 写入状态：不新增持久化字段，使用已有本机状态实时推导。
- 成功反馈：用户进入前台即可看到当前能力属于本机真实、远端 adapter 还是尚未接入的生产云端。
- 失败反馈：状态层未初始化或远端未配置时显示清晰边界，不伪造成云端能力。
- 刷新后复现方式：刷新后重新读取本机状态并渲染相同边界。

仍待补：

- 仍需真正的账号化服务端、教师端权限、跨设备同步、生产 CDN 和服务端审计；本轮只是把边界放到用户看得见的位置。

验收：

- `node --input-type=module --check < script.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "mobile viewports keep core panels usable without overlap"`
- `git diff --check`

提交：

- 中文 commit message：`新增前台服务边界状态面板`

### 2026-06-12：新增后台服务边界状态面板

完成内容：

- 主后台风险提示区新增后台服务边界面板，显示本机编辑、前台发布、远端 Adapter 和生产后台四层状态。
- 写实后台风险提示区新增后台服务边界面板，显示本机编辑、演示发布、远端 Adapter 和生产后台四层状态。
- 主后台面板读取本机场景草稿对象数、本机发布历史、远端发布 adapter、项目仓库远端 adapter 和回执本机校验数量。
- 写实后台面板读取写实草稿对象状态、导入模型、本机演示发布历史、远端发布 adapter 和回执本机校验数量。
- 项目仓库远端状态刷新后会同步刷新主后台边界摘要。
- smoke test 和 Playwright 手机视口用例新增两个后台服务边界验收。

真实化说明：

- 数据来源：后台本机草稿、发布记录、`MRProjectRemotePublish`、主后台 `MRProjectArchive` 和回执审计。
- 写入状态：不新增持久化字段，使用已有本机状态实时推导。
- 成功反馈：后台打开后即可看到哪些是本机真实、哪些是远端 adapter、哪些生产后台能力仍未接入。
- 失败反馈：未发布、未配置远端、无回执时都显示明确本机/adapter 边界。
- 刷新后复现方式：刷新后重新读取本机状态和 adapter 状态并渲染相同边界。

仍待补：

- 仍需真正的账号化后台、角色权限、多人协作 CMS、生产 CDN、服务端资产回收和不可篡改审计；本轮只把后台边界放到用户看得见的位置。

验收：

- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check project-archive.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "mobile viewports keep core panels usable without overlap"`
- `git diff --check`

提交：

- 中文 commit message：`新增后台服务边界状态面板`

### 2026-06-12：新增本机后台操作者审计

完成内容：

- 新增 `admin-audit.js` 共享本机后台审计服务，负责操作者保存、操作记录、状态读取和 HTML 审计导出。
- 主后台风险提示区新增 `mainAdminOperatorPanel`，可保存本机操作者姓名和角色，并展示最近后台操作。
- 写实后台风险提示区新增 `realisticAdminOperatorPanel`，可保存本机操作者姓名和角色，并展示最近后台操作。
- 主后台会在保存操作者、确认本机边界、保存快照和发布到前台时写入 `snapshot` / `publish-local` 等审计记录。
- 写实后台会在保存操作者、确认本机边界、保存快照和发布到演示时写入 `snapshot` / `publish-local` 等审计记录。
- 两个后台服务边界状态新增“本机审计”行，显示当前操作者和本机记录数量。
- smoke test 和 Playwright 发布用例新增后台审计验收。

真实化说明：

- 数据来源：后台页面真实操作事件。
- 写入状态：`mr-calligraphy-admin-operator-audit-v1`，按 `mainScene` / `realisticScene` 分桶保存操作者和最近 120 条记录。
- 成功反馈：风险提示区显示操作者、角色和最近审计，可导出 `mr-calligraphy-admin-audit-*.html`。
- 失败反馈：本机存储失败时显示失败消息，不写成功审计。
- 刷新后复现方式：刷新后台后继续读取同一份 localStorage 审计状态。

仍待补：

- 这不是账号化生产后台；仍需真正登录、角色权限、服务端不可篡改审计、多人协作审计和审批流。

验收：

- `node --check admin-audit.js`
- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "mobile viewports keep core panels usable without overlap"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "realistic admin keeps local publish releases and rollback history"`
- `git diff --check`

提交：

- 中文 commit message：`新增本机后台操作者审计`

### 2026-06-12：新增本机后台角色权限门控

完成内容：

- `admin-audit.js` 新增本机角色权限表和 `MRAdminAudit.canPerform()`。
- 主后台新增 `mainAdminPermissionStatus`，显示当前操作者角色权限摘要。
- 写实后台新增 `realisticAdminPermissionStatus`，显示当前操作者角色权限摘要。
- 复核角色会禁用主后台坐标、灯光、基础物体、导入、快照、删除、本机发布、远端发布和项目仓库远端入口。
- 复核角色会禁用写实后台坐标、导入、快照、删除、本机发布和远端发布入口。
- 主后台和写实后台的关键事件入口新增权限预检；被拦截动作会写入 `permission-blocked` 本机审计。
- Playwright 新增只读复核角色用例，并回归主后台和写实后台发布审计。

真实化说明：

- 数据来源：`mr-calligraphy-admin-operator-audit-v1` 中的本机操作者角色。
- 写入状态：权限拦截写入 `records[*].action = "permission-blocked"`。
- 成功反馈：编辑、负责人、本机管理员可继续写入；复核角色显示只读提示并禁用写控件。
- 失败反馈：无权限操作会显示角色无权提示，并记录审计。
- 刷新后复现方式：刷新后台后从 localStorage 读取角色并重新应用门控。

仍待补：

- 当前是本机浏览器门控，不是生产账号登录、服务端鉴权、不可篡改审计、组织角色或多人审批。

验收：

- `node --check admin-audit.js`
- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "admin reviewer role blocks local write controls"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads|realistic admin keeps local publish releases and rollback history"`
- `git diff --check`

提交：

- 中文 commit message：`新增本机后台角色权限门控`

### 2026-06-12：新增远端审核审批权限门控

完成内容：

- `admin-audit.js` 新增 `approve` 权限，权限文案为“远端审核审批”。
- 本机管理员和负责人可通过审核、退回审核、解除发布锁；编辑角色只能编辑、发布、配置远端、提交审核和推送已批准版本。
- 主后台与写实后台的远端发布审核按钮改为 `approve` 权限门控，并在函数入口二次校验。
- 权限摘要明确“编辑可提交远端审核，审批需负责人或本机管理员”。
- Playwright 权限用例覆盖编辑角色审批按钮被拦截、负责人恢复审批权限。
- 主后台远端发布用例改成编辑提交审核、负责人审批通过、再推送远端包，避免测试绕过真实分权。

真实化说明：

- 数据来源：本机后台操作者角色。
- 写入状态：复用 `mr-calligraphy-admin-operator-audit-v1`，审批拦截仍写入 `permission-blocked`。
- 成功反馈：编辑角色不能误点“通过审核”形成假审批；负责人/本机管理员才能完成审批动作。
- 失败反馈：无审批权限时按钮禁用，事件入口也会返回无权提示。
- 刷新后复现方式：刷新后台后继续从本机角色读取审批权限。

仍待补：

- 当前只是本机分权，不是服务端账号、真实双人审批、组织权限、生产发布审批或不可篡改审计。

验收：

- `node --check admin-audit.js`
- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "admin reviewer role blocks local write controls"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增远端审核审批权限门控`

### 2026-06-12：新增远端发布操作审计

完成内容：

- 主后台和写实后台远端发布检查、推送、撤销、审核提交、审核通过、审核退回和解除发布锁会写入本机后台操作者审计。
- 审计元数据只保留 workspace、releaseId、packageDigest、packageId 和 direction，不保存 token。
- 远端 API 异常和失败返回会以 `failed` 结果写入审计。
- Playwright 主后台远端发布用例新增 `mr-calligraphy-admin-operator-audit-v1` 断言，确认远端发布关键动作都留下后台审计记录。

真实化说明：

- 数据来源：后台远端发布操作和 `MRProjectRemotePublish` 返回结果。
- 写入状态：本机后台操作者审计 records。
- 成功反馈：后台审计列表和 HTML 导出能看到远端操作链路。
- 失败反馈：失败结果不会只停留在 toast 或控制台，会写入失败审计。
- 刷新后复现方式：刷新后台后继续读取同一份 localStorage 审计。

仍待补：

- 当前仍不是服务端不可篡改审计、账号签名审计、真实审批流审计或跨设备审计仓库。

验收：

- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增远端发布操作审计`

### 2026-06-12：新增本机后台访问门禁

完成内容：

- `admin-audit.js` 新增本机访问会话，按后台 scope 写入 `mr-calligraphy-admin-access-session-v1`。
- 主后台新增 `mainAdminAccessPanel`，显示锁定/解锁状态、访问码输入、解锁和锁定按钮。
- 写实后台新增 `realisticAdminAccessPanel`，交互与主后台一致。
- 锁定状态下只允许查看后台、切换本机操作者和导出审计；编辑、导入、删除、本机发布、远端发布和审核审批都会被禁用。
- 访问码默认为 `local-admin`，解锁有效期为 480 分钟，仅保存在当前浏览器 sessionStorage。
- 解锁和主动锁定会写入本机后台操作者审计，分别记录为 `access-unlock` 和 `access-lock`。
- Playwright 覆盖主后台与写实后台锁定禁用、真实访问码解锁、发布、导入、替换、删除审计和项目仓库失败保护。
- 写实后台“清理已删除文件”按钮现在叠加业务状态和权限状态，没有已删除导入模型时不会因为门禁解锁而误变可用。

真实化说明：

- 数据来源：当前浏览器会话的 `mr-calligraphy-admin-access-session-v1`。
- 写入状态：每个后台 scope 保存 `unlockedAt`、`expiresAt` 或 `lockedAt`。
- 成功反馈：门禁面板显示已解锁和过期时间，危险写入控件恢复可操作。
- 失败反馈：访问码错误会显示失败提示；锁定状态下按钮禁用，事件入口也会拦截并提示无权。
- 刷新后复现方式：同一浏览器会话刷新后继续有效；主动锁定或新会话会回到锁定状态。

仍待补：

- 这是开发阶段本机门禁，不是生产账号登录、服务端鉴权、组织权限、不可篡改审计、真实多人审批或跨设备安全。

验收：

- `node --check admin-audit.js`
- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "admin reviewer role blocks local write controls|main admin publishes a local draft that the front page reads"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "realistic admin keeps local publish releases|realistic admin records imported model deletion audit"`
- `git diff --check`

提交：

- 中文 commit message：`新增本机后台访问门禁`

### 2026-06-12：扩展后四步学习路径热点状态

完成内容：

- 前台第 7-10 步热点现在叠加 `LearningPath` 推导结果。
- 新增 `mergeLearningPathStatusIntoPoint()`，把路径状态、下一步动作和本机证据合并到热点正文。
- 学习档案、作品复盘、学习报告和复习巩固四个后段场景不再只显示本机统计文案，也会显示对应路径步骤的完成/进行/待完成状态。
- Playwright 前台真实流程新增断言，完成书写、保存作品、分享和导出报告后，第 7-10 步热点必须包含“路径状态”和“本机证据”。

真实化说明：

- 数据来源：`MRAppState.getLearningPathStatus()`。
- 写入状态：无新增存储，复用 `mr-calligraphy-learning-state-v1` 派生状态。
- 成功反馈：后四步热点正文能看到路径状态和本机证据。
- 失败反馈：路径服务不可用时保留原本统计说明，不伪造证据。
- 刷新后复现方式：刷新页面后重新从本机学习状态推导同一热点证据。

仍待补：

- 仍不是云端课程编排、教师端学习路径发布或跨设备进度同步。

验收：

- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`扩展后四步学习路径热点状态`

### 2026-06-12：新增评分版本与笔顺压感证据

完成内容：

- `practice-canvas.js` 新增 `local-heuristic-v2.0.0` 评分算法版本。
- 新增第一版本机范字笔顺库，覆盖永、仁、和、礼、雅、静、心。
- 真实练习评分证据新增范字来源、目标笔顺、笔画差、压感采样点数、压感平均值和压感范围。
- `app-state.js` 会归一化并持久化新评分证据，旧记录仍可按原有字段生成基础证据。
- `ScoreService` 最近证据摘要新增范字和压感采样信息，状态消息显示算法版本。
- “查看笔画分析”面板新增算法版本、范字来源、完整笔顺和压感证据说明。
- 数据层和 E2E 均覆盖真实保存后的 `scoreEvidence.algorithmVersion`、`targetStrokeNames` 和 `pressurePointCount`。

真实化说明：

- 数据来源：练习画布真实笔迹、时间间隔、PointerEvent pressure 和本机范字笔顺库。
- 写入状态：`mr-calligraphy-learning-state-v1.sessions[*].scoreEvidence`、`artworks[*].scoreEvidence` 和 `scoreService`。
- 成功反馈：前台评分卡、笔画分析和状态摘要均能看到算法版本、范字、笔顺和压感证据。
- 失败反馈：无真实笔迹时不返回假评分；旧记录缺新字段时只展示已有证据。
- 刷新后复现方式：保存作品后刷新，评分摘要和分析详情仍读取同一份证据。

仍待补：

- 当前不是专业书法模型、硬件压感校准、教师人工标定或服务端评分。
- 逐笔轨迹匹配和路径误差热力已在后续小节完成第一版；当前仍缺专业错序模型和高精度笔锋识别。

验收：

- `node --check practice-canvas.js`
- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增评分版本与笔顺压感证据`

### 2026-06-12：新增逐笔轨迹匹配证据

完成内容：

- 基础评分算法升级为 `local-heuristic-v2.1.0`。
- `practice-canvas.js` 新增逐笔轨迹匹配：按每笔真实轨迹的起止方向、角度、中心位置和长度匹配本机范字笔顺。
- 评分证据新增 `strokeMatches`、`strokeOrderMatchPercent`、`strokeOrderCoveragePercent`、`strokeShapeMatchPercent`、`strokeOrderVerdict` 和 `strokeOrderWarnings`。
- `app-state.js` 归一化并持久化逐笔匹配列表，评分服务摘要显示“笔顺匹配xx%”。
- “查看笔画分析”面板新增笔顺匹配、笔顺覆盖、形态匹配、逐笔轨迹摘要和笔顺提醒。
- 数据层和 E2E 均覆盖真实书写保存后的 `strokeMatches`、`strokeOrderVerdict` 和评分摘要。

真实化说明：

- 数据来源：真实书写每一笔的起点、终点、角度、长度、中心位置和本机范字笔顺库。
- 写入状态：`mr-calligraphy-learning-state-v1.sessions[*].scoreEvidence.evidence.strokeMatches` 与 `scoreService.lastEvidenceSummary`。
- 成功反馈：分析详情显示逐笔匹配率、目标覆盖率、形态匹配率和疑似错序/缺笔提醒。
- 失败反馈：无笔迹时不会伪造匹配结果；旧记录没有 `strokeMatches` 时只展示已有证据。
- 刷新后复现方式：保存作品后刷新，评分摘要和分析详情继续读取同一份逐笔证据。

仍待补：

- 路径误差热力已在下一节完成第一版；当前仍不是专业书法模型、笔锋压力热力图、硬件压感校准或教师人工标定。

验收：

- `node --check practice-canvas.js`
- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增逐笔轨迹匹配证据`

### 2026-06-12：新增路径误差热力证据

完成内容：

- 基础评分算法升级为 `local-heuristic-v2.2.0`。
- `practice-canvas.js` 新增路径误差分析，按真实采样点到本机范字参考线的距离计算路径贴合率。
- 评分证据新增 `pathFitPercent`、`pathErrorPercent`、`pathErrorSampleCount`。
- 评分证据新增 `pathErrorHotspots`，按 4×4 区域聚合误差热力点。
- 评分证据新增 `strokePathErrors`，记录每一笔的误差、贴合率和采样数。
- `app-state.js` 归一化并持久化路径热力证据，评分服务摘要显示“路径贴合xx%”。
- “查看笔画分析”面板新增路径贴合、路径误差、逐笔路径误差和误差热力说明。
- 数据层和 E2E 均覆盖真实书写保存后的 `pathErrorHotspots`、`strokePathErrors` 和评分摘要。

真实化说明：

- 数据来源：真实书写采样点、本机范字参考线和 4×4 误差区域聚合。
- 写入状态：`mr-calligraphy-learning-state-v1.sessions[*].scoreEvidence.evidence.pathErrorHotspots`、`strokePathErrors` 和 `scoreService.lastEvidenceSummary`。
- 成功反馈：分析详情显示路径贴合率、误差率、逐笔路径误差和误差集中区域。
- 失败反馈：无笔迹时不会伪造路径热力；旧记录没有路径字段时只展示已有证据。
- 刷新后复现方式：保存作品后刷新，评分摘要和分析详情继续读取同一份路径热力证据。

仍待补：

- 当前仍是本机参考线距离估算，不是专业逐点范字轮廓识别、笔锋压力热力图、硬件校准、教师标定或服务端评分。

验收：

- `node --check practice-canvas.js`
- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增路径误差热力证据`

### 2026-06-12：新增报告评分证据摘要

完成内容：

- `ReportRecord` 新增 `scoreEvidenceSummary`，从最近作品或最近练习的 `scoreEvidence` 派生报告级摘要。
- 报告摘要记录算法版本、评分来源、范字、目标笔顺、笔顺匹配、路径贴合、路径误差、压感采样、误差热力和最低能力项。
- `MRAppState.getReportDetail()` 返回同一份评分证据摘要，站内报告面板新增“基础评分证据”区块。
- HTML 学习报告导出新增“基础评分证据”区块，写入算法、笔顺、路径、压感和误差热力。
- PDF 学习报告导出新增评分证据正文，并在 PDF 注释中写入 `ScoreEvidence`、`ScoreEvidenceAlgorithm` 和 `ScoreEvidencePathFit`，便于测试和后续验真。
- 报告验真 payload 纳入 `scoreEvidenceSummary`，报告仓库同步包会随报告携带同一份摘要。
- 数据层和 E2E 均覆盖报告导出后的评分证据摘要、HTML 内容、站内面板和 PDF 标记。

真实化说明：

- 数据来源：真实书写保存时产生的 `scoreEvidence`，包括路径热力、逐笔匹配和压感采样。
- 写入状态：`mr-calligraphy-learning-state-v1.reports[*].scoreEvidenceSummary`。
- 成功反馈：用户导出报告后，下载 HTML、站内报告详情和 PDF 都能看到评分证据，不再只显示泛化建议。
- 失败反馈：没有真实笔迹时不会伪造证据；旧报告缺少摘要字段时，详情和导出只读回填最近练习/作品的可用证据。
- 刷新后复现方式：保存作品并导出报告后刷新，打开 `?report=<报告ID>`，报告详情仍显示基础评分证据。

仍待补：

- 当前是本机评分证据摘要，不是云端教师审阅、专业模型评分证书或可跨设备同步的官方评级报告。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告评分证据摘要`

### 2026-06-12：新增复盘路径热力可视化

完成内容：

- 作品复盘面板新增 `reviewEvidenceMap` 路径误差热力区。
- `script.js` 从最近作品或练习的 `scoreEvidence.evidence.pathErrorHotspots` 渲染 4×4 热力格。
- 热力格显示每个高误差区域的误差百分比、区域标签、采样点和最高误差摘要。
- 复盘区同时显示路径贴合率、路径误差率和热力采样数，和评分服务摘要使用同一份证据。
- 没有真实路径热力时显示空状态，不绘制假热力图。
- Playwright 前台真实流程新增断言，确认保存作品后复盘区出现“路径误差热力”“路径贴合”和“最高误差”。

真实化说明：

- 数据来源：真实书写保存时产生的 `pathErrorHotspots` 和 `strokePathErrors`。
- 写入状态：不新增存储字段，直接消费 `mr-calligraphy-learning-state-v1.sessions[*].scoreEvidence.evidence`。
- 成功反馈：保存作品后，复盘面板出现 4×4 路径热力格，可看到误差集中区域。
- 失败反馈：没有路径热力证据时只显示空状态，不显示静态假图。
- 刷新后复现方式：保存作品后刷新，复盘面板继续读取持久化评分证据并重建热力格。

仍待补：

- 当前热力图是 4×4 区域摘要，不是逐像素笔锋压力热图、范字轮廓叠加或专业模型诊断。

验收：

- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增复盘路径热力可视化`

### 2026-06-12：新增复盘证据离线导出

完成内容：

- 作品复盘区新增“导出证据”按钮，保存作品或完成带证据的练习后可下载离线 HTML。
- `MRAppState` 新增 `getReviewEvidenceExport()` 与 `downloadReviewEvidence()`。
- 复盘证据页包含作品截图、评分算法、综合评分、路径贴合、热力采样、4×4 路径误差热力格、逐笔路径贴合、逐笔轨迹匹配和评分理由。
- 导出来源优先读取最近作品；若旧作品缺少真实证据，则回退到最近带热力/逐笔/压感细节的练习。
- 旧记录只有迁移生成的基础字段时不会被误判为可导出的详细证据。
- 数据层和 E2E 均覆盖复盘证据 HTML 生成、按钮下载和 HTML 内容。

真实化说明：

- 数据来源：`scoreEvidence.evidence.pathErrorHotspots`、`strokePathErrors`、`strokeMatches`、压感采样和评分理由。
- 写入状态：不新增存储字段；离线 HTML 由当前本机状态即时生成。
- 成功反馈：点击“导出证据”下载 `mr-calligraphy-review-evidence-*.html`，可离线查看热力和逐笔证据。
- 失败反馈：没有热力、逐笔匹配或压感等真实细节时，不导出空壳证据页。
- 刷新后复现方式：保存作品后刷新，复盘区“导出证据”仍可从持久化评分证据生成同一类离线页。

仍待补：

- 当前是本机离线 HTML 证据页，不是云端不可篡改证书、教师签章、专业模型解释报告或跨设备证据托管。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增复盘证据离线导出`

### 2026-06-12：新增分享页评分证据

完成内容：

- `MRAppState.getArtworkSharePackage()` 新增 `scoreEvidence`、`scoreEvidenceSource` 和 `features`，作品分享包会随作品携带真实评分证据。
- 评分证据来源优先读取作品自身的 `scoreEvidence`，旧作品缺少证据时再读取关联练习；没有热力、逐笔匹配、逐笔路径或压感细节时不声明证据。
- 作品分享页新增“评分证据”区块，展示算法版本、范字、笔顺匹配、路径贴合、采样、压感、4×4 路径误差热力、逐笔路径贴合、逐笔轨迹匹配和评分理由。
- 旧作品分享页显示“不补造评分依据”的空状态，不渲染假热力图。
- 远端分享包 summary 新增 `scoreEvidence` 和 `scoreEvidenceSource`，发布到用户配置 endpoint 的 HTML 与本机下载页保持同一份证据。
- 数据层和 E2E 均覆盖旧作品无证据边界、真实作品证据嵌入、下载分享页和远端分享包内容。

真实化说明：

- 数据来源：真实书写保存后的 `scoreEvidence.evidence.pathErrorHotspots`、`strokePathErrors`、`strokeMatches` 和压感采样。
- 写入状态：不新增持久化字段，分享页导出时读取 `mr-calligraphy-learning-state-v1.artworks[*].scoreEvidence` 或关联 `sessions[*].scoreEvidence`。
- 成功反馈：点击“导出分享页”下载的 `mr-calligraphy-share-*.html` 可直接看到评分证据、路径热力和逐笔明细。
- 失败反馈：旧作品缺少真实细节证据时只提示无法嵌入证据，不生成静态假图或假列表。
- 刷新后复现方式：保存一幅带真实评分证据的作品，刷新后在复盘区导出分享页或发布远端分享包，证据仍来自本机持久化记录。

仍待补：

- 当前是本机分享页内嵌评分证据，不是生产 CDN 作品墙、云端不可篡改证书、教师签章或专业模型评级。

验收：

- `node --check app-state.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/learning-state-check.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增分享页评分证据`

### 2026-06-13：新增后台快照权限审计

完成内容：

- 主后台和写实后台的快照列表动态按钮接入 `data-admin-permission` 和 `data-admin-permission-state`，不再只覆盖静态按钮。
- “恢复快照”使用编辑权限，“删除快照”使用删除权限；后台锁定或复核角色下按钮会自动禁用。
- 点击动态快照按钮时再次调用 `ensureAdminPermission()`，即使绕过 disabled 也会被拦截并写入 `permission-blocked` 审计。
- 成功恢复快照会写入 `snapshot-restore` 审计，包含目标快照 ID、恢复前自动快照 ID 和统计信息。
- 成功删除快照会写入 `snapshot-delete` 审计，包含被删除快照 ID 和对象统计。
- Playwright 覆盖主后台和写实后台：编辑角色可创建快照并操作动态按钮，复核角色被禁用和拦截，负责人角色可删除快照并留下审计。

真实化说明：

- 数据来源：主后台 `mr-calligraphy-main-scene-history-v1`、写实后台 `mr-calligraphy-realistic-history-v1` 和统一后台审计 `mr-calligraphy-admin-operator-audit-v1`。
- 写入状态：恢复/删除成功后写入对应场景的后台审计记录；权限拦截写入 `permission-blocked`。
- 成功反馈：快照列表动态按钮的权限状态会随角色切换即时刷新，审计导出能看到快照恢复/删除动作。
- 失败反馈：复核角色或锁定会话不能通过动态按钮修改本机布局历史，即便前端按钮状态被手动篡改也会被点击路径拦截。
- 刷新后复现方式：创建快照、切换角色、刷新后台，按钮状态仍由持久化操作者角色和本机会话门禁重新计算。

仍待补：

- 当前是本机后台权限和审计，不是服务端账号登录、多人审批、不可篡改审计或云端快照版本库。

验收：

- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "admin reviewer role blocks local write controls"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `node scripts/control-inventory.js --check`
- `git diff --check`

提交：

- 中文 commit message：`新增后台快照权限审计`

### 2026-06-13：新增学习动作真实详情

完成内容：

- 前台学习动作新增报告、计划、分享和导航详情构建器。
- “导出报告”详情卡显示报告 ID、下载文件、站内路由、练习/作品数量、平均分和评分证据摘要。
- “制定计划”详情卡显示计划 ID、计划项数量、完成度、下一项、到期信息和依赖摘要。
- “导出分享页”详情卡显示作品 ID、下载文件、分享服务状态和可用评分证据。
- “返回首页”等导航动作详情卡显示目标步骤、当前任务、当前字和学习路径进度。
- 带目标步骤的动作在 `loadScene()` 后恢复反馈和详情，避免真实动作结果被跳转清空。
- Playwright 前台真实流程补充报告详情、计划详情和“复习巩固”跳转后详情保留断言。

真实化说明：

- 数据来源：本机报告记录、计划记录、最近作品评分证据、分享服务状态、阶段记录和学习路径状态。
- 写入状态：继续复用 `mr-calligraphy-learning-state-v1` 中已有报告、计划、作品和阶段记录；不新增假状态字段。
- 成功反馈：动作点击后展示具体 ID、文件名、任务项、评分证据和目标步骤。
- 失败反馈：无作品、无证据或动作失败时只显示真实失败结果，不补造可下载文件、热力证据或云端同步状态。
- 刷新后复现方式：完成一次真实书写并保存作品，导出报告和制定计划后刷新，再点击对应动作可重新展示真实详情。

仍待补：

- 当前仍是本机前台动作详情，不是账号化工作流、教师端待办、跨设备通知或生产云端审计。

验收：

- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习动作真实详情`

### 2026-06-13：新增学习过程动作详情

完成内容：

- 前台新增最近动作反馈缓存，解决讲解播放等内部刷新清空真实详情的问题。
- “播放讲解 / 进入 AI 讲解”显示本机讲解详情，包含段落、进度、语音服务和本机边界。
- “开始临摹 / 进入临摹训练 / 继续学习 / 再写一遍”显示本机练习会话详情，包含会话 ID、训练模式和目标步骤。
- “示范模式 / 对比模式”显示训练模式详情，并说明是否同步到当前会话。
- “上一个笔画 / 下一个笔画”显示本机笔画索引详情。
- “切换行书”显示创作风格详情。
- “保存作品”显示本机作品保存详情，包含作品 ID、关联会话、评分、采样和评分证据。
- “查看学习记录 / 打开历史记录 / 筛选优秀记录 / 查看作品”显示学习档案、筛选或作品详情。
- 浏览器 E2E 覆盖讲解、临摹、模式、笔画和作品保存详情卡。

真实化说明：

- 数据来源：本机讲解进度、讲解服务、练习会话、训练模式、笔画索引、作品记录、评分证据和学习档案。
- 写入状态：不新增演示状态；继续读取已经写入的 `lectureService`、`sessions[*]`、`artworks[*]`、`scoreService` 和档案记录。
- 成功反馈：点击过程按钮后显示具体会话 ID、作品 ID、当前笔画、语音服务和证据状态。
- 失败反馈：无笔迹保存作品、无作品查看作品时返回真实失败详情，不写入假作品或假复盘记录。
- 刷新后复现方式：真实点击讲解、开始临摹、保存作品后刷新，再次点击对应动作可重建同类详情。

仍待补：

- 当前是本机学习过程动作详情，不是跨设备实时练习、硬件压感采集、教师端课堂控制或服务端训练会话。

验收：

- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习过程动作详情`

### 2026-06-13：新增学习档案批量操作回执

完成内容：

- 前台学习档案新增 `historyBatchReceipts` 本机持久回执，记录最近 20 次批量操作。
- “导出所选”写入导出文件名、所选档案 ID、档案数量和练习/作品/报告分布。
- 批量移入回收站、单条移入回收站、恢复回收站、永久删除回收站记录和清空回收站都写入操作回执。
- 学习档案批量操作区新增最近回执面板，展示操作名称、时间、总数、类型分布、所选数量、状态和本机边界。
- 前台 E2E 覆盖导出所选、批量删除和恢复回收站，并验证回执持久写入 `localStorage`。

真实化说明：

- 数据来源：真实学习会话、作品、报告、回收站记录和当前选择状态。
- 写入状态：新增 `mr-calligraphy-learning-state-v1.historyBatchReceipts`；回执随浏览器本机状态保存，刷新后可见。
- 成功反馈：批量操作后用户能看到具体数量、文件名或回收站记录 ID，不再只有瞬时提示。
- 失败反馈：无选中项、无回收站项或目标不存在时不追加成功回执。
- 刷新后复现方式：执行一次导出、删除或恢复后刷新，再打开学习档案仍可看到最近回执。

仍待补：

- 当前是本机持久回执，不是服务端审计日志、账号级权限流水、跨设备同步或教师端监管记录。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案批量操作回执`

### 2026-06-13：新增学习阶段档案记录

完成内容：

- 学习档案列表新增阶段记录来源，`stageRecords` 不再只影响路径统计。
- 新增“阶段”筛选，阶段详情显示阶段、字、目标步骤、阶段进度和阶段记录 ID。
- 批量导出、批量删除、回收站、恢复和批量操作回执都统计阶段记录。
- 学习档案同步包新增可选 `records.stages`，导入和远端拉取会合并阶段记录。
- 本机历史仓库 mock server、API 合同、学习状态检查和浏览器 E2E 同步覆盖阶段记录。

真实化说明：

- 数据来源：真实点击学习路径动作后写入的 `stageRecords`。
- 写入状态：不新增假阶段；继续使用 `mr-calligraphy-learning-state-v1.stageRecords`。
- 成功反馈：用户可在学习档案中筛选、查看、导出、同步和恢复阶段日志。
- 失败反馈：旧包无阶段字段时兼容；字段格式错误时导入失败并提示。
- 刷新后复现方式：点击“复习巩固”后刷新，学习档案“阶段”筛选仍能看到该记录。

仍待补：

- 当前是本机阶段日志入档和可选同步字段，不是云端课程编排、教师端任务下发、跨设备实时进度或服务端不可篡改阶段审计。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check scripts/history-repository-mock-server.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增学习阶段档案记录`

### 2026-06-13：新增视频导出回执审计

完成内容：

- 前台复盘面板新增“视频审计”导出按钮，标记为 `real-export`。
- `MRAppState.getPracticeVideoExportAudit()` 汇总本机视频导出产物和队列任务。
- 审计内容包含 WebM 文件名、PNG 封面文件名、封面摘要、导出大小、时长、笔画/采样、任务状态、失败原因、重试来源和稳定摘要。
- `downloadPracticeVideoExportAudit()` 下载 `mr-calligraphy-video-export-audit-*.html`。
- 没有视频任务或产物时按钮禁用，避免下载空壳审计。
- 学习状态脚本和浏览器 E2E 覆盖成功导出、失败、重试和审计 HTML 下载。

真实化说明：

- 数据来源：真实 `videoExportService.records` 和 `videoExportService.jobs`，不造远端回执。
- 写入状态：继续复用 `mr-calligraphy-learning-state-v1.videoExportService`；审计导出不改变原队列。
- 成功反馈：导出的 HTML 能看到成功 WebM、失败原因、重试来源和审计摘要。
- 失败反馈：没有本机视频记录时返回“暂无可导出”，不显示伪成功。
- 刷新后复现方式：本机记录和队列持久化在 localStorage，刷新后仍可重新导出审计。

仍待补：

- 当前是本机视频导出回执审计，不是生产签名回执、云端转码日志、MP4/GIF 产物、后台队列或公网分享链路。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增视频导出回执审计`

### 2026-06-13：新增计划同步重试恢复

完成内容：

- 计划仓库远端请求新增本机超时保护，避免 fetch 长时间挂起。
- `planRepository` 新增 `autoSyncRetryAfter`、`lastAutoSyncFailureAt` 和 `autoSyncFailureHistory`。
- 自动同步 PUT 被服务端 422 拒收、网络中断或请求超时时，都会保留待同步队列。
- 失败历史会记录 endpoint、workspace、计划数量、失败类型、失败时间、下一次可重试时间和失败消息。
- 前台计划仓库按钮在失败后显示“重试队列”，恢复 endpoint 后点击可继续推送同一批本机计划。
- 自动同步成功后清空待同步队列和下一次重试时间，同时保留失败历史供本机审计。
- 学习状态脚本覆盖超时失败和恢复成功；Playwright 覆盖 422、网络失败和恢复 endpoint。

真实化说明：

- 数据来源：真实计划同步包、真实远端 API 响应、浏览器 fetch 超时和本机队列状态。
- 写入状态：`mr-calligraphy-learning-state-v1.planRepository`。
- 成功反馈：恢复推送后页面显示已推送计划，按钮恢复为“推送计划”，`pendingAutoSync` 变为 false。
- 失败反馈：不会显示远端成功；页面摘要显示失败原因、失败次数和建议重试时间。
- 刷新后复现方式：失败历史、重试时间和待同步队列都保存在 localStorage。

仍待补：

- 当前是本机前端队列恢复，不是 Service Worker 后台同步、服务端调度队列、账号化计划仓库、远端提醒或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front plan repository keeps pending queue on push failures"`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增计划同步重试恢复`

### 2026-06-13：新增项目仓库重试恢复

完成内容：

- 主后台远端项目仓库检查、推送和拉取新增 8 秒请求超时保护。
- `mr-calligraphy-project-repository-remote-v1` 新增 `lastRemoteFailureAt`、`lastFailureAction`、`remoteRetryAfter` 和 `remoteFailureHistory`。
- 远端失败会记录动作、失败类型、endpoint、workspace、项目仓库包 ID、包摘要、场景数、模型数、失败时间和建议重试时间。
- 失败类型会区分 HTTP 拒收、网络异常、请求超时、结构校验失败和未知失败。
- 主后台远端项目仓库状态会显示失败历史摘要；推送失败后按钮显示“重试推送”。
- 修复 endpoint 后重试推送成功会清空当前错误和重试时间，保留失败历史和远端回执。
- Playwright 项目仓库失败用例覆盖 401、非 JSON、无项目包、PUT 422、网络中断、超时注入、恢复 endpoint 后成功重试和本机布局保留。

真实化说明：

- 数据来源：本机项目档案包、真实 fetch 响应、远端错误和主后台项目仓库远端状态。
- 写入状态：`mr-calligraphy-project-repository-remote-v1.remoteFailureHistory`、`remoteRetryAfter`、`lastRemoteFailureAt` 和 `lastFailureAction`。
- 成功反馈：恢复成功后页面显示远端已接收，按钮恢复“推送仓库包”，回执本机校验通过。
- 失败反馈：失败只写真实错误和失败历史，不伪造远端成功。
- 刷新后复现方式：失败历史和最近错误随本机项目仓库远端状态持久化。

仍待补：

- 当前是浏览器本机 adapter 级失败恢复，不是账号化项目仓库、服务端重试队列、多人合并、生产资产签名或不可篡改审计。

验收：

- `node --input-type=module --check < project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "main admin project repository keeps local data on remote failures"`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库重试恢复`

### 2026-06-13：新增学习档案仓库重试恢复

完成内容：

- 前台远端学习档案仓库检查、推送和分页拉取新增 8 秒请求超时保护。
- `historyRepository` 新增 `lastRemotePushAt`、`lastRemoteFailureAt`、`lastFailureAction`、`remoteRetryAfter` 和 `remoteFailureHistory`。
- 远端失败会记录动作、失败类型、endpoint、workspace、学习档案包 ID、包摘要、记录数、失败时间和建议重试时间。
- 失败类型会区分 HTTP 拒收、网络异常、请求超时、结构校验失败和远端响应未完成。
- 前台学习档案仓库状态会显示失败历史摘要；推送失败后按钮显示“重试推送”。
- 修复 endpoint 后重试推送成功会清空当前错误和重试时间，保留失败历史和远端回执。
- Playwright 学习档案失败用例覆盖 401、500、非法 JSON、无档案包、PUT 422、网络中断、超时注入、恢复 endpoint 后成功重试和回执本机校验。

真实化说明：

- 数据来源：本机学习档案包、真实 fetch 响应、远端错误和前台 `historyRepository` 状态。
- 写入状态：`mr-calligraphy-learning-state-v1.historyRepository.remoteFailureHistory`、`remoteRetryAfter`、`lastRemoteFailureAt`、`lastFailureAction` 和 `lastRemotePushAt`。
- 成功反馈：恢复成功后页面显示已推送学习档案，按钮恢复“推送档案”，回执本机校验通过。
- 失败反馈：失败只写真实错误和失败历史，不伪造远端成功。
- 刷新后复现方式：失败历史和最近错误随本机学习状态持久化。

仍待补：

- 当前是浏览器本机 adapter 级失败恢复，不是账号化学习档案仓库、服务端重试队列、跨设备同步任务、教师端批注审计或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front history repository shows real remote failure feedback"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front history repository handles network, paged pull, and id conflicts"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案重试恢复`

### 2026-06-13：新增报告仓库重试恢复

完成内容：

- 前台远端报告仓库检查、推送和拉取新增 8 秒请求超时保护。
- `reportRepository` 新增 `lastRemotePushAt`、`lastRemoteFailureAt`、`lastFailureAction`、`remoteRetryAfter` 和 `remoteFailureHistory`。
- 远端失败会记录动作、失败类型、endpoint、workspace、报告包 ID、包摘要、报告数、失败时间和建议重试时间。
- 失败类型会区分 HTTP 拒收、网络异常、请求超时、结构校验失败和远端响应未完成。
- 前台报告仓库状态会显示失败历史摘要；推送失败后按钮显示“重试推送”。
- 修复 endpoint 后重试推送成功会清空当前错误和重试时间，保留失败历史和签名回执。
- Playwright 新增报告仓库失败恢复用例，覆盖 401、500、非法 JSON、无报告包、PUT 422、网络中断、超时注入、恢复 endpoint 后成功重试和签名回执本机校验。

真实化说明：

- 数据来源：本机报告包、真实 fetch 响应、远端错误和前台 `reportRepository` 状态。
- 写入状态：`mr-calligraphy-learning-state-v1.reportRepository.remoteFailureHistory`、`remoteRetryAfter`、`lastRemoteFailureAt`、`lastFailureAction` 和 `lastRemotePushAt`。
- 成功反馈：恢复成功后页面显示已推送报告，按钮恢复“推送报告”，签名回执本机校验通过。
- 失败反馈：失败只写真实错误和失败历史，不伪造远端成功。
- 刷新后复现方式：失败历史和最近错误随本机学习状态持久化。

仍待补：

- 当前是浏览器本机 adapter 级失败恢复，不是账号化报告仓库、服务端重试队列、教师端账号审批、生产证书签章或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front report repository shows retryable remote failure recovery"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库重试恢复`

### 2026-06-13：新增学习阶段动作详情

完成内容：

- 前台“进入笔画拆解 / 进入创作 / 复习巩固”三类阶段动作详情新增阶段记录 ID 和目标步骤。
- 阶段动作详情列表显示记录 ID、写入时间和阶段完成清单。
- 前台真实流程 E2E 不再只手动跳步骤，而是真实点击“进入笔画拆解”和“进入创作”按钮。
- E2E 验证 `stageRecords` 包含 `strokeBreakdown`、`creation` 和 `review` 三条阶段记录。
- 学习档案阶段筛选、批量导出包和远端学习档案同步包都验证三条阶段记录进入真实数据。

真实化说明：

- 数据来源：`MRAppState.recordLearningStage()` 写入的本机阶段记录、当前任务和阶段进度。
- 写入状态：`mr-calligraphy-learning-state-v1.stageRecords`。
- 成功反馈：动作详情卡显示具体阶段记录 ID、目标步骤、任务、字帖和进度。
- 失败反馈：未知阶段不写入成功记录，也不会展示假阶段。
- 刷新后复现方式：阶段记录会在学习档案列表、批量导出包和远端学习档案包中继续存在。

仍待补：

- 当前是浏览器本机阶段记录闭环，不是教师端课堂任务流、云端阶段审批、多端协同或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习阶段动作详情`

### 2026-06-13：新增作品分享远端重试恢复

完成内容：

- 前台作品分享远端 API 检查、发布和撤销新增 8 秒请求超时保护。
- `shareService` 新增 `lastRemotePushAt`、`lastRemoteRevokeAt`、`lastRemoteFailureAt`、`lastFailureAction`、`remoteRetryAfter` 和 `remoteFailureHistory`。
- 远端失败会记录动作、失败类型、endpoint、workspace、分享 ID、包 ID、包摘要、publicUrl、分享数量、失败时间和建议重试时间。
- 失败类型会区分 HTTP 拒收、网络异常、请求超时、结构校验失败和远端响应未完成。
- 前台远端分享状态会显示失败历史摘要；发布失败后按钮显示“重试发布”，撤销失败后按钮显示“重试撤销”。
- 恢复发布或撤销成功后清空当前错误和重试时间，保留失败历史、远端回执和回执本机校验结果。
- Playwright 新增分享远端失败恢复用例，覆盖 401、非法 JSON、PUT 422、网络中断、超时注入、恢复发布、DELETE 409 和恢复撤销。

真实化说明：

- 数据来源：本机作品分享包、真实 fetch 响应、远端错误和前台 `shareService` 状态。
- 写入状态：`mr-calligraphy-learning-state-v1.shareService.remoteFailureHistory`、`remoteRetryAfter`、`lastRemoteFailureAt`、`lastFailureAction`、`lastRemotePushAt` 和 `lastRemoteRevokeAt`。
- 成功反馈：恢复发布后页面显示远端 publicUrl，按钮恢复“发布远端”；恢复撤销后页面显示已请求远端撤销，回执本机校验通过。
- 失败反馈：失败只写真实错误和失败历史，不伪造远端 publicUrl 或撤销成功。
- 刷新后复现方式：失败历史、最近错误和重试状态随本机学习状态持久化。

仍待补：

- 当前是浏览器本机 adapter 级失败恢复，不是内置公网托管、微信分享、账号权限、生产 CDN、服务端后台重试队列或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `npx playwright test tests/e2e/real-flows.spec.js -g "front share repository shows retryable remote failure recovery"`
- `npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增作品分享重试恢复`

## 109. 2026-06-13 新增作品仓库导入导出

本次把前台作品集从“只能在当前浏览器查看和分享单幅作品”推进到“可以导出/导入一份本机作品仓库包”。作品仓库包会带上作品记录、关联练习、评分证据、截图、标签和摘要，适合备份、换浏览器迁移或课堂线下收集后手动导入。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-artwork-repository-v1` 包格式、状态归一化和边界说明。
- 新增 `getArtworkRepositoryStatus()`、`getArtworkRepositoryPackage()`、`downloadArtworkRepository()` 和 `importArtworkRepositoryPackage()`。
- 导出包包含 `artworks`、`linkedSessions`、`records`、`summary`、`workspaceId`、`storageKey` 和本机边界说明。
- 导入时按 ID 合并作品与关联练习；同 ID 内容一致会跳过，同 ID 内容不同会写入 `lastConflictRecords` 并拒绝覆盖本机记录。
- 作品集 UI 新增“作品仓库”状态、“导出仓库”和“导入仓库”按钮。
- E2E 新增 `front artwork repository exports and imports local artwork package`，验证从 UI 下载 JSON，清空本机状态后再通过文件选择器导入恢复作品与练习。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.artworks` 和关联 `sessions`。
- 写入状态：导出/导入结果写入 `mr-calligraphy-learning-state-v1.artworkRepository`。
- 成功反馈：页面显示最近导入/导出的作品数和关联练习数，作品集卡片立即刷新。
- 失败反馈：非法 JSON、非作品仓库包、空作品包或同 ID 差异不会伪造成功，会写入最近错误或冲突状态。
- 刷新后复现方式：仓库状态、导入作品、关联练习和冲突审计都保存在 localStorage。

仍待补：

- 当前是本机 JSON 仓库包，不是账号化公开作品集、课堂作品墙、跨设备实时同步、社交平台分享、云端存储或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增作品仓库导入导出`

## 110. 2026-06-13 新增作品仓库冲突审计

本次把作品仓库导入冲突从“只记录跳过数量”推进到“可看差异、可另存副本、可忽略审计”。导入包里如果有同 ID 但内容不同的作品或关联练习，系统不会覆盖本机记录，而是把导入快照和字段差异保存在冲突审计里，用户可以手动处理。

完成内容：

- `ArtworkRepositoryConflict` 增加 `conflictId`、`typeLabel`、`fieldDiffs` 和 `incomingRecord`。
- `createArtworkRepositoryConflict()` 会对作品和关联练习生成字段差异，不再只保存标题和时间。
- 新增 `MRAppState.getArtworkRepositoryConflicts()` 和 `resolveArtworkRepositoryConflict()`。
- `resolveArtworkRepositoryConflict("copy-incoming")` 支持把导入包冲突作品另存为新的本机作品副本；若关联练习也冲突，会复制练习并重新挂接到作品。
- `resolveArtworkRepositoryConflict("dismiss")` 支持忽略指定冲突审计。
- 前台作品集新增 `artworkRepositoryConflictPanel`，展示本机值/导入值差异，并提供“另存导入副本 / 忽略审计”按钮。
- E2E 作品仓库用例新增同 ID 差异包导入、冲突面板显示和另存副本断言。
- smoke test 新增作品仓库冲突面板静态标记。

真实化说明：

- 数据来源：本机 `ArtworkRecord`、关联 `PracticeSession`、导入作品仓库包中的 `incomingRecord` 快照。
- 写入状态：冲突写入 `mr-calligraphy-learning-state-v1.artworkRepository.lastConflictRecords`；另存副本写入 `artworks`，必要时同步写入新的 `sessions`。
- 成功反馈：冲突面板列出字段差异，处理后面板刷新，作品集数量更新。
- 失败反馈：缺少冲突、缺少导入快照或未知动作时返回明确失败，不修改作品集。
- 刷新后复现方式：未处理冲突和另存后的作品副本都保存在 localStorage。

仍待补：

- 当前是本机冲突审计，不是服务端多人合并、账号化作品仓库、生产审计签名、课堂作品墙或公开作品集。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增作品仓库冲突审计`

## 111. 2026-06-13 新增作品集 HTML 导出

本次把前台作品集从“可保存、搜索、迁移 JSON 包”推进到“可一键导出离线可读作品集”。用户可以把当前浏览器里的多幅作品下载为 HTML，直接打开、打印或手动分享给老师和同学。

完成内容：

- 新增 `mr-calligraphy-artwork-collection-v1` 导出格式和 `ARTWORK_COLLECTION_BOUNDARY` 边界说明。
- 新增 `MRAppState.getArtworkCollectionExport()`，从本机作品、关联练习、评分证据和标签生成作品集数据与 HTML。
- 新增 `MRAppState.downloadArtworkCollectionPage()`，真实触发 HTML 下载，并写入最近作品集导出时间和作品数。
- 前台作品仓库工具区新增 `artworkCollectionExportButton`，按钮文案为“导出作品集”。
- `getArtworkRepositoryStatus()` 会按时间显示最近导入、JSON 仓库导出或 HTML 作品集导出，避免旧状态遮住新操作。
- E2E 用例会点击“导出作品集”，读取下载 HTML，验证 `MR 书法作品集`、`ArtworkCollection: yes`、边界说明、冲突副本反馈和“导入副本”内容。
- smoke test 新增作品集导出按钮静态标记。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.artworks`、关联 `sessions`、作品截图、标签、反馈和评分证据。
- 写入状态：`artworkRepository.lastCollectionExportedAt` 与 `lastCollectionArtworkCount`。
- 成功反馈：页面 notice 显示已生成并下载的文件名，作品仓库状态显示最近导出离线 HTML 作品集。
- 失败反馈：没有作品时返回明确失败并不触发假下载。
- 刷新后复现方式：最近导出状态保存在 localStorage；导出的 HTML 文件本身可离线打开。

仍待补：

- 当前是本机静态 HTML 作品集，不是账号化公开作品集、课堂作品墙、跨设备作品库、生产 CDN、社交平台发布或云端权限系统。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增作品集 HTML 导出`

## 112. 2026-06-13 新增课堂评阅表导出

本次把作品集继续推进到“课堂可评阅”的本机文件闭环。老师不需要账号后台，也可以从当前浏览器作品集导出一份离线 HTML 评阅表，打开后填写分数、等级、评阅人和批注，并导出评阅 JSON 便于线下收集。

完成内容：

- 新增 `mr-calligraphy-classroom-review-v1` 导出格式和 `ARTWORK_CLASSROOM_REVIEW_BOUNDARY` 边界说明。
- 新增 `MRAppState.getArtworkClassroomReviewExport()`，从本机作品、关联练习、评分证据、反馈和截图生成课堂评阅表 HTML。
- 新增 `MRAppState.downloadArtworkClassroomReviewPage()`，真实触发 HTML 下载，并写入最近课堂评阅表导出时间和作品数。
- 前台作品仓库工具区新增 `artworkClassroomReviewExportButton`，按钮文案为“导出评阅表”。
- 评阅表 HTML 内置本机评阅器：可填写教师分数、等级、评阅人和课堂批注，自动保存到该 HTML 所在浏览器的 localStorage，并可导出 `mr-calligraphy-classroom-review-notes-*.json`。
- E2E 用例会点击“导出评阅表”，读取下载 HTML，验证 `MR 课堂作品评阅表`、`ClassroomReview: yes`、评阅 JSON 导出按钮、教师分数字段、边界说明和冲突副本反馈。
- smoke test 新增课堂评阅表按钮静态标记。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.artworks`、关联 `sessions`、作品截图、反馈和评分证据。
- 写入状态：`artworkRepository.lastClassroomReviewExportedAt` 与 `lastClassroomReviewArtworkCount`。
- 成功反馈：页面 notice 显示已生成并下载的文件名，作品仓库状态显示最近导出离线课堂评阅表。
- 失败反馈：没有作品时返回明确失败并不触发假下载。
- 刷新后复现方式：最近导出状态保存在 localStorage；下载的评阅表 HTML 可离线打开，并在打开后的浏览器里保存评阅草稿。

仍待补：

- 当前是本机离线评阅表和本机评阅 JSON，不是账号化教师端、课堂作品墙、云端批改、班级权限、生产 CDN 或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增课堂评阅表导出`

## 113. 2026-06-13 新增课堂评阅导入回写

本次把“导出评阅表”继续补成可回收的闭环。老师在离线评阅表里导出的 `mr-calligraphy-classroom-review-notes-v1` JSON，可以通过前台作品集导回当前浏览器，按作品 ID 写回对应 `ArtworkRecord.classroomReview`。

完成内容：

- `ArtworkRecord` 新增 `classroomReview` 归一化字段，保存教师分数、评阅等级、评阅人、课堂批注、来源包 ID 和本机 digest。
- 新增 `MRAppState.importArtworkClassroomReviewNotes()`，解析 `mr-calligraphy-classroom-review-notes-v1` JSON 并按 `artworkId` 回写本机作品。
- 导入时会跳过不存在作品或空评阅记录，不会伪造成功，也不会创建假作品。
- 作品仓库状态新增 `lastClassroomReviewImportedAt`、`lastClassroomReviewImportedCount` 和 `lastClassroomReviewSkippedCount`。
- 前台作品集新增 `artworkClassroomReviewImportButton` 和 `artworkClassroomReviewImportInput`，通过真实 file chooser 导入评阅 JSON。
- 作品卡片会显示课堂评阅摘要，包含评阅人、等级、教师分数和批注。
- E2E 用例覆盖评阅 JSON 导入、跳过不存在作品、状态栏更新、作品卡片显示和 localStorage 回写。
- smoke test 新增课堂评阅导入按钮和输入框标记。

真实化说明：

- 数据来源：离线评阅表导出的 `mr-calligraphy-classroom-review-notes-v1.records` 和当前浏览器本机 `artworks`。
- 写入状态：匹配成功的作品会写入 `artworks[*].classroomReview`；导入统计写入 `artworkRepository`。
- 成功反馈：状态栏显示导入数量和跳过数量，作品卡片立刻显示课堂评阅摘要。
- 失败反馈：JSON 解析失败、kind 不匹配、缺少 records 或没有匹配作品时会返回明确失败，不写入假评阅。
- 刷新后复现方式：课堂评阅随 `mr-calligraphy-learning-state-v1.artworks` 持久化，刷新后仍显示在作品集。

仍待补：

- 当前是本机评阅 JSON 回写，不是账号化教师端、班级批量收取、云端批改、权限校验、服务端签名或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增课堂评阅导入回写`

## 114. 2026-06-13 新增课堂评阅汇总导出

本次把导回本机作品集的课堂评阅再补成可归档文件。用户导入老师评阅 JSON 后，可以一键导出 `mr-calligraphy-classroom-review-summary-*.html`，用于课堂归档、打印或线下交接。

完成内容：

- 新增 `mr-calligraphy-classroom-review-summary-v1` 汇总格式和课堂评阅汇总边界说明。
- 新增 `MRAppState.getArtworkClassroomReviewSummaryExport()` 和 `downloadArtworkClassroomReviewSummary()`。
- 汇总 HTML 包含评阅总数、教师均分、有分数数量、评阅人数量、等级分布、作品缩略图、教师分数、等级、评阅人、批注和 review digest。
- 前台作品仓库工具区新增 `artworkClassroomReviewSummaryExportButton`，文案为“评阅汇总”。
- 只有存在已导入课堂评阅时才启用汇总导出，避免空壳文件。
- 导出结果写入 `artworkRepository.lastClassroomReviewSummaryExportedAt` 和 `lastClassroomReviewSummaryCount`。
- E2E 用例覆盖导入课堂评阅后点击“评阅汇总”、读取下载 HTML、验证教师、分数、批注、digest 和状态写入。
- smoke test 新增评阅汇总按钮标记。

真实化说明：

- 数据来源：当前浏览器本机 `artworks[*].classroomReview`。
- 写入状态：汇总导出时间和数量写入 `artworkRepository`。
- 成功反馈：状态栏显示最近导出课堂评阅汇总，下载 HTML 可离线打开和打印。
- 失败反馈：没有已导入课堂评阅时返回明确失败，不生成空汇总。
- 刷新后复现方式：评阅和导出状态都随 localStorage 恢复。

仍待补：

- 当前是本机离线汇总，不是账号化教师端、班级成绩册、云端批改、权限校验、服务端签名或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增课堂评阅汇总导出`

## 115. 2026-06-13 新增主后台导入模型历史文件清理

本次回到后台场景编辑，把主后台导入模型删除审计从“只能说明为什么保留文件”推进到“用户可手动清理历史保留资产”。此前写实后台已经有“清理已删除文件”，主后台在导入模型被历史快照引用时会保留 IndexedDB 文件，但缺少后续清理入口，容易让后台资产管理闭环不完整。

完成内容：

- 主后台导入模型删除审计区新增 `mainImportAuditCleanup`，按钮文案为“清理历史文件”。
- `main-admin-scene.js` 新增 `getRetainedImportAuditRecords()`，只筛选审计状态为 `retained-for-history` 且不在当前布局中的导入资产。
- 新增 `cleanupRetainedImportedModelFiles()`，点击后确认风险，逐条删除 `mr-calligraphy-main-model-store/models` 中的历史保留模型文件。
- 清理成功会把对应审计记录更新为 `storage-deleted`，审计列表和 HTML 导出显示“文件已清理”。
- 清理按钮受本机后台 `delete` 权限门控；无可清理记录或权限不足时保持禁用。
- Playwright 主后台导入删除审计用例扩展为验证清理按钮、确认弹窗、IndexedDB 资产删除、审计状态更新和 HTML 导出内容。
- smoke test 新增主后台清理按钮静态标记。

真实化说明：

- 数据来源：主后台本机导入模型删除审计 `mr-calligraphy-main-import-audit-v1` 与 IndexedDB 模型仓库 `mr-calligraphy-main-model-store/models`。
- 写入状态：清理后更新同一条审计记录的 `cleanupStatus`、`action` 和说明；不会伪造新的场景对象。
- 成功反馈：状态区显示实际清理数量，审计列表显示“文件已清理”，测试会读取 IndexedDB 确认资产不存在。
- 失败反馈：无历史保留记录、用户取消、权限不足或删除失败都有明确提示，不返回虚假成功。
- 刷新后复现方式：清理结果写入 localStorage 审计记录，刷新主后台仍显示“文件已清理”。

仍待补：

- 这是主后台本机 IndexedDB 文件清理，不是服务端资产回收、生产 CDN purge、账号权限审计或不可篡改日志。清理后，依赖该导入资产的旧本机快照可能无法完整恢复对应模型文件。

验收：

- `node --input-type=module --check < main-admin-scene.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin records imported model deletion audit"`
- `git diff --check`

提交：

- 中文 commit message：`新增主后台导入模型历史文件清理`

## 116. 2026-06-13 新增导入模型孤立贴图清理

本次继续完善后台场景编辑的导入模型资产管理。此前主后台和写实后台已经支持替换、移除导入模型贴图，但“移除引用”不会立刻删除贴图二进制，这是为了保护历史快照和已发布版本；缺口在于用户缺少一个可确认、可审计、可验证的后续清理入口。

完成内容：

- `model-import-utils.js` 的 IndexedDB 模型仓库新增 `list()`，用于真实枚举本机已保存的模型/贴图资产。
- 主后台导入模型材质区新增 `mainImportModelTextureCleanup`，按钮文案为“清理孤立贴图”。
- 写实后台导入模型材质区新增 `realisticImportModelTextureCleanup`，按钮文案为“清理孤立贴图”。
- 主后台和写实后台分别扫描当前草稿、保存历史、当前发布版本和发布版本历史，只把未被任何版本引用的 PNG/JPG/WebP 贴图判定为孤立贴图。
- 清理动作受本机后台 `delete` 权限门控，并在执行前弹出确认，避免误删仍有业务含义的资产。
- 清理成功后删除对应 IndexedDB 贴图记录，并写入导入模型审计；审计列表和 HTML 导出继续显示“文件已清理”。
- Playwright 主后台/写实后台材质发布用例扩展为手动写入一个真实 IndexedDB 孤立贴图，点击清理后确认孤立贴图消失，同时确认当前草稿贴图和已发布版本贴图仍保留。
- smoke test 新增主后台和写实后台贴图输入、移除、孤立清理按钮标记。

真实化说明：

- 数据来源：`mr-calligraphy-main-model-store/models`、`mr-calligraphy-model-store/models`、当前 localStorage 草稿、保存历史和发布版本历史。
- 写入状态：清理只删除没有任何布局引用的贴图资产，并把结果写入对应导入模型审计，不会伪造场景对象或删除仍被发布版本引用的贴图。
- 成功反馈：状态区显示实际清理数量，材质状态显示清理完成，审计列表显示“文件已清理”。
- 失败反馈：无孤立贴图、用户取消、权限不足、扫描失败或删除失败都会返回明确提示。
- 刷新后复现方式：清理结果保存在 IndexedDB 删除状态和 localStorage 审计记录里，刷新后台后仍可查看审计。

仍待补：

- 当前是本机浏览器 IndexedDB 贴图清理，不是服务端对象存储回收、生产 CDN purge、多人账号权限、不可篡改审计或跨设备资产回收。

验收：

- `node --input-type=module --check < model-import-utils.js`
- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin updates imported model material and publishes it"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "realistic admin updates imported model material and publishes it"`
- `git diff --check`

提交：

- 中文 commit message：`新增导入模型孤立贴图清理`

## 117. 2026-06-13 新增作品仓库包摘要验真

本次回到前台作品仓库，把“导出 JSON / 导入 JSON”从可迁移推进到可验真。此前作品仓库包能导出 ArtworkRecord 和关联练习，也能导入并处理同 ID 冲突，但如果 JSON 文件被手工篡改，导入流程只能按内容处理，缺少包级摘要校验。

完成内容：

- 作品仓库 JSON 包新增 `digestAlgorithm: "sha256-stable-json"`。
- 作品仓库 JSON 包新增顶层 `packageDigest`，导出时按稳定 JSON 计算 SHA-256。
- `getArtworkRepositoryStatus()` 会在最近导出/导入状态中显示摘要短码，方便人工核对包版本。
- `parseArtworkRepositoryPackage()` 导入时会校验 `packageDigest`；若声明摘要与实际内容不匹配，直接返回失败，不导入任何作品或关联练习。
- 旧版没有 `packageDigest` 的作品仓库包仍可按旧包导入，避免破坏已有本机备份。
- Playwright 作品仓库用例新增篡改包场景：修改作品标题但保留旧摘要，确认状态显示“摘要校验失败”，作品集仍为空；随后导入原始包成功。
- 冲突包测试会在修改内容后重新计算摘要，确认同 ID 差异处理仍可用。

真实化说明：

- 数据来源：当前浏览器本机 `ArtworkRecord`、关联 `PracticeSession` 和导出的 JSON 包。
- 写入状态：导出/导入会记录 `lastPackageDigest`；摘要不匹配时只写入错误状态，不写入作品、练习或冲突副本。
- 成功反馈：状态栏显示最近导出/导入数量、时间和摘要短码。
- 失败反馈：篡改包显示声明摘要和实际摘要短码，并明确“未导入任何作品”。
- 刷新后复现方式：导入成功的摘要写入 `mr-calligraphy-learning-state-v1.artworkRepository.lastPackageDigest`，失败不会污染作品列表。

仍待补：

- 当前是本机 SHA-256 包验真，不是服务端签名、公钥证书链、账号化作品仓库、课堂作品墙或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增作品仓库包摘要验真`

## 118. 2026-06-13 新增课堂评阅包摘要验真

本次继续补强前台课堂评阅闭环。此前离线课堂评阅表能导出 JSON，主应用也能导入回写，但评阅 JSON 被手工改动后仍会按内容导入，缺少和作品仓库同级的包摘要验真。

完成内容：

- `mr-calligraphy-classroom-review-notes-v1` 评阅 JSON 支持 `digestAlgorithm: "sha256-stable-json"`。
- 离线课堂评阅表内置导出脚本新增稳定 JSON 序列化和 SHA-256 摘要计算，导出的评阅 JSON 会尽量写入顶层 `packageDigest`。
- `parseArtworkClassroomReviewNotes()` 导入时校验 `packageDigest`；摘要不匹配时直接拒绝，不回写任何课堂评阅。
- 旧版没有 `packageDigest` 的课堂评阅 JSON 仍可导入，避免破坏已导出的离线评阅文件。
- 作品仓库状态新增 `lastClassroomReviewPackageDigest`，最近课堂评阅导入成功后会显示摘要短码，便于老师和操作者核对文件。
- Playwright 作品仓库用例新增课堂评阅篡改包场景：先导入被改过但未重算摘要的 JSON，确认状态显示摘要校验失败且作品卡片未出现评阅；再导入原包成功。

真实化说明：

- 数据来源：离线课堂评阅表导出的 `records` 和当前浏览器本机作品 ID。
- 写入状态：摘要通过后才把教师分数、等级、评阅人和课堂批注写回 `ArtworkRecord.classroomReview`。
- 成功反馈：状态栏显示导入数量、跳过数量和摘要短码。
- 失败反馈：摘要不匹配会显示声明摘要和实际摘要短码，并明确“未导入任何评阅”。
- 刷新后复现方式：成功导入后的评阅和 `lastClassroomReviewPackageDigest` 会持久化在 `mr-calligraphy-learning-state-v1`。

仍待补：

- 当前是本机 SHA-256 包验真，不是教师账号签名、服务端证书链、不可篡改审计、班级权限或云端课堂作品墙。

验收：

- `node --check app-state.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增课堂评阅包摘要验真`

## 119. 2026-06-13 新增学习路径动作覆盖验收

本次回到前台“按钮像假的”的源头之一：学习路径 10 个场景会动态生成动作按钮，如果后续新增动作时只写了按钮文案，却忘记补 `LEARNING_ACTION_FEATURES` 或 `runLearningAction` 处理分支，页面就可能回到“可见但不可用 / 点击后假成功”的状态。

完成内容：

- 新增 `scripts/learning-action-coverage-check.js`，解析 `script.js` 中的 `SCENES` 动作列表。
- 检查每个学习路径动作都存在 `LEARNING_ACTION_FEATURES` 状态标记，且状态不能是 `disabled` / `demo-content`。
- 检查每个学习路径动作都存在 `runLearningAction` 真实处理分支。
- 反向检查 `runLearningAction` 里的动作分支是否都有状态标记，避免处理函数和 UI 标记漂移。
- 将检查接入 `scripts/smoke-test.js` 的语法检查和命令检查。
- 当前检查结果：10 个场景、30 个动作、30 个状态标记、30 个处理分支全部覆盖。

真实化说明：

- 数据来源：`script.js` 的 `SCENES`、`LEARNING_ACTION_FEATURES` 和 `runLearningAction`。
- 执行动作：提交前自动解析前台学习路径动作覆盖关系。
- 成功反馈：命令输出场景、动作、状态标记和处理分支数量。
- 失败反馈：明确指出缺状态标记、缺处理分支或状态仍是 `disabled` / `demo-content` 的动作名称。
- 持久化：作为 smoke test 固定门禁，后续新增学习路径动作时会被自动检查。

仍待补：

- 这是静态覆盖验收，不替代完整浏览器点击测试；复杂动作仍需要 Playwright 继续覆盖真实写入、下载和失败恢复。

验收：

- `node --check scripts/learning-action-coverage-check.js`
- `node scripts/learning-action-coverage-check.js`
- `node --check scripts/smoke-test.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增学习路径动作覆盖验收`

## 120. 2026-06-13 新增学习档案包摘要验真

本次补齐前台学习档案仓库的包级完整性校验。此前学习档案 JSON 同步包能导出、导入、推送和拉取，但远端或本机文件被手工改动后仍可能进入导入流程，缺少和作品仓库、课堂评阅同级的摘要验真。

完成内容：

- `MRAppState.getHistoryRepositoryPackage()` 生成 `digestAlgorithm: "sha256-stable-json"` 和顶层 `packageDigest`。
- `packageDigest` 按去除自身后的稳定 JSON 计算 SHA-256，覆盖 sessions、artworks、reports、stages、history、summary、workspace 和来源边界。
- `parseHistoryRepositoryPackage()` 导入前校验摘要；声明摘要与实际内容不一致时拒绝导入，不写入任何学习档案。
- 旧版没有 `packageDigest` 的学习档案包仍兼容导入，避免历史 JSON 包失效。
- 本机导出、导入、远端检查、远端推送、远端拉取都会把最近 `lastPackageDigest` 写入 `historyRepository` 状态，并在状态提示中显示摘要短码。
- 远端推送失败历史记录使用同一个包摘要，方便排查失败请求与本机 JSON 包是否一致。
- Node 状态层脚本覆盖篡改包拒绝、mock server 保存摘要、推送结果返回摘要和状态持久化。
- Playwright 前台用例覆盖远端推送 body 的 `digestAlgorithm` / `packageDigest`、localStorage 持久化、拉取后摘要保留，以及分页冲突包重算摘要。

真实化说明：

- 数据来源：当前浏览器本机学习档案、远端学习档案 API 返回包和本机 JSON 同步包。
- 写入状态：摘要通过后才导入 sessions、artworks、reports 和 stages；成功同步后写入 `mr-calligraphy-learning-state-v1.historyRepository.lastPackageDigest`。
- 成功反馈：状态栏显示记录数、Workspace 和摘要短码。
- 失败反馈：摘要校验失败会显示声明摘要和实际摘要短码，并明确“未导入任何学习档案”。
- 刷新后复现方式：最近包摘要、远端状态和失败历史都持久化在 `mr-calligraphy-learning-state-v1.historyRepository`。

仍待补：

- 当前是本机 SHA-256 完整性校验，不是账号签名、公钥证书、云端不可篡改审计、远端权限或多人合并策略。

验收：

- `node --check app-state.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node --check scripts/smoke-test.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案包摘要验真`

## 121. 2026-06-13 新增报告仓库包摘要验真

本次补齐前台报告仓库 JSON 同步包的包级完整性校验。此前报告仓库已经包含每份报告的本机验真摘要，也能保存远端签名回执，但整个 `mr-calligraphy-report-repository-v1` 包被手工改动后仍可能进入导入/拉取流程。

完成内容：

- `MRAppState.getReportRepositoryPackage()` 生成 `digestAlgorithm: "sha256-stable-json"` 和顶层 `packageDigest`。
- `packageDigest` 按去除自身后的稳定 JSON 计算 SHA-256，覆盖报告、报告验真摘要、summary、Workspace、来源边界和远端接受元数据。
- `parseReportRepositoryPackage()` 导入前校验摘要；声明摘要与实际内容不一致时拒绝导入，不写入任何报告。
- 旧版没有 `packageDigest` 的报告仓库包仍兼容导入，避免历史 JSON 包失效。
- 本机导出、导入、远端检查、推送、拉取都会把最近 `lastPackageDigest` 写入 `reportRepository` 状态，并在状态提示中显示摘要短码。
- 远端报告 API 如果返回了包但摘要无效，会明确失败，不再被当成“空报告仓库”。
- `scripts/report-repository-mock-server.js` 会校验请求包摘要；服务端改写 `packageId/acceptedAt/repositoryDigest` 后会重新生成 `packageDigest`。
- Node 状态层脚本覆盖篡改包拒绝、mock server 保存摘要、推送结果返回摘要和状态持久化。
- Playwright 前台用例覆盖报告仓库下载包摘要、远端 PUT body 摘要、远端接受包摘要、拉取后摘要保留和失败历史摘要。

真实化说明：

- 数据来源：当前浏览器本机 `ReportRecord`、本机报告验真摘要、远端报告 API 返回包和本机 JSON 同步包。
- 写入状态：摘要通过后才导入报告；成功同步后写入 `mr-calligraphy-learning-state-v1.reportRepository.lastPackageDigest`。
- 成功反馈：报告仓库摘要显示报告数、Workspace、签名回执和摘要短码。
- 失败反馈：摘要校验失败会显示声明摘要和实际摘要短码，并明确“未导入任何报告”。
- 刷新后复现方式：最近包摘要、远端状态、签名回执和失败历史都持久化在 `mr-calligraphy-learning-state-v1.reportRepository`。

仍待补：

- 当前是本机 SHA-256 完整性校验，不是教师账号签名、公钥证书链、生产签章、云端不可篡改审计或账号权限系统。

验收：

- `node --check app-state.js`
- `node --check scripts/report-repository-mock-server.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front report repository"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库包摘要验真`

## 122. 2026-06-13 新增计划仓库包摘要验真

本次补齐前台学习计划仓库 JSON 同步包的包级完整性校验。计划仓库已经有本机 JSON 包、远端 API、回执审计、自动同步队列和冲突合并，但此前整个 `mr-calligraphy-plan-repository-v1` 包被手工改动后仍可能进入导入或远端拉取流程。

完成内容：

- `MRAppState.getPlanRepositoryPackage()` 生成 `digestAlgorithm: "sha256-stable-json"` 和顶层 `packageDigest`。
- `packageDigest` 按去除自身后的稳定 JSON 计算 SHA-256，覆盖计划、任务项、summary、Workspace、来源边界和远端接受元数据。
- `parsePlanRepositoryPackage()` 导入前校验摘要；声明摘要与实际内容不一致时拒绝导入，不写入任何计划。
- 旧版没有 `packageDigest` 的计划仓库包仍兼容导入，避免历史 JSON 包失效。
- 本机导出、导入、远端检查、推送、拉取都会把最近 `lastPackageDigest` 写入 `planRepository` 状态，并在状态提示中显示摘要短码。
- 远端计划 API 如果返回了包但摘要无效，会明确失败，不再被当成“空计划仓库”。
- `scripts/plan-repository-mock-server.js` 会校验请求包摘要；服务端改写 `packageId/acceptedAt/repositoryDigest` 后会重新生成 `packageDigest`。
- 自动同步失败历史记录会保存本次待推送包摘要，方便把超时、401、422 和网络失败关联到具体计划包。
- Node 状态层脚本覆盖篡改包拒绝、mock server 保存摘要、推送结果返回摘要、失败历史摘要和状态持久化。
- Playwright 前台用例覆盖计划仓库远端 PUT body 摘要、远端接受包摘要、localStorage 持久化、失败队列摘要和冲突包重算摘要。

真实化说明：

- 数据来源：当前浏览器本机学习计划、远端计划 API 返回包和本机 JSON 同步包。
- 写入状态：摘要通过后才导入 plans；成功同步后写入 `mr-calligraphy-learning-state-v1.planRepository.lastPackageDigest`。
- 成功反馈：计划仓库摘要显示计划数、Workspace、回执校验状态和摘要短码。
- 失败反馈：摘要校验失败会显示声明摘要和实际摘要短码，并明确“未导入任何计划”。
- 刷新后复现方式：最近包摘要、远端状态、回执和自动同步失败历史都持久化在 `mr-calligraphy-learning-state-v1.planRepository`。

仍待补：

- 当前是本机 SHA-256 完整性校验，不是账号签名、公钥证书链、生产云端审计、教师排课权限或多人协同自动合并。

验收：

- `node --check app-state.js`
- `node --check scripts/plan-repository-mock-server.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front plan repository"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划仓库包摘要验真`

## 123. 2026-06-13 新增远端分享仓库包摘要验真

本次补齐前台作品分享远端 API 的包级完整性校验。远端分享已经有真实 GET/PUT/DELETE、Workspace、publicUrl、发布/撤销回执、回执本机校验和失败恢复，但整个 `mr-calligraphy-share-repository-v1` 分享包此前缺少顶层 `packageDigest`，真实远端或 mock 返回被篡改的分享包时前端无法先验真再使用。

完成内容：

- `MRAppState.getArtworkShareRemotePackage()` 生成 `digestAlgorithm: "sha256-stable-json"` 和顶层 `packageDigest`。
- `packageDigest` 按去除自身后的稳定 JSON 计算 SHA-256，覆盖分享记录、分享 HTML、summary、Workspace、storageKey 和远端接受元数据。
- `parseShareRepositoryPackage()` 会先校验摘要；声明摘要与实际内容不一致时拒绝使用远端分享包，不写入最近远端包状态。
- 旧版没有 `packageDigest` 的分享包仍兼容读取，避免历史 mock 或临时服务立即失效。
- 远端检查和发布会把最近 `lastPackageDigest` 写入 `shareService` 状态，并在状态提示中显示摘要短码。
- 发布失败历史会记录本次 PUT 请求包摘要，便于把 401、422、超时和网络中断关联到具体分享包。
- `scripts/share-repository-mock-server.js` 会校验请求包摘要；服务端改写 `packageId/acceptedAt/repositoryDigest/publicUrl` 后会重新生成 `packageDigest`，撤销改写最近包后也会重新签摘要。
- Node 状态层脚本覆盖本机包摘要、mock server 保存摘要、远端接受包摘要、篡改远端包拒绝、撤销后重签和状态持久化。
- Playwright 前台用例覆盖远端分享 PUT body 摘要、远端接受包摘要、`shareService.lastPackageDigest` 持久化和失败恢复历史包摘要。

真实化说明：

- 数据来源：当前浏览器本机分享记录、作品分享 HTML、远端分享 API 返回包和本机 mock server。
- 写入状态：摘要通过后才使用远端分享包；成功发布或检查后写入 `mr-calligraphy-learning-state-v1.shareService.lastPackageDigest`。
- 成功反馈：远端分享状态显示 Workspace、publicUrl、回执校验状态和摘要短码。
- 失败反馈：摘要校验失败会显示声明摘要和实际摘要短码，并明确“未使用该分享包”。
- 刷新后复现方式：最近包摘要、远端状态、回执和失败历史都持久化在 `mr-calligraphy-learning-state-v1.shareService`。

仍待补：

- 当前是本机 SHA-256 完整性校验，不是账号签名、公钥证书链、生产 CDN、微信公开链接、班级作品墙权限或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check scripts/share-repository-mock-server.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front share repository"`
- `git diff --check`

提交：

- 中文 commit message：`新增远端分享仓库包摘要验真`

## 124. 2026-06-13 新增静态控件处理器覆盖验收

本次继续回应“前端很多按钮像假的”的问题，把已有控件状态清单从“按钮有 `data-feature-state` 标记”升级为“标记为真实能力的按钮必须能追踪到处理器”。此前 `scripts/control-inventory.js` 只确认四个入口 HTML 的按钮和导航链接有状态标签，不能证明这些按钮真的被 JS 绑定。

完成内容：

- `scripts/control-inventory.js` 新增真实控件处理器覆盖检查。
- 四个入口页面按实际加载脚本映射：前台检查 `practice-canvas.js` + `script.js`，主后台检查 `project-archive.js` + `main-admin-scene.js`，写实演示和写实后台检查 `realistic-scene.js`。
- 对 `real`、`real-local`、`real-export`、`real-published-local` 控件强制检查处理器。
- 导航链接只要有真实 `href` 即视为可跳转；无 `href` 的 `<a>` 不计入按钮能力。
- 普通按钮会追踪 `document.getElementById()`、`els.xxx`、变量 `.addEventListener()`、直接 `querySelector/getElementById().addEventListener()`。
- 批量按钮会识别 `data-*` selector，例如 `data-learning-mode` 和 `data-history-filter` 的 `forEach(... addEventListener)` 绑定。
- 表单提交按钮会追踪父级 `<form>` 的 `submit` 处理器。
- 练习画布按钮会识别传入 `MRPracticeCanvas.init({ undoButton, clearButton, replayButton })` 的真实初始化模式。
- 输出新增 `handled` 和 `missingHandler` 统计；当前验收为前台 103 个、主后台 53 个、写实演示 3 个、写实后台 34 个真实控件全部有处理器。

真实化说明：

- 数据来源：静态 HTML 控件、实际加载的本机 JS 文件和可追踪的事件绑定/初始化模式。
- 成功反馈：`node scripts/control-inventory.js --check` 会输出每页真实控件数量和 `missingHandler 0`。
- 失败反馈：新增真实按钮但没有处理器时，脚本会输出具体页面行号和控件标签，阻止 smoke 通过。
- 刷新后复现方式：该门禁已进入 `scripts/smoke-test.js`，每次 smoke 都会重新检查。

仍待补：

- 这是静态处理器覆盖门禁，不等价于完整用户流程验收；具体点击后的数据写入、下载文件、远端请求和失败恢复仍要依赖状态脚本和 Playwright。

验收：

- `node --check scripts/control-inventory.js`
- `node scripts/control-inventory.js --check`
- `node --check scripts/smoke-test.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增静态控件处理器覆盖验收`

## 125. 2026-06-13 新增动态控件处理器覆盖验收

本次继续处理“前端很多按钮像假的”的问题，把控件状态清单从静态 HTML 扩展到运行时生成按钮。此前前台视频导出“重试”、报告能力结构行和 AI 讲解步骤按钮是 JS 动态创建的，缺少显式 `data-feature-state` 时会被前台兜底标成“暂不可用”，容易让真实功能看起来像假的。

完成内容：

- `script.js` 为视频导出失败记录的“重试”按钮补充 `data-feature-state="real-local"`。
- `script.js` 为报告能力结构切换行补充 `data-feature-state="real-local"`。
- `script.js` 为 AI 讲解步骤进度按钮补充 `data-feature-state="disabled"`，明确这是只读进度状态而不是遗漏处理器。
- `scripts/control-inventory.js` 的动态扫描范围从前台脚本扩展为 `script.js`、`main-admin-scene.js`、`realistic-scene.js` 和 `project-archive.js`。
- 动态清单会识别 `document.createElement("button")` 创建的运行时按钮，检查是否存在 `dataset.featureState` 或 `setAttribute("data-feature-state", ...)`。
- 对 `real`、`real-local`、`real-export`、`real-published-local` 动态按钮强制追踪处理器。
- 处理器追踪支持直接 `.addEventListener("click", ...)`，也支持父容器委托的 `event.target?.closest?.("[data-*]")` / `matches()` 写法。
- 动态输出新增 `buttons`、`dynamicState`、`missing`、`handled` 和 `missingHandler` 统计。
- 当前验收：前台 34 个运行时按钮、主后台 8 个运行时按钮、写实场景 4 个运行时按钮均无缺失状态，真实动态按钮均为 `missingHandler 0`。

真实化说明：

- 数据来源：运行时 JS 创建按钮、按钮状态标记、直接点击绑定和 `data-*` 委托处理器。
- 成功反馈：`node scripts/control-inventory.js --check` 会列出每个脚本的动态按钮数量和 `missingHandler 0`。
- 失败反馈：新增真实动态按钮但没写状态或没接入处理器时，脚本会指出文件行号和变量名。
- 刷新后复现方式：该检查已由 smoke 统一调用，后续新增运行时按钮会被同一门禁覆盖。

仍待补：

- 动态处理器覆盖证明按钮接入了处理路径，不等价于所有点击后的业务状态都完整；下载、远端请求、冲突合并和失败恢复仍需要状态脚本与 Playwright 持续扩展。

验收：

- `node --check scripts/control-inventory.js`
- `node scripts/control-inventory.js --check`
- `node --check scripts/smoke-test.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增动态控件处理器覆盖验收`

## 126. 2026-06-13 新增学习动作审计面板

本次继续处理“按钮像假的”的体验问题：即使学习路径动作已经有真实处理器，用户点击后此前主要看到一条即时反馈和详情卡，缺少一个可回看的本机证据列表。现在前台学习操作区新增“本机动作审计”，每次模式、任务、讲解、练习、笔画、作品、报告、计划等动作都会从状态层 `events` 队列读取并展示，且可导出 HTML 审计。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-learning-event-audit-v1` 审计包。
- `MRAppState.getLearningEventAudit()` 返回最近动作、类型统计、总数、边界说明和稳定 `auditDigest`。
- `MRAppState.getLearningEventAuditExport()` 生成可离线打开的 HTML 审计页，包含动作列表、类型、事件 ID、时间和原始 JSON。
- `MRAppState.downloadLearningEventAudit()` 真实下载 `mr-calligraphy-learning-action-audit-*.html`。
- `index.html` 在学习操作区新增 `learningActionAuditStatus`、`learningActionAuditList` 和 `learningActionAuditExport`。
- `script.js` 渲染最近 5 条动作，导出按钮按是否存在事件自动启用/禁用。
- `scripts/smoke-test.js` 将新增审计面板纳入首页页面标记检查。
- `scripts/learning-state-check.js` 覆盖审计 kind、事件内容、摘要、边界和 HTML 导出。
- Playwright 前台真实练习用例覆盖动作列表显示“讲解 / 开始练习 / 保存作品”，并下载审计 HTML 验证标题、动作和审计摘要。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.events` 本机事件队列。
- 写入状态：沿用现有 `addEvent()`，不新增第二套事件存储。
- 成功反馈：前台面板显示最近动作数量、动作名称、类型、时间和事件 ID。
- 导出反馈：点击“导出审计”会下载 HTML；无事件时按钮禁用且不会伪造记录。
- 刷新后复现方式：事件队列随学习状态持久化到 localStorage，刷新后面板仍能读取最近动作。

仍待补：

- 当前是本机浏览器事件审计，不是账号化行为日志、服务端不可篡改审计、跨设备同步日志或教师端课堂审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习动作审计面板`

## 127. 2026-06-13 新增学习档案批量回执审计导出

本次继续把“前端按钮不是假的”落到用户可查证的证据上。学习档案的批量导出、删除、恢复和清空回收站此前已经会写入 `historyBatchReceipts`，但页面只展示最近一次，用户无法把这批操作作为独立审计文件留档。现在学习档案批量操作区新增最近回执列表和 HTML 审计导出。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-history-batch-receipt-audit-v1` 审计包。
- `MRAppState.getHistoryBatchReceiptAudit()` 返回最近批量操作回执、动作统计、总数、边界说明和 64 位 `auditDigest`。
- `MRAppState.getHistoryBatchReceiptAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadHistoryBatchReceiptAudit()` 真实下载 `mr-calligraphy-history-batch-receipts-*.html`。
- 前台学习档案批量回执区新增“导出回执”按钮和最近回执列表，展示导出、删除、恢复、永久删除和清空回收站历史。
- Smoke 页面标记检查新增 `historyBatchReceiptTitle`、`historyBatchReceiptExport` 和 `historyBatchReceiptList`。
- 状态层脚本覆盖删除、恢复、再次删除、清空回收站、审计摘要和 HTML 导出。
- Playwright 前台真实练习用例覆盖批量导出、删除、恢复后下载批量回执 HTML，并验证标题、删除/恢复动作和审计摘要。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.historyBatchReceipts`。
- 写入状态：沿用已有批量操作回执，不新增第二套存储。
- 成功反馈：学习档案区显示最近批量操作、记录数量、分类数量、文件名、回收站 ID 和最近回执列表。
- 导出反馈：点击“导出回执”会下载 HTML；无回执时按钮禁用，不生成空壳成功反馈。
- 刷新后复现方式：批量回执保存在 localStorage，刷新后列表和导出仍能读取。

仍待补：

- 当前是浏览器本机批量操作审计，不是服务端账号日志、课堂审计、跨设备日志或不可篡改审计链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案批量回执审计`

## 128. 2026-06-13 新增本机链接复制审计

本次继续治理“复制链接类按钮像假的”的体验问题。报告、学习档案、作品集、本机分享和远端分享的复制按钮此前主要依赖剪贴板成功提示，部分路径会降级为地址栏或手动复制，但缺少统一的本机回执与可导出证据。现在前台新增“本机链接审计”，每次复制站内链接都会留下本机回执，并可导出 HTML 审计。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-local-link-copy-audit-v1` 审计包。
- `MRAppState.recordLocalLinkCopyReceipt()` 记录链接类型、目标 ID、标题、URL、复制状态、时间和本机边界。
- `MRAppState.getLocalLinkCopyAudit()` 返回最近复制回执、目标类型统计、复制状态统计和 64 位 `auditDigest`。
- `MRAppState.getLocalLinkCopyAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadLocalLinkCopyAudit()` 真实下载 `mr-calligraphy-local-link-copy-audit-*.html`。
- 前台学习操作区新增 `localLinkCopyAuditStatus`、`localLinkCopyAuditList` 和 `localLinkCopyAuditExport`。
- 本机分享链接、远端分享链接、站内报告链接、学习档案链接和作品集链接复制后都会写入同一份本机审计。
- Smoke 页面标记检查新增本机链接审计面板。
- 状态层脚本覆盖报告链接、档案链接、剪贴板成功、地址栏降级、摘要和 HTML 导出。
- Playwright 前台真实练习用例覆盖本机分享链接和站内报告链接复制后显示审计列表，并下载 HTML 审计页。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.localLinkCopyReceipts`。
- 写入状态：复制动作完成后写入本机回执，同时写入学习动作事件队列。
- 成功反馈：前台面板显示最近复制数量、链接标题、目标类型、复制状态和时间。
- 失败/降级反馈：剪贴板不可用时记录 `route-fallback` 或 `manual` 状态，不伪造剪贴板成功。
- 刷新后复现方式：复制回执保存在 localStorage，刷新后面板仍能读取并导出。

仍待补：

- 当前是浏览器本机复制回执，不是公网访问日志、账号审计、跨设备分享统计、教师端课堂日志或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增本机链接复制审计`

## 129. 2026-06-13 新增报告打印回执审计

本次继续把报告区的导出类按钮真实化。“打印 / 保存 PDF”此前会调用浏览器 `window.print()`，但只给出瞬时提示；用户无法确认本机是否发起过打印窗口，也无法把打印请求留档。现在报告详情新增“打印回执审计”，每次点击打印都会先写入本机回执，再打开浏览器打印窗口，并可导出 HTML 审计页。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-report-print-audit-v1` 审计包。
- 状态层新增 `reportPrintReceipts`，保存最近 24 条报告打印/保存 PDF 请求。
- `MRAppState.recordReportPrintReceipt()` 记录报告 ID、报告标题、报告本机验真摘要、请求时间、浏览器信息、回执摘要和能力边界。
- `MRAppState.getReportPrintAudit()` 返回当前报告或全部报告的打印回执、状态统计、总数和 64 位 `auditDigest`。
- `MRAppState.getReportPrintAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadReportPrintAudit()` 真实下载 `mr-calligraphy-report-print-audit-*.html`。
- 前台报告详情新增 `reportPrintAudit`、`reportPrintAuditStatus`、`reportPrintAuditList` 和 `reportPrintAuditExport`。
- `printReportDetail()` 改为先写入回执，再打开浏览器打印窗口；打印版 CSS 会隐藏交互按钮和审计面板，避免 PDF 混入操作回执。
- Smoke 页面标记检查新增报告打印回执审计节点。
- 控件清单更新后，前台为 `real-local 75`、`real-export 32`、`handled 107`、`missingHandler 0`。
- 状态层脚本覆盖打印回执、报告验真摘要、回执摘要、边界说明和 HTML 导出。
- Playwright 前台真实练习用例会 stub `window.print()`，验证点击打印后写入回执、刷新面板、触发浏览器打印请求并下载打印审计 HTML。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.reportPrintReceipts`。
- 写入状态：用户点击“打印 / 保存 PDF”后立即写入本机回执，同时写入学习动作事件队列。
- 成功反馈：报告区显示最近打印请求、报告摘要、回执摘要和时间。
- 导出反馈：点击“导出打印”会下载 HTML；无回执时按钮禁用，不生成空壳审计。
- 刷新后复现方式：打印回执保存在 localStorage，刷新后面板仍能读取并导出。

仍待补：

- 当前只证明当前浏览器页面发起了打印/保存 PDF 请求，不代表操作系统打印完成、云端 PDF 渲染、打印机出纸、账号化教师端留档或不可篡改审计链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告打印回执审计`

## 130. 2026-06-13 新增计划提醒回执审计

本次继续处理高期望按钮的可追溯问题。学习计划的“启用本机提醒 / 触发本机提醒”此前已经会真实调用浏览器 Notification，但状态层只保存最近一次触发字段，页面也没有回执列表和导出能力。现在计划面板新增“提醒回执审计”，每次本机提醒成功触发都会留下回执，并可导出 HTML 审计。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-plan-reminder-audit-v1` 审计包。
- `planReminderService` 新增 `receipts` 队列，保存最近 24 条本机提醒回执。
- `MRAppState.dispatchPlanReminderNotification()` 成功触发 Notification 后写入计划 ID、计划项 ID、提醒状态、渠道、权限、触发时间、通知 tag 和回执摘要。
- `MRAppState.getPlanReminderAudit()` 返回当前计划或全部计划的提醒回执、渠道统计、状态统计和 64 位 `auditDigest`。
- `MRAppState.getPlanReminderAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadPlanReminderAudit()` 真实下载 `mr-calligraphy-plan-reminder-audit-*.html`。
- 前台计划面板新增 `planReminderAudit`、`planReminderAuditStatus`、`planReminderAuditList` 和 `planReminderAuditExport`。
- Smoke 页面标记检查新增计划提醒回执审计节点。
- 控件清单更新后，前台为 `real-local 75`、`real-export 33`、`handled 108`、`missingHandler 0`。
- 状态层脚本覆盖 Notification 调用、提醒回执、回执摘要、渠道统计、边界说明和 HTML 导出。
- Playwright 前台真实练习用例会模拟 Notification 授权，触发逾期计划项提醒，验证回执面板、localStorage 持久化和 HTML 审计下载。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.planReminderService.receipts`。
- 写入状态：成功触发本机浏览器 Notification 后写入回执，同时保留最近计划 ID、计划项 ID 和提醒 fingerprint。
- 成功反馈：计划面板显示最近提醒请求、触发渠道、提醒状态、回执摘要和时间。
- 导出反馈：点击“导出提醒”会下载 HTML；无回执时按钮禁用，不生成空壳审计。
- 刷新后复现方式：提醒回执随学习状态保存在 localStorage，刷新后仍能读取并导出。

仍待补：

- 当前只证明当前页面发起了本机 Notification 请求，不代表云端推送、系统通知中心送达、跨设备提醒、教师端通知或不可篡改审计链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划提醒回执审计`

## 131. 2026-06-13 新增计划导出回执审计

本次继续把学习计划相关按钮从“能下载”推进到“可追溯”。学习计划 HTML 和日历 ICS 已经是真实导出，但导出后页面没有留下回执，刷新后也无法确认曾经导出过哪份计划、哪种文件和文件摘要。现在计划面板新增“导出回执审计”，两种导出都会写入本机回执，并可下载 HTML 审计页。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-plan-export-audit-v1` 审计包。
- 学习状态新增 `planExportReceipts`，保存最近 24 条计划导出回执。
- `MRAppState.downloadPlan()` 成功下载 HTML 后写入计划 ID、计划标题、文件名、MIME、任务数量、完成度、文件摘要和回执摘要。
- `MRAppState.downloadPlanCalendar()` 成功下载 ICS 后写入同样的导出回执，并额外保存日历事件数量。
- `MRAppState.recordPlanExportReceipt()` 提供不依赖 DOM 下载的纯状态记录入口，便于状态层脚本验证。
- `MRAppState.getPlanExportAudit()` 返回当前计划或全部计划的导出回执、类型统计和 64 位 `auditDigest`。
- `MRAppState.getPlanExportAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadPlanExportAudit()` 真实下载 `mr-calligraphy-plan-export-audit-*.html`。
- 前台计划面板新增 `planExportAudit`、`planExportAuditStatus`、`planExportAuditList` 和 `planExportAuditExport`。
- Smoke 页面标记检查新增计划导出回执审计节点。
- 控件清单更新后，前台为 `real-local 75`、`real-export 34`、`handled 109`、`missingHandler 0`。
- 状态层脚本覆盖 HTML / ICS 回执、文件摘要、回执摘要、类型统计、边界说明和 HTML 审计导出。
- Playwright 前台真实练习用例会点击“导出计划”和“导出日历”，验证真实下载、回执面板、localStorage 持久化和 HTML 审计下载。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.planExportReceipts`。
- 写入状态：用户点击“导出计划”或“导出日历”并成功发起下载后写入本机回执，同时写入学习动作事件队列。
- 成功反馈：计划面板显示导出类型、文件名、计划任务数量、完成度、文件摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载 HTML；无回执时按钮禁用，不生成空壳审计。
- 刷新后复现方式：导出回执随学习状态保存在 localStorage，刷新后仍能读取并导出。

仍待补：

- 当前只证明当前页面发起了本机 HTML 或 ICS 下载请求，并记录当时生成内容的摘要；它不代表操作系统保存成功、云端下载日志、跨设备同步、文件长期存在或不可篡改审计链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划导出回执审计`

## 132. 2026-06-13 新增复盘导出回执审计

本次把复盘面板里已有的作品图片、复盘证据、学习报告和作品分享页下载补成可回看、可导出的本机回执。用户点击对应下载按钮后，复盘面板会显示导出类型、来源、文件名、文件摘要和回执摘要，后续可下载 HTML 审计页。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-review-export-audit-v1` 审计包。
- 学习状态新增 `reviewExportReceipts`，保存最近 30 条复盘导出回执。
- `MRAppState.recordReviewExportReceipt()` 提供状态层纯记录入口。
- `MRAppState.getReviewExportAudit()` 返回类型统计、回执列表和 64 位 `auditDigest`。
- `MRAppState.getReviewExportAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadReviewExportAudit()` 下载 `mr-calligraphy-review-export-audit-*.html`。
- `MRAppState.downloadReviewEvidence()`、`downloadReport()` 和 `downloadArtworkSharePage()` 成功发起下载后写入复盘导出回执。
- 前台 `reviewDownloadImage` 成功下载作品图片后写入作品图片回执。
- 前台复盘面板新增 `reviewExportAudit`、`reviewExportAuditStatus`、`reviewExportAuditList` 和 `reviewExportAuditExport`。
- Smoke 首页标记检查新增复盘导出回执审计节点。
- 控件清单更新后，前台为 `real-local 75`、`real-export 35`、`handled 110`、`missingHandler 0`。
- 状态层脚本覆盖作品图片、复盘证据、报告 HTML、作品分享页 HTML 回执、文件摘要、类型统计、边界说明和 HTML 审计导出。
- Playwright 前台真实练习用例会点击“下载图片”“下载证据”“导出报告”“导出分享页”，验证真实下载、回执面板、localStorage 持久化和 HTML 审计下载。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.reviewExportReceipts`。
- 写入状态：用户点击复盘导出按钮并成功发起本机下载后写入本机回执，同时保存当时生成内容的 SHA-256 摘要。
- 成功反馈：复盘面板显示导出类型、来源、文件名、文件摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载 HTML；无回执时按钮禁用，不生成空壳审计。
- 刷新后复现方式：导出回执随学习状态保存在 localStorage，刷新后仍能读取并导出。

仍待补：

- 当前只证明当前页面生成并发起了作品图片、复盘证据、报告 HTML 或作品分享页 HTML 的本机下载请求，并记录生成内容摘要；它不代表操作系统保存成功、云端下载日志、公网分享访问日志、跨设备同步、文件长期存在或不可篡改审计链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增复盘导出回执审计`

## 133. 2026-06-13 新增学习档案详情操作回执审计

本次继续治理“按钮点完像没发生”的问题，把学习档案详情里的图片下载、报告下载和直达链接复制补成本机可追溯回执。用户进入某条学习档案详情后，可以直接看到这条记录最近发生过哪些详情操作，并可导出 HTML 审计页。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-history-detail-action-audit-v1` 审计包。
- 学习状态新增 `historyDetailActionReceipts`，保存最近 30 条详情操作回执。
- `MRAppState.recordHistoryDetailActionReceipt()` 提供状态层纯记录入口。
- `MRAppState.getHistoryDetailActionAudit()` 支持按记录 ID 或操作类型过滤详情操作回执，返回类型统计和 64 位 `auditDigest`。
- `MRAppState.getHistoryDetailActionAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadHistoryDetailActionAudit()` 下载 `mr-calligraphy-history-detail-action-audit-*.html`。
- 前台学习档案详情面板新增 `historyDetailActionAudit`、`historyDetailActionAuditStatus`、`historyDetailActionAuditList` 和 `historyDetailActionAuditExport`。
- `historyDetailDownloadImage` 成功下载详情图片后写入图片下载回执。
- `historyDetailDownloadReport` 成功下载报告 HTML 后写入报告下载回执，同时保留既有复盘导出回执。
- `historyDetailCopyLink` 复制直达链接后写入详情链接复制回执，同时保留既有本机链接复制审计。
- Smoke 页面标记检查新增学习档案详情操作回执审计节点。
- 控件清单更新后，前台为 `real-local 75`、`real-export 36`、`handled 111`、`missingHandler 0`。
- 状态层脚本覆盖图片下载、报告下载、链接复制、记录级过滤、操作类型统计、边界说明和 HTML 审计导出。
- Playwright 前台真实练习用例会在作品详情和报告详情中点击下载、复制和导出回执，验证真实下载、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.historyDetailActionReceipts`。
- 写入状态：用户在学习档案详情中下载图片、下载报告或复制直达链接后写入本机回执，并保存文件或链接摘要。
- 成功反馈：详情面板显示操作类型、目标记录、文件名或链接、摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载当前详情记录相关的 HTML 审计页；无回执时按钮禁用。
- 刷新后复现方式：详情操作回执随学习状态保存在 localStorage，刷新后仍能按记录 ID 读取并导出。

仍待补：

- 当前只证明当前页面发起了详情页图片下载、报告 HTML 下载或链接复制请求，并记录生成内容摘要；它不代表操作系统保存成功、云端访问日志、系统剪贴板审计、跨设备同步、账号审计或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案详情操作回执审计`

## 134. 2026-06-13 新增报告导出回执审计

本次继续补齐报告详情里的导出闭环。站内报告已经能真实下载 HTML 和原生 PDF，但此前 PDF 下载没有本机回执，HTML 下载也只进入复盘导出记录，用户无法在报告详情里按报告查看“我导出了哪种文件、文件摘要是什么”。现在报告详情新增“导出回执审计”，HTML 和 PDF 下载都会写入本机回执，并可导出 HTML 审计页。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-report-export-audit-v1` 审计包。
- 学习状态新增 `reportExportReceipts`，保存最近 30 条报告导出回执。
- `MRAppState.recordReportExportReceipt()` 提供状态层纯记录入口。
- `MRAppState.getReportExportAudit()` 支持按报告 ID 或导出类型过滤，返回类型统计、回执列表和 64 位 `auditDigest`。
- `MRAppState.getReportExportAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadReportExportAudit()` 下载 `mr-calligraphy-report-export-audit-*.html`。
- `MRAppState.downloadReport()` 成功下载 HTML 后写入报告导出回执，同时保留既有复盘导出回执。
- `MRAppState.downloadReportPdf()` 成功下载原生 PDF 后写入报告导出回执。
- 前台报告详情新增 `reportExportAudit`、`reportExportAuditStatus`、`reportExportAuditList` 和 `reportExportAuditExport`。
- Smoke 页面标记检查新增报告导出回执审计节点。
- 控件清单更新后，前台为 `real-local 75`、`real-export 37`、`handled 112`、`missingHandler 0`。
- 状态层脚本覆盖 HTML / PDF 回执、报告验真摘要、文件摘要、类型统计、边界说明和 HTML 审计导出。
- Playwright 前台真实练习用例会在报告详情中点击“下载 HTML”“下载 PDF”和“导出回执”，验证真实下载、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.reportExportReceipts`。
- 写入状态：用户在报告详情或其他报告下载入口发起 HTML / PDF 下载后写入本机回执，并保存报告验真摘要和文件 SHA-256 摘要。
- 成功反馈：报告详情面板显示导出类型、文件名、文件摘要、报告验真摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载当前报告相关的 HTML 审计页；无回执时按钮禁用。
- 刷新后复现方式：报告导出回执随学习状态保存在 localStorage，刷新后仍能按报告 ID 读取并导出。

仍待补：

- 当前只证明当前页面生成并发起了报告 HTML 或原生 PDF 下载请求，并记录生成内容摘要；它不代表操作系统保存成功、云端 PDF 渲染日志、账号下载审计、跨设备同步、长期报告仓库或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告导出回执审计`

## 135. 2026-06-13 新增报告对比导出回执审计

本次继续补齐站内报告导出类操作的可追溯性。报告对比页此前已经是真实离线 HTML，但下载完成后页面没有留下回执；现在每次导出相邻报告对比页都会在当前报告下留下本机回执，并支持导出审计 HTML。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-report-comparison-export-audit-v1` 审计包。
- 学习状态新增 `reportComparisonExportReceipts`，保存最近 24 条报告对比导出回执。
- `MRAppState.recordReportComparisonExportReceipt()` 记录上份报告、本份报告、平均分差、字段差值、文件摘要和回执摘要。
- `MRAppState.getReportComparisonExportAudit()` 支持按报告 ID 过滤，返回提升/回落统计、回执列表和 64 位 `auditDigest`。
- `MRAppState.getReportComparisonExportAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadReportComparisonExportAudit()` 下载 `mr-calligraphy-report-comparison-export-audit-*.html`。
- `MRAppState.downloadReportComparison()` 成功下载对比 HTML 后写入报告对比导出回执。
- 前台报告详情新增 `reportComparisonExportAudit`、`reportComparisonExportAuditStatus`、`reportComparisonExportAuditList` 和 `reportComparisonExportAuditExport`。
- Smoke 页面标记检查新增报告对比导出回执审计节点。
- 控件清单更新后，前台为 `real-local 75`、`real-export 38`、`handled 113`、`missingHandler 0`。
- 状态层脚本覆盖前后报告 ID、平均分差、文件摘要、回执摘要、边界说明和 HTML 审计导出。
- Playwright 前台真实练习用例会在报告详情中点击“导出对比页”和“导出回执”，验证真实下载、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.reportComparisonExportReceipts`。
- 写入状态：用户发起报告对比 HTML 下载后写入本机回执，并保存当时生成内容的 SHA-256 摘要。
- 成功反馈：报告详情面板显示前后报告、平均分变化、文件名、文件摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载当前报告相关的 HTML 审计页；无回执时按钮禁用。
- 刷新后复现方式：报告对比导出回执随学习状态保存在 localStorage，刷新后仍能按报告 ID 读取并导出。

仍待补：

- 当前只证明当前页面生成并发起了报告对比 HTML 下载请求，并记录生成内容摘要；它不代表操作系统保存成功、云端长期报告、跨设备下载日志、账号审计或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告对比导出回执审计`

## 136. 2026-06-13 新增作品导出回执审计

本次补齐作品导出类操作的可追溯性。作品集、课堂评阅表和课堂评阅汇总此前已经能生成真实离线 HTML，但下载后页面没有留下统一回执；现在每次导出都会在作品仓库区记录文件摘要、作品/评阅数量和回执摘要，并支持导出审计 HTML。

完成内容：

- `app-state.js` 新增 `mr-calligraphy-artwork-export-audit-v1` 审计包。
- 学习状态新增 `artworkExportReceipts`，保存最近 30 条作品导出回执。
- `MRAppState.recordArtworkExportReceipt()` 记录作品集 HTML、课堂评阅表和评阅汇总三类导出。
- `MRAppState.getArtworkExportAudit()` 返回类型统计、回执列表和 64 位 `auditDigest`。
- `MRAppState.getArtworkExportAuditExport()` 生成可离线打开的 HTML 审计页。
- `MRAppState.downloadArtworkExportAudit()` 下载 `mr-calligraphy-artwork-export-audit-*.html`。
- 三个作品 HTML 下载入口成功发起下载后写入作品导出回执。
- 前台作品仓库新增 `artworkExportAudit`、`artworkExportAuditStatus`、`artworkExportAuditList` 和 `artworkExportAuditExport`。
- Smoke 页面标记检查新增作品导出回执审计节点。
- 控件清单更新后，前台为 `real-local 75`、`real-export 39`、`handled 114`、`missingHandler 0`。
- 状态层脚本覆盖作品数量、评阅数量、文件摘要、包摘要、汇总摘要、边界说明和 HTML 审计导出。
- Playwright 作品仓库用例会点击“导出作品集”“导出评阅表”“评阅汇总”和“导出回执”，验证真实下载、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：当前浏览器 `mr-calligraphy-learning-state-v1.artworkExportReceipts`。
- 写入状态：用户发起作品相关 HTML 下载后写入本机回执，并保存生成内容 SHA-256 摘要。
- 成功反馈：作品仓库区域显示导出类型、文件名、作品/评阅数量、文件摘要、包摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载作品导出 HTML 审计页；无回执时按钮禁用。
- 刷新后复现方式：作品导出回执随学习状态保存在 localStorage，刷新后仍能读取并导出。

仍待补：

- 当前只证明当前页面生成并发起了作品 HTML 下载请求，并记录生成内容摘要；它不代表操作系统保存成功、云端作品墙、账号下载审计、跨设备同步、长期班级作品库或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "artwork repository exports imports and resolves conflicts"`
- `git diff --check`

提交：

- 中文 commit message：`新增作品导出回执审计`

## 137. 2026-06-13 补齐作品仓库导出回执

本次继续收紧作品仓库导出闭环。“导出仓库”此前会生成真实 JSON 同步包并带稳定包摘要，但它没有进入作品导出回执列表；现在 JSON 包和三个 HTML 导出统一纳入 `artworkExportReceipts`。

完成内容：

- 作品导出回执新增 `artwork-repository-json` 类型。
- “作品仓库 JSON”显示在前台作品导出回执列表和 HTML 审计页中。
- JSON 回执记录文件名、MIME、作品数量、包 ID、包摘要、文件摘要和回执摘要。
- `downloadArtworkRepository()` 发起 JSON 下载后写入回执。
- 状态层脚本验证作品仓库 JSON 回执和包摘要。
- Playwright 作品仓库用例验证 JSON 导出回执、四类回执总数和审计 HTML。

真实化说明：

- 数据来源：当前浏览器作品、关联练习和 `getArtworkRepositoryPackage()` 生成的 `mr-calligraphy-artwork-repository-v1` 包。
- 写入状态：JSON 包下载后写入 `mr-calligraphy-learning-state-v1.artworkExportReceipts`。
- 成功反馈：作品仓库面板显示“作品仓库 JSON”回执，并可导出审计 HTML。
- 失败反馈：没有可导出作品时不会伪造 JSON 回执。
- 刷新后复现方式：回执随学习状态保存。

仍待补：

- 这仍是本机下载请求回执，不是云端作品仓库、账号归档、课堂作品墙或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`补齐作品仓库导出回执`

## 138. 2026-06-13 新增计划仓库导出回执审计

本次把“导出同步包”从单纯下载 JSON 文件推进为可追踪的本机审计闭环。用户下载 `mr-calligraphy-plan-repository-*.json` 后，计划面板会立即显示同步包导出回执，并可单独导出 HTML 审计页。

完成内容：

- 新增 `mr-calligraphy-plan-repository-export-audit-v1` 审计包。
- 学习状态新增 `planRepositoryExportReceipts`，保存最近 24 条计划仓库导出回执。
- `MRAppState.recordPlanRepositoryExportReceipt()` 记录文件名、MIME、字节数、计划数量、Workspace、包摘要、文件摘要和回执摘要。
- `MRAppState.getPlanRepositoryExportAudit()` 返回最近回执列表、Workspace 统计和 `auditDigest`。
- `MRAppState.getPlanRepositoryExportAuditExport()` / `downloadPlanRepositoryExportAudit()` 生成并下载 `mr-calligraphy-plan-repository-export-audit-*.html`。
- `downloadPlanRepository()` 发起 JSON 同步包下载后自动写入导出回执。
- 前台计划面板新增 `planRepositoryExportAudit`、`planRepositoryExportAuditStatus`、`planRepositoryExportAuditList` 和 `planRepositoryExportAuditExport`。
- Smoke 页面标记检查新增计划仓库导出回执审计节点。
- 控件清单更新为前台 `real-export 40`、`handled 115`、`missingHandler 0`。
- `learning-state-check.js` 验证 JSON 同步包导出回执、包摘要、文件摘要、边界说明和 HTML 审计导出。
- Playwright 计划仓库用例验证真实点击“导出同步包”、下载 JSON、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：`MRAppState.getPlanRepositoryPackage()` 生成的真实计划仓库 JSON 包。
- 写入状态：下载 JSON 同步包后写入 `mr-calligraphy-learning-state-v1.planRepositoryExportReceipts`。
- 成功反馈：计划面板显示同步包文件名、计划数量、包摘要、文件摘要、字节数和回执摘要。
- 导出反馈：点击“导出回执”会下载计划仓库导出 HTML 审计页；无回执时按钮禁用。
- 刷新后复现方式：回执随学习状态持久化，可再次导出审计 HTML。

仍待补：

- 该回执只能证明当前浏览器生成并发起了计划仓库 JSON 下载请求，并记录生成内容摘要；它不是云端仓库日志、系统文件保存证明、账号审计或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front plan repository detects remote conflicts and saves a remote copy"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划仓库导出回执审计`

## 139. 2026-06-13 新增学习档案仓库导出回执审计

本次补齐“学习档案导出同步包”的本机审计闭环。此前 `mr-calligraphy-history-repository-*.json` 可以迁移练习、作品、报告和阶段记录，但导出后没有独立回执；现在下载后会保存到 `historyRepositoryExportReceipts`，并能导出 HTML 审计页。

完成内容：

- 新增 `mr-calligraphy-history-repository-export-audit-v1` 审计包。
- 学习状态新增 `historyRepositoryExportReceipts`，保存最近 24 条学习档案仓库导出回执。
- `MRAppState.recordHistoryRepositoryExportReceipt()` 记录文件名、MIME、字节数、练习/作品/报告/阶段数量、Workspace、包摘要、文件摘要和回执摘要。
- `MRAppState.getHistoryRepositoryExportAudit()` 返回最近回执列表、Workspace 统计、累计记录数量和 `auditDigest`。
- `MRAppState.getHistoryRepositoryExportAuditExport()` / `downloadHistoryRepositoryExportAudit()` 生成并下载 `mr-calligraphy-history-repository-export-audit-*.html`。
- `downloadHistoryRepository()` 发起 JSON 同步包下载后自动写入导出回执。
- 前台学习档案面板新增 `historyRepositoryExportAudit`、`historyRepositoryExportAuditStatus`、`historyRepositoryExportAuditList` 和 `historyRepositoryExportAuditExport`。
- Smoke 页面标记检查新增学习档案仓库导出回执审计节点。
- 控件清单更新为前台 `real-export 41`、`handled 116`、`missingHandler 0`。
- `learning-state-check.js` 验证 JSON 同步包导出回执、四类记录数量、包摘要、文件摘要、边界说明和 HTML 审计导出。
- Playwright 学习档案仓库用例验证真实点击“导出同步包”、下载 JSON、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：`MRAppState.getHistoryRepositoryPackage()` 生成的真实学习档案仓库 JSON 包。
- 写入状态：下载 JSON 同步包后写入 `mr-calligraphy-learning-state-v1.historyRepositoryExportReceipts`。
- 成功反馈：学习档案面板显示同步包文件名、总记录数、练习/作品/报告/阶段数量、包摘要、文件摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载学习档案仓库导出 HTML 审计页；无回执时按钮禁用。
- 刷新后复现方式：回执随学习状态持久化，可再次导出审计 HTML。

仍待补：

- 该回执只能证明当前浏览器生成并发起了学习档案仓库 JSON 下载请求，并记录生成内容摘要；它不是云端档案仓库日志、系统文件保存证明、账号审计或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front history repository handles network, paged pull, and id conflicts"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案仓库导出回执审计`

## 140. 2026-06-13 新增报告仓库导出回执审计

本次补齐“报告仓库导出同步包”的本机审计闭环。此前 `mr-calligraphy-report-repository-*.json` 可以迁移报告和本机验真摘要，但导出后没有独立回执；现在下载后会保存到 `reportRepositoryExportReceipts`，并能导出 HTML 审计页。

完成内容：

- 新增 `mr-calligraphy-report-repository-export-audit-v1` 审计包。
- 学习状态新增 `reportRepositoryExportReceipts`，保存最近 24 条报告仓库导出回执。
- `MRAppState.recordReportRepositoryExportReceipt()` 记录文件名、MIME、字节数、报告数量、教师批注报告数量、验真数量、Workspace、包摘要、文件摘要和回执摘要。
- `MRAppState.getReportRepositoryExportAudit()` 返回最近回执列表、Workspace 统计、累计报告数量和 `auditDigest`。
- `MRAppState.getReportRepositoryExportAuditExport()` / `downloadReportRepositoryExportAudit()` 生成并下载 `mr-calligraphy-report-repository-export-audit-*.html`。
- `downloadReportRepository()` 发起 JSON 同步包下载后自动写入导出回执。
- 前台站内报告面板新增 `reportRepositoryExportAudit`、`reportRepositoryExportAuditStatus`、`reportRepositoryExportAuditList` 和 `reportRepositoryExportAuditExport`。
- Smoke 页面标记检查新增报告仓库导出回执审计节点。
- 控件清单更新为前台 `real-export 42`、`handled 117`、`missingHandler 0`。
- `learning-state-check.js` 验证 JSON 同步包导出回执、报告数量、教师批注报告数量、验真数量、包摘要、文件摘要、边界说明和 HTML 审计导出。
- Playwright 前台练习用例验证真实点击“导出同步包”、下载 JSON、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：`MRAppState.getReportRepositoryPackage()` 生成的真实报告仓库 JSON 包。
- 写入状态：下载 JSON 同步包后写入 `mr-calligraphy-learning-state-v1.reportRepositoryExportReceipts`。
- 成功反馈：站内报告面板显示同步包文件名、报告数量、教师批注报告数量、验真数量、包摘要、文件摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载报告仓库导出 HTML 审计页；无回执时按钮禁用。
- 刷新后复现方式：回执随学习状态持久化，可再次导出审计 HTML。

仍待补：

- 该回执只能证明当前浏览器生成并发起了报告仓库 JSON 下载请求，并记录生成内容摘要；它不是云端报告仓库日志、系统文件保存证明、账号审计、生产证书签章或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库导出回执审计`

## 141. 2026-06-13 新增项目档案导出回执审计

本次补齐主后台“导出项目档案”的本机审计闭环。此前项目档案 JSON 可下载，但用户无法在后台确认最近导出的文件名、摘要和档案范围；现在下载后会保存到 `mr-calligraphy-project-archive-export-audit-v1`，并可导出 HTML 审计页。

完成内容：

- 新增 `mr-calligraphy-project-archive-export-audit-v1` 审计包，保存最近 24 条项目档案导出回执。
- `MRProjectArchive.exportProject()` 发起 JSON 下载后写入导出回执。
- 回执记录文件名、MIME、字节数、文件摘要、档案摘要、回执摘要、项目 schema、项目仓库状态、场景数量、导入模型数量和贴图数量。
- 新增 `getProjectArchiveExportAudit()`、`getProjectArchiveExportAuditExport()` 和 `downloadProjectArchiveExportAudit()`。
- 主后台项目备份面板新增“导出回执”列表和“导出回执”按钮。
- Smoke 页面标记检查新增项目档案导出回执审计节点。
- 控件清单更新为主后台 `real-export 8`、`handled 54`、`missingHandler 0`。
- Playwright 主后台用例验证真实点击“导出项目档案”、下载 JSON、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：`MRProjectArchive.createCurrentProjectArchiveSnapshot()` 生成的真实项目档案 JSON，包含当前浏览器 localStorage、IndexedDB 导入模型快照和项目 schema。
- 写入状态：下载 JSON 项目档案后写入 `mr-calligraphy-project-archive-export-audit-v1`。
- 成功反馈：主后台显示导出文件名、配置数量、导入资产数量、资产哈希数量、文件摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载 `mr-calligraphy-project-archive-export-audit-*.html`；无回执时按钮禁用。
- 刷新后复现方式：回执随 localStorage 持久化，可再次导出审计 HTML。

仍待补：

- 该回执只能证明当前浏览器生成并发起了项目档案 JSON 下载请求，并记录生成内容摘要；它不是云端项目仓库日志、系统文件保存证明、账号审计或不可篡改证据链。

验收：

- `node --check project-archive.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin manages objects"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目档案导出回执审计`

## 142. 2026-06-13 新增项目仓库包本机导出回执审计

本次补齐主后台项目仓库包的本机导出闭环。此前 `createProjectRepositoryPackage()` 只在远端推送时使用，没有独立下载入口；现在用户不配置 endpoint 也能导出同结构项目仓库包，并在后台看到导出回执。

完成内容：

- 新增 `mr-calligraphy-project-repository-export-audit-v1` 审计包，保存最近 24 条项目仓库包导出回执。
- 新增 `MRProjectArchive.downloadProjectRepositoryPackage()`，下载与远端 PUT 同结构的 `mr-calligraphy-project-repository-package-v1` JSON。
- 回执记录文件名、MIME、字节数、文件摘要、包摘要、仓库摘要、回执摘要、Workspace、场景数量、导入模型数量、贴图数量和缺失资产数量。
- 新增 `getProjectRepositoryExportAudit()`、`getProjectRepositoryExportAuditExport()` 和 `downloadProjectRepositoryExportAudit()`。
- 主后台项目仓库状态区新增“导出仓库包”和“仓库包导出回执”审计面板。
- Smoke 页面标记检查新增项目仓库包导出入口和回执审计节点。
- 控件清单更新为主后台 `real-export 10`、`handled 56`、`missingHandler 0`。
- Playwright 主后台用例验证真实点击“导出仓库包”、下载 JSON、项目仓库包结构校验、localStorage 回执持久化和 HTML 审计页。

真实化说明：

- 数据来源：`MRProjectArchive.createProjectRepositoryPackage()` 生成的真实项目仓库包。
- 写入状态：下载 JSON 项目仓库包后写入 `mr-calligraphy-project-repository-export-audit-v1`。
- 成功反馈：主后台显示 packageId、Workspace、场景/模型/贴图统计、包摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载 `mr-calligraphy-project-repository-export-audit-*.html`；无回执时按钮禁用。
- 刷新后复现方式：回执随 localStorage 持久化，可再次导出审计 HTML。

仍待补：

- 该回执只能证明当前浏览器生成并发起了项目仓库包 JSON 下载请求，并记录生成内容摘要；它不是云端同步完成证明、账号化项目空间、多人合并审计或服务端不可篡改证据链。

验收：

- `node --check project-archive.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库包导出回执审计`

## 143. 2026-06-13 新增项目档案差异报告导出回执审计

本次补齐项目档案恢复前审阅报告的本机回执。此前“导出差异报告”会生成真实 HTML，但没有保存导出证据；现在导出后会记录来源、风险、选择范围、文件摘要、预览摘要和回执摘要。

完成内容：

- 新增 `mr-calligraphy-project-impact-export-audit-v1` 审计包，保存最近 24 条项目档案差异报告导出回执。
- `downloadImportImpactReport()` 发起 HTML 下载后写入导出回执。
- 回执记录文件名、MIME、字节数、文件摘要、预览摘要、选择摘要、回执摘要、来源类型、远端 packageId、Workspace、风险摘要、配置差异、模型/贴图数量和恢复选择数量。
- 新增 `getProjectImpactExportAudit()`、`getProjectImpactExportAuditExport()` 和 `downloadProjectImpactExportAudit()`。
- 主后台项目备份区新增“差异报告回执”审计面板。
- Smoke 页面标记检查新增项目档案差异报告导出回执审计节点。
- 控件清单更新为主后台 `real-export 11`、`handled 57`、`missingHandler 0`。
- Playwright 主后台用例验证真实点击“导出差异报告”、下载 HTML、回执面板、localStorage 持久化和 HTML 审计页。

真实化说明：

- 数据来源：项目档案导入预览、当前恢复选择、风险摘要和远端项目仓库来源摘要。
- 写入状态：下载项目档案导入差异 HTML 后写入 `mr-calligraphy-project-impact-export-audit-v1`。
- 成功反馈：主后台显示远端包或文件名、来源类型、风险等级、恢复选择数量、文件摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载 `mr-calligraphy-project-impact-export-audit-*.html`；无回执时按钮禁用。
- 刷新后复现方式：回执随 localStorage 持久化，可再次导出审计 HTML。

仍待补：

- 该回执只能证明当前浏览器生成并发起了恢复前差异报告 HTML 下载请求；它不是恢复动作证明、多人三方合并审计、账号审批或服务端不可篡改日志。

验收：

- `node --check project-archive.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目档案差异报告回执审计`

## 144. 2026-06-13 新增项目档案恢复审计导出回执审计

本次补齐主后台“恢复审计”导出的本机回执。项目档案恢复成功后已经会生成恢复审计记录；现在用户点击“导出审计”下载 HTML 时，也会保存导出回执，记录文件摘要、审计摘要、最近恢复记录摘要和恢复范围。

完成内容：

- 新增 `mr-calligraphy-project-restore-audit-export-v1` 审计包，保存最近 24 条项目档案恢复审计导出回执。
- `downloadRestoreAuditLog()` 发起 HTML 下载后写入导出回执。
- 回执记录文件名、MIME、字节数、文件摘要、审计报告摘要、回执摘要、恢复记录数、最近恢复记录摘要、档案摘要、选择摘要和恢复范围统计。
- 新增 `getProjectRestoreAuditExportAudit()`、`getProjectRestoreAuditExportAuditExport()` 和 `downloadProjectRestoreAuditExportAudit()`。
- 主后台项目备份区新增“恢复审计导出回执”审计面板。
- Smoke 页面标记检查新增恢复审计导出回执审计节点。
- Playwright 主后台用例验证真实点击“导出审计”、下载 HTML、回执面板、localStorage 回执持久化和 HTML 回执审计页。

真实化说明：

- 数据来源：本机恢复动作写入的 `mr-calligraphy-project-archive-audit-v1` 和实际生成的恢复审计 HTML。
- 写入状态：下载恢复审计 HTML 后写入 `mr-calligraphy-project-restore-audit-export-v1`。
- 成功反馈：主后台显示恢复审计报告文件名、恢复记录数、文件摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载 `mr-calligraphy-project-restore-audit-export-audit-*.html`；无回执时按钮禁用。
- 刷新后复现方式：回执随 localStorage 持久化，可再次导出审计 HTML。

仍待补：

- 该回执只能证明当前浏览器生成并发起了恢复审计 HTML 下载请求；它不是系统文件保存完成证明、账号审批、服务端归档或不可篡改审计。

验收：

- `node --check project-archive.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增恢复审计导出回执审计`

## 145. 2026-06-13 新增项目档案恢复审计本机校验

本次补齐项目档案恢复审计的本机一致性校验。恢复记录原本已经有 `recordDigest`，但后台没有主动重算并告诉用户这条记录是否被改动；现在读取恢复审计时会重算摘要，显示通过、失败或旧记录未校验。

完成内容：

- `getRestoreAuditLog()` 会为每条恢复审计记录附加本机校验结果。
- 校验结果包含 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 恢复审计摘要新增 `verifiedCount`、`failedCount` 和 `legacyCount`。
- 主后台“恢复审计”状态文案显示本机校验通过数量、失败数量和旧记录数量。
- 恢复审计列表和恢复审计 HTML 均显示本机校验状态与重算摘要。
- Playwright 主后台用例验证正常恢复记录为 `verified`，临时篡改记录后会变成 `digest-mismatch`。

真实化说明：

- 数据来源：本机恢复动作写入的 `mr-calligraphy-project-archive-audit-v1`。
- 执行动作：读取时去掉 `recordDigest`，还原摘要生成时的基础 ID，并按稳定 JSON + SHA-256 重算。
- 成功反馈：后台状态显示“本机校验通过 N 条”，导出 HTML 包含“本机校验通过”和“重算摘要”。
- 失败反馈：手动篡改记录字段后，校验状态为 `digest-mismatch`，并保留失败说明。

仍待补：

- 这是本机摘要一致性校验，不是服务端签名、账号审批、远端不可篡改日志、生产证书链或多人审计链。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增恢复审计本机校验`

## 146. 2026-06-13 新增项目仓库包文件导入预览

本次补齐项目仓库包的本机导入闭环。主后台已经能导出 `mr-calligraphy-project-repository-package-v1`，也能从远端拉取同结构包；现在“导入项目档案”文件入口也能识别这个包，校验摘要后进入恢复预览。

完成内容：

- 新增 `readProjectImportFile()`，统一解析项目档案 JSON 和项目仓库包 JSON。
- 本机项目仓库包文件会校验 kind、version、archive 和 `packageDigest`。
- `prepareImportProject()` 会把项目仓库包内的 `archive` 转成恢复预览，并保留 packageId、Workspace、packageDigest、repositoryDigest、文件名和文件摘要。
- 主后台导入预览标题新增“本机项目仓库包预览”。
- 预览来源区显示 packageId、Workspace、包摘要、仓库摘要和“本机仓库包导入只生成恢复预览”的边界。
- 差异报告导出回执新增 `project-repository-file` 来源类型。
- Playwright 主后台用例验证导出的项目仓库包可以重新导入预览，篡改包会被摘要校验拒绝。

真实化说明：

- 数据来源：用户选择的本机项目仓库包 JSON。
- 执行动作：重算 `packageDigest`，通过后使用包内 `archive` 进入原有项目档案恢复预览。
- 成功反馈：主后台显示本机项目仓库包预览、包摘要和恢复影响。
- 失败反馈：摘要不匹配会提示“本机项目仓库包文件摘要不匹配，已拒绝进入恢复预览”。

仍待补：

- 这是本机 JSON 包回流，不是账号化项目仓库、多人合并、服务端资产补齐或不可篡改审计。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增仓库包文件导入预览`

## 147. 2026-06-13 新增项目档案导入预览 JSON 导出

本次补齐恢复前审阅的机器可读导出。此前导入预览可在页面查看，也能导出 HTML 差异报告；现在可以直接下载 JSON，保留来源、风险、字段/模型差异和当前恢复勾选方案。

完成内容：

- 主后台恢复预览操作区新增“导出预览 JSON”按钮。
- 新增 `getImportPreviewJsonExport()` 和 `downloadImportPreviewJson()`。
- 导出文件为 `mr-calligraphy-import-preview-*.json`。
- JSON kind 为 `mr-calligraphy-project-import-preview-v1`，包含来源类型、远端/本机仓库包来源、schema 摘要、风险摘要、恢复选择、previewDigest、selectionDigest 和 exportDigest。
- 无导入预览时按钮禁用，有预览后可下载。
- Playwright 主后台用例验证本机项目仓库包预览后下载 JSON，并校验来源、packageId、Workspace、包摘要、恢复选择和摘要字段。

真实化说明：

- 数据来源：当前导入预览对象和页面恢复勾选状态。
- 执行动作：下载 JSON 证据包，不恢复、不覆盖、不写入项目状态。
- 成功反馈：主后台显示已下载项目档案导入预览 JSON。
- 失败反馈：没有预览时 API 返回明确错误，按钮保持禁用。

仍待补：

- 这是本机恢复前审阅 JSON，不是服务端审批单、多人合并请求、账号签名、生产证书链或不可篡改审计。

验收：

- `node --check project-archive.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增导入预览JSON导出`

## 148. 2026-06-13 新增项目档案导入预览 JSON 导出回执审计

本次补齐“导出预览 JSON”的本机回执。此前恢复前预览 JSON 已经能下载机器可读证据包，但下载动作本身没有留下文件摘要和导出记录；现在导出后会写入回执，并可再导出 HTML 审计页。

完成内容：

- 新增 `mr-calligraphy-project-import-preview-export-audit-v1` 本机审计包。
- `downloadImportPreviewJson()` 下载 JSON 后自动写入导出回执。
- 回执记录文件名、MIME、字节数、文件摘要、previewDigest、selectionDigest、exportDigest、回执摘要、来源类型、远端/本机包 ID、Workspace、风险摘要和恢复选择数量。
- 主后台项目备份区新增“预览 JSON 回执”列表和“导出回执”按钮。
- Smoke 页面标记检查新增导入预览 JSON 导出回执审计节点。
- 控件清单更新为主后台 `real-export 14`、`handled 60`、`missingHandler 0`。
- Playwright 主后台用例验证本机项目仓库包预览后真实点击“导出预览 JSON”、写入回执、持久化 localStorage，并下载 HTML 回执审计页。

真实化说明：

- 数据来源：当前导入预览对象、页面勾选的恢复选择和实际生成的 JSON 证据包。
- 写入状态：下载 `mr-calligraphy-import-preview-*.json` 后写入 `mr-calligraphy-project-import-preview-export-audit-v1`。
- 成功反馈：主后台显示来源、风险、选择数量、JSON 摘要和回执摘要。
- 导出反馈：点击“导出回执”会下载 `mr-calligraphy-project-import-preview-export-audit-*.html`；无回执时按钮禁用。

仍待补：

- 这是当前浏览器本机 JSON 下载请求回执，只能证明页面生成并发起了恢复前预览 JSON 下载；它不是服务端审批、多人合并请求、账号签名、生产证书链或不可篡改审计。

验收：

- `node --check project-archive.js`
- `node --check scripts/smoke-test.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增导入预览JSON回执审计`

## 149. 2026-06-13 新增项目档案导入预览 JSON 回执本机校验

本次补齐“预览 JSON 回执”的本机一致性校验。导入预览 JSON 导出回执已经会记录 `receiptDigest`，现在后台读取回执时会按声明字段重算摘要，正常回执显示“本机校验通过”，手动篡改 localStorage 中的回执字段会显示“摘要不匹配”。

完成内容：

- 新增 `verifyProjectImportPreviewExportReceiptDigest()`、`addProjectImportPreviewExportVerification()` 和 `createProjectImportPreviewExportReceiptVerificationPayload()`。
- `getProjectImportPreviewExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 主后台“预览 JSON 回执”列表显示本机校验状态。
- 导出的 HTML 回执审计页新增“本机校验”和“重算摘要”。
- Playwright 主后台用例验证正常回执为 `verified`，并临时篡改 `selectedCount` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：`mr-calligraphy-project-import-preview-export-audit-v1` 中的本机导出回执。
- 校验方式：去掉 `receiptDigest` 派生字段，恢复生成摘要时的基础 ID，并按稳定 JSON + SHA-256 重算。
- 成功反馈：后台列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明导入预览 JSON 导出回执与自身 `receiptDigest` 声明字段一致；它不是服务端签名、账号审批、生产证书链或不可篡改审计。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增导入预览JSON回执校验`

## 150. 2026-06-13 新增项目档案导出回执本机校验

本次补齐“项目档案导出回执”的本机一致性校验。项目档案 JSON 导出回执已经记录 `receiptDigest`、文件摘要和档案摘要；现在后台读取时会按回执声明字段重算摘要，正常回执显示“本机校验通过”，被手动篡改的回执显示“摘要不匹配”。

完成内容：

- 新增 `verifyProjectArchiveExportReceiptDigest()`、`addProjectArchiveExportVerification()` 和 `createProjectArchiveExportReceiptVerificationPayload()`。
- `getProjectArchiveExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 主后台“导出回执”列表显示本机校验状态。
- 项目档案导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 主后台用例验证正常回执为 `verified`，并临时篡改 `storageCount` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：`mr-calligraphy-project-archive-export-audit-v1` 中的本机项目档案导出回执。
- 校验方式：去掉 `receiptDigest` 派生字段，恢复生成摘要时的基础 ID，并按稳定 JSON + SHA-256 重算。
- 成功反馈：后台列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明项目档案导出回执与自身 `receiptDigest` 声明字段一致；它不是系统文件保存证明、云端备份完成证明、账号审批、生产证书链或不可篡改审计。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目档案导出回执校验`

## 151. 2026-06-13 新增项目仓库包导出回执本机校验

本次补齐“项目仓库包导出回执”的本机一致性校验。项目仓库包 JSON 导出回执已经记录 `receiptDigest`、包摘要、仓库摘要和 Workspace；现在后台读取时会按回执声明字段重算摘要，正常回执显示“本机校验通过”，被手动篡改的回执显示“摘要不匹配”。

完成内容：

- 新增 `verifyProjectRepositoryExportReceiptDigest()`、`addProjectRepositoryExportVerification()` 和 `createProjectRepositoryExportReceiptVerificationPayload()`。
- `getProjectRepositoryExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 主后台“仓库包导出回执”列表显示本机校验状态。
- 项目仓库包导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 主后台用例验证正常回执为 `verified`，并临时篡改 `sceneCount` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：`mr-calligraphy-project-repository-export-audit-v1` 中的本机项目仓库包导出回执。
- 校验方式：去掉 `receiptDigest` 派生字段，恢复生成摘要时的基础 ID，并按稳定 JSON + SHA-256 重算。
- 成功反馈：后台列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明项目仓库包导出回执与自身 `receiptDigest` 声明字段一致；它不是云端同步完成证明、账号化项目空间、多人合并审计、生产证书链或服务端不可篡改证据链。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增仓库包导出回执校验`

## 152. 2026-06-13 新增项目档案差异报告回执本机校验

本次补齐“项目档案差异报告导出回执”的本机一致性校验。差异报告 HTML 导出回执已经记录 `receiptDigest`、文件摘要、预览摘要和恢复选择摘要；现在后台读取时会按回执声明字段重算摘要，正常回执显示“本机校验通过”，被手动篡改的回执显示“摘要不匹配”。

完成内容：

- 新增 `verifyProjectImpactExportReceiptDigest()`、`addProjectImpactExportVerification()` 和 `createProjectImpactExportReceiptVerificationPayload()`。
- `getProjectImpactExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 主后台“差异报告导出回执”列表显示本机校验状态。
- 项目档案差异报告导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 主后台用例验证正常差异报告导出回执为 `verified`，并临时篡改 `selectedCount` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：`mr-calligraphy-project-impact-export-audit-v1` 中的本机项目档案差异报告导出回执。
- 校验方式：去掉 `receiptDigest` 派生字段，恢复生成摘要时的基础 ID，并按稳定 JSON + SHA-256 重算。
- 成功反馈：后台列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明项目档案差异报告导出回执与自身 `receiptDigest` 声明字段一致；它不是恢复动作证明、服务端签名、账号审批、生产证书链、多人合并审计或服务端不可篡改证据链。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增差异报告回执校验`

## 153. 2026-06-13 新增项目档案恢复审计导出回执本机校验

本次补齐“项目档案恢复审计导出回执”的本机一致性校验。恢复审计 HTML 导出回执已经记录 `receiptDigest`、文件摘要、审计报告摘要和恢复记录范围；现在后台读取时会按回执声明字段重算摘要，正常回执显示“本机校验通过”，被手动篡改的回执显示“摘要不匹配”。

完成内容：

- 新增 `verifyProjectRestoreAuditExportReceiptDigest()`、`addProjectRestoreAuditExportVerification()` 和 `createProjectRestoreAuditExportReceiptVerificationPayload()`。
- `getProjectRestoreAuditExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 主后台“恢复审计导出回执”列表显示本机校验状态。
- 项目档案恢复审计导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 主后台用例验证正常恢复审计导出回执为 `verified`，并临时篡改 `restoreRecordCount` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：`mr-calligraphy-project-restore-audit-export-v1` 中的本机项目档案恢复审计导出回执。
- 校验方式：去掉 `receiptDigest` 派生字段，恢复生成摘要时的基础 ID，并按稳定 JSON + SHA-256 重算。
- 成功反馈：后台列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明恢复审计导出回执与自身 `receiptDigest` 声明字段一致；它不是系统文件保存证明、恢复动作审批、服务端签名、生产证书链、多人合并审计或服务端不可篡改证据链。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增恢复审计导出回执校验`

## 154. 2026-06-13 新增报告导出回执本机校验

本次补齐“报告导出回执”的本机一致性校验。报告 HTML/PDF 导出回执已经记录 `receiptDigest`、报告验真摘要和文件摘要；现在前台读取审计时会按回执声明字段重算摘要，正常回执显示“本机校验通过”，被手动篡改的回执显示“摘要不匹配”。

完成内容：

- 新增 `verifyReportExportReceiptDigest()`、`addReportExportReceiptVerification()` 和 `createReportExportReceiptDigestPayload()`。
- `getReportExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 前台报告详情“报告导出回执”列表显示本机校验状态。
- 报告导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 前台报告流程验证正常 HTML/PDF 导出回执为 `verified`，并临时篡改 `byteLength` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：当前浏览器学习状态里的 `reportExportReceipts`。
- 校验方式：按 `kind`、`exportType`、`reportId`、`reportDigest`、`filename`、`mimeType`、`byteLength`、`fileDigest` 和 `exportedAt` 稳定 JSON + SHA-256 重算。
- 成功反馈：报告导出回执列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明报告导出回执与自身 `receiptDigest` 声明字段一致；它不是操作系统保存完成证明、云端 PDF 渲染日志、账号下载审计、生产证书链或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告导出回执校验`

## 155. 2026-06-13 新增报告对比导出回执本机校验

本次补齐“报告对比导出回执”的本机一致性校验。报告对比 HTML 导出回执已经记录 `receiptDigest`、前后报告 ID、平均分差、文件摘要和导出时间；现在前台读取审计时会按回执声明字段重算摘要，正常回执显示“本机校验通过”，被手动篡改的回执显示“摘要不匹配”。

完成内容：

- 新增 `verifyReportComparisonExportReceiptDigest()`、`addReportComparisonExportReceiptVerification()` 和 `createReportComparisonExportReceiptDigestPayload()`。
- `getReportComparisonExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 前台“报告对比导出回执”列表显示本机校验状态。
- 报告对比导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 前台报告流程验证正常对比导出回执为 `verified`，并临时篡改 `averageDelta` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：当前浏览器学习状态里的 `reportComparisonExportReceipts`。
- 校验方式：按 `kind`、`currentReportId`、`previousReportId`、`averageDelta`、`filename`、`mimeType`、`byteLength`、`fileDigest` 和 `exportedAt` 稳定 JSON + SHA-256 重算。
- 成功反馈：报告对比导出回执列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明报告对比导出回执与自身 `receiptDigest` 声明字段一致；它不是云端长期报告、跨设备下载日志、账号审计、生产证书链或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告对比回执校验`

## 156. 2026-06-13 新增报告打印回执本机校验

本次把前台“报告打印回执审计”从只记录浏览器打印请求，推进为可本机重算 `receiptDigest` 的真实校验。用户如果手动改动 localStorage 里的打印回执声明字段，前台状态层和导出的审计 HTML 都会显示摘要不匹配。

完成内容：

- 新增 `verifyReportPrintReceiptDigest()`、`addReportPrintReceiptVerification()` 和 `createReportPrintReceiptDigestPayload()`。
- `getReportPrintAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 前台“报告打印回执”列表显示“本机校验通过 / 摘要不匹配 / 旧记录未校验”。
- 报告打印回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 前台报告流程验证正常打印回执为 `verified`，并临时篡改 `printStatus` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：当前浏览器学习状态里的 `reportPrintReceipts`。
- 校验方式：按 `kind`、`reportId`、`reportDigest`、`requestedAt`、`printStatus`、`printTarget` 和 `source` 稳定 JSON + SHA-256 重算。
- 成功反馈：报告打印回执列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明报告打印回执与自身 `receiptDigest` 声明字段一致；它不是操作系统打印完成证明、云端 PDF 渲染日志、账号打印审计、服务端签名、生产证书链或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告打印回执校验`

## 157. 2026-06-13 新增计划提醒回执本机校验

本次把前台“计划提醒回执审计”从只展示浏览器提醒请求，推进为可本机重算 `receiptDigest` 的真实校验。用户如果手动改动 localStorage 里的计划提醒回执声明字段，前台状态层和导出的审计 HTML 都会显示摘要不匹配。

完成内容：

- 新增 `verifyPlanReminderReceiptDigest()`、`addPlanReminderReceiptVerification()` 和 `createPlanReminderReceiptDigestPayload()`。
- `getPlanReminderAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 前台“计划提醒回执”列表显示“本机校验通过 / 摘要不匹配 / 旧记录未校验”。
- 计划提醒回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 前台报告流程中的计划提醒段验证正常提醒回执为 `verified`，并临时篡改 `deliveryStatus` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：当前浏览器学习状态里的 `planReminderService.receipts`。
- 校验方式：按 `kind`、`planId`、`itemId`、`reminderStatus`、`dueAt`、`remindAt`、`dispatchedAt`、`channel`、`deliveryStatus` 和 `fingerprint` 稳定 JSON + SHA-256 重算。
- 成功反馈：计划提醒回执列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明计划提醒回执与自身 `receiptDigest` 声明字段一致；它不是云端推送日志、系统通知中心记录、跨设备提醒、服务端签名、生产证书链或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划提醒回执校验`

## 158. 2026-06-13 新增计划导出回执本机校验

本次把前台“计划导出回执审计”从只展示 HTML/ICS 导出摘要，推进为可本机重算 `receiptDigest` 的真实校验。用户如果手动改动 localStorage 里的计划导出回执声明字段，前台状态层和导出的审计 HTML 都会显示摘要不匹配。

完成内容：

- 新增 `verifyPlanExportReceiptDigest()`、`addPlanExportReceiptVerification()` 和 `createPlanExportReceiptDigestPayload()`。
- `getPlanExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 前台“计划导出回执”列表显示“本机校验通过 / 摘要不匹配 / 旧记录未校验”。
- 计划导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 前台计划导出段验证正常 HTML/ICS 回执为 `verified`，并临时篡改 `eventCount` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：当前浏览器学习状态里的 `planExportReceipts`。
- 校验方式：按 `kind`、`planId`、`exportType`、`filename`、`itemCount`、`completedCount`、`progressPercent`、`eventCount`、`exportedAt` 和 `fileDigest` 稳定 JSON + SHA-256 重算。
- 成功反馈：计划导出回执列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明计划导出回执与自身 `receiptDigest` 声明字段一致；它不是操作系统保存完成证明、云端下载日志、账号审计、服务端签名、生产证书链或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划导出回执校验`

## 159. 2026-06-13 新增计划仓库导出回执本机校验

本次把前台“计划仓库导出回执审计”从只展示 JSON 同步包摘要，推进为可本机重算 `receiptDigest` 的真实校验。用户如果手动改动 localStorage 里的计划仓库导出回执声明字段，前台状态层和导出的审计 HTML 都会显示摘要不匹配。

完成内容：

- 新增 `verifyPlanRepositoryExportReceiptDigest()`、`addPlanRepositoryExportReceiptVerification()` 和 `createPlanRepositoryExportReceiptDigestPayload()`。
- `getPlanRepositoryExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 前台“计划仓库导出回执”列表显示“本机校验通过 / 摘要不匹配 / 旧记录未校验”。
- 计划仓库导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 计划仓库流程验证正常 JSON 同步包导出回执为 `verified`，并临时篡改 `planCount` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：当前浏览器学习状态里的 `planRepositoryExportReceipts`。
- 校验方式：按 `kind`、`filename`、`byteLength`、`fileDigest`、`packageId`、`packageDigest`、`planCount`、`workspaceId` 和 `exportedAt` 稳定 JSON + SHA-256 重算。
- 成功反馈：计划仓库导出回执列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明计划仓库导出回执与自身 `receiptDigest` 声明字段一致；它不是云端仓库写入证明、跨设备下载日志、账号审计、服务端签名、生产证书链或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front plan repository detects remote conflicts and saves a remote copy"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划仓库导出回执校验`

## 160. 2026-06-13 新增复盘导出回执本机校验

本次把前台“复盘导出回执审计”从只展示作品图片、复盘证据、分享页和学习报告的导出记录，推进为可本机重算 `receiptDigest` 的真实校验。用户如果手动改动 localStorage 里的复盘导出回执声明字段，前台状态层和导出的审计 HTML 都会显示摘要不匹配。

完成内容：

- 新增 `verifyReviewExportReceiptDigest()`、`addReviewExportReceiptVerification()` 和 `createReviewExportReceiptDigestPayload()`。
- `getReviewExportAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 前台“复盘导出回执”列表显示“本机校验通过 / 摘要不匹配 / 旧记录未校验”。
- 复盘导出回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 前台练习流程验证正常四类复盘导出回执为 `verified`，并临时篡改 `byteLength` 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：当前浏览器学习状态里的 `reviewExportReceipts`。
- 校验方式：按 `kind`、`exportType`、`sourceType`、`sourceId`、`filename`、`mimeType`、`byteLength`、`fileDigest` 和 `exportedAt` 稳定 JSON + SHA-256 重算。
- 成功反馈：复盘导出回执列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明复盘导出回执与自身 `receiptDigest` 声明字段一致；它不是操作系统下载完成证明、云端下载日志、账号审计、服务端签名、生产证书链或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增复盘导出回执校验`

## 161. 2026-06-13 新增学习档案详情操作回执本机校验

本次把前台“学习档案详情操作回执审计”从只展示图片下载、报告下载和直达链接复制记录，推进为可本机重算 `receiptDigest` 的真实校验。用户如果手动改动 localStorage 里的详情操作回执声明字段，前台状态层和导出的审计 HTML 都会显示摘要不匹配。

完成内容：

- 新增 `verifyHistoryDetailActionReceiptDigest()`、`addHistoryDetailActionReceiptVerification()` 和 `createHistoryDetailActionReceiptDigestPayload()`。
- `getHistoryDetailActionAudit()` 返回 `verifiedCount`、`failedCount`、`legacyCount`，每条回执新增 `verificationStatus`、`verificationMessage` 和 `verificationExpectedDigest`。
- 前台“详情操作回执”列表显示“本机校验通过 / 摘要不匹配 / 旧记录未校验”。
- 学习档案详情操作回执 HTML 审计页新增“本机校验”和“重算摘要”。
- Playwright 前台练习流程验证正常图片下载/链接复制回执为 `verified`，并临时篡改链接 URL 确认 `digest-mismatch` 被识别。

真实化说明：

- 数据来源：当前浏览器学习状态里的 `historyDetailActionReceipts`。
- 校验方式：按 `kind`、`actionType`、`recordType`、`recordId`、`filename`、`url`、`artifactDigest`、`copyStatus` 和 `createdAt` 稳定 JSON + SHA-256 重算。
- 成功反馈：详情操作回执列表和 HTML 审计页显示“本机校验通过”。
- 失败反馈：回执字段被篡改后，读取 API 返回 `digest-mismatch` 和重算摘要。

仍待补：

- 这是本机摘要一致性校验，只能证明详情操作回执与自身 `receiptDigest` 声明字段一致；它不是操作系统下载完成证明、剪贴板系统审计、云端访问日志、账号审计、服务端签名、生产证书链或不可篡改证据链。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check scripts/learning-state-check.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js -g "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增详情操作回执校验`
