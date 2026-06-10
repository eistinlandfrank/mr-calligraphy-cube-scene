import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const canvas = document.getElementById("mainAdminCanvas");
const objectSelect = document.getElementById("mainObjectSelect");
const objectType = document.getElementById("mainObjectType");
const objectStatus = document.getElementById("mainObjectStatus");
const xInput = document.getElementById("mainObjectX");
const yInput = document.getElementById("mainObjectY");
const zInput = document.getElementById("mainObjectZ");
const rotXInput = document.getElementById("mainObjectRotX");
const rotYInput = document.getElementById("mainObjectRotY");
const rotZInput = document.getElementById("mainObjectRotZ");
const scaleInput = document.getElementById("mainObjectScale");
const translateButton = document.getElementById("mainTranslateMode");
const rotateButton = document.getElementById("mainRotateMode");
const focusButton = document.getElementById("mainFocusObject");
const undoButton = document.getElementById("mainObjectUndo");
const resetButton = document.getElementById("mainObjectReset");
const deleteButton = document.getElementById("mainObjectDelete");
const restoreButton = document.getElementById("mainObjectRestore");
const saveButton = document.getElementById("mainObjectSave");
const resetAllButton = document.getElementById("mainObjectResetAll");
const newObjectNameInput = document.getElementById("mainNewObjectName");
const newObjectTypeSelect = document.getElementById("mainNewObjectType");
const newObjectColorInput = document.getElementById("mainNewObjectColor");
const newObjectWidthInput = document.getElementById("mainNewObjectWidth");
const newObjectHeightInput = document.getElementById("mainNewObjectHeight");
const newObjectDepthInput = document.getElementById("mainNewObjectDepth");
const newObjectRadiusInput = document.getElementById("mainNewObjectRadius");
const newObjectAddButton = document.getElementById("mainNewObjectAdd");
const newObjectUpdateButton = document.getElementById("mainNewObjectUpdate");
const customStatus = document.getElementById("mainCustomStatus");
const importModelNameInput = document.getElementById("mainImportModelName");
const importModelInput = document.getElementById("mainImportModel");
const importStatus = document.getElementById("mainImportStatus");
const ambientLightInput = document.getElementById("mainAmbientLight");
const envLightInput = document.getElementById("mainEnvLight");
const keyLightInput = document.getElementById("mainKeyLight");
const rimLightInput = document.getElementById("mainRimLight");
const exposureInput = document.getElementById("mainExposure");
const ambientLightValue = document.getElementById("mainAmbientLightValue");
const envLightValue = document.getElementById("mainEnvLightValue");
const keyLightValue = document.getElementById("mainKeyLightValue");
const rimLightValue = document.getElementById("mainRimLightValue");
const exposureValue = document.getElementById("mainExposureValue");
const lightResetButton = document.getElementById("mainLightReset");
const noticeState = document.getElementById("noticeState");
const layerSearchInput = document.getElementById("mainLayerSearch");
const layerSelectVisibleInput = document.getElementById("mainLayerSelectVisible");
const layerSelectionStatus = document.getElementById("mainLayerSelectionStatus");
const layerBatchHideButton = document.getElementById("mainLayerBatchHide");
const layerBatchShowButton = document.getElementById("mainLayerBatchShow");
const layerBatchLockButton = document.getElementById("mainLayerBatchLock");
const layerBatchUnlockButton = document.getElementById("mainLayerBatchUnlock");
const layerBatchClearButton = document.getElementById("mainLayerBatchClear");
const layerSummary = document.getElementById("mainLayerSummary");
const layerList = document.getElementById("mainLayerList");
const snapshotCreateButton = document.getElementById("mainSnapshotCreate");
const snapshotRefreshButton = document.getElementById("mainSnapshotRefresh");
const historyStatus = document.getElementById("mainHistoryStatus");
const snapshotList = document.getElementById("mainSnapshotList");
const previewDraftButton = document.getElementById("mainPreviewDraft");
const openLiveButton = document.getElementById("mainOpenLive");
const publishLayoutButton = document.getElementById("mainPublishLayout");
const publishStatus = document.getElementById("mainPublishStatus");

const STORAGE_KEY = "mr-calligraphy-main-scene-layout-v1";
const HISTORY_KEY = "mr-calligraphy-main-scene-history-v1";
const PUBLISHED_KEY = "mr-calligraphy-main-scene-published-v1";
const IMPORT_DB_NAME = "mr-calligraphy-main-model-store";
const IMPORT_DB_STORE = "models";
const MAX_IMPORT_MODEL_BYTES = 50 * 1024 * 1024;
const MAX_UNDO_STEPS = 256;
const MAX_HISTORY_SNAPSHOTS = 10;
const DEFAULT_LIGHTING = {
  ambient: 0.55,
  environment: 0.55,
  key: 320,
  rim: 0.45,
  exposure: 0.82
};
const CUSTOM_TYPE_LABELS = {
  box: "方块",
  cylinder: "圆柱",
  plane: "薄板"
};
const CUSTOM_TYPE_SIZES = {
  box: { width: 0.8, height: 0.8, depth: 0.8 },
  cylinder: { radius: 0.38, height: 0.9 },
  plane: { width: 1.4, height: 0.08, depth: 0.9 }
};

const MODEL_SPECS = [
  { id: "front-doorway", label: "正面门廊", src: "assets/models/poly-pizza-cc0/japanese-door-quaternius.glb", position: [0, -3.1, -7.92], rotation: [0, 0, 0], scale: 118, tint: [0.62, 0.38, 0.2] },
  { id: "left-window", label: "左侧窗户", src: "assets/models/kenney-furniture-kit/wallWindow.glb", position: [-5.15, -1.75, -7.9], rotation: [0, 0, 0], scale: 2.45, tint: [0.62, 0.42, 0.26] },
  { id: "right-window", label: "右侧窗户", src: "assets/models/kenney-furniture-kit/wallWindow.glb", position: [5.15, -1.75, -7.9], rotation: [0, 0, 0], scale: 2.45, tint: [0.62, 0.42, 0.26] },
  { id: "left-bookcase", label: "左侧书架", src: "assets/models/poly-pizza-cc0/bookshelf-creative-trio.glb", position: [-7.25, -3.12, -4.4], rotation: [0, 90, 0], scale: 380, tint: [0.58, 0.36, 0.2] },
  { id: "right-bookcase", label: "右侧书架", src: "assets/models/poly-pizza-cc0/bookshelf-creative-trio.glb", position: [7.25, -3.12, -3.05], rotation: [0, -90, 0], scale: 380, tint: [0.56, 0.34, 0.19] },
  { id: "main-writing-table", label: "主写字桌", src: "assets/models/poly-pizza-cc0/table-creative-trio.glb", position: [0, -3.12, -3.45], rotation: [0, 0, 0], scale: 410, tint: [0.58, 0.35, 0.18] },
  { id: "left-chair", label: "左侧椅子", src: "assets/models/kenney-furniture-kit/chair.glb", position: [-3.25, -3.12, -2.4], rotation: [0, 24, 0], scale: 3.3, tint: [0.48, 0.28, 0.15] },
  { id: "right-chair", label: "右侧椅子", src: "assets/models/kenney-furniture-kit/chair.glb", position: [3.25, -3.12, -2.4], rotation: [0, -24, 0], scale: 3.3, tint: [0.48, 0.28, 0.15] },
  { id: "woven-rug", label: "地面织毯", src: "assets/models/kenney-furniture-kit/rugRectangle.glb", position: [0, -3.09, -3.2], rotation: [0, 0, 0], scale: 4.15, tint: [0.46, 0.34, 0.24] },
  { id: "side-cabinet", label: "右侧边柜", src: "assets/models/kenney-furniture-kit/sideTableDrawers.glb", position: [6.15, -3.12, 0.6], rotation: [0, -90, 0], scale: 3.15, tint: [0.52, 0.31, 0.17] },
  { id: "desk-books", label: "桌面书本", src: "assets/models/kenney-furniture-kit/books.glb", position: [-1.4, -1.4, -3.0], rotation: [0, 12, 0], scale: 4.1, tint: [0.74, 0.56, 0.38] },
  { id: "front-left-potted-plant", label: "前左盆栽", src: "assets/models/poly-pizza-kenney-decor/potted-plant-kenney.glb", position: [-6.65, -3.12, -7.3], rotation: [0, 18, 0], scale: 2.6, tint: [0.88, 1.05, 0.82] },
  { id: "right-corner-potted-plant", label: "右后盆栽", src: "assets/models/poly-pizza-kenney-decor/potted-plant-kenney.glb", position: [7.15, -3.12, 5.4], rotation: [0, -58, 0], scale: 2.35, tint: [0.84, 1.02, 0.78] },
  { id: "desk-small-plant", label: "桌面小植物", src: "assets/models/poly-pizza-kenney-decor/plant-small-kenney.glb", position: [1.74, -1.38, -3.74], rotation: [0, -24, 0], scale: 1.36, tint: [0.78, 1.1, 0.7] },
  { id: "front-left-wall-lamp", label: "前左壁灯", src: "assets/models/poly-pizza-kenney-decor/lamp-wall-kenney.glb", position: [-6.9, -0.25, -7.88], rotation: [0, 0, 0], scale: 2.1, tint: [1.08, 0.84, 0.54] },
  { id: "front-right-wall-lamp", label: "前右壁灯", src: "assets/models/poly-pizza-kenney-decor/lamp-wall-kenney.glb", position: [6.9, -0.25, -7.88], rotation: [0, 0, 0], scale: 2.1, tint: [1.08, 0.84, 0.54] },
  { id: "side-table-lamp", label: "边桌台灯", src: "assets/models/poly-pizza-kenney-decor/lamp-square-table-kenney.glb", position: [6.1, -1.75, 0.64], rotation: [0, -90, 0], scale: 2.45, tint: [1.0, 0.82, 0.58] },
  { id: "left-coat-rack", label: "左侧衣帽架", src: "assets/models/poly-pizza-kenney-decor/coat-rack-standing-kenney.glb", position: [-7.35, -3.12, 4.7], rotation: [0, 88, 0], scale: 2.4, tint: [0.58, 0.36, 0.2] },
  { id: "tea-corner-round-rug", label: "茶席圆毯", src: "assets/models/poly-pizza-kenney-decor/rug-round-kenney.glb", position: [4.75, -3.08, 5.1], rotation: [0, -12, 0], scale: 3.35, tint: [0.52, 0.34, 0.24] }
];

const DECOR_SPECS = [
  { id: "desktop-paper", label: "桌面宣纸", position: [0, -1.44, -3.42], scale: 1, create: () => createBoxObject(1.95, 0.04, 1.32, materials.paper) },
  { id: "desktop-inkstone", label: "桌面砚台", position: [-1.38, -1.38, -3.25], scale: 1, create: () => createBoxObject(0.52, 0.14, 0.38, materials.ink) },
  { id: "desktop-gold-brush", label: "桌面金色毛笔", position: [1.18, -1.36, -3.25], scale: 1, create: () => createBoxObject(1.12, 0.055, 0.07, materials.brass) },
  { id: "desktop-red-brush", label: "桌面红色毛笔", position: [1.02, -1.34, -3.62], scale: 1, create: () => createBoxObject(1, 0.05, 0.065, materials.red) },
  { id: "front-left-scroll", label: "前墙左卷轴", position: [-4.85, 1.05, -7.74], scale: 1, create: () => createWallScroll(0.52, 2.05) },
  { id: "front-right-scroll", label: "前墙右卷轴", position: [4.85, 1.05, -7.74], scale: 1, create: () => createWallScroll(0.52, 2.05) },
  { id: "back-left-scroll", label: "后墙左卷轴", position: [-4.2, 0.84, 7.72], rotation: [0, 180, 0], scale: 1, create: () => createWallScroll(0.82, 1.86) },
  { id: "back-right-scroll", label: "后墙右卷轴", position: [4.2, 0.84, 7.72], rotation: [0, 180, 0], scale: 1, create: () => createWallScroll(0.82, 1.86) },
  { id: "left-wall-scroll", label: "左墙卷轴", position: [-7.72, 0.82, 2.45], rotation: [0, 90, 0], scale: 1, create: () => createWallScroll(0.78, 1.74) },
  { id: "right-wall-scroll", label: "右墙卷轴", position: [7.72, 0.82, 2.2], rotation: [0, -90, 0], scale: 1, create: () => createWallScroll(0.78, 1.74) },
  { id: "brush-rack", label: "笔架", position: [-2.72, -1.08, -3.05], scale: 1, create: createBrushRack },
  { id: "ink-set", label: "墨具", position: [-1.42, -1.28, -3.1], scale: 1, create: createInkSet },
  { id: "desktop-ceramic-jar", label: "桌面瓷罐", position: [2.52, -1.18, -3.82], scale: 1, create: () => createJar(0.28) },
  { id: "floor-ceramic-jar", label: "地面陶罐", position: [-6.92, -2.38, 5.72], scale: 1, create: () => createJar(0.34) },
  { id: "low-display-stand", label: "低展示架", position: [-6.9, -2.72, 5.72], scale: 1, create: createLowStand },
  { id: "ceiling-beam-front", label: "前侧横梁", position: [0, 5.02, -4.8], scale: 1, create: () => createBoxObject(16, 0.18, 0.24, materials.darkWood) },
  { id: "ceiling-beam-middle", label: "中部横梁", position: [0, 5.02, -0.8], scale: 1, create: () => createBoxObject(16, 0.18, 0.24, materials.darkWood) },
  { id: "ceiling-beam-back", label: "后侧横梁", position: [0, 5.02, 3.2], scale: 1, create: () => createBoxObject(16, 0.18, 0.24, materials.darkWood) }
];

