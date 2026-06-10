import { SlidersHorizontal } from "lucide-react";
import { useSceneStore } from "../store/sceneStore.js";

const vectorFields = [
  ["position", "Position", 0.1],
  ["rotation", "Rotation", 0.05],
  ["scale", "Scale", 0.05]
];

export function InspectorPanel({ sceneId, object }) {
  const updateObject = useSceneStore((state) => state.updateObject);

  if (!object) {
    return (
      <aside className="admin-panel inspector-panel">
        <div className="admin-panel-heading">
          <span>Inspector</span>
          <strong>未选择对象</strong>
        </div>
      </aside>
    );
  }

  function patchObject(patch) {
    updateObject(sceneId, object.id, patch);
  }

  function updateVector(field, index, value) {
    const next = [...object[field]];
    next[index] = Number(value);
    patchObject({ [field]: next });
  }

  function updateMaterial(patch) {
    patchObject({ material: patch });
  }

  return (
    <aside className="admin-panel inspector-panel" aria-label="属性面板">
      <div className="admin-panel-heading inspector-heading">
        <span>Inspector</span>
        <strong>{object.name}</strong>
        <SlidersHorizontal size={18} strokeWidth={2.2} />
      </div>

      <label className="field-block">
        <span>名称</span>
        <input value={object.name} onChange={(event) => patchObject({ name: event.target.value })} />
      </label>

      <div className="toggle-row">
        <label>
          <input
            type="checkbox"
            checked={object.visible !== false}
            onChange={(event) => patchObject({ visible: event.target.checked })}
          />
          <span>可见</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={object.interactive === true}
            onChange={(event) => patchObject({ interactive: event.target.checked })}
          />
          <span>可交互</span>
        </label>
      </div>

      {vectorFields.map(([field, label, step]) => (
        <section key={field} className="inspector-section">
          <div className="inspector-section-title">{label}</div>
          <div className="axis-grid">
            {["x", "y", "z"].map((axis, index) => (
              <label key={axis}>
                <span>{axis.toUpperCase()}</span>
                <input
                  type="number"
                  step={step}
                  value={object[field][index]}
                  onChange={(event) => updateVector(field, index, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="inspector-section">
        <div className="inspector-section-title">Material</div>
        <label className="field-block">
          <span>Base Color</span>
          <input
            type="color"
            value={object.material?.color ?? "#f4efe8"}
            onChange={(event) => updateMaterial({ color: event.target.value })}
          />
        </label>
        <label className="field-block">
          <span>Opacity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={object.material?.opacity ?? 1}
            onChange={(event) => updateMaterial({ opacity: Number(event.target.value) })}
          />
        </label>
        <label className="field-block">
          <span>Emissive Color</span>
          <input
            type="color"
            value={object.material?.emissiveColor ?? "#000000"}
            onChange={(event) => updateMaterial({ emissiveColor: event.target.value })}
          />
        </label>
      </section>
    </aside>
  );
}
