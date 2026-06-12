# 远端发布 API 合同

日期：2026-06-12  
适用范围：主后台 `main-admin.html` 和写实后台 `realistic-admin.html` 的“远端发布 API”面板。

## 1. 边界

远端发布 API 接收的是当前浏览器已经本机发布并通过本机审核的发布包。当前 adapter 会携带 Workspace 空间 ID，作为同 endpoint 下的第一层发布隔离。它不是账号系统、CDN 上传、远端审批或公开托管本身。

生产服务端必须重新校验发布包摘要、资产清单和发布锁；前端本机预检只能作为提交前保护。

## 2. Endpoint

后台页面允许用户配置一个 HTTP/HTTPS endpoint。当前 adapter 会使用同一个 endpoint：

| 方法 | 用途 | 请求体 |
| --- | --- | --- |
| `GET` | 检查服务可访问性，并在推送前读取服务端最近回执 / 发布锁 | 无 |
| `POST` | 推送当前发布包 | `mr-calligraphy-remote-publish-package-v1` |
| `DELETE` | 撤销最近远端发布，并返回 CDN purge 回执 | `mr-calligraphy-remote-publish-revoke-v1` |

如配置 token，请求会携带：

```http
Authorization: Bearer <token>
```

如配置 Workspace，请求会携带；未填写时使用 `local-browser`：

```http
X-MR-Workspace-Id: <workspaceId>
```

## 3. 发布包

`POST` body 顶层字段：

| 字段 | 说明 |
| --- | --- |
| `kind` | 固定为 `mr-calligraphy-remote-publish-package-v1` |
| `version` | 当前为 `1` |
| `packageId` | 本机生成的提交 ID |
| `workspaceId` | 当前远端发布空间，需与 `X-MR-Workspace-Id` 一致 |
| `createdAt` | 本机生成时间 |
| `sceneId` | `mainScene` 或 `realisticScene` |
| `sceneLabel` | 页面显示名称 |
| `storageKey` | 本机发布记录来源 key |
| `release` | 当前发布版本摘要 |
| `record` | 本机发布记录 |
| `releaseLayout` | 当前发布布局 |
| `assetManifest` | 导入模型与导入模型贴图资产清单 |
| `manifest` | 摘要和统计 |

`manifest.kind` 固定为 `mr-calligraphy-remote-publish-manifest-v1`，并包含：

| 字段 | 说明 |
| --- | --- |
| `packageDigest` | 对发布包核心内容计算的 SHA-256 |
| `workspaceId` | 当前远端发布空间 |
| `recordDigest` | 发布记录摘要 |
| `releaseDigest` | release 摘要 |
| `layoutDigest` | 发布布局摘要 |
| `assetDigest` | 资产清单摘要 |
| `objectSummary` | 对象数量、可见对象、导入模型等统计 |
| `assetSummary` | 模型资产、贴图资产、带哈希数量、缺哈希数量和字节数 |

服务端应重新计算这些 digest，并拒绝不匹配的请求。

`assetManifest.assets[*]` 会包含：

| 字段 | 说明 |
| --- | --- |
| `assetKind` | `model` 或 `texture` |
| `id` / `dbKey` | 本机资产引用 key |
| `modelId` | 贴图所属导入模型 ID；模型资产等于自身 ID |
| `fileName` / `type` / `bytes` | 本机文件摘要信息 |
| `sha256` | 资产二进制 SHA-256；缺失时该资产不会被签名 |
| `hashStatus` | `sha256` 或 `missing-hash` |

## 4. 检查响应与服务端发布锁

成功的 `GET` 响应建议返回：

```json
{
  "ok": true,
  "message": "远端发布服务可访问。",
  "workspaceId": "local-browser",
  "remoteVersion": "remote-v1",
  "receiptCount": 1,
  "latestReceipt": {
    "packageId": "remote-package-id",
    "releaseId": "main-release-1",
    "workspaceId": "local-browser",
    "sceneId": "mainScene",
    "packageDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:00:00.000Z"
  },
  "publishLock": {
    "locked": true,
    "workspaceId": "local-browser",
    "sceneId": "mainScene",
    "releaseId": "main-release-1",
    "packageDigest": "64位sha256",
    "lockedAt": "2026-06-12T00:00:00.000Z",
    "reason": "相同发布包已接收。"
  }
}
```

前端 adapter 在 `POST` 前会先执行一次 `GET` 作为服务端发布锁预检：

