import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("page loads and shows the task tracker heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /task tracker/i })
    ).toBeVisible();
  });

  test("shows initial task list with seeded data", async ({ page }) => {
    await page.goto("/");
    const tasks = page.locator("li");
    await expect(tasks).toHaveCount(3);
  });

  test("shows expected task titles", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Buy groceries")).toBeVisible();
    await expect(page.getByText("Finish homework")).toBeVisible();
    await expect(page.getByText("Walk the dog")).toBeVisible();
  });
});