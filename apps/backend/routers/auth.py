"""Authentication router — POST /register, POST /login."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from jose import jwt
from passlib.context import CryptContext

from config import settings
from database import get_db
from models.user import User, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _create_access_token(sub: str) -> str:
    """Create a signed JWT access token for the given subject (user ID)."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_expiry_minutes
    )
    payload = {"sub": sub, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: UserCreate) -> dict:
    """Register a new user account."""
    db = get_db()
    users_table = db.table("users")

    # Check for duplicate email
    if users_table.search(
        lambda doc: doc.get("email") == body.email
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed = pwd_context.hash(body.password)
    user = User(email=body.email, hashed_password=hashed)
    serialized = user.model_dump(mode="json")
    doc_id = users_table.insert(serialized)

    token = _create_access_token(str(doc_id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserPublic.model_validate(
            {**user.model_dump(), "id": str(doc_id)}
        ).model_dump(mode="json"),
    }


@router.post("/login")
def login(body: UserLogin) -> dict:
    """Authenticate with email and password, receive a JWT."""
    db = get_db()
    users_table = db.table("users")

    matching = users_table.search(
        lambda doc: doc.get("email") == body.email
    )
    if not matching:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    doc = matching[0]
    user = User.model_validate({**doc, "id": str(doc.doc_id)})

    if not pwd_context.verify(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = _create_access_token(str(doc.doc_id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserPublic.model_validate(
            {**user.model_dump(), "id": str(doc.doc_id)}
        ).model_dump(mode="json"),
    }