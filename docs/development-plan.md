# 躺卧式书法康养胶囊舱系统开发计划书

> 项目方向：面向养老院 B 端场景的沉浸式书法康养胶囊舱。  
> 系统目标：前台用于演示老人进入胶囊舱后的沉浸式书法体验；后台用于编辑、保存和导出 3D 场景配置。  
> 当前计划版本：v0.1  
> 日期：2026-06-09

---

## 1. 项目定位

当前仓库已经具备一个本地 MR 书法 3D 立方体交互网页原型。下一阶段不建议直接推翻，而是将它升级为一个具有前后台结构的 3D 场景系统。

最终产品概念为：

**墨韵·心境｜躺卧式沉浸书法康养胶囊舱系统**

面向养老院、康养中心、老年大学等 B 端机构，提供一种“内部沉浸、外部守护”的书法康养体验：老人半躺在胶囊舱内，通过虚拟书法游戏、山水空间、AI 书法教练和作品复盘完成低负担体验；护工在外部通过监护端观察状态、控制流程和管理场景。

系统分为两个核心端：

1. **前台演示端 Demo / Experience**  
   面向展示、答辩、养老院体验演示。它展示完整的用户体验闭环：入舱、舱门关闭、沉浸启动、书法游戏、AI 反馈、作品生成、护工监护。

2. **后台编辑端 Admin / 3D Scene Editor**  
   面向设计者、开发者、运营人员。它可以修改胶囊舱 3D 场景，包括模型、材质、灯光、相机、UI 面板、热点、流程节点和交互脚本。

---

## 2. 当前仓库基础判断

### 2.1 当前已有能力

当前项目已经具备以下基础：

- 纯 HTML、CSS、JavaScript 的本地 WebGL 演示能力。
- 支持 10 个学习步骤、底部导航、键盘切换和热点跳转。
- 支持六面立方体空间贴图，解决普通 360 全景图清晰度不足的问题。
- 支持 `room-config.js` 配置六面贴图和角色。
- 已有“场景编辑”面板，可临时修改贴图路径、角色位置、角色名称、颜色、视角和说明。
- 已有本地保存能力，当前通过 `localStorage` 保存编辑结果。

这些能力适合作为 **MVP 的场景引擎基础**，但不适合作为最终后台编辑系统。最终应将“演示逻辑”和“编辑逻辑”拆开。

### 2.2 当前局限

| 问题 | 影响 | 下一步处理 |
|---|---|---|
| 演示端和编辑端耦合在同一个页面 | 展示时界面复杂，不像产品 | 拆分 `/demo` 和 `/admin` |
| 配置只存在 JS 文件和 localStorage | 不利于多人协作和版本管理 | 引入 JSON 配置文件和导入/导出 |
| 3D 场景对象硬编码在 `script.js` | 后台难以真正修改场景 | 抽象 Scene Schema |
| 后台编辑能力偏临时 | 无法系统管理模型、灯光、材质 | 建立 Scene Editor |
| 没有护工端逻辑 | B 端养老院场景不完整 | 增加 Caregiver Monitor |
| 仍是立方体房间概念 | 与胶囊舱产品形态不完全一致 | 升级为 Capsule Pod Scene |

---

## 3. 产品系统总目标

### 3.1 前台演示端目标

前台不是普通网页，而是一个“可播放、可交互、可讲故事”的沉浸式产品演示。

前台需要表现：

1. **外部胶囊舱产品视角**  
   展示躺卧式胶囊舱的外观、舱门、单向观察窗、护工监护屏、紧急停止按钮。

2. **老人内部体验视角**  
   老人看不到外部场景，只看到山水书法空间、虚拟书法游戏、AI 指导和放松反馈。

3. **护工外部监护视角**  
   护工可以看到老人状态、体验阶段、心率、呼吸、剩余时间和安全按钮。

4. **完整闭环**  
   入舱 → 舱门关闭 → 沉浸启动 → 书法游戏 → AI 反馈 → 作品生成 → 护工确认 → 结束开舱。

### 3.2 后台编辑端目标

