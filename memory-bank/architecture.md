# Project Architecture

This is a demo to show the complete structure that we've been building for our applications.

## Project Tooling

- `docker compose` for containerization
- Python
    - `uv` Python package management
    - `autopep8` for python formatting
    - `pytest` for unit testing
    - `ruff` for linting
- TypeScript/CSS/HTML
    - `pnpm` for Node package management
    - Prettier for TS/HTML/CSS formatting
- `.env` files for secret management

## Project Stack

### Backend

- Python 3.12+
- FastAPI
- Postgres for data storage
    - `psycopg` 3+ as a database adapter
    - `alembic` for database migration
- `jose` and `libpass` for auth
    - With a JWT Token refresh flow

### Task Offloading

- Python 3.12+
- Celery 5.5+ using Redis 8+ as a message broker and result store

### Observability

- Python 3.12+
- FastAPI analytics backend
- OTel Collector + Jaeger
- MongoDB for analytics data storage

### Frontend

- NextJS 16+ with TypeScript
- Component-based design
- TailwindCSS 4+ for styling

### API Security & Rate Limiting

- **CORS middleware** configured per-environment to restrict allowed origins
- **CSRF/XSS protection** via secure cookie flags (`HttpOnly`, `Secure`, `SameSite`) and Content Security Policy headers
- **Rate limiting** via `slowapi` or custom FastAPI middleware to prevent abuse
    - Per-IP and per-route rate limits with configurable bursts
- **Request validation** using Pydantic schemas to sanitize and validate all inputs

### Health Checks & Infrastructure

- **Readiness probes** at `/health/ready` — confirms DB, Redis, and upstream services are reachable
- **Liveness probes** at `/health/live` — lightweight check that the application process is alive
- **Startup probes** at `/health/startup` — verifies migrations and initialisation have completed
- **Graceful shutdown** handling (SIGTERM/SIGINT) to drain connections and complete in-flight requests before exiting
