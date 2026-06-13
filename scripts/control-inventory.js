#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VALID_STATES = [
  "real",
  "real-local",
  "real-export",
  "real-published-local",
  "demo",
  "demo-content",
  "disabled"
];
const VALID_STATE_SET = new Set(VALID_STATES);
const PAGES = [
  { file: "index.html", scripts: ["practice-canvas.js", "script.js"] },
  { file: "main-admin.html", scripts: ["project-archive.js", "main-admin-scene.js"] },
  { file: "realistic-demo.html", scripts: ["realistic-scene.js"] },
  { file: "realistic-admin.html", scripts: ["realistic-scene.js"] }
];
const DYNAMIC_FILES = [
  "script.js",
  "main-admin-scene.js",
  "realistic-scene.js",
  "project-archive.js"
];
const DYNAMIC_BUTTON_SCAN_LIMIT = 2200;
const INTERACTIVE_REAL_STATES = new Set(["real", "real-local", "real-export", "real-published-local"]);

const options = {
  check: process.argv.includes("--check")
};

const failures = [];
const summary = [];
const dynamicSummary = [];

PAGES.forEach((pageConfig) => {
  const page = pageConfig.file;
  const html = fs.readFileSync(path.join(ROOT, page), "utf8");
  const scriptSources = pageConfig.scripts
    .map((file) => ({
      file,
      source: fs.readFileSync(path.join(ROOT, file), "utf8")
    }));
  const controls = [...html.matchAll(/<(button|a)\b[^>]*>/gi)].map((match) => ({
    tag: match[1].toLowerCase(),
    source: match[0],
    index: match.index || 0,
    formId: getEnclosingFormId(html, match.index || 0),
    line: getLineNumber(html, match.index || 0)
  }));
  const counts = Object.fromEntries(VALID_STATES.map((state) => [state, 0]));
  counts.missing = 0;
  counts.invalid = 0;
  counts.handled = 0;
  counts.missingHandler = 0;

  controls.forEach((control) => {
    const attrs = parseAttributes(control.source);
    if (control.tag === "a" && !attrs.href) {
      return;
    }

    const state = attrs["data-feature-state"];
    if (!state) {
      counts.missing += 1;
      failures.push(`${page}:${control.line} 缺少 data-feature-state：${compactTag(control.source)}`);
      return;
    }

    if (!VALID_STATE_SET.has(state)) {
      counts.invalid += 1;
      failures.push(`${page}:${control.line} 状态值无效 “${state}”：${compactTag(control.source)}`);
      return;
    }

    counts[state] += 1;
    if (INTERACTIVE_REAL_STATES.has(state)) {
      const handled = hasRealControlHandler(control, attrs, scriptSources);
      if (handled) {
        counts.handled += 1;
      } else {
        counts.missingHandler += 1;
        failures.push(`${page}:${control.line} 真实控件缺少可追踪处理器：${compactTag(control.source)}`);
      }
    }
  });

  summary.push({ page, counts });
});

