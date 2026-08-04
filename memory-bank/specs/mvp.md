# Simple Agent Loop — MVP Specification

## 1. Product Overview

A terminal-based chatbot that gives users a scrollable, interactive chat interface powered by an LLM (via LiteLLM).

### Core Identity

- **What it is**: A lightweight, terminal-native conversational agent.
- **What it is not**: A web app, a framework, or a production LLM gateway.
- **Target user**: A developer who wants a quick, scriptable chat interface in their terminal.

---

## 2. MVP Goals (v0.1)

| Goal | Description |
|------|-------------|
| **G1** | User can type a message and receive an LLM-generated reply in the terminal. |
| **G2** | Chat history is scrollable so the user can review past messages. |
| **G3** | Provider/model can be configured via `LITELLM_*` environment variables without code changes. |
| **G4** | The app starts and exits cleanly. |

### Explicitly Out of Scope (v0.1)

- Multi-turn conversation context (sending full history to the LLM) — deferred to v0.2.
- Streaming responses — plain request/response is fine for MVP.
- Markdown rendering — raw text output is acceptable.
- Image or file uploads.
- Plugins or tool calling.
- Persistent chat history (saving to disk).

---

## 3. Architecture

```
┌──────────────────────────────────────────────┐
│                agent_loop/                    │
│                                              │
│  ┌─────────────┐      ┌──────────────────┐   │
│  │   main.py    │─────▶│   chat.py        │   │
│  │  (entrypoint)│      │  (chat loop)     │   │
│  └─────────────┘      └───────┬──────────┘   │
│                               │               │
│  ┌─────────────┐      ┌───────▼──────────┐   │
│  │  config.py   │◀────▶│   llm.py         │   │
│  │  (settings)  │      │  (LiteLLM call)  │   │
│  └─────────────┘      └──────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  ui.py                                │    │
│  │  (tcod terminal + scrollable history) │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### Module Responsibilities

| Module | File | Responsibility |
|--------|------|---------------|
| Entrypoint | `agent_loop/__init__.py` | CLI entrypoint (`agent-loop` command), orchestrates startup. |
| Config | `agent_loop/config.py` | Load and validate settings from environment variables / `.env`. |
| LLM | `agent_loop/llm.py` | Single function: send a message to LiteLLM, return the response text. |
| UI | `agent_loop/ui.py` | tcod-based terminal window with scrollable message display and text input. |
| Chat | `agent_loop/chat.py` | Main loop: read input → call LLM → display result. |

### Data Flow

```
User input (keyboard)
    │
    ▼
  ui.py (captures typed message, displays in history)
    │
    ▼
  chat.py (receives the message string)
    │
    ▼
  llm.py (sends to LiteLLM, gets response)
    │
    ▼
  chat.py (receives response string)
    │
    ▼
  ui.py (appends response to scrollable history, renders)
```

---

## 4. Functional Requirements

### FR1 — Configuration

```
Given the application is not yet running
 When the user starts `agent-loop`
 Then the app reads these environment variables (or .env file):
   - LITELLM_API_KEY   (required)
   - LITELLM_MODEL     (optional, default: "litellm/downtown-miami/openrouter/deepseek/deepseek-v4-flash")
   - LITELLM_BASE_URL  (optional, default: "https://llm.4geeks.ai/v1")
 And the app exits with a clear error message if LITELLM_API_KEY is missing.
```

### FR2 — Chat Input

```
Given the application is running
 When the user types a message and presses Enter
 Then the typed message appears in the chat history.
 And a loading indicator is shown while the LLM responds.
```

### FR3 — LLM Response

```
Given the user has sent a message
 When the LLM responds
 Then the response text is appended to the chat history.
 And the user can immediately type the next message.
```

### FR4 — Scrollable History

```
Given the chat history contains more messages than fit on screen
 When the user presses ↑/↓ or scrolls with the mouse
 Then the view scrolls through the message history.
```

### FR5 — Clean Exit

```
Given the application is running
 When the user presses Ctrl+C or types /exit
 Then the application exits gracefully (terminal restored to normal state).
