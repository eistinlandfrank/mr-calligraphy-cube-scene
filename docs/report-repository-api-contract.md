# 报告仓库同步合同

日期：2026-06-12  
适用范围：前台学习页 `index.html` 的“站内报告 / 报告仓库”面板。

## 1. 边界

报告仓库同步包接收浏览器本机生成的 `ReportRecord` 和本机 SHA-256 验真摘要。本机 JSON 导出/导入用于同浏览器或跨设备手动备份恢复；远端报告仓库 API 用来验证“报告可被远端保存和拉取”的真实 HTTP 闭环，并保存远端返回的签名回执。当前 mock 服务的签名回执是 HMAC-SHA256 开发验收能力，不是账号化教师端、生产证书签名、不可篡改审计、服务端 PDF 渲染或云端长期报告产品本身。

生产服务端必须重新校验报告包结构，并在账号、教师身份、权限、服务端时间、签名证书和长期审计上做服务端隔离；前端本机校验只能作为提交前保护。

## 2. 本机 JSON 同步包

前台站内报告面板提供“导出同步包”和“导入同步包”：

- `MRAppState.downloadReportRepository()` 会下载 `mr-calligraphy-report-repository-*.json`，并把最近导出时间、报告数和 packageId 写入 `mr-calligraphy-learning-state-v1.reportRepository`。
- `MRAppState.importReportRepositoryPackage()` 会读取同一格式的 JSON 包，新增本机不存在的报告；遇到同 ID 差异报告时不覆盖本机记录，而是写入冲突审计。
- `MRAppState.getReportRepositoryReceiptAudit()` 会读取最近签名回执审计；`downloadReportRepositoryReceiptAudit()` 会导出 `mr-calligraphy-report-repository-receipts-*.html`。
- 导入成功后刷新站内报告面板和学习状态摘要；导入错文件、空包或格式错误会返回明确失败提示。

## 3. Endpoint

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

## 4. 报告仓库包

本机 JSON 文件和远端 `PUT` body 共用同一顶层字段：

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

## 5. 成功响应

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
    "warningCount": 0,
    "warnings": [],
    "receiptDigest": "64位sha256",
    "signatureAlgorithm": "HMAC-SHA256",
    "signingKeyId": "report-repository-mock-hmac-v1",
    "signedFields": [
      "receiptKind",
      "remoteVersion",
      "packageId",
      "sourcePackageId",
      "repositoryDigest",
      "acceptedAt",
      "reportCount",
      "warningCount",
      "warnings",
      "receiptDigest"
    ],
    "signature": "64位hmac-sha256"
  }
}
```

前端 adapter 当前会读取 `message`、`package.packageId`、`package.summary`、`package.reports`、`package.verifications` 和可选 `receipt/latestReceipt`。如果回执包含 `receiptKind`、`repositoryDigest`、`receiptDigest`、`signatureAlgorithm`、`signingKeyId` 和 64 位 `signature`，前端会把它规范化保存到 `mr-calligraphy-learning-state-v1.reportRepository.lastSignedReceipt`，同时写入 `reportRepository.signedReceipts` 最近 12 条审计列表，并在报告仓库摘要和签名回执审计区提示最近回执。

## 6. 同 ID 差异策略

当前前端第一版不会在拉取时静默覆盖同 ID 但内容不同的本机报告。处理规则：

- 远端报告 ID 本机不存在：新增。
- 远端报告 ID 本机存在且内容相同：跳过。
- 远端报告 ID 本机存在但内容不同：跳过并记录 `lastSkippedConflictCount` 和 `lastConflictReports`。

`lastConflictReports` 会保存本机/远端标题、更新时间、字段差异摘要和远端报告快照。前台站内报告面板会显示“报告仓库冲突审计”，用户可以按字段选择保留本机或采用远端、把远端冲突报告另存为本机副本，或忽略该条审计。本机原报告不会被静默覆盖，只有用户明确选择的远端字段才会写回同 ID 本机报告。

后续账号化服务端应提供报告版本号、服务端字段级 merge、教师批注审计、服务端签名和用户确认入口。

## 7. 失败响应

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

## 8. 本机 mock 服务

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
- 返回 `mr-calligraphy-report-repository-receipt-v1` 回执，并用 `HMAC-SHA256` 生成 `signature`。
- 可通过 `REPORT_REPOSITORY_MOCK_SIGNING_SECRET` 和 `REPORT_REPOSITORY_MOCK_SIGNING_KEY_ID` 替换本机签名 secret 和 key id。
- 校验 Bearer token。
- 支持 `GET` 拉取最近报告包。

## 9. 本地验收

```bash
node scripts/learning-state-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
npm run test:e2e -- --grep "front practice saves real strokes"
```

验收重点：

- `MRAppState.getReportRepositoryPackage()` 生成报告包和验真摘要。
- `MRAppState.downloadReportRepository()` 会触发浏览器下载，页面显示最近导出报告数。
- 站内报告面板“导入同步包”会通过文件选择器导入 JSON 包，并写入本机 `reports` 与 `reportRepository` 状态。
- `configureReportRepositoryRemote()` 持久化 endpoint/token。
- 检查、推送和拉取都是真实 `fetch`，并携带 Bearer header。
- 推送后 mock server 返回签名回执，前端保存到 `lastSignedReceipt` 和 `signedReceipts`；再次 GET 检查或拉取时会保留最近签名回执。
- 站内报告面板“导出回执”会下载包含签名、仓库摘要、receipt 摘要、方向、endpoint 和原始回执 JSON 的 HTML 审计页。
- 拉取同 ID 差异报告时不静默覆盖本机报告，而是生成本机冲突审计并支持字段级合并或远端副本另存。
