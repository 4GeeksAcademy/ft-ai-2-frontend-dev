# Project Directory Structure

Derived from the [architecture document](./architecture.md). This structure maps every directory to a component in the project stack.

```
project-root/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py               # Dependency injection
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py
│   │   │       │   ├── users.py
│   │   │       │   └── items.py
│   │   │       └── router.py         # v1 router aggregation
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # pydantic-settings
│   │   │   └── security.py           # CORS, CSP headers
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # SQLAlchemy Base
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py
│   │   │   │   └── item.py
│   │   │   └── session.py            # engine & session factory
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── rate_limit.py         # slowapi / custom rate limiter
│   │   │   └── request_validation.py # input sanitisation
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   └── item.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py       # jose + libpass JWT logic
│   │   │   └── user_service.py
│   │   ├── health.py                 # /health/ready, /health/live, /health/startup
│   │   ├── lifespan.py               # startup/shutdown hooks (graceful shutdown)
│   │   └── main.py                   # FastAPI app factory
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_api/
│   │   └── test_services/
│   ├── pyproject.toml
│   └── Dockerfile
│
├── frontend/                         # NextJS 16+ Frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                       # Primitive/atomic components
│   │   ├── layout/                   # Header, Sidebar, Footer
│   │   └── forms/                    # Form components
│   ├── lib/
│   │   ├── api-client.ts             # Typed API client
│   │   └── auth.ts                   # Token management
│   ├── public/
│   │   ├── images/
│   │   └── fonts/
│   ├── styles/
│   │   └── globals.css               # TailwindCSS 4+ imports
│   ├── tests/
│   │   ├── components/
│   │   └── e2e/                      # Playwright / Cypress
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
│
├── task-worker/                      # Celery Task Offloading
│   ├── app/
│   │   ├── __init__.py
│   │   ├── celery_app.py             # Celery 5.5+ instance
│   │   ├── config.py                 # Redis broker & result backend
│   │   └── tasks/
│   │       ├── __init__.py
│   │       ├── email_tasks.py
│   │       └── report_tasks.py
│   ├── tests/
│   ├── pyproject.toml
│   └── Dockerfile
│
├── analytics/                        # Observability / Analytics Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── ingest.py             # Event ingestion endpoints
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── db/
│   │   │   ├── mongo_client.py       # MongoDB connection
│   │   │   └── models.py             # MongoDB document models
│   │   ├── main.py
│   │   └── health.py
│   ├── tests/
│   ├── pyproject.toml
│   └── Dockerfile
│
├── infra/                            # Infrastructure & Config
│   ├── docker/
│   │   ├── docker-compose.yml        # Local dev (all services)
│   │   ├── docker-compose.prod.yml   # Production overrides
│   │   └── docker-compose.observability.yml  # OTel + Jaeger + Mongo
│   ├── otel/
│   │   └── otel-collector-config.yml
│   ├── jaeger/
│   │   └── jaeger-config.yml
│   ├── monitoring/                   # Metrics & dashboards
│   ├── nginx/                        # Reverse proxy config (if needed)
│   └── env/
│       ├── .env.example
│       ├── .env.backend
│       └── .env.frontend
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, test, build
│       └── cd.yml                    # Deploy
│
├── scripts/
│   ├── setup.sh                      # Bootstrap project
│   └── seed.py                       # Database seed data
│
├── .gitignore
├── .pre-commit-config.yaml
├── README.md
└── Makefile                          # Convenience commands
```

## Directory Mapping to Architecture Components

| Directory | Architecture Component | Key Purpose |
|-----------|----------------------|-------------|
| `backend/` | Backend | FastAPI app, Postgres models, Alembic migrations, JWT auth |
| `frontend/` | Frontend | NextJS 16+ App Router, TailwindCSS 4+, typed API client |
| `task-worker/` | Task Offloading | Celery 5.5+ with Redis broker, background task definitions |
| `analytics/` | Observability | Separate FastAPI service, MongoDB ingestion, OTel export |
| `infra/` | Infrastructure | Docker Compose, OTel/Jaeger config, env files |
| `infra/docker/` | All | Local dev, production, and observability Compose files |
| `infra/otel/` | Observability | OpenTelemetry Collector configuration |
| `infra/jaeger/` | Observability | Jaeger tracing backend configuration |
| `.github/workflows/` | CI/CD | Lint, test, build, and deploy pipelines |
| `scripts/` | Tooling | Project bootstrap and data seeding |