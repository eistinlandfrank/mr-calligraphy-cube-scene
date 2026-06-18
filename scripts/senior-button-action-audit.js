#!/usr/bin/env node

const { chromium } = require("@playwright/test");

const DEFAULT_BASE_URL = "http://localhost:41496/";

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const browser = await chromium.launch();
  const failures = [];
  let checkedButtons = 0;

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      acceptDownloads: true
    });
    await context.route(/\.(?:avif|glb|hdr|jpe?g|obj|png|webp)(?:\?.*)?$/i, (route) => route.abort());
    await context.addInitScript(() => {
      window.__MR_FORCE_SENIOR_NOTICE = true;
      window.localStorage.clear();
    });
    const page = await context.newPage();

    checkedButtons += await runCoreButtonChecks(page, options.baseUrl, failures);
    checkedButtons += await runConditionalPracticeChecks(page, options.baseUrl, failures);

    await context.close();
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error(["老人前台按钮真实可用审计失败：", ...failures.map((failure) => `- ${failure}`)].join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log(`老人前台按钮真实可用审计通过：${checkedButtons} 个核心可见按钮与条件按钮。`);
}

async function runCoreButtonChecks(page, baseUrl, failures) {
  const checks = [
    { label: "首页收起", path: [], button: "收起主面板", expect: (after) => after.collapsed },
    { label: "首页先看看", path: [], button: "先看看", expect: (after) => after.menuStage === "secondary" && after.panelTitle === "先看看" },
    { label: "首页开始写", path: [], button: "开始写", expect: (after) => after.menuStage === "secondary" && after.panelTitle === "开始写" },
    { label: "首页看结果", path: [], button: "看结果", expect: (after) => after.menuStage === "secondary" && after.panelTitle === "看结果" },
    { label: "选字", path: ["先看看"], button: "选字", expect: (after) => after.scene === "1" && after.feedback },
    { label: "听讲解", path: ["先看看"], button: "听讲解", expect: (after) => after.scene === "2" && after.feedback },
    { label: "去练字", path: ["先看看"], button: "去练字", expect: (after) => after.scene === "3" && after.stats.sessions > 0 },
    { label: "练字", path: ["开始写"], button: "练字", expect: (after) => after.scene === "3" && after.stats.sessions > 0 },
    { label: "看笔画", path: ["开始写"], button: "看笔画", expect: (after) => after.scene === "4" && after.feedback },
    { label: "写作品", path: ["开始写"], button: "写作品", expect: (after) => after.scene === "5" && after.feedback },
    { label: "看记录", path: ["看结果"], button: "看记录", expect: (after) => after.scene === "6" && after.feedback },
    { label: "看报告", path: ["看结果"], button: "看报告", expect: (after) => after.scene === "8" && after.feedback },
    { label: "练习计划", path: ["看结果"], button: "练习计划", expect: (after) => after.scene === "9" && after.feedback },
    { label: "开始听", path: ["先看看", "听讲解"], button: "开始听", expect: (after) => after.feedback && after.detailText.includes("讲解") },
    { label: "换字帖", path: ["先看看", "听讲解"], button: "换字帖", expect: (after) => after.feedback && after.detailText.includes("任务") },
    { label: "讲解到练字", path: ["先看看", "听讲解"], button: "练字", expect: (after) => after.scene === "3" && after.stats.sessions > 0 },
    { label: "看范字", path: ["开始写", "练字"], button: "看范字", expect: (after) => after.feedback === "看范字" && after.detailText.includes("训练模式") },
    { label: "比一比", path: ["开始写", "练字"], button: "比一比", expect: (after) => after.stats.mode === "compare" && after.detailText.includes("训练模式") },
    { label: "练字看笔画", path: ["开始写", "练字"], button: "看笔画", expect: (after) => after.scene === "4" && after.feedback },
    { label: "换风格", path: ["开始写", "写作品"], button: "换风格", expect: (after) => after.feedback === "换风格" && after.detailText.includes("创作风格") },
    { label: "创作看记录", path: ["开始写", "写作品"], button: "看记录", expect: (after) => after.scene === "6" && after.feedback },
    { label: "空记录导报告", path: ["看结果", "看记录"], button: "导报告", expect: (after) => after.scene === "8" && after.stats.reports > 0 },
    { label: "报告再练", path: ["看结果", "看报告"], button: "再练", expect: (after) => after.scene === "3" && after.stats.sessions > 0 },
    { label: "报告做计划", path: ["看结果", "看报告"], button: "做计划", expect: (after) => after.stats.plans > 0 && after.detailText.includes("计划") },
    { label: "报告导出", path: ["看结果", "看报告"], button: "导报告", expect: (after) => after.stats.reports > 0 && after.detailText.includes("报告") },
    { label: "计划详情", path: ["看结果", "练习计划"], button: "看详情", expect: (after) => after.detailText.includes("VR 菜单总结") },
    { label: "计划再练笔", path: ["看结果", "练习计划"], button: "再练笔", expect: (after) => after.scene === "4" && after.detailText.includes("复习") },
    { label: "计划回首页", path: ["看结果", "练习计划"], button: "首页", expect: (after) => after.scene === "0" && after.menuStage === "primary" }
  ];

  for (const check of checks) {
    await reloadHome(page, baseUrl);
    await openPath(page, check.path);
    const before = await getPageState(page);
    await clickButton(page, check.button);
    await page.waitForTimeout(760);
    const after = await getPageState(page);
    if (JSON.stringify(before) === JSON.stringify(after) || !check.expect(after, before)) {
      failures.push(`${check.label} / ${check.button} 没有真实反馈`);
    }
  }

  return checks.length;
}

