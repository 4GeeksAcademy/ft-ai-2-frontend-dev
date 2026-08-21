from pydantic import BaseModel


class UserBase(BaseModel):
    email: str
    name: str


class UserCreate(UserBase):
    pass


class UserPublic(UserBase):
    id: int