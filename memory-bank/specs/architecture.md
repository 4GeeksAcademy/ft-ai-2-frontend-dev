# Brevity.app — Architecture Design

## System Overview

Brevity.app is a three-service application orchestrated with Docker Compose.
All services run locally during development.

```mermaid
flowchart LR
    subgraph DC["Docker Compose"]
        direction TB
        F["brevity<br/>(Next.js 16)<br/>:3000"]
        API["brevity-api<br/>(FastAPI + SQLModel)<br/>:8000"]
        A["brevity-analytics<br/>(FastAPI + TinyDB)<br/>:8001"]
        DB[("PostgreSQL<br/>:5432")]
    end

    F -- "HTTP / JSON" --> API
    API -- "SQL" --> DB
    API -- "HTTP / WS" --> A
    F -- "HTTP / WS" --> A
```

## Service Details

### 1. `brevity` — Next.js 16 Frontend

- **Port:** 3000
- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS 4 (dark zinc theme)
- **Key pages:** Login, Register, Timeline Feed, User Profile, Create Post
- **Auth pattern:** JWT stored in React context (memory only, no localStorage)
- **API calls:** Server-side fetch or client-side `apiClient` wrapper
- **Instrumentation:** OpenTelemetry JS SDK for browser traces (optional)

### 2. `brevity-api` — FastAPI Backend

- **Port:** 8000
- **Framework:** FastAPI with SQLModel ORM
- **Database:** PostgreSQL (via psycopg)
- **Auth:** JWT (HS256) with `jose` and `libpass`
- **Migrations:** Alembic
- **Endpoints:** Auth, Users, Posts, Social (see api-routes.md)
- **Instrumentation:** OpenTelemetry Python SDK, structured JSON logging

### 3. `brevity-analytics` — FastAPI Analytics Server

- **Port:** 8001
- **Framework:** FastAPI
- **Storage:** TinyDB (JSON file in `data/` directory)
- **Endpoints:** REST event ingestion, WebSocket event stream
- **Instrumentation:** Structured JSON logging

### 4. `postgres` — PostgreSQL Database

- **Port:** 5432
- **Image:** postgres:16-alpine
- **Volume:** Named volume for data persistence

## Directory Structure

```
brevity.app/
├── docker-compose.yml
├── .env.example
├── README.md
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
    │   └── api-routes.md
    └── ...
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
    API-->>Ana: POST /analytics/event (post_created)
    Ana->>Ana: Store in TinyDB
    API-->>Next: Return post JSON
    Next-->>User: Show updated timeline

    Note over User,Ana: Timeline Load
    User->>Next: Open feed
    Next->>API: GET /posts/timeline (JWT)
    API->>DB: Query posts from followed users
    DB-->>API: Return records
    API-->>Next: Return JSON
    Note over Next,Ana: (async) Analytics event fires independently
    Next-->>User: Render PostCard list
```

## Observability Architecture

Each service:

1. **Structured Logging** — JSON-formatted logs to stdout (captured by Docker)
2. **Health Endpoint** — `GET /health` returns service status + DB connectivity
3. **Request Metrics** — Count, duration, and status code per endpoint
4. **Distributed Tracing** — OpenTelemetry spans propagated via HTTP headers
   (traceparent) between services

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

  brevity-analytics:
    build: ./brevity-analytics
    ports: ["8001:8001"]
    depends_on: [brevity-api]
    volumes: [analytics-data:/app/data]

  brevity:
    build: ./brevity
    ports: ["3000:3000"]
    depends_on: [brevity-api]
    environment:
      NEXT_PUBLIC_API_URL: http://brevity-api:8000

volumes:
  pgdata:
  analytics-data:
```