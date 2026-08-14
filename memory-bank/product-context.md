# Product Context

Testing demo is a series of 2 minimal examples demonstrating concepts around
automated testing, including both passing and failing tests. It is designed for
students learning automated testing for the first time.

## Purpose & Learning Objectives

Each example demonstrates testing concepts at a different layer of the stack:

**FastAPI demo** — Writing unit tests for backend business logic (validation,
edge cases, error handling) using **pytest** with plain `assert` syntax.

**NextJS demo** — Writing component/integration tests with Vitest **and**
end-to-end (E2E) tests with Playwright for a Next.js application.

## Directory Setup

```
memory-bank/      ← Agent memory bank (this file)
fastapi/          ← FastAPI app + unit tests (business logic layer)
nextjs/           ← Next.js app + Vitest unit tests + Playwright E2E tests
```

- `fastapi/` — Demonstrates testing a minimal FastAPI application with tests
  on business logic (data validation, edge cases, error paths).
- `nextjs/` — Demonstrates testing a Next.js application at two levels:
  **Vitest** for component/unit tests, **Playwright** for E2E browser tests.

## Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Python package mgmt | `uv` | Dependency management & virtualenv |
| Backend framework | `fastapi[standard]` | REST API |
| Backend storage | `tinydb` + `MemoryStorage` | In-memory data (no real DB needed) |
| Python testing | `pytest` + `unittest.mock` | Unit tests for business logic + mocking |
| Frontend framework | `nextjs@latest` (App Router) | React UI |
| Frontend testing | `vitest` | Component & unit tests |
| E2E testing | `@playwright/test` | Browser-level end-to-end tests |
| Package mgmt (JS) | `pnpm` | Node.js dependency management |

## Testing Concepts Covered

| Concept | FastAPI | NextJS (Vitest) | NextJS (Playwright) |
|---------|---------|-----------------|---------------------|
| Basic assertions (`assertEqual`, `assertTrue`, etc.) | ✅ | ✅ | — |
| Test fixtures / setup & teardown | ✅ | ✅ | ✅ |
| Mocking external dependencies | ✅ | ✅ | — |
| Testing edge cases (empty input, boundaries) | ✅ | ✅ | — |
| Testing error / sad paths | ✅ | ✅ | ✅ |
| Component rendering tests | — | ✅ | — |
| Async component testing | — | ✅ | — |
| API mock / intercept | — | ✅ | ✅ |
| Full page load & interaction | — | — | ✅ |
| Form submission flow (E2E) | — | — | ✅ |
| Cross-browser testing | — | — | ✅ |
| Passing tests (baseline) | ✅ | ✅ | ✅ |
| Failing tests (demonstration) | ✅ | ✅ | ✅ |

## How to Run

### FastAPI Demo
```bash
cd fastapi
uv run pytest              # Run all tests
uv run pytest -v           # Verbose (see each pass/fail)
uv run pytest -k fail      # Run only failing tests
```

### NextJS Demo — Vitest
```bash
cd nextjs
pnpm install
pnpm vitest run            # Run all unit/component tests
pnpm vitest --ui           # Interactive UI mode
```

### NextJS Demo — Playwright (E2E)
```bash
cd nextjs
pnpm exec playwright test              # Run all E2E tests (headless)
pnpm exec playwright test --ui         # Interactive Playwright UI
pnpm exec playwright test --headed     # Watch browser during tests
pnpm exec playwright show-report       # View last test report
```

## Expected Output

When running the test suites, students will see a mix of passing (`.`) and
failing (`F`) tests. The failing tests are **intentional** — they demonstrate
common mistakes and how test output helps diagnose them.

- **FastAPI:** Console output with dotted progress, assertion error details.
- **Vitest:** Terminal UI with pass/fail counts, diff views for failed assertions.
- **Playwright:** HTML report with trace viewer, screenshots on failure, and
  video recording (when configured).

## Test Results (Verified)

| Suite | Passing | Failing | Runtime |
|-------|---------|---------|---------|
| FastAPI (calculator + mocks) | 26 | 4 (intentional) | ~0.2s |
| NextJS Vitest (unit/component) | 25 | 4 (intentional) | ~10s |
| NextJS Playwright (E2E) | 8 | 3 (intentional) | ~40s |
| **Total** | **59** | **11** | |

All failing tests are **intentional demonstrations** of common mistakes:
wrong expected values, missing assertions, unchecked assumptions, and
incorrect mocking assertions.

## Project Structure

```
fastapi/
├── app/
│   ├── __init__.py
│   ├── config.py              ← Simulated config (for mocking demo)
│   └── calculator.py          ← Pure business-logic functions
├── tests/
│   ├── __init__.py
│   ├── test_calculator.py     ← 17 passing + 3 failing (pytest style)
│   └── test_with_mocks.py     ← 6 passing + 2 failing (mock demos + fixture) |
├── pyproject.toml
└── uv.lock

nextjs/
├── src/
│   ├── app/
│   │   ├── globals.css         ← Dark theme (zinc-950)
│   │   ├── layout.tsx          ← Root layout + metadata
│   │   └── page.tsx            ← Main page (client component, fetches tasks)
│   ├── components/
│   │   ├── AddTaskForm.tsx     ← Input + submit (form event pattern)
│   │   ├── TaskCounter.tsx     ← "X of Y tasks completed"
│   │   ├── TaskItem.tsx        ← Checkbox, title, delete button
│   │   └── TaskList.tsx        ← Maps tasks to TaskItem, empty state
│   └── lib/
│       ├── api.ts              ← Simulated in-memory API (200-400ms delay)
│       └── types.ts            ← Shared TypeScript interfaces
├── __tests__/                  ← Vitest unit & component tests
│   ├── setup.ts                ← jest-dom matchers import
│   ├── AddTaskForm.test.tsx    ← 4 pass + 1 fail (weak test)
│   ├── TaskItem.test.tsx       ← 6 pass + 2 fail (wrong text, wrong checked)
│   ├── TaskList.test.tsx       ← 4 pass + 1 fail (wrong count)
│   ├── TaskCounter.test.tsx    ← 4 passing
│   ├── api.test.ts             ← 5 passing (mocked)
│   └── intentional-failures.test.tsx ← 4 failing tests
├── e2e/                        ← Playwright E2E tests
│   ├── smoke.spec.ts           ← 3 passing (page load, 3 tasks, titles)
│   ├── task-flow.spec.ts       ← 6 passing (add, toggle, delete, counter)
│   └── intentional-failures.spec.ts ← 3 failing (wrong heading, text, count)
├── playwright.config.ts
├── vitest.config.ts
├── next.config.ts
├── package.json
└── pnpm-lock.yaml
```
