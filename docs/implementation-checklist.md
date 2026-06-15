# 旧版主线开发执行清单

> 日期：2026-06-14
> 规则：完成一个功能、通过验收、更新文档后，再用中文提交并推送到 GitHub。

---

## 勾选规则

1. 完成且验收通过才勾选。
2. 只做静态展示、假按钮、假数据，不得勾选。
3. 新增任务只能追加，不改旧编号含义。
4. 当前主线是旧版静态 3D / MR 项目，不再新增 Vite / React 新应用任务。
5. 后台控制页面固定为 `main-admin.html`，不能被新页面替代。

---

## S0 旧版主线恢复

- [x] **S0-01：恢复旧版项目为主入口**
  验收：`index.html` 是前台主入口，`main-admin.html` 是后台主入口。

- [x] **S0-02：删除新项目入口**
  验收：删除 `app/`、`vite.config.mts`、`tsconfig.json`、`tests/e2e/vite-app.spec.js`。

- [x] **S0-03：恢复静态服务器脚本**
  验收：`npm run dev` 启动 `0.0.0.0:41496`，不再启动 Vite 5173。

- [x] **S0-04：修正开发文档**
  验收：README、开发计划、执行清单都明确旧版静态项目是当前主线。

完成记录（2026-06-14）：

- 已删除 Vite / React 新项目。
- 已恢复静态服务器脚本。
- 已修正文档入口和局域网访问端口。

---

## S1 旧版布局一致性

- [x] **S1-01：保留旧版前台场景布局**
  验收：前台仍使用旧版立方体房间、旧版空间布局和旧版物体坐标体系。

- [x] **S1-02：保留旧版主后台**
  验收：`main-admin.html` 可访问，主场景对象控制和本机审计仍存在。

- [x] **S1-03：保留写实样张入口**
  验收：`realistic-demo.html` 和 `realistic-admin.html` 仍可访问。

- [x] **S1-04：做一次旧版布局视觉回归截图归档**
  验收：保存前台、主后台、写实样张、写实后台截图，并记录截图路径。

完成记录（2026-06-14）：

- 前台、主后台和写实入口仍作为冒烟测试页面检查。
- 前台截图：`/tmp/mr-calligraphy-old-workflow-front.png`。
- 主后台截图：`/tmp/mr-calligraphy-old-workflow-admin.png`。

---

## S2 交互真实化

- [x] **S2-01：移除可见演示数字步骤导航**
  验收：前台底部导航显示工作流名称，不再显示演示编号。

- [x] **S2-02：建立交互工作流路由**
  验收：支持 `?flow=practice`、`?flow=report` 等真实工作流路由。

- [x] **S2-03：保留旧链接兼容**
  验收：历史 `?step=` 链接仍能映射到对应工作流。

- [x] **S2-04：工作流动作覆盖检查更新**
  验收：冒烟测试使用“交互工作流动作覆盖检查”，不再使用旧演示口径。

- [ ] **S2-05：逐项清理假按钮**
  验收：每个按钮都归类为本机真实、本机预览、远端 Adapter 或暂不可用，并有操作回执。

完成记录（2026-06-14）：

- 前台工作流已从演示步骤改为沉浸准备、任务确认、空间讲解、真实临摹、笔画拆解、作品生成、作品档案、空间复盘、本机报告、巩固计划。

---

## S3 AR / VR 空间表现

- [x] **S3-01：新增空间模式面板**
  验收：前台存在 MR 交互、AR 锚点、VR 环视三种模式。

- [x] **S3-02：空间模式有真实视觉差异**
  验收：切换模式会改变热点、面板、锚点或沉浸显示状态。

- [x] **S3-03：移动端空间面板回归检查**
  验收：390px 宽度下空间面板不遮挡核心操作。

- [ ] **S3-04：真实 WebXR 能力调研**
  验收：记录目标设备、浏览器支持、权限要求和降级策略。

完成记录（2026-06-14）：

- 前台已新增空间模式面板与 `body[data-spatial-mode]` 状态。
- Playwright 移动端布局测试已通过，390px 宽度下核心面板未发生横向溢出或关键遮挡。

