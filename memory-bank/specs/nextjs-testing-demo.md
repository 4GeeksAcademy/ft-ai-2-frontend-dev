# NextJS Testing Demo — Spec

**Author:** AI Agent
**Date:** 2026-08-14
**Status:** Draft
**Version:** 1.0

---

## 1. Overview

### 1.1 Executive Summary

**What:** A minimal Next.js application tested at two levels — unit/component
tests with **Vitest** and end-to-end browser tests with **Playwright**. Students
experience the testing pyramid in practice: fast unit tests at the base, slower
E2E tests at the top.

**Why:** Frontend testing introduces unique challenges (rendering, async state,
DOM interaction, browser APIs) that backend testing alone doesn't cover.
Students need to see both isolated component tests and full-page E2E flows.

**Who:** Students who have completed basic Next.js and React modules and the
FastAPI testing demo (or have equivalent Python testing knowledge).

**Prerequisites:** Node.js 20+, `pnpm` installed.

---

### 1.2 Learning Objectives

By the end of this demo, students should be able to:

1. Set up Vitest in a Next.js project
2. Write component tests that render React components
3. Test user interactions (clicks, form input) with `@testing-library/react`
4. Mock API calls and async behavior
5. Set up Playwright in a Next.js project
6. Write E2E tests that navigate pages and assert on content
7. Run both test suites and compare their speed vs. coverage trade-offs
8. Interpret HTML reports and trace viewers for failed E2E tests

---

## 2. Application Design

### 2.1 Scope

The demo app is a simple **Task Tracker** — a single-page app with task
management features. Minimal enough to build quickly but rich enough to
demonstrate meaningful test scenarios.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Pages | 1 (homepage) | Single-page keeps setup minimal |
| State | React `useState` / `useEffect` | No external state library needed |
| Styling | Tailwind CSS v4 (same as auth demo) | Consistent with project conventions |
| Data | In-memory + `fetch` mock | No real API needed; test with mocks |
| Build tool | Next.js (App Router) | Real-world framework students use |
| Test runner (unit) | Vitest | Fast, Vite-native, React Testing Library integration |
| Test runner (E2E) | Playwright | Industry standard, rich trace viewer |

### 2.2 Application — Task Tracker

The app lets users:

- View a list of tasks
- Add a new task via a form
- Toggle a task as complete/incomplete
- See a "loading" state while data is being fetched

```
┌─────────────────────────────────────┐
│  ✅ Task Tracker                     │
│                                     │
│  [What needs to be done?] [Add]     │
│                                     │
│  ☐ Buy groceries                    │
│  ☑ Finish homework  [Delete]        │
│  ☐ Walk the dog      [Delete]       │
│                                     │
│  Showing 3 of 3 tasks               │
└─────────────────────────────────────┘
```

### 2.3 Project Structure

```
nextjs/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx       ← Root layout
│   │   └── page.tsx         ← Main page (fetches + renders tasks)
│   ├── components/
│   │   ├── TaskList.tsx      ← Renders list of tasks
│   │   ├── TaskItem.tsx      ← Single task row (toggle + delete)
│   │   ├── AddTaskForm.tsx   ← Form to add a new task
│   │   └── TaskCounter.tsx   ← "Showing X of Y tasks" footer
│   └── lib/
│       └── api.ts            ← Simulated API calls (fetchTasks, addTask, etc.)
├── __tests__/                ← Vitest unit & component tests
│   ├── TaskItem.test.tsx
│   ├── TaskList.test.tsx
│   ├── AddTaskForm.test.tsx
│   ├── TaskCounter.test.tsx
│   └── api.test.ts
├── e2e/                      ← Playwright E2E tests
│   ├── smoke.spec.ts         ← Page loads, basic content check
│   └── task-flow.spec.ts     ← Add, toggle, delete tasks
├── playwright.config.ts
├── vitest.config.ts
├── package.json
└── pnpm-lock.yaml
```

---

## 3. Component Design

### 3.1 Components

| Component | Props | Behavior |
|-----------|-------|----------|
| `TaskList` | `tasks: Task[]`, `onToggle, onDelete` | Maps tasks to `TaskItem` components |
| `TaskItem` | `task: Task, onToggle, onDelete` | Checkbox (toggle), text, delete button |
| `AddTaskForm` | `onAdd: (title: string) => void` | Text input + submit button |
| `TaskCounter` | `total: number, completed: number` | "Showing X of Y tasks" |

```typescript
// Shared types
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

---

## 4. Test Design — Vitest (Unit / Component)

### 4.1 Setup

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom
```

