# Dev Conventions

- Use the `cli-project-bootstrapping` skill when bootstrapping projects.
- Use TypeScript with strict mode.
- Organize components in folders by feature.
- Style with utility-first Tailwind CSS in markup (avoid BEM and `@apply`
  unless there is a clear shared component edge case).
- Prefer established design patterns.
- Follow PEP8 for Python code.
- Format Python code with `autopep8`, and JS/TS/HTML/CSS with Prettier.
- Manage Python dependencies with `uv` (not pip). Use `uv add <package>` to add
  dependencies and `uv sync` to install. The `uv.lock` file must be committed.
- Manage JS dependencies with `pnpm`. Use `pnpm add <package>` to add
  dependencies and `pnpm install` to install. The `pnpm-lock.yaml` must be committed.

## Frontend (Next.js) Conventions

- **React 19 form pattern:** Use `<form action={async handler}>` with `FormData`
  and `name` attributes on inputs. Do NOT use `onSubmit` with `FormEvent` —
  `FormEvent` is deprecated in React 19. Use uncontrolled inputs (`defaultValue`
  for edit forms, no `value`/`onChange`/`useState` for form fields).
- **Auth context pattern:** Keep JWT in React state only (no localStorage).
  Expose `{ user, token, isAuthenticated, login, logout, setUser }` via
  `useAuth()` hook. Use `setUser()` to sync auth context after profile edits.
- **API client:** Use `apiClient<T>(path, { token, method, body })` from
  `lib/api.ts`. It prepends `NEXT_PUBLIC_API_URL`, injects `Authorization`
  header, and throws `ApiError` on non-2xx responses. For unauthenticated
  endpoints (like password reset), omit the `token` option.
- **Redirects:** Use `useEffect` for redirecting authenticated users away from
  login/register pages. Do NOT call `router.replace()` during render — React 19
  warns about this.
- **`useSearchParams()` Suspense boundary:** Any page that calls `useSearchParams()`
  must wrap the component using it in a `<Suspense>` boundary. Pattern: extract
  the hook-using component into an inner function/component, export a wrapper
  default that renders `<Suspense fallback={null}><InnerComponent /></Suspense>`.
  Both `/login` and `/reset-password` follow this pattern.
- **Dark theme:** Single dark theme only (no light/dark toggle). Use `bg-zinc-950`
  for page background, `bg-zinc-900` for cards, `bg-zinc-800` for inputs,
  `text-zinc-100` for primary text, `text-zinc-300`/`text-zinc-400` for
  secondary text. No `dark:` variants anywhere.
- **Client components:** Use `'use client'` only when interactivity, hooks, or
  browser APIs are needed. Default to server components.
- **Images:** Use `<Image>` from `next/image` with `remotePatterns` configured
  in `next.config.ts`.
- **Password reset pattern:** Two-state page at `/reset-password`:
  - No `?token=` param: email form → calls `POST /auth/request-reset-link` → shows "Check your email" message
  - `?token=` param present: password form with confirm → calls `POST /auth/reset-password` → redirects to `/login?reset=success`
  - Login page shows success banner via `?reset=success` query param + "Forgot your password?" link below password field
