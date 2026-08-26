# Brevity.app — MVP Scope

## Goal

A working, deployable three-service microblogging app where users can post
single words, follow each other, and like posts — instrumented with
observability telemetry (logs, metrics, traces) from the start.

## Session plan: Session 0 (prep) + 3–4 live sessions

**Session 0** is instructor/pre-class work: get non-observability scaffolding out
of the way so live sessions teach product behavior and telemetry — not
`create-next-app` and Compose YAML. Sessions **1–4** are the classroom track.
Lightweight instrumentation (structured logs, `/health`, request timing,
`traceparent` on API → analytics) still lands during live sessions; the
collector/viewer and polish land in Session 4.

| Session | When | Focus | Deliverables |
|---------|------|-------|-------------|
| **0** | Pre-class | Bootstrap | Repo layout, Docker Compose (Postgres + three app service shells), `.env.example`, scaffold `brevity` (Next.js 16 via CLI), `brevity-api` / `brevity-analytics` (`uv` + FastAPI stubs), Dockerfiles, empty routers / placeholder pages, CORS + localhost vs Compose URL wiring documented, seed script stub. **No** domain features, **no** OTel collector/Jaeger. Optional: bare `GET /health` stubs so `compose up` proves the mesh. |
| **1** | Live | Backend foundation | SQLModel models + Alembic, JWT auth, core CRUD (posts, users), analytics REST + WebSocket skeleton with real event store wiring, structured JSON logging + real `/health` (API checks DB) |
| **2** | Live | Frontend core | Auth pages (login/register), post creation, timeline feed, dark zinc theme, wire seed/demo users for a non-empty first feed |
| **3** | Live | Social + analytics | Follow/unfollow, like/unlike (optimistic UI + refetch), analytics event emission from API/client, live **analytics** WS stream, propagate `traceparent` on API → analytics |
| **4** | Live | Observability & polish | OTel Collector + Jaeger (or equivalent) in Compose, **batched** OTLP export (BatchSpanProcessor / periodic metrics), distributed tracing demo, metrics endpoints, README, demo runbook polish |

### Session 0 — definition of done

Use the [cli-project-bootstrapping](../skills/cli-project-bootstrapping/SKILL.md)
skill where applicable. When Session 0 is complete:

- [x] `docker compose up` starts Postgres + three app containers (even if apps
      only serve stubs)
- [x] `.env.example` documents `NEXT_PUBLIC_*` (localhost) vs server `API_URL` /
      `ANALYTICS_URL` (Compose DNS)
- [x] `brevity/` exists from `pnpm create next-app` (App Router, TS, Tailwind)
- [x] `brevity-api/` and `brevity-analytics/` exist as `uv` FastAPI projects with
      Dockerfiles and placeholder `GET /health`
- [x] Directory layout matches [architecture.md](./architecture.md)
- [x] No SQLModel domain models, auth, social features, or Jaeger yet

### Session 1 — definition of done

When Session 1 is complete:

- [x] SQLModel models for User, Post, Like, Follow + Alembic migration applied on API startup
- [x] JWT auth (`POST /auth/register`, `POST /auth/login`, 30-min expiry)
- [x] Users + posts CRUD (including timeline with follows/mentions/own posts)
- [x] Social routes (follow/like) available for later sessions
- [x] Analytics TinyDB event store + `POST /analytics/event`, `GET /analytics/events`, `WS /analytics/ws`
- [x] Structured JSON logging on API and analytics; API `/health` checks Postgres

### Session 2 — definition of done

When Session 2 is complete:

- [x] Auth pages (login/register) with React 19 `<form action>` + JWT in memory
- [x] Timeline feed + create-post form wired to the API
- [x] Dark zinc theme
- [x] Basic profile page
- [x] Seed script creates demo users/posts/follow for a non-empty first feed

### Session 3 — definition of done

When Session 3 is complete:

- [x] Like / follow buttons with optimistic UI + parent state patch
- [x] API emits analytics events (post/like/follow) via background tasks
- [x] Client emits `page_view` events
- [x] Live analytics WebSocket viewer at `/analytics`
- [x] API → analytics calls propagate W3C `traceparent`

### Session 4 — definition of done

When Session 4 is complete:

- [x] OTel Collector + Jaeger in Compose; apps export OTLP HTTP
- [x] Services use **batched** exporters (`BatchSpanProcessor`, periodic
      metric reader) — documented vs `SimpleSpanProcessor` in DEMO.md
