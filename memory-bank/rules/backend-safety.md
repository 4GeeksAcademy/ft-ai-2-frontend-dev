# Backend Safety Rules (Python / FastAPI)

> Related specs: [Backend Spec](../specs/backend.md) | [Project Architecture](../specs/project-architecture.md) | [Security Spec](../specs/security.md)

## API Safety

1. **Always use Pydantic models for request/response validation.** Never accept
   raw `dict` or `Request.json()` without a Pydantic schema. This ensures type
   safety, validation, and automatic documentation.

2. **Return structured responses.** Use Pydantic models for all API responses.
   Never return raw dictionaries or ORM objects directly — this leaks internal
   structure and makes changes harder.

3. **Use HTTP exception codes correctly.** Use FastAPI's `HTTPException` or
   custom exception handlers. Never return 200 for errors. Use appropriate
   codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not
   found), 422 (validation error), 500 (server error).

4. **Never expose stack traces.** Configure a global exception handler that
   catches unhandled exceptions and returns a generic 500 response. Log the
   full traceback server-side for debugging.

5. **Validate path and query parameters.** All path parameters and query
   parameters must have type annotations and validation constraints. Use
   FastAPI's `Path()` and `Query()` with `min_length`, `max_length`, `ge`, `le`,
   etc.

## Data Safety (TinyDB)

6. **Validate before storage.** Every document written to TinyDB must be
   validated through a Pydantic model first. Never trust data received from the
   client.

7. **Scope queries.** TinyDB queries must use `Query()` objects to avoid
   injection-like patterns. Never use `eval()` or dynamic field construction
   from user input to build queries.

8. **Back up the database.** Before destructive operations (delete, update
   multiple), serialize a backup of the affected tables. Store backups with a
   timestamp in a `backups/` directory.

9. **Use UUIDs for document IDs.** Use UUIDv4 strings for document `eid`
   parameters. Never expose sequential integers or internal storage details to
   the client.

10. **Limit result sets.** API endpoints that return lists must implement
    pagination (`limit`/`offset`) with a configurable maximum limit to prevent
    unbounded response sizes.

## General Python Safety

11. **Type annotations everywhere.** All function parameters and return types
    must be annotated. Use `mypy` or `pyright` in strict mode as part of CI.

12. **Prevent path traversal.** When reading or writing files based on user
    input, validate the resolved path is within an allowed directory. Use
    `os.path.abspath()` and check the prefix.

13. **Read-only operations by default.** If data can be served without mutation,
    keep it read-only. Require explicit authentication or confirmation for write
    operations.

14. **Environment configuration.** All configuration (database path, API keys,
    server settings) must come from environment variables or a `.env` file.
    Never hard-code configuration values.