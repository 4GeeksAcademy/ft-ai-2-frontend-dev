"""Analytics request/response schemas."""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

EventType = Literal[
    "page_view",
    "post_created",
    "post_deleted",
    "like_created",
    "like_removed",
    "follow_created",
    "follow_removed",
]


class EventCreateRequest(BaseModel):
    event_type: EventType
    user_id: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class EventResponse(BaseModel):
    id: str
    event_type: str
    user_id: Optional[str]
    metadata: dict[str, Any]
    created_at: str


class EventBatchCreateRequest(BaseModel):
    events: list[EventCreateRequest] = Field(..., min_length=1)


class EventBatchResponse(BaseModel):
    events: list[EventResponse]
    count: int


class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: str
    database: str | None = None
    events_stored: int | None = None
