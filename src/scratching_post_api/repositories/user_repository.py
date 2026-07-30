from typing import Optional

from src.scratching_post_api.models.user import User, UserCreate
from src.scratching_post_api.models.post import PostBase


class UserRepository:
    """
    In-memory repository for User objects.
    Implements the repository pattern for data access.
    """

    def __init__(self) -> None:
        self._users: dict[int, User] = {}
        self._next_id: int = 1

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Retrieve a single user by their ID."""
        return self._users.get(user_id)

    def get_by_handle(self, handle: str) -> Optional[User]:
        """Retrieve a user by their handle."""
        for user in self._users.values():
            if user.handle == handle:
                return user
        return None

    def create(self, user_create: UserCreate) -> User:
        """Create a new user and store it."""
        user = User(
            id=self._next_id,
            handle=user_create.handle,
            posts=[],
        )
        self._users[user.id] = user
        self._next_id += 1
        return user

    def add_post(self, user_id: int, post: PostBase) -> None:
        """Add a post to a user's post list."""
        user = self._users.get(user_id)
        if user is not None:
            user.posts.append(post)

    def remove_post(self, user_id: int, post_id: int) -> None:
        """Remove a post from a user's post list by post ID."""
        user = self._users.get(user_id)
        if user is not None:
            user.posts = [p for p in user.posts if p.id != post_id]