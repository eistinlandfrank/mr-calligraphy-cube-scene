const { expect, test } = require("@playwright/test");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { validateProjectRepositoryPackage } = require("../../scripts/project-repository-mock-server.js");

const LEARNING_KEY = "mr-calligraphy-learning-state-v1";
const MAIN_LAYOUT_KEY = "mr-calligraphy-main-scene-layout-v1";
const MAIN_HISTORY_KEY = "mr-calligraphy-main-scene-history-v1";
const MAIN_IMPORT_AUDIT_KEY = "mr-calligraphy-main-import-audit-v1";
const MAIN_PUBLISHED_KEY = "mr-calligraphy-main-scene-published-v1";
const ADMIN_AUDIT_KEY = "mr-calligraphy-admin-operator-audit-v1";
const ADMIN_ACCESS_SESSION_KEY = "mr-calligraphy-admin-access-session-v1";
const REMOTE_PUBLISH_KEY = "mr-calligraphy-remote-publish-v1";
const PROJECT_REPOSITORY_REMOTE_KEY = "mr-calligraphy-project-repository-remote-v1";
const REALISTIC_LAYOUT_KEY = "mr-calligraphy-realistic-layout-v1";
const REALISTIC_HISTORY_KEY = "mr-calligraphy-realistic-history-v1";
const REALISTIC_IMPORT_AUDIT_KEY = "mr-calligraphy-realistic-import-audit-v1";
const REALISTIC_PUBLISHED_KEY = "mr-calligraphy-realistic-published-v1";

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256StableJson(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function withPackageDigest(packageRecord) {
  const next = JSON.parse(JSON.stringify(packageRecord));
  delete next.packageDigest;
  next.packageDigest = sha256StableJson(next);
  return next;
}

function withArtworkRepositoryPackageDigest(packageRecord) {
  return withPackageDigest(packageRecord);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ keys, accessSessionKey }) => {
    const markerKey = "__mr_calligraphy_e2e_storage_cleared__";
    if (window.sessionStorage.getItem(markerKey) === "1") {
      return;
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    window.sessionStorage.removeItem(accessSessionKey);
    window.sessionStorage.setItem(markerKey, "1");
  }, {
    accessSessionKey: ADMIN_ACCESS_SESSION_KEY,
    keys: [
      LEARNING_KEY,
      MAIN_LAYOUT_KEY,
      MAIN_HISTORY_KEY,
      MAIN_IMPORT_AUDIT_KEY,
      MAIN_PUBLISHED_KEY,
      ADMIN_AUDIT_KEY,
      REMOTE_PUBLISH_KEY,
      PROJECT_REPOSITORY_REMOTE_KEY,
      REALISTIC_LAYOUT_KEY,
      REALISTIC_HISTORY_KEY,
      REALISTIC_IMPORT_AUDIT_KEY,
      REALISTIC_PUBLISHED_KEY
    ]
  });
});

async function unlockMainAdmin(page) {
  const accessStatus = page.locator("#mainAdminAccessStatus");
  await expect(accessStatus).toBeVisible();
  if ((await accessStatus.textContent())?.includes("已解锁")) {
    return;
  }
  await expect(accessStatus).toContainText("已锁定");
  await page.locator("#mainAdminAccessCode").fill("local-admin");
  await page.locator("#mainAdminAccessUnlock").click();
  await expect(accessStatus).toContainText("已解锁");
}

async function unlockRealisticAdmin(page) {
  const accessStatus = page.locator("#realisticAdminAccessStatus");
  await expect(accessStatus).toBeVisible();
  if ((await accessStatus.textContent())?.includes("已解锁")) {
    return;
  }
  await expect(accessStatus).toContainText("已锁定");
  await page.locator("#realisticAdminAccessCode").fill("local-admin");
  await page.locator("#realisticAdminAccessUnlock").click();
  await expect(accessStatus).toContainText("已解锁");
}

test("mobile viewports keep core panels usable without overlap", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expectCanvasHasVisiblePixels(page, "#roomCanvas");
  await expect(page.locator("#taskPanel")).toBeVisible();
  await expect(page.locator("#serviceBoundaryPanel")).toBeVisible();
  await expect(page.locator("#serviceBoundaryStatus")).toContainText("生产云端");
  await expect(page.locator("#serviceBoundaryList")).toContainText("本机真实");
  await expect(page.locator("#serviceBoundaryList")).toContainText("远端 Adapter");
  await expect(page.locator("#serviceBoundaryList")).toContainText("生产云端");
  await expect(page.locator("#actionFeedback")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectBoxInsideViewport(page, ".scene-heading");
  await expectBoxInsideViewport(page, ".mr-main-panel");
  await expectBoxesDoNotOverlap(page, ".scene-heading", ".mr-main-panel", 8);

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expectCanvasHasVisiblePixels(page, "#mainAdminCanvas");
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectBoxInsideViewport(page, ".main-admin-header");
  await expectBoxInsideViewport(page, "#mainAdminRiskBanner");
  await expect(page.locator("#mainAdminBoundaryStatus")).toContainText("生产后台");
  await expect(page.locator("#mainAdminBoundaryList")).toContainText("本机编辑");
  await expect(page.locator("#mainAdminBoundaryList")).toContainText("前台发布");
  await expect(page.locator("#mainAdminBoundaryList")).toContainText("远端 Adapter");
  await expect(page.locator("#mainAdminBoundaryList")).toContainText("本机审计");
  await expect(page.locator("#mainAdminOperatorPanel")).toBeVisible();
  await expect(page.locator("#mainAdminOperatorStatus")).toContainText("本机操作者");
  await expectBoxInsideViewport(page, ".main-object-panel");
  await expectBoxesDoNotOverlap(page, ".main-admin-header", "#mainAdminRiskBanner", 4);
  await expectBoxesDoNotOverlap(page, "#mainAdminRiskBanner", ".main-object-panel", 12);

  await page.goto("/realistic-admin.html", { waitUntil: "domcontentloaded" });
  await expectCanvasHasVisiblePixels(page, "#realisticCanvas");
  await expect(page.locator("#designObjectSelect")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectBoxInsideViewport(page, ".demo-header");
  await expectBoxInsideViewport(page, "#realisticAdminRiskBanner");
  await expect(page.locator("#realisticAdminBoundaryStatus")).toContainText("生产后台");
  await expect(page.locator("#realisticAdminBoundaryList")).toContainText("本机编辑");
  await expect(page.locator("#realisticAdminBoundaryList")).toContainText("演示发布");
  await expect(page.locator("#realisticAdminBoundaryList")).toContainText("远端 Adapter");
  await expect(page.locator("#realisticAdminBoundaryList")).toContainText("本机审计");
  await expect(page.locator("#realisticAdminOperatorPanel")).toBeVisible();
  await expect(page.locator("#realisticAdminOperatorStatus")).toContainText("本机操作者");
  await expectBoxInsideViewport(page, ".design-panel");
  await expectBoxesDoNotOverlap(page, ".demo-header", "#realisticAdminRiskBanner", 4);
  await expectBoxesDoNotOverlap(page, "#realisticAdminRiskBanner", ".design-panel", 12);

  await page.goto("/realistic-demo.html", { waitUntil: "domcontentloaded" });
  await expectCanvasHasVisiblePixels(page, "#realisticCanvas");
  await expectNoHorizontalOverflow(page);
  await expectBoxInsideViewport(page, ".demo-header");
  await expectBoxInsideViewport(page, ".demo-panel");
  await expectBoxesDoNotOverlap(page, ".demo-header", ".demo-panel", 12);
});

test("admin reviewer role blocks local write controls", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await expectCanvasHasVisiblePixels(page, "#mainAdminCanvas");
  await expect(page.locator("#mainAdminAccessStatus")).toContainText("已锁定");
  await expect(page.locator("#mainObjectX")).toBeDisabled();
  await unlockMainAdmin(page);
  await expect(page.locator("#mainObjectX")).toBeEnabled();

  await page.locator("#mainAdminOperatorName").fill("E2E 主后台复核");
  await page.locator("#mainAdminOperatorRole").selectOption("reviewer");
  await page.locator("#mainAdminOperatorSave").click();
  await expect(page.locator("#mainAdminPermissionStatus")).toContainText("复核角色为只读");
  await expect(page.locator("#mainObjectX")).toBeDisabled();
  await expect(page.locator("#mainNewObjectAdd")).toBeDisabled();
  await expect(page.locator("#mainImportModel")).toBeDisabled();
  await expect(page.locator("#mainSnapshotCreate")).toBeDisabled();
  await expect(page.locator("#mainPublishLayout")).toBeDisabled();
  await expect(page.locator("#mainObjectDelete")).toBeDisabled();
  await expect(page.locator("#mainRemotePublishSave")).toBeDisabled();

  await page.locator("#mainAdminOperatorRole").selectOption("editor");
  await page.locator("#mainAdminOperatorSave").click();
  await expect(page.locator("#mainAdminPermissionStatus")).toContainText("提交远端审核");
  await expect(page.locator("#mainObjectX")).toBeEnabled();
  await expect(page.locator("#mainNewObjectAdd")).toBeEnabled();
  await expect(page.locator("#mainSnapshotCreate")).toBeEnabled();
  await expect(page.locator("#mainPublishLayout")).toBeEnabled();
  await expect(page.locator("#mainRemotePublishRequestReview")).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(page.locator("#mainRemotePublishApproveReview")).toHaveAttribute("data-admin-permission", "approve");
  await expect(page.locator("#mainRemotePublishApproveReview")).toHaveAttribute("data-admin-permission-state", "blocked");
  await expect(page.locator("#mainRemotePublishRejectReview")).toHaveAttribute("data-admin-permission-state", "blocked");
  await expect(page.locator("#mainRemotePublishUnlock")).toHaveAttribute("data-admin-permission-state", "blocked");
  await page.locator("#mainSnapshotCreate").click();
  await expect(page.locator("#mainHistoryStatus")).toContainText("已保存快照");
  const mainSnapshotRestore = page.locator("#mainSnapshotList [data-snapshot-action='restore']").first();
  const mainSnapshotDelete = page.locator("#mainSnapshotList [data-snapshot-action='delete']").first();
  await expect(mainSnapshotRestore).toHaveAttribute("data-admin-permission", "edit");
  await expect(mainSnapshotRestore).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(mainSnapshotRestore).toBeEnabled();
  await expect(mainSnapshotDelete).toHaveAttribute("data-admin-permission", "delete");
  await expect(mainSnapshotDelete).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(mainSnapshotDelete).toBeEnabled();

  await page.locator("#mainAdminOperatorRole").selectOption("reviewer");
  await page.locator("#mainAdminOperatorSave").click();
  await expect(page.locator("#mainAdminPermissionStatus")).toContainText("复核角色为只读");
  await expect(mainSnapshotRestore).toHaveAttribute("data-admin-permission-state", "blocked");
  await expect(mainSnapshotRestore).toBeDisabled();
  await expect(mainSnapshotDelete).toHaveAttribute("data-admin-permission-state", "blocked");
  await expect(mainSnapshotDelete).toBeDisabled();
  await page.evaluate(() => {
    const restore = document.querySelector("#mainSnapshotList [data-snapshot-action='restore']");
    if (restore) {
      restore.disabled = false;
      restore.click();
    }
  });
  await expect(page.locator("#noticeState")).toContainText("复核无权执行恢复快照");
  const blockedAudit = await readJsonLocalStorage(page, ADMIN_AUDIT_KEY);
  expect(blockedAudit.scopes.mainScene.records.some((record) => record.action === "permission-blocked" && record.target === "恢复快照")).toBe(true);

  await page.locator("#mainAdminOperatorRole").selectOption("owner");
  await page.locator("#mainAdminOperatorSave").click();
  await expect(page.locator("#mainAdminPermissionStatus")).toContainText("远端审核审批");
  await expect(mainSnapshotRestore).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(mainSnapshotDelete).toHaveAttribute("data-admin-permission-state", "allowed");
  await mainSnapshotDelete.click();
  await expect(page.locator("#mainHistoryStatus")).toContainText("已删除快照");
  await expect(page.locator("#mainRemotePublishApproveReview")).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(page.locator("#mainRemotePublishRejectReview")).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(page.locator("#mainRemotePublishUnlock")).toHaveAttribute("data-admin-permission-state", "allowed");

  await page.goto("/realistic-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#designObjectSelect")).toBeVisible();
  await expectCanvasHasVisiblePixels(page, "#realisticCanvas");
  await expect(page.locator("#realisticAdminAccessStatus")).toContainText("已锁定");
  await expect(page.locator("#designX")).toBeDisabled();
  await unlockRealisticAdmin(page);
  await expect(page.locator("#designX")).toBeEnabled();

  await page.locator("#realisticAdminOperatorName").fill("E2E 写实复核");
  await page.locator("#realisticAdminOperatorRole").selectOption("reviewer");
  await page.locator("#realisticAdminOperatorSave").click();
  await expect(page.locator("#realisticAdminPermissionStatus")).toContainText("复核角色为只读");
  await expect(page.locator("#designX")).toBeDisabled();
  await expect(page.locator("#importModelInput")).toBeDisabled();
  await expect(page.locator("#realisticSnapshotCreate")).toBeDisabled();
  await expect(page.locator("#realisticPublishLayout")).toBeDisabled();
  await expect(page.locator("#deleteObject")).toBeDisabled();
  await expect(page.locator("#realisticRemotePublishSave")).toBeDisabled();

  await page.locator("#realisticAdminOperatorRole").selectOption("editor");
  await page.locator("#realisticAdminOperatorSave").click();
  await expect(page.locator("#realisticAdminPermissionStatus")).toContainText("提交远端审核");
  await expect(page.locator("#designX")).toBeEnabled();
  await expect(page.locator("#realisticSnapshotCreate")).toBeEnabled();
  await expect(page.locator("#realisticPublishLayout")).toBeEnabled();
  await expect(page.locator("#realisticRemotePublishRequestReview")).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(page.locator("#realisticRemotePublishApproveReview")).toHaveAttribute("data-admin-permission", "approve");
  await expect(page.locator("#realisticRemotePublishApproveReview")).toHaveAttribute("data-admin-permission-state", "blocked");
  await page.locator("#realisticSnapshotCreate").click();
  await expect(page.locator("#realisticHistoryStatus")).toContainText("已保存快照");
  const realisticSnapshotRestore = page.locator("#realisticSnapshotList [data-snapshot-action='restore']").first();
  const realisticSnapshotDelete = page.locator("#realisticSnapshotList [data-snapshot-action='delete']").first();
  await expect(realisticSnapshotRestore).toHaveAttribute("data-admin-permission", "edit");
  await expect(realisticSnapshotRestore).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(realisticSnapshotRestore).toBeEnabled();
  await expect(realisticSnapshotDelete).toHaveAttribute("data-admin-permission", "delete");
  await expect(realisticSnapshotDelete).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(realisticSnapshotDelete).toBeEnabled();

  await page.locator("#realisticAdminOperatorRole").selectOption("reviewer");
  await page.locator("#realisticAdminOperatorSave").click();
  await expect(page.locator("#realisticAdminPermissionStatus")).toContainText("复核角色为只读");
  await expect(realisticSnapshotRestore).toHaveAttribute("data-admin-permission-state", "blocked");
  await expect(realisticSnapshotRestore).toBeDisabled();
  await expect(realisticSnapshotDelete).toHaveAttribute("data-admin-permission-state", "blocked");
  await expect(realisticSnapshotDelete).toBeDisabled();
  await page.evaluate(() => {
    const restore = document.querySelector("#realisticSnapshotList [data-snapshot-action='restore']");
    if (restore) {
      restore.disabled = false;
      restore.click();
    }
  });
  await expect(page.locator("#importStatus")).toContainText("复核无权执行恢复快照");
  const realisticBlockedAudit = await readJsonLocalStorage(page, ADMIN_AUDIT_KEY);
  expect(realisticBlockedAudit.scopes.realisticScene.records.some((record) => record.action === "permission-blocked" && record.target === "恢复快照")).toBe(true);

  await page.locator("#realisticAdminOperatorRole").selectOption("owner");
  await page.locator("#realisticAdminOperatorSave").click();
  await expect(page.locator("#realisticAdminPermissionStatus")).toContainText("远端审核审批");
  await expect(realisticSnapshotRestore).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(realisticSnapshotDelete).toHaveAttribute("data-admin-permission-state", "allowed");
  await realisticSnapshotDelete.click();
  await expect(page.locator("#realisticHistoryStatus")).toContainText("已删除快照");
  await expect(page.locator("#realisticRemotePublishApproveReview")).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(page.locator("#realisticRemotePublishRejectReview")).toHaveAttribute("data-admin-permission-state", "allowed");
  await expect(page.locator("#realisticRemotePublishUnlock")).toHaveAttribute("data-admin-permission-state", "allowed");

  const audit = await readJsonLocalStorage(page, ADMIN_AUDIT_KEY);
  expect(audit.scopes.mainScene.operator.role).toBe("owner");
  expect(audit.scopes.realisticScene.operator.role).toBe("owner");
  expect(audit.scopes.mainScene.records.some((record) => record.action === "operator-save")).toBe(true);
  expect(audit.scopes.mainScene.records.some((record) => record.action === "snapshot-delete")).toBe(true);
  expect(audit.scopes.realisticScene.records.some((record) => record.action === "operator-save")).toBe(true);
  expect(audit.scopes.realisticScene.records.some((record) => record.action === "snapshot-delete")).toBe(true);
});

