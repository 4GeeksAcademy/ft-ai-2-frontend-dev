"""Brevity Analytics — with Session 4 OpenTelemetry instrumentation."""

from __future__ import annotations

import logging
import os
import traceback
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query, Request, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.cors import cors_origin_regex_from_env, cors_origins_from_env
from app.database import check_connection, close_database, init_database
from app.event_store import event_store
from app.logging_config import configure_logging
from app.metrics import MetricsTimer, metrics_response, record_request
from app.schemas import (
    EventBatchCreateRequest,
    EventBatchResponse,
    EventCreateRequest,
    EventResponse,
    HealthResponse,
)
from app.telemetry import get_tracer, instrument_fastapi, setup_telemetry, shutdown_telemetry
from app.websocket import ws_manager

configure_logging(os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("brevity-analytics")

BATCH_MAX_SIZE = int(os.getenv("ANALYTICS_BATCH_MAX_SIZE", "100"))


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_database()
    if setup_telemetry("brevity-analytics"):
        instrument_fastapi(_app)
    yield
    close_database()
    shutdown_telemetry()


app = FastAPI(title="brevity-analytics", version="0.1.0", lifespan=lifespan)

cors_origins = cors_origins_from_env()
cors_origin_regex = cors_origin_regex_from_env()
logger.info(
    "cors configured origins=%s regex=%s",
    cors_origins,
    cors_origin_regex,
)


@app.middleware("http")
async def request_timing(request: Request, call_next):
    timer = MetricsTimer()
    response = await call_next(request)
    duration_s = timer.seconds()
    duration_ms = round(duration_s * 1000, 2)
    record_request(
        service="brevity-analytics",
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
    events_stored: int | None = None
    try:
        check_connection()
        events_stored = event_store.count()
    except Exception:
        logger.exception("database health check failed")
        db_status = "error"

    status = "ok" if db_status == "ok" else "degraded"
    return HealthResponse(
        status=status,
        service="brevity-analytics",
        timestamp=datetime.now(timezone.utc).isoformat(),
        database=db_status,
        events_stored=events_stored,
    )


@app.get("/metrics")
def metrics():
    return metrics_response()


@app.post(
    "/analytics/event",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_event(request: Request, body: EventCreateRequest) -> EventResponse:
    traceparent = request.headers.get("traceparent")
    token = None
    try:
        from opentelemetry import context as otel_context
        from opentelemetry.propagate import extract

        carrier = {k.lower(): v for k, v in request.headers.items()}
        token = otel_context.attach(extract(carrier))
    except Exception:
        token = None

    try:
        tracer = get_tracer("brevity-analytics")
        with tracer.start_as_current_span("analytics.store_event") as span:
            span.set_attribute("analytics.event_type", body.event_type)
            if traceparent:
                span.set_attribute("messaging.traceparent", traceparent)
            event = event_store.insert_event(
                event_type=body.event_type,
                user_id=body.user_id,
                metadata=body.metadata,
            )
            await ws_manager.broadcast(event)
            logger.info(
                "event stored",
                extra={
                    "path": "/analytics/event",
                    "method": "POST",
                    "status_code": 201,
                },
            )
            if traceparent:
                logger.info(
                    "received traceparent=%s for event_type=%s",
                    traceparent,
                    body.event_type,
                )
            return EventResponse(**event)
    finally:
        if token is not None:
            try:
                from opentelemetry import context as otel_context

                otel_context.detach(token)
            except Exception:
                pass


@app.post(
    "/analytics/events",
    response_model=EventBatchResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_events_batch(
    request: Request,
    body: EventBatchCreateRequest,
) -> EventBatchResponse:
    batch_size = len(body.events)
    if batch_size > BATCH_MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Batch size {batch_size} exceeds maximum of {BATCH_MAX_SIZE}",
        )

    traceparent = request.headers.get("traceparent")
    token = None
    try:
        from opentelemetry import context as otel_context
        from opentelemetry.propagate import extract

        carrier = {k.lower(): v for k, v in request.headers.items()}
        token = otel_context.attach(extract(carrier))
    except Exception:
        token = None

    try:
        tracer = get_tracer("brevity-analytics")
        with tracer.start_as_current_span("analytics.store_events_batch") as span:
            span.set_attribute("analytics.batch_size", batch_size)
            if traceparent:
                span.set_attribute("messaging.traceparent", traceparent)
            stored = event_store.insert_events_batch(
                events=[
                    {
                        "event_type": event.event_type,
                        "user_id": event.user_id,
                        "metadata": event.metadata,
                    }
                    for event in body.events
                ],
            )
            for event in stored:
                await ws_manager.broadcast(event)
            logger.info(
                "event batch stored",
                extra={
                    "path": "/analytics/events",
                    "method": "POST",
                    "status_code": 201,
                    "count": batch_size,
                },
            )
            if traceparent:
                logger.info(
                    "received traceparent=%s for batch_size=%s",
                    traceparent,
                    batch_size,
                )
            responses = [EventResponse(**event) for event in stored]
            return EventBatchResponse(events=responses, count=len(responses))
    finally:
        if token is not None:
            try:
                from opentelemetry import context as otel_context

                otel_context.detach(token)
            except Exception:
                pass


@app.get("/analytics/events", response_model=list[EventResponse])
def list_events(
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    event_type: Annotated[str | None, Query()] = None,
) -> list[EventResponse]:
    events = event_store.list_events(
        limit=limit,
        offset=offset,
        event_type=event_type,
    )
    return [EventResponse(**event) for event in events]


@app.websocket("/analytics/ws")
async def analytics_ws(websocket: WebSocket) -> None:
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception:
        logger.exception("websocket error")
        await ws_manager.disconnect(websocket)
