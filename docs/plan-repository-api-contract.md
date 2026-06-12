# 远端计划仓库 API 合同

日期：2026-06-12  
适用范围：前台学习页 `index.html` 的“计划同步仓库 / 远端计划 API”面板。

## 1. 边界

远端计划仓库 API 接收的是浏览器本机学习计划同步包，用来验证跨设备计划同步的真实 HTTP 闭环。当前 adapter 已支持 `Workspace` 空间 ID：前端会把空间写入请求头和同步包，mock 服务会按空间隔离最近计划包。它仍不是完整账号系统、教师端排课、后台推送提醒或云端权限模型。

生产服务端必须重新校验计划包结构，并在账号、空间、权限和数据版本上做服务端隔离；前端本机校验只能作为提交前保护。

## 2. Endpoint

前台允许用户配置一个 HTTP/HTTPS endpoint。当前 adapter 会使用同一个 endpoint：

| 方法 | 用途 | 请求体 |
| --- | --- | --- |
| `GET` | 检查服务可访问性，并拉取最近计划包 | 无 |
| `PUT` | 推送当前本机计划仓库包 | `mr-calligraphy-plan-repository-v1` |
| `OPTIONS` | 浏览器跨端口预检 | 无 |

如配置 token，请求会携带：

```http
Authorization: Bearer <token>
```

如配置 Workspace，请求会携带：

```http
X-MR-Workspace-Id: <workspaceId>
```

未填写时前端会使用 `local-browser`。生产服务端应把该值映射到真实账号 / 班级 / 项目空间，并继续在服务端鉴权，不能只信任前端 header。

## 3. 计划仓库包

`PUT` body 顶层字段：

| 字段 | 说明 |
| --- | --- |
| `kind` | 固定为 `mr-calligraphy-plan-repository-v1` |
| `version` | 当前为 `1` |
| `packageId` | 本机生成的提交 ID |
| `workspaceId` | 前端配置的计划仓库空间 ID，默认 `local-browser` |
| `exportedAt` | 本机生成时间 |
| `storageKey` | 本机学习状态来源 key |
| `source` | 当前同步模式和边界说明 |
| `summary` | 计划数量、最近计划 ID 和标题 |
| `plans` | 本机学习计划列表 |

服务端应至少校验：

- `kind`、`version`、`packageId`、`workspaceId`、`exportedAt` 和 `storageKey`。
- `plans` 必须是非空数组。
- 每个计划必须包含 `id`、`title` 和 `items` 数组。
- 每个计划项必须包含 `id` 和 `title`。

## 4. 成功响应

成功响应建议返回：

```json
{
  "ok": true,
  "message": "远端计划仓库已接收 3 份计划。",
  "packageId": "remote-plan-package-id",
  "repositoryDigest": "64位sha256",
  "remoteVersion": "remote-v1",
  "package": {
    "kind": "mr-calligraphy-plan-repository-v1",
    "version": 1,
    "packageId": "remote-plan-package-id",
    "workspaceId": "class-a",
    "plans": []
  },
  "receipt": {
    "receiptKind": "mr-calligraphy-plan-repository-receipt-v1",
    "workspaceId": "class-a",
    "packageId": "remote-plan-package-id",
    "sourcePackageId": "local-plan-package-id",
    "repositoryDigest": "64位sha256",
    "acceptedAt": "2026-06-12T00:00:00.000Z",
    "planCount": 3,
    "receiptDigest": "64位sha256"
  }
}
```

前端 adapter 当前会读取 `message`、`workspaceId`、`package.packageId`、`package.plans`、`receipt` 和 `latestReceipt`，并把远端 workspace、计划数量、最近 packageId、同步方向、冲突状态、自动同步队列状态和最近 12 条回执审计写回 `mr-calligraphy-learning-state-v1`。

前端只会保存字段完整的 `mr-calligraphy-plan-repository-receipt-v1`：

- `repositoryDigest` 和 `receiptDigest` 必须是 64 位十六进制摘要。
- 回执里的 `workspaceId` 会进入本机回执审计；切换 workspace 会清空当前 endpoint 下的本机回执视图，避免误把其他空间的回执当成当前空间。
- 回执会补充本机收到方向、endpoint 和收到时间。
- 回执审计可从前台“远端 API 同步 / 回执审计”导出 HTML。
- 这仍是本机审计留存，不是服务端不可篡改日志或账号化权限审计。

## 5. 失败响应

失败响应建议返回：

```json
{
  "ok": false,
  "message": "计划仓库包校验失败：缺少 plans 数组。",
  "errors": ["缺少 plans 数组"],
  "warnings": []
}
```

推荐状态码：

| 状态码 | 场景 |
| --- | --- |
| `401` | token 缺失或不匹配 |
| `404` | endpoint 路径不匹配 |
| `405` | 方法不支持 |
| `422` | 计划包结构校验失败 |
| `500` | 服务端内部错误 |

## 6. 本机 mock 服务

启动 mock server：

```bash
node scripts/plan-repository-mock-server.js
```

指定端口和 token：

```bash
PLAN_REPOSITORY_MOCK_PORT=8788 PLAN_REPOSITORY_MOCK_TOKEN=test-token node scripts/plan-repository-mock-server.js
```

然后在前台计划同步面板填入：

```text
http://127.0.0.1:8788/api/plan-repository
```

mock 服务会：

- `GET` 返回合同、远端版本和当前 workspace 最近一次保存的计划包。
- `GET` / `PUT` 都会读取 `X-MR-Workspace-Id`，按 workspace 保存和返回对应空间的最近计划包。
- `PUT` 校验 `mr-calligraphy-plan-repository-v1` 结构并保存到对应 workspace 的内存槽。
- 支持浏览器跨端口 `OPTIONS` 预检。
- 校验可选 Bearer token。
- 返回 `mr-calligraphy-plan-repository-receipt-v1` 回执和 `repositoryDigest`。

## 7. 验收

脚本验收：

```bash
node scripts/learning-state-check.js
node scripts/smoke-test.js --base-url=http://localhost:41496/
```

`learning-state-check.js` 会启动临时 mock server，用真实 HTTP `GET` / `PUT` 验证 endpoint、Bearer token、Workspace header、计划仓库回执、按空间隔离拉取最近计划包和错误 token 拒绝。