test("front practice saves real strokes and exports a report", async ({ page }) => {
  const historyEndpointPath = "/e2e-history-repository";
  const reportEndpointPath = "/e2e-report-repository";
  const shareEndpointPath = "/e2e-share-repository";
  const historyRequests = [];
  const reportRequests = [];
  const shareRequests = [];
  let remoteHistoryPackage = null;
  let remoteReportPackage = null;
  let remoteSharePackage = null;
  let latestHistoryReceipt = null;
  let latestReportReceipt = null;
  let latestShareReceipt = null;

  await page.route(`**${historyEndpointPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    historyRequests.push({
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });
    if (method === "PUT") {
      const acceptedAt = new Date().toISOString();
      const repositoryDigest = "9".repeat(64);
      remoteHistoryPackage = withPackageDigest({
        ...body,
        workspaceId: body.workspaceId,
        packageId: "e2e-history-package",
        acceptedAt,
        repositoryDigest
      });
      latestHistoryReceipt = {
        receiptKind: "mr-calligraphy-history-repository-receipt-v1",
        remoteVersion: "e2e-history-v1",
        packageId: remoteHistoryPackage.packageId,
        sourcePackageId: body.packageId,
        workspaceId: body.workspaceId,
        repositoryDigest,
        acceptedAt,
        recordCount: body.summary.total,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          workspaceId: body.workspaceId,
          sourcePackageId: body.packageId,
          repositoryDigest,
          acceptedAt
        })
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `远端学习档案 E2E 已接收 ${body.summary.total} 条记录。`,
          remoteVersion: "e2e-history-v1",
          packageId: remoteHistoryPackage.packageId,
          package: remoteHistoryPackage,
          receipt: latestHistoryReceipt
        })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: remoteHistoryPackage
          ? `远端学习档案 E2E 可读，当前包含 ${remoteHistoryPackage.summary.total} 条记录。`
          : "远端学习档案 E2E 可访问，当前尚未接收档案包。",
        remoteVersion: "e2e-history-v1",
        package: remoteHistoryPackage,
        latestReceipt: latestHistoryReceipt
      })
    });
  });

  await page.route(`**${reportEndpointPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    reportRequests.push({
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });
    if (method === "PUT") {
      remoteReportPackage = withPackageDigest({
        ...body,
        workspaceId: body.workspaceId,
        packageId: "e2e-report-package",
        acceptedAt: new Date().toISOString()
      });
      latestReportReceipt = {
        receiptKind: "mr-calligraphy-report-repository-receipt-v1",
        remoteVersion: "e2e-report-v1",
        packageId: remoteReportPackage.packageId,
        sourcePackageId: body.packageId,
        workspaceId: body.workspaceId,
        repositoryDigest: "a".repeat(64),
        acceptedAt: remoteReportPackage.acceptedAt,
        reportCount: body.summary.total,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          sourcePackageId: body.packageId,
          workspaceId: body.workspaceId,
          repositoryDigest: "a".repeat(64),
          acceptedAt: remoteReportPackage.acceptedAt
        }),
        signatureAlgorithm: "HMAC-SHA256",
        signingKeyId: "e2e-report-signing-key-v1",
        signedFields: ["receiptKind", "packageId", "sourcePackageId", "workspaceId", "repositoryDigest", "acceptedAt", "reportCount", "receiptDigest"],
        signature: "c".repeat(64)
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `远端报告 E2E 已接收 ${body.summary.total} 份报告。`,
          remoteVersion: "e2e-report-v1",
          packageId: remoteReportPackage.packageId,
          package: remoteReportPackage,
          receipt: latestReportReceipt
        })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: remoteReportPackage
          ? `远端报告 E2E 可读，当前包含 ${remoteReportPackage.summary.total} 份报告。`
          : "远端报告 E2E 可访问，当前尚未接收报告包。",
        remoteVersion: "e2e-report-v1",
        package: remoteReportPackage,
        latestReceipt: latestReportReceipt
      })
    });
  });

  await page.route(`**${shareEndpointPath}**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const rawBody = method === "PUT" || method === "DELETE" ? request.postData() : "";
    const body = rawBody ? JSON.parse(rawBody) : createShareRevokeBodyFromUrl(request.url());
    shareRequests.push({
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });
    if (method === "PUT") {
      const shareId = body.records[0].id;
      const publicUrl = `https://share.example.test/${shareId}.html`;
      const acceptedAt = new Date().toISOString();
      const repositoryDigest = "d".repeat(64);
      remoteSharePackage = withPackageDigest({
        ...body,
        workspaceId: body.workspaceId,
        packageId: "e2e-share-package",
        acceptedAt,
        publicUrl
      });
      latestShareReceipt = {
        receiptKind: "mr-calligraphy-share-repository-receipt-v1",
        remoteVersion: "e2e-share-v1",
        packageId: remoteSharePackage.packageId,
        sourcePackageId: body.packageId,
        workspaceId: body.workspaceId,
        shareId,
        artworkId: body.records[0].artworkId,
        repositoryDigest,
        acceptedAt,
        publicUrl,
        shareCount: body.records.length,
        htmlBytes: body.shares[0].html.length,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          sourcePackageId: body.packageId,
          workspaceId: body.workspaceId,
          repositoryDigest,
          publicUrl,
          acceptedAt
        })
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `远端分享 E2E 已接收 ${body.records.length} 条分享记录。`,
          workspaceId: body.workspaceId,
          remoteVersion: "e2e-share-v1",
          packageId: remoteSharePackage.packageId,
          publicUrl,
          package: remoteSharePackage,
          receipt: latestShareReceipt
        })
      });
      return;
    }
    if (method === "DELETE") {
      const revokedAt = new Date().toISOString();
      const repositoryDigest = "f".repeat(64);
      remoteSharePackage = remoteSharePackage
        ? withPackageDigest({
          ...remoteSharePackage,
          workspaceId: body.workspaceId,
          records: remoteSharePackage.records.map((record) => (
            record.id === body.shareId
              ? { ...record, remoteRevokedAt: revokedAt, revokedAt }
              : record
          )),
          summary: {
            ...(remoteSharePackage.summary || {}),
            workspaceId: body.workspaceId,
            revokedShareCount: 1,
            lastRevokedShareId: body.shareId,
            lastRevokedAt: revokedAt
          }
        })
        : null;
      latestShareReceipt = {
        receiptKind: "mr-calligraphy-share-repository-receipt-v1",
        remoteVersion: "e2e-share-v1",
        packageId: "e2e-share-revoke-package",
        sourcePackageId: body.packageId,
        workspaceId: body.workspaceId,
        shareId: body.shareId,
        artworkId: body.artworkId,
        repositoryDigest,
        acceptedAt: revokedAt,
        publicUrl: body.publicUrl,
        shareCount: remoteSharePackage?.records?.length || 0,
        htmlBytes: 0,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          action: "revoke",
          sourcePackageId: body.packageId,
          workspaceId: body.workspaceId,
          shareId: body.shareId,
          repositoryDigest,
          publicUrl: body.publicUrl,
          acceptedAt: revokedAt
        })
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `远端分享 E2E 已撤销 ${body.shareId}。`,
          workspaceId: body.workspaceId,
          remoteVersion: "e2e-share-v1",
          packageId: latestShareReceipt.packageId,
          publicUrl: body.publicUrl,
          receipt: latestShareReceipt
        })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: remoteSharePackage
          ? `远端分享 E2E 可读，空间 ${request.headers()["x-mr-workspace-id"] || "local-browser"} 当前包含 ${remoteSharePackage.records.length} 条记录。`
          : `远端分享 E2E 可访问，空间 ${request.headers()["x-mr-workspace-id"] || "local-browser"} 当前尚未接收分享包。`,
        workspaceId: request.headers()["x-mr-workspace-id"] || "local-browser",
        remoteVersion: "e2e-share-v1",
        package: remoteSharePackage,
        latestReceipt: latestShareReceipt,
        publicUrl: latestShareReceipt?.publicUrl || ""
      })
    });
  });

  await page.addInitScript(() => {
    class FakeSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
        this.lang = "";
        this.rate = 1;
        this.pitch = 1;
        this.voice = null;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
      }
    }

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: FakeSpeechSynthesisUtterance
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel() {},
        getVoices() {
          return [{ lang: "zh-CN", name: "E2E 中文语音" }];
        },
        speak(utterance) {
          window.setTimeout(() => utterance.onstart?.(), 0);
          window.setTimeout(() => utterance.onend?.(), 8);
        }
      }
    });

    Object.defineProperty(window.HTMLCanvasElement.prototype, "captureStream", {
      configurable: true,
      value() {
        return {
          getTracks() {
            return [{ stop() {} }];
          }
        };
      }
    });

    class FakeMediaRecorder {
      constructor(stream, options = {}) {
        this.stream = stream;
        this.mimeType = options.mimeType || "video/webm";
        this.state = "inactive";
        this.ondataavailable = null;
        this.onerror = null;
        this.onstop = null;
      }

      start() {
        this.state = "recording";
      }

      stop() {
        if (this.state !== "recording") return;
        this.state = "inactive";
        const blob = new Blob([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])], { type: this.mimeType || "video/webm" });
        this.ondataavailable?.({ data: blob });
        this.onstop?.();
      }

      static isTypeSupported() {
        return true;
      }
    }

    Object.defineProperty(window, "__MR_E2E_MediaRecorder", {
      configurable: true,
      value: FakeMediaRecorder
    });
    Object.defineProperty(window, "MediaRecorder", {
      configurable: true,
      value: FakeMediaRecorder
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  await expect(page.locator("#learningPathServiceSummary")).toContainText("2/10 步完成");
  await expect(page.locator("#learningPathServiceSummary")).toContainText("数据来自本机任务");
  await expect(page.locator("#serviceBoundaryStatus")).toContainText("生产云端");
  await expect(page.locator("#serviceBoundaryList")).toContainText("本机真实");
  await expect(page.locator("#serviceBoundaryList")).toContainText("远端 Adapter");
  await expect(page.locator("#sceneTitle")).toContainText("今日单字：永");
  await expectCanvasHasVisiblePixels(page, "#roomCanvas");
  const historyEndpoint = await getSameOriginEndpoint(page, historyEndpointPath);
  const reportEndpoint = await getSameOriginEndpoint(page, reportEndpointPath);

  await page.getByRole("button", { name: /切换到步骤 3/ }).click();
  await page.getByRole("button", { name: "播放讲解" }).click();
  await expect(page.locator("#lectureStatusLabel")).toContainText("已完成");
  await expect(page.locator("#lectureServiceSummary")).toContainText("本机语音");
  await expect(page.locator("#actionDetail")).toBeVisible();
  await expect(page.locator("#actionDetail")).toContainText("本机讲解");
  await expect(page.locator("#actionDetail")).toContainText("段落");
  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.lectureService.voiceName).toBe("E2E 中文语音");
  expect(learningState.lectureService.spokenStepCount).toBeGreaterThanOrEqual(5);
  expect(learningState.lectureService.status).toBe("complete");
  await expect(page.locator("#learningActionAuditStatus")).toContainText("最近");
  await expect(page.locator("#learningActionAuditList")).toContainText("讲解");
  await expect(page.locator("#learningActionAuditExport")).toBeEnabled();

  await page.locator("#actionList .action-button").filter({ hasText: /^开始临摹$/ }).click();
  await expect(page.locator("#sceneTitle")).toContainText("真实临摹");
  await expect(page.locator("#actionFeedback")).toContainText("练习会话");
  await expect(page.locator("#actionDetail")).toBeVisible();
  await expect(page.locator("#actionDetail")).toContainText("本机练习会话");
  await expect(page.locator("#actionDetail")).toContainText("会话 ID");
  await expect(page.locator("#learningActionAuditList")).toContainText("开始练习");

  await page.locator("#actionList .action-button").filter({ hasText: /^对比模式$/ }).click();
  await expect(page.locator("#actionFeedback")).toContainText("对比模式");
  await expect(page.locator("#actionDetail")).toContainText("训练模式");
  await expect(page.locator("#actionDetail")).toContainText("当前会话");

  await page.locator("#actionList .action-button").filter({ hasText: /^进入笔画拆解$/ }).click();
  await expect(page.locator("#sceneTitle")).toContainText("笔画拆解");
  await expect(page.locator("#actionFeedback")).toContainText("笔画拆解已写入本机学习阶段记录");
  await expect(page.locator("#actionDetail")).toContainText("本机阶段记录");
  await expect(page.locator("#actionDetail")).toContainText("阶段记录 ID");
  await expect(page.locator("#actionDetail")).toContainText("目标步骤");

  await page.locator("#actionList .action-button").filter({ hasText: /^下一个笔画$/ }).click();
  await expect(page.locator("#actionFeedback")).toContainText("当前笔画已切换");
  await expect(page.locator("#actionDetail")).toContainText("本机笔画索引");
  await expect(page.locator("#actionDetail")).toContainText("当前笔画");

  await drawPracticeStroke(page);
  await expect(page.locator("#practiceCanvasStatus")).toContainText(/1 笔|2 笔|当前评分/);

  await page.locator("#actionList .action-button").filter({ hasText: /^进入创作$/ }).click();
  await expect(page.locator("#sceneTitle")).toContainText("作品创作");
  await expect(page.locator("#actionFeedback")).toContainText("创作实践已写入本机学习阶段记录");
  await expect(page.locator("#actionDetail")).toContainText("本机阶段记录");
  await expect(page.locator("#actionDetail")).toContainText("阶段记录 ID");

  await page.getByRole("button", { name: "保存作品" }).click();
  await expect(page.locator("#actionFeedback")).toContainText("作品已真实保存到本机记录");
  await expect(page.locator("#actionDetail")).toBeVisible();
  await expect(page.locator("#actionDetail")).toContainText("本机作品保存");
  await expect(page.locator("#actionDetail")).toContainText("作品 ID");
  await expect(page.locator("#actionDetail")).toContainText("真实评分证据");
  await expect(page.locator("#scoreServiceSummary")).toContainText("本机基础评分");
  await expect(page.locator("#scoreServiceSummary")).toContainText("不是专业书法评级");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.artworks).toHaveLength(1);
  expect(learningState.artworks[0].strokeCount).toBeGreaterThan(0);
  expect(learningState.sessions.some((session) => session.status === "saved" && session.strokeCount > 0)).toBe(true);
  expect(learningState.scoreService.status).toBe("scored");
  expect(learningState.scoreService.lastScore).toBeGreaterThan(0);
  expect(learningState.scoreService.algorithmVersion).toBe("local-heuristic-v2.2.0");
  expect(learningState.scoreService.lastEvidenceSummary).toContain("采样");
  expect(learningState.scoreService.lastEvidenceSummary).toContain("笔顺匹配");
  expect(learningState.scoreService.lastEvidenceSummary).toContain("路径贴合");
  expect(learningState.scoreService.lastEvidenceSummary).toContain("压感");
  expect(learningState.stageRecords.map((record) => record.stage)).toEqual(expect.arrayContaining(["strokeBreakdown", "creation"]));
  await expect(page.locator("#learningActionAuditList")).toContainText("保存作品");
  const learningAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#learningActionAuditExport").click();
  const learningAuditDownload = await learningAuditDownloadPromise;
  expect(learningAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-learning-action-audit-.*\.html$/);
  const learningAuditPath = await learningAuditDownload.path();
  const learningAuditHtml = fs.readFileSync(learningAuditPath, "utf8");
  expect(learningAuditHtml).toContain("MR 书法学习动作审计");
  expect(learningAuditHtml).toContain("保存作品");
  expect(learningAuditHtml).toContain("审计摘要");
  await expect(page.locator("#reviewEvidenceMap")).toContainText("路径误差热力");
  await expect(page.locator("#reviewEvidenceMap")).toContainText("路径贴合");
  await expect(page.locator("#reviewEvidenceMap")).toContainText("最高误差");
  await expect(page.locator("#reviewDownloadImage")).toBeEnabled();
  const artworkImageDownloadPromise = page.waitForEvent("download");
  await page.locator("#reviewDownloadImage").click();
  const artworkImageDownload = await artworkImageDownloadPromise;
  expect(artworkImageDownload.suggestedFilename()).toMatch(/\.jpg$/);
  await expect(page.locator("#reviewExportAuditStatus")).toContainText("1 条复盘导出回执");
  await expect(page.locator("#reviewExportAuditList")).toContainText("作品图片");
  await expect(page.locator("#reviewExportAuditList")).toContainText("文件");
  await expect(page.locator("#reviewDownloadEvidence")).toBeEnabled();
  const evidenceDownloadPromise = page.waitForEvent("download");
  await page.locator("#reviewDownloadEvidence").click();
  const evidenceDownload = await evidenceDownloadPromise;
  expect(evidenceDownload.suggestedFilename()).toMatch(/^mr-calligraphy-review-evidence-.*\.html$/);
  const evidenceDownloadPath = await evidenceDownload.path();
  const evidenceHtml = fs.readFileSync(evidenceDownloadPath, "utf8");
  expect(evidenceHtml).toContain("MR 书法复盘证据");
  expect(evidenceHtml).toContain("路径误差热力");
  expect(evidenceHtml).toContain("逐笔路径贴合");
  await expect(page.locator("#reviewExportAuditStatus")).toContainText("2 条复盘导出回执");
  await expect(page.locator("#reviewExportAuditList")).toContainText("复盘证据 HTML");
  const shareDownloadPromise = page.waitForEvent("download");
  await page.locator("#reviewDownloadShare").click();
  const shareDownload = await shareDownloadPromise;
  expect(shareDownload.suggestedFilename()).toMatch(/^mr-calligraphy-share-.*\.html$/);
  const shareDownloadPath = await shareDownload.path();
  const shareHtml = fs.readFileSync(shareDownloadPath, "utf8");
  expect(shareHtml).toContain("MR 书法作品分享");
  expect(shareHtml).toContain("评分证据");
  expect(shareHtml).toContain("路径误差热力");
  expect(shareHtml).toContain("逐笔路径贴合");
  expect(shareHtml).toContain("逐笔轨迹匹配");
  expect(shareHtml).toContain("local-heuristic-v2.2.0");
  await expect(page.locator("#reviewExportAuditStatus")).toContainText("3 条复盘导出回执");
  await expect(page.locator("#reviewExportAuditList")).toContainText("作品分享页 HTML");
  const savedPracticeSession = learningState.sessions.find((session) => session.status === "saved" && session.strokeCount > 0);
  expect(savedPracticeSession?.scoreEvidence?.algorithmVersion).toBe("local-heuristic-v2.2.0");
  expect(savedPracticeSession?.scoreEvidence?.evidence?.targetStrokeNames?.length).toBeGreaterThan(0);
  expect(savedPracticeSession?.scoreEvidence?.evidence?.strokeMatches?.length).toBeGreaterThan(0);
  expect(savedPracticeSession?.scoreEvidence?.evidence?.strokeOrderMatchPercent).toBeGreaterThanOrEqual(0);
  expect(savedPracticeSession?.scoreEvidence?.evidence?.strokeOrderVerdict).toBeTruthy();
  expect(savedPracticeSession?.scoreEvidence?.evidence?.pathFitPercent).toBeGreaterThanOrEqual(0);
  expect(savedPracticeSession?.scoreEvidence?.evidence?.pathErrorHotspots?.length).toBeGreaterThan(0);
  expect(savedPracticeSession?.scoreEvidence?.evidence?.strokePathErrors?.length).toBeGreaterThan(0);
  expect(savedPracticeSession?.scoreEvidence?.evidence?.pressurePointCount).toBeGreaterThan(0);

  await expect(page.locator("#reviewDownloadVideo")).toBeEnabled();
  const videoDownloadPromise = page.waitForEvent("download");
  await page.locator("#reviewDownloadVideo").click();
  const videoDownload = await videoDownloadPromise;
  expect(videoDownload.suggestedFilename()).toMatch(/^mr-calligraphy-replay-.*\.webm$/);
  await expect(page.locator("#actionFeedback")).toContainText("封面已保存到复盘记录", { timeout: 6000 });
  await expect(page.locator("#videoExportSummary")).toContainText("1 条书写视频导出记录");
  await expect(page.locator("#videoExportRecords")).toContainText("最近作品");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.videoExportService.records).toHaveLength(1);
  expect(learningState.videoExportService.records[0].source).toBe("最近作品");
  expect(learningState.videoExportService.records[0].videoFilename).toMatch(/\.webm$/);
  expect(learningState.videoExportService.records[0].coverFilename).toMatch(/\.png$/);
  expect(learningState.videoExportService.records[0].coverDataUrl).toContain("data:image/png");
  expect(learningState.videoExportService.records[0].videoBytes).toBeGreaterThan(0);
  const coverDownloadPromise = page.waitForEvent("download");
  await page.locator("#reviewDownloadVideoCover").click();
  const coverDownload = await coverDownloadPromise;
  expect(coverDownload.suggestedFilename()).toMatch(/^mr-calligraphy-replay-cover-.*\.png$/);

  await page.evaluate(() => {
    Object.defineProperty(window, "MediaRecorder", {
      configurable: true,
      value: undefined
    });
  });
  await page.locator("#reviewDownloadVideo").click();
  await expect(page.locator("#actionFeedback")).toContainText("当前浏览器不支持 Canvas 视频录制", { timeout: 6000 });
  await expect(page.locator("#videoExportRecords")).toContainText("失败");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  const failedVideoJob = learningState.videoExportService.jobs.find((job) => job.status === "failed");
  expect(failedVideoJob).toBeTruthy();
  expect(failedVideoJob.error).toContain("当前浏览器不支持 Canvas 视频录制");

  await page.evaluate(() => {
    Object.defineProperty(window, "MediaRecorder", {
      configurable: true,
      value: window.__MR_E2E_MediaRecorder
    });
  });
  const retryVideoDownloadPromise = page.waitForEvent("download");
  await page.locator("[data-video-export-retry]").first().click();
  const retryVideoDownload = await retryVideoDownloadPromise;
  expect(retryVideoDownload.suggestedFilename()).toMatch(/^mr-calligraphy-replay-.*\.webm$/);
  await expect(page.locator("#videoExportRecords")).toContainText("已完成");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.videoExportService.jobs.some((job) => job.retryOf === failedVideoJob.id && job.status === "succeeded")).toBe(true);
  await expect(page.locator("#reviewDownloadVideoAudit")).toBeEnabled();
  const videoAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#reviewDownloadVideoAudit").click();
  const videoAuditDownload = await videoAuditDownloadPromise;
  expect(videoAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-video-export-audit-.*\.html$/);
  const videoAuditPath = await videoAuditDownload.path();
  const videoAuditHtml = fs.readFileSync(videoAuditPath, "utf8");
  expect(videoAuditHtml).toContain("MR 书法视频导出回执审计");
  expect(videoAuditHtml).toContain(learningState.videoExportService.records[0].videoFilename);
  expect(videoAuditHtml).toContain("当前浏览器不支持 Canvas 视频录制");
  expect(videoAuditHtml).toContain(failedVideoJob.id);
  expect(videoAuditHtml).toContain("重试来源");
  expect(videoAuditHtml).toContain("审计摘要");

  await page.locator("#reviewCreateShareLink").click();
  await expect(page.locator("#shareServiceSummary")).toContainText("1 条有效链接");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.records).toHaveLength(1);
  expect(learningState.shareService.records[0].artworkId).toBe(learningState.artworks[0].id);
  const shareRecordId = learningState.shareService.records[0].id;

  await page.locator(".share-remote-panel summary").click();
  await configureShareRemoteInUi(page, await getSameOriginEndpoint(page, shareEndpointPath), "share-token", "share-e2e");
  await page.locator("#shareRemoteCheckButton").click();
  await expect(page.locator("#shareRemoteStatus")).toContainText("远端分享 E2E 可访问");
  await expect(page.locator("#shareRemoteStatus")).toContainText("share-e2e");
  await page.locator("#shareRemotePushButton").click();
  await expect(page.locator("#shareRemoteStatus")).toContainText("https://share.example.test/");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(shareRequests.some((request) => request.method === "GET" && request.authorization === "Bearer share-token" && request.workspaceId === "share-e2e")).toBe(true);
  const sharePut = shareRequests.find((request) => request.method === "PUT");
  expect(sharePut.authorization).toBe("Bearer share-token");
  expect(sharePut.workspaceId).toBe("share-e2e");
  expect(sharePut.body.workspaceId).toBe("share-e2e");
  expect(sharePut.body.summary.workspaceId).toBe("share-e2e");
  expect(sharePut.body.summary.scoreEvidence).toBe(true);
  expect(sharePut.body.summary.scoreEvidenceSource).toBeTruthy();
  expect(sharePut.body.records[0].id).toBe(shareRecordId);
  expect(sharePut.body.digestAlgorithm).toBe("sha256-stable-json");
  expect(sharePut.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(sharePut.body.shares[0].html).toContain("MR 书法作品分享");
  expect(sharePut.body.shares[0].html).toContain("评分证据");
  expect(sharePut.body.shares[0].html).toContain("路径误差热力");
  expect(sharePut.body.shares[0].html).toContain("逐笔路径贴合");
  expect(remoteSharePackage.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.shareService.workspaceId).toBe("share-e2e");
  expect(learningState.shareService.lastPackageDigest).toBe(remoteSharePackage.packageDigest);
  expect(learningState.shareService.lastRemotePublicUrl).toContain(shareRecordId);
  expect(learningState.shareService.lastReceipt.workspaceId).toBe("share-e2e");
  expect(learningState.shareService.lastReceipt.receiptDigest).toBe(latestShareReceipt.receiptDigest);
  expect(learningState.shareService.lastReceipt.verificationStatus).toBe("verified");
  expect(learningState.shareService.lastReceipt.verificationExpectedDigest).toBe(latestShareReceipt.receiptDigest);
  expect(learningState.shareService.records[0].remotePublicUrl).toContain(shareRecordId);
  expect(learningState.shareService.records[0].remoteWorkspaceId).toBe("share-e2e");
  await expect(page.locator("#shareRepositoryReceiptStatus")).toContainText("作品分享远端回执");
  await expect(page.locator("#shareRepositoryReceiptStatus")).toContainText("本机校验通过 1 条");
  await expect(page.locator("#shareRepositoryReceiptStatus")).toContainText("share-e2e");
  await expect(page.locator("#shareRepositoryReceiptList")).toContainText("发布");
  await expect(page.locator("#shareRepositoryReceiptList")).toContainText("本机校验通过");
  const shareReceiptDownloadPromise = page.waitForEvent("download");
  await page.locator("#shareRepositoryReceiptExportButton").click();
  const shareReceiptDownload = await shareReceiptDownloadPromise;
  expect(shareReceiptDownload.suggestedFilename()).toMatch(/^mr-calligraphy-share-repository-receipts-.*\.html$/);
  const shareReceiptPath = await shareReceiptDownload.path();
  const shareReceiptHtml = fs.readFileSync(shareReceiptPath, "utf8");
  expect(shareReceiptHtml).toContain("MR 书法作品分享远端回执审计");
  expect(shareReceiptHtml).toContain("share-e2e");
  expect(shareReceiptHtml).toContain("https://share.example.test/");
  expect(shareReceiptHtml).toContain(latestShareReceipt.receiptDigest);
  expect(shareReceiptHtml).toContain("本机校验通过");
  expect(shareReceiptHtml).toContain("重算摘要");
  await page.locator("#shareRemoteRevokeButton").click();
  await expect(page.locator("#shareRemoteStatus")).toContainText("已请求远端撤销");
  await expect(page.locator("#shareRepositoryReceiptList")).toContainText("撤销");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  const shareDelete = shareRequests.find((request) => request.method === "DELETE");
  expect(shareDelete.authorization).toBe("Bearer share-token");
  expect(shareDelete.workspaceId).toBe("share-e2e");
  expect(shareDelete.body.kind).toBe("mr-calligraphy-share-repository-revoke-v1");
  expect(shareDelete.body.workspaceId).toBe("share-e2e");
  expect(shareDelete.body.shareId).toBe(shareRecordId);
  expect(learningState.shareService.lastRemoteDirection).toBe("revoke");
  expect(learningState.shareService.records[0].remoteRevokedAt).toBeTruthy();
  expect(learningState.shareService.records[0].remoteWorkspaceId).toBe("share-e2e");
  expect(learningState.shareService.records[0].remoteRevokeReceiptDigest).toBe(latestShareReceipt.receiptDigest);
  expect(learningState.shareService.lastReceipt.verificationStatus).toBe("verified");
  expect(learningState.shareService.lastReceipt.verificationAction).toBe("revoke");
  const revokedReceiptDownloadPromise = page.waitForEvent("download");
  await page.locator("#shareRepositoryReceiptExportButton").click();
  const revokedReceiptDownload = await revokedReceiptDownloadPromise;
  const revokedReceiptPath = await revokedReceiptDownload.path();
  const revokedReceiptHtml = fs.readFileSync(revokedReceiptPath, "utf8");
  expect(revokedReceiptHtml).toContain("撤销");
  expect(revokedReceiptHtml).toContain(latestShareReceipt.receiptDigest);
  expect(revokedReceiptHtml).toContain("本机校验通过");

  await page.locator("#reviewCopyShareLink").click();
  await expect(page.locator("#noticeState")).toContainText(/已复制本机分享链接|写入地址栏/);
  await expect(page.locator("#localLinkCopyAuditStatus")).toContainText("最近");
  await expect(page.locator("#localLinkCopyAuditList")).toContainText("本机分享链接");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.records[0].copyCount).toBe(1);
  expect(learningState.localLinkCopyReceipts[0].targetType).toBe("share-link");
  expect(learningState.localLinkCopyReceipts[0].url).toContain(`share=${shareRecordId}`);

  await page.goto(`/?share=${shareRecordId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#historyDetail")).toBeVisible();
  await expect(page.locator("#historyDetailType")).toContainText("作品详情");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.records[0].viewCount).toBe(1);

  await page.locator("#reviewRevokeShareLink").click();
  await expect(page.locator("#shareServiceSummary")).toContainText("已撤销");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.records[0].revokedAt).toBeTruthy();

  await page.getByRole("button", { name: /切换到步骤 9/ }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出报告" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^mr-calligraphy-report-report-/);
  const reportHtmlPath = await download.path();
  const reportHtml = fs.readFileSync(reportHtmlPath, "utf8");
  expect(reportHtml).toContain("基础评分证据");
  expect(reportHtml).toContain("路径");
  await expect(page.locator("#actionFeedback")).toContainText("学习报告已生成");
  await expect(page.locator("#actionDetail")).toBeVisible();
  await expect(page.locator("#actionDetail")).toContainText("本机报告导出");
  await expect(page.locator("#actionDetail")).toContainText("报告 ID");
  await expect(page.locator("#actionDetail")).toContainText("评分证据");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reports).toHaveLength(1);
  expect(learningState.reports[0].artworkCount).toBe(1);
  expect(learningState.reports[0].latestStrokeCount).toBeGreaterThan(0);
  expect(learningState.reports[0].scoreEvidenceSummary?.algorithmVersion).toBe("local-heuristic-v2.2.0");
  expect(learningState.reports[0].scoreEvidenceSummary?.pathFitPercent).toBeGreaterThanOrEqual(0);
  expect(learningState.reports[0].scoreEvidenceSummary?.hotspots?.length).toBeGreaterThan(0);
  const pathAfterReport = await page.evaluate(() => window.MRAppState.getLearningPathStatus());
  expect(pathAfterReport.steps).toHaveLength(10);
  expect(pathAfterReport.steps[3].done).toBe(true);
  expect(pathAfterReport.steps[5].done).toBe(true);
  expect(pathAfterReport.steps[8].done).toBe(true);
  expect(pathAfterReport.steps[8].title).toContain("学习报告");
  await expect(page.locator("#reviewDownloadReport")).toBeEnabled();
  const reviewReportDownloadPromise = page.waitForEvent("download");
  await page.locator("#reviewDownloadReport").click();
  const reviewReportDownload = await reviewReportDownloadPromise;
  expect(reviewReportDownload.suggestedFilename()).toMatch(/^mr-calligraphy-report-.*\.html$/);
  const reviewReportPath = await reviewReportDownload.path();
  const reviewReportHtml = fs.readFileSync(reviewReportPath, "utf8");
  expect(reviewReportHtml).toContain("MR 书法学习报告");
  await expect(page.locator("#reviewExportAuditStatus")).toContainText("4 条复盘导出回执");
  await expect(page.locator("#reviewExportAuditList")).toContainText("学习报告 HTML");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reviewExportReceipts).toHaveLength(4);
  expect(learningState.reviewExportReceipts.map((receipt) => receipt.exportType)).toEqual(["report-html", "share-html", "review-evidence", "artwork-image"]);
  expect(learningState.reviewExportReceipts[0].fileDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reviewExportReceipts[0].receiptDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reviewExportReceipts[0].boundary).toContain("不是云端下载日志");
  const reviewExportAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#reviewExportAuditExport").click();
  const reviewExportAuditDownload = await reviewExportAuditDownloadPromise;
  expect(reviewExportAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-review-export-audit-.*\.html$/);
  const reviewExportAuditPath = await reviewExportAuditDownload.path();
  const reviewExportAuditHtml = fs.readFileSync(reviewExportAuditPath, "utf8");
  expect(reviewExportAuditHtml).toContain("MR 书法复盘导出回执审计");
  expect(reviewExportAuditHtml).toContain("作品图片");
  expect(reviewExportAuditHtml).toContain("复盘证据 HTML");
  expect(reviewExportAuditHtml).toContain("作品分享页 HTML");
  expect(reviewExportAuditHtml).toContain("学习报告 HTML");
  expect(reviewExportAuditHtml).toContain(learningState.reviewExportReceipts[0].receiptDigest);

  await page.getByRole("button", { name: "制定计划" }).click();
  await expect(page.locator("#actionFeedback")).toContainText("已生成并保存下一阶段练习计划");
  await expect(page.locator("#actionDetail")).toBeVisible();
  await expect(page.locator("#actionDetail")).toContainText("本机学习计划");
  await expect(page.locator("#actionDetail")).toContainText("计划 ID");
  await expect(page.locator("#actionDetail")).toContainText("下一项");
  const reminderSetup = await page.evaluate(() => {
    window.__planNotifications = [];
    function MockNotification(title, options = {}) {
      window.__planNotifications.push({ title, options });
    }
    MockNotification.permission = "granted";
    MockNotification.requestPermission = () => Promise.resolve("granted");
    Object.defineProperty(window, "Notification", {
      configurable: true,
      writable: true,
      value: MockNotification
    });
    const plan = window.MRAppState.getLatestPlan();
    const firstItem = plan.items[0];
    window.MRAppState.updatePlanItem(plan.id, firstItem.id, {
      dueAt: "2000-01-01",
      remindAt: "2000-01-01"
    });
    return { planId: plan.id, itemId: firstItem.id };
  });
  await page.locator("#planReminderPermissionButton").click();
  await expect(page.locator("#planReminderAuditStatus")).toContainText("1 条本机提醒回执");
  await expect(page.locator("#planReminderAuditList")).toContainText("浏览器 Notification");
  await expect(page.locator("#planReminderAuditList")).toContainText("仅证明当前页面发起");
  await expect.poll(() => page.evaluate(() => window.__planNotifications.length)).toBe(1);
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planReminderService.receipts).toHaveLength(1);
  expect(learningState.planReminderService.receipts[0].planId).toBe(reminderSetup.planId);
  expect(learningState.planReminderService.receipts[0].itemId).toBe(reminderSetup.itemId);
  expect(learningState.planReminderService.receipts[0].receiptDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.planReminderService.receipts[0].boundary).toContain("不是云端推送日志");
  const planReminderAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#planReminderAuditExport").click();
  const planReminderAuditDownload = await planReminderAuditDownloadPromise;
  expect(planReminderAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-plan-reminder-audit-.*\.html$/);
  const planReminderAuditPath = await planReminderAuditDownload.path();
  const planReminderAuditHtml = fs.readFileSync(planReminderAuditPath, "utf8");
  expect(planReminderAuditHtml).toContain("MR 书法计划提醒回执审计");
  expect(planReminderAuditHtml).toContain("浏览器 Notification");
  expect(planReminderAuditHtml).toContain("不是云端推送日志");
  expect(planReminderAuditHtml).toContain(learningState.planReminderService.receipts[0].receiptDigest);

  await page.getByRole("button", { name: /切换到步骤 7/ }).click();
  await page.locator(".history-filters").getByRole("button", { name: "全部" }).click();
  await page.locator("#historySelectVisible").check();
  await expect(page.locator("#historySelectionStatus")).toContainText("已选");
  const selectedHistoryDownloadPromise = page.waitForEvent("download");
  await page.locator("#historyExportSelected").click();
  const selectedHistoryDownload = await selectedHistoryDownloadPromise;
  expect(selectedHistoryDownload.suggestedFilename()).toMatch(/^mr-calligraphy-history-selection-.*\.json$/);
  await expect(page.locator("#historyBatchReceipt")).toBeVisible();
  await expect(page.locator("#historyBatchReceipt")).toContainText("导出所选学习档案");
  await expect(page.locator("#historyBatchReceipt")).toContainText("总数");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyBatchReceipts[0].action).toBe("export");
  expect(learningState.historyBatchReceipts[0].filename).toMatch(/^mr-calligraphy-history-selection-/);
  expect(learningState.historyBatchReceipts[0].recordCount).toBeGreaterThanOrEqual(3);

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#historyDeleteSelected").click();
  await expect(page.locator("#historyBatchReceipt")).toContainText("批量移入回收站");
  await expect(page.locator("#historyTrashStatus")).toContainText("回收站");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyBatchReceipts[0].action).toBe("delete");
  expect(learningState.historyBatchReceipts[0].trashId).toBeTruthy();
  expect(learningState.historyTrash[0].id).toBe(learningState.historyBatchReceipts[0].trashId);

  await page.locator("#historyRestoreTrash").click();
  await expect(page.locator("#historyBatchReceipt")).toContainText("恢复回收站学习档案");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyBatchReceipts[0].action).toBe("restore");
  expect(learningState.historyBatchReceipts[0].recordCount).toBeGreaterThanOrEqual(3);
  expect(learningState.historyTrash).toHaveLength(0);
  expect(learningState.reports).toHaveLength(1);
  expect(learningState.artworks).toHaveLength(1);
  await expect(page.locator("#historyBatchReceiptExport")).toBeEnabled();
  await expect(page.locator("#historyBatchReceiptList")).toContainText("批量移入回收站");
  const batchReceiptAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#historyBatchReceiptExport").click();
  const batchReceiptAuditDownload = await batchReceiptAuditDownloadPromise;
  expect(batchReceiptAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-history-batch-receipts-.*\.html$/);
  const batchReceiptAuditPath = await batchReceiptAuditDownload.path();
  const batchReceiptAuditHtml = fs.readFileSync(batchReceiptAuditPath, "utf8");
  expect(batchReceiptAuditHtml).toContain("MR 书法学习档案批量回执审计");
  expect(batchReceiptAuditHtml).toContain("恢复回收站学习档案");
  expect(batchReceiptAuditHtml).toContain("批量移入回收站");
  expect(batchReceiptAuditHtml).toContain("审计摘要");

  for (const stepNumber of [7, 8, 9, 10]) {
    await page.getByRole("button", { name: new RegExp(`切换到步骤 ${stepNumber}`) }).click();
    await expect(page.locator("#contentBody")).toContainText("路径状态");
    await expect(page.locator("#contentBody")).toContainText("本机证据");
  }

  await page.getByRole("button", { name: /切换到步骤 10/ }).click();
  await page.getByRole("button", { name: "查看详情" }).click();
  await expect(page.locator("#actionFeedback")).toContainText("已读取本机学习详情");
  await expect(page.locator("#actionDetail")).toBeVisible();
  await expect(page.locator("#actionDetail")).toContainText("真实学习详情");
  await expect(page.locator("#actionDetail")).toContainText("路径");
  await expect(page.locator("#actionDetail")).toContainText("真实练习");
  await expect(page.locator("#actionDetail")).toContainText("最近报告");
  await page.locator("#actionList .action-button").filter({ hasText: /^复习巩固$/ }).click();
  await expect(page.locator("#sceneTitle")).toContainText("笔画拆解");
  await expect(page.locator("#actionFeedback")).toContainText("复习巩固已写入本机学习阶段记录");
  await expect(page.locator("#actionDetail")).toBeVisible();
  await expect(page.locator("#actionDetail")).toContainText("本机阶段记录");
  await expect(page.locator("#actionDetail")).toContainText("复习巩固");
  await expect(page.locator("#actionDetail")).toContainText("阶段记录 ID");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.stageRecords.at(-1).stage).toBe("review");

  await page.getByRole("button", { name: /切换到步骤 7/ }).click();
  await page.locator(".history-filters").getByRole("button", { name: "阶段" }).click();
  await expect(page.locator("#historySummary")).toContainText("3 条阶段");
  await expect(page.locator("#historyList")).toContainText("复习巩固");
  await expect(page.locator("#historyList")).toContainText("创作实践");
  await expect(page.locator("#historyList")).toContainText("笔画拆解");
  await page.locator("#historyList .history-item").first().click();
  await expect(page.locator("#historyDetailType")).toContainText("阶段详情");
  await expect(page.locator("#historyDetailTitle")).toContainText("复习巩固");
  await expect(page.locator("#historyDetailBody")).toContainText("阶段记录 ID");
  await expect(page.locator("#historyDetailRename")).toBeDisabled();
  await page.locator("#historySelectVisible").check();
  const stageHistoryDownloadPromise = page.waitForEvent("download");
  await page.locator("#historyExportSelected").click();
  const stageHistoryDownload = await stageHistoryDownloadPromise;
  expect(stageHistoryDownload.suggestedFilename()).toMatch(/^mr-calligraphy-history-selection-.*\.json$/);
  const stageHistoryPath = await stageHistoryDownload.path();
  const stageHistoryPackage = JSON.parse(fs.readFileSync(stageHistoryPath, "utf8"));
  expect(stageHistoryPackage.records.stages).toHaveLength(3);
  expect(stageHistoryPackage.records.stages.map((record) => record.stage)).toEqual(expect.arrayContaining(["strokeBreakdown", "creation", "review"]));
  expect(stageHistoryPackage.history[0].type).toBe("stage");
  await expect(page.locator("#historyBatchReceipt")).toContainText("阶段");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyBatchReceipts[0].counts.stage).toBe(3);

  await page.goto(`/?report=${learningState.reports[0].id}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#reportPanel")).toBeVisible();
  await expect(page.locator("#reportTitle")).toContainText("学习报告");
  await expect(page.locator("#reportStats")).toContainText("作品1幅");
  await expect(page.locator("#reportLatest")).toContainText("基础评分证据");
  await expect(page.locator("#reportLatest")).toContainText("路径贴合");
  await page.locator("#reportDetailCopyLink").click();
  await expect(page.locator("#noticeState")).toContainText(/已复制这份站内报告的直达链接|写入地址栏/);
  await expect(page.locator("#localLinkCopyAuditList")).toContainText("站内报告链接");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.localLinkCopyReceipts[0].targetType).toBe("report");
  expect(learningState.localLinkCopyReceipts[0].url).toContain(`report=${learningState.reports[0].id}`);
  const localLinkCopyAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#localLinkCopyAuditExport").click();
  const localLinkCopyAuditDownload = await localLinkCopyAuditDownloadPromise;
  expect(localLinkCopyAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-local-link-copy-audit-.*\.html$/);
  const localLinkCopyAuditPath = await localLinkCopyAuditDownload.path();
  const localLinkCopyAuditHtml = fs.readFileSync(localLinkCopyAuditPath, "utf8");
  expect(localLinkCopyAuditHtml).toContain("MR 书法本机链接复制审计");
  expect(localLinkCopyAuditHtml).toContain("站内报告链接");
  expect(localLinkCopyAuditHtml).toContain("本机分享链接");
  expect(localLinkCopyAuditHtml).toContain("审计摘要");

  const activeReportId = learningState.reports[0].id;
  await page.evaluate(() => {
    window.__reportPrintCalled = false;
    window.print = () => {
      window.__reportPrintCalled = true;
      window.dispatchEvent(new Event("afterprint"));
    };
  });
  await page.locator("#reportDetailPrint").click();
  await expect(page.locator("#reportPrintAuditStatus")).toContainText("1 条报告打印");
  await expect(page.locator("#reportPrintAuditList")).toContainText("浏览器打印请求");
  await expect(page.locator("#reportPrintAuditList")).toContainText("仅证明本页发起");
  await expect.poll(() => page.evaluate(() => window.__reportPrintCalled)).toBe(true);
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportPrintReceipts).toHaveLength(1);
  expect(learningState.reportPrintReceipts[0].reportId).toBe(activeReportId);
  expect(learningState.reportPrintReceipts[0].reportDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reportPrintReceipts[0].receiptDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reportPrintReceipts[0].boundary).toContain("只能证明本页发起");

  const reportPrintAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#reportPrintAuditExport").click();
  const reportPrintAuditDownload = await reportPrintAuditDownloadPromise;
  expect(reportPrintAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-report-print-audit-.*\.html$/);
  const reportPrintAuditPath = await reportPrintAuditDownload.path();
  const reportPrintAuditHtml = fs.readFileSync(reportPrintAuditPath, "utf8");
  expect(reportPrintAuditHtml).toContain("MR 书法报告打印回执审计");
  expect(reportPrintAuditHtml).toContain("浏览器打印请求");
  expect(reportPrintAuditHtml).toContain("不代表操作系统打印完成");
  expect(reportPrintAuditHtml).toContain(learningState.reportPrintReceipts[0].receiptDigest);

  await page.locator("#reportTeacherReviewerInput").fill("王老师");
  await page.locator("#reportTeacherReviewRoleInput").selectOption("local-reviewer");
  await page.locator("#reportTeacherReviewInput").fill("结构更稳，下一次重点放慢竖钩收笔。");
  await page.locator("#reportTeacherReviewSave").click();
  await expect(page.locator("#reportTeacherReviewStatus")).toContainText("王老师");
  await expect(page.locator("#reportTeacherReviewStatus")).toContainText("教研审核");
  await expect(page.locator("#reportTeacherReviewStatus")).toContainText("签名");
  await expect(page.locator("#reportTeacherReviewView")).toContainText("竖钩");
  await expect(page.locator("#reportTeacherReviewAuditStatus")).toContainText("1 条教师批注审计记录");
  await expect(page.locator("#reportTeacherReviewAuditList")).toContainText("保存批注");
  await expect(page.locator("#reportTeacherReviewAuditList")).toContainText("王老师");
  await expect(page.locator("#reportTeacherReviewAuditList")).toContainText("教研审核");
  await expect(page.locator("#reportTeacherReviewAuditList")).toContainText("本机签名");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reports[0].teacherReview.reviewer).toBe("王老师");
  expect(learningState.reports[0].teacherReview.role).toBe("local-reviewer");
  expect(learningState.reports[0].teacherReview.note).toContain("竖钩");
  expect(learningState.reports[0].teacherReview.reviewDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reports[0].teacherReview.localSignatureDigest).toMatch(/^[a-f0-9]{64}$/);
  const teacherReviewSignatureDigest = learningState.reports[0].teacherReview.localSignatureDigest;
  expect(learningState.reportTeacherReviewAudits).toHaveLength(1);
  expect(learningState.reportTeacherReviewAudits[0].action).toBe("save");
  expect(learningState.reportTeacherReviewAudits[0].reportId).toBe(learningState.reports[0].id);
  expect(learningState.reportTeacherReviewAudits[0].nextDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reportTeacherReviewAudits[0].nextReviewDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reportTeacherReviewAudits[0].nextSignatureDigest).toBe(teacherReviewSignatureDigest);
  expect(learningState.reportTeacherReviewAudits[0].nextPreview).toContain("竖钩");

  const teacherReviewAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#reportTeacherReviewAuditExport").click();
  const teacherReviewAuditDownload = await teacherReviewAuditDownloadPromise;
  expect(teacherReviewAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-teacher-review-audit-.*\.html$/);
  const teacherReviewAuditPath = await teacherReviewAuditDownload.path();
  const teacherReviewAuditHtml = fs.readFileSync(teacherReviewAuditPath, "utf8");
  expect(teacherReviewAuditHtml).toContain("MR 书法教师批注审计");
  expect(teacherReviewAuditHtml).toContain("王老师");
  expect(teacherReviewAuditHtml).toContain("竖钩");
  expect(teacherReviewAuditHtml).toContain("教研审核");
  expect(teacherReviewAuditHtml).toContain(teacherReviewSignatureDigest);

  await expect(page.locator("#reportVerification")).toContainText("本机验真摘要");
  const reportPdfDownloadPromise = page.waitForEvent("download");
  await page.locator("#reportDetailDownloadPdf").click();
  const reportPdfDownload = await reportPdfDownloadPromise;
  expect(reportPdfDownload.suggestedFilename()).toMatch(/^mr-calligraphy-report-.*\.pdf$/);
  const reportPdfPath = await reportPdfDownload.path();
  const reportPdfText = fs.readFileSync(reportPdfPath, "utf8");
  expect(reportPdfText).toContain("%PDF-1.4");
  expect(reportPdfText).toContain("RadarChart:");
  expect(reportPdfText).toContain("TrendBars:");
  expect(reportPdfText).toContain("ArtworkImageEmbedded: yes");
  expect(reportPdfText).toContain("ScoreEvidence: yes");
  expect(reportPdfText).toContain("ScoreEvidenceAlgorithm: local-heuristic-v2.2.0");
  expect(reportPdfText).toContain(`TeacherReviewSignatureDigest: ${teacherReviewSignatureDigest}`);
  expect(reportPdfText).toContain("/Subtype /Image");
  expect(reportPdfText).toContain("/DCTDecode");

  const reportRepositoryDownloadPromise = page.waitForEvent("download");
  await page.locator("#reportRepositoryExportButton").click();
  const reportRepositoryDownload = await reportRepositoryDownloadPromise;
  expect(reportRepositoryDownload.suggestedFilename()).toMatch(/^mr-calligraphy-report-repository-.*\.json$/);
  const reportRepositoryPath = await reportRepositoryDownload.path();
  const reportRepositoryJson = JSON.parse(fs.readFileSync(reportRepositoryPath, "utf8"));
  expect(reportRepositoryJson.digestAlgorithm).toBe("sha256-stable-json");
  expect(reportRepositoryJson.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  const reportRepositoryDigestPayload = cloneJson(reportRepositoryJson);
  delete reportRepositoryDigestPayload.packageDigest;
  expect(reportRepositoryJson.packageDigest).toBe(sha256StableJson(reportRepositoryDigestPayload));
  await expect(page.locator("#reportRepositorySummary")).toContainText("最近导出 1 份报告");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastExportedReportCount).toBe(1);
  expect(learningState.reportRepository.lastPackageId).toMatch(/^report-repository-/);
  expect(learningState.reportRepository.lastPackageDigest).toBe(reportRepositoryJson.packageDigest);

  await page.locator(".report-repository-remote summary").click();
  await page.locator("#reportRepositoryEndpointInput").fill(reportEndpoint);
  await page.locator("#reportRepositoryTokenInput").fill("report-token");
  await page.locator("#reportRepositoryWorkspaceInput").fill("report-e2e");
  await page.locator("#reportRepositorySaveRemoteButton").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("已配置");
  await expect(page.locator("#reportRepositorySummary")).toContainText("report-e2e");

  await page.locator("#reportRepositoryRemoteButton").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("E2E 可访问");

  await page.locator("#reportRepositoryPushButton").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("已推送 1 份报告");
  await expect(page.locator("#reportRepositorySummary")).toContainText("签名回执");
  await expect(page.locator("#reportRepositoryReceiptStatus")).toContainText("已保存 1 条报告仓库签名回执");
  await expect(page.locator("#reportRepositoryReceiptStatus")).toContainText("本机校验通过 1 条");
  await expect(page.locator("#reportRepositoryReceiptList")).toContainText("HMAC-SHA256");
  await expect(page.locator("#reportRepositoryReceiptList")).toContainText("本机校验通过");

  const reportPutRequest = reportRequests.find((item) => item.method === "PUT");
  expect(reportPutRequest.authorization).toBe("Bearer report-token");
  expect(reportPutRequest.workspaceId).toBe("report-e2e");
  expect(reportPutRequest.body.kind).toBe("mr-calligraphy-report-repository-v1");
  expect(reportPutRequest.body.workspaceId).toBe("report-e2e");
  expect(reportPutRequest.body.source.workspaceId).toBe("report-e2e");
  expect(reportPutRequest.body.digestAlgorithm).toBe("sha256-stable-json");
  expect(reportPutRequest.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(reportPutRequest.body.summary.total).toBe(1);
  expect(reportPutRequest.body.reports[0].teacherReview.note).toContain("竖钩");
  expect(reportPutRequest.body.verifications).toHaveLength(1);
  expect(reportPutRequest.body.verifications[0].digest).toMatch(/^[a-f0-9]{64}$/);

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastRemoteDirection).toBe("push");
  expect(learningState.reportRepository.lastPackageId).toBe("e2e-report-package");
  expect(remoteReportPackage.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reportRepository.lastPackageDigest).toBe(remoteReportPackage.packageDigest);
  expect(learningState.reportRepository.workspaceId).toBe("report-e2e");
  expect(learningState.reportRepository.lastSignedReceipt.signatureAlgorithm).toBe("HMAC-SHA256");
  expect(learningState.reportRepository.lastSignedReceipt.signingKeyId).toBe("e2e-report-signing-key-v1");
  expect(learningState.reportRepository.lastSignedReceipt.workspaceId).toBe("report-e2e");
  expect(learningState.reportRepository.lastSignedReceipt.signature).toBe("c".repeat(64));
  expect(learningState.reportRepository.lastSignedReceipt.verificationStatus).toBe("verified");
  expect(learningState.reportRepository.lastSignedReceipt.verificationExpectedDigest).toBe(learningState.reportRepository.lastSignedReceipt.receiptDigest);
  expect(learningState.reportRepository.signedReceipts).toHaveLength(1);
  expect(learningState.reportRepository.signedReceipts[0].direction).toBe("push");
  expect(learningState.reportRepository.signedReceipts[0].workspaceId).toBe("report-e2e");
  expect(learningState.reportRepository.signedReceipts[0].verificationStatus).toBe("verified");

  const receiptAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#reportRepositoryReceiptExportButton").click();
  const receiptAuditDownload = await receiptAuditDownloadPromise;
  expect(receiptAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-report-repository-receipts-.*\.html$/);
  const receiptAuditPath = await receiptAuditDownload.path();
  const receiptAuditHtml = fs.readFileSync(receiptAuditPath, "utf8");
  expect(receiptAuditHtml).toContain("MR 书法报告仓库签名回执审计");
  expect(receiptAuditHtml).toContain("report-e2e");
  expect(receiptAuditHtml).toContain("c".repeat(64));
  expect(receiptAuditHtml).toContain("本机校验通过");

  await page.locator("#reportRepositoryPullButton").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("已从远端 API 拉取 1 份报告");
  expect(reportRequests.some((item) => item.method === "GET" && item.authorization === "Bearer report-token" && item.workspaceId === "report-e2e")).toBe(true);
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastSignedReceipt.signature).toBe("c".repeat(64));
  expect(learningState.reportRepository.lastPackageDigest).toBe(remoteReportPackage.packageDigest);

  remoteReportPackage = withPackageDigest({
    ...remoteReportPackage,
    reports: remoteReportPackage.reports.map((report, index) => index === 0
      ? {
        ...report,
        summary: "远端 E2E 报告摘要，只应在用户选择字段合并后写回本机。",
        title: "远端 E2E 冲突报告"
      }
      : report)
  });
  await page.locator("#reportRepositoryPullButton").click();
  await expect(page.locator("#reportRepositoryConflictPanel")).toBeVisible();
  await expect(page.locator("#reportRepositoryConflictStatus")).toContainText("1 份远端同 ID 差异报告");
  await expect(page.locator("#reportRepositoryConflictList")).toContainText("应用字段合并");
  await page.locator('#reportRepositoryConflictPanel input[data-report-merge-field="summary"][value="remote"]').click();
  await page.locator("#reportRepositoryConflictPanel").getByRole("button", { name: "应用字段合并" }).click();
  await expect(page.locator("#reportRepositoryConflictPanel")).toBeHidden();

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastConflictReports).toHaveLength(0);
  expect(learningState.reportRepository.lastSkippedConflictCount).toBe(0);
  expect(learningState.reports[0].summary).toContain("远端 E2E 报告摘要");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#reportPanel")).toBeVisible();
  await expect(page.locator("#reportTeacherReviewStatus")).toContainText("王老师");
  await expect(page.locator("#reportTeacherReviewStatus")).toContainText("教研审核");
  await expect(page.locator("#reportTeacherReviewView")).toContainText("竖钩");

  await page.locator("#reportTeacherReviewClear").click();
  await expect(page.locator("#reportTeacherReviewStatus")).toContainText("暂无本机教师批注");
  await expect(page.locator("#reportTeacherReviewAuditStatus")).toContainText("2 条教师批注审计记录");
  await expect(page.locator("#reportTeacherReviewAuditList")).toContainText("清除批注");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reports[0].teacherReview).toBeNull();
  expect(learningState.reportTeacherReviewAudits).toHaveLength(2);
  expect(learningState.reportTeacherReviewAudits.map((record) => record.action)).toEqual(["clear", "save"]);
  expect(learningState.reportTeacherReviewAudits[0].previousDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.reportTeacherReviewAudits[0].previousSignatureDigest).toBe(teacherReviewSignatureDigest);
  expect(learningState.reportTeacherReviewAudits[0].nextDigest).toBe("");

  await expect(page.locator("#historyPanel")).toBeVisible();
  await page.locator(".history-repository-remote summary").click();
  await page.locator("#historyRepositoryEndpointInput").fill(historyEndpoint);
  await page.locator("#historyRepositoryTokenInput").fill("history-token");
  await page.locator("#historyRepositoryWorkspaceInput").fill("history-e2e");
  await page.locator("#historyRepositorySaveRemoteButton").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("已配置");
  await expect(page.locator("#historyRepositorySummary")).toContainText("history-e2e");

  await page.locator("#historyRepositoryRemoteButton").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("E2E 可访问");

  await page.locator("#historyRepositoryPushButton").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("已推送 6 条学习档案");

  const putRequest = historyRequests.find((item) => item.method === "PUT");
  expect(putRequest.authorization).toBe("Bearer history-token");
  expect(putRequest.workspaceId).toBe("history-e2e");
  expect(putRequest.body.kind).toBe("mr-calligraphy-history-repository-v1");
  expect(putRequest.body.workspaceId).toBe("history-e2e");
  expect(putRequest.body.source.workspaceId).toBe("history-e2e");
  expect(putRequest.body.digestAlgorithm).toBe("sha256-stable-json");
  expect(putRequest.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(putRequest.body.summary.total).toBe(6);
  expect(putRequest.body.records.reports).toHaveLength(1);
  expect(putRequest.body.records.stages).toHaveLength(3);
  expect(putRequest.body.records.stages.map((record) => record.stage)).toEqual(expect.arrayContaining(["strokeBreakdown", "creation", "review"]));

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastRemoteDirection).toBe("push");
  expect(learningState.historyRepository.lastPackageId).toBe("e2e-history-package");
  expect(remoteHistoryPackage.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.historyRepository.lastPackageDigest).toBe(remoteHistoryPackage.packageDigest);
  expect(learningState.historyRepository.workspaceId).toBe("history-e2e");
  expect(learningState.historyRepository.lastReceipt.receiptDigest).toBe(latestHistoryReceipt.receiptDigest);
  expect(learningState.historyRepository.lastReceipt.verificationStatus).toBe("verified");
  expect(learningState.historyRepository.lastReceipt.verificationExpectedDigest).toBe(latestHistoryReceipt.receiptDigest);
  await expect(page.locator("#historyRepositoryReceiptStatus")).toContainText("学习档案仓库回执");
  await expect(page.locator("#historyRepositoryReceiptStatus")).toContainText("本机校验通过 1 条");
  await expect(page.locator("#historyRepositoryReceiptList")).toContainText("推送");
  await expect(page.locator("#historyRepositoryReceiptList")).toContainText("本机校验通过");
  const historyReceiptDownloadPromise = page.waitForEvent("download");
  await page.locator("#historyRepositoryReceiptExportButton").click();
  const historyReceiptDownload = await historyReceiptDownloadPromise;
  expect(historyReceiptDownload.suggestedFilename()).toMatch(/^mr-calligraphy-history-repository-receipts-.*\.html$/);
  const historyReceiptPath = await historyReceiptDownload.path();
  const historyReceiptHtml = fs.readFileSync(historyReceiptPath, "utf8");
  expect(historyReceiptHtml).toContain("MR 书法学习档案仓库回执审计");
  expect(historyReceiptHtml).toContain("history-e2e");
  expect(historyReceiptHtml).toContain(latestHistoryReceipt.receiptDigest);
  expect(historyReceiptHtml).toContain("本机校验通过");
  expect(historyReceiptHtml).toContain("重算摘要");

  await page.locator("#historyRepositoryPullButton").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("已从远端 API 拉取 6 条学习档案");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastRemoteDirection).toBe("pull");
  expect(learningState.historyRepository.lastRemoteRecordCount).toBe(6);
  expect(learningState.historyRepository.lastPackageDigest).toBe(remoteHistoryPackage.packageDigest);
  expect(learningState.stageRecords.some((record) => record.stage === "review")).toBe(true);
  expect(learningState.historyRepository.lastReceipt.verificationStatus).toBe("verified");
  expect(historyRequests.some((item) => item.method === "GET" && item.authorization === "Bearer history-token" && item.workspaceId === "history-e2e")).toBe(true);

  await page.evaluate(() => window.MRAppState.createPlan());
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#planPanel")).toBeVisible();
  await expect(page.locator("#planExportButton")).toBeEnabled();
  await expect(page.locator("#planCalendarExportButton")).toBeEnabled();
  const planExportDownloadPromise = page.waitForEvent("download");
  await page.locator("#planExportButton").click();
  const planExportDownload = await planExportDownloadPromise;
  expect(planExportDownload.suggestedFilename()).toMatch(/^mr-calligraphy-plan-.*\.html$/);
  const planExportPath = await planExportDownload.path();
  const planExportHtml = fs.readFileSync(planExportPath, "utf8");
  expect(planExportHtml).toContain("MR Calligraphy Plan");
  expect(planExportHtml).toContain("本机导出的学习计划");
  await expect(page.locator("#planExportAuditStatus")).toContainText("1 条计划导出回执");
  await expect(page.locator("#planExportAuditList")).toContainText("学习计划 HTML");
  await expect(page.locator("#planExportAuditList")).toContainText("文件");
  const planCalendarDownloadPromise = page.waitForEvent("download");
  await page.locator("#planCalendarExportButton").click();
  const planCalendarDownload = await planCalendarDownloadPromise;
  expect(planCalendarDownload.suggestedFilename()).toMatch(/^mr-calligraphy-plan-calendar-.*\.ics$/);
  const planCalendarPath = await planCalendarDownload.path();
  const planCalendarText = fs.readFileSync(planCalendarPath, "utf8");
  expect(planCalendarText).toContain("BEGIN:VCALENDAR");
  expect(planCalendarText).toContain("BEGIN:VEVENT");
  expect(planCalendarText).toContain("BEGIN:VALARM");
  expect(planCalendarText).toContain("MR书法");
  await expect(page.locator("#planExportAuditStatus")).toContainText("2 条计划导出回执");
  await expect(page.locator("#planExportAuditList")).toContainText("日历 ICS");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planExportReceipts).toHaveLength(2);
  expect(learningState.planExportReceipts.map((receipt) => receipt.exportType)).toEqual(["calendar-ics", "html"]);
  expect(learningState.planExportReceipts[0].fileDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.planExportReceipts[0].receiptDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.planExportReceipts[0].boundary).toContain("不是云端下载日志");
  const planExportAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#planExportAuditExport").click();
  const planExportAuditDownload = await planExportAuditDownloadPromise;
  expect(planExportAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-plan-export-audit-.*\.html$/);
  const planExportAuditPath = await planExportAuditDownload.path();
  const planExportAuditHtml = fs.readFileSync(planExportAuditPath, "utf8");
  expect(planExportAuditHtml).toContain("MR 书法计划导出回执审计");
  expect(planExportAuditHtml).toContain("学习计划 HTML");
  expect(planExportAuditHtml).toContain("日历 ICS");
  expect(planExportAuditHtml).toContain(learningState.planExportReceipts[0].receiptDigest);
});

