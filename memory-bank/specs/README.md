# MVP Specs

This directory contains the specifications for the **Wordweb MVP**. Each file
covers a specific aspect of the application. These specs define the scope and
design decisions for the first working version.

## Index

| File | Scope |
|------|-------|
| [mvp-overview.md](./mvp-overview.md) | MVP scope, features, user stories, and flow |
| [architecture.md](./architecture.md) | System architecture, tech stack, project structure, API routes |
| [frontend.md](./frontend.md) | Pages, component tree, layouts, states, search |
| [backend.md](./backend.md) | API endpoints, service layer, database setup, error handling |
| [data-model.md](./data-model.md) | Pydantic models, TinyDB docs, frontend TS types, relationships |

## Quick Summary

| Area | Decision |
|------|----------|
| **Frontend** | NextJS 14+ App Router, TypeScript strict, Tailwind CSS |
| **Graph viz** | reagraph for concept map display |
| **Search** | fuse.js (client-side, debounced) |
| **Backend** | FastAPI, Pydantic validation |
| **Storage** | TinyDB (3 tables: maps, nodes, categories) |
| **IDs** | UUIDv4 throughout |
| **Scope** | Single-user, no auth, builder-only view |

### Directory Structure

```
specs/
├── README.md          ← this file (index)
├── mvp-overview.md    ← scope, stories, flow
├── architecture.md    ← system design, routes, structure
├── frontend.md        ← pages, components, UI
├── backend.md         ← endpoints, services, errors
└── data-model.md      ← models, types, relationships
```
