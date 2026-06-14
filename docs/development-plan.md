# 旧版主线恢复与 MR / VR 真实交互开发计划

> 版本：v3.0
> 日期：2026-06-14
> 当前结论：项目主线恢复为旧版静态 3D / MR 项目。Vite / React 新项目已删除，不再作为开发方向。

---

## 1. 当前项目定位

本项目继续以旧版根目录静态页面为核心开发对象：

```text
/
├── index.html              前台 MR / VR 书法交互工作台
├── main-admin.html         主场景后台控制页面
├── realistic-demo.html     写实 3D 样张页面
├── realistic-admin.html    写实场景后台控制页面
├── script.js               前台 3D 场景与交互工作流
├── app-state.js            本机学习、作品、报告、计划状态
├── main-admin-scene.js     主后台 3D 场景控制
├── realistic-scene.js      写实场景控制
└── room-config.js          旧版房间贴图与角色配置
```

当前不再维护以下新项目入口：

```text
app/
vite.config.mts
tsconfig.json
tests/e2e/vite-app.spec.js
```

它们已经从仓库删除。后续不要再围绕 Vite 5173、`/editor`、`/preview` 或 React 单应用继续开发。

---

## 2. 产品目标

目标不是重新做一个平面后台，也不是保留演示用步骤页，而是在旧版布局上做真实可用的 MR / VR 书法交互：

```text
保持旧版场景布局一致
  ↓
把演示步骤改成真实交互工作流
  ↓
保留并增强旧版主后台
  ↓
让普通浏览器也具备 AR / VR 的空间感
  ↓
逐步接入可验证的真实能力
```

当前项目必须满足：

- 前台仍然打开 `index.html`。
- 后台控制页面仍然是 `main-admin.html`。
- 旧版 3D 房间布局、物件位置和视觉结构不能被新平面页面替换。
- 可见 UI 不再使用演示用数字步骤作为主导航。
- 所有按钮应尽量连接真实状态、真实画布、真实导出、真实本机记录或明确的 Adapter 边界。
- 任何暂不可用能力都必须标注边界，不能伪装成线上生产功能。

---

## 3. 技术路线

| 模块 | 当前方案 |
|---|---|
| 项目形态 | 纯静态 HTML / CSS / JavaScript |
| 本地服务 | `python3 -m http.server 41496 --bind 0.0.0.0` |
| 3D 渲染 | Three.js + 旧版 WebGL 立方体房间 |
| 场景配置 | `room-config.js` + localStorage |
| 本机状态 | `app-state.js` |
| 写字画布 | `practice-canvas.js` |
| 后台控制 | `main-admin.html` / `main-admin-scene.js` |
| 写实样张 | `realistic-demo.html` / `realistic-admin.html` |
| 验收 | `scripts/smoke-test.js` + Playwright `real-flows.spec.js` |

---

## 4. 主入口与访问地址

本机启动：

```bash
npm install
npm run dev
```

访问：

```text
http://localhost:41496/
http://localhost:41496/main-admin.html
```

局域网访问：

```text
http://192.168.193.233:41496/
http://192.168.193.233:41496/main-admin.html
```

如果浏览器提示拒绝访问，优先确认：

- 服务是否运行在 `0.0.0.0:41496`。
- 访问的是否是 `41496`，不是已删除新项目的 `5173`。
- 防火墙或虚拟网络是否允许局域网访问该端口。

---

## 5. 旧版布局约束

旧版布局是当前产品基础，后续改动必须沿用：

- 六面立方体房间。
- 前墙展示区域。
- 主写字桌、宣纸、毛笔、砚台。
- 左右书架、窗户、卷轴、灯光、装饰物。
- 三维角色与热点。
- 左侧工作流/任务面板。
- 右侧反馈/服务边界/操作审计面板。
- 底部导航。
- 主场景后台 `main-admin.html`。

可以替换交互内容、任务名称和空间表现，但不能把页面变成与旧版无关的平面控制台。

---

## 6. 交互工作流

旧版演示数字步骤不再作为产品文案。它们的交互逻辑被映射为真实工作流：

