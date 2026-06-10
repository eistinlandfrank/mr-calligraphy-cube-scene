这里存放本项目使用的开源 3D 模型资源。

当前使用：

Poly Pizza CC0 models
来源：https://poly.pizza
许可：Creative Commons Zero, CC0

- bookshelf-creative-trio.glb
- table-creative-trio.glb
- door-quaternius.glb
- japanese-door-quaternius.glb

Kenney Furniture Kit 2.0
来源：https://kenney.nl/assets/furniture-kit
许可：Creative Commons Zero, CC0

已放入 assets/models/kenney-furniture-kit/ 的模型包括：

- bookcaseOpen.glb
- bookcaseClosedDoors.glb
- tableCross.glb
- chair.glb
- doorwayOpen.glb
- wallWindow.glb
- lampRoundTable.glb
- rugRectangle.glb
- sideTableDrawers.glb
- books.glb

Poly Pizza / Kenney CC0 decor
来源：https://poly.pizza/bundle/Furniture-Kit-NoG1sEUD1z
许可：Creative Commons Zero, CC0

已放入 assets/models/poly-pizza-kenney-decor/ 的装饰模型包括：

- potted-plant-kenney.glb
- plant-small-kenney.glb
- lamp-wall-kenney.glb
- lamp-square-table-kenney.glb
- rug-round-kenney.glb
- coat-rack-standing-kenney.glb

实际摆放到房间内的模型由 script.js 中的 EXTERNAL_ROOM_MODELS 配置决定。当前版本加载门窗、书架、桌椅、地毯、边柜、书本、盆栽、壁灯、桌灯和衣帽架，并额外用 WebGL 几何生成卷轴、毛笔架、砚台、陶罐等书法主题装饰。
要替换或新增模型，可以把 .glb 文件放入本目录，然后在 EXTERNAL_ROOM_MODELS 中配置 src、position、rotationY、scale 和 tint。
