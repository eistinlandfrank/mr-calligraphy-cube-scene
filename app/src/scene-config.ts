import { useSyncExternalStore } from "react";

export type Vector3 = [number, number, number];

export interface SceneMaterial {
  color: string;
  opacity: number;
  roughness: number;
  metalness: number;
  emissive?: string;
}

export interface SceneObject {
  id: string;
  name: string;
  type: "box" | "sphere" | "plane" | "cylinder" | "model" | "light" | "ui-panel" | "hotspot";
  visible: boolean;
  locked: boolean;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  material: SceneMaterial;
}

export interface SceneHotspot {
  id: string;
  name: string;
  position: Vector3;
  label: string;
  action: {
    type: "playAnimation" | "focusObject" | "openPanel";
    target: string;
  };
}

export interface AnimationConfig {
  id: string;
  name: string;
  type: "strokePath";
  character: string;
  loop: boolean;
  duration: number;
  strokes: Vector3[][];
}

export interface SceneConfig {
  id: string;
  name: string;
  version: string;
  camera: {
    position: Vector3;
    target: Vector3;
    fov: number;
  };
  environment: {
    background: string;
    ambientLight: string;
  };
  objects: SceneObject[];
  hotspots: SceneHotspot[];
  animations: AnimationConfig[];
  updatedAt: string;
}

export const SCENE_CONFIG_STORAGE_KEY = "mr-calligraphy-scene-config-v2";

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  id: "calligraphy-space-001",
  name: "MR 书法交互空间",
  version: "1.0.0",
  camera: {
    position: [0, 1.5, 5],
    target: [0, 1, 0],
    fov: 50
  },
  environment: {
    background: "#f4efe7",
    ambientLight: "#ffffff"
  },
  objects: [
    createSceneObject("screen-001", "黑色展示屏", "ui-panel", [0, 1.6, -2.6], [0, 0, 0], [2.4, 1.2, 0.06], {
      color: "#151515",
      opacity: 1,
      roughness: 0.35,
      metalness: 0.08,
      emissive: "#2a2112"
    }),
    createSceneObject("desk-001", "书写平台", "box", [0, 0.65, 0], [0, 0, 0], [2.4, 0.12, 1.1], {
      color: "#8b5a36",
      opacity: 1,
      roughness: 0.62,
      metalness: 0
    }),
    createSceneObject("paper-001", "宣纸", "plane", [0, 0.74, 0.05], [-90, 0, 0], [1.2, 0.8, 1], {
      color: "#fff8e7",
      opacity: 1,
      roughness: 0.9,
      metalness: 0
    }),
    createSceneObject("brush-001", "毛笔", "cylinder", [-0.46, 0.86, 0.08], [0, 0, -28], [0.05, 0.05, 0.8], {
      color: "#4b2c1c",
      opacity: 1,
      roughness: 0.7,
      metalness: 0
    }),
    createSceneObject("chair-001", "棕色座椅", "model", [0, 0, 1.45], [0, 180, 0], [1, 1, 1], {
      color: "#9b6338",
      opacity: 1,
      roughness: 0.6,
      metalness: 0
    }),
    createSceneObject("key-light-001", "主灯光", "light", [-1.8, 2.4, 1.2], [0, 0, 0], [1, 1, 1], {
      color: "#fff1d6",
      opacity: 1,
      roughness: 0,
      metalness: 0,
      emissive: "#fff1d6"
    })
  ],
  hotspots: [
    {
      id: "screen-hotspot",
      name: "展示屏热点",
      position: [0, 1.45, -2.45],
      label: "播放永字笔画",
      action: {
        type: "playAnimation",
        target: "yong-stroke-animation"
      }
    }
  ],
  animations: [
    {
      id: "yong-stroke-animation",
      name: "永字笔画动画",
      type: "strokePath",
      character: "永",
      loop: false,
      duration: 6000,
      strokes: [
        [[0, 0.8, 0], [0.08, 0.56, 0]],
        [[-0.3, 0.42, 0], [0.35, 0.42, 0]],
        [[0, 0.56, 0], [0, -0.34, 0]]
      ]
    }
  ],
  updatedAt: new Date("2026-06-14T00:00:00.000Z").toISOString()
};

const listeners = new Set<() => void>();
let currentSceneConfig = loadSceneConfig();

export function useSceneConfig(): SceneConfig {
  return useSyncExternalStore(subscribeSceneConfig, getSceneConfig, getSceneConfig);
}

export function getSceneConfig(): SceneConfig {
  return currentSceneConfig;
}

export function updateSceneConfig(updater: (config: SceneConfig) => SceneConfig): void {
  currentSceneConfig = normalizeSceneConfig(updater(cloneSceneConfig(currentSceneConfig)));
  saveSceneConfig(currentSceneConfig);
  emitSceneConfigChange();
}

export function resetSceneConfig(): void {
  currentSceneConfig = cloneSceneConfig(DEFAULT_SCENE_CONFIG);
  saveSceneConfig(currentSceneConfig);
  emitSceneConfigChange();
}

