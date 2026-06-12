#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const TIMEOUT_MS = 5000;

const SCRIPT_CHECKS = [
  { file: "scripts/control-inventory.js", parser: "script" },
  { file: "scripts/archive-migration-check.js", parser: "script" },
  { file: "scripts/archive-asset-hash-check.js", parser: "script" },
  { file: "scripts/project-schema-check.js", parser: "script" },
  { file: "scripts/remote-publish-check.js", parser: "script" },
  { file: "scripts/remote-publish-mock-server.js", parser: "script" },
  { file: "scripts/plan-repository-mock-server.js", parser: "script" },
  { file: "scripts/history-repository-mock-server.js", parser: "script" },
  { file: "scripts/report-repository-mock-server.js", parser: "script" },
  { file: "scripts/share-repository-mock-server.js", parser: "script" },
  { file: "scripts/project-repository-mock-server.js", parser: "script" },
  { file: "scripts/learning-state-check.js", parser: "script" },
  { file: "scripts/smoke-test.js", parser: "script" },
  { file: "tests/e2e/real-flows.spec.js", parser: "script" },
  { file: "app-state.js", parser: "script" },
  { file: "practice-canvas.js", parser: "script" },
  { file: "project-schema-utils.js", parser: "script" },
  { file: "project-archive.js", parser: "script" },
  { file: "project-remote-publish.js", parser: "script" },
  { file: "room-config.js", parser: "script" },
  { file: "model-import-utils.js", parser: "module" },
  { file: "script.js", parser: "module" },
  { file: "main-admin-scene.js", parser: "module" },
  { file: "realistic-scene.js", parser: "module" }
];

const COMMAND_CHECKS = [
  {
    label: "控件状态清单",
    command: [process.execPath, "scripts/control-inventory.js", "--check"]
  },
  {
    label: "项目档案迁移检查",
    command: [process.execPath, "scripts/archive-migration-check.js"]
  },
  {
    label: "项目档案资产哈希检查",
    command: [process.execPath, "scripts/archive-asset-hash-check.js"]
  },
  {
    label: "项目 Schema 检查",
    command: [process.execPath, "scripts/project-schema-check.js"]
  },
  {
    label: "远端发布检查",
    command: [process.execPath, "scripts/remote-publish-check.js"]
  },
  {
    label: "学习状态检查",
    command: [process.execPath, "scripts/learning-state-check.js"]
  }
];

