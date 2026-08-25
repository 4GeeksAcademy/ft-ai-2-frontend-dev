# Brevity.app — MVP Scope

## Goal

A working, deployable three-service microblogging app where users can post
single words, follow each other, and like posts — instrumented with
observability telemetry (logs, metrics, traces) from the start.

## Constraint: 3–4 Live Coding Sessions

| Session | Focus | Deliverables |
|---------|-------|-------------|
| **1** | Backend Foundation | Docker Compose scaffold, PostgreSQL + SQLModel models, JWT auth endpoints, core CRUD API (posts, users), analytics service skeleton with WebSocket support |
| **2** | Frontend Core | Next.js 16 project, auth pages (login/register), post creation, timeline feed, Tailwind CSS dark theme |
| **3** | Social + Analytics | Following/follower system, like/unlike posts, analytics event emission (page views, likes, follows), WebSocket live feed |
| **4** | Observability & Polish | Distributed tracing (OpenTelemetry), structured logging, health/metrics endpoints, README, demo polish |

## In Scope (MVP)

### User Management
- Register with email + password
- Login (JWT-based, 30-min expiry)
- Simple profile: display name, bio, avatar (Gravatar)

### Posting
- Create a post: exactly one word (letters + numbers only, max 200 chars)
- Tag a user: `@username` as the sole content of the post (no other text allowed)
- View a user's post history
- Timeline feed: recent posts from followed users (reverse chronological)

### Social
- Follow / unfollow another user
- Like / unlike a post
- Basic follower/following counts on profiles

### Analytics
- Track page views, post creations, likes, follows as events
- WebSocket endpoint for live event stream
- Simple REST endpoint for event ingestion

### Observability
- Structured JSON logging (all services)
- Health check endpoints (`GET /health`)
- Basic request metrics (count, duration, status codes)
- OpenTelemetry distributed tracing across services

### Frontend (Next.js 16)
- Dark theme (zinc palette, matching conventions from previous modules)
- Auth pages (login, register)
- Feed page (posts from followed users)
- User profile page
- Create post form
- Like / follow buttons
- React 19 `<form action>` pattern, uncontrolled inputs

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

## Technical Decisions (for ADRs)

1. **Monorepo vs separate repos:** Docker Compose with separate directories at
   repo root (no Turborepo — these are independent services, not a shared
   codebase needing orchestration)
2. **Post model constraint:** Single word enforced at the API layer (Pydantic
   validator) — the database stores the raw string
3. **Analytics storage:** TinyDB (JSON file) — keeps it lightweight and
   consistent with the relational-db module's TinyDB example
4. **Observability library:** OpenTelemetry Python SDK for the API services,
   OpenTelemetry JS SDK for the frontend (if feasible in Next.js)

## Success Criteria

- A user can register, log in, post a word, follow another user, and see their
  feed
- Likes work and are reflected in real time
- Analytics events are visible via the WebSocket stream
- Each service has a `/health` endpoint
- Structured logs are emitted by all services
- The app runs in a single `docker compose up` command