"""Supabase Postgres connection pool and schema migrations."""

from __future__ import annotations

import logging
import os
import re
import socket
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlencode, urlparse, urlunparse

from dotenv import load_dotenv
from psycopg_pool import PoolTimeout, ConnectionPool

logger = logging.getLogger("brevity-analytics.database")

MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

_pool: ConnectionPool | None = None


def _load_env() -> None:
    load_dotenv(_PROJECT_ROOT / ".env")


def _encode_password(password: str) -> str:
    """Ensure password is safely percent-encoded for a Postgres URI."""
    return quote(unquote(password), safe="")


def _append_sslmode(url: str) -> str:
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    if "sslmode" not in query:
        query["sslmode"] = ["require"]
    new_query = urlencode({key: values[0] for key, values in query.items()})
    return urlunparse(parsed._replace(query=new_query))


def _resolve_ipv4(hostname: str) -> str | None:
    """Resolve hostname to IPv4 — Docker often lacks IPv6 egress to Supabase."""
    try:
        infos = socket.getaddrinfo(
            hostname,
            None,
            family=socket.AF_INET,
            type=socket.SOCK_STREAM,
        )
        if infos:
            return infos[0][4][0]
    except socket.gaierror:
        logger.warning("could not resolve %s to IPv4", hostname)
    return None


def _prefer_ipv4(url: str) -> str:
    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname or hostname in ("localhost", "127.0.0.1"):
        return url

    # Supabase pooler routes tenants via SNI hostname; hostaddr bypasses SNI.
    if hostname.endswith(".pooler.supabase.com"):
        return url

    query = parse_qs(parsed.query)
    if "hostaddr" in query:
        return url

    ipv4 = _resolve_ipv4(hostname)
    if not ipv4:
        return url

    query["hostaddr"] = [ipv4]
    new_query = urlencode({key: values[0] for key, values in query.items()})
    return urlunparse(parsed._replace(query=new_query))


def _validate_supabase_pooler_url(url: str) -> None:
    """Supavisor requires postgres.[project-ref] in the username for shared pooler."""
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    if not hostname.endswith(".pooler.supabase.com"):
        return

    username = unquote(parsed.username or "")
    if "." not in username:
        raise RuntimeError(
            "SUPABASE_DB_URL uses the Supabase pooler but the username is missing "
            "the project reference. Use postgres.[project-ref] (not just 'postgres'). "
            "Copy the Session or Transaction pooler URI from Supabase → Project Settings "
            "→ Database → Connection string."
        )


def normalize_db_url(url: str) -> str:
    """Convert SQLAlchemy-style URLs and ensure SSL for Supabase."""
    url = url.replace("postgresql+psycopg://", "postgresql://", 1)

    match = re.match(
        r"^(postgresql://)([^@/]+)@(.+)$",
        url,
    )
    if match:
        scheme, credentials, host_part = match.groups()
        if ":" in credentials:
            user, password = credentials.split(":", 1)
            credentials = f"{user}:{_encode_password(password)}"
        url = f"{scheme}{credentials}@{host_part}"

    url = _prefer_ipv4(_append_sslmode(url))
    _validate_supabase_pooler_url(url)
    return url


def get_db_url() -> str:
    _load_env()
    url = os.getenv("SUPABASE_DB_URL", "").strip()
    if not url:
        raise RuntimeError(
            "SUPABASE_DB_URL is not set. Add it to the project root .env file."
        )
    return normalize_db_url(url)


def _ensure_schema_migrations_table(conn) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )


def _split_sql(sql: str) -> list[str]:
    return [part.strip() for part in sql.split(";") if part.strip()]


def run_migrations(conn) -> None:
    _ensure_schema_migrations_table(conn)
    applied = {
        row[0]
        for row in conn.execute("SELECT version FROM schema_migrations").fetchall()
    }

    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        version = path.stem
        if version in applied:
            continue
        logger.info("applying migration %s", version)
        for statement in _split_sql(path.read_text(encoding="utf-8")):
            conn.execute(statement)
        conn.execute(
            "INSERT INTO schema_migrations (version) VALUES (%s)",
            (version,),
        )


def init_database() -> ConnectionPool:
    global _pool
    if _pool is not None:
        return _pool

    conninfo = get_db_url()
    pool = ConnectionPool(
        conninfo=conninfo,
        min_size=1,
        max_size=5,
        timeout=30,
        open=False,
    )
    pool.open()
    try:
        pool.wait()
    except PoolTimeout as exc:
        raise RuntimeError(
            "Could not connect to Supabase Postgres. "
            "If using the shared pooler (*.pooler.supabase.com), ensure the username "
            "is postgres.[project-ref] copied from Supabase Dashboard. "
            "If running in Docker, ensure outbound internet access and SUPABASE_DB_URL "
            "is set in the project root .env."
        ) from exc

    with pool.connection() as conn:
        with conn.transaction():
            run_migrations(conn)

    _pool = pool
    logger.info("database pool ready")
    return pool


def get_pool() -> ConnectionPool:
    if _pool is None:
        raise RuntimeError("Database not initialized — call init_database() first")
    return _pool


def close_database() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None
        logger.info("database pool closed")


def check_connection() -> bool:
    with get_pool().connection() as conn:
        conn.execute("SELECT 1")
    return True
