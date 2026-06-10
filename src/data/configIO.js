import { validateFlowConfig } from "../flow-core/flowSchema.js";
import { validateSceneConfig } from "../scene-core/sceneSchema.js";

export function parseConfigJson(text) {
  try {
    const config = JSON.parse(text);
    return validateImportedConfig(config);
  } catch (error) {
    return {
      valid: false,
      type: "unknown",
      config: null,
      errors: [`JSON 解析失败：${error.message}`],
      warnings: []
    };
  }
}

export function validateImportedConfig(config) {
  const type = detectConfigType(config);

  if (type === "scene") {
    return {
      type,
      config,
      ...validateSceneConfig(config)
    };
  }

  if (type === "flow") {
    return {
      type,
      config,
      ...validateFlowConfig(config)
    };
  }

  if (type === "project") {
    return {
      type,
      config,
      ...validateProjectConfig(config)
    };
  }

  return {
    valid: false,
    type: "unknown",
    config,
    errors: ["无法识别配置类型，请导入 ProjectConfig、FlowConfig 或 SceneConfig JSON。"],
    warnings: []
  };
}

export function detectConfigType(config) {
  if (!isPlainObject(config)) {
    return "unknown";
  }

  if (Array.isArray(config.states)) {
    return "flow";
  }

  if (isPlainObject(config.camera) && Array.isArray(config.objects)) {
    return "scene";
  }

  if (typeof config.defaultSceneId === "string" && typeof config.defaultFlowId === "string") {
    return "project";
  }

  return "unknown";
}

function validateProjectConfig(config) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(config)) {
    return {
      valid: false,
      errors: ["ProjectConfig 必须是对象。"],
      warnings
    };
  }

  requireString(config, "id", errors);
  requireString(config, "name", errors);
  requireString(config, "defaultSceneId", errors);
  requireString(config, "defaultFlowId", errors);

  if (
    !Array.isArray(config.scenes) ||
    config.scenes.length === 0 ||
    config.scenes.some((sceneId) => typeof sceneId !== "string" || sceneId.trim() === "")
  ) {
    errors.push("scenes 必须是非空字符串数组。");
  }

  if (!isPlainObject(config.theme)) {
    errors.push("theme 必须是对象。");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function requireString(target, key, errors, label = key) {
  if (typeof target[key] !== "string" || target[key].trim() === "") {
    errors.push(`${label} 必须是非空字符串。`);
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
