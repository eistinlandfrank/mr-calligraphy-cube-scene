import assert from "node:assert/strict";
import { createProjectExportPayload, parseConfigJson } from "../src/data/configIO.js";
import { loadDefaultFlow, loadDefaultProject, loadDefaultScenes } from "../src/data/configLoader.js";
import { validateFlowConfig } from "../src/flow-core/flowSchema.js";
import { validateReport } from "../src/report-core/reportSchema.js";
import { validateSceneConfig } from "../src/scene-core/sceneSchema.js";
import { validatePracticeSession } from "../src/session-core/sessionSchema.js";
import { useFlowStore } from "../src/store/flowStore.js";

const scenes = loadDefaultScenes();
const flow = loadDefaultFlow();
const project = loadDefaultProject();

assert.equal(validateFlowConfig(flow).valid, true, "FlowConfig should be valid");
scenes.forEach((scene) => {
  assert.equal(validateSceneConfig(scene).valid, true, `${scene.id} SceneConfig should be valid`);
});

const flowSequence = collectFlowSequence(flow);
assert.deepEqual(
  ["idle", "ready_check", "enter_experience", "immersive_intro", "calligraphy_tutorial", "practice_game", "scoring", "report", "caregiver_confirm", "finished"],
  flowSequence,
  "Default flow should cover the full demo sequence"
);

const highScore = runScoredPractice(makeStrokeRecords(92, 94));
const lowScore = runScoredPractice(makeStrokeRecords(48, 46), { strokeOrderWarnings: 2, interruptionCount: 2 });
assert.ok(highScore > lowScore, `Expected high score ${highScore} to be greater than low score ${lowScore}`);
const scoredSession = useFlowStore.getState().session;

const controlState = prepareFlowAt("practice_game");
assert.equal(controlState.executeAction("pause"), true, "Pause should be executable");
assert.equal(useFlowStore.getState().isPaused, true, "Pause should freeze the flow");
assert.equal(useFlowStore.getState().executeAction("resume"), true, "Resume should be executable");
assert.equal(useFlowStore.getState().isPaused, false, "Resume should unfreeze the flow");
const beforeCallState = useFlowStore.getState().currentStateId;
assert.equal(useFlowStore.getState().executeAction("callCaregiver"), true, "Call caregiver should be executable");
assert.equal(useFlowStore.getState().currentStateId, beforeCallState, "Call caregiver should not advance the state");

const exportPayload = createProjectExportPayload({ project, flow, scenes });
const parsedProject = parseConfigJson(JSON.stringify(exportPayload));
assert.equal(parsedProject.valid, true, "Exported project payload should parse");
assert.equal(parsedProject.type, "project-export", "Exported payload should be detected as project export config");
const parsedScene = parseConfigJson(JSON.stringify(scenes[0]));
assert.equal(parsedScene.valid, true, "Exported scene should re-import");
assert.equal(parsedScene.type, "scene", "Scene export should be detected as SceneConfig");

await assertScenePersistenceAcrossReload();

assert.equal(validatePracticeSession(scoredSession).valid, true, "PracticeSession should validate after smoke flow");
assert.equal(validateReport(scoredSession.report).valid, true, "Generated report should validate");

console.log("Smoke tests passed.");

function collectFlowSequence(flowConfig) {
  const statesById = new Map(flowConfig.states.map((state) => [state.id, state]));
  const sequence = [];
  let current = statesById.get(flowConfig.initialState);

  while (current) {
    sequence.push(current.id);

    if (!current.next) {
      break;
    }

    current = statesById.get(current.next);
  }

  return sequence;
}

function prepareFlowAt(targetStateId) {
  const store = useFlowStore.getState();

  store.setFlowConfig(flow);
  useFlowStore.getState().executeAction("start");

  while (useFlowStore.getState().currentStateId !== targetStateId) {
    const current = useFlowStore.getState();
    const actions = current.getExecutableActions();

    if (!actions.includes("next")) {
      throw new Error(`Cannot reach ${targetStateId} from ${current.currentStateId}`);
    }

    current.executeAction("next");
  }

  return useFlowStore.getState();
}

function runScoredPractice(strokes, overrides = {}) {
  const store = prepareFlowAt("practice_game");
  const completedAt = new Date().toISOString();

  store.completePracticeData({
    totalStrokeCount: 8,
    completedStrokeCount: strokes.length,
    completedAt,
    practiceData: {
      character: "永",
      completedAt,
      strokes,
      rewriteCount: overrides.rewriteCount ?? 0,
      interruptionCount: overrides.interruptionCount ?? 0,
      strokeOrderWarnings: overrides.strokeOrderWarnings ?? 0
    }
  });
  useFlowStore.getState().executeAction("finish");

  return useFlowStore.getState().session.report.score;
}

function makeStrokeRecords(pathAccuracy, rhythmStability, overrides = {}) {
  return Array.from({ length: 8 }, (_, index) => ({
    strokeId: `stroke-${index + 1}`,
    label: `笔画 ${index + 1}`,
    status: "completed",
    startedAt: new Date(Date.now() - 1200).toISOString(),
    completedAt: new Date().toISOString(),
    points: [
      { x: 100 + index, y: 100 + index, t: 0 },
      { x: 110 + index, y: 110 + index, t: 600 }
    ],
    averageDeviation: overrides.averageDeviation ?? 4,
    maxDeviation: overrides.maxDeviation ?? 9,
    pathAccuracy,
    actualDurationMs: 900,
    expectedDurationMs: 1000,
    durationRatio: 0.9,
    rhythmStability
  }));
}

async function assertScenePersistenceAcrossReload() {
  globalThis.window = {
    localStorage: createMemoryStorage()
  };

  const firstModule = await import(`../src/store/sceneStore.js?smoke-save=${Date.now()}`);
  const firstStore = firstModule.useSceneStore.getState();

  firstStore.addObject("capsule-product-showcase", "box");
  await firstModule.useSceneStore.getState().saveScenes();

  const savedRaw = window.localStorage.getItem(firstModule.SCENE_STORAGE_KEY);
  assert.ok(savedRaw?.includes("box"), "Saved scene data should be written to localStorage");

  const secondModule = await import(`../src/store/sceneStore.js?smoke-load=${Date.now()}`);
  const reloadedScene = secondModule.useSceneStore
    .getState()
    .scenes.find((scene) => scene.id === "capsule-product-showcase");

  assert.ok(
    reloadedScene.objects.some((object) => object.type === "box"),
    "Reloaded scene store should read saved scene data"
  );

  delete globalThis.window;
}

function createMemoryStorage() {
  const records = new Map();

  return {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, String(value)),
    removeItem: (key) => records.delete(key),
    clear: () => records.clear()
  };
}
