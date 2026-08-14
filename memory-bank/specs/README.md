# Testing Demo — Specs

This directory contains the specifications for the **Testing Demo**. Each file
covers a specific demo application. These specs define the scope, design, test
patterns, and implementation checklist for each example.

## File Index

| File | Covers | Status |
|------|--------|--------|
| [fastapi-testing-demo.md](./fastapi-testing-demo.md) | FastAPI unit testing demo — business logic, `unittest`, mocking | Draft |
| [nextjs-testing-demo.md](./nextjs-testing-demo.md) | NextJS testing demo — Vitest component tests & Playwright E2E | Draft |

### Reading Order

1. **[fastapi-testing-demo.md](./fastapi-testing-demo.md)** — Start here.
   Pure Python, no server, fastest feedback loop. Builds testing fundamentals
   (assertions, fixtures, mocking, edge cases) without browser complexity.

2. **[nextjs-testing-demo.md](./nextjs-testing-demo.md)** — Move here second.
   Applies the same testing concepts in a frontend context, then adds E2E
   testing with Playwright at the top of the testing pyramid.

### Implementation Notes

