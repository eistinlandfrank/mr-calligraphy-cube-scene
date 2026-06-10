import * as THREE from "three";

export const MAX_IMPORT_MODEL_BYTES = 50 * 1024 * 1024;

const dbCache = new Map();

export function getImportFileType(fileName) {
  const match = String(fileName || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];
  return extension === "glb" || extension === "obj" ? extension : "";
}

export function stripModelExtension(fileName) {
  return String(fileName || "").replace(/\.(glb|obj)$/i, "");
}

export function normalizeImportLabel(value, fileName = null, fallback = "导入模型") {
  const sourceFileName = fileName === null ? value : fileName;
  const explicitLabel = fileName === null ? "" : value;
  const base = stripModelExtension(sourceFileName) || fallback;
  const label = String(explicitLabel || "").trim() || base;
  return label.slice(0, 48) || fallback;
}

export function normalizeImportMetrics(metrics = {}) {
  const source = metrics && typeof metrics === "object" ? metrics : {};
  const dimensions = source.dimensions && typeof source.dimensions === "object" ? source.dimensions : {};

  return {
    fileBytes: Math.max(0, Math.round(readFiniteNumber(source.fileBytes, 0))),
    meshCount: Math.max(0, Math.round(readFiniteNumber(source.meshCount, 0))),
    vertexCount: Math.max(0, Math.round(readFiniteNumber(source.vertexCount, 0))),
    dimensions: {
      width: readFiniteNumber(dimensions.width, 0),
      height: readFiniteNumber(dimensions.height, 0),
      depth: readFiniteNumber(dimensions.depth, 0)
    }
  };
}

export function validateImportFile(file, options = {}) {
  const type = options.type || getImportFileType(file?.name);
  const label = String(options.label || normalizeImportLabel(file?.name)).toLowerCase();
  const existingRecords = Array.isArray(options.existingRecords) ? options.existingRecords : [];
  const maxBytes = Number(options.maxBytes || MAX_IMPORT_MODEL_BYTES);

  if (!["glb", "obj"].includes(type)) {
    throw new Error("只支持 .glb 和 .obj 文件。");
  }
  if (!file?.size) {
    throw new Error("模型文件为空。");
  }
  if (file.size > maxBytes) {
    throw new Error(`模型文件不能超过 ${formatBytes(maxBytes)}。`);
  }

  const duplicate = existingRecords.find((record) => {
    return String(record.fileName || "").toLowerCase() === String(file.name || "").toLowerCase() ||
      String(record.label || "").toLowerCase() === label;
  });

  if (duplicate) {
    if (typeof options.duplicateMessage === "function") {
      throw new Error(options.duplicateMessage(duplicate));
    }
    throw new Error(`已存在导入模型“${duplicate.label || duplicate.fileName}”，请先改名或恢复已有模型。`);
  }
}

export function validateImportBuffer(type, arrayBuffer, fileName = "模型文件") {
  if (!arrayBuffer?.byteLength) {
    throw new Error("模型文件没有可读取内容。");
  }

  if (type === "glb") {
    if (arrayBuffer.byteLength < 12) {
      throw new Error("GLB 文件头不完整。");
    }
    const magic = new DataView(arrayBuffer).getUint32(0, true);
    if (magic !== 0x46546c67) {
      throw new Error(`${fileName} 不是有效的 GLB 文件。`);
    }
    return;
  }

  if (type === "obj") {
    const preview = new TextDecoder("utf-8").decode(arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 512 * 1024)));
    if (!/^\s*v\s+[-+0-9.]/m.test(preview)) {
      throw new Error(`${fileName} 没有可读取的 OBJ 顶点数据。`);
    }
    return;
  }

  throw new Error("只支持 .glb 和 .obj 文件。");
}

