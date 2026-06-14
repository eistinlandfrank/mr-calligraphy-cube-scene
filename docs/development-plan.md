# MR / AR 书法交互系统软件开发计划书

> 版本：v2.0  
> 项目性质：单体式 MR / AR / 屏幕通用书法交互应用  
> 核心修正：本项目不再做多终端系统、不再做护工端、不再做设备通信、不再做养老院管理后台、不再做健康报告系统。  
> 最终目标：做一个可以在普通屏幕、MR/AR 设备或 WebXR 环境中运行的书法交互系统，并提供一个后台控制台用于摆放、编辑和保存 3D 物件。

---

## 1. 项目重新定位

本项目从原来的“复杂 B 端康养舱系统”收缩为一个更清晰、更容易落地的软件项目：

# MR / AR 书法交互系统

系统只保留两个核心部分：

1. **前台显示端 Front Stage**  
   用于展示和体验书法交互场景。它可以运行在普通浏览器屏幕中，也可以在支持 WebXR 的 MR / AR 设备中进入沉浸或空间模式。

2. **后台控制台 Scene Console**  
   用于摆放和编辑 3D 物件，包括书桌、椅子、毛笔、宣纸、屏幕、灯光、装饰物、文字面板、热点等。后台修改后的场景配置可以保存，并被前台读取。

项目不再围绕“1-10 阶段展示页”开发，也不再围绕多角色、多设备、多端控制开发。所有功能都服务于一个目标：

```text
搭建一个可交互的 3D / MR 书法空间，并允许通过后台控制台编辑这个空间。
```

---

## 2. 必须砍掉的功能

为避免项目继续发散，以下功能全部移出当前开发范围：

- 护工端。
- 老人档案。
- 养老院管理后台。
- 多设备联动。
- 舱门控制。
- 通风控制。
- 紧急按钮真实接口。
- 健康数据。
- 心率、呼吸、专注度等模拟数据。
- 复杂 Session 状态机。
- 报告系统。
- 清洁复位流程。
- 课程排期。
- 多用户账号系统。
- 真实硬件接口。
- 医疗或康养数据记录。

旧版 1-10 步骤展示可以保留为 legacy demo，但不再作为主线继续开发。

---

## 3. 当前项目目标

### 3.1 前台显示端目标

前台需要做到：

- 能加载一个 3D 书法空间。
- 能在屏幕上拖拽、缩放、观察场景。
- 能显示书法主题内容，例如“永”字、笔画路径、毛笔、宣纸、书桌、背景屏。
- 能响应基本交互，例如点击热点、切换视角、触发笔画动画、显示或隐藏 UI 面板。
- 能读取后台保存的场景配置。
- 能在支持 WebXR 的环境中进入 MR / AR / VR 模式。
- 在不支持 WebXR 的普通浏览器中也能正常使用。

### 3.2 后台控制台目标

后台需要做到：

- 显示同一个 3D 场景。
- 列出场景中的所有物件。
- 选中物件后编辑位置、旋转、缩放。
- 编辑物件的颜色、透明度、材质参数。
- 添加基础 3D 物件。
- 删除物件。
- 复制物件。
- 编辑灯光。
- 编辑相机视角。
- 编辑热点。
- 保存场景配置。
- 导入 / 导出 JSON。
- 一键切换到前台预览。

---

## 4. 软件形态

本项目采用**单应用、双模式**结构，而不是多终端系统。

```text
MR / AR 书法交互系统
├── Front Stage     前台显示模式
└── Scene Console   后台编辑模式
```

建议使用路由区分：

```text
/               前台显示端
/editor         后台控制台
/preview        只读预览模式
```

也可以保留旧版入口：

```text
/legacy         旧版 1-10 展示原型
```

---

## 5. 核心使用流程

### 5.1 体验者流程

```text
打开前台页面
  ↓
进入 3D 书法空间
  ↓
观察书法场景
  ↓
点击书法热点或按钮
  ↓
观看笔画动画 / 场景变化 / UI 提示
  ↓
切换视角或进入 MR / AR 模式
```

