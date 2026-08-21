from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select

from src import SessionDep
from src.models import WeatherData
from src.schemas import (
    WeatherDataCreate,
    WeatherDataPublic,
    WeatherDataPublicDetailed,
    WeatherDataUpdate,
    WeatherStats,
)

router = APIRouter(prefix="/weather", tags=["weather"])


@router.post("/", response_model=WeatherDataPublic, status_code=201)
def create_weather(weather_in: WeatherDataCreate, session: SessionDep):
    """Create a weather data record (optional user FK)."""
    weather = WeatherData.model_validate(weather_in)
    session.add(weather)
    session.commit()
    session.refresh(weather)
    return weather


@router.get("/", response_model=list[WeatherDataPublic])
def list_weather(
    session: SessionDep,
    user_id: int | None = Query(default=None),
    lat: float | None = Query(default=None),
    lon: float | None = Query(default=None),
    from_date: datetime | None = Query(default=None),
    to_date: datetime | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    """List weather data, optionally filtered by user, location, or date range."""
    stmt = select(WeatherData)
    if user_id is not None:
        stmt = stmt.where(WeatherData.user_id == user_id)
    if lat is not None:
        stmt = stmt.where(WeatherData.lat == lat)
    if lon is not None:
        stmt = stmt.where(WeatherData.lon == lon)
    if from_date is not None:
        stmt = stmt.where(WeatherData.recorded_at >= from_date)
    if to_date is not None:
        stmt = stmt.where(WeatherData.recorded_at <= to_date)
    stmt = stmt.offset(offset).limit(limit)
    return session.exec(stmt).all()


@router.get("/stats", response_model=list[WeatherStats])
def weather_stats(
    session: SessionDep,
    lat: float | None = Query(default=None),
    lon: float | None = Query(default=None),
):
    """Aggregated weather stats, optionally filtered by location."""
    stmt = select(
        WeatherData.lat,
        WeatherData.lon,
        func.avg(WeatherData.temp).label("avg_temp"),
        func.avg(WeatherData.humidity).label("avg_humidity"),
        func.avg(WeatherData.pressure).label("avg_pressure"),
        func.avg(WeatherData.windspeed).label("avg_windspeed"),
        func.count(WeatherData.id).label("sample_count"),
    )
    if lat is not None:
        stmt = stmt.where(WeatherData.lat == lat)
    if lon is not None:
        stmt = stmt.where(WeatherData.lon == lon)
    stmt = stmt.group_by(WeatherData.lat, WeatherData.lon)
    results = session.exec(stmt).all()
    return [
        WeatherStats(
            lat=r.lat,
            lon=r.lon,
            avg_temp=r.avg_temp,
            avg_humidity=r.avg_humidity,
            avg_pressure=r.avg_pressure,
            avg_windspeed=r.avg_windspeed,
            sample_count=r.sample_count,
        )
        for r in results
    ]


@router.get("/{weather_id}", response_model=WeatherDataPublicDetailed)
def get_weather(weather_id: int, session: SessionDep):
    """Get a single weather record with user and projects."""
    weather = session.exec(
        select(WeatherData).where(WeatherData.id == weather_id)
    ).first()
    if not weather:
        raise HTTPException(status_code=404, detail="Weather record not found")
    return weather


@router.patch("/{weather_id}", response_model=WeatherDataPublic)
def update_weather(
    weather_id: int,
    weather_in: WeatherDataUpdate,
    session: SessionDep,
):
    """Partially update a weather record."""
    weather = session.exec(
        select(WeatherData).where(WeatherData.id == weather_id)
    ).first()
    if not weather:
        raise HTTPException(status_code=404, detail="Weather record not found")
    update_data = weather_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(weather, field, value)
    session.commit()
    session.refresh(weather)
    return weather


@router.delete("/{weather_id}", status_code=204)
def delete_weather(weather_id: int, session: SessionDep):
    """Delete a weather record."""
    weather = session.exec(
        select(WeatherData).where(WeatherData.id == weather_id)
    ).first()
    if not weather:
        raise HTTPException(status_code=404, detail="Weather record not found")
    session.delete(weather)
    session.commit()