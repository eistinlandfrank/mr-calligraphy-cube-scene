import { Box, Eye, LockKeyhole } from "lucide-react";
import { useSceneStore } from "../store/sceneStore.js";

export function SceneTree({ sceneConfig, selectedObjectId }) {
  const setSelectedObjectId = useSceneStore((state) => state.setSelectedObjectId);

  return (
    <section className="admin-panel scene-tree-panel" aria-label="对象树">
      <div className="admin-panel-heading">
        <span>Scene Tree</span>
        <strong>对象树</strong>
      </div>
      <div className="scene-tree">
        {sceneConfig.objects.map((object) => (
          <button
            key={object.id}
            type="button"
            className={object.id === selectedObjectId ? "is-active" : ""}
            onClick={() => setSelectedObjectId(object.id)}
          >
            <Box size={16} strokeWidth={2.2} />
            <span>
              <strong>{object.name}</strong>
              <small>{object.type}</small>
            </span>
            {object.visible ? <Eye size={15} strokeWidth={2.2} /> : <LockKeyhole size={15} strokeWidth={2.2} />}
          </button>
        ))}
      </div>
    </section>
  );
}
