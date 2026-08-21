from typing import TYPE_CHECKING

from sqlmodel import Relationship, SQLModel, Field

if TYPE_CHECKING:
    from src.models.weather_data import WeatherData
    from src.models.project import Project


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True)
    name: str

    weather_data: list["WeatherData"] = Relationship(back_populates="user")
    projects_owned: list["Project"] = Relationship(back_populates="owner")