# Smoke Test

本项目是静态网页项目。基础 smoke test 使用无依赖 Node 脚本完成语法、控件、项目档案、项目 Schema 和页面可访问检查；浏览器级真实交互使用 Playwright 覆盖高风险闭环。

- 静态语法检查：覆盖 smoke test、控件清单、项目档案迁移检查、项目档案资产哈希检查、项目 Schema 检查、学习状态检查、Playwright 测试源码、前台状态层、书写画布、项目 schema、项目档案、房间配置、前台主脚本、主后台 3D 脚本、写实场景脚本。
- 控件状态清单：确认四个入口 HTML 里的按钮和导航链接都带有 `data-feature-state`，且状态值有效。
- 项目档案迁移检查：模拟旧档案缺少新增 storage / IndexedDB 项时，确认迁移记录会写入 `projectSchema.migrations`，缺项默认不恢复，避免误清当前本机状态，并验证 localStorage JSON 导入预览会显示字段级差异、字段恢复影响提示、字段 JSON 片段且支持深层字段选择性恢复；同时验证 IndexedDB 模型仓库会显示单模型新增/修改差异、当前/档案元数据片段、完整模型 JSON 安全预览、命名冲突提示，并支持只恢复勾选模型、冲突自动改名、替换本机同名模型和自定义档案模型名称。
- 项目档案资产哈希检查：模拟带模型二进制的档案，确认 SHA-256 会写入资产清单，错误哈希会阻止恢复且不会提前覆盖本机状态。
- 项目 Schema 检查：模拟主后台和写实后台发布版本列表及导入模型，确认 `projectSchema` 会统计发布版本、发布说明、回滚动作和资产哈希。
- 学习状态检查：模拟同字两幅作品，确认 `MRAppState.getArtworkComparison()` 会生成前后作品、评分差、笔画差、采样差、截图和维度差，并验证作品集搜索、标签筛选、标签编辑、localStorage 持久化和作品分享页 HTML 生成。
- 页面可访问检查：覆盖 `/`、`/main-admin.html`、`/realistic-demo.html`、`/realistic-admin.html`，并确认页面包含关键 DOM / script 标记，包括报告对比、多报告趋势、字段多选控件和趋势悬浮提示入口。

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

该命令会列出四个入口页面中 `real-local`、`real-export`、`real-published-local`、`demo-content`、`disabled`、缺失和非法状态的数量；旧 `real` 和 `demo` 仍兼容，但新增控件应优先使用细分状态。

## 单独检查项目档案迁移

```bash
node scripts/archive-migration-check.js
```

该命令会模拟 5.16 线旧档案只包含早期 storage / IndexedDB 项的情况，验证迁移层会补齐当前项目档案结构、生成迁移说明，并把缺失的新条目设为默认不恢复；同时会构造一组本机学习状态差异，确认导入预览能展示 `sessions[0].score` 这类深层修改路径、当前/档案值摘要、覆盖影响提示和字段 JSON 片段，并验证只恢复已勾选深层字段时不会覆盖未勾选字段；还会模拟本机旧模型和档案模型变化，确认模型仓库预览能展示单模型新增/修改、当前/档案元数据片段、完整模型 JSON 安全预览、命名冲突提示和建议名称，并验证只恢复已勾选新增模型时不会覆盖未勾选旧模型，冲突模型会自动追加“档案”后缀；选择替换策略时会删除本机同名旧模型并恢复档案原名称；选择自定义名称时会按用户输入恢复档案模型名称。

## 单独检查资产哈希

```bash
node scripts/archive-asset-hash-check.js
```

该命令会模拟带模型二进制的项目档案，验证正确 SHA-256 能通过、错误 SHA-256 会阻止恢复，并确认失败时不会先写入本机状态。

## 单独检查项目 Schema

```bash
node scripts/project-schema-check.js
```

该命令会模拟主后台、写实后台本机发布版本历史和导入模型，验证 schema 摘要能统计 `mainReleases`、`realisticReleases`、当前发布说明、回滚动作和模型 SHA-256。

## 单独检查学习状态

```bash
node scripts/learning-state-check.js
```

该命令会模拟同一个字的两幅作品和关联练习，验证学习状态层能生成真实作品对比数据，包括较早作品、最新作品、评分差、笔画差、采样差、截图和维度差；同时验证 `MRAppState.getArtworkGallery()` 能按标题搜索、按默认字标签筛选，验证 `MRAppState.updateArtworkTags()` 会把自定义标签写回 localStorage，验证 `MRAppState.getArtworkSharePackage()` 会生成包含作品图、评分、边界说明和能力维度的 HTML 分享页，并验证 `MRAppState.getReportComparison()` 会基于两份本机报告生成平均分、次数和字段级能力差值，验证 `MRAppState.getReportSeries()` 会基于三份本机报告生成报告序列和字段级首末趋势。

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

- 前台在真实 canvas 书写后点击“保存作品”，确认本机学习状态写入作品和已保存练习。
- 前台点击“导出报告”，确认下载 HTML 报告、写入报告记录，并能通过 `?report=报告ID` 打开站内报告。
- 主后台新增基础物体后检查发布差异，点击“发布到前台”，确认草稿、发布快照、差异归零和前台读取来源都是真实本机状态。
- 写实后台连续发布、修改坐标、检查发布差异并回滚旧版本，确认 `mr-calligraphy-realistic-published-v1` 会记录发布版本列表和回滚动作。

如果项目已经由本地服务器启动，也可以复用当前地址：

```bash
PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e
```

## 通过标准

命令应输出：

```text
Smoke test 通过：16 个脚本，4 个页面。
```

如果任一脚本语法失败、页面无法访问、HTTP 状态不是 2xx，或页面缺少关键标记，命令会以非 0 状态退出。

## 当前边界

- 轻量 smoke test 不会打开真实浏览器，也不会验证 WebGL 是否完成渲染。
- Playwright 已覆盖首批真实交互闭环和写实发布历史源码，但当前环境缺少依赖，尚未在本机执行；测试仍未覆盖所有下载、导入模型、回收站和移动端视口。
- 当前 Codex 环境访问 npm registry 会返回 `407 Proxy Authentication Required`，因此本机尚未生成 `package-lock.json`，需要在具备 npm 代理认证的环境里执行 `npm install` 后运行 E2E。
