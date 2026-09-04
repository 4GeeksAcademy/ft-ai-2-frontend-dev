---
title: Use Prefect for Pipeline Orchestration
version: 1.0
date_created: 2026-09-04
owner: Team
status: accepted
tags: architecture, prefect, orchestration
---

# Use Prefect for Pipeline Orchestration

## Context

We need to build a data pipeline that:
1. Ingests an ecommerce CSV (541,909 rows)
2. Cleans and transforms the data
3. Packages everything for an AI agent to generate seasonal stock recommendations

The pipeline needs retries, observability, and clear dependency management between stages.

## Decision

We will use **Prefect 3.x** as the pipeline orchestration framework. Each pipeline stage will be a `@task`-decorated function within a single `@flow`.

## Rationale

- Prefect provides automatic retry logic with configurable backoff (needed for I/O-bound ingestion).
- Prefect's built-in logging and observability are essential for a demo — we can show the Prefect UI/console output.
- Prefect's `@flow`/`@task` decorators make dependency ordering explicit without complex DAG definitions.
- Prefect is lighter and more approachable than Airflow for this demo project.
- Prefect caching (`cache_key_fn`, `cache_expiration`) allows skipping re-processing of unchanged input.

## Consequences

- The project depends on the `prefect` Python package.
- Pipeline execution requires a running or ephemeral Prefect server (or local `serve` mode).
- Teams must understand Prefect concepts: flows, tasks, retries, caching.
- The pipeline cannot run without Prefect installed (no fallback to plain scripts).

## Alternatives Considered

- **Plain scripts**: No retries, no observability, no dependency management — rejected.
- **Airflow**: Too heavy for a demonstration pipeline; requires a database and scheduler — rejected.
- **Dagster**: Excellent for data quality but more complex setup — rejected for scope.