const layout = loadLayout();
let layoutHistory = loadLayoutHistory();
let lighting = normalizeLighting(layout.lighting);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11100e);
scene.fog = new THREE.Fog(0x11100e, 13, 28);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.2, 0.6, 6.6);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = lighting.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 1.2;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.72;
controls.target.set(0, -0.35, -3.6);

const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.setMode("translate");
transformControls.setSpace("world");
transformControls.setSize(0.82);
scene.add(transformControls);

const loader = new GLTFLoader();
const objLoader = new OBJLoader();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const objects = new Map();
const selectableMeshes = [];
const undoStack = [];
const lightRig = {};
const selectedLayerIds = new Set();
let importDbPromise = null;
let selectedEntry = null;
let dragStart = null;
let draggedLayerId = null;
let inputStart = null;

const materials = createMaterials();

buildLights();
buildRoom();
buildObjects();
bindUi();
animate();

function createMaterials() {
  return {
    paper: new THREE.MeshStandardMaterial({ color: 0xe8dcc5, roughness: 0.92 }),
    ink: new THREE.MeshStandardMaterial({ color: 0x090807, roughness: 0.86 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd29c49, roughness: 0.36, metalness: 0.5 }),
    red: new THREE.MeshStandardMaterial({ color: 0x9f3524, roughness: 0.48 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x75431f, roughness: 0.58 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x5a2c12, roughness: 0.6 }),
    scroll: new THREE.MeshStandardMaterial({ color: 0xd2bd8c, roughness: 0.78 }),
    green: new THREE.MeshStandardMaterial({ color: 0x255b44, roughness: 0.7 }),
    clay: new THREE.MeshStandardMaterial({ color: 0x574433, roughness: 0.76 })
  };
}

function buildLights() {
  lightRig.ambient = new THREE.HemisphereLight(0xf8ead4, 0x1e130d, lighting.ambient);
  scene.add(lightRig.ambient);

  lightRig.key = new THREE.SpotLight(0xffe7bd, lighting.key, 24, Math.PI * 0.32, 0.5, 1.2);
  lightRig.key.position.set(-3.5, 5.4, 2.2);
  lightRig.key.target.position.set(0, -1.3, -3.5);
  lightRig.key.castShadow = true;
  lightRig.key.shadow.mapSize.set(2048, 2048);
  scene.add(lightRig.key, lightRig.key.target);

  lightRig.rim = new THREE.DirectionalLight(0x9bd5ff, lighting.rim);
  lightRig.rim.position.set(4.8, 3.5, 5.4);
  scene.add(lightRig.rim);
  applyLighting();
}

function normalizeLighting(value = {}) {
  return {
    ambient: clampNumber(value.ambient, 0, 2, DEFAULT_LIGHTING.ambient),
    environment: clampNumber(value.environment, 0, 2, DEFAULT_LIGHTING.environment),
    key: clampNumber(value.key, 0, 900, DEFAULT_LIGHTING.key),
    rim: clampNumber(value.rim, 0, 3, DEFAULT_LIGHTING.rim),
    exposure: clampNumber(value.exposure, 0.25, 1.6, DEFAULT_LIGHTING.exposure)
  };
}

function applyLighting(options = {}) {
  lighting = normalizeLighting(lighting);

  if (lightRig.ambient) {
    lightRig.ambient.intensity = lighting.ambient;
  }
  if (lightRig.key) {
    lightRig.key.intensity = lighting.key;
  }
  if (lightRig.rim) {
    lightRig.rim.intensity = lighting.rim;
  }

  renderer.toneMappingExposure = lighting.exposure;
  if ("environmentIntensity" in scene) {
    scene.environmentIntensity = lighting.environment;
  }
  applyEnvironmentIntensityToScene();
  syncLightingInputs();

  if (options.save !== false) {
    layout.lighting = { ...lighting };
    saveLayout();
  }
}

function applyEnvironmentIntensityToScene(root = scene) {
  root.traverse((child) => {
    if (!child.isMesh || !child.material) {
      return;
    }

    const materialsToUpdate = Array.isArray(child.material) ? child.material : [child.material];
    materialsToUpdate.forEach((material) => {
      if (!material) return;
      material.envMapIntensity = lighting.environment;
      material.needsUpdate = true;
    });
  });
}

function syncLightingInputs() {
  setRangeValue(ambientLightInput, ambientLightValue, lighting.ambient, 2);
  setRangeValue(envLightInput, envLightValue, lighting.environment, 2);
  setRangeValue(keyLightInput, keyLightValue, lighting.key, 0);
  setRangeValue(rimLightInput, rimLightValue, lighting.rim, 2);
  setRangeValue(exposureInput, exposureValue, lighting.exposure, 2);
}

function setRangeValue(input, output, value, digits) {
  if (input) {
    input.value = String(value);
  }
  if (output) {
    output.value = Number(value).toFixed(digits);
  }
}

function updateLightingFromInputs() {
  lighting = normalizeLighting({
    ambient: Number(ambientLightInput.value),
    environment: Number(envLightInput.value),
    key: Number(keyLightInput.value),
    rim: Number(rimLightInput.value),
    exposure: Number(exposureInput.value)
  });
  applyLighting();
}

function resetLighting() {
  lighting = { ...DEFAULT_LIGHTING };
  applyLighting();
  showNotice("灯光已恢复为柔和默认值。");
}

function buildRoom() {
  const textureLoader = new THREE.TextureLoader();
  const makeMat = (src) => {
    const texture = textureLoader.load(src);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.72, side: THREE.DoubleSide });
  };

  const wallFront = new THREE.Mesh(new THREE.PlaneGeometry(16, 8.4), makeMat("assets/cube/wall-wood-front.png"));
  wallFront.position.set(0, 1, -8);
  scene.add(wallFront);

  const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(16, 8.4), makeMat("assets/cube/wall-wood-back.png"));
  wallBack.position.set(0, 1, 8);
  wallBack.rotation.y = Math.PI;
  scene.add(wallBack);

  const wallLeft = new THREE.Mesh(new THREE.PlaneGeometry(16, 8.4), makeMat("assets/cube/wall-wood-left.png"));
  wallLeft.position.set(-8, 1, 0);
  wallLeft.rotation.y = Math.PI / 2;
  scene.add(wallLeft);

  const wallRight = new THREE.Mesh(new THREE.PlaneGeometry(16, 8.4), makeMat("assets/cube/wall-wood-right.png"));
  wallRight.position.set(8, 1, 0);
  wallRight.rotation.y = -Math.PI / 2;
  scene.add(wallRight);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), makeMat("assets/cube/floor.png"));
  floor.position.y = -3.2;
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), makeMat("assets/cube/ceiling.png"));
  ceiling.position.y = 5.2;
  ceiling.rotation.x = Math.PI / 2;
  scene.add(ceiling);
}

function buildObjects() {
  MODEL_SPECS.forEach(createModelObject);
  DECOR_SPECS.forEach(createDecorObject);
  layout.customObjects.forEach(createCustomObject);
  loadImportedModels();
  populateObjectSelect();
  selectObject("main-writing-table");
  showNotice("已进入 Three.js 管理页：点击模型可选中，拖动红绿蓝操作轴调整。");
}

function createModelObject(spec) {
  const group = new THREE.Group();
  const state = getState(spec);

  scene.add(group);
  group.userData.scaleFactor = getVisualScaleFactor(spec);
  applyState(group, state);
  registerObject(spec, "模型", group);

  loader.load(spec.src, (gltf) => {
    const model = gltf.scene;
    normalizeModelPivot(model);
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.designRoot = group;
      tintMaterial(child, spec.tint);
      selectableMeshes.push(child);
    });
    group.add(model);
    applyEnvironmentIntensityToScene(model);
  }, undefined, () => {
    showNotice(`模型加载失败：${spec.label}`);
  });
}

function createDecorObject(spec) {
  const group = spec.create();
  const state = getState(spec);

  scene.add(group);
  group.userData.scaleFactor = 1;
  applyState(group, state);
  registerObject(spec, "装饰", group);
}

function createCustomObject(spec) {
  const normalized = normalizeCustomObject(spec);
  const group = createCustomGroup(normalized);
  const state = getState(normalized);

  scene.add(group);
  group.userData.scaleFactor = 1;
  group.userData.isCustom = true;
  group.userData.customSpec = normalized;
  applyState(group, state);
  registerObject(normalized, "新增", group);

  return objects.get(normalized.id);
}

function createCustomGroup(spec) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.color),
    roughness: 0.62,
    metalness: 0.02
  });
  let mesh;

  if (spec.type === "cylinder") {
    const radius = Number(spec.size?.radius || CUSTOM_TYPE_SIZES.cylinder.radius);
    const height = Number(spec.size?.height || CUSTOM_TYPE_SIZES.cylinder.height);
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 32), material);
  } else {
    const fallback = spec.type === "plane" ? CUSTOM_TYPE_SIZES.plane : CUSTOM_TYPE_SIZES.box;
    const width = Number(spec.size?.width || fallback.width);
    const height = Number(spec.size?.height || fallback.height);
    const depth = Number(spec.size?.depth || fallback.depth);
    mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  }

  group.add(mesh);
  return group;
}

async function loadImportedModels() {
  if (!layout.importedModels.length) {
    return;
  }

  for (const record of layout.importedModels) {
    try {
      const stored = await readImportedModel(record);
      if (!stored?.arrayBuffer) {
        showImportStatus(`Missing model file: ${record.label || record.fileName}`);
        continue;
      }
      await createImportedModel(record, stored.arrayBuffer, { select: false, updateLayout: true });
    } catch (error) {
      console.warn("Imported model could not be loaded.", error);
      showImportStatus(`Could not load: ${record.label || record.fileName}`);
    }
  }

  populateObjectSelect();
  if (selectedEntry) {
    objectSelect.value = selectedEntry.id;
  }
}

