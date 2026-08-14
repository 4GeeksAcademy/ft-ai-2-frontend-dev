# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: intentional-failures.spec.ts >> INTENTIONAL FAILURES >> expects wrong number of tasks after delete (INTENTIONAL FAIL)
- Location: e2e/intentional-failures.spec.ts:23:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('li')
Expected: 0
Received: 2
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('li')
    4 × locator resolved to 3 elements
      - unexpected value "3"
    10 × locator resolved to 2 elements
       - unexpected value "2"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - heading "✅ Task Tracker" [level=1] [ref=e3]
    - generic [ref=e5]:
      - textbox "New task title" [ref=e6]:
        - /placeholder: What needs to be done?
      - button "Add" [ref=e7]
    - list [ref=e8]:
      - listitem [ref=e9]:
        - checkbox "Mark \"Finish homework\" as incomplete" [checked] [ref=e10]
        - generic [ref=e11]: Finish homework
        - button "Delete \"Finish homework\"" [ref=e12]: Delete
      - listitem [ref=e13]:
        - checkbox "Mark \"Walk the dog\" as complete" [ref=e14]
        - generic [ref=e15]: Walk the dog
        - button "Delete \"Walk the dog\"" [ref=e16]: Delete
    - paragraph [ref=e18]: Showing 1 of 2 tasks completed
  - button "Open Next.js Dev Tools" [ref=e24] [cursor=pointer]
  - alert [ref=e28]
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
  14 |     ).toBeVisible();
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
> 29 |     await expect(tasks).toHaveCount(0);
     |                         ^ Error: expect(locator).toHaveCount(expected) failed
  30 |   });
  31 | });
```