后台的核心不是普通表单，而是一个可视化 3D 场景编辑器。

后台需要支持：

1. 管理多个 3D 场景。
2. 修改模型位置、旋转、缩放。
3. 修改材质颜色、透明度、金属度、粗糙度。
4. 修改灯光位置、强度、颜色。
5. 修改相机初始视角和预设镜头。
6. 修改交互热点。
7. 修改流程节点。
8. 修改护工端监护 UI 的模拟数据。
9. 保存为 JSON 配置。
10. 导出为可本地运行的演示包。

---

## 4. 推荐技术路线

### 4.1 MVP 阶段技术路线

为了保证 Codex 可以快速推进，建议第一阶段使用：

```text
Vite + React + Three.js + @react-three/fiber + Zustand
```

原因：

- `Vite`：本地开发快，适合课程和展示。
- `React`：适合拆分前台、后台、护工面板等复杂 UI。
- `Three.js`：适合 Web 端 3D 展示和胶囊舱场景。
- `@react-three/fiber`：更适合组件化组织 3D 场景。
- `Zustand`：轻量状态管理，适合场景配置和编辑状态。

### 4.2 不建议的路线

| 技术 | 不建议原因 |
|---|---|
| 继续全写原生 JS | 后台编辑器会越来越难维护 |
| C++ | 展示成本高，不适合网页演示和 Codex 快速迭代 |
| Unity | 效果强，但部署、版本控制和网页前后台联动成本更高 |
| 只用 360 图 | 场景无法被后台真正编辑 |

### 4.3 可选增强路线

第二阶段可加入：

- `Leva`：快速调参面板。
- `TransformControls`：拖拽修改模型位置、旋转、缩放。
- `GLTFLoader`：加载胶囊舱、座椅、屏幕、书法 UI 等模型。
- `Dexie / IndexedDB`：本地保存多个场景版本。
- `Node.js + Express + SQLite + Prisma`：形成真正后端存储。

---

## 5. 系统信息架构

建议最终页面结构如下：

```text
/
├── /demo
│   ├── 老人体验演示
│   ├── 胶囊舱外观展示
│   ├── 舱内沉浸书法游戏
│   └── 护工监护展示
│
├── /admin
│   ├── 场景列表
│   ├── 3D 场景编辑器
│   ├── 模型资源管理
│   ├── 材质与灯光编辑
│   ├── 交互流程编辑
│   └── 配置导入 / 导出
│
├── /preview/:sceneId
│   └── 从后台配置生成的预览页面
│
└── /docs
    └── 项目说明、开发计划、数据结构说明
```

---

## 6. 前台演示端设计

### 6.1 前台页面结构

前台建议分为 3 个视角模式：

```text
Demo Mode
├── Product View      产品外观视角
├── Elder View        老人舱内视角
└── Caregiver View    护工监护视角
```

页面上可以提供 3 个切换按钮：

- 产品视角
- 老人视角
- 护工视角

也可以通过演示流程自动切换。

### 6.2 前台核心流程

| 步骤 | 场景 | 主要内容 | 交互 |
|---|---|---|---|
| 1 | 预约与准备 | 护工选择老人和课程 | 点击“开始疗愈” |
| 2 | 入舱躺卧 | 老人进入胶囊舱，座椅调整 | 点击“确认入舱” |
| 3 | 舱门关闭 | 外部逐渐变暗，内部水墨空间启动 | 动画自动播放 |
| 4 | 沉浸导入 | 山水、呼吸、书法主题出现 | 语音/凝视确认 |
| 5 | 书法游戏 | 永字八法、笔顺跟随、虚拟毛笔 | 凝视/手势/按钮 |
| 6 | AI 反馈 | 生成结构、笔画、节奏、专注度反馈 | 查看建议 |
| 7 | 作品展厅 | 用户作品挂入虚拟展墙 | 保存作品 |
| 8 | 护工确认 | 护工端收到完成报告 | 结束体验 / 下一位 |

### 6.3 前台必须展示的产品逻辑

前台展示时必须让人一眼看懂以下逻辑：

