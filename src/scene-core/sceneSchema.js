export const SCENE_CONFIG_VERSION = "0.1.0";

export const sceneTypes = [
  "product-view",
  "elder-view",
  "caregiver-view",
  "calligraphy-game",
  "gallery-report"
];

export const sceneObjectTypes = [
  "capsule-shell",
  "capsule-door",
  "recliner-chair",
  "immersive-screen",
  "observation-window",
  "caregiver-screen",
  "emergency-button",
  "virtual-brush",
  "ui-panel",
  "light",
  "decor",
  "model"
];

export const hotspotTriggers = ["click", "gaze", "voice", "timeline"];

export const timelineActions = [
  "setView",
  "openDoor",
  "closeDoor",
  "fadeIn",
  "fadeOut",
  "showPanel",
  "hidePanel",
  "playBrush",
  "generateReport",
  "notifyCaregiver"
];

export const defaultSceneObject = {
  id: "new-object",
  type: "decor",
  name: "新对象",
  visible: true,
  interactive: false,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  material: {
    color: "#f4efe8",
    roughness: 0.45,
    metalness: 0.08,
    opacity: 1,
    emissiveColor: "#000000"
  }
};

export function createSceneObject(overrides = {}) {
  return {
    ...structuredClone(defaultSceneObject),
    ...overrides,
    material: {
      ...defaultSceneObject.material,
      ...overrides.material
    }
  };
}

export function cloneSceneConfig(sceneConfig) {
  return structuredClone(sceneConfig);
}

export function validateSceneConfig(sceneConfig) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(sceneConfig)) {
    return {
      valid: false,
      errors: ["SceneConfig 必须是一个对象。"],
      warnings
    };
  }

  requireString(sceneConfig, "id", errors);
  requireString(sceneConfig, "name", errors);
  requireString(sceneConfig, "version", errors);
  requireString(sceneConfig, "type", errors);

  if (sceneConfig.type && !sceneTypes.includes(sceneConfig.type)) {
    warnings.push(`未知场景类型：${sceneConfig.type}`);
  }

  validateCamera(sceneConfig.camera, errors);
  validateEnvironment(sceneConfig.environment, errors);
  validateObjects(sceneConfig.objects, errors, warnings);
  validateHotspots(sceneConfig.hotspots, errors, warnings);
  validateTimeline(sceneConfig.timeline, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateCamera(camera, errors) {
  if (!isPlainObject(camera)) {
    errors.push("camera 必须是对象。");
    return;
  }

  requireVector3(camera, "position", "camera.position", errors);
  requireVector3(camera, "target", "camera.target", errors);

  if (!isFiniteNumber(camera.fov) || camera.fov < 25 || camera.fov > 90) {
    errors.push("camera.fov 必须是 25 到 90 之间的数字。");
  }
}

function validateEnvironment(environment, errors) {
  if (!isPlainObject(environment)) {
    errors.push("environment 必须是对象。");
    return;
  }

  requireString(environment, "ambientColor", errors, "environment.ambientColor");
}

function validateObjects(objects, errors, warnings) {
  if (!Array.isArray(objects) || objects.length === 0) {
    errors.push("objects 必须是非空数组。");
    return;
  }

  const ids = new Set();

  objects.forEach((object, index) => {
    const prefix = `objects[${index}]`;

    if (!isPlainObject(object)) {
      errors.push(`${prefix} 必须是对象。`);
      return;
    }

    requireString(object, "id", errors, `${prefix}.id`);
    requireString(object, "type", errors, `${prefix}.type`);
    requireString(object, "name", errors, `${prefix}.name`);
    requireVector3(object, "position", `${prefix}.position`, errors);
    requireVector3(object, "rotation", `${prefix}.rotation`, errors);
    requireVector3(object, "scale", `${prefix}.scale`, errors);

    if (object.id) {
      if (ids.has(object.id)) {
        errors.push(`${prefix}.id 与其他对象重复：${object.id}`);
      }
      ids.add(object.id);
    }

    if (object.type && !sceneObjectTypes.includes(object.type)) {
      warnings.push(`${prefix}.type 不是已登记类型：${object.type}`);
    }

    if (object.material) {
      validateMaterial(object.material, `${prefix}.material`, errors);
    }
  });
}

function validateMaterial(material, prefix, errors) {
  if (!isPlainObject(material)) {
    errors.push(`${prefix} 必须是对象。`);
    return;
  }

  if (material.opacity !== undefined && (!isFiniteNumber(material.opacity) || material.opacity < 0 || material.opacity > 1)) {
    errors.push(`${prefix}.opacity 必须是 0 到 1 之间的数字。`);
  }
}

function validateHotspots(hotspots, errors, warnings) {
  if (!Array.isArray(hotspots)) {
    errors.push("hotspots 必须是数组。");
    return;
  }

  hotspots.forEach((hotspot, index) => {
    const prefix = `hotspots[${index}]`;

    if (!isPlainObject(hotspot)) {
      errors.push(`${prefix} 必须是对象。`);
      return;
    }

    requireString(hotspot, "id", errors, `${prefix}.id`);
    requireString(hotspot, "label", errors, `${prefix}.label`);
    requireString(hotspot, "trigger", errors, `${prefix}.trigger`);
    requireVector3(hotspot, "position", `${prefix}.position`, errors);

    if (hotspot.trigger && !hotspotTriggers.includes(hotspot.trigger)) {
      warnings.push(`${prefix}.trigger 不是已登记触发类型：${hotspot.trigger}`);
    }
  });
}

function validateTimeline(timeline, errors, warnings) {
  if (!Array.isArray(timeline)) {
    errors.push("timeline 必须是数组。");
    return;
  }

  timeline.forEach((item, index) => {
    const prefix = `timeline[${index}]`;

    if (!isPlainObject(item)) {
      errors.push(`${prefix} 必须是对象。`);
      return;
    }

    if (!isFiniteNumber(item.time) || item.time < 0) {
      errors.push(`${prefix}.time 必须是大于等于 0 的数字。`);
    }

    requireString(item, "action", errors, `${prefix}.action`);

    if (item.action && !timelineActions.includes(item.action)) {
      warnings.push(`${prefix}.action 不是已登记动作：${item.action}`);
    }
  });
}

function requireString(target, key, errors, label = key) {
  if (typeof target[key] !== "string" || target[key].trim() === "") {
    errors.push(`${label} 必须是非空字符串。`);
  }
}

function requireVector3(target, key, label, errors) {
  const value = target[key];

  if (!Array.isArray(value) || value.length !== 3 || !value.every(isFiniteNumber)) {
    errors.push(`${label} 必须是包含 3 个数字的数组。`);
  }
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
