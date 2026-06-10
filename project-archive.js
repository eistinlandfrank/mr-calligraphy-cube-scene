(function () {
  const ARCHIVE_KIND = "mr-calligraphy-project-archive";
  const ARCHIVE_VERSION = 1;
  const STORAGE_ITEMS = [
    { key: "mr-calligraphy-learning-state-v1", label: "学习状态" },
    { key: "mr-calligraphy-room-config-v3-wood", label: "房间与角色配置" },
    { key: "mr-calligraphy-main-scene-layout-v1", label: "主场景布局" },
    { key: "mr-calligraphy-main-scene-history-v1", label: "主场景保存历史" },
    { key: "mr-calligraphy-main-scene-published-v1", label: "主场景发布版本" },
    { key: "mr-calligraphy-realistic-layout-v1", label: "写实场景布局" }
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
        "恢复档案会覆盖当前浏览器中的同名项目状态。"
      ]
    };

    for (const item of DB_ITEMS) {
      archive.indexedDb[item.id] = await exportDbStore(item);
    }

    downloadJson(archive, `mr-calligraphy-project-${formatTimestamp(new Date())}.json`);
    return summarizeArchive(archive, "已导出项目档案。");
  }

  async function importProject(fileOrArchive) {
    const archive = await resolveArchive(fileOrArchive);
    await restoreProjectArchive(archive);
    return summarizeArchive(archive, "已恢复项目档案，刷新页面后生效。");
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

  async function restoreProjectArchive(archive) {
    validateArchive(archive);
    importLocalStorage(archive.storage || {});

    for (const item of DB_ITEMS) {
      await importDbStore(item, archive.indexedDb?.[item.id]);
    }
  }

  async function resolveArchive(fileOrArchive) {
    if (fileOrArchive && typeof fileOrArchive.text === "function") {
      const result = await prepareImportProject(fileOrArchive);
      return result.archive;
    }

    validateArchive(fileOrArchive);
    return fileOrArchive;
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

    validateArchive(archive);
    return archive;
  }

  async function createArchivePreview(archive) {
    validateArchive(archive);

    const storage = STORAGE_ITEMS.map((item) => compareStorageItem(item, archive.storage || {}));
    const indexedDb = [];

    for (const item of DB_ITEMS) {
      indexedDb.push(await compareDbItem(item, archive.indexedDb?.[item.id]));
    }

    return {
      exportedAt: archive.exportedAt || "",
      source: archive.source || "",
      storage,
      indexedDb,
      summary: summarizeImportPreview(storage, indexedDb)
    };
  }

  function compareStorageItem(item, storage) {
    const record = storage[item.key];
    const incomingValue = record?.value == null ? null : record.value;
    const currentValue = window.localStorage.getItem(item.key);

    if (incomingValue !== null && typeof incomingValue !== "string") {
      throw new Error(`项目档案中的 ${item.label} 数据格式不正确。`);
    }

    return {
      id: item.key,
      label: item.label,
      change: getStorageChange(currentValue, incomingValue),
      currentBytes: currentValue ? new Blob([currentValue]).size : 0,
      incomingBytes: incomingValue ? new Blob([incomingValue]).size : 0
    };
  }

  async function compareDbItem(item, pack) {
    const records = Array.isArray(pack?.records) ? pack.records : [];
    const currentRecords = await readDbStoreRecords(item);

    return {
      id: item.id,
      label: item.label,
      currentCount: currentRecords.length,
      incomingCount: records.length,
      change: currentRecords.length === records.length ? "same-count" : "replace"
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

    return {
      storageAdded: storageSummary.add || 0,
      storageUpdated: storageSummary.update || 0,
      storageRemoved: storageSummary.remove || 0,
      storageSame: storageSummary.same || 0,
      storageEmpty: storageSummary.empty || 0,
      dbReplaceCount,
      incomingModelCount
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

  function importLocalStorage(storage) {
    STORAGE_ITEMS.forEach((item) => {
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

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(item.storeName, "readwrite");
      const store = transaction.objectStore(item.storeName);
      store.clear();
      records.forEach((record) => {
        store.put(deserializeDbRecord(record));
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
    const arrayBuffer = copy.arrayBuffer;
    delete copy.arrayBuffer;
    return {
      data: copy,
      arrayBufferBase64: arrayBuffer ? await arrayBufferToBase64(arrayBuffer) : null
    };
  }

  function deserializeDbRecord(record) {
    const data = record && typeof record.data === "object" ? { ...record.data } : {};
    if (record?.arrayBufferBase64) {
      data.arrayBuffer = base64ToArrayBuffer(record.arrayBufferBase64);
    }
    return data;
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
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  }

  function validateArchive(archive) {
    if (!archive || archive.kind !== ARCHIVE_KIND) {
      throw new Error("这不是 MR 书法项目档案。");
    }
    if (Number(archive.version) !== ARCHIVE_VERSION) {
      throw new Error(`不支持的项目档案版本：${archive.version}`);
    }
  }

  function summarizeArchive(archive, prefix) {
    const storageCount = Object.values(archive.storage || {}).filter((record) => record?.value).length;
    const modelCount = Object.values(archive.indexedDb || {}).reduce((sum, pack) => {
      return sum + (Array.isArray(pack?.records) ? pack.records.length : 0);
    }, 0);
    return {
      ok: true,
      message: `${prefix} 已包含 ${storageCount} 组本机配置、${modelCount} 个导入模型。`,
      storageCount,
      modelCount
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
    return `${label} · 当前 ${item.currentCount} 个 → 档案 ${item.incomingCount} 个`;
  }

  function bindProjectArchiveControls() {
    const exportButton = document.getElementById("projectExportButton");
    const importFile = document.getElementById("projectImportFile");
    const status = document.getElementById("projectArchiveStatus");
    const previewBox = document.getElementById("projectImportPreview");
    const previewTitle = document.getElementById("projectImportPreviewTitle");
    const previewMeta = document.getElementById("projectImportPreviewMeta");
    const previewList = document.getElementById("projectImportPreviewList");
    const confirmButton = document.getElementById("projectImportConfirm");
    const cancelButton = document.getElementById("projectImportCancel");

    if (!exportButton && !importFile) return;

    let pendingArchive = null;

    const setStatus = (message, tone = "normal") => {
      if (!status) return;
      status.textContent = message;
      status.dataset.tone = tone;
    };

    const setBusy = (isBusy) => {
      if (exportButton) exportButton.disabled = isBusy;
      if (importFile) importFile.disabled = isBusy;
      if (confirmButton) confirmButton.disabled = isBusy || !pendingArchive;
      if (cancelButton) cancelButton.disabled = isBusy || !pendingArchive;
    };

    const clearPendingImport = () => {
      pendingArchive = null;
      if (previewBox) previewBox.hidden = true;
      if (previewList) previewList.innerHTML = "";
      if (previewTitle) previewTitle.textContent = "待导入档案";
      if (previewMeta) previewMeta.textContent = "尚未选择文件";
      if (confirmButton) confirmButton.disabled = true;
      if (cancelButton) cancelButton.disabled = true;
    };

    const appendPreviewLine = (fragment, label, detail, change) => {
      const item = document.createElement("li");
      item.dataset.change = change || "normal";

      const title = document.createElement("strong");
      title.textContent = label;

      const text = document.createElement("span");
      text.textContent = detail;

      item.append(title, text);
      fragment.appendChild(item);
    };

    const renderImportPreview = (preview) => {
      if (!previewBox || !previewList) return;

      previewBox.hidden = false;
      if (previewTitle) previewTitle.textContent = "待导入项目档案";
      if (previewMeta) {
        const summary = preview.summary;
        previewMeta.textContent = `${formatArchiveDate(preview.exportedAt)} · ${summary.storageAdded} 新增 / ${summary.storageUpdated} 覆盖 / ${summary.storageRemoved} 清空 / ${summary.incomingModelCount} 模型`;
      }

      const fragment = document.createDocumentFragment();
      preview.storage.forEach((item) => appendPreviewLine(fragment, item.label, describeStorageChange(item), item.change));
      preview.indexedDb.forEach((item) => appendPreviewLine(fragment, item.label, describeDbChange(item), item.change));

      previewList.innerHTML = "";
      previewList.appendChild(fragment);
      if (confirmButton) confirmButton.disabled = !pendingArchive;
      if (cancelButton) cancelButton.disabled = false;
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
          setStatus(`${result.message} 点击“确认恢复”后才会覆盖当前本机项目。`, "success");
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

      setBusy(true);
      setStatus("正在恢复项目档案，当前本机项目将被档案内容替换。", "loading");
      try {
        await restoreProjectArchive(pendingArchive);
        const result = summarizeArchive(pendingArchive, "已恢复项目档案，刷新页面后生效。");
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
  }

  window.MRProjectArchive = {
    kind: ARCHIVE_KIND,
    version: ARCHIVE_VERSION,
    exportProject,
    importProject,
    prepareImportProject,
    restoreProjectArchive,
    storageItems: STORAGE_ITEMS.map((item) => ({ ...item })),
    dbItems: DB_ITEMS.map((item) => ({ ...item }))
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindProjectArchiveControls, { once: true });
  } else {
    bindProjectArchiveControls();
  }
})();
