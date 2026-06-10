# MR 书法康养应用软件开发计划书

> 计划版本：v0.2  
> 更新日期：2026-06-10  
> 适用仓库：`eistinlandfrank/mr-calligraphy-cube-scene`  
> 本文档定位：**只针对 MR 应用软件开发**，不包含硬件工业设计、胶囊仓制造、实体产品结构设计、3D 模型建模生产计划。

---

## 0. 本次修正说明

上一版计划书的问题是把“产品系统、硬件胶囊仓、工业设计、3D 模型生产”和“MR 应用软件开发”混在一起，导致开发目标不够聚焦。本版本重新定义为一个纯软件开发项目书。

本项目的软件目标是：

> 在现有 MR 书法 3D 立方体交互网页基础上，开发一个具有“前台真实演示端”和“后台 3D 场景编辑端”的 MR 应用系统。前台负责展示可交互、可记录、可复盘的书法康养体验；后台负责编辑 3D 场景、UI、流程节点、交互热点、动画和数据配置。

本项目不负责：

- 胶囊仓实体结构设计。
- 工业设计效果图生产。
- 真实硬件传感器研发。
- 真实医疗诊断功能。
- 外包 3D 模型建模。
- 量产制造、材料、CMF、供应链、成本核算。

本项目负责：

- MR / WebXR 应用前端。
- 3D 场景渲染与交互。
- 前台演示流程真实化。
- 后台 3D 场景编辑器。
- 场景配置数据结构。
- 本地存储与 JSON 导入导出。
- 可扩展的数据接口。
- 护工端软件界面与状态管理。
- 书法游戏交互逻辑与评分算法原型。

---

## 1. 项目背景与现有基础

当前仓库已有一个本地 MR 书法 3D 交互网页原型，现有 README 中说明项目已经包含以下能力：

- 纯 HTML、CSS、JavaScript 本地运行。
- WebGL 立方体房间方案。
- 六面 cube 贴图。
- 10 个学习步骤。
- 键盘切换、底部导航、热点跳转。
- 场景角色配置。
- 右下角场景编辑面板。
- 本地 localStorage 保存。

这些能力说明当前仓库已经具备“可视化演示”的基础，但还没有形成真正的软件产品架构。下一步开发重点不是继续堆视觉图，而是把当前原型改造成一个具备真实交互、可配置数据、可维护代码结构的 MR 应用。

---

## 2. 项目目标

### 2.1 总目标

开发一个 MR 书法康养应用系统，包含两个主要入口：

1. **前台演示端 `/demo`**  
   给老师、评委、养老院客户或用户观看。它必须像真实软件一样运行：按钮有状态变化，交互会产生数据，书法练习会生成记录，报告由用户行为计算得到，而不是只播放几张假图。

2. **后台编辑端 `/admin`**  
   给开发者、设计者和运营人员使用。它可以在浏览器里编辑 3D 场景、物体、UI 面板、热点、流程节点和演示内容，并保存为 JSON 配置。

### 2.2 软件体验目标

前台不再是“假功能演示图”，而要做到：

- 用户点击、凝视、拖拽、键盘输入都能真实改变系统状态。
- 书法游戏有真实的路径跟随、完成度判断和评分逻辑。
- 护工端状态不是静态图片，而是根据体验流程实时变化。
- 学习报告不是写死文本，而是根据本次交互数据生成。
- 场景内容不是写死在代码中，而是由后台 JSON 配置驱动。
- 后台编辑后，前台预览能立即反映变化。

---

## 3. 软件范围

### 3.1 前台范围

前台包含以下软件模块：

1. MR 场景展示模块。
2. 老人体验视角模块。
3. 护工监护视角模块。
4. 书法游戏模块。
5. 凝视交互模块。
6. 鼠标 / 触控 / 键盘交互模块。
7. 语音指令模块。
8. 学习流程状态机。
9. 行为数据记录模块。
10. AI 评分原型模块。
11. 学习报告生成模块。
12. 演示模式控制模块。

