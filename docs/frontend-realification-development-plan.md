# 前端操作界面真实化开发文档

日期：2026-06-11  
适用版本：5.16 恢复线后的当前 `main` 分支  
当前本地入口：`http://localhost:41496/`、`http://localhost:41496/main-admin.html`、`http://localhost:41496/realistic-demo.html`、`http://localhost:41496/realistic-admin.html`

最新专项审计：[`docs/2026-06-12-current-version-realification-audit.md`](2026-06-12-current-version-realification-audit.md)。该文档专门回答“当前版本哪些功能不完善、哪些前端入口看起来像假的、后续如何真实化”。

## 1. 后台控制页面

当前项目有两个后台控制页面：

| 页面 | 地址 | 作用 | 当前真实边界 |
| --- | --- | --- | --- |
| 主场景后台 | `http://localhost:41496/main-admin.html` | 编辑主场景对象、图层、灯光、导入模型、项目档案、主场景发布和远端发布包 | 真实改写本机 `localStorage` / `IndexedDB`，并能发布到本机前台；不是账号后台 |
| 写实样张后台 | `http://localhost:41496/realistic-admin.html` | 编辑写实 3D 样张、导入模型、保存快照、发布到写实演示和远端发布包 | 真实改写本机写实场景状态，并能发布到本机演示页；不是服务端 CMS |

前台页面是 `http://localhost:41496/`，写实演示页是 `http://localhost:41496/realistic-demo.html`。

## 2. 我对当前版本的判断

这一版已经不是早期纯静态 Demo。前台已有本机学习状态、书写画布、作品保存、学习档案、档案远端 API adapter、报告、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、报告冲突审计、PDF/HTML/WebM/JSON 导出、学习计划、计划提醒边界、远端计划 API adapter、服务端合同和本机 mock 服务；主后台和写实后台已有对象编辑、模型导入、保存历史、本机发布、回滚、项目档案、远端发布包预检、审核锁和资产清单。

但它还不是一个真实可交付产品。最大问题不是“按钮没有绑定”，而是“按钮看起来像生产功能，实际只是本机原型能力”。用户看到 AI、评分、分享、同步、发布、后台这些词时，会自然期待账号、后端、权限、云端数据和端到端稳定性；当前很多地方还只做到本机状态或文件导出。

后续开发的重点不是继续堆演示按钮，而是把每个控件变成可验证的业务动作：有数据来源、有写入、有失败反馈、有刷新后复现、有测试覆盖。

## 3. 当前控件状态审计

本次审计运行：

```bash
node scripts/control-inventory.js --check
```

当前结果：

| 来源 | `real-local` | `real-export` | `real-published-local` | `demo-content` | `disabled` | 缺失/非法 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `index.html` | 67 | 14 | 0 | 0 | 0 | 0 |
| `main-admin.html` | 37 | 4 | 1 | 0 | 0 | 0 |
| `realistic-demo.html` | 3 | 0 | 0 | 0 | 0 | 0 |
| `realistic-admin.html` | 22 | 1 | 1 | 0 | 0 | 0 |
| `script.js dynamic` | 29 | 1 | 0 | 0 | 1 | 0 |

结论：入口 HTML 和前台动态控件已经没有明显的 `demo-content` 假按钮。现在要治理的是更深一层的真实度：标为 `real-local` 的按钮，必须清楚说明它只是本机真实，不是云端真实。

## 4. 当前不够完善的功能

### 4.1 前台学习产品

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 学习路径 | 步骤导航、热点路由、阶段记录、本机任务进度已有第一版；本机 `LearningPathService` 已用任务、练习、作品、报告和计划推导 10 步标题、说明、完成状态、证据和下一步动作 | 还不是云端课程编排、教师下发任务或跨设备学习进度；视觉场景仍保留静态兜底 | 后续扩展课程包、教师端排课、班级进度和跨设备同步 |
| AI 讲解 | 浏览器本机语音能朗读讲解段落；本机 `LectureService` 会记录语音能力、播放段落、文本降级、失败和完成状态 | 不是云端 AI 音频，也不是按真实笔迹实时生成 | 保留本机语音 fallback，后续在同一讲解服务接口扩展云端 AI 音频/文本 |
| 书写练习 | 鼠标/触控笔迹、撤销、清空、回放、保存和基础评分可用；本机 `ScoreService` 会记录评分来源、算法版本、最近证据摘要、累计评分次数和采样点 | 缺压感、笔锋、笔画顺序模型、硬件适配和专业评分模型 | 继续扩展范字路径库、笔画顺序校验、压感字段和服务端评分来源 |
| 学习计划 | 计划生成、编辑、顺延、复盘、依赖图、周期循环、本机提醒、JSON 同步包、远端 API 推送/拉取、API 合同、本机 mock 服务、自动同步队列、冲突检测、三策略冲突解决、字段级合并和推送失败保队列已有第一版 | 还没有账号登录、托管计划仓库、远端推送提醒和教师端通知 | 做账号化 repository、服务端合并策略、跨设备提醒和教师端视图 |
| 学习档案 | 本机历史、详情路由、回收站、趋势、作品集、标签编辑、导出、远端 API 推送/拉取、`nextPageUrl` 分页自动追取、同 ID 冲突审计、字段级合并、远端冲突另存副本、API 合同和本机 mock 服务已有第一版 | 还没有账号登录、托管档案仓库、生产级分页查询、长期归档和服务端教师批注审计 | 做账号化 history repository、云端详情 URL、服务端合并审计和长期归档 |

### 4.2 作品、报告和分享

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 保存作品 | 能保存笔迹、截图、评分、标签和作品对比 | 作品只在当前浏览器可见 | 增加作品 repository、公开作品集和课堂评阅入口 |
| 视频导出 | 可从真实笔迹导出 WebM 回放 | 不是 MP4/GIF，没有封面、压缩和异步队列 | 增加转码 adapter、封面图、导出队列和失败重试 |
| 报告导出 | HTML 报告、原生 PDF、PDF 最近作品 JPEG 截图嵌入、报告对比、多报告趋势、字段交互、本机教师批注、本机验真摘要、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、同 ID 冲突审计、字段级合并和远端副本另存已有第一版 | 仍主要是本机报告；本机 JSON 包只是手动备份/迁移，远端报告仓库只是用户配置 endpoint 的真实 GET/PUT，还没有账号教师端、服务端签名证书、不可篡改审计和服务端 PDF 生成 | 增加账号化 ReportRepository、服务端保存、教师身份审计、服务端验真签名、PDF 趋势图/雷达图位图和服务端 PDF 渲染验收 |
| 分享成果 | 可导出离线 HTML 分享页；可生成、复制、访问和撤销当前浏览器内的本机分享链接 | 没有公网公开链接、社群分享或课堂发布 | 离线导出保持 `real-export`，本机分享服务标记 `real-local`；后续增加生产公开分享服务和权限控制 |

