# 当前版本功能缺口与前端真实化开发文档

日期：2026-06-11  
适用范围：当前 `main` 分支，已恢复并继续开发的 5.16 版本线。  
当前本机入口：`http://localhost:41496/`、`http://localhost:41496/main-admin.html`、`http://localhost:41496/realistic-admin.html`。

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
| `index.html` | 48 | 12 | 0 | 0 | 0 | 0 |
| `main-admin.html` | 28 | 1 | 1 | 0 | 0 | 0 |
| `realistic-demo.html` | 3 | 0 | 0 | 0 | 0 | 0 |
| `realistic-admin.html` | 18 | 0 | 1 | 0 | 0 | 0 |

结论：四个入口 HTML 的静态按钮和导航链接已经没有 `demo-content` 或缺失标记；前台动态场景热点按钮也已纳入清单脚本并改为本机真实交互。下一步要审计的是“标为真实的控件是否足够真实”。

## 3. 当前不够完善的功能

### 3.1 前台学习产品

| 模块 | 当前可用内容 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 10 步学习路径 | 可导航，支持 `?step=1-10` 直达，部分指标已读取本机状态 | 部分标题、热点和学习说明仍依赖 `SCENES` 静态配置 | 用 `LearningTask`、`PracticeSession`、`ArtworkRecord`、`ReportRecord` 推导步骤标题、完成状态和下一步动作 |
| 学习模式 | 单字、集字、创作可切换，并有本机任务状态 | 没有课程编排、教师下发、步骤依赖和评分规则 | 增加课程/任务 schema、任务版本、必做步骤、完成条件和任务依赖 |
| AI 讲解 | 浏览器本机语音合成能朗读本机讲解段落 | 不是云端 AI 音频，也不是根据真实笔迹动态生成 | UI 保持“本机语音讲解”定位；后续抽象讲解服务接口，支持云端生成和音频资源 |
| 书写练习 | 支持鼠标/触控笔迹、撤销、清空、回放和本机保存 | 缺压感、笔锋、笔画顺序模型和硬件适配 | 增加范字路径库、笔画顺序校验、压感字段、专业评分接口和离线 fallback |
| 评分反馈 | 能从本机笔迹计算结构、笔画、笔法、力度、流畅度 | 仍是启发式评分，容易被误解为专业识别模型 | 明确标注为基础练习评分；补评分公式解释、证据点和后续模型适配层 |
| 学习计划 | 可按本机状态生成、勾选、顺延、复盘、管理计划项，显示任务依赖图，生成下周期，检查浏览器通知权限，触发页面打开时的一次性本机通知，导出/导入 JSON 同步包，配置远端 API endpoint 并通过 `fetch` 检查、推送、拉取计划仓库，可导出离线 HTML 计划单 | 缺真正账号登录、后台托管仓库、自动跨设备调度、远端提醒和教师端通知 | 继续增加账号同步、后台计划仓库、教师端通知和自动同步策略 |

### 3.2 作品、报告和分享

| 模块 | 当前可用内容 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 保存作品 | 能保存笔迹、截图、评分、标签和本机作品记录 | 作品只在当前浏览器可见 | 增加公开作品集适配、跨设备作品库和课堂评阅入口 |
| 生成视频 | 能用真实笔迹导出 WebM 回放 | 不是 MP4/GIF，没有封面、压缩和分享链路 | UI 写明 WebM；后续加格式转换、封面图和异步导出队列 |
| 导出报告 | 能生成 HTML 报告、站内报告详情、原生 PDF 报告、报告对比和多报告趋势 | 原生 PDF 第一版以文本摘要为主，还没有云端长期报告、教师批注和签名验真 | 继续增加 PDF 图表/截图嵌入、报告 schema、服务端保存接口和导出验收 |
| 学习档案 | 有筛选、趋势、详情、回收站、导出和直达链接 | 本机分页和本机 URL，不能跨设备访问 | 抽象档案 repository，短期本机，长期替换服务端分页接口 |
| 分享成果 | 能导出离线 HTML 分享页 | 没有微信、社群、课堂或公开链接 | 分享按钮保持 `real-export`，不能写成“已发布到社交平台”；后续加公开链接服务 |

### 3.3 主后台和写实后台

