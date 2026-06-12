#!/usr/bin/env node

const crypto = require("crypto");
const http = require("http");

const PACKAGE_KIND = "mr-calligraphy-plan-repository-v1";
const VERSION = 1;
const DEFAULT_WORKSPACE_ID = "local-browser";

function createPlanRepositoryMockServer(options = {}) {
  const requiredToken = String(options.token || process.env.PLAN_REPOSITORY_MOCK_TOKEN || "").trim();
  const state = {
    startedAt: new Date().toISOString(),
    latestWorkspaceId: DEFAULT_WORKSPACE_ID,
    workspaces: {},
    package: null,
    receipts: []
  };

  const server = http.createServer(async (request, response) => {
    try {
      if (request.method === "OPTIONS") {
        return sendEmpty(response, 204);
      }

      if (!isPlanRepositoryPath(request.url)) {
        return sendJson(response, 404, {
          ok: false,
          message: "计划仓库 mock 只提供 /api/plan-repository。"
        });
      }

      const auth = validateAuth(request, requiredToken);
      if (!auth.ok) {
        return sendJson(response, 401, {
          ok: false,
          message: auth.message,
          remoteVersion: "mr-calligraphy-plan-repository-mock-v1"
        });
      }

      if (request.method === "GET") {
        const workspaceId = getRequestWorkspaceId(request);
        const workspace = getWorkspaceState(state, workspaceId);
        return sendJson(response, 200, {
          ok: true,
          message: workspace.package
            ? `远端计划仓库 mock 可读，空间 ${workspaceId} 当前包含 ${workspace.package.plans.length} 份计划。`
            : `远端计划仓库 mock 服务可访问，空间 ${workspaceId} 当前尚未接收计划包。`,
          remoteVersion: "mr-calligraphy-plan-repository-mock-v1",
          workspaceId,
          contract: createContract(),
          package: workspace.package,
          receiptCount: workspace.receipts.length,
          latestReceipt: workspace.receipts[0] || null
        });
      }

      if (request.method === "PUT") {
        const payload = await readJsonBody(request);
        const workspaceId = getRequestWorkspaceId(request, payload.workspaceId);
        const validation = validatePlanRepositoryPackage(payload, { workspaceId });
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            warnings: validation.warnings,
            workspaceId,
            remoteVersion: "mr-calligraphy-plan-repository-mock-v1"
          });
        }

        const receipt = createReceipt(payload, validation, workspaceId);
        const workspace = getWorkspaceState(state, workspaceId);
        workspace.package = {
          ...clone(payload),
          workspaceId,
          packageId: receipt.packageId,
          acceptedAt: receipt.acceptedAt,
          repositoryDigest: receipt.repositoryDigest
        };
        workspace.receipts.unshift(receipt);
        state.latestWorkspaceId = workspaceId;
        state.package = workspace.package;
        state.receipts = workspace.receipts;

        return sendJson(response, 201, {
          ok: true,
          message: `远端计划仓库 mock 已接收空间 ${workspaceId} 的 ${payload.plans.length} 份计划。`,
          remoteVersion: receipt.remoteVersion,
          workspaceId,
          packageId: receipt.packageId,
          repositoryDigest: receipt.repositoryDigest,
          package: workspace.package,
          receipt,
          warnings: validation.warnings
        });
      }

      return sendJson(response, 405, {
        ok: false,
        message: "计划仓库 mock 只支持 GET 检查、PUT 写入和 OPTIONS 预检。"
      });
    } catch (error) {
      return sendJson(response, 500, {
        ok: false,
        message: `计划仓库 mock 处理失败：${error?.message || "未知错误"}。`
      });
    }
  });

  return {
    server,
    state,
    start: (startOptions = {}) => startServer(server, startOptions),
    close: () => closeServer(server)
  };
}

function startPlanRepositoryMockServer(options = {}) {
  const mock = createPlanRepositoryMockServer(options);
  return mock.start(options).then((info) => ({
    ...mock,
    ...info
  }));
}

