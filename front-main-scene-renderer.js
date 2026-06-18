import * as THREE from "./assets/vendor/three/three.module.js";
import { RoomEnvironment } from "./assets/vendor/three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "./assets/vendor/three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "./assets/vendor/three/addons/loaders/OBJLoader.js";
import {
  createModelStore,
  getImportTextureMimeType,
  measureImportedModel,
  normalizeImportTextureRecord,
  parseImportedModel
} from "./model-import-utils.js";

const DEFAULT_LIGHTING = {
  ambient: 0.55,
  environment: 0.55,
  key: 320,
  rim: 0.45,
  exposure: 0.82
};
const CUSTOM_TYPE_SIZES = {
  box: { width: 0.8, height: 0.8, depth: 0.8 },
  cylinder: { radius: 0.38, height: 0.9 },
  plane: { width: 1.4, height: 0.08, depth: 0.9 }
};
const WRITING_DESK_PLACEHOLDER_IDS = new Set([
  "desktop-paper",
  "desktop-inkstone",
  "desktop-gold-brush",
  "desktop-red-brush"
]);
const WRITING_DESK_OBJECT_SPECS = {
  "writing-paper": { id: "writing-paper", position: [0, -0.95, -3.42], rotation: [0, -1.7, 0], scale: 1 },
  "writing-ink-character": { id: "writing-ink-character", position: [-0.08, -0.91, -3.44], rotation: [0, -1.7, 0], scale: 1 },
  "writing-inkstone": { id: "writing-inkstone", position: [-1.68, -0.89, -3.9], rotation: [0, -1.7, 0], scale: 1 },
  "writing-brush": { id: "writing-brush", position: [0.68, -0.78, -3.78], rotation: [-4.6, 189, 10.3], scale: 1 },
  "writing-seal": { id: "writing-seal", position: [1.34, -0.77, -2.84], rotation: [0, -14.3, 0], scale: 1 },
  "writing-guide-glass": { id: "writing-guide-glass", position: [2.36, 0.17, -4.47], rotation: [-6.9, -48.7, -2.3], scale: 1 }
};

