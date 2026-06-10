import { useSceneStore } from "../store/sceneStore.js";

export function SceneList({ scenes, activeSceneId }) {
  const setActiveSceneId = useSceneStore((state) => state.setActiveSceneId);

  return (
    <section className="admin-panel scene-list-panel" aria-label="场景列表">
      <div className="admin-panel-heading">
        <span>Scenes</span>
        <strong>场景列表</strong>
      </div>
      <div className="scene-list">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            type="button"
            className={scene.id === activeSceneId ? "is-active" : ""}
            onClick={() => setActiveSceneId(scene.id)}
          >
            <strong>{scene.name}</strong>
            <span>{scene.id}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
