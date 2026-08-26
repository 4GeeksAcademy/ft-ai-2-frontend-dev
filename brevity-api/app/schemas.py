"""Pydantic request/response schemas."""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

WORD_RE = re.compile(r"^[a-zA-Z0-9]+$")
MENTION_RE = re.compile(r"^@[a-zA-Z0-9_]+$")
USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]+$")


# --- Auth ---


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=6, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not USERNAME_RE.match(value):
            raise ValueError(
                "username must contain only letters, numbers, and underscores"
            )
        return value.lower()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserBrief(BaseModel):
    id: uuid.UUID
    email: EmailStr
    username: str
    display_name: str


class RegisterResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    username: str
    display_name: str
    token: str


class LoginResponse(BaseModel):
    token: str
    user: UserBrief


# --- Users ---


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=64)
    bio: Optional[str] = Field(default=None, max_length=160)


class UserPublic(BaseModel):
    id: uuid.UUID
    username: str
    display_name: str
    bio: str
    avatar_url: Optional[str]
    post_count: int
    follower_count: int
    following_count: int
    created_at: datetime
    is_following: Optional[bool] = None


class UserMe(UserPublic):
    email: EmailStr


# --- Posts ---


class PostCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=200)

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        content = value.strip()
        if len(content) > 200:
            raise ValueError("content must be at most 200 characters")
        if WORD_RE.match(content) or MENTION_RE.match(content):
            return content
        raise ValueError(
            "content must be a single word (letters/numbers) or @username mention"
        )


class AuthorBrief(BaseModel):
    username: str
    display_name: str


class PostResponse(BaseModel):
    id: uuid.UUID
    author: AuthorBrief
    content: str
    is_mention: bool
    like_count: int
    liked_by_me: bool = False
    created_at: datetime


# --- Social ---


class FollowUserBrief(BaseModel):
    id: uuid.UUID
    username: str
    display_name: str
    avatar_url: Optional[str]


# --- Health ---


class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: str
    database: Optional[str] = None
