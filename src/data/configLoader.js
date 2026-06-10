import defaultFlowData from "./defaultFlow.json" assert { type: "json" };
import defaultProjectData from "./defaultProject.json" assert { type: "json" };
import { sceneConfigById, sceneConfigs } from "./scenes/index.js";
import { cloneFlowConfig, validateFlowConfig } from "../flow-core/flowSchema.js";
import { cloneSceneConfig, validateSceneConfig } from "../scene-core/sceneSchema.js";

export function loadDefaultProject() {
  return structuredClone(defaultProjectData);
}

export function loadDefaultFlow() {
  const flowConfig = cloneFlowConfig(defaultFlowData);
  const result = validateFlowConfig(flowConfig);

  if (!result.valid) {
    throw new Error(`默认流程配置无效：${result.errors.join("；")}`);
  }

  return flowConfig;
}

export function loadDefaultScenes() {
  return sceneConfigs.map((sceneConfig) => {
    const result = validateSceneConfig(sceneConfig);

    if (!result.valid) {
      throw new Error(`默认场景配置无效：${sceneConfig.id}：${result.errors.join("；")}`);
    }

    return cloneSceneConfig(sceneConfig);
  });
}

export function getDefaultSceneConfig(sceneId) {
  const sceneConfig = sceneConfigById[sceneId] ?? sceneConfigs[0];
  const result = validateSceneConfig(sceneConfig);

  if (!result.valid) {
    throw new Error(`默认场景配置无效：${sceneConfig.id}：${result.errors.join("；")}`);
  }

  return cloneSceneConfig(sceneConfig);
}

export function loadDefaultConfigBundle() {
  return {
    project: loadDefaultProject(),
    flow: loadDefaultFlow(),
    scenes: loadDefaultScenes()
  };
}