| 模块 | 当前可用内容 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 主后台编辑 | 能编辑对象、图层、灯光、导入模型、保存布局 | 保存主要在 localStorage / IndexedDB | 抽象项目配置 repository，为远端保存和协作留接口 |
| 写实后台编辑 | 能编辑写实样张对象、导入模型、保存快照和发布到演示 | 与主后台对象模型仍有差异 | 统一对象 schema、字段迁移和资产引用规则 |
| 本机发布 | 主后台发布到前台，写实后台发布到演示，支持历史和回滚，并可配置远端发布 API 真实 POST 当前发布包 | 远端发布 adapter 已完成第一版，但还不是账号权限、审核流、CDN 部署或服务器托管 | 继续增加远端发布 diff、审核流、账号权限、发布锁和远端资产签名 |
| 项目档案 | 可导出/导入 JSON，含 schema、迁移、模型哈希和选择恢复 | 三方合并、完整 JSON 树、远端资产服务仍弱 | 增加字段级 merge 策略、冲突解决界面、远端资产完整性校验 |
| 后台权限 | 当前无需登录即可编辑，主后台和写实后台已增加本机无权限保护提示与确认状态 | 任何人打开后台仍能改本机内容 | 后端版加入账号、角色、审计和发布权限 |

## 4. 最像“假的”的界面来源

1. 部分热点说明仍来自静态场景导览；学习动作里的笔画拆解、创作实践、复习巩固已开始写入本机阶段记录。
2. AI 讲解、评分、发布、分享、PDF 这些词天然会让用户期待生产级能力，但当前多为本机原型或导出文件。
3. 学习计划已有到期、提醒、顺延、复盘、依赖图、周期循环、离线导出、本机提醒权限边界、JSON 同步包和远端 API adapter；真正账号系统、后台托管仓库、远端提醒和教师端通知仍未接入。
4. 后台本机发布和远端发布 API adapter 已可用，但远端 adapter 只是把发布包发给用户配置的 endpoint，不是部署、审核、账号权限或 CDN 托管。
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

- 评分结果旁显示计算依据，例如笔画数量、采样点、重心偏移、停顿次数。
- 把启发式评分命名为“基础练习评分”。
- 增加评分接口层，未来可替换成专业模型。
- 本机语音讲解继续可用，但接口上预留云端讲解服务。

验收：

- 同一用户写两次不同质量的字，评分差异有可解释原因。
- 没有笔迹时不出现假评分。
- 浏览器不支持语音合成时，AI 讲解显示文本播放状态和失败提示。

### 阶段 D：把报告和分享从导出文件升级为产品能力

目标：保留当前本机导出优势，同时为云端能力留接口。

任务：

- 定义 `ReportRecord` 和 `ShareRecord` 的稳定 schema。
- HTML 报告继续保留，增加 PDF 生成适配层。
- 分享页导出继续标为 `real-export`，公开链接功能单独标为后续能力。
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
| P0 | 账号化计划仓库和跨设备提醒 | 远端 API adapter 第一版已完成，但还没有账号登录、后台托管仓库、自动同步调度、教师端通知或后台推送 | 账号同步状态、服务端 repository 合同、跨设备提醒策略 |
| P0 | 剩余 `demo-content` 动作治理 | 用户最容易觉得“按钮是假的” | 四个入口 HTML 静态控件和前台动态热点已清零；后续持续审计新增控件 |
| P1 | 评分解释层 | 评分是核心信任点 | 第一版已完成：基础评分证据、缺数据状态、模型替换接口 |
| P1 | 任务依赖和完成条件 | 10 步学习路径需要真实进度 | 第一版已完成：任务依赖、完成规则、锁定状态、选择拦截和测试 |
| P1 | 后台权限风险提示 | 当前后台可直接编辑 | 第一版已完成：主后台和写实后台风险提示、本机确认状态、烟测标记 |
| P2 | 报告 PDF/云端适配 | 原生 PDF 第一版已完成，但仍缺图表/作品嵌入、云端长期报告和教师批注 | PDF 图表/截图增强、服务端接口草案 |
| P2 | 项目档案 merge 和冲突解决 | 导入导出已可用，但长期项目需要更稳 | 字段级 merge、冲突 UI、测试 |
| P2 | 后台远端发布生产化 | 远端发布 API adapter 第一版已完成，但仍缺审核流、发布锁和远端资产签名 | 远端发布 diff、审批状态、发布锁、资产签名 |
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

目前版本的基础已经比最早的静态页面强很多，但还没有达到“真实产品”的标准。下一阶段不应该继续堆新 Demo，而应该继续补真实闭环，尤其是账号化计划 repository、浏览器级自动化验收、报告 PDF/云端适配和后台远端发布生产化。

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
