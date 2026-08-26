"""Brevity API — with Session 4 OpenTelemetry instrumentation."""

from __future__ import annotations

import logging
import os
import traceback
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.analytics_client import resolve_request_traceparent
from app.cors import cors_origin_regex_from_env, cors_origins_from_env
from app.database import engine
from app.logging_config import configure_logging
from app.metrics import MetricsTimer, metrics_response, record_request
from app.routers import auth, posts, social, users
from app.schemas import HealthResponse
from app.telemetry import (
    instrument_fastapi,
    instrument_httpx,
    setup_telemetry,
    shutdown_telemetry,
)

configure_logging(os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("brevity-api")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if setup_telemetry("brevity-api"):
        instrument_httpx()
        instrument_fastapi(_app)
    yield
    shutdown_telemetry()


app = FastAPI(title="brevity-api", version="0.1.0", lifespan=lifespan)

cors_origins = cors_origins_from_env()
cors_origin_regex = cors_origin_regex_from_env()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(social.router)


@app.middleware("http")
async def attach_traceparent(request: Request, call_next):
    # Prefer incoming W3C header; do not mint a competing ID when OTel owns the span.
    incoming = request.headers.get("traceparent")
    if incoming:
        request.state.traceparent = resolve_request_traceparent(incoming)
    else:
        request.state.traceparent = None

    response = await call_next(request)

    # Echo the active OTel span's traceparent when available.
    try:
        from opentelemetry import trace

        span = trace.get_current_span()
        ctx = span.get_span_context()
        if ctx.is_valid:
            flags = int(ctx.trace_flags)
            tp = f"00-{ctx.trace_id:032x}-{ctx.span_id:016x}-{flags:02x}"
            request.state.traceparent = tp
            response.headers["traceparent"] = tp
        elif getattr(request.state, "traceparent", None):
            response.headers["traceparent"] = request.state.traceparent
    except Exception:
        if getattr(request.state, "traceparent", None):
            response.headers["traceparent"] = request.state.traceparent
    return response


@app.middleware("http")
async def request_timing(request: Request, call_next):
    timer = MetricsTimer()
    response = await call_next(request)
    duration_s = timer.seconds()
    duration_ms = round(duration_s * 1000, 2)
    record_request(
        service="brevity-api",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_s=duration_s,
    )
    logger.info(
        "request completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    response.headers["X-Process-Time-Ms"] = str(duration_ms)
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["traceparent", "X-Process-Time-Ms"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(
        "unhandled exception: %s",
        exc,
        extra={"method": request.method, "path": request.url.path},
    )
    logger.debug(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    db_status = "ok"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        logger.exception("database health check failed")
        db_status = "error"

    status = "ok" if db_status == "ok" else "degraded"
    return HealthResponse(
        status=status,
        service="brevity-api",
        timestamp=datetime.now(timezone.utc).isoformat(),
        database=db_status,
    )


@app.get("/metrics")
def metrics():
    return metrics_response()
