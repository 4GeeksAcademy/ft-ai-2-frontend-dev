---
title: Data Pipeline Architecture
version: 1.0
date_created: 2026-09-04
owner: Team
tags: architecture, data-pipeline, prefect
---

# Introduction

This specification defines the architecture for a Prefect-driven data pipeline that ingests an ecommerce sales dataset, transforms it into analysis-ready structures, and produces a data package suitable for an AI agent to generate seasonal stock recommendations.

## 1. Purpose & Scope

**Purpose**: Define the overall pipeline topology, execution model, component boundaries, and data flow for the Prefect-based data pipeline.

**Scope**: This specification covers the end-to-end orchestration of:
- Raw data ingestion (sales CSV)
- Data cleaning and transformation
- Seasonal stock analysis data package creation

**Audience**: Developers implementing and maintaining the pipeline.

**Assumptions**:
- Python 3.12+ is available with the `uv` package manager.
- Prefect 3.x is used for orchestration.
- The sales dataset (`sales_data.csv`) is available at pipeline start.
- The pipeline runs locally or in a Prefect-managed environment (not serverless).

## 2. Definitions

| Term | Definition |
|------|------------|
| **Prefect** | A workflow orchestration framework for Python that manages task dependencies, retries, scheduling, and observability. |
| **Flow** | The top-level container in Prefect that represents an entire pipeline. |
| **Task** | A discrete unit of work within a Prefect flow, annotated with `@task`. |
| **Pipeline** | A synonym for a Prefect flow in this document. |
| **Agent** | In this context, the downstream AI agent that consumes the pipeline's output to produce recommendations. |
| **Seasonal Stock Recommendation** | A suggestion for which products to re-stock or reduce based on historical sales patterns by season. |

## 3. Requirements, Constraints & Guidelines

### Functional Requirements

- **REQ-001**: The pipeline shall ingest `sales_data.csv` and parse all 8 columns correctly.
- **REQ-002**: The pipeline shall handle rows with encoding issues (latin-1 encoded fields) gracefully.
- **REQ-003**: The pipeline shall separate order-line records with negative quantities (returns/cancellations ~10,624 rows) from valid sales and flag them as cancellations.
- **REQ-004**: The pipeline shall aggregate sales by product, month, and country.
- **REQ-005**: The pipeline shall produce a final output package consumable by an AI agent for stock recommendations.
- **REQ-006**: The pipeline shall include a `@flow`-decorated entry point and at least two `@task`-decorated functions.

### Constraints

- **CON-001**: The project must use `uv` for dependency management (no pip/poetry for project-level dependencies).
- **CON-002**: Prefect must be the sole orchestration layer — no Airflow, Dagster, or alternative orchestrators.
- **CON-003**: All task dependencies must be explicitly defined in the flow; no implicit ordering via side effects.

### Guidelines

- **GUD-001**: Each Prefect task should have a single responsibility and a clear name.
- **GUD-002**: Task retry settings should use exponential backoff for I/O-bound tasks.
- **GUD-003**: Use Prefect's caching features (`cache_key_fn`, `cache_expiration`) for tasks that read stable input data.
- **GUD-004**: Log key metrics (row counts, aggregation sizes) at info level within each task.

## 4. Interfaces & Data Contracts

### Flow Structure

```
sales_data.csv
      │
      ▼
┌─────────────────────┐
│ Task 1: Ingest Data  │  ← Reads & parses CSV
│   @task(retries=2)   │
└─────────┬───────────┘
          │ raw_product_sales: list[dict]
          ▼
┌──────────────────────┐
│ Task 2: Clean &       │  ← Filter cancellations, validate types,
│   Transform Data      │     normalize dates, aggregate
│   @task               │
└──────────┬───────────┘
           │ clean_aggregated_sales: dict
           │ (valid_sales, cancellations,
           │  aggregations, metadata)
           ▼
┌──────────────────────────────┐
│ Task 3: Package for           │  ← Assemble final JSON for AI agent
│   AI Agent                    │
│   @task(cache_policy=...)     │
└───────────┬──────────────────┘
            │ output_package: JSON file
            ▼
      output/pipeline-output-{run_id}.json
```

### Flow Definition (Pseudocode)

```python
from prefect import flow, task

@task(retries=2, retry_delay_seconds=30)
def ingest_sales_data(path: str) -> list[dict]:
    ...

@task
def clean_and_transform(raw_data: list[dict]) -> dict:
    ...

@task
def package_for_agent(
    sales_data: dict
) -> dict:
    ...

@flow(name="Seasonal Stock Pipeline")
def seasonal_stock_pipeline(csv_path: str) -> dict:
    raw = ingest_sales_data(csv_path)
    transformed = clean_and_transform(raw)
    output = package_for_agent(transformed)
    return output
```

