import { test, expect } from "@playwright/test";

test("smoke: loads and debug api exists", async ({ page }) => {
  // Run `npm run preview` first (port 4173)
  await page.goto("http://localhost:4173/");
  await expect(page).toHaveTitle(/XR Target Acquisition Micro-benchmark/i);
  await expect(page.locator("#overlay")).toBeVisible();

  const hasDebug = await page.evaluate(() => typeof window.__gameDebug !== "undefined");
  expect(hasDebug).toBeTruthy();
});
