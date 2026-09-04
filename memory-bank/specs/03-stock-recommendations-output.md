---
title: Seasonal Stock Recommendation Output
version: 1.0
date_created: 2026-09-04
owner: Team
tags: data, recommendations, agent, output
---

# Introduction

This specification defines the structure and content of the data package produced by the pipeline for consumption by an AI agent. The agent's task is to analyze historical sales data and produce actionable seasonal stock recommendations.

## 1. Purpose & Scope

**Purpose**: Define the data package contract — the final deliverable that the pipeline writes — and the schema that the downstream AI agent expects for generating seasonal restocking suggestions.

**Scope**: This specification covers:
- The top-level output package schema (metadata, aggregated sales)
- The data fields the AI agent receives
- The format, structure, and conventions for the output
- Expected output of the agent (recommendation format)

**Audience**: Developers implementing the `package_for_agent` Prefect task. Developers building the downstream AI agent that consumes the package.

**Assumptions**:
- The downstream agent is a Generative AI capable of reading structured JSON and producing structured recommendations.
- The agent has access to the data package but NOT to the raw CSV.
- The agent does not need real-time data — the pipeline output is a point-in-time snapshot.

## 2. Definitions

| Term | Definition |
|------|------------|
| **Data Package** | The JSON-structured output produced by the pipeline, containing all data the agent needs. |
| **Agent** | A Generative AI that reads the data package and produces recommendations. |
| **Recommendation** | A structured suggestion for a specific product, indicating whether to reorder, reduce, or maintain stock for an upcoming season. |
| **Seasonal Trend** | A pattern in sales data that correlates with a specific season (Winter, Spring, Summer, Autumn). |
| **Reorder Suggestion** | A recommendation that stock of a product should be increased for the upcoming season. |
| **Reduce Suggestion** | A recommendation that stock of a product should be decreased for the upcoming season. |
| **Maintain Suggestion** | A recommendation that current stock levels are adequate. |

## 3. Requirements, Constraints & Guidelines

### Requirements

- **REQ-001**: The output package must be a single JSON-serializable dictionary.
- **REQ-002**: The package must include a `metadata` section describing the pipeline run.
- **REQ-003**: The package must include an `aggregated_sales` section with both `by_product_month` and `by_product_season` views.
- **REQ-004**: The package must include a `cancellations_summary` section with aggregate statistics on returns/cancellations.
- **REQ-005**: The package must include a `top_products` section listing the top 20 products by total quantity sold overall.
- **REQ-006**: The output must be valid JSON — no Python-specific types (no `datetime`, `NaN`, or `Decimal` objects; use ISO strings, `null`, and floats).

### Constraints

- **CON-001**: The output package files must be written to a `output/` directory relative to the project root.
- **CON-002**: Monetary values must use 2-decimal-precision floats.
- **CON-003**: All dates must use ISO-8601 format (`YYYY-MM-DD`).

### Guidelines

- **GUD-001**: Include a `top_products` list keyed by season to help the agent quickly identify the biggest movers.
- **GUD-002**: Flag products that appear in the top cancellations as potential quality or sizing issues.
- **GUD-003**: Use descriptive key names (`snake_case`) throughout.

## 4. Interfaces & Data Contracts

### 4.1 Full Output Package Schema

```json
{
  "metadata": {
    "pipeline_run_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "generated_at": "2026-09-04T14:30:00Z",
    "source_file": "sales_data.csv",
    "total_transactions": 541909,
    "valid_sales_count": 531285,
    "cancellation_count": 10624,
    "unique_products": 4070,
    "unique_customers": 4372,
    "date_range": {
      "start": "2010-12-01",
      "end": "2011-12-09"
    },
    "countries": 38,
    "pipeline_version": "1.0"
  },
  "aggregated_sales": {
    "by_product_month": [
      {
        "stock_code": "85123A",
        "description": "WHITE HANGING HEART T-LIGHT HOLDER",
        "month": "2010-12",
        "country": "United Kingdom",
        "total_quantity": 150,
        "total_revenue": 382.50,
        "transaction_count": 25
      }
    ],
    "by_product_season": [
      {
        "stock_code": "85123A",
        "description": "WHITE HANGING HEART T-LIGHT HOLDER",
        "season": "Winter",
        "year": 2010,
        "total_quantity": 600,
        "total_revenue": 1530.00,
        "avg_unit_price": 2.55
      }
    ],
    "top_products_overall": [
      {
        "rank": 1,
        "stock_code": "23166",
        "description": "MEDIUM CERAMIC TOP STORAGE JAR",
        "total_quantity": 108702,
        "total_revenue": 139149.12
      }
    ],
    "top_by_season": {
      "Winter": [ ... ],
      "Spring": [ ... ],
      "Summer": [ ... ],
      "Autumn": [ ... ]
    }
  },
  "cancellations_summary": {
    "total_returned_quantity": 35412,
    "total_refund_amount": 89987.50,
    "top_cancelled_products": [
      {
        "stock_code": "85123A",
        "description": "WHITE HANGING HEART T-LIGHT HOLDER",
        "returned_quantity": 45
      }
    ],
    "cancellation_by_country": {
      "United Kingdom": 9875,
      "Germany": 234,
      ...
    }
  }
}
```

