#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(ROOT, "script.js");
const VALID_STATES = new Set(["real", "real-local", "real-export", "real-published-local"]);

const source = fs.readFileSync(SCRIPT_PATH, "utf8");
const failures = [];

const sceneActions = extractSceneActions(source);
const featureEntries = extractLearningActionFeatureEntries(source);
const handlerCases = extractRunLearningActionCases(source);

const actionLabels = [...new Set(sceneActions.map((item) => item.label))];
const featureLabels = new Set(featureEntries.map((item) => item.label));
const handlerLabels = new Set(handlerCases);

if (!sceneActions.length) {
  failures.push("未能从 SCENES 中解析到学习路径动作。");
}

actionLabels.forEach((label) => {
  if (!featureLabels.has(label)) {
    failures.push(`学习路径动作缺少 LEARNING_ACTION_FEATURES 标记：${label}`);
  }
  if (!handlerLabels.has(label)) {
    failures.push(`学习路径动作缺少 runLearningAction 处理分支：${label}`);
  }
});

featureEntries.forEach((entry) => {
  if (!VALID_STATES.has(entry.state)) {
    failures.push(`学习路径动作状态不应为 ${entry.state}：${entry.label}`);
  }
});

handlerCases.forEach((label) => {
  if (!featureLabels.has(label)) {
    failures.push(`runLearningAction 分支缺少 LEARNING_ACTION_FEATURES 标记：${label}`);
  }
});

if (failures.length) {
  console.error("学习路径动作覆盖检查失败：");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`学习路径动作覆盖检查通过：${countScenes(source)} 个场景，${actionLabels.length} 个动作，${featureEntries.length} 个状态标记，${handlerCases.length} 个处理分支。`);

function extractSceneActions(text) {
  const actions = [];
  const actionBlockPattern = /actions\s*:\s*\[([\s\S]*?)\]\s*,\s*points\s*:/g;
  let blockMatch;
  while ((blockMatch = actionBlockPattern.exec(text))) {
    const block = blockMatch[1] || "";
    const labelPattern = /label\s*:\s*"([^"]+)"/g;
    let labelMatch;
    while ((labelMatch = labelPattern.exec(block))) {
      actions.push({
        label: labelMatch[1],
        index: blockMatch.index + labelMatch.index
      });
    }
  }
  return actions;
}

function extractLearningActionFeatureEntries(text) {
  const start = text.indexOf("const LEARNING_ACTION_FEATURES =");
  if (start < 0) {
    failures.push("未找到 LEARNING_ACTION_FEATURES。");
    return [];
  }
  const end = text.indexOf("\n};", start);
  if (end < 0) {
    failures.push("未能解析 LEARNING_ACTION_FEATURES 结束位置。");
    return [];
  }
  const block = text.slice(start, end);
  const entries = [];
  const entryPattern = /^\s*(?:(["'])(.*?)\1|([^:\s]+))\s*:\s*\[\s*["']([^"']+)["']/gm;
  let match;
  while ((match = entryPattern.exec(block))) {
    entries.push({
      label: match[2] || match[3],
      state: match[4]
    });
  }
  return entries;
}

function extractRunLearningActionCases(text) {
  const start = text.indexOf("function runLearningAction");
  if (start < 0) {
    failures.push("未找到 runLearningAction。");
    return [];
  }
  const end = text.indexOf("\nfunction updateStepNavigation", start);
  if (end < 0) {
    failures.push("未能解析 runLearningAction 结束位置。");
    return [];
  }
  const block = text.slice(start, end);
  return [...block.matchAll(/case\s+"([^"]+)"/g)].map((match) => match[1]);
}

function countScenes(text) {
  const sceneBlock = text.slice(0, text.indexOf("const LEARNING_ACTION_FEATURES ="));
  return (sceneBlock.match(/^\s*title:\s*"/gm) || []).length;
}
