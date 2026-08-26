"""Database engine and session helpers."""

from __future__ import annotations

import os
from collections.abc import Generator

from sqlmodel import Session, create_engine

DB_URL = os.getenv(
    "DB_URL",
    "postgresql+psycopg://brevity:brevity@localhost:5432/brevity",
)

engine = create_engine(DB_URL, echo=False, pool_pre_ping=True)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
