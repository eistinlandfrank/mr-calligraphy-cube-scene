# Smoke Test

本项目是静态网页项目。基础 smoke test 使用无依赖 Node 脚本完成语法、控件、项目档案、项目 Schema 和页面可访问检查；浏览器级真实交互使用 Playwright 覆盖高风险闭环。

- 静态语法检查：覆盖 smoke test、控件清单、项目档案迁移检查、项目档案资产哈希检查、项目 Schema 检查、远端发布检查、远端发布 mock server、计划仓库 mock server、学习档案仓库 mock server、报告仓库 mock server、项目仓库 mock server、学习状态检查、学习路径动作覆盖检查、Playwright 测试源码、前台状态层、书写画布、项目 schema、项目档案、远端发布 adapter、房间配置、前台主脚本、主后台 3D 脚本、写实场景脚本。
- 控件状态清单：确认四个入口 HTML 里的按钮和导航链接都带有 `data-feature-state`，且状态值有效；同时扫描页面实际加载脚本，确认标记为 `real` / `real-local` / `real-export` / `real-published-local` 的静态控件都有可追踪处理器，并扫描前台、主后台、写实场景脚本运行时生成的按钮，确认动态按钮有真实状态、真实状态按钮可追踪直接点击或 `data-*` 委托处理器，避免按钮只有标签、运行时按钮被兜底成“暂不可用”或写死 `demo-content`。
- 学习路径动作覆盖检查：解析前台 10 个 `SCENES` 场景的 30 个动作，确认每个动作都有 `LEARNING_ACTION_FEATURES` 真实状态标记和 `runLearningAction` 处理分支，避免新增动态按钮后只剩文案或假成功。
- 项目档案迁移检查：模拟旧档案缺少新增 storage / IndexedDB 项时，确认迁移记录会写入 `projectSchema.migrations`，缺项默认不恢复，避免误清当前本机状态，并验证 localStorage JSON 导入预览会显示字段级差异、字段恢复影响提示、字段 JSON 片段且支持深层字段选择性恢复；同时验证 IndexedDB 模型仓库会显示单模型新增/修改差异、当前/档案元数据片段、完整模型 JSON 安全预览、命名冲突提示，并支持只恢复勾选模型、冲突自动改名、替换本机同名模型和自定义档案模型名称；同时验证项目档案导入差异报告会生成可离线审阅的 HTML，包含字段覆盖、模型冲突、恢复选择和不会直接覆盖本机数据的说明；恢复成功后会写入本机审计日志，记录所选档案摘要、恢复范围摘要和审计记录摘要，并可导出恢复审计 HTML。
- 项目档案资产哈希检查：模拟带模型二进制的档案，确认 SHA-256 会写入资产清单，错误哈希会阻止恢复且不会提前覆盖本机状态。
- 项目 Schema 检查：模拟主后台和写实后台草稿、快照、发布版本列表及导入模型，确认 `projectSchema` 会统计发布版本、发布说明、回滚动作、资产哈希、导入模型文件大小和统一 `ProjectRepository` 状态。
- 远端发布检查：模拟主后台和写实后台本机发布版本，确认 `MRProjectRemotePublish` 会拒绝未配置/非法 endpoint，保存 HTTP endpoint/token/workspace，生成带 Workspace、manifest、SHA-256 摘要、资产清单和资产摘要的发布包，执行发布包本机预检，识别资产清单篡改和缺哈希 warning，未审核时阻止 POST，通过审核后才推送，推送前 GET 校验当前 Workspace 的服务端发布锁 / 最近回执，命中重复包时阻止 POST，远端普通拒收时释放本机临时锁，推送成功后写入发布锁并阻止重复推送，携带 Bearer header 和 `X-MR-Workspace-Id` header，GET 检查远端，POST 当前发布包，保存资产签名回执和 CDN upload 摘要，并可 DELETE 撤销生成 CDN purge 回执；同时启动真实本机 mock server，验证按 workspace 分桶的服务端回执、回执本机校验、回执审计导出、重复摘要拒绝、撤销后重新发布，并持久化 workspaceId、packageId、releaseId、packageDigest、审核状态、发布锁、回执列表、本机校验状态和远端状态。
- 学习状态检查：模拟同字两幅作品，确认基础评分服务、本机讲解服务、本机学习动作审计、`MRAppState.getArtworkComparison()` 会生成前后作品、评分差、笔画差、采样差、截图和维度差，并验证作品集搜索、标签筛选、标签编辑、作品导出回执审计、localStorage 持久化、学习档案同步仓库、学习档案仓库 Workspace 请求头和包字段、学习档案仓库 mock 服务按空间隔离、学习档案仓库教师批注同步摘要、学习档案仓库回执审计导出和回执本机校验、学习档案冲突审计和字段级合并、作品分享页 HTML、本机分享链接服务、本机链接复制审计、学习档案详情操作回执审计、远端分享 API adapter、分享 API Workspace 请求头和包字段、分享 mock 服务按空间隔离、分享远端撤销、回执审计导出和回执本机校验、书写视频导出记录、PNG 封面、本机队列和失败重试、复盘导出回执审计、报告原生 PDF、报告 PDF 能力雷达图、报告 PDF 分数趋势图、报告 PDF 作品截图嵌入、报告本机验真摘要、报告导出回执审计、报告对比导出回执审计、报告打印回执审计、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、报告仓库 Workspace 请求头和包字段、报告仓库签名回执审计导出、报告仓库 mock 服务按空间隔离、报告仓库冲突审计、报告冲突字段级合并和远端副本另存、报告教师批注、报告对比离线 HTML、评分证据、学习阶段记录、任务依赖与完成规则、学习计划提醒、顺延、复盘状态、学习计划提醒服务边界、计划提醒回执审计、学习计划日历提醒导出、计划导出回执审计、学习计划同步仓库、远端计划 API adapter、计划仓库 Workspace 请求头和包字段、计划仓库回执审计导出、计划仓库回执本机校验、计划仓库 mock 服务按空间隔离、学习计划自动同步队列、计划同步冲突检测、计划冲突另存副本、学习计划依赖图、学习计划周期循环和学习计划离线 HTML 导出。
- 学习路径动作覆盖检查会防止 `SCENES` 中新增动作时漏掉真实状态标记或处理分支；当前覆盖 10 个场景、30 个动作、30 个状态标记和 30 个处理分支。
- 页面可访问检查：覆盖 `/`、`/main-admin.html`、`/realistic-demo.html`、`/realistic-admin.html`，并确认页面包含关键 DOM / script 标记，包括前台服务边界面板、学习动作审计面板、学习步骤路由、学习热点路由、模型展示路由、前台写实样张入口、基础评分服务摘要、AI 讲解本机语音状态、本机讲解服务摘要、学习档案重命名表单、作品标签编辑表单、作品导出回执审计入口、学习档案详情操作回执入口、学习档案同步仓库状态/导入/导出入口、远端学习档案 API endpoint/token/Workspace/检查/推送/拉取入口、学习档案仓库回执审计入口、学习计划提醒摘要、学习计划本机提醒服务状态/权限入口、计划提醒回执审计入口、学习计划同步仓库状态/导入/导出入口、远端计划 API endpoint/token/Workspace/检查/推送/拉取入口、计划仓库回执审计入口、计划同步冲突面板和保留本机/采用远端/另存副本入口、学习计划周期摘要、学习计划依赖图、学习计划项表单编辑入口、学习计划导出入口、学习计划提醒日历导出入口、计划导出回执审计入口、学习计划下周期入口、作品分享远端 API endpoint/token/Workspace/检查/发布/撤销入口、作品分享远端回执审计入口、复盘导出回执审计入口、报告本机验真摘要、报告仓库状态、报告仓库本机同步包导入/导出入口、远端报告 API endpoint/token/Workspace/检查/推送/拉取入口、报告仓库签名回执审计入口、报告仓库冲突审计入口、报告原生 PDF 下载入口、报告导出回执审计入口、报告对比导出回执审计入口、报告打印回执审计入口、报告本机教师批注入口、报告对比、报告对比导出、多报告趋势、字段多选控件、字段分组模板、趋势悬浮提示入口、提示固定/复制入口、趋势缩放入口、逐点明细入口、主后台服务边界面板、主后台基础物体新增/更新控件、主后台导入模型贴图替换入口、主后台导入模型历史文件清理入口、主后台项目档案导出回执审计入口、主后台项目仓库状态、主后台远端项目仓库 API endpoint/token/Workspace 控件、主后台远端项目仓库版本选择和拉取预览入口、主后台项目仓库回执审计与本机校验入口、主后台项目档案差异报告入口、主后台项目档案恢复审计入口、主后台和写实后台远端发布 API endpoint/token/Workspace 控件、远端发布审核/发布锁控件、远端发布回执审计控件、写实后台服务边界面板、写实后台对象位置/删除/恢复/撤回控件、写实导入模型贴图替换入口、写实导入模型删除审计清理入口、写实样张相机控件以及两个后台的本机权限风险提示。

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