export async function createFrontMainSceneRenderer(canvas, options = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11100e);
  scene.fog = new THREE.Fog(0x11100e, 13, 28);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const textureLoader = new THREE.TextureLoader();
  const loader = new GLTFLoader();
  const objLoader = new OBJLoader();
  const importedTextureLoader = new THREE.TextureLoader();
  const importedModelStore = createModelStore({
    dbName: options.importDbName || "mr-calligraphy-main-model-store",
    storeName: options.importDbStore || "models",
    keyPath: "key"
  });
  const objectRoot = new THREE.Group();
  const writingDeskRoot = new THREE.Group();
  scene.add(objectRoot);
  scene.add(writingDeskRoot);

  let layout = normalizeLayout(options.layout);
  let roomTextures = { ...(options.textures || {}) };
  let lighting = normalizeLighting(layout.lighting);
  let buildToken = 0;
  let writingDeskVisible = false;
  const roomMaterials = new Map();
  const lightRig = {};
  const materials = createMaterials();

  buildLights();
  buildRoom();
  buildWritingDeskLayer();
  await rebuildObjects();
  render(options.yaw || 0, options.pitch || -5, options.scale || 1);

  return {
    kind: "front-three-admin-renderer",
    render,
    setTextures(nextTextures = {}) {
      roomTextures = { ...roomTextures, ...nextTextures };
      updateRoomTextures();
    },
    setRoles() {
      render();
    },
    async setMainSceneLayout(nextLayout) {
      layout = normalizeLayout(nextLayout || layout);
      lighting = normalizeLighting(layout.lighting);
      applyLighting();
      await rebuildObjects();
      applyWritingDeskLayout();
      render();
    },
    setWritingDeskVisible(visible) {
      writingDeskVisible = Boolean(visible);
      writingDeskRoot.visible = writingDeskVisible;
      syncWritingDeskPlaceholders();
      if (typeof window !== "undefined") {
        window.MR_WRITING_DESK_VISIBLE = writingDeskVisible;
      }
      render();
    },
    dispose() {
      renderer.dispose();
      pmrem.dispose();
    }
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
      clay: new THREE.MeshStandardMaterial({ color: 0x574433, roughness: 0.76 }),
      writingPaper: new THREE.MeshPhysicalMaterial({ map: createWritingPaperTexture(), color: 0xfff4dd, roughness: 0.92, sheen: 0.22, sheenRoughness: 0.86 }),
      writingInk: new THREE.MeshPhysicalMaterial({ map: createWritingInkTexture(), color: 0x070504, roughness: 0.36, clearcoat: 0.18, clearcoatRoughness: 0.72 }),
      writingStone: new THREE.MeshStandardMaterial({ color: 0x171819, roughness: 0.84, metalness: 0.04 }),
      writingLacquer: new THREE.MeshPhysicalMaterial({ color: 0x6c251a, roughness: 0.34, clearcoat: 0.72, clearcoatRoughness: 0.24 }),
      writingBristle: new THREE.MeshStandardMaterial({ color: 0x1c100a, roughness: 0.9 }),
      writingGlass: new THREE.MeshPhysicalMaterial({ color: 0x98d8cc, roughness: 0.12, transparent: true, opacity: 0.2, transmission: 0.18, thickness: 0.06 })
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

  function applyLighting() {
    lighting = normalizeLighting(lighting);
    lightRig.ambient.intensity = lighting.ambient;
    lightRig.key.intensity = lighting.key;
    lightRig.rim.intensity = lighting.rim;
    renderer.toneMappingExposure = lighting.exposure;
    if ("environmentIntensity" in scene) {
      scene.environmentIntensity = lighting.environment;
    }
    applyEnvironmentIntensityToScene();
  }

  function buildRoom() {
    const addWall = (key, mesh) => {
      const material = createRoomMaterial(key);
      mesh.material = material;
      roomMaterials.set(key, material);
      scene.add(mesh);
    };

    const wallFront = new THREE.Mesh(new THREE.PlaneGeometry(16, 8.4));
    wallFront.position.set(0, 1, -8);
    addWall("front", wallFront);

    const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(16, 8.4));
    wallBack.position.set(0, 1, 8);
    wallBack.rotation.y = Math.PI;
    addWall("back", wallBack);

    const wallLeft = new THREE.Mesh(new THREE.PlaneGeometry(16, 8.4));
    wallLeft.position.set(-8, 1, 0);
    wallLeft.rotation.y = Math.PI / 2;
    addWall("left", wallLeft);

    const wallRight = new THREE.Mesh(new THREE.PlaneGeometry(16, 8.4));
    wallRight.position.set(8, 1, 0);
    wallRight.rotation.y = -Math.PI / 2;
    addWall("right", wallRight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16));
    floor.position.y = -3.2;
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    addWall("floor", floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(16, 16));
    ceiling.position.y = 5.2;
    ceiling.rotation.x = Math.PI / 2;
    addWall("ceiling", ceiling);
  }

  function createRoomMaterial(key) {
    const texture = textureLoader.load(roomTextures[key] || `assets/cube/${key === "floor" ? "floor" : key === "ceiling" ? "ceiling" : `wall-wood-${key}`}.png`, () => render());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.72, side: THREE.DoubleSide });
  }

  function updateRoomTextures() {
    roomMaterials.forEach((material, key) => {
      const texture = textureLoader.load(roomTextures[key] || "", () => render());
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      material.map?.dispose?.();
      material.map = texture;
      material.needsUpdate = true;
    });
  }

  async function rebuildObjects() {
    const token = ++buildToken;
    clearGroup(objectRoot);
    updateLoadCounters({ loaded: 0, vertices: 0, textured: 0 });
    const modelPromises = (options.modelSpecs || []).map((spec) => createModelObject(normalizeModelSpec(spec), token));
    (options.decorSpecs || []).forEach((spec) => createDecorObject(normalizeDecorSpec(spec)));
    layout.customObjects.forEach(createCustomObject);
    const importedPromises = layout.importedModels.map((record) => createImportedModel(record, token));
    const results = await Promise.allSettled([...modelPromises, ...importedPromises]);
    const stats = results.reduce((summary, result) => {
      if (result.status !== "fulfilled" || !result.value) return summary;
      summary.loaded += result.value.loaded || 0;
      summary.vertices += result.value.vertices || 0;
      summary.textured += result.value.textured || 0;
      return summary;
    }, { loaded: 0, vertices: 0, textured: 0 });
    updateLoadCounters(stats);
    applyEnvironmentIntensityToScene(objectRoot);
    render();
  }

  async function createModelObject(spec, token) {
    const group = new THREE.Group();
    group.name = spec.id;
    group.userData.objectId = spec.id;
    group.userData.scaleFactor = getVisualScaleFactor(spec);
    applyState(group, getState(spec));
    group.userData.baseVisible = group.visible;
    objectRoot.add(group);

    try {
      const gltf = await loader.loadAsync(spec.src);
      if (token !== buildToken) return;
      const model = gltf.scene;
      normalizeModelPivot(model);
      model.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        tintMaterial(child, spec.tint);
      });
      group.add(model);
      applyEnvironmentIntensityToScene(model);
      render();
      return { loaded: 1, vertices: countMeshVertices(model), textured: 0 };
    } catch (error) {
      options.onNotice?.(`模型加载失败：${spec.label || spec.id}`);
      return null;
    }
  }

  function createDecorObject(spec) {
    const group = createDecorGroup(spec);
    group.name = spec.id;
    group.userData.objectId = spec.id;
    group.userData.scaleFactor = 1;
    applyState(group, getState(spec));
    group.userData.baseVisible = group.visible;
    if (WRITING_DESK_PLACEHOLDER_IDS.has(spec.id)) {
      group.visible = writingDeskVisible ? false : group.userData.baseVisible;
    }
    objectRoot.add(group);
  }

  function createDecorGroup(spec) {
    if (spec.id.includes("scroll")) {
      if (spec.id.includes("front")) return createWallScroll(0.52, 2.05);
      if (spec.id.includes("back")) return createWallScroll(0.82, 1.86);
      return createWallScroll(0.78, 1.74);
    }
    if (spec.id === "brush-rack") return createBrushRack();
    if (spec.id === "ink-set") return createInkSet();
    if (spec.id === "desktop-ceramic-jar") return createJar(0.28);
    if (spec.id === "floor-ceramic-jar") return createJar(0.34);
    if (spec.id === "low-display-stand") return createLowStand();
    if (spec.id === "desktop-paper") return createBoxObject(1.95, 0.04, 1.32, materials.paper);
    if (spec.id === "desktop-inkstone") return createBoxObject(0.52, 0.14, 0.38, materials.ink);
    if (spec.id === "desktop-gold-brush") return createBoxObject(1.12, 0.055, 0.07, materials.brass);
    if (spec.id === "desktop-red-brush") return createBoxObject(1, 0.05, 0.065, materials.red);
    if (spec.id.includes("ceiling-beam")) return createBoxObject(16, 0.18, 0.24, materials.darkWood);
    return createBoxObject(0.5, 0.5, 0.5, materials.wood);
  }

  function buildWritingDeskLayer() {
    writingDeskRoot.name = "front-writing-desk-layer";
    writingDeskRoot.position.set(0, -0.95, -3.42);
    writingDeskRoot.rotation.y = -0.03;
    writingDeskRoot.visible = false;

    createWritingPaper();
    createWritingInkCharacter();
    createWritingInkstone();
    createWritingSeal();
    createWritingGuideGlass();
    loadWritingBrush();
    applyWritingDeskLayout();
    applyEnvironmentIntensityToScene(writingDeskRoot);
  }

  function createWritingPaper() {
    const paperRoot = new THREE.Group();
    paperRoot.name = "writing-paper";
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(2.78, 1.7, 24, 16), materials.writingPaper);
    paper.rotation.x = -Math.PI / 2;
    paper.receiveShadow = true;
    paperRoot.add(paper);

    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0xf8edd7, roughness: 0.96 });
    const leftEdge = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.018, 1.7), edgeMaterial);
    leftEdge.position.set(-1.39, 0.018, 0);
    leftEdge.castShadow = true;
    paperRoot.add(leftEdge);

    const bottomEdge = new THREE.Mesh(new THREE.BoxGeometry(2.78, 0.016, 0.018), edgeMaterial);
    bottomEdge.position.set(0, 0.017, 0.85);
    bottomEdge.castShadow = true;
    paperRoot.add(bottomEdge);

    registerWritingDeskObject(paperRoot, "writing-paper");
    writingDeskRoot.add(paperRoot);
  }

  function createWritingInkCharacter() {
    const inkRoot = new THREE.Group();
    const material = new THREE.MeshPhysicalMaterial({
      map: createCalligraphyTexture(),
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      roughness: 0.52,
      metalness: 0,
      clearcoat: 0.16,
      clearcoatRoughness: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const inkPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.24, 1.56), material);
    inkPlane.rotation.x = -Math.PI / 2;
    inkPlane.renderOrder = 5;
    inkRoot.add(inkPlane);
    registerWritingDeskObject(inkRoot, "writing-ink-character");
    writingDeskRoot.add(inkRoot);
  }

  function createWritingInkstone() {
    const inkstoneRoot = new THREE.Group();
    inkstoneRoot.name = "writing-inkstone";
    inkstoneRoot.position.set(-1.68, 0.06, -0.48);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.13, 56), materials.writingStone);
    base.scale.z = 0.72;
    base.castShadow = true;
    base.receiveShadow = true;
    inkstoneRoot.add(base);

    const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.022, 56), materials.writingInk);
    ink.position.y = 0.078;
    ink.scale.z = 0.64;
    ink.castShadow = true;
    inkstoneRoot.add(ink);

    registerWritingDeskObject(inkstoneRoot, "writing-inkstone");
    writingDeskRoot.add(inkstoneRoot);
  }

  function createWritingSeal() {
    const sealRoot = new THREE.Group();
    const seal = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.28), materials.red);
    seal.castShadow = true;
    seal.receiveShadow = true;
    sealRoot.add(seal);
    registerWritingDeskObject(sealRoot, "writing-seal");
    writingDeskRoot.add(sealRoot);
  }

  function createWritingGuideGlass() {
    const panelRoot = new THREE.Group();
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.5), materials.writingGlass);
    panel.castShadow = true;
    panelRoot.add(panel);
    registerWritingDeskObject(panelRoot, "writing-guide-glass");
    writingDeskRoot.add(panelRoot);
  }

  function loadWritingBrush() {
    const brushRoot = new THREE.Group();
    brushRoot.name = "writing-brush";
    brushRoot.position.set(0.68, 0.17, -0.38);
    brushRoot.rotation.set(-0.08, Math.PI * 1.05, 0.18);
    const fallback = createWritingBrushFallback();
    brushRoot.add(fallback);
    registerWritingDeskObject(brushRoot, "writing-brush");
    writingDeskRoot.add(brushRoot);

    loader.loadAsync("assets/models/brush-web.glb?v=embedded-brush-20260514")
      .then((gltf) => {
        const brush = gltf.scene || gltf.scenes?.[0];
        if (!brush) return;
        brushRoot.clear();
        prepareWritingBrushModel(brush);
        brushRoot.add(brush);
        render();
      })
      .catch(() => {
        // The procedural brush remains in place when the GLB is unavailable.
      });
  }

  function registerWritingDeskObject(object, id) {
    object.name = id;
    object.userData.objectId = id;
    object.userData.scaleFactor = 1;
    applyWritingDeskObjectState(object, WRITING_DESK_OBJECT_SPECS[id]);
  }

  function applyWritingDeskLayout() {
    writingDeskRoot.updateMatrixWorld(true);
    writingDeskRoot.children.forEach((child) => {
      const id = child.userData.objectId || child.name;
      if (!WRITING_DESK_OBJECT_SPECS[id]) return;
      applyWritingDeskObjectState(child, WRITING_DESK_OBJECT_SPECS[id]);
    });
  }

  function applyWritingDeskObjectState(object, spec) {
    if (!object || !spec) return;
    const state = getState(spec);
    writingDeskRoot.updateMatrixWorld(true);
    const localPosition = writingDeskRoot.worldToLocal(new THREE.Vector3(state.x, state.y, state.z));
    object.position.copy(localPosition);
    object.rotation.set(
      toRadians(state.rx) - writingDeskRoot.rotation.x,
      toRadians(state.ry) - writingDeskRoot.rotation.y,
      toRadians(state.rz) - writingDeskRoot.rotation.z
    );
    object.scale.setScalar(state.scale || 1);
    object.visible = state.deleted !== true && state.hidden !== true;
  }

  function prepareWritingBrushModel(brush) {
    const bounds = new THREE.Box3().setFromObject(brush);
    if (!bounds.isEmpty()) {
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      bounds.getCenter(center);
      bounds.getSize(size);
      brush.position.sub(center);
      const targetLength = 1.46;
      const currentLength = Math.max(size.x, size.y, size.z, 0.001);
      brush.scale.setScalar(targetLength / currentLength);
    }
    brush.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.envMapIntensity = lighting.environment;
        child.material.needsUpdate = true;
      }
    });
  }

  function createWritingBrushFallback() {
    const group = new THREE.Group();
    const handleStart = new THREE.Vector3(0.72, 0.04, -0.42);
    const handleEnd = new THREE.Vector3(-0.72, 0.12, 0.08);
    const ferruleStart = new THREE.Vector3(-0.68, 0.12, 0.07);
    const ferruleEnd = new THREE.Vector3(-0.96, 0.12, 0.16);
    const bristleBase = new THREE.Vector3(-0.98, 0.11, 0.17);
    const tipEnd = new THREE.Vector3(-1.28, -0.05, 0.3);

    group.add(createCylinderBetween(handleStart, handleEnd, 0.038, materials.writingLacquer, 48));
    group.add(createCylinderBetween(ferruleStart, ferruleEnd, 0.062, materials.brass, 48));
    group.add(createConeBetween(bristleBase, tipEnd, 0.1, materials.writingBristle, 48));
    return group;
  }

  function createCylinderBetween(start, end, radius, material, segments = 32) {
    const direction = end.clone().sub(start);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function createConeBetween(base, tip, radius, material, segments = 32) {
    const direction = tip.clone().sub(base);
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, direction.length(), segments, 16), material);
    mesh.position.copy(base).add(tip).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    return mesh;
  }

  function createWritingPaperTexture() {
    const canvasTexture = document.createElement("canvas");
    canvasTexture.width = 1024;
    canvasTexture.height = 640;
    const ctx = canvasTexture.getContext("2d");
    ctx.fillStyle = "#fbf0d9";
    ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);
    for (let i = 0; i < 120; i += 1) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvasTexture.width, Math.random() * canvasTexture.height);
      ctx.lineTo(Math.random() * canvasTexture.width, Math.random() * canvasTexture.height);
      ctx.strokeStyle = "rgba(125, 96, 55, 0.075)";
      ctx.lineWidth = Math.random() * 1.7;
      ctx.stroke();
    }
    addCanvasNoise(ctx, canvasTexture.width, canvasTexture.height, 12);
    // Keep the paper texture blank; the visible glyph is the backend-controllable
    // writing-ink-character object above the paper.
    return makeCanvasTexture(canvasTexture, 1, 1);
  }

  function createWritingInkTexture() {
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
    addCanvasNoise(ctx, 512, 512, 22);
    return makeCanvasTexture(canvasTexture, 1, 1);
  }

  function createCalligraphyTexture() {
    const canvasTexture = document.createElement("canvas");
    canvasTexture.width = 1024;
    canvasTexture.height = 720;
    const ctx = canvasTexture.getContext("2d");
    ctx.clearRect(0, 0, canvasTexture.width, canvasTexture.height);
    ctx.save();
    ctx.translate(512, 388);
    ctx.rotate(-0.045);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '500px "KaiTi", "STKaiti", "Kaiti SC", "SimSun", serif';

    for (let i = 0; i < 10; i += 1) {
      ctx.save();
      ctx.globalAlpha = 0.035;
      ctx.filter = `blur(${4 + i * 0.45}px)`;
      ctx.fillStyle = "#130d09";
      ctx.translate((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 12);
      ctx.scale(1 + (Math.random() - 0.5) * 0.018, 1 + (Math.random() - 0.5) * 0.014);
      ctx.fillText("永", 0, -6);
      ctx.restore();
    }

    ctx.filter = "none";
    ctx.globalAlpha = 0.94;
    const inkGradient = ctx.createLinearGradient(-190, -260, 195, 270);
    inkGradient.addColorStop(0, "#060403");
    inkGradient.addColorStop(0.42, "#120b07");
    inkGradient.addColorStop(0.7, "#050302");
    inkGradient.addColorStop(1, "#261a12");
    ctx.fillStyle = inkGradient;
    ctx.fillText("永", 0, -6);

    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 72; i += 1) {
      const x = -215 + Math.random() * 430;
      const y = -250 + Math.random() * 500;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.9 + Math.random() * 0.32);
      ctx.globalAlpha = 0.05 + Math.random() * 0.12;
      ctx.fillStyle = "#000";
      ctx.fillRect(-1, -20 - Math.random() * 60, 2 + Math.random() * 6, 35 + Math.random() * 105);
      ctx.restore();
    }

    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < 42; i += 1) {
      const radius = 0.6 + Math.random() * 3.2;
      ctx.beginPath();
      ctx.globalAlpha = 0.08 + Math.random() * 0.18;
      ctx.fillStyle = "#090504";
      ctx.arc(-235 + Math.random() * 470, -270 + Math.random() * 530, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    addInkEdge(ctx, 1024, 720);
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

  function makeCanvasTexture(canvasTexture, repeatX, repeatY) {
    const texture = new THREE.CanvasTexture(canvasTexture);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  function addCanvasNoise(ctx, width, height, strength) {
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

  function createCustomObject(record) {
    const spec = normalizeCustomObject(record);
    const group = createCustomGroup(spec);
    group.userData.scaleFactor = 1;
    applyState(group, getState(spec));
    objectRoot.add(group);
  }

  function createCustomGroup(spec) {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.color),
      roughness: 0.62,
      metalness: 0.02
    });
    const group = new THREE.Group();
    let mesh;
    if (spec.type === "cylinder") {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(spec.size.radius, spec.size.radius, spec.size.height, 32), material);
    } else {
      const fallback = spec.type === "plane" ? CUSTOM_TYPE_SIZES.plane : CUSTOM_TYPE_SIZES.box;
      mesh = new THREE.Mesh(new THREE.BoxGeometry(spec.size.width || fallback.width, spec.size.height || fallback.height, spec.size.depth || fallback.depth), material);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }

  async function createImportedModel(record, token) {
    const normalized = normalizeImportedModel(record);
    const stored = await importedModelStore.read(normalized).catch(() => null);
    if (!stored?.arrayBuffer || token !== buildToken) return;
    const model = await parseImportedModel(normalized, stored.arrayBuffer, { gltfLoader: loader, objLoader }).catch(() => null);
    if (!model || token !== buildToken) return;

    normalizeImportedModelPivot(model, normalized);
    prepareImportedModel(model);
    const texture = await readImportedModelTexture(normalized).catch(() => null);
    model.userData.importTexture = texture;
    applyImportedModelMaterial(model, normalized, { texture });

    const group = new THREE.Group();
    group.add(model);
    group.userData.scaleFactor = normalized.baseScale || 1;
    applyState(group, getState(normalized));
    objectRoot.add(group);
    render();
    return { loaded: 1, vertices: countMeshVertices(model), textured: texture ? 1 : 0 };
  }

  async function readImportedModelTexture(record) {
    const textureRecord = normalizeImportTextureRecord(record.texture);
    if (!textureRecord) return null;
    const stored = await importedModelStore.read({
      id: textureRecord.dbKey,
      dbKey: textureRecord.dbKey,
      type: textureRecord.type,
      fileName: textureRecord.fileName
    });
    if (!stored?.arrayBuffer) return null;
    const blob = new Blob([stored.arrayBuffer.slice(0)], { type: getImportTextureMimeType(textureRecord.type) });
    const url = URL.createObjectURL(blob);
    try {
      const texture = await importedTextureLoader.loadAsync(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    } finally {
      URL.revokeObjectURL(url);
    }
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
    const fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xc8b08a, roughness: 0.64, metalness: 0.02 });
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (!child.material) child.material = fallbackMaterial;
    });
  }

  function applyImportedModelMaterial(root, record, { texture = null } = {}) {
    const color = new THREE.Color(normalizeColor(record.color, "#c8b08a"));
    const opacity = clampNumber(record.opacity, 0.2, 1, 1);
    const roughness = clampNumber(record.roughness, 0.05, 1, 0.64);
    const metalness = clampNumber(record.metalness, 0, 1, 0.02);
    root.traverse((child) => {
      if (!child.isMesh) return;
      const list = Array.isArray(child.material) ? child.material : [child.material].filter(Boolean);
      const next = list.length ? list.map((material) => cloneImportedMaterial(material, color, opacity, roughness, metalness, texture)) : [
        new THREE.MeshStandardMaterial({ color, map: texture, opacity, transparent: opacity < 0.999, depthWrite: opacity >= 0.999, roughness, metalness })
      ];
      child.material = Array.isArray(child.material) ? next : next[0];
    });
  }

  function cloneImportedMaterial(material, color, opacity, roughness, metalness, texture) {
    const next = material?.clone ? material.clone() : new THREE.MeshStandardMaterial({ roughness, metalness });
    if (next.color?.set) next.color.set(color);
    next.opacity = opacity;
    next.transparent = opacity < 0.999;
    next.depthWrite = opacity >= 0.999;
    next.roughness = roughness;
    next.metalness = metalness;
    if (texture) next.map = texture;
    next.needsUpdate = true;
    return next;
  }

  function createBoxObject(width, height, depth, material, position = [0, 0, 0]) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
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
    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
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
      [-0.24, 0.24].forEach((z) => group.add(createBoxObject(0.12, 0.34, 0.12, materials.darkWood, [x, -0.22, z]).children[0]));
    });
    return group;
  }

  function getState(spec) {
    const saved = layout.objects?.[spec.id] || {};
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
      hidden: saved.hidden === true
    };
  }

  function applyState(object, state) {
    const scaleFactor = object.userData.scaleFactor || 1;
    object.position.set(state.x, state.y, state.z);
    object.rotation.set(toRadians(state.rx), toRadians(state.ry), toRadians(state.rz));
    object.scale.setScalar(state.scale * scaleFactor);
    object.visible = state.deleted !== true && state.hidden !== true;
  }

  function syncWritingDeskPlaceholders() {
    objectRoot.children.forEach((child) => {
      if (!WRITING_DESK_PLACEHOLDER_IDS.has(child.userData.objectId || child.name)) return;
      child.visible = writingDeskVisible ? false : child.userData.baseVisible !== false;
    });
  }

  function makeDefaultState(spec) {
    const rotation = spec.rotation || [0, 0, 0];
    return {
      id: spec.id,
      x: spec.position?.[0] || 0,
      y: spec.position?.[1] || 0,
      z: spec.position?.[2] || 0,
      rx: rotation[0] || 0,
      ry: rotation[1] || 0,
      rz: rotation[2] || 0,
      scale: spec.scale || 1,
      deleted: false,
      hidden: false
    };
  }

  function render(yaw = 0, pitch = -5, scale = 1) {
    resize();
    const target = writingDeskVisible
      ? new THREE.Vector3(0, -0.8, -3.42)
      : new THREE.Vector3(0, -0.35, -3.6);
    const baseRadius = writingDeskVisible ? 4.2 : 8.4;
    const radius = clampNumber(baseRadius / Math.max(scale, 0.2), writingDeskVisible ? 2.15 : 2.6, writingDeskVisible ? 6.2 : 16);
    const yawRad = toRadians(yaw);
    const pitchRad = toRadians(clampNumber(pitch, -45, 45, -5));
    const horizontal = Math.cos(pitchRad) * radius;
    camera.position.set(
      target.x + Math.sin(yawRad) * horizontal,
      target.y + Math.sin(pitchRad) * radius,
      target.z + Math.cos(yawRad) * horizontal
    );
    camera.lookAt(target);
    renderer.render(scene, camera);
  }

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.floor(width * pixelRatio));
    const nextHeight = Math.max(1, Math.floor(height * pixelRatio));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    }
  }

  function applyEnvironmentIntensityToScene(root = scene) {
    root.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const list = Array.isArray(child.material) ? child.material : [child.material];
      list.forEach((material) => {
        if (!material) return;
        material.envMapIntensity = lighting.environment;
        material.needsUpdate = true;
      });
    });
  }

  function updateLoadCounters(stats) {
    if (typeof window === "undefined") return;
    window.MR_LOADED_MODEL_COUNT = stats.loaded;
    window.MR_LOADED_MODEL_VERTICES = stats.vertices;
    window.MR_LOADED_TEXTURED_MODEL_COUNT = stats.textured;
  }

  function countMeshVertices(root) {
    let vertices = 0;
    root.traverse((child) => {
      if (!child.isMesh) return;
      vertices += child.geometry?.attributes?.position?.count || 0;
    });
    return vertices;
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
      next.needsUpdate = true;
      return next;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(applyTint) : applyTint(mesh.material);
  }
}

