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
  normalizeImportLabel,
  normalizeImportMetrics,
  normalizeImportTextureRecord,
  parseImportedModel,
  validateImportBuffer,
  validateImportFile,
  validateImportTextureFile,
  validateImportedModelMetrics
} from "./model-import-utils.js";

const canvas = document.getElementById("realisticCanvas");
const resetButton = document.getElementById("resetCamera");
const motionButton = document.getElementById("toggleMotion");
const designObjectSelect = document.getElementById("designObjectSelect");
const designXInput = document.getElementById("designX");
const designYInput = document.getElementById("designY");
const designZInput = document.getElementById("designZ");
const designRotXInput = document.getElementById("designRotX");
const designRotYInput = document.getElementById("designRotY");
const designRotZInput = document.getElementById("designRotZ");
const translateModeButton = document.getElementById("translateMode");
const rotateModeButton = document.getElementById("rotateMode");
const undoActionButton = document.getElementById("undoAction");
const focusObjectButton = document.getElementById("focusObject");
const resetObjectButton = document.getElementById("resetObject");
const deleteObjectButton = document.getElementById("deleteObject");
const restoreObjectButton = document.getElementById("restoreObject");
const importModelInput = document.getElementById("importModelInput");
const importStatus = document.getElementById("importStatus");
const importModelColorInput = document.getElementById("realisticImportModelColor");
const importModelOpacityInput = document.getElementById("realisticImportModelOpacity");
const importModelOpacityValue = document.getElementById("realisticImportModelOpacityValue");
const importModelRoughnessInput = document.getElementById("realisticImportModelRoughness");
const importModelRoughnessValue = document.getElementById("realisticImportModelRoughnessValue");
const importModelMetalnessInput = document.getElementById("realisticImportModelMetalness");
const importModelMetalnessValue = document.getElementById("realisticImportModelMetalnessValue");
const importModelReplaceInput = document.getElementById("realisticImportModelReplace");
const importModelTextureInput = document.getElementById("realisticImportModelTexture");
const importModelTextureClearButton = document.getElementById("realisticImportModelTextureClear");
const importModelMaterialUpdateButton = document.getElementById("realisticImportModelMaterialUpdate");
const importMaterialStatus = document.getElementById("realisticImportMaterialStatus");
const importAuditStatus = document.getElementById("realisticImportAuditStatus");
const importAuditList = document.getElementById("realisticImportAuditList");
const importAuditCleanupButton = document.getElementById("realisticImportAuditCleanup");
const importAuditExportButton = document.getElementById("realisticImportAuditExport");
const previewDraftButton = document.getElementById("realisticPreviewDraft");
const openLiveButton = document.getElementById("realisticOpenLive");
const publishLayoutButton = document.getElementById("realisticPublishLayout");
const publishStatus = document.getElementById("realisticPublishStatus");
const publishNoteInput = document.getElementById("realisticPublishNote");
const publishDiffSummary = document.getElementById("realisticPublishDiffSummary");
const publishDiffList = document.getElementById("realisticPublishDiffList");
const publishHistoryList = document.getElementById("realisticPublishHistoryList");
const remotePublishStatus = document.getElementById("realisticRemotePublishStatus");
const remotePublishEndpointInput = document.getElementById("realisticRemotePublishEndpoint");
const remotePublishTokenInput = document.getElementById("realisticRemotePublishToken");
const remotePublishSaveButton = document.getElementById("realisticRemotePublishSave");
const remotePublishCheckButton = document.getElementById("realisticRemotePublishCheck");
const remotePublishPushButton = document.getElementById("realisticRemotePublishPush");
const remotePublishRevokeButton = document.getElementById("realisticRemotePublishRevoke");
const remotePublishReviewStatus = document.getElementById("realisticRemotePublishReviewStatus");
const remotePublishRequestReviewButton = document.getElementById("realisticRemotePublishRequestReview");
const remotePublishApproveReviewButton = document.getElementById("realisticRemotePublishApproveReview");
const remotePublishRejectReviewButton = document.getElementById("realisticRemotePublishRejectReview");
const remotePublishUnlockButton = document.getElementById("realisticRemotePublishUnlock");
const remotePublishReceiptStatus = document.getElementById("realisticRemotePublishReceiptStatus");
const remotePublishReceiptList = document.getElementById("realisticRemotePublishReceiptList");
const remotePublishReceiptExportButton = document.getElementById("realisticRemotePublishReceiptExport");
const snapshotCreateButton = document.getElementById("realisticSnapshotCreate");
const snapshotRefreshButton = document.getElementById("realisticSnapshotRefresh");
const historyStatus = document.getElementById("realisticHistoryStatus");
const snapshotList = document.getElementById("realisticSnapshotList");
const adminRiskBanner = document.getElementById("realisticAdminRiskBanner");
const adminRiskAcknowledgeButton = document.getElementById("realisticAdminRiskAcknowledge");
const adminRiskStatus = document.getElementById("realisticAdminRiskStatus");
const isDesignMode = Boolean(designObjectSelect && designXInput && designYInput && designZInput);
const SCENE_LAYOUT_STORAGE_KEY = "mr-calligraphy-realistic-layout-v1";
const SCENE_HISTORY_STORAGE_KEY = "mr-calligraphy-realistic-history-v1";
const SCENE_PUBLISHED_STORAGE_KEY = "mr-calligraphy-realistic-published-v1";
const ADMIN_RISK_ACK_KEY = "mr-calligraphy-admin-risk-ack-v1";
const IMPORT_AUDIT_KEY = "mr-calligraphy-realistic-import-audit-v1";
const IMPORTED_MODEL_LIST_KEY = "importedModels";
const IMPORT_DB_NAME = "mr-calligraphy-model-store";
const IMPORT_DB_STORE = "models";
const MAX_UNDO_STEPS = 256;
const MAX_HISTORY_SNAPSHOTS = 10;
const MAX_PUBLISH_RELEASES = 10;
const MAX_IMPORT_AUDIT_RECORDS = 30;
const IMPORT_AUDIT_STATUS_LABELS = {
  "soft-deleted-retained": "资产保留，可恢复",
  "storage-deleted": "文件已清理",
  "delete-failed": "文件清理失败",
  restored: "已恢复显示"
};
const importedModelStore = createModelStore({
  dbName: IMPORT_DB_NAME,
  storeName: IMPORT_DB_STORE,
  keyPath: "id"
});
const importedGltfLoader = new GLTFLoader();
const importedObjLoader = new OBJLoader();
const importedTextureLoader = new THREE.TextureLoader();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15120f);
scene.fog = new THREE.Fog(0x15120f, 7.5, 16);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.set(4.4, 3.1, 5.6);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.32;
controls.minDistance = 3.5;
controls.maxDistance = 9.5;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0.15, 0.4, 0.05);

const transformControls = isDesignMode ? new TransformControls(camera, renderer.domElement) : null;
if (transformControls) {
  transformControls.setMode("translate");
  transformControls.setSpace("world");
  transformControls.setSize(0.82);
  scene.add(transformControls);
}

const designObjects = new Map();
const selectableMeshes = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedDesignObject = null;
let dragStartSnapshot = null;
let inputStartSnapshot = null;
const undoStack = [];
const savedSceneLayout = loadSceneLayoutForCurrentMode();
let layoutHistory = loadLayoutHistory();

const woodMap = createWoodTexture();
const paperMap = createPaperTexture();
const inkMap = createInkTexture();
[woodMap, paperMap, inkMap].forEach((texture) => {
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
});

const materials = {
  wood: new THREE.MeshPhysicalMaterial({ map: woodMap, roughness: 0.42, metalness: 0.03, clearcoat: 0.28, clearcoatRoughness: 0.46 }),
  paper: new THREE.MeshPhysicalMaterial({ map: paperMap, color: 0xfff5df, roughness: 0.92, metalness: 0, sheen: 0.28, sheenRoughness: 0.85 }),
  ink: new THREE.MeshPhysicalMaterial({ map: inkMap, color: 0x090706, roughness: 0.36, clearcoat: 0.2, clearcoatRoughness: 0.68 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x171819, roughness: 0.82, metalness: 0.04 }),
  lacquer: new THREE.MeshPhysicalMaterial({ color: 0x6c251a, roughness: 0.34, clearcoat: 0.72, clearcoatRoughness: 0.24 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xc2995b, roughness: 0.32, metalness: 0.78 }),
  bristle: new THREE.MeshStandardMaterial({ color: 0x1c100a, roughness: 0.88 }),
  cinnabar: new THREE.MeshPhysicalMaterial({ color: 0xb23021, roughness: 0.48, clearcoat: 0.36, clearcoatRoughness: 0.5 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x98d8cc, roughness: 0.1, transparent: true, opacity: 0.2, transmission: 0.24, thickness: 0.08 })
};

buildLights();
buildDeskScene();
loadImportedModels();
bindUi();
animate();

window.MRRealisticImportAudit = {
  getAuditLog: loadImportAuditLog,
  getAuditExport: getImportAuditExport
};
window.MRRealisticScene = {
  getLayout: () => clonePlain(normalizeSceneLayout(savedSceneLayout)),
  getSource: () => window.MR_REALISTIC_SCENE_SOURCE || ""
};

function buildLights() {
  const key = new THREE.SpotLight(0xfff1d2, 520, 12, Math.PI * 0.18, 0.68, 1.4);
  key.position.set(-3.8, 6.2, 3.4);
  key.target.position.set(0.2, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 14;
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xf5ead4, 0x23170f, 1.15));

  const rim = new THREE.DirectionalLight(0xb6f0ff, 1.15);
  rim.position.set(4.2, 4.6, -4.5);
  scene.add(rim);
}

function buildDeskScene() {
  const table = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.34, 5.2), materials.wood);
  table.position.y = -0.2;
  table.receiveShadow = true;
  scene.add(table);
  registerDesignObject("table", "\u6728\u684c", table);

  const paperRoot = new THREE.Group();
  paperRoot.position.set(-0.25, 0.006, 0.04);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.85, 24, 16), materials.paper);
  paper.rotation.x = -Math.PI / 2;
  paper.receiveShadow = true;
  paperRoot.add(paper);
  createPaperEdges(paperRoot);
  scene.add(paperRoot);
  registerDesignObject("paper", "\u5ba3\u7eb8", paperRoot);

  createInkCharacter();
  createBrush();
  createInkstone();
  createSeal();
  createGuideGlass();
}

function createPaperEdges(parent) {
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0xf7edd8, roughness: 0.96 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.028, 2.85), edgeMaterial);
  left.position.set(-2.46, 0.034, 0);
  left.castShadow = true;
  parent.add(left);

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.024, 0.025), edgeMaterial);
  bottom.position.set(0, 0.029, 1.425);
  bottom.castShadow = true;
  parent.add(bottom);
}

function createInkCharacter() {
  const texture = createCalligraphyTexture();
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    transparent: true,
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.72,
    depthWrite: false
  });
  const inkRoot = new THREE.Group();
  inkRoot.position.set(-0.24, 0.045, 0.02);
  const inkPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 2.28), material);
  inkPlane.rotation.x = -Math.PI / 2;
  inkPlane.renderOrder = 2;
  inkRoot.add(inkPlane);
  scene.add(inkRoot);
  registerDesignObject("ink", "\u58a8\u8ff9", inkRoot);
}