1. **老人看不到外部**  
   舱内是全沉浸水墨空间，不出现养老院活动室或护工画面。

2. **护工可以看到老人状态**  
   外部监护端显示老人状态、体验阶段和安全数据。

3. **交互是虚拟化的**  
   老人端不再强调真实毛笔，而是虚拟毛笔、凝视确认、语音提示和轻手势。

4. **系统是康养游戏，不是医疗设备**  
   需要避免医疗诊断表达，定位为文化康养、情绪放松、认知训练辅助。

---

## 7. 后台 3D 场景编辑端设计

### 7.1 后台首页

后台首页显示：

- 场景列表
- 最近编辑时间
- 当前版本
- 缩略图
- 操作按钮：编辑、预览、复制、导出、删除

建议初始场景：

1. `capsule-product-showcase`：产品外观展示场景
2. `capsule-elder-experience`：老人舱内视角
3. `capsule-caregiver-monitor`：护工监护视角
4. `calligraphy-game-yong`：永字八法游戏
5. `ink-gallery-report`：作品展厅和报告

### 7.2 3D 编辑器布局

后台编辑器建议采用四栏结构：

```text
┌─────────────────────────────────────────────────────────────┐
│ 顶部工具栏：保存 / 预览 / 导入 / 导出 / 撤销 / 重做          │
├──────────────┬──────────────────────────────┬──────────────┤
│ 场景对象树    │ 3D 编辑视窗                    │ 属性编辑面板  │
│ Scene Tree   │ Canvas / Viewport             │ Inspector    │
├──────────────┴──────────────────────────────┴──────────────┤
│ 底部时间轴 / 流程节点 / 动画事件 Timeline                    │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 对象树 Scene Tree

对象树显示：

```text
Capsule Pod
├── Shell
├── Door
├── Reclining Chair
├── Immersive Screen
├── One-way Window
├── Ambient Light
├── Ventilation
├── Emergency Button
├── Caregiver Tablet
├── Elder UI Panels
├── Virtual Brush
└── Ink Landscape Environment
```

每个对象可执行：

- 显示 / 隐藏
- 锁定 / 解锁
- 复制
- 删除
- 聚焦镜头
- 重命名

### 7.4 属性编辑 Inspector

选中对象后，可编辑：

#### 基础属性

- 名称
- 类型
- 标签
- 是否可见
- 是否可交互

#### Transform

- Position：x, y, z
- Rotation：x, y, z
- Scale：x, y, z

#### Material

- Base Color
- Roughness
- Metalness
- Opacity
- Emissive Color
- Texture URL

#### Interaction

- Hotspot Label
- Trigger Type：click / gaze / voice / timeline
- Target Action：切换场景 / 播放动画 / 打开面板 / 修改状态

#### Caregiver Data

- 心率模拟值
- 呼吸模拟值
- 专注度模拟值
- 当前体验阶段
- 安全状态

---

## 8. 场景数据结构设计

建议将所有可编辑内容统一为 JSON。

### 8.1 SceneConfig 示例

```json
{
  "id": "capsule-elder-experience",
  "name": "老人舱内沉浸体验",
  "version": "0.1.0",
  "type": "elder-view",
  "camera": {
    "position": [0, 1.2, 4.5],
    "target": [0, 1.0, 0],
    "fov": 55
  },
  "environment": {
    "background": "assets/environments/ink-mountain.hdr",
    "ambientColor": "#f4e7d2",
    "fog": true
  },
  "objects": [
    {
      "id": "capsule-shell",
      "type": "model",
      "name": "胶囊舱外壳",
      "src": "assets/models/capsule-shell.glb",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "material": {
        "color": "#f4efe8",
        "roughness": 0.42,
        "metalness": 0.08
      }
    }
  ],
  "hotspots": [
    {
      "id": "start-calligraphy-game",
      "label": "开始书法游戏",
      "position": [0, 1.3, -2.2],
      "trigger": "gaze",
      "targetScene": "calligraphy-game-yong"
    }
  ],
  "timeline": [
    {
      "time": 0,
      "action": "fadeIn",
      "target": "ink-landscape"
    },
    {
      "time": 2.5,
      "action": "showPanel",
      "target": "breathing-guide"
    }
  ]
}
```

### 8.2 项目级配置 ProjectConfig

```json
{
  "projectName": "墨韵心境",
  "productType": "calligraphy-therapy-capsule",
  "defaultScene": "capsule-product-showcase",
  "scenes": [
    "capsule-product-showcase",
    "capsule-elder-experience",
    "capsule-caregiver-monitor",
    "calligraphy-game-yong",
    "ink-gallery-report"
  ],
  "theme": {
    "primary": "#b8895d",
    "background": "#f6efe7",
    "accent": "#d7aa72"
  }
}
```

---

## 9. 后端与存储计划

### 9.1 MVP：无服务器本地版

第一版可以不做真正后端，使用：

- JSON 文件
- localStorage
- 导入 / 导出配置
- 静态资源目录

优点：

- 实现快
- 容易在 Codex、本地浏览器、GitHub Pages 中运行
- 适合课程展示

缺点：

- 不能多人协作
- 不能真正上传保存到服务器
- 不能管理大量模型资源

### 9.2 第二阶段：轻量后端版

第二阶段可加入：

```text
Node.js + Express + SQLite + Prisma
```

建议 API：

```text
GET    /api/scenes              获取场景列表
GET    /api/scenes/:id          获取单个场景配置
POST   /api/scenes              新建场景
PUT    /api/scenes/:id          更新场景配置
DELETE /api/scenes/:id          删除场景
POST   /api/assets              上传模型/贴图资源
GET    /api/assets              获取资源列表
POST   /api/export/:sceneId     导出演示包
```

### 9.3 第三阶段：机构部署版

如要真实用于养老院 B 端，可以增加：

- 用户管理
- 老人档案
- 护工账号
- 使用记录
- 课程排期
- 设备状态
- 数据看板
- 局域网部署

注意：本项目应避免声明医疗诊断功能。健康数据只作为安全监护和体验反馈展示，不作为诊断依据。

---

## 10. 推荐代码结构

建议从当前静态结构升级为：

```text
mr-calligraphy-cube-scene/
├── docs/
│   ├── development-plan.md
│   ├── scene-schema.md
│   └── codex-tasks.md
│
├── public/
│   ├── assets/
│   │   ├── models/
│   │   ├── textures/
│   │   ├── environments/
│   │   └── scenes/
│   └── legacy/
│       └── old-static-demo/
│
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── routes.jsx
│   │   └── styles.css
│   │
│   ├── demo/
│   │   ├── DemoPage.jsx
│   │   ├── ProductView.jsx
│   │   ├── ElderView.jsx
│   │   ├── CaregiverView.jsx
│   │   └── DemoTimeline.jsx
│   │
│   ├── admin/
│   │   ├── AdminPage.jsx
│   │   ├── SceneList.jsx
│   │   ├── SceneEditor.jsx
│   │   ├── SceneTree.jsx
│   │   ├── InspectorPanel.jsx
│   │   ├── AssetPanel.jsx
│   │   └── TimelineEditor.jsx
│   │
│   ├── scene-core/
│   │   ├── SceneRenderer.jsx
│   │   ├── CapsulePod.jsx
│   │   ├── SceneObject.jsx
│   │   ├── Hotspot.jsx
│   │   ├── VirtualBrush.jsx
│   │   ├── CaregiverDashboard.jsx
│   │   └── sceneSchema.js
│   │
│   ├── store/
│   │   ├── sceneStore.js
│   │   ├── editorStore.js
│   │   └── demoStore.js
│   │
│   ├── data/
│   │   ├── project-config.json
│   │   └── scenes/
│   │       ├── capsule-product-showcase.json
│   │       ├── capsule-elder-experience.json
│   │       ├── capsule-caregiver-monitor.json
│   │       ├── calligraphy-game-yong.json
│   │       └── ink-gallery-report.json
│   │
│   └── utils/
│       ├── exportScene.js
│       ├── importScene.js
│       └── validateSceneConfig.js
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 11. 开发里程碑