该命令会列出四个入口页面中 `real-local`、`real-export`、`real-published-local`、`demo-content`、`disabled`、缺失和非法状态的数量，并额外列出 `script.js`、`main-admin-scene.js`、`realistic-scene.js` 和 `project-archive.js` 中运行时按钮的状态、动态状态表达式、按钮总数、已追踪处理器和缺失处理器；旧 `real` 和 `demo` 仍兼容，但新增控件应优先使用细分状态。

## 单独检查项目档案迁移

```bash
node scripts/archive-migration-check.js
```

该命令会模拟 5.16 线旧档案只包含早期 storage / IndexedDB 项的情况，验证迁移层会补齐当前项目档案结构、生成迁移说明，并把缺失的新条目设为默认不恢复；同时会构造一组本机学习状态差异，确认导入预览能展示 `sessions[0].score` 这类深层修改路径、当前/档案值摘要、覆盖影响提示和字段 JSON 片段，并验证只恢复已勾选深层字段时不会覆盖未勾选字段；还会模拟本机旧模型和档案模型变化，确认模型仓库预览能展示单模型新增/修改、当前/档案元数据片段、完整模型 JSON 安全预览、命名冲突提示和建议名称，并验证项目档案导入差异报告会写入深层字段、命名冲突、自定义名称选择和不会直接覆盖本机数据的边界说明；恢复成功后会写入本机审计日志，审计记录包含恢复 key、字段级选择数量、所选档案摘要、恢复范围摘要和审计记录摘要，并可导出审计 HTML；只恢复已勾选新增模型时不会覆盖未勾选旧模型，冲突模型会自动追加“档案”后缀；选择替换策略时会删除本机同名旧模型并恢复档案原名称；选择自定义名称时会按用户输入恢复档案模型名称。

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

该命令会模拟主后台和写实后台当前本机发布版本，验证远端发布 adapter 能生成带 `workspaceId` 的 `mr-calligraphy-remote-publish-package-v1` 发布包和 `mr-calligraphy-remote-publish-manifest-v1` manifest，正常包预检通过，篡改包和篡改资产清单预检失败，缺哈希资产返回 warning，拒绝未配置或非法 endpoint，保存 HTTP endpoint、token 和 workspace，未审核时阻断推送，审核中继续阻断，通过审核后真实调用 mock `fetch` 做 GET 检查和 POST 推送，推送 body 携带 Workspace、资产清单和资产 SHA-256，推送成功后写入发布锁、资产签名回执、CDN upload 摘要、回执本机校验和回执审计并阻止重复推送，解除发布锁后清空锁状态；同时会启动 `scripts/remote-publish-mock-server.js` 临时 HTTP 服务，验证真实 GET/POST/DELETE、Bearer token、`X-MR-Workspace-Id`、receipt、回执本机校验、回执审计 HTML、同 workspace 重复 packageDigest 拒绝、撤销回执、CDN purge 摘要和撤销后重新发布，并确认 Authorization header、workspaceId、packageId、releaseId、packageDigest、审核状态、发布锁、回执列表、校验状态、远端版本和状态会写回 `mr-calligraphy-remote-publish-v1`。

## 单独检查学习状态

```bash
node scripts/learning-state-check.js
```

