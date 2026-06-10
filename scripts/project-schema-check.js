#!/usr/bin/env node

global.window = global;

require("../project-schema-utils.js");

const publishedLayout = {
  objects: {},
  layerOrder: [],
  customObjects: [],
  importedModels: [{ id: "asset-1", key: "asset-1", label: "发布模型" }]
};
const archive = {
  exportedAt: "2026-06-11T00:00:00.000Z",
  source: "project-schema-check",
  storage: {
    "mr-calligraphy-main-scene-published-v1": {
      value: JSON.stringify({
        version: 1,
        currentReleaseId: "release-2",
        releaseNumber: 2,
        publishedAt: "2026-06-11T02:00:00.000Z",
        note: "课堂正式版",
        action: "publish",
        layout: publishedLayout,
        stats: { objectCount: 1, importedCount: 1 },
        releases: [
          {
            id: "release-2",
            releaseNumber: 2,
            publishedAt: "2026-06-11T02:00:00.000Z",
            note: "课堂正式版",
            action: "publish",
            layout: publishedLayout,
            stats: { objectCount: 1, importedCount: 1 }
          },
          {
            id: "release-1",
            releaseNumber: 1,
            publishedAt: "2026-06-11T01:00:00.000Z",
            note: "初版",
            action: "publish",
            layout: publishedLayout,
            stats: { objectCount: 1, importedCount: 1 }
          }
        ]
      })
    }
  },
  indexedDb: {
    mainModels: {
      records: [{
        data: {
          id: "asset-1",
          key: "asset-1",
          label: "发布模型",
          fileName: "release.glb"
        },
        arrayBufferBase64: "AAAA",
        bytes: 3,
        sha256: "1".repeat(64)
      }]
    }
  }
};

const schema = window.MRProjectSchema.createProjectSchema(archive);
const published = schema.sections.mainScene.published;

assert(published.status === "published-local", "主场景发布状态应为 published-local。");
assert(published.releaseCount === 2, "应统计 2 个主场景发布版本。");
assert(published.releaseNumber === 2, "当前发布版本号应为 2。");
assert(published.latestNote === "课堂正式版", "应保留当前发布说明。");
assert(schema.summary.mainReleases === 2, "summary.mainReleases 应为 2。");
assert(schema.assetManifest.assets[0].hashStatus === "sha256", "资产清单应识别 SHA-256。");

console.log("项目 Schema 检查通过：主发布版本和资产哈希已统计。");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