### Milestone 0：整理现有项目

目标：不破坏当前静态演示，建立新系统入口。

任务：

- 保留当前 `index.html`、`script.js`、`room-config.js`。
- 新增 `docs/development-plan.md`。
- 新增 `docs/scene-schema.md`。
- 新增 `docs/codex-tasks.md`。
- 规划 `legacy` 迁移策略。

验收标准：

- 当前页面仍可运行。
- 文档清楚说明下一步开发路径。

### Milestone 1：建立 Vite + React 项目骨架

目标：建立前后台基础路由。

任务：

- 新建 `package.json`。
- 安装 `vite`、`react`、`react-dom`、`three`、`@react-three/fiber`、`zustand`。
- 新建 `/demo`、`/admin`、`/preview/:sceneId`。
- 迁移现有静态资源到 `public/assets`。

验收标准：

- `npm install` 可运行。
- `npm run dev` 启动本地页面。
- `/demo` 和 `/admin` 可分别访问。

### Milestone 2：实现前台 Demo

目标：形成可用于答辩的演示端。

任务：

- 实现 `ProductView`：展示胶囊舱外观。
- 实现 `ElderView`：展示老人舱内沉浸式书法游戏。
- 实现 `CaregiverView`：展示护工监护界面。
- 实现流程时间轴：入舱、关闭、游戏、反馈、报告。
- 增加相机预设和镜头转场。

