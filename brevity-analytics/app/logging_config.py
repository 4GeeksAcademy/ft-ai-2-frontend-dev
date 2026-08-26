"""Structured JSON logging for brevity-analytics."""

from __future__ import annotations

import json
import logging
import re
import sys
from datetime import datetime, timezone
from typing import Any

_ANSI_RE = re.compile(r"\x1b\[[0-9;]*m")


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": _ANSI_RE.sub("", record.levelname),
            "logger": record.name,
            "message": _ANSI_RE.sub("", record.getMessage()),
            "service": "brevity-analytics",
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        for key in ("path", "method", "status_code", "duration_ms", "clients"):
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value
        return json.dumps(payload, default=str)


def configure_logging(level: str = "INFO") -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    log_level = level.upper()

    for name in (
        "",
        "uvicorn",
        "uvicorn.error",
        "uvicorn.access",
        "brevity-analytics",
        "brevity-analytics.ws",
    ):
        logger = logging.getLogger(name)
        logger.handlers.clear()
        logger.addHandler(handler)
        logger.setLevel(log_level)
        logger.propagate = False
