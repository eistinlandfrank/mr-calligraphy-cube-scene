#!/usr/bin/env node

global.window = global;

require("../project-schema-utils.js");

const publishedLayout = {
  objects: { "main-table": { hidden: false, locked: false } },
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
    "mr-calligraphy-main-scene-layout-v1": {
      value: JSON.stringify({
        objects: { "main-table": { hidden: false, locked: false } },
        layerOrder: ["main-table"],
        customObjects: [{ id: "custom-paper", label: "自定义宣纸" }],
        importedModels: [{ id: "asset-1", key: "asset-1", label: "发布模型" }],
        lighting: { ambient: 0.5 }
      })
    },
    "mr-calligraphy-main-scene-history-v1": {
      value: JSON.stringify({
        snapshots: [{ id: "main-snapshot-1", createdAt: "2026-06-11T01:30:00.000Z" }]
      })
    },
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
    "mr-calligraphy-realistic-layout-v1": {
      value: JSON.stringify({
        paper: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
        importedModels: [{ id: "realistic-asset-1", dbKey: "realistic-asset-1", label: "写实发布模型" }]
      })
    },
    "mr-calligraphy-realistic-history-v1": {
      value: JSON.stringify({
        snapshots: [{ id: "realistic-snapshot-1", createdAt: "2026-06-11T03:30:00.000Z" }]
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
const repository = schema.repository;
const repositoryStatus = window.MRProjectSchema.createProjectRepositoryStatus(archive);
const mainRepositoryScene = repository.scenes.find((scene) => scene.sceneId === "main");
const realisticRepositoryScene = repository.scenes.find((scene) => scene.sceneId === "realistic");

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
assert(schema.assetManifest.assetCoverage === "indexed-db-snapshot", "资产清单应来自 IndexedDB 快照。");
assert(mainAsset?.hashStatus === "sha256", "主场景资产清单应识别 SHA-256。");
assert(realisticAsset?.hashStatus === "sha256", "写实资产清单应识别 SHA-256。");
assert(repository.kind === "mr-calligraphy-project-repository-v1", "schema 应包含项目仓库状态。");
assert(repository.status === "ready", "项目仓库状态应为 ready。");
assert(repository.summary.sceneCount === 2, "项目仓库应统一统计两个后台场景。");
assert(repository.summary.readySceneCount === 2, "两个后台场景都应为 ready。");
assert(repository.summary.snapshotCount === 2, "项目仓库应统计主后台和写实后台快照。");
assert(repository.summary.unknownBinaryCount === 0, "完整档案快照不应出现未知模型二进制。");
assert(repository.parity.unifiedSceneSchema === "project-scene-repository-v1", "项目仓库应暴露统一场景 schema。");
assert(mainRepositoryScene?.draft.objectCount === 3, "主场景仓库草稿应统计对象、自定义物体和导入模型。");
assert(mainRepositoryScene?.published.releaseCount === 2, "主场景仓库应统计发布版本。");
assert(realisticRepositoryScene?.draft.objectCount === 2, "写实仓库草稿应统计基础对象和导入模型。");
assert(realisticRepositoryScene?.assets.missingBinaryCount === 0, "写实仓库不应误报已归档模型缺文件。");
assert(repositoryStatus.summary.readySceneCount === repository.summary.readySceneCount, "独立仓库状态接口应与 schema 内状态一致。");
assert(schema.summary.repositoryStatus === "ready", "summary 应包含仓库状态。");
assert(schema.summary.repositoryReadyScenes === 2, "summary 应包含仓库 ready 场景数。");

console.log("项目 Schema 检查通过：主发布、写实发布、资产哈希和项目仓库状态已统计。");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