test("front report repository imports a local JSON package", async ({ page }) => {
  const now = new Date().toISOString();
  const importPackage = {
    kind: "mr-calligraphy-report-repository-v1",
    version: 1,
    packageId: "e2e-local-report-package",
    exportedAt: now,
    storageKey: LEARNING_KEY,
    source: {
      mode: "local-json",
      boundary: "E2E 本机报告仓库同步包"
    },
    summary: {
      total: 1,
      teacherReviewedReportCount: 1,
      verifiedReportCount: 0,
      averageScore: 88,
      latestReportId: "e2e-import-report",
      latestReportAt: now
    },
    reports: [
      {
        id: "e2e-import-report",
        title: "导入包报告",
        createdAt: now,
        range: "all",
        format: "json",
        summary: "这份报告来自本机 JSON 同步包导入。",
        sessionCount: 1,
        artworkCount: 1,
        averageScore: 88,
        latestStrokeCount: 5,
        latestPointCount: 48,
        learningMinutes: 12,
        scoreBreakdown: {
          structure: 88,
          stroke: 86,
          technique: 89,
          fluency: 87,
          force: 90
        },
        trend: [
          {
            label: "导入",
            score: 88,
            createdAt: now
          }
        ],
        recommendations: ["继续保持竖钩收笔节奏。"],
        teacherReview: {
          reviewer: "E2E 老师",
          note: "导入包保留教师批注。",
          reviewedAt: now,
          source: "e2e-local-import"
        }
      }
    ],
    verifications: []
  };

  await page.goto("/?step=9", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#reportPanel")).toBeVisible();
  await expect(page.locator("#reportRepositoryImportButton")).toBeEnabled();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.locator("#reportRepositoryImportButton").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "report-repository-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(importPackage))
  });

  await expect(page.locator("#reportRepositorySummary")).toContainText("最近导入 1 份报告");
  await expect(page.locator("#reportTitle")).toContainText("导入包报告");
  const learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  const importedReport = learningState.reports.find((item) => item.id === "e2e-import-report");
  expect(importedReport.summary).toContain("本机 JSON 同步包");
  expect(importedReport.teacherReview.note).toContain("导入包保留教师批注");
  expect(learningState.reportRepository.lastImportedReportCount).toBe(1);
  expect(learningState.reportRepository.lastPackageId).toBe("e2e-local-report-package");
});

test("front artwork repository exports and imports local artwork package", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const seed = await page.evaluate(() => {
    const first = window.MRAppState.saveArtwork({
      strokes: [
        [
          { x: 0.24, y: 0.28, t: 0, p: 0.45 },
          { x: 0.36, y: 0.42, t: 18, p: 0.58 },
          { x: 0.52, y: 0.55, t: 36, p: 0.62 },
          { x: 0.68, y: 0.66, t: 54, p: 0.52 }
        ]
      ],
      bounds: { minX: 0.24, minY: 0.28, maxX: 0.68, maxY: 0.66 },
      metrics: { structure: 87, stroke: 85, technique: 86, fluency: 88, force: 84 },
      score: 86,
      feedback: ["E2E 作品仓库第一幅作品"],
      imageData: "data:image/png;base64,iVBORw0KGgo="
    });
    window.MRAppState.setArtworkStyle("行书");
    const second = window.MRAppState.saveArtwork({
      strokes: [
        [
          { x: 0.28, y: 0.3, t: 0, p: 0.5 },
          { x: 0.44, y: 0.43, t: 20, p: 0.6 },
          { x: 0.62, y: 0.54, t: 40, p: 0.64 },
          { x: 0.76, y: 0.62, t: 60, p: 0.55 }
        ]
      ],
      bounds: { minX: 0.28, minY: 0.3, maxX: 0.76, maxY: 0.62 },
      metrics: { structure: 90, stroke: 88, technique: 89, fluency: 91, force: 87 },
      score: 89,
      feedback: ["E2E 作品仓库第二幅作品"],
      imageData: "data:image/png;base64,iVBORw0KGgo="
    });
    return {
      ok: first.ok && second.ok,
      artworkIds: [first.artwork.id, second.artwork.id],
      sessionIds: [first.artwork.sessionId, second.artwork.sessionId],
      status: window.MRAppState.getArtworkRepositoryStatus()
    };
  });
  expect(seed.ok).toBe(true);
  expect(seed.status.artworkCount).toBe(2);
  expect(seed.status.linkedSessionCount).toBe(2);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#historyPanel")).toBeVisible();
  await expect(page.locator("#artworkRepositoryExportButton")).toBeEnabled();
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#artworkRepositoryExportButton").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^mr-calligraphy-artwork-repository-.*\.json$/);
  const downloadPath = await download.path();
  const repositoryPackage = JSON.parse(fs.readFileSync(downloadPath, "utf8"));
  expect(repositoryPackage.kind).toBe("mr-calligraphy-artwork-repository-v1");
  expect(repositoryPackage.artworks).toHaveLength(2);
  expect(repositoryPackage.linkedSessions).toHaveLength(2);
  expect(repositoryPackage.summary.total).toBe(2);
  expect(repositoryPackage.summary.linkedSessionCount).toBe(2);
  expect(repositoryPackage.source.boundary).toContain("不是账号化公开作品集");
  expect(repositoryPackage.digestAlgorithm).toBe("sha256-stable-json");
  expect(repositoryPackage.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  const repositoryDigestPayload = JSON.parse(JSON.stringify(repositoryPackage));
  delete repositoryDigestPayload.packageDigest;
  expect(repositoryPackage.packageDigest).toBe(sha256StableJson(repositoryDigestPayload));
  expect(repositoryPackage.artworks.map((item) => item.id)).toEqual(expect.arrayContaining(seed.artworkIds));

  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
  }, LEARNING_KEY);
  await page.goto("/?step=7", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#historyPanel")).toBeVisible();
  await expect(page.locator("#artworkGalleryStatus")).toContainText("暂无作品");

  const tamperedPackage = JSON.parse(JSON.stringify(repositoryPackage));
  tamperedPackage.artworks[0].title = "E2E 被篡改但摘要未更新";
  tamperedPackage.records.artworks = tamperedPackage.artworks;
  const tamperedFileChooserPromise = page.waitForEvent("filechooser");
  await page.locator("#artworkRepositoryImportButton").click();
  const tamperedFileChooser = await tamperedFileChooserPromise;
  await tamperedFileChooser.setFiles({
    name: "artwork-repository-tampered.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(tamperedPackage))
  });

  await expect(page.locator("#artworkRepositoryStatus")).toContainText("摘要校验失败");
  await expect(page.locator("#artworkGalleryStatus")).toContainText("暂无作品");
  const rejectedState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(rejectedState.artworks || []).toHaveLength(0);

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.locator("#artworkRepositoryImportButton").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "artwork-repository-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(repositoryPackage))
  });

  await expect(page.locator("#artworkRepositoryStatus")).toContainText("最近导入 2 幅作品");
  await expect(page.locator("#artworkGalleryStatus")).toContainText("2/2 幅作品");
  await expect(page.locator("#artworkGalleryGrid")).toContainText("永字行书练习");
  const importedState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(importedState.artworks).toHaveLength(2);
  expect(importedState.artworks.flatMap((artwork) => artwork.feedback)).toEqual(expect.arrayContaining(["E2E 作品仓库第二幅作品"]));
  expect(importedState.sessions.filter((session) => seed.sessionIds.includes(session.id))).toHaveLength(2);
  expect(importedState.artworkRepository.lastImportedArtworkCount).toBe(2);
  expect(importedState.artworkRepository.lastImportedSessionCount).toBe(2);
  expect(importedState.artworkRepository.lastPackageId).toBe(repositoryPackage.packageId);
  expect(importedState.artworkRepository.lastPackageDigest).toBe(repositoryPackage.packageDigest);

  let conflictPackage = {
    ...repositoryPackage,
    packageId: "e2e-artwork-conflict-package",
    artworks: [
      {
        ...repositoryPackage.artworks[0],
        title: "E2E 导入冲突作品",
        score: 99,
        feedback: ["E2E 作品仓库冲突版本"],
        tags: ["导入冲突"]
      }
    ],
    linkedSessions: []
  };
  conflictPackage.records = {
    artworks: conflictPackage.artworks,
    sessions: []
  };
  conflictPackage.summary = {
    ...repositoryPackage.summary,
    total: 1,
    linkedSessionCount: 0,
    latestArtworkId: conflictPackage.artworks[0].id
  };
  conflictPackage = withArtworkRepositoryPackageDigest(conflictPackage);

  const conflictFileChooserPromise = page.waitForEvent("filechooser");
  await page.locator("#artworkRepositoryImportButton").click();
  const conflictFileChooser = await conflictFileChooserPromise;
  await conflictFileChooser.setFiles({
    name: "artwork-repository-conflict.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(conflictPackage))
  });

  await expect(page.locator("#artworkRepositoryStatus")).toContainText("同 ID 差异");
  await expect(page.locator("#artworkRepositoryConflictPanel")).toBeVisible();
  await expect(page.locator("#artworkRepositoryConflictList")).toContainText("E2E 导入冲突作品");
  await expect(page.locator("#artworkRepositoryConflictList")).toContainText("评分");
  await page.locator("#artworkRepositoryConflictList [data-artwork-conflict-action='copy-incoming']").click();
  await expect(page.locator("#artworkRepositoryConflictPanel")).toBeHidden();
  await expect(page.locator("#artworkGalleryStatus")).toContainText("3/3 幅作品");
  await expect(page.locator("#artworkCollectionExportButton")).toBeEnabled();
  const collectionDownloadPromise = page.waitForEvent("download");
  await page.locator("#artworkCollectionExportButton").click();
  const collectionDownload = await collectionDownloadPromise;
  expect(collectionDownload.suggestedFilename()).toMatch(/^mr-calligraphy-artwork-collection-.*\.html$/);
  const collectionHtml = fs.readFileSync(await collectionDownload.path(), "utf8");
  expect(collectionHtml).toContain("MR 书法作品集");
  expect(collectionHtml).toContain("ArtworkCollection: yes");
  expect(collectionHtml).toContain("不是云端公开链接");
  expect(collectionHtml).toContain("E2E 作品仓库冲突版本");
  expect(collectionHtml).toContain("导入副本");
  await expect(page.locator("#artworkRepositoryStatus")).toContainText("离线 HTML 作品集");
  await expect(page.locator("#artworkClassroomReviewExportButton")).toBeEnabled();
  const reviewDownloadPromise = page.waitForEvent("download");
  await page.locator("#artworkClassroomReviewExportButton").click();
  const reviewDownload = await reviewDownloadPromise;
  expect(reviewDownload.suggestedFilename()).toMatch(/^mr-calligraphy-classroom-review-.*\.html$/);
  const reviewHtml = fs.readFileSync(await reviewDownload.path(), "utf8");
  expect(reviewHtml).toContain("MR 课堂作品评阅表");
  expect(reviewHtml).toContain("ClassroomReview: yes");
  expect(reviewHtml).toContain("导出评阅 JSON");
  expect(reviewHtml).toContain('digestAlgorithm: "sha256-stable-json"');
  expect(reviewHtml).toContain("packageDigest");
  expect(reviewHtml).toContain("data-review-field=\"teacherScore\"");
  expect(reviewHtml).toContain("不是账号化教师端");
  expect(reviewHtml).toContain("E2E 作品仓库冲突版本");
  await expect(page.locator("#artworkRepositoryStatus")).toContainText("课堂评阅表");
  const reviewNotesPackage = withPackageDigest({
    kind: "mr-calligraphy-classroom-review-notes-v1",
    packageId: "e2e-classroom-review-notes",
    exportedAt: new Date().toISOString(),
    digestAlgorithm: "sha256-stable-json",
    records: [
      {
        artworkId: seed.artworkIds[0],
        title: "E2E 课堂评阅作品",
        teacherScore: 96,
        level: "展示",
        reviewer: "E2E 王老师",
        note: "课堂评阅回写成功，结构稳定。"
      },
      {
        artworkId: "missing-artwork-id",
        title: "不存在作品",
        teacherScore: 60,
        level: "需复练",
        reviewer: "E2E 王老师",
        note: "这条应被跳过。"
      }
    ]
  });
  expect(reviewNotesPackage.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  const tamperedReviewNotesPackage = JSON.parse(JSON.stringify(reviewNotesPackage));
  tamperedReviewNotesPackage.records[0].note = "这条课堂评阅被篡改但摘要没有更新。";
  const tamperedReviewImportFileChooserPromise = page.waitForEvent("filechooser");
  await page.locator("#artworkClassroomReviewImportButton").click();
  const tamperedReviewImportFileChooser = await tamperedReviewImportFileChooserPromise;
  await tamperedReviewImportFileChooser.setFiles({
    name: "classroom-review-notes-tampered.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(tamperedReviewNotesPackage))
  });
  await expect(page.locator("#artworkRepositoryStatus")).toContainText("课堂评阅 JSON 摘要校验失败");
  await expect(page.locator("#artworkGalleryGrid")).not.toContainText("E2E 王老师");
  const reviewImportFileChooserPromise = page.waitForEvent("filechooser");
  await page.locator("#artworkClassroomReviewImportButton").click();
  const reviewImportFileChooser = await reviewImportFileChooserPromise;
  await reviewImportFileChooser.setFiles({
    name: "classroom-review-notes.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(reviewNotesPackage))
  });
  await expect(page.locator("#artworkRepositoryStatus")).toContainText("最近导入 1 条课堂评阅");
  await expect(page.locator("#artworkRepositoryStatus")).toContainText(reviewNotesPackage.packageDigest.slice(0, 12));
  await expect(page.locator("#artworkGalleryGrid")).toContainText("E2E 王老师");
  await expect(page.locator("#artworkGalleryGrid")).toContainText("96分");
  await expect(page.locator("#artworkGalleryGrid")).toContainText("课堂评阅回写成功");
  await expect(page.locator("#artworkClassroomReviewSummaryExportButton")).toBeEnabled();
  const reviewSummaryDownloadPromise = page.waitForEvent("download");
  await page.locator("#artworkClassroomReviewSummaryExportButton").click();
  const reviewSummaryDownload = await reviewSummaryDownloadPromise;
  expect(reviewSummaryDownload.suggestedFilename()).toMatch(/^mr-calligraphy-classroom-review-summary-.*\.html$/);
  const reviewSummaryHtml = fs.readFileSync(await reviewSummaryDownload.path(), "utf8");
  expect(reviewSummaryHtml).toContain("MR 课堂评阅汇总");
  expect(reviewSummaryHtml).toContain("ClassroomReviewSummary: yes");
  expect(reviewSummaryHtml).toContain("E2E 王老师");
  expect(reviewSummaryHtml).toContain("96");
  expect(reviewSummaryHtml).toContain("课堂评阅回写成功");
  expect(reviewSummaryHtml).toContain("Digest");
  await expect(page.locator("#artworkRepositoryStatus")).toContainText("课堂评阅汇总");
  const resolvedState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(resolvedState.artworks).toHaveLength(3);
  expect(resolvedState.artworks.some((artwork) => artwork.title.includes("导入副本") && artwork.feedback.includes("E2E 作品仓库冲突版本"))).toBe(true);
  expect(resolvedState.artworkRepository.lastCollectionArtworkCount).toBe(3);
  expect(resolvedState.artworkRepository.lastCollectionExportedAt).toBeTruthy();
  expect(resolvedState.artworkRepository.lastClassroomReviewArtworkCount).toBe(3);
  expect(resolvedState.artworkRepository.lastClassroomReviewExportedAt).toBeTruthy();
  const reviewedArtwork = resolvedState.artworks.find((artwork) => artwork.id === seed.artworkIds[0]);
  expect(reviewedArtwork.classroomReview.reviewer).toBe("E2E 王老师");
  expect(reviewedArtwork.classroomReview.teacherScore).toBe(96);
  expect(reviewedArtwork.classroomReview.level).toBe("展示");
  expect(reviewedArtwork.classroomReview.note).toContain("结构稳定");
  expect(reviewedArtwork.classroomReview.packageId).toBe("e2e-classroom-review-notes");
  expect(reviewedArtwork.classroomReview.reviewDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(resolvedState.artworkRepository.lastClassroomReviewImportedCount).toBe(1);
  expect(resolvedState.artworkRepository.lastClassroomReviewSkippedCount).toBe(1);
  expect(resolvedState.artworkRepository.lastClassroomReviewPackageDigest).toBe(reviewNotesPackage.packageDigest);
  expect(resolvedState.artworkRepository.lastClassroomReviewImportedAt).toBeTruthy();
  expect(resolvedState.artworkRepository.lastClassroomReviewSummaryCount).toBe(1);
  expect(resolvedState.artworkRepository.lastClassroomReviewSummaryExportedAt).toBeTruthy();
  expect(resolvedState.artworkRepository.lastConflictRecords).toHaveLength(0);
});

