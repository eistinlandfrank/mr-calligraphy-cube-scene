# Smoke Test

本项目是静态网页项目。基础 smoke test 使用无依赖 Node 脚本完成语法、控件、项目档案、项目 Schema 和页面可访问检查；浏览器级真实交互使用 Playwright 覆盖高风险闭环。

- 静态语法检查：覆盖 smoke test、控件清单、项目档案迁移检查、项目档案资产哈希检查、项目 Schema 检查、远端发布检查、远端发布 mock server、计划仓库 mock server、学习档案仓库 mock server、报告仓库 mock server、项目仓库 mock server、学习状态检查、Playwright 测试源码、前台状态层、书写画布、项目 schema、项目档案、远端发布 adapter、房间配置、前台主脚本、主后台 3D 脚本、写实场景脚本。
- 控件状态清单：确认四个入口 HTML 里的按钮和导航链接都带有 `data-feature-state`，且状态值有效；同时扫描前台脚本动态生成控件的 `dataset.featureState` 字面量，避免运行时按钮回退到 `demo-content`。
- 项目档案迁移检查：模拟旧档案缺少新增 storage / IndexedDB 项时，确认迁移记录会写入 `projectSchema.migrations`，缺项默认不恢复，避免误清当前本机状态，并验证 localStorage JSON 导入预览会显示字段级差异、字段恢复影响提示、字段 JSON 片段且支持深层字段选择性恢复；同时验证 IndexedDB 模型仓库会显示单模型新增/修改差异、当前/档案元数据片段、完整模型 JSON 安全预览、命名冲突提示，并支持只恢复勾选模型、冲突自动改名、替换本机同名模型和自定义档案模型名称；同时验证项目档案导入差异报告会生成可离线审阅的 HTML，包含字段覆盖、模型冲突、恢复选择和不会直接覆盖本机数据的说明；恢复成功后会写入本机审计日志，并可导出恢复审计 HTML。
- 项目档案资产哈希检查：模拟带模型二进制的档案，确认 SHA-256 会写入资产清单，错误哈希会阻止恢复且不会提前覆盖本机状态。
- 项目 Schema 检查：模拟主后台和写实后台草稿、快照、发布版本列表及导入模型，确认 `projectSchema` 会统计发布版本、发布说明、回滚动作、资产哈希、导入模型文件大小和统一 `ProjectRepository` 状态。
- 远端发布检查：模拟主后台和写实后台本机发布版本，确认 `MRProjectRemotePublish` 会拒绝未配置/非法 endpoint，保存 HTTP endpoint/token，生成带 manifest、SHA-256 摘要、资产清单和资产摘要的发布包，执行发布包本机预检，识别资产清单篡改和缺哈希 warning，未审核时阻止 POST，通过审核后才推送，推送前 GET 校验服务端发布锁 / 最近回执，命中重复包时阻止 POST，远端普通拒收时释放本机临时锁，推送成功后写入发布锁并阻止重复推送，携带 Bearer header，GET 检查远端，POST 当前发布包；同时启动真实本机 mock server，验证服务端回执、回执审计导出、重复摘要拒绝，并持久化 packageId、releaseId、packageDigest、审核状态、发布锁、回执列表和远端状态。
- 学习状态检查：模拟同字两幅作品，确认基础评分服务、本机讲解服务、`MRAppState.getArtworkComparison()` 会生成前后作品、评分差、笔画差、采样差、截图和维度差，并验证作品集搜索、标签筛选、标签编辑、localStorage 持久化、学习档案同步仓库、学习档案仓库教师批注同步摘要、学习档案冲突审计和字段级合并、作品分享页 HTML、本机分享链接服务、报告原生 PDF、报告本机验真摘要、报告仓库远端 API adapter、报告仓库 mock 服务、报告教师批注、报告对比离线 HTML、评分证据、学习阶段记录、任务依赖与完成规则、学习计划提醒、顺延、复盘状态、学习计划提醒服务边界、学习计划同步仓库、远端计划 API adapter、计划仓库 mock 服务、学习计划自动同步队列、计划同步冲突检测、计划冲突另存副本、学习计划依赖图、学习计划周期循环和学习计划离线 HTML 导出。
- 页面可访问检查：覆盖 `/`、`/main-admin.html`、`/realistic-demo.html`、`/realistic-admin.html`，并确认页面包含关键 DOM / script 标记，包括学习步骤路由、学习热点路由、模型展示路由、前台写实样张入口、基础评分服务摘要、AI 讲解本机语音状态、本机讲解服务摘要、学习档案重命名表单、作品标签编辑表单、学习档案同步仓库状态/导入/导出入口、远端学习档案 API endpoint/token/检查/推送/拉取入口、学习计划提醒摘要、学习计划本机提醒服务状态/权限入口、学习计划同步仓库状态/导入/导出入口、远端计划 API endpoint/token/检查/推送/拉取入口、计划同步冲突面板和保留本机/采用远端/另存副本入口、学习计划周期摘要、学习计划依赖图、学习计划项表单编辑入口、学习计划导出入口、学习计划下周期入口、报告本机验真摘要、报告仓库状态、远端报告 API endpoint/token/检查/推送/拉取入口、报告原生 PDF 下载入口、报告本机教师批注入口、报告对比、报告对比导出、多报告趋势、字段多选控件、字段分组模板、趋势悬浮提示入口、提示固定/复制入口、趋势缩放入口、逐点明细入口、主后台项目仓库状态、主后台远端项目仓库 API 控件、主后台远端项目仓库版本选择和拉取预览入口、主后台项目档案差异报告入口、主后台项目档案恢复审计入口、主后台和写实后台远端发布 API 控件、远端发布审核/发布锁控件、远端发布回执审计控件、写实样张相机控件以及两个后台的本机权限风险提示。

