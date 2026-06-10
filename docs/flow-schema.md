# FlowConfig 数据结构

`FlowConfig` 描述前台体验状态机。它只定义流程结构，不直接保存用户练习数据；练习数据会进入 `PracticeSession`。

## 顶层字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 流程唯一标识，例如 `main-demo-flow` |
| `name` | string | 面向后台和演示控制台的中文名称 |
| `version` | string | 流程数据版本，当前为 `0.1.0` |
| `initialState` | string | 初始状态 ID |
| `states` | array | 状态节点列表 |

## State 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 状态 ID，例如 `practice_game` |
| `title` | string | 状态标题 |
| `description` | string | 状态说明 |
| `actions` | array | 当前状态允许的操作 |
| `next` | string/null | 默认下一状态 |
| `duration` | number | 默认持续秒数，`0` 表示不自动推进 |
| `enterActions` | array | 进入状态时触发的动作 |
| `exitActions` | array | 离开状态时触发的动作 |

## 标准主演示状态

```text
idle
ready_check
enter_experience
immersive_intro
calligraphy_tutorial
practice_game
scoring
report
caregiver_confirm
finished
```

校验方法位于 `src/flow-core/flowSchema.js`：

```js
import { validateFlowConfig } from "../flow-core/flowSchema.js";

const result = validateFlowConfig(flowConfig);
```

返回值：

```js
{
  valid: true,
  errors: [],
  warnings: []
}
```
