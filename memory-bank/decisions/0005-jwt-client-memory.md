# ADR-0005: JWT in React memory only

## Status

Accepted

## Context

Prior auth demos used JWT. SSR authenticated fetch needs a token the server
can read (cookies). Memory-only React context cannot.

## Decision

Store the JWT in React context (memory only, no `localStorage`). Use the
client-side `apiClient` for authenticated requests. Do not claim SSR can
perform authenticated API calls under this model.

## Consequences

- Page refresh logs the user out — acceptable for a short live demo
- Clearer security story than stuffing JWT in `localStorage`
- If SSR auth is needed later, switch to httpOnly cookies (new ADR)
