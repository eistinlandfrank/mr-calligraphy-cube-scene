#!/usr/bin/env node

const crypto = require("crypto");
const http = require("http");

const PACKAGE_KIND = "mr-calligraphy-share-repository-v1";
const RECEIPT_KIND = "mr-calligraphy-share-repository-receipt-v1";
const VERSION = 1;
const DEFAULT_WORKSPACE_ID = "local-browser";
const PACKAGE_DIGEST_ALGORITHM = "sha256-stable-json";

function createShareRepositoryMockServer(options = {}) {
  const requiredToken = String(options.token || process.env.SHARE_REPOSITORY_MOCK_TOKEN || "").trim();
  const publicBaseUrl = String(options.publicBaseUrl || process.env.SHARE_REPOSITORY_PUBLIC_BASE_URL || "https://share.example.test").replace(/\/+$/, "");
  const state = {
    startedAt: new Date().toISOString(),
    latestWorkspaceId: DEFAULT_WORKSPACE_ID,
    workspaces: {},
    package: null,
    revokedShares: [],
    receipts: []
  };

  const server = http.createServer(async (request, response) => {
    try {
      if (request.method === "OPTIONS") {
        return sendEmpty(response, 204);
      }

      if (!isShareRepositoryPath(request.url)) {
        return sendJson(response, 404, {
          ok: false,
          message: "作品分享 mock 只提供 /api/share-repository。"
        });
      }

      const auth = validateAuth(request, requiredToken);
      if (!auth.ok) {
        return sendJson(response, 401, {
          ok: false,
          message: auth.message,
          remoteVersion: "mr-calligraphy-share-repository-mock-v1"
        });
      }

      if (request.method === "GET") {
        const workspaceId = getRequestWorkspaceId(request);
        const workspace = getWorkspaceState(state, workspaceId);
        return sendJson(response, 200, {
          ok: true,
          message: workspace.package
            ? `远端分享 mock 可读，空间 ${workspaceId} 当前保存 ${workspace.package.records.length} 条分享记录。`
            : `远端分享 mock 服务可访问，空间 ${workspaceId} 当前尚未接收分享包。`,
          remoteVersion: "mr-calligraphy-share-repository-mock-v1",
          workspaceId,
          contract: createContract(),
          package: workspace.package,
          receiptCount: workspace.receipts.length,
          latestReceipt: workspace.receipts[0] || null,
          publicUrl: workspace.receipts[0]?.publicUrl || ""
        });
      }

      if (request.method === "PUT") {
        const payload = await readJsonBody(request);
        const workspaceId = getRequestWorkspaceId(request, payload.workspaceId);
        const validation = validateShareRepositoryPackage(payload, { workspaceId });
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            warnings: validation.warnings,
            workspaceId,
            remoteVersion: "mr-calligraphy-share-repository-mock-v1"
          });
        }

        const workspace = getWorkspaceState(state, workspaceId);
        const receipt = createReceipt(payload, validation, publicBaseUrl, workspaceId);
        workspace.package = withPackageDigest({
          ...clone(payload),
          workspaceId,
          packageId: receipt.packageId,
          acceptedAt: receipt.acceptedAt,
          repositoryDigest: receipt.repositoryDigest,
          publicUrl: receipt.publicUrl
        });
        workspace.receipts.unshift(receipt);
        state.latestWorkspaceId = workspaceId;
        state.package = workspace.package;
        state.receipts = workspace.receipts;
        state.revokedShares = workspace.revokedShares;

        return sendJson(response, 201, {
          ok: true,
          message: `远端分享 mock 已接收 ${payload.records.length} 条分享记录，空间 ${workspaceId}。`,
          workspaceId,
          remoteVersion: receipt.remoteVersion,
          packageId: receipt.packageId,
          repositoryDigest: receipt.repositoryDigest,
          publicUrl: receipt.publicUrl,
          package: state.package,
          receipt,
          warnings: validation.warnings
        });
      }

      if (request.method === "DELETE") {
        const payload = mergeRevokeQuery(await readJsonBody(request), request.url);
        const workspaceId = getRequestWorkspaceId(request, payload.workspaceId);
        const workspace = getWorkspaceState(state, workspaceId);
        const validation = validateShareRevokeRequest(payload, workspace.package, { workspaceId });
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            warnings: validation.warnings,
            workspaceId,
            remoteVersion: "mr-calligraphy-share-repository-mock-v1"
          });
        }

        const receipt = createRevokeReceipt(payload, validation, workspace.package, publicBaseUrl, workspaceId);
        workspace.revokedShares.unshift({
          shareId: receipt.shareId,
          packageId: receipt.packageId,
          workspaceId,
          publicUrl: receipt.publicUrl,
          revokedAt: receipt.acceptedAt,
          receiptDigest: receipt.receiptDigest
        });
        if (workspace.package) {
          workspace.package = applyRevokeToPackage(workspace.package, receipt);
        }
        workspace.receipts.unshift(receipt);
        state.latestWorkspaceId = workspaceId;
        state.package = workspace.package;
        state.receipts = workspace.receipts;
        state.revokedShares = workspace.revokedShares;

        return sendJson(response, 200, {
          ok: true,
          message: `远端分享 mock 已撤销 ${receipt.shareId}，空间 ${workspaceId}。`,
          workspaceId,
          remoteVersion: receipt.remoteVersion,
          packageId: receipt.packageId,
          repositoryDigest: receipt.repositoryDigest,
          publicUrl: receipt.publicUrl,
          receipt,
          warnings: validation.warnings
        });
      }

      return sendJson(response, 405, {
        ok: false,
        message: "作品分享 mock 只支持 GET 检查、PUT 写入、DELETE 撤销和 OPTIONS 预检。"
      });
    } catch (error) {
      return sendJson(response, 500, {
        ok: false,
        message: `作品分享 mock 处理失败：${error?.message || "未知错误"}。`
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

function startShareRepositoryMockServer(options = {}) {
  const mock = createShareRepositoryMockServer(options);
  return mock.start(options).then((info) => ({
    ...mock,
    ...info
  }));
}

function startServer(server, options = {}) {
  const host = String(options.host || process.env.SHARE_REPOSITORY_MOCK_HOST || "127.0.0.1");
  const port = Number(options.port || process.env.SHARE_REPOSITORY_MOCK_PORT || 0);
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
        endpoint: `${baseUrl}/api/share-repository`
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

function isShareRepositoryPath(url) {
  try {
    const parsed = new URL(url || "/", "http://localhost");
    return parsed.pathname === "/api/share-repository";
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
  return { ok: false, message: "作品分享 mock 拒绝请求：Authorization token 不匹配。" };
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
      revokedShares: [],
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

function mergeRevokeQuery(payload, requestUrl) {
  const base = payload && typeof payload === "object" ? payload : {};
  try {
    const url = new URL(requestUrl || "/", "http://localhost");
    return {
      ...base,
      kind: base.kind || "mr-calligraphy-share-repository-revoke-v1",
      version: base.version || VERSION,
      shareId: base.shareId || url.searchParams.get("shareId") || "",
      packageId: base.packageId || url.searchParams.get("packageId") || "",
      publicUrl: base.publicUrl || url.searchParams.get("publicUrl") || "",
      workspaceId: base.workspaceId || url.searchParams.get("workspaceId") || ""
    };
  } catch (error) {
    return base;
  }
}

function sendEmpty(response, statusCode) {
  response.writeHead(statusCode, createResponseHeaders());
  response.end();
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, createResponseHeaders({
    "Content-Type": "application/json; charset=utf-8",
    ...(payload?.workspaceId ? { "X-MR-Workspace-Id": normalizeWorkspaceId(payload.workspaceId) } : {})
  }));
  response.end(body);
}

function createResponseHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, X-MR-Workspace-Id",
    "Access-Control-Expose-Headers": "X-MR-Workspace-Id",
    "Access-Control-Max-Age": "600",
    "Cache-Control": "no-store",
    ...extra
  };
}

function createContract() {
  return {
    kind: "mr-calligraphy-share-repository-contract-v1",
    accepts: {
      check: "GET /api/share-repository",
      publish: "PUT /api/share-repository",
      revoke: "DELETE /api/share-repository",
      authorization: "optional Bearer token",
      workspaceHeader: "X-MR-Workspace-Id",
      cors: "GET, PUT, DELETE, OPTIONS"
    },
    packageKind: PACKAGE_KIND,
    revokeKind: "mr-calligraphy-share-repository-revoke-v1",
    defaultWorkspaceId: DEFAULT_WORKSPACE_ID,
    requiredTopLevelFields: ["kind", "version", "packageId", "workspaceId", "exportedAt", "storageKey", "summary", "records", "shares", "digestAlgorithm", "packageDigest"],
    receiptFields: ["ok", "message", "workspaceId", "packageId", "repositoryDigest", "publicUrl", "remoteVersion", "receipt"]
  };
}

function validateShareRepositoryPackage(payload, options = {}) {
  const errors = [];
  const warnings = [];
  const workspaceId = normalizeWorkspaceId(options.workspaceId);
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["分享仓库包为空"],
      warnings,
      message: "分享仓库包校验失败：分享仓库包为空。"
    };
  }
  if (payload.kind !== PACKAGE_KIND) errors.push(`kind 应为 ${PACKAGE_KIND}`);
  if (Number(payload.version) !== VERSION) warnings.push(`version 为 ${payload.version || "空"}，当前 mock 按 v${VERSION} 验收。`);
  if (!payload.packageId) errors.push("缺少 packageId");
  if (!payload.workspaceId) {
    errors.push("缺少 workspaceId");
  } else if (normalizeWorkspaceId(payload.workspaceId) !== workspaceId) {
    errors.push(`workspaceId ${payload.workspaceId} 与请求空间 ${workspaceId} 不匹配`);
  }
  if (!payload.exportedAt) errors.push("缺少 exportedAt");
  if (!payload.storageKey) errors.push("缺少 storageKey");
  if (!payload.summary || typeof payload.summary !== "object") warnings.push("缺少 summary 对象");
  if (!Array.isArray(payload.records) || !payload.records.length) errors.push("缺少 records 数组");
  if (!Array.isArray(payload.shares) || !payload.shares.length) errors.push("缺少 shares 数组");
  validatePackageDigest(payload, errors, warnings);

  (payload.records || []).forEach((record, index) => {
    if (!record || typeof record !== "object") {
      errors.push(`records[${index}] 不是对象`);
      return;
    }
    if (!record.id) errors.push(`records[${index}] 缺少 id`);
    if (!record.artworkId) errors.push(`records[${index}] 缺少 artworkId`);
  });
  (payload.shares || []).forEach((share, index) => {
    if (!share || typeof share !== "object") {
      errors.push(`shares[${index}] 不是对象`);
      return;
    }
    if (!share.shareId) errors.push(`shares[${index}] 缺少 shareId`);
    if (!share.artworkId) errors.push(`shares[${index}] 缺少 artworkId`);
    if (!share.html || typeof share.html !== "string") errors.push(`shares[${index}] 缺少 html`);
    if (!share.share || typeof share.share !== "object") errors.push(`shares[${index}] 缺少 share 对象`);
  });

  if (payload.summary && Array.isArray(payload.records)) {
    const summaryShareCount = Number(payload.summary.shareCount || 0);
    if (summaryShareCount !== payload.records.length) {
      warnings.push(`summary.shareCount 为 ${summaryShareCount}，实际 records 为 ${payload.records.length}。`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    message: errors.length ? `分享仓库包校验失败：${errors.join("；")}。` : "分享仓库包校验通过。"
  };
}

function validatePackageDigest(payload, errors, warnings) {
  const claimedDigest = normalizeHex(payload.packageDigest);
  const algorithm = String(payload.digestAlgorithm || "").trim();
  if (claimedDigest && algorithm && algorithm !== PACKAGE_DIGEST_ALGORITHM) {
    errors.push(`packageDigest 算法 ${algorithm} 不受支持`);
    return;
  }
  if (!claimedDigest) {
    warnings.push("缺少 packageDigest，mock 按旧版作品分享仓库包接收。");
    return;
  }
  const actualDigest = createPackageDigest(payload);
  if (actualDigest !== claimedDigest) {
    errors.push(`作品分享仓库包摘要不匹配：声明 ${claimedDigest.slice(0, 12)}，实际 ${actualDigest.slice(0, 12)}`);
  }
}

function validateShareRevokeRequest(payload, currentPackage = null, options = {}) {
  const errors = [];
  const warnings = [];
  const workspaceId = normalizeWorkspaceId(options.workspaceId);
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["撤销请求为空"],
      warnings,
      message: "分享撤销请求校验失败：撤销请求为空。"
    };
  }
  if (payload.kind !== "mr-calligraphy-share-repository-revoke-v1") {
    errors.push("kind 应为 mr-calligraphy-share-repository-revoke-v1");
  }
  if (Number(payload.version) !== VERSION) {
    warnings.push(`version 为 ${payload.version || "空"}，当前 mock 按 v${VERSION} 验收。`);
  }
  if (!payload.workspaceId) {
    errors.push("缺少 workspaceId");
  } else if (normalizeWorkspaceId(payload.workspaceId) !== workspaceId) {
    errors.push(`workspaceId ${payload.workspaceId} 与请求空间 ${workspaceId} 不匹配`);
  }
  if (!payload.shareId) errors.push("缺少 shareId");
  if (!payload.packageId) warnings.push("缺少 packageId，mock 将按 shareId 尝试撤销。");
  if (!payload.publicUrl) warnings.push("缺少 publicUrl，mock 将按 publicBaseUrl 生成撤销目标。");
  if (currentPackage?.records?.length) {
    const exists = currentPackage.records.some((record) => record.id === payload.shareId);
    if (!exists) {
      warnings.push(`当前 mock 最近包中没有 shareId=${payload.shareId}，仍会记录撤销回执。`);
    }
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    message: errors.length ? `分享撤销请求校验失败：${errors.join("；")}。` : "分享撤销请求校验通过。"
  };
}

function createReceipt(payload, validation, publicBaseUrl, workspaceId = DEFAULT_WORKSPACE_ID) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || payload.workspaceId);
  const firstRecord = payload.records[0] || {};
  const firstShare = payload.shares[0] || {};
  const shareId = String(firstRecord.id || firstShare.shareId || "share");
  const repositoryDigest = sha256StableJson({
    kind: payload.kind,
    version: payload.version,
    workspaceId: normalizedWorkspaceId,
    storageKey: payload.storageKey,
    summary: payload.summary,
    records: payload.records,
    shares: payload.shares.map((item) => ({
      shareId: item.shareId,
      artworkId: item.artworkId,
      digest: item.digest,
      filename: item.filename,
      htmlDigest: sha256StableJson(item.html || "")
    }))
  });
  const acceptedAt = new Date().toISOString();
  const publicUrl = `${publicBaseUrl}/${encodeURIComponent(shareId)}.html`;
  return {
    receiptKind: RECEIPT_KIND,
    remoteVersion: "mr-calligraphy-share-repository-mock-v1",
    packageId: `mock-share-repository-${normalizedWorkspaceId}-${repositoryDigest.slice(0, 12)}`,
    sourcePackageId: String(payload.packageId || ""),
    workspaceId: normalizedWorkspaceId,
    shareId,
    artworkId: String(firstRecord.artworkId || firstShare.artworkId || ""),
    repositoryDigest,
    acceptedAt,
    publicUrl,
    shareCount: payload.records.length,
    htmlBytes: String(firstShare.html || "").length,
    warningCount: validation.warnings.length,
    warnings: validation.warnings,
    receiptDigest: sha256StableJson({
      sourcePackageId: payload.packageId,
      workspaceId: normalizedWorkspaceId,
      repositoryDigest,
      publicUrl,
      acceptedAt
    })
  };
}

