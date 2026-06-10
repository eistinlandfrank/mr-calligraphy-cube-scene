# 墨韵心境 MR 书法康养演示系统

这是一个面向 MR 书法康养场景的长期开发项目。仓库当前包含新版 React/Vite 前后台系统和旧版根目录静态原型：新版用于真实流程演示、后台配置、书法练习、护工联动、报告生成与 WebXR/MR 增强；旧版继续保留原有 WebGL 立方体房间，方便稳定展示历史原型。

## 快速启动

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev -- --port 5173
```

启动后访问：

| 页面 | 地址 | 用途 |
| --- | --- | --- |
| 前台演示 | `http://localhost:5173/demo` | 主演示流程、老人端、护工端、报告和答辩模式 |
| 后台编辑 | `http://localhost:5173/admin` | 编辑场景、对象、材质、空间 UI、流程配置并保存版本 |
| 场景预览 | `http://localhost:5173/preview/capsule-product-showcase` | 单场景预览 |
| 旧版原型 | `http://localhost:5173/` | 根目录静态 3D 立方体原型 |

生产构建：

```bash
npm run build
```

本地预览生产包：

```bash
npm run preview -- --port 4173
```

发布或答辩前建议先运行：

```bash
npm run test:smoke
npm run build
```

`npm run test:smoke` 会覆盖默认流程、评分差异、护工控制、后台保存读取和 JSON 导入导出。当前构建可能出现 Vite chunk-size warning，这是打包体积提示，不影响运行。

## 前台演示

打开 `/demo` 后可以使用右侧演示控制台：

- 点击“一键演示”自动从等待开始进入准备检查、入舱、沉浸导入、书法讲解、书法练习、评分报告、护工确认和完成状态。
- 点击暂停后，再次点击可从当前节点继续演示。
- 点击全屏图标进入答辩展示模式，页面会铺满屏幕并隐藏顶部开发导航、选中对象调试标签和 session 细节。
- “流程状态”区域会显示当前 FlowConfig 状态和可执行动作，可手动推进、暂停、重来、保存报告或呼叫护工。
- 老人端包含虚拟书法练习，真实鼠标或触控轨迹会写入 PracticeSession；一键演示会注入一组模拟完成数据，仍然走正式报告生成链路。
- 支持浏览器 WebXR 检测；在支持 `immersive-vr` 的设备上，3D 视窗会显示进入 XR 的入口。

## 后台编辑

打开 `/admin` 后可以进行长期配置：

- 左侧切换默认场景，例如产品展示、老人体验、护工监控、书法游戏和报告场景。
- 对象树可新增、复制、删除和选择 3D 对象。
- 属性面板可编辑对象的位置、旋转、缩放、颜色、文本、热点、空间 UI 和交互元数据。
- “保存到本机”会写入浏览器 localStorage 和 IndexedDB 最新快照；刷新页面后会自动读取。
- 版本下拉可以加载历史快照，便于回退到已保存版本。
- 导出会生成项目配置包，包含 ProjectConfig、FlowConfig 和全部 SceneConfig。
- 导入支持项目配置包、单个 SceneConfig、FlowConfig 和 ProjectConfig JSON。
- “预览”按钮可以跳到当前场景的 `/preview/:sceneId` 页面检查效果。

## 旧版静态原型

旧版静态入口仍保留在项目根目录，主要文件包括：

```text
index.html
script.js
style.css
room-config.js
main-admin.html
realistic-demo.html
assets/
```

如果只想运行旧版原型，也可以使用简单静态服务器：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

双击 `index.html` 也能打开，但浏览器通常不允许 `file://` 页面把本地图片作为 WebGL 纹理加载，所以直接双击时会自动降级为 CSS 立方体贴图。使用本地服务器时会启用完整 WebGL 立方体房间和 3D 家具。

旧版六面贴图默认读取：

```text
assets/cube/wall-wood-front.png
assets/cube/wall-wood-back.png
assets/cube/wall-wood-left.png
assets/cube/wall-wood-right.png
assets/cube/ceiling.png
assets/cube/floor.png
```

建议替换为同尺寸正方形图片，例如 `2048x2048` 或 `4096x4096`。

## 目录说明

```text
src/app/          应用入口、路由、全局样式和错误边界
src/demo/         前台演示、老人端、护工端、报告和时间线
src/admin/        后台场景编辑器
src/preview/      单场景预览
src/scene-core/   Three.js / React Three Fiber 场景渲染、WebXR、书法游戏
src/store/        Zustand 场景和流程状态
src/data/         默认项目、流程、场景和书法数据
docs/             开发计划、验收清单、测试清单和数据结构文档
assets/           旧版静态原型资源
```

## 开发记录

长期开发请优先查看：

- `docs/development-plan.md`：整体开发计划。
- `docs/implementation-checklist.md`：分阶段验收清单。
- `docs/codex-tasks.md`：每次功能提交的开发记录。
- `docs/test-checklist.md`：答辩或发布前的浏览器检查清单。
- `docs/scene-schema.md`、`docs/flow-schema.md`、`docs/session-schema.md`、`docs/report-schema.md`：核心数据结构说明。

本项目按“完成一个功能、更新开发文档、中文提交并推送到 GitHub”的方式维护。
