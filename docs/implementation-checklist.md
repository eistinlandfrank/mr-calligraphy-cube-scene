# MR / AR 书法交互系统开发执行清单

> 本清单用于长期开发管理。  
> 本项目只保留两个核心模块：**前台显示端 Front Stage** 和 **后台 3D 物件控制台 Scene Console**。  
> 完成一项并通过验收后，将 `- [ ]` 改为 `- [x]`。  
> 不再围绕 1-10 展示页、护工端、设备通信、健康报告或养老院管理后台开发。

---

## 勾选规则

1. 每个任务都有唯一编号。
2. 任务完成且通过验收后才可以勾选。
3. 部分完成不勾选，只在任务下方追加进度说明。
4. 每次提交应在 commit / PR 说明中写明完成的任务编号。
5. 如果新增任务，只能追加到对应阶段末尾，不修改旧编号含义。
6. 任何“静态图能显示”“固定假数据能展示”“只写了按钮但没有真实状态变化”的内容不得勾选为完成。
7. 任何护工端、设备端、健康数据、养老院管理系统相关任务不得加入当前清单。

---

## 总体阶段

| 阶段 | 名称 | 目标 |
|---|---|---|
| S0 | 旧版整理 | 将 1-10 展示页标记为 legacy，停止主线开发 |
| S1 | 单应用工程骨架 | 建立前台和后台两个模式 |
| S2 | Scene Core | 建立可复用的 3D 场景渲染核心 |
| S3 | 前台显示端 | 实现书法空间显示、热点、书法动画 |
| S4 | 后台 3D 控制台 | 实现物件摆放、编辑、保存 |
| S5 | 配置系统 | 实现场景配置保存、导入、导出 |
| S6 | WebXR / MR / AR 增强 | 支持 MR / AR 设备进入空间模式 |
| S7 | 稳定与发布 | 完成测试、性能优化和使用说明 |

---

# S0 旧版整理

目标：把当前 1-10 展示型项目和新的真实交互系统区分开。

- [x] **S0-01：确认旧版原型可运行**
  验收：当前旧版 `index.html` 可以通过本地服务器运行，现有内容不被破坏。

- [x] **S0-02：标记旧版为 legacy**
  验收：README 或目录结构中明确 1-10 步骤页面属于 legacy demo，不是新主线。

- [x] **S0-03：停止新增 1-10 步骤功能**
  验收：后续开发不再围绕固定 1-10 页面增加新功能。

- [x] **S0-04：确认开发计划书已收束**
  验收：`docs/development-plan.md` 明确只保留前台显示端和后台 3D 物件控制台。

- [x] **S0-05：确认执行清单已收束**
  验收：`docs/implementation-checklist.md` 使用 S0-S7 阶段，不再包含护工端、设备通信、健康报告任务。

完成记录（2026-06-14）：

- 本地服务 `http://localhost:41496/` 返回 `HTTP/1.0 200 OK`，旧版 `index.html` 可通过本地服务器访问。
- 本地服务 `http://localhost:41496/main-admin.html` 返回 `HTTP/1.0 200 OK`，旧版主场景管理页仍可访问。
- README 已明确 `index.html`、10 步学习路径、旧报告/审计界面属于 legacy demo，不再作为新主线新增功能。
- `docs/development-plan.md` 已收束为 Front Stage + Scene Console 两个核心模块。
- `docs/implementation-checklist.md` 已使用 S0-S7 阶段，并明确禁止继续加入护工端、设备通信、健康报告和养老院管理系统任务。

---

# S1 单应用工程骨架

目标：建立一个 MR / AR / 屏幕通用的单体应用，包含前台显示端和后台控制台。

- [x] **S1-01：新增 package.json**
  验收：根目录存在 `package.json`，包含 `dev`、`build`、`preview` 基础脚本。

- [x] **S1-02：引入 TypeScript**
  验收：项目可编译 TS / TSX 文件，并启用基础类型检查。

- [x] **S1-03：建立 Vite 项目入口**
  验收：可通过 `npm run dev` 启动新应用。

- [x] **S1-04：建立基础路由**
  验收：存在 `/`、`/editor`、`/preview` 三个入口。

- [x] **S1-05：建立 Front Stage 页面**
  验收：`/` 显示前台书法空间入口。

- [x] **S1-06：建立 Scene Console 页面**
  验收：`/editor` 显示后台控制台基础布局。

- [x] **S1-07：建立共享状态管理**
  验收：前台和后台可以读取同一份场景配置状态。

