# PracticeSession 数据结构

`PracticeSession` 记录一次老人端体验过程。它会连接 `FlowConfig` 的当前状态、书法练习轨迹、事件流水和护工操作，为后续评分与报告生成提供数据来源。

## 顶层字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | session 唯一标识 |
| `flowId` | string | 对应 FlowConfig ID |
| `startedAt` | string | 开始时间，ISO 字符串 |
| `endedAt` | string/null | 结束时间，未结束时为 `null` |
| `currentState` | string | 当前流程状态 ID |
| `status` | string | `active`、`paused`、`completed`、`cancelled` |
| `elderProfile` | object/null | 老人模拟档案或后续真实档案引用 |
| `events` | array | 状态变化、输入、评分和报告事件 |
| `practiceData` | object | 书法练习数据 |
| `caregiverActions` | array | 护工端操作记录 |

## practiceData 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `character` | string | 当前练习字 |
| `startedAt` | string/null | 练习开始时间 |
| `completedAt` | string/null | 练习完成时间 |
| `strokes` | array | 每一笔轨迹、偏差、耗时和完成状态 |
| `rewriteCount` | number | 重写次数 |
| `interruptionCount` | number | 暂停、中断或求助次数 |

校验方法位于 `src/session-core/sessionSchema.js`：

```js
import { validatePracticeSession } from "../session-core/sessionSchema.js";

const result = validatePracticeSession(session);
```
