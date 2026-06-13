# 前端操作界面真实化开发文档

日期：2026-06-12
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

这一版已经不是早期纯静态 Demo。前台已有本机学习状态、书写画布、作品保存、学习档案、档案远端 API adapter、作品分享本机链接、作品分享远端 API adapter、报告、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、报告仓库签名回执、报告冲突审计、PDF/HTML/WebM/JSON 导出、学习计划、计划提醒边界、远端计划 API adapter、服务端合同和本机 mock 服务；主后台和写实后台已有对象编辑、模型导入、保存历史、本机发布、回滚、项目档案、远端发布包预检、审核锁和资产清单。

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
| `index.html` | 75 | 30 | 0 | 0 | 0 | 0 |
| `main-admin.html` | 45 | 7 | 1 | 0 | 0 | 0 |
| `realistic-demo.html` | 3 | 0 | 0 | 0 | 0 | 0 |
| `realistic-admin.html` | 30 | 3 | 1 | 0 | 0 | 0 |
| `script.js dynamic` | 31 | 1 | 0 | 0 | 1 | 0 |

结论：入口 HTML 和前台动态控件已经没有明显的 `demo-content` 假按钮。现在要治理的是更深一层的真实度：标为 `real-local` 的按钮，必须清楚说明它只是本机真实，不是云端真实。

## 4. 当前不够完善的功能

### 4.1 前台学习产品

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 学习路径 | 步骤导航、热点路由、阶段记录、本机任务进度已有第一版；本机 `LearningPathService` 已用任务、练习、作品、报告和计划推导 10 步标题、说明、完成状态、证据和下一步动作 | 还不是云端课程编排、教师下发任务或跨设备学习进度；视觉场景仍保留静态兜底 | 后续扩展课程包、教师端排课、班级进度和跨设备同步 |
| AI 讲解 | 浏览器本机语音能朗读讲解段落；本机 `LectureService` 会记录语音能力、播放段落、文本降级、失败和完成状态 | 不是云端 AI 音频，也不是按真实笔迹实时生成 | 保留本机语音 fallback，后续在同一讲解服务接口扩展云端 AI 音频/文本 |
| 书写练习 | 鼠标/触控笔迹、撤销、清空、回放、保存和基础评分可用；本机 `ScoreService` 会记录评分来源、算法版本、最近证据摘要、累计评分次数和采样点；`local-heuristic-v2.2.0` 已保存第一版范字笔顺、逐笔轨迹匹配、路径误差热力和压感采样证据 | 仍缺高精度笔锋路径、硬件适配、教师标定和专业评分模型 | 继续扩展笔锋分析、硬件压感校准、服务端评分来源和教师标定 |
| 学习计划 | 计划生成、编辑、顺延、复盘、依赖图、周期循环、本机提醒、`.ics` 日历导出、JSON 同步包、远端 API 推送/拉取、API 合同、本机 mock 服务、Workspace 空间隔离、远端回执审计、回执本机一致性校验、自动同步队列、冲突检测、三策略冲突解决、字段级合并、请求超时保护、失败历史和重试队列恢复已有第一版 | 还没有账号登录、托管计划仓库、远端推送提醒、教师端通知和服务端不可篡改审计 | 做账号化 repository、服务端合并策略、跨设备提醒、教师端视图和生产审计 |
| 学习档案 | 本机历史、详情路由、回收站、趋势、作品集、标签编辑、导出、远端 API 推送/拉取、Workspace 空间隔离、`nextPageUrl` 分页自动追取、同 ID 冲突审计、字段级合并、远端冲突另存副本、远端回执审计导出、回执本机一致性校验、API 合同和本机 mock 服务已有第一版 | 还没有账号登录、托管档案仓库、生产级分页查询、长期归档和服务端教师批注审计 | 做账号化 history repository、云端详情 URL、服务端合并审计和长期归档 |

### 4.2 作品、报告和分享

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 保存作品 | 能保存笔迹、截图、评分、标签和作品对比 | 作品只在当前浏览器可见 | 增加作品 repository、公开作品集和课堂评阅入口 |
| 视频导出 | 可从真实笔迹导出 WebM 回放，生成 PNG 封面、本机导出记录、本机队列、失败重试入口和视频导出回执审计 HTML | 不是 MP4/GIF，没有压缩、云端转码、生产签名回执和页面关闭后的后台队列 | 增加转码 adapter、压缩、Service Worker/服务端导出队列 |
| 报告导出 | HTML 报告、原生 PDF、PDF 能力条形图、PDF 能力雷达图、PDF 分数趋势图、PDF 最近作品 JPEG 截图嵌入、报告对比、多报告趋势、字段交互、本机教师批注、本机验真摘要、报告仓库本机 JSON 同步包、报告仓库远端 API adapter、报告仓库签名回执审计导出、同 ID 冲突审计、字段级合并和远端副本另存已有第一版 | 仍主要是本机报告；本机 JSON 包只是手动备份/迁移，远端报告仓库只是用户配置 endpoint 的真实 GET/PUT，签名回执审计还是本机列表和 mock/HMAC 开发验收，还没有账号教师端、生产证书签名、不可篡改审计和服务端 PDF 生成 | 增加账号化 ReportRepository、服务端保存、教师身份审计、生产证书验真和服务端 PDF 渲染验收 |
| 分享成果 | 可导出离线 HTML 分享页；可生成、复制、访问和撤销当前浏览器内的本机分享链接；远端分享 API adapter 已支持 endpoint/token/Workspace、GET 检查、PUT 发布分享包、DELETE 撤销远端分享、保存 publicUrl、发布/撤销回执、回执审计和本机一致性校验，本机 mock 服务可验收 | 远端 adapter 仍需用户自备服务端；没有内置公网托管、社群分享、课堂作品墙、账号权限或生产 CDN | 离线导出保持 `real-export`，本机分享服务和远端 adapter 标记 `real-local`；后续增加生产公开分享服务、权限控制和撤销审计 |

### 4.3 主后台和写实后台

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 主后台编辑 | 对象、图层、灯光、基础物体、导入模型、保存快照可用；主后台项目档案区已显示统一 `ProjectRepository` 状态，并可配置远端项目仓库 API 真实 GET/PUT，支持拉取远端包进入恢复预览、回执审计导出、回执本机一致性校验、请求超时保护、失败历史和重试推送恢复 | 保存范围主要是当前浏览器，远端 adapter 还不是账号协作后台 | 继续接账号化项目 repository、多人合并和服务端资产签名 |
| 写实后台编辑 | 写实对象、相机、导入模型、快照、发布到演示可用；已纳入 `project-scene-repository-v1` 统一视图 | 和主后台对象 schema 仍有字段差异 | 继续统一字段迁移、完整 diff 和资产引用规则 |
| 本机发布 | 主后台发布到前台，写实后台发布到演示，支持历史、差异、回滚 | 只是本机发布，不是线上部署 | UI 保持“本机发布”；线上发布必须走远端发布合同 |
| 远端发布 | 可配置 endpoint/token，生成发布包、manifest、模型/贴图资产清单，预检、审核锁、POST 推送、DELETE 撤销、服务端回执持久化、HMAC 开发资产签名回执、CDN upload 上传回执、CDN purge 撤销回执和 HTML 审计导出已有第一版 | 还不是账号权限、生产 CDN 托管、生产证书签名、服务端审批和不可篡改审计 | 增加生产服务端账号权限、远端审核状态、生产证书资产签名、生产 CDN 回调和不可篡改审计日志 |
| 项目档案 | JSON 导出/导入、schema、迁移、字段恢复、模型哈希、恢复审计、统一项目仓库状态、远端项目仓库 API adapter、拉取预览、API 合同、本机 mock 服务、回执审计导出和回执本机一致性校验可用 | 三方合并、完整 JSON 树、账号权限和远端资产校验仍弱 | 增加账号化服务端 repository、多人冲突解决和远端资产完整性校验 |
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
- 远端发布 API 面板已有服务端合同文档、mock endpoint、回执持久化、HMAC 开发资产签名回执和回执审计导出第一版；后续补账号权限、生产证书签名和服务端不可篡改审计。
- 审核与发布锁从本机状态升级为远端校验状态。

### P1：把学习状态从本机原型升级为可同步业务

目标：学习计划和学习档案不再只靠单浏览器。

- 继续推进账号化计划 repository；计划 API 合同、mock 服务、自动同步队列、冲突检测、手动解决 UI 和本机回执审计第一版已完成。
- 增加账号化计划 repository、学习档案 repository 和报告 repository；学习档案远端 API adapter、报告仓库远端 API adapter、合同和 mock 服务第一版已完成。
- 增加跨设备提醒、教师端通知和远端任务下发；当前已先补 `.ics` 日历提醒导出，让本机计划可导入系统/手机日历。
- 拉取远端数据时不得静默覆盖本机待同步修改。

### P1：把评分和报告做成可解释产物

目标：评分不再像固定模板，报告能被复盘和验证。

- 评分结果显示证据点、覆盖范围、重心、停顿、压感、范字笔顺、逐笔轨迹匹配、路径误差热力和维度理由；本机 `ScoreService` 已记录并展示最近评分证据摘要和算法版本。
- 原生 PDF 已补能力条形图、能力雷达图、分数趋势图、最近作品 JPEG 截图嵌入和本机验真摘要；报告仓库已补 mock/HMAC 签名回执；后续继续增强生产证书验真、报告仓库远端 API adapter 的账号化和服务端冲突审计。
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

- 服务端账号、远端审批、生产证书资产签名、CDN 托管和不可篡改审计仍未接入。
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

- PNG 转码、服务端签名验真和服务端 PDF 渲染仍未接入；PDF 能力雷达图已在后续补齐。

验收：

- `node --check app-state.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`嵌入学习报告PDF作品截图`

## 34. 2026-06-12 新增学习报告 PDF 分数趋势图

本次把原生 PDF 从“只展示能力条形图和最近作品卡片”推进到“能展示真实分数趋势”。

完成内容：

- `createReportPdf()` 新增 PDF 趋势数据准备逻辑，优先读取 `ReportRecord.trend`。
- 旧报告没有 `trend` 时，会按报告生成时间从本机 `PracticeSession` 和 `ArtworkRecord` 回填真实分数，不把未来记录画入历史报告。
- `createSimplePdf()` 新增原生 PDF 趋势条绘制块，使用矩形、横轴和序号展示最近 8 条记录。
- `getReportPdfExport()` 暴露 `trendBars` 和 `trendCount` feature。
- 数据层和 Playwright 都会验证下载出的 PDF 包含 `TrendBars` 标记。

真实化说明：

- 数据来源：当前浏览器本机报告、练习和作品评分。
- 写入状态：不改写 `mr-calligraphy-learning-state-v1`，只影响下载的 PDF 文件。
- 成功反馈：PDF 导出 message、features 和文件注释都会包含趋势图能力。
- 失败反馈：没有真实分数时显示空趋势说明，不显示伪造曲线。
- 刷新后复现方式：本机状态保留后，再次打开站内报告下载 PDF 仍能生成趋势图。

仍待补：

- 当前是轻量原生 PDF 趋势条；PDF 能力雷达图已在后续补齐，服务端签名、教师身份审计、不可篡改日志和服务端 PDF 渲染仍待接入。

验收：

- `node --check app-state.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习报告PDF分数趋势图`

## 35. 2026-06-12 新增学习报告 PDF 能力雷达图

本次把原生 PDF 的“能力维度”从条形图扩展为条形图加雷达图，减少 HTML 报告和 PDF 报告之间的图表落差。

完成内容：

- `createReportPdf()` 新增雷达图 feature 准备逻辑，读取报告 `scoreBreakdown` 五项能力分。
- `createSimplePdf()` 在能力维度块右侧绘制原生 PDF 雷达图，包含参考环、轴线、能力面积和点位。
- `getReportPdfExport()` 暴露 `radarChart` 和 `radarMetricCount`。
- 数据层和 Playwright 都会验证下载出的 PDF 包含 `RadarChart` 标记。

真实化说明：

- 数据来源：当前浏览器本机 `ReportRecord.scoreBreakdown`。
- 写入状态：不改写学习状态，只影响下载的 PDF 文件。
- 成功反馈：PDF 导出 message、features 和文件注释都会包含雷达图能力。
- 失败反馈：没有真实能力分时不画伪造雷达图。
- 刷新后复现方式：本机报告保留后，再次打开站内报告下载 PDF 仍能生成同一份雷达图。

仍待补：

- 当前是本机原生 PDF 矢量图，不是服务端签名报告；账号化教师端、不可篡改审计和服务端 PDF 渲染仍待接入。

验收：

- `node --check app-state.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习报告PDF能力雷达图`

## 36. 2026-06-12 新增报告仓库签名回执

本次把报告仓库远端 adapter 从“只保存 packageId 和 receipt 摘要”推进到“保存可追踪的远端签名回执”。

完成内容：

- 报告仓库 mock server 生成 `mr-calligraphy-report-repository-receipt-v1` 时，新增 `HMAC-SHA256` 签名、签名 key id 和签名字段列表。
- `MRAppState` 新增 `lastSignedReceipt` 状态，规范化保存远端 `receipt/latestReceipt`。
- 远端推送成功后，报告仓库摘要会显示“签名回执”及签名/仓库摘要短码。
- 远端 GET 检查和拉取会保留最近签名回执；本机 JSON 导出/导入会清掉旧远端签名。
- 数据层和 Playwright 都验证签名回执会从远端响应写入本机学习状态。

真实化说明：

- 数据来源：远端报告仓库 API 响应。
- 写入状态：`mr-calligraphy-learning-state-v1.reportRepository.lastSignedReceipt`。
- 成功反馈：报告仓库摘要出现签名算法、key id、签名短码和仓库摘要短码。
- 失败反馈：缺少完整签名字段的 receipt 不会进入 `lastSignedReceipt`。
- 刷新后复现方式：签名回执随本机学习状态持久化，刷新后仍可读取。

仍待补：

- 当前是本机 mock/HMAC 签名回执，不是生产证书、公钥验签、教师身份审计或不可篡改审计链。

验收：

- `node --check app-state.js && node --check scripts/report-repository-mock-server.js && node --check scripts/learning-state-check.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库签名回执`

## 37. 2026-06-12 新增报告仓库回执审计导出

本次把报告仓库签名回执从“最近一条状态”推进为“可查看、可导出的本机审计列表”。

完成内容：

- `reportRepository.signedReceipts` 保存最近 12 条签名回执。
- 回执记录包含同步方向、endpoint、本机收到时间、签名算法、key id、signature、repositoryDigest 和 receiptDigest。
- 站内报告面板新增“签名回执审计”区域，展示最近回执和签名短码。
- “导出回执”会下载 `mr-calligraphy-report-repository-receipts-*.html`。
- 数据层、smoke test 和 Playwright 都覆盖审计列表和 HTML 导出。

真实化说明：

- 数据来源：远端报告仓库 API 返回的 `receipt/latestReceipt`。
- 写入状态：`mr-calligraphy-learning-state-v1.reportRepository.signedReceipts`。
- 成功反馈：报告面板展示已保存回执数量，导出按钮生成 HTML。
- 失败反馈：暂无回执时按钮禁用，API 返回明确失败。
- 刷新后复现方式：审计列表随本机学习状态持久化。

仍待补：

- 当前是本机审计导出，不是服务端不可篡改审计、生产证书链或账号化教师身份签章。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库回执审计`

## 38. 2026-06-12 新增学习计划日历提醒导出

本次为学习计划补一个真实跨设备提醒出口：下载标准 `.ics` 日历文件，而不是在静态前端里伪装云端推送。

完成内容：

- `MRAppState.getPlanCalendarExport()` 可从计划任务生成 `VCALENDAR` 文本。
- 每个计划项生成 `VEVENT`，保留到期时间、计划说明、复盘动作和本机边界说明。
- `remindAt` 会生成 `VALARM`，系统日历导入后可按日历应用能力提醒。
- 前台计划工具区新增“导出日历”按钮。
- 数据层、smoke test 和 E2E 都覆盖 `.ics` 结构与下载。

真实化说明：

- 数据来源：本机 `Plan` / `PlanItem`。
- 写入状态：不写新状态，只导出当前本机计划。
- 成功反馈：下载 `mr-calligraphy-plan-calendar-*.ics`。
- 失败反馈：没有计划时返回明确失败，不伪造提醒。
- 刷新后复现方式：计划仍在本机状态时可重复导出。

仍待补：

- 这不是云端推送、账号提醒、教师端通知或后台任务下发；后续仍需生产后端。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front practice saves real strokes"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习计划日历提醒导出`

## 39. 2026-06-12 新增计划仓库回执审计导出

本次把计划仓库远端 receipt 从“mock 服务返回字段”推进为“前台可查看、可导出的本机审计证据”。

完成内容：

- `MRAppState` 新增计划仓库回执规范化、`lastReceipt` 和最近 12 条 `receipts`。
- 远端检查、推送、拉取会读取 `receipt/latestReceipt`，并记录方向、endpoint 和本机收到时间。
- 前台计划远端同步区新增“回执审计”列表和“导出回执”按钮。
- “导出回执”会下载 `mr-calligraphy-plan-repository-receipts-*.html`。
- 数据层、smoke test 和 E2E 都覆盖回执保存、摘要展示和 HTML 下载。

真实化说明：

- 数据来源：远端计划仓库 API 返回的 `mr-calligraphy-plan-repository-receipt-v1`。
- 写入状态：`mr-calligraphy-learning-state-v1.planRepository.receipts`。
- 成功反馈：页面显示回执数量、仓库摘要短码和回执短码。
- 失败反馈：字段不完整的 receipt 不会被保存；暂无回执时导出返回明确失败。
- 刷新后复现方式：审计列表随本机学习状态持久化。

仍待补：

- 当前是本机审计导出，不是服务端不可篡改审计、生产签名证书链或账号空间审计。

验收：

- `node --check app-state.js && node --check script.js && node --check scripts/learning-state-check.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/learning-state-check.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "front plan repository detects remote conflicts"`
- `git diff --check`

提交：

- 中文 commit message：`新增计划仓库回执审计`

## 40. 2026-06-12 新增项目仓库回执审计导出

本次把主后台项目仓库远端 receipt 从“只在列表里显示最近回执”推进为“可导出的本机审计证据”。

完成内容：

- `MRProjectArchive` 新增 `getProjectRepositoryReceiptAudit()`、`getProjectRepositoryReceiptAuditExport()` 和 `downloadProjectRepositoryReceiptAudit()`。
- 远端项目仓库检查、推送、拉取会读取 `receipt/latestReceipt`，并记录方向、endpoint 和本机收到时间。
- 主后台远端项目仓库面板新增“项目仓库回执审计”状态区和“导出回执”按钮。
- “导出回执”会下载 `mr-calligraphy-project-repository-receipts-*.html`。
- smoke test 和 E2E 都覆盖回执保存、摘要展示、导出 API 和下载文件内容。

真实化说明：

- 数据来源：远端项目仓库 API 返回的 `mr-calligraphy-project-repository-receipt-v1`。
- 写入状态：`mr-calligraphy-project-repository-remote-v1.receipts`。
- 成功反馈：页面显示回执数量、远端 packageId 和摘要短码。
- 失败反馈：暂无回执时按钮禁用，导出 API 返回明确失败。
- 刷新后复现方式：审计列表随本机项目仓库远端状态持久化。

仍待补：

- 当前是本机审计导出，不是账号化项目空间、生产签名证书链或服务端不可篡改审计。

验收：

- `node --check project-archive.js && node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库回执审计导出`

## 41. 2026-06-12 新增项目仓库远端失败反馈

本次把主后台项目仓库远端 adapter 的坏响应处理补成真实失败路径：坏 endpoint 不再看起来像检查通过。

完成内容：

- `parseProjectRepositoryResponse()` 严格要求 JSON 响应。
- 200 但返回 HTML / 纯文本时显示“远端返回的不是 JSON”。
- HTTP 非 2xx 与 `ok:false` 会把 `HTTP <status>` 写入 `lastError`。
- 网络中断统一显示“网络请求异常”。
- E2E 覆盖 401、非 JSON、无项目包、PUT 422 和网络中断，并确认本机项目布局不会被失败远端清空。

真实化说明：

- 数据来源：真实 `fetch` 响应和本机项目布局。
- 写入状态：`mr-calligraphy-project-repository-remote-v1.lastError`。
- 成功反馈：合法 JSON 成功路径不变。
- 失败反馈：后台状态条显示具体错误。
- 刷新后复现方式：错误状态随本机远端配置状态持久化。

仍待补：

- 当前是前端错误反馈，不是生产服务端监控、账号级告警或集中审计。

验收：

- `node --check project-archive.js && node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `npm run test:e2e -- --grep "main admin project repository keeps local data"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库远端失败反馈`

## 42. 2026-06-12 新增报告教师批注审计导出

本次把前台报告教师批注从“当前报告字段”推进为“可追溯的本机审计链”。

完成内容：

- `mr-calligraphy-learning-state-v1.reportTeacherReviewAudits` 新增最近 30 条本机教师批注审计记录。
- 保存批注会记录 `save` 动作、报告 ID、批注人、后一 SHA-256 摘要和批注预览。
- 清除批注会记录 `clear` 动作、前一 SHA-256 摘要、清除时间和本机说明。
- 前台报告详情新增“批注审计”状态区、最近审计列表和“导出审计”按钮。
- `MRAppState.getReportTeacherReviewAuditExport()` 可生成离线 HTML 审计页。
- Playwright 会真实点击保存、导出审计、清除批注，并读取 localStorage 确认 `save/clear` 两条记录。

真实化说明：

- 数据来源：用户在当前浏览器保存或清除教师批注的真实操作。
- 写入状态：`mr-calligraphy-learning-state-v1.reportTeacherReviewAudits`。
- 成功反馈：页面展示最近审计记录，导出文件包含报告 ID、动作、批注人、摘要和预览。
- 失败反馈：暂无报告或暂无审计记录时导出按钮禁用。
- 刷新后复现方式：审计记录随学习状态持久化，重新打开同一报告仍可查看。

仍待补：

- 当前不是账号化教师端、跨设备班级批改、服务端不可篡改日志或生产电子签章。

验收：

- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增报告教师批注审计`

## 43. 2026-06-12 新增项目档案恢复审计摘要

本次把主后台项目档案恢复审计从“有恢复记录”推进为“有可校验摘要的恢复记录”。

完成内容：

- `MRProjectArchive.restoreProjectArchive()` 恢复成功后写入带摘要的审计记录。
- `archiveDigest` 记录本次选中的档案内容摘要。
- `selectionDigest` 记录用户恢复范围摘要。
- `recordDigest` 记录整条审计记录摘要。
- 主后台恢复审计列表显示 `recordDigest` 短码。
- 恢复审计 HTML 导出包含摘要、原始审计 JSON 和本机审计 key。
- E2E 会真实点击项目恢复，并验证刷新后的审计列表和下载文件。

真实化说明：

- 数据来源：本机项目档案、恢复范围和恢复成功后的审计记录。
- 写入状态：`mr-calligraphy-project-archive-audit-v1`。
- 成功反馈：后台审计列表与 HTML 导出都能看到摘要。
- 失败反馈：恢复失败不会生成成功审计记录。
- 刷新后复现方式：审计记录保存在本机 localStorage。

仍待补：

- 当前不是服务端不可篡改审计、账号权限审计或多人协作审计链。

验收：

- `node scripts/archive-migration-check.js`
- `npm run test:e2e -- --grep "main admin publishes"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增项目档案恢复审计摘要`

## 44. 2026-06-12 新增书写视频封面和导出记录

本次把前台“生成视频”从单次 WebM 下载推进为可追溯的本机导出能力。

完成内容：

- `MRPracticeCanvas.exportReplayCover()` 可从真实笔迹生成 PNG 封面。
- 复盘面板新增“导出视频”和“下载封面”按钮。
- WebM 导出成功后写入 `videoExportService.records`。
- 导出记录包含 WebM 文件名、PNG 封面文件名、封面 Data URL、时长、文件大小、笔画数和采样点。
- 复盘面板显示最近导出摘要和最近 3 条本机记录。
- E2E 会真实点击导出视频、等待 WebM 下载、检查本机记录，再点击下载封面并校验 PNG 文件名。

真实化说明：

- 数据来源：真实书写笔迹、最近作品关联练习和 canvas 回放帧。
- 写入状态：`mr-calligraphy-learning-state-v1.videoExportService`。
- 成功反馈：WebM 下载，复盘面板显示导出记录，封面按钮可下载 PNG。
- 失败反馈：无笔迹、浏览器不支持录制或封面生成失败时不写成功记录，并保留最近失败原因。
- 刷新后复现方式：导出记录保存在 localStorage，刷新后仍能查看和下载封面。

仍待补：

