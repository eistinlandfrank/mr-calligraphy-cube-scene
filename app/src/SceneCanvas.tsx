import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { AnimationConfig, SceneConfig, SceneObject, SceneHotspot, Vector3 } from "./scene-config";

type SceneMode = "front" | "editor" | "preview";

interface SceneCanvasProps {
  sceneConfig: SceneConfig;
  mode: SceneMode;
  selectedObjectId?: string;
  animationPlaying?: boolean;
  onSelectObject?: (objectId: string) => void;
  onObjectTransform?: (objectId: string, patch: Pick<SceneObject, "position" | "rotation" | "scale">) => void;
  onHotspotActivate?: (hotspotId: string) => void;
}

interface RuntimeApi {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  transformControls: TransformControls | null;
  transformHelper: THREE.Object3D | null;
  objectRoot: THREE.Group;
  hotspotRoot: THREE.Group;
  strokeRoot: THREE.Group;
  objectMap: Map<string, THREE.Object3D>;
  selectable: THREE.Object3D[];
  strokeSegments: THREE.Mesh[];
  brushMarker: THREE.Mesh | null;
  selectionBox: THREE.BoxHelper | null;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  mode: SceneMode;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const ROOM = {
  width: 16,
  depth: 16,
  floorY: -3.12,
  ceilingY: 5.05,
  frontZ: -8,
  backZ: 8,
  leftX: -8,
  rightX: 8
};
const ROOM_HEIGHT = ROOM.ceilingY - ROOM.floorY;
const ROOM_CENTER_Y = ROOM.floorY + ROOM_HEIGHT / 2;

export function SceneCanvas({
  sceneConfig,
  mode,
  selectedObjectId,
  animationPlaying = false,
  onSelectObject,
  onObjectTransform,
  onHotspotActivate
}: SceneCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const apiRef = useRef<RuntimeApi | null>(null);
  const configRef = useRef(sceneConfig);
  const selectedObjectIdRef = useRef(selectedObjectId);
  const playingRef = useRef(animationPlaying);
  const onSelectObjectRef = useRef(onSelectObject);
  const onObjectTransformRef = useRef(onObjectTransform);
  const onHotspotActivateRef = useRef(onHotspotActivate);
  const [xrStatus, setXrStatus] = useState("检测 XR 支持中...");
  const [xrMode, setXrMode] = useState<"immersive-ar" | "immersive-vr" | null>(null);

  configRef.current = sceneConfig;
  selectedObjectIdRef.current = selectedObjectId;
  playingRef.current = animationPlaying;
  onSelectObjectRef.current = onSelectObject;
  onObjectTransformRef.current = onObjectTransform;
  onHotspotActivateRef.current = onHotspotActivate;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneConfig.environment.background);
    scene.fog = new THREE.Fog(0x11100e, 12, 30);

    const camera = new THREE.PerspectiveCamera(sceneConfig.camera.fov, 1, 0.1, 80);
    setVector(camera.position, sceneConfig.camera.position);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.4;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.68;
    setVector(controls.target, sceneConfig.camera.target);

    const transformControls = mode === "editor" ? new TransformControls(camera, renderer.domElement) : null;
    let transformHelper: THREE.Object3D | null = null;
    if (transformControls) {
      transformControls.setMode("translate");
      transformControls.setSize(0.78);
      transformControls.addEventListener("dragging-changed", (event) => {
        controls.enabled = !event.value;
      });
      transformControls.addEventListener("objectChange", () => {
        const selectedId = selectedObjectIdRef.current;
        const object = selectedId ? apiRef.current?.objectMap.get(selectedId) : null;
        if (!selectedId || !object) {
          return;
        }
        onObjectTransformRef.current?.(selectedId, {
          position: roundVector3([object.position.x, object.position.y, object.position.z]),
          rotation: roundVector3([
            object.rotation.x * RAD_TO_DEG,
            object.rotation.y * RAD_TO_DEG,
            object.rotation.z * RAD_TO_DEG
          ]),
          scale: roundVector3([object.scale.x, object.scale.y, object.scale.z])
        });
      });
      transformHelper = transformControls.getHelper();
      scene.add(transformHelper);
    }

    const objectRoot = new THREE.Group();
    const hotspotRoot = new THREE.Group();
    const strokeRoot = new THREE.Group();
    scene.add(objectRoot, hotspotRoot, strokeRoot);
    createRoom(scene);