async function handleImportModel(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const type = getImportFileType(file.name);
    const label = normalizeImportLabel(importModelNameInput?.value, file.name);

    validateImportFile(file, type, label);

    const record = normalizeImportedModel({
      id: `imported-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      dbKey: `imported-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label,
      fileName: file.name,
      type,
      position: [0, -1.05, -3.2],
      rotation: [0, 0, 0],
      scale: 1
    }, layout.importedModels.length);

    showImportStatus(`正在校验 ${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    validateImportBuffer(type, arrayBuffer, file.name);
    showImportStatus(`正在解析 ${file.name}...`);
    const entry = await createImportedModel(record, arrayBuffer, { select: true, updateLayout: false });

    const importedRecord = entry.object.userData.importRecord;
    await storeImportedModel(importedRecord, arrayBuffer);
    layout.importedModels.push(importedRecord);
    saveEntry(entry);
    saveLayout();
    pushUndo({ kind: "import-add", id: entry.id });
    populateObjectSelect();
    selectObject(entry.id);
    importModelNameInput.value = "";
    createLayoutSnapshot(`导入：${entry.label}`, { notice: false });
    showImportStatus(`已导入：${entry.label} · ${formatImportMetrics(importedRecord.metrics)}`);
    showNotice(`已导入模型：${entry.label}`);
  } catch (error) {
    console.error(error);
    showImportStatus(`导入失败：${error.message || file.name}`);
  } finally {
    event.target.value = "";
  }
}

async function createImportedModel(record, arrayBuffer, options = {}) {
  const normalized = normalizeImportedModel(record);
  const model = await parseImportedModel(normalized, arrayBuffer);
  const metrics = measureImportedModel(model);

  validateImportedModelMetrics(metrics);
  normalized.metrics = createImportMetrics(metrics, arrayBuffer.byteLength);
  normalizeImportedModelPivot(model, normalized);
  prepareImportedModel(model);

  const group = new THREE.Group();
  scene.add(group);
  group.add(model);
  group.userData.scaleFactor = normalized.baseScale || 1;
  group.userData.isImported = true;
  group.userData.importRecord = normalized;
  applyState(group, getState(normalized));
  registerObject(normalized, "Imported", group);
  applyEnvironmentIntensityToScene(group);

  if (options.updateLayout) {
    upsertImportedModelRecord(normalized);
    saveLayout();
  }

  if (options.select) {
    populateObjectSelect();
    selectObject(normalized.id);
  }

  return objects.get(normalized.id);
}

function parseImportedModel(record, arrayBuffer) {
  if (record.type === "obj") {
    const text = new TextDecoder("utf-8").decode(arrayBuffer);
    return Promise.resolve(objLoader.parse(text));
  }

  return new Promise((resolve, reject) => {
    loader.parse(arrayBuffer.slice(0), "", (gltf) => resolve(gltf.scene), reject);
  });
}

function normalizeImportLabel(value, fileName) {
  const fallback = stripModelExtension(fileName) || "导入模型";
  const label = String(value || "").trim() || fallback;
  return label.slice(0, 48);
}

function validateImportFile(file, type, label) {
  if (!type) {
    throw new Error("请选择 .glb 或 .obj 模型文件。");
  }
  if (!file.size) {
    throw new Error("模型文件为空。");
  }
  if (file.size > MAX_IMPORT_MODEL_BYTES) {
    throw new Error(`模型文件不能超过 ${formatBytes(MAX_IMPORT_MODEL_BYTES)}。`);
  }

  const duplicate = layout.importedModels.find((item) => {
    return String(item.fileName || "").toLowerCase() === file.name.toLowerCase() ||
      String(item.label || "").toLowerCase() === label.toLowerCase();
  });

  if (duplicate) {
    throw new Error(`已存在导入模型“${duplicate.label}”，请先删除旧模型或修改名称。`);
  }
}

function validateImportBuffer(type, arrayBuffer, fileName) {
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

  const text = new TextDecoder("utf-8").decode(arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 512 * 1024)));
  if (!/^\s*v\s+[-+0-9.]/m.test(text)) {
    throw new Error(`${fileName} 没有可读取的 OBJ 顶点数据。`);
  }
}

function measureImportedModel(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  let meshCount = 0;
  let vertexCount = 0;

  model.traverse((child) => {
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

function validateImportedModelMetrics(metrics) {
  if (!metrics.meshCount || !metrics.vertexCount || metrics.box.isEmpty()) {
    throw new Error("模型没有可读取的网格，请检查文件是否包含实体几何。");
  }

  if (!Number.isFinite(metrics.longestSide) || metrics.longestSide <= 0) {
    throw new Error("模型尺寸无效，无法自动摆放。");
  }
}

function createImportMetrics(metrics, byteLength) {
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

function formatImportMetrics(metrics = {}) {
  const dimensions = metrics.dimensions
    ? `${formatMetricNumber(metrics.dimensions.width)}×${formatMetricNumber(metrics.dimensions.height)}×${formatMetricNumber(metrics.dimensions.depth)}`
    : "尺寸未知";

  return `${metrics.meshCount || 0} 个网格，${dimensions}，${formatBytes(metrics.fileBytes || 0)}`;
}

function formatMetricNumber(value) {
  return Number(value || 0).toFixed(2);
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }
  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${value} B`;
}

function normalizeImportedModelPivot(model, record) {
  const metrics = measureImportedModel(model);
  if (metrics.box.isEmpty()) {
    record.baseScale = record.baseScale || 1;
    return;
  }

  const offset = new THREE.Vector3(metrics.center.x, metrics.minY, metrics.center.z);

  model.position.sub(offset);

  if (!Number.isFinite(Number(record.baseScale)) || Number(record.baseScale) <= 0) {
    const longestSide = Math.max(metrics.longestSide, 0.001);
    record.baseScale = Number((1.35 / longestSide).toFixed(6));
  }
}

function prepareImportedModel(model) {
  const fallbackMaterial = new THREE.MeshStandardMaterial({
    color: 0xc8b08a,
    roughness: 0.64,
    metalness: 0.02
  });

  model.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
    if (!child.material) {
      child.material = fallbackMaterial;
    }
  });
}

function getVisualScaleFactor(spec) {
  return Number(spec.scale || 1) > 50 ? 0.01 : 1;
}

function registerObject(spec, type, object) {
  object.userData.designId = spec.id;
  object.userData.label = spec.label;
  object.userData.type = type;
  object.userData.defaultState = makeDefaultState(spec);
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.designRoot = object;
    selectableMeshes.push(child);
  });
  objects.set(spec.id, { id: spec.id, label: spec.label, type, object });
}

function normalizeModelPivot(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) return;

  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
}

function tintMaterial(mesh, tint) {
  if (!tint) return;
  const tintColor = new THREE.Color(tint[0], tint[1], tint[2]);
  const applyTint = (material) => {
    if (!material || !material.color) return material;
    const next = material.clone();
    next.color.multiply(tintColor);
    return next;
  };

  mesh.material = Array.isArray(mesh.material)
    ? mesh.material.map(applyTint)
    : applyTint(mesh.material);
  applyEnvironmentIntensityToScene(mesh);
}

function createBoxObject(width, height, depth, material, position = [0, 0, 0]) {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(position[0], position[1], position[2]);
  group.add(mesh);
  return group;
}

function createWallScroll(width, height) {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.045), materials.scroll));
  const top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.18, 0.07, 0.07), materials.darkWood);
  top.position.y = height / 2 + 0.08;
  group.add(top);
  const bottom = top.clone();
  bottom.position.y = -height / 2 - 0.08;
  group.add(bottom);
  const inkA = new THREE.Mesh(new THREE.BoxGeometry(0.08, height * 0.48, 0.06), materials.ink);
  inkA.position.set(-width * 0.1, 0.22, -0.035);
  group.add(inkA);
  const seal = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.065), materials.red);
  seal.position.set(width * 0.24, -height * 0.28, -0.04);
  group.add(seal);
  return group;
}

function createBrushRack() {
  const group = new THREE.Group();
  group.add(createBoxObject(1.12, 0.06, 0.08, materials.darkWood, [0, 0.48, 0]).children[0]);
  group.add(createBoxObject(0.07, 0.66, 0.07, materials.darkWood, [-0.48, 0.18, 0]).children[0]);
  group.add(createBoxObject(0.07, 0.66, 0.07, materials.darkWood, [0.48, 0.18, 0]).children[0]);
  group.add(createBoxObject(1.08, 0.07, 0.22, materials.darkWood, [0, -0.16, 0]).children[0]);
  [-0.34, -0.12, 0.12, 0.34].forEach((offset, index) => {
    const length = 0.42 + index * 0.04;
    group.add(createBoxObject(0.045, length, 0.045, materials.wood, [offset, 0.18 - length / 2, 0.04]).children[0]);
    group.add(createBoxObject(0.08, 0.13, 0.08, materials.ink, [offset, -length - 0.02, 0.04]).children[0]);
  });
  return group;
}

function createInkSet() {
  const group = new THREE.Group();
  const inkstone = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 32), materials.ink);
  inkstone.position.y = 0.05;
  group.add(inkstone);
  group.add(createBoxObject(0.62, 0.055, 0.09, materials.ink, [0.55, 0.06, -0.06]).children[0]);
  group.add(createBoxObject(0.48, 0.045, 0.065, materials.brass, [0.55, 0.13, -0.06]).children[0]);
  return group;
}

function createJar(radius) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.72, radius, radius * 1.35, 32), materials.clay);
  body.position.y = radius * 0.68;
  group.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.32, radius * 0.58, radius * 0.32, 32), materials.clay);
  neck.position.y = radius * 1.45;
  group.add(neck);
  return group;
}

function createLowStand() {
  const group = createBoxObject(1.24, 0.12, 0.72, materials.darkWood);
  [-0.48, 0.48].forEach((x) => {
    [-0.24, 0.24].forEach((z) => {
      group.add(createBoxObject(0.12, 0.34, 0.12, materials.darkWood, [x, -0.22, z]).children[0]);
    });
  });
  return group;
}

function makeDefaultState(spec) {
  const rotation = spec.rotation || [0, 0, 0];
  return {
    id: spec.id,
    x: spec.position[0],
    y: spec.position[1],
    z: spec.position[2],
    rx: rotation[0],
    ry: rotation[1],
    rz: rotation[2],
    scale: spec.scale || 1,
    deleted: false,
    hidden: false,
    locked: false
  };
}

function normalizeCustomObject(record = {}, index = 0) {
  const type = CUSTOM_TYPE_LABELS[record.type] ? record.type : "box";
  const fallbackSize = CUSTOM_TYPE_SIZES[type];
  const position = Array.isArray(record.position) ? record.position : [0, -1.05, -3.2];
  const rotation = Array.isArray(record.rotation) ? record.rotation : [0, 0, 0];

  return {
    id: String(record.id || `custom-${Date.now()}-${index}`),
    label: String(record.label || `${CUSTOM_TYPE_LABELS[type]} ${index + 1}`),
    type,
    color: normalizeColor(record.color || "#8b5a2b"),
    size: {
      ...fallbackSize,
      ...(record.size || {})
    },
    position: [
      readNumber(position[0], 0),
      readNumber(position[1], -1.05),
      readNumber(position[2], -3.2)
    ],
    rotation: [
      readNumber(rotation[0], 0),
      readNumber(rotation[1], 0),
      readNumber(rotation[2], 0)
    ],
    scale: readNumber(record.scale, 1)
  };
}

function normalizeImportedModel(record = {}, index = 0) {
  const fileName = String(record.fileName || "model.glb");
  const type = record.type === "obj" || record.type === "glb"
    ? record.type
    : getImportFileType(fileName) || "glb";
  const position = Array.isArray(record.position) ? record.position : [0, -1.05, -3.2];
  const rotation = Array.isArray(record.rotation) ? record.rotation : [0, 0, 0];
  const baseScale = Number(record.baseScale);

  return {
    id: String(record.id || `imported-${Date.now()}-${index}`),
    dbKey: String(record.dbKey || record.id || `imported-${Date.now()}-${index}`),
    label: String(record.label || stripModelExtension(fileName) || `Imported model ${index + 1}`),
    fileName,
    type,
    position: [
      readNumber(position[0], 0),
      readNumber(position[1], -1.05),
      readNumber(position[2], -3.2)
    ],
    rotation: [
      readNumber(rotation[0], 0),
      readNumber(rotation[1], 0),
      readNumber(rotation[2], 0)
    ],
    scale: readNumber(record.scale, 1),
    baseScale: Number.isFinite(baseScale) && baseScale > 0 ? baseScale : undefined,
    metrics: normalizeImportMetrics(record.metrics)
  };
}

function normalizeImportMetrics(metrics = {}) {
  const source = metrics && typeof metrics === "object" ? metrics : {};
  const dimensions = source.dimensions && typeof source.dimensions === "object" ? source.dimensions : {};

  return {
    fileBytes: Math.max(0, Math.round(readNumber(source.fileBytes, 0))),
    meshCount: Math.max(0, Math.round(readNumber(source.meshCount, 0))),
    vertexCount: Math.max(0, Math.round(readNumber(source.vertexCount, 0))),
    dimensions: {
      width: readNumber(dimensions.width, 0),
      height: readNumber(dimensions.height, 0),
      depth: readNumber(dimensions.depth, 0)
    }
  };
}

