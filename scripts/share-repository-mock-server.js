#!/usr/bin/env node

const crypto = require("crypto");
const http = require("http");

const PACKAGE_KIND = "mr-calligraphy-share-repository-v1";
const RECEIPT_KIND = "mr-calligraphy-share-repository-receipt-v1";
const VERSION = 1;

function createShareRepositoryMockServer(options = {}) {
  const requiredToken = String(options.token || process.env.SHARE_REPOSITORY_MOCK_TOKEN || "").trim();
  const publicBaseUrl = String(options.publicBaseUrl || process.env.SHARE_REPOSITORY_PUBLIC_BASE_URL || "https://share.example.test").replace(/\/+$/, "");
  const state = {
    startedAt: new Date().toISOString(),
    package: null,
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
        return sendJson(response, 200, {
          ok: true,
          message: state.package
            ? `远端分享 mock 可读，当前保存 ${state.package.records.length} 条分享记录。`
            : "远端分享 mock 服务可访问，当前尚未接收分享包。",
          remoteVersion: "mr-calligraphy-share-repository-mock-v1",
          contract: createContract(),
          package: state.package,
          receiptCount: state.receipts.length,
          latestReceipt: state.receipts[0] || null,
          publicUrl: state.receipts[0]?.publicUrl || ""
        });
      }

      if (request.method === "PUT") {
        const payload = await readJsonBody(request);
        const validation = validateShareRepositoryPackage(payload);
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            warnings: validation.warnings,
            remoteVersion: "mr-calligraphy-share-repository-mock-v1"
          });
        }

        const receipt = createReceipt(payload, validation, publicBaseUrl);
        state.package = {
          ...clone(payload),
          packageId: receipt.packageId,
          acceptedAt: receipt.acceptedAt,
          repositoryDigest: receipt.repositoryDigest,
          publicUrl: receipt.publicUrl
        };
        state.receipts.unshift(receipt);

        return sendJson(response, 201, {
          ok: true,
          message: `远端分享 mock 已接收 ${payload.records.length} 条分享记录。`,
          remoteVersion: receipt.remoteVersion,
          packageId: receipt.packageId,
          repositoryDigest: receipt.repositoryDigest,
          publicUrl: receipt.publicUrl,
          package: state.package,
          receipt,
          warnings: validation.warnings
        });
      }

      return sendJson(response, 405, {
        ok: false,
        message: "作品分享 mock 只支持 GET 检查、PUT 写入和 OPTIONS 预检。"
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
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
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
      authorization: "optional Bearer token",
      cors: "GET, PUT, OPTIONS"
    },
    packageKind: PACKAGE_KIND,
    requiredTopLevelFields: ["kind", "version", "packageId", "exportedAt", "storageKey", "summary", "records", "shares"],
    receiptFields: ["ok", "message", "packageId", "repositoryDigest", "publicUrl", "remoteVersion", "receipt"]
  };
}

function validateShareRepositoryPackage(payload) {
  const errors = [];
  const warnings = [];
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
  if (!payload.exportedAt) errors.push("缺少 exportedAt");
  if (!payload.storageKey) errors.push("缺少 storageKey");
  if (!payload.summary || typeof payload.summary !== "object") warnings.push("缺少 summary 对象");
  if (!Array.isArray(payload.records) || !payload.records.length) errors.push("缺少 records 数组");
  if (!Array.isArray(payload.shares) || !payload.shares.length) errors.push("缺少 shares 数组");

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

function createReceipt(payload, validation, publicBaseUrl) {
  const firstRecord = payload.records[0] || {};
  const firstShare = payload.shares[0] || {};
  const shareId = String(firstRecord.id || firstShare.shareId || "share");
  const repositoryDigest = sha256StableJson({
    kind: payload.kind,
    version: payload.version,
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
    packageId: `mock-share-repository-${repositoryDigest.slice(0, 12)}`,
    sourcePackageId: String(payload.packageId || ""),
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
      repositoryDigest,
      publicUrl,
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
  RECEIPT_KIND,
  VERSION,
  createContract,
  createShareRepositoryMockServer,
  startShareRepositoryMockServer,
  validateShareRepositoryPackage,
  createReceipt
};
