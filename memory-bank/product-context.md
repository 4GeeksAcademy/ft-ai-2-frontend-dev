# Data Pipelines with Prefect Demo

This is a demo data pipeline using Prefect and an ecommerce sales dataset.  The goal is to use Prefect to demonstrate a data pipeline allowing us to repackage the data in a way that we could then pass it to an agent to make seasonal stock recommendations.

## Architecture

- Python project using `uv` for package management.
- Prefect 3.x for pipeline orchestration.
- `pandas` and `numpy` for data transformation.

## Key Facts

| Metric | Value |
|--------|-------|
| Dataset rows | 541,909 |
| Unique products | ~4,070 |
| Countries | 38 (90%+ United Kingdom) |
| Cancellations | ~10,624 (negative qty or 'C'-prefixed invoices) |
| Date range | Dec 2010 – Dec 2011 |

## Specifications

The project is fully specified across three documents in [`memory-bank/specs/`](./specs/README.md):

1. **[Architecture](./specs/01-architecture-data-pipeline.md)** — Pipeline flow topology, Prefect task/flow design, execution model
2. **[Data Schema](./specs/02-data-schema-transformations.md)** — Raw CSV schema, cleaned schemas, aggregation views, transformation rules
3. **[Stock Recommendations Output](./specs/03-stock-recommendations-output.md)** — Output package structure for downstream AI agent consumption
