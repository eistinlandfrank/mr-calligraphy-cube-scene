import { create } from "zustand";
import { sceneConfigById as baseSceneConfigById, sceneConfigs as baseSceneConfigs } from "../data/scenes/index.js";
import { cloneSceneConfig, createSceneObject, validateSceneConfig } from "../scene-core/sceneSchema.js";

export const SCENE_STORAGE_KEY = "moyin-xinjing-scene-configs";

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

  saveScenes: () => {
    const scenes = get().scenes;
    persistScenes(scenes);
    set({ lastSavedAt: new Date().toISOString() });
  },

  resetScene: (sceneId) => {
    const baseScene = baseSceneConfigById[sceneId];

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

    const storedById = Object.fromEntries(stored.map((scene) => [scene.id, scene]));

    return baseSceneConfigs.map((scene) => cloneSceneConfig(storedById[scene.id] ?? scene));
  } catch {
    return cloneSceneList(baseSceneConfigs);
  }
}

function persistScenes(scenes) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SCENE_STORAGE_KEY, JSON.stringify(scenes));
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
