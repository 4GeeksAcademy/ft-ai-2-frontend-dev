# ADR-0009: Supabase Postgres for analytics storage

## Status

Accepted

## Context

Analytics (`brevity-analytics`) currently stores events in TinyDB (ADR-0003).
That was appropriate for early workshop sessions but is not durable across
deployments and does not reflect production Postgres patterns. The project root
`.env` already reserves `SUPABASE_DB_URL` for a hosted Postgres connection.

Analytics remains a teaching sidecar: ingest events, list them, and stream over
WebSocket. It must stay decoupled from `brevity-api`'s local Compose Postgres
and schema.

## Decision

1. Replace TinyDB with **PostgreSQL on Supabase**, accessed via **psycopg3**
   (direct driver — no SQLAlchemy/SQLModel in this service).
2. Read the connection string from **`SUPABASE_DB_URL`** in the project root
   `.env` (passed through Compose to `brevity-analytics`).
3. Store events in a single **`analytics_events`** table (see
   [analytics-storage.md](../specs/analytics-storage.md)).
4. Keep the public HTTP/WS contract unchanged (`POST /analytics/event`,
   `GET /analytics/events`, `WS /analytics/ws`).
5. Keep unauthenticated ingest (ADR-0006) — this migration does not add auth.
6. Remove the `analytics-data` Compose volume and `ANALYTICS_DB_PATH` env var.

## Consequences

- Durable, hosted storage suitable for demos beyond a single machine session
- Students practice real Postgres access (psycopg3, parameterized SQL, SSL)
- Analytics and app data live in separate databases — no shared Alembic history
  with `brevity-api` (analytics uses its own migration approach)
- `SUPABASE_DB_URL` is a secret — never commit `.env`; document in
  `.env.example` only
- **Docker:** use Supabase's IPv4 or pooler connection string — the default
  direct host may be IPv6-only and unreachable from Compose
- Supersedes ADR-0003 (TinyDB)
- memory-bank safety rules for analytics switch from TinyDB to Postgres
