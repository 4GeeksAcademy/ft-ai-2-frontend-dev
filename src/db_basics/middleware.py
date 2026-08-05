"""TinyDB middleware that automatically serializes/deserializes using Pydantic.

The middleware handles the **storage layer**: on write it converts Pydantic
models to plain dicts (so they serialise cleanly to JSON), and on read it
validates every document against the registered model.

A companion helper, ``model_table``, wraps a TinyDB table so that the standard
``all()``, ``get()``, ``search()`` queries return **model instances** instead
of plain dicts.

Usage::

    from tinydb import TinyDB
    from tinydb.storages import JSONStorage
    from pydantic import BaseModel
    from src.db_basics.middleware import PydanticMiddleware, model_table

    class Watch(BaseModel):
        brand: str
        cost: float

    # 1. Wire up the middleware — handles write conversion & read validation
    db = TinyDB("db.json", storage=PydanticMiddleware(JSONStorage, model=Watch))

    # 2. Insert models directly — the middleware auto-serialises to dicts
    db.insert(Watch(brand="Casio", cost=29.99))
    db.insert({"brand": "Rolex", "cost": 9_999.99})      # … or plain dicts

    # 3. Use ``model_table`` to get typed model instances back
    watches = model_table(db, Watch)

    for w in watches.all():          # list[Watch]
        print(w.brand, w.cost)

    w = watches.get(doc_id=1)        # Watch | None
    results = watches.search(Watch.brand == "Casio")   # list[Watch]

    # Multiple tables with different models
    db = TinyDB(
        "db.json",
        storage=PydanticMiddleware(JSONStorage, model_map={
            "_default": Watch,
            "inventory": InventoryItem,
        }),
    )
    items = model_table(db, InventoryItem, table="inventory")
"""

from __future__ import annotations

from typing import Any, Dict, Mapping, Optional, Type, Union

from pydantic import BaseModel
from tinydb.database import TinyDB
from tinydb.middlewares import Middleware
from tinydb.table import Document, Table

# TinyDB stores data as:  {table_name: {doc_id: document_dict}}
TableData = Dict[str, Dict[str, Any]]


# ==========================================================================
# 1.  Storage-level middleware
# ==========================================================================


class PydanticMiddleware(Middleware):
    """TinyDB middleware that wraps a storage and (de)serialises with Pydantic.

    **Write path** — every Pydantic ``BaseModel`` instance found in the data
    tree is converted to a plain dict via ``model_dump(mode="python")`` so that
    the underlying storage (e.g. ``JSONStorage``) can serialise it cleanly.

    **Read path** — every document dict from a registered table is validated
    through ``model_validate`` before being returned to TinyDB's table layer.
    This catches data corruption or schema drift early.

    Plain dicts (and unregistered tables) pass through unchanged on both paths.
    """

    def __init__(
        self,
        storage_cls: type,
        model_map: dict[str, type[BaseModel]] | None = None,
        model: type[BaseModel] | None = None,
        *,
        validate_on_read: bool = True,
    ) -> None:
        """Initialise the middleware.

        Parameters
        ----------
        storage_cls:
            The underlying TinyDB storage class to wrap (e.g. ``JSONStorage``).
        model_map:
            Mapping of table name → Pydantic model class.  Documents in tables
            not present in the map are left untouched.
        model:
            Shorthand for ``model_map={"_default": model}``.  Ignored if
            ``model_map`` is also provided.
        validate_on_read:
            When ``True`` (default), every dict read from a registered table
            is validated through ``model_validate``.  Set to ``False`` if you
            only need write-path conversion and want to skip the overhead of
            validation on read.
        """
        super().__init__(storage_cls)

        self._model_map: dict[str, type[BaseModel]] = {}
        self._validate_on_read = validate_on_read

        if model_map is not None:
            self._model_map.update(model_map)
        elif model is not None:
            self._model_map["_default"] = model

    # ------------------------------------------------------------------
    # Public storage interface — overrides the ``__getattr__`` proxy
    # ------------------------------------------------------------------

    def read(self) -> Optional[TableData]:
        """Read and deserialize the database state."""
        raw: Optional[TableData] = self.storage.read()
        if raw is None:
            return None
        return self._deserialize(raw)

    def write(self, data: TableData) -> None:
        """Serialize and write the database state."""
        serialized = self._serialize(data)
        self.storage.write(serialized)

    def close(self) -> None:
        """Close the underlying storage."""
        self.storage.close()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _deserialize(self, data: TableData) -> TableData:
        """Validate document dicts in registered tables.

        Returns the data unchanged (dicts remain dicts — the ``Table`` layer
        wraps them in ``Document``).  If ``validate_on_read`` is enabled an
        exception is raised when a document doesn't match its model schema.
        """
        if not self._validate_on_read:
            return data

        for table_name, documents in data.items():
            model_cls = self._model_map.get(table_name)
            if model_cls is None:
                continue
            for doc_id, doc in documents.items():
                if not isinstance(doc, BaseModel):
                    # Validate — raises ``ValidationError`` on mismatch
                    model_cls.model_validate(doc)
        return data

    def _serialize(self, data: TableData) -> TableData:
        """Recursively convert any Pydantic models to plain dicts."""
        result: TableData = {}
        for table_name, documents in data.items():
            result[table_name] = {
                doc_id: self._to_dict(doc)
                for doc_id, doc in documents.items()
            }
        return result

    # ------------------------------------------------------------------
    # Conversion helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _to_dict(doc: Any) -> dict[str, Any]:
        """Convert a Pydantic model to a dict.  Pass through plain dicts."""
        if isinstance(doc, BaseModel):
            return doc.model_dump(mode="python")
        return doc


