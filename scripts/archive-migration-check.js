#!/usr/bin/env node

global.window = global;
global.document = {
  readyState: "complete",
  getElementById: () => null
};
const removedStorageKeys = [];
const writtenStorageKeys = [];
global.localStorage = {
  getItem: () => null,
  setItem: (key) => writtenStorageKeys.push(key),
  removeItem: (key) => removedStorageKeys.push(key)
};

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
      value: JSON.stringify({ sessions: [] }),
      bytes: 15
    }
  },
  indexedDb: {
    mainModels: {
      label: "主场景导入模型",
      records: []
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
