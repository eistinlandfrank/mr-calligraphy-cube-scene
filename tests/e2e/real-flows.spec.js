const { expect, test } = require("@playwright/test");
const { validateProjectRepositoryPackage } = require("../../scripts/project-repository-mock-server.js");

const LEARNING_KEY = "mr-calligraphy-learning-state-v1";
const MAIN_LAYOUT_KEY = "mr-calligraphy-main-scene-layout-v1";
const MAIN_HISTORY_KEY = "mr-calligraphy-main-scene-history-v1";
const MAIN_PUBLISHED_KEY = "mr-calligraphy-main-scene-published-v1";
const REMOTE_PUBLISH_KEY = "mr-calligraphy-remote-publish-v1";
const PROJECT_REPOSITORY_REMOTE_KEY = "mr-calligraphy-project-repository-remote-v1";
const REALISTIC_LAYOUT_KEY = "mr-calligraphy-realistic-layout-v1";
const REALISTIC_HISTORY_KEY = "mr-calligraphy-realistic-history-v1";
const REALISTIC_PUBLISHED_KEY = "mr-calligraphy-realistic-published-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((keys) => {
    const markerKey = "__mr_calligraphy_e2e_storage_cleared__";
    if (window.sessionStorage.getItem(markerKey) === "1") {
      return;
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    window.sessionStorage.setItem(markerKey, "1");
  }, [
    LEARNING_KEY,
    MAIN_LAYOUT_KEY,
    MAIN_HISTORY_KEY,
    MAIN_PUBLISHED_KEY,
    REMOTE_PUBLISH_KEY,
    PROJECT_REPOSITORY_REMOTE_KEY,
    REALISTIC_LAYOUT_KEY,
    REALISTIC_HISTORY_KEY,
    REALISTIC_PUBLISHED_KEY
  ]);
});