| 路由 | 工作流 | 真实能力方向 |
|---|---|---|
| `entry` | 沉浸准备 | 加载日课字、本机任务状态、空间模式 |
| `task` | 任务确认 | 确认目标、查看完成规则 |
| `lecture` | 空间讲解 | 本机 TTS / 文本讲解 / 讲解记录 |
| `practice` | 真实临摹 | 打开书写画布并保存真实笔迹 |
| `stroke` | 笔画拆解 | 查看结构、笔顺、薄弱点 |
| `creation` | 作品生成 | 保存作品、生成证据 |
| `history` | 作品档案 | 查看历史作品和评分记录 |
| `review` | 空间复盘 | 复盘反馈、比对作品 |
| `report` | 本机报告 | 导出 HTML / PDF 报告 |
| `plan` | 巩固计划 | 生成下一轮练习计划 |

前台 URL 使用 `?flow=`：

```text
/?flow=practice
/?flow=report
```

历史 `?step=` 只保留兼容，不作为新功能文档或导航文案。

---

## 7. AR / VR 空间表现

普通浏览器阶段先完成可见、可验收的空间表现：

- **MR 交互**：完整显示旧版工作台、热点、面板和空间提示。
- **AR 锚点**：强化地面锚点、热点光圈、对象定位和空间扫描感。
- **VR 环视**：降低面板遮挡，突出沉浸环视、场景深度和空间导航。

本阶段不宣称已经接入真实 WebXR 设备。若后续接入真实 AR / VR：

- 必须检测 `navigator.xr` 能力。
- 必须提供普通浏览器降级方案。
- 必须用真实设备或浏览器能力记录验收结果。
- 必须在本文档追加设备、测试日期、失败边界和回退策略。

---

## 8. 后台控制页面

后台控制页面是：

```text
main-admin.html
```

后台后续重点：

- 保留旧版主场景对象列表。
- 继续支持物件增删改、本机保存、恢复默认。
- 继续支持材质、透明度、粗糙度、金属度、贴图清理。
- 继续保留本机审计、发布记录、远端 Adapter 配置。
- 明确标注哪些能力是本机真实，哪些只是 Adapter 或待接入。

不能用新平面页面替代旧后台。

---

## 9. 真实化原则

每个前端操作必须归入以下之一：

- 本机真实：会读写 localStorage、IndexedDB、文件导出、书写画布、报告或项目档案。
- 本机预览：只影响当前浏览器会话，但有明确状态反馈。
- 远端 Adapter：有 endpoint、token、workspace 等配置，并能产出请求/回执记录。
- 暂不可用：必须禁用或明确说明边界。

禁止：

- 只弹一个 toast 却不改变任何状态。
- 用固定假数据冒充真实报告。
- 用演示编号冒充正式学习流程。
- 用新入口替代用户要求保留的旧版项目。

---

## 10. 当前完成记录

### 2026-06-14：恢复旧版主线并删除新项目

- 删除 Vite / React 新项目文件：`app/`、`vite.config.mts`、`tsconfig.json`、`tests/e2e/vite-app.spec.js`。
- `package.json` 恢复为静态服务器脚本，`npm run dev` 启动 `0.0.0.0:41496`。
- README、开发计划和执行清单恢复为旧版项目主线。
- 前台标题改为 `MR / VR 书法交互工作台`。
- 前台导航从演示数字步骤改为交互工作流名称。
- 新增 `?flow=` 路由，保留 `?step=` 旧链接兼容。
- 新增 MR / AR / VR 空间模式面板。
- 更新冒烟测试和 Playwright 测试，验证旧版静态入口与真实工作流。
- 已归档前台截图 `/tmp/mr-calligraphy-old-workflow-front.png` 和主后台截图 `/tmp/mr-calligraphy-old-workflow-admin.png`。
- 验收通过：`npm run build`、`npm audit --audit-level=high`、`git diff --check`、`PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js`。

---

## 11. 验收命令

每次完成一个功能后运行：

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js
```

提交前还需要：

```bash
git diff --check
npm audit --audit-level=high
```

每次功能完成后，用中文提交并推送到 GitHub，同时在本文档或执行清单中追加完成记录。