async function runConditionalPracticeChecks(page, baseUrl, failures) {
  let checkedButtons = 0;

  await reloadHome(page, baseUrl);
  await openPath(page, ["开始写", "练字"]);
  let labels = await getVisibleButtonLabels(page);
  ["撤销上一笔", "清空练习", "回放笔迹"].forEach((label) => {
    if (labels.includes(label)) {
      failures.push(`空白练习格不应显示 ${label}`);
    }
  });

  await reloadHome(page, baseUrl);
  await openPath(page, ["开始写", "写作品"]);
  labels = await getVisibleButtonLabels(page);
  if (labels.includes("保存作品")) {
    failures.push("无笔迹时创作台不应显示保存作品");
  }

  const toolChecks = [
    { label: "撤销上一笔", expect: (after) => after.strokes === 0 && /撤销/.test(after.canvasStatus) },
    { label: "清空练习", expect: (after) => after.strokes === 0 && /清空/.test(after.canvasStatus) },
    { label: "回放笔迹", expect: (after) => /回放/.test(after.canvasStatus) }
  ];

  for (const check of toolChecks) {
    await reloadHome(page, baseUrl);
    await openPath(page, ["开始写", "练字"]);
    await drawPracticeStroke(page);
    labels = await getVisibleButtonLabels(page);
    if (!labels.includes(check.label)) {
      failures.push(`写出笔迹后应显示 ${check.label}`);
      continue;
    }
    checkedButtons += 1;
    await clickButton(page, check.label);
    await page.waitForTimeout(760);
    const after = await getPageState(page);
    if (!check.expect(after)) {
      failures.push(`${check.label} 点击后没有真实反馈`);
    }
  }

  await reloadHome(page, baseUrl);
  await openPath(page, ["开始写", "练字"]);
  await drawPracticeStroke(page);
  await clickButton(page, "回到首页");
  await clickButton(page, "开始写");
  await page.waitForTimeout(520);
  await clickButton(page, "写作品");
  await page.waitForTimeout(760);
  labels = await getVisibleButtonLabels(page);
  if (!labels.includes("保存作品")) {
    failures.push("写出笔迹后创作台应显示保存作品");
    return checkedButtons;
  }
  checkedButtons += 1;
  const before = await getPageState(page);
  await clickButton(page, "保存作品");
  await page.waitForTimeout(900);
  const after = await getPageState(page);
  if (after.stats.artworks <= before.stats.artworks || after.feedback === "请先完成") {
    failures.push("保存作品没有写入真实作品记录");
  }

  return checkedButtons;
}

