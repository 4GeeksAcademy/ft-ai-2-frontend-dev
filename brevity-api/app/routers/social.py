"""Follow and like routes."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from sqlmodel import Session, col, select

from app.analytics_client import emit_event
from app.auth import get_current_user, get_user_by_username
from app.database import get_session
from app.models import Follow, Like, Post, User
from app.schemas import FollowUserBrief

router = APIRouter(prefix="/social", tags=["social"])


@router.post("/follow/{username}", status_code=status.HTTP_201_CREATED)
def follow_user(
    username: str,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, str]:
    target = get_user_by_username(session, username)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if target.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself",
        )

    existing = session.exec(
        select(Follow).where(
            Follow.follower_id == current_user.id,
            Follow.followed_id == target.id,
        )
    ).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already following this user",
        )

    session.add(Follow(follower_id=current_user.id, followed_id=target.id))
    session.commit()

    background_tasks.add_task(
        emit_event,
        event_type="follow_created",
        user_id=str(current_user.id),
        metadata={"followed_username": target.username, "followed_id": str(target.id)},
        traceparent=getattr(request.state, "traceparent", None),
    )
    return {"status": "following", "username": target.username}


@router.delete("/follow/{username}", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    username: str,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> None:
    target = get_user_by_username(session, username)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    follow = session.exec(
        select(Follow).where(
            Follow.follower_id == current_user.id,
            Follow.followed_id == target.id,
        )
    ).first()
    if follow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not following this user",
        )

    session.delete(follow)
    session.commit()

    background_tasks.add_task(
        emit_event,
        event_type="follow_removed",
        user_id=str(current_user.id),
        metadata={"followed_username": target.username, "followed_id": str(target.id)},
        traceparent=getattr(request.state, "traceparent", None),
    )


@router.get("/following/{username}", response_model=list[FollowUserBrief])
def list_following(
    username: str,
    session: Annotated[Session, Depends(get_session)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[FollowUserBrief]:
    user = get_user_by_username(session, username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    followed = session.exec(
        select(User)
        .join(Follow, Follow.followed_id == User.id)
        .where(Follow.follower_id == user.id)
        .order_by(col(Follow.created_at).desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return [
        FollowUserBrief(
            id=u.id,
            username=u.username,
            display_name=u.display_name,
            avatar_url=u.avatar_url,
        )
        for u in followed
    ]


@router.get("/followers/{username}", response_model=list[FollowUserBrief])
def list_followers(
    username: str,
    session: Annotated[Session, Depends(get_session)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[FollowUserBrief]:
    user = get_user_by_username(session, username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    followers = session.exec(
        select(User)
        .join(Follow, Follow.follower_id == User.id)
        .where(Follow.followed_id == user.id)
        .order_by(col(Follow.created_at).desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return [
        FollowUserBrief(
            id=u.id,
            username=u.username,
            display_name=u.display_name,
            avatar_url=u.avatar_url,
        )
        for u in followers
    ]


@router.post("/like/{post_id}", status_code=status.HTTP_201_CREATED)
def like_post(
    post_id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, str]:
    post = session.get(Post, post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    existing = session.exec(
        select(Like).where(
            Like.user_id == current_user.id,
            Like.post_id == post.id,
        )
    ).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already liked this post",
        )

    session.add(Like(user_id=current_user.id, post_id=post.id))
    session.commit()

    background_tasks.add_task(
        emit_event,
        event_type="like_created",
        user_id=str(current_user.id),
        metadata={"post_id": str(post.id)},
        traceparent=getattr(request.state, "traceparent", None),
    )
    return {"status": "liked", "post_id": str(post.id)}


@router.delete("/like/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def unlike_post(
    post_id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> None:
    post = session.get(Post, post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    like = session.exec(
        select(Like).where(
            Like.user_id == current_user.id,
            Like.post_id == post.id,
        )
    ).first()
    if like is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found",
        )

    session.delete(like)
    session.commit()

    background_tasks.add_task(
        emit_event,
        event_type="like_removed",
        user_id=str(current_user.id),
        metadata={"post_id": str(post.id)},
        traceparent=getattr(request.state, "traceparent", None),
    )
