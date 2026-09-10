# Project Architecture

This is a demo to show the complete structure that we've been building for our applications.

## Project Tooling

- `docker compose` for containerization
- Python
    - `uv` Python package management
    - `autopep8` for python formatting
    - `pytest` for unit testing
- TypeScript/CSS/HTML
    - `pnpm` for Node package management
    - Prettier for TS/HTML/CSS formatting

## Project Stack

### Backend

- Python 3.12+
- FastAPI
- Postgres for data storage
    - `psycopg` 3+ as a database adapter
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
