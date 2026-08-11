# Product Context

Auth Demo is an example of how to build out a JWT authentication system using FastAPI
and Next.js. The primary consumers of this codebase are adult students, so write clean
and readable code with clear variable names and comments explaining any code that is
complex.

## Current Status (2026-08-11)

**Backend (implemented, `apps/backend/`)**
- FastAPI + TinyDB with a Pydantic middleware bridge
- Routes: `POST /auth/register`, `POST /auth/login`, `GET /user/{id}`, `PATCH /user/{id}`
- JWT (HS256, 30-min expiry), bcrypt password hashing
- See `specs/backend.md` and `specs/security.md`

**Frontend (implemented this phase, `apps/frontend/`)**
- Next.js 16 App Router + TypeScript strict + Tailwind CSS v4
- Pages: `/`, `/login`, `/register`, `/user_profile`
- Auth context keeps the JWT in memory only (no localStorage — no token persistence across reloads)
- React 19 `<form action={handler}>` pattern with uncontrolled inputs (`name` + `FormData`) — `FormEvent`/`onSubmit` are deprecated in React 19
- Single dark theme site-wide (no light/dark toggle)
- API paths use the `/auth/*` prefix (e.g. `/auth/login`, `/auth/register`)
- See `specs/minimal-auth-frontend.md` for the canonical frontend spec