const PAGE_CHECKS = [
  {
    path: "/",
    label: "前台学习页",
    markers: ["MR 书法 360° 全景交互演示", "taskPanel", "learningPathServiceSummary", "learningStepRoute", "learningPointRoute", "modelViewRoute", "realistic-demo.html", "scoreServiceSummary", "lectureVoiceStatus", "lectureServiceSummary", "historyRenameDialog", "historyRenameTitleInput", "artworkTagsDialog", "artworkTagsInput", "historyRepositorySummary", "historyRepositoryExportButton", "historyRepositoryImportButton", "historyRepositoryEndpointInput", "historyRepositoryTokenInput", "historyRepositoryWorkspaceInput", "historyRepositorySaveRemoteButton", "historyRepositoryRemoteButton", "historyRepositoryPushButton", "historyRepositoryPullButton", "historyRepositoryConflictPanel", "historyRepositoryConflictStatus", "historyRepositoryConflictList", "planReminderSummary", "planReminderServiceSummary", "planRepositorySummary", "planRepositoryExportButton", "planRepositoryImportButton", "planRepositoryEndpointInput", "planRepositoryTokenInput", "planRepositoryWorkspaceInput", "planRepositorySaveRemoteButton", "planRepositoryRemoteButton", "planRepositoryPushButton", "planRepositoryPullButton", "planRepositoryReceiptAudit", "planRepositoryReceiptStatus", "planRepositoryReceiptList", "planRepositoryReceiptExportButton", "planRepositoryConflictPanel", "planRepositoryKeepLocalButton", "planRepositoryUseRemoteButton", "planRepositoryCopyRemoteButton", "planRepositoryMergeFieldsButton", "planReminderPermissionButton", "planCycleSummary", "planDependencyGraph", "planItemDialog", "planItemTitleInput", "planExportButton", "planCalendarExportButton", "planNextCycleButton", "historyArtworkCompare", "historyArtworkGallery", "reviewDownloadShare", "shareServiceSummary", "reviewCreateShareLink", "reviewCopyShareLink", "reviewRevokeShareLink", "shareRemoteEndpointInput", "shareRemoteTokenInput", "shareRemoteSaveButton", "shareRemoteCheckButton", "shareRemotePushButton", "shareRemoteRevokeButton", "shareRemoteCopyButton", "shareRepositoryReceiptAudit", "shareRepositoryReceiptStatus", "shareRepositoryReceiptList", "shareRepositoryReceiptExportButton", "shareServiceRecords", "reportVerification", "reportRepositorySummary", "reportRepositoryExportButton", "reportRepositoryImportButton", "reportRepositoryImportInput", "reportRepositoryEndpointInput", "reportRepositoryTokenInput", "reportRepositoryWorkspaceInput", "reportRepositorySaveRemoteButton", "reportRepositoryRemoteButton", "reportRepositoryPushButton", "reportRepositoryPullButton", "reportRepositoryReceiptAudit", "reportRepositoryReceiptStatus", "reportRepositoryReceiptList", "reportRepositoryReceiptExportButton", "reportRepositoryConflictPanel", "reportRepositoryConflictStatus", "reportRepositoryConflictList", "reportDetailDownloadPdf", "reportTeacherReviewStatus", "reportTeacherReviewInput", "reportTeacherReviewSave", "reportTeacherReviewClear", "reportTeacherReviewAuditStatus", "reportTeacherReviewAuditList", "reportTeacherReviewAuditExport", "reportComparison", "reportComparisonExport", "reportSeries", "reportSeriesMetricControls", "reportSeriesTemplates", "reportSeriesTooltip", "reportSeriesTooltipPin", "reportSeriesTooltipCopy", "reportSeriesZoomIn", "reportSeriesZoomOut", "reportSeriesZoomReset", "reportSeriesPointDetail", "script.js", "app-state.js"]
  },
  {
    path: "/main-admin.html",
    label: "主场景后台",
    markers: ["MR 书法主场景管理页", "mainAdminCanvas", "mainAdminRiskBanner", "mainObjectSelect", "mainNewObjectName", "mainNewObjectType", "mainNewObjectAdd", "mainNewObjectUpdate", "mainCustomStatus", "mainImportModelColor", "mainImportModelOpacity", "mainImportModelOpacityValue", "mainImportModelRoughness", "mainImportModelRoughnessValue", "mainImportModelMetalness", "mainImportModelMetalnessValue", "mainImportModelReplace", "mainImportModelMaterialUpdate", "mainImportMaterialStatus", "mainImportAuditStatus", "mainImportAuditList", "mainImportAuditExport", "projectRepositoryStatus", "projectRepositoryList", "projectRepositoryRefresh", "projectRepositoryRemoteStatus", "projectRepositoryEndpoint", "projectRepositoryToken", "projectRepositoryWorkspace", "projectRepositorySaveRemote", "projectRepositoryCheckRemote", "projectRepositoryPushRemote", "projectRepositoryPullRemote", "projectRepositoryVersionSelect", "projectRepositoryReceiptAudit", "projectRepositoryReceiptStatus", "projectRepositoryReceiptList", "projectRepositoryReceiptExport", "projectImportExportImpact", "projectAuditExport", "projectAuditList", "mainPublishNote", "mainPublishDiffSummary", "mainPublishHistoryList", "mainRemotePublishStatus", "mainRemotePublishEndpoint", "mainRemotePublishToken", "mainRemotePublishWorkspace", "mainRemotePublishSave", "mainRemotePublishCheck", "mainRemotePublishPush", "mainRemotePublishRevoke", "mainRemotePublishReviewStatus", "mainRemotePublishRequestReview", "mainRemotePublishApproveReview", "mainRemotePublishRejectReview", "mainRemotePublishUnlock", "mainRemotePublishReceiptStatus", "mainRemotePublishReceiptList", "mainRemotePublishReceiptExport", "project-schema-utils.js", "project-remote-publish.js", "main-admin-scene.js"]
  },
  {
    path: "/realistic-demo.html",
    label: "写实样张页",
    markers: ["MR 书法写实 3D 样张", "realisticCanvas", "resetCamera", "toggleMotion", "realistic-scene.js"]
  },
  {
    path: "/realistic-admin.html",
    label: "写实后台",
    markers: ["MR 书法场景管理页", "designObjectSelect", "designX", "designY", "designZ", "undoAction", "deleteObject", "restoreObject", "realisticImportModelColor", "realisticImportModelOpacity", "realisticImportModelOpacityValue", "realisticImportModelRoughness", "realisticImportModelRoughnessValue", "realisticImportModelMetalness", "realisticImportModelMetalnessValue", "realisticImportModelReplace", "realisticImportModelMaterialUpdate", "realisticImportMaterialStatus", "realisticImportAuditStatus", "realisticImportAuditList", "realisticImportAuditCleanup", "realisticImportAuditExport", "realisticAdminRiskBanner", "realisticPublishNote", "realisticPublishDiffSummary", "realisticPublishHistoryList", "realisticRemotePublishStatus", "realisticRemotePublishEndpoint", "realisticRemotePublishToken", "realisticRemotePublishWorkspace", "realisticRemotePublishSave", "realisticRemotePublishCheck", "realisticRemotePublishPush", "realisticRemotePublishRevoke", "realisticRemotePublishReviewStatus", "realisticRemotePublishRequestReview", "realisticRemotePublishApproveReview", "realisticRemotePublishRejectReview", "realisticRemotePublishUnlock", "realisticRemotePublishReceiptStatus", "realisticRemotePublishReceiptList", "realisticRemotePublishReceiptExport", "project-remote-publish.js", "realistic-scene.js"]
  }
];

