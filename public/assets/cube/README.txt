这里放置 WebGL 立方体房间的六面贴图。

默认文件名：

wall-wood-front.png
wall-wood-back.png
wall-wood-left.png
wall-wood-right.png
ceiling.png
floor.png

建议：
1. 每张图使用正方形尺寸，例如 2048x2048 或 4096x4096。
2. 四张 wall-wood-*.png 当前使用从天花板木纹提取的深色木板材质；替换时也建议只放墙纸、墙面、木板、石材等平面材质，不要包含房顶、地板、家具或强透视室内场景。
3. ceiling.png 和 floor.png 分别只放天花板、地板材质。
4. 六张图最好来自同一套材质风格，边缘衔接会更自然。
5. 不要压缩图片，浏览器会按原图读取。

如果你想使用不同文件名，请修改项目根目录 room-config.js 中的 textures 配置。
