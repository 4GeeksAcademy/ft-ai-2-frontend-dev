"""FastAPI dependencies (e.g., get_current_user)."""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from config import settings
from database import get_db
from models.user import User, UserPublic

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserPublic:
    """Extract and validate the JWT from the Authorization header.

    Returns the public user profile of the authenticated user.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    db = get_db()
    users_table = db.table("users")
    doc = users_table.get(doc_id=int(user_id))

    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    user = User.model_validate({**doc, "id": str(doc.doc_id)})
    return UserPublic.model_validate(user)