test("front share repository shows retryable remote failure recovery", async ({ page }) => {
  const requests = [];
  const networkPushPath = "/e2e-share-repository-network-push";
  const recoveryPushPath = "/e2e-share-repository-recovery-push";
  const rejectedRevokePath = "/e2e-share-repository-rejected-revoke";
  const recoveryRevokePath = "/e2e-share-repository-recovery-revoke";
  let latestPublishReceipt = null;
  let latestRevokeReceipt = null;
  const routes = [
    {
      path: "/e2e-share-repository-expired-token",
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "分享 token 已过期，请重新登录。"
      })
    },
    {
      path: "/e2e-share-repository-invalid-json",
      status: 200,
      contentType: "application/json",
      body: "{not-json"
    },
    {
      path: "/e2e-share-repository-rejected-push",
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "分享包结构被 E2E 服务端拒绝。"
      })
    },
    {
      path: rejectedRevokePath,
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "分享撤销被 E2E 服务端拒绝。"
      })
    }
  ];

  const parseShareBody = (request) => {
    const rawBody = request.postData();
    return rawBody ? JSON.parse(rawBody) : createShareRevokeBodyFromUrl(request.url());
  };

  for (const routeConfig of routes) {
    await page.route(`**${routeConfig.path}**`, async (route) => {
      const request = route.request();
      const method = request.method();
      requests.push({
        path: routeConfig.path,
        method,
        authorization: request.headers().authorization || "",
        workspaceId: request.headers()["x-mr-workspace-id"] || "",
        body: method === "PUT" || method === "DELETE" ? parseShareBody(request) : null
      });
      await route.fulfill({
        status: routeConfig.status,
        contentType: routeConfig.contentType,
        body: routeConfig.body
      });
    });
  }

  await page.route(`**${networkPushPath}`, async (route) => {
    const request = route.request();
    requests.push({
      path: networkPushPath,
      method: request.method(),
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body: request.method() === "PUT" ? parseShareBody(request) : null
    });
    await route.abort("failed");
  });

  await page.route(`**${recoveryPushPath}**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? parseShareBody(request) : null;
    requests.push({
      path: recoveryPushPath,
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });

    if (method === "PUT") {
      const shareId = body.records[0].id;
      const publicUrl = `https://share.example.test/recovered/${shareId}.html`;
      const acceptedAt = new Date().toISOString();
      const repositoryDigest = sha256StableJson(body);
      const remotePackage = withPackageDigest({
        ...body,
        packageId: "e2e-share-recovered-package",
        repositoryDigest,
        acceptedAt,
        publicUrl
      });
      latestPublishReceipt = {
        receiptKind: "mr-calligraphy-share-repository-receipt-v1",
        remoteVersion: "e2e-share-recovery-v1",
        packageId: remotePackage.packageId,
        sourcePackageId: body.packageId,
        workspaceId: body.workspaceId,
        shareId,
        artworkId: body.records[0].artworkId,
        repositoryDigest,
        acceptedAt,
        publicUrl,
        shareCount: body.records.length,
        htmlBytes: body.shares[0].html.length,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          sourcePackageId: body.packageId,
          workspaceId: body.workspaceId,
          repositoryDigest,
          publicUrl,
          acceptedAt
        })
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `分享恢复端 E2E 已接收 ${body.records.length} 条分享记录。`,
          remoteVersion: "e2e-share-recovery-v1",
          packageId: remotePackage.packageId,
          publicUrl,
          package: remotePackage,
          receipt: latestPublishReceipt
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "分享恢复端 E2E 可访问。"
      })
    });
  });

  await page.route(`**${recoveryRevokePath}**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "DELETE" ? parseShareBody(request) : null;
    requests.push({
      path: recoveryRevokePath,
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });

    if (method === "DELETE") {
      const acceptedAt = new Date().toISOString();
      const repositoryDigest = sha256StableJson(body);
      latestRevokeReceipt = {
        receiptKind: "mr-calligraphy-share-repository-receipt-v1",
        remoteVersion: "e2e-share-recovery-v1",
        packageId: "e2e-share-recovered-revoke-package",
        sourcePackageId: body.packageId,
        workspaceId: body.workspaceId,
        shareId: body.shareId,
        artworkId: body.artworkId,
        repositoryDigest,
        acceptedAt,
        publicUrl: body.publicUrl,
        shareCount: 1,
        htmlBytes: 0,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          action: "revoke",
          sourcePackageId: body.packageId,
          workspaceId: body.workspaceId,
          shareId: body.shareId,
          repositoryDigest,
          publicUrl: body.publicUrl,
          acceptedAt
        })
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `分享恢复端 E2E 已撤销 ${body.shareId}。`,
          remoteVersion: "e2e-share-recovery-v1",
          packageId: latestRevokeReceipt.packageId,
          publicUrl: body.publicUrl,
          receipt: latestRevokeReceipt
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "分享撤销恢复端 E2E 可访问。"
      })
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  const seed = await page.evaluate(() => {
    const artwork = window.MRAppState.saveArtwork({
      strokes: [
        [
          { x: 0.26, y: 0.31, t: 0, p: 0.45 },
          { x: 0.42, y: 0.43, t: 16, p: 0.58 },
          { x: 0.56, y: 0.55, t: 32, p: 0.62 },
          { x: 0.72, y: 0.65, t: 48, p: 0.5 }
        ]
      ],
      bounds: { minX: 0.26, minY: 0.31, maxX: 0.72, maxY: 0.65 },
      metrics: { structure: 87, stroke: 85, technique: 86, fluency: 88, force: 83 },
      score: 86,
      feedback: ["E2E 分享远端失败恢复记录"]
    });
    const share = window.MRAppState.createArtworkShareLink(artwork.artwork.id);
    return {
      artworkOk: artwork.ok,
      shareOk: share.ok,
      artworkId: artwork.artwork.id,
      shareId: share.record.id,
      status: window.MRAppState.getShareServiceStatus(artwork.artwork.id)
    };
  });
  expect(seed.artworkOk).toBe(true);
  expect(seed.shareOk).toBe(true);
  expect(seed.status.activeCount).toBe(1);

  await page.goto(`/?artwork=${seed.artworkId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#reviewPanel")).toBeVisible();
  await expect(page.locator("#shareServiceSummary")).toContainText("1 条有效链接");
  await page.locator(".share-remote-panel summary").click();

  const expiredEndpoint = await getSameOriginEndpoint(page, "/e2e-share-repository-expired-token");
  await configureShareRemoteInUi(page, expiredEndpoint, "share-expired-token", "share-retry-e2e");
  await page.locator("#shareRemoteCheckButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 401");
  await expect(page.locator("#shareRemoteStatus")).toContainText("HTTP 401");
  await expect(page.locator("#shareRemoteStatus")).toContainText("失败历史");
  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.lastError).toContain("HTTP 401");
  expect(learningState.shareService.remoteFailureHistory[0].action).toBe("check");
  expect(learningState.shareService.remoteFailureHistory[0].failureKind).toBe("http");
  expect(requests.some((item) => item.path === "/e2e-share-repository-expired-token" && item.authorization === "Bearer share-expired-token" && item.workspaceId === "share-retry-e2e")).toBe(true);

  const invalidJsonEndpoint = await getSameOriginEndpoint(page, "/e2e-share-repository-invalid-json");
  await configureShareRemoteInUi(page, invalidJsonEndpoint, "share-invalid-json-token", "share-retry-e2e");
  await page.locator("#shareRemoteCheckButton").click();
  await expect(page.locator("#noticeState")).toContainText("不是可解析 JSON");
  await expect(page.locator("#shareRemoteStatus")).toContainText("不是可解析 JSON");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.remoteFailureHistory[0].action).toBe("check");
  expect(learningState.shareService.remoteFailureHistory[0].failureKind).toBe("validation");

  const rejectedPushEndpoint = await getSameOriginEndpoint(page, "/e2e-share-repository-rejected-push");
  await configureShareRemoteInUi(page, rejectedPushEndpoint, "share-rejected-push-token", "share-retry-e2e");
  await page.locator("#shareRemotePushButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 422");
  await expect(page.locator("#shareRemoteStatus")).toContainText("HTTP 422");
  await expect(page.locator("#shareRemoteStatus")).toContainText("失败历史");
  await expect(page.locator("#shareRemotePushButton")).toHaveText("重试发布");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.remoteFailureHistory[0].action).toBe("push");
  expect(learningState.shareService.remoteFailureHistory[0].failureKind).toBe("http");
  expect(learningState.shareService.remoteFailureHistory[0].packageDigest).toMatch(/^[a-f0-9]{64}$/);
  const rejectedPutRequest = requests.find((item) => item.path === "/e2e-share-repository-rejected-push" && item.method === "PUT");
  expect(rejectedPutRequest.authorization).toBe("Bearer share-rejected-push-token");
  expect(rejectedPutRequest.workspaceId).toBe("share-retry-e2e");
  expect(rejectedPutRequest.body.kind).toBe("mr-calligraphy-share-repository-v1");
  expect(rejectedPutRequest.body.digestAlgorithm).toBe("sha256-stable-json");
  expect(rejectedPutRequest.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(rejectedPutRequest.body.records[0].id).toBe(seed.shareId);
  expect(learningState.shareService.remoteFailureHistory[0].packageId).toBe(rejectedPutRequest.body.packageId);
  expect(learningState.shareService.remoteFailureHistory[0].packageDigest).toBe(rejectedPutRequest.body.packageDigest);

  const networkPushEndpoint = await getSameOriginEndpoint(page, networkPushPath);
  await configureShareRemoteInUi(page, networkPushEndpoint, "share-network-push-token", "share-retry-e2e");
  await expect(page.locator("#shareRemotePushButton")).toHaveText("重试发布");
  await page.locator("#shareRemotePushButton").click();
  await expect(page.locator("#noticeState")).toContainText("网络请求异常");
  await expect(page.locator("#shareRemoteStatus")).toContainText("网络请求异常");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.remoteFailureHistory[0].action).toBe("push");
  expect(learningState.shareService.remoteFailureHistory[0].failureKind).toBe("network");
  expect(learningState.shareService.remoteFailureHistory[0].endpoint).toContain(networkPushPath);

  const timeoutResult = await page.evaluate(async () => {
    const originalFetch = window.fetch;
    window.fetch = () => new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(new Response(JSON.stringify({
          ok: true,
          message: "分享慢响应 E2E 最终可访问。"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));
      }, 40);
    });
    try {
      return await window.MRAppState.checkRemoteShareService({ timeoutMs: 1, retryDelayMs: 5 });
    } finally {
      window.fetch = originalFetch;
    }
  });
  expect(timeoutResult.ok).toBe(false);
  expect(timeoutResult.message).toContain("请求超时");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.remoteFailureHistory[0].action).toBe("check");
  expect(learningState.shareService.remoteFailureHistory[0].failureKind).toBe("timeout");
  expect(learningState.shareService.remoteRetryAfter).toBeTruthy();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#reviewPanel")).toBeVisible();
  await page.locator(".share-remote-panel summary").click();
  await expect(page.locator("#shareRemoteStatus")).toContainText("请求超时");
  await expect(page.locator("#shareRemotePushButton")).toHaveText("重试发布");

  const recoveryPushEndpoint = await getSameOriginEndpoint(page, recoveryPushPath);
  await configureShareRemoteInUi(page, recoveryPushEndpoint, "share-recovery-token", "share-retry-e2e");
  await expect(page.locator("#shareRemotePushButton")).toHaveText("重试发布");
  await page.locator("#shareRemotePushButton").click();
  await expect(page.locator("#noticeState")).toContainText("已发布作品分享到远端 API");
  await expect(page.locator("#shareRemoteStatus")).toContainText("https://share.example.test/recovered/");
  await expect(page.locator("#shareRemotePushButton")).toHaveText("发布远端");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.lastError).toBe("");
  expect(learningState.shareService.remoteRetryAfter || "").toBe("");
  expect(learningState.shareService.lastRemoteDirection).toBe("push");
  expect(learningState.shareService.lastRemotePushAt).toBeTruthy();
  expect(learningState.shareService.remoteFailureHistory.length).toBeGreaterThanOrEqual(4);
  expect(learningState.shareService.lastReceipt.receiptDigest).toBe(latestPublishReceipt.receiptDigest);
  expect(learningState.shareService.lastReceipt.verificationStatus).toBe("verified");
  expect(learningState.shareService.records[0].remotePublicUrl).toContain("https://share.example.test/recovered/");
  const recoveryStatus = await page.evaluate((artworkId) => window.MRAppState.getShareServiceStatus(artworkId), seed.artworkId);
  expect(recoveryStatus.sharePushRetryPending).toBe(false);
  expect(recoveryStatus.remoteFailureCount).toBeGreaterThanOrEqual(4);

  const recoveryPutRequest = requests.find((item) => item.path === recoveryPushPath && item.method === "PUT");
  expect(recoveryPutRequest.authorization).toBe("Bearer share-recovery-token");
  expect(recoveryPutRequest.workspaceId).toBe("share-retry-e2e");
  expect(recoveryPutRequest.body.summary.workspaceId).toBe("share-retry-e2e");
  expect(recoveryPutRequest.body.digestAlgorithm).toBe("sha256-stable-json");
  expect(recoveryPutRequest.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.shareService.lastPackageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.shareService.lastPackageDigest).not.toBe(recoveryPutRequest.body.packageDigest);

  const rejectedRevokeEndpoint = await getSameOriginEndpoint(page, rejectedRevokePath);
  await configureShareRemoteInUi(page, rejectedRevokeEndpoint, "share-rejected-revoke-token", "share-retry-e2e");
  await page.locator("#shareRemoteRevokeButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 409");
  await expect(page.locator("#shareRemoteStatus")).toContainText("HTTP 409");
  await expect(page.locator("#shareRemoteRevokeButton")).toHaveText("重试撤销");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.remoteFailureHistory[0].action).toBe("revoke");
  expect(learningState.shareService.remoteFailureHistory[0].failureKind).toBe("http");
  expect(learningState.shareService.remoteFailureHistory[0].packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.shareService.remoteFailureHistory[0].publicUrl).toContain("https://share.example.test/recovered/");
  const rejectedDeleteRequest = requests.find((item) => item.path === rejectedRevokePath && item.method === "DELETE");
  expect(rejectedDeleteRequest.authorization).toBe("Bearer share-rejected-revoke-token");
  expect(rejectedDeleteRequest.body.kind).toBe("mr-calligraphy-share-repository-revoke-v1");
  expect(rejectedDeleteRequest.body.shareId).toBe(seed.shareId);

  const recoveryRevokeEndpoint = await getSameOriginEndpoint(page, recoveryRevokePath);
  await configureShareRemoteInUi(page, recoveryRevokeEndpoint, "share-revoke-recovery-token", "share-retry-e2e");
  await expect(page.locator("#shareRemoteRevokeButton")).toHaveText("重试撤销");
  await page.locator("#shareRemoteRevokeButton").click();
  await expect(page.locator("#noticeState")).toContainText("已请求远端撤销作品分享");
  await expect(page.locator("#shareRemoteStatus")).toContainText("已请求远端撤销");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.lastError).toBe("");
  expect(learningState.shareService.remoteRetryAfter || "").toBe("");
  expect(learningState.shareService.lastRemoteDirection).toBe("revoke");
  expect(learningState.shareService.lastRemoteRevokeAt).toBeTruthy();
  expect(learningState.shareService.records[0].remoteRevokedAt).toBeTruthy();
  expect(learningState.shareService.records[0].remoteRevokeReceiptDigest).toBe(latestRevokeReceipt.receiptDigest);
  expect(learningState.shareService.lastReceipt.verificationStatus).toBe("verified");
  expect(learningState.shareService.lastReceipt.verificationAction).toBe("revoke");
  const revokeRecoveryStatus = await page.evaluate((artworkId) => window.MRAppState.getShareServiceStatus(artworkId), seed.artworkId);
  expect(revokeRecoveryStatus.shareRevokeRetryPending).toBe(false);
  const recoveryDeleteRequest = requests.find((item) => item.path === recoveryRevokePath && item.method === "DELETE");
  expect(recoveryDeleteRequest.authorization).toBe("Bearer share-revoke-recovery-token");
  expect(recoveryDeleteRequest.body.shareId).toBe(seed.shareId);
  expect(recoveryDeleteRequest.body.publicUrl).toContain("https://share.example.test/recovered/");
});

test("front report repository shows retryable remote failure recovery", async ({ page }) => {
  const requests = [];
  const networkPushPath = "/e2e-report-repository-network-push";
  const recoveryPushPath = "/e2e-report-repository-recovery-push";
  let latestRecoveryReceipt = null;
  const routes = [
    {
      path: "/e2e-report-repository-expired-token",
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "报告 token 已过期，请重新登录。"
      })
    },
    {
      path: "/e2e-report-repository-server-error",
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "报告仓库服务端 E2E 故障。"
      })
    },
    {
      path: "/e2e-report-repository-invalid-json",
      status: 200,
      contentType: "application/json",
      body: "{not-json"
    },
    {
      path: "/e2e-report-repository-empty-package",
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "远端空报告仓库 E2E 可访问，但没有返回报告包。"
      })
    },
    {
      path: "/e2e-report-repository-rejected-push",
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "报告包结构被 E2E 服务端拒绝。"
      })
    }
  ];

  for (const routeConfig of routes) {
    await page.route(`**${routeConfig.path}`, async (route) => {
      const request = route.request();
      requests.push({
        path: routeConfig.path,
        method: request.method(),
        authorization: request.headers().authorization || "",
        workspaceId: request.headers()["x-mr-workspace-id"] || "",
        body: request.method() === "PUT" ? request.postDataJSON() : null
      });
      await route.fulfill({
        status: routeConfig.status,
        contentType: routeConfig.contentType,
        body: routeConfig.body
      });
    });
  }

  await page.route(`**${networkPushPath}`, async (route) => {
    const request = route.request();
    requests.push({
      path: networkPushPath,
      method: request.method(),
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body: request.method() === "PUT" ? request.postDataJSON() : null
    });
    await route.abort("failed");
  });

  await page.route(`**${recoveryPushPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    requests.push({
      path: recoveryPushPath,
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });

    if (method === "PUT") {
      const acceptedAt = new Date().toISOString();
      const repositoryDigest = sha256StableJson(body);
      latestRecoveryReceipt = {
        receiptKind: "mr-calligraphy-report-repository-receipt-v1",
        remoteVersion: "e2e-report-recovery-v1",
        packageId: "e2e-report-recovered-package",
        sourcePackageId: body.packageId,
        workspaceId: body.workspaceId,
        repositoryDigest,
        acceptedAt,
        reportCount: body.summary.total,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          sourcePackageId: body.packageId,
          workspaceId: body.workspaceId,
          repositoryDigest,
          acceptedAt
        }),
        signatureAlgorithm: "HMAC-SHA256",
        signingKeyId: "e2e-report-recovery-signing-key-v1",
        signedFields: ["receiptKind", "packageId", "sourcePackageId", "workspaceId", "repositoryDigest", "acceptedAt", "reportCount", "receiptDigest"],
        signature: "d".repeat(64)
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `报告仓库恢复端 E2E 已接收 ${body.summary.total} 份报告。`,
          remoteVersion: "e2e-report-recovery-v1",
          packageId: latestRecoveryReceipt.packageId,
          receipt: latestRecoveryReceipt
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "报告仓库恢复端 E2E 可访问。"
      })
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  const reportDownloadPromise = page.waitForEvent("download");
  const seed = await page.evaluate(() => {
    const artwork = window.MRAppState.saveArtwork({
      strokes: [
        [
          { x: 0.28, y: 0.34, t: 0, p: 0.45 },
          { x: 0.42, y: 0.43, t: 16, p: 0.58 },
          { x: 0.57, y: 0.52, t: 32, p: 0.62 },
          { x: 0.71, y: 0.61, t: 48, p: 0.5 }
        ]
      ],
      bounds: { minX: 0.28, minY: 0.34, maxX: 0.71, maxY: 0.61 },
      metrics: { structure: 86, stroke: 84, technique: 85, fluency: 88, force: 82 },
      score: 85,
      feedback: ["E2E 报告仓库失败恢复记录"]
    });
    const report = window.MRAppState.createReport();
    return {
      artworkOk: artwork.ok,
      reportOk: report.ok,
      reportId: report.report.id,
      status: window.MRAppState.getReportRepositoryStatus()
    };
  });
  await reportDownloadPromise;
  expect(seed.artworkOk).toBe(true);
  expect(seed.reportOk).toBe(true);
  expect(seed.status.reportCount).toBe(1);

  await page.goto(`/?report=${seed.reportId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#reportPanel")).toBeVisible();
  await page.locator(".report-repository-remote summary").click();

  const expiredEndpoint = await getSameOriginEndpoint(page, "/e2e-report-repository-expired-token");
  await configureReportRepositoryRemoteInUi(page, expiredEndpoint, "report-expired-token");
  await page.locator("#reportRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 401");
  await expect(page.locator("#reportRepositorySummary")).toContainText("HTTP 401");
  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastError).toContain("HTTP 401");
  expect(requests.some((item) => item.path === "/e2e-report-repository-expired-token" && item.authorization === "Bearer report-expired-token")).toBe(true);
  expect(requests.some((item) => item.path === "/e2e-report-repository-expired-token" && item.workspaceId === "local-browser")).toBe(true);

  const serverErrorEndpoint = await getSameOriginEndpoint(page, "/e2e-report-repository-server-error");
  await configureReportRepositoryRemoteInUi(page, serverErrorEndpoint, "report-server-error-token");
  await page.locator("#reportRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 500");
  await expect(page.locator("#reportRepositorySummary")).toContainText("HTTP 500");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastError).toContain("HTTP 500");

  const invalidJsonEndpoint = await getSameOriginEndpoint(page, "/e2e-report-repository-invalid-json");
  await configureReportRepositoryRemoteInUi(page, invalidJsonEndpoint, "report-invalid-json-token");
  await page.locator("#reportRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("不是可解析 JSON");
  await expect(page.locator("#reportRepositorySummary")).toContainText("不是可解析 JSON");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastError).toContain("不是可解析 JSON");

  const emptyPackageEndpoint = await getSameOriginEndpoint(page, "/e2e-report-repository-empty-package");
  await configureReportRepositoryRemoteInUi(page, emptyPackageEndpoint, "report-empty-package-token");
  await page.locator("#reportRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("远端空报告仓库 E2E 可访问");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastError).toBe("");
  expect(learningState.reportRepository.lastRemoteStatus).toContain("远端空报告仓库 E2E 可访问");

  await page.locator("#reportRepositoryPullButton").click();
  await expect(page.locator("#noticeState")).toContainText("没有返回可导入的报告包");
  await expect(page.locator("#reportRepositorySummary")).toContainText("没有返回可导入的报告包");
  await expect(page.locator("#reportRepositorySummary")).toContainText("失败历史");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastError).toContain("没有返回可导入的报告包");
  expect(learningState.reportRepository.remoteFailureHistory[0].action).toBe("pull");
  expect(learningState.reportRepository.remoteFailureHistory[0].failureKind).toBe("response");
  expect(requests.some((item) => item.path === "/e2e-report-repository-empty-package" && item.authorization === "Bearer report-empty-package-token")).toBe(true);

  const rejectedPushEndpoint = await getSameOriginEndpoint(page, "/e2e-report-repository-rejected-push");
  await configureReportRepositoryRemoteInUi(page, rejectedPushEndpoint, "report-rejected-push-token");
  await page.locator("#reportRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 422");
  await expect(page.locator("#reportRepositorySummary")).toContainText("HTTP 422");
  await expect(page.locator("#reportRepositorySummary")).toContainText("失败历史");
  await expect(page.locator("#reportRepositoryPushButton")).toHaveText("重试推送");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastError).toContain("HTTP 422");
  expect(learningState.reportRepository.remoteRetryAfter).toBeTruthy();
  expect(learningState.reportRepository.remoteFailureHistory[0].action).toBe("push");
  expect(learningState.reportRepository.remoteFailureHistory[0].failureKind).toBe("http");

  const putRequest = requests.find((item) => item.path === "/e2e-report-repository-rejected-push" && item.method === "PUT");
  expect(putRequest.authorization).toBe("Bearer report-rejected-push-token");
  expect(putRequest.workspaceId).toBe("local-browser");
  expect(putRequest.body.kind).toBe("mr-calligraphy-report-repository-v1");
  expect(putRequest.body.workspaceId).toBe("local-browser");
  expect(putRequest.body.digestAlgorithm).toBe("sha256-stable-json");
  expect(putRequest.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(putRequest.body.summary.total).toBe(1);
  expect(learningState.reportRepository.remoteFailureHistory[0].packageId).toBe(putRequest.body.packageId);
  expect(learningState.reportRepository.remoteFailureHistory[0].packageDigest).toBe(putRequest.body.packageDigest);

  const networkPushEndpoint = await getSameOriginEndpoint(page, networkPushPath);
  await configureReportRepositoryRemoteInUi(page, networkPushEndpoint, "report-network-push-token");
  await expect(page.locator("#reportRepositoryPushButton")).toHaveText("重试推送");
  await page.locator("#reportRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("网络请求异常");
  await expect(page.locator("#reportRepositorySummary")).toContainText("网络请求异常");
  await expect(page.locator("#reportRepositorySummary")).toContainText("失败历史");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.remoteFailureHistory[0].action).toBe("push");
  expect(learningState.reportRepository.remoteFailureHistory[0].failureKind).toBe("network");
  expect(learningState.reportRepository.remoteFailureHistory[0].endpoint).toContain(networkPushPath);
  expect(requests.some((item) => item.path === networkPushPath && item.method === "PUT" && item.authorization === "Bearer report-network-push-token")).toBe(true);

  const timeoutResult = await page.evaluate(async () => {
    const originalFetch = window.fetch;
    window.fetch = () => new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(new Response(JSON.stringify({
          ok: true,
          message: "报告仓库慢响应 E2E 最终可访问。"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));
      }, 40);
    });
    try {
      return await window.MRAppState.checkRemoteReportRepository({ timeoutMs: 1, retryDelayMs: 5 });
    } finally {
      window.fetch = originalFetch;
    }
  });
  expect(timeoutResult.ok).toBe(false);
  expect(timeoutResult.message).toContain("请求超时");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.remoteFailureHistory[0].action).toBe("check");
  expect(learningState.reportRepository.remoteFailureHistory[0].failureKind).toBe("timeout");
  expect(learningState.reportRepository.remoteRetryAfter).toBeTruthy();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#reportPanel")).toBeVisible();
  await page.locator(".report-repository-remote summary").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("请求超时");
  await expect(page.locator("#reportRepositoryPushButton")).toHaveText("重试推送");

  const recoveryPushEndpoint = await getSameOriginEndpoint(page, recoveryPushPath);
  await configureReportRepositoryRemoteInUi(page, recoveryPushEndpoint, "report-recovery-token");
  await expect(page.locator("#reportRepositoryPushButton")).toHaveText("重试推送");
  await page.locator("#reportRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("已推送 1 份报告");
  await expect(page.locator("#reportRepositorySummary")).toContainText("已推送 1 份报告");
  await expect(page.locator("#reportRepositoryPushButton")).toHaveText("推送报告");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastError).toBe("");
  expect(learningState.reportRepository.remoteRetryAfter || "").toBe("");
  expect(learningState.reportRepository.lastRemoteDirection).toBe("push");
  expect(learningState.reportRepository.lastRemotePushAt).toBeTruthy();
  expect(learningState.reportRepository.remoteFailureHistory.length).toBeGreaterThanOrEqual(5);
  expect(learningState.reportRepository.lastSignedReceipt.receiptDigest).toBe(latestRecoveryReceipt.receiptDigest);
  expect(learningState.reportRepository.lastSignedReceipt.verificationStatus).toBe("verified");
  const recoveryStatus = await page.evaluate(() => window.MRAppState.getReportRepositoryStatus());
  expect(recoveryStatus.reportPushRetryPending).toBe(false);
  expect(recoveryStatus.remoteFailureCount).toBeGreaterThanOrEqual(5);

  const recoveryPutRequest = requests.find((item) => item.path === recoveryPushPath && item.method === "PUT");
  expect(recoveryPutRequest.authorization).toBe("Bearer report-recovery-token");
  expect(recoveryPutRequest.workspaceId).toBe("local-browser");
  expect(recoveryPutRequest.body.kind).toBe("mr-calligraphy-report-repository-v1");
  expect(recoveryPutRequest.body.summary.total).toBe(1);
});

