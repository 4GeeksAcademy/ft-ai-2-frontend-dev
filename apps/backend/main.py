"""FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import backup_db, get_db
from exceptions import AppException, app_exception_handler, generic_exception_handler
from routers import auth, users


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Application lifespan — runs on startup and shutdown."""
    # Startup: ensure the database is initialised
    get_db()
    yield
    # Shutdown: create a backup
    try:
        backup_db()
    except FileNotFoundError:
        pass  # No database file to back up yet


app = FastAPI(
    title="ft-ai-2-frontend-dev API",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Exception handlers — consistent error envelope
# ---------------------------------------------------------------------------

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(users.router)


@app.get("/health")
def health_check() -> dict:
    """Simple health-check endpoint."""
    return {"status": "ok"}