function startServer(server, options = {}) {
  const host = String(options.host || process.env.PLAN_REPOSITORY_MOCK_HOST || "127.0.0.1");
  const port = Number(options.port || process.env.PLAN_REPOSITORY_MOCK_PORT || 0);
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      const address = server.address();
      const baseUrl = `http://${address.address}:${address.port}`;
      resolve({
        host: address.address,
        port: address.port,
        baseUrl,
        endpoint: `${baseUrl}/api/plan-repository`
      });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function isPlanRepositoryPath(url) {
  try {
    const parsed = new URL(url || "/", "http://localhost");
    return parsed.pathname === "/api/plan-repository";
  } catch (error) {
    return false;
  }
}

function validateAuth(request, requiredToken) {
  if (!requiredToken) {
    return { ok: true };
  }
  const expected = `Bearer ${requiredToken}`;
  if (request.headers.authorization === expected) {
    return { ok: true };
  }
  return { ok: false, message: "计划仓库 mock 拒绝请求：Authorization token 不匹配。" };
}

function getRequestWorkspaceId(request, fallback = "") {
  let queryWorkspace = "";
  try {
    const parsed = new URL(request.url || "/", "http://localhost");
    queryWorkspace = parsed.searchParams.get("workspaceId") || "";
  } catch (error) {
    queryWorkspace = "";
  }
  return normalizeWorkspaceId(request.headers["x-mr-workspace-id"] || queryWorkspace || fallback);
}

function getWorkspaceState(state, workspaceId) {
  const normalizedId = normalizeWorkspaceId(workspaceId);
  if (!state.workspaces[normalizedId]) {
    state.workspaces[normalizedId] = {
      workspaceId: normalizedId,
      package: null,
      receipts: []
    };
  }
  return state.workspaces[normalizedId];
}

function normalizeWorkspaceId(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_.:-]/g, "")
    .slice(0, 64);
  return normalized || DEFAULT_WORKSPACE_ID;
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("error", reject);
    request.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error("请求体不是可解析 JSON"));
      }
    });
  });
}

function sendEmpty(response, statusCode) {
  response.writeHead(statusCode, createResponseHeaders());
  response.end();
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, createResponseHeaders({
    "Content-Type": "application/json; charset=utf-8"
  }));
  response.end(body);
}

function createResponseHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, X-MR-Workspace-Id",
    "Access-Control-Max-Age": "600",
    "Cache-Control": "no-store",
    ...extra
  };
}

function createContract() {
  return {
    kind: "mr-calligraphy-plan-repository-contract-v1",
    accepts: {
      check: "GET /api/plan-repository",
      push: "PUT /api/plan-repository",
      pull: "GET /api/plan-repository",
      authorization: "optional Bearer token",
      workspaceHeader: "optional X-MR-Workspace-Id",
      cors: "GET, PUT, OPTIONS"
    },
    packageKind: PACKAGE_KIND,
    requiredTopLevelFields: ["kind", "version", "packageId", "workspaceId", "exportedAt", "storageKey", "summary", "plans"],
    receiptFields: ["ok", "message", "workspaceId", "packageId", "repositoryDigest", "remoteVersion", "receipt"]
  };
}

