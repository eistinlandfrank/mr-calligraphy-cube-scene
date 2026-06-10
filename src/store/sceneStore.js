import { create } from "zustand";
import { sceneConfigById as baseSceneConfigById, sceneConfigs as baseSceneConfigs } from "../data/scenes/index.js";
import { cloneSceneConfig } from "../scene-core/sceneSchema.js";

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

  replaceScene: (sceneConfig) => {
    set((state) => ({
      scenes: state.scenes.map((scene) => (scene.id === sceneConfig.id ? cloneSceneConfig(sceneConfig) : scene))
    }));
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
