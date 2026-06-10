export const reportMetricKeys = [
  "pathAccuracy",
  "strokeOrder",
  "rhythm",
  "focus"
];

export function createReport(overrides = {}) {
  return {
    id: overrides.id ?? makeId("report"),
    sessionId: overrides.sessionId ?? "",
    generatedAt: overrides.generatedAt ?? new Date().toISOString(),
    score: overrides.score ?? 0,
    metrics: {
      pathAccuracy: 0,
      strokeOrder: 0,
      rhythm: 0,
      focus: 0,
      ...overrides.metrics
    },
    suggestions: overrides.suggestions ?? [],
    summary: overrides.summary ?? ""
  };
}

export function cloneReport(report) {
  return structuredClone(report);
}

export function validateReport(report) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(report)) {
    return {
      valid: false,
      errors: ["Report 必须是一个对象。"],
      warnings
    };
  }

  requireString(report, "id", errors);
  requireString(report, "sessionId", errors);
  requireIsoDate(report, "generatedAt", errors);

  if (!isScore(report.score)) {
    errors.push("score 必须是 0 到 100 之间的数字。");
  }

  validateMetrics(report.metrics, errors, warnings);
  validateSuggestions(report.suggestions, errors);

  if (report.summary !== undefined && typeof report.summary !== "string") {
    errors.push("summary 必须是字符串。");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateMetrics(metrics, errors, warnings) {
  if (!isPlainObject(metrics)) {
    errors.push("metrics 必须是对象。");
    return;
  }

  reportMetricKeys.forEach((key) => {
    if (!isScore(metrics[key])) {
      errors.push(`metrics.${key} 必须是 0 到 100 之间的数字。`);
    }
  });

  Object.keys(metrics).forEach((key) => {
    if (!reportMetricKeys.includes(key)) {
      warnings.push(`metrics.${key} 不是已登记报告指标。`);
    }
  });
}

function validateSuggestions(suggestions, errors) {
  if (!Array.isArray(suggestions)) {
    errors.push("suggestions 必须是数组。");
    return;
  }

  suggestions.forEach((suggestion, index) => {
    if (typeof suggestion !== "string" || suggestion.trim() === "") {
      errors.push(`suggestions[${index}] 必须是非空字符串。`);
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

function isScore(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
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
