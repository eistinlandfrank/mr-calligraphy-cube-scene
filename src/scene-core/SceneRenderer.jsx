import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BadgeAlert, Glasses, LogOut } from "lucide-react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LoadingState } from "../app/LoadingState.jsx";
import { CapsulePod } from "./CapsulePod.jsx";
import { Hotspot } from "./Hotspot.jsx";
import { SceneObject } from "./SceneObject.jsx";
import { validateSceneConfig } from "./sceneSchema.js";

const capsuleObjectIds = new Set([
  "capsule-shell",
  "capsule-door",
  "recliner-chair",
  "immersive-screen",
  "observation-window",
  "caregiver-screen",
  "caregiver-dashboard",
  "emergency-button",
  "virtual-brush"
]);

const cameraPresets = {
  product: {
    position: new THREE.Vector3(4.8, 2.4, 6.4),
    target: new THREE.Vector3(0, 0.9, 0)
  },
  elder: {
    position: new THREE.Vector3(0, 1.24, 4.2),
    target: new THREE.Vector3(0, 1.08, -0.65)
  },
  caregiver: {
    position: new THREE.Vector3(-3.9, 2.1, 4.35),
    target: new THREE.Vector3(-0.45, 1.05, 0)
  }
};

export function SceneRenderer({
  sceneConfig,
  mode = "product",
  phaseIndex = 0,
  selectedObjectId,
  onSelectObject,
  showHotspots = true,
  className = ""
}) {
  const [isReady, setIsReady] = useState(false);
  const [xrRenderer, setXrRenderer] = useState(null);
  const [xrSession, setXrSession] = useState(null);
  const [xrSupport, setXrSupport] = useState({
    checked: false,
    supported: false,
    message: "正在检测 WebXR"
  });
  const backgroundColor = sceneConfig?.environment?.fog ? "#d8ded4" : "#ebe2d4";
  const configValidation = useMemo(() => validateSceneConfig(sceneConfig), [sceneConfig]);
  const xrActive = Boolean(xrSession);

  useEffect(() => {
    setIsReady(false);
  }, [sceneConfig?.id, mode]);

  useEffect(() => {
    let cancelled = false;

    async function detectWebXr() {
      if (!navigator.xr?.isSessionSupported) {
        setXrSupport({ checked: true, supported: false, message: "当前浏览器不支持 WebXR" });
        return;
      }

      try {
        const supported = await navigator.xr.isSessionSupported("immersive-vr");

        if (!cancelled) {
          setXrSupport({
            checked: true,
            supported,
            message: supported ? "WebXR 可用" : "当前设备不支持沉浸模式"
          });
        }
      } catch (error) {
        if (!cancelled) {
          setXrSupport({ checked: true, supported: false, message: `WebXR 检测失败：${error.message}` });
        }
      }
    }

    detectWebXr();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enterXrMode() {
    if (!xrRenderer || !xrSupport.supported || xrSession) {
      return;
    }

    try {
      const session = await navigator.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor"]
      });

      const handleSessionEnd = () => {
        setXrSession(null);
      };

      session.addEventListener("end", handleSessionEnd, { once: true });
      xrRenderer.xr.enabled = true;
      await xrRenderer.xr.setSession(session);
      setXrSession(session);
      setXrSupport((support) => ({ ...support, message: "已进入 XR 模式" }));
    } catch (error) {
      setXrSupport({ checked: true, supported: false, message: `进入 XR 失败：${error.message}` });
    }
  }

  async function exitXrMode() {
    await xrSession?.end();
  }

  if (!configValidation.valid) {
    return <ConfigErrorPanel sceneConfig={sceneConfig} errors={configValidation.errors} warnings={configValidation.warnings} />;
  }

  return (
    <div className={`scene-renderer ${className}`} aria-busy={!isReady}>
      {!isReady ? (
        <LoadingState
          className="scene-loading-state"
          label="正在加载 3D 场景"
          detail={sceneConfig?.name ?? "读取场景配置"}
        />
      ) : null}
      <Canvas
        shadows={!xrActive}
        dpr={[1, 2]}
        camera={{ position: [4.8, 2.4, 6.4], fov: sceneConfig?.camera?.fov ?? 50 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={[backgroundColor]} />
          {sceneConfig?.environment?.fog ? <fog attach="fog" args={[backgroundColor, 5, 12]} /> : null}
          <ambientLight color={sceneConfig?.environment?.ambientColor ?? "#f2e4d0"} intensity={1.55} />
          <directionalLight
            castShadow
            color="#fff7ec"
            intensity={2.2}
            position={[3.5, 6.5, 4.5]}
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight color="#bfe9dc" intensity={0.85} position={[-2.6, 2.2, 1.4]} />
          <SceneCameraRig mode={mode} phaseIndex={phaseIndex} />
          <SceneFloor color={sceneConfig?.environment?.floorColor ?? "#d8c7aa"} />
          <CapsulePod
            mode={mode}
            phaseIndex={phaseIndex}
            sceneConfig={sceneConfig}
            selectedObjectId={selectedObjectId}
            onSelectObject={onSelectObject}
          />
          {sceneConfig?.objects
            ?.filter((object) => !capsuleObjectIds.has(object.id))
            .map((object) => (
              <SceneObject
                key={object.id}
                object={object}
                selected={selectedObjectId === object.id}
                onSelect={() => onSelectObject?.(object.id)}
              />
            ))}
          {sceneConfig?.uiPanels?.map((panel) => (
            <SceneUiPanel key={panel.id} panel={panel} />
          ))}
          {showHotspots
            ? sceneConfig?.hotspots?.map((hotspot) => (
                <Hotspot key={hotspot.id} hotspot={hotspot} onSelect={() => onSelectObject?.(hotspot.target)} />
              ))
            : null}
          <SceneReadySignal key={`${sceneConfig?.id ?? "scene"}-${mode}`} onReady={() => setIsReady(true)} />
          <SceneXrBridge onRendererReady={setXrRenderer} />
        </Suspense>
      </Canvas>
      <XrControlPanel
        active={xrActive}
        support={xrSupport}
        onEnter={enterXrMode}
        onExit={exitXrMode}
      />
    </div>
  );
}

function ConfigErrorPanel({ sceneConfig, errors, warnings }) {
  return (
    <section className="config-error-panel" role="alert" aria-label="SceneConfig 配置错误">
      <span>SceneConfig</span>
      <strong>{sceneConfig?.id ?? "未识别配置"}</strong>
      <p>{errors[0] ?? "配置格式无效，无法渲染当前场景。"}</p>
      {warnings.length ? <small>{warnings[0]}</small> : null}
    </section>
  );
}

function SceneReadySignal({ onReady }) {
  const hasReported = useRef(false);

  useFrame(() => {
    if (hasReported.current) {
      return;
    }

    hasReported.current = true;
    onReady?.();
  });

  return null;
}

function SceneXrBridge({ onRendererReady }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.xr.enabled = true;
    onRendererReady?.(gl);

    return () => {
      onRendererReady?.(null);
    };
  }, [gl, onRendererReady]);

  return null;
}

