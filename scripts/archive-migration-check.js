#!/usr/bin/env node

global.window = global;
global.document = {
  readyState: "complete",
  getElementById: () => null
};
const removedStorageKeys = [];
const writtenStorageKeys = [];
const localValues = new Map([
  [
    "mr-calligraphy-learning-state-v1",
    JSON.stringify({
      sessions: [{ id: "session-1", score: 70 }],
      reports: []
    })
  ]
]);
global.localStorage = {
  getItem: (key) => localValues.get(key) || null,
  setItem: (key, value) => {
    writtenStorageKeys.push(key);
    localValues.set(key, value);
  },
  removeItem: (key) => {
    removedStorageKeys.push(key);
    localValues.delete(key);
  }
};
const indexedDbMock = createIndexedDbMock({
  "mr-calligraphy-main-model-store": {
    models: [{
      key: "model-1",
      id: "model-1",
      label: "本机旧模型",
      fileName: "old-model.glb",
      type: "glb",
      metrics: {
        fileBytes: 10,
        meshCount: 1,
        vertexCount: 12,
        dimensions: { width: 1, height: 1, depth: 1 }
      },
      arrayBuffer: new Uint8Array([1, 2, 3]).buffer
    }]
  }
});
global.indexedDB = indexedDbMock;

require("../project-schema-utils.js");
require("../project-archive.js");

