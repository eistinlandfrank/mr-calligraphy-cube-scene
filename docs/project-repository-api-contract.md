# 远端项目仓库 API 合同

日期：2026-06-12
适用范围：主后台 `main-admin.html` 的“项目仓库状态 / 远端项目仓库 API”面板。

## 1. 边界

远端项目仓库 API 接收的是当前浏览器本机项目档案包，包含主后台、写实后台、学习状态、房间配置、发布版本、保存历史和 IndexedDB 导入模型快照。它用于验证“本机项目仓库 adapter 到 HTTP 服务端”的真实闭环。

它不是账号系统、多人协作 CMS、CDN 资产库、生产审批服务或不可篡改审计系统。生产服务端必须重新校验 packageDigest、项目归属、账号权限、资产完整性、版本冲突和操作审计。

## 2. Endpoint

主后台允许配置一个 HTTP/HTTPS endpoint。当前 adapter 会使用同一个 endpoint：

| 方法 | 用途 | 请求体 |
| --- | --- | --- |
| `GET` | 检查服务可访问性，并读取最近项目仓库包摘要；“拉取预览”会从该响应读取 `package.archive` | 无 |
| `GET ?packageId=<remote-package-id>` | 拉取指定远端历史版本，进入同一项目档案恢复预览 | 无 |
| `PUT` | 推送当前本机项目仓库包 | `mr-calligraphy-project-repository-package-v1` |
| `OPTIONS` | 浏览器跨端口预检 | 无 |

如配置 token，请求会携带：

```http
Authorization: Bearer <token>
```

## 3. 项目仓库包

`PUT` body 顶层字段：

| 字段 | 说明 |
| --- | --- |
| `kind` | 固定为 `mr-calligraphy-project-repository-package-v1` |
| `version` | 当前为 `1` |
| `packageId` | 本机生成的提交 ID |
| `exportedAt` | 本机生成时间 |
| `source` | 当前页面来源 |
| `boundary` | 本机 adapter 边界说明 |
| `summary` | storage、模型、场景、仓库状态摘要 |
| `repository` | `mr-calligraphy-project-repository-v1` 统一项目仓库状态 |
| `projectSchema` | 当前项目档案 schema |
| `archive` | 完整 `mr-calligraphy-project-archive` 档案 |
| `packageDigest` | 对除自身外的顶层包内容计算出的 SHA-256 |

服务端应至少校验：

- `kind`、`version`、`packageId`、`exportedAt` 和 `packageDigest`。
- `repository.kind` 必须为 `mr-calligraphy-project-repository-v1`。
- `repository.scenes` 必须是数组，且包含主场景和写实样张统一状态。
- `projectSchema.kind` 必须为 `mr-calligraphy-project-schema`。
- `archive.kind` 必须为 `mr-calligraphy-project-archive`。
- `archive.storage` 和 `archive.indexedDb` 必须存在。
- `packageDigest` 必须与服务端按稳定 JSON 重新计算的值一致。

## 4. 成功响应

成功响应建议返回：

```json
{
  "ok": true,
  "message": "远端项目仓库已接收 2 个场景。",
  "packageId": "remote-project-package-id",
  "packageDigest": "64位sha256",
  "repositoryDigest": "64位sha256",
  "remoteVersion": "remote-project-v1",
  "versionCount": 2,
  "versions": [
    {
      "packageId": "remote-project-package-id",
      "sourcePackageId": "local-project-package-id",
      "packageDigest": "64位sha256",
      "repositoryDigest": "64位sha256",
      "acceptedAt": "2026-06-12T00:00:00.000Z",
      "sceneCount": 2,
      "modelCount": 3
    }
  ],
  "receipt": {
    "receiptKind": "mr-calligraphy-project-repository-receipt-v1",
    "packageId": "remote-project-package-id",
    "sourcePackageId": "local-project-package-id",
    "packageDigest": "64位sha256",
    "repositoryDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:00:00.000Z",
    "sceneCount": 2,
    "modelCount": 3,
    "receiptDigest": "64位sha256"
  }
}
```

