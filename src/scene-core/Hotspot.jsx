export function Hotspot({ hotspot, onSelect }) {
  return (
    <group position={hotspot.position} onClick={handleClick(onSelect)}>
      <mesh>
        <sphereGeometry args={[0.055, 20, 12]} />
        <meshBasicMaterial color="#d7aa72" transparent opacity={0.9} />
      </mesh>
      <mesh>
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