该命令会模拟同一个字的两幅作品和关联练习，验证 `MRAppState.getLearningPathStatus()` 会基于 `LearningTask`、练习、作品、报告、阶段记录和计划推导 10 步标题、完成状态、证据和下一步动作；验证 `MRAppState.getScoreServiceStatus()` 会迁移旧练习评分记录、保留本机启发式评分边界，并在新增真实笔迹后累计最近分数、证据摘要、评分次数和采样点；验证 `MRAppState.getLectureServiceStatus()`、`updateLectureServiceCapabilities()` 和 `recordLectureServiceEvent()` 会记录本机语音能力、语音名称、播放段落、文本降级、完成时间和本机讲解边界，并验证学习状态层能生成真实作品对比数据，包括较早作品、最新作品、评分差、笔画差、采样差、截图和维度差；同时验证 `MRAppState.getArtworkGallery()` 能按标题搜索、按默认字标签筛选，验证 `MRAppState.updateArtworkTags()` 会把自定义标签写回 localStorage，验证 `MRAppState.getHistoryRepositoryPackage()` 会生成带 `workspaceId` 的学习档案 JSON 同步包并统计 `teacherReviewedReportCount`，验证 `MRAppState.configureHistoryRepositoryRemote()`、`checkRemoteHistoryRepository()`、`pushHistoryRepositoryToRemote()` 和 `pullHistoryRepositoryFromRemote()` 会通过真实本机 HTTP mock server 保存 endpoint/token/workspace、携带 Bearer header 和 `X-MR-Workspace-Id` header、GET 检查当前空间、PUT 推送带 `workspaceId` 的档案包、GET 拉取当前空间最近档案包、切换 workspace 后不读取其它空间包、保留报告教师批注摘要与内容、跳过同 ID 差异记录且不覆盖本机档案，并持久化远端同步状态、当前 workspace 和冲突审计，验证冲突档案可按字段采用远端值，也验证远端冲突档案可另存为本机副本，验证 `MRAppState.getArtworkSharePackage()` 会生成包含作品图、评分、边界说明和能力维度的 HTML 分享页，验证 `MRAppState.createArtworkShareLink()`、`openArtworkShareLink()`、`markArtworkShareLinkCopied()` 和 `revokeArtworkShareLink()` 会生成本机分享记录、复用有效链接、累计复制/访问次数、持久化记录并阻止已撤销链接继续打开，验证 `MRAppState.getArtworkShareRemotePackage()`、`configureShareServiceRemote()`、`checkRemoteShareService()` 和 `pushArtworkShareToRemote()` 会生成带 `workspaceId` 的远端分享包、保存 endpoint/token/workspace、真实 GET 检查、PUT 发布分享包、保存 publicUrl、远端 workspace 和远端回执，并通过 `scripts/share-repository-mock-server.js` 验证按 workspace 隔离最近分享包、Bearer token 与错误 token 拒绝，并验证 `MRAppState.getReportPdfExport()` 会生成真正的 PDF 文件头、`.pdf` 文件名、`application/pdf` MIME、本机数据来源、JPEG 作品截图 Image XObject、教师批注标记、`ReportDigest` 本机验真摘要和非空内容，验证 `MRAppState.recordReportExportReceipt()` 和 `getReportExportAuditExport()` 会记录报告 HTML/PDF 导出回执、类型统计、报告验真摘要、文件摘要和可离线审计 HTML，验证 `MRAppState.getReportVerification()` 可重新计算同一份报告的 64 位 SHA-256 摘要，验证 `MRAppState.getReportRepositoryPackage()` 和 `downloadReportRepository()` 会生成包含报告和本机验真摘要的报告仓库 JSON 同步包接口，验证 `MRAppState.configureReportRepositoryRemote()`、`checkRemoteReportRepository()`、`pushReportRepositoryToRemote()` 和 `pullReportRepositoryFromRemote()` 会通过真实本机 HTTP mock server 保存 endpoint/token、携带 Bearer header、GET 检查、PUT 推送报告包、GET 拉取最近报告包、保留教师批注和验真摘要、保存 HMAC-SHA256 签名回执到 `lastSignedReceipt` 和 `signedReceipts` 审计列表、导出回执审计 HTML、跳过同 ID 差异报告且不覆盖本机记录，保存报告冲突审计，支持字段级合并和远端副本另存，并持久化远端报告仓库状态，验证 `MRAppState.updateReportTeacherReview()` 会拒绝空批注、写入批注人/内容、持久化到报告记录并生成本机教师批注审计，验证 `MRAppState.getReportTeacherReviewAuditExport()` 会导出包含动作、批注人、摘要和预览的 HTML 审计页，验证 `MRAppState.getReportHtmlExport()` 和 `getReportPdfExport()` 会在导出中保留教师批注状态和同一份本机验真摘要，验证教师批注变更后报告摘要会随内容变化，验证 `MRAppState.getReportComparison()` 会基于两份本机报告生成平均分、次数和字段级能力差值，验证 `MRAppState.getReportComparisonExport()` 会生成可离线打开并可打印保存 PDF 的报告对比 HTML，验证 `MRAppState.getReportSeries()` 会基于三份本机报告生成报告序列和字段级首末趋势，验证 `MRAppState.recordPracticeResult()` 会保存基础评分证据、五项维度理由和评分服务状态，验证 `MRAppState.recordLearningStage()` 会生成并持久化笔画拆解、创作实践和复习巩固阶段记录，验证任务依赖会在前置未完成时锁定后续任务、完成后解锁下一任务且继续锁定挑战任务，验证 `MRAppState.createPlan()`、`snoozePlanItem()` 和 `completePlanItemReview()` 会生成并持久化学习计划提醒、顺延、复盘状态和待自动同步队列，验证 `MRAppState.getPlanReminderServiceStatus()`、`setPlanReminderServicePreference()` 和 `dispatchPlanReminderNotification()` 会处理浏览器通知支持、权限启用、真实 Notification 调用和重复触发保护，验证 `MRAppState.getPlanCalendarExport()` 会生成包含 `VCALENDAR`、`VEVENT` 和 `VALARM` 的 `.ics` 日历提醒文件，验证 `MRAppState.getPlanRepositoryPackage()`、`importPlanRepositoryPackage()` 和 `checkRemotePlanRepository()` 会生成 JSON 同步包、导入计划并在未配置远端时明确失败，验证 `MRAppState.configurePlanRepositoryRemote()`、`checkRemotePlanRepository()`、`pushPlanRepositoryToRemote()`、`pullPlanRepositoryFromRemote()`、`flushPlanRepositoryAutoSync()` 和 `resolvePlanRepositoryConflict()` 会使用 mock `fetch` 保存 endpoint/token/workspace、携带 Bearer header 和 `X-MR-Workspace-Id` header、检查远端、PUT 推送带 `workspaceId` 的计划包、GET 拉取当前空间计划包、自动同步待同步队列、检测远端冲突且不覆盖本机待同步计划项，将远端冲突计划另存为本机副本，并持久化远端同步状态、当前 workspace 和计划仓库回执审计；同时会启动 `scripts/report-repository-mock-server.js`、`scripts/share-repository-mock-server.js`、`scripts/history-repository-mock-server.js` 和 `scripts/plan-repository-mock-server.js` 临时 HTTP 服务，验证真实 GET/PUT、Bearer token、Workspace header、仓库 receipt、学习档案、作品分享和计划仓库按空间隔离最近包拉取、报告签名回执审计导出、计划仓库回执审计导出和错误 token 拒绝；最后验证 `MRAppState.getPlanDependencyGraph()` 会生成计划节点、依赖边、阻塞和解锁状态，验证 `MRAppState.getPlanCycleStatus()` 和 `createNextPlanCycle()` 会阻止未完成计划伪造下周期、完成后生成下一轮并持久化源计划和新计划关系，并验证 `MRAppState.getPlanExport()` 会生成包含计划 ID、任务项、到期信息、依赖摘要、周期摘要和本机导出边界的离线 HTML。