- 当前不是 MP4/GIF 转码、云端压缩、后台异步队列或公网分享链路。

验收：

- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增书写视频封面导出记录`

## 45. 2026-06-12 新增书写视频导出队列和失败重试

本次把前台视频导出从“成功后留记录”推进为“每次导出都有队列任务，可失败、可重试、可追踪”。

完成内容：

- `videoExportService.jobs` 保存本机视频导出队列。
- 队列任务包含来源、作品/练习 ID、笔画数、采样点、状态、错误原因和重试来源。
- WebM 导出前先排队，生成中更新为 `running`，成功后更新为 `succeeded` 并关联产物记录。
- 浏览器不支持录制或生成失败时更新为 `failed`，复盘页显示错误原因。
- 失败任务可在复盘页点击“重试”，并从原练习 strokes 重新执行导出。
- 刷新中断的运行中任务会恢复为失败态，避免假运行中。

真实化说明：

- 数据来源：真实 strokes、浏览器 `MediaRecorder` 能力和本机队列状态。
- 写入状态：`mr-calligraphy-learning-state-v1.videoExportService.jobs`。
- 成功反馈：队列显示已完成，WebM 和 PNG 封面仍可下载。
- 失败反馈：队列显示失败原因，并提供真实重试入口。
- 刷新后复现方式：队列和错误状态保存在 localStorage。

仍待补：

- 当前不是页面关闭后的后台导出、Service Worker 队列、服务端压缩转码或 MP4/GIF 输出。

验收：

- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增书写视频导出队列重试`

## 46. 2026-06-12 新增作品分享远端 API adapter

本次把“分享成果”从本机链接继续推进到可对接用户自备远端服务的真实 adapter。

完成内容：

- `shareService` 新增远端模式、endpoint/token、最近状态、最近 publicUrl、packageId、回执和错误状态。
- `MRAppState.getArtworkShareRemotePackage()` 生成 `mr-calligraphy-share-repository-v1` 分享包，包含分享记录、作品分享数据、HTML、文件名和摘要。
- `configureShareServiceRemote()`、`checkRemoteShareService()`、`pushArtworkShareToRemote()` 负责保存远端配置、GET 检查和 PUT 发布。
- 前台复盘区新增“远端分享 API”面板，可保存远端、检查远端、发布分享和复制远端链接。
- 新增 `scripts/share-repository-mock-server.js` 和 `docs/share-repository-api-contract.md`，支持 CORS、Bearer token、publicUrl 和 `mr-calligraphy-share-repository-receipt-v1`。
- `learning-state-check.js` 和 Playwright 主流程覆盖分享包、mock 服务、前台按钮、publicUrl 和回执持久化。

真实化说明：

- 数据来源：真实作品、本机分享记录、分享 HTML、用户配置 endpoint 和真实 fetch 响应。
- 写入状态：`mr-calligraphy-learning-state-v1.shareService` 和对应 `ShareRecord.remotePublicUrl`。
- 成功反馈：复盘区显示远端 publicUrl 和回执摘要，可复制远端链接。
- 失败反馈：非法 endpoint、HTTP 错误、非 JSON、token 错误和包结构错误都会写入本机错误状态。
- 刷新后复现方式：远端配置、publicUrl 和回执在 localStorage 中持久化。

仍待补：

- 当前不是内置账号、微信接口、班级作品墙、生产 CDN、访问权限或服务端撤销审计。

验收：

- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增作品分享远端发布`

## 47. 2026-06-12 新增作品分享远端回执审计

本次把作品分享远端发布从“最近一次状态”推进为“可查看、可导出的本机回执审计链”。

完成内容：

- `MRAppState.getShareRepositoryReceiptAudit()` 返回最近作品分享远端回执、数量、最新回执和边界说明。
- `MRAppState.getShareRepositoryReceiptAuditExport()` 生成离线 HTML 审计页。
- `MRAppState.downloadShareRepositoryReceiptAudit()` 可直接下载 `mr-calligraphy-share-repository-receipts-*.html`。
- 前台复盘区“远端分享 API”新增“回执审计”区，显示最近回执列表和“导出回执”按钮。
- 回执列表展示检查/发布方向、时间、仓库摘要、回执摘要、远端版本、分享数量和 publicUrl 状态。
- 数据层、smoke 和 Playwright 主流程覆盖无回执不可导出、远端 PUT 后回执持久化、HTML 审计下载和下载内容校验。

真实化说明：

- 数据来源：远端分享 API 返回的 `receipt/latestReceipt`，以及本机补充的 direction、endpoint 和 receivedAt。
- 写入状态：`mr-calligraphy-learning-state-v1.shareService.receipts`。
- 成功反馈：复盘区显示回执数量和最近回执，导出 HTML 包含 publicUrl、repositoryDigest、receiptDigest 和原始 JSON。
- 失败反馈：暂无回执时导出按钮禁用，直接调用导出 API 会返回明确失败。
- 刷新后复现方式：回执列表保存在 localStorage，刷新后仍能显示和导出。

仍待补：

- 当前是本机浏览器回执审计，不是生产服务端不可篡改日志、账号权限审计、CDN 访问日志或撤销审计。

验收：

- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增分享远端回执审计`

## 48. 2026-06-12 新增作品分享远端撤销

本次把作品分享远端发布从“能发布、能留回执”继续推进为“能向远端发出撤销请求并留撤销回执”。

完成内容：

- 新增 `MRAppState.getArtworkShareRemoteRevokePackage()`，生成 `mr-calligraphy-share-repository-revoke-v1` 撤销请求体。
- 新增 `MRAppState.revokeArtworkShareRemote()`，通过真实 HTTP `DELETE` 请求撤销远端分享。
- `ShareRecord` 新增 `remoteRevokedAt` 和 `remoteRevokeReceiptDigest`。
- 远端分享回执方向新增 `revoke`，回执审计列表和 HTML 导出可显示“撤销”。
- 前台“远端分享 API”新增“撤销远端”按钮，远端撤销后会禁用复制远端链接，并在分享记录里显示“远端已撤销”。
- `scripts/share-repository-mock-server.js` 支持 `DELETE /api/share-repository`，会记录 `revokedShares`，并在最近包记录上标记 `remoteRevokedAt`。
- 数据层、smoke 和 Playwright 主流程覆盖真实 DELETE、Bearer token、撤销请求体、撤销回执、审计导出和本机状态持久化。

真实化说明：

- 数据来源：已远端发布的本机分享记录、用户配置的远端 endpoint/token 和远端 `DELETE` 响应回执。
- 写入状态：`mr-calligraphy-learning-state-v1.shareService.records[*].remoteRevokedAt`、`remoteRevokeReceiptDigest`、`lastRemoteDirection` 和 `receipts[*]`。
- 成功反馈：复盘区状态显示已请求远端撤销，回执审计最近项显示“撤销”。
- 失败反馈：未配置远端、无远端 publicUrl、已撤销、fetch 不支持、HTTP 错误和非 JSON 都会明确失败，不伪造撤销成功。
- 刷新后复现方式：远端撤销时间和撤销回执保存在 localStorage，刷新后仍能在分享记录和回执审计中看到。

仍待补：

- 当前是对用户自备 endpoint 发出撤销请求，不是内置账号权限、CDN purge、微信分享撤回、服务端访问日志或不可篡改撤销审计。

验收：

- `node scripts/learning-state-check.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增分享远端撤销`

## 49. 2026-06-12 真实化主后台基础物体更新

本次把主后台“新增物体”面板里的“更新所选”从容易被误认为不可用的按钮，补成有浏览器级验收的真实编辑闭环。

完成内容：

- `main-admin.html` 取消 `mainNewObjectUpdate` 的静态 `disabled`，由 `main-admin-scene.js` 在选中状态变化时动态控制是否可点。
- 保留现有 `updateSelectedCustomObject()` 真实逻辑：只能更新新增基础物体，不能伪更新默认模型、导入模型、隐藏、锁定或删除对象。
- smoke test 主后台页面标记新增 `mainObjectSelect`、`mainNewObjectName`、`mainNewObjectType`、`mainNewObjectAdd`、`mainNewObjectUpdate` 和 `mainCustomStatus`。
- Playwright 主后台发布流程新增“新增基础物体后更新名称、类型、颜色、半径和高度”的断言。
- E2E 会读取 `mr-calligraphy-main-scene-layout-v1` 和 `mr-calligraphy-main-scene-published-v1`，确认更新后的 cylinder 规格写入草稿、发布版本和前台读取的发布布局。

真实化说明：

- 数据来源：主后台新增基础物体表单、当前选中的自定义物体和本机布局状态。
- 写入状态：`mr-calligraphy-main-scene-layout-v1.customObjects[*]`，发布后同步进入 `mr-calligraphy-main-scene-published-v1.layout.customObjects[*]`。
- 成功反馈：面板显示“已更新”，发布差异列表显示更新后的对象名称，前台读取发布布局时能看到更新后的类型和尺寸。
- 失败反馈：未选中新增基础物体、对象隐藏、锁定或删除时按钮会禁用或返回明确状态，不写入虚假成功。
- 刷新后复现方式：更新后的对象规格保存在 localStorage，刷新主后台和前台发布页后仍可读取。

仍待补：

- 当前更新范围限于主后台新增的基础几何体；导入模型的网格编辑、材质参数细分和多人协作审计仍需后续扩展。

验收：

- `node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`真实化主后台物体更新`

## 50. 2026-06-12 真实化写实后台删除恢复

本次把写实后台对象“删除物体 / 恢复物体 / 撤回”纳入浏览器级真实验收，避免这些高风险后台操作只停留在按钮存在和脚本函数存在。

完成内容：

- smoke test 写实后台页面标记新增 `designX`、`designY`、`designZ`、`undoAction`、`deleteObject` 和 `restoreObject`。
- Playwright 写实后台流程在发布前先选中当前对象，点击“删除物体”，验证下拉选项显示“已删除”、删除按钮禁用、恢复按钮启用。
- E2E 读取 `mr-calligraphy-realistic-layout-v1`，确认被删对象写入 `deleted: true`。
- E2E 点击“恢复物体”，确认按钮状态回到可删除、`deleted` 写回 `false`。
- E2E 再次删除后点击“撤回”，确认撤回栈能恢复对象，并把本机布局写回未删除状态。

真实化说明：

- 数据来源：写实后台当前选中对象、对象删除/恢复按钮和撤回栈。
- 写入状态：`mr-calligraphy-realistic-layout-v1[objectId].deleted`。
- 成功反馈：对象下拉选项显示“已删除”，按钮状态随删除/恢复切换，发布差异可继续反映草稿变化。
- 失败反馈：已删除对象不能重复删除，未删除对象不能恢复；按钮状态会阻止无效成功。
- 刷新后复现方式：删除状态保存在 localStorage，刷新写实后台或打开写实样张草稿预览时仍按本机布局读取。

仍待补：

- 当前覆盖的是写实后台内置对象的删除/恢复/撤回；导入模型的删除审计、资产文件清理和多人操作审计仍待继续补强。

验收：

- `node --check scripts/smoke-test.js && node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "realistic admin keeps local publish releases and rollback history"`
- `git diff --check`

提交：

- 中文 commit message：`真实化写实后台删除恢复`

## 51. 2026-06-12 新增主后台导入删除审计

本次把主后台导入模型删除从“一条临时状态提示”补成可刷新复现、可导出核对的本机删除审计。

完成内容：

- 主后台“导入模型”区新增“导入模型删除审计”列表和“导出审计”按钮。
- 新增 `mr-calligraphy-main-import-audit-v1` 本机审计记录，最多保留最近 30 条。
- 删除导入模型时记录模型 ID、dbKey、标签、文件名、SHA-256、文件大小、是否被历史快照引用、清理结果和说明。
- 清理结果区分 `storage-deleted`、`retained-for-history`、`delete-failed` 和 `layout-only`。
- 当导入模型仍被历史快照引用时，页面会明确记录“历史保留”，不伪装成文件已清理。
- `window.MRMainImportAudit.getAuditLog()` 和 `getAuditExport()` 可供浏览器验收和人工排查读取。
- Playwright 新增真实 GLB 导入、删除、刷新后审计持久化和 HTML 审计下载断言。

真实化说明：

- 数据来源：主后台真实导入的 GLB / OBJ 模型记录、IndexedDB 模型仓库、当前布局和本机快照历史。
- 写入状态：`mr-calligraphy-main-import-audit-v1.records[*]`。
- 成功反馈：删除后审计列表显示模型名称、清理结果、SHA 摘要和文件大小；导出 HTML 包含完整审计表。
- 失败反馈：文件清理失败会记录 `delete-failed` 和错误信息；被历史快照引用时记录 `retained-for-history`。
- 刷新后复现方式：审计记录保存在 localStorage，刷新主后台后仍显示并可导出。

仍待补：

- 当前是本机浏览器删除审计，不是服务端不可篡改日志、多人权限审计、远端资产签名、云端垃圾回收或资产生命周期策略。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "main admin records imported model deletion audit"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增主后台导入删除审计`

## 52. 2026-06-12 新增写实导入删除审计

本次把写实后台导入模型删除补成可追踪的本机软删除审计，避免用户误以为点击“删除物体”后已经完成资产清理。

完成内容：

- 写实后台导入控件下新增“导入删除审计”面板和“导出审计”按钮。
- 新增 `mr-calligraphy-realistic-import-audit-v1` 本机审计记录，最多保留最近 30 条。
- 删除写实导入模型时记录模型 ID、dbKey、标签、文件名、SHA-256、文件大小和结果。
- 恢复写实导入模型时也记录恢复动作，便于核对删除后的资产仍可恢复。
- 审计状态明确使用 `soft-deleted-retained`：模型从场景中隐藏，但 IndexedDB 文件保留用于恢复。
- 新增 `window.MRRealisticImportAudit.getAuditLog()` 和 `getAuditExport()`，用于浏览器验收和人工排查。
- Playwright 新增真实 GLB 导入、软删除、恢复、刷新后审计持久化和 HTML 审计下载断言。

真实化说明：

- 数据来源：写实后台真实导入的 GLB / OBJ 模型记录、IndexedDB 模型仓库和写实草稿布局。
- 写入状态：`mr-calligraphy-realistic-import-audit-v1.records[*]`，以及 `mr-calligraphy-realistic-layout-v1[modelId].deleted`。
- 成功反馈：审计列表显示模型名称、动作结果、SHA 摘要和文件大小；导出 HTML 明确说明资产保留在 IndexedDB。
- 失败反馈：没有审计记录时导出按钮禁用，直接导出会显示无可导出记录。
- 刷新后复现方式：审计记录和软删除状态都保存在 localStorage，刷新写实后台后仍显示并可导出。

仍待补：

- 当前是写实后台本机软删除审计；后续已补“清理已删除文件”用于物理清理本机 IndexedDB，但仍不是服务端资产删除、CDN purge、账号权限审计或不可篡改日志。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "realistic admin records imported model deletion audit"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增写实导入删除审计`

## 53. 2026-06-12 真实化主后台导入模型外观编辑

本次把主后台导入模型从“只能导入和移动”推进到可真实调整外观：选中导入的 GLB / OBJ 后，可以修改主色调，后台画布立即更新，并写入草稿、发布快照和前台读取布局。

完成内容：

- `main-admin.html` 在导入模型区新增“导入模型外观”控件，包含主色调选择和“更新导入外观”按钮。
- `main-admin-scene.js` 的 `normalizeImportedModel()` 新增 `color` 字段，旧导入记录会归一化为默认 `#c8b08a`。
- 导入时会读取当前主色调；选中导入模型时会把已保存颜色载入编辑器。
- 点击“更新导入外观”会克隆并更新导入模型 mesh 材质，避免污染原始 GLB 材质引用。
- 外观更新会写入 `mr-calligraphy-main-scene-layout-v1.importedModels[*].color`，并支持撤销。
- 发布到前台后，`mr-calligraphy-main-scene-published-v1.layout.importedModels[*].color` 会保留同一颜色。
- `script.js` 前台主场景读取导入模型 `color`，GLB / OBJ 顶点渲染都会按该主色调显示。
- smoke test 主后台页面检查新增外观编辑控件。
- Playwright 新增真实 `.glb` 导入、更新主色调、草稿持久化、发布持久化和前台发布布局读取测试。

真实化说明：

- 数据来源：主后台真实导入模型记录、IndexedDB 模型文件、当前布局和本机发布快照。
- 写入状态：`mr-calligraphy-main-scene-layout-v1.importedModels[*].color`，发布后进入 `mr-calligraphy-main-scene-published-v1.layout.importedModels[*].color`。
- 成功反馈：选中导入模型后状态显示“已载入”，更新后显示“已更新”，后台 Three.js 画布即时变色。
- 失败反馈：未选中导入模型、对象隐藏、锁定或删除时，更新按钮禁用并显示明确提示。
- 刷新后复现方式：颜色保存在 localStorage 布局里，刷新后台或打开前台发布页后仍能读取。

仍待补：

- 当前实现主色调覆盖；导入模型贴图替换、透明度、PBR 参数、文件替换、版本差异对比、写实后台导入模型外观编辑和多人审计仍待继续补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "main admin updates imported model material"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化主后台导入外观编辑`

## 54. 2026-06-12 真实化写实后台导入模型外观编辑

本次把写实后台导入模型也补成可真实编辑外观，和主后台形成一致能力：导入 GLB / OBJ 后可选中模型、调整主色调、即时更新写实 Three.js 画布，并发布到写实演示页。

完成内容：

- `realistic-admin.html` 在导入模型区新增“导入模型外观”控件，包含主色调选择和“更新外观”按钮。
- `realistic-scene.js` 的写实导入模型记录新增 `color` 字段，旧记录会归一化为默认 `#c8b08a`。
- 导入时会读取当前主色调；选中写实导入模型时会回填已保存颜色。
- 点击“更新外观”会克隆并更新导入模型 mesh 材质，后台画布即时变色。
- 外观更新写入 `mr-calligraphy-realistic-layout-v1.importedModels[*].color`，并支持 Ctrl+Z / 撤回按钮回退。
- 发布到演示后，`mr-calligraphy-realistic-published-v1.layout.importedModels[*].color` 会保留同一颜色。
- `realistic-scene.js` 新增 `window.MRRealisticScene.getLayout()`，用于演示页验收当前读取的写实布局。
- smoke test 写实后台页面检查新增外观编辑控件。
- Playwright 新增真实 `.glb` 导入、更新主色调、草稿持久化、发布持久化和写实演示页发布布局读取测试。

真实化说明：

- 数据来源：写实后台真实导入模型记录、IndexedDB 模型文件、写实草稿布局和本机发布快照。
- 写入状态：`mr-calligraphy-realistic-layout-v1.importedModels[*].color`，发布后进入 `mr-calligraphy-realistic-published-v1.layout.importedModels[*].color`。
- 成功反馈：选中导入模型后状态显示“已载入”，更新后显示“已更新”，写实后台画布即时变色。
- 失败反馈：未选中导入模型或导入模型已删除时，更新按钮禁用并显示明确提示。
- 刷新后复现方式：颜色保存在写实 layout 中，刷新后台或打开写实演示发布页后仍能读取。

仍待补：

- 当前实现主色调覆盖；贴图替换、透明度、PBR 参数、导入文件替换、版本差异对比、服务端资产签名和多人审计仍待继续补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "realistic admin updates imported model material"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化写实导入外观编辑`

## 55. 2026-06-12 真实化导入模型透明度编辑

本次把导入模型外观从“只改主色调”推进到可真实调整透明度：主后台和写实后台都能选中真实导入的 GLB / OBJ，修改透明度，写入草稿和发布快照；普通前台 WebGL 渲染也会读取 alpha。

完成内容：

- `main-admin.html` 和 `realistic-admin.html` 的导入模型外观区新增透明度滑杆和数值显示。
- `main-admin-scene.js` 与 `realistic-scene.js` 的导入模型记录新增 `opacity` 字段，旧记录默认归一化为 `1`，编辑范围限制为 `0.2-1`。
- 导入模型时会读取当前透明度；选中导入模型时会回填已保存透明度。
- 点击“更新导入外观 / 更新外观”会克隆并更新导入模型材质，设置 `opacity`、`transparent` 和 `depthWrite`，后台画布即时显示半透明效果。
- 透明度写入 `mr-calligraphy-main-scene-layout-v1.importedModels[*].opacity` 和 `mr-calligraphy-realistic-layout-v1.importedModels[*].opacity`。
- 发布后透明度进入 `mr-calligraphy-main-scene-published-v1.layout.importedModels[*].opacity` 和 `mr-calligraphy-realistic-published-v1.layout.importedModels[*].opacity`。
- `script.js` 的普通前台 WebGL 顶点格式从 RGB 扩展到 RGBA，GLB / OBJ 导入模型会把 `opacity` 写入顶点 alpha，并启用 alpha blend。
- smoke test 主后台和写实后台页面检查新增透明度控件。
- Playwright 更新主后台和写实后台导入模型外观用例，验证真实 `.glb` 导入、透明度更新、草稿持久化、发布持久化和演示页布局读取。

真实化说明：

- 数据来源：真实导入模型记录、IndexedDB 模型文件、草稿布局和本机发布快照。
- 写入状态：主后台与写实后台的 `importedModels[*].opacity`，发布后进入各自 published layout。
- 成功反馈：选中导入模型后透明度滑杆回填；更新后状态栏提示已写入，后台画布立即显示透明效果。
- 失败反馈：未选中导入模型、隐藏、锁定或删除时，更新按钮禁用并显示原因。
- 刷新后复现方式：刷新后台或打开发布演示页，透明度仍由本机布局读取。

仍待补：

- 当前完成主色调和透明度；贴图替换、PBR 参数、导入文件替换、版本差异对比、远端资产签名和多人审计仍待继续补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型透明度编辑`

## 56. 2026-06-12 真实化导入模型文件替换

本次把导入模型从“想换文件只能删除后重导”推进到可真实替换资产：主后台和写实后台都能在选中导入模型后选择新的 GLB / OBJ，保留原对象 ID、位置、旋转、缩放和发布引用，同时更新文件名、类型、SHA-256、metrics 和 IndexedDB 二进制。

完成内容：

- `main-admin.html` 和 `realistic-admin.html` 的导入模型外观区新增“替换当前模型”文件选择器。
- 主后台替换时保留 `importedModels[*].id/dbKey/label/color/opacity`，更新 `fileName/type/sha256/metrics/baseScale`，并覆盖 IndexedDB 中同一 `dbKey` 的模型文件。
- 写实后台替换时保留 `id/dbKey/label/color/opacity`，更新 `fileName/type/sha256/metrics`，并覆盖写实导入模型仓库中的同一文件记录。
- 替换后后台 Three.js 场景会即时卸载旧 mesh、释放几何体/材质、加载新模型并重新注册可选择 mesh。
- 替换动作支持撤销：撤销会把旧模型二进制和旧导入记录写回本机。
- 发布后，替换后的文件信息进入 `mr-calligraphy-main-scene-published-v1` 和 `mr-calligraphy-realistic-published-v1`。
- 普通前台 `script.js` 现在保留导入模型的 `sha256` 和 `metrics`，前台发布布局可验收替换后的资产摘要。
- smoke test 主后台和写实后台页面检查新增替换文件控件。
- Playwright 新增主后台和写实后台真实 `.glb` 导入、替换为另一个 `.glb`、草稿持久化、发布持久化和演示页布局读取测试。

真实化说明：

- 数据来源：真实文件选择器、真实 GLB/OBJ 解析、IndexedDB 模型仓库、草稿布局和发布快照。
- 写入状态：`importedModels[*].fileName/type/sha256/metrics/baseScale`，以及同一 `dbKey` 下的 IndexedDB 二进制。
- 成功反馈：状态栏显示替换文件名和模型 metrics，后台画布立即显示新模型。
- 失败反馈：未选中导入模型、对象隐藏/锁定/删除、文件为空、格式不合法或解析失败时均显示明确错误，不写入替换结果。
- 刷新后复现方式：刷新后台或打开发布演示页，模型记录和二进制均从本机存储读取替换后的文件。

仍待补：