DYNAMIC_FILES.forEach((file) => {
  const source = fs.readFileSync(path.join(ROOT, file), "utf8");
  const records = getDynamicButtonRecords(file, source);
  const dynamicButtonAssignmentIndexes = new Set(records
    .map((record) => record.stateAssignment?.index)
    .filter((index) => Number.isInteger(index)));
  const counts = Object.fromEntries(VALID_STATES.map((state) => [state, 0]));
  counts.buttons = records.length;
  counts.dynamicState = 0;
  counts.missing = 0;
  counts.invalid = 0;
  counts.handled = 0;
  counts.missingHandler = 0;

  validateLooseDynamicStateAssignments(file, source, dynamicButtonAssignmentIndexes);

  records.forEach((record) => {
    const assignment = record.stateAssignment;
    if (!assignment) {
      counts.missing += 1;
      failures.push(`${file}:${record.line} 动态按钮缺少 data-feature-state：${record.variableName}`);
      return;
    }

    if (assignment.dynamic) {
      counts.dynamicState += 1;
      if (record.handled) {
        counts.handled += 1;
      } else {
        counts.missingHandler += 1;
        failures.push(`${file}:${record.line} 动态状态按钮缺少可追踪处理器：${record.variableName} (${assignment.expression})`);
      }
      return;
    }

    if (!VALID_STATE_SET.has(assignment.state)) {
      counts.invalid += 1;
      failures.push(`${file}:${assignment.line} 动态控件状态值无效 “${assignment.state}”：${assignment.source}`);
      return;
    }

    counts[assignment.state] += 1;
    if (assignment.state === "demo-content") {
      failures.push(`${file}:${assignment.line} 动态控件不应写死 demo-content，请改为真实功能状态或显式禁用。`);
    }

    if (INTERACTIVE_REAL_STATES.has(assignment.state)) {
      if (record.handled) {
        counts.handled += 1;
      } else {
        counts.missingHandler += 1;
        failures.push(`${file}:${record.line} 真实动态按钮缺少可追踪处理器：${record.variableName}`);
      }
    }
  });

  dynamicSummary.push({ file, counts });
});

summary.forEach(({ page, counts }) => {
  const stateSummary = VALID_STATES
    .map((state) => `${state} ${counts[state]}`)
    .join(", ");
  console.log(`${page}: ${stateSummary}, missing ${counts.missing}, invalid ${counts.invalid}, handled ${counts.handled}, missingHandler ${counts.missingHandler}`);
});

dynamicSummary.forEach(({ file, counts }) => {
  const stateSummary = VALID_STATES
    .map((state) => `${state} ${counts[state]}`)
    .join(", ");
  console.log(`${file} dynamic: ${stateSummary}, dynamicState ${counts.dynamicState}, buttons ${counts.buttons}, missing ${counts.missing}, invalid ${counts.invalid}, handled ${counts.handled}, missingHandler ${counts.missingHandler}`);
});

if (failures.length) {
  console.error("\n控件状态清单失败：");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("\n控件状态清单通过。");
}

if (!options.check && failures.length) {
  console.log("\n提示：提交前请运行 node scripts/control-inventory.js --check。");
}

function getLineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function getDynamicButtonRecords(file, source) {
  const pattern = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*document\.createElement\(\s*["']button["']\s*\)/g;
  const matches = [...source.matchAll(pattern)];

  return matches.map((match, index) => {
    const start = match.index || 0;
    const nextStart = matches[index + 1]?.index ?? source.length;
    const end = Math.min(source.length, nextStart, start + DYNAMIC_BUTTON_SCAN_LIMIT);
    const block = source.slice(start, end);
    const variableName = match[1];
    const stateAssignment = getDynamicFeatureStateAssignment(source, block, start, variableName);
    return {
      file,
      variableName,
      line: getLineNumber(source, start),
      stateAssignment,
      handled: hasDynamicButtonHandler(source, block, variableName)
    };
  });
}

function getDynamicFeatureStateAssignment(source, block, blockStart, variableName) {
  const escapedName = escapeRegExp(variableName);
  const datasetPattern = new RegExp(`\\b${escapedName}\\.dataset\\.featureState\\s*=\\s*([^;\\n]+)`);
  const datasetMatch = datasetPattern.exec(block);
  if (datasetMatch) {
    return normalizeDynamicStateAssignment(source, blockStart + datasetMatch.index, datasetMatch[0], datasetMatch[1]);
  }

  const setAttributePattern = new RegExp(`\\b${escapedName}\\.setAttribute\\(\\s*["']data-feature-state["']\\s*,\\s*([^\\)\\n]+)\\)`);
  const setAttributeMatch = setAttributePattern.exec(block);
  if (setAttributeMatch) {
    return normalizeDynamicStateAssignment(source, blockStart + setAttributeMatch.index, setAttributeMatch[0], setAttributeMatch[1]);
  }

  return null;
}

function normalizeDynamicStateAssignment(source, index, assignmentSource, expression) {
  const trimmed = expression.trim();
  const literal = trimmed.match(/^["']([^"']+)["']/);
  return {
    index,
    line: getLineNumber(source, index),
    source: compactTag(assignmentSource),
    state: literal ? literal[1] : "",
    expression: compactTag(trimmed),
    dynamic: !literal
  };
}

function validateLooseDynamicStateAssignments(file, source, dynamicButtonAssignmentIndexes) {
  const literalPattern = /\.dataset\.featureState\s*=\s*["']([^"']+)["']/g;
  let match;
  while ((match = literalPattern.exec(source))) {
    const index = match.index || 0;
    if (dynamicButtonAssignmentIndexes.has(index)) {
      continue;
    }
    const state = match[1];
    if (!VALID_STATE_SET.has(state)) {
      failures.push(`${file}:${getLineNumber(source, index)} 动态控件状态值无效 “${state}”：${match[0]}`);
      continue;
    }
    if (state === "demo-content") {
      failures.push(`${file}:${getLineNumber(source, index)} 动态控件不应写死 demo-content，请改为真实功能状态或显式禁用。`);
    }
  }
}

function hasDynamicButtonHandler(source, block, variableName) {
  const escapedName = escapeRegExp(variableName);
  if (new RegExp(`\\b${escapedName}\\??\\.addEventListener\\(\\s*["']click["']`).test(block)) {
    return true;
  }

  return getDynamicButtonDataAttributes(block, variableName)
    .some((attr) => hasDelegatedDataHandler(source, attr));
}

function getDynamicButtonDataAttributes(block, variableName) {
  const attrs = new Set();
  const escapedName = escapeRegExp(variableName);
  const datasetPattern = new RegExp(`\\b${escapedName}\\.dataset\\.([A-Za-z_$][\\w$]*)\\s*=`, "g");
  let match;
  while ((match = datasetPattern.exec(block))) {
    attrs.add(datasetKeyToAttribute(match[1]));
  }

  const setAttributePattern = new RegExp(`\\b${escapedName}\\.setAttribute\\(\\s*["'](data-[^"']+)["']`, "g");
  while ((match = setAttributePattern.exec(block))) {
    attrs.add(match[1]);
  }

  attrs.delete("data-feature-state");
  attrs.delete("data-feature-label");
  return [...attrs];
}

function datasetKeyToAttribute(key) {
  return `data-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}

function hasDelegatedDataHandler(source, attr) {
  const escapedAttr = escapeRegExp(attr);
  const selectorPattern = new RegExp(`\\.(?:closest|matches)(?:\\?\\.)?\\(\\s*["'][^"']*\\[${escapedAttr}(?:\\]|[~|^$*]?=)`, "g");
  const selectorMatches = [...source.matchAll(selectorPattern)];
  if (!selectorMatches.length) {
    return false;
  }

  return selectorMatches.some((match) => {
    const windowStart = Math.max(0, match.index - 400);
    const windowEnd = Math.min(source.length, match.index + 800);
    const nearby = source.slice(windowStart, windowEnd);
    return /event\.target/.test(nearby) || /\.addEventListener\(\s*["']click["']/.test(nearby);
  });
}

function compactTag(tag) {
  return tag.replace(/\s+/g, " ").slice(0, 160);
}

function parseAttributes(tag) {
  const attrs = {};
  const pattern = /\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = pattern.exec(tag))) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function hasRealControlHandler(control, attrs, scriptSources) {
  if (control.tag === "a") {
    const href = String(attrs.href || "").trim();
    if (href && href !== "#" && !/^javascript:/i.test(href)) {
      return true;
    }
  }

  const id = attrs.id || "";
  if (id && scriptSources.some(({ source }) => hasIdHandler(source, id))) {
    return true;
  }

  if ((attrs.type || "").toLowerCase() === "submit" && control.formId && scriptSources.some(({ source }) => hasIdHandler(source, control.formId))) {
    return true;
  }

  return getDataSelectorAttributes(attrs)
    .some((attr) => scriptSources.some(({ source }) => hasSelectorHandler(source, attr)));
}

function hasIdHandler(source, id) {
  const names = getNamesForId(source, id);
  if (hasDirectIdHandler(source, id)) {
    return true;
  }
  return names.some((name) => hasNamedHandler(source, name) || hasNamedInitializerIntegration(source, name));
}

function getNamesForId(source, id) {
  const names = new Set();
  const escapedId = escapeRegExp(id);
  const declaration = new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*document\\.getElementById\\(\\s*["']${escapedId}["']\\s*\\)`, "g");
  let match;
  while ((match = declaration.exec(source))) {
    names.add(match[1]);
  }

  const property = new RegExp(`\\b([A-Za-z_$][\\w$]*)\\s*:\\s*document\\.getElementById\\(\\s*["']${escapedId}["']\\s*\\)`, "g");
  while ((match = property.exec(source))) {
    names.add(`els.${match[1]}`);
  }
  return [...names];
}

function hasDirectIdHandler(source, id) {
  const escapedId = escapeRegExp(id);
  return new RegExp(`(?:getElementById|querySelector)\\(\\s*["']#?${escapedId}["']\\s*\\)\\??\\.addEventListener\\(`).test(source);
}

function hasNamedHandler(source, name) {
  const escapedName = escapeRegExp(name);
  return new RegExp(`\\b${escapedName}\\??\\.addEventListener\\(`).test(source);
}

function hasNamedInitializerIntegration(source, name) {
  const escapedName = escapeRegExp(name);
  return new RegExp(`\\b[A-Za-z_$][\\w$]*Button\\s*:\\s*${escapedName}\\b`).test(source);
}

function getDataSelectorAttributes(attrs) {
  return Object.keys(attrs)
    .filter((key) => key.startsWith("data-") && key !== "data-feature-state" && key !== "data-feature-label");
}

function hasSelectorHandler(source, attr) {
  const escapedAttr = escapeRegExp(attr);
  const selectorPattern = new RegExp(`\\[${escapedAttr}(?:\\]|[~|^$*]?=)`, "g");
  const selectorMatches = [...source.matchAll(selectorPattern)];
  if (!selectorMatches.length) {
    return false;
  }
  const arrayBinding = new RegExp(`\\b([A-Za-z_$][\\w$]*)\\s*:\\s*Array\\.from\\(\\s*document\\.querySelectorAll\\(\\s*["'][^"']*\\[${escapedAttr}[^"']*["']\\s*\\)\\s*\\)`, "g");
  let bindingMatch;
  while ((bindingMatch = arrayBinding.exec(source))) {
    if (new RegExp(`\\bels\\.${escapeRegExp(bindingMatch[1])}\\.forEach\\([\\s\\S]*?\\.addEventListener\\(`).test(source)) {
      return true;
    }
  }
  if (new RegExp(`querySelectorAll\\(\\s*["'][^"']*\\[${escapedAttr}[^"']*["']\\s*\\)[\\s\\S]{0,500}\\.addEventListener\\(`).test(source)) {
    return true;
  }
  return selectorMatches.some((match) => {
    const windowStart = Math.max(0, match.index - 500);
    const windowEnd = Math.min(source.length, match.index + 800);
    const nearby = source.slice(windowStart, windowEnd);
    return /\.addEventListener\(/.test(nearby) || /\.closest\(\s*["'][^"']*\[/.test(nearby);
  });
}

function getEnclosingFormId(source, index) {
  const before = source.slice(0, index);
  const formStart = before.lastIndexOf("<form");
  if (formStart < 0) return "";
  const formEndBeforeButton = before.lastIndexOf("</form>");
  if (formEndBeforeButton > formStart) return "";
  const close = source.indexOf("</form>", index);
  if (close < 0) return "";
  const openTagEnd = source.indexOf(">", formStart);
  if (openTagEnd < 0 || openTagEnd > index) return "";
  const openTag = source.slice(formStart, openTagEnd + 1);
  const attrs = parseAttributes(openTag);
  return attrs.id || "";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