本轮新增报告仓库 Workspace 验收：`getReportRepositoryPackage()` 输出顶层 `workspaceId` 和 `source.workspaceId`；远端报告 API 配置保存 endpoint/token/workspace；检查、推送和拉取携带 Bearer 与 `X-MR-Workspace-Id`；mock server 按 `report-alpha` / `report-beta` 分桶保存报告包和签名回执；切回原空间能读取原 package；回执审计 HTML 会包含 workspace。

本轮新增报告仓库回执本机校验验收：报告仓库签名回执会按 `sourcePackageId`、`workspaceId`、`repositoryDigest` 和 `acceptedAt` 重算 `receiptDigest`；真实 mock 回执应显示“本机校验通过”，篡改摘要的回执应显示“摘要不匹配”；报告仓库状态、回执列表和回执审计 HTML 都会保留校验状态和重算摘要。
本轮新增报告仓库包摘要验真验收：`getReportRepositoryPackage()` 会生成 `digestAlgorithm` 和 64 位 `packageDigest`；篡改报告仓库 JSON 但保留旧摘要会被导入层拒绝；远端推送、检查和拉取会把 `reportRepository.lastPackageDigest` 持久化到 localStorage。

本轮新增项目仓库 Workspace 验收：主后台远端项目仓库面板新增 `projectRepositoryWorkspace`；项目仓库包输出顶层 `workspaceId`；检查、推送和拉取携带 Bearer 与 `X-MR-Workspace-Id`；mock server 按 workspace 分桶保存项目仓库包、回执和版本历史；回执审计 HTML 会包含 workspace。
本轮新增项目仓库回执本机校验验收：项目仓库回执会按 `sourcePackageId`、`workspaceId`、`repositoryDigest` 和 `acceptedAt` 重算摘要；页面、localStorage 和回执审计 HTML 均显示“本机校验通过”，回执审计 HTML 会保留重算摘要。
本轮新增项目仓库包本机导出验收：主后台项目仓库状态区新增 `projectRepositoryExportButton`、`projectRepositoryExportAudit`、`projectRepositoryExportAuditStatus`、`projectRepositoryExportAuditList` 和 `projectRepositoryExportAuditExport`；Playwright 会真实点击“导出仓库包”，验证下载的 `mr-calligraphy-project-repository-package-v1` JSON 通过结构校验，localStorage 保存包摘要、仓库摘要、文件摘要和回执摘要，HTML 审计页可下载。
本轮新增项目档案差异报告导出回执验收：主后台项目备份区新增 `projectImpactExportAudit`、`projectImpactExportAuditStatus`、`projectImpactExportAuditList` 和 `projectImpactExportAuditExport`；Playwright 会在远端项目仓库版本预览后真实点击“导出差异报告”，验证 HTML 下载、来源包、风险摘要、恢复选择、文件摘要、预览摘要、选择摘要、回执摘要和 HTML 审计页下载。
本轮新增项目档案恢复审计导出回执验收：主后台项目备份区新增 `projectRestoreAuditExportAudit`、`projectRestoreAuditExportAuditStatus`、`projectRestoreAuditExportAuditList` 和 `projectRestoreAuditExportAuditExport`；Playwright 会在远端项目仓库版本恢复后真实点击“导出审计”，验证恢复审计 HTML 下载、文件摘要、审计报告摘要、最近恢复记录摘要、回执摘要和 HTML 回执审计页下载。

本轮新增远端发布 Workspace 验收：主后台和写实后台远端发布面板新增 `mainRemotePublishWorkspace` / `realisticRemotePublishWorkspace`；发布包、manifest、撤销包、回执和回执审计均保留 `workspaceId`；GET / POST / DELETE 携带 Bearer 与 `X-MR-Workspace-Id`；mock server 按 workspace 分桶保存发布回执和重复摘要锁；跨空间回执不会被当前空间误判为发布锁。
本轮新增远端发布回执本机校验验收：发布回执会按 `sceneId`、`workspaceId`、`releaseId`、`packageDigest`、`acceptedAt`、`assetSignatureSummary` 和 `cdnUploadSummary` 重算摘要；撤销回执会按 `direction`、`workspaceId`、`sceneId`、`packageId`、`sourcePackageId`、`releaseId`、`packageDigest`、`acceptedAt`、`revokedAt` 和 `cdnPurgeSummary` 重算摘要；页面、localStorage 和回执审计 HTML 均显示“本机校验通过”。

