"""Serialize query results to CSV, JSON, or YAML."""

from __future__ import annotations

import csv
import io
import json
from typing import Any

import yaml
from pydantic import BaseModel


def _to_plain(data: Any) -> Any:
    if isinstance(data, BaseModel):
        return data.model_dump(mode="json")
    if isinstance(data, list):
        return [_to_plain(item) for item in data]
    if isinstance(data, dict):
        return {key: _to_plain(value) for key, value in data.items()}
    return data


def _flatten_for_csv(data: Any) -> list[dict[str, Any]]:
    plain = _to_plain(data)

    if isinstance(plain, list):
        if not plain:
            return []
        if all(isinstance(item, dict) for item in plain):
            rows: list[dict[str, Any]] = []
            for item in plain:
                flat = dict(item)
                if "matches" in flat and isinstance(flat["matches"], list):
                    flat["matches"] = json.dumps(flat["matches"])
                rows.append(flat)
            return rows
        return [{"value": item} for item in plain]

    if isinstance(plain, dict):
        flat = dict(plain)
        if "matches" in flat and isinstance(flat["matches"], list):
            flat["matches"] = json.dumps(flat["matches"])
        return [flat]

    return [{"value": plain}]


def format_output(data: Any, fmt: str) -> str:
    plain = _to_plain(data)

    if fmt == "json":
        return json.dumps(plain, indent=2) + "\n"

    if fmt == "yaml":
        return yaml.safe_dump(plain, sort_keys=False, allow_unicode=True)

    if fmt == "csv":
        rows = _flatten_for_csv(data)
        if not rows:
            return ""
        fieldnames: list[str] = []
        for row in rows:
            for key in row:
                if key not in fieldnames:
                    fieldnames.append(key)
        buffer = io.StringIO()
        writer = csv.DictWriter(buffer, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        return buffer.getvalue()

    raise ValueError(f"Unsupported format: {fmt}")
