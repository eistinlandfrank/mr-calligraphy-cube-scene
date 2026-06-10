const { expect, test } = require("@playwright/test");

const LEARNING_KEY = "mr-calligraphy-learning-state-v1";
const MAIN_LAYOUT_KEY = "mr-calligraphy-main-scene-layout-v1";
const MAIN_HISTORY_KEY = "mr-calligraphy-main-scene-history-v1";
const MAIN_PUBLISHED_KEY = "mr-calligraphy-main-scene-published-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((keys) => {
    keys.forEach((key) => window.localStorage.removeItem(key));
  }, [LEARNING_KEY, MAIN_LAYOUT_KEY, MAIN_HISTORY_KEY, MAIN_PUBLISHED_KEY]);
});

test("front practice saves real strokes and exports a report", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#taskPanel")).toBeVisible();

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
  await expect(page.locator("#reportStats")).toContainText("保存作品");
});

test("main admin publishes a local draft that the front page reads", async ({ page }) => {
  const objectLabel = `E2E 发布方块 ${Date.now()}`;

  await page.goto("/main-admin.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#mainObjectSelect")).toBeVisible();

  await page.locator("#mainNewObjectName").fill(objectLabel);
  await page.locator("#mainNewObjectType").selectOption("box");
  await page.locator("#mainNewObjectAdd").click();
  await expect(page.locator("#mainCustomStatus")).toContainText(`已新增：${objectLabel}`);

  const draft = await readJsonLocalStorage(page, MAIN_LAYOUT_KEY);
  expect(draft.customObjects.some((item) => item.label === objectLabel)).toBe(true);

  await page.locator("#mainPublishLayout").click();
  await expect(page.locator("#mainPublishStatus")).toContainText("已发布");

  const published = await readJsonLocalStorage(page, MAIN_PUBLISHED_KEY);
  expect(published.layout.customObjects.some((item) => item.label === objectLabel)).toBe(true);
  expect(published.stats.customCount).toBeGreaterThan(0);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.MR_MAIN_SCENE_SOURCE === "published");
  await expect.poll(async () => {
    const record = await readJsonLocalStorage(page, MAIN_PUBLISHED_KEY);
    return Boolean(record?.layout?.customObjects?.some((item) => item.label === objectLabel));
  }).toBe(true);
});

async function drawPracticeStroke(page) {
  const canvas = page.locator("#practiceCanvas");
  await expect(canvas).toBeVisible();
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
