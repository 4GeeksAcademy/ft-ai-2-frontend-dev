# ADR-0002: Post content validated at the API layer

## Status

Accepted

## Context

Posts must be exactly one word (`^[a-zA-Z0-9]+$`) or a sole mention
(`^@[a-zA-Z0-9_]+$` of an existing user), max 200 characters.

## Decision

Enforce the constraint with a Pydantic validator on create. Store the raw
`content` string in PostgreSQL. Set `is_mention` / `mentioned_user_id` when
resolving a valid mention.

## Consequences

- DB stays simple; invalid rows should not appear if only the API writes
- Mentions require a user lookup at create time (404/422 if username missing)
- Do not rely on DB CHECK alone for the regex (keep one clear validation path)
