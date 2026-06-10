import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const IMPORT_DB_NAME = "mr-calligraphy-main-model-store";
const IMPORT_DB_STORE = "models";
const DEFAULT_LIGHTING = {
  ambient: 0.55,
  environment: 0.55,
  key: 320,
  rim: 0.45,
  exposure: 0.82
};
const DEFAULT_TEXTURES = {
  front: "assets/cube/wall-wood-front.png",
  back: "assets/cube/wall-wood-back.png",
  left: "assets/cube/wall-wood-left.png",
  right: "assets/cube/wall-wood-right.png",
  ceiling: "assets/cube/ceiling.png",
  floor: "assets/cube/floor.png"
};
const CUSTOM_TYPE_SIZES = {
  box: { width: 0.8, height: 0.8, depth: 0.8 },
  cylinder: { radius: 0.38, height: 0.9 },
  plane: { width: 1.4, height: 0.08, depth: 0.9 }
};
const MODEL_SPECS = [
  { id: "front-doorway", src: "assets/models/poly-pizza-cc0/japanese-door-quaternius.glb", position: [0, -3.1, -7.92], rotation: [0, 0, 0], scale: 118, tint: [0.62, 0.38, 0.2] },
  { id: "left-window", src: "assets/models/kenney-furniture-kit/wallWindow.glb", position: [-5.15, -1.75, -7.9], rotation: [0, 0, 0], scale: 2.45, tint: [0.62, 0.42, 0.26] },
  { id: "right-window", src: "assets/models/kenney-furniture-kit/wallWindow.glb", position: [5.15, -1.75, -7.9], rotation: [0, 0, 0], scale: 2.45, tint: [0.62, 0.42, 0.26] },
  { id: "left-bookcase", src: "assets/models/poly-pizza-cc0/bookshelf-creative-trio.glb", position: [-7.25, -3.12, -4.4], rotation: [0, 90, 0], scale: 380, tint: [0.58, 0.36, 0.2] },
  { id: "right-bookcase", src: "assets/models/poly-pizza-cc0/bookshelf-creative-trio.glb", position: [7.25, -3.12, -3.05], rotation: [0, -90, 0], scale: 380, tint: [0.56, 0.34, 0.19] },
  { id: "main-writing-table", src: "assets/models/poly-pizza-cc0/table-creative-trio.glb", position: [0, -3.12, -3.45], rotation: [0, 0, 0], scale: 410, tint: [0.58, 0.35, 0.18] },
  { id: "left-chair", src: "assets/models/kenney-furniture-kit/chair.glb", position: [-3.25, -3.12, -2.4], rotation: [0, 24, 0], scale: 3.3, tint: [0.48, 0.28, 0.15] },
  { id: "right-chair", src: "assets/models/kenney-furniture-kit/chair.glb", position: [3.25, -3.12, -2.4], rotation: [0, -24, 0], scale: 3.3, tint: [0.48, 0.28, 0.15] },
  { id: "woven-rug", src: "assets/models/kenney-furniture-kit/rugRectangle.glb", position: [0, -3.09, -3.2], rotation: [0, 0, 0], scale: 4.15, tint: [0.46, 0.34, 0.24] },
  { id: "side-cabinet", src: "assets/models/kenney-furniture-kit/sideTableDrawers.glb", position: [6.15, -3.12, 0.6], rotation: [0, -90, 0], scale: 3.15, tint: [0.52, 0.31, 0.17] },
  { id: "desk-books", src: "assets/models/kenney-furniture-kit/books.glb", position: [-1.4, -1.4, -3.0], rotation: [0, 12, 0], scale: 4.1, tint: [0.74, 0.56, 0.38] },
  { id: "front-left-potted-plant", src: "assets/models/poly-pizza-kenney-decor/potted-plant-kenney.glb", position: [-6.65, -3.12, -7.3], rotation: [0, 18, 0], scale: 2.6, tint: [0.88, 1.05, 0.82] },
  { id: "right-corner-potted-plant", src: "assets/models/poly-pizza-kenney-decor/potted-plant-kenney.glb", position: [7.15, -3.12, 5.4], rotation: [0, -58, 0], scale: 2.35, tint: [0.84, 1.02, 0.78] },
  { id: "desk-small-plant", src: "assets/models/poly-pizza-kenney-decor/plant-small-kenney.glb", position: [1.74, -1.38, -3.74], rotation: [0, -24, 0], scale: 1.36, tint: [0.78, 1.1, 0.7] },
  { id: "front-left-wall-lamp", src: "assets/models/poly-pizza-kenney-decor/lamp-wall-kenney.glb", position: [-6.9, -0.25, -7.88], rotation: [0, 0, 0], scale: 2.1, tint: [1.08, 0.84, 0.54] },
  { id: "front-right-wall-lamp", src: "assets/models/poly-pizza-kenney-decor/lamp-wall-kenney.glb", position: [6.9, -0.25, -7.88], rotation: [0, 0, 0], scale: 2.1, tint: [1.08, 0.84, 0.54] },
  { id: "side-table-lamp", src: "assets/models/poly-pizza-kenney-decor/lamp-square-table-kenney.glb", position: [6.1, -1.75, 0.64], rotation: [0, -90, 0], scale: 2.45, tint: [1.0, 0.82, 0.58] },
  { id: "left-coat-rack", src: "assets/models/poly-pizza-kenney-decor/coat-rack-standing-kenney.glb", position: [-7.35, -3.12, 4.7], rotation: [0, 88, 0], scale: 2.4, tint: [0.58, 0.36, 0.2] },
  { id: "tea-corner-round-rug", src: "assets/models/poly-pizza-kenney-decor/rug-round-kenney.glb", position: [4.75, -3.08, 5.1], rotation: [0, -12, 0], scale: 3.35, tint: [0.52, 0.34, 0.24] }
];