### 5.2 编辑者流程

```text
打开后台控制台
  ↓
加载当前场景
  ↓
选择一个 3D 物件
  ↓
调整位置、旋转、缩放、材质
  ↓
添加或删除物件
  ↓
保存场景配置
  ↓
回到前台预览
```

---

## 6. 技术路线

### 6.1 推荐技术栈

| 模块 | 技术 |
|---|---|
| 项目构建 | Vite |
| UI 框架 | React + TypeScript |
| 3D 渲染 | Three.js / @react-three/fiber |
| 3D 控制 | OrbitControls / TransformControls |
| 状态管理 | Zustand |
| 本地存储 | localStorage / IndexedDB |
| 配置格式 | JSON |
| MR / AR 支持 | WebXR |
| 导入导出 | Blob / File API |

### 6.2 为什么不需要复杂后端

当前目标是一个可交互的 MR / AR 书法空间和一个场景编辑控制台，不需要账号系统、多设备同步、机构管理或长期数据分析。因此第一阶段不需要后端服务。

如果后续需要多人协作或云端保存，再单独扩展后端。

---

## 7. 系统架构

```text
┌────────────────────────────────────────────┐
│                  App Shell                 │
│       路由 / 主题 / 全局状态 / 错误处理       │
└───────────────────┬────────────────────────┘
                    │
       ┌────────────┴────────────┐
       │                         │
┌──────▼──────┐           ┌──────▼──────┐
│ Front Stage │           │Scene Console│
│ 前台显示端   │           │ 后台控制台   │
└──────┬──────┘           └──────┬──────┘
       │                         │
       └────────────┬────────────┘
                    │
┌───────────────────▼────────────────────────┐
│                Scene Core                  │
│ SceneRenderer / ObjectFactory / Controls   │
└───────────────────┬────────────────────────┘
                    │
┌───────────────────▼────────────────────────┐
│               Scene Config                 │
│        JSON / localStorage / IndexedDB     │
└────────────────────────────────────────────┘
```

---

## 8. 前台显示端功能设计

### 8.1 3D 场景展示

前台应渲染完整书法空间，包含：

- 胶囊舱或书法空间外壳。
- 黑色展示屏。
- 棕色沙发椅。
- 书桌或书写平台。
- 宣纸。
- 毛笔。
- 砚台。
- 水杯槽。
- 灯光。
- 文字面板。
- 书法动画面板。

### 8.2 交互内容

第一阶段前台只保留必要交互：

- 视角拖拽。
- 缩放。
- 点击热点。
- 切换相机预设。
- 播放 / 暂停书法笔画动画。
- 显示 / 隐藏 UI 面板。
- 进入 / 退出 WebXR 模式。

### 8.3 书法动画

书法动画优先实现为可控动画，而不是复杂评分系统：

- “永”字笔画路径。
- 毛笔沿路径移动。
- 墨迹逐渐显现。
- 可播放、暂停、重播。

---

## 9. 后台控制台功能设计

### 9.1 页面布局

```text
┌────────────────────────────────────────────┐
│ 顶部工具栏：保存 / 导入 / 导出 / 预览 / 重置 │
├──────────────┬───────────────┬─────────────┤
│ 对象列表      │ 3D 编辑视窗     │ 属性面板     │
├──────────────┴───────────────┴─────────────┤
│ 底部：相机预设 / 热点列表 / 动画控制          │
└────────────────────────────────────────────┘
```

### 9.2 对象列表

对象列表显示场景内所有物件：

- screen
- chair
- desk
- paper
- brush
- cup-holder
- vent
- emergency-button
- light-strip
- text-panel
- hotspot
- decoration

### 9.3 属性面板

选中物件后可以编辑：

- 名称。
- 类型。
- 显示 / 隐藏。
- 锁定 / 解锁。
- position x / y / z。
- rotation x / y / z。
- scale x / y / z。
- color。
- opacity。
- roughness。
- metalness。
- emissive。
- texture。

