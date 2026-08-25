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

See [memory-bank/product-context.md](./memory-bank/product-context.md) and
[memory-bank/specs/mvp-scope.md](./memory-bank/specs/mvp-scope.md).

### Session 0 status

Scaffold only: Compose mesh, health stubs, placeholder UI. Domain features
start in Session 1.

### Tech Stack

| Service | Stack |
|---------|--------|
| **brevity** | Next.js 16, React 19, Tailwind CSS 4, pnpm |
| **brevity-api** | FastAPI, uv (SQLModel/Postgres in Session 1) |
| **brevity-analytics** | FastAPI, TinyDB, uv |
| **postgres** | postgres:16-alpine |

### Running Locally

1. Copy env defaults: `cp .env.example .env` (optional for Compose; values are
   also set in `docker-compose.yml`).
2. Start everything:
   ```bash
   docker compose up --build
   ```
3. Open:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API health: [http://localhost:8000/health](http://localhost:8000/health)
   - Analytics health: [http://localhost:8001/health](http://localhost:8001/health)

Browser clients must use `localhost` URLs (`NEXT_PUBLIC_*`). Container-to-container
calls use Compose DNS (`API_URL`, `ANALYTICS_URL`) — see ADR-0008.
