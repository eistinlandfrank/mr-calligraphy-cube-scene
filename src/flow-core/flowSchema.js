export const FLOW_CONFIG_VERSION = "0.1.0";

export const flowStateIds = [
  "idle",
  "ready_check",
  "enter_experience",
  "immersive_intro",
  "calligraphy_tutorial",
  "practice_game",
  "scoring",
  "report",
  "caregiver_confirm",
  "finished"
];

export const flowActionTypes = [
  "start",
  "next",
  "pause",
  "resume",
  "finish",
  "restart",
  "confirm",
  "saveReport",
  "callCaregiver",
  "reset"
];

export const defaultFlowState = {
  id: "idle",
  title: "等待开始",
  description: "等待护工或演示人员启动体验。",
  actions: ["start"],
  next: "ready_check",
  duration: 0,
  enterActions: [],
  exitActions: []
};

export function createFlowState(overrides = {}) {
  return {
    ...structuredClone(defaultFlowState),
    ...overrides,
    actions: overrides.actions ?? defaultFlowState.actions,
    enterActions: overrides.enterActions ?? defaultFlowState.enterActions,
    exitActions: overrides.exitActions ?? defaultFlowState.exitActions
  };
}

export function cloneFlowConfig(flowConfig) {
  return structuredClone(flowConfig);
}

export function validateFlowConfig(flowConfig) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(flowConfig)) {
    return {
      valid: false,
      errors: ["FlowConfig 必须是一个对象。"],
      warnings
    };
  }

  requireString(flowConfig, "id", errors);
  requireString(flowConfig, "name", errors);
  requireString(flowConfig, "version", errors);
  requireString(flowConfig, "initialState", errors);

  if (!Array.isArray(flowConfig.states) || flowConfig.states.length === 0) {
    errors.push("states 必须是非空数组。");
  } else {
    validateStates(flowConfig, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateStates(flowConfig, errors, warnings) {
  const ids = new Set();

  flowConfig.states.forEach((state, index) => {
    const prefix = `states[${index}]`;

    if (!isPlainObject(state)) {
      errors.push(`${prefix} 必须是对象。`);
      return;
    }

    requireString(state, "id", errors, `${prefix}.id`);
    requireString(state, "title", errors, `${prefix}.title`);

    if (state.description !== undefined && typeof state.description !== "string") {
      errors.push(`${prefix}.description 必须是字符串。`);
    }

    if (!Array.isArray(state.actions)) {
      errors.push(`${prefix}.actions 必须是数组。`);
    } else {
      state.actions.forEach((action, actionIndex) => {
        if (typeof action !== "string" || action.trim() === "") {
          errors.push(`${prefix}.actions[${actionIndex}] 必须是非空字符串。`);
        } else if (!flowActionTypes.includes(action)) {
          warnings.push(`${prefix}.actions[${actionIndex}] 不是已登记动作：${action}`);
        }
      });
    }

    if (state.next !== null && state.next !== undefined && (typeof state.next !== "string" || state.next.trim() === "")) {
      errors.push(`${prefix}.next 必须是非空字符串、null 或省略。`);
    }

    if (!isFiniteNumber(state.duration) || state.duration < 0) {
      errors.push(`${prefix}.duration 必须是大于等于 0 的数字。`);
    }

    validateActionList(state.enterActions, `${prefix}.enterActions`, errors);
    validateActionList(state.exitActions, `${prefix}.exitActions`, errors);

    if (state.id) {
      if (ids.has(state.id)) {
        errors.push(`${prefix}.id 与其他状态重复：${state.id}`);
      }
      ids.add(state.id);

      if (!flowStateIds.includes(state.id)) {
        warnings.push(`${prefix}.id 不是主演示流程标准状态：${state.id}`);
      }
    }
  });

  if (flowConfig.initialState && !ids.has(flowConfig.initialState)) {
    errors.push(`initialState 指向不存在的状态：${flowConfig.initialState}`);
  }

  flowConfig.states.forEach((state, index) => {
    if (state?.next && !ids.has(state.next)) {
      errors.push(`states[${index}].next 指向不存在的状态：${state.next}`);
    }
  });
}

function validateActionList(actions, label, errors) {
  if (actions === undefined) {
    return;
  }

  if (!Array.isArray(actions)) {
    errors.push(`${label} 必须是数组。`);
    return;
  }

  actions.forEach((action, index) => {
    if (typeof action !== "string" || action.trim() === "") {
      errors.push(`${label}[${index}] 必须是非空字符串。`);
    }
  });
}

function requireString(target, key, errors, label = key) {
  if (typeof target[key] !== "string" || target[key].trim() === "") {
    errors.push(`${label} 必须是非空字符串。`);
  }
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