function XrControlPanel({ active, support, onEnter, onExit }) {
  const Icon = active ? LogOut : support.supported ? Glasses : BadgeAlert;

  return (
    <div className={`xr-control-panel ${active ? "is-active" : ""}`}>
      <button type="button" onClick={active ? onExit : onEnter} disabled={!active && !support.supported}>
        <Icon size={16} strokeWidth={2.2} />
        <span>{active ? "退出 XR" : "进入 XR"}</span>
      </button>
      <small>{support.message}</small>
    </div>
  );
}

function SceneCameraRig({ mode, phaseIndex }) {
  const { camera } = useThree();
  const preset = cameraPresets[mode] ?? cameraPresets.product;
  const phaseLift = mode === "product" && phaseIndex >= 2 ? 0.28 : 0;

  const targetPosition = useMemo(
    () => preset.position.clone().add(new THREE.Vector3(0, phaseLift, 0)),
    [preset.position, phaseLift]
  );
  const targetLookAt = useMemo(() => preset.target.clone(), [preset.target]);

  useFrame(() => {
    camera.position.lerp(targetPosition, 0.075);
    camera.lookAt(targetLookAt);
  });

  return null;
}

function SceneFloor({ color }) {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[5.4, 96]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[3.15, 3.18, 96]} />
        <meshBasicMaterial color="#9b7c55" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function SceneUiPanel({ panel }) {
  const texture = useMemo(() => createPanelTexture(panel), [panel]);

  useEffect(() => () => texture.dispose(), [texture]);

  const [width = 0.78, height = 0.38] = panel.size ?? [];
  const tone = getPanelTone(panel.tone);

  return (
    <group position={panel.position} rotation={panel.rotation}>
      <mesh>
        <boxGeometry args={[width, height, 0.028]} />
        <meshStandardMaterial
          color={tone.background}
          roughness={0.48}
          metalness={0.08}
          transparent
          opacity={0.92}
          emissive={tone.emissive}
          emissiveIntensity={0.18}
        />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[width * 0.9, height * 0.78]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
}

function createPanelTexture(panel) {
  if (typeof document === "undefined") {
    return new THREE.Texture();
  }

  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 320;
  const context = canvas.getContext("2d");
  const tone = getPanelTone(panel.tone);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = tone.text;
  context.font = "700 46px sans-serif";
  context.fillText(panel.title, 34, 86);
  context.font = "500 28px sans-serif";
  wrapCanvasText(context, panel.body ?? "", 34, 145, 560, 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const characters = Array.from(text);
  let line = "";
  let offsetY = y;

  characters.forEach((character) => {
    const nextLine = `${line}${character}`;

    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line, x, offsetY);
      line = character;
      offsetY += lineHeight;
      return;
    }

    line = nextLine;
  });

  if (line) {
    context.fillText(line, x, offsetY);
  }
}

function getPanelTone(tone) {
  if (tone === "dark") {
    return { background: "#17302d", emissive: "#2f6f68", text: "#f5efe5" };
  }

  return { background: "#f4efe2", emissive: "#d7aa72", text: "#251f18" };
}