function getImportFileType(fileName) {
  const match = String(fileName || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];

  return extension === "glb" || extension === "obj" ? extension : "";
}

function stripModelExtension(fileName) {
  return String(fileName || "").replace(/\.(glb|obj)$/i, "");
}

function upsertImportedModelRecord(record) {
  const normalized = normalizeImportedModel(record);
  const index = layout.importedModels.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    layout.importedModels[index] = normalized;
  } else {
    layout.importedModels.push(normalized);
  }

  return normalized;
}

function normalizeColor(value) {
  const string = String(value || "").trim();

  return /^#[0-9a-f]{6}$/i.test(string) ? string : "#8b5a2b";
}

function getState(spec) {
  const saved = layout.objects[spec.id] || {};
  const fallback = makeDefaultState(spec);
  return {
    ...fallback,
    x: readNumber(saved.x, fallback.x),
    y: readNumber(saved.y, fallback.y),
    z: readNumber(saved.z, fallback.z),
    rx: readNumber(saved.rx, fallback.rx),
    ry: readNumber(saved.ry, fallback.ry),
    rz: readNumber(saved.rz, fallback.rz),
    scale: readNumber(saved.scale, fallback.scale),
    deleted: saved.deleted === true,
    hidden: saved.hidden === true,
    locked: saved.locked === true
  };
}

function readNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeLayerOrder(value, validIds = null) {
  const valid = Array.isArray(validIds) ? new Set(validIds.map(String)) : null;
  const seen = new Set();
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((id) => String(id || "").trim())
    .filter((id) => {
      if (!id || seen.has(id) || (valid && !valid.has(id))) {
        return false;
      }
      seen.add(id);
      return true;
    });
}

function getLayerOrderIds() {
  const currentIds = [...objects.keys()];
  const ordered = normalizeLayerOrder(layout.layerOrder, currentIds);
  const orderedSet = new Set(ordered);
  return [
    ...ordered,
    ...currentIds.filter((id) => !orderedSet.has(id))
  ];
}

function sortLayerEntries(entries) {
  const order = getLayerOrderIds();
  const orderIndex = new Map(order.map((id, index) => [id, index]));
  return [...entries].sort((a, b) => {
    const left = orderIndex.has(a.id) ? orderIndex.get(a.id) : Number.MAX_SAFE_INTEGER;
    const right = orderIndex.has(b.id) ? orderIndex.get(b.id) : Number.MAX_SAFE_INTEGER;
    return left - right;
  });
}

function saveLayerOrder(order = getLayerOrderIds()) {
  layout.layerOrder = normalizeLayerOrder(order, [...objects.keys()]);
  saveLayout();
}

function applyState(object, state) {
  const scaleFactor = object.userData.scaleFactor || 1;

  object.position.set(state.x, state.y, state.z);
  object.rotation.set(toRadians(state.rx), toRadians(state.ry), toRadians(state.rz));
  object.scale.setScalar(state.scale * scaleFactor);
  object.userData.deleted = state.deleted === true;
  object.userData.hidden = state.hidden === true;
  object.userData.locked = state.locked === true;
  applyObjectVisibility(object);
}

function applyObjectVisibility(object) {
  object.visible = object.userData.deleted !== true && object.userData.hidden !== true;
}

function isEntryHidden(entry) {
  return entry?.object.userData.deleted === true || entry?.object.userData.hidden === true;
}

function isEntryLocked(entry) {
  return entry?.object.userData.locked === true;
}

function canTransformEntry(entry) {
  return entry && !isEntryHidden(entry) && !isEntryLocked(entry);
}

function loadLayout() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      objects: parsed && typeof parsed.objects === "object" && parsed.objects ? parsed.objects : {},
      layerOrder: normalizeLayerOrder(parsed?.layerOrder),
      customObjects: Array.isArray(parsed.customObjects)
        ? parsed.customObjects.map(normalizeCustomObject)
        : [],
      importedModels: Array.isArray(parsed.importedModels)
        ? parsed.importedModels.map(normalizeImportedModel)
        : [],
      lighting: parsed && typeof parsed.lighting === "object" && parsed.lighting ? parsed.lighting : { ...DEFAULT_LIGHTING }
    };
  } catch (error) {
    console.warn("Main scene layout could not be loaded.", error);
    return { objects: {}, layerOrder: [], customObjects: [], importedModels: [], lighting: { ...DEFAULT_LIGHTING } };
  }
}

function saveLayout() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (error) {
    console.warn("Main scene layout could not be saved.", error);
  }
}

function loadLayoutHistory() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const source = Array.isArray(parsed.snapshots) ? parsed.snapshots : Array.isArray(parsed) ? parsed : [];

    return source
      .map(normalizeLayoutSnapshot)
      .filter(Boolean)
      .slice(0, MAX_HISTORY_SNAPSHOTS);
  } catch (error) {
    console.warn("Main scene history could not be loaded.", error);
    return [];
  }
}

