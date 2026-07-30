from datetime import datetime
import uuid

from pydantic import BaseModel

class MediaItem(BaseModel):
    """
    MediaItem is a stub placeholder class for
    later development.
    """
    id: int | None
    user_id: int | None
    uuid: uuid.UUID
    mimetype: str
    bucket: str
    path: str
    created: datetime
