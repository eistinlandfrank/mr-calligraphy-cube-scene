# 远端发布 API 合同

日期：2026-06-12  
适用范围：主后台 `main-admin.html` 和写实后台 `realistic-admin.html` 的“远端发布 API”面板。

## 1. 边界

远端发布 API 接收的是当前浏览器已经本机发布并通过本机审核的发布包。它不是账号系统、CDN 上传、远端审批或公开托管本身。

生产服务端必须重新校验发布包摘要、资产清单和发布锁；前端本机预检只能作为提交前保护。

## 2. Endpoint

后台页面允许用户配置一个 HTTP/HTTPS endpoint。当前 adapter 会使用同一个 endpoint：

| 方法 | 用途 | 请求体 |
| --- | --- | --- |
| `GET` | 检查服务可访问性 | 无 |
| `POST` | 推送当前发布包 | `mr-calligraphy-remote-publish-package-v1` |

如配置 token，请求会携带：

```http
Authorization: Bearer <token>
```

## 3. 发布包

`POST` body 顶层字段：

| 字段 | 说明 |
| --- | --- |
| `kind` | 固定为 `mr-calligraphy-remote-publish-package-v1` |
| `version` | 当前为 `1` |
| `packageId` | 本机生成的提交 ID |
| `createdAt` | 本机生成时间 |
| `sceneId` | `mainScene` 或 `realisticScene` |
| `sceneLabel` | 页面显示名称 |
| `storageKey` | 本机发布记录来源 key |
| `release` | 当前发布版本摘要 |
| `record` | 本机发布记录 |
| `releaseLayout` | 当前发布布局 |
| `assetManifest` | 导入模型资产清单 |
| `manifest` | 摘要和统计 |

`manifest.kind` 固定为 `mr-calligraphy-remote-publish-manifest-v1`，并包含：

| 字段 | 说明 |
| --- | --- |
| `packageDigest` | 对发布包核心内容计算的 SHA-256 |
| `recordDigest` | 发布记录摘要 |
| `releaseDigest` | release 摘要 |
| `layoutDigest` | 发布布局摘要 |
| `assetDigest` | 资产清单摘要 |
| `objectSummary` | 对象数量、可见对象、导入模型等统计 |
| `assetSummary` | 资产数量、带哈希数量、缺哈希数量和字节数 |

服务端应重新计算这些 digest，并拒绝不匹配的请求。

## 4. 成功回执

成功响应建议返回：

```json
{
  "ok": true,
  "message": "主场景远端发布已接收。",
  "packageId": "remote-package-id",
  "releaseId": "main-release-1",
  "packageDigest": "64位sha256",
  "remoteVersion": "remote-v1",
  "receipt": {
    "receiptKind": "mr-calligraphy-remote-publish-receipt-v1",
    "packageId": "remote-package-id",
    "releaseId": "main-release-1",
    "packageDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:00:00.000Z",
    "receiptDigest": "64位sha256"
  }
}
```

前端 adapter 会读取 `message`、`packageId`、`releaseId`、`packageDigest`、`remoteVersion` 和 `receipt`，并把本机 `releaseId`、`packageDigest`、发布锁、最近远端状态和最近回执审计写回 `mr-calligraphy-remote-publish-v1`。

主后台和写实后台会显示最近回执，并可导出 `MR 书法远端发布回执审计` HTML。该审计是本机浏览器记录，用于开发和验收；生产服务端仍应保存不可篡改审计日志。

## 5. 失败响应

失败响应建议返回：

```json
{
  "ok": false,
  "message": "远端发布包校验失败：发布包摘要不匹配。",
  "errors": ["发布包摘要不匹配"],
  "warnings": []
}
```

推荐状态码：

| 状态码 | 场景 |
| --- | --- |
| `401` | token 缺失或不匹配 |
| `409` | 重复 `packageDigest` 或服务端发布锁冲突 |
| `422` | 发布包结构、manifest 或资产摘要校验失败 |
| `500` | 服务端内部错误 |

## 6. 本机 mock 服务

启动 mock server：

```bash
node scripts/remote-publish-mock-server.js
```

指定端口和 token：

```bash
REMOTE_PUBLISH_MOCK_PORT=8787 REMOTE_PUBLISH_MOCK_TOKEN=test-token node scripts/remote-publish-mock-server.js
```

然后在后台远端发布面板填入：

```text
http://127.0.0.1:8787/api/remote-publish
```

mock 服务会：

- `GET` 返回合同、远端版本和最近 receipt。
- `POST` 重新计算 `packageDigest`、`layoutDigest`、`assetDigest`。
- 拒绝摘要不匹配的发布包。
- 拒绝重复 `packageDigest`。
- 返回 `mr-calligraphy-remote-publish-receipt-v1` 回执；前端会把该回执写入本机审计列表。

## 7. 验收

脚本验收：

```bash
node scripts/remote-publish-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
```

`remote-publish-check.js` 会启动临时 mock server，用真实 HTTP `GET` / `POST` 验证 endpoint、Bearer token、发布包回执、回执审计导出、重复摘要拒绝和远端发布状态持久化。
