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

这一版已经不是早期纯静态 Demo。前台已有本机学习状态、书写画布、作品保存、学习档案、档案远端 API adapter、报告、PDF/HTML/WebM/JSON 导出、学习计划、计划提醒边界、远端计划 API adapter、服务端合同和本机 mock 服务；主后台和写实后台已有对象编辑、模型导入、保存历史、本机发布、回滚、项目档案、远端发布包预检、审核锁和资产清单。

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
| `index.html` | 58 | 13 | 0 | 0 | 0 | 0 |
| `main-admin.html` | 32 | 4 | 1 | 0 | 0 | 0 |
| `realistic-demo.html` | 3 | 0 | 0 | 0 | 0 | 0 |
| `realistic-admin.html` | 22 | 1 | 1 | 0 | 0 | 0 |
| `script.js dynamic` | 26 | 1 | 0 | 0 | 1 | 0 |

结论：入口 HTML 和前台动态控件已经没有明显的 `demo-content` 假按钮。现在要治理的是更深一层的真实度：标为 `real-local` 的按钮，必须清楚说明它只是本机真实，不是云端真实。

## 4. 当前不够完善的功能

### 4.1 前台学习产品

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 学习路径 | 步骤导航、热点路由、阶段记录、本机任务进度已有第一版 | 部分步骤文案和热点说明仍依赖静态配置 | 用学习任务、练习、作品、报告和计划状态推导页面内容 |
| AI 讲解 | 浏览器本机语音能朗读讲解段落 | 不是云端 AI 音频，也不是按真实笔迹实时生成 | 抽象讲解服务接口，保留本机语音 fallback，UI 明确写“本机语音” |
| 书写练习 | 鼠标/触控笔迹、撤销、清空、回放、保存和基础评分可用 | 缺压感、笔锋、笔画顺序模型、硬件适配和专业评分模型 | 增加范字路径库、笔画顺序校验、压感字段和评分服务 adapter |
| 学习计划 | 计划生成、编辑、顺延、复盘、依赖图、周期循环、本机提醒、JSON 同步包、远端 API 推送/拉取、API 合同、本机 mock 服务、自动同步队列、冲突检测和冲突解决入口已有第一版 | 还没有账号登录、托管计划仓库、远端推送提醒和教师端通知 | 做账号化 repository、服务端合并策略、跨设备提醒和教师端视图 |
| 学习档案 | 本机历史、详情路由、回收站、趋势、作品集、标签编辑、导出、远端 API 推送/拉取、API 合同和本机 mock 服务已有第一版 | 还没有账号登录、托管档案仓库、服务端分页、长期归档和教师批注 | 做账号化 history repository、服务端分页接口、云端详情 URL 和字段级合并 |

### 4.2 作品、报告和分享

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 保存作品 | 能保存笔迹、截图、评分、标签和作品对比 | 作品只在当前浏览器可见 | 增加作品 repository、公开作品集和课堂评阅入口 |
| 视频导出 | 可从真实笔迹导出 WebM 回放 | 不是 MP4/GIF，没有封面、压缩和异步队列 | 增加转码 adapter、封面图、导出队列和失败重试 |
| 报告导出 | HTML 报告、原生 PDF、报告对比、多报告趋势、字段交互和本机教师批注已有第一版 | 仍是本机报告，没有云端长期报告、账号教师端、签名验真和服务端生成 | 增加报告 schema、服务端保存、账号化教师批注、验真签名和 PDF 资源嵌入验收 |
| 分享成果 | 可导出离线 HTML 分享页 | 没有公开链接、社群分享或课堂发布 | 保持 `real-export`，后续增加公开分享服务和权限控制 |

### 4.3 主后台和写实后台

