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

  const mainPush = await adapter.push("mainScene", {
    sceneLabel: "主场景",
    storageKey: "mr-calligraphy-main-scene-published-v1",
    record: mainRecord,
    release: mainRecord.releases[0]
  });
  assert(mainPush.ok, "主场景发布包应能推送到远端 API。");
  assert(pushedMainPackage.kind === "mr-calligraphy-remote-publish-package-v1", "推送 body 应是远端发布包。");
  assert(pushedMainPackage.manifest.packageDigest === mainPackage.package.manifest.packageDigest, "推送 body 应携带同一 manifest 摘要。");
  assert(mainPush.packageId === "accepted-mainScene", "主场景推送应记录远端接收 packageId。");
  assert(mainPush.packageDigest === mainPackage.package.manifest.packageDigest, "主场景推送结果应返回本地 packageDigest。");
  assert(mainPush.validation.ok, "主场景推送结果应包含通过的预检结果。");

  const realisticRecord = createPublishedRecord("realistic-release-1", "写实样张版");
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
  assert(persisted.scenes.realisticScene.lastPackageId === "accepted-realisticScene", "写实场景远端 packageId 应持久化。");
  assert(persisted.scenes.realisticScene.lastReleaseId === "realistic-release-1", "写实场景远端 releaseId 应持久化。");

  console.log("远端发布检查通过：主后台和写实后台发布包、manifest 摘要、发布包预检、endpoint/token、fetch 检查、POST 推送和状态持久化已验证。");
}

function createPublishedRecord(releaseId, note) {
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
      importedModels: [],
      lighting: { ambient: 0.6 }
    },
    stats: {
      objectCount: 1,
      customCount: 0,
      importedCount: 0
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