# ==========================================================================
# 2.  Table-level helper — returns Pydantic model instances
# ==========================================================================


class ModelTable:
    """Typed wrapper around a TinyDB table that returns Pydantic models.

    Use the module-level ``model_table()`` factory to create one.

    All write operations (``insert``, ``update``, ``upsert``) accept either
    a model instance or a plain dict — the middleware handles conversion.

    All read operations return model instances.
    """

    def __init__(self, table: Table, model_cls: type[BaseModel]) -> None:
        self._table = table
        self._model_cls = model_cls

    # -- read operations (return model instances) -------------------------

    def all(self) -> list[BaseModel]:
        """Return every document as a model instance."""
        return [self._convert(doc) for doc in self._table.all()]

    def get(
        self,
        cond: Optional[QueryLike] = None,
        doc_id: Optional[int] = None,
    ) -> Optional[BaseModel]:
        """Fetch one document by condition or ID, returned as a model."""
        doc = self._table.get(cond=cond, doc_id=doc_id)
        return self._convert(doc) if doc is not None else None

    def search(self, cond: QueryLike) -> list[BaseModel]:
        """Return matching documents as model instances."""
        return [self._convert(doc) for doc in self._table.search(cond)]

    def __iter__(self):
        """Iterate over all documents as model instances."""
        for doc in self._table:
            yield self._convert(doc)

    def __len__(self) -> int:
        return len(self._table)

    # -- write / update helpers ------------------------------------------

    def insert(self, document: Any) -> int:
        """Insert a document (dict *or* model) and return its doc ID.

        Pydantic models are converted to dicts before insertion, since
        TinyDB's ``Table.insert()`` requires a ``Mapping``.
        """
        return self._table.insert(self._unwrap(document))

    def update(
        self, fields: Any, cond: Optional[QueryLike] = None
    ) -> list[int]:
        """Update matching documents with ``fields`` (dict or model)."""
        return self._table.update(self._unwrap(fields), cond=cond)

    def upsert(
        self, document: Any, cond: Optional[QueryLike] = None
    ) -> list[int]:
        """Update existing or insert ``document`` (dict or model)."""
        return self._table.upsert(self._unwrap(document), cond=cond)

    def remove(self, cond: Optional[QueryLike] = None) -> list[int]:
        """Remove matching documents and return their doc IDs."""
        return self._table.remove(cond=cond)

    def truncate(self) -> None:
        """Remove all documents."""
        self._table.truncate()

    def clear_cache(self) -> None:
        """Clear the query cache."""
        self._table.clear_cache()

    # -- internal ---------------------------------------------------------

    @staticmethod
    def _unwrap(doc: Any) -> dict[str, Any]:
        """Convert a Pydantic model to a plain dict, or pass through dicts.

        TinyDB's ``Table.insert()`` / ``Table.update()`` require a
        ``collections.abc.Mapping``, so we unwrap models here rather than
        relying solely on the middleware.
        """
        if isinstance(doc, BaseModel):
            return doc.model_dump(mode="python")
        return doc

    def _convert(self, doc: Document) -> BaseModel:
        return self._model_cls.model_validate(dict(doc))


# Soft-import QueryLike for type hints only (avoids runtime dependency)
try:
    from tinydb.queries import QueryLike  # noqa: F401
except ImportError:
    QueryLike = Any


def model_table(
    db: TinyDB,
    model_cls: type[BaseModel],
    table: str = "_default",
) -> ModelTable:
    """Wrap a TinyDB table so queries return Pydantic model instances.

    Parameters
    ----------
    db:
        A ``TinyDB`` instance that uses ``PydanticMiddleware``.
    model_cls:
        The Pydantic model class for the table.
    table:
        The table name (default ``"_default"``).

    Returns
    -------
    ``ModelTable`` instance that can be used just like a TinyDB table, except
    that read operations return model instances.
    """
    return ModelTable(db.table(table), model_cls)