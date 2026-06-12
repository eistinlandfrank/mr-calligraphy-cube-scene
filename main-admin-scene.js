import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import {
  createArrayBufferSha256,
  createImportMetrics,
  createModelStore,
  formatBytes,
  formatImportMetrics,
  getImportFileType,
  getImportTextureMimeType,
  getImportTextureType,
  measureImportedModel,
  normalizeImportTextureRecord,
  normalizeImportLabel,
  normalizeImportMetrics,
  parseImportedModel,
  stripModelExtension,
  validateImportBuffer,
  validateImportFile,
  validateImportTextureFile,
  validateImportedModelMetrics
} from "./model-import-utils.js";

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
const importModelColorInput = document.getElementById("mainImportModelColor");
const importModelOpacityInput = document.getElementById("mainImportModelOpacity");
const importModelOpacityValue = document.getElementById("mainImportModelOpacityValue");
const importModelRoughnessInput = document.getElementById("mainImportModelRoughness");
const importModelRoughnessValue = document.getElementById("mainImportModelRoughnessValue");
const importModelMetalnessInput = document.getElementById("mainImportModelMetalness");
const importModelMetalnessValue = document.getElementById("mainImportModelMetalnessValue");
const importModelReplaceInput = document.getElementById("mainImportModelReplace");
const importModelTextureInput = document.getElementById("mainImportModelTexture");
const importModelTextureClearButton = document.getElementById("mainImportModelTextureClear");
const importModelMaterialUpdateButton = document.getElementById("mainImportModelMaterialUpdate");
const importMaterialStatus = document.getElementById("mainImportMaterialStatus");
const importAuditStatus = document.getElementById("mainImportAuditStatus");
const importAuditList = document.getElementById("mainImportAuditList");
const importAuditCleanupButton = document.getElementById("mainImportAuditCleanup");
const importAuditExportButton = document.getElementById("mainImportAuditExport");
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
const publishNoteInput = document.getElementById("mainPublishNote");
const publishDiffSummary = document.getElementById("mainPublishDiffSummary");
const publishDiffList = document.getElementById("mainPublishDiffList");
const publishHistoryList = document.getElementById("mainPublishHistoryList");
const remotePublishStatus = document.getElementById("mainRemotePublishStatus");
const remotePublishEndpointInput = document.getElementById("mainRemotePublishEndpoint");
const remotePublishTokenInput = document.getElementById("mainRemotePublishToken");
const remotePublishWorkspaceInput = document.getElementById("mainRemotePublishWorkspace");
const remotePublishSaveButton = document.getElementById("mainRemotePublishSave");
const remotePublishCheckButton = document.getElementById("mainRemotePublishCheck");
const remotePublishPushButton = document.getElementById("mainRemotePublishPush");
const remotePublishRevokeButton = document.getElementById("mainRemotePublishRevoke");
const remotePublishReviewStatus = document.getElementById("mainRemotePublishReviewStatus");
const remotePublishRequestReviewButton = document.getElementById("mainRemotePublishRequestReview");
const remotePublishApproveReviewButton = document.getElementById("mainRemotePublishApproveReview");
const remotePublishRejectReviewButton = document.getElementById("mainRemotePublishRejectReview");
const remotePublishUnlockButton = document.getElementById("mainRemotePublishUnlock");
const remotePublishReceiptStatus = document.getElementById("mainRemotePublishReceiptStatus");
const remotePublishReceiptList = document.getElementById("mainRemotePublishReceiptList");
const remotePublishReceiptExportButton = document.getElementById("mainRemotePublishReceiptExport");
const adminRiskBanner = document.getElementById("mainAdminRiskBanner");
const adminRiskAcknowledgeButton = document.getElementById("mainAdminRiskAcknowledge");
const adminRiskStatus = document.getElementById("mainAdminRiskStatus");
const adminAccessStatus = document.getElementById("mainAdminAccessStatus");
const adminAccessCodeInput = document.getElementById("mainAdminAccessCode");
const adminAccessUnlockButton = document.getElementById("mainAdminAccessUnlock");
const adminAccessLockButton = document.getElementById("mainAdminAccessLock");
const adminBoundaryStatus = document.getElementById("mainAdminBoundaryStatus");
const adminBoundaryList = document.getElementById("mainAdminBoundaryList");
const adminOperatorStatus = document.getElementById("mainAdminOperatorStatus");
const adminOperatorNameInput = document.getElementById("mainAdminOperatorName");
const adminOperatorRoleSelect = document.getElementById("mainAdminOperatorRole");
const adminOperatorSaveButton = document.getElementById("mainAdminOperatorSave");
const adminAuditExportButton = document.getElementById("mainAdminAuditExport");
const adminPermissionStatus = document.getElementById("mainAdminPermissionStatus");
const adminAuditList = document.getElementById("mainAdminAuditList");

const STORAGE_KEY = "mr-calligraphy-main-scene-layout-v1";
const HISTORY_KEY = "mr-calligraphy-main-scene-history-v1";
const PUBLISHED_KEY = "mr-calligraphy-main-scene-published-v1";
const ADMIN_RISK_ACK_KEY = "mr-calligraphy-admin-risk-ack-v1";
const ADMIN_AUDIT_SCOPE = "mainScene";
const IMPORT_DB_NAME = "mr-calligraphy-main-model-store";
const IMPORT_DB_STORE = "models";
const IMPORT_AUDIT_KEY = "mr-calligraphy-main-import-audit-v1";
const MAX_UNDO_STEPS = 256;
const MAX_HISTORY_SNAPSHOTS = 10;
const MAX_PUBLISH_RELEASES = 10;
const MAX_IMPORT_AUDIT_RECORDS = 30;
const IMPORT_AUDIT_STATUS_LABELS = {
  "storage-deleted": "文件已清理",
  "retained-for-history": "历史保留",
  "delete-failed": "清理失败",
  "layout-only": "仅移除布局"
};
const ADMIN_AUDIT_ACTION_LABELS = {
  "confirm-boundary": "确认边界",
  snapshot: "保存快照",
  "publish-local": "本机发布",
  "remote-publish-check": "检查远端发布",
  "remote-publish-push": "远端发布推送",
  "remote-publish-revoke": "远端发布撤销",
  "remote-review-request": "提交远端审核",
  "remote-review-approve": "通过远端审核",
  "remote-review-reject": "退回远端审核",
  "remote-review-unlock": "解除发布锁",
  "access-unlock": "解锁后台",
  "access-lock": "锁定后台",
  "operator-save": "保存操作者",
  "snapshot-restore": "恢复快照",
  "snapshot-delete": "删除快照",
  "permission-blocked": "权限拦截"
};
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
const importedTextureLoader = new THREE.TextureLoader();
const importedModelStore = createModelStore({
  dbName: IMPORT_DB_NAME,
  storeName: IMPORT_DB_STORE,
  keyPath: "key"
});
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const objects = new Map();
const selectableMeshes = [];
const undoStack = [];
const lightRig = {};
const selectedLayerIds = new Set();
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