function normalizeLayout(layout = {}) {
  const source = layout && typeof layout === "object" ? layout : {};
  return {
    objects: source.objects && typeof source.objects === "object" ? { ...source.objects } : {},
    customObjects: Array.isArray(source.customObjects) ? source.customObjects.map(normalizeCustomObject) : [],
    importedModels: Array.isArray(source.importedModels) ? source.importedModels.map(normalizeImportedModel) : [],
    lighting: source.lighting && typeof source.lighting === "object" ? { ...source.lighting } : { ...DEFAULT_LIGHTING }
  };
}

function normalizeModelSpec(spec = {}) {
  return {
    id: String(spec.id || ""),
    label: String(spec.label || spec.id || ""),
    src: String(spec.src || ""),
    position: Array.isArray(spec.position) ? spec.position.map((value) => readNumber(value, 0)) : [0, 0, 0],
    rotation: Array.isArray(spec.rotation)
      ? spec.rotation.map((value) => readNumber(value, 0))
      : [readNumber(spec.rotationX, 0), readNumber(spec.rotationY, 0), readNumber(spec.rotationZ, 0)],
    scale: readNumber(spec.scale, 1),
    tint: Array.isArray(spec.tint) ? spec.tint : null
  };
}

function normalizeDecorSpec(spec = {}) {
  return {
    id: String(spec.id || ""),
    label: String(spec.label || spec.id || ""),
    position: Array.isArray(spec.position) ? spec.position.map((value) => readNumber(value, 0)) : [0, 0, 0],
    rotation: Array.isArray(spec.rotation) ? spec.rotation.map((value) => readNumber(value, 0)) : [0, 0, 0],
    scale: readNumber(spec.scale, 1)
  };
}

