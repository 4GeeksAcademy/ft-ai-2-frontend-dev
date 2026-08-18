from typing import List

from sqlmodel import Relationship, SQLModel, Field

class ShelfBase(SQLModel):
    label: str


class Shelf(ShelfBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    books: List["Book"] = Relationship(back_populates="shelf")


class BookBase(SQLModel):
    title: str


class Book(BookBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    shelf_id: int | None = Field(foreign_key="shelf.id")