- [x] **S1-08：建立统一样式变量**
  验收：项目有统一的颜色、字号、按钮和面板样式变量。

- [ ] **S1-09：保留旧版入口**  
  验收：新增工程后，旧版原型仍可打开或可在 `/legacy` 访问。

完成记录（2026-06-14）：

- `package.json` 已新增 `dev`、`build`、`preview` 脚本，Vite 配置位于 `vite.config.mts`。
- 已新增 `tsconfig.json`，`npm run build` 会先执行 `tsc --noEmit` 类型检查，再执行 Vite 生产构建。
- 已新增 `app/index.html`、`app/src/main.tsx`、`app/src/App.tsx`、`app/src/scene-config.ts` 和 `app/src/styles.css`。
- Vite 开发服务器 `npm run dev` 已启动并可访问 `http://localhost:5173/`、`http://localhost:5173/editor`、`http://localhost:5173/preview`。
- `/editor` 后台控制台可修改对象名称、可见性、颜色和透明度，并写入 `mr-calligraphy-scene-config-v2`。
- `/` 前台和 `/preview` 只读预览会读取同一份 SceneConfig；Playwright 已验证后台修改对象名称后，前台和预览同步显示。
- 样式变量集中在 `app/src/styles.css` 的 `:root` 中，包含颜色、字号相关基础变量和面板/按钮风格。
- `S1-09` 暂不勾选：legacy 旧版仍可通过现有静态服务器访问，但还没有并入 Vite `/legacy` 路由。

验收命令：

- `npm run build`
- `env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY -u all_proxy npm audit --audit-level=high`
- `curl -I --max-time 5 http://localhost:5173/`
- `curl -I --max-time 5 http://localhost:5173/editor`
- `curl -I --max-time 5 http://localhost:5173/preview`
- `PLAYWRIGHT_BASE_URL=http://localhost:5173/ npx playwright test tests/e2e/vite-app.spec.js`

---

# S2 Scene Core

目标：建立前台和后台都能复用的 3D 场景渲染核心。

- [x] **S2-01：建立 SceneRenderer**
  验收：SceneRenderer 能根据 SceneConfig 渲染基础 3D 场景。

- [x] **S2-02：建立 ObjectFactory**
  验收：可以根据配置创建 box、sphere、plane、model、light、ui-panel、hotspot 等对象。

- [x] **S2-03：支持基础几何体**
  验收：能渲染 box、sphere、plane、cylinder 等基础物件。

- [ ] **S2-04：支持 GLB 模型加载**  
  验收：能通过配置加载 `.glb` 模型。

- [x] **S2-05：支持灯光对象**
  验收：能通过配置创建 ambient、directional、point、spot light。

- [x] **S2-06：支持相机配置**
  验收：相机初始位置、目标点和 FOV 可以从配置读取。

- [x] **S2-07：支持材质配置**
  验收：颜色、透明度、roughness、metalness、emissive 可从配置读取。

- [x] **S2-08：支持对象显示隐藏**
  验收：配置 `visible: false` 的对象不会显示。

- [ ] **S2-09：支持对象锁定标记**  
  验收：配置 `locked: true` 的对象在后台不可编辑或会显示锁定状态。

- [ ] **S2-10：建立错误提示**  
  验收：模型加载失败或配置错误时有明确提示，不白屏。

完成记录（2026-06-14）：

- 新增 `app/src/SceneCanvas.tsx`，使用 Three.js WebGLRenderer 渲染真实 3D 书法空间。
- SceneCanvas 会读取 SceneConfig 的 camera、environment、objects、hotspots 和 animations。
- ObjectFactory 可按配置创建 box、sphere、plane、cylinder、model、light、ui-panel 和 hotspot；其中 `model` 目前是内置几何组合模型，`S2-04` 的 GLB 加载仍未完成。
- 已支持 ambient / directional / point light、材质颜色、透明度、roughness、metalness、emissive 和对象 visible。
- Playwright 已通过 WebGL canvas 像素差异确认画布非空，不再只看 DOM 文案。

验收命令：

- `npm run build`
- `PLAYWRIGHT_BASE_URL=http://localhost:5173/ npx playwright test tests/e2e/vite-app.spec.js`

---

# S3 前台显示端 Front Stage

目标：前台可以作为真正可交互的书法空间使用，不再只是静态图。

- [x] **S3-01：前台加载默认场景**
  验收：打开 `/` 后能显示默认 3D 书法空间。

- [ ] **S3-02：前台读取保存配置**  
  验收：后台保存配置后，前台能显示保存后的场景。

