# 远端作品分享 API 合同

日期：2026-06-12  
适用范围：前台学习页 `index.html` 的“作品复盘 / 远端分享 API”面板。

## 1. 边界

远端作品分享 API 接收的是浏览器本机生成的作品分享包，用来验证公开链接发布的真实 HTTP 闭环。它会把当前作品分享 HTML、分享记录和摘要发送到用户配置的 endpoint，并保存远端返回的 `publicUrl` 与回执。

它仍不是内置账号系统、微信分享、班级作品墙、生产 CDN 或权限服务。生产服务端必须自己处理账号、空间、权限、撤销、访问统计、CDN 缓存和审计链。

## 2. Endpoint

前台允许用户配置一个 HTTP/HTTPS endpoint。当前 adapter 会使用同一个 endpoint：

| 方法 | 用途 | 请求体 |
| --- | --- | --- |
| `GET` | 检查服务可访问性，并读取最近分享包 | 无 |
| `PUT` | 发布当前有效分享链接对应的分享包 | `mr-calligraphy-share-repository-v1` |
| `OPTIONS` | 浏览器跨端口预检 | 无 |

如配置 token，请求会携带：

```http
Authorization: Bearer <token>
```

## 3. 分享仓库包

`PUT` body 顶层字段：

| 字段 | 说明 |
| --- | --- |
| `kind` | 固定为 `mr-calligraphy-share-repository-v1` |
| `version` | 当前为 `1` |
| `packageId` | 本机生成的提交 ID |
| `exportedAt` | 本机生成时间 |
| `storageKey` | 本机学习状态来源 key |
| `summary` | 分享数量、分享 ID、作品 ID、HTML 大小和截图状态 |
| `records` | 本机分享记录，包含创建、过期、撤销、复制和访问状态 |
| `shares` | 可发布的分享内容，包含作品分享数据、HTML、文件名和摘要 |

服务端应至少校验：

- `kind`、`version`、`packageId`、`exportedAt` 和 `storageKey`。
- `records` 必须是非空数组，每条记录必须包含 `id` 和 `artworkId`。
- `shares` 必须是非空数组，每条内容必须包含 `shareId`、`artworkId`、`share` 和 `html`。
- 服务端应重新计算 HTML 或内容摘要，不应信任前端摘要。

## 4. 成功响应

成功响应建议返回：

```json
{
  "ok": true,
  "message": "远端分享已接收 1 条分享记录。",
  "packageId": "remote-share-package-id",
  "repositoryDigest": "64位sha256",
  "publicUrl": "https://example.com/share/share-id.html",
  "remoteVersion": "remote-v1",
  "package": {
    "kind": "mr-calligraphy-share-repository-v1",
    "version": 1,
    "packageId": "remote-share-package-id",
    "records": [],
    "shares": []
  },
  "receipt": {
    "receiptKind": "mr-calligraphy-share-repository-receipt-v1",
    "packageId": "remote-share-package-id",
    "sourcePackageId": "local-share-package-id",
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

前端 adapter 当前会读取 `message`、`publicUrl`、`package.packageId`、`receipt` 和 `latestReceipt`，并把最近远端状态、最近 `publicUrl`、最近 packageId、最近回执和最近 12 条回执写回 `mr-calligraphy-learning-state-v1.shareService`。

前端只会保存字段完整的 `mr-calligraphy-share-repository-receipt-v1`：

- `repositoryDigest` 和 `receiptDigest` 必须是 64 位十六进制摘要。
- `publicUrl` 必须是 HTTP/HTTPS URL。
- 回执会补充本机收到方向、endpoint 和收到时间。
- 当前回执保存在本机状态中，不是服务端不可篡改日志。

## 5. 失败响应

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

## 6. 本机 mock 服务

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

mock 服务会：

- `GET` 返回合同、远端版本、最近一次保存的分享包和最近回执。
- `PUT` 校验 `mr-calligraphy-share-repository-v1` 结构并保存到内存。
- 支持浏览器跨端口 `OPTIONS` 预检。
- 校验可选 Bearer token。
- 返回 `mr-calligraphy-share-repository-receipt-v1` 回执、`repositoryDigest` 和 `publicUrl`。

## 7. 验收

脚本验收：

```bash
node scripts/learning-state-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
```

浏览器验收：

```bash
npm run test:e2e -- --grep "front practice saves real strokes and exports a report"
```

`learning-state-check.js` 会启动临时 mock server，用真实 HTTP `GET` / `PUT` 验证 endpoint、Bearer token、分享包、publicUrl、回执和错误 token 拒绝。