test("front history repository shows real remote failure feedback", async ({ page }) => {
  const requests = [];
  const networkPushPath = "/e2e-history-repository-network-push";
  const recoveryPushPath = "/e2e-history-repository-recovery-push";
  let latestRecoveryReceipt = null;
  const routes = [
    {
      path: "/e2e-history-repository-expired-token",
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "学习档案 token 已过期，请重新登录。"
      })
    },
    {
      path: "/e2e-history-repository-server-error",
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "学习档案服务端 E2E 故障。"
      })
    },
    {
      path: "/e2e-history-repository-invalid-json",
      status: 200,
      contentType: "application/json",
      body: "{not-json"
    },
    {
      path: "/e2e-history-repository-empty-package",
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "远端空学习档案 E2E 可访问，但没有返回档案包。"
      })
    },
    {
      path: "/e2e-history-repository-rejected-push",
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "学习档案包结构被 E2E 服务端拒绝。"
      })
    }
  ];

  for (const routeConfig of routes) {
    await page.route(`**${routeConfig.path}`, async (route) => {
      const request = route.request();
      requests.push({
        path: routeConfig.path,
        method: request.method(),
        authorization: request.headers().authorization || "",
        workspaceId: request.headers()["x-mr-workspace-id"] || "",
        body: request.method() === "PUT" ? request.postDataJSON() : null
      });
      await route.fulfill({
        status: routeConfig.status,
        contentType: routeConfig.contentType,
        body: routeConfig.body
      });
    });
  }

  await page.route(`**${networkPushPath}`, async (route) => {
    const request = route.request();
    requests.push({
      path: networkPushPath,
      method: request.method(),
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body: request.method() === "PUT" ? request.postDataJSON() : null
    });
    await route.abort("failed");
  });

  await page.route(`**${recoveryPushPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    requests.push({
      path: recoveryPushPath,
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });

    if (method === "PUT") {
      const acceptedAt = new Date().toISOString();
      const repositoryDigest = sha256StableJson(body);
      latestRecoveryReceipt = {
        receiptKind: "mr-calligraphy-history-repository-receipt-v1",
        remoteVersion: "e2e-history-recovery-v1",
        workspaceId: body.workspaceId,
        packageId: "e2e-history-recovered-package",
        sourcePackageId: body.packageId,
        repositoryDigest,
        acceptedAt,
        recordCount: body.summary.total,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          sourcePackageId: body.packageId,
          workspaceId: body.workspaceId,
          repositoryDigest,
          acceptedAt
        })
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `学习档案恢复端 E2E 已接收 ${body.summary.total} 条档案。`,
          remoteVersion: "e2e-history-recovery-v1",
          packageId: latestRecoveryReceipt.packageId,
          receipt: latestRecoveryReceipt
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "学习档案恢复端 E2E 可访问。"
      })
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  const seed = await page.evaluate(() => {
    const result = window.MRAppState.saveArtwork({
      strokes: [
        [
          { x: 0.28, y: 0.34, t: 0, p: 0.45 },
          { x: 0.42, y: 0.43, t: 16, p: 0.58 },
          { x: 0.57, y: 0.52, t: 32, p: 0.62 },
          { x: 0.71, y: 0.61, t: 48, p: 0.5 }
        ]
      ],
      bounds: { minX: 0.28, minY: 0.34, maxX: 0.71, maxY: 0.61 },
      metrics: { structure: 86, stroke: 84, technique: 85, fluency: 88, force: 82 },
      score: 85,
      feedback: ["E2E 学习档案失败路径记录"]
    });
    return {
      ok: result.ok,
      status: window.MRAppState.getHistoryRepositoryStatus()
    };
  });
  expect(seed.ok).toBe(true);
  expect(seed.status.recordCount).toBe(2);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#historyPanel")).toBeVisible();
  await page.locator(".history-repository-remote summary").click();

  const expiredEndpoint = await getSameOriginEndpoint(page, "/e2e-history-repository-expired-token");
  await configureHistoryRepositoryRemoteInUi(page, expiredEndpoint, "history-expired-token");
  await page.locator("#historyRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 401");
  await expect(page.locator("#historyRepositorySummary")).toContainText("HTTP 401");
  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toContain("HTTP 401");
  expect(requests.some((item) => item.path === "/e2e-history-repository-expired-token" && item.authorization === "Bearer history-expired-token")).toBe(true);
  expect(requests.some((item) => item.path === "/e2e-history-repository-expired-token" && item.workspaceId === "local-browser")).toBe(true);

  const serverErrorEndpoint = await getSameOriginEndpoint(page, "/e2e-history-repository-server-error");
  await configureHistoryRepositoryRemoteInUi(page, serverErrorEndpoint, "history-server-error-token");
  await page.locator("#historyRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 500");
  await expect(page.locator("#historyRepositorySummary")).toContainText("HTTP 500");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toContain("HTTP 500");

  const invalidJsonEndpoint = await getSameOriginEndpoint(page, "/e2e-history-repository-invalid-json");
  await configureHistoryRepositoryRemoteInUi(page, invalidJsonEndpoint, "history-invalid-json-token");
  await page.locator("#historyRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("不是可解析 JSON");
  await expect(page.locator("#historyRepositorySummary")).toContainText("不是可解析 JSON");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toContain("不是可解析 JSON");

  const emptyPackageEndpoint = await getSameOriginEndpoint(page, "/e2e-history-repository-empty-package");
  await configureHistoryRepositoryRemoteInUi(page, emptyPackageEndpoint, "history-empty-package-token");
  await page.locator("#historyRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("远端空学习档案 E2E 可访问");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toBe("");
  expect(learningState.historyRepository.lastRemoteStatus).toContain("远端空学习档案 E2E 可访问");

  await page.locator("#historyRepositoryPullButton").click();
  await expect(page.locator("#noticeState")).toContainText("没有返回可导入的档案包");
  await expect(page.locator("#historyRepositorySummary")).toContainText("没有返回可导入的档案包");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toContain("没有返回可导入的档案包");
  expect(requests.some((item) => item.path === "/e2e-history-repository-empty-package" && item.authorization === "Bearer history-empty-package-token")).toBe(true);

  const rejectedPushEndpoint = await getSameOriginEndpoint(page, "/e2e-history-repository-rejected-push");
  await configureHistoryRepositoryRemoteInUi(page, rejectedPushEndpoint, "history-rejected-push-token");
  await page.locator("#historyRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 422");
  await expect(page.locator("#historyRepositorySummary")).toContainText("HTTP 422");
  await expect(page.locator("#historyRepositorySummary")).toContainText("失败历史");
  await expect(page.locator("#historyRepositoryPushButton")).toHaveText("重试推送");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toContain("HTTP 422");
  expect(learningState.historyRepository.remoteRetryAfter).toBeTruthy();
  expect(learningState.historyRepository.remoteFailureHistory[0].action).toBe("push");
  expect(learningState.historyRepository.remoteFailureHistory[0].failureKind).toBe("http");

  const putRequest = requests.find((item) => item.path === "/e2e-history-repository-rejected-push" && item.method === "PUT");
  expect(putRequest.authorization).toBe("Bearer history-rejected-push-token");
  expect(putRequest.workspaceId).toBe("local-browser");
  expect(putRequest.body.kind).toBe("mr-calligraphy-history-repository-v1");
  expect(putRequest.body.workspaceId).toBe("local-browser");
  expect(putRequest.body.summary.total).toBe(2);
  expect(learningState.historyRepository.remoteFailureHistory[0].packageId).toBe(putRequest.body.packageId);
  expect(learningState.historyRepository.remoteFailureHistory[0].packageDigest).toMatch(/^[a-f0-9]{64}$/);

  const networkPushEndpoint = await getSameOriginEndpoint(page, networkPushPath);
  await configureHistoryRepositoryRemoteInUi(page, networkPushEndpoint, "history-network-push-token");
  await expect(page.locator("#historyRepositoryPushButton")).toHaveText("重试推送");
  await page.locator("#historyRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("网络请求异常");
  await expect(page.locator("#historyRepositorySummary")).toContainText("网络请求异常");
  await expect(page.locator("#historyRepositorySummary")).toContainText("失败历史");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.remoteFailureHistory[0].action).toBe("push");
  expect(learningState.historyRepository.remoteFailureHistory[0].failureKind).toBe("network");
  expect(learningState.historyRepository.remoteFailureHistory[0].endpoint).toContain(networkPushPath);
  expect(requests.some((item) => item.path === networkPushPath && item.method === "PUT" && item.authorization === "Bearer history-network-push-token")).toBe(true);

  const timeoutResult = await page.evaluate(async () => {
    const originalFetch = window.fetch;
    window.fetch = () => new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(new Response(JSON.stringify({
          ok: true,
          message: "学习档案慢响应 E2E 最终可访问。"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));
      }, 40);
    });
    try {
      return await window.MRAppState.checkRemoteHistoryRepository({ timeoutMs: 1, retryDelayMs: 5 });
    } finally {
      window.fetch = originalFetch;
    }
  });
  expect(timeoutResult.ok).toBe(false);
  expect(timeoutResult.message).toContain("请求超时");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.remoteFailureHistory[0].action).toBe("check");
  expect(learningState.historyRepository.remoteFailureHistory[0].failureKind).toBe("timeout");
  expect(learningState.historyRepository.remoteRetryAfter).toBeTruthy();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#historyPanel")).toBeVisible();
  await page.locator(".history-repository-remote summary").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("请求超时");
  await expect(page.locator("#historyRepositoryPushButton")).toHaveText("重试推送");

  const recoveryPushEndpoint = await getSameOriginEndpoint(page, recoveryPushPath);
  await configureHistoryRepositoryRemoteInUi(page, recoveryPushEndpoint, "history-recovery-token");
  await expect(page.locator("#historyRepositoryPushButton")).toHaveText("重试推送");
  await page.locator("#historyRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("已推送 2 条学习档案");
  await expect(page.locator("#historyRepositorySummary")).toContainText("已推送 2 条学习档案");
  await expect(page.locator("#historyRepositoryPushButton")).toHaveText("推送档案");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toBe("");
  expect(learningState.historyRepository.remoteRetryAfter || "").toBe("");
  expect(learningState.historyRepository.lastRemoteDirection).toBe("push");
  expect(learningState.historyRepository.lastRemotePushAt).toBeTruthy();
  expect(learningState.historyRepository.remoteFailureHistory.length).toBeGreaterThanOrEqual(3);
  expect(learningState.historyRepository.lastReceipt.receiptDigest).toBe(latestRecoveryReceipt.receiptDigest);
  expect(learningState.historyRepository.lastReceipt.verificationStatus).toBe("verified");
  const recoveryStatus = await page.evaluate(() => window.MRAppState.getHistoryRepositoryStatus());
  expect(recoveryStatus.historyPushRetryPending).toBe(false);
  expect(recoveryStatus.remoteFailureCount).toBeGreaterThanOrEqual(3);

  const recoveryPutRequest = requests.find((item) => item.path === recoveryPushPath && item.method === "PUT");
  expect(recoveryPutRequest.authorization).toBe("Bearer history-recovery-token");
  expect(recoveryPutRequest.workspaceId).toBe("local-browser");
  expect(recoveryPutRequest.body.kind).toBe("mr-calligraphy-history-repository-v1");
  expect(recoveryPutRequest.body.summary.total).toBe(2);
});

test("front history repository handles network, paged pull, and id conflicts", async ({ page }) => {
  const networkPath = "/e2e-history-repository-network";
  const pagedPath = "/e2e-history-repository-paged-conflict";
  const requests = [];
  let remotePackages = null;

  await page.route(`**${networkPath}`, async (route) => {
    const request = route.request();
    requests.push({
      path: networkPath,
      method: request.method(),
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || ""
    });
    await route.abort("failed");
  });

  await page.route(`**${pagedPath}**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pageNumber = url.searchParams.get("page") || "1";
    requests.push({
      path: pagedPath,
      page: pageNumber,
      method: request.method(),
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || ""
    });
    const isSecondPage = pageNumber === "2";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: isSecondPage
          ? "远端分页学习档案 E2E 返回第 2 页。"
          : "远端分页学习档案 E2E 返回第 1 页。",
        pagination: isSecondPage
          ? {
              page: 2,
              pageSize: 1,
              total: 3,
              hasMore: false
            }
          : {
              page: 1,
              pageSize: 2,
              total: 3,
              hasMore: true,
              nextPageUrl: "/e2e-history-repository-paged-conflict?page=2"
            },
        package: isSecondPage ? remotePackages?.pageTwo : remotePackages?.pageOne
      })
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  const seed = await page.evaluate(() => {
    const result = window.MRAppState.saveArtwork({
      strokes: [
        [
          { x: 0.2, y: 0.32, t: 0, p: 0.42 },
          { x: 0.39, y: 0.45, t: 18, p: 0.55 },
          { x: 0.55, y: 0.57, t: 36, p: 0.62 },
          { x: 0.72, y: 0.68, t: 54, p: 0.48 }
        ]
      ],
      bounds: { minX: 0.2, minY: 0.32, maxX: 0.72, maxY: 0.68 },
      metrics: { structure: 83, stroke: 82, technique: 84, fluency: 86, force: 80 },
      score: 83,
      feedback: ["E2E 学习档案分页冲突本机记录"]
    });
    const repositoryPackage = window.MRAppState.getHistoryRepositoryPackage().package;
    return {
      ok: result.ok,
      package: repositoryPackage,
      sessionId: repositoryPackage.records.sessions[0].id
    };
  });
  expect(seed.ok).toBe(true);

  remotePackages = createPagedHistoryConflictPackages(seed.package, seed.sessionId);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#historyPanel")).toBeVisible();
  await page.locator(".history-repository-remote summary").click();

  const networkEndpoint = await getSameOriginEndpoint(page, networkPath);
  await configureHistoryRepositoryRemoteInUi(page, networkEndpoint, "history-network-token");
  await page.locator("#historyRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("网络请求异常");
  await expect(page.locator("#historyRepositorySummary")).toContainText("网络请求异常");
  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toContain("网络请求异常");
  expect(requests.some((item) => item.path === networkPath && item.authorization === "Bearer history-network-token" && item.workspaceId === "local-browser")).toBe(true);

  const pagedEndpoint = await getSameOriginEndpoint(page, pagedPath);
  await configureHistoryRepositoryRemoteInUi(page, pagedEndpoint, "history-paged-token");
  await page.locator("#historyRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("后续页面");
  await expect(page.locator("#historyRepositorySummary")).toContainText("分页");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toBe("");
  expect(learningState.historyRepository.lastRemoteStatus).toContain("后续页面");
  expect(learningState.historyRepository.lastRemoteRecordCount).toBe(2);

  await page.locator("#historyRepositoryPullButton").click();
  await expect(page.locator("#noticeState")).toContainText("2 页");
  await expect(page.locator("#noticeState")).toContainText("跳过 1 条同 ID 差异记录");
  await expect(page.locator("#historyRepositorySummary")).toContainText("同 ID 差异记录已跳过");
  await expect(page.locator("#historyRepositoryConflictPanel")).toBeVisible();
  await expect(page.locator("#historyRepositoryConflictList")).toContainText("远端同 ID 差异记录不应覆盖本机");
  await expect(page.locator("#historyRepositoryConflictList")).toContainText("应用字段合并");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastSkippedConflictCount).toBe(1);
  expect(learningState.historyRepository.lastError).toContain("同 ID 差异");
  expect(learningState.historyRepository.lastConflictRecords).toHaveLength(1);
  expect(learningState.historyRepository.lastConflictRecords[0].fieldDiffs.length).toBeGreaterThan(0);
  expect(learningState.historyRepository.lastRemoteRecordCount).toBe(3);
  expect(learningState.sessions).toHaveLength(3);
  expect(learningState.sessions.some((session) => session.id === "remote-paged-session")).toBe(true);
  expect(learningState.sessions.some((session) => session.id === "remote-paged-session-2")).toBe(true);
  const originalSession = learningState.sessions.find((session) => session.id === seed.sessionId);
  expect(originalSession.feedback).toContain("E2E 学习档案分页冲突本机记录");
  expect(originalSession.feedback).not.toContain("远端同 ID 差异记录不应覆盖本机");
  expect(requests.some((item) => item.path === pagedPath && item.method === "GET" && item.authorization === "Bearer history-paged-token" && item.workspaceId === "local-browser")).toBe(true);
  expect(requests.some((item) => item.path === pagedPath && item.page === "2" && item.authorization === "Bearer history-paged-token" && item.workspaceId === "local-browser")).toBe(true);

  const conflictPanel = page.locator("#historyRepositoryConflictPanel");
  await conflictPanel.locator('input[data-history-merge-field="feedback"][value="remote"]').check();
  await conflictPanel.locator("[data-history-conflict-action='merge-fields']").click();
  await expect(page.locator("#noticeState")).toContainText("字段合并");
  await expect(page.locator("#historyRepositoryConflictPanel")).toBeHidden();
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastConflictRecords).toHaveLength(0);
  expect(learningState.historyRepository.lastSkippedConflictCount).toBe(0);
  expect(learningState.sessions).toHaveLength(3);
  const mergedSession = learningState.sessions.find((session) => session.id === seed.sessionId);
  expect(mergedSession.score).toBe(83);
  expect(mergedSession.feedback).toContain("远端同 ID 差异记录不应覆盖本机");
  expect(mergedSession.feedback).not.toContain("E2E 学习档案分页冲突本机记录");
});

