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
  const textureBytes = new TextEncoder().encode("mr-calligraphy-texture-binary");
  const base64 = Buffer.from(bytes).toString("base64");
  const textureBase64 = Buffer.from(textureBytes).toString("base64");
  const sha256 = nodeCrypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  const textureSha256 = nodeCrypto.createHash("sha256").update(Buffer.from(textureBytes)).digest("hex");
  const archive = createArchive(base64, sha256, textureBase64, textureSha256);

  const validation = await window.MRProjectArchive.validateArchiveAssetHashes(archive);
  assert(validation.checkedCount === 2, "应校验模型和贴图 2 个资产哈希。");
  assert(validation.missingHashCount === 0, "正确的新档案不应缺少资产哈希。");

  const selectedValidation = await window.MRProjectArchive.validateArchiveAssetHashes(archive, ["mainModels"], {
    mainModels: [{ action: "add", key: "asset-1" }]
  });
  assert(selectedValidation.checkedCount === 2, "选择恢复模型时应同时校验关联贴图哈希。");

  const migrated = window.MRProjectArchive.migrateProjectArchive(archive);
  const asset = migrated.projectSchema.assetManifest.assets.find((item) => item.id === "asset-1");
  const textureAsset = migrated.projectSchema.assetManifest.assets.find((item) => item.id === "asset-1:texture-e2e");
  assert(asset.sha256 === sha256, "projectSchema.assetManifest 应写入模型 SHA-256。");
  assert(asset.hashStatus === "sha256", "带哈希模型应标记为 sha256。");
  assert(migrated.projectSchema.assetManifest.textureAssetCount === 1, "projectSchema.assetManifest 应统计贴图资产。");
  assert(textureAsset?.sha256 === textureSha256, "projectSchema.assetManifest 应写入贴图 SHA-256。");
  assert(textureAsset?.hashStatus === "sha256", "带哈希贴图应标记为 sha256。");

  const badArchive = createArchive(base64, "0".repeat(64), textureBase64, textureSha256);
  let failed = false;
  try {
    await window.MRProjectArchive.importProject(badArchive);
  } catch (error) {
    failed = /哈希校验失败/.test(error.message);
  }
  assert(failed, "错误哈希的项目档案应被阻止恢复。");
  assert(storageWrites.length === 0, "哈希失败时不应先写入 localStorage。");

  const badTextureArchive = createArchive(base64, sha256, textureBase64, "0".repeat(64));
  failed = false;
  storageWrites.length = 0;
  try {
    await window.MRProjectArchive.importProject(badTextureArchive);
  } catch (error) {
    failed = /哈希校验失败/.test(error.message);
  }
  assert(failed, "错误贴图哈希的项目档案应被阻止恢复。");
  assert(storageWrites.length === 0, "贴图哈希失败时不应先写入 localStorage。");

  console.log("项目档案资产哈希检查通过：模型和贴图哈希已校验。");
}

function createArchive(arrayBufferBase64, sha256, textureArrayBufferBase64, textureSha256) {
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
          importedModels: [{
            id: "asset-1",
            key: "asset-1",
            label: "哈希模型",
            texture: {
              dbKey: "asset-1:texture-e2e",
              fileName: "hash-texture.png",
              type: "png",
              sha256: textureSha256,
              fileBytes: 29
            }
          }]
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
            fileName: "hash-model.glb",
            texture: {
              dbKey: "asset-1:texture-e2e",
              fileName: "hash-texture.png",
              type: "png",
              sha256: textureSha256,
              fileBytes: 29
            }
          },
          arrayBufferBase64,
          bytes: 27,
          sha256
        },
        {
          data: {
            id: "asset-1:texture-e2e",
            dbKey: "asset-1:texture-e2e",
            label: "hash-texture.png",
            fileName: "hash-texture.png",
            type: "png",
            metrics: { fileBytes: 29 }
          },
          arrayBufferBase64: textureArrayBufferBase64,
          bytes: 29,
          sha256: textureSha256
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
