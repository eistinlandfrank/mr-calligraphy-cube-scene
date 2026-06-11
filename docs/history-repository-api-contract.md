# 远端学习档案仓库 API 合同

日期：2026-06-12  
适用范围：前台学习页 `index.html` 的“学习档案 / 远端学习档案 API”面板。

## 1. 边界

远端学习档案仓库 API 接收浏览器本机的练习、作品和报告记录，用来验证学习档案跨设备同步的真实 HTTP 闭环。前端拉取时会按响应里的 `nextPageUrl` 追取分页，但它不是账号系统、公开作品墙、教师批注、生产级分页查询或长期归档服务本身。

生产服务端必须重新校验档案包结构，并在账号、空间、权限、数据版本和分页查询上做服务端隔离；前端本机校验只能作为提交前保护。

## 2. Endpoint

前台允许用户配置一个 HTTP/HTTPS endpoint。当前 adapter 会使用同一个 endpoint：

| 方法 | 用途 | 请求体 |
| --- | --- | --- |
| `GET` | 检查服务可访问性，并拉取最近档案包 | 无 |
| `PUT` | 推送当前本机学习档案包 | `mr-calligraphy-history-repository-v1` |
| `OPTIONS` | 浏览器跨端口预检 | 无 |

如配置 token，请求会携带：

```http
Authorization: Bearer <token>
```

## 3. 学习档案包

`PUT` body 顶层字段：

| 字段 | 说明 |
| --- | --- |
| `kind` | 固定为 `mr-calligraphy-history-repository-v1` |
| `version` | 当前为 `1` |
| `packageId` | 本机生成的提交 ID |
| `exportedAt` | 本机生成时间 |
| `storageKey` | 本机学习状态来源 key |
| `source` | 当前同步模式和边界说明 |
| `summary` | 记录数量、练习数、作品数、报告数、带教师批注报告数和平均分 |
| `records.sessions` | 练习记录数组 |
| `records.artworks` | 作品记录数组 |
| `records.reports` | 报告记录数组；报告可包含 `teacherReview` 本机教师批注 |
| `history` | 用于展示的档案详情快照 |

服务端应至少校验：

- `kind`、`version`、`packageId`、`exportedAt` 和 `storageKey`。
- `records.sessions`、`records.artworks` 和 `records.reports` 必须是数组。
- 练习记录必须包含 `id`、`glyph` 和 `startedAt`。
- 作品记录必须包含 `id`、`title` 和 `createdAt`。
- 报告记录必须包含 `id` 和 `createdAt`。

## 4. 成功响应

成功响应建议返回：

```json
{
  "ok": true,
  "message": "远端学习档案仓库已接收 9 条记录。",
  "packageId": "remote-history-package-id",
  "repositoryDigest": "64位sha256",
  "remoteVersion": "remote-v1",
  "package": {
    "kind": "mr-calligraphy-history-repository-v1",
    "version": 1,
    "packageId": "remote-history-package-id",
    "summary": {
      "total": 9,
      "practiceCount": 3,
      "artworkCount": 3,
      "reportCount": 3,
      "teacherReviewedReportCount": 1
    },
    "records": {
      "sessions": [],
      "artworks": [],
      "reports": []
    }
  },
  "receipt": {
    "receiptKind": "mr-calligraphy-history-repository-receipt-v1",
    "packageId": "remote-history-package-id",
    "sourcePackageId": "local-history-package-id",
    "repositoryDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:00:00.000Z",
    "recordCount": 9,
    "receiptDigest": "64位sha256"
  }
}
```

前端 adapter 当前会读取 `message`、`package.packageId`、`package.summary`、`package.records` 和可选 `pagination`，并把远端记录数量、最近 packageId、同步方向、跳过冲突数量和远端状态写回 `mr-calligraphy-learning-state-v1.historyRepository`。报告里的 `teacherReview` 会随 `records.reports` 同步；`summary.teacherReviewedReportCount` 用于快速确认远端包里有多少份报告带本机教师批注。

## 4.1 分页响应

如果服务端返回分页包，可在响应中附加：

```json
{
  "ok": true,
  "message": "远端学习档案返回第 1 页。",
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 128,
    "hasMore": true,
    "nextPageUrl": "/api/history-repository?page=2"
  },
  "package": {
    "kind": "mr-calligraphy-history-repository-v1",
    "records": {
      "sessions": [],
      "artworks": [],
      "reports": []
    }
  }
}
```

当前前端拉取时会从初始 endpoint 开始，沿 `pagination.nextPageUrl` 或顶层 `nextPageUrl` 自动请求后续页面，最多追取 20 页，并用已访问 URL 防止分页循环。检查远端时只展示当前响应状态，不会导入后续页。生产服务端分页仍需要账号、游标、超时重试、服务端查询隔离和完整审计策略。

## 5. 同 ID 差异策略

当前前端第一版不会在拉取时静默覆盖同 ID 但内容不同的本机记录。处理规则：

- 远端记录 ID 本机不存在：新增。
- 远端记录 ID 本机存在且内容相同：跳过。
- 远端记录 ID 本机存在但内容不同：跳过并记录 `lastSkippedConflictCount`。

后续账号化服务端应提供字段级 merge、版本号、冲突审计和用户确认入口。

## 6. 失败响应

失败响应建议返回：

```json
{
  "ok": false,
  "message": "学习档案仓库包校验失败：缺少 records 对象。",
  "errors": ["缺少 records 对象"],
  "warnings": []
}
```

推荐状态码：

| 状态码 | 场景 |
| --- | --- |
| `401` | token 缺失或不匹配 |
| `404` | endpoint 路径不匹配 |
| `405` | 方法不支持 |
| `422` | 档案包结构校验失败 |
| `500` | 服务端内部错误 |

## 7. 本机 mock 服务

启动 mock server：

```bash
node scripts/history-repository-mock-server.js
```

指定端口和 token：

```bash
HISTORY_REPOSITORY_MOCK_PORT=8789 HISTORY_REPOSITORY_MOCK_TOKEN=test-token node scripts/history-repository-mock-server.js
```

然后在前台学习档案面板填入：

```text
http://127.0.0.1:8789/api/history-repository
```

mock 服务会：

- `GET` 返回合同、远端版本和最近一次保存的学习档案包。
- `PUT` 校验 `mr-calligraphy-history-repository-v1` 结构并保存到内存。
- 支持浏览器跨端口 `OPTIONS` 预检。
- 校验可选 Bearer token。
- 返回 `mr-calligraphy-history-repository-receipt-v1` 回执和 `repositoryDigest`。

## 8. 验收

脚本验收：

```bash
node scripts/learning-state-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
```

`learning-state-check.js` 会启动临时 mock server，用真实 HTTP `GET` / `PUT` 验证 endpoint、Bearer token、学习档案仓库回执、拉取最近档案包、同 ID 差异跳过和错误 token 拒绝。浏览器级 E2E 会额外模拟分页响应，验证前端拉取会继续请求 `nextPageUrl` 并合并后续页。