    const api: RuntimeApi = {
      scene,
      camera,
      renderer,
      controls,
      transformControls,
      transformHelper,
      objectRoot,
      hotspotRoot,
      strokeRoot,
      objectMap: new Map(),
      selectable: [],
      strokeSegments: [],
      brushMarker: null,
      selectionBox: null,
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      mode
    };
    apiRef.current = api;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    syncScene(api, configRef.current, selectedObjectIdRef.current);

    const handlePointerDown = (event: PointerEvent) => {
      if (mode === "preview" || transformControls?.dragging) {
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      api.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      api.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      api.raycaster.setFromCamera(api.pointer, camera);
      const intersections = api.raycaster.intersectObjects([...api.selectable, ...api.hotspotRoot.children], true);
      const hit = intersections[0]?.object;
      const hotspotId = findUserData(hit, "hotspotId");
      if (hotspotId) {
        onHotspotActivateRef.current?.(hotspotId);
        return;
      }
      const sceneObjectId = findUserData(hit, "sceneObjectId");
      if (sceneObjectId) {
        onSelectObjectRef.current?.(sceneObjectId);
      }
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    const startTime = performance.now();
    renderer.setAnimationLoop(() => {
      controls.update();
      updateStrokeAnimation(api, configRef.current.animations[0], playingRef.current, performance.now() - startTime);
      updateSelectionBox(api, selectedObjectIdRef.current);
      renderer.render(scene, camera);
    });

    detectXrSupport(setXrStatus, setXrMode);

    return () => {
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      disposeObject(scene);
      renderer.dispose();
      apiRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) {
      return;
    }
    syncScene(api, sceneConfig, selectedObjectId);
  }, [sceneConfig, selectedObjectId]);

  const startXrSession = async () => {
    const api = apiRef.current;
    const xr = getNavigatorXr();
    if (!api || !xrMode || !xr?.requestSession) {
      setXrStatus("当前浏览器未开放 WebXR 会话。");
      return;
    }
    try {
      const session = await xr.requestSession(xrMode, {
        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"]
      });
      api.renderer.xr.setSession(session);
      setXrStatus(xrMode === "immersive-ar" ? "已进入 AR / MR 会话。" : "已进入 VR 会话。");
      session.addEventListener("end", () => {
        setXrStatus("XR 会话已退出。");
      });
    } catch {
      setXrStatus("XR 会话启动失败，已保留屏幕模式。");
    }
  };

  return (
    <div className="scene-canvas-shell" ref={hostRef}>
      <canvas ref={canvasRef} className="scene-canvas" aria-label="Three.js 3D 书法空间" />
      <div className="scene-canvas-hud">
        <span>{mode === "editor" ? "TransformControls 编辑" : "OrbitControls 浏览"}</span>
        <span>WebGL 3D</span>
        <button type="button" disabled={!xrMode} onClick={startXrSession}>
          {xrMode === "immersive-ar" ? "进入 MR/AR" : xrMode === "immersive-vr" ? "进入 VR" : "XR 不可用"}
        </button>
      </div>
      <p className="scene-xr-status">{xrStatus}</p>
    </div>
  );
}

