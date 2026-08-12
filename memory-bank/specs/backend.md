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

#### `POST /request-reset-link`

Requests a password reset link. Always returns 200 regardless of whether the email exists (prevents email enumeration). When the email exists, a short-lived reset JWT is generated and the reset link is printed to the backend console as a **simulated email** (no real email infrastructure in the MVP).

| Detail | Value |
|--------|-------|
| Auth required | No |
| Request body | `{ "email": str }` |
| Success (200) | `{ "detail": "If an account with that email exists, a reset link has been sent." }` |
| Errors | 422 (validation) |
| Notes | Always 200 — no 404 for unknown emails |

#### `POST /reset-password`

Resets a user's password using a short-lived reset JWT. The token must carry `purpose: "password_reset"` and a valid `sub` (user UUID); otherwise 401. The new password is bcrypt-hashed before storage.

| Detail | Value |
|--------|-------|
| Auth required | No |
| Request body | `{ "token": str, "new_password": str }` |
| Success (200) | `{ "detail": "Password has been reset successfully." }` |
| Errors | 401 (invalid/expired token, wrong purpose, unknown user), 422 (validation, e.g. password < 8 chars) |
| Notes | Token is sent in the request body, NOT as a Bearer header — it is an unauthenticated endpoint |

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

### Request Models (Password Reset)

```python
class RequestResetLinkRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str      # Field(min_length=8), 128-char max via validator
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

### Auth Token

| Property | Value |
|----------|-------|
| Algorithm | HS256 (via `python-jose[cryptography]`) |
| Token type | Bearer (sent in `Authorization` header) |
| Expiry | 30 minutes (configurable via `JWT_EXPIRY_MINUTES` env var) |
| Refresh flow | Not included in MVP |
| Claims | `sub` (user UUID), `exp` (expiration), `iat` (issued at) |

### Password Reset Token

| Property | Value |
|----------|-------|
| Algorithm | HS256 (same `JWT_SECRET` as auth token) |
| Token type | Sent in request body (NOT as Bearer header) |
| Expiry | 15 minutes (configurable via `JWT_RESET_TOKEN_EXPIRY_MINUTES` env var) |
| Claims | `sub` (user UUID), `purpose` ("password_reset"), `exp`, `iat` |
| Validation | Purpose claim is checked — auth tokens (no `purpose`) are rejected, as are tokens with `purpose !== "password_reset"` |

---

## Health Check

| Route | Detail |
|-------|--------|
| `GET /health` | Returns `{ "status": "ok" }` with 200. No auth required. Used for deployment readiness probes. |