**`vitest.config.ts`:**
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    globals: true,
    exclude: ["node_modules", "e2e"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### 4.2 Passing Tests (intentional) — 25 total

| Test | What it checks |
|------|---------------|
| `TaskItem renders task title` | Component renders the task text |
| `TaskItem renders unchecked for incomplete` | Checkbox is unchecked when `completed: false` |
| `TaskItem renders checked for completed` | Checkbox is checked when `completed: true` |
| `TaskItem applies line-through when completed` | Text has strikethrough class |
| `TaskItem checkbox toggles` | Clicking checkbox calls `onToggle` |
| `TaskItem delete button works` | Clicking delete calls `onDelete` |
| `TaskList renders all tasks` | Renders correct number of items |
| `TaskList renders correct count` | `getAllByRole("listitem").toHaveLength(3)` |
| `TaskList empty state` | Shows "No tasks yet" when list is empty |
| `TaskList integration smoke` | Toggle works through component tree |
| `AddTaskForm renders input+button` | Placeholder text and Add button exist |
| `AddTaskForm submits text` | Form calls `onAdd` with input value |
| `AddTaskForm clears after submit` | Input resets after submission |
| `AddTaskForm does not call onAdd for empty` | Guard prevents empty submission |
| `AddTaskForm trims whitespace` | "  Task  " becomes "Task" |
| `TaskCounter shows "No tasks yet"` | Displayed when total is 0 |
| `TaskCounter shows partial counts` | Displays "2 of 3 tasks completed" |
| `TaskCounter all complete` | Shows "All tasks completed! 🎉" |
| `TaskCounter single task complete` | Handles 1/1 edge case |
| `api.fetchTasks returns data` | Returns array with correct length/shape |
| `api.addTask sends title` | Creates task with correct properties |
| `api.toggleTask flips status` | toggles `completed` from false to true |
| `api.toggleTask throws for unknown id` | Rejects with error message |
| `api.deleteTask removes a task` | Removes task and remaining count is correct |

```typescript
// Example: TaskItem.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TaskItem } from "@/components/TaskItem";

describe("TaskItem", () => {
  const mockTask = { id: "1", title: "Buy groceries", completed: false };
  const onToggle = vi.fn();
  const onDelete = vi.fn();

  it("renders the task title", () => {
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={onDelete} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("calls onToggle when checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={onDelete} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
```

### 4.3 Failing Tests (intentional) — 4 total

| Test | Mistake Demonstrated |
|------|---------------------|
| `TaskItem shows wrong text` | Asserting on text that doesn't exist — "Walk the dog" vs "Buy groceries" |
| `TaskItem expects checked when unchecked` | `toBeChecked()` on an unchecked checkbox |
| `TaskList wrong count` | Expecting 5 list items when there are only 2 |
| `AddTaskForm submits without input` | Weak test that passes vacuously — no assert on submit behavior |

```typescript
it("shows wrong task title (INTENTIONAL FAIL)", () => {
  render(<TaskItem task={mockTask} onToggle={() => {}} onDelete={() => {}} />);
  // FAILS: "Walk the dog" is not rendered — "Buy groceries" is
  expect(screen.getByText("Walk the dog")).toBeInTheDocument();
});
```

### 4.4 Mocking API Calls

```typescript
// api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("api.fetchTasks", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns parsed tasks on success", async () => {
    const fakeTasks = [{ id: "1", title: "Test", completed: false }];
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => fakeTasks,
    });

    const result = await api.fetchTasks();
    expect(result).toEqual(fakeTasks);
    expect(mockFetch).toHaveBeenCalledWith("/api/tasks");
  });

  it("throws on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    await expect(api.fetchTasks()).rejects.toThrow("Network error");
  });
});
```

---

## 5. Test Design — Playwright (E2E)

### 5.1 Setup

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
pnpm exec playwright install-deps  # System dependencies
```

**`playwright.config.ts`:**
```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
```

### 5.2 Passing Tests (intentional) — 8 total

| Test | What it checks |
|------|---------------|
| `Page loads and shows title` | Navigate to `/`, see "Task Tracker" heading |
| `Shows 3 seeded tasks` | Three `listitem` elements rendered |
| `Shows expected task titles` | "Buy groceries", "Finish homework", "Walk the dog" visible |
| `Add a task` | Type in input, click Add, see new task appear |
| `Counter updates after adding` | Counter text changes from "3 of 3" to "of 4" |
| `Toggle a task complete` | Click checkbox, it becomes checked |
| `Delete a task reduces count` | Click delete, task count decreases from 3 to 2 |
| `Complete flow: add→toggle→delete` | Full workflow end-to-end |

```typescript
// e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("page loads and shows the task tracker heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /task tracker/i })).toBeVisible();
});

test("shows initial task list", async ({ page }) => {
  await page.goto("/");
  const tasks = page.getByRole("listitem");
  await expect(tasks).toHaveCount(3); // Seeded tasks
});
```

```typescript
// e2e/task-flow.spec.ts
import { test, expect } from "@playwright/test";

test("add a new task", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder(/what needs to be done/i).fill("Write code");
  await page.getByRole("button", { name: /add/i }).click();
  await expect(page.getByText("Write code")).toBeVisible();
});

test("toggle a task as complete", async ({ page }) => {
  await page.goto("/");
  const firstCheckbox = page.getByRole("checkbox").first();
  await firstCheckbox.check();
  await expect(firstCheckbox).toBeChecked();
});

