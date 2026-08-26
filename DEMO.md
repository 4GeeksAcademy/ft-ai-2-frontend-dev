# Demo runbook — Brevity.app (observability workshop)

## Quick start

```bash
cp .env.example .env   # optional
docker compose up --build
uv run --project brevity-api python scripts/seed.py
```

| URL | What |
|-----|------|
| http://localhost:3000 | Frontend |
| http://localhost:8000/docs | API Swagger |
| http://localhost:8001/docs | Analytics Swagger |
| http://localhost:8001/analytics (app) or `/analytics` in UI | Live analytics WS viewer |
| http://localhost:16686 | **Jaeger** UI (traces) |
| http://localhost:8889/metrics | Collector Prometheus scrape |
| http://localhost:8000/metrics | API Prometheus metrics |
| http://localhost:8001/metrics | Analytics Prometheus metrics |

Demo logins (after seed): see seed script output. Fresh DB: `alice@example.com` / `password123`.

## Product path

1. Open http://localhost:3000 — log in as alice.
2. Confirm timeline shows bob’s posts (seed follow).
3. Create a one-word post (e.g. `observability`).
4. Open **Analytics** in the nav — create another post / like; watch events stream.
5. On bob’s profile, use Follow/Unfollow; like a post (optimistic UI).

## Distributed trace (Session 4)

1. Open Jaeger: http://localhost:16686
2. Service: `brevity-api` → Find Traces (look for recent `POST /posts`).
3. Expand the trace: you should see API request span → `analytics.emit` →
   analytics `POST /analytics/event` / `analytics.store_event`.
4. **Batching:** spans may appear ~1s after the request (`OTEL_BSP_SCHEDULE_DELAY`).
   Fire a few posts quickly; they often flush together. Contrast: we use
   `BatchSpanProcessor`, **not** `SimpleSpanProcessor` (per-span sync export).

### Batching knobs (Compose / `.env`)

| Env | Default | Meaning |
|-----|---------|---------|
| `OTEL_BSP_SCHEDULE_DELAY` | `1000` | ms between span batch exports |
| `OTEL_BSP_MAX_EXPORT_BATCH_SIZE` | `64` | max spans per export |
| `OTEL_METRIC_EXPORT_INTERVAL` | `5000` | ms between metric exports |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://otel-collector:4318` | OTLP HTTP to collector |

Unset `OTEL_EXPORTER_OTLP_ENDPOINT` to disable export (apps still run — fail-open).

## Networking reminder

- Browser: `localhost` (`NEXT_PUBLIC_*`)
- Containers: Compose DNS (`brevity-api`, `brevity-analytics`, `otel-collector`)
- CORS allows frontend + Swagger origins on `:3000` / `:8000` / `:8001`