### 3.2 后台范围

后台包含以下软件模块：

1. 场景列表管理。
2. 3D 场景编辑器。
3. 对象树 Scene Tree。
4. 属性面板 Inspector。
5. 材质编辑。
6. 灯光编辑。
7. 相机编辑。
8. UI 面板编辑。
9. 热点编辑。
10. 流程节点编辑。
11. 动画片段编辑。
12. JSON 导入导出。
13. 本地版本保存。
14. 前台预览。

### 3.3 暂不纳入范围

以下内容暂不纳入第一阶段开发：

- 真实生理传感器接入。
- 真实语音识别云服务。
- 多用户登录系统。
- 养老院管理后台。
- 真实支付或商业部署。
- 数据隐私合规系统。
- 真实医疗级数据采集。
- 真实 3D 模型资产生产流程。

这些内容可以在第二阶段以后扩展。

---

## 4. 前台功能真实化原则

当前最大问题是前台功能“看起来有”，但很多是假的。新版本需要分清楚三类状态：

| 类型 | 定义 | 是否允许出现在正式 Demo |
|---|---|---|
| 静态展示 | 只是图片或固定文字 | 只允许用于背景和装饰 |
| 模拟数据 | 没接真实硬件，但由程序状态动态生成 | 允许，但必须标注为模拟 |
| 真实交互 | 用户操作会产生真实数据和结果 | 前台核心功能必须达到这一层 |

### 4.1 必须真实化的功能

以下功能不能再只是假图或固定文案：

1. **流程切换**  
   用户点击“开始体验”“下一步”“暂停”“结束”后，必须改变真实状态机。

2. **凝视选择**  
   光标停留在按钮上达到设定时长后，触发选择事件，并有倒计时进度反馈。

3. **书法路径跟随**  
   用户需要沿着“永”字笔画路径进行鼠标、触控或手势跟随，系统记录轨迹点。

4. **评分计算**  
   评分根据路径偏差、完成时间、笔画顺序、停顿次数、是否中断等指标计算。

5. **报告生成**  
   报告根据本次练习数据生成，包括完成度、稳定度、专注度、建议，而不是写死。

6. **护工监护状态**  
   护工端显示的体验阶段、剩余时间、安全状态、暂停状态必须来自统一状态机。

7. **场景配置读取**  
   场景内容必须从 JSON 配置读取，而不是全部硬编码在组件里。

### 4.2 可以模拟但要真实驱动的功能

以下功能第一阶段可以模拟，但模拟值必须由程序逻辑驱动：

| 功能 | 第一阶段处理方式 | 后续扩展 |
|---|---|---|
| 心率 | 根据体验阶段和交互状态生成模拟曲线 | 接 Web Bluetooth / 外部 API |
| 呼吸 | 根据放松阶段生成缓慢波形 | 接传感器 |
| 情绪 | 根据完成度和暂停次数推导 | 接问卷 / 视觉识别 |
| 语音 | 先用 Web Speech API 或按钮模拟 | 接离线语音模型 |
| 手势 | 先用鼠标 / 触控模拟 | 接 WebXR Hand Input |

重点是：即使是模拟，也不能是静态假数据；必须随流程变化。

---

## 5. 推荐技术路线

### 5.1 第一阶段技术栈

推荐使用：

```text
Vite + React + Three.js + @react-three/fiber + Zustand + IndexedDB
```

理由：

- `Vite` 用于快速启动现代前端项目、构建静态应用。
- `React` 用于组织前台、后台、护工端、编辑器等复杂 UI。
- `Three.js` 负责 3D 场景、材质、灯光、相机和 WebXR 能力。
- `@react-three/fiber` 负责把 Three.js 组件化，便于后台编辑器复用渲染组件。
- `Zustand` 负责统一管理场景状态、演示流程状态和编辑状态。
- `IndexedDB` 负责本地保存多个场景版本，比 localStorage 更适合存较大配置。

### 5.2 技术边界

