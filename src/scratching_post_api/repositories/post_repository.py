from datetime import datetime, timezone
from typing import Optional

from src.scratching_post_api.models.post import PostBase, PostCreate, PostRead, PostReadMany, PostUpdate
from src.scratching_post_api.models.media import MediaItem


class PostRepository:
    """
    In-memory repository for Post objects.
    Implements the repository pattern for data access.
    """

    def __init__(self) -> None:
        self._posts: dict[int, PostBase] = {}
        self._next_id: int = 1

    def get_by_id(self, post_id: int) -> Optional[PostBase]:
        """Retrieve a single post by its ID."""
        return self._posts.get(post_id)

    def get_many(self, offset: int = 0, count: Optional[int] = None) -> PostReadMany:
        """Retrieve multiple posts with pagination."""
        all_posts = list(self._posts.values())
        total = len(all_posts)

        # Apply offset
        sliced = all_posts[offset:]
        # Apply count if provided
        if count is not None:
            sliced = sliced[:count]

        # Convert to PostRead for response
        posts_read = [
            PostRead(
                id=p.id,
                content=p.content,
                author=p.author,
                response_to=p.response_to,
                created=p.created,
                media=p.media,
            )
            for p in sliced
        ]

        return PostReadMany(posts=posts_read, offset=offset, total=total)

    def create(self, post_create: PostCreate) -> PostBase:
        """Create a new post and store it."""
        now = datetime.now(timezone.utc)
        post = PostBase(
            id=self._next_id,
            content=post_create.content,
            author=post_create.author,
            response_to=post_create.response_to,
            created=now,
            media=post_create.media,
        )
        self._posts[post.id] = post
        self._next_id += 1
        return post

    def update(self, post_id: int, post_update: PostUpdate) -> Optional[PostBase]:
        """Update an existing post. Returns None if post not found."""
        existing = self._posts.get(post_id)
        if existing is None:
            return None

        updated = PostBase(
            id=existing.id,
            content=post_update.content if post_update.content is not None else existing.content,
            author=existing.author,
            response_to=existing.response_to,
            created=existing.created,
            media=post_update.media if post_update.media is not None else existing.media,
        )
        self._posts[post_id] = updated
        return updated

    def delete(self, post_id: int) -> bool:
        """Delete a post by ID. Returns True if deleted, False if not found."""
        if post_id in self._posts:
            del self._posts[post_id]
            return True
        return False