# Product Context

Auth Demo is an example of how to build out a JWT authentication system using FastAPI
and Next.js. The primary consumers of this codebase are adult students, so write clean
and readable code with clear variable names and comments explaining any code that is
complex.

## Current Status (2026-08-12)

**Backend (implemented, `apps/backend/`)**
- FastAPI + TinyDB with a Pydantic middleware bridge
- Routes: `POST /auth/register`, `POST /auth/login`, `POST /auth/request-reset-link`, `POST /auth/reset-password`, `GET /user/{id}`, `PATCH /user/{id}`
- JWT (HS256, 30-min expiry), bcrypt password hashing
- Password reset: short-lived JWT (15min) with `purpose: "password_reset"` claim, simulated email printed to console
- See `specs/backend.md`, `specs/security.md`, and `specs/password-reset.md`

**Frontend (implemented, `apps/frontend/`)**
- Next.js 16 App Router + TypeScript strict + Tailwind CSS v4
- Pages: `/`, `/login`, `/register`, `/reset-password`, `/user_profile`
- Auth context keeps the JWT in memory only (no localStorage — no token persistence across reloads)
- React 19 `<form action={handler}>` pattern with uncontrolled inputs (`name` + `FormData`) — `FormEvent`/`onSubmit` are deprecated in React 19
- Single dark theme site-wide (no light/dark toggle)
- API paths use the `/auth/*` prefix (e.g. `/auth/login`, `/auth/register`, `/auth/request-reset-link`)
- Login page has "Forgot your password?" link → `/reset-password` and shows a success banner on `?reset=success`
- Reset-password page has two states: email form (no token) and password reset form (token in URL)
- Password reset uses `useSearchParams()` to read the `token` query param, wrapped in `<Suspense>` per Next.js 16 requirement
- See `specs/minimal-auth-frontend.md` for the canonical frontend spec
