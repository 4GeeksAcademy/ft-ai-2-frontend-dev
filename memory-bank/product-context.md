# Brevity.app - The micro-est microblog.

This is an application intended to be a very stripped-down microblogging service
allowing users to post incredibly short messages that other users can see and
respond to. This is intended as a **demonstration of observability and telemetry
in applications** — a teaching tool for instrumenting modern web services.

The core design constraint is that posts are limited to **single words** composed
only of letters and numbers. The only exception is tagging other users via
`@username` (no additional text allowed alongside a tag). This makes Brevity.app
a genuinely unique take on "micro" blogging.

## Current Status

- **Branch:** `module/observability`
- **Phase:** Planning / specifications drafted
- **MVP specs:** See [specs/mvp-scope.md](./specs/mvp-scope.md) for the full
  scope, session breakdown, and success criteria
- **Previous branch work:** The preceding modules built a full-stack auth demo
  (Turborepo + FastAPI + Next.js) and a relational database demo (Citizen Weather
  Tracker API with SQLModel/PostgreSQL). This module pivots to a new application
  purpose-built for observability instrumentation.

## Key Features

- **One-word posts** — Messages are limited to a single word (letters and numbers
  only, max 200 characters). Tagging a user (`@username`) is the only exception
  and prohibits additional text.
- **Liking posts** — Users can react to posts.
- **Following users** — Follow other users to see their one-word posts in a feed.
- **Observability instrumentation** — Every service emits structured telemetry
  (logs, metrics, traces) to demonstrate end-to-end observability patterns.

## Architecture

- **Docker Compose** for containerization and local orchestration
- **brevity** — Next.js 16 frontend using TypeScript and Tailwind CSS 4
- **brevity api** — FastAPI backend using SQLModel
    - Auth uses `jose` and `libpass` for JWT authentication
    - Alembic for database migrations
    - PostgreSQL for the relational database
- **brevity analytics** — FastAPI analytics server supporting both individual
  events via RESTful requests and streaming events via WebSockets
    - TinyDB for lightweight analytics data storage
- **Observability stack** — The three services will be instrumented to emit
  structured logs, metrics, and distributed traces, demonstrating how to monitor
  and debug a multi-service application.

## Problem Statement

Modern web applications are composed of multiple services communicating over the
network. When something goes wrong — a slow page load, a failed API call, a
database bottleneck — developers need visibility into the system. This project
exists to teach **observability patterns** (logging, metrics, tracing) in a
realistic but manageable multi-service architecture.

## User Personas

- **The Laconic Wit** — People who believe that brevity is the heart of wit, and
  are taking that idea to the logical extreme. They want to share single-word
  thoughts with followers.
- **The Curious Observer** — Learners and workshop participants who use this app
  as a sandbox for understanding how distributed tracing, structured logging, and
  metrics collection work in practice.

## Key Differentiators

- Genuinely constrained content model (single words + mentions) creates a unique
  character-limited social experience.
- Built from the ground up as an observability teaching tool — not retrofitted.
- Three-service architecture (frontend, API, analytics) provides realistic
  cross-service trace flows without excessive complexity.

## Related Documentation

- See [memory-bank/specs/](./specs/) for detailed design documents (scope, data
  model, API routes, architecture diagrams)
- See [memory-bank/decisions/](./decisions/) for architecture decision records
- See [memory-bank/rules/](./rules/) for safety and process constraints by layer
- See [memory-bank/conventions.md](./conventions.md) for coding conventions
