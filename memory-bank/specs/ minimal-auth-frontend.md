# Minimal Auth Frontend

A minimal example of handling JWT authentication from the frontend using Next.js.

## Tech Stack

- **Next.js 16** (App Router, TypeScript strict mode)
- **Tailwind CSS v4** for styling
- **React 19** — uses `<form action={handler}>` with `FormData` (not deprecated `FormEvent`/`onSubmit`)
- **fetch** for API calls (via `apiClient` wrapper)

## Auth Flow

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────┐
│  Next.js App    │       │  FastAPI Backend │       │  TinyDB  │
│  (App Router)   │ ◄────►│  (REST API)      │ ◄────►│  (JSON)  │
└─────────────────┘       └──────────────────┘       └──────────┘
        │                       │
        │  Store JWT            │  JWT signed with
        │  in memory only       │  HS256
        │  (no localStorage)    │
```

## App Routes

- `/` — Homepage. "Hello {display_name}!" if authenticated, "Hello world" otherwise.
- `/login` — Login form. Redirects to `/user_profile` if already authenticated.
- `/register` — Registration form. Redirects to `/login` on success, or to `/user_profile` if already authenticated.
- `/user_profile` — User profile view/edit. Redirects to `/login` if not authenticated.

### Homepage

Heading displays "Hello {display_name}!" if authenticated, "Hello world" otherwise.
Shows contextual buttons: "View Profile" + "Log out" (authenticated) or "Log in" + "Register" (guest).

### Login

**Fields:** email, password

POST to `/auth/login`. On success, stores JWT in memory and redirects to `/user_profile`.
Shows error message with `role="alert"` on failure.

### Register

**Fields:** display name, email, password (8–128 chars)

POST to `/auth/register`. On success, redirects to `/login` (no auto-login).
Shows error message on failure.

### User Profile

Displays Gravatar avatar, display name, and email. "Edit Profile" button toggles
edit mode with fields for display name and Gravatar URL. PATCH to `/user/{id}` on save.
On save, updates both local state and auth context (so navbar/homepage reflect the change).

## Implementation Details

### API Client (`lib/api.ts`)

- `apiClient<T>(path, options)` — generic fetch wrapper
- Prepends `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
- Injects `Authorization: Bearer <token>` for authenticated requests
- Throws `ApiError` on non-2xx responses (includes `detail` from backend)

### Auth Context (`lib/auth.tsx`)

- `AuthProvider` + `useAuth()` hook
- Returns `{ user, token, isAuthenticated, login, email, logout, setUser }`
- Token stored in React state only — lost on page reload
- `setUser()` allows syncing the context after profile edits

### Navbar (`navbar.tsx`)

- Rendered in root layout, visible on every page
- Authenticated: user's display name (links to profile) + "Log out" button
- Guest: "Log in" link + "Register" button

### Styling

- Single dark theme (no light/dark toggle)
- Body: `bg-zinc-950 text-zinc-100`
- Cards: `bg-zinc-900 border-zinc-800`
- Inputs: `bg-zinc-800 border-zinc-700 text-white`
- Primary buttons: `bg-white text-zinc-900`
- Secondary text: `text-zinc-300` / `text-zinc-400`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL of the FastAPI backend |

## Accessibility

- All form inputs have associated `<label>` elements
- Error messages are associated with inputs via `aria-describedby`
- Error messages use `role="alert"` and `aria-live="polite"`
- Loading states disable buttons (`disabled` attribute)
- Keyboard navigation works for all interactive elements

## Not Included

- Token refresh flow
- Email verification
- Password reset
- OAuth / social login
- Token persistence (localStorage, sessionStorage, cookies)
- Light mode / theme toggle
- Server-side rendering for auth pages (all static-generated)
