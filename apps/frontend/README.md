# Auth Demo — Frontend

A minimal authentication example built with [Next.js](https://nextjs.org) (App Router) and TypeScript.

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 — the monorepo uses pnpm; install with `npm install -g pnpm`
- The **backend** must be running on port 8000 (see `apps/backend/README.md`)

## Environment Variables

Create a `.env.local` file in this directory (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL of the FastAPI backend |

## Getting Started

From the **repository root** (recommended):

```bash
pnpm --filter frontend dev
```

Or from this directory:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Available scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server on port 3000 |
| `pnpm build` | Create an optimized production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── globals.css           # Global styles (Tailwind imports)
│   ├── layout.tsx            # Root layout with AuthProvider
│   ├── page.tsx              # Homepage — "Hello {user}!" or "Hello world"
│   ├── providers.tsx         # Client-side providers wrapper
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Registration page
│   └── user_profile/page.tsx # Profile view/edit page (requires auth)
└── lib/
    ├── api.ts                # API client (fetch wrapper)
    └── auth.tsx              # Auth context (in-memory JWT, login/logout)
```

## Auth Flow

1. User registers at `/register` — POSTs to `POST /api/register`
2. User logs in at `/login` — POSTs to `POST /api/login`, receives a JWT
3. JWT is stored **in memory only** (React context, not localStorage)
4. Protected routes check auth state; unauthenticated users are redirected to `/login`
5. On logout, the in-memory token is discarded

## Pages

| Route | Auth Required | Description |
|-------|---------------|-------------|
| `/` | No | Homepage — shows greeting based on auth state |
| `/login` | No | Login form — redirects to `/user_profile` if already logged in |
| `/register` | No | Registration form — redirects to `/login` on success |
| `/user_profile` | Yes | View and edit profile — redirects to `/login` if not authenticated |

## Not Included

- Token refresh flow
- Email verification
- Password reset
- OAuth / social login
- Token persistence across page reloads
