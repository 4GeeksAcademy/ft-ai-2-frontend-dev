"""Authentication router — POST /register, POST /login."""

from __future__ import annotations

import hashlib
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, status
from jose import jwt
from passlib.context import CryptContext

from config import settings
from database import get_db
from exceptions import email_already_exists, invalid_credentials
from models.user import User, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _gravatar_url(email: str) -> str:
    """Return the Gravatar URL for a given email address."""
    email_hash = hashlib.md5(email.strip().lower().encode()).hexdigest()
    return f"https://www.gravatar.com/avatar/{email_hash}?d=identicon&s=200"


def _create_access_token(sub: str) -> str:
    """Create a signed JWT access token for the given subject (user UUID)."""
    now = datetime.now(UTC)
    expire = now + timedelta(minutes=settings.jwt_expiry_minutes)
    payload = {
        "sub": sub,
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: UserCreate) -> dict:
    """Register a new user account.

    Hashes the password, generates a Gravatar URL, stores the user, and
    returns the public profile (no JWT).
    """
    db = get_db()
    users_table = db.table("users")

    # Check for duplicate email
    if users_table.search(lambda doc: doc.get("email") == body.email):
        raise email_already_exists()

    hashed = pwd_context.hash(body.password)
    gravatar = _gravatar_url(body.email)
    user = User(
        email=body.email,
        password=hashed,
        display_name=body.display_name,
        gravatar_url=gravatar,
    )
    serialized = user.model_dump(mode="json")
    users_table.insert(serialized)

    return UserPublic.model_validate(user).model_dump(mode="json")


@router.post("/login")
def login(body: UserLogin) -> dict:
    """Authenticate with email and password, receive a JWT."""
    db = get_db()
    users_table = db.table("users")

    matching = users_table.search(lambda doc: doc.get("email") == body.email)
    if not matching:
        raise invalid_credentials()

    doc = matching[0]
    user = User.model_validate(doc)

    if not pwd_context.verify(body.password, user.password):
        raise invalid_credentials()

    token = _create_access_token(str(user.id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserPublic.model_validate(user).model_dump(mode="json"),
    }