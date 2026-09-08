# Spec: Full-Stack Celery Demo

## Goal

A full-stack Celery demo with a React frontend, FastAPI backend, Celery workers, and Redis — all orchestrated via Docker Compose. Demonstrates task definition, async task dispatch via REST API, result polling, and task chaining using Celery's canvas API.

All components use their latest stable versions.

## Version Targets

| Component | Target | Notes |
|---|---|---|
| **Redis** | `redis:alpine` (latest) | Docker image — always pulls latest stable |
| **Celery** | latest stable (≥ 5.5) | Installed via `celery[redis]` |
| **FastAPI** | latest stable (≥ 0.115) | With `uvicorn[standard]` for the server |
| **React** | latest stable (≥ 19) | Scafolded with Vite + TypeScript |

## Directory Structure

```
celery-demo/
├── docker-compose.yml         # Orchestrates all services
├── Dockerfile.worker           # Celery worker image
├── Dockerfile.backend          # FastAPI backend image
├── backend/
│   ├── requirements.txt        # Python deps for both worker + backend
│   ├── main.py                 # FastAPI application
│   ├── celery_app.py           # Celery app + task definitions
│   └── Dockerfile              # (no — Dockerfiles live at root level)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       └── App.css
└── demo.py                     # Host-side CLI script (optional, uv run)
```

## Tasks

### `crunch_data(duration: int | None = None) -> dict`

A Celery task that:

1. If `duration` is `None`, picks a random duration between 5–10 seconds (mirroring the existing `asyncio_demo.py`)
2. Prints a start message with the duration
3. Sleeps for that many seconds
4. Returns a dict: `{"duration": <seconds slept>, "status": "complete"}`

### `process_result(result: dict) -> dict`

A second Celery task designed to be chained after `crunch_data`:

1. Receives the dict output from `crunch_data`
2. Prints a message showing the received result
3. Transforms it: adds a `"processed_by"` key with the current timestamp
4. Returns the enriched dict

## Broker & Result Backend

- **Broker**: `redis://redis:6379/0` (inside Docker network) / `redis://localhost:6379/0` (host)
- **Result backend**: same URLs
- Configurable via environment variables (`CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`)
- Default in code: `redis://localhost:6379/0`
- Docker Compose overrides to `redis://redis:6379/0` for containers via env vars

## Celery App

- Defined in `backend/celery_app.py` — the worker imports from here (`-A backend.celery_app`)
- Broker connection settings use environment variables with localhost defaults

## Services (Docker Compose)

| Service | Image / Build | Purpose |
|---|---|---|
| `redis` | `redis:alpine` | Message broker + result backend |
| `worker` | Build from `Dockerfile.worker` | Celery worker running both tasks |
| `backend` | Build from `Dockerfile.backend` | FastAPI server serving task endpoints |
| `frontend` | Build from `frontend/` | React SPA with task-spawning buttons |

### Port mappings

| Service | Host port | Container port |
|---|---|---|
| `redis` | `6379` | `6379` |
| `backend` | `8000` | `8000` |
| `frontend` | `5173` | `5173` (Vite dev server) |

### Worker container (`Dockerfile.worker`)

- Installs Python deps from `backend/requirements.txt`
- Copies `backend/` into the image
- Working directory: `/app`
- Command: `celery -A backend.celery_app worker --loglevel=info`
- Environment: `CELERY_BROKER_URL=redis://redis:6379/0`, `CELERY_RESULT_BACKEND=redis://redis:6379/0`
- Depends on `redis`

### Backend container (`Dockerfile.backend`)

- Installs Python deps from `backend/requirements.txt`
- Copies `backend/` into the image
- Working directory: `/app`
- Command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
- Environment: `CELERY_BROKER_URL=redis://redis:6379/0`, `CELERY_RESULT_BACKEND=redis://redis:6379/0`
- Depends on `redis`

### Frontend container

- Node-based image
- Installs npm deps from `package.json`
- Vite dev server with `--host` flag for container access
- Depends on `backend`

### Redis container

- Standard `redis:alpine`, port `6379:6379` mapped to host

## Backend API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tasks/crunch` | Dispatches a `crunch_data` task; accepts optional `duration` body. Returns `task_id`. |
| `POST` | `/api/tasks/chain` | Dispatches the chain `crunch_data | process_result`; accepts optional `duration` body. Returns `task_id`. |
| `GET` | `/api/tasks/{task_id}` | Returns the task status and result (if ready). |

## Frontend

- Minimal React SPA with a **"Crunch"** button and a **"Chain"** button
- Each button calls the respective backend API endpoint
- Shows real-time status: "pending", "processing", "complete"
- Displays the final result when done

## Dependencies

### `backend/requirements.txt`

```
celery[redis]>=5.5
fastapi>=0.115
uvicorn[standard]
```

### `frontend/package.json` (via Vite + React + TypeScript)

- `react@latest`
- `react-dom@latest`
- `typescript`
- `vite`
- `@vitejs/plugin-react`

## How to run

Single-command workflow:

```
docker compose -f celery-demo/docker-compose.yml up --build
```

Then open `http://localhost:5173` in the browser.

## Behaviour

1. User clicks **"Crunch"** — frontend POSTs to `/api/tasks/crunch`, polls `/api/tasks/{task_id}` until complete, displays the result.
2. User clicks **"Chain"** — same flow but with the chained task, showing the enriched result.

## Extensions (future considerations, not part of v1)

- Flower-based monitoring
- Error handling / retries