function saveLayoutHistory() {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      snapshots: layoutHistory.slice(0, MAX_HISTORY_SNAPSHOTS)
    }));
  } catch (error) {
    console.warn("Main scene history could not be saved.", error);
    setHistoryStatus("保存历史失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function normalizeLayoutSnapshot(record, index = 0) {
  if (!record || typeof record !== "object" || !record.layout) {
    return null;
  }

  const layoutValue = normalizeSnapshotLayout(record.layout);
  const fallbackLabel = index === 0 ? "主场景快照" : `主场景快照 ${index + 1}`;

  return {
    id: String(record.id || `snapshot-${Date.now()}-${index}`),
    label: String(record.label || fallbackLabel).slice(0, 60),
    createdAt: Number.isFinite(Date.parse(record.createdAt)) ? record.createdAt : new Date().toISOString(),
    layout: layoutValue,
    stats: normalizeSnapshotStats(record.stats, layoutValue)
  };
}

function normalizeSnapshotLayout(value = {}) {
  return {
    objects: value && typeof value.objects === "object" && value.objects
      ? clonePlain(value.objects)
      : {},
    layerOrder: normalizeLayerOrder(value.layerOrder),
    customObjects: Array.isArray(value.customObjects)
      ? value.customObjects.map(normalizeCustomObject)
      : [],
    importedModels: Array.isArray(value.importedModels)
      ? value.importedModels.map(normalizeImportedModel)
      : [],
    lighting: normalizeLighting(value.lighting || lighting)
  };
}

function normalizeSnapshotStats(stats, layoutValue) {
  const fallback = getLayoutStats(layoutValue);
  const source = stats && typeof stats === "object" ? stats : {};

  return {
    objectCount: Math.max(0, Math.round(readNumber(source.objectCount, fallback.objectCount))),
    customCount: Math.max(0, Math.round(readNumber(source.customCount, fallback.customCount))),
    importedCount: Math.max(0, Math.round(readNumber(source.importedCount, fallback.importedCount))),
    hiddenCount: Math.max(0, Math.round(readNumber(source.hiddenCount, fallback.hiddenCount))),
    lockedCount: Math.max(0, Math.round(readNumber(source.lockedCount, fallback.lockedCount)))
  };
}

function getLayoutStats(layoutValue = layout) {
  const objectStates = layoutValue && typeof layoutValue.objects === "object" && layoutValue.objects ? layoutValue.objects : {};
  const customCount = Array.isArray(layoutValue.customObjects) ? layoutValue.customObjects.length : 0;
  const importedCount = Array.isArray(layoutValue.importedModels) ? layoutValue.importedModels.length : 0;
  const objectCount = MODEL_SPECS.length + DECOR_SPECS.length + customCount + importedCount;
  const states = Object.values(objectStates);

  return {
    objectCount,
    customCount,
    importedCount,
    hiddenCount: states.filter((state) => state?.deleted === true || state?.hidden === true).length,
    lockedCount: states.filter((state) => state?.locked === true).length
  };
}

function createLayoutSnapshot(label = "手动快照", options = {}) {
  const snapshot = {
    id: `snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label: String(label || "手动快照").slice(0, 60),
    createdAt: new Date().toISOString(),
    layout: normalizeSnapshotLayout(layout),
    stats: getLayoutStats(layout)
  };

  layoutHistory = [
    snapshot,
    ...layoutHistory.filter((item) => item.id !== snapshot.id)
  ].slice(0, MAX_HISTORY_SNAPSHOTS);

  saveLayoutHistory();
  renderHistoryPanel();

  if (options.notice !== false) {
    showNotice(`已保存快照：${snapshot.label}`);
  }
  if (options.status !== false) {
    setHistoryStatus(`已保存快照：${snapshot.label}`, "success");
  }

  return snapshot;
}

function renderHistoryPanel() {
  if (!snapshotList) {
    return;
  }

  snapshotList.innerHTML = "";

  if (!layoutHistory.length) {
    const empty = document.createElement("p");
    empty.className = "main-history-empty";
    empty.textContent = "暂无快照。点击“保存快照”记录当前主场景布局。";
    snapshotList.appendChild(empty);
    setHistoryStatus("最多保留最近 10 次主场景布局快照。", "normal");
    return;
  }

  const fragment = document.createDocumentFragment();
  layoutHistory.forEach((snapshot) => {
    fragment.appendChild(createSnapshotRow(snapshot));
  });
  snapshotList.appendChild(fragment);
  setHistoryStatus(`已保留 ${layoutHistory.length} / ${MAX_HISTORY_SNAPSHOTS} 次快照。`, "normal");
}

function createSnapshotRow(snapshot) {
  const row = document.createElement("div");
  row.className = "main-snapshot-row";

  const detail = document.createElement("div");
  detail.className = "main-snapshot-detail";

  const title = document.createElement("strong");
  title.textContent = snapshot.label;

  const meta = document.createElement("span");
  meta.textContent = `${formatDateTime(snapshot.createdAt)} · ${formatSnapshotStats(snapshot.stats)}`;

  detail.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "main-snapshot-actions";

  const restoreButton = document.createElement("button");
  restoreButton.type = "button";
  restoreButton.dataset.featureState = "real-local";
  restoreButton.dataset.snapshotAction = "restore";
  restoreButton.dataset.snapshotId = snapshot.id;
  restoreButton.textContent = "恢复";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.featureState = "real-local";
  deleteButton.dataset.snapshotAction = "delete";
  deleteButton.dataset.snapshotId = snapshot.id;
  deleteButton.textContent = "删除";

  actions.append(restoreButton, deleteButton);
  row.append(detail, actions);

  return row;
}

function handleSnapshotListClick(event) {
  const button = event.target.closest("[data-snapshot-action]");
  if (!button) {
    return;
  }

  const snapshot = layoutHistory.find((item) => item.id === button.dataset.snapshotId);
  if (!snapshot) {
    setHistoryStatus("未找到该快照。", "error");
    renderHistoryPanel();
    return;
  }

  if (button.dataset.snapshotAction === "restore") {
    restoreLayoutSnapshot(snapshot);
    return;
  }

  if (button.dataset.snapshotAction === "delete") {
    deleteLayoutSnapshot(snapshot.id);
  }
}

function restoreLayoutSnapshot(snapshot) {
  createLayoutSnapshot("恢复前自动快照", { notice: false, status: false });

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSnapshotLayout(snapshot.layout)));
    setHistoryStatus(`已恢复快照：${snapshot.label}，页面即将刷新。`, "success");
    showNotice(`已恢复快照：${snapshot.label}`);
    window.setTimeout(() => window.location.reload(), 900);
  } catch (error) {
    console.warn("Main scene snapshot could not be restored.", error);
    setHistoryStatus("恢复快照失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function deleteLayoutSnapshot(id) {
  const before = layoutHistory.length;
  layoutHistory = layoutHistory.filter((snapshot) => snapshot.id !== id);
  saveLayoutHistory();
  renderHistoryPanel();
  setHistoryStatus(before === layoutHistory.length ? "未找到要删除的快照。" : "已删除快照。", "success");
}

function setHistoryStatus(message, tone = "normal") {
  if (!historyStatus) {
    return;
  }

  historyStatus.textContent = message;
  historyStatus.dataset.tone = tone;
}

function formatSnapshotStats(stats = {}) {
  return `${stats.objectCount || 0} 对象 / ${stats.customCount || 0} 自定义 / ${stats.importedCount || 0} 导入`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "时间未知";
  }

  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadPublishedLayoutRecord() {
  try {
    const raw = window.localStorage.getItem(PUBLISHED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Published main scene layout could not be loaded.", error);
    return null;
  }
}

function publishLayoutToFront() {
  const record = {
    version: 1,
    publishedAt: new Date().toISOString(),
    layout: normalizeSnapshotLayout(layout),
    stats: getLayoutStats(layout)
  };

  try {
    createLayoutSnapshot("发布前快照", { notice: false, status: false });
    window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(record));
    renderPublishPanel();
    showNotice("当前主场景草稿已发布到前台。");
  } catch (error) {
    console.warn("Published main scene layout could not be saved.", error);
    setPublishStatus("发布失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function renderPublishPanel() {
  const record = loadPublishedLayoutRecord();

  if (!record?.layout) {
    setPublishStatus("尚未发布。正式前台会临时读取当前草稿布局。", "normal");
    return;
  }

  const stats = normalizeSnapshotStats(record.stats, normalizeSnapshotLayout(record.layout));
  setPublishStatus(`已发布：${formatDateTime(record.publishedAt)} · ${formatSnapshotStats(stats)}`, "success");
}

function setPublishStatus(message, tone = "normal") {
  if (!publishStatus) {
    return;
  }

  publishStatus.textContent = message;
  publishStatus.dataset.tone = tone;
}

function openFrontPreview(url) {
  const target = window.open(url, "_blank", "noopener");
  if (!target) {
    window.location.href = url;
  }
}

function openImportDb() {
  if (importDbPromise) {
    return importDbPromise;
  }

  importDbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(IMPORT_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMPORT_DB_STORE)) {
        db.createObjectStore(IMPORT_DB_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open model storage."));
  });

  return importDbPromise;
}

async function storeImportedModel(record, arrayBuffer) {
  const db = await openImportDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMPORT_DB_STORE, "readwrite");
    const store = transaction.objectStore(IMPORT_DB_STORE);
    const request = store.put({
      key: record.dbKey,
      id: record.id,
      label: record.label,
      fileName: record.fileName,
      type: record.type,
      metrics: record.metrics,
      arrayBuffer: arrayBuffer.slice(0)
    });

    request.onerror = () => reject(request.error || new Error("Could not store imported model."));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not store imported model."));
  });
}

async function readImportedModel(record) {
  const db = await openImportDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMPORT_DB_STORE, "readonly");
    const store = transaction.objectStore(IMPORT_DB_STORE);
    const request = store.get(record.dbKey);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Could not read imported model."));
  });
}

async function deleteImportedModelData(record) {
  if (!record?.dbKey) {
    return;
  }

  const db = await openImportDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMPORT_DB_STORE, "readwrite");
    const store = transaction.objectStore(IMPORT_DB_STORE);
    const request = store.delete(record.dbKey);

    request.onerror = () => reject(request.error || new Error("Could not delete imported model."));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not delete imported model."));
  });
}

function isImportedModelReferencedByHistory(record) {
  if (!record?.dbKey && !record?.id) {
    return false;
  }

  return layoutHistory.some((snapshot) => {
    return snapshot.layout.importedModels.some((item) => {
      return (record.dbKey && item.dbKey === record.dbKey) || (record.id && item.id === record.id);
    });
  });
}

function populateObjectSelect() {
  objectSelect.innerHTML = "";
  objects.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = `${entry.type} / ${entry.label}${getEntryStatusSuffix(entry)}`;
    objectSelect.appendChild(option);
  });
  renderLayerPanel();
}

function updateObjectOption(entry) {
  const option = objectSelect.querySelector(`option[value="${entry.id}"]`);
  if (option) {
    option.textContent = `${entry.type} / ${entry.label}${getEntryStatusSuffix(entry)}`;
  }
}

function getEntryStatusSuffix(entry) {
  const states = [];

  if (isEntryHidden(entry)) {
    states.push("已隐藏");
  }
  if (isEntryLocked(entry)) {
    states.push("已锁定");
  }

  return states.length ? `（${states.join(" / ")}）` : "";
}

function renderLayerPanel() {
  if (!layerList) {
    return;
  }

  const entries = sortLayerEntries([...objects.values()]);
  const query = String(layerSearchInput?.value || "").trim().toLowerCase();
  const visibleCount = entries.filter((entry) => !isEntryHidden(entry)).length;
  const hiddenCount = entries.length - visibleCount;
  const lockedCount = entries.filter(isEntryLocked).length;
  pruneSelectedLayers(entries);
  const filteredEntries = entries.filter((entry) => {
    if (!query) return true;
    return [
      entry.id,
      entry.label,
      entry.type,
      getLayerGroupLabel(entry)
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });

  if (layerSummary) {
    layerSummary.textContent = `共 ${entries.length} 个对象 · 显示 ${visibleCount} · 隐藏 ${hiddenCount} · 锁定 ${lockedCount} · 已选 ${selectedLayerIds.size}`;
  }

  layerList.innerHTML = "";

  if (!filteredEntries.length) {
    const empty = document.createElement("p");
    empty.className = "main-layer-empty";
    empty.textContent = query ? "没有匹配的对象。" : "暂无可管理对象。";
    layerList.appendChild(empty);
    renderLayerBatchControls(filteredEntries);
    return;
  }

  const fragment = document.createDocumentFragment();
  const grouped = groupLayerEntries(filteredEntries);

  grouped.forEach(([groupName, groupEntries]) => {
    const group = document.createElement("section");
    group.className = "main-layer-group";

    const title = document.createElement("div");
    title.className = "main-layer-group-title";
    const titleLabel = document.createElement("span");
    const titleCount = document.createElement("strong");
    titleLabel.textContent = groupName;
    titleCount.textContent = String(groupEntries.length);
    title.append(titleLabel, titleCount);
    group.appendChild(title);

    groupEntries.forEach((entry) => {
      group.appendChild(createLayerRow(entry));
    });

    fragment.appendChild(group);
  });

  layerList.appendChild(fragment);
  renderLayerBatchControls(filteredEntries);
}

function pruneSelectedLayers(entries = [...objects.values()]) {
  const validIds = new Set(entries.map((entry) => entry.id));
  selectedLayerIds.forEach((id) => {
    if (!validIds.has(id)) {
      selectedLayerIds.delete(id);
    }
  });
}

function renderLayerBatchControls(filteredEntries = []) {
  const filteredIds = filteredEntries.map((entry) => entry.id);
  const selectedVisibleCount = filteredIds.filter((id) => selectedLayerIds.has(id)).length;
  const selectedCount = selectedLayerIds.size;

  if (layerSelectVisibleInput) {
    layerSelectVisibleInput.checked = filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;
    layerSelectVisibleInput.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < filteredIds.length;
    layerSelectVisibleInput.disabled = filteredIds.length === 0;
  }

  if (layerSelectionStatus) {
    layerSelectionStatus.textContent = selectedCount ? `已选 ${selectedCount} 个` : `当前 ${filteredIds.length} 个`;
  }

  [layerBatchHideButton, layerBatchShowButton, layerBatchLockButton, layerBatchUnlockButton, layerBatchClearButton].forEach((button) => {
    if (button) {
      button.disabled = selectedCount === 0;
    }
  });
}

function groupLayerEntries(entries) {
  const groups = new Map();

  entries.forEach((entry) => {
    const group = getLayerGroupLabel(entry);
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group).push(entry);
  });

  return [...groups.entries()];
}

function getLayerGroupLabel(entry) {
  if (entry.object.userData.isImported === true || entry.type === "Imported") {
    return "导入模型";
  }
  if (entry.object.userData.isCustom === true || entry.type === "新增") {
    return "新增物体";
  }
  return entry.type === "模型" ? "基础模型" : "几何装饰";
}

function createLayerRow(entry) {
  const row = document.createElement("div");
  row.className = "main-layer-row";
  row.classList.toggle("is-active", selectedEntry?.id === entry.id);
  row.classList.toggle("is-selected", selectedLayerIds.has(entry.id));
  row.classList.toggle("is-hidden", isEntryHidden(entry));
  row.classList.toggle("is-locked", isEntryLocked(entry));
  row.dataset.layerId = entry.id;

  const dragHandle = document.createElement("button");
  dragHandle.type = "button";
  dragHandle.className = "main-layer-drag";
  dragHandle.dataset.featureState = "real-local";
  dragHandle.dataset.layerDragHandle = entry.id;
  dragHandle.draggable = true;
  dragHandle.textContent = "≡";
  dragHandle.title = "拖拽调整图层顺序";
  dragHandle.setAttribute("aria-label", `拖拽排序：${entry.label}`);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "main-layer-checkbox";
  checkbox.checked = selectedLayerIds.has(entry.id);
  checkbox.dataset.layerCheck = entry.id;
  checkbox.setAttribute("aria-label", `选择图层：${entry.label}`);

  const selectButton = document.createElement("button");
  selectButton.type = "button";
  selectButton.className = "main-layer-select";
  selectButton.dataset.featureState = "real-local";
  selectButton.dataset.layerSelect = entry.id;
  const name = document.createElement("span");
  const kind = document.createElement("span");
  name.className = "main-layer-name";
  kind.className = "main-layer-kind";
  name.textContent = entry.label;
  kind.textContent = `${entry.type}${getEntryStatusSuffix(entry)}`;
  selectButton.append(name, kind);

  const visibilityButton = document.createElement("button");
  visibilityButton.type = "button";
  visibilityButton.className = "main-layer-icon";
  visibilityButton.dataset.featureState = "real-local";
  visibilityButton.dataset.layerAction = "visibility";
  visibilityButton.dataset.layerId = entry.id;
  visibilityButton.textContent = isEntryHidden(entry) ? "显" : "隐";
  visibilityButton.title = isEntryHidden(entry) ? "显示对象" : "隐藏对象";
  visibilityButton.setAttribute("aria-label", visibilityButton.title);

  const lockButton = document.createElement("button");
  lockButton.type = "button";
  lockButton.className = "main-layer-icon";
  lockButton.dataset.featureState = "real-local";
  lockButton.dataset.layerAction = "lock";
  lockButton.dataset.layerId = entry.id;
  lockButton.textContent = isEntryLocked(entry) ? "解" : "锁";
  lockButton.title = isEntryLocked(entry) ? "解锁对象" : "锁定对象";
  lockButton.setAttribute("aria-label", lockButton.title);

  row.append(dragHandle, checkbox, selectButton, visibilityButton, lockButton);
  return row;
}

function handleLayerClick(event) {
  const actionButton = event.target.closest("[data-layer-action]");
  if (actionButton) {
    const entry = objects.get(actionButton.dataset.layerId);
    if (!entry) return;

    if (actionButton.dataset.layerAction === "visibility") {
      toggleLayerVisibility(entry);
      return;
    }

    if (actionButton.dataset.layerAction === "lock") {
      toggleLayerLock(entry);
    }
    return;
  }

  const selectButton = event.target.closest("[data-layer-select]");
  if (selectButton) {
    selectObject(selectButton.dataset.layerSelect);
  }
}

function handleLayerDragStart(event) {
  const handle = event.target.closest("[data-layer-drag-handle]");
  if (!handle) {
    return;
  }

  const id = handle.dataset.layerDragHandle;
  if (!objects.has(id)) {
    event.preventDefault();
    return;
  }

  draggedLayerId = id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", id);
  handle.closest("[data-layer-id]")?.classList.add("is-dragging");
}

function handleLayerDragOver(event) {
  if (!draggedLayerId) {
    return;
  }

  const row = event.target.closest("[data-layer-id]");
  if (!row || row.dataset.layerId === draggedLayerId) {
    clearLayerDropMarkers();
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  const position = getLayerDropPosition(event, row);
  clearLayerDropMarkers(row);
  row.classList.toggle("is-drop-before", position === "before");
  row.classList.toggle("is-drop-after", position === "after");
}

function handleLayerDragLeave(event) {
  const row = event.target.closest("[data-layer-id]");
  if (!row || row.contains(event.relatedTarget)) {
    return;
  }
  row.classList.remove("is-drop-before", "is-drop-after");
}

function handleLayerDrop(event) {
  if (!draggedLayerId) {
    return;
  }

  const sourceId = draggedLayerId;
  const row = event.target.closest("[data-layer-id]");
  if (!row || row.dataset.layerId === sourceId) {
    draggedLayerId = null;
    clearLayerDropMarkers();
    return;
  }

  event.preventDefault();
  const position = getLayerDropPosition(event, row);
  moveLayerInOrder(sourceId, row.dataset.layerId, position);
  draggedLayerId = null;
  clearLayerDropMarkers();
}

function handleLayerDragEnd() {
  draggedLayerId = null;
  clearLayerDropMarkers();
}

function getLayerDropPosition(event, row) {
  const rect = row.getBoundingClientRect();
  return event.clientY > rect.top + rect.height / 2 ? "after" : "before";
}

function clearLayerDropMarkers(except = null) {
  layerList?.querySelectorAll(".main-layer-row.is-drop-before, .main-layer-row.is-drop-after, .main-layer-row.is-dragging")
    .forEach((row) => {
      if (row !== except) {
        row.classList.remove("is-drop-before", "is-drop-after");
      }
      if (!draggedLayerId || row.dataset.layerId !== draggedLayerId) {
        row.classList.remove("is-dragging");
      }
    });
}

function moveLayerInOrder(sourceId, targetId, position = "before") {
  if (!objects.has(sourceId) || !objects.has(targetId) || sourceId === targetId) {
    return false;
  }

  const beforeOrder = getLayerOrderIds();
  const nextOrder = beforeOrder.filter((id) => id !== sourceId);
  const targetIndex = nextOrder.indexOf(targetId);
  if (targetIndex < 0) {
    return false;
  }

  nextOrder.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, sourceId);
  if (beforeOrder.join("\u0001") === nextOrder.join("\u0001")) {
    return false;
  }

  pushUndo({ kind: "layer-order", order: beforeOrder, label: "图层排序" });
  saveLayerOrder(nextOrder);
  renderLayerPanel();
  createLayoutSnapshot("调整图层顺序", { notice: false });
  showNotice("图层顺序已保存到本机布局。");
  return true;
}

function handleLayerSelectionChange(event) {
  const checkbox = event.target.closest("[data-layer-check]");
  if (!checkbox) return;

  const id = checkbox.dataset.layerCheck;
  if (checkbox.checked) {
    selectedLayerIds.add(id);
  } else {
    selectedLayerIds.delete(id);
  }
  renderLayerPanel();
}

function getFilteredLayerEntries() {
  const query = String(layerSearchInput?.value || "").trim().toLowerCase();
  return sortLayerEntries([...objects.values()]).filter((entry) => {
    if (!query) return true;
    return [
      entry.id,
      entry.label,
      entry.type,
      getLayerGroupLabel(entry)
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });
}

function handleLayerSelectVisibleChange() {
  const filteredEntries = getFilteredLayerEntries();
  if (layerSelectVisibleInput?.checked) {
    filteredEntries.forEach((entry) => selectedLayerIds.add(entry.id));
  } else {
    filteredEntries.forEach((entry) => selectedLayerIds.delete(entry.id));
  }
  renderLayerPanel();
}

function clearLayerSelection() {
  selectedLayerIds.clear();
  renderLayerPanel();
  showNotice("已清除图层选择。");
}

function getSelectedLayerEntries() {
  pruneSelectedLayers();
  return [...selectedLayerIds].map((id) => objects.get(id)).filter(Boolean);
}

function applyLayerBatchVisibility(hidden) {
  const entries = getSelectedLayerEntries();
  if (!entries.length) {
    showNotice("请先选择要批量处理的图层。");
    return;
  }

  const changed = applyLayerBatchUpdate(entries, (entry) => {
    entry.object.userData.deleted = false;
    entry.object.userData.hidden = hidden;
    applyObjectVisibility(entry.object);
  }, hidden ? "批量隐藏" : "批量显示");

  if (changed) {
    showNotice(`${hidden ? "已隐藏" : "已显示"} ${changed} 个所选图层。`);
  }
}

function applyLayerBatchLock(locked) {
  const entries = getSelectedLayerEntries();
  if (!entries.length) {
    showNotice("请先选择要批量处理的图层。");
    return;
  }

  const changed = applyLayerBatchUpdate(entries, (entry) => {
    entry.object.userData.locked = locked;
  }, locked ? "批量锁定" : "批量解锁");

  if (changed) {
    showNotice(`${locked ? "已锁定" : "已解锁"} ${changed} 个所选图层。`);
  }
}

function applyLayerBatchUpdate(entries, updateEntry, actionLabel) {
  const beforeSnapshots = [];

  entries.forEach((entry) => {
    const before = snapshot(entry);
    updateEntry(entry);
    const after = snapshot(entry);
    if (!snapshotsMatch(before, after)) {
      beforeSnapshots.push(before);
      saveEntry(entry);
      updateObjectOption(entry);
    }
  });

  if (!beforeSnapshots.length) {
    showNotice("所选图层已经处于目标状态。");
    return 0;
  }

  pushUndo({ kind: "layer-batch", snapshots: beforeSnapshots, label: actionLabel });

  if (selectedEntry && !canTransformEntry(selectedEntry)) {
    transformControls.detach();
  }
  if (selectedEntry && canTransformEntry(selectedEntry)) {
    transformControls.attach(selectedEntry.object);
  }

  updateUiState();
  renderLayerPanel();
  createLayoutSnapshot(`${actionLabel}：${beforeSnapshots.length} 个对象`, { notice: false });
  return beforeSnapshots.length;
}

function toggleLayerVisibility(entry) {
  const before = snapshot(entry);
  const willShow = isEntryHidden(entry);

  entry.object.userData.deleted = false;
  entry.object.userData.hidden = !willShow;
  applyObjectVisibility(entry.object);

  if (!snapshotsMatch(before, snapshot(entry))) {
    pushUndo(before);
  }

  if (selectedEntry?.id === entry.id && !canTransformEntry(entry)) {
    transformControls.detach();
  }
  if (selectedEntry?.id === entry.id && canTransformEntry(entry)) {
    transformControls.attach(entry.object);
  }

  saveEntry(entry);
  updateObjectOption(entry);
  updateUiState();
  renderLayerPanel();
  showNotice(willShow ? `已显示：${entry.label}` : `已隐藏：${entry.label}`);
}

function toggleLayerLock(entry) {
  const before = snapshot(entry);
  entry.object.userData.locked = !entry.object.userData.locked;

  if (!snapshotsMatch(before, snapshot(entry))) {
    pushUndo(before);
  }

  if (selectedEntry?.id === entry.id && !canTransformEntry(entry)) {
    transformControls.detach();
  }
  if (selectedEntry?.id === entry.id && canTransformEntry(entry)) {
    transformControls.attach(entry.object);
  }

  saveEntry(entry);
  updateObjectOption(entry);
  updateUiState();
  renderLayerPanel();
  showNotice(entry.object.userData.locked ? `已锁定：${entry.label}` : `已解锁：${entry.label}`);
}

function selectObject(id) {
  const entry = objects.get(id);
  if (!entry) return;

  selectedEntry = entry;
  objectSelect.value = id;
  if (canTransformEntry(entry)) {
    transformControls.attach(entry.object);
  } else {
    transformControls.detach();
  }
  controls.autoRotate = false;
  syncInputs();
  updateUiState();
  renderLayerPanel();
  syncCustomEditorFromSelection();
}

function syncInputs() {
  if (!selectedEntry) return;
  const object = selectedEntry.object;
  xInput.value = object.position.x.toFixed(2);
  yInput.value = object.position.y.toFixed(2);
  zInput.value = object.position.z.toFixed(2);
  rotXInput.value = toDegrees(object.rotation.x).toFixed(2);
  rotYInput.value = toDegrees(object.rotation.y).toFixed(2);
  rotZInput.value = toDegrees(object.rotation.z).toFixed(2);
  scaleInput.value = getSemanticScale(object).toFixed(3);
}

function updateUiState() {
  if (!selectedEntry) return;
  const deleted = selectedEntry.object.userData.deleted === true;
  const hidden = selectedEntry.object.userData.hidden === true;
  const locked = selectedEntry.object.userData.locked === true;
  const isCustom = selectedEntry.object.userData.isCustom === true;
  const isImported = selectedEntry.object.userData.isImported === true;
  objectType.textContent = selectedEntry.type === "模型" ? "Three.js GLB 模型" : "Three.js 几何装饰";
  if (isCustom) {
    objectType.textContent = "新增基础物体";
  }
  if (isImported) {
    objectType.textContent = "导入 GLB / OBJ 模型";
  }
  objectStatus.textContent = deleted
    ? "当前已删除，可点击恢复物体。"
    : hidden
    ? "当前已在图层中隐藏，可点击恢复或在对象图层中显示。"
    : locked
    ? "当前已锁定，无法拖动或输入数值；可在对象图层中解锁。"
    : isImported
      ? "导入模型会保存到本机，并同步到正常主场景。"
      : isCustom
      ? "新增物体会保存到本机，并同步到正常主场景。"
      : "可直接拖动红绿蓝操作轴，也可输入精确数值。";
  [xInput, yInput, zInput, rotXInput, rotYInput, rotZInput, scaleInput].forEach((input) => {
    input.disabled = deleted || hidden || locked;
  });
  deleteButton.disabled = deleted || locked;
  restoreButton.disabled = (!deleted && !hidden) || (deleted && (isCustom || isImported));
  if (newObjectUpdateButton) {
    newObjectUpdateButton.disabled = !isCustom || deleted || hidden || locked;
  }
}

function snapshot(entry) {
  const object = entry.object;
  return {
    id: entry.id,
    x: object.position.x,
    y: object.position.y,
    z: object.position.z,
    rx: toDegrees(object.rotation.x),
    ry: toDegrees(object.rotation.y),
    rz: toDegrees(object.rotation.z),
    scale: getSemanticScale(object),
    deleted: object.userData.deleted === true,
    hidden: object.userData.hidden === true,
    locked: object.userData.locked === true
  };
}

function getSemanticScale(object) {
  return object.scale.x / (object.userData.scaleFactor || 1);
}

function snapshotsMatch(a, b) {
  if (!a || !b || a.id !== b.id) return false;
  return Math.abs(a.x - b.x) < 0.0001 &&
    Math.abs(a.y - b.y) < 0.0001 &&
    Math.abs(a.z - b.z) < 0.0001 &&
    Math.abs(a.rx - b.rx) < 0.0001 &&
    Math.abs(a.ry - b.ry) < 0.0001 &&
    Math.abs(a.rz - b.rz) < 0.0001 &&
    Math.abs(a.scale - b.scale) < 0.0001 &&
    a.deleted === b.deleted &&
    a.hidden === b.hidden &&
    a.locked === b.locked;
}

function pushUndo(item) {
  if (!item) return;
  if (item.kind) {
    undoStack.push(item);
    if (undoStack.length > MAX_UNDO_STEPS) {
      undoStack.shift();
    }
    return;
  }

  const last = undoStack[undoStack.length - 1];
  if (snapshotsMatch(last, item)) return;
  undoStack.push(item);
  if (undoStack.length > MAX_UNDO_STEPS) {
    undoStack.shift();
  }
}

function applySnapshot(item) {
  const entry = objects.get(item.id);
  if (!entry) return;

  entry.object.position.set(item.x, item.y, item.z);
  entry.object.rotation.set(toRadians(item.rx), toRadians(item.ry), toRadians(item.rz));
  entry.object.scale.setScalar(item.scale * (entry.object.userData.scaleFactor || 1));
  entry.object.userData.deleted = item.deleted;
  entry.object.userData.hidden = item.hidden === true;
  entry.object.userData.locked = item.locked === true;
  applyObjectVisibility(entry.object);
  saveEntry(entry);
  updateObjectOption(entry);
  selectObject(entry.id);
  renderLayerPanel();
}

async function undo() {
  const item = undoStack.pop();
  if (!item) {
    return;
  }

  if (item.kind === "import-delete") {
    const stored = item.arrayBuffer
      ? { arrayBuffer: item.arrayBuffer.slice(0) }
      : await readImportedModel(item.record);
    if (!stored?.arrayBuffer) {
      showImportStatus(`Missing model file: ${item.record.label || item.record.fileName}`);
      return;
    }
    await storeImportedModel(item.record, stored.arrayBuffer);
    layout.importedModels.push(item.record);
    const entry = await createImportedModel(item.record, stored.arrayBuffer, { select: true, updateLayout: true });
    applySnapshot(item.snapshot);
    selectObject(entry.id);
    saveLayout();
    return;
  }

  if (item.kind === "import-add") {
    const entry = objects.get(item.id);
    if (entry) {
      removeImportedEntry(entry);
    }
    return;
  }

  if (item.kind === "custom-delete") {
    layout.customObjects.push(item.spec);
    const entry = createCustomObject(item.spec);
    populateObjectSelect();
    applySnapshot(item.snapshot);
    selectObject(entry.id);
    saveLayout();
    return;
  }

  if (item.kind === "custom-add") {
    const entry = objects.get(item.id);
    if (entry) {
      removeCustomEntry(entry);
    }
    return;
  }

  if (item.kind === "custom-update") {
    const entry = objects.get(item.id);
    if (entry) {
      applyCustomSpecToEntry(entry, item.spec);
      applySnapshot(item.snapshot);
      saveEntry(entry);
      selectObject(entry.id);
      createLayoutSnapshot(`撤回编辑：${entry.label}`, { notice: false });
      showNotice(`已撤回编辑：${entry.label}`);
    }
    return;
  }

  if (item.kind === "layer-batch") {
    const snapshots = Array.isArray(item.snapshots) ? item.snapshots : [];
    snapshots.forEach((snapshotItem) => {
      const entry = objects.get(snapshotItem.id);
      if (!entry) return;
      entry.object.position.set(snapshotItem.x, snapshotItem.y, snapshotItem.z);
      entry.object.rotation.set(toRadians(snapshotItem.rx), toRadians(snapshotItem.ry), toRadians(snapshotItem.rz));
      entry.object.scale.setScalar(snapshotItem.scale * (entry.object.userData.scaleFactor || 1));
      entry.object.userData.deleted = snapshotItem.deleted;
      entry.object.userData.hidden = snapshotItem.hidden === true;
      entry.object.userData.locked = snapshotItem.locked === true;
      applyObjectVisibility(entry.object);
      saveEntry(entry);
      updateObjectOption(entry);
    });
    if (selectedEntry && canTransformEntry(selectedEntry)) {
      transformControls.attach(selectedEntry.object);
    } else {
      transformControls.detach();
    }
    updateUiState();
    renderLayerPanel();
    createLayoutSnapshot(`撤回${item.label || "批量图层操作"}`, { notice: false });
    showNotice(`已撤回${item.label || "批量图层操作"}。`);
    return;
  }

  if (item.kind === "layer-order") {
    saveLayerOrder(item.order || []);
    renderLayerPanel();
    createLayoutSnapshot("撤回图层排序", { notice: false });
    showNotice("已撤回图层排序。");
    return;
  }

  applySnapshot(item);
}

function saveEntry(entry) {
  const state = snapshot(entry);
  layout.objects[entry.id] = {
    x: Number(state.x.toFixed(3)),
    y: Number(state.y.toFixed(3)),
    z: Number(state.z.toFixed(3)),
    rx: Number(state.rx.toFixed(3)),
    ry: Number(state.ry.toFixed(3)),
    rz: Number(state.rz.toFixed(3)),
    scale: Number(state.scale.toFixed(4)),
    deleted: state.deleted,
    hidden: state.hidden,
    locked: state.locked
  };
  layout.layerOrder = getLayerOrderIds();
  saveLayout();
}

function addCustomObject() {
  if (!newObjectTypeSelect) {
    return;
  }

  const type = CUSTOM_TYPE_LABELS[newObjectTypeSelect.value] ? newObjectTypeSelect.value : "box";
  const index = layout.customObjects.length + 1;
  const label = newObjectNameInput?.value.trim() || `${CUSTOM_TYPE_LABELS[type] || "物体"} ${index}`;
  const spec = normalizeCustomObject({
    id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label,
    type,
    color: newObjectColorInput?.value || "#8b5a2b",
    position: [0, -1.05, -3.2],
    rotation: [0, 0, 0],
    scale: 1,
    size: readCustomObjectSize(type)
  }, index - 1);

  layout.customObjects.push(spec);
  const entry = createCustomObject(spec);
  saveEntry(entry);
  populateObjectSelect();
  selectObject(entry.id);
  pushUndo({ kind: "custom-add", id: entry.id });
  createLayoutSnapshot(`新增：${entry.label}`, { notice: false });
  showCustomStatus(`已新增：${entry.label}。可在对象图层中搜索、隐藏或锁定。`);
  showNotice(`已新增：${entry.label}`);
}

function updateSelectedCustomObject() {
  const entry = getSelectedCustomEntry();
  if (!entry) {
    showCustomStatus("请选择一个新增基础物体后再更新。");
    return;
  }
  if (!canEditCustomEntry(entry)) {
    showCustomStatus("当前物体已隐藏、锁定或删除，需恢复并解锁后才能更新。");
    return;
  }

  const beforeSpec = clonePlain(entry.object.userData.customSpec);
  const beforeSnapshot = snapshot(entry);
  const type = CUSTOM_TYPE_LABELS[newObjectTypeSelect.value] ? newObjectTypeSelect.value : beforeSpec.type;
  const label = newObjectNameInput?.value.trim() || beforeSpec.label;
  const spec = normalizeCustomObject({
    ...beforeSpec,
    label,
    type,
    color: newObjectColorInput?.value || beforeSpec.color,
    size: readCustomObjectSize(type)
  });

  if (JSON.stringify(beforeSpec) === JSON.stringify(spec)) {
    showCustomStatus("当前尺寸、颜色和名称没有变化。");
    return;
  }

  pushUndo({
    kind: "custom-update",
    id: entry.id,
    spec: beforeSpec,
    snapshot: beforeSnapshot
  });
  applyCustomSpecToEntry(entry, spec);
  saveEntry(entry);
  populateObjectSelect();
  selectObject(entry.id);
  createLayoutSnapshot(`编辑：${entry.label}`, { notice: false });
  showCustomStatus(`已更新：${entry.label}。尺寸和颜色已写入本机布局。`);
  showNotice(`已更新：${entry.label}`);
}

function applyCustomSpecToEntry(entry, spec) {
  if (!entry || entry.object.userData.isCustom !== true) {
    return;
  }

  const normalized = normalizeCustomObject(spec);
  disposeCustomEntryMeshes(entry.object);

  const nextGroup = createCustomGroup(normalized);
  while (nextGroup.children.length) {
    entry.object.add(nextGroup.children[0]);
  }
  entry.object.userData.label = normalized.label;
  entry.object.userData.defaultState = makeDefaultState(normalized);
  entry.object.userData.customSpec = normalized;
  entry.label = normalized.label;
  replaceCustomSpec(normalized);
  registerSelectableMeshes(entry.object);
}

function disposeCustomEntryMeshes(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;

    const index = selectableMeshes.indexOf(child);
    if (index >= 0) {
      selectableMeshes.splice(index, 1);
    }
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
  object.clear();
}

function replaceCustomSpec(spec) {
  const index = layout.customObjects.findIndex((item) => item.id === spec.id);
  if (index >= 0) {
    layout.customObjects[index] = spec;
  } else {
    layout.customObjects.push(spec);
  }
  saveLayout();
}

function registerSelectableMeshes(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.designRoot = object;
    selectableMeshes.push(child);
  });
}

function readCustomObjectSize(type) {
  const fallback = CUSTOM_TYPE_SIZES[type] || CUSTOM_TYPE_SIZES.box;

  if (type === "cylinder") {
    return {
      radius: readSizeInput(newObjectRadiusInput, fallback.radius, 0.03, 4),
      height: readSizeInput(newObjectHeightInput, fallback.height, 0.02, 8)
    };
  }

  return {
    width: readSizeInput(newObjectWidthInput, fallback.width, 0.05, 8),
    height: readSizeInput(newObjectHeightInput, fallback.height, 0.02, 8),
    depth: readSizeInput(newObjectDepthInput, fallback.depth, 0.05, 8)
  };
}

function readSizeInput(input, fallback, min, max) {
  return Number(clampNumber(input?.value, min, max, fallback).toFixed(3));
}

function syncCustomSizeInputs(resetValues = false) {
  if (!newObjectTypeSelect) {
    return;
  }

  const type = CUSTOM_TYPE_LABELS[newObjectTypeSelect.value] ? newObjectTypeSelect.value : "box";
  const size = CUSTOM_TYPE_SIZES[type] || CUSTOM_TYPE_SIZES.box;
  const isCylinder = type === "cylinder";

  toggleCustomSizeField("width", !isCylinder);
  toggleCustomSizeField("depth", !isCylinder);
  toggleCustomSizeField("radius", isCylinder);

  if (resetValues || !newObjectWidthInput?.value) setInputNumber(newObjectWidthInput, size.width);
  if (resetValues || !newObjectHeightInput?.value) setInputNumber(newObjectHeightInput, size.height);
  if (resetValues || !newObjectDepthInput?.value) setInputNumber(newObjectDepthInput, size.depth);
  if (resetValues || !newObjectRadiusInput?.value) setInputNumber(newObjectRadiusInput, size.radius);

  const entry = getSelectedCustomEntry();
  if (entry && canEditCustomEntry(entry)) {
    showCustomStatus(`正在编辑：${entry.label}。调整参数后点击“更新所选”。`);
  } else {
    showCustomStatus(`${CUSTOM_TYPE_LABELS[type]} 会以当前尺寸新增到主写字桌前方。`);
  }
}

function syncCustomEditorFromSelection() {
  const entry = getSelectedCustomEntry();
  if (!entry) {
    if (newObjectUpdateButton) {
      newObjectUpdateButton.disabled = true;
    }
    showCustomStatus(selectedEntry
      ? "当前选中对象不是新增基础物体；可继续新增基础物体，或在图层中选择已有新增物体后更新。"
      : "新增后会自动保存到本机布局，并同步到正常主场景。");
    return;
  }

  const spec = entry.object.userData.customSpec || {};
  if (newObjectTypeSelect) {
    newObjectTypeSelect.value = CUSTOM_TYPE_LABELS[spec.type] ? spec.type : "box";
  }
  if (newObjectNameInput) {
    newObjectNameInput.value = spec.label || entry.label;
  }
  if (newObjectColorInput) {
    newObjectColorInput.value = normalizeColor(spec.color || "#8b5a2b");
  }
  syncCustomSizeInputs(false);
  syncCustomSizeValues(spec);
  if (newObjectUpdateButton) {
    newObjectUpdateButton.disabled = !canEditCustomEntry(entry);
  }
  showCustomStatus(canEditCustomEntry(entry)
    ? `已载入：${entry.label}。可修改名称、类型、颜色和尺寸后更新。`
    : `已载入：${entry.label}，需恢复显示并解锁后才能更新。`);
}

function syncCustomSizeValues(spec = {}) {
  const type = CUSTOM_TYPE_LABELS[spec.type] ? spec.type : "box";
  const fallback = CUSTOM_TYPE_SIZES[type] || CUSTOM_TYPE_SIZES.box;
  const size = { ...fallback, ...(spec.size || {}) };

  if (type === "cylinder") {
    setInputNumber(newObjectRadiusInput, size.radius);
    setInputNumber(newObjectHeightInput, size.height);
    return;
  }

  setInputNumber(newObjectWidthInput, size.width);
  setInputNumber(newObjectHeightInput, size.height);
  setInputNumber(newObjectDepthInput, size.depth);
}

function getSelectedCustomEntry() {
  return selectedEntry?.object.userData.isCustom === true ? selectedEntry : null;
}

function canEditCustomEntry(entry) {
  return Boolean(entry)
    && entry.object.userData.isCustom === true
    && entry.object.userData.deleted !== true
    && entry.object.userData.hidden !== true
    && entry.object.userData.locked !== true;
}

function toggleCustomSizeField(name, isVisible) {
  const field = document.querySelector(`[data-custom-size="${name}"]`);
  if (field) {
    field.hidden = !isVisible;
  }
}

function setInputNumber(input, value) {
  if (input && Number.isFinite(Number(value))) {
    input.value = String(value);
  }
}

function showCustomStatus(message) {
  if (customStatus) {
    customStatus.textContent = message;
  }
}

function removeCustomEntry(entry, options = {}) {
  if (!entry || entry.object.userData.isCustom !== true) {
    return;
  }

  transformControls.detach();
  entry.object.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    const index = selectableMeshes.indexOf(child);
    if (index >= 0) {
      selectableMeshes.splice(index, 1);
    }
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
  scene.remove(entry.object);
  objects.delete(entry.id);
  layout.customObjects = layout.customObjects.filter((item) => item.id !== entry.id);
  layout.layerOrder = normalizeLayerOrder(layout.layerOrder).filter((id) => id !== entry.id);
  delete layout.objects[entry.id];

  if (options.save !== false) {
    saveLayout();
  }

  populateObjectSelect();
  renderLayerPanel();
  if (options.select !== false) {
    const nextId = objectSelect.options[0]?.value;
    selectedEntry = null;
    if (nextId) {
      selectObject(nextId);
    }
  }
}

function removeImportedEntry(entry, options = {}) {
  if (!entry || entry.object.userData.isImported !== true) {
    return;
  }

  const importRecord = { ...entry.object.userData.importRecord };
  transformControls.detach();
  entry.object.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    const index = selectableMeshes.indexOf(child);
    if (index >= 0) {
      selectableMeshes.splice(index, 1);
    }
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
  scene.remove(entry.object);
  objects.delete(entry.id);
  layout.importedModels = layout.importedModels.filter((item) => item.id !== entry.id);
  layout.layerOrder = normalizeLayerOrder(layout.layerOrder).filter((id) => id !== entry.id);
  delete layout.objects[entry.id];

  if (options.deleteStorage !== false && isImportedModelReferencedByHistory(importRecord)) {
    showImportStatus(`模型已从当前布局移除，文件保留用于历史回滚：${importRecord.label || importRecord.fileName}`);
  } else if (options.deleteStorage !== false) {
    deleteImportedModelData(importRecord)
      .then(() => showImportStatus(`已清理模型文件：${importRecord.label || importRecord.fileName}`))
      .catch((error) => {
        console.warn("Imported model file could not be deleted.", error);
        showImportStatus(`模型已从布局移除，但文件清理失败：${importRecord.label || importRecord.fileName}`);
      });
  }

  if (options.save !== false) {
    saveLayout();
  }

  populateObjectSelect();
  renderLayerPanel();
  if (options.select !== false) {
    const nextId = objectSelect.options[0]?.value;
    selectedEntry = null;
    if (nextId) {
      selectObject(nextId);
    }
  }
}

function applyInputValues() {
  if (!canTransformEntry(selectedEntry)) return;
  const before = inputStart || snapshot(selectedEntry);
  selectedEntry.object.position.set(Number(xInput.value), Number(yInput.value), Number(zInput.value));
  selectedEntry.object.rotation.set(toRadians(Number(rotXInput.value)), toRadians(Number(rotYInput.value)), toRadians(Number(rotZInput.value)));
  selectedEntry.object.scale.setScalar(Number(scaleInput.value) * (selectedEntry.object.userData.scaleFactor || 1));
  const after = snapshot(selectedEntry);
  if (!snapshotsMatch(before, after)) {
    pushUndo(before);
  }
  inputStart = null;
  saveEntry(selectedEntry);
  syncInputs();
}

async function deleteSelected() {
  if (!selectedEntry || selectedEntry.object.userData.deleted || isEntryLocked(selectedEntry)) return;
  if (selectedEntry.object.userData.isImported === true) {
    const stored = await readImportedModel(selectedEntry.object.userData.importRecord).catch((error) => {
      console.warn("Imported model file could not be prepared for undo.", error);
      return null;
    });
    pushUndo({
      kind: "import-delete",
      record: { ...selectedEntry.object.userData.importRecord },
      snapshot: snapshot(selectedEntry),
      arrayBuffer: stored?.arrayBuffer ? stored.arrayBuffer.slice(0) : null
    });
    const label = selectedEntry.label;
    removeImportedEntry(selectedEntry);
    createLayoutSnapshot(`删除：${label}`, { notice: false });
    showNotice(`Deleted model: ${label}`);
    return;
  }

  if (selectedEntry.object.userData.isCustom === true) {
    pushUndo({
      kind: "custom-delete",
      spec: { ...selectedEntry.object.userData.customSpec },
      snapshot: snapshot(selectedEntry)
    });
    const label = selectedEntry.label;
    removeCustomEntry(selectedEntry);
    createLayoutSnapshot(`删除：${label}`, { notice: false });
    showNotice(`已删除：${label}`);
    return;
  }

  pushUndo(snapshot(selectedEntry));
  selectedEntry.object.userData.deleted = true;
  selectedEntry.object.userData.hidden = false;
  selectedEntry.object.visible = false;
  transformControls.detach();
  saveEntry(selectedEntry);
  updateObjectOption(selectedEntry);
  updateUiState();
  renderLayerPanel();
  createLayoutSnapshot(`隐藏：${selectedEntry.label}`, { notice: false });
}

function restoreSelected() {
  if (!selectedEntry || (!selectedEntry.object.userData.deleted && !selectedEntry.object.userData.hidden)) return;
  pushUndo(snapshot(selectedEntry));
  selectedEntry.object.userData.deleted = false;
  selectedEntry.object.userData.hidden = false;
  applyObjectVisibility(selectedEntry.object);
  if (canTransformEntry(selectedEntry)) {
    transformControls.attach(selectedEntry.object);
  }
  saveEntry(selectedEntry);
  updateObjectOption(selectedEntry);
  updateUiState();
  renderLayerPanel();
  createLayoutSnapshot(`恢复：${selectedEntry.label}`, { notice: false });
}

function resetSelected() {
  if (!selectedEntry) return;
  const defaultState = selectedEntry.object.userData.defaultState;
  pushUndo(snapshot(selectedEntry));
  applyState(selectedEntry.object, defaultState);
  delete layout.objects[selectedEntry.id];
  saveLayout();
  updateObjectOption(selectedEntry);
  selectObject(selectedEntry.id);
  renderLayerPanel();
  createLayoutSnapshot(`复位：${selectedEntry.label}`, { notice: false });
}

function resetAll() {
  createLayoutSnapshot("恢复全部默认前", { notice: false });
  undoStack.length = 0;
  layout.objects = {};
  layout.layerOrder = [];
  layout.customObjects = [];
  layout.importedModels = [];
  [...objects.values()].forEach((entry) => {
    if (entry.object.userData.isCustom === true) {
      removeCustomEntry(entry, { save: false, select: false });
    }
    if (entry.object.userData.isImported === true) {
      removeImportedEntry(entry, { save: false, select: false });
    }
  });
  objects.forEach((entry) => {
    applyState(entry.object, entry.object.userData.defaultState);
    updateObjectOption(entry);
  });
  saveLayout();
  selectObject(selectedEntry?.id || "main-writing-table");
  renderLayerPanel();
  showNotice("主场景物体已恢复全部默认。");
}

function setMode(mode) {
  transformControls.setMode(mode);
  translateButton.classList.toggle("is-active", mode === "translate");
  rotateButton.classList.toggle("is-active", mode === "rotate");
}

function focusSelected() {
  if (!selectedEntry) return;
  const target = new THREE.Vector3();
  selectedEntry.object.getWorldPosition(target);
  controls.target.copy(target);
  const offset = new THREE.Vector3(3.2, 2.2, 3.4);
  camera.position.copy(target).add(offset);
  controls.update();
}

function pickObject(event) {
  if (event.button !== 0 || transformControls.axis || transformControls.dragging) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(selectableMeshes, false).filter((hit) => {
    const root = hit.object.userData.designRoot;
    return root && root.visible && root.userData.deleted !== true && root.userData.hidden !== true && root.userData.locked !== true;
  });

  if (hits.length) {
    selectObject(hits[0].object.userData.designRoot.userData.designId);
  }
}

function bindUi() {
  objectSelect.addEventListener("change", () => selectObject(objectSelect.value));
  translateButton.addEventListener("click", () => setMode("translate"));
  rotateButton.addEventListener("click", () => setMode("rotate"));
  focusButton.addEventListener("click", focusSelected);
  undoButton.addEventListener("click", undo);
  resetButton.addEventListener("click", resetSelected);
  deleteButton.addEventListener("click", deleteSelected);
  restoreButton.addEventListener("click", restoreSelected);
  saveButton.addEventListener("click", () => {
    if (selectedEntry) saveEntry(selectedEntry);
    createLayoutSnapshot(`保存：${selectedEntry?.label || "主场景"}`, { notice: false });
    showNotice("已保存，正常主场景页面会读取这些参数。");
  });
  resetAllButton.addEventListener("click", resetAll);
  previewDraftButton?.addEventListener("click", () => openFrontPreview("index.html?mainScenePreview=draft"));
  openLiveButton?.addEventListener("click", () => openFrontPreview("index.html"));
  publishLayoutButton?.addEventListener("click", publishLayoutToFront);
  renderPublishPanel();
  snapshotCreateButton?.addEventListener("click", () => createLayoutSnapshot("手动快照"));
  snapshotRefreshButton?.addEventListener("click", () => {
    layoutHistory = loadLayoutHistory();
    renderHistoryPanel();
    setHistoryStatus("已刷新保存历史列表。", "success");
  });
  snapshotList?.addEventListener("click", handleSnapshotListClick);
  renderHistoryPanel();
  newObjectAddButton?.addEventListener("click", addCustomObject);
  newObjectUpdateButton?.addEventListener("click", updateSelectedCustomObject);
  newObjectTypeSelect?.addEventListener("change", () => syncCustomSizeInputs(true));
  syncCustomSizeInputs(false);
  importModelInput?.addEventListener("change", handleImportModel);
  [ambientLightInput, envLightInput, keyLightInput, rimLightInput, exposureInput].forEach((input) => {
    input.addEventListener("input", updateLightingFromInputs);
  });
  lightResetButton.addEventListener("click", resetLighting);
  layerSearchInput?.addEventListener("input", renderLayerPanel);
  layerList?.addEventListener("click", handleLayerClick);
  layerList?.addEventListener("change", handleLayerSelectionChange);
  layerList?.addEventListener("dragstart", handleLayerDragStart);
  layerList?.addEventListener("dragover", handleLayerDragOver);
  layerList?.addEventListener("dragleave", handleLayerDragLeave);
  layerList?.addEventListener("drop", handleLayerDrop);
  layerList?.addEventListener("dragend", handleLayerDragEnd);
  layerSelectVisibleInput?.addEventListener("change", handleLayerSelectVisibleChange);
  layerBatchHideButton?.addEventListener("click", () => applyLayerBatchVisibility(true));
  layerBatchShowButton?.addEventListener("click", () => applyLayerBatchVisibility(false));
  layerBatchLockButton?.addEventListener("click", () => applyLayerBatchLock(true));
  layerBatchUnlockButton?.addEventListener("click", () => applyLayerBatchLock(false));
  layerBatchClearButton?.addEventListener("click", clearLayerSelection);

  [xInput, yInput, zInput, rotXInput, rotYInput, rotZInput, scaleInput].forEach((input) => {
    input.addEventListener("focus", () => {
      inputStart = selectedEntry ? snapshot(selectedEntry) : null;
    });
    input.addEventListener("change", applyInputValues);
  });

  transformControls.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;
  });
  transformControls.addEventListener("mouseDown", () => {
    dragStart = canTransformEntry(selectedEntry) ? snapshot(selectedEntry) : null;
  });
  transformControls.addEventListener("mouseUp", () => {
    if (!canTransformEntry(selectedEntry) || !dragStart) return;
    const after = snapshot(selectedEntry);
    if (!snapshotsMatch(dragStart, after)) {
      pushUndo(dragStart);
    }
    dragStart = null;
  });
  transformControls.addEventListener("objectChange", () => {
    if (!canTransformEntry(selectedEntry)) {
      transformControls.detach();
      return;
    }
    syncInputs();
    saveEntry(selectedEntry);
  });

  renderer.domElement.addEventListener("pointerdown", pickObject);
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => {
    const tag = event.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
    }
    if (event.key.toLowerCase() === "w") setMode("translate");
    if (event.key.toLowerCase() === "e") setMode("rotate");
  }, true);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function showNotice(message) {
  noticeState.textContent = message;
  noticeState.hidden = false;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    noticeState.hidden = true;
  }, 4200);
}

function showImportStatus(message) {
  if (importStatus) {
    importStatus.textContent = message;
  }
}

function toRadians(value) {
  return Number(value || 0) * Math.PI / 180;
}

function toDegrees(value) {
  return Number(value || 0) * 180 / Math.PI;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
}