test("front practice saves real strokes and exports a report", async ({ page }) => {
  const historyEndpointPath = "/e2e-history-repository";
  const reportEndpointPath = "/e2e-report-repository";
  const historyRequests = [];
  const reportRequests = [];
  let remoteHistoryPackage = null;
  let remoteReportPackage = null;

  await page.route(`**${historyEndpointPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    historyRequests.push({
      method,
      authorization: request.headers().authorization || "",
      body
    });
    if (method === "PUT") {
      remoteHistoryPackage = {
        ...body,
        packageId: "e2e-history-package",
        acceptedAt: new Date().toISOString()
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `远端学习档案 E2E 已接收 ${body.summary.total} 条记录。`,
          remoteVersion: "e2e-history-v1",
          packageId: remoteHistoryPackage.packageId,
          package: remoteHistoryPackage
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
        package: remoteHistoryPackage
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
      body
    });
    if (method === "PUT") {
      remoteReportPackage = {
        ...body,
        packageId: "e2e-report-package",
        acceptedAt: new Date().toISOString()
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: `远端报告 E2E 已接收 ${body.summary.total} 份报告。`,
          remoteVersion: "e2e-report-v1",
          packageId: remoteReportPackage.packageId,
          package: remoteReportPackage
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
        package: remoteReportPackage
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
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  await expect(page.locator("#learningPathServiceSummary")).toContainText("2/10 步完成");
  await expect(page.locator("#learningPathServiceSummary")).toContainText("数据来自本机任务");
  await expect(page.locator("#sceneTitle")).toContainText("今日单字：永");
  await expectCanvasHasVisiblePixels(page, "#roomCanvas");
  const historyEndpoint = await getSameOriginEndpoint(page, historyEndpointPath);
  const reportEndpoint = await getSameOriginEndpoint(page, reportEndpointPath);

  await page.getByRole("button", { name: /切换到步骤 3/ }).click();
  await page.getByRole("button", { name: "播放讲解" }).click();
  await expect(page.locator("#lectureStatusLabel")).toContainText("已完成");
  await expect(page.locator("#lectureServiceSummary")).toContainText("本机语音");
  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.lectureService.voiceName).toBe("E2E 中文语音");
  expect(learningState.lectureService.spokenStepCount).toBeGreaterThanOrEqual(5);
  expect(learningState.lectureService.status).toBe("complete");

  await drawPracticeStroke(page);
  await expect(page.locator("#practiceCanvasStatus")).toContainText(/1 笔|2 笔|当前评分/);

  await page.getByRole("button", { name: /切换到步骤 6/ }).click();
  await page.getByRole("button", { name: "保存作品" }).click();
  await expect(page.locator("#actionFeedback")).toContainText("作品已真实保存到本机记录");
  await expect(page.locator("#scoreServiceSummary")).toContainText("本机基础评分");
  await expect(page.locator("#scoreServiceSummary")).toContainText("不是专业书法评级");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.artworks).toHaveLength(1);
  expect(learningState.artworks[0].strokeCount).toBeGreaterThan(0);
  expect(learningState.sessions.some((session) => session.status === "saved" && session.strokeCount > 0)).toBe(true);
  expect(learningState.scoreService.status).toBe("scored");
  expect(learningState.scoreService.lastScore).toBeGreaterThan(0);
  expect(learningState.scoreService.lastEvidenceSummary).toContain("采样");

  await page.locator("#reviewCreateShareLink").click();
  await expect(page.locator("#shareServiceSummary")).toContainText("1 条有效链接");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.shareService.records).toHaveLength(1);
  expect(learningState.shareService.records[0].artworkId).toBe(learningState.artworks[0].id);

  await page.locator("#reviewCopyShareLink").click();
  await expect(page.locator("#noticeState")).toContainText(/已复制本机分享链接|写入地址栏/);
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  const shareRecordId = learningState.shareService.records[0].id;
  expect(learningState.shareService.records[0].copyCount).toBe(1);

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
  await expect(page.locator("#actionFeedback")).toContainText("学习报告已生成");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reports).toHaveLength(1);
  expect(learningState.reports[0].artworkCount).toBe(1);
  expect(learningState.reports[0].latestStrokeCount).toBeGreaterThan(0);
  const pathAfterReport = await page.evaluate(() => window.MRAppState.getLearningPathStatus());
  expect(pathAfterReport.steps).toHaveLength(10);
  expect(pathAfterReport.steps[3].done).toBe(true);
  expect(pathAfterReport.steps[5].done).toBe(true);
  expect(pathAfterReport.steps[8].done).toBe(true);
  expect(pathAfterReport.steps[8].title).toContain("学习报告");

  await page.goto(`/?report=${learningState.reports[0].id}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#reportPanel")).toBeVisible();
  await expect(page.locator("#reportTitle")).toContainText("学习报告");
  await expect(page.locator("#reportStats")).toContainText("作品1幅");

  await page.locator("#reportTeacherReviewerInput").fill("王老师");
  await page.locator("#reportTeacherReviewInput").fill("结构更稳，下一次重点放慢竖钩收笔。");
  await page.locator("#reportTeacherReviewSave").click();
  await expect(page.locator("#reportTeacherReviewStatus")).toContainText("王老师");
  await expect(page.locator("#reportTeacherReviewView")).toContainText("竖钩");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reports[0].teacherReview.reviewer).toBe("王老师");
  expect(learningState.reports[0].teacherReview.note).toContain("竖钩");

  await expect(page.locator("#reportVerification")).toContainText("本机验真摘要");
  const reportRepositoryDownloadPromise = page.waitForEvent("download");
  await page.locator("#reportRepositoryExportButton").click();
  const reportRepositoryDownload = await reportRepositoryDownloadPromise;
  expect(reportRepositoryDownload.suggestedFilename()).toMatch(/^mr-calligraphy-report-repository-.*\.json$/);
  await expect(page.locator("#reportRepositorySummary")).toContainText("最近导出 1 份报告");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastExportedReportCount).toBe(1);
  expect(learningState.reportRepository.lastPackageId).toMatch(/^report-repository-/);

  await page.locator(".report-repository-remote summary").click();
  await page.locator("#reportRepositoryEndpointInput").fill(reportEndpoint);
  await page.locator("#reportRepositoryTokenInput").fill("report-token");
  await page.locator("#reportRepositorySaveRemoteButton").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("已配置");

  await page.locator("#reportRepositoryRemoteButton").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("E2E 可访问");

  await page.locator("#reportRepositoryPushButton").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("已推送 1 份报告");

  const reportPutRequest = reportRequests.find((item) => item.method === "PUT");
  expect(reportPutRequest.authorization).toBe("Bearer report-token");
  expect(reportPutRequest.body.kind).toBe("mr-calligraphy-report-repository-v1");
  expect(reportPutRequest.body.summary.total).toBe(1);
  expect(reportPutRequest.body.reports[0].teacherReview.note).toContain("竖钩");
  expect(reportPutRequest.body.verifications).toHaveLength(1);
  expect(reportPutRequest.body.verifications[0].digest).toMatch(/^[a-f0-9]{64}$/);

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reportRepository.lastRemoteDirection).toBe("push");
  expect(learningState.reportRepository.lastPackageId).toBe("e2e-report-package");

  await page.locator("#reportRepositoryPullButton").click();
  await expect(page.locator("#reportRepositorySummary")).toContainText("已从远端 API 拉取 1 份报告");
  expect(reportRequests.some((item) => item.method === "GET" && item.authorization === "Bearer report-token")).toBe(true);

  remoteReportPackage = {
    ...remoteReportPackage,
    reports: remoteReportPackage.reports.map((report, index) => index === 0
      ? {
        ...report,
        summary: "远端 E2E 报告摘要，只应在用户选择字段合并后写回本机。",
        title: "远端 E2E 冲突报告"
      }
      : report)
  };
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
  await expect(page.locator("#reportTeacherReviewView")).toContainText("竖钩");

  await page.locator("#reportTeacherReviewClear").click();
  await expect(page.locator("#reportTeacherReviewStatus")).toContainText("暂无本机教师批注");
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.reports[0].teacherReview).toBeNull();

  await expect(page.locator("#historyPanel")).toBeVisible();
  await page.locator(".history-repository-remote summary").click();
  await page.locator("#historyRepositoryEndpointInput").fill(historyEndpoint);
  await page.locator("#historyRepositoryTokenInput").fill("history-token");
  await page.locator("#historyRepositorySaveRemoteButton").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("已配置");

  await page.locator("#historyRepositoryRemoteButton").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("E2E 可访问");

  await page.locator("#historyRepositoryPushButton").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("已推送 3 条学习档案");

  const putRequest = historyRequests.find((item) => item.method === "PUT");
  expect(putRequest.authorization).toBe("Bearer history-token");
  expect(putRequest.body.kind).toBe("mr-calligraphy-history-repository-v1");
  expect(putRequest.body.summary.total).toBe(3);
  expect(putRequest.body.records.reports).toHaveLength(1);

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastRemoteDirection).toBe("push");
  expect(learningState.historyRepository.lastPackageId).toBe("e2e-history-package");

  await page.locator("#historyRepositoryPullButton").click();
  await expect(page.locator("#historyRepositorySummary")).toContainText("已从远端 API 拉取 3 条学习档案");

  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastRemoteDirection).toBe("pull");
  expect(learningState.historyRepository.lastRemoteRecordCount).toBe(3);
  expect(historyRequests.some((item) => item.method === "GET" && item.authorization === "Bearer history-token")).toBe(true);
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