### 4.3 主后台和写实后台

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 主后台编辑 | 对象、图层、灯光、基础物体、导入模型、保存快照可用；主后台项目档案区已显示统一 `ProjectRepository` 状态，并可配置远端项目仓库 API 真实 GET/PUT，支持拉取远端包进入恢复预览 | 保存范围主要是当前浏览器，远端 adapter 还不是账号协作后台 | 继续接账号化项目 repository、多人合并和服务端资产签名 |
| 写实后台编辑 | 写实对象、相机、导入模型、快照、发布到演示可用；已纳入 `project-scene-repository-v1` 统一视图 | 和主后台对象 schema 仍有字段差异 | 继续统一字段迁移、完整 diff 和资产引用规则 |
| 本机发布 | 主后台发布到前台，写实后台发布到演示，支持历史、差异、回滚 | 只是本机发布，不是线上部署 | UI 保持“本机发布”；线上发布必须走远端发布合同 |
| 远端发布 | 可配置 endpoint/token，生成发布包、manifest、资产清单，预检、审核锁、POST 推送、服务端回执持久化和 HTML 审计导出已有第一版 | 还不是账号权限、CDN 托管、服务端审批和不可篡改审计 | 增加生产服务端账号权限、远端审核状态、资产签名、CDN 回执和不可篡改审计日志 |
| 项目档案 | JSON 导出/导入、schema、迁移、字段恢复、模型哈希、恢复审计、统一项目仓库状态、远端项目仓库 API adapter、拉取预览、API 合同和本机 mock 服务可用 | 三方合并、完整 JSON 树、账号权限和远端资产校验仍弱 | 增加账号化服务端 repository、多人冲突解决和远端资产完整性校验 |
| 后台权限 | 已显示“本机静态后台”风险提示 | 任何能打开页面的人都能编辑本机内容 | 后端版加入账号、角色、权限和操作审计 |

## 5. 最像“假的”的界面来源

| 问题来源 | 用户感受 | 治理方式 |
| --- | --- | --- |
| 高预期词汇 | “AI 讲解”“发布”“同步”“分享”容易被理解成云端能力 | 文案必须加边界：本机语音、本机发布、本机同步包、远端 API adapter |
| 静态叙事残留 | 学习路径第一版已接入 `LearningPathService`，但视觉场景和少量标签仍保留静态兜底 | 继续用真实课程包、教师排课、练习、作品、报告、计划项替换剩余兜底内容 |
| 本机真实被误认为生产真实 | 按钮可点，但只写 localStorage/IndexedDB | 控件状态保留 `real-local`，并在状态区说明保存范围 |
| 远端 adapter 仍缺生产服务 | endpoint、接口文档、mock 服务、回执审计和本机项目仓库状态已能真实验收，但用户可能以为已经部署上线 | 下一步接账号化托管仓库、服务端合并、权限和失败反馈 |
| 测试不足 | smoke test 只能证明页面存在，不能证明复杂交互都能用 | 补 Playwright 和数据层测试，覆盖端到端闭环 |

## 6. 控件真实化定义

一个控件只有满足下面条件，才能标为真实能力：

| 条件 | 必须回答的问题 |
| --- | --- |
| 数据来源 | 读取哪个 state、storage key、IndexedDB store、文件或 API |
| 执行动作 | 调用哪个函数，写入哪些字段，或生成什么文件 |
| 成功反馈 | 页面哪块变化、哪个文件下载、哪个版本增加 |
| 失败反馈 | 缺数据、权限不足、浏览器不支持、网络失败时怎么提示 |
| 持久化 | 刷新、切页、导入、回滚后能否复现 |
| 验收 | 哪个脚本或手工步骤能证明它不是只改文案 |

状态标记规则：

| 状态 | 含义 |
| --- | --- |
| `real-local` | 当前浏览器本机真实可用，刷新可保留，但不跨设备 |
| `real-export` | 会生成真实文件产物，如 HTML、JSON、PDF、WebM |
| `real-published-local` | 发布到本机前台或本机演示快照 |
| `demo-content` | 内容来自演示素材或静态剧本，不能伪装成真实数据 |
| `disabled` | 尚未接入，不允许出现成功反馈 |

## 7. 真实化优先级

### P0：消灭假成功

目标：用户点击后不能被误导。

- 所有高预期按钮的文案写清楚本机、导出、远端 adapter 或暂不可用。
- 禁止新增只弹出成功提示、不写状态、不导出文件、不请求 API 的按钮。
- 删除、覆盖、发布、拉取这类高风险动作要有明确影响预览和失败反馈。
- 每次提交前运行 `node scripts/control-inventory.js --check`。

### P0：补后台真实边界

目标：后台页面不能让用户误以为是线上 CMS。

- `main-admin.html` 和 `realistic-admin.html` 保留本机权限风险提示。
- “发布到前台/演示”继续标为本机发布。
- 远端发布 API 面板已有服务端合同文档、mock endpoint、回执持久化和回执审计导出第一版；后续补账号权限和服务端签名。
- 审核与发布锁从本机状态升级为远端校验状态。

### P1：把学习状态从本机原型升级为可同步业务

目标：学习计划和学习档案不再只靠单浏览器。

- 继续推进账号化计划 repository；计划 API 合同、mock 服务、自动同步队列、冲突检测和手动解决 UI 第一版已完成。
- 增加账号化计划 repository、学习档案 repository 和报告 repository；学习档案远端 API adapter、报告仓库远端 API adapter、合同和 mock 服务第一版已完成。
- 增加跨设备提醒、教师端通知和远端任务下发。
- 拉取远端数据时不得静默覆盖本机待同步修改。

### P1：把评分和报告做成可解释产物

目标：评分不再像固定模板，报告能被复盘和验证。

- 评分结果显示证据点、覆盖范围、重心、停顿、压感和维度理由；本机 `ScoreService` 已记录并展示最近评分证据摘要。
- 原生 PDF 继续增强趋势图/雷达图、报告 ID 和服务端验真回执；最近作品 JPEG 截图嵌入、本机验真摘要、报告仓库远端 API adapter 和本机冲突审计第一版已完成。
- 报告 schema 固定版本，继续支持账号化服务端保存、教师批注和签名审计。
- 分享页和报告页必须带本机/云端来源说明。

### P2：补浏览器级验收

目标：避免“看起来能点，实际不能用”的回归。

- Playwright 覆盖前台书写保存、报告导出、主后台发布、写实后台回滚。
- 增加 WebGL canvas 非空像素检查。
- 增加移动端视口检查，避免后台面板和按钮重叠。
- 下载类功能检查文件名、MIME 和关键内容。

## 8. 下一批建议开发顺序

1. 给计划 repository、学习档案 repository、报告 repository、项目仓库 repository 和远端发布 adapter 继续补生产服务端实现，明确账号权限、服务端合并、分页、资产签名和不可篡改审计字段；远端发布的服务端锁 / 最近回执预检第一版已完成。
2. 继续扩展主后台和写实后台统一项目仓库：字段迁移、完整 diff、账号化保存和多人协作接口。
3. 补 Playwright 可运行环境并扩展端到端用例。
4. 开始账号化 repository 设计，把计划、档案、作品、报告从本机状态抽象成可替换数据源。
5. 学习计划冲突解决已补字段级合并第一版，后续继续补计划项增删、依赖链和服务端合并审计。

## 9. 2026-06-12 远端发布回执真实化

本次把后台“远端发布 API”的成功回执从合同字段升级为真实可见能力。

已完成：

- `MRProjectRemotePublish.push()` 现在会解析服务端 `receipt`，并把回执审计写入 `mr-calligraphy-remote-publish-v1.scenes[*].receipts`。
- `getStatus()` 会返回 `latestReceipt`、`receiptCount` 和 `receipts`，后台不用直接读取底层 storage。
- 新增 `getReceiptAudit()` 和 `getReceiptAuditExport()`，可生成离线 HTML 审计页。
- 主后台和写实后台新增“回执审计”区域，显示最近远端回执，并提供“导出回执”真实下载。
- `remote-publish-check.js` 新增回执持久化、回执导出、mock 服务 receipt 回写断言。
- smoke test 新增两个后台的回执审计 DOM 标记。

