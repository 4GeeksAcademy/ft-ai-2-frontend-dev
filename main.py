from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from sqlmodel import SQLModel, select

from src import engine, SessionDep
from src.models import User, WeatherData, Project, WeatherDataProjectLink
from src.routers.users import router as users_router
from src.routers.weather import router as weather_router
from src.routers.projects import router as projects_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(users_router)
app.include_router(weather_router)
app.include_router(projects_router)


@app.get("/health")
def health_check(session: SessionDep):
    """Verify database connectivity."""
    session.exec(select(1))
    return {"status": "ok"}
