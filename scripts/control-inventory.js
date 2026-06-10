#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VALID_STATES = new Set(["real", "demo", "disabled"]);
const PAGES = [
  "index.html",
  "main-admin.html",
  "realistic-demo.html",
  "realistic-admin.html"
];

const options = {
  check: process.argv.includes("--check")
};

const failures = [];
const summary = [];

PAGES.forEach((page) => {
  const html = fs.readFileSync(path.join(ROOT, page), "utf8");
  const controls = [...html.matchAll(/<(button|a)\b[^>]*>/gi)].map((match) => ({
    tag: match[1].toLowerCase(),
    source: match[0],
    line: getLineNumber(html, match.index || 0)
  }));
  const counts = { real: 0, demo: 0, disabled: 0, missing: 0, invalid: 0 };

  controls.forEach((control) => {
    if (control.tag === "a" && !/\shref=/.test(control.source)) {
      return;
    }

    const stateMatch = control.source.match(/\sdata-feature-state=["']([^"']+)["']/i);
    if (!stateMatch) {
      counts.missing += 1;
      failures.push(`${page}:${control.line} 缺少 data-feature-state：${compactTag(control.source)}`);
      return;
    }

    const state = stateMatch[1];
    if (!VALID_STATES.has(state)) {
      counts.invalid += 1;
      failures.push(`${page}:${control.line} 状态值无效 “${state}”：${compactTag(control.source)}`);
      return;
    }

    counts[state] += 1;
  });

  summary.push({ page, counts });
});

summary.forEach(({ page, counts }) => {
  console.log(`${page}: real ${counts.real}, demo ${counts.demo}, disabled ${counts.disabled}, missing ${counts.missing}, invalid ${counts.invalid}`);
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

function compactTag(tag) {
  return tag.replace(/\s+/g, " ").slice(0, 160);
}