仍然不是生产能力的部分：

- 回执审计当前保存在本机浏览器，不能替代服务端不可篡改审计。
- endpoint 由用户手动配置；没有账号、角色、远端审批、CDN 部署和资产签名服务。
- 后续需要让服务端保存完整审计链，并返回签名 receipt / CDN asset receipt。

## 9.1 2026-06-12 远端发布服务端锁预检

本次把远端发布按钮从“只靠本机锁防重复”推进到“推送前读取服务端锁和最近回执”。

已完成：

- `MRProjectRemotePublish.push()` 在 `POST` 前先 `GET` 当前 endpoint。
- `GET` 响应里的 `publishLock` 或 `latestReceipt` 如果命中当前 `releaseId` / `packageDigest`，前端会阻止 `POST`。
- 命中服务端锁会写入本机远端发布锁状态，后台面板继续显示发布锁保护。
- 远端普通 `422` / 网络失败不再遗留“正在推送”的临时本机锁。
- mock server 的 `GET` 会返回最近回执和 `publishLock`，专项脚本覆盖真实 HTTP 预检。

仍然不是生产能力的部分：

- 服务端账号、远端审批、资产签名、CDN 托管和不可篡改审计仍未接入。
- 本机“解除发布锁”只能清本机锁；如果服务端仍返回锁，下一次推送仍会被预检阻止。

## 10. 2026-06-12 报告教师批注真实化

本次把“教师批注”从后续规划补成一个本机真实闭环。

已完成：

- `ReportRecord` 新增 `teacherReview`，包含批注人、批注内容、批注时间和来源。
- `MRAppState.updateReportTeacherReview()` / `clearReportTeacherReview()` 会真实写入或清除当前报告批注。
- 新增 `getReportHtmlExport()`，HTML 报告导出不再只能通过下载副作用验证。
- 站内报告新增教师批注表单，保存后刷新可复现，清除后回到空状态。
- HTML 报告和原生 PDF 都会包含教师批注状态；PDF 增加 `TeacherReview` 可测标记。
- `learning-state-check.js` 覆盖空批注拒绝、批注持久化、HTML 导出和 PDF 导出。
- 学习档案同步包会统计 `teacherReviewedReportCount`，并随 `records.reports[*].teacherReview` 同步本机教师批注。

仍然不是生产能力的部分：

- 这是本机教师批注，不是账号化教师端，也没有服务端审计、服务端签名验真或课堂权限。
- 后续需要把报告仓库、教师身份、批注审计和云端长期报告接到服务端。

## 11. 验收命令

提交前至少运行：

```bash
node --check app-state.js
node --input-type=module --check < script.js
node scripts/control-inventory.js --check
node scripts/learning-state-check.js
node scripts/project-schema-check.js
node scripts/remote-publish-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
git diff --check
```

如果改动涉及 3D 画布、后台发布或下载功能，还要补 Playwright 或等价浏览器级验收。

## 12. 2026-06-12 当前版本真实化审计

本次新增专项审计文档：[`docs/2026-06-12-current-version-realification-audit.md`](2026-06-12-current-version-realification-audit.md)。

完成内容：

- 明确当前版本的后台入口、前台入口、写实演示入口和各自真实边界。
- 汇总当前最不完善的能力：本机真实和生产真实混淆、学习路径仍缺云端课程引擎、本机语音不等于 AI 服务、启发式评分不等于专业模型、本机教师批注不等于教师端、导出分享不等于公开链接、后台不等于账号化 CMS、远端 adapter 不等于生产后端、Playwright 覆盖不足。
- 重新记录控件清单结果，确认当前缺失/非法标记为 0，并指出下一步应验证 `real-local` 的真实边界。
- 固化“假界面真实化标准”：数据来源、执行动作、成功反馈、失败反馈、持久化、自动验收和边界说明。
- 给出 P0-P3 的真实化开发路线，便于后续长期开发逐项落地。

真实化说明：

- 数据来源：当前仓库 HTML、脚本、已有开发文档、控件清单脚本和当前本机服务。
- 写入状态：本次只新增文档，不改变运行时学习、后台或发布状态。
- 成功反馈：仓库新增可追踪的专项审计文档，README 和本文档均能跳转。
- 失败反馈：不涉及运行时失败；文档明确指出当前仍缺生产后端、账号权限和更完整浏览器验收。
- 刷新后复现方式：文档保存在仓库 `docs/` 目录，后续提交和拉取都能查看。

验收：

- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增当前版本真实化审计文档`

## 13. 2026-06-12 报告教师批注浏览器验收

本次把报告教师批注从数据层检查扩展到浏览器级真实流程。

完成内容：

- `tests/e2e/real-flows.spec.js` 在前台真实书写、保存作品、导出报告之后，继续打开站内报告详情。
- E2E 会填写批注人和批注内容，点击“保存批注”，断言页面状态显示批注人和批注内容。
- E2E 会读取 `mr-calligraphy-learning-state-v1`，确认 `reports[0].teacherReview` 真实写入批注人和内容。
- E2E 会刷新报告页，确认本机教师批注仍能复现。
- E2E 会点击“清除批注”，确认 UI 回到“暂无本机教师批注”，并确认本机报告记录中的 `teacherReview` 变为 `null`。

真实化说明：

- 数据来源：前台真实 canvas 笔迹、作品记录和生成的 `ReportRecord`。
- 写入状态：批注保存写入 `mr-calligraphy-learning-state-v1.reports[*].teacherReview`；清除批注写回 `null`。
- 成功反馈：报告页状态区显示批注人，批注内容区显示保存的批注文本。
- 失败反馈：没有报告详情时批注输入和按钮禁用；空批注仍由状态层拒绝。
- 刷新后复现方式：E2E 直接刷新 `?report=报告ID` 页面并重新读取批注状态。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`，在已安装 Playwright 依赖和浏览器的环境运行

提交：

- 中文 commit message：`新增报告批注浏览器验收`

## 14. 2026-06-12 WebGL 画布非空验收

本次把“页面有 canvas 标签”升级为“浏览器里真的渲染出非空画面”的验收。

完成内容：

- `tests/e2e/real-flows.spec.js` 新增 `expectCanvasHasVisiblePixels()`。
- 前台主房间 `#roomCanvas` 会被绘制到临时 2D canvas 中采样，确认存在可见像素和像素变化。
- 主场景后台 `#mainAdminCanvas` 增加同样的非空像素检查，避免后台只显示空白画布。
- 写实后台 `#realisticCanvas` 增加同样的非空像素检查，覆盖写实 3D 编辑器。

真实化说明：