- [x] A post-create request is visible as a distributed trace (API → analytics)
- [x] Basic request metrics at `/metrics` + collector Prometheus `:8889`
- [x] README + DEMO.md cover viewer URL and batching knobs


## In Scope (MVP)

### User Management
- Register with email + password
- Login (JWT-based, 30-min expiry)
- Simple profile: display name, bio, avatar (Gravatar)

### Posting
- Create a post: exactly one word (letters + numbers only, max 200 chars)
- Tag a user: `@username` as the sole content of the post (no other text allowed)
- View a user's post history
- Timeline feed: recent posts from followed users **and** posts that mention
  the current user (reverse chronological), plus the user's own posts

### Social
- Follow / unfollow another user
- Like / unlike a post
- Basic follower/following counts on profiles

### Demo / onboarding support
- Seed data (at least two users with posts and a follow relationship) so a
  fresh `docker compose up` is demoable without an empty timeline
- Optional: auto-follow a welcome account on register (if seed includes one)

### Analytics
- Track page views, post creations, likes, follows as events
- WebSocket endpoint for live **analytics** event stream (not a live social feed)
- Simple REST endpoint for event ingestion
- Unauthenticated event ingest is an **intentional demo tradeoff** (see ADRs)

### Observability
- Structured JSON logging (all services) — Session 1
- Health check endpoints (`GET /health`) — stubs OK in Session 0; real checks in Session 1
- Basic request metrics (count, duration, status codes)
- OpenTelemetry distributed tracing across services — Session 3–4
- **Batched telemetry export** (spans/metrics via batch processors, not
  per-span sync export) — Session 4 teaching point
- Trace/metrics **viewer** in Docker Compose — Session 4 only

### Frontend (Next.js 16)
- Dark theme (zinc palette, matching conventions from previous modules)
- Auth pages (login, register)
- Feed page (posts from followed users + mentions of self)
- User profile page
- Create post form
- Like / follow buttons (likes: optimistic UI + refetch — not WebSocket-synced)
- React 19 `<form action>` pattern, uncontrolled inputs
- JWT in React context (memory only); data fetching that needs auth is
  **client-side** — do not pretend SSR can read the token

## Out of Scope (MVP)

- Password reset flow
- Email verification
- Direct messaging
- Rich media (images, video)
- Notifications
- Moderation / reporting
- Admin dashboard
- Mobile responsiveness polish
- Pagination (beyond simple limit/offset)
- Search
- Rate limiting
- Test suite (beyond basic smoke tests)
- Live-updating social UI via WebSocket (analytics WS only)

## Technical Decisions (ADRs)

See [decisions/](../decisions/) for the full records. Summary:

1. **Layout:** Docker Compose with separate directories at repo root (no Turborepo)
2. **Post constraint:** Enforced at the API layer (Pydantic); DB stores the raw string
3. **Analytics storage:** TinyDB (JSON file)
4. **Observability:** OpenTelemetry + Compose-hosted viewer; **batched** OTLP
   export in Session 4 (see ADR-0004)
5. **Auth storage:** JWT in React memory; client-side authenticated fetches only
6. **"Real time":** Analytics WebSocket for event demo; likes/follows use optimistic UI + refetch
7. **Mentions:** Included in the mentioned user's timeline
8. **Networking:** Separate browser (`localhost`) vs container-internal service URLs + CORS

## Success Criteria

- A user can register, log in, post a word, follow another user, and see their feed
- Mentions of the current user appear in their timeline
- Likes work and update in the UI via optimistic update / refetch (not live WS sync)
- Analytics events are visible via the WebSocket stream
- Each backend service has a `/health` endpoint
- Structured logs are emitted by all services
- After Session 4: a single `POST /posts` request can be followed as a distributed
  trace in the viewer (frontend/API → analytics)
- The app runs in a single `docker compose up` command
- Seed data yields a usable demo without manual setup

## Demo Script (target)

1. `docker compose up` — all services healthy
2. Log in as seeded user A; confirm timeline shows followed user B's posts
3. Create a one-word post; confirm it appears
4. Open analytics WebSocket (or simple viewer page); create another post; see `post_created`
5. Like a post; UI updates; see `like_created` on the analytics stream
6. As user B, confirm an `@A` mention appears in A's feed (or create one live)
7. *(Session 4)* Open Jaeger (or equivalent); find the post-create trace spanning API → analytics
8. *(Session 4)* Note batched export: generate several requests, observe spans
   arrive in the viewer after the batch window (not one HTTP export per span)
