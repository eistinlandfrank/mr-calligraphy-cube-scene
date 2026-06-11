#!/usr/bin/env node

const crypto = require("crypto");
const http = require("http");

const PACKAGE_KIND = "mr-calligraphy-report-repository-v1";
const VERSION = 1;

function createReportRepositoryMockServer(options = {}) {
  const requiredToken = String(options.token || process.env.REPORT_REPOSITORY_MOCK_TOKEN || "").trim();
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
      if (!isReportRepositoryPath(request.url)) {
        return sendJson(response, 404, {
          ok: false,
          message: "报告仓库 mock 只提供 /api/report-repository。"
        });
      }

      const auth = validateAuth(request, requiredToken);
      if (!auth.ok) {
        return sendJson(response, 401, {
          ok: false,
          message: auth.message,
          remoteVersion: "mr-calligraphy-report-repository-mock-v1"
        });
      }

      if (request.method === "GET") {
        const reportCount = getReportCount(state.package);
        return sendJson(response, 200, {
          ok: true,
          message: state.package
            ? `远端报告仓库 mock 可读，当前包含 ${reportCount} 份报告。`
            : "远端报告仓库 mock 服务可访问，当前尚未接收报告包。",
          remoteVersion: "mr-calligraphy-report-repository-mock-v1",
          contract: createContract(),
          package: state.package,
          receiptCount: state.receipts.length,
          latestReceipt: state.receipts[0] || null
        });
      }

      if (request.method === "PUT") {
        const payload = await readJsonBody(request);
        const validation = validateReportRepositoryPackage(payload);
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            warnings: validation.warnings,
            remoteVersion: "mr-calligraphy-report-repository-mock-v1"
          });
        }

        const receipt = createReceipt(payload, validation);
        state.package = {
          ...clone(payload),
          packageId: receipt.packageId,
          acceptedAt: receipt.acceptedAt,
          repositoryDigest: receipt.repositoryDigest
        };
        state.receipts.unshift(receipt);

        return sendJson(response, 201, {
          ok: true,
          message: `远端报告仓库 mock 已接收 ${receipt.reportCount} 份报告。`,
          remoteVersion: receipt.remoteVersion,
          packageId: receipt.packageId,
          repositoryDigest: receipt.repositoryDigest,
          package: state.package,
          receipt,
          warnings: validation.warnings
        });
      }

      return sendJson(response, 405, {
        ok: false,
        message: "报告仓库 mock 只支持 GET 检查、PUT 写入和 OPTIONS 预检。"
      });
    } catch (error) {
      return sendJson(response, 500, {
        ok: false,
        message: `报告仓库 mock 处理失败：${error?.message || "未知错误"}。`
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

function startReportRepositoryMockServer(options = {}) {
  const mock = createReportRepositoryMockServer(options);
  return mock.start(options).then((info) => ({
    ...mock,
    ...info
  }));
}

function startServer(server, options = {}) {
  const host = String(options.host || process.env.REPORT_REPOSITORY_MOCK_HOST || "127.0.0.1");
  const port = Number(options.port || process.env.REPORT_REPOSITORY_MOCK_PORT || 0);
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
        endpoint: `${baseUrl}/api/report-repository`
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

function isReportRepositoryPath(url) {
  try {
    const parsed = new URL(url || "/", "http://localhost");
    return parsed.pathname === "/api/report-repository";
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
  return { ok: false, message: "报告仓库 mock 拒绝请求：Authorization token 不匹配。" };
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
    kind: "mr-calligraphy-report-repository-contract-v1",
    accepts: {
      check: "GET /api/report-repository",
      push: "PUT /api/report-repository",
      pull: "GET /api/report-repository",
      authorization: "optional Bearer token",
      cors: "GET, PUT, OPTIONS"
    },
    packageKind: PACKAGE_KIND,
    requiredTopLevelFields: ["kind", "version", "packageId", "exportedAt", "storageKey", "summary", "reports", "verifications"],
    requiredReportFields: ["id", "createdAt", "averageScore"],
    receiptFields: ["ok", "message", "packageId", "repositoryDigest", "remoteVersion", "receipt"]
  };
}

function validateReportRepositoryPackage(payload) {
  const errors = [];
  const warnings = [];
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["报告仓库包为空"],
      warnings,
      message: "报告仓库包为空。"
    };
  }

  if (payload.kind !== PACKAGE_KIND) errors.push("报告仓库包 kind 不匹配");
  if (Number(payload.version) !== VERSION) errors.push("报告仓库包版本不匹配");
  if (!payload.packageId) errors.push("缺少 packageId");
  if (!payload.exportedAt) errors.push("缺少 exportedAt");
  if (!payload.storageKey) errors.push("缺少 storageKey");
  if (!payload.summary || typeof payload.summary !== "object") errors.push("缺少 summary");
  validateReportList(payload.reports, errors);
  validateVerificationList(payload.verifications, payload.reports, errors, warnings);

  const reportCount = getReportCount(payload);
  if (!reportCount) errors.push("reports 为空");
  if (payload.summary && Number(payload.summary.total || 0) !== reportCount) {
    warnings.push(`summary.total 为 ${Number(payload.summary.total || 0)}，实际 reports 为 ${reportCount}。`);
  }
  const verifiedCount = Array.isArray(payload.verifications)
    ? payload.verifications.filter((item) => /^[a-f0-9]{64}$/.test(String(item?.digest || ""))).length
    : 0;
  if (payload.summary && Number(payload.summary.verifiedReportCount || 0) !== verifiedCount) {
    warnings.push(`summary.verifiedReportCount 为 ${Number(payload.summary.verifiedReportCount || 0)}，实际验真摘要为 ${verifiedCount}。`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    message: errors.length ? `报告仓库包校验失败：${errors.join("；")}。` : "报告仓库包校验通过。"
  };
}

function validateReportList(value, errors) {
  if (!Array.isArray(value)) {
    errors.push("reports 不是数组");
    return;
  }
  value.forEach((report, index) => {
    if (!report || typeof report !== "object") {
      errors.push(`reports[${index}] 不是对象`);
      return;
    }
    ["id", "createdAt", "averageScore"].forEach((field) => {
      if (report[field] === undefined || report[field] === null || report[field] === "") {
        errors.push(`reports[${index}] 缺少 ${field}`);
      }
    });
  });
}

function validateVerificationList(value, reports, errors, warnings) {
  if (!Array.isArray(value)) {
    errors.push("verifications 不是数组");
    return;
  }
  const reportIds = new Set(Array.isArray(reports) ? reports.map((report) => String(report?.id || "")) : []);
  value.forEach((verification, index) => {
    if (!verification || typeof verification !== "object") {
      errors.push(`verifications[${index}] 不是对象`);
      return;
    }
    if (!reportIds.has(String(verification.reportId || ""))) {
      warnings.push(`verifications[${index}] 没有关联到 reports。`);
    }
    if (!/^[a-f0-9]{64}$/.test(String(verification.digest || ""))) {
      errors.push(`verifications[${index}] digest 不是 64 位 SHA-256。`);
    }
  });
}

function createReceipt(payload, validation) {
  const repositoryDigest = sha256StableJson({
    kind: payload.kind,
    version: payload.version,
    storageKey: payload.storageKey,
    summary: payload.summary,
    reports: payload.reports,
    verifications: payload.verifications
  });
  const acceptedAt = new Date().toISOString();
  const reportCount = getReportCount(payload);
  return {
    receiptKind: "mr-calligraphy-report-repository-receipt-v1",
    remoteVersion: "mr-calligraphy-report-repository-mock-v1",
    packageId: `mock-report-repository-${repositoryDigest.slice(0, 12)}`,
    sourcePackageId: String(payload.packageId || ""),
    repositoryDigest,
    acceptedAt,
    reportCount,
    warningCount: validation.warnings.length,
    warnings: validation.warnings,
    receiptDigest: sha256StableJson({
      sourcePackageId: payload.packageId,
      repositoryDigest,
      acceptedAt
    })
  };
}

function getReportCount(payload) {
  return Array.isArray(payload?.reports) ? payload.reports.length : 0;
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
  const mock = await startReportRepositoryMockServer({
    host: process.env.REPORT_REPOSITORY_MOCK_HOST || "127.0.0.1",
    port: process.env.REPORT_REPOSITORY_MOCK_PORT || 0,
    token: process.env.REPORT_REPOSITORY_MOCK_TOKEN || ""
  });
  console.log(`报告仓库 mock 服务已启动：${mock.endpoint}`);
  if (process.env.REPORT_REPOSITORY_MOCK_TOKEN) {
    console.log("需要 Authorization: Bearer <REPORT_REPOSITORY_MOCK_TOKEN>");
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
  createReportRepositoryMockServer,
  startReportRepositoryMockServer,
  validateReportRepositoryPackage
};