function syncScene(api: RuntimeApi, config: SceneConfig, selectedObjectId?: string) {
  api.scene.background = new THREE.Color(config.environment.background);
  setVector(api.camera.position, config.camera.position);
  setVector(api.controls.target, config.camera.target);
  api.camera.fov = config.camera.fov;
  api.camera.updateProjectionMatrix();

  clearGroup(api.objectRoot);
  clearGroup(api.hotspotRoot);
  clearGroup(api.strokeRoot);
  api.objectMap.clear();
  api.selectable = [];
  api.strokeSegments = [];
  api.brushMarker = null;

  const ambient = new THREE.AmbientLight(config.environment.ambientLight, 0.82);
  api.objectRoot.add(ambient);

  config.objects.forEach((object) => {
    if (!object.visible) {
      return;
    }
    const object3d = createSceneObject3d(object);
    object3d.userData.sceneObjectId = object.id;
    applySceneObjectTransform(object3d, object);
    api.objectMap.set(object.id, object3d);
    api.objectRoot.add(object3d);
    if (object.type !== "light") {
      object3d.traverse((child) => {
        child.userData.sceneObjectId = object.id;
        if (child instanceof THREE.Mesh) {
          api.selectable.push(child);
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  });

  const activeHotspotId = config.steps[config.activeStepIndex]?.hotspotId;
  config.hotspots.forEach((hotspot) => {
    const hotspotObject = createHotspotObject(hotspot, hotspot.id === activeHotspotId);
    api.hotspotRoot.add(hotspotObject);
  });

  createStrokeObjects(api, config.animations[0]);
  api.objectRoot.add(createImmersiveGuides(config, activeHotspotId));
  attachSelectedObject(api, selectedObjectId);
}

function createRoom(scene: THREE.Scene) {
  const room = new THREE.Group();
  const floorMaterial = new THREE.MeshStandardMaterial({ color: "#8a6140", roughness: 0.78 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: "#dfd3bf", roughness: 0.82 });
  const sideWallMaterial = new THREE.MeshStandardMaterial({ color: "#d6c7af", roughness: 0.84 });
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: "#eee2cd", roughness: 0.86 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = ROOM.floorY;
  floor.receiveShadow = true;
  room.add(floor);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM_HEIGHT), wallMaterial);
  frontWall.position.set(0, ROOM_CENTER_Y, ROOM.frontZ);
  frontWall.receiveShadow = true;
  room.add(frontWall);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM_HEIGHT), wallMaterial);
  backWall.position.set(0, ROOM_CENTER_Y, ROOM.backZ);
  backWall.rotation.y = Math.PI;
  backWall.receiveShadow = true;
  room.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.depth, ROOM_HEIGHT), sideWallMaterial);
  leftWall.position.set(ROOM.leftX, ROOM_CENTER_Y, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  room.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.depth, ROOM_HEIGHT), sideWallMaterial);
  rightWall.position.set(ROOM.rightX, ROOM_CENTER_Y, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  room.add(rightWall);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), ceilingMaterial);
  ceiling.position.set(0, ROOM.ceilingY, 0);
  ceiling.rotation.x = Math.PI / 2;
  room.add(ceiling);

  const grid = new THREE.GridHelper(ROOM.width, 32, 0x6f4c32, 0xb99161);
  grid.position.y = ROOM.floorY + 0.015;
  room.add(grid);

  const warmFill = new THREE.HemisphereLight(0xfff3d8, 0x2f261c, 0.62);
  room.add(warmFill);

  const sun = new THREE.DirectionalLight(0xfff0d2, 2.25);
  sun.position.set(-3.5, 5.4, 3.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  room.add(sun);

  scene.add(room);
}

function createSceneObject3d(object: SceneObject): THREE.Object3D {
  switch (object.id) {
    case "front-doorway":
      return createDoorwayObject(object);
    case "black-display-screen":
      return createDisplayScreenObject(object);
    case "left-window":
    case "right-window":
      return createWindowObject(object);
    case "left-bookcase":
    case "right-bookcase":
      return createBookcaseObject(object);
    case "main-writing-table":
      return createWritingTableObject(object);
    case "left-chair":
    case "right-chair":
      return createChairObject(object);
    case "side-cabinet":
      return createCabinetObject(object);
    case "desk-books":
      return createBookStackObject(object);
    case "front-left-potted-plant":
    case "right-corner-potted-plant":
    case "desk-small-plant":
      return createPlantObject(object);
    case "front-left-wall-lamp":
    case "front-right-wall-lamp":
    case "side-table-lamp":
      return createLightObject(object);
    case "left-coat-rack":
      return createCoatRackObject(object);
    case "front-left-scroll":
    case "front-right-scroll":
    case "back-left-scroll":
    case "back-right-scroll":
    case "left-wall-scroll":
    case "right-wall-scroll":
      return createScrollObject(object);
    case "brush-rack":
      return createBrushRackObject(object);
    case "ink-set":
      return createInkSetObject(object);
    case "desktop-ceramic-jar":
    case "floor-ceramic-jar":
      return createCeramicJarObject(object);
    case "low-display-stand":
      return createLowStandObject(object);
    case "ai-coach":
    case "learner":
    case "observer":
      return createRoleObject(object);
    case "desktop-gold-brush":
    case "desktop-red-brush":
      return createBrushObject(object);
    case "tea-corner-round-rug":
      return createRoundRugObject(object);
    default:
      break;
  }

  const material = createMaterial(object);
  if (object.type === "plane") {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    return mesh;
  }
  if (object.type === "sphere" || object.type === "hotspot") {
    return new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), material);
  }
  if (object.type === "cylinder") {
    return new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1, 32), material);
  }
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
}

function createDoorwayObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  const shadowMaterial = new THREE.MeshStandardMaterial({ color: "#1f1711", roughness: 0.72 });
  addBox(group, [0, 1.18, 0.03], [2.42, 2.36, 0.05], shadowMaterial);
  addBox(group, [-1.38, 1.16, 0], [0.22, 2.42, 0.24], material);
  addBox(group, [1.38, 1.16, 0], [0.22, 2.42, 0.24], material);
  addBox(group, [0, 2.38, 0], [3, 0.24, 0.24], material);
  addBox(group, [0, 0.02, 0.05], [3.2, 0.12, 0.34], material);
  return group;
}

function createDisplayScreenObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), createMaterial(object));
  group.add(screen);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.86, 0.62),
    new THREE.MeshBasicMaterial({
      map: createTextTexture("永", "#f7e4b9", "rgba(12, 10, 8, 0.88)", 220),
      transparent: true,
      side: THREE.DoubleSide
    })
  );
  glow.position.z = 0.56;
  group.add(glow);

  const scanLineMaterial = new THREE.MeshBasicMaterial({
    color: "#3de6c5",
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide
  });
  [-0.25, 0, 0.25].forEach((y) => {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.01), scanLineMaterial);
    line.position.set(0, y, 0.57);
    group.add(line);
  });
  return group;
}

function createWindowObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.18),
    new THREE.MeshStandardMaterial({
      color: "#c8e9e1",
      roughness: 0.28,
      metalness: 0,
      transparent: true,
      opacity: 0.42,
      emissive: "#163a35",
      side: THREE.DoubleSide
    })
  );
  glass.position.set(0, 0.86, 0.02);
  group.add(glass);
  addBox(group, [0, 0.86, 0.04], [1.78, 0.12, 0.14], material);
  addBox(group, [0, 1.48, 0.04], [1.78, 0.12, 0.14], material);
  addBox(group, [0, 0.24, 0.04], [1.78, 0.12, 0.14], material);
  addBox(group, [-0.88, 0.86, 0.04], [0.12, 1.34, 0.14], material);
  addBox(group, [0.88, 0.86, 0.04], [0.12, 1.34, 0.14], material);
  addBox(group, [0, 0.86, 0.05], [0.08, 1.22, 0.12], material);
  return group;
}

function createBookcaseObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  addBox(group, [0, 1.42, 0], [1.15, 2.84, 0.38], material);
  addBox(group, [0, 1.42, 0.03], [0.94, 2.48, 0.36], new THREE.MeshStandardMaterial({ color: "#3a2114", roughness: 0.72 }));
  [0.46, 1.1, 1.74, 2.38].forEach((y) => addBox(group, [0, y, -0.19], [1.12, 0.08, 0.5], material));
  const bookColors = ["#9f3524", "#d29c49", "#255b44", "#4a628b", "#d2bd8c"];
  for (let row = 0; row < 4; row += 1) {
    for (let index = 0; index < 5; index += 1) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.42 + (index % 2) * 0.08, 0.16),
        new THREE.MeshStandardMaterial({ color: bookColors[(row + index) % bookColors.length], roughness: 0.66 })
      );
      book.position.set(-0.36 + index * 0.18, 0.68 + row * 0.63, -0.38);
      group.add(book);
    }
  }
  return group;
}

function createWritingTableObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  addBox(group, [0, 1.58, 0], [3.55, 0.18, 1.68], material);
  addBox(group, [0, 1.42, 0.78], [3.35, 0.18, 0.12], material);
  addBox(group, [0, 1.42, -0.78], [3.35, 0.18, 0.12], material);
  [-1.55, 1.55].forEach((x) => {
    [-0.62, 0.62].forEach((z) => addBox(group, [x, 0.78, z], [0.16, 1.46, 0.16], material));
  });
  return group;
}

function createBrushObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.1, 24),
    new THREE.MeshStandardMaterial({ color: object.material.color, roughness: object.material.roughness })
  );
  handle.rotation.z = Math.PI / 2;
  const ferrule = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.16, 24),
    new THREE.MeshStandardMaterial({ color: "#b99558", roughness: 0.3, metalness: 0.65 })
  );
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.x = 0.58;
  const bristle = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.34, 24),
    new THREE.MeshStandardMaterial({ color: "#20100a", roughness: 0.9 })
  );
  bristle.rotation.z = -Math.PI / 2;
  bristle.position.x = 0.84;
  group.add(handle, ferrule, bristle);
  return group;
}

function createChairObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1, 0.18, 0.9), material);
  seat.position.y = 0.55;
  const back = new THREE.Mesh(new THREE.BoxGeometry(1, 1.1, 0.16), material);
  back.position.set(0, 1.08, 0.38);
  const legGeometry = new THREE.BoxGeometry(0.12, 0.55, 0.12);
  [-0.42, 0.42].forEach((x) => {
    [-0.32, 0.32].forEach((z) => {
      const leg = new THREE.Mesh(legGeometry, material);
      leg.position.set(x, 0.25, z);
      group.add(leg);
    });
  });
  group.add(seat, back);
  return group;
}

function createCabinetObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  addBox(group, [0, 0.78, 0], [1.75, 1.56, 0.58], material);
  addBox(group, [0, 1.58, 0], [1.92, 0.12, 0.7], material);
  const drawerMaterial = new THREE.MeshStandardMaterial({ color: "#5a2d18", roughness: 0.64 });
  [-0.45, 0.45].forEach((x) => {
    [0.62, 1.05].forEach((y) => {
      addBox(group, [x, y, -0.34], [0.72, 0.28, 0.06], drawerMaterial);
      addBox(group, [x, y, -0.39], [0.08, 0.04, 0.04], new THREE.MeshStandardMaterial({ color: "#d6a15a", metalness: 0.55, roughness: 0.32 }));
    });
  });
  return group;
}

function createBookStackObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const colors = [object.material.color, "#f0d5a5", "#8b2f23"];
  [0, 1, 2].forEach((index) => {
    addBox(
      group,
      [index * 0.02, index * 0.08, index * -0.02],
      [0.72 - index * 0.06, 0.08, 0.46],
      new THREE.MeshStandardMaterial({ color: colors[index], roughness: 0.72 })
    );
  });
  return group;
}

function createPlantObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.38, 24),
    new THREE.MeshStandardMaterial({ color: "#6a3d28", roughness: 0.78 })
  );
  pot.position.y = 0.19;
  group.add(pot);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: "#385126", roughness: 0.7 });
  const leafMaterial = createMaterial(object);
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.72, 10), stemMaterial);
    stem.position.set(Math.cos(angle) * 0.1, 0.58, Math.sin(angle) * 0.1);
    stem.rotation.z = Math.sin(angle) * 0.28;
    stem.rotation.x = Math.cos(angle) * 0.28;
    group.add(stem);

    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 8), leafMaterial);
    leaf.scale.set(0.52, 0.18, 1);
    leaf.position.set(Math.cos(angle) * 0.34, 0.93 + (index % 2) * 0.12, Math.sin(angle) * 0.34);
    leaf.rotation.y = -angle;
    group.add(leaf);
  }
  return group;
}

function createLightObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const color = object.material.emissive || object.material.color;
  const light = new THREE.PointLight(color, 2.8, 7);
  light.castShadow = true;
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 16),
    new THREE.MeshBasicMaterial({ color })
  );
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.34, 28, 1, true),
    new THREE.MeshStandardMaterial({ color: "#865a32", roughness: 0.58, metalness: 0.08, side: THREE.DoubleSide })
  );
  shade.rotation.x = Math.PI;
  shade.position.y = 0.12;
  addBox(group, [0, -0.12, -0.1], [0.08, 0.12, 0.36], new THREE.MeshStandardMaterial({ color: "#5a2c12", roughness: 0.6 }));
  group.add(light, bulb, shade);
  return group;
}

function createCoatRackObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.15, 18), material);
  pole.position.y = 1.08;
  group.add(pole);
  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((angle) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.72, 14), material);
    arm.position.set(Math.cos(angle) * 0.2, 1.9, Math.sin(angle) * 0.2);
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = -angle;
    group.add(arm);
  });
  addBox(group, [0, 0.04, 0], [0.72, 0.08, 0.72], material);
  return group;
}

function createScrollObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: object.material.color, roughness: object.material.roughness, side: THREE.DoubleSide })
  );
  paper.position.z = 0.02;
  group.add(paper);
  const rodMaterial = new THREE.MeshStandardMaterial({ color: "#6f3e20", roughness: 0.62 });
  [-0.56, 0.56].forEach((y) => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.12, 18), rodMaterial);
    rod.rotation.z = Math.PI / 2;
    rod.position.y = y;
    group.add(rod);
  });
  const text = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.72),
    new THREE.MeshBasicMaterial({
      map: createTextTexture("書", "#2b1f16", "rgba(0,0,0,0)", 180),
      transparent: true,
      side: THREE.DoubleSide
    })
  );
  text.position.z = 0.04;
  group.add(text);
  return group;
}

function createBrushRackObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  addBox(group, [0, 0.42, 0], [0.92, 0.08, 0.08], material);
  addBox(group, [-0.42, 0.22, 0], [0.08, 0.44, 0.08], material);
  addBox(group, [0.42, 0.22, 0], [0.08, 0.44, 0.08], material);
  [-0.24, 0, 0.24].forEach((x) => {
    const brush = createBrushObject({
      ...object,
      id: `${object.id}-${x}`,
      material: { ...object.material, color: x === 0 ? "#9f3524" : "#d29c49" }
    });
    brush.position.set(x, 0.12, 0.02);
    brush.rotation.z = Math.PI / 2;
    brush.scale.set(0.46, 0.46, 0.46);
    group.add(brush);
  });
  return group;
}

function createInkSetObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const inkMaterial = createMaterial(object);
  addBox(group, [0, 0.05, 0], [0.46, 0.1, 0.32], inkMaterial);
  addBox(group, [0.46, 0.08, 0.04], [0.12, 0.16, 0.44], new THREE.MeshStandardMaterial({ color: "#11100d", roughness: 0.84 }));
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 28),
    new THREE.MeshStandardMaterial({ color: "#0b0d0c", roughness: 0.18, metalness: 0.1, side: THREE.DoubleSide })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(-0.05, 0.11, 0);
  group.add(water);
  return group;
}

function createCeramicJarObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 28, 16), material);
  body.scale.set(0.86, 1.08, 0.86);
  body.position.y = 0.42;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.26, 24), material);
  neck.position.y = 0.78;
  group.add(body, neck);
  return group;
}

function createLowStandObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  addBox(group, [0, 0.42, 0], [1.08, 0.12, 0.72], material);
  addBox(group, [-0.42, 0.2, -0.24], [0.12, 0.4, 0.12], material);
  addBox(group, [0.42, 0.2, -0.24], [0.12, 0.4, 0.12], material);
  addBox(group, [-0.42, 0.2, 0.24], [0.12, 0.4, 0.12], material);
  addBox(group, [0.42, 0.2, 0.24], [0.12, 0.4, 0.12], material);
  return group;
}

function createRoleObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const material = createMaterial(object);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.86, 24), material);
  body.position.y = 0.66;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 16),
    new THREE.MeshStandardMaterial({ color: "#d8b390", roughness: 0.68 })
  );
  head.position.y = 1.22;
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.01, 10, 52),
    new THREE.MeshBasicMaterial({ color: object.material.emissive || object.material.color, transparent: true, opacity: 0.66 })
  );
  halo.position.y = 1.2;
  halo.rotation.x = Math.PI / 2;
  group.add(body, head, halo);
  return group;
}

function createRoundRugObject(object: SceneObject): THREE.Object3D {
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 64),
    new THREE.MeshStandardMaterial({ color: object.material.color, roughness: object.material.roughness, side: THREE.DoubleSide })
  );
  return rug;
}

function createHotspotObject(hotspot: SceneHotspot, isActive: boolean): THREE.Object3D {
  const group = new THREE.Group();
  group.position.set(hotspot.position[0], hotspot.position[1], hotspot.position[2]);
  group.userData.hotspotId = hotspot.id;
  const hotspotColor = isActive ? "#f0b954" : "#12b79a";
  const emissiveColor = isActive ? "#8a4f11" : "#0f6f61";
  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(isActive ? 0.18 : 0.13, 24, 16),
    new THREE.MeshStandardMaterial({ color: hotspotColor, emissive: emissiveColor, roughness: 0.35 })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(isActive ? 0.34 : 0.23, 0.012, 12, 48),
    new THREE.MeshBasicMaterial({ color: isActive ? "#ffe2a3" : "#ffffff" })
  );
  ring.rotation.x = Math.PI / 2;
  const label = createLabelSprite(hotspot.label, isActive ? "#2a1f0f" : "#073b35", isActive ? "#ffe2a3" : "#d7fff7");
  label.position.set(0, 0.34, 0);
  label.scale.set(1.48, 0.32, 1);
  group.add(pulse, ring, label);
  group.traverse((child) => {
    child.userData.hotspotId = hotspot.id;
  });
  return group;
}

