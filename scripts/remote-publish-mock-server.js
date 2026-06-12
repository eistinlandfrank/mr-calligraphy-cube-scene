#!/usr/bin/env node

const crypto = require("crypto");
const http = require("http");

const PACKAGE_KIND = "mr-calligraphy-remote-publish-package-v1";
const MANIFEST_KIND = "mr-calligraphy-remote-publish-manifest-v1";
const ASSET_SIGNATURE_ALGORITHM = "HMAC-SHA256";
const ASSET_SIGNING_KEY_ID = "remote-publish-mock-asset-hmac-v1";
const VERSION = 1;
const DEFAULT_WORKSPACE_ID = "local-browser";

function createRemotePublishMockServer(options = {}) {
  const requiredToken = String(options.token || process.env.REMOTE_PUBLISH_MOCK_TOKEN || "").trim();
  const signingSecret = String(options.signingSecret || process.env.REMOTE_PUBLISH_MOCK_SIGNING_SECRET || "mr-calligraphy-remote-publish-mock-secret-v1");
  const state = {
    startedAt: new Date().toISOString(),
    latestWorkspaceId: DEFAULT_WORKSPACE_ID,
    workspaces: {},
    received: [],
    byDigest: new Map()
  };

  const server = http.createServer(async (request, response) => {
    try {
      if (request.method === "OPTIONS") {
        return sendEmpty(response, 204);
      }

      const auth = validateAuth(request, requiredToken);
      if (!auth.ok) {
        return sendJson(response, 401, {
          ok: false,
          message: auth.message,
          remoteVersion: "mr-calligraphy-remote-publish-mock-v1"
        });
      }

      if (request.method === "GET") {
        const workspaceId = getRequestWorkspaceId(request);
        const workspace = getWorkspaceState(state, workspaceId);
        const latestReceipt = workspace.received[0] || null;
        const latestPublishReceipt = latestReceipt?.direction === "revoke" ? null : latestReceipt;
        return sendJson(response, 200, {
          ok: true,
          message: `远端发布 mock 服务可访问，空间 ${workspaceId}。`,
          remoteVersion: "mr-calligraphy-remote-publish-mock-v1",
          workspaceId,
          contract: createContract(),
          receiptCount: workspace.received.length,
          latestReceipt,
          publishLock: latestPublishReceipt
            ? {
                locked: true,
                source: "latestReceipt",
                workspaceId,
                sceneId: latestPublishReceipt.sceneId,
                releaseId: latestPublishReceipt.releaseId,
                packageDigest: latestPublishReceipt.packageDigest,
                lockedAt: latestPublishReceipt.acceptedAt,
                reason: "远端 mock 已接收最近发布包，相同 release 或 packageDigest 会被拒绝。"
              }
            : { locked: false }
        });
      }

      if (request.method === "POST") {
        const payload = await readJsonBody(request);
        const workspaceId = getRequestWorkspaceId(request, payload.workspaceId);
        const validation = validateRemotePublishPackage(payload, { workspaceId });
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            warnings: validation.warnings,
            workspaceId,
            remoteVersion: "mr-calligraphy-remote-publish-mock-v1"
          });
        }

        const workspace = getWorkspaceState(state, workspaceId);
        const digest = payload.manifest.packageDigest;
        if (workspace.byDigest.has(digest)) {
          const receipt = workspace.byDigest.get(digest);
          return sendJson(response, 409, {
            ok: false,
            message: `远端发布 mock 在空间 ${workspaceId} 已接收过相同 packageDigest，拒绝重复发布。`,
            workspaceId,
            packageId: receipt.packageId,
            releaseId: receipt.releaseId,
            packageDigest: digest,
            receipt,
            remoteVersion: "mr-calligraphy-remote-publish-mock-v1"
          });
        }

        const receipt = createReceipt(payload, validation, signingSecret, workspaceId);
        workspace.received.unshift(receipt);
        workspace.byDigest.set(digest, receipt);
        state.latestWorkspaceId = workspaceId;
        state.received = workspace.received;
        state.byDigest = workspace.byDigest;
        return sendJson(response, 201, {
          ok: true,
          message: `${payload.sceneLabel || payload.sceneId}远端发布 mock 已接收，空间 ${workspaceId}。`,
          workspaceId,
          packageId: receipt.packageId,
          releaseId: receipt.releaseId,
          packageDigest: receipt.packageDigest,
          remoteVersion: receipt.remoteVersion,
          receipt,
          warnings: validation.warnings
        });
      }

      if (request.method === "DELETE") {
        const revokePackage = await readJsonBody(request);
        const workspaceId = getRequestWorkspaceId(request, revokePackage.workspaceId);
        const validation = validateRemotePublishRevokePackage(revokePackage, { workspaceId });
        if (!validation.ok) {
          return sendJson(response, 422, {
            ok: false,
            message: validation.message,
            errors: validation.errors,
            workspaceId,
            remoteVersion: "mr-calligraphy-remote-publish-mock-v1"
          });
        }
        const workspace = getWorkspaceState(state, workspaceId);
        const matchedReceipt = findReceiptToRevoke(workspace, revokePackage);
        if (!matchedReceipt) {
          return sendJson(response, 404, {
            ok: false,
            message: `远端发布 mock 在空间 ${workspaceId} 未找到可撤销的发布包。`,
            workspaceId,
            sourcePackageId: revokePackage.sourcePackageId || revokePackage.packageId || "",
            releaseId: revokePackage.releaseId || "",
            packageDigest: revokePackage.packageDigest || "",
            remoteVersion: "mr-calligraphy-remote-publish-mock-v1"
          });
        }
        const receipt = createRevokeReceipt(revokePackage, matchedReceipt, workspaceId);
        matchedReceipt.remoteRevokedAt = receipt.revokedAt;
        matchedReceipt.cdnPurgeSummary = receipt.cdnPurgeSummary;
        workspace.byDigest.delete(matchedReceipt.packageDigest);
        workspace.received.unshift(receipt);
        state.latestWorkspaceId = workspaceId;
        state.received = workspace.received;
        state.byDigest = workspace.byDigest;
        return sendJson(response, 200, {
          ok: true,
          message: `${matchedReceipt.sceneId}远端发布 mock 已撤销，空间 ${workspaceId}，并返回 CDN purge 回执。`,
          workspaceId,
          packageId: receipt.packageId,
          sourcePackageId: receipt.sourcePackageId,
          releaseId: receipt.releaseId,
          packageDigest: receipt.packageDigest,
          remoteVersion: receipt.remoteVersion,
          cdnPurgeSummary: receipt.cdnPurgeSummary,
          receipt
        });
      }

      return sendJson(response, 405, {
        ok: false,
        message: "远端发布 mock 只支持 GET 检查、POST 发布包和 DELETE 撤销发布。"
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
      received: [],
      byDigest: new Map()
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

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, createResponseHeaders({
    "Content-Type": "application/json; charset=utf-8",
    ...(payload?.workspaceId ? { "X-MR-Workspace-Id": normalizeWorkspaceId(payload.workspaceId) } : {})
  }));
  response.end(body);
}

function sendEmpty(response, statusCode) {
  response.writeHead(statusCode, createResponseHeaders());
  response.end();
}

function createResponseHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, X-MR-Workspace-Id",
    "Access-Control-Expose-Headers": "X-MR-Workspace-Id",
    "Access-Control-Max-Age": "600",
    "Cache-Control": "no-store",
    ...extra
  };
}

