# MVP Specs

This directory contains the specifications for the **Auth Demo**. Each file
covers a specific aspect of the application. These specs define the scope and
design decisions for the first working version.

## File Index

| File | Covers | Status |
|------|--------|--------|
| [project-architecture.md](project-architecture.md) | Monorepo layout, tech stack, directory structure, data flow, environment variables | ✅ Implemented |
| [backend.md](backend.md) | API routes, request/response schemas, models, token behavior, conventions | ✅ Implemented |
| [security.md](security.md) | Authentication flow, JWT structure, password policy, threat mitigations, known gaps | ✅ Implemented |
| [password-reset.md](password-reset.md) | Password reset flow, reset token, backend routes, frontend routes, security considerations | ✅ Implemented |
| [frontend-component-refactor.md](frontend-component-refactor.md) | Frontend component hierarchy, repeated patterns, migration plan for UI primitives | ✅ Implemented |

### Implementation Notes

- **Monorepo**: Turborepo + pnpm scaffolded; backend lives under `apps/backend/`
- **Backend**: FastAPI with TinyDB, CORS, lifespan handlers, and all auth routes deployed
- **Auth**: JWT (HS256) via `python-jose`, password hashing via `libpass[bcrypt]` (replaces the unmaintained `passlib`)
- **Password Reset**: Two new endpoints (`POST /auth/request-reset-link`, `POST /auth/reset-password`), short-lived JWT with `purpose: "password_reset"` claim, simulated email on console, email enumeration prevention (always returns 200)
- **Frontend**: Next.js 16 App Router with 5 pages (including `/reset-password`), `useSearchParams()` wrapped in `<Suspense>`, dark theme only
- **Testing**: Verified manually — register, login, request-reset-link, reset-password, user lookup, and profile update all return correct responses; edge cases (invalid token, wrong purpose, short password, unknown email) all handled correctly