function createImmersiveGuides(config: SceneConfig, activeHotspotId?: string): THREE.Object3D {
  const group = new THREE.Group();
  const activeHotspot = config.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? config.hotspots[0];
  const guideMaterial = new THREE.MeshBasicMaterial({
    color: "#49e4cd",
    transparent: true,
    opacity: 0.23,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  config.hotspots.forEach((hotspot, index) => {
    const anchor = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.008, 8, 54), guideMaterial.clone());
    anchor.position.set(hotspot.position[0], ROOM.floorY + 0.05, hotspot.position[2]);
    anchor.rotation.x = Math.PI / 2;
    anchor.userData.skipSelect = true;
    if (hotspot.id === activeHotspotId) {
      const material = anchor.material as THREE.MeshBasicMaterial;
      material.color.set("#f0b954");
      material.opacity = 0.44;
      anchor.scale.setScalar(1.34);
    }
    group.add(anchor);

    if (index > 0) {
      const previous = config.hotspots[index - 1];
      const start = new THREE.Vector3(previous.position[0], ROOM.floorY + 0.04, previous.position[2]);
      const end = new THREE.Vector3(hotspot.position[0], ROOM.floorY + 0.04, hotspot.position[2]);
      const segment = createCylinderBetween(start, end, 0.008, guideMaterial.clone());
      segment.userData.skipSelect = true;
      group.add(segment);
    }
  });

  if (activeHotspot) {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.85, 0.72),
      new THREE.MeshBasicMaterial({
        map: createTextTexture(activeHotspot.label, "#103c35", "rgba(218, 255, 246, 0.82)", 44),
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    panel.position.set(activeHotspot.position[0], activeHotspot.position[1] + 0.78, activeHotspot.position[2] + 0.06);
    panel.lookAt(config.camera.position[0], config.camera.position[1], config.camera.position[2]);
    group.add(panel);
  }

  return group;
}

function createStrokeObjects(api: RuntimeApi, animation?: AnimationConfig) {
  if (!animation) {
    return;
  }
  const material = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.85 });
  const points = animation.strokes.flat();
  animation.strokes.forEach((stroke) => {
    for (let index = 0; index < stroke.length - 1; index += 1) {
      const start = mapStrokePoint(stroke[index]);
      const end = mapStrokePoint(stroke[index + 1]);
      const segment = createCylinderBetween(start, end, 0.018, material.clone());
      segment.visible = false;
      api.strokeSegments.push(segment);
      api.strokeRoot.add(segment);
    }
  });

  const marker = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.22, 20),
    new THREE.MeshStandardMaterial({ color: "#4b2c1c", roughness: 0.7 })
  );
  marker.rotation.z = -Math.PI / 2;
  marker.position.copy(mapStrokePoint(points[0] ?? [0, 0, 0]));
  api.brushMarker = marker;
  api.strokeRoot.add(marker);
}

function updateStrokeAnimation(api: RuntimeApi, animation: AnimationConfig | undefined, playing: boolean, elapsedMs: number) {
  if (!animation || api.strokeSegments.length === 0) {
    return;
  }
  const progress = playing ? (elapsedMs % animation.duration) / animation.duration : 1;
  const activeCount = Math.max(1, Math.ceil(api.strokeSegments.length * progress));
  api.strokeSegments.forEach((segment, index) => {
    segment.visible = index < activeCount;
  });
  const activeSegment = api.strokeSegments[Math.min(activeCount - 1, api.strokeSegments.length - 1)];
  if (api.brushMarker && activeSegment) {
    activeSegment.geometry.computeBoundingSphere();
    const center = activeSegment.geometry.boundingSphere?.center.clone() ?? new THREE.Vector3();
    activeSegment.localToWorld(center);
    api.brushMarker.position.copy(center);
  }
}

function createCylinderBetween(start: THREE.Vector3, end: THREE.Vector3, radius: number, material: THREE.Material) {
  const distance = start.distanceTo(end);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, distance, 16), material);
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
  return mesh;
}

function mapStrokePoint(point: Vector3): THREE.Vector3 {
  return new THREE.Vector3(point[0] * 0.72, -1.315, -3.42 - point[1] * 0.45);
}

function addBox(group: THREE.Group, position: Vector3, scale: Vector3, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  group.add(mesh);
  return mesh;
}

function createLabelSprite(text: string, color: string, background: string): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: createTextTexture(text, color, background, 52),
    transparent: true,
    depthWrite: false
  });
  return new THREE.Sprite(material);
}

