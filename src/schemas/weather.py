from datetime import datetime

from pydantic import BaseModel


class WeatherDataBase(BaseModel):
    user_id: int | None = None
    lat: float
    lon: float
    altitude: float | None = None
    temp: float | None = None
    windspeed: float | None = None
    wind_dir: float | None = None
    pressure: float | None = None
    humidity: float | None = None
    recorded_at: datetime | None = None


class WeatherDataCreate(WeatherDataBase):
    pass


class WeatherDataUpdate(BaseModel):
    """Partial update — all fields optional."""
    user_id: int | None = None
    lat: float | None = None
    lon: float | None = None
    altitude: float | None = None
    temp: float | None = None
    windspeed: float | None = None
    wind_dir: float | None = None
    pressure: float | None = None
    humidity: float | None = None
    recorded_at: datetime | None = None


class WeatherDataPublic(WeatherDataBase):
    id: int
    created_at: datetime


class WeatherStats(BaseModel):
    lat: float
    lon: float
    avg_temp: float | None = None
    avg_humidity: float | None = None
    avg_pressure: float | None = None
    avg_windspeed: float | None = None
    sample_count: int