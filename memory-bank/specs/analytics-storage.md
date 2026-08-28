# Brevity.app — Analytics Storage

**Status:** Approved  
**ADR:** [0009-analytics-supabase.md](../decisions/0009-analytics-supabase.md)  
**Supersedes:** [0003-analytics-tinydb.md](../decisions/0003-analytics-tinydb.md)

---

## 1. Overview

Migrate `brevity-analytics` from TinyDB (JSON file) to **PostgreSQL on
Supabase**, using **psycopg3** and a connection string from the project root
`.env`.

| Aspect | Before | After |
|--------|--------|-------|
| Storage | TinyDB (`data/events.json`) | Supabase Postgres (`analytics_events`) |
| Driver | `tinydb` | `psycopg[binary,pool]` |
| Config | `ANALYTICS_DB_PATH` | `SUPABASE_DB_URL` |
| Compose volume | `analytics-data` | None (external DB) |

**Scope:** `brevity-analytics` only. `brevity-api` continues using local
Compose Postgres + SQLModel + Alembic.

**Non-goals:** shared schema with `brevity-api`; auth on ingest; real-time
social sync via WebSocket.

---

## 2. Architecture

```mermaid
flowchart LR
    API["brevity-api"] -->|"POST /analytics/event"| Ana["brevity-analytics"]
    Browser --> Ana
    Ana -->|"psycopg3 + SSL"| SB[("Supabase Postgres<br/>analytics_events")]

    subgraph env [Root .env]
        URL["SUPABASE_DB_URL"]
    end

    URL --> Ana
```

Analytics and the main API use **separate databases**. There are no foreign keys
from `analytics_events` to `brevity-api` tables.

---

## 3. Configuration

### 3.1 Environment variable

| Variable | Location | Required | Notes |
|----------|----------|----------|-------|
| `SUPABASE_DB_URL` | Root `.env` + Compose `environment` | Yes | Postgres connection URI |

**`.env.example`:**

```env
# --- Analytics (Supabase Postgres) ---
# Supabase → Project Settings → Database → Connection string (URI)
# SSL is required (the app appends sslmode=require if missing).
#
# Docker / Compose: use the IPv4 connection string or the Session/Transaction
# pooler URI. The default direct host (db.<ref>.supabase.co) may be IPv6-only;
# Docker often cannot reach it ("Network is unreachable").
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 3.2 Docker and IPv4

When `brevity-analytics` runs inside Docker Compose, outbound connections to
Supabase must use a hostname that resolves to **IPv4**. In practice:

| Connection type | Typical host | Docker-friendly? |
|-----------------|--------------|------------------|
| Direct (default) | `db.<ref>.supabase.co` | Often **no** — may be IPv6-only |
| IPv4 (Supabase dashboard) | IPv4-specific URI | **Yes** |
| Session / Transaction pooler | `aws-0-<region>.pooler.supabase.com` | **Yes** — resolves to IPv4 |

**Symptom:** pool timeout on startup; logs show `Network is unreachable` to an
`2600:…` IPv6 address.

**Fix:** In Supabase → Project Settings → Database, copy the **IPv4** connection
string or the **pooler** URI into `SUPABASE_DB_URL` in the project root `.env`.

### 3.3 URL normalization

Root `.env` may use SQLAlchemy-style URLs (`postgresql+psycopg://...`) like
`DB_URL`. psycopg3 expects a plain Postgres URI. Normalize on load:

```python
def normalize_db_url(url: str) -> str:
    return url.replace("postgresql+psycopg://", "postgresql://", 1)
```

Append `sslmode=require` if not already present (Supabase requires SSL).

### 3.4 Docker Compose

```yaml
brevity-analytics:
  environment:
    SUPABASE_DB_URL: ${SUPABASE_DB_URL}
    # remove ANALYTICS_DB_PATH
  # remove analytics-data volume mount
```

- Pass through from host `.env`; do not bake into the image
- Remove `analytics-data` from top-level `volumes:`

### 3.5 Local (non-Docker) dev

Load the root `.env` when running `uv run` from `brevity-analytics/` (e.g.
`python-dotenv` with `load_dotenv("../.env")`). Fail fast at startup if
`SUPABASE_DB_URL` is unset.

---

## 4. Data model

### 4.1 Table: `analytics_events`

Mirrors the current TinyDB document shape (`event_store.py`, `schemas.py`).

```sql
CREATE TABLE analytics_events (
    id          UUID PRIMARY KEY,
    event_type  TEXT NOT NULL,
    user_id     UUID,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_created_at
    ON analytics_events (created_at DESC);

CREATE INDEX idx_analytics_events_event_type_created_at
    ON analytics_events (event_type, created_at DESC);
```

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | App-generated (`uuid.uuid4()`), same as today |
| `event_type` | `TEXT` | One of the `EventType` literals in `schemas.py` |
| `user_id` | `UUID` nullable | Opaque client value; no FK to `brevity-api` users |
| `metadata` | `JSONB` | Arbitrary key/value payload |
| `created_at` | `TIMESTAMPTZ` | UTC; set on insert |

**Rules:**

- Append-only — no updates or deletes
- No cross-database foreign keys
- `event_type` values match [api-routes.md](./api-routes.md) event types

### 4.2 ER diagram

```mermaid
erDiagram
    analytics_events {
        uuid id PK
        text event_type
        uuid user_id "nullable"
        jsonb metadata
        timestamptz created_at
    }
```

---

## 5. Application design

### 5.1 Module layout

