from datetime import datetime

from pydantic import BaseModel


class ProjectBase(BaseModel):
    owner_id: int | None = None
    title: str
    description: str


class ProjectCreate(ProjectBase):
    pass


class ProjectPublic(ProjectBase):
    id: int
    created_at: datetime


class ProjectUpdate(BaseModel):
    """Partial update — all fields optional."""
    owner_id: int | None = None
    title: str | None = None
    description: str | None = None