### 9.4 物件操作

后台需要支持：

- 添加基础几何体。
- 添加 3D 模型引用。
- 删除物件。
- 复制物件。
- 重命名物件。
- 聚焦物件。
- 隐藏物件。
- 锁定物件。

### 9.5 保存与导出

后台保存规则：

- 保存到本机：写入 localStorage / IndexedDB。
- 导出 JSON：生成 `.json` 文件。
- 导入 JSON：读取并恢复场景。
- 恢复默认：加载默认场景配置。

---

## 10. 场景配置数据结构

### 10.1 SceneConfig

```json
{
  "id": "calligraphy-space-001",
  "name": "MR书法交互空间",
  "version": "1.0.0",
  "camera": {
    "position": [0, 1.5, 5],
    "target": [0, 1, 0],
    "fov": 50
  },
  "environment": {
    "background": "#f4efe7",
    "ambientLight": "#ffffff"
  },
  "objects": [],
  "hotspots": [],
  "animations": []
}
```

### 10.2 SceneObject

```json
{
  "id": "chair-001",
  "name": "棕色沙发椅",
  "type": "model",
  "src": "assets/models/chair.glb",
  "visible": true,
  "locked": false,
  "position": [0, 0, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "material": {
    "color": "#9b6338",
    "opacity": 1,
    "roughness": 0.6,
    "metalness": 0
  }
}
```

### 10.3 Hotspot

```json
{
  "id": "screen-hotspot",
  "name": "展示屏热点",
  "position": [0, 1.4, -2.5],
  "label": "播放书法动画",
  "action": {
    "type": "playAnimation",
    "target": "yong-stroke-animation"
  }
}
```

### 10.4 AnimationConfig

```json
{
  "id": "yong-stroke-animation",
  "name": "永字笔画动画",
  "type": "strokePath",
  "character": "永",
  "loop": false,
  "duration": 6000,
  "strokes": []
}
```

---

## 11. WebXR / MR / AR 支持

第一阶段必须保证普通屏幕可用。WebXR 是增强模式，不影响桌面运行。

### 11.1 屏幕模式

- OrbitControls。
- 鼠标点击热点。
- 键盘切换视角。
- 后台 TransformControls 编辑。

### 11.2 MR / AR 模式

- 检测浏览器是否支持 WebXR。
- 支持进入 XR 模式。
- 使用控制器射线选择热点。
- 使用凝视或准星触发简单按钮。
- 不支持 WebXR 时显示降级提示。

---

## 12. 开发阶段

### S0：旧版整理

目标：把旧 1-10 展示项目标记为 legacy，停止作为主线开发。

### S1：建立单应用工程

目标：建立 Vite + React + TypeScript 项目结构，包含前台和后台两个路由。

### S2：建立 Scene Core

目标：实现可被前台和后台复用的 3D 场景渲染核心。

### S3：实现前台显示端

目标：前台能读取配置并展示 3D 书法空间，支持热点和书法动画。

### S4：实现后台控制台

目标：后台能摆放、编辑、保存 3D 物件。

### S5：配置导入导出

目标：完成 JSON 导入、导出、恢复默认和本地保存。

### S6：WebXR 增强

目标：在支持设备上进入 MR / AR 模式。

### S7：优化与稳定

目标：优化 UI、性能、模型加载、错误提示和发布流程。

---

## 13. MVP 标准

第一版 MVP 必须满足：

- 普通屏幕可打开前台。
- 前台能显示 3D 书法空间。
- 前台能点击热点。
- 前台能播放“永”字书法动画。
- 后台能打开同一个场景。
- 后台能选中物件。
- 后台能移动、旋转、缩放物件。
- 后台能修改物件颜色和透明度。
- 后台能添加和删除物件。
- 后台能保存配置。
- 前台能读取后台保存后的配置。
- 能导入 / 导出 JSON。
- WebXR 不支持时系统仍可使用。

不需要：

