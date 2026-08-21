from src.schemas.user import UserBase, UserCreate, UserPublic
from src.schemas.weather import (
    WeatherDataBase,
    WeatherDataCreate,
    WeatherDataUpdate,
    WeatherDataPublic,
    WeatherStats,
)
from src.schemas.project import ProjectBase, ProjectCreate, ProjectUpdate, ProjectPublic


class UserPublicDetailed(UserPublic):
    weather_data: list[WeatherDataPublic] = []
    projects_owned: list[ProjectPublic] = []


class WeatherDataPublicDetailed(WeatherDataPublic):
    user: UserPublic | None = None
    projects: list[ProjectPublic] = []


class ProjectPublicDetailed(ProjectPublic):
    owner: UserPublic | None = None
    weather_data: list[WeatherDataPublic] = []


__all__ = [
    "UserBase", "UserCreate", "UserPublic", "UserPublicDetailed",
    "WeatherDataBase", "WeatherDataCreate", "WeatherDataUpdate", "WeatherDataPublic", "WeatherDataPublicDetailed", "WeatherStats",
    "ProjectBase", "ProjectCreate", "ProjectUpdate", "ProjectPublic", "ProjectPublicDetailed",
]