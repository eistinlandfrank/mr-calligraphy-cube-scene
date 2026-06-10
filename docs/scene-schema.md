# SceneConfig 数据结构

`SceneConfig` 是前台演示和后台编辑共用的场景配置。后台只修改 JSON，前台按 JSON 渲染胶囊舱、热点、流程和护工数据。

## 顶层字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 场景唯一标识，例如 `capsule-product-showcase` |
| `name` | string | 面向后台和演示控制台的中文名称 |
| `version` | string | 场景数据版本，当前为 `0.1.0` |
| `type` | string | 场景类型：`product-view`、`elder-view`、`caregiver-view`、`calligraphy-game`、`gallery-report` |
| `camera` | object | 初始相机和预设镜头 |
| `environment` | object | 背景、氛围色、雾效和地面色 |
| `objects` | array | 可编辑 3D 对象 |
| `hotspots` | array | 可交互热点 |
| `timeline` | array | 自动演示流程节点 |
| `caregiverData` | object | 护工监护端展示的模拟数据 |

## 关键约束

- `camera.position` 和 `camera.target` 必须是 3 个数字组成的数组。
- 每个 `objects[]` 必须有 `id`、`type`、`name`、`position`、`rotation`、`scale`。
- `objects[].id` 不能重复。
- `material.opacity` 范围是 `0` 到 `1`。
- `hotspots[]` 必须有 `id`、`label`、`position`、`trigger`。
- `timeline[]` 必须有非负 `time` 和 `action`。

校验方法位于 `src/scene-core/sceneSchema.js`：

```js
import { validateSceneConfig } from "../scene-core/sceneSchema.js";

const result = validateSceneConfig(sceneConfig);
```

返回值：

```js
{
  valid: true,
  errors: [],
  warnings: []
}
```
