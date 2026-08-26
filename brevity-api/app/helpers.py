"""Shared helpers for route handlers."""

from __future__ import annotations

import hashlib
import uuid
from collections.abc import Iterable

from sqlmodel import Session, col, func, select

from app.models import Follow, Like, Post, User
from app.schemas import AuthorBrief, PostResponse, UserMe, UserPublic


def gravatar_url(email: str, size: int = 200) -> str:
    digest = hashlib.md5(email.strip().lower().encode("utf-8")).hexdigest()
    return f"https://www.gravatar.com/avatar/{digest}?d=identicon&s={size}"


def count_posts(session: Session, user_id: uuid.UUID) -> int:
    return session.exec(
        select(func.count()).select_from(Post).where(Post.author_id == user_id)
    ).one()


def count_followers(session: Session, user_id: uuid.UUID) -> int:
    return session.exec(
        select(func.count())
        .select_from(Follow)
        .where(Follow.followed_id == user_id)
    ).one()


def count_following(session: Session, user_id: uuid.UUID) -> int:
    return session.exec(
        select(func.count())
        .select_from(Follow)
        .where(Follow.follower_id == user_id)
    ).one()


def user_to_public(
    session: Session,
    user: User,
    *,
    viewer: User | None = None,
) -> UserPublic:
    is_following: bool | None = None
    if viewer is not None and viewer.id != user.id:
        is_following = (
            session.exec(
                select(Follow).where(
                    Follow.follower_id == viewer.id,
                    Follow.followed_id == user.id,
                )
            ).first()
            is not None
        )

    return UserPublic(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        post_count=count_posts(session, user.id),
        follower_count=count_followers(session, user.id),
        following_count=count_following(session, user.id),
        created_at=user.created_at,
        is_following=is_following,
    )


def user_to_me(session: Session, user: User) -> UserMe:
    public = user_to_public(session, user)
    return UserMe(**public.model_dump(), email=user.email)


def like_counts_for_posts(
    session: Session, post_ids: Iterable[uuid.UUID]
) -> dict[uuid.UUID, int]:
    ids = list(post_ids)
    if not ids:
        return {}
    rows = session.exec(
        select(Like.post_id, func.count())
        .where(col(Like.post_id).in_(ids))
        .group_by(Like.post_id)
    ).all()
    return {post_id: count for post_id, count in rows}


def liked_post_ids_for_user(
    session: Session,
    user_id: uuid.UUID,
    post_ids: Iterable[uuid.UUID],
) -> set[uuid.UUID]:
    ids = list(post_ids)
    if not ids:
        return set()
    rows = session.exec(
        select(Like.post_id).where(
            Like.user_id == user_id,
            col(Like.post_id).in_(ids),
        )
    ).all()
    return set(rows)


def posts_to_responses(
    session: Session,
    posts: list[Post],
    *,
    current_user_id: uuid.UUID | None = None,
) -> list[PostResponse]:
    if not posts:
        return []

    author_ids = {post.author_id for post in posts}
    authors = {
        user.id: user
        for user in session.exec(select(User).where(col(User.id).in_(author_ids))).all()
    }
    counts = like_counts_for_posts(session, [post.id for post in posts])
    liked = (
        liked_post_ids_for_user(session, current_user_id, [post.id for post in posts])
        if current_user_id is not None
        else set()
    )

    responses: list[PostResponse] = []
    for post in posts:
        author = authors[post.author_id]
        responses.append(
            PostResponse(
                id=post.id,
                author=AuthorBrief(
                    username=author.username,
                    display_name=author.display_name,
                ),
                content=post.content,
                is_mention=post.is_mention,
                like_count=counts.get(post.id, 0),
                liked_by_me=post.id in liked,
                created_at=post.created_at,
            )
        )
    return responses