test("front history repository shows real remote failure feedback", async ({ page }) => {
  const requests = [];
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
        body: request.method() === "PUT" ? request.postDataJSON() : null
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
  learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.historyRepository.lastError).toContain("HTTP 422");

  const putRequest = requests.find((item) => item.path === "/e2e-history-repository-rejected-push" && item.method === "PUT");
  expect(putRequest.authorization).toBe("Bearer history-rejected-push-token");
  expect(putRequest.body.kind).toBe("mr-calligraphy-history-repository-v1");
  expect(putRequest.body.summary.total).toBe(2);
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
      authorization: request.headers().authorization || ""
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
      authorization: request.headers().authorization || ""
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
  expect(requests.some((item) => item.path === networkPath && item.authorization === "Bearer history-network-token")).toBe(true);

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
  expect(requests.some((item) => item.path === pagedPath && item.method === "GET" && item.authorization === "Bearer history-paged-token")).toBe(true);
  expect(requests.some((item) => item.path === pagedPath && item.page === "2" && item.authorization === "Bearer history-paged-token")).toBe(true);

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

  await page.route(`**${planEndpointPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "PUT" ? request.postDataJSON() : null;
    planRequests.push({
      method,
      authorization: request.headers().authorization || "",
      body
    });

    if (method === "PUT") {
      remotePlanPackage = cloneJson({
        ...body,
        packageId: "e2e-plan-package",
        acceptedAt: new Date().toISOString()
      });
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
  await page.locator("#planRepositorySaveRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端计划 API 配置");

  await page.evaluate((endpoint) => {
    window.MRAppState.configurePlanRepositoryRemote({
      remoteEndpoint: endpoint,
      remoteToken: "plan-token",
      autoSyncEnabled: false
    });
  }, planEndpoint);

  await page.locator("#planRepositoryRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("E2E 可访问");

  await page.locator("#planRepositoryPushButton").click();
  await expect(page.locator("#planRepositorySummary")).toContainText("已推送 1 份计划");

  const putRequest = planRequests.find((item) => item.method === "PUT");
  expect(putRequest.authorization).toBe("Bearer plan-token");
  expect(putRequest.body.kind).toBe("mr-calligraphy-plan-repository-v1");
  expect(putRequest.body.summary.planCount).toBe(1);
  expect(putRequest.body.plans[0].id).toBe(seedPlan.id);

  const remoteUpdatedAt = new Date(Date.now() + 60000).toISOString();
  remotePlanPackage = cloneJson({
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
  });

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

  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
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
  expect(learningState.plans).toHaveLength(1);
  expect(learningState.plans[0].id).toBe(seedPlan.id);

  const rejectedPut = requests.find((item) => item.path === rejectedPath && item.method === "PUT");
  expect(rejectedPut.authorization).toBe("Bearer plan-rejected-push-token");
  expect(rejectedPut.body.kind).toBe("mr-calligraphy-plan-repository-v1");
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
  expect(learningState.plans).toHaveLength(1);
  expect(learningState.plans[0].id).toBe(seedPlan.id);
  expect(requests.some((item) => item.path === networkPath && item.method === "PUT" && item.authorization === "Bearer plan-network-push-token")).toBe(true);
});

test("main admin publishes a local draft that the front page reads", async ({ page }) => {
  const objectLabel = `E2E 发布方块 ${Date.now()}`;
  const remoteEndpointPath = "/e2e-remote-publish";
  const projectRepositoryEndpointPath = "/e2e-project-repository";
  const remoteRequests = [];
  const projectRepositoryRequests = [];
  const remoteProjectRepositoryVersions = [];

  await page.route(`**${remoteEndpointPath}`, async (route) => {
    const request = route.request();
    const method = request.method();
    const body = method === "POST" ? request.postDataJSON() : null;
    remoteRequests.push({
      method,
      authorization: request.headers().authorization || "",
      body
    });
    if (method === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "主场景远端 E2E 已接收。",
          packageId: `e2e-${body.sceneId}`,
          releaseId: body.release.id,
          packageDigest: body.manifest.packageDigest,
          remoteVersion: "e2e-remote-v1",
          receipt: {
            packageId: `e2e-${body.sceneId}`,
            releaseId: body.release.id,
            packageDigest: body.manifest.packageDigest,
            remoteVersion: "e2e-remote-v1",
            message: "主场景远端 E2E 回执。"
          }
        })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: "主场景远端 E2E 可访问。",
        remoteVersion: "e2e-check-v1"
      })
    });
  });

  await page.route(`**${projectRepositoryEndpointPath}**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const requestUrl = new URL(request.url());
    const requestedPackageId = requestUrl.searchParams.get("packageId") || "";
    const body = method === "PUT" ? request.postDataJSON() : null;
    projectRepositoryRequests.push({
      method,
      url: request.url(),
      packageId: requestedPackageId,
      authorization: request.headers().authorization || "",
      body
    });
    if (method === "PUT") {
      const validation = validateProjectRepositoryPackage(body);
      expect(validation.ok, validation.message).toBe(true);
      const packageIndex = remoteProjectRepositoryVersions.length + 1;
      const packageId = `e2e-project-repository-${packageIndex}`;
      const remoteVersion = {
        id: packageId,
        packageId,
        sourcePackageId: body.packageId,
        packageDigest: body.packageDigest,
        repositoryDigest: body.packageDigest,
        remoteVersion: "e2e-project-repository-v1",
        acceptedAt: new Date(Date.UTC(2026, 5, 12, 8, packageIndex, 0)).toISOString(),
        sceneCount: body.summary.sceneCount,
        modelCount: body.summary.importedModels,
        summary: body.summary,
        package: JSON.parse(JSON.stringify(body))
      };
      remoteProjectRepositoryVersions.unshift(remoteVersion);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "项目仓库远端 E2E 已接收。",
          packageId,
          packageDigest: body.packageDigest,
          repositoryDigest: body.packageDigest,
          remoteVersion: "e2e-project-repository-v1",
          selectedVersion: toProjectRepositoryVersionSummary(remoteVersion),
          versionCount: remoteProjectRepositoryVersions.length,
          versions: remoteProjectRepositoryVersions.map(toProjectRepositoryVersionSummary),
          receipt: {
            receiptKind: "mr-calligraphy-project-repository-receipt-v1",
            packageId,
            sourcePackageId: body.packageId,
            packageDigest: body.packageDigest,
            repositoryDigest: body.packageDigest,
            remoteVersion: "e2e-project-repository-v1",
            message: "项目仓库远端 E2E 回执。",
            sceneCount: body.summary.sceneCount,
            modelCount: body.summary.importedModels
          }
        })
      });
      return;
    }
    const selectedVersion = requestedPackageId
      ? remoteProjectRepositoryVersions.find((version) => [
          version.packageId,
          version.sourcePackageId,
          version.packageDigest,
          version.repositoryDigest
        ].includes(requestedPackageId))
      : remoteProjectRepositoryVersions[0];
    if (requestedPackageId && !selectedVersion) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          message: `项目仓库远端 E2E 未找到版本：${requestedPackageId}。`,
          remoteVersion: "e2e-project-check-v1",
          versions: remoteProjectRepositoryVersions.map(toProjectRepositoryVersionSummary)
        })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        message: selectedVersion ? `项目仓库远端 E2E 可拉取版本 ${selectedVersion.packageId}。` : "项目仓库远端 E2E 可访问。",
        remoteVersion: "e2e-project-check-v1",
        packageId: selectedVersion?.packageId || "",
        repositoryDigest: selectedVersion?.repositoryDigest || "",
        package: selectedVersion?.package || null,
        selectedVersion: selectedVersion ? toProjectRepositoryVersionSummary(selectedVersion) : null,
        versionCount: remoteProjectRepositoryVersions.length,
        versions: remoteProjectRepositoryVersions.map(toProjectRepositoryVersionSummary)
      })
    });
  });

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await expectCanvasHasVisiblePixels(page, "#mainAdminCanvas");
  const remoteEndpoint = await getSameOriginEndpoint(page, remoteEndpointPath);
  const projectRepositoryEndpoint = await getSameOriginEndpoint(page, projectRepositoryEndpointPath);

  await page.locator("#mainNewObjectName").fill(objectLabel);
  await page.locator("#mainNewObjectType").selectOption("box");
  await page.locator("#mainNewObjectAdd").click();
  await expect(page.locator("#mainCustomStatus")).toContainText(`已新增：${objectLabel}`);
  await expect(page.locator("#mainPublishDiffSummary")).toContainText("尚未发布");
  await expect(page.locator("#mainPublishDiffList")).toContainText(objectLabel);

  const draft = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  expect(draft.customObjects.some((item) => item.label === objectLabel)).toBe(true);

  await page.locator("#mainPublishLayout").click();
  await expect(page.locator("#mainPublishStatus")).toContainText("已发布");
  await expect(page.locator("#mainPublishDiffSummary")).toContainText("一致");

  const published = await readJsonLocalStorage(page, MAIN_PUBLISHED_KEY);
  expect(published.layout.customObjects.some((item) => item.label === objectLabel)).toBe(true);
  expect(published.stats.customCount).toBeGreaterThan(0);

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
  await page.locator("#projectRepositorySaveRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("远端项目仓库 API 配置已保存");

  await page.locator("#projectRepositoryCheckRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("项目仓库远端 E2E 可访问");
  const checkedProjectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(checkedProjectRepositoryState.lastRemoteVersion).toBe("e2e-project-check-v1");

  await page.locator("#projectRepositoryPushRemote").click();
  await expect(page.locator("#projectRepositoryRemoteStatus")).toContainText("项目仓库远端 E2E 已接收");
  await expect(page.locator("#projectRepositoryReceiptList")).toContainText("e2e-project-repository-1");

  expect(projectRepositoryRequests.some((item) => item.method === "GET" && item.authorization === "Bearer project-e2e-token")).toBe(true);
  const firstProjectRepositoryPut = projectRepositoryRequests.find((item) => item.method === "PUT");
  expect(firstProjectRepositoryPut.authorization).toBe("Bearer project-e2e-token");
  expect(firstProjectRepositoryPut.body.kind).toBe("mr-calligraphy-project-repository-package-v1");
  expect(firstProjectRepositoryPut.body.repository.kind).toBe("mr-calligraphy-project-repository-v1");
  expect(firstProjectRepositoryPut.body.projectSchema.kind).toBe("mr-calligraphy-project-schema");
  expect(firstProjectRepositoryPut.body.archive.kind).toBe("mr-calligraphy-project-archive");
  expect(firstProjectRepositoryPut.body.summary.sceneCount).toBe(2);
  expect(firstProjectRepositoryPut.body.summary.publishedSceneCount).toBeGreaterThan(0);
  expect(firstProjectRepositoryPut.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);

  const firstRemoteProjectVersion = remoteProjectRepositoryVersions[0];
  expect(firstRemoteProjectVersion.packageId).toBe("e2e-project-repository-1");
  const projectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(projectRepositoryState.lastPackageId).toBe("e2e-project-repository-1");
  expect(projectRepositoryState.lastRemoteVersion).toBe("e2e-project-repository-v1");
  expect(projectRepositoryState.lastPackageDigest).toBe(firstProjectRepositoryPut.body.packageDigest);
  expect(projectRepositoryState.receipts[0].sourcePackageId).toBe(firstProjectRepositoryPut.body.packageId);
  expect(projectRepositoryState.versions[0].packageId).toBe("e2e-project-repository-1");

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
  expect(secondProjectRepositoryPut.body.packageDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(secondProjectRepositoryPut.body.packageDigest).not.toBe(firstProjectRepositoryPut.body.packageDigest);
  const latestProjectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(latestProjectRepositoryState.lastPackageId).toBe("e2e-project-repository-2");
  expect(latestProjectRepositoryState.versions.map((version) => version.packageId)).toEqual([
    "e2e-project-repository-2",
    "e2e-project-repository-1"
  ]);

  await page.locator("#projectRepositoryVersionSelect").selectOption(firstRemoteProjectVersion.packageId);
  await page.locator("#projectRepositoryPullRemote").click();
  await expect(page.locator("#projectArchiveStatus")).toContainText("项目仓库远端 E2E 可拉取版本 e2e-project-repository-1");
  await expect(page.locator("#projectImportPreview")).toBeVisible();
  await expect(page.locator("#projectImportPreviewList")).toContainText("主场景布局");
  const pulledProjectRepositoryState = await readJsonLocalStorage(page, PROJECT_REPOSITORY_REMOTE_KEY);
  expect(pulledProjectRepositoryState.lastPackageId).toBe(firstRemoteProjectVersion.packageId);
  expect(pulledProjectRepositoryState.lastPackageDigest).toBe(firstProjectRepositoryPut.body.packageDigest);
  expect(projectRepositoryRequests.some((item) => item.method === "GET" && item.packageId === firstRemoteProjectVersion.packageId)).toBe(true);

  await page.locator(".main-publish-panel .remote-publish-panel summary").click();
  await expect(page.locator("#mainRemotePublishEndpoint")).toBeVisible();
  await page.locator("#mainRemotePublishEndpoint").fill(remoteEndpoint);
  await page.locator("#mainRemotePublishToken").fill("e2e-token");
  await page.locator("#mainRemotePublishSave").click();
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("远端发布 API 配置已保存");

  await page.locator("#mainRemotePublishCheck").click();
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("主场景远端 E2E 可访问");
  const checkedRemoteState = await readJsonLocalStorage(page, REMOTE_PUBLISH_KEY);
  expect(checkedRemoteState.scenes.mainScene.lastRemoteVersion).toBe("e2e-check-v1");

  await page.locator("#mainRemotePublishRequestReview").click();
  await expect(page.locator("#mainRemotePublishReviewStatus")).toContainText("待审核");
  await page.locator("#mainRemotePublishApproveReview").click();
  await expect(page.locator("#mainRemotePublishReviewStatus")).toContainText("审核通过");

  await page.locator("#mainRemotePublishPush").click();
  await expect(page.locator("#mainRemotePublishStatus")).toContainText("主场景远端 E2E 已接收");
  await expect(page.locator("#mainRemotePublishReceiptStatus")).toContainText("1 条");
  await expect(page.locator("#mainRemotePublishReceiptList")).toContainText("e2e-mainScene");

  expect(remoteRequests.some((item) => item.method === "GET" && item.authorization === "Bearer e2e-token")).toBe(true);
  const postRequest = remoteRequests.find((item) => item.method === "POST");
  expect(postRequest.authorization).toBe("Bearer e2e-token");
  expect(postRequest.body.kind).toBe("mr-calligraphy-remote-publish-package-v1");
  expect(postRequest.body.sceneId).toBe("mainScene");
  expect(postRequest.body.manifest.packageDigest).toBeTruthy();

  const remoteState = await readJsonLocalStorage(page, REMOTE_PUBLISH_KEY);
  expect(remoteState.scenes.mainScene.lastPackageId).toBe("e2e-mainScene");
  expect(remoteState.scenes.mainScene.lastRemoteVersion).toBe("e2e-remote-v1");
  expect(remoteState.scenes.mainScene.receipts[0].packageId).toBe("e2e-mainScene");

  const receiptDownloadPromise = page.waitForEvent("download");
  await page.locator("#mainRemotePublishReceiptExport").click();
  const receiptDownload = await receiptDownloadPromise;
  expect(receiptDownload.suggestedFilename()).toMatch(/^mr-calligraphy-mainScene-remote-receipts-/);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.MR_MAIN_SCENE_SOURCE === "published");
  await expect.poll(async () => {
    const record = await readJsonLocalStorage(page, MAIN_PUBLISHED_KEY);
    return Boolean(record?.layout?.customObjects?.some((item) => item.label === objectLabel));
  }).toBe(true);
});

