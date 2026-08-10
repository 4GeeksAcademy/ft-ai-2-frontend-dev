# Project Architecture Spec

> See also: [Backend Safety Rules](../rules/backend-safety.md) | [Database Safety Rules](../rules/database-safety.md) | [General Safety Rules](../rules/general-safety.md)

## Tech Stack

- **Monorepo tool:** turborepo for project organization
- **Package manager (Python):** `uv` for python package management
- **Web framework:** FastAPI
- **Database:** TinyDB with a custom middleware that bridges Pydantic models and TinyDB documents
- **Auth libraries:** `python-jose[cryptography]` (JWT) and `passlib[bcrypt]` (password hashing)

## Directory Structure

```
apps/
  backend/                 # FastAPI application
    main.py                # App entry point — creates the FastAPI app and mounts routers
    database.py            # TinyDB initialization and middleware setup
    models/
      user.py              # Pydantic User model
    routers/
      auth.py              # POST /register, POST /login
      users.py             # GET /user/{id}, PATCH /user/{id}
    dependencies.py        # FastAPI dependencies (e.g., get_current_user)
    config.py              # Settings loaded from environment variables
    backups/               # Auto-generated timestamped DB backups (gitignored)
  frontend/                # Placeholder — not yet implemented (see below)
packages/
  shared/                  # Placeholder for shared types (future)
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PATH` | `data/db.json` | Path to the TinyDB JSON file |
| `JWT_SECRET` | *(required)* | Secret key used to sign JWT tokens |
| `JWT_ALGORITHM` | `HS256` | Signing algorithm for JWT |
| `JWT_EXPIRY_MINUTES` | `30` | Token lifetime in minutes |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Comma-separated list of allowed CORS origins |

## Data Flow

```
Client Request
    │
    ▼
FastAPI Router  ──►  Auth Dependency (get_current_user)  ──►  Route Handler
                                                                    │
                                                                    ▼
                                                            Pydantic Validation
                                                                    │
                                                                    ▼
                                                            TinyDB (via Middleware)
                                                                    │
                                                                    ▼
                                                            Pydantic Response
                                                                    │
                                                                    ▼
Client Response
```

1. Request arrives at a FastAPI router.
2. If the route requires authentication, `get_current_user` extracts and validates the JWT from the `Authorization` header.
3. The route handler validates the request body/params against a Pydantic model.
4. Data is read/written to TinyDB via the Pydantic middleware (automatic serialization/deserialization).
5. The response is serialized back through a Pydantic model before being returned to the client.

## TinyDB Middleware

The custom middleware allows Pydantic models to be used directly with TinyDB tables. It handles:
- Automatic serialization of UUIDs and complex types to storage-safe formats
- Automatic deserialization back to Pydantic models on read
- Type-safe queries using Pydantic field names

## Frontend

Frontend is **out of scope** for this phase of the project. When frontend work begins, a new spec (`specs/frontend.md`) should be created. See [the safety rules](../rules/frontend-safety.md) and [UI safety rules](../rules/ui-safety.md) for the constraints that will apply.
