const { expect, test } = require("@playwright/test");

const LEARNING_KEY = "mr-calligraphy-learning-state-v1";
const MAIN_LAYOUT_KEY = "mr-calligraphy-main-scene-layout-v1";
const MAIN_HISTORY_KEY = "mr-calligraphy-main-scene-history-v1";
const MAIN_PUBLISHED_KEY = "mr-calligraphy-main-scene-published-v1";
const REMOTE_PUBLISH_KEY = "mr-calligraphy-remote-publish-v1";
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
    REALISTIC_LAYOUT_KEY,
    REALISTIC_HISTORY_KEY,
    REALISTIC_PUBLISHED_KEY
  ]);
});

test("front practice saves real strokes and exports a report", async ({ page }) => {
  const historyEndpointPath = "/e2e-history-repository";
  const historyRequests = [];
  let remoteHistoryPackage = null;

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

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();
  await expectCanvasHasVisiblePixels(page, "#roomCanvas");
  const historyEndpoint = await getSameOriginEndpoint(page, historyEndpointPath);

  await drawPracticeStroke(page);
  await expect(page.locator("#practiceCanvasStatus")).toContainText(/1 笔|2 笔|当前评分/);

  await page.getByRole("button", { name: /切换到步骤 6/ }).click();
  await page.getByRole("button", { name: "保存作品" }).click();
  await expect(page.locator("#actionFeedback")).toContainText("作品已真实保存到本机记录");

  let learningState = await readJsonLocalStorage(page, LEARNING_KEY);
  expect(learningState.artworks).toHaveLength(1);
  expect(learningState.artworks[0].strokeCount).toBeGreaterThan(0);
  expect(learningState.sessions.some((session) => session.status === "saved" && session.strokeCount > 0)).toBe(true);

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

test("main admin publishes a local draft that the front page reads", async ({ page }) => {
  const objectLabel = `E2E 发布方块 ${Date.now()}`;
  const remoteEndpointPath = "/e2e-remote-publish";
  const remoteRequests = [];

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

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();
  await expectCanvasHasVisiblePixels(page, "#mainAdminCanvas");
  const remoteEndpoint = await getSameOriginEndpoint(page, remoteEndpointPath);

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
