"""User profile routes."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, col, select

from app.auth import get_current_user, get_optional_user, get_user_by_username
from app.database import get_session
from app.helpers import posts_to_responses, user_to_me, user_to_public
from app.models import Post, User
from app.schemas import PostResponse, ProfileUpdateRequest, UserMe, UserPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserMe)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> UserMe:
    return user_to_me(session, current_user)


@router.patch("/me", response_model=UserMe)
def update_me(
    body: ProfileUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> UserMe:
    if body.display_name is not None:
        current_user.display_name = body.display_name
    if body.bio is not None:
        current_user.bio = body.bio
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return user_to_me(session, current_user)


@router.get("/{username}", response_model=UserPublic)
def get_user_profile(
    username: str,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
) -> UserPublic:
    user = get_user_by_username(session, username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user_to_public(session, user, viewer=current_user)


@router.get("/{username}/posts", response_model=list[PostResponse])
def get_user_posts(
    username: str,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[PostResponse]:
    user = get_user_by_username(session, username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    posts = session.exec(
        select(Post)
        .where(Post.author_id == user.id)
        .order_by(col(Post.created_at).desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return posts_to_responses(
        session,
        list(posts),
        current_user_id=current_user.id if current_user else None,
    )