- 当前完成主色调、透明度和文件替换；贴图替换、PBR 参数、版本差异对比、远端资产签名和多人审计仍待继续补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "replaces imported model file"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型文件替换`

## 57. 2026-06-12 真实化导入模型 PBR 参数编辑

本次把导入模型外观从“颜色、透明度和文件替换”继续推进到可真实编辑 PBR 材质参数：主后台和写实后台都能调整粗糙度与金属度，参数写入草稿和发布快照；普通前台 WebGL 也会读取这些参数并在 shader 中体现高光和金属感变化。

完成内容：

- `main-admin.html` 和 `realistic-admin.html` 的导入模型外观区新增粗糙度、金属度滑杆和数值显示。
- `main-admin-scene.js` 与 `realistic-scene.js` 的导入模型记录新增 `roughness`、`metalness` 字段，旧记录会归一化到默认值。
- 导入模型时会读取当前 PBR 滑杆；选中导入模型时会回填已保存 PBR 参数。
- 点击“更新导入外观 / 更新外观”会克隆并更新导入模型材质，设置 `roughness` 和 `metalness`，后台画布即时显示材质变化。
- 替换模型文件时保留原对象的颜色、透明度、粗糙度和金属度。
- 发布后 PBR 参数进入 `mr-calligraphy-main-scene-published-v1` 和 `mr-calligraphy-realistic-published-v1`。
- 普通前台 `script.js` 的 WebGL 顶点格式扩展到 14 个 float，新增材质 attribute，GLB / OBJ 导入模型会把 `roughness/metalness` 写入 shader。
- `appendTransformedVertices` 同步修正为 RGBA + normal + material 的统一顶点步长，避免局部几何 normal 错位。
- smoke test 主后台和写实后台页面检查新增 PBR 控件。
- Playwright 更新主后台和写实后台导入模型外观用例，验证真实 `.glb` 导入、PBR 更新、草稿持久化、发布持久化和演示页布局读取。

真实化说明：

- 数据来源：真实导入模型记录、IndexedDB 模型文件、草稿布局和本机发布快照。
- 写入状态：`importedModels[*].roughness` 和 `importedModels[*].metalness`，发布后进入各自 published layout。
- 成功反馈：选中导入模型后 PBR 滑杆回填；更新后状态栏提示已写入，后台画布立即使用新材质。
- 失败反馈：未选中导入模型、隐藏、锁定或删除时，更新按钮禁用并显示原因。
- 刷新后复现方式：刷新后台或打开发布演示页，PBR 参数仍由本机布局读取。

仍待补：

- 当前完成主色调、透明度、文件替换和 PBR 参数；贴图替换、版本差异对比、远端资产签名和多人审计仍待继续补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js && node --check script.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型PBR参数编辑`

## 58. 2026-06-12 真实化导入模型发布差异明细

本次把导入模型发布差异从“只显示某个模型被修改”推进到能说明具体变化：主后台和写实后台在发布前会列出导入模型的文件、SHA、颜色、透明度、粗糙度、金属度和位置/缩放等差异，用户可以判断这次发布到底会改变什么。

完成内容：

- `main-admin-scene.js` 的主场景发布差异 item 现在保留原始 diff value，用于生成字段级摘要。
- 主后台导入模型新增差异会显示文件名、SHA、颜色、透明度、粗糙度、金属度和位置/缩放摘要。
- 主后台导入模型修改差异会显示旧值到新值，例如 `粗糙度 0.35 → 0.82`。
- 主后台导入模型删除差异会标注“将从发布版本移除”，并保留被删除资产摘要。
- `realistic-scene.js` 的写实发布差异同步支持导入模型字段级摘要。
- 写实后台导入模型修改差异会显示文件、SHA、颜色、透明度、粗糙度、金属度和位置旋转变化。
- Playwright 导入模型材质用例新增发布差异断言，覆盖新增时的 PBR 摘要和发布后草稿再次修改时的旧值/新值对比。

真实化说明：

- 数据来源：当前草稿 layout、已发布 layout 和两者的归一化导入模型记录。
- 写入状态：本功能不新增存储字段，而是从真实草稿/发布快照实时计算差异。
- 成功反馈：发布差异列表会显示具体字段变化，而不是只显示模型名称。
- 失败反馈：无发布差异时仍显示“当前草稿与已发布版本一致”。
- 刷新后复现方式：只要草稿和已发布快照仍存在，刷新后台后差异明细会重新计算。

仍待补：

- 当前完成导入模型发布差异明细；贴图替换、远端资产签名、服务端多人审计和更复杂三方合并仍待继续补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型发布差异明细`

## 59. 2026-06-12 真实化写实导入模型已删除文件物理清理

本次把写实后台导入模型删除从“只可软删除和恢复”推进到可明确执行本机文件清理：用户先删除导入模型，确认不再恢复后，可点击“清理已删除文件”永久删除 IndexedDB 中的模型二进制，并从写实草稿移除导入记录。

完成内容：

- `realistic-admin.html` 的导入删除审计面板新增“清理已删除文件”按钮。
- `realistic-scene.js` 新增已删除导入模型筛选，只有 `layout[modelId].deleted === true` 的导入模型可被清理。
- 清理前弹出确认，避免把软删除的可恢复资产误删。
- 清理成功后调用导入模型仓库 `delete(record)`，删除 `mr-calligraphy-model-store.models` 中的 IndexedDB 文件。
- 清理成功后从 `mr-calligraphy-realistic-layout-v1.importedModels` 和对象状态中移除记录，并从当前 Three.js 场景和对象下拉框移除该对象。
- 审计日志新增 `storage-deleted` 和 `delete-failed` 状态，HTML 导出说明软删除和物理清理的边界。
- smoke test 写实后台页面检查新增 `realisticImportAuditCleanup` 标记。
- Playwright 写实导入删除审计用例覆盖软删除、恢复、再次删除、确认清理、IndexedDB 记录消失、草稿记录移除、刷新后审计持久化和 HTML 审计下载。

真实化说明：

- 数据来源：写实草稿 layout、写实导入模型记录和 IndexedDB 模型仓库。
- 写入状态：清理成功会移除 `importedModels[*]` 和 `layout[modelId]`，并在 `mr-calligraphy-realistic-import-audit-v1.records[*].cleanupStatus` 写入 `storage-deleted`。
- 成功反馈：状态栏显示已清理数量，审计列表显示“文件已清理”，清理按钮在没有已删除模型时禁用。
- 失败反馈：IndexedDB 删除失败时保留草稿记录并写入 `delete-failed` 审计。
- 刷新后复现方式：刷新写实后台后，被清理模型不再出现在草稿导入列表，审计记录仍可查看和导出。

仍待补：

- 当前完成的是本机 IndexedDB 文件清理；服务端资产删除、CDN purge、远端资产签名、账号权限审计、多人协作审计和不可篡改日志仍未完成。

验收：

- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js && node --check scripts/smoke-test.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "realistic admin records imported model deletion audit"`
- `git diff --check`

提交：

- 中文 commit message：`真实化写实导入模型物理清理`

## 60. 2026-06-12 真实化前台学习详情总结

本次把前台最后一步“查看详情”从一行报告预览升级为结构化本机总结面板，点击后会读取真实学习路径、练习、作品、报告和计划状态，显示任务完成度、路径步骤、最近作品、最近报告和下一步建议。

完成内容：

- `script.js` 新增 `buildCompletionDetail()`，复用现有 `actionDetail` 面板渲染真实详情。
- “查看详情”点击后返回 `detail`，不再只显示 `getReportPreview()` 一行文本。
- 详情指标展示路径完成步数、任务完成状态、真实练习次数、作品数量、报告数量和平均评分。
- 详情徽章展示 10 个学习步骤的完成/待完成/锁定状态。
- 详情列表展示最近作品、最近报告、学习计划和下一步建议，并注明数据来自浏览器本机记录。
- Playwright 前台完整流程新增断言：完成真实笔迹、保存作品、导出报告后进入第 10 步点击“查看详情”，确认详情面板显示本机学习详情、路径、真实练习和最近报告。

真实化说明：

- 数据来源：`MRAppState.getStats()` 和 `MRAppState.getLearningPathStatus()`。
- 写入状态：不新增存储字段；该详情由当前本机学习状态实时计算。
- 成功反馈：`#actionFeedback` 显示“已读取本机学习详情”，`#actionDetail` 展示指标、步骤徽章和后续建议。
- 失败反馈：如果没有作品、报告或计划，会显示对应空状态，而不是伪造完成数据。
- 刷新后复现方式：刷新后只要本机学习记录仍在 localStorage，进入第 10 步点击“查看详情”会重新生成同样的总结。

仍待补：

- 当前完成前台本机详情总结；移动端视口覆盖已在后续第 61 节完成，导入模型贴图替换已在后续第 62 节完成；服务端资产回收、账号权限和多人协作审计仍待继续补齐。

验收：

- `node --check script.js && node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`真实化前台学习详情总结`

## 61. 2026-06-12 真实化移动端视口验收

本次把“移动端是否真的可用”从人工观感检查推进到自动浏览器验收：Playwright 会以 390×844 手机视口依次打开前台、主后台、写实后台和写实演示页，检查核心面板不横向溢出、不相互遮挡，并确认 WebGL / Canvas 画布仍有非空像素输出。

完成内容：

- `tests/e2e/real-flows.spec.js` 新增 `mobile viewports keep core panels usable without overlap` 用例。
- 新增 `expectNoHorizontalOverflow()`，读取页面真实 `scrollWidth`，防止窄屏出现不可见横向溢出。
- 新增 `expectBoxInsideViewport()`，检查核心面板的左右边界、顶部和可用高度。
- 新增 `expectBoxesDoNotOverlap()`，检查前台主面板、后台风险提示和编辑面板之间没有重叠。
- 移动端验收覆盖 `/`、`/main-admin.html`、`/realistic-admin.html` 和 `/realistic-demo.html` 四个入口。
- 验收继续复用 `expectCanvasHasVisiblePixels()`，确认前台、主后台、写实后台和写实演示页画布不是空白 DOM。
- 修复 `realistic-demo.css` 中写实后台移动端布局：权限风险提示限制高度并可滚动，编辑面板从提示下方开始，避免 390px 宽手机视口下遮挡。

真实化说明：

- 数据来源：真实浏览器布局盒、真实页面滚动宽度和真实 canvas 像素采样。
- 写入状态：不新增业务状态；只调整移动端 CSS 布局，并增加可回归的 E2E 验收。
- 成功反馈：Playwright 明确通过四个入口的面板边界、面板不重叠和画布非空检查。
- 失败反馈：如果后续改样式导致后台提示遮住编辑面板，测试会直接指出重叠的选择器。
- 刷新后复现方式：任意刷新对应页面并缩窄到手机视口，后台面板仍保留完整滚动编辑能力。

仍待补：

- 当前完成 390×844 手机视口核心入口验收；导入模型贴图替换已在后续第 62 节完成；服务端资产回收、账号权限、多用户协作审计、更多设备矩阵和所有下载触屏路径仍待继续补齐。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "mobile viewports keep core panels usable"`
- `git diff --check`

提交：

- 中文 commit message：`真实化移动端视口验收`

## 62. 2026-06-12 真实化导入模型贴图替换

本次把主后台和写实后台的导入模型外观从“颜色/PBR 参数”推进到真实贴图替换：选中已导入 GLB / OBJ 后，可以上传 PNG、JPG 或 WebP 作为当前模型贴图，贴图二进制写入 IndexedDB，布局记录保存贴图摘要，发布差异显示贴图变化，发布后前台/写实演示页能读取同一份贴图记录。

完成内容：

- `model-import-utils.js` 新增导入贴图类型识别、大小校验、MIME 归一化和贴图记录规范化。
- `main-admin.html` 和 `realistic-admin.html` 在导入模型外观区新增“替换当前贴图”文件选择器。
- `main-admin-scene.js` 与 `realistic-scene.js` 支持读取贴图 ArrayBuffer、计算 SHA-256、存入 IndexedDB，并把 `texture` 记录写入导入模型草稿。
- 两个后台加载导入模型时会从 IndexedDB 读取贴图并挂到 Three.js `MeshStandardMaterial.map`，换贴图后后台画布立即刷新。
- 换贴图进入撤销栈；撤销时会重新读取旧贴图或清空贴图，避免连续换贴图后材质对象和记录不一致。
- 发布差异明细新增贴图名称和贴图 SHA 摘要，新增/修改导入模型时能看见贴图变更。
- `script.js` 前台主场景读取发布布局中的贴图记录，从 IndexedDB 取回贴图二进制，并为带贴图的导入模型创建独立 WebGL mesh 绘制。
- 前台 GLB 解析新增 `TEXCOORD_0` 读取，OBJ 解析新增 `vt` 读取；没有 UV 的 OBJ 会使用三角形默认 UV 兜底。
- Playwright 扩展主后台和写实后台材质用例，覆盖上传真实 PNG 贴图、IndexedDB 资产存在、草稿持久化、发布持久化、发布差异和前台/演示页读取。

真实化说明：

- 数据来源：用户上传的真实图片文件、浏览器 `File.arrayBuffer()`、SHA-256 摘要、IndexedDB 模型资产仓库和本机发布布局。
- 写入状态：主后台写入 `mr-calligraphy-main-model-store` 与 `mr-calligraphy-main-scene-layout-v1.importedModels[*].texture`；写实后台写入 `mr-calligraphy-model-store` 与 `mr-calligraphy-realistic-layout-v1.importedModels[*].texture`。
- 成功反馈：后台状态显示“已替换贴图”，发布差异显示贴图名称，前台暴露 `MR_LOADED_TEXTURED_MODEL_COUNT` 便于确认 WebGL 已加载贴图模型。
- 失败反馈：未选中导入模型、对象不可编辑、贴图为空、格式不是 PNG/JPG/WebP 或超过 8MB 时均明确失败。
- 刷新后复现方式：刷新后台或打开发布页后，贴图记录仍从布局读取，贴图二进制仍从 IndexedDB 读取。

仍待补：

- 当前完成本机贴图替换和发布读取；贴图随项目档案导出导入的完整资产打包已在第 63 节完成，贴图移除/恢复原材质已在第 64 节完成；服务端资产签名、CDN purge、账号权限和多人协作审计仍待继续补齐。

验收：

- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check script.js && node --check tests/e2e/real-flows.spec.js`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型贴图替换`

## 63. 2026-06-12 真实化项目档案贴图资产恢复

本次把项目档案里的导入模型贴图从“布局摘要里看得到”推进到“资产清单、哈希校验、选择恢复和审计摘要都能真实覆盖”：只选择恢复某个导入模型时，系统会自动把该模型引用的贴图 IndexedDB 记录一起纳入校验与恢复，避免发布页刷新后模型存在但贴图丢失。

完成内容：

- `project-schema-utils.js` 的 `assetManifest` 新增 `assetCount`、`textureAssetCount` 和 `missingTextureBinaryCount`，并把导入贴图作为 `assetKind: "texture"` 的关联资产。
- 资产索引同时按 `id`、`dbKey` 和 `key` 建立映射，避免主后台与写实后台 keyPath 不同导致贴图误判缺文件。
- 项目仓库状态新增 `summary.textureAssetCount`，场景资产状态会显示导入模型数量和贴图数量。
- `project-archive.js` 的导入预览把贴图区分为“新增贴图/修改贴图/删除贴图”，不再把贴图混算成模型。
- 选择性恢复 IndexedDB 模型时，会递归扩展 `texture.dbKey` 依赖；显式只勾模型，也会自动恢复同档案内的贴图记录。
- `validateArchiveAssetHashes()` 现在会对选择恢复模型的关联贴图一起做 SHA-256 校验，贴图哈希错误会阻止恢复且不会先写 localStorage。
- 恢复审计和导入预览文案改为“导入资产/资产哈希”，审计摘要会计入自动依赖的贴图资产。
- `scripts/project-schema-check.js`、`scripts/archive-asset-hash-check.js` 和 `scripts/archive-migration-check.js` 增加贴图资产清单、选择恢复依赖和哈希阻断覆盖。

真实化说明：

- 数据来源：项目档案 IndexedDB 快照中的真实模型二进制记录、贴图二进制记录、布局中的 `importedModels[*].texture` 摘要和 SHA-256。
- 写入状态：选择恢复模型时，贴图资产会写回同一 IndexedDB 模型仓库；布局仍只保留 `texture.dbKey` 与可校验摘要。
- 成功反馈：导入预览可见新增贴图，项目仓库状态显示贴图数量，恢复后同一模型能继续读取贴图资产。
- 失败反馈：贴图二进制哈希不匹配时恢复被阻止，并且不会先覆盖 localStorage。
- 刷新后复现方式：导入带贴图的项目档案，只勾选模型恢复，刷新后台或前台发布页后贴图仍能从 IndexedDB 读取。

仍待补：

- 当前完成项目档案本机贴图资产打包、校验和选择恢复；贴图移除/恢复原材质已在第 64 节完成；服务端资产签名、CDN purge、账号权限和多人协作审计仍待继续补齐。

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

## 64. 2026-06-12 真实化导入模型贴图移除

本次把“替换当前贴图”补成完整可逆的外观控制：主后台和写实后台都新增“移除当前贴图”，点击后会移除当前草稿模型的 `texture` 引用、恢复颜色/PBR 材质、进入撤销栈，并在发布差异中显示贴图从文件名变为空。

完成内容：

- `main-admin.html` 新增 `mainImportModelTextureClear`，`realistic-admin.html` 新增 `realisticImportModelTextureClear`。
- 两个按钮均标记为 `data-feature-state="real-local"`，控件清单会纳入真实本机功能统计。
- `main-admin-scene.js` 和 `realistic-scene.js` 新增移除贴图处理，复用 `import-material-update` 撤销记录。
- 移除时只清除当前布局记录的 `texture` 引用，不物理删除 IndexedDB 贴图文件，避免历史快照或已发布版本引用失效。
- 移除后重新调用 `applyImportedRecordToEntry()`，后台画布立即恢复颜色/PBR 材质。
- 按钮在未选中导入模型、对象不可编辑或当前无贴图时禁用，上传贴图后启用，移除后再次禁用。
- 发布差异会显示 `贴图 文件名 → 空`；重新上传后仍可继续发布给前台或写实演示页读取。
- Playwright 主后台和写实后台材质用例扩展为：上传贴图、移除贴图、确认草稿为空、确认原贴图资产仍保留、重新上传并发布读取。

真实化说明：

- 数据来源：当前选中导入模型的本机布局记录、IndexedDB 贴图资产和发布差异比较。
- 写入状态：写入 `importedModels[*].texture = null` 并保存草稿；不删除 IndexedDB 二进制。
- 成功反馈：后台状态显示“已移除贴图”，按钮禁用，发布差异显示贴图移除。
- 失败反馈：未选中导入模型、对象隐藏/锁定/删除或没有贴图时不会伪造成功。
- 刷新后复现方式：移除贴图后刷新后台，模型仍保持无自定义贴图；历史/已发布版本仍可读取原贴图资产。

仍待补：

- 当前完成本机贴图移除和恢复原材质；服务端资产签名、远端资产垃圾回收、CDN purge、账号权限和多人协作审计仍待继续补齐。

验收：

- `node --input-type=module --check < main-admin-scene.js`
- `node --input-type=module --check < realistic-scene.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `npm run test:e2e -- --grep "admin updates imported model material"`
- `git diff --check`

提交：

- 中文 commit message：`真实化导入模型贴图移除`

## 65. 2026-06-12 真实化远端发布资产签名回执

本次把远端发布从“发送资产清单并保留普通回执”推进到“远端服务对已哈希资产返回可审计签名回执”：发布包现在会把导入模型文件和导入模型贴图都纳入 `assetManifest`，mock 服务会对每个有 SHA-256 的资产生成 HMAC-SHA256 开发签名，后台回执列表和审计导出都能看到签名数量。

完成内容：

- `project-remote-publish.js` 的资产清单新增 `assetKind: "model" | "texture"`、`modelId`、`assetCount`、`modelAssetCount` 和 `textureAssetCount`。
- 导入模型贴图会跟随 `importedModels[*].texture` 进入远端发布资产清单，贴图 `dbKey` 与布局不一致时预检失败。
- 远端回执规范化新增 `assetSignatureSummary` 和 `assetSignatures`，并随本机回执审计持久化。
- 主后台和写实后台远端发布回执列表会显示“资产签名 N”。
- 回执审计 HTML 新增 `Asset Signatures` 字段，原始 receipt JSON 保留签名明细。
- `scripts/remote-publish-mock-server.js` 对每个带 SHA-256 的模型/贴图资产生成 HMAC-SHA256 开发签名；缺哈希资产只进入 warning。
- `docs/remote-publish-api-contract.md` 补齐模型/贴图资产清单、签名回执结构和 mock/HMAC 边界。
- `scripts/remote-publish-check.js` 验证模型/贴图资产清单、签名摘要、签名明细、mock 服务 HMAC、审计导出和状态持久化。

真实化说明：

- 数据来源：本机发布 layout、导入模型与贴图 SHA-256、远端 POST 响应和 mock 服务签名回执。
- 写入状态：推送成功后写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts[*].assetSignatureSummary` 与 `assetSignatures`。
- 成功反馈：后台回执列表显示资产签名数量，导出的 HTML 审计包含签名摘要。
- 失败反馈：缺少 SHA-256 的资产不会生成假签名；资产清单与布局不一致会阻止发布包通过预检。
- 刷新后复现方式：远端回执保存在本机远端发布状态中，刷新后台仍能看到最近签名摘要。

仍待补：

- 当前完成的是 mock/HMAC 开发签名回执；CDN upload 回执已在后续第 67 节记录完成。它仍不是生产证书签名、账号权限审计或服务端不可篡改审计链。

验收：

- `node --check project-remote-publish.js`
- `node --check scripts/remote-publish-mock-server.js`
- `node --check scripts/remote-publish-check.js`
- `node scripts/remote-publish-check.js`
- `git diff --check`

提交：

- 中文 commit message：`真实化远端发布资产签名回执`

## 66. 2026-06-12 真实化远端发布撤销与 CDN purge 回执

本次把远端发布从“只能推送和看回执”补成“可撤销、可审计、可释放发布锁”的闭环：后台会对最近一条远端发布回执生成撤销包，真实发送 `DELETE`，保存撤销回执和 CDN purge 摘要，并在撤销后禁用重复撤销。

完成内容：

- `main-admin.html` 新增 `mainRemotePublishRevoke`，`realistic-admin.html` 新增 `realisticRemotePublishRevoke`。
- 两个按钮均标记为 `data-feature-state="real-local"`，控件清单更新为主后台 40 个 `real-local`、写实后台 26 个 `real-local`。
- `project-remote-publish.js` 新增 `revokeKind`、`revoke()`、撤销包生成、撤销回执规范化、`lastRevokedAt` 和 `lastRemoteDirection`。
- 撤销成功后清空本机发布锁，最新回执方向为 `revoke` 时不再允许继续撤销。
- 回执列表显示“发布 / 撤销”，撤销回执展示 `purge N`；回执审计 HTML 新增 `Direction`、`Source Package`、`Revoked At` 和 `CDN Purge`。
- `scripts/remote-publish-mock-server.js` 支持 `DELETE /api/remote-publish`，返回 `mr-calligraphy-remote-publish-revoke-receipt-v1` 和 `mock-cdn` purge 摘要。
- `tests/e2e/real-flows.spec.js` 主后台发布流程新增远端撤销校验，确认 DELETE body、状态栏、回执列表和 localStorage。
- `docs/remote-publish-api-contract.md` 新增撤销发布与 CDN purge 回执合同。

真实化说明：

- 数据来源：最近发布回执、远端 DELETE 响应和服务端返回的 `cdnPurgeSummary`。
- 写入状态：写入 `mr-calligraphy-remote-publish-v1` 的撤销回执、最近撤销时间和最近远端方向。
- 成功反馈：状态栏显示远端撤销结果，回执列表显示“撤销 / purge N”，审计导出保留 CDN purge 摘要。
- 失败反馈：无 endpoint、无最近发布回执、远端 404/422 或网络失败时不会伪造撤销成功。
- 刷新后复现方式：刷新后台后仍可在远端发布回执审计中看到撤销方向、原 package 和 purge 摘要。

仍待补：

- 当前是用户自备 endpoint 与本机 mock 服务的开发级撤销；不是内置账号权限、生产 CDN 失效保证、服务端不可篡改审计或远端审批系统。

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

## 67. 2026-06-12 真实化远端发布 CDN 上传回执

本次把远端发布从“只保存资产签名和撤销 purge”补成“发布成功时也能看到 CDN 上传摘要”：服务端响应里的 `cdnUploadSummary` 会被规范化、持久化并进入回执审计，后台回执列表能直接看到 CDN URL 数量。

完成内容：

- `project-remote-publish.js` 新增 `cdnUploadSummary` 规范化，发布回执会保存上传状态、provider、request id、URL 数量、base URL 和资产摘要。
- 回执审计 HTML 新增 `CDN Upload` 字段，原始 receipt JSON 保留服务端上传摘要。
- 主后台和写实后台远端发布回执列表新增 `CDN N` 摘要。
- `scripts/remote-publish-mock-server.js` 在真实 POST 接收发布包后，为已签名模型/贴图资产生成 mock CDN URL。
- `scripts/remote-publish-check.js` 覆盖 fake fetch 和真实 mock server 的 CDN upload 摘要、URL 数量、provider、审计导出和持久化。
- 主后台 E2E 模拟远端发布返回 CDN upload 摘要，验证回执列表显示 `CDN 1` 且 localStorage 持久化。
- `docs/remote-publish-api-contract.md` 补齐 POST 成功回执里的 CDN upload 字段和 mock/生产边界。