test("realistic admin keeps local publish releases and rollback history", async ({ page }) => {
  const firstNote = `E2E 写实初版 ${Date.now()}`;
  const secondNote = `E2E 写实二版 ${Date.now()}`;

  await page.goto("/realistic-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#designObjectSelect")).toBeVisible();
  await expect(page.locator("#realisticPublishNote")).toBeVisible();
  await expectCanvasHasVisiblePixels(page, "#realisticCanvas");

  await page.locator("#realisticPublishNote").fill(firstNote);
  await page.locator("#realisticPublishLayout").click();
  await expect(page.locator("#realisticPublishStatus")).toContainText("已发布");
  await expect(page.locator("#realisticPublishDiffSummary")).toContainText("一致");

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

async function getSameOriginEndpoint(page, path) {
  return page.evaluate((endpointPath) => new URL(endpointPath, window.location.href).toString(), path);
}

async function configurePlanRepositoryRemoteInUi(page, endpoint, token = "") {
  await page.locator("#planRepositoryEndpointInput").fill(endpoint);
  await page.locator("#planRepositoryTokenInput").fill(token);
  await page.locator("#planRepositorySaveRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端计划 API 配置");
}

async function configureHistoryRepositoryRemoteInUi(page, endpoint, token = "") {
  await page.locator("#historyRepositoryEndpointInput").fill(endpoint);
  await page.locator("#historyRepositoryTokenInput").fill(token);
  await page.locator("#historyRepositorySaveRemoteButton").click();
  await expect(page.locator("#noticeState")).toContainText("已保存远端学习档案 API 配置");
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
      remotePlanPackage = cloneJson({
        ...body,
        packageId: `${endpointPath.replace(/^\//, "")}-package`,
        acceptedAt: new Date().toISOString()
      });
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
  return cloneJson({
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
  });
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
  return { pageOne, pageTwo };
}

function toProjectRepositoryVersionSummary(version) {
  return {
    id: version.id,
    packageId: version.packageId,
    sourcePackageId: version.sourcePackageId,
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