function createStroke(points, radius) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0.035, z)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, radius, 13, false), materials.ink);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createBrush() {
  const loader = new GLTFLoader();
  loader.load(
    "assets/models/brush-web.glb?v=embedded-brush-20260514",
    (gltf) => {
      if (!gltf.scene && !(gltf.scenes && gltf.scenes.length > 0)) {
        createBrushFallback();
        return;
      }

      const brush = gltf.scene || gltf.scenes[0];
      const brushRig = new THREE.Group();
      brush.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 1.18;
          child.material.needsUpdate = true;
        }
      });

      const bounds = new THREE.Box3().setFromObject(brush);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      bounds.getCenter(center);
      bounds.getSize(size);
      brush.position.sub(center);

      const targetLength = 2.58;
      const currentLength = Math.max(size.x, size.y, size.z, 0.001);
      const scale = targetLength / currentLength;
      brushRig.scale.setScalar(scale);

      brushRig.add(brush);
      brushRig.position.set(0.78, 0.31, -0.58);
      brushRig.rotation.set(-0.08, Math.PI * 1.05, 0.18);
      scene.add(brushRig);
      registerDesignObject("brush", "\u6bdb\u7b14", brushRig);
    },
    undefined,
    (error) => {
      console.warn("GLB brush failed to load; using procedural fallback.", error?.message || error);
      createBrushFallback();
    }
  );
}

function createBrushFallback() {
  const fallbackRoot = new THREE.Group();
  const handleStart = new THREE.Vector3(2.6, 0.22, -1.35);
  const handleEnd = new THREE.Vector3(0.44, 0.34, -0.49);
  const ferruleStart = new THREE.Vector3(0.48, 0.34, -0.51);
  const ferruleEnd = new THREE.Vector3(0.1, 0.34, -0.35);
  const bristleBase = new THREE.Vector3(0.06, 0.33, -0.33);
  const tipEnd = new THREE.Vector3(-0.46, 0.08, -0.12);

  fallbackRoot.add(createCylinderBetween(handleStart, handleEnd, 0.072, materials.lacquer, 64));
  fallbackRoot.add(createCylinderBetween(handleStart.clone().add(new THREE.Vector3(-0.08, -0.005, 0.03)), handleStart.clone().add(new THREE.Vector3(0.09, 0.004, -0.04)), 0.078, materials.brass, 64));
  fallbackRoot.add(createCylinderBetween(ferruleStart, ferruleEnd, 0.102, materials.brass, 64));

  for (let i = 0; i < 5; i += 1) {
    const offset = (i - 2) * 0.045;
    const ringStart = ferruleStart.clone().lerp(ferruleEnd, 0.18 + i * 0.14);
    const ringEnd = ferruleStart.clone().lerp(ferruleEnd, 0.22 + i * 0.14);
    ringStart.y += offset * 0.08;
    ringEnd.y += offset * 0.08;
    fallbackRoot.add(createCylinderBetween(ringStart, ringEnd, 0.108, materials.brass, 64));
  }

  const mainBristle = createConeBetween(bristleBase, tipEnd, 0.17, materials.bristle, 64);
  mainBristle.scale.set(0.82, 1, 1.12);
  fallbackRoot.add(mainBristle);

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a160d,
    roughness: 0.96,
    metalness: 0
  });

  for (let i = 0; i < 34; i += 1) {
    const angle = (i / 34) * Math.PI * 2;
    const spread = 0.035 + Math.random() * 0.085;
    const base = bristleBase.clone().add(new THREE.Vector3(Math.cos(angle) * spread, Math.sin(angle) * spread * 0.35, Math.sin(angle) * spread));
    const mid = bristleBase.clone().lerp(tipEnd, 0.58).add(new THREE.Vector3((Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.045, (Math.random() - 0.5) * 0.08));
    const end = tipEnd.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.028, (Math.random() - 0.5) * 0.018, (Math.random() - 0.5) * 0.028));
    const hair = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([base, mid, end]), 18, 0.006 + Math.random() * 0.004, 6, false), hairMaterial);
    hair.castShadow = true;
    fallbackRoot.add(hair);
  }
  scene.add(fallbackRoot);
  registerDesignObject("brush", "\u6bdb\u7b14", fallbackRoot);
}

function createInkstone() {
  const inkstoneRoot = new THREE.Group();
  inkstoneRoot.position.set(-2.68, 0.1, -0.88);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.92, 0.18, 72), materials.stone);
  base.position.set(0, -0.06, 0);
  base.scale.z = 0.74;
  base.castShadow = true;
  base.receiveShadow = true;
  inkstoneRoot.add(base);

  const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.58, 0.024, 72), materials.ink);
  ink.position.set(0, 0.05, 0);
  ink.scale.z = 0.64;
  ink.castShadow = true;
  inkstoneRoot.add(ink);
  scene.add(inkstoneRoot);
  registerDesignObject("inkstone", "\u781a\u53f0", inkstoneRoot);
}

function createSeal() {
  const seal = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.52, 0.46), materials.cinnabar);
  seal.position.set(2.2, 0.17, 1.04);
  seal.rotation.y = -0.22;
  seal.castShadow = true;
  seal.receiveShadow = true;
  scene.add(seal);
  registerDesignObject("seal", "\u5370\u7ae0", seal);
}

function createGuideGlass() {
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.86), materials.glass);
  panel.position.set(1.86, 1.08, -0.42);
  panel.rotation.set(-0.24, -0.58, -0.04);
  panel.castShadow = true;
  scene.add(panel);
  registerDesignObject("guide", "\u900f\u660e\u8bb2\u89e3\u5c4f", panel);
}

function createCylinderBetween(start, end, radius, material, segments = 32) {
  const direction = end.clone().sub(start);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  return mesh;
}

function createConeBetween(base, tip, radius, material, segments = 32) {
  const direction = tip.clone().sub(base);
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, direction.length(), segments, 18), material);
  mesh.position.copy(base).add(tip).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  return mesh;
}

function createWoodTexture() {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 1024;
  canvasTexture.height = 1024;
  const ctx = canvasTexture.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
  gradient.addColorStop(0, "#6b3a22");
  gradient.addColorStop(0.45, "#9b6740");
  gradient.addColorStop(1, "#3a2115");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 95; i += 1) {
    const y = i * 11 + Math.sin(i * 1.7) * 9;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 48) {
      ctx.lineTo(x, y + Math.sin(x * 0.018 + i) * 12 + Math.sin(x * 0.006) * 18);
    }
    ctx.strokeStyle = `rgba(42, 22, 12, ${0.13 + (i % 5) * 0.025})`;
    ctx.lineWidth = 2 + (i % 4);
    ctx.stroke();
  }
  addNoise(ctx, 1024, 1024, 18);
  return makeTexture(canvasTexture, 2.2, 1.4);
}

function createPaperTexture() {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 1024;
  canvasTexture.height = 512;
  const ctx = canvasTexture.getContext("2d");
  ctx.fillStyle = "#fbf1dc";
  ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);
  for (let i = 0; i < 130; i += 1) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 1024, Math.random() * 512);
    ctx.lineTo(Math.random() * 1024, Math.random() * 512);
    ctx.strokeStyle = "rgba(127, 98, 55, 0.08)";
    ctx.lineWidth = Math.random() * 1.8;
    ctx.stroke();
  }
  addNoise(ctx, canvasTexture.width, canvasTexture.height, 12);
  return makeTexture(canvasTexture, 1.05, 1.05);
}

function createInkTexture() {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 512;
  canvasTexture.height = 512;
  const ctx = canvasTexture.getContext("2d");
  const gradient = ctx.createRadialGradient(256, 256, 20, 256, 256, 290);
  gradient.addColorStop(0, "#17100c");
  gradient.addColorStop(0.72, "#080605");
  gradient.addColorStop(1, "#2b211b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  addNoise(ctx, 512, 512, 24);
  return makeTexture(canvasTexture, 1, 1);
}

function createCalligraphyTexture() {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 2048;
  canvasTexture.height = 1440;
  const ctx = canvasTexture.getContext("2d");
  ctx.clearRect(0, 0, canvasTexture.width, canvasTexture.height);

  ctx.save();
  ctx.translate(1024, 775);
  ctx.rotate(-0.045);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '980px "KaiTi", "STKaiti", "Kaiti SC", "SimSun", serif';

  for (let i = 0; i < 18; i += 1) {
    ctx.save();
    ctx.globalAlpha = 0.035;
    ctx.filter = `blur(${8 + i * 0.7}px)`;
    ctx.fillStyle = "#130d09";
    ctx.translate((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 22);
    ctx.scale(1 + (Math.random() - 0.5) * 0.018, 1 + (Math.random() - 0.5) * 0.014);
    ctx.fillText("\u6c38", 0, -6);
    ctx.restore();
  }

  ctx.filter = "none";
  ctx.globalAlpha = 0.94;
  const inkGradient = ctx.createLinearGradient(-380, -520, 390, 540);
  inkGradient.addColorStop(0, "#060403");
  inkGradient.addColorStop(0.42, "#120b07");
  inkGradient.addColorStop(0.7, "#050302");
  inkGradient.addColorStop(1, "#261a12");
  ctx.fillStyle = inkGradient;
  ctx.fillText("\u6c38", 0, -6);

  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 170; i += 1) {
    const x = -430 + Math.random() * 860;
    const y = -500 + Math.random() * 1000;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.9 + Math.random() * 0.32);
    ctx.globalAlpha = 0.05 + Math.random() * 0.12;
    ctx.fillStyle = "#000";
    ctx.fillRect(-2, -40 - Math.random() * 120, 4 + Math.random() * 11, 70 + Math.random() * 210);
    ctx.restore();
  }

  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < 90; i += 1) {
    const radius = 1 + Math.random() * 6;
    ctx.beginPath();
    ctx.globalAlpha = 0.08 + Math.random() * 0.18;
    ctx.fillStyle = "#090504";
    ctx.arc(-470 + Math.random() * 940, -540 + Math.random() * 1060, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  addInkEdge(ctx, 2048, 1440);
  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function addInkEdge(ctx, width, height) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 0) {
      const grain = 0.86 + Math.random() * 0.2;
      data[i] *= grain;
      data[i + 1] *= grain;
      data[i + 2] *= grain;
      data[i + 3] = Math.min(255, alpha * (0.9 + Math.random() * 0.16));
    }
  }
  ctx.putImageData(image, 0, 0);
}

function makeTexture(canvasTexture, repeatX, repeatY) {
  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

function addNoise(ctx, width, height, strength) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const value = (Math.random() - 0.5) * strength;
    data[i] += value;
    data[i + 1] += value;
    data[i + 2] += value;
  }
  ctx.putImageData(image, 0, 0);
}

function loadSceneLayoutForCurrentMode() {
  if (isDesignMode) {
    window.MR_REALISTIC_SCENE_SOURCE = "draft-editor";
    return loadDraftSceneLayout();
  }

  if (shouldPreviewDraftLayout()) {
    window.MR_REALISTIC_SCENE_SOURCE = "draft-preview";
    return loadDraftSceneLayout();
  }

  const published = loadPublishedLayoutRecord();
  if (published?.layout) {
    window.MR_REALISTIC_SCENE_SOURCE = "published";
    window.MR_REALISTIC_SCENE_PUBLISHED_AT = published.publishedAt || "";
    return normalizeSceneLayout(published.layout);
  }

  window.MR_REALISTIC_SCENE_SOURCE = "draft-fallback";
  return loadDraftSceneLayout();
}

