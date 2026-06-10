import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function CapsulePod({ mode, phaseIndex, sceneConfig, selectedObjectId, onSelectObject }) {
  const brushRef = useRef();
  const doorClosed = phaseIndex >= 2 || mode === "elder" || mode === "caregiver";
  const immersionOn = phaseIndex >= 3 || mode === "elder";
  const gameOn = phaseIndex >= 4 || mode === "elder";
  const reportOn = phaseIndex >= 5;

  useFrame((state) => {
    if (!brushRef.current) {
      return;
    }

    const t = state.clock.getElapsedTime();
    const active = gameOn ? 1 : 0.22;
    brushRef.current.position.x = 0.18 + Math.sin(t * 1.8) * 0.28 * active;
    brushRef.current.position.y = 1.1 + Math.cos(t * 1.4) * 0.12 * active;
    brushRef.current.rotation.z = -0.35 + Math.sin(t * 1.2) * 0.18 * active;
  });

  return (
    <group>
      <CapsuleShell
        color={getObjectMaterial(sceneConfig, "capsule-shell").color}
        selected={selectedObjectId === "capsule-shell"}
        mode={mode}
        onSelect={() => onSelectObject?.("capsule-shell")}
      />
      <CapsuleDoor
        closed={doorClosed}
        selected={selectedObjectId === "capsule-door"}
        material={getObjectMaterial(sceneConfig, "capsule-door")}
        onSelect={() => onSelectObject?.("capsule-door")}
      />
      <ReclinerChair
        selected={selectedObjectId === "recliner-chair"}
        material={getObjectMaterial(sceneConfig, "recliner-chair")}
        onSelect={() => onSelectObject?.("recliner-chair")}
      />
      <ImmersiveScreen
        active={immersionOn}
        selected={selectedObjectId === "immersive-screen"}
        material={getObjectMaterial(sceneConfig, "immersive-screen")}
        onSelect={() => onSelectObject?.("immersive-screen")}
      />
      <ObservationWindow
        selected={selectedObjectId === "observation-window"}
        material={getObjectMaterial(sceneConfig, "observation-window")}
        hidden={mode === "elder"}
        onSelect={() => onSelectObject?.("observation-window")}
      />
      <CaregiverScreen
        active={mode === "caregiver" || reportOn}
        selected={selectedObjectId === "caregiver-screen" || selectedObjectId === "caregiver-dashboard"}
        material={getObjectMaterial(sceneConfig, "caregiver-screen", "caregiver-dashboard")}
        hidden={mode === "elder"}
        onSelect={() => onSelectObject?.("caregiver-screen")}
      />
      <EmergencyButton
        selected={selectedObjectId === "emergency-button"}
        material={getObjectMaterial(sceneConfig, "emergency-button")}
        hidden={mode === "elder"}
        onSelect={() => onSelectObject?.("emergency-button")}
      />
      <VirtualBrush refObject={brushRef} active={gameOn} />
      <InkPanels active={immersionOn} reportOn={reportOn} />
    </group>
  );
}

function CapsuleShell({ color, selected, mode, onSelect }) {
  return (
    <group onClick={stopAndRun(onSelect)}>
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0.98, 0]}>
        <capsuleGeometry args={[0.82, 3.25, 24, 56]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.46}
          metalness={0.08}
          transparent
          opacity={mode === "elder" ? 0.16 : 0.42}
          transmission={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.98, 0]}>
        <torusGeometry args={[0.83, 0.025, 12, 64]} />
        <meshStandardMaterial color={selected ? "#d7aa72" : "#9b7c55"} roughness={0.34} metalness={0.18} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-1.78, 0.98, 0]}>
        <torusGeometry args={[0.83, 0.028, 12, 64]} />
        <meshStandardMaterial color={selected ? "#d7aa72" : "#9b7c55"} roughness={0.34} metalness={0.18} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[1.78, 0.98, 0]}>
        <torusGeometry args={[0.83, 0.028, 12, 64]} />
        <meshStandardMaterial color={selected ? "#d7aa72" : "#9b7c55"} roughness={0.34} metalness={0.18} />
      </mesh>
    </group>
  );
}

function CapsuleDoor({ closed, selected, material, onSelect }) {
  const x = closed ? 0.86 : 1.34;

  return (
    <group onClick={stopAndRun(onSelect)}>
      <mesh castShadow position={[x, 1.02, 0.43]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.08, 1.18, 1.28]} />
        <meshPhysicalMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
          transparent
          opacity={selected ? 0.78 : material.opacity ?? 0.58}
          transmission={0.2}
        />
      </mesh>
      <mesh position={[x + 0.02, 1.02, 1.1]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.04, 0.92, 0.04]} />
        <meshStandardMaterial color={selected ? "#d7aa72" : "#8f6a45"} roughness={0.3} metalness={0.26} />
      </mesh>
    </group>
  );
}

