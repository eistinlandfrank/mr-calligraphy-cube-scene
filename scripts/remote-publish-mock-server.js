#!/usr/bin/env node

const crypto = require("crypto");
const http = require("http");

const PACKAGE_KIND = "mr-calligraphy-remote-publish-package-v1";
const MANIFEST_KIND = "mr-calligraphy-remote-publish-manifest-v1";
const ASSET_SIGNATURE_ALGORITHM = "HMAC-SHA256";
const ASSET_SIGNING_KEY_ID = "remote-publish-mock-asset-hmac-v1";
const VERSION = 1;

function createRemotePublishMockServer(options = {}) {
  const requiredToken = String(options.token || process.env.REMOTE_PUBLISH_MOCK_TOKEN || "").trim();
  const signingSecret = String(options.signingSecret || process.env.REMOTE_PUBLISH_MOCK_SIGNING_SECRET || "mr-calligraphy-remote-publish-mock-secret-v1");
  const state = {
    startedAt: new Date().toISOString(),
    received: [],
    byDigest: new Map()
  };

  const server = http.createServer(async (request, response) => {
    try {
      const auth = validateAuth(request, requiredToken);
      if (!auth.ok) {
        return sendJson(response, 401, {
          ok: false,
          message: auth.message,
          remoteVersion: "mr-calligraphy-remote-publish-mock-v1"
        });
      }

      if (request.method === "GET") {
        const latestReceipt = state.received[0] || null;
        return sendJson(response, 200, {
          ok: true,
          message: "远端发布 mock 服务可访问。",
          remoteVersion: "mr-calligraphy-remote-publish-mock-v1",
          contract: createContract(),
          receiptCount: state.received.length,
          latestReceipt,
          publishLock: latestReceipt
            ? {
                locked: true,
                source: "latestReceipt",
                sceneId: latestReceipt.sceneId,
                releaseId: latestReceipt.releaseId,
                packageDigest: latestReceipt.packageDigest,
                lockedAt: latestReceipt.acceptedAt,
                reason: "远端 mock 已接收最近发布包，相同 release 或 packageDigest 会被拒绝。"
              }
            : { locked: false }
        });
      }

      if (request.method === "POST") {
        const payload = await readJsonBody(request);
        const validation = validateRemotePublishPackage(payload);
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            warnings: validation.warnings,
            remoteVersion: "mr-calligraphy-remote-publish-mock-v1"
          });
        }

        const digest = payload.manifest.packageDigest;
        if (state.byDigest.has(digest)) {
          const receipt = state.byDigest.get(digest);
          return sendJson(response, 409, {
            ok: false,
            message: "远端发布 mock 已接收过相同 packageDigest，拒绝重复发布。",
            packageId: receipt.packageId,
            releaseId: receipt.releaseId,
            packageDigest: digest,
            receipt,
            remoteVersion: "mr-calligraphy-remote-publish-mock-v1"
          });
        }

        const receipt = createReceipt(payload, validation, signingSecret);
        state.received.unshift(receipt);
        state.byDigest.set(digest, receipt);
        return sendJson(response, 201, {
          ok: true,
          message: `${payload.sceneLabel || payload.sceneId}远端发布 mock 已接收。`,
          packageId: receipt.packageId,
          releaseId: receipt.releaseId,
          packageDigest: receipt.packageDigest,
          remoteVersion: receipt.remoteVersion,
          receipt,
          warnings: validation.warnings
        });
      }

      return sendJson(response, 405, {
        ok: false,
        message: "远端发布 mock 只支持 GET 检查和 POST 发布包。"
      });
    } catch (error) {
      return sendJson(response, 500, {
        ok: false,
        message: `远端发布 mock 处理失败：${error?.message || "未知错误"}。`
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

function startRemotePublishMockServer(options = {}) {
  const mock = createRemotePublishMockServer(options);
  return mock.start(options).then((info) => ({
    ...mock,
    ...info
  }));
}

function startServer(server, options = {}) {
  const host = String(options.host || process.env.REMOTE_PUBLISH_MOCK_HOST || "127.0.0.1");
  const port = Number(options.port || process.env.REMOTE_PUBLISH_MOCK_PORT || 0);
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
        endpoint: `${baseUrl}/api/remote-publish`
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

function validateAuth(request, requiredToken) {
  if (!requiredToken) {
    return { ok: true };
  }
  const expected = `Bearer ${requiredToken}`;
  if (request.headers.authorization === expected) {
    return { ok: true };
  }
  return { ok: false, message: "远端发布 mock 拒绝请求：Authorization token 不匹配。" };
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

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(body);
}

function createContract() {
  return {
    kind: "mr-calligraphy-remote-publish-contract-v1",
    accepts: {
      check: "GET /api/remote-publish",
      publish: "POST /api/remote-publish",
      authorization: "optional Bearer token"
    },
    packageKind: PACKAGE_KIND,
    manifestKind: MANIFEST_KIND,
    requiredTopLevelFields: ["kind", "version", "packageId", "sceneId", "release", "record", "releaseLayout", "assetManifest", "manifest"],
    receiptFields: ["ok", "message", "packageId", "releaseId", "packageDigest", "remoteVersion", "receipt", "receipt.assetSignatures"],
    lockFields: ["publishLock.locked", "publishLock.sceneId", "publishLock.releaseId", "publishLock.packageDigest", "latestReceipt"]
  };
}

function validateRemotePublishPackage(payload) {
  const errors = [];
  const warnings = [];
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["发布包为空"],
      warnings,
      message: "远端发布包为空。"
    };
  }
  if (payload.kind !== PACKAGE_KIND) errors.push("发布包 kind 不匹配");
  if (Number(payload.version) !== VERSION) errors.push("发布包版本不匹配");
  if (!payload.packageId) errors.push("缺少 packageId");
  if (!payload.sceneId) errors.push("缺少 sceneId");
  if (!payload.release?.id) errors.push("缺少 release.id");
  if (!payload.record?.layout) errors.push("缺少 record.layout");
  if (!payload.releaseLayout || typeof payload.releaseLayout !== "object") errors.push("缺少 releaseLayout");
  if (!payload.assetManifest || typeof payload.assetManifest !== "object") errors.push("缺少 assetManifest");
  if (!payload.manifest || typeof payload.manifest !== "object") errors.push("缺少 manifest");

  if (payload.manifest && typeof payload.manifest === "object") {
    const expected = createExpectedManifest(payload);
    compareField(errors, payload.manifest, expected, "kind", "manifest kind 不匹配");
    compareField(errors, payload.manifest, expected, "sceneId", "manifest sceneId 不匹配");
    compareField(errors, payload.manifest, expected, "releaseId", "manifest releaseId 不匹配");
    compareField(errors, payload.manifest, expected, "packageDigest", "发布包摘要不匹配");
    compareField(errors, payload.manifest, expected, "recordDigest", "发布记录摘要不匹配");
    compareField(errors, payload.manifest, expected, "releaseDigest", "release 摘要不匹配");
    compareField(errors, payload.manifest, expected, "layoutDigest", "布局摘要不匹配");
    compareField(errors, payload.manifest, expected, "assetDigest", "资产摘要不匹配");
    if (stableStringify(payload.manifest.objectSummary || {}) !== stableStringify(expected.objectSummary)) {
      errors.push("布局对象摘要不匹配");
    }
    if (stableStringify(payload.manifest.assetSummary || {}) !== stableStringify(expected.assetSummary)) {
      errors.push("资产摘要统计不匹配");
    }
  }

  const assetSummary = payload.manifest?.assetSummary || {};
  if (Number(assetSummary.missingHashCount || 0) > 0) {
    warnings.push(`远端发布包有 ${assetSummary.missingHashCount} 个导入模型缺少 SHA-256。`);
  }
  if (!assetManifestMatchesLayout(payload.assetManifest, payload.releaseLayout)) {
    errors.push("导入模型资产清单与布局不匹配");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    message: errors.length ? `远端发布包校验失败：${errors.join("；")}。` : "远端发布包校验通过。"
  };
}

function createExpectedManifest(payload) {
  const releaseLayout = payload.releaseLayout || {};
  const assetManifest = normalizeAssetManifest(payload.assetManifest || {});
  return {
    kind: MANIFEST_KIND,
    version: VERSION,
    sceneId: payload.sceneId || "",
    releaseId: payload.release?.id || "",
    releaseNumber: Number(payload.release?.releaseNumber || 0),
    storageKey: payload.storageKey || "",
    objectSummary: summarizeReleaseLayout(releaseLayout),
    assetSummary: summarizeAssetManifest(assetManifest),
    packageDigest: sha256StableJson({
      kind: payload.kind,
      version: payload.version,
      sceneId: payload.sceneId,
      sceneLabel: payload.sceneLabel,
      storageKey: payload.storageKey,
      release: payload.release,
      record: payload.record,
      releaseLayout: payload.releaseLayout,
      assetManifest
    }),
    recordDigest: sha256StableJson(payload.record || {}),
    releaseDigest: sha256StableJson(payload.release || {}),
    layoutDigest: sha256StableJson(releaseLayout),
    assetDigest: sha256StableJson(assetManifest)
  };
}

function summarizeReleaseLayout(layout = {}) {
  const objects = layout.objects && typeof layout.objects === "object" ? layout.objects : {};
  const customObjects = Array.isArray(layout.customObjects) ? layout.customObjects : [];
  const importedModels = Array.isArray(layout.importedModels) ? layout.importedModels : [];
  return {
    objectCount: Object.keys(objects).length,
    visibleObjectCount: Object.values(objects).filter((object) => object?.visible !== false && object?.deleted !== true).length,
    customObjectCount: customObjects.length,
    importedModelCount: importedModels.length,
    hasLighting: Boolean(layout.lighting && typeof layout.lighting === "object"),
    hasLayerOrder: Array.isArray(layout.layerOrder)
  };
}

function normalizeAssetManifest(manifest = {}) {
  const source = manifest && typeof manifest === "object" ? manifest : {};
  const assets = Array.isArray(source.assets) ? source.assets : [];
  return {
    version: VERSION,
    sceneId: normalizeSceneId(source.sceneId),
    assets: assets.map((asset, index) => normalizeAssetRecord(asset, index))
  };
}

function normalizeAssetRecord(asset = {}, index = 0) {
  const id = String(asset?.id || asset?.dbKey || asset?.key || `asset-${index + 1}`);
  const dbKey = String(asset?.dbKey || asset?.key || asset?.id || id);
  const sha256 = normalizeSha256(asset?.sha256);
  const assetKind = asset?.assetKind === "texture" ? "texture" : "model";
  return {
    id,
    dbKey,
    modelId: String(asset?.modelId || (assetKind === "model" ? id : "")).slice(0, 160),
    assetKind,
    label: String(asset?.label || asset?.fileName || id).slice(0, 120),
    fileName: String(asset?.fileName || "").slice(0, 160),
    type: String(asset?.type || "").slice(0, 16),
    bytes: Math.max(0, Math.round(Number(asset?.bytes || asset?.metrics?.fileBytes || 0))),
    sha256,
    hashStatus: sha256 ? "sha256" : "missing-hash"
  };
}

function summarizeAssetManifest(manifest = {}) {
  const normalized = normalizeAssetManifest(manifest);
  const assets = normalized.assets;
  const modelAssets = assets.filter((asset) => asset.assetKind !== "texture");
  const textureAssets = assets.filter((asset) => asset.assetKind === "texture");
  return {
    importedModelCount: modelAssets.length,
    assetCount: assets.length,
    modelAssetCount: modelAssets.length,
    textureAssetCount: textureAssets.length,
    hashedAssetCount: assets.filter((asset) => Boolean(asset.sha256)).length,
    missingHashCount: assets.filter((asset) => !asset.sha256).length,
    totalBytes: assets.reduce((sum, asset) => sum + Math.max(0, Number(asset.bytes || 0)), 0)
  };
}

function assetManifestMatchesLayout(assetManifest = {}, layout = {}) {
  const importedModels = Array.isArray(layout?.importedModels) ? layout.importedModels : [];
  const layoutIds = new Set(importedModels.map((record, index) => {
    return String(record?.id || record?.dbKey || record?.key || `asset-${index + 1}`);
  }));
  const assets = normalizeAssetManifest(assetManifest).assets;
  const modelAssetIds = new Set(assets.filter((asset) => asset.assetKind !== "texture").map((asset) => asset.id));
  if (layoutIds.size !== modelAssetIds.size) return false;
  if (![...layoutIds].every((id) => modelAssetIds.has(id))) return false;
  const textureKeys = new Set(importedModels.map((record) => {
    const texture = record?.texture && typeof record.texture === "object" ? record.texture : null;
    return texture ? String(texture.dbKey || texture.key || texture.id || "") : "";
  }).filter(Boolean));
  const textureAssetKeys = new Set(assets.filter((asset) => asset.assetKind === "texture").map((asset) => asset.dbKey || asset.id).filter(Boolean));
  if (textureKeys.size !== textureAssetKeys.size) return false;
  return [...textureKeys].every((key) => textureAssetKeys.has(key));
}

function createReceipt(payload, validation, signingSecret) {
  const packageDigest = payload.manifest.packageDigest;
  const acceptedAt = new Date().toISOString();
  const assetSignatures = createAssetSignatures(payload, acceptedAt, signingSecret);
  const assetSignatureSummary = createAssetSignatureSummary(payload, assetSignatures, acceptedAt);
  return {
    receiptKind: "mr-calligraphy-remote-publish-receipt-v1",
    remoteVersion: "mr-calligraphy-remote-publish-mock-v1",
    packageId: `mock-${payload.sceneId}-${packageDigest.slice(0, 12)}`,
    releaseId: String(payload.release?.id || ""),
    sceneId: String(payload.sceneId || ""),
    packageDigest,
    layoutDigest: payload.manifest.layoutDigest,
    assetDigest: payload.manifest.assetDigest,
    acceptedAt,
    warningCount: validation.warnings.length,
    warnings: validation.warnings,
    assetSignatureSummary,
    assetSignatures,
    receiptDigest: sha256StableJson({
      sceneId: payload.sceneId,
      releaseId: payload.release?.id || "",
      packageDigest,
      acceptedAt,
      assetSignatureSummary
    })
  };
}

function createAssetSignatures(payload, acceptedAt, signingSecret) {
  const assetManifest = normalizeAssetManifest(payload.assetManifest || {});
  return assetManifest.assets.filter((asset) => asset.sha256).map((asset) => {
    const signaturePayload = {
      sceneId: payload.sceneId || "",
      releaseId: payload.release?.id || "",
      packageDigest: payload.manifest?.packageDigest || "",
      assetDigest: payload.manifest?.assetDigest || "",
      assetId: asset.id,
      dbKey: asset.dbKey,
      modelId: asset.modelId,
      assetKind: asset.assetKind,
      sha256: asset.sha256,
      bytes: asset.bytes
    };
    return {
      assetId: asset.id,
      dbKey: asset.dbKey,
      modelId: asset.modelId,
      assetKind: asset.assetKind,
      fileName: asset.fileName,
      bytes: asset.bytes,
      sha256: asset.sha256,
      packageDigest: payload.manifest?.packageDigest || "",
      assetDigest: payload.manifest?.assetDigest || "",
      signatureAlgorithm: ASSET_SIGNATURE_ALGORITHM,
      signingKeyId: ASSET_SIGNING_KEY_ID,
      signature: hmacStableJson(signingSecret, signaturePayload),
      signedAt: acceptedAt
    };
  });
}

function createAssetSignatureSummary(payload, assetSignatures, acceptedAt) {
  const assetManifest = normalizeAssetManifest(payload.assetManifest || {});
  const unsignedAssetCount = assetManifest.assets.filter((asset) => !asset.sha256).length;
  return {
    kind: "mr-calligraphy-remote-publish-asset-signature-summary-v1",
    signedAssetCount: assetSignatures.length,
    unsignedAssetCount,
    missingHashCount: unsignedAssetCount,
    signatureAlgorithm: ASSET_SIGNATURE_ALGORITHM,
    signingKeyId: ASSET_SIGNING_KEY_ID,
    assetDigest: payload.manifest?.assetDigest || "",
    signedAt: acceptedAt
  };
}

function compareField(errors, actual, expected, key, message) {
  if (actual?.[key] !== expected?.[key]) {
    errors.push(message);
  }
}

function sha256StableJson(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function hmacStableJson(secret, value) {
  return crypto.createHmac("sha256", secret).update(stableStringify(value)).digest("hex");
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

function normalizeSceneId(sceneId) {
  return sceneId === "realisticScene" ? "realisticScene" : "mainScene";
}

function normalizeSha256(value) {
  const hash = String(value || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
}

async function runCli() {
  const mock = await startRemotePublishMockServer({
    host: process.env.REMOTE_PUBLISH_MOCK_HOST || "127.0.0.1",
    port: process.env.REMOTE_PUBLISH_MOCK_PORT || 0,
    token: process.env.REMOTE_PUBLISH_MOCK_TOKEN || ""
  });
  console.log(`远端发布 mock 服务已启动：${mock.endpoint}`);
  if (process.env.REMOTE_PUBLISH_MOCK_TOKEN) {
    console.log("需要 Authorization: Bearer <REMOTE_PUBLISH_MOCK_TOKEN>");
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
  MANIFEST_KIND,
  createContract,
  createRemotePublishMockServer,
  startRemotePublishMockServer,
  validateRemotePublishPackage
};