window.MRMainImportAudit = {
  getAuditLog: loadImportAuditLog,
  getAuditExport: getImportAuditExport,
  getRetainedRecords: getRetainedImportAuditRecords
};
window.MRMainAdminBoundary = {
  render: renderAdminBoundaryPanel
};

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
  if (!ensureAdminPermission("import", "导入模型")) {
    event.target.value = "";
    return;
  }
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const type = getImportFileType(file.name);
    const label = normalizeImportLabel(importModelNameInput?.value, file.name);

    validateImportFile(file, {
      type,
      label,
      existingRecords: layout.importedModels,
      duplicateMessage: (duplicate) => `已存在导入模型“${duplicate.label}”，请先删除旧模型或修改名称。`
    });

    const record = normalizeImportedModel({
      id: `imported-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      dbKey: `imported-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label,
      fileName: file.name,
      type,
      color: importModelColorInput?.value || "#c8b08a",
      opacity: normalizeImportOpacity(importModelOpacityInput?.value),
      roughness: normalizeImportRoughness(importModelRoughnessInput?.value),
      metalness: normalizeImportMetalness(importModelMetalnessInput?.value),
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
    importedRecord.sha256 = await createArrayBufferSha256(arrayBuffer);
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
  const { normalized, model } = await createImportedModelContent(record, arrayBuffer);
  const group = new THREE.Group();

  scene.add(group);
  group.add(model);
  group.userData.scaleFactor = normalized.baseScale || 1;
  group.userData.isImported = true;
  group.userData.importRecord = normalized;
  group.userData.importTexture = model.userData.importTexture || null;
  group.userData.importTextureRecord = normalized.texture || null;
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

async function createImportedModelContent(record, arrayBuffer) {
  const normalized = normalizeImportedModel(record);
  const model = await parseImportedModel(normalized, arrayBuffer, { gltfLoader: loader, objLoader });
  const metrics = measureImportedModel(model);
  const texture = await readImportedModelTexture(normalized).catch((error) => {
    console.warn("Imported model texture could not be loaded.", error);
    return null;
  });

  validateImportedModelMetrics(metrics);
  normalized.metrics = createImportMetrics(metrics, arrayBuffer.byteLength);
  normalizeImportedModelPivot(model, normalized);
  prepareImportedModel(model);
  model.userData.importTexture = texture;
  model.userData.importTextureRecord = normalized.texture;
  applyImportedModelMaterial(model, normalized, { texture });

  return { normalized, model };
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

function applyImportedModelMaterial(root, record, options = {}) {
  const color = new THREE.Color(normalizeImportColor(record.color || "#c8b08a"));
  const opacity = normalizeImportOpacity(record.opacity);
  const roughness = normalizeImportRoughness(record.roughness);
  const metalness = normalizeImportMetalness(record.metalness);
  const texture = options.texture || root.userData.importTexture || null;

  root.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    const previous = child.material;
    const sourceMaterials = Array.isArray(previous) ? previous : [previous].filter(Boolean);
    const nextMaterials = sourceMaterials.length
      ? sourceMaterials.map((material) => cloneImportedMaterial(material, color, opacity, roughness, metalness, texture))
      : [new THREE.MeshStandardMaterial({
          color,
          map: texture,
          opacity,
          transparent: opacity < 0.999,
          depthWrite: opacity >= 0.999,
          roughness,
          metalness
        })];

    child.material = Array.isArray(previous) ? nextMaterials : nextMaterials[0];

    if (options.disposePrevious) {
      disposeMaterials(previous);
    }
  });
}

function cloneImportedMaterial(material, color, opacity, roughness, metalness, texture = null) {
  const next = material?.clone
    ? material.clone()
    : new THREE.MeshStandardMaterial({
        roughness,
        metalness
      });

  if (next.color?.set) {
    next.color.set(color);
  }
  next.opacity = opacity;
  next.transparent = opacity < 0.999;
  next.depthWrite = opacity >= 0.999;
  next.roughness = roughness;
  next.metalness = metalness;
  if (texture) {
    next.map = texture;
  }
  next.needsUpdate = true;
  return next;
}

function disposeMaterials(material) {
  if (Array.isArray(material)) {
    material.forEach((item) => item?.dispose?.());
    return;
  }
  material?.dispose?.();
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
    color: normalizeImportColor(record.color || "#c8b08a"),
    opacity: normalizeImportOpacity(record.opacity),
    roughness: normalizeImportRoughness(record.roughness),
    metalness: normalizeImportMetalness(record.metalness),
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
    metrics: normalizeImportMetrics(record.metrics),
    sha256: normalizeSha256(record.sha256),
    texture: normalizeImportTextureRecord(record.texture)
  };
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

function normalizeImportColor(value) {
  const string = String(value || "").trim();

  return /^#[0-9a-f]{6}$/i.test(string) ? string : "#c8b08a";
}

function normalizeImportOpacity(value) {
  return clampNumber(value, 0.2, 1, 1);
}

function normalizeImportRoughness(value) {
  return clampNumber(value, 0.05, 1, 0.64);
}

function normalizeImportMetalness(value) {
  return clampNumber(value, 0, 1, 0.02);
}

function normalizeSha256(value) {
  const hash = String(value || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
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
    renderPublishDiff();
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

  if (options.audit !== false) {
    recordAdminOperation("snapshot", snapshot.label, `保存主场景快照：${snapshot.label}`, "ok", {
      snapshotId: snapshot.id,
      stats: snapshot.stats
    });
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
  restoreButton.textContent = "回滚";
  setAdminPermissionState(restoreButton, "edit");

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.featureState = "real-local";
  deleteButton.dataset.snapshotAction = "delete";
  deleteButton.dataset.snapshotId = snapshot.id;
  deleteButton.textContent = "删除";
  setAdminPermissionState(deleteButton, "delete");

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
    if (!ensureAdminPermission("edit", "恢复快照")) {
      return;
    }
    restoreLayoutSnapshot(snapshot);
    return;
  }

  if (button.dataset.snapshotAction === "delete") {
    if (!ensureAdminPermission("delete", "删除快照")) {
      return;
    }
    deleteLayoutSnapshot(snapshot.id);
  }
}

function restoreLayoutSnapshot(snapshot) {
  const autoSnapshot = createLayoutSnapshot("恢复前自动快照", { notice: false, status: false });

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSnapshotLayout(snapshot.layout)));
    recordAdminOperation("snapshot-restore", snapshot.label, `恢复主场景快照：${snapshot.label}`, "ok", {
      snapshotId: snapshot.id,
      autoSnapshotId: autoSnapshot?.id || "",
      stats: snapshot.stats
    });
    setHistoryStatus(`已恢复快照：${snapshot.label}，页面即将刷新。`, "success");
    showNotice(`已恢复快照：${snapshot.label}`);
    window.setTimeout(() => window.location.reload(), 900);
  } catch (error) {
    console.warn("Main scene snapshot could not be restored.", error);
    recordAdminOperation("snapshot-restore", snapshot.label, "恢复主场景快照失败，可能是浏览器本机存储空间不足。", "failed", {
      snapshotId: snapshot.id,
      autoSnapshotId: autoSnapshot?.id || "",
      error: String(error?.message || error || "")
    });
    setHistoryStatus("恢复快照失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function deleteLayoutSnapshot(id) {
  const snapshot = layoutHistory.find((item) => item.id === id);
  const before = layoutHistory.length;
  layoutHistory = layoutHistory.filter((snapshot) => snapshot.id !== id);
  saveLayoutHistory();
  renderHistoryPanel();
  const deleted = before !== layoutHistory.length;
  if (deleted && snapshot) {
    recordAdminOperation("snapshot-delete", snapshot.label, `删除主场景快照：${snapshot.label}`, "ok", {
      snapshotId: snapshot.id,
      stats: snapshot.stats
    });
  }
  setHistoryStatus(deleted ? `已删除快照：${snapshot?.label || id}` : "未找到要删除的快照。", deleted ? "success" : "error");
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
    return normalizePublishedRecord(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.warn("Published main scene layout could not be loaded.", error);
    return normalizePublishedRecord(null);
  }
}

function publishLayoutToFront() {
  if (!ensureAdminPermission("publish", "发布到前台")) {
    return;
  }
  const currentRecord = loadPublishedLayoutRecord();
  const release = createPublishRelease({
    note: readPublishNote(),
    sourceLayout: layout,
    action: "publish",
    existingReleases: currentRecord.releases
  });
  const record = buildPublishedRecord(release, [release, ...currentRecord.releases]);

  try {
    createLayoutSnapshot("发布前快照", { notice: false, status: false });
    window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(record));
    if (publishNoteInput) publishNoteInput.value = "";
    renderPublishPanel();
    recordAdminOperation("publish-local", "主场景前台", `发布主场景到前台：v${release.releaseNumber}。`, "ok", {
      releaseId: release.id,
      releaseNumber: release.releaseNumber,
      stats: release.stats
    });
    showNotice(`当前主场景草稿已发布到前台：v${release.releaseNumber}。`);
  } catch (error) {
    console.warn("Published main scene layout could not be saved.", error);
    recordAdminOperation("publish-local", "主场景前台", "发布主场景到前台失败。", "failed", {
      message: error?.message || String(error)
    });
    setPublishStatus("发布失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function renderPublishPanel() {
  const record = loadPublishedLayoutRecord();

  if (!record?.layout) {
    setPublishStatus("尚未发布。正式前台会临时读取当前草稿布局。", "normal");
    renderPublishDiff(record);
    renderPublishHistory(record);
    renderRemotePublishPanel(record);
    renderAdminBoundaryPanel(record);
    return;
  }

  const stats = normalizeSnapshotStats(record.stats, normalizeSnapshotLayout(record.layout));
  const note = record.note ? ` · ${record.note}` : "";
  setPublishStatus(`已发布 v${record.releaseNumber || 1}：${formatDateTime(record.publishedAt)} · ${formatSnapshotStats(stats)}${note}`, "success");
  renderPublishDiff(record);
  renderPublishHistory(record);
  renderRemotePublishPanel(record);
  renderAdminBoundaryPanel(record);
}

function renderRemotePublishPanel(record = loadPublishedLayoutRecord()) {
  const adapter = window.MRProjectRemotePublish;
  const hasLocalRelease = Boolean(record?.layout);
  const context = createRemotePublishContext(record);
  const status = adapter?.getStatus?.("mainScene", { ...context, hasLocalRelease });
  const workflow = adapter?.getWorkflow?.("mainScene", context);
  const config = adapter?.getConfig?.("mainScene");
  const receiptAudit = adapter?.getReceiptAudit?.("mainScene");

  if (remotePublishStatus) {
    remotePublishStatus.textContent = status
      ? `${status.message} ${status.boundary}`
      : "远端发布 adapter 尚未加载。";
    remotePublishStatus.dataset.remoteTone = status?.tone || "idle";
  }
  if (remotePublishReviewStatus) {
    remotePublishReviewStatus.textContent = workflow
      ? workflow.message
      : "远端发布工作流尚未加载。";
    remotePublishReviewStatus.dataset.workflowTone = workflow?.tone || "idle";
  }
  if (remotePublishEndpointInput && document.activeElement !== remotePublishEndpointInput) {
    remotePublishEndpointInput.value = config?.endpoint || "";
  }
  if (remotePublishTokenInput && document.activeElement !== remotePublishTokenInput) {
    remotePublishTokenInput.value = config?.token || "";
  }
  if (remotePublishWorkspaceInput && document.activeElement !== remotePublishWorkspaceInput) {
    remotePublishWorkspaceInput.value = config?.workspaceId || "local-browser";
  }
  if (remotePublishSaveButton) {
    remotePublishSaveButton.disabled = !adapter;
  }
  if (remotePublishCheckButton) {
    remotePublishCheckButton.disabled = !adapter || !status?.remoteConfigured;
  }
  if (remotePublishPushButton) {
    remotePublishPushButton.disabled = !adapter || !status?.remoteConfigured || !hasLocalRelease || !workflow?.canPush;
  }
  if (remotePublishRevokeButton) {
    remotePublishRevokeButton.disabled = !adapter || !status?.remoteConfigured || !status?.canRevoke;
  }
  if (remotePublishRequestReviewButton) {
    remotePublishRequestReviewButton.disabled = !adapter || !hasLocalRelease || !workflow?.canRequestReview;
  }
  if (remotePublishApproveReviewButton) {
    remotePublishApproveReviewButton.disabled = !adapter || !workflow?.canApprove;
  }
  if (remotePublishRejectReviewButton) {
    remotePublishRejectReviewButton.disabled = !adapter || !workflow?.canReject;
  }
  if (remotePublishUnlockButton) {
    remotePublishUnlockButton.disabled = !adapter || !workflow?.canUnlock;
  }
  renderRemotePublishReceipts(receiptAudit);
  applyAdminPermissionState();
}

function renderRemotePublishReceipts(audit) {
  const receipts = Array.isArray(audit?.receipts) ? audit.receipts : [];
  if (remotePublishReceiptStatus) {
    remotePublishReceiptStatus.textContent = audit?.message || "暂无远端发布回执。";
    remotePublishReceiptStatus.dataset.receiptTone = receipts.length ? "ready" : "idle";
  }
  if (remotePublishReceiptExportButton) {
    remotePublishReceiptExportButton.disabled = !receipts.length;
  }
  if (!remotePublishReceiptList) {
    return;
  }
  remotePublishReceiptList.replaceChildren();
  receipts.slice(0, 5).forEach((receipt) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = receipt.packageId || receipt.releaseId || "远端回执";
    const meta = document.createElement("span");
    const digest = receipt.receiptDigest || receipt.packageDigest || "";
    const signatureCount = Number(receipt.assetSignatureSummary?.signedAssetCount || 0);
    const signatureMeta = signatureCount ? ` · 资产签名 ${signatureCount}` : "";
    const uploadCount = Number(receipt.cdnUploadSummary?.uploadedUrlCount || 0);
    const uploadMeta = uploadCount ? ` · CDN ${uploadCount}` : "";
    const purgeCount = Number(receipt.cdnPurgeSummary?.purgedUrlCount || 0);
    const purgeMeta = purgeCount ? ` · purge ${purgeCount}` : "";
    const verificationMeta = ` · ${formatRemotePublishReceiptVerificationStatus(receipt.verificationStatus)}`;
    meta.textContent = `${receipt.direction === "revoke" ? "撤销" : "发布"} · 空间 ${receipt.workspaceId || audit?.workspaceId || "local-browser"} · ${formatDateTime(receipt.acceptedAt || receipt.pushedAt || receipt.revokedAt)} · ${digest ? digest.slice(0, 12) : "摘要未知"}${verificationMeta}${signatureMeta}${uploadMeta}${purgeMeta}`;
    const message = document.createElement("small");
    message.textContent = receipt.message || receipt.remoteVersion || "远端已接收。";
    item.append(title, meta, message);
    remotePublishReceiptList.appendChild(item);
  });
}

function renderAdminBoundaryPanel(record = loadPublishedLayoutRecord()) {
  if (!adminBoundaryList) {
    return;
  }

  const adapter = window.MRProjectRemotePublish;
  const hasLocalRelease = Boolean(record?.layout);
  const context = createRemotePublishContext(record);
  const remoteStatus = adapter?.getStatus?.("mainScene", { ...context, hasLocalRelease });
  const receiptAudit = adapter?.getReceiptAudit?.("mainScene");
  const projectRemote = window.MRProjectArchive?.getProjectRepositoryRemoteStatus?.();
  const projectReceiptAudit = window.MRProjectArchive?.getProjectRepositoryReceiptAudit?.();
  const operatorAudit = window.MRAdminAudit?.getStatus?.(ADMIN_AUDIT_SCOPE);
  const accessStatus = window.MRAdminAudit?.getAccessStatus?.(ADMIN_AUDIT_SCOPE);
  const draftStats = getLayoutStats(layout);
  const releaseCount = Array.isArray(record?.releases) ? record.releases.length : 0;
  const remoteConfiguredCount = [remoteStatus, projectRemote].filter((item) => item?.remoteConfigured).length;
  const receiptCount = Number(receiptAudit?.total || 0) + Number(projectReceiptAudit?.total || projectRemote?.receiptCount || 0);
  const verifiedCount = Number(receiptAudit?.verifiedCount || 0) + Number(projectReceiptAudit?.verifiedCount || 0);
  const rows = [
    {
      label: "本机编辑",
      state: draftStats.objectCount ? "ready" : "idle",
      detail: `${draftStats.objectCount} 个主场景对象，含 ${draftStats.customCount} 个基础物体、${draftStats.importedCount} 个导入模型；草稿写入本机 localStorage/IndexedDB。`
    },
    {
      label: "前台发布",
      state: hasLocalRelease ? "ready" : "idle",
      detail: hasLocalRelease
        ? `已发布本机前台 v${record.releaseNumber || 1}，发布历史 ${releaseCount} 个版本。`
        : "尚未生成本机前台发布版本，前台会临时读取当前草稿。"
    },
    {
      label: "远端 Adapter",
      state: remoteConfiguredCount ? "ready" : "idle",
      detail: remoteConfiguredCount
        ? `已配置 ${remoteConfiguredCount} 个远端接口；本机校验通过 ${verifiedCount}/${receiptCount} 条发布/项目回执。`
        : "远端发布和项目仓库 API 尚未配置；当前只保留本机草稿、发布版本和项目档案。"
    },
    {
      label: "本机门禁",
      state: accessStatus?.unlocked ? "ready" : "idle",
      detail: accessStatus
        ? `${accessStatus.unlocked ? "已解锁" : "已锁定"}；会话保存在 ${accessStatus.storage}，${accessStatus.durationMinutes} 分钟后过期。`
        : "本机后台访问门禁脚本未载入。"
    },
    {
      label: "本机审计",
      state: operatorAudit ? (operatorAudit.count ? "ready" : "idle") : "missing",
      detail: operatorAudit
        ? `操作者：${operatorAudit.operator.name} / ${operatorAudit.operator.roleLabel}；已记录 ${operatorAudit.count} 条本机后台操作，可导出 HTML。`
        : "本机后台操作审计脚本未载入。"
    },
    {
      label: "生产后台",
      state: "missing",
      detail: "未接入账号登录、角色权限、多人协作 CMS、生产 CDN、服务端资产回收和不可篡改审计。"
    }
  ];

  if (adminBoundaryStatus) {
    adminBoundaryStatus.textContent = remoteConfiguredCount
      ? `${remoteConfiguredCount} 个远端接口已配置，生产后台仍未接入。`
      : "当前为本机静态后台，生产后台未接入。";
  }
  adminBoundaryList.replaceChildren(...rows.map(createAdminBoundaryItem));
}

function createAdminBoundaryItem(item) {
  const li = document.createElement("li");
  li.dataset.boundaryState = item.state;
  const label = document.createElement("strong");
  label.textContent = item.label;
  const detail = document.createElement("span");
  detail.textContent = item.detail;
  li.append(label, detail);
  return li;
}

function renderAdminAccessPanel() {
  const access = window.MRAdminAudit?.getAccessStatus?.(ADMIN_AUDIT_SCOPE);
  if (!adminAccessStatus || !access) {
    return;
  }
  adminAccessStatus.textContent = access.message;
  adminAccessStatus.dataset.accessState = access.unlocked ? "unlocked" : "locked";
  if (adminAccessUnlockButton) {
    adminAccessUnlockButton.disabled = Boolean(access.unlocked);
  }
  if (adminAccessLockButton) {
    adminAccessLockButton.disabled = !access.unlocked;
  }
}

function renderAdminOperatorPanel() {
  if (!adminOperatorStatus || !adminAuditList) {
    return;
  }

  const audit = window.MRAdminAudit?.getStatus?.(ADMIN_AUDIT_SCOPE);
  if (!audit) {
    adminOperatorStatus.textContent = "后台操作审计脚本未载入。";
    return;
  }

  if (adminOperatorNameInput && document.activeElement !== adminOperatorNameInput) {
    adminOperatorNameInput.value = audit.operator.name;
  }
  if (adminOperatorRoleSelect && document.activeElement !== adminOperatorRoleSelect) {
    adminOperatorRoleSelect.value = audit.operator.role;
  }
  adminOperatorStatus.textContent = `${audit.operator.name} / ${audit.operator.roleLabel} · ${audit.count} 条本机审计`;
  adminAuditList.innerHTML = "";
  renderAdminAccessPanel();

  const records = audit.records.slice(0, 3);
  if (!records.length) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = "暂无操作审计";
    const detail = document.createElement("span");
    detail.textContent = "保存操作者、确认边界、保存快照或发布后会写入本机审计。";
    item.append(title, detail);
    adminAuditList.appendChild(item);
    applyAdminPermissionState(audit);
    return;
  }

  records.forEach((record) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${record.actionLabel} · ${record.result === "failed" ? "失败" : "成功"}`;
    const detail = document.createElement("span");
    detail.textContent = `${formatDateTime(record.createdAt)} · ${record.operator.name} · ${record.target}${record.detail ? ` · ${record.detail}` : ""}`;
    item.append(title, detail);
    adminAuditList.appendChild(item);
  });
  applyAdminPermissionState(audit);
}

function getAdminPermissionControls() {
  return [
    { element: xInput, permission: "edit" },
    { element: yInput, permission: "edit" },
    { element: zInput, permission: "edit" },
    { element: rotXInput, permission: "edit" },
    { element: rotYInput, permission: "edit" },
    { element: rotZInput, permission: "edit" },
    { element: scaleInput, permission: "edit" },
    { element: ambientLightInput, permission: "edit" },
    { element: envLightInput, permission: "edit" },
    { element: keyLightInput, permission: "edit" },
    { element: rimLightInput, permission: "edit" },
    { element: exposureInput, permission: "edit" },
    { element: newObjectNameInput, permission: "edit" },
    { element: newObjectTypeSelect, permission: "edit" },
    { element: newObjectColorInput, permission: "edit" },
    { element: newObjectWidthInput, permission: "edit" },
    { element: newObjectHeightInput, permission: "edit" },
    { element: newObjectDepthInput, permission: "edit" },
    { element: newObjectRadiusInput, permission: "edit" },
    { element: importModelNameInput, permission: "import" },
    { element: importModelColorInput, permission: "edit" },
    { element: importModelOpacityInput, permission: "edit" },
    { element: importModelRoughnessInput, permission: "edit" },
    { element: importModelMetalnessInput, permission: "edit" },
    { element: saveButton, permission: "edit" },
    { element: resetButton, permission: "edit" },
    { element: deleteButton, permission: "delete" },
    { element: restoreButton, permission: "delete" },
    { element: resetAllButton, permission: "delete" },
    { element: snapshotCreateButton, permission: "edit" },
    { element: newObjectAddButton, permission: "edit" },
    { element: newObjectUpdateButton, permission: "edit" },
    { element: importModelInput, permission: "import" },
    { element: importModelReplaceInput, permission: "import" },
    { element: importModelTextureInput, permission: "import" },
    { element: importModelTextureClearButton, permission: "import" },
    { element: importModelMaterialUpdateButton, permission: "edit" },
    { element: importAuditCleanupButton, permission: "delete" },
    { element: lightResetButton, permission: "edit" },
    { element: layerBatchHideButton, permission: "edit" },
    { element: layerBatchShowButton, permission: "edit" },
    { element: layerBatchLockButton, permission: "edit" },
    { element: layerBatchUnlockButton, permission: "edit" },
    { element: layerBatchClearButton, permission: "delete" },
    { element: publishLayoutButton, permission: "publish" },
    { element: remotePublishSaveButton, permission: "remote" },
    { element: remotePublishCheckButton, permission: "remote" },
    { element: remotePublishPushButton, permission: "remote" },
    { element: remotePublishRevokeButton, permission: "remote" },
    { element: remotePublishRequestReviewButton, permission: "remote" },
    { element: remotePublishApproveReviewButton, permission: "approve" },
    { element: remotePublishRejectReviewButton, permission: "approve" },
    { element: remotePublishUnlockButton, permission: "approve" },
    { element: document.getElementById("projectImportFile"), permission: "import" },
    { element: document.getElementById("projectImportConfirm"), permission: "delete" },
    { element: document.getElementById("projectRepositorySaveRemote"), permission: "remote" },
    { element: document.getElementById("projectRepositoryCheckRemote"), permission: "remote" },
    { element: document.getElementById("projectRepositoryPushRemote"), permission: "remote" },
    { element: document.getElementById("projectRepositoryPullRemote"), permission: "remote" }
  ];
}

function adminCanPerform(permission) {
  return window.MRAdminAudit?.canPerform?.(ADMIN_AUDIT_SCOPE, permission) !== false;
}

function setAdminPermissionState(element, permission, audit = window.MRAdminAudit?.getStatus?.(ADMIN_AUDIT_SCOPE)) {
  if (!element) {
    return;
  }

  const allowed = adminCanPerform(permission);
  element.dataset.adminPermission = permission;
  element.dataset.adminPermissionState = allowed ? "allowed" : "blocked";
  if (!allowed) {
    if (element.dataset.adminRoleBlocked !== "true") {
      element.dataset.adminRolePreviousDisabled = element.disabled ? "1" : "0";
      element.dataset.adminRolePreviousTitle = element.title || "";
    }
    element.dataset.adminRoleBlocked = "true";
    element.disabled = true;
    element.title = `${audit?.operator?.roleLabel || "当前角色"}无权执行${audit?.permissionLabels?.[permission] || permission}。`;
    return;
  }
  if (element.dataset.adminRoleBlocked === "true") {
    element.disabled = element.dataset.adminRolePreviousDisabled === "1";
    element.title = element.dataset.adminRolePreviousTitle || "";
    delete element.dataset.adminRoleBlocked;
    delete element.dataset.adminRolePreviousDisabled;
    delete element.dataset.adminRolePreviousTitle;
  }
}

function applySnapshotPermissionState(audit = window.MRAdminAudit?.getStatus?.(ADMIN_AUDIT_SCOPE)) {
  snapshotList?.querySelectorAll("[data-snapshot-action='restore']").forEach((button) => {
    setAdminPermissionState(button, "edit", audit);
  });
  snapshotList?.querySelectorAll("[data-snapshot-action='delete']").forEach((button) => {
    setAdminPermissionState(button, "delete", audit);
  });
}

function applyAdminPermissionState(audit = window.MRAdminAudit?.getStatus?.(ADMIN_AUDIT_SCOPE)) {
  if (adminPermissionStatus && audit) {
    adminPermissionStatus.textContent = audit.permissionSummary || "已读取本机角色权限。";
    adminPermissionStatus.dataset.permissionRole = audit.operator.role;
  }

  getAdminPermissionControls().forEach(({ element, permission }) => {
    if (!element) {
      return;
    }
    setAdminPermissionState(element, permission, audit);
  });
  applySnapshotPermissionState(audit);
  renderAdminAccessPanel();
}

function ensureAdminPermission(permission, actionLabel) {
  if (adminCanPerform(permission)) {
    return true;
  }
  const audit = window.MRAdminAudit?.getStatus?.(ADMIN_AUDIT_SCOPE);
  const permissionLabel = audit?.permissionLabels?.[permission] || permission;
  const roleLabel = audit?.operator?.roleLabel || "当前角色";
  const message = `${roleLabel}无权执行${actionLabel || permissionLabel}。`;
  recordAdminOperation("permission-blocked", actionLabel || permissionLabel, message, "blocked", {
    permission,
    role: audit?.operator?.role || ""
  });
  showNotice(message);
  return false;
}

function saveAdminOperator() {
  const audit = window.MRAdminAudit;
  if (!audit) {
    showNotice("后台操作审计脚本未载入。");
    return;
  }
  const result = audit.configureOperator(ADMIN_AUDIT_SCOPE, {
    name: adminOperatorNameInput?.value || "",
    role: adminOperatorRoleSelect?.value || "local-admin"
  });
  if (result.ok) {
    audit.record(ADMIN_AUDIT_SCOPE, {
      action: "operator-save",
      actionLabel: "保存操作者",
      target: "本机后台",
      detail: `操作者设置为 ${result.operator.name} / ${result.operator.roleLabel}。`
    });
    showNotice("已保存本机后台操作者。");
  } else {
    showNotice(result.message || "保存本机后台操作者失败。");
  }
  renderAdminOperatorPanel();
  updateUiState();
  renderAdminBoundaryPanel();
}

function unlockAdminAccess() {
  const audit = window.MRAdminAudit;
  if (!audit) {
    showNotice("后台访问门禁脚本未载入。");
    return;
  }
  const result = audit.unlockAccess(ADMIN_AUDIT_SCOPE, adminAccessCodeInput?.value || "");
  if (result.ok && result.unlocked) {
    recordAdminOperation("access-unlock", "主场景后台", "解锁主场景后台本机会话。", "ok", {
      expiresAt: result.expiresAt
    });
    if (adminAccessCodeInput) {
      adminAccessCodeInput.value = "";
    }
  }
  showNotice(result.message || "本机后台会话解锁失败。");
  renderAdminAccessPanel();
  updateUiState();
  renderAdminBoundaryPanel();
}

function lockAdminAccess() {
  const audit = window.MRAdminAudit;
  if (!audit) {
    showNotice("后台访问门禁脚本未载入。");
    return;
  }
  const result = audit.lockAccess(ADMIN_AUDIT_SCOPE);
  recordAdminOperation("access-lock", "主场景后台", result.message || "锁定主场景后台本机会话。", result.ok ? "ok" : "failed");
  showNotice(result.message || "本机后台会话锁定失败。");
  renderAdminAccessPanel();
  updateUiState();
  renderAdminBoundaryPanel();
}

function recordAdminOperation(action, target, detail, result = "ok", metadata = {}) {
  const audit = window.MRAdminAudit;
  if (!audit) {
    return null;
  }
  const record = audit.record(ADMIN_AUDIT_SCOPE, {
    action,
    actionLabel: ADMIN_AUDIT_ACTION_LABELS[action] || action,
    target,
    detail,
    result,
    metadata
  });
  renderAdminOperatorPanel();
  renderAdminBoundaryPanel();
  return record;
}

function exportAdminOperationAudit() {
  const audit = window.MRAdminAudit;
  const exportResult = audit?.getExport?.(ADMIN_AUDIT_SCOPE);
  if (!exportResult?.ok) {
    showNotice(exportResult?.message || "暂无后台操作审计记录可导出。");
    renderAdminOperatorPanel();
    return;
  }
  const blob = new Blob([exportResult.html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportResult.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showNotice("已导出主后台本机操作审计。");
}

function formatRemotePublishReceiptVerificationStatus(status) {
  const labels = {
    verified: "本机校验通过",
    "workspace-mismatch": "空间不匹配",
    "scene-mismatch": "场景不匹配",
    "digest-mismatch": "摘要不匹配"
  };
  return labels[status] || "未校验";
}

function createRemotePublishContext(record = loadPublishedLayoutRecord()) {
  const releases = Array.isArray(record?.releases) ? record.releases : [];
  const release = releases.find((item) => item?.id === record?.currentReleaseId) || releases[0] || record;
  return {
    sceneLabel: "主场景",
    storageKey: PUBLISHED_KEY,
    record,
    release
  };
}

function recordRemotePublishOperation(action, result, fallbackDetail, metadata = {}) {
  const status = result?.status || {};
  const workflow = result?.workflow || {};
  const current = workflow.current || {};
  const receipt = status.latestReceipt || {};
  recordAdminOperation(
    action,
    "主场景远端发布",
    result?.message || fallbackDetail,
    result?.ok ? "ok" : "failed",
    {
      workspaceId: status.workspaceId || metadata.workspaceId || remotePublishWorkspaceInput?.value || "local-browser",
      releaseId: current.releaseId || receipt.releaseId || metadata.releaseId || "",
      packageDigest: current.packageDigest || receipt.packageDigest || metadata.packageDigest || "",
      packageId: receipt.packageId || status.lastPackageId || metadata.packageId || "",
      direction: receipt.direction || metadata.direction || ""
    }
  );
}

function saveRemotePublishConfig() {
  const result = window.MRProjectRemotePublish?.configure?.("mainScene", {
    endpoint: remotePublishEndpointInput?.value || "",
    token: remotePublishTokenInput?.value || "",
    workspaceId: remotePublishWorkspaceInput?.value || ""
  });
  renderRemotePublishPanel();
  showNotice(result?.message || "远端发布配置保存失败。");
}

async function checkRemotePublishApi() {
  setRemotePublishBusy(true);
  try {
    const result = await window.MRProjectRemotePublish?.check?.("mainScene");
    recordRemotePublishOperation("remote-publish-check", result, "检查主场景远端发布 API。");
    showNotice(result?.message || "远端发布 API 检查失败。");
  } catch (error) {
    recordRemotePublishOperation("remote-publish-check", { ok: false, message: error?.message || "网络请求异常" }, "检查主场景远端发布 API 失败。");
    showNotice(`远端发布 API 检查失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setRemotePublishBusy(false);
    renderRemotePublishPanel();
  }
}

