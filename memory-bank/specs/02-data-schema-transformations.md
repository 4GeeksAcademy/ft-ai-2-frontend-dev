---
title: Sales Data Schema & Transformations
version: 1.0
date_created: 2026-09-04
owner: Team
tags: schema, data, sales, transformation
---

# Introduction

This specification defines the schema of the raw `sales_data.csv`, the derived data structures produced by the pipeline, and the transformation rules that govern how raw records become analysis-ready data.

## 1. Purpose & Scope

**Purpose**: Define the canonical schemas for all data tables flowing through the pipeline — raw, cleaned, aggregated, and packaged — and the transformation logic between them.

**Scope**: This specification covers:
- Raw CSV column definitions, types, and constraints
- Data cleaning rules (null handling, encoding, outlier detection)
- Aggregation schemas (by product-month-country, by product-season)
- Cancellation/return record schema
- Output package data contract

**Audience**: Developers implementing pipeline transformation logic and downstream agents consuming pipeline output.

**Assumptions**: The raw CSV uses latin-1 encoding and contains header rows.

## 2. Definitions

| Term | Definition |
|------|------------|
| **InvoiceNo** | A 6-digit integral identifier for each transaction. If the code starts with 'C', it indicates a cancellation. |
| **StockCode** | A 5-character alphanumeric product identifier (e.g., `85123A`). |
| **Stock Keeping Unit (SKU)** | The StockCode — a unique identifier for each product. |
| **Cancellation** | A transaction with a negative Quantity or an InvoiceNo starting with 'C'. |
| **Aggregation** | The process of grouping and summarizing raw transaction data. |
| **Season** | A 3-month period: Winter (Dec-Feb), Spring (Mar-May), Summer (Jun-Aug), Autumn/Fall (Sep-Nov). |

## 3. Requirements, Constraints & Guidelines

### Requirements

- **REQ-001**: The raw CSV must be read with `encoding='latin-1'` (ISO-8859-1) to handle special characters.
- **REQ-002**: `InvoiceDate` must be parsed from the format `DD/MM/YYYY HH:MM` into a datetime object.
- **REQ-003**: `Quantity` and `UnitPrice` must be cast to numeric types. Non-numeric values must be logged and nullified.
- **REQ-004**: Rows with `CustomerID` missing (blank/null) must be preserved but flagged with `customer_unknown = True`.
- **REQ-005**: Rows with `Quantity <= 0` or `InvoiceNo` starting with 'C' must be classified as cancellations and excluded from positive sales aggregation.
- **REQ-006**: Two aggregation views must be produced: `by_product_month_country` and `by_product_season`.
- **REQ-007**: Each aggregation must include a `total_quantity` and `total_revenue` (where `revenue = quantity * unit_price`).

### Constraints

- **CON-001**: No rows may be silently dropped — all rows must appear in at least one output collection (e.g., `valid_sales`, `cancellations`).
- **CON-002**: The raw CSV must never be modified in place.
- **CON-003**: Column names in output data must use `snake_case`, not the original `PascalCase` column names.
- **CON-004**: All monetary values must use 2-decimal precision.

### Guidelines

- **GUD-001**: Document any non-standard encoding or parsing issues in a `warnings` field in the output.
- **GUD-002**: Use `pandas.DataFrame` for intermediate transformations and convert to `dict` or JSON at the boundary.
- **GUD-003**: Flag statistical outliers (e.g., `UnitPrice` > 3 standard deviations from mean) but do not remove them.

## 4. Interfaces & Data Contracts

### 4.1 Raw CSV Schema (`sales_data.csv`)

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| `InvoiceNo` | `string` | No | 6-digit transaction ID; 'C' prefix = cancellation | `536365`, `C536365` |
| `StockCode` | `string` | No | 5-char alphanumeric product code | `85123A` |
| `Description` | `string` | Yes | Product description | `WHITE HANGING HEART T-LIGHT HOLDER` |
| `Quantity` | `integer` | No | Quantity sold (positive) or returned (negative) | `6`, `-2` |
| `InvoiceDate` | `string` | No | Date/time of transaction `DD/MM/YYYY HH:MM` | `12/1/2010 8:26` |
| `UnitPrice` | `float` | No | Price per unit in GBP (£) | `2.55` |
| `CustomerID` | `string` | Yes | 5-digit customer identifier | `17850` |
| `Country` | `string` | No | Customer's country (38 distinct values) | `United Kingdom` |

### 4.2 Cleaned & Enriched Schema (Internal)

| Column | Type | Source | Description |
|--------|------|--------|-------------|
| `invoice_no` | `string` | Raw `InvoiceNo` | Normalized transaction ID |
| `is_cancellation` | `bool` | Derived | `True` if `InvoiceNo` starts with 'C' or `Quantity <= 0` |
| `stock_code` | `string` | Raw `StockCode` | Product identifier |
| `description` | `string` | Raw `Description` | Product description |
| `quantity` | `integer` | Raw `Quantity` | Absolute quantity used for cancellations; raw for sales |
| `invoice_date` | `datetime` | Parsed `InvoiceDate` | Python datetime object |
| `unit_price` | `float` | Raw `UnitPrice` | Price per unit |
| `revenue` | `float` | Derived `quantity * unit_price` | Total line revenue |
| `customer_id` | `string` or `null` | Raw `CustomerID` | Null if missing, flagged with `customer_unknown: True` |
| `customer_unknown` | `bool` | Derived | `True` when `CustomerID` is missing |
| `country` | `string` | Raw `Country` | Normalized country name |
| `month` | `string` | Derived `YYYY-MM` | Calendar month extracted from `invoice_date` |
| `season` | `string` | Derived | One of `Winter`, `Spring`, `Summer`, `Autumn` |

