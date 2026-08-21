from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Relationship, SQLModel, Field

if TYPE_CHECKING:
    from src.models.user import User
    from src.models.project import Project


class WeatherDataProjectLink(SQLModel, table=True):
    weather_data_id: int | None = Field(
        default=None, foreign_key="weatherdata.id", primary_key=True
    )
    project_id: int | None = Field(
        default=None, foreign_key="project.id", primary_key=True
    )


class WeatherData(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    lat: float
    lon: float
    altitude: float | None = None
    temp: float | None = None
    windspeed: float | None = None
    wind_dir: float | None = None
    pressure: float | None = None
    humidity: float | None = None
    recorded_at: datetime | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    user: Optional["User"] = Relationship(back_populates="weather_data")
    projects: list["Project"] = Relationship(
        back_populates="weather_data",
        link_model=WeatherDataProjectLink,
    )