"""Post create, timeline, fetch, and delete routes."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from sqlmodel import Session, col, or_, select

from app.analytics_client import emit_event
from app.auth import get_current_user, get_optional_user, get_user_by_username
from app.database import get_session
from app.helpers import posts_to_responses
from app.models import Follow, Like, Post, User
from app.schemas import MENTION_RE, PostCreateRequest, PostResponse

router = APIRouter(prefix="/posts", tags=["posts"])


def _otel_context():
    try:
        from opentelemetry import context

        return context.get_current()
    except Exception:
        return None


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    body: PostCreateRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> PostResponse:
    content = body.content
    is_mention = bool(MENTION_RE.match(content))
    mentioned_user_id: uuid.UUID | None = None

    if is_mention:
        mentioned = get_user_by_username(session, content[1:])
        if mentioned is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentioned user not found",
            )
        mentioned_user_id = mentioned.id

    post = Post(
        author_id=current_user.id,
        content=content,
        is_mention=is_mention,
        mentioned_user_id=mentioned_user_id,
    )
    session.add(post)
    session.commit()
    session.refresh(post)

    background_tasks.add_task(
        emit_event,
        event_type="post_created",
        user_id=str(current_user.id),
        metadata={
            "post_id": str(post.id),
            "content_length": len(post.content),
            "is_mention": post.is_mention,
        },
        traceparent=getattr(request.state, "traceparent", None),
        otel_context=_otel_context(),
    )

    return posts_to_responses(
        session, [post], current_user_id=current_user.id
    )[0]


@router.get("/timeline", response_model=list[PostResponse])
def get_timeline(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[PostResponse]:
    followed_ids = session.exec(
        select(Follow.followed_id).where(Follow.follower_id == current_user.id)
    ).all()

    conditions = [
        Post.author_id == current_user.id,
        Post.mentioned_user_id == current_user.id,
    ]
    if followed_ids:
        conditions.append(col(Post.author_id).in_(list(followed_ids)))

    posts = session.exec(
        select(Post)
        .where(or_(*conditions))
        .order_by(col(Post.created_at).desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return posts_to_responses(
        session, list(posts), current_user_id=current_user.id
    )


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: uuid.UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
) -> PostResponse:
    post = session.get(Post, post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    return posts_to_responses(
        session,
        [post],
        current_user_id=current_user.id if current_user else None,
    )[0]


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
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
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another user's post",
        )

    likes = session.exec(select(Like).where(Like.post_id == post.id)).all()
    for like in likes:
        session.delete(like)
    session.delete(post)
    session.commit()

    background_tasks.add_task(
        emit_event,
        event_type="post_deleted",
        user_id=str(current_user.id),
        metadata={"post_id": str(post_id)},
        traceparent=getattr(request.state, "traceparent", None),
        otel_context=_otel_context(),
    )
