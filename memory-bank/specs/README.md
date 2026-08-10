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

### Implementation Notes

- **Monorepo**: Turborepo + pnpm scaffolded; backend lives under `apps/backend/`
- **Backend**: FastAPI with TinyDB, CORS, lifespan handlers, and all auth routes deployed
- **Auth**: JWT (HS256) via `python-jose`, password hashing via `libpass[bcrypt]` (replaces the unmaintained `passlib`)
- **Testing**: Verified manually — register, login, user lookup, and profile update all return correct responses
- **Frontend**: Not yet started (see below)

### Planned (Future Phases)

- `frontend.md` — Frontend application spec (NextJS/TypeScript)
- `testing.md` — Test strategy and coverage requirements