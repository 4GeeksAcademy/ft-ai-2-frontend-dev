"""Auth routes: register and login."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.auth import (
    create_access_token,
    get_user_by_email,
    get_user_by_username,
    hash_password,
    verify_password,
)
from app.database import get_session
from app.helpers import gravatar_url
from app.models import User
from app.schemas import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UserBrief,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(
    body: RegisterRequest,
    session: Annotated[Session, Depends(get_session)],
) -> RegisterResponse:
    email = body.email.lower()
    if get_user_by_email(session, email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    if get_user_by_username(session, body.username) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    user = User(
        email=email,
        username=body.username.lower(),
        display_name=body.username.lower(),
        password_hash=hash_password(body.password),
        avatar_url=gravatar_url(email),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(user_id=user.id, username=user.username)
    return RegisterResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        token=token,
    )


@router.post("/login", response_model=LoginResponse)
def login(
    body: LoginRequest,
    session: Annotated[Session, Depends(get_session)],
) -> LoginResponse:
    user = get_user_by_email(session, body.email.lower())
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user_id=user.id, username=user.username)
    return LoginResponse(
        token=token,
        user=UserBrief(
            id=user.id,
            email=user.email,
            username=user.username,
            display_name=user.display_name,
        ),
    )
