# Backend

> See also: [Backend Safety Rules](../rules/backend-safety.md) | [Database Safety Rules](../rules/database-safety.md) | [General Safety Rules](../rules/general-safety.md)

This contains the blueprint of the functionality of the backend of Auth Demo.

## Standard Conventions

### Error Response Format

All error responses follow a consistent envelope:

```json
{
  "detail": "Human-readable error message",
  "error_code": "UNIQUE_ERROR_IDENTIFIER"
}
```

| HTTP Code | Usage |
|-----------|-------|
| 400 | Bad request (malformed input) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (token valid but not allowed) |
| 404 | Resource not found |
| 409 | Conflict (e.g., email already registered) |
| 422 | Validation error (Pydantic schema failure) |
| 500 | Internal server error (generic, no stack trace) |

### Authentication Dependency

A reusable FastAPI dependency (`get_current_user`) extracts and validates the JWT from the `Authorization: Bearer <token>` header. It returns the authenticated `User` model. Protected routes declare this as a dependency to automatically enforce authentication.

### CORS Configuration

CORS is configured via environment variables (see [Project Architecture](project-architecture.md#environment-variables)). During development, the origin is set to the frontend dev server. In production, this must be restricted to known origins.

---

## Routes

### Auth Routes

#### `POST /register`

Registers a new user. The password is **hashed** before storage — plaintext is never persisted.

| Detail | Value |
|--------|-------|
| Auth required | No |
| Request body | `{ "email": str, "password": str, "display_name": str }` |
| Success (201) | `{ "id": uuid, "email": str, "display_name": str, "gravatar_url": str }` |
| Errors | 409 (email already exists), 422 (validation) |

#### `POST /login`

Authenticates a user with their email and password. Returns a signed JWT and the user's public profile.

| Detail | Value |
|--------|-------|
| Auth required | No |
| Request body | `{ "email": str, "password": str }` |
| Success (200) | `{ "access_token": str, "token_type": "bearer", "user": { ... } }` |
| Errors | 401 (invalid credentials), 422 (validation) |

### User Routes

#### `GET /user/{id}`

Fetches a single user's public profile by UUID.

| Detail | Value |
|--------|-------|
| Auth required | No |
| Path params | `id`: UUIDv4 |
| Success (200) | `{ "id": uuid, "email": str, "display_name": str, "gravatar_url": str }` |
| Errors | 404 (user not found), 422 (invalid UUID) |

#### `PATCH /user/{id}`

Updates the authenticated user's own profile. Only the **authenticated user** may edit their own record — updating another user's profile returns 403.

| Detail | Value |
|--------|-------|
| Auth required | Yes (`Authorization: Bearer <token>`) |
| Path params | `id`: UUIDv4 (must match the authenticated user) |
| Request body | `{ "email"?: str, "display_name"?: str, "gravatar_url"?: str }` (all fields optional) |
| Success (200) | Updated `{ "id": uuid, "email": str, "display_name": str, "gravatar_url": str }` |
| Errors | 401 (no token), 403 (wrong user), 404 (not found), 422 (validation) |

---

## Models

The `User` model represents a user of the Auth Demo application. It contains a **hashed** password, along with the rest of the user profile details.

```python
class User(BaseModel):
    id: uuid.UUID
    email: str
    password: str          # Stored as bcrypt hash, never plaintext
    display_name: str
    gravatar_url: str
```

### Password Policy

| Rule | Value |
|------|-------|
| Hashing algorithm | bcrypt (via `passlib[bcrypt]`) |
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Plaintext storage | Never |

---

## Token Behavior

| Property | Value |
|----------|-------|
| Algorithm | RS256 or HS256 (via `python-jose[cryptography]`) |
| Token type | Bearer |
| Expiry | 30 minutes (configurable via `JWT_EXPIRY_MINUTES` env var) |
| Refresh flow | Not included in MVP |
| Claims | `sub` (user UUID), `exp` (expiration), `iat` (issued at) |

---

## Health Check

| Route | Detail |
|-------|--------|
| `GET /health` | Returns `{ "status": "ok" }` with 200. No auth required. Used for deployment readiness probes. |