export function createAdminLikeRoomRenderer(options) {
  const canvas = options.canvas;
  const getLayout = options.getLayout || (() => ({}));
  const getTextures = options.getTextures || (() => DEFAULT_TEXTURES);
  const getRoles = options.getRoles || (() => []);
  const notify = typeof options.showNotice === "function" ? options.showNotice : () => {};
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const loader = new GLTFLoader();
  const objLoader = new OBJLoader();
  const textureLoader = new THREE.TextureLoader();
  const materials = createMaterials();
  const roomGroup = new THREE.Group();
  const objectGroup = new THREE.Group();
  const roleGroup = new THREE.Group();
  const lightRig = {};
  let layout = normalizeLayout(getLayout());
  let textures = normalizeTextures(getTextures());
  let roles = normalizeRoles(getRoles());
  let lighting = normalizeLighting(layout.lighting);
  let dbPromise = null;
  let rebuildToken = 0;
  let lastView = { yaw: 0, pitch: -7, scale: 1 };

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.background = new THREE.Color(0x11100e);
  scene.fog = new THREE.Fog(0x11100e, 13, 28);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.add(roomGroup, objectGroup, roleGroup);

  buildLights();
  rebuildRoom();
  rebuildSceneObjects();
  rebuildRoles();
  render();

  function setTextures(nextTextures) {
    textures = normalizeTextures(nextTextures);
    rebuildRoom();
    render();
  }

  function setRoles(nextRoles) {
    roles = normalizeRoles(nextRoles);
    rebuildRoles();
    render();
  }

  function setMainSceneLayout() {
    layout = normalizeLayout(getLayout());
    lighting = normalizeLighting(layout.lighting);
    applyLighting();
    rebuildSceneObjects();
    render();
  }

  function render(yaw = lastView.yaw, pitch = lastView.pitch, scale = lastView.scale) {
    lastView = { yaw, pitch, scale };
    resizeRenderer();
    applyViewerCamera(yaw, pitch, scale);
    renderer.render(scene, camera);
  }

  function resizeRenderer() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  function applyViewerCamera(yaw, pitch, scale) {
    const target = new THREE.Vector3(0, -0.35, -3.6);
    const radius = clamp(10.25 / clamp(scale, 0.55, 1.85), 5.8, 15.5);
    const yawRad = degToRad(yaw);
    const pitchRad = degToRad(clamp(pitch + 12, -34, 34));
    const horizontal = Math.cos(pitchRad) * radius;

    camera.fov = 48;
    camera.position.set(
      target.x + Math.sin(yawRad) * horizontal,
      target.y + Math.sin(pitchRad) * radius,
      target.z + Math.cos(yawRad) * horizontal
    );
    camera.lookAt(target);
    camera.updateProjectionMatrix();
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
    if (lightRig.ambient) lightRig.ambient.intensity = lighting.ambient;
    if (lightRig.key) lightRig.key.intensity = lighting.key;
    if (lightRig.rim) lightRig.rim.intensity = lighting.rim;
    renderer.toneMappingExposure = lighting.exposure;
    if ("environmentIntensity" in scene) {
      scene.environmentIntensity = lighting.environment;
    }
    applyEnvironmentIntensityToScene(scene, lighting.environment);
  }

  function rebuildRoom() {
    clearGroup(roomGroup);
    roomGroup.add(makeWall("front", new THREE.PlaneGeometry(16, 8.4), [0, 1, -8], [0, 0, 0]));
    roomGroup.add(makeWall("back", new THREE.PlaneGeometry(16, 8.4), [0, 1, 8], [0, Math.PI, 0]));
    roomGroup.add(makeWall("left", new THREE.PlaneGeometry(16, 8.4), [-8, 1, 0], [0, Math.PI / 2, 0]));
    roomGroup.add(makeWall("right", new THREE.PlaneGeometry(16, 8.4), [8, 1, 0], [0, -Math.PI / 2, 0]));
    roomGroup.add(makeWall("floor", new THREE.PlaneGeometry(16, 16), [0, -3.2, 0], [-Math.PI / 2, 0, 0]));
    roomGroup.add(makeWall("ceiling", new THREE.PlaneGeometry(16, 16), [0, 5.2, 0], [Math.PI / 2, 0, 0]));
  }

  function makeWall(face, geometry, position, rotation) {
    const mesh = new THREE.Mesh(geometry, makeTextureMaterial(textures[face] || DEFAULT_TEXTURES[face]));
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.receiveShadow = face === "floor";
    return mesh;
  }

  function makeTextureMaterial(src) {
    const texture = textureLoader.load(src, () => render());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.72, side: THREE.DoubleSide });
  }

  async function rebuildSceneObjects() {
    const token = ++rebuildToken;
    let loaded = 0;

    clearGroup(objectGroup);
    layout = normalizeLayout(getLayout());
    MODEL_SPECS.forEach((spec) => addBuiltInModel(spec, token).then((ok) => {
      if (ok && token === rebuildToken) loaded += 1;
      updateStats(loaded);
    }));
    DECOR_SPECS.forEach((spec) => addDecorObject(spec));
    layout.customObjects.forEach((spec, index) => addCustomObject(normalizeCustomObject(spec, index)));

    for (const record of layout.importedModels) {
      addImportedModel(record, token).then((ok) => {
        if (ok && token === rebuildToken) loaded += 1;
        updateStats(loaded);
      });
    }

    updateStats(loaded);
    render();
  }

  async function addBuiltInModel(spec, token) {
    const state = getState(makeDefaultState(spec));
    if (state.deleted) return false;

    const group = new THREE.Group();
    group.userData.scaleFactor = getVisualScaleFactor(spec);
    applyState(group, state);
    objectGroup.add(group);

    try {
      const gltf = await loader.loadAsync(spec.src);
      if (token !== rebuildToken) return false;
      const model = gltf.scene;
      normalizeModelPivot(model);
      prepareModel(model);
      tintModel(model, spec.tint);
      group.add(model);
      applyEnvironmentIntensityToScene(model, lighting.environment);
      render();
      return true;
    } catch (error) {
      console.warn("Model could not be loaded.", spec.id, error);
      return false;
    }
  }

  function addDecorObject(spec) {
    const state = getState(makeDefaultState(spec));
    if (state.deleted) return;

    const group = spec.create(materials);
    applyState(group, state);
    objectGroup.add(group);
  }

  function addCustomObject(spec) {
    const state = getState(makeDefaultState(spec));
    if (state.deleted) return;

    const group = createCustomGroup(spec);
    applyState(group, state);
    objectGroup.add(group);
  }

  async function addImportedModel(record, token) {
    const normalized = normalizeImportedModel(record);
    const state = getState(makeDefaultState(normalized));
    if (state.deleted) return false;

    try {
      const stored = await readImportedModel(normalized);
      if (!stored?.arrayBuffer) return false;

      const model = await parseImportedModel(normalized, stored.arrayBuffer);
      if (token !== rebuildToken) return false;

      normalizeImportedModelPivot(model, normalized);
      prepareModel(model);
      const group = new THREE.Group();
      group.userData.scaleFactor = normalized.baseScale || 1;
      group.add(model);
      applyState(group, state);
      objectGroup.add(group);
      applyEnvironmentIntensityToScene(group, lighting.environment);
      render();
      return true;
    } catch (error) {
      console.warn("Imported model could not be loaded.", normalized.id, error);
      return false;
    }
  }

  function rebuildRoles() {
    clearGroup(roleGroup);
    roles.filter((role) => role.visible).forEach((role) => {
      roleGroup.add(createRoleFigure(role));
    });
  }

  function updateStats(loaded) {
    window.MR_LOADED_MODEL_COUNT = loaded;
    window.MR_LOADED_MODEL_VERTICES = null;
    notify(`Loaded ${loaded} Three.js models.`);
  }

  function getState(fallback) {
    const saved = layout.objects[fallback.id] || {};
    return {
      ...fallback,
      x: readNumber(saved.x, fallback.x),
      y: readNumber(saved.y, fallback.y),
      z: readNumber(saved.z, fallback.z),
      rx: readNumber(saved.rx, fallback.rx),
      ry: readNumber(saved.ry, fallback.ry),
      rz: readNumber(saved.rz, fallback.rz),
      scale: readNumber(saved.scale, fallback.scale),
      deleted: saved.deleted === true
    };
  }

  function readImportedModel(record) {
    return openImportDb().then((db) => new Promise((resolve, reject) => {
      const transaction = db.transaction(IMPORT_DB_STORE, "readonly");
      const store = transaction.objectStore(IMPORT_DB_STORE);
      const request = store.get(record.dbKey);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("Could not read imported model."));
    }));
  }

  function openImportDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not available."));
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
      request.onerror = () => reject(request.error || new Error("Could not open imported model storage."));
    });
    return dbPromise;
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

  return { render, setTextures, setRoles, setMainSceneLayout };
}

