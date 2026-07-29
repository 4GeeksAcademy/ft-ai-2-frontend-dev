from datetime import datetime

from pydantic import BaseModel

from src.scratching_post_api.models.media import MediaItem

class PostCreate(BaseModel):
    """
    This is the model that the frontend sends to the backend
    to let the backend store the post
    f(x: PostCreate) -> PostRead
    """
    content: str
    author: int | None
    response_to: int | None
    media: list["MediaItem"]


class PostRead(BaseModel):
    """
    This is the model the backend sends to the frontend
    when we want a copy of the object.
    f(x: post_id) -> PostRead
    f(x: PostCreate) -> PostRead
    """
    id: int | None
    content: str
    author: int | None
    response_to: int | None
    created: datetime
    media: list["MediaItem"]


class PaginationReq(BaseModel):
    offset: int | None
    count: int | None


class PostReadMany(BaseModel):
    posts: list["PostRead"]
    offset: int
    total: int


class PostUpdate(BaseModel):
    """
    This is the model the frontend sends to the backend
    when you want to update an object in data storage.
    f(x: PostUpdate) -> PostRead
    """
    content: str | None
    media: list["MediaItem"] | None