真实化说明：

- 数据来源：远端 POST 成功响应中的 `cdnUploadSummary` 和 mock server 根据已签名资产生成的 URL 明细。
- 写入状态：写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts[*].cdnUploadSummary`。
- 成功反馈：后台回执列表显示 `CDN N`，审计导出显示 CDN upload 状态、provider、URL 数量和 base URL。
- 失败反馈：没有服务端返回 CDN upload 字段时不会伪造成功，只显示“无 CDN upload 回执”。
- 刷新后复现方式：刷新后台后仍可从远端发布回执审计读取 CDN 上传摘要。

仍待补：

- 当前是开发级 mock CDN URL 回执；不是生产 CDN 实际上传、账号空间隔离、CDN 回调验签或不可篡改服务端审计。

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

- 中文 commit message：`真实化远端发布CDN上传回执`

## 68. 2026-06-12 计划仓库 Workspace 空间隔离

本次把计划仓库从“同一个 endpoint 只有一个最近包”推进到“同一个 endpoint 下可按 Workspace 隔离”。这不是完整账号系统，但已经能让班级、账号或项目空间作为第一层同步边界。

完成内容：

- 前台计划仓库远端配置新增 `Workspace` 输入，刷新后会从 `planRepository.workspaceId` 恢复。
- `MRAppState.configurePlanRepositoryRemote()` 支持 `workspaceId` / `remoteWorkspaceId` / `accountId`，切换 endpoint 或 workspace 时清空当前回执视图，避免跨空间误读。
- `getPlanRepositoryPackage()` 输出顶层 `workspaceId` 和 `source.workspaceId`。
- 远端 GET / PUT 请求统一携带 `X-MR-Workspace-Id` header，回执审计和状态文案显示当前 workspace。
- `scripts/plan-repository-mock-server.js` 支持按 workspace 分桶保存 package 和 receipts，并保留最近 workspace 兼容状态。
- 数据层和 E2E 补充 Workspace header、包字段、回执持久化、mock server 空间隔离和切回原空间读取。
- `docs/plan-repository-api-contract.md` 补充 Workspace header、包字段、回执字段和生产边界。

真实化说明：

- 数据来源：前台用户配置的 endpoint/token/workspace、本机计划同步包和远端计划仓库响应。
- 写入状态：`mr-calligraphy-learning-state-v1.planRepository.workspaceId`、计划仓库包 `workspaceId`、最近回执 `workspaceId` 和 mock server `state.workspaces`。
- 成功反馈：远端状态显示空间，回执列表显示 workspace，mock 服务能分别保存 `alpha-class` 和 `beta-class`。
- 失败反馈：远端未配置、token 错误、HTTP 错误、非 JSON、PUT 422 或网络中断仍走现有错误状态，不伪造同步成功。
- 刷新后复现方式：刷新前台后 Workspace 输入会恢复，后续检查/推送/拉取继续使用同一空间。

仍待补：

- 当前只是账号化 repository 前的空间隔离 adapter；真正登录态、角色权限、token 刷新、教师端通知、后台推送和服务端不可篡改审计仍未完成。

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

## 69. 2026-06-12 学习档案仓库 Workspace 空间隔离

本次把学习档案仓库从“同一个 endpoint 只有一个最近档案包”推进到“同一个 endpoint 下可按 Workspace 隔离”。这不是完整账号系统，但已经能防止班级、账号或项目空间共用同一 mock/adapter 时互相读写最近包。

完成内容：

- 前台学习档案远端配置新增 `Workspace` 输入，刷新后会从 `historyRepository.workspaceId` 恢复。
- `MRAppState.configureHistoryRepositoryRemote()` 支持 `workspaceId` / `remoteWorkspaceId` / `accountId`，切换 endpoint 或 workspace 时清空当前冲突审计视图，避免跨空间误读。
- `getHistoryRepositoryPackage()` 输出顶层 `workspaceId` 和 `source.workspaceId`。
- 远端 GET / PUT 请求统一携带 `X-MR-Workspace-Id` header，状态文案显示当前 workspace。
- `scripts/history-repository-mock-server.js` 支持按 workspace 分桶保存 package 和 receipts，并保留最近 workspace 兼容状态。
- 数据层和 E2E 补充 Workspace header、包字段、本机状态持久化、mock server 空间隔离、切回原空间读取、分页追取和冲突审计。
- `docs/history-repository-api-contract.md` 补充 Workspace header、包字段、回执字段、mock 隔离和生产边界。

真实化说明：

- 数据来源：前台用户配置的 endpoint/token/workspace、本机学习档案同步包和远端学习档案仓库响应。
- 写入状态：`mr-calligraphy-learning-state-v1.historyRepository.workspaceId`、学习档案仓库包 `workspaceId` 和 mock server `state.workspaces`。
- 成功反馈：远端状态显示空间，mock 服务能分别保存 `history-alpha` 和 `history-beta`，切回原空间能读取原 package。
- 失败反馈：远端未配置、token 错误、HTTP 错误、非 JSON、PUT 422 或网络中断仍走现有错误状态，不伪造同步成功。
- 刷新后复现方式：刷新前台后 Workspace 输入会恢复，后续检查/推送/拉取继续使用同一空间。

仍待补：

- 当前只是账号化 repository 前的空间隔离 adapter；真正登录态、角色权限、token 刷新、服务端教师批注审计、长期归档和不可篡改审计仍未完成。

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

## 70. 2026-06-12 报告仓库 Workspace 空间隔离

本次把报告仓库从“同一个 endpoint 只有一个最近报告包”推进到“同一个 endpoint 下可按 Workspace 隔离”。这不是完整账号系统，但已经能让班级、账号或项目空间在报告同步、验真摘要和签名回执上形成第一层远端边界。

完成内容：

- 前台远端报告 API 配置新增 `Workspace` 输入，刷新后会从 `reportRepository.workspaceId` 恢复。
- `MRAppState.configureReportRepositoryRemote()` 支持 `workspaceId` / `remoteWorkspaceId` / `accountId`，切换 endpoint 或 workspace 时清空当前回执和冲突审计视图，避免跨空间误读。
- `getReportRepositoryPackage()` 输出顶层 `workspaceId` 和 `source.workspaceId`。
- 远端 GET / PUT 请求统一携带 `X-MR-Workspace-Id` header，状态文案、签名回执列表和回执审计 HTML 显示当前 workspace。
- `scripts/report-repository-mock-server.js` 支持按 workspace 分桶保存 package 和 receipts，回执签名 payload 也包含 workspace。
- 数据层和 E2E 补充 Workspace header、包字段、签名回执 workspace、本机状态持久化、mock server 空间隔离和切回原空间读取。
- `docs/report-repository-api-contract.md` 补充 Workspace header、包字段、回执字段、mock 隔离和生产边界。

真实化说明：

- 数据来源：前台用户配置的 endpoint/token/workspace、本机报告同步包、本机验真摘要和远端签名回执。
- 写入状态：`mr-calligraphy-learning-state-v1.reportRepository.workspaceId`、报告仓库包 `workspaceId`、最近签名回执 `workspaceId` 和 mock server `state.workspaces`。
- 成功反馈：远端状态显示空间，回执列表显示 workspace，mock 服务能分别保存 `report-alpha` 和 `report-beta`，切回原空间能读取原 package。
- 失败反馈：远端未配置、token 错误、HTTP 错误、非 JSON、PUT 422 或网络中断仍走现有错误状态，不伪造同步成功。
- 刷新后复现方式：刷新前台后 Workspace 输入会恢复，后续检查/推送/拉取继续使用同一空间。

仍待补：

- 当前只是账号化 repository 前的空间隔离 adapter；真正登录态、角色权限、token 刷新、生产证书签名、服务端教师批注审计、长期归档和不可篡改审计仍未完成。

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

## 71. 2026-06-12 项目仓库 Workspace 空间隔离

本次把主后台 `ProjectRepository` 远端 adapter 从“同一个 endpoint 共用一份项目包和版本历史”推进到“同一个 endpoint 下可按 Workspace 隔离项目包、回执和远端版本”。这仍不是完整账号系统，但已经避免班级、项目空间或多设备调试时互相覆盖远端项目仓库状态。

完成内容：

- 主后台“远端项目仓库 API”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- `MRProjectArchive.createProjectRepositoryPackage()` 输出顶层 `workspaceId`，项目仓库远端 GET / PUT 请求统一携带 `X-MR-Workspace-Id` header。
- 项目仓库远端状态、版本选择、回执列表和回执审计 HTML 会显示当前 workspace。
- 切换 endpoint 或 workspace 时会清空当前远端版本和回执视图，避免把旧空间的版本当作当前空间证据。
- `scripts/project-repository-mock-server.js` 改为按 workspace 分桶保存项目仓库包、回执和最近 20 个版本。
- Playwright 主后台用例验证 Workspace 输入、请求头、推送包字段、版本历史、回执持久化和 HTML 审计导出。
- `docs/project-repository-api-contract.md` 与 `docs/smoke-test.md` 同步 Workspace header、包字段、mock 隔离和验收范围。

真实化说明：

- 数据来源：主后台用户配置的项目仓库 endpoint/token/workspace、本机项目档案包、项目 schema、统一 `ProjectRepository` 状态和远端 API 返回。
- 写入状态：`mr-calligraphy-project-repository-remote-v1.workspaceId`、项目仓库包 `workspaceId`、远端回执 `workspaceId` 和 mock server workspace 分桶。
- 成功反馈：远端状态显示空间，回执列表显示 workspace，mock 服务能分别保存不同空间的项目包与版本历史。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON、PUT 422 或网络中断仍走现有错误状态，不伪造同步成功，也不清空本机项目档案。
- 刷新后复现方式：Workspace 保存在本机远端项目仓库状态，刷新主后台后仍会继续用同一空间检查、推送和拉取。

仍待补：

- 当前是账号化前的空间隔离 adapter；真正账号登录、角色权限、多人合并、服务端资产签名、长期归档和不可篡改审计仍未完成。

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

## 72. 2026-06-12 远端发布 Workspace 空间隔离

本次把主后台和写实后台 `RemotePublish` 从“同 endpoint 只按发布包摘要判断重复”推进到“同 endpoint 下可按 Workspace 隔离发布包、发布锁、撤销和回执”。这仍不是生产账号系统，但已经避免不同班级、项目空间或调试环境共用一个远端发布 mock 时互相锁住。

完成内容：

- 主后台和写实后台“远端发布 API”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- `MRProjectRemotePublish.configure()` 支持 workspace 配置，切换 endpoint 或 workspace 时清空旧空间的回执、审核状态和发布锁。
- 远端发布 GET / POST / DELETE 请求统一携带 `X-MR-Workspace-Id` header。
- 发布包、manifest、撤销包、发布回执、撤销回执、发布锁、回执列表和回执审计 HTML 都保留 `workspaceId`。
- `scripts/remote-publish-mock-server.js` 改为按 workspace 分桶保存回执和重复摘要锁，撤销只匹配当前空间的发布回执。
- Playwright 主后台用例验证 Workspace 输入、请求头、发布包字段、回执持久化和撤销空间。
- `docs/remote-publish-api-contract.md` 与 `docs/smoke-test.md` 同步 Workspace header、包字段、mock 隔离和验收范围。

真实化说明：

- 数据来源：后台用户配置的远端发布 endpoint/token/workspace、本机已审核发布版本、模型/贴图资产清单和远端 API 返回。
- 写入状态：`mr-calligraphy-remote-publish-v1.scenes[sceneId].workspaceId`、发布包 `workspaceId`、远端回执 `workspaceId` 和 mock server workspace 分桶。
- 成功反馈：远端状态显示空间，回执列表显示 workspace，mock 服务能分别保存不同空间的发布/撤销状态。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON、摘要不匹配、未审核、重复发布或跨空间锁都走明确失败状态，不伪造发布成功。
- 刷新后复现方式：Workspace 保存在本机远端发布状态，刷新后台后仍会继续用同一空间检查、推送和撤销。

仍待补：

- 当前是账号化前的空间隔离 adapter；真正账号登录、角色权限、生产 CDN 上传、远端审批、生产证书签名和不可篡改审计仍未完成。

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

## 73. 2026-06-12 作品分享远端 Workspace 空间隔离

本次把前台作品分享远端 API 从“同 endpoint 共用最近分享包和回执”推进到“同 endpoint 下可按 Workspace 隔离分享包、publicUrl、撤销和回执”。这仍不是生产账号系统，但已经避免班级、项目空间或调试环境复用一个分享服务时互相覆盖公开链接。

完成内容：

- 前台“远端分享 API”新增 `Workspace` 输入，保存 endpoint/token 时一并保存空间 ID。
- `MRAppState.configureShareServiceRemote()` 支持 `workspaceId` / `remoteWorkspaceId` / `accountId`，切换 endpoint 或 workspace 时清空旧空间的远端 publicUrl、回执和 packageId。
- 分享远端 GET / PUT / DELETE 请求统一携带 `X-MR-Workspace-Id` header。
- 远端分享包、撤销包、分享记录远端状态、发布回执、撤销回执、回执列表和回执审计 HTML 都保留 `workspaceId`。
- `scripts/share-repository-mock-server.js` 改为按 workspace 分桶保存分享包、回执和撤销记录。
- 数据层脚本验证 `share-alpha` 和 `share-beta` 两个空间互不覆盖，切回原空间能读回原分享包。
- Playwright 前台用例验证 Workspace 输入、请求头、PUT/DELETE body、回执持久化和 HTML 审计导出。
- `docs/share-repository-api-contract.md` 与 `docs/smoke-test.md` 同步 Workspace header、包字段、mock 隔离和验收范围。

真实化说明：

- 数据来源：前台用户配置的远端分享 endpoint/token/workspace、本机分享链接、作品分享 HTML 和远端 API 返回。
- 写入状态：`mr-calligraphy-learning-state-v1.shareService.workspaceId`、分享包 `workspaceId`、`ShareRecord.remoteWorkspaceId`、远端回执 `workspaceId` 和 mock server workspace 分桶。
- 成功反馈：远端状态显示空间，回执列表显示 workspace，mock 服务能分别保存不同空间的分享包与撤销记录。
- 失败反馈：endpoint 未配置、token 错误、HTTP 错误、非 JSON、PUT 422、DELETE 空间不匹配或网络中断仍走明确失败状态，不伪造远端分享成功。
- 刷新后复现方式：Workspace 保存在本机分享服务状态，刷新前台后仍会继续用同一空间检查、发布和撤销。

仍待补：

- 当前是账号化前的空间隔离 adapter；真正账号登录、角色权限、生产 CDN 托管、公开链接权限、访问统计和不可篡改审计仍未完成。

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

## 74. 2026-06-12 项目仓库远端版本恢复风险预览

本次把主后台远端项目仓库的“拉取预览”从通用导入预览推进为带远端来源证据的恢复预览。用户拉取远端版本后，可以先看到 packageId、Workspace、远端版本、包摘要、仓库摘要、历史版本数量和恢复风险，再决定是否勾选恢复范围。

完成内容：

- `projectImportPreview` 新增 `projectImportPreviewSource` 来源摘要区。
- `MRProjectArchive.pullProjectRepositoryFromRemote()` 在远端包通过 `packageDigest` 校验后，为恢复预览附加 `remoteRepository` 元数据。
- 恢复预览新增 `riskSummary`，按配置覆盖/清空、模型库替换、缺哈希、缺文件和仓库状态计算低/中/高风险。
- 主后台远端项目仓库拉取后，预览标题改为“远端项目仓库版本预览”，摘要区显示 Workspace、packageId、摘要和风险说明。
- 导出的项目档案差异 HTML 报告新增“远端项目仓库版本”段落，保留 workspace、包摘要、仓库摘要和风险说明。
- smoke test 新增 `projectImportPreviewSource` 页面标记。
- Playwright 主后台项目仓库用例验证远端版本摘要区、包摘要、Workspace 和导出差异报告内容。

真实化说明：

- 数据来源：远端项目仓库 GET 响应、通过摘要校验的 `mr-calligraphy-project-repository-package-v1`、当前本机项目档案差异和恢复预览。
- 写入状态：本轮不自动写入业务数据；只有用户继续点击“恢复所选”才会进入既有恢复流程和恢复审计。
- 成功反馈：页面显示远端版本来源摘要，差异报告 HTML 可离线审阅同一份远端来源证据。
- 失败反馈：远端包缺失、kind/version 不匹配、摘要不一致或网络错误仍走既有错误状态，不生成伪造预览。
- 刷新后复现方式：远端回执和版本历史仍保存在本机远端项目仓库状态；重新拉取同一版本会重新生成来源摘要和风险预览。

仍待补：

- 当前完成的是恢复前审阅证据，不是多人三方合并、服务端权限审批或不可篡改恢复审计。

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

## 75. 2026-06-12 报告教师批注本机签名摘要

本次把站内报告的“教师批注”从普通本机备注推进为可审计的本机批注签名摘要。教师保存批注时可以选择角色，状态层会为批注内容生成稳定摘要和本机签名摘要，页面、审计导出、HTML 报告和 PDF 注释都会保留这份证据。

完成内容：

- 报告详情新增 `reportTeacherReviewRoleInput` 角色选择，支持授课教师、助教和教研审核。
- `normalizeReportTeacherReview()` 新增 `role`、`reviewDigest`、`signatureKind`、`signatureAlgorithm`、`signedFields` 和 `localSignatureDigest`。
- 教师批注审计记录新增批注摘要、签名摘要、签名类型、算法和签名字段。
- 报告面板状态文案显示批注人、角色、时间和签名短码；审计列表显示角色与本机签名变化。
- 教师批注审计 HTML 导出显示角色、签名算法、签名字段、前后批注摘要和前后本机签名。
- HTML 学习报告显示教师角色和签名短码；原生 PDF 内容和 PDF 注释新增 `TeacherReviewSignatureDigest`。
- smoke test 新增 `reportTeacherReviewerInput` 和 `reportTeacherReviewRoleInput` 页面标记。
- `scripts/learning-state-check.js` 和 Playwright 前台报告用例验证角色、摘要、签名、本机持久化、审计导出和 PDF 注释。

真实化说明：

- 数据来源：当前浏览器中的 `ReportRecord.teacherReview`、用户填写的批注人/角色/批注内容、报告 ID 和报告创建时间。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.reports[*].teacherReview` 和 `reportTeacherReviewAudits`，并随报告仓库同步包保存。
- 成功反馈：报告面板显示角色和签名短码；审计 HTML、HTML 报告和 PDF 注释都能看到同一个本机签名摘要。
- 失败反馈：批注内容为空时不写入报告；清除批注会生成清除审计，后一签名为空，前一签名仍保留。
- 刷新后复现方式：角色、批注摘要和本机签名摘要保存在报告记录中，刷新并打开同一报告仍能显示。

仍待补：

- 当前是本机稳定摘要和本机审计，不是云端教师账号、生产电子签章、证书链、服务端时间戳或不可篡改审计链。

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

## 76. 2026-06-12 新增报告仓库回执本机校验

本次把报告仓库签名回执从“保存并展示”推进为“保存、展示并做本机一致性校验”。前端会重算 `receiptDigest`，判断回执字段是否自洽、workspace 是否匹配当前空间，并把结果显示在报告仓库状态、回执列表和审计 HTML 中。

完成内容：

- `normalizeReportRepositorySignedReceipt()` 新增 `verificationStatus`、`verificationMessage`、`verificationDigest`、`verificationExpectedDigest` 和 `verificationWorkspaceStatus`。
- 新增 `verifyReportRepositorySignedReceipt()`，按 `sourcePackageId`、`workspaceId`、`repositoryDigest` 和 `acceptedAt` 重算 `receiptDigest`。
- 报告仓库状态摘要新增“本机校验通过 / 空间不匹配 / 摘要不匹配”提示。
- 报告仓库回执列表显示校验状态和校验说明。
- 报告仓库回执审计 HTML 新增本机校验、校验说明和重算摘要字段。
- `scripts/learning-state-check.js` 验证真实 mock 回执校验通过，并验证篡改 `receiptDigest` 的回执会被标记为摘要不匹配。
- Playwright 前台报告仓库用例验证回执状态、列表、localStorage 和审计 HTML 都显示本机校验通过。
- `docs/report-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端报告仓库 API 返回的 `receipt/latestReceipt` 和当前配置的 Workspace。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.reportRepository.lastSignedReceipt` 与 `signedReceipts[*]` 的校验字段。
- 成功反馈：状态栏、回执列表和导出的审计 HTML 都显示“本机校验通过”。
- 失败反馈：摘要被篡改或公式不匹配会显示“摘要不匹配”；空间不一致会显示“空间不匹配”。
- 刷新后复现方式：校验字段随回执进入本机学习状态，刷新后重新读取仍会规范化保留校验结果。

仍待补：

- 当前校验只能证明回执声明字段一致和空间匹配，不能替代生产 HMAC 私钥验签、证书链、公钥验签、账号权限或不可篡改审计。

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

## 77. 2026-06-12 新增计划仓库回执本机校验

本次把计划仓库远端回执从“保存并展示”推进为“保存、展示并做本机一致性校验”。前端会重算 `receiptDigest`，判断回执字段是否自洽、workspace 是否匹配当前空间，并把结果显示在计划仓库状态、回执列表和审计 HTML 中。

完成内容：

- `normalizePlanRepositoryReceipt()` 新增 `verificationStatus`、`verificationMessage`、`verificationDigest`、`verificationExpectedDigest` 和 `verificationWorkspaceStatus`。
- 新增 `verifyPlanRepositoryReceipt()`，按 `sourcePackageId`、`workspaceId`、`repositoryDigest` 和 `acceptedAt` 重算 `receiptDigest`。
- 计划仓库状态摘要新增“本机校验通过 / 空间不匹配 / 摘要不匹配”提示。
- 计划仓库回执列表显示校验状态和校验说明。
- 计划仓库回执审计 HTML 新增本机校验、校验说明和重算摘要字段。
- `scripts/learning-state-check.js` 验证真实 mock 回执校验通过，并验证篡改 `receiptDigest` 的回执会被标记为摘要不匹配。
- Playwright 前台计划仓库用例验证回执状态、列表、localStorage 和审计 HTML 都显示本机校验通过。
- `docs/plan-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端计划仓库 API 返回的 `receipt/latestReceipt` 和当前配置的 Workspace。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.planRepository.lastReceipt` 与 `receipts[*]` 的校验字段。
- 成功反馈：状态栏、回执列表和导出的审计 HTML 都显示“本机校验通过”。
- 失败反馈：摘要被篡改或公式不匹配会显示“摘要不匹配”；空间不一致会显示“空间不匹配”。
- 刷新后复现方式：校验字段随回执进入本机学习状态，刷新后重新读取仍会规范化保留校验结果。

仍待补：

- 当前校验只能证明回执声明字段一致和空间匹配，不能替代生产 HMAC 私钥验签、证书链、公钥验签、账号权限或不可篡改审计。

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

## 78. 2026-06-12 新增作品分享回执本机校验

本次把作品分享远端回执从“保存并展示”推进为“保存、展示并做本机一致性校验”。前端会分别按发布和撤销回执的字段重算 `receiptDigest`，判断回执字段是否自洽、workspace 是否匹配当前分享空间，并把结果显示在分享状态、回执列表和审计 HTML 中。

完成内容：

- `normalizeShareRepositoryReceipt()` 新增 `verificationStatus`、`verificationMessage`、`verificationDigest`、`verificationExpectedDigest`、`verificationWorkspaceStatus` 和 `verificationAction`。
- 新增 `verifyShareRepositoryReceipt()`，发布回执按 `sourcePackageId`、`workspaceId`、`repositoryDigest`、`publicUrl` 和 `acceptedAt` 重算 `receiptDigest`。
- 撤销回执按 `action: "revoke"`、`sourcePackageId`、`workspaceId`、`shareId`、`repositoryDigest`、`publicUrl` 和 `acceptedAt` 重算 `receiptDigest`。
- 作品分享状态摘要新增“本机校验通过 / 空间不匹配 / 摘要不匹配”提示。
- 作品分享回执列表显示校验状态和校验说明。
- 作品分享回执审计 HTML 新增本机校验、校验说明和重算摘要字段。
- `scripts/learning-state-check.js` 验证真实 mock 发布/撤销回执校验通过，并验证篡改 `receiptDigest` 的回执会被标记为摘要不匹配。
- Playwright 前台作品分享用例验证回执状态、列表、localStorage 和审计 HTML 都显示本机校验通过。
- `docs/share-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端作品分享 API 返回的 `receipt/latestReceipt`、公开访问 URL、分享 ID 与当前作品分享 Workspace。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.shareService.lastReceipt` 与 `receipts[*]` 的校验字段。
- 成功反馈：分享状态、回执列表和审计 HTML 显示“本机校验通过”。
- 失败反馈：回执摘要无法重算时显示“摘要不匹配”；回执自洽但 workspace 不同则显示“空间不匹配”。
- 刷新后复现方式：校验结果随本机学习状态持久化，刷新前台后仍能读取。

