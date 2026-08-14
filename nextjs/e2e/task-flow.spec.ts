import { test, expect } from "@playwright/test";

test.describe("Task flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("add a new task", async ({ page }) => {
    await page.getByPlaceholder("What needs to be done?").fill("Write code");
    await page.getByRole("button", { name: /add/i }).click();
    await expect(page.getByText("Write code")).toBeVisible();
  });

  test("counter updates after adding a task", async ({ page }) => {
    await page.getByPlaceholder("What needs to be done?").fill("New task");
    await page.getByRole("button", { name: /add/i }).click();
    // Wait for the new task to render, then check counter
    await expect(page.getByText("New task")).toBeVisible();
    await expect(page.getByText(/of 4 tasks completed/)).toBeVisible();
  });

  test("toggle a task as complete", async ({ page }) => {
    const firstCheckbox = page.getByRole("checkbox").first();
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();
  });

  test("delete a task reduces the count", async ({ page }) => {
    const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
    await deleteBtn.click();
    const tasks = page.locator("li");
    await expect(tasks).toHaveCount(2);
  });

  test("complete flow: add, toggle, then delete", async ({ page }) => {
    // Add
    await page.getByPlaceholder("What needs to be done?").fill("Test task");
    await page.getByRole("button", { name: /add/i }).click();
    await expect(page.getByText("Test task")).toBeVisible();

    // Toggle
    const newCheckbox = page.getByRole("checkbox").last();
    await newCheckbox.check();
    await expect(newCheckbox).toBeChecked();

    // Delete
    const allDeleteButtons = page.getByRole("button", { name: /delete/i });
    await allDeleteButtons.last().click();
    await expect(page.getByText("Test task")).not.toBeVisible();
  });
});