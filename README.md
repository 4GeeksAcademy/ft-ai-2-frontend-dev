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