- 数据来源：真实浏览器渲染后的 canvas 像素，不再只是 HTML 字符串或 DOM 存在性。
- 写入状态：本次只增加测试，不改写运行时状态。
- 成功反馈：Playwright 会在 canvas 没有可见像素或完全空白时失败。
- 失败反馈：WebGL 不可用、canvas 隐藏、渲染缓冲为空或跨源污染导致无法采样时，测试会超时失败。
- 刷新后复现方式：每次运行 `npm run test:e2e` 都重新打开页面并采样当前画布。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`，在已安装 Playwright 依赖和浏览器的环境运行

提交：

- 中文 commit message：`新增WebGL画布非空验收`

## 15. 2026-06-12 主后台远端发布回执浏览器验收

本次把主后台远端发布回执从数据层脚本扩展到浏览器真实流程。

完成内容：

- `tests/e2e/real-flows.spec.js` 在主后台新增基础物体并完成本机发布后，继续配置远端发布 endpoint/token。
- E2E 使用 `page.route()` 模拟远端发布 API，覆盖 GET 检查和 POST 推送，不依赖真实公网服务。
- E2E 会点击“检查远端”“提交审核”“通过审核”“推送发布包”，断言 UI 显示远端版本和回执条目。
- E2E 会断言 POST body 是 `mr-calligraphy-remote-publish-package-v1`，包含 `sceneId: "mainScene"` 和 `manifest.packageDigest`。
- E2E 会读取 `mr-calligraphy-remote-publish-v1`，确认远端 packageId、remoteVersion 和 receipts 持久化。
- E2E 会点击“导出回执”，确认生成 `mr-calligraphy-mainScene-remote-receipts-*.html` 下载。

真实化说明：

- 数据来源：主后台真实发布快照、远端发布 adapter 生成的发布包、Playwright 模拟的远端 API 响应。
- 写入状态：远端配置、检查结果、推送回执、发布锁和 receipt 审计写入 `mr-calligraphy-remote-publish-v1`。
- 成功反馈：远端状态区显示远端版本，回执区域显示远端 packageId，并可导出审计 HTML。
- 失败反馈：未配置 endpoint、未审核、发布锁和网络失败仍由 adapter 返回明确错误；本用例覆盖通过路径。
- 刷新后复现方式：回执保存在本机远端发布状态中，刷新后台仍可读取。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`，在已安装 Playwright 依赖和浏览器的环境运行

提交：

- 中文 commit message：`新增主后台远端回执浏览器验收`

## 16. 2026-06-12 学习档案远端同步浏览器验收

本次把前台学习档案远端同步从数据层脚本扩展到浏览器真实流程。

完成内容：

- `tests/e2e/real-flows.spec.js` 在真实书写、保存作品、导出报告和报告批注流程之后，继续打开学习档案远端 API 面板。
- E2E 使用同源 `page.route()` 模拟学习档案仓库，覆盖 GET 检查、PUT 推送和再次 GET 拉取。
- E2E 会配置 endpoint/token，点击“保存远端”“检查远端”“推送档案”“拉取档案”。
- E2E 会断言 PUT body 是 `mr-calligraphy-history-repository-v1`，包含 3 条真实档案记录和报告记录。
- E2E 会断言 Bearer token 被发送，并确认 `historyRepository.lastRemoteDirection`、`lastPackageId`、`lastRemoteRecordCount` 写回 `mr-calligraphy-learning-state-v1`。
- 主后台远端发布 E2E 的 mock endpoint 同步改为同源路径，避免真实运行 Playwright 时触发浏览器 CORS 限制。

真实化说明：

- 数据来源：前台真实练习会话、保存作品和生成报告，而不是手工构造的空档案。
- 写入状态：远端配置、推送结果和拉取结果写入 `mr-calligraphy-learning-state-v1.historyRepository`。
- 成功反馈：学习档案仓库状态区显示远端可访问、已推送记录数和已拉取记录数。
- 失败反馈：未配置 endpoint、无 fetch、远端返回非法 JSON 或无档案包时仍由状态层返回明确错误；本用例覆盖通过路径。
- 刷新后复现方式：远端同步状态保存在本机学习状态中，刷新后仍可读取最近方向、packageId 和记录数。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`，在已安装 Playwright 依赖和浏览器的环境运行

提交：

- 中文 commit message：`新增学习档案远端同步浏览器验收`

## 17. 2026-06-12 计划仓库冲突浏览器验收

本次把学习计划远端仓库的冲突处理入口从“看得到按钮”扩展到“浏览器里真实触发、真实解决、真实持久化”的验收。

完成内容：

- `tests/e2e/real-flows.spec.js` 新增计划仓库冲突用例。
- E2E 使用同源 `page.route()` 模拟远端计划 repository，覆盖 GET 检查、PUT 推送和再次 GET 拉取。
- E2E 会在前台生成真实学习计划，配置 endpoint/token，并点击“保存远端”“检查远端”“推送计划”。
- E2E 会断言 PUT body 是 `mr-calligraphy-plan-repository-v1`，包含真实计划 ID，并确认 Bearer token 被发送。
- 推送成功后，E2E 同时修改本机计划项和远端计划包，再点击“拉取计划”，确认页面显示“计划同步冲突”面板。
- E2E 会点击“另存副本”，确认远端冲突计划被复制成本机新计划，冲突字段清空，并进入待同步队列。

真实化说明：

- 数据来源：前台 `MRAppState.createPlan()` 生成的真实 `PlanRecord`，不是空 mock 数据。
- 写入状态：远端配置、推送结果、冲突记录、冲突远端计划和另存副本结果写入 `mr-calligraphy-learning-state-v1.planRepository` 与 `plans`。
- 成功反馈：计划仓库状态区显示已推送、冲突面板显示本机/远端差异，另存后状态区显示远端冲突计划已另存。
- 失败反馈：未配置 endpoint、无 fetch、远端返回非法 JSON、无计划包和冲突未解决时仍由状态层返回明确错误；本用例覆盖冲突通过路径。
- 刷新后复现方式：冲突状态和另存副本都保存在本机学习状态中，刷新后仍可读取计划历史和仓库状态。

仍待补：

- 字段级冲突合并 UI 第一版已完成，后续还需要更复杂的计划项增删、依赖调整和服务端合并审计。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`，在已安装 Playwright 依赖和浏览器的环境运行

提交：

- 中文 commit message：`新增计划仓库冲突浏览器验收`

## 18. 2026-06-12 计划仓库三策略数据层验收

本次继续补计划 repository 的真实化验收，把冲突解决从单一“另存副本”扩展到三种策略都能在可运行脚本里证明。

完成内容：

- `scripts/learning-state-check.js` 在远端计划 API adapter 流程中继续制造计划级冲突。
- “另存副本”已验证：远端冲突计划复制成本机新计划，本机待同步项不被覆盖，冲突字段清空。
- “保留本机”新增验证：冲突后调用 `resolvePlanRepositoryConflict("keep-local")`，会通过远端 PUT 推送本机计划，并清空待同步队列。
- “采用远端”新增验证：冲突后调用 `resolvePlanRepositoryConflict("use-remote")`，会强制拉取远端包，覆盖本机冲突计划，并记录最近同步方向为 `pull`。
- 最终会读取 `mr-calligraphy-learning-state-v1`，确认远端模式、endpoint、packageId、冲突清理、采用远端后的计划标题和计划项都已持久化。

真实化说明：

- 数据来源：真实 `MRAppState` 计划、远端计划包、模拟 fetch 请求和 localStorage 持久化结果。
- 写入状态：保留本机会写回远端 PUT 包；采用远端会写回本机 `plans` 和 `planRepository` 状态。
- 成功反馈：脚本在任一策略没有真实写入、没有清理冲突、没有保留/覆盖正确计划项时会失败。
- 失败反馈：仍保留原有未配置远端、非法 endpoint、远端冲突不静默覆盖等断言。
- 刷新后复现方式：本轮是数据层脚本验收；浏览器刷新复现已由计划仓库 UI 读取同一份 `mr-calligraphy-learning-state-v1` 支撑。

仍待补：

- 字段级冲突合并 UI 第一版已完成，后续还需要覆盖计划项增删、依赖调整和服务端合并审计。
- 计划仓库推送包被服务端 422 结构拒绝、网络中断的浏览器级提示验收已在后续补齐，后续还需超时重试和批量队列失败恢复。

验收：

- `node --check scripts/learning-state-check.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`

提交：

