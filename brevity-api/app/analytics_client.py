"""Outbound analytics event emission with W3C traceparent propagation."""

from __future__ import annotations

import logging
import os
import secrets
from typing import Any

import httpx

logger = logging.getLogger("brevity-api.analytics")

ANALYTICS_URL = os.getenv("ANALYTICS_URL", "http://localhost:8001").rstrip("/")
TRACEPARENT_RE_PARTS = 4


def make_traceparent() -> str:
    return f"00-{secrets.token_hex(16)}-{secrets.token_hex(8)}-01"


def continue_trace(traceparent: str | None) -> str:
    """Keep trace_id, mint a new span id for the outbound analytics call."""
    if not traceparent:
        return make_traceparent()
    parts = traceparent.strip().split("-")
    if len(parts) != TRACEPARENT_RE_PARTS:
        return make_traceparent()
    version, trace_id, _span_id, flags = parts
    if len(trace_id) != 32 or len(flags) != 2:
        return make_traceparent()
    return f"{version}-{trace_id}-{secrets.token_hex(8)}-{flags}"


def resolve_request_traceparent(header_value: str | None) -> str:
    if header_value and len(header_value.strip().split("-")) == TRACEPARENT_RE_PARTS:
        return header_value.strip()
    return make_traceparent()


def emit_event(
    *,
    event_type: str,
    user_id: str | None,
    metadata: dict[str, Any] | None = None,
    traceparent: str | None = None,
) -> None:
    """Best-effort emit; never raise into the request path."""
    outbound_tp = continue_trace(traceparent)
    payload = {
        "event_type": event_type,
        "user_id": user_id,
        "metadata": {
            **(metadata or {}),
            "traceparent": outbound_tp,
        },
    }
    headers = {
        "Content-Type": "application/json",
        "traceparent": outbound_tp,
    }
    try:
        with httpx.Client(timeout=2.0) as client:
            response = client.post(
                f"{ANALYTICS_URL}/analytics/event",
                json=payload,
                headers=headers,
            )
            if response.status_code >= 400:
                logger.warning(
                    "analytics emit rejected",
                    extra={
                        "status_code": response.status_code,
                        "path": "/analytics/event",
                    },
                )
            else:
                logger.info(
                    "analytics event emitted",
                    extra={
                        "path": "/analytics/event",
                        "method": "POST",
                        "status_code": response.status_code,
                    },
                )
    except Exception:
        logger.warning("analytics emit failed", exc_info=True)