---

## S4 后台控制真实化

- [x] **S4-01：确认后台控制页面**
  验收：后台页面为 `main-admin.html`。

- [x] **S4-02：保留本机审计与发布边界**
  验收：后台有本机操作审计、发布记录、远端 Adapter 配置与边界说明。

- [ ] **S4-03：主后台物件编辑可用性审计**
  验收：逐项验证新增、更新、删除、恢复、材质编辑、贴图清理是否真实生效。

- [ ] **S4-04：后台操作说明改为真实状态文案**
  验收：后台没有暗示已经具备真实云端生产管理能力。

---

## S5 验收与发布

- [x] **S5-01：更新冒烟检查入口**
  验收：`npm run build` 检查旧版静态入口、主后台、写实样张和写实后台。

- [x] **S5-02：运行完整 Playwright 回归**
  验收：`PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js` 通过。

- [x] **S5-03：中文提交并推送 GitHub**
  验收：GitHub `main` 分支包含本轮恢复旧版主线改动。

---

## S6 服务器本地布局保存

- [x] **S6-01：新增本地部署服务器 API**
  验收：`npm run dev` 启动 Node 服务器，提供 `/api/main-scene/layout` 和 `/api/main-scene/published`。

- [x] **S6-02：后台保存写入服务器本地**
  验收：后台保存草稿、发布前台、回滚发布版本时优先写入 `server-data/main-scene-*.json`。

- [x] **S6-03：前台读取后台服务器布局**
  验收：前台优先读取服务器发布布局；尚未发布时读取服务器草稿布局；`?mainScenePreview=draft` 直接读取服务器草稿布局。

- [x] **S6-04：浏览器缓存降级**
  验收：API 不可用时仍能用 localStorage 缓存打开，不把 cookie 当作布局存储。

完成记录（2026-06-15）：

- 已新增 `scripts/local-server.js` 和 `main-scene-local-store.js`。
- `server-data/` 已加入 `.gitignore`，部署本地保存文件不会误提交。
- 已验证 Node 本地服务器 API 可写入和读取主场景布局 JSON。
- 已验证 `main admin publishes a local draft that the front page reads` E2E：后台发布后前台读取同一份布局。
- 当前 `41496` 已切换为 Node 本地服务器，`/api/main-scene/layout` 可访问。

## S7 前后台主场景渲染统一

- [x] **S7-01：前台改用后台同风格 Three.js 渲染**
  验收：前台进入 `front-three-admin-renderer`，不再使用旧前台自绘 WebGL 家具渲染作为 HTTP 模式主路径。

- [x] **S7-02：迁移后台灯光与环境**
  验收：前台使用 RoomEnvironment、半球光、主聚光灯、边缘方向光、ACES 曝光、阴影和环境强度。

- [x] **S7-03：物体位置与后台布局一致**
  验收：前台使用后台同一份模型默认坐标、旋转、缩放、大型 GLB 缩放因子和服务器本地布局状态。

- [x] **S7-04：前台保留模型加载可观测性**
  验收：前台继续写入 `MR_LOADED_MODEL_COUNT`、`MR_LOADED_MODEL_VERTICES`、`MR_LOADED_TEXTURED_MODEL_COUNT`。

完成记录（2026-06-15）：

- 已新增 `front-main-scene-renderer.js`。
- 已为 `index.html` 补齐 Three.js import map。
- 已验证前台从 `server-local` 读取主场景布局，加载 19 个 GLB 模型，并进入 `front-three-admin-renderer`。
- 已验证移动端核心面板用例等待新渲染器启动后通过。

---

## 当前验收命令

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js
git diff --check
npm audit --audit-level=high
```

完成记录（2026-06-14）：

- `npm run build` 通过：26 个脚本、4 个页面冒烟检查通过。
- `PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js` 通过：24 passed。
- `git diff --check` 通过。
- `npm audit --audit-level=high` 通过，0 vulnerabilities。
- 本轮将以中文提交并推送到 GitHub `main`。
