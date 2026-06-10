# Smoke Test

本项目是静态网页项目。基础 smoke test 使用无依赖 Node 脚本完成三类检查；浏览器级真实交互使用 Playwright 覆盖高风险闭环。

- 静态语法检查：覆盖 smoke test、控件清单、前台状态层、书写画布、项目 schema、项目档案、房间配置、前台主脚本、主后台 3D 脚本、写实场景脚本。
- 控件状态清单：确认四个入口 HTML 里的按钮和导航链接都带有 `data-feature-state`，且状态值有效。
- 页面可访问检查：覆盖 `/`、`/main-admin.html`、`/realistic-demo.html`、`/realistic-admin.html`，并确认页面包含关键 DOM / script 标记。

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
- 主后台新增基础物体后点击“发布到前台”，确认草稿、发布快照和前台读取来源都是真实本机状态。

如果项目已经由本地服务器启动，也可以复用当前地址：

```bash
PLAYWRIGHT_BASE_URL=http://localhost:41496/ npm run test:e2e
```

## 通过标准

命令应输出：

```text
Smoke test 通过：11 个脚本，4 个页面。
```

如果任一脚本语法失败、页面无法访问、HTTP 状态不是 2xx，或页面缺少关键标记，命令会以非 0 状态退出。

## 当前边界

- 轻量 smoke test 不会打开真实浏览器，也不会验证 WebGL 是否完成渲染。
- Playwright 已覆盖首批真实交互闭环，但还没有覆盖所有下载、导入模型、回收站和移动端视口。
- 当前 Codex 环境访问 npm registry 会返回 `407 Proxy Authentication Required`，因此本机尚未生成 `package-lock.json`，需要在具备 npm 代理认证的环境里执行 `npm install` 后运行 E2E。
