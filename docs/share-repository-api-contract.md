# 远端作品分享 API 合同

日期：2026-06-12  
适用范围：前台学习页 `index.html` 的“作品复盘 / 远端分享 API”面板。

## 1. 边界

远端作品分享 API 接收的是浏览器本机生成的作品分享包，用来验证公开链接发布的真实 HTTP 闭环。它会把当前作品分享 HTML、分享记录和摘要发送到用户配置的 endpoint，并携带 Workspace 空间 ID 保存远端返回的 `publicUrl` 与回执；前端会重算发布/撤销回执的 `receiptDigest`，用于确认回执声明字段是否自洽、workspace 是否匹配当前空间。

它仍不是内置账号系统、微信分享、班级作品墙、生产 CDN 或权限服务。生产服务端必须自己处理账号、空间、权限、撤销、访问统计、CDN 缓存和审计链。

## 2. Endpoint

前台允许用户配置一个 HTTP/HTTPS endpoint。当前 adapter 会使用同一个 endpoint：

| 方法 | 用途 | 请求体 |
| --- | --- | --- |
| `GET` | 检查服务可访问性，并读取最近分享包 | 无 |
| `PUT` | 发布当前有效分享链接对应的分享包 | `mr-calligraphy-share-repository-v1` |
| `DELETE` | 撤销某条远端分享链接 | `mr-calligraphy-share-repository-revoke-v1` |
| `OPTIONS` | 浏览器跨端口预检 | 无 |

如配置 token，请求会携带：

```http
Authorization: Bearer <token>
```

如配置 Workspace，请求会携带；未填写时使用 `local-browser`：

```http
X-MR-Workspace-Id: <workspaceId>
```

## 3. 分享仓库包

`PUT` body 顶层字段：

| 字段 | 说明 |
| --- | --- |
| `kind` | 固定为 `mr-calligraphy-share-repository-v1` |
| `version` | 当前为 `1` |
| `packageId` | 本机生成的提交 ID |
| `workspaceId` | 当前远端分享空间，需与 `X-MR-Workspace-Id` 一致 |
| `exportedAt` | 本机生成时间 |
| `storageKey` | 本机学习状态来源 key |
| `summary` | 分享数量、分享 ID、作品 ID、HTML 大小和截图状态 |
| `records` | 本机分享记录，包含创建、过期、撤销、复制和访问状态 |
| `shares` | 可发布的分享内容，包含作品分享数据、HTML、文件名和摘要 |

服务端应至少校验：

- `kind`、`version`、`packageId`、`exportedAt` 和 `storageKey`。
- `workspaceId` 应与请求头 `X-MR-Workspace-Id` 一致。
- `records` 必须是非空数组，每条记录必须包含 `id` 和 `artworkId`。
- `shares` 必须是非空数组，每条内容必须包含 `shareId`、`artworkId`、`share` 和 `html`。
- 服务端应重新计算 HTML 或内容摘要，不应信任前端摘要。

## 4. 成功响应

成功响应建议返回：

```json
{
  "ok": true,
  "message": "远端分享已接收 1 条分享记录。",
  "workspaceId": "local-browser",
  "packageId": "remote-share-package-id",
  "repositoryDigest": "64位sha256",
  "publicUrl": "https://example.com/share/share-id.html",
  "remoteVersion": "remote-v1",
  "package": {
    "kind": "mr-calligraphy-share-repository-v1",
    "version": 1,
    "workspaceId": "local-browser",
    "packageId": "remote-share-package-id",
    "records": [],
    "shares": []
  },
  "receipt": {
    "receiptKind": "mr-calligraphy-share-repository-receipt-v1",
    "packageId": "remote-share-package-id",
    "sourcePackageId": "local-share-package-id",
    "workspaceId": "local-browser",
    "shareId": "share-id",
    "artworkId": "artwork-id",
    "repositoryDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:00:00.000Z",
    "publicUrl": "https://example.com/share/share-id.html",
    "shareCount": 1,
    "htmlBytes": 12345,
    "receiptDigest": "64位sha256"
  }
}
```