本轮新增作品分享远端 Workspace 验收：前台远端分享 API 面板新增 `shareRemoteWorkspaceInput`；分享包、撤销包、分享记录远端状态、回执和回执审计均保留 `workspaceId`；GET / PUT / DELETE 携带 Bearer 与 `X-MR-Workspace-Id`；mock server 按 workspace 分桶保存分享包、回执和撤销记录；切换 workspace 后不会读到其他空间的分享包。
本轮新增作品分享回执本机校验验收：发布回执会按 `sourcePackageId`、`workspaceId`、`repositoryDigest`、`publicUrl` 和 `acceptedAt` 重算摘要；撤销回执会额外带 `action: revoke` 与 `shareId` 重算摘要；页面、localStorage 和回执审计 HTML 均显示“本机校验通过”，篡改 `receiptDigest` 会被标记为摘要不匹配。
本轮新增作品分享仓库包摘要验真验收：`getArtworkShareRemotePackage()` 会生成 `digestAlgorithm` 和 64 位 `packageDigest`；远端返回被篡改的分享包会被检查层拒绝；远端推送和检查会把 `shareService.lastPackageDigest` 持久化到 localStorage，发布失败历史会记录失败 PUT 包摘要。
本轮新增学习档案仓库回执本机校验验收：学习档案回执会按 `workspaceId`、`sourcePackageId`、`repositoryDigest` 和 `acceptedAt` 重算摘要；页面、localStorage 和回执审计 HTML 均显示“本机校验通过”，篡改 `receiptDigest` 会被标记为摘要不匹配。
本轮新增学习档案包摘要验真验收：`getHistoryRepositoryPackage()` 会生成 `digestAlgorithm` 和 64 位 `packageDigest`；篡改学习档案 JSON 但保留旧摘要会被导入层拒绝；远端推送、检查和拉取会把 `historyRepository.lastPackageDigest` 持久化到 localStorage。
本轮新增计划仓库包摘要验真验收：`getPlanRepositoryPackage()` 会生成 `digestAlgorithm` 和 64 位 `packageDigest`；篡改计划 JSON 但保留旧摘要会被导入层拒绝；远端推送、检查、拉取和冲突检测会把 `planRepository.lastPackageDigest` 持久化到 localStorage，自动同步失败历史会记录待推送包摘要。
本轮新增前台服务边界状态验收：前台新增 `serviceBoundaryPanel`，页面静态 smoke 会检查 `serviceBoundaryPanel`、`serviceBoundaryStatus` 和 `serviceBoundaryList`；Playwright 手机视口会确认面板可见，并显示“本机真实 / 远端 Adapter / 生产云端”三层边界。
本轮新增后台服务边界状态验收：主后台新增 `mainAdminBoundaryPanel`，写实后台新增 `realisticAdminBoundaryPanel`；页面静态 smoke 会检查两个后台的边界状态和列表，Playwright 手机视口会确认显示“本机编辑 / 前台或演示发布 / 远端 Adapter / 生产后台”。
本轮新增本机后台操作者审计验收：新增 `admin-audit.js`，主后台检查 `mainAdminOperatorPanel`、`mainAdminOperatorName`、`mainAdminOperatorRole`、`mainAdminAuditList` 和 `mainAdminAuditExport`，写实后台检查 `realisticAdminOperatorPanel`、`realisticAdminOperatorName`、`realisticAdminOperatorRole`、`realisticAdminAuditList` 和 `realisticAdminAuditExport`；Playwright 发布用例会读取 `mr-calligraphy-admin-operator-audit-v1`，确认 `snapshot` 与 `publish-local` 记录写入保存后的操作者。
本轮新增本机后台角色权限验收：静态 smoke 会检查 `mainAdminPermissionStatus` 与 `realisticAdminPermissionStatus`；Playwright 新增 `admin reviewer role blocks local write controls`，确认复核角色会禁用主后台和写实后台的坐标编辑、导入、快照、删除、本机发布和远端发布入口，切回编辑角色后写入控件恢复。
本轮新增静态控件处理器覆盖验收：`node scripts/control-inventory.js --check` 会按入口页面扫描实际加载脚本，要求所有真实状态按钮和导出按钮都有 `click`、`submit`、批量 selector 或初始化参数绑定；当前前台 113 个、主后台 53 个、写实演示 3 个、写实后台 34 个真实控件均为 `missingHandler 0`。
本轮新增动态控件处理器覆盖验收：`node scripts/control-inventory.js --check` 会扫描 `script.js`、`main-admin-scene.js`、`realistic-scene.js` 和 `project-archive.js` 中 `document.createElement("button")` 生成的运行时按钮，要求动态按钮有有效状态，并要求真实状态按钮能追踪直接 `click` 或 `data-*` 委托处理器；当前前台 34 个、主后台 8 个、写实场景 4 个运行时按钮均为 `missingHandler 0`。
本轮新增学习动作审计验收：前台新增 `learningActionAudit`、`learningActionAuditStatus`、`learningActionAuditList` 和 `learningActionAuditExport`；状态层会生成 `mr-calligraphy-learning-event-audit-v1`、类型统计、事件列表和 64 位 `auditDigest`；Playwright 前台练习用例会验证讲解、开始练习、保存作品进入审计列表，并下载 HTML 审计页。
本轮新增学习档案批量回执审计验收：前台新增 `historyBatchReceiptTitle`、`historyBatchReceiptExport` 和 `historyBatchReceiptList`；状态层会生成 `mr-calligraphy-history-batch-receipt-audit-v1`、动作统计、回执列表和 64 位 `auditDigest`；Playwright 前台练习用例会验证批量导出、删除、恢复后的回执列表，并下载 HTML 审计页。
本轮新增本机链接复制审计验收：前台新增 `localLinkCopyAudit`、`localLinkCopyAuditStatus`、`localLinkCopyAuditList` 和 `localLinkCopyAuditExport`；状态层会生成 `mr-calligraphy-local-link-copy-audit-v1`、链接类型统计、复制状态统计和 64 位 `auditDigest`；Playwright 前台练习用例会验证本机分享链接、站内报告链接进入审计列表，并下载 HTML 审计页。
本轮新增报告打印回执审计验收：前台新增 `reportPrintAudit`、`reportPrintAuditStatus`、`reportPrintAuditList` 和 `reportPrintAuditExport`；状态层会生成 `mr-calligraphy-report-print-audit-v1`、打印请求回执、报告摘要、回执摘要和 64 位 `auditDigest`；Playwright 前台练习用例会验证打印按钮写入回执、触发浏览器打印请求，并下载 HTML 审计页。
本轮新增报告导出回执审计验收：前台新增 `reportExportAudit`、`reportExportAuditStatus`、`reportExportAuditList` 和 `reportExportAuditExport`；状态层会生成 `mr-calligraphy-report-export-audit-v1`、HTML/PDF 导出回执、报告验真摘要、文件摘要、类型统计和 64 位 `auditDigest`；Playwright 前台练习用例会验证下载报告 HTML、下载原生 PDF、回执持久化和 HTML 审计页下载。
本轮新增报告对比导出回执审计验收：前台新增 `reportComparisonExportAudit`、`reportComparisonExportAuditStatus`、`reportComparisonExportAuditList` 和 `reportComparisonExportAuditExport`；状态层会生成 `mr-calligraphy-report-comparison-export-audit-v1`、前后报告 ID、平均分差、字段差值、文件摘要和 64 位 `auditDigest`；Playwright 前台练习用例会验证导出对比页、回执持久化和 HTML 审计页下载。
本轮新增作品导出回执审计验收：前台新增 `artworkExportAudit`、`artworkExportAuditStatus`、`artworkExportAuditList` 和 `artworkExportAuditExport`；状态层会生成 `mr-calligraphy-artwork-export-audit-v1`、作品仓库 JSON/作品集/课堂评阅表/评阅汇总导出回执、作品数量、评阅数量、文件摘要、包摘要和 64 位 `auditDigest`；Playwright 作品仓库用例会验证四类真实下载、回执持久化和 HTML 审计页下载。
本轮新增学习档案仓库导出回执审计验收：前台新增 `historyRepositoryExportAudit`、`historyRepositoryExportAuditStatus`、`historyRepositoryExportAuditList` 和 `historyRepositoryExportAuditExport`；状态层会生成 `mr-calligraphy-history-repository-export-audit-v1`、JSON 同步包导出回执、练习/作品/报告/阶段数量、包摘要、文件摘要和 64 位 `auditDigest`；Playwright 学习档案仓库用例会验证“导出同步包”真实下载、回执持久化和 HTML 审计页下载。
本轮新增报告仓库导出回执审计验收：前台新增 `reportRepositoryExportAudit`、`reportRepositoryExportAuditStatus`、`reportRepositoryExportAuditList` 和 `reportRepositoryExportAuditExport`；状态层会生成 `mr-calligraphy-report-repository-export-audit-v1`、JSON 同步包导出回执、报告数量、教师批注报告数量、验真数量、包摘要、文件摘要和 64 位 `auditDigest`；Playwright 前台练习用例会验证“导出同步包”真实下载、回执持久化和 HTML 审计页下载。
本轮新增计划提醒回执审计验收：前台新增 `planReminderAudit`、`planReminderAuditStatus`、`planReminderAuditList` 和 `planReminderAuditExport`；状态层会生成 `mr-calligraphy-plan-reminder-audit-v1`、提醒回执、渠道统计、状态统计和 64 位 `auditDigest`；Playwright 前台练习用例会验证本机 Notification 触发、回执持久化和 HTML 审计页下载。
本轮新增计划导出回执审计验收：前台新增 `planExportAudit`、`planExportAuditStatus`、`planExportAuditList` 和 `planExportAuditExport`；状态层会生成 `mr-calligraphy-plan-export-audit-v1`、HTML/ICS 导出回执、文件摘要、类型统计和 64 位 `auditDigest`；Playwright 前台练习用例会验证“导出计划”和“导出日历”真实下载、回执持久化和 HTML 审计页下载。
本轮新增计划仓库导出回执审计验收：前台新增 `planRepositoryExportAudit`、`planRepositoryExportAuditStatus`、`planRepositoryExportAuditList` 和 `planRepositoryExportAuditExport`；状态层会生成 `mr-calligraphy-plan-repository-export-audit-v1`、JSON 同步包导出回执、计划数量、包摘要、文件摘要和 64 位 `auditDigest`；Playwright 计划仓库用例会验证“导出同步包”真实下载、回执持久化和 HTML 审计页下载。
本轮新增复盘导出回执审计验收：前台新增 `reviewExportAudit`、`reviewExportAuditStatus`、`reviewExportAuditList` 和 `reviewExportAuditExport`；状态层会生成 `mr-calligraphy-review-export-audit-v1`、作品图片/复盘证据/学习报告/作品分享页导出回执、文件摘要、类型统计和 64 位 `auditDigest`；Playwright 前台练习用例会验证四类复盘导出真实下载、回执持久化和 HTML 审计页下载。
本轮新增学习档案详情操作回执审计验收：前台新增 `historyDetailActionAudit`、`historyDetailActionAuditStatus`、`historyDetailActionAuditList` 和 `historyDetailActionAuditExport`；状态层会生成 `mr-calligraphy-history-detail-action-audit-v1`、图片下载/报告下载/链接复制回执、文件或链接摘要、操作统计和 64 位 `auditDigest`；Playwright 前台练习用例会验证作品详情与报告详情的真实操作、回执持久化和 HTML 审计页下载。

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

