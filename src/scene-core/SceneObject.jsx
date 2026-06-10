export function SceneObject({ object, selected, onSelect }) {
  if (object.visible === false) {
    return null;
  }

  return (
    <group position={object.position} rotation={object.rotation} scale={object.scale} onClick={handleClick(onSelect)}>
      <mesh castShadow receiveShadow>
        <ObjectGeometry type={object.type} />
        <meshStandardMaterial
          color={selected ? "#d7aa72" : object.material?.color ?? "#f1eadf"}
          roughness={object.material?.roughness ?? 0.45}
          metalness={object.material?.metalness ?? 0.08}
          transparent={(object.material?.opacity ?? 1) < 1}
          opacity={object.material?.opacity ?? 1}
          emissive={object.material?.emissiveColor ?? "#000000"}
          emissiveIntensity={object.material?.emissiveColor && object.material.emissiveColor !== "#000000" ? 0.36 : 0}
        />
      </mesh>
    </group>
  );
}

function ObjectGeometry({ type }) {
  if (type === "sphere") {
    return <sphereGeometry args={[0.22, 32, 16]} />;
  }

  if (type === "plane" || type === "ui-panel") {
    return <boxGeometry args={[0.72, 0.42, 0.035]} />;
  }

  return <boxGeometry args={[0.42, 0.42, 0.42]} />;
}

function handleClick(onSelect) {
  return (event) => {
    event.stopPropagation();
    onSelect?.();
  };
}