test("front plan repository detects remote conflicts and saves a remote copy", async ({ page }) => {
  const planEndpointPath = "/e2e-plan-repository";
  const planRequests = [];
  let remotePlanPackage = null;
  let latestPlanReceipt = null;

  await page.route(`**${planEndpointPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    planRequests.push({
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });

    if (method === "PUT") {
      const acceptedAt = new Date().toISOString();
      const repositoryDigest = "d".repeat(64);
      remotePlanPackage = withPackageDigest(cloneJson({
        ...body,
        packageId: "e2e-plan-package",
        acceptedAt
      }));
      latestPlanReceipt = {
        receiptKind: "mr-calligraphy-plan-repository-receipt-v1",
        remoteVersion: "e2e-plan-v1",
        workspaceId: body.workspaceId,
        packageId: remotePlanPackage.packageId,
        sourcePackageId: body.packageId,
        repositoryDigest,
        acceptedAt,
        planCount: body.summary.planCount,
        warningCount: 0,
        warnings: [],
        receiptDigest: sha256StableJson({
          sourcePackageId: body.packageId,
          workspaceId: body.workspaceId,
          repositoryDigest,
          acceptedAt
        })
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `远端计划 E2E 已接收 ${body.summary.planCount} 份计划。`,
          remoteVersion: "e2e-plan-v1",
          packageId: remotePlanPackage.packageId,
          package: remotePlanPackage,
          receipt: latestPlanReceipt
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: remotePlanPackage
          ? `远端计划 E2E 可读，当前包含 ${remotePlanPackage.summary.planCount} 份计划。`
          : "远端计划 E2E 可访问，当前尚未接收计划包。",
        remoteVersion: "e2e-plan-v1",
        package: remotePlanPackage,
        latestReceipt: latestPlanReceipt
      })
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  const planEndpoint = await getSameOriginEndpoint(page, planEndpointPath);
  const seedPlan = await page.evaluate(() => {
    const created = window.MRAppState.createPlan();
    return {
      id: created.plan.id,
      itemId: created.plan.items[0].id,
      title: created.plan.title
    };
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#planPanel")).toBeVisible();
  await expect(page.locator("#planTitle")).toContainText(seedPlan.title);

  await page.locator(".plan-repository-remote summary").click();
  await page.locator("#planRepositoryEndpointInput").fill(planEndpoint);
  await page.locator("#planRepositoryTokenInput").fill("plan-token");
  await page.locator("#planRepositoryWorkspaceInput").fill("class-e2e");
  await page.locator("#planRepositorySaveRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端计划 API 配置");

  await page.evaluate((endpoint) => {
    window.MRAppState.configurePlanRepositoryRemote({
      remoteEndpoint: endpoint,
      remoteToken: "plan-token",
      workspaceId: "class-e2e",
      autoSyncEnabled: false
    });
  }, planEndpoint);

  await page.locator("#planRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("E2E 可访问");

  await page.locator("#planRepositoryPushButton").click();
  await expect(page.locator("#planRepositorySummary")).toContainText("已推送 1 份计划");
  await expect(page.locator("#planRepositoryReceiptStatus")).toContainText("已保存 1 条计划仓库回执");
  await expect(page.locator("#planRepositoryReceiptStatus")).toContainText("本机校验通过 1 条");
  await expect(page.locator("#planRepositoryReceiptList")).toContainText("e2e-plan-package");
  await expect(page.locator("#planRepositoryReceiptList")).toContainText("仓库 dddddddddddd");
  await expect(page.locator("#planRepositoryReceiptList")).toContainText("本机校验通过");

  const putRequest = planRequests.find((item) => item.method === "PUT");
  expect(putRequest.authorization).toBe("Bearer plan-token");
  expect(putRequest.workspaceId).toBe("class-e2e");
  expect(putRequest.body.kind).toBe("mr-calligraphy-plan-repository-v1");
  expect(putRequest.body.workspaceId).toBe("class-e2e");
  expect(putRequest.body.digestAlgorithm).toBe("sha256-stable-json");
  expect(putRequest.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(putRequest.body.summary.planCount).toBe(1);
  expect(putRequest.body.plans[0].id).toBe(seedPlan.id);

  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.receipts).toHaveLength(1);
  expect(learningState.planRepository.lastPackageDigest).toBe(remotePlanPackage.packageDigest);
  expect(learningState.planRepository.receipts[0].receiptDigest).toBe(latestPlanReceipt.receiptDigest);
  expect(learningState.planRepository.receipts[0].verificationStatus).toBe("verified");
  expect(learningState.planRepository.receipts[0].verificationExpectedDigest).toBe(latestPlanReceipt.receiptDigest);
  expect(learningState.planRepository.receipts[0].direction).toBe("push");
  expect(learningState.planRepository.receipts[0].workspaceId).toBe("class-e2e");
  expect(learningState.planRepository.workspaceId).toBe("class-e2e");

  const planReceiptDownloadPromise = page.waitForEvent("download");
  await page.locator("#planRepositoryReceiptExportButton").click();
  const planReceiptDownload = await planReceiptDownloadPromise;
  expect(planReceiptDownload.suggestedFilename()).toMatch(/^mr-calligraphy-plan-repository-receipts-.*\.html$/);
  const planReceiptPath = await planReceiptDownload.path();
  const planReceiptHtml = fs.readFileSync(planReceiptPath, "utf8");
  expect(planReceiptHtml).toContain("MR 书法计划仓库回执审计");
  expect(planReceiptHtml).toContain(latestPlanReceipt.receiptDigest);
  expect(planReceiptHtml).toContain("本机校验通过");
  expect(planReceiptHtml).toContain("重算摘要");

  const remoteUpdatedAt = new Date(Date.now() + 60000).toISOString();
  remotePlanPackage = withPackageDigest(cloneJson({
    ...remotePlanPackage,
    packageId: "e2e-plan-package-conflict",
    exportedAt: remoteUpdatedAt,
    plans: remotePlanPackage.plans.map((plan) => {
      if (plan.id !== seedPlan.id) return plan;
      return {
        ...plan,
        title: "远端冲突计划",
        updatedAt: remoteUpdatedAt,
        items: plan.items.map((item, index) => index === 0
          ? {
              ...item,
              title: "远端冲突任务",
              detail: "远端也修改了第一项任务，等待本机选择处理策略。"
            }
          : item)
      };
    })
  }));

  await page.waitForTimeout(25);
  const localEdit = await page.evaluate(({ planId, itemId }) => {
    const result = window.MRAppState.updatePlanItem(planId, itemId, {
      title: "本机冲突任务",
      detail: "本机也修改了第一项任务，应该触发远端冲突提示。"
    });
    return {
      ok: result.ok,
      status: window.MRAppState.getPlanRepositoryStatus()
    };
  }, { planId: seedPlan.id, itemId: seedPlan.itemId });
  expect(localEdit.ok).toBe(true);
  expect(localEdit.status.pendingAutoSync).toBe(true);

  await page.locator("#planRepositoryPullButton").click();
  await expect(page.locator("#planRepositoryConflictPanel")).toBeVisible();
  await expect(page.locator("#planRepositoryConflictStatus")).toContainText("1 份计划");
  await expect(page.locator("#planRepositoryConflictList")).toContainText(seedPlan.title);
  await expect(page.locator("#planRepositoryConflictList")).toContainText("远端冲突");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastSyncConflictCount).toBe(1);
  expect(learningState.planRepository.lastSyncConflictPlans[0].title).toBe("远端冲突计划");

  await page.locator("#planRepositoryCopyRemoteButton").click();
  await expect(page.locator("#planRepositoryConflictPanel")).toBeHidden();
  await expect(page.locator("#planRepositorySummary")).toContainText("远端冲突计划另存为本机副本");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.plans).toHaveLength(2);
  expect(learningState.plans.some((plan) => plan.title.includes("远端冲突计划") && plan.title.includes("远端副本"))).toBe(true);
  expect(learningState.planRepository.lastSyncConflictCount).toBe(0);
  expect(learningState.planRepository.pendingAutoSync).toBe(true);
  expect(planRequests.some((item) => item.method === "GET" && item.authorization === "Bearer plan-token")).toBe(true);
});

test("front plan repository keeps local changes when resolving a conflict", async ({ page }) => {
  const conflict = await setupPlanRepositoryConflict(page, {
    endpointPath: "/e2e-plan-repository-keep-local",
    token: "keep-local-token",
    remoteTitle: "远端保留策略计划",
    remoteItemTitle: "远端保留策略任务",
    remoteItemDetail: "远端版本不应覆盖选择保留本机后的计划项。",
    localItemTitle: "浏览器保留本机任务",
    localItemDetail: "选择保留本机后，这条任务应继续留在本机并推送到远端。"
  });

  await page.locator("#planRepositoryKeepLocalButton").click();
  await expect(page.locator("#planRepositoryConflictPanel")).toBeHidden();
  await expect(page.locator("#planRepositorySummary")).toContainText("已推送 1 份计划");

  const learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  const plan = learningState.plans.find((item) => item.id === conflict.seedPlan.id);
  expect(plan.items[0].title).toBe("浏览器保留本机任务");
  expect(learningState.planRepository.lastSyncConflictCount).toBe(0);
  expect(learningState.planRepository.pendingAutoSync).toBe(false);
  expect(learningState.planRepository.lastRemoteDirection).toBe("push");

  const lastPut = conflict.planRequests.filter((item) => item.method === "PUT").at(-1);
  expect(lastPut.authorization).toBe("Bearer keep-local-token");
  expect(lastPut.body.plans[0].items[0].title).toBe("浏览器保留本机任务");
  expect(conflict.getRemotePlanPackage().plans[0].items[0].title).toBe("浏览器保留本机任务");
});

test("front plan repository applies remote changes when resolving a conflict", async ({ page }) => {
  const conflict = await setupPlanRepositoryConflict(page, {
    endpointPath: "/e2e-plan-repository-use-remote",
    token: "use-remote-token",
    remoteTitle: "浏览器采用远端计划",
    remoteItemTitle: "浏览器采用远端任务",
    remoteItemDetail: "采用远端后，这条远端任务应覆盖本机冲突项。",
    localItemTitle: "本机即将被远端覆盖",
    localItemDetail: "选择采用远端后，这条本机任务应被远端版本替换。"
  });

  await page.locator("#planRepositoryUseRemoteButton").click();
  await expect(page.locator("#planRepositoryConflictPanel")).toBeHidden();
  await expect(page.locator("#planRepositorySummary")).toContainText("已从远端 API 拉取");

  const learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  const plan = learningState.plans.find((item) => item.id === conflict.seedPlan.id);
  expect(plan.title).toBe("浏览器采用远端计划");
  expect(plan.items[0].title).toBe("浏览器采用远端任务");
  expect(learningState.planRepository.lastSyncConflictCount).toBe(0);
  expect(learningState.planRepository.pendingAutoSync).toBe(false);
  expect(learningState.planRepository.lastRemoteDirection).toBe("pull");
  expect(learningState.planRepository.lastPackageId).toBe("e2e-plan-repository-use-remote-conflict");
  expect(conflict.planRequests.some((item) => item.method === "GET" && item.authorization === "Bearer use-remote-token")).toBe(true);
});

test("front plan repository merges selected conflict fields", async ({ page }) => {
  const conflict = await setupPlanRepositoryConflict(page, {
    endpointPath: "/e2e-plan-repository-field-merge",
    token: "field-merge-token",
    remoteTitle: "浏览器字段合并远端计划",
    remoteItemTitle: "浏览器字段合并远端任务",
    remoteItemDetail: "浏览器字段合并应采用这条远端任务说明。",
    localItemTitle: "浏览器字段合并保留本机任务",
    localItemDetail: "浏览器字段合并时这条本机说明应被替换。"
  });

  const conflictPanel = page.locator("#planRepositoryConflictPanel");
  await expect(conflictPanel).toContainText("计划标题");
  await expect(conflictPanel).toContainText("浏览器字段合并保留本机任务");
  await expect(conflictPanel).toContainText("浏览器字段合并远端任务");

  await conflictPanel.locator('input[data-plan-merge-item-id=""][data-plan-merge-field="title"][value="remote"]').check();
  await conflictPanel.locator('input[data-plan-merge-field="detail"][value="remote"]').check();
  await page.locator("#planRepositoryMergeFieldsButton").click();

  await expect(conflictPanel).toBeHidden();
  await expect(page.locator("#planRepositorySummary")).toContainText("字段级合并");

  const learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  const plan = learningState.plans.find((item) => item.id === conflict.seedPlan.id);
  expect(plan.title).toBe("浏览器字段合并远端计划");
  expect(plan.items[0].title).toBe("浏览器字段合并保留本机任务");
  expect(plan.items[0].detail).toBe("浏览器字段合并应采用这条远端任务说明。");
  expect(learningState.planRepository.lastSyncConflictCount).toBe(0);
  expect(learningState.planRepository.pendingAutoSync).toBe(true);
});

test("front plan repository shows real remote failure feedback", async ({ page }) => {
  const requests = [];
  const routes = [
    {
      path: "/e2e-plan-repository-expired-token",
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "计划仓库 token 已过期，请重新登录。"
      })
    },
    {
      path: "/e2e-plan-repository-server-error",
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "计划仓库服务端 E2E 故障。"
      })
    },
    {
      path: "/e2e-plan-repository-invalid-json",
      status: 200,
      contentType: "application/json",
      body: "{not-json"
    },
    {
      path: "/e2e-plan-repository-empty-package",
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "远端空计划仓库 E2E 可访问，但没有返回计划包。"
      })
    }
  ];

  for (const routeConfig of routes) {
    await page.route(`**${routeConfig.path}`, async (route) => {
      const request = route.request();
      requests.push({
        path: routeConfig.path,
        method: request.method(),
        authorization: request.headers().authorization || ""
      });
      await route.fulfill({
        status: routeConfig.status,
        contentType: routeConfig.contentType,
        body: routeConfig.body
      });
    });
  }

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  await page.evaluate(() => window.MRAppState.createPlan());
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#planPanel")).toBeVisible();
  await page.locator(".plan-repository-remote summary").click();

  const expiredEndpoint = await getSameOriginEndpoint(page, "/e2e-plan-repository-expired-token");
  await configurePlanRepositoryRemoteInUi(page, expiredEndpoint, "expired-token");
  await page.locator("#planRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 401");
  await expect(page.locator("#planRepositorySummary")).toContainText("HTTP 401");
  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastError).toContain("HTTP 401");
  expect(requests.some((item) => item.path === "/e2e-plan-repository-expired-token" && item.authorization === "Bearer expired-token")).toBe(true);

  const serverErrorEndpoint = await getSameOriginEndpoint(page, "/e2e-plan-repository-server-error");
  await configurePlanRepositoryRemoteInUi(page, serverErrorEndpoint, "server-error-token");
  await page.locator("#planRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 500");
  await expect(page.locator("#planRepositorySummary")).toContainText("HTTP 500");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastError).toContain("HTTP 500");

  const invalidJsonEndpoint = await getSameOriginEndpoint(page, "/e2e-plan-repository-invalid-json");
  await configurePlanRepositoryRemoteInUi(page, invalidJsonEndpoint, "invalid-json-token");
  await page.locator("#planRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("不是可解析 JSON");
  await expect(page.locator("#planRepositorySummary")).toContainText("不是可解析 JSON");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastError).toContain("不是可解析 JSON");

  const emptyPackageEndpoint = await getSameOriginEndpoint(page, "/e2e-plan-repository-empty-package");
  await configurePlanRepositoryRemoteInUi(page, emptyPackageEndpoint, "empty-package-token");
  await page.locator("#planRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("远端空计划仓库 E2E 可访问");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastError).toBe("");
  expect(learningState.planRepository.lastRemoteStatus).toContain("远端空计划仓库 E2E 可访问");

  await page.locator("#planRepositoryPullButton").click();
  await expect(page.locator("#noticeState")).toContainText("没有返回可导入的计划包");
  await expect(page.locator("#planRepositorySummary")).toContainText("没有返回可导入的计划包");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastError).toContain("没有返回可导入的计划包");
  expect(requests.some((item) => item.path === "/e2e-plan-repository-empty-package" && item.authorization === "Bearer empty-package-token")).toBe(true);
});

test("front plan repository keeps pending queue on push failures", async ({ page }) => {
  const rejectedPath = "/e2e-plan-repository-rejected-push";
  const networkPath = "/e2e-plan-repository-network-push";
  const recoveryPath = "/e2e-plan-repository-recovery-push";
  const requests = [];

  await page.route(`**${rejectedPath}`, async (route) => {
    const request = route.request();
    requests.push({
      path: rejectedPath,
      method: request.method(),
      authorization: request.headers().authorization || "",
      body: request.method() === "PUT" ? request.postDataJSON() : null
    });
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "计划仓库包结构被 E2E 服务端拒绝。"
      })
    });
  });

  await page.route(`**${networkPath}`, async (route) => {
    const request = route.request();
    requests.push({
      path: networkPath,
      method: request.method(),
      authorization: request.headers().authorization || ""
    });
    await route.abort("failed");
  });

  await page.route(`**${recoveryPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    requests.push({
      path: recoveryPath,
      method,
      authorization: request.headers().authorization || "",
      body
    });
    const acceptedAt = new Date().toISOString();
    const repositoryDigest = "e".repeat(64);
    const receipt = {
      receiptKind: "mr-calligraphy-plan-repository-receipt-v1",
      remoteVersion: "e2e-plan-recovery-v1",
      workspaceId: body?.workspaceId || "local-browser",
      packageId: "e2e-plan-recovery-package",
      sourcePackageId: body?.packageId || "",
      repositoryDigest,
      acceptedAt,
      planCount: body?.summary?.planCount || 0,
      warningCount: 0,
      warnings: [],
      receiptDigest: sha256StableJson({
        sourcePackageId: body?.packageId || "",
        workspaceId: body?.workspaceId || "local-browser",
        repositoryDigest,
        acceptedAt
      })
    };
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: `恢复计划仓库 E2E 已接收 ${body?.summary?.planCount || 0} 份计划。`,
        remoteVersion: "e2e-plan-recovery-v1",
        packageId: "e2e-plan-recovery-package",
        package: withPackageDigest({
          ...body,
          packageId: "e2e-plan-recovery-package"
        }),
        receipt
      })
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  const seedPlan = await page.evaluate(() => {
    const created = window.MRAppState.createPlan();
    return {
      id: created.plan.id,
      title: created.plan.title
    };
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#planPanel")).toBeVisible();
  await expect(page.locator("#planTitle")).toContainText(seedPlan.title);
  await page.locator(".plan-repository-remote summary").click();

  const rejectedEndpoint = await getSameOriginEndpoint(page, rejectedPath);
  await configurePlanRepositoryRemoteInUi(page, rejectedEndpoint, "plan-rejected-push-token");
  await page.locator("#planRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("HTTP 422");
  await expect(page.locator("#planRepositorySummary")).toContainText("HTTP 422");

  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastError).toContain("HTTP 422");
  expect(learningState.planRepository.pendingAutoSync).toBe(true);
  expect(learningState.planRepository.autoSyncRetryAfter).toBeTruthy();
  expect(learningState.planRepository.autoSyncFailureHistory[0].failureKind).toBe("http");
  expect(learningState.planRepository.autoSyncFailureHistory[0].message).toContain("HTTP 422");
  expect(learningState.planRepository.autoSyncFailureHistory[0].packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.plans).toHaveLength(1);
  expect(learningState.plans[0].id).toBe(seedPlan.id);
  await expect(page.locator("#planRepositoryPushButton")).toHaveText("重试队列");

  const rejectedPut = requests.find((item) => item.path === rejectedPath && item.method === "PUT");
  expect(rejectedPut.authorization).toBe("Bearer plan-rejected-push-token");
  expect(rejectedPut.body.kind).toBe("mr-calligraphy-plan-repository-v1");
  expect(rejectedPut.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(rejectedPut.body.summary.planCount).toBe(1);
  expect(rejectedPut.body.plans[0].id).toBe(seedPlan.id);

  const networkEndpoint = await getSameOriginEndpoint(page, networkPath);
  await configurePlanRepositoryRemoteInUi(page, networkEndpoint, "plan-network-push-token");
  await page.locator("#planRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("网络请求异常");
  await expect(page.locator("#planRepositorySummary")).toContainText("网络请求异常");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastError).toContain("网络请求异常");
  expect(learningState.planRepository.pendingAutoSync).toBe(true);
  expect(learningState.planRepository.autoSyncFailureHistory).toHaveLength(2);
  expect(learningState.planRepository.autoSyncFailureHistory[0].failureKind).toBe("network");
  expect(learningState.planRepository.autoSyncFailureHistory[0].packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(learningState.planRepository.lastAutoSyncStatus).toContain("队列已保留");
  expect(learningState.plans).toHaveLength(1);
  expect(learningState.plans[0].id).toBe(seedPlan.id);
  expect(requests.some((item) => item.path === networkPath && item.method === "PUT" && item.authorization === "Bearer plan-network-push-token")).toBe(true);

  const recoveryEndpoint = await getSameOriginEndpoint(page, recoveryPath);
  await configurePlanRepositoryRemoteInUi(page, recoveryEndpoint, "plan-recovery-token");
  await expect(page.locator("#planRepositoryPushButton")).toHaveText("重试队列");
  await page.locator("#planRepositoryPushButton").click();
  await expect(page.locator("#noticeState")).toContainText("已推送 1 份计划");
  await expect(page.locator("#planRepositorySummary")).toContainText("已推送 1 份计划");
  await expect(page.locator("#planRepositoryPushButton")).toHaveText("推送计划");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.pendingAutoSync).toBe(false);
  expect(learningState.planRepository.autoSyncRetryAfter).toBeFalsy();
  expect(learningState.planRepository.autoSyncFailureHistory).toHaveLength(2);
  expect(learningState.planRepository.receipts[0].packageId).toBe("e2e-plan-recovery-package");
  expect(learningState.planRepository.lastPackageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(requests.some((item) => item.path === recoveryPath && item.method === "PUT" && item.authorization === "Bearer plan-recovery-token")).toBe(true);
});

test("main admin publishes a local draft that the front page reads", async ({ page }) => {
  test.setTimeout(90_000);
  const objectLabel = `E2E 发布方块 ${Date.now()}`;
  const remoteEndpointPath = "/e2e-remote-publish";
  const projectRepositoryEndpointPath = "/e2e-project-repository";
  const remoteRequests = [];
  const projectRepositoryRequests = [];
  const remoteProjectRepositoryVersions = [];
  const remoteProjectRepositoryVersionsByWorkspace = new Map([["project-e2e", remoteProjectRepositoryVersions]]);
  let latestRemotePublishReceipt = null;

  const getRemoteProjectRepositoryVersions = (workspaceId) => {
    const key = workspaceId || "local-browser";
    if (!remoteProjectRepositoryVersionsByWorkspace.has(key)) {
      remoteProjectRepositoryVersionsByWorkspace.set(key, []);
    }
    return remoteProjectRepositoryVersionsByWorkspace.get(key);
  };

  await page.route(`**${remoteEndpointPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "POST" || method === "DELETE" ? request.postDataJSON() : null;
    remoteRequests.push({
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });
    if (method === "POST") {
      const acceptedAt = new Date(Date.UTC(2026, 5, 12, 8, 20, 0)).toISOString();
      const assetSignatureSummary = {
        kind: "mr-calligraphy-remote-publish-asset-signature-summary-v1",
        signedAssetCount: 0,
        unsignedAssetCount: 0,
        missingHashCount: 0,
        signatureAlgorithm: "",
        signingKeyId: "",
        assetDigest: body.manifest.assetDigest,
        signedAt: acceptedAt
      };
      const cdnUploadSummary = {
        kind: "mr-calligraphy-remote-publish-cdn-upload-summary-v1",
        status: "uploaded",
        cdnProvider: "e2e-cdn",
        uploadRequestId: "upload-e2e-mainScene",
        uploadedAssetCount: Math.max(1, body.assetManifest.assets.length),
        uploadedUrlCount: Math.max(1, body.assetManifest.assets.length),
        baseUrl: `https://e2e-cdn.invalid/${body.sceneId}/`,
        assetDigest: body.manifest.assetDigest,
        uploadedAt: acceptedAt,
        completedAt: acceptedAt,
        assetUrls: []
      };
      latestRemotePublishReceipt = {
        receiptKind: "mr-calligraphy-remote-publish-receipt-v1",
        direction: "publish",
        workspaceId: body.workspaceId,
        packageId: `e2e-${body.sceneId}`,
        releaseId: body.release.id,
        sceneId: body.sceneId,
        packageDigest: body.manifest.packageDigest,
        acceptedAt,
        remoteVersion: "e2e-remote-v1",
        assetSignatureSummary,
        cdnUploadSummary,
        message: "主场景远端 E2E 回执。"
      };
      latestRemotePublishReceipt.receiptDigest = sha256StableJson({
        sceneId: latestRemotePublishReceipt.sceneId,
        workspaceId: latestRemotePublishReceipt.workspaceId,
        releaseId: latestRemotePublishReceipt.releaseId,
        packageDigest: latestRemotePublishReceipt.packageDigest,
        acceptedAt,
        assetSignatureSummary,
        cdnUploadSummary
      });
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "主场景远端 E2E 已接收。",
          workspaceId: body.workspaceId,
          packageId: `e2e-${body.sceneId}`,
          releaseId: body.release.id,
          packageDigest: body.manifest.packageDigest,
          remoteVersion: "e2e-remote-v1",
          cdnUploadSummary,
          receipt: latestRemotePublishReceipt
        })
      });
      return;
    }
    if (method === "DELETE") {
      const acceptedAt = new Date(Date.UTC(2026, 5, 12, 8, 25, 0)).toISOString();
      const cdnPurgeSummary = {
        kind: "mr-calligraphy-remote-publish-cdn-purge-summary-v1",
        status: "accepted",
        cdnProvider: "e2e-cdn",
        purgeRequestId: "purge-e2e-mainScene",
        purgedAssetCount: 1,
        purgedUrlCount: 1,
        requestedAt: body.requestedAt,
        completedAt: acceptedAt
      };
      latestRemotePublishReceipt = {
        receiptKind: "mr-calligraphy-remote-publish-revoke-receipt-v1",
        direction: "revoke",
        workspaceId: body.workspaceId,
        packageId: `e2e-revoke-${body.sceneId}`,
        sourcePackageId: body.sourcePackageId,
        releaseId: body.releaseId,
        sceneId: body.sceneId,
        packageDigest: body.packageDigest,
        acceptedAt,
        revokedAt: acceptedAt,
        remoteVersion: "e2e-remote-v1",
        cdnPurgeSummary,
        message: "主场景远端 E2E 已撤销。"
      };
      latestRemotePublishReceipt.receiptDigest = sha256StableJson({
        direction: "revoke",
        workspaceId: latestRemotePublishReceipt.workspaceId,
        sceneId: latestRemotePublishReceipt.sceneId,
        packageId: latestRemotePublishReceipt.packageId,
        sourcePackageId: latestRemotePublishReceipt.sourcePackageId,
        releaseId: latestRemotePublishReceipt.releaseId,
        packageDigest: latestRemotePublishReceipt.packageDigest,
        acceptedAt,
        revokedAt: acceptedAt,
        cdnPurgeSummary
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "主场景远端 E2E 已撤销。",
          workspaceId: body.workspaceId,
          packageId: latestRemotePublishReceipt.packageId,
          sourcePackageId: latestRemotePublishReceipt.sourcePackageId,
          releaseId: latestRemotePublishReceipt.releaseId,
          packageDigest: latestRemotePublishReceipt.packageDigest,
          remoteVersion: "e2e-remote-v1",
          cdnPurgeSummary,
          receipt: latestRemotePublishReceipt
        })
      });
      return;
    }
    const activePublishReceipt = latestRemotePublishReceipt?.direction === "revoke" ? null : latestRemotePublishReceipt;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "主场景远端 E2E 可访问。",
        workspaceId: request.headers()["x-mr-workspace-id"] || "",
        remoteVersion: "e2e-check-v1",
        latestReceipt: latestRemotePublishReceipt,
        publishLock: activePublishReceipt
          ? {
              locked: true,
              workspaceId: activePublishReceipt.workspaceId,
              sceneId: activePublishReceipt.sceneId,
              releaseId: activePublishReceipt.releaseId,
              packageDigest: activePublishReceipt.packageDigest,
              lockedAt: activePublishReceipt.acceptedAt,
              reason: "E2E 已有发布包。"
            }
          : { locked: false }
      })
    });
  });

  await page.route(`**${projectRepositoryEndpointPath}**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const requestUrl = new URL(request.url());
    const requestedPackageId = requestUrl.searchParams.get("packageId") || "";
    const workspaceId = request.headers()["x-mr-workspace-id"] || "local-browser";
    const workspaceVersions = getRemoteProjectRepositoryVersions(workspaceId);
    const body = method === "PUT" ? request.postDataJSON() : null;
    projectRepositoryRequests.push({
      method,
      url: request.url(),
      packageId: requestedPackageId,
      authorization: request.headers().authorization || "",
      workspaceId,
      body
    });
    if (method === "PUT") {
      const validation = validateProjectRepositoryPackage(body, { workspaceId });
      expect(validation.ok, validation.message).toBe(true);
      const packageIndex = workspaceVersions.length + 1;
      const packageId = `e2e-project-repository-${packageIndex}`;
      const acceptedAt = new Date(Date.UTC(2026, 5, 12, 8, packageIndex, 0)).toISOString();
      const repositoryDigest = body.packageDigest;
      const receipt = {
        receiptKind: "mr-calligraphy-project-repository-receipt-v1",
        packageId,
        sourcePackageId: body.packageId,
        workspaceId,
        packageDigest: body.packageDigest,
        repositoryDigest,
        remoteVersion: "e2e-project-repository-v1",
        acceptedAt,
        message: "项目仓库远端 E2E 回执。",
        sceneCount: body.summary.sceneCount,
        modelCount: body.summary.importedModels,
        receiptDigest: sha256StableJson({
          sourcePackageId: body.packageId,
          workspaceId,
          repositoryDigest,
          acceptedAt
        })
      };
      const remoteVersion = {
        id: packageId,
        packageId,
        sourcePackageId: body.packageId,
        workspaceId,
        packageDigest: body.packageDigest,
        repositoryDigest,
        remoteVersion: "e2e-project-repository-v1",
        acceptedAt,
        sceneCount: body.summary.sceneCount,
        modelCount: body.summary.importedModels,
        summary: body.summary,
        package: JSON.parse(JSON.stringify(body)),
        receipt
      };
      workspaceVersions.unshift(remoteVersion);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "项目仓库远端 E2E 已接收。",
          packageId,
          workspaceId,
          packageDigest: body.packageDigest,
          repositoryDigest,
          remoteVersion: "e2e-project-repository-v1",
          selectedVersion: toProjectRepositoryVersionSummary(remoteVersion),
          versionCount: workspaceVersions.length,
          versions: workspaceVersions.map(toProjectRepositoryVersionSummary),
          receipt
        })
      });
      return;
    }
    const selectedVersion = requestedPackageId
      ? workspaceVersions.find((version) => [
          version.packageId,
          version.sourcePackageId,
          version.packageDigest,
          version.repositoryDigest
        ].includes(requestedPackageId))
      : remoteProjectRepositoryVersions[0];
    const latestReceipt = selectedVersion?.receipt || workspaceVersions[0]?.receipt || null;
    if (requestedPackageId && !selectedVersion) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          message: `项目仓库远端 E2E 在空间 ${workspaceId} 未找到版本：${requestedPackageId}。`,
          remoteVersion: "e2e-project-check-v1",
          workspaceId,
          versions: workspaceVersions.map(toProjectRepositoryVersionSummary)
        })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: selectedVersion ? `项目仓库远端 E2E 可拉取空间 ${workspaceId} 的版本 ${selectedVersion.packageId}。` : `项目仓库远端 E2E 可访问，空间 ${workspaceId}。`,
        remoteVersion: "e2e-project-check-v1",
        workspaceId,
        packageId: selectedVersion?.packageId || "",
        repositoryDigest: selectedVersion?.repositoryDigest || "",
        package: selectedVersion?.package || null,
        latestReceipt,
        selectedVersion: selectedVersion ? toProjectRepositoryVersionSummary(selectedVersion) : null,
        versionCount: workspaceVersions.length,
        versions: workspaceVersions.map(toProjectRepositoryVersionSummary)
      })
    });
  });

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await unlockMainAdmin(page);
  await expectCanvasHasVisiblePixels(page, "#mainAdminCanvas");
  const remoteEndpoint = await getSameOriginEndpoint(page, remoteEndpointPath);
  const projectRepositoryEndpoint = await getSameOriginEndpoint(page, projectRepositoryEndpointPath);

  await page.locator("#mainAdminOperatorName").fill("E2E 主后台");
  await page.locator("#mainAdminOperatorRole").selectOption("editor");
  await page.locator("#mainAdminOperatorSave").click();
  await expect(page.locator("#mainAdminOperatorStatus")).toContainText("E2E 主后台");

  await page.locator("#mainNewObjectName").fill(objectLabel);
  await page.locator("#mainNewObjectType").selectOption("box");
  await page.locator("#mainNewObjectAdd").click();
  await expect(page.locator("#mainCustomStatus")).toContainText(`已新增：${objectLabel}`);
  await expect(page.locator("#mainPublishDiffSummary")).toContainText("尚未发布");
  await expect(page.locator("#mainPublishDiffList")).toContainText(objectLabel);

  await expect(page.locator("#mainNewObjectUpdate")).toBeEnabled();
  const updatedObjectLabel = `${objectLabel} 已更新`;
  await page.locator("#mainNewObjectName").fill(updatedObjectLabel);
  await page.locator("#mainNewObjectType").selectOption("cylinder");
  await expect(page.locator("[data-custom-size='radius']")).toBeVisible();
  await page.locator("#mainNewObjectColor").fill("#336699");
  await page.locator("#mainNewObjectRadius").fill("0.55");
  await page.locator("#mainNewObjectHeight").fill("1.25");
  await page.locator("#mainNewObjectUpdate").click();
  await expect(page.locator("#mainCustomStatus")).toContainText(`已更新：${updatedObjectLabel}`);
  await expect(page.locator("#mainPublishDiffList")).toContainText(updatedObjectLabel);

  const draft = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  const updatedDraftObject = draft.customObjects.find((item) => item.label === updatedObjectLabel);
  expect(updatedDraftObject).toBeTruthy();
  expect(updatedDraftObject.type).toBe("cylinder");
  expect(updatedDraftObject.color).toBe("#336699");
  expect(updatedDraftObject.size.radius).toBeCloseTo(0.55, 2);
  expect(updatedDraftObject.size.height).toBeCloseTo(1.25, 2);

  await page.locator("#mainPublishLayout").click();
  await expect(page.locator("#mainPublishStatus")).toContainText("已发布");
  await expect(page.locator("#mainPublishDiffSummary")).toContainText("一致");

  const published = await readJsonLocalStorage(page, MAIN_PUBLISHED_KEY);
  const publishedUpdatedObject = published.layout.customObjects.find((item) => item.label === updatedObjectLabel);
  expect(publishedUpdatedObject).toBeTruthy();
  expect(publishedUpdatedObject.type).toBe("cylinder");
  expect(publishedUpdatedObject.size.radius).toBeCloseTo(0.55, 2);
  expect(published.stats.customCount).toBeGreaterThan(0);
  const adminAudit = await readJsonLocalStorage(page, ADMIN_AUDIT_KEY);
  expect(adminAudit.scopes.mainScene.operator.name).toBe("E2E 主后台");
  expect(adminAudit.scopes.mainScene.operator.role).toBe("editor");
  expect(adminAudit.scopes.mainScene.records.some((record) => record.action === "publish-local" && record.operator.name === "E2E 主后台")).toBe(true);
  expect(adminAudit.scopes.mainScene.records.some((record) => record.action === "snapshot" && record.operator.name === "E2E 主后台")).toBe(true);
  await expect(page.locator("#mainAdminAuditList")).toContainText("本机发布");

  await page.locator("#projectRepositoryRefresh").click();
  await expect(page.locator("#projectRepositoryStatus")).toContainText("本机项目仓库 adapter");
  await expect(page.locator("#projectRepositoryList")).toContainText("主场景");
  const projectRepositoryStatus = await page.evaluate(async () => window.MRProjectArchive.getCurrentProjectRepositoryStatus());
  expect(projectRepositoryStatus.kind).toBe("mr-calligraphy-project-repository-v1");
  const mainRepositoryScene = projectRepositoryStatus.scenes.find((scene) => scene.sceneId === "main");
  expect(mainRepositoryScene.draft.objectCount).toBeGreaterThan(0);
  expect(mainRepositoryScene.published.releaseCount).toBeGreaterThan(0);
  expect(mainRepositoryScene.unifiedSchema).toBe("project-scene-repository-v1");

  await page.locator(".project-repository-remote summary").click();
  await expect(page.locator("#projectRepositoryEndpoint")).toBeVisible();
  await page.locator("#projectRepositoryEndpoint").fill(projectRepositoryEndpoint);
  await page.locator("#projectRepositoryToken").fill("project-e2e-token");
  await page.locator("#projectRepositoryWorkspace").fill("project-e2e");
  await page.locator("#projectRepositorySaveRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("远端项目仓库 API 配置已保存");
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("project-e2e");

  await page.locator("#projectRepositoryCheckRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("项目仓库远端 E2E 可访问");
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("project-e2e");
  const checkedProjectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(checkedProjectRepositoryState.lastRemoteVersion).toBe("e2e-project-check-v1");
  expect(checkedProjectRepositoryState.workspaceId).toBe("project-e2e");

  await page.locator("#projectRepositoryPushRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("项目仓库远端 E2E 已接收");
  await expect(page.locator("#projectRepositoryReceiptStatus")).toContainText("已保存 1 条项目仓库回执");
  await expect(page.locator("#projectRepositoryReceiptStatus")).toContainText("本机校验通过 1 条");
  await expect(page.locator("#projectRepositoryReceiptList")).toContainText("e2e-project-repository-1");
  await expect(page.locator("#projectRepositoryReceiptList")).toContainText("本机校验通过");

  expect(projectRepositoryRequests.some((item) => item.method === "GET" && item.authorization === "Bearer project-e2e-token")).toBe(true);
  expect(projectRepositoryRequests.some((item) => item.method === "GET" && item.workspaceId === "project-e2e")).toBe(true);
  const firstProjectRepositoryPut = projectRepositoryRequests.find((item) => item.method === "PUT");
  expect(firstProjectRepositoryPut.authorization).toBe("Bearer project-e2e-token");
  expect(firstProjectRepositoryPut.workspaceId).toBe("project-e2e");
  expect(firstProjectRepositoryPut.body.kind).toBe("mr-calligraphy-project-repository-package-v1");
  expect(firstProjectRepositoryPut.body.workspaceId).toBe("project-e2e");
  expect(firstProjectRepositoryPut.body.repository.kind).toBe("mr-calligraphy-project-repository-v1");
  expect(firstProjectRepositoryPut.body.projectSchema.kind).toBe("mr-calligraphy-project-schema");
  expect(firstProjectRepositoryPut.body.archive.kind).toBe("mr-calligraphy-project-archive");
  expect(firstProjectRepositoryPut.body.summary.sceneCount).toBe(2);
  expect(firstProjectRepositoryPut.body.summary.publishedSceneCount).toBeGreaterThan(0);
  expect(firstProjectRepositoryPut.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);

  const firstRemoteProjectVersion = remoteProjectRepositoryVersions[0];
  expect(firstRemoteProjectVersion.packageId).toBe("e2e-project-repository-1");
  const firstProjectReceiptDigest = firstRemoteProjectVersion.receipt.receiptDigest;
  const projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.lastPackageId).toBe("e2e-project-repository-1");
  expect(projectRepositoryState.lastRemoteVersion).toBe("e2e-project-repository-v1");
  expect(projectRepositoryState.workspaceId).toBe("project-e2e");
  expect(projectRepositoryState.lastPackageDigest).toBe(firstProjectRepositoryPut.body.packageDigest);
  expect(projectRepositoryState.receipts[0].sourcePackageId).toBe(firstProjectRepositoryPut.body.packageId);
  expect(projectRepositoryState.receipts[0].workspaceId).toBe("project-e2e");
  expect(projectRepositoryState.receipts[0].direction).toBe("push");
  expect(projectRepositoryState.receipts[0].receiptDigest).toBe(firstProjectReceiptDigest);
  expect(projectRepositoryState.receipts[0].verificationStatus).toBe("verified");
  expect(projectRepositoryState.receipts[0].verificationExpectedDigest).toBe(firstProjectReceiptDigest);
  expect(projectRepositoryState.versions[0].packageId).toBe("e2e-project-repository-1");
  expect(projectRepositoryState.versions[0].workspaceId).toBe("project-e2e");

  const projectRepositoryReceiptAudit = await page.evaluate(() => window.MRProjectArchive.getProjectRepositoryReceiptAuditExport());
  expect(projectRepositoryReceiptAudit.ok).toBe(true);
  expect(projectRepositoryReceiptAudit.html).toContain("MR 书法项目仓库回执审计");
  expect(projectRepositoryReceiptAudit.html).toContain("e2e-project-repository-1");
  expect(projectRepositoryReceiptAudit.html).toContain("project-e2e");
  expect(projectRepositoryReceiptAudit.html).toContain(firstProjectReceiptDigest);
  expect(projectRepositoryReceiptAudit.html).toContain("本机校验通过");
  expect(projectRepositoryReceiptAudit.html).toContain("重算摘要");

  const projectRepositoryReceiptDownloadPromise = page.waitForEvent("download");
  await page.locator("#projectRepositoryReceiptExport").click();
  const projectRepositoryReceiptDownload = await projectRepositoryReceiptDownloadPromise;
  expect(projectRepositoryReceiptDownload.suggestedFilename()).toMatch(/^mr-calligraphy-project-repository-receipts-.*\.html$/);
  const projectRepositoryReceiptPath = await projectRepositoryReceiptDownload.path();
  const projectRepositoryReceiptHtml = fs.readFileSync(projectRepositoryReceiptPath, "utf8");
  expect(projectRepositoryReceiptHtml).toContain("MR 书法项目仓库回执审计");
  expect(projectRepositoryReceiptHtml).toContain("e2e-project-repository-1");
  expect(projectRepositoryReceiptHtml).toContain("project-e2e");
  expect(projectRepositoryReceiptHtml).toContain(firstProjectReceiptDigest);
  expect(projectRepositoryReceiptHtml).toContain("本机校验通过");
  expect(projectRepositoryReceiptHtml).toContain("重算摘要");

  const secondObjectLabel = `${objectLabel} 版本二`;
  await page.locator("#mainNewObjectName").fill(secondObjectLabel);
  await page.locator("#mainNewObjectType").selectOption("box");
  await page.locator("#mainNewObjectAdd").click();
  await expect(page.locator("#mainCustomStatus")).toContainText(`已新增：${secondObjectLabel}`);
  await page.locator("#mainPublishLayout").click();
  await expect(page.locator("#mainPublishStatus")).toContainText("已发布");

  await page.locator("#projectRepositoryPushRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("项目仓库远端 E2E 已接收");
  await expect(page.locator("#projectRepositoryReceiptList")).toContainText("e2e-project-repository-2");
  await expect(page.locator("#projectRepositoryVersionSelect")).toContainText("e2e-project-repository-1");
  await expect(page.locator("#projectRepositoryVersionSelect")).toContainText("e2e-project-repository-2");

  const projectRepositoryPuts = projectRepositoryRequests.filter((item) => item.method === "PUT");
  expect(projectRepositoryPuts).toHaveLength(2);
  const secondProjectRepositoryPut = projectRepositoryPuts[1];
  expect(secondProjectRepositoryPut.workspaceId).toBe("project-e2e");
  expect(secondProjectRepositoryPut.body.workspaceId).toBe("project-e2e");
  expect(secondProjectRepositoryPut.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(secondProjectRepositoryPut.body.packageDigest).not.toBe(firstProjectRepositoryPut.body.packageDigest);
  const latestProjectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(latestProjectRepositoryState.lastPackageId).toBe("e2e-project-repository-2");
  expect(latestProjectRepositoryState.workspaceId).toBe("project-e2e");
  expect(latestProjectRepositoryState.receipts[0].verificationStatus).toBe("verified");
  expect(latestProjectRepositoryState.receipts[0].verificationExpectedDigest).toBe(latestProjectRepositoryState.receipts[0].receiptDigest);
  expect(latestProjectRepositoryState.versions.map((version) => version.packageId)).toEqual([
    "e2e-project-repository-2",
    "e2e-project-repository-1"
  ]);
  expect(latestProjectRepositoryState.versions.every((version) => version.workspaceId === "project-e2e")).toBe(true);

  await page.locator("#projectRepositoryVersionSelect").selectOption(firstRemoteProjectVersion.packageId);
  await page.locator("#projectRepositoryPullRemote").click();
  await expect(page.locator("#projectArchiveStatus")).toContainText("项目仓库远端 E2E 可拉取空间 project-e2e 的版本 e2e-project-repository-1");
  await expect(page.locator("#projectImportPreview")).toBeVisible();
  await expect(page.locator("#projectImportPreviewTitle")).toContainText("远端项目仓库版本预览");
  await expect(page.locator("#projectImportPreviewSource")).toContainText("e2e-project-repository-1");
  await expect(page.locator("#projectImportPreviewSource")).toContainText("Workspace project-e2e");
  await expect(page.locator("#projectImportPreviewSource")).toContainText(firstProjectRepositoryPut.body.packageDigest.slice(0, 12));
  await expect(page.locator("#projectImportPreviewSource")).toContainText("拉取只生成恢复预览");
  await expect(page.locator("#projectImportPreviewList")).toContainText("主场景布局");
  const pulledProjectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(pulledProjectRepositoryState.lastPackageId).toBe(firstRemoteProjectVersion.packageId);
  expect(pulledProjectRepositoryState.workspaceId).toBe("project-e2e");
  expect(pulledProjectRepositoryState.lastPackageDigest).toBe(firstProjectRepositoryPut.body.packageDigest);
  expect(pulledProjectRepositoryState.receipts[0].verificationStatus).toBe("verified");
  expect(projectRepositoryRequests.some((item) => item.method === "GET" && item.packageId === firstRemoteProjectVersion.packageId && item.workspaceId === "project-e2e")).toBe(true);

  const remoteImpactDownloadPromise = page.waitForEvent("download");
  await page.locator("#projectImportExportImpact").click();
  const remoteImpactDownload = await remoteImpactDownloadPromise;
  expect(remoteImpactDownload.suggestedFilename()).toMatch(/^mr-calligraphy-archive-impact-.*\.html$/);
  const remoteImpactPath = await remoteImpactDownload.path();
  const remoteImpactHtml = fs.readFileSync(remoteImpactPath, "utf8");
  expect(remoteImpactHtml).toContain("远端项目仓库版本");
  expect(remoteImpactHtml).toContain("e2e-project-repository-1");
  expect(remoteImpactHtml).toContain("Workspace project-e2e");
  expect(remoteImpactHtml).toContain(firstProjectRepositoryPut.body.packageDigest);

  const restoredNavigation = page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.locator("#projectImportConfirm").click();
  await restoredNavigation;
  await expect(page.locator("#projectAuditStatus")).toContainText("恢复记录");
  await expect(page.locator("#projectAuditList")).toContainText("审计");
  const restoreAuditLog = await page.evaluate(() => window.MRProjectArchive.getRestoreAuditLog());
  expect(restoreAuditLog.records[0].recordDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(restoreAuditLog.records[0].archiveDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(restoreAuditLog.records[0].selectionDigest).toMatch(/^[a-f0-9]{64}$/);
  const restoreAuditDownloadPromise = page.waitForEvent("download");
  await page.locator("#projectAuditExport").click();
  const restoreAuditDownload = await restoreAuditDownloadPromise;
  expect(restoreAuditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-archive-audit-.*\.html$/);
  const restoreAuditPath = await restoreAuditDownload.path();
  const restoreAuditHtml = fs.readFileSync(restoreAuditPath, "utf8");
  expect(restoreAuditHtml).toContain("MR 书法项目档案恢复审计");
  expect(restoreAuditHtml).toContain(restoreAuditLog.records[0].recordDigest);

  await page.locator(".main-publish-panel .remote-publish-panel summary").click();
  await expect(page.locator("#mainRemotePublishEndpoint")).toBeVisible();
  await page.locator("#mainRemotePublishEndpoint").fill(remoteEndpoint);
  await page.locator("#mainRemotePublishToken").fill("e2e-token");
  await page.locator("#mainRemotePublishWorkspace").fill("main-remote-e2e");
  await page.locator("#mainRemotePublishSave").click();
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("远端发布 API 配置已保存");
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("main-remote-e2e");

  await page.locator("#mainRemotePublishCheck").click();
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("主场景远端 E2E 可访问");
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("main-remote-e2e");
  const checkedRemoteState = await readJsonLocalStorage(page, REMOTE_PUBLISH_KEY);
  expect(checkedRemoteState.scenes.mainScene.lastRemoteVersion).toBe("e2e-check-v1");
  expect(checkedRemoteState.scenes.mainScene.workspaceId).toBe("main-remote-e2e");

  await page.locator("#mainRemotePublishRequestReview").click();
  await expect(page.locator("#mainRemotePublishReviewStatus")).toContainText("待审核");
  await expect(page.locator("#mainRemotePublishApproveReview")).toHaveAttribute("data-admin-permission-state", "blocked");
  await page.locator("#mainAdminOperatorRole").selectOption("owner");
  await page.locator("#mainAdminOperatorSave").click();
  await expect(page.locator("#mainAdminPermissionStatus")).toContainText("远端审核审批");
  await page.locator("#mainRemotePublishApproveReview").click();
  await expect(page.locator("#mainRemotePublishReviewStatus")).toContainText("审核通过");

  await expect(page.locator("#mainRemotePublishPush")).toBeEnabled();
  await page.locator("#mainRemotePublishPush").click();
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("主场景远端 E2E 已接收");
  await expect(page.locator("#mainRemotePublishReceiptStatus")).toContainText("1 条");
  await expect(page.locator("#mainRemotePublishReceiptStatus")).toContainText("本机校验通过 1 条");
  await expect(page.locator("#mainRemotePublishReceiptList")).toContainText("e2e-mainScene");
  await expect(page.locator("#mainRemotePublishReceiptList")).toContainText("本机校验通过");
  await expect(page.locator("#mainRemotePublishReceiptList")).toContainText("CDN 1");

  expect(remoteRequests.some((item) => item.method === "GET" && item.authorization === "Bearer e2e-token" && item.workspaceId === "main-remote-e2e")).toBe(true);
  const postRequest = remoteRequests.find((item) => item.method === "POST");
  expect(postRequest.authorization).toBe("Bearer e2e-token");
  expect(postRequest.workspaceId).toBe("main-remote-e2e");
  expect(postRequest.body.kind).toBe("mr-calligraphy-remote-publish-package-v1");
  expect(postRequest.body.sceneId).toBe("mainScene");
  expect(postRequest.body.workspaceId).toBe("main-remote-e2e");
  expect(postRequest.body.manifest.workspaceId).toBe("main-remote-e2e");
  expect(postRequest.body.manifest.packageDigest).toBeTruthy();

  const remoteState = await readJsonLocalStorage(page, REMOTE_PUBLISH_KEY);
  expect(remoteState.scenes.mainScene.lastPackageId).toBe("e2e-mainScene");
  expect(remoteState.scenes.mainScene.workspaceId).toBe("main-remote-e2e");
  expect(remoteState.scenes.mainScene.lastRemoteVersion).toBe("e2e-remote-v1");
  expect(remoteState.scenes.mainScene.receipts[0].packageId).toBe("e2e-mainScene");
  expect(remoteState.scenes.mainScene.receipts[0].workspaceId).toBe("main-remote-e2e");
  expect(remoteState.scenes.mainScene.receipts[0].receiptDigest).toBe(latestRemotePublishReceipt.receiptDigest);
  expect(remoteState.scenes.mainScene.receipts[0].verificationStatus).toBe("verified");
  expect(remoteState.scenes.mainScene.receipts[0].verificationExpectedDigest).toBe(latestRemotePublishReceipt.receiptDigest);
  expect(remoteState.scenes.mainScene.receipts[0].cdnUploadSummary.uploadedUrlCount).toBe(1);
  expect(remoteState.scenes.mainScene.receipts[0].cdnUploadSummary.cdnProvider).toBe("e2e-cdn");

  await expect(page.locator("#mainRemotePublishRevoke")).toBeEnabled();
  await page.locator("#mainRemotePublishRevoke").click();
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("主场景远端 E2E 已撤销");
  await expect(page.locator("#mainRemotePublishReceiptStatus")).toContainText("2 条");
  await expect(page.locator("#mainRemotePublishReceiptStatus")).toContainText("本机校验通过 2 条");
  await expect(page.locator("#mainRemotePublishReceiptList")).toContainText("撤销");
  await expect(page.locator("#mainRemotePublishReceiptList")).toContainText("本机校验通过");
  await expect(page.locator("#mainRemotePublishReceiptList")).toContainText("purge 1");
  const deleteRequest = remoteRequests.find((item) => item.method === "DELETE");
  expect(deleteRequest.authorization).toBe("Bearer e2e-token");
  expect(deleteRequest.workspaceId).toBe("main-remote-e2e");
  expect(deleteRequest.body.kind).toBe("mr-calligraphy-remote-publish-revoke-v1");
  expect(deleteRequest.body.workspaceId).toBe("main-remote-e2e");
  expect(deleteRequest.body.sourcePackageId).toBe("e2e-mainScene");
  const revokedRemoteState = await readJsonLocalStorage(page, REMOTE_PUBLISH_KEY);
  expect(revokedRemoteState.scenes.mainScene.lastRemoteDirection).toBe("revoke");
  expect(revokedRemoteState.scenes.mainScene.receipts[0].direction).toBe("revoke");
  expect(revokedRemoteState.scenes.mainScene.receipts[0].workspaceId).toBe("main-remote-e2e");
  expect(revokedRemoteState.scenes.mainScene.receipts[0].verificationStatus).toBe("verified");
  expect(revokedRemoteState.scenes.mainScene.receipts[0].verificationExpectedDigest).toBe(latestRemotePublishReceipt.receiptDigest);
  expect(revokedRemoteState.scenes.mainScene.receipts[0].cdnPurgeSummary.purgedUrlCount).toBe(1);
  expect(revokedRemoteState.scenes.mainScene.receipts[1].packageId).toBe("e2e-mainScene");
  expect(revokedRemoteState.scenes.mainScene.receipts[1].verificationStatus).toBe("verified");
  await expect(page.locator("#mainRemotePublishRevoke")).toBeDisabled();

  const remoteAuditState = await readJsonLocalStorage(page, ADMIN_AUDIT_KEY);
  const remoteAuditActions = remoteAuditState.scopes.mainScene.records.map((record) => record.action);
  expect(remoteAuditActions).toContain("remote-publish-check");
  expect(remoteAuditActions).toContain("remote-review-request");
  expect(remoteAuditActions).toContain("remote-review-approve");
  expect(remoteAuditActions).toContain("remote-publish-push");
  expect(remoteAuditActions).toContain("remote-publish-revoke");
  const remotePushAudit = remoteAuditState.scopes.mainScene.records.find((record) => record.action === "remote-publish-push");
  expect(remotePushAudit.metadata.workspaceId).toBe("main-remote-e2e");
  expect(remotePushAudit.metadata.packageId).toBe("e2e-mainScene");

  const receiptDownloadPromise = page.waitForEvent("download");
  await page.locator("#mainRemotePublishReceiptExport").click();
  const receiptDownload = await receiptDownloadPromise;
  expect(receiptDownload.suggestedFilename()).toMatch(/^mr-calligraphy-mainScene-remote-receipts-/);
  const receiptDownloadPath = await receiptDownload.path();
  const receiptHtml = fs.readFileSync(receiptDownloadPath, "utf8");
  expect(receiptHtml).toContain("MR 书法远端发布回执审计");
  expect(receiptHtml).toContain("本机校验通过");
  expect(receiptHtml).toContain("重算摘要");
  expect(receiptHtml).toContain(latestRemotePublishReceipt.receiptDigest);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.MR_MAIN_SCENE_SOURCE === "published");
  await expect.poll(async () => {
    const record = await readJsonLocalStorage(page, MAIN_PUBLISHED_KEY);
    return Boolean(record?.layout?.customObjects?.some((item) => item.label === updatedObjectLabel && item.type === "cylinder"));
  }).toBe(true);
});

test("main admin updates imported model material and publishes it", async ({ page }) => {
  test.setTimeout(120_000);
  const importLabel = `E2E 导入外观 ${Date.now()}`;
  const modelPath = path.resolve(__dirname, "../../assets/models/kenney-furniture-kit/books.glb");
  const texturePath = path.resolve(__dirname, "../../assets/cube/floor.png");

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await expect(page.locator("#mainImportModelMaterialUpdate")).toBeDisabled();
  await expect(page.locator("#mainImportModelTexture")).toBeDisabled();
  await expect(page.locator("#mainImportModelTextureClear")).toBeDisabled();
  await unlockMainAdmin(page);

  await page.locator("#mainImportModelName").fill(importLabel);
  await page.locator("#mainImportModel").setInputFiles(modelPath);
  await expect(page.locator("#mainImportStatus")).toContainText(`已导入：${importLabel}`, { timeout: 30_000 });
  await expect(page.locator("#mainImportMaterialStatus")).toContainText(`已载入：${importLabel}`);
  await expect(page.locator("#mainImportModelMaterialUpdate")).toBeEnabled();
  await expect(page.locator("#mainImportModelTexture")).toBeEnabled();
  await expect(page.locator("#mainImportModelTextureClear")).toBeDisabled();

  const importedObjectId = await page.locator("#mainObjectSelect").inputValue();
  await page.locator("#mainImportModelColor").fill("#2255aa");
  await setRangeValue(page, "#mainImportModelOpacity", "0.55");
  await setRangeValue(page, "#mainImportModelRoughness", "0.35");
  await setRangeValue(page, "#mainImportModelMetalness", "0.7");
  await page.locator("#mainImportModelMaterialUpdate").click();
  await expect(page.locator("#mainImportMaterialStatus")).toContainText(`已更新：${importLabel}`);
  await expect(page.locator("#mainPublishDiffList")).toContainText(importLabel);
  await expect(page.locator("#mainPublishDiffList")).toContainText("透明度 0.55");
  await expect(page.locator("#mainPublishDiffList")).toContainText("粗糙度 0.35");
  await expect(page.locator("#mainPublishDiffList")).toContainText("金属度 0.70");

  await page.locator("#mainImportModelTexture").setInputFiles(texturePath);
  await expect(page.locator("#mainImportMaterialStatus")).toContainText("已替换贴图", { timeout: 30_000 });
  await expect(page.locator("#mainImportModelTextureClear")).toBeEnabled();
  await expect(page.locator("#mainPublishDiffList")).toContainText("贴图");
  await expect(page.locator("#mainPublishDiffList")).toContainText("floor.png");

  let layout = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  let importedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(importedRecord).toBeTruthy();
  expect(importedRecord.label).toBe(importLabel);
  expect(importedRecord.color).toBe("#2255aa");
  expect(importedRecord.opacity).toBeCloseTo(0.55, 2);
  expect(importedRecord.roughness).toBeCloseTo(0.35, 2);
  expect(importedRecord.metalness).toBeCloseTo(0.7, 2);
  expect(importedRecord.texture.fileName).toBe("floor.png");
  expect(importedRecord.texture.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(importedRecord.texture.fileBytes).toBeGreaterThan(0);
  const firstTextureKey = importedRecord.texture.dbKey;
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-main-model-store", "models", firstTextureKey)).toBe(true);

  await page.locator("#mainPublishLayout").click();
  await expect(page.locator("#mainPublishStatus")).toContainText("已发布");
  const published = await readJsonLocalStorage(page, MAIN_PUBLISHED_KEY);
  const publishedImportedRecord = published.layout.importedModels.find((item) => item.id === importedObjectId);
  expect(publishedImportedRecord).toBeTruthy();
  expect(publishedImportedRecord.color).toBe("#2255aa");
  expect(publishedImportedRecord.opacity).toBeCloseTo(0.55, 2);
  expect(publishedImportedRecord.roughness).toBeCloseTo(0.35, 2);
  expect(publishedImportedRecord.metalness).toBeCloseTo(0.7, 2);
  expect(publishedImportedRecord.texture.fileName).toBe("floor.png");
  expect(publishedImportedRecord.texture.sha256).toBe(importedRecord.texture.sha256);
  expect(published.stats.importedCount).toBeGreaterThan(0);

  await page.locator("#mainImportModelTextureClear").click();
  await expect(page.locator("#mainImportMaterialStatus")).toContainText("已移除贴图");
  await expect(page.locator("#mainImportModelTextureClear")).toBeDisabled();
  await expect(page.locator("#mainPublishDiffList")).toContainText("贴图 floor.png → 空");
  layout = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  importedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(importedRecord.texture).toBeNull();
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-main-model-store", "models", firstTextureKey)).toBe(true);

  await page.locator("#mainImportModelTexture").setInputFiles(texturePath);
  await expect(page.locator("#mainImportMaterialStatus")).toContainText("已替换贴图", { timeout: 30_000 });
  await expect(page.locator("#mainImportModelTextureClear")).toBeEnabled();
  layout = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  importedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(importedRecord.texture.fileName).toBe("floor.png");
  expect(importedRecord.texture.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(importedRecord.texture.fileBytes).toBeGreaterThan(0);
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-main-model-store", "models", importedRecord.texture.dbKey)).toBe(true);
  const currentTextureKey = importedRecord.texture.dbKey;
  const orphanTextureKey = `e2e-main-orphan-texture-${Date.now()}`;
  await storeImportedAsset(page, "mr-calligraphy-main-model-store", "models", orphanTextureKey, {
    fileName: "e2e-main-orphan-texture.png",
    type: "png",
    mimeType: "image/png",
    sha256: "b".repeat(64),
    fileBytes: 4,
    metrics: { fileBytes: 4 }
  });
  await page.evaluate(() => window.MRMainImportTextureCleanup.refresh());
  await expect(page.locator("#mainImportModelTextureCleanup")).toBeEnabled();
  const mainOrphanRecords = await page.evaluate(() => window.MRMainImportTextureCleanup.getOrphanRecords());
  const mainOrphanKeys = mainOrphanRecords.map((record) => record.dbKey);
  expect(mainOrphanKeys).toContain(orphanTextureKey);
  expect(mainOrphanKeys).not.toContain(firstTextureKey);
  expect(mainOrphanKeys).not.toContain(currentTextureKey);

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#mainImportModelTextureCleanup").click();
  await expect(page.locator("#mainImportStatus")).toContainText(`已清理 ${mainOrphanRecords.length} 个主后台孤立贴图文件`, { timeout: 30_000 });
  await expect(page.locator("#mainImportAuditList")).toContainText("文件已清理");
  await expect(page.locator("#mainImportModelTextureCleanup")).toBeDisabled();
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-main-model-store", "models", orphanTextureKey)).toBe(false);
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-main-model-store", "models", firstTextureKey)).toBe(true);
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-main-model-store", "models", currentTextureKey)).toBe(true);

  await setRangeValue(page, "#mainImportModelRoughness", "0.82");
  await page.locator("#mainImportModelMaterialUpdate").click();
  await expect(page.locator("#mainPublishDiffList")).toContainText("粗糙度 0.35 → 0.82");

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.MR_MAIN_SCENE_SOURCE === "published");
  await page.waitForFunction(() => window.MRRoomAPI?.getMainSceneLayout);
  await expect.poll(
    () => page.evaluate(() => window.MR_LOADED_TEXTURED_MODEL_COUNT || 0),
    { timeout: 30_000 }
  ).toBeGreaterThan(0);
  const frontLayout = await page.evaluate(() => window.MRRoomAPI.getMainSceneLayout());
  const frontImportedRecord = frontLayout.importedModels.find((item) => item.id === importedObjectId);
  expect(frontImportedRecord).toBeTruthy();
  expect(frontImportedRecord.color).toBe("#2255aa");
  expect(frontImportedRecord.opacity).toBeCloseTo(0.55, 2);
  expect(frontImportedRecord.roughness).toBeCloseTo(0.35, 2);
  expect(frontImportedRecord.metalness).toBeCloseTo(0.7, 2);
  expect(frontImportedRecord.texture.fileName).toBe("floor.png");
  expect(frontImportedRecord.texture.sha256).toBe(importedRecord.texture.sha256);
});

test("main admin replaces imported model file and publishes it", async ({ page }) => {
  test.setTimeout(60_000);
  const importLabel = `E2E 导入替换 ${Date.now()}`;
  const initialModelPath = path.resolve(__dirname, "../../assets/models/kenney-furniture-kit/books.glb");
  const replacementModelPath = path.resolve(__dirname, "../../assets/models/kenney-furniture-kit/chair.glb");

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await expect(page.locator("#mainImportModelReplace")).toBeDisabled();
  await unlockMainAdmin(page);

  await page.locator("#mainImportModelName").fill(importLabel);
  await page.locator("#mainImportModel").setInputFiles(initialModelPath);
  await expect(page.locator("#mainImportStatus")).toContainText(`已导入：${importLabel}`, { timeout: 30_000 });
  await expect(page.locator("#mainImportModelReplace")).toBeEnabled();

  const importedObjectId = await page.locator("#mainObjectSelect").inputValue();
  let layout = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  const beforeRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(beforeRecord).toBeTruthy();
  expect(beforeRecord.fileName).toBe("books.glb");
  expect(beforeRecord.sha256).toMatch(/^[a-f0-9]{64}$/);

  await page.locator("#mainImportModelReplace").setInputFiles(replacementModelPath);
  await expect(page.locator("#mainImportStatus")).toContainText("已替换模型文件", { timeout: 30_000 });
  await expect(page.locator("#mainImportMaterialStatus")).toContainText(`已替换：${importLabel}`);

  layout = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  const replacedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(replacedRecord).toBeTruthy();
  expect(replacedRecord.label).toBe(importLabel);
  expect(replacedRecord.fileName).toBe("chair.glb");
  expect(replacedRecord.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(replacedRecord.sha256).not.toBe(beforeRecord.sha256);
  expect(replacedRecord.metrics.fileBytes).toBeGreaterThan(0);

  await page.locator("#mainPublishLayout").click();
  await expect(page.locator("#mainPublishStatus")).toContainText("已发布");
  const published = await readJsonLocalStorage(page, MAIN_PUBLISHED_KEY);
  const publishedRecord = published.layout.importedModels.find((item) => item.id === importedObjectId);
  expect(publishedRecord).toBeTruthy();
  expect(publishedRecord.fileName).toBe("chair.glb");
  expect(publishedRecord.sha256).toBe(replacedRecord.sha256);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.MR_MAIN_SCENE_SOURCE === "published");
  await page.waitForFunction(() => window.MRRoomAPI?.getMainSceneLayout);
  const frontLayout = await page.evaluate(() => window.MRRoomAPI.getMainSceneLayout());
  const frontRecord = frontLayout.importedModels.find((item) => item.id === importedObjectId);
  expect(frontRecord).toBeTruthy();
  expect(frontRecord.fileName).toBe("chair.glb");
  expect(frontRecord.sha256).toBe(replacedRecord.sha256);
});

test("main admin records imported model deletion audit", async ({ page }) => {
  test.setTimeout(60_000);
  const importLabel = `E2E 导入删除审计 ${Date.now()}`;
  const modelPath = path.resolve(__dirname, "../../assets/models/kenney-furniture-kit/books.glb");

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await expect(page.locator("#mainImportAuditStatus")).toContainText("尚无导入模型删除记录");
  await expect(page.locator("#mainImportAuditCleanup")).toBeDisabled();
  await expect(page.locator("#mainImportAuditExport")).toBeDisabled();
  await unlockMainAdmin(page);

  await page.locator("#mainImportModelName").fill(importLabel);
  await page.locator("#mainImportModel").setInputFiles(modelPath);
  await expect(page.locator("#mainImportStatus")).toContainText(`已导入：${importLabel}`, { timeout: 30_000 });
  await expect(page.locator("#mainObjectSelect")).toContainText(importLabel);

  const importedObjectId = await page.locator("#mainObjectSelect").inputValue();
  let layout = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  const importedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(importedRecord).toBeTruthy();
  expect(importedRecord.label).toBe(importLabel);
  expect(importedRecord.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(importedRecord.metrics.fileBytes).toBeGreaterThan(0);

  await page.locator("#mainObjectDelete").click();
  await expect(page.locator("#mainImportAuditStatus")).toContainText("已记录 1 条导入模型删除审计", { timeout: 10_000 });
  await expect(page.locator("#mainImportAuditList")).toContainText(importLabel);
  await expect(page.locator("#mainImportAuditList")).toContainText("历史保留");
  await expect(page.locator("#mainImportAuditCleanup")).toBeEnabled();
  await expect(page.locator("#mainImportAuditExport")).toBeEnabled();

  layout = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  expect(layout.importedModels.some((item) => item.id === importedObjectId)).toBe(false);
  const auditLog = await readJsonLocalStorage(page, MAIN_IMPORT_AUDIT_KEY);
  expect(auditLog.records).toHaveLength(1);
  expect(auditLog.records[0].modelId).toBe(importedObjectId);
  expect(auditLog.records[0].label).toBe(importLabel);
  expect(auditLog.records[0].cleanupStatus).toBe("retained-for-history");
  expect(auditLog.records[0].referencedByHistory).toBe(true);
  expect(auditLog.records[0].sha256).toBe(importedRecord.sha256);
  const storedBeforeCleanup = await hasStoredImportedAsset(page, "mr-calligraphy-main-model-store", "models", importedRecord.dbKey || importedObjectId);
  expect(storedBeforeCleanup).toBe(true);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainImportAuditList")).toContainText(importLabel);
  await expect(page.locator("#mainImportAuditCleanup")).toBeEnabled();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#mainImportAuditCleanup").click();
  await expect(page.locator("#mainImportStatus")).toContainText("已清理 1 个主场景历史导入模型文件", { timeout: 30_000 });
  await expect(page.locator("#mainImportAuditList")).toContainText("文件已清理");
  await expect(page.locator("#mainImportAuditCleanup")).toBeDisabled();

  const cleanedAuditLog = await readJsonLocalStorage(page, MAIN_IMPORT_AUDIT_KEY);
  expect(cleanedAuditLog.records).toHaveLength(1);
  expect(cleanedAuditLog.records[0].modelId).toBe(importedObjectId);
  expect(cleanedAuditLog.records[0].cleanupStatus).toBe("storage-deleted");
  expect(cleanedAuditLog.records[0].sha256).toBe(importedRecord.sha256);
  const storedAfterCleanup = await hasStoredImportedAsset(page, "mr-calligraphy-main-model-store", "models", importedRecord.dbKey || importedObjectId);
  expect(storedAfterCleanup).toBe(false);

  const exportResult = await page.evaluate(() => window.MRMainImportAudit.getAuditExport());
  expect(exportResult.ok).toBe(true);
  expect(exportResult.html).toContain("MR 书法主场景导入模型删除审计");
  expect(exportResult.html).toContain(importLabel);
  expect(exportResult.html).toContain(importedRecord.sha256);
  expect(exportResult.html).toContain("文件已清理");

  const auditDownloadPromise = page.waitForEvent("download");
  await page.locator("#mainImportAuditExport").click();
  const auditDownload = await auditDownloadPromise;
  expect(auditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-main-import-audit-.*\.html$/);
  const auditPath = await auditDownload.path();
  const auditHtml = fs.readFileSync(auditPath, "utf8");
  expect(auditHtml).toContain("MR 书法主场景导入模型删除审计");
  expect(auditHtml).toContain(importLabel);
  expect(auditHtml).toContain(importedRecord.sha256);
  expect(auditHtml).toContain("文件已清理");
});

test("main admin project repository keeps local data on remote failures", async ({ page }) => {
  const rejectedCheckPath = "/e2e-project-repository-rejected-check";
  const invalidJsonPath = "/e2e-project-repository-invalid-json";
  const emptyPullPath = "/e2e-project-repository-empty-pull";
  const rejectedPushPath = "/e2e-project-repository-rejected-push";
  const networkPushPath = "/e2e-project-repository-network-push";
  const recoveryPushPath = "/e2e-project-repository-recovery-push";
  const projectRepositoryRequests = [];
  const objectLabel = `E2E 项目仓库失败保留 ${Date.now()}`;

  await page.route(`**${rejectedCheckPath}`, async (route) => {
    const request = route.request();
    projectRepositoryRequests.push({
      path: rejectedCheckPath,
      method: request.method(),
      authorization: request.headers().authorization || ""
    });
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "项目仓库远端 E2E 拒绝检查。"
      })
    });
  });

  await page.route(`**${invalidJsonPath}`, async (route) => {
    const request = route.request();
    projectRepositoryRequests.push({
      path: invalidJsonPath,
      method: request.method(),
      authorization: request.headers().authorization || ""
    });
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>not json</title>"
    });
  });

  await page.route(`**${emptyPullPath}**`, async (route) => {
    const request = route.request();
    projectRepositoryRequests.push({
      path: emptyPullPath,
      method: request.method(),
      authorization: request.headers().authorization || ""
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "项目仓库远端 E2E 可访问，但没有返回项目仓库包。",
        remoteVersion: "e2e-empty-project-repository-v1"
      })
    });
  });

  await page.route(`**${rejectedPushPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    projectRepositoryRequests.push({
      path: rejectedPushPath,
      method,
      authorization: request.headers().authorization || "",
      body
    });
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        message: "项目仓库包结构被 E2E 服务端拒绝。"
      })
    });
  });

  await page.route(`**${networkPushPath}`, async (route) => {
    const request = route.request();
    projectRepositoryRequests.push({
      path: networkPushPath,
      method: request.method(),
      authorization: request.headers().authorization || ""
    });
    await route.abort("failed");
  });

  await page.route(`**${recoveryPushPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    projectRepositoryRequests.push({
      path: recoveryPushPath,
      method,
      authorization: request.headers().authorization || "",
      workspaceId: request.headers()["x-mr-workspace-id"] || "",
      body
    });
    if (method !== "PUT") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "项目仓库恢复端 E2E 可访问。",
          remoteVersion: "e2e-project-recovery-check-v1",
          versions: []
        })
      });
      return;
    }
    const workspaceId = request.headers()["x-mr-workspace-id"] || "local-browser";
    const validation = validateProjectRepositoryPackage(body, { workspaceId });
    expect(validation.ok, validation.message).toBe(true);
    const acceptedAt = new Date(Date.UTC(2026, 5, 13, 9, 15, 0)).toISOString();
    const repositoryDigest = body.packageDigest;
    const receiptDigest = sha256StableJson({
      sourcePackageId: body.packageId,
      workspaceId,
      repositoryDigest,
      acceptedAt
    });
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "项目仓库恢复端 E2E 已接收。",
        packageId: "e2e-project-recovery-package",
        workspaceId,
        packageDigest: body.packageDigest,
        repositoryDigest,
        remoteVersion: "e2e-project-recovery-v1",
        selectedVersion: {
          packageId: "e2e-project-recovery-package",
          sourcePackageId: body.packageId,
          workspaceId,
          packageDigest: body.packageDigest,
          repositoryDigest,
          remoteVersion: "e2e-project-recovery-v1",
          acceptedAt,
          sceneCount: body.summary.sceneCount,
          modelCount: body.summary.importedModels,
          summary: body.summary
        },
        versions: [{
          packageId: "e2e-project-recovery-package",
          sourcePackageId: body.packageId,
          workspaceId,
          packageDigest: body.packageDigest,
          repositoryDigest,
          remoteVersion: "e2e-project-recovery-v1",
          acceptedAt,
          sceneCount: body.summary.sceneCount,
          modelCount: body.summary.importedModels,
          summary: body.summary
        }],
        receipt: {
          receiptKind: "mr-calligraphy-project-repository-receipt-v1",
          packageId: "e2e-project-recovery-package",
          sourcePackageId: body.packageId,
          workspaceId,
          packageDigest: body.packageDigest,
          repositoryDigest,
          remoteVersion: "e2e-project-recovery-v1",
          acceptedAt,
          message: "项目仓库恢复端 E2E 回执。",
          sceneCount: body.summary.sceneCount,
          modelCount: body.summary.importedModels,
          receiptDigest
        }
      })
    });
  });

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await unlockMainAdmin(page);
  await page.locator("#mainNewObjectName").fill(objectLabel);
  await page.locator("#mainNewObjectType").selectOption("box");
  await page.locator("#mainNewObjectAdd").click();
  await expect(page.locator("#mainCustomStatus")).toContainText(`已新增：${objectLabel}`);
  await page.locator(".project-repository-remote summary").click();

  await configureProjectRepositoryRemoteInUi(page, await getSameOriginEndpoint(page, rejectedCheckPath), "project-rejected-check-token");
  await page.locator("#projectRepositoryCheckRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("HTTP 401");
  let projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.lastError).toContain("HTTP 401");
  expect(projectRepositoryRequests.some((item) => item.path === rejectedCheckPath && item.method === "GET" && item.authorization === "Bearer project-rejected-check-token")).toBe(true);

  await configureProjectRepositoryRemoteInUi(page, await getSameOriginEndpoint(page, invalidJsonPath), "project-invalid-json-token");
  await page.locator("#projectRepositoryCheckRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("不是 JSON");
  projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.lastError).toContain("不是 JSON");
  expect(projectRepositoryRequests.some((item) => item.path === invalidJsonPath && item.method === "GET" && item.authorization === "Bearer project-invalid-json-token")).toBe(true);

  await configureProjectRepositoryRemoteInUi(page, await getSameOriginEndpoint(page, emptyPullPath), "project-empty-pull-token");
  await page.locator("#projectRepositoryPullRemote").click();
  await expect(page.locator("#projectArchiveStatus")).toContainText("远端响应中没有项目仓库包");
  projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.lastError).toContain("远端响应中没有项目仓库包");
  expect(projectRepositoryRequests.some((item) => item.path === emptyPullPath && item.method === "GET" && item.authorization === "Bearer project-empty-pull-token")).toBe(true);

  await configureProjectRepositoryRemoteInUi(page, await getSameOriginEndpoint(page, rejectedPushPath), "project-rejected-push-token");
  await page.locator("#projectRepositoryPushRemote").click();
  await expect(page.locator("#projectArchiveStatus")).toContainText("HTTP 422");
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("失败历史");
  await expect(page.locator("#projectRepositoryPushRemote")).toHaveText("重试推送");
  projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.lastError).toContain("HTTP 422");
  expect(projectRepositoryState.lastFailureAction).toBe("push");
  expect(projectRepositoryState.remoteRetryAfter).toBeTruthy();
  expect(projectRepositoryState.remoteFailureHistory[0].failureKind).toBe("http");
  expect(projectRepositoryState.remoteFailureHistory[0].action).toBe("push");
  const rejectedPut = projectRepositoryRequests.find((item) => item.path === rejectedPushPath && item.method === "PUT");
  expect(rejectedPut.authorization).toBe("Bearer project-rejected-push-token");
  expect(rejectedPut.body.kind).toBe("mr-calligraphy-project-repository-package-v1");
  expect(rejectedPut.body.archive.kind).toBe("mr-calligraphy-project-archive");
  expect(rejectedPut.body.projectSchema.kind).toBe("mr-calligraphy-project-schema");

  await configureProjectRepositoryRemoteInUi(page, await getSameOriginEndpoint(page, networkPushPath), "project-network-push-token");
  await page.locator("#projectRepositoryPushRemote").click();
  await expect(page.locator("#projectArchiveStatus")).toContainText("网络请求异常");
  projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.lastError).toContain("网络请求异常");
  expect(projectRepositoryState.remoteFailureHistory[0].failureKind).toBe("network");
  expect(projectRepositoryState.remoteFailureHistory[0].action).toBe("push");
  expect(projectRepositoryRequests.some((item) => item.path === networkPushPath && item.method === "PUT" && item.authorization === "Bearer project-network-push-token")).toBe(true);

  const timeoutResult = await page.evaluate(async () => {
    const originalFetch = window.fetch;
    window.fetch = () => new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Response(JSON.stringify({
          ok: true,
          message: "项目仓库远端 E2E 慢响应。",
          remoteVersion: "e2e-project-timeout-late"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));
      }, 50);
    });
    try {
      return await window.MRProjectArchive.checkProjectRepositoryRemote({
        timeoutMs: 1,
        retryDelayMs: 5
      });
    } finally {
      window.fetch = originalFetch;
    }
  });
  expect(timeoutResult.ok).toBe(false);
  expect(timeoutResult.message).toContain("请求超时");
  projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.remoteFailureHistory[0].failureKind).toBe("timeout");
  expect(projectRepositoryState.remoteFailureHistory[0].action).toBe("check");
  expect(projectRepositoryState.remoteRetryAfter).toBeTruthy();

  await configureProjectRepositoryRemoteInUi(page, await getSameOriginEndpoint(page, recoveryPushPath), "project-recovery-token");
  await expect(page.locator("#projectRepositoryPushRemote")).toHaveText("重试推送");
  await page.locator("#projectRepositoryPushRemote").click();
  await expect(page.locator("#projectArchiveStatus")).toContainText("项目仓库恢复端 E2E 已接收");
  await expect(page.locator("#projectRepositoryPushRemote")).toHaveText("推送仓库包");
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("项目仓库恢复端 E2E 已接收");
  projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.lastError).toBe("");
  expect(projectRepositoryState.remoteRetryAfter).toBe("");
  expect(projectRepositoryState.remoteFailureHistory.length).toBeGreaterThanOrEqual(5);
  expect(projectRepositoryState.remoteFailureHistory[0].failureKind).toBe("timeout");
  expect(projectRepositoryState.lastPackageId).toBe("e2e-project-recovery-package");
  expect(projectRepositoryState.lastRemoteVersion).toBe("e2e-project-recovery-v1");
  expect(projectRepositoryState.receipts[0].verificationStatus).toBe("verified");
  const recoveryPut = projectRepositoryRequests.find((item) => item.path === recoveryPushPath && item.method === "PUT");
  expect(recoveryPut.authorization).toBe("Bearer project-recovery-token");
  expect(recoveryPut.workspaceId).toBe("local-browser");
  expect(recoveryPut.body.kind).toBe("mr-calligraphy-project-repository-package-v1");

  const layout = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  expect(layout.customObjects.some((item) => item.label === objectLabel)).toBe(true);
});

test("realistic admin keeps local publish releases and rollback history", async ({ page }) => {
  test.setTimeout(90_000);
  const firstNote = `E2E 写实初版 ${Date.now()}`;
  const secondNote = `E2E 写实二版 ${Date.now()}`;

  await page.goto("/realistic-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#designObjectSelect")).toBeVisible();
  await expect(page.locator("#realisticPublishNote")).toBeVisible();
  await unlockRealisticAdmin(page);
  await expectCanvasHasVisiblePixels(page, "#realisticCanvas");
  await page.locator("#realisticAdminOperatorName").fill("E2E 写实后台");
  await page.locator("#realisticAdminOperatorRole").selectOption("editor");
  await page.locator("#realisticAdminOperatorSave").click();
  await expect(page.locator("#realisticAdminOperatorStatus")).toContainText("E2E 写实后台");
  const selectedDesignObjectId = await page.locator("#designObjectSelect").inputValue();

  await expect(page.locator("#deleteObject")).toBeEnabled();
  await expect(page.locator("#restoreObject")).toBeDisabled();
  await page.locator("#deleteObject").click();
  await expect(page.locator("#restoreObject")).toBeEnabled();
  await expect(page.locator("#deleteObject")).toBeDisabled();
  await expect(page.locator("#designObjectSelect option:checked")).toContainText("已删除");
  let draftLayout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  expect(draftLayout[selectedDesignObjectId].deleted).toBe(true);

  await page.locator("#restoreObject").click();
  await expect(page.locator("#deleteObject")).toBeEnabled();
  await expect(page.locator("#restoreObject")).toBeDisabled();
  draftLayout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  expect(draftLayout[selectedDesignObjectId].deleted).toBe(false);

  await page.locator("#deleteObject").click();
  await expect(page.locator("#restoreObject")).toBeEnabled();
  await page.locator("#undoAction").click();
  await expect(page.locator("#deleteObject")).toBeEnabled();
  await expect(page.locator("#restoreObject")).toBeDisabled();
  draftLayout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  expect(draftLayout[selectedDesignObjectId].deleted).toBe(false);

  await page.locator("#realisticPublishNote").fill(firstNote);
  await page.locator("#realisticPublishLayout").click();
  await expect(page.locator("#realisticPublishStatus")).toContainText("已发布");
  await expect(page.locator("#realisticPublishDiffSummary")).toContainText("一致");
  let adminAudit = await readJsonLocalStorage(page, ADMIN_AUDIT_KEY);
  expect(adminAudit.scopes.realisticScene.operator.name).toBe("E2E 写实后台");
  expect(adminAudit.scopes.realisticScene.operator.role).toBe("editor");
  expect(adminAudit.scopes.realisticScene.records.some((record) => record.action === "publish-local" && record.operator.name === "E2E 写实后台")).toBe(true);
  expect(adminAudit.scopes.realisticScene.records.some((record) => record.action === "snapshot" && record.operator.name === "E2E 写实后台")).toBe(true);
  await expect(page.locator("#realisticAdminAuditList")).toContainText("本机发布");

  const currentX = Number.parseFloat(await page.locator("#designX").inputValue());
  await page.locator("#designX").fill((currentX + 0.2).toFixed(2));
  await page.locator("#designX").blur();
  await expect(page.locator("#realisticPublishDiffSummary")).toContainText("待发布差异");

  await page.locator("#realisticPublishNote").fill(secondNote);
  await page.locator("#realisticPublishLayout").click();
  await expect(page.locator("#realisticPublishStatus")).toContainText("v2");
  await expect(page.locator("#realisticPublishDiffSummary")).toContainText("一致");

  let published = await readJsonLocalStorage(page, REALISTIC_PUBLISHED_KEY);
  expect(published.releaseNumber).toBe(2);
  expect(published.releases).toHaveLength(2);
  expect(published.releases[0].note).toBe(secondNote);
  expect(published.releases[1].note).toBe(firstNote);

  await page.locator("#realisticPublishHistoryList [data-publish-action='rollback']").nth(1).click();
  await expect(page.locator("#realisticPublishStatus")).toContainText("已回滚");

  published = await readJsonLocalStorage(page, REALISTIC_PUBLISHED_KEY);
  expect(published.releaseNumber).toBe(3);
  expect(published.action).toBe("rollback");
  expect(published.rollbackFrom).toBe(published.releases[2].id);
  expect(published.releases[0].note).toContain("回滚到 v1");
});

test("realistic admin updates imported model material and publishes it", async ({ page }) => {
  test.setTimeout(150_000);
  const modelPath = path.resolve(__dirname, "../../assets/models/kenney-furniture-kit/books.glb");
  const texturePath = path.resolve(__dirname, "../../assets/cube/wall-wood-front.png");

  await page.goto("/realistic-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#designObjectSelect")).toBeVisible();
  await expect(page.locator("#realisticImportModelMaterialUpdate")).toBeDisabled();
  await expect(page.locator("#realisticImportModelTexture")).toBeDisabled();
  await expect(page.locator("#realisticImportModelTextureClear")).toBeDisabled();
  await unlockRealisticAdmin(page);

  await page.locator("#importModelInput").setInputFiles(modelPath);
  await expect(page.locator("#importStatus")).toContainText("已导入 books.glb", { timeout: 30_000 });
  await expect(page.locator("#realisticImportMaterialStatus")).toContainText("已载入：books");
  await expect(page.locator("#realisticImportModelMaterialUpdate")).toBeEnabled();
  await expect(page.locator("#realisticImportModelTexture")).toBeEnabled();
  await expect(page.locator("#realisticImportModelTextureClear")).toBeDisabled();

  const importedObjectId = await page.locator("#designObjectSelect").inputValue();
  await page.locator("#realisticImportModelColor").fill("#2255aa");
  await setRangeValue(page, "#realisticImportModelOpacity", "0.6");
  await setRangeValue(page, "#realisticImportModelRoughness", "0.4");
  await setRangeValue(page, "#realisticImportModelMetalness", "0.65");
  await page.locator("#realisticImportModelMaterialUpdate").click();
  await expect(page.locator("#realisticImportMaterialStatus")).toContainText("已更新：books");
  await expect(page.locator("#realisticPublishDiffList")).toContainText("books");
  await expect(page.locator("#realisticPublishDiffList")).toContainText("透明度 0.60");
  await expect(page.locator("#realisticPublishDiffList")).toContainText("粗糙度 0.40");
  await expect(page.locator("#realisticPublishDiffList")).toContainText("金属度 0.65");

  await page.locator("#realisticImportModelTexture").setInputFiles(texturePath);
  await expect(page.locator("#realisticImportMaterialStatus")).toContainText("已替换贴图", { timeout: 30_000 });
  await expect(page.locator("#realisticImportModelTextureClear")).toBeEnabled();
  await expect(page.locator("#realisticPublishDiffList")).toContainText("贴图");
  await expect(page.locator("#realisticPublishDiffList")).toContainText("wall-wood-front.png");

  let layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  let importedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(importedRecord).toBeTruthy();
  expect(importedRecord.fileName).toBe("books.glb");
  expect(importedRecord.color).toBe("#2255aa");
  expect(importedRecord.opacity).toBeCloseTo(0.6, 2);
  expect(importedRecord.roughness).toBeCloseTo(0.4, 2);
  expect(importedRecord.metalness).toBeCloseTo(0.65, 2);
  expect(importedRecord.texture.fileName).toBe("wall-wood-front.png");
  expect(importedRecord.texture.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(importedRecord.texture.fileBytes).toBeGreaterThan(0);
  const firstTextureKey = importedRecord.texture.dbKey;
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-model-store", "models", firstTextureKey)).toBe(true);

  await page.locator("#realisticPublishLayout").click();
  await expect(page.locator("#realisticPublishStatus")).toContainText("已发布到演示");
  const published = await readJsonLocalStorage(page, REALISTIC_PUBLISHED_KEY);
  const publishedImportedRecord = published.layout.importedModels.find((item) => item.id === importedObjectId);
  expect(publishedImportedRecord).toBeTruthy();
  expect(publishedImportedRecord.color).toBe("#2255aa");
  expect(publishedImportedRecord.opacity).toBeCloseTo(0.6, 2);
  expect(publishedImportedRecord.roughness).toBeCloseTo(0.4, 2);
  expect(publishedImportedRecord.metalness).toBeCloseTo(0.65, 2);
  expect(publishedImportedRecord.texture.fileName).toBe("wall-wood-front.png");
  expect(publishedImportedRecord.texture.sha256).toBe(importedRecord.texture.sha256);
  expect(published.stats.importedCount).toBeGreaterThan(0);

  await page.locator("#realisticImportModelTextureClear").click();
  await expect(page.locator("#realisticImportMaterialStatus")).toContainText("已移除贴图");
  await expect(page.locator("#realisticImportModelTextureClear")).toBeDisabled();
  await expect(page.locator("#realisticPublishDiffList")).toContainText("贴图 wall-wood-front.png → 空");
  layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  importedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(importedRecord.texture).toBeNull();
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-model-store", "models", firstTextureKey)).toBe(true);

  await page.locator("#realisticImportModelTexture").setInputFiles(texturePath);
  await expect(page.locator("#realisticImportMaterialStatus")).toContainText("已替换贴图", { timeout: 30_000 });
  await expect(page.locator("#realisticImportModelTextureClear")).toBeEnabled();
  layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  importedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(importedRecord.texture.fileName).toBe("wall-wood-front.png");
  expect(importedRecord.texture.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(importedRecord.texture.fileBytes).toBeGreaterThan(0);
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-model-store", "models", importedRecord.texture.dbKey)).toBe(true);
  const currentTextureKey = importedRecord.texture.dbKey;
  const orphanTextureKey = `e2e-realistic-orphan-texture-${Date.now()}`;
  await storeImportedAsset(page, "mr-calligraphy-model-store", "models", orphanTextureKey, {
    fileName: "e2e-realistic-orphan-texture.png",
    type: "png",
    mimeType: "image/png",
    sha256: "c".repeat(64),
    fileBytes: 4,
    metrics: { fileBytes: 4 }
  });
  await page.evaluate(() => window.MRRealisticImportTextureCleanup.refresh());
  await expect(page.locator("#realisticImportModelTextureCleanup")).toBeEnabled();
  const realisticOrphanRecords = await page.evaluate(() => window.MRRealisticImportTextureCleanup.getOrphanRecords());
  const realisticOrphanKeys = realisticOrphanRecords.map((record) => record.dbKey);
  expect(realisticOrphanKeys).toContain(orphanTextureKey);
  expect(realisticOrphanKeys).not.toContain(firstTextureKey);
  expect(realisticOrphanKeys).not.toContain(currentTextureKey);

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#realisticImportModelTextureCleanup").click();
  await expect(page.locator("#importStatus")).toContainText(`已清理 ${realisticOrphanRecords.length} 个写实孤立贴图文件`, { timeout: 30_000 });
  await expect(page.locator("#realisticImportAuditList")).toContainText("文件已清理");
  await expect(page.locator("#realisticImportModelTextureCleanup")).toBeDisabled();
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-model-store", "models", orphanTextureKey)).toBe(false);
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-model-store", "models", firstTextureKey)).toBe(true);
  expect(await hasStoredImportedAsset(page, "mr-calligraphy-model-store", "models", currentTextureKey)).toBe(true);

  await setRangeValue(page, "#realisticImportModelMetalness", "0.25");
  await page.locator("#realisticImportModelMaterialUpdate").click();
  await expect(page.locator("#realisticPublishDiffList")).toContainText("金属度 0.65 → 0.25");

  await page.goto("/realistic-demo.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.MR_REALISTIC_SCENE_SOURCE === "published");
  await page.waitForFunction(() => window.MRRealisticScene?.getLayout);
  layout = await page.evaluate(() => window.MRRealisticScene.getLayout());
  const demoImportedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(demoImportedRecord).toBeTruthy();
  expect(demoImportedRecord.color).toBe("#2255aa");
  expect(demoImportedRecord.opacity).toBeCloseTo(0.6, 2);
  expect(demoImportedRecord.roughness).toBeCloseTo(0.4, 2);
  expect(demoImportedRecord.metalness).toBeCloseTo(0.65, 2);
  expect(demoImportedRecord.texture.fileName).toBe("wall-wood-front.png");
  expect(demoImportedRecord.texture.sha256).toBe(importedRecord.texture.sha256);
});

test("realistic admin replaces imported model file and publishes it", async ({ page }) => {
  test.setTimeout(60_000);
  const initialModelPath = path.resolve(__dirname, "../../assets/models/kenney-furniture-kit/books.glb");
  const replacementModelPath = path.resolve(__dirname, "../../assets/models/kenney-furniture-kit/chair.glb");

  await page.goto("/realistic-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#designObjectSelect")).toBeVisible();
  await expect(page.locator("#realisticImportModelReplace")).toBeDisabled();
  await unlockRealisticAdmin(page);

  await page.locator("#importModelInput").setInputFiles(initialModelPath);
  await expect(page.locator("#importStatus")).toContainText("已导入 books.glb", { timeout: 30_000 });
  await expect(page.locator("#realisticImportModelReplace")).toBeEnabled();

  const importedObjectId = await page.locator("#designObjectSelect").inputValue();
  let layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  const beforeRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(beforeRecord).toBeTruthy();
  expect(beforeRecord.fileName).toBe("books.glb");
  expect(beforeRecord.sha256).toMatch(/^[a-f0-9]{64}$/);

  await page.locator("#realisticImportModelReplace").setInputFiles(replacementModelPath);
  await expect(page.locator("#importStatus")).toContainText("已替换写实导入模型", { timeout: 30_000 });
  await expect(page.locator("#realisticImportMaterialStatus")).toContainText("已替换：books");

  layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  const replacedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(replacedRecord).toBeTruthy();
  expect(replacedRecord.label).toBe("books");
  expect(replacedRecord.fileName).toBe("chair.glb");
  expect(replacedRecord.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(replacedRecord.sha256).not.toBe(beforeRecord.sha256);
  expect(replacedRecord.metrics.fileBytes).toBeGreaterThan(0);

  await page.locator("#realisticPublishLayout").click();
  await expect(page.locator("#realisticPublishStatus")).toContainText("已发布到演示");
  const published = await readJsonLocalStorage(page, REALISTIC_PUBLISHED_KEY);
  const publishedRecord = published.layout.importedModels.find((item) => item.id === importedObjectId);
  expect(publishedRecord).toBeTruthy();
  expect(publishedRecord.fileName).toBe("chair.glb");
  expect(publishedRecord.sha256).toBe(replacedRecord.sha256);

  await page.goto("/realistic-demo.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.MR_REALISTIC_SCENE_SOURCE === "published");
  await page.waitForFunction(() => window.MRRealisticScene?.getLayout);
  layout = await page.evaluate(() => window.MRRealisticScene.getLayout());
  const demoRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(demoRecord).toBeTruthy();
  expect(demoRecord.fileName).toBe("chair.glb");
  expect(demoRecord.sha256).toBe(replacedRecord.sha256);
});

test("realistic admin records imported model deletion audit", async ({ page }) => {
  test.setTimeout(60_000);
  const modelPath = path.resolve(__dirname, "../../assets/models/kenney-furniture-kit/books.glb");

  await page.goto("/realistic-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#designObjectSelect")).toBeVisible();
  await expect(page.locator("#realisticImportAuditStatus")).toContainText("尚无写实导入模型删除记录");
  await expect(page.locator("#realisticImportAuditCleanup")).toBeDisabled();
  await expect(page.locator("#realisticImportAuditExport")).toBeDisabled();
  await unlockRealisticAdmin(page);

  await page.locator("#importModelInput").setInputFiles(modelPath);
  await expect(page.locator("#importStatus")).toContainText("已导入 books.glb", { timeout: 30_000 });
  await expect(page.locator("#designObjectSelect")).toContainText("books");
  await expect(page.locator("#realisticImportAuditCleanup")).toBeDisabled();
  const importedObjectId = await page.locator("#designObjectSelect").inputValue();

  let layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  const importedRecord = layout.importedModels.find((item) => item.id === importedObjectId);
  expect(importedRecord).toBeTruthy();
  expect(importedRecord.fileName).toBe("books.glb");
  expect(importedRecord.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(importedRecord.metrics.fileBytes).toBeGreaterThan(0);

  await page.locator("#deleteObject").click();
  await expect(page.locator("#realisticImportAuditStatus")).toContainText("已记录 1 条写实导入模型审计");
  await expect(page.locator("#realisticImportAuditList")).toContainText("books");
  await expect(page.locator("#realisticImportAuditList")).toContainText("资产保留，可恢复");
  await expect(page.locator("#realisticImportAuditCleanup")).toBeEnabled();

  layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  expect(layout[importedObjectId].deleted).toBe(true);
  let auditLog = await readJsonLocalStorage(page, REALISTIC_IMPORT_AUDIT_KEY);
  expect(auditLog.records).toHaveLength(1);
  expect(auditLog.records[0].modelId).toBe(importedObjectId);
  expect(auditLog.records[0].cleanupStatus).toBe("soft-deleted-retained");
  expect(auditLog.records[0].sha256).toBe(importedRecord.sha256);

  await page.locator("#restoreObject").click();
  await expect(page.locator("#realisticImportAuditStatus")).toContainText("已记录 2 条写实导入模型审计");
  await expect(page.locator("#realisticImportAuditList")).toContainText("已恢复显示");
  layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  expect(layout[importedObjectId].deleted).toBe(false);
  await expect(page.locator("#realisticImportAuditCleanup")).toBeDisabled();
  auditLog = await readJsonLocalStorage(page, REALISTIC_IMPORT_AUDIT_KEY);
  expect(auditLog.records[0].cleanupStatus).toBe("restored");
  expect(auditLog.records[1].cleanupStatus).toBe("soft-deleted-retained");

  await page.locator("#deleteObject").click();
  await expect(page.locator("#realisticImportAuditCleanup")).toBeEnabled();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#realisticImportAuditCleanup").click();
  await expect(page.locator("#importStatus")).toContainText("已清理 1 个写实导入模型文件", { timeout: 30_000 });
  await expect(page.locator("#realisticImportAuditList")).toContainText("文件已清理");
  await expect(page.locator("#realisticImportAuditCleanup")).toBeDisabled();

  layout = await readJsonLocalStorage(page, REALISTIC_LAYOUT_KEY);
  expect(layout.importedModels.some((item) => item.id === importedObjectId)).toBe(false);
  expect(layout[importedObjectId]).toBeUndefined();
  auditLog = await readJsonLocalStorage(page, REALISTIC_IMPORT_AUDIT_KEY);
  expect(auditLog.records[0].cleanupStatus).toBe("storage-deleted");
  expect(auditLog.records[0].modelId).toBe(importedObjectId);
  expect(auditLog.records[0].sha256).toBe(importedRecord.sha256);
  const storedAfterCleanup = await hasStoredImportedModel(page, importedRecord.dbKey || importedObjectId);
  expect(storedAfterCleanup).toBe(false);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#realisticImportAuditList")).toContainText("books");
  await expect(page.locator("#realisticImportAuditList")).toContainText("文件已清理");
  const exportResult = await page.evaluate(() => window.MRRealisticImportAudit.getAuditExport());
  expect(exportResult.ok).toBe(true);
  expect(exportResult.html).toContain("MR 书法写实导入模型删除审计");
  expect(exportResult.html).toContain("资产文件保留在 IndexedDB");
  expect(exportResult.html).toContain("清理已删除文件");
  expect(exportResult.html).toContain(importedRecord.sha256);

  const auditDownloadPromise = page.waitForEvent("download");
  await page.locator("#realisticImportAuditExport").click();
  const auditDownload = await auditDownloadPromise;
  expect(auditDownload.suggestedFilename()).toMatch(/^mr-calligraphy-realistic-import-audit-.*\.html$/);
  const auditPath = await auditDownload.path();
  const auditHtml = fs.readFileSync(auditPath, "utf8");
  expect(auditHtml).toContain("MR 书法写实导入模型删除审计");
  expect(auditHtml).toContain(importedRecord.sha256);
  expect(auditHtml).toContain("文件已清理");
});

async function drawPracticeStroke(page) {
  const canvas = page.locator("#practiceCanvas");
  await expect(canvas).toBeVisible();
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  const points = [
    [0.28, 0.36],
    [0.42, 0.43],
    [0.56, 0.5],
    [0.7, 0.58]
  ];
  await page.mouse.move(box.x + box.width * points[0][0], box.y + box.height * points[0][1]);
  await page.mouse.down();
  for (const [x, y] of points.slice(1)) {
    await page.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 8 });
  }
  await page.mouse.up();
}

async function readJsonLocalStorage(page, key) {
  return page.evaluate((storageKey) => {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  }, key);
}

async function setRangeValue(page, selector, value) {
  await page.locator(selector).evaluate((input, nextValue) => {
    input.value = nextValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function hasStoredImportedModel(page, dbKey) {
  return page.evaluate((modelDbKey) => {
    return new Promise((resolve, reject) => {
      const openRequest = window.indexedDB.open("mr-calligraphy-model-store", 1);
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains("models")) {
          db.close();
          resolve(false);
          return;
        }
        const transaction = db.transaction("models", "readonly");
        const request = transaction.objectStore("models").get(modelDbKey);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(Boolean(request.result));
        transaction.oncomplete = () => db.close();
      };
    });
  }, dbKey);
}

async function hasStoredImportedAsset(page, dbName, storeName, dbKey) {
  return page.evaluate(({ name, store, key }) => {
    return new Promise((resolve, reject) => {
      const openRequest = window.indexedDB.open(name, 1);
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains(store)) {
          db.close();
          resolve(false);
          return;
        }
        const transaction = db.transaction(store, "readonly");
        const request = transaction.objectStore(store).get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(Boolean(request.result?.arrayBuffer?.byteLength));
        transaction.oncomplete = () => db.close();
      };
    });
  }, { name: dbName, store: storeName, key: dbKey });
}

async function storeImportedAsset(page, dbName, storeName, dbKey, record = {}) {
  return page.evaluate(({ name, store, key, record }) => {
    return new Promise((resolve, reject) => {
      const openRequest = window.indexedDB.open(name, 1);
      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "key" });
        }
      };
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains(store)) {
          db.close();
          reject(new Error(`IndexedDB store not found: ${store}`));
          return;
        }
        const transaction = db.transaction(store, "readwrite");
        const arrayBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
        const request = transaction.objectStore(store).put({
          key,
          id: key,
          dbKey: key,
          fileName: record.fileName || "orphan-texture.png",
          type: record.type || "png",
          mimeType: record.mimeType || "image/png",
          sha256: record.sha256 || "a".repeat(64),
          metrics: record.metrics || { fileBytes: 4 },
          fileBytes: record.fileBytes || 4,
          arrayBuffer,
          ...record
        });
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, { name: dbName, store: storeName, key: dbKey, record });
}

async function getSameOriginEndpoint(page, path) {
  return page.evaluate((endpointPath) => new URL(endpointPath, window.location.href).toString(), path);
}

async function configureProjectRepositoryRemoteInUi(page, endpoint, token = "") {
  await page.locator("#projectRepositoryEndpoint").fill(endpoint);
  await page.locator("#projectRepositoryToken").fill(token);
  await page.locator("#projectRepositorySaveRemote").click();
  await expect(page.locator("#projectArchiveStatus")).toContainText("已保存远端项目仓库 API 配置");
}

async function configurePlanRepositoryRemoteInUi(page, endpoint, token = "", workspaceId = "local-browser") {
  await page.locator("#planRepositoryEndpointInput").fill(endpoint);
  await page.locator("#planRepositoryTokenInput").fill(token);
  await page.locator("#planRepositoryWorkspaceInput").fill(workspaceId);
  await page.locator("#planRepositorySaveRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端计划 API 配置");
}

async function configureHistoryRepositoryRemoteInUi(page, endpoint, token = "", workspaceId = "local-browser") {
  await page.locator("#historyRepositoryEndpointInput").fill(endpoint);
  await page.locator("#historyRepositoryTokenInput").fill(token);
  await page.locator("#historyRepositoryWorkspaceInput").fill(workspaceId);
  await page.locator("#historyRepositorySaveRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端学习档案 API 配置");
}

async function configureReportRepositoryRemoteInUi(page, endpoint, token = "", workspaceId = "local-browser") {
  await page.locator("#reportRepositoryEndpointInput").fill(endpoint);
  await page.locator("#reportRepositoryTokenInput").fill(token);
  await page.locator("#reportRepositoryWorkspaceInput").fill(workspaceId);
  await page.locator("#reportRepositorySaveRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端报告 API 配置");
}

async function configureShareRemoteInUi(page, endpoint, token = "", workspaceId = "local-browser") {
  await page.locator("#shareRemoteEndpointInput").fill(endpoint);
  await page.locator("#shareRemoteTokenInput").fill(token);
  await page.locator("#shareRemoteWorkspaceInput").fill(workspaceId);
  await page.locator("#shareRemoteSaveButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端分享 API 配置");
}

async function setupPlanRepositoryConflict(page, options = {}) {
  const endpointPath = options.endpointPath || "/e2e-plan-repository-conflict";
  const token = options.token || "plan-token";
  const planRequests = [];
  let remotePlanPackage = null;

  await page.route(`**${endpointPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    planRequests.push({
      method,
      authorization: request.headers().authorization || "",
      body
    });

    if (method === "PUT") {
      remotePlanPackage = withPackageDigest(cloneJson({
        ...body,
        packageId: `${endpointPath.replace(/^\//, "")}-package`,
        acceptedAt: new Date().toISOString()
      }));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `远端计划 E2E 已接收 ${body.summary.planCount} 份计划。`,
          remoteVersion: "e2e-plan-v1",
          packageId: remotePlanPackage.packageId,
          package: remotePlanPackage
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: remotePlanPackage
          ? `远端计划 E2E 可读，当前包含 ${remotePlanPackage.summary.planCount} 份计划。`
          : "远端计划 E2E 可访问，当前尚未接收计划包。",
        remoteVersion: "e2e-plan-v1",
        package: remotePlanPackage
      })
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  const planEndpoint = await getSameOriginEndpoint(page, endpointPath);
  const seedPlan = await page.evaluate(() => {
    const created = window.MRAppState.createPlan();
    return {
      id: created.plan.id,
      itemId: created.plan.items[0].id,
      title: created.plan.title
    };
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#planPanel")).toBeVisible();
  await expect(page.locator("#planTitle")).toContainText(seedPlan.title);

  await page.locator(".plan-repository-remote summary").click();
  await page.locator("#planRepositoryEndpointInput").fill(planEndpoint);
  await page.locator("#planRepositoryTokenInput").fill(token);
  await page.locator("#planRepositorySaveRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端计划 API 配置");

  await page.evaluate(({ endpoint, remoteToken }) => {
    window.MRAppState.configurePlanRepositoryRemote({
      remoteEndpoint: endpoint,
      remoteToken,
      autoSyncEnabled: false
    });
  }, { endpoint: planEndpoint, remoteToken: token });

  await page.locator("#planRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("E2E 可访问");

  await page.locator("#planRepositoryPushButton").click();
  await expect(page.locator("#planRepositorySummary")).toContainText("已推送 1 份计划");

  const initialPut = planRequests.find((item) => item.method === "PUT");
  expect(initialPut.authorization).toBe(`Bearer ${token}`);
  expect(initialPut.body.kind).toBe("mr-calligraphy-plan-repository-v1");
  expect(initialPut.body.plans[0].id).toBe(seedPlan.id);

  remotePlanPackage = createRemotePlanConflictPackage(remotePlanPackage, {
    packageId: `${endpointPath.replace(/^\//, "")}-conflict`,
    planId: seedPlan.id,
    title: options.remoteTitle || "远端冲突计划",
    itemTitle: options.remoteItemTitle || "远端冲突任务",
    itemDetail: options.remoteItemDetail || "远端也修改了第一项任务，等待本机选择处理策略。"
  });

  await page.waitForTimeout(25);
  const localEdit = await page.evaluate(({ planId, itemId, title, detail }) => {
    const result = window.MRAppState.updatePlanItem(planId, itemId, { title, detail });
    return {
      ok: result.ok,
      status: window.MRAppState.getPlanRepositoryStatus()
    };
  }, {
    planId: seedPlan.id,
    itemId: seedPlan.itemId,
    title: options.localItemTitle || "本机冲突任务",
    detail: options.localItemDetail || "本机也修改了第一项任务，应该触发远端冲突提示。"
  });
  expect(localEdit.ok).toBe(true);
  expect(localEdit.status.pendingAutoSync).toBe(true);

  await page.locator("#planRepositoryPullButton").click();
  await expect(page.locator("#planRepositoryConflictPanel")).toBeVisible();
  await expect(page.locator("#planRepositoryConflictStatus")).toContainText("1 份计划");
  await expect(page.locator("#planRepositoryConflictList")).toContainText(seedPlan.title);
  await expect(page.locator("#planRepositoryConflictList")).toContainText(options.remoteTitle || "远端冲突计划");

  const learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.planRepository.lastSyncConflictCount).toBe(1);
  expect(learningState.planRepository.lastSyncConflictPlans[0].title).toBe(options.remoteTitle || "远端冲突计划");

  return {
    planRequests,
    seedPlan,
    getRemotePlanPackage: () => remotePlanPackage
  };
}

function createRemotePlanConflictPackage(sourcePackage, options = {}) {
  const updatedAt = options.updatedAt || new Date(Date.now() + 60000).toISOString();
  return withPackageDigest(cloneJson({
    ...sourcePackage,
    packageId: options.packageId || `e2e-plan-conflict-${Date.now()}`,
    exportedAt: updatedAt,
    plans: sourcePackage.plans.map((plan) => {
      if (plan.id !== options.planId) return plan;
      return {
        ...plan,
        title: options.title || "远端冲突计划",
        updatedAt,
        items: plan.items.map((item, index) => index === 0
          ? {
              ...item,
              title: options.itemTitle || "远端冲突任务",
              detail: options.itemDetail || item.detail
            }
          : item)
      };
    })
  }));
}

function createPagedHistoryConflictPackages(basePackage, sessionId) {
  const pageOne = cloneJson(basePackage);
  const pageTwo = cloneJson(basePackage);
  const sourceSession = pageOne.records.sessions.find((session) => session.id === sessionId)
    || pageOne.records.sessions[0];
  const remoteTime = new Date(Date.now() + 90000).toISOString();
  const conflictSession = {
    ...sourceSession,
    score: 61,
    endedAt: remoteTime,
    snapshotAt: remoteTime,
    feedback: ["远端同 ID 差异记录不应覆盖本机"]
  };
  const addedSession = {
    ...sourceSession,
    id: "remote-paged-session",
    title: "分页返回新增远端练习",
    glyph: "春",
    startedAt: remoteTime,
    endedAt: remoteTime,
    snapshotAt: remoteTime,
    score: 91,
    feedback: ["分页返回新增学习档案"]
  };
  const addedSecondPageSession = {
    ...sourceSession,
    id: "remote-paged-session-2",
    title: "分页第二页新增远端练习",
    glyph: "夏",
    startedAt: remoteTime,
    endedAt: remoteTime,
    snapshotAt: remoteTime,
    score: 89,
    feedback: ["第二页自动追取学习档案"]
  };
  pageOne.packageId = "e2e-history-paged-conflict-package-page-1";
  pageOne.exportedAt = remoteTime;
  pageOne.summary = {
    total: 2,
    practiceCount: 2,
    artworkCount: 0,
    reportCount: 0,
    teacherReviewedReportCount: 0,
    averageScore: 76
  };
  pageOne.records = {
    sessions: [conflictSession, addedSession],
    artworks: [],
    reports: []
  };
  pageOne.history = [];

  pageTwo.packageId = "e2e-history-paged-conflict-package-page-2";
  pageTwo.exportedAt = remoteTime;
  pageTwo.summary = {
    total: 1,
    practiceCount: 1,
    artworkCount: 0,
    reportCount: 0,
    teacherReviewedReportCount: 0,
    averageScore: 89
  };
  pageTwo.records = {
    sessions: [addedSecondPageSession],
    artworks: [],
    reports: []
  };
  pageTwo.history = [];
  return {
    pageOne: withPackageDigest(pageOne),
    pageTwo: withPackageDigest(pageTwo)
  };
}

function toProjectRepositoryVersionSummary(version) {
  return {
    id: version.id,
    packageId: version.packageId,
    sourcePackageId: version.sourcePackageId,
    workspaceId: version.workspaceId,
    packageDigest: version.packageDigest,
    repositoryDigest: version.repositoryDigest,
    remoteVersion: version.remoteVersion,
    acceptedAt: version.acceptedAt,
    sceneCount: version.sceneCount,
    modelCount: version.modelCount,
    summary: version.summary
  };
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function createShareRevokeBodyFromUrl(url) {
  const parsed = new URL(url);
  const shareId = parsed.searchParams.get("shareId");
  if (!shareId) return null;
  return {
    kind: "mr-calligraphy-share-repository-revoke-v1",
    version: 1,
    workspaceId: parsed.searchParams.get("workspaceId") || "",
    shareId,
    packageId: parsed.searchParams.get("packageId") || "",
    publicUrl: parsed.searchParams.get("publicUrl") || ""
  };
}

async function getElementBox(page, selector) {
  await expect(page.locator(selector).first()).toBeVisible();
  const box = await page.locator(selector).first().boundingBox();
  expect(box, `${selector} should have a layout box`).not.toBeNull();
  return box;
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const documentWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth || 0
    );
    return documentWidth - window.innerWidth;
  });
  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectBoxInsideViewport(page, selector) {
  const box = await getElementBox(page, selector);
  const viewport = page.viewportSize();
  expect(viewport, "viewport should be configured").not.toBeNull();
  expect(box.x, `${selector} left edge should stay in viewport`).toBeGreaterThanOrEqual(-1);
  expect(box.width, `${selector} should not exceed viewport width`).toBeLessThanOrEqual(viewport.width + 2);
  expect(box.x + box.width, `${selector} right edge should stay in viewport`).toBeLessThanOrEqual(viewport.width + 2);
  expect(box.y, `${selector} top edge should stay in viewport`).toBeGreaterThanOrEqual(-1);
  expect(box.height, `${selector} should keep a usable height`).toBeGreaterThan(24);
  expect(box.y + Math.min(box.height, viewport.height), `${selector} should start within the visible viewport`).toBeLessThanOrEqual(viewport.height + 2);
}

async function expectBoxesDoNotOverlap(page, firstSelector, secondSelector, margin = 0) {
  const firstBox = await getElementBox(page, firstSelector);
  const secondBox = await getElementBox(page, secondSelector);
  const separated =
    firstBox.x + firstBox.width + margin <= secondBox.x ||
    secondBox.x + secondBox.width + margin <= firstBox.x ||
    firstBox.y + firstBox.height + margin <= secondBox.y ||
    secondBox.y + secondBox.height + margin <= firstBox.y;
  expect(separated, `${firstSelector} should not overlap ${secondSelector}`).toBe(true);
}

async function expectCanvasHasVisiblePixels(page, selector) {
  await expect(page.locator(selector)).toBeVisible();
  await page.waitForFunction((canvasSelector) => {
    const canvas = document.querySelector(canvasSelector);
    if (!canvas || canvas.hidden || canvas.width < 8 || canvas.height < 8) {
      return false;
    }

    const hasVisiblePixels = (data) => {
      let opaquePixels = 0;
      let variedPixels = 0;
      let firstPixel = null;

      for (let index = 0; index < data.length; index += 4) {
        const pixel = `${data[index]},${data[index + 1]},${data[index + 2]},${data[index + 3]}`;
        if (data[index + 3] > 8) {
          opaquePixels += 1;
        }
        if (firstPixel === null) {
          firstPixel = pixel;
        } else if (pixel !== firstPixel) {
          variedPixels += 1;
        }
      }

      return opaquePixels > 64 && variedPixels > 8;
    };

    const sample = document.createElement("canvas");
    sample.width = 32;
    sample.height = 32;
    const context = sample.getContext("2d", { willReadFrequently: true });

    try {
      if (context) {
        context.drawImage(canvas, 0, 0, sample.width, sample.height);
        if (hasVisiblePixels(context.getImageData(0, 0, sample.width, sample.height).data)) {
          return true;
        }
      }
    } catch (error) {
      // WebGL canvases without a preserved drawing buffer can read as blank here.
    }

    try {
      if (typeof window.updateCubeTransform === "function") {
        window.updateCubeTransform();
      }

      const gl = canvas.getContext("webgl") || canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
      if (!gl) {
        return false;
      }

      const sampleWidth = Math.min(32, gl.drawingBufferWidth || canvas.width);
      const sampleHeight = Math.min(32, gl.drawingBufferHeight || canvas.height);
      const x = Math.max(0, Math.floor(((gl.drawingBufferWidth || canvas.width) - sampleWidth) / 2));
      const y = Math.max(0, Math.floor(((gl.drawingBufferHeight || canvas.height) - sampleHeight) / 2));
      const pixels = new Uint8Array(sampleWidth * sampleHeight * 4);
      gl.readPixels(x, y, sampleWidth, sampleHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return hasVisiblePixels(pixels);
    } catch (error) {
      return false;
    }
  }, selector);
}
