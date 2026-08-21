from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from src import SessionDep
from src.models import User
from src.schemas import UserCreate, UserPublic, UserPublicDetailed

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserPublic, status_code=201)
def create_user(user_in: UserCreate, session: SessionDep):
    """Create a new user."""
    user = User.model_validate(user_in)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/", response_model=list[UserPublic])
def list_users(
    session: SessionDep,
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    """List all users, paginated."""
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users


@router.get("/{user_id}", response_model=UserPublicDetailed)
def get_user(user_id: int, session: SessionDep):
    """Get a single user with their weather data and projects."""
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserPublic)
def update_user(user_id: int, user_in: UserCreate, session: SessionDep):
    """Update a user's fields."""
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.email = user_in.email
    user.name = user_in.name
    session.commit()
    session.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, session: SessionDep):
    """Delete a user and all their weather data and projects."""
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()