function subscribeSceneConfig(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitSceneConfigChange(): void {
  listeners.forEach((listener) => listener());
}

function loadSceneConfig(): SceneConfig {
  if (typeof window === "undefined") {
    return cloneSceneConfig(DEFAULT_SCENE_CONFIG);
  }

  try {
    const raw = window.localStorage.getItem(SCENE_CONFIG_STORAGE_KEY);
    if (!raw) {
      return cloneSceneConfig(DEFAULT_SCENE_CONFIG);
    }
    return normalizeSceneConfig(JSON.parse(raw));
  } catch {
    return cloneSceneConfig(DEFAULT_SCENE_CONFIG);
  }
}

function saveSceneConfig(config: SceneConfig): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SCENE_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

function normalizeSceneConfig(value: unknown): SceneConfig {
  const source = isObject(value) ? value : {};
  const fallback = DEFAULT_SCENE_CONFIG;

  return {
    id: readString(source.id, fallback.id),
    name: readString(source.name, fallback.name),
    version: readString(source.version, fallback.version),
    camera: {
      position: readVector3(source.camera?.position, fallback.camera.position),
      target: readVector3(source.camera?.target, fallback.camera.target),
      fov: readNumber(source.camera?.fov, fallback.camera.fov)
    },
    environment: {
      background: readString(source.environment?.background, fallback.environment.background),
      ambientLight: readString(source.environment?.ambientLight, fallback.environment.ambientLight)
    },
    objects: Array.isArray(source.objects)
      ? source.objects.map((item, index) => normalizeSceneObject(item, fallback.objects[index] ?? fallback.objects[0]))
      : fallback.objects.map(cloneSceneObject),
    hotspots: Array.isArray(source.hotspots) ? source.hotspots.map(normalizeHotspot) : [...fallback.hotspots],
    animations: Array.isArray(source.animations) ? source.animations.map(normalizeAnimation) : [...fallback.animations],
    updatedAt: readString(source.updatedAt, fallback.updatedAt)
  };
}

function normalizeSceneObject(value: unknown, fallback: SceneObject): SceneObject {
  const source = isObject(value) ? value : {};
  return {
    id: readString(source.id, fallback.id),
    name: readString(source.name, fallback.name),
    type: readSceneObjectType(source.type, fallback.type),
    visible: readBoolean(source.visible, fallback.visible),
    locked: readBoolean(source.locked, fallback.locked),
    position: readVector3(source.position, fallback.position),
    rotation: readVector3(source.rotation, fallback.rotation),
    scale: readVector3(source.scale, fallback.scale),
    material: {
      color: readString(source.material?.color, fallback.material.color),
      opacity: readNumber(source.material?.opacity, fallback.material.opacity),
      roughness: readNumber(source.material?.roughness, fallback.material.roughness),
      metalness: readNumber(source.material?.metalness, fallback.material.metalness),
      emissive: readString(source.material?.emissive, fallback.material.emissive ?? "")
    }
  };
}

function normalizeHotspot(value: unknown): SceneHotspot {
  const source = isObject(value) ? value : {};
  const fallback = DEFAULT_SCENE_CONFIG.hotspots[0];
  return {
    id: readString(source.id, fallback.id),
    name: readString(source.name, fallback.name),
    position: readVector3(source.position, fallback.position),
    label: readString(source.label, fallback.label),
    action: {
      type: readHotspotActionType(source.action?.type, fallback.action.type),
      target: readString(source.action?.target, fallback.action.target)
    }
  };
}

function normalizeAnimation(value: unknown): AnimationConfig {
  const source = isObject(value) ? value : {};
  const fallback = DEFAULT_SCENE_CONFIG.animations[0];
  return {
    id: readString(source.id, fallback.id),
    name: readString(source.name, fallback.name),
    type: "strokePath",
    character: readString(source.character, fallback.character),
    loop: readBoolean(source.loop, fallback.loop),
    duration: readNumber(source.duration, fallback.duration),
    strokes: fallback.strokes
  };
}

function createSceneObject(
  id: string,
  name: string,
  type: SceneObject["type"],
  position: Vector3,
  rotation: Vector3,
  scale: Vector3,
  material: SceneMaterial
): SceneObject {
  return {
    id,
    name,
    type,
    visible: true,
    locked: false,
    position,
    rotation,
    scale,
    material
  };
}

function cloneSceneConfig(config: SceneConfig): SceneConfig {
  return JSON.parse(JSON.stringify(config)) as SceneConfig;
}

function cloneSceneObject(object: SceneObject): SceneObject {
  return JSON.parse(JSON.stringify(object)) as SceneObject;
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readVector3(value: unknown, fallback: Vector3): Vector3 {
  if (!Array.isArray(value) || value.length !== 3) {
    return [...fallback] as Vector3;
  }
  const next = value.map((item, index) => readNumber(item, fallback[index])) as Vector3;
  return next;
}

function readSceneObjectType(value: unknown, fallback: SceneObject["type"]): SceneObject["type"] {
  const allowed: SceneObject["type"][] = ["box", "sphere", "plane", "cylinder", "model", "light", "ui-panel", "hotspot"];
  return allowed.includes(value as SceneObject["type"]) ? (value as SceneObject["type"]) : fallback;
}

function readHotspotActionType(value: unknown, fallback: SceneHotspot["action"]["type"]): SceneHotspot["action"]["type"] {
  const allowed: SceneHotspot["action"]["type"][] = ["playAnimation", "focusObject", "openPanel"];
  return allowed.includes(value as SceneHotspot["action"]["type"]) ? (value as SceneHotspot["action"]["type"]) : fallback;
}
