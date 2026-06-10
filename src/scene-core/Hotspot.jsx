export function Hotspot({ hotspot, onSelect }) {
  const selectableId = hotspot.target ?? hotspot.targetScene ?? hotspot.targetAction ?? hotspot.id;

  return (
    <group position={hotspot.position} onClick={handleClick(onSelect)} userData={{ selectableId }}>
      <mesh userData={{ selectableId }}>
        <sphereGeometry args={[0.055, 20, 12]} />
        <meshBasicMaterial color="#d7aa72" transparent opacity={0.9} />
      </mesh>
      <mesh userData={{ selectableId }}>
        <ringGeometry args={[0.09, 0.1, 28]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.62} />
      </mesh>
    </group>
  );
}

function handleClick(onSelect) {
  return (event) => {
    event.stopPropagation();
    onSelect?.();
  };
}
