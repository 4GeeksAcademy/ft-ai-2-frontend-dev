# Data Model Spec

## Overview

Three document collections (TinyDB tables): `maps`, `nodes`, and `categories`.
All documents use UUIDv4 strings as their primary identifier (`eid`).

---

## Pydantic Models

### Map

```python
# app/models/map.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class MapCreate(BaseModel):
    """Request model for creating a map."""
    name: str = Field(..., min_length=1, max_length=100)

class MapUpdate(BaseModel):
    """Request model for updating a map. Partial — all fields optional."""
    name: str = Field(..., min_length=1, max_length=100)

class MapSummary(BaseModel):
    """Summary returned in the map list."""
    id: UUID
    name: str
    node_count: int = 0
    category_count: int = 0
    created_at: datetime
    updated_at: datetime

class MapDetail(BaseModel):
    """Full map detail returned when viewing a single map."""
    id: UUID
    name: str
    nodes: list["NodeDetail"] = []
    categories: list["CategoryDetail"] = []
    created_at: datetime
    updated_at: datetime
```

**TinyDB document:**
```json
{
  "eid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Spanish Vocabulary",
  "created_at": "2026-08-01T12:00:00.000Z",
  "updated_at": "2026-08-05T15:30:00.000Z"
}
```

---

### Node

```python
# app/models/node.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class NodeCreate(BaseModel):
    """Request model for creating a node."""
    name: str = Field(..., min_length=1, max_length=200)
    definition: Optional[str] = Field(None, max_length=500)
    category_id: Optional[UUID] = None

class NodeUpdate(BaseModel):
    """Request model for updating a node. All fields optional for partial update."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    definition: Optional[str] = Field(None, max_length=500)
    category_id: Optional[UUID] = None  # Explicit null removes category

class NodeDetail(BaseModel):
    """Full node detail returned to the client."""
    id: UUID
    map_id: UUID
    name: str
    definition: Optional[str] = None
    category_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
```

**TinyDB document:**
```json
{
  "eid": "660e8400-e29b-41d4-a716-446655440001",
  "map_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "el libro",
  "definition": "book",
  "category_id": "770e8400-e29b-41d4-a716-446655440002",
  "created_at": "2026-08-01T12:00:00.000Z",
  "updated_at": "2026-08-01T12:00:00.000Z"
}
```

---

### Category

```python
# app/models/category.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class CategoryCreate(BaseModel):
    """Request model for creating a category."""
    name: str = Field(..., min_length=1, max_length=50)

class CategoryUpdate(BaseModel):
    """Request model for updating a category."""
    name: str = Field(..., min_length=1, max_length=50)

class CategoryDetail(BaseModel):
    """Category detail returned to the client."""
    id: UUID
    map_id: UUID
    name: str
    node_count: int = 0
    created_at: datetime
    updated_at: datetime
```

**TinyDB document:**
```json
{
  "eid": "770e8400-e29b-41d4-a716-446655440003",
  "map_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "nouns",
  "created_at": "2026-08-01T12:00:00.000Z",
  "updated_at": "2026-08-01T12:00:00.000Z"
}
```

---

## Frontend Types

```typescript
// apps/frontend/src/lib/types.ts

export interface MapSummary {
  id: string
  name: string
  node_count: number
  category_count: number
  created_at: string  // ISO 8601
  updated_at: string  // ISO 8601
}

export interface MapDetail extends MapSummary {
  nodes: NodeDetail[]
  categories: CategoryDetail[]
}

export interface NodeDetail {
  id: string
  map_id: string
  name: string
  definition: string | null
  category_id: string | null
  created_at: string
  updated_at: string
}

export interface CategoryDetail {
  id: string
  map_id: string
  name: string
  node_count: number
  created_at: string
  updated_at: string
}

// Reagraph expects this shape — uses native `cluster` field for category grouping
export interface GraphNode {
  id: string
  label: string
  cluster?: string           // Category name — drives reagraph clustering
  fill?: string              // Color assigned from category palette
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
}
```

**Notes:**
- Since MVP has no edges/relationships between nodes, `GraphEdge` exists as a
  type placeholder. The graph will show unclustered nodes plus category clusters.
- Category colors are assigned client-side from a predefined palette and
  stored in component state, not on the backend.
- The `cluster` field maps directly to reagraph's `clusterAttribute` prop.
  Set `clusterAttribute="cluster"` on `<GraphCanvas>` to enable clustering.
  Nodes without a category leave `cluster` undefined — these nodes float freely
  in the force layout outside any cluster.
- When a node's category changes, the cluster assignment updates live. Reagraph
  smoothly animates the node to its new cluster's position on the canvas.

---

## Field Reference

### Map

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | UUID | auto | Generated on create |
| `name` | string | yes | 1–100 characters |
| `created_at` | datetime | auto | Set on create, never modified |
| `updated_at` | datetime | auto | Updated on every write |

### Node

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | UUID | auto | Generated on create |
| `map_id` | UUID | auto | Set to parent map on create |
| `name` | string | yes | 1–200 characters |
| `definition` | string | no | 0–500 characters, nullable |
| `category_id` | UUID | no | Must reference existing category, nullable |
| `created_at` | datetime | auto | Set on create, never modified |
| `updated_at` | datetime | auto | Updated on every write |

### Category

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | UUID | auto | Generated on create |
| `map_id` | UUID | auto | Set to parent map on create |
| `name` | string | yes | 1–50 characters |
| `created_at` | datetime | auto | Set on create, never modified |
| `updated_at` | datetime | auto | Updated on every write |

---

## Relationships

```
Map (1) ──── has many ──── (N) Node
Map (1) ──── has many ──── (N) Category
Node (N) ─── belongs to ─── (1) Category  (optional)
```

**Cascade rules:**
- Deleting a map deletes all its nodes and categories.
- Deleting a category sets `category_id = null` on all affected nodes (not
  cascade delete — the nodes survive).
- Nodes have no relationship to each other in MVP (no edges).

---

## Indexes

TinyDB does not have traditional indexes. Query performance is achieved by
scoping queries:

- Nodes are always queried by `map_id` — no operation searches all nodes
  across all maps.
- Categories are always queried by `map_id`.
- The `maps` table is small by nature (human-scale, tens to low hundreds of
  maps), so sequential scan is acceptable.

For future optimization, a `by_map_id` helper can be added:

```python
def _by_map(table: Table, map_id: str) -> list:
    """Helper: query a table by map_id."""
    Query = Query()
    return table.search(Query().map_id == map_id)
```