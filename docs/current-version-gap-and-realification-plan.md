# 当前版本功能缺口与前端真实化开发文档

日期：2026-06-11  
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
| `index.html` | 56 | 13 | 0 | 0 | 0 | 0 |
| `main-admin.html` | 32 | 3 | 1 | 0 | 0 | 0 |
| `realistic-demo.html` | 3 | 0 | 0 | 0 | 0 | 0 |
| `realistic-admin.html` | 22 | 0 | 1 | 0 | 0 | 0 |
| `script.js dynamic` | 26 | 1 | 0 | 0 | 1 | 0 |

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
| 学习计划 | 可按本机状态生成、勾选、顺延、复盘、管理计划项，显示任务依赖图，生成下周期，检查浏览器通知权限，触发页面打开时的一次性本机通知，导出/导入 JSON 同步包，配置远端 API endpoint 并通过 `fetch` 检查、推送、拉取计划仓库，可导出离线 HTML 计划单；计划变更已进入自动同步队列，拉取远端时会检测本机待同步冲突，并提供保留本机、采用远端、另存远端副本三种处理入口；远端计划仓库 API 合同和本机 mock 服务已完成第一版 | 缺真正账号登录、后台托管仓库、远端提醒和教师端通知 | 继续增加账号同步、后台计划仓库、教师端通知和远端提醒 |

### 3.2 作品、报告和分享

| 模块 | 当前可用内容 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 保存作品 | 能保存笔迹、截图、评分、标签和本机作品记录 | 作品只在当前浏览器可见 | 增加公开作品集适配、跨设备作品库和课堂评阅入口 |
| 生成视频 | 能用真实笔迹导出 WebM 回放 | 不是 MP4/GIF，没有封面、压缩和分享链路 | UI 写明 WebM；后续加格式转换、封面图和异步导出队列 |
| 导出报告 | 能生成 HTML 报告、站内报告详情、原生 PDF 报告、报告对比、多报告趋势和本机教师批注 | 原生 PDF 第一版以文本摘要为主，还没有云端长期报告、账号教师端和签名验真 | 继续增加 PDF 图表/截图嵌入、报告 schema、服务端保存接口、账号化教师批注和导出验收 |
| 学习档案 | 有筛选、趋势、详情、回收站、导出、直达链接、远端 API 推送/拉取、API 合同和本机 mock 服务 | 还没有账号登录、托管档案仓库、服务端分页、教师批注和长期归档 | 继续增加账号化 history repository、服务端分页接口、云端详情 URL 和字段级合并 |
| 分享成果 | 能导出离线 HTML 分享页 | 没有微信、社群、课堂或公开链接 | 分享按钮保持 `real-export`，不能写成“已发布到社交平台”；后续加公开链接服务 |

### 3.3 主后台和写实后台

| 模块 | 当前可用内容 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 主后台编辑 | 能编辑对象、图层、灯光、导入模型、保存布局 | 保存主要在 localStorage / IndexedDB | 抽象项目配置 repository，为远端保存和协作留接口 |
| 写实后台编辑 | 能编辑写实样张对象、导入模型、保存快照和发布到演示 | 与主后台对象模型仍有差异 | 统一对象 schema、字段迁移和资产引用规则 |
| 本机发布 | 主后台发布到前台，写实后台发布到演示，支持历史和回滚，并可配置远端发布 API 真实 POST 当前发布包，远端推送前已有本机审核流和发布锁 | 远端发布 adapter 已完成第一版，但还不是服务端账号权限、CDN 部署或服务器托管 | 继续增加服务端审批合同、账号权限、发布锁远端校验和远端资产签名 |
| 项目档案 | 可导出/导入 JSON，含 schema、迁移、模型哈希和选择恢复 | 三方合并、完整 JSON 树、远端资产服务仍弱 | 增加字段级 merge 策略、冲突解决界面、远端资产完整性校验 |
| 后台权限 | 当前无需登录即可编辑，主后台和写实后台已增加本机无权限保护提示与确认状态 | 任何人打开后台仍能改本机内容 | 后端版加入账号、角色、审计和发布权限 |

## 4. 最像“假的”的界面来源

1. 部分热点说明仍来自静态场景导览；学习动作里的笔画拆解、创作实践、复习巩固已开始写入本机阶段记录。
2. AI 讲解、评分、发布、分享、PDF 这些词天然会让用户期待生产级能力，但当前多为本机原型或导出文件。
3. 学习计划已有到期、提醒、顺延、复盘、依赖图、周期循环、离线导出、本机提醒权限边界、JSON 同步包、远端 API adapter、API 合同、mock 服务、自动同步队列、冲突检测和前端冲突解决入口；真正账号系统、后台托管仓库、远端提醒和教师端通知仍未接入。
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
| P0 | 账号化计划仓库和跨设备提醒 | 远端 API adapter、服务端 repository 合同、mock 服务、自动同步队列、冲突检测和前端冲突解决入口第一版已完成，但还没有账号登录、后台托管仓库、教师端通知或后台推送 | 账号同步状态、托管 repository、跨设备提醒策略 |
| P0 | 剩余 `demo-content` 动作治理 | 用户最容易觉得“按钮是假的” | 四个入口 HTML 静态控件和前台动态热点已清零；后续持续审计新增控件 |
| P1 | 评分解释层 | 评分是核心信任点 | 第一版已完成：基础评分证据、缺数据状态、模型替换接口 |
| P1 | 任务依赖和完成条件 | 10 步学习路径需要真实进度 | 第一版已完成：任务依赖、完成规则、锁定状态、选择拦截和测试 |
| P1 | 后台权限风险提示 | 当前后台可直接编辑 | 第一版已完成：主后台和写实后台风险提示、本机确认状态、烟测标记 |
| P2 | 报告 PDF/云端适配 | 原生 PDF 第一版、本机教师批注和导出批注标记已完成，但仍缺图表/作品嵌入、云端长期报告和账号教师端 | PDF 图表/截图增强、服务端接口草案、教师端身份与审计 |
| P2 | 项目档案 merge 和冲突解决 | 字段级 merge、模型冲突处理和导入影响报告已有第一版，但还缺多人协作级冲突审计 | 冲突审计历史、远端资产完整性校验、多人合并策略 |
| P2 | 后台远端发布生产化 | 远端发布 API adapter、发布包 manifest/digest、发布前预检、审核流、发布锁、资产清单哈希、服务端合同文档和 mock server 已完成第一版，但仍缺服务端账号权限和服务端资产签名 | 服务端审批合同强化、服务端资产签名、发布锁服务端校验 |
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