function parseArgs(args) {
  const options = {
    baseUrl: process.env.SENIOR_BUTTON_AUDIT_BASE_URL || DEFAULT_BASE_URL,
    help: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--base-url") {
      options.baseUrl = args[index + 1] || "";
      index += 1;
    } else if (arg.startsWith("--base-url=")) {
      options.baseUrl = arg.slice("--base-url=".length);
    } else if (/^https?:\/\//.test(arg)) {
      options.baseUrl = arg;
    } else {
      throw new Error(`未知参数：${arg}`);
    }
  }

  if (!options.baseUrl) {
    options.baseUrl = DEFAULT_BASE_URL;
  }
  return options;
}

function printHelp() {
  console.log(`用法：
  node scripts/senior-button-action-audit.js
  node scripts/senior-button-action-audit.js --base-url=http://localhost:41496/

检查老人默认前台核心可见按钮是否有真实反馈，并检查空笔迹按钮不会提前显示。`);
}

async function reloadHome(page, baseUrl) {
  await page.goto(frontUrl(baseUrl), { waitUntil: "domcontentloaded" });
  await page.locator("#primaryMenuList").waitFor({ state: "attached", timeout: 5000 });
  await page.waitForTimeout(180);
}

async function openPath(page, labels) {
  for (const label of labels) {
    await clickButton(page, label);
    await page.waitForTimeout(520);
  }
}

async function clickButton(page, label) {
  if (label === "收起主面板") {
    await page.locator("#infoPanelToggle").click();
    return;
  }
  if (label === "回到首页") {
    await page.locator("#infoPanelBack").click();
    await page.waitForTimeout(220);
    return;
  }
  const button = page.getByRole("button", { name: label, exact: true }).first();
  await button.waitFor({ state: "visible", timeout: 5000 });
  await button.click();
}

async function drawPracticeStroke(page) {
  const box = await page.locator("#practiceCanvas").boundingBox();
  if (!box) {
    throw new Error("找不到书写画布。");
  }
  await page.mouse.move(box.x + box.width * 0.28, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.42, box.y + box.height * 0.42, { steps: 4 });
  await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.56, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(360);
}

async function getVisibleButtonLabels(page) {
  return page.locator("button").evaluateAll((buttons) => {
    const hiddenByTree = (element) => {
      for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
        const style = window.getComputedStyle(node);
        if (node.hasAttribute("hidden") || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
          return true;
        }
      }
      return false;
    };

    return buttons.filter((button) => {
      const rect = button.getBoundingClientRect();
      return !button.disabled && !hiddenByTree(button) && rect.width > 0 && rect.height > 0;
    }).map((button) => String(button.getAttribute("aria-label") || button.innerText || button.textContent || "").replace(/\s+/g, " ").trim()).filter(Boolean);
  });
}

async function getPageState(page) {
  return page.evaluate(() => ({
    url: location.href,
    scene: document.body.dataset.learningScene || "",
    menuStage: document.querySelector("#infoPanel")?.dataset.menuStage || "",
    collapsed: document.querySelector("#infoPanel")?.classList.contains("is-collapsed") || false,
    title: document.querySelector("#sceneTitle")?.textContent?.trim() || "",
    panelTitle: document.querySelector("#contentTitle")?.textContent?.trim() || "",
    feedback: document.querySelector("#actionFeedback")?.textContent?.trim() || "",
    detailText: document.querySelector("#actionDetail")?.hidden
      ? ""
      : document.querySelector("#actionDetail")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 100) || "",
    notice: document.querySelector("#noticeState")?.textContent?.trim() || "",
    canvasStatus: document.querySelector("#practiceCanvasStatus")?.textContent?.trim() || "",
    strokes: window.MRPracticeCanvas?.getStrokes?.().length || 0,
    stats: window.MRAppState?.getStats?.()
      ? {
          sessions: window.MRAppState.getStats().sessionCount,
          practiced: window.MRAppState.getStats().practicedSessionCount,
          artworks: window.MRAppState.getStats().artworkCount,
          reports: window.MRAppState.getStats().reportCount,
          plans: window.MRAppState.getStats().planCount,
          mode: window.MRAppState.getStats().trainingMode,
          activeStroke: window.MRAppState.getStats().activeStroke
        }
      : { sessions: 0, practiced: 0, artworks: 0, reports: 0, plans: 0, mode: "", activeStroke: "" }
  }));
}

function frontUrl(baseUrl) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL("index.html", normalizedBase).toString();
}
