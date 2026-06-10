import { create } from "zustand";
import { getDefaultSceneConfig, loadDefaultScenes } from "../data/configLoader.js";
import { cloneSceneConfig, createSceneObject, validateSceneConfig } from "../scene-core/sceneSchema.js";

export const SCENE_STORAGE_KEY = "moyin-xinjing-scene-configs";
export const SCENE_DB_NAME = "moyin-xinjing-scene-editor";
export const SCENE_DB_STORE = "sceneSnapshots";
export const SCENE_DB_SNAPSHOT_ID = "latest";
const SCENE_DB_VERSION = 1;
const baseSceneConfigs = loadDefaultScenes();
const baseSceneConfigById = Object.fromEntries(
  baseSceneConfigs.map((sceneConfig) => [sceneConfig.id, sceneConfig])
);

export const useSceneStore = create((set, get) => ({
  scenes: loadInitialScenes(),
  activeSceneId: baseSceneConfigs[0].id,
  selectedObjectId: baseSceneConfigs[0].objects[0]?.id ?? "",
  lastSavedAt: null,

  setActiveSceneId: (sceneId) => {
    const scene = get().scenes.find((item) => item.id === sceneId);

    if (!scene) {
      return;
    }

    set({
      activeSceneId: sceneId,
      selectedObjectId: scene.objects[0]?.id ?? ""
    });
  },

  setSelectedObjectId: (objectId) => set({ selectedObjectId: objectId }),

  updateObject: (sceneId, objectId, updater) => {
    set((state) => ({
      scenes: state.scenes.map((scene) => {
        if (scene.id !== sceneId) {
          return scene;
        }

        return {
          ...scene,
          objects: scene.objects.map((object) => {
            if (object.id !== objectId) {
              return object;
            }

            const patch = typeof updater === "function" ? updater(object) : updater;
            return mergeObjectPatch(object, patch);
          })
        };
      })
    }));
  },

  addObject: (sceneId, type = "box") => {
    const { scenes } = get();
    const scene = scenes.find((item) => item.id === sceneId);

    if (!scene) {
      return;
    }

    const id = makeUniqueObjectId(scene, type);
    const object = createSceneObject({
      id,
      type,
      name: getObjectTypeLabel(type),
      position: [0, 1.1, 0.85],
      scale: type === "plane" ? [1.2, 0.8, 1] : [1, 1, 1],
      material: {
        color: type === "sphere" ? "#d7aa72" : "#2f6f68",
        opacity: type === "plane" ? 0.82 : 1,
        emissiveColor: type === "plane" ? "#173c38" : "#000000"
      }
    });

    set((state) => ({
      scenes: state.scenes.map((item) => (
        item.id === sceneId
          ? { ...item, objects: [...item.objects, object] }
          : item
      )),
      selectedObjectId: id
    }));
  },

  duplicateObject: (sceneId, objectId) => {
    const scene = get().scenes.find((item) => item.id === sceneId);
    const source = scene?.objects.find((object) => object.id === objectId);

    if (!scene || !source) {
      return;
    }

    const id = makeUniqueObjectId(scene, `${source.id}-copy`);
    const copy = {
      ...cloneSceneConfig(source),
      id,
      name: `${source.name} 副本`,
      position: [
        source.position[0] + 0.24,
        source.position[1],
        source.position[2] + 0.24
      ]
    };

    set((state) => ({
      scenes: state.scenes.map((item) => (
        item.id === sceneId
          ? { ...item, objects: [...item.objects, copy] }
          : item
      )),
      selectedObjectId: id
    }));
  },

  deleteObject: (sceneId, objectId) => {
    set((state) => {
      const scene = state.scenes.find((item) => item.id === sceneId);
      const nextObjects = scene?.objects.filter((object) => object.id !== objectId) ?? [];

      return {
        scenes: state.scenes.map((item) => (
          item.id === sceneId
            ? { ...item, objects: nextObjects }
            : item
        )),
        selectedObjectId: nextObjects[0]?.id ?? ""
      };
    });
  },

  replaceScene: (sceneConfig) => {
    set((state) => ({
      scenes: state.scenes.map((scene) => (scene.id === sceneConfig.id ? cloneSceneConfig(sceneConfig) : scene))
    }));
  },

  importScene: (sceneConfig) => {
    const result = validateSceneConfig(sceneConfig);

    if (!result.valid) {
      return result;
    }

    const nextScene = cloneSceneConfig(sceneConfig);

    set((state) => {
      const exists = state.scenes.some((scene) => scene.id === nextScene.id);
      return {
        scenes: exists
          ? state.scenes.map((scene) => (scene.id === nextScene.id ? nextScene : scene))
          : [...state.scenes, nextScene],
        activeSceneId: nextScene.id,
        selectedObjectId: nextScene.objects[0]?.id ?? ""
      };
    });

    return result;
  },

  saveScenes: async () => {
    const scenes = get().scenes;
    const savedAt = new Date().toISOString();
    await persistScenes(scenes, savedAt);
    set({ lastSavedAt: savedAt });
  },

  hydrateScenesFromIndexedDb: async () => {
    const snapshot = await loadScenesFromIndexedDb();

    if (!snapshot?.scenes?.length) {
      return;
    }

    set({
      scenes: mergeStoredScenes(snapshot.scenes),
      lastSavedAt: snapshot.savedAt ?? null
    });
  },

  resetScene: (sceneId) => {
    const baseScene = getDefaultSceneConfig(sceneId);

    if (!baseScene) {
      return;
    }

    set((state) => ({
      scenes: state.scenes.map((scene) => (scene.id === sceneId ? cloneSceneConfig(baseScene) : scene)),
      selectedObjectId: baseScene.objects[0]?.id ?? ""
    }));
  },

  getActiveScene: () => {
    const { scenes, activeSceneId } = get();
    return scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
  }
}));