function createContract() {
  return {
    kind: "mr-calligraphy-remote-publish-contract-v1",
    accepts: {
      check: "GET /api/remote-publish",
      publish: "POST /api/remote-publish",
      revoke: "DELETE /api/remote-publish",
      authorization: "optional Bearer token",
      workspaceHeader: "X-MR-Workspace-Id"
    },
    packageKind: PACKAGE_KIND,
    manifestKind: MANIFEST_KIND,
    revokeKind: "mr-calligraphy-remote-publish-revoke-v1",
    defaultWorkspaceId: DEFAULT_WORKSPACE_ID,
    requiredTopLevelFields: ["kind", "version", "packageId", "workspaceId", "sceneId", "release", "record", "releaseLayout", "assetManifest", "manifest"],
    receiptFields: ["ok", "message", "workspaceId", "packageId", "releaseId", "packageDigest", "remoteVersion", "receipt", "receipt.assetSignatures", "receipt.cdnUploadSummary", "receipt.cdnPurgeSummary"],
    lockFields: ["publishLock.locked", "publishLock.workspaceId", "publishLock.sceneId", "publishLock.releaseId", "publishLock.packageDigest", "latestReceipt"]
  };
}

function validateRemotePublishPackage(payload, options = {}) {
  const errors = [];
  const warnings = [];
  const workspaceId = normalizeWorkspaceId(options.workspaceId);
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
  if (!payload.workspaceId) {
    errors.push("缺少 workspaceId");
  } else if (normalizeWorkspaceId(payload.workspaceId) !== workspaceId) {
    errors.push(`发布包 workspaceId ${payload.workspaceId} 与请求空间 ${workspaceId} 不匹配`);
  }
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
    compareField(errors, payload.manifest, expected, "workspaceId", "manifest workspaceId 不匹配");
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

function validateRemotePublishRevokePackage(payload, options = {}) {
  const errors = [];
  const workspaceId = normalizeWorkspaceId(options.workspaceId);
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["撤销包为空"],
      message: "远端发布撤销包为空。"
    };
  }
  if (payload.kind !== "mr-calligraphy-remote-publish-revoke-v1") errors.push("撤销包 kind 不匹配");
  if (Number(payload.version) !== VERSION) errors.push("撤销包版本不匹配");
  if (!payload.revokeId) errors.push("缺少 revokeId");
  if (!payload.workspaceId) {
    errors.push("缺少 workspaceId");
  } else if (normalizeWorkspaceId(payload.workspaceId) !== workspaceId) {
    errors.push(`撤销包 workspaceId ${payload.workspaceId} 与请求空间 ${workspaceId} 不匹配`);
  }
  if (!payload.sceneId) errors.push("缺少 sceneId");
  if (!payload.sourcePackageId && !payload.packageId && !payload.packageDigest && !payload.releaseId) {
    errors.push("缺少可定位原发布包的 sourcePackageId/packageDigest/releaseId");
  }
  const packageDigest = normalizeSha256(payload.packageDigest);
  if (payload.packageDigest && !packageDigest) {
    errors.push("packageDigest 必须是 64 位 SHA-256");
  }
  return {
    ok: errors.length === 0,
    errors,
    message: errors.length ? `远端发布撤销包校验失败：${errors.join("；")}。` : "远端发布撤销包校验通过。"
  };
}