- 用户档案。
- 护工监护。
- 健康报告。
- 设备通信。
- 舱门接口。
- 通风接口。
- 多人系统。
- 复杂后台管理。

---

## 14. 长期开发管理

执行清单放在：

```text
docs/implementation-checklist.md
```

清单应改为 S0-S7，不再使用 R0-R9 真实设备系统路线。

执行规则：

1. 每个任务有唯一编号。
2. 完成后将 `- [ ]` 改成 `- [x]`。
3. 部分完成不得勾选。
4. 不再新增护工端、设备端、健康数据相关任务。
5. 所有任务围绕前台显示和后台 3D 编辑控制台推进。

---

## 15. 结论

项目应收束为一个清晰的软件产品：

```text
MR / AR / 屏幕通用书法交互前台
+
可摆放 3D 物件的后台控制台
```

这是当前最合理、最可执行的开发方向。它保留了项目最核心的价值：

- 书法交互。
- 3D / MR 空间展示。
- 后台可编辑。
- 可在普通屏幕和 MR / AR 环境中运行。

其它复杂 B 端设备、护工、养老院管理、健康报告、舱门设备接口全部移出当前版本。

---

## 16. 开发记录

### 2026-06-14：完成 S0 旧版整理

本轮按远端最新 v2.0 计划完成 S0 阶段的主线收束：

- 确认 legacy 旧版 `index.html` 可通过本地服务器访问，`http://localhost:41496/` 返回 `HTTP/1.0 200 OK`。
- 确认 legacy 主场景管理页 `main-admin.html` 可通过本地服务器访问，`http://localhost:41496/main-admin.html` 返回 `HTTP/1.0 200 OK`。
- README 顶部已明确旧版 10 步学习路径和旧报告/审计界面属于 legacy demo。
- 后续新增功能以 Front Stage 和 Scene Console 为主线，不再围绕固定 1-10 步骤页面、护工端、设备通信、健康报告、养老院管理后台或旧报告系统继续扩展。
- `docs/implementation-checklist.md` 已勾选 S0-01 到 S0-05，并保留本轮验收记录。

验收命令：

- `curl -I --max-time 5 http://localhost:41496/`
- `curl -I --max-time 5 http://localhost:41496/main-admin.html`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`

### 2026-06-14：建立 S1 Vite / React / TypeScript 单应用骨架

本轮按 v2.0 计划推进 S1 单应用工程骨架，完成 S1-01 到 S1-08：

- 新增 Vite 6 + React 18 + TypeScript 工程入口，开发脚本为 `npm run dev`，生产构建脚本为 `npm run build`。
- 新增 `vite.config.mts`、`tsconfig.json` 和 `app/` 应用目录。
- `/` 渲染 Front Stage 前台入口，显示默认 MR 书法空间概览。
- `/editor` 渲染 Scene Console 后台三栏骨架，包含对象列表、编辑视窗和属性面板。
- `/preview` 渲染只读预览页面。
- 新增 `app/src/scene-config.ts`，定义 SceneConfig、SceneObject、Hotspot 和 AnimationConfig 类型，并通过 `localStorage` 建立前后台共享状态。
- 后台编辑对象名称、可见性、颜色和透明度会写入同一份 SceneConfig，前台和预览会同步读取。
- 新增 `tests/e2e/vite-app.spec.js`，验证三个路由和共享 SceneConfig 读写链路。

边界：

- 本轮还没有把 legacy 旧版并入 Vite `/legacy` 路由，因此 `S1-09` 暂不勾选。
- 本轮只建立应用骨架和状态互通，还没有完成 Three.js SceneRenderer、ObjectFactory、TransformControls 或 WebXR。

验收命令：

- `npm run build`
- `env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY -u all_proxy npm audit --audit-level=high`
- `PLAYWRIGHT_BASE_URL=http://localhost:5173/ npx playwright test tests/e2e/vite-app.spec.js`
- `node scripts/smoke-test.js --base-url=http://localhost:41496/`
- `git diff --check`