- 中文 commit message：`新增计划冲突三策略验收`

## 19. 2026-06-12 计划仓库三策略浏览器验收

本次把计划同步冲突的三种处理策略全部补到 Playwright 浏览器级用例里，并把本机 Playwright 运行环境修到可执行状态。

完成内容：

- 新增 `package-lock.json`，让 `@playwright/test` 依赖版本可复现。
- 安装 Playwright Chromium 缓存后，`npm run test:e2e -- --grep "front plan repository"` 已能在本机运行。
- `tests/e2e/real-flows.spec.js` 修正初始化逻辑：每个测试只清一次本机 storage，避免 reload / goto 时误删测试中刚生成的计划和报告。
- “另存副本”浏览器用例继续覆盖：生成真实计划、配置远端、推送、制造本机/远端冲突、拉取显示冲突面板、点击“另存副本”、确认本机新增远端副本。
- 新增“保留本机”浏览器用例：点击“保留本机”后，冲突面板消失，本机计划项保留，远端 PUT 包包含本机计划项，待同步队列清空。
- 新增“采用远端”浏览器用例：点击“采用远端”后，冲突面板消失，本机计划标题和计划项被远端包覆盖，最近同步方向记录为 `pull`。
- 修正前台练习 E2E 的真实操作路径：书写画布在当前桌面视口下会露出但不完全可操作，测试现在先滚动到画布再真实绘制笔迹。
- 修正 WebGL 非空检查：前台主房间 WebGL 默认 drawing buffer 通过 `drawImage(canvas)` 可能读到黑屏，测试现在会触发渲染并通过 WebGL `readPixels` 采样。
- 修正主后台远端发布 E2E：先展开“远端发布 API”折叠面板，再填写 endpoint/token；远端版本号改为从本机远端发布状态读取，UI 继续验证服务端可读消息。

真实化说明：

- 数据来源：真实前台页面、真实 `MRAppState.createPlan()` 计划、同源 `page.route()` 模拟的远端 API、localStorage 持久化状态和远端请求体。
- 写入状态：三种按钮都会真实改写 `mr-calligraphy-learning-state-v1.planRepository`；保留本机还会产生新的远端 PUT 请求。
- 成功反馈：Playwright 会同时检查 UI 面板隐藏、状态文案、远端请求、Bearer token、本机计划列表、冲突计数和 pending 队列。
- 失败反馈：测试初始化曾暴露 reload 时误清 storage 的问题；本次已修正，后续报告刷新复现也更可信。
- 刷新后复现方式：测试通过 reload 后再读计划面板和本机状态，确认不是单次内存变量。

代理和依赖说明：

- 本机存在 `HTTP_PROXY` / `HTTPS_PROXY` / `ALL_PROXY`，`curl --proxy "$CODEX_PROXY_URL"` 可访问 npm registry。
- `npm install` 通过清空代理变量直连成功；Playwright 浏览器下载需要同时清空 `ALL_PROXY`。
- 后续如遇同类问题，可使用 `env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY -u all_proxy -u NO_PROXY -u no_proxy npx playwright install chromium`。

仍待补：

- 计划仓库推送包被服务端 422 结构拒绝、网络中断的浏览器级提示验收已在后续补齐，后续还需超时重试和批量队列失败恢复。
- 字段级冲突合并 UI 第一版已完成，后续还需要覆盖计划项增删、依赖调整和服务端合并审计。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "front plan repository"`
- `node --check scripts/learning-state-check.js && node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`，当前 11 条 Playwright 用例全部通过。
- `git diff --check`

提交：

- 中文 commit message：`新增计划冲突三策略浏览器验收`

## 20. 2026-06-12 计划仓库远端失败浏览器验收

本次补齐计划同步仓库的失败路径浏览器级验收，重点验证页面不会把远端错误包装成成功，也不会静默覆盖本机计划。

完成内容：

- `tests/e2e/real-flows.spec.js` 新增 `front plan repository shows real remote failure feedback`。
- E2E 通过 `page.route()` 模拟四类远端异常：token 过期 / 401、服务端故障 / 500、200 但返回非法 JSON、200 但没有返回计划包。
- 每一类异常都会真实配置 endpoint/token，点击前台“检查远端”或“拉取计划”，并同时检查 `#noticeState`、`#planRepositorySummary` 和 `mr-calligraphy-learning-state-v1.planRepository`。
- token 过期路径会断言浏览器请求带上 `Bearer expired-token`，确认不是只在本机假造错误。
- 空计划包路径会先验证“检查远端”可成功保存远端状态，再验证“拉取计划”明确失败为“没有返回可导入的计划包”。

真实化说明：

- 数据来源：真实前台计划同步面板、真实 localStorage 计划仓库状态、同源模拟远端响应和实际 Authorization header。
- 写入状态：失败会写入 `planRepository.lastError`，成功检查空仓库会写入 `lastRemoteStatus` 且保持 `lastError` 为空。
- 成功反馈：只有服务可访问才显示远端可访问；没有计划包时不能假装拉取成功。
- 失败反馈：401、500、非法 JSON、无计划包都会在页面通知和计划仓库摘要中出现明确错误。
- 刷新后复现方式：错误状态保存在 `mr-calligraphy-learning-state-v1.planRepository`，后续刷新仍由同一状态区读取。

仍待补：

- 计划仓库推送包被服务端 422 结构拒绝、网络中断的浏览器级提示验收已在后续补齐，后续还需超时重试和批量队列失败恢复。
- 字段级冲突合并 UI 第一版已完成，后续还需要覆盖计划项增删、依赖调整和服务端合并审计。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "remote failure feedback"`
- `npm run test:e2e -- --grep "front plan repository"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`
- `git diff --check`

提交：

- 中文 commit message：`新增计划仓库失败路径验收`

## 21. 2026-06-12 学习档案远端失败浏览器验收

本次补齐前台学习档案远端 API 的失败路径浏览器级验收，重点验证远端不可用、格式错误或服务端拒收时，页面不会显示假成功，也不会清掉本机档案记录。

完成内容：

- `tests/e2e/real-flows.spec.js` 新增 `front history repository shows real remote failure feedback`。
- E2E 通过 `MRAppState.saveArtwork()` 先生成真实本机练习会话和作品档案，再打开前台学习档案面板。
- E2E 通过 `page.route()` 模拟五类远端异常：token 过期 / 401、服务端故障 / 500、200 但返回非法 JSON、200 但没有返回档案包、PUT 推送被服务端 422 拒收。
- 每一类异常都会真实配置 endpoint/token，点击前台“检查远端”“拉取档案”或“推送档案”，并同时检查 `#noticeState`、`#historyRepositorySummary` 和 `mr-calligraphy-learning-state-v1.historyRepository`。
- 401 和 422 路径会断言浏览器请求带上 Bearer token；422 路径还会断言 PUT body 是 `mr-calligraphy-history-repository-v1`，且包含 2 条真实学习档案记录。

真实化说明：

- 数据来源：前台状态层真实生成的练习会话和作品记录、真实学习档案远端面板、同源模拟远端响应和实际 Authorization header。
- 写入状态：失败会写入 `historyRepository.lastError`，空仓库检查成功会写入 `lastRemoteStatus` 且保持 `lastError` 为空。
- 成功反馈：只有服务可访问才显示远端可访问；没有档案包时不能假装拉取成功。
- 失败反馈：401、500、非法 JSON、无档案包、422 拒收都会在页面通知和学习档案仓库摘要中出现明确错误。
- 刷新后复现方式：错误状态保存在 `mr-calligraphy-learning-state-v1.historyRepository`，后续刷新仍由同一状态区读取。

