"""Brevity API — Session 1 backend foundation."""

from __future__ import annotations

import logging
import os
import time
import traceback
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.analytics_client import resolve_request_traceparent
from app.database import engine
from app.logging_config import configure_logging
from app.routers import auth, posts, social, users
from app.schemas import HealthResponse

configure_logging(os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("brevity-api")

app = FastAPI(title="brevity-api", version="0.1.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(social.router)


@app.middleware("http")
async def attach_traceparent(request: Request, call_next):
    traceparent = resolve_request_traceparent(request.headers.get("traceparent"))
    request.state.traceparent = traceparent
    response = await call_next(request)
    response.headers["traceparent"] = traceparent
    return response


@app.middleware("http")
async def request_timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
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