## 直接运行

不传参数时，脚本会自动启动一个临时静态服务器，检查完成后关闭：

```bash
node scripts/smoke-test.js
```

## 检查正在运行的服务器

如果项目已经由本地服务器启动，例如 Codex 当前环境里的 `http://localhost:41496/`：

```bash
node scripts/smoke-test.js --base-url=http://localhost:41496/
```

也可以使用环境变量：

```bash
SMOKE_BASE_URL=http://localhost:41496/ node scripts/smoke-test.js
```

## 单独检查控件状态

```bash
node scripts/control-inventory.js --check
```

该命令会列出四个入口页面中 `real-local`、`real-export`、`real-published-local`、`demo-content`、`disabled`、缺失和非法状态的数量，并额外列出 `script.js dynamic` 中运行时控件的状态字面量；旧 `real` 和 `demo` 仍兼容，但新增控件应优先使用细分状态。

## 单独检查项目档案迁移

```bash
node scripts/archive-migration-check.js
```

该命令会模拟 5.16 线旧档案只包含早期 storage / IndexedDB 项的情况，验证迁移层会补齐当前项目档案结构、生成迁移说明，并把缺失的新条目设为默认不恢复；同时会构造一组本机学习状态差异，确认导入预览能展示 `sessions[0].score` 这类深层修改路径、当前/档案值摘要、覆盖影响提示和字段 JSON 片段，并验证只恢复已勾选深层字段时不会覆盖未勾选字段；还会模拟本机旧模型和档案模型变化，确认模型仓库预览能展示单模型新增/修改、当前/档案元数据片段、完整模型 JSON 安全预览、命名冲突提示和建议名称，并验证项目档案导入差异报告会写入深层字段、命名冲突、自定义名称选择和不会直接覆盖本机数据的边界说明；恢复成功后会写入本机审计日志，审计记录包含恢复 key、字段级选择数量，并可导出审计 HTML；只恢复已勾选新增模型时不会覆盖未勾选旧模型，冲突模型会自动追加“档案”后缀；选择替换策略时会删除本机同名旧模型并恢复档案原名称；选择自定义名称时会按用户输入恢复档案模型名称。

## 单独检查资产哈希

```bash
node scripts/archive-asset-hash-check.js
```

该命令会模拟带模型二进制的项目档案，验证正确 SHA-256 能通过、错误 SHA-256 会阻止恢复，并确认失败时不会先写入本机状态。

## 单独检查项目 Schema

```bash
node scripts/project-schema-check.js
```

该命令会模拟主后台、写实后台本机草稿、保存历史、发布版本历史和导入模型，验证 schema 摘要能统计 `mainReleases`、`realisticReleases`、当前发布说明、回滚动作、模型 SHA-256、统一 `mr-calligraphy-project-repository-v1` 状态、两个后台 ready 场景数和仓库资产风险。

## 单独检查远端发布

```bash
node scripts/remote-publish-check.js
```

该命令会模拟主后台和写实后台当前本机发布版本，验证远端发布 adapter 能生成 `mr-calligraphy-remote-publish-package-v1` 发布包和 `mr-calligraphy-remote-publish-manifest-v1` manifest，正常包预检通过，篡改包和篡改资产清单预检失败，缺哈希资产返回 warning，拒绝未配置或非法 endpoint，保存 HTTP endpoint 和 token，未审核时阻断推送，审核中继续阻断，通过审核后真实调用 mock `fetch` 做 GET 检查和 POST 推送，推送 body 携带资产清单和资产 SHA-256，推送成功后写入发布锁、回执审计并阻止重复推送，解除发布锁后清空锁状态；同时会启动 `scripts/remote-publish-mock-server.js` 临时 HTTP 服务，验证真实 GET/POST、Bearer token、receipt、回执审计 HTML、重复 packageDigest 拒绝，并确认 Authorization header、packageId、releaseId、packageDigest、审核状态、发布锁、回执列表、远端版本和状态会写回 `mr-calligraphy-remote-publish-v1`。

