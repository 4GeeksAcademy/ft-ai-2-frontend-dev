# Brevity.app — Architecture Design

## System Overview

Brevity.app is a multi-service application orchestrated with Docker Compose.
All services run locally during development. The observability viewer
(collector + UI) is part of Compose so traces are visible without extra setup.

```mermaid
flowchart LR
    subgraph DC["Docker Compose"]
        direction TB
        F["brevity<br/>(Next.js 16)<br/>:3000"]
        API["brevity-api<br/>(FastAPI + SQLModel)<br/>:8000"]
        A["brevity-analytics<br/>(FastAPI + TinyDB)<br/>:8001"]
        DB[("PostgreSQL<br/>:5432")]
        OTEL["OTel Collector"]
        J["Jaeger UI<br/>:16686"]
    end

    Browser["Browser<br/>(localhost)"]

    Browser -- "HTTP / WS<br/>localhost:3000/8000/8001" --> F
    Browser -- "HTTP / WS<br/>localhost:8000" --> API
    Browser -- "HTTP / WS<br/>localhost:8001" --> A
    F -- "HTTP / JSON<br/>(SSR: service DNS)" --> API
    API -- "SQL" --> DB
    API -- "HTTP + traceparent" --> A
    F -. "optional browser OTel" .-> OTEL
    API --> OTEL
    A --> OTEL
    OTEL --> J
```

## Networking: browser vs containers

Docker service hostnames (`brevity-api`, `brevity-analytics`) resolve **only
inside the Compose network**. The browser on the host cannot use them.

| Consumer | API base URL | Analytics base URL |
|----------|--------------|--------------------|
| Browser / client JS | `http://localhost:8000` | `http://localhost:8001` |
| Next.js SSR inside Compose | `http://brevity-api:8000` | `http://brevity-analytics:8001` |

**Env vars (recommended):**

- `NEXT_PUBLIC_API_URL=http://localhost:8000` — safe for browser bundles
- `API_URL=http://brevity-api:8000` — server-only override for SSR (if used)
- `NEXT_PUBLIC_ANALYTICS_URL=http://localhost:8001`
- `ANALYTICS_URL=http://brevity-analytics:8001` — API → analytics (server-side)

**CORS:** `brevity-api` and `brevity-analytics` must allow origins from
`http://localhost:3000` (and the workshop host if different).

Authenticated data loading is **client-side** (JWT in memory). Prefer not
relying on SSR for authenticated API calls; if SSR is used later, switch to
httpOnly cookies (out of current MVP auth story — see ADR).

## Service Details

### 1. `brevity` — Next.js 16 Frontend

- **Port:** 3000
- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS 4 (dark zinc theme)
- **Key pages:** Login, Register, Timeline Feed, User Profile, Create Post
- **Auth pattern:** JWT stored in React context (memory only, no localStorage).
  Refresh clears the session — acceptable for a teaching demo.
- **API calls:** Client-side `apiClient` for authenticated routes; public routes
  may use server fetch with `API_URL` if needed
- **Instrumentation:** OpenTelemetry JS SDK for browser traces (optional; Session 4)

### 2. `brevity-api` — FastAPI Backend

- **Port:** 8000
- **Framework:** FastAPI with SQLModel ORM
- **Database:** PostgreSQL (via psycopg)
- **Auth:** JWT (HS256) with `jose` and `libpass`
- **Migrations:** Alembic
- **Endpoints:** Auth, Users, Posts, Social (see api-routes.md)
- **Instrumentation:** OpenTelemetry Python SDK, structured JSON logging
- **Outbound:** When emitting analytics events, propagate W3C `traceparent`

### 3. `brevity-analytics` — FastAPI Analytics Server

- **Port:** 8001
- **Framework:** FastAPI
- **Storage:** TinyDB (JSON file in `data/` directory)
- **Endpoints:** REST event ingestion, WebSocket event stream
- **Auth:** None on ingest (intentional demo tradeoff — see ADR)
- **Instrumentation:** Structured JSON logging; OTel spans for ingest + WS

### 4. `postgres` — PostgreSQL Database

- **Port:** 5432
- **Image:** postgres:16-alpine
- **Volume:** Named volume for data persistence

### 5. Observability stack (Session 4; scaffold ports early)

- **OTel Collector** — receives OTLP from services
- **Jaeger** (or Grafana Tempo) — UI for traces, default port `16686`
- App services can emit no-op / log-only until the collector is added; avoid
  hard-failing requests if the exporter is down during Sessions 0–3