async function pushRemotePublishedLayout() {
  const record = loadPublishedLayoutRecord();
  const context = createRemotePublishContext(record);
  setRemotePublishBusy(true);
  try {
    const result = await window.MRProjectRemotePublish?.push?.("mainScene", {
      ...context
    });
    recordRemotePublishOperation("remote-publish-push", result, "推送主场景远端发布包。", {
      releaseId: context.release?.id || ""
    });
    showNotice(result?.message || "远端发布包推送失败。");
  } catch (error) {
    recordRemotePublishOperation("remote-publish-push", { ok: false, message: error?.message || "网络请求异常" }, "推送主场景远端发布包失败。", {
      releaseId: context.release?.id || ""
    });
    showNotice(`远端发布包推送失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setRemotePublishBusy(false);
    renderRemotePublishPanel(record);
  }
}

async function revokeRemotePublishedLayout() {
  setRemotePublishBusy(true);
  try {
    const result = await window.MRProjectRemotePublish?.revoke?.("mainScene", {
      sceneLabel: "主场景",
      reason: publishNoteInput?.value || "local-user-revoked-remote-publish"
    });
    recordRemotePublishOperation("remote-publish-revoke", result, "撤销主场景远端发布。", {
      direction: "revoke"
    });
    showNotice(result?.message || "远端发布撤销失败。");
  } catch (error) {
    recordRemotePublishOperation("remote-publish-revoke", { ok: false, message: error?.message || "网络请求异常" }, "撤销主场景远端发布失败。", {
      direction: "revoke"
    });
    showNotice(`远端发布撤销失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setRemotePublishBusy(false);
    renderRemotePublishPanel();
  }
}

function requestRemotePublishReview() {
  const record = loadPublishedLayoutRecord();
  const result = window.MRProjectRemotePublish?.requestReview?.("mainScene", {
    ...createRemotePublishContext(record),
    note: publishNoteInput?.value || ""
  });
  recordRemotePublishOperation("remote-review-request", result, "提交主场景远端发布审核。");
  renderRemotePublishPanel(record);
  showNotice(result?.message || "远端发布审核提交失败。");
}

function approveRemotePublishReview() {
  if (!ensureAdminPermission("approve", "通过远端审核")) {
    return;
  }
  const record = loadPublishedLayoutRecord();
  const result = window.MRProjectRemotePublish?.approveReview?.("mainScene", {
    ...createRemotePublishContext(record),
    note: publishNoteInput?.value || ""
  });
  recordRemotePublishOperation("remote-review-approve", result, "通过主场景远端发布审核。");
  renderRemotePublishPanel(record);
  showNotice(result?.message || "远端发布审核通过失败。");
}

function rejectRemotePublishReview() {
  if (!ensureAdminPermission("approve", "退回远端审核")) {
    return;
  }
  const record = loadPublishedLayoutRecord();
  const result = window.MRProjectRemotePublish?.rejectReview?.("mainScene", {
    ...createRemotePublishContext(record),
    reason: publishNoteInput?.value || ""
  });
  recordRemotePublishOperation("remote-review-reject", result, "退回主场景远端发布审核。");
  renderRemotePublishPanel(record);
  showNotice(result?.message || "远端发布审核退回失败。");
}

function unlockRemotePublish() {
  if (!ensureAdminPermission("approve", "解除远端发布锁")) {
    return;
  }
  const record = loadPublishedLayoutRecord();
  const result = window.MRProjectRemotePublish?.unlock?.("mainScene", createRemotePublishContext(record));
  recordRemotePublishOperation("remote-review-unlock", result, "解除主场景远端发布锁。");
  renderRemotePublishPanel(record);
  showNotice(result?.message || "远端发布锁解除失败。");
}

function exportRemotePublishReceipts() {
  const result = window.MRProjectRemotePublish?.getReceiptAuditExport?.("mainScene");
  if (!result?.ok) {
    showNotice(result?.message || "暂无可导出的远端发布回执。");
    renderRemotePublishPanel();
    return;
  }
  downloadHtmlFile(result.html, result.filename);
  showNotice(result.message || "已导出远端发布回执审计。");
}

function downloadHtmlFile(html, filename) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "mr-calligraphy-remote-receipts.html";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setRemotePublishBusy(isBusy) {
  [
    remotePublishSaveButton,
    remotePublishWorkspaceInput,
    remotePublishCheckButton,
    remotePublishPushButton,
    remotePublishRevokeButton,
    remotePublishRequestReviewButton,
    remotePublishApproveReviewButton,
    remotePublishRejectReviewButton,
    remotePublishUnlockButton,
    remotePublishReceiptExportButton
  ].forEach((button) => {
    if (button) {
      button.disabled = Boolean(isBusy);
    }
  });
}

function setPublishStatus(message, tone = "normal") {
  if (!publishStatus) {
    return;
  }

  publishStatus.textContent = message;
  publishStatus.dataset.tone = tone;
}

function renderPublishDiff(record = loadPublishedLayoutRecord()) {
  if (!publishDiffSummary || !publishDiffList) {
    return;
  }

  const diff = createMainPublishDiff(normalizeSnapshotLayout(layout), record?.layout ? normalizeSnapshotLayout(record.layout) : null);
  publishDiffSummary.textContent = diff.summary;
  publishDiffList.innerHTML = "";
  diff.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    publishDiffList.appendChild(li);
  });
}

