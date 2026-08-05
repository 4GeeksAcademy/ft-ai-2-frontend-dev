from typing import Optional
import uuid

from pydantic import BaseModel, Field
from tinydb import TinyDB
from tinydb.storages import JSONStorage

from src.db_basics.middleware import PydanticMiddleware, model_table


# ==========================================================================
# Pydantic models
# ==========================================================================


class Watch(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    diameter: str
    material: str
    brand: str
    cost: float
    msrp: float | None
    map_price: float | None
    waterproof: bool | None


class WatchWrite(BaseModel):
    diameter: str
    material: str
    brand: str
    cost: float
    msrp: float | None
    map_price: float | None
    waterproof: bool | None


class WatchRead(BaseModel):
    id: uuid.UUID
    diameter: str
    material: str
    brand: str
    cost: float
    msrp: float | None
    map_price: float | None
    waterproof: bool | None


class Watches(BaseModel):
    watches: list[WatchRead]


# ==========================================================================
# Database setup with PydanticMiddleware
# ==========================================================================

# The middleware serialises models → dicts on write (so JSONStorage can store
# them), and validates dicts → models on read (so data corruption is caught).

db = TinyDB("db.json", storage=PydanticMiddleware(JSONStorage, model=Watch))

# ``model_table`` wraps the TinyDB table so that read operations return real
# Pydantic model instances rather than plain dicts.
watches = model_table(db, Watch)
