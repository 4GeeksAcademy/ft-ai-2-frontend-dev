from typing import Optional
import uuid

from pydantic import BaseModel, Field
from tinydb import TinyDB
from tinydb.storages import JSONStorage

from src.db_basics.middleware import PydanticMiddleware


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
# PydanticMiddleware demo — two ways to wire it up
# ==========================================================================

# ── Option A: Single-model shorthand ─────────────────────────────────────
db = TinyDB("db.json", storage=PydanticMiddleware(JSONStorage, model=Watch))

# Now ``db.all()``, ``db.get(...)``, ``db.search(...)`` return Watch instances,
# and ``db.insert(...)`` accepts both dicts and Watch instances.

# ── Option B: Per-table model map (for multiple tables in one DB) ────────
# db = TinyDB(
#     "db.json",
#     storage=PydanticMiddleware(JSONStorage, model_map={
#         "_default": Watch,
#         "inventory": SomeOtherModel,
#     }),
# )
