#!/usr/bin/env node

global.window = global;

require("../project-schema-utils.js");

const publishedLayout = {
  objects: {},
  layerOrder: [],
  customObjects: [],
  importedModels: [{ id: "asset-1", key: "asset-1", label: "发布模型" }]
};
const realisticPublishedLayout = {
  paper: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
  importedModels: [{ id: "realistic-asset-1", dbKey: "realistic-asset-1", label: "写实发布模型" }]
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
    },
    "mr-calligraphy-realistic-published-v1": {
      value: JSON.stringify({
        version: 1,
        currentReleaseId: "realistic-release-2",
        releaseNumber: 2,
        publishedAt: "2026-06-11T04:00:00.000Z",
        note: "写实正式版",
        action: "rollback",
        rollbackFrom: "realistic-release-1",
        layout: realisticPublishedLayout,
        stats: { objectStateCount: 1, importedCount: 1, deletedCount: 0 },
        releases: [
          {
            id: "realistic-release-2",
            releaseNumber: 2,
            publishedAt: "2026-06-11T04:00:00.000Z",
            note: "写实正式版",
            action: "rollback",
            rollbackFrom: "realistic-release-1",
            layout: realisticPublishedLayout,
            stats: { objectStateCount: 1, importedCount: 1, deletedCount: 0 }
          },
          {
            id: "realistic-release-1",
            releaseNumber: 1,
            publishedAt: "2026-06-11T03:00:00.000Z",
            note: "写实初版",
            action: "publish",
            layout: realisticPublishedLayout,
            stats: { objectStateCount: 1, importedCount: 1, deletedCount: 0 }
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
    },
    realisticModels: {
      records: [{
        data: {
          id: "realistic-asset-1",
          dbKey: "realistic-asset-1",
          label: "写实发布模型",
          fileName: "realistic-release.glb"
        },
        arrayBufferBase64: "BBBB",
        bytes: 3,
        sha256: "2".repeat(64)
      }]
    }
  }
};

const schema = window.MRProjectSchema.createProjectSchema(archive);
const published = schema.sections.mainScene.published;
const realisticPublished = schema.sections.realisticScene.published;
const mainAsset = schema.assetManifest.assets.find((asset) => asset.scene === "main" && asset.id === "asset-1");
const realisticAsset = schema.assetManifest.assets.find((asset) => asset.scene === "realistic" && asset.id === "realistic-asset-1");

assert(published.status === "published-local", "主场景发布状态应为 published-local。");
assert(published.releaseCount === 2, "应统计 2 个主场景发布版本。");
assert(published.releaseNumber === 2, "当前发布版本号应为 2。");
assert(published.latestNote === "课堂正式版", "应保留当前发布说明。");
assert(realisticPublished.status === "published-local", "写实场景发布状态应为 published-local。");
assert(realisticPublished.releaseCount === 2, "应统计 2 个写实发布版本。");
assert(realisticPublished.releaseNumber === 2, "当前写实发布版本号应为 2。");
assert(realisticPublished.latestNote === "写实正式版", "应保留当前写实发布说明。");
assert(realisticPublished.latestAction === "rollback", "应保留当前写实发布动作。");
assert(schema.summary.mainReleases === 2, "summary.mainReleases 应为 2。");
assert(schema.summary.realisticReleases === 2, "summary.realisticReleases 应为 2。");
assert(mainAsset?.hashStatus === "sha256", "主场景资产清单应识别 SHA-256。");
assert(realisticAsset?.hashStatus === "sha256", "写实资产清单应识别 SHA-256。");

console.log("项目 Schema 检查通过：主发布、写实发布和资产哈希已统计。");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