test("delete a task", async ({ page }) => {
  await page.goto("/");
  const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
  await deleteBtn.click();
  // Task is removed — count decreases
  const tasks = page.getByRole("listitem");
  await expect(tasks).toHaveCount(2);
});
```

### 5.3 Failing Tests (intentional) — 3 total

| Test | Mistake Demonstrated |
|------|---------------------|
| `Page shows wrong heading` | Asserting heading text that doesn't exist — "Wrong Heading" vs "Task Tracker" |
| `Expects a task that doesn't exist` | Searching for text that isn't on the page |
| `Expects wrong number after delete` | Expecting 0 tasks after deleting 1 of 3 (should be 2) |

```typescript
test("expects wrong heading text (INTENTIONAL FAIL)", async ({ page }) => {
  await page.goto("/");
  // FAILS: heading says "Task Tracker", not "Wrong Heading"
  await expect(
    page.getByRole("heading", { name: /wrong heading/i })
  ).toBeVisible();
});

test("adds an empty task (INTENTIONAL FAIL)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /add/i }).click();
  // FAILS: empty task was added — test expected validation to block it
  const tasks = page.getByRole("listitem");
  await expect(tasks).toHaveCount(4); // But shouldn't have increased with empty input
});
```

---

## 6. Running Tests

### 6.1 Commands

```bash
# Vitest — unit / component tests
pnpm vitest run                       # Run once (CI mode)
pnpm vitest                           # Watch mode (dev)
pnpm vitest run --reporter=verbose     # Full test names

# Playwright — E2E tests
pnpm exec playwright test             # Run all E2E (headless)
pnpm exec playwright test --ui        # Interactive UI mode
pnpm exec playwright test --headed    # Watch browser
pnpm exec playwright test --debug     # Step-through debug

# View E2E report
pnpm exec playwright show-report      # Opens HTML report with traces

# Run everything
pnpm vitest run && pnpm exec playwright test
```

### 6.2 Speed Comparison

| Test Type | Typical Runtime | What It Covers |
|-----------|----------------|----------------|
| Vitest (unit) | < 1s | Isolated component logic, pure assertions |
| Vitest (component) | 2–5s | Rendering, user interactions, mock API |
| Playwright (E2E) | 10–30s | Full page loads, real browser, network |

> **Teaching point:** Unit tests are fast and pinpoint issues. E2E tests are
> slower but catch integration bugs. Both are valuable — that's the testing
> pyramid.

---

## 7. Implementation Checklist — All Complete ✓

| # | Task | Status |
|---|------|--------|
| 1 | Scaffold Next.js app | ✅ Done |
| 2 | Create `Task` type | ✅ Done |
| 3 | Build `lib/api.ts` | ✅ Done (in-memory, artificial delay) |
| 4 | Build `TaskItem` component | ✅ Done (checkbox, title, delete) |
| 5 | Build `TaskList` component | ✅ Done (maps tasks, empty state) |
| 6 | Build `AddTaskForm` component | ✅ Done (input + submit, trim guard) |
| 7 | Build `TaskCounter` component | ✅ Done (counts, all-done message) |
| 8 | Wire up `page.tsx` | ✅ Done (loading, optimistic toggle) |
| 9 | Install Vitest + Testing Library | ✅ Done |
| 10 | Create `vitest.config.ts` | ✅ Done (jsdom, e2e excluded) |
| 11 | Write `__tests__/setup.ts` | ✅ Done |
| 12 | Write passing component tests | ✅ Done (25 passing) |
| 13 | Write intentionally failing tests | ✅ Done (4 failing) |
| 14 | Run Vitest suite | ✅ 25 pass, 4 fail |
| 15 | Install Playwright | ✅ Done (chromium headless shell) |
| 16 | Create `playwright.config.ts` | ✅ Done (webServer, HTML reporter) |
| 17 | Write smoke E2E tests | ✅ Done (3 smoke tests) |
| 18 | Write task-flow E2E tests | ✅ Done (6 flow tests) |
| 19 | Write intentionally failing E2E tests | ✅ Done (3 failing) |
| 20 | Run full Playwright suite | ✅ 8 pass, 3 fail |

## 8. Test Results Summary

| Suite | Passing | Failing | Runtime |
|-------|---------|---------|---------|
| Vitest (NextJS) | 25 | 4 (intentional) | ~10s |
| Playwright (NextJS) | 8 | 3 (intentional) | ~40s |
| **Total** | **33** | **7** | |

All intentional failures demonstrate specific testing anti-patterns:
- Wrong expected values / nonexistent text
- Forgetting to assert on actual behavior
- Wrong assumptions about component state
- Wrong counts after state changes

---

## 8. Future Considerations (Out of Scope)

- Testing Next.js Server Actions — the demo uses `useState` + `fetch` mocks
- Visual regression testing (Playwright snapshot) — too advanced for intro
- Accessibility testing (Playwright axe-core) — follow-up exercise
- Component stories (Storybook) — not needed for testing demo
- CI pipeline integration — would distract from core testing concepts