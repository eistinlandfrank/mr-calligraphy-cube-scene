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

    await validateArchiveAssetHashes(migratedArchive, restoreOptions.dbIds, restoreOptions.dbRecords);
    importLocalStorage(migratedArchive.storage || {}, restoreOptions.storageKeys, restoreOptions.storageFields);

    for (const item of DB_ITEMS) {
      if (restoreOptions.dbIds.includes(item.id)) {
        await importDbStore(item, migratedArchive.indexedDb?.[item.id], restoreOptions.dbRecords[item.id]);
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
    const fieldDiff = createStorageFieldDiff(currentValue, incomingValue);

    if (incomingValue !== null && typeof incomingValue !== "string") {
      throw new Error(`项目档案中的 ${item.label} 数据格式不正确。`);
    }

    return {
      id: item.key,
      label: item.label,
      change: getStorageChange(currentValue, incomingValue),
      currentBytes: currentValue ? new Blob([currentValue]).size : 0,
      incomingBytes: incomingValue ? new Blob([incomingValue]).size : 0,
      fieldDiffSummary: fieldDiff.summary,
      fieldImpactSummary: fieldDiff.impactSummary,
      fieldDiffs: fieldDiff.items,
      fieldSelections: fieldDiff.selections,
      defaultSelected: !migratedMissing,
      migrationNote: migratedMissing ? `旧档案不包含“${item.label}”，默认保留当前本机内容。` : ""
    };
  }

  function createStorageFieldDiff(currentValue, incomingValue) {
    const current = parseJsonForDiff(currentValue);
    const incoming = parseJsonForDiff(incomingValue);
    if (!current.ok || !incoming.ok) {
      return { summary: "", impactSummary: "", items: [], selections: [] };
    }

    const currentFields = current.value == null ? new Map() : flattenDiffFields(current.value);
    const incomingFields = incoming.value == null ? new Map() : flattenDiffFields(incoming.value);
    const added = [];
    const updated = [];
    const removed = [];

    incomingFields.forEach((incomingField, path) => {
      const currentField = currentFields.get(path);
      if (!currentField) {
        added.push(incomingField);
        return;
      }
      if (incomingField.signature !== currentField.signature) {
        updated.push(incomingField);
      }
    });

    currentFields.forEach((currentField, path) => {
      if (!incomingFields.has(path)) {
        removed.push(currentField);
      }
    });

    const total = added.length + updated.length + removed.length;
    if (!total) {
      return { summary: "字段无变化", impactSummary: "", items: [], selections: [] };
    }

    const selections = createDeepFieldSelections(current.value, incoming.value, { added, updated, removed });
    return finalizeStorageFieldDiffSummary(added, updated, removed, selections);
  }

  function createDeepFieldSelections(currentValue, incomingValue, diff) {
    if (incomingValue == null) {
      return [];
    }

    const currentTopFields = getTopLevelFieldMap(currentValue);
    const incomingTopFields = getTopLevelFieldMap(incomingValue);
    const currentFields = currentValue == null ? new Map() : flattenDiffFields(currentValue);
    const incomingFields = incomingValue == null ? new Map() : flattenDiffFields(incomingValue);
    const selections = [];
    const wholeFieldKeys = new Set();
    const pushed = new Set();

    const pushSelection = (action, path, currentField, incomingField) => {
      const key = `${action}:${path}`;
      if (pushed.has(key)) {
        return;
      }
      pushed.add(key);
      selections.push(createFieldSelection(action, getFieldActionLabel(action), path, currentField, incomingField));
    };

    const pushWholeFieldSelection = (action, path) => {
      const topPath = getDiffTopLevelPath(path);
      if (wholeFieldKeys.has(topPath)) {
        return;
      }
      wholeFieldKeys.add(topPath);
      pushSelection(action, topPath, currentTopFields.get(topPath), incomingTopFields.get(topPath));
    };

    diff.added.forEach((field) => {
      const topPath = getDiffTopLevelPath(field.path);
      if (!currentTopFields.has(topPath) || isStructuralDiffPath(field.path)) {
        pushWholeFieldSelection("add", field.path);
        return;
      }
      pushSelection("add", field.path, null, incomingFields.get(field.path));
    });

    diff.updated.forEach((field) => {
      if (isStructuralDiffPath(field.path)) {
        pushWholeFieldSelection("update", field.path);
        return;
      }
      pushSelection("update", field.path, currentFields.get(field.path), incomingFields.get(field.path));
    });

    diff.removed.forEach((field) => {
      const topPath = getDiffTopLevelPath(field.path);
      if (!incomingTopFields.has(topPath) || isStructuralDiffPath(field.path)) {
        pushWholeFieldSelection("remove", field.path);
        return;
      }
      pushSelection("remove", field.path, currentFields.get(field.path), null);
    });

    return selections.filter((field) => !wholeFieldKeys.has(getDiffTopLevelPath(field.path)) || field.path === getDiffTopLevelPath(field.path));
  }

  function getFieldActionLabel(action) {
    if (action === "add") return "新增字段";
    if (action === "remove") return "删除字段";
    return "修改字段";
  }

  function getDiffTopLevelPath(path) {
    if (path === "root") {
      return "root";
    }
    return path.match(/^[^.[\]]+/)?.[0] || path;
  }

  function isStructuralDiffPath(path) {
    return path.endsWith(".length") || path.includes("[...]");
  }

  function getTopLevelFieldMap(value) {
    const result = new Map();
    if (value == null) {
      return result;
    }
    if (!Array.isArray(value) && typeof value === "object") {
      Object.keys(value).sort().forEach((key) => {
        result.set(key, { path: key, signature: stableStringify(value[key]), value: value[key] });
      });
      return result;
    }
    result.set("root", { path: "root", signature: stableStringify(value), value });
    return result;
  }

  function createFieldSelection(action, prefix, path, currentField, incomingField) {
    return {
      action,
      path,
      label: `${prefix}：${path}`,
      detail: createFieldSelectionDetail(action, currentField, incomingField),
      impact: getFieldSelectionImpact(action),
      currentPreview: currentField ? createJsonPreview(currentField.value, "本机中无此字段") : "本机中无此字段",
      incomingPreview: incomingField ? createJsonPreview(incomingField.value, "档案中无此字段") : "档案中无此字段"
    };
  }

  function finalizeStorageFieldDiffSummary(added, updated, removed, selections) {
    return {
      summary: `${added.length} 新增字段 / ${updated.length} 修改字段 / ${removed.length} 删除字段`,
      impactSummary: summarizeFieldSelectionImpact(selections),
      items: [
        ...formatFieldDiffItems("新增", added),
        ...formatFieldDiffItems("修改", updated),
        ...formatFieldDiffItems("删除", removed)
      ].slice(0, 6),
      selections
    };
  }

  function createFieldSelectionDetail(action, currentField, incomingField) {
    const current = currentField ? summarizeJsonValue(currentField.value) : "本机无此字段";
    const incoming = incomingField ? summarizeJsonValue(incomingField.value) : "档案无此字段";
    if (action === "remove") {
      return `当前：${current} → 恢复后删除`;
    }
    if (action === "add") {
      return `当前：${current} → 档案：${incoming}`;
    }
    return `当前：${current} → 档案：${incoming}`;
  }

  function getFieldSelectionImpact(action) {
    if (action === "add") return "会新增到本机";
    if (action === "remove") return "会删除本机字段";
    return "会覆盖本机字段";
  }

  function summarizeFieldSelectionImpact(selections) {
    const counts = selections.reduce((result, field) => {
      result[field.action] = (result[field.action] || 0) + 1;
      return result;
    }, {});
    const parts = [];
    if (counts.update) parts.push(`${counts.update} 个覆盖本机字段`);
    if (counts.add) parts.push(`${counts.add} 个新增字段`);
    if (counts.remove) parts.push(`${counts.remove} 个删除字段`);
    return parts.length ? `恢复影响：${parts.join(" / ")}` : "";
  }

  function summarizeJsonValue(value) {
    if (Array.isArray(value)) {
      return `数组 ${value.length} 项`;
    }
    if (value && typeof value === "object") {
      const keys = Object.keys(value).sort();
      return keys.length ? `对象 ${keys.length} 键：${keys.slice(0, 3).join("、")}${keys.length > 3 ? "…" : ""}` : "空对象";
    }
    if (typeof value === "string") {
      return `文本：${value.length > 28 ? `${value.slice(0, 28)}…` : value}`;
    }
    if (typeof value === "number") {
      return `数字：${value}`;
    }
    if (typeof value === "boolean") {
      return value ? "布尔：true" : "布尔：false";
    }
    if (value == null) {
      return "空";
    }
    return String(value);
  }

  function createJsonPreview(value, missingLabel) {
    if (typeof value === "undefined") {
      return missingLabel;
    }
    const text = JSON.stringify(value, null, 2);
    if (typeof text !== "string") {
      return missingLabel;
    }
    return text.length > 720 ? `${text.slice(0, 720)}\n...` : text;
  }

  function parseJsonForDiff(value) {
    if (typeof value !== "string" || !value.trim()) {
      return { ok: true, value: null };
    }
    try {
      return { ok: true, value: JSON.parse(value) };
    } catch (error) {
      return { ok: false, value: null };
    }
  }

  function flattenDiffFields(value, path = "root", result = new Map(), depth = 0) {
    if (depth >= 4 || !value || typeof value !== "object") {
      result.set(path, { path, signature: stableStringify(value), value });
      return result;
    }

    if (Array.isArray(value)) {
      result.set(`${path}.length`, { path: `${path}.length`, signature: stableStringify(value.length), value: value.length });
      value.slice(0, 8).forEach((item, index) => flattenDiffFields(item, `${path}[${index}]`, result, depth + 1));
      if (value.length > 8) {
        result.set(`${path}[...]`, { path: `${path}[...]`, signature: stableStringify(value.length), value: value.length });
      }
      return result;
    }

    const keys = Object.keys(value).sort();
    if (!keys.length) {
      result.set(path, { path, signature: "{}", value });
      return result;
    }

    keys.forEach((key) => {
      flattenDiffFields(value[key], path === "root" ? key : `${path}.${key}`, result, depth + 1);
    });
    return result;
  }

  function formatFieldDiffItems(action, fields) {
    return fields.map((field) => `${action}：${field.path}`);
  }

  function stableStringify(value) {
    if (Array.isArray(value)) {
      return `[${value.map(stableStringify).join(",")}]`;
    }
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  async function compareDbItem(item, pack) {
    const records = Array.isArray(pack?.records) ? pack.records : [];
    const currentRecords = await readDbStoreRecords(item);
    const migratedMissing = pack?.migratedMissing === true;
    const hashSummary = await summarizeDbPackHashes(records, item.label);
    const modelDiff = createDbModelDiff(item, currentRecords, records);

    return {
      id: item.id,
      label: item.label,
      currentCount: currentRecords.length,
      incomingCount: records.length,
      incomingBinaryCount: hashSummary.binaryCount,
      incomingHashCount: hashSummary.hashCount,
      missingHashCount: hashSummary.missingHashCount,
      modelDiffSummary: modelDiff.summary,
      modelDiffs: modelDiff.items,
      modelSelections: modelDiff.selections,
      change: modelDiff.total ? "replace" : "same-count",
      defaultSelected: !migratedMissing,
      migrationNote: migratedMissing ? `旧档案不包含“${item.label}”，默认保留当前本机模型库。` : ""
    };
  }

  function createDbModelDiff(item, currentRecords, incomingRecords) {
    const currentMap = mapDbModelRecords(item, currentRecords, false);
    const incomingMap = mapDbModelRecords(item, incomingRecords, true);
    const added = [];
    const updated = [];
    const removed = [];

    incomingMap.forEach((incomingRecord, key) => {
      const currentRecord = currentMap.get(key);
      if (!currentRecord) {
        added.push(incomingRecord);
        return;
      }
      if (incomingRecord.signature !== currentRecord.signature) {
        updated.push(incomingRecord);
      }
    });

    currentMap.forEach((currentRecord, key) => {
      if (!incomingMap.has(key)) {
        removed.push(currentRecord);
      }
    });

    const total = added.length + updated.length + removed.length;
    return {
      total,
      summary: total
        ? `${added.length} 新增模型 / ${updated.length} 修改模型 / ${removed.length} 删除模型`
        : "模型无变化",
      items: [
        ...formatDbModelDiffItems("新增模型", added),
        ...formatDbModelDiffItems("修改模型", updated),
        ...formatDbModelDiffItems("删除模型", removed)
      ].slice(0, 6),
      selections: [
        ...createDbModelSelections("add", added, currentMap, incomingMap),
        ...createDbModelSelections("update", updated, currentMap, incomingMap),
        ...createDbModelSelections("remove", removed, currentMap, incomingMap)
      ]
    };
  }

  function mapDbModelRecords(item, records, isArchiveRecord) {
    return records.reduce((result, record, index) => {
      const model = normalizeDbModelRecord(item, record, index, isArchiveRecord);
      result.set(model.key, model);
      return result;
    }, new Map());
  }

  function normalizeDbModelRecord(item, record, index, isArchiveRecord) {
    const data = isArchiveRecord && record?.data && typeof record.data === "object"
      ? record.data
      : record || {};
    const key = String(
      data[item.keyPath] ||
      data.key ||
      data.dbKey ||
      data.id ||
      data.fileName ||
      data.label ||
      `model-${index + 1}`
    ).trim();
    const label = String(data.label || data.fileName || key || `模型 ${index + 1}`).trim();
    const bytes = Number(record?.bytes || data.metrics?.fileBytes || data.fileBytes || record?.arrayBuffer?.byteLength || data.arrayBuffer?.byteLength || 0);
    const model = {
      key: key || `model-${index + 1}`,
      label: label || `模型 ${index + 1}`,
      fileName: String(data.fileName || "").trim(),
      type: String(data.type || "").trim(),
      bytes: Number.isFinite(bytes) ? bytes : 0,
      sha256: normalizeSha256(record?.sha256 || data.sha256),
      metrics: normalizeModelMetricsForDiff(data.metrics)
    };
    model.signature = stableStringify({
      label: model.label,
      fileName: model.fileName,
      type: model.type,
      bytes: model.bytes,
      sha256: model.sha256,
      metrics: model.metrics
    });
    return model;
  }

  function normalizeModelMetricsForDiff(metrics) {
    if (!metrics || typeof metrics !== "object") {
      return {};
    }
    return {
      fileBytes: Number(metrics.fileBytes || 0),
      meshCount: Number(metrics.meshCount || 0),
      vertexCount: Number(metrics.vertexCount || 0),
      dimensions: metrics.dimensions && typeof metrics.dimensions === "object"
        ? {
            width: Number(metrics.dimensions.width || 0),
            height: Number(metrics.dimensions.height || 0),
            depth: Number(metrics.dimensions.depth || 0)
          }
        : {}
    };
  }

  function formatDbModelDiffItems(action, models) {
    return models.map((model) => {
      const details = [
        model.fileName || "",
        model.type ? model.type.toUpperCase() : "",
        model.bytes ? formatBytes(model.bytes) : "",
        model.sha256 ? "SHA-256" : ""
      ].filter(Boolean).join(" · ");
      return `${action}：${model.label}${details ? `（${details}）` : ""}`;
    });
  }

  function createDbModelSelections(action, models, currentMap, incomingMap) {
    return models.map((model) => {
      const currentModel = action === "add" ? null : currentMap.get(model.key);
      const incomingModel = action === "remove" ? null : incomingMap.get(model.key);
      const conflicts = action === "remove" ? [] : findDbModelNameConflicts(model, currentMap, new Set([model.key]));
      const conflictSummary = summarizeDbModelNameConflicts(conflicts);
      return {
        action,
        key: model.key,
        label: `${getDbModelActionLabel(action)}：${model.label}`,
        detail: formatDbModelSelectionDetail(model),
        conflictSummary,
        conflictCount: conflicts.length,
        suggestedLabel: conflicts.length
          ? createConflictResolvedDbModelLabel(model.label, collectUsedDbModelLabels(currentMap, new Set(), model.key, new Map()))
          : "",
        currentPreview: createDbModelPreview(currentModel, "本机中无此模型"),
        incomingPreview: createDbModelPreview(incomingModel, "档案中无此模型")
      };
    });
  }

  function getDbModelActionLabel(action) {
    if (action === "add") return "新增模型";
    if (action === "remove") return "删除模型";
    return "修改模型";
  }

  function formatDbModelSelectionDetail(model) {
    return [
      model.fileName || "",
      model.type ? model.type.toUpperCase() : "",
      model.bytes ? formatBytes(model.bytes) : "",
      model.sha256 ? "SHA-256" : ""
    ].filter(Boolean).join(" · ") || model.key;
  }

  function createDbModelPreview(model, missingLabel) {
    if (!model) {
      return missingLabel;
    }

    const preview = {
      key: model.key,
      label: model.label
    };
    if (model.fileName) {
      preview.fileName = model.fileName;
    }
    if (model.type) {
      preview.type = model.type;
    }
    if (model.bytes) {
      preview.bytes = model.bytes;
      preview.size = formatBytes(model.bytes);
    }
    if (model.sha256) {
      preview.sha256 = model.sha256;
    }
    if (model.metrics && Object.keys(model.metrics).length) {
      preview.metrics = model.metrics;
    }
    return createJsonPreview(preview, missingLabel);
  }

  function findDbModelNameConflicts(model, currentMap, ignoredKeys = new Set()) {
    const labelToken = normalizeDbModelCompareToken(model.label);
    const fileToken = normalizeDbModelCompareToken(model.fileName);
    const conflicts = [];
    currentMap.forEach((currentModel) => {
      if (ignoredKeys.has(currentModel.key)) {
        return;
      }
      const reasons = [];
      if (labelToken && labelToken === normalizeDbModelCompareToken(currentModel.label)) {
        reasons.push("名称");
      }
      if (fileToken && fileToken === normalizeDbModelCompareToken(currentModel.fileName)) {
        reasons.push("文件名");
      }
      if (reasons.length) {
        conflicts.push({
          key: currentModel.key,
          label: currentModel.label,
          fileName: currentModel.fileName,
          reasons
        });
      }
    });
    return conflicts;
  }

  function summarizeDbModelNameConflicts(conflicts) {
    if (!conflicts.length) {
      return "";
    }
    const first = conflicts[0];
    const reasonText = [...new Set(first.reasons)].join("和");
    const extra = conflicts.length > 1 ? `等 ${conflicts.length} 个模型` : "";
    return `命名冲突：与本机“${first.label || first.fileName || first.key}”${extra}${reasonText}相同，可选择改名、替换或自定义名称。`;
  }

  function normalizeDbModelCompareToken(value) {
    return String(value || "").trim().toLowerCase();
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
    const normalizedStorageKeys = [...new Set(storageKeys)];
    const normalizedDbIds = [...new Set(dbIds)];
    return {
      storageKeys: normalizedStorageKeys,
      dbIds: normalizedDbIds,
      storageFields: normalizeSelectedStorageFields(options?.storageFields, normalizedStorageKeys),
      dbRecords: normalizeSelectedDbRecords(options?.dbRecords, normalizedDbIds)
    };
  }

  function normalizeSelectedDbRecords(dbRecords, dbIds) {
    if (!dbRecords || typeof dbRecords !== "object") {
      return {};
    }

    const selected = new Set(dbIds);
    return Object.keys(dbRecords).reduce((result, id) => {
      if (!selected.has(id) || !Array.isArray(dbRecords[id])) {
        return result;
      }
      const seen = new Set();
      const records = dbRecords[id].filter((record) => {
        const action = record?.action;
        const key = String(record?.key || "").trim();
        const token = `${action}:${key}`;
        if (!["add", "update", "remove"].includes(action) || !key || seen.has(token)) {
          return false;
        }
        seen.add(token);
        return true;
      }).map((record) => ({
        action: record.action,
        key: String(record.key).trim(),
        conflictMode: normalizeDbModelConflictMode(record.conflictMode),
        customLabel: normalizeDbModelCustomLabel(record.customLabel)
      }));
      if (records.length) {
        result[id] = records;
      }
      return result;
    }, {});
  }

  function normalizeDbModelConflictMode(value) {
    if (value === "replace" || value === "custom") {
      return value;
    }
    return "rename";
  }

  function normalizeDbModelCustomLabel(value) {
    return String(value || "").trim().slice(0, 80);
  }

  function normalizeSelectedStorageFields(storageFields, storageKeys) {
    if (!storageFields || typeof storageFields !== "object") {
      return {};
    }

    const selected = new Set(storageKeys);
    return Object.keys(storageFields).reduce((result, key) => {
      if (!selected.has(key) || !Array.isArray(storageFields[key])) {
        return result;
      }
      const seen = new Set();
      const fields = storageFields[key].filter((field) => {
        const action = field?.action;
        const path = field?.path;
        const token = `${action}:${path}`;
        if (!["add", "update", "remove"].includes(action) || typeof path !== "string" || !path || seen.has(token)) {
          return false;
        }
        seen.add(token);
        return true;
      }).map((field) => ({
        action: field.action,
        path: field.path
      }));
      if (fields.length) {
        result[key] = fields;
      }
      return result;
    }, {});
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
      mainReleases: Number(summary.mainReleases) || 0,
      realisticObjects: Number(summary.realisticObjects) || 0,
      realisticSnapshots: Number(summary.realisticSnapshots) || 0,
      realisticReleases: Number(summary.realisticReleases) || 0,
      importedModels: Number(summary.importedModels) || 0,
      missingModelBinaries: Number(summary.missingModelBinaries) || 0,
      missingModelHashes: Number(summary.missingModelHashes) || 0,
      migrationCount: Array.isArray(schema?.migrations) ? schema.migrations.length : 0
    };
  }

  function importLocalStorage(storage, selectedKeys = STORAGE_ITEMS.map((item) => item.key), selectedFields = {}) {
    const selected = new Set(selectedKeys);
    STORAGE_ITEMS.forEach((item) => {
      if (!selected.has(item.key)) {
        return;
      }
      const record = storage[item.key];
      const fieldSelections = selectedFields[item.key];
      if (Array.isArray(fieldSelections) && fieldSelections.length) {
        const merged = mergeStorageJsonFields(item, record?.value ?? null, fieldSelections);
        if (merged.remove) {
          window.localStorage.removeItem(item.key);
        } else {
          window.localStorage.setItem(item.key, merged.value);
        }
        return;
      }
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

  function mergeStorageJsonFields(item, incomingValue, fieldSelections) {
    const current = parseJsonForDiff(window.localStorage.getItem(item.key));
    const incoming = parseJsonForDiff(incomingValue);
    if (!current.ok || !incoming.ok) {
      throw new Error(`${item.label} 不是可合并的 JSON 数据，请改用整项恢复。`);
    }

    let result = cloneJsonValue(current.value);
    if (result == null || typeof result !== "object") {
      result = Array.isArray(incoming.value) ? [] : {};
    }

    fieldSelections.forEach((field) => {
      if (field.path === "root") {
        result = field.action === "remove" ? null : cloneJsonValue(incoming.value);
        return;
      }

      const tokens = parseDiffPath(field.path);
      if (!tokens.length) {
        return;
      }
      if (field.action === "remove") {
        deleteJsonPath(result, tokens);
        return;
      }

      const incomingField = readJsonPath(incoming.value, tokens);
      if (incomingField.exists) {
        result = ensureMergeRoot(result, tokens);
        setJsonPath(result, tokens, cloneJsonValue(incomingField.value));
      }
    });

    return result == null
      ? { remove: true, value: "" }
      : { remove: false, value: JSON.stringify(result) };
  }

  function cloneJsonValue(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function ensureMergeRoot(value, tokens) {
    if (value && typeof value === "object") {
      return value;
    }
    return typeof tokens[0] === "number" || tokens[0] === "length" ? [] : {};
  }

  function parseDiffPath(path) {
    if (path === "root") {
      return [];
    }
    const tokens = [];
    path.split(".").forEach((segment) => {
      const name = segment.match(/^[^\[]+/)?.[0] || "";
      if (name) {
        tokens.push(name);
      }
      const indexMatches = segment.matchAll(/\[(\d+|\.\.\.)\]/g);
      for (const match of indexMatches) {
        if (match[1] !== "...") {
          tokens.push(Number(match[1]));
        }
      }
    });
    return tokens;
  }

  function readJsonPath(value, tokens) {
    let cursor = value;
    for (const token of tokens) {
      if (cursor == null || typeof cursor !== "object" || !(token in cursor)) {
        return { exists: false, value: undefined };
      }
      cursor = cursor[token];
    }
    return { exists: true, value: cursor };
  }

  function setJsonPath(target, tokens, value) {
    let cursor = target;
    tokens.forEach((token, index) => {
      const isLast = index === tokens.length - 1;
      if (isLast) {
        cursor[token] = value;
        return;
      }
      const nextToken = tokens[index + 1];
      if (cursor[token] == null || typeof cursor[token] !== "object") {
        cursor[token] = typeof nextToken === "number" || nextToken === "length" ? [] : {};
      }
      cursor = cursor[token];
    });
  }

  function deleteJsonPath(target, tokens) {
    if (!target || typeof target !== "object" || !tokens.length) {
      return;
    }
    let cursor = target;
    for (let index = 0; index < tokens.length - 1; index += 1) {
      const token = tokens[index];
      if (cursor == null || typeof cursor !== "object" || !(token in cursor)) {
        return;
      }
      cursor = cursor[token];
    }
    const lastToken = tokens[tokens.length - 1];
    if (lastToken === "length" && tokens.length > 1) {
      deleteJsonPath(target, tokens.slice(0, -1));
      return;
    }
    if (Array.isArray(cursor) && typeof lastToken === "number") {
      cursor.splice(lastToken, 1);
      return;
    }
    delete cursor[lastToken];
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

  async function importDbStore(item, pack, selectedModels = null) {
    const db = await openDb(item);
    const records = Array.isArray(pack?.records) ? pack.records : [];
    if (Array.isArray(selectedModels) && selectedModels.length) {
      await importSelectedDbModels(item, db, records, selectedModels);
      db.close();
      return;
    }
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

  async function importSelectedDbModels(item, db, archiveRecords, selectedModels) {
    const archiveRecordMap = mapArchiveDbRecords(item, archiveRecords);
    const currentModelMap = mapDbModelRecords(item, await readAllRecords(db, item.storeName), false);
    const explicitRemoveKeys = new Set(selectedModels
      .filter((selection) => selection.action === "remove")
      .map((selection) => selection.key));
    const replacementRemoveKeys = new Set();
    const restoredEntries = [];
    const restoredRecords = new Map();

    for (const selection of selectedModels) {
      if (selection.action === "remove") {
        continue;
      }
      const archiveRecord = archiveRecordMap.get(selection.key);
      if (!archiveRecord) {
        throw new Error(`${item.label} 中缺少要恢复的模型：${selection.key}。`);
      }
      const restoredRecord = await deserializeDbRecord(archiveRecord, item.label);
      if (selection.conflictMode === "custom" && selection.customLabel) {
        restoredRecord.label = selection.customLabel;
      }
      const restoredModel = normalizeDbModelRecord(item, restoredRecord, 0, false);
      if (selection.conflictMode === "replace") {
        findDbModelNameConflicts(restoredModel, currentModelMap, new Set([restoredModel.key])).forEach((conflict) => {
          replacementRemoveKeys.add(conflict.key);
        });
      }
      restoredEntries.push({ selection, record: restoredRecord });
    }

    const selectedRemoveKeys = new Set([...explicitRemoveKeys, ...replacementRemoveKeys]);
    restoredEntries.forEach(({ selection, record }) => {
      resolveDbModelRestoreConflict(item, record, currentModelMap, selectedRemoveKeys, restoredRecords);
      restoredRecords.set(selection.key, record);
    });

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(item.storeName, "readwrite");
      const store = transaction.objectStore(item.storeName);
      replacementRemoveKeys.forEach((key) => {
        store.delete(key);
      });
      selectedModels.forEach((selection) => {
        if (selection.action === "remove") {
          store.delete(selection.key);
          return;
        }
        const record = restoredRecords.get(selection.key);
        if (record) {
          store.put(record);
        }
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error(`无法恢复 ${item.label}。`));
    });
  }

  function mapArchiveDbRecords(item, records) {
    return records.reduce((result, record, index) => {
      const model = normalizeDbModelRecord(item, record, index, true);
      result.set(model.key, record);
      return result;
    }, new Map());
  }

  function filterArchiveDbRecordsBySelection(item, records, selectedModels) {
    if (!Array.isArray(selectedModels) || !selectedModels.length) {
      return records;
    }

    const selectedKeys = new Set(selectedModels
      .filter((selection) => selection.action !== "remove")
      .map((selection) => selection.key));
    if (!selectedKeys.size) {
      return [];
    }
    return records.filter((record, index) => {
      const model = normalizeDbModelRecord(item, record, index, true);
      return selectedKeys.has(model.key);
    });
  }

  function resolveDbModelRestoreConflict(item, record, currentModelMap, selectedRemoveKeys, pendingRecords) {
    const model = normalizeDbModelRecord(item, record, 0, false);
    const ignoredKeys = new Set([...selectedRemoveKeys, model.key]);
    const conflicts = [
      ...findDbModelNameConflicts(model, currentModelMap, ignoredKeys),
      ...findPendingDbModelNameConflicts(model, pendingRecords)
    ];
    if (!conflicts.length) {
      return record;
    }

    const usedLabels = collectUsedDbModelLabels(currentModelMap, selectedRemoveKeys, model.key, pendingRecords);
    const originalLabel = String(record.label || model.label || record.fileName || model.key || "导入模型").trim();
    record.label = createConflictResolvedDbModelLabel(originalLabel, usedLabels);
    return record;
  }

  function findPendingDbModelNameConflicts(model, pendingRecords) {
    const pendingMap = mapDbModelRecords({ keyPath: "key" }, Array.from(pendingRecords.values()), false);
    return findDbModelNameConflicts(model, pendingMap, new Set([model.key]));
  }

  function collectUsedDbModelLabels(currentModelMap, selectedRemoveKeys, currentKey, pendingRecords) {
    const labels = new Set();
    currentModelMap.forEach((model) => {
      if (selectedRemoveKeys.has(model.key) || model.key === currentKey) {
        return;
      }
      const token = normalizeDbModelCompareToken(model.label);
      if (token) {
        labels.add(token);
      }
    });
    pendingRecords.forEach((record) => {
      const token = normalizeDbModelCompareToken(record.label);
      if (token) {
        labels.add(token);
      }
    });
    return labels;
  }

  function createConflictResolvedDbModelLabel(label, usedLabels) {
    const base = String(label || "导入模型").trim() || "导入模型";
    for (let index = 1; index < 1000; index += 1) {
      const suffix = index === 1 ? "（档案）" : `（档案 ${index}）`;
      const candidate = `${base.slice(0, Math.max(1, 60 - suffix.length))}${suffix}`;
      if (!usedLabels.has(normalizeDbModelCompareToken(candidate))) {
        return candidate;
      }
    }
    return `${base.slice(0, 48)}（档案）`;
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

  async function validateArchiveAssetHashes(archive, selectedDbIds = DB_ITEMS.map((item) => item.id), selectedDbRecords = {}) {
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
      const selectedRecords = filterArchiveDbRecordsBySelection(item, records, selectedDbRecords[item.id]);
      summaries.push({
        id: item.id,
        label: item.label,
        ...await summarizeDbPackHashes(selectedRecords, item.label)
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
      const selectedModels = restoreOptions.dbRecords[item.id];
      if (Array.isArray(selectedModels) && selectedModels.length) {
        return sum + selectedModels.length;
      }
      return sum + (Array.isArray(pack?.records) ? pack.records.length : 0);
    }, 0);
    const modelHashCount = DB_ITEMS.filter((item) => selectedDbIds.has(item.id)).reduce((sum, item) => {
      const records = archive.indexedDb?.[item.id]?.records;
      const selectedRecords = Array.isArray(records)
        ? filterArchiveDbRecordsBySelection(item, records, restoreOptions.dbRecords[item.id])
        : [];
      return sum + selectedRecords.filter((record) => normalizeSha256(record?.sha256 || record?.data?.sha256)).length;
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
    const getFieldInputs = () => Array.from(previewList?.querySelectorAll("[data-storage-field-key][data-storage-field-path]") || []);
    const getModelInputs = () => Array.from(previewList?.querySelectorAll("[data-db-model-id][data-db-model-key]") || []);
    const getModelConflictInputs = () => Array.from(previewList?.querySelectorAll("[data-db-model-id][data-db-model-conflict-for]") || []);
    const getModelCustomLabelInputs = () => Array.from(previewList?.querySelectorAll("[data-db-model-id][data-db-model-custom-label-for]") || []);

    const getSelectedRestoreOptions = () => {
      const selected = getRestoreInputs().filter((input) => input.checked);
      const fieldInputs = getFieldInputs();
      const modelInputs = getModelInputs();
      const modelConflictInputs = getModelConflictInputs();
      const modelCustomLabelInputs = getModelCustomLabelInputs();
      const storageFields = {};
      const storageKeys = [];
      const dbRecords = {};
      const selectedStorageKeys = new Set(selected
        .filter((input) => input.dataset.archiveKind === "storage")
        .map((input) => input.dataset.archiveId));
      const selectedDbIds = new Set(selected
        .filter((input) => input.dataset.archiveKind === "indexedDb")
        .map((input) => input.dataset.archiveId));

      selectedStorageKeys.forEach((key) => {
        const fieldsForKey = fieldInputs.filter((input) => input.dataset.storageFieldKey === key);
        if (!fieldsForKey.length) {
          storageKeys.push(key);
          return;
        }

        const selectedFields = fieldsForKey
          .filter((input) => input.checked)
          .map((input) => ({
            path: input.dataset.storageFieldPath,
            action: input.dataset.storageFieldAction
          }));
        if (selectedFields.length) {
          storageKeys.push(key);
          storageFields[key] = selectedFields;
        }
      });

      const dbIds = [];
      selectedDbIds.forEach((id) => {
        const modelsForDb = modelInputs.filter((input) => input.dataset.dbModelId === id);
        if (!modelsForDb.length) {
          dbIds.push(id);
          return;
        }

        const selectedModels = modelsForDb
          .filter((input) => input.checked)
          .map((input) => {
            const conflictModeInput = modelConflictInputs.find((candidate) => (
              candidate.dataset.dbModelId === id &&
              candidate.dataset.dbModelConflictFor === input.dataset.dbModelKey
            ));
            const customLabelInput = modelCustomLabelInputs.find((candidate) => (
              candidate.dataset.dbModelId === id &&
              candidate.dataset.dbModelCustomLabelFor === input.dataset.dbModelKey
            ));
            return {
              key: input.dataset.dbModelKey,
              action: input.dataset.dbModelAction,
              conflictMode: conflictModeInput?.value || "rename",
              customLabel: customLabelInput?.value || ""
            };
          });
        if (selectedModels.length) {
          dbIds.push(id);
          dbRecords[id] = selectedModels;
        }
      });

      return {
        storageKeys,
        dbIds,
        storageFields,
        dbRecords
      };
    };

    const updateRestoreSelectionState = () => {
      const inputs = getRestoreInputs();
      const fieldInputs = getFieldInputs();
      const modelInputs = getModelInputs();
      const modelConflictInputs = getModelConflictInputs();
      const modelCustomLabelInputs = getModelCustomLabelInputs();
      const restoreOptions = getSelectedRestoreOptions();
      const selectedCount = restoreOptions.storageKeys.length + restoreOptions.dbIds.length;
      const selectedControlCount = inputs.filter((input) => input.checked).length +
        fieldInputs.filter((input) => input.checked).length +
        modelInputs.filter((input) => input.checked).length;
      const totalControlCount = inputs.length + fieldInputs.length + modelInputs.length;
      const selectedFieldCount = Object.values(restoreOptions.storageFields).reduce((sum, fields) => sum + fields.length, 0);
      const selectedModelCount = Object.values(restoreOptions.dbRecords).reduce((sum, models) => sum + models.length, 0);
      inputs.forEach((input) => {
        input.disabled = isBusy;
      });
      const selectedStorageKeys = new Set(inputs
        .filter((input) => input.checked && input.dataset.archiveKind === "storage")
        .map((input) => input.dataset.archiveId));
      fieldInputs.forEach((input) => {
        input.disabled = isBusy || !selectedStorageKeys.has(input.dataset.storageFieldKey);
      });
      const checkedDbIds = new Set(inputs
        .filter((input) => input.checked && input.dataset.archiveKind === "indexedDb")
        .map((input) => input.dataset.archiveId));
      modelInputs.forEach((input) => {
        input.disabled = isBusy || !checkedDbIds.has(input.dataset.dbModelId);
      });
      modelConflictInputs.forEach((input) => {
        const modelInput = modelInputs.find((candidate) => (
          candidate.dataset.dbModelId === input.dataset.dbModelId &&
          candidate.dataset.dbModelKey === input.dataset.dbModelConflictFor
        ));
        input.disabled = isBusy || !checkedDbIds.has(input.dataset.dbModelId) || !modelInput?.checked;
      });
      modelCustomLabelInputs.forEach((input) => {
        const modelInput = modelInputs.find((candidate) => (
          candidate.dataset.dbModelId === input.dataset.dbModelId &&
          candidate.dataset.dbModelKey === input.dataset.dbModelCustomLabelFor
        ));
        const conflictModeInput = modelConflictInputs.find((candidate) => (
          candidate.dataset.dbModelId === input.dataset.dbModelId &&
          candidate.dataset.dbModelConflictFor === input.dataset.dbModelCustomLabelFor
        ));
        const isCustomMode = conflictModeInput?.value === "custom";
        input.hidden = !isCustomMode;
        input.disabled = isBusy || !checkedDbIds.has(input.dataset.dbModelId) || !modelInput?.checked || !isCustomMode;
      });

      if (selectAllInput) {
        selectAllInput.disabled = isBusy || !pendingArchive || inputs.length === 0;
        selectAllInput.checked = totalControlCount > 0 && selectedControlCount === totalControlCount;
        selectAllInput.indeterminate = selectedControlCount > 0 && selectedControlCount < totalControlCount;
      }
      if (selectionStatus) {
        const fieldText = fieldInputs.length ? `，字段 ${selectedFieldCount}/${fieldInputs.length}` : "";
        const modelText = modelInputs.length ? `，模型 ${selectedModelCount}/${modelInputs.length}` : "";
        selectionStatus.textContent = pendingArchive
          ? `将恢复 ${selectedCount}/${inputs.length} 项${fieldText}${modelText}。未勾选的本机内容会保持不变。`
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
      if (options.fieldDiffSummary) {
        const fieldSummary = document.createElement("span");
        fieldSummary.className = "main-project-field-summary";
        fieldSummary.textContent = options.fieldDiffSummary;
        body.append(fieldSummary);
      }
      if (options.fieldImpactSummary) {
        const impactSummary = document.createElement("span");
        impactSummary.className = "main-project-field-impact-summary";
        impactSummary.textContent = options.fieldImpactSummary;
        body.append(impactSummary);
      }
      if (options.modelDiffSummary) {
        const modelSummary = document.createElement("span");
        modelSummary.className = "main-project-model-summary";
        modelSummary.textContent = options.modelDiffSummary;
        body.append(modelSummary);
      }
      if (Array.isArray(options.fieldSelections) && options.fieldSelections.length) {
        const fieldList = document.createElement("ul");
        fieldList.className = "main-project-field-diffs main-project-field-diffs--selectable";
        options.fieldSelections.forEach((field) => {
          const fieldItem = document.createElement("li");
          fieldItem.dataset.fieldAction = field.action;
          const fieldChoice = document.createElement("label");
          fieldChoice.className = "main-project-field-choice";
          const fieldInput = document.createElement("input");
          fieldInput.type = "checkbox";
          fieldInput.checked = options.defaultSelected !== false;
          fieldInput.dataset.storageFieldKey = id;
          fieldInput.dataset.storageFieldPath = field.path;
          fieldInput.dataset.storageFieldAction = field.action;
          fieldInput.setAttribute("aria-label", `恢复${label}${field.label}`);
          const fieldText = document.createElement("span");
          const fieldLabel = document.createElement("span");
          fieldLabel.textContent = field.label;
          const fieldImpact = document.createElement("span");
          fieldImpact.className = "main-project-field-impact";
          fieldImpact.textContent = `${field.impact} · ${field.detail}`;
          fieldText.append(fieldLabel, fieldImpact);
          fieldChoice.append(fieldInput, fieldText);
          fieldItem.appendChild(fieldChoice);
          if (field.currentPreview || field.incomingPreview) {
            const fieldDetails = document.createElement("details");
            fieldDetails.className = "main-project-field-details";
            const summary = document.createElement("summary");
            summary.textContent = "查看字段片段";
            const previewGrid = document.createElement("div");
            previewGrid.className = "main-project-field-preview-grid";
            [
              ["当前本机", field.currentPreview],
              ["导入档案", field.incomingPreview]
            ].forEach(([previewLabel, previewValue]) => {
              const previewBlock = document.createElement("span");
              const previewTitle = document.createElement("strong");
              previewTitle.textContent = previewLabel;
              const previewCode = document.createElement("pre");
              previewCode.textContent = previewValue || "无";
              previewBlock.append(previewTitle, previewCode);
              previewGrid.appendChild(previewBlock);
            });
            fieldDetails.append(summary, previewGrid);
            fieldItem.appendChild(fieldDetails);
          }
          fieldList.appendChild(fieldItem);
        });
        body.append(fieldList);
      } else if (Array.isArray(options.fieldDiffs) && options.fieldDiffs.length) {
        const fieldList = document.createElement("ul");
        fieldList.className = "main-project-field-diffs";
        options.fieldDiffs.forEach((fieldDiff) => {
          const fieldItem = document.createElement("li");
          fieldItem.textContent = fieldDiff;
          fieldList.appendChild(fieldItem);
        });
        body.append(fieldList);
      }
      if (Array.isArray(options.modelSelections) && options.modelSelections.length) {
        const modelList = document.createElement("ul");
        modelList.className = "main-project-model-diffs main-project-model-diffs--selectable";
        options.modelSelections.forEach((model) => {
          const modelItem = document.createElement("li");
          modelItem.dataset.modelAction = model.action;
          const modelChoice = document.createElement("label");
          modelChoice.className = "main-project-model-choice";
          const modelInput = document.createElement("input");
          modelInput.type = "checkbox";
          modelInput.checked = options.defaultSelected !== false;
          modelInput.dataset.dbModelId = id;
          modelInput.dataset.dbModelKey = model.key;
          modelInput.dataset.dbModelAction = model.action;
          modelInput.setAttribute("aria-label", `恢复${label}${model.label}`);
          const modelText = document.createElement("span");
          const modelLabel = document.createElement("span");
          modelLabel.textContent = model.label;
          const modelImpact = document.createElement("span");
          modelImpact.className = "main-project-model-impact";
          modelImpact.textContent = model.detail;
          modelText.append(modelLabel, modelImpact);
          if (model.conflictSummary) {
            const modelConflict = document.createElement("span");
            modelConflict.className = "main-project-model-conflict";
            modelConflict.textContent = model.conflictSummary;
            modelText.appendChild(modelConflict);
          }
          modelChoice.append(modelInput, modelText);
          modelItem.appendChild(modelChoice);
          if (model.conflictCount) {
            const conflictControl = document.createElement("label");
            conflictControl.className = "main-project-model-conflict-control";
            const conflictLabel = document.createElement("span");
            conflictLabel.textContent = "冲突处理";
            const conflictSelect = document.createElement("select");
            conflictSelect.dataset.dbModelId = id;
            conflictSelect.dataset.dbModelConflictFor = model.key;
            [
              ["rename", "保留本机，档案模型自动改名"],
              ["replace", "替换本机同名模型"],
              ["custom", "自定义档案模型名称"]
            ].forEach(([value, textValue]) => {
              const option = document.createElement("option");
              option.value = value;
              option.textContent = textValue;
              conflictSelect.appendChild(option);
            });
            const customLabelInput = document.createElement("input");
            customLabelInput.type = "text";
            customLabelInput.maxLength = 80;
            customLabelInput.value = model.suggestedLabel || "";
            customLabelInput.placeholder = "输入恢复后的模型名称";
            customLabelInput.dataset.dbModelId = id;
            customLabelInput.dataset.dbModelCustomLabelFor = model.key;
            customLabelInput.setAttribute("aria-label", `自定义${model.label}恢复后的模型名称`);
            customLabelInput.hidden = true;
            conflictControl.append(conflictLabel, conflictSelect, customLabelInput);
            modelItem.appendChild(conflictControl);
          }
          if (model.currentPreview || model.incomingPreview) {
            const modelDetails = document.createElement("details");
            modelDetails.className = "main-project-model-details";
            const summary = document.createElement("summary");
            summary.textContent = "查看模型片段";
            const previewGrid = document.createElement("div");
            previewGrid.className = "main-project-model-preview-grid";
            [
              ["当前本机", model.currentPreview],
              ["导入档案", model.incomingPreview]
            ].forEach(([previewLabel, previewValue]) => {
              const previewBlock = document.createElement("span");
              const previewTitle = document.createElement("strong");
              previewTitle.textContent = previewLabel;
              const previewCode = document.createElement("pre");
              previewCode.textContent = previewValue || "无";
              previewBlock.append(previewTitle, previewCode);
              previewGrid.appendChild(previewBlock);
            });
            modelDetails.append(summary, previewGrid);
            modelItem.appendChild(modelDetails);
          }
          modelList.appendChild(modelItem);
        });
        body.append(modelList);
      } else if (Array.isArray(options.modelDiffs) && options.modelDiffs.length) {
        const modelList = document.createElement("ul");
        modelList.className = "main-project-model-diffs";
        options.modelDiffs.forEach((modelDiff) => {
          const modelItem = document.createElement("li");
          modelItem.textContent = modelDiff;
          modelList.appendChild(modelItem);
        });
        body.append(modelList);
      }
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
        fieldDiffSummary: item.fieldDiffSummary,
        fieldImpactSummary: item.fieldImpactSummary,
        fieldDiffs: item.fieldDiffs,
        fieldSelections: item.fieldSelections,
        migrationNote: item.migrationNote
      }));
      preview.indexedDb.forEach((item) => appendPreviewLine(fragment, "indexedDb", item.id, item.label, describeDbChange(item), item.change, {
        defaultSelected: item.defaultSelected,
        modelDiffSummary: item.modelDiffSummary,
        modelDiffs: item.modelDiffs,
        modelSelections: item.modelSelections,
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
      if (event.target.matches("[data-archive-kind][data-archive-id], [data-storage-field-key][data-storage-field-path], [data-db-model-id][data-db-model-key], [data-db-model-id][data-db-model-conflict-for], [data-db-model-id][data-db-model-custom-label-for]")) {
        updateRestoreSelectionState();
      }
    });

    selectAllInput?.addEventListener("change", () => {
      getRestoreInputs().forEach((input) => {
        input.checked = selectAllInput.checked;
      });
      getFieldInputs().forEach((input) => {
        input.checked = selectAllInput.checked;
      });
      getModelInputs().forEach((input) => {
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
