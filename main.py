import json

from fastmcp import FastMCP
import requests
from pydantic import BaseModel, Field, computed_field

mcp = FastMCP(
    "Book Data MCP",
    instructions="Provides book data from the dotlag book database."
)


class Book(BaseModel):
    """A book in the dotlag library, as served by https://library.dotlag.space."""

    title: str
    author: str | None = None
    cover: str | None = None
    num_pages: int | None = None
    year_published: int | None = None
    isbn13: str | None = None
    isbn10: str | None = None
    is_awesome: bool = True
    have_read: bool = False
    id: int | None = None


class BookCreate(BaseModel):
    """Payload for POST /library/add — same as Book but without the server-assigned id."""

    title: str
    author: str | None = None
    cover: str | None = None
    num_pages: int | None = None
    year_published: int | None = None
    isbn13: str | None = None
    isbn10: str | None = None
    is_awesome: bool = True
    have_read: bool = False


class BookUpdate(BaseModel):
    """Payload for PATCH/PUT /library/{id} — every field optional for partial updates."""

    title: str | None = None
    author: str | None = None
    cover: str | None = None
    num_pages: int | None = None
    year_published: int | None = None
    isbn13: str | None = None
    isbn10: str | None = None
    is_awesome: bool | None = None
    have_read: bool = False


class Books(BaseModel):
    """Response shape of GET /library."""

    books: list[Book]
    count: int


@mcp.tool(
    tags={"public", "utility"},
    name="get_dotlag_book_data",
    description="Retrieves book data from the dotlag library API."
)
def get_books() -> Books:
    resp = requests.get("https://library.dotlag.space/library")
    return resp.json()


@mcp.tool(
    tags={"public", "utility"},
    name="add_dotlag_book_data",
    description="Adds a book to the dotlag library API"
)
def add_book(book: BookCreate) -> Book:
    resp = requests.post(
        "https://library.dotlag.space/library/add",
        headers={
            "Content-Type": "application/json",
        },
        json=book.model_dump(),
    )
    return resp.json()


# ---------------------------------------------------------------------------
# OpenLibrary (https://openlibrary.org/developers/api)
# ---------------------------------------------------------------------------


class OpenLibraryDoc(BaseModel):
    """A single search result document from the OpenLibrary search API."""

    key: str
    title: str
    author_name: list[str] | None = None
    first_publish_year: int | None = None
    number_of_pages_median: int | None = None
    cover_i: int | None = None
    isbn: list[str] | None = None
    first_sentence: list[str] | None = None
    subject: list[str] | None = None

    @computed_field
    @property
    def cover_url(self) -> str | None:
        """Build a cover image URL from the cover_i identifier, if present."""
        if self.cover_i is None:
            return None
        return f"https://covers.openlibrary.org/b/id/{self.cover_i}-L.jpg"

    @computed_field
    @property
    def openlibrary_url(self) -> str | None:
        """Build the OpenLibrary page URL for this work, if present."""
        if not self.key:
            return None
        return f"https://openlibrary.org{self.key}"


class OpenLibrarySearchResponse(BaseModel):
    """Response shape of GET https://openlibrary.org/search.json."""

    numFound: int
    start: int
    numFoundExact: bool
    docs: list[OpenLibraryDoc]


@mcp.tool(
    tags={"public", "utility"},
    name="get_book_data_by_title",
    description=(
        "Retrieves book data from the OpenLibrary API by title. Returns matching "
        "books with author(s), first publish year, page count, ISBNs, subjects, "
        "cover image URL, and OpenLibrary page URL."
    ),
)
def get_book_data_by_title(
    title: str = Field(description="Title of the book to search for"),
    limit: int = Field(
        default=5,
        ge=1,
        le=100,
        description="Maximum number of results to return (1-100)",
    ),
) -> list[OpenLibraryDoc]:
    """Search OpenLibrary for books matching a title."""
    resp = requests.get(
        "https://openlibrary.org/search.json",
        params={"q": title, "limit": limit},
        timeout=10,
    )
    resp.raise_for_status()
    data = OpenLibrarySearchResponse.model_validate(resp.json())
    return data.docs


if __name__ == "__main__":
    mcp.run(transport="http")