function createMainPublishDiff(draftLayout, publishedLayout) {
  const draftIndex = createMainLayoutDiffIndex(draftLayout);
  const publishedIndex = publishedLayout ? createMainLayoutDiffIndex(publishedLayout) : new Map();
  const added = [];
  const changed = [];
  const removed = [];

  draftIndex.forEach((draftItem, key) => {
    const publishedItem = publishedIndex.get(key);
    if (!publishedItem) {
      added.push(draftItem);
      return;
    }
    if (draftItem.signature !== publishedItem.signature) {
      changed.push(createDiffChangeItem(draftItem, publishedItem));
    }
  });

  publishedIndex.forEach((publishedItem, key) => {
    if (!draftIndex.has(key)) {
      removed.push(publishedItem);
    }
  });

  const total = added.length + changed.length + removed.length;
  if (!publishedLayout) {
    return {
      summary: draftIndex.size ? `尚未发布：将首次发布 ${draftIndex.size} 项草稿内容。` : "尚未发布：当前草稿没有可发布差异。",
      items: draftIndex.size ? formatDiffItems("新增", [...draftIndex.values()]) : ["当前草稿为空。"]
    };
  }

  return {
    summary: total ? `待发布差异：${added.length} 新增 / ${changed.length} 修改 / ${removed.length} 删除。` : "当前草稿与已发布版本一致。",
    items: total ? [
      ...formatDiffItems("新增", added),
      ...formatDiffItems("修改", changed),
      ...formatDiffItems("删除", removed)
    ].slice(0, 8) : ["无需发布新版本。"]
  };
}

function createMainLayoutDiffIndex(layoutValue) {
  const normalized = normalizeSnapshotLayout(layoutValue);
  const index = new Map();
  const customById = new Map(normalized.customObjects.map((item) => [item.id, item]));
  const importedById = new Map(normalized.importedModels.map((item) => [item.id, item]));

  Object.entries(normalized.objects || {}).forEach(([id, state]) => {
    if (customById.has(id) || importedById.has(id)) return;
    index.set(`object:${id}`, createDiffItem("基础物体", id, id, state));
  });

  normalized.customObjects.forEach((item) => {
    const state = normalized.objects?.[item.id] || {};
    index.set(`custom:${item.id}`, createDiffItem("自定义物体", item.id, item.label || item.id, { item, state }));
  });

  normalized.importedModels.forEach((item) => {
    const state = normalized.objects?.[item.id] || {};
    index.set(`imported:${item.id}`, createDiffItem("导入模型", item.id, item.label || item.fileName || item.id, { item, state }));
  });

  index.set("lighting:scene", createDiffItem("灯光", "lighting", "灯光参数", normalized.lighting || {}));
  index.set("layers:order", createDiffItem("图层", "layer-order", "图层顺序", normalized.layerOrder || []));
  return index;
}

function createDiffItem(kind, id, label, value) {
  return {
    kind,
    id,
    label,
    value,
    signature: stableStringify(value)
  };
}

function createDiffChangeItem(draftItem, publishedItem) {
  return {
    ...draftItem,
    previousValue: publishedItem.value,
    detail: describeDiffChange(draftItem, publishedItem)
  };
}

function formatDiffItems(action, items) {
  return items.map((item) => {
    const detail = item.detail || describeDiffSnapshot(action, item);
    return detail
      ? `${action}：${item.kind} · ${item.label}（${detail}）`
      : `${action}：${item.kind} · ${item.label}`;
  });
}

function describeDiffChange(draftItem, publishedItem) {
  if (draftItem.kind === "导入模型") {
    return describeImportedModelChange(publishedItem.value, draftItem.value);
  }
  return "";
}

function describeDiffSnapshot(action, item) {
  if (item.kind !== "导入模型") {
    return "";
  }
  return describeImportedModelSnapshot(item.value, action === "删除");
}

function describeImportedModelSnapshot(value, isRemoved = false) {
  const record = value?.item || {};
  const state = value?.state || {};
  const parts = [
    record.fileName ? `文件 ${record.fileName}` : "",
    record.sha256 ? `SHA ${shortDiffHash(record.sha256)}` : "",
    formatImportedTextureSnapshot(record.texture),
    record.color ? `颜色 ${record.color}` : "",
    `透明度 ${formatDiffNumber(normalizeImportOpacity(record.opacity), 2)}`,
    `粗糙度 ${formatDiffNumber(normalizeImportRoughness(record.roughness), 2)}`,
    `金属度 ${formatDiffNumber(normalizeImportMetalness(record.metalness), 2)}`,
    formatImportedStateSnapshot(state)
  ].filter(Boolean);

  if (isRemoved) {
    parts.unshift("将从发布版本移除");
  }
  return parts.slice(0, 8).join("；");
}