function shouldPreviewDraftLayout() {
  try {
    return new URLSearchParams(window.location.search).get("realisticPreview") === "draft";
  } catch (error) {
    return false;
  }
}

function loadDraftSceneLayout() {
  try {
    const raw = window.localStorage.getItem(SCENE_LAYOUT_STORAGE_KEY);
    return normalizeSceneLayout(raw ? JSON.parse(raw) : {});
  } catch (error) {
    console.warn("Scene layout could not be read from localStorage.", error);
    return {};
  }
}

function saveSceneLayout() {
  if (!isDesignMode) {
    return;
  }
  try {
    window.localStorage.setItem(SCENE_LAYOUT_STORAGE_KEY, JSON.stringify(normalizeSceneLayout(savedSceneLayout)));
    renderPublishDiff();
  } catch (error) {
    console.warn("Scene layout could not be saved to localStorage.", error);
  }
}

function loadLayoutHistory() {
  try {
    const raw = window.localStorage.getItem(SCENE_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const source = Array.isArray(parsed.snapshots) ? parsed.snapshots : Array.isArray(parsed) ? parsed : [];
    return source.map(normalizeLayoutSnapshot).filter(Boolean).slice(0, MAX_HISTORY_SNAPSHOTS);
  } catch (error) {
    console.warn("Scene history could not be read from localStorage.", error);
    return [];
  }
}

function saveLayoutHistory() {
  try {
    window.localStorage.setItem(SCENE_HISTORY_STORAGE_KEY, JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      snapshots: layoutHistory.slice(0, MAX_HISTORY_SNAPSHOTS)
    }));
    return true;
  } catch (error) {
    console.warn("Scene history could not be saved to localStorage.", error);
    return false;
  }
}

function loadPublishedLayoutRecord() {
  try {
    const raw = window.localStorage.getItem(SCENE_PUBLISHED_STORAGE_KEY);
    return normalizePublishedRecord(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.warn("Published scene layout could not be read from localStorage.", error);
    return normalizePublishedRecord(null);
  }
}

function normalizeSceneLayout(value = {}) {
  const layout = {};
  const source = value && typeof value === "object" ? value : {};
  Object.entries(source).forEach(([key, record]) => {
    if (key === IMPORTED_MODEL_LIST_KEY) {
      return;
    }
    const normalized = normalizeSavedTransform(record);
    if (normalized) {
      layout[key] = normalized;
    }
  });
  layout[IMPORTED_MODEL_LIST_KEY] = Array.isArray(source[IMPORTED_MODEL_LIST_KEY])
    ? source[IMPORTED_MODEL_LIST_KEY].map(normalizeImportedRecord)
    : [];
  return layout;
}

function normalizeSavedTransform(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  return {
    x: readFiniteNumber(record.x, 0),
    y: readFiniteNumber(record.y, 0),
    z: readFiniteNumber(record.z, 0),
    rx: readFiniteNumber(record.rx, 0),
    ry: readFiniteNumber(record.ry, 0),
    rz: readFiniteNumber(record.rz, 0),
    deleted: record.deleted === true
  };
}

function readFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeLayoutSnapshot(record, index = 0) {
  if (!record || typeof record !== "object" || !record.layout) {
    return null;
  }

  const layout = normalizeSceneLayout(record.layout);
  return {
    id: String(record.id || `realistic-snapshot-${Date.now()}-${index}`),
    label: String(record.label || (index === 0 ? "写实场景快照" : `写实场景快照 ${index + 1}`)).slice(0, 60),
    createdAt: Number.isFinite(Date.parse(record.createdAt)) ? record.createdAt : new Date().toISOString(),
    layout,
    stats: normalizeLayoutStats(record.stats, layout)
  };
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
      stats: normalizeLayoutStats({}, normalizeSceneLayout({})),
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
  const fallbackId = `realistic-release-${Date.parse(publishedAt) || Date.now()}-${index}`;
  const layout = normalizeSceneLayout(record.layout);

  return {
    id: String(record.id || record.releaseId || record.currentReleaseId || fallbackId),
    releaseNumber: Math.max(1, Math.round(readFiniteNumber(record.releaseNumber, index + 1))),
    publishedAt,
    note: String(record.note || "").trim().slice(0, 80),
    action: record.action === "rollback" ? "rollback" : "publish",
    rollbackFrom: record.rollbackFrom ? String(record.rollbackFrom) : "",
    layout,
    stats: normalizeLayoutStats(record.stats, layout)
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

function normalizeLayoutStats(stats, layout = savedSceneLayout) {
  const fallback = getLayoutStats(layout);
  return {
    objectStateCount: Math.max(0, Math.round(readFiniteNumber(stats?.objectStateCount, fallback.objectStateCount))),
    importedCount: Math.max(0, Math.round(readFiniteNumber(stats?.importedCount, fallback.importedCount))),
    deletedCount: Math.max(0, Math.round(readFiniteNumber(stats?.deletedCount, fallback.deletedCount)))
  };
}

function getLayoutStats(layout = savedSceneLayout) {
  const objectStates = Object.entries(layout && typeof layout === "object" ? layout : {})
    .filter(([key, record]) => key !== IMPORTED_MODEL_LIST_KEY && record && typeof record === "object")
    .map(([, record]) => record);
  const importedCount = Array.isArray(layout?.[IMPORTED_MODEL_LIST_KEY]) ? layout[IMPORTED_MODEL_LIST_KEY].length : 0;
  return {
    objectStateCount: objectStates.length,
    importedCount,
    deletedCount: objectStates.filter((record) => record.deleted === true).length
  };
}

function getImportedModelRecords() {
  if (!Array.isArray(savedSceneLayout[IMPORTED_MODEL_LIST_KEY])) {
    savedSceneLayout[IMPORTED_MODEL_LIST_KEY] = [];
  }
  savedSceneLayout[IMPORTED_MODEL_LIST_KEY] = savedSceneLayout[IMPORTED_MODEL_LIST_KEY].map(normalizeImportedRecord);
  return savedSceneLayout[IMPORTED_MODEL_LIST_KEY];
}

function normalizeImportedRecord(record = {}, index = 0) {
  const fileName = String(record.fileName || "model.glb");
  const type = record.type === "glb" || record.type === "obj"
    ? record.type
    : getImportFileType(fileName) || "glb";
  const id = String(record.id || makeImportedModelId(fileName || `model-${index + 1}`));

  return {
    id,
    dbKey: String(record.dbKey || id),
    type,
    fileName,
    label: String(record.label || normalizeImportLabel(fileName)),
    color: normalizeImportColor(record.color || "#c8b08a"),
    opacity: normalizeImportOpacity(record.opacity),
    roughness: normalizeImportRoughness(record.roughness),
    metalness: normalizeImportMetalness(record.metalness),
    sha256: normalizeSha256(record.sha256),
    metrics: normalizeImportMetrics(record.metrics),
    texture: normalizeImportTextureRecord(record.texture)
  };
}

function normalizeImportColor(value) {
  const string = String(value || "").trim();

  return /^#[0-9a-f]{6}$/i.test(string) ? string : "#c8b08a";
}

function normalizeImportOpacity(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(number, 0.2), 1) : 1;
}

function normalizeImportRoughness(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(number, 0.05), 1) : 0.62;
}

function normalizeImportMetalness(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(number, 0), 1) : 0.04;
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function upsertImportedRecord(record) {
  const normalized = normalizeImportedRecord(record);
  const records = getImportedModelRecords();
  const index = records.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    records[index] = normalized;
  } else {
    records.push(normalized);
  }

  return normalized;
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
  const ownerKey = ownerRecord?.dbKey || ownerRecord?.id || "realistic-imported-model";
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
    console.warn("Realistic import audit log could not be read.", error);
    return { version: 1, updatedAt: "", records: [] };
  }
}

function normalizeImportAuditRecord(record = {}, index = 0) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const createdAt = Number.isFinite(Date.parse(record.createdAt)) ? record.createdAt : new Date().toISOString();
  const cleanupStatus = IMPORT_AUDIT_STATUS_LABELS[record.cleanupStatus] ? record.cleanupStatus : "soft-deleted-retained";
  return {
    id: String(record.id || `realistic-import-audit-${Date.parse(createdAt) || Date.now()}-${index}`),
    createdAt,
    action: record.action === "restore" ? "restore" : "delete",
    modelId: String(record.modelId || ""),
    dbKey: String(record.dbKey || ""),
    label: String(record.label || record.fileName || "写实导入模型").slice(0, 80),
    fileName: String(record.fileName || "").slice(0, 160),
    sha256: normalizeSha256(record.sha256),
    fileBytes: Math.max(0, Math.round(readFiniteNumber(record.fileBytes, 0))),
    cleanupStatus,
    message: String(record.message || IMPORT_AUDIT_STATUS_LABELS[cleanupStatus]).slice(0, 240)
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
    console.warn("Realistic import audit log could not be saved.", error);
  }
  renderImportAuditPanel();
  return normalized;
}

