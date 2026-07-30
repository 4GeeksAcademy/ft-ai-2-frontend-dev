from fastapi import APIRouter, HTTPException, Query

from src.scratching_post_api.models.post import PostCreate, PostRead, PostReadMany, PostUpdate
from src.scratching_post_api.repositories.registry import post_repo, user_repo

router = APIRouter(prefix="/post", tags=["posts"])


@router.get("/{post_id}", response_model=PostRead)
async def read_post(post_id: int):
    """Read a single post by its ID."""
    post = post_repo.get_by_id(post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    return PostRead(
        id=post.id,
        content=post.content,
        author=post.author,
        response_to=post.response_to,
        created=post.created,
        media=post.media,
    )


@router.get("", response_model=PostReadMany)
async def read_posts(
    offset: int = Query(0, ge=0),
    count: int | None = Query(None, ge=1),
):
    """Read multiple posts with pagination."""
    return post_repo.get_many(offset=offset, count=count)


@router.post("", response_model=PostRead, status_code=200)
async def create_post(post_create: PostCreate):
    """Create a new post."""
    post = post_repo.create(post_create)

    # Sync the post into the author's user profile
    if post.author is not None:
        user_repo.add_post(post.author, post)

    return PostRead(
        id=post.id,
        content=post.content,
        author=post.author,
        response_to=post.response_to,
        created=post.created,
        media=post.media,
    )


@router.patch("", response_model=PostRead)
async def update_post(
    post_id: int = Query(..., ge=1),
    post_update: PostUpdate = ...,
):
    """Update an existing post."""
    post = post_repo.update(post_id, post_update)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    return PostRead(
        id=post.id,
        content=post.content,
        author=post.author,
        response_to=post.response_to,
        created=post.created,
        media=post.media,
    )


@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: int):
    """Delete a post by its ID."""
    # Look up the post first so we know who the author was
    post = post_repo.get_by_id(post_id)

    deleted = post_repo.delete(post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Post not found")

    # Remove the post from the author's user profile
    if post is not None and post.author is not None:
        user_repo.remove_post(post.author, post_id)

    return None