function describeImportedModelChange(previousValue, nextValue) {
  const previous = previousValue?.item || {};
  const next = nextValue?.item || {};
  const previousState = previousValue?.state || {};
  const nextState = nextValue?.state || {};
  const changes = [];

  appendTextDiff(changes, "名称", previous.label, next.label);
  appendTextDiff(changes, "文件", previous.fileName, next.fileName);
  if (normalizeSha256(previous.sha256) !== normalizeSha256(next.sha256)) {
    changes.push(`SHA ${shortDiffHash(previous.sha256)} → ${shortDiffHash(next.sha256)}`);
  }
  appendImportedTextureDiff(changes, previous.texture, next.texture);
  appendTextDiff(changes, "颜色", previous.color, next.color);
  appendNumberDiff(changes, "透明度", normalizeImportOpacity(previous.opacity), normalizeImportOpacity(next.opacity), 2);
  appendNumberDiff(changes, "粗糙度", normalizeImportRoughness(previous.roughness), normalizeImportRoughness(next.roughness), 2);
  appendNumberDiff(changes, "金属度", normalizeImportMetalness(previous.metalness), normalizeImportMetalness(next.metalness), 2);
  appendStateDiffs(changes, previousState, nextState);

  return changes.slice(0, 8).join("；");
}

function formatImportedTextureSnapshot(texture) {
  const normalized = normalizeImportTextureRecord(texture);
  if (!normalized) {
    return "";
  }
  const hash = normalized.sha256 ? ` · SHA ${shortDiffHash(normalized.sha256)}` : "";
  return `贴图 ${normalized.fileName}${hash}`;
}

function appendImportedTextureDiff(changes, previousTexture, nextTexture) {
  const previous = normalizeImportTextureRecord(previousTexture);
  const next = normalizeImportTextureRecord(nextTexture);
  const beforeName = previous?.fileName || "";
  const afterName = next?.fileName || "";

  if (beforeName !== afterName) {
    changes.push(`贴图 ${beforeName || "空"} → ${afterName || "空"}`);
    return;
  }
  if ((previous?.sha256 || "") !== (next?.sha256 || "")) {
    changes.push(`贴图SHA ${shortDiffHash(previous?.sha256)} → ${shortDiffHash(next?.sha256)}`);
  }
}

function appendTextDiff(changes, label, previous, next) {
  const before = String(previous || "");
  const after = String(next || "");
  if (before !== after) {
    changes.push(`${label} ${before || "空"} → ${after || "空"}`);
  }
}

function appendNumberDiff(changes, label, previous, next, digits = 2) {
  const before = Number(previous);
  const after = Number(next);
  if (!Number.isFinite(before) || !Number.isFinite(after) || Math.abs(before - after) < 10 ** -digits) {
    return;
  }
  changes.push(`${label} ${formatDiffNumber(before, digits)} → ${formatDiffNumber(after, digits)}`);
}

function appendStateDiffs(changes, previousState, nextState) {
  [
    ["X", "x", 2],
    ["Y", "y", 2],
    ["Z", "z", 2],
    ["旋转X", "rx", 1],
    ["旋转Y", "ry", 1],
    ["旋转Z", "rz", 1],
    ["缩放", "scale", 2]
  ].forEach(([label, key, digits]) => {
    if (previousState[key] === undefined && nextState[key] === undefined) {
      return;
    }
    appendNumberDiff(changes, label, readNumber(previousState[key], 0), readNumber(nextState[key], 0), digits);
  });
  [
    ["隐藏", "hidden"],
    ["锁定", "locked"],
    ["删除", "deleted"]
  ].forEach(([label, key]) => appendBooleanDiff(changes, label, previousState[key], nextState[key]));
}

function appendBooleanDiff(changes, label, previous, next) {
  const before = previous === true;
  const after = next === true;
  if (before !== after) {
    changes.push(`${label} ${before ? "是" : "否"} → ${after ? "是" : "否"}`);
  }
}

function formatImportedStateSnapshot(state = {}) {
  const hasPosition = state.x !== undefined || state.y !== undefined || state.z !== undefined;
  const hasScale = state.scale !== undefined;
  const parts = [];

  if (hasPosition) {
    parts.push(`位置 ${formatDiffNumber(readNumber(state.x, 0), 2)},${formatDiffNumber(readNumber(state.y, 0), 2)},${formatDiffNumber(readNumber(state.z, 0), 2)}`);
  }
  if (hasScale) {
    parts.push(`缩放 ${formatDiffNumber(readNumber(state.scale, 1), 2)}`);
  }
  return parts.join("；");
}

function formatDiffNumber(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

function shortDiffHash(value) {
  const hash = normalizeSha256(value);
  return hash ? hash.slice(0, 12) : "无";
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

function normalizePublishedRecord(record) {
  const source = record && typeof record === "object" ? record : {};
  const releases = Array.isArray(source.releases)
    ? source.releases.map(normalizePublishRelease).filter(Boolean)
    : [];
  const currentFromRoot = normalizePublishRelease(source, 0);

  if (currentFromRoot && !releases.some((item) => item.id === currentFromRoot.id)) {
    releases.unshift(currentFromRoot);
  }

  const normalizedReleases = normalizePublishReleaseList(releases);
  const currentReleaseId = String(source.currentReleaseId || currentFromRoot?.id || normalizedReleases[0]?.id || "");
  const current = normalizedReleases.find((item) => item.id === currentReleaseId) || normalizedReleases[0] || null;

  if (!current) {
    return {
      version: 1,
      currentReleaseId: "",
      releaseNumber: 0,
      publishedAt: "",
      note: "",
      action: "",
      layout: null,
      stats: normalizeSnapshotStats({}, normalizeSnapshotLayout({})),
      releases: []
    };
  }

  return {
    version: 1,
    currentReleaseId: current.id,
    releaseNumber: current.releaseNumber,
    publishedAt: current.publishedAt,
    note: current.note,
    action: current.action,
    rollbackFrom: current.rollbackFrom,
    layout: current.layout,
    stats: current.stats,
    releases: normalizedReleases
  };
}

function normalizePublishRelease(record, index = 0) {
  if (!record || typeof record !== "object" || !record.layout) {
    return null;
  }

  const publishedAt = Number.isFinite(Date.parse(record.publishedAt)) ? record.publishedAt : new Date().toISOString();
  const fallbackId = `main-release-${Date.parse(publishedAt) || Date.now()}-${index}`;
  const layoutValue = normalizeSnapshotLayout(record.layout);

  return {
    id: String(record.id || record.releaseId || record.currentReleaseId || fallbackId),
    releaseNumber: Math.max(1, Math.round(readNumber(record.releaseNumber, index + 1))),
    publishedAt,
    note: String(record.note || "").trim().slice(0, 80),
    action: record.action === "rollback" ? "rollback" : "publish",
    rollbackFrom: record.rollbackFrom ? String(record.rollbackFrom) : "",
    layout: layoutValue,
    stats: normalizeSnapshotStats(record.stats, layoutValue)
  };
}

function normalizePublishReleaseList(releases) {
  const seen = new Set();
  return releases.filter(Boolean)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((release) => {
      if (seen.has(release.id)) {
        return false;
      }
      seen.add(release.id);
      return true;
    })
    .slice(0, MAX_PUBLISH_RELEASES);
}

function readPublishNote() {
  return String(publishNoteInput?.value || "").trim().slice(0, 80);
}

function createPublishRelease({ note, sourceLayout, action = "publish", rollbackFrom = "", existingReleases = [] }) {
  const maxNumber = existingReleases.reduce((max, item) => Math.max(max, Number(item.releaseNumber) || 0), 0);
  const releaseNumber = maxNumber + 1;
  const publishedAt = new Date().toISOString();
  const layoutValue = normalizeSnapshotLayout(sourceLayout);
  const normalizedNote = String(note || "").trim().slice(0, 80);

  return {
    id: `main-release-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    releaseNumber,
    publishedAt,
    note: normalizedNote || (action === "rollback" ? `回滚到发布版本` : "未填写发布说明"),
    action: action === "rollback" ? "rollback" : "publish",
    rollbackFrom: rollbackFrom ? String(rollbackFrom) : "",
    layout: layoutValue,
    stats: getLayoutStats(layoutValue)
  };
}

function buildPublishedRecord(currentRelease, releases) {
  const normalizedReleases = normalizePublishReleaseList(releases);
  const current = currentRelease || normalizedReleases[0];

  return {
    version: 1,
    currentReleaseId: current?.id || "",
    releaseNumber: current?.releaseNumber || 0,
    publishedAt: current?.publishedAt || "",
    note: current?.note || "",
    action: current?.action || "publish",
    rollbackFrom: current?.rollbackFrom || "",
    layout: current?.layout || normalizeSnapshotLayout({}),
    stats: current?.stats || normalizeSnapshotStats({}, current?.layout || normalizeSnapshotLayout({})),
    releases: normalizedReleases
  };
}

function renderPublishHistory(record = loadPublishedLayoutRecord()) {
  if (!publishHistoryList) {
    return;
  }

  publishHistoryList.innerHTML = "";
  if (!record?.releases?.length) {
    const empty = document.createElement("p");
    empty.className = "main-history-empty";
    empty.textContent = "暂无发布历史。发布到前台后会保留最近 10 个本机版本。";
    publishHistoryList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  record.releases.forEach((release) => {
    fragment.appendChild(createPublishReleaseRow(release, record.currentReleaseId));
  });
  publishHistoryList.appendChild(fragment);
}

function createPublishReleaseRow(release, currentReleaseId) {
  const row = document.createElement("div");
  row.className = "main-publish-row";
  row.classList.toggle("is-current", release.id === currentReleaseId);

  const detail = document.createElement("div");
  detail.className = "main-publish-detail";

  const title = document.createElement("strong");
  const actionLabel = release.action === "rollback" ? "回滚" : "发布";
  title.textContent = `v${release.releaseNumber} · ${actionLabel}${release.id === currentReleaseId ? " · 当前" : ""}`;

  const meta = document.createElement("span");
  meta.textContent = `${formatDateTime(release.publishedAt)} · ${formatSnapshotStats(release.stats)} · ${release.note || "无说明"}`;

  detail.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "main-publish-actions-inline";

  const restoreButton = document.createElement("button");
  restoreButton.type = "button";
  restoreButton.dataset.featureState = "real-local";
  restoreButton.dataset.publishAction = "restore";
  restoreButton.dataset.releaseId = release.id;
  restoreButton.disabled = release.id === currentReleaseId;
  restoreButton.textContent = "恢复";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.featureState = "real-local";
  deleteButton.dataset.publishAction = "delete";
  deleteButton.dataset.releaseId = release.id;
  deleteButton.disabled = release.id === currentReleaseId;
  deleteButton.textContent = "删除";

  actions.append(restoreButton, deleteButton);
  row.append(detail, actions);
  return row;
}

function handlePublishHistoryClick(event) {
  const button = event.target.closest("[data-publish-action]");
  if (!button) {
    return;
  }

  const record = loadPublishedLayoutRecord();
  const release = record.releases.find((item) => item.id === button.dataset.releaseId);
  if (!release) {
    setPublishStatus("未找到该发布版本。", "error");
    renderPublishHistory(record);
    return;
  }

  if (button.dataset.publishAction === "restore") {
    restorePublishedRelease(record, release);
    return;
  }

  if (button.dataset.publishAction === "delete") {
    deletePublishedRelease(record, release.id);
  }
}

function restorePublishedRelease(record, release) {
  const rollbackRelease = createPublishRelease({
    note: `回滚到 v${release.releaseNumber}：${release.note || "无说明"}`,
    sourceLayout: release.layout,
    action: "rollback",
    rollbackFrom: release.id,
    existingReleases: record.releases
  });
  const nextRecord = buildPublishedRecord(rollbackRelease, [rollbackRelease, ...record.releases]);

  try {
    window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(nextRecord));
    renderPublishPanel();
    showNotice(`已回滚发布到 v${release.releaseNumber}，生成新版本 v${rollbackRelease.releaseNumber}。`);
  } catch (error) {
    console.warn("Published main scene release could not be restored.", error);
    setPublishStatus("回滚发布版本失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function deletePublishedRelease(record, releaseId) {
  if (record.currentReleaseId === releaseId) {
    setPublishStatus("当前发布版本不能删除。请先恢复到其他版本。", "error");
    return;
  }

  const nextReleases = record.releases.filter((release) => release.id !== releaseId);
  const current = nextReleases.find((release) => release.id === record.currentReleaseId);
  const nextRecord = buildPublishedRecord(current, nextReleases);

  try {
    window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(nextRecord));
    renderPublishPanel();
    setPublishStatus("已删除发布历史记录。", "success");
  } catch (error) {
    console.warn("Published main scene release could not be deleted.", error);
    setPublishStatus("删除发布版本失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function openFrontPreview(url) {
  const target = window.open(url, "_blank", "noopener");
  if (!target) {
    window.location.href = url;
  }
}

async function storeImportedModel(record, arrayBuffer) {
  return importedModelStore.store(record, arrayBuffer);
}

async function readImportedModel(record) {
  return importedModelStore.read(record);
}

async function deleteImportedModelData(record) {
  return importedModelStore.delete(record);
}

async function storeImportedTextureAsset(textureRecord, arrayBuffer) {
  const normalized = normalizeImportTextureRecord(textureRecord);
  if (!normalized) {
    throw new Error("贴图记录不完整，无法保存。");
  }
  return importedModelStore.store({
    id: normalized.dbKey,
    dbKey: normalized.dbKey,
    label: normalized.fileName,
    fileName: normalized.fileName,
    type: normalized.type,
    sha256: normalized.sha256,
    metrics: { fileBytes: normalized.fileBytes }
  }, arrayBuffer);
}

async function readImportedTextureAsset(textureRecord) {
  const normalized = normalizeImportTextureRecord(textureRecord);
  if (!normalized) {
    return null;
  }
  return importedModelStore.read({ id: normalized.dbKey, dbKey: normalized.dbKey });
}

async function readImportedModelTexture(record) {
  const textureRecord = normalizeImportTextureRecord(record?.texture);
  if (!textureRecord) {
    return null;
  }
  const stored = await readImportedTextureAsset(textureRecord);
  if (!stored?.arrayBuffer) {
    throw new Error(`贴图文件缺失：${textureRecord.fileName}`);
  }
  return createThreeTextureFromArrayBuffer(stored.arrayBuffer, textureRecord);
}

function createThreeTextureFromArrayBuffer(arrayBuffer, textureRecord) {
  const normalized = normalizeImportTextureRecord(textureRecord);
  if (!normalized) {
    return Promise.resolve(null);
  }

  const blob = new Blob([arrayBuffer.slice(0)], { type: getImportTextureMimeType(normalized.type) });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    importedTextureLoader.load(url, (texture) => {
      URL.revokeObjectURL(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.needsUpdate = true;
      resolve(texture);
    }, undefined, (error) => {
      URL.revokeObjectURL(url);
      reject(error || new Error(`贴图无法读取：${normalized.fileName}`));
    });
  });
}

function createImportTextureRecord(file, ownerRecord, sha256) {
  const type = getImportTextureType(file.name, file.type);
  const ownerKey = ownerRecord?.dbKey || ownerRecord?.id || "imported-model";
  return normalizeImportTextureRecord({
    dbKey: `${ownerKey}:texture-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    fileName: file.name,
    type,
    mimeType: getImportTextureMimeType(type),
    sha256,
    fileBytes: file.size,
    updatedAt: new Date().toISOString()
  });
}

function loadImportAuditLog() {
  try {
    const raw = window.localStorage.getItem(IMPORT_AUDIT_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const source = Array.isArray(parsed.records) ? parsed.records : Array.isArray(parsed) ? parsed : [];
    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      records: source.map(normalizeImportAuditRecord).filter(Boolean).slice(0, MAX_IMPORT_AUDIT_RECORDS)
    };
  } catch (error) {
    console.warn("Main import audit log could not be read.", error);
    return { version: 1, updatedAt: "", records: [] };
  }
}

function normalizeImportAuditRecord(record = {}, index = 0) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const createdAt = Number.isFinite(Date.parse(record.createdAt)) ? record.createdAt : new Date().toISOString();
  const cleanupStatus = IMPORT_AUDIT_STATUS_LABELS[record.cleanupStatus] ? record.cleanupStatus : "layout-only";
  return {
    id: String(record.id || `main-import-audit-${Date.parse(createdAt) || Date.now()}-${index}`),
    createdAt,
    action: String(record.action || "delete").slice(0, 32),
    modelId: String(record.modelId || record.id || ""),
    dbKey: String(record.dbKey || ""),
    label: String(record.label || record.fileName || "导入模型").slice(0, 80),
    fileName: String(record.fileName || "").slice(0, 160),
    sha256: normalizeSha256(record.sha256),
    fileBytes: Math.max(0, Math.round(readNumber(record.fileBytes, 0))),
    cleanupStatus,
    referencedByHistory: record.referencedByHistory === true,
    snapshotCount: Math.max(0, Math.round(readNumber(record.snapshotCount, 0))),
    message: String(record.message || IMPORT_AUDIT_STATUS_LABELS[cleanupStatus]).slice(0, 240),
    error: String(record.error || "").slice(0, 240)
  };
}