仍待补：

- 当前是本机一致性校验，不是生产私钥验签、公钥证书链、账号权限、公开分享 CDN 发布、教师端审批或服务端不可篡改审计。

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

## 79. 2026-06-12 新增学习档案仓库回执本机校验

本次把学习档案仓库远端回执从“mock 返回、状态只记 packageId”推进为“保存、展示并做本机一致性校验”。前端会重算 `receiptDigest`，判断回执字段是否自洽、workspace 是否匹配当前学习档案空间，并把结果显示在学习档案仓库状态、回执列表和审计 HTML 中。

完成内容：

- `normalizeHistoryRepository()` 新增 `lastReceipt` 和 `receipts`，刷新后会重新规范化并保留校验结果。
- `normalizeHistoryRepositoryReceipt()` 新增 `verificationStatus`、`verificationMessage`、`verificationDigest`、`verificationExpectedDigest` 和 `verificationWorkspaceStatus`。
- 新增 `verifyHistoryRepositoryReceipt()`，按 `workspaceId`、`sourcePackageId`、`repositoryDigest` 和 `acceptedAt` 重算 `receiptDigest`。
- 学习档案仓库状态摘要新增“本机校验通过 / 空间不匹配 / 摘要不匹配”提示。
- 前台远端学习档案 API 面板新增“学习档案仓库回执审计”区域，显示最近回执、校验状态和校验说明。
- 新增 `getHistoryRepositoryReceiptAudit()`、`getHistoryRepositoryReceiptAuditExport()` 和 `downloadHistoryRepositoryReceiptAudit()`。
- 学习档案仓库回执审计 HTML 新增本机校验、校验说明和重算摘要字段。
- `scripts/learning-state-check.js` 验证真实 mock 回执校验通过，并验证篡改 `receiptDigest` 的回执会被标记为摘要不匹配。
- Playwright 前台学习档案远端同步用例验证回执状态、列表、localStorage 和审计 HTML 都显示本机校验通过。
- `docs/history-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端学习档案仓库 API 返回的 `receipt/latestReceipt` 与当前学习档案 Workspace。
- 写入状态：写入 `mr-calligraphy-learning-state-v1.historyRepository.lastReceipt` 与 `receipts[*]` 的校验字段。
- 成功反馈：学习档案仓库摘要、回执列表和审计 HTML 显示“本机校验通过”。
- 失败反馈：回执摘要无法重算时显示“摘要不匹配”；回执自洽但 workspace 不同则显示“空间不匹配”。
- 刷新后复现方式：校验结果随本机学习状态持久化，刷新前台后仍能读取。

仍待补：

- 当前是本机一致性校验，不是生产私钥验签、公钥证书链、账号权限、服务端教师批注审计、跨设备长期归档或服务端不可篡改日志。

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

## 80. 2026-06-12 新增项目仓库回执本机校验

本次把主后台远端项目仓库回执从“保存并展示”推进为“保存、展示并做本机一致性校验”。前端会重算 `receiptDigest`，判断回执字段是否自洽、workspace 是否匹配当前项目仓库空间，并把结果显示在主后台回执状态、回执列表和审计 HTML 中。

完成内容：

- `normalizeProjectRepositoryReceipt()` 新增 `verificationStatus`、`verificationMessage`、`verificationDigest`、`verificationExpectedDigest` 和 `verificationWorkspaceStatus`。
- 新增 `verifyProjectRepositoryReceipt()`，按 `sourcePackageId`、`workspaceId`、`repositoryDigest` 和 `acceptedAt` 重算 `receiptDigest`。
- 项目仓库回执审计状态摘要新增“本机校验通过 / 空间不匹配 / 摘要不匹配”提示。
- 主后台项目仓库回执列表显示校验状态。
- 项目仓库回执审计 HTML 新增本机校验、校验说明和重算摘要字段。
- Playwright 主后台项目仓库用例改为生成真实可重算 receipt，并验证页面、localStorage 和 HTML 审计导出。
- `docs/project-repository-api-contract.md` 同步本机一致性校验规则和生产边界。

真实化说明：

- 数据来源：远端项目仓库 API 返回的 `receipt/latestReceipt` 与当前项目仓库 Workspace。
- 写入状态：写入 `mr-calligraphy-project-repository-remote-v1.receipts[*]` 的校验字段。
- 成功反馈：项目仓库回执摘要、回执列表和审计 HTML 显示“本机校验通过”。
- 失败反馈：回执摘要无法重算时显示“摘要不匹配”；回执自洽但 workspace 不同则显示“空间不匹配”。
- 刷新后复现方式：校验结果随本机远端项目仓库状态持久化，刷新主后台后仍能读取。

仍待补：

- 当前是本机一致性校验，不是生产私钥验签、公钥证书链、账号权限、服务端资产完整性复核、多人合并审计或服务端不可篡改日志。

验收：

- `node --check project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e -- --grep "main admin publishes a local draft that the front page reads"`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库回执本机校验`

## 81. 2026-06-12 新增远端发布回执本机校验

本次把主后台和写实后台的远端发布回执从“保存并展示”推进为“保存、展示并做本机一致性校验”。前端会重算发布回执和撤销回执的 `receiptDigest`，判断回执字段是否自洽、workspace 和 scene 是否匹配当前后台，并把结果显示在回执状态、回执列表和审计 HTML 中。

完成内容：

- `normalizeRemoteReceipt()` 新增 `verificationStatus`、`verificationMessage`、`verificationDigest`、`verificationExpectedDigest`、`verificationWorkspaceStatus` 和 `verificationSceneStatus`。
- 新增远端发布回执重算逻辑：发布回执按 `sceneId/workspaceId/releaseId/packageDigest/acceptedAt/assetSignatureSummary/cdnUploadSummary` 重算，撤销回执按 `direction/workspaceId/sceneId/packageId/sourcePackageId/releaseId/packageDigest/acceptedAt/revokedAt/cdnPurgeSummary` 重算。
- `getReceiptAudit()` 新增 `verifiedCount`，状态摘要显示“本机校验通过 N 条”。
- 主后台和写实后台远端发布回执列表显示本机校验状态。
- 远端发布回执审计 HTML 新增本机校验、校验说明和重算摘要字段。
- `scripts/remote-publish-check.js` 覆盖 fake API、真实 mock server、发布回执、撤销回执、状态持久化和审计导出的本机校验。
- Playwright 主后台远端发布用例验证页面、localStorage 和 HTML 审计导出显示本机校验通过。
- `docs/remote-publish-api-contract.md` 同步本机一致性校验公式和生产边界。

真实化说明：

- 数据来源：远端发布 API 返回的 `receipt/latestReceipt` 与当前后台 scene/workspace。
- 写入状态：写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts[*]` 的校验字段。
- 成功反馈：远端发布回执状态、列表和审计 HTML 显示“本机校验通过”。
- 失败反馈：摘要无法重算或不匹配显示“摘要不匹配”；workspace 或 scene 不一致会分别显示不匹配。
- 刷新后复现方式：校验字段随本机远端发布状态持久化，刷新后台后仍能读取。

仍待补：

- 当前是本机一致性校验，不是生产私钥验签、公钥证书链、账号审批、真实 CDN 上传证明、服务端资产回收审计或不可篡改日志。

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

## 82. 2026-06-12 新增前台服务边界状态面板

本次把前台顶部学习状态从单一“本机学习记录摘要”扩展为可见的三层服务边界：本机真实、远端 Adapter、生产云端。用户进入前台时能直接看到当前哪些能力只在本机闭环内真实可用、哪些远端接口已配置并有回执校验、哪些生产云端能力仍未接入，减少“按钮能点就等于线上产品已完成”的误解。

完成内容：

- `index.html` 新增 `serviceBoundaryPanel`、`serviceBoundaryStatus` 和 `serviceBoundaryList`。
- `script.js` 新增 `renderServiceBoundaryPanel()`，从学习统计、学习档案仓库、计划仓库、报告仓库和作品分享远端状态中汇总本机记录数、远端 adapter 配置数和回执本机校验数。
- 面板明确展示“生产云端未接入账号登录、教师端权限、生产 CDN、跨设备云同步和服务端不可篡改审计”。
- `style.css` 为服务边界面板补充移动端友好的紧凑布局，长 endpoint 或状态文本可自动换行。
- smoke test 新增前台服务边界 DOM 标记检查。
- Playwright 移动端入口和前台练习用例新增服务边界可见性与文案断言。

真实化说明：

- 数据来源：`MRAppState.getStats()`、各远端仓库 status 和 receipt audit。
- 写入状态：本轮不新增存储结构，只读取已有本机状态并实时渲染边界。
- 成功反馈：前台顶部显示“本机真实 / 远端 Adapter / 生产云端”三行状态。
- 失败反馈：状态层未初始化时显示“本机能力尚未初始化”；未配置远端时显示本机导出和本机分享链接边界。
- 刷新后复现方式：面板由本机持久化状态重新推导，刷新后仍能显示当前 adapter 与回执情况。

仍待补：

- 该面板只是前端边界透明化，不是账号系统、教师端、生产 CDN、跨设备同步或服务端不可篡改审计。

验收：

- `node --input-type=module --check < script.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "mobile viewports keep core panels usable without overlap"`
- `git diff --check`

提交：

- 中文 commit message：`新增前台服务边界状态面板`

## 83. 2026-06-12 新增后台服务边界状态面板

本次把主后台和写实后台的“本机静态后台”风险提示扩展为真实状态面板。后台会直接显示本机编辑、本机发布、远端 Adapter 和生产后台四层边界，避免用户把“发布到前台”“远端发布 API”“项目仓库 API”误认为已经具备账号后台、多人协作 CMS 或生产 CDN。

完成内容：

- `main-admin.html` 新增 `mainAdminBoundaryPanel`、`mainAdminBoundaryStatus` 和 `mainAdminBoundaryList`。
- `realistic-admin.html` 新增 `realisticAdminBoundaryPanel`、`realisticAdminBoundaryStatus` 和 `realisticAdminBoundaryList`。
- `main-admin-scene.js` 新增主后台边界渲染：读取本机主场景草稿对象数、本机前台发布版本、远端发布 adapter、项目仓库远端 adapter 和回执本机校验数量。
- `realistic-scene.js` 新增写实后台边界渲染：读取写实草稿对象状态、导入模型、本机演示发布版本、远端发布 adapter 和回执本机校验数量。
- `project-archive.js` 在项目仓库远端状态刷新后通知主后台边界面板同步更新。
- `style.css` 和 `realistic-demo.css` 新增后台边界面板样式，作为风险提示的一部分展示，不额外遮挡编辑面板。
- smoke test 和 Playwright 手机视口用例新增两个后台服务边界验收。

真实化说明：

- 数据来源：当前后台草稿状态、已发布版本、`MRProjectRemotePublish` 状态、主后台 `MRProjectArchive` 项目仓库远端状态和回执审计。
- 写入状态：本轮不新增存储，只读取已有本机状态并实时渲染。
- 成功反馈：两个后台风险提示区显示“本机编辑 / 前台或演示发布 / 远端 Adapter / 生产后台”。
- 失败反馈：未发布、未配置远端或无回执时展示明确本机边界，不伪造成生产服务。
- 刷新后复现方式：面板由 localStorage/IndexedDB 和远端 adapter 状态重新推导，刷新后台后仍可显示。

仍待补：

- 这仍不是生产后台；账号登录、角色权限、多人协作 CMS、生产 CDN、服务端资产回收和不可篡改审计仍待后续开发。

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

## 84. 2026-06-12 新增本机后台操作者审计

本次把两个后台的“无操作审计”缺口先补成可验证的本机审计闭环。主后台和写实后台都可以保存本机操作者姓名与角色，关键后台动作会写入 `localStorage`，并可导出 HTML 审计报告。它不是生产账号体系，但能让当前本机版本的编辑、快照和发布行为有可追踪记录。

完成内容：

- 新增 `admin-audit.js`，提供 `MRAdminAudit.configureOperator()`、`getStatus()`、`record()` 和 `getExport()`。
- `main-admin.html` 新增 `mainAdminOperatorPanel`、操作者姓名/角色表单、保存按钮、审计导出按钮和最近审计列表。
- `realistic-admin.html` 新增 `realisticAdminOperatorPanel`、操作者姓名/角色表单、保存按钮、审计导出按钮和最近审计列表。
- `main-admin-scene.js` 在保存操作者、确认本机权限边界、保存快照和发布到前台时写入主后台操作审计。
- `realistic-scene.js` 在保存操作者、确认本机权限边界、保存快照和发布到演示时写入写实后台操作审计。
- 两个后台服务边界面板新增“本机审计”行，显示当前操作者与审计记录数。
- `style.css` 和 `realistic-demo.css` 增加本机操作者审计面板样式，移动端折叠为单列表单。
- smoke test 新增 `admin-audit.js` 和两个后台操作者审计 DOM 标记检查。
- Playwright 主后台发布用例和写实发布用例新增 `mr-calligraphy-admin-operator-audit-v1` 持久化断言，验证 `snapshot` 与 `publish-local` 记录归属到保存的操作者。

真实化说明：

- 数据来源：后台页面实际操作、保存快照和本机发布动作。
- 写入状态：`mr-calligraphy-admin-operator-audit-v1.scopes.mainScene` 与 `mr-calligraphy-admin-operator-audit-v1.scopes.realisticScene`，每个后台最多保留最近 120 条记录。
- 成功反馈：风险提示区显示操作者、角色、最近 3 条审计，并可导出 `mr-calligraphy-admin-audit-*.html`。
- 失败反馈：审计脚本缺失或本机存储写入失败时显示错误，不把失败伪装成已审计。
- 刷新后复现方式：刷新后台后重新读取本机操作者和审计记录，列表继续显示最近操作。

仍待补：

- 本轮只是本机操作留痕，不是生产级账号登录、强制角色权限、服务端不可篡改日志、多人协作审计或管理员审批流。

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

## 85. 2026-06-12 新增本机后台角色权限门控

本次把后台操作者角色从“只显示标签”推进到真实本机权限门控。主后台和写实后台的复核角色现在是只读角色，会禁用并拦截坐标编辑、快照、导入、删除、本机发布和远端发布；编辑、负责人和本机管理员仍可执行完整本机开发流。

完成内容：

- `admin-audit.js` 新增角色权限表、权限文案、`MRAdminAudit.canPerform()` 和权限摘要。
- 主后台操作者面板新增 `mainAdminPermissionStatus`，显示当前角色可执行能力或复核只读边界。
- 写实后台操作者面板新增 `realisticAdminPermissionStatus`，显示当前角色可执行能力或复核只读边界。
- `main-admin-scene.js` 对主后台坐标/灯光/基础物体/导入模型/快照/发布/远端发布/项目仓库远端入口套本机权限禁用层，并在新增、更新、导入、删除、恢复、复位、快照、发布和远端发布事件入口做权限预检。
- `realistic-scene.js` 对写实后台坐标/导入模型/快照/删除恢复/本机发布/远端发布套本机权限禁用层，并在导入、清理、删除、恢复、材质更新、快照和发布事件入口做权限预检。
- 权限拦截会写入 `permission-blocked` 本机审计记录，避免危险动作失败后没有留痕。
- smoke test 新增两个后台权限摘要 DOM 标记。
- Playwright 新增 `admin reviewer role blocks local write controls`，验证复核角色会禁用主后台与写实后台的写操作，切回编辑角色后控件恢复。
- 写实发布回归用例改用 `editor` 角色，验证编辑角色仍可删除、发布、回滚并写入审计。

真实化说明：

- 数据来源：`mr-calligraphy-admin-operator-audit-v1.scopes[*].operator.role`。
- 写入状态：角色仍写入既有后台操作者审计；权限拦截写入 `records[*].action = "permission-blocked"`。
- 成功反馈：权限摘要显示当前角色能力；只读角色会禁用关键写入控件和文件导入。
- 失败反馈：复核角色触发危险动作时显示无权操作，并写入本机审计。
- 刷新后复现方式：刷新后台后从本机操作者记录重新读取角色并恢复相同门控。

仍待补：

- 本轮仍是本机浏览器权限门控，无法替代生产账号登录、服务端鉴权、细粒度组织角色、不可篡改审计或多人审批流。

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

## 86. 2026-06-12 新增远端审核审批权限门控

本次把后台远端发布审核从“有远端发布权限即可通过审核”推进到更接近真实工作流的本机分权：编辑角色可以编辑内容、配置远端、提交远端审核和推送已批准版本，但通过审核、退回审核和解除发布锁必须由负责人或本机管理员执行。

完成内容：

- `admin-audit.js` 新增 `approve` 权限和“远端审核审批”权限文案。
- 本机管理员与负责人拥有 `approve`；编辑角色保留编辑、导入、发布和远端发布，但不能审批审核；复核角色继续只读。
- 主后台远端发布“通过审核 / 退回审核 / 解除发布锁”按钮改为 `approve` 权限门控，并在事件入口做二次权限预检。
- 写实后台远端发布审核与锁按钮同步改为 `approve` 权限门控。
- 权限摘要会明确编辑角色可提交远端审核，但审批动作需要负责人或本机管理员。
- Playwright 权限用例验证编辑角色的审批按钮被本机角色拦截，切换负责人后审批权限恢复。
- 主后台远端发布回归用例改为“编辑提交审核 -> 负责人通过审核 -> 推送远端包”，覆盖真实分权链路。

真实化说明：

- 数据来源：`mr-calligraphy-admin-operator-audit-v1.scopes[*].operator.role`。
- 写入状态：仍复用本机后台操作者审计；审批按钮的权限状态写入 DOM `data-admin-permission=approve` 和 `data-admin-permission-state`。
- 成功反馈：编辑角色能看到提交审核可用但审批入口被角色禁用；负责人/本机管理员可继续通过、退回或解锁。
- 失败反馈：无审批权限时会显示角色无权提示并记录 `permission-blocked` 审计。
- 刷新后复现方式：刷新后台后从本机操作者角色重新应用同一审批门控。

仍待补：

- 当前仍是本机浏览器审批门控，不是服务端账号鉴权、组织角色、真实双人审批、不可篡改审计或生产发布审批流。

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

## 87. 2026-06-12 新增远端发布操作审计

本次把远端发布链路从“有回执审计”继续补成“后台操作者审计也覆盖远端动作”。主后台和写实后台现在会把检查远端、提交审核、通过审核、退回审核、解除发布锁、推送远端包和撤销远端发布写入本机后台操作审计，避免远端流程只在发布 adapter 状态里留痕。

完成内容：

- 主后台新增远端发布动作审计标签：检查、推送、撤销、提交审核、通过审核、退回审核和解除发布锁。
- 写实后台同步新增同一组远端发布动作审计标签。
- 新增轻量审计记录 helper，只保存 workspace、releaseId、packageDigest、packageId 和 direction，不把 endpoint token 写入审计。
- 远端 API 检查、推送和撤销会记录成功或失败状态。
- 远端审核提交、通过、退回和解锁会记录当前操作者与结果。
- Playwright 主后台远端发布用例新增本机后台审计断言，确认检查、提交审核、审批、推送和撤销都进入 `mr-calligraphy-admin-operator-audit-v1`。

真实化说明：

- 数据来源：后台远端发布按钮真实操作结果和 `MRProjectRemotePublish` 返回的 status/workflow/receipt。
- 写入状态：`mr-calligraphy-admin-operator-audit-v1.scopes.mainScene.records[*]` 与 `scopes.realisticScene.records[*]`。
- 成功反馈：后台操作者审计列表和导出的本机审计 HTML 能看到远端发布操作。
- 失败反馈：网络异常、远端检查失败或推送失败也会以 `failed` 结果写入审计。
- 刷新后复现方式：审计记录保存在 localStorage，刷新后台后仍能查看和导出。

仍待补：

- 当前是本机后台审计，不是服务端不可篡改审计、账号签名、生产审批流或跨设备审计仓库。

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

## 88. 2026-06-12 新增本机后台访问门禁

本次把主后台和写实后台从“打开页面即可编辑”推进到本机会话门禁。两个后台默认进入锁定状态，只有输入本机访问码 `local-admin` 后，当前浏览器会话才允许编辑、导入、删除、发布、远端推送和审核审批；刷新后同一 sessionStorage 会话继续有效，锁定或新会话会重新禁用危险动作。

完成内容：

- `admin-audit.js` 新增 `MRAdminAudit.getAccessStatus()`、`unlockAccess()`、`lockAccess()`，会话写入 `mr-calligraphy-admin-access-session-v1`。
- 主后台风险提示区新增“访问门禁”面板，可输入访问码、解锁后台和主动锁定。
- 写实后台风险提示区同步新增访问门禁面板。
- `MRAdminAudit.canPerform()` 在角色权限之外叠加本机门禁：锁定时只允许查看、切换操作者和导出审计。
- 主后台和写实后台服务边界面板新增“本机门禁”行，显示锁定、解锁和 480 分钟过期状态。
- 解锁和锁定会写入本机后台操作者审计，动作分别为 `access-unlock` 和 `access-lock`。
- smoke test 新增两个后台访问门禁 DOM 标记检查。
- Playwright 权限、发布、导入、替换、删除审计和项目仓库失败用例都改为先验证锁定禁用，再通过真实访问码解锁后继续操作。
- 修复写实后台“清理已删除文件”按钮在解锁后覆盖业务禁用的问题：现在必须同时满足有已删除导入模型和有删除权限才可点击。

真实化说明：

- 数据来源：当前浏览器 sessionStorage 中的 `mr-calligraphy-admin-access-session-v1`。
- 写入状态：按 `mainScene` 和 `realisticScene` 分 scope 保存 `unlockedAt`、`expiresAt` 或 `lockedAt`。
- 成功反馈：门禁面板显示“已解锁”和过期时间；后台写入按钮恢复可用。
- 失败反馈：访问码错误会提示“本机访问码不正确”，锁定状态下危险控件保持禁用，事件入口也会返回无权提示。
- 刷新后复现方式：同一浏览器会话刷新后继续读取 sessionStorage；点击“锁定”或开启新会话后重新进入锁定。

仍待补：

- 当前是本机浏览器会话门禁，只能降低误操作风险，不是生产账号登录、服务端鉴权、组织角色、双人审批、不可篡改审计或跨设备安全策略。默认访问码 `local-admin` 仅用于开发阶段。

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

## 89. 2026-06-12 扩展后四步学习路径热点状态

本次把第 7-10 步的学习记录、作品复盘、学习报告和复习巩固热点从“只读取统计文案”推进到继续叠加 `LearningPath` 状态。后四步现在会把本机路径完成状态、下一步动作和本机证据直接写进热点内容，和前 6 步保持同一套任务驱动逻辑。

完成内容：

- `script.js` 新增 `mergeLearningPathStatusIntoPoint()`，统一把路径状态、行动提示和本机证据合并进热点说明。
- 第 7 步“本机学习档案”热点显示路径状态与练习/作品/报告证据。
- 第 8 步“作品复盘与分享”热点显示路径状态与分享/作品证据。
- 第 9 步“学习报告”热点显示路径状态与报告、平均分和最近记录证据。
- 第 10 步“复习巩固”热点显示路径状态与任务完成、复习阶段和计划证据。
- Playwright 前台真实流程新增第 7-10 步断言，确认完成真实书写、保存作品和导出报告后，热点内容包含“路径状态”和“本机证据”。

真实化说明：

- 数据来源：`MRAppState.getLearningPathStatus().steps[index]`。
- 写入状态：本轮不新增存储，只把既有 `LearningTask`、练习、作品、报告和计划派生状态透出到后四步 UI。
- 成功反馈：后四步热点正文显示路径状态、下一步动作和证据来源。
- 失败反馈：若路径服务未初始化，继续回退到原本的本机统计文案，不返回虚假的完成证据。
- 刷新后复现方式：刷新后从 `mr-calligraphy-learning-state-v1` 重新推导路径状态，后四步热点继续显示同一份证据。

仍待补：

- 当前仍是本机学习路径推导，不是云端课程编排、教师端下发任务或跨设备学情看板。

验收：

- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`扩展后四步学习路径热点状态`

## 90. 2026-06-12 新增评分版本与笔顺压感证据

本次把基础评分从“只有分数和少量统计项”推进到带版本、范字和压感证据的本机评分包。该轮 `local-heuristic-v2.0.0` 会在练习结果、学习状态、评分服务摘要和笔画分析详情里保留同一套证据，后续接专业模型时可以按算法版本区分来源；逐笔轨迹匹配已在下一节升级为 `local-heuristic-v2.1.0`。

完成内容：

- `practice-canvas.js` 新增第一版本机范字笔顺库，覆盖永、仁、和、礼、雅、静、心。
- 评分证据新增 `algorithmVersion`、`copybook`、`targetStrokeNames`、`strokeCountDelta`、`pressurePointCount`、压感平均值和压感范围。
- `app-state.js` 归一化旧记录时保留旧评分，同时让新记录持久化算法版本、范字来源、目标笔顺和压感采样。
- `ScoreService` 摘要显示最近评分算法版本，并把范字和压感证据写入 `lastEvidenceSummary`。
- “查看笔画分析”详情新增算法版本、范字来源、压感采样、完整笔顺和压感证据说明。
- 数据层脚本和前台 E2E 均新增断言，确认真实书写保存后 localStorage 中存在评分版本、笔顺和压感字段。

真实化说明：

- 数据来源：练习画布真实笔迹点位、时间戳、PointerEvent pressure 和本机范字笔顺库。
- 写入状态：`mr-calligraphy-learning-state-v1.sessions[*].scoreEvidence` 与 `scoreService`。
- 成功反馈：评分卡和分析详情显示算法版本、范字来源、笔顺参考、压感采样和维度理由。
- 失败反馈：没有真实笔迹时仍显示空状态，不生成假评分；旧记录缺少新字段时会保留可用旧证据。
- 刷新后复现方式：保存练习或作品后刷新，评分服务摘要和分析详情继续从 localStorage 读取新证据。

仍待补：

- 当前仍是浏览器本机启发式评分，不是专业书法评级、训练模型、硬件压感校准、教师标定或服务端评分。
- 逐笔轨迹匹配已在下一节完成第一版；仍缺高精度笔锋路径识别、逐点误差热力图和专业模型错序判定。

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

## 91. 2026-06-12 新增逐笔轨迹匹配证据

本次把上一轮“目标笔顺参考”继续推进到“真实笔迹逐笔匹配”。评分算法升级为 `local-heuristic-v2.1.0`，会根据每一笔真实轨迹的起止方向、角度、中心位置和长度，与本机范字笔顺逐项对比，输出匹配率、覆盖率、形态匹配率和疑似错序提醒。

完成内容：

- `practice-canvas.js` 新增 `analyzeStrokeOrder()`，为每一笔生成 `strokeMatches`。
- 逐笔证据包含目标笔画、最佳匹配笔画、匹配分、最佳分、实际方向、目标方向和角度差。
- 评分证据新增 `strokeOrderMatchPercent`、`strokeOrderCoveragePercent`、`strokeShapeMatchPercent`、`strokeOrderVerdict`、`strokeOrderWarnings`。
- `app-state.js` 归一化并持久化逐笔匹配列表，旧记录缺少该字段时不会伪造结果。
- `ScoreService` 最近证据摘要新增“笔顺匹配xx%”。
- “查看笔画分析”详情新增笔顺匹配、笔顺覆盖、形态匹配、逐笔轨迹摘要和笔顺提醒。
- 数据层脚本和前台 E2E 均新增断言，确认真实书写保存后 localStorage 中存在逐笔匹配证据。

真实化说明：

- 数据来源：真实笔迹每笔的起点、终点、角度、长度、中心位置和本机范字笔顺库。
- 写入状态：`mr-calligraphy-learning-state-v1.sessions[*].scoreEvidence.evidence.strokeMatches` 与 `scoreService.lastEvidenceSummary`。
- 成功反馈：评分详情显示匹配率、覆盖率、形态匹配率、逐笔摘要和疑似错序/缺笔提醒。
- 失败反馈：没有真实笔迹时匹配率为 0 且提示缺少目标笔画，不返回假“已匹配”。
- 刷新后复现方式：保存作品后刷新，笔画分析继续读取持久化的 `strokeMatches`。

仍待补：

- 当前是方向和角度驱动的本机启发式匹配，不是训练模型、专业逐笔识别、笔锋路径识别或教师评分标定。
- 路径误差热力已在下一节完成第一版；仍缺逐笔动画叠加范字路径、高精度笔锋压力热力图和专业模型校验。

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

## 92. 2026-06-12 新增路径误差热力证据

本次把基础评分继续升级到 `local-heuristic-v2.2.0`。在逐笔匹配之外，评分会把真实采样点到本机范字参考线的距离转换成路径贴合率、路径误差率、逐笔路径误差和区域热力点，帮助用户看到“偏在哪里”，而不是只知道“这一笔弱”。

完成内容：

- `practice-canvas.js` 新增 `analyzePathError()`，按真实采样点到本机参考线的距离计算路径误差。
- 评分证据新增 `pathFitPercent`、`pathErrorPercent`、`pathErrorSampleCount`。
- 评分证据新增 `pathErrorHotspots`，按 4×4 区域聚合误差热力点。
- 评分证据新增 `strokePathErrors`，记录每一笔的路径误差、贴合率和采样点数。
- `app-state.js` 归一化并持久化路径误差热力证据，评分摘要新增“路径贴合xx%”。
- “查看笔画分析”详情新增路径贴合、路径误差、逐笔路径误差和误差热力说明。
- 数据层脚本和前台 E2E 均新增断言，确认真实书写保存后 localStorage 中存在路径热力证据。

真实化说明：

- 数据来源：真实笔迹采样点、本机范字笔顺参考线、4×4 误差区域聚合。
- 写入状态：`mr-calligraphy-learning-state-v1.sessions[*].scoreEvidence.evidence.pathErrorHotspots`、`strokePathErrors` 和 `scoreService.lastEvidenceSummary`。
- 成功反馈：分析详情显示路径贴合率、误差率、逐笔路径误差和误差集中区域。
- 失败反馈：无笔迹时不伪造热力点；旧记录没有路径字段时只展示已有评分证据。
- 刷新后复现方式：保存作品后刷新，评分摘要和分析详情继续读取路径热力证据。

仍待补：

- 当前是本机参考线距离估算，不是逐点范字轮廓识别、笔锋压力热力图、硬件校准或专业书法模型。

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

## 93. 2026-06-12 新增报告评分证据摘要

本次把评分证据从练习分析面板推进到报告体系。用户导出学习报告后，报告记录、站内报告面板、HTML 导出和 PDF 导出都会显示同一份基础评分证据摘要，避免“看起来有报告，但报告里没有真实评分依据”的空壳体验。

完成内容：

- `app-state.js` 新增报告级 `scoreEvidenceSummary` 归一化与生成逻辑。
- `createReport()` 会从最近作品优先、最近练习兜底提取评分证据摘要，并持久化到报告记录。
- `getReportDetail()` 返回评分证据摘要，前端报告详情新增“基础评分证据”区域。
- HTML 报告导出展示算法版本、来源、笔顺匹配、路径贴合、路径误差、压感采样、范字笔顺、误差热力和最低项。
- PDF 报告导出展示评分证据摘要，并输出可测试的 `ScoreEvidence` 注释标记。
- `style.css` 为报告详情评分证据区新增稳定网格，避免长算法版本和窄屏内容挤压。
- 数据层脚本和 Playwright 前台真实流程新增断言，确认报告导出后 localStorage、HTML、站内详情和 PDF 均包含评分证据。

真实化说明：

- 数据来源：真实书写保存后生成的 `scoreEvidence`，不是硬编码演示文字。
- 写入状态：`mr-calligraphy-learning-state-v1.reports[*].scoreEvidenceSummary`。
- 成功反馈：报告详情显示“基础评分证据”“路径贴合”等字段；PDF 文本包含 `ScoreEvidence: yes`。
- 失败反馈：旧报告没有摘要字段时只读回填最近练习/作品可用证据；没有笔迹时不会伪造路径热力。
- 刷新后复现方式：完成前台书写、保存作品、导出报告，再进入 `?report=<报告ID>` 查看同一份摘要。

仍待补：

- 目前仍是本机启发式评分摘要，不是云端账号化报告、教师签章报告、专业模型评分证书或跨设备同步能力。

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

## 94. 2026-06-12 新增复盘路径热力可视化

本次把已经持久化的路径误差热力证据变成复盘面板里的可视化控件。用户保存作品后，不再只能在文字建议里读“路径贴合xx%”，而是能看到 4×4 区域热力格和最高误差区域。

完成内容：

- `index.html` 在作品复盘区新增 `reviewEvidenceMap` 容器。
- `script.js` 新增 `renderReviewEvidenceMap()`，读取 `scoreEvidence.evidence.pathErrorHotspots` 和 `strokePathErrors`。
- 热力格按 `zone` 渲染 4×4 区域，高误差格显示误差百分比、区域标签和采样点说明。
- 复盘区显示路径贴合率、路径误差率、热力采样数、最高误差区域和逐笔贴合摘要。
- `style.css` 新增稳定尺寸的复盘热力格样式，窄面板下不挤压反馈列表。
- Playwright 前台真实流程新增断言，确认保存作品后复盘面板显示路径误差热力。

真实化说明：

- 数据来源：真实笔迹评分证据里的 `pathErrorHotspots` 与 `strokePathErrors`，不是静态演示图片。
- 写入状态：不新增字段，直接读取已持久化的 `sessions[*].scoreEvidence.evidence` 或作品评分证据。
- 成功反馈：保存作品后立即出现“路径误差热力”“路径贴合”和“最高误差”。
- 失败反馈：没有热力点时只显示空状态，并明确不绘制假图。
- 刷新后复现方式：保存作品后刷新前台，复盘区会从本机状态重建同一份热力格。

仍待补：

- 目前是区域摘要可视化，不是逐点笔锋压力热图、范字轮廓叠加、逐笔动画对齐或专业模型解释层。

验收：

- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增复盘路径热力可视化`

