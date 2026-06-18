#!/usr/bin/env node

const { chromium } = require("@playwright/test");

const DEFAULT_BASE_URL = "http://localhost:41496/";
const MIN_FONT_SIZE = 18;
const MAX_TEXT_LENGTH = 18;

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
  const reports = [];

  try {
    reports.push(await auditHome(browser, options.baseUrl, {
      label: "mobile-home",
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2
    }));
    reports.push(...await auditMobileMenus(browser, options.baseUrl));
    reports.push(await auditHome(browser, options.baseUrl, {
      label: "desktop-home",
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1
    }));
    reports.push(await auditForcedPanels(browser, options.baseUrl, {
      label: "mobile-forced-panels",
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2
    }));
    reports.push(await auditForcedPanels(browser, options.baseUrl, {
      label: "desktop-forced-panels",
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1
    }));
    reports.push(await auditSeniorConfirm(browser, options.baseUrl));
    reports.push(...await auditSeededLearningData(browser, options.baseUrl));
  } finally {
    await browser.close();
  }

  const failedReports = reports.filter((report) => report.findings.length);
  if (failedReports.length) {
    console.error(formatFailures(failedReports));
    process.exitCode = 1;
    return;
  }

  const totalTexts = reports.reduce((sum, report) => sum + report.visibleTextCount, 0);
  console.log(`老人前台可见文字审计通过：${reports.length} 个状态，${totalTexts} 个可见文本节点。`);
}