第一阶段不强制接入真实 VR 头显。系统先保证桌面浏览器中可运行：

- 鼠标拖拽视角。
- 键盘切换。
- 点击 / 凝视模拟交互。
- WebXR 可作为增强入口。

后续如果设备支持 WebXR，再加入：

- VR 进入按钮。
- 控制器输入。
- 手部追踪。
- 空间 UI。

---

## 6. 软件架构

### 6.1 总体架构

```text
                 ┌─────────────────────┐
                 │     Scene Config     │
                 │   JSON / IndexedDB   │
                 └──────────┬──────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  Demo Frontend │  │  Admin Editor  │  │  Preview Page  │
│  前台演示端     │  │  后台编辑端     │  │  配置预览端     │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                   │
┌───────▼───────────────────▼───────────────────▼────────┐
│                  3D Scene Core                           │
│  SceneRenderer / ObjectFactory / InteractionManager      │
└───────┬───────────────────┬───────────────────┬────────┘
        │                   │                   │
┌───────▼───────┐  ┌────────▼───────┐  ┌────────▼──────┐
│ Flow State     │  │ Practice Data  │  │ Report Engine │
│ 流程状态机      │  │ 练习数据记录    │  │ 报告生成      │
└───────────────┘  └────────────────┘  └───────────────┘
```

### 6.2 前后台关系

后台是内容生产工具，前台是内容消费和演示工具。

```text
后台编辑场景
   ↓
保存为 SceneConfig
   ↓
前台读取 SceneConfig
   ↓
执行真实交互流程
   ↓
生成 PracticeSession
   ↓
生成 Report
```

---

## 7. 页面与路由规划

```text
/
├── /demo
│   ├── 产品演示首页
│   ├── 老人体验视角
│   ├── 护工监护视角
│   └── 演示流程播放器
│
├── /admin
│   ├── 场景列表
│   ├── 3D 场景编辑器
│   ├── UI 编辑器
│   ├── 流程编辑器
│   └── 数据导入导出
│
├── /preview/:sceneId
│   └── 指定场景预览
│
└── /legacy
    └── 当前旧版静态 Demo 入口
```

---

## 8. 前台演示端详细设计

### 8.1 前台核心视角

前台有三种视角：

1. **Product View 产品视角**  
   用于展示 MR 应用运行在胶囊舱场景中的整体效果。这里不做工业设计编辑，只展示应用加载后的空间界面。

2. **Elder View 老人视角**  
   模拟老人躺在胶囊舱内看到的虚拟世界。外界不可见，只显示书法沉浸环境、虚拟毛笔、AI 讲解和游戏 UI。

3. **Caregiver View 护工视角**  
   显示护工端软件界面，包括体验状态、暂停、结束、语音呼叫和安全提醒。

### 8.2 前台流程状态机

前台流程由状态机驱动，禁止写死页面切换。

```text
idle
  ↓
ready_check
  ↓
enter_capsule
  ↓
door_closing
  ↓
immersive_intro
  ↓
calligraphy_tutorial
  ↓
practice_game
  ↓
scoring
  ↓
report
  ↓
caregiver_confirm
  ↓
finished
```

每个状态必须包含：

- `id`
- `title`
- `duration`
- `allowedActions`
- `nextState`
- `onEnter`
- `onExit`

示例：

```json
{
  "id": "practice_game",
  "title": "虚拟书法练习",
  "duration": 180,
  "allowedActions": ["pause", "restartStroke", "finishPractice"],
  "nextState": "scoring"
}
```

### 8.3 前台交互真实化清单

| 功能 | 当前问题 | 新版本实现 |
|---|---|---|
| 开始按钮 | 只跳转或显示文案 | 触发状态机进入 `ready_check` |
| 下一步 | 只是切图 | 根据当前状态执行校验后进入下一状态 |
| 暂停 | 可能无真实影响 | 暂停计时器、动画、输入采集 |
| 退出 | 只是返回首页 | 结束 session，保存中断记录 |
| 护工端 | 静态 UI | 读取统一 session 状态 |
| 报告 | 固定分数 | 根据练习数据生成 |
| 书法游戏 | 看图 | 真实路径跟随与评分 |

