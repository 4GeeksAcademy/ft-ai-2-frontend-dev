# ADR-0004: OpenTelemetry with a Compose-hosted viewer

## Status

Accepted

## Context

The module teaches observability. Emitting traces without a place to view them
fails the workshop goal. Naïve sync export (one OTLP request per span) also
hides how production SDKs actually ship telemetry.

## Decision

- Instrument services with the OpenTelemetry SDK (Python for APIs; JS optional
  for the browser)
- Session 0 scaffolds app Compose only — **no** collector/Jaeger yet
- Add an OTel Collector + Jaeger (or equivalent) to Docker Compose in Session 4
- Sessions 1–3 may log structured JSON and optionally create spans without a
  hard dependency on the collector (fail open if exporter is down)
- **Session 4 uses batched telemetry export by default:**
  - Traces: `BatchSpanProcessor` (not `SimpleSpanProcessor`)
  - Metrics: periodic exporting reader (batch/interval export)
  - Document tunable knobs for teaching (`schedule_delay_millis` /
    `max_export_batch_size`, or env equivalents)
  - Optional: briefly contrast with simple/sync processors so students see
    why batching exists (overhead, backpressure)

## Consequences

- `docker compose up` eventually includes a trace UI (e.g. `:16686`)
- Demo script includes “follow a post-create trace across API → analytics”
  and a short note that spans may appear after the batch flush window
- Compose file grows; document optional profiles if the stack feels heavy
- Students learn production-shaped export, not only “emit a span”
