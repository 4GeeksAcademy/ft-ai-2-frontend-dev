"""User management router — GET /user/{id}, PATCH /user/{id}."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from passlib.context import CryptContext

from database import get_db
from dependencies import get_current_user
from exceptions import (
    forbidden,
    invalid_user_id,
    password_too_long,
    user_not_found,
)
from models.user import User, UserPublic, UserUpdate

router = APIRouter(prefix="/user", tags=["users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _parse_user_id(raw: str) -> uuid.UUID:
    """Parse a UUID from a string, raising invalid_user_id on failure."""
    try:
        return uuid.UUID(raw)
    except ValueError:
        raise invalid_user_id()


def _find_user_by_uuid(users_table, user_uuid: uuid.UUID) -> tuple[User, int]:
    """Find a user by UUID. Returns (User, doc_id) or raises user_not_found."""
    matching = users_table.search(
        lambda doc: doc.get("id") == str(user_uuid)
    )
    if not matching:
        raise user_not_found()
    doc = matching[0]
    user = User.model_validate(doc)
    return user, doc.doc_id


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: str) -> UserPublic:
    """Return a user's public profile by UUID. No auth required."""
    db = get_db()
    users_table = db.table("users")

    user_uuid = _parse_user_id(user_id)
    user, _doc_id = _find_user_by_uuid(users_table, user_uuid)

    return UserPublic.model_validate(user)


@router.patch("/{user_id}", response_model=UserPublic)
def update_user(
    user_id: str,
    body: UserUpdate,
    current_user: UserPublic = Depends(get_current_user),
) -> UserPublic:
    """Update a user's profile. The requester must be the target user."""
    db = get_db()
    users_table = db.table("users")

    user_uuid = _parse_user_id(user_id)

    # Only allow users to update their own profile
    if current_user.id != user_uuid:
        raise forbidden()

    user, doc_id = _find_user_by_uuid(users_table, user_uuid)
    update_data = body.model_dump(exclude_unset=True)

    if "email" in update_data:
        user.email = update_data["email"]
        user.gravatar_url = _gravatar_url(update_data["email"])
    if "password" in update_data:
        if len(update_data["password"]) > 128:
            raise password_too_long()
        user.password = pwd_context.hash(update_data["password"])
    if "display_name" in update_data:
        user.display_name = update_data["display_name"]
    if "gravatar_url" in update_data:
        user.gravatar_url = update_data["gravatar_url"]

    user.updated_at = datetime.now(UTC)
    serialized = user.model_dump(mode="json")
    users_table.update(serialized, doc_ids=[doc_id])

    return UserPublic.model_validate(user)


def _gravatar_url(email: str) -> str:
    """Return the Gravatar URL for a given email address."""
    import hashlib
    email_hash = hashlib.md5(email.strip().lower().encode()).hexdigest()
    return f"https://www.gravatar.com/avatar/{email_hash}?d=identicon&s=200"