---

## 9. 书法游戏模块设计

### 9.1 游戏目标

第一阶段只做一个核心游戏：**永字八法路径跟随**。

用户通过鼠标、触控、控制器射线或 WebXR 手势，跟随系统给出的笔画路径完成“永”字。

### 9.2 输入方式

第一阶段支持：

- 鼠标按下拖拽。
- 触屏拖拽。
- 键盘快捷键。
- 凝视确认按钮。

第二阶段支持：

- WebXR 控制器射线。
- WebXR hand tracking。
- 语音指令。

### 9.3 笔画数据结构

```json
{
  "character": "永",
  "strokes": [
    {
      "id": "dot",
      "name": "点",
      "order": 1,
      "path": [[0.12, 0.08], [0.18, 0.12], [0.22, 0.18]],
      "tolerance": 0.08,
      "expectedTime": 1200
    }
  ]
}
```

### 9.4 采集数据

每次练习生成：

```json
{
  "sessionId": "practice-20260610-001",
  "startedAt": "2026-06-10T10:00:00+09:00",
  "endedAt": "2026-06-10T10:05:00+09:00",
  "inputType": "mouse",
  "strokes": [
    {
      "strokeId": "dot",
      "points": [[0.1, 0.09, 120], [0.16, 0.13, 180]],
      "duration": 980,
      "completed": true,
      "deviation": 0.045,
      "restartCount": 0
    }
  ]
}
```

### 9.5 评分算法 MVP

评分不做假分数，使用可解释规则：

```text
综合分 = 路径准确度 40% + 笔顺完成度 25% + 节奏稳定度 20% + 中断次数 15%
```

具体指标：

- 路径准确度：用户轨迹点到标准路径的平均距离。
- 笔顺完成度：按正确顺序完成的笔画比例。
- 节奏稳定度：每一笔耗时与预期耗时的差异。
- 中断次数：暂停、重写、离开画布次数。

报告维度：

- 结构感
- 笔画完成度
- 节奏稳定度
- 专注度
- 综合建议

---

## 10. 凝视交互模块设计

### 10.1 功能定义

凝视交互用于模拟 MR / VR 中无手柄操作。用户把视线中心停留在按钮上，超过设定时间后触发操作。

桌面端用屏幕中心准星模拟。

### 10.2 交互规则

- 准星进入按钮区域：开始计时。
- 停留 1.2 秒：显示环形进度。
- 达到 1.8 秒：触发点击。
- 移出按钮：取消计时。
- 所有凝视按钮必须支持鼠标点击备用。

### 10.3 可触发动作

- 开始体验。
- 下一步。
- 重播示范。
- 下一笔。
- 保存作品。
- 呼叫护工。
- 退出体验。

---

## 11. 语音指令模块设计

### 11.1 第一阶段处理

第一阶段使用浏览器 Web Speech API 或按钮模拟。若浏览器不支持，则自动降级为命令按钮。

指令包括：

```text
开始
暂停
继续
重来
下一笔
保存
退出
呼叫护工
```

### 11.2 状态联动

语音指令不能只弹提示，必须触发状态机动作：

| 指令 | 触发动作 |
|---|---|
| 开始 | `startSession()` |
| 暂停 | `pauseSession()` |
| 继续 | `resumeSession()` |
| 重来 | `restartCurrentStroke()` |
| 下一笔 | `goNextStroke()` |
| 保存 | `savePracticeResult()` |
| 退出 | `endSession('user_exit')` |
| 呼叫护工 | `requestCaregiverHelp()` |

---

## 12. 护工监护端软件设计

### 12.1 功能定位

护工端不是摆设，而是前台软件的一部分。它要实时读取 session 状态，并能干预老人端体验。

### 12.2 页面内容

护工端显示：

