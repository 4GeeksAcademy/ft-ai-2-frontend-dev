"""Seasonal Stock Recommendation Pipeline.

A Prefect 3.x pipeline that ingests ecommerce sales data, transforms it,
and produces a data package for an AI agent to generate seasonal stock recommendations.

Usage:
    uv run run-pipeline
    uv run python pipeline.py
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from prefect import flow, task

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DATA_DIR = Path("data")
OUTPUT_DIR = Path("output")
CSV_PATH = DATA_DIR / "sales_data.csv"
CSV_ENCODING = "latin-1"
PIPELINE_VERSION = "1.0"

# ---------------------------------------------------------------------------
# Task 1: Ingest
# ---------------------------------------------------------------------------


@task(
    retries=2,
    retry_delay_seconds=30,
    name="ingest_sales_data",
    description="Read the raw sales CSV and return a pandas DataFrame.",
)
def ingest_sales_data(csv_path: str | Path) -> pd.DataFrame:
    """Read the raw sales CSV with latin-1 encoding into a DataFrame."""
    path = Path(csv_path)

    if not path.exists():
        raise FileNotFoundError(f"Sales data not found at: {path}")

    df = pd.read_csv(
        path,
        encoding=CSV_ENCODING,
        dtype={
            "InvoiceNo": "string",
            "StockCode": "string",
            "Description": "string",
            "Quantity": "float64",
            "UnitPrice": "float64",
            "CustomerID": "string",
            "Country": "string",
        },
        low_memory=False,
    )

    # Strip whitespace from string columns
    for col in df.select_dtypes(include="string").columns:
        df[col] = df[col].str.strip()

    row_count = len(df)
    print(f"[ingest] Read {row_count:,} rows from {path}")
    return df


# ---------------------------------------------------------------------------
# Task 2: Clean & Transform
# ---------------------------------------------------------------------------


def _assign_season(month: int) -> str:
    """Map a calendar month (1-12) to a season name."""
    if month in (12, 1, 2):
        return "Winter"
    if month in (3, 4, 5):
        return "Spring"
    if month in (6, 7, 8):
        return "Summer"
    return "Autumn"


@task(name="clean_and_transform", description="Clean data and build aggregation views.")
def clean_and_transform(raw: pd.DataFrame) -> dict:
    """Parse, clean, and aggregate the raw sales data.

    Returns a dictionary with keys:
        - valid_sales
        - cancellations
        - by_product_month
        - by_product_season
        - metadata (row counts, date range, etc.)
    """
    df = raw.copy()
    total_rows = len(df)

    # --- Rename columns to snake_case (CON-003) ---
    df.rename(columns={
        "InvoiceNo": "invoice_no",
        "StockCode": "stock_code",
        "Description": "description",
        "Quantity": "quantity",
        "InvoiceDate": "invoice_date",
        "UnitPrice": "unit_price",
        "CustomerID": "customer_id",
        "Country": "country",
    }, inplace=True)

    # --- Parse invoice_date ---
    # Dates use MM/DD/YYYY HH:MM format with variable digit widths
    # (e.g. "1/5/2011 9:11" = Jan 5, "12/13/2010 9:02" = Dec 13).
    parts = df["invoice_date"].str.split(" ", n=1, expand=True)
    date_parts = parts[0].str.split("/", n=2, expand=True)
    time_parts = parts[1].str.split(":", n=1, expand=True)

    # Normalize to YYYY-MM-DD HH:MM for unambiguous parsing
    df["invoice_date"] = (
        date_parts[2] + "-" +
        date_parts[0].str.zfill(2) + "-" +
        date_parts[1].str.zfill(2) + " " +
        time_parts[0].str.zfill(2) + ":" +
        time_parts[1].str.zfill(2)
    )
    df["invoice_date"] = pd.to_datetime(df["invoice_date"])

    # --- Flag unknown customers ---
    df["customer_unknown"] = df["customer_id"].isna()

    # --- Compute revenue ---
    df["revenue"] = df["quantity"] * df["unit_price"]
    df["revenue"] = df["revenue"].round(2)

    # --- Separate cancellations ---
    def _is_cancellation(row):
        inv = str(row.get("invoice_no", ""))
        return inv.startswith("C") or row.get("quantity", 0) <= 0

    cancellation_mask = df.apply(_is_cancellation, axis=1)

    valid_sales = df[~cancellation_mask].copy()
    cancellations = df[cancellation_mask].copy()

    # Extract date parts for valid sales
    valid_sales["year"] = valid_sales["invoice_date"].dt.year
    valid_sales["month"] = valid_sales["invoice_date"].dt.month
    valid_sales["month_str"] = valid_sales["invoice_date"].dt.strftime("%Y-%m")
    valid_sales["season"] = valid_sales["month"].apply(_assign_season)

    # --- Aggregation 1: by_product_month_country ---
    by_product_month = (
        valid_sales.groupby(
            ["stock_code", "description", "month_str", "country"], as_index=False
        )
        .agg(
            total_quantity=("quantity", "sum"),
            total_revenue=("revenue", "sum"),
            transaction_count=("invoice_no", "nunique"),
        )
    )
    by_product_month["total_quantity"] = by_product_month["total_quantity"].astype(int)
    by_product_month["total_revenue"] = by_product_month["total_revenue"].round(2)
    by_product_month["transaction_count"] = by_product_month["transaction_count"].astype(int)
    by_product_month = by_product_month.rename(columns={"month_str": "month"})
    by_product_month = by_product_month.sort_values(
        ["stock_code", "month", "country"]
    ).reset_index(drop=True)

    # --- Aggregation 2: by_product_season ---
    by_product_season = (
        valid_sales.groupby(
            ["stock_code", "description", "season", "year"], as_index=False
        )
        .agg(
            total_quantity=("quantity", "sum"),
            total_revenue=("revenue", "sum"),
            avg_unit_price=("unit_price", "mean"),
        )
    )
    by_product_season["total_quantity"] = by_product_season["total_quantity"].astype(int)
    by_product_season["total_revenue"] = by_product_season["total_revenue"].round(2)
    by_product_season["avg_unit_price"] = by_product_season["avg_unit_price"].round(2)
    by_product_season = by_product_season.sort_values(
        ["stock_code", "year", "season"]
    ).reset_index(drop=True)

    # --- Top products overall ---
    top_products_overall = (
        valid_sales.groupby(["stock_code", "description"], as_index=False)
        .agg(total_quantity=("quantity", "sum"), total_revenue=("revenue", "sum"))
        .sort_values("total_quantity", ascending=False)
        .head(20)
        .reset_index(drop=True)
    )
    top_products_overall["total_quantity"] = top_products_overall["total_quantity"].astype(int)
    top_products_overall["rank"] = range(1, len(top_products_overall) + 1)
    top_products_overall["total_revenue"] = top_products_overall["total_revenue"].round(2)

    # --- Top by season ---
    top_by_season = {}
    for season_name in ("Winter", "Spring", "Summer", "Autumn"):
        season_data = (
            valid_sales[valid_sales["season"] == season_name]
            .groupby(["stock_code", "description"], as_index=False)
            .agg(total_quantity=("quantity", "sum"))
            .sort_values("total_quantity", ascending=False)
            .head(10)
            .reset_index(drop=True)
        )
        season_data["total_quantity"] = season_data["total_quantity"].astype(int)
        top_by_season[season_name] = season_data.to_dict(orient="records")

    # --- Cancellations summary ---
    total_returned_quantity = abs(int(cancellations["quantity"].sum()))
    total_refund_amount = abs(cancellations["revenue"].sum().round(2))

    top_cancelled = (
        cancellations.groupby(["stock_code", "description"], as_index=False)
        .agg(returned_quantity=("quantity", "sum"))
        .sort_values("returned_quantity", ascending=True)
        .head(10)
        .reset_index(drop=True)
    )
    top_cancelled["returned_quantity"] = top_cancelled["returned_quantity"].abs().astype(int)

    cancellation_by_country = (
        cancellations.groupby("country")
        .size()
        .sort_values(ascending=False)
        .to_dict()
    )

    # --- Metadata ---
    unique_products = int(valid_sales["stock_code"].nunique())
    unique_customers = int(valid_sales["customer_id"].dropna().nunique())
    country_count = int(df["country"].nunique())
    date_min = valid_sales["invoice_date"].min()
    date_max = valid_sales["invoice_date"].max()

    print(
        f"[clean] {len(valid_sales):,} valid sales, "
        f"{len(cancellations):,} cancellations, "
        f"{unique_products} unique products"
    )

    # NOTE: We only return aggregated data (not raw records).
    # The raw valid_sales (531k) and cancellations (10k) are intentionally
    # excluded to avoid serialising ~half a million records between tasks.
    return {
        "by_product_month": by_product_month.to_dict(orient="records"),
        "by_product_season": by_product_season.to_dict(orient="records"),
        "top_products_overall": top_products_overall.to_dict(orient="records"),
        "top_by_season": top_by_season,
        "cancellations_summary": {
            "total_returned_quantity": total_returned_quantity,
            "total_refund_amount": total_refund_amount,
            "top_cancelled_products": top_cancelled.to_dict(orient="records"),
            "cancellation_by_country": cancellation_by_country,
        },
        "metadata": {
            "total_transactions": total_rows,
            "valid_sales_count": len(valid_sales),
            "cancellation_count": len(cancellations),
            "unique_products": unique_products,
            "unique_customers": unique_customers,
            "countries": country_count,
            "date_range": {
                "start": date_min.strftime("%Y-%m-%d") if pd.notna(date_min) else None,
                "end": date_max.strftime("%Y-%m-%d") if pd.notna(date_max) else None,
            },
        },
    }


# ---------------------------------------------------------------------------
# Task 3: Package for Agent
# ---------------------------------------------------------------------------


@task(
    name="package_for_agent",
    description="Assemble the final JSON data package for the downstream AI agent.",
)
def package_for_agent(transformed: dict) -> dict:
    """Build the full output package dict and write it to the output/ directory.

    Returns the output package as a dict.
    """
    meta = transformed["metadata"]
    run_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    output_package = {
        "metadata": {
            "pipeline_run_id": run_id,
            "generated_at": now,
            "source_file": str(CSV_PATH),
            "total_transactions": meta["total_transactions"],
            "valid_sales_count": meta["valid_sales_count"],
            "cancellation_count": meta["cancellation_count"],
            "unique_products": meta["unique_products"],
            "unique_customers": meta["unique_customers"],
            "date_range": meta["date_range"],
            "countries": meta["countries"],
            "pipeline_version": PIPELINE_VERSION,
        },
        "aggregated_sales": {
            "by_product_month": transformed["by_product_month"],
            "by_product_season": transformed["by_product_season"],
            "top_products_overall": transformed["top_products_overall"],
            "top_by_season": transformed["top_by_season"],
        },
        "cancellations_summary": transformed["cancellations_summary"],
    }

    # Write to output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"pipeline-output-{run_id}.json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_package, f, indent=2, ensure_ascii=False)

    print(f"[package] Wrote {len(json.dumps(output_package)):,} bytes to {output_path}")
    return output_package


# ---------------------------------------------------------------------------
# Flow
# ---------------------------------------------------------------------------


@flow(
    name="Seasonal Stock Pipeline",
    description="Ingest, transform, and package ecommerce sales data for AI-driven seasonal stock recommendations.",
)
def seasonal_stock_pipeline(csv_path: str | Path = CSV_PATH) -> dict:
    """Run the full seasonal stock recommendation pipeline.

    Args:
        csv_path: Path to the raw sales CSV file.

    Returns:
        The output package dictionary written to the output/ directory.
    """
    raw = ingest_sales_data(csv_path)
    transformed = clean_and_transform(raw)
    output_package = package_for_agent(transformed)
    return output_package


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------


def main() -> None:
    """CLI entry point invoked via ``uv run run-pipeline``."""
    import sys

    # Allow overriding the CSV path via CLI argument
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else CSV_PATH
    seasonal_stock_pipeline(csv_path=csv_path)


if __name__ == "__main__":
    main()