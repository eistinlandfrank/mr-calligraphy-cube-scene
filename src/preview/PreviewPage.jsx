import { sceneConfigById } from "../data/scenes/index.js";
import { SceneRenderer } from "../scene-core/SceneRenderer.jsx";
import { VirtualCalligraphyGame } from "../scene-core/VirtualCalligraphyGame.jsx";
import { selectSceneConfigById, useSceneStore } from "../store/sceneStore.js";

export function PreviewPage({ sceneId }) {
  const storedScenes = useSceneStore((state) => state.scenes);
  const sceneConfig = selectSceneConfigById(storedScenes, sceneId) ?? sceneConfigById["capsule-product-showcase"];
  const mode = sceneConfig.type === "elder-view" ? "elder" : sceneConfig.type === "caregiver-view" ? "caregiver" : "product";

  return (
    <main className="preview-app">
      <header className="demo-topbar">
        <a className="brand-mark" href="/demo" aria-label="墨韵心境前台演示端">
          <span>墨韵心境</span>
          <strong>场景预览</strong>
        </a>
        <nav aria-label="预览导航">
          <a href="/demo">前台演示</a>
          <a href="/admin">后台编辑</a>
        </nav>
      </header>
      <section className="preview-stage">
        <SceneRenderer sceneConfig={sceneConfig} mode={mode} phaseIndex={3} />
        {sceneConfig.type === "calligraphy-game" ? (
          <div className="preview-calligraphy-panel">
            <VirtualCalligraphyGame compact />
          </div>
        ) : null}
        <div className="preview-meta">
          <span>SceneConfig</span>
          <strong>{sceneConfig.name}</strong>
          <small>{sceneConfig.id}</small>
        </div>
      </section>
    </main>
  );
}
