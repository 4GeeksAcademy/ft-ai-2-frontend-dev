# ADR-0008: Browser localhost URLs vs Compose service DNS

## Status

Accepted

## Context

`NEXT_PUBLIC_*` values are embedded in the browser bundle. Docker service names
like `brevity-api` do not resolve on the host. Using them as public API URLs
breaks client calls — a common live-coding failure.

## Decision

- Browser / `NEXT_PUBLIC_*`: `http://localhost:8000` and `http://localhost:8001`
- Server-to-server inside Compose: `http://brevity-api:8000`,
  `http://brevity-analytics:8001`
- Enable CORS on API and analytics for `http://localhost:3000`

## Consequences

- `.env.example` documents both sets of variables
- SSR (if used for public routes) uses non-public `API_URL`
- Workshop machines that bind differently may need env overrides