- [x] **S3-03：实现视角拖拽与缩放**
  验收：用户可以拖拽旋转视角、滚轮缩放。

- [ ] **S3-04：实现相机预设切换**  
  验收：前台可切换正视、侧视、内部视角、书写视角等预设镜头。

- [x] **S3-05：实现热点显示**
  验收：场景中能显示可点击热点。

- [x] **S3-06：实现热点点击反馈**
  验收：点击热点后能显示对应内容、切换视角或触发动画。

- [ ] **S3-07：实现黑色展示屏内容区域**  
  验收：展示屏上可以显示书法动画、文字说明或水墨背景。

- [x] **S3-08：实现“永”字笔画动画**
  验收：点击播放后，“永”字笔画按顺序出现。

- [x] **S3-09：实现毛笔沿路径移动**
  验收：毛笔对象或笔尖标记能沿笔画路径移动。

- [ ] **S3-10：实现动画播放 / 暂停 / 重播**  
  验收：前台能控制书法动画播放状态。

- [ ] **S3-11：实现 UI 面板显示隐藏**  
  验收：前台可显示或隐藏说明面板。

- [ ] **S3-12：实现全屏展示模式**  
  验收：前台可进入全屏，隐藏无关开发控件。

完成记录（2026-06-14）：

- `/` 已接入真实 Three.js 3D 书法空间，不再是 CSS 平面示意图。
- OrbitControls 支持拖拽旋转和滚轮缩放。
- 场景显示展示屏、书桌、宣纸、毛笔、座椅、灯光和热点。
- 点击热点或右侧按钮会播放 / 暂停“永”字笔画动画，笔尖标记随笔画段移动。
- WebXR 支持以运行时检测方式接入；不支持 WebXR 的普通浏览器会保留屏幕 3D 模式。

验收命令：

- `PLAYWRIGHT_BASE_URL=http://localhost:5173/ npx playwright test tests/e2e/vite-app.spec.js`
- `npx playwright screenshot --viewport-size=1366,900 http://localhost:5173/ /tmp/mr-calligraphy-three-front.png`

---

# S4 后台 3D 控制台 Scene Console

目标：后台可以真实摆放和编辑 3D 物件。

- [x] **S4-01：建立后台三栏布局**
  验收：后台包含对象列表、3D 编辑视窗、属性面板。

- [x] **S4-02：建立对象列表**
  验收：对象列表显示当前场景所有物件。

- [x] **S4-03：实现对象选择**
  验收：点击对象列表或 3D 物件后，属性面板显示选中对象。

- [ ] **S4-04：实现 TransformControls**  
  验收：可以在 3D 视窗中拖拽物件移动、旋转、缩放。

- [x] **S4-05：编辑 position**
  验收：在属性面板修改 x/y/z 后，物件位置实时变化。

- [x] **S4-06：编辑 rotation**
  验收：在属性面板修改旋转值后，物件角度实时变化。

- [x] **S4-07：编辑 scale**
  验收：在属性面板修改缩放后，物件大小实时变化。

- [x] **S4-08：编辑颜色**
  验收：修改颜色后，物件材质立即更新。

- [x] **S4-09：编辑透明度**
  验收：修改 opacity 后，物件透明度立即更新。

- [ ] **S4-10：编辑 emissive 发光色**  
  验收：可给屏幕、灯带等物件设置发光色。

- [ ] **S4-11：添加基础几何体**  
  验收：可添加 box、sphere、plane、cylinder。

- [ ] **S4-12：添加模型引用**  
  验收：可添加一个 GLB 模型路径并显示在场景中。

- [ ] **S4-13：删除物件**  
  验收：删除后对象从列表和场景中消失。

- [ ] **S4-14：复制物件**  
  验收：复制后生成新 ID，属性与原物件一致。

- [ ] **S4-15：重命名物件**  
  验收：修改名称后对象列表同步更新。

- [ ] **S4-16：隐藏 / 显示物件**  
  验收：切换 visible 后场景实时更新。

- [ ] **S4-17：锁定 / 解锁物件**  
  验收：锁定对象不可被 TransformControls 编辑。

- [ ] **S4-18：编辑灯光**  
  验收：可调整灯光位置、颜色、强度。

- [ ] **S4-19：编辑相机预设**  
  验收：可保存当前视角为相机预设。

- [ ] **S4-20：编辑热点**  
  验收：可新增热点、修改热点位置、名称和触发动作。

完成记录（2026-06-14）：