function recordImportAudit(record) {
  const log = loadImportAuditLog();
  const normalized = normalizeImportAuditRecord({
    ...record,
    id: record.id || `realistic-import-audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
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

function getImportedRecordById(id) {
  return getImportedModelRecords().find((record) => record.id === id) || null;
}

function isImportedDesignObject(entry) {
  return Boolean(entry?.id && getImportedRecordById(entry.id));
}

function createImportAuditBase(entry, action) {
  const record = getImportedRecordById(entry?.id);
  if (!record) {
    return null;
  }

  return createImportAuditBaseFromRecord(record, action, entry.label);
}

function createImportAuditBaseFromRecord(record, action, fallbackLabel = "") {
  if (!record) {
    return null;
  }

  const metrics = normalizeImportMetrics(record.metrics);
  return {
    action,
    modelId: record.id,
    dbKey: record.dbKey,
    label: record.label || fallbackLabel || record.fileName,
    fileName: record.fileName,
    sha256: normalizeSha256(record.sha256),
    fileBytes: metrics.fileBytes || 0
  };
}

function getDeletedImportedRecords() {
  return getImportedModelRecords()
    .filter((record) => savedSceneLayout[record.id]?.deleted === true);
}

function recordImportedObjectVisibilityAudit(entry, deleted) {
  const base = createImportAuditBase(entry, deleted ? "delete" : "restore");
  if (!base) {
    return;
  }

  recordImportAudit({
    ...base,
    cleanupStatus: deleted ? "soft-deleted-retained" : "restored",
    message: deleted
      ? `写实导入模型已从场景中隐藏，模型文件保留在本机 IndexedDB，可恢复：${base.label}`
      : `写实导入模型已恢复显示，继续使用本机 IndexedDB 文件：${base.label}`
  });
}

function renderImportAuditPanel() {
  const log = loadImportAuditLog();
  const records = log.records;
  const deletedRecords = getDeletedImportedRecords();

  if (importAuditExportButton) {
    importAuditExportButton.disabled = !records.length;
  }
  if (importAuditCleanupButton) {
    importAuditCleanupButton.disabled = !deletedRecords.length;
  }
  if (importAuditStatus) {
    importAuditStatus.textContent = records.length
      ? `已记录 ${records.length} 条写实导入模型审计。最近：${records[0].message}`
      : "尚无写实导入模型删除记录。";
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
    meta.textContent = `${formatDateTime(record.createdAt)} · ${digest} · ${record.fileBytes ? formatBytes(record.fileBytes) : "大小未知"}`;
    const detail = document.createElement("span");
    detail.textContent = record.message;
    item.append(title, meta, detail);
    importAuditList.appendChild(item);
  });
}

function exportImportAudit() {
  const result = getImportAuditExport();
  if (!result.ok) {
    setImportStatus(result.message);
    renderImportAuditPanel();
    return;
  }
  downloadHtmlFile(result.html, result.filename);
  setImportStatus(result.message);
}

async function cleanupDeletedImportedModelFiles() {
  const deletedRecords = getDeletedImportedRecords();
  if (!deletedRecords.length) {
    setImportStatus("没有可清理的已删除写实导入模型。");
    renderImportAuditPanel();
    return;
  }

  const confirmed = window.confirm(`将永久清理 ${deletedRecords.length} 个已删除写实导入模型文件，并从写实草稿移除记录。继续？`);
  if (!confirmed) {
    setImportStatus("已取消清理已删除写实导入模型文件。");
    return;
  }

  if (importAuditCleanupButton) {
    importAuditCleanupButton.disabled = true;
  }

  let cleaned = 0;
  let failed = 0;
  for (const record of deletedRecords) {
    const base = createImportAuditBaseFromRecord(record, "delete");
    try {
      await deleteImportedModelData(record);
      removeImportedRecordFromDraft(record.id);
      removeImportedEntryFromScene(record.id);
      cleaned += 1;
      recordImportAudit({
        ...base,
        cleanupStatus: "storage-deleted",
        message: `已永久清理写实导入模型文件并从草稿移除记录：${base.label}`
      });
    } catch (error) {
      console.warn("Realistic imported model file could not be cleaned.", error);
      failed += 1;
      recordImportAudit({
        ...base,
        cleanupStatus: "delete-failed",
        message: `写实导入模型文件清理失败，草稿记录已保留：${base.label}`
      });
    }
  }

  saveSceneLayout();
  if (cleaned) {
    createLayoutSnapshot(`清理导入模型：${cleaned} 个`, { status: false });
  }
  renderImportAuditPanel();
  renderPublishDiff();
  setImportStatus(failed
    ? `已清理 ${cleaned} 个写实导入模型文件，${failed} 个清理失败。`
    : `已清理 ${cleaned} 个写实导入模型文件，并从写实草稿移除。`);
}

function removeImportedRecordFromDraft(modelId) {
  savedSceneLayout[IMPORTED_MODEL_LIST_KEY] = getImportedModelRecords()
    .filter((record) => record.id !== modelId);
  delete savedSceneLayout[modelId];
}

function removeImportedEntryFromScene(modelId) {
  const entry = designObjects.get(modelId);
  if (!entry) {
    removeDesignObjectOption(modelId);
    return;
  }

  const wasSelected = selectedDesignObject?.id === modelId;
  if (wasSelected) {
    transformControls?.detach();
    selectedDesignObject = null;
  }

  disposeImportedEntryModelChildren(entry.object);
  scene.remove(entry.object);
  designObjects.delete(modelId);
  removeDesignObjectOption(modelId);

  if (wasSelected) {
    const nextOption = designObjectSelect
      ? Array.from(designObjectSelect.options).find((option) => designObjects.has(option.value))
      : null;
    if (nextOption) {
      selectDesignObject(nextOption.value);
    } else {
      updateDeletedUi();
      syncImportedMaterialEditorFromSelection();
    }
  }
}

function removeDesignObjectOption(modelId) {
  if (!designObjectSelect) {
    return;
  }
  const option = Array.from(designObjectSelect.options).find((item) => item.value === modelId);
  option?.remove();
}

function getImportAuditExport() {
  const records = loadImportAuditLog().records;
  if (!records.length) {
    return {
      ok: false,
      message: "暂无写实导入模型删除审计可导出。"
    };
  }

  const rows = records.map((record) => {
    const action = record.action === "restore" ? "恢复" : "删除";
    const status = IMPORT_AUDIT_STATUS_LABELS[record.cleanupStatus] || record.cleanupStatus;
    return `<tr><td>${escapeHtml(formatDateTime(record.createdAt))}</td><td>${escapeHtml(action)}</td><td>${escapeHtml(record.label)}</td><td>${escapeHtml(record.fileName)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(record.sha256 || "无")}</td><td>${escapeHtml(record.message)}</td></tr>`;
  }).join("");

  return {
    ok: true,
    message: `已导出 ${records.length} 条写实导入模型审计。`,
    filename: `mr-calligraphy-realistic-import-audit-${Date.now()}.html`,
    html: `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>MR 书法写实导入模型删除审计</title>
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
  <h1>MR 书法写实导入模型删除审计</h1>
  <p>导出时间：${escapeHtml(formatDateTime(new Date().toISOString()))}。写实后台删除导入模型默认是本机软删除：资产文件保留在 IndexedDB 以便恢复；执行“清理已删除文件”后会删除本机 IndexedDB 文件并从写实草稿移除记录，但不代表服务端资产清理或不可篡改审计。</p>
  <table>
    <thead><tr><th>时间</th><th>动作</th><th>模型</th><th>文件</th><th>结果</th><th>SHA-256</th><th>说明</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
  };
}

function toDegrees(radians) {
  return THREE.MathUtils.radToDeg(radians);
}

function toRadians(degrees) {
  return THREE.MathUtils.degToRad(degrees);
}

function makeImportedModelId(fileName) {
  const safeName = fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36) || "model";
  return `import-${Date.now()}-${safeName}`;
}

