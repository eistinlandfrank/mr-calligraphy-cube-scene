import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { CapsulePod } from "./CapsulePod.jsx";
import { Hotspot } from "./Hotspot.jsx";
import { SceneObject } from "./SceneObject.jsx";

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
  const backgroundColor = sceneConfig?.environment?.fog ? "#d8ded4" : "#ebe2d4";

  return (
    <div className={`scene-renderer ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [4.8, 2.4, 6.4], fov: sceneConfig?.camera?.fov ?? 50 }}
      >
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
        {showHotspots
          ? sceneConfig?.hotspots?.map((hotspot) => (
              <Hotspot key={hotspot.id} hotspot={hotspot} onSelect={() => onSelectObject?.(hotspot.target)} />
            ))
          : null}
      </Canvas>
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