验收标准：

- 不进入后台也能完整演示产品闭环。
- 前台没有复杂编辑按钮。
- 可以一键播放完整流程。

### Milestone 3：实现后台 Scene Editor MVP

目标：后台可以真正修改 3D 场景。

任务：

- 加载 JSON 场景配置。
- 显示对象树。
- 选中对象后可编辑位置、旋转、缩放。
- 可修改颜色、透明度、发光颜色。
- 可修改相机预设。
- 可新增 / 删除热点。
- 支持保存到 localStorage。
- 支持导出 JSON。

验收标准：

- 后台修改对象后，前台预览能看到变化。
- 导出的 JSON 可以再次导入恢复场景。

### Milestone 4：胶囊舱产品化场景

目标：从“立方体书房”升级为“胶囊舱产品”。

任务：

- 建立胶囊舱模型组件：外壳、舱门、躺椅、内屏、观察窗、护工屏。
- 增加舱门关闭动画。
- 增加内部沉浸屏切换动画。
- 增加虚拟毛笔路径动画。
- 增加作品生成动画。

验收标准：

- 用户能看懂这是躺卧式胶囊产品。
- 老人端和护工端逻辑分区清楚。

### Milestone 5：后台资源管理与导出

目标：让后台具备项目管理能力。

任务：

- 增加模型资源面板。
- 支持上传或填写模型路径。
- 支持贴图预览。
- 支持一键导出演示包。
- 支持生成前台演示链接。

验收标准：

- 后台可管理多个场景。
- 设计者可替换场景模型和贴图。
- 可导出给老师或答辩现场运行。

---

## 12. Codex 开发任务拆分

### Task 1：建立 React + Vite 基础项目

```text
请在当前仓库中保留原有静态演示文件，同时新增一个 Vite + React 前后台项目骨架。
要求：
1. 新增 package.json、vite.config.js、src/。
2. 实现 /demo 和 /admin 两个页面。
3. /demo 显示“前台演示端”。
4. /admin 显示“后台3D编辑端”。
5. 不删除原 index.html、script.js、room-config.js。
```

### Task 2：建立 SceneConfig 数据结构

```text
请新增 src/scene-core/sceneSchema.js 和 src/data/scenes/ 下的示例 JSON。
要求：
1. SceneConfig 包含 camera、environment、objects、hotspots、timeline。
2. 至少创建 3 个场景：产品外观、老人舱内、护工监护。
3. 增加 validateSceneConfig 方法，用于检查必要字段。
```

### Task 3：实现前台胶囊舱 Demo