function normalizeSha256(value) {
  const hash = String(value || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
}

function setImportStatus(message) {
  if (importStatus) importStatus.textContent = message;
}

function setImportMaterialStatus(message) {
  if (importMaterialStatus) importMaterialStatus.textContent = message;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createLayoutSnapshot(label = "手动快照", options = {}) {
  if (!isDesignMode) {
    return null;
  }

  const snapshot = {
    id: `realistic-snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label: String(label || "手动快照").slice(0, 60),
    createdAt: new Date().toISOString(),
    layout: normalizeSceneLayout(savedSceneLayout),
    stats: getLayoutStats(savedSceneLayout)
  };

  layoutHistory = [
    snapshot,
    ...layoutHistory.filter((item) => item.id !== snapshot.id)
  ].slice(0, MAX_HISTORY_SNAPSHOTS);
  const saved = saveLayoutHistory();
  if (!saved) {
    layoutHistory = loadLayoutHistory();
    renderHistoryPanel();
    setHistoryStatus("保存快照失败，可能是浏览器本机存储空间不足。", "error");
    return null;
  }

  renderHistoryPanel();

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
    empty.className = "realistic-panel-status";
    empty.textContent = "暂无快照。点击“保存快照”记录当前写实场景。";
    snapshotList.appendChild(empty);
    setHistoryStatus("最多保留最近 10 次写实场景快照。", "normal");
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
  row.className = "realistic-snapshot-row";

  const detail = document.createElement("div");
  detail.className = "realistic-snapshot-detail";
  const title = document.createElement("strong");
  title.textContent = snapshot.label;
  const meta = document.createElement("span");
  meta.textContent = `${formatDateTime(snapshot.createdAt)} · ${formatSnapshotStats(snapshot.stats)}`;
  detail.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "realistic-snapshot-actions";

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
  createLayoutSnapshot("恢复前自动快照", { status: false });
  try {
    window.localStorage.setItem(SCENE_LAYOUT_STORAGE_KEY, JSON.stringify(normalizeSceneLayout(snapshot.layout)));
    setHistoryStatus(`已恢复快照：${snapshot.label}，页面即将刷新。`, "success");
    window.setTimeout(() => window.location.reload(), 800);
  } catch (error) {
    console.warn("Scene snapshot could not be restored.", error);
    setHistoryStatus("恢复快照失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function deleteLayoutSnapshot(id) {
  const before = layoutHistory.length;
  layoutHistory = layoutHistory.filter((snapshot) => snapshot.id !== id);
  const saved = saveLayoutHistory();
  if (!saved) {
    layoutHistory = loadLayoutHistory();
    renderHistoryPanel();
    setHistoryStatus("删除快照失败，可能是浏览器本机存储空间不足。", "error");
    return;
  }

  renderHistoryPanel();
  setHistoryStatus(before === layoutHistory.length ? "未找到要删除的快照。" : "已删除快照。", "success");
}

function publishLayoutToDemo() {
  if (!isDesignMode) {
    return;
  }

  const currentRecord = loadPublishedLayoutRecord();
  const release = createPublishRelease({
    note: readPublishNote(),
    sourceLayout: savedSceneLayout,
    action: "publish",
    existingReleases: currentRecord.releases
  });
  const record = buildPublishedRecord(release, [release, ...currentRecord.releases]);

  try {
    createLayoutSnapshot("发布前快照", { status: false });
    window.localStorage.setItem(SCENE_PUBLISHED_STORAGE_KEY, JSON.stringify(record));
    if (publishNoteInput) publishNoteInput.value = "";
    renderPublishPanel();
    setPublishStatus(`已发布到演示：v${release.releaseNumber} · ${formatDateTime(release.publishedAt)} · ${formatSnapshotStats(release.stats)}`, "success");
  } catch (error) {
    console.warn("Published scene layout could not be saved.", error);
    setPublishStatus("发布失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function renderPublishPanel() {
  if (!publishStatus) {
    return;
  }

  const record = loadPublishedLayoutRecord();
  if (!record?.layout) {
    setPublishStatus("尚未发布。写实演示页会临时读取当前草稿。", "normal");
    renderPublishDiff(record);
    renderPublishHistory(record);
    renderRemotePublishPanel(record);
    return;
  }

  const note = record.note ? ` · ${record.note}` : "";
  setPublishStatus(`已发布 v${record.releaseNumber || 1}：${formatDateTime(record.publishedAt)} · ${formatSnapshotStats(normalizeLayoutStats(record.stats, record.layout))}${note}`, "success");
  renderPublishDiff(record);
  renderPublishHistory(record);
  renderRemotePublishPanel(record);
}

function setPublishStatus(message, tone = "normal") {
  if (!publishStatus) {
    return;
  }
  publishStatus.textContent = message;
  publishStatus.dataset.tone = tone;
}

function renderRemotePublishPanel(record = loadPublishedLayoutRecord()) {
  const adapter = window.MRProjectRemotePublish;
  const hasLocalRelease = Boolean(record?.layout);
  const context = createRemotePublishContext(record);
  const status = adapter?.getStatus?.("realisticScene", { ...context, hasLocalRelease });
  const workflow = adapter?.getWorkflow?.("realisticScene", context);
  const config = adapter?.getConfig?.("realisticScene");
  const receiptAudit = adapter?.getReceiptAudit?.("realisticScene");

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
    const purgeCount = Number(receipt.cdnPurgeSummary?.purgedUrlCount || 0);
    const purgeMeta = purgeCount ? ` · purge ${purgeCount}` : "";
    meta.textContent = `${receipt.direction === "revoke" ? "撤销" : "发布"} · ${formatDateTime(receipt.acceptedAt || receipt.pushedAt || receipt.revokedAt)} · ${digest ? digest.slice(0, 12) : "摘要未知"}${signatureMeta}${purgeMeta}`;
    const message = document.createElement("small");
    message.textContent = receipt.message || receipt.remoteVersion || "远端已接收。";
    item.append(title, meta, message);
    remotePublishReceiptList.appendChild(item);
  });
}

function createRemotePublishContext(record = loadPublishedLayoutRecord()) {
  const releases = Array.isArray(record?.releases) ? record.releases : [];
  const release = releases.find((item) => item?.id === record?.currentReleaseId) || releases[0] || record;
  return {
    sceneLabel: "写实场景",
    storageKey: SCENE_PUBLISHED_STORAGE_KEY,
    record,
    release
  };
}

function saveRemotePublishConfig() {
  const result = window.MRProjectRemotePublish?.configure?.("realisticScene", {
    endpoint: remotePublishEndpointInput?.value || "",
    token: remotePublishTokenInput?.value || ""
  });
  renderRemotePublishPanel();
  showNotice(result?.message || "远端发布配置保存失败。");
}

async function checkRemotePublishApi() {
  setRemotePublishBusy(true);
  try {
    const result = await window.MRProjectRemotePublish?.check?.("realisticScene");
    showNotice(result?.message || "远端发布 API 检查失败。");
  } catch (error) {
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
    const result = await window.MRProjectRemotePublish?.push?.("realisticScene", {
      ...context
    });
    showNotice(result?.message || "远端发布包推送失败。");
  } catch (error) {
    showNotice(`远端发布包推送失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setRemotePublishBusy(false);
    renderRemotePublishPanel(record);
  }
}

async function revokeRemotePublishedLayout() {
  setRemotePublishBusy(true);
  try {
    const result = await window.MRProjectRemotePublish?.revoke?.("realisticScene", {
      sceneLabel: "写实场景",
      reason: publishNoteInput?.value || "local-user-revoked-remote-publish"
    });
    showNotice(result?.message || "远端发布撤销失败。");
  } catch (error) {
    showNotice(`远端发布撤销失败：${error?.message || "网络请求异常"}。`);
  } finally {
    setRemotePublishBusy(false);
    renderRemotePublishPanel();
  }
}

function requestRemotePublishReview() {
  const record = loadPublishedLayoutRecord();
  const result = window.MRProjectRemotePublish?.requestReview?.("realisticScene", {
    ...createRemotePublishContext(record),
    note: publishNoteInput?.value || ""
  });
  renderRemotePublishPanel(record);
  showNotice(result?.message || "远端发布审核提交失败。");
}

function approveRemotePublishReview() {
  const record = loadPublishedLayoutRecord();
  const result = window.MRProjectRemotePublish?.approveReview?.("realisticScene", {
    ...createRemotePublishContext(record),
    note: publishNoteInput?.value || ""
  });
  renderRemotePublishPanel(record);
  showNotice(result?.message || "远端发布审核通过失败。");
}

function rejectRemotePublishReview() {
  const record = loadPublishedLayoutRecord();
  const result = window.MRProjectRemotePublish?.rejectReview?.("realisticScene", {
    ...createRemotePublishContext(record),
    reason: publishNoteInput?.value || ""
  });
  renderRemotePublishPanel(record);
  showNotice(result?.message || "远端发布审核退回失败。");
}

function unlockRemotePublish() {
  const record = loadPublishedLayoutRecord();
  const result = window.MRProjectRemotePublish?.unlock?.("realisticScene", createRemotePublishContext(record));
  renderRemotePublishPanel(record);
  showNotice(result?.message || "远端发布锁解除失败。");
}

function exportRemotePublishReceipts() {
  const result = window.MRProjectRemotePublish?.getReceiptAuditExport?.("realisticScene");
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

function renderPublishDiff(record = loadPublishedLayoutRecord()) {
  if (!publishDiffSummary || !publishDiffList) {
    return;
  }

  const diff = createRealisticPublishDiff(normalizeSceneLayout(savedSceneLayout), record?.layout ? normalizeSceneLayout(record.layout) : null);
  publishDiffSummary.textContent = diff.summary;
  publishDiffList.innerHTML = "";
  diff.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    publishDiffList.appendChild(li);
  });
}

function createRealisticPublishDiff(draftLayout, publishedLayout) {
  const draftIndex = createRealisticLayoutDiffIndex(draftLayout);
  const publishedIndex = publishedLayout ? createRealisticLayoutDiffIndex(publishedLayout) : new Map();
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
      summary: draftIndex.size ? `尚未发布：将首次发布 ${draftIndex.size} 项写实草稿内容。` : "尚未发布：将发布当前默认写实场景。",
      items: draftIndex.size ? formatDiffItems("新增", [...draftIndex.values()]) : ["当前没有自定义坐标或导入模型。"]
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

function createRealisticLayoutDiffIndex(layoutValue) {
  const normalized = normalizeSceneLayout(layoutValue);
  const index = new Map();
  const importedById = new Map((normalized[IMPORTED_MODEL_LIST_KEY] || []).map((item) => [item.id, item]));

  Object.entries(normalized).forEach(([id, state]) => {
    if (id === IMPORTED_MODEL_LIST_KEY || importedById.has(id)) return;
    index.set(`object:${id}`, createDiffItem("写实物体", id, id, state));
  });

  importedById.forEach((item, id) => {
    const state = normalized[id] || {};
    index.set(`imported:${id}`, createDiffItem("导入模型", id, item.label || item.fileName || id, { item, state }));
  });

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
    ["旋转X", "rx", 2],
    ["旋转Y", "ry", 2],
    ["旋转Z", "rz", 2]
  ].forEach(([label, key, digits]) => {
    if (previousState[key] === undefined && nextState[key] === undefined) {
      return;
    }
    appendNumberDiff(changes, label, readFiniteNumber(previousState[key], 0), readFiniteNumber(nextState[key], 0), digits);
  });
  appendBooleanDiff(changes, "删除", previousState.deleted, nextState.deleted);
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

  if (!hasPosition) {
    return "";
  }
  return `位置 ${formatDiffNumber(readFiniteNumber(state.x, 0), 2)},${formatDiffNumber(readFiniteNumber(state.y, 0), 2)},${formatDiffNumber(readFiniteNumber(state.z, 0), 2)}`;
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

function readPublishNote() {
  return String(publishNoteInput?.value || "").trim().slice(0, 80);
}

function createPublishRelease({ note, sourceLayout, action = "publish", rollbackFrom = "", existingReleases = [] }) {
  const maxNumber = existingReleases.reduce((max, item) => Math.max(max, Number(item.releaseNumber) || 0), 0);
  const releaseNumber = maxNumber + 1;
  const publishedAt = new Date().toISOString();
  const layout = normalizeSceneLayout(sourceLayout);
  const normalizedNote = String(note || "").trim().slice(0, 80);

  return {
    id: `realistic-release-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    releaseNumber,
    publishedAt,
    note: normalizedNote || (action === "rollback" ? "回滚到写实发布版本" : "未填写发布说明"),
    action: action === "rollback" ? "rollback" : "publish",
    rollbackFrom: rollbackFrom ? String(rollbackFrom) : "",
    layout,
    stats: getLayoutStats(layout)
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
    layout: current?.layout || normalizeSceneLayout({}),
    stats: current?.stats || normalizeLayoutStats({}, current?.layout || normalizeSceneLayout({})),
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
    empty.className = "realistic-panel-status";
    empty.textContent = "暂无发布历史。发布到演示后会保留最近 10 个本机版本。";
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
  row.className = "realistic-publish-row";
  row.classList.toggle("is-current", release.id === currentReleaseId);

  const detail = document.createElement("div");
  detail.className = "realistic-publish-detail";

  const title = document.createElement("strong");
  const actionLabel = release.action === "rollback" ? "回滚" : "发布";
  title.textContent = `v${release.releaseNumber} · ${actionLabel}${release.id === currentReleaseId ? " · 当前" : ""}`;

  const meta = document.createElement("span");
  meta.textContent = `${formatDateTime(release.publishedAt)} · ${formatSnapshotStats(release.stats)} · ${release.note || "无说明"}`;

  detail.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "realistic-publish-actions";

  const rollbackButton = document.createElement("button");
  rollbackButton.type = "button";
  rollbackButton.dataset.featureState = "real-local";
  rollbackButton.dataset.publishAction = "rollback";
  rollbackButton.dataset.releaseId = release.id;
  rollbackButton.disabled = release.id === currentReleaseId;
  rollbackButton.textContent = "回滚";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.featureState = "real-local";
  deleteButton.dataset.publishAction = "delete";
  deleteButton.dataset.releaseId = release.id;
  deleteButton.disabled = release.id === currentReleaseId;
  deleteButton.textContent = "删除";

  actions.append(rollbackButton, deleteButton);
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

  if (button.dataset.publishAction === "rollback") {
    rollbackPublishedRelease(record, release);
    return;
  }

  if (button.dataset.publishAction === "delete") {
    deletePublishedRelease(record, release.id);
  }
}

function rollbackPublishedRelease(record, release) {
  const rollbackRelease = createPublishRelease({
    note: `回滚到 v${release.releaseNumber}：${release.note || "无说明"}`,
    sourceLayout: release.layout,
    action: "rollback",
    rollbackFrom: release.id,
    existingReleases: record.releases
  });
  const nextRecord = buildPublishedRecord(rollbackRelease, [rollbackRelease, ...record.releases]);

  try {
    window.localStorage.setItem(SCENE_PUBLISHED_STORAGE_KEY, JSON.stringify(nextRecord));
    renderPublishPanel();
    setPublishStatus(`已回滚到 v${release.releaseNumber}，并生成新版本 v${rollbackRelease.releaseNumber}。`, "success");
  } catch (error) {
    console.warn("Published scene release could not be rolled back.", error);
    setPublishStatus("回滚发布版本失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function deletePublishedRelease(record, releaseId) {
  if (record.currentReleaseId === releaseId) {
    setPublishStatus("当前发布版本不能删除。请先回滚到其他版本。", "error");
    return;
  }

  const nextReleases = record.releases.filter((release) => release.id !== releaseId);
  const current = nextReleases.find((release) => release.id === record.currentReleaseId);
  const nextRecord = buildPublishedRecord(current, nextReleases);

  try {
    window.localStorage.setItem(SCENE_PUBLISHED_STORAGE_KEY, JSON.stringify(nextRecord));
    renderPublishPanel();
    setPublishStatus("已删除写实发布历史记录。", "success");
  } catch (error) {
    console.warn("Published scene release could not be deleted.", error);
    setPublishStatus("删除发布版本失败，可能是浏览器本机存储空间不足。", "error");
  }
}

function setHistoryStatus(message, tone = "normal") {
  if (!historyStatus) {
    return;
  }
  historyStatus.textContent = message;
  historyStatus.dataset.tone = tone;
}

function openDemoPreview(url) {
  const target = window.open(url, "_blank", "noopener");
  if (!target) {
    window.location.href = url;
  }
}

function formatSnapshotStats(stats = {}) {
  return `${stats.objectStateCount || 0} 已改对象 / ${stats.importedCount || 0} 导入 / ${stats.deletedCount || 0} 删除`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "时间未知";
  }
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeImportedObject(root) {
  const bounds = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  bounds.getCenter(center);
  bounds.getSize(size);
  root.children.forEach((child) => child.position.sub(center));

  const currentLength = Math.max(size.x, size.y, size.z, 0.001);
  root.scale.setScalar(1.35 / currentLength);
  root.position.set(0.35, 0.42, 0.62);
}

function prepareImportedObject(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (!child.material) {
      child.material = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.62, metalness: 0.04 });
    }
  });
}

async function createImportedModelObject(record, arrayBuffer) {
  const normalized = normalizeImportedRecord(record);
  const importedObject = await parseImportedModel(record, arrayBuffer, {
    gltfLoader: importedGltfLoader,
    objLoader: importedObjLoader,
    objMaterial: new THREE.MeshStandardMaterial({ color: 0xc8b08a, roughness: 0.62, metalness: 0.04 })
  });
  const texture = await readImportedModelTexture(normalized).catch((error) => {
    console.warn("Realistic imported model texture could not be loaded.", error);
    return null;
  });
  const root = new THREE.Group();
  root.add(importedObject);
  const metrics = measureImportedModel(root);

  validateImportedModelMetrics(metrics);
  normalizeImportedObject(root);
  prepareImportedObject(root);
  root.userData.importTexture = texture;
  root.userData.importTextureRecord = normalized.texture;
  applyImportedModelMaterial(root, normalized, { texture });
  return {
    root,
    metrics: createImportMetrics(metrics, arrayBuffer.byteLength)
  };
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

function addPreparedImportedModelToScene(record, root, selectAfterLoad = false) {
  const normalized = normalizeImportedRecord(record);
  root.userData.importRecord = normalized;
  root.userData.importTexture = root.userData.importTexture || null;
  root.userData.importTextureRecord = normalized.texture || null;
  scene.add(root);
  registerDesignObject(normalized.id, normalized.label, root);

  if (selectAfterLoad) {
    selectDesignObject(normalized.id);
  }
}

async function addImportedModelToScene(record, arrayBuffer, selectAfterLoad = false) {
  const importPack = await createImportedModelObject(record, arrayBuffer);
  record.metrics = importPack.metrics;
  addPreparedImportedModelToScene(record, importPack.root, selectAfterLoad);
}

async function loadImportedModels() {
  const records = getImportedModelRecords();
  let didUpdateRecords = false;
  for (const record of records) {
    try {
      const stored = await readImportedModel(record);
      if (!stored?.arrayBuffer) continue;
      await addImportedModelToScene(record, stored.arrayBuffer);
      didUpdateRecords = true;
    } catch (error) {
      console.warn("Imported model could not be loaded.", record?.fileName, error);
    }
  }
  if (didUpdateRecords) {
    saveSceneLayout();
  }
}

async function handleImportModel(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const type = getImportFileType(file.name);
  const label = normalizeImportLabel(file.name);

  try {
    validateImportFile(file, {
      type,
      label,
      existingRecords: getImportedModelRecords()
    });
    setImportStatus(`正在校验 ${file.name}...`);
    const id = makeImportedModelId(file.name);
    const record = {
      id,
      dbKey: id,
      type,
      fileName: file.name,
      label,
      color: importModelColorInput?.value || "#c8b08a",
      opacity: normalizeImportOpacity(importModelOpacityInput?.value),
      roughness: normalizeImportRoughness(importModelRoughnessInput?.value),
      metalness: normalizeImportMetalness(importModelMetalnessInput?.value)
    };
    const arrayBuffer = await file.arrayBuffer();
    validateImportBuffer(type, arrayBuffer, file.name);
    record.sha256 = await createArrayBufferSha256(arrayBuffer);
    setImportStatus(`正在解析 ${file.name}...`);
    const importPack = await createImportedModelObject(record, arrayBuffer);
    record.metrics = importPack.metrics;
    await storeImportedModel(record, arrayBuffer);
    getImportedModelRecords().push(record);
    saveSceneLayout();
    createLayoutSnapshot(`导入：${label}`, { status: false });
    addPreparedImportedModelToScene(record, importPack.root, true);
    setImportStatus(`已导入 ${file.name}：${formatImportMetrics(record.metrics)}。`);
  } catch (error) {
    console.warn("Model import failed.", error);
    setImportStatus(`导入失败：${error?.message || "模型文件无法解析"}`);
  } finally {
    event.target.value = "";
  }
}

function snapshotObject(entry) {
  if (!entry) return;
  const { position, rotation } = entry.object;
  return {
    id: entry.id,
    position: {
      x: position.x,
      y: position.y,
      z: position.z
    },
    rotation: {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z
    },
    deleted: entry.object.userData.deleted === true
  };
}

function snapshotsMatch(a, b) {
  if (!a || !b) return false;
  return a.id === b.id &&
    Math.abs(a.position.x - b.position.x) < 0.0001 &&
    Math.abs(a.position.y - b.position.y) < 0.0001 &&
    Math.abs(a.position.z - b.position.z) < 0.0001 &&
    Math.abs(a.rotation.x - b.rotation.x) < 0.0001 &&
    Math.abs(a.rotation.y - b.rotation.y) < 0.0001 &&
    Math.abs(a.rotation.z - b.rotation.z) < 0.0001 &&
    a.deleted === b.deleted;
}

function pushUndoSnapshot(snapshot) {
  if (!isDesignMode || !snapshot) return;
  if (snapshot.kind) {
    undoStack.push(snapshot);
    if (undoStack.length > MAX_UNDO_STEPS) {
      undoStack.shift();
    }
    return;
  }
  const last = undoStack[undoStack.length - 1];
  if (snapshotsMatch(last, snapshot)) return;
  undoStack.push(snapshot);
  if (undoStack.length > MAX_UNDO_STEPS) {
    undoStack.shift();
  }
}

function applySnapshot(snapshot) {
  if (!snapshot) return;
  const entry = designObjects.get(snapshot.id);
  if (!entry) return;

  entry.object.position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
  entry.object.rotation.set(snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z);
  setObjectDeleted(entry, snapshot.deleted, false);
  selectDesignObject(snapshot.id);
  saveObjectTransform(entry);
  syncDesignInputs();
}

async function undoLastChange() {
  if (!isDesignMode || !undoStack.length) return;
  const snapshot = undoStack.pop();
  if (snapshot?.kind === "import-material-update") {
    const entry = designObjects.get(snapshot.id);
    if (entry) {
      try {
        await refreshImportedEntryTexture(entry, snapshot.record);
        applyImportedRecordToEntry(entry, snapshot.record);
        selectDesignObject(entry.id);
        createLayoutSnapshot(`撤回外观：${entry.label}`, { status: false });
        setImportMaterialStatus(`已撤回写实导入模型外观：${entry.label}`);
      } catch (error) {
        console.error(error);
        setImportMaterialStatus(`撤回写实导入模型外观失败：${error.message || entry.label}`);
      }
    }
    return;
  }
  if (snapshot?.kind === "import-file-replace") {
    const entry = designObjects.get(snapshot.id);
    if (!entry || !snapshot.arrayBuffer) {
      setImportStatus("无法撤回写实模型替换：缺少原始模型文件。");
      return;
    }
    try {
      await storeImportedModel(snapshot.record, snapshot.arrayBuffer);
      const importPack = await createImportedModelObject(snapshot.record, snapshot.arrayBuffer);
      const restoredRecord = normalizeImportedRecord({
        ...snapshot.record,
        metrics: importPack.metrics
      });
      replaceImportedEntryModel(entry, restoredRecord, importPack.root, snapshot.snapshot);
      selectDesignObject(entry.id);
      createLayoutSnapshot(`撤回替换：${entry.label}`, { status: false });
      setImportStatus(`已撤回写实导入模型替换：${entry.label}`);
    } catch (error) {
      console.error(error);
      setImportStatus(`撤回写实模型替换失败：${error.message || snapshot.record?.fileName || "模型文件"}`);
    }
    return;
  }
  applySnapshot(snapshot);
}

function saveObjectTransform(entry) {
  if (!entry) return;
  const { position } = entry.object;
  const { rotation } = entry.object;
  savedSceneLayout[entry.id] = {
    x: Number(position.x.toFixed(3)),
    y: Number(position.y.toFixed(3)),
    z: Number(position.z.toFixed(3)),
    rx: Number(rotation.x.toFixed(4)),
    ry: Number(rotation.y.toFixed(4)),
    rz: Number(rotation.z.toFixed(4)),
    deleted: entry.object.userData.deleted === true
  };
  saveSceneLayout();
}

function applySavedTransform(id, object) {
  const saved = savedSceneLayout[id];
  if (!saved) return;

  const x = Number(saved.x);
  const y = Number(saved.y);
  const z = Number(saved.z);
  const rx = Number(saved.rx);
  const ry = Number(saved.ry);
  const rz = Number(saved.rz);
  if (Number.isFinite(x)) object.position.x = x;
  if (Number.isFinite(y)) object.position.y = y;
  if (Number.isFinite(z)) object.position.z = z;
  if (Number.isFinite(rx)) object.rotation.x = rx;
  if (Number.isFinite(ry)) object.rotation.y = ry;
  if (Number.isFinite(rz)) object.rotation.z = rz;
  object.userData.deleted = saved.deleted === true;
  object.visible = object.userData.deleted !== true;
}

function registerDesignObject(id, label, object) {
  if (designObjects.has(id)) return object;

  object.name = label;
  object.userData.designId = id;
  object.userData.designLabel = label;
  object.userData.initialPosition = object.position.clone();
  object.userData.initialRotation = object.rotation.clone();
  applySavedTransform(id, object);

  if (isDesignMode) {
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.userData.designRoot = object;
      selectableMeshes.push(child);
    });
  }

  designObjects.set(id, { id, label, object });

  if (isDesignMode) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    option.dataset.baseLabel = label;
    designObjectSelect.appendChild(option);
    updateObjectOption(entryFromObject(id, label, object));

    if (!selectedDesignObject) {
      selectDesignObject(id);
    }
  }

  return object;
}

function entryFromObject(id, label, object) {
  return designObjects.get(id) || { id, label, object };
}

function updateObjectOption(entry) {
  if (!isDesignMode || !entry) return;
  const option = designObjectSelect.querySelector(`option[value="${entry.id}"]`);
  if (!option) return;

  option.textContent = entry.object.userData.deleted === true ? `${entry.label}（已删除）` : entry.label;
}

function updateDeletedUi() {
  if (!isDesignMode || !selectedDesignObject) return;

  const deleted = selectedDesignObject.object.userData.deleted === true;
  [designXInput, designYInput, designZInput, designRotXInput, designRotYInput, designRotZInput].forEach((input) => {
    if (input) input.disabled = deleted;
  });
  if (focusObjectButton) focusObjectButton.disabled = deleted;
  if (resetObjectButton) resetObjectButton.disabled = false;
  if (deleteObjectButton) deleteObjectButton.disabled = deleted;
  if (restoreObjectButton) restoreObjectButton.disabled = !deleted;
  if (importModelMaterialUpdateButton) {
    importModelMaterialUpdateButton.disabled = !canEditImportedEntry(selectedDesignObject);
  }
  if (importModelReplaceInput) {
    importModelReplaceInput.disabled = !canEditImportedEntry(selectedDesignObject);
  }
  if (importModelTextureInput) {
    importModelTextureInput.disabled = !canEditImportedEntry(selectedDesignObject);
  }
  if (importModelTextureClearButton) {
    const record = selectedDesignObject ? getImportedRecordById(selectedDesignObject.id) || selectedDesignObject.object.userData.importRecord : null;
    importModelTextureClearButton.disabled = !canEditImportedEntry(selectedDesignObject) || !normalizeImportTextureRecord(record?.texture);
  }
}

function setObjectDeleted(entry, deleted, recordUndo = true) {
  if (!entry) return;
  if (entry.object.userData.deleted === deleted) return;

  if (recordUndo) {
    pushUndoSnapshot(snapshotObject(entry));
  }

  entry.object.userData.deleted = deleted;
  entry.object.visible = !deleted;

  if (selectedDesignObject?.id === entry.id) {
    if (deleted) {
      transformControls?.detach();
    } else {
      transformControls?.attach(entry.object);
    }
  }

  updateObjectOption(entry);
  updateDeletedUi();
  syncImportedMaterialEditorFromSelection();
  saveObjectTransform(entry);

  if (recordUndo && isImportedDesignObject(entry)) {
    recordImportedObjectVisibilityAudit(entry, deleted);
  }
}

function deleteSelectedObject() {
  if (!isDesignMode || !selectedDesignObject) return;
  setObjectDeleted(selectedDesignObject, true);
}

function restoreSelectedObject() {
  if (!isDesignMode || !selectedDesignObject) return;
  setObjectDeleted(selectedDesignObject, false);
}

function selectDesignObject(id) {
  if (!isDesignMode || !transformControls) return;
  const entry = designObjects.get(id);
  if (!entry) return;

  selectedDesignObject = entry;
  designObjectSelect.value = id;
  if (entry.object.userData.deleted === true) {
    transformControls.detach();
  } else {
    transformControls.attach(entry.object);
  }
  controls.autoRotate = false;
  motionButton.textContent = "开始旋转";
  syncDesignInputs();
  updateDeletedUi();
  syncImportedMaterialEditorFromSelection();
}

function syncDesignInputs() {
  if (!isDesignMode || !selectedDesignObject) return;

  const { position } = selectedDesignObject.object;
  const { rotation } = selectedDesignObject.object;
  designXInput.value = position.x.toFixed(2);
  designYInput.value = position.y.toFixed(2);
  designZInput.value = position.z.toFixed(2);
  if (designRotXInput && designRotYInput && designRotZInput) {
    designRotXInput.value = toDegrees(rotation.x).toFixed(1);
    designRotYInput.value = toDegrees(rotation.y).toFixed(1);
    designRotZInput.value = toDegrees(rotation.z).toFixed(1);
  }
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
    setImportRoughnessControl(0.62);
    setImportMetalnessControl(0.04);
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
    setImportMaterialStatus(selectedDesignObject
      ? "当前选中对象不是写实导入模型；可导入 GLB / OBJ 后再编辑外观。"
      : "选中写实导入模型后，可调整颜色、透明度、粗糙度、金属度和贴图并写入草稿和发布版本。");
    return;
  }

  const record = getImportedRecordById(entry.id) || entry.object.userData.importRecord || {};
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
  setImportMaterialStatus(canEditImportedEntry(entry)
    ? `已载入：${entry.label}。${textureText}可调整材质参数，或选择 GLB / OBJ / 图片替换当前资产。`
    : `已载入：${entry.label}，需恢复显示后才能更新外观。`);
}

function updateSelectedImportedMaterial() {
  const entry = getSelectedImportedEntry();
  if (!entry) {
    setImportMaterialStatus("请选择一个写实导入模型后再更新外观。");
    return;
  }
  if (!canEditImportedEntry(entry)) {
    setImportMaterialStatus("当前写实导入模型已删除，需恢复显示后才能更新外观。");
    return;
  }

  const beforeRecord = clonePlain(getImportedRecordById(entry.id) || entry.object.userData.importRecord || {});
  const nextRecord = normalizeImportedRecord({
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
    setImportMaterialStatus("当前写实导入模型外观没有变化。");
    return;
  }

  pushUndoSnapshot({
    kind: "import-material-update",
    id: entry.id,
    record: beforeRecord
  });
  applyImportedRecordToEntry(entry, nextRecord);
  createLayoutSnapshot(`外观：${entry.label}`, { status: false });
  setImportMaterialStatus(`已更新：${entry.label}。颜色、透明度、粗糙度和金属度已写入写实草稿和后续发布版本。`);
  setImportStatus(`已更新写实导入模型外观：${entry.label}`);
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
      throw new Error("请选择一个写实导入模型后再替换文件。");
    }
    if (!canEditImportedEntry(entry)) {
      throw new Error("当前写实导入模型已删除，需恢复显示后才能替换文件。");
    }

    const type = getImportFileType(file.name);
    validateImportFile(file, {
      type,
      label: entry.label,
      existingRecords: getImportedModelRecords().filter((record) => record.id !== entry.id)
    });

    const beforeRecord = clonePlain(getImportedRecordById(entry.id) || entry.object.userData.importRecord || {});
    const beforeSnapshot = snapshotObject(entry);
    const previousStored = await readImportedModel(beforeRecord).catch((error) => {
      console.warn("Realistic imported model file could not be prepared for replace undo.", error);
      return null;
    });

    setImportStatus(`正在校验替换文件 ${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    validateImportBuffer(type, arrayBuffer, file.name);
    const nextRecord = normalizeImportedRecord({
      ...beforeRecord,
      type,
      fileName: file.name,
      sha256: await createArrayBufferSha256(arrayBuffer)
    });
    setImportStatus(`正在解析替换文件 ${file.name}...`);
    const importPack = await createImportedModelObject(nextRecord, arrayBuffer);
    const normalized = normalizeImportedRecord({
      ...nextRecord,
      metrics: importPack.metrics
    });

    await storeImportedModel(normalized, arrayBuffer);
    pushUndoSnapshot({
      kind: "import-file-replace",
      id: entry.id,
      record: beforeRecord,
      snapshot: beforeSnapshot,
      arrayBuffer: previousStored?.arrayBuffer ? previousStored.arrayBuffer.slice(0) : null
    });
    replaceImportedEntryModel(entry, normalized, importPack.root, beforeSnapshot);
    selectDesignObject(entry.id);
    createLayoutSnapshot(`替换模型：${entry.label}`, { status: false });
    setImportStatus(`已替换写实导入模型：${entry.label} · ${normalized.fileName} · ${formatImportMetrics(normalized.metrics)}。`);
    setImportMaterialStatus(`已替换：${entry.label}。新文件已写入写实草稿和后续发布版本。`);
  } catch (error) {
    console.error(error);
    setImportStatus(`替换写实模型失败：${error.message || file.name}`);
    setImportMaterialStatus(`替换失败：${error.message || file.name}`);
  } finally {
    event.target.value = "";
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

async function replaceSelectedImportedModelTexture(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const entry = getSelectedImportedEntry();
  try {
    if (!entry) {
      throw new Error("请选择一个写实导入模型后再替换贴图。");
    }
    if (!canEditImportedEntry(entry)) {
      throw new Error("当前写实导入模型已删除，需恢复显示后才能替换贴图。");
    }

    const type = getImportTextureType(file.name, file.type);
    validateImportTextureFile(file, { type });

    const beforeRecord = clonePlain(getImportedRecordById(entry.id) || entry.object.userData.importRecord || {});
    setImportMaterialStatus(`正在读取贴图 ${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    const textureRecord = createImportTextureRecord(file, beforeRecord, await createArrayBufferSha256(arrayBuffer));
    const texture = await createThreeTextureFromArrayBuffer(arrayBuffer, textureRecord);
    const nextRecord = normalizeImportedRecord({
      ...beforeRecord,
      texture: textureRecord
    });

    await storeImportedTextureAsset(textureRecord, arrayBuffer);
    pushUndoSnapshot({
      kind: "import-material-update",
      id: entry.id,
      record: beforeRecord
    });
    entry.object.userData.importTexture = texture;
    entry.object.userData.importTextureRecord = textureRecord;
    applyImportedRecordToEntry(entry, nextRecord);
    selectDesignObject(entry.id);
    createLayoutSnapshot(`贴图：${entry.label}`, { status: false });
    setImportMaterialStatus(`已替换贴图：${entry.label} · ${textureRecord.fileName} · SHA ${textureRecord.sha256.slice(0, 12)}。`);
    setImportStatus(`已替换写实导入模型贴图：${entry.label}。贴图文件保存在本机 IndexedDB，并会随发布版本引用。`);
  } catch (error) {
    console.error(error);
    setImportMaterialStatus(`替换贴图失败：${error.message || file.name}`);
    setImportStatus(`替换写实贴图失败：${error.message || file.name}`);
  } finally {
    event.target.value = "";
  }
}

function clearSelectedImportedModelTexture() {
  const entry = getSelectedImportedEntry();
  try {
    if (!entry) {
      throw new Error("请选择一个写实导入模型后再移除贴图。");
    }
    if (!canEditImportedEntry(entry)) {
      throw new Error("当前写实导入模型已删除，需恢复后才能移除贴图。");
    }

    const beforeRecord = clonePlain(getImportedRecordById(entry.id) || entry.object.userData.importRecord);
    const previousTexture = normalizeImportTextureRecord(beforeRecord.texture);
    if (!previousTexture) {
      setImportMaterialStatus("当前写实导入模型没有自定义贴图。");
      return;
    }

    const beforeSnapshot = snapshotObject(entry);
    const nextRecord = normalizeImportedRecord({
      ...beforeRecord,
      texture: null
    });
    pushUndoSnapshot({
      kind: "import-material-update",
      id: entry.id,
      record: beforeRecord,
      snapshot: beforeSnapshot
    });
    entry.object.userData.importTexture = null;
    entry.object.userData.importTextureRecord = null;
    applyImportedRecordToEntry(entry, nextRecord);
    saveObjectTransform(entry);
    selectDesignObject(entry.id);
    createLayoutSnapshot(`移除贴图：${entry.label}`, { status: false });
    setImportMaterialStatus(`已移除贴图：${entry.label} · ${previousTexture.fileName}。当前模型已恢复为颜色/PBR 材质。`);
    setImportStatus(`已移除写实导入模型贴图引用：${entry.label}。原贴图文件仍保留给历史快照或已发布版本读取。`);
  } catch (error) {
    console.error(error);
    setImportMaterialStatus(`移除贴图失败：${error.message || "未知错误"}`);
    setImportStatus(`移除贴图失败：${error.message || "未知错误"}`);
  }
}

function applyImportedRecordToEntry(entry, record) {
  if (!entry || !isImportedDesignObject(entry)) {
    return;
  }

  const normalized = upsertImportedRecord(record);
  entry.object.userData.importRecord = normalized;
  entry.object.userData.importTextureRecord = normalized.texture || null;
  entry.object.userData.designLabel = normalized.label;
  entry.label = normalized.label;
  applyImportedModelMaterial(entry.object, normalized, {
    disposePrevious: true,
    texture: entry.object.userData.importTexture
  });
  updateObjectOption(entry);
  saveSceneLayout();
  renderPublishDiff();
}

function replaceImportedEntryModel(entry, record, nextRoot, snapshot = null) {
  if (!entry || !isImportedDesignObject(entry) || !nextRoot) {
    return;
  }

  const normalized = upsertImportedRecord(record);
  transformControls?.detach();
  disposeImportedEntryModelChildren(entry.object);
  entry.object.scale.copy(nextRoot.scale);
  [...nextRoot.children].forEach((child) => entry.object.add(child));
  entry.object.userData.importRecord = normalized;
  entry.object.userData.importTexture = nextRoot.userData.importTexture || entry.object.userData.importTexture || null;
  entry.object.userData.importTextureRecord = normalized.texture || null;
  entry.object.userData.designLabel = normalized.label;
  entry.label = normalized.label;
  registerImportedEntryMeshes(entry.object);
  if (snapshot) {
    entry.object.position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
    entry.object.rotation.set(snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z);
    entry.object.userData.deleted = snapshot.deleted === true;
    entry.object.visible = entry.object.userData.deleted !== true;
  }
  updateObjectOption(entry);
  saveObjectTransform(entry);
  saveSceneLayout();
  renderPublishDiff();
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
  if (!isDesignMode) {
    return;
  }
  root.traverse((child) => {
    if (!child.isMesh) {
      return;
    }
    child.userData.designRoot = root;
    if (!selectableMeshes.includes(child)) {
      selectableMeshes.push(child);
    }
  });
}

function getSelectedImportedEntry() {
  return selectedDesignObject && isImportedDesignObject(selectedDesignObject) ? selectedDesignObject : null;
}

function canEditImportedEntry(entry) {
  return Boolean(entry)
    && isImportedDesignObject(entry)
    && entry.object.userData.deleted !== true;
}

function applyDesignInputs() {
  if (!isDesignMode || !selectedDesignObject) return;

  const nextX = Number.parseFloat(designXInput.value);
  const nextY = Number.parseFloat(designYInput.value);
  const nextZ = Number.parseFloat(designZInput.value);
  const nextRotX = Number.parseFloat(designRotXInput?.value);
  const nextRotY = Number.parseFloat(designRotYInput?.value);
  const nextRotZ = Number.parseFloat(designRotZInput?.value);
  if (Number.isFinite(nextX)) selectedDesignObject.object.position.x = nextX;
  if (Number.isFinite(nextY)) selectedDesignObject.object.position.y = nextY;
  if (Number.isFinite(nextZ)) selectedDesignObject.object.position.z = nextZ;
  if (Number.isFinite(nextRotX)) selectedDesignObject.object.rotation.x = toRadians(nextRotX);
  if (Number.isFinite(nextRotY)) selectedDesignObject.object.rotation.y = toRadians(nextRotY);
  if (Number.isFinite(nextRotZ)) selectedDesignObject.object.rotation.z = toRadians(nextRotZ);
  saveObjectTransform(selectedDesignObject);
}

function beginInputEdit() {
  if (!isDesignMode || !selectedDesignObject || inputStartSnapshot) return;
  inputStartSnapshot = snapshotObject(selectedDesignObject);
}

function commitInputEdit() {
  if (!isDesignMode || !selectedDesignObject || !inputStartSnapshot) return;
  const nextSnapshot = snapshotObject(selectedDesignObject);
  if (!snapshotsMatch(inputStartSnapshot, nextSnapshot)) {
    pushUndoSnapshot(inputStartSnapshot);
  }
  inputStartSnapshot = null;
}

function setTransformMode(mode) {
  if (!isDesignMode || !transformControls) return;
  transformControls.setMode(mode);
  translateModeButton?.classList.toggle("is-active", mode === "translate");
  rotateModeButton?.classList.toggle("is-active", mode === "rotate");
}

function pickDesignObject(event) {
  if (!isDesignMode || event.button !== 0) return;
  if (transformControls?.axis || transformControls?.dragging) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(selectableMeshes, false).filter((hit) => {
    const root = hit.object.userData.designRoot;
    return root?.visible !== false && root?.userData?.deleted !== true;
  });
  if (!hits.length) return;

  const root = hits[0].object.userData.designRoot;
  if (root?.userData?.designId) {
    selectDesignObject(root.userData.designId);
  }
}

function focusSelectedObject() {
  if (!isDesignMode || !selectedDesignObject) return;

  const target = selectedDesignObject.object.getWorldPosition(new THREE.Vector3());
  controls.target.copy(target);
  controls.update();
}

function resetSelectedObject() {
  if (!isDesignMode || !selectedDesignObject) return;

  pushUndoSnapshot(snapshotObject(selectedDesignObject));
  selectedDesignObject.object.position.copy(selectedDesignObject.object.userData.initialPosition);
  selectedDesignObject.object.rotation.copy(selectedDesignObject.object.userData.initialRotation);
  selectedDesignObject.object.userData.deleted = false;
  selectedDesignObject.object.visible = true;
  transformControls?.attach(selectedDesignObject.object);
  delete savedSceneLayout[selectedDesignObject.id];
  saveSceneLayout();
  updateObjectOption(selectedDesignObject);
  updateDeletedUi();
  syncImportedMaterialEditorFromSelection();
  syncDesignInputs();
}

function handleTransformObjectChange() {
  if (!isDesignMode || !selectedDesignObject) return;
  syncDesignInputs();
  saveObjectTransform(selectedDesignObject);
}

function beginTransformDrag() {
  if (!isDesignMode || !selectedDesignObject) return;
  dragStartSnapshot = snapshotObject(selectedDesignObject);
}

function endTransformDrag() {
  if (!isDesignMode || !selectedDesignObject || !dragStartSnapshot) return;
  const nextSnapshot = snapshotObject(selectedDesignObject);
  if (!snapshotsMatch(dragStartSnapshot, nextSnapshot)) {
    pushUndoSnapshot(dragStartSnapshot);
  }
  dragStartSnapshot = null;
}

function handleEditorKeydown(event) {
  if (!isDesignMode) return;
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && key === "z" && !event.shiftKey) {
    event.preventDefault();
    commitInputEdit();
    undoLastChange();
    return;
  }
  if (key === "w") {
    setTransformMode("translate");
  }
  if (key === "e") {
    setTransformMode("rotate");
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
  const acknowledgedAt = readAdminRiskAcknowledgements().realisticScene || "";
  const acknowledged = Boolean(acknowledgedAt);
  adminRiskBanner.classList.toggle("is-acknowledged", acknowledged);
  adminRiskStatus.textContent = acknowledged
    ? `已确认本机权限边界：${formatAdminRiskTime(acknowledgedAt)}`
    : "尚未确认本机权限边界。";
  if (adminRiskAcknowledgeButton) {
    adminRiskAcknowledgeButton.textContent = acknowledged ? "重新确认" : "已了解";
  }
}

function acknowledgeAdminRisk() {
  writeAdminRiskAcknowledgement("realisticScene");
  renderAdminRiskBanner();
  setImportStatus("已记录：写实后台是本机静态编辑页，不含登录和角色权限。");
}

function bindUi() {
  renderAdminRiskBanner();
  adminRiskAcknowledgeButton?.addEventListener("click", acknowledgeAdminRisk);

  resetButton.addEventListener("click", () => {
    camera.position.set(4.4, 3.1, 5.6);
    controls.target.set(0.15, 0.4, 0.05);
    controls.update();
  });

  motionButton.addEventListener("click", () => {
    controls.autoRotate = !controls.autoRotate;
    motionButton.textContent = controls.autoRotate ? "暂停旋转" : "开始旋转";
  });

  if (isDesignMode && transformControls) {
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });

    transformControls.addEventListener("mouseDown", beginTransformDrag);
    transformControls.addEventListener("mouseUp", endTransformDrag);
    transformControls.addEventListener("objectChange", handleTransformObjectChange);
    renderer.domElement.addEventListener("pointerdown", pickDesignObject);
    designObjectSelect.addEventListener("change", () => selectDesignObject(designObjectSelect.value));
    [designXInput, designYInput, designZInput, designRotXInput, designRotYInput, designRotZInput].forEach((input) => {
      input.addEventListener("focus", beginInputEdit);
      input.addEventListener("input", applyDesignInputs);
      input.addEventListener("change", commitInputEdit);
      input.addEventListener("blur", commitInputEdit);
    });
    translateModeButton?.addEventListener("click", () => setTransformMode("translate"));
    rotateModeButton?.addEventListener("click", () => setTransformMode("rotate"));
    undoActionButton?.addEventListener("click", undoLastChange);
    focusObjectButton.addEventListener("click", focusSelectedObject);
    resetObjectButton.addEventListener("click", resetSelectedObject);
    deleteObjectButton?.addEventListener("click", deleteSelectedObject);
    restoreObjectButton?.addEventListener("click", restoreSelectedObject);
    importModelInput?.addEventListener("change", handleImportModel);
    importModelOpacityInput?.addEventListener("input", updateImportOpacityOutput);
    importModelRoughnessInput?.addEventListener("input", updateImportRoughnessOutput);
    importModelMetalnessInput?.addEventListener("input", updateImportMetalnessOutput);
    importModelReplaceInput?.addEventListener("change", replaceSelectedImportedModelFile);
    importModelTextureInput?.addEventListener("change", replaceSelectedImportedModelTexture);
    importModelTextureClearButton?.addEventListener("click", clearSelectedImportedModelTexture);
    importModelMaterialUpdateButton?.addEventListener("click", updateSelectedImportedMaterial);
    importAuditCleanupButton?.addEventListener("click", cleanupDeletedImportedModelFiles);
    importAuditExportButton?.addEventListener("click", exportImportAudit);
    renderImportAuditPanel();
    previewDraftButton?.addEventListener("click", () => openDemoPreview("realistic-demo.html?realisticPreview=draft"));
    openLiveButton?.addEventListener("click", () => openDemoPreview("realistic-demo.html"));
    publishLayoutButton?.addEventListener("click", publishLayoutToDemo);
    remotePublishSaveButton?.addEventListener("click", saveRemotePublishConfig);
    remotePublishCheckButton?.addEventListener("click", checkRemotePublishApi);
    remotePublishPushButton?.addEventListener("click", pushRemotePublishedLayout);
    remotePublishRevokeButton?.addEventListener("click", revokeRemotePublishedLayout);
    remotePublishRequestReviewButton?.addEventListener("click", requestRemotePublishReview);
    remotePublishApproveReviewButton?.addEventListener("click", approveRemotePublishReview);
    remotePublishRejectReviewButton?.addEventListener("click", rejectRemotePublishReview);
    remotePublishUnlockButton?.addEventListener("click", unlockRemotePublish);
    remotePublishReceiptExportButton?.addEventListener("click", exportRemotePublishReceipts);
    snapshotCreateButton?.addEventListener("click", () => createLayoutSnapshot("手动快照"));
    snapshotRefreshButton?.addEventListener("click", () => {
      layoutHistory = loadLayoutHistory();
      renderHistoryPanel();
      setHistoryStatus("已刷新保存历史列表。", "success");
    });
    snapshotList?.addEventListener("click", handleSnapshotListClick);
    publishHistoryList?.addEventListener("click", handlePublishHistoryClick);
    renderPublishPanel();
    renderHistoryPanel();
    window.addEventListener("keydown", handleEditorKeydown);
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
