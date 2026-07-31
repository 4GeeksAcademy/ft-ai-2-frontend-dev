from pydantic import BaseModel


class Pet(BaseModel):
    name: str | None
    type: str | None
    age: int | None
    favorite_toy: str | None