function createRevokeReceipt(payload, validation, currentPackage, publicBaseUrl, workspaceId = DEFAULT_WORKSPACE_ID) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || payload.workspaceId || currentPackage?.workspaceId);
  const shareId = String(payload.shareId || "share");
  const matchedRecord = currentPackage?.records?.find((record) => record.id === shareId) || {};
  const matchedShare = currentPackage?.shares?.find((share) => share.shareId === shareId) || {};
  const acceptedAt = new Date().toISOString();
  const publicUrl = String(payload.publicUrl || `${publicBaseUrl}/${encodeURIComponent(shareId)}.html`);
  const repositoryDigest = sha256StableJson({
    kind: "mr-calligraphy-share-repository-revoke-v1",
    version: VERSION,
    workspaceId: normalizedWorkspaceId,
    shareId,
    artworkId: payload.artworkId || matchedRecord.artworkId || matchedShare.artworkId || "",
    packageId: payload.packageId || currentPackage?.packageId || "",
    publicUrl,
    acceptedAt,
    previousRepositoryDigest: currentPackage?.repositoryDigest || ""
  });
  return {
    receiptKind: RECEIPT_KIND,
    remoteVersion: "mr-calligraphy-share-repository-mock-v1",
    packageId: `mock-share-revoke-${normalizedWorkspaceId}-${repositoryDigest.slice(0, 12)}`,
    sourcePackageId: String(payload.packageId || currentPackage?.packageId || ""),
    workspaceId: normalizedWorkspaceId,
    shareId,
    artworkId: String(payload.artworkId || matchedRecord.artworkId || matchedShare.artworkId || ""),
    repositoryDigest,
    acceptedAt,
    publicUrl,
    shareCount: currentPackage?.records?.length || 0,
    htmlBytes: String(matchedShare.html || "").length,
    warningCount: validation.warnings.length,
    warnings: validation.warnings,
    receiptDigest: sha256StableJson({
      action: "revoke",
      sourcePackageId: payload.packageId || currentPackage?.packageId || "",
      workspaceId: normalizedWorkspaceId,
      shareId,
      repositoryDigest,
      publicUrl,
      acceptedAt
    })
  };
}