const DECOR_SPECS = [
  { id: "desktop-paper", position: [0, -1.44, -3.42], scale: 1, create: (m) => createBoxObject(1.95, 0.04, 1.32, m.paper) },
  { id: "desktop-inkstone", position: [-1.38, -1.38, -3.25], scale: 1, create: (m) => createBoxObject(0.52, 0.14, 0.38, m.ink) },
  { id: "desktop-gold-brush", position: [1.18, -1.36, -3.25], scale: 1, create: (m) => createBoxObject(1.12, 0.055, 0.07, m.brass) },
  { id: "desktop-red-brush", position: [1.02, -1.34, -3.62], scale: 1, create: (m) => createBoxObject(1, 0.05, 0.065, m.red) },
  { id: "front-left-scroll", position: [-4.85, 1.05, -7.74], scale: 1, create: (m) => createWallScroll(0.52, 2.05, m) },
  { id: "front-right-scroll", position: [4.85, 1.05, -7.74], scale: 1, create: (m) => createWallScroll(0.52, 2.05, m) },
  { id: "back-left-scroll", position: [-4.2, 0.84, 7.72], rotation: [0, 180, 0], scale: 1, create: (m) => createWallScroll(0.82, 1.86, m) },
  { id: "back-right-scroll", position: [4.2, 0.84, 7.72], rotation: [0, 180, 0], scale: 1, create: (m) => createWallScroll(0.82, 1.86, m) },
  { id: "left-wall-scroll", position: [-7.72, 0.82, 2.45], rotation: [0, 90, 0], scale: 1, create: (m) => createWallScroll(0.78, 1.74, m) },
  { id: "right-wall-scroll", position: [7.72, 0.82, 2.2], rotation: [0, -90, 0], scale: 1, create: (m) => createWallScroll(0.78, 1.74, m) },
  { id: "brush-rack", position: [-2.72, -1.08, -3.05], scale: 1, create: createBrushRack },
  { id: "ink-set", position: [-1.42, -1.28, -3.1], scale: 1, create: createInkSet },
  { id: "desktop-ceramic-jar", position: [2.52, -1.18, -3.82], scale: 1, create: (m) => createJar(0.28, m) },
  { id: "floor-ceramic-jar", position: [-6.92, -2.38, 5.72], scale: 1, create: (m) => createJar(0.34, m) },
  { id: "low-display-stand", position: [-6.9, -2.72, 5.72], scale: 1, create: createLowStand },
  { id: "ceiling-beam-front", position: [0, 5.02, -4.8], scale: 1, create: (m) => createBoxObject(16, 0.18, 0.24, m.darkWood) },
  { id: "ceiling-beam-middle", position: [0, 5.02, -0.8], scale: 1, create: (m) => createBoxObject(16, 0.18, 0.24, m.darkWood) },
  { id: "ceiling-beam-back", position: [0, 5.02, 3.2], scale: 1, create: (m) => createBoxObject(16, 0.18, 0.24, m.darkWood) }
];

