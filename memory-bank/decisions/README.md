# Project Decisions

This directory contains the ADRs for this project.  ADRs are in separate files, and are named `{0-padded index}-{ADR name in kebab case}.md`.

## Index

| File | Reason |
|------|--------|
| [01-use-prefect-orchestration.md](./01-use-prefect-orchestration.md) | Use Prefect 3.x as the pipeline orchestration framework for retries, observability, and explicit task dependencies. |
| [02-use-uv-package-management.md](./02-use-uv-package-management.md) | Use `uv` for fast deterministic Python package management and project execution. |