已知限制：

- HTML 报告继续真实嵌入作品原图；当前轻量原生 PDF 为保证离线打开稳定，先使用作品卡片和截图来源标记，不直接嵌入 PNG 位图流。
- 未来如果要在原生 PDF 中嵌入完整位图，需要补浏览器端图片转码或服务端 PDF 渲染管线。

提交：

- 中文 commit message：`增强学习报告PDF图表`

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

- 差异报告是导入前审阅产物；恢复动作完成后的本机审计历史由后续“项目档案恢复审计”功能记录，多人协作审计仍待补充。
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
- `scripts/remote-publish-check.js` 新增真实 HTTP mock server 验收，覆盖 GET 检查、POST 推送、回执、重复摘要拒绝和远端状态持久化。
- `scripts/smoke-test.js` 把远端发布 mock server 纳入语法检查。

真实化说明：

- 数据来源：后台当前本机发布包、manifest 摘要、资产清单和本地 mock server 内存 receipt。
- 写入状态：前端 adapter 仍写入 `mr-calligraphy-remote-publish-v1`；mock server 记录 receipt、packageDigest 和重复发布状态。
- 成功反馈：mock server 返回远端版本、packageId、releaseId、packageDigest 和 receiptDigest；adapter 会把远端版本和 packageId 写回本机远端发布状态。
- 失败反馈：HTTP 401、409、422 和 500 会返回结构化 JSON，不显示部署成功。
- 刷新后复现方式：本机 adapter 的最近远端状态可刷新读取；mock server receipt 是临时测试服务内存状态，用于本地验收。

验收：

- 手工验收：运行 `node scripts/remote-publish-mock-server.js`，在主后台或写实后台配置输出的 endpoint，完成本机发布、审核通过后推送，应看到 mock server 返回回执。
- 脚本验收：`node scripts/remote-publish-check.js` 会启动临时 mock server，验证真实 HTTP GET/POST、Bearer token、receipt 和重复 digest 拒绝；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查新脚本语法。

已知限制：

- mock server 是开发验收工具，不提供持久化数据库、账号权限、CDN 上传或生产审计。
- 服务端资产签名和远端发布锁校验仍需要生产服务实现。
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
- `scripts/learning-state-check.js` 新增真实 HTTP mock server 验收，覆盖 GET 检查、PUT 推送、最近档案包拉取、同 ID 差异跳过、回执 digest 和错误 token 拒绝。
- `scripts/smoke-test.js` 把学习档案仓库 mock server 和前台档案仓库控件纳入检查。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.sessions/artworks/reports` 生成的 `mr-calligraphy-history-repository-v1` 同步包。
- 写入状态：远端配置、最近同步方向、远端记录数、最近 packageId、跳过冲突数量和错误写入 `historyRepository`。
- 成功反馈：mock server 返回远端版本、服务端 packageId、repositoryDigest 和 receiptDigest；前台状态条显示最近推送/拉取结果。
- 失败反馈：HTTP 401、404、405、422 和 500 会返回结构化 JSON，不显示同步成功；同 ID 差异不会覆盖本机。
- 刷新后复现方式：前端保存的 endpoint、最近同步方向、跳过冲突数量和远端状态可刷新读取；mock server 内存状态只用于本地开发验收。

验收：

- 手工验收：运行 `node scripts/history-repository-mock-server.js`，在前台学习档案面板配置输出的 endpoint，产生练习/作品/报告后点击“检查远端 / 推送档案 / 拉取档案”，应看到真实 HTTP 状态和同步结果。
- 脚本验收：`node scripts/learning-state-check.js` 会启动临时 mock server，验证真实 HTTP GET/PUT、Bearer token、receipt、同 ID 差异跳过和错误 token 拒绝；`node scripts/smoke-test.js --base-url=http://localhost:41496/` 会检查新脚本语法和页面控件。

已知限制：

- mock server 是开发验收工具，不提供持久化数据库、账号权限、服务端分页、教师批注、公开作品墙或长期归档。
- 当前同 ID 差异只跳过并提示，后续需要账号化服务端版本、字段级 merge 和冲突审计。
- 学习档案远端同步仍由用户自配 HTTP endpoint 驱动，不是内置云服务。

提交：

- 中文 commit message：`新增学习档案远端仓库`

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
- 还没有服务端审计、教师身份、课堂权限、签名验真或云端长期报告仓库。

提交：

- 中文 commit message：`新增报告教师批注`