### Output Package Structure

```json
{
  "metadata": {
    "pipeline_run_id": "uuid",
    "generated_at": "ISO-8601",
    "source_file": "sales_data.csv",
    "total_transactions": 541909,
    "date_range": {"start": "2010-12-01", "end": "2011-12-09"}
  },
  "aggregated_sales": {
    "by_product_month": [{ "product_code": "...", "month": "2010-12", "quantity": 150, "revenue": 382.50, "country": "United Kingdom" }],
    "by_product_season": [{ "product_code": "...", "season": "Winter", "total_quantity": 600, "avg_unit_price": 3.25 }]
  },
  "cancellations_summary": {
    "total_returned_quantity": 35412,
    "total_refund_amount": 89987.50,
    "top_cancelled_products": [...]
  },
  "top_products": [
    { "rank": 1, "stock_code": "23166", "description": "MEDIUM CERAMIC TOP STORAGE JAR", "total_quantity": 108702 }
  ]
}
```

## 5. Acceptance Criteria

- **AC-001**: Given the pipeline is executed with `seasonal_stock_pipeline("data/sales_data.csv")`, then it shall complete without unhandled exceptions and return a `dict` with all expected top-level keys.
- **AC-002**: Given the pipeline completes, then the aggregated sales shall break down by product-month-country and by product-season.
- **AC-003**: Given invalid or missing input, the ingest task shall fail with a clear Prefect logging message after exhausting retries.

## 6. Test Automation Strategy

- **Test Levels**: Unit (individual task logic), Integration (flow execution end-to-end)
- **Frameworks**: `pytest` with `pytest-asyncio`, Prefect's `prefect.testing.utilities`
- **Test Data Management**: Use a small fixture CSV subset (e.g., 50 rows) for testing
- **CI/CD Integration**: Tests run via `uv run pytest` in GitHub Actions
- **Coverage Requirements**: >= 70% code coverage for pipeline tasks
- **Performance Testing**: Run full pipeline against a 50K-row subset to benchmark

## 7. Rationale & Context

Prefect is chosen over Airflow (heavier, DAG-focused, less approachable for demos) and plain scripts (no observability, retries, or scheduling). The three-task decomposition separates concerns cleanly: ingestion is I/O-bound, transformation is compute-bound, and packaging is the final assembly. Generated inventories were initially considered but removed to keep the pipeline focused purely on real sales data and to simplify the agent's task to analyzing actual historical patterns rather than simulated stock levels.

## 8. Dependencies & External Integrations

### External Systems
- **EXT-001**: Filesystem — Local CSV file read and output directory write.

### Third-Party Services
- **SVC-001**: None. The pipeline is entirely self-contained.

### Infrastructure Dependencies
- **INF-001**: Python 3.12+ runtime with `uv` package manager.

### Data Dependencies
- **DAT-001**: `sales_data.csv` — 541,909 row CSV with 8 columns, latin-1 encoded, containing 2010-2011 ecommerce transactions.

### Technology Platform Dependencies
- **PLT-001**: Prefect 3.x workflow orchestration library for Python.
- **PLT-002**: `pandas` for tabular data transformations.
- **PLT-003**: `numpy` for numerical operations during aggregation.

## 9. Examples & Edge Cases

### Edge Case: Empty or Missing CSV
```python
# Pipeline should handle gracefully:
# - Missing file: Prefect task retries, then fails with FileNotFoundError
# - Empty file (0 data rows): should still return a valid output structure
#   with empty aggregations and empty product list
```

### Edge Case: Encoding Errors
```python
# The dataset contains latin-1 characters (e.g., "£" as \xa3).
# The ingest task must specify encoding='latin-1' (or 'ISO-8859-1'),
# and log a warning for any row that cannot be decoded.
```

### Edge Case: Negative Quantities
```python
# 10,624 rows have negative Quantity (cancellations/returns).
# The clean_and_transform task must:
# 1. Separate these from positive-quantity rows
# 2. Preserve them in a 'cancellations' field for the output package
# 3. Not include them in sales aggregation by default
```

## 10. Validation Criteria

- [ ] The flow definition is valid Prefect 3.x syntax and passes `@flow`/`@task` decoration registration.
- [ ] All three tasks are called within the flow body in the correct dependency order.
- [ ] The output dictionary matches the schema defined in Section 4.
- [ ] Aggregated sales exclude negative-quantity rows unless explicitly requested.
- [ ] The pipeline can be executed standalone via `python -m pipeline` (entry point).