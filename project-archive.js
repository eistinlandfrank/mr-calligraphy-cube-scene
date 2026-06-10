(function () {
  const ARCHIVE_KIND = "mr-calligraphy-project-archive";
  const ARCHIVE_VERSION = 1;
  const STORAGE_ITEMS = [
    { key: "mr-calligraphy-learning-state-v1", label: "学习状态" },
    { key: "mr-calligraphy-room-config-v3-wood", label: "房间与角色配置" },
    { key: "mr-calligraphy-main-scene-layout-v1", label: "主场景布局" },
    { key: "mr-calligraphy-main-scene-history-v1", label: "主场景保存历史" },
    { key: "mr-calligraphy-main-scene-published-v1", label: "主场景发布版本" },
    { key: "mr-calligraphy-realistic-layout-v1", label: "写实场景布局" },
    { key: "mr-calligraphy-realistic-history-v1", label: "写实场景保存历史" },
    { key: "mr-calligraphy-realistic-published-v1", label: "写实场景发布版本" }
  ];
  const DB_ITEMS = [
    { id: "mainModels", label: "主场景导入模型", dbName: "mr-calligraphy-main-model-store", storeName: "models", keyPath: "key" },
    { id: "realisticModels", label: "写实场景导入模型", dbName: "mr-calligraphy-model-store", storeName: "models", keyPath: "id" }
  ];

  async function exportProject() {
    const archive = {
      kind: ARCHIVE_KIND,
      version: ARCHIVE_VERSION,
      exportedAt: new Date().toISOString(),
      source: window.location.href,
      storage: exportLocalStorage(),
      indexedDb: {},
      notes: [
        "该档案包含 MR 书法项目的本机学习记录、场景配置、后台布局和已导入模型文件。",
        "恢复档案前可在主后台选择要恢复的条目；勾选条目会覆盖当前浏览器中的同名项目状态。"
      ]
    };

    for (const item of DB_ITEMS) {
      archive.indexedDb[item.id] = await exportDbStore(item);
    }
    archive.migrations = [];
    archive.projectSchema = createProjectSchema(archive);

    downloadJson(archive, `mr-calligraphy-project-${formatTimestamp(new Date())}.json`);
    return summarizeArchive(archive, "已导出项目档案。");
  }

  async function importProject(fileOrArchive) {
    const archive = await resolveArchive(fileOrArchive);
    const restoredArchive = await restoreProjectArchive(archive);
    return summarizeArchive(restoredArchive, "已恢复项目档案，刷新页面后生效。");
  }

  async function prepareImportProject(file) {
    const archive = await readArchiveFile(file);
    return {
      ok: true,
      archive,
      preview: await createArchivePreview(archive),
      message: "项目档案已校验，请确认差异后恢复。"
    };
  }

  async function restoreProjectArchive(archive, options = null) {
    const migratedArchive = migrateProjectArchive(archive);
    validateArchive(migratedArchive);
    const restoreOptions = normalizeRestoreOptions(options, migratedArchive);

    if (!restoreOptions.storageKeys.length && !restoreOptions.dbIds.length) {
      throw new Error("请至少选择一项要恢复的项目档案内容。");
    }

    await validateArchiveAssetHashes(migratedArchive, restoreOptions.dbIds);
    importLocalStorage(migratedArchive.storage || {}, restoreOptions.storageKeys);

    for (const item of DB_ITEMS) {
      if (restoreOptions.dbIds.includes(item.id)) {
        await importDbStore(item, migratedArchive.indexedDb?.[item.id]);
      }
    }

    return migratedArchive;
  }

  async function resolveArchive(fileOrArchive) {
    if (fileOrArchive && typeof fileOrArchive.text === "function") {
      const result = await prepareImportProject(fileOrArchive);
      return result.archive;
    }

    return migrateProjectArchive(fileOrArchive);
  }

  async function readArchiveFile(file) {
    if (!file) {
      throw new Error("请选择项目档案 JSON 文件。");
    }

    let archive;
    try {
      archive = JSON.parse(await file.text());
    } catch (error) {
      throw new Error("项目档案 JSON 格式不正确，无法读取。");
    }

    return migrateProjectArchive(archive);
  }

  async function createArchivePreview(archive) {
    const migratedArchive = migrateProjectArchive(archive);
    validateArchive(migratedArchive);

    const storage = STORAGE_ITEMS.map((item) => compareStorageItem(item, migratedArchive.storage || {}));
    const indexedDb = [];

    for (const item of DB_ITEMS) {
      indexedDb.push(await compareDbItem(item, migratedArchive.indexedDb?.[item.id]));
    }

    const projectSchema = getArchiveProjectSchema(migratedArchive);

    return {
      exportedAt: migratedArchive.exportedAt || "",
      source: migratedArchive.source || "",
      migrations: migratedArchive.migrations || [],
      projectSchema,
      schemaSummary: summarizeProjectSchema(projectSchema),
      storage,
      indexedDb,
      summary: summarizeImportPreview(storage, indexedDb)
    };
  }

  function compareStorageItem(item, storage) {
    const record = storage[item.key];
    const incomingValue = record?.value == null ? null : record.value;
    const currentValue = window.localStorage.getItem(item.key);
    const migratedMissing = record?.migratedMissing === true;

    if (incomingValue !== null && typeof incomingValue !== "string") {
      throw new Error(`项目档案中的 ${item.label} 数据格式不正确。`);
    }

    return {
      id: item.key,
      label: item.label,
      change: getStorageChange(currentValue, incomingValue),
      currentBytes: currentValue ? new Blob([currentValue]).size : 0,
      incomingBytes: incomingValue ? new Blob([incomingValue]).size : 0,
      defaultSelected: !migratedMissing,
      migrationNote: migratedMissing ? `旧档案不包含“${item.label}”，默认保留当前本机内容。` : ""
    };
  }

  async function compareDbItem(item, pack) {
    const records = Array.isArray(pack?.records) ? pack.records : [];
    const currentRecords = await readDbStoreRecords(item);
    const migratedMissing = pack?.migratedMissing === true;
    const hashSummary = await summarizeDbPackHashes(records, item.label);

    return {
      id: item.id,
      label: item.label,
      currentCount: currentRecords.length,
      incomingCount: records.length,
      incomingBinaryCount: hashSummary.binaryCount,
      incomingHashCount: hashSummary.hashCount,
      missingHashCount: hashSummary.missingHashCount,
      change: currentRecords.length === records.length ? "same-count" : "replace",
      defaultSelected: !migratedMissing,
      migrationNote: migratedMissing ? `旧档案不包含“${item.label}”，默认保留当前本机模型库。` : ""
    };
  }

  async function readDbStoreRecords(item) {
    const db = await openDb(item);
    const records = await readAllRecords(db, item.storeName);
    db.close();
    return records;
  }

  function getStorageChange(currentValue, incomingValue) {
    if (incomingValue === null && currentValue == null) return "empty";
    if (incomingValue === null) return "remove";
    if (currentValue == null) return "add";
    if (currentValue === incomingValue) return "same";
    return "update";
  }

  function summarizeImportPreview(storage, indexedDb) {
    const storageSummary = storage.reduce((result, item) => {
      result[item.change] = (result[item.change] || 0) + 1;
      return result;
    }, {});
    const dbReplaceCount = indexedDb.filter((item) => item.change === "replace").length;
    const incomingModelCount = indexedDb.reduce((sum, item) => sum + item.incomingCount, 0);
    const assetHashCount = indexedDb.reduce((sum, item) => sum + (item.incomingHashCount || 0), 0);
    const missingAssetHashCount = indexedDb.reduce((sum, item) => sum + (item.missingHashCount || 0), 0);

    return {
      storageAdded: storageSummary.add || 0,
      storageUpdated: storageSummary.update || 0,
      storageRemoved: storageSummary.remove || 0,
      storageSame: storageSummary.same || 0,
      storageEmpty: storageSummary.empty || 0,
      dbReplaceCount,
      incomingModelCount,
      assetHashCount,
      missingAssetHashCount
    };
  }

  function exportLocalStorage() {
    return STORAGE_ITEMS.reduce((result, item) => {
      const value = window.localStorage.getItem(item.key);
      result[item.key] = {
        label: item.label,
        value,
        bytes: value ? new Blob([value]).size : 0
      };
      return result;
    }, {});
  }

  function normalizeRestoreOptions(options, archive = null) {
    const allStorageKeys = STORAGE_ITEMS.map((item) => item.key);
    const allDbIds = DB_ITEMS.map((item) => item.id);
    const storageKeys = Array.isArray(options?.storageKeys)
      ? options.storageKeys.filter((key) => allStorageKeys.includes(key))
      : allStorageKeys.filter((key) => archive?.storage?.[key]?.defaultSelected !== false);
    const dbIds = Array.isArray(options?.dbIds)
      ? options.dbIds.filter((id) => allDbIds.includes(id))
      : allDbIds.filter((id) => archive?.indexedDb?.[id]?.defaultSelected !== false);
    return {
      storageKeys: [...new Set(storageKeys)],
      dbIds: [...new Set(dbIds)]
    };
  }

  function createProjectSchema(archive) {
    if (window.MRProjectSchema?.createProjectSchema) {
      return window.MRProjectSchema.createProjectSchema(archive);
    }
    return {
      kind: "mr-calligraphy-project-schema",
      version: 1,
      createdAt: archive.exportedAt || new Date().toISOString(),
      source: archive.source || "",
      sections: {},
      assetManifest: { importedModelCount: 0, missingBinaryCount: 0, assets: [] },
      summary: {},
      migrations: Array.isArray(archive.migrations) ? archive.migrations : []
    };
  }

  function getArchiveProjectSchema(archive) {
    return archive.projectSchema || createProjectSchema(archive);
  }

  function summarizeProjectSchema(schema) {
    const summary = schema?.summary || {};
    return {
      version: Number(schema?.version) || 0,
      learningRecords: Number(summary.learningRecords) || 0,
      mainDraftObjects: Number(summary.mainDraftObjects) || 0,
      mainSnapshots: Number(summary.mainSnapshots) || 0,
      realisticObjects: Number(summary.realisticObjects) || 0,
      realisticSnapshots: Number(summary.realisticSnapshots) || 0,
      importedModels: Number(summary.importedModels) || 0,
      missingModelBinaries: Number(summary.missingModelBinaries) || 0,
      missingModelHashes: Number(summary.missingModelHashes) || 0,
      migrationCount: Array.isArray(schema?.migrations) ? schema.migrations.length : 0
    };
  }

  function importLocalStorage(storage, selectedKeys = STORAGE_ITEMS.map((item) => item.key)) {
    const selected = new Set(selectedKeys);
    STORAGE_ITEMS.forEach((item) => {
      if (!selected.has(item.key)) {
        return;
      }
      const record = storage[item.key];
      if (!record || record.value == null) {
        window.localStorage.removeItem(item.key);
        return;
      }
      if (typeof record.value !== "string") {
        throw new Error(`项目档案中的 ${item.label} 数据格式不正确。`);
      }
      window.localStorage.setItem(item.key, record.value);
    });
  }

  async function exportDbStore(item) {
    const db = await openDb(item);
    const records = await readAllRecords(db, item.storeName);
    db.close();
    return {
      label: item.label,
      dbName: item.dbName,
      storeName: item.storeName,
      keyPath: item.keyPath,
      records: await Promise.all(records.map(serializeDbRecord))
    };
  }

  async function importDbStore(item, pack) {
    const db = await openDb(item);
    const records = Array.isArray(pack?.records) ? pack.records : [];
    const restoredRecords = await Promise.all(records.map((record) => deserializeDbRecord(record, item.label)));

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(item.storeName, "readwrite");
      const store = transaction.objectStore(item.storeName);
      store.clear();
      restoredRecords.forEach((record) => {
        store.put(record);
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error(`无法恢复 ${item.label}。`));
    });
    db.close();
  }

  function openDb(item) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("当前浏览器不支持 IndexedDB，无法处理导入模型。"));
        return;
      }

      const request = window.indexedDB.open(item.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(item.storeName)) {
          db.createObjectStore(item.storeName, { keyPath: item.keyPath });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(item.storeName)) {
          db.close();
          reject(new Error(`${item.label} 数据库缺少 ${item.storeName}。`));
          return;
        }
        resolve(db);
      };
      request.onerror = () => reject(request.error || new Error(`无法打开 ${item.label} 数据库。`));
    });
  }

  function readAllRecords(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error("无法读取 IndexedDB 记录。"));
    });
  }

  async function serializeDbRecord(record) {
    const copy = { ...record };
    const arrayBuffer = normalizeArrayBuffer(copy.arrayBuffer);
    delete copy.arrayBuffer;
    const sha256 = arrayBuffer ? await createArrayBufferSha256(arrayBuffer) : "";
    if (sha256) {
      copy.sha256 = sha256;
    }
    return {
      data: copy,
      arrayBufferBase64: arrayBuffer ? await arrayBufferToBase64(arrayBuffer) : null,
      bytes: arrayBuffer ? arrayBuffer.byteLength : 0,
      sha256: sha256 || null
    };
  }

  async function deserializeDbRecord(record, label = "导入模型") {
    const data = record && typeof record.data === "object" ? { ...record.data } : {};
    if (record?.arrayBufferBase64) {
      const arrayBuffer = base64ToArrayBuffer(record.arrayBufferBase64);
      const expectedHash = normalizeSha256(record.sha256 || data.sha256);
      if (expectedHash) {
        await assertArrayBufferSha256(arrayBuffer, expectedHash, data.label || data.fileName || label);
        data.sha256 = expectedHash;
      }
      data.arrayBuffer = arrayBuffer;
    }
    return data;
  }

  async function validateArchiveAssetHashes(archive, selectedDbIds = DB_ITEMS.map((item) => item.id)) {
    const migratedArchive = migrateProjectArchive(archive);
    const selected = new Set(Array.isArray(selectedDbIds) ? selectedDbIds : []);
    const summaries = [];

    for (const item of DB_ITEMS) {
      if (!selected.has(item.id)) {
        continue;
      }
      const records = Array.isArray(migratedArchive.indexedDb?.[item.id]?.records)
        ? migratedArchive.indexedDb[item.id].records
        : [];
      summaries.push({
        id: item.id,
        label: item.label,
        ...await summarizeDbPackHashes(records, item.label)
      });
    }

    return {
      ok: true,
      checkedCount: summaries.reduce((sum, item) => sum + item.hashCount, 0),
      binaryCount: summaries.reduce((sum, item) => sum + item.binaryCount, 0),
      missingHashCount: summaries.reduce((sum, item) => sum + item.missingHashCount, 0),
      summaries
    };
  }

  async function summarizeDbPackHashes(records, label) {
    const summary = {
      binaryCount: 0,
      hashCount: 0,
      missingHashCount: 0
    };

    for (const record of records) {
      if (!record?.arrayBufferBase64) {
        continue;
      }
      summary.binaryCount += 1;
      const expectedHash = normalizeSha256(record.sha256 || record.data?.sha256);
      if (!expectedHash) {
        summary.missingHashCount += 1;
        continue;
      }

      let arrayBuffer;
      try {
        arrayBuffer = base64ToArrayBuffer(record.arrayBufferBase64);
      } catch (error) {
        throw new Error(`${label} 中有模型文件无法解码，已阻止恢复。`);
      }
      await assertArrayBufferSha256(arrayBuffer, expectedHash, record.data?.label || record.data?.fileName || label);
      summary.hashCount += 1;
    }

    return summary;
  }

  async function assertArrayBufferSha256(arrayBuffer, expectedHash, label) {
    const actualHash = await createArrayBufferSha256(arrayBuffer);
    if (actualHash !== expectedHash) {
      throw new Error(`模型文件哈希校验失败：${label}。`);
    }
  }

  async function createArrayBufferSha256(value) {
    const arrayBuffer = normalizeArrayBuffer(value);
    if (!arrayBuffer || !arrayBuffer.byteLength) {
      return "";
    }

    const cryptoApi = window.crypto || globalThis.crypto;
    if (!cryptoApi?.subtle?.digest) {
      throw new Error("当前浏览器不支持 SHA-256 哈希校验，无法安全处理项目档案模型文件。");
    }

    const digest = await cryptoApi.subtle.digest("SHA-256", arrayBuffer);
    return arrayBufferToHex(digest);
  }

  function normalizeArrayBuffer(value) {
    if (!value) {
      return null;
    }
    if (value instanceof ArrayBuffer) {
      return value;
    }
    if (ArrayBuffer.isView(value)) {
      return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
    }
    return null;
  }

  function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }

  function normalizeSha256(value) {
    const hash = String(value || "").trim().toLowerCase();
    return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
  }

  function arrayBufferToBase64(buffer) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer]);
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.split(",")[1] || "");
      };
      reader.onerror = () => reject(reader.error || new Error("模型文件编码失败。"));
      reader.readAsDataURL(blob);
    });
  }

  function base64ToArrayBuffer(base64) {
    const binary = getBase64Binary(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  }

  function getBase64Binary(base64) {
    if (typeof window.atob === "function") {
      return window.atob(base64);
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64, "base64").toString("binary");
    }
    throw new Error("当前环境无法解码模型文件。");
  }

  function migrateProjectArchive(archive) {
    if (!archive || archive.kind !== ARCHIVE_KIND) {
      throw new Error("这不是 MR 书法项目档案。");
    }

    const migrated = cloneArchive(archive);
    const migrations = normalizeMigrationRecords([
      ...(Array.isArray(migrated.migrations) ? migrated.migrations : []),
      ...(Array.isArray(migrated.projectSchema?.migrations) ? migrated.projectSchema.migrations : [])
    ]);

    if (migrated.version == null || migrated.version === "") {
      migrated.version = ARCHIVE_VERSION;
      migrations.push(createMigrationRecord(
        "archive-version-defaulted",
        "archive-version",
        "archive.version",
        "旧档案缺少版本号，已按当前 v1 档案结构读取。"
      ));
    }

    if (Number(migrated.version) !== ARCHIVE_VERSION) {
      throw new Error(`不支持的项目档案版本：${migrated.version}`);
    }

    if (migrated.projectSchema && window.MRProjectSchema?.validateProjectSchema) {
      window.MRProjectSchema.validateProjectSchema(migrated.projectSchema);
    }

    if (!migrated.storage || typeof migrated.storage !== "object") {
      migrated.storage = {};
      migrations.push(createMigrationRecord(
        "storage-container-created",
        "storage-container",
        "archive.storage",
        "旧档案缺少 storage 容器，已创建空容器并默认保留当前本机配置。"
      ));
    }

    if (!migrated.indexedDb || typeof migrated.indexedDb !== "object") {
      migrated.indexedDb = {};
      migrations.push(createMigrationRecord(
        "indexeddb-container-created",
        "indexeddb-container",
        "archive.indexedDb",
        "旧档案缺少 IndexedDB 容器，已创建空容器并默认保留当前本机模型库。"
      ));
    }

    STORAGE_ITEMS.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(migrated.storage, item.key)) {
        return;
      }
      migrated.storage[item.key] = {
        label: item.label,
        value: null,
        bytes: 0,
        migratedMissing: true,
        defaultSelected: false
      };
      migrations.push(createMigrationRecord(
        `storage-default:${item.key}`,
        "storage-default",
        item.key,
        `旧档案不包含“${item.label}”，导入预览默认保留当前本机内容。`
      ));
    });

    DB_ITEMS.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(migrated.indexedDb, item.id)) {
        return;
      }
      migrated.indexedDb[item.id] = {
        label: item.label,
        dbName: item.dbName,
        storeName: item.storeName,
        keyPath: item.keyPath,
        records: [],
        migratedMissing: true,
        defaultSelected: false
      };
      migrations.push(createMigrationRecord(
        `indexeddb-default:${item.id}`,
        "indexeddb-default",
        item.id,
        `旧档案不包含“${item.label}”，导入预览默认保留当前本机模型库。`
      ));
    });

    if (!migrated.projectSchema) {
      migrations.push(createMigrationRecord(
        "project-schema-synthesized",
        "project-schema",
        "archive.projectSchema",
        "旧档案缺少统一 projectSchema，已按当前项目结构重新生成摘要。"
      ));
    }

    migrated.migrations = dedupeMigrationRecords(migrations);
    migrated.projectSchema = createProjectSchema(migrated);
    validateArchive(migrated);
    return migrated;
  }

  function cloneArchive(archive) {
    try {
      return JSON.parse(JSON.stringify(archive));
    } catch (error) {
      throw new Error("项目档案包含无法迁移的数据。");
    }
  }

  function createMigrationRecord(id, type, target, message) {
    return {
      id,
      type,
      target,
      message,
      createdAt: new Date().toISOString()
    };
  }

  function normalizeMigrationRecords(records) {
    if (!Array.isArray(records)) {
      return [];
    }
    return dedupeMigrationRecords(records.map((record, index) => normalizeMigrationRecord(record, index)).filter(Boolean));
  }

  function normalizeMigrationRecord(record, index = 0) {
    if (!record || typeof record !== "object") {
      return null;
    }

    const id = String(record.id || `migration-${index + 1}`).slice(0, 96);
    const message = String(record.message || "").trim();
    if (!message) {
      return null;
    }

    return {
      id,
      type: String(record.type || "archive-migration").slice(0, 48),
      target: String(record.target || "").slice(0, 128),
      message: message.slice(0, 180),
      createdAt: record.createdAt || null
    };
  }

  function dedupeMigrationRecords(records) {
    const seen = new Set();
    return records.filter((record) => {
      if (seen.has(record.id)) {
        return false;
      }
      seen.add(record.id);
      return true;
    });
  }

  function validateArchive(archive) {
    if (!archive || archive.kind !== ARCHIVE_KIND) {
      throw new Error("这不是 MR 书法项目档案。");
    }
    if (Number(archive.version) !== ARCHIVE_VERSION) {
      throw new Error(`不支持的项目档案版本：${archive.version}`);
    }
    if (archive.projectSchema && window.MRProjectSchema?.validateProjectSchema) {
      window.MRProjectSchema.validateProjectSchema(archive.projectSchema);
    }
  }

  function summarizeArchive(archive, prefix, options = null) {
    const restoreOptions = normalizeRestoreOptions(options, archive);
    const selectedStorageKeys = new Set(restoreOptions.storageKeys);
    const selectedDbIds = new Set(restoreOptions.dbIds);
    const storageCount = STORAGE_ITEMS
      .filter((item) => selectedStorageKeys.has(item.key))
      .filter((item) => archive.storage?.[item.key]?.value)
      .length;
    const modelCount = DB_ITEMS.filter((item) => selectedDbIds.has(item.id)).reduce((sum, item) => {
      const pack = archive.indexedDb?.[item.id];
      return sum + (Array.isArray(pack?.records) ? pack.records.length : 0);
    }, 0);
    const modelHashCount = DB_ITEMS.filter((item) => selectedDbIds.has(item.id)).reduce((sum, item) => {
      const records = archive.indexedDb?.[item.id]?.records;
      return sum + (Array.isArray(records) ? records.filter((record) => normalizeSha256(record?.sha256 || record?.data?.sha256)).length : 0);
    }, 0);
    const migrationCount = Array.isArray(archive.migrations) ? archive.migrations.length : 0;
    const migrationText = migrationCount ? `，${migrationCount} 条迁移记录` : "";
    const hashText = modelHashCount ? `、${modelHashCount} 个模型哈希` : "";
    return {
      ok: true,
      message: `${prefix} 已包含 ${storageCount} 组本机配置、${modelCount} 个导入模型${hashText}${migrationText}，并写入统一项目 schema。`,
      storageCount,
      modelCount,
      modelHashCount,
      migrationCount
    };
  }

  function downloadJson(data, filename) {
    const payload = JSON.stringify(data, null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function formatTimestamp(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("") + "-" + [
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds())
    ].join("");
  }

  function formatArchiveDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "导出时间未知";
    }

    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function describeStorageChange(item) {
    const labels = {
      add: "新增",
      update: "覆盖",
      remove: "清空",
      same: "不变",
      empty: "保持为空"
    };

    return `${labels[item.change] || "未知"} · 当前 ${formatBytes(item.currentBytes)} → 档案 ${formatBytes(item.incomingBytes)}`;
  }

  function describeDbChange(item) {
    const label = item.change === "replace" ? "替换" : "数量相同";
    const hashDetail = item.incomingBinaryCount
      ? ` · 哈希 ${item.incomingHashCount}/${item.incomingBinaryCount}${item.missingHashCount ? `，${item.missingHashCount} 个旧模型缺少哈希` : ""}`
      : "";
    return `${label} · 当前 ${item.currentCount} 个 → 档案 ${item.incomingCount} 个${hashDetail}`;
  }

  function bindProjectArchiveControls() {
    const exportButton = document.getElementById("projectExportButton");
    const importFile = document.getElementById("projectImportFile");
    const status = document.getElementById("projectArchiveStatus");
    const previewBox = document.getElementById("projectImportPreview");
    const previewTitle = document.getElementById("projectImportPreviewTitle");
    const previewMeta = document.getElementById("projectImportPreviewMeta");
    const previewList = document.getElementById("projectImportPreviewList");
    const selectAllInput = document.getElementById("projectImportSelectAll");
    const selectionStatus = document.getElementById("projectImportSelectionStatus");
    const confirmButton = document.getElementById("projectImportConfirm");
    const cancelButton = document.getElementById("projectImportCancel");

    if (!exportButton && !importFile) return;

    let pendingArchive = null;
    let isBusy = false;

    const setStatus = (message, tone = "normal") => {
      if (!status) return;
      status.textContent = message;
      status.dataset.tone = tone;
    };

    const setBusy = (busy) => {
      isBusy = Boolean(busy);
      if (exportButton) exportButton.disabled = isBusy;
      if (importFile) importFile.disabled = isBusy;
      if (cancelButton) cancelButton.disabled = isBusy || !pendingArchive;
      updateRestoreSelectionState();
    };

    const getRestoreInputs = () => Array.from(previewList?.querySelectorAll("[data-archive-kind][data-archive-id]") || []);

    const getSelectedRestoreOptions = () => {
      const selected = getRestoreInputs().filter((input) => input.checked);
      return {
        storageKeys: selected.filter((input) => input.dataset.archiveKind === "storage").map((input) => input.dataset.archiveId),
        dbIds: selected.filter((input) => input.dataset.archiveKind === "indexedDb").map((input) => input.dataset.archiveId)
      };
    };

    const updateRestoreSelectionState = () => {
      const inputs = getRestoreInputs();
      const selectedCount = inputs.filter((input) => input.checked).length;
      inputs.forEach((input) => {
        input.disabled = isBusy;
      });

      if (selectAllInput) {
        selectAllInput.disabled = isBusy || !pendingArchive || inputs.length === 0;
        selectAllInput.checked = inputs.length > 0 && selectedCount === inputs.length;
        selectAllInput.indeterminate = selectedCount > 0 && selectedCount < inputs.length;
      }
      if (selectionStatus) {
        selectionStatus.textContent = pendingArchive
          ? `将恢复 ${selectedCount}/${inputs.length} 项。未勾选的本机内容会保持不变。`
          : "尚未选择恢复内容。";
      }
      if (confirmButton) {
        confirmButton.disabled = isBusy || !pendingArchive || selectedCount === 0;
      }
    };

    const clearPendingImport = () => {
      pendingArchive = null;
      if (previewBox) previewBox.hidden = true;
      if (previewList) previewList.innerHTML = "";
      if (previewTitle) previewTitle.textContent = "待导入档案";
      if (previewMeta) previewMeta.textContent = "尚未选择文件";
      if (selectionStatus) selectionStatus.textContent = "尚未选择恢复内容。";
      if (selectAllInput) {
        selectAllInput.checked = false;
        selectAllInput.indeterminate = false;
        selectAllInput.disabled = true;
      }
      if (confirmButton) confirmButton.disabled = true;
      if (cancelButton) cancelButton.disabled = true;
    };

    const appendPreviewLine = (fragment, itemKind, id, label, detail, change, options = {}) => {
      const item = document.createElement("li");
      item.dataset.change = change || "normal";
      if (options.defaultSelected === false) {
        item.dataset.defaultSelected = "false";
      }

      const choice = document.createElement("label");
      choice.className = "main-project-preview-choice";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = options.defaultSelected !== false;
      input.dataset.archiveKind = itemKind;
      input.dataset.archiveId = id;
      input.setAttribute("aria-label", `恢复${label}`);

      const body = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = label;

      const text = document.createElement("span");
      text.textContent = detail;

      body.append(title, text);
      if (options.migrationNote) {
        const note = document.createElement("span");
        note.className = "main-project-preview-note";
        note.textContent = options.migrationNote;
        body.append(note);
      }
      choice.append(input, body);
      item.append(choice);
      fragment.appendChild(item);
    };

    const appendMigrationLine = (fragment, migration) => {
      const item = document.createElement("li");
      item.dataset.change = "migration";

      const body = document.createElement("span");
      body.className = "main-project-migration-line";
      const title = document.createElement("strong");
      title.textContent = "迁移说明";
      const text = document.createElement("span");
      text.textContent = migration.message;
      body.append(title, text);
      item.append(body);
      fragment.appendChild(item);
    };

    const renderImportPreview = (preview) => {
      if (!previewBox || !previewList) return;

      previewBox.hidden = false;
      if (previewTitle) previewTitle.textContent = "待导入项目档案";
      if (previewMeta) {
        const summary = preview.summary;
        const schema = preview.schemaSummary;
        const migrationText = preview.migrations?.length ? ` · ${preview.migrations.length} 条迁移` : "";
        const hashText = summary.incomingModelCount
          ? ` / ${summary.assetHashCount} 哈希${summary.missingAssetHashCount ? ` / ${summary.missingAssetHashCount} 缺哈希` : ""}`
          : "";
        previewMeta.textContent = `${formatArchiveDate(preview.exportedAt)} · schema v${schema.version || "-"}${migrationText} · ${summary.storageAdded} 新增 / ${summary.storageUpdated} 覆盖 / ${summary.storageRemoved} 清空 / ${schema.importedModels} 模型${hashText}`;
      }

      const fragment = document.createDocumentFragment();
      preview.migrations?.forEach((migration) => appendMigrationLine(fragment, migration));
      preview.storage.forEach((item) => appendPreviewLine(fragment, "storage", item.id, item.label, describeStorageChange(item), item.change, {
        defaultSelected: item.defaultSelected,
        migrationNote: item.migrationNote
      }));
      preview.indexedDb.forEach((item) => appendPreviewLine(fragment, "indexedDb", item.id, item.label, describeDbChange(item), item.change, {
        defaultSelected: item.defaultSelected,
        migrationNote: item.migrationNote
      }));

      previewList.innerHTML = "";
      previewList.appendChild(fragment);
      if (cancelButton) cancelButton.disabled = false;
      updateRestoreSelectionState();
    };

    clearPendingImport();

    if (exportButton) {
      exportButton.addEventListener("click", async () => {
        clearPendingImport();
        exportButton.disabled = true;
        setStatus("正在整理项目档案，请稍候。", "loading");
        try {
          const result = await exportProject();
          setStatus(result.message, "success");
        } catch (error) {
          setStatus(error?.message || "项目档案导出失败。", "error");
        } finally {
          exportButton.disabled = false;
        }
      });
    }

    if (importFile) {
      importFile.addEventListener("change", async () => {
        const file = importFile.files?.[0];
        if (!file) return;

        clearPendingImport();
        setBusy(true);
        setStatus("正在校验项目档案并生成差异预览。", "loading");
        try {
          const result = await prepareImportProject(file);
          pendingArchive = result.archive;
          renderImportPreview(result.preview);
          const migrationText = result.preview.migrations?.length
            ? ` 已应用 ${result.preview.migrations.length} 条兼容迁移；旧档案缺失的新条目默认保留本机内容。`
            : "";
          setStatus(`${result.message}${migrationText} 可取消不想覆盖的条目，再点击“恢复所选”。`, "success");
        } catch (error) {
          setStatus(error?.message || "项目档案导入失败。", "error");
        } finally {
          setBusy(false);
          importFile.value = "";
        }
      });
    }

    confirmButton?.addEventListener("click", async () => {
      if (!pendingArchive) {
        setStatus("请先选择项目档案。", "error");
        return;
      }
      const restoreOptions = getSelectedRestoreOptions();
      if (!restoreOptions.storageKeys.length && !restoreOptions.dbIds.length) {
        setStatus("请至少勾选一项要恢复的项目档案内容。", "error");
        updateRestoreSelectionState();
        return;
      }

      setBusy(true);
      setStatus("正在恢复所选项目档案，未勾选的本机内容会保持不变。", "loading");
      try {
        await restoreProjectArchive(pendingArchive, restoreOptions);
        const result = summarizeArchive(pendingArchive, "已恢复所选项目档案，刷新页面后生效。", restoreOptions);
        setStatus(`${result.message} 页面即将刷新。`, "success");
        window.setTimeout(() => window.location.reload(), 900);
      } catch (error) {
        setStatus(error?.message || "项目档案导入失败。", "error");
        setBusy(false);
      }
    });

    cancelButton?.addEventListener("click", () => {
      clearPendingImport();
      setStatus("已取消导入项目档案，当前本机项目未被修改。", "normal");
    });

    previewList?.addEventListener("change", (event) => {
      if (event.target.matches("[data-archive-kind][data-archive-id]")) {
        updateRestoreSelectionState();
      }
    });

    selectAllInput?.addEventListener("change", () => {
      getRestoreInputs().forEach((input) => {
        input.checked = selectAllInput.checked;
      });
      updateRestoreSelectionState();
    });
  }

  window.MRProjectArchive = {
    kind: ARCHIVE_KIND,
    version: ARCHIVE_VERSION,
    exportProject,
    importProject,
    prepareImportProject,
    restoreProjectArchive,
    migrateProjectArchive,
    validateArchiveAssetHashes,
    createArrayBufferSha256,
    storageItems: STORAGE_ITEMS.map((item) => ({ ...item })),
    dbItems: DB_ITEMS.map((item) => ({ ...item }))
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindProjectArchiveControls, { once: true });
  } else {
    bindProjectArchiveControls();
  }
})();
