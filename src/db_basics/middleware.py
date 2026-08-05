"""TinyDB middleware that automatically serializes/deserializes using Pydantic.

Usage::

    from tinydb import TinyDB
    from tinydb.storages import JSONStorage
    from pydantic import BaseModel
    from src.db_basics.middleware import PydanticMiddleware

    class Watch(BaseModel):
        brand: str
        cost: float

    # All tables
    db = TinyDB("db.json", storage=PydanticMiddleware(JSONStorage, model=Watch))

    # Multiple tables with different models
    db = TinyDB(
        "db.json",
        storage=PydanticMiddleware(JSONStorage, model_map={
            "_default": Watch,
            "inventory": InventoryItem,
        }),
    )

    # ``db.all()``, ``db.get(...)``, ``db.search(...)`` all return model instances
    for watch in db.all():
        print(watch.brand, watch.cost)

    # You can insert either dicts or model instances
    db.insert({"brand": "Casio", "cost": 29.99})
    db.insert(Watch(brand="Rolex", cost=9_999.99))
"""

from __future__ import annotations

from typing import Any, Dict, Optional, Type

from pydantic import BaseModel
from tinydb.middlewares import Middleware

# TinyDB stores data as:  {table_name: {doc_id: document_dict}}
TableData = Dict[str, Dict[str, Any]]
DocValue = Any  # Can be a dict, a Pydantic model, or nested data


class PydanticMiddleware(Middleware):
    """TinyDB middleware that wraps a storage and (de)serializes with Pydantic.

    On **read**, every document in a registered table is converted from a plain
    dict to a Pydantic model instance via ``model_validate``.

    On **write**, every document that is a Pydantic model is converted back to a
    dict via ``model_dump(mode="python")``. Plain dicts are passed through
    unchanged.
    """

    def __init__(
        self,
        storage_cls: type,
        model_map: dict[str, type[BaseModel]] | None = None,
        model: type[BaseModel] | None = None,
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
        """
        super().__init__(storage_cls)

        self._model_map: dict[str, type[BaseModel]] = {}

        if model_map is not None:
            self._model_map.update(model_map)
        elif model is not None:
            self._model_map["_default"] = model

    # ------------------------------------------------------------------
    # Public storage interface — overrides the ``__getattr__`` proxy so
    # these calls are NOT forwarded to the underlying storage.
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
        """Convert all document dicts in registered tables to Pydantic models.

        The TinyDB storage format is ``{table: {doc_id: document}}``.
        """
        result: TableData = {}
        for table_name, documents in data.items():
            model_cls = self._model_map.get(table_name)
            if model_cls is not None:
                result[table_name] = {
                    doc_id: self._to_model(model_cls, doc_id, doc)
                    for doc_id, doc in documents.items()
                }
            else:
                result[table_name] = documents
        return result

    def _serialize(self, data: TableData) -> TableData:
        """Convert any Pydantic models in registered tables back to dicts.

        Plain dicts (or unregistered tables) are passed through unchanged.
        """
        result: TableData = {}
        for table_name, documents in data.items():
            model_cls = self._model_map.get(table_name)
            if model_cls is not None:
                result[table_name] = {
                    doc_id: self._to_dict(doc)
                    for doc_id, doc in documents.items()
                }
            else:
                result[table_name] = documents
        return result

    # ------------------------------------------------------------------
    # Conversion helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _to_model(
        model_cls: type[BaseModel],
        doc_id: str,
        doc: Any,
    ) -> BaseModel:
        """Convert a raw dict into a Pydantic model instance."""
        if isinstance(doc, BaseModel):
            return doc
        # model_validate handles both dicts and values that are already a
        # compatible type.
        return model_cls.model_validate(doc)

    @staticmethod
    def _to_dict(doc: Any) -> dict[str, Any]:
        """Convert a Pydantic model back to a plain dict, if needed."""
        if isinstance(doc, BaseModel):
            return doc.model_dump(mode="python")
        return doc