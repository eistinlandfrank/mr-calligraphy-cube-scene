import { useMemo, useState } from "react";
import { SceneCanvas } from "./SceneCanvas";
import {
  SceneConfig,
  SceneObject,
  Vector3,
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
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const activeStep = sceneConfig.steps[sceneConfig.activeStepIndex] ?? sceneConfig.steps[0];
  const activeHotspot = sceneConfig.hotspots.find((hotspot) => hotspot.id === activeStep?.hotspotId);

  const activateStep = (index: number) => {
    setActiveStepIndex(index);
    const nextStep = sceneConfig.steps[index];
    const hotspot = sceneConfig.hotspots.find((item) => item.id === nextStep?.hotspotId);
    if (hotspot?.action.type === "playAnimation") {
      setAnimationPlaying(true);
    }
  };

  const handleHotspotActivate = (hotspotId: string) => {
    const hotspot = sceneConfig.hotspots.find((item) => item.id === hotspotId);
    const stepIndex = findStepIndexByHotspot(sceneConfig, hotspotId);
    if (stepIndex >= 0) {
      setActiveStepIndex(stepIndex);
    }
    if (hotspot?.action.type === "playAnimation") {
      setAnimationPlaying(true);
    }
  };

  return (
    <main className="front-stage">
      <SceneCanvas
        mode="front"
        sceneConfig={sceneConfig}
        animationPlaying={animationPlaying}
        onHotspotActivate={handleHotspotActivate}
      />
      <aside className="stage-panel">
        <p className="eyebrow">Front Stage</p>
        <h2>{activeStep?.title ?? "真实 3D 书法空间"}</h2>
        <dl className="scene-stats">
          <div>
            <dt>步骤</dt>
            <dd>{sceneConfig.activeStepIndex + 1} / {sceneConfig.steps.length}</dd>
          </div>
          <div>
            <dt>热点</dt>
            <dd>{sceneConfig.hotspots.length}</dd>
          </div>
          <div>
            <dt>对象</dt>
            <dd>{visibleObjects.length}</dd>
          </div>
        </dl>
        <section className="active-step-card" aria-label="当前交互步骤">
          <strong>{activeStep?.shortName}</strong>
          <p>{activeStep?.description}</p>
          <small>{activeStep?.focus}</small>
          <span>{activeHotspot?.name ?? "空间热点"}</span>
        </section>
        <StepStrip
          steps={sceneConfig.steps}
          activeIndex={sceneConfig.activeStepIndex}
          onActivate={activateStep}
        />
        <div className="stage-actions">
          <button type="button" onClick={() => setAnimationPlaying((playing) => !playing)}>
            {animationPlaying ? "暂停笔画" : activeStep?.actionLabel ?? "播放笔画"}
          </button>
          <a href="/editor">进入后台编辑</a>
        </div>
        <div className="spatial-badges" aria-label="空间模式">
          <span>AR Anchors</span>
          <span>VR Room</span>
          <span>MR Hotspots</span>
        </div>
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
        <StepStrip
          steps={sceneConfig.steps}
          activeIndex={sceneConfig.activeStepIndex}
          onActivate={setActiveStepIndex}
        />
      </aside>

      <SceneCanvas
        mode="editor"
        sceneConfig={sceneConfig}
        selectedObjectId={selectedObject?.id}
        onSelectObject={setSelectedObjectId}
        onObjectTransform={(objectId, patch) => updateObject(objectId, patch)}
      />

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
      <VectorInputs
        title="位置"
        values={object.position}
        step={0.05}
        onChange={(next) => updateObject(object.id, { position: next })}
      />
      <VectorInputs
        title="旋转"
        values={object.rotation}
        step={1}
        onChange={(next) => updateObject(object.id, { rotation: next })}
      />
      <VectorInputs
        title="缩放"
        values={object.scale}
        step={0.05}
        min={0.02}
        onChange={(next) => updateObject(object.id, { scale: next })}
      />
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

function VectorInputs({
  title,
  values,
  step,
  min,
  onChange
}: {
  title: string;
  values: Vector3;
  step: number;
  min?: number;
  onChange: (values: Vector3) => void;
}) {
  return (
    <fieldset className="vector-inputs">
      <legend>{title}</legend>
      {(["X", "Y", "Z"] as const).map((axis, index) => (
        <label key={axis}>
          <span>{axis}</span>
          <input
            type="number"
            min={min}
            step={step}
            value={values[index]}
            onChange={(event) => {
              const next = [...values] as Vector3;
              next[index] = Number(event.target.value);
              onChange(next);
            }}
          />
        </label>
      ))}
    </fieldset>
  );
}

function PreviewStage({ sceneConfig }: { sceneConfig: SceneConfig }) {
  const activeStep = sceneConfig.steps[sceneConfig.activeStepIndex] ?? sceneConfig.steps[0];

  return (
    <main className="preview-layout">
      <SceneCanvas mode="preview" sceneConfig={sceneConfig} />
      <section className="preview-panel">
        <p className="eyebrow">Read Only Preview</p>
        <h2>{activeStep?.title ?? sceneConfig.name}</h2>
        <section className="active-step-card">
          <strong>{activeStep?.shortName}</strong>
          <p>{activeStep?.description}</p>
          <small>{activeStep?.focus}</small>
        </section>
        <ObjectSummaryList objects={sceneConfig.objects} />
      </section>
    </main>
  );
}

function StepStrip({
  steps,
  activeIndex,
  onActivate
}: {
  steps: SceneConfig["steps"];
  activeIndex: number;
  onActivate: (index: number) => void;
}) {
  return (
    <div className="step-strip" aria-label="1-10 空间交互流程">
      {steps.map((step, index) => (
        <button
          key={step.id}
          className={index === activeIndex ? "is-active" : ""}
          type="button"
          onClick={() => onActivate(index)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          {step.shortName}
        </button>
      ))}
    </div>
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

function setActiveStepIndex(index: number) {
  updateSceneConfig((config) => ({
    ...config,
    activeStepIndex: Math.max(0, Math.min(index, config.steps.length - 1)),
    updatedAt: new Date().toISOString()
  }));
}

function findStepIndexByHotspot(sceneConfig: SceneConfig, hotspotId: string): number {
  return sceneConfig.steps.findIndex((step) => step.hotspotId === hotspotId);
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