function findReceiptToRevoke(state, revokePackage = {}) {
  const sceneId = normalizeSceneId(revokePackage.sceneId);
  const sourcePackageId = String(revokePackage.sourcePackageId || revokePackage.packageId || "");
  const releaseId = String(revokePackage.releaseId || "");
  const packageDigest = normalizeSha256(revokePackage.packageDigest);
  return state.received.find((receipt) => {
    if (!receipt || receipt.direction === "revoke" || receipt.remoteRevokedAt) return false;
    if (normalizeSceneId(receipt.sceneId) !== sceneId) return false;
    if (packageDigest && receipt.packageDigest === packageDigest) return true;
    if (sourcePackageId && receipt.packageId === sourcePackageId) return true;
    return Boolean(releaseId && receipt.releaseId === releaseId);
  }) || null;
}

function createExpectedManifest(payload) {
  const releaseLayout = payload.releaseLayout || {};
  const assetManifest = normalizeAssetManifest(payload.assetManifest || {});
  return {
    kind: MANIFEST_KIND,
    version: VERSION,
    sceneId: payload.sceneId || "",
    workspaceId: normalizeWorkspaceId(payload.workspaceId),
    releaseId: payload.release?.id || "",
    releaseNumber: Number(payload.release?.releaseNumber || 0),
    storageKey: payload.storageKey || "",
    objectSummary: summarizeReleaseLayout(releaseLayout),
    assetSummary: summarizeAssetManifest(assetManifest),
    packageDigest: sha256StableJson({
      kind: payload.kind,
      version: payload.version,
      sceneId: payload.sceneId,
      workspaceId: normalizeWorkspaceId(payload.workspaceId),
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

function createReceipt(payload, validation, signingSecret, workspaceId = DEFAULT_WORKSPACE_ID) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || payload.workspaceId);
  const packageDigest = payload.manifest.packageDigest;
  const acceptedAt = new Date().toISOString();
  const assetSignatures = createAssetSignatures(payload, acceptedAt, signingSecret);
  const assetSignatureSummary = createAssetSignatureSummary(payload, assetSignatures, acceptedAt);
  const cdnUploadSummary = createCdnUploadSummary(payload, assetSignatures, acceptedAt);
  return {
    receiptKind: "mr-calligraphy-remote-publish-receipt-v1",
    direction: "publish",
    remoteVersion: "mr-calligraphy-remote-publish-mock-v1",
    packageId: `mock-${normalizedWorkspaceId}-${payload.sceneId}-${packageDigest.slice(0, 12)}`,
    workspaceId: normalizedWorkspaceId,
    releaseId: String(payload.release?.id || ""),
    sceneId: String(payload.sceneId || ""),
    packageDigest,
    layoutDigest: payload.manifest.layoutDigest,
    assetDigest: payload.manifest.assetDigest,
    acceptedAt,
    warningCount: validation.warnings.length,
    warnings: validation.warnings,
    cdnUploadSummary,
    assetSignatureSummary,
    assetSignatures,
    receiptDigest: sha256StableJson({
      sceneId: payload.sceneId,
      workspaceId: normalizedWorkspaceId,
      releaseId: payload.release?.id || "",
      packageDigest,
      acceptedAt,
      assetSignatureSummary,
      cdnUploadSummary
    })
  };
}

function createCdnUploadSummary(payload, assetSignatures, acceptedAt) {
  const packageDigest = payload.manifest?.packageDigest || "";
  const baseUrl = `https://mock-cdn.invalid/mr-calligraphy/${payload.sceneId}/${packageDigest.slice(0, 12)}/`;
  const assetUrls = assetSignatures.map((asset, index) => ({
    assetId: asset.assetId,
    dbKey: asset.dbKey,
    modelId: asset.modelId,
    assetKind: asset.assetKind,
    sha256: asset.sha256,
    url: `${baseUrl}${index + 1}-${encodeURIComponent(asset.fileName || asset.assetId)}`
  }));
  return {
    kind: "mr-calligraphy-remote-publish-cdn-upload-summary-v1",
    status: "uploaded",
    cdnProvider: "mock-cdn",
    uploadRequestId: `upload-${packageDigest.slice(0, 12)}`,
    uploadedAssetCount: assetUrls.length,
    uploadedUrlCount: assetUrls.length,
    baseUrl,
    assetDigest: payload.manifest?.assetDigest || "",
    uploadedAt: acceptedAt,
    completedAt: acceptedAt,
    assetUrls
  };
}

function createRevokeReceipt(revokePackage, matchedReceipt, workspaceId = DEFAULT_WORKSPACE_ID) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId || revokePackage.workspaceId || matchedReceipt.workspaceId);
  const acceptedAt = new Date().toISOString();
  const purgedAssetCount = Math.max(
    normalizeCount(matchedReceipt.assetSignatureSummary?.signedAssetCount),
    Array.isArray(matchedReceipt.assetSignatures) ? matchedReceipt.assetSignatures.length : 0
  );
  const cdnPurgeSummary = {
    kind: "mr-calligraphy-remote-publish-cdn-purge-summary-v1",
    status: "accepted",
    cdnProvider: "mock-cdn",
    purgeRequestId: `purge-${matchedReceipt.packageDigest.slice(0, 12)}`,
    purgedAssetCount,
    purgedUrlCount: Math.max(1, purgedAssetCount),
    requestedAt: revokePackage.requestedAt || "",
    completedAt: acceptedAt
  };
  const packageId = `mock-revoke-${normalizedWorkspaceId}-${matchedReceipt.sceneId}-${matchedReceipt.packageDigest.slice(0, 12)}`;
  const receiptDigest = sha256StableJson({
    direction: "revoke",
    workspaceId: normalizedWorkspaceId,
    sceneId: matchedReceipt.sceneId,
    packageId,
    sourcePackageId: matchedReceipt.packageId,
    releaseId: matchedReceipt.releaseId,
    packageDigest: matchedReceipt.packageDigest,
    acceptedAt,
    revokedAt: acceptedAt,
    cdnPurgeSummary
  });
  return {
    receiptKind: "mr-calligraphy-remote-publish-revoke-receipt-v1",
    direction: "revoke",
    remoteVersion: "mr-calligraphy-remote-publish-mock-v1",
    packageId,
    sourcePackageId: matchedReceipt.packageId,
    workspaceId: normalizedWorkspaceId,
    releaseId: matchedReceipt.releaseId,
    sceneId: matchedReceipt.sceneId,
    packageDigest: matchedReceipt.packageDigest,
    acceptedAt,
    revokedAt: acceptedAt,
    cdnPurgeSummary,
    reason: String(revokePackage.reason || "").slice(0, 160),
    receiptDigest
  };
}

function createAssetSignatures(payload, acceptedAt, signingSecret) {
  const assetManifest = normalizeAssetManifest(payload.assetManifest || {});
  return assetManifest.assets.filter((asset) => asset.sha256).map((asset) => {
    const signaturePayload = {
      sceneId: payload.sceneId || "",
      workspaceId: normalizeWorkspaceId(payload.workspaceId),
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

function normalizeCount(value, max = 9999) {
  const count = Math.max(0, Math.round(Number(value || 0)));
  return Math.min(count, max);
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