- 前台主房间、主后台和写实后台会采样 WebGL canvas 像素，确认画布不是空白 DOM；手机视口还会检查前台服务边界面板、两个后台服务边界面板、本机操作者审计面板和权限摘要，显示本机真实、本机编辑、本机审计、远端 Adapter、生产云端/生产后台未接入状态。
- 前台在真实 canvas 书写后点击“保存作品”，确认本机学习状态写入作品和已保存练习，并确认本机学习动作审计列表记录讲解、开始练习和保存作品且可下载 HTML 审计页；复盘面板会下载作品图片、复盘证据、学习报告和作品分享页并写入复盘导出回执，可下载复盘导出回执审计 HTML；学习档案详情会下载作品图片、复制直达链接、下载报告 HTML 并写入详情操作回执，可下载详情操作审计 HTML；生成学习计划后模拟本机 Notification 授权，触发逾期计划项提醒并下载提醒回执审计 HTML；进入学习档案后会选择本页记录、导出所选、批量删除、恢复回收站，并下载学习档案批量回执 HTML，确认包含删除、恢复和审计摘要；随后导出 WebM 回放视频，确认写入本机视频队列、导出记录、生成 PNG 封面并可下载封面；再模拟浏览器不支持录制触发失败任务，恢复录制能力后点击“重试”并确认再次下载 WebM；生成本机分享链接后复制链接并写入本机链接审计，随后配置远端分享 API，确认真实 GET/PUT/DELETE、带 `digestAlgorithm` 和 `packageDigest` 的分享包、`lastPackageDigest` 持久化、publicUrl、远端撤销、回执持久化、回执审计列表和 HTML 回执下载；打开站内报告后复制报告直达链接，下载报告对比页并写入报告对比导出回执，下载报告 HTML 与原生 PDF 写入报告导出回执，点击“打印 / 保存 PDF”写入打印回执并触发浏览器打印请求，再分别下载本机链接复制审计 HTML、报告对比导出回执审计 HTML、报告导出回执审计 HTML 和报告打印回执审计 HTML。
- 前台远端分享失败恢复用例会模拟 401、非法 JSON、PUT 422、网络中断、页面内超时、恢复发布、DELETE 409 和恢复撤销，确认 `shareService.remoteFailureHistory`、`remoteRetryAfter`、发布/撤销包摘要、失败 PUT 包摘要、按钮“重试发布/重试撤销”和回执本机校验都是真实状态。
- 前台作品仓库用例会从作品集 UI 点击“导出仓库”下载 `mr-calligraphy-artwork-repository-*.json`，确认包内包含作品、关联练习、评分证据、截图、边界说明、`digestAlgorithm` 和 `packageDigest`，并写入“作品仓库 JSON”导出回执；随后篡改作品标题但保留旧摘要，确认“导入仓库”拒绝摘要不匹配包且本机作品仍为空；再通过文件选择器导入原包恢复作品和关联练习，确认 `artworkRepository` 状态、摘要、作品卡片和 localStorage 都真实更新；再次导入同 ID 差异包时会显示作品仓库冲突审计，点击“另存导入副本”后作品集新增副本且原作品不被覆盖；随后点击“导出作品集”下载 `mr-calligraphy-artwork-collection-*.html`，确认 HTML 包含真实作品内容、离线作品集边界和 `ArtworkCollection: yes` 标记，并写入作品导出回执；再点击“导出评阅表”下载 `mr-calligraphy-classroom-review-*.html`，确认 HTML 包含教师分数、评阅 JSON 导出、`digestAlgorithm`、`packageDigest`、本机课堂评阅边界和 `ClassroomReview: yes` 标记，并写入作品导出回执；最后通过“导入评阅”先选择被篡改但未重算摘要的 `mr-calligraphy-classroom-review-notes-v1` JSON，确认摘要校验失败且作品卡片未回写评阅，再导入原包确认评阅回写到作品卡片和 localStorage，并跳过不存在的作品 ID；导入后点击“评阅汇总”下载 `mr-calligraphy-classroom-review-summary-*.html`，确认汇总包含教师均分、批注、digest 和 `ClassroomReviewSummary: yes` 标记，随后下载作品导出回执审计 HTML。
- 前台点击“导出报告”，确认下载 HTML 报告、写入报告记录，并能通过 `?report=报告ID` 打开站内报告。
- 站内报告点击“下载 PDF”会产生 PDF 下载，并读取文件确认包含能力雷达图标记、分数趋势图标记和最近作品截图 Image XObject。
- 站内报告点击“导出同步包”会产生报告仓库 JSON 下载，并写入报告仓库导出回执，可下载报告仓库导出回执审计 HTML；点击“导入同步包”会通过文件选择器导入 JSON 包，并把报告和教师批注写入本机学习状态。
- 站内报告填写本机教师批注并选择角色后，确认批注人、角色、内容、批注摘要和本机签名摘要写入 `ReportRecord`，审计 HTML 和 PDF 注释保留同一份签名摘要，刷新页面后仍能复现，并可清除回到空批注状态。
- 站内报告配置远端 endpoint/token/Workspace 后，用浏览器路由模拟报告仓库 API，覆盖检查远端、推送带 `workspaceId`、`digestAlgorithm` 和 `packageDigest` 的报告包、`X-MR-Workspace-Id` header、Bearer token、远端 packageId 和 `lastPackageDigest` 持久化、签名回执 workspace 持久化、回执审计 HTML 导出、拉取当前空间远端包后摘要保留、教师批注和本机验真摘要随包同步，并验证同 ID 差异报告会出现冲突审计且可按字段合并。
- 前台学习档案点击“导出同步包”，确认下载 `mr-calligraphy-history-repository-*.json`，并写入学习档案仓库导出回执，可下载学习档案仓库导出回执审计 HTML；随后配置远端 endpoint/token/Workspace 后，用浏览器路由模拟学习档案仓库，覆盖检查远端、推送带 `workspaceId`、`digestAlgorithm` 和 `packageDigest` 的档案包、`X-MR-Workspace-Id` header、Bearer token、远端 packageId 和 `lastPackageDigest` 持久化、拉取远端包后摘要保留、分页第二页自动追取、冲突审计面板、字段级合并表单和 `historyRepository` 状态更新。
- 前台生成学习计划后点击“导出日历”，确认下载 `.ics` 文件，并读取内容确认包含 `VCALENDAR`、`VEVENT`、`VALARM` 和计划任务标题。
- 前台生成学习计划后点击“导出同步包”，确认下载 `mr-calligraphy-plan-repository-*.json`，并写入计划仓库导出回执，可下载计划仓库导出回执审计 HTML；随后配置远端 endpoint/token/Workspace 后，用浏览器路由模拟计划仓库 API，覆盖推送带 `workspaceId`、`digestAlgorithm` 和 `packageDigest` 的计划包、`X-MR-Workspace-Id` header、Bearer token、远端 packageId、`lastPackageDigest` 持久化、回执持久化、回执本机校验、回执审计 HTML 导出、失败队列包摘要和冲突拉取不覆盖本机计划。
- 主后台新增基础物体前会保存本机编辑角色操作者，新增后检查发布差异，点击“发布到前台”，确认草稿、发布快照、差异归零、前台读取来源和 `mr-calligraphy-admin-operator-audit-v1.scopes.mainScene` 里的 `snapshot` / `publish-local` 审计都是真实本机状态；另有复核只读用例确认主后台写入控件会被禁用。
- 主后台项目仓库配置远端 endpoint/token/Workspace 后，用浏览器路由模拟项目仓库 API，覆盖检查远端、推送项目仓库包、拉取远端包进入导入预览、远端版本来源摘要、恢复风险说明、差异报告 HTML 中的 workspace 与 packageDigest、Bearer token、`archive` / `projectSchema` / `repository` / `packageDigest`、回执持久化、回执本机校验和回执审计 HTML 下载。
- 主后台项目仓库失败反馈用例覆盖 401、非 JSON、无项目包、PUT 422 和网络中断，确认错误写入 `lastError`，并确认本机项目布局不会被失败远端清空。
- 主后台导入真实 `.glb` 模型后更新主色调、透明度、粗糙度、金属度和 PNG 贴图，确认 `mr-calligraphy-main-scene-layout-v1.importedModels[*].color/opacity/roughness/metalness/texture` 写入草稿，贴图二进制写入 IndexedDB，发布差异显示具体材质与贴图字段，发布后进入 `mr-calligraphy-main-scene-published-v1`，普通前台发布布局读取该外观并通过 WebGL textured mesh 加载；同一用例还会构造一个真实 IndexedDB 孤立贴图，点击“清理孤立贴图”后确认孤立贴图删除、当前草稿贴图和已发布贴图仍保留。
- 主后台导入真实 `.glb` 模型后替换为另一个 `.glb`，确认原对象 ID 保持不变，`fileName/sha256/metrics` 更新，发布后进入 `mr-calligraphy-main-scene-published-v1`，普通前台发布布局也读取替换后的资产摘要。
- 主后台导入真实 `.glb` 模型后删除，确认 `mr-calligraphy-main-import-audit-v1` 写入模型 ID、SHA-256、文件大小、历史快照引用和清理结果，刷新后仍可查看；历史保留文件可通过“清理历史文件”从 `mr-calligraphy-main-model-store/models` 删除，并可下载 HTML 删除审计。
- 主后台配置远端发布 endpoint/token 后，用浏览器路由模拟远端 API，覆盖检查远端、提交审核、通过审核、推送发布包、显示回执、本机校验发布/撤销回执、写入 `mr-calligraphy-remote-publish-v1` 和导出回执审计 HTML。
- 写实后台保存本机编辑角色操作者后连续发布、修改坐标、检查发布差异并回滚旧版本，确认 `mr-calligraphy-realistic-published-v1` 会记录发布版本列表和回滚动作，`mr-calligraphy-admin-operator-audit-v1.scopes.realisticScene` 会记录 `snapshot` / `publish-local` 操作；另有复核只读用例确认写实后台写入控件会被禁用。
- 写实后台导入真实 `.glb` 模型后更新主色调、透明度、粗糙度、金属度和 PNG 贴图，确认 `mr-calligraphy-realistic-layout-v1.importedModels[*].color/opacity/roughness/metalness/texture` 写入草稿，贴图二进制写入 IndexedDB，发布差异显示具体材质与贴图字段，发布后进入 `mr-calligraphy-realistic-published-v1`，写实演示页发布布局也读取该外观；同一用例还会构造一个真实 IndexedDB 孤立贴图，点击“清理孤立贴图”后确认孤立贴图删除、当前草稿贴图和已发布贴图仍保留。
- 写实后台导入真实 `.glb` 模型后替换为另一个 `.glb`，确认原对象 ID 保持不变，`fileName/sha256/metrics` 更新，发布后进入 `mr-calligraphy-realistic-published-v1`，写实演示页发布布局也读取替换后的资产摘要。
- 写实后台导入真实 `.glb` 模型后软删除并恢复，确认 `mr-calligraphy-realistic-import-audit-v1` 写入模型 ID、SHA-256、文件大小、软删除结果和恢复动作，刷新后仍可查看，并可下载 HTML 删除审计。