- 当前体验用户。
- 当前流程阶段。
- 剩余时间。
- 输入方式。
- 当前笔画。
- 完成度。
- 暂停状态。
- 安全提醒。
- 呼叫请求。
- 练习报告。

### 12.3 护工端操作

| 操作 | 真实效果 |
|---|---|
| 暂停体验 | 前台状态机暂停，老人端显示柔和暂停界面 |
| 继续体验 | 状态机恢复，动画继续 |
| 结束体验 | 保存 session，进入报告页 |
| 重置当前练习 | 清空当前笔画数据 |
| 呼叫老人 | 老人端出现语音 / 文字提示 |
| 开启放松模式 | 切换到呼吸引导场景 |

### 12.4 监护数据处理

第一阶段不接真实硬件。监护数据分为两类：

1. **真实软件数据**  
   来自系统内部，例如流程阶段、剩余时间、暂停次数、练习完成度、交互次数。

2. **模拟健康数据**  
   心率、呼吸等以模拟曲线显示，并在 UI 上标注“模拟数据”。后续可接传感器 API。

---

## 13. 后台 3D 场景编辑器设计

### 13.1 后台目标

后台不是给最终老人使用的。后台用于开发者和设计者调整 MR 应用内容。

核心目标：

> 不改代码，也可以修改场景对象、灯光、相机、UI 面板、热点、流程节点和书法游戏配置。

### 13.2 后台页面布局

```text
┌────────────────────────────────────────────────────────────┐
│ 顶部工具栏：保存 / 预览 / 导入 / 导出 / 撤销 / 重做          │
├──────────────┬─────────────────────────────┬──────────────┤
│ Scene Tree   │ 3D Viewport                  │ Inspector    │
│ 对象树        │ 场景编辑视窗                  │ 属性面板      │
├──────────────┴─────────────────────────────┴──────────────┤
│ Timeline / Flow Editor / Hotspot List                      │
└────────────────────────────────────────────────────────────┘
```

### 13.3 对象树

对象类型：

- `model`：3D 模型。
- `primitive`：基础几何体。
- `light`：灯光。
- `camera`：相机。
- `ui-panel`：空间 UI 面板。
- `hotspot`：交互热点。
- `stroke-path`：书法路径。
- `environment`：环境背景。

### 13.4 属性面板

每个对象可编辑：

#### Transform

- position x/y/z
- rotation x/y/z
- scale x/y/z

#### Material

- color
- opacity
- roughness
- metalness
- emissive
- texture

#### Interaction

- trigger：click / gaze / voice / state
- action：changeState / showPanel / playAnimation / startGame / saveReport
- target

#### UI Content

- title
- body
- icon
- visibility
- layout

### 13.5 编辑操作真实化

后台编辑必须真的影响前台预览：

- 修改对象位置 → 3D 场景立即变化。
- 修改颜色 → 材质立即变化。
- 修改热点目标 → 前台点击后跳转到新目标。
- 修改流程节点 → 前台流程按新节点执行。
- 修改书法路径 → 游戏跟随路径改变。

---

## 14. 数据结构设计

### 14.1 ProjectConfig

```json
{
  "id": "mr-calligraphy-care-app",
  "name": "MR书法康养应用",
  "defaultSceneId": "elder-ink-space",
  "defaultFlowId": "main-demo-flow",
  "theme": {
    "primary": "#B8895D",
    "background": "#F6EFE7",
    "accent": "#D7AA72"
  }
}
```

### 14.2 SceneConfig

```json
{
  "id": "elder-ink-space",
  "name": "老人舱内水墨空间",
  "type": "elder-view",
  "camera": {
    "position": [0, 1.2, 4.5],
    "target": [0, 1.0, 0],
    "fov": 55
  },
  "environment": {
    "type": "panorama",
    "src": "assets/environments/ink-landscape.jpg",
    "fog": true,
    "ambientColor": "#f4e7d2"
  },
  "objects": [],
  "uiPanels": [],
  "hotspots": []
}
```

### 14.3 FlowConfig

