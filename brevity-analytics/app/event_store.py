"""Postgres-backed analytics event store."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from psycopg.types.json import Json

from app.database import get_pool

INSERT_EVENT_SQL = """
INSERT INTO analytics_events (id, event_type, user_id, metadata, created_at)
VALUES (%(id)s, %(event_type)s, %(user_id)s, %(metadata)s, %(created_at)s)
RETURNING id, event_type, user_id, metadata, created_at
"""

LIST_EVENTS_SQL = """
SELECT id, event_type, user_id, metadata, created_at
FROM analytics_events
ORDER BY created_at DESC
LIMIT %(limit)s OFFSET %(offset)s
"""

LIST_EVENTS_BY_TYPE_SQL = """
SELECT id, event_type, user_id, metadata, created_at
FROM analytics_events
WHERE event_type = %(event_type)s
ORDER BY created_at DESC
LIMIT %(limit)s OFFSET %(offset)s
"""

COUNT_EVENTS_SQL = "SELECT COUNT(*) FROM analytics_events"


def _parse_user_id(user_id: str | None) -> uuid.UUID | None:
    if not user_id:
        return None
    try:
        return uuid.UUID(user_id)
    except ValueError:
        return None


def _row_to_event(row: tuple) -> dict[str, Any]:
    event_id, event_type, user_id, metadata, created_at = row
    return {
        "id": str(event_id),
        "event_type": event_type,
        "user_id": str(user_id) if user_id else None,
        "metadata": metadata if isinstance(metadata, dict) else json.loads(metadata),
        "created_at": created_at.isoformat(),
    }


class EventStore:
    def insert_event(
        self,
        *,
        event_type: str,
        user_id: str | None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        event_id = uuid.uuid4()
        created_at = datetime.now(timezone.utc)

        with get_pool().connection() as conn:
            row = conn.execute(
                INSERT_EVENT_SQL,
                {
                    "id": event_id,
                    "event_type": event_type,
                    "user_id": _parse_user_id(user_id),
                    "metadata": Json(metadata or {}),
                    "created_at": created_at,
                },
            ).fetchone()

        if row is None:
            raise RuntimeError("failed to insert analytics event")
        return _row_to_event(row)

    def insert_events_batch(
        self,
        *,
        events: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        if not events:
            return []

        created_at = datetime.now(timezone.utc)
        params_list = [
            {
                "id": uuid.uuid4(),
                "event_type": event["event_type"],
                "user_id": _parse_user_id(event.get("user_id")),
                "metadata": Json(event.get("metadata") or {}),
                "created_at": created_at,
            }
            for event in events
        ]

        rows: list[tuple] = []
        with get_pool().connection() as conn:
            with conn.transaction():
                for params in params_list:
                    row = conn.execute(INSERT_EVENT_SQL, params).fetchone()
                    if row is None:
                        raise RuntimeError("failed to insert analytics event in batch")
                    rows.append(row)

        return [_row_to_event(row) for row in rows]

    def list_events(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
        event_type: str | None = None,
    ) -> list[dict[str, Any]]:
        with get_pool().connection() as conn:
            if event_type:
                rows = conn.execute(
                    LIST_EVENTS_BY_TYPE_SQL,
                    {
                        "event_type": event_type,
                        "limit": limit,
                        "offset": offset,
                    },
                ).fetchall()
            else:
                rows = conn.execute(
                    LIST_EVENTS_SQL,
                    {
                        "limit": limit,
                        "offset": offset,
                    },
                ).fetchall()
        return [_row_to_event(row) for row in rows]

    def count(self) -> int:
        with get_pool().connection() as conn:
            row = conn.execute(COUNT_EVENTS_SQL).fetchone()
        return int(row[0]) if row else 0


event_store = EventStore()