const legacyArchive = {
  kind: "mr-calligraphy-project-archive",
  version: 1,
  exportedAt: "2026-05-16T00:00:00.000Z",
  source: "archive-migration-check",
  storage: {
    "mr-calligraphy-learning-state-v1": {
      label: "学习状态",
      value: JSON.stringify({
        sessions: [{ id: "session-1", score: 88 }],
        artworks: [{ id: "art-1" }]
      }),
      bytes: 15
    }
  },
  indexedDb: {
    mainModels: {
      label: "主场景导入模型",
      records: [
        {
          data: {
            key: "model-1",
            id: "model-1",
            label: "档案更新模型",
            fileName: "updated-model.glb",
            type: "glb",
            metrics: {
              fileBytes: 20,
              meshCount: 2,
              vertexCount: 24,
              dimensions: { width: 2, height: 1, depth: 1 }
            }
          },
          bytes: 20
        },
        {
          data: {
            key: "model-2",
            id: "model-2",
            label: "档案新增模型",
            fileName: "new-model.obj",
            type: "obj",
            metrics: {
              fileBytes: 30,
              meshCount: 3,
              vertexCount: 36,
              dimensions: { width: 1, height: 2, depth: 1 }
            }
          },
          bytes: 30
        },
        {
          data: {
            key: "model-3",
            id: "model-3",
            label: "本机旧模型",
            fileName: "conflict-model.glb",
            type: "glb",
            metrics: {
              fileBytes: 40,
              meshCount: 4,
              vertexCount: 48,
              dimensions: { width: 1, height: 1, depth: 2 }
            }
          },
          bytes: 40
        }
      ]
    }
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

async function main() {
  const migrated = window.MRProjectArchive.migrateProjectArchive(legacyArchive);

  assert(migrated.projectSchema, "迁移后应生成 projectSchema。");
  assert(Array.isArray(migrated.migrations) && migrated.migrations.length > 0, "迁移后应记录迁移说明。");
  assert(
    migrated.storage["mr-calligraphy-realistic-published-v1"]?.migratedMissing === true,
    "旧档案缺少的写实发布版本应被标记为迁移缺项。"
  );
  assert(
    migrated.storage["mr-calligraphy-realistic-published-v1"]?.defaultSelected === false,
    "旧档案缺少的写实发布版本默认不应恢复，避免清空当前本机状态。"
  );
  assert(
    migrated.indexedDb.realisticModels?.migratedMissing === true,
    "旧档案缺少的写实模型库应被标记为迁移缺项。"
  );
  assert(
    migrated.projectSchema.migrations.length === migrated.migrations.length,
    "projectSchema 应保留同一组迁移记录。"
  );

  const previewResult = await window.MRProjectArchive.prepareImportProject({
    text: async () => JSON.stringify(legacyArchive)
  });
  const learningPreview = previewResult.preview.storage.find(
    (item) => item.id === "mr-calligraphy-learning-state-v1"
  );
  assert(learningPreview, "导入预览应包含学习状态。");
  assert(
    learningPreview.fieldDiffSummary.includes("修改字段"),
    "学习状态预览应显示字段级修改摘要。"
  );
  assert(
    learningPreview.fieldDiffs.some((item) => item.includes("sessions[0].score")),
    "学习状态预览应显示 sessions[0].score 字段变化。"
  );
  assert(
    learningPreview.fieldDiffs.some((item) => item.includes("artworks.length")),
    "学习状态预览应显示 artworks.length 新增变化。"
  );
  assert(
    learningPreview.fieldSelections.some((item) => item.path === "sessions[0].score" && item.action === "update"),
    "学习状态预览应允许选择性恢复 sessions[0].score 深层字段。"
  );
  assert(
    learningPreview.fieldImpactSummary.includes("覆盖本机字段"),
    "学习状态预览应显示字段恢复影响摘要。"
  );
  const sessionSelection = learningPreview.fieldSelections.find((item) => item.path === "sessions[0].score");
  assert(
    sessionSelection?.impact === "会覆盖本机字段",
    "学习状态预览应提示 sessions[0].score 字段会覆盖本机字段。"
  );
  assert(
    sessionSelection.detail.includes("当前：数字：70") && sessionSelection.detail.includes("档案：数字：88"),
    "学习状态预览应显示 sessions[0].score 字段当前值与档案值摘要。"
  );
  assert(
    sessionSelection.currentPreview === "70",
    "学习状态预览应包含 sessions[0].score 当前本机 JSON 片段。"
  );
  assert(
    sessionSelection.incomingPreview === "88",
    "学习状态预览应包含 sessions[0].score 导入档案 JSON 片段。"
  );
  assert(
    learningPreview.fieldSelections.some((item) => item.path === "artworks" && item.action === "add"),
    "学习状态预览应允许选择性恢复 artworks 字段。"
  );
  const mainModelPreview = previewResult.preview.indexedDb.find((item) => item.id === "mainModels");
  assert(mainModelPreview, "导入预览应包含主场景模型仓库。");
  assert(
    mainModelPreview.modelDiffSummary.includes("2 新增模型") &&
      mainModelPreview.modelDiffSummary.includes("1 修改模型"),
    "主场景模型仓库预览应显示单模型新增和修改摘要。"
  );
  assert(
    mainModelPreview.modelDiffs.some((item) => item.includes("修改模型：档案更新模型")),
    "主场景模型仓库预览应显示被修改的单个模型。"
  );
  assert(
    mainModelPreview.modelDiffs.some((item) => item.includes("新增模型：档案新增模型")),
    "主场景模型仓库预览应显示新增的单个模型。"
  );
  assert(
    mainModelPreview.modelSelections.some((item) => item.key === "model-2" && item.action === "add"),
    "主场景模型仓库预览应允许勾选单个新增模型。"
  );
  assert(
    mainModelPreview.modelSelections.some((item) => item.key === "model-1" && item.action === "update"),
    "主场景模型仓库预览应允许勾选单个修改模型。"
  );
  const addedModelSelection = mainModelPreview.modelSelections.find((item) => item.key === "model-2");
  const updatedModelSelection = mainModelPreview.modelSelections.find((item) => item.key === "model-1");
  const conflictingModelSelection = mainModelPreview.modelSelections.find((item) => item.key === "model-3");
  assert(
    addedModelSelection?.currentPreview === "本机中无此模型" &&
      addedModelSelection?.incomingPreview.includes("\"label\": \"档案新增模型\""),
    "主场景模型仓库新增模型预览应显示本机缺失和档案元数据片段。"
  );
  assert(
    updatedModelSelection?.currentPreview.includes("\"label\": \"本机旧模型\"") &&
      updatedModelSelection?.incomingPreview.includes("\"label\": \"档案更新模型\""),
    "主场景模型仓库修改模型预览应显示当前本机和导入档案元数据片段。"
  );
  assert(
    conflictingModelSelection?.conflictSummary.includes("命名冲突") &&
      conflictingModelSelection?.conflictSummary.includes("本机旧模型"),
    "主场景模型仓库同名不同 key 模型应显示命名冲突提示。"
  );

  await window.MRProjectArchive.restoreProjectArchive(legacyArchive, {
    storageKeys: ["mr-calligraphy-learning-state-v1"],
    dbIds: [],
    storageFields: {
      "mr-calligraphy-learning-state-v1": [{ path: "sessions[0].score", action: "update" }]
    }
  });
  const partiallyRestored = JSON.parse(localValues.get("mr-calligraphy-learning-state-v1"));
  assert(
    partiallyRestored.sessions[0].score === 88,
    "字段级恢复应更新已勾选的 sessions[0].score 字段。"
  );
  assert(
    Array.isArray(partiallyRestored.reports),
    "字段级恢复不应移除未勾选的 reports 字段。"
  );
  assert(
    !partiallyRestored.artworks,
    "字段级恢复不应写入未勾选的 artworks 字段。"
  );
  writtenStorageKeys.length = 0;

  await window.MRProjectArchive.restoreProjectArchive(legacyArchive, {
    storageKeys: [],
    dbIds: ["mainModels"],
    dbRecords: {
      mainModels: [{ key: "model-2", action: "add" }]
    }
  });
  const modelRecords = indexedDbMock.dump("mr-calligraphy-main-model-store", "models");
  assert(
    modelRecords.some((record) => record.key === "model-2" && record.label === "档案新增模型"),
    "单模型恢复应写入已勾选的新增模型。"
  );
  assert(
    modelRecords.some((record) => record.key === "model-1" && record.label === "本机旧模型"),
    "单模型恢复不应覆盖未勾选的本机旧模型。"
  );
  assert(
    !modelRecords.some((record) => record.key === "model-1" && record.label === "档案更新模型"),
    "单模型恢复不应恢复未勾选的修改模型。"
  );

  await window.MRProjectArchive.restoreProjectArchive(legacyArchive, {
    storageKeys: [],
    dbIds: ["mainModels"],
    dbRecords: {
      mainModels: [{ key: "model-3", action: "add" }]
    }
  });
  const conflictModelRecords = indexedDbMock.dump("mr-calligraphy-main-model-store", "models");
  assert(
    conflictModelRecords.some((record) => record.key === "model-3" && record.label === "本机旧模型（档案）"),
    "命名冲突模型单独恢复时应自动追加档案后缀。"
  );
  assert(
    conflictModelRecords.some((record) => record.key === "model-1" && record.label === "本机旧模型"),
    "命名冲突模型单独恢复时不应覆盖本机旧模型。"
  );

  await window.MRProjectArchive.importProject({
    ...legacyArchive,
    indexedDb: {}
  });
  assert(
    !removedStorageKeys.includes("mr-calligraphy-realistic-published-v1"),
    "程序化导入旧档案时不应默认移除缺失的写实发布版本。"
  );
  assert(
    writtenStorageKeys.includes("mr-calligraphy-learning-state-v1"),
    "程序化导入旧档案时仍应恢复档案内实际存在且默认选中的学习状态。"
  );

  console.log(`项目档案迁移检查通过：${migrated.migrations.length} 条迁移记录。`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createIndexedDbMock(initialStores = {}) {
  const dbStores = new Map(Object.entries(initialStores).map(([dbName, stores]) => [
    dbName,
    new Map(Object.entries(stores).map(([storeName, records]) => [storeName, records.slice()]))
  ]));

  return {
    open: (dbName) => {
      const request = { result: null, error: null, onsuccess: null, onerror: null, onupgradeneeded: null };
      const db = createDb(dbName, dbStores);
      request.result = db;
      queueMicrotask(() => {
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
    dump: (dbName, storeName) => (dbStores.get(dbName)?.get(storeName) || []).slice()
  };
}

function createDb(dbName, dbStores) {
  const stores = dbStores.get(dbName) || new Map();
  dbStores.set(dbName, stores);

  return {
    objectStoreNames: {
      contains: (storeName) => stores.has(storeName)
    },
    createObjectStore: (storeName) => {
      if (!stores.has(storeName)) {
        stores.set(storeName, []);
      }
    },
    transaction: (storeName) => {
      if (!stores.has(storeName)) {
        stores.set(storeName, []);
      }
      const transaction = {
        error: null,
        oncomplete: null,
        onerror: null,
        objectStore: () => createObjectStoreMock(stores.get(storeName))
      };
      queueMicrotask(() => transaction.oncomplete?.());
      return transaction;
    },
    close: () => {}
  };
}

function createObjectStoreMock(records) {
  return {
    getAll: () => {
      const request = { result: records.slice(), error: null, onsuccess: null, onerror: null };
      queueMicrotask(() => request.onsuccess?.());
      return request;
    },
    clear: () => {
      records.length = 0;
    },
    put: (record) => {
      const key = getRecordKey(record);
      if (key) {
        const index = records.findIndex((item) => getRecordKey(item) === key);
        if (index >= 0) {
          records.splice(index, 1, record);
          return;
        }
      }
      records.push(record);
    },
    delete: (key) => {
      const index = records.findIndex((item) => getRecordKey(item) === key);
      if (index >= 0) {
        records.splice(index, 1);
      }
    }
  };
}

function getRecordKey(record) {
  return String(record?.key || record?.id || record?.dbKey || "").trim();
}
