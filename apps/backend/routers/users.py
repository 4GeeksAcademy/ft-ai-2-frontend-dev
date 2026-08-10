"""User management router — GET /user/{id}, PATCH /user/{id}."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from database import get_db
from dependencies import get_current_user
from models.user import User, UserPublic, UserUpdate

router = APIRouter(prefix="/user", tags=["users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: str, current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    """Return a user's public profile by ID."""
    db = get_db()
    users_table = db.table("users")

    try:
        doc_id = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid user ID",
        )

    doc = users_table.get(doc_id=doc_id)
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user = User.model_validate({**doc, "id": str(doc_id)})
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

    try:
        doc_id = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid user ID",
        )

    # Only allow users to update their own profile
    if current_user.id != str(doc_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile",
        )

    doc = users_table.get(doc_id=doc_id)
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user = User.model_validate({**doc, "id": str(doc_id)})
    update_data = body.model_dump(exclude_unset=True)

    if "email" in update_data:
        user.email = update_data["email"]
    if "password" in update_data:
        user.hashed_password = pwd_context.hash(update_data["password"])

    user.updated_at = datetime.now(timezone.utc)
    serialized = user.model_dump(mode="json")
    users_table.update(serialized, doc_ids=[doc_id])

    return UserPublic.model_validate(user)