```
brevity-analytics/
├── app/
│   ├── database.py          # URL normalize, ConnectionPool, helpers
│   ├── event_store.py       # Postgres-backed EventStore
│   └── migrations/
│       └── 001_create_analytics_events.sql
```

### 5.2 EventStore interface (unchanged)

Routes in `main.py` do not change. Public methods:

```python
class EventStore:
    def insert_event(self, *, event_type, user_id, metadata) -> dict[str, Any]: ...
    def list_events(self, *, limit=50, offset=0, event_type=None) -> list[dict]: ...
    def count(self) -> int: ...
```

### 5.3 Dependencies

```toml
# add
"psycopg[binary,pool]>=3.2.0",
"python-dotenv>=1.0.0",

# remove
"tinydb>=4.9.0",
```

Use `psycopg_pool.ConnectionPool`. Wire open/close into the FastAPI `lifespan`
in `main.py`.

**Pool defaults:**

| Setting | Value |
|---------|-------|
| `min_size` | 1 |
| `max_size` | 5 |
| `timeout` | 30s |

### 5.4 Sync vs async

Use **sync psycopg3 + pool** for the initial migration. Current `EventStore` is
sync; FastAPI runs blocking DB calls in a threadpool. Revisit async psycopg if
ingest volume grows.

### 5.5 SQL (parameterized)

**Insert:**

```sql
INSERT INTO analytics_events (id, event_type, user_id, metadata, created_at)
VALUES (%(id)s, %(event_type)s, %(user_id)s, %(metadata)s::jsonb, %(created_at)s)
RETURNING id, event_type, user_id, metadata, created_at;
```

**List:**

```sql
SELECT id, event_type, user_id, metadata, created_at
FROM analytics_events
WHERE (%(event_type)s IS NULL OR event_type = %(event_type)s)
ORDER BY created_at DESC
LIMIT %(limit)s OFFSET %(offset)s;
```

**Count:**

```sql
SELECT COUNT(*) FROM analytics_events;
```

All queries use `%(name)s` placeholders — never interpolate user input into SQL.

---

## 6. Migrations

**Recommended (v1):** SQL file + version tracker.

- `app/migrations/001_create_analytics_events.sql`
- Track applied versions in a `schema_migrations` table
- Run pending migrations on pool init

**Alternative:** Alembic under `brevity-analytics/` if schema evolution becomes
a teaching goal (mirrors `brevity-api`).

Do not rely on silent `CREATE TABLE IF NOT EXISTS` without version tracking.

---

## 7. Health endpoint

Align with `brevity-api`:

```json
{
  "status": "ok",
  "service": "brevity-analytics",
  "timestamp": "2026-08-28T...",
  "database": "ok",
  "events_stored": 142
}
```

- `database: "error"` → `status: "degraded"`
- `events_stored` from `SELECT COUNT(*)`
- Add optional `database` field to `HealthResponse` in `schemas.py`

---

## 8. TinyDB data migration (optional)

One-time script: `scripts/migrate_analytics_to_supabase.py`

1. Read legacy `events.json` (or path from former `ANALYTICS_DB_PATH`)
2. Parse TinyDB `events` table
3. Batch-insert with `ON CONFLICT (id) DO NOTHING`
4. Log read / inserted / skipped counts

Run manually before cutover; not part of app startup.

---

## 9. Implementation phases

| Phase | Work | Verify |
|-------|------|--------|
| 1. Schema | Create migration SQL; apply to Supabase | Table visible in dashboard |
| 2. Database layer | `database.py` — normalize URL, pool, SSL | `SELECT 1` from scratch script |
| 3. EventStore | Rewrite `event_store.py` | Insert + list + count |
| 4. Lifespan + health | Pool lifecycle; DB in `/health` | `database: ok` |
| 5. Compose + env | Wire `SUPABASE_DB_URL`; remove volume | `docker compose up` persists to Supabase |
| 6. Cleanup | Remove TinyDB, `ANALYTICS_DB_PATH`, `data/` from image | `uv.lock` updated |
| 7. Docs | ADR-0009, this spec, architecture + safety rules | memory-bank consistent |

---

## 10. Security and operations

1. **Never commit `.env`** — `SUPABASE_DB_URL` contains credentials
2. **SSL required** — `sslmode=require` for Supabase
3. **Pooler vs direct** — port `6543` (pooler) or `5432` (direct); pooler
   preferred for many short-lived connections
4. **Docker needs IPv4** — use the Supabase IPv4 or pooler URI; the default
   direct host may be IPv6-only and fail inside Compose
5. **Ingest still open** — ADR-0006 unchanged; document in README
6. **Separate DB** — no shared migrations with `brevity-api`

---

## 11. Rollback

If Supabase is unreachable during a workshop:

1. Revert `event_store.py` to TinyDB (git tag before migration)
2. Re-add `analytics-data` volume in Compose
3. Make `SUPABASE_DB_URL` optional again

---

## 12. Acceptance criteria

- [ ] `POST /analytics/event` persists to Supabase; response shape unchanged
- [ ] `GET /analytics/events` returns paginated events by `created_at DESC`
- [ ] `GET /health` reports `database: ok` and accurate `events_stored`
- [ ] `WS /analytics/ws` broadcasts new events (no change to `websocket.py`)
- [ ] `docker compose up` works with `SUPABASE_DB_URL` in root `.env`
- [ ] No TinyDB dependency in `pyproject.toml` / `uv.lock`
- [ ] memory-bank ADR + architecture docs updated

---

## Related

- [api-routes.md](./api-routes.md) — analytics endpoints and event types
- [architecture.md](./architecture.md) — service topology
- [database-safety.md](../rules/database-safety.md) — Postgres rules for analytics
