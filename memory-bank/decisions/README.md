# Decisions

Architecture Decision Records for Brevity.app. Keep entries short: context,
decision, consequences.

## File Index

| File | Decision | Status |
|------|----------|--------|
| [0001-compose-layout.md](./0001-compose-layout.md) | Docker Compose + root service dirs (no Turborepo) | Accepted |
| [0002-post-validation.md](./0002-post-validation.md) | Single-word / mention constraint at API layer | Accepted |
| [0003-analytics-tinydb.md](./0003-analytics-tinydb.md) | TinyDB for analytics events | Accepted |
| [0004-observability-stack.md](./0004-observability-stack.md) | OpenTelemetry + Compose viewer; batched OTLP export in Session 4 | Accepted |
| [0005-jwt-client-memory.md](./0005-jwt-client-memory.md) | JWT in React memory; client-side auth fetches | Accepted |
| [0006-realtime-and-analytics-auth.md](./0006-realtime-and-analytics-auth.md) | Analytics WS ≠ live social; open event ingest | Accepted |
| [0007-mention-timeline.md](./0007-mention-timeline.md) | Mentions appear in mentioned user's timeline | Accepted |
| [0008-browser-vs-docker-urls.md](./0008-browser-vs-docker-urls.md) | localhost for browser; service DNS in Compose | Accepted |
