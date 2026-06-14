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
    await expect(page.getByText("默认 3D 书法空间入口")).toBeVisible();

    await page.goto("/editor");
    await expect(page.getByRole("link", { name: "Scene Console" })).toHaveClass(/is-active/);
    await expect(page.getByText("6 个物件")).toBeVisible();

    await page.locator(".property-form input").first().fill("验收展示屏");

    const storedSceneConfig = await page.evaluate((key) => {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, SCENE_CONFIG_STORAGE_KEY);
    expect(storedSceneConfig.objects[0].name).toBe("验收展示屏");

    await page.goto("/");
    await expect(page.getByText("验收展示屏")).toBeVisible();

    await page.goto("/preview");
    await expect(page.getByRole("link", { name: "Preview" })).toHaveClass(/is-active/);
    await expect(page.getByText("验收展示屏")).toBeVisible();
  });
});
