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
- **Client components:** Use `'use client'` only when interactivity, hooks, or
  browser APIs are needed. Default to server components.
- **Images:** Use `<Image>` from `next/image` with `remotePatterns` configured
  in `next.config.ts`.
