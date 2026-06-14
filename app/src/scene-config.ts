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

export interface SceneStep {
  id: string;
  title: string;
  shortName: string;
  description: string;
  focus: string;
  hotspotId: string;
  actionLabel: string;
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
  steps: SceneStep[];
  activeStepIndex: number;
  updatedAt: string;
}

export const SCENE_CONFIG_STORAGE_KEY = "mr-calligraphy-scene-config-v2";

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  id: "calligraphy-space-001",
  name: "MR 书法交互空间",
  version: "2.1.0-legacy-layout",
  camera: {
    position: [0.2, 0.6, 6.6],
    target: [0, -0.35, -3.6],
    fov: 48
  },
  environment: {
    background: "#11100e",
    ambientLight: "#f8ead4"
  },
  objects: createDefaultSceneObjects(),
  hotspots: createDefaultHotspots(),
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
  steps: createDefaultSteps(),
  activeStepIndex: 0,
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
  if (source.version && source.version !== fallback.version) {
    return cloneSceneConfig(fallback);
  }

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
    steps: Array.isArray(source.steps) ? source.steps.map(normalizeStep) : [...fallback.steps],
    activeStepIndex: readInteger(source.activeStepIndex, 0, 0, fallback.steps.length - 1),
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

function normalizeStep(value: unknown): SceneStep {
  const source = isObject(value) ? value : {};
  const fallback = DEFAULT_SCENE_CONFIG.steps[0];
  return {
    id: readString(source.id, fallback.id),
    title: readString(source.title, fallback.title),
    shortName: readString(source.shortName, fallback.shortName),
    description: readString(source.description, fallback.description),
    focus: readString(source.focus, fallback.focus),
    hotspotId: readString(source.hotspotId, fallback.hotspotId),
    actionLabel: readString(source.actionLabel, fallback.actionLabel)
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

function createDefaultSceneObjects(): SceneObject[] {
  const wood = material("#75431f", 1, 0.58, 0.03);
  const darkWood = material("#5a2c12", 1, 0.6, 0.02);
  const paper = material("#e8dcc5", 1, 0.92, 0);
  const ink = material("#090807", 1, 0.86, 0);
  const brass = material("#d29c49", 1, 0.36, 0.5, "#2a1e0f");
  const red = material("#9f3524", 1, 0.48, 0);
  const green = material("#255b44", 1, 0.7, 0);
  const clay = material("#574433", 1, 0.76, 0);
  const scroll = material("#d2bd8c", 1, 0.78, 0);
  const screen = material("#151515", 1, 0.35, 0.08, "#211707");
  const glow = material("#ffddb1", 1, 0.28, 0.2, "#ffb86b");
  const roleCoach = material("#39b88f", 1, 0.5, 0.05, "#0e4f43");
  const roleLearner = material("#d94a3a", 1, 0.5, 0.05);
  const roleObserver = material("#4a8fd8", 1, 0.5, 0.05);

  return [
    createSceneObject("front-doorway", "正面门廊", "model", [0, -3.1, -7.92], [0, 0, 0], [1, 1, 1], wood),
    createSceneObject("black-display-screen", "黑色展示屏", "ui-panel", [0, -0.58, -7.78], [0, 0, 0], [3.2, 1.55, 0.08], screen),
    createSceneObject("left-window", "左侧窗户", "model", [-5.15, -1.75, -7.9], [0, 0, 0], [1, 1, 1], wood),
    createSceneObject("right-window", "右侧窗户", "model", [5.15, -1.75, -7.9], [0, 0, 0], [1, 1, 1], wood),
    createSceneObject("left-bookcase", "左侧书架", "model", [-7.25, -3.12, -4.4], [0, 90, 0], [1, 1, 1], wood),
    createSceneObject("right-bookcase", "右侧书架", "model", [7.25, -3.12, -3.05], [0, -90, 0], [1, 1, 1], wood),
    createSceneObject("main-writing-table", "主写字桌", "model", [0, -3.12, -3.45], [0, 0, 0], [1, 1, 1], wood),
    createSceneObject("left-chair", "左侧椅子", "model", [-3.25, -3.12, -2.4], [0, 24, 0], [1, 1, 1], wood),
    createSceneObject("right-chair", "右侧椅子", "model", [3.25, -3.12, -2.4], [0, -24, 0], [1, 1, 1], wood),
    createSceneObject("woven-rug", "地面织毯", "plane", [0, -3.08, -3.2], [-90, 0, 0], [4.15, 2.4, 1], material("#6a4d37", 1, 0.82, 0)),
    createSceneObject("side-cabinet", "右侧边柜", "model", [6.15, -3.12, 0.6], [0, -90, 0], [1, 1, 1], wood),
    createSceneObject("desk-books", "桌面书本", "model", [-1.4, -1.4, -3.0], [0, 12, 0], [1, 1, 1], material("#bd8f61", 1, 0.7, 0)),
    createSceneObject("front-left-potted-plant", "前左盆栽", "model", [-6.65, -3.12, -7.3], [0, 18, 0], [1, 1, 1], green),
    createSceneObject("right-corner-potted-plant", "右后盆栽", "model", [7.15, -3.12, 5.4], [0, -58, 0], [1, 1, 1], green),
    createSceneObject("desk-small-plant", "桌面小植物", "model", [1.74, -1.38, -3.74], [0, -24, 0], [0.56, 0.56, 0.56], green),
    createSceneObject("front-left-wall-lamp", "前左壁灯", "light", [-6.9, -0.25, -7.88], [0, 0, 0], [1, 1, 1], glow),
    createSceneObject("front-right-wall-lamp", "前右壁灯", "light", [6.9, -0.25, -7.88], [0, 0, 0], [1, 1, 1], glow),
    createSceneObject("side-table-lamp", "边桌台灯", "light", [6.1, -1.75, 0.64], [0, -90, 0], [1, 1, 1], glow),
    createSceneObject("left-coat-rack", "左侧衣帽架", "model", [-7.35, -3.12, 4.7], [0, 88, 0], [1, 1, 1], darkWood),
    createSceneObject("tea-corner-round-rug", "茶席圆毯", "plane", [4.75, -3.08, 5.1], [-90, -12, 0], [3.35, 3.35, 1], material("#6f4b35", 1, 0.82, 0)),
    createSceneObject("desktop-paper", "桌面宣纸", "plane", [0, -1.44, -3.42], [-90, 0, 0], [1.95, 1.32, 1], paper),
    createSceneObject("desktop-inkstone", "桌面砚台", "box", [-1.38, -1.38, -3.25], [0, 0, 0], [0.52, 0.14, 0.38], ink),
    createSceneObject("desktop-gold-brush", "桌面金色毛笔", "cylinder", [1.18, -1.36, -3.25], [0, 0, 88], [1, 1, 1], brass),
    createSceneObject("desktop-red-brush", "桌面红色毛笔", "cylinder", [1.02, -1.34, -3.62], [0, 0, 88], [0.92, 0.92, 0.92], red),
    createSceneObject("front-left-scroll", "前墙左卷轴", "model", [-4.85, 1.05, -7.74], [0, 0, 0], [0.52, 2.05, 1], scroll),
    createSceneObject("front-right-scroll", "前墙右卷轴", "model", [4.85, 1.05, -7.74], [0, 0, 0], [0.52, 2.05, 1], scroll),
    createSceneObject("back-left-scroll", "后墙左卷轴", "model", [-4.2, 0.84, 7.72], [0, 180, 0], [0.82, 1.86, 1], scroll),
    createSceneObject("back-right-scroll", "后墙右卷轴", "model", [4.2, 0.84, 7.72], [0, 180, 0], [0.82, 1.86, 1], scroll),
    createSceneObject("left-wall-scroll", "左墙卷轴", "model", [-7.72, 0.82, 2.45], [0, 90, 0], [0.78, 1.74, 1], scroll),
    createSceneObject("right-wall-scroll", "右墙卷轴", "model", [7.72, 0.82, 2.2], [0, -90, 0], [0.78, 1.74, 1], scroll),
    createSceneObject("brush-rack", "笔架", "model", [-2.72, -1.08, -3.05], [0, 0, 0], [1, 1, 1], darkWood),
    createSceneObject("ink-set", "墨具", "model", [-1.42, -1.28, -3.1], [0, 0, 0], [1, 1, 1], ink),
    createSceneObject("desktop-ceramic-jar", "桌面瓷罐", "model", [2.52, -1.18, -3.82], [0, 0, 0], [1, 1, 1], clay),
    createSceneObject("floor-ceramic-jar", "地面陶罐", "model", [-6.92, -2.38, 5.72], [0, 0, 0], [1, 1, 1], clay),
    createSceneObject("low-display-stand", "低展示架", "model", [-6.9, -2.72, 5.72], [0, 0, 0], [1, 1, 1], darkWood),
    createSceneObject("ceiling-beam-front", "前侧横梁", "box", [0, 5.02, -4.8], [0, 0, 0], [16, 0.18, 0.24], darkWood),
    createSceneObject("ceiling-beam-middle", "中部横梁", "box", [0, 5.02, -0.8], [0, 0, 0], [16, 0.18, 0.24], darkWood),
    createSceneObject("ceiling-beam-back", "后侧横梁", "box", [0, 5.02, 3.2], [0, 0, 0], [16, 0.18, 0.24], darkWood),
    createSceneObject("ai-coach", "AI 书法教练", "model", [-2.7, -3.02, -5.2], [0, -28, 0], [1.08, 1.08, 1.08], roleCoach),
    createSceneObject("learner", "练习者", "model", [2.65, -3.02, -3.25], [0, 34, 0], [0.96, 0.96, 0.96], roleLearner),
    createSceneObject("observer", "观摩同学", "model", [5.4, -3.02, -1.6], [0, 58, 0], [0.9, 0.9, 0.9], roleObserver)
  ];
}

function createDefaultHotspots(): SceneHotspot[] {
  return [
    createHotspot("hotspot-coach", "AI 书法教练", [-2.7, -1.55, -5.2], "进入系统 / 沉浸准备", "openPanel", "step-01"),
    createHotspot("hotspot-path", "学习路径", [-5.5, -0.55, -4.5], "选择碑帖 / 路径", "openPanel", "step-02"),
    createHotspot("hotspot-screen", "黑色展示屏", [0, -0.25, -7.35], "播放 AI 讲解", "playAnimation", "yong-stroke-animation"),
    createHotspot("hotspot-paper", "桌面宣纸", [0, -1.05, -3.42], "空间临摹 / 实时引导", "playAnimation", "yong-stroke-animation"),
    createHotspot("hotspot-ink", "砚台与笔架", [-1.55, -1.0, -3.15], "笔画拆解 / 细节学习", "openPanel", "step-05"),
    createHotspot("hotspot-creation", "创作台", [1.25, -1.08, -3.45], "创作实践 / 作品生成", "openPanel", "step-06"),
    createHotspot("hotspot-history", "右侧边柜", [6.15, -0.8, 0.6], "学习记录 / 成长轨迹", "openPanel", "step-07"),
    createHotspot("hotspot-share", "观摩同学", [5.4, -1.55, -1.6], "作品展示 / 分享", "openPanel", "step-08"),
    createHotspot("hotspot-plan", "茶席圆毯", [4.75, -2.45, 5.1], "学习计划 / 下一课", "openPanel", "step-09"),
    createHotspot("hotspot-complete", "后墙卷轴", [0, 1.25, 7.55], "总结复盘 / 完成", "openPanel", "step-10")
  ];
}

function createDefaultSteps(): SceneStep[] {
  return [
    createStep("step-01", "进入系统 / 沉浸准备", "准备", "确认学习路径、当前任务和空间状态，进入 MR 书法教室。", "主空间先建立沉浸感：教练、书桌、展示屏和学习路径同时可见。", "hotspot-coach", "查看空间状态"),
    createStep("step-02", "选择碑帖 / 学习路径", "碑帖", "选择今日单字、碑帖来源和练习目标。", "沿用旧版第二步的任务选择逻辑，但把入口放进 3D 书法空间。", "hotspot-path", "选择永字八法"),
    createStep("step-03", "AI 讲解 / 永字八法", "讲解", "在展示屏观看 AI 讲解，理解点、横、竖、钩、撇、捺。", "展示屏是讲解核心，热点会触发笔画动画。", "hotspot-screen", "播放讲解动画"),
    createStep("step-04", "空间临摹 / 实时引导", "临摹", "在宣纸位置进行临摹训练，观察笔画顺序和实时反馈。", "把旧版临摹工作台变成桌面空间动作。", "hotspot-paper", "开始空间临摹"),
    createStep("step-05", "笔画拆解 / 细节学习", "拆解", "选择单个笔画，查看起笔、行笔、收笔和结构作用。", "砚台和笔架对应细节学习区。", "hotspot-ink", "查看笔画细节"),
    createStep("step-06", "创作实践 / 作品生成", "创作", "切换创作工具、风格和落款，生成个人作品。", "创作动作集中在主桌右侧，和旧版第六步衔接。", "hotspot-creation", "生成创作预览"),
    createStep("step-07", "学习记录 / 成长轨迹", "记录", "查看最近练习、评分变化和作品记录。", "右侧边柜作为本机档案区，承接旧版历史记录逻辑。", "hotspot-history", "打开成长轨迹"),
    createStep("step-08", "作品展示 / 空间分享", "分享", "把作品投放到空间屏幕，供观摩同学观看。", "观摩角色和展示屏形成 VR 展示感。", "hotspot-share", "投放作品"),
    createStep("step-09", "学习计划 / 下一课", "计划", "生成下一次练习安排、目标和复习提醒。", "茶席区作为安静计划区，替代旧版普通表单。", "hotspot-plan", "生成下一课计划"),
    createStep("step-10", "总结复盘 / 完成", "复盘", "汇总本次练习、作品、分享与下一课计划。", "后墙卷轴作为结束场景，形成空间化复盘。", "hotspot-complete", "完成本轮学习")
  ];
}

function createHotspot(
  id: string,
  name: string,
  position: Vector3,
  label: string,
  type: SceneHotspot["action"]["type"],
  target: string
): SceneHotspot {
  return {
    id,
    name,
    position,
    label,
    action: { type, target }
  };
}

function createStep(
  id: string,
  title: string,
  shortName: string,
  description: string,
  focus: string,
  hotspotId: string,
  actionLabel: string
): SceneStep {
  return { id, title, shortName, description, focus, hotspotId, actionLabel };
}

function material(color: string, opacity: number, roughness: number, metalness: number, emissive = ""): SceneMaterial {
  return { color, opacity, roughness, metalness, emissive };
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

function readInteger(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(value)));
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