export function parseImportedModel(record, arrayBuffer, options = {}) {
  if (record.type === "obj") {
    if (!options.objLoader) {
      return Promise.reject(new Error("OBJLoader 尚未初始化。"));
    }
    const text = new TextDecoder("utf-8").decode(arrayBuffer);
    const object = options.objLoader.parse(text);
    if (options.objMaterial) {
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = options.objMaterial;
        }
      });
    }
    return Promise.resolve(object);
  }

  if (record.type === "glb") {
    if (!options.gltfLoader) {
      return Promise.reject(new Error("GLTFLoader 尚未初始化。"));
    }
    return new Promise((resolve, reject) => {
      options.gltfLoader.parse(arrayBuffer.slice(0), "", (gltf) => {
        const scene = gltf.scene || gltf.scenes?.[0] || null;
        if (!scene) {
          reject(new Error("GLB 文件没有可读取的场景。"));
          return;
        }
        resolve(scene);
      }, reject);
    });
  }

  return Promise.reject(new Error(`Unsupported model type: ${record.type}`));
}

export function measureImportedModel(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  let meshCount = 0;
  let vertexCount = 0;

  root.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    const count = Number(child.geometry?.attributes?.position?.count || 0);
    if (count > 0) {
      meshCount += 1;
      vertexCount += count;
    }
  });

  if (!box.isEmpty()) {
    box.getSize(size);
    box.getCenter(center);
  }

  return {
    box,
    center,
    minY: box.isEmpty() ? 0 : box.min.y,
    meshCount,
    vertexCount,
    width: size.x,
    height: size.y,
    depth: size.z,
    longestSide: Math.max(size.x, size.y, size.z)
  };
}

export function validateImportedModelMetrics(metrics) {
  if (!metrics.meshCount || !metrics.vertexCount || metrics.box.isEmpty()) {
    throw new Error("模型没有可读取的网格，请检查文件是否包含实体几何。");
  }

  if (!Number.isFinite(metrics.longestSide) || metrics.longestSide <= 0) {
    throw new Error("模型尺寸无效，无法自动摆放。");
  }
}

export function createImportMetrics(metrics, byteLength) {
  return {
    fileBytes: Number(byteLength || 0),
    meshCount: metrics.meshCount,
    vertexCount: metrics.vertexCount,
    dimensions: {
      width: Number(metrics.width.toFixed(4)),
      height: Number(metrics.height.toFixed(4)),
      depth: Number(metrics.depth.toFixed(4))
    }
  };
}

export function formatImportMetrics(metrics = {}) {
  const dimensions = metrics.dimensions
    ? `${formatMetricNumber(metrics.dimensions.width)}×${formatMetricNumber(metrics.dimensions.height)}×${formatMetricNumber(metrics.dimensions.depth)}`
    : "尺寸未知";

  return `${metrics.meshCount || 0} 个网格，${dimensions}，${formatBytes(metrics.fileBytes || 0)}`;
}

export function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }
  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${value} B`;
}

export function createModelStore(options = {}) {
  const dbName = options.dbName;
  const storeName = options.storeName;
  const keyPath = options.keyPath || "id";
  if (!dbName || !storeName) {
    throw new Error("模型仓库缺少 dbName 或 storeName。");
  }

  const getKey = typeof options.getKey === "function"
    ? options.getKey
    : (record) => record?.dbKey || record?.id;

  const open = () => openModelDb({ dbName, storeName, keyPath });

  return {
    open,
    async store(record, arrayBuffer) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const key = getKey(record);
        const entry = {
          id: record.id,
          dbKey: record.dbKey,
          label: record.label,
          fileName: record.fileName,
          type: record.type,
          metrics: record.metrics,
          arrayBuffer: arrayBuffer.slice(0)
        };
        entry[keyPath] = key;
        const request = store.put(entry);
        request.onerror = () => reject(request.error || new Error("Could not store imported model."));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error("Could not store imported model."));
      });
    },
    async read(record) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(getKey(record));
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error("Could not read imported model."));
      });
    },
    async delete(record) {
      const key = getKey(record);
      if (!key) {
        return;
      }
      const db = await open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onerror = () => reject(request.error || new Error("Could not delete imported model."));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error("Could not delete imported model."));
      });
    }
  };
}

function openModelDb({ dbName, storeName, keyPath }) {
  const cacheKey = `${dbName}:${storeName}:${keyPath}`;
  if (dbCache.has(cacheKey)) {
    return dbCache.get(cacheKey);
  }

  const promise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open model storage."));
  });

  dbCache.set(cacheKey, promise);
  return promise;
}

function formatMetricNumber(value) {
  return Number(value || 0).toFixed(2);
}

function readFiniteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
