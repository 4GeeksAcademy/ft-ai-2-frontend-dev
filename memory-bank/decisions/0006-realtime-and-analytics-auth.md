# ADR-0006: Analytics WebSocket vs social “real time”; open ingest

## Status

Accepted

## Context

Success criteria mentioned likes “in real time,” and analytics exposes a
WebSocket. Mixing those implies a live social sync that is out of scope for
3–4 sessions. Open analytics ingest is convenient for demos but insecure.

## Decision

1. **Analytics WS** streams analytics events only (teaching fan-out / live
   telemetry). It does **not** drive like/follow UI updates.
2. **Likes/follows** use optimistic UI + HTTP refetch/patch.
3. **Event ingest and WS are unauthenticated** for MVP — intentional tradeoff;
   call it out in class when discussing threat models.

## Consequences

- Simpler Session 3 frontend
- Demo still shows a live stream without building notifications
- Do not ship this ingest pattern to production without auth