前端 adapter 当前会读取 `message`、`workspaceId`、`publicUrl`、`package.packageId`、`receipt` 和 `latestReceipt`，并把当前空间、最近远端状态、最近 `publicUrl`、最近 packageId、最近回执和最近 12 条回执写回 `mr-calligraphy-learning-state-v1.shareService`。

前端只会保存字段完整的 `mr-calligraphy-share-repository-receipt-v1`：

- `repositoryDigest` 和 `receiptDigest` 必须是 64 位十六进制摘要。
- 回执会保留 `workspaceId`，回执审计 HTML 会显示当前空间。
- `publicUrl` 必须是 HTTP/HTTPS URL。
- 回执会补充本机收到方向、endpoint 和收到时间。
- 回执会补充 `verificationStatus`、`verificationMessage`、`verificationDigest`、`verificationExpectedDigest`、`verificationWorkspaceStatus` 和 `verificationAction`，用于页面和审计导出显示本机一致性校验结果。
- 当前回执保存在本机状态中，不是服务端不可篡改日志。

## 5. 本机一致性校验

前端收到发布回执后，会使用稳定 JSON 重新计算：

```json
{
  "sourcePackageId": "<receipt.sourcePackageId>",
  "workspaceId": "<receipt.workspaceId>",
  "repositoryDigest": "<receipt.repositoryDigest>",
  "publicUrl": "<receipt.publicUrl>",
  "acceptedAt": "<receipt.acceptedAt>"
}
```

前端收到撤销回执后，会使用稳定 JSON 重新计算：

```json
{
  "action": "revoke",
  "sourcePackageId": "<receipt.sourcePackageId>",
  "workspaceId": "<receipt.workspaceId>",
  "shareId": "<receipt.shareId>",
  "repositoryDigest": "<receipt.repositoryDigest>",
  "publicUrl": "<receipt.publicUrl>",
  "acceptedAt": "<receipt.acceptedAt>"
}
```

重算结果必须等于 `receipt.receiptDigest`。同时，回执里的 `workspaceId` 必须匹配当前远端分享配置的 Workspace。

校验结果：

| 状态 | 说明 |
| --- | --- |
| `verified` | `receiptDigest` 与发布/撤销声明字段一致，且 Workspace 匹配当前空间 |
| `workspace-mismatch` | `receiptDigest` 自洽，但回执空间不是当前空间 |
| `digest-mismatch` | `receiptDigest` 无法按声明字段重算匹配，回执可能损坏或被篡改 |

这个校验只能证明作品分享回执字段自洽和空间匹配，不能替代生产 HMAC 私钥验签、公钥验签、证书链、账号权限、公开链接权限或服务端不可篡改审计。

## 6. 失败响应

失败响应建议返回：

```json
{
  "ok": false,
  "message": "分享仓库包校验失败：缺少 shares 数组。",
  "errors": ["缺少 shares 数组"],
  "warnings": []
}
```

推荐状态码：

| 状态码 | 场景 |
| --- | --- |
| `401` | token 缺失或不匹配 |
| `404` | endpoint 路径不匹配 |
| `405` | 方法不支持 |
| `422` | 分享包结构校验失败 |
| `500` | 服务端内部错误 |

## 7. 本机 mock 服务

启动 mock server：

```bash
node scripts/share-repository-mock-server.js
```

指定端口和 token：

```bash
SHARE_REPOSITORY_MOCK_PORT=8791 SHARE_REPOSITORY_MOCK_TOKEN=test-token node scripts/share-repository-mock-server.js
```

然后在前台复盘区“远端分享 API”填入：

```text
http://127.0.0.1:8791/api/share-repository
```

可选填写 Workspace，例如 `share-alpha`。未填写时默认为 `local-browser`。

mock 服务会：

