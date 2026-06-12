#!/usr/bin/env node

const crypto = require("crypto");
const http = require("http");

const PACKAGE_KIND = "mr-calligraphy-project-repository-package-v1";
const VERSION = 1;
const MAX_VERSION_RECORDS = 20;
const DEFAULT_WORKSPACE_ID = "local-browser";

function createProjectRepositoryMockServer(options = {}) {
  const requiredToken = String(options.token || process.env.PROJECT_REPOSITORY_MOCK_TOKEN || "").trim();
  const state = {
    startedAt: new Date().toISOString(),
    latestWorkspaceId: DEFAULT_WORKSPACE_ID,
    workspaces: {},
    package: null,
    receipts: [],
    versions: []
  };

  const server = http.createServer(async (request, response) => {
    try {
      if (request.method === "OPTIONS") {
        return sendEmpty(response, 204);
      }

      if (!isProjectRepositoryPath(request.url)) {
        return sendJson(response, 404, {
          ok: false,
          message: "项目仓库 mock 只提供 /api/project-repository。"
        });
      }

      const auth = validateAuth(request, requiredToken);
      if (!auth.ok) {
        return sendJson(response, 401, {
          ok: false,
          message: auth.message,
          remoteVersion: "mr-calligraphy-project-repository-mock-v1"
        });
      }

      if (request.method === "GET") {
        const workspaceId = getRequestWorkspaceId(request);
        const workspace = getWorkspaceState(state, workspaceId);
        const requestedPackageId = getRequestedPackageId(request.url);
        const selectedVersion = selectProjectRepositoryVersion(workspace, requestedPackageId);
        if (requestedPackageId && !selectedVersion) {
          return sendJson(response, 404, {
            ok: false,
            message: `远端项目仓库 mock 在空间 ${workspaceId} 未找到版本：${requestedPackageId}。`,
            remoteVersion: "mr-calligraphy-project-repository-mock-v1",
            workspaceId,
            versions: workspace.versions.map(serializeProjectRepositoryVersion)
          });
        }
        const selectedPackage = selectedVersion?.package || workspace.package;
        const latestReceipt = selectedVersion?.receipt || workspace.receipts[0] || null;
        return sendJson(response, 200, {
          ok: true,
          message: selectedPackage
            ? `远端项目仓库 mock 可读，空间 ${workspaceId} 当前版本包含 ${selectedPackage.summary?.sceneCount || 0} 个场景。`
            : `远端项目仓库 mock 服务可访问，空间 ${workspaceId} 当前尚未接收项目仓库包。`,
          remoteVersion: "mr-calligraphy-project-repository-mock-v1",
          workspaceId,
          contract: createContract(),
          package: selectedPackage,
          packageId: latestReceipt?.packageId || "",
          repositoryDigest: latestReceipt?.repositoryDigest || "",
          receiptCount: workspace.receipts.length,
          latestReceipt,
          selectedVersion: selectedVersion ? serializeProjectRepositoryVersion(selectedVersion) : null,
          versionCount: workspace.versions.length,
          versions: workspace.versions.map(serializeProjectRepositoryVersion)
        });
      }

      if (request.method === "PUT") {
        const payload = await readJsonBody(request);
        const workspaceId = getRequestWorkspaceId(request, payload.workspaceId);
        const validation = validateProjectRepositoryPackage(payload, { workspaceId });
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            warnings: validation.warnings,
            workspaceId,
            remoteVersion: "mr-calligraphy-project-repository-mock-v1"
          });
        }

        const workspace = getWorkspaceState(state, workspaceId);
        const receipt = createReceipt(payload, validation, workspace.receipts.length + 1, workspaceId);
        const versionRecord = createProjectRepositoryVersionRecord(payload, receipt, workspaceId);
        workspace.package = clone(payload);
        workspace.receipts.unshift(receipt);
        workspace.versions.unshift(versionRecord);
        workspace.versions = workspace.versions.slice(0, MAX_VERSION_RECORDS);
        state.latestWorkspaceId = workspaceId;
        state.package = workspace.package;
        state.receipts = workspace.receipts;
        state.versions = workspace.versions;

        return sendJson(response, 201, {
          ok: true,
          message: `远端项目仓库 mock 已接收空间 ${workspaceId} 的 ${payload.summary.sceneCount || 0} 个场景、${payload.summary.importedModels || 0} 个导入模型。`,
          remoteVersion: receipt.remoteVersion,
          workspaceId,
          packageId: receipt.packageId,
          repositoryDigest: receipt.repositoryDigest,
          package: workspace.package,
          receipt,
          selectedVersion: serializeProjectRepositoryVersion(versionRecord),
          versionCount: workspace.versions.length,
          versions: workspace.versions.map(serializeProjectRepositoryVersion),
          warnings: validation.warnings
        });
      }

      return sendJson(response, 405, {
        ok: false,
        message: "项目仓库 mock 只支持 GET 检查、PUT 写入和 OPTIONS 预检。"
      });
    } catch (error) {
      return sendJson(response, 500, {
        ok: false,
        message: `项目仓库 mock 处理失败：${error?.message || "未知错误"}。`
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

function startProjectRepositoryMockServer(options = {}) {
  const mock = createProjectRepositoryMockServer(options);
  return mock.start(options).then((info) => ({
    ...mock,
    ...info
  }));
}

function startServer(server, options = {}) {
  const host = String(options.host || process.env.PROJECT_REPOSITORY_MOCK_HOST || "127.0.0.1");
  const port = Number(options.port || process.env.PROJECT_REPOSITORY_MOCK_PORT || 0);
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
        endpoint: `${baseUrl}/api/project-repository`
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

function isProjectRepositoryPath(url) {
  try {
    const parsed = new URL(url || "/", "http://localhost");
    return parsed.pathname === "/api/project-repository";
  } catch (error) {
    return false;
  }
}

function getRequestedPackageId(url) {
  try {
    const parsed = new URL(url || "/", "http://localhost");
    return String(parsed.searchParams.get("packageId") || "").trim();
  } catch (error) {
    return "";
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
  return { ok: false, message: "项目仓库 mock 拒绝请求：Authorization token 不匹配。" };
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
      receipts: [],
      versions: []
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
  const workspaceHeader = payload?.workspaceId
    ? { "X-MR-Workspace-Id": normalizeWorkspaceId(payload.workspaceId) }
    : {};
  response.writeHead(statusCode, createResponseHeaders({
    "Content-Type": "application/json; charset=utf-8",
    ...workspaceHeader
  }));
  response.end(body);
}

function createResponseHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, X-MR-Workspace-Id",
    "Access-Control-Expose-Headers": "X-MR-Workspace-Id",
    "Access-Control-Max-Age": "600",
    "Cache-Control": "no-store",
    ...extra
  };
}

function createContract() {
  return {
    kind: "mr-calligraphy-project-repository-contract-v1",
    accepts: {
      check: "GET /api/project-repository",
      pullVersion: "GET /api/project-repository?packageId=<remote-package-id>",
      push: "PUT /api/project-repository",
      authorization: "optional Bearer token",
      workspaceHeader: "X-MR-Workspace-Id",
      cors: "GET, PUT, OPTIONS"
    },
    packageKind: PACKAGE_KIND,
    defaultWorkspaceId: DEFAULT_WORKSPACE_ID,
    requiredTopLevelFields: ["kind", "version", "packageId", "workspaceId", "exportedAt", "summary", "repository", "projectSchema", "archive", "packageDigest"],
    receiptFields: ["ok", "message", "packageId", "workspaceId", "repositoryDigest", "remoteVersion", "receipt"],
    versionFields: ["packageId", "sourcePackageId", "workspaceId", "packageDigest", "repositoryDigest", "acceptedAt", "sceneCount", "modelCount"]
  };
}

function validateProjectRepositoryPackage(payload, options = {}) {
  const errors = [];
  const warnings = [];
  const workspaceId = normalizeWorkspaceId(options.workspaceId);
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["项目仓库包为空"],
      warnings,
      message: "项目仓库包为空。"
    };
  }

  if (payload.kind !== PACKAGE_KIND) errors.push("项目仓库包 kind 不匹配");
  if (Number(payload.version) !== VERSION) errors.push("项目仓库包版本不匹配");
  if (!payload.packageId) errors.push("缺少 packageId");
  if (!payload.workspaceId) {
    warnings.push(`缺少 workspaceId，mock 将按请求空间 ${workspaceId} 保存。`);
  } else if (normalizeWorkspaceId(payload.workspaceId) !== workspaceId) {
    warnings.push(`包 workspaceId 为 ${payload.workspaceId}，请求空间为 ${workspaceId}，mock 将按请求空间保存。`);
  }
  if (!payload.exportedAt) errors.push("缺少 exportedAt");
  if (!payload.summary || typeof payload.summary !== "object") errors.push("缺少 summary");
  if (payload.repository?.kind !== "mr-calligraphy-project-repository-v1") errors.push("repository.kind 不匹配");
  if (!Array.isArray(payload.repository?.scenes)) errors.push("repository.scenes 不是数组");
  if (payload.projectSchema?.kind !== "mr-calligraphy-project-schema") errors.push("projectSchema.kind 不匹配");
  if (payload.archive?.kind !== "mr-calligraphy-project-archive") errors.push("archive.kind 不匹配");
  if (!payload.archive?.storage || typeof payload.archive.storage !== "object") errors.push("archive.storage 缺失");
  if (!payload.archive?.indexedDb || typeof payload.archive.indexedDb !== "object") errors.push("archive.indexedDb 缺失");

  const expectedDigest = createPackageDigest(payload);
  if (!payload.packageDigest) {
    errors.push("缺少 packageDigest");
  } else if (payload.packageDigest !== expectedDigest) {
    errors.push("packageDigest 不匹配");
  }

  if (payload.summary && payload.repository?.summary) {
    const summaryScenes = Number(payload.summary.sceneCount || 0);
    const repositoryScenes = Number(payload.repository.summary.sceneCount || 0);
    if (summaryScenes !== repositoryScenes) {
      warnings.push(`summary.sceneCount 为 ${summaryScenes}，repository.summary.sceneCount 为 ${repositoryScenes}。`);
    }
  }
  if (payload.repository && payload.repository.status !== "ready") {
    warnings.push(`项目仓库状态为 ${payload.repository.status || "unknown"}，服务端已接收但建议先处理仓库提醒。`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    message: errors.length ? `项目仓库包校验失败：${errors.join("；")}。` : "项目仓库包校验通过。"
  };
}

function createPackageDigest(payload) {
  const copy = clone(payload || {});
  delete copy.packageDigest;
  return sha256StableJson(copy);
}

function createReceipt(payload, validation, sequence = 1, workspaceId = DEFAULT_WORKSPACE_ID) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || payload.workspaceId);
  const repositoryDigest = sha256StableJson({
    kind: payload.kind,
    version: payload.version,
    workspaceId: normalizedWorkspaceId,
    repository: payload.repository,
    projectSchema: payload.projectSchema,
    summary: payload.summary
  });
  const acceptedAt = new Date().toISOString();
  return {
    receiptKind: "mr-calligraphy-project-repository-receipt-v1",
    remoteVersion: "mr-calligraphy-project-repository-mock-v1",
    packageId: `mock-project-repository-${normalizedWorkspaceId}-${String(sequence).padStart(3, "0")}-${repositoryDigest.slice(0, 12)}`,
    sourcePackageId: String(payload.packageId || ""),
    workspaceId: normalizedWorkspaceId,
    packageDigest: payload.packageDigest,
    repositoryDigest,
    acceptedAt,
    sceneCount: Number(payload.summary?.sceneCount || 0),
    modelCount: Number(payload.summary?.importedModels || 0),
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

function createProjectRepositoryVersionRecord(payload, receipt, workspaceId = DEFAULT_WORKSPACE_ID) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || receipt.workspaceId || payload.workspaceId);
  return {
    id: receipt.packageId || receipt.sourcePackageId || receipt.packageDigest,
    packageId: receipt.packageId,
    sourcePackageId: receipt.sourcePackageId,
    workspaceId: normalizedWorkspaceId,
    packageDigest: receipt.packageDigest,
    repositoryDigest: receipt.repositoryDigest,
    remoteVersion: receipt.remoteVersion,
    acceptedAt: receipt.acceptedAt,
    sceneCount: receipt.sceneCount,
    modelCount: receipt.modelCount,
    summary: clone(payload.summary || {}),
    package: clone(payload),
    receipt: clone(receipt)
  };
}