function ReclinerChair({ selected, material, onSelect }) {
  return (
    <group onClick={stopAndRun(onSelect)} position={[-0.18, 0.45, 0]}>
      <mesh castShadow receiveShadow rotation={[0.16, 0, 0]}>
        <boxGeometry args={[1.7, 0.18, 0.56]} />
        <meshStandardMaterial color={selected ? "#d7aa72" : material.color} roughness={0.64} metalness={0.04} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.72, 0.25, -0.06]} rotation={[0, 0, -0.58]}>
        <boxGeometry args={[0.9, 0.2, 0.58]} />
        <meshStandardMaterial color="#7d664e" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0.78, 0.15, 0]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.78, 0.15, 0.52]} />
        <meshStandardMaterial color="#947b5e" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[-0.06, -0.16, 0]}>
        <boxGeometry args={[1.35, 0.16, 0.46]} />
        <meshStandardMaterial color="#6f5f50" roughness={0.58} />
      </mesh>
    </group>
  );
}

function ImmersiveScreen({ active, selected, material, onSelect }) {
  return (
    <group onClick={stopAndRun(onSelect)} position={[0, 1.16, -0.22]}>
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.18, 1.18, 2.85, 64, 1, true, Math.PI * 0.61, Math.PI * 0.78]} />
        <meshStandardMaterial
          color={selected ? "#d7aa72" : material.color}
          emissive={active ? material.emissiveColor ?? "#d7ede5" : "#1e2828"}
          emissiveIntensity={active ? 0.72 : 0.16}
          roughness={0.2}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.02, -0.95]}>
        <planeGeometry args={[1.5, 0.72]} />
        <meshBasicMaterial color={active ? "#ecf4eb" : "#8b938a"} transparent opacity={active ? 0.9 : 0.36} />
      </mesh>
    </group>
  );
}

function ObservationWindow({ selected, material, hidden, onSelect }) {
  if (hidden) {
    return null;
  }

  return (
    <mesh onClick={stopAndRun(onSelect)} castShadow position={[0.18, 1.28, 0.84]} rotation={[0, 0.02, 0]}>
      <boxGeometry args={[1.15, 0.42, 0.05]} />
      <meshPhysicalMaterial
        color={selected ? "#d7aa72" : material.color}
        roughness={0.12}
        metalness={0.28}
        transparent
        opacity={material.opacity ?? 0.52}
        transmission={0.16}
      />
    </mesh>
  );
}

function CaregiverScreen({ active, selected, material, hidden, onSelect }) {
  if (hidden) {
    return null;
  }

  return (
    <group onClick={stopAndRun(onSelect)} position={[-1.78, 1.17, 0.38]} rotation={[0, 0.42, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.74, 0.52, 0.06]} />
        <meshStandardMaterial
          color={selected ? "#d7aa72" : material.color}
          emissive={active ? material.emissiveColor ?? "#2f6f68" : "#112220"}
          emissiveIntensity={active ? 0.7 : 0.25}
          roughness={0.28}
          metalness={0.16}
        />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[0.56, 0.34]} />
        <meshBasicMaterial color={active ? "#bdeee0" : "#37524e"} transparent opacity={0.82} />
      </mesh>
    </group>
  );
}

function EmergencyButton({ selected, material, hidden, onSelect }) {
  if (hidden) {
    return null;
  }

  return (
    <group onClick={stopAndRun(onSelect)} position={[-1.46, 0.62, 0.95]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.06, 32]} />
        <meshStandardMaterial color="#3b2a24" roughness={0.42} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.11, 32, 16]} />
        <meshStandardMaterial
          color={selected ? "#ffcf8b" : material.color}
          emissive={material.emissiveColor ?? "#3b0904"}
          emissiveIntensity={0.42}
          roughness={0.24}
          metalness={0.08}
        />
      </mesh>
    </group>
  );
}

function VirtualBrush({ refObject, active }) {
  return (
    <group ref={refObject} position={[0.18, 1.1, 0.1]} rotation={[0.22, 0, -0.35]} visible={active}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.8, 24]} />
        <meshStandardMaterial color="#b98945" roughness={0.4} metalness={0.04} />
      </mesh>
      <mesh castShadow position={[-0.43, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.24, 24]} />
        <meshStandardMaterial color="#19110d" roughness={0.72} />
      </mesh>
      <mesh position={[-0.58, -0.02, 0]}>
        <sphereGeometry args={[0.035, 18, 12]} />
        <meshBasicMaterial color="#15100c" />
      </mesh>
    </group>
  );
}

function InkPanels({ active, reportOn }) {
  return (
    <group>
      <mesh position={[0, 1.16, -0.88]} visible={active}>
        <ringGeometry args={[0.42, 0.44, 64]} />
        <meshBasicMaterial color="#d7aa72" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.7, 1.28, -0.5]} rotation={[0, -0.28, 0]} visible={reportOn}>
        <planeGeometry args={[0.74, 0.56]} />
        <meshBasicMaterial color="#17302d" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function getObjectMaterial(sceneConfig, ...ids) {
  const object = sceneConfig?.objects?.find((item) => ids.includes(item.id));

  return {
    color: object?.material?.color ?? "#f1eadf",
    roughness: object?.material?.roughness ?? 0.45,
    metalness: object?.material?.metalness ?? 0.08,
    opacity: object?.material?.opacity ?? 1,
    emissiveColor: object?.material?.emissiveColor ?? "#000000"
  };
}

function stopAndRun(handler) {
  return (event) => {
    event.stopPropagation();
    handler?.(event);
  };
}
