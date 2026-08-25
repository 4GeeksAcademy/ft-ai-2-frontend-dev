# ADR-0007: Mentions appear in the mentioned user's timeline

## Status

Accepted

## Context

The data model already has `is_mention` and `mentioned_user_id`. A mention that
never surfaces for the tagged user is dead weight.

## Decision

`GET /posts/timeline` includes posts where `mentioned_user_id` is the current
user, in addition to followed users' posts and the user's own posts.

## Consequences

- Mentions are useful in the demo script without a separate inbox
- Timeline query is a bit richer (union + dedupe)
- No notification bell or unread state in MVP
