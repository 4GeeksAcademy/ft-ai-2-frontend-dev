# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: intentional-failures.spec.ts >> INTENTIONAL FAILURES >> expects wrong heading text (INTENTIONAL FAIL)
- Location: e2e/intentional-failures.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /wrong heading/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /wrong heading/i })

```

```yaml
- heading "✅ Task Tracker" [level=1]
- textbox "New task title":
  - /placeholder: What needs to be done?
- button "Add"
- list:
  - listitem:
    - checkbox "Mark \"Buy groceries\" as complete"
    - text: Buy groceries
    - button "Delete \"Buy groceries\"": Delete
  - listitem:
    - checkbox "Mark \"Finish homework\" as incomplete" [checked]
    - text: Finish homework
    - button "Delete \"Finish homework\"": Delete
  - listitem:
    - checkbox "Mark \"Walk the dog\" as complete"
    - text: Walk the dog
    - button "Delete \"Walk the dog\"": Delete
- paragraph: Showing 1 of 3 tasks completed
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | // ---------------------------------------------------------------------------
  4  | // These tests FAIL intentionally — they demonstrate common E2E testing
  5  | // mistakes (wrong assertions, incorrect selectors, etc.).
  6  | // ---------------------------------------------------------------------------
  7  | 
  8  | test.describe("INTENTIONAL FAILURES", () => {
  9  |   test("expects wrong heading text (INTENTIONAL FAIL)", async ({ page }) => {
  10 |     await page.goto("/");
  11 |     // FAILS: heading says "Task Tracker", not "Wrong Heading"
  12 |     await expect(
  13 |       page.getByRole("heading", { name: /wrong heading/i })
> 14 |     ).toBeVisible();
     |       ^ Error: expect(locator).toBeVisible() failed
  15 |   });
  16 | 
  17 |   test("expects a task that does not exist (INTENTIONAL FAIL)", async ({ page }) => {
  18 |     await page.goto("/");
  19 |     // FAILS: there is no task with this title
  20 |     await expect(page.getByText("This task does not exist")).toBeVisible();
  21 |   });
  22 | 
  23 |   test("expects wrong number of tasks after delete (INTENTIONAL FAIL)", async ({ page }) => {
  24 |     await page.goto("/");
  25 |     const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
  26 |     await deleteBtn.click();
  27 |     // FAILS: after deleting one of 3 tasks, we have 2 tasks, not 0
  28 |     const tasks = page.locator("li");
  29 |     await expect(tasks).toHaveCount(0);
  30 |   });
  31 | });
```