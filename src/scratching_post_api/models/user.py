from pydantic import BaseModel

from src.scratching_post_api.models.post import PostBase

class User(BaseModel):
    id: int | None
    handle: str
    posts: list["PostBase"]


class UserCreate(BaseModel):
    handle: str


class UserReadMany(BaseModel):
    users: list["User"]
    offset: int
    total: int