function saveImportAuditLog(records) {
  const normalized = records.map(normalizeImportAuditRecord).filter(Boolean).slice(0, MAX_IMPORT_AUDIT_RECORDS);
  try {
    window.localStorage.setItem(IMPORT_AUDIT_KEY, JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      records: normalized
    }));
  } catch (error) {
    console.warn("Main import audit log could not be saved.", error);
  }
  renderImportAuditPanel();
  return normalized;
}

function recordImportAudit(record) {
  const log = loadImportAuditLog();
  const normalized = normalizeImportAuditRecord({
    ...record,
    id: record.id || `main-import-audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: record.createdAt || new Date().toISOString()
  });
  if (!normalized) {
    return null;
  }
  saveImportAuditLog([
    normalized,
    ...log.records.filter((item) => item.id !== normalized.id)
  ]);
  return normalized;
}

function getRetainedImportAuditRecords() {
  const currentImported = new Set(layout.importedModels.flatMap((record) => [
    String(record.id || ""),
    String(record.dbKey || "")
  ]).filter(Boolean));
  const seen = new Set();

  return loadImportAuditLog().records.filter((record) => {
    if (record.cleanupStatus !== "retained-for-history") {
      return false;
    }
    const key = record.dbKey || record.modelId;
    if (!key || seen.has(key)) {
      return false;
    }
    if (currentImported.has(record.modelId) || currentImported.has(record.dbKey)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function createImportDeleteAuditBase(record = {}, options = {}) {
  const metrics = normalizeImportMetrics(record.metrics);
  return {
    action: options.action || "delete",
    modelId: String(record.id || ""),
    dbKey: String(record.dbKey || ""),
    label: String(record.label || record.fileName || "导入模型"),
    fileName: String(record.fileName || ""),
    sha256: normalizeSha256(record.sha256),
    fileBytes: metrics.fileBytes || 0,
    referencedByHistory: options.referencedByHistory === true,
    snapshotCount: layoutHistory.length
  };
}

function renderImportAuditPanel() {
  const log = loadImportAuditLog();
  const records = log.records;
  const retainedRecords = getRetainedImportAuditRecords();

  if (importAuditExportButton) {
    importAuditExportButton.disabled = !records.length;
  }
  if (importAuditCleanupButton) {
    importAuditCleanupButton.disabled = !retainedRecords.length || !adminCanPerform("delete");
  }
  if (importAuditStatus) {
    importAuditStatus.textContent = records.length
      ? `已记录 ${records.length} 条导入模型删除审计。${retainedRecords.length ? `可清理 ${retainedRecords.length} 个历史保留文件。` : "暂无可清理历史文件。"}最近：${records[0].message}`
      : "尚无导入模型删除记录。";
  }
  if (!importAuditList) {
    return;
  }

  importAuditList.replaceChildren();
  records.slice(0, 6).forEach((record) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${record.label} · ${IMPORT_AUDIT_STATUS_LABELS[record.cleanupStatus] || "已记录"}`;
    const meta = document.createElement("span");
    const digest = record.sha256 ? record.sha256.slice(0, 12) : "无 SHA";
    meta.textContent = `${formatDateTime(record.createdAt)} · ${digest} · ${formatImportAuditBytes(record.fileBytes)}`;
    const detail = document.createElement("span");
    detail.textContent = record.message;
    item.append(title, meta, detail);
    importAuditList.appendChild(item);
  });
}

function exportImportAudit() {
  const result = getImportAuditExport();
  if (!result.ok) {
    showNotice(result.message);
    renderImportAuditPanel();
    return;
  }
  downloadHtmlFile(result.html, result.filename);
  showNotice(result.message);
}

async function cleanupRetainedImportedModelFiles() {
  if (!ensureAdminPermission("delete", "清理主场景历史导入模型文件")) {
    return;
  }

  const retainedRecords = getRetainedImportAuditRecords();
  if (!retainedRecords.length) {
    showImportStatus("没有可清理的主场景历史导入模型文件。");
    renderImportAuditPanel();
    return;
  }

  const confirmed = window.confirm(`将永久清理 ${retainedRecords.length} 个主场景历史保留导入模型文件。历史快照可能无法恢复这些导入资产，继续？`);
  if (!confirmed) {
    showImportStatus("已取消清理主场景历史导入模型文件。");
    return;
  }

  if (importAuditCleanupButton) {
    importAuditCleanupButton.disabled = true;
  }

  let cleaned = 0;
  let skipped = 0;
  let failed = 0;
  for (const record of retainedRecords) {
    if (layout.importedModels.some((item) => item.id === record.modelId || item.dbKey === record.dbKey)) {
      skipped += 1;
      continue;
    }

    try {
      await deleteImportedModelData({
        id: record.modelId,
        dbKey: record.dbKey || record.modelId,
        label: record.label,
        fileName: record.fileName,
        type: "glb"
      });
      cleaned += 1;
      recordImportAudit({
        ...record,
        action: "cleanup",
        cleanupStatus: "storage-deleted",
        referencedByHistory: true,
        message: `已永久清理主场景历史保留导入模型文件：${record.label}`
      });
    } catch (error) {
      console.warn("Main imported model retained file could not be cleaned.", error);
      failed += 1;
      recordImportAudit({
        ...record,
        action: "cleanup",
        cleanupStatus: "delete-failed",
        referencedByHistory: true,
        message: `主场景历史保留导入模型文件清理失败：${record.label}`,
        error: error?.message || String(error || "")
      });
    }
  }

  renderImportAuditPanel();
  const failedText = failed ? `，${failed} 个清理失败` : "";
  const skippedText = skipped ? `，${skipped} 个仍在当前布局中已跳过` : "";
  showImportStatus(`已清理 ${cleaned} 个主场景历史导入模型文件${failedText}${skippedText}。`);
}

