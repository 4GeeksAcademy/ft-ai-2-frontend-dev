# MVP Specs

This directory contains the specifications for **Brevity.app**. Each file
covers a specific aspect of the application. These specs define the scope and
design decisions for the first working version.

## File Index

| File | Covers | Status |
|------|--------|--------|
| [mvp-scope.md](./mvp-scope.md) | Overall MVP scope, session breakdown, in/out-of-scope, success criteria | ✅ Draft |
| [data-model.md](./data-model.md) | SQLModel entities (User, Post, Like, Follow), fields, relationships, constraints | ✅ Draft |
| [api-routes.md](./api-routes.md) | All REST endpoints across auth, users, posts, social, and analytics services | ✅ Draft |
| [architecture.md](./architecture.md) | System architecture, Docker Compose services, directory structure, data flow diagrams | ✅ Draft |

## Design Principles

- **MVP-first:** Build only what's needed for the 3-4 session demo
- **Observability from day one:** Logging, metrics, and traces are not afterthoughts
- **Consistent with prior modules:** Reuses patterns from the auth-demo (JWT, React 19 forms) and relational-db (SQLModel, PostgreSQL) branches
