"""Prometheus /metrics helpers."""

from __future__ import annotations

import time

from fastapi import Request, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

REQUEST_COUNT = Counter(
    "brevity_http_requests_total",
    "HTTP requests",
    ["service", "method", "path", "status"],
)
REQUEST_LATENCY = Histogram(
    "brevity_http_request_duration_seconds",
    "HTTP request latency",
    ["service", "method", "path"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0),
)


def record_request(
    *,
    service: str,
    method: str,
    path: str,
    status_code: int,
    duration_s: float,
) -> None:
    route = path.split("?")[0]
    if len(route) > 64:
        route = route[:64]
    REQUEST_COUNT.labels(service, method, route, str(status_code)).inc()
    REQUEST_LATENCY.labels(service, method, route).observe(duration_s)


def metrics_response() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


class MetricsTimer:
    def __init__(self) -> None:
        self.start = time.perf_counter()

    def seconds(self) -> float:
        return time.perf_counter() - self.start