function getImportAuditExport() {
  const records = loadImportAuditLog().records;
  if (!records.length) {
    return {
      ok: false,
      message: "暂无导入模型删除审计可导出。"
    };
  }

  const rows = records.map((record) => {
    const status = IMPORT_AUDIT_STATUS_LABELS[record.cleanupStatus] || record.cleanupStatus;
    const referenced = record.referencedByHistory ? "是" : "否";
    return `<tr><td>${escapeHtml(formatDateTime(record.createdAt))}</td><td>${escapeHtml(record.label)}</td><td>${escapeHtml(record.fileName)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(referenced)}</td><td>${escapeHtml(record.sha256 || "无")}</td><td>${escapeHtml(record.message)}</td></tr>`;
  }).join("");

  return {
    ok: true,
    message: `已导出 ${records.length} 条导入模型删除审计。`,
    filename: `mr-calligraphy-main-import-audit-${Date.now()}.html`,
    html: `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>MR 书法主场景导入模型删除审计</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 28px; color: #1e293b; }
    h1 { margin: 0 0 8px; font-size: 22px; }
    p { color: #475569; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; }
    td:nth-child(6) { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; word-break: break-all; }
  </style>
</head>
<body>
  <h1>MR 书法主场景导入模型删除审计</h1>
  <p>导出时间：${escapeHtml(formatDateTime(new Date().toISOString()))}。该文件来自本机浏览器 localStorage，不代表服务端不可篡改审计。</p>
  <table>
    <thead><tr><th>时间</th><th>模型</th><th>文件</th><th>清理结果</th><th>历史引用</th><th>SHA-256</th><th>说明</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
  };
}

function formatImportAuditBytes(bytes) {
  return bytes ? formatBytes(bytes) : "大小未知";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  syncImportedMaterialEditorFromSelection();
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
  if (importModelMaterialUpdateButton) {
    importModelMaterialUpdateButton.disabled = !isImported || deleted || hidden || locked;
  }
  if (importModelReplaceInput) {
    importModelReplaceInput.disabled = !isImported || deleted || hidden || locked;
  }
  if (importModelTextureInput) {
    importModelTextureInput.disabled = !isImported || deleted || hidden || locked;
  }
  if (importModelTextureClearButton) {
    const textureRecord = isImported ? normalizeImportTextureRecord(selectedEntry.object.userData.importRecord?.texture) : null;
    importModelTextureClearButton.disabled = !isImported || deleted || hidden || locked || !textureRecord;
  }
  applyAdminPermissionState();
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

  if (item.kind === "import-material-update") {
    const entry = objects.get(item.id);
    if (entry) {
      try {
        await refreshImportedEntryTexture(entry, item.record);
        applyImportedRecordToEntry(entry, item.record);
        applySnapshot(item.snapshot);
        selectObject(entry.id);
        createLayoutSnapshot(`撤回外观：${entry.label}`, { notice: false });
        showImportMaterialStatus(`已撤回导入模型外观：${entry.label}`);
        showNotice(`已撤回外观：${entry.label}`);
      } catch (error) {
        console.error(error);
        showImportMaterialStatus(`撤回导入模型外观失败：${error.message || entry.label}`);
      }
    }
    return;
  }

  if (item.kind === "import-file-replace") {
    const entry = objects.get(item.id);
    if (!entry || !item.arrayBuffer) {
      showImportStatus("无法撤回模型替换：缺少原始模型文件。");
      return;
    }
    try {
      await storeImportedModel(item.record, item.arrayBuffer);
      const { normalized, model } = await createImportedModelContent(item.record, item.arrayBuffer);
      replaceImportedEntryModel(entry, normalized, model, item.snapshot);
      saveEntry(entry);
      selectObject(entry.id);
      createLayoutSnapshot(`撤回替换：${entry.label}`, { notice: false });
      showImportStatus(`已撤回模型文件替换：${entry.label}`);
      showNotice(`已撤回模型替换：${entry.label}`);
    } catch (error) {
      console.error(error);
      showImportStatus(`撤回模型替换失败：${error.message || item.record?.fileName || "模型文件"}`);
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
  if (!ensureAdminPermission("edit", "新增基础物体")) {
    return;
  }
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
  if (!ensureAdminPermission("edit", "更新基础物体")) {
    return;
  }
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
    applyAdminPermissionState();
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
  applyAdminPermissionState();
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

function syncImportedMaterialEditorFromSelection() {
  const entry = getSelectedImportedEntry();
  if (!entry) {
    if (importModelMaterialUpdateButton) {
      importModelMaterialUpdateButton.disabled = true;
    }
    if (importModelColorInput) {
      importModelColorInput.value = "#c8b08a";
    }
    setImportOpacityControl(1);
    setImportRoughnessControl(0.64);
    setImportMetalnessControl(0.02);
    if (importModelReplaceInput) {
      importModelReplaceInput.disabled = true;
      importModelReplaceInput.value = "";
    }
    if (importModelTextureInput) {
      importModelTextureInput.disabled = true;
      importModelTextureInput.value = "";
    }
    if (importModelTextureClearButton) {
      importModelTextureClearButton.disabled = true;
    }
    showImportMaterialStatus(selectedEntry
      ? "当前选中对象不是导入模型；可导入 GLB / OBJ 后再编辑外观。"
      : "选中导入模型后，可调整颜色、透明度、粗糙度、金属度和贴图并写入草稿和发布版本。");
    applyAdminPermissionState();
    return;
  }

  const record = entry.object.userData.importRecord || {};
  if (importModelColorInput) {
    importModelColorInput.value = normalizeImportColor(record.color || "#c8b08a");
  }
  setImportOpacityControl(record.opacity);
  setImportRoughnessControl(record.roughness);
  setImportMetalnessControl(record.metalness);
  if (importModelMaterialUpdateButton) {
    importModelMaterialUpdateButton.disabled = !canEditImportedEntry(entry);
  }
  if (importModelReplaceInput) {
    importModelReplaceInput.disabled = !canEditImportedEntry(entry);
    importModelReplaceInput.value = "";
  }
  if (importModelTextureInput) {
    importModelTextureInput.disabled = !canEditImportedEntry(entry);
    importModelTextureInput.value = "";
  }
  const textureRecord = normalizeImportTextureRecord(record.texture);
  if (importModelTextureClearButton) {
    importModelTextureClearButton.disabled = !canEditImportedEntry(entry) || !textureRecord;
  }
  const textureText = textureRecord ? `当前贴图：${textureRecord.fileName}。` : "当前未设置自定义贴图。";
  showImportMaterialStatus(canEditImportedEntry(entry)
    ? `已载入：${entry.label}。${textureText}可调整材质参数，或选择 GLB / OBJ / 图片替换当前资产。`
    : `已载入：${entry.label}，需恢复显示并解锁后才能更新外观。`);
  applyAdminPermissionState();
}

function updateSelectedImportedMaterial() {
  const entry = getSelectedImportedEntry();
  if (!entry) {
    showImportMaterialStatus("请选择一个导入模型后再更新外观。");
    return;
  }
  if (!canEditImportedEntry(entry)) {
    showImportMaterialStatus("当前导入模型已隐藏、锁定或删除，需恢复并解锁后才能更新外观。");
    return;
  }

  const beforeRecord = clonePlain(entry.object.userData.importRecord);
  const beforeSnapshot = snapshot(entry);
  const nextRecord = normalizeImportedModel({
    ...beforeRecord,
    color: importModelColorInput?.value || beforeRecord.color,
    opacity: importModelOpacityInput?.value ?? beforeRecord.opacity,
    roughness: importModelRoughnessInput?.value ?? beforeRecord.roughness,
    metalness: importModelMetalnessInput?.value ?? beforeRecord.metalness
  });

  if (beforeRecord.color === nextRecord.color
      && normalizeImportOpacity(beforeRecord.opacity) === nextRecord.opacity
      && normalizeImportRoughness(beforeRecord.roughness) === nextRecord.roughness
      && normalizeImportMetalness(beforeRecord.metalness) === nextRecord.metalness) {
    showImportMaterialStatus("当前导入模型外观没有变化。");
    return;
  }

  pushUndo({
    kind: "import-material-update",
    id: entry.id,
    record: beforeRecord,
    snapshot: beforeSnapshot
  });
  applyImportedRecordToEntry(entry, nextRecord);
  saveEntry(entry);
  selectObject(entry.id);
  createLayoutSnapshot(`外观：${entry.label}`, { notice: false });
  showImportMaterialStatus(`已更新：${entry.label}。颜色、透明度、粗糙度和金属度已写入本机布局和后续发布版本。`);
  showNotice(`已更新导入外观：${entry.label}`);
}

function setImportOpacityControl(value) {
  const opacity = normalizeImportOpacity(value);
  if (importModelOpacityInput) {
    importModelOpacityInput.value = String(opacity);
  }
  if (importModelOpacityValue) {
    importModelOpacityValue.textContent = opacity.toFixed(2);
  }
}

function updateImportOpacityOutput() {
  setImportOpacityControl(importModelOpacityInput?.value);
}

function setImportRoughnessControl(value) {
  const roughness = normalizeImportRoughness(value);
  if (importModelRoughnessInput) {
    importModelRoughnessInput.value = String(roughness);
  }
  if (importModelRoughnessValue) {
    importModelRoughnessValue.textContent = roughness.toFixed(2);
  }
}

function updateImportRoughnessOutput() {
  setImportRoughnessControl(importModelRoughnessInput?.value);
}

function setImportMetalnessControl(value) {
  const metalness = normalizeImportMetalness(value);
  if (importModelMetalnessInput) {
    importModelMetalnessInput.value = String(metalness);
  }
  if (importModelMetalnessValue) {
    importModelMetalnessValue.textContent = metalness.toFixed(2);
  }
}

function updateImportMetalnessOutput() {
  setImportMetalnessControl(importModelMetalnessInput?.value);
}

async function replaceSelectedImportedModelFile(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const entry = getSelectedImportedEntry();
  try {
    if (!entry) {
      throw new Error("请选择一个导入模型后再替换文件。");
    }
    if (!canEditImportedEntry(entry)) {
      throw new Error("当前导入模型已隐藏、锁定或删除，需恢复并解锁后才能替换文件。");
    }

    const type = getImportFileType(file.name);
    validateImportFile(file, {
      type,
      label: entry.label,
      existingRecords: layout.importedModels.filter((record) => record.id !== entry.id),
      duplicateMessage: (duplicate) => `已存在导入模型“${duplicate.label}”，请先删除旧模型或选择其他文件。`
    });

    const beforeRecord = clonePlain(entry.object.userData.importRecord);
    const beforeSnapshot = snapshot(entry);
    const previousStored = await readImportedModel(beforeRecord).catch((error) => {
      console.warn("Imported model file could not be prepared for replace undo.", error);
      return null;
    });

    showImportStatus(`正在校验替换文件 ${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    validateImportBuffer(type, arrayBuffer, file.name);
    const nextRecord = normalizeImportedModel({
      ...beforeRecord,
      fileName: file.name,
      type,
      baseScale: undefined,
      sha256: await createArrayBufferSha256(arrayBuffer)
    });
    showImportStatus(`正在解析替换文件 ${file.name}...`);
    const { normalized, model } = await createImportedModelContent(nextRecord, arrayBuffer);

    await storeImportedModel(normalized, arrayBuffer);
    pushUndo({
      kind: "import-file-replace",
      id: entry.id,
      record: beforeRecord,
      snapshot: beforeSnapshot,
      arrayBuffer: previousStored?.arrayBuffer ? previousStored.arrayBuffer.slice(0) : null
    });
    replaceImportedEntryModel(entry, normalized, model, beforeSnapshot);
    saveEntry(entry);
    selectObject(entry.id);
    createLayoutSnapshot(`替换模型：${entry.label}`, { notice: false });
    showImportStatus(`已替换模型文件：${entry.label} · ${normalized.fileName} · ${formatImportMetrics(normalized.metrics)}`);
    showImportMaterialStatus(`已替换：${entry.label}。新文件已写入草稿和后续发布版本。`);
    showNotice(`已替换导入模型文件：${entry.label}`);
  } catch (error) {
    console.error(error);
    showImportStatus(`替换模型失败：${error.message || file.name}`);
    showImportMaterialStatus(`替换失败：${error.message || file.name}`);
  } finally {
    event.target.value = "";
  }
}

async function replaceSelectedImportedModelTexture(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const entry = getSelectedImportedEntry();
  try {
    if (!entry) {
      throw new Error("请选择一个导入模型后再替换贴图。");
    }
    if (!canEditImportedEntry(entry)) {
      throw new Error("当前导入模型已隐藏、锁定或删除，需恢复并解锁后才能替换贴图。");
    }

    const type = getImportTextureType(file.name, file.type);
    validateImportTextureFile(file, { type });

    const beforeRecord = clonePlain(entry.object.userData.importRecord);
    const beforeSnapshot = snapshot(entry);
    showImportMaterialStatus(`正在读取贴图 ${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    const textureRecord = createImportTextureRecord(file, beforeRecord, await createArrayBufferSha256(arrayBuffer));
    const texture = await createThreeTextureFromArrayBuffer(arrayBuffer, textureRecord);
    const nextRecord = normalizeImportedModel({
      ...beforeRecord,
      texture: textureRecord
    });

    await storeImportedTextureAsset(textureRecord, arrayBuffer);
    pushUndo({
      kind: "import-material-update",
      id: entry.id,
      record: beforeRecord,
      snapshot: beforeSnapshot
    });
    entry.object.userData.importTexture = texture;
    entry.object.userData.importTextureRecord = textureRecord;
    applyImportedRecordToEntry(entry, nextRecord);
    saveEntry(entry);
    selectObject(entry.id);
    createLayoutSnapshot(`贴图：${entry.label}`, { notice: false });
    showImportMaterialStatus(`已替换贴图：${entry.label} · ${textureRecord.fileName} · SHA ${textureRecord.sha256.slice(0, 12)}。`);
    showImportStatus(`已替换导入模型贴图：${entry.label}。贴图文件保存在本机 IndexedDB，并会随发布版本引用。`);
    showNotice(`已替换导入贴图：${entry.label}`);
  } catch (error) {
    console.error(error);
    showImportMaterialStatus(`替换贴图失败：${error.message || file.name}`);
    showImportStatus(`替换贴图失败：${error.message || file.name}`);
  } finally {
    event.target.value = "";
  }
}

function clearSelectedImportedModelTexture() {
  const entry = getSelectedImportedEntry();
  try {
    if (!entry) {
      throw new Error("请选择一个导入模型后再移除贴图。");
    }
    if (!canEditImportedEntry(entry)) {
      throw new Error("当前导入模型已隐藏、锁定或删除，需恢复并解锁后才能移除贴图。");
    }

    const beforeRecord = clonePlain(entry.object.userData.importRecord);
    const previousTexture = normalizeImportTextureRecord(beforeRecord.texture);
    if (!previousTexture) {
      showImportMaterialStatus("当前导入模型没有自定义贴图。");
      return;
    }

    const beforeSnapshot = snapshot(entry);
    const nextRecord = normalizeImportedModel({
      ...beforeRecord,
      texture: null
    });
    pushUndo({
      kind: "import-material-update",
      id: entry.id,
      record: beforeRecord,
      snapshot: beforeSnapshot
    });
    entry.object.userData.importTexture = null;
    entry.object.userData.importTextureRecord = null;
    applyImportedRecordToEntry(entry, nextRecord);
    saveEntry(entry);
    selectObject(entry.id);
    createLayoutSnapshot(`移除贴图：${entry.label}`, { notice: false });
    showImportMaterialStatus(`已移除贴图：${entry.label} · ${previousTexture.fileName}。当前模型已恢复为颜色/PBR 材质。`);
    showImportStatus(`已移除导入模型贴图引用：${entry.label}。原贴图文件仍保留给历史快照或已发布版本读取。`);
    showNotice(`已移除导入贴图：${entry.label}`);
  } catch (error) {
    console.error(error);
    showImportMaterialStatus(`移除贴图失败：${error.message || "未知错误"}`);
    showImportStatus(`移除贴图失败：${error.message || "未知错误"}`);
  }
}

async function refreshImportedEntryTexture(entry, record) {
  const textureRecord = normalizeImportTextureRecord(record?.texture);
  if (!textureRecord) {
    entry.object.userData.importTexture = null;
    entry.object.userData.importTextureRecord = null;
    return null;
  }
  const texture = await readImportedModelTexture({ texture: textureRecord });
  entry.object.userData.importTexture = texture;
  entry.object.userData.importTextureRecord = textureRecord;
  return texture;
}

function applyImportedRecordToEntry(entry, record) {
  if (!entry || entry.object.userData.isImported !== true) {
    return;
  }

  const normalized = normalizeImportedModel(record);
  entry.object.userData.label = normalized.label;
  entry.object.userData.defaultState = makeDefaultState(normalized);
  entry.object.userData.importRecord = normalized;
  entry.object.userData.importTextureRecord = normalized.texture || null;
  entry.label = normalized.label;
  applyImportedModelMaterial(entry.object, normalized, {
    disposePrevious: true,
    texture: entry.object.userData.importTexture
  });
  upsertImportedModelRecord(normalized);
  saveLayout();
  updateObjectOption(entry);
  renderLayerPanel();
}

function replaceImportedEntryModel(entry, record, model, state = null) {
  if (!entry || entry.object.userData.isImported !== true || !model) {
    return;
  }

  const normalized = normalizeImportedModel(record);
  transformControls.detach();
  disposeImportedEntryModelChildren(entry.object);
  entry.object.add(model);
  entry.object.userData.scaleFactor = normalized.baseScale || 1;
  entry.object.userData.label = normalized.label;
  entry.object.userData.defaultState = makeDefaultState(normalized);
  entry.object.userData.importRecord = normalized;
  entry.object.userData.importTexture = model.userData.importTexture || entry.object.userData.importTexture || null;
  entry.object.userData.importTextureRecord = normalized.texture || null;
  entry.label = normalized.label;
  registerImportedEntryMeshes(entry.object);
  applyState(entry.object, state || snapshot(entry));
  applyEnvironmentIntensityToScene(entry.object);
  upsertImportedModelRecord(normalized);
  saveLayout();
  updateObjectOption(entry);
  renderLayerPanel();
}

function disposeImportedEntryModelChildren(root) {
  root.traverse((child) => {
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
  [...root.children].forEach((child) => root.remove(child));
}

function registerImportedEntryMeshes(root) {
  root.traverse((child) => {
    if (!child.isMesh) {
      return;
    }
    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.designRoot = root;
    if (!selectableMeshes.includes(child)) {
      selectableMeshes.push(child);
    }
  });
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

function getSelectedImportedEntry() {
  return selectedEntry?.object.userData.isImported === true ? selectedEntry : null;
}

function canEditImportedEntry(entry) {
  return Boolean(entry)
    && entry.object.userData.isImported === true
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

function showImportMaterialStatus(message) {
  if (importMaterialStatus) {
    importMaterialStatus.textContent = message;
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
  const referencedByHistory = options.deleteStorage !== false && isImportedModelReferencedByHistory(importRecord);
  const auditBase = options.auditAction
    ? createImportDeleteAuditBase(importRecord, {
        action: options.auditAction,
        referencedByHistory
      })
    : null;
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

  if (options.deleteStorage !== false && referencedByHistory) {
    const message = `模型已从当前布局移除，文件保留用于历史回滚：${importRecord.label || importRecord.fileName}`;
    showImportStatus(message);
    if (auditBase) {
      recordImportAudit({
        ...auditBase,
        cleanupStatus: "retained-for-history",
        message
      });
    }
  } else if (options.deleteStorage !== false) {
    deleteImportedModelData(importRecord)
      .then(() => {
        const message = `已清理模型文件：${importRecord.label || importRecord.fileName}`;
        showImportStatus(message);
        if (auditBase) {
          recordImportAudit({
            ...auditBase,
            cleanupStatus: "storage-deleted",
            message
          });
        }
      })
      .catch((error) => {
        console.warn("Imported model file could not be deleted.", error);
        const message = `模型已从布局移除，但文件清理失败：${importRecord.label || importRecord.fileName}`;
        showImportStatus(message);
        if (auditBase) {
          recordImportAudit({
            ...auditBase,
            cleanupStatus: "delete-failed",
            message,
            error: error?.message || String(error || "")
          });
        }
      });
  } else if (auditBase) {
    recordImportAudit({
      ...auditBase,
      cleanupStatus: "layout-only",
      message: `模型只从当前布局移除，未清理本机模型文件：${importRecord.label || importRecord.fileName}`
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
  if (!ensureAdminPermission("delete", "删除物体")) {
    return;
  }
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
    removeImportedEntry(selectedEntry, { auditAction: "delete" });
    createLayoutSnapshot(`删除：${label}`, { notice: false });
    showNotice(`已删除模型：${label}`);
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
  if (!ensureAdminPermission("delete", "恢复物体")) {
    return;
  }
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
  if (!ensureAdminPermission("edit", "复位物体")) {
    return;
  }
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
  if (!ensureAdminPermission("delete", "恢复全部默认")) {
    return;
  }
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

function readAdminRiskAcknowledgements() {
  try {
    const raw = window.localStorage.getItem(ADMIN_RISK_ACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function writeAdminRiskAcknowledgement(scope) {
  const record = {
    ...readAdminRiskAcknowledgements(),
    [scope]: new Date().toISOString()
  };
  window.localStorage.setItem(ADMIN_RISK_ACK_KEY, JSON.stringify(record));
  return record[scope];
}

function formatAdminRiskTime(value) {
  if (!value || Number.isNaN(Date.parse(value))) {
    return "";
  }
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderAdminRiskBanner() {
  if (!adminRiskBanner || !adminRiskStatus) return;
  const acknowledgedAt = readAdminRiskAcknowledgements().mainScene || "";
  const acknowledged = Boolean(acknowledgedAt);
  adminRiskBanner.classList.toggle("is-acknowledged", acknowledged);
  adminRiskStatus.textContent = acknowledged
    ? `已确认本机权限边界：${formatAdminRiskTime(acknowledgedAt)}`
    : "尚未确认本机权限边界。";
  if (adminRiskAcknowledgeButton) {
    adminRiskAcknowledgeButton.textContent = acknowledged ? "重新确认" : "已了解";
  }
  renderAdminBoundaryPanel();
}

function acknowledgeAdminRisk() {
  writeAdminRiskAcknowledgement("mainScene");
  renderAdminRiskBanner();
  recordAdminOperation("confirm-boundary", "主场景后台", "确认主场景后台是本机静态编辑页，不含登录和角色权限。");
  showNotice("已记录：主场景后台是本机静态编辑页，不含登录和角色权限。");
}

function bindUi() {
  objectSelect.addEventListener("change", () => selectObject(objectSelect.value));
  renderAdminRiskBanner();
  renderAdminAccessPanel();
  renderAdminOperatorPanel();
  adminRiskAcknowledgeButton?.addEventListener("click", acknowledgeAdminRisk);
  adminAccessUnlockButton?.addEventListener("click", unlockAdminAccess);
  adminAccessLockButton?.addEventListener("click", lockAdminAccess);
  adminAccessCodeInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      unlockAdminAccess();
    }
  });
  adminOperatorSaveButton?.addEventListener("click", saveAdminOperator);
  adminAuditExportButton?.addEventListener("click", exportAdminOperationAudit);
  translateButton.addEventListener("click", () => setMode("translate"));
  rotateButton.addEventListener("click", () => setMode("rotate"));
  focusButton.addEventListener("click", focusSelected);
  undoButton.addEventListener("click", undo);
  resetButton.addEventListener("click", resetSelected);
  deleteButton.addEventListener("click", deleteSelected);
  restoreButton.addEventListener("click", restoreSelected);
  saveButton.addEventListener("click", () => {
    if (!ensureAdminPermission("edit", "保存物体")) {
      return;
    }
    if (selectedEntry) saveEntry(selectedEntry);
    createLayoutSnapshot(`保存：${selectedEntry?.label || "主场景"}`, { notice: false });
    showNotice("已保存，正常主场景页面会读取这些参数。");
  });
  resetAllButton.addEventListener("click", resetAll);
  previewDraftButton?.addEventListener("click", () => openFrontPreview("index.html?mainScenePreview=draft"));
  openLiveButton?.addEventListener("click", () => openFrontPreview("index.html"));
  publishLayoutButton?.addEventListener("click", publishLayoutToFront);
  publishHistoryList?.addEventListener("click", handlePublishHistoryClick);
  remotePublishSaveButton?.addEventListener("click", () => ensureAdminPermission("remote", "保存远端发布配置") && saveRemotePublishConfig());
  remotePublishCheckButton?.addEventListener("click", () => ensureAdminPermission("remote", "检查远端发布") && checkRemotePublishApi());
  remotePublishPushButton?.addEventListener("click", () => ensureAdminPermission("remote", "推送远端发布") && pushRemotePublishedLayout());
  remotePublishRevokeButton?.addEventListener("click", () => ensureAdminPermission("remote", "撤销远端发布") && revokeRemotePublishedLayout());
  remotePublishRequestReviewButton?.addEventListener("click", () => ensureAdminPermission("remote", "提交远端审核") && requestRemotePublishReview());
  remotePublishApproveReviewButton?.addEventListener("click", approveRemotePublishReview);
  remotePublishRejectReviewButton?.addEventListener("click", rejectRemotePublishReview);
  remotePublishUnlockButton?.addEventListener("click", unlockRemotePublish);
  remotePublishReceiptExportButton?.addEventListener("click", exportRemotePublishReceipts);
  renderPublishPanel();
  snapshotCreateButton?.addEventListener("click", () => {
    if (!ensureAdminPermission("edit", "保存快照")) {
      return;
    }
    createLayoutSnapshot("手动快照");
  });
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
  importModelOpacityInput?.addEventListener("input", updateImportOpacityOutput);
  importModelRoughnessInput?.addEventListener("input", updateImportRoughnessOutput);
  importModelMetalnessInput?.addEventListener("input", updateImportMetalnessOutput);
  importModelReplaceInput?.addEventListener("change", replaceSelectedImportedModelFile);
  importModelTextureInput?.addEventListener("change", replaceSelectedImportedModelTexture);
  importModelTextureClearButton?.addEventListener("click", clearSelectedImportedModelTexture);
  importModelMaterialUpdateButton?.addEventListener("click", updateSelectedImportedMaterial);
  importAuditCleanupButton?.addEventListener("click", cleanupRetainedImportedModelFiles);
  importAuditExportButton?.addEventListener("click", exportImportAudit);
  renderImportAuditPanel();
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
