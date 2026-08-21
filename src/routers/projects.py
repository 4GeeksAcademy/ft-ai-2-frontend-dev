from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from src import SessionDep
from src.models import Project, WeatherData, WeatherDataProjectLink
from src.schemas import (
    ProjectCreate,
    ProjectPublic,
    ProjectPublicDetailed,
    ProjectUpdate,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectPublic, status_code=201)
def create_project(project_in: ProjectCreate, session: SessionDep):
    """Create a new project."""
    project = Project.model_validate(project_in)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.get("/", response_model=list[ProjectPublic])
def list_projects(
    session: SessionDep,
    owner_id: int | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    """List projects, optionally filtered by owner."""
    stmt = select(Project)
    if owner_id is not None:
        stmt = stmt.where(Project.owner_id == owner_id)
    stmt = stmt.offset(offset).limit(limit)
    return session.exec(stmt).all()


@router.get("/{project_id}", response_model=ProjectPublicDetailed)
def get_project(project_id: int, session: SessionDep):
    """Get a single project with its owner and linked weather data."""
    project = session.exec(
        select(Project).where(Project.id == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectPublic)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    session: SessionDep,
):
    """Partially update a project."""
    project = session.exec(
        select(Project).where(Project.id == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    session.commit()
    session.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, session: SessionDep):
    """Delete a project and unlink all associated weather data."""
    project = session.exec(
        select(Project).where(Project.id == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()


@router.post(
    "/{project_id}/weather/{weather_id}",
    response_model=ProjectPublicDetailed,
    status_code=200,
)
def link_weather_to_project(
    project_id: int,
    weather_id: int,
    session: SessionDep,
):
    """Link an existing weather record to a project."""
    project = session.exec(
        select(Project).where(Project.id == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    weather = session.exec(
        select(WeatherData).where(WeatherData.id == weather_id)
    ).first()
    if not weather:
        raise HTTPException(status_code=404, detail="Weather record not found")

    # Check if already linked
    existing = session.exec(
        select(WeatherDataProjectLink).where(
            WeatherDataProjectLink.project_id == project_id,
            WeatherDataProjectLink.weather_data_id == weather_id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Weather record is already linked to this project")

    link = WeatherDataProjectLink(
        project_id=project_id, weather_data_id=weather_id
    )
    session.add(link)
    session.commit()
    session.refresh(project)
    return project


@router.delete(
    "/{project_id}/weather/{weather_id}",
    response_model=ProjectPublicDetailed,
)
def unlink_weather_from_project(
    project_id: int,
    weather_id: int,
    session: SessionDep,
):
    """Unlink a weather record from a project."""
    link = session.exec(
        select(WeatherDataProjectLink).where(
            WeatherDataProjectLink.project_id == project_id,
            WeatherDataProjectLink.weather_data_id == weather_id,
        )
    ).first()
    if not link:
        raise HTTPException(
            status_code=404,
            detail="Weather record is not linked to this project",
        )
    session.delete(link)
    session.commit()

    project = session.exec(
        select(Project).where(Project.id == project_id)
    ).first()
    return project