# ft-ai-2-frontend-dev

<!-- TOC:START -->

## Module Demonstrations

Each demonstration lives on its own branch:

- Providing Visual Specs To The AI: [module/specs-pt-1](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/specs-pt-1)
- Single Page Apps: [module/spa](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/spa)
- Structure: [module/structure](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/structure)
- Building An Application: [module/book_app](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/book_app)
- Making `fetch` requests: [module/restful_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/restful_apis)
- Helping LLMs Understand APIs: [module/agents_and_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/agents_and_apis)
- Server VS Client Components: [module/server_client_divide](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/server_client_divide)
- API Concepts Review: [module/api_review](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/api_review)
- Python [module/python](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/python)
- Defining Backend Architecture: [module/backend_arch](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/backend_arch)
- Designing Routes: [module/designing_routes](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/designing_routes)
- File I/O: [module/file-io](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io)
- File I/O Example: [module/file-io-example](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io-example)
- TinyDB Example: [module/db-basics](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/db-basics)
<!-- TOC:END -->

## PydanticMiddleware — TinyDB meets Pydantic

The `src/db_basics/middleware.py` module provides a [TinyDB middleware](https://tinydb.readthedocs.io/en/latest/extend.html#write-custom-middleware)
that automatically serialises and deserialises data using Pydantic models.

### What it does

| Layer | File | Job |
|-------|------|-----|
| `PydanticMiddleware` | `middleware.py` | Storage-level — converts models → dicts on write, validates dicts → models on read |
| `ModelTable` / `model_table()` | `middleware.py` | Query-level — wraps a TinyDB table so read operations return real Pydantic instances |

### Quick start

```python
from tinydb import TinyDB, Query
from tinydb.storages import JSONStorage
from pydantic import BaseModel
from src.db_basics.middleware import PydanticMiddleware, model_table

# 1. Define your model
class Watch(BaseModel):
    brand: str
    cost: float

# 2. Wire in the middleware
db = TinyDB("db.json", storage=PydanticMiddleware(JSONStorage, model=Watch))

# 3. Get a typed table handle
watches = model_table(db, Watch)

# Insert either dicts or model instances
watches.insert({"brand": "Casio", "cost": 29.99})
watches.insert(Watch(brand="Rolex", cost=9_999.99))

# Read back as real model instances
for w in watches.all():           # list[Watch]
    print(w.brand, w.cost)

w = watches.get(doc_id=1)         # Watch | None
results = watches.search(Query().brand == "Casio")   # list[Watch]
```

### Multiple tables

```python
db = TinyDB(
    "db.json",
    storage=PydanticMiddleware(JSONStorage, model_map={
        "_default": Watch,
        "inventory": InventoryItem,
    }),
)
items = model_table(db, InventoryItem, table="inventory")
```

### Real-time validation

With `validate_on_read=True` (the default), every document read from storage
is checked against the registered model. Corrupted data raises a Pydantic
`ValidationError` immediately instead of silently propagating bad data.

```python
db = TinyDB(
    "db.json",
    storage=PydanticMiddleware(JSONStorage, model=Watch, validate_on_read=True),
)
```