```json
{
  "id": "main-demo-flow",
  "name": "主演示流程",
  "states": [
    {
      "id": "idle",
      "title": "等待开始",
      "next": "ready_check",
      "actions": ["start"]
    },
    {
      "id": "practice_game",
      "title": "书法练习",
      "next": "scoring",
      "actions": ["pause", "restart", "finish"]
    }
  ]
}
```

### 14.4 PracticeSession

```json
{
  "id": "session-001",
  "flowId": "main-demo-flow",
  "startedAt": "2026-06-10T10:00:00+09:00",
  "endedAt": null,
  "currentState": "practice_game",
  "events": [],
  "practiceData": {
    "character": "永",
    "strokes": []
  },
  "caregiverActions": []
}
```

### 14.5 Report

```json
{
  "sessionId": "session-001",
  "score": 86,
  "metrics": {
    "pathAccuracy": 0.82,
    "strokeOrder": 0.95,
    "rhythm": 0.76,
    "focus": 0.88
  },
  "suggestions": [
    "下一次可以放慢横画起笔速度。",
    "整体完成度较好，适合进入竖画稳定训练。"
  ]
}
```

---

## 15. 本地存储与导入导出

### 15.1 第一阶段存储

使用 IndexedDB 保存：

- 项目配置。
- 场景配置。
- 流程配置。
- 练习记录。
- 报告记录。

### 15.2 导入导出

后台支持：

- 导出当前场景 JSON。
- 导出完整项目 JSON。
- 导入 JSON 并校验。
- 恢复默认配置。

### 15.3 版本管理

每次保存生成一个版本：

```json
{
  "versionId": "v-20260610-001",
  "createdAt": "2026-06-10T10:30:00+09:00",
  "summary": "修改老人端水墨空间 UI 面板位置"
}
```

---

## 16. 推荐目录结构