## 95. 2026-06-12 新增复盘证据离线导出

本次把复盘热力和评分证据从“可看”推进到“可带走”。用户保存作品后，可以点击“导出证据”下载一份本机离线 HTML，里面包含作品图、评分算法、路径热力、逐笔路径贴合、逐笔轨迹匹配和评分理由。

完成内容：

- `index.html` 作品复盘操作区新增“导出证据”按钮。
- `script.js` 新增 `downloadLatestReviewEvidence()`，按钮调用 `MRAppState.downloadReviewEvidence()`。
- `app-state.js` 新增 `getReviewEvidenceExport()`、`downloadReviewEvidence()` 和复盘证据 HTML 生成逻辑。
- 复盘证据页包含作品截图、4×4 路径误差热力、逐笔路径贴合、逐笔轨迹匹配、能力维度和评分理由。
- 导出源会优先选择最近作品；若最近旧作品只有迁移生成的基础字段，则回退到最近带热力、逐笔匹配或压感细节的练习。
- 数据层脚本和 Playwright 前台真实流程新增断言，确认离线 HTML 证据页可生成和下载。

真实化说明：

- 数据来源：真实书写保存后的 `scoreEvidence`，尤其是 `pathErrorHotspots`、`strokePathErrors`、`strokeMatches` 和压感采样。
- 写入状态：不新增状态；下载时从 `mr-calligraphy-learning-state-v1` 即时生成 HTML。
- 成功反馈：下载文件名为 `mr-calligraphy-review-evidence-*.html`，离线页可打印或保存 PDF。
- 失败反馈：没有真实细节证据时按钮禁用或返回失败消息，不生成空壳报告。
- 刷新后复现方式：保存作品并刷新，点击“导出证据”仍能下载同一来源的证据页。

仍待补：

- 目前是本机离线 HTML，不是服务端验签、教师签章、专业模型解释或云端证据托管。

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

## 96. 2026-06-12 新增分享页评分证据

本次把作品分享页从“展示作品和建议”推进到“展示可追溯评分依据”。用户保存真实书写后导出的分享页，会同步包含评分算法、路径误差热力和逐笔证据；旧作品缺少证据时只显示空状态，不补造假热力图。

完成内容：

- `app-state.js` 的 `getArtworkSharePackage()` 新增 `scoreEvidence`、`scoreEvidenceSource` 和 `features`。
- 作品分享页新增“评分证据”区块，展示算法版本、范字、笔顺匹配、路径贴合、采样、压感和评分理由。
- 分享页复用复盘证据页的 4×4 路径误差热力渲染，保证本机下载页与证据页使用同一份数据。
- 分享页新增逐笔路径贴合和逐笔轨迹匹配列表。
- 旧作品或迁移记录缺少真实热力、逐笔或压感细节时，分享页只提示“不会补造评分依据”。
- 远端分享包 summary 新增 `scoreEvidence` 和 `scoreEvidenceSource`，mock 发布可验证远端 HTML 仍包含真实证据。
- 数据层脚本和 Playwright 前台真实流程新增断言，覆盖下载分享页、远端分享包和旧作品空状态。

真实化说明：

- 数据来源：真实书写保存后的 `scoreEvidence`，不是硬编码演示文字。
- 写入状态：不新增字段，读取已持久化的 `artworks[*].scoreEvidence` 或关联 `sessions[*].scoreEvidence`。
- 成功反馈：点击“导出分享页”后，HTML 中出现“评分证据”“路径误差热力”“逐笔路径贴合”和算法版本。
- 失败反馈：没有真实细节证据时不渲染热力格、不生成逐笔列表，只显示明确空状态。
- 刷新后复现方式：保存作品、刷新页面、再次导出分享页，仍从本机状态读取同一份证据。

仍待补：

- 当前仍是本机离线分享页，不是云端作品墙、生产 CDN、教师签章证书或专业模型评分报告。

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

## 97. 2026-06-13 新增后台快照权限审计

本次补齐后台动态快照按钮的真实权限链路。之前主后台和写实后台的静态按钮已经会随角色禁用，但快照列表里的“恢复/删除”是运行时生成按钮，缺少同等权限状态和点击路径拦截。现在它们会跟随本机门禁和角色权限，并把恢复/删除写入后台审计。

完成内容：

- `main-admin-scene.js` 和 `realistic-scene.js` 新增通用 `setAdminPermissionState()`，静态控件和动态快照按钮共用同一套角色禁用逻辑。
- 快照列表渲染时为“恢复/回滚”按钮标记编辑权限，为“删除”按钮标记删除权限。
- 角色切换、门禁锁定、快照列表刷新后都会重新计算动态按钮的 `data-admin-permission-state`。
- 动态按钮点击入口增加 `ensureAdminPermission()`，避免手动篡改 disabled 后绕过权限。
- 快照恢复写入 `snapshot-restore` 审计，快照删除写入 `snapshot-delete` 审计。
- E2E 覆盖主后台和写实后台的动态快照按钮：编辑可操作、复核禁用、强制点击被拦截、负责人删除后产生审计。

真实化说明：

- 数据来源：本机快照历史、本机访问门禁、操作者角色和后台审计状态。
- 写入状态：`mr-calligraphy-admin-operator-audit-v1.scopes.mainScene/realisticScene.records`。
- 成功反馈：动态快照按钮不再像“假按钮”，能正确随角色变化，并在审计导出中留下恢复/删除证据。
- 失败反馈：无权限时按钮禁用；绕过 disabled 强行触发仍会显示无权提示并写入权限拦截审计。
- 刷新后复现方式：刷新后台后，快照按钮权限由本机角色和门禁重新计算。

仍待补：

- 目前仍是本机静态后台权限，不是服务端账号、组织角色、多人审批或不可篡改审计链。

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

## 98. 2026-06-13 新增学习动作真实详情

本次把前台学习动作从“有状态写入但反馈偏简略”推进到“点击后能看到真实结果详情”。报告、计划、分享和跳转类动作会显示同一套动作详情卡，用户可以直接看到报告 ID、下载文件、计划任务、评分证据、目标步骤和本机边界；带跳转的动作不再在切换步骤后清空刚刚生成的详情。

完成内容：

- `script.js` 新增 `buildReportActionDetail()`，导出报告后显示报告 ID、站内路由、下载文件、评分证据、路径贴合和能力维度。
- `script.js` 新增 `buildPlanActionDetail()`，制定计划后显示计划 ID、任务数量、完成度、下一项、到期信息和依赖摘要。
- `script.js` 新增 `buildShareActionDetail()`，导出分享页后显示作品 ID、下载文件、有效分享数和可用评分证据。
- `script.js` 新增 `buildNavigationActionDetail()`，跳转动作显示目标步骤、路径进度和本机边界。
- `applyActionResult()` 调整带 `target` 动作的刷新顺序，跳转后恢复 `actionFeedback` 与 `actionDetail`，避免真实处理结果被 `loadScene()` 清空。
- `runLearningAction()` 为“导出报告 / 制定计划 / 导出分享页 / 返回首页”挂接真实详情。
- Playwright 前台真实流程新增断言，覆盖报告详情卡、计划详情卡和“复习巩固”跳转后的阶段详情保留。

真实化说明：

- 数据来源：`MRAppState.createReport()` 返回的报告记录、`MRAppState.createPlan()` 返回的计划记录、最近作品评分证据、分享服务状态和学习路径状态。
- 写入状态：不新增存储字段；详情卡读取已经写入的 `reports[*]`、`plans[*]`、`artworks[*].scoreEvidence` 和阶段记录。
- 成功反馈：用户点击动作后能看到具体 ID、文件名、评分证据、任务项和目标步骤，不再只是一句泛化提示。
- 失败反馈：没有作品或证据时只显示空状态说明，不生成假报告、假分享证据或假云端结果。
- 刷新后复现方式：完成书写、保存作品、导出报告、制定计划后刷新，再次点击对应动作会从本机状态重建同类详情。

仍待补：

- 当前是前台动作反馈真实化，不是服务端账号通知、云端作业流、教师端批改推送或跨设备实时协作。

验收：

- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习动作真实详情`

## 99. 2026-06-13 新增学习过程动作详情

本次继续把前台高频训练过程按钮真实化。用户点击讲解、开始临摹、切换训练模式、切换笔画、保存作品、查看学习档案或查看作品时，不再只看到一句临时提示，而是能看到对应的本机记录详情；内部刷新同一场景时也会保留刚刚生成的详情卡。

完成内容：

- `script.js` 新增最近动作反馈缓存，内部刷新同一场景/热点时恢复 `actionFeedback` 与 `actionDetail`。
- “播放讲解 / 进入 AI 讲解”新增本机讲解详情，展示段落进度、语音服务、朗读/降级数量和服务边界。
- “开始临摹 / 进入临摹训练 / 继续学习 / 再写一遍”新增本机练习会话详情，展示会话 ID、当前字、训练模式、笔画、采样点和目标步骤。
- “示范模式 / 对比模式”新增训练模式详情，说明模式是否写入当前会话。
- “上一个笔画 / 下一个笔画”新增笔画索引详情，展示当前笔画、索引、当前字和会话状态。
- “切换行书”新增创作风格详情，说明风格会在保存作品时写入本机作品记录。
- “保存作品”新增本机作品保存详情，展示作品 ID、关联会话、评分、笔画、采样点和评分证据。
- “打开历史记录 / 查看学习记录 / 筛选优秀记录 / 查看作品”新增本机档案、筛选和作品详情。
- Playwright 前台真实流程覆盖讲解详情、练习会话详情、训练模式详情、笔画索引详情和作品保存详情。

真实化说明：

- 数据来源：`MRAppState` 的讲解进度、讲解服务、练习会话、训练模式、笔画索引、作品记录、评分证据、学习档案和本机作品集。
- 写入状态：继续复用 `mr-calligraphy-learning-state-v1` 中已有 `lectureService`、`sessions[*]`、`artworks[*]`、`scoreService` 和学习档案记录。
- 成功反馈：用户可以看到真实会话 ID、作品 ID、评分证据、当前笔画和语音服务状态。
- 失败反馈：没有笔迹时“保存作品”显示真实失败详情，不写入空壳作品；没有作品时“查看作品”显示本机作品集为空。
- 刷新后复现方式：完成讲解、开始临摹、切换模式、保存作品后刷新，重新点击对应动作可从本机状态重建详情。

仍待补：

- 当前是浏览器本机学习过程反馈，不是硬件笔压设备、服务端实时课堂、教师直播点评或多端同步训练会话。

验收：

- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习过程动作详情`

## 100. 2026-06-13 新增学习档案批量操作回执

本次把前台学习档案的批量操作从“按钮能触发但结果不够可见”推进到“每次操作都有本机持久回执”。导出所选、批量移入回收站、恢复回收站、永久删除回收站记录和清空回收站都会写入 `historyBatchReceipts`，并在学习档案区显示最近一次操作的时间、数量、类型分布、文件名或回收站记录 ID。

完成内容：

- `app-state.js` 新增 `historyBatchReceipts` 归一化、上限裁剪和批量回执读取接口。
- 学习档案导出所选会记录导出文件名、所选 ID、练习/作品/报告数量和本机边界说明。
- 批量删除、单条删除、恢复回收站、永久删除和清空回收站都会追加真实操作回执。
- `index.html` 新增 `historyBatchReceipt` 回执面板，放在学习档案批量操作区。
- `script.js` 新增最近批量操作回执渲染，历史面板刷新后仍能展示最近一次操作结果。
- `style.css` 新增回执面板和数量指标样式，避免操作结果只停留在临时 toast。
- Playwright 前台真实流程覆盖学习档案导出、批量删除和恢复回收站，并断言回执写入 `localStorage`。

真实化说明：

- 数据来源：`MRAppState` 中真实的 `sessions`、`artworks`、`reports`、`historyTrash` 和所选档案 ID。
- 写入状态：新增 `mr-calligraphy-learning-state-v1.historyBatchReceipts`，最多保留 20 条本机回执。
- 成功反馈：用户可以看到最近操作的动作名称、数量、类型分布、文件名或回收站 ID。
- 失败反馈：没有选中档案、没有回收站记录或找不到目标记录时不写入假回执，只返回真实失败提示。
- 刷新后复现方式：完成一次学习档案导出、删除或恢复后刷新页面，学习档案区仍会显示最近批量操作回执。

仍待补：

- 当前是浏览器本机操作回执，不是服务端不可篡改审计、跨设备同步、账号权限日志或教师端归档流水。

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

## 101. 2026-06-13 新增学习阶段档案记录

本次把“进入笔画拆解 / 进入创作 / 复习巩固”产生的 `stageRecords` 从路径统计里的隐性记录，升级为学习档案面板中的一等记录。阶段记录现在能被筛选、打开详情、复制直达链接、批量导出、移入回收站、恢复，并随学习档案同步包的可选 `records.stages` 字段导出/拉取。

完成内容：

- `app-state.js` 新增 `stageToHistoryEntry()` 和阶段详情快照，`getHistory()` 会把 `stageRecords` 合并进学习档案列表。
- 学习档案摘要、每日趋势、批量回执、回收站和恢复流程新增阶段数量。
- 批量导出所选档案时会输出 `records.stages` 和 `history[*].type = "stage"`。
- 学习档案同步包新增可选 `records.stages`，导入、远端拉取、字段冲突和远端副本另存都支持阶段记录。
- `index.html` 新增“阶段”筛选按钮；`script.js` 新增阶段详情指标，并禁用阶段日志重命名。
- `scripts/history-repository-mock-server.js` 统计和校验可选阶段数组；`docs/history-repository-api-contract.md` 同步合同说明。
- Playwright 前台真实流程覆盖复习巩固阶段进入档案、阶段详情、阶段导出 JSON 和远端同步包包含阶段记录。

真实化说明：

- 数据来源：用户点击学习路径动作后写入的 `mr-calligraphy-learning-state-v1.stageRecords`。
- 写入状态：继续复用现有 `stageRecords`，不新增演示数据；学习档案和同步包只读取真实阶段日志。
- 成功反馈：用户能在学习档案中看到阶段记录，并能导出、同步、删除、恢复。
- 失败反馈：旧同步包没有 `records.stages` 时按空数组兼容；`records.stages` 不是数组时明确拒绝导入。
- 刷新后复现方式：点击“复习巩固”后刷新，进入学习档案并筛选“阶段”，仍可打开刚刚写入的阶段详情。

仍待补：

- 当前是本机学习阶段日志和可选同步字段，不是云端课程编排、教师下发任务、跨设备学情进度或服务端不可篡改阶段审计。

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

## 102. 2026-06-13 新增视频导出回执审计

本次把前台“生成视频”继续从“可导出、可重试”推进到“可审计、可下载留档”。视频导出现在可以把 WebM 产物记录、PNG 封面摘要、队列状态、失败原因和重试来源生成一份本机 HTML 审计文件。

完成内容：

