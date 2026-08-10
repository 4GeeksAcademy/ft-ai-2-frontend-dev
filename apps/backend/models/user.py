"""Pydantic User model."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from exceptions import password_too_long


class UserCreate(BaseModel):
    """Request body for user registration."""

    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=1, max_length=100)

    @field_validator("password")
    @classmethod
    def password_max_length(cls, v: str) -> str:
        if len(v) > 128:
            raise password_too_long()
        return v


class UserLogin(BaseModel):
    """Request body for user login."""

    email: EmailStr
    password: str


class User(BaseModel):
    """Internal User representation stored in TinyDB."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    email: EmailStr
    password: str  # Stored as bcrypt hash, never plaintext
    display_name: str
    gravatar_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class UserPublic(BaseModel):
    """Public-facing User response (never exposes password)."""

    id: uuid.UUID
    email: EmailStr
    display_name: str
    gravatar_url: str


class UserUpdate(BaseModel):
    """Request body for updating a user (all fields optional)."""

    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    gravatar_url: str | None = None

    @field_validator("password")
    @classmethod
    def password_max_length(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 128:
            raise password_too_long()
        return v