function createMaterials() {
  return {
    paper: new THREE.MeshStandardMaterial({ color: 0xe8dcc5, roughness: 0.92 }),
    ink: new THREE.MeshStandardMaterial({ color: 0x090807, roughness: 0.86 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd29c49, roughness: 0.36, metalness: 0.5 }),
    red: new THREE.MeshStandardMaterial({ color: 0x9f3524, roughness: 0.48 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x75431f, roughness: 0.58 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x5a2c12, roughness: 0.6 }),
    scroll: new THREE.MeshStandardMaterial({ color: 0xd2bd8c, roughness: 0.78 }),
    clay: new THREE.MeshStandardMaterial({ color: 0x574433, roughness: 0.76 })
  };
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

function createWallScroll(width, height, materials) {
  const group = new THREE.Group();
  group.add(createBoxObject(width, height, 0.045, materials.scroll).children[0]);
  group.add(createBoxObject(width + 0.18, 0.07, 0.07, materials.darkWood, [0, height / 2 + 0.08, 0]).children[0]);
  group.add(createBoxObject(width + 0.18, 0.07, 0.07, materials.darkWood, [0, -height / 2 - 0.08, 0]).children[0]);
  group.add(createBoxObject(0.08, height * 0.48, 0.06, materials.ink, [-width * 0.1, 0.22, -0.035]).children[0]);
  group.add(createBoxObject(0.18, 0.18, 0.065, materials.red, [width * 0.24, -height * 0.28, -0.04]).children[0]);
  return group;
}

function createBrushRack(materials) {
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

function createInkSet(materials) {
  const group = new THREE.Group();
  const inkstone = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 32), materials.ink);
  inkstone.position.y = 0.05;
  inkstone.castShadow = true;
  inkstone.receiveShadow = true;
  group.add(inkstone);
  group.add(createBoxObject(0.62, 0.055, 0.09, materials.ink, [0.55, 0.06, -0.06]).children[0]);
  group.add(createBoxObject(0.48, 0.045, 0.065, materials.brass, [0.55, 0.13, -0.06]).children[0]);
  return group;
}