仍待补：

- 学习档案远端网络中断、分页返回、同 ID 差异冲突、`nextPageUrl` 自动追取分页、冲突审计和本机字段级合并已在后续补齐，后续还需服务端审计。
- 计划仓库推送包被服务端 422 结构拒绝、网络中断的浏览器级提示验收已补齐，后续还需超时重试和批量队列失败恢复。
- 字段级冲突合并 UI 第一版已完成，后续还需要覆盖计划项增删、依赖调整和服务端合并审计。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "history repository shows real remote failure feedback"`
- `npm run test:e2e`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案失败路径验收`

## 22. 2026-06-12 计划仓库字段级冲突合并

本次把计划同步冲突从“整份计划三选一”推进到字段级合并第一版，用户可以在同一个冲突面板里逐项选择本机或远端字段。

完成内容：

- `app-state.js` 在计划冲突检测时生成 `fieldDiffs`，记录计划标题/摘要和计划项标题、说明、到期、提醒、复盘动作等字段差异。
- `MRAppState.resolvePlanRepositoryConflict("merge-fields", { selections })` 新增字段级合并策略，会按选择把远端字段写入本机计划，同时保留被选择的本机字段。
- 前台冲突面板新增本机/远端字段单选控件和“应用字段合并”按钮。
- 字段合并完成后会清理冲突状态，但把混合后的本机计划加入待同步队列，避免假装远端已经更新。
- `scripts/smoke-test.js` 已检查 `planRepositoryMergeFieldsButton`，防止入口回归。

真实化说明：

- 数据来源：真实本机计划、真实远端冲突计划包、冲突字段摘要和前台用户选择。
- 写入状态：合并结果写入 `mr-calligraphy-learning-state-v1.plans`，并更新 `planRepository.pendingAutoSync`、`pendingReason`、`lastRemoteStatus` 和冲突清理字段。
- 成功反馈：页面冲突面板关闭，计划仓库摘要显示字段级合并进入待同步队列。
- 失败反馈：没有冲突或没有远端冲突计划时返回明确错误，不会清空本机计划。
- 刷新后复现方式：字段合并后的计划和待同步状态都保存在 `mr-calligraphy-learning-state-v1`。

仍待补：

- 计划项新增/删除、依赖链调整、周期规则和服务端版本的字段级合并审计。
- 计划仓库推送包被服务端 422 结构拒绝、网络中断的浏览器级提示验收已补齐，后续还需超时重试和批量队列失败恢复。
- 学习档案远端网络中断、分页返回、同 ID 差异冲突、`nextPageUrl` 自动追取分页、本机冲突审计和字段级合并已在后续补齐。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "merges selected conflict fields"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`
- `git diff --check`

提交：

- 中文 commit message：`新增计划字段级冲突合并`

## 23. 2026-06-12 计划仓库推送失败浏览器验收

本次补齐计划仓库“推送计划 / 同步队列”的失败路径，避免服务端拒收或网络中断时页面误报同步成功。

完成内容：

- `app-state.js` 将计划仓库检查、推送、拉取的 fetch 异常统一转成中文“网络请求异常”，并保留底层错误细节。
- `tests/e2e/real-flows.spec.js` 新增 `front plan repository keeps pending queue on push failures`。
- E2E 模拟 PUT 推送被远端 422 拒收，确认页面通知、计划仓库摘要和 `planRepository.lastError` 都显示 HTTP 422。
- E2E 模拟 PUT 网络中断，确认页面通知、计划仓库摘要和 `planRepository.lastError` 都显示网络请求异常。
- 两条失败路径都会断言 Authorization header、计划同步包 kind、计划数量和计划 ID，确认是真实 PUT，而不是前端假造错误。
- 两条失败路径都会断言本机计划仍保留且 `pendingAutoSync` 继续为 true，失败不会清空待同步队列。

真实化说明：

- 数据来源：真实前台计划同步面板、真实本机计划、同源模拟远端响应/网络中断和实际 PUT body。
- 写入状态：失败写入 `mr-calligraphy-learning-state-v1.planRepository.lastError`，并保留 `pendingAutoSync` 与本机计划。
- 成功反馈：本功能不制造成功路径；重点是失败时不清队列、不覆盖本机计划。
- 失败反馈：HTTP 422 和网络中断都显示在 `#noticeState` 与 `#planRepositorySummary`。
- 刷新后复现方式：错误和待同步状态保存在 `mr-calligraphy-learning-state-v1.planRepository`。

仍待补：

- 计划仓库超时重试、批量队列部分失败恢复和服务端合并审计。
- 计划项新增/删除、依赖链调整、周期规则和服务端版本的字段级合并审计。
- 学习档案远端网络中断、分页返回、同 ID 差异冲突、`nextPageUrl` 自动追取分页、冲突审计和本机字段级合并已补齐，后续还需服务端审计。

验收：

- `node --check app-state.js && node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "keeps pending queue on push failures"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`
- `git diff --check`

提交：

- 中文 commit message：`新增计划推送失败验收`

## 24. 2026-06-12 学习档案分页冲突浏览器验收

本次补齐学习档案远端同步的网络中断、分页返回和同 ID 差异冲突浏览器级验收，避免远端异常或分页结果被误认为完整同步。

完成内容：

- `app-state.js` 将学习档案检查、推送、拉取的 fetch 异常统一转成中文“网络请求异常”，并保留底层错误细节。
- `app-state.js` 识别远端响应里的 `pagination.hasMore`、`pagination.nextPageUrl` 或顶层 `nextPageUrl`，并在状态文案里提示后续页面。自动追取能力已在下一步补齐。
- `tests/e2e/real-flows.spec.js` 新增 `front history repository handles network, paged pull, and id conflicts`。
- E2E 模拟 GET 网络中断，确认页面通知、学习档案仓库摘要和 `historyRepository.lastError` 都显示网络请求异常。
- E2E 模拟远端分页学习档案包，确认检查远端时页面和 `lastRemoteStatus` 都提示分页/后续页面。
- E2E 模拟远端同 ID 差异记录加一条新增记录，确认拉取后新增记录写入本机，冲突记录被跳过且没有覆盖本机反馈。

真实化说明：

- 数据来源：真实本机练习/作品生成的同步包、同源模拟远端分页响应、实际 Authorization header 和真实 localStorage 状态。
- 写入状态：网络失败写入 `historyRepository.lastError`；分页检查写入 `lastRemoteStatus`；冲突拉取写入 `lastSkippedConflictCount` 和同 ID 差异错误说明。
- 成功反馈：分页检查明确提示仍有后续页面；拉取成功会显示新增数量和跳过冲突数量。
- 失败反馈：网络中断不会被包装成同步成功；同 ID 差异不会覆盖本机记录。
- 刷新后复现方式：错误、分页状态和冲突跳过数量都保存在 `mr-calligraphy-learning-state-v1.historyRepository`。

仍待补：

- 学习档案冲突审计和本机字段级合并已在后续补齐，账号化托管仓库仍待继续。
- 计划仓库超时重试、批量队列部分失败恢复和服务端合并审计。
- 计划项新增/删除、依赖链调整、周期规则和服务端版本的字段级合并审计。

验收：

- `node --check app-state.js && node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "history repository handles network"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案分页冲突验收`

## 25. 2026-06-12 学习档案分页自动追取

本次把学习档案远端分页从“只提示后续页面”推进到“拉取时自动追取 `nextPageUrl` 并合并导入”，避免远端分页包只导入第一页。

