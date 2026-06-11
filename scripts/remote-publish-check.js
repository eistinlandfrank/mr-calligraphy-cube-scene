#!/usr/bin/env node

global.window = global;

const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key)
};

require("../project-remote-publish.js");

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function run() {
  const adapter = window.MRProjectRemotePublish;
  assert(adapter.packageKind === "mr-calligraphy-remote-publish-package-v1", "远端发布包 kind 应稳定。");

  const unconfigured = await adapter.check("mainScene");
  assert(!unconfigured.ok && unconfigured.message.includes("尚未配置远端发布 API"), "未配置远端发布 API 时不应伪造成功。");

  const invalid = adapter.configure("mainScene", { endpoint: "ftp://example.test/publish" });
  assert(!invalid.ok, "远端发布 API 不应接受非 HTTP 地址。");

  const configuredMain = adapter.configure("mainScene", {
    endpoint: "https://example.test/main-publish",
    token: "main-token"
  });
  assert(configuredMain.ok && configuredMain.status.remoteConfigured, "主场景远端发布 API 应可保存配置。");

  const configuredRealistic = adapter.configure("realisticScene", {
    endpoint: "https://example.test/realistic-publish",
    token: "realistic-token"
  });
  assert(configuredRealistic.ok && configuredRealistic.status.remoteConfigured, "写实场景远端发布 API 应可保存配置。");

  const mainRecord = createPublishedRecord("main-release-1", "主场景课堂版");
  const mainPackage = adapter.createPackage("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(mainPackage.ok, "主场景本机发布记录应能生成远端发布包。");
  assert(mainPackage.package.sceneId === "mainScene", "主场景发布包应保留 sceneId。");
  assert(mainPackage.package.release.id === "main-release-1", "发布包应包含当前 release ID。");
  assert(mainPackage.package.record.layout.objects.table.visible, "发布包应包含本机发布布局。");
  assert(
    mainPackage.package.manifest.kind === "mr-calligraphy-remote-publish-manifest-v1",
    "发布包应包含远端发布 manifest。"
  );
  assert(mainPackage.validation.ok, "生成发布包时应通过本机预检。");
  assert(adapter.validatePackage(mainPackage.package).ok, "远端发布包预检 API 应接受未篡改发布包。");
  assert(/^[a-f0-9]{64}$/.test(mainPackage.package.manifest.packageDigest), "发布包 manifest 应包含 SHA-256 摘要。");
  assert(mainPackage.package.manifest.objectSummary.objectCount === 1, "发布包 manifest 应统计布局对象数量。");
  assert(mainPackage.package.assetManifest.assets.length === 1, "发布包应包含导入模型资产清单。");
  assert(mainPackage.package.assetManifest.assets[0].sha256 === "a".repeat(64), "导入模型资产清单应保留 SHA-256。");
  assert(mainPackage.package.manifest.assetSummary.hashedAssetCount === 1, "发布包 manifest 应统计带哈希资产。");
  assert(/^[a-f0-9]{64}$/.test(mainPackage.package.manifest.assetDigest), "发布包 manifest 应包含资产摘要。");
  const repeatedMainPackage = adapter.createPackage("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(
    repeatedMainPackage.package.manifest.packageDigest === mainPackage.package.manifest.packageDigest,
    "同一发布内容重复生成的 packageDigest 应保持稳定。"
  );
  const tamperedPackage = JSON.parse(JSON.stringify(mainPackage.package));
  tamperedPackage.releaseLayout.objects.table.visible = false;
  const tamperedValidation = adapter.validatePackage(tamperedPackage);
  assert(!tamperedValidation.ok, "远端发布包预检应拒绝摘要不匹配的篡改发布包。");
  assert(
    tamperedValidation.errors.some((item) => item.includes("摘要不匹配")),
    "远端发布包预检应说明摘要不匹配。"
  );
  const tamperedAssetPackage = JSON.parse(JSON.stringify(mainPackage.package));
  tamperedAssetPackage.assetManifest.assets[0].sha256 = "b".repeat(64);
  const tamperedAssetValidation = adapter.validatePackage(tamperedAssetPackage);
  assert(!tamperedAssetValidation.ok, "远端发布包预检应拒绝资产摘要不匹配的发布包。");
  assert(
    tamperedAssetValidation.errors.some((item) => item.includes("资产摘要不匹配")),
    "远端发布包预检应说明资产摘要不匹配。"
  );
  const missingHashRecord = createPublishedRecord("main-release-missing-hash", "缺哈希模型", { assetHash: "" });
  const missingHashPackage = adapter.createPackage("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: missingHashRecord,
    release: missingHashRecord.releases[0]
  });
  assert(missingHashPackage.ok, "缺哈希资产不应阻止生成发布包。");
  assert(missingHashPackage.validation.warnings.some((item) => item.includes("缺少 SHA-256")), "缺哈希资产应给出预检警告。");
  const missingHashWorkflow = adapter.getWorkflow("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: missingHashRecord,
    release: missingHashRecord.releases[0]
  });
  assert(missingHashWorkflow.message.includes("预检警告"), "缺哈希 warning 应进入远端发布工作流提示。");
  const initialWorkflow = adapter.getWorkflow("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(initialWorkflow.canRequestReview, "未审核发布包应允许提交本机审核。");
  assert(!initialWorkflow.canPush, "未审核发布包不应允许远端推送。");

  let pushedMainPackage = null;
  const fetchCalls = [];
  global.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });
    if (options.method === "POST") {
      const body = JSON.parse(options.body);
      if (body.sceneId === "mainScene") pushedMainPackage = body;
      return jsonResponse({
        ok: true,
        message: `${body.sceneLabel}远端发布已接收。`,
        packageId: `accepted-${body.sceneId}`,
        remoteVersion: `${body.sceneId}-remote-v1`
      });
    }
    return jsonResponse({
      ok: true,
      message: "远端发布 API 可访问。",
      remoteVersion: "remote-check-v1"
    });
  };

  const mainCheck = await adapter.check("mainScene");
  assert(mainCheck.ok, "主场景远端发布 API 检查应真实调用 fetch。");
  assert(fetchCalls[0].url === "https://example.test/main-publish", "主场景检查应请求已保存 endpoint。");
  assert(fetchCalls[0].options.headers.Authorization === "Bearer main-token", "主场景检查应携带 token。");

  const blockedBeforeReview = await adapter.push("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(!blockedBeforeReview.ok && blockedBeforeReview.message.includes("审核"), "未审核发布包不应执行远端推送。");
  assert(pushedMainPackage === null, "未审核发布包不应产生 POST body。");

  const reviewRequest = adapter.requestReview("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0],
    note: "课堂版审核"
  });
  assert(reviewRequest.ok && reviewRequest.workflow.canApprove, "提交审核后应进入可审核状态。");
  const blockedDuringReview = await adapter.push("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(!blockedDuringReview.ok && blockedDuringReview.message.includes("审核"), "审核中发布包不应直接推送。");

  const approval = adapter.approveReview("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0],
    note: "同意推送"
  });
  assert(approval.ok && approval.workflow.canPush, "审核通过后应允许推送。");

  const mainPush = await adapter.push("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(mainPush.ok, "主场景发布包应能推送到远端 API。");
  assert(pushedMainPackage.kind === "mr-calligraphy-remote-publish-package-v1", "推送 body 应是远端发布包。");
  assert(pushedMainPackage.manifest.packageDigest === mainPackage.package.manifest.packageDigest, "推送 body 应携带同一 manifest 摘要。");
  assert(pushedMainPackage.assetManifest.assets[0].sha256 === "a".repeat(64), "推送 body 应携带资产 SHA-256。");
  assert(mainPush.packageId === "accepted-mainScene", "主场景推送应记录远端接收 packageId。");
  assert(mainPush.packageDigest === mainPackage.package.manifest.packageDigest, "主场景推送结果应返回本地 packageDigest。");
  assert(mainPush.validation.ok, "主场景推送结果应包含通过的预检结果。");
  const lockedWorkflow = adapter.getWorkflow("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(lockedWorkflow.lockMatches && !lockedWorkflow.canPush, "推送成功后当前发布包应进入发布锁保护。");
  const blockedByLock = await adapter.push("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(!blockedByLock.ok && blockedByLock.message.includes("发布锁"), "发布锁应阻止重复推送同一发布包。");
  const unlocked = adapter.unlock("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(unlocked.ok && !unlocked.workflow.lock.lockedAt, "解除发布锁后应清空锁状态。");

  const realisticRecord = createPublishedRecord("realistic-release-1", "写实样张版");
  const realisticReview = adapter.requestReview("realisticScene", {
    sceneLabel: "写实场景",
    storageKey: "mr-calligraphy-realistic-published-v1",
    record: realisticRecord,
    release: realisticRecord.releases[0]
  });
  assert(realisticReview.ok, "写实场景应可提交远端审核。");
  const realisticApproval = adapter.approveReview("realisticScene", {
    sceneLabel: "写实场景",
    storageKey: "mr-calligraphy-realistic-published-v1",
    record: realisticRecord,
    release: realisticRecord.releases[0]
  });
  assert(realisticApproval.ok && realisticApproval.workflow.canPush, "写实场景审核通过后应允许推送。");
  const realisticPush = await adapter.push("realisticScene", {
    sceneLabel: "写实场景",
    storageKey: "mr-calligraphy-realistic-published-v1",
    record: realisticRecord,
    release: realisticRecord.releases[0]
  });
  assert(realisticPush.ok, "写实场景发布包应能推送到远端 API。");

  const persisted = JSON.parse(storage.get("mr-calligraphy-remote-publish-v1"));
  assert(persisted.scenes.mainScene.endpoint === "https://example.test/main-publish", "主场景远端 endpoint 应持久化。");
  assert(persisted.scenes.mainScene.lastPackageId === "accepted-mainScene", "主场景远端 packageId 应持久化。");
  assert(persisted.scenes.mainScene.lastPackageDigest === mainPackage.package.manifest.packageDigest, "主场景远端 packageDigest 应持久化。");
  assert(persisted.scenes.mainScene.lastReleaseId === "main-release-1", "主场景远端 releaseId 应持久化。");
  assert(persisted.scenes.mainScene.review.status === "approved", "主场景审核通过状态应持久化。");
  assert(persisted.scenes.realisticScene.lastPackageId === "accepted-realisticScene", "写实场景远端 packageId 应持久化。");
  assert(persisted.scenes.realisticScene.lastReleaseId === "realistic-release-1", "写实场景远端 releaseId 应持久化。");
  assert(persisted.scenes.realisticScene.review.status === "approved", "写实场景审核通过状态应持久化。");
  assert(persisted.scenes.realisticScene.lock.packageDigest, "写实场景推送成功后应持久化发布锁。");

  console.log("远端发布检查通过：主后台和写实后台发布包、manifest 摘要、资产清单、资产摘要、发布包预检、审核流、发布锁、endpoint/token、fetch 检查、POST 推送和状态持久化已验证。");
}

function createPublishedRecord(releaseId, note, options = {}) {
  const assetHash = options.assetHash === undefined ? "a".repeat(64) : options.assetHash;
  const importedModel = {
    id: "asset-1",
    dbKey: "asset-1",
    label: "发布模型",
    fileName: "publish-model.glb",
    type: "glb",
    metrics: { fileBytes: 2048, meshCount: 1, vertexCount: 12 },
    ...(assetHash ? { sha256: assetHash } : {})
  };
  const release = {
    id: releaseId,
    releaseNumber: 1,
    publishedAt: "2026-06-11T12:00:00.000Z",
    note,
    action: "publish",
    rollbackFrom: "",
    layout: {
      objects: {
        table: { visible: true, position: [0, 0, 0] }
      },
      customObjects: [],
      importedModels: [importedModel],
      lighting: { ambient: 0.6 }
    },
    stats: {
      objectCount: 1,
      customCount: 0,
      importedCount: 1
    }
  };
  return {
    version: 1,
    currentReleaseId: release.id,
    releaseNumber: release.releaseNumber,
    publishedAt: release.publishedAt,
    note: release.note,
    action: release.action,
    layout: release.layout,
    stats: release.stats,
    releases: [release]
  };
}

function jsonResponse(payload, ok = true, status = 200) {
  return {
    ok,
    status,
    text: async () => JSON.stringify(payload)
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
