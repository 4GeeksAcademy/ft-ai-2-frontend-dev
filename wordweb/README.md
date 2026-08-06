# Wordweb

Concept mapping application for instructors to build maps of vocabulary and concepts for students to explore.

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **Python** >= 3.11
- **uv** — [install guide](https://docs.astral.sh/uv/getting-started/installation/)

## Getting Started

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
uv sync --project apps/backend

# Start both frontend and backend in development mode
npm run dev
```

The development servers start on:

| Service | URL |
|---------|-----|
| Frontend (NextJS) | http://localhost:3000 |
| Backend API (FastAPI) | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |

## Project Structure

```
wordweb/
├── apps/
│   ├── frontend/            # NextJS 14+ (App Router) — TypeScript, Tailwind CSS
│   │   ├── src/
│   │   │   ├── app/         # Pages (RSC + client components)
│   │   │   ├── components/  # UI components by feature
│   │   │   ├── lib/         # API client, shared types
│   │   │   └── hooks/       # Custom React hooks
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── backend/             # FastAPI — Python, Pydantic, TinyDB
│       ├── app/
│       │   ├── main.py      # App entry + CORS config
│       │   ├── routers/     # REST endpoints
│       │   ├── models/      # Pydantic models
│       │   ├── services/    # Business logic
│       │   ├── database.py  # TinyDB setup
│       │   └── serializers.py
│       ├── data/
│       │   └── db.json      # TinyDB data file
│       └── pyproject.toml   # uv project config
│
├── package.json             # Root workspace config (Turborepo)
├── turbo.json               # Turborepo pipeline
└── memory-bank/             # Project documentation and specs
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | NextJS 14+ (App Router) |
| Language (frontend) | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Graph visualization | reagraph (force-directed with clustering) |
| Fuzzy search | fuse.js |
| Backend framework | FastAPI |
| Language (backend) | Python 3.11+ |
| Data storage | TinyDB (JSON document store) |
| Serialization | Pydantic |
| Package management (JS) | npm workspaces + Turborepo |
| Package management (Python) | uv |

## Scripts

All commands run from the `wordweb/` root directory via Turborepo:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend in dev mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps |
| `npm run typecheck` | TypeScript type checking |
| `npm run clean` | Remove build artifacts |
| `npm run format` | Format code with Prettier |

Backend-specific commands (run from `apps/backend/`):

| Command | Description |
|---------|-------------|
| `uv sync` | Install/update Python dependencies |
| `uv add <package>` | Add a new Python dependency |
| `uv run uvicorn app.main:app --reload` | Start backend directly |

## Documentation

Full project specs and safety rules live in [memory-bank/](../memory-bank/):

- [MVP Overview](../memory-bank/specs/mvp-overview.md) — scope, user stories, anti-goals
- [Architecture](../memory-bank/specs/architecture.md) — system diagram, endpoints, data flows
- [Frontend Spec](../memory-bank/specs/frontend.md) — pages, components, states
- [Backend Spec](../memory-bank/specs/backend.md) — endpoints, models, services
- [Data Model](../memory-bank/specs/data-model.md) — Pydantic models, TinyDB shapes, TypeScript types