function createJar(radius, materials) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.72, radius, radius * 1.35, 32), materials.clay);
  body.position.y = radius * 0.68;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.32, radius * 0.58, radius * 0.32, 32), materials.clay);
  neck.position.y = radius * 1.45;
  [body, neck].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });
  return group;
}

function createLowStand(materials) {
  const group = createBoxObject(1.24, 0.12, 0.72, materials.darkWood);
  [-0.48, 0.48].forEach((x) => {
    [-0.24, 0.24].forEach((z) => {
      group.add(createBoxObject(0.12, 0.34, 0.12, materials.darkWood, [x, -0.22, z]).children[0]);
    });
  });
  return group;
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
    mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(readNumber(spec.size.radius, 0.38), readNumber(spec.size.radius, 0.38), readNumber(spec.size.height, 0.9), 32),
      material
    );
  } else {
    const fallback = spec.type === "plane" ? CUSTOM_TYPE_SIZES.plane : CUSTOM_TYPE_SIZES.box;
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        readNumber(spec.size.width, fallback.width),
        readNumber(spec.size.height, fallback.height),
        readNumber(spec.size.depth, fallback.depth)
      ),
      material
    );
  }

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

function createRoleFigure(role) {
  const group = new THREE.Group();
  const color = new THREE.Color(role.color || "#39b88f");
  const dark = color.clone().multiplyScalar(0.48);
  const light = color.clone().multiplyScalar(1.2);
  const makeMat = (value) => new THREE.MeshStandardMaterial({ color: value, roughness: 0.62 });
  const darkMat = makeMat(dark);
  const colorMat = makeMat(color);
  const lightMat = makeMat(light);

  group.position.set(role.position[0], role.position[1], role.position[2]);
  group.scale.setScalar(readNumber(role.scale, 1));
  group.add(createBoxObject(0.72, 0.08, 0.46, darkMat, [0, 0.08, 0]).children[0]);
  group.add(createBoxObject(0.42, 1.06, 0.28, colorMat, [0, 0.78, 0]).children[0]);
  group.add(createBoxObject(0.34, 0.34, 0.34, lightMat, [0, 1.46, 0]).children[0]);
  group.add(createBoxObject(0.12, 0.78, 0.16, darkMat, [-0.34, 0.78, 0]).children[0]);
  group.add(createBoxObject(0.12, 0.78, 0.16, darkMat, [0.34, 0.78, 0]).children[0]);
  return group;
}