## 单独检查学习状态

```bash
node scripts/learning-state-check.js
```

该命令会模拟同一个字的两幅作品和关联练习，验证 `MRAppState.getLearningPathStatus()` 会基于 `LearningTask`、练习、作品、报告、阶段记录和计划推导 10 步标题、完成状态、证据和下一步动作；验证 `MRAppState.getScoreServiceStatus()` 会迁移旧练习评分记录、保留本机启发式评分边界，并在新增真实笔迹后累计最近分数、证据摘要、评分次数和采样点；验证 `MRAppState.getLectureServiceStatus()`、`updateLectureServiceCapabilities()` 和 `recordLectureServiceEvent()` 会记录本机语音能力、语音名称、播放段落、文本降级、完成时间和本机讲解边界，并验证学习状态层能生成真实作品对比数据，包括较早作品、最新作品、评分差、笔画差、采样差、截图和维度差；同时验证 `MRAppState.getArtworkGallery()` 能按标题搜索、按默认字标签筛选，验证 `MRAppState.updateArtworkTags()` 会把自定义标签写回 localStorage，验证 `MRAppState.getHistoryRepositoryPackage()` 会生成学习档案 JSON 同步包并统计 `teacherReviewedReportCount`，验证 `MRAppState.configureHistoryRepositoryRemote()`、`checkRemoteHistoryRepository()`、`pushHistoryRepositoryToRemote()` 和 `pullHistoryRepositoryFromRemote()` 会通过真实本机 HTTP mock server 保存 endpoint/token、携带 Bearer header、GET 检查、PUT 推送档案包、GET 拉取最近档案包、保留报告教师批注摘要与内容、跳过同 ID 差异记录且不覆盖本机档案，并持久化远端同步状态和冲突审计，验证冲突档案可按字段采用远端值，也验证远端冲突档案可另存为本机副本，验证 `MRAppState.getArtworkSharePackage()` 会生成包含作品图、评分、边界说明和能力维度的 HTML 分享页，验证 `MRAppState.createArtworkShareLink()`、`openArtworkShareLink()`、`markArtworkShareLinkCopied()` 和 `revokeArtworkShareLink()` 会生成本机分享记录、复用有效链接、累计复制/访问次数、持久化记录并阻止已撤销链接继续打开，并验证 `MRAppState.getReportPdfExport()` 会生成真正的 PDF 文件头、`.pdf` 文件名、`application/pdf` MIME、本机数据来源、教师批注标记、`ReportDigest` 本机验真摘要和非空内容，验证 `MRAppState.getReportVerification()` 可重新计算同一份报告的 64 位 SHA-256 摘要，验证 `MRAppState.getReportRepositoryPackage()` 会生成包含报告和本机验真摘要的报告仓库包，验证 `MRAppState.configureReportRepositoryRemote()`、`checkRemoteReportRepository()`、`pushReportRepositoryToRemote()` 和 `pullReportRepositoryFromRemote()` 会通过真实本机 HTTP mock server 保存 endpoint/token、携带 Bearer header、GET 检查、PUT 推送报告包、GET 拉取最近报告包、保留教师批注和验真摘要、跳过同 ID 差异报告且不覆盖本机记录，并持久化远端报告仓库状态，验证 `MRAppState.updateReportTeacherReview()` 会拒绝空批注、写入批注人/内容并持久化到报告记录，验证 `MRAppState.getReportHtmlExport()` 和 `getReportPdfExport()` 会在导出中保留教师批注状态和同一份本机验真摘要，验证教师批注变更后报告摘要会随内容变化，验证 `MRAppState.getReportComparison()` 会基于两份本机报告生成平均分、次数和字段级能力差值，验证 `MRAppState.getReportComparisonExport()` 会生成可离线打开并可打印保存 PDF 的报告对比 HTML，验证 `MRAppState.getReportSeries()` 会基于三份本机报告生成报告序列和字段级首末趋势，验证 `MRAppState.recordPracticeResult()` 会保存基础评分证据、五项维度理由和评分服务状态，验证 `MRAppState.recordLearningStage()` 会生成并持久化笔画拆解、创作实践和复习巩固阶段记录，验证任务依赖会在前置未完成时锁定后续任务、完成后解锁下一任务且继续锁定挑战任务，验证 `MRAppState.createPlan()`、`snoozePlanItem()` 和 `completePlanItemReview()` 会生成并持久化学习计划提醒、顺延、复盘状态和待自动同步队列，验证 `MRAppState.getPlanReminderServiceStatus()`、`setPlanReminderServicePreference()` 和 `dispatchPlanReminderNotification()` 会处理浏览器通知支持、权限启用、真实 Notification 调用和重复触发保护，验证 `MRAppState.getPlanRepositoryPackage()`、`importPlanRepositoryPackage()` 和 `checkRemotePlanRepository()` 会生成 JSON 同步包、导入计划并在未配置远端时明确失败，验证 `MRAppState.configurePlanRepositoryRemote()`、`checkRemotePlanRepository()`、`pushPlanRepositoryToRemote()`、`pullPlanRepositoryFromRemote()`、`flushPlanRepositoryAutoSync()` 和 `resolvePlanRepositoryConflict()` 会使用 mock `fetch` 保存 endpoint/token、携带 Bearer header、检查远端、PUT 推送计划包、GET 拉取计划包、自动同步待同步队列、检测远端冲突且不覆盖本机待同步计划项，将远端冲突计划另存为本机副本，并持久化远端同步状态；同时会启动 `scripts/report-repository-mock-server.js` 和 `scripts/plan-repository-mock-server.js` 临时 HTTP 服务，验证真实 GET/PUT、Bearer token、仓库 receipt、最近包拉取和错误 token 拒绝；最后验证 `MRAppState.getPlanDependencyGraph()` 会生成计划节点、依赖边、阻塞和解锁状态，验证 `MRAppState.getPlanCycleStatus()` 和 `createNextPlanCycle()` 会阻止未完成计划伪造下周期、完成后生成下一轮并持久化源计划和新计划关系，并验证 `MRAppState.getPlanExport()` 会生成包含计划 ID、任务项、到期信息、依赖摘要、周期摘要和本机导出边界的离线 HTML。

