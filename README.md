# ft-ai-2-frontend-dev

<!-- TOC:START -->

## Module Demonstrations

Each demonstration lives on its own branch:

- Agent Loop: [module/agent-loop](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/agent-loop)
- Helping LLMs Understand APIs: [module/agents_and_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/agents_and_apis)
- API Concepts Review: [module/api_review](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/api_review)
- Authentication Demo: [module/auth-demo](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/auth-demo)
- Defining Backend Architecture: [module/backend_arch](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/backend_arch)
- Building An Application: [module/book_app](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/book_app)
- Data Pipelines: [module/data-pipelines](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/data-pipelines)
- TinyDB Example: [module/db-basics](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/db-basics)
- Designing Routes: [module/designing_routes](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/designing_routes)
- Docker: [module/docker](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/docker)
- File I/O: [module/file-io](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io)
- File I/O Example: [module/file-io-example](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io-example)
- Full Stack Demo: [module/full-stack-demo](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/full-stack-demo)
- Full Stack (Enhanced): [module/full-stack-enhanced](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/full-stack-enhanced)
- MCP: [module/mcp](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/mcp)
- Multi-Agent Systems: [module/multi-agent-systems](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/multi-agent-systems)
- Observability: [module/observability](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/observability)
- Offloading Tasks: [module/offloading-tasks](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/offloading-tasks)
- Python: [module/python](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/python)
- Queues: [module/queues](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/queues)
- Relational DB: [module/relational-db](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/relational-db)
- Making `fetch` requests: [module/restful_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/restful_apis)
- RTC: [module/rtc](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/rtc)
- Server VS Client Components: [module/server_client_divide](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/server_client_divide)
- Single Page Apps: [module/spa](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/spa)
- Providing Visual Specs To The AI: [module/specs-pt-1](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/specs-pt-1)
- Structure: [module/structure](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/structure)
- Testing: [module/testing](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/testing)
<!-- TOC:END -->

## Current Branch — `module/designing_routes`

This branch implements the **Scratching Post API**, a social media platform for pets to post on. Built with FastAPI, it provides CRUD endpoints for posts and user registration.

### Project Structure

```
├── main.py                          # FastAPI app entry point
├── memory-bank/                     # Specs and architectural docs
│   ├── specs/
│   │   ├── post-endpoints.md
│   │   └── user-endpoint.md
│   └── archictural-proposal.md
└── src/scratching_post_api/
    ├── models/                      # Pydantic data models
    │   ├── post.py                  #   PostBase, PostCreate, PostRead, PostUpdate
    │   ├── user.py                  #   User, UserCreate
    │   ├── media.py                 #   MediaItem (stub)
    │   └── request_models.py        #   PaginationReq
    ├── repositories/                # In-memory data layer (repository pattern)
    │   ├── post_repository.py
    │   ├── user_repository.py
    │   └── registry.py              # Shared repo instances
    └── routers/                     # API route handlers
        ├── post_router.py
        └── user_router.py
```

### API Endpoints

| Method | Route              | Description                        |
|--------|--------------------|------------------------------------|
| `GET`  | `/post/{id}`       | Read a single post                 |
| `GET`  | `/post`            | Batch read posts (paginated)       |
| `POST` | `/post`            | Create a new post                  |
| `PATCH`| `/post?post_id=`   | Update a post                      |
| `DELETE`| `/post/{id}`      | Delete a post                      |
| `GET`  | `/user/{id}`       | Read a single user with their posts|
| `POST` | `/register`        | Register a new user                |
| `GET`  | `/scalar`          | Interactive API docs (Scalar)      |

### Key Design Decisions

- **Repository pattern** — In-memory data storage is abstracted behind repository classes, making it easy to swap in a real database later.
- **Shared registry** — A `registry.py` module provides singleton repository instances so that post and user operations stay coordinated (e.g., creating a post automatically updates the author's `posts` list).
- **Pydantic models** — Request/response models are split into `PostCreate`, `PostRead`, `PostUpdate`, etc., following the spec's `f(input) -> output` documentation style.

### Running the Project

**Prerequisites:** [uv](https://docs.astral.sh/uv/) installed.

```bash
# Install dependencies
uv sync

# Activate the virtual environment
source .venv/bin/activate

# Start the dev server (with hot-reload)
uv run fastapi dev

# Or directly with uvicorn
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

Open the interactive API docs at [http://localhost:8000/scalar](http://localhost:8000/scalar).

