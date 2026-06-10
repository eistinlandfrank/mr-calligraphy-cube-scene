# MR 书法 3D 立方体交互网页

## 项目介绍

这是一个面向 MR 书法学习场景的本地交互网页原型。项目把传统书法教室、AI 书法教练、碑帖学习、笔画拆解、临摹反馈和学习报告整合到一个可拖拽浏览的 3D 空间中，让用户像进入一间虚拟书法教室一样完成从“进入系统”到“复盘总结”的完整学习流程。

项目不依赖后端服务，打开本地网页即可运行。当前版本采用 WebGL 立方体房间方案，通过六面贴图构建清晰的空间背景，并在场景内叠加可编辑的功能面板、热点按钮、步骤导航、3D 家具和场景角色。你可以直接替换六个面的贴图，也可以在网页上修改角色位置、名称、说明和观察视角，用来快速制作不同风格的 MR 教学演示。

适合用于：

- MR / VR 书法教学产品原型展示
- AI 书法教练交互流程演示
- 传统文化数字化学习场景汇报
- 本地静态网页作品集或课堂展示

核心亮点：

- 纯 HTML、CSS、JavaScript 实现，部署和修改都很轻量
- 支持 10 个学习步骤，包含键盘切换、底部导航和热点跳转
- 支持六面立方体空间贴图，避免单张低清 360 全景图带来的模糊和违和感
- 内置网页编辑面板，可自定义六面贴图路径和多个场景角色
- 保留 Pannellum 文件，后续仍可切回普通 360 全景查看器方案

这是一个纯静态本地项目，使用 HTML、CSS、JavaScript 实现 MR 书法学习演示。当前版本已升级为 WebGL 立方体房间：六张高清贴图分别贴到前后左右、地面、天花板，并叠加桌椅、书架、卷轴、桌面纸笔等 3D 几何内容。

旧的 Pannellum 本地文件仍保留在 `assets/vendor/pannellum/`，方便后续切回普通 360 全景方案；当前运行入口默认使用 WebGL 立方体房间。

## 运行方式

推荐在项目目录运行本地服务器：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

也可以直接双击 `index.html` 打开。由于浏览器通常不允许 `file://` 页面把本地图片上传为 WebGL 纹理，双击模式会自动降级为 CSS 立方体贴图；使用 `python -m http.server` 时会启用完整 WebGL 立方体房间和 3D 家具。

## Smoke Test

提交前可运行轻量冒烟检查。脚本会检查核心 JS 语法，并访问前台、主后台、写实样张和写实后台四个入口：

```bash
node scripts/smoke-test.js
```

如果项目已经在本地服务器运行，也可以指定当前地址：

```bash
node scripts/smoke-test.js --base-url=http://localhost:41496/
```

更多说明见 [docs/smoke-test.md](docs/smoke-test.md)。

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

你可以直接替换这六张图。建议每张保持正方形，例如 `2048x2048` 或 `4096x4096`，并尽量使用同一套 cubemap 渲染出的六面图，空间衔接会更自然。

## 开源 3D 模型

项目内置了一组可再分发的 `.glb` 模型，用来替换原先比较粗糙的几何桌椅和书架：

```text
assets/models/kenney-furniture-kit/
```

资源来自 Kenney Furniture Kit 2.0，许可为 Creative Commons Zero, CC0：

```text
https://kenney.nl/assets/furniture-kit
```

当前加载了 Poly Pizza / Quaternius / CreativeTrio / Kenney 的模型，包括书架、桌子、门、窗户、椅子、地毯、边柜和书本。模型摆放配置位于 `script.js` 的 `EXTERNAL_ROOM_MODELS`，可以调整 `src`、`position`、`rotationY`、`scale` 和 `tint` 来替换模型或改变摆放位置。

装饰模型额外放在：

```text
assets/models/poly-pizza-kenney-decor/
```

来源为 Poly Pizza 上的 Kenney CC0 Furniture Kit bundle：

```text
https://poly.pizza/bundle/Furniture-Kit-NoG1sEUD1z
```

当前新增了盆栽、小植物、壁灯、桌灯、圆形地毯和衣帽架；书法卷轴、毛笔架、砚台、陶罐等则由 `script.js` 里的 WebGL 几何生成，避免额外依赖不明来源的模型。

## 自定义接口

长期配置请修改项目根目录的：

```text
room-config.js
```

六面贴图接口：

```js
window.MR_ROOM_CONFIG = {
  textures: {
    front: "assets/cube/wall-wood-front.png",
    back: "assets/cube/wall-wood-back.png",
    left: "assets/cube/wall-wood-left.png",
    right: "assets/cube/wall-wood-right.png",
    ceiling: "assets/cube/ceiling.png",
    floor: "assets/cube/floor.png"
  }
};
```

角色接口：

```js
roles: [
  {
    id: "ai-coach",
    name: "AI 书法教练",
    type: "coach",
    color: "#39b88f",
    position: [-2.7, -3.02, -5.2],
    scale: 1.08,
    view: { yaw: -28, pitch: -6, scale: 1.05 },
    description: "负责讲解结构评分、笔画拆解和实时改进建议。"
  }
]
```

页面右下角的“场景编辑”面板可以直接编辑：

- 六面贴图路径：在输入框里填相对路径，点击“应用”。
- 六面贴图预览：点击“替换”上传本地图片，仅当前页面临时预览。
- 场景角色：点击角色后可编辑名称、类型、颜色、位置、缩放、观察视角和说明。
- 新增角色：点击“新增角色”，填写参数后点“保存角色”。
- 删除角色：选中角色后点“删除角色”。
- 保存配置：点击“保存到本机”，会写入浏览器 localStorage，下次打开网页会自动读取。
- 恢复默认：点击“恢复默认”，回到 `room-config.js` 的配置。

注意：浏览器不能直接把上传的新图片写回项目文件，所以“替换”上传只用于当前预览；需要长期保存贴图时，请把图片放入项目文件夹，在输入框里填写相对路径，再点击“保存到本机”。

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

## 步骤界面图

10 个 MR 学习步骤的参考图默认读取：

```text
assets/scenes/scene-01.png
assets/scenes/scene-02.png
assets/scenes/scene-03.png
assets/scenes/scene-04.png
assets/scenes/scene-05.png
assets/scenes/scene-06.png
assets/scenes/scene-07.png
assets/scenes/scene-08.png
assets/scenes/scene-09.png
assets/scenes/scene-10.png
```

如果你的文件名不同，请打开 `script.js`，修改顶部 `SCENES` 数组里的 `image` 字段。

## 已包含功能

- WebGL 立方体房间，六张图分别贴到房间六面。
- 双击 `index.html` 时自动切换到 CSS 立方体贴图兼容模式。
- `room-config.js` 自定义六面贴图和多个场景角色。
- 页面右下角“场景接口”面板可临时试换贴图、切换角色视角。
- 拖拽旋转视角，滚轮缩放。
- 3D 桌椅、书架、卷轴、桌面纸笔等场景物件。
- 10 个学习步骤配置。
- 左上角当前步骤名称。
- 中间 AI 书法教练面板，可拖动。
- 左侧学习路径，右侧实时反馈。
- 底部 1-10 步骤导航。
- 上一步、下一步、返回首页快捷按钮。
- 键盘左右键切换步骤，数字键 1-0 直达对应步骤。

## 清晰度建议

单张 360° equirectangular 图片铺满全屏时容易被拉伸。现在改用六面 cube 贴图，每一面能保留更多局部细节。想继续提升清晰度时，优先替换 `assets/cube/` 下的六张高分辨率正方形图，不要重新压缩图片。
