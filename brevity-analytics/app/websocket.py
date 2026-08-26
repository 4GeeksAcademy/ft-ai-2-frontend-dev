"""WebSocket connection manager for live analytics events."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger("brevity-analytics.ws")


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.add(websocket)
        logger.info("websocket connected", extra={"clients": len(self._connections)})

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(websocket)
        logger.info(
            "websocket disconnected",
            extra={"clients": len(self._connections)},
        )

    async def broadcast(self, message: dict[str, Any]) -> None:
        async with self._lock:
            clients = list(self._connections)

        stale: list[WebSocket] = []
        for client in clients:
            try:
                await client.send_json(message)
            except Exception:
                logger.exception("failed to send websocket message")
                stale.append(client)

        for client in stale:
            await self.disconnect(client)


ws_manager = ConnectionManager()
