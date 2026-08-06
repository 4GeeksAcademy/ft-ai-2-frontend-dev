# Safety Rules

This directory contains the safety rules for developing **Wordweb**. Each file
addresses a specific concern area. Rules are small, self-contained, and should
be referenced when making changes in the corresponding domain.

## Index

| File | Scope |
|------|-------|
| [general-safety.md](./general-safety.md) | Cross-cutting safety principles for the entire project |
| [frontend-safety.md](./frontend-safety.md) | NextJS, TypeScript, React, and component safety |
| [backend-safety.md](./backend-safety.md) | FastAPI, Python, and API endpoint safety |
| [database-safety.md](./database-safety.md) | TinyDB write/read integrity and data safety |
| [ui-safety.md](./ui-safety.md) | Rendering, graph display, search, and form safety |
| [process-safety.md](./process-safety.md) | AI collaboration, code review, and development process safety |

## Quick Reference

### Golden Rules

1. **Validate everything** — every input, every boundary, every API call.
2. **Never trust the client** — validate server-side regardless of client checks.
3. **Fail safely** — never expose internals in error messages.
4. **Least privilege** — only access what you need, only expose what you must.
5. **Document decisions** — if it matters for safety, record it in decisions/.

### Directory Structure

```
rules/
├── README.md          ← this file (index)
├── general-safety.md  ← cross-cutting principles
├── frontend-safety.md ← React / NextJS / TypeScript
├── backend-safety.md  ← FastAPI / Python
├── database-safety.md ← TinyDB data integrity
├── ui-safety.md       ← rendering / graph / search
└── process-safety.md  ← AI / review / workflow
```
