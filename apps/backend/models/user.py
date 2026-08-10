"""Pydantic User model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Request body for user registration."""

    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    """Request body for user login."""

    email: EmailStr
    password: str


class User(BaseModel):
    """Internal User representation stored in TinyDB."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserPublic(BaseModel):
    """Public-facing User response (never exposes password)."""

    id: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """Request body for updating a user (all fields optional)."""

    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)