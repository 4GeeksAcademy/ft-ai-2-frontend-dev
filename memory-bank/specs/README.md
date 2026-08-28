# MVP Specs

This directory contains the specifications for **Brevity.app**. Each file
covers a specific aspect of the application. These specs define the scope and
design decisions for the first working version.

## File Index

| File | Covers | Status |
|------|--------|--------|
| [mvp-scope.md](./mvp-scope.md) | Overall MVP scope, session breakdown, demo script, success criteria | ✅ Refined |
| [data-model.md](./data-model.md) | SQLModel entities (User, Post, Like, Follow), mention timeline semantics | ✅ Refined |
| [api-routes.md](./api-routes.md) | REST endpoints across auth, users, posts, social, and analytics | ✅ Refined |
| [architecture.md](./architecture.md) | Compose services, browser vs Docker URLs, CORS, OTel viewer, data flows | ✅ Refined |
| [analytics-storage.md](./analytics-storage.md) | Analytics event storage — Supabase Postgres via psycopg3 | ✅ Approved |
| [analytics-batch-events.md](./analytics-batch-events.md) | Batch ingest endpoint — `POST /analytics/events` for multi-event writes | ✅ Implemented |

## Design Principles

- **MVP-first:** Build only what's needed for Session 0 prep + the 3–4 live demos
- **Session 0 first:** Scaffold Compose and services before class; live time is
  for features and telemetry, not project init
- **Product before viewer:** Sessions 1–3 ship a demable app; Session 4 lands
  the trace UI and end-to-end OTel story
- **Observability in live sessions (light → deep):** Logs + `/health` in
  Session 1; collector/Jaeger in Session 4
- **Consistent with prior modules:** Reuses patterns from the auth-demo (JWT,
  React 19 forms) and relational-db (SQLModel, PostgreSQL, TinyDB) branches

## Related

- [../decisions/](../decisions/) — ADRs referenced by these specs
