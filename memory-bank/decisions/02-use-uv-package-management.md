---
title: Use uv for Python Package Management
version: 1.0
date_created: 2026-09-04
owner: Team
status: accepted
tags: infrastructure, python, tooling
---

# Use uv for Python Package Management

## Context

The project is a Python-based data pipeline with dependencies including `prefect`, `pandas`, and `numpy`. We need a package manager that provides fast, reliable dependency resolution and can run standalone scripts or projects without a virtualenv activation ceremony.

## Decision

We will use **`uv`** — a fast Python package and project manager written in Rust.

## Rationale

- `uv` is significantly faster than pip for dependency resolution and installation.
- `uv` supports `pyproject.toml`-based project definitions, which is modern Python best practice.
- `uv` can run Python scripts directly (`uv run script.py`) without explicit virtualenv management.
- `uv` provides deterministic dependency resolution via `uv.lock`.
- Zero configuration for development — `uv sync` creates and syncs the environment in one command.

## Consequences

- The project must include a `pyproject.toml` defining dependencies.
- Contributors need `uv` installed (via `pip install uv`, `curl -LsSf https://astral.sh/uv/install.sh`, or system package manager).
- The CI/CD pipeline must use `uv` rather than standard `pip install`.
- `uv` is still a relatively new tool (though widely adopted); ecosystem knowledge is growing.

## Alternatives Considered

- **pip + venv**: Standard but slow resolution; requires manual venv activation.
- **Poetry**: Slower than uv, more complex `pyproject.toml` syntax.
- **Conda**: Overkill for a pipeline without C/C++ extensions or multi-language dependencies.