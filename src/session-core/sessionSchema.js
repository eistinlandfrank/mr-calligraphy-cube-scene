export const practiceSessionStatuses = ["active", "paused", "completed", "cancelled"];

export const sessionEventTypes = [
  "session_started",
  "state_entered",
  "state_exited",
  "action_triggered",
  "practice_started",
  "stroke_started",
  "stroke_completed",
  "practice_completed",
  "score_generated",
  "report_generated",
  "session_finished"
];

export const caregiverActionTypes = [
  "pause",
  "resume",
  "end",
  "restart",
  "callElder",
  "resetPractice",
  "saveReport"
];

export function createPracticeSession(overrides = {}) {
  const startedAt = overrides.startedAt ?? new Date().toISOString();

  return {
    id: overrides.id ?? makeId("session"),
    flowId: overrides.flowId ?? "main-demo-flow",
    startedAt,
    endedAt: overrides.endedAt ?? null,
    currentState: overrides.currentState ?? "idle",
    status: overrides.status ?? "active",
    elderProfile: overrides.elderProfile ?? null,
    events: overrides.events ?? [
      createSessionEvent({
        type: "session_started",
        stateId: overrides.currentState ?? "idle",
        at: startedAt
      })
    ],
    practiceData: overrides.practiceData ?? createPracticeData(),
    caregiverActions: overrides.caregiverActions ?? []
  };
}

export function createPracticeData(overrides = {}) {
  return {
    character: overrides.character ?? "永",
    startedAt: overrides.startedAt ?? null,
    completedAt: overrides.completedAt ?? null,
    strokes: overrides.strokes ?? [],
    rewriteCount: overrides.rewriteCount ?? 0,
    interruptionCount: overrides.interruptionCount ?? 0
  };
}

export function createSessionEvent(overrides = {}) {
  return {
    id: overrides.id ?? makeId("event"),
    type: overrides.type ?? "action_triggered",
    at: overrides.at ?? new Date().toISOString(),
    stateId: overrides.stateId ?? null,
    payload: overrides.payload ?? {}
  };
}

export function createCaregiverAction(overrides = {}) {
  return {
    id: overrides.id ?? makeId("caregiver-action"),
    type: overrides.type ?? "pause",
    at: overrides.at ?? new Date().toISOString(),
    stateId: overrides.stateId ?? null,
    payload: overrides.payload ?? {}
  };
}

export function clonePracticeSession(session) {
  return structuredClone(session);
}

export function validatePracticeSession(session) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(session)) {
    return {
      valid: false,
      errors: ["PracticeSession 必须是一个对象。"],
      warnings
    };
  }

  requireString(session, "id", errors);
  requireString(session, "flowId", errors);
  requireIsoDate(session, "startedAt", errors);
  requireNullableIsoDate(session, "endedAt", errors);
  requireString(session, "currentState", errors);

  if (typeof session.status !== "string" || !practiceSessionStatuses.includes(session.status)) {
    errors.push(`status 必须是以下值之一：${practiceSessionStatuses.join(", ")}。`);
  }

  validateEvents(session.events, errors, warnings);
  validatePracticeData(session.practiceData, errors);
  validateCaregiverActions(session.caregiverActions, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateEvents(events, errors, warnings) {
  if (!Array.isArray(events)) {
    errors.push("events 必须是数组。");
    return;
  }

  events.forEach((event, index) => {
    const prefix = `events[${index}]`;

    if (!isPlainObject(event)) {
      errors.push(`${prefix} 必须是对象。`);
      return;
    }

    requireString(event, "id", errors, `${prefix}.id`);
    requireString(event, "type", errors, `${prefix}.type`);
    requireIsoDate(event, "at", errors, `${prefix}.at`);

    if (event.type && !sessionEventTypes.includes(event.type)) {
      warnings.push(`${prefix}.type 不是已登记事件类型：${event.type}`);
    }

    if (event.stateId !== null && event.stateId !== undefined && typeof event.stateId !== "string") {
      errors.push(`${prefix}.stateId 必须是字符串、null 或省略。`);
    }

    if (event.payload !== undefined && !isPlainObject(event.payload)) {
      errors.push(`${prefix}.payload 必须是对象。`);
    }
  });
}

function validatePracticeData(practiceData, errors) {
  if (!isPlainObject(practiceData)) {
    errors.push("practiceData 必须是对象。");
    return;
  }

  requireString(practiceData, "character", errors, "practiceData.character");
  requireNullableIsoDate(practiceData, "startedAt", errors, "practiceData.startedAt");
  requireNullableIsoDate(practiceData, "completedAt", errors, "practiceData.completedAt");

  if (!Array.isArray(practiceData.strokes)) {
    errors.push("practiceData.strokes 必须是数组。");
  }

  if (!isNonNegativeInteger(practiceData.rewriteCount)) {
    errors.push("practiceData.rewriteCount 必须是大于等于 0 的整数。");
  }

  if (!isNonNegativeInteger(practiceData.interruptionCount)) {
    errors.push("practiceData.interruptionCount 必须是大于等于 0 的整数。");
  }
}

function validateCaregiverActions(actions, errors, warnings) {
  if (!Array.isArray(actions)) {
    errors.push("caregiverActions 必须是数组。");
    return;
  }

  actions.forEach((action, index) => {
    const prefix = `caregiverActions[${index}]`;

    if (!isPlainObject(action)) {
      errors.push(`${prefix} 必须是对象。`);
      return;
    }

    requireString(action, "id", errors, `${prefix}.id`);
    requireString(action, "type", errors, `${prefix}.type`);
    requireIsoDate(action, "at", errors, `${prefix}.at`);

    if (action.type && !caregiverActionTypes.includes(action.type)) {
      warnings.push(`${prefix}.type 不是已登记护工操作：${action.type}`);
    }

    if (action.stateId !== null && action.stateId !== undefined && typeof action.stateId !== "string") {
      errors.push(`${prefix}.stateId 必须是字符串、null 或省略。`);
    }

    if (action.payload !== undefined && !isPlainObject(action.payload)) {
      errors.push(`${prefix}.payload 必须是对象。`);
    }
  });
}

function requireString(target, key, errors, label = key) {
  if (typeof target[key] !== "string" || target[key].trim() === "") {
    errors.push(`${label} 必须是非空字符串。`);
  }
}

function requireIsoDate(target, key, errors, label = key) {
  if (typeof target[key] !== "string" || Number.isNaN(Date.parse(target[key]))) {
    errors.push(`${label} 必须是有效 ISO 时间字符串。`);
  }
}

function requireNullableIsoDate(target, key, errors, label = key) {
  if (target[key] === null) {
    return;
  }

  requireIsoDate(target, key, errors, label);
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
