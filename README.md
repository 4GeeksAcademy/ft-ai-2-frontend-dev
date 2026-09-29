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

## Running The RTC Chat Demo

This project has two parts: a **Python backend** (FastAPI) and a **React frontend** (Vite).

### Backend

```bash
cd rtc_backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

- `/frankenstein` — GET endpoint that streams the Frankenstein novel line-by-line
- `/pingpong` — WebSocket for a simple ping/pong test
- `/chat/ws` — WebSocket chat endpoint (broadcasts JSON with `username` and `message` to all connected clients)

### Frontend

```bash
cd rtc_frontend
npm run dev
```

The dev server will start at `http://localhost:5173`. By default it proxies WebSocket connections to `http://localhost:8000`.

To point the frontend at a different backend URL, create a `.env` file in `rtc_frontend/`:

```
BACKEND_URL=https://your-deployed-backend.example.com
```

### Chat Walkthrough

1. Start the **backend** and **frontend** (in two terminals).
2. Open `http://localhost:5173` in your browser.
3. Pick a username and click **Join Chat**.
4. Open a second tab at the same URL with a different username to see real-time messaging.
