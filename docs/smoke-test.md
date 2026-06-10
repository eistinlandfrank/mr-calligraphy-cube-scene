# Smoke Test

本项目是静态网页项目，第一版 smoke test 使用无依赖 Node 脚本完成两类检查：

- 静态语法检查：覆盖前台状态层、书写画布、项目档案、房间配置、前台主脚本、主后台 3D 脚本、写实场景脚本。
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

## 通过标准

命令应输出：

```text
Smoke test 通过：7 个脚本，4 个页面。
```

如果任一脚本语法失败、页面无法访问、HTTP 状态不是 2xx，或页面缺少关键标记，命令会以非 0 状态退出。

## 当前边界

- 这是轻量 smoke test，不会打开真实浏览器，也不会验证 WebGL 是否完成渲染。
- 交互级验收仍需人工执行开发文档中的具体步骤。
- 后续如引入 Playwright，应优先补主场景不白屏、后台编辑保存、前台保存作品和导出报告的浏览器级测试。