## 浏览器级验收

首次运行前安装依赖：

```bash
npm install
```

然后运行：

```bash
npm run test:e2e
```

Playwright 会启动本地静态服务器，并覆盖以下闭环：

- 前台主房间、主后台和写实后台会采样 WebGL canvas 像素，确认画布不是空白 DOM。
- 前台在真实 canvas 书写后点击“保存作品”，确认本机学习状态写入作品和已保存练习。
- 前台点击“导出报告”，确认下载 HTML 报告、写入报告记录，并能通过 `?report=报告ID` 打开站内报告。
- 站内报告填写本机教师批注后，确认批注人和批注内容写入 `ReportRecord`，刷新页面后仍能复现，并可清除回到空批注状态。
- 站内报告配置远端 endpoint/token 后，用浏览器路由模拟报告仓库 API，覆盖检查远端、推送报告包、Bearer token、远端 packageId 持久化、拉取远端包、教师批注和本机验真摘要随包同步。
- 前台学习档案配置远端 endpoint/token 后，用浏览器路由模拟学习档案仓库，覆盖检查远端、推送档案包、Bearer token、远端 packageId 持久化、拉取远端包、分页第二页自动追取、冲突审计面板、字段级合并表单和 `historyRepository` 状态更新。
- 主后台新增基础物体后检查发布差异，点击“发布到前台”，确认草稿、发布快照、差异归零和前台读取来源都是真实本机状态。
- 主后台项目仓库配置远端 endpoint/token 后，用浏览器路由模拟项目仓库 API，覆盖检查远端、推送项目仓库包、拉取远端包进入导入预览、Bearer token、`archive` / `projectSchema` / `repository` / `packageDigest` 和回执持久化。
- 主后台配置远端发布 endpoint/token 后，用浏览器路由模拟远端 API，覆盖检查远端、提交审核、通过审核、推送发布包、显示回执、写入 `mr-calligraphy-remote-publish-v1` 和导出回执审计 HTML。
- 写实后台连续发布、修改坐标、检查发布差异并回滚旧版本，确认 `mr-calligraphy-realistic-published-v1` 会记录发布版本列表和回滚动作。

如果项目已经由本地服务器启动，也可以复用当前地址：

```bash
PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e
```

## 通过标准

命令应输出：

```text
Smoke test 通过：22 个脚本，4 个页面。
```

如果任一脚本语法失败、页面无法访问、HTTP 状态不是 2xx，或页面缺少关键标记，命令会以非 0 状态退出。

## 当前边界

- 轻量 smoke test 不会打开真实浏览器；WebGL 非空渲染由 Playwright 像素采样覆盖。
- Playwright 已覆盖首批真实交互闭环、报告教师批注持久化、学习档案远端同步、主后台远端发布回执和写实发布历史源码，但当前环境缺少依赖时仍需在具备 npm 代理认证的环境执行；测试仍未覆盖所有下载、导入模型、回收站和移动端视口。
- 当前 Codex 环境访问 npm registry 会返回 `407 Proxy Authentication Required`，因此本机尚未生成 `package-lock.json`，需要在具备 npm 代理认证的环境里执行 `npm install` 后运行 E2E。