- `app-state.js` 新增 `getPracticeVideoExportAudit()`，从 `videoExportService.records` 和 `videoExportService.jobs` 生成审计包。
- 审计包包含 WebM 文件、封面文件、封面摘要、产物摘要、任务摘要、失败原因、重试来源、队列状态和本机边界。
- `getPracticeVideoExportAuditExport()` 和 `downloadPracticeVideoExportAudit()` 可生成 `mr-calligraphy-video-export-audit-*.html`。
- 复盘面板新增“视频审计”按钮；没有任何视频任务或产物时按钮保持禁用。
- `index.html` 更新前台脚本版本串，避免浏览器缓存旧脚本。
- `learning-state-check.js` 覆盖审计包、HTML 内容、失败任务和重试来源。
- Playwright 前台真实流程覆盖 WebM 成功导出、失败、重试成功后下载视频审计 HTML。

真实化说明：

- 数据来源：真实书写笔迹产生的 WebM 记录、PNG 封面记录和本机视频导出队列。
- 写入状态：不新增假回执；审计导出读取 `mr-calligraphy-learning-state-v1.videoExportService.records/jobs`。
- 成功反馈：用户能下载 HTML 审计文件，看到成功产物、失败原因、重试来源和审计摘要。
- 失败反馈：没有视频记录或队列任务时不下载空审计，只提示暂无可导出内容。
- 刷新后复现方式：视频记录和队列保存在 localStorage；刷新后仍可下载同一批本机审计信息。

仍待补：

- 当前是浏览器本机视频导出审计，不是云端转码日志、服务端签名回执、Service Worker 后台队列、生产 MP4/GIF 或公网分享链路。

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

## 103. 2026-06-13 新增计划同步重试恢复

本次把学习计划远端同步从“失败后保留待同步队列”推进到“失败原因、重试时间和恢复动作都可追踪”。计划仓库现在会对远端请求设置超时保护，推送失败时写入失败历史和下一次可重试时间；前台按钮会从“同步队列”切换为“重试队列”，恢复 endpoint 后可继续把同一批本机计划推送出去。

完成内容：

- `app-state.js` 新增计划仓库请求超时包装，默认 8 秒，不让远端挂起造成页面无限等待。
- `planRepository` 新增 `autoSyncRetryAfter`、`lastAutoSyncFailureAt` 和 `autoSyncFailureHistory`。
- 自动同步失败会记录失败类型：HTTP 拒收、网络异常、请求超时或结构错误。
- 失败后保留 `pendingAutoSync`、待同步原因、计划数量和失败历史。
- 自动同步恢复成功后清空 `pendingAutoSync` 和 `autoSyncRetryAfter`，但保留最近失败历史，便于后续审计。
- 前台计划仓库按钮在失败队列状态下显示“重试队列”。
- `learning-state-check.js` 模拟远端超时，验证队列保留、失败历史、重试摘要和恢复成功。
- Playwright 覆盖 422 拒收、网络中断、失败历史持久化、按钮切换和恢复 endpoint 后成功重试。

真实化说明：

- 数据来源：真实计划同步包、用户配置的远端 endpoint、真实 fetch 结果和本机计划仓库状态。
- 写入状态：`mr-calligraphy-learning-state-v1.planRepository`。
- 成功反馈：恢复成功后页面显示已推送计划，按钮回到“推送计划”，待同步队列清空。
- 失败反馈：HTTP/网络/超时失败都写入失败历史和下一次可重试时间，不伪造远端成功。
- 刷新后复现方式：失败历史和重试时间持久化在 localStorage，刷新后仍可看到重试队列状态。

仍待补：

- 当前是浏览器本机失败恢复，不是服务端重试任务、后台队列调度、账号化托管仓库、教师端通知或服务端不可篡改审计。

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

## 104. 2026-06-13 新增项目仓库重试恢复

本次把主后台“远端项目仓库 API”从“失败后只显示最近错误”推进到“失败原因、失败历史、建议重试时间和恢复推送都可追踪”。项目仓库远端检查、推送和拉取现在都带请求超时保护；推送失败后按钮会显示“重试推送”，修复 endpoint 后可继续发送当前本机项目仓库包。

完成内容：

- `project-archive.js` 新增项目仓库远端请求超时包装，默认 8 秒。
- `mr-calligraphy-project-repository-remote-v1` 新增 `lastRemoteFailureAt`、`lastFailureAction`、`remoteRetryAfter` 和 `remoteFailureHistory`。
- 失败历史记录动作类型、失败类型、endpoint、workspace、包 ID、包摘要、场景数、模型数、失败时间和建议重试时间。
- 失败类型区分 HTTP 拒收、网络异常、请求超时、结构校验失败和未知失败。
- 主后台远端项目仓库状态会显示失败历史摘要；推送失败未恢复时按钮显示“重试推送”。
- 推送成功后清空当前错误和重试时间，但保留失败历史用于本机审计。
- Playwright 已扩展项目仓库失败用例，覆盖 401、非 JSON、无项目包、PUT 422、网络中断、页面内超时注入、恢复 endpoint 后成功重试和本机布局保留。

真实化说明：

- 数据来源：主后台当前本机项目档案包、真实远端 API 响应、浏览器 fetch 错误和本机项目仓库远端状态。
- 写入状态：`mr-calligraphy-project-repository-remote-v1.remoteFailureHistory`、`remoteRetryAfter`、`lastRemoteFailureAt` 和 `lastFailureAction`。
- 成功反馈：恢复推送后页面显示远端已接收，按钮恢复为“推送仓库包”，回执列表显示本机校验通过。
- 失败反馈：HTTP、网络、超时或结构错误都不会显示远端成功，会写入失败历史和下一次建议重试时间。
- 刷新后复现方式：失败历史、最近错误和重试状态保存在 localStorage，刷新主后台后仍可读取。

仍待补：

- 当前是浏览器本机远端 adapter 的失败恢复，不是账号化项目仓库、服务端后台队列、多人三方合并、生产资产签名或不可篡改审计。

验收：

- `node --input-type=module --check < project-archive.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "main admin project repository keeps local data on remote failures"`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增项目仓库重试恢复`

## 105. 2026-06-13 新增学习档案仓库重试恢复

本次把前台“远端学习档案 API”从“失败后只显示最近错误”推进到“失败原因、失败历史、建议重试时间和恢复推送都可追踪”。学习档案仓库检查、推送和分页拉取现在都带请求超时保护；推送失败后按钮会显示“重试推送”，修复 endpoint 后可继续发送当前本机学习档案包。

完成内容：

- `app-state.js` 新增学习档案仓库远端请求超时包装，默认 8 秒。
- `historyRepository` 新增 `lastRemotePushAt`、`lastRemoteFailureAt`、`lastFailureAction`、`remoteRetryAfter` 和 `remoteFailureHistory`。
- 失败历史记录动作类型、失败类型、endpoint、workspace、包 ID、包摘要、记录数、失败时间和建议重试时间。
- 失败类型区分 HTTP 拒收、网络异常、请求超时、结构校验失败和远端响应未完成。
- 前台学习档案仓库状态会显示失败历史摘要；推送失败未恢复时按钮显示“重试推送”。
- 推送成功后清空当前错误和重试时间，但保留失败历史用于本机审计。
- Playwright 已扩展学习档案失败用例，覆盖 401、500、非法 JSON、空包、PUT 422、网络中断、页面内超时注入、恢复 endpoint 后成功重试和回执本机校验。

真实化说明：

- 数据来源：前台当前本机学习档案包、真实远端 API 响应、浏览器 fetch 错误和本机 `historyRepository` 状态。
- 写入状态：`mr-calligraphy-learning-state-v1.historyRepository.remoteFailureHistory`、`remoteRetryAfter`、`lastRemoteFailureAt`、`lastFailureAction` 和 `lastRemotePushAt`。
- 成功反馈：恢复推送后页面显示已推送学习档案，按钮恢复为“推送档案”，回执列表显示本机校验通过。
- 失败反馈：HTTP、网络、超时或结构错误都不会显示远端成功，会写入失败历史和下一次建议重试时间。
- 刷新后复现方式：失败历史、最近错误和重试状态保存在 localStorage，刷新前台后仍可读取。

仍待补：

- 当前是浏览器本机远端 adapter 的失败恢复，不是账号化学习档案仓库、服务端后台队列、跨设备自动同步、教师端批注审计或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front history repository shows real remote failure feedback"`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front history repository handles network, paged pull, and id conflicts"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习档案重试恢复`

## 106. 2026-06-13 新增报告仓库重试恢复

本次把前台“远端报告 API”从“失败后只显示最近错误”推进到“失败原因、失败历史、建议重试时间和恢复推送都可追踪”。报告仓库检查、推送和拉取现在都带请求超时保护；推送失败后按钮会显示“重试推送”，修复 endpoint 后可继续发送当前本机报告包。

完成内容：

- `app-state.js` 新增报告仓库远端请求超时包装，默认 8 秒。
- `reportRepository` 新增 `lastRemotePushAt`、`lastRemoteFailureAt`、`lastFailureAction`、`remoteRetryAfter` 和 `remoteFailureHistory`。
- 失败历史记录动作类型、失败类型、endpoint、workspace、包 ID、包摘要、报告数、失败时间和建议重试时间。
- 失败类型区分 HTTP 拒收、网络异常、请求超时、结构校验失败和远端响应未完成。
- 前台报告仓库状态会显示失败历史摘要；推送失败未恢复时按钮显示“重试推送”。
- 推送成功后清空当前错误和重试时间，但保留失败历史用于本机审计。
- Playwright 新增报告仓库失败恢复用例，覆盖 401、500、非法 JSON、空包、PUT 422、网络中断、页面内超时注入、恢复 endpoint 后成功重试和签名回执本机校验。

真实化说明：

- 数据来源：前台当前本机报告包、真实远端 API 响应、浏览器 fetch 错误和本机 `reportRepository` 状态。
- 写入状态：`mr-calligraphy-learning-state-v1.reportRepository.remoteFailureHistory`、`remoteRetryAfter`、`lastRemoteFailureAt`、`lastFailureAction` 和 `lastRemotePushAt`。
- 成功反馈：恢复推送后页面显示已推送报告，按钮恢复为“推送报告”，回执列表显示本机校验通过。
- 失败反馈：HTTP、网络、超时或结构错误都不会显示远端成功，会写入失败历史和下一次建议重试时间。
- 刷新后复现方式：失败历史、最近错误和重试状态保存在 localStorage，刷新前台报告页后仍可读取。

仍待补：

- 当前是浏览器本机远端 adapter 的失败恢复，不是账号化报告仓库、服务端后台队列、教师端账号审批、生产证书签章或不可篡改审计。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front report repository shows retryable remote failure recovery"`
- `git diff --check`

提交：

- 中文 commit message：`新增报告仓库重试恢复`

## 107. 2026-06-13 新增学习阶段动作详情

本次把前台“进入笔画拆解 / 进入创作 / 复习巩固”三类阶段跳转从“只写阶段记录和跳页”推进到“写入记录后能在动作详情卡、学习档案和远端学习档案包里完整追踪”。用户点击阶段按钮后，会看到阶段记录 ID、目标步骤、任务、字帖和阶段进度，不再像普通跳转按钮。

完成内容：

- `app-state.js` 扩展 `getStageActionDetail()`，阶段动作详情新增“阶段记录 ID”和“目标步骤”指标。
- 阶段详情列表新增记录 ID、写入时间和当前阶段完成清单。
- 前台主流程 E2E 改为真实点击“进入笔画拆解”和“进入创作”，并继续覆盖“复习巩固”。
- E2E 验证三条阶段记录都写入 `stageRecords`，并出现在学习档案阶段筛选里。
- 学习档案批量导出和远端学习档案推送同步更新断言，验证 3 条阶段记录进入本机导出包和远端同步包。

真实化说明：

- 数据来源：`MRAppState.recordLearningStage()` 写入的真实阶段记录、当前任务和学习阶段进度。
- 写入状态：`mr-calligraphy-learning-state-v1.stageRecords`。
- 成功反馈：动作详情卡展示具体阶段记录 ID、目标步骤和进度。
- 失败反馈：未知阶段仍返回真实失败，不写入假记录。
- 刷新后复现方式：阶段记录会进入学习档案列表、批量导出包和远端学习档案同步包。

仍待补：

- 当前是浏览器本机阶段记录详情，不是教师端课堂任务流、云端阶段审批、多端协同或服务端不可篡改审计。

验收：

- `node --check app-state.js`
- `node --input-type=module --check < script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e -- --grep "front practice saves real strokes and exports a report"`
- `git diff --check`

提交：

- 中文 commit message：`新增学习阶段动作详情`

## 108. 2026-06-13 新增作品分享远端重试恢复

本次把前台“远端分享 API”从“失败后只显示最近错误”推进到“失败动作、失败类型、失败历史、建议重试时间和恢复发布/撤销都可追踪”。分享远端检查、发布和撤销现在都有请求超时保护；发布失败后按钮会显示“重试发布”，撤销失败后按钮会显示“重试撤销”。

完成内容：

- `app-state.js` 新增作品分享远端请求超时包装，默认 8 秒。
- `shareService` 新增 `lastRemotePushAt`、`lastRemoteRevokeAt`、`lastRemoteFailureAt`、`lastFailureAction`、`remoteRetryAfter` 和 `remoteFailureHistory`。
- 失败历史记录动作类型、失败类型、endpoint、workspace、分享 ID、包 ID、包摘要、publicUrl、分享数量、失败时间和建议重试时间。
- 失败类型区分 HTTP 拒收、网络异常、请求超时、结构校验失败和远端响应未完成。
- 前台远端分享状态会显示失败历史摘要；发布失败未恢复时按钮显示“重试发布”，撤销失败未恢复时按钮显示“重试撤销”。
- 发布或撤销恢复成功后清空当前错误和重试时间，但保留失败历史用于本机审计。
- Playwright 新增分享远端失败恢复用例，覆盖 401、非法 JSON、PUT 422、网络中断、页面内超时注入、恢复 endpoint 后成功发布、DELETE 409 和恢复撤销。

真实化说明：

- 数据来源：前台当前本机作品分享包、真实远端 API 响应、浏览器 fetch 错误和本机 `shareService` 状态。
- 写入状态：`mr-calligraphy-learning-state-v1.shareService.remoteFailureHistory`、`remoteRetryAfter`、`lastRemoteFailureAt`、`lastFailureAction`、`lastRemotePushAt` 和 `lastRemoteRevokeAt`。
- 成功反馈：恢复发布后页面显示远端链接和回执校验，按钮恢复为“发布远端”；恢复撤销后页面显示已请求远端撤销，撤销回执校验通过。
- 失败反馈：HTTP、网络、超时或结构错误都不会显示远端成功，会写入失败历史和下一次建议重试时间。
- 刷新后复现方式：失败历史、最近错误和重试状态保存在 localStorage，刷新前台作品页后仍可读取。

仍待补：

- 当前是浏览器本机远端 adapter 的失败恢复，不是内置公网作品墙、微信分享、账号权限、生产 CDN、服务端后台队列或不可篡改审计。

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

本次把作品集面板补成可迁移的真实本机仓库入口：用户不需要打开开发者工具，就能在前台直接下载作品仓库 JSON，也能通过文件选择器导入恢复作品。

完成内容：

- 作品集 `historyArtworkGallery` 新增 `artworkRepositoryStatus` 状态栏。
- 新增 `artworkRepositoryExportButton`，点击后调用 `MRAppState.downloadArtworkRepository()` 并触发浏览器下载。
- 新增 `artworkRepositoryImportButton` 和 `artworkRepositoryImportInput`，通过真实 file chooser 读取 JSON 并调用 `MRAppState.importArtworkRepositoryPackage()`。
- 导入或导出后会刷新学习档案、作品集卡片、标签云和仓库状态，不需要用户手动刷新页面。
- 空作品状态下导出按钮会禁用，避免用户点击一个伪下载入口。
- 移动端样式新增单列仓库工具栏，按钮保持固定高度和可读文字，不挤压搜索框。

真实化说明：

- 数据来源：前台 `MRAppState` 中的 `ArtworkRecord` 和关联 `PracticeSession`。
- 写入状态：导出/导入状态写入 `mr-calligraphy-learning-state-v1.artworkRepository`。
- 成功反馈：状态栏显示“最近导入/导出 N 幅作品、M 条关联练习”，作品卡片立即出现。
- 失败反馈：JSON 解析失败、包类型错误或空作品包会显示真实错误；同 ID 冲突会提示跳过，不覆盖用户本机作品。
- 刷新后复现方式：导入后的作品、关联练习和仓库状态从 localStorage 恢复。

仍待补：

- 当前前端只提供本机 JSON 仓库包，不包含公网作品墙、账号登录、跨设备云同步、社交分享 SDK 或生产云端存储。

验收：

- `node --check app-state.js`
- `node --check script.js`
- `node --check tests/e2e/real-flows.spec.js`
- `npx playwright test tests/e2e/real-flows.spec.js -g "front artwork repository exports and imports local artwork package"`
- `git diff --check`

提交：

- 中文 commit message：`新增作品仓库导入导出`

## 110. 2026-06-13 新增作品仓库冲突审计

本次把作品仓库导入冲突补成用户可处理的前台 UI。导入包与本机作品同 ID 且内容不同的时候，不再只有状态栏一句“跳过冲突”，而是会在作品集里显示冲突审计列表。

完成内容：

- 作品集新增 `artworkRepositoryConflictPanel`、`artworkRepositoryConflictStatus` 和 `artworkRepositoryConflictList`。
- `renderArtworkRepositoryConflictPanel()` 会读取 `getArtworkRepositoryStatus().lastConflictRecords`，无冲突时隐藏，有冲突时展示。
- 每条冲突显示记录类型、导入标题、本机更新时间、导入更新时间和字段差异。
- 动态按钮使用 `data-feature-state="real-local"`，提供“另存导入副本”和“忽略审计”。
- `handleArtworkRepositoryConflictAction()` 调用 `MRAppState.resolveArtworkRepositoryConflict()`，处理后刷新学习档案和作品集。
- 样式复用现有报告/学习档案冲突审计视觉，移动端保持单列可读。
- Playwright 用例覆盖冲突面板显示、点击“另存导入副本”后作品集数量从 2 变 3。

真实化说明：

- 数据来源：`artworkRepository.lastConflictRecords` 中保存的本机/导入字段差异和导入快照。
- 写入状态：另存副本会写入新的 `ArtworkRecord`，必要时写入新的关联 `PracticeSession`。
- 成功反馈：处理后 notice 显示结果，冲突面板隐藏或减少，作品集卡片刷新。
- 失败反馈：找不到冲突或导入快照缺失时不展示假成功。
- 刷新后复现方式：未处理冲突仍会显示在作品集；已另存副本的作品继续保存在本机作品集中。

仍待补：

- 当前是本机前台冲突处理，不是服务端多人合并、账号权限、生产审计签名或公开作品墙。

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

本次把作品集新增为真实可下载的离线展示页。它和“导出仓库”分工不同：仓库 JSON 用于迁移数据，作品集 HTML 用于阅读、打印和手动分享。

完成内容：

- 作品集工具区新增 `artworkCollectionExportButton`，文案为“导出作品集”。
- 点击后调用 `MRAppState.downloadArtworkCollectionPage()`，浏览器会下载 `mr-calligraphy-artwork-collection-*.html`。
- HTML 页面内置样式、作品卡片、标签云、四项摘要、五维评分条、反馈列表、评分证据摘要和“打印 / 保存 PDF”按钮。
- 空作品状态下“导出作品集”和“导出仓库”一起禁用，避免假按钮。
- 导出成功后刷新作品仓库状态，显示最近导出离线 HTML 作品集的作品数量和时间。
- Playwright 用例读取下载 HTML 文件，确认它包含真实作品内容和离线作品集边界说明。
- smoke test 新增 `artworkCollectionExportButton` 标记。

真实化说明：

- 数据来源：前台本机作品集、关联练习、评分证据、截图、标签和反馈。
- 写入状态：`mr-calligraphy-learning-state-v1.artworkRepository.lastCollectionExportedAt` 和 `lastCollectionArtworkCount`。
- 成功反馈：notice 显示文件名，状态栏显示“离线 HTML 作品集”。
- 失败反馈：没有作品时返回“还没有可导出的作品集”，不创建空壳下载。
- 刷新后复现方式：最近导出状态从 localStorage 恢复；下载的 HTML 可离线打开。

仍待补：

- 当前只是本机静态 HTML 文件，不提供公网 URL、账号权限、班级作品墙、CDN 托管、跨设备同步或社交平台 API。

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

本次给作品集新增一个本机课堂评阅出口。它不是教师端后台，但老师可以拿到一份真实离线 HTML，直接评阅当前浏览器里的作品，并导出评阅 JSON。

完成内容：

- 作品集工具区新增 `artworkClassroomReviewExportButton`，文案为“导出评阅表”。
- 点击后调用 `MRAppState.downloadArtworkClassroomReviewPage()`，浏览器会下载 `mr-calligraphy-classroom-review-*.html`。
- HTML 页面内置样式、作品卡片、五维评分建议、自动反馈、教师分数、评阅等级、评阅人、课堂批注和“导出评阅 JSON”按钮。
- 评阅表里的输入会保存到该 HTML 所在浏览器的 localStorage，刷新后可恢复草稿。
- 空作品状态下“导出评阅表”和其他作品导出按钮一起禁用。
- 导出成功后刷新作品仓库状态，显示最近导出离线课堂评阅表的作品数量和时间。
- Playwright 用例读取下载 HTML 文件，确认它包含真实作品内容、评阅字段、评阅 JSON 导出按钮和本机/非云端边界说明。
- smoke test 新增 `artworkClassroomReviewExportButton` 标记。

真实化说明：

- 数据来源：前台本机作品集、关联练习、评分证据、截图和反馈。
- 写入状态：`mr-calligraphy-learning-state-v1.artworkRepository.lastClassroomReviewExportedAt` 和 `lastClassroomReviewArtworkCount`。
- 成功反馈：notice 显示文件名，状态栏显示“离线课堂评阅表”。
- 失败反馈：没有作品时返回“还没有可导出的课堂评阅表”，不创建空壳下载。
- 刷新后复现方式：最近导出状态从 localStorage 恢复；下载的 HTML 可离线打开，评阅草稿保存在打开该 HTML 的浏览器本机。

仍待补：

- 当前不是账号化教师端、云端批改、课堂作品墙、班级权限、CDN 托管或服务端不可篡改审计。

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

本次把课堂评阅表从“只可导出和填写”推进到“可回写本机作品集”。离线评阅表导出的 JSON 可以重新导入前台，评阅摘要会显示在作品卡片上。

完成内容：

- `ArtworkRecord` 新增 `classroomReview` 字段，归一化教师分数、评阅等级、评阅人、课堂批注、来源包 ID 和 digest。
- 新增 `MRAppState.importArtworkClassroomReviewNotes()`，支持导入 `mr-calligraphy-classroom-review-notes-v1` JSON。
- 作品集工具区新增 `artworkClassroomReviewImportButton`，文案为“导入评阅”。
- 新增隐藏文件输入 `artworkClassroomReviewImportInput`，通过真实 file chooser 读取 JSON。
- 导入成功后刷新学习档案和作品集，卡片显示“课堂评阅：评阅人 / 等级 / 分数 / 批注”。
- 导入统计写入 `artworkRepository.lastClassroomReviewImportedAt`、`lastClassroomReviewImportedCount` 和 `lastClassroomReviewSkippedCount`。
- Playwright 用例覆盖 1 条匹配评阅和 1 条不存在作品评阅，确认回写 1 条、跳过 1 条。
- smoke test 新增课堂评阅导入按钮和输入框标记。

真实化说明：

- 数据来源：评阅 JSON 的 `records` 和当前浏览器本机 `ArtworkRecord.id`。
- 写入状态：`mr-calligraphy-learning-state-v1.artworks[*].classroomReview` 和 `artworkRepository` 导入统计。
- 成功反馈：状态栏显示导入/跳过数量，作品卡片显示课堂评阅摘要。
- 失败反馈：非法 JSON、kind 不匹配、缺 records、空评阅或无匹配作品时不写入假结果。
- 刷新后复现方式：评阅摘要随本机作品记录持久化。

仍待补：

- 当前不是账号化教师端、云端批改、班级收件箱、服务端签名、权限控制或不可篡改审计。

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

本次给课堂评阅增加一个离线汇总出口。导入评阅 JSON 后，用户可以把已回写的评阅记录导出成 HTML 汇总，用于打印、归档或线下交接。

完成内容：

- 新增 `MRAppState.getArtworkClassroomReviewSummaryExport()`，从 `ArtworkRecord.classroomReview` 生成汇总数据。
- 新增 `MRAppState.downloadArtworkClassroomReviewSummary()`，下载 `mr-calligraphy-classroom-review-summary-*.html`。
- HTML 汇总展示评阅总数、教师均分、有分数数量、评阅人数量、等级分布、作品缩略图、教师分数、评阅人、批注和 digest。
- 作品集工具区新增 `artworkClassroomReviewSummaryExportButton`，文案为“评阅汇总”。
- 没有已导入课堂评阅时按钮禁用，避免导出空文件。
- 导出状态写入 `artworkRepository.lastClassroomReviewSummaryExportedAt` 和 `lastClassroomReviewSummaryCount`。
- Playwright 用例读取下载 HTML，确认教师、分数、批注、`ClassroomReviewSummary: yes` 和 digest。
- smoke test 新增评阅汇总按钮标记。