- `/editor` 已从平面示意图改为真实 Three.js 3D 编辑视窗。
- 后台三栏包含对象列表、3D 编辑视窗和属性面板。
- 点击对象列表或 3D 物件可选中对象，视窗中显示 TransformControls 辅助器。
- 属性面板可真实修改 position、rotation、scale、color 和 opacity，并写入 `mr-calligraphy-scene-config-v2`。
- TransformControls 当前已支持选中对象和平移拖动；旋转 / 缩放拖拽模式按钮还未实现，因此 `S4-04` 暂不勾选。

验收命令：

- `PLAYWRIGHT_BASE_URL=http://localhost:5173/ npx playwright test tests/e2e/vite-app.spec.js`
- `npx playwright screenshot --viewport-size=1366,900 http://localhost:5173/editor /tmp/mr-calligraphy-three-editor.png`

---

# S5 配置系统

目标：让前后台通过统一 SceneConfig 打通。

- [ ] **S5-01：定义 SceneConfig 类型**  
  验收：包含 camera、environment、objects、hotspots、animations。

- [ ] **S5-02：定义 SceneObject 类型**  
  验收：包含 id、name、type、position、rotation、scale、material、visible、locked。

- [ ] **S5-03：定义 Hotspot 类型**  
  验收：包含 id、name、position、label、action。

- [ ] **S5-04：定义 AnimationConfig 类型**  
  验收：包含 id、name、type、duration、target、strokes。

- [ ] **S5-05：实现配置校验**  
  验收：缺少必要字段时显示明确错误。

- [ ] **S5-06：保存到 localStorage / IndexedDB**  
  验收：后台保存后刷新页面配置不丢失。

- [ ] **S5-07：前台读取保存配置**  
  验收：后台保存后，前台能读取最新配置。

- [ ] **S5-08：导出 JSON**  
  验收：可以下载当前场景配置 JSON 文件。

- [ ] **S5-09：导入 JSON**  
  验收：导入配置后场景恢复。

- [ ] **S5-10：恢复默认配置**  
  验收：点击恢复默认后回到初始场景。

- [ ] **S5-11：配置版本备份**  
  验收：至少能保存最近一次或多个版本的配置快照。

---

# S6 WebXR / MR / AR 增强

目标：在普通屏幕稳定后，增加 MR / AR 设备支持。

- [ ] **S6-01：检测 WebXR 支持**  
  验收：系统能判断当前浏览器是否支持 WebXR。

- [ ] **S6-02：显示 XR 进入按钮**  
  验收：支持 WebXR 时显示进入按钮，不支持时显示降级提示。

- [ ] **S6-03：进入 XR 模式**  
  验收：支持设备中可以进入 XR 会话。

- [ ] **S6-04：XR 模式下显示场景**  
  验收：进入 XR 后仍能看到 3D 书法空间。

- [ ] **S6-05：XR 控制器射线点击热点**  
  验收：控制器可以选择热点或按钮。

- [ ] **S6-06：XR 模式退出**  
  验收：可安全退出 XR 回到屏幕模式。

- [ ] **S6-07：XR 模式 UI 尺寸适配**  
  验收：空间 UI 在 XR 中可读、可点、不遮挡主体。

---

# S7 稳定与发布

目标：形成可长期维护、可展示、可继续开发的版本。

- [ ] **S7-01：建立基本测试清单**  
  验收：包含前台、后台、配置、WebXR 降级测试项。

- [ ] **S7-02：测试前台加载**  
  验收：前台打开不报错，能加载默认场景。

- [ ] **S7-03：测试后台编辑**  
  验收：位置、旋转、缩放、颜色、透明度修改均有效。

- [ ] **S7-04：测试保存与读取**  
  验收：后台保存后前台能读取。

- [ ] **S7-05：测试导入导出**  
  验收：导出后重新导入场景一致。

- [ ] **S7-06：测试旧版 legacy 不受影响**  
  验收：旧版原型仍可访问。

- [ ] **S7-07：性能优化**  
  验收：普通电脑上前台和后台操作流畅，无明显卡顿。

- [ ] **S7-08：构建生产版本**  
  验收：`npm run build` 成功。

- [ ] **S7-09：更新 README**  
  验收：README 说明项目新定位、运行方式、前台、后台、legacy 关系。

- [ ] **S7-10：发布稳定版本标签**  
  验收：创建一个可回溯的版本标签或 release 说明。

---

## 阶段完成判定

一个阶段只有在该阶段全部任务完成并通过验收后，才能标记为完成。

如果某阶段延期，不得标记为完成。