- 如果 `publishLock.packageDigest` 或 `publishLock.releaseId` 命中当前发布包，会阻止 `POST`。
- 如果 `latestReceipt.packageDigest` 或 `latestReceipt.releaseId` 命中当前发布包，会阻止重复 `POST`。
- 如果服务端返回的 `publishLock.workspaceId` 或 `latestReceipt.workspaceId` 与当前空间不同，前端不会把它当作当前空间的发布锁。
- 如果 `latestReceipt.direction` 为 `revoke`，前端不会把它当作重复发布锁。
- 命中服务端锁时，会把远端锁写入本机 `mr-calligraphy-remote-publish-v1.scenes[sceneId].lock`，并显示“远端发布锁校验阻止推送”。
- 如果 `GET` 本身失败，前端不会继续推送，避免绕过服务端发布锁。

## 5. 成功回执

成功响应建议返回：

```json
{
  "ok": true,
  "message": "主场景远端发布已接收。",
  "workspaceId": "local-browser",
  "packageId": "remote-package-id",
  "releaseId": "main-release-1",
  "packageDigest": "64位sha256",
  "remoteVersion": "remote-v1",
  "receipt": {
    "receiptKind": "mr-calligraphy-remote-publish-receipt-v1",
    "workspaceId": "local-browser",
    "packageId": "remote-package-id",
    "releaseId": "main-release-1",
    "packageDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:00:00.000Z",
    "cdnUploadSummary": {
      "kind": "mr-calligraphy-remote-publish-cdn-upload-summary-v1",
      "status": "uploaded",
      "cdnProvider": "mock-cdn",
      "uploadRequestId": "upload-...",
      "uploadedAssetCount": 2,
      "uploadedUrlCount": 2,
      "baseUrl": "https://cdn.example.com/mr-calligraphy/mainScene/...",
      "assetDigest": "64位sha256",
      "uploadedAt": "2026-06-12T00:00:00.000Z",
      "completedAt": "2026-06-12T00:00:00.000Z"
    },
    "assetSignatureSummary": {
      "kind": "mr-calligraphy-remote-publish-asset-signature-summary-v1",
      "signedAssetCount": 2,
      "unsignedAssetCount": 0,
      "missingHashCount": 0,
      "signatureAlgorithm": "HMAC-SHA256",
      "signingKeyId": "remote-publish-mock-asset-hmac-v1",
      "assetDigest": "64位sha256",
      "signedAt": "2026-06-12T00:00:00.000Z"
    },
    "assetSignatures": [
      {
        "assetId": "asset-1",
        "dbKey": "asset-1",
        "modelId": "asset-1",
        "assetKind": "model",
        "sha256": "64位sha256",
        "packageDigest": "64位sha256",
        "assetDigest": "64位sha256",
        "signatureAlgorithm": "HMAC-SHA256",
        "signingKeyId": "remote-publish-mock-asset-hmac-v1",
        "signature": "64位hmac",
        "signedAt": "2026-06-12T00:00:00.000Z"
      }
    ],
    "receiptDigest": "64位sha256"
  }
}
```

前端 adapter 会读取 `message`、`workspaceId`、`packageId`、`releaseId`、`packageDigest`、`remoteVersion` 和 `receipt`，并把本机 `workspaceId`、`releaseId`、`packageDigest`、发布锁、最近远端状态、资产签名摘要、CDN 上传摘要和最近回执审计写回 `mr-calligraphy-remote-publish-v1`。

主后台和写实后台会显示最近回执、资产签名数量和 CDN URL 数量，并可导出 `MR 书法远端发布回执审计` HTML。该审计是本机浏览器记录，用于开发和验收；生产服务端仍应保存不可篡改审计日志。当前 mock 服务的资产签名是 HMAC-SHA256 开发验收回执，CDN 上传摘要是 mock URL 证据，不是生产证书签名、不可抵赖签章或生产 CDN 上传保证。

## 6. 撤销发布与 CDN purge 回执

后台“撤销远端”按钮会使用当前本机最近一条可撤销发布回执生成 `DELETE` body：

```json
{
  "kind": "mr-calligraphy-remote-publish-revoke-v1",
  "version": 1,
  "revokeId": "remote-revoke-mainScene-...",
  "requestedAt": "2026-06-12T00:05:00.000Z",
  "sceneId": "mainScene",
  "sceneLabel": "主场景",
  "workspaceId": "local-browser",
  "sourcePackageId": "remote-package-id",
  "releaseId": "main-release-1",
  "packageDigest": "64位sha256",
  "receiptDigest": "64位sha256",
  "reason": "local-user-revoked-remote-publish"
}
```

成功响应建议返回：

