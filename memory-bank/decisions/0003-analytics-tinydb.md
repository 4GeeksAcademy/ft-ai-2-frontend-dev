# ADR-0003: TinyDB for analytics storage

## Status

Superseded by [ADR-0009](./0009-analytics-supabase.md)

## Context

Analytics is a teaching sidecar: ingest events and stream them. It should stay
lightweight and familiar from the relational-db module's TinyDB example, without
a second Postgres schema for MVP.

## Decision

Store analytics events in TinyDB (JSON file under a Compose volume).

## Consequences

- Fast to bootstrap; no migrations for analytics
- Not durable/scalable — fine for local workshop demos
- Volume-mount `data/` so restarts keep recent events during a session
- Safety rules for TinyDB apply only to this service; Postgres rules apply to
  `brevity-api`