function normalizeCustomObject(record = {}, index = 0) {
  const type = ["box", "cylinder", "plane"].includes(record.type) ? record.type : "box";
  const fallbackSize = CUSTOM_TYPE_SIZES[type];
  const position = Array.isArray(record.position) ? record.position : [0, -1.05, -3.2];
  const rotation = Array.isArray(record.rotation) ? record.rotation : [0, 0, 0];
  return {
    id: String(record.id || `custom-${index + 1}`),
    label: String(record.label || `新增物体 ${index + 1}`),
    type,
    color: normalizeColor(record.color, "#8b5a2b"),
    size: { ...fallbackSize, ...(record.size || {}) },
    position: position.map((value, axis) => readNumber(value, axis === 1 ? -1.05 : axis === 2 ? -3.2 : 0)),
    rotation: rotation.map((value) => readNumber(value, 0)),
    scale: readNumber(record.scale, 1)
  };
}

function normalizeImportedModel(record = {}, index = 0) {
  const fileName = String(record.fileName || "model.glb");
  const position = Array.isArray(record.position) ? record.position : [0, -1.05, -3.2];
  const rotation = Array.isArray(record.rotation) ? record.rotation : [0, 0, 0];
  const baseScale = Number(record.baseScale);
  return {
    id: String(record.id || `imported-${index + 1}`),
    dbKey: String(record.dbKey || record.id || `imported-${index + 1}`),
    label: String(record.label || fileName.replace(/\.(glb|obj)$/i, "") || `Imported model ${index + 1}`),
    fileName,
    type: record.type === "obj" ? "obj" : "glb",
    color: normalizeColor(record.color, "#c8b08a"),
    opacity: clampNumber(record.opacity, 0.2, 1, 1),
    roughness: clampNumber(record.roughness, 0.05, 1, 0.64),
    metalness: clampNumber(record.metalness, 0, 1, 0.02),
    position: position.map((value, axis) => readNumber(value, axis === 1 ? -1.05 : axis === 2 ? -3.2 : 0)),
    rotation: rotation.map((value) => readNumber(value, 0)),
    scale: readNumber(record.scale, 1),
    baseScale: Number.isFinite(baseScale) && baseScale > 0 ? baseScale : undefined,
    texture: normalizeImportTextureRecord(record.texture),
    metrics: record.metrics || {},
    sha256: String(record.sha256 || "")
  };
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

function getVisualScaleFactor(spec) {
  return Number(spec.scale || 1) > 50 ? 0.01 : 1;
}

function clearGroup(group) {
  while (group.children.length) {
    group.remove(group.children[0]);
  }
}

function normalizeColor(value, fallback) {
  const string = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(string) ? string : fallback;
}

function readNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function toRadians(degrees) {
  return (Number(degrees) || 0) * Math.PI / 180;
}