function normalizeLayout(layout = {}) {
  return {
    objects: layout && typeof layout.objects === "object" && layout.objects ? { ...layout.objects } : {},
    customObjects: Array.isArray(layout?.customObjects) ? layout.customObjects.map(normalizeCustomObject) : [],
    importedModels: Array.isArray(layout?.importedModels) ? layout.importedModels.map(normalizeImportedModel) : [],
    lighting: layout && typeof layout.lighting === "object" && layout.lighting ? { ...layout.lighting } : { ...DEFAULT_LIGHTING }
  };
}

function normalizeTextures(value = {}) {
  return { ...DEFAULT_TEXTURES, ...(value || {}) };
}

function normalizeRoles(value = []) {
  return Array.isArray(value) ? value.map((role, index) => {
    const position = Array.isArray(role.position) ? role.position : [0, -3.02, -4 - index];
    return {
      visible: role.visible !== false,
      color: role.color || "#39b88f",
      position: [
        readNumber(position[0], 0),
        readNumber(position[1], -3.02),
        readNumber(position[2], -4 - index)
      ],
      scale: readNumber(role.scale, 1)
    };
  }) : [];
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

function normalizeCustomObject(record = {}, index = 0) {
  const type = ["box", "cylinder", "plane"].includes(record.type) ? record.type : "box";
  const fallbackSize = CUSTOM_TYPE_SIZES[type];
  const position = Array.isArray(record.position) ? record.position : [0, -1.05, -3.2];
  const rotation = Array.isArray(record.rotation) ? record.rotation : [0, 0, 0];

  return {
    id: String(record.id || `custom-${index + 1}`),
    type,
    color: /^#[0-9a-f]{6}$/i.test(String(record.color || "")) ? record.color : "#8b5a2b",
    size: { ...fallbackSize, ...(record.size || {}) },
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
  const type = record.type === "obj" || record.type === "glb" ? record.type : getImportFileType(fileName) || "glb";
  const position = Array.isArray(record.position) ? record.position : [0, -1.05, -3.2];
  const rotation = Array.isArray(record.rotation) ? record.rotation : [0, 0, 0];
  const baseScale = Number(record.baseScale);

  return {
    id: String(record.id || `imported-${index + 1}`),
    dbKey: String(record.dbKey || record.id || `imported-${index + 1}`),
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
    baseScale: Number.isFinite(baseScale) && baseScale > 0 ? baseScale : 1
  };
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
    deleted: false
  };
}

function applyState(object, state) {
  const scaleFactor = object.userData.scaleFactor || 1;
  object.position.set(state.x, state.y, state.z);
  object.rotation.set(degToRad(state.rx), degToRad(state.ry), degToRad(state.rz));
  object.scale.setScalar(state.scale * scaleFactor);
  object.visible = state.deleted !== true;
}

function normalizeModelPivot(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
}

function normalizeImportedModelPivot(model, record) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const offset = new THREE.Vector3(center.x, box.min.y, center.z);
  model.position.sub(offset);

  if (!Number.isFinite(Number(record.baseScale)) || Number(record.baseScale) <= 0) {
    const longestSide = Math.max(size.x, size.y, size.z, 0.001);
    record.baseScale = Number((1.35 / longestSide).toFixed(6));
  }
}

function prepareModel(model) {
  const fallback = new THREE.MeshStandardMaterial({ color: 0xc8b08a, roughness: 0.64, metalness: 0.02 });
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (!child.material) child.material = fallback;
  });
}

function tintModel(model, tint) {
  if (!tint) return;
  const tintColor = new THREE.Color(tint[0], tint[1], tint[2]);
  model.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const applyTint = (material) => {
      if (!material || !material.color) return material;
      const next = material.clone();
      next.color.multiply(tintColor);
      return next;
    };
    child.material = Array.isArray(child.material)
      ? child.material.map(applyTint)
      : applyTint(child.material);
  });
}

function applyEnvironmentIntensityToScene(root, value = DEFAULT_LIGHTING.environment) {
  const intensity = value;
  root.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material) return;
      material.envMapIntensity = intensity;
      material.needsUpdate = true;
    });
  });
}

function getVisualScaleFactor(spec) {
  return Number(spec.scale || 1) > 50 ? 0.01 : 1;
}

function getImportFileType(fileName) {
  const match = String(fileName || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];
  return extension === "glb" || extension === "obj" ? extension : "";
}

function clearGroup(group) {
  while (group.children.length) {
    group.remove(group.children[0]);
  }
}

function readNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function degToRad(value) {
  return value * Math.PI / 180;
}