```text
mr-calligraphy-cube-scene/
├── docs/
│   ├── development-plan.md
│   ├── scene-schema.md
│   └── codex-tasks.md
│
├── legacy/
│   └── static-demo/
│
├── public/
│   └── assets/
│       ├── models/
│       ├── textures/
│       ├── environments/
│       └── audio/
│
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── routes.jsx
│   │   └── app.css
│   │
│   ├── demo/
│   │   ├── DemoPage.jsx
│   │   ├── ProductView.jsx
│   │   ├── ElderView.jsx
│   │   ├── CaregiverView.jsx
│   │   ├── DemoFlowPlayer.jsx
│   │   └── DemoHud.jsx
│   │
│   ├── admin/
│   │   ├── AdminPage.jsx
│   │   ├── SceneList.jsx
│   │   ├── SceneEditor.jsx
│   │   ├── SceneTree.jsx
│   │   ├── InspectorPanel.jsx
│   │   ├── HotspotEditor.jsx
│   │   ├── FlowEditor.jsx
│   │   └── ImportExportPanel.jsx
│   │
│   ├── scene-core/
│   │   ├── SceneRenderer.jsx
│   │   ├── ObjectFactory.jsx
│   │   ├── InteractionManager.js
│   │   ├── GazeInput.jsx
│   │   ├── SpatialUIPanel.jsx
│   │   └── WebXRBridge.js
│   │
│   ├── calligraphy/
│   │   ├── VirtualCalligraphyGame.jsx
│   │   ├── StrokePath.jsx
│   │   ├── BrushCursor.jsx
│   │   ├── scoring.js
│   │   └── yongCharacter.json
│   │
│   ├── caregiver/
│   │   ├── CaregiverDashboard.jsx
│   │   ├── SafetyPanel.jsx
│   │   └── monitorData.js
│   │
│   ├── store/
│   │   ├── sceneStore.js
│   │   ├── flowStore.js
│   │   ├── editorStore.js
│   │   └── sessionStore.js
│   │
│   ├── data/
│   │   ├── defaultProject.json
│   │   ├── defaultFlow.json
│   │   └── scenes/
│   │
│   └── utils/
│       ├── storage.js
│       ├── importExport.js
│       ├── validateConfig.js
│       └── id.js
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 17. 开发阶段规划

### Phase 1：重构基础架构

目标：建立现代前端项目骨架，同时保留旧版 Demo。

任务：

- 新增 Vite + React 项目。
- 建立 `/demo`、`/admin`、`/preview/:sceneId`。
- 将旧版静态文件迁入 `legacy/static-demo` 或保留原入口。
- 建立 Zustand store。
- 建立 SceneConfig / FlowConfig / PracticeSession 类型。

验收：

- `npm install` 成功。
- `npm run dev` 成功。
- `/demo` 和 `/admin` 可以打开。
- 旧版页面不被破坏。

### Phase 2：前台真实流程状态机

目标：前台演示不再只是切图。

任务：

- 实现 DemoFlowPlayer。
- 实现状态机。
- 实现开始、暂停、继续、结束。
- 实现流程计时。
- 实现 session 事件记录。
- 护工端读取同一状态。

验收：

- 点击开始后，流程真实推进。
- 暂停会停止计时和动画。
- 结束会保存 session。
- 护工端状态同步变化。

### Phase 3：书法游戏真实化

目标：实现可操作的“永字八法”路径跟随游戏。

任务：

- 建立 `yongCharacter.json`。
- 渲染标准笔画路径。
- 记录用户输入轨迹。
- 计算路径偏差。
- 判断笔顺完成。
- 生成评分。
- 生成报告。

验收：

- 用户能实际描摹路径。
- 系统能记录点位。
- 分数会因用户表现不同而变化。
- 报告内容不是固定文案。

### Phase 4：后台 3D 编辑器 MVP

目标：后台可以编辑前台使用的配置。

任务：

- 实现场景列表。
- 实现 3D 视窗。
- 实现对象树。
- 实现属性面板。
- 支持编辑 transform。
- 支持编辑材质颜色。
- 支持添加热点。
- 支持保存到 IndexedDB。
- 支持导出 JSON。

验收：

- 编辑后的配置可以保存。
- 前台预览能读取编辑结果。
- 导出 JSON 后重新导入不丢失。

### Phase 5：MR / WebXR 增强

目标：在支持设备上进入沉浸模式。

任务：

- 增加 WebXR 入口。
- 增加 XR 模式检测。
- 增加控制器射线选择。
- 增加 WebXR 降级提示。
- 优化老人端大字号空间 UI。

验收：

- 普通浏览器仍可运行。
- 支持 WebXR 的环境可进入 VR/MR 模式。
- 不支持 WebXR 时有清楚提示。

### Phase 6：演示打磨与答辩模式

目标：形成稳定演示版本。

任务：

- 增加一键演示模式。
- 增加讲解字幕开关。
- 增加全屏模式。
- 增加加载进度。
- 增加错误提示。
- 优化性能。

验收：

- 答辩现场可以稳定运行。
- 无需后台即可完整演示。
- 后台编辑结果可导出备份。

---

## 18. Codex 任务提示词

### Task 1：软件项目骨架

```text
请基于当前仓库新增 Vite + React 软件架构，但不要删除旧版静态演示。
要求：
1. 新增 package.json、vite.config.js、src/。
2. 建立 /demo、/admin、/preview/:sceneId 三个页面入口。
3. /demo 显示前台演示端。
4. /admin 显示后台3D编辑端。
5. 当前 index.html、script.js、room-config.js 保留可运行。
```

### Task 2：流程状态机真实化

```text
请实现 DemoFlowPlayer 和 flowStore。
要求：
1. 使用状态机管理 idle、ready_check、immersive_intro、practice_game、scoring、report、finished。
2. 开始、暂停、继续、结束按钮必须真实改变状态。
3. 每次状态变化写入 session event。
4. CaregiverView 从同一个 flowStore 读取状态。
```

### Task 3：书法游戏真实化

```text
请实现 VirtualCalligraphyGame。
要求：
1. 使用 SVG 或 Three.js 平面绘制“永”字标准笔画路径。
2. 鼠标或触控拖拽时记录用户轨迹点。
3. 根据轨迹到标准路径的距离计算 pathAccuracy。
4. 根据笔顺完成情况计算 strokeOrder。
5. 生成动态评分和建议。
6. 不允许使用固定写死的评分。
```

### Task 4：护工端真实联动

```text
请实现 CaregiverDashboard。
要求：
1. 显示当前流程状态、剩余时间、当前笔画、完成度、暂停次数。
2. 心率和呼吸可以是模拟数据，但必须随流程阶段变化，并标注模拟。
3. 护工点击暂停、继续、结束时，老人端状态同步变化。
4. 护工点击呼叫时，老人端出现提示。
```

### Task 5：后台编辑器 MVP

```text
请实现 /admin 的 3D 场景编辑器 MVP。
要求：
1. 左侧对象树，中间 3D 视窗，右侧属性面板。
2. 选中对象后可以编辑 position、rotation、scale、color、opacity。
3. 编辑结果实时反映到 3D 视窗。
4. 可以保存到 IndexedDB。
5. 可以导出 SceneConfig JSON。
6. 可以从 JSON 导入并恢复场景。
```

### Task 6：前后台配置打通

```text
请打通 /admin 和 /demo 的数据。
要求：
1. /admin 保存的 SceneConfig 可以被 /demo 读取。
2. /preview/:sceneId 可以预览指定场景。
3. 如果没有后台配置，/demo 使用默认配置。
4. 加入配置校验，缺字段时显示明确错误。
```

---

## 19. MVP 验收标准

第一版真正可用的 MVP 需要满足：

- [ ] 前台不依赖静态图片表达核心交互。
- [ ] 前台有真实状态机。
- [ ] 前台按钮能真实改变状态。
- [ ] 书法游戏能记录用户轨迹。
- [ ] 评分由算法计算。
- [ ] 报告由练习数据生成。
- [ ] 护工端能同步控制老人端。
- [ ] 后台能编辑 3D 对象属性。
- [ ] 后台能保存配置。
- [ ] 前台能读取后台配置。
- [ ] JSON 可以导入导出。
- [ ] 不支持 WebXR 时仍可桌面演示。

---

## 20. 风险与处理策略

| 风险 | 说明 | 处理 |
|---|---|---|
| WebXR 设备不可用 | 答辩环境可能没有头显 | 桌面模式优先，WebXR 作为增强 |
| 真实传感器没有接入 | 心率呼吸不能真实采集 | 第一阶段标注模拟，后续提供 API 接口 |
| 3D 模型不完善 | 没有最终胶囊舱模型 | 用几何体和占位模型，不影响软件功能 |
| 后台编辑复杂 | 一次做完整编辑器成本高 | 先做 transform/material/hotspot |
| 前台继续变成假演示 | 只做视觉容易失控 | 所有功能绑定状态机和数据记录 |

---

## 21. 最终交付物

### 第一阶段交付

- `/demo` 前台演示端。
- `/admin` 后台编辑端 MVP。
- `SceneConfig` 数据结构。
- `FlowConfig` 状态机结构。
- `VirtualCalligraphyGame` 原型。
- `CaregiverDashboard` 联动界面。
- JSON 导入导出。
- 本地保存。

### 第二阶段交付

- WebXR 模式。
- 控制器 / 手势输入。
- 更完整的流程编辑器。
- 多场景管理。
- 报告历史记录。
- 可分享演示链接。

---

## 22. 结论

本项目的核心不是继续生成产品外观图，而是把现有 MR 书法网页原型升级为一个真实可运行的软件系统。

开发重点应从：

> 静态视觉展示

转为：

> 数据驱动的 MR 应用 + 可编辑的 3D 场景后台 + 真实交互流程

前台负责真实演示，后台负责内容生产，二者通过统一的 JSON 配置和 session 数据打通。这样项目才具备继续开发、展示、答辩和后续商业化扩展的基础。
