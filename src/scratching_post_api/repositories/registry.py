"""
Shared repository registry.

Provides singleton instances of repositories so that
different routers can share the same data and coordinate
operations (e.g. updating a user's post list when a post is created).
"""

from src.scratching_post_api.repositories.post_repository import PostRepository
from src.scratching_post_api.repositories.user_repository import UserRepository

post_repo = PostRepository()
user_repo = UserRepository()