完成内容：

- `app-state.js` 新增学习档案分页解析，支持响应里的 `pagination.nextPageUrl` 和顶层 `nextPageUrl`。
- `pullHistoryRepositoryFromRemote()` 会从当前 endpoint 开始继续 GET 后续页，最多追取 20 页，并用已访问 URL 防止循环分页。
- 拉取完成后会把多页 `records.sessions`、`records.artworks`、`records.reports` 一次性合并到本机学习状态。
- 同 ID 差异策略仍保持安全边界：同 ID 内容不同的远端记录会跳过，不覆盖本机记录。
- 检查远端仍只展示当前响应，不导入后续页；真正导入发生在“拉取档案”操作。
- `tests/e2e/real-flows.spec.js` 将分页用例升级为两页远端响应，并断言第二页请求携带同一个 Bearer token。

真实化说明：

- 数据来源：真实本机学习档案同步包、远端分页 JSON 响应、`pagination.nextPageUrl` 和实际 GET 请求。
- 写入状态：多页新增记录写入 `mr-calligraphy-learning-state-v1.sessions/artworks/reports`，同步摘要写入 `historyRepository.lastRemoteRecordCount`、`lastImportedRecordCount`、`lastRemoteStatus` 和 `lastSkippedConflictCount`。
- 成功反馈：拉取提示会显示页数、新增数量和跳过冲突数量。
- 失败反馈：网络异常、远端错误、分页循环或超过 20 页都会停止追取并保留明确状态；已冲突记录仍不覆盖本机。
- 刷新后复现方式：导入后的学习档案、最近远端状态和冲突跳过数量保存在 `mr-calligraphy-learning-state-v1`。

仍待补：

- 学习档案本机字段级合并已在后续补齐；账号化托管仓库、服务端游标重试、服务端审计签名和跨设备长期归档仍待继续。

验收：

- `node --check app-state.js && node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "history repository handles network"`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案分页自动追取`

## 26. 2026-06-12 学习档案冲突审计

本次把学习档案同 ID 差异从提示型处理推进到“可审阅、可另存、可忽略”的本机冲突审计。

完成内容：

- `app-state.js` 在本机导入和远端拉取时保存同 ID 差异冲突详情。
- 冲突详情包含类型、ID、本机/远端标题、更新时间、字段差异摘要和远端记录快照。
- 新增 `MRAppState.getHistoryRepositoryConflicts()` 与 `resolveHistoryRepositoryConflict()`。
- 前台远端学习档案 API 面板新增冲突审计区，列出差异字段。
- 用户可把远端冲突记录另存为本机副本；原本机记录不被覆盖。
- 用户可忽略审计项，清理不再需要处理的冲突提示。

真实化说明：

- 数据来源：本机学习档案状态、远端同步包和同 ID 字段差异。
- 写入状态：冲突审计写入 `historyRepository.lastConflictRecords`；另存副本写入 `sessions/artworks/reports`。
- 成功反馈：前台显示冲突审计列表；处理后状态条显示另存或忽略结果，列表同步刷新。
- 失败反馈：无匹配冲突或未知处理策略时返回明确失败，不修改本机档案。
- 刷新后复现方式：冲突审计和副本记录都保存在 `mr-calligraphy-learning-state-v1`。

仍待补：

- 学习档案本机字段级合并已在后续补齐；服务端冲突审计签名、账号空间隔离和长期归档仍待继续。

验收：

- `node --check app-state.js && node --input-type=module --check < script.js`
- `node --check scripts/learning-state-check.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "history repository handles network"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案冲突审计`

## 27. 2026-06-12 学习档案字段级冲突合并

本次把学习档案冲突审计从“可看、可另存、可忽略”推进到“可按字段选择本机或远端”。

完成内容：

- `MRAppState.resolveHistoryRepositoryConflict("merge-fields", { conflictId, selections })` 新增字段级合并策略。
- 前台冲突审计区为每个差异字段生成本机/远端单选项，默认保留本机。
- 点击“应用字段合并”后，只写入用户选择的远端字段，本机未选字段保持不变。
- 合并后清理对应冲突审计，更新 `historyRepository` 状态并刷新学习档案视图。
- 数据层验收覆盖标题字段合并和后续另存副本；E2E 覆盖反馈字段合并且评分保留本机。

真实化说明：

- 数据来源：远端冲突记录快照、本机同 ID 档案和用户字段选择。
- 写入状态：合并结果写入 `sessions/artworks/reports`；处理状态写入 `historyRepository.lastRemoteStatus`、`lastSkippedConflictCount` 和 `lastConflictRecords`。
- 成功反馈：页面 notice 显示字段合并结果，冲突审计面板同步关闭或减少。
- 失败反馈：没有匹配冲突或本机同 ID 记录不存在时返回明确错误，不修改其他档案。
- 刷新后复现方式：字段合并后的档案和冲突清理状态都保存在 `mr-calligraphy-learning-state-v1`。

仍待补：

- 服务端版本号合并、深层数组合并、账号空间隔离、不可篡改审计和长期归档。

验收：

- `node --check app-state.js && node --input-type=module --check < script.js`
- `node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "history repository handles network"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案字段级合并`

## 28. 2026-06-12 远端项目仓库版本历史拉取

本次把主后台远端项目仓库从“只能拉最新包”推进到“可查看远端版本历史并选择指定版本进入恢复预览”。

完成内容：

- 项目仓库 mock server 保留最近 20 个版本，并在 `GET` 响应中返回 `versions`。
- 支持 `GET /api/project-repository?packageId=<remote-package-id>` 拉取指定历史包。
- `MRProjectArchive` 持久化 `mr-calligraphy-project-repository-remote-v1.versions`。
- 主后台远端项目仓库面板新增“远端版本”选择框。
- “拉取预览”会使用选中的版本 ID 发起真实 GET，并继续走现有项目档案差异预览。
- E2E 会推送两个项目仓库包，选择旧版本拉取，并断言请求带上 `packageId`。

真实化说明：

- 数据来源：远端 API 返回的版本列表、远端历史包和本机项目档案摘要。
- 写入状态：版本历史、最近拉取版本和摘要持久化到本机远端项目仓库状态。
- 成功反馈：版本选择框显示远端版本；拉取成功后打开项目档案恢复预览。
- 失败反馈：找不到版本、远端包摘要不匹配或结构错误时不进入恢复预览。
- 刷新后复现方式：版本列表保存在 localStorage，刷新主后台后仍能读取。

仍待补：

- 账号空间隔离、服务端版本权限、三方合并、服务端审计签名和长期版本保留。

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

## 29. 2026-06-12 报告本机验真摘要

本次把报告导出从“能下载”继续推进到“能在本机复算摘要并对照导出内容”。

完成内容：

- `MRAppState.getReportVerification(reportId)` 新增无副作用验真摘要接口。
- 验真 payload 使用稳定 JSON，覆盖报告核心字段、教师批注、关联练习摘要和最近作品截图 SHA-256 摘要。
- HTML 报告新增“本机验真摘要”区块，显示算法、摘要、来源和能力边界。
- 原生 PDF 正文和 PDF 注释新增 `ReportVerification`、`ReportVerificationAlgorithm` 和 `ReportDigest` 标记。
- 前台站内报告面板新增本机验真摘要展示，刷新后可重新计算。
- `learning-state-check.js` 验证摘要是 64 位 SHA-256、PDF/HTML 摘要一致，并验证教师批注变更后摘要同步变化。

真实化说明：

- 数据来源：当前浏览器里的 `ReportRecord`、关联 `PracticeSession` 和最近 `ArtworkRecord`。
- 写入状态：本功能不新增持久字段，摘要每次从本机状态重新计算。
- 成功反馈：页面、HTML 导出和 PDF 导出都展示同一份摘要。
- 失败反馈：没有报告时返回明确失败，不生成空摘要。
- 刷新后复现方式：刷新后从 `mr-calligraphy-learning-state-v1` 重新计算同一份报告摘要。

仍待补：

- 这是本机 SHA-256 摘要，不是服务端证书、教师签名、账号化审计或不可篡改签章。

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

## 30. 2026-06-12 报告仓库远端 API adapter

本次把站内报告从“只能本机查看和导出”推进到“可通过用户配置的远端 API 保存和拉取报告包”。

完成内容：

- `MRAppState` 新增 `reportRepository` 状态，持久化 endpoint/token、最近检查、最近推送、最近拉取、远端报告数、packageId、冲突跳过数和错误信息。
- 新增 `getReportRepositoryPackage()`，会打包本机 `ReportRecord`、教师批注、本机验真摘要和仓库 summary。
- 新增 `configureReportRepositoryRemote()`、`checkRemoteReportRepository()`、`pushReportRepositoryToRemote()` 和 `pullReportRepositoryFromRemote()`。
- 前台站内报告面板新增“远端报告 API”折叠区，提供保存远端、检查远端、推送报告和拉取报告。
- 新增 `scripts/report-repository-mock-server.js` 和 `docs/report-repository-api-contract.md`。
- 自动化覆盖真实 GET/PUT、Bearer token、回执、教师批注、本机验真摘要、拉取新增报告和同 ID 差异跳过。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.reports`、报告教师批注、本机验真摘要和用户填写的远端 endpoint/token。
- 写入状态：远端配置和同步状态写入 `reportRepository`；远端新增报告写入本机 `reports`。
- 成功反馈：报告面板展示远端检查、推送或拉取结果，远端 mock 返回 receipt 和 packageId。
- 失败反馈：未配置、非法 URL、401、422、网络错误和响应结构错误都会显示明确失败，不清空本机报告。
- 刷新后复现方式：刷新后仍能看到远端配置、最近同步状态和已拉取报告。