export function selectSceneConfigById(scenes, sceneId) {
  return scenes.find((scene) => scene.id === sceneId) ?? baseSceneConfigById[sceneId] ?? baseSceneConfigs[0];
}

function loadInitialScenes() {
  if (typeof window === "undefined") {
    return cloneSceneList(baseSceneConfigs);
  }

  try {
    const raw = window.localStorage.getItem(SCENE_STORAGE_KEY);

    if (!raw) {
      return cloneSceneList(baseSceneConfigs);
    }

    const stored = JSON.parse(raw);

    if (!Array.isArray(stored)) {
      return cloneSceneList(baseSceneConfigs);
    }

    return mergeStoredScenes(stored);
  } catch {
    return cloneSceneList(baseSceneConfigs);
  }
}

async function persistScenes(scenes, savedAt) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SCENE_STORAGE_KEY, JSON.stringify(scenes));

  try {
    await persistScenesToIndexedDb({ id: SCENE_DB_SNAPSHOT_ID, savedAt, scenes });
  } catch (error) {
    console.warn("保存 SceneConfig 到 IndexedDB 失败", error);
  }
}

function mergeStoredScenes(stored) {
  const storedById = Object.fromEntries(stored.map((scene) => [scene.id, scene]));
  const baseMerged = baseSceneConfigs.map((scene) => cloneSceneConfig(storedById[scene.id] ?? scene));
  const extraScenes = stored.filter((scene) => !baseSceneConfigById[scene.id]).map((scene) => cloneSceneConfig(scene));

  return [...baseMerged, ...extraScenes];
}

function loadScenesFromIndexedDb() {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const request = indexedDB.open(SCENE_DB_NAME, SCENE_DB_VERSION);

    request.onupgradeneeded = () => {
      createSceneSnapshotStore(request.result);
    };
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction(SCENE_DB_STORE, "readonly");
      const store = transaction.objectStore(SCENE_DB_STORE);
      const getRequest = store.get(SCENE_DB_SNAPSHOT_ID);

      getRequest.onerror = () => resolve(null);
      getRequest.onsuccess = () => resolve(getRequest.result ?? null);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => database.close();
    };
  });
}

function persistScenesToIndexedDb(snapshot) {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SCENE_DB_NAME, SCENE_DB_VERSION);

    request.onupgradeneeded = () => {
      createSceneSnapshotStore(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction(SCENE_DB_STORE, "readwrite");
      const store = transaction.objectStore(SCENE_DB_STORE);

      store.put(snapshot);
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
    };
  });
}

function createSceneSnapshotStore(database) {
  if (!database.objectStoreNames.contains(SCENE_DB_STORE)) {
    database.createObjectStore(SCENE_DB_STORE, { keyPath: "id" });
  }
}

function cloneSceneList(scenes) {
  return scenes.map((scene) => cloneSceneConfig(scene));
}

function mergeObjectPatch(object, patch) {
  return {
    ...object,
    ...patch,
    material: {
      ...object.material,
      ...patch.material
    }
  };
}

function makeUniqueObjectId(scene, baseId) {
  const normalized = String(baseId)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "object";
  const used = new Set(scene.objects.map((object) => object.id));
  let index = scene.objects.length + 1;
  let nextId = `${normalized}-${index}`;

  while (used.has(nextId)) {
    index += 1;
    nextId = `${normalized}-${index}`;
  }

  return nextId;
}

function getObjectTypeLabel(type) {
  return {
    box: "立方体对象",
    sphere: "球体对象",
    plane: "面板对象"
  }[type] ?? "新对象";
}