## Directory Structure

```
brevity.app/
├── docker-compose.yml
├── .env.example
├── README.md
├── scripts/
│   └── seed.py                 # Demo users, posts, follows
├── brevity/                    # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Timeline feed
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── profile/[username]/page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── PostCard.tsx
│   │   ├── CreatePostForm.tsx
│   │   ├── FollowButton.tsx
│   │   ├── LikeButton.tsx
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── auth.tsx
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── brevity-api/                # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py           # SQLModel models
│   │   ├── schemas.py          # Pydantic request/response schemas
│   │   ├── auth.py             # JWT helpers
│   │   ├── database.py         # DB session
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── posts.py
│   │   │   └── social.py
│   │   └── telemetry.py        # OpenTelemetry config
│   ├── alembic/
│   ├── pyproject.toml
│   └── Dockerfile
├── brevity-analytics/          # FastAPI analytics
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── event_store.py      # TinyDB wrapper
│   │   └── websocket.py        # WS manager
│   ├── pyproject.toml
│   └── Dockerfile
└── memory-bank/                # Project documentation
    ├── product-context.md
    ├── specs/
    │   ├── mvp-scope.md
    │   ├── data-model.md
    │   ├── api-routes.md
    │   └── architecture.md
    └── decisions/
```

## Data Flow

```mermaid
sequenceDiagram
    actor User
    participant Next as Next.js (brevity)
    participant API as FastAPI (brevity-api)
    participant DB as PostgreSQL
    participant Ana as Analytics (brevity-analytics)

    Note over User,Ana: Post Creation
    User->>Next: Write a word + submit
    Next->>API: POST /posts (JWT)
    API->>API: Validate word constraint
    API->>DB: INSERT post
    API-->>Ana: POST /analytics/event (post_created) + traceparent
    Ana->>Ana: Store in TinyDB
    API-->>Next: Return post JSON
    Next-->>User: Show updated timeline

    Note over User,Ana: Timeline Load
    User->>Next: Open feed
    Next->>API: GET /posts/timeline (JWT)
    API->>DB: Query followed users' posts + mentions of self + own posts
    DB-->>API: Return records
    API-->>Next: Return JSON
    Note over Next,Ana: (async) page_view analytics from client
    Next-->>User: Render PostCard list

    Note over User,Ana: Like (not WS-synced social UI)
    User->>Next: Click like
    Next->>Next: Optimistic UI update
    Next->>API: POST /social/like/{id}
    API->>DB: INSERT like
    API-->>Ana: like_created event
    API-->>Next: 201
    Note over Next: Refetch or patch like_count if needed
```

## Observability Architecture

Each service:

1. **Structured Logging** — JSON-formatted logs to stdout (captured by Docker)
2. **Health Endpoint** — `GET /health` returns service status (+ DB for API)
3. **Request Metrics** — Count, duration, and status code per endpoint
4. **Distributed Tracing** — OpenTelemetry spans; W3C `traceparent` between
   services; export OTLP to the collector when present

## Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: brevity
      POSTGRES_USER: brevity
      POSTGRES_PASSWORD: brevity

  brevity-api:
    build: ./brevity-api
    ports: ["8000:8000"]
    depends_on: [postgres]
    environment:
      DB_URL: postgresql+psycopg://brevity:brevity@postgres:5432/brevity
      JWT_SECRET: ${JWT_SECRET:-dev-secret}
      ANALYTICS_URL: http://brevity-analytics:8001
      CORS_ORIGINS: http://localhost:3000
      # OTEL_EXPORTER_OTLP_ENDPOINT added in Session 4

  brevity-analytics:
    build: ./brevity-analytics
    ports: ["8001:8001"]
    volumes: [analytics-data:/app/data]
    environment:
      CORS_ORIGINS: http://localhost:3000

  brevity:
    build: ./brevity
    ports: ["3000:3000"]
    depends_on: [brevity-api]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_ANALYTICS_URL: http://localhost:8001
      # Server-only (if SSR public fetches are used):
      API_URL: http://brevity-api:8000

  # Session 4 — add when instrumenting end-to-end:
  # otel-collector:
  # jaeger:
  #   ports: ["16686:16686"]

volumes:
  pgdata:
  analytics-data:
```

> Note: `brevity-analytics` does **not** need `depends_on: brevity-api`. The
> API depends on analytics being reachable when emitting events; prefer
> `depends_on: [brevity-analytics]` on `brevity-api`, or tolerate transient
> failures and log them (good observability teaching moment).
