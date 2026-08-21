from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Relationship, SQLModel, Field

if TYPE_CHECKING:
    from src.models.user import User
    from src.models.weather_data import WeatherData

from src.models.weather_data import WeatherDataProjectLink


class Project(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int | None = Field(default=None, foreign_key="user.id")
    title: str
    description: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    owner: Optional["User"] = Relationship(back_populates="projects_owned")
    weather_data: list["WeatherData"] = Relationship(
        back_populates="projects",
        link_model=WeatherDataProjectLink,
    )