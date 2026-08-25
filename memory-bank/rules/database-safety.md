# Database & Data Safety Rules

Brevity uses **two** stores. Apply the section that matches the service you are
changing.

| Store | Service | Specs |
|-------|---------|-------|
| PostgreSQL + SQLModel + Alembic | `brevity-api` | [data-model.md](../specs/data-model.md) |
| TinyDB (JSON file) | `brevity-analytics` | [api-routes.md](../specs/api-routes.md) (analytics) |

---

## PostgreSQL (`brevity-api`)

### Schema & migrations

1. **Change schema via Alembic only.** Do not rely on `create_all` for
   durable schema changes in shared/demo environments once migrations exist.
2. **Mirror constraints in the ORM and DB.** Unique likes/follows, no
   self-follow, and FKs belong in the database — not only in Python.
3. **Validate at the API boundary.** Pydantic/SQLModel schemas validate
   inputs before persistence (especially post content / mentions).

### Write safety

4. **Use sessions and transactions.** Commit on success; roll back on error.
   Do not leave half-applied multi-row social operations.
5. **Never trust client-supplied ownership.** Deletes and likes must check
   the authenticated user server-side.
6. **Hash passwords only with the project password library.** Never store
   plaintext. Never log password fields.

### Read safety

7. **Paginate list endpoints.** Default `limit` with a hard maximum
   (e.g. 100). Prefer `limit`/`offset` for MVP.
8. **Avoid N+1 in timeline queries.** Load like counts / `liked_by_me` in a
   deliberate query pattern (join, subquery, or batched lookup).
9. **Do not expose `password_hash`.** Response schemas must omit secrets.

### Integrity

10. **UUIDs as public IDs.** Do not expose internal surrogate details beyond
    the agreed API types.
11. **Resolve mention FKs before insert.** If `@username` does not exist,
    fail the request — do not insert a dangling `mentioned_user_id`.
12. **Cascade or clean up dependents** when deleting posts (likes) according
    to the ORM relationship rules you define — document the choice in code.

---

## TinyDB (`brevity-analytics`)

### Write safety

1. **Validate event payloads with Pydantic** before insert.
2. **Use table-level APIs** (`insert`, `update`, `remove`). Do not touch
   private storage internals.
3. **Keep event documents append-mostly.** Prefer insert new events over
   rewriting history.

### Read safety

4. **Paginate event lists.** Default page size (e.g. 50), hard max (e.g. 500).
5. **Scope queries** with `tinydb.Query()` — avoid loading the entire table
   into Python to filter.

### Integrity

6. **UUIDs for event IDs** exposed to clients; do not rely on TinyDB `doc_id`
   as a public identifier.
7. **Include `created_at` (or equivalent)** on every event; treat it as
   immutable after insert.
8. **Unauthenticated ingest is a demo tradeoff** (ADR-0006). Do not add
   destructive admin APIs without auth. Document the risk in the README.