### 4.2 Agent Recommendation Output Format

The pipeline does NOT generate recommendations — that is the agent's job. However, the agent should produce output in this structure:

```json
{
  "recommendations": [
    {
      "stock_code": "85123A",
      "description": "WHITE HANGING HEART T-LIGHT HOLDER",
      "season": "Winter",
      "action": "reorder",
      "priority": "high",
      "reasoning": "Product sold 600 units in Winter 2010 across UK. Strong seasonal demand suggests increasing stock for next Winter.",
      "suggested_order_quantity": 300
    }
  ],
  "seasonal_insights": [
    "Winter shows highest demand for home decor and lighting products",
    "Cancellations spike in January (post-holiday returns)"
  ]
}
```

## 5. Acceptance Criteria

- **AC-001**: Given the pipeline completes, the output directory contains one JSON file named `pipeline-output-{run_id}.json`.
- **AC-002**: Given the output file, parsing it with `json.load()` succeeds without errors.
- **AC-003**: The `metadata` section includes all required fields (pipeline_run_id, generated_at, counts).
- **AC-004**: The `aggregated_sales.by_product_season` list is non-empty and each entry has valid season names (`Winter`, `Spring`, `Summer`, `Autumn`).

## 6. Test Automation Strategy

- **Test Levels**: Integration (output package generation), Serialization (JSON compatibility)
- **Frameworks**: `pytest`, `jsonschema` for schema validation
- **Test Data Management**: Use the full pipeline output (not a subset) for schema validation
- **Key Test Cases**:
  - JSON serializability (no NaN, Infinity, datetime objects)
  - Schema compliance against a JSON Schema definition
  - All required keys present at each nesting level
  - Data consistency checks (e.g., by_product_season quantities consistent with by_product_month rollups)

## 7. Rationale & Context

The output package is designed to be self-contained so that the AI agent needs no access to the raw CSV or internal pipeline state. Including both month-country and season-level aggregations lets the agent do both granular and high-level analysis. The `top_products` sections reduce the cognitive load on the agent by highlighting the most important items.

## 8. Dependencies & External Integrations

### External Systems
- **EXT-001**: Filesystem — Output JSON file written to `output/` directory.

### Third-Party Services
- **SVC-001**: None. The downstream AI agent is invoked separately (not part of the pipeline).

### Data Dependencies
- **DAT-001**: Aggregated sales data from Task 2.

## 9. Examples & Edge Cases

### Example: Product with Zero Sales in Output Package

```json
{
  "aggregated_sales": {
    "by_product_month": [],
    "by_product_season": [],
    "top_products_overall": []
  }
}
```

The agent should recognize that this product has never sold and may recommend it for clearance or removal.

### Edge Case: High Demand Seasonal Spike

A product that sold 500 units in Winter 2010 but only 50 units in Summer should trigger a strong seasonal reorder recommendation for Winter.

### Edge Case: Season with No Historical Data

If the dataset starts in December 2010, the Winter 2010 season has only 1 month of data. The agent should note this data limitation.

## 10. Validation Criteria

- [ ] Output file is valid JSON (verified by `json.load()`).
- [ ] Output file contains exactly 1 JSON object (not an array).
- [ ] All datetime values are ISO-8601 strings.
- [ ] All monetary values are floats with ≤2 decimal places.
- [ ] The `by_product_season` aggregation includes 4 seasons.
- [ ] No `NaN`, `Infinity`, or `-Infinity` values in the output.