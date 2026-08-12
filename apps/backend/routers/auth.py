"""Authentication router — POST /register, POST /login, POST /request-reset-link, POST /reset-password."""

from __future__ import annotations

import hashlib
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings
from database import get_db
from exceptions import (
    email_already_exists,
    invalid_credentials,
    token_invalid,
)
from models.user import (
    RequestResetLinkRequest,
    ResetPasswordRequest,
    User,
    UserCreate,
    UserLogin,
    UserPublic,
)

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


def _create_reset_token(sub: str) -> str:
    """Create a short-lived JWT with purpose='password_reset'."""
    now = datetime.now(UTC)
    expire = now + timedelta(minutes=settings.jwt_reset_token_expiry_minutes)
    payload = {
        "sub": sub,
        "purpose": "password_reset",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _print_simulated_email(email: str, token: str) -> None:
    """Print a simulated password-reset email to the backend console."""
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    expiry = settings.jwt_reset_token_expiry_minutes
    print()
    print("┌─────────────────────────────────────────────┐")
    print("│  📧 PASSWORD RESET                          │")
    print("│                                             │")
    print(f"│  To: {email:<39} │")
    print("│                                             │")
    print("│  Click the link below to reset your         │")
    print(f"│  password (expires in {expiry} minutes):          │")
    print("│                                             │")
    print(f"│  {reset_link:<47} │")
    print("│                                             │")
    print("│  If you didn't request this, ignore this    │")
    print("│  message.                                   │")
    print("└─────────────────────────────────────────────┘")
    print()


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


@router.post("/request-reset-link")
def request_reset_link(body: RequestResetLinkRequest) -> dict:
    """Request a password reset link.

    Always returns 200 regardless of whether the email exists, to prevent
    email enumeration. When the email exists, a reset link is printed to the
    backend console as a simulated email.
    """
    db = get_db()
    users_table = db.table("users")

    matching = users_table.search(lambda doc: doc.get("email") == body.email)
    if matching:
        doc = matching[0]
        user = User.model_validate(doc)
        token = _create_reset_token(str(user.id))
        _print_simulated_email(body.email, token)

    return {
        "detail": "If an account with that email exists, a reset link has been sent."
    }


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest) -> dict:
    """Reset a user's password given a valid reset token.

    Validates the JWT, verifies the purpose claim, and updates the password.
    """
    try:
        payload = jwt.decode(
            body.token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        purpose: str | None = payload.get("purpose")
        if purpose != "password_reset":
            raise token_invalid()
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise token_invalid()
    except JWTError:
        raise token_invalid()

    db = get_db()
    users_table = db.table("users")

    matching = users_table.search(lambda doc: doc.get("id") == user_id_str)
    if not matching:
        # User was deleted between token issuance and use — treat as invalid
        raise token_invalid()

    doc_id = matching[0].doc_id
    new_hash = pwd_context.hash(body.new_password)
    users_table.update({"password": new_hash}, doc_ids=[doc_id])

    return {"detail": "Password has been reset successfully."}
