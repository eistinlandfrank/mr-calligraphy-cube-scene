#!/usr/bin/env node

const nodeCrypto = require("crypto");

global.window = global;
if (!global.crypto) {
  global.crypto = nodeCrypto.webcrypto;
}
global.document = {
  readyState: "complete",
  getElementById: () => null
};

const storageWrites = [];
global.localStorage = {
  getItem: () => null,
  setItem: (key) => storageWrites.push(key),
  removeItem: (key) => storageWrites.push(`remove:${key}`)
};

require("../project-schema-utils.js");
require("../project-archive.js");

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

async function main() {
  const bytes = new TextEncoder().encode("mr-calligraphy-model-binary");
  const base64 = Buffer.from(bytes).toString("base64");
  const sha256 = nodeCrypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  const archive = createArchive(base64, sha256);

  const validation = await window.MRProjectArchive.validateArchiveAssetHashes(archive);
  assert(validation.checkedCount === 1, "应校验 1 个模型哈希。");
  assert(validation.missingHashCount === 0, "正确的新档案不应缺少模型哈希。");

  const migrated = window.MRProjectArchive.migrateProjectArchive(archive);
  const asset = migrated.projectSchema.assetManifest.assets[0];
  assert(asset.sha256 === sha256, "projectSchema.assetManifest 应写入模型 SHA-256。");
  assert(asset.hashStatus === "sha256", "带哈希模型应标记为 sha256。");

  const badArchive = createArchive(base64, "0".repeat(64));
  let failed = false;
  try {
    await window.MRProjectArchive.importProject(badArchive);
  } catch (error) {
    failed = /哈希校验失败/.test(error.message);
  }
  assert(failed, "错误哈希的项目档案应被阻止恢复。");
  assert(storageWrites.length === 0, "哈希失败时不应先写入 localStorage。");

  console.log("项目档案资产哈希检查通过：1 个模型哈希已校验。");
}

function createArchive(arrayBufferBase64, sha256) {
  return {
    kind: "mr-calligraphy-project-archive",
    version: 1,
    exportedAt: "2026-06-11T00:00:00.000Z",
    source: "archive-asset-hash-check",
    storage: {
      "mr-calligraphy-main-scene-layout-v1": {
        label: "主场景布局",
        value: JSON.stringify({
          objects: {},
          layerOrder: [],
          customObjects: [],
          importedModels: [{ id: "asset-1", key: "asset-1", label: "哈希模型" }]
        }),
        bytes: 128
      }
    },
    indexedDb: {
      mainModels: {
        label: "主场景导入模型",
        records: [{
          data: {
            id: "asset-1",
            key: "asset-1",
            label: "哈希模型",
            fileName: "hash-model.glb"
          },
          arrayBufferBase64,
          bytes: 26,
          sha256
        }]
      }
    }
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
