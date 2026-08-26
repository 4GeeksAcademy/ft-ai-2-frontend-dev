"""Shared CORS helpers for local Compose + Swagger origins."""

from __future__ import annotations

import os


DEFAULT_CORS_ORIGINS = ",".join(
    [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8001",
    ]
)

# Swagger UI "Try it out" runs as Origin http://localhost:8001 (or 127.0.0.1);
# the Next app uses :3000. Allow any localhost/127.0.0.1 port in local demos.
DEFAULT_CORS_ORIGIN_REGEX = r"https?://(localhost|127\.0\.0\.1)(:\d+)?"


def cors_origins_from_env() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def cors_origin_regex_from_env() -> str | None:
    value = os.getenv("CORS_ORIGIN_REGEX", DEFAULT_CORS_ORIGIN_REGEX).strip()
    return value or None
