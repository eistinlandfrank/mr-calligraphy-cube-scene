# 远端报告仓库 API 合同

日期：2026-06-12  
适用范围：前台学习页 `index.html` 的“站内报告 / 远端报告 API”面板。

## 1. 边界

远端报告仓库 API 接收浏览器本机生成的 `ReportRecord` 和本机 SHA-256 验真摘要，用来验证“报告可被远端保存和拉取”的真实 HTTP 闭环。它不是账号化教师端、服务端签名、不可篡改审计、服务端 PDF 渲染或云端长期报告产品本身。

生产服务端必须重新校验报告包结构，并在账号、教师身份、权限、服务端时间、签名证书和长期审计上做服务端隔离；前端本机校验只能作为提交前保护。

## 2. Endpoint

前台允许用户配置一个 HTTP/HTTPS endpoint。当前 adapter 会使用同一个 endpoint：

| 方法 | 用途 | 请求体 |
| --- | --- | --- |
| `GET` | 检查服务可访问性，并拉取最近报告包 | 无 |
| `PUT` | 推送当前本机报告仓库包 | `mr-calligraphy-report-repository-v1` |
| `OPTIONS` | 浏览器跨端口预检 | 无 |

如配置 token，请求会携带：

```http
Authorization: Bearer <token>
```

## 3. 报告仓库包

`PUT` body 顶层字段：

| 字段 | 说明 |
| --- | --- |
| `kind` | 固定为 `mr-calligraphy-report-repository-v1` |
| `version` | 当前为 `1` |
| `packageId` | 本机生成的提交 ID |
| `exportedAt` | 本机生成时间 |
| `storageKey` | 本机学习状态来源 key |
| `source` | 当前同步模式和能力边界 |
| `summary` | 报告数、带教师批注报告数、带验真摘要报告数和平均分 |
| `reports` | 本机报告数组，可包含 `teacherReview` 本机教师批注 |
| `verifications` | 每份报告对应的本机 SHA-256 摘要数组 |

服务端应至少校验：

- `kind`、`version`、`packageId`、`exportedAt` 和 `storageKey`。
- `reports` 必须是数组，报告记录必须包含 `id`、`createdAt` 和 `averageScore`。
- `verifications` 必须是数组，摘要应为 64 位十六进制 SHA-256。
- `summary.total` 应与报告数量一致，`summary.verifiedReportCount` 应与摘要数量一致。

## 4. 成功响应

成功响应建议返回：

```json
{
  "ok": true,
  "message": "远端报告仓库已接收 3 份报告。",
  "packageId": "remote-report-package-id",
  "repositoryDigest": "64位sha256",
  "remoteVersion": "remote-v1",
  "package": {
    "kind": "mr-calligraphy-report-repository-v1",
    "version": 1,
    "packageId": "remote-report-package-id",
    "summary": {
      "total": 3,
      "teacherReviewedReportCount": 1,
      "verifiedReportCount": 3
    },
    "reports": [],
    "verifications": []
  },
  "receipt": {
    "receiptKind": "mr-calligraphy-report-repository-receipt-v1",
    "packageId": "remote-report-package-id",
    "sourcePackageId": "local-report-package-id",
    "repositoryDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:00:00.000Z",
    "reportCount": 3,
    "receiptDigest": "64位sha256"
  }
}
```

前端 adapter 当前会读取 `message`、`package.packageId`、`package.summary`、`package.reports`、`package.verifications` 和可选 `receipt`，并把远端报告数量、最近 packageId、同步方向、跳过冲突数量和远端状态写回 `mr-calligraphy-learning-state-v1.reportRepository`。

## 5. 同 ID 差异策略

当前前端第一版不会在拉取时静默覆盖同 ID 但内容不同的本机报告。处理规则：

- 远端报告 ID 本机不存在：新增。
- 远端报告 ID 本机存在且内容相同：跳过。
- 远端报告 ID 本机存在但内容不同：跳过并记录 `lastSkippedConflictCount` 和 `lastConflictReports`。

`lastConflictReports` 会保存本机/远端标题、更新时间、字段差异摘要和远端报告快照。前台站内报告面板会显示“报告仓库冲突审计”，用户可以按字段选择保留本机或采用远端、把远端冲突报告另存为本机副本，或忽略该条审计。本机原报告不会被静默覆盖，只有用户明确选择的远端字段才会写回同 ID 本机报告。

后续账号化服务端应提供报告版本号、服务端字段级 merge、教师批注审计、服务端签名和用户确认入口。

## 6. 失败响应

失败响应建议返回：

```json
{
  "ok": false,
  "message": "报告仓库包校验失败：缺少 reports 数组。",
  "errors": ["缺少 reports 数组"],
  "warnings": []
}
```

推荐状态码：

| 状态码 | 场景 |
| --- | --- |
| `401` | token 缺失或不匹配 |
| `404` | endpoint 路径不匹配 |
| `405` | 方法不支持 |
| `422` | 报告包结构校验失败 |
| `500` | 服务端内部错误 |

## 7. 本机 mock 服务

启动 mock server：

```bash
node scripts/report-repository-mock-server.js
```

指定端口和 token：

```bash
REPORT_REPOSITORY_MOCK_PORT=8791 REPORT_REPOSITORY_MOCK_TOKEN=test-token node scripts/report-repository-mock-server.js
```

然后在前台站内报告面板填入：

```text
http://127.0.0.1:8791/api/report-repository
```

mock 服务会：

- 校验报告包 `kind`、`version`、`summary`、`reports` 和 `verifications`。
- 保存最近一次报告仓库包。
- 返回 `mr-calligraphy-report-repository-receipt-v1` 回执。
- 校验 Bearer token。
- 支持 `GET` 拉取最近报告包。

## 8. 本地验收

```bash
node scripts/learning-state-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
npm run test:e2e -- --grep "front practice saves real strokes"
```

验收重点：

- `MRAppState.getReportRepositoryPackage()` 生成报告包和验真摘要。
- `configureReportRepositoryRemote()` 持久化 endpoint/token。
- 检查、推送和拉取都是真实 `fetch`，并携带 Bearer header。
- 拉取同 ID 差异报告时不静默覆盖本机报告，而是生成本机冲突审计并支持字段级合并或远端副本另存。
