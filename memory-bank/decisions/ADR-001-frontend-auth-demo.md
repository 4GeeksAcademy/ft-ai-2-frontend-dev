# ADR-001: Frontend Auth Demo Implementation

**Date:** 2026-08-11

## Context

The auth demo project needed a frontend. The backend (FastAPI + TinyDB + JWT auth)
was already implemented. The frontend spec (`specs/minimal-auth-frontend.md`) defined
the requirements: a Next.js app with login, register, and profile pages.

## Decision

### Framework & Tooling

- **Next.js 16 (App Router)** with TypeScript strict mode
- **Tailwind CSS v4** for styling
- **pnpm** for package management (monorepo-wide standard)
- **Turborepo** for task orchestration (dev, build, lint)

### Authentication

- JWT stored **in React context only** (no localStorage, no sessionStorage) —
  token is lost on page reload, per spec requirement
- Auth context exposes `{ user, token, isAuthenticated, login, logout, setUser }`
- `setUser()` added to sync the context after profile edits (so the navbar and
  homepage reflect the new display name immediately)

### Form Pattern

- React 19 deprecated `FormEvent` — all forms use `<form action={async handler}>`
  with `FormData` and `name` attributes on inputs
- Uncontrolled inputs: no `value`/`onChange`/`useState` for form fields
- Edit forms use `defaultValue` to pre-populate from user data

### API Client

- Generic `apiClient<T>(path, options)` wrapper around `fetch`
- Prepends `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
- Injects `Authorization: Bearer <token>` for authenticated requests
- Throws structured `ApiError` on non-2xx responses
- API paths use the backend's `/auth/*` prefix (e.g. `/auth/login`, `/auth/register`)

### Redirect Pattern

- `router.replace()` moved to `useEffect` for authenticated-user redirects on
  login/register pages — calling it during render triggers a React 19 warning

### Styling

- Single dark theme: `bg-zinc-950` body, `bg-zinc-900` cards, `bg-zinc-800` inputs,
  light text (`text-zinc-100`/`text-zinc-300`/`text-zinc-400`)
- No light/dark mode toggle — `dark:` variants were removed entirely

### Navigation

- `Navbar` component in root layout shows brand link, auth-appropriate links
  (login/register for guests, profile link + logout for authenticated users)

## Consequences

- Students see a clean, modern auth demo with both frontend and backend
- Token-less refresh means the UX is intentionally "session-only" — refreshing
  the page logs the user out
- The `setUser()` approach keeps the context in sync without a full re-fetch
- The dark-only theme simplifies the CSS but means no light mode option
- All form pages are static-generated (no server-side rendering for auth routes)