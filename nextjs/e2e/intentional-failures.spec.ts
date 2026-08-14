import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// These tests FAIL intentionally — they demonstrate common E2E testing
// mistakes (wrong assertions, incorrect selectors, etc.).
// ---------------------------------------------------------------------------

test.describe("INTENTIONAL FAILURES", () => {
  test("expects wrong heading text (INTENTIONAL FAIL)", async ({ page }) => {
    await page.goto("/");
    // FAILS: heading says "Task Tracker", not "Wrong Heading"
    await expect(
      page.getByRole("heading", { name: /wrong heading/i })
    ).toBeVisible();
  });

  test("expects a task that does not exist (INTENTIONAL FAIL)", async ({ page }) => {
    await page.goto("/");
    // FAILS: there is no task with this title
    await expect(page.getByText("This task does not exist")).toBeVisible();
  });

  test("expects wrong number of tasks after delete (INTENTIONAL FAIL)", async ({ page }) => {
    await page.goto("/");
    const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
    await deleteBtn.click();
    // FAILS: after deleting one of 3 tasks, we have 2 tasks, not 0
    const tasks = page.locator("li");
    await expect(tasks).toHaveCount(0);
  });
});