真实化说明：

- 数据来源：前台本机作品集里的 `classroomReview`。
- 写入状态：`mr-calligraphy-learning-state-v1.artworkRepository` 汇总导出时间和数量。
- 成功反馈：notice 显示文件名，状态栏显示“课堂评阅汇总”。
- 失败反馈：没有已导入课堂评阅时返回明确失败，不创建空壳下载。
- 刷新后复现方式：评阅记录和汇总导出状态都从 localStorage 恢复。

仍待补：

- 当前不是账号化教师端、班级成绩册、云端批改、服务端签名、权限控制或不可篡改审计。

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

本次补齐主后台导入模型删除后的本机资产清理闭环。导入模型如果被历史快照引用，删除时会保留 IndexedDB 文件；现在用户可以在主后台删除审计区明确清理这些“历史保留”文件，并留下同一份审计记录。

完成内容：

- `main-admin.html` 的“导入模型删除审计”新增“清理历史文件”按钮。
- 主后台脚本新增历史保留审计筛选，只允许清理已从当前布局移除、但仍保留在本机模型仓库里的导入模型文件。
- 清理动作删除 `mr-calligraphy-main-model-store/models` 中的对应记录，并把审计状态写为 `storage-deleted`。
- 按钮状态接入本机后台角色权限：没有 `delete` 权限、没有可清理记录或资产仍在当前布局中时不可点。
- E2E 覆盖导入 GLB、删除生成“历史保留”审计、点击清理、读取 IndexedDB 确认文件消失、刷新和审计 HTML 导出。
- smoke test 新增 `mainImportAuditCleanup` 标记。

真实化说明：

- 数据来源：主后台本机导入模型审计、当前主场景布局和 IndexedDB 模型仓库。
- 写入状态：清理只更新导入审计记录，不会修改当前不存在的场景对象；当前布局仍引用的资产会被跳过。
- 成功反馈：主后台导入状态显示真实清理数量，审计列表显示“文件已清理”。
- 失败反馈：取消、无可清理记录、权限不足或删除失败都返回明确提示。
- 刷新后复现方式：清理结果随 `mr-calligraphy-main-import-audit-v1` 持久化。

仍待补：

- 当前是本机 IndexedDB 清理，不是服务端资产回收、CDN purge、生产账号权限或不可篡改审计。

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

本次把主后台和写实后台的导入模型贴图管理补成可回收闭环。用户替换或移除贴图后，旧贴图会先保留给草稿、历史快照和发布版本；现在后台可以扫描真正无人引用的贴图，并由用户确认后清理。

完成内容：

- IndexedDB 模型仓库新增真实列表读取能力，后台可枚举本机保存的导入模型和贴图文件。
- 主后台“导入模型材质”新增“清理孤立贴图”按钮。
- 写实后台“导入模型材质”新增“清理孤立贴图”按钮。
- 清理前会收集当前草稿、保存历史、当前发布版本和发布版本历史中的贴图 `dbKey`，只清理未被引用的 PNG/JPG/WebP 贴图。
- 清理入口受本机后台删除权限控制，且必须经过确认弹窗。
- 清理结果写入对应导入模型审计，列表和导出 HTML 可看到“文件已清理”。
- Playwright 覆盖主后台与写实后台：构造真实 IndexedDB 孤立贴图、执行清理、确认孤立贴图删除，并确认当前和已发布贴图仍保留。
- smoke test 覆盖新增按钮和贴图输入/移除控件标记。

真实化说明：

- 数据来源：后台本机 IndexedDB 模型仓库和 localStorage 草稿/历史/发布记录。
- 写入状态：只删除孤立贴图二进制，保留仍被任何版本引用的贴图，审计写入 localStorage。
- 成功反馈：状态栏显示真实清理数量，审计列表显示清理状态。
- 失败反馈：没有孤立贴图、权限不足、用户取消、扫描失败或删除失败都不会显示假成功。
- 刷新后复现方式：IndexedDB 中孤立贴图已删除，审计记录持久化。

仍待补：

- 当前不是服务端资产回收、CDN purge、生产账号权限、多人协作后台或不可篡改资产审计。

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

本次加强前台作品仓库 JSON 包的可信度。导出的作品仓库包现在带稳定 SHA-256 摘要，导入时如果摘要与内容不一致，会拒绝导入，避免被篡改的 JSON 悄悄写入本机作品集。

完成内容：

- 作品仓库导出包新增 `digestAlgorithm` 和 `packageDigest`。
- `packageDigest` 按去除自身后的稳定 JSON 计算，覆盖作品、关联练习、summary、records、workspace 和来源边界。
- 最近导出/导入状态会显示摘要短码，并把完整摘要写入 `artworkRepository.lastPackageDigest`。
- 导入时如果包声明了 `packageDigest`，会重新计算并比对；不匹配时返回“摘要校验失败”并不写入作品。
- 未带摘要的旧版作品仓库包仍可导入，兼容此前导出的本机备份。
- Playwright 用例覆盖导出摘要、篡改包拒绝、原包导入、摘要持久化和修改冲突包后重新签摘要再导入。

真实化说明：

- 数据来源：导出 JSON 包自身和当前浏览器本机作品仓库。
- 写入状态：成功导入才写入作品、关联练习和 `lastPackageDigest`；摘要失败只写入错误提示。
- 成功反馈：作品仓库状态显示导出/导入数量与摘要短码。
- 失败反馈：摘要不匹配时显示声明摘要和实际摘要短码，明确不导入。
- 刷新后复现方式：成功导入摘要随学习状态持久化；失败不会创建作品记录。

仍待补：

- 当前不是生产签名、服务端验签、账号化远端作品仓库、课堂作品墙或不可篡改审计。

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

本次把课堂评阅 JSON 回收从“可导入”推进到“可验真”。离线评阅表导出的 JSON 可以携带稳定 SHA-256 摘要，主应用导入前会先校验摘要，避免被改动的评阅结果静默写回作品。

完成内容：

- `mr-calligraphy-classroom-review-notes-v1` 评阅 JSON 支持 `digestAlgorithm: "sha256-stable-json"` 和顶层 `packageDigest`。
- 离线课堂评阅表的“导出评阅 JSON”脚本新增稳定 JSON 序列化和 Web Crypto SHA-256 摘要计算。
- 主应用导入课堂评阅 JSON 时会校验摘要；声明摘要与实际内容不一致时拒绝导入。
- 兼容旧版没有摘要的评阅 JSON，避免历史离线文件失效。
- 作品仓库状态新增最近课堂评阅包摘要短码，导入成功后可人工核对文件。
- E2E 覆盖篡改评阅 JSON 失败、原始评阅 JSON 成功导入、作品卡片显示评阅和 localStorage 持久化。

真实化说明：

- 数据来源：教师离线填写并导出的课堂评阅 JSON。
- 写入状态：只有摘要通过且作品 ID 匹配时，才写回 `ArtworkRecord.classroomReview`。
- 成功反馈：状态栏显示导入数量、跳过数量和摘要短码。
- 失败反馈：摘要校验失败会提示声明摘要和实际摘要，并且不会写入任何评阅。
- 刷新后复现方式：评阅内容和摘要写入前台学习状态，刷新后仍可在作品卡片看到。

仍待补：

- 当前不包含教师账号身份、云端签名、公钥证书、不可篡改审计或班级权限。

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

本次为前台学习路径加一条自动门禁，防止后续再出现“按钮文案已经加了，但没有真实处理”的回归。学习路径动作是动态生成的，单靠 HTML 控件清单不能证明每个动作都已接入本机状态层。

完成内容：

- 新增 `scripts/learning-action-coverage-check.js`。
- 脚本会解析 `script.js` 中 10 个 `SCENES` 场景的动作按钮。
- 每个动作必须在 `LEARNING_ACTION_FEATURES` 中声明真实状态，且不能声明为 `disabled` 或 `demo-content`。
- 每个动作必须在 `runLearningAction` 中有处理分支，避免只有按钮、没有函数。
- `runLearningAction` 中的分支也必须反向具备状态标记，避免 UI 标记和处理函数分叉。
- 已接入 `scripts/smoke-test.js`，作为日常 smoke test 的固定步骤。

真实化说明：

- 数据来源：前台主脚本里的场景动作、状态标记和处理分支。
- 成功反馈：输出场景数、动作数、状态标记数和处理分支数；当前为 10 / 30 / 30 / 30。
- 失败反馈：逐条列出缺标记、缺处理分支或状态不真实的动作。
- 验收价值：新增学习路径按钮时，提交前就能发现“按钮像假的”风险。

仍待补：

- 这是静态覆盖检查；真实点击、下载、状态持久化和失败恢复仍需要 Playwright 继续扩展。

验收：

- `node --check scripts/learning-action-coverage-check.js`
- `node scripts/learning-action-coverage-check.js`
- `node --check scripts/smoke-test.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增学习路径动作覆盖验收`

## 120. 2026-06-13 新增学习档案包摘要验真

本次把前台学习档案仓库从“可同步”推进到“可验真”。学习档案 JSON 包现在会携带稳定 SHA-256 摘要，导入和远端拉取都会先校验摘要，避免被改动的练习、作品、报告或阶段记录静默写入本机状态。

完成内容：

- `mr-calligraphy-history-repository-v1` 新增 `digestAlgorithm: "sha256-stable-json"`。
- 导出包新增 `packageDigest`，按稳定 JSON 计算 SHA-256。
- 导入时如果包声明了 `packageDigest`，会重新计算并比对；不匹配时返回“摘要校验失败”并不写入任何学习档案。
- 无摘要的旧版学习档案包仍可导入。
- `historyRepository` 新增最近包摘要持久化路径，导出、导入、推送、检查和拉取都会保留 `lastPackageDigest`。
- 远端失败历史记录保存当前推送包摘要，便于把 401 / 422 / 网络失败与具体包关联。
- E2E 断言推送 body 包含摘要字段，localStorage 保存摘要，拉取后摘要不丢失。

真实化说明：

- 数据来源：当前本机学习档案集合、JSON 同步包和远端 API 返回包。
- 写入状态：摘要通过后才写入本机 `sessions`、`artworks`、`reports`、`stageRecords` 与 `historyRepository`。
- 成功反馈：学习档案仓库摘要显示记录数、Workspace 和摘要短码。
- 失败反馈：篡改包会显示声明摘要与实际摘要短码，并阻止导入。
- 刷新后复现方式：`mr-calligraphy-learning-state-v1.historyRepository.lastPackageDigest` 会保留最近成功同步摘要。

仍待补：

- 摘要只能证明包内容没有在导出后被改动，不能证明作者身份、教师权限、远端服务可信或跨设备冲突自动合并正确性。

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

本次把前台报告仓库从“每份报告可验真”推进到“整个同步包可验真”。报告仓库 JSON 包现在会携带稳定 SHA-256 摘要，导入和远端拉取会先校验摘要，避免报告内容、教师批注或验真摘要被改动后静默写入本机状态。

完成内容：

- `mr-calligraphy-report-repository-v1` 新增 `digestAlgorithm: "sha256-stable-json"`。
- 导出包新增 `packageDigest`，按稳定 JSON 计算 SHA-256。
- 导入时如果包声明了 `packageDigest`，会重新计算并比对；不匹配时返回“摘要校验失败”并不写入任何报告。
- 无摘要的旧版报告仓库包仍可导入。
- `reportRepository` 新增最近包摘要持久化路径，导出、导入、推送、检查和拉取都会保留 `lastPackageDigest`。
- 远端返回无效包时会返回校验失败，不再按空仓库处理。
- 报告仓库 mock server 会校验传入包摘要，并在服务端改写接受包后重新签摘要。
- E2E 断言报告仓库下载包、远端 PUT body 和远端接受包都包含摘要字段，localStorage 保存摘要，拉取后摘要不丢失。

真实化说明：

- 数据来源：当前本机报告集合、每份报告本机验真摘要、JSON 同步包和远端 API 返回包。
- 写入状态：摘要通过后才写入本机 `reports` 与 `reportRepository`。
- 成功反馈：报告仓库摘要显示报告数、Workspace、签名回执和摘要短码。
- 失败反馈：篡改包会显示声明摘要与实际摘要短码，并阻止导入。
- 刷新后复现方式：`mr-calligraphy-learning-state-v1.reportRepository.lastPackageDigest` 会保留最近成功同步摘要。

仍待补：

- 摘要只能证明包内容没有在导出后被改动，不能证明教师身份、签章证书、公网服务可信或跨设备冲突自动合并正确性。

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

本次把前台计划仓库从“能同步计划和处理冲突”推进到“整个同步包可验真”。计划仓库 JSON 包现在会携带稳定 SHA-256 摘要，导入和远端拉取会先校验摘要，避免计划标题、任务项、日期或 Workspace 元数据被改动后静默写入本机状态。

完成内容：

- `mr-calligraphy-plan-repository-v1` 新增 `digestAlgorithm: "sha256-stable-json"`。
- 导出包新增 `packageDigest`，按稳定 JSON 计算 SHA-256。
- 导入时如果包声明了 `packageDigest`，会重新计算并比对；不匹配时返回“摘要校验失败”并不写入任何计划。
- 无摘要的旧版计划仓库包仍可导入。
- `planRepository` 新增最近包摘要持久化路径，导出、导入、推送、检查和拉取都会保留 `lastPackageDigest`。
- 远端返回无效包时会返回校验失败，不再按空仓库处理。
- 计划仓库 mock server 会校验传入包摘要，并在服务端改写接受包后重新签摘要。
- 自动同步失败历史会记录待推送包摘要，便于把失败队列与具体 JSON 包关联。
- E2E 断言计划仓库远端 PUT body、远端接受包、失败队列和冲突包都包含或保留摘要字段。

真实化说明：

- 数据来源：当前本机学习计划、JSON 同步包和远端 API 返回包。
- 写入状态：摘要通过后才写入本机 `plans` 与 `planRepository`。
- 成功反馈：计划仓库摘要显示计划数、Workspace、回执校验和摘要短码。
- 失败反馈：篡改包会显示声明摘要与实际摘要短码，并阻止导入。
- 刷新后复现方式：`mr-calligraphy-learning-state-v1.planRepository.lastPackageDigest` 会保留最近成功同步或最近看到的远端冲突包摘要。

仍待补：

- 摘要只能证明包内容没有在导出后被改动，不能证明教师身份、排课权限、公网服务可信或跨设备冲突自动合并正确性。

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

本次把前台远端分享从“能发布 publicUrl 和保存回执”推进到“整个分享仓库包可验真”。作品分享远端包现在会携带稳定 SHA-256 摘要，前端检查和发布返回包时会先校验摘要，避免分享 HTML、分享记录、Workspace 或远端接受元数据被改动后静默写入本机状态。

完成内容：

- `mr-calligraphy-share-repository-v1` 新增 `digestAlgorithm: "sha256-stable-json"`。
- 发布包新增 `packageDigest`，按稳定 JSON 计算 SHA-256。
- 远端返回包如果声明了 `packageDigest`，会重新计算并比对；不匹配时返回“摘要校验失败”并不使用该分享包。
- 无摘要的旧版分享包仍可读取。
- `shareService` 新增最近包摘要持久化路径，远端检查和发布都会保留 `lastPackageDigest`。
- 发布失败历史会记录当前 PUT 分享包摘要，方便排查失败恢复。
- 分享 mock server 会校验传入包摘要，并在服务端改写接受包或撤销改写最近包后重新签摘要。
- E2E 断言远端分享 PUT body、远端接受包、localStorage 和失败历史都包含或保留摘要字段。

真实化说明：

- 数据来源：当前本机分享记录、作品分享 HTML、远端 API 返回包和回执。
- 写入状态：摘要通过后才写入本机 `shareService.lastPackageDigest` 与最近远端状态。
- 成功反馈：远端分享状态显示 Workspace、publicUrl、回执校验和摘要短码。
- 失败反馈：篡改包会显示声明摘要与实际摘要短码，并阻止使用远端包。
- 刷新后复现方式：`mr-calligraphy-learning-state-v1.shareService.lastPackageDigest` 和 `remoteFailureHistory[*].packageDigest` 会保留最近成功或失败的分享包摘要。

仍待补：

- 摘要只能证明包内容没有在导出后被改动，不能证明账号身份、公开 URL 权限、CDN 可信、班级作品墙权限或服务端不可篡改审计。

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

本次把前端控件状态清单从“有真实/导出/本机发布状态标签”推进到“真实状态控件必须能追踪到处理器”。这直接针对用户反馈的“很多按钮像假的”：以后新增静态按钮如果只写了 `data-feature-state="real-local"`，但没有实际 `click`、`submit`、批量 selector 或初始化绑定，smoke 会失败。

完成内容：

- `scripts/control-inventory.js` 对四个入口页面新增 `handled` 和 `missingHandler` 统计。
- 前台页面同时扫描 `practice-canvas.js` 和 `script.js`；主后台同时扫描 `project-archive.js` 和 `main-admin-scene.js`；写实页面扫描 `realistic-scene.js`。
- `real`、`real-local`、`real-export`、`real-published-local` 控件必须有可追踪处理。
- 支持变量绑定、`els.xxx` 绑定、直接 DOM 绑定、批量 `data-*` selector 绑定、表单 submit 绑定和练习画布初始化参数绑定。
- 导航链接保留按 `href` 验收，避免把真实跳转误判为缺少 JS 处理。
- 当前清单通过：前台 103 个真实控件、主后台 53 个真实控件、写实演示 3 个真实控件、写实后台 34 个真实控件均 `missingHandler 0`。

真实化说明：

- 数据来源：HTML 控件、页面实际加载脚本和静态可追踪的本机处理器。
- 成功反馈：控件清单输出每页 handled 数量。
- 失败反馈：缺少处理器会指出页面、行号和控件标签。
- 刷新后复现方式：`scripts/smoke-test.js` 已运行 `node scripts/control-inventory.js --check`，后续提交自动覆盖。

仍待补：

- 静态处理器覆盖只能证明按钮接入了处理路径，不证明每条路径都完成真实业务；具体行为仍需要 Playwright 和状态层脚本持续补全。

验收：

- `node --check scripts/control-inventory.js`
- `node scripts/control-inventory.js --check`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增静态控件处理器覆盖验收`

## 125. 2026-06-13 新增动态控件处理器覆盖验收

本次把前端控件清单继续推进到运行时按钮层。静态 HTML 已能证明真实控件有处理器，但前台、后台和写实场景还有大量通过 JS 动态生成的操作按钮；如果这些按钮缺少状态或处理路径，用户看到的就是“像真的但点不动”的界面。

完成内容：

- 前台视频导出失败任务的“重试”按钮补充 `data-feature-state="real-local"`，和现有 `handleVideoExportAction()` 委托处理对应。
- 报告能力结构行补充 `data-feature-state="real-local"`，和 `data-report-metric` 点击切换对应。
- AI 讲解步骤按钮补充 `data-feature-state="disabled"`，明确它是只读播放进度，而不是漏接点击逻辑。
- `scripts/control-inventory.js` 新增运行时按钮扫描，覆盖 `script.js`、`main-admin-scene.js`、`realistic-scene.js` 和 `project-archive.js`。
- 运行时扫描会解析 `document.createElement("button")`，要求按钮写入有效状态。
- 真实状态运行时按钮必须能追踪到直接点击处理器，或能追踪到父容器 `data-*` 委托处理器。
- 委托处理器支持现代可选链写法，例如 `event.target?.closest?.("[data-video-export-retry]")`。
- 输出新增 `buttons`、`dynamicState`、`missing`、`handled` 和 `missingHandler`，便于长期开发时快速定位问题。
- 当前通过结果：`script.js` 动态按钮 34 个、`main-admin-scene.js` 动态按钮 8 个、`realistic-scene.js` 动态按钮 4 个、`project-archive.js` 动态按钮 0 个，全部 `missingHandler 0`。

真实化说明：

- 数据来源：运行时按钮创建代码、状态标记、直接事件绑定和 `data-*` 委托选择器。
- 写入状态：真实按钮明确标为 `real-local` / `real-export`；只读进度按钮明确标为 `disabled`。
- 成功反馈：控件清单输出动态按钮总数、已处理数量和缺失处理器数量。
- 失败反馈：后续新增动态按钮缺状态或缺处理器会直接让 `--check` 失败。

仍待补：

- 该门禁覆盖“按钮是否接入处理路径”，不替代真实点击流；仍要继续补 Playwright 对具体下载、同步、导入、发布和失败恢复路径的断言。

验收：

- `node --check scripts/control-inventory.js`
- `node scripts/control-inventory.js --check`
- `node --check scripts/smoke-test.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

提交：

- 中文 commit message：`新增动态控件处理器覆盖验收`

## 126. 2026-06-13 新增学习动作审计面板

本次把前台学习动作从“点击后显示反馈”推进到“点击后可回看、可导出证据”。学习路径动作已经写入本机 `events` 队列，但用户界面此前没有直接展示这条证据链，容易误以为按钮只是临时提示。

完成内容：

- 状态层新增 `getLearningEventAudit()`，按最近动作生成 `mr-calligraphy-learning-event-audit-v1` 审计包。
- 审计包包含事件总数、导出数量、类型统计、事件 ID、事件类型、时间、边界说明和 64 位 `auditDigest`。
- 状态层新增 `getLearningEventAuditExport()` 和 `downloadLearningEventAudit()`，可下载离线 HTML 审计页。
- 前台 `action-zone` 新增“本机动作审计”面板，展示最近 5 条动作。
- 新增 `learningActionAuditExport` 按钮，存在本机事件时才启用。
- 面板会在学习状态刷新、模式切换、任务切换和动作执行后自动更新。
- Smoke 页面标记检查新增审计面板和导出按钮。
- Node 状态层脚本验证审计包和 HTML 导出；Playwright 验证用户点击动作后列表和下载都真实可用。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.events`。
- 写入状态：沿用已有 `addEvent()`，动作包括学习模式、任务、讲解、练习、阶段、笔画、作品、报告、计划和远端分享。
- 成功反馈：面板显示“最近 N / 总数”以及动作标题、类型、时间和事件 ID。
- 失败反馈：无事件时导出按钮禁用，不生成空壳成功反馈。

仍待补：

- 该审计是浏览器本机队列，不是服务端账号日志、多人课堂审计、不可篡改审计链或跨设备同步日志。

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

本次把学习档案批量操作从“最近一次回执提示”推进到“可回看、可导出的本机审计”。用户在学习档案里批量导出、批量删除、恢复回收站、永久删除或清空回收站后，页面会保留最近回执，并可下载 HTML 审计页留档。

完成内容：

- 新增 `HISTORY_BATCH_RECEIPT_AUDIT_KIND = "mr-calligraphy-history-batch-receipt-audit-v1"` 和本机审计边界说明。
- `MRAppState.getHistoryBatchReceiptAudit({ limit })` 会读取 `historyBatchReceipts`，生成动作统计、最近回执列表和 `auditDigest`。
- `MRAppState.getHistoryBatchReceiptAuditExport()` 会生成可离线打开的批量回执 HTML。
- `MRAppState.downloadHistoryBatchReceiptAudit()` 会下载 `mr-calligraphy-history-batch-receipts-*.html`。
- 前台 `historyBatchReceipt` 区域新增标题、时间、最近回执列表和“导出回执”按钮。
- `renderHistoryBatchReceipt()` 会显示最近一次回执详情，并列出更早的最近 5 条回执。
- Smoke 首页标记检查新增批量回执审计节点。
- `learning-state-check.js` 验证删除、恢复、再次删除、清空回收站后的审计包、动作统计、边界、摘要和 HTML。
- Playwright 前台真实练习用例验证批量导出、删除、恢复后下载回执 HTML，并确认 HTML 包含删除、恢复和审计摘要。

真实化说明：

- 数据来源：`mr-calligraphy-learning-state-v1.historyBatchReceipts`。
- 写入状态：继续使用现有 `appendHistoryBatchReceipt()`，不复制、不伪造额外回执。
- 成功反馈：页面显示回执标题、时间、总数、练习/作品/报告/阶段数量、文件名或回收站 ID。
- 失败反馈：无批量回执时回执区隐藏，导出按钮不可用，不下载空审计。
- 刷新后复现方式：回执随学习状态写入 localStorage，刷新后可继续查看和导出。

仍待补：

- 该审计是浏览器本机回执，不是服务端账号日志、多人课堂审计、不可篡改审计链或跨设备同步日志。

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