| 模块 | 当前可用 | 不完善点 | 真实化方向 |
| --- | --- | --- | --- |
| 主后台编辑 | 对象、图层、灯光、基础物体、导入模型、保存快照可用 | 保存范围主要是当前浏览器 | 抽象项目 repository，补远端保存和协作接口 |
| 写实后台编辑 | 写实对象、相机、导入模型、快照、发布到演示可用 | 和主后台对象 schema 仍未完全统一 | 统一对象 schema、字段迁移和资产引用规则 |
| 本机发布 | 主后台发布到前台，写实后台发布到演示，支持历史、差异、回滚 | 只是本机发布，不是线上部署 | UI 保持“本机发布”；线上发布必须走远端发布合同 |
| 远端发布 | 可配置 endpoint/token，生成发布包、manifest、资产清单，预检、审核锁、POST 推送、服务端回执持久化和 HTML 审计导出已有第一版 | 还不是账号权限、CDN 托管、服务端审批和不可篡改审计 | 增加生产服务端账号权限、远端审核状态、资产签名、CDN 回执和不可篡改审计日志 |
| 项目档案 | JSON 导出/导入、schema、迁移、字段恢复、模型哈希和恢复审计可用 | 三方合并、完整 JSON 树、远端资产校验仍弱 | 增加字段级 merge UI、冲突解决、远端资产完整性校验 |
| 后台权限 | 已显示“本机静态后台”风险提示 | 任何能打开页面的人都能编辑本机内容 | 后端版加入账号、角色、权限和操作审计 |

## 5. 最像“假的”的界面来源

| 问题来源 | 用户感受 | 治理方式 |
| --- | --- | --- |
| 高预期词汇 | “AI 讲解”“发布”“同步”“分享”容易被理解成云端能力 | 文案必须加边界：本机语音、本机发布、本机同步包、远端 API adapter |
| 静态叙事残留 | 部分热点像固定剧本，不像学习状态驱动 | 用真实练习、作品、报告、计划项替换静态指标 |
| 本机真实被误认为生产真实 | 按钮可点，但只写 localStorage/IndexedDB | 控件状态保留 `real-local`，并在状态区说明保存范围 |
| 远端 adapter 仍缺生产服务 | endpoint、接口文档、mock 服务和回执审计已能真实验收，但用户可能以为已经部署上线 | 下一步接账号化托管仓库、服务端合并、权限和失败反馈 |
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
- 增加账号化计划 repository 和学习档案 repository；学习档案远端 API adapter、合同和 mock 服务第一版已完成。
- 增加跨设备提醒、教师端通知和远端任务下发。
- 拉取远端数据时不得静默覆盖本机待同步修改。

### P1：把评分和报告做成可解释产物

目标：评分不再像固定模板，报告能被复盘和验证。

- 评分结果显示证据点、覆盖范围、重心、停顿、压感和维度理由。
- 原生 PDF 继续增强图表、作品截图和报告 ID。
- 报告 schema 固定版本，支持服务端保存和教师批注。
- 分享页和报告页必须带本机/云端来源说明。

### P2：补浏览器级验收

目标：避免“看起来能点，实际不能用”的回归。

- Playwright 覆盖前台书写保存、报告导出、主后台发布、写实后台回滚。
- 增加 WebGL canvas 非空像素检查。
- 增加移动端视口检查，避免后台面板和按钮重叠。
- 下载类功能检查文件名、MIME 和关键内容。

## 8. 下一批建议开发顺序

1. 给计划 repository、学习档案 repository 和远端发布 adapter 继续补生产服务端实现，明确账号权限、服务端合并、分页、资产签名和不可篡改审计字段。
2. 统一主后台和写实后台对象 schema，减少两套编辑器分叉。
3. 补 Playwright 可运行环境并扩展端到端用例。
4. 开始账号化 repository 设计，把计划、档案、作品、报告从本机状态抽象成可替换数据源。
5. 将学习计划冲突解决从计划级继续细化到计划项字段级合并。

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

- 这是本机教师批注，不是账号化教师端，也没有服务端审计、签名验真或课堂权限。
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
- 汇总当前最不完善的能力：本机真实和生产真实混淆、学习路径静态剧本残留、本机语音不等于 AI 服务、启发式评分不等于专业模型、本机教师批注不等于教师端、导出分享不等于公开链接、后台不等于账号化 CMS、远端 adapter 不等于生产后端、Playwright 覆盖不足。
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

- “保留本机”策略的浏览器级验收。
- “采用远端”策略的浏览器级验收。
- 远端失败、非法 JSON、无计划包和 token 过期等失败路径验收。
- 字段级冲突合并 UI，目前仍是计划级处理。

验收：

- `node --check tests/e2e/real-flows.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `npm run test:e2e`，在已安装 Playwright 依赖和浏览器的环境运行

提交：

- 中文 commit message：`新增计划仓库冲突浏览器验收`
