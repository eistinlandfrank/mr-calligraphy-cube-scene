const { expect, test } = require("@playwright/test");

const SCENE_CONFIG_STORAGE_KEY = "mr-calligraphy-scene-config-v2";
const isViteAppTarget = (process.env.PLAYWRIGHT_BASE_URL || "").includes("5173");

test.describe("Vite app shell", () => {
  test.skip(!isViteAppTarget, "requires the Vite dev server, for example PLAYWRIGHT_BASE_URL=http://localhost:5173/");

  test("routes front stage, editor, and preview through shared scene config", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((key) => window.localStorage.removeItem(key), SCENE_CONFIG_STORAGE_KEY);
    await page.reload();

    await expect(page.getByRole("heading", { name: "MR 书法交互空间" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Front Stage" })).toHaveClass(/is-active/);
    await expect(page.getByText("进入系统 / 沉浸准备")).toBeVisible();
    await expect(page.locator(".step-strip button")).toHaveCount(10);
    await expect(page.locator("canvas.scene-canvas")).toBeVisible();
    expect(await getCanvasPixelVariance(page)).toBeGreaterThan(8);

    await page.locator(".step-strip button").nth(2).click();
    await expect(page.getByText("AI 讲解 / 永字八法")).toBeVisible();
    const activeStepSceneConfig = await page.evaluate((key) => {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, SCENE_CONFIG_STORAGE_KEY);
    expect(activeStepSceneConfig.activeStepIndex).toBe(2);

    await page.goto("/editor");
    await expect(page.getByRole("link", { name: "Scene Console" })).toHaveClass(/is-active/);
    await expect(page.getByText(/\d+ 个物件/)).toBeVisible();
    await expect(page.locator(".object-list-panel .step-strip button")).toHaveCount(10);
    await expect(page.locator("canvas.scene-canvas")).toBeVisible();
    expect(await getCanvasPixelVariance(page)).toBeGreaterThan(8);

    await page.locator(".property-form input").first().fill("验收展示屏");
    await page.locator(".vector-inputs").filter({ hasText: "位置" }).locator("input").first().fill("0.4");

    const storedSceneConfig = await page.evaluate((key) => {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, SCENE_CONFIG_STORAGE_KEY);
    expect(storedSceneConfig.objects[0].name).toBe("验收展示屏");
    expect(storedSceneConfig.objects[0].position[0]).toBe(0.4);

    await page.goto("/");
    await expect(page.getByText("验收展示屏")).toBeVisible();

    await page.goto("/preview");
    await expect(page.getByRole("link", { name: "Preview" })).toHaveClass(/is-active/);
    await expect(page.getByText("验收展示屏")).toBeVisible();
  });
});

async function getCanvasPixelVariance(page) {
  await page.waitForTimeout(300);
  return page.locator("canvas.scene-canvas").evaluate((canvas) => {
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) {
      return 0;
    }
    gl.flush();
    const width = canvas.width;
    const height = canvas.height;
    const samplePoints = [
      [0.2, 0.2],
      [0.5, 0.2],
      [0.8, 0.2],
      [0.25, 0.5],
      [0.5, 0.5],
      [0.75, 0.5],
      [0.2, 0.78],
      [0.5, 0.78],
      [0.8, 0.78]
    ];
    const pixel = new Uint8Array(4);
    const values = [];
    for (const [xRatio, yRatio] of samplePoints) {
      gl.readPixels(Math.floor(width * xRatio), Math.floor(height * yRatio), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      values.push(pixel[0] + pixel[1] + pixel[2]);
    }
    return Math.max(...values) - Math.min(...values);
  });
}