仍待补：

- 这仍是前端 adapter，不是账号化教师端、服务端签章、不可篡改审计、服务端 PDF 渲染或生产长期报告仓库。
- 当前同 ID 差异已在后续补为本机冲突审计、字段级合并和远端副本另存；后续仍需账号化服务端合并和服务端签名审计。

验收：

- `node --check app-state.js && node --check script.js`
- `node --check scripts/report-repository-mock-server.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库远端同步`

## 31. 2026-06-12 报告仓库冲突审计

本次把报告仓库远端拉取从“遇到同 ID 差异只跳过计数”推进到“可审阅、可字段合并、可另存远端副本”。

完成内容：

- `reportRepository.lastConflictReports` 保存同 ID 差异报告的字段差异和远端报告快照。
- `getReportRepositoryConflicts()` 返回当前待处理报告冲突审计。
- `resolveReportRepositoryConflict()` 支持 `merge-fields`、`copy-remote` 和 `dismiss`。
- 站内报告面板新增“报告仓库冲突审计”区域，可选择本机或远端字段。
- 数据层覆盖字段级合并和远端副本另存；E2E 覆盖页面拉取冲突报告并应用远端摘要字段。

真实化说明：

- 数据来源：远端报告包、本机同 ID 报告和用户字段选择。
- 写入状态：冲突审计写入 `reportRepository.lastConflictReports`；字段合并写回 `reports`；另存副本新增本机报告。
- 成功反馈：冲突面板刷新，处理后审计消失或减少，notice 显示采用远端字段数量或副本数量。
- 失败反馈：没有匹配冲突或未知处理方式时不修改报告，并返回明确提示。
- 刷新后复现方式：未处理审计随 `mr-calligraphy-learning-state-v1` 持久化，刷新后仍可继续处理。

仍待补：

- 服务端版本号合并、教师身份审计、服务端签章、不可篡改日志和账号空间隔离。

验收：

- `node --check app-state.js && node --check script.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库冲突审计`

## 32. 2026-06-12 报告仓库同步包导入导出

本次把站内报告的 `ReportRepository` 从“只有包生成 API、远端 API adapter”补成前台可直接使用的本机 JSON 同步包。

完成内容：

- 新增 `MRAppState.downloadReportRepository()`，下载 `mr-calligraphy-report-repository-*.json`，并写回最近导出时间、导出报告数和 packageId。
- 站内报告面板新增“导出同步包”和“导入同步包”，分别标记为 `real-export` 与 `real-local`。
- 导入使用浏览器文件选择器读取 JSON 包，调用 `importReportRepositoryPackage()` 写入本机 `reports` 与 `reportRepository` 状态。
- smoke test 新增报告仓库导入/导出 DOM 标记；E2E 覆盖浏览器下载和文件导入。

真实化说明：

- 数据来源：当前浏览器本机报告、教师批注、本机验真摘要，以及用户选择的 JSON 同步包文件。
- 写入状态：导出只写 `reportRepository.lastExportedAt`、`lastExportedReportCount` 和 `lastPackageId`；导入会新增本机不存在的 `ReportRecord`，同 ID 差异继续进入冲突审计。
- 成功反馈：报告仓库摘要显示最近导出/导入报告数，notice 显示文件名或导入结果。
- 失败反馈：没有报告、文件读取失败、JSON 格式错误、空包或 kind 不匹配时返回明确提示。
- 刷新后复现方式：导入的报告和仓库同步状态保存在 `mr-calligraphy-learning-state-v1`，刷新后仍可打开。

仍待补：

- 本机 JSON 包不是账号化云端仓库；后续仍要补服务端权限、教师身份审计、签名回执和长期归档。

验收：

- `node --check app-state.js && node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes|front report repository imports"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库同步包导入导出`

## 33. 2026-06-12 嵌入学习报告 PDF 作品截图

本次把原生 PDF 从“作品卡片只说明截图来源”推进到“可把最近作品截图真实嵌入 PDF 文件”。

完成内容：

- `createReportPdf()` 解析最近作品 JPEG data URL，读取宽高并生成 PDF 图片对象。
- `createSimplePdf()` 增加 `/XObject` 图片资源、`/Subtype /Image`、`/ASCIIHexDecode` 和 `/DCTDecode` 输出。
- 最近作品卡片在可用 JPEG 时绘制真实截图；非 JPEG 或过大图片走安全降级说明。
- `getReportPdfExport()` 暴露 `artworkImageEmbedded`、`artworkImageMime` 和 `artworkImageDigest`。
- 学习状态检查和 Playwright 都会验证下载出的 PDF 包含嵌入图片对象。

真实化说明：

- 数据来源：当前浏览器保存作品时的 `ArtworkRecord.imageData`。
- 写入状态：不修改本机状态，只影响下载出的 PDF 文件。
- 成功反馈：PDF feature 和注释会显示 `ArtworkImageEmbedded: yes`。
- 失败反馈：无图、非 JPEG、损坏 base64 或超过大小上限时不写坏流，只保留作品卡片。
- 刷新后复现方式：报告和作品保存在本机状态，刷新后再次下载仍可嵌入。

仍待补：

- PNG 转码、雷达图/趋势图位图、服务端签名验真和服务端 PDF 渲染仍未接入。

验收：

- `node --check app-state.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`嵌入学习报告PDF作品截图`
