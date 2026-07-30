from fastapi import APIRouter, HTTPException

from src.scratching_post_api.models.user import User, UserCreate
from src.scratching_post_api.repositories.registry import user_repo

router = APIRouter(tags=["users"])


@router.get("/user/{user_id}", response_model=User)
async def read_user(user_id: int):
    """Read a single user by their ID."""
    user = user_repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/register", response_model=User)
async def register_user(user_create: UserCreate):
    """Register a new user."""
    existing = user_repo.get_by_handle(user_create.handle)
    if existing is not None:
        raise HTTPException(
            status_code=400,
            detail="A user with that handle already exists",
        )
    return user_repo.create(user_create)