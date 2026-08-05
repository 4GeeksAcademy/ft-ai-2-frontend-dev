# ft-ai-2-frontend-dev

Python experiments and agent-building exercises.

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

## Agent Loop

This branch (`module/agent-loop`) contains a terminal-based chatbot — the **Simple Agent Loop** — built with Python, [tcod](https://python-tcod.readthedocs.io/) for the terminal UI, and [LiteLLM](https://litellm.vercel.app/) for LLM access.

### Quick Start

```bash
# Install dependencies
uv sync

# Configure your LLM (copy and fill in)
cp .env.example .env

# Run the chatbot
uv run agent-loop
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LITELLM_API_KEY` | Yes | — | API key for the LLM provider |
| `LITELLM_MODEL` | No | `litellm/downtown-miami/openrouter/deepseek/deepseek-v4-flash` | Model identifier |
| `LITELLM_BASE_URL` | No | `https://llm.4geeks.ai/v1` | API base URL |

### Project Structure

```
src/agent_loop/
├── __init__.py   # Entrypoint — wires everything together
├── config.py     # Environment / .env config loading
├── llm.py        # LiteLLM integration
├── ui.py         # tcod terminal UI (scrollable chat, text input)
└── chat.py       # Chat loop — ties UI to LLM
```

### Controls

| Key | Action |
|-----|--------|
| Type + Enter | Send message |
| ↑ / ↓ | Scroll chat history |
| PgUp / PgDn | Scroll by page |
| Ctrl+C | Exit |
| `/exit` + Enter | Exit |

### How This Page Works

For all other branches, the page renders a live Markdown-to-HTML preview served from the `docs/` folder using htmx and marked.js:

