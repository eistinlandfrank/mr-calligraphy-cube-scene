# Report 数据结构

`Report` 是一次 `PracticeSession` 的结果摘要，用于前台报告页、护工确认和后续本地记录。报告不替代 session 原始数据，只保存可展示和可索引的评分结果。

## 顶层字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 报告唯一标识 |
| `sessionId` | string | 对应 PracticeSession ID |
| `generatedAt` | string | 报告生成时间，ISO 字符串 |
| `score` | number | 综合分，0 到 100 |
| `metrics` | object | 分项指标 |
| `suggestions` | array | 动态建议列表 |
| `summary` | string | 报告摘要 |

## metrics 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `pathAccuracy` | number | 路径准确度，0 到 100 |
| `strokeOrder` | number | 笔顺完成度，0 到 100 |
| `rhythm` | number | 节奏稳定度，0 到 100 |
| `focus` | number | 专注度，0 到 100 |

校验方法位于 `src/report-core/reportSchema.js`：

```js
import { validateReport } from "../report-core/reportSchema.js";

const result = validateReport(report);
```
