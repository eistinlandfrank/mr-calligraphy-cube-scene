这里放置 WebGL 立方体房间的六面贴图。

默认文件名：

wall-front.png
wall-back.png
wall-left.png
wall-right.png
ceiling.png
floor.png

建议：
1. 每张图使用正方形尺寸，例如 2048x2048 或 4096x4096。
2. 六张图最好来自同一套 cubemap 渲染，边缘衔接会更自然。
3. 不要压缩图片，浏览器会按原图读取。

如果你想使用不同文件名，请修改项目根目录 room-config.js 中的 textures 配置。