前端 adapter 当前会读取 `message`、`packageId`、`remoteVersion`、`packageDigest`、`repositoryDigest`、`receipt/latestReceipt`、`selectedVersion` 和 `versions`，并把最近检查、最近推送、服务端 packageId、摘要、回执列表和远端版本列表写回 `mr-calligraphy-project-repository-remote-v1`。写入的最近 12 条回执会补充同步方向、endpoint 和本机收到时间，主后台可导出 `mr-calligraphy-project-repository-receipts-*.html` 审计页。

如果 `GET` 响应包含 `package`，主后台“拉取预览”会校验 `package.kind`、`version`、`archive` 和 `packageDigest`，再把 `package.archive` 送入现有项目档案导入差异预览。主后台会用远端返回的 `versions` 渲染“远端版本”选择框；用户选择旧版本后，拉取请求会带上 `?packageId=<remote-package-id>`。该操作不会直接覆盖本机数据，用户仍需在预览中勾选恢复范围并点击“恢复所选”。

## 5. 失败响应

失败响应必须是 JSON。前端会把 HTTP 非 2xx、`ok:false`、空响应和非 JSON 响应都视为失败，并把错误写入 `mr-calligraphy-project-repository-remote-v1.lastError`；失败不会清空本机项目档案、已保存版本列表或回执列表。

失败响应建议返回：

```json
{
  "ok": false,
  "message": "项目仓库包校验失败：packageDigest 不匹配。",
  "errors": ["packageDigest 不匹配"],
  "warnings": []
}
```

推荐状态码：

| 状态码 | 场景 |
| --- | --- |
| `401` | token 缺失或不匹配 |
| `404` | endpoint 路径不匹配 |
| `405` | 方法不支持 |
| `422` | 项目仓库包结构或摘要校验失败 |
| `500` | 服务端内部错误 |

如果 endpoint 返回 200 但 body 不是 JSON，前端会显示“远端返回的不是 JSON”；如果网络中断，会显示“网络请求异常”。这两个状态都不会被当作远端可用。

## 6. 本机 mock 服务

启动 mock server：

```bash
node scripts/project-repository-mock-server.js
```

指定端口和 token：

```bash
PROJECT_REPOSITORY_MOCK_PORT=8790 PROJECT_REPOSITORY_MOCK_TOKEN=test-token node scripts/project-repository-mock-server.js
```

然后在主后台项目仓库面板填入：

```text
http://127.0.0.1:8790/api/project-repository
```

mock 服务会：

- `GET` 返回合同、远端版本和最近一次保存的项目仓库包。
- `GET ?packageId=<remote-package-id>` 返回对应历史项目仓库包；未找到版本时返回 `404`。
- `PUT` 校验 `mr-calligraphy-project-repository-package-v1`、项目档案、schema、统一仓库状态和 `packageDigest`。
- 支持浏览器跨端口 `OPTIONS` 预检。
- 校验可选 Bearer token。
- 返回 `mr-calligraphy-project-repository-receipt-v1` 回执、`repositoryDigest` 和最近 20 个远端版本摘要。

## 7. 验收

脚本验收：

```bash
node --check scripts/project-repository-mock-server.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
npm run test:e2e -- --grep "main admin publishes"
```

浏览器验收：

1. 打开 `http://localhost:41496/main-admin.html`。
2. 在“项目仓库状态”中展开“远端项目仓库 API”。
3. 填入 mock server endpoint 和可选 token。
4. 点击“检查远端”，应看到真实 GET 结果。
5. 点击“推送仓库包”，应看到服务端回执和最近 packageId。
6. “项目仓库回执审计”应显示已保存回执数量；点击“导出回执”应下载 HTML 审计页，包含 packageId、摘要和 receiptDigest。
7. 连续推送两次仓库包后，“远端版本”应出现两个版本。
8. 选择旧版本并点击“拉取预览”，应看到旧版本远端包进入项目档案导入预览，仍需用户确认恢复范围。

当前 E2E 会断言 PUT body 是 `mr-calligraphy-project-repository-package-v1`，包含 `archive`、`projectSchema`、`repository` 和 64 位 `packageDigest`，并确认 Bearer token、远端回执、回执审计 HTML 下载、版本列表和带 `packageId` 的 GET 历史版本拉取预览会写入本机状态。另有失败用例覆盖 401、非 JSON、无项目包、PUT 422 和网络中断，确认错误写入 `lastError` 且本机项目数据不被清空。
