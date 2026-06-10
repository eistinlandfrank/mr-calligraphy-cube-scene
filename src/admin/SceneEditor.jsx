import { Download, Eye, RotateCcw, Save, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { parseConfigJson } from "../data/configIO.js";
import { CaregiverDashboard } from "../scene-core/CaregiverDashboard.jsx";
import { SceneRenderer } from "../scene-core/SceneRenderer.jsx";
import { selectSceneConfigById, useSceneStore } from "../store/sceneStore.js";
import { InspectorPanel } from "./InspectorPanel.jsx";
import { SceneList } from "./SceneList.jsx";
import { SceneTree } from "./SceneTree.jsx";
import { TimelineEditor } from "./TimelineEditor.jsx";

export function SceneEditor() {
  const scenes = useSceneStore((state) => state.scenes);
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const lastSavedAt = useSceneStore((state) => state.lastSavedAt);
  const setSelectedObjectId = useSceneStore((state) => state.setSelectedObjectId);
  const saveScenes = useSceneStore((state) => state.saveScenes);
  const resetScene = useSceneStore((state) => state.resetScene);
  const importScene = useSceneStore((state) => state.importScene);
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState("");
  const sceneConfig = selectSceneConfigById(scenes, activeSceneId);
  const selectedObject = sceneConfig.objects.find((object) => object.id === selectedObjectId) ?? sceneConfig.objects[0];
  const mode = getSceneMode(sceneConfig.type);
  const isCaregiverPreview = ["caregiver-view", "calligraphy-game", "gallery-report"].includes(sceneConfig.type);

  function exportScene() {
    const payload = JSON.stringify(sceneConfig, null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sceneConfig.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importSceneConfig(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const sceneConfigText = await file.text();
      const parsed = parseConfigJson(sceneConfigText);

      if (!parsed.valid) {
        setImportStatus(`导入失败：${parsed.errors[0]}`);
        return;
      }

      if (parsed.type !== "scene") {
        setImportStatus(`导入失败：后台场景编辑器当前仅支持 SceneConfig，检测到 ${parsed.type}。`);
        return;
      }

      const result = importScene(parsed.config);

      if (!result.valid) {
        setImportStatus(`导入失败：${result.errors[0]}`);
        return;
      }

      setImportStatus(`已导入：${parsed.config.name}`);
    } catch (error) {
      setImportStatus(`导入失败：${error.message}`);
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="admin-app">
      <header className="admin-topbar">
        <div className="brand-mark">
          <span>Admin / 3D Scene Editor</span>
          <strong>后台 3D 编辑端</strong>
        </div>
        <div className="admin-toolbar" aria-label="后台工具栏">
          <button type="button" onClick={saveScenes}>
            <Save size={17} strokeWidth={2.2} />
            <span>保存到本机</span>
          </button>
          <button type="button" onClick={exportScene}>
            <Download size={17} strokeWidth={2.2} />
            <span>导出 JSON</span>
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload size={17} strokeWidth={2.2} />
            <span>导入 JSON</span>
          </button>
          <input ref={fileInputRef} className="admin-file-input" type="file" accept="application/json,.json" onChange={importSceneConfig} />
          <button type="button" onClick={() => resetScene(sceneConfig.id)}>
            <RotateCcw size={17} strokeWidth={2.2} />
            <span>恢复默认</span>
          </button>
          <a href={`/preview/${sceneConfig.id}`}>
            <Eye size={17} strokeWidth={2.2} />
            <span>预览</span>
          </a>
        </div>
      </header>
      {importStatus ? <div className="admin-import-status">{importStatus}</div> : null}

      <section className="admin-workspace">
        <aside className="admin-left-rail">
          <SceneList scenes={scenes} activeSceneId={activeSceneId} />
          <SceneTree sceneConfig={sceneConfig} selectedObjectId={selectedObject?.id} />
        </aside>

        <section className="admin-center">
          <SceneRenderer
            sceneConfig={sceneConfig}
            mode={mode}
            phaseIndex={3}
            selectedObjectId={selectedObject?.id}
            onSelectObject={setSelectedObjectId}
          />
          <div className="admin-viewport-label">
            <span>{sceneConfig.type}</span>
            <strong>{sceneConfig.name}</strong>
          </div>
          {isCaregiverPreview ? (
            <div className="admin-caregiver-preview">
              <CaregiverDashboard
                compact
                data={sceneConfig.caregiverData}
                phase={{ id: "admin-preview", label: sceneConfig.caregiverData?.stage ?? sceneConfig.name }}
                progress={sceneConfig.type === "calligraphy-game" ? 56 : 32}
                currentStroke="努"
                remainingSeconds={sceneConfig.type === "gallery-report" ? 0 : 520}
              />
            </div>
          ) : null}
        </section>

        <InspectorPanel sceneId={sceneConfig.id} object={selectedObject} />
      </section>

      <TimelineEditor timeline={sceneConfig.timeline} lastSavedAt={lastSavedAt} />
    </main>
  );
}

function getSceneMode(type) {
  if (type === "elder-view" || type === "calligraphy-game") {
    return "elder";
  }

  if (type === "caregiver-view") {
    return "caregiver";
  }

  return "product";
}
