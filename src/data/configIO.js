import { validateFlowConfig } from "../flow-core/flowSchema.js";
import { validateSceneConfig } from "../scene-core/sceneSchema.js";

export function createProjectExportPayload({ project, flow, scenes }) {
  return {
    type: "project-config-export",
    version: "0.1.0",
    exportedAt: new Date().toISOString(),
    project,
    flow,
    scenes
  };
}

export function stringifyConfigJson(config) {
  return `${JSON.stringify(config, null, 2)}\n`;
}

export function downloadConfigJson(config, filename) {
  if (typeof document === "undefined") {
    throw new Error("downloadConfigJson 只能在浏览器环境中使用。");
  }

  const blob = new Blob([stringifyConfigJson(config)], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

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

  if (type === "project-export") {
    return {
      type,
      config,
      ...validateProjectExportConfig(config)
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

  if (config.type === "project-config-export") {
    return "project-export";
  }

  return "unknown";
}

function validateProjectExportConfig(config) {
  const errors = [];
  const warnings = [];

  const projectResult = validateProjectConfig(config.project);
  const flowResult = validateFlowConfig(config.flow);

  errors.push(...projectResult.errors.map((error) => `project.${error}`));
  warnings.push(...projectResult.warnings.map((warning) => `project.${warning}`));
  errors.push(...flowResult.errors.map((error) => `flow.${error}`));
  warnings.push(...flowResult.warnings.map((warning) => `flow.${warning}`));

  if (!Array.isArray(config.scenes) || config.scenes.length === 0) {
    errors.push("scenes 必须是非空 SceneConfig 数组。");
  } else {
    config.scenes.forEach((scene, index) => {
      const result = validateSceneConfig(scene);
      errors.push(...result.errors.map((error) => `scenes[${index}].${error}`));
      warnings.push(...result.warnings.map((warning) => `scenes[${index}].${warning}`));
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
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
