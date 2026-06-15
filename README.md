# MR / VR 书法交互工作台

> 当前主线已经恢复为旧版静态 3D / MR 项目。2026-06-14 起，Vite / React 新项目已删除，不再作为开发方向。

## 当前定位

这是一个可以在普通浏览器中运行的本地 MR / VR 书法交互网页项目。主入口仍是旧版项目的静态页面：

- `index.html`：前台 MR / VR 书法交互工作台。
- `main-admin.html`：主场景后台控制页面，用于管理旧版 3D 场景物件、发布记录和本机配置。
- `realistic-demo.html`：写实 3D 样张页面。
- `realistic-admin.html`：写实场景后台控制页面。

项目采用纯 HTML、CSS、JavaScript 和 Three.js，本轮不再维护 `/editor`、`/preview` 或 Vite 开发服务器入口。后台控制页面是：

```text
http://localhost:41496/main-admin.html
```

局域网访问时，当前机器地址为：

```text
http://192.168.193.233:41496/
http://192.168.193.233:41496/main-admin.html
```

## 运行方式

安装依赖：

```bash
npm install
```

启动旧版静态项目：

```bash
npm run dev
```

默认会在 `0.0.0.0:41496` 启动 Node 本地服务器。浏览器访问：

```text
http://localhost:41496/
```

如果 41496 端口已经有服务在运行，可以直接使用现有服务；不要再启动旧的 Vite 5173 项目。

后台保存主场景布局时会优先写到部署目录的：

```text
server-data/main-scene-layout.json
server-data/main-scene-published.json
```

浏览器 `localStorage` 只作为离线兜底缓存，不再作为主场景布局的唯一保存位置。

前台主场景现在使用和 `main-admin.html` 一致的 Three.js 渲染方式：同一组 GLB 模型、六面房间、RoomEnvironment、半球光、主聚光灯、边缘方向光、阴影、曝光和服务器本地布局数据。普通前台会同时检查服务器本地草稿和已发布布局；如果后台草稿保存时间晚于发布版，会自动显示最新草稿，避免后台保存后前台位置不一致。

前台中间的 AI 书法教练主面板可以用标题条右侧按钮收起，只保留小标题条，减少对 3D 视野的遮挡；折叠状态会保存在当前浏览器本机。

## 当前交互方向

旧版最早的布局和主后台保留为项目根基：立方体房间、六面贴图、书桌、宣纸、毛笔、书架、卷轴、场景角色、热点、左侧工作流、右侧反馈、底部导航、主场景后台都继续使用。

旧的“1-10 演示步骤”不再作为产品界面出现。它们只保留为内部流程参考，已经改成真实交互工作流：

- `entry`：沉浸准备，加载日课字和本机任务状态。
- `task`：任务确认，确认本次书写目标。
- `lecture`：空间讲解，播放本机讲解或显示讲解记录。
- `practice`：真实临摹，进入可保存笔迹的书写画布。
- `stroke`：笔画拆解，查看结构、笔顺和薄弱点。
- `creation`：作品生成，保存真实书写作品。
- `history`：作品档案，查看历史作品和评分证据。
- `review`：空间复盘，整理本次练习反馈。
- `report`：本机报告，导出可验证的 HTML / PDF 报告。
- `plan`：巩固计划，根据本机记录生成下一轮练习计划。

前台路由使用 `?flow=`，例如：

```text
http://localhost:41496/?flow=practice
http://localhost:41496/?flow=report
```

历史 `?step=` 参数只用于兼容旧链接，不再作为主文档推荐。

## AR + VR 空间感

前台新增空间模式面板：

- **MR 交互**：默认混合现实工作台，保留所有面板和热点。
- **AR 锚点**：强化地面锚点、热点光圈和空间定位感。
- **VR 环视**：降低面板干扰，突出沉浸式环视与场景导航。

这些模式当前是浏览器中的可用空间表现层，不伪装成已经接入真实 WebXR 设备。后续若接入真实 WebXR，需要在开发文档中追加设备能力、降级策略和验收记录。

## 主后台页面

主后台是：

```text
http://localhost:41496/main-admin.html
```

后台包含本机真实能力：

- 查看与编辑主场景物件。
- 调整导入模型材质、颜色、透明度、粗糙度、金属度。
- 管理项目档案导入、导出、恢复和影响预览。
- 记录本机发布、审核、远端 Adapter 配置和操作审计。
- 按本机操作者角色提示编辑/复核/审批边界，但不再要求访问码门禁。

后台不是云端生产管理系统；没有账号、多设备协同、真实硬件控制或生产数据库。

## 立方体贴图

当前六面贴图读取：

```text
assets/cube/wall-wood-front.png
assets/cube/wall-wood-back.png
assets/cube/wall-wood-left.png
assets/cube/wall-wood-right.png
assets/cube/ceiling.png
assets/cube/floor.png
```

建议每张保持正方形，例如 `2048x2048` 或 `4096x4096`。如果直接双击 `index.html`，浏览器可能限制本地纹理加载，也无法使用服务器本地布局保存；推荐始终通过 `npm run dev` 访问。

## 配置接口

长期配置入口：

```text
room-config.js
```

运行时也暴露了 JS API：

```js
MRRoomAPI.setTextures({ front: "assets/cube/my-front.png" });
MRRoomAPI.addRole({
  id: "teacher-2",
  name: "点评老师",
  color: "#8e6cff",
  position: [-4, -3.02, -2.8],
  scale: 1,
  view: { yaw: -44, pitch: -8, scale: 1.08 },
  description: "负责作品点评和学习建议。"
});
MRRoomAPI.focusRole("teacher-2");
```

## 已包含功能

- WebGL 立方体房间，六张贴图分别贴到房间六面。
- 旧版主场景布局、3D 家具、书桌、书架、卷轴、纸笔和场景角色。
- 交互工作流导航，不再显示演示用数字步骤。
- MR / AR / VR 三种空间表现模式。
- 可拖拽旋转视角、滚轮缩放、键盘切换工作流。
- 本机真实书写画布、作品保存、评分证据、历史档案、报告导出和巩固计划。
- `main-admin.html` 主场景后台编辑与本机发布审计。
- `realistic-demo.html` / `realistic-admin.html` 写实样张与写实后台。

## 验收命令

提交前运行：

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://localhost:41496/ npx playwright test tests/e2e/real-flows.spec.js
```

`npm run build` 当前等价于静态项目冒烟检查，会校验核心脚本、入口页面、后台页面和本机服务边界标记。

## 开发文档

长期开发以这两个文档为准：

- [旧版主线恢复与 MR / VR 真实交互开发计划](docs/development-plan.md)
- [旧版主线开发执行清单](docs/implementation-checklist.md)

历史审计文档仍可参考，但不能覆盖当前主线：

- [当前版本功能不足与真实化审计](docs/2026-06-12-current-version-realification-audit.md)
- [前端操作界面真实化开发文档](docs/frontend-realification-development-plan.md)
- [5.16 版本功能审计与真实化开发文档](docs/516-realification-development-plan.md)
