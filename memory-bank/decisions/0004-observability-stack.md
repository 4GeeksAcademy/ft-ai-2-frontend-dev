# ADR-0004: OpenTelemetry with a Compose-hosted viewer

## Status

Accepted

## Context

The module teaches observability. Emitting traces without a place to view them
fails the workshop goal.

## Decision

- Instrument services with the OpenTelemetry SDK (Python for APIs; JS optional
  for the browser)
- Session 0 scaffolds app Compose only — **no** collector/Jaeger yet
- Add an OTel Collector + Jaeger (or equivalent) to Docker Compose in Session 4
- Sessions 1–3 may log structured JSON and optionally create spans without a
  hard dependency on the collector (fail open if exporter is down)

## Consequences

- `docker compose up` eventually includes a trace UI (e.g. `:16686`)
- Demo script includes “follow a post-create trace across API → analytics”
- Compose file grows; document optional profiles if the stack feels heavy