function serializeProjectRepositoryVersion(version) {
  return {
    id: String(version.id || version.packageId || version.sourcePackageId || version.packageDigest || ""),
    packageId: String(version.packageId || ""),
    sourcePackageId: String(version.sourcePackageId || ""),
    workspaceId: normalizeWorkspaceId(version.workspaceId),
    packageDigest: String(version.packageDigest || ""),
    repositoryDigest: String(version.repositoryDigest || ""),
    remoteVersion: String(version.remoteVersion || ""),
    acceptedAt: String(version.acceptedAt || ""),
    sceneCount: Number(version.sceneCount || 0),
    modelCount: Number(version.modelCount || 0),
    summary: clone(version.summary || {})
  };
}

function selectProjectRepositoryVersion(state, requestedPackageId) {
  if (!requestedPackageId) {
    return state.versions[0] || null;
  }
  return state.versions.find((version) => [
    version.id,
    version.packageId,
    version.sourcePackageId,
    version.packageDigest,
    version.repositoryDigest
  ].some((value) => value && String(value) === requestedPackageId)) || null;
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
  const mock = await startProjectRepositoryMockServer({
    host: process.env.PROJECT_REPOSITORY_MOCK_HOST || "127.0.0.1",
    port: process.env.PROJECT_REPOSITORY_MOCK_PORT || 0,
    token: process.env.PROJECT_REPOSITORY_MOCK_TOKEN || ""
  });
  console.log(`项目仓库 mock 服务已启动：${mock.endpoint}`);
  if (process.env.PROJECT_REPOSITORY_MOCK_TOKEN) {
    console.log("需要 Authorization: Bearer <PROJECT_REPOSITORY_MOCK_TOKEN>");
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
  createProjectRepositoryMockServer,
  startProjectRepositoryMockServer,
  validateProjectRepositoryPackage
};