```text
请实现 /demo 前台演示端。
要求：
1. 使用 Three.js 或 @react-three/fiber 渲染一个横向胶囊舱。
2. 显示躺卧座椅、内部环幕、外部观察窗、护工屏。
3. 提供产品视角、老人视角、护工视角三种模式。
4. 提供一键播放流程：入舱、关门、沉浸启动、书法游戏、报告生成。
```

### Task 4：实现后台 3D 编辑器 MVP

```text
请实现 /admin 后台场景编辑器。
要求：
1. 左侧显示对象树。
2. 中间显示 3D 场景。
3. 右侧显示属性面板。
4. 点击对象后可修改 position、rotation、scale、color、opacity。
5. 支持保存到 localStorage。
6. 支持导出当前场景 JSON。
```

### Task 5：加入护工监护端 UI

```text
请实现 CaregiverDashboard 组件。
要求：
1. 显示老人姓名、当前课程、体验阶段、剩余时间。
2. 显示模拟心率、呼吸、专注度、情绪状态。
3. 提供暂停、结束体验、打开舱门、呼叫老人四个按钮。
4. 该组件在 /demo 的 Caregiver View 和 /admin 的预览中都可以复用。
```

### Task 6：加入虚拟书法游戏

```text
请实现 VirtualCalligraphyGame 组件。
要求：
1. 显示“永”字。
2. 显示永字八法的笔画路径。
3. 播放虚拟毛笔沿路径书写的动画。
4. 支持下一笔、重播、完成作品。
5. 完成后生成评分面板：结构、笔画、笔法、节奏、专注度。
```

---

## 13. 设计注意事项

### 13.1 适老化原则

- 字体大。
- 对比度高。
- 不使用快速旋转镜头。
- 不使用强闪烁效果。
- 单次体验建议 10–15 分钟。
- 始终保留退出与呼叫护工入口。
- 所有反馈尽量鼓励式，不使用失败、错误等刺激词。

### 13.2 B 端养老院原则

- 护工必须能随时接管。
- 设备必须体现可维护性。
- 需要有清洁、开舱、暂停、状态监测逻辑。
- 后台要服务“活动组织”，而不仅是个人娱乐。

### 13.3 产品表达原则

- 避免医疗舱、检查舱、太空舱的冰冷感。
- 外观应偏康养、冥想、文化体验。
- 色彩建议：暖白、木色、柔金、淡墨灰。
- 舱内空间要安静，舱外系统要专业。

---

## 14. 前台与后台的关系

```text
后台编辑 SceneConfig
        ↓
保存为 JSON
        ↓
前台读取 SceneConfig
        ↓
渲染胶囊舱 Demo
        ↓
演示老人端 / 护工端体验
```

后台不是另一个产品，而是前台内容的生产工具。

最终形成：

- 设计者在后台编辑胶囊舱场景。
- 前台自动读取配置并演示。
- 护工端 UI 和老人端 UI 都来自同一套场景数据。
- 后续可扩展为真实 B 端设备配置平台。

---

## 15. MVP 验收清单

第一版最小可用系统应满足：

- [ ] `/demo` 可以完整展示胶囊舱产品体验。
- [ ] `/demo` 至少有 3 个视角：产品、老人、护工。
- [ ] `/demo` 有完整流程播放。
- [ ] `/admin` 可以加载同一个场景。
- [ ] `/admin` 可以修改 3D 对象位置。
- [ ] `/admin` 可以修改材质颜色。
- [ ] `/admin` 可以保存和导出 JSON。
- [ ] 导出的 JSON 可再次导入。
- [ ] 前台可以读取后台配置。
- [ ] 老人端不会看到后台编辑控件。
- [ ] 护工端能看到监护数据和安全按钮。

---

## 16. 推荐下一步

下一步不要直接继续画图，而是让 Codex 先完成以下三个基础任务：

1. **建立 Vite + React 项目骨架。**
2. **定义 SceneConfig 数据结构。**
3. **实现 `/demo` 和 `/admin` 的最小可运行版本。**

只要这三步完成，后面再逐步替换真实 3D 模型、胶囊舱材质、虚拟书法游戏和护工监护界面，就会变成一个真正可迭代的软件系统。