```json
{
  "ok": true,
  "message": "主场景远端发布已撤销。",
  "workspaceId": "local-browser",
  "packageId": "remote-revoke-package-id",
  "sourcePackageId": "remote-package-id",
  "releaseId": "main-release-1",
  "packageDigest": "64位sha256",
  "remoteVersion": "remote-v1",
  "cdnPurgeSummary": {
    "kind": "mr-calligraphy-remote-publish-cdn-purge-summary-v1",
    "status": "accepted",
    "cdnProvider": "mock-cdn",
    "purgeRequestId": "purge-...",
    "purgedAssetCount": 2,
    "purgedUrlCount": 2,
    "requestedAt": "2026-06-12T00:05:00.000Z",
    "completedAt": "2026-06-12T00:05:01.000Z"
  },
  "receipt": {
    "receiptKind": "mr-calligraphy-remote-publish-revoke-receipt-v1",
    "direction": "revoke",
    "workspaceId": "local-browser",
    "packageId": "remote-revoke-package-id",
    "sourcePackageId": "remote-package-id",
    "releaseId": "main-release-1",
    "sceneId": "mainScene",
    "packageDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:05:01.000Z",
    "revokedAt": "2026-06-12T00:05:01.000Z",
    "cdnPurgeSummary": {
      "status": "accepted",
      "cdnProvider": "mock-cdn",
      "purgedUrlCount": 2
    },
    "receiptDigest": "64位sha256"
  }
}
```

前端 adapter 会把撤销回执作为最新审计记录写入 `mr-calligraphy-remote-publish-v1.scenes[sceneId].receipts[0]`，保留当前 `workspaceId`，设置 `lastRemoteDirection = "revoke"`、`lastRevokedAt`，并清空本机发布锁。最新回执为撤销方向时，“撤销远端”按钮会禁用，后续相同 `packageDigest` 可在同 workspace 重新发布。

生产服务端应把 CDN purge 的实际请求 ID、状态、URL 数量和完成时间写入回执；当前本机 mock 服务只生成开发验收用的 `mock-cdn` 摘要，不代表生产 CDN 已经失效。

## 7. 失败响应

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

如果 `POST` 返回 `409` 且响应中带有 `packageDigest` 或 `releaseId`，前端会把它当作服务端发布锁冲突处理；普通 `422` 或网络异常会释放本机“正在推送”临时锁，避免失败后误锁住当前发布包。

## 8. 本机 mock 服务

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

可选填写 Workspace，例如 `remote-mock-alpha`。未填写时默认为 `local-browser`。

mock 服务会：

- `GET` 读取 `X-MR-Workspace-Id` 或 `?workspaceId=`，返回当前空间的合同、远端版本和最近 receipt。
- `GET` 在已有回执时返回 `publishLock`，前端会在推送前阻止相同发布包重复 POST。
- `POST` 校验 body `workspaceId` 与请求空间一致，并重新计算 `packageDigest`、`layoutDigest`、`assetDigest`。
- 拒绝摘要不匹配的发布包。
- 按 workspace 分桶保存回执和重复 `packageDigest` 锁，拒绝同空间重复发布，但不会误拦截其他空间。
- 对每个带 SHA-256 的模型 / 贴图资产返回 `assetSignatures[*]` HMAC 开发签名；缺哈希资产只返回 warning，不伪造签名。
- 对每个已签名资产返回 `cdnUploadSummary.assetUrls[*]` mock CDN URL，并统计 `uploadedAssetCount` / `uploadedUrlCount`。
- 返回 `mr-calligraphy-remote-publish-receipt-v1` 回执；前端会把该回执、资产签名摘要和 CDN 上传摘要写入本机审计列表。
- `DELETE` 校验 `mr-calligraphy-remote-publish-revoke-v1` 和 `workspaceId`，只在当前空间按 `sourcePackageId` / `releaseId` / `packageDigest` 匹配可撤销发布回执。
- `DELETE` 成功后删除 mock 内存中的重复 `packageDigest` 锁，返回 `mr-calligraphy-remote-publish-revoke-receipt-v1` 和 `cdnPurgeSummary`。
- 撤销后 `GET` 的最近回执仍可见，但不再返回发布锁；相同发布包可重新 POST。

## 9. 验收

脚本验收：

```bash
node scripts/remote-publish-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
```

`remote-publish-check.js` 会启动临时 mock server，用真实 HTTP `GET` / `POST` / `DELETE` 验证 endpoint、Bearer token、Workspace header、发布包和撤销包 `workspaceId`、模型/贴图资产清单、远端资产签名回执、CDN upload 摘要、发布包回执、撤销回执、CDN purge 摘要、回执审计导出、服务端锁预检、同空间重复摘要拒绝、撤销后重新发布、远端拒收释放临时锁和远端发布状态持久化。
