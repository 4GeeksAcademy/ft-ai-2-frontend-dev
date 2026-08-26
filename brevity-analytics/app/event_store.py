"""TinyDB-backed analytics event store."""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from tinydb import Query, TinyDB
from tinydb.table import Document

DEFAULT_DB_PATH = Path(os.getenv("ANALYTICS_DB_PATH", "data/events.json"))


class EventStore:
    def __init__(self, db_path: Path | None = None) -> None:
        path = db_path or DEFAULT_DB_PATH
        path.parent.mkdir(parents=True, exist_ok=True)
        self._db = TinyDB(path)
        self._events = self._db.table("events")

    def insert_event(
        self,
        *,
        event_type: str,
        user_id: str | None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        event = {
            "id": str(uuid.uuid4()),
            "event_type": event_type,
            "user_id": user_id,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._events.insert(event)
        return event

    def list_events(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
        event_type: str | None = None,
    ) -> list[dict[str, Any]]:
        query = Query()
        if event_type:
            docs: list[Document] = self._events.search(query.event_type == event_type)
        else:
            docs = self._events.all()

        docs_sorted = sorted(
            docs,
            key=lambda doc: doc.get("created_at", ""),
            reverse=True,
        )
        page = docs_sorted[offset : offset + limit]
        return [
            {
                "id": doc["id"],
                "event_type": doc["event_type"],
                "user_id": doc.get("user_id"),
                "metadata": doc.get("metadata", {}),
                "created_at": doc["created_at"],
            }
            for doc in page
        ]

    def count(self) -> int:
        return len(self._events)


event_store = EventStore()
