# ADR-0001: Compose layout without Turborepo

## Status

Accepted

## Context

Prior modules used Turborepo for a shared frontend/backend monorepo. Brevity
has three independently deployable services plus Postgres and (later) an
observability stack. Shared TypeScript packages are not required for MVP.

## Decision

Use Docker Compose with separate directories at the repo root
(`brevity/`, `brevity-api/`, `brevity-analytics/`). Do not introduce Turborepo.

## Consequences

- Simpler mental model for workshop participants
- Each service owns its own lockfile (`pnpm` / `uv`)
- Cross-cutting changes require touching multiple dirs (acceptable for MVP)
