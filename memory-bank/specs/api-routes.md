# Brevity.app — API Routes

## Base URL

All API routes are served under the `brevity-api` service. Frontend calls are
proxied through Next.js server-side or via `NEXT_PUBLIC_API_URL` environment
variable.

## Authentication

Most endpoints require a `Bearer <token>` header. The JWT is obtained from
`POST /auth/login` and contains the `user_id` and `username` in its payload.

---

## Auth Endpoints (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Create account (email, username, password) |
| `POST` | `/auth/login` | No | Login, returns JWT token |

### POST /auth/register

```json
{
  "email": "user@example.com",
  "username": "witling",
  "password": "hunter2"
}
// → 201
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "witling",
  "display_name": "witling",
  "token": "eyJ..."
}
```

### POST /auth/login

```json
{
  "email": "user@example.com",
  "password": "hunter2"
}
// → 200
{
  "token": "eyJ...",
  "user": { "id": "uuid", "email": "...", "username": "...", "display_name": "..." }
}
```

---

## User Endpoints (`/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me` | Yes | Get current user's profile |
| `PATCH` | `/users/me` | Yes | Update own profile (display_name, bio) |
| `GET` | `/users/{username}` | No | View a user's public profile |
| `GET` | `/users/{username}/posts` | No | View a user's post history |

### GET /users/me

Returns the authenticated user's full profile including follower/following
counts and post count.

### PATCH /users/me

```json
{
  "display_name": "Witty One",
  "bio": "Brevity is the soul of wit."
}
// → 200
```

### GET /users/{username}

```json
// → 200
{
  "id": "uuid",
  "username": "witling",
  "display_name": "Witty One",
  "bio": "Brevity is the soul of wit.",
  "avatar_url": "https://gravatar.com/...",
  "post_count": 42,
  "follower_count": 7,
  "following_count": 3,
  "created_at": "2026-08-25T..."
}
```

---

## Post Endpoints (`/posts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/posts` | Yes | Create a new post |
| `GET` | `/posts/timeline` | Yes | Get feed from followed users (reverse chronological) |
| `GET` | `/posts/{id}` | No | Get a single post with like count |
| `DELETE` | `/posts/{id}` | Yes | Delete own post |

### POST /posts

```json
{
  "content": "brevity"
}
// → 201
{
  "id": "uuid",
  "author": { "username": "witling", "display_name": "Witty One" },
  "content": "brevity",
  "is_mention": false,
  "like_count": 0,
  "created_at": "2026-08-25T..."
}
```

**Validation:**
- Content must match `^[a-zA-Z0-9]+$` (single word, letters/numbers only)
- Or match `^@[a-zA-Z0-9_]+$` (mention of existing user)
- Max 200 characters

### GET /posts/timeline

Query params: `?limit=20&offset=0`

Returns posts from users the authenticated user follows, plus own posts, in
reverse chronological order. Includes `like_count` and whether the current
user has liked each post.

---

## Social Endpoints (`/social`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/social/follow/{username}` | Yes | Follow a user |
| `DELETE` | `/social/follow/{username}` | Yes | Unfollow a user |
| `GET` | `/social/following/{username}` | No | List who a user follows |
| `GET` | `/social/followers/{username}` | No | List a user's followers |
| `POST` | `/social/like/{post_id}` | Yes | Like a post |
| `DELETE` | `/social/like/{post_id}` | Yes | Unlike a post |

---

## Analytics Endpoints (`/analytics`)

*Served by the `brevity-analytics` service.*

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/analytics/event` | No | Record an analytics event |
| `GET` | `/analytics/events` | No | Query recent events (paginated) |
| `WS` | `/analytics/ws` | No | WebSocket stream of live events |

### POST /analytics/event

```json
{
  "event_type": "post_created",
  "user_id": "uuid",
  "metadata": { "post_id": "uuid", "content_length": 7 }
}
// → 201
```

### Event Types

| Event Type | Triggered When |
|------------|---------------|
| `page_view` | User visits a page |
| `post_created` | User creates a post |
| `post_deleted` | User deletes a post |
| `like_created` | User likes a post |
| `like_removed` | User unlikes a post |
| `follow_created` | User follows someone |
| `follow_removed` | User unfollows someone |

---

## Health Endpoints

| Method | Path | Service | Description |
|--------|------|---------|-------------|
| `GET` | `/health` | brevity-api | API health check (DB connectivity) |
| `GET` | `/health` | brevity-analytics | Analytics health check |

```json
// → 200
{ "status": "ok", "service": "brevity-api", "timestamp": "2026-08-25T..." }
```