### 4.3 Aggregation: by_product_month_country

| Column | Type | Description |
|--------|------|-------------|
| `stock_code` | `string` | Product identifier |
| `description` | `string` | Product description |
| `month` | `string` | `YYYY-MM` format |
| `country` | `string` | Country name |
| `total_quantity` | `integer` | Sum of quantities sold |
| `total_revenue` | `float` | Sum of `quantity * unit_price` |
| `transaction_count` | `integer` | Count of transactions in this group |

### 4.4 Aggregation: by_product_season

| Column | Type | Description |
|--------|------|-------------|
| `stock_code` | `string` | Product identifier |
| `description` | `string` | Product description |
| `season` | `string` | `Winter`, `Spring`, `Summer`, or `Autumn` |
| `year` | `integer` | Calendar year |
| `total_quantity` | `integer` | Sum of quantities sold in that season |
| `total_revenue` | `float` | Sum of revenue in that season |
| `avg_unit_price` | `float` | Average unit price across transactions |

### 4.5 Cancellation Records

| Column | Type | Description |
|--------|------|-------------|
| `invoice_no` | `string` | Original cancellation invoice |
| `stock_code` | `string` | Product returned/cancelled |
| `quantity` | `integer` | Absolute value returned (positive integer) |
| `unit_price` | `float` | Price at time of cancellation |
| `invoice_date` | `datetime` | Cancellation date |
| `country` | `string` | Country |

## 5. Acceptance Criteria

- **AC-001**: Given the raw CSV is read with `latin-1` encoding, then all 541,909 rows are parsed without decoding errors.
- **AC-002**: Given a row with `InvoiceNo` starting with 'C', then `is_cancellation` is `True` and the row appears in `cancellations` only.
- **AC-003**: Given a row with `Quantity <= 0`, then `is_cancellation` is `True` regardless of `InvoiceNo`.
- **AC-004**: Given a row with missing `CustomerID`, then `customer_unknown` is `True` and the row is still preserved in `valid_sales` (if not a cancellation).
- **AC-005**: Given the full dataset is cleaned, then:
  - `valid_sales` + `cancellations` counts sum to 541,909
  - `by_product_month_country` contains exactly the number of unique `(stock_code, month, country)` combinations
  - `by_product_season` has no duplicate `(stock_code, season, year)` entries

## 6. Test Automation Strategy

- **Test Levels**: Unit (parsing, cleaning, aggregation functions)
- **Frameworks**: `pytest` with `pandas.testing` for DataFrame comparison
- **Test Data Management**: 10-row hand-crafted CSV fixture covering all edge cases (null CustomerID, cancellations, special chars, missing Description)
- **Key Test Cases**:
  - Cancellation detection (both negative quantity and C-prefix)
  - Date parsing with various month/day formats
  - Round-trip consistency (row count preservation)
  - Aggregation correctness on known data

## 7. Rationale & Context

The raw CSV uses latin-1 because it contains British pound signs (£) and accented characters in product descriptions. The cancellation detection uses both InvoiceNo prefix *and* negative Quantity because the dataset includes both patterns. Preserving null-CustomerID rows is important because ~20% of rows lack a customer ID; dropping them would lose valuable sales data. Two aggregation views support different downstream needs: month-country granularity for geographic analysis, season-level for the stock recommendation agent.

## 8. Dependencies & External Integrations

### External Systems
- **EXT-001**: Filesystem — CSV file read only.

### Data Dependencies
- **DAT-001**: `sales_data.csv` — latin-1 encoded CSV with 8 named columns.

### Technology Platform Dependencies
- **PLT-001**: `pandas` for columnar transformation and aggregation.
- **PLT-002**: `numpy` for statistical calculations (e.g., outlier thresholds).

## 9. Examples & Edge Cases

### Example: Cancellation Detection

```csv
InvoiceNo,StockCode,Description,Quantity,InvoiceDate,UnitPrice,CustomerID,Country
C536365,85123A,WHITE HANGING HEART T-LIGHT HOLDER,-6,12/1/2010 8:26,2.55,17850,United Kingdom
536366,85123A,WHITE HANGING HEART T-LIGHT HOLDER,-2,13/1/2010 9:00,2.55,17850,United Kingdom
```

Both rows are cancellations — first by `C` prefix, second by negative Quantity. In cleaned output:
- `is_cancellation = True` for both
- They appear in `cancellations` with `quantity` as absolute value (6, 2)
- They do **not** appear in `valid_sales` or aggregations

### Example: Null CustomerID

```csv
InvoiceNo,StockCode,Description,Quantity,InvoiceDate,UnitPrice,CustomerID,Country
536367,84406B,CREAM CUPID HEARTS COAT HANGER,8,12/1/2010 8:26,2.75,,United Kingdom
```

Cleaned: `customer_id = None`, `customer_unknown = True`, still counts as `valid_sales`.

### Example: Special Characters in Description

```
Description contains: "£", "é", "ñ" — these are valid latin-1 bytes and must decode correctly.
```

## 10. Validation Criteria

- [ ] All 541,909 rows accounted for in either `valid_sales` or `cancellations`.
- [ ] Zero UnicodeDecodeError exceptions from reading the CSV.
- [ ] All date strings parse to valid `datetime` objects.
- [ ] Null CustomerIDs are preserved as `None` (not empty string).
- [ ] Aggregation groupings produce no duplicate keys.
- [ ] Revenue calculations match `quantity * unit_price` to 2 decimal places.