function createTextTexture(text: string, color: string, background: string, fontSize: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 192;
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (background !== "rgba(0,0,0,0)") {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.fillStyle = color;
    context.font = `700 ${fontSize}px "STKaiti", "KaiTi", "PingFang SC", sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    wrapCanvasText(context, text, canvas.width / 2, canvas.height / 2, canvas.width - 48, fontSize + 12);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const chars = [...text];
  const lines: string[] = [];
  let line = "";
  chars.forEach((char) => {
    const testLine = line + char;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  });
  if (line) {
    lines.push(line);
  }
  const top = y - ((lines.length - 1) * lineHeight) / 2;
  lines.slice(0, 3).forEach((item, index) => {
    context.fillText(item, x, top + index * lineHeight);
  });
}

function createMaterial(object: SceneObject) {
  return new THREE.MeshStandardMaterial({
    color: object.material.color,
    roughness: object.material.roughness,
    metalness: object.material.metalness,
    transparent: object.material.opacity < 1,
    opacity: object.material.opacity,
    emissive: object.material.emissive || "#000000",
    side: object.type === "plane" ? THREE.DoubleSide : THREE.FrontSide
  });
}

function applySceneObjectTransform(object3d: THREE.Object3D, object: SceneObject) {
  object3d.position.set(object.position[0], object.position[1], object.position[2]);
  object3d.rotation.set(object.rotation[0] * DEG_TO_RAD, object.rotation[1] * DEG_TO_RAD, object.rotation[2] * DEG_TO_RAD);
  object3d.scale.set(object.scale[0], object.scale[1], object.scale[2]);
}

function attachSelectedObject(api: RuntimeApi, selectedObjectId?: string) {
  if (!api.transformControls) {
    return;
  }
  const object = selectedObjectId ? api.objectMap.get(selectedObjectId) : null;
  if (object) {
    api.transformControls.attach(object);
    if (api.transformHelper) {
      api.transformHelper.visible = true;
    }
  } else {
    api.transformControls.detach();
    if (api.transformHelper) {
      api.transformHelper.visible = false;
    }
  }
}

function updateSelectionBox(api: RuntimeApi, selectedObjectId?: string) {
  const object = selectedObjectId ? api.objectMap.get(selectedObjectId) : null;
  if (!object) {
    if (api.selectionBox) {
      api.selectionBox.visible = false;
    }
    return;
  }
  if (!api.selectionBox) {
    api.selectionBox = new THREE.BoxHelper(object, 0x12b79a);
    api.scene.add(api.selectionBox);
  }
  api.selectionBox.setFromObject(object);
  api.selectionBox.visible = api.mode === "editor";
}

function clearGroup(group: THREE.Group) {
  [...group.children].forEach((child) => {
    group.remove(child);
    disposeObject(child);
  });
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      disposeMaterial(child.material);
    }
    if (child instanceof THREE.Sprite) {
      disposeMaterial(child.material);
    }
  });
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  const materials = Array.isArray(material) ? material : [material];
  materials.forEach((item) => {
    const maybeTextured = item as THREE.Material & { map?: THREE.Texture };
    maybeTextured.map?.dispose();
    item.dispose();
  });
}

function findUserData(object: THREE.Object3D | undefined, key: string): string | null {
  let current: THREE.Object3D | null | undefined = object;
  while (current) {
    const value = current.userData[key];
    if (typeof value === "string") {
      return value;
    }
    current = current.parent;
  }
  return null;
}

function setVector(target: THREE.Vector3, vector: Vector3) {
  target.set(vector[0], vector[1], vector[2]);
}

function roundVector3(vector: Vector3): Vector3 {
  return vector.map((value) => Number(value.toFixed(3))) as Vector3;
}

function getNavigatorXr(): any {
  return (navigator as Navigator & { xr?: any }).xr;
}

async function detectXrSupport(
  setXrStatus: (status: string) => void,
  setXrMode: (mode: "immersive-ar" | "immersive-vr" | null) => void
) {
  const xr = getNavigatorXr();
  if (!xr?.isSessionSupported) {
    setXrStatus("当前浏览器未检测到 WebXR，已使用屏幕 3D 模式。");
    setXrMode(null);
    return;
  }
  try {
    if (await xr.isSessionSupported("immersive-ar")) {
      setXrStatus("WebXR AR / MR 可用。");
      setXrMode("immersive-ar");
      return;
    }
    if (await xr.isSessionSupported("immersive-vr")) {
      setXrStatus("WebXR VR 可用。");
      setXrMode("immersive-vr");
      return;
    }
    setXrStatus("WebXR 存在，但当前设备未开放沉浸会话。");
    setXrMode(null);
  } catch {
    setXrStatus("WebXR 检测失败，已使用屏幕 3D 模式。");
    setXrMode(null);
  }
}