const MIME_TYPES = {
  ".css": "text/css;charset=utf-8",
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml;charset=utf-8",
  ".glb": "model/gltf-binary",
  ".obj": "text/plain;charset=utf-8"
};

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let staticServer = null;
  let baseUrl = options.baseUrl;

  if (options.help) {
    printHelp();
    return;
  }

  if (!baseUrl || options.serve) {
    staticServer = await startStaticServer();
    baseUrl = staticServer.baseUrl;
    console.log(`临时静态服务器：${baseUrl}`);
  }

  const failures = [];
  runScriptChecks(failures);
  runCommandChecks(failures);
  await runPageChecks(baseUrl, failures);

  if (staticServer) {
    await closeServer(staticServer.server);
  }

  if (failures.length) {
    console.error("\nSmoke test 失败：");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log(`\nSmoke test 通过：${SCRIPT_CHECKS.length} 个脚本，${PAGE_CHECKS.length} 个页面。`);
}

function parseArgs(args) {
  const options = {
    baseUrl: process.env.SMOKE_BASE_URL || "",
    help: false,
    serve: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--serve") {
      options.serve = true;
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

  return options;
}

function printHelp() {
  console.log(`用法：
  node scripts/smoke-test.js
  node scripts/smoke-test.js --base-url=http://localhost:41496/

默认会启动临时静态服务器并检查本项目；传入 --base-url 后会检查指定服务器。`);
}

function runScriptChecks(failures) {
  SCRIPT_CHECKS.forEach((check) => {
    const filePath = path.join(ROOT, check.file);
    if (!fs.existsSync(filePath)) {
      failures.push(`缺少脚本文件：${check.file}`);
      return;
    }

    const result = check.parser === "module"
      ? spawnSync(process.execPath, ["--input-type=module", "--check"], {
        cwd: ROOT,
        input: fs.readFileSync(filePath, "utf8"),
        encoding: "utf8"
      })
      : spawnSync(process.execPath, ["--check", check.file], {
        cwd: ROOT,
        encoding: "utf8"
      });

    if (result.status !== 0) {
      failures.push(`${check.file} 语法检查失败：${(result.stderr || result.stdout || "").trim()}`);
      return;
    }

    console.log(`✓ 语法检查：${check.file}`);
  });
}

function runCommandChecks(failures) {
  COMMAND_CHECKS.forEach((check) => {
    const result = spawnSync(check.command[0], check.command.slice(1), {
      cwd: ROOT,
      encoding: "utf8"
    });

    if (result.status !== 0) {
      failures.push(`${check.label}失败：${(result.stderr || result.stdout || "").trim()}`);
      return;
    }

    console.log(`✓ ${check.label}`);
  });
}

async function runPageChecks(baseUrl, failures) {
  for (const page of PAGE_CHECKS) {
    try {
      const response = await requestPage(baseUrl, page.path);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        failures.push(`${page.label} ${page.path} 返回 ${response.statusCode}`);
        continue;
      }

      const missingMarkers = page.markers.filter((marker) => !response.body.includes(marker));
      if (missingMarkers.length) {
        failures.push(`${page.label} ${page.path} 缺少页面标记：${missingMarkers.join("、")}`);
        continue;
      }

      console.log(`✓ 页面可访问：${page.path} ${page.label}`);
    } catch (error) {
      failures.push(`${page.label} ${page.path} 请求失败：${error.message}`);
    }
  }
}

function requestPage(baseUrl, route) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const url = new URL(route.replace(/^\//, ""), normalizedBase);
  const client = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = client.get(url, (response) => {
      const chunks = [];
      response.setEncoding("utf8");
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode || 0,
          body: chunks.join("")
        });
      });
    });

    request.setTimeout(TIMEOUT_MS, () => {
      request.destroy(new Error(`超过 ${TIMEOUT_MS}ms 未响应`));
    });
    request.on("error", reject);
  });
}

function startStaticServer() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url || "/", "http://localhost");
    const route = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const filePath = path.resolve(ROOT, `.${route}`);

    if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
      response.writeHead(403, { "Content-Type": "text/plain;charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain;charset=utf-8" });
        response.end(error.code === "ENOENT" ? "Not found" : "Server error");
        return;
      }

      response.writeHead(200, {
        "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
      });
      response.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}/`
      });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
