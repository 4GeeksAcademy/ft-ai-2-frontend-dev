# ft-ai-2-frontend-dev

<!-- TOC:START -->

## Module Demonstrations

Each demonstration lives on its own branch:

- Providing Visual Specs To The AI: [module/specs-pt-1](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/specs-pt-1)
- Single Page Apps: [module/spa](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/spa)
- Structure: [module/structure](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/structure)
- Building An Application: [module/book_app](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/book_app)
- Making `fetch` requests: [module/restful_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/restful_apis)
- Helping LLMs Understand APIs: [module/agents_and_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/agents_and_apis)
- Server VS Client Components: [module/server_client_divide](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/server_client_divide)
- API Concepts Review: [module/api_review](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/api_review)
- Python [module/python](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/python)
- Defining Backend Architecture: [module/backend_arch](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/backend_arch)
- Designing Routes: [module/designing_routes](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/designing_routes)
- File I/O: [module/file-io](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io)
- File I/O Example: [module/file-io-example](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io-example)
- TinyDB Example: [module/db-basics](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/db-basics)
- Relational Database (SQLModel): [module/relational-db](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/relational-db)
- Observability (Brevity.app): [module/observability](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/observability)
<!-- TOC:END -->

## Current Branch: `module/observability` — Brevity.app

A three-service microblog built as a **teaching tool for observability**
(logs, metrics, distributed traces). Posts are limited to a single word (or a
sole `@username` mention).

Specs: [memory-bank/product-context.md](./memory-bank/product-context.md) ·
[mvp-scope.md](./memory-bank/specs/mvp-scope.md) ·
**[DEMO.md](./DEMO.md)** (runbook)

### Tech Stack

| Service | Stack |
|---------|--------|
| **brevity** | Next.js 16, React 19, Tailwind CSS 4, pnpm |
| **brevity-api** | FastAPI, SQLModel, Postgres, Alembic, OpenTelemetry |
| **brevity-analytics** | FastAPI, TinyDB, OpenTelemetry |
| **postgres** | postgres:16-alpine |
| **otel-collector** | OTLP → Jaeger + Prometheus |
| **jaeger** | Trace UI (`:16686`) |

### Running Locally

```bash
cp .env.example .env    # optional
docker compose up --build
uv run --project brevity-api python scripts/seed.py
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | App |
| http://localhost:8000/health | API health (+ DB) |
| http://localhost:8001/health | Analytics health |
| http://localhost:8000/metrics | API Prometheus metrics |
| http://localhost:8001/metrics | Analytics Prometheus metrics |
| http://localhost:16686 | Jaeger UI |
| http://localhost:8889/metrics | Collector-scraped OTLP metrics |

Browser clients use `localhost` (`NEXT_PUBLIC_*`). Containers use Compose DNS
(`API_URL`, `ANALYTICS_URL`, `OTEL_EXPORTER_OTLP_ENDPOINT`) — see ADR-0008.

### Observability notes

- Structured JSON logs on API + analytics
- **Batched** OTLP export: `BatchSpanProcessor` + periodic metric reader
  (not `SimpleSpanProcessor`) — see `DEMO.md` for knobs
- API → analytics propagates W3C `traceparent`; post-create traces span both services
- Telemetry is fail-open if the collector is down