- `GET` 读取 `X-MR-Workspace-Id` 或 `?workspaceId=`，返回当前空间的合同、远端版本、最近一次保存的分享包和最近回执。
- `PUT` 校验 `mr-calligraphy-share-repository-v1` 结构和 `workspaceId`，并按 workspace 保存到内存。
- `DELETE` 校验 `mr-calligraphy-share-repository-revoke-v1` 撤销请求和 `workspaceId`，只把当前空间最近包里的对应记录标记为远端撤销，并返回撤销回执。
- 支持浏览器跨端口 `OPTIONS` 预检。
- 校验可选 Bearer token。
- 返回 `mr-calligraphy-share-repository-receipt-v1` 回执、`repositoryDigest`、`publicUrl` 和可被前端重算匹配的 `receiptDigest`。

## 8. 远端撤销请求

前端点击“撤销远端”时，会向同一 endpoint 发送：

```json
{
  "kind": "mr-calligraphy-share-repository-revoke-v1",
  "version": 1,
  "storageKey": "mr-calligraphy-learning-state-v1",
  "workspaceId": "local-browser",
  "shareId": "share-...",
  "artworkId": "artwork-...",
  "title": "永字作品",
  "packageId": "mock-share-repository-...",
  "publicUrl": "https://share.example.test/share-....html",
  "receiptDigest": "64 hex chars",
  "requestedAt": "2026-06-12T00:00:00.000Z",
  "reason": "local-user-revoked-remote-share"
}
```

服务端应至少校验 `kind`、`shareId`、`workspaceId`、账号/空间权限、目标 URL 是否属于当前用户空间，以及该分享是否已经撤销。成功后建议返回同一个 `mr-calligraphy-share-repository-receipt-v1` kind，前端会把本机方向补充为 `revoke`，并写入 `ShareRecord.remoteWorkspaceId`、`ShareRecord.remoteRevokedAt` 和 `remoteRevokeReceiptDigest`。

为兼容部分服务端、网关或代理对 `DELETE` body 支持不稳定的情况，前端会同时把 `shareId`、`packageId`、`publicUrl`、`workspaceId` 附加在查询参数里；生产服务端应优先读取 JSON body，并把查询参数作为兜底输入。

当前 mock 服务会按 workspace 把撤销动作写入内存 `revokedShares`，并在当前空间最近包的对应 `records[*]` 上标记 `remoteRevokedAt`。生产服务端仍需要实现真正的 URL 失效、CDN purge、访问权限更新和不可篡改撤销审计。

## 9. 回执审计导出

前台复盘区“远端分享 API”会显示最近作品分享远端回执，并提供“导出回执”按钮。

导出内容来自 `mr-calligraphy-learning-state-v1.shareService.receipts`，不是临时页面状态。导出的 HTML 会包含：

- `mr-calligraphy-share-repository-receipt-audit-v1` 审计来源。
- 每条回执的方向（检查、发布、撤销）、Workspace、分享数量、`shareId`、`artworkId`、`publicUrl`、HTML 字节数、`repositoryDigest`、`receiptDigest`、本机校验结果、校验说明、重算摘要、远端版本、endpoint、接收时间和原始 JSON。
- 当前远端 adapter 边界说明：它是真实 HTTP 回执记录，但不是生产不可篡改审计、账号权限或 CDN 日志。

没有任何远端回执时，导出 API 会返回失败状态，不生成空审计文件。

## 10. 验收

脚本验收：

```bash
node scripts/learning-state-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
```

浏览器验收：

```bash
npm run test:e2e -- --grep "front practice saves real strokes and exports a report"
```

`learning-state-check.js` 会启动临时 mock server，用真实 HTTP `GET` / `PUT` / `DELETE` 验证 endpoint、Bearer token、Workspace header、分享包 `workspaceId`、mock server 按空间隔离最近分享包、publicUrl、发布回执、撤销回执、回执本机一致性校验、篡改回执摘要不匹配、回执审计导出和错误 token 拒绝。
