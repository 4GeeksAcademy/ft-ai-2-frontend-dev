# Backend MVP Spec

## Application Entry

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import maps, nodes, categories

app = FastAPI(title="Wordweb API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(maps.router, prefix="/api/maps", tags=["maps"])
app.include_router(nodes.router, prefix="/api/maps", tags=["nodes"])
app.include_router(categories.router, prefix="/api/maps", tags=["categories"])
```

---

## Router: Maps

**File:** `app/routers/maps.py`

### `GET /api/maps`

Returns all maps, ordered by creation date (newest first).

**Response `200`:** `List[MapSummary]`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Spanish Vocabulary",
    "node_count": 42,
    "category_count": 5,
    "created_at": "2026-08-01T12:00:00Z",
    "updated_at": "2026-08-05T15:30:00Z"
  }
]
```

### `POST /api/maps`

Creates a new map.

**Request body:**
```json
{
  "name": "Spanish Vocabulary"
}
```

**Validation:**
- `name`: required, string, 1–100 characters, trimmed

**Response `201`:** `MapDetail` with generated UUID and timestamps.

### `GET /api/maps/{map_id}`

Returns a single map with all its nodes and categories.

**Response `200`:** `MapDetail`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Spanish Vocabulary",
  "nodes": [ ... ],
  "categories": [ ... ],
  "created_at": "2026-08-01T12:00:00Z",
  "updated_at": "2026-08-05T15:30:00Z"
}
```

**Errors:**
- `404` if `map_id` not found

### `PUT /api/maps/{map_id}`

Updates map metadata (name only for MVP).

**Request body:**
```json
{
  "name": "Updated Map Name"
}
```

**Response `200`:** Updated `MapDetail`

**Errors:**
- `404` if not found

### `DELETE /api/maps/{map_id}`

Deletes the map and **all associated nodes and categories**.

**Response `204`:** No content

**Errors:**
- `404` if not found

---

## Router: Nodes

**File:** `app/routers/nodes.py`

### `GET /api/maps/{map_id}/nodes`

Returns all nodes in a map.

**Response `200`:** `List[NodeDetail]`
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "map_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "el libro",
    "definition": "book",
    "category_id": "770e8400-e29b-41d4-a716-446655440002",
    "created_at": "2026-08-01T12:00:00Z",
    "updated_at": "2026-08-01T12:00:00Z"
  }
]
```

### `POST /api/maps/{map_id}/nodes`

Creates a new node in the map.

**Request body:**
```json
{
  "name": "el libro",
  "definition": "book",
  "category_id": null
}
```

**Validation:**
- `name`: required, string, 1–200 characters, trimmed
- `definition`: optional, string, 0–500 characters, trimmed
- `category_id`: optional, UUID or null — if provided, must reference an
  existing category in this map

**Response `201`:** `NodeDetail` with generated UUID

**Errors:**
- `404` if map not found
- `422` if category_id references a non-existent category

### `GET /api/maps/{map_id}/nodes/{node_id}`

Returns a single node.

**Response `200`:** `NodeDetail`

**Errors:**
- `404` if node or map not found

### `PUT /api/maps/{map_id}/nodes/{node_id}`

Updates a node. Partial update — only provided fields are changed.

**Request body:**
```json
{
  "name": "el libro grande",
  "category_id": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response `200`:** Updated `NodeDetail`

**Errors:**
- `404` if not found
- `422` if category_id references a non-existent category

### `DELETE /api/maps/{map_id}/nodes/{node_id}`

Deletes a node.

**Response `204`:** No content

**Errors:**
- `404` if not found

---

## Router: Categories

**File:** `app/routers/categories.py`

### `GET /api/maps/{map_id}/categories`

Returns all categories in a map.

**Response `200`:** `List[CategoryDetail]`
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "map_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "nouns",
    "node_count": 22,
    "created_at": "2026-08-01T12:00:00Z",
    "updated_at": "2026-08-01T12:00:00Z"
  }
]
```

### `POST /api/maps/{map_id}/categories`

Creates a new category.

**Request body:**
```json
{
  "name": "nouns"
}
```

**Validation:**
- `name`: required, string, 1–50 characters, trimmed

**Response `201`:** `CategoryDetail`

### `PUT /api/maps/{map_id}/categories/{cat_id}`

Renames a category.

**Request body:**
```json
{
  "name": "noun phrases"
}
```

**Response `200`:** Updated `CategoryDetail`

**Errors:**
- `404` if not found

### `DELETE /api/maps/{map_id}/categories/{cat_id}`

Deletes a category. Nodes assigned to this category are **not** deleted — their
`category_id` is set to `null`.

**Response `204`:** No content

**Errors:**
- `404` if not found

---

## Service Layer

### Map Service (`app/services/map_service.py`)

```python
def get_all_maps() -> list[MapSummary]
def get_map(map_id: str) -> MapDetail          # Includes nodes + categories
def create_map(name: str) -> MapDetail
def update_map(map_id: str, name: str) -> MapDetail
def delete_map(map_id: str) -> None             # Cascades to nodes + categories
```

### Node Service (`app/services/node_service.py`)

```python
def get_nodes(map_id: str) -> list[NodeDetail]
def get_node(map_id: str, node_id: str) -> NodeDetail
def create_node(map_id: str, data: NodeCreate) -> NodeDetail
def update_node(map_id: str, node_id: str, data: NodeUpdate) -> NodeDetail
def delete_node(map_id: str, node_id: str) -> None
```

### Category Service (`app/services/category_service.py`)

```python
def get_categories(map_id: str) -> list[CategoryDetail]
def create_category(map_id: str, name: str) -> CategoryDetail
def update_category(map_id: str, cat_id: str, name: str) -> CategoryDetail
def delete_category(map_id: str, cat_id: str) -> None  # Sets nodes' category_id to null
```

---

## Database Setup

**File:** `app/database.py`

```python
from tinydb import TinyDB
from app.serializers import UUIDSerializer
from app.models.middleware import PydanticMiddleware

DB_PATH = "data/db.json"

def get_db() -> TinyDB:
    db = TinyDB(DB_PATH, storage=UUIDSerializer)
    db.middleware(PydanticMiddleware)
    return db
```

**Tables (TinyDB tables):**
| Table name | Contents |
|-----------|----------|
| `maps` | Map documents |
| `nodes` | Node documents |
| `categories` | Category documents |

---

## Error Handling

All routers use FastAPI's `HTTPException` for error responses.

Common exceptions:
- `HTTPException(404, "Map not found")`
- `HTTPException(404, "Node not found")`
- `HTTPException(404, "Category not found")`
- `HTTPException(422, "Category does not exist")`

A global exception handler in `main.py` catches unhandled exceptions, logs the
traceback, and returns a generic `500` response.

---

## Serving

Run during development:
```bash
cd apps/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with auto-generated docs
at `http://localhost:8000/docs`.