```

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR1 | Startup time | < 2 seconds from command to ready for input. |
| NFR2 | Memory usage | < 100 MB RSS under normal use. |
| NFR3 | LLM timeout | Requests to LiteLLM time out after 60 seconds. |
| NFR4 | Error resilience | A single LLM error (network, auth, timeout) does not crash the app — shows an error message in history and continues. |

---

## 6. User Interface Specification

### Layout

```
┌──────────────────────────────────────────────┐
│  Simple Agent Loop                  Ctrl+Q   │  ← Header bar
├──────────────────────────────────────────────┤
│                                              │
│  You:  What is the capital of France?        │
│                                              │
│  Agent: The capital of France is Paris.      │
│                                              │
│  ...(more history, scrollable)...            │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│ > _                                           │  ← Input bar
└──────────────────────────────────────────────┘
```

- **Header bar**: shows app name and a quit hint.
- **Chat area**: scrollable message list. Each message prefixed with `You:` or `Agent:`.
- **Input bar**: a single-line text input at the bottom. Prefix with `> `.
- **Colors**: distinguish user vs. agent messages via color. Use a dark terminal theme.

### Keyboard Controls

| Key | Action |
|-----|--------|
| Type + Enter | Send message |
| ↑ / ↓ | Scroll chat history |
| PgUp / PgDn | Scroll chat history by page |
| Ctrl+C | Exit |
| /exit + Enter | Exit |

---

## 7. Phased Build Plan

### Phase 1 — Scaffold (Day 1) ✅

- [x] Add dependencies (`python-tcod`, `litellm`, `python-dotenv`) to `pyproject.toml`.
- [x] Create module files: `config.py`, `llm.py`, `ui.py`, `chat.py`.
- [x] Ensure `agent-loop` CLI command is wired up.

### Phase 2 — Config & LLM (Day 1) ✅

- [x] `config.py`: load env vars, validate `LITELLM_API_KEY`, provide typed config object.
- [x] `llm.py`: implement `ask_llm(prompt: str, config: Config) -> str` using LiteLLM.
- [ ] Unit tests for config validation and LLM call (with mocked LiteLLM).

### Phase 3 — Terminal UI (Day 2) ✅

- [x] `ui.py`: tcod window with header, scrollable message area, text input.
- [x] Wire scrolling (↑/↓, PgUp/PgDn).
- [x] Wire sending on Enter.

### Phase 4 — Chat Loop (Day 2) ✅

- [x] `chat.py`: integrate UI + LLM into a run loop.
- [x] `__init__.py`: wire everything together in `main()`.
- [x] Handle Ctrl+C and `/exit`.
- [x] Handle LLM errors gracefully (show in history, don't crash).

### Phase 5 — Polish (Day 3)

- [ ] Color-differentiated messages (implemented).
- [ ] Loading indicator while waiting for LLM (implemented).
- [ ] Clean terminal restore on exit.
- [ ] Update `README.md` with usage instructions.

---

## 8. Acceptance Checklist

Use this checklist to verify the MVP is complete.

- [ ] `agent-loop` starts from the command line with no errors.
- [ ] App exits with a clear message when `LITELLM_API_KEY` is missing.
- [ ] User can type a message and press Enter to send.
- [ ] User's message appears in the scrollable history.
- [ ] Agent's response appears in the scrollable history.
- [ ] Messages are color-differentiated (user vs agent).
- [ ] ↑/↓ and PgUp/PgDn scroll the history.
- [ ] Ctrl+C and `/exit` exit gracefully.
- [ ] Terminal is restored to normal state on exit.
- [ ] An LLM error (e.g., bad API key) shows an error message and does not crash.
- [ ] The app can be configured with `LITELLM_MODEL` and `LITELLM_BASE_URL`.
- [ ] `autopep8` formatting passes.
- [ ] `pyright` strict mode passes (or documented exceptions exist).

---

## 9. Future Considerations (Post-MVP)

These are explicitly deferred but should influence architectural decisions (e.g., module boundaries) so they are easy to add later:

| Feature | Notes |
|---------|-------|
| Multi-turn context | Send message history to LLM for coherent conversations. |
| Streaming responses | Real-time token-by-token display. |
| Chat history persistence | Save/load conversations from disk. |
| Multiple concurrent chats | Tabbed or split-view sessions. |
| Markdown rendering | Render bold, code blocks, etc., in-terminal. |
| Tool / function calling | Let the agent invoke Python functions. |
| Config profiles | Switch between model presets at runtime. |