如果项目已经由本地服务器启动，也可以复用当前地址：

```bash
PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e
```

## 通过标准

命令应输出：

```text
Smoke test 通过：26 个脚本，4 个页面。
```

如果任一脚本语法失败、页面无法访问、HTTP 状态不是 2xx，或页面缺少关键标记，命令会以非 0 状态退出。

## 当前边界

- 轻量 smoke test 不会打开真实浏览器；WebGL 非空渲染由 Playwright 像素采样覆盖。
- Playwright 已覆盖首批真实交互闭环、前台学习详情总结、前台服务边界状态、前台学习动作审计导出、复盘导出回执审计导出、学习档案详情操作回执审计导出、计划提醒回执审计导出、计划导出回执审计导出、计划仓库导出回执审计导出、学习档案仓库导出回执审计导出、报告仓库导出回执审计导出、项目档案导出回执审计导出、学习档案批量回执审计导出、本机链接复制审计导出、报告打印回执审计导出、后台服务边界状态、本机后台操作者审计、本机后台角色权限门控、核心入口移动端视口验收、作品仓库本机导入导出、包摘要验真和冲突审计、作品集离线 HTML 导出、课堂评阅表 HTML 导出、课堂评阅 JSON 导入回写和摘要验真、课堂评阅汇总 HTML 导出、作品导出回执审计导出、远端分享 API adapter、作品分享远端失败恢复、作品分享远端撤销和回执审计导出、书写视频 WebM/PNG 封面导出、本机队列和失败重试、报告教师批注角色与本机签名摘要、学习档案远端同步、主后台项目仓库远端版本恢复风险预览、主后台远端发布回执与本机校验、主后台导入模型主色调/透明度/PBR/发布差异明细/文件替换/贴图替换/孤立贴图清理、主后台导入模型删除审计和历史文件本机清理、写实导入模型主色调/透明度/PBR/发布差异明细/文件替换/贴图替换/孤立贴图清理、写实导入模型软删除审计、写实导入模型已删除文件本机清理和写实发布历史源码；测试仍未覆盖所有下载、服务端资产回收、不可篡改服务端审计和完整移动设备矩阵。
- 本轮 Playwright 额外覆盖主后台项目仓库包本机导出、包结构校验、导出回执持久化和仓库包审计 HTML 下载。
- 当前本机已经可以运行定向 Playwright 用例；若换到缺少 npm 依赖的新环境，需要先在具备代理认证的环境执行 `npm install`。