function parseArgs(args) {
  const options = {
    baseUrl: process.env.SENIOR_AUDIT_BASE_URL || DEFAULT_BASE_URL,
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
  node scripts/senior-visible-text-audit.js
  node scripts/senior-visible-text-audit.js --base-url=http://localhost:41496/

检查普通老人模式前台是否出现 ${MIN_FONT_SIZE}px 以下文字或超过 ${MAX_TEXT_LENGTH} 字的可见长句。`);
}

async function auditHome(browser, baseUrl, contextOptions) {
  const page = await openSeniorPage(browser, baseUrl, contextOptions);
  try {
    await waitForStableFrontPage(page);
    return await collectVisibleTextAudit(page, contextOptions.label);
  } finally {
    await page.close();
  }
}

async function auditMobileMenus(browser, baseUrl) {
  const page = await openSeniorPage(browser, baseUrl, {
    label: "mobile-menus",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const reports = [];

  try {
    await waitForStableFrontPage(page);
    const primaryTexts = await page.locator("#primaryMenuList button").evaluateAll((buttons) => {
      return buttons.map((button) => button.textContent.trim()).filter(Boolean);
    });

    for (const primaryText of primaryTexts) {
      await reloadSeniorPage(page, baseUrl);
      await clickButtonText(page, primaryText);
      reports.push(await collectVisibleTextAudit(page, `mobile-primary-${primaryText}`));

      const secondaryTexts = await page.locator("#secondaryMenuList button").evaluateAll((buttons) => {
        return buttons.map((button) => button.textContent.trim()).filter(Boolean);
      });
      for (const secondaryText of secondaryTexts) {
        await reloadSeniorPage(page, baseUrl);
        await clickButtonText(page, primaryText);
        await clickButtonText(page, secondaryText);
        reports.push(await collectVisibleTextAudit(page, `mobile-feature-${primaryText}-${secondaryText}`));
      }
    }
  } finally {
    await page.close();
  }

  return reports;
}

async function auditForcedPanels(browser, baseUrl, contextOptions) {
  const page = await openSeniorPage(browser, baseUrl, contextOptions);
  try {
    await waitForStableFrontPage(page);
    await page.evaluate(() => {
      document.querySelectorAll(
        ".path-panel, .scene-api-panel, #stepNav, .spatial-mode-panel, .quick-controls, #learningActionAudit, #localLinkCopyAudit"
      ).forEach((element) => {
        element.hidden = false;
        element.removeAttribute("hidden");
        if (element.tagName === "DETAILS") {
          element.open = true;
        }
      });
    });
    await page.waitForTimeout(250);
    return await collectVisibleTextAudit(page, contextOptions.label);
  } finally {
    await page.close();
  }
}

async function auditSeniorConfirm(browser, baseUrl) {
  const page = await openSeniorPage(browser, baseUrl, {
    label: "mobile-confirm",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  try {
    await waitForStableFrontPage(page);
    await page.evaluate(() => {
      if (typeof window.confirmSeniorDangerAction !== "function") {
        throw new Error("缺少 confirmSeniorDangerAction。");
      }
      void window.confirmSeniorDangerAction("确定清空回收站中的 8 条学习档案吗？清空后将不能恢复。", {
        shortMessage: "清空回收站？"
      });
    });
    await page.locator("#seniorConfirmDialog[open]").waitFor({ state: "visible", timeout: 5000 });
    return await collectVisibleTextAudit(page, "mobile-confirm");
  } finally {
    await page.close();
  }
}

async function auditSeededLearningData(browser, baseUrl) {
  const page = await openSeniorPage(browser, baseUrl, {
    label: "mobile-seeded-data",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const reports = [];

  try {
    await seedRealLearningData(page);
    await waitForStableFrontPage(page);
    reports.push(await collectVisibleTextAudit(page, "mobile-seeded-home"));

    await openResultAction(page, baseUrl, "看记录");
    reports.push(await collectVisibleTextAudit(page, "mobile-seeded-history"));

    await openResultAction(page, baseUrl, "看报告");
    reports.push(await collectVisibleTextAudit(page, "mobile-seeded-report"));

    await openResultAction(page, baseUrl, "练习计划");
    reports.push(await collectVisibleTextAudit(page, "mobile-seeded-plan"));
  } finally {
    await page.close();
  }

  return reports;
}

async function seedRealLearningData(page) {
  await page.evaluate(() => {
    if (!window.MRAppState?.saveArtwork || !window.MRAppState?.createReport || !window.MRAppState?.createPlan) {
      throw new Error("缺少真实学习数据 API。");
    }
    window.MRAppState.saveArtwork({
      character: "永",
      score: 88,
      strokes: [
        {
          points: [{ x: 10, y: 12 }, { x: 42, y: 48 }, { x: 84, y: 92 }],
          color: "#111111",
          size: 7
        },
        {
          points: [{ x: 80, y: 10 }, { x: 52, y: 60 }, { x: 30, y: 120 }],
          color: "#111111",
          size: 6
        }
      ],
      imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lZGj7wAAAABJRU5ErkJggg==",
      metrics: { structure: 88, stroke: 86, technique: 83, fluency: 90, force: 84 }
    });
    window.MRAppState.createReport();
    window.MRAppState.createPlan();
  });
}

async function openResultAction(page, baseUrl, actionText) {
  await reloadSeniorPage(page, baseUrl);
  await clickButtonText(page, "看结果");
  await clickButtonText(page, actionText);
}

async function openSeniorPage(browser, baseUrl, contextOptions) {
  const page = await browser.newPage({
    viewport: contextOptions.viewport,
    deviceScaleFactor: contextOptions.deviceScaleFactor
  });
  await page.route(/\.(?:avif|glb|hdr|jpe?g|obj|png|webp)(?:\?.*)?$/i, (route) => route.abort());
  await page.addInitScript(() => {
    window.__MR_FORCE_SENIOR_NOTICE = true;
  });
  await reloadSeniorPage(page, baseUrl);
  return page;
}

async function reloadSeniorPage(page, baseUrl) {
  await page.goto(frontUrl(baseUrl), { waitUntil: "domcontentloaded" });
  await waitForStableFrontPage(page);
}

async function waitForStableFrontPage(page) {
  await page.locator("#primaryMenuList").waitFor({ state: "attached", timeout: 5000 });
  await page.waitForTimeout(120);
}

async function clickButtonText(page, text) {
  const button = page.getByRole("button", { name: text }).first();
  await button.waitFor({ state: "visible", timeout: 5000 });
  await button.click();
  await page.waitForTimeout(120);
}

function frontUrl(baseUrl) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL("index.html", normalizedBase).toString();
}

async function collectVisibleTextAudit(page, label) {
  return page.evaluate(({ label, minFontSize, maxTextLength }) => {
    const hiddenByTree = (element) => {
      for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
          return true;
        }
        if (node.hasAttribute("hidden")) {
          return true;
        }
      }
      return false;
    };

    const selectorFor = (element) => {
      if (!element) return "";
      if (element.id) return `#${element.id}`;
      const classes = Array.from(element.classList || []).slice(0, 4).join(".");
      return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ""}`;
    };

    const nodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) continue;

      const element = node.parentElement;
      if (!element || hiddenByTree(element)) continue;

      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;

      const style = window.getComputedStyle(element);
      const fontSize = Number.parseFloat(style.fontSize);
      const finding = fontSize < minFontSize || text.length > maxTextLength;
      nodes.push({
        text,
        fontSize,
        length: text.length,
        selector: selectorFor(element),
        parent: selectorFor(element.parentElement),
        top: Math.round(rect.top + window.scrollY),
        left: Math.round(rect.left + window.scrollX),
        finding
      });
    }

    return {
      label,
      url: location.href,
      visibleTextCount: nodes.length,
      findings: nodes.filter((item) => item.finding)
    };
  }, { label, minFontSize: MIN_FONT_SIZE, maxTextLength: MAX_TEXT_LENGTH });
}

function formatFailures(reports) {
  const lines = ["老人前台可见文字审计失败："];
  reports.forEach((report) => {
    lines.push(`- ${report.label}：${report.findings.length} 个小字或长句`);
    report.findings.slice(0, 12).forEach((finding) => {
      lines.push(
        `  ${finding.selector} (${finding.fontSize}px, ${finding.length}字): ${JSON.stringify(finding.text)}`
      );
    });
  });
  return lines.join("\n");
}
