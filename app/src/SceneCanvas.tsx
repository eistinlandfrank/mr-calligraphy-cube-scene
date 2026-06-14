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
    scene.fog = new THREE.Fog(0xe9eee8, 12, 28);

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
    controls.maxDistance = 9.5;
    controls.maxPolarAngle = Math.PI * 0.52;
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

  config.hotspots.forEach((hotspot) => {
    const hotspotObject = createHotspotObject(hotspot);
    api.hotspotRoot.add(hotspotObject);
  });

  createStrokeObjects(api, config.animations[0]);
  attachSelectedObject(api, selectedObjectId);
}

function createRoom(scene: THREE.Scene) {
  const room = new THREE.Group();
  const floorMaterial = new THREE.MeshStandardMaterial({ color: "#b78c5f", roughness: 0.74 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: "#e6ded0", roughness: 0.82 });
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: "#f4efe5", roughness: 0.86 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  room.add(floor);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.6), wallMaterial);
  backWall.position.set(0, 2.25, -4.6);
  backWall.receiveShadow = true;
  room.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 4.6), wallMaterial);
  leftWall.position.set(-6, 2.25, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  room.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.x = 6;
  rightWall.rotation.y = -Math.PI / 2;
  room.add(rightWall);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(12, 9.2), ceilingMaterial);
  ceiling.position.set(0, 4.55, 0);
  ceiling.rotation.x = Math.PI / 2;
  room.add(ceiling);

  const grid = new THREE.GridHelper(12, 24, 0x7a5940, 0xd4b58b);
  grid.position.y = 0.002;
  room.add(grid);

  const sun = new THREE.DirectionalLight(0xfff0d2, 2.1);
  sun.position.set(-3.5, 5.5, 3.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  room.add(sun);

  scene.add(room);
}

function createSceneObject3d(object: SceneObject): THREE.Object3D {
  if (object.id.includes("brush")) {
    return createBrushObject(object);
  }
  if (object.type === "model" || object.id.includes("chair")) {
    return createChairObject(object);
  }
  if (object.type === "light") {
    return createLightObject(object);
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

function createLightObject(object: SceneObject): THREE.Object3D {
  const group = new THREE.Group();
  const color = object.material.emissive || object.material.color;
  const light = new THREE.PointLight(color, 2.8, 7);
  light.castShadow = true;
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 16),
    new THREE.MeshBasicMaterial({ color })
  );
  group.add(light, bulb);
  return group;
}

function createHotspotObject(hotspot: SceneHotspot): THREE.Object3D {
  const group = new THREE.Group();
  group.position.set(hotspot.position[0], hotspot.position[1], hotspot.position[2]);
  group.userData.hotspotId = hotspot.id;
  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 24, 16),
    new THREE.MeshStandardMaterial({ color: "#12b79a", emissive: "#0f6f61", roughness: 0.35 })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.012, 12, 48),
    new THREE.MeshBasicMaterial({ color: "#ffffff" })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(pulse, ring);
  group.traverse((child) => {
    child.userData.hotspotId = hotspot.id;
  });
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
  return new THREE.Vector3(point[0] * 0.7, 0.83, -point[1] * 0.48 + 0.03);
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
      const material = child.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material.dispose();
      }
    }
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
