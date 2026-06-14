import { useMemo, useState } from "react";
import {
  DEFAULT_SCENE_CONFIG,
  SceneConfig,
  SceneObject,
  resetSceneConfig,
  updateSceneConfig,
  useSceneConfig
} from "./scene-config";

type RouteMode = "front" | "editor" | "preview";

const ROUTE_META: Record<RouteMode, { path: string; label: string }> = {
  front: { path: "/", label: "Front Stage" },
  editor: { path: "/editor", label: "Scene Console" },
  preview: { path: "/preview", label: "Preview" }
};

export function App() {
  const sceneConfig = useSceneConfig();
  const routeMode = readRouteMode(window.location.pathname);

  return (
    <div className="app-shell">
      <AppHeader routeMode={routeMode} sceneConfig={sceneConfig} />
      {routeMode === "front" && <FrontStage sceneConfig={sceneConfig} />}
      {routeMode === "editor" && <SceneConsole sceneConfig={sceneConfig} />}
      {routeMode === "preview" && <PreviewStage sceneConfig={sceneConfig} />}
    </div>
  );
}

function AppHeader({ routeMode, sceneConfig }: { routeMode: RouteMode; sceneConfig: SceneConfig }) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">MR / AR 书法交互系统</p>
        <h1>{sceneConfig.name}</h1>
      </div>
      <nav className="mode-nav" aria-label="应用模式">
        {(Object.keys(ROUTE_META) as RouteMode[]).map((mode) => (
          <a key={mode} className={routeMode === mode ? "is-active" : ""} href={ROUTE_META[mode].path}>
            {ROUTE_META[mode].label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function FrontStage({ sceneConfig }: { sceneConfig: SceneConfig }) {
  const visibleObjects = useMemo(() => sceneConfig.objects.filter((object) => object.visible), [sceneConfig.objects]);

  return (
    <main className="front-stage">
      <section className="scene-viewport" aria-label="前台书法空间概览">
        <div className="stage-screen">
          <span>{sceneConfig.animations[0]?.character ?? "永"}</span>
        </div>
        <div className="stage-desk">
          <div className="stage-paper">{sceneConfig.animations[0]?.character ?? "永"}</div>
          <div className="stage-brush" />
        </div>
        <div className="stage-chair" />
        <div className="stage-hotspot">{sceneConfig.hotspots[0]?.label ?? "热点"}</div>
      </section>
      <aside className="stage-panel">
        <p className="eyebrow">Front Stage</p>
        <h2>默认 3D 书法空间入口</h2>
        <dl className="scene-stats">
          <div>
            <dt>对象</dt>
            <dd>{visibleObjects.length} / {sceneConfig.objects.length}</dd>
          </div>
          <div>
            <dt>热点</dt>
            <dd>{sceneConfig.hotspots.length}</dd>
          </div>
          <div>
            <dt>动画</dt>
            <dd>{sceneConfig.animations.length}</dd>
          </div>
        </dl>
        <ObjectSummaryList objects={visibleObjects} />
      </aside>
    </main>
  );
}

function SceneConsole({ sceneConfig }: { sceneConfig: SceneConfig }) {
  const [selectedObjectId, setSelectedObjectId] = useState(sceneConfig.objects[0]?.id ?? "");
  const selectedObject = sceneConfig.objects.find((object) => object.id === selectedObjectId) ?? sceneConfig.objects[0];

  return (
    <main className="console-layout">
      <aside className="object-list-panel">
        <div className="panel-head">
          <p className="eyebrow">Objects</p>
          <strong>{sceneConfig.objects.length} 个物件</strong>
        </div>
        <div className="object-list">
          {sceneConfig.objects.map((object) => (
            <button
              key={object.id}
              className={object.id === selectedObject?.id ? "is-selected" : ""}
              type="button"
              onClick={() => setSelectedObjectId(object.id)}
            >
              <span>{object.name}</span>
              <small>{object.type}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="editor-viewport" aria-label="后台 3D 编辑视窗">
        <div className="grid-floor" />
        <div className="editor-screen" />
        <div className="editor-desk" />
        <div className="editor-selection">
          {selectedObject?.name ?? "未选择"}
        </div>
      </section>

      <aside className="property-panel">
        <div className="panel-head">
          <p className="eyebrow">Properties</p>
          <strong>{selectedObject?.name ?? "未选择物件"}</strong>
        </div>
        {selectedObject ? <ObjectProperties object={selectedObject} /> : null}
        <div className="panel-actions">
          <button type="button" onClick={() => persistUpdatedAt()}>
            保存配置
          </button>
          <button className="secondary" type="button" onClick={() => resetSceneConfig()}>
            恢复默认
          </button>
        </div>
      </aside>
    </main>
  );
}

function ObjectProperties({ object }: { object: SceneObject }) {
  return (
    <form className="property-form">
      <label>
        <span>名称</span>
        <input
          value={object.name}
          onChange={(event) => updateObject(object.id, { name: event.target.value })}
        />
      </label>
      <label>
        <span>类型</span>
        <input value={object.type} readOnly />
      </label>
      <label className="toggle-row">
        <span>显示</span>
        <input
          type="checkbox"
          checked={object.visible}
          onChange={(event) => updateObject(object.id, { visible: event.target.checked })}
        />
      </label>
      <VectorRows title="位置" values={object.position} />
      <VectorRows title="旋转" values={object.rotation} />
      <VectorRows title="缩放" values={object.scale} />
      <label>
        <span>颜色</span>
        <input
          type="color"
          value={object.material.color}
          onChange={(event) => updateObject(object.id, { material: { ...object.material, color: event.target.value } })}
        />
      </label>
      <label>
        <span>透明度</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={object.material.opacity}
          onChange={(event) => updateObject(object.id, {
            material: { ...object.material, opacity: Number(event.target.value) }
          })}
        />
      </label>
    </form>
  );
}

function VectorRows({ title, values }: { title: string; values: [number, number, number] }) {
  return (
    <div className="vector-row">
      <span>{title}</span>
      <code>{values.map((value) => value.toFixed(2)).join(" / ")}</code>
    </div>
  );
}

function PreviewStage({ sceneConfig }: { sceneConfig: SceneConfig }) {
  return (
    <main className="preview-layout">
      <section className="preview-scene">
        <div className="preview-character">{sceneConfig.animations[0]?.character ?? "永"}</div>
      </section>
      <section className="preview-panel">
        <p className="eyebrow">Read Only Preview</p>
        <h2>{sceneConfig.name}</h2>
        <ObjectSummaryList objects={sceneConfig.objects} />
      </section>
    </main>
  );
}

function ObjectSummaryList({ objects }: { objects: SceneObject[] }) {
  return (
    <ul className="object-summary-list">
      {objects.slice(0, 6).map((object) => (
        <li key={object.id}>
          <span>{object.name}</span>
          <small>{object.visible ? "visible" : "hidden"}</small>
        </li>
      ))}
    </ul>
  );
}

function updateObject(objectId: string, patch: Partial<SceneObject>) {
  updateSceneConfig((config) => ({
    ...config,
    updatedAt: new Date().toISOString(),
    objects: config.objects.map((object) => (
      object.id === objectId ? { ...object, ...patch } : object
    ))
  }));
}

function persistUpdatedAt() {
  updateSceneConfig((config) => ({
    ...config,
    updatedAt: new Date().toISOString()
  }));
}

function readRouteMode(pathname: string): RouteMode {
  if (pathname.startsWith(ROUTE_META.editor.path)) {
    return "editor";
  }
  if (pathname.startsWith(ROUTE_META.preview.path)) {
    return "preview";
  }
  return "front";
}