function applyRevokeToPackage(currentPackage, receipt) {
  const nextPackage = clone(currentPackage);
  nextPackage.workspaceId = receipt.workspaceId || nextPackage.workspaceId || DEFAULT_WORKSPACE_ID;
  nextPackage.records = (nextPackage.records || []).map((record) => (
    record.id === receipt.shareId
      ? { ...record, revokedAt: receipt.acceptedAt, remoteRevokedAt: receipt.acceptedAt }
      : record
  ));
  nextPackage.summary = {
    ...(nextPackage.summary || {}),
    workspaceId: receipt.workspaceId || nextPackage.workspaceId || DEFAULT_WORKSPACE_ID,
    revokedShareCount: (nextPackage.records || []).filter((record) => record.revokedAt).length,
    lastRevokedShareId: receipt.shareId,
    lastRevokedAt: receipt.acceptedAt
  };
  nextPackage.latestReceipt = receipt;
  return withPackageDigest(nextPackage);
}

function withPackageDigest(packageRecord) {
  const next = clone(packageRecord || {});
  next.digestAlgorithm = PACKAGE_DIGEST_ALGORITHM;
  next.packageDigest = createPackageDigest(next);
  return next;
}

function createPackageDigest(packageRecord = {}) {
  const payload = clone(packageRecord || {});
  delete payload.packageDigest;
  return sha256StableJson(payload);
}

function normalizeHex(value) {
  const hex = String(value || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(hex) ? hex : "";
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
  const mock = await startShareRepositoryMockServer({
    host: process.env.SHARE_REPOSITORY_MOCK_HOST || "127.0.0.1",
    port: process.env.SHARE_REPOSITORY_MOCK_PORT || 0,
    token: process.env.SHARE_REPOSITORY_MOCK_TOKEN || ""
  });
  console.log(`作品分享 mock 服务已启动：${mock.endpoint}`);
  if (process.env.SHARE_REPOSITORY_MOCK_TOKEN) {
    console.log("需要 Authorization: Bearer <SHARE_REPOSITORY_MOCK_TOKEN>");
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
  PACKAGE_DIGEST_ALGORITHM,
  RECEIPT_KIND,
  VERSION,
  createContract,
  createPackageDigest,
  createShareRepositoryMockServer,
  startShareRepositoryMockServer,
  validateShareRepositoryPackage,
  validateShareRevokeRequest,
  createReceipt
};