function validatePlanRepositoryPackage(payload, options = {}) {
  const errors = [];
  const warnings = [];
  const workspaceId = normalizeWorkspaceId(options.workspaceId);
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["计划仓库包为空"],
      warnings,
      message: "计划仓库包为空。"
    };
  }

  if (payload.kind !== PACKAGE_KIND) errors.push("计划仓库包 kind 不匹配");
  if (Number(payload.version) !== VERSION) errors.push("计划仓库包版本不匹配");
  if (!payload.packageId) errors.push("缺少 packageId");
  if (!payload.workspaceId) warnings.push("缺少 workspaceId，mock 会使用请求头或默认空间。");
  if (payload.workspaceId && normalizeWorkspaceId(payload.workspaceId) !== workspaceId) {
    warnings.push(`body.workspaceId 为 ${payload.workspaceId}，mock 按请求空间 ${workspaceId} 保存。`);
  }
  if (!payload.exportedAt) errors.push("缺少 exportedAt");
  if (!payload.storageKey) errors.push("缺少 storageKey");
  if (!payload.summary || typeof payload.summary !== "object") errors.push("缺少 summary");
  if (!Array.isArray(payload.plans)) {
    errors.push("缺少 plans 数组");
  } else if (!payload.plans.length) {
    errors.push("plans 数组为空");
  } else {
    payload.plans.forEach((plan, index) => {
      validatePlan(plan, index, errors, warnings);
    });
  }

  if (payload.summary && Array.isArray(payload.plans)) {
    const summaryPlanCount = Number(payload.summary.planCount || 0);
    if (summaryPlanCount !== payload.plans.length) {
      warnings.push(`summary.planCount 为 ${summaryPlanCount}，实际 plans 为 ${payload.plans.length}。`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    message: errors.length ? `计划仓库包校验失败：${errors.join("；")}。` : "计划仓库包校验通过。"
  };
}

function validatePlan(plan, index, errors, warnings) {
  if (!plan || typeof plan !== "object") {
    errors.push(`plans[${index}] 不是对象`);
    return;
  }
  const label = plan.id || `plans[${index}]`;
  if (!plan.id) errors.push(`${label} 缺少 id`);
  if (!plan.title) errors.push(`${label} 缺少 title`);
  if (!Array.isArray(plan.items)) {
    errors.push(`${label} 缺少 items 数组`);
    return;
  }
  if (!plan.items.length) {
    warnings.push(`${label} 没有计划项`);
  }
  plan.items.forEach((item, itemIndex) => {
    if (!item || typeof item !== "object") {
      errors.push(`${label}.items[${itemIndex}] 不是对象`);
      return;
    }
    if (!item.id) errors.push(`${label}.items[${itemIndex}] 缺少 id`);
    if (!item.title) errors.push(`${label}.items[${itemIndex}] 缺少 title`);
  });
}

function createReceipt(payload, validation, workspaceId = DEFAULT_WORKSPACE_ID) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId);
  const repositoryDigest = sha256StableJson({
    kind: payload.kind,
    version: payload.version,
    workspaceId: normalizedWorkspaceId,
    storageKey: payload.storageKey,
    summary: payload.summary,
    plans: payload.plans
  });
  const acceptedAt = new Date().toISOString();
  return {
    receiptKind: "mr-calligraphy-plan-repository-receipt-v1",
    remoteVersion: "mr-calligraphy-plan-repository-mock-v1",
    workspaceId: normalizedWorkspaceId,
    packageId: `mock-plan-repository-${normalizedWorkspaceId}-${repositoryDigest.slice(0, 12)}`,
    sourcePackageId: String(payload.packageId || ""),
    repositoryDigest,
    acceptedAt,
    planCount: payload.plans.length,
    warningCount: validation.warnings.length,
    warnings: validation.warnings,
    receiptDigest: sha256StableJson({
      sourcePackageId: payload.packageId,
      workspaceId: normalizedWorkspaceId,
      repositoryDigest,
      acceptedAt
    })
  };
}

function sha256StableJson(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function runCli() {
  const mock = await startPlanRepositoryMockServer({
    host: process.env.PLAN_REPOSITORY_MOCK_HOST || "127.0.0.1",
    port: process.env.PLAN_REPOSITORY_MOCK_PORT || 0,
    token: process.env.PLAN_REPOSITORY_MOCK_TOKEN || ""
  });
  console.log(`计划仓库 mock 服务已启动：${mock.endpoint}`);
  if (process.env.PLAN_REPOSITORY_MOCK_TOKEN) {
    console.log("需要 Authorization: Bearer <PLAN_REPOSITORY_MOCK_TOKEN>");
  }
  console.log("按 Ctrl+C 停止。");
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  PACKAGE_KIND,
  VERSION,
  createContract,
  createPlanRepositoryMockServer,
  startPlanRepositoryMockServer,
  validatePlanRepositoryPackage
};
