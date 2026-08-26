"""Brevity Analytics — Session 1 event store + WebSocket skeleton."""

from __future__ import annotations

import logging
import os
import time
import traceback
from datetime import datetime, timezone
from typing import Annotated

from fastapi import FastAPI, Query, Request, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.event_store import event_store
from app.logging_config import configure_logging
from app.schemas import EventCreateRequest, EventResponse, HealthResponse
from app.websocket import ws_manager

configure_logging(os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("brevity-analytics")

app = FastAPI(title="brevity-analytics", version="0.1.0")

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
    return HealthResponse(
        status="ok",
        service="brevity-analytics",
        timestamp=datetime.now(timezone.utc).isoformat(),
        events_stored=event_store.count(),
    )


@app.post(
    "/analytics/event",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_event(request: Request, body: EventCreateRequest) -> EventResponse:
    traceparent = request.headers.get("traceparent")
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
            # Keep the connection alive; clients may send pings/text.
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception:
        logger.exception("websocket error")
        await ws_manager.disconnect(websocket)
