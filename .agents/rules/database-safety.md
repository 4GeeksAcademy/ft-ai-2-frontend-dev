# Database & Data Safety Rules (TinyDB)

> Related specs: [Backend Spec](../specs/backend.md) | [Project Architecture](../specs/project-architecture.md)

## Write Safety

1. **Validate models before insert.** Every document inserted into TinyDB must
   pass Pydantic model validation first. Use the TinyDB middleware for Pydantic
   models that the project ships with.

2. **Use table-level operations.** Never perform raw storage operations on
   `db._storage`. Always use `table.insert()`, `table.update()`, `table.upsert()`,
   and `table.remove()`.

3. **Atomicity for multi-table updates.** When an operation spans multiple tables
   (e.g., creating a node and linking it), ensure that a failure in one step
   does not leave orphaned data. Implement rollback or compensate logic.

4. **Write-ahead backup for destructive operations.** Before `table.update()` or
   `table.remove()` that matches a broad query, serialize the affected documents
   as a timestamped JSON backup under `backups/`.

## Read Safety

5. **Always scope queries.** Use `tinydb.Query()` to construct query predicates.
   Never iterate over all documents and filter in a loop — that pattern grows
   linearly with the dataset and bypasses any future indexing.

6. **Limit unbounded reads.** Endpoints that return lists from TinyDB must
   support pagination. Default to a reasonable page size (e.g., 50) and enforce
   a hard maximum (e.g., 500).

7. **Escape user-supplied search terms.** When using `Query().field.search()`,
   ensure the search term is validated and escaped. Avoid regex injection by
   using `re.escape()` on user-supplied patterns.

## Data Integrity

8. **UUIDs are the public ID.** All documents must use UUIDv4 strings as their
   primary identifier (`eid`). Never expose the internal `doc_id` integer to
   the client.

9. **Immutable audit fields.** Include `created_at` and `updated_at` timestamps
   on every document. The `created_at` field must never be modified after
   creation; only `updated_at` changes on writes.

10. **Type-safe serialization.** Use the project's UUID serializer and Pydantic
    middleware for all TinyDB operations. Never manually serialize/deserialize
    UUIDs or complex types.

11. **Validate references.** When a document references another document by UUID
    (e.g., a link references a node), validate that the referenced document
    exists before writing the reference.

12. **Handle missing data gracefully.** When a document is not found by UUID,
    return a 404 error — not an empty document, a `None`, or a silent fallback
    to default values.