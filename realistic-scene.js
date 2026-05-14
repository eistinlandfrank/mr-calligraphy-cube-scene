import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

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
const isDesignMode = Boolean(designObjectSelect && designXInput && designYInput && designZInput);
const SCENE_LAYOUT_STORAGE_KEY = "mr-calligraphy-realistic-layout-v1";
const IMPORTED_MODEL_LIST_KEY = "importedModels";
const IMPORT_DB_NAME = "mr-calligraphy-model-store";
const IMPORT_DB_STORE = "models";
const MAX_UNDO_STEPS = 256;

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
const savedSceneLayout = loadSavedSceneLayout();

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

function loadSavedSceneLayout() {
  try {
    const raw = window.localStorage.getItem(SCENE_LAYOUT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn("Scene layout could not be read from localStorage.", error);
    return {};
  }
}

function saveSceneLayout() {
  try {
    window.localStorage.setItem(SCENE_LAYOUT_STORAGE_KEY, JSON.stringify(savedSceneLayout));
  } catch (error) {
    console.warn("Scene layout could not be saved to localStorage.", error);
  }
}

function getImportedModelRecords() {
  if (!Array.isArray(savedSceneLayout[IMPORTED_MODEL_LIST_KEY])) {
    savedSceneLayout[IMPORTED_MODEL_LIST_KEY] = [];
  }
  return savedSceneLayout[IMPORTED_MODEL_LIST_KEY];
}

function openImportDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(IMPORT_DB_NAME, 1);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMPORT_DB_STORE)) {
        db.createObjectStore(IMPORT_DB_STORE, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function storeImportedModel(record, arrayBuffer) {
  const db = await openImportDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(IMPORT_DB_STORE, "readwrite");
    transaction.objectStore(IMPORT_DB_STORE).put({
      id: record.dbKey,
      fileName: record.fileName,
      type: record.type,
      arrayBuffer
    });
    transaction.addEventListener("complete", resolve);
    transaction.addEventListener("error", () => reject(transaction.error));
  });
  db.close();
}

async function readImportedModel(record) {
  const db = await openImportDb();
  const result = await new Promise((resolve, reject) => {
    const transaction = db.transaction(IMPORT_DB_STORE, "readonly");
    const request = transaction.objectStore(IMPORT_DB_STORE).get(record.dbKey);
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
  db.close();
  return result;
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

function getFileExtension(fileName) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function setImportStatus(message) {
  if (importStatus) importStatus.textContent = message;
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

function parseImportedModel(record, arrayBuffer) {
  if (record.type === "glb") {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.parse(arrayBuffer.slice(0), "", (gltf) => resolve(gltf.scene || gltf.scenes?.[0]), reject);
    });
  }

  if (record.type === "obj") {
    const text = new TextDecoder().decode(arrayBuffer);
    const object = new OBJLoader().parse(text);
    object.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xc8b08a, roughness: 0.64, metalness: 0.03 });
      }
    });
    return Promise.resolve(object);
  }

  return Promise.reject(new Error(`Unsupported model type: ${record.type}`));
}

async function addImportedModelToScene(record, arrayBuffer, selectAfterLoad = false) {
  const importedObject = await parseImportedModel(record, arrayBuffer);
  const root = new THREE.Group();
  root.add(importedObject);
  normalizeImportedObject(root);
  prepareImportedObject(root);
  scene.add(root);
  registerDesignObject(record.id, record.label, root);

  if (selectAfterLoad) {
    selectDesignObject(record.id);
  }
}

async function loadImportedModels() {
  const records = getImportedModelRecords();
  for (const record of records) {
    try {
      const stored = await readImportedModel(record);
      if (!stored?.arrayBuffer) continue;
      await addImportedModelToScene(record, stored.arrayBuffer);
    } catch (error) {
      console.warn("Imported model could not be loaded.", record?.fileName, error);
    }
  }
}

async function handleImportModel(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const type = getFileExtension(file.name);
  if (!["glb", "obj"].includes(type)) {
    setImportStatus("只支持 .glb 和 .obj 文件。");
    event.target.value = "";
    return;
  }

  try {
    setImportStatus(`正在导入 ${file.name}...`);
    const id = makeImportedModelId(file.name);
    const record = {
      id,
      dbKey: id,
      type,
      fileName: file.name,
      label: file.name.replace(/\.[^.]+$/, "")
    };
    const arrayBuffer = await file.arrayBuffer();
    await storeImportedModel(record, arrayBuffer);
    getImportedModelRecords().push(record);
    saveSceneLayout();
    await addImportedModelToScene(record, arrayBuffer, true);
    setImportStatus(`已导入 ${file.name}。`);
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

function undoLastChange() {
  if (!isDesignMode || !undoStack.length) return;
  const snapshot = undoStack.pop();
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
  saveObjectTransform(